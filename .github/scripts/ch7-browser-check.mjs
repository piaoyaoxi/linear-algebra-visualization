import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

// Browser gate for Chapter 7: every lesson renders without errors; every lab
// draws a real canvas, keeps its conclusion behind a prediction and responds
// to its controls; the page never scrolls sideways.
const base = process.env.CH7_BASE_URL || "http://127.0.0.1:4173/learn.html";
const routes = [
  "linear-map-definition",
  "linear-map-operations",
  "matrix-of-linear-map",
  "eigenvalues-eigenvectors",
  "diagonal-matrices",
  "image-and-kernel",
  "invariant-subspaces",
  "jordan-form-introduction",
  "minimal-polynomial",
];
const evidence = "test-results/ch7-browser-evidence";
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ headless: true });
const forbidden = ["正在开发", "占位", "即将制作", "待完善", "待补充", "原型"];

async function check(viewport, dark) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("Failed to load resource")) errors.push(`console: ${m.text()}`);
  });
  for (const route of routes) {
    await page.goto(`${base}#ch7/${route}`, { waitUntil: "networkidle" });
    if (dark) await page.evaluate(() => document.body.classList.add("dark"));
    await page.waitForTimeout(300);
    assert.equal(await page.locator("h1").count(), 1, `${route}: title`);
    assert.equal(await page.locator(".katex-error").count(), 0, `${route}: KaTeX error`);
    assert.equal(await page.locator("[data-example-challenge]").count(), 1, `${route}: example`);
    assert.equal(await page.locator(".self-test-list").count(), 1, `${route}: self test`);
    const body = await page.locator("main").innerText();
    for (const phrase of forbidden) assert.ok(!body.includes(phrase), `${route}: forbidden phrase ${phrase}`);
    assert.ok(!/不是[^。；\n]{0,30}而是/.test(body), `${route}: avoid the 不是……而是 pattern`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 1, `${route}: horizontal overflow ${overflow}px`);

    const lab = page.locator(".ch7l-lab").first();
    if (await lab.count()) {
      const canvases = await lab.evaluate((el) => [...el.querySelectorAll("canvas")].map((c) => [c.getBoundingClientRect().width, c.getBoundingClientRect().height]));
      assert.ok(canvases.length && canvases.every(([w, h]) => w >= 200 && h >= 200), `${route}: canvas ${JSON.stringify(canvases)}`);
      const option = lab.locator(".ch7l-predict-options [data-i]").first();
      if (await option.count()) {
        await option.click();
        assert.ok(await lab.locator(".ch7l-predict-feedback").first().isVisible(), `${route}: prediction feedback`);
      }
      const chips = lab.locator(".ch7l-chip");
      if ((await chips.count()) > 1) {
        const before = await lab.innerText();
        await chips.nth(1).click();
        await page.waitForTimeout(250);
        assert.notEqual(await lab.innerText(), before, `${route}: chip did not change the lab`);
      }
    }
    if (viewport.width === 1440 && !dark) await page.locator("main").screenshot({ path: `${evidence}/${route}.png` });
  }
  assert.deepEqual(errors, [], `${viewport.width}px${dark ? " dark" : ""}: ${errors.join("\n")}`);
  await context.close();
  console.log(`PASS ${viewport.width}px${dark ? " dark" : ""}`);
}

try {
  await check({ width: 1440, height: 1000 }, false);
  await check({ width: 1440, height: 1000 }, true);
  await check({ width: 768, height: 1000 }, false);
  await check({ width: 390, height: 844 }, false);
} finally {
  await browser.close();
}
