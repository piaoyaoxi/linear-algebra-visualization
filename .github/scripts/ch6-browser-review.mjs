import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const base = "http://127.0.0.1:4173/learn.html";
const shots = "/tmp/ch6-screenshots";
const sections = [
  "sets-maps",
  "vector-space-definition",
  "basis-coordinates",
  "change-of-basis",
  "subspaces",
  "intersection-sum",
  "direct-sum",
  "isomorphism",
];
fs.mkdirSync(shots, { recursive: true });

const hasText = (locator, text) => locator.innerText().then((value) => value.includes(text));

function collectErrors(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

async function assertPageGeometry(page, id) {
  const geometry = await page.evaluate(() => {
    const documentOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const lab = document.querySelector(".ch6-guided-lab");
    const stage = lab?.querySelector(".ch6-lab-stage");
    const readout = lab?.querySelector(".ch6-lab-readout");
    const controls = lab?.querySelector(".ch6-lab-controls");
    if (!lab || !stage || !readout) return { documentOverflow, missing: true };
    const style = getComputedStyle(lab);
    const labRect = lab.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const readoutRect = readout.getBoundingClientRect();
    const controlsRect = controls?.getBoundingClientRect();
    const innerWidth = labRect.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    return {
      documentOverflow,
      missing: false,
      stageRatio: stageRect.width / innerWidth,
      verticalOrder:
        (!controlsRect || controlsRect.bottom <= stageRect.top + 1) &&
        stageRect.bottom <= readoutRect.top + 1,
      legacySplit: lab.querySelectorAll(".ch6-lab-layout, .ch6-lab-main").length,
    };
  });
  if (geometry.missing) throw new Error(`${id}: guided experiment structure missing`);
  if (geometry.documentOverflow > 1) throw new Error(`${id}: page overflow ${geometry.documentOverflow}px`);
  if (geometry.stageRatio < 0.94) throw new Error(`${id}: main visual only uses ${geometry.stageRatio.toFixed(2)} of the content width`);
  if (!geometry.verticalOrder) throw new Error(`${id}: controls, visual and result are not in one reading axis`);
  if (geometry.legacySplit) throw new Error(`${id}: old split dashboard is still present`);
}

async function assertMath(page, id) {
  const bad = await page.evaluate(() =>
    [...document.querySelectorAll(".ch6-foundation .tex-inline, .ch6-guided-lab .tex-inline")]
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return { text: node.textContent?.trim(), width: rect.width, height: rect.height };
      })
      .filter((item) => item.text && (item.height > 48 || item.width < 4)),
  );
  if (bad.length) throw new Error(`${id}: fragmented inline math ${JSON.stringify(bad.slice(0, 5))}`);
}

async function assertVectors(page, id) {
  const result = await page.evaluate(() => {
    const visibleOrigins = [...document.querySelectorAll(".ch6-plane .ch6-origin")].filter(
      (node) => getComputedStyle(node).display !== "none" && node.getBoundingClientRect().width > 0,
    ).length;
    const weakArrows = [...document.querySelectorAll(".ch6-plane .ch6-arrow")]
      .map((node) => {
        const box = node.getBBox();
        return { width: box.width, height: box.height };
      })
      .filter((box) => Math.max(box.width, box.height) < 34 || Math.min(box.width, box.height) < 5);
    const labelProblems = [];
    for (const svg of document.querySelectorAll("svg")) {
      const svgRect = svg.getBoundingClientRect();
      const labels = [...svg.querySelectorAll(".ch6-vector-label")]
        .map((node) => ({ text: node.textContent?.trim(), rect: node.getBoundingClientRect() }))
        .filter((item) => item.rect.width > 0 && item.rect.height > 0);
      labels.forEach((item) => {
        if (
          item.rect.left < svgRect.left - 2 ||
          item.rect.top < svgRect.top - 2 ||
          item.rect.right > svgRect.right + 2 ||
          item.rect.bottom > svgRect.bottom + 2
        ) {
          labelProblems.push(`clipped:${item.text}`);
        }
      });
      for (let i = 0; i < labels.length; i += 1) {
        for (let j = i + 1; j < labels.length; j += 1) {
          const a = labels[i].rect;
          const b = labels[j].rect;
          const overlapWidth = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
          const overlapHeight = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
          if (overlapWidth * overlapHeight > 16) {
            labelProblems.push(`overlap:${labels[i].text}/${labels[j].text}`);
          }
        }
      }
    }
    return { visibleOrigins, weakArrows: weakArrows.slice(0, 5), labelProblems: labelProblems.slice(0, 8) };
  });
  if (result.visibleOrigins) throw new Error(`${id}: an origin circle is still being used as part of the vector symbol`);
  if (result.weakArrows.length) throw new Error(`${id}: malformed filled arrows ${JSON.stringify(result.weakArrows)}`);
  if (result.labelProblems.length) throw new Error(`${id}: vector label collision ${JSON.stringify(result.labelProblems)}`);
}

