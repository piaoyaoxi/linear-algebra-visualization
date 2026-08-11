const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");

const lessons = [
  ["determinant-intro", "引言"],
  ["permutations", "排列"],
  ["n-order-determinant", "n 阶行列式"],
  ["determinant-properties", "n 阶行列式的性质"],
  ["determinant-computation", "行列式的计算"],
  ["cofactor-expansion", "行列式按一行（列）展开"],
  ["cramer-rule", "克拉默（Cramer）法则"],
  ["laplace-and-product", "拉普拉斯（Laplace）定理·行列式的乘法规则"],
];

const screenshotDir = path.resolve("test-results/ch2-screenshots");
fs.mkdirSync(screenshotDir, { recursive: true });

function browserErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

async function openLesson(page, id) {
  await page.goto(`http://127.0.0.1:4173/learn.html#ch2/${id}`, { waitUntil: "networkidle" });
  await expect(page.locator("#mainContent .lesson-cover h1")).toBeVisible();
  await expect(page.locator(`#${id}-formal .ch2-formal`)).toBeVisible();
  await expect(page.locator(`#${id}-interactive .ch2-lab`).first()).toBeVisible();
  await expect(page.locator(`#${id}-example`)).toBeVisible();
  await expect(page.locator(`#${id}-quiz`)).toBeVisible();
  await expect(page.locator(`#${id}-summary .ch2-lesson-bridge`)).toBeVisible();
}

async function noOverflow(page) {
  const value = await page.evaluate(() => Math.max(
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
    document.body.scrollWidth - document.body.clientWidth,
  ));
  expect(value).toBeLessThanOrEqual(2);
}

async function shot(page, name) {
  await page.addStyleTag({ content: ".topbar,.sidebar,.page-toc,.drawer-backdrop{visibility:hidden!important}" });
  await page.screenshot({ path: path.join(screenshotDir, `${name}.png`), fullPage: true });
}

