import fs from "node:fs";
import { chromium } from "playwright";

// Site-wide browser gate. For every lesson section, at desktop and phone
// width: no page errors, no sideways scrolling, no KaTeX errors, no raw "<"
// swallowed as an HTML tag, no internal wording, and no page style leaking
// into formulas (each formula is re-laid-out in an isolated shadow root that
// loads only katex.min.css, and the em-normalised widths are compared).
// Typography, with answers, details and conclusions opened:
//   orphan   — a text block whose last line holds a single Chinese character (plus punctuation);
//   binbreak — an inline formula that wraps right after + − × … although the part between
//              two relations fits on a line (a part longer than the line: a warning);
//   cjkmath  — Chinese punctuation（，。：；、！？）inside a formula: reported as a warning for now.
const base = process.env.SITE_BASE || "http://127.0.0.1:4173/learn.html";
const shots = process.env.SITE_SHOTS || "/tmp/site-audit";
fs.mkdirSync(shots, { recursive: true });
const forbidden = ["正在开发", "占位", "即将制作", "待完善", "待补充", "原型版本", "开发进度"];
const LEAK_RATIO = 0.12;
// ONLY (a route regex) and SITE_WIDTHS (e.g. 375,1280) narrow a local run
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const siteWidths = (process.env.SITE_WIDTHS || "1440,390").split(",").map(Number);

const browser = await chromium.launch();
const failures = [];
const warnings = [];

