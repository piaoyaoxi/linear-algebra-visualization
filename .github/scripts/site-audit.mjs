import fs from "node:fs";
import { chromium } from "playwright";

// Site-wide browser gate. For every lesson section, at desktop and phone
// width: no page errors, no sideways scrolling, no KaTeX errors, no raw "<"
// swallowed as an HTML tag, no internal wording, and no page style leaking
// into formulas (each formula is re-laid-out in an isolated shadow root that
// loads only katex.min.css, and the em-normalised widths are compared).
const base = process.env.SITE_BASE || "http://127.0.0.1:4173/learn.html";
const shots = process.env.SITE_SHOTS || "/tmp/site-audit";
fs.mkdirSync(shots, { recursive: true });
const forbidden = ["正在开发", "占位", "即将制作", "待完善", "待补充", "原型版本", "开发进度"];
const LEAK_RATIO = 0.12;

const browser = await chromium.launch();
const failures = [];

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
        const width = (el) => [...el.querySelectorAll(".katex-html > .base")].reduce((s, b) => s + b.getBoundingClientRect().width, 0);
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
  for (const e of errors) report.push(e);
  if (report.length) failures.push(`${route} @${width}px: ${report.join("; ")}`);
}

try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("Failed to load resource")) errors.push(`console: ${m.text()}`);
    });
    const routes = await sectionList(page);
    for (const route of routes) await auditRoute(page, route, width, errors);
    console.log(`checked ${routes.length} sections at ${width}px`);
    await page.close();
  }
} finally {
  await browser.close();
}

fs.writeFileSync(`${shots}/report.txt`, failures.join("\n") || "clean\n");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("PASS site audit");
