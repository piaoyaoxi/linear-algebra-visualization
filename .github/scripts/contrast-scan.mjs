// Formula contrast: for every visible formula in <main>, its colour against the background it
// actually sits on (first opaque ancestor background, alpha-composited), in light and dark,
// before and after picking a prediction (which enables primary buttons). Flags < 4.5:1.
// Usage: SITE_BASE=http://127.0.0.1:PORT/learn.html [ONLY=regex] [WAIT=ms] node contrast-scan.mjs
// Run from the repo root after npm i --no-save playwright (or set PW to its index.mjs path).
const { chromium } = await import(process.env.PW || "playwright");
const base = process.env.SITE_BASE || "http://127.0.0.1:4173/learn.html";
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const wait = Number(process.env.WAIT || 1500); // shorter waits catch content still fading in
const b = await chromium.launch();
const out = [];
for (const theme of ["light", "dark"]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript((t) => localStorage.setItem("la-visual-theme", t), theme);
  const p = await ctx.newPage();
  await p.goto(`${base}#ch1`, { waitUntil: "networkidle" });
  const routes = await p.evaluate(() => { const r = []; for (let i = 1; i <= 10; i++) { const c = getChapterById(`ch${i}`); for (const s of getStructuredSections(c)) r.push(`${c.id}/${s.id}`); } return r; });
  for (const route of routes) {
    if (only && !only.test(route)) continue;
    await p.goto(`${base}#${route}`, { waitUntil: "networkidle" }); await p.waitForTimeout(wait);
    for (const stage of ["initial", "picked"]) {
      if (stage === "picked") {
        const opts = p.locator("main [class$='-predict-options'] > button[data-i]");
        const n = await opts.count();
        for (let i = 0; i < n; i++) { const o = opts.nth(i); if (await o.isVisible()) { await o.click({ timeout: 800 }).catch(() => {}); } }
        await p.waitForTimeout(300);
      }
      const r = await p.evaluate(() => {
        const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return [0, 0, 0, 0]; const v = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; };
        const lum = ([r, g, bb]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bb); };
        const bgOf = (el) => { const layers = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c[3] > 0) { layers.push(c); if (c[3] >= 1) break; } } let acc = [255, 255, 255]; for (const c of layers.reverse()) acc = acc.map((x, i) => x * (1 - c[3]) + c[i] * c[3]); return acc; };
        const opacityOf = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity); return o; };
        const res = [];
        for (const t of document.querySelectorAll("main .tex")) {
          const k = t.querySelector(".katex"); if (!k) continue; const rect = t.getBoundingClientRect(); if (!rect.width || getComputedStyle(t).visibility === "hidden") continue;
          const fg = parse(getComputedStyle(k).color); const bg = bgOf(t); const op = opacityOf(t);
          const fgc = fg.slice(0, 3).map((x, i) => x * fg[3] * op + bg[i] * (1 - fg[3] * op));
          const L1 = lum(fgc), L2 = lum(bg); const cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
          const btn = t.closest("button, [role=button]");
          if (cr < 4.5 && !(btn && btn.disabled)) res.push({ tex: t.dataset.tex?.slice(0, 30), cr: +cr.toFixed(2), in: (t.closest("button,[role=button],[class]")?.className || "").toString().slice(0, 40) });
        }
        return res;
      });
      r.forEach((x) => out.push({ theme, route, stage, ...x }));
    }
  }
  await ctx.close();
}
await b.close();
const seen = new Set();
const uniq = out.filter((x) => { const k = `${x.theme}|${x.route}|${x.tex}|${x.in}`; if (seen.has(k)) return false; seen.add(k); return true; });
console.log("low-contrast formulas:", uniq.length);
uniq.slice(0, 60).forEach((x) => console.log(`${x.theme}\t${x.route}\t${x.stage}\t${x.cr}\t${x.tex}\t[${x.in}]`));
