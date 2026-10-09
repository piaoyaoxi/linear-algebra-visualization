// WebKit (the engine of Safari and of every browser on iOS) at phone widths: elements wider than
// their parent box or the screen, per section: initially, after picking every prediction, and
// after clicking a few lab buttons. Needs `npx playwright install webkit`.
// Usage: SITE_BASE=http://127.0.0.1:PORT/learn.html [ONLY=regex] [WIDTHS=375,390] [MAX=6] node webkit-overflow-scan.mjs
const pw = await import(process.env.PW || "playwright");
const base = process.env.SITE_BASE || "http://127.0.0.1:4173/learn.html";
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const widths = (process.env.WIDTHS || "375,390").split(",").map(Number);
const MAX = Number(process.env.MAX || 6);
const b = await pw.webkit.launch();
const probe = () => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  const scrolls = (e) => { for (let x = e.parentElement; x && x !== document.body; x = x.parentElement) { const s = getComputedStyle(x); if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return true; } return false; };
  for (const el of document.querySelectorAll("main *")) {
    if (el.closest(".katex, svg, la-sp, [hidden]")) continue;
    const s = getComputedStyle(el);
    if (s.position === "absolute" || s.position === "fixed" || s.display === "inline" || s.display === "none" || s.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    let pe = el.parentElement;
    while (pe && pe !== document.body && /^(contents|inline)$/.test(getComputedStyle(pe).display)) pe = pe.parentElement;
    const pr = pe.getBoundingClientRect();
    const limit = Math.min(vw, pr.right);
    if (r.right > limit + 1.5 && !scrolls(el)) out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 2).join(".")} +${(r.right - limit).toFixed(0)}px in ${pe.tagName.toLowerCase()}.${String(pe.className).split(" ")[0]}`);
  }
  return out;
};
const results = [];
for (const width of widths) {
  const ctx = await b.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: pw.devices["iPhone 14"].userAgent });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => results.push(`${width} pageerror ${e.message}`));
  await p.goto(`${base}#ch1`, { waitUntil: "networkidle" });
  const routes = await p.evaluate(() => { const r = []; for (let i = 1; i <= 10; i++) { const c = getChapterById(`ch${i}`); for (const s of getStructuredSections(c)) r.push(`${c.id}/${s.id}`); } return r; });
  for (const route of routes) {
    if (only && !only.test(route)) continue;
    await p.goto(`${base}#${route}`, { waitUntil: "networkidle" }); await p.waitForTimeout(1300);
    const seen = new Set();
    const rec = async (stage) => { for (const x of await p.evaluate(probe)) { if (seen.has(x)) continue; seen.add(x); results.push(`${width}\t${route}\t${stage}\t${x}`); } };
    await rec("initial");
    const gates = p.locator("main [class$='-predict-options']");
    for (let g = 0; g < await gates.count(); g++) { const o = gates.nth(g).locator("> button[data-i]").first(); if (await o.isVisible().catch(() => false)) await o.click({ timeout: 800 }).catch(() => {}); }
    await p.waitForTimeout(400); await rec("picked");
    const buttons = p.locator("main [id$='-interactive'] button:not([disabled])");
    const n = Math.min(await buttons.count(), 40); let clicked = 0;
    for (let i = 0; i < n && clicked < MAX; i++) {
      const btn = buttons.nth(i);
      if (!(await btn.isVisible().catch(() => false))) continue;
      if (await btn.evaluate((e) => Boolean(e.closest("[class$='-predict-options']"))).catch(() => true)) continue;
      await btn.click({ timeout: 800 }).catch(() => {}); clicked++; await p.waitForTimeout(450); await rec(`click${clicked}`);
    }
  }
  await ctx.close();
}
await b.close();
console.log("overflows:", results.length);
results.forEach((x) => console.log(x));
