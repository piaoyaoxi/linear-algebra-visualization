import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const base = "http://127.0.0.1:4173/learn.html";
const sections = [
  "sets-maps",
  "vector-space-definition",
  "basis-coordinates",
  "change-of-basis",
  "subspaces",
  "intersection-sum",
  "direct-sum",
  "isomorphism",
];
const shots = "/tmp/ch6-screenshots";
fs.mkdirSync(shots, { recursive: true });

function collectErrors(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

async function assertNoOverflow(page, label) {
  const result = await page.evaluate(() => ({
    documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    wideNodes: [...document.querySelectorAll("main *")]
      .filter((node) => {
        const style = getComputedStyle(node);
        return node.scrollWidth > node.clientWidth + 3 && style.overflowX === "visible";
      })
      .slice(0, 8)
      .map((node) => `${node.tagName}.${node.className}`),
  }));
  if (result.documentOverflow > 1) {
    throw new Error(`${label}: horizontal overflow ${result.documentOverflow}px; ${result.wideNodes.join(", ")}`);
  }
}

async function assertFormulaLegibility(page, id) {
  const bad = await page.evaluate(() =>
    [...document.querySelectorAll(".ch6-foundation .tex-inline")]
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return { text: node.textContent?.trim(), width: rect.width, height: rect.height };
      })
      .filter((item) => item.text && (item.height > 48 || item.width < 4)),
  );
  if (bad.length) throw new Error(`${id}: fragmented inline formula ${JSON.stringify(bad.slice(0, 4))}`);
}

async function openLesson(page, id, shotName = "") {
  await page.goto(`${base}#ch6/${id}`, { waitUntil: "networkidle" });
  await page.locator(".ch6-foundation").waitFor({ state: "visible" });
  await page.locator(".ch6-guided-lab").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts?.ready);
  for (const selector of [".ch6-lesson-module", ".example-challenge", ".self-test-list"]) {
    if (!(await page.locator(selector).first().isVisible())) throw new Error(`${id}: missing ${selector}`);
  }
  if ((await page.locator(".concept-strip").count()) !== 0) {
    throw new Error(`${id}: legacy generic concept strip is still rendered`);
  }
  await assertFormulaLegibility(page, id);
  await assertNoOverflow(page, id);
  if (shotName) {
    await page.locator("main.content").screenshot({ path: path.join(shots, `${shotName}-${id}.png`) });
  }
}

function textHas(locator, needle) {
  return locator.innerText().then((text) => text.includes(needle));
}