async function openLesson(page, id, shotPrefix) {
  await page.goto(`${base}#ch6/${id}`, { waitUntil: "networkidle" });
  await page.locator(".ch6-foundation").waitFor({ state: "visible" });
  await page.locator(".ch6-guided-lab").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts?.ready);
  if ((await page.locator(".concept-strip").count()) !== 0) throw new Error(`${id}: legacy concept strip remains`);
  if ((await page.locator("main.content").innerText()).includes("阿贝尔群")) throw new Error(`${id}: abstract-algebra jargon remains`);
  await assertPageGeometry(page, id);
  await assertMath(page, id);
  await assertVectors(page, id);
  await page.locator("main.content").screenshot({ path: path.join(shots, `${shotPrefix}-${id}.png`) });
}

async function reviewInteractions(page, configName) {
  await openLesson(page, "sets-maps", configName);
  await page.locator('[data-map-mode="bijective"]').click();
  if (!(await hasText(page.locator("[data-map-inverse]"), "可唯一倒退"))) throw new Error("§1 inverse state failed");
  await page.locator('[data-map-mode="surjective"]').click();
  if (!(await hasText(page.locator("[data-map-injective]"), "至少两个输入同像"))) throw new Error("§1 collision state failed");

  await openLesson(page, "vector-space-definition", configName);
  await page.locator('[data-space-case="p1"]').click();
  const formulas = await page.locator(".ch6-polynomial-panel .katex").evaluateAll((nodes) =>
    nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return { width: box.width, height: box.height };
    }),
  );
  if (formulas.length !== 2 || formulas.some((box) => box.width < 80 || box.height > 90)) {
    throw new Error(`§2 polynomial math fragmented ${JSON.stringify(formulas)}`);
  }
  await page.locator("main.content").screenshot({ path: path.join(shots, `${configName}-polynomial-state.png`) });
  await page.locator('[data-space-case="quadrant"]').click();
  await assertVectors(page, "§2 quadrant");

  await openLesson(page, "basis-coordinates", configName);
  if (!(await hasText(page.locator(".ch6-basis-verdict"), "1 · 一条直线"))) throw new Error("§3 initial span is not one-dimensional");
  await page.locator('[data-basis-preset="independent"]').click();
  await page.waitForTimeout(500);
  if (!(await hasText(page.locator(".ch6-basis-verdict"), "2 · 整个平面"))) throw new Error("§3 dimension did not rise to two");
  if ((await page.locator(".ch6-basis-area.is-visible").count()) < 1) throw new Error("§3 nonzero area is not visible");
  await assertVectors(page, "§3 independent state");
  await page.locator("[data-redundant]").check();
  if (!(await hasText(page.locator(".ch6-basis-verdict"), "v₃ 是冗余方向"))) throw new Error("§3 redundant direction was not identified");
  await page.locator('[data-basis-mode="coordinates"]').click();
  if (!(await page.locator(".ch6-coordinate-reader").isVisible())) throw new Error("§3 coordinate mode failed");
  await page.locator("main.content").screenshot({ path: path.join(shots, `${configName}-basis-coordinate-state.png`) });

  await openLesson(page, "change-of-basis", configName);
  if (!(await hasText(page.locator(".ch6-mode-badge.is-passive"), "白色向量 v 的端点始终固定"))) throw new Error("§4 fixed-object cue missing");
  await page.locator('[data-passive-preset="collapse"]').click();
  await page.waitForTimeout(450);
  if (!(await hasText(page.locator(".ch6-conclusion-box"), "W 不再是一组基"))) throw new Error("§4 degenerate basis was not rejected");
  await assertVectors(page, "§4 degenerate basis");
  await page.locator('[data-change-mode="active"]').click();
  if (await page.locator("[data-change-p]").count()) throw new Error("§4 transition matrix leaked into active mode");

  await openLesson(page, "subspaces", configName);
  await page.locator('[data-subspace-case="affine"]').click();
  if (!(await hasText(page.locator("[data-sub-zero]"), "0∉U"))) throw new Error("§5 affine set was accepted");

  await openLesson(page, "intersection-sum", configName);
  await page.locator('[data-sum-case="planes"]').click();
  const ledger = await page.locator(".ch6-dimension-ledger strong").allInnerTexts();
  if (ledger.join(",") !== "2,2,1,3") throw new Error(`§6 dimension ledger wrong: ${ledger.join(",")}`);
  await assertVectors(page, "§6 plane state");

  await openLesson(page, "direct-sum", configName);
  await page.locator('[data-direct-case="overlap"]').click();
  await page.locator("[data-direct-t]").fill("1");
  if (!(await hasText(page.locator("[data-direct-unique]"), "多组分量"))) throw new Error("§7 nonunique decomposition failed");
  await assertVectors(page, "§7 overlap state");

  await openLesson(page, "isomorphism", configName);
  await page.locator('[data-iso-mode="square"]').click();
  if (!(await hasText(page.locator("[data-iso-linear]"), "运算保持失败"))) throw new Error("§8 nonlinear rule passed linearity");
  if (!(await page.locator("[data-iso-paths]").isVisible())) throw new Error("§8 two calculation paths missing");
}