function typography() {
  const CJK = /[\u3400-\u9fff\uf900-\ufaff]/;
  const PUNCT = /^[\s，。：；、！？）」』”’》〉…—·,.;:!?)\]]*$/;
  const found = { orphan: [], binbreak: [], longmath: [], cjkmath: [] };
  const main = document.querySelector("main");
  const describe = (el) => {
    const t = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
    return t.length > 40 ? `${t.slice(0, 40)}…` : t;
  };
  const shown = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const inlineDisplay = (d) => d === "inline" || d === "contents";

  // orphans: every box that lays out lines of its own text
  for (const el of main.querySelectorAll("*")) {
    if (el.closest(".katex, svg, canvas, script, style, [hidden]")) continue;
    const cs = getComputedStyle(el);
    if (inlineDisplay(cs.display) || cs.display === "none" || !cs.writingMode.startsWith("horizontal")) continue;
    const own = [...el.childNodes].some((n) => (n.nodeType === 3 && n.textContent.trim()) || (n.nodeType === 1 && inlineDisplay(getComputedStyle(n).display)));
    if (!own || !shown(el)) continue;
    // units: characters of the box's own text; a formula or an inline box counts as one unit
    const units = [];
    const walk = (node) => {
      for (const n of node.childNodes) {
        if (n.nodeType === 3) {
          const text = n.textContent;
          for (let i = 0; i < text.length; i += 1) {
            if (/\s/.test(text[i])) continue;
            const range = document.createRange();
            range.setStart(n, i);
            range.setEnd(n, i + 1);
            const rect = [...range.getClientRects()].find((r) => r.width > 0);
            if (rect) units.push({ ch: text[i], top: rect.top, bottom: rect.bottom });
          }
        } else if (n.nodeType === 1) {
          const st = getComputedStyle(n);
          if (st.display === "none") continue;
          if (n.classList.contains("katex")) {
            [...n.getClientRects()].filter((r) => r.width > 0).forEach((r) => units.push({ ch: "∑", top: r.top, bottom: r.bottom }));
          } else if (inlineDisplay(st.display)) {
            walk(n);
          } else if (st.display.startsWith("inline")) {
            const r = n.getBoundingClientRect();
            if (r.width > 0) units.push({ ch: "▢", top: r.top, bottom: r.bottom });
          }
        }
      }
    };
    walk(el);
    if (units.length < 2) continue;
    // lines: units whose vertical centres fall into the same band
    const lines = [];
    for (const u of units) {
      const c = (u.top + u.bottom) / 2;
      let line = lines.find((l) => c > l.top && c < l.bottom);
      if (!line) lines.push((line = { top: u.top, bottom: u.bottom, units: [] }));
      line.top = Math.min(line.top, u.top);
      line.bottom = Math.max(line.bottom, u.bottom);
      line.units.push(u);
    }
    if (lines.length < 2) continue;
    lines.sort((a, b) => a.top - b.top);
    const last = lines[lines.length - 1].units;
    const core = last.filter((u) => !PUNCT.test(u.ch));
    if (core.length === 1 && CJK.test(core[0].ch)) found.orphan.push(`${describe(el)} [last line: ${last.map((u) => u.ch).join("")}]`);
  }

  // formulas broken right after a binary operator although the part between two
  // relations fits on a line (a part wider than the line has to break somewhere: warned)
  const endOf = (base) => {
    const kids = [...base.children].filter((c) => !c.classList.contains("strut") && !c.classList.contains("mspace"));
    return kids[kids.length - 1];
  };
  const lineWidth = (k) => {
    for (let p = k.parentElement; p && p !== main; p = p.parentElement) {
      if (p.matches(".tex, .katex") || inlineDisplay(getComputedStyle(p).display)) continue;
      const cs = getComputedStyle(p);
      return p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    }
    return main.clientWidth;
  };
  for (const k of main.querySelectorAll(".katex")) {
    if (k.closest(".katex-display") || !shown(k)) continue;
    // in order, also inside the groups typeset.js makes (<la-mg>) and the glued last piece (.la-keep)
    const bases = [...k.querySelectorAll(":scope > .katex-html .base")];
    const binary = bases.map((b) => Boolean(endOf(b)?.classList.contains("mbin")));
    for (let i = 0; i + 1 < bases.length; i += 1) {
      const a = bases[i].getBoundingClientRect();
      const b = bases[i + 1].getBoundingClientRect();
      if (b.top <= a.bottom - 2 || !binary[i]) continue;
      let from = i;
      while (from > 0 && binary[from - 1]) from -= 1;
      let to = i;
      while (to + 1 < bases.length && binary[to]) to += 1;
      // a mark glued after the formula (.la-punct, lab-layout.js) has to fit on the same line
      const glued = [...(bases[to].closest(".la-keep")?.querySelectorAll(":scope > .la-punct") || [])];
      const run = [...bases.slice(from, to + 1), ...glued].reduce((s, x) => s + x.getBoundingClientRect().width, 0);
      const item = `${describe(k)} [after ${endOf(bases[i]).textContent}]`;
      if (run <= lineWidth(k) + 0.5) found.binbreak.push(item);
      else found.longmath.push(item);
    }
  }

  // Chinese punctuation inside a formula
  for (const ann of main.querySelectorAll(".katex-mathml annotation")) {
    if (/[，。：；、！？]/.test(ann.textContent)) found.cjkmath.push(ann.textContent.slice(0, 60));
  }
  for (const key of Object.keys(found)) found[key] = [...new Set(found[key])];
  return found;
}

async function sectionList(page) {
  await page.goto(`${base}#ch1`, { waitUntil: "networkidle" });
  return page.evaluate(() => {
    const out = [];
    for (let i = 1; i <= 10; i += 1) {
      const chapter = getChapterById(`ch${i}`);
      for (const s of getStructuredSections(chapter)) out.push(`${chapter.id}/${s.id}`);
    }
    return out;
  });
}

