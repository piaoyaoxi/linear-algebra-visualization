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
page.setDefaultTimeout(8_000);
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
page.on("response", (response) => {
  if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
});

async function gotoLesson(route) {
  await page.goto(`${base}#ch7/${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(80);
  assert.equal(await page.locator("h1").count(), 1, `${route}: missing lesson title`);
  assert.equal(await page.locator(".ch7-formal").count(), 1, `${route}: missing formal content`);
  assert.equal(await page.locator(".ch7-lab").count(), 1, `${route}: missing interaction`);
  assert.equal(await page.locator("[data-example-challenge]").count(), 1, `${route}: missing example challenge`);
  assert.equal(await page.locator(".self-test-list").count(), 1, `${route}: missing self test`);
  assert.equal(await page.locator(".katex-error").count(), 0, `${route}: KaTeX error marker`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `${route}: desktop horizontal overflow ${overflow}px`);
}

await page.goto(`${base}#ch7`, { waitUntil: "networkidle" });
assert.equal(await page.locator(".lesson-card").count(), 9, "chapter overview must expose nine lessons");
assert.match(await page.locator(".lesson-cover").innerText(), /从映射进入算子的内部结构/);

// §1: both linearity gates must agree with concrete counterexamples.
await gotoLesson(routes[0]);
assert.equal(await page.locator(".ch7-compare-card.is-pass").count(), 2);
await page.getByRole("button", { name: "平移", exact: true }).click();
assert.ok((await page.locator(".ch7-compare-card.is-fail").count()) >= 1);
assert.match(await page.locator(".ch7-observation").innerText(), /原点条件已失败/);
await page.getByRole("button", { name: "投影", exact: true }).click();
assert.equal(await page.locator(".ch7-compare-card.is-pass").count(), 2);

// §2: composition order and a commuting counterexample.
await gotoLesson(routes[1]);
await page.locator('[data-mode="TS"]').click();
const ts = compact(await page.locator(".ch7-operator-panel").innerText());
assert.match(ts, /右边的S先作用/);
assert.match(ts, /TS=ST\?否/);
await page.locator('[data-mode="ST"]').click();
const st = compact(await page.locator(".ch7-operator-panel").innerText());
assert.match(st, /这次T先作用/);
assert.notEqual(ts, st);
await page.getByRole("button", { name: "缩放 + 反射", exact: true }).click();
assert.match(compact(await page.locator(".ch7-operator-panel").innerText()), /TS=ST\?是/);

// §3: the geometric arrows stay fixed while the coordinate record changes.
await gotoLesson(routes[2]);
const standardRecord = await page.locator("[data-basis-record]").innerText();
await page.getByRole("button", { name: "特征基", exact: true }).click();
const eigenRecord = compact(await page.locator("[data-basis-record]").innerText());
assert.match(eigenRecord, /特征基下无坐标混合/);
assert.match(eigenRecord, /坐标校验\[T\]B\[x\]B=\[T\(x\)\]B/);
assert.notEqual(standardRecord, eigenRecord);
await page.getByRole("button", { name: "斜基", exact: true }).click();
assert.match(await page.locator("[data-basis-record]").innerText(), /坐标之间仍会混合/);

// §4: scan, snap, and the real-field no-eigenline case.
await gotoLesson(routes[3]);
await page.getByRole("button", { name: "45° · λ=3", exact: true }).click();
assert.match(await page.locator("[data-eigen-panel]").innerText(), /命中特征直线/);
await page.getByRole("button", { name: "90°旋转", exact: true }).click();
assert.match(await page.locator("[data-eigen-panel]").innerText(), /没有实特征方向/);
assert.match(await page.locator("[data-snap-row]").innerText(), /实数域中没有可吸附方向/);
await page.getByRole("button", { name: "反射", exact: true }).click();
await page.getByRole("button", { name: "90° · λ=-1", exact: true }).click();
assert.match(await page.locator("[data-eigen-panel]").innerText(), /命中特征直线/);

// §5: diagonalizable and defective cases, plus matrix powers.
await gotoLesson(routes[4]);
await page.getByRole("button", { name: "Jordan 块", exact: true }).click();
assert.equal(await page.locator("[data-swap]").isDisabled(), true);
assert.match(await page.locator("[data-diagonal-panel]").innerText(), /独立特征向量不足/);
await page.getByRole("button", { name: "非对称可对角化", exact: true }).click();
assert.equal(await page.locator("[data-swap]").isDisabled(), false);
assert.match(compact(await page.locator("[data-diagonal-panel]").innerText()), /重构误差0/);
await page.locator("[data-swap]").click();
assert.equal(await page.locator("[data-swap]").innerText(), "恢复原特征向量顺序");
await page.locator('[data-range="power"]').fill("0");
await page.locator('[data-range="power"]').dispatchEvent("input");
assert.match(await page.locator("[data-diagonal-panel]").innerText(), /n=0/);

// §6: all rank/nullity regimes.
await gotoLesson(routes[5]);
assert.match(compact(await page.locator("[data-kernel-ledger]").innerText()), /rankT1nullityT1/);
await page.getByRole("button", { name: "满秩", exact: true }).click();
let ledger = compact(await page.locator("[data-kernel-ledger]").innerText());
assert.match(ledger, /rankT2nullityT0/);
assert.match(ledger, /kerT\{0\}/);
await page.getByRole("button", { name: "零变换", exact: true }).click();
ledger = compact(await page.locator("[data-kernel-ledger]").innerText());
assert.match(ledger, /rankT0nullityT2/);
assert.match(ledger, /整个输入平面/);
await page.getByRole("button", { name: "秩一压缩", exact: true }).click();
assert.match(await page.locator("[data-kernel-ledger]").innerText(), /平面 → 斜直线/);

// §7: line gate plus the two universal invariant subspaces.
await gotoLesson(routes[6]);
assert.match(await page.locator("[data-invariant-panel]").innerText(), /T\(W\) 离开 W/);
await page.getByRole("button", { name: "0°", exact: true }).click();
assert.match(await page.locator("[data-invariant-panel]").innerText(), /T\(W\) ⊆ W/);
await page.getByRole("button", { name: "90°旋转", exact: true }).click();
assert.match(await page.locator("[data-invariant-snaps]").innerText(), /没有实一维不变子空间/);
await page.getByRole("button", { name: "整个平面", exact: true }).click();
assert.match(await page.locator("[data-invariant-panel]").innerText(), /T\(R²\) ⊆ R²/);
assert.doesNotMatch(await page.locator("[data-invariant-panel]").innerText(), /补空间分量/);
await page.getByRole("button", { name: "零子空间", exact: true }).click();
assert.match(await page.locator("[data-invariant-panel]").innerText(), /T\(\{0\}\) = \{0\}/);

// §8: chain direction must read v_k -> ... -> v_1 -> 0.
await gotoLesson(routes[7]);
let chain = compact(await page.locator(".ch7-chain").innerText());
assert.ok(chain.indexOf("v2") < chain.indexOf("v1") && chain.indexOf("v1") < chain.lastIndexOf("0"));
await page.locator("[data-jordan-step]").click();
assert.match(await page.locator(".ch7-chain-node.is-active").innerText(), /v1/);
await page.locator("[data-jordan-step]").click();
assert.match(await page.locator("[data-jordan-panel]").innerText(), /当前向量已归零/);
await page.getByRole("button", { name: "J₃(λ)", exact: true }).click();
for (let i = 0; i < 3; i += 1) await page.locator("[data-jordan-step]").click();
assert.match(await page.locator("[data-jordan-panel]").innerText(), /当前向量已归零/);
await page.getByRole("button", { name: "两个 1×1 块", exact: true }).click();
assert.match(await page.locator("[data-jordan-panel]").innerText(), /两个 1×1 块没有链传递；N=0/);

// §9: distinguish partial annihilation, minimal annihilation, and a longer chain.
await gotoLesson(routes[8]);
assert.match(await page.locator("[data-minimal-result]").innerText(), /只消掉部分方向/);
await page.locator('[data-candidate="1"]').click();
assert.match(await page.locator("[data-minimal-result]").innerText(), /p\(A\)=0/);
await page.locator('[data-preset="0"]').click();
assert.match(await page.locator("[data-minimal-result]").innerText(), /最低首一全局关系/);
await page.locator('[data-preset="3"]').click();
await page.locator('[data-candidate="2"]').click();
assert.match(await page.locator("[data-minimal-result]").innerText(), /p\(A\)=0/);

// Every representative example must accept its mathematically marked correct choice.
for (const route of routes) {
  await gotoLesson(route);
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

// Dark appearance evidence.
await page.goto(`${base}#ch7/eigenvalues-eigenvectors`, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.setItem("la-visual-theme", "dark"));
await page.reload({ waitUntil: "networkidle" });
assert.equal(await page.locator("body").evaluate((body) => body.classList.contains("dark")), true);
await page.screenshot({ path: `${evidence}/desktop-dark-eigen.png`, fullPage: true });

// Mobile and reduced-motion sweep.
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
  const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `${route}: mobile horizontal overflow ${overflow}px`);
}
await mobilePage.goto(`${base}#ch7/jordan-form-introduction`, { waitUntil: "networkidle" });
await mobilePage.screenshot({ path: `${evidence}/mobile-reduced-jordan.png`, fullPage: true });
assert.deepEqual(mobileErrors, []);
await mobile.close();

// Chapter 4 regression: Chapter 7 must not mount on the mature reference lesson.
await page.evaluate(() => localStorage.setItem("la-visual-theme", "light"));
await page.goto(`${base}#ch4/matrix-language`, { waitUntil: "networkidle" });
assert.equal(await page.locator("#transformCanvas").count(), 1);
assert.equal(await page.locator(".ch7-lab").count(), 0);
assert.ok((await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 1);

assert.deepEqual(errors, []);
await desktop.close();
await browser.close();
console.log("Chapter 7 browser check passed: nine lessons, interactions, examples, themes, mobile, and Chapter 4 regression.");
