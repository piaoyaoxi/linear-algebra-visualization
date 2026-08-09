import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

// Final gate for the project-native Chapter 9 implementation.
const base = process.env.CH9_BASE || "http://127.0.0.1:4173/learn.html";
const shots = "/tmp/ch9-browser-screenshots";
fs.mkdirSync(shots, { recursive: true });

const sections = [
  "inner-product-geometry",
  "orthonormal-bases",
  "euclidean-isomorphism",
  "orthogonal-transformations",
  "orthogonal-subspaces",
  "symmetric-canonical-form",
  "least-squares-distance",
  "unitary-spaces",
];

const labKinds = {
  "inner-product-geometry": "inner-product",
  "orthonormal-bases": "gram-schmidt",
  "euclidean-isomorphism": "isometry",
  "orthogonal-transformations": "orthogonal-transform",
  "orthogonal-subspaces": "projection",
  "symmetric-canonical-form": "spectral",
  "least-squares-distance": "least-squares",
  "unitary-spaces": "unitary",
};

function collectErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

async function waitText(page, selector, expected, label, timeout = 2400) {
  const locator = page.locator(selector);
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if ((await locator.innerText()).includes(expected)) return;
    await page.waitForTimeout(45);
  }
  throw new Error(`${label}: expected “${expected}”, got “${(await locator.innerText()).trim()}”`);
}

async function assertNoOverflow(page, label) {
  const audit = await page.evaluate(() => ({
    documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    nodes: [...document.querySelectorAll("main *")]
      .filter((node) => {
        const style = getComputedStyle(node);
        return node.scrollWidth > node.clientWidth + 4 && style.overflowX === "visible";
      })
      .slice(0, 10)
      .map((node) => `${node.tagName}.${String(node.className).slice(0, 80)}`),
  }));
  if (audit.documentOverflow > 1) throw new Error(`${label}: horizontal overflow ${audit.documentOverflow}px; ${audit.nodes.join(", ")}`);
}

