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

function compact(value) {
  return String(value || "").replace(/[\s\u200b]+/g, "");
}

const browser = await chromium.launch({ headless: true });
const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await desktop.newPage();
page.setDefaultTimeout(10_000);
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
  await page.waitForTimeout(100);
  assert.equal(await page.locator("h1").count(), 1, `${route}: missing lesson title`);
  assert.equal(await page.locator(".ch7-formal").count(), 1, `${route}: missing rebuilt formal explanation`);
  assert.equal(await page.locator(".ch7-lab").count(), 1, `${route}: missing interaction`);
  assert.equal(await page.locator(".ch7-task-panel").count(), 1, `${route}: experiment question is not visible`);
  assert.ok((await page.locator(".ch7-task-panel li").count()) >= 3, `${route}: experiment steps are incomplete`);
  assert.equal(await page.locator("[data-example-challenge]").count(), 1, `${route}: missing example challenge`);
  assert.equal(await page.locator(".self-test-list").count(), 1, `${route}: missing self test`);
  assert.equal(await page.locator(".katex-error").count(), 0, `${route}: KaTeX error marker`);
  const geometry = await page.evaluate(() => {
    const task = document.querySelector(".ch7-task-panel");
    const firstControls = document.querySelector(".ch7-preset-row, .ch7-stage-tabs, .ch7-mode-row");
    const taskStrong = document.querySelector(".ch7-task-question strong");
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      taskTop: task?.getBoundingClientRect().top ?? 0,
      controlTop: firstControls?.getBoundingClientRect().top ?? Infinity,
      taskFont: taskStrong ? parseFloat(getComputedStyle(taskStrong).fontSize) : 0,
    };
  });
  assert.ok(geometry.overflow <= 1, `${route}: desktop horizontal overflow ${geometry.overflow}px`);
  assert.ok(geometry.taskTop < geometry.controlTop, `${route}: controls appear before the experiment question`);
  assert.ok(geometry.taskFont >= 17, `${route}: experiment question is visually too weak`);
  if (screenshot) await page.screenshot({ path: `${evidence}/desktop-light-${route}.png`, fullPage: true });
}

await page.goto(`${base}#ch7`, { waitUntil: "networkidle" });
assert.equal(await page.locator(".lesson-card").count(), 9, "chapter overview must expose nine lessons");
assert.match(await page.locator(".lesson-cover").innerText(), /从映射进入算子的内部结构/);

// §1 — the student sees the two paths, then finds a concrete counterexample.
await gotoLesson(routes[0]);
assert.match(await page.locator(".ch7-task-question").innerText(), /满足什么条件/);
assert.equal(await page.locator(".ch7-path-card").count(), 2);
assert.match(await page.locator(".ch7-status-banner").innerText(), /通过加法检验/);
await page.getByRole("button", { name: "平移", exact: true }).click();
assert.match(await page.locator(".ch7-status-banner").innerText(), /找到加法反例/);
await page.locator('[data-stage="origin"]').click();
assert.match(await page.locator(".ch7-status-banner").innerText(), /原点已经移动/);
await page.getByRole("button", { name: "投影", exact: true }).click();
assert.match(await page.locator(".ch7-status-banner").innerText(), /通过必要条件/);
await page.locator('[data-stage="scale"]').click();
assert.match(await page.locator(".ch7-insight-card").innerText(), /数乘闸门/);

// §2 — addition and composition are separated; order and inverse are visible.
await gotoLesson(routes[1]);
assert.equal(await page.locator(".ch7-machine-pipeline > div").count(), 3);
assert.match(await page.locator(".ch7-status-banner").innerText(), /顺序确实改变结果/);
const tsText = compact(await page.locator("[data-operator-workspace]").innerText());
await page.locator('[data-stage="ST"]').click();
const stText = compact(await page.locator("[data-operator-workspace]").innerText());
assert.notEqual(tsText, stText, "TS and ST must visibly differ");
await page.locator('[data-stage="sum"]').click();
assert.match(await page.locator(".ch7-status-banner").innerText(), /不要把 T\+S 画成两步复合/);
await page.locator('[data-stage="inverse"]').click();
assert.match(await page.locator(".ch7-status-banner").innerText(), /倒序撤销回到原输入/);
await page.getByRole("button", { name: "投影 + 旋转", exact: true }).click();
assert.match(await page.locator(".ch7-status-banner").innerText(), /逆变换不存在/);

