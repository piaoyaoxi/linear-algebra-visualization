import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const base = "http://127.0.0.1:4173/learn.html";
const sections = [
  "lambda-matrix",
  "smith-form",
  "invariant-factors",
  "similarity-criterion",
  "elementary-divisors",
  "jordan-derivation",
  "rational-canonical-form",
];
const shots = "/tmp/ch8-screenshots";
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
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    offenders: [...document.querySelectorAll("main *")]
      .filter((node) => {
        const style = getComputedStyle(node);
        return node.scrollWidth > node.clientWidth + 4 && style.overflowX === "visible";
      })
      .slice(0, 10)
      .map((node) => `${node.tagName}.${String(node.className).replace(/\s+/g, ".")}`),
  }));
  if (result.overflow > 1) throw new Error(`${label}: horizontal overflow ${result.overflow}px; ${result.offenders.join(", ")}`);
}

async function textIncludes(locator, value) {
  return (await locator.innerText()).includes(value);
}

async function openLesson(page, id, shotName = "") {
  await page.goto(`${base}#ch8/${id}`, { waitUntil: "networkidle" });
  await page.locator(`[data-ch8-lab] .ch8-lab`).waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts?.ready);

  for (const selector of [
    ".ch8-question",
    ".ch8-observe",
    ".ch8-mission-card",
    ".ch8-experiment-roadmap",
    ".ch8-foundation",
    ".ch8-example",
    ".self-test-list",
    `[data-complete="${id}"]`,
  ]) {
    if (!(await page.locator(selector).first().isVisible())) throw new Error(`${id}: missing ${selector}`);
  }

  if ((await page.locator(".ch8-foundation-module").count()) < 4) throw new Error(`${id}: foundation is too thin`);
  if ((await page.locator(".ch8-experiment-roadmap article").count()) < 3) throw new Error(`${id}: experiment lacks a visible action roadmap`);
  if (await page.locator(".ch8-concept-strip").count()) throw new Error(`${id}: old generic concept-card template is still present`);
  if (await page.locator(".katex-error").count()) throw new Error(`${id}: KaTeX error marker found`);

  const order = await page.evaluate(() => {
    const interaction = document.querySelector(".ch8-interactive-section")?.getBoundingClientRect().top ?? 0;
    const foundation = document.querySelector(".ch8-foundation")?.getBoundingClientRect().top ?? 0;
    return { interaction, foundation };
  });
  if (order.interaction >= order.foundation) throw new Error(`${id}: theory appears before the core experiment`);

  await assertNoOverflow(page, id);
  if (shotName) await page.locator("main.content").screenshot({ path: path.join(shots, `${shotName}-${id}.png`) });
}

