// Performance budget for moving between lessons on a phone (4× slower CPU): the main-thread
// long tasks from the hash change until things are quiet. Before typeset.js read styles in
// batches, one switch held the main thread for 6–11 s, in single tasks of up to 9 s.
//
// Machines differ, so the budgets scale with a calibration: a fixed piece of JavaScript is
// timed under the same throttling and compared with the time it took where the budgets were
// set. SITE_BASE overrides the default local server.
import { chromium } from "playwright";

const base = process.env.SITE_BASE || "http://127.0.0.1:4173/learn.html";
const ROUTES = ["ch2/permutations", "ch3/solvability", "ch5/positive-definite", "ch7/eigenvalues-eigenvectors", "ch8/jordan-derivation", "ch9/orthonormal-bases", "ch1/gcd-polynomials"];
// where the budgets were set these lessons took 1.9–3.4 s in all, single tasks up to 1.7 s
const BUDGET = { longest: 3500, lesson: 7000 };
// the calibration loop took this long there (4× throttling)
const REFERENCE_MS = 650;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.addInitScript(() => {
  window.__long = [];
  new PerformanceObserver((list) => list.getEntries().forEach((e) => window.__long.push([e.startTime, e.duration]))).observe({ type: "longtask", buffered: true });
});
await page.goto(`${base}#guide`, { waitUntil: "load" });
// every chapter's labs and the fonts arrive first: the budget is for the switch itself
await page.waitForTimeout(8000);
const cdp = await context.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

const calibrate = () =>
  page.evaluate(() => {
    const t0 = performance.now();
    let x = 0;
    for (let i = 0; i < 3e6; i += 1) x += Math.sqrt(i) * Math.sin(i);
    window.__calibration = x;
    return performance.now() - t0;
  });
// the fastest of three runs: a stray garbage collection does not count
const runs = [await calibrate(), await calibrate(), await calibrate()];
const scale = Math.min(3, Math.max(1, Math.min(...runs) / REFERENCE_MS));
const budget = { longest: Math.round(BUDGET.longest * scale), lesson: Math.round(BUDGET.lesson * scale) };
console.log(`calibration ${Math.round(Math.min(...runs))} ms (reference ${REFERENCE_MS} ms): budgets × ${scale.toFixed(2)} → longest task ${budget.longest} ms, lesson ${budget.lesson} ms`);

const failures = [];
for (const route of ROUTES) {
  const t0 = await page.evaluate(() => performance.now());
  await page.evaluate((r) => {
    window.location.hash = r;
  }, route);
  await page.waitForTimeout(9000);
  // a task still running at the end of the window: wait for it, then for its long-task entry
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 0)));
  await page.waitForTimeout(600);
  const { total, longest } = await page.evaluate((t0) => {
    const after = window.__long.filter(([start]) => start >= t0);
    return { total: Math.round(after.reduce((sum, [, d]) => sum + d, 0)), longest: Math.round(Math.max(0, ...after.map(([, d]) => d))) };
  }, t0);
  const over = longest > budget.longest || total > budget.lesson;
  console.log(`${over ? "OVER" : "ok  "} ${route.padEnd(30)} ${String(total).padStart(6)} ms in long tasks, longest ${longest} ms`);
  if (over) failures.push(route);
}
await browser.close();
errors.forEach((e) => console.error(`page error: ${e}`));
if (failures.length || errors.length) {
  console.error(`FAIL performance budget: ${failures.join(", ") || "page errors"}`);
  process.exit(1);
}
console.log("PASS performance budget");