// §3 — columns are built before change of basis is discussed.
await gotoLesson(routes[2]);
assert.match(await page.locator(".ch7-insight-card").innerText(), /矩阵的第 1 列/);
assert.equal(await page.locator(".ch7-column-builder > div.is-active").count(), 1);
await page.locator('[data-stage="col2"]').click();
assert.match(await page.locator(".ch7-insight-card").innerText(), /矩阵的第 2 列/);
await page.locator('[data-stage="rebuild"]').click();
assert.match(await page.locator(".ch7-insight-card").innerText(), /线性组合自动带动/);
await page.getByRole("button", { name: "特征基", exact: true }).click();
assert.match(await page.locator(".ch7-status-banner").innerText(), /成为对角矩阵/);

// §4 — the candidate line, gate, spectrum, and no-real-eigenline case agree.
await gotoLesson(routes[3]);
assert.equal(await page.locator(".ch7-gate-list > div").count(), 3);
assert.equal(await page.locator(".ch7-direction-map i").count(), 37);
await page.locator("[data-eigen-snap]").first().click();
assert.match(await page.locator(".ch7-status-banner").innerText(), /命中特征直线/);
await page.getByRole("button", { name: "90°旋转", exact: true }).click();
assert.match(await page.locator(".ch7-status-banner").innerText(), /实数域没有特征直线/);
assert.match(await page.locator(".ch7-snap-row").innerText(), /没有可吸附/);

// §5 — P^{-1}, D, P are coordinate translations around one real geometric action.
await gotoLesson(routes[4]);
assert.equal(await page.locator(".ch7-translation-steps > div").count(), 3);
assert.match(await page.locator(".ch7-insight-card").innerText(), /真实向量 x 没有被 P⁻¹ 几何地移动/);
assert.match(await page.locator(".ch7-canvas-card").innerText(), /只比较 x 与 Ax/);
await page.locator('[data-stage="scale"]').click();
assert.match(await page.locator(".ch7-insight-card").innerText(), /两个分量互不混合/);
await page.locator('[data-stage="back"]').click();
assert.match(await page.locator(".ch7-insight-card").innerText(), /真实输出 Ax/);
await page.getByRole("button", { name: "Jordan 块", exact: true }).click();
assert.match(await page.locator(".ch7-status-banner").innerText(), /特征向量数量不足/);

// §6 — kernel fibres and reachable outputs are shown together.
await gotoLesson(routes[5]);
assert.equal(await page.locator(".ch7-space-card").count(), 2);
assert.match(compact(await page.locator(".ch7-dimension-ledger").innerText()), /2=1\+1/);
assert.match(await page.locator(".ch7-insight-strip").innerText(), /多个输入，全部落到同一个输出点/);
await page.getByRole("button", { name: "满秩", exact: true }).click();
assert.match(compact(await page.locator(".ch7-dimension-ledger").innerText()), /2=2\+0/);
assert.match(await page.locator(".ch7-insight-strip").innerText(), /只有零向量/);
await page.getByRole("button", { name: "零变换", exact: true }).click();
assert.match(compact(await page.locator(".ch7-dimension-ledger").innerText()), /2=0\+2/);

// §7 — several points from W are checked, not just one lucky vector.
await gotoLesson(routes[6]);
assert.ok((await page.locator(".ch7-plane circle").count()) >= 8);
assert.match(await page.locator(".ch7-status-banner").innerText(), /不是不变子空间/);
await page.locator("[data-invariant-snap]").first().click();
assert.match(await page.locator(".ch7-status-banner").innerText(), /W 是不变子空间/);
assert.match(await page.locator(".ch7-block-matrix").innerText(), /左下角 0/);
await page.getByRole("button", { name: "整个平面", exact: true }).click();
assert.match(await page.locator(".ch7-universal-case").innerText(), /T\(V\)⊆V/);
await page.getByRole("button", { name: "零子空间", exact: true }).click();
assert.match(await page.locator(".ch7-universal-case").innerText(), /T\(0\)=0/);

