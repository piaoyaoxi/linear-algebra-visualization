const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4173/learn.html";
const outputDir = process.env.AUDIT_OUTPUT_DIR || path.join(process.cwd(), "artifacts", "ch10-browser-audit");
fs.mkdirSync(outputDir, { recursive: true });

const routes = [
  { id: "overview", hash: "#ch10", lesson: false },
  { id: "linear-functional", hash: "#ch10/linear-functional", lesson: true },
  { id: "dual-space", hash: "#ch10/dual-space", lesson: true },
  { id: "bilinear-form", hash: "#ch10/bilinear-form", lesson: true },
  { id: "symplectic-space", hash: "#ch10/symplectic-space", lesson: true },
];
const viewports = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "tablet", width: 820, height: 900 },
  { id: "mobile", width: 390, height: 844 },
];
const themes = ["light", "dark"];
const results = [];
const failures = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function numeric(text) {
  return Number(String(text || "").replace(/[^0-9.-]/g, ""));
}

function watchErrors(page, label) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("requestfailed", (request) => {
    if (/^https?:\/\/(127\.0\.0\.1|localhost)/.test(request.url())) {
      errors.push(`requestfailed: ${request.failure()?.errorText || "unknown"} ${request.url()}`);
    }
  });
  return () => assert(errors.length === 0, `${label}: ${errors.join(" | ")}`);
}

async function setTheme(page, theme) {
  const isDark = await page.evaluate(() => document.body.classList.contains("dark"));
  if ((theme === "dark") !== isDark) {
    await page.locator("#themeToggle").click();
    await page.waitForFunction((dark) => document.body.classList.contains("dark") === dark, theme === "dark");
    await page.waitForFunction(() => !document.body.classList.contains("theme-transitioning"));
  }
}

async function inspectLayout(page, label, lesson) {
  const state = await page.evaluate(() => {
    const root = document.documentElement;
    const visibleButtons = [...document.querySelectorAll(".ch10-core-lab button")]
      .filter((button) => button.offsetParent !== null)
      .map((button) => ({
        text: button.textContent.trim(),
        width: button.getBoundingClientRect().width,
        height: button.getBoundingClientRect().height,
      }));
    return {
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      h1Count: document.querySelectorAll("#mainContent h1").length,
      katexErrors: document.querySelectorAll(".katex-error").length,
      coreCount: document.querySelectorAll(".ch10-core-lab").length,
      coreSvgCount: document.querySelectorAll(".ch10-core-lab svg").length,
      cinematicCount: document.querySelectorAll("[data-ch10-cinema], .ch10-cinema").length,
      svgFilterCount: document.querySelectorAll(".ch10-core-lab svg filter").length,
      moduleCount: document.querySelectorAll(".ch10-formal-flow .ch10-module").length,
      intuitionVisualCount: document.querySelectorAll(".ch10-intuition-visual").length,
      legacyIntuitionCount: document.querySelectorAll(".ch10-intuition-list").length,
      numberedModuleBadges: document.querySelectorAll(".ch10-module-heading > span").length,
      brokenInlineMath: [...document.querySelectorAll(".ch10-intuition-section .tex")]
        .filter((node) => {
          const box = node.getBoundingClientRect();
          return box.height > 60 || box.width < 8;
        }).length,
      formalButtonCount: document.querySelectorAll(".ch10-formal-flow button").length,
      emptyMounts: [...document.querySelectorAll("[data-ch10-interactive], [data-ch10-formal]")]
        .filter((node) => !node.textContent.trim() && !node.querySelector("svg")).length,
      text: document.querySelector("#mainContent")?.textContent || "",
      visibleButtons,
    };
  });
  assert(state.scrollWidth <= state.clientWidth + 2, `${label}: horizontal overflow ${state.scrollWidth} > ${state.clientWidth}`);
  assert(state.h1Count === 1, `${label}: expected one h1, found ${state.h1Count}`);
  assert(state.katexErrors === 0, `${label}: KaTeX errors found`);
  assert(!state.text.includes("正在开发"), `${label}: development wording is visible`);
  if (lesson) {
    assert(state.coreCount === 1, `${label}: expected exactly one core interaction, found ${state.coreCount}`);
    assert(state.coreSvgCount === 1, `${label}: expected exactly one core SVG, found ${state.coreSvgCount}`);
    assert(state.cinematicCount === 0, `${label}: cinematic shell is still present`);
    assert(state.svgFilterCount === 0, `${label}: SVG glow/filter is present`);
    assert(state.intuitionVisualCount === 1, `${label}: expected one visual intuition figure`);
    assert(state.legacyIntuitionCount === 0, `${label}: legacy numbered intuition cards are still present`);
    assert(state.numberedModuleBadges === 0, `${label}: numbered formal badges are still present`);
    assert(state.brokenInlineMath === 0, `${label}: inline math has collapsed into a vertical stack`);
    assert(state.moduleCount >= 2 && state.moduleCount <= 3, `${label}: formal module count is ${state.moduleCount}`);
    assert(state.formalButtonCount === 0, `${label}: secondary formal interactions compete with the core interaction`);
    assert(state.emptyMounts === 0, `${label}: empty renderer mount found`);
    const minimumHeight = label.includes("mobile") ? 44 : 36;
    const undersized = state.visibleButtons.filter((button) => button.width < 36 || button.height < minimumHeight);
    assert(undersized.length === 0, `${label}: undersized controls ${JSON.stringify(undersized)}`);
  }
}

