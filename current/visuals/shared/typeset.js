/*
 * Chinese line breaking for the lesson page (styles in design-a.css):
 *  1. no line holds a single character alone: the last words of every text block, with
 *     the punctuation after them, stay together on one line (<la-t>);
 *  2. an inline formula breaks only after a relation (=, ≤, ∈ …) or an \allowbreak, never after + or −:
 *     the pieces between two relations are grouped (<la-mg>); a group wider than its line
 *     is given back its default break points;
 *  3. between Chinese text and an inline formula: a quarter-em space (<la-sp>);
 *  4. in short texts (titles, questions, options) a word stays whole (<la-w>);
 *  5. a sentence with formulas inside a flex or grid box flows as text again (<la-run>).
 * Only what changed is processed again; the script ignores its own edits.
 */
(() => {
  const CJK = /[\u3400-\u9fff\uf900-\ufaff]/g;
  const PUNCT = /^[\s，。：；、！？）」』”’》〉…—·,.;:!?)\]]+$/;
  const SKIP = ".katex, svg, canvas, script, style, textarea, input, select, code, pre, la-t, [contenteditable]";
  const segmenter = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter("zh", { granularity: "word" }) : null;
  const cjkCount = (s) => (s.match(CJK) || []).length;
  const FUNC = "的了是在和与对把被为及或等也就都而且向从到由以之其个";

  /* the last non-empty piece of inline content of a block: a text node, or null */
  function tailText(block) {
    let node = block.lastChild;
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.trim()) return node;
        node = node.previousSibling;
        continue;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        node = node.previousSibling;
        continue;
      }
      if (node.matches(SKIP) || node.classList.contains("katex") || node.classList.contains("tex")) return null;
      const display = getComputedStyle(node).display;
      if (display === "none") {
        node = node.previousSibling;
        continue;
      }
      if (display !== "inline") return null;
      // descend into an inline element from its end
      if (node.lastChild) {
        node = node.lastChild;
        continue;
      }
      node = node.previousSibling;
    }
    return null;
  }

  /* where the kept tail starts: the trailing punctuation and enough last words for two characters */
  function tailStart(text) {
    if (cjkCount(text) < 2) return -1;
    const pieces = segmenter ? [...segmenter.segment(text)].map((s) => s.segment) : [...text];
    let kept = "";
    let start = text.length;
    for (let i = pieces.length - 1; i >= 0; i -= 1) {
      const piece = pieces[i];
      kept = piece + kept;
      start -= piece.length;
      if (PUNCT.test(piece)) continue;
      if (cjkCount(kept) >= 2 || kept.replace(PUNCT, "").length >= 4) {
        // a one-character word right before belongs to it (奇|排列) unless it is a particle (的|一侧)
        const before = pieces[i - 1];
        if (before && before.length === 1 && cjkCount(before) === 1 && !FUNC.includes(before)) {
          kept = before + kept;
          start -= 1;
        }
        break;
      }
    }
    // never more than a short phrase: a long tail would leave a ragged line before it
    if (kept.length > 10) return -1;
    // a short label (“第 1 行”) is kept whole
    return start >= 0 ? start : -1;
  }

  function keepTail(block) {
    // a column narrower than about two characters stacks its text on purpose
    if (block.clientWidth < parseFloat(getComputedStyle(block).fontSize) * 2.5) return;
    const node = tailText(block);
    if (!node || node.parentElement?.closest("la-t")) return;
    // in a flex or grid box a loose text run is an item of its own: a wrapper would split it
    if (node.parentElement === block && /flex|grid/.test(getComputedStyle(block).display)) return;
    const start = tailStart(node.textContent);
    if (start < 0) {
      keepWithFormula(block, node);
      return;
    }
    const tail = start > 0 ? node.splitText(start) : node;
    const keep = document.createElement("la-t");
    tail.before(keep);
    keep.append(tail);
  }

  /* a block that ends “… formula 中。”: the single character stays with a short formula */
  function keepWithFormula(block, node) {
    const text = node.textContent.trim();
    if (!text || text.length > 3 || cjkCount(text) !== 1) return;
    let prev = node.previousSibling;
    while (prev && (prev.nodeName === "LA-SP" || (prev.nodeType === Node.TEXT_NODE && !prev.textContent.trim()))) prev = prev.previousSibling;
    if (!prev || prev.nodeType !== Node.ELEMENT_NODE || !prev.matches(".tex, .katex, .la-keep")) return;
    const em = parseFloat(getComputedStyle(block).fontSize);
    if (prev.getBoundingClientRect().width > em * 6) return;
    const keep = document.createElement("la-t");
    prev.before(keep);
    let cur = prev;
    while (cur) {
      const next = cur.nextSibling;
      keep.append(cur);
      if (cur === node) break;
      cur = next;
    }
  }

  /* short texts (titles, questions, options, captions): a word is never split over two lines */
  const SHORT = "h1, h2, h3, h4, summary, figcaption, legend, .la-figcaption, [class*='predict-q'] p, [class*='predict-options'] > button, button[data-i], .example-choice-copy, li, [class$='-head'] > *, .lead";
  const WORD = /^[\u3400-\u9fff\uf900-\ufaff]{2,5}$/;
  function keepWords(block) {
    if (!segmenter || block.dataset.laWords || block.textContent.length > 140) return;
    block.dataset.laWords = "1";
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest(".katex, la-w, la-t, la-sp, svg, button button") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      // a loose text run in a flex or grid box is an item of its own: wrappers would split it
      if (/flex|grid/.test(getComputedStyle(node.parentElement).display)) return;
      const parts = [...segmenter.segment(node.textContent)].map((x) => x.segment);
      if (!parts.some((x) => WORD.test(x))) return;
      const frag = document.createDocumentFragment();
      let plain = "";
      parts.forEach((x) => {
        if (!WORD.test(x)) {
          plain += x;
          return;
        }
        if (plain) frag.append(plain);
        plain = "";
        const w = document.createElement("la-w");
        w.textContent = x;
        frag.append(w);
      });
      if (plain) frag.append(plain);
      node.replaceWith(frag);
    });
  }

  /*
   * A flex or grid box makes every loose text run and every formula an item of its own, so
   * a sentence “文字 公式 文字” inside one falls apart into a column or wide gaps. Such a
   * sentence is wrapped (<la-run>) and flows as ordinary text again.
   */
  const INLINE = ".tex, la-sp, la-t, la-w, b, strong, em, i, sub, sup, a, code";
  function joinRuns(box) {
    if (box.closest(".katex, svg")) return;
    const runs = [[]];
    [...box.childNodes].forEach((n) => {
      const inline = n.nodeType === Node.TEXT_NODE || (n.nodeType === Node.ELEMENT_NODE && n.matches(INLINE));
      if (inline) runs[runs.length - 1].push(n);
      else runs.push([]);
    });
    runs.forEach((run) => {
      const texts = run.filter((n) => n.nodeType === Node.TEXT_NODE && cjkCount(n.textContent) > 0);
      if (texts.length < 2 || !run.some((n) => n.nodeType === Node.ELEMENT_NODE && n.matches(".tex"))) return;
      while (run.length && run[0].nodeType === Node.TEXT_NODE && !run[0].textContent.trim()) run.shift();
      const wrap = document.createElement("la-run");
      run[0].before(wrap);
      run.forEach((n) => wrap.append(n));
    });
  }

  const isBlock = (el) => {
    if (el.matches(SKIP) || el.closest(".katex, svg, canvas, [hidden]")) return false;
    const display = getComputedStyle(el).display;
    return display !== "inline" && display !== "contents" && display !== "none";
  };

  /* formulas: group the KaTeX pieces so a line only breaks after a relation */
  // a piece is a KaTeX .base, or the wrapper lab-layout.js puts around the last one (with its 。)
  const pieceBase = (item) => (item.classList.contains("base") ? item : [...item.querySelectorAll(".base")].pop());
  const endsWithRelation = (item) => {
    const base = pieceBase(item);
    if (!base) return false;
    const kids = [...base.children].filter((c) => !c.classList.contains("strut") && !c.classList.contains("mspace"));
    const last = kids[kids.length - 1];
    // KaTeX ends a piece after a binary operator, a relation, or an explicit \allowbreak:
    // only the operator ends are not allowed as line breaks
    return Boolean(last && !last.classList.contains("mbin"));
  };

  function groupFormula(katex) {
    const html = katex.querySelector(":scope > .katex-html");
    if (!html || katex.closest(".katex-display") || html.dataset.laGrouped) return;
    html.dataset.laGrouped = "1";
    const bases = [...html.children].filter((c) => c.classList.contains("base") || (c.classList.contains("la-keep") && c.querySelector(".base")));
    if (bases.length < 2) return;
    const groups = [];
    let current = [];
    bases.forEach((base) => {
      current.push(base);
      if (endsWithRelation(base)) {
        groups.push(current);
        current = [];
      }
    });
    if (current.length) groups.push(current);
    groups.forEach((group) => {
      if (group.length < 2) return;
      const wrap = document.createElement("la-mg");
      group[0].before(wrap);
      group.forEach((base) => wrap.append(base));
    });
    fitGroups(katex);
  }

  /* a group wider than the line cannot stay unbroken: give its pieces back */
  function fitGroups(katex) {
    const block = katex.closest("p, li, dd, dt, td, th, div, label, button, figcaption, summary, h1, h2, h3, h4") || katex.parentElement;
    if (!block) return;
    const cs = getComputedStyle(block);
    const room = block.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    katex.querySelectorAll("la-mg").forEach((group) => {
      if (room > 0 && group.getBoundingClientRect().width > room + 1) group.replaceWith(...group.childNodes);
    });
  }

  /* an inline formula next to Chinese text: a quarter-em gap instead of a typed space */
  const HAN_END = /[\u3400-\u9fff\uf900-\ufaff](\s+)$/;
  const HAN_START = /^(\s+)[\u3400-\u9fff\uf900-\ufaff]/;
  const HAN_TOUCH_END = /[\u3400-\u9fff\uf900-\ufaff]$/;
  const HAN_TOUCH_START = /^[\u3400-\u9fff\uf900-\ufaff]/;
  // the text right before (dir = -1) or after (dir = 1) a node, within its block
  function neighbourText(node, dir) {
    let cur = node;
    for (;;) {
      let sib = dir < 0 ? cur.previousSibling : cur.nextSibling;
      while (sib) {
        if (sib.nodeType === Node.TEXT_NODE) {
          if (sib.textContent) return sib;
        } else if (sib.nodeType === Node.ELEMENT_NODE) {
          if (sib.matches(".tex, .katex, br, la-mg") || getComputedStyle(sib).display !== "inline") return null;
          if (sib.firstChild) {
            sib = dir < 0 ? sib.lastChild : sib.firstChild;
            continue;
          }
        }
        sib = dir < 0 ? sib.previousSibling : sib.nextSibling;
      }
      const up = cur.parentElement;
      if (!up || getComputedStyle(up).display !== "inline") return null;
      cur = up;
    }
  }
  // the gap is a real space (it disappears at a line break, a margin would not), narrowed
  // to about a quarter em together with the Chinese glyph's own side bearing
  const gap = () => {
    const sp = document.createElement("la-sp");
    sp.textContent = " ";
    return sp;
  };
  function spaceFormula(katex) {
    if (katex.closest(".katex-display")) return;
    const unit = katex.parentElement?.closest(".tex") || katex;
    if (unit.dataset.laSp) return;
    unit.dataset.laSp = "1";
    if (getComputedStyle(unit).display === "block") return;
    const before = neighbourText(unit, -1);
    if (before && !before.parentElement.closest("la-sp")) {
      const m = before.textContent.match(HAN_END);
      if (m) before.textContent = before.textContent.slice(0, -m[1].length);
      if (m || HAN_TOUCH_END.test(before.textContent)) before.after(gap());
    }
    // a closing mark glued to the formula (lab-layout.js) brings its own space
    if (unit.querySelector(".la-punct")) return;
    const after = neighbourText(unit, 1);
    if (after && !after.parentElement.closest("la-sp")) {
      const m = after.textContent.match(HAN_START);
      if (m) after.textContent = after.textContent.slice(m[1].length);
      if (m || HAN_TOUCH_START.test(after.textContent)) after.before(gap());
    }
  }

  // how much narrower than the body font's space the gap is: target 0.2em
  function measureGap() {
    const body = document.querySelector("main p") || document.body;
    const cs = getComputedStyle(body);
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `100px ${cs.fontFamily}`;
    const space = ctx.measureText(" ").width / 100;
    document.documentElement.style.setProperty("--la-sp-adjust", `${(0.2 - space).toFixed(3)}em`);
  }

  function process(root) {
    if (!root || !root.isConnected) return;
    const scope = root.nodeType === Node.ELEMENT_NODE ? root : root.parentElement;
    if (!scope) return;
    const main = document.querySelector("main") || document.body;
    if (!main.contains(scope)) return;
    // the blocks inside the changed part, and the block that contains it
    const all = [...scope.querySelectorAll("*")];
    if (scope.nodeType === Node.ELEMENT_NODE) all.push(scope);
    all.forEach((el) => {
      if (/flex|grid/.test(getComputedStyle(el).display)) joinRuns(el);
    });
    const blocks = [...scope.querySelectorAll("*")].filter(isBlock);
    let up = scope;
    while (up && up !== main && !isBlock(up)) up = up.parentElement;
    if (up && up !== main) blocks.push(up);
    if (isBlock(scope)) blocks.push(scope);
    const formulas = [...scope.querySelectorAll(".katex")];
    formulas.forEach(spaceFormula);
    [...new Set(blocks)].forEach(keepTail);
    const shorts = [...scope.querySelectorAll(SHORT)];
    if (scope.matches?.(SHORT)) shorts.push(scope);
    const near = scope.closest?.(SHORT);
    if (near) shorts.push(near);
    [...new Set(shorts)].forEach(keepWords);
    formulas.forEach(groupFormula);
    scope.closest?.(".katex") && groupFormula(scope.closest(".katex"));
  }

  let observer = null;
  let pending = new Set();
  let queued = false;
  const flush = () => {
    queued = false;
    const roots = [...pending];
    pending = new Set();
    observer?.disconnect();
    try {
      roots.forEach(process);
    } finally {
      observer?.observe(document.querySelector("main") || document.body, OBSERVE);
    }
  };
  const OBSERVE = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["hidden", "open"] };
  const schedule = (node) => {
    pending.add(node);
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => setTimeout(flush, 30));
  };

  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => document.querySelectorAll("main .katex").forEach(fitGroups), 200);
  };

  const start = () => {
    measureGap();
    document.fonts?.ready.then(measureGap);
    const main = document.querySelector("main") || document.body;
    observer = new MutationObserver((records) => {
      records.forEach((record) => {
        if (record.type === "characterData") schedule(record.target.parentElement);
        else if (record.type === "attributes") schedule(record.target);
        else {
          record.addedNodes.forEach((n) => schedule(n.nodeType === Node.ELEMENT_NODE ? n : record.target));
        }
      });
    });
    observer.observe(main, OBSERVE);
    window.addEventListener("resize", onResize, { passive: true });
    schedule(main);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
