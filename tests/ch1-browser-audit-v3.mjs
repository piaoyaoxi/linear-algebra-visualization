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
const ensure = (condition, message) => { if (!condition) throw new Error(message); };

async function clickIf(page, selector) {
  const target = page.locator(selector).first();
  if (await target.count()) await target.click();
}

async function checkMath(page, section) {
  const result = await page.evaluate((sectionId) => {
    const lab = document.querySelector(`#${CSS.escape(sectionId)}-interactive .ch1-lab`);
    const wrappers = [...(lab?.querySelectorAll(".tex.tex-inline") || [])];
    const boxed = wrappers.filter((node) => {
      const style = getComputedStyle(node);
      const numeric = [
        style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth,
        style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft, style.borderTopLeftRadius,
      ].map((value) => parseFloat(value) || 0);
      return Math.max(...numeric) > 0.1 || !["transparent", "rgba(0, 0, 0, 0)"].includes(style.backgroundColor);
    }).length;
    const outsideMath = lab?.cloneNode(true);
    outsideMath?.querySelectorAll(".tex").forEach((node) => node.remove());
    return { boxed, wrappers: wrappers.length, raw: /\\frac|\^\{|_\{/.test(outsideMath?.textContent || "") };
  }, section);
  ensure(result.boxed === 0, `${section}: ${result.boxed}/${result.wrappers} formulas still have chip styling`);
  ensure(!result.raw, `${section}: raw LaTeX exists outside rendered formulas`);
}

async function division(page, verifyAnimation) {
  const lab = page.locator("#polynomial-divisibility-interactive");
  const next = lab.locator("[data-next]");
  ensure(await lab.locator("[data-division-svg]").count(), "§3: long-division SVG missing");
  ensure((await lab.locator("[data-division-svg] rect").count()) === 0, "§3: boxed coefficients remain in the SVG");
  ensure((await lab.locator(".ch1-strip-cell").count()) === 0, "§3: old coefficient cards remain mounted");

  if (verifyAnimation) {
    await lab.locator(".ch1-lab").screenshot({ path: path.join(outputDir, "desktop-light-division-initial.png") });
    const before = await lab.locator("[data-division-svg]").evaluate((node) => node.outerHTML);
    await next.click();
    await page.waitForTimeout(230);
    const progress = Number(await lab.locator("[data-division-svg]").getAttribute("data-animation-progress"));
    ensure(progress > 0 && progress < 1, `§3: intermediate frame missing (${progress})`);
    await lab.locator(".ch1-lab").screenshot({ path: path.join(outputDir, "desktop-light-division-mid-animation.png") });
    const middle = await lab.locator("[data-division-svg]").evaluate((node) => node.outerHTML);
    ensure(before !== middle, "§3: animation did not change the scene");
    await page.waitForFunction(() => {
      const root = document.querySelector("#polynomial-divisibility-interactive");
      return !root?.querySelector("[data-next]")?.disabled && Number(root?.querySelector("[data-division-svg]")?.dataset.animationProgress || 0) === 0;
    }, null, { timeout: 2800 });
    const after = await lab.locator("[data-division-svg]").evaluate((node) => node.outerHTML);
    ensure(middle !== after, "§3: middle and final frames are identical");
    await lab.locator("[data-prev]").click();
    ensure((await lab.locator("[data-step]").textContent())?.startsWith("1/"), "§3: previous did not restore the initial scene");
    await next.click();
    await page.waitForFunction(() => !document.querySelector("#polynomial-divisibility-interactive [data-next]")?.disabled, null, { timeout: 2800 });
  }

  for (let i = 0; i < 8; i += 1) {
    if (await next.isDisabled()) break;
    await next.click();
    await page.waitForFunction(() => {
      const root = document.querySelector("#polynomial-divisibility-interactive");
      return /整除成立|不整除/.test(root?.querySelector("[data-status]")?.textContent || "") || !root?.querySelector("[data-next]")?.disabled;
    }, null, { timeout: 2800 });
  }
  ensure(/整除成立|不整除/.test((await lab.locator("[data-status]").textContent()) || ""), "§3: no final division conclusion");
  if (verifyAnimation) {
    await lab.locator('[data-preset="divides"]').click();
    ensure((await lab.locator("[data-step]").textContent())?.startsWith("1/"), "§3: preset did not reset the process");
  }
}

async function dragConjugate(page) {
  const canvas = page.locator("[data-complex-canvas]");
  const box = await canvas.boundingBox();
  ensure(box, "§8: complex canvas not visible");
  const pad = box.width < 520 ? 38 : 52;
  const point = (x, y) => ({
    x: box.x + pad + ((x + 3) / 6) * (box.width - 2 * pad),
    y: box.y + pad + ((3 - y) / 6) * (box.height - 2 * pad),
  });
  const start = point(1, 1.5), end = point(1.55, 0.9);
  await page.mouse.move(start.x, start.y); await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 8 }); await page.mouse.up();
  const v = await page.evaluate(() => ["re", "im", "bre", "bim"].map((key) => Number(document.querySelector(`[data-${key}]`)?.value)));
  ensure(Math.abs(v[0] - v[2]) < 1e-9 && Math.abs(v[1] + v[3]) < 1e-9, "§8: conjugate mirroring failed");
}