const browser = await chromium.launch();
let failure = "";
try {
  for (const config of [
    { name: "desktop-light", viewport: { width: 1440, height: 1000 }, colorScheme: "light", reducedMotion: "no-preference" },
    { name: "desktop-dark", viewport: { width: 1440, height: 1000 }, colorScheme: "dark", reducedMotion: "no-preference" },
    { name: "mobile-light", viewport: { width: 390, height: 844 }, colorScheme: "light", reducedMotion: "no-preference" },
    { name: "mobile-reduced", viewport: { width: 390, height: 844 }, colorScheme: "light", reducedMotion: "reduce" },
  ]) {
    const context = await browser.newContext({ viewport: config.viewport, colorScheme: config.colorScheme, reducedMotion: config.reducedMotion });
    if (config.colorScheme === "dark") await context.addInitScript(() => localStorage.setItem("la-visual-theme", "dark"));
    const page = await context.newPage();
    const errors = collectErrors(page);
    await reviewInteractions(page, config.name);
    await page.goto(`${base}#ch4/matrix-language`, { waitUntil: "networkidle" });
    await page.locator("canvas").first().waitFor({ state: "visible" });
    if (errors.length) throw new Error(`${config.name}: ${errors.join("\n")}`);
    console.log(`PASS ${config.name}`);
    await context.close();
  }
} catch (error) {
  failure = error?.stack || String(error);
  fs.writeFileSync(path.join(shots, "failure.txt"), failure);
  throw error;
} finally {
  await browser.close();
}
