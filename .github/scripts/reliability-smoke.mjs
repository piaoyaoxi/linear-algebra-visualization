import assert from "node:assert/strict";
import { chromium } from "playwright";

// Regression gate for prediction locks (no answer before a guess), chapter deep links, search snippets and browser storage failures.
const origin = process.env.SITE_ORIGIN || "http://127.0.0.1:4173";
const browser = await chromium.launch();

async function open(route, initScript) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  if (initScript) await page.addInitScript(initScript);
  await page.goto(`${origin}/learn.html#${route}`, { waitUntil: "networkidle" });
  await page.locator("#chapterNav .chapter-group").first().waitFor({ state: "attached" });
  return { page, errors };
}

try {
  {
    const { page, errors } = await open("guide");
    assert.ok(await page.locator("#chapterNav [data-section-link]").count() >= 70, "all chapter links remain visible");
    assert.deepEqual(errors, [], "guide must not raise page errors");
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
    // the question asks for the sign of det: no preset may show it before a guess
    const { page, errors } = await open("ch2/determinant-intro");
    const gate = page.locator("#determinant-intro-interactive .ch3l-predict");
    await gate.waitFor();
    const det = page.locator("[data-det]");
    const labels = await page.locator("[data-preset]").allTextContents();
    assert.ok(!labels.some((label) => /[−-]\s*\d/.test(label)), "no preset label may name a signed det before a guess");
    await page.locator('[data-preset="mirror"]').click();
    await page.waitForFunction(() => document.querySelector("[data-abs]")?.textContent === "1");
    assert.equal(await det.textContent(), "?", "the mirror preset must not show the sign of det before a guess");
    assert.ok(!(await page.locator("[data-status]").textContent()).includes("方向"), "the orientation status waits for a guess");
    await gate.locator("button[data-i]").first().click();
    await page.waitForFunction(() => document.querySelector("[data-det]")?.textContent === "−1");
    assert.deepEqual(errors, [], "determinant intro must have no page errors");
    await page.close();
  }
  {
    // the question asks how many real solutions the circle and x = y have
    const { page, errors } = await open("ch3/binary-higher-degree");
    const lab = page.locator("#binary-higher-degree-interactive");
    const gate = lab.locator(".ch3l-predict");
    await gate.waitFor();
    const canvas = lab.locator("[data-canvas]");
    const description = lab.locator("[data-description]");
    assert.equal(await canvas.getAttribute("data-second-curve"), null, "the line x = y waits for a guess");
    assert.ok(!(await description.textContent()).includes("交点"), "the equations card must not count the crossings before a guess");
    const next = lab.locator("[data-next]");
    assert.equal(await next.isDisabled(), true, "stepping on to the verification waits for a guess");
    await gate.locator("button[data-i]").first().click();
    assert.equal(await next.isEnabled(), true, "the steps unlock once predicted");
    assert.equal(await canvas.getAttribute("data-second-curve"), "", "the line x = y is drawn once predicted");
    assert.ok((await description.textContent()).includes("交点"), "the crossings are described once predicted");
    assert.deepEqual(errors, [], "resultant lesson must have no page errors");
    await page.close();
  }
  {
    // the question asks which minors row 2 needs: a₂₂ must not be preselected
    const { page, errors } = await open("ch2/cofactor-expansion");
    await page.locator("#cofactor-expansion-interactive .ch3l-predict").waitFor();
    const selected = page.locator("[data-cof-table] td.is-selected button");
    assert.equal(await selected.count(), 1);
    assert.notEqual(await selected.getAttribute("data-r"), "1", "the starting selection must sit outside row 2");
    assert.deepEqual(errors, [], "cofactor lesson must have no page errors");
    await page.close();
  }
  {
    // the block count is ν₁ = dim ker N: the question may give rank N, not the kernel or the count
    const { page, errors } = await open("ch8/jordan-derivation");
    const question = page.locator("#jordan-derivation-interactive .ch7l-predict-q p");
    await question.waitFor();
    assert.ok(!/核|ker|贡献/.test(await question.textContent()), "the A₁ question must not hand over dim ker N");
    assert.deepEqual(errors, [], "Jordan derivation lesson must have no page errors");
    await page.close();
  }
  {
    // search snippets: formulas are set with KaTeX, never shown as TeX source; no flags or figure keys
    const { page, errors } = await open("guide");
    const leaks = await page.evaluate(() => {
      const found = [];
      for (const entry of window.AlgebraSearch.search("的", { limit: 999 }).results) {
        entry.parts.forEach((part) => {
          if (part.tex == null && /\\[a-zA-Z]+|[_^]\{/.test(part.text)) found.push(`${entry.href}: ${part.text.slice(0, 60)}`);
        });
        if (/(^|[^a-z-])(false|true|three-planes|gallery)([^a-z-]|$)/.test(entry.body)) found.push(`${entry.href}: internal value`);
      }
      return found;
    });
    assert.deepEqual(leaks, [], "indexed text must not carry TeX source or internal values");
    await page.locator(".search-trigger, [aria-label='搜索课程内容']").first().click();
    await page.locator("input[type='search']").fill("rank");
    const snippet = page.locator(".search-result-snippet").first();
    await snippet.waitFor();
    assert.ok(await snippet.locator(".search-result-tex .katex").count() > 0, "snippet formulas are rendered with KaTeX");
    assert.ok(!(await snippet.innerText()).includes("\\"), "snippets show no TeX source");
    assert.deepEqual(errors, [], "search must not raise page errors");
    await page.close();
  }
  {
    const { page, errors } = await open("guide", () => {
      window.localStorage.setItem("la-visual-progress", "{ invalid json");
    });
    assert.ok(await page.locator("#chapterNav [data-section-link]").count() >= 70);
    assert.deepEqual(errors, [], "corrupt progress must not crash startup");
    await page.close();
  }
  {
    const { page, errors } = await open("guide", () => {
      Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new Error("storage unavailable"); } });
    });
    assert.ok(await page.locator("#chapterNav [data-section-link]").count() >= 70);
    assert.deepEqual(errors, [], "blocked storage must not crash startup");
    await page.close();
  }
  console.log("Reliability smoke: deep links, prediction gating, search snippets and storage fallbacks passed.");
} finally {
  await browser.close();
}
