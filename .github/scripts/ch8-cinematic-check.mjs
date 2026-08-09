import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const base = process.env.CH8_BASE || "http://127.0.0.1:4173/learn.html";
const shots = "/tmp/ch8-screenshots/cinematic";
fs.mkdirSync(shots, { recursive: true });

function normalize(value) {
  return String(value ?? "").replace(/\s+/g, "");
}

async function open(page, id) {
  await page.goto(`${base}#ch8/${id}`, { waitUntil: "networkidle" });
  await page.locator("[data-ch8-lab] .ch8-lab").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts?.ready);
  const shouldCollapse = await page.evaluate(() => innerWidth > 920 && !document.body.classList.contains("sidebar-collapsed"));
  if (shouldCollapse) {
    await page.locator("#sidebarToggle").click();
    await page.waitForTimeout(220);
  }
  if (await page.locator(".katex-error").count()) throw new Error(`${id}: KaTeX error`);
}

async function assertNoPageOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) throw new Error(`${label}: horizontal overflow ${overflow}px`);
}

async function assertSeparated(page, firstSelector, secondSelector, label, gap = 4) {
  const result = await page.evaluate(({ firstSelector, secondSelector }) => {
    const first = document.querySelector(firstSelector)?.getBoundingClientRect();
    const second = document.querySelector(secondSelector)?.getBoundingClientRect();
    if (!first || !second) return null;
    return { first: { left: first.left, right: first.right, top: first.top, bottom: first.bottom }, second: { left: second.left, right: second.right, top: second.top, bottom: second.bottom } };
  }, { firstSelector, secondSelector });
  if (!result) throw new Error(`${label}: missing boxes`);
  const horizontal = result.first.right + gap <= result.second.left || result.second.right + gap <= result.first.left;
  const vertical = result.first.bottom + gap <= result.second.top || result.second.bottom + gap <= result.first.top;
  if (!horizontal && !vertical) throw new Error(`${label}: visual boxes overlap`);
}

async function assertBareInlineMath(page, selector, label) {
  const offenders = await page.locator(selector).evaluateAll((nodes) => nodes.map((node) => {
    const style = getComputedStyle(node);
    return {
      text: node.textContent?.trim(),
      background: style.backgroundColor,
      borderTop: style.borderTopWidth,
      radius: style.borderRadius,
      shadow: style.boxShadow,
    };
  }).filter((item) => item.background !== "rgba(0, 0, 0, 0)" || item.borderTop !== "0px" || item.radius !== "0px" || item.shadow !== "none"));
  if (offenders.length) throw new Error(`${label}: inline math still has pill chrome: ${JSON.stringify(offenders.slice(0, 4))}`);
}

async function dragRange(page, selector, ratio, touch) {
  const range = page.locator(selector);
  await range.scrollIntoViewIfNeeded();
  const box = await range.boundingBox();
  if (!box) throw new Error(`${selector}: missing range box`);
  const min = Number(await range.getAttribute("min"));
  const max = Number(await range.getAttribute("max"));
  const current = Number(await range.inputValue());
  const rawStartRatio = (current - min) / (max - min);
  const startRatio = Math.max(0.04, Math.min(0.96, rawStartRatio));
  const targetRatio = Math.max(0.04, Math.min(0.96, ratio));
  const y = box.y + box.height / 2;
  const startX = box.x + box.width * startRatio;
  const endX = box.x + box.width * targetRatio;
  if (touch) {
    const client = await page.context().newCDPSession(page);
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: startX, y, id: 1, radiusX: 9, radiusY: 9, force: 1 }] });
    for (let i = 1; i <= 12; i += 1) {
      await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: startX + ((endX - startX) * i) / 12, y, id: 1, radiusX: 9, radiusY: 9, force: 1 }] });
    }
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await client.detach();
  } else {
    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(endX, y, { steps: 16 });
    await page.mouse.up();
  }
  await page.waitForTimeout(80);
}

