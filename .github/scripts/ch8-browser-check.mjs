import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

// Browser gate for Chapter 8: every lesson renders on the standard lesson
// route without errors; every lab hides its readout and conclusion until the
// student predicts, responds to its controls after the prediction, and opens
// the conclusion only after predicting and acting; the page never scrolls
// sideways; the sidebar keeps every chapter.
const base = process.env.CH8_BASE_URL || "http://127.0.0.1:4173/learn.html";
const evidence = process.env.CH8_EVIDENCE || "test-results/ch8-browser-evidence";
await mkdir(evidence, { recursive: true });
const forbidden = ["正在开发", "占位", "即将制作", "待完善", "待补充", "原型", "观察顺序", "实验结束前回答"];

/* How the check operates each lab after predicting. */
const routes = [
  {
    id: "lambda-matrix",
    canvas: true,
    async act(page, lab) {
      // Drag λ₀ from 1/2 to 2 (world x = λ − 2, axis at world y = −1.5, extent 3.1).
      await lab.locator(".ch7p-canvas").scrollIntoViewIfNeeded();
      const box = await lab.locator(".ch7p-canvas").boundingBox();
      const s = Math.min(box.width, box.height) / 6.2;
      const P = (x, y) => [box.x + box.width / 2 + x * s, box.y + box.height / 2 - y * s];
      const [x1, y1] = P(-1.5, -1.5);
      const [x2] = P(0, -1.5);
      await page.mouse.move(x1, y1);
      await page.mouse.down();
      await page.mouse.move(x2, y1, { steps: 8 });
      await page.mouse.up();
    },
  },
  {
    id: "smith-form",
    async act(page, lab) {
      for (let step = 0; step < 40; step += 1) {
        if (await lab.locator(".ch7l-card .ch7l-ok").count()) return;
        let moved = false;
        for (const a of ["clear", "lift", "next"]) {
          const b = lab.locator(`[data-act=${a}]:not([disabled])`);
          if (await b.count()) {
            await b.click();
            moved = true;
            break;
          }
        }
        if (moved) continue;
        const cell = await lab.evaluate((el) => {
          const deg = (t) => (t.querySelector("small").textContent === "常数" ? 0 : parseInt(t.querySelector("small").textContent, 10));
          return [...el.querySelectorAll(".ch8l-tile:not(:disabled)")].sort((a, b) => deg(a) - deg(b))[0]?.dataset.cell;
        });
        assert.ok(cell, "smith-form: no move available before the standard form");
        await lab.locator(`[data-cell="${cell}"]`).click();
      }
      throw new Error("smith-form: did not reach the standard form");
    },
    async verify(lab) {
      assert.ok((await lab.locator(".ch7l-side").innerText()).includes("整除链"), "smith-form: divisibility chain missing");
    },
  },
  {
    id: "invariant-factors",
    async act(page, lab) {
      const before = await lab.locator(".ch7l-side .ch8l-list").first().innerText();
      await lab.locator("[data-op]").click();
      assert.equal(await lab.locator(".ch7l-side .ch8l-list").first().innerText(), before, "invariant-factors: D_k changed under an elementary operation");
    },
  },
  {
    id: "elementary-divisors",
    canvas: true,
    preset: 1,
    async act(page, lab) {
      await lab.locator(".ch7l-toolbar .ch7l-chip", { hasText: "复数域" }).click();
      assert.ok((await lab.locator(".ch7l-side").innerText()).includes("共 5 个"), "elementary-divisors: complex count");
    },
  },
  { id: "similarity-criterion", figure: true },
  {
    id: "jordan-derivation",
    canvas: true,
    async act(page, lab) {
      await lab.locator("[data-up]").click();
    },
  },
  {
    id: "rational-canonical-form",
    canvas: true,
    async act(page, lab) {
      await lab.locator('[data-a="2"]').fill("2");
    },
  },
];

const browser = await chromium.launch({ headless: true });

