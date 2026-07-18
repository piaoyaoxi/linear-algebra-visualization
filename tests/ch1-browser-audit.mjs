import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.CH1_BASE_URL || "http://127.0.0.1:4173";
const outputDir = process.env.CH1_EVIDENCE_DIR || "browser-evidence";
const sections = [
  "number-fields",
  "univariate-polynomials",
  "polynomial-divisibility",
  "gcd-polynomials",
  "factorization-theorem",
  "multiple-factors",
  "polynomial-functions",
  "complex-real-factorization",
  "rational-polynomials",
  "multivariate-polynomials",
  "symmetric-polynomials",
];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 820, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];
const themes = ["light", "dark"];

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = [];

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

async function clickIf(page, selector) {
  const locator = page.locator(selector).first();
  if (await locator.count()) await locator.click();
}

async function canvasSnapshot(locator) {
  return locator.evaluate((canvas) => canvas.toDataURL("image/png"));
}

async function canvasCornerLuminance(locator) {
  return locator.evaluate((canvas) => {
    const data = canvas.getContext("2d").getImageData(4, 4, 1, 1).data;
    return (data[0] + data[1] + data[2]) / 3;
  });
}

async function finishDivision(page, verifyMotion) {
  const next = page.locator("[data-next]").first();
  const canvas = page.locator("[data-division-canvas]").first();
  let checked = false;
  for (let i = 0; i < 8 && await next.count() && !(await next.isDisabled()); i += 1) {
    if (verifyMotion && !checked) {
      const before = await canvasSnapshot(canvas);
      await next.click();
      await page.waitForTimeout(220);
      const middle = await canvasSnapshot(canvas);
      await page.waitForFunction(() => {
        const button = document.querySelector("#polynomial-divisibility-interactive [data-next]");
        return button && !button.disabled;
      }, null, { timeout: 2200 }).catch(() => {});
      const after = await canvasSnapshot(canvas);
      ensure(before !== middle, "§3: clicking next did not create an intermediate animation frame");
      ensure(middle !== after, "§3: division animation jumped directly to the final frame");
      checked = true;
    } else {
      await next.click();
      await page.waitForFunction(() => {
        const button = document.querySelector("#polynomial-divisibility-interactive [data-next]");
        const status = document.querySelector("#polynomial-divisibility-interactive [data-status]")?.textContent || "";
        return (button && !button.disabled) || /整除成立|不整除/.test(status);
      }, null, { timeout: 2200 }).catch(() => {});
    }
  }
}

async function dragConjugateRoot(page) {
  const canvas = page.locator("[data-complex-canvas]").first();
  const box = await canvas.boundingBox();
  ensure(box, "§8: complex canvas has no visible bounding box");
  const pad = box.width < 520 ? 38 : 52;
  const usableW = box.width - 2 * pad;
  const usableH = box.height - 2 * pad;
  const toScreen = (x, y) => ({
    x: box.x + pad + ((x + 3) / 6) * usableW,
    y: box.y + pad + ((3 - y) / 6) * usableH,
  });
  const start = toScreen(1, 1.5);
  const end = toScreen(1.55, 0.9);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 8 });
  await page.mouse.up();
  const values = await page.evaluate(() => ({
    ar: Number(document.querySelector("#complex-real-factorization-interactive [data-re]")?.value),
    ai: Number(document.querySelector("#complex-real-factorization-interactive [data-im]")?.value),
    br: Number(document.querySelector("#complex-real-factorization-interactive [data-bre]")?.value),
    bi: Number(document.querySelector("#complex-real-factorization-interactive [data-bim]")?.value),
  }));
  ensure(Math.abs(values.ar - values.br) < 1e-9, "§8: conjugate root did not mirror the real coordinate during drag");
  ensure(Math.abs(values.ai + values.bi) < 1e-9, "§8: conjugate root did not mirror the imaginary coordinate during drag");
}

