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

const failures = [];
const results = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function collectPageErrors(page, label) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (url.startsWith("http://127.0.0.1") || url.startsWith("http://localhost")) {
      errors.push(`requestfailed: ${request.failure()?.errorText || "unknown"} ${url}`);
    }
  });
  return () => {
    if (errors.length) throw new Error(`${label}: ${errors.join(" | ")}`);
  };
}

async function auditRoute(browser, route, viewport, options = {}) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: options.reducedMotion ? "reduce" : "no-preference",
    colorScheme: "light",
  });
  const page = await context.newPage();
  const label = `${route.id}-${viewport.id}${options.reducedMotion ? "-reduced" : ""}`;
  const assertNoPageErrors = await collectPageErrors(page, label);
  const screenshotPath = path.join(outputDir, `${label}.png`);

  try {
    await page.goto(`${baseURL}${route.hash}`, { waitUntil: "networkidle" });
    await page.waitForSelector("#mainContent h1");

    if (options.dark) {
      await page.click("#themeToggle");
      await page.waitForFunction(() => document.body.classList.contains("dark"));
    }

    await page.screenshot({ path: screenshotPath, fullPage: true });

    const layout = await page.evaluate(() => {
      const root = document.documentElement;
      const overflowing = [...document.querySelectorAll("body *")]
        .filter((element) => {
          const style = getComputedStyle(element);
          if (style.display === "none" || style.visibility === "hidden") return false;
          const rect = element.getBoundingClientRect();
          return rect.right > root.clientWidth + 2 || rect.left < -2 || element.scrollWidth > element.clientWidth + 2;
        })
        .slice(0, 12)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            id: element.id,
            className: typeof element.className === "string" ? element.className : "",
            text: (element.textContent || "").trim().slice(0, 80),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
          };
        });
      return {
        scrollWidth: root.scrollWidth,
        clientWidth: root.clientWidth,
        h1Count: document.querySelectorAll("#mainContent h1").length,
        text: document.querySelector("#mainContent")?.textContent || "",
        katexErrors: [...document.querySelectorAll(".katex-error")].map((node) => node.textContent.trim()).slice(0, 8),
        overflowing,
      };
    });
    assert(
      layout.scrollWidth <= layout.clientWidth + 2,
      `${label}: horizontal overflow ${layout.scrollWidth} > ${layout.clientWidth}; suspects=${JSON.stringify(layout.overflowing)}`,
    );
    assert(layout.h1Count === 1, `${label}: expected one h1, found ${layout.h1Count}`);
    assert(!layout.text.includes("适合配合教材相应章节阅读"), `${label}: placeholder chapter copy is visible`);
    assert(!layout.text.includes("正在开发"), `${label}: internal development wording is visible`);
    assert(layout.katexErrors.length === 0, `${label}: KaTeX errors ${JSON.stringify(layout.katexErrors)}`);

    if (route.lesson) {
      await page.waitForSelector(".ch10-primary-lab");
      const lessonState = await page.evaluate(() => ({
        svgCount: document.querySelectorAll(".ch10-primary-lab svg").length,
        moduleCount: document.querySelectorAll(".ch10-formal-flow .ch10-module").length,
        taskCount: document.querySelectorAll(".ch10-task-list li").length,
        emptyMounts: [...document.querySelectorAll("[data-ch10-interactive], [data-ch10-formal]")]
          .filter((node) => !node.textContent.trim() && !node.querySelector("svg")).length,
      }));
      assert(lessonState.svgCount >= 1, `${label}: main experiment has no SVG`);
      assert(lessonState.moduleCount >= 4, `${label}: formal lesson has only ${lessonState.moduleCount} modules`);
      assert(lessonState.taskCount >= 3, `${label}: observation task list is incomplete`);
      assert(lessonState.emptyMounts === 0, `${label}: found empty presentation mounts`);

      const touchTargets = await page.evaluate(() => [...document.querySelectorAll(".ch10-primary-lab button")]
        .filter((button) => button.offsetParent !== null)
        .map((button) => ({
          text: button.textContent.trim(),
          width: button.getBoundingClientRect().width,
          height: button.getBoundingClientRect().height,
        }))
        .filter((item) => item.width < 32 || item.height < 32));
      assert(touchTargets.length === 0, `${label}: undersized visible controls ${JSON.stringify(touchTargets)}`);
    }

    assertNoPageErrors();
    results.push({ label, status: "passed" });
  } catch (error) {
    if (!fs.existsSync(screenshotPath)) {
      await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    }
    throw error;
  } finally {
    await context.close();
  }
}

