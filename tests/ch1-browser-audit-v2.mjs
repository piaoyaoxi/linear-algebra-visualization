import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.CH1_BASE_URL || "http://127.0.0.1:4173";
const outputDir = process.env.CH1_EVIDENCE_DIR || "browser-evidence";
const sections = [
  "number-fields", "univariate-polynomials", "polynomial-divisibility", "gcd-polynomials",
  "factorization-theorem", "multiple-factors", "polynomial-functions", "complex-real-factorization",
  "rational-polynomials", "multivariate-polynomials", "symmetric-polynomials",
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

async function assertUnboxedMath(page, section) {
  const result = await page.evaluate((sectionId) => {
    const lab = document.querySelector(`#${CSS.escape(sectionId)}-interactive .ch1-lab`);
    const wrappers = [...(lab?.querySelectorAll(".tex.tex-inline") || [])];
    const invalid = wrappers.filter((node) => {
      const style = getComputedStyle(node);
      const values = [
        style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth,
        style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft,
        style.borderTopLeftRadius,
      ].map((value) => parseFloat(value) || 0);
      const opaque = !["rgba(0, 0, 0, 0)", "transparent"].includes(style.backgroundColor);
      return Math.max(...values) > 0.1 || opaque;
    });
    const visibleClone = lab?.cloneNode(true);
    visibleClone?.querySelectorAll(".katex-mathml, annotation").forEach((node) => node.remove());
    return {
      wrappers: wrappers.length,
      invalid: invalid.length,
      rawLatex: /\\frac|\^\{|_\{/.test(visibleClone?.textContent || ""),
    };
  }, section);
  ensure(result.invalid === 0, `${section}: ${result.invalid}/${result.wrappers} inline formulas are still chips`);
  ensure(!result.rawLatex, `${section}: raw LaTeX leaked into visible text`);
}

async function canvasLuminance(locator) {
  return locator.evaluate((canvas) => {
    const data = canvas.getContext("2d").getImageData(4, 4, 1, 1).data;
    return (data[0] + data[1] + data[2]) / 3;
  });
}

async function finishDivision(page, verifyMotion) {
  const section = page.locator("#polynomial-divisibility-interactive");
  const next = section.locator("[data-next]").first();
  ensure(await section.locator("[data-division-svg]").count(), "§3: standard long-division SVG missing");
  ensure((await section.locator("[data-division-svg] rect").count()) === 0, "§3: coefficient rectangles leaked into SVG");
  ensure((await section.locator(".ch1-strip-cell").count()) === 0, "§3: old coefficient cards are still mounted");

  if (verifyMotion) {
    await section.locator(".ch1-lab").screenshot({ path: path.join(outputDir, "desktop-light-division-initial.png") });
    const before = await section.locator("[data-division-svg]").evaluate((node) => node.outerHTML);
    await next.click();
    await page.waitForTimeout(230);
    const midSvg = section.locator("[data-division-svg]");
    const progress = Number(await midSvg.getAttribute("data-animation-progress"));
    ensure(progress > 0 && progress < 1, `§3: no intermediate animation frame, progress=${progress}`);
    await section.locator(".ch1-lab").screenshot({ path: path.join(outputDir, "desktop-light-division-mid-animation.png") });
    const middle = await midSvg.evaluate((node) => node.outerHTML);
    ensure(before !== middle, "§3: first click did not change the long-division scene");
    await page.waitForFunction(() => {
      const lab = document.querySelector("#polynomial-divisibility-interactive");
      return !lab?.querySelector("[data-next]")?.disabled && Number(lab?.querySelector("[data-division-svg]")?.dataset.animationProgress || 0) === 0;
    }, null, { timeout: 2800 });
    const after = await section.locator("[data-division-svg]").evaluate((node) => node.outerHTML);
    ensure(middle !== after, "§3: intermediate and completed frames are identical");
    await section.locator("[data-prev]").click();
    ensure((await section.locator("[data-step]").textContent())?.startsWith("1/"), "§3: previous did not restore step 1");
    await next.click();
    await page.waitForFunction(() => !document.querySelector("#polynomial-divisibility-interactive [data-next]")?.disabled, null, { timeout: 2800 });
  }

  for (let i = 0; i < 8; i += 1) {
    if (await next.isDisabled()) break;
    await next.click();
    await page.waitForFunction(() => {
      const lab = document.querySelector("#polynomial-divisibility-interactive");
      const terminal = /整除成立|不整除/.test(lab?.querySelector("[data-status]")?.textContent || "");
      return terminal || !lab?.querySelector("[data-next]")?.disabled;
    }, null, { timeout: 2800 });
  }
  ensure(/整除成立|不整除/.test((await section.locator("[data-status]").textContent()) || ""), "§3: no terminal conclusion");

  if (verifyMotion) {
    await section.locator('[data-preset="divides"]').click();
    ensure((await section.locator("[data-step]").textContent())?.startsWith("1/"), "§3: preset did not reset steps");
    ensure((await section.locator("[data-title]").textContent())?.includes("x³−1"), "§3: divisible example did not load");
  }
}

async function dragConjugate(page) {
  const canvas = page.locator("[data-complex-canvas]").first();
  const box = await canvas.boundingBox();
  ensure(box, "§8: complex canvas is not visible");
  const pad = box.width < 520 ? 38 : 52;
  const toScreen = (x, y) => ({
    x: box.x + pad + ((x + 3) / 6) * (box.width - 2 * pad),
    y: box.y + pad + ((3 - y) / 6) * (box.height - 2 * pad),
  });
  const start = toScreen(1, 1.5);
  const end = toScreen(1.55, 0.9);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 8 });
  await page.mouse.up();
  const values = await page.evaluate(() => ({
    ar: Number(document.querySelector("[data-re]")?.value), ai: Number(document.querySelector("[data-im]")?.value),
    br: Number(document.querySelector("[data-bre]")?.value), bi: Number(document.querySelector("[data-bim]")?.value),
  }));
  ensure(Math.abs(values.ar - values.br) < 1e-9 && Math.abs(values.ai + values.bi) < 1e-9, "§8: conjugate mirror failed");
}

async function operate(page, section, viewport, theme) {
  const detail = (viewport.name === "desktop" && theme === "light") || (viewport.name === "mobile" && theme === "dark");
  if (section === "number-fields") {
    await clickIf(page, '[data-domain="P"]'); await clickIf(page, '[data-domain="Q2"]');
  } else if (section === "univariate-polynomials") {
    await clickIf(page, '[data-mode="mul"]');
    if (await page.locator("[data-k]").count()) await page.locator("[data-k]").fill("4");
    await clickIf(page, '[data-preset="fraction"]'); await clickIf(page, '[data-mode="mul"]');
  } else if (section === "polynomial-divisibility") {
    await finishDivision(page, viewport.name === "desktop" && theme === "light");
  } else if (section === "gcd-polynomials") {
    const next = page.locator("[data-next]").first();
    for (let i = 0; i < 8 && !(await next.isDisabled()); i += 1) await next.click();
    ensure((await page.locator("[data-verify] .tex-inline").count()) === 1, "§4: Bezout identity is split into several formula wrappers");
  } else if (section === "factorization-theorem") {
    await clickIf(page, '[data-domain="C"]'); await clickIf(page, '[data-poly="x4p4"]'); await clickIf(page, '[data-route-btn="1"]');
  } else if (section === "multiple-factors") {
    if (detail) await page.locator("#multiple-factors-interactive .ch1-lab").screenshot({ path: path.join(outputDir, `${viewport.name}-${theme}-multiple-factors-formulas.png`) });
    await clickIf(page, '[data-preset-m="3"]'); await clickIf(page, '[data-mode="merge"]'); await clickIf(page, "[data-merge-exact]");
  } else if (section === "polynomial-functions") {
    if (detail) await page.locator("#polynomial-functions-interactive .ch1-lab").screenshot({ path: path.join(outputDir, `${viewport.name}-${theme}-horner.png`) });
    await clickIf(page, '[data-mode="roots"]'); await clickIf(page, '[data-mode="interp"]');
  } else if (section === "complex-real-factorization") {
    if (detail) await dragConjugate(page);
    await clickIf(page, '[data-mode="C"]');
    if (await page.locator("[data-re]").count()) await page.locator("[data-re]").fill("1.5");
    ensure(/虚部/.test((await page.locator("[data-real-status]").textContent()) || ""), "§8: unlocked mode did not explain the imaginary coefficients");
  } else if (section === "rational-polynomials") {
    await clickIf(page, '[data-rational-example="quartic"]'); await clickIf(page, '[data-prime="2"]');
  } else if (section === "multivariate-polynomials") {
    await clickIf(page, '[data-lattice-mode="multiply"]'); await clickIf(page, "[data-mul-demo]");
  } else if (section === "symmetric-polynomials") {
    await clickIf(page, "[data-cycle]"); await clickIf(page, "[data-swap-xy]"); await clickIf(page, "[data-rewrite-next]");
  }
  await page.waitForTimeout(100);
}

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleErrors = [], pageErrors = [], failedResponses = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => { if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`); });

  for (const theme of themes) {
    for (const section of sections) {
      consoleErrors.length = pageErrors.length = failedResponses.length = 0;
      await page.goto(`${baseUrl}/learn.html#ch1/${section}`, { waitUntil: "networkidle" });
      await page.locator(`#${section}-interactive .ch1-lab`).waitFor({ state: "visible" });
      const dark = Boolean(await page.locator("body.dark").count());
      if ((theme === "dark") !== dark) await page.locator("#themeToggle").click();
      await assertUnboxedMath(page, section);
      await operate(page, section, viewport, theme);
      await assertUnboxedMath(page, section);

      const layout = await page.evaluate((sectionId) => {
        const lab = document.querySelector(`#${CSS.escape(sectionId)}-interactive .ch1-lab`);
        return {
          documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          labOverflow: lab ? lab.scrollWidth - lab.clientWidth : 999,
          guide: Boolean(lab?.querySelector(".ch1-learning-guide")),
          conclusion: Boolean(lab?.querySelector(".ch1-live-conclusion")),
          placeholder: /开发中|占位/.test(lab?.textContent || ""),
        };
      }, section);
      ensure(layout.documentOverflow <= 2, `${viewport.name}/${theme}/${section}: document overflow ${layout.documentOverflow}px`);
      ensure(layout.labOverflow <= 2, `${viewport.name}/${theme}/${section}: lab overflow ${layout.labOverflow}px`);
      ensure(layout.guide && layout.conclusion && !layout.placeholder, `${viewport.name}/${theme}/${section}: guided learning structure failed`);
      ensure(!consoleErrors.length && !pageErrors.length && !failedResponses.length, `${viewport.name}/${theme}/${section}: browser errors ${[...consoleErrors, ...pageErrors, ...failedResponses].join(" | ")}`);

      if (section === "complex-real-factorization" && theme === "light") {
        ensure((await canvasLuminance(page.locator("[data-complex-canvas]"))) > 145, `${viewport.name}/light/§8: unexpectedly dark canvas`);
      }
      if (section === "univariate-polynomials") {
        const coefficientLayout = await page.evaluate(() => {
          const lab = document.querySelector("#univariate-polynomials-interactive .ch1-lab");
          const rows = (selector) => new Set([...lab.querySelectorAll(selector)].map((node) => Math.round(node.getBoundingClientRect().top))).size;
          return {
            fCount: lab.querySelectorAll("[data-f-strip] .ch1-strip-cell").length,
            gCount: lab.querySelectorAll("[data-g-strip] .ch1-strip-cell").length,
            fRows: rows("[data-f-strip] .ch1-strip-cell"), gRows: rows("[data-g-strip] .ch1-strip-cell"),
            workflow: Boolean(lab.querySelector(".ch1-coeff-workflow")),
          };
        });
        ensure(coefficientLayout.fCount === 5 && coefficientLayout.gCount === 5 && coefficientLayout.workflow, `${viewport.name}/${theme}/§2: coefficient workflow failed`);
        if (viewport.width >= 760) ensure(coefficientLayout.fRows === 1 && coefficientLayout.gRows === 1, `${viewport.name}/${theme}/§2: coefficient rows wrapped`);
      }

      if ((viewport.name === "desktop" && theme === "light") || (viewport.name === "mobile" && theme === "dark")) {
        await page.locator(`#${section}-interactive .ch1-lab`).screenshot({ path: path.join(outputDir, `${viewport.name}-${theme}-${section}.png`) });
      }
      report.push({ viewport: viewport.name, theme, section, ...layout });
    }
  }
  await context.close();
}

const regression = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await regression.goto(`${baseUrl}/learn.html#ch4/matrix-language`, { waitUntil: "networkidle" });
ensure(await regression.locator("#matrix-language-formal").count(), "Chapter 4 regression failed");
await regression.screenshot({ path: path.join(outputDir, "regression-ch4-matrix-language.png"), fullPage: true });
await regression.close();
await fs.writeFile(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));
await browser.close();
console.log(`Chapter 1 browser audit passed: ${report.length} states.`);