async function auditVisualMatrix(browser) {
  for (const viewport of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({ viewport, reducedMotion: "no-preference" });
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      const labelPrefix = `${viewport.id}-${theme}`;
      const verifyErrors = watchErrors(page, labelPrefix);
      try {
        for (const route of routes) {
          const label = `${route.id}-${labelPrefix}`;
          await page.goto(`${baseURL}${route.hash}`, { waitUntil: "networkidle" });
          await page.waitForSelector("#mainContent h1");
          await setTheme(page, theme);
          await inspectLayout(page, label, route.lesson);
          const target = route.lesson ? page.locator(".ch10-core-lab") : page.locator("#mainContent");
          await target.scrollIntoViewIfNeeded();
          await target.screenshot({ path: path.join(outputDir, `${label}.png`) });
          results.push({ label, status: "passed" });
        }
        verifyErrors();
      } finally {
        await context.close();
      }
    }
  }
}

async function auditInteractions(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const verifyErrors = watchErrors(page, "interaction-audit");

  await page.goto(`${baseURL}#ch10/linear-functional`, { waitUntil: "networkidle" });
  const firstX = Number(await page.locator('.ch10-vector.is-x').getAttribute("x2"));
  const firstValue = numeric(await page.locator("[data-functional-value]").textContent());
  await page.getByRole("button", { name: "沿等值层移动" }).click();
  await page.waitForTimeout(90);
  const middleX = Number(await page.locator('.ch10-vector.is-x').getAttribute("x2"));
  await page.waitForTimeout(360);
  const finalX = Number(await page.locator('.ch10-vector.is-x').getAttribute("x2"));
  const levelValue = numeric(await page.locator("[data-functional-value]").textContent());
  assert(firstX !== middleX && middleX !== finalX, "§1 guided motion has no visible middle frame");
  assert(Math.abs(firstValue - levelValue) < 0.01, `§1 equal-level move changed value: ${firstValue} -> ${levelValue}`);
  await page.getByRole("button", { name: "穿过核" }).click();
  await page.waitForTimeout(380);
  assert(numeric(await page.locator("[data-functional-value]").textContent()) < 0, "§1 crossing the kernel did not change sign");
  await page.locator("[data-example-start]").click();
  assert((await page.locator("[data-example-progress]").textContent()).includes("1 /"), "§1 example did not start");

  await page.goto(`${baseURL}#ch10/dual-space`, { waitUntil: "networkidle" });
  assert((await page.locator("[data-dual-coordinates]").textContent()).includes("1.4, -0.7"), "§2 initial dual coordinates are wrong");
  assert(await page.locator('.dual-core .ch10-vector.is-measure').count() === 2, "§2 basis vectors are missing");
  assert(await page.locator('.dual-core [data-vector-handle="measure"]').count() === 0, "§2 covector is drawn as a draggable arrow");
  await page.getByRole("button", { name: "把 x 放到 v₁" }).click();
  await page.waitForTimeout(380);
  assert((await page.locator("[data-dual-coordinates]").textContent()).includes("1, 0"), "§2 v₁ was not read as (1,0)");
  await page.getByRole("tab", { name: "用 v² 读取第二坐标" }).click();
  await page.getByRole("button", { name: "把 x 放到 v₂" }).click();
  await page.waitForTimeout(380);
  assert((await page.locator("[data-dual-coordinates]").textContent()).includes("0, 1"), "§2 v₂ was not read as (0,1)");

  await page.goto(`${baseURL}#ch10/bilinear-form`, { waitUntil: "networkidle" });
  const bilinearInitial = numeric(await page.locator("[data-bilinear-value]").textContent());
  await page.getByRole("button", { name: "沿等值层移动" }).click();
  await page.waitForTimeout(380);
  assert(Math.abs(numeric(await page.locator("[data-bilinear-value]").textContent()) - bilinearInitial) < 0.02, "§3 equal-level move changed B(x,y)");
  await page.getByRole("tab", { name: "固定 x，移动 y" }).click();
  assert((await page.locator("[data-bilinear-reader]").innerText()).includes("A"), "§3 fixed-left reader did not switch to Aᵀx");
  const beforeDouble = numeric(await page.locator("[data-bilinear-value]").textContent());
  await page.getByRole("button", { name: "活动输入放大 2 倍" }).click();
  await page.waitForTimeout(380);
  assert(Math.abs(numeric(await page.locator("[data-bilinear-value]").textContent()) - 2 * beforeDouble) < 0.03, "§3 homogeneity check failed");

  await page.goto(`${baseURL}#ch10/symplectic-space`, { waitUntil: "networkidle" });
  assert(Math.abs(numeric(await page.locator("[data-symplectic-value]").textContent()) - 4.62) < 0.01, "§4 initial area is wrong");
  await page.getByRole("tab", { name: "交换输入" }).click();
  await page.waitForTimeout(380);
  assert(Math.abs(numeric(await page.locator("[data-symplectic-value]").textContent()) + 4.62) < 0.01, "§4 swap did not reverse sign");
  await page.getByRole("tab", { name: "令两向量共线" }).click();
  await page.waitForTimeout(380);
  assert(Math.abs(numeric(await page.locator("[data-symplectic-value]").textContent())) < 0.01, "§4 collinear area is not zero");
  await page.getByRole("tab", { name: "剪切 y ← y+x" }).click();
  await page.waitForTimeout(380);
  assert(Math.abs(numeric(await page.locator("[data-symplectic-value]").textContent()) - 4.62) < 0.01, "§4 shear changed the pairing");
  await page.getByRole("tab", { name: "均匀缩放" }).click();
  await page.waitForTimeout(380);
  assert(Math.abs(numeric(await page.locator("[data-symplectic-value]").textContent()) - 5.59) < 0.01, "§4 uniform scaling value is wrong");

  verifyErrors();
  results.push({ label: "interaction-audit", status: "passed" });
  await context.close();
}

