import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

// Browser gate for Chapter 9: every lab must render, accept a prediction,
// respond to clicks and drags, and keep its conclusion hidden until answered
// (§3, §5, §6, §7: until the student has predicted and then acted once).
const base = process.env.CH9_BASE || "http://127.0.0.1:4173/learn.html";
const shots = "/tmp/ch9-browser-screenshots";
fs.mkdirSync(shots, { recursive: true });

const labKinds = {
  "inner-product-geometry": "inner-product",
  "orthonormal-bases": "gram-schmidt",
  "euclidean-isomorphism": "isometry",
  "orthogonal-transformations": "orthogonal-transform",
  "orthogonal-subspaces": "orthogonal-complement",
  "symmetric-canonical-form": "spectral",
  "least-squares-distance": "least-squares",
  "unitary-spaces": null,
};
const sections = Object.keys(labKinds);

function collectErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

async function text(page, selector) {
  return (await page.locator(selector).first().innerText()).replace(/\s+/g, " ");
}

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow <= 1, `${label}: horizontal overflow ${overflow}px`);
}

async function openLesson(page, id, screenshotName = "") {
  await page.goto(`${base}#ch9/${id}`, { waitUntil: "networkidle" });
  await page.locator(".lesson-cover").waitFor({ state: "visible", timeout: 6000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(300);
  const kind = await page.locator("[data-ch9-lab]").first().getAttribute("data-lab-kind").catch(() => null);
  if (labKinds[id]) {
    expect(kind === labKinds[id], `${id}: expected lab ${labKinds[id]}, got ${kind}`);
    const canvases = await page.evaluate(() =>
      [...document.querySelectorAll("[data-ch9-lab] canvas")].map((c) => ({ w: c.getBoundingClientRect().width, h: c.getBoundingClientRect().height })),
    );
    expect(canvases.length && canvases.every((c) => c.w >= 240 && c.h >= 240), `${id}: invalid canvas ${JSON.stringify(canvases)}`);
    expect(!(await page.locator("[data-ch9-result]").isVisible()), `${id}: conclusion visible before prediction`);
  } else {
    expect((await page.locator("[data-ch9-lab]").count()) === 0, `${id}: unexpected lab`);
  }
  expect((await page.locator(".katex-error").count()) === 0, `${id}: KaTeX error`);
  const body = await page.locator("main").innerText();
  for (const phrase of ["正在开发", "占位", "即将制作", "待完善", "待补充", "原型"]) {
    expect(!body.includes(phrase), `${id}: forbidden phrase ${phrase}`);
  }
  expect(!/不是[^。；\n]{0,30}而是/.test(body), `${id}: avoid the 不是……而是 pattern`);
  await assertNoOverflow(page, id);
  if (screenshotName) await page.locator("main.content").screenshot({ path: path.join(shots, `${screenshotName}-${id}.png`) });
}

async function screenOf(page, view, world) {
  return page.evaluate(
    ([view, world]) => {
      const v = document.querySelector("[data-ch9-lab]").ch9Views[view];
      v.canvas.scrollIntoView({ block: "center" });
      const q = v.toScreen ? v.toScreen(world) : v.project(world);
      const r = v.canvas.getBoundingClientRect();
      return { x: r.left + q.x, y: r.top + q.y };
    },
    [view, world],
  );
}

async function drag(page, view, from, to) {
  await screenOf(page, view, from);
  await page.waitForTimeout(150);
  const a = await screenOf(page, view, from);
  const b = await screenOf(page, view, to);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i += 1) await page.mouse.move(a.x + ((b.x - a.x) * i) / 8, a.y + ((b.y - a.y) * i) / 8);
  await page.mouse.up();
  await page.waitForTimeout(80);
}

const predict = (page, i) => page.locator(`[data-ch9-predict] [data-i="${i}"]`).click();
const chip = (page, key) => page.locator(`.ch9l-toolbar [data-key="${key}"]`).click();
const resultShown = (page) => page.locator("[data-ch9-result]").isVisible();

async function exerciseLabs(page) {
  await openLesson(page, sections[0]);
  expect((await text(page, "[data-ip-value]")).includes("−3"), "§1: (u,v) should be −3");
  await drag(page, "plane", [1, -1], [2, -0.5]);
  expect((await text(page, "[data-ip-status]")).includes("正交"), "§1: dragging v to (2,−1/2) should give orthogonality");
  await predict(page, 1);
  expect(await resultShown(page), "§1: conclusion after prediction");
  await chip(page, "bad");
  expect((await text(page, "[data-ip-status]")).includes("不正定"), "§1: indefinite G flagged");

  await openLesson(page, sections[1]);
  await page.locator("[data-gs-next]").click();
  await page.locator("[data-gs-next]").click();
  expect(await page.locator("[data-gs-next]").isDisabled(), "§2: step 3 locked before prediction");
  await predict(page, 0);
  await page.locator("[data-gs-next]").click();
  expect((await text(page, "[data-gs-status]")).includes("垂直于整个平面"), "§2: β₃ orthogonal to plane");
  const before = await text(page, "[data-gs-beta3]");
  await drag(page, "scene", [0, 1, 1], [1.5, 1, 1]);
  expect((await text(page, "[data-gs-beta3]")) !== before, "§2: dragging α₃ updates β₃");
  await chip(page, "dependent");
  expect((await text(page, "[data-gs-status]")).includes("没有新方向"), "§2: dependent input stops");
  expect(await page.locator("[data-gs-next]").isDisabled(), "§2: normalisation disabled for zero residual");

  await openLesson(page, sections[2]);
  expect((await text(page, "[data-iso-status]")).includes("B ≠ I"), "§3: standard basis is not isometric");
  await chip(page, "other");
  expect((await text(page, "[data-iso-status]")).includes("B = I"), "§3: G-orthonormal basis is isometric");
  await drag(page, "lp", [-0.8, 1.4], [-1, 2]);
  expect((await text(page, "[data-iso-status]")).includes("B ≠ I"), "§3: dragging f₂ breaks the isometry");
  await predict(page, 0);
  expect(!(await resultShown(page)), "§3: conclusion waits for an action after the prediction");
  expect((await page.locator("[data-iso-tangent]").count()) === 0, "§3: tangent mark hidden before acting");
  await chip(page, "other");
  expect(await resultShown(page), "§3: conclusion after prediction and action");
  expect((await text(page, "[data-iso-tangent]")).includes("平行于椭圆"), "§3: f₂ parallel to the tangent at f₁");
  await chip(page, "dotperp");
  expect((await text(page, "[data-iso-tangent]")).includes("偏离切线"), "§3: (1,1),(1,−1) is not G-orthogonal");

  await openLesson(page, sections[3]);
  expect((await text(page, "[data-ortho-status]")).includes("第一类"), "§4: rotation is first kind");
  await chip(page, "refl");
  expect((await text(page, "[data-ortho-status]")).includes("第二类"), "§4: reflection is second kind");
  await chip(page, "squeeze");
  expect((await text(page, "[data-ortho-status]")).includes("不是正交变换"), "§4: diag(2,1/2) rejected");
  await drag(page, "plane", [1.5, 0.5], [1, 0]);
  expect((await text(page, "[data-ch9-readout=ortho]")).includes("≠"), "§4: squeeze changes a length");
  await predict(page, 0);
  expect(!(await resultShown(page)), "§4: conclusion waits for an action after the prediction");
  await chip(page, "squeeze");
  expect(await resultShown(page), "§4: conclusion after prediction and action");
  expect((await text(page, "[data-ortho-marks]")).includes("有长度被改变"), "§4: squeeze drops the length ticks");
  await chip(page, "rot");
  expect((await text(page, "[data-ortho-marks]")).includes("长度不变"), "§4: rotation keeps the length ticks");

  await openLesson(page, sections[4]);
  expect((await page.locator("[data-sub-perp]").count()) === 0, "§5: W⊥ hidden before prediction");
  await predict(page, 0);
  expect((await page.locator("[data-sub-perp]").count()) === 0, "§5: W⊥ waits for an action after the prediction");
  await page.locator("[data-sub-reset]").click();
  expect((await page.locator("[data-sub-perp]").count()) === 1, "§5: W⊥ revealed");
  const sub = await text(page, "[data-ch9-readout=sub]");
  await drag(page, "scene", [0.5, -1.5, 2], [1, 1, 1]);
  expect((await text(page, "[data-ch9-readout=sub]")) !== sub, "§5: dragging α updates the decomposition");
  await chip(page, "line");
  expect((await text(page, "[data-sub-perp]")).includes("= 2"), "§5: a line has a 2-dimensional complement");

  await openLesson(page, sections[5]);
  expect(await page.locator("[data-sp-play]").isDisabled(), "§6: animation waits for the prediction");
  expect((await page.locator("[data-sp-status]").count()) === 0, "§6: eigen readout hidden before the prediction");
  await predict(page, 0);
  expect(await resultShown(page), "§6: conclusion after prediction");
  await page.locator("[data-sp-s]").fill("3");
  expect((await text(page, "[data-sp-steps] .is-active")).includes("③"), "§6: slider reaches step 3");
  await chip(page, "nonsym");
  expect((await text(page, "[data-sp-status]")).includes("不正交"), "§6: non-symmetric eigenvectors not orthogonal");
  expect(await page.locator("[data-sp-play]").isDisabled(), "§6: animation closes for a non-symmetric matrix");

  await openLesson(page, sections[6]);
  expect((await page.locator("[data-ls-best]").count()) === 0, "§7: best line hidden before prediction");
  await predict(page, 0);
  expect((await page.locator("[data-ls-best]").count()) === 0, "§7: best line waits for an action after the prediction");
  await page.locator("[data-ls-c]").fill("1");
  expect((await page.locator("[data-ls-best]").count()) === 1, "§7: best line revealed");
  expect((await text(page, "[data-ls-tri]")).includes("直角三角形"), "§7: right triangle b–p–Ax");
  expect((await text(page, "[data-ls-tri]")).replace(/\s/g, "").includes("=8=") && (await text(page, "[data-ls-tri]")).replace(/\s/g, "").includes("6+2"), "§7: 8 = 6 + 2 for C = D = 1");
  await page.locator("[data-ls-c]").fill("2");
  await page.locator("[data-ls-d]").fill("0");
  expect((await text(page, "[data-ch9-readout=ls]")).includes("就是最佳直线"), "§7: C=2, D=0 is optimal");
  await drag(page, "fit", [1, 0], [1, 1.5]);
  expect(!(await text(page, "[data-ch9-readout=ls]")).includes("就是最佳直线"), "§7: dragging a data point moves the optimum");
}

async function runConfiguration(browser, config) {
  const context = await browser.newContext({ viewport: config.viewport, colorScheme: config.scheme, reducedMotion: config.motion });
  if (config.scheme === "dark") await context.addInitScript(() => localStorage.setItem("la-visual-theme", "dark"));
  const page = await context.newPage();
  const errors = collectErrors(page);
  await page.goto(`${base}#ch9`, { waitUntil: "networkidle" });
  expect((await page.locator(".lesson-card-grid .lesson-card").count()) === 8, `${config.name}: overview does not contain eight lessons`);
  await assertNoOverflow(page, `${config.name} overview`);
  for (const id of sections) await openLesson(page, id, config.name);
  await exerciseLabs(page);
  expect(!errors.length, `${config.name}: ${errors.join("\n")}`);
  await context.close();
}

const browser = await chromium.launch();
try {
  for (const config of [
    { name: "desktop-light", viewport: { width: 1440, height: 1000 }, scheme: "light", motion: "no-preference" },
    { name: "desktop-dark", viewport: { width: 1440, height: 1000 }, scheme: "dark", motion: "no-preference" },
    { name: "tablet-light", viewport: { width: 768, height: 1024 }, scheme: "light", motion: "no-preference" },
    { name: "mobile-light", viewport: { width: 390, height: 844 }, scheme: "light", motion: "no-preference" },
    { name: "mobile-dark", viewport: { width: 390, height: 844 }, scheme: "dark", motion: "reduce" },
  ]) {
    await runConfiguration(browser, config);
    console.log(`PASS ${config.name}`);
  }
} catch (error) {
  fs.writeFileSync(path.join(shots, "FAILURE.txt"), `${error?.stack || error}\n`);
  throw error;
} finally {
  await browser.close();
}
