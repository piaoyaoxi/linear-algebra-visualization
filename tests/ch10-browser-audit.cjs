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

const lessonRoutes = routes.filter((route) => route.lesson);
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
  page.setDefaultTimeout(8000);
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

    await page.screenshot({ path: screenshotPath, fullPage: viewport.id === "desktop" });

    const layout = await page.evaluate(() => {
      const root = document.documentElement;
      const overflowing = [...document.querySelectorAll("body *")]
        .filter((element) => {
          const style = getComputedStyle(element);
          if (style.display === "none" || style.visibility === "hidden") return false;
          const rect = element.getBoundingClientRect();
          return rect.right > root.clientWidth + 2 || rect.left < -2;
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
      await page.waitForSelector(".ch10-primary-lab", { state: "attached" });
      await page.waitForSelector("[data-ch10-cinema]");
      const lessonState = await page.evaluate(() => ({
        legacySvgCount: document.querySelectorAll(".ch10-primary-lab svg").length,
        cinemaCount: document.querySelectorAll("[data-ch10-cinema]").length,
        cinemaSvgChildren: document.querySelector("[data-ch10-cinema] [data-cinema-svg]")?.children.length || 0,
        cinemaStepCount: document.querySelectorAll("[data-ch10-cinema] [data-cinema-step]").length,
        moduleCount: document.querySelectorAll(".ch10-formal-flow .ch10-module").length,
        taskCount: document.querySelectorAll(".ch10-task-list li").length,
        deepClosed: !document.querySelector(".ch10-cinema-deep")?.open,
        legacyInsideDeep: Boolean(document.querySelector(".ch10-cinema-deep [data-ch10-interactive] .ch10-primary-lab")),
        emptyMounts: [...document.querySelectorAll("[data-ch10-interactive], [data-ch10-formal]")]
          .filter((node) => !node.textContent.trim() && !node.querySelector("svg")).length,
      }));
      assert(lessonState.legacySvgCount >= 1, `${label}: deep experiment has no SVG`);
      assert(lessonState.cinemaCount === 1, `${label}: expected one cinematic stage, found ${lessonState.cinemaCount}`);
      assert(lessonState.cinemaSvgChildren > 3, `${label}: cinematic SVG did not render`);
      assert(lessonState.cinemaStepCount >= 4, `${label}: cinematic story has only ${lessonState.cinemaStepCount} steps`);
      assert(lessonState.deepClosed, `${label}: full parameter lab should be collapsed initially`);
      assert(lessonState.legacyInsideDeep, `${label}: legacy dashboard was not demoted into deep exploration`);
      assert(lessonState.moduleCount >= 4, `${label}: formal lesson has only ${lessonState.moduleCount} modules`);
      assert(lessonState.taskCount >= 3, `${label}: observation task list is incomplete`);
      assert(lessonState.emptyMounts === 0, `${label}: found empty presentation mounts`);

      const touchTargets = await page.evaluate(() => [...document.querySelectorAll("[data-ch10-cinema] button")]
        .filter((button) => button.offsetParent !== null)
        .map((button) => ({
          text: button.textContent.trim(),
          width: button.getBoundingClientRect().width,
          height: button.getBoundingClientRect().height,
        }))
        .filter((item) => item.width < 32 || item.height < 32));
      assert(touchTargets.length === 0, `${label}: undersized cinematic controls ${JSON.stringify(touchTargets)}`);

      const cinemaLocator = page.locator("[data-ch10-cinema]");
      await cinemaLocator.scrollIntoViewIfNeeded();
      const chromeClearance = await page.evaluate(() => {
        const heading = document.querySelector("[data-ch10-cinema] .ch10-cinema-head > div")?.getBoundingClientRect();
        const topbar = document.querySelector(".topbar")?.getBoundingClientRect();
        return heading && topbar ? heading.top >= topbar.bottom + 8 : true;
      });
      assert(chromeClearance, `${label}: fixed top controls overlap the cinematic title`);
      await cinemaLocator.screenshot({ path: path.join(outputDir, `${label}-cinema.png`) });
    }

    assertNoPageErrors();
    results.push({ label, status: "passed" });
  } catch (error) {
    if (!fs.existsSync(screenshotPath)) {
      await page.screenshot({ path: screenshotPath }).catch(() => {});
    }
    throw error;
  } finally {
    await context.close();
  }
}

async function auditCinematicStories(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const assertNoPageErrors = await collectPageErrors(page, "cinematic-audit");

  for (const route of lessonRoutes) {
    await page.goto(`${baseURL}${route.hash}`, { waitUntil: "networkidle" });
    const cinema = page.locator("[data-ch10-cinema]");
    await cinema.waitFor();
    const buttons = cinema.locator("[data-cinema-step]");
    const count = await buttons.count();
    assert(count >= 4, `${route.id}: cinematic step count ${count}`);

    const initial = await cinema.locator("[data-cinema-svg]").innerHTML();
    await buttons.nth(1).click();
    await page.waitForTimeout(320);
    const middle = await cinema.locator("[data-cinema-svg]").innerHTML();
    await page.waitForTimeout(760);
    const end = await cinema.locator("[data-cinema-svg]").innerHTML();
    assert(initial !== middle, `${route.id}: first transition did not begin`);
    assert(middle !== end, `${route.id}: transition jumped directly to its final state`);

    for (let index = 0; index < count; index += 1) {
      await buttons.nth(index).click();
      await page.waitForTimeout(980);
      const caption = (await cinema.locator("[data-cinema-caption]").textContent()).trim();
      assert(caption.length > 8, `${route.id} step ${index + 1}: missing explanatory caption`);
      await cinema.screenshot({ path: path.join(outputDir, `${route.id}-cinema-step-${index + 1}.png`) });
    }
  }

  assertNoPageErrors();
  results.push({ label: "cinematic-audit", status: "passed" });
  await context.close();
}

async function auditMobileCinematicStories(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });
  const page = await context.newPage();
  const assertNoPageErrors = await collectPageErrors(page, "mobile-cinematic-audit");

  for (const route of lessonRoutes) {
    await page.goto(`${baseURL}${route.hash}`, { waitUntil: "networkidle" });
    const cinema = page.locator("[data-ch10-cinema]");
    await cinema.waitFor();
    const buttons = cinema.locator("[data-cinema-step]");
    const count = await buttons.count();
    for (let index = 0; index < count; index += 1) {
      await buttons.nth(index).click();
      await page.waitForTimeout(980);
      const bounds = await cinema.locator("[data-cinema-svg]").evaluate((svg) => ({
        scrollWidth: svg.scrollWidth,
        clientWidth: svg.clientWidth,
        rectWidth: svg.getBoundingClientRect().width,
      }));
      assert(bounds.scrollWidth <= bounds.clientWidth + 2, `${route.id} mobile step ${index + 1}: SVG overflows its stage`);
      await cinema.screenshot({ path: path.join(outputDir, `${route.id}-mobile-cinema-step-${index + 1}.png`) });
    }
  }

  assertNoPageErrors();
  results.push({ label: "mobile-cinematic-audit", status: "passed" });
  await context.close();
}

