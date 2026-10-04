// Light/dark switch: halfway through, the sidebar, the lab card and the canvas wash must
// be part-way between their two colours together with the page, never stuck at the start
// colour and then snapping at the end. SITE_BASE overrides the default local server.
import { chromium } from "playwright";

const base = process.env.SITE_BASE || "http://127.0.0.1:4173/learn.html";
const routes = ["ch6/intersection-sum", "ch2/determinant-intro"];
const rgb = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
const lum = (s) => { const [r, g, b] = rgb(s); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

const browser = await chromium.launch();
let failed = false;
for (const dark of [false, true]) {
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    if (dark) await page.addInitScript(() => { try { localStorage.setItem("la-visual-theme", "dark"); } catch {} });
    await page.goto(`${base}#${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const sample = () => page.evaluate(() => {
      const bg = (el) => (el ? getComputedStyle(el).backgroundColor : "");
      const canvas = document.querySelector("[id$='-interactive'] canvas");
      return {
        body: bg(document.body),
        sidebar: bg(document.querySelector(".sidebar")),
        lab: bg(document.querySelector("[id$='-interactive'] section, [id$='-interactive'] [class*='-lab']")),
        // the canvas frame paper (--cv-paper); the canvas itself is a translucent wash
        canvas: canvas ? bg(canvas.closest(".la3d, .ch7p, .ch9p") || canvas.parentElement) : "",
      };
    });
    const start = await sample();
    await page.locator("#themeToggle").click();
    await page.waitForTimeout(1100);
    const mid = await sample();
    await page.waitForTimeout(2600);
    const end = await sample();
    for (const key of Object.keys(start)) {
      if (!start[key]) continue;
      const a = lum(start[key]); const m = lum(mid[key]); const z = lum(end[key]);
      if (Math.abs(a - z) < 2) continue; // this part does not change between the themes
      const t = (m - a) / (z - a);
      const ok = t > 0.15 && t < 0.95;
      if (!ok) failed = true;
      console.log(`${ok ? "ok  " : "FAIL"} ${dark ? "dark→light" : "light→dark"} ${route} ${key}: ${start[key]} → ${mid[key]} → ${end[key]} (t=${t.toFixed(2)})`);
    }
    await page.close();
  }
}
await browser.close();
if (failed) {
  console.error("Some parts do not follow the light/dark switch halfway through.");
  process.exit(1);
}
console.log("PASS theme transition");
