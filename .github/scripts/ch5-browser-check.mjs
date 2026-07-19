import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = "http://127.0.0.1:4173/learn.html";
const shotDir = "/tmp/ch5-shots";
const sections = [
  "quadratic-matrix",
  "quadratic-standard-form",
  "quadratic-uniqueness",
  "positive-definite",
];

function collectErrors(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (overflow > 1) throw new Error(`${label}: horizontal overflow ${overflow}px`);
}

async function assertSignCheckLayout(page) {
  const selector = "#positive-definite-formal .ch5-check-list li";
  const items = page.locator(selector);
  if ((await items.count()) !== 3) throw new Error("§4 sign checklist should contain three rows");

  for (let index = 0; index < 2; index += 1) {
    const metrics = await items.nth(index).evaluate((item) => {
      const formula = item.querySelector(".tex-inline");
      if (!formula) return null;
      const itemRect = item.getBoundingClientRect();
      const formulaRect = formula.getBoundingClientRect();
      const style = getComputedStyle(formula);
      return {
        itemLeft: itemRect.left,
        itemRight: itemRect.right,
        formulaLeft: formulaRect.left,
        formulaRight: formulaRect.right,
        formulaWidth: formulaRect.width,
        formulaHeight: formulaRect.height,
        display: style.display,
        whiteSpace: style.whiteSpace,
      };
    });

    if (!metrics) throw new Error(`§4 sign checklist row ${index + 1} is missing its formula`);
    if (metrics.display !== "inline") {
      throw new Error(`§4 sign formula ${index + 1} is not in normal inline flow`);
    }
    if (metrics.whiteSpace !== "nowrap") {
      throw new Error(`§4 sign formula ${index + 1} may wrap internally`);
    }
    if (metrics.formulaWidth < 24 || metrics.formulaWidth <= metrics.formulaHeight * 1.05) {
      throw new Error(`§4 sign formula ${index + 1} collapsed into a narrow vertical box`);
    }
    if (metrics.formulaHeight > 34) {
      throw new Error(`§4 sign formula ${index + 1} is unexpectedly tall`);
    }
    if (metrics.formulaLeft < metrics.itemLeft + 34) {
      throw new Error(`§4 sign formula ${index + 1} overlaps the checkmark column`);
    }
    if (metrics.formulaRight > metrics.itemRight + 1) {
      throw new Error(`§4 sign formula ${index + 1} overflows its checklist row`);
    }
  }
}