async function operate(page, section, viewport, theme) {
  const detail = (viewport.name === "desktop" && theme === "light") || (viewport.name === "mobile" && theme === "dark");
  if (section === "number-fields") {
    await clickIf(page, '[data-domain="P"]'); await clickIf(page, '[data-domain="Q2"]');
  } else if (section === "univariate-polynomials") {
    await clickIf(page, '[data-mode="mul"]'); if (await page.locator("[data-k]").count()) await page.locator("[data-k]").fill("4");
    await clickIf(page, '[data-preset="fraction"]'); await clickIf(page, '[data-mode="mul"]');
  } else if (section === "polynomial-divisibility") {
    await division(page, viewport.name === "desktop" && theme === "light");
  } else if (section === "gcd-polynomials") {
    const next = page.locator("[data-next]"); for (let i = 0; i < 8 && !(await next.isDisabled()); i += 1) await next.click();
    ensure((await page.locator("[data-verify] .tex-inline").count()) === 1, "§4: Bezout identity is fragmented");
  } else if (section === "factorization-theorem") {
    await clickIf(page, '[data-domain="C"]'); await clickIf(page, '[data-poly="x4p4"]'); await clickIf(page, '[data-route-btn="1"]');
  } else if (section === "multiple-factors") {
    if (detail) await page.locator("#multiple-factors-interactive .ch1-lab").screenshot({ path: path.join(outputDir, `${viewport.name}-${theme}-multiple-factors-formulas.png`) });
    await clickIf(page, '[data-preset-m="3"]'); await clickIf(page, '[data-mode="merge"]'); await clickIf(page, "[data-merge-exact]");
  } else if (section === "polynomial-functions") {
    if (detail) await page.locator("#polynomial-functions-interactive .ch1-lab").screenshot({ path: path.join(outputDir, `${viewport.name}-${theme}-horner.png`) });
    await clickIf(page, '[data-mode="roots"]'); await clickIf(page, '[data-mode="interp"]');
  } else if (section === "complex-real-factorization") {
    if (detail) await dragConjugate(page); await clickIf(page, '[data-mode="C"]');
    if (await page.locator("[data-re]").count()) await page.locator("[data-re]").fill("1.5");
    ensure(/虚部/.test((await page.locator("[data-real-status]").textContent()) || ""), "§8: unlocked coefficient explanation missing");
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
  const consoleErrors = [], pageErrors = [], failed = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });

  for (const theme of themes) {
    for (const section of sections) {
      consoleErrors.length = pageErrors.length = failed.length = 0;
      await page.goto(`${baseUrl}/learn.html#ch1/${section}`, { waitUntil: "networkidle" });
      const lab = page.locator(`#${section}-interactive .ch1-lab`);
      await lab.waitFor({ state: "visible" });
      if ((theme === "dark") !== Boolean(await page.locator("body.dark").count())) await page.locator("#themeToggle").click();
      await checkMath(page, section); await operate(page, section, viewport, theme); await checkMath(page, section);
      const layout = await page.evaluate((id) => {
        const node = document.querySelector(`#${CSS.escape(id)}-interactive .ch1-lab`);
        return {
          documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          labOverflow: node ? node.scrollWidth - node.clientWidth : 999,
          guide: Boolean(node?.querySelector(".ch1-learning-guide")), conclusion: Boolean(node?.querySelector(".ch1-live-conclusion")),
          placeholder: /开发中|占位/.test(node?.textContent || ""),
        };
      }, section);
      ensure(layout.documentOverflow <= 2 && layout.labOverflow <= 2, `${viewport.name}/${theme}/${section}: horizontal overflow`);
      ensure(layout.guide && layout.conclusion && !layout.placeholder, `${viewport.name}/${theme}/${section}: guided structure failed`);
      ensure(!consoleErrors.length && !pageErrors.length && !failed.length, `${viewport.name}/${theme}/${section}: browser errors ${[...consoleErrors, ...pageErrors, ...failed].join(" | ")}`);
      if ((viewport.name === "desktop" && theme === "light") || (viewport.name === "mobile" && theme === "dark")) {
        await lab.screenshot({ path: path.join(outputDir, `${viewport.name}-${theme}-${section}.png`) });
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
