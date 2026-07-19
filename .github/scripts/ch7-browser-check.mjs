import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

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
const arrowRoutes = new Set([routes[0], routes[2], routes[3], routes[4], routes[7], routes[8]]);
const evidence = "test-results/ch7-browser-evidence";
await mkdir(evidence, { recursive: true });

const browser = await chromium.launch({ headless: true });

function collectErrors(page, target) {
  page.on("console", (message) => {
    if (message.type() === "error") target.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => target.push(`pageerror: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) target.push(`HTTP ${response.status()}: ${response.url()}`);
  });
}

async function dragRange(page, selector, targetRatio) {
  const range = page.locator(selector);
  assert.equal(await range.count(), 1, `${selector}: range missing`);
  const before = Number(await range.inputValue());
  const min = Number(await range.getAttribute("min"));
  const max = Number(await range.getAttribute("max"));
  const startRatio = (before - min) / (max - min);
  await range.scrollIntoViewIfNeeded();
  const box = await range.boundingBox();
  assert.ok(box, `${selector}: range has no box`);
  await page.mouse.move(box.x + box.width * startRatio, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * targetRatio, box.y + box.height / 2, { steps: 14 });
  await page.mouse.up();
  const after = Number(await range.inputValue());
  assert.notEqual(after, before, `${selector}: continuous drag did not update value`);
  return after;
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await desktop.newPage();
page.setDefaultTimeout(15_000);
const errors = [];
collectErrors(page, errors);

async function gotoLesson(route, { screenshot = false } = {}) {
  await page.goto(`${base}#ch7/${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(180);
  assert.equal(await page.locator("h1").count(), 1, `${route}: lesson title missing`);
  assert.equal(await page.locator(".ch7-formal").count(), 1, `${route}: formal lesson missing`);
  assert.ok((await page.locator(".ch7-concept-list > li").count()) >= 3, `${route}: formal sequence incomplete`);
  assert.equal(await page.locator(".ch7-lab").count(), 1, `${route}: experiment missing`);
  assert.equal(await page.locator(".ch7-lab-head h3").count(), 1, `${route}: experiment question missing`);
  assert.equal(await page.locator(".ch7-lab-task").count(), 1, `${route}: operation instruction missing`);
  assert.equal(await page.locator(".ch7-lab-stage").count(), 1, `${route}: stage missing`);
  assert.equal(await page.locator(".ch7-svg").count(), 1, `${route}: SVG missing`);
  assert.equal(await page.locator(".ch7-conclusion").count(), 1, `${route}: conclusion missing`);
  assert.equal(await page.locator("[data-example-challenge]").count(), 1, `${route}: example missing`);
  assert.equal(await page.locator(".self-test-list").count(), 1, `${route}: self test missing`);
  assert.equal(await page.locator(".katex-error").count(), 0, `${route}: KaTeX error marker`);
  assert.equal(await page.locator(".ch7-story, .ch7-cinema-lab").count(), 0, `${route}: rejected renderer still mounted`);

  const geometry = await page.evaluate(() => {
    const head = document.querySelector(".ch7-lab-head");
    const task = document.querySelector(".ch7-lab-task");
    const toolbar = document.querySelector(".ch7-lab-toolbar");
    const svg = document.querySelector(".ch7-svg");
    const stage = document.querySelector(".ch7-lab-stage");
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      taskTop: task?.getBoundingClientRect().top ?? Infinity,
      toolbarTop: toolbar?.getBoundingClientRect().top ?? Infinity,
      svgWidth: svg?.getBoundingClientRect().width ?? 0,
      stageWidth: stage?.getBoundingClientRect().width ?? 0,
      questionSize: head ? parseFloat(getComputedStyle(head.querySelector("h3")).fontSize) : 0,
    };
  });
  assert.ok(geometry.overflow <= 1, `${route}: desktop overflow ${geometry.overflow}px`);
  assert.ok(geometry.taskTop < geometry.toolbarTop, `${route}: operation must precede controls`);
  assert.ok(geometry.questionSize >= 26, `${route}: experiment question is visually weak`);
  assert.ok(geometry.svgWidth > 700, `${route}: geometry does not dominate desktop stage`);
  assert.ok(Math.abs(geometry.svgWidth - geometry.stageWidth) <= 2, `${route}: SVG does not fill stage`);

  const arrows = await page.locator(".ch7-vector").evaluateAll((items) => items.map((item) => ({
    tag: item.tagName,
    marker: item.getAttribute("marker-end"),
    d: item.getAttribute("d") || "",
  })));
  if (arrowRoutes.has(route)) assert.ok(arrows.length >= 1, `${route}: vector arrows missing`);
  arrows.forEach((arrow) => {
    assert.equal(arrow.tag, "path", `${route}: vector must be one path`);
    assert.equal(arrow.marker, null, `${route}: marker arrow returned`);
    assert.ok(arrow.d.endsWith("Z"), `${route}: stem and head must form one closed path`);
  });
  if (screenshot) await page.screenshot({ path: `${evidence}/desktop-light-${route}.png`, fullPage: true });
}

await page.goto(`${base}#ch7`, { waitUntil: "networkidle" });
assert.equal(await page.locator(".lesson-card").count(), 9, "chapter overview must expose nine lessons");

await gotoLesson(routes[0]);
await page.locator('[data-preset="2"]').click();
await page.locator('[data-test="origin"]').click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /平移把原点送到了别处/);
await page.locator('[data-test="add"]').click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /缺口/);
assert.ok((await page.locator(".ch7-leak").count()) > 0, "§1: counterexample gap missing");
await page.locator('[data-test="scale"]').click();
const s1First = await dragRange(page, '[data-key="alpha"]', 0.78);
const s1Second = await dragRange(page, '[data-key="alpha"]', 0.22);
assert.notEqual(s1Second, s1First, "§1: slider stopped after first drag");

