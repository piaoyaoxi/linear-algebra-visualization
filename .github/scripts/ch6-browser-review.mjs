import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const base = (typeof process !== "undefined" && process.env?.CH6_BASE_URL) || "http://127.0.0.1:4173/learn.html";
const shots = "/tmp/ch6-screenshots";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
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
const lessonExpectations = {
  "sets-maps": "映射由三部分共同确定",
  "vector-space-definition": "数域与运算属于空间的完整数据",
  "basis-coordinates": "基的核心结论是每个向量都有唯一表示",
  "change-of-basis": "过渡矩阵的列直接记录旧基在新基中的坐标",
  "subspaces": "非空与线性组合封闭构成统一判定法",
  "intersection-sum": "求交空间：让两种基表示同一个向量",
  "direct-sum": "多个子空间要检查零向量的全部表示",
  "isomorphism": "一组基上的取值唯一决定线性映射",
};
fs.mkdirSync(shots, { recursive: true });
fs.rmSync(path.join(shots, "failure.txt"), { force: true });

const hasText = (locator, text) => locator.innerText().then((value) => value.includes(text));

function assertSourceDesignSystem() {
  const files = [
    "current/visuals/ch6/chapter-presentation.css",
    "current/visuals/ch6/shared-presentation.js",
    "current/visuals/ch6/section1-presentation.js",
  ];
  const forbidden = [
    "--ch6-ink",
    "--ch6-cyan",
    "--ch6-orange",
    "#071525",
    "#5ce0eb",
    "#ffad5b",
    "ch6-vector-glow",
    "<ellipse class=\"ch6-map-set\"",
    "linear-gradient(",
    "radial-gradient(",
    "stroke-dasharray",
  ];
  const problems = [];
  for (const file of files) {
    const source = fs.readFileSync(path.join(repoRoot, file), "utf8").toLowerCase();
    for (const token of forbidden) {
      if (source.includes(token.toLowerCase())) problems.push(`${file}: ${token}`);
    }
  }
  if (problems.length) throw new Error(`off-brand Chapter 6 visual tokens remain: ${problems.join(", ")}`);
}

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
    const stageCaption = lab?.querySelector(".ch6-stage-caption");
    const stageGraphic = lab?.querySelector(".ch6-stage-shell > svg, .ch6-stage-shell > .ch6-rgb-stage, .ch6-stage-shell > .ch6-polynomial-stage");
    const readout = lab?.querySelector(".ch6-lab-readout");
    const controls = lab?.querySelector(".ch6-lab-controls");
    if (!lab || !stage || !readout) return { documentOverflow, missing: true };
    const style = getComputedStyle(lab);
    const labRect = lab.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const readoutRect = readout.getBoundingClientRect();
    const controlsRect = controls?.getBoundingClientRect();
    const captionRect = stageCaption?.getBoundingClientRect();
    const graphicRect = stageGraphic?.getBoundingClientRect();
    const innerWidth = labRect.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    return {
      documentOverflow,
      missing: false,
      stageRatio: stageRect.width / innerWidth,
      verticalOrder:
        stageRect.bottom <= (controlsRect?.top ?? readoutRect.top) + 1 &&
        (!controlsRect || controlsRect.bottom <= readoutRect.top + 1),
      captionOverlapsGraphic: Boolean(captionRect && graphicRect && captionRect.bottom > graphicRect.top + 1),
      legacySplit: lab.querySelectorAll(".ch6-lab-layout, .ch6-lab-main").length,
    };
  });
  if (geometry.missing) throw new Error(`${id}: guided experiment structure missing`);
  if (geometry.documentOverflow > 1) throw new Error(`${id}: page overflow ${geometry.documentOverflow}px`);
  if (geometry.stageRatio < 0.94) throw new Error(`${id}: main visual only uses ${geometry.stageRatio.toFixed(2)} of the content width`);
  if (!geometry.verticalOrder) throw new Error(`${id}: controls, visual and result are not in one reading axis`);
  if (geometry.captionOverlapsGraphic) throw new Error(`${id}: stage explanation overlaps the mathematical graphic`);
  if (geometry.legacySplit) throw new Error(`${id}: old split dashboard is still present`);
}

async function assertProjectVisualLanguage(page, id, colorScheme) {
  const result = await page.evaluate(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const stage = document.querySelector(".ch6-guided-lab .ch6-stage-shell");
    const stageStyle = stage ? getComputedStyle(stage) : null;
    const customTokens = ["--ch6-ink", "--ch6-cyan", "--ch6-orange"]
      .map((name) => rootStyle.getPropertyValue(name).trim())
      .filter(Boolean);
    const glows = [...document.querySelectorAll(".ch6-guided-lab .ch6-arrow")]
      .map((node) => getComputedStyle(node).filter)
      .filter((value) => value && value !== "none");
    return {
      customTokens,
      glows,
      stageBackgroundColor: stageStyle?.backgroundColor || "",
      stageBorderColor: stageStyle?.borderColor || "",
      projectSurface: rootStyle.getPropertyValue("--surface-soft").trim(),
      projectLine: rootStyle.getPropertyValue("--line").trim(),
    };
  });
  if (result.customTokens.length) throw new Error(`${id}: private Chapter 6 palette is still active`);
  if (result.glows.length) throw new Error(`${id}: vector glow filter remains`);
  if (!result.projectSurface || !result.projectLine) throw new Error(`${id}: project theme variables unavailable`);
  if (colorScheme === "light") {
    const match = result.stageBackgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const rgb = match.slice(1).map(Number);
      const luminance = rgb.reduce((sum, value) => sum + value, 0) / 3;
      if (luminance < 170) throw new Error(`${id}: light-theme stage is still a dark cinematic panel (${result.stageBackgroundColor})`);
    }
  }
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
      .filter((box) => Math.max(box.width, box.height) < 34 || Math.min(box.width, box.height) < 4);
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