async function exerciseChapter(page, name) {
  await page.goto(`${base}#ch8`, { waitUntil: "networkidle" });
  if ((await page.locator(".ch8-lesson-grid .lesson-card").count()) !== 7) throw new Error("Chapter 8 overview does not contain seven lesson cards");
  if (!(await textIncludes(page.locator(".ch8-cover-journey"), "参数化"))) throw new Error("Chapter 8 overview lacks the classification journey");
  await assertNoOverflow(page, `${name}/overview`);

  for (const id of sections) await openLesson(page, id, name);

  await openLesson(page, "lambda-matrix");
  await page.locator('[data-build-cell="12"]').click();
  if (!(await textIncludes(page.locator("[data-live-conclusion]"), "非对角"))) throw new Error("§1 construction does not explain the selected entry");
  await page.locator('[data-lambda-scene="scan"]').click();
  await page.locator("[data-scan-preset]").selectOption("jordan");
  await page.locator('[data-jump-root="2"]').click();
  const signals = page.locator(".ch8-signal-row");
  if (!(await textIncludes(signals, "det")) || !(await textIncludes(signals, "rank")) || !(await textIncludes(signals, "dim ker"))) throw new Error("§1 scanner does not synchronize det/rank/kernel");
  if (!(await textIncludes(signals, "1"))) throw new Error("§1 Jordan preset did not show one-dimensional kernel");
  await page.locator('[data-lambda-scene="compare"]').click();
  if (!(await textIncludes(page.locator(".ch8-repeat-comparison"), "dimker(2I−A)=2".replace("dimker", "dim ker")))) {
    const compareText = await page.locator(".ch8-repeat-comparison").innerText();
    if (!compareText.includes("=2") || !compareText.includes("=1")) throw new Error("§1 repeated-root comparison is incomplete");
  }

  await openLesson(page, "smith-form");
  for (let index = 0; index < 4; index += 1) await page.locator("[data-smith-next]").click();
  if (!(await textIncludes(page.locator(".ch8-smith-matrix-focus"), "λ+1"))) throw new Error("§2 did not reach diag(1, λ+1)");
  if (!(await textIncludes(page.locator("[data-live-conclusion]"), "Smith"))) throw new Error("§2 final state is not identified as Smith form");
  await page.locator('[data-legal="minus"]').click();
  if (!(await textIncludes(page.locator("[data-legal-feedback]"), "正确"))) throw new Error("§2 legal unit gate failed");
  await page.locator("[data-smith-verification]").click();
  if (!(await textIncludes(page.locator(".ch8-smith-verification"), "U")) || !(await textIncludes(page.locator(".ch8-smith-verification"), "V"))) throw new Error("§2 does not distinguish left and right multipliers");

  await openLesson(page, "invariant-factors");
  await page.locator('[data-k="3"]').click();
  if (!(await textIncludes(page.locator(".ch8-invariant-output"), "d3")) || !(await textIncludes(page.locator(".ch8-invariant-output"), "λ+2"))) throw new Error("§3 Δ-to-d pipeline failed");
  await page.locator('[data-invariant-mode="compare"]').click();
  await page.locator("[data-compare-next]").click();
  await page.locator("[data-compare-next]").click();
  if (!(await textIncludes(page.locator("[data-live-conclusion]"), "不相似"))) throw new Error("§3 same-characteristic-polynomial comparison failed");

  await openLesson(page, "similarity-criterion");
  if (!(await textIncludes(page.locator(".ch8-coordinate-rooms"), "对象不动"))) throw new Error("§4 coordinate rooms do not separate object from coordinates");
  await page.locator('[data-sim-mode="passport"]').click();
  for (let index = 0; index < 4; index += 1) await page.locator("[data-passport-next]").click();
  if (!(await textIncludes(page.locator("[data-live-conclusion]"), "不相似"))) throw new Error("§4 passport accepted the false-similarity pair");

  await openLesson(page, "elementary-divisors");
  await page.locator('[data-factor-field="C"]').click();
  if (!(await textIncludes(page.locator(".ch8-family-columns"), "λ−i")) || !(await textIncludes(page.locator(".ch8-family-columns"), "λ+i"))) throw new Error("§5 complex-field split failed");
  await page.locator('[data-factor-mode="regroup"]').click();
  if (!(await textIncludes(page.locator(".ch8-regroup-layers"), "d2"))) throw new Error("§5 elementary divisors did not regroup into invariant factors");

  await openLesson(page, "jordan-derivation");
  await page.locator("[data-chain-next]").click();
  await page.locator("[data-chain-next]").click();
  await page.locator('[data-growth-k="3"]').click();
  if (!(await textIncludes(page.locator(".ch8-growth-readout"), "=5"))) throw new Error("§6 kernel growth ν3 is wrong");
  await page.locator("[data-show-blocks]").click();
  const jordanOutput = page.locator(".ch8-jordan-output");
  if (!(await textIncludes(jordanOutput, "J3".replace("3", "₃"))) && !(await textIncludes(jordanOutput, "J_3"))) {
    const jordanText = await jordanOutput.innerText();
    if (!jordanText.includes("3") || !jordanText.includes("2")) throw new Error("§6 did not construct 3- and 2-blocks");
  }

  await openLesson(page, "rational-canonical-form");
  for (let index = 0; index < 3; index += 1) await page.locator("[data-orbit-next]").click();
  if (!(await textIncludes(page.locator(".ch8-return-polynomial"), "首次回流"))) throw new Error("§7 Krylov orbit never produced the first feedback relation");
  if (!(await textIncludes(page.locator(".ch8-companion-matrix"), "−1")) && !(await textIncludes(page.locator(".ch8-companion-matrix"), "-1"))) throw new Error("§7 companion feedback column is missing");
  await page.locator('[data-rational-mode="blocks"]').click();
  await page.locator('[data-belt="double"]').click();
  if (!(await textIncludes(page.locator(".ch8-canonical-builder"), "⊕"))) throw new Error("§7 companion blocks were not joined by direct sum");

  await page.goto(`${base}#ch4/matrix-language`, { waitUntil: "networkidle" });
  await page.locator(".section-one-foundation").waitFor({ state: "visible" });
  await page.locator("canvas").first().waitFor({ state: "visible" });
  await assertNoOverflow(page, "Chapter 4 section-one regression");
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
