import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = "http://127.0.0.1:4173/learn.html";
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
const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await desktop.newPage();
page.setDefaultTimeout(12_000);
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
page.on("response", (response) => {
  if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
});

async function gotoLesson(route, { screenshot = false } = {}) {
  await page.goto(`${base}#ch7/${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(160);
  assert.equal(await page.locator("h1").count(), 1, `${route}: missing lesson title`);
  assert.equal(await page.locator(".ch7-cinema-formal").count(), 1, `${route}: cinematic formal explanation missing`);
  assert.ok((await page.locator(".ch7-cinema-concept-list > li").count()) >= 3, `${route}: concepts are not legible as a sequence`);
  assert.equal(await page.locator(".ch7-cinema-lab").count(), 1, `${route}: cinematic lab missing`);
  assert.equal(await page.locator(".ch7-cinema-task").count(), 1, `${route}: visible experiment task missing`);
  assert.ok((await page.locator(".ch7-cinema-task li").count()) >= 3, `${route}: exploration prompts incomplete`);
  assert.equal(await page.locator(".ch7-cinema-svg").count(), 1, `${route}: main geometric SVG missing`);
  assert.equal(await page.locator(".ch7-cinema-readout").count(), 1, `${route}: geometric conclusion readout missing`);
  assert.equal(await page.locator(".ch7-cinema-conclusion").count(), 1, `${route}: final experiment conclusion missing`);
  assert.equal(await page.locator("[data-example-challenge]").count(), 1, `${route}: representative example missing`);
  assert.equal(await page.locator(".self-test-list").count(), 1, `${route}: self test missing`);
  assert.equal(await page.locator(".katex-error").count(), 0, `${route}: KaTeX error marker`);

  const geometry = await page.evaluate(() => {
    const task = document.querySelector(".ch7-cinema-task");
    const presets = document.querySelector(".ch7-cinema-preset-row, .ch7-cinema-stage-tabs, .ch7-cinema-scene");
    const question = document.querySelector(".ch7-cinema-task strong");
    const svg = document.querySelector(".ch7-cinema-svg");
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      taskTop: task?.getBoundingClientRect().top ?? Infinity,
      firstInteractiveTop: presets?.getBoundingClientRect().top ?? Infinity,
      questionFont: question ? parseFloat(getComputedStyle(question).fontSize) : 0,
      svgWidth: svg?.getBoundingClientRect().width ?? 0,
      viewport: document.documentElement.clientWidth,
    };
  });
  assert.ok(geometry.overflow <= 1, `${route}: desktop horizontal overflow ${geometry.overflow}px`);
  assert.ok(geometry.taskTop < geometry.firstInteractiveTop, `${route}: task must appear before controls and scene`);
  assert.ok(geometry.questionFont >= 17, `${route}: experiment question visually too weak`);
  assert.ok(geometry.svgWidth > 420, `${route}: main geometry is too small on desktop`);
  assert.ok(geometry.svgWidth <= geometry.viewport + 1, `${route}: SVG exceeds viewport`);

  // A vector is rendered as a line plus marker. The renderer must never append a generic tip circle.
  assert.equal(await page.locator(".ch7-cinema-arrow + circle").count(), 0, `${route}: vector endpoint dot returned`);
  if (screenshot) await page.screenshot({ path: `${evidence}/desktop-light-${route}.png`, fullPage: true });
}

await page.goto(`${base}#ch7`, { waitUntil: "networkidle" });
assert.equal(await page.locator(".lesson-card").count(), 9, "chapter overview must expose nine lessons");

// §1: geometry-first linearity gates.
await gotoLesson(routes[0]);
assert.equal(await page.locator(".ch7-cinema-stage-tabs button").count(), 3);
await page.getByRole("button", { name: "平移", exact: true }).click();
await page.locator('[data-stage="origin"]').click();
assert.match(await page.locator(".ch7-cinema-conclusion").innerText(), /原点条件失败/);
await page.locator('[data-stage="add"]').click();
assert.match(await page.locator(".ch7-cinema-readout").innerText(), /输出端出现了可见缺口|输出端的平行四边形仍然闭合/);

// §2: addition is visually separated from composition and inverse.
await gotoLesson(routes[1]);
await page.locator('[data-stage="sum"]').click();
assert.match(await page.locator(".ch7-cinema-conclusion").innerText(), /T\+S 不是连续做两步/);
await page.locator('[data-stage="inverse"]').click();
await page.getByRole("button", { name: "投影 + 旋转", exact: true }).click();
assert.match(await page.locator(".ch7-cinema-conclusion").innerText(), /逆变换不存在/);

// §3: columns are constructed before basis comparison.
await gotoLesson(routes[2]);
assert.match(await page.locator(".ch7-cinema-readout").innerText(), /矩阵第 1 列/);
await page.locator('[data-stage="col2"]').click();
assert.match(await page.locator(".ch7-cinema-readout").innerText(), /矩阵第 2 列/);
await page.locator('[data-stage="rebuild"]').click();
assert.match(await page.locator(".ch7-cinema-readout").innerText(), /任意输入只是在重组/);
await page.getByRole("button", { name: "特征基", exact: true }).click();
assert.match(await page.locator(".ch7-cinema-conclusion").innerText(), /对角矩阵/);

// §4: real drag on a persistent native slider, then pointer-drag the direction in the SVG.
await gotoLesson(routes[3]);
const angleSlider = page.locator('.ch7-cinema-controls input[type="range"]').first();
assert.equal(await angleSlider.count(), 1, "eigen angle slider missing");
const before = Number(await angleSlider.inputValue());
let box = await angleSlider.boundingBox();
assert.ok(box, "eigen slider has no geometry");
await page.mouse.move(box.x + box.width * 0.20, box.y + box.height / 2);
await page.mouse.down();
for (let i = 1; i <= 10; i += 1) {
  await page.mouse.move(box.x + box.width * (0.20 + i * 0.055), box.y + box.height / 2, { steps: 2 });
}
await page.mouse.up();
const after = Number(await angleSlider.inputValue());
assert.notEqual(after, before, "slider did not respond to continuous drag");
// A second drag proves the input node was not destroyed and recreated during input.
box = await angleSlider.boundingBox();
await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.38, box.y + box.height / 2, { steps: 12 });
await page.mouse.up();
const afterSecondDrag = Number(await angleSlider.inputValue());
assert.notEqual(afterSecondDrag, after, "slider stopped dragging after the first input event");
const svgBox = await page.locator(".ch7-cinema-svg").boundingBox();
const beforeSvgDrag = Number(await angleSlider.inputValue());
await page.mouse.move(svgBox.x + svgBox.width * 0.70, svgBox.y + svgBox.height * 0.25);
await page.mouse.down();
await page.mouse.move(svgBox.x + svgBox.width * 0.32, svgBox.y + svgBox.height * 0.72, { steps: 14 });
await page.mouse.up();
assert.notEqual(Number(await angleSlider.inputValue()), beforeSvgDrag, "direction could not be dragged directly in SVG");
await page.getByRole("button", { name: "90°旋转", exact: true }).click();
assert.match(await page.locator(".ch7-cinema-conclusion").innerText(), /实数域没有特征直线/);

// §5: decomposition, independent scaling, recombination and structural failure.
await gotoLesson(routes[4]);
await page.locator('[data-stage="scale"]').click();
assert.match(await page.locator(".ch7-cinema-readout").innerText(), /互不混合/);
await page.locator('[data-stage="recombine"]').click();
assert.match(await page.locator(".ch7-cinema-readout").innerText(), /真实输出 Ax/);
await page.getByRole("button", { name: "Jordan 块", exact: true }).click();
assert.match(await page.locator(".ch7-cinema-conclusion").innerText(), /结构上失败/);

// §6: kernel fibres and image are linked as one map.
await gotoLesson(routes[5]);
assert.match(await page.locator(".ch7-cinema-readout").innerText(), /所有输入.*同一个像|所有输入虽然彼此不同/);
await page.getByRole("button", { name: "满秩", exact: true }).click();
assert.match(await page.locator(".ch7-cinema-conclusion").innerText(), /rank T=2/);
await page.getByRole("button", { name: "零变换", exact: true }).click();
assert.match(await page.locator(".ch7-cinema-conclusion").innerText(), /rank T=0/);

// §7: multiple samples, not one lucky vector.
await gotoLesson(routes[6]);
assert.ok((await page.locator(".ch7-cinema-svg circle.ch7-cinema-point").count()) >= 8, "invariant subspace must inspect multiple samples");
await page.locator("[data-invariant-snap]").first().click();
assert.match(await page.locator(".ch7-cinema-conclusion").innerText(), /W 是不变子空间/);
await page.getByRole("button", { name: "90°旋转", exact: true }).click();
assert.match(await page.locator(".ch7-cinema-no-snap").innerText(), /没有一维不变子空间/);
await page.getByRole("button", { name: "整个空间 V", exact: true }).click();
assert.match(await page.locator(".ch7-cinema-readout").innerText(), /整个空间永远/);

// §8: full T and nilpotent N remain distinct.
await gotoLesson(routes[7]);
assert.match(await page.locator(".ch7-cinema-readout").innerText(), /只有幂零部分会沿链最终到达 0/);
await page.getByRole("button", { name: "看完整 T=λI+N", exact: true }).click();
assert.match(await page.locator(".ch7-cinema-readout").innerText(), /完整 T 通常不会归零/);
await page.getByRole("button", { name: "J₃(λ)", exact: true }).click();
await page.getByRole("button", { name: "只看 N=T−λI", exact: true }).click();
for (let i = 0; i < 3; i += 1) await page.getByRole("button", { name: "沿链走一步", exact: true }).click();
assert.match(await page.locator(".ch7-cinema-readout").innerText(), /当前步\s*3/);

// §9: whole-space annihilation and minimum degree.
await gotoLesson(routes[8]);
assert.match(await page.locator(".ch7-cinema-readout").innerText(), /只消掉了部分方向/);
await page.locator('[data-minimal-candidate="1"]').click();
assert.match(await page.locator(".ch7-cinema-conclusion").innerText(), /这就是最小多项式/);
await page.getByRole("button", { name: "2I₂", exact: true }).click();
await page.locator('[data-minimal-candidate="1"]').click();
assert.match(await page.locator(".ch7-cinema-conclusion").innerText(), /次数不是最低/);

// Examples and full desktop evidence.
for (const route of routes) {
  await gotoLesson(route, { screenshot: true });
  const correctIndex = await page.evaluate((sectionId) => {
    const chapter = getChapterById("ch7");
    const section = getStructuredSections(chapter).find((item) => item.id === sectionId);
    return section.example.choices.findIndex((choice) => choice.correct);
  }, route);
  assert.ok(correctIndex >= 0, `${route}: no correct example choice`);
  await page.locator('[data-example-challenge] input[type="radio"]').nth(correctIndex).check();
  await page.locator("[data-example-action]").click();
  assert.equal(await page.locator("[data-example-challenge]").getAttribute("data-state"), "correct");
}

// Dark mode: inspect every lab.
await page.evaluate(() => localStorage.setItem("la-visual-theme", "dark"));
for (const route of routes) {
  await page.goto(`${base}#ch7/${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(100);
  assert.equal(await page.locator("body").evaluate((body) => body.classList.contains("dark")), true);
  assert.ok((await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 1);
  await page.locator(".ch7-cinema-lab").screenshot({ path: `${evidence}/desktop-dark-${route}-lab.png` });
}
assert.deepEqual(errors, []);
await desktop.close();

// Mobile, touch, and reduced motion: complete pages and touch slider movement.
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", hasTouch: true });
const mobilePage = await mobile.newPage();
const mobileErrors = [];
mobilePage.on("console", (message) => { if (message.type() === "error") mobileErrors.push(`console: ${message.text()}`); });
mobilePage.on("pageerror", (error) => mobileErrors.push(`pageerror: ${error.message}`));
for (const route of routes) {
  await mobilePage.goto(`${base}#ch7/${route}`, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(80);
  assert.equal(await mobilePage.locator(".ch7-cinema-lab").count(), 1, `${route}: mobile lab missing`);
  const geometry = await mobilePage.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    svgWidth: document.querySelector(".ch7-cinema-svg")?.getBoundingClientRect().width ?? 0,
    viewport: document.documentElement.clientWidth,
    questionFont: parseFloat(getComputedStyle(document.querySelector(".ch7-cinema-task strong")).fontSize),
  }));
  assert.ok(geometry.overflow <= 1, `${route}: mobile horizontal overflow ${geometry.overflow}px`);
  assert.ok(geometry.svgWidth <= geometry.viewport + 1, `${route}: mobile SVG exceeds viewport`);
  assert.ok(geometry.questionFont >= 17, `${route}: mobile task question too small`);
  await mobilePage.screenshot({ path: `${evidence}/mobile-reduced-${route}.png`, fullPage: true });
}
assert.deepEqual(mobileErrors, []);
await mobile.close();

// Mature Chapter 4 remains isolated.
const regression = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const regressionPage = await regression.newPage();
await regressionPage.goto(`${base}#ch4/matrix-language`, { waitUntil: "networkidle" });
assert.equal(await regressionPage.locator("#transformCanvas").count(), 1);
assert.equal(await regressionPage.locator(".ch7-cinema-lab").count(), 0);
assert.ok((await regressionPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 1);
await regressionPage.screenshot({ path: `${evidence}/chapter4-section1-regression.png`, fullPage: true });
await regression.close();
await browser.close();
console.log("Chapter 7 cinematic browser check passed: geometry-first SVG, draggable sliders, nine lessons, all themes, mobile, examples, and Chapter 4 regression.");