async function assertMappingVisual(page) {
  const result = await page.evaluate(() => {
    const lab = document.querySelector(".ch6-map-lab");
    return {
      panels: lab?.querySelectorAll(".ch6-map-panel").length || 0,
      nodes: lab?.querySelectorAll(".ch6-map-node").length || 0,
      ellipses: lab?.querySelectorAll("ellipse").length || 0,
      circles: lab?.querySelectorAll("circle").length || 0,
      darkPanel: lab?.querySelectorAll(".ch6-map-set").length || 0,
    };
  });
  if (result.panels !== 2) throw new Error(`§1 mapping must use two restrained set panels, got ${result.panels}`);
  if (result.nodes < 6) throw new Error(`§1 mapping nodes missing, got ${result.nodes}`);
  if (result.ellipses || result.circles || result.darkPanel) {
    throw new Error(`§1 old ellipse/circle mapping visual remains: ${JSON.stringify(result)}`);
  }
}

async function openLesson(page, id, shotPrefix, colorScheme) {
  await page.goto(`${base}#ch6/${id}`, { waitUntil: "networkidle" });
  await page.locator(".ch6-foundation").waitFor({ state: "visible" });
  await page.locator(".ch6-guided-lab").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts?.ready);
  const contentText = await page.locator("main.content").innerText();
  if (!contentText.includes(lessonExpectations[id])) throw new Error(`${id}: textbook theorem spine did not render`);
  if ((await page.locator(".ch6-lesson-module").count()) < 4) throw new Error(`${id}: formal story is too shallow`);
  if ((await page.locator("[data-example-challenge]").count()) !== 1) throw new Error(`${id}: representative example did not mount`);
  if ((await page.locator(".example-choice").count()) !== 4) throw new Error(`${id}: representative example must keep four choices`);
  if ((await page.locator("[data-example-explanation]").getAttribute("hidden")) === null) {
    throw new Error(`${id}: example analysis is visible before student action`);
  }
  if (/不是[^。；]{0,50}而是/.test(contentText)) throw new Error(`${id}: false-opposition sentence remains`);
  if (contentText.includes("北大版《高等代数》第六章")) throw new Error(`${id}: generic source label remains`);
  if (id === "change-of-basis" && !contentText.includes("½[[1,2],[-1,0]]")) {
    throw new Error("§4 corrected transition matrix is missing");
  }
  if ((await page.locator(".concept-strip").count()) !== 0) throw new Error(`${id}: legacy concept strip remains`);
  if ((await page.locator("main.content").innerText()).includes("阿贝尔群")) throw new Error(`${id}: abstract-algebra jargon remains`);
  await assertPageGeometry(page, id);
  await assertProjectVisualLanguage(page, id, colorScheme);
  await assertMath(page, id);
  await assertVectors(page, id);
  if (id === "sets-maps") await assertMappingVisual(page);
  await page.locator("main.content").screenshot({ path: path.join(shots, `${shotPrefix}-${id}.png`) });
}

