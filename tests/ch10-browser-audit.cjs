// Browser gate for Chapter 10: every lesson renders through the standard lesson
// page without errors; each lab draws a large canvas above the theorem blocks,
// keeps its conclusion behind a prediction, and opens it only after the student
// predicts and then acts; the page never scrolls sideways.
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const baseURL = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4173/learn.html";
const outputDir = process.env.AUDIT_OUTPUT_DIR || path.join(process.cwd(), "artifacts", "ch10-browser-audit");
fs.mkdirSync(outputDir, { recursive: true });

/* act: how the audit operates each lab after predicting (handle positions are the lab's initial world coordinates). */
const routes = [
  { id: "overview", hash: "#ch10", lesson: false },
  { id: "linear-functional", hash: "#ch10/linear-functional", lesson: true, act: { range: true } },
  { id: "dual-space", hash: "#ch10/dual-space", lesson: true, act: { drag: [0.5, 1.5], extent: 3.2 } },
  { id: "bilinear-form", hash: "#ch10/bilinear-form", lesson: true, act: { drag: [1, 0], extent: 3.2 } },
  { id: "symplectic-space", hash: "#ch10/symplectic-space", lesson: true, act: { chip: 1 } },
];
const viewports = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "tablet", width: 820, height: 900 },
  { id: "mobile", width: 390, height: 844 },
];
const themes = ["light", "dark"];
const forbidden = ["正在开发", "占位", "即将制作", "待完善", "待补充", "原型", "开发进度"];
const failures = [];
let passed = 0;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("Failed to load resource")) errors.push(`console: ${message.text()}`);
  });
  return errors;
}

async function setTheme(page, theme) {
  const isDark = await page.evaluate(() => document.body.classList.contains("dark"));
  if ((theme === "dark") !== isDark) {
    await page.locator("#themeToggle").click();
    await page.waitForFunction((dark) => document.body.classList.contains("dark") === dark, theme === "dark");
    await page.waitForFunction(() => !document.body.classList.contains("theme-transitioning"));
  }
}

async function inspect(page, route, viewport, label) {
  const state = await page.evaluate((id) => {
    const main = document.querySelector("#mainContent");
    const lab = main.querySelector(".ch7l-lab");
    const canvas = lab?.querySelector("canvas")?.getBoundingClientRect();
    const interactive = document.getElementById(`${id}-interactive`);
    const formal = document.getElementById(`${id}-formal`);
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: main.querySelectorAll("h1").length,
      katexErrors: main.querySelectorAll(".katex-error").length,
      text: main.innerText,
      examples: main.querySelectorAll("[data-example-challenge]").length,
      choices: main.querySelectorAll("[data-example-challenge] [data-choice], [data-example-challenge] .example-choice").length,
      selfTests: main.querySelectorAll(".self-test-list").length,
      theorems: main.querySelectorAll(".ch7l-theorem").length,
      labs: main.querySelectorAll(".ch7l-lab").length,
      canvas: canvas ? [canvas.width, canvas.height] : null,
      labFirst: Boolean(interactive && formal && interactive.compareDocumentPosition(formal) & Node.DOCUMENT_POSITION_FOLLOWING),
      resultHidden: lab ? lab.querySelector(".ch7l-result")?.hidden : null,
    };
  }, route.id);
  assert(state.overflow <= 1, `${label}: horizontal overflow ${state.overflow}px`);
  assert(state.h1 === 1, `${label}: expected one h1, found ${state.h1}`);
  assert(state.katexErrors === 0, `${label}: KaTeX errors`);
  for (const phrase of forbidden) assert(!state.text.includes(phrase), `${label}: internal wording ${phrase}`);
  assert(!/不是[^。；！？\n]{0,30}而是/.test(state.text), `${label}: banned pattern 不是……而是`);
  if (!route.lesson) return;
  assert(state.examples === 1, `${label}: expected one example challenge`);
  assert(state.selfTests === 1, `${label}: expected one self test`);
  assert(state.theorems >= 2 && state.theorems <= 3, `${label}: theorem block count ${state.theorems}`);
  assert(state.labs === 1, `${label}: expected one lab, found ${state.labs}`);
  assert(state.labFirst, `${label}: the lab must sit above the theorem blocks`);
  const minHeight = viewport.width >= 1000 ? 380 : 280;
  assert(state.canvas && state.canvas[0] >= 280 && state.canvas[1] >= minHeight, `${label}: canvas too small ${JSON.stringify(state.canvas)}`);
  assert(state.resultHidden === true, `${label}: conclusion visible before any prediction`);
}