async function openLesson(page, id, screenshotName = "") {
  await page.goto(`${base}#ch9/${id}`, { waitUntil: "networkidle" });
  await page.locator("[data-ch9-lab]").waitFor({ state: "visible", timeout: 6000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(220);
  const labKind = await page.locator("[data-ch9-lab]").getAttribute("data-lab-kind");
  if (labKind !== labKinds[id]) throw new Error(`${id}: expected bespoke lab ${labKinds[id]}, got ${labKind}`);
  const canvasAudit = await page.evaluate(() => [...document.querySelectorAll("[data-ch9-lab] canvas")]
    .filter((canvas) => canvas.getBoundingClientRect().width > 0)
    .map((canvas) => {
      const rect = canvas.getBoundingClientRect();
      return { width: rect.width, height: rect.height, pixelWidth: canvas.width, pixelHeight: canvas.height };
    }));
  if (!canvasAudit.length || canvasAudit.some((item) => item.width < 260 || item.height < 280 || item.pixelWidth < 260 || item.pixelHeight < 280)) {
    throw new Error(`${id}: invalid Canvas stage ${JSON.stringify(canvasAudit)}`);
  }
  if (await page.locator(".katex-error").count()) throw new Error(`${id}: KaTeX error`);
  const body = await page.locator("main").innerText();
  for (const phrase of ["正在开发", "占位", "即将制作", "待完善", "cinematic"]) {
    if (body.toLowerCase().includes(phrase.toLowerCase())) throw new Error(`${id}: forbidden phrase ${phrase}`);
  }
  await assertNoOverflow(page, id);
  if (screenshotName) await page.locator("main.content").screenshot({ path: path.join(shots, `${screenshotName}-${id}.png`) });
}

async function exerciseStates(page) {
  await openLesson(page, sections[0]);
  await page.locator('[data-ip-preset="right"]').click();
  await waitText(page, '[data-conclusion="ip"]', "正交", "§1 right angle");
  await page.locator('[data-ip-preset="zero"]').click();
  await waitText(page, '[data-conclusion="ip"]', "夹角不定义", "§1 zero vector");
  if (await page.locator('[data-range="ipAngle"]').isEnabled()) throw new Error("§1: angle slider must be disabled for zero vector");

  await openLesson(page, sections[1]);
  if ((await page.locator('[data-readout="orthogonality"]').innerText()) !== "尚未进行") {
    throw new Error("§2: orthogonality is shown before the required vectors exist");
  }
  await page.locator('[data-gs-preset="dependent"]').click();
  await waitText(page, '[data-conclusion="gs"]', "余量为零", "§2 dependent input");
  if (await page.locator('[data-gs-step="3"]').isEnabled()) throw new Error("§2: normalization must stop at zero residual");
  await page.locator('[data-gs-preset="general"]').click();
  await page.locator('[data-gs-step="3"]').click();
  await waitText(page, '[data-conclusion="gs"]', "标准正交组完成", "§2 Gram-Schmidt completion");

  await openLesson(page, sections[2]);
  await page.locator('[data-iso-mode="skew"]').click();
  await waitText(page, "[data-iso-conclusion]", "普通点积已经读错几何", "§3 skew basis");
  await page.locator('[data-iso-mode="orthonormal"]').click();
  await waitText(page, "[data-iso-conclusion]", "等距同构", "§3 orthonormal basis");

  await openLesson(page, sections[3]);
  await page.locator('[data-ortho-mode="shear"]').click();
  await waitText(page, "[data-ortho-conclusion]", "正交条件不成立", "§4 shear");
  if (!(await page.locator("[data-shape-control]").isVisible())) throw new Error("§4: deformation control is hidden for shear");
  await page.locator('[data-ortho-mode="reflection"]').click();
  await waitText(page, "[data-ortho-conclusion]", "保持全部距离", "§4 reflection");
  await page.locator('[data-ortho-mode="rotation"]').click();
  await waitText(page, "[data-ortho-conclusion]", "旋转保持定向", "§4 counterexample recovery");

  await openLesson(page, sections[4]);
  await page.locator("[data-proj-best]").click();
  await waitText(page, "[data-proj-conclusion]", "曲线最低点", "§5 projection minimum");
  const projectionExtra = Number(await page.locator("[data-proj-conclusion]").getAttribute("data-proj-extra"));
  if (projectionExtra !== 0) throw new Error(`§5: projection animation did not end exactly at the minimum: ${projectionExtra}`);

  await openLesson(page, sections[5]);
  await page.locator('[data-sp-preset="nonsymmetric"]').click();
  await waitText(page, "[data-sp-warning]", "定理闸门关闭", "§6 nonsymmetric gate");
  if (await page.locator("[data-sp-story]").isVisible()) throw new Error("§6: spectral story must close for nonsymmetric matrix");
  await page.locator('[data-sp-preset="positive"]').click();
  if (!(await page.locator("[data-sp-story]").isVisible())) throw new Error("§6: spectral story did not recover after returning to a symmetric matrix");
  await page.locator('[data-sp-step="2"]').click();
  await waitText(page, "[data-sp-conclusion]", "Q 把主轴送回", "§6 spectral completion");
  await page.locator('[data-sp-preset="repeated"]').click();
  await waitText(page, "[data-sp-conclusion]", "重特征值", "§6 repeated eigenvalue");

  await openLesson(page, sections[6]);
  if (await page.locator("[data-ls-normal]").isVisible()) throw new Error("§7: optimum certificate is visible before reveal");
  await page.locator("[data-ls-best]").click();
  await waitText(page, "[data-ls-conclusion]", "正交条件同时满足", "§7 least-squares optimum", 3200);
  if (!(await page.locator("[data-ls-normal]").isVisible())) throw new Error("§7: optimum certificate did not reveal");

  await openLesson(page, sections[7]);
  await page.locator('[data-u-tab="motion"]').click();
  await page.locator('[data-u-mode="scaled"]').click();
  await waitText(page, "[data-u-conclusion]", "酉条件失败", "§8 scaled comparison");
  await page.locator('[data-u-mode="unitary"]').click();
  await waitText(page, "[data-u-conclusion]", "等模圆", "§8 unitary state");
}

async function runConfiguration(browser, config) {
  const context = await browser.newContext({ viewport: config.viewport, colorScheme: config.scheme, reducedMotion: config.motion });
  if (config.scheme === "dark") await context.addInitScript(() => localStorage.setItem("la-visual-theme", "dark"));
  const page = await context.newPage();
  const errors = collectErrors(page);
  await page.goto(`${base}#ch9`, { waitUntil: "networkidle" });
  if ((await page.locator(".lesson-card-grid .lesson-card").count()) !== 8) throw new Error(`${config.name}: overview does not contain eight lessons`);
  await assertNoOverflow(page, `${config.name} overview`);
  await page.locator("main.content").screenshot({ path: path.join(shots, `${config.name}-overview.png`) });
  for (const id of sections) await openLesson(page, id, config.name);
  await exerciseStates(page);
  for (const [label, hash, selector] of [
    ["Chapter 1", "#ch1/univariate-polynomials", ".ch1-lab"],
    ["Chapter 4", "#ch4/matrix-language", "#matrix-language-formal"],
    ["Chapter 5", "#ch5/positive-definite", ".ch5-lab"],
  ]) {
    await page.goto(`${base}${hash}`, { waitUntil: "networkidle" });
    await page.locator(selector).waitFor({ state: "visible" });
    await assertNoOverflow(page, `${config.name} ${label}`);
  }
  if (errors.length) throw new Error(`${config.name}: ${errors.join("\n")}`);
  await context.close();
}

const browser = await chromium.launch();
try {
  for (const config of [
    { name: "desktop-light", viewport: { width: 1440, height: 1000 }, scheme: "light", motion: "no-preference" },
    { name: "desktop-dark", viewport: { width: 1440, height: 1000 }, scheme: "dark", motion: "no-preference" },
    { name: "mobile-light", viewport: { width: 390, height: 844 }, scheme: "light", motion: "no-preference" },
    { name: "mobile-dark", viewport: { width: 390, height: 844 }, scheme: "dark", motion: "no-preference" },
    { name: "mobile-reduced", viewport: { width: 390, height: 844 }, scheme: "light", motion: "reduce" },
  ]) {
    await runConfiguration(browser, config);
    console.log(`PASS ${config.name}`);
  }
} catch (error) {
  fs.writeFileSync(path.join(shots, "FAILURE.txt"), `${error?.stack || error}\n`);
  throw error;
} finally {
  await browser.close();
}