async function reviewInteractions(page, configName, colorScheme) {
  await openLesson(page, "sets-maps", configName, colorScheme);
  await page.locator('[data-map-reset="identity"]').click();
  await assertMappingVisual(page);
  if (!(await hasText(page.locator("[data-map-inverse]"), "可唯一倒退"))) throw new Error("§1 inverse state failed");
  await page.locator('[data-map-reset="collision"]').click();
  if (!(await hasText(page.locator("[data-map-injective]"), "至少两个输入同像"))) throw new Error("§1 collision state failed");
  await page.locator('[data-map-input-node="1"]').click();
  await page.locator('[data-map-output-node="1"]').click();
  if (!(await hasText(page.locator("[data-map-inverse]"), "可唯一倒退"))) throw new Error("§1 manual reconnection failed");
  await page.locator("main.content").screenshot({ path: path.join(shots, `${configName}-mapping-state.png`) });

  await openLesson(page, "vector-space-definition", configName, colorScheme);
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

  await openLesson(page, "basis-coordinates", configName, colorScheme);
  if (!(await hasText(page.locator(".ch6-basis-verdict"), "1 · 一条直线"))) throw new Error("§3 initial span is not one-dimensional");
  await page.locator('[data-basis-preset="independent"]').click();
  await page.waitForFunction(() => document.querySelector(".ch6-basis-verdict")?.textContent?.includes("2 · 整个平面"), null, { timeout: 2500 });
  if ((await page.locator(".ch6-basis-area.is-visible").count()) < 1) throw new Error("§3 nonzero area is not visible");
  await assertVectors(page, "§3 independent state");
  await page.locator("[data-redundant]").check();
  if (!(await hasText(page.locator(".ch6-basis-verdict"), "v₃ 是冗余方向"))) throw new Error("§3 redundant direction was not identified");
  await page.locator('[data-basis-mode="coordinates"]').click();
  if (!(await page.locator(".ch6-coordinate-reader").isVisible())) throw new Error("§3 coordinate mode failed");
  await page.locator("main.content").screenshot({ path: path.join(shots, `${configName}-basis-coordinate-state.png`) });

  await openLesson(page, "change-of-basis", configName, colorScheme);
  if (!(await hasText(page.locator(".ch6-mode-badge.is-passive"), "向量 v 的端点始终固定"))) throw new Error("§4 fixed-object cue missing");
  await page.locator('[data-passive-preset="collapse"]').click();
  await page.waitForFunction(() => document.querySelector(".ch6-conclusion-box")?.textContent?.includes("W 不再是一组基"), null, { timeout: 2500 });
  await assertVectors(page, "§4 degenerate basis");
  await page.locator('[data-change-mode="active"]').click();
  if (await page.locator("[data-change-p]").count()) throw new Error("§4 transition matrix leaked into active mode");

  await openLesson(page, "subspaces", configName, colorScheme);
  await page.locator('[data-subspace-case="affine"]').click();
  if (!(await hasText(page.locator("[data-sub-zero]"), "0∉U"))) throw new Error("§5 affine set was accepted");

  await openLesson(page, "intersection-sum", configName, colorScheme);
  await page.locator('[data-sum-preset="same"]').click();
  let ledger = await page.locator(".ch6-dimension-ledger strong").allInnerTexts();
  if (ledger.join(",") !== "1,1,1,1") throw new Error(`§6 coincident-line ledger wrong: ${ledger.join(",")}`);
  await page.locator('[data-sum-preset="open"]').click();
  ledger = await page.locator(".ch6-dimension-ledger strong").allInnerTexts();
  if (ledger.join(",") !== "1,1,0,2") throw new Error(`§6 independent-line ledger wrong: ${ledger.join(",")}`);
  await assertVectors(page, "§6 angle state");

  await openLesson(page, "direct-sum", configName, colorScheme);
  await page.locator('[data-direct-case="overlap"]').click();
  await page.locator("[data-direct-t]").fill("1");
  if (!(await hasText(page.locator("[data-direct-unique]"), "多组分量"))) throw new Error("§7 nonunique decomposition failed");
  await assertVectors(page, "§7 overlap state");

  await openLesson(page, "isomorphism", configName, colorScheme);
  await page.locator('[data-iso-mode="square"]').click();
  if (!(await hasText(page.locator("[data-iso-linear]"), "运算保持失败"))) throw new Error("§8 nonlinear rule passed linearity");
  if (!(await page.locator(".ch6-iso-bridge").isVisible())) throw new Error("§8 polynomial-to-coordinate visual bridge missing");
  if ((await page.locator(".ch6-coefficient-sliders input").count()) !== 3) throw new Error("§8 coefficient controls missing");
}

assertSourceDesignSystem();

const localChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch(fs.existsSync(localChrome) ? { executablePath: localChrome } : {});
try {
  for (const config of [
    { name: "desktop-light", viewport: { width: 1440, height: 1000 }, colorScheme: "light", reducedMotion: "no-preference" },
    { name: "desktop-dark", viewport: { width: 1440, height: 1000 }, colorScheme: "dark", reducedMotion: "no-preference" },
    { name: "mobile-light", viewport: { width: 390, height: 844 }, colorScheme: "light", reducedMotion: "no-preference" },
    { name: "mobile-dark", viewport: { width: 390, height: 844 }, colorScheme: "dark", reducedMotion: "no-preference" },
    { name: "mobile-reduced", viewport: { width: 390, height: 844 }, colorScheme: "light", reducedMotion: "reduce" },
  ]) {
    const context = await browser.newContext({ viewport: config.viewport, colorScheme: config.colorScheme, reducedMotion: config.reducedMotion });
    if (config.colorScheme === "dark") await context.addInitScript(() => localStorage.setItem("la-visual-theme", "dark"));
    const page = await context.newPage();
    const errors = collectErrors(page);
    await reviewInteractions(page, config.name, config.colorScheme);
    await page.goto(`${base}#ch4/matrix-language`, { waitUntil: "networkidle" });
    await page.locator("canvas").first().waitFor({ state: "visible" });
    await page.locator("main.content").screenshot({ path: path.join(shots, `${config.name}-chapter4-reference.png`) });
    if (errors.length) throw new Error(`${config.name}: ${errors.join("\n")}`);
    console.log(`PASS ${config.name}`);
    await context.close();
  }
} catch (error) {
  fs.writeFileSync(path.join(shots, "failure.txt"), error?.stack || String(error));
  throw error;
} finally {
  await browser.close();
}
