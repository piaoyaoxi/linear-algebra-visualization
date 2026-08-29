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
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CH1_BROWSER_EXECUTABLE ? { executablePath: process.env.CH1_BROWSER_EXECUTABLE } : {}),
});
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
    const rawText = outsideMath?.textContent || "";
    const rawMatch = rawText.match(/.{0,50}(?:\\frac|\^\{|_\{).{0,80}/s);
    return { boxed, wrappers: wrappers.length, raw: Boolean(rawMatch), rawSnippet: rawMatch?.[0] || "" };
  }, section);
  ensure(result.boxed === 0, `${section}: ${result.boxed}/${result.wrappers} formulas still have chip styling`);
  ensure(!result.raw, `${section}: raw LaTeX exists outside rendered formulas (${result.rawSnippet.replace(/\s+/g, " ")})`);
}

async function checkVisibleText(page, section) {
  const result = await page.evaluate((sectionId) => {
    const lab = document.querySelector(`#${CSS.escape(sectionId)}-interactive .ch1-lab`);
    if (!lab) return { clipped: ["lab missing"] };
    const candidates = [...lab.querySelectorAll("h3, h4, p, strong, output, [data-title], [data-step]")];
    const clipped = candidates.filter((node) => {
      const style = getComputedStyle(node);
      const hidden = ["hidden", "clip"].includes(style.overflowX) || ["hidden", "clip"].includes(style.overflow);
      return hidden && node.scrollWidth > node.clientWidth + 2;
    }).slice(0, 8).map((node) => `${node.tagName}:${(node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80)}`);
    return { clipped };
  }, section);
  ensure(result.clipped.length === 0, `${section}: clipped visible text ${result.clipped.join(" | ")}`);
}

async function checkLearningArchitecture(page, section) {
  const result = await page.evaluate((sectionId) => {
    const interactive = document.querySelector(`#${CSS.escape(sectionId)}-interactive`);
    const formal = document.querySelector(`#${CSS.escape(sectionId)}-formal`);
    const example = document.querySelector(`#${CSS.escape(sectionId)}-example`);
    const challenge = example?.querySelector("[data-example-challenge]");
    const question = challenge?.querySelector(".example-challenge-question");
    const explanation = challenge?.querySelector("[data-example-explanation]");
    const liveObservation = interactive?.querySelector("[data-ch1-live-result]");
    return {
      experimentBeforeTheory: Boolean(interactive && formal && (interactive.compareDocumentPosition(formal) & Node.DOCUMENT_POSITION_FOLLOWING)),
      bridge: Boolean(formal?.querySelector(".ch1-experiment-bridge")),
      theorem: Boolean(formal?.querySelector(".ch1-theorem-block")),
      proofSteps: formal?.querySelectorAll(".ch1-proof-spine li").length || 0,
      boundary: Boolean(formal?.querySelector(".ch1-boundary-case")),
      challenge: Boolean(challenge),
      questionVisible: Boolean(question && question.getClientRects().length),
      answerHidden: Boolean(explanation?.hidden),
      liveObservationVisible: Boolean(liveObservation && liveObservation.getClientRects().length && liveObservation.textContent?.trim()),
    };
  }, section);
  ensure(result.experimentBeforeTheory, `${section}: experiment must appear before theory`);
  ensure(result.bridge && result.theorem && result.proofSteps >= 4 && result.boundary, `${section}: deep theory structure is incomplete`);
  ensure(result.challenge && result.questionVisible && result.answerHidden, `${section}: representative example is not properly gated`);
  ensure(result.liveObservationVisible, `${section}: current observation is hidden or empty`);
}