async function auditRoute(page, route, width, errors) {
  errors.length = 0;
  await page.goto(`${base}#${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelectorAll("main details").forEach((d) => (d.open = true)));
  await page.waitForTimeout(150);
  const report = await page.evaluate(
    async ({ forbidden, LEAK_RATIO, checkLeaks }) => {
      const problems = [];
      const main = document.querySelector("main");
      const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      if (overflow > 1) problems.push(`horizontal overflow ${overflow}px`);
      if (main.querySelector(".katex-error")) problems.push("KaTeX error");
      for (const el of main.querySelectorAll("*")) {
        if (el instanceof HTMLUnknownElement && !el.tagName.includes("-") && !el.closest(".katex")) {
          problems.push(`unknown tag <${el.tagName.slice(0, 20).toLowerCase()}>: a raw "<" in text?`);
          break;
        }
      }
      const text = main.innerText;
      for (const word of forbidden) if (text.includes(word)) problems.push(`internal wording: ${word}`);
      if (/不是[^。；！？\n]{0,30}而是/.test(text)) problems.push("banned pattern 不是……而是");
      if (checkLeaks) {
        const css = [...document.querySelectorAll("link[rel=stylesheet]")].find((l) => /katex/.test(l.href))?.href;
        const host = document.createElement("div");
        host.style.cssText = "position:absolute;left:-99999px;top:0;";
        document.body.append(host);
        const root = host.attachShadow({ mode: "open" });
        root.innerHTML = `<link rel="stylesheet" href="${css}">`;
        await new Promise((resolve) => setTimeout(resolve, 300));
        // every piece, also inside the groups typeset.js makes (<la-mg>)
        const width = (el) => [...el.querySelectorAll(".katex-html .base")].reduce((s, b) => s + b.getBoundingClientRect().width, 0);
        const em = (el) => parseFloat(getComputedStyle(el).fontSize);
        for (const k of main.querySelectorAll(".katex")) {
          if (!k.offsetParent || k.getBoundingClientRect().width < 4) continue;
          const wrap = document.createElement("span");
          const parent = getComputedStyle(k.parentElement);
          wrap.style.cssText = `font-size:${parent.fontSize};white-space:nowrap;`;
          wrap.append(k.cloneNode(true));
          root.append(wrap);
          const isolated = width(wrap) / em(wrap.querySelector(".katex"));
          const live = width(k) / em(k);
          wrap.remove();
          if (isolated > 0.5 && Math.abs(live - isolated) > Math.max(0.4, LEAK_RATIO * isolated)) {
            const tex = k.querySelector("annotation")?.textContent?.slice(0, 40) || "";
            problems.push(`page style leaks into formula ${tex} (${live.toFixed(1)}em vs ${isolated.toFixed(1)}em)`);
            break;
          }
        }
        host.remove();
      }
      return problems;
    },
    { forbidden, LEAK_RATIO, checkLeaks: width >= 1000 },
  );
  // typography with answers and conclusions shown as well
  await page.evaluate(() => {
    document.querySelectorAll("main .example-explanation, main [class*='-result'], main [data-ch9-result]").forEach((e) => (e.hidden = false));
  });
  await page.waitForTimeout(150);
  const typo = await page.evaluate(typography);
  for (const item of typo.orphan) report.push(`orphan: ${item}`);
  for (const item of typo.binbreak) report.push(`binbreak: ${item}`);
  for (const item of typo.longmath) warnings.push(`${route} @${width}px: binbreak in a formula part longer than the line: ${item}`);
  for (const item of typo.cjkmath) warnings.push(`${route} @${width}px: cjkmath: ${item}`);
  for (const e of errors) report.push(e);
  if (report.length) failures.push(`${route} @${width}px: ${report.join("; ")}`);
}

try {
  for (const width of siteWidths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("Failed to load resource")) errors.push(`console: ${m.text()}`);
    });
    const routes = await sectionList(page);
    const picked = routes.filter((r) => !only || only.test(r));
    for (const route of picked) await auditRoute(page, route, width, errors);
    console.log(`checked ${picked.length} sections at ${width}px`);
    await page.close();
  }
} finally {
  await browser.close();
}

fs.writeFileSync(`${shots}/report.txt`, failures.join("\n") || "clean\n");
if (warnings.length) {
  // Chinese punctuation inside formulas: warned about until every chapter has moved it out
  const unique = [...new Set(warnings)];
  console.warn(`${unique.length} warning(s):\n${unique.join("\n")}`);
  fs.writeFileSync(`${shots}/warnings.txt`, unique.join("\n"));
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("PASS site audit");