await gotoLesson(routes[1]);
await page.locator('[data-mode="sum"]').click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /两条支路/);
await page.locator('[data-preset="1"]').click();
await page.locator('[data-mode="inverse"]').click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /无法唯一撤销/);
await page.locator('[data-mode="TU"]').click();
await dragRange(page, '[data-key="progress"]', 0.76);

await gotoLesson(routes[2]);
await page.locator('[data-stage="col2"]').click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /第二列/);
await page.locator('[data-stage="rebuild"]').click();
await dragRange(page, '[data-key="alpha"]', 0.2);
await dragRange(page, '[data-key="beta"]', 0.8);
await page.locator('[data-basis="2"]').click();
await page.locator('[data-stage="basis"]').click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /对角矩阵/);

await gotoLesson(routes[3]);
const angle = page.locator('[data-key="angle"]');
const direction = page.locator(".ch7-drag-line");
await direction.scrollIntoViewIfNeeded();
const directionBox = await direction.boundingBox();
assert.ok(directionBox, "§4: SVG direction drag target missing");
const beforeSvg = Number(await angle.inputValue());
await page.mouse.move(directionBox.x + directionBox.width * 0.8, directionBox.y + directionBox.height * 0.2);
await page.mouse.down();
await page.mouse.move(directionBox.x + directionBox.width * 0.56, directionBox.y + directionBox.height * 0.76, { steps: 14 });
await page.mouse.up();
assert.notEqual(Number(await angle.inputValue()), beforeSvg, "§4: SVG direction drag failed");
const angleFirst = await dragRange(page, '[data-key="angle"]', 0.74);
const angleSecond = await dragRange(page, '[data-key="angle"]', 0.3);
assert.notEqual(angleSecond, angleFirst, "§4: second slider drag failed");
await page.locator('[data-preset="3"]').click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /没有特征方向/);

await gotoLesson(routes[4]);
await page.locator('[data-phase="1"]').click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /彼此不混合/);
await page.locator('[data-phase="2"]').click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /得到 Ax/);
await page.locator('[data-preset="2"]').click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /不能建立特征基/);

await gotoLesson(routes[5]);
const fiberTitle = await page.locator(".ch7-conclusion-copy strong").innerText();
await dragRange(page, '[data-key="fiber"]', 0.8);
assert.equal(await page.locator(".ch7-conclusion-copy strong").innerText(), fiberTitle, "§6: kernel motion changed output conclusion");
await page.locator('[data-preset="0"]').click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /没有非零方向被抹去/);
await page.locator('[data-preset="3"]').click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /所有输入都汇聚到原点/);

await gotoLesson(routes[6]);
await dragRange(page, '[data-key="angle"]', 0.78);
assert.equal(await page.locator(".ch7-matrix-column").count(), 1, "§7: only the leakage matrix cell should be highlighted");
await page.locator('[data-mode="whole"]').click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /整个空间 V/);
await page.locator('[data-mode="zero"]').click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /零子空间/);