async function checkLambdaBuild(page, name) {
  await open(page, "lambda-matrix");
  const equationText = normalize(await page.locator(".ch8-build-equation").innerText());
  if (!equationText.includes("λI") || !equationText.includes("矩阵A") || !equationText.includes("特征矩阵")) {
    throw new Error(`${name}/lambda-build: equation order or labels missing`);
  }
  if ((await page.locator(".ch8-build-equation .ch8-bare-matrix").count()) !== 3) {
    throw new Error(`${name}/lambda-build: expected three persistent bare matrices`);
  }
  const articleChrome = await page.locator(".ch8-build-equation > article").evaluateAll((nodes) => nodes.map((node) => {
    const style = getComputedStyle(node);
    return { background: style.backgroundColor, border: style.borderTopWidth, radius: style.borderRadius };
  }));
  if (articleChrome.some((item) => item.background !== "rgba(0, 0, 0, 0)" || item.border !== "0px")) {
    throw new Error(`${name}/lambda-build: matrix is still wrapped in visual cards`);
  }
  const cellChrome = await page.locator(".ch8-click-matrix button").evaluateAll((nodes) => nodes.map((node) => ({
    active: node.classList.contains("is-active"),
    background: getComputedStyle(node).backgroundColor,
    border: getComputedStyle(node).borderTopWidth,
  })));
  const coloredInactive = cellChrome.filter((item) => !item.active && item.background !== "rgba(0, 0, 0, 0)");
  if (coloredInactive.length || cellChrome.some((item) => item.border !== "0px")) {
    throw new Error(`${name}/lambda-build: inactive matrix cells still look like nested cards`);
  }
  await assertBareInlineMath(page, ".ch8-build-equation .tex-inline, .ch8-cause-strip .tex-inline", `${name}/lambda-build`);
  const initialResult = await page.locator(".ch8-trace-formula strong .tex-inline").boundingBox();
  if (!initialResult || initialResult.width <= initialResult.height * 1.2) {
    throw new Error(`${name}/lambda-build: λ−2 collapsed into a vertical formula`);
  }
  await page.locator('[data-build-cell="12"]').click();
  const explanation = normalize(await page.locator(".ch8-cause-strip p").innerText());
  if (!explanation.includes("0−1") || !explanation.includes("−1")) throw new Error(`${name}/lambda-build: selected coordinate explanation is wrong`);
  await assertNoPageOverflow(page, `${name}/lambda-build`);
  await page.locator(".ch8-lambda-story").screenshot({ path: path.join(shots, `${name}-lambda-build.png`) });
}

async function checkSmith(page, name) {
  await open(page, "smith-form");
  await assertSeparated(page, ".ch8-smith-caption", ".ch8-smith-meaning", `${name}/smith caption and meaning`, 8);
  await page.locator("[data-smith-next]").click();
  if (!(await page.locator("[data-smith-operator]").evaluate((node) => node.classList.contains("is-right")))) throw new Error(`${name}/smith: column operation did not light right rail`);
  await page.locator("[data-smith-next]").click();
  if (!(await page.locator("[data-smith-operator]").evaluate((node) => node.classList.contains("is-left")))) throw new Error(`${name}/smith: row operation did not light left rail`);
  const operationBox = await page.locator(".ch8-smith-operator > strong .katex").boundingBox();
  if (!operationBox || operationBox.width <= operationBox.height * 2) {
    throw new Error(`${name}/smith: current operation formula collapsed into a vertical stack`);
  }
  await page.locator(".ch8-smith-cinema").screenshot({ path: path.join(shots, `${name}-smith.png`) });
}

async function checkInvariant(page, name) {
  await open(page, "invariant-factors");
  const formulaBox = await page.locator(".ch8-invariant-reference").boundingBox();
  if (!formulaBox || formulaBox.height > 110 || formulaBox.width < formulaBox.height * 2.8) {
    throw new Error(`${name}/invariant: Smith formula is vertically broken or too narrow`);
  }
  if (await page.locator(".ch8-invariant-chain .ch8-poly-chip").count()) {
    throw new Error(`${name}/invariant: divisibility chain still uses nested chips`);
  }
  await assertBareInlineMath(page, ".ch8-invariant-reference .tex-inline, .ch8-compression-field .tex-inline, .ch8-invariant-chain .tex-inline", `${name}/invariant`);
  const minorChrome = await page.locator(".ch8-minor-list i").evaluateAll((nodes) => nodes.map((node) => ({
    background: getComputedStyle(node).backgroundColor,
    borderRadius: getComputedStyle(node).borderRadius,
  })));
  if (minorChrome.some((item) => item.background !== "rgba(0, 0, 0, 0)" || item.borderRadius !== "0px")) {
    throw new Error(`${name}/invariant: minors still render as rounded cards`);
  }
  await page.locator('[data-k="3"]').click();
  const text = normalize(await page.locator(".ch8-invariant-output").innerText());
  if (!text.includes("d3") || !text.includes("λ+2")) throw new Error(`${name}/invariant: k=3 output missing`);
  await assertSeparated(page, ".ch8-gcd-core", ".ch8-invariant-output", `${name}/invariant gcd and output`, 12);
  await assertNoPageOverflow(page, `${name}/invariant`);
  await page.locator(".ch8-invariant-cinema").screenshot({ path: path.join(shots, `${name}-invariant.png`) });
}