async function operateSection(page, section, viewport, theme) {
  if (section === "number-fields") {
    await clickIf(page, '[data-domain="P"]');
    await clickIf(page, '[data-domain="Q2"]');
  } else if (section === "univariate-polynomials") {
    await clickIf(page, '[data-mode="mul"]');
    const slider = page.locator("[data-k]");
    if (await slider.count()) await slider.fill("4");
    await clickIf(page, '[data-preset="fraction"]');
    await clickIf(page, '[data-mode="mul"]');
  } else if (section === "polynomial-divisibility") {
    await finishDivision(page, viewport.name === "desktop" && theme === "light");
  } else if (section === "gcd-polynomials") {
    const next = page.locator("[data-next]").first();
    for (let i = 0; i < 8 && await next.count() && !(await next.isDisabled()); i += 1) await next.click();
  } else if (section === "factorization-theorem") {
    await clickIf(page, '[data-domain="C"]');
    await clickIf(page, '[data-poly="x4p4"]');
    await clickIf(page, '[data-route-btn="1"]');
  } else if (section === "multiple-factors") {
    await clickIf(page, '[data-preset-m="3"]');
    await clickIf(page, '[data-mode="merge"]');
    await clickIf(page, "[data-merge-exact]");
  } else if (section === "polynomial-functions") {
    await clickIf(page, '[data-mode="roots"]');
    await clickIf(page, '[data-mode="interp"]');
  } else if (section === "complex-real-factorization") {
    if ((viewport.name === "desktop" && theme === "light") || (viewport.name === "mobile" && theme === "dark")) {
      await dragConjugateRoot(page);
    }
    await clickIf(page, '[data-mode="C"]');
    const re = page.locator("[data-re]");
    if (await re.count()) await re.fill("1.5");
    const status = await page.locator("[data-real-status]").textContent();
    ensure(/虚部/.test(status || ""), "§8: unlocking the pair did not explain the complex coefficient");
  } else if (section === "rational-polynomials") {
    await clickIf(page, '[data-rational-example="quartic"]');
    await clickIf(page, '[data-prime="2"]');
  } else if (section === "multivariate-polynomials") {
    await clickIf(page, '[data-lattice-mode="multiply"]');
    await clickIf(page, "[data-mul-demo]");
  } else if (section === "symmetric-polynomials") {
    await clickIf(page, "[data-cycle]");
    await clickIf(page, "[data-swap-xy]");
    await clickIf(page, "[data-rewrite-next]");
  }
  await page.waitForTimeout(100);
}

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedResponses = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  for (const theme of themes) {
    for (const section of sections) {
      consoleErrors.length = 0;
      pageErrors.length = 0;
      failedResponses.length = 0;
      await page.goto(`${baseUrl}/learn.html#ch1/${section}`, { waitUntil: "networkidle" });
      await page.locator(`#${section}-interactive .ch1-lab`).waitFor({ state: "visible" });

      const dark = await page.locator("body.dark").count();
      if ((theme === "dark") !== Boolean(dark)) await page.locator("#themeToggle").click();
      await operateSection(page, section, viewport, theme);

      const layout = await page.evaluate((sectionId) => {
        const lab = document.querySelector(`#${CSS.escape(sectionId)}-interactive .ch1-lab`);
        const doc = document.documentElement;
        return {
          documentOverflow: doc.scrollWidth - doc.clientWidth,
          labOverflow: lab ? lab.scrollWidth - lab.clientWidth : 999,
          guide: Boolean(lab?.querySelector(".ch1-learning-guide")),
          conclusion: Boolean(lab?.querySelector(".ch1-live-conclusion")),
          oldPlaceholder: /开发中|占位/.test(lab?.textContent || ""),
        };
      }, section);

      ensure(layout.documentOverflow <= 2, `${viewport.name}/${theme}/${section}: document horizontal overflow ${layout.documentOverflow}px`);
      ensure(layout.labOverflow <= 2, `${viewport.name}/${theme}/${section}: lab horizontal overflow ${layout.labOverflow}px`);
      ensure(layout.guide, `${viewport.name}/${theme}/${section}: missing learning guide`);
      ensure(layout.conclusion, `${viewport.name}/${theme}/${section}: missing live conclusion`);
      ensure(!layout.oldPlaceholder, `${viewport.name}/${theme}/${section}: placeholder wording leaked`);
      ensure(consoleErrors.length === 0, `${viewport.name}/${theme}/${section}: console errors: ${consoleErrors.join(" | ")}`);
      ensure(pageErrors.length === 0, `${viewport.name}/${theme}/${section}: page errors: ${pageErrors.join(" | ")}`);
      ensure(failedResponses.length === 0, `${viewport.name}/${theme}/${section}: failed resources: ${failedResponses.join(" | ")}`);

      if (section === "polynomial-divisibility") {
        ensure(await page.locator("[data-division-canvas]").count(), `${viewport.name}/${theme}/§3: continuous division canvas missing`);
        if (theme === "light") {
          const luminance = await canvasCornerLuminance(page.locator("[data-division-canvas]"));
          ensure(luminance > 145, `${viewport.name}/light/§3: canvas unexpectedly uses a dark presentation (${luminance})`);
        }
      }

      if (section === "complex-real-factorization") {
        ensure(await page.locator("[data-complex-canvas]").count(), `${viewport.name}/${theme}/§8: conjugate geometry canvas missing`);
        if (theme === "light") {
          const luminance = await canvasCornerLuminance(page.locator("[data-complex-canvas]"));
          ensure(luminance > 145, `${viewport.name}/light/§8: canvas unexpectedly uses a dark presentation (${luminance})`);
        }
      }

      if (section === "univariate-polynomials") {
        const coefficientLayout = await page.evaluate(() => {
          const lab = document.querySelector("#univariate-polynomials-interactive .ch1-lab");
          const f = [...lab.querySelectorAll("[data-f-strip] .ch1-strip-cell")].map((node) => node.getBoundingClientRect());
          const g = [...lab.querySelectorAll("[data-g-strip] .ch1-strip-cell")].map((node) => node.getBoundingClientRect());
          const workflow = lab.querySelector(".ch1-coeff-workflow");
          const graph = lab.querySelector(".ch1-graph-details");
          const analysis = lab.querySelector(".ch1-coeff-analysis");
          return {
            fCount: f.length,
            gCount: g.length,
            fRows: new Set(f.map((rect) => Math.round(rect.top))).size,
            gRows: new Set(g.map((rect) => Math.round(rect.top))).size,
            workflow: Boolean(workflow),
            graphAfterAnalysis: Boolean(graph && analysis && graph.getBoundingClientRect().top >= analysis.getBoundingClientRect().bottom - 2),
          };
        });
        ensure(coefficientLayout.fCount === 5 && coefficientLayout.gCount === 5, `${viewport.name}/${theme}/§2: coefficient inputs are incomplete`);
        ensure(coefficientLayout.workflow, `${viewport.name}/${theme}/§2: guided coefficient workflow missing`);
        ensure(coefficientLayout.graphAfterAnalysis, `${viewport.name}/${theme}/§2: graph still competes beside the coefficient editor`);
        if (viewport.width >= 760) {
          ensure(coefficientLayout.fRows === 1 && coefficientLayout.gRows === 1, `${viewport.name}/${theme}/§2: coefficient row wrapped unexpectedly`);
        }
      }

      if ((viewport.name === "desktop" && theme === "light") || (viewport.name === "mobile" && theme === "dark")) {
        const lab = page.locator(`#${section}-interactive .ch1-lab`);
        await lab.screenshot({ path: path.join(outputDir, `${viewport.name}-${theme}-${section}.png`) });
      }

      report.push({ viewport: viewport.name, theme, section, ...layout });
    }
  }
  await context.close();
}

const regression = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await regression.goto(`${baseUrl}/learn.html#ch4/matrix-language`, { waitUntil: "networkidle" });
ensure(await regression.locator("#matrix-language-formal").count(), "Chapter 4 matrix-language regression failed");
await regression.screenshot({ path: path.join(outputDir, "regression-ch4-matrix-language.png"), fullPage: true });
await regression.close();

await fs.writeFile(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));
await browser.close();
console.log(`Chapter 1 browser audit passed: ${report.length} route/theme/viewport checks.`);
