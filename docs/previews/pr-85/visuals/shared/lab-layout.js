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
      frame.dataset.laCaptioned = "1";
      counter.n += 1;
      const hint = frame.querySelector(HINT);
      const fig = document.createElement("p");
      fig.className = "la-figcaption";
      const label = prefix ? `图 ${prefix}-${counter.n}` : "";
      fig.innerHTML = `${label ? `<b>${label}</b>` : ""}<span>${hint ? hint.textContent : ""}</span>`;
      if (hint) hint.hidden = true;
      if (label || hint) frame.after(fig);
    });
  }

  function normalize() {
    const labs = document.querySelectorAll(LAB);
    if (!labs.length) return;
    const prefix = figurePrefix();
    const counter = { n: document.querySelectorAll(".la-figcaption").length };
    labs.forEach((lab) => {
      if (!lab.isConnected) return;
      const row = canvasRow(lab);
      placePrediction(lab, row);
      captions(lab, prefix, counter);
      // the last readout card in the side column takes the spare height
      lab.querySelectorAll(SIDE).forEach((side) => {
        const cards = [...side.children].filter((c) => c.matches(CARD));
        cards.forEach((c, i) => c.classList.toggle("la-fill", i === cards.length - 1));
      });
      lab.classList.add("la-laid-out");
    });
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
    new MutationObserver(schedule).observe(main, { childList: true, subtree: true });
    schedule();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
