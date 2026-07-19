import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = "http://127.0.0.1:4173/learn.html";
const shotDir = "/tmp/ch5-orbit-shots";

async function openLesson(page, id) {
  await page.goto(`${base}#ch5/${id}`, { waitUntil: "networkidle" });
  await page.locator(`#${id}-interactive .qv-orbit-shell`).first().waitFor({ state: "visible" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) throw new Error(`${id}: horizontal overflow ${overflow}px`);
}

async function setRange(page, selector, value) {
  await page.locator(selector).evaluate((element, next) => {
    element.value = String(next);
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
  await page.waitForTimeout(50);
}

async function dragCanvas(page, selector, dx = 100, dy = -55) {
  const canvas = page.locator(selector);
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(60);
  const box = await canvas.boundingBox();
  if (!box) throw new Error(`${selector}: missing canvas box`);
  const beforeYaw = Number(await canvas.getAttribute("data-camera-yaw"));
  const beforePitch = Number(await canvas.getAttribute("data-camera-pitch"));
  await page.mouse.move(box.x + box.width * 0.68, box.y + box.height * 0.72);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.68 + dx, box.y + box.height * 0.72 + dy, { steps: 10 });
  await page.mouse.up();
  const afterYaw = Number(await canvas.getAttribute("data-camera-yaw"));
  const afterPitch = Number(await canvas.getAttribute("data-camera-pitch"));
  if (!Number.isFinite(afterYaw) || Math.abs(afterYaw - beforeYaw) < 0.02) {
    throw new Error(`${selector}: horizontal drag did not rotate the camera`);
  }
  if (!Number.isFinite(afterPitch) || Math.abs(afterPitch - beforePitch) < 0.02) {
    throw new Error(`${selector}: vertical drag did not change camera pitch`);
  }
  return { yaw: afterYaw, pitch: afterPitch };
}

async function checkFormulaRendering(page) {
  const text = await page.locator("#mainContent").innerText();
  if (/\\(?:lambda|Delta|det|begin)|\bq_t\b|\bC\^TAC\b/.test(text)) {
    throw new Error("raw formula text remains visible in the geometry layer");
  }
  if ((await page.locator("#positive-definite-interactive .katex").count()) < 8) {
    throw new Error("positive-definite geometry labels are not consistently rendered with KaTeX");
  }
}

async function runChecks(page, name) {
  await openLesson(page, "quadratic-matrix");
  await page.locator('[data-s1-preset="shear"]').click();
  const s1 = await dragCanvas(page, "[data-s1-a-canvas]");
  const s1Right = Number(await page.locator("[data-s1-b-canvas]").getAttribute("data-camera-yaw"));
  if (Math.abs(s1.yaw - s1Right) > 1e-9) throw new Error("§1 paired cameras are not linked");
  await page.screenshot({ path: `${shotDir}/${name}-s1-linked-rotated.png`, fullPage: true });

  await openLesson(page, "quadratic-standard-form");
  await dragCanvas(page, "[data-s2-canvas]", 80, -40);
  await page.screenshot({ path: `${shotDir}/${name}-s2-rotated.png`, fullPage: true });

  await openLesson(page, "quadratic-uniqueness");
  await setRange(page, "[data-s3-h]", 1.5);
  const s3 = await dragCanvas(page, "[data-s3-b-canvas]", -85, -40);
  const s3Left = Number(await page.locator("[data-s3-a-canvas]").getAttribute("data-camera-yaw"));
  if (Math.abs(s3.yaw - s3Left) > 1e-9) throw new Error("§3 paired cameras are not linked");
  await page.screenshot({ path: `${shotDir}/${name}-s3-h1.5-rotated.png`, fullPage: true });

  await openLesson(page, "positive-definite");
  await checkFormulaRendering(page);
  await setRange(page, "[data-s4-t]", 1);
  await dragCanvas(page, "[data-s4-surface]", 110, -70);
  if (!(await page.locator("[data-s4-status]").innerText()).includes("半正定")) {
    throw new Error("§4 t=1 did not remain semidefinite after camera rotation");
  }
  await page.screenshot({ path: `${shotDir}/${name}-s4-valley-rotated.png`, fullPage: true });

  await setRange(page, "[data-s4-t]", 1.2);
  if (!(await page.locator("[data-s4-status]").innerText()).includes("不定")) {
    throw new Error("§4 t=1.2 did not become indefinite");
  }
  await page.screenshot({ path: `${shotDir}/${name}-s4-saddle-rotated.png`, fullPage: true });

  for (const value of [1.5, -1.5]) {
    await setRange(page, "[data-s4-t]", value);
    const canvas = page.locator("[data-s4-surface]");
    const box = await canvas.boundingBox();
    if (!box || box.width < 200 || box.height < 300) throw new Error(`§4 t=${value}: unusable surface canvas`);
    const pixels = await canvas.evaluate((element) => {
      const ctx = element.getContext("2d");
      const sample = ctx.getImageData(0, 0, element.width, element.height).data;
      let opaque = 0;
      for (let i = 3; i < sample.length; i += 400) if (sample[i] > 0) opaque += 1;
      return opaque;
    });
    if (pixels < 50) throw new Error(`§4 t=${value}: surface failed to paint`);
  }
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
    const errors = [];
    page.on("console", (message) => message.type() === "error" && errors.push(`console: ${message.text()}`));
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.stack || error.message}`));
    await runChecks(page, config.name);
    if (errors.length) throw new Error(`${config.name}: ${errors.join("\n")}`);
    console.log(`PASS ${config.name}`);
    await context.close();
  }
} finally {
  await browser.close();
}