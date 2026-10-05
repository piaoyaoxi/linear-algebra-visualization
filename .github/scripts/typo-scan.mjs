// Typography scan for lesson sections. For every route at phone and desktop width:
//   orphan   — a text block whose last line holds a single CJK character (plus punctuation)
//   binbreak — an inline formula that wraps right after a binary operator (+ − × …)
//   cjkmath  — a formula whose TeX source contains CJK punctuation（，。：；、！？）
// Usage: SITE_BASE=http://127.0.0.1:PORT/learn.html [ONLY=regex] [WIDTHS=390,1280] node typo-scan.mjs
// Run from the repo root after npm i --no-save playwright (or set PW to its index.mjs path).
import fs from "node:fs";
const pw = await import(process.env.PW || "playwright");
const { chromium } = pw;

const base = process.env.SITE_BASE || "http://127.0.0.1:4173/learn.html";
const only = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const widths = (process.env.WIDTHS || "390,1280").split(",").map(Number);
const out = process.env.OUT || "";

const browser = await chromium.launch();
const results = [];
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(`${base}#ch1`, { waitUntil: "networkidle" });
  const routes = await page.evaluate(() => {
    const r = [];
    for (let i = 1; i <= 10; i += 1) {
      const c = getChapterById(`ch${i}`);
      for (const s of getStructuredSections(c)) r.push(`${c.id}/${s.id}`);
    }
    return r;
  });
  for (const route of routes) {
    if (only && !only.test(route)) continue;
    await page.goto(`${base}#${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.evaluate(() => document.querySelectorAll("main details").forEach((d) => (d.open = true)));
    await page.waitForTimeout(200);
    const found = await page.evaluate(() => {
      const CJK = /[㐀-鿿豈-﫿]/;
      const PUNCT = /^[\s，。：；、！？）」』”’》〉…—·,.;:!?)\]]*$/;
      const problems = [];
      const main = document.querySelector("main");
      const describe = (el) => {
        const t = (el.innerText || "").replace(/\s+/g, " ").trim();
        return t.length > 60 ? `${t.slice(0, 60)}…` : t;
      };
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
      };

      // ---- orphans ----
      const blocks = [...main.querySelectorAll("*")].filter((el) => {
        if (el.closest(".katex, svg, canvas, script, style, [hidden]")) return false;
        const d = getComputedStyle(el).display;
        if (d === "inline" || d === "contents" || d === "none") return false;
        // vertical labels stack characters on purpose
        if (getComputedStyle(el).writingMode.startsWith("vertical")) return false;
        // must own text directly (text node or inline children)
        return [...el.childNodes].some((n) => (n.nodeType === 3 && n.textContent.trim()) || (n.nodeType === 1 && getComputedStyle(n).display.startsWith("inline")));
      });
      for (const el of blocks) {
        if (!visible(el)) continue;
        // collect units: CJK/other chars of own inline text, katex boxes as single units
        const units = [];
        const walk = (node) => {
          for (const n of node.childNodes) {
            if (n.nodeType === 3) {
              const text = n.textContent;
              for (let i = 0; i < text.length; i += 1) {
                const ch = text[i];
                if (/\s/.test(ch)) continue;
                const range = document.createRange();
                range.setStart(n, i);
                range.setEnd(n, i + 1);
                const rect = [...range.getClientRects()].find((r) => r.width > 0);
                if (rect) units.push({ ch, top: rect.top, bottom: rect.bottom });
              }
            } else if (n.nodeType === 1) {
              const st = getComputedStyle(n);
              if (st.display === "none") continue;
              if (n.classList.contains("katex") || n.classList.contains("katex-display")) {
                const rects = [...n.getClientRects()].filter((r) => r.width > 0);
                rects.forEach((r) => units.push({ ch: "∑", top: r.top, bottom: r.bottom, math: true }));
                continue;
              }
              if (!st.display.startsWith("inline") || st.display === "inline-block" || st.display === "inline-flex") {
                if (st.display === "inline-block" || st.display === "inline-flex") {
                  const r = n.getBoundingClientRect();
                  if (r.width > 0) units.push({ ch: "▢", top: r.top, bottom: r.bottom, box: true });
                }
                continue;
              }
              walk(n);
            }
          }
        };
        walk(el);
        if (units.length < 2) continue;
        // cluster units into lines by vertical overlap of their centre
        const lines = [];
        for (const u of units) {
          const c = (u.top + u.bottom) / 2;
          let line = lines.find((l) => c > l.top && c < l.bottom);
          if (!line) { line = { top: u.top, bottom: u.bottom, units: [] }; lines.push(line); }
          line.top = Math.min(line.top, u.top);
          line.bottom = Math.max(line.bottom, u.bottom);
          line.units.push(u);
        }
        if (lines.length < 2) continue;
        lines.sort((a, b) => a.top - b.top);
        const last = lines[lines.length - 1].units;
        const core = last.filter((u) => !PUNCT.test(u.ch));
        if (core.length === 1 && CJK.test(core[0].ch)) {
          problems.push({ kind: "orphan", text: describe(el), last: last.map((u) => u.ch).join("") });
        }
      }

      // ---- formulas broken after a binary operator ----
      for (const k of main.querySelectorAll(".katex")) {
        if (k.closest(".katex-display") || !visible(k)) continue;
        const bases = [...k.querySelectorAll(":scope > .katex-html > .base")];
        for (let i = 0; i + 1 < bases.length; i += 1) {
          const a = bases[i].getBoundingClientRect();
          const b = bases[i + 1].getBoundingClientRect();
          if (b.top > a.bottom - 2) {
            const kids = [...bases[i].children].filter((c) => !c.classList.contains("strut") && !c.classList.contains("mspace"));
            const lastKid = kids[kids.length - 1];
            if (lastKid && lastKid.classList.contains("mbin")) {
              problems.push({ kind: "binbreak", text: describe(k.parentElement || k), at: lastKid.textContent });
            }
          }
        }
      }

      // ---- CJK punctuation inside formulas ----
      for (const ann of main.querySelectorAll(".katex-mathml annotation")) {
        const src = ann.textContent;
        if (/[，。：；、！？]/.test(src)) problems.push({ kind: "cjkmath", text: src.slice(0, 80) });
      }
      // de-duplicate
      const seen = new Set();
      return problems.filter((p) => { const key = `${p.kind}|${p.text}`; if (seen.has(key)) return false; seen.add(key); return true; });
    });
    for (const p of found) results.push({ route, width, ...p });
    process.stdout.write(`${width} ${route}: ${found.length}\n`);
  }
  await page.close();
}
await browser.close();
const byKind = results.reduce((m, r) => ((m[r.kind] = (m[r.kind] || 0) + 1), m), {});
console.log("TOTAL", JSON.stringify(byKind));
for (const r of results) console.log(`${r.kind}\t${r.width}\t${r.route}\t${r.text}${r.last ? `\t[last: ${r.last}]` : ""}${r.at ? `\t[after ${r.at}]` : ""}`);
if (out) fs.writeFileSync(out, JSON.stringify(results, null, 1));
