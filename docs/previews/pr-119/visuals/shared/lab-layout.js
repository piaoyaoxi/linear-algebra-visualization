/*
 * Lab layout (docs/design-spec.md §6), applied after a lab renders so every kit
 * (ch3l / ch6l / ch7l / ch9l, and ch8 / ch10 on the ch7 kit) gets the same order:
 *   title → prediction (full width) → canvas + caption | buttons + readouts.
 * It only moves existing nodes, so the labs' own listeners keep working:
 *   - the prediction box moves out of the side column to just above the canvas row;
 *   - the drag hint drawn on the canvas becomes a numbered caption under it,
 *     e.g. “图 7.5-1 拖动 x₀（每次半格）”.
 */
(() => {
  const LAB = ".ch3l-lab, .ch6l-lab, .ch7l-lab, .ch9l-lab";
  const PREDICT = ".ch3l-predict, .ch6l-predict, .ch7l-predict, .ch9l-predict";
  const FRAME = ".ch7p, .ch9p, .la3d";
  const HINT = ".ch7p-hint, .ch9p-hint, .la3d-hint";
  const SIDE = ".ch3l-side, .ch6l-side, .ch7l-side, .ch9l-side";
  const CARD = ".ch3l-card, .ch6l-card, .ch7l-card, .ch9l-card";

  function figurePrefix() {
    const [chapterId, sectionId] = (location.hash.slice(1) || "").split("/");
    const chapterNo = Number((chapterId || "").replace(/\D/g, ""));
    // algebraContent is a top-level const in content/, so it is not on window
    const content = typeof algebraContent !== "undefined" ? algebraContent : window.algebraContent;
    const chapter = content?.chapters?.find((c) => c.id === chapterId);
    const section = chapter?.sections?.find((s) => s && s.id === sectionId);
    const sectionNo = Number(String(section?.number || "").replace(/\D/g, ""));
    return chapterNo && sectionNo ? `${chapterNo}.${sectionNo}` : "";
  }

  /* the direct child of the lab that holds the canvases */
  function canvasRow(lab) {
    const frame = lab.querySelector(FRAME);
    if (!frame) return null;
    let node = frame;
    while (node.parentElement && node.parentElement !== lab) node = node.parentElement;
    return node.parentElement === lab ? node : null;
  }

  function placePrediction(lab, row) {
    const box = lab.querySelector(PREDICT);
    if (!box || !row) return;
    // the gate container the lab created (or the box itself when it is a direct child)
    const parent = box.parentElement;
    const gate = parent && parent !== lab && parent.children.length === 1 ? parent : box;
    const after = gate.parentElement === lab && row.compareDocumentPosition(gate) & Node.DOCUMENT_POSITION_FOLLOWING;
    if (row.contains(gate) || after) row.before(gate);
  }

  function captions(lab, prefix, counter) {
    lab.querySelectorAll(FRAME).forEach((frame) => {
      if (frame.dataset.laCaptioned) return;
      const hint = frame.querySelector(HINT);
      // a number with nothing after it says nothing: a frame without a hint gets no caption
      // (yet: a hint written later is captioned then)
      if (!hint?.textContent.trim()) return;
      frame.dataset.laCaptioned = "1";
      counter.n += 1;
      const fig = document.createElement("p");
      fig.className = "la-figcaption";
      const label = prefix ? `图 ${prefix}-${counter.n}` : "";
      fig.innerHTML = `${label ? `<b>${label}</b>` : ""}<span>${hint.textContent}</span>`;
      hint.hidden = true;
      frame.after(fig);
    });
  }

  /*
   * A closing mark (，。；：、）) right after an inline formula is glued to it, so a
   * line never starts with punctuation when the formula ends a line.
   */
  const CLOSERS = "，。；：、）！？";
  function gluePunctuation(lab) {
    // hand-written wrappers around a whole formula (some labs): unwrap, then glue as below
    lab.querySelectorAll(".la-keep").forEach((keep) => {
      if (keep.querySelector(".la-punct") || !keep.querySelector(":scope > .tex-inline")) return;
      keep.replaceWith(...keep.childNodes);
    });
    lab.querySelectorAll(".tex-inline").forEach((formula) => {
      const next = formula.nextSibling;
      if (!next || next.nodeType !== Node.TEXT_NODE || !CLOSERS.includes(next.textContent.charAt(0))) return;
      // every closing mark in a row (“），”) goes with the formula
      let count = 0;
      while (count < next.textContent.length && CLOSERS.includes(next.textContent.charAt(count))) count += 1;
      if (formula.parentElement?.classList.contains("la-keep") || formula.querySelector(".la-keep")) return;
      const mark = document.createElement("span");
      mark.className = "la-punct";
      mark.textContent = next.textContent.slice(0, count);
      // only the formula's last piece is glued to the mark, so a long formula can still
      // break in the middle and the mark stays right after its end
      const html = formula.querySelector(".katex-html");
      // typeset.js may have grouped the pieces (<la-mg>): the last piece is the last .base anywhere
      const bases = html ? [...html.querySelectorAll(".base")] : [];
      const keep = document.createElement("span");
      keep.className = "la-keep";
      if (bases.length) {
        const last = bases[bases.length - 1];
        last.before(keep);
        keep.append(last, mark);
      } else {
        formula.before(keep);
        keep.append(formula, mark);
      }
      next.textContent = next.textContent.slice(count);
      if (!next.textContent) next.remove();
    });
  }

  /*
   * An inline formula wider than its paragraph (a matrix cannot wrap) gets a line of
   * its own that scrolls sideways, instead of running past the card's edge on phones.
   */
  function fitWideFormulas(root) {
    root.querySelectorAll(".tex-inline").forEach((formula) => {
      const block = formula.parentElement?.closest("p, li, div, dd, td, label, figcaption");
      if (!block || !formula.offsetParent) return;
      formula.classList.remove("la-wide");
      const cs = getComputedStyle(block);
      const room = block.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      // a formula that already wraps onto several lines fits; only a single unbreakable run is too wide
      const pieces = formula.querySelector(".katex-html")?.getClientRects().length ?? 1;
      // the box itself may be capped at the paragraph width while the formula inside runs on
      const inner = formula.querySelector(".katex")?.getBoundingClientRect().width ?? 0;
      const width = Math.max(formula.getBoundingClientRect().width, inner, formula.scrollWidth);
      if (pieces <= 1 && width > room + 1) formula.classList.add("la-wide");
    });
  }

  function normalize() {
    // the whole lesson, not only the labs: examples, theorems and self-tests too
    const main = document.querySelector("main") || document.body;
    gluePunctuation(main);
    fitWideFormulas(main);
    const labs = document.querySelectorAll(LAB);
    if (!labs.length) return;
    const prefix = figurePrefix();
    const counter = { n: document.querySelectorAll(".la-figcaption").length };
    labs.forEach((lab) => {
      if (!lab.isConnected) return;
      const row = canvasRow(lab);
      placePrediction(lab, row);
      captions(lab, prefix, counter);
      gluePunctuation(lab);
      // The last readout card stretches to the canvas bottom only when little space
      // is left over; a short readout keeps its natural height (no empty box).
      lab.querySelectorAll(SIDE).forEach((side) => {
        const cards = [...side.children].filter((c) => c.matches(CARD) && !c.hidden);
        cards.forEach((c) => c.classList.remove("la-fill"));
        const last = cards[cards.length - 1];
        if (!last) return;
        const spare = side.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom;
        if (spare > 0 && spare < 120) last.classList.add("la-fill");
      });
      placeResult(lab, row);
      fillFrame(lab, row);
      gatePrimary(lab);
      lab.classList.add("la-laid-out");
      // a wide row of presets would squeeze the title: put it on its own row instead
      const head = lab.querySelector(":scope > .ch3l-head, :scope > .ch6l-head, :scope > .ch7l-head, :scope > .ch9l-head");
      if (head) {
        lab.classList.remove("la-stack");
        if (head.getBoundingClientRect().width < 360) lab.classList.add("la-stack");
      }
    });
  }

  /*
   * When the side column runs far below the canvas (typically once the conclusion
   * opens), the conclusion moves under both columns as a full-width card, so the
   * canvas column does not end in a large empty space.
   */
  const RESULT = ".ch3l-result, .ch6l-result, .ch7l-result, .ch9l-result";
  function contentBottom(el) {
    let bottom = el.getBoundingClientRect().top;
    el.querySelectorAll("canvas, svg, img, button, input, select, p, figcaption, span, b, strong").forEach((n) => {
      if (!n.offsetParent || (n.closest("svg") && n.tagName.toLowerCase() !== "svg")) return;
      bottom = Math.max(bottom, n.getBoundingClientRect().bottom);
    });
    return bottom;
  }
  function placeResult(lab, row) {
    if (!row) return;
    const side = row.querySelector(SIDE);
    const result = side?.querySelector(`:scope > ${RESULT}, ${RESULT}`);
    if (!side || !result || result.hidden || !result.offsetParent) return;
    const stage = [...row.children].find((c) => c !== side && !c.contains(side) && c.querySelector(FRAME));
    if (!stage) return;
    // single column (narrow screens): the result is already below the canvas
    if (Math.abs(stage.getBoundingClientRect().top - side.getBoundingClientRect().top) > 40) return;
    const gap = side.getBoundingClientRect().bottom - contentBottom(stage);
    if (gap > 140) {
      result.classList.add("la-result-wide");
      row.after(result);
    }
  }

  /* What is still left over is taken up by the canvas frame (the canvas sits centred in it). */
  function fillFrame(lab, row) {
    if (!row) return;
    const side = row.querySelector(SIDE);
    const frame = row.querySelector(FRAME);
    if (!side || !frame) return;
    frame.style.minHeight = "";
    frame.classList.remove("la-frame-fill");
    const stage = [...row.children].find((c) => c !== side && !c.contains(side) && c.contains(frame));
    if (!stage || Math.abs(stage.getBoundingClientRect().top - side.getBoundingClientRect().top) > 40) return;
    // only when the frame is the last big thing in its column (captions may follow it)
    const gap = side.getBoundingClientRect().bottom - contentBottom(stage);
    if (gap > 40 && gap < 480) {
      frame.style.minHeight = `${Math.round(frame.getBoundingClientRect().height + gap)}px`;
      frame.classList.add("la-frame-fill");
    }
  }

  /*
   * Until the student has picked a prediction, the lab's primary action stays
   * disabled (spec: “选中前主按钮不可用”); dragging and presets stay free to explore.
   */
  const PICKED = ".is-picked, .is-right, .is-wrong";
  function gatePrimary(lab) {
    const box = lab.querySelector(PREDICT);
    // data-la-free: the lab locks its own later steps, so the early steps stay usable
    const primaries = [...lab.querySelectorAll("button.is-primary:not([data-la-free])")].filter((b) => !box || !box.contains(b));
    if (!box || !primaries.length) return;
    const open = box.classList.contains("is-done") || Boolean(box.querySelector(PICKED));
    primaries.forEach((b) => {
      if (!open && !b.disabled) {
        b.disabled = true;
        b.dataset.laGated = "1";
        b.title = "先在上方猜一猜";
      } else if (open && b.dataset.laGated) {
        b.disabled = false;
        delete b.dataset.laGated;
        b.removeAttribute("title");
      }
    });
    if (!lab.dataset.laGateWatch) {
      lab.dataset.laGateWatch = "1";
      lab.addEventListener("click", (e) => {
        if (e.target.closest(PREDICT)) requestAnimationFrame(() => gatePrimary(lab));
      });
    }
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      normalize();
    });
  };

  const start = () => {
    const main = document.querySelector("main") || document.body;
    // also when something hidden opens (an answer, a conclusion): it needs the same layout pass
    new MutationObserver(schedule).observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "open"] });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