async function exerciseChapter(page, configName) {
  await page.goto(`${base}#ch6`, { waitUntil: "networkidle" });
  if ((await page.locator(".lesson-card-grid .lesson-card").count()) !== 8) {
    throw new Error("Chapter 6 overview does not contain eight lesson cards");
  }

  for (const id of sections) await openLesson(page, id, configName);

  await openLesson(page, "sets-maps");
  await page.locator('[data-map-mode="injective"]').click();
  if (!(await textHas(page.locator("[data-map-injective]"), "不同输入没有碰撞"))) throw new Error("injective preset failed");
  if (!(await textHas(page.locator("[data-map-surjective]"), "陪域存在空缺"))) throw new Error("injective preset should not be surjective");
  await page.locator('[data-map-mode="surjective"]').click();
  if (!(await textHas(page.locator("[data-map-injective]"), "至少两个输入同像"))) throw new Error("surjective preset should not be injective");
  if (!(await textHas(page.locator("[data-map-surjective]"), "陪域全部被命中"))) throw new Error("surjective preset failed");
  await page.locator('[data-map-mode="bijective"]').click();
  if (!(await textHas(page.locator("[data-map-inverse]"), "可唯一倒退"))) throw new Error("bijective inverse failed");
  await page.locator('[data-map-mode="incomplete"]').click();
  if (!(await textHas(page.locator("[data-map-legal]"), "有输入尚未指定输出"))) throw new Error("incomplete mapping was accepted");

  await openLesson(page, "vector-space-definition");
  await page.locator('[data-space-case="rgb"]').click();
  if ((await page.locator(".ch6-rgb-channel").count()) !== 6) throw new Error("RGB lab is not a two-row, three-channel demonstration");
  if (!(await textHas(page.locator("[data-space-scale]"), "存在数乘反例"))) throw new Error("RGB counterexample did not fail scalar closure");

  await openLesson(page, "basis-coordinates");
  await page.locator('[data-basis-mode="redundant"]').click();
  if (!(await textHas(page.locator("[data-basis-final]"), "两项条件未同时成立"))) throw new Error("redundant generating set was called a basis");
  await page.locator('[data-generator="2"]').uncheck();
  if (!(await textHas(page.locator("[data-basis-final]"), "生成且无关"))) throw new Error("removing redundancy did not produce a basis");

  await openLesson(page, "change-of-basis");
  if (!(await textHas(page.locator(".ch6-mode-badge.is-passive"), "黑色向量端点始终固定"))) throw new Error("passive mode lacks a fixed-object cue");
  await page.locator('[data-passive-preset="collapse"]').click();
  await page.locator("[data-change-progress]").fill("1");
  if (!(await textHas(page.locator(".ch6-conclusion-box"), "W 不再是一组基"))) throw new Error("degenerate basis was not rejected");
  await page.locator('[data-change-mode="active"]').click();
  if (!(await textHas(page.locator(".ch6-mode-badge.is-active"), "向量从 v 移到"))) throw new Error("active mode was not clearly separated");
  if (await page.locator("[data-change-p]").count()) throw new Error("transition matrix leaked into active mode");

  await openLesson(page, "subspaces");
  await page.locator('[data-subspace-case="affine"]').click();
  if (!(await textHas(page.locator("[data-sub-zero]"), "0∉U"))) throw new Error("affine plane was accepted as a subspace");
  await page.locator('[data-subspace-case="pzero"]').click();
  if (!(await textHas(page.locator(".ch6-conclusion-box"), "是线性子空间"))) throw new Error("linear polynomial constraint was rejected");

  await openLesson(page, "intersection-sum");
  await page.locator('[data-sum-case="planes"]').click();
  const ledgerValues = await page.locator(".ch6-dimension-ledger strong").allInnerTexts();
  if (ledgerValues.join(",") !== "2,2,1,3") throw new Error(`dimension ledger is wrong: ${ledgerValues.join(",")}`);

  await openLesson(page, "direct-sum");
  await page.locator('[data-direct-case="oblique"]').click();
  if (!(await textHas(page.locator("[data-direct-cover]"), "每个目标向量"))) throw new Error("oblique direct sum did not cover");
  if (!(await textHas(page.locator("[data-direct-zero]"), "没有公共非零方向"))) throw new Error("oblique direct sum did not have zero intersection");
  await page.locator('[data-direct-case="overlap"]').click();
  if (!(await textHas(page.locator("[data-direct-zero]"), "存在可搬运"))) throw new Error("overlap did not break uniqueness");
  await page.locator('[data-direct-case="incomplete"]').click();
  if (!(await textHas(page.locator("[data-direct-cover]"), "没有覆盖"))) throw new Error("incomplete sum incorrectly covered R2");

  await openLesson(page, "isomorphism");
  await page.locator('[data-iso-mode="coordinate"]').click();
  if (!(await textHas(page.locator(".ch6-conclusion-box"), "是线性同构"))) throw new Error("coordinate isomorphism failed");
  await page.locator('[data-iso-mode="projection"]').click();
  if (!(await textHas(page.locator("[data-iso-injective]"), "被压到同一输出"))) throw new Error("projection incorrectly passed injectivity");
  await page.locator('[data-iso-mode="square"]').click();
  if (!(await textHas(page.locator("[data-iso-linear]"), "运算保持失败"))) throw new Error("nonlinear rule incorrectly passed linearity");

  await page.goto(`${base}#ch4/matrix-language`, { waitUntil: "networkidle" });
  await page.locator("canvas").first().waitFor({ state: "visible" });
  await assertNoOverflow(page, "Chapter 4 regression");
}

const browser = await chromium.launch();
try {
  for (const config of [
    { name: "desktop-light", viewport: { width: 1440, height: 1000 }, colorScheme: "light", reducedMotion: "no-preference" },
    { name: "desktop-dark", viewport: { width: 1440, height: 1000 }, colorScheme: "dark", reducedMotion: "no-preference" },
    { name: "mobile-light", viewport: { width: 390, height: 844 }, colorScheme: "light", reducedMotion: "no-preference" },
    { name: "mobile-reduced", viewport: { width: 390, height: 844 }, colorScheme: "light", reducedMotion: "reduce" },
  ]) {
    const context = await browser.newContext({ viewport: config.viewport, colorScheme: config.colorScheme, reducedMotion: config.reducedMotion });
    if (config.colorScheme === "dark") await context.addInitScript(() => localStorage.setItem("la-visual-theme", "dark"));
    const page = await context.newPage();
    const errors = collectErrors(page);
    await exerciseChapter(page, config.name);
    if (errors.length) throw new Error(`${config.name}: ${errors.join("\n")}`);
    console.log(`PASS ${config.name}`);
    await context.close();
  }
} finally {
  await browser.close();
}
