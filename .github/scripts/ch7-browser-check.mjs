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

function collectErrors(page, target) {
  page.on("console", (message) => {
    if (message.type() === "error") target.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => target.push(`pageerror: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) target.push(`HTTP ${response.status()}: ${response.url()}`);
  });
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await desktop.newPage();
page.setDefaultTimeout(15_000);
const errors = [];
collectErrors(page, errors);

async function gotoLesson(route, { screenshot = false } = {}) {
  await page.goto(`${base}#ch7/${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(180);
  assert.equal(await page.locator("h1").count(), 1, `${route}: missing lesson title`);
  assert.equal(await page.locator(".ch7-story-formal").count(), 1, `${route}: third-round formal story missing`);
  assert.ok((await page.locator(".ch7-story-formal-steps > li").count()) >= 3, `${route}: formal sequence incomplete`);
  assert.equal(await page.locator(".ch7-story").count(), 1, `${route}: geometric story missing`);
  assert.ok((await page.locator(".ch7-story-intro li").count()) >= 3, `${route}: visible tasks incomplete`);
  assert.equal(await page.locator(".ch7-story-stage").count(), 1, `${route}: visual stage missing`);
  assert.equal(await page.locator(".ch7-story-svg").count(), 1, `${route}: main SVG missing`);
  assert.equal(await page.locator(".ch7-story-result-inner").count(), 1, `${route}: conclusion missing`);
  assert.equal(await page.locator("[data-example-challenge]").count(), 1, `${route}: representative example missing`);
  assert.equal(await page.locator(".self-test-list").count(), 1, `${route}: self test missing`);
  assert.equal(await page.locator(".katex-error").count(), 0, `${route}: KaTeX error marker`);
  assert.equal(await page.locator(".ch7-cinema-lab").count(), 0, `${route}: rejected dashboard renderer still mounted`);

  const geometry = await page.evaluate(() => {
    const intro = document.querySelector(".ch7-story-intro");
    const toolbar = document.querySelector(".ch7-story-toolbar");
    const svg = document.querySelector(".ch7-story-svg");
    const stage = document.querySelector(".ch7-story-stage");
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      introTop: intro?.getBoundingClientRect().top ?? Infinity,
      toolbarTop: toolbar?.getBoundingClientRect().top ?? Infinity,
      svgWidth: svg?.getBoundingClientRect().width ?? 0,
      stageWidth: stage?.getBoundingClientRect().width ?? 0,
      viewport: document.documentElement.clientWidth,
      minIntroFont: intro ? parseFloat(getComputedStyle(intro.querySelector("h3")).fontSize) : 0,
    };
  });
  assert.ok(geometry.overflow <= 1, `${route}: desktop horizontal overflow ${geometry.overflow}px`);
  assert.ok(geometry.introTop < geometry.toolbarTop, `${route}: task must precede controls`);
  assert.ok(geometry.minIntroFont >= 24, `${route}: experiment question visually weak`);
  assert.ok(geometry.svgWidth > 620, `${route}: geometry does not dominate the desktop stage`);
  assert.ok(geometry.svgWidth <= geometry.viewport + 1, `${route}: SVG exceeds viewport`);
  assert.ok(Math.abs(geometry.svgWidth - geometry.stageWidth) <= 2, `${route}: stage is not filled by the visual`);

  const arrowAudit = await page.locator(".ch7-story-arrow").evaluateAll((arrows) => arrows.map((arrow) => ({
    tag: arrow.tagName,
    marker: arrow.getAttribute("marker-end"),
    d: arrow.getAttribute("d") || "",
  })));
  assert.ok(arrowAudit.length >= 1, `${route}: no vector arrows rendered`);
  arrowAudit.forEach((arrow) => {
    assert.equal(arrow.tag, "path", `${route}: vector is not a single path`);
    assert.equal(arrow.marker, null, `${route}: marker-based dagger arrow returned`);
    assert.ok(arrow.d.endsWith("Z"), `${route}: arrow stem and head are not one closed shape`);
  });

  if (screenshot) await page.screenshot({ path: `${evidence}/desktop-light-${route}.png`, fullPage: true });
}

await page.goto(`${base}#ch7`, { waitUntil: "networkidle" });
assert.equal(await page.locator(".lesson-card").count(), 9, "chapter overview must expose nine lessons");

// §1 — two paths must visibly meet or separate.
await gotoLesson(routes[0]);
await page.getByRole("button", { name: "平移反例", exact: true }).click();
await page.getByRole("button", { name: "原点", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /原点被送到了别处/);
await page.getByRole("button", { name: "加法", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /缺口/);
assert.equal(await page.locator(".ch7-story-gap").count() > 0, true, "linearity counterexample gap not drawn");

// §2 — parallel sum, ordered composition, and failed inverse are distinct stories.
await gotoLesson(routes[1]);
await page.getByRole("button", { name: "T+S", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /两条支路/);
await page.getByRole("button", { name: "投影 + 旋转", exact: true }).click();
await page.getByRole("button", { name: "撤销", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /逆变换不存在/);

// §3 — columns appear before arbitrary-vector reconstruction and basis comparison.
await gotoLesson(routes[2]);
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /第一列/);
await page.getByRole("button", { name: "送入 b₂", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /第二列/);
await page.getByRole("button", { name: "重建任意输入", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /重组这两列/);
await page.getByRole("button", { name: "特征基", exact: true }).click();
await page.getByRole("button", { name: "比较坐标记录", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /对角矩阵/);

// §4 — native slider works twice and the direction can be dragged directly in the SVG.
await gotoLesson(routes[3]);
const angleSlider = page.locator('.ch7-story-controls input[data-key="angle"]');
assert.equal(await angleSlider.count(), 1, "eigen angle slider missing");
let box = await angleSlider.boundingBox();
assert.ok(box, "eigen slider has no geometry");
const firstBefore = Number(await angleSlider.inputValue());
await page.mouse.move(box.x + box.width * 0.18, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.72, box.y + box.height / 2, { steps: 16 });
await page.mouse.up();
const firstAfter = Number(await angleSlider.inputValue());
assert.notEqual(firstAfter, firstBefore, "slider did not continuously drag");
box = await angleSlider.boundingBox();
await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.35, box.y + box.height / 2, { steps: 12 });
await page.mouse.up();
const secondAfter = Number(await angleSlider.inputValue());
assert.notEqual(secondAfter, firstAfter, "slider stopped after first redraw");
const handle = page.locator(".ch7-story-stage [data-drag-handle]");
const handleBox = await handle.boundingBox();
assert.ok(handleBox, "eigen direction handle missing");
await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
await page.mouse.down();
await page.mouse.move(handleBox.x - 150, handleBox.y + 110, { steps: 14 });
await page.mouse.up();
assert.notEqual(Number(await angleSlider.inputValue()), secondAfter, "direction could not be dragged in SVG");
await page.getByRole("button", { name: "90°旋转", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /所有实方向都会转向/);

// §5 — three visual shots and the structural failure are explicit.
await gotoLesson(routes[4]);
await page.getByRole("button", { name: "2 独立缩放", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /互不混合/);
await page.getByRole("button", { name: "3 重新合成", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /真实输出 Ax/);
await page.getByRole("button", { name: "Jordan 块", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /不能找到一整组特征基/);

// §6 — the whole grid collapses and kernel motion leaves final output unchanged.
await gotoLesson(routes[5]);
assert.ok((await page.locator(".ch7-story-warp-grid.is-output").count()) >= 16, "collapsing plane grid missing");
const progress = page.locator('.ch7-story-controls input[data-key="progress"]');
const progressBox = await progress.boundingBox();
await page.mouse.move(progressBox.x + progressBox.width * 0.9, progressBox.y + progressBox.height / 2);
await page.mouse.down();
await page.mouse.move(progressBox.x + progressBox.width * 0.35, progressBox.y + progressBox.height / 2, { steps: 14 });
await page.mouse.up();
assert.ok(Number(await progress.inputValue()) < 0.7, "collapse progress did not drag");
await page.getByRole("button", { name: "秩一压缩", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /坍缩到一条线/);
await page.getByRole("button", { name: "零变换", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /坍缩到原点/);

// §7 — compare the whole W band with the whole T(W) band.
await gotoLesson(routes[6]);
assert.ok((await page.locator(".ch7-story-band").count()) >= 2, "W and T(W) bands missing");
const invariantSlider = page.locator('.ch7-story-controls input[data-key="angle"]');
await invariantSlider.evaluate((input) => {
  input.value = "45";
  input.dispatchEvent(new Event("input", { bubbles: true }));
});
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /整个 T\(W\) 仍被 W 包含/);
await page.getByRole("button", { name: "90°旋转", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /整体转出了 W/);
await page.getByRole("button", { name: "整个空间 V", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /整个空间 V/);

// §8 — Jordan failure, full T, and nilpotent chain are visually separated.
await gotoLesson(routes[7]);
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /额外剪切/);
await page.getByRole("button", { name: "J₃(λ)", exact: true }).click();
await page.getByRole("button", { name: "看完整 T=λI+N", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /缩放与向前一级的剪切/);
await page.getByRole("button", { name: "剥离缩放，只看 N", exact: true }).click();
for (let i = 0; i < 3; i += 1) await page.getByRole("button", { name: "沿链走一步", exact: true }).click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /最终到达 0/);

// §9 — every basis direction must vanish, then minimum degree is checked.
await gotoLesson(routes[8]);
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /只消掉了部分方向/);
await page.locator('[data-candidate="1"]').click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /次数已经最低/);
await page.getByRole("button", { name: "2I₂", exact: true }).click();
await page.locator('[data-candidate="1"]').click();
assert.match(await page.locator(".ch7-story-result-inner").innerText(), /还不是最短关系/);

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

// Dark mode — reload through the same path as a returning visitor and capture all nine stages.
await page.evaluate(() => localStorage.setItem("la-visual-theme", "dark"));
await page.reload({ waitUntil: "networkidle" });
for (const route of routes) {
  await page.goto(`${base}#ch7/${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(100);
  assert.equal(await page.locator("body").evaluate((body) => body.classList.contains("dark")), true);
  assert.ok((await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 1);
  await page.locator(".ch7-story").screenshot({ path: `${evidence}/desktop-dark-${route}-story.png` });
}
assert.deepEqual(errors, []);
await desktop.close();

// Mobile, reduced motion, and a synthetic touch drag on the eigen direction.
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", hasTouch: true });
const mobilePage = await mobile.newPage();
const mobileErrors = [];
collectErrors(mobilePage, mobileErrors);
for (const route of routes) {
  await mobilePage.goto(`${base}#ch7/${route}`, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(100);
  assert.equal(await mobilePage.locator(".ch7-story").count(), 1, `${route}: mobile story missing`);
  const geometry = await mobilePage.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    svgWidth: document.querySelector(".ch7-story-svg")?.getBoundingClientRect().width ?? 0,
    stageWidth: document.querySelector(".ch7-story-stage")?.getBoundingClientRect().width ?? 0,
    viewport: document.documentElement.clientWidth,
  }));
  assert.ok(geometry.overflow <= 1, `${route}: mobile horizontal overflow ${geometry.overflow}px`);
  assert.ok(geometry.svgWidth <= geometry.viewport + 1, `${route}: mobile SVG exceeds viewport`);
  assert.ok(Math.abs(geometry.svgWidth - geometry.stageWidth) <= 2, `${route}: mobile stage not filled`);
  await mobilePage.screenshot({ path: `${evidence}/mobile-reduced-${route}.png`, fullPage: true });
}
await mobilePage.goto(`${base}#ch7/eigenvalues-eigenvectors`, { waitUntil: "networkidle" });
const touchBefore = Number(await mobilePage.locator('[data-key="angle"]').inputValue());
const touchHandle = mobilePage.locator("[data-drag-handle]");
const touchHandleBox = await touchHandle.boundingBox();
const touchStage = mobilePage.locator(".ch7-story-stage");
await touchHandle.dispatchEvent("pointerdown", { pointerId: 7, pointerType: "touch", clientX: touchHandleBox.x + 5, clientY: touchHandleBox.y + 5, bubbles: true });
await touchStage.dispatchEvent("pointermove", { pointerId: 7, pointerType: "touch", clientX: touchHandleBox.x - 95, clientY: touchHandleBox.y + 80, bubbles: true });
await touchStage.dispatchEvent("pointerup", { pointerId: 7, pointerType: "touch", clientX: touchHandleBox.x - 95, clientY: touchHandleBox.y + 80, bubbles: true });
assert.notEqual(Number(await mobilePage.locator('[data-key="angle"]').inputValue()), touchBefore, "touch drag did not update direction");
assert.deepEqual(mobileErrors, []);
await mobile.close();

// Mature Chapter 4 remains isolated and unchanged.
const regression = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const regressionPage = await regression.newPage();
await regressionPage.goto(`${base}#ch4/matrix-language`, { waitUntil: "networkidle" });
assert.equal(await regressionPage.locator("#transformCanvas").count(), 1);
assert.equal(await regressionPage.locator(".ch7-story").count(), 0);
assert.ok((await regressionPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 1);
await regressionPage.screenshot({ path: `${evidence}/chapter4-section1-regression.png`, fullPage: true });
await regression.close();
await browser.close();
console.log("Chapter 7 geometric story browser check passed: nine independent visuals, direct manipulation, desktop light/dark, mobile, examples, and Chapter 4 regression.");
