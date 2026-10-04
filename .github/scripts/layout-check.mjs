// Layout check over every lesson section (desktop 1280 and phone 390):
//  1. no lab canvas column ending far above its side column (empty space under the canvas);
//  2. no text closer than 4px to the edge of the box it sits in;
//  3. no line that starts with a closing mark (，。；：、）).
// SITE_BASE overrides the default local server.
import { chromium } from "playwright";

const base = process.env.SITE_BASE || "http://127.0.0.1:4173/learn.html";
const browser = await chromium.launch();
const problems = [];

const probe = () => {
  const out = { gaps: [], edges: [], punct: [] };
  const main = document.querySelector("main") || document.body;
  const visible = (e) => e && e.offsetParent;
  // 1. canvas column vs side column
  main.querySelectorAll(".ch3l-body, .ch6l-body, .ch7l-body, .ch9l-body, .ch1-two-col").forEach((row) => {
    const kids = [...row.children].filter((k) => visible(k) && k.getBoundingClientRect().width > 120);
    if (kids.length !== 2) return;
    const [a, c] = kids.map((k) => k.getBoundingClientRect());
    if (Math.abs(a.top - c.top) > 40 || a.right > c.left + 4) return;
    if (!kids[0].querySelector("canvas, svg") || kids[1].querySelector("canvas")) return;
    // compare what is actually drawn in each column, not the stretched columns themselves
    const contentBottom = (col, top) => {
      let bottom = top;
      col.querySelectorAll("canvas, svg, img, button, input, select, p, figcaption, span, b, strong, li, td").forEach((n) => {
        if (visible(n) && !(n.closest("svg") && n.tagName.toLowerCase() !== "svg")) bottom = Math.max(bottom, n.getBoundingClientRect().bottom);
      });
      return bottom;
    };
    const gap = Math.round(contentBottom(kids[1], c.top) - contentBottom(kids[0], a.top));
    if (gap > 160) out.gaps.push(`${gap}px under the canvas`);
  });
  // 2. text near a visible box edge
  const boxes = [...main.querySelectorAll("*")].filter((e) => {
    if (!visible(e) || e.closest("button, .katex, svg, canvas, nav, [class*='theorem-math']")) return false;
    if (/^(BUTTON|INPUT|SELECT|CANVAS|TD|TH|TR|TABLE|TBODY|THEAD|LABEL|SUMMARY)$/i.test(e.tagName)) return false;
    const cs = getComputedStyle(e);
    const filled = cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== getComputedStyle(e.parentElement).backgroundColor;
    const r = e.getBoundingClientRect();
    return (filled || parseFloat(cs.borderLeftWidth) > 0) && r.width > 80 && r.height > 24 && cs.borderRadius !== "999px" && cs.overflowX !== "auto";
  });
  for (const box of boxes) {
    const cs = getComputedStyle(box);
    const filled = cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== getComputedStyle(box.parentElement).backgroundColor;
    const has = (k) => filled || (parseFloat(cs[`border${k}Width`]) > 0 && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs[`border${k}Color`]));
    const r = box.getBoundingClientRect();
    const walk = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
    let worst = 99;
    while (walk.nextNode()) {
      const t = walk.currentNode;
      if (!t.textContent.trim() || !visible(t.parentElement) || t.parentElement.closest("button, .katex-mathml")) continue;
      let el = t.parentElement; let nested = false;
      while (el && el !== box) {
        // nested boxes are checked on their own; text in a sideways-scrolling strip may run on
        if (boxes.includes(el) || /auto|scroll/.test(getComputedStyle(el).overflowX)) { nested = true; break; }
        el = el.parentElement;
      }
      if (nested) continue;
      const range = document.createRange(); range.selectNodeContents(t);
      for (const tr of range.getClientRects()) {
        if (tr.width < 2) continue;
        if (has("Left")) worst = Math.min(worst, tr.left - r.left);
        if (has("Right")) worst = Math.min(worst, r.right - tr.right);
      }
    }
    if (worst < 3 && worst > -40) out.edges.push(`${Math.round(worst)}px from the edge: ${box.textContent.trim().slice(0, 24)}`);
  }
  // 3. closing marks at the start of a line
  const walk = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) {
    const t = walk.currentNode; const s = t.textContent;
    if (!visible(t.parentElement) || t.parentElement.closest(".katex, svg, button")) continue;
    for (let i = 0; i < s.length; i++) {
      if (!"，。；：、）".includes(s[i])) continue;
      const range = document.createRange(); range.setStart(t, i); range.setEnd(t, i + 1);
      const r = range.getBoundingClientRect(); if (!r.width) continue;
      const block = t.parentElement.closest("p, li, div, dd, td, figcaption, h3, h4"); if (!block) continue;
      const br = block.getBoundingClientRect(); const bs = getComputedStyle(block);
      if (r.left - (br.left + parseFloat(bs.paddingLeft) + parseFloat(bs.borderLeftWidth)) < 3 && r.top - br.top > 8) out.punct.push(block.textContent.trim().slice(0, 24));
    }
  }
  return out;
};

const page0 = await browser.newPage();
await page0.goto(`${base}#ch1`, { waitUntil: "networkidle" });
const routes = await page0.evaluate(() => algebraContent.chapters.flatMap((c) => (c.sections || []).filter(Boolean).map((s) => `${c.id}/${s.id}`)));
await page0.close();

for (const width of [1280, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const route of routes) {
    await page.goto(`${base}#${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    // open answers, details and conclusion boxes: the layout must hold with them open
    await page.evaluate(() => {
      document.querySelectorAll("details").forEach((d) => (d.open = true));
      document.querySelectorAll(".example-explanation, [class*='-result'], [data-ch9-result]").forEach((e) => (e.hidden = false));
      window.dispatchEvent(new Event("resize"));
    });
    await page.waitForTimeout(500);
    const found = await page.evaluate(probe);
    for (const [kind, list] of Object.entries(found)) {
      if (kind === "gaps" && width < 900) continue;
      [...new Set(list)].slice(0, 3).forEach((item) => problems.push(`${width}px ${route} [${kind}] ${item}`));
    }
  }
  await page.close();
}
await browser.close();
if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`${problems.length} layout problem(s)`);
  process.exit(1);
}
console.log(`PASS layout check (${routes.length} sections at 1280 and 390)`);