async function operateLab(page, route, label) {
  const lab = page.locator(".ch7l-lab").first();
  let grab = route.act.drag ? route.act.drag.slice() : null;
  const act = async () => {
    if (route.act.range) {
      const range = lab.locator("input[type=range]").first();
      await range.focus();
      await page.keyboard.press("ArrowLeft");
    } else if (route.act.chip != null) {
      await lab.locator(".ch7l-toolbar .ch7l-chip").nth(route.act.chip).click();
    } else if (route.act.drag) {
      const canvas = lab.locator("canvas").first();
      await canvas.evaluate((node) => node.scrollIntoView({ block: "center" }));
      await page.waitForTimeout(120);
      const box = await canvas.boundingBox();
      const s = Math.min(box.width, box.height) / (2 * route.act.extent);
      const px = box.x + box.width / 2 + grab[0] * s;
      const py = box.y + box.height / 2 - grab[1] * s;
      await page.mouse.move(px, py);
      await page.mouse.down();
      await page.mouse.move(px + 0.75 * s, py - 0.5 * s, { steps: 5 });
      await page.mouse.up();
      grab = [grab[0] + 0.75, grab[1] + 0.5];
    }
    await page.waitForTimeout(150);
  };
  // Acting first must not open the conclusion.
  await act();
  assert(await lab.locator(".ch7l-result").isHidden(), `${label}: conclusion opened without a prediction`);
  await lab.locator(".ch7l-predict-options [data-i]").first().click();
  assert(await lab.locator(".ch7l-predict-feedback").isVisible(), `${label}: prediction feedback missing`);
  // picking alone opens nothing: answer lines and readouts wait for an action
  assert(await lab.locator(".ch7l-result").isHidden(), `${label}: conclusion opened on the prediction click`);
  assert((await lab.locator(".ch7l-side").innerText()).includes("再动手操作一次"), `${label}: readout shown before acting`);
  const before = await lab.locator(".ch7l-side").innerText();
  await act();
  assert((await lab.locator(".ch7l-side").innerText()) !== before || route.act.chip != null, `${label}: control did not change the readout`);
  assert(await lab.locator(".ch7l-result").isVisible(), `${label}: conclusion did not open after predicting and acting`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of viewports) {
      for (const theme of themes) {
        const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
        const page = await context.newPage();
        page.setDefaultTimeout(10000);
        const errors = watchErrors(page);
        for (const route of routes) {
          const label = `${route.id}-${viewport.id}-${theme}`;
          try {
            await page.goto(`${baseURL}${route.hash}`, { waitUntil: "networkidle" });
            await page.waitForSelector("#mainContent h1");
            await setTheme(page, theme);
            await page.waitForTimeout(250);
            await inspect(page, route, viewport, label);
            if (route.lesson) await operateLab(page, route, label);
            if (viewport.id !== "tablet") {
              const target = route.lesson ? page.locator(".ch7l-lab").first() : page.locator("#mainContent");
              await target.screenshot({ path: path.join(outputDir, `${label}.png`) });
            }
            passed += 1;
          } catch (error) {
            failures.push(error.message);
          }
        }
        if (errors.length) failures.push(`${viewport.id}-${theme}: ${errors.join(" | ")}`);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(outputDir, "report.json"), JSON.stringify({ passed, failures }, null, 2));
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(`PASS Chapter 10 browser audit (${passed} checks)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