async function check(viewport, dark) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("Failed to load resource")) errors.push(`console: ${m.text()}`);
    if (m.type() === "warning" && m.text().includes("Chapter 8")) errors.push(`console: ${m.text()}`);
  });
  const tag = `${viewport.width}px${dark ? " dark" : ""}`;

  await page.goto(`${base}#ch8`, { waitUntil: "networkidle" });
  const chapters = await page.locator("#chapterNav .chapter-group, nav .chapter-group").count();
  assert.ok(chapters >= 11, `${tag}: sidebar lists ${chapters} chapter groups`);
  assert.equal(await page.locator('.chapter-group[data-chapter="ch8"] [data-section-link]').count(), 7, `${tag}: ch8 sidebar links`);
  assert.ok((await page.locator("main").innerText()).includes("§7"), `${tag}: chapter overview lists the sections`);

  for (const route of routes) {
    const label = `${route.id} @${tag}`;
    await page.goto(`${base}#ch8/${route.id}`, { waitUntil: "networkidle" });
    if (dark) await page.evaluate(() => document.body.classList.add("dark"));
    await page.waitForTimeout(300);
    assert.equal(await page.locator("h1").count(), 1, `${label}: title`);
    assert.equal(await page.locator(".katex-error").count(), 0, `${label}: KaTeX error`);
    assert.equal(await page.locator("[data-example-challenge]").count(), 1, `${label}: example`);
    assert.equal(await page.locator(".self-test-list").count(), 1, `${label}: self test`);
    assert.ok((await page.locator(".ch7l-theorem").count()) >= 2, `${label}: theorem blocks`);
    const body = await page.locator("main").innerText();
    for (const phrase of forbidden) assert.ok(!body.includes(phrase), `${label}: forbidden phrase ${phrase}`);
    assert.ok(!/不是[^。；\n]{0,30}而是/.test(body), `${label}: avoid the 不是……而是 pattern`);
    assert.ok(!/选项\s*[A-D]|[（(][A-D][）)]|[A-D]\s*项/.test(body), `${label}: refers to a choice by letter`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 1, `${label}: horizontal overflow ${overflow}px`);
    if (route.figure) assert.ok(await page.locator(".ch8l-figure svg").count(), `${label}: figure`);

    const lab = page.locator(".ch7l-lab");
    if (!route.act) {
      assert.equal(await lab.count(), 0, `${label}: unexpected lab`);
      continue;
    }
    assert.equal(await lab.count(), 1, `${label}: lab`);
    const order = await page.evaluate((id) => {
      const a = document.getElementById(`${id}-interactive`);
      const b = document.getElementById(`${id}-formal`);
      return Boolean(a && b && a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    }, route.id);
    assert.ok(order, `${label}: lab sits above the theorem blocks`);
    if (route.preset != null) await lab.locator(".ch7l-toolbar").first().locator(".ch7l-chip").nth(route.preset).click();
    const stage = route.canvas ? lab.locator(".ch7p-canvas") : lab.locator(".ch8l-board, .ch8l-stagebox");
    const stageBox = await stage.first().boundingBox();
    const minH = viewport.width >= 1000 ? 380 : 260;
    assert.ok(stageBox && stageBox.width >= 200 && stageBox.height >= minH, `${label}: stage ${JSON.stringify(stageBox)}`);

    assert.ok(await lab.locator(".ch7l-result").isHidden(), `${label}: conclusion visible before predicting`);
    assert.ok((await lab.locator(".ch7l-side").innerText()).includes("先在上方作出预测"), `${label}: readout visible before predicting`);
    await lab.locator(".ch7l-predict-options [data-i]").first().click();
    assert.ok(await lab.locator(".ch7l-predict-feedback").isVisible(), `${label}: prediction feedback`);
    assert.ok(!(await lab.locator(".ch7l-side").innerText()).includes("先在上方作出预测"), `${label}: readout still hidden after predicting`);
    assert.ok(await lab.locator(".ch7l-result").isHidden(), `${label}: conclusion opened before acting`);
    const before = await lab.locator(".ch7l-side").innerText();
    await route.act(page, lab);
    await page.waitForTimeout(250);
    assert.notEqual(await lab.locator(".ch7l-side").innerText(), before, `${label}: acting did not change the readout`);
    assert.ok(await lab.locator(".ch7l-result").isVisible(), `${label}: conclusion did not open after predicting and acting`);
    await route.verify?.(lab);
    assert.equal(await page.locator(".katex-error").count(), 0, `${label}: KaTeX error after acting`);
    if ((viewport.width === 1440 && !dark) || (viewport.width === 390 && dark)) {
      await lab.screenshot({ path: `${evidence}/${route.id}-${viewport.width}${dark ? "-dark" : ""}.png` });
    }
  }
  assert.deepEqual(errors, [], `${tag}: ${errors.join("\n")}`);
  await context.close();
  console.log(`PASS ${tag}`);
}

try {
  await check({ width: 1440, height: 1000 }, false);
  await check({ width: 1440, height: 1000 }, true);
  await check({ width: 768, height: 1000 }, false);
  await check({ width: 390, height: 844 }, false);
  await check({ width: 390, height: 844 }, true);
} finally {
  await browser.close();
}
