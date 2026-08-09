const { test, expect } = require("@playwright/test");

async function openLesson(page, id) {
  await page.goto(`http://127.0.0.1:4173/learn.html#ch2/${id}`, { waitUntil: "networkidle" });
  await expect(page.locator(`#${id}-interactive .ch2-lab`).first()).toBeVisible();
}

function browserErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

test.describe("Chapter 2 normal-motion interactions", () => {
  test.use({ viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference" });

  test("§1 accepts a new preset after each geometry transition", async ({ page }) => {
    const errors = browserErrors(page);
    await openLesson(page, "determinant-intro");
    await page.locator('[data-preset="shear"]').click();
    await expect(page.locator("[data-det]")).toHaveText("1", { timeout: 3000 });
    await page.locator('[data-preset="collinear"]').click();
    await expect(page.locator("[data-status]")).toContainText("维度塌缩", { timeout: 3000 });
    await page.locator('[data-preset="negative2"]').click();
    await expect(page.locator("[data-status]")).toContainText("方向翻转", { timeout: 3000 });
    await expect(page.locator("[data-det]")).toHaveText("-2", { timeout: 3000 });
    expect(errors).toEqual([]);
  });

  test("§3 draws a repeated-view path after the three row choices", async ({ page }) => {
    const errors = browserErrors(page);
    await openLesson(page, "n-order-determinant");
    await page.locator("[data-select-231]").click();
    await expect(page.locator("[data-perm-out]")).toHaveText("231", { timeout: 3000 });
    await expect(page.locator("[data-term-path] line")).toHaveCount(2);
    await expect(page.locator("[data-repeat-view]")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("§7 completes the transition to the near-singular state", async ({ page }) => {
    const errors = browserErrors(page);
    await openLesson(page, "cramer-rule");
    await page.locator("[data-cramer-near]").click();
    await expect(page.locator("[data-d]")).toHaveText("-0.02", { timeout: 4000 });
    await expect(page.locator("[data-sol]")).toContainText("接近共线", { timeout: 4000 });
    await expect(page.locator("[data-slide-proof]")).toContainText("沿 a₂ 方向滑到 x₁a₁", { timeout: 4000 });
    expect(errors).toEqual([]);
  });

  test("§8 animates the same shape from I to B and then B to AB", async ({ page }) => {
    const errors = browserErrors(page);
    await openLesson(page, "laplace-and-product");
    const replay = page.locator("[data-prod-replay]");
    await expect(replay).toBeEnabled({ timeout: 5000 });
    await page.locator('[data-prod-preset="doubleMirror"]').click();
    await expect(replay).toBeDisabled();
    await expect(replay).toBeEnabled({ timeout: 5000 });
    await expect(page.locator("[data-da]")).toHaveText("-1");
    await expect(page.locator("[data-db]")).toHaveText("-1");
    await expect(page.locator("[data-prod]")).toHaveText("1");
    await expect(page.locator("[data-dab]")).toHaveText("1");
    await expect(page.locator("[data-rule-status]")).toContainText("验证完成");
    expect(errors).toEqual([]);
  });
});