async function checkMathBoundaries(page, section) {
  if (section === "number-fields") {
    await clickIf(page, '[data-domain="Q2"]');
    await clickIf(page, '[data-polynomial="x2msqrt2"]');
    const stage = page.locator('[data-field-stage="Q2"]');
    ensure(/不可约/.test((await stage.textContent()) || ""), "§1: x²−√2 is not marked irreducible over Q(√2)");
  } else if (section === "factorization-theorem") {
    await clickIf(page, '[data-domain="Q"]');
    await clickIf(page, '[data-poly="x4p4"]');
    const routeA = (await page.locator("#factorization-theorem-interactive .ch1-factor-route").textContent()) || "";
    await clickIf(page, '[data-route-btn="1"]');
    const routeB = (await page.locator("#factorization-theorem-interactive .ch1-factor-route").textContent()) || "";
    const standards = await page.locator("[data-standard] strong").allTextContents();
    ensure(routeA !== routeB, "§5: the two x⁴+4 derivations are not independent");
    ensure(standards.length === 2 && standards.every(Boolean) && standards[0].replace(/\s+/g, "") === standards[1].replace(/\s+/g, ""), "§5: route leaves were not normalized and sorted independently");
    ensure((await page.locator("[data-route-step]").count()) >= 2, "§5: selected route does not expose its intermediate derivation");
    ensure((await page.locator(".ch1-route-step-index").first().textContent()) === "步骤 1", "§5: route index is fused with the formula");
    ensure((await page.locator(".ch1-route-factor-product").count()) >= 1, "§5: long factor products cannot wrap on narrow screens");
    ensure(/一致/.test((await page.locator("[data-unique]").textContent()) || ""), "§5: normalized leaf multisets disagree");
  } else if (section === "multiple-factors") {
    await page.locator("[data-a]").fill("-1");
    await page.locator("[data-m]").fill("2");
    const gcd = ((await page.locator("[data-gcd]").textContent()) || "").replace(/\s+/g, "");
    ensure(!/\^?2/.test(gcd) && /x/.test(gcd), `§6: adjustable root collided with the fixed root (${gcd})`);
    ensure((await page.locator("[data-derivatives] tr").count()) === 3, "§6: derivative table continues after the first nonzero derivative");
    ensure(/首次非零/.test((await page.locator("[data-derivatives] tr").last().textContent()) || ""), "§6: multiplicity witness is not identified");
  } else if (section === "polynomial-functions") {
    await clickIf(page, '[data-mode="roots"]');
    await page.locator("[data-degree]").fill("3");
    await page.locator("[data-root-count]").fill("0");
    ensure(/至少有一个实根/.test((await page.locator("[data-root-status]").textContent()) || ""), "§7: odd-degree zero-real-root case was accepted");
    await page.locator("[data-degree]").fill("4");
    ensure(/可以构造恰有 0 个/.test((await page.locator("[data-root-status]").textContent()) || ""), "§7: even-degree zero-real-root construction failed");
    ensure((await page.locator("[data-canvas]").getAttribute("data-visual")) === "root-construction", "§7: valid root construction is shown as an empty axis");
  } else if (section === "rational-polynomials") {
    const values = await page.locator("[data-common-denominator], [data-cleared-poly], [data-content], [data-primitive]").allTextContents();
    ensure(values.length === 4 && values.every((value) => value.trim()), "§9: normalization workbench is incomplete");
    ensure(/=/.test((await page.locator("[data-normalization-check]").textContent()) || ""), "§9: normalization equality is missing");
  } else if (section === "multivariate-polynomials") {
    await clickIf(page, '[data-lattice-mode="multiply"]');
    ensure((await page.locator("[data-coefficient-ledger] tr").count()) === 2, "§10: x³y coefficient ledger should have two contributions");
    ensure(((await page.locator("[data-target-coefficient]").textContent()) || "").trim() === "1", "§10: x³y coefficient should aggregate to 1");
    await clickIf(page, '[data-lattice-mode="support"]');
  } else if (section === "symmetric-polynomials") {
    const sigmas = await page.locator("[data-vieta-sigma1], [data-vieta-sigma2], [data-vieta-sigma3]").allTextContents();
    ensure(sigmas.join(",") === "6,11,6", `§11: Vieta elementary symmetric values are wrong (${sigmas.join(",")})`);
    const polynomial = ((await page.locator("[data-vieta-polynomial]").textContent()) || "").replace(/\s+/g, "");
    ensure(polynomial.includes("6") && polynomial.includes("11") && polynomial.endsWith("−6"), `§11: Vieta polynomial is incomplete (${polynomial})`);
  }
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
  if ((await page.viewportSize()).width < 760) {
    const scrollLeft = await lab.locator(".ch1-long-division-scroll").evaluate((node) => node.scrollLeft);
    ensure(scrollLeft > 0, "§3 mobile: long division did not follow the low-degree remainder");
  }
  if (verifyAnimation) {
    await lab.locator('[data-preset="divides"]').click();
    ensure((await lab.locator("[data-step]").textContent())?.startsWith("1/"), "§3: preset did not reset the process");
  }
}