async function auditInteractions(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const assertNoPageErrors = await collectPageErrors(page, "interaction-audit");

  // §1: guided equal-level motion and zero functional boundary.
  await page.goto(`${baseURL}#ch10/linear-functional`, { waitUntil: "networkidle" });
  const initialValue = await page.locator("[data-functional-readout] article:first-child strong").textContent();
  await page.click('[data-functional-guide="level"]');
  await page.waitForTimeout(1050);
  const levelValue = await page.locator("[data-functional-readout] article:first-child strong").textContent();
  assert(initialValue === levelValue, `§1 equal-level guide changed the value: ${initialValue} -> ${levelValue}`);
  await page.click('[data-functional-preset="zero"]');
  await page.waitForTimeout(80);
  assert((await page.locator("[data-functional-conclusion]").textContent()).includes("所有向量都被读成 0"), "§1 zero functional conclusion missing");
  await page.click("[data-example-start]");
  assert((await page.locator("[data-example-progress]").textContent()).includes("1 /"), "§1 example stepper did not start");

  // §2: covectors are layers/readers, and dependent basis blocks the dual basis.
  await page.goto(`${baseURL}#ch10/dual-space`, { waitUntil: "networkidle" });
  assert(await page.locator(".dual-reader-stack").count() === 1, "§2 covector reader visual missing");
  assert(await page.locator(".is-functional-plane .ch10-vector").count() === 0, "§2 incorrectly draws the covector as an ordinary vector arrow");
  assert(await page.locator(".katex-error").count() === 0, "§2 contains a KaTeX rendering error");
  await page.click('[data-dual-basis-preset="singular"]');
  assert((await page.locator("[data-dual-basis-readout]").textContent()).includes("对偶基不存在"), "§2 dependent basis failure is not explained");
  await page.click('[data-dual-basis-preset="near"]');
  assert((await page.locator("[data-dual-sensitivity]").textContent()).includes("接近退化"), "§2 near-dependent sensitivity state missing");

  // §3: two-slot modes, equivalent pipelines, and left radical.
  await page.goto(`${baseURL}#ch10/bilinear-form`, { waitUntil: "networkidle" });
  const firstPipeline = await page.locator("[data-bilinear-pipeline]").textContent();
  await page.click('[data-pipeline="left"]');
  const secondPipeline = await page.locator("[data-bilinear-pipeline]").textContent();
  assert(firstPipeline !== secondPipeline && secondPipeline.includes("Aᵀx"), "§3 equivalent calculation pipeline did not switch");
  await page.click('[data-bilinear-preset="degenerate"]');
  await page.click("[data-bilinear-radical]");
  assert((await page.locator("[data-bilinear-readout]").textContent()).includes("退化"), "§3 degenerate preset not detected");
  await page.click('[data-radical-preset="nonsymmetric"]');
  assert((await page.locator("[data-radical-readout]").textContent()).includes("左根与右根方向不同"), "§3 nonsymmetric radical boundary missing");

  // §4: sign swap, collinear state, symplectic and non-symplectic transforms.
  await page.goto(`${baseURL}#ch10/symplectic-space`, { waitUntil: "networkidle" });
  const beforeSwap = await page.locator("[data-symplectic-caption]").textContent();
  await page.click('[data-area-action="swap"]');
  const afterSwap = await page.locator("[data-symplectic-caption]").textContent();
  assert(beforeSwap !== afterSwap, "§4 swapping inputs did not change the oriented pairing");
  await page.click('[data-area-action="collinear"]');
  assert((await page.locator("[data-symplectic-conclusion]").textContent()).includes("共线"), "§4 collinear state missing");
  await page.click('[data-symplectic-mode="transform"]');
  await page.click('[data-symplectic-preset="uniform"]');
  assert((await page.locator("[data-transform-verdict]").textContent()).includes("SᵀJS ≠ J"), "§4 uniform scaling should be non-symplectic");
  await page.click('[data-symplectic-preset="shear"]');
  assert((await page.locator("[data-transform-verdict]").textContent()).includes("SᵀJS = J"), "§4 shear should be symplectic");

  // Chapter 4 regression.
  await page.goto(`${baseURL}#ch4/matrix-language`, { waitUntil: "networkidle" });
  await page.waitForSelector("#matrix-language-formal .section-one-foundation");
  assert(await page.locator("[data-anatomy-matrix]").count() === 1, "Chapter 4 §1 renderer regression");
  assert(await page.locator("#transformCanvas").count() === 1, "Chapter 4 §1 transform interaction regression");

  assertNoPageErrors();
  results.push({ label: "interaction-audit", status: "passed" });
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const route of routes) {
      for (const viewport of viewports) {
        try {
          await auditRoute(browser, route, viewport, { dark: viewport.id === "mobile" });
        } catch (error) {
          failures.push(`${route.id}/${viewport.id}: ${error.stack || error.message}`);
        }
      }
    }

    try {
      await auditRoute(browser, routes[4], viewports[0], { reducedMotion: true });
    } catch (error) {
      failures.push(`reduced-motion: ${error.stack || error.message}`);
    }

    try {
      await auditInteractions(browser);
    } catch (error) {
      failures.push(`interactions: ${error.stack || error.message}`);
    }
  } finally {
    await browser.close();
  }

  const report = { generatedAt: new Date().toISOString(), baseURL, results, failures };
  fs.writeFileSync(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (failures.length) process.exit(1);
})();
