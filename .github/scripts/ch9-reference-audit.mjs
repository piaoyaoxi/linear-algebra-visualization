import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const base = "http://127.0.0.1:4173/learn.html";
const out = "/tmp/ch9-reference-audit";
fs.mkdirSync(out, { recursive: true });

const pages = [
  ["ch1", "#ch1/univariate-polynomials"],
  ["ch4", "#ch4/matrix-language"],
  ["ch5", "#ch5/positive-definite"],
];

const configs = [
  ["desktop-light", { width: 1440, height: 1000 }, "light"],
  ["desktop-dark", { width: 1440, height: 1000 }, "dark"],
  ["mobile-light", { width: 390, height: 844 }, "light"],
  ["mobile-dark", { width: 390, height: 844 }, "dark"],
];

const browser = await chromium.launch();
const report = [];
try {
  for (const [configName, viewport, scheme] of configs) {
    const context = await browser.newContext({ viewport, colorScheme: scheme });
    if (scheme === "dark") {
      await context.addInitScript(() => localStorage.setItem("la-visual-theme", "dark"));
    }
    const page = await context.newPage();
    for (const [name, hash] of pages) {
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${base}${hash}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts?.ready);
      await page.waitForTimeout(250);
      const main = page.locator("main.content");
      await main.screenshot({ path: path.join(out, `${configName}-${name}.png`), fullPage: true });
      const metrics = await page.evaluate(() => {
        const root = getComputedStyle(document.documentElement);
        const sample = document.querySelector(".section-band, .ch1-lab, .ch5-lab, #matrix-language-formal .matrix-source-card");
        const sampleStyle = sample ? getComputedStyle(sample) : null;
        return {
          route: document.body.dataset.route,
          view: document.body.dataset.view,
          tokens: Object.fromEntries([
            "--bg", "--surface-solid", "--surface-soft", "--text", "--muted", "--line", "--accent", "--accent-strong", "--coral", "--radius"
          ].map((key) => [key, root.getPropertyValue(key).trim()])),
          sample: sampleStyle ? {
            background: sampleStyle.backgroundColor,
            borderColor: sampleStyle.borderColor,
            borderRadius: sampleStyle.borderRadius,
            boxShadow: sampleStyle.boxShadow,
          } : null,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          height: document.documentElement.scrollHeight,
        };
      });
      report.push({ configName, name, errors, ...metrics });
    }
    await context.close();
  }
} finally {
  await browser.close();
}
fs.writeFileSync(path.join(out, "report.json"), JSON.stringify(report, null, 2));
