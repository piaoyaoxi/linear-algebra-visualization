import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4173/learn.html';
const outputDir = process.env.ARTIFACT_DIR || 'browser-artifacts';
await fs.mkdir(outputDir, { recursive: true });

const lessons = [
  ['elimination', 'elimination'],
  ['n-vector-space', 'vector-space'],
  ['linear-dependence', 'dependence'],
  ['matrix-rank', 'rank'],
  ['solvability', 'solvability'],
  ['solution-structure', 'solution-structure'],
  ['binary-higher-degree', 'resultant'],
];

const browser = await chromium.launch({ headless: true });
const failures = [];

async function setRange(page, selector, value) {
  await page.locator(selector).evaluate((element, next) => {
    element.value = String(next);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function baseAssertions(page, section, lab, viewportName) {
  await page.waitForSelector('h1');
  await page.waitForSelector(`[data-ch3-lab="${lab}"]`);
  await page.waitForSelector(`#${section}-formal`);
  await page.waitForSelector(`#${section}-interactive`);
  await page.waitForFunction(() => document.querySelectorAll('.katex').length > 4);

  const snapshot = await page.evaluate(({ sectionId, labId }) => {
    const canvas = document.querySelector(`[data-ch3-lab="${labId}"] canvas`);
    const rect = canvas?.getBoundingClientRect();
    const labNode = document.querySelector(`[data-ch3-lab="${labId}"]`);
    return {
      title: document.querySelector('h1')?.textContent?.trim() || '',
      formulas: document.querySelectorAll('.katex').length,
      katexErrors: document.querySelectorAll('.katex-error').length,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      canvasWidth: rect?.width || 0,
      canvasHeight: rect?.height || 0,
      labText: labNode?.textContent?.trim().slice(0, 120) || '',
      formalExists: Boolean(document.querySelector(`#${sectionId}-formal`)),
      interactiveExists: Boolean(document.querySelector(`#${sectionId}-interactive`)),
      overflowers: Array.from(document.querySelectorAll('*'))
        .map((element) => {
          const box = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            id: element.id || '',
            className: typeof element.className === 'string' ? element.className : '',
            data: Array.from(element.attributes || []).filter((item) => item.name.startsWith('data-')).map((item) => `${item.name}=${item.value}`).join(' '),
            left: Math.round(box.left),
            right: Math.round(box.right),
            width: Math.round(box.width),
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
            text: (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
          };
        })
        .filter((item) => item.right > window.innerWidth + 2 && item.left < window.innerWidth)
        .slice(0, 20),
    };
  }, { sectionId: section, labId: lab });

  assert.ok(snapshot.title, `${viewportName}/${section}: missing lesson title`);
  assert.ok(snapshot.formulas > 4, `${viewportName}/${section}: KaTeX did not render`);
  assert.equal(snapshot.katexErrors, 0, `${viewportName}/${section}: KaTeX error nodes found`);
  assert.ok(snapshot.formalExists && snapshot.interactiveExists, `${viewportName}/${section}: lesson sections missing`);
  assert.ok(snapshot.canvasWidth > 150 && snapshot.canvasHeight > 150, `${viewportName}/${section}: canvas has no usable size`);
  assert.ok(snapshot.labText.length > 20, `${viewportName}/${section}: interaction is empty`);
  assert.equal(
    snapshot.overflowers.length,
    0,
    `${viewportName}/${section}: visible horizontal overflow; document=${snapshot.scrollWidth}/${snapshot.viewportWidth}; elements=${JSON.stringify(snapshot.overflowers)}`,
  );
}

async function exerciseLesson(page, section) {
  if (section === 'elimination') {
    await page.click('[data-preset="swapPivot"]');
    await page.click('[data-guide]');
    await page.click('[data-rref]');
    assert.ok((await page.locator('[data-history] li').count()) >= 2, 'elimination: history did not update');
    await page.click('[data-undo]');
    await page.click('[data-reset]');
  } else if (section === 'n-vector-space') {
    await setRange(page, '[data-n]', 6);
    await setRange(page, '[data-alpha]', -1.25);
    await setRange(page, '[data-beta]', 0.75);
    await page.click('[data-swap]');
    await page.click('[data-negate]');
    assert.equal((await page.locator('[data-bars] .ch3-bar-row').count()), 6, 'vector-space: dimension controls not synchronized');
  } else if (section === 'linear-dependence') {
    await page.click('[data-preset="three"]');
    assert.match(await page.locator('[data-status]').innerText(), /相关/, 'dependence: exact relation not detected');
    const third = page.locator('[data-enable="2"]');
    await third.uncheck();
    assert.ok((await page.locator('[data-vectors]').innerText()).length > 0, 'dependence: vector list disappeared after deletion');
  } else if (section === 'matrix-rank') {
    await page.click('[data-preset="projectionTrap"]');
    assert.equal((await page.locator('[data-rank]').innerText()).trim(), '2', 'rank: full-dimensional rank disagrees with projection-trap preset');
    await page.click('[data-row-add]');
    await page.click('[data-undo]');
    assert.match(await page.locator('[data-certificate]').innerText(), /子式|det|行列式/, 'rank: nonzero-minor certificate missing');
  } else if (section === 'solvability') {
    await page.click('[data-preset="miss"]');
    assert.match(await page.locator('[data-gate]').innerText(), /无解|不可达/, 'solvability: inconsistent target not rejected');
    await page.click('[data-preset="full"]');
    await page.click('[data-homogeneous]');
    assert.match(await page.locator('[data-gate]').innerText(), /有解|可达/, 'solvability: homogeneous target should be reachable');
  } else if (section === 'solution-structure') {
    await page.click('[data-preset="plane"]');
    const parameter = page.locator('[data-param]').first();
    await parameter.waitFor();
    await parameter.evaluate((element) => {
      element.value = '1.35';
      element.dispatchEvent(new Event('input', { bubbles: true }));
    });
    assert.match(await page.locator('[data-verify-axb]').innerText(), /通过/, 'solution structure: Ax=b verification failed');
    assert.match(await page.locator('[data-verify-null]').innerText(), /通过/, 'solution structure: null-space verification failed');
    await page.click('[data-shift]');
  } else if (section === 'binary-higher-degree') {
    for (let i = 0; i < 5; i += 1) await page.click('[data-next]');
    assert.ok(Number((await page.locator('[data-verified-count]').innerText()).trim()) >= 1, 'resultant: no verified solutions after full workflow');
    await page.locator('[data-mode][value="y"]').check();
    await page.click('[data-preset="noReal"]');
    for (let i = 0; i < 5; i += 1) await page.click('[data-next]');
    assert.match(await page.locator('[data-conclusion]').innerText(), /无实|没有实|0 个/, 'resultant: no-real preset conclusion is unclear');
  }
}

async function runViewport(name, viewport, interact) {
  const context = await browser.newContext({ viewport, reducedMotion: name.includes('reduced') ? 'reduce' : 'no-preference' });
  for (const [section, lab] of lessons) {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });
    try {
      await page.goto(`${baseUrl}#ch3/${section}`, { waitUntil: 'networkidle', timeout: 30_000 });
      await baseAssertions(page, section, lab, name);
      if (interact) await exerciseLesson(page, section);
      await page.waitForTimeout(80);
      assert.deepEqual(errors, [], `${name}/${section}: browser errors\n${errors.join('\n')}`);
      if (name === 'desktop' && section === 'elimination') {
        await page.screenshot({ path: `${outputDir}/ch3-elimination-desktop.png` });
      }
      if (name === 'desktop' && section === 'matrix-rank') {
        await page.click('#themeToggle');
        await page.waitForFunction(() => document.body.classList.contains('dark'));
        await page.screenshot({ path: `${outputDir}/ch3-rank-dark.png` });
      }
      if (name === 'mobile' && section === 'solvability') {
        await page.screenshot({ path: `${outputDir}/ch3-solvability-mobile.png` });
      }
      console.log(`PASS ${name} #ch3/${section}`);
    } catch (error) {
      if (name === 'mobile' && section === 'solution-structure') {
        await page.screenshot({ path: `${outputDir}/ch3-solution-structure-mobile-failure.png`, fullPage: true }).catch(() => {});
      }
      failures.push(`${name} #ch3/${section}: ${error.stack || error.message}`);
      console.error(`FAIL ${name} #ch3/${section}`);
    } finally {
      await page.close();
    }
  }
  await context.close();
}

await runViewport('desktop', { width: 1440, height: 1000 }, true);
await runViewport('mobile', { width: 390, height: 844 }, false);
await runViewport('reduced-motion', { width: 1024, height: 768 }, false);

const regression = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const regressionErrors = [];
regression.on('pageerror', (error) => regressionErrors.push(error.message));
regression.on('console', (message) => { if (message.type() === 'error') regressionErrors.push(message.text()); });
try {
  await regression.goto(`${baseUrl}#ch4/matrix-language`, { waitUntil: 'networkidle', timeout: 30_000 });
  await regression.waitForSelector('h1');
  assert.match(await regression.locator('h1').innerText(), /矩阵/, 'Chapter 4 regression route failed');
  assert.deepEqual(regressionErrors, [], `Chapter 4 browser errors: ${regressionErrors.join('; ')}`);
  console.log('PASS regression #ch4/matrix-language');
} catch (error) {
  failures.push(`regression #ch4/matrix-language: ${error.stack || error.message}`);
}
await regression.close();
await browser.close();

if (failures.length) {
  console.error('\nBrowser verification failed:\n' + failures.join('\n\n'));
  process.exit(1);
}
console.log(`\nBrowser verification passed: ${lessons.length} lessons × 3 viewport/motion modes + Chapter 4 regression.`);
