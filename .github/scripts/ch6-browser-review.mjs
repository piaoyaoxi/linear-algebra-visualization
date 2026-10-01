import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const base = process.env.CH6_BASE_URL || "http://127.0.0.1:4173/learn.html";
const shots = process.env.CH6_SHOTS || "/tmp/ch6-screenshots";
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
const withLab = new Set(["basis-coordinates", "change-of-basis", "intersection-sum", "direct-sum", "isomorphism"]);
fs.mkdirSync(shots, { recursive: true });

function collectErrors(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

async function assertLayout(page, id) {
  const result = await page.evaluate(() => {
    const doc = document.documentElement;
    const overflow = doc.scrollWidth - doc.clientWidth;
    const escaped = [];
    document.querySelectorAll(".ch6l-lab, .ch6l-theorem, .ch6l-pitfalls, .ch6f-card").forEach((card) => {
      const box = card.getBoundingClientRect();
      card.querySelectorAll(".katex, svg, canvas, button").forEach((node) => {
        const r = node.getBoundingClientRect();
        if (!r.width) return;
        const scroller = node.closest(".katex-display, .ch6l-matrices");
        if (scroller && getComputedStyle(scroller).overflowX !== "visible") return;
        if (r.right > box.right + 1 || r.left < box.left - 1) escaped.push(`${card.className}>${node.tagName}`);
      });
    });
    return { overflow, escaped: escaped.slice(0, 5), katexErrors: document.querySelectorAll(".katex-error").length };
  });
  if (result.overflow > 1) throw new Error(`${id}: horizontal page overflow ${result.overflow}px`);
  if (result.escaped.length) throw new Error(`${id}: content escapes its card ${JSON.stringify(result.escaped)}`);
  if (result.katexErrors) throw new Error(`${id}: ${result.katexErrors} KaTeX errors`);
}

async function open(page, id, dark) {
  await page.goto(`${base}#ch6/${id}`, { waitUntil: "networkidle" });
  if (dark) await page.evaluate(() => document.body.classList.add("dark"));
  await page.locator(".ch6l-formal").waitFor({ state: "visible" });
  if (withLab.has(id)) await page.locator(".ch6l-lab canvas").first().waitFor({ state: "visible" });
  else if (await page.locator(".ch6l-lab").count()) throw new Error(`${id}: unexpected interactive lab`);
  const text = await page.locator("main").innerText();
  if (/不是[^。；]*而是|占位|原型|开发进度/.test(text)) throw new Error(`${id}: forbidden wording on the student page`);
  await assertLayout(page, id);
}

const predict = async (page, label) => {
  await page.locator(".ch6l-predict-options button", { hasText: label }).first().click();
  await page.locator(".ch6l-result").first().waitFor({ state: "visible" });
};
const attr = (page, name) => page.locator(`.ch6l-lab [data-${name}]`).first().getAttribute(`data-${name}`);
const expectAttr = async (page, name, value, label) => {
  const got = await attr(page, name);
  if (got !== value) throw new Error(`${label}: expected data-${name}=${value}, got ${got}`);
};

async function exercise(page) {
  /* §3: the preset is dependent; after predicting, the exact rank verdict appears. */
  await open(page, "basis-coordinates");
  if (await page.locator(".ch6l-result").isVisible()) throw new Error("§3 conclusion visible before prediction");
  await predict(page, "共面");
  await expectAttr(page, "rank", "2", "§3 Lay preset");
  await page.locator(".ch6l-toolbar button", { hasText: "1+x" }).click();
  await expectAttr(page, "rank", "3", "§3 basis preset");
  await page.locator("[data-solve]").click();
  await expectAttr(page, "hit", "true", "§3 solve q");

  /* §4: drag a to 1; A_a·Y must reproduce the fixed X exactly. */
  await open(page, "change-of-basis");
  await predict(page, "(0,2,1)");
  await page.locator("[data-a]").fill("1");
  await expectAttr(page, "check", "true", "§4 X=AY at a=1");
  await page.locator("[data-a]").fill("-1.5");
  await expectAttr(page, "check", "true", "§4 X=AY at a=-3/2");

  /* §6: two planes always share a line; a line lying in the plane drops the sum. */
  await open(page, "intersection-sum");
  await predict(page, "不可以");
  await expectAttr(page, "ledger", "2,2,1,3", "§6 two planes");
  await page.locator(".ch6l-toolbar button", { hasText: "两平面重合" }).click();
  await expectAttr(page, "ledger", "2,2,2,2", "§6 equal planes");
  await page.locator(".ch6l-toolbar button", { hasText: "平面与直线" }).click();
  await expectAttr(page, "ledger", "2,1,0,3", "§6 plane and line");
  await page.locator(".ch6l-toolbar button", { hasText: "直线落进平面" }).click();
  await expectAttr(page, "ledger", "2,1,1,2", "§6 line in plane");

  /* §7: oblique split, then flatten u into the plane; second mode is not direct. */
  await open(page, "direct-sum");
  await predict(page, "越来越长");
  await expectAttr(page, "state", "direct", "§7 line ⊕ plane");
  await page.locator("[data-flat]").click();
  await expectAttr(page, "state", "inside", "§7 line inside plane");
  await page.locator(".ch6l-toolbar button", { hasText: "三条直线" }).click();
  await predict(page, "不是，零向量");
  await expectAttr(page, "state", "not-direct", "§7 three coplanar lines");
  await page.locator("[data-lift]").click();
  await expectAttr(page, "state", "direct", "§7 lifted third line");

  /* §8: coefficient and value maps close the parallelogram; squaring breaks it. */
  await open(page, "isomorphism");
  await expectAttr(page, "closes", "true", "§8 σ");
  await page.locator(".ch6l-toolbar button", { hasText: "取值" }).click();
  await expectAttr(page, "closes", "true", "§8 τ");
  await page.locator(".ch6l-toolbar button", { hasText: "换成" }).click();
  await expectAttr(page, "closes", "false", "§8 squaring");

  /* Static sections: the worked example keeps its answer hidden until a choice is made. */
  await open(page, "vector-space-definition");
  const explanation = page.locator("#vector-space-definition-example [data-example-explanation]");
  if (!(await explanation.count())) throw new Error("§2 example challenge did not mount");
  if (await explanation.isVisible()) throw new Error("§2 example analysis visible before the student acts");
}

const localChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch(fs.existsSync(localChrome) && !process.env.CI ? { executablePath: localChrome } : {});
try {
  for (const config of [
    { name: "desktop-light", viewport: { width: 1440, height: 1000 } },
    { name: "desktop-dark", viewport: { width: 1440, height: 1000 }, dark: true },
    { name: "tablet-light", viewport: { width: 768, height: 1000 } },
    { name: "mobile-light", viewport: { width: 390, height: 844 } },
    { name: "mobile-dark", viewport: { width: 390, height: 844 }, dark: true },
  ]) {
    const context = await browser.newContext({ viewport: config.viewport });
    const page = await context.newPage();
    const errors = collectErrors(page);
    for (const id of sections) {
      await open(page, id, config.dark);
      await page.locator("main").screenshot({ path: path.join(shots, `${config.name}-${id}.png`) });
    }
    await exercise(page);
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
