import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const base = "http://127.0.0.1:4173/learn.html";
const out = "/tmp/ch9-browser-screenshots";
fs.mkdirSync(out, { recursive: true });

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

function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

async function noOverflow(page, label) {
  const audit = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    nodes: [...document.querySelectorAll("main *")]
      .filter((node) => {
        const style = getComputedStyle(node);
        return node.scrollWidth > node.clientWidth + 4 && style.overflowX === "visible";
      })
      .slice(0, 10)
      .map((node) => `${node.tagName}.${String(node.className).slice(0, 80)}`),
  }));
  if (audit.document > 1) throw new Error(`${label}: horizontal overflow ${audit.document}px; ${audit.nodes.join(", ")}`);
}

async function open(page, id, screenshot = "") {
  await page.goto(`${base}#ch9/${id}`, { waitUntil: "networkidle" });
  await page.locator("[data-ch9-lab]").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(120);
  if ((await page.locator(".ch9-module").count()) < 3) throw new Error(`${id}: missing formal modules`);
  if ((await page.locator(".ch9-stage canvas").count()) < 1) throw new Error(`${id}: missing Canvas stage`);
  const canvasAudit = await page.evaluate(() => [...document.querySelectorAll(".ch9-stage canvas")].map((canvas) => {
    const rect = canvas.getBoundingClientRect();
    return { width: rect.width, height: rect.height, pixels: canvas.width * canvas.height };
  }));
  if (canvasAudit.some((item) => item.width < 250 || item.height < 220 || item.pixels < 10000)) {
    throw new Error(`${id}: invalid canvas ${JSON.stringify(canvasAudit)}`);
  }
  if (await page.locator(".katex-error").count()) throw new Error(`${id}: KaTeX error`);
  const forbidden = await page.locator("main").innerText();
  for (const phrase of ["正在开发", "占位", "即将制作", "待完善", "cinematic"]) {
    if (forbidden.toLowerCase().includes(phrase.toLowerCase())) throw new Error(`${id}: forbidden student text ${phrase}`);
  }
  await noOverflow(page, id);
  if (screenshot) await page.locator("main.content").screenshot({ path: path.join(out, `${screenshot}-${id}.png`) });
}

async function waitText(page, selector, text, label, timeout = 1800) {
  const locator = page.locator(selector);
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if ((await locator.innerText()).includes(text)) return;
    await page.waitForTimeout(40);
  }
  throw new Error(`${label}: expected ${text}, got ${(await locator.innerText()).trim()}`);
}

async function functional(page) {
  await open(page, sections[0]);
  await page.locator('[data-ip="right"]').click();
  await waitText(page, "[data-ip-status]", "正交", "§1 right angle");
  await page.locator('[data-ip="zero"]').click();
  await waitText(page, "[data-ip-status]", "零向量边界", "§1 zero vector");

  await open(page, sections[1]);
  await page.locator('[data-preset="dependent"]').click();
  await waitText(page, "[data-gs-status]", "零余量", "§2 dependent");
  await page.locator('[data-preset="general"]').click();
  await page.locator('[data-step="3"]').click();
  await waitText(page, "[data-gs-status]", "正交化完成", "§2 complete");

  await open(page, sections[2]);
  await page.locator('[data-mode="skew"]').click();
  await waitText(page, "[data-iso-status]", "仅线性同构", "§3 skew");
  await page.locator('[data-mode="orthonormal"]').click();
  await waitText(page, "[data-iso-status]", "等距", "§3 orthonormal");

  await open(page, sections[3]);
  await page.locator('[data-mode="shear"]').click();
  await waitText(page, "[data-ortho-status]", "发生形变", "§4 shear");
  await page.locator('[data-mode="reflection"]').click();
  await waitText(page, "[data-ortho-status]", "正交变换", "§4 reflection");

  await open(page, sections[4]);
  await page.locator("[data-best]").click();
  await waitText(page, "[data-proj-status]", "最近点命中", "§5 projection", 2400);

  await open(page, sections[5]);
  await page.locator('[data-preset="nonsymmetric"]').click();
  await waitText(page, "[data-sp-status]", "结论关闭", "§6 nonsymmetric");
  await page.locator('[data-preset="positive"]').click();
  await page.locator('[data-step="3"]').click();
  await waitText(page, "[data-sp-status]", "谱分解完成", "§6 complete");
  await page.locator('[data-preset="repeated"]').click();
  await waitText(page, "[data-sp-status]", "重特征值", "§6 repeated");

  await open(page, sections[6]);
  await page.locator("[data-best]").click();
  await waitText(page, "[data-ls-status]", "正规方程通过", "§7 best fit", 2600);

  await open(page, sections[7]);
  await page.locator('[data-mode="scaled"]').click();
  await waitText(page, "[data-u-status]", "非酉缩放", "§8 scaled");
  await page.locator('[data-mode="unitary"]').click();
  await waitText(page, "[data-u-status]", "酉变换", "§8 unitary");
}

async function configuration(browser, config) {
  const context = await browser.newContext({ viewport: config.viewport, colorScheme: config.scheme, reducedMotion: config.motion });
  if (config.scheme === "dark") await context.addInitScript(() => localStorage.setItem("la-visual-theme", "dark"));
  const page = await context.newPage();
  const errors = watchErrors(page);
  await page.goto(`${base}#ch9`, { waitUntil: "networkidle" });
  if ((await page.locator(".lesson-card-grid .lesson-card").count()) !== 8) throw new Error(`${config.name}: overview does not show eight lessons`);
  await noOverflow(page, `${config.name} overview`);
  await page.locator("main.content").screenshot({ path: path.join(out, `${config.name}-overview.png`) });
  for (const id of sections) await open(page, id, config.name);
  await functional(page);

  for (const [name, hash, selector] of [
    ["ch1", "#ch1/univariate-polynomials", ".ch1-lab"],
    ["ch4", "#ch4/matrix-language", "#matrix-language-formal"],
    ["ch5", "#ch5/positive-definite", ".ch5-lab"],
  ]) {
    await page.goto(`${base}${hash}`, { waitUntil: "networkidle" });
    await page.locator(selector).waitFor({ state: "visible" });
    await noOverflow(page, `${config.name} ${name}`);
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
    await configuration(browser, config);
    console.log(`PASS ${config.name}`);
  }
} catch (error) {
  fs.writeFileSync(path.join(out, "FAILURE.txt"), `${error?.stack || error}\n`);
  throw error;
} finally {
  await browser.close();
}
