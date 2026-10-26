// The shared layout scripts (mobile-lab.js, lab-layout.js) reach into each
// chapter's labs by class name. When a lab's markup changes, a selector can stop matching and
// the phone layout of that lab silently falls back: no error, no overflow, nothing for the
// other checks to see. This check opens every lesson on a phone and fails when a selector the
// scripts list (window.LALayoutHooks) matches nothing on any lesson, or a tab set loses a panel.
// SITE_BASE overrides the default local server.
import { chromium } from "playwright";

const base = process.env.SITE_BASE || "http://127.0.0.1:4173/learn.html";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

// "a, :is(b, c) > d" → ["a", ":is(b, c) > d"]: commas inside parentheses stay
const splitList = (list) => {
  const out = [];
  let depth = 0;
  let current = "";
  for (const ch of list) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      out.push(current.trim());
      current = "";
    } else current += ch;
  }
  if (current.trim()) out.push(current.trim());
  return out;
};

await page.goto(`${base}#guide`, { waitUntil: "load" });
await page.waitForTimeout(1500);
const hooks = await page.evaluate(() => window.LALayoutHooks);
if (!hooks?.mobileLab || !hooks?.labLayout) {
  console.error("FAIL: window.LALayoutHooks is incomplete", Object.keys(hooks || {}));
  process.exit(1);
}
const selectors = new Map(); // selector → where it comes from
const add = (list, from) => splitList(list).forEach((s) => selectors.set(s, from));
hooks.mobileLab.stages.forEach((s) => add(s, "mobile-lab STAGES"));
hooks.mobileLab.pairedTools.forEach(({ stage, tools }) => {
  add(stage, "mobile-lab PAIRED_TOOLS stage");
  add(tools, "mobile-lab PAIRED_TOOLS tools");
});
add(hooks.mobileLab.tools, "mobile-lab TOOLS");
hooks.mobileLab.pack.forEach((s) => add(s, "mobile-lab PACK"));
hooks.mobileLab.tabs.forEach((t) => add(t.host, "mobile-lab TABS host"));
Object.entries(hooks.labLayout).forEach(([name, list]) => add(list, `lab-layout ${name.toUpperCase()}`));

const routes = await page.evaluate(() =>
  algebraContent.chapters.flatMap((c) => getStructuredSections(c).map((s) => `${c.id}/${s.id}`)),
);
const seen = new Set();
const tabProblems = [];
for (const route of routes) {
  await page.goto("about:blank");
  await page.goto(`${base}#${route}`, { waitUntil: "load" });
  await page.waitForFunction(() => !document.querySelector(".lab-load-state"), null, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(900);
  const found = await page.evaluate(
    ({ list, tabs }) => {
      const hits = list.filter((s) => {
        try {
          return Boolean(document.querySelector(s));
        } catch {
          return false;
        }
      });
      // a tab set whose host is here must find every one of its panels
      const missing = [];
      tabs.forEach((t) =>
        document.querySelectorAll(t.host).forEach((host) =>
          t.panels.flat().forEach((p) => {
            if (!host.querySelector(p)) missing.push(`${t.host} → ${p}`);
          }),
        ),
      );
      return { hits, missing };
    },
    { list: [...selectors.keys()].filter((s) => !seen.has(s)), tabs: hooks.mobileLab.tabs },
  );
  found.hits.forEach((s) => seen.add(s));
  found.missing.forEach((m) => tabProblems.push(`${route}: ${m}`));
}
await browser.close();

const dead = [...selectors].filter(([s]) => !seen.has(s));
dead.forEach(([s, from]) => console.error(`FAIL ${from}: "${s}" matches nothing on any lesson`));
tabProblems.forEach((p) => console.error(`FAIL tab panel missing: ${p}`));
errors.forEach((e) => console.error(`FAIL page error: ${e}`));
if (dead.length || tabProblems.length || errors.length) process.exit(1);
console.log(`PASS selector check (${selectors.size} selectors over ${routes.length} lessons)`);
