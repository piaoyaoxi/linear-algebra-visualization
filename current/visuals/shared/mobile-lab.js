/*
 * Phones (≤720px): the canvas stays in view while the student reads the numbers under it.
 * A lab's main canvas sits in a box (the "stage") next to, or above, its readouts; on a
 * phone the readouts come after it in one column, so dragging and reading never shared a
 * screen. Here the stage becomes sticky (class la-stick) just under the floating top bar
 * and stays there while the rest of its row scrolls under it; mobile-lab.css shortens the
 * canvas so that about half the screen is left for the readouts.
 *
 * A stage is made sticky only when it is short enough (at most half the screen, toolbars
 * hidden), when at least 120px of its row follows it (else there is nothing to read under
 * it), and when no box between it and the page clips or scrolls (sticky would then stick
 * to that box).
 * Labs with two canvases one under another are left as they are (their canvases are only
 * shortened): sticking the first one would cover the second.
 * While stuck, the stage gets is-stuck: a paper strip fills the gap up to the top of the
 * screen and a soft shadow marks its lower edge (mobile-lab.css).
 * When the readout column starts with one row of buttons (“作用一次 A”, “沿平面看” …), that
 * row sticks right under the stage (la-stick-tools), so the buttons stay at hand while the
 * student reads further down. The row is not moved: some kits redraw it in place.
 */
(() => {
  const PHONE = window.matchMedia?.("(max-width: 720px)");
  const STAGES = [
    ":is(.ch3l-body, .ch6l-body, .ch7l-body, .ch9l-body) > :is(.ch3l-stage, .ch6l-stage, .ch7l-stage, .ch9l-stage, .el6-stage)",
    ".ch1-two-col > .ch1-stage",
    ".ch1-motion-grid > .ch1-complex-canvas-shell",
    ".ch1-multivariate-primary > .ch1-multivariate-stage",
    ".ch2-lab-grid > .ch2-stage",
    ".ch2-cramer-main > .ch2-stage",
    ".ch2-term-workbench > .ch2-term-scene",
    ".ch3-lab-grid > .ch3-stage",
    ".s2c-panel > .s2c-canvas-shell",
    ".inverse-workbench > .inverse-plane-card",
  ].join(", ");
  const TOOLS = ".ch3l-actions, .ch6l-actions, .ch7l-actions, .ch9l-actions";
  const MAX_SHARE = 0.5;
  const MAX_SHARE_WITH_TOOLS = 0.58;
  const MAX_TOOLS_H = 52;
  const MIN_BELOW = 120;

  const clips = (el) => {
    for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
      const cs = getComputedStyle(node);
      if (/hidden|auto|scroll/.test(cs.overflowX + cs.overflowY)) return true;
    }
    return false;
  };

  // how much of the row comes after the stage (siblings may be display: contents), measured
  // where the stage sits unstuck: a stuck stage has moved down its row
  function below(stage) {
    stage.style.setProperty("position", "static", "important");
    const rest = stage.parentElement.getBoundingClientRect().bottom - stage.getBoundingClientRect().bottom;
    stage.style.removeProperty("position");
    return rest;
  }

  // the screen height with the browser's bars hidden (100lvh): iOS Safari changes innerHeight
  // as its toolbars slide, which must not switch a stage on and off while scrolling
  let probe = null;
  function screenHeight() {
    if (!probe) {
      probe = document.createElement("div");
      probe.setAttribute("aria-hidden", "true");
      probe.style.cssText = "position:fixed;top:0;left:-9px;width:1px;height:100vh;height:100lvh;visibility:hidden;pointer-events:none";
      document.body.append(probe);
    }
    return Math.max(probe.getBoundingClientRect().height, window.innerHeight);
  }

  function choose() {
    const phone = Boolean(PHONE?.matches);
    const screen = phone ? screenHeight() : 0;
    document.querySelectorAll("[id$='-interactive']").forEach((section) => {
      const stages = phone ? [...section.querySelectorAll(STAGES)].filter((s) => s.offsetParent) : [];
      let picked = null;
      for (const stage of stages) {
        if (stage.getBoundingClientRect().height <= screen * MAX_SHARE && !clips(stage) && below(stage) >= MIN_BELOW) {
          picked = stage;
          break;
        }
      }
      section.querySelectorAll(".la-stick").forEach((s) => {
        if (s !== picked) s.classList.remove("la-stick", "is-stuck");
      });
      picked?.classList.add("la-stick");

      let tools = picked?.nextElementSibling?.firstElementChild;
      const stageH = picked ? picked.getBoundingClientRect().height : 0;
      const toolsH = tools ? tools.getBoundingClientRect().height : 0;
      if (!tools?.matches(TOOLS) || !toolsH || toolsH > MAX_TOOLS_H || stageH + toolsH > screen * MAX_SHARE_WITH_TOOLS) tools = null;
      section.querySelectorAll(".la-stick-tools").forEach((t) => {
        if (t === tools) return;
        t.classList.remove("la-stick-tools", "is-stuck");
        t.style.removeProperty("--la-tools-top");
      });
      if (tools) {
        tools.classList.add("la-stick-tools");
        tools.style.setProperty("--la-tools-top", `${Math.round(stageH)}px`);
      }
    });
    mark();
  }

  // is-stuck: the stage sits at its sticky top and the row still goes on under it
  function mark() {
    document.querySelectorAll(".la-stick, .la-stick-tools").forEach((stage) => {
      const top = parseFloat(getComputedStyle(stage).top) || 0;
      const r = stage.getBoundingClientRect();
      const row = stage.parentElement.getBoundingClientRect();
      const stuck = Math.abs(r.top - top) < 1.5 && row.top < r.top - 1;
      stage.classList.toggle("is-stuck", stuck);
    });
  }

  // readouts change on every drag step; the choice only needs to follow new or re-rendered labs
  let timer = 0;
  const queueChoose = () => {
    clearTimeout(timer);
    timer = setTimeout(choose, 160);
  };

  const start = () => {
    new MutationObserver(queueChoose).observe(document.querySelector("main") || document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", () => requestAnimationFrame(mark), { passive: true });
    window.addEventListener("resize", queueChoose, { passive: true });
    PHONE?.addEventListener?.("change", queueChoose);
    document.fonts?.ready.then(queueChoose);
    choose();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
