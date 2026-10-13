import assert from "node:assert/strict";
import { chromium } from "playwright";

// Regression gate for on-demand lesson code and browser storage failures.
const origin = process.env.SITE_ORIGIN || "http://127.0.0.1:4173";
const browser = await chromium.launch();

async function open(route, initScript) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  if (initScript) await page.addInitScript(initScript);
  await page.goto(`${origin}/learn.html#${route}`, { waitUntil: "networkidle" });
  console.log("route", route, await page.evaluate(() => ({ bodyRoute: document.body.dataset.route, view: document.body.dataset.view, count: document.querySelectorAll("#chapterNav .chapter-group").length, examples: document.querySelectorAll("[data-example-challenge]").length, title: document.title, h1: document.querySelector("main h1")?.textContent, assetCount: document.querySelectorAll("script[src*=ch6]").length })), errors);
  await page.locator("#chapterNav .chapter-group").first().waitFor({ state: "attached" });
  return { page, errors };
}

try {
  {
    const { page, errors } = await open("home");
    assert.equal(await page.evaluate(() => typeof window.Ch8Poly), "undefined", "home should not load chapter 8 lab code");
    assert.ok(await page.locator("#chapterNav [data-section-link]").count() >= 70, "all chapter links remain visible");
    assert.deepEqual(errors, [], "home must not raise page errors");
    await page.close();
  }
  {
    const { page, errors } = await open("ch8/lambda-matrix");
    await page.locator(".ch7l-body").first().waitFor();
    assert.equal(await page.evaluate(() => typeof window.Ch8Poly), "object", "chapter 8 dependencies must load");
    assert.deepEqual(errors, [], "deep links must load without page errors");
    await page.close();
  }
  {
    const { page, errors } = await open("ch6/basis-coordinates");
    const gate = page.locator(".ch6l-predict").first();
    await gate.waitFor();
    const look = page.locator("[data-look]").first();
    assert.equal(await look.isDisabled(), true, "answer-revealing camera shortcut must wait for a prediction");
    await gate.locator("button[data-i]").first().click();
    assert.equal(await look.isEnabled(), true, "shortcut must unlock after choosing a prediction");
    assert.deepEqual(errors, [], "chapter 6 must load without page errors");
    await page.close();
  }
  {
    const { page, errors } = await open("ch6/direct-sum");
    const gate = page.locator(".ch6l-predict:not([hidden])").first();
    await gate.waitFor();
    const low = page.locator("[data-low]").first();
    assert.equal(await low.isDisabled(), true, "decomposition changes wait for a prediction");
    await gate.locator("button[data-i]").first().click();
    assert.equal(await low.isEnabled(), true, "decomposition unlocks once predicted");
    assert.deepEqual(errors, [], "direct sum lesson must have no page errors");
    await page.close();
  }
  {
    const { page, errors } = await open("home", () => {
      window.localStorage.setItem("la-visual-progress", "{ invalid json");
    });
    assert.ok(await page.locator("#chapterNav [data-section-link]").count() >= 70);
    assert.deepEqual(errors, [], "corrupt progress must not crash startup");
    await page.close();
  }
  {
    const { page, errors } = await open("home", () => {
      Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new Error("storage unavailable"); } });
    });
    assert.ok(await page.locator("#chapterNav [data-section-link]").count() >= 70);
    assert.deepEqual(errors, [], "blocked storage must not crash startup");
    await page.close();
  }
  console.log("Reliability smoke: lazy lessons, prediction gating and storage fallbacks passed.");
} finally {
  await browser.close();
}
