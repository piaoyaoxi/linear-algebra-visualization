// Formula contrast after interaction (companion to contrast-scan.mjs, which checks the first two
// states only): per section and theme, pick the first option of every prediction, then click up to
// MAX visible enabled buttons of the lesson, measuring every visible formula after each click.
// Usage: SITE_BASE=http://127.0.0.1:PORT/learn.html [ONLY=regex] [MAX=14] node contrast-scan-deep.mjs
const { chromium } = await import(process.env.PW || "playwright");
const base = process.env.SITE_BASE || "http://127.0.0.1:4173/learn.html";
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const MAX = Number(process.env.MAX || 14);
const b = await chromium.launch();
const out = [];
const measure = () => {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return [0, 0, 0, 0]; const v = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; };
  const lum = ([r, g, bb]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bb); };
  const bgOf = (el) => { const layers = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c[3] > 0) { layers.push(c); if (c[3] >= 1) break; } } let acc = [255, 255, 255]; for (const c of layers.reverse()) acc = acc.map((x, i) => x * (1 - c[3]) + c[i] * c[3]); return acc; };
  const opacityOf = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity); return o; };
  const res = [];
  for (const t of document.querySelectorAll("main .tex")) {
    const k = t.querySelector(".katex"); if (!k) continue; const rect = t.getBoundingClientRect(); if (!rect.width || getComputedStyle(t).visibility === "hidden") continue;
    if (t.closest("[hidden]")) continue;
    const btn = t.closest("button, [role=button]"); if (btn && btn.disabled) continue;
    const fg = parse(getComputedStyle(k).color); const bg = bgOf(t); const op = opacityOf(t);
    const fgc = fg.slice(0, 3).map((x, i) => x * fg[3] * op + bg[i] * (1 - fg[3] * op));
    const L1 = lum(fgc), L2 = lum(bg); const cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    if (cr < 4.5) { const host = t.closest("button,[role=button],td,th,[class]"); res.push({ tex: (t.dataset.tex || k.textContent).slice(0, 28), cr: +cr.toFixed(2), in: `${host?.tagName.toLowerCase()}.${(host?.className || "").toString().split(" ").slice(0, 3).join(".")}`, fg: fgc.map(Math.round).join(","), bg: bg.map(Math.round).join(",") }); }
  }
  return res;
};
for (const theme of ["light", "dark"]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  await ctx.addInitScript((t) => localStorage.setItem("la-visual-theme", t), theme);
  const p = await ctx.newPage();
  p.on("dialog", (d) => d.dismiss());
  await p.goto(`${base}#ch1`, { waitUntil: "networkidle" });
  const routes = await p.evaluate(() => { const r = []; for (let i = 1; i <= 10; i++) { const c = getChapterById(`ch${i}`); for (const s of getStructuredSections(c)) r.push(`${c.id}/${s.id}`); } return r; });
  for (const route of routes) {
    if (only && !only.test(route)) continue;
    await p.goto(`${base}#${route}`, { waitUntil: "networkidle" }); await p.waitForTimeout(1200);
    const record = async (stage) => (await p.evaluate(measure)).forEach((x) => out.push({ theme, route, stage, ...x }));
    // every prediction gets its first option
    const gates = p.locator("main [class$='-predict-options']");
    for (let g = 0; g < await gates.count(); g++) { const o = gates.nth(g).locator("> button[data-i]").first(); if (await o.isVisible().catch(() => false)) await o.click({ timeout: 800 }).catch(() => {}); }
    await p.waitForTimeout(200);
    await record("picked");
    const buttons = p.locator("main .lesson-page-section button:not([disabled]), main [id$='-interactive'] button:not([disabled])");
    const n = Math.min(await buttons.count(), 60);
    let clicked = 0;
    for (let i = 0; i < n && clicked < MAX; i++) {
      const btn = buttons.nth(i);
      if (!(await btn.isVisible().catch(() => false))) continue;
      const inGate = await btn.evaluate((e) => Boolean(e.closest("[class$='-predict-options']"))).catch(() => true);
      if (inGate) continue;
      await btn.click({ timeout: 800 }).catch(() => {});
      clicked++;
      await p.waitForTimeout(350);
      await record(`click${clicked}`);
    }
  }
  await ctx.close();
}
await b.close();
const seen = new Set();
const uniq = out.filter((x) => { const k = `${x.theme}|${x.route}|${x.tex}|${x.in}|${x.cr}`; if (seen.has(k)) return false; seen.add(k); return true; });
console.log("low-contrast formulas:", uniq.length);
uniq.forEach((x) => console.log(`${x.theme}\t${x.route}\t${x.stage}\t${x.cr}\t${x.tex}\t[${x.in}]\tfg ${x.fg} bg ${x.bg}`));