test.describe("Chapter 2 desktop visual system", () => {
  test.use({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });

  for (const [id, title] of lessons) {
    test(`${title} mounts one error-free interaction implementation`, async ({ page }) => {
      const errors = browserErrors(page);
      await openLesson(page, id);
      await expect(page.locator("#mainContent .lesson-cover h1")).toHaveText(title);
      await expect(page.locator(`#${id}-interactive .ch2-lab`)).toHaveCount(id === "laplace-and-product" ? 2 : 1);
      const box = await page.locator(`#${id}-interactive .ch2-lab`).first().boundingBox();
      expect(box.width).toBeGreaterThan(620);
      await noOverflow(page);
      expect(errors).toEqual([]);
    });
  }

  test("saves all eight desktop pages for human visual review", async ({ page }) => {
    const errors = browserErrors(page);
    for (const [id] of lessons) {
      await openLesson(page, id);
      await page.locator(`#${id}-interactive`).scrollIntoViewIfNeeded();
      await shot(page, `desktop-${id}`);
    }
    expect(errors).toEqual([]);
  });

  test("section-specific compositions keep follow-up content below the main visual", async ({ page }) => {
    const box = async (selector) => page.locator(selector).boundingBox();

    await openLesson(page, "n-order-determinant");
    const termScene = await box(".ch2-term-scene");
    const termReading = await box(".ch2-term-reading");
    const termIndex = await box(".ch2-term-index");
    expect(termScene.x + termScene.width).toBeLessThanOrEqual(termReading.x + 2);
    expect(termIndex.y).toBeGreaterThanOrEqual(Math.max(termScene.y + termScene.height, termReading.y + termReading.height) - 2);

    await openLesson(page, "determinant-properties");
    const comparison = await box(".ch2-compare-stage");
    const operationSummary = await box(".ch2-operation-summary");
    expect(comparison.width).toBeGreaterThan(760);
    expect(operationSummary.y).toBeGreaterThanOrEqual(comparison.y + comparison.height - 2);

    for (const [id, mainSelector, followSelector] of [
      ["cofactor-expansion", ".ch2-cofactor-top", ".ch2-route-explorer"],
      ["cramer-rule", ".ch2-cramer-main", ".ch2-cramer-explanation"],
      ["laplace-and-product", ".ch2-laplace-main", ".ch2-laplace-meter"],
    ]) {
      await openLesson(page, id);
      const main = await box(mainSelector);
      const follow = await box(followSelector);
      expect(follow.width).toBeGreaterThanOrEqual(main.width - 2);
      expect(follow.y).toBeGreaterThanOrEqual(main.y + main.height - 2);
    }
  });

  test("§1 synchronizes geometry, sign and collapse", async ({ page }) => {
    await openLesson(page, "determinant-intro");
    await page.locator('[data-preset="shear"]').click();
    await expect(page.locator("[data-det]")).toHaveText("1");
    await page.locator('[data-preset="collinear"]').click();
    await expect(page.locator("[data-status]")).toContainText("维度塌缩");
    await expect(page.locator("[data-det]")).toHaveText("0");
    await page.locator('[data-preset="mirror"]').click();
    await expect(page.locator("[data-status]")).toContainText("方向翻转");
  });

  test("§2 turns one adjacent exchange into one inversion change", async ({ page }) => {
    await openLesson(page, "permutations");
    await expect(page.locator("[data-tau]")).toHaveText("3");
    await expect(page.locator("[data-wires] path")).toHaveCount(4);
    await page.locator("[data-adj-step]").click();
    await expect(page.locator("[data-tau]")).toHaveText("2");
    await expect(page.locator("[data-action]")).toContainText("恰好减少 1");
  });

  test("§3 builds permutation 231 with one optional repeated view", async ({ page }) => {
    await openLesson(page, "n-order-determinant");
    await page.locator("[data-select-231]").click();
    await expect(page.locator("[data-perm-out]")).toHaveText("231");
    await expect(page.locator("[data-term-path] line")).toHaveCount(2);
    await expect(page.locator("[data-repeat-view]")).toBeVisible();
    await page.locator("[data-triangle-toggle]").click();
    await expect(page.locator("[data-zero-out]")).toContainText("贡献为 0");
    await expect(page.locator("[data-select-msg]")).toContainText("路径满足每行每列各一次");
  });

  test("§4 compares before and after geometry for each determinant law", async ({ page }) => {
    await openLesson(page, "determinant-properties");
    await expect(page.locator("[data-row-before]")).toBeVisible();
    await expect(page.locator("[data-row-canvas]")).toBeVisible();
    await page.locator("[data-op-swap]").click();
    await expect(page.locator("[data-factor]")).toHaveText("-1");
    await page.locator("[data-op-add]").click();
    await expect(page.locator("[data-ledger]")).toContainText("剪切");
  });

  test("§5 follows one two-step route to upper triangular form", async ({ page }) => {
    await openLesson(page, "determinant-computation");
    await page.locator("[data-op-demo]").click();
    await expect(page.locator("[data-step-count]")).toHaveText("2");
    await expect(page.locator("[data-triangle-status]")).toContainText("已经是上三角");
    await expect(page.locator("[data-cur]")).toHaveText("1");
  });

  test("§6 crosses out the selected row and column before forming the minor", async ({ page }) => {
    await openLesson(page, "cofactor-expansion");
    await page.locator('[data-cof-table] button[data-r="0"][data-c="2"]').click();
    await expect(page.locator(".ch2-cut-line")).toHaveCount(2);
    await expect(page.locator("[data-cut-label]")).toContainText("删去第 1 行与第 3 列");
    await expect(page.locator("[data-minor-table] td")).toHaveCount(4);
    await expect(page.locator("[data-mij]")).toHaveText("-12");
  });

  test("§7 distinguishes unique, sensitive and singular column-space states", async ({ page }) => {
    await openLesson(page, "cramer-rule");
    await page.locator("[data-cramer-near]").click();
    await expect(page.locator("[data-sol]")).toContainText("接近共线");
    await page.locator("[data-cramer-sing]").click();
    await expect(page.locator("[data-d]")).toHaveText("0");
    await expect(page.locator("[data-sol]")).toContainText("无穷多解");
    await page.locator("[data-cramer-none]").click();
    await expect(page.locator("[data-sol]")).toContainText("无解");
  });

  test("§8 pairs complementary minors and composes I to B to AB", async ({ page }) => {
    await openLesson(page, "laplace-and-product");
    await expect(page.locator("[data-pair-list] button")).toHaveCount(6);
    await expect(page.locator("[data-pair-sum]")).toHaveText(await page.locator("[data-pair-det]").innerText());
    await page.locator('[data-prod-preset="project"]').click();
    await expect(page.locator("[data-dab]")).toHaveText("0");
    await expect(page.locator("[data-rule-status]")).toContainText("验证完成");
  });

  test("route teardown removes Chapter 2 and keeps Chapter 4 usable", async ({ page }) => {
    const errors = browserErrors(page);
    await openLesson(page, "laplace-and-product");
    await page.locator('[data-prod-preset="doubleMirror"]').click();
    await page.goto("http://127.0.0.1:4173/learn.html#ch4/matrix-language", { waitUntil: "networkidle" });
    await expect(page.locator("#mainContent .lesson-cover h1")).toContainText("矩阵概念");
    await expect(page.locator('[class*="ch2-"], [data-prod]')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

test.describe("Chapter 2 mobile and dark appearance", () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

  test("all eight pages reflow without horizontal overflow", async ({ page }) => {
    const errors = browserErrors(page);
    for (const [id] of lessons) {
      await openLesson(page, id);
      await noOverflow(page);
    }
    expect(errors).toEqual([]);
  });

  test("mobile metric groups remain compact instead of becoming tall single columns", async ({ page }) => {
    await openLesson(page, "cofactor-expansion");
    const cofactorColumns = await page.locator(".ch2-cofactor-top .ch2-meter").evaluate(
      (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
    );
    expect(cofactorColumns).toBe(2);

    await openLesson(page, "cramer-rule");
    const cramerColumns = await page.locator(".ch2-cramer-main .ch2-meter").evaluate(
      (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
    );
    expect(cramerColumns).toBe(3);

    await openLesson(page, "laplace-and-product");
    const pairColumns = await page.locator(".ch2-pair-list").evaluate(
      (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
    );
    expect(pairColumns).toBe(2);
  });

  test("saves the four geometry-heavy mobile pages", async ({ page }) => {
    for (const id of ["determinant-intro", "cofactor-expansion", "cramer-rule", "laplace-and-product"]) {
      await openLesson(page, id);
      await page.locator(`#${id}-interactive`).scrollIntoViewIfNeeded();
      await shot(page, `mobile-${id}`);
    }
  });

  test("dark appearance and reduced motion preserve meaning", async ({ page }) => {
    await openLesson(page, "determinant-intro");
    await page.locator("#themeToggle").click();
    await page.locator('[data-preset="mirror"]').click();
    await expect(page.locator("[data-status]")).toContainText("方向翻转");
    await noOverflow(page);
    await shot(page, "mobile-dark-determinant-intro");
  });
});
