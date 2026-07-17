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
      .slice(0, 8)
      .map((node) => `${node.tagName}.${node.className}`),
  }));
  if (result.overflow > 1) throw new Error(`${label}: horizontal overflow ${result.overflow}px; ${result.offenders.join(", ")}`);
}

async function openLesson(page, id, shotName = "") {
  await page.goto(`${base}#ch8/${id}`, { waitUntil: "networkidle" });
  await page.locator(`[data-ch8-lab] .ch8-lab`).waitFor({ state: "visible" });
  for (const selector of [".ch8-theory-stack", ".ch8-example", ".self-test-list", `[data-complete="${id}"]`]) {
    if (!(await page.locator(selector).first().isVisible())) throw new Error(`${id}: missing ${selector}`);
  }
  if (await page.locator(".katex-error").count()) throw new Error(`${id}: KaTeX error marker found`);
  await assertNoOverflow(page, id);
  if (shotName) await page.locator("main.content").screenshot({ path: path.join(shots, `${shotName}-${id}.png`) });
}

async function textIncludes(locator, value) {
  return (await locator.innerText()).includes(value);
}

async function exerciseChapter(page, name) {
  await page.goto(`${base}#ch8`, { waitUntil: "networkidle" });
  if ((await page.locator(".ch8-lesson-grid .lesson-card").count()) !== 7) throw new Error("Chapter 8 overview does not contain seven lesson cards");
  await assertNoOverflow(page, `${name}/overview`);

  for (const id of sections) await openLesson(page, id, name);

  await openLesson(page, "lambda-matrix");
  await page.locator("[data-lambda-preset]").selectOption("jordanRepeated");
  await page.locator('[data-root="2"]').click();
  if (!(await textIncludes(page.locator("[data-lambda-rank]"), "1"))) throw new Error("lambda scanner rank failed");
  if (!(await textIncludes(page.locator("[data-lambda-nullity]"), "1"))) throw new Error("lambda scanner nullity failed");

  await openLesson(page, "smith-form");
  for (let index = 0; index < 4; index += 1) await page.locator("[data-smith-next]").click();
  if (!(await textIncludes(page.locator("[data-smith-status]"), "标准形"))) throw new Error("Smith reduction did not reach the standard form");
  if (!(await textIncludes(page.locator("[data-smith-note]"), "验证"))) throw new Error("Smith reduction lacks the UAV verification");

  await openLesson(page, "invariant-factors");
  await page.locator("[data-invariant-preset]").selectOption("jordan");
  if (!(await textIncludes(page.locator("[data-invariant-min]"), "2"))) throw new Error("invariant-factor minimum polynomial failed");
  await page.locator('[data-stage="3"]').click();
  if (!(await textIncludes(page.locator("[data-invariant-factors]"), "d2"))) throw new Error("invariant-factor chain failed");

  await openLesson(page, "similarity-criterion");
  await page.locator("[data-passport-preset]").selectOption("sameChar");
  await page.locator("[data-passport-all]").click();
  if (!(await textIncludes(page.locator("[data-passport-result]"), "不相似"))) throw new Error("similarity passport accepted a false match");

  await openLesson(page, "elementary-divisors");
  await page.locator("[data-factor-preset]").selectOption("quadratic");
  await page.locator('[data-factor-field] [data-field="C"]').click();
  if (!(await textIncludes(page.locator("[data-factor-output]"), "i"))) throw new Error("complex elementary divisors were not split");
  await page.locator('[data-factor-mode="regroup"]').click();
  if (!(await textIncludes(page.locator("[data-factor-output]"), "λ²+1"))) throw new Error("elementary divisors did not regroup");

  await openLesson(page, "jordan-derivation");
  await page.locator("[data-jordan-preset]").selectOption("threeTwo");
  await page.locator('[data-power="3"]').click();
  if (!(await textIncludes(page.locator("[data-kernel-formula]"), "5"))) throw new Error("Jordan kernel-growth meter is wrong");
  await page.locator("[data-chain-next]").click();
  await page.locator("[data-chain-next]").click();
  if (!(await textIncludes(page.locator("[data-jordan-chain-note]"), "链已完成"))) throw new Error("Jordan chain did not complete");

  await openLesson(page, "rational-canonical-form");
  await page.locator("[data-krylov-next]").click();
  await page.locator("[data-krylov-next]").click();
  await page.locator("[data-krylov-next]").click();
  if (!(await textIncludes(page.locator("[data-krylov-relation]"), "首次停止扩张"))) throw new Error("Krylov relation did not appear");
  if (!(await page.locator("[data-krylov-companion] .katex").count())) throw new Error("companion matrix is missing");

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
} catch (error) {
  fs.writeFileSync(path.join(shots, "error.txt"), `${error.stack || error}\n`);
  throw error;
} finally {
  await browser.close();
}