async function setRange(page, selector, value) {
  await page.locator(selector).evaluate((element, next) => {
    element.value = String(next);
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

async function openLesson(page, id) {
  await page.goto(`${base}#ch5/${id}`, { waitUntil: "networkidle" });
  await page.locator(`#${id}-formal .ch5-foundation`).waitFor({ state: "visible" });
  await page.locator(`#${id}-interactive .ch5-lab`).waitFor({ state: "visible" });
  for (const selector of [".example-challenge", ".self-test-list"]) {
    if (!(await page.locator(selector).first().isVisible())) {
      throw new Error(`${id}: missing ${selector}`);
    }
  }
  if ((await page.locator(".katex").count()) === 0) throw new Error(`${id}: KaTeX did not render`);
  if ((await page.locator(`#${id}-interactive .ch5-task`).count()) === 0) {
    throw new Error(`${id}: interaction has no visible task instruction`);
  }
  const rawLatex = await page.locator("#mainContent").innerText();
  if (/\\(?:begin|operatorname|Delta|cdots|neq|Longleftrightarrow)/.test(rawLatex)) {
    throw new Error(`${id}: raw LaTeX remains visible`);
  }
  await assertNoOverflow(page, id);
}

async function exerciseChapter(page) {
  await page.goto(`${base}#ch5`, { waitUntil: "networkidle" });
  if ((await page.locator(".lesson-card-grid .lesson-card").count()) !== 4) {
    throw new Error("Chapter 5 overview does not contain four lesson cards");
  }
  await assertNoOverflow(page, "Chapter 5 overview");

  for (const id of sections) await openLesson(page, id);

  // §1: one selected cross term must point to two symmetric matrix cells.
  await openLesson(page, "quadratic-matrix");
  await page.locator('[data-map-term="b"]').click();
  if ((await page.locator('[data-map-cell="b"].is-active').count()) !== 2) {
    throw new Error("§1 cross term does not highlight both symmetric matrix positions");
  }
  if (!(await page.locator("[data-map-copy]").innerText()).includes("各填 3")) {
    throw new Error("§1 does not explain why the cross coefficient is halved");
  }
  await page.locator('[data-s1-preset="shear"]').click();
  if (!(await page.locator("[data-s1-status]").innerText()).includes("合同成立")) {
    throw new Error("§1 invertible shear was not recognized as congruence");
  }
  const left = Number(await page.locator("[data-s1-left]").innerText());
  const right = Number(await page.locator("[data-s1-right]").innerText());
  if (!Number.isFinite(left) || Math.abs(left - right) > 1e-7) {
    throw new Error("§1 value check failed after coordinate substitution");
  }
  await page.locator('[data-s1-preset="singular"]').click();
  if (!(await page.locator("[data-s1-status]").innerText()).includes("不是合同")) {
    throw new Error("§1 singular substitution did not close the congruence claim");
  }
  if (!(await page.locator("[data-s1-result]").innerText()).includes("代数恒等式仍")) {
    throw new Error("§1 singular explanation confuses identity with congruence");
  }

  // §2: both the normal and pure-cross examples must end with a valid standard form.
  await openLesson(page, "quadratic-standard-form");
  for (let i = 0; i < 8; i += 1) await page.locator('[data-s2-nav="next"]').click();
  if (!(await page.locator("[data-s2-status]").innerText()).includes("标准形完成")) {
    throw new Error("§2 regular completion did not reach a verified standard form");
  }
  if (Math.abs(Number(await page.locator("[data-s2-cross]").innerText())) > 1e-7) {
    throw new Error("§2 final regular form still has a cross term");
  }
  await page.locator('[data-s2-preset="cross"]').click();
  for (let i = 0; i < 8; i += 1) await page.locator('[data-s2-nav="next"]').click();
  if (!(await page.locator("[data-s2-status]").innerText()).includes("标准形完成")) {
    throw new Error("§2 sum/difference start did not reach a verified standard form");
  }
  if (!(await page.locator("[data-s2-substitution]").innerText()).includes("和差替换")) {
    throw new Error("§2 pure-cross example does not explain its special first step");
  }

  // §3: a one-parameter invertible path locks inertia; a singular button stops the theorem.
  await openLesson(page, "quadratic-uniqueness");
  await setRange(page, "[data-s3-h]", 1.2);
  if (!(await page.locator("[data-s3-status]").innerText()).includes("惯性锁定")) {
    throw new Error("§3 inertia was not locked along the invertible shear path");
  }
  const aCounts = await page.locator("[data-s3-a-counts]").innerText();
  const bCounts = await page.locator("[data-s3-b-counts]").innerText();
  if (aCounts !== bCounts) throw new Error("§3 visible inertia counters changed under congruence");
  await page.locator("[data-s3-singular]").click();
  if (!(await page.locator("[data-s3-status]").innerText()).includes("合同停止")) {
    throw new Error("§3 singular endpoint did not stop the congruence claim");
  }

  // §4: formulas must remain inline, then the family must pass PD -> PSD -> indefinite.
  await openLesson(page, "positive-definite");
  await assertSignCheckLayout(page);
  await setRange(page, "[data-s4-t]", 0);
  if (!(await page.locator("[data-s4-status]").innerText()).includes("正定")) {
    throw new Error("§4 A(0) should be positive definite");
  }
  await setRange(page, "[data-s4-t]", 1);
  if (!(await page.locator("[data-s4-status]").innerText()).includes("半正定")) {
    throw new Error("§4 A(1) should be positive semidefinite");
  }
  if (!(await page.locator("[data-s4-d2]").innerText()).includes("= 0")) {
    throw new Error("§4 determinant did not hit zero at the boundary");
  }
  await setRange(page, "[data-s4-t]", 1.2);
  if (!(await page.locator("[data-s4-status]").innerText()).includes("不定")) {
    throw new Error("§4 A(1.2) should be indefinite");
  }
  if (!(await page.locator("[data-s4-scan-copy]").innerText()).includes("0 下方")) {
    throw new Error("§4 direction scan explanation does not identify the negative region");
  }
  for (const selector of ["[data-s4-contour]", "[data-s4-scan]"]) {
    const box = await page.locator(selector).boundingBox();
    if (!box || box.width < 100 || box.height < 100) throw new Error(`§4 visualization ${selector} is not usable`);
  }

  await page.goto(`${base}#ch4/matrix-language`, { waitUntil: "networkidle" });
  await page.locator("canvas").first().waitFor({ state: "visible" });
  await assertNoOverflow(page, "Chapter 4 regression");
}

await mkdir(shotDir, { recursive: true });
const browser = await chromium.launch();
try {
  for (const config of [
    { name: "desktop-light", viewport: { width: 1440, height: 1000 }, dark: false, reducedMotion: "no-preference" },
    { name: "desktop-dark", viewport: { width: 1440, height: 1000 }, dark: true, reducedMotion: "no-preference" },
    { name: "mobile-light", viewport: { width: 390, height: 844 }, dark: false, reducedMotion: "no-preference" },
    { name: "mobile-reduced", viewport: { width: 390, height: 844 }, dark: false, reducedMotion: "reduce" },
  ]) {
    const context = await browser.newContext({ viewport: config.viewport, reducedMotion: config.reducedMotion });
    await context.addInitScript(({ dark }) => {
      localStorage.setItem("la-visual-theme", dark ? "dark" : "light");
      localStorage.setItem("la-visual-sidebar", "collapsed");
    }, { dark: config.dark });
    const page = await context.newPage();
    const errors = collectErrors(page);
    await exerciseChapter(page);
    if (errors.length) throw new Error(`${config.name}: ${errors.join("\n")}`);

    for (const id of sections) {
      await openLesson(page, id);
      await page.locator(`#${id}-interactive`).scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${shotDir}/${config.name}-${id}.png`, fullPage: true });
    }
    console.log(`PASS ${config.name}`);
    await context.close();
  }
} finally {
  await browser.close();
}