async function checkDivisionSummary(page, viewport) {
  const result = await page.evaluate(() => {
    const title = document.querySelector("#polynomial-divisibility-interactive [data-title]");
    const first = title?.parentElement;
    return {
      text: title?.textContent || "",
      titleOverflow: title ? title.scrollWidth - title.clientWidth : 999,
      parentOverflow: first ? first.scrollWidth - first.clientWidth : 999,
      overflowX: title ? getComputedStyle(title).overflowX : "missing",
    };
  });
  ensure(result.text.includes("x²+x+1"), `§3: example formula is incomplete: ${result.text}`);
  if (viewport.width >= 760) {
    ensure(result.titleOverflow <= 2 && result.parentOverflow <= 2, `§3: example formula is visually clipped (${result.titleOverflow}/${result.parentOverflow})`);
  } else {
    ensure(result.titleOverflow <= 2 || ["auto", "scroll"].includes(result.overflowX), "§3 mobile: formula overflow has no readable scroll path");
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

async function checkMultivariateLayout(page, viewport) {
  const result = await page.evaluate(() => {
    const primary = document.querySelector("#multivariate-polynomials-interactive .ch1-multivariate-primary");
    const stage = primary?.querySelector(".ch1-multivariate-stage");
    const inspector = primary?.querySelector(".ch1-multivariate-inspector");
    const support = document.querySelector("#multivariate-polynomials-interactive [data-support-module]");
    const p = primary?.getBoundingClientRect();
    const s = stage?.getBoundingClientRect();
    const i = inspector?.getBoundingClientRect();
    const m = support?.getBoundingClientRect();
    return {
      primary: Boolean(primary),
      stage: Boolean(stage),
      inspector: Boolean(inspector),
      support: Boolean(support),
      sameRow: s && i ? Math.abs(s.top - i.top) <= 3 : false,
      heightDiff: s && i ? Math.abs(s.height - i.height) : 999,
      supportBelow: p && m ? m.top >= p.bottom - 2 : false,
      primaryBottom: p?.bottom || 0,
      supportTop: m?.top || 0,
      legacyGrid: Boolean(document.querySelector("#multivariate-polynomials-interactive .ch1-lab-grid")),
    };
  });
  ensure(result.primary && result.stage && result.inspector && result.support, "§10: rebuilt workspace is incomplete");
  ensure(!result.legacyGrid, "§10: legacy two-column lab grid still mounted");
  ensure(result.supportBelow, `§10: explanation modules still compete beside the main graph (${result.supportTop}/${result.primaryBottom})`);
  if (viewport.width > 1040) {
    ensure(result.sameRow && result.heightDiff <= 4, `§10 desktop: main graph and inspector are unbalanced (${result.heightDiff}px)`);
  } else {
    ensure(!result.sameRow, "§10 tablet/mobile: graph and inspector should stack instead of squeezing");
  }
}

async function operate(page, section, viewport, theme) {
  const detail = (viewport.name === "desktop" && theme === "light") || (viewport.name === "mobile" && theme === "dark");
  if (section === "number-fields") {
    await clickIf(page, '[data-domain="P"]'); await clickIf(page, '[data-domain="Q2"]');
  } else if (section === "univariate-polynomials") {
    await clickIf(page, '[data-mode="mul"]'); if (await page.locator("[data-k]").count()) await page.locator("[data-k]").fill("4");
    await clickIf(page, '[data-preset="fraction"]'); await clickIf(page, '[data-mode="mul"]');
  } else if (section === "polynomial-divisibility") {
    await checkDivisionSummary(page, viewport);
    await division(page, viewport.name === "desktop" && theme === "light");
  } else if (section === "gcd-polynomials") {
    ensure((await page.locator("[data-ledger] > div").count()) === 1, "§4: future Euclidean steps are revealed before interaction");
    ensure(/正在取余/.test((await page.locator("[data-coprime]").textContent()) || ""), "§4: initial state reveals the final coprimality result");
    const next = page.locator("[data-next]"); for (let i = 0; i < 8 && !(await next.isDisabled()); i += 1) await next.click();
    const [shownSteps, totalSteps] = ((await page.locator("[data-step]").textContent()) || "0/0").split("/").map(Number);
    ensure(shownSteps === totalSteps && (await page.locator("[data-ledger] > div").count()) === totalSteps, "§4: completed Euclidean ledger is incomplete");
    ensure(/Bézout 证书/.test((await page.locator("[data-certificate-title]").textContent()) || ""), "§4: final certificate label is missing");
    ensure((await page.locator("[data-verify] .tex-inline").count()) === 1, "§4: Bezout identity is fragmented");
  } else if (section === "factorization-theorem") {
    await clickIf(page, '[data-domain="C"]'); await clickIf(page, '[data-poly="x4p4"]'); await clickIf(page, '[data-route-btn="1"]');
  } else if (section === "multiple-factors") {
    if (detail) await page.locator("#multiple-factors-interactive .ch1-lab").screenshot({ path: path.join(outputDir, `${viewport.name}-${theme}-multiple-factors-formulas.png`) });
    await clickIf(page, '[data-preset-m="3"]');
    ensure((await page.locator("[data-derivatives] tr").count()) === 4, "§6: m=3 derivative witness is incomplete");
    await clickIf(page, '[data-mode="merge"]');
    ensure((await page.locator("[data-derivatives] tr").count()) === 2 && /互素/.test((await page.locator("[data-observation]").textContent()) || ""), "§6: two distinct roots were treated as a multiple root");
    await clickIf(page, "[data-merge-exact]");
    ensure((await page.locator("[data-derivatives] tr").count()) === 3 && /二阶导数首次非零/.test((await page.locator("[data-observation]").textContent()) || ""), "§6: exact root merge did not produce the double-root witness");
    ensure(!/107|\\frac/.test((await page.locator("[data-ch1-live-result]").textContent()) || ""), "§6: flattened fraction leaked into the live observation");
  } else if (section === "polynomial-functions") {
    if (detail) await page.locator("#polynomial-functions-interactive .ch1-lab").screenshot({ path: path.join(outputDir, `${viewport.name}-${theme}-horner.png`) });
    await clickIf(page, '[data-mode="roots"]'); await clickIf(page, '[data-mode="interp"]');
    ensure((await page.locator(".ch1-basis-values > span").count()) === 9 && (await page.locator(".ch1-basis-values > span.is-on").count()) === 3, "§7: Lagrange basis values at the nodes are missing");
    await page.locator('[data-node-x="1"]').fill("0"); await page.locator('[data-node-x="1"]').dispatchEvent("change");
    ensure(/横坐标必须互不相同/.test((await page.locator("[data-interp-error]").textContent()) || "") && await page.locator("[data-interp-output]").isHidden(), "§7: conflicting interpolation nodes leave a stale answer visible");
    await page.locator('[data-node-x="1"]').fill("1"); await page.locator('[data-node-x="1"]').dispatchEvent("change");
    ensure(await page.locator("[data-interp-output]").isVisible() && !/x2\+1/.test((await page.locator("[data-ch1-live-result]").textContent()) || ""), "§7: valid interpolation result or readable observation was not restored");
  } else if (section === "complex-real-factorization") {
    if (detail) await dragConjugate(page); await clickIf(page, '[data-mode="C"]');
    if (await page.locator("[data-re]").count()) await page.locator("[data-re]").fill("1.5");
    ensure(/虚部/.test((await page.locator("[data-real-status]").textContent()) || ""), "§8: unlocked coefficient explanation missing");
    ensure(/不属于 R\[x\]/.test((await page.locator("[data-observation]").textContent()) || ""), "§8: live observation does not identify the failed real-coefficient condition");
    ensure(!/CONJUGATE ROOTS/.test((await page.locator(".ch1-motion-head").textContent()) || "") && !/x2[−+-]/.test((await page.locator("[data-ch1-live-result]").textContent()) || ""), "§8: English heading or flattened quadratic leaked into the student view");
  } else if (section === "rational-polynomials") {
    await clickIf(page, '[data-rational-example="quartic"]'); await clickIf(page, '[data-prime="2"]');
  } else if (section === "multivariate-polynomials") {
    await checkMultivariateLayout(page, viewport);
    if (detail) await page.locator("#multivariate-polynomials-interactive .ch1-lab").screenshot({ path: path.join(outputDir, `${viewport.name}-${theme}-multivariate-support.png`) });
    await clickIf(page, '[data-lattice-mode="multiply"]');
    await page.locator("[data-first]").nth(1).click();
    await page.locator("[data-second]").nth(1).click();
    ensure(!(await page.locator("[data-multiply-module]").getAttribute("hidden")), "§10: multiply module did not open");
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
      await checkLearningArchitecture(page, section);
      await checkMathBoundaries(page, section);
      await checkMath(page, section); await checkVisibleText(page, section); await operate(page, section, viewport, theme); await checkMath(page, section); await checkVisibleText(page, section);
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
await regression.goto(`${baseUrl}/learn.html#ch1`, { waitUntil: "networkidle" });
ensure((await regression.locator(".chapter-unit").count()) === 5, "Chapter 1 overview should group the 11 sections into five learning units");
ensure((await regression.locator(".chapter-unit .lesson-card").count()) === 11, "Chapter 1 overview lost one or more sections");
await regression.goto(`${baseUrl}/learn.html#ch4/matrix-language`, { waitUntil: "networkidle" });
ensure(await regression.locator("#matrix-language-formal").count(), "Chapter 4 regression failed");
await regression.screenshot({ path: path.join(outputDir, "regression-ch4-matrix-language.png"), fullPage: true });
await regression.close();
await fs.writeFile(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));
await browser.close();
console.log(`Chapter 1 browser audit passed: ${report.length} states.`);