// §8 — N walks down the chain; full T is explicitly not presented as nilpotent.
await gotoLesson(routes[7]);
assert.match(compact(await page.locator(".ch7-chain").innerText()), /v2.*N→v1.*N→0/);
await page.locator("[data-jordan-step]").click();
assert.match(await page.locator(".ch7-chain-node.is-active").innerText(), /v1/);
await page.locator("[data-jordan-step]").click();
assert.match(await page.locator(".ch7-status-banner").innerText(), /N 已归零/);
await page.getByRole("button", { name: "看完整 T=λI+N", exact: true }).click();
assert.match(await page.locator(".ch7-status-banner").innerText(), /完整 T 同时包含/);
assert.match(await page.locator(".ch7-status-banner").innerText(), /通常不会归零/);
await page.getByRole("button", { name: "J₃(λ)", exact: true }).click();
await page.getByRole("button", { name: "只看 N=T−λI", exact: true }).click();
for (let i = 0; i < 3; i += 1) await page.locator("[data-jordan-step]").click();
assert.match(await page.locator(".ch7-status-banner").innerText(), /N 已归零/);

// §9 — partial annihilation and minimum degree are distinguishable.
await gotoLesson(routes[8]);
assert.match(await page.locator(".ch7-minimal-status").innerText(), /只消掉部分方向/);
await page.locator('[data-candidate="1"]').click();
assert.match(await page.locator(".ch7-status-banner").innerText(), /这就是最小多项式/);
await page.getByRole("button", { name: "2I₂", exact: true }).click();
await page.locator('[data-candidate="1"]').click();
assert.match(await page.locator(".ch7-status-banner").innerText(), /次数还可能不是最低/);

// Every representative example must accept its mathematically marked correct choice.
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
  assert.equal(await page.locator("[data-example-explanation]").isHidden(), false);
}

// Dark appearance: inspect every lab, not only one representative page.
await page.evaluate(() => localStorage.setItem("la-visual-theme", "dark"));
await page.reload({ waitUntil: "networkidle" });
for (const route of routes) {
  await page.goto(`${base}#ch7/${route}`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("body").evaluate((body) => body.classList.contains("dark")), true);
  assert.ok((await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 1);
  await page.locator(".ch7-lab").screenshot({ path: `${evidence}/desktop-dark-${route}-lab.png` });
}

// Mobile and reduced-motion: every complete page, every task, no overflow.
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
const mobilePage = await mobile.newPage();
const mobileErrors = [];
mobilePage.on("console", (message) => {
  if (message.type() === "error") mobileErrors.push(`console: ${message.text()}`);
});
mobilePage.on("pageerror", (error) => mobileErrors.push(`pageerror: ${error.message}`));
for (const route of routes) {
  await mobilePage.goto(`${base}#ch7/${route}`, { waitUntil: "networkidle" });
  assert.equal(await mobilePage.locator(".ch7-lab").count(), 1, `${route}: mobile lab missing`);
  assert.equal(await mobilePage.locator(".ch7-task-panel").count(), 1, `${route}: mobile task missing`);
  const mobileGeometry = await mobilePage.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    labWidth: document.querySelector(".ch7-lab")?.getBoundingClientRect().width,
    viewport: document.documentElement.clientWidth,
    taskFont: parseFloat(getComputedStyle(document.querySelector(".ch7-task-question strong")).fontSize),
  }));
  assert.ok(mobileGeometry.overflow <= 1, `${route}: mobile horizontal overflow ${mobileGeometry.overflow}px`);
  assert.ok(mobileGeometry.labWidth <= mobileGeometry.viewport + 1, `${route}: lab exceeds mobile viewport`);
  assert.ok(mobileGeometry.taskFont >= 17, `${route}: mobile task question too small`);
  await mobilePage.screenshot({ path: `${evidence}/mobile-reduced-${route}.png`, fullPage: true });
}
assert.deepEqual(mobileErrors, []);
await mobile.close();

// Chapter 4 regression: mature §1 remains isolated and functional.
await page.evaluate(() => localStorage.setItem("la-visual-theme", "light"));
await page.goto(`${base}#ch4/matrix-language`, { waitUntil: "networkidle" });
assert.equal(await page.locator("#transformCanvas").count(), 1);
assert.equal(await page.locator(".ch7-lab").count(), 0);
assert.ok((await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 1);
await page.screenshot({ path: `${evidence}/chapter4-section1-regression.png`, fullPage: true });

assert.deepEqual(errors, []);
await desktop.close();
await browser.close();
console.log("Chapter 7 browser check passed: nine rebuilt lessons, visible tasks, mathematical interactions, all themes, mobile, examples, and Chapter 4 regression.");