async function checkSimilarity(page, name, touch) {
  await open(page, "similarity-criterion");
  const before = await page.evaluate(() => ({
    grid: document.querySelector("[data-grid-a]")?.getAttribute("d"),
    object: document.querySelector(".basis-output-shape")?.getAttribute("points"),
  }));
  await dragRange(page, "[data-basis-range]", 0.94, touch);
  const after = await page.evaluate(() => ({
    grid: document.querySelector("[data-grid-a]")?.getAttribute("d"),
    object: document.querySelector(".basis-output-shape")?.getAttribute("points"),
    matrix: document.querySelector("[data-basis-matrix]")?.textContent,
    value: document.querySelector("[data-basis-range]")?.value,
  }));
  if (before.grid === after.grid) throw new Error(`${name}/similarity: grid did not move`);
  if (before.object !== after.object) throw new Error(`${name}/similarity: geometric object moved during basis change`);
  if (Number(after.value) < 0.85 || Number(after.value) > 1 || !normalize(after.matrix).includes(Number(after.value).toFixed(2))) throw new Error(`${name}/similarity: matrix record did not follow the dragged basis`);
  await page.locator(".ch8-similarity-cinema").screenshot({ path: path.join(shots, `${name}-similarity.png`) });
}

async function checkElementary(page, name) {
  await open(page, "elementary-divisors");
  await page.locator('[data-factor-field="C"]').click();
  const opacity = await page.locator(".root-plus").evaluate((node) => Number(getComputedStyle(node).opacity));
  if (opacity < 0.8) throw new Error(`${name}/elementary: complex roots did not become visible`);
  const text = normalize(await page.locator(".ch8-family-columns").innerText());
  if (!text.includes("λ−i") || !text.includes("λ+i")) throw new Error(`${name}/elementary: split families missing`);
  const layerCounts = await page.locator(".ch8-factor-thread").evaluateAll((nodes) => nodes.map((node) => node.querySelectorAll("i").length));
  if (layerCounts.some((count, index) => count !== (index % 2) + 1)) {
    throw new Error(`${name}/elementary: factor height does not match its exponent: ${layerCounts.join(",")}`);
  }
  const blackSvgFills = await page.locator(".ch8-factor-plane svg *").evaluateAll((nodes) => nodes.filter((node) => getComputedStyle(node).fill === "rgb(0, 0, 0)").length);
  if (blackSvgFills) throw new Error(`${name}/elementary: SVG contains ${blackSvgFills} default black fills`);
  await page.locator(".ch8-elementary-cinema").screenshot({ path: path.join(shots, `${name}-elementary.png`) });
}

async function checkJordan(page, name) {
  await open(page, "jordan-derivation");
  await page.locator("[data-chain-next]").click();
  await page.locator("[data-chain-next]").click();
  const visibleNodes = await page.locator(".jordan-node.is-visible").count();
  if (visibleNodes !== 5) throw new Error(`${name}/jordan: expected five visible chain nodes, found ${visibleNodes}`);
  await page.locator('[data-growth-k="3"]').click();
  if (!normalize(await page.locator(".ch8-growth-readout").innerText()).includes("=5")) throw new Error(`${name}/jordan: ν3 readout missing`);
  await page.locator("[data-show-blocks]").click();
  await assertNoPageOverflow(page, `${name}/jordan`);
  await page.locator(".ch8-jordan-cinema").screenshot({ path: path.join(shots, `${name}-jordan.png`) });
}

async function checkRational(page, name) {
  await open(page, "rational-canonical-form");
  for (let i = 0; i < 3; i += 1) await page.locator("[data-orbit-next]").click();
  const opacity = await page.locator(".feedback-curve").evaluate((node) => Number(getComputedStyle(node).opacity));
  if (opacity < 0.8) throw new Error(`${name}/rational: feedback curve did not appear`);
  const matrix = normalize(await page.locator(".ch8-companion-matrix").innerText());
  if (!matrix.includes("−1") && !matrix.includes("-1")) throw new Error(`${name}/rational: feedback column missing`);
  await page.locator(".ch8-rational-cinema").screenshot({ path: path.join(shots, `${name}-rational.png`) });
}

const browser = await chromium.launch();
try {
  for (const config of [
    { name: "desktop-light", viewport: { width: 1440, height: 1000 }, colorScheme: "light", touch: false },
    { name: "desktop-dark", viewport: { width: 1440, height: 1000 }, colorScheme: "dark", touch: false },
    { name: "mobile-light", viewport: { width: 390, height: 844 }, colorScheme: "light", touch: true },
    { name: "mobile-dark", viewport: { width: 390, height: 844 }, colorScheme: "dark", touch: true },
  ]) {
    const context = await browser.newContext({ viewport: config.viewport, colorScheme: config.colorScheme, hasTouch: config.touch, isMobile: config.touch });
    if (config.colorScheme === "dark") await context.addInitScript(() => localStorage.setItem("la-visual-theme", "dark"));
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", (error) => errors.push(error.message));

    await checkLambdaBuild(page, config.name);
    await checkSmith(page, config.name);
    await checkInvariant(page, config.name);
    await checkSimilarity(page, config.name, config.touch);
    await checkElementary(page, config.name);
    await checkJordan(page, config.name);
    await checkRational(page, config.name);
    if (errors.length) throw new Error(`${config.name}: ${errors.join("\n")}`);
    await context.close();
    console.log(`CINEMATIC PASS ${config.name}`);
  }
} finally {
  await browser.close();
}
