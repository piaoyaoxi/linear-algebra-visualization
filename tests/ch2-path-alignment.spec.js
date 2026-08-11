const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");

const screenshotDir = path.resolve("test-results/ch2-screenshots");
fs.mkdirSync(screenshotDir, { recursive: true });

async function openLesson(page, id) {
  await page.goto(`http://127.0.0.1:4173/learn.html#ch2/${id}`, { waitUntil: "networkidle" });
  await expect(page.locator(`#${id}-interactive .ch2-lab`)).toBeVisible();
}

test.describe("Chapter 2 precision review", () => {
  test.use({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });

  test("§1 uses one restrained Canvas grid and project theme colors", async ({ page }) => {
    await openLesson(page, "determinant-intro");
    const canvas = page.locator("[data-ch2-canvas]");
    const box = await canvas.boundingBox();
    expect(box.width).toBeGreaterThan(540);
    expect(box.height).toBeGreaterThan(360);
    const stageBackground = await canvas.locator("..").evaluate((element) => getComputedStyle(element).backgroundImage);
    expect(stageBackground).toBe("none");
    await canvas.screenshot({ path: path.join(screenshotDir, "precision-area-grid.png") });
  });

  for (const permutation of ["123", "132", "213", "231", "312", "321"]) {
    test(`§3 aligns both ${permutation} route segments to selected elements`, async ({ page }) => {
      await openLesson(page, "n-order-determinant");
      await page.locator(`[data-six="${permutation}"]`).click();
      await expect(page.locator("[data-perm-out]")).toHaveText(permutation);
      await expect(page.locator("[data-term-path] line")).toHaveCount(2);
      await expect(page.locator("[data-select-table] td.is-selected")).toHaveCount(3);

      const shouldRepeat = !["123", "321"].includes(permutation);
      if (shouldRepeat) await expect(page.locator("[data-repeat-view]")).toBeVisible();
      else await expect(page.locator("[data-repeat-view]")).toBeHidden();

      const alignment = await page.evaluate(() => {
        const scene = document.querySelector("[data-term-scene]").getBoundingClientRect();
        const chosen = [...document.querySelectorAll("[data-select-table] td.is-selected button")];
        const repeated = document.querySelector("[data-repeat-view]");
        const key = document.querySelector("[data-perm-out]").textContent.trim();
        const copyRows = { 132: [0, 0, 1], 213: [0, 1, 1], 231: [0, 0, 1], 312: [0, 1, 1] }[key] || [0, 0, 0];
        const points = chosen.map((button, row) => {
          const col = Number(button.dataset.mainC);
          const target = copyRows[row]
            ? repeated.querySelector(`[data-repeat-r="${row}"][data-repeat-c="${col}"]`)
            : button;
          const rect = target.getBoundingClientRect();
          return { x: rect.left - scene.left + rect.width / 2, y: rect.top - scene.top + rect.height / 2 };
        });
        return [...document.querySelectorAll("[data-term-path] line")].flatMap((line, index) => [
          Math.hypot(Number(line.getAttribute("x1")) - points[index].x, Number(line.getAttribute("y1")) - points[index].y),
          Math.hypot(Number(line.getAttribute("x2")) - points[index + 1].x, Number(line.getAttribute("y2")) - points[index + 1].y),
        ]);
      });
      alignment.forEach((distance) => expect(distance).toBeLessThan(1.5));

      const cellBox = await page.locator("[data-select-table] button").first().boundingBox();
      expect(cellBox.width).toBeLessThanOrEqual(48);
      expect(cellBox.height).toBeLessThanOrEqual(46);
      await page.locator("[data-term-scene]").screenshot({
        path: path.join(screenshotDir, `precision-path-${permutation}.png`),
      });
    });
  }
});

test.describe("Chapter 2 precision mobile", () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

  test("§3 keeps the repeated determinant and path inside the viewport", async ({ page }) => {
    await openLesson(page, "n-order-determinant");
    await page.locator('[data-six="231"]').click();
    await expect(page.locator("[data-repeat-view]")).toBeVisible();
    await expect(page.locator("[data-term-path] line")).toHaveCount(2);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    await page.locator("[data-term-scene]").screenshot({
      path: path.join(screenshotDir, "precision-mobile-path-231.png"),
    });
  });
});
