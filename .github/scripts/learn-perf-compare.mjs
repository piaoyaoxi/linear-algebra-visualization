import assert from "node:assert/strict";
import { chromium } from "playwright";

/* Same-commit source vs bundled preview: synthetic mobile 4G (not real iPhone). */
const browser = await chromium.launch();
const settings = { offline: false, latency: 120, downloadThroughput: 500 * 1024, uploadThroughput: 128 * 1024, connectionType: "cellular4g" };
async function run(port, route, target) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
  const page = await context.newPage();
  const errors = [];
  let requests = 0;
  page.on("request", () => requests++);
  page.on("pageerror", (error) => errors.push(error.message));
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", settings);
  await cdp.send("Emulation.setCPUThrottlingRate", {rate: 3});
  const t0 = Date.now();
  await page.goto("http://127.0.0.1:" + port + "/learn.html#" + route, {waitUntil: "domcontentloaded", timeout: 90000});
  await page.locator(target).first().waitFor({state: route === "guide" ? "attached" : "visible", timeout: 45000});
  const readyMs = Date.now() - t0;
  await page.waitForTimeout(400);
  assert.deepEqual(errors, [], route + " errors: " + errors.join("; "));
  const out = {readyMs, requests};
  await context.close();
  return out;
}
try {
  for (const [route, target] of [
    ["guide", "#chapterNav .chapter-group"],
    ["ch6/basis-coordinates", ".ch6l-lab"],
  ]) {
    const raw = await run(4174, route, target);
    const bundled = await run(4173, route, target);
    console.log(JSON.stringify({route, raw, bundled, note: "synthetic mobile 4G + 3x CPU; readiness includes chapter mount"}));
    assert.ok(raw.requests > 140, "raw source should cause many asset requests");
    assert.ok(bundled.requests < 25, "bundled page should have low request overhead");
  }
} finally {
  await browser.close();
}
