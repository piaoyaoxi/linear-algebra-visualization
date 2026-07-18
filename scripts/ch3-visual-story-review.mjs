import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4173/learn.html';
const outputDir = process.env.ARTIFACT_DIR || 'browser-artifacts';
await fs.mkdir(outputDir, { recursive: true });

const sections = [
  ['elimination', 3],
  ['n-vector-space', 3],
  ['linear-dependence', 3],
  ['matrix-rank', 3],
  ['solvability', 3],
  ['solution-structure', 3],
  ['binary-higher-degree', 4],
];

const browser = await chromium.launch({ headless: true });
const failures = [];

async function inspectPage(page, section, expectedSteps, mode) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  await page.goto(`${baseUrl}#ch3/${section}`, { waitUntil: 'networkidle', timeout: 30_000 });
  if (mode !== 'mobile' && !(await page.locator('body.sidebar-collapsed').count())) {
    await page.click('#sidebarToggle');
    await page.waitForTimeout(180);
  }
  await page.waitForSelector(`[data-ch3-story="${section}"]`);
  await page.waitForFunction(() => document.querySelectorAll('.katex').length > 3);
  const story = page.locator(`[data-ch3-story="${section}"]`);
  const buttons = story.locator('[data-story-step]');
  assert.equal(await buttons.count(), expectedSteps, `${section}: wrong step count`);
  const storyBox = await story.boundingBox();
  assert.ok(storyBox && storyBox.width > 300 && storyBox.height > 350, `${section}: story is not visible`);
  const svg = story.locator('[data-story-svg]');
  assert.ok((await svg.locator('path, circle, rect').count()) > 10, `${section}: SVG scene is empty`);
  assert.equal(await page.locator('.katex-error').count(), 0, `${section}: KaTeX error`);

  for (let index = 0; index < expectedSteps; index += 1) {
    await buttons.nth(index).click();
    await page.waitForTimeout(650);
    assert.equal(await buttons.nth(index).getAttribute('aria-selected'), 'true', `${section}: step ${index + 1} did not activate`);
    const caption = await story.locator('[data-story-stage-caption]').innerText();
    assert.match(caption, new RegExp(`^${index + 1}/${expectedSteps}`), `${section}: caption not synchronized`);
    const bbox = await svg.boundingBox();
    assert.ok(bbox && bbox.height > (mode === 'mobile' ? 150 : 220), `${section}: SVG collapsed at step ${index + 1}`);
    await story.screenshot({ path: `${outputDir}/${mode}-${section}-step-${index + 1}.png` });
  }

  if (section === 'n-vector-space') {
    const sliders = story.locator('input[type="range"]');
    await sliders.nth(0).evaluate((element) => { element.value = '-0.8'; element.dispatchEvent(new Event('input', { bubbles: true })); });
    await sliders.nth(1).evaluate((element) => { element.value = '1.25'; element.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForTimeout(250);
    assert.ok((await svg.locator('.ch3-svg-arrow-group').count()) >= 3, 'vector story: arrows missing after slider update');
  }

  if (section === 'solution-structure') {
    await buttons.nth(2).click();
    const slider = story.locator('input[type="range"]');
    await slider.evaluate((element) => { element.value = '-0.95'; element.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForTimeout(250);
    assert.ok((await svg.locator('.ch3-svg-arrow-group').count()) >= 4, 'solution story: decomposition arrows missing');
  }

  const precision = page.locator('.ch3-precision-lab');
  assert.equal(await precision.count(), 1, `${section}: exact lab wrapper missing`);
  assert.equal(await precision.getAttribute('open'), null, `${section}: exact lab should be collapsed initially`);
  await precision.locator(':scope > summary').click();
  await page.waitForTimeout(150);
  assert.notEqual(await precision.getAttribute('open'), null, `${section}: exact lab cannot open`);

  if (mode === 'desktop') await page.screenshot({ path: `${outputDir}/full-${section}.png`, fullPage: true });
  if (mode === 'desktop') await page.screenshot({ path: `${outputDir}/full-${section}.png`, fullPage: true });
  const snapshot = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth, storyCount: document.querySelectorAll('[data-ch3-story]').length }));
  assert.equal(snapshot.storyCount, 1, `${section}: story duplicated`);
  assert.ok(snapshot.scrollWidth <= snapshot.viewportWidth + 4, `${section}: page overflow ${snapshot.scrollWidth}/${snapshot.viewportWidth}`);
  assert.deepEqual(errors, [], `${section}: browser errors\n${errors.join('\n')}`);
}

async function runMode(name, viewport, options = {}) {
  const context = await browser.newContext({ viewport, reducedMotion: options.reduced ? 'reduce' : 'no-preference' });
  for (const [section, steps] of sections) {
    const page = await context.newPage();
    try {
      if (options.dark) await page.addInitScript(() => { localStorage.setItem('theme', 'dark'); });
      await inspectPage(page, section, steps, name);
      console.log(`PASS ${name} ${section}`);
    } catch (error) {
      failures.push(`${name}/${section}: ${error.stack || error.message}`);
      await page.screenshot({ path: `${outputDir}/FAIL-${name}-${section}.png`, fullPage: true }).catch(() => {});
      console.error(`FAIL ${name} ${section}`);
    } finally {
      await page.close();
    }
  }
  await context.close();
}

await runMode('desktop', { width: 1440, height: 1000 });
await runMode('mobile', { width: 390, height: 844 });
await runMode('dark', { width: 1280, height: 900 }, { dark: true });
await runMode('reduced', { width: 1024, height: 768 }, { reduced: true });

const regression = await browser.newPage({ viewport: { width: 1280, height: 900 } });
try {
  await regression.goto(`${baseUrl}#ch4/matrix-language`, { waitUntil: 'networkidle', timeout: 30_000 });
  await regression.waitForSelector('h1');
  assert.match(await regression.locator('h1').innerText(), /矩阵/);
  console.log('PASS chapter 4 regression');
} catch (error) {
  failures.push(`chapter4-regression: ${error.stack || error.message}`);
}
await regression.close();
await browser.close();

await fs.writeFile(`${outputDir}/summary.json`, JSON.stringify({ failures, checked: sections.map(([id]) => id) }, null, 2));
if (failures.length) {
  console.error('\nVisual story review failed:\n' + failures.join('\n\n'));
  process.exit(1);
}
console.log('\nVisual story review passed across desktop, mobile, dark, reduced-motion, and Chapter 4 regression.');