async function auditReducedMotion(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${baseURL}#ch10/symplectic-space`, { waitUntil: "networkidle" });
  await page.getByRole("tab", { name: "均匀缩放" }).click();
  await page.waitForTimeout(60);
  assert(Math.abs(numeric(await page.locator("[data-symplectic-value]").textContent()) - 5.59) < 0.01, "reduced motion did not settle immediately");
  results.push({ label: "reduced-motion", status: "passed" });
  await context.close();
}

async function auditRegressions(browser) {
  const pages = [
    { hash: "#ch1/number-fields", title: "数域", selector: "#number-fields-formal .ch1-formal" },
    { hash: "#ch4/matrix-language", title: "矩阵概念的一些背景", selector: "#transformCanvas" },
    { hash: "#ch5/quadratic-matrix", title: "二次型及其矩阵表示", selector: "[data-s1-map]" },
  ];
  const regressionViewports = [viewports[0], viewports[2]];
  for (const viewport of regressionViewports) {
    for (const theme of themes) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const label = `regression-${viewport.id}-${theme}`;
      const verifyErrors = watchErrors(page, label);
      for (const item of pages) {
        await page.goto(`${baseURL}${item.hash}`, { waitUntil: "networkidle" });
        await page.waitForSelector(item.selector);
        await setTheme(page, theme);
        assert((await page.locator("h1").first().textContent()).includes(item.title), `${item.hash}: wrong lesson rendered`);
        assert(await page.locator(".ch10-core-lab").count() === 0, `${item.hash}: Chapter 10 style leaked into regression page`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        assert(overflow <= 2, `${item.hash}: horizontal overflow ${overflow}`);
        const slug = item.hash.split("/").pop();
        await page.screenshot({ path: path.join(outputDir, `${label}-${slug}.png`), fullPage: true });
      }
      verifyErrors();
      await context.close();
    }
  }
  results.push({ label: "regression-audit", status: "passed" });
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}),
  });
  try {
    for (const audit of [auditVisualMatrix, auditInteractions, auditReducedMotion, auditRegressions]) {
      try {
        await audit(browser);
      } catch (error) {
        failures.push(`${audit.name}: ${error.stack || error.message}`);
      }
    }
  } finally {
    await browser.close();
  }
  const report = { generatedAt: new Date().toISOString(), baseURL, results, failures };
  fs.writeFileSync(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (failures.length) process.exit(1);
})();