await gotoLesson(routes[7]);
assert.match(await page.locator(".ch7-conclusion").innerText(), /共同缩放之外还多出一段/);
await page.locator('[data-structure="2"]').click();
await page.locator('[data-mode="N"]').click();
for (let index = 0; index < 3; index += 1) await page.locator("[data-next]").click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /最终归零/);
await page.locator("[data-reset]").click();
await dragRange(page, '[data-key="lambda"]', 0.2);

await gotoLesson(routes[8]);
assert.match(await page.locator(".ch7-conclusion").innerText(), /仍有基方向留下残量/);
await page.locator('[data-candidate="1"]').click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /次数已经最低/);
await page.locator('[data-preset="1"]').click();
await page.locator('[data-candidate="1"]').click();
assert.match(await page.locator(".ch7-conclusion").innerText(), /关系还可以更短/);
assert.equal(await page.locator(".ch7-point").count(), 0, "§9: zero residuals must not be fake points away from origin");

for (const route of routes) {
  await gotoLesson(route, { screenshot: true });
  const correctIndex = await page.evaluate((sectionId) => {
    const chapter = getChapterById("ch7");
    return getStructuredSections(chapter).find((item) => item.id === sectionId).example.choices.findIndex((choice) => choice.correct);
  }, route);
  assert.ok(correctIndex >= 0, `${route}: correct example missing`);
  await page.locator('[data-example-challenge] input[type="radio"]').nth(correctIndex).check();
  await page.locator("[data-example-action]").click();
  assert.equal(await page.locator("[data-example-challenge]").getAttribute("data-state"), "correct", `${route}: example failed`);
}

await page.evaluate(() => localStorage.setItem("la-visual-theme", "dark"));
await page.reload({ waitUntil: "networkidle" });
for (const route of routes) {
  await page.goto(`${base}#ch7/${route}`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("body").evaluate((body) => body.classList.contains("dark")), true, `${route}: dark mode missing`);
  assert.ok((await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 1, `${route}: dark overflow`);
  await page.locator(".ch7-lab").screenshot({ path: `${evidence}/desktop-dark-${route}-lab.png` });
}
assert.deepEqual(errors, []);
await desktop.close();

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", hasTouch: true });
const mobilePage = await mobile.newPage();
const mobileErrors = [];
collectErrors(mobilePage, mobileErrors);
for (const route of routes) {
  await mobilePage.goto(`${base}#ch7/${route}`, { waitUntil: "networkidle" });
  const geometry = await mobilePage.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    stageWidth: document.querySelector(".ch7-lab-stage")?.getBoundingClientRect().width ?? 0,
    svgWidth: document.querySelector(".ch7-svg")?.getBoundingClientRect().width ?? 0,
    nowrapControls: [...document.querySelectorAll(".ch7-choice-row")].filter((row) => row.scrollWidth > row.clientWidth + 1).length,
    transition: getComputedStyle(document.querySelector(".ch7-choice-row button")).transitionDuration,
  }));
  assert.ok(geometry.overflow <= 1, `${route}: mobile overflow ${geometry.overflow}px`);
  assert.equal(geometry.nowrapControls, 0, `${route}: mobile controls are clipped`);
  assert.ok(Math.abs(geometry.svgWidth - geometry.stageWidth) <= 2, `${route}: mobile SVG does not fill stage`);
  assert.equal(geometry.transition, "0s", `${route}: reduced motion not honored`);
  await mobilePage.screenshot({ path: `${evidence}/mobile-reduced-${route}.png`, fullPage: true });
}
assert.deepEqual(mobileErrors, []);
await mobile.close();

const regression = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const regressionPage = await regression.newPage();
await regressionPage.goto(`${base}#ch4/matrix-language`, { waitUntil: "networkidle" });
assert.equal(await regressionPage.locator("#transformCanvas").count(), 1, "Chapter 4 §1 canvas missing");
assert.equal(await regressionPage.locator(".ch7-lab").count(), 0, "Chapter 7 leaked into Chapter 4");
assert.ok((await regressionPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 1);
await regressionPage.screenshot({ path: `${evidence}/chapter4-section1-regression.png`, fullPage: true });
await regression.close();

await browser.close();
console.log("Chapter 7 browser check passed: nine independent geometric lessons, real drag controls, examples, light/dark/mobile, and Chapter 4 regression.");
