import { chromium } from "playwright";

const base = "http://127.0.0.1:4173/learn.html";
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

async function openLesson(page, id) {
  await page.goto(`${base}#ch6/${id}`, { waitUntil: "networkidle" });
  await page.locator(".ch6-refined").waitFor({ state: "visible" });
  if ((await page.locator(".ch6-refined").count()) !== 1) {
    throw new Error(`${id}: expected exactly one refined workbench`);
  }
  for (const selector of [".ch6-formal", ".example-challenge", ".self-test-list"]) {
    if (!(await page.locator(selector).first().isVisible())) {
      throw new Error(`${id}: missing ${selector}`);
    }
  }
}

async function exerciseChapter(page) {
  await page.goto(`${base}#ch6`, { waitUntil: "networkidle" });
  if ((await page.locator(".lesson-card-grid .lesson-card").count()) !== 8) {
    throw new Error("Chapter 6 overview does not contain eight lesson cards");
  }

  for (const id of sections) {
    await openLesson(page, id);
    await assertNoOverflow(page, id);
  }

  await openLesson(page, "sets-maps");
  await page.locator('[data-preset="injective"]').click();
  if ((await page.locator("[data-inj]").innerText()) !== "是") throw new Error("injective preset failed");
  if ((await page.locator("[data-sur]").innerText()) !== "否") throw new Error("injective preset should not be surjective");
  await page.locator('[data-preset="surjective"]').click();
  if ((await page.locator("[data-inj]").innerText()) !== "否") throw new Error("surjective preset should not be injective");
  if ((await page.locator("[data-sur]").innerText()) !== "是") throw new Error("surjective preset failed");
  await page.locator('[data-preset="bijective"]').click();
  if ((await page.locator("[data-bij]").innerText()) !== "是") throw new Error("bijective preset failed");
  await page.locator('[data-preset="incomplete"]').click();
  if (!(await page.locator("[data-map-status]").innerText()).includes("尚未构成")) {
    throw new Error("incomplete mapping was accepted");
  }

  await openLesson(page, "vector-space-definition");
  await page.locator('[data-case="rgb"]').click();
  if ((await page.locator(".ch6-channel").count()) !== 9) throw new Error("RGB lab is not three-channel");
  if (!(await page.locator("[data-combo]").innerText()).includes("失败")) throw new Error("RGB counterexample did not fail");

  await openLesson(page, "basis-coordinates");
  await page.locator('[data-preset="redundant"]').click();
  if (!(await page.locator("[data-basis]").innerText()).includes("失败")) throw new Error("redundant generating set was called a basis");
  await page.locator('[data-generator="2"]').uncheck();
  if (!(await page.locator("[data-basis]").innerText()).includes("通过")) throw new Error("removing redundancy did not produce a basis");

  await openLesson(page, "change-of-basis");
  await page.locator('[data-wpreset="same"]').click();
  if (!(await page.locator("[data-p]").innerText()).includes("[[1, 0], [0, 1]]")) {
    throw new Error("same-basis transition is not identity");
  }
  await page.locator('[data-mode="active"]').click();
  if (!(await page.locator("[data-active-readout]").isVisible())) throw new Error("active panel did not open");
  if (!(await page.locator("[data-passive-readout]").isHidden())) throw new Error("passive panel remained visible in active mode");

  await openLesson(page, "subspaces");
  await page.locator('[data-case="aff"]').click();
  if (!(await page.locator("[data-s-final]").innerText()).includes("失败")) throw new Error("affine plane was accepted as a subspace");
  await page.locator('[data-case="pzero"]').click();
  if (!(await page.locator("[data-s-final]").innerText()).includes("通过")) throw new Error("linear polynomial constraint was rejected");

  await openLesson(page, "intersection-sum");
  await page.locator('[data-case="planes"]').click();
  if ((await page.locator("[data-ds]").innerText()) !== "3") throw new Error("plane-sum dimension is wrong");
  if (!(await page.locator("[data-dim-eq]").innerText()).includes("2 + 2 − 1 = 3")) throw new Error("dimension ledger is wrong");

  await openLesson(page, "direct-sum");
  await page.locator('[data-case="oblique"]').click();
  if (!(await page.locator("[data-cover]").innerText()).includes("通过")) throw new Error("oblique direct sum did not cover");
  if (!(await page.locator("[data-zero-inter]").innerText()).includes("通过")) throw new Error("oblique direct sum did not have zero intersection");
  await page.locator('[data-case="overlap"]').click();
  if (!(await page.locator("[data-zero-inter]").innerText()).includes("失败")) throw new Error("overlap did not break uniqueness");
  await page.locator('[data-case="incomplete"]').click();
  if (!(await page.locator("[data-cover]").innerText()).includes("失败")) throw new Error("incomplete sum incorrectly covered R2");

  await openLesson(page, "isomorphism");
  await page.locator('[data-mode="iso"]').click();
  if (!(await page.locator("[data-iso-final]").innerText()).includes("通过")) throw new Error("coordinate isomorphism failed");
  await page.locator('[data-mode="projection"]').click();
  if (!(await page.locator("[data-iso-inj]").innerText()).includes("失败")) throw new Error("projection incorrectly passed injectivity");
  await page.locator('[data-mode="nonlinear"]').click();
  if (!(await page.locator("[data-linear]").innerText()).includes("失败")) throw new Error("nonlinear rule incorrectly passed linearity");

  await page.goto(`${base}#ch4/matrix-language`, { waitUntil: "networkidle" });
  await page.locator("canvas").first().waitFor({ state: "visible" });
  await assertNoOverflow(page, "Chapter 4 regression");
}

const browser = await chromium.launch();
try {
  for (const config of [
    { name: "desktop-light", viewport: { width: 1440, height: 1000 }, dark: false, reducedMotion: "no-preference" },
    { name: "desktop-dark", viewport: { width: 1440, height: 1000 }, dark: true, reducedMotion: "no-preference" },
    { name: "mobile-light", viewport: { width: 390, height: 844 }, dark: false, reducedMotion: "no-preference" },
    { name: "mobile-reduced", viewport: { width: 390, height: 844 }, dark: false, reducedMotion: "reduce" },
  ]) {
    const context = await browser.newContext({ viewport: config.viewport, reducedMotion: config.reducedMotion });
    if (config.dark) {
      await context.addInitScript(() => localStorage.setItem("la-visual-theme", "dark"));
    }
    const page = await context.newPage();
    const errors = collectErrors(page);
    await exerciseChapter(page);
    if (errors.length) throw new Error(`${config.name}: ${errors.join("\n")}`);
    console.log(`PASS ${config.name}`);
    await context.close();
  }
} finally {
  await browser.close();
}