async function openDeepLab(page) {
  const details = page.locator(".ch10-cinema-deep");
  if (!(await details.evaluate((node) => node.open))) {
    await details.locator(":scope > summary").click();
  }
}

async function auditInteractions(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const assertNoPageErrors = await collectPageErrors(page, "interaction-audit");

  // §1: cinematic continuity, guided equal-level motion and zero functional boundary.
  await page.goto(`${baseURL}#ch10/linear-functional`, { waitUntil: "networkidle" });
  await page.locator('[data-cinema-step="1"]').click();
  await page.waitForTimeout(980);
  assert((await page.locator("[data-cinema-caption]").textContent()).includes("读数保持不变"), "§1 cinematic equal-level conclusion missing");
  await openDeepLab(page);
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
  await page.locator('[data-cinema-step="2"]').click();
  await page.waitForTimeout(980);
  assert((await page.locator("[data-cinema-caption]").textContent()).includes("两台探针"), "§2 cinematic dual-basis explanation missing");
  await openDeepLab(page);
  await page.click('[data-dual-basis-preset="singular"]');
  assert((await page.locator("[data-dual-basis-readout]").textContent()).includes("对偶基不存在"), "§2 dependent basis failure is not explained");
  await page.click('[data-dual-basis-preset="near"]');
  assert((await page.locator("[data-dual-sensitivity]").textContent()).includes("接近退化"), "§2 near-dependent sensitivity state missing");

  // §3: two-slot modes, equivalent pipelines, and left radical.
  await page.goto(`${baseURL}#ch10/bilinear-form`, { waitUntil: "networkidle" });
  await page.locator('[data-cinema-step="2"]').click();
  await page.waitForTimeout(980);
  assert((await page.locator("[data-cinema-caption]").textContent()).includes("同一个标量"), "§3 cinematic two-pipeline explanation missing");
  await openDeepLab(page);
  const firstPipeline = await page.locator("[data-bilinear-pipeline]").textContent();
  await page.click('[data-pipeline="left"]');
  const secondPipeline = await page.locator("[data-bilinear-pipeline]").textContent();
  assert(firstPipeline !== secondPipeline && secondPipeline.includes("Aᵀx"), "§3 equivalent calculation pipeline did not switch");
  await page.click('[data-bilinear-preset="degenerate"]');
  await page.click("[data-bilinear-radical]");
  assert((await page.locator("[data-bilinear-readout]").textContent()).includes("退化"), "§3 degenerate preset not detected");
  await page.click('[data-radical-preset="nonsymmetric"]');
  assert((await page.locator("[data-radical-readout]").textContent()).includes("左根与右根方向不同"), "§3 nonsymmetric radical boundary missing");

  // §4: cinematic geometry, sign swap, collinear state, symplectic and non-symplectic transforms.
  await page.goto(`${baseURL}#ch10/symplectic-space`, { waitUntil: "networkidle" });
  await page.locator('[data-cinema-step="2"]').click();
  await page.waitForTimeout(980);
  assert((await page.locator("[data-cinema-caption]").textContent()).includes("保持有向面积"), "§4 cinematic shear explanation missing");
  await openDeepLab(page);
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

async function auditReducedMotion(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const assertNoPageErrors = await collectPageErrors(page, "reduced-motion-cinematic");
  await page.goto(`${baseURL}#ch10/symplectic-space`, { waitUntil: "networkidle" });
  const initial = await page.locator("[data-cinema-caption]").textContent();
  await page.locator('[data-cinema-step="1"]').click();
  await page.waitForTimeout(80);
  const changed = await page.locator("[data-cinema-caption]").textContent();
  assert(initial !== changed && changed.includes("方向顺序反转"), "reduced motion did not advance cinematic immediately");
  assertNoPageErrors();
  results.push({ label: "reduced-motion-cinematic", status: "passed" });
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

    for (const audit of [auditCinematicStories, auditMobileCinematicStories, auditInteractions, auditReducedMotion]) {
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
