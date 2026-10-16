/*
 * Phones (≤720px): the canvas stays in view while the student reads the numbers under it.
 * A lab's main canvas sits in a box (the "stage") next to, or above, its readouts; on a
 * phone the readouts come after it in one column, so dragging and reading never shared a
 * screen. Here the stage becomes sticky (class la-stick) just under the floating top bar
 * and stays there while the rest of its row scrolls under it; lab-fit.css shortens the
 * canvas so that about half the screen is left for the readouts.
 *
 * A stage is made sticky only when it is short enough (at most half the screen, toolbars
 * hidden), when at least 120px of its row follows it (else there is nothing to read under
 * it), and when no box between it and the page clips or scrolls (sticky would then stick
 * to that box).
 * Labs with two canvases one under another are left as they are (their canvases are only
 * shortened): sticking the first one would cover the second.
 * While stuck, the stage gets is-stuck: a paper strip fills the gap up to the top of the
 * screen and a soft shadow marks its lower edge (lab-fit.css).
 * When the readout column starts with one row of buttons (“作用一次 A”, “沿平面看” …), that
 * row sticks right under the stage (la-stick-tools), so the buttons stay at hand while the
 * student reads further down. The row is not moved: some kits redraw it in place.
 *
 * Readout lists (PACK: one small card per value, “A = …”, “步骤 4/4” …) stood one per row on
 * a phone. They become a two-column grid (data-la-pack); a card whose value needs more than
 * half the width takes the whole row (data-la-wide), and so does a card that would be left
 * alone on its row, so the grid has no holes and keeps its reading order. Values change as
 * the student works, so the packing is measured again after every change.
 *
 * Some labs end in several companion panels (a chart, a step list, a back-substitution …)
 * that stand one under another on a phone and make the lab three screens long. TABS turns
 * them into one segmented bar (la-tabs) with one panel shown at a time; nothing is removed,
 * the student switches between them. The bar is placed before the first panel; panels the
 * kit redraws keep their place because the hidden flag is re-applied after every change.
 * With follow (a selector such as ".is-current"), the bar moves on by itself when the lab
 * marks another panel as current (a stepping lab's “下一步”); the student can still look back.
 * Tabs are listed lab by lab on purpose: a readout that answers the student's last action
 * must never sit on a hidden tab, so the kits' readout cards are not tabbed automatically.
 * With start, another tab than the first is shown until the student picks one.
 * A growing table of iterates (ch7 §5) scrolls inside its card, kept at the newest row.
 * A stepping lab without a canvas (ch1 §3, §4) sticks its row of step buttons instead, so
 * “下一步” stays at hand while the student reads the step it added further down.
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
    // labs without a canvas whose step buttons drive the readouts below them
    ":is(.ch1-section-polynomial-divisibility, .ch1-section-gcd-polynomials) > .ch1-controls",
  ].join(", ");
  const TOOLS = ".ch3l-actions, .ch6l-actions, .ch7l-actions, .ch9l-actions";
  const MAX_SHARE = 0.5;
  const MAX_SHARE_WITH_TOOLS = 0.58;
  const MAX_TOOLS_H = 52;
  const MIN_BELOW = 120;
  const PACK = [
    // ch1 §4 lays its three status cards out itself (lab-fit.css)
    ".ch1-metrics:not(.ch1-section-gcd-polynomials > *)",
    ".ch1-equation-grid",
    ".ch1-ld-summary",
    ".ch1-multivariate-layer-grid",
  ].join(", ");

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
    tabs();
    iterTables();
    pack();
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

  function pack() {
    const phone = Boolean(PHONE?.matches);
    document.querySelectorAll(PACK).forEach((box) => {
      const kids = [...box.children].filter((k) => getComputedStyle(k).display !== "none");
      if (!phone || kids.length < 2) {
        if (box.dataset.laPack) {
          delete box.dataset.laPack;
          [...box.children].forEach((k) => delete k.dataset.laWide);
        }
        return;
      }
      box.dataset.laPack = "1";
      const gap = parseFloat(getComputedStyle(box).columnGap) || 0;
      const half = (box.clientWidth - gap) / 2;
      // natural widths: lab-fit.css lays the cards out at max-content while data-la-measure is on
      box.dataset.laMeasure = "1";
      const widths = kids.map((k) => k.getBoundingClientRect().width);
      delete box.dataset.laMeasure;
      let lonely = null;
      kids.forEach((k, i) => {
        const wide = widths[i] > half + 0.5;
        if (wide) {
          k.dataset.laWide = "1";
          if (lonely) lonely.dataset.laWide = "1";
          lonely = null;
        } else {
          delete k.dataset.laWide;
          lonely = lonely ? null : k;
        }
      });
      if (lonely) lonely.dataset.laWide = "1";
    });
  }

  // panels: one selector per tab; a tab may show several nodes (an array of selectors)
  const TABS = [
    {
      host: ".ch1-section-gcd-polynomials",
      panels: [".ch1-stairs-card", ".ch1-euclid-panel", ".ch1-bezout-panel"],
      labels: ["余式次数", "每一步", "倒着代回"],
      start: 1,
    },
    {
      host: ".ch1-section-polynomial-divisibility",
      panels: [".ch1-ld-focus", ".ch1-stairs-card"],
      labels: ["这一步", "余式次数"],
    },
    {
      host: ".ch1-section-multiple-factors",
      panels: [".ch1-panel > .ch1-equation-grid", [".ch1-panel > h4", ".ch1-panel > .ch1-table-wrap"]],
      labels: ["f、f′ 与 gcd", "各阶导数"],
    },
    {
      host: ".ch1-section-multivariate-polynomials",
      panels: [".ch1-multivariate-inspector", ".ch1-multivariate-module"],
      labels: ["当前格点", "按次数分层"],
    },
    {
      host: ".ch3-lab:has(> .ch3-resultant-steps)",
      panels: [1, 2, 3, 4].map((i) => `.ch3-resultant-steps > section:nth-of-type(${i})`),
      labels: ["1 整理", "2 矩阵", "3 结式", "4 候选根"],
      follow: ".is-current",
    },
  ];

  function tabs() {
    const phone = Boolean(PHONE?.matches);
    TABS.forEach((cfg, n) => {
      document.querySelectorAll(cfg.host).forEach((host) => {
        const panels = cfg.panels.map((sel) => [sel].flat().map((one) => host.querySelector(one)));
        const nodes = panels.flat();
        let bar = host.querySelector(`.la-tabs[data-la-tabs="${n}"]`);
        if (!phone || nodes.some((p) => !p)) {
          bar?.remove();
          nodes.forEach((p) => p?.removeAttribute("data-la-tab-hidden"));
          return;
        }
        if (!bar) {
          bar = document.createElement("div");
          bar.className = "la-tabs";
          bar.dataset.laTabs = String(n);
          bar.setAttribute("role", "tablist");
          cfg.labels.forEach((label, i) => {
            const b = document.createElement("button");
            b.type = "button";
            b.setAttribute("role", "tab");
            b.textContent = label;
            b.addEventListener("click", () => {
              host.dataset.laTab = String(i);
              tabs();
            });
            bar.append(b);
          });
          panels[0][0].before(bar);
        }
        if (cfg.follow) {
          const live = panels.findIndex((group) => group.some((p) => p.matches(cfg.follow)));
          if (live >= 0 && String(live) !== host.dataset.laTabSeen) {
            host.dataset.laTabSeen = String(live);
            host.dataset.laTab = String(live);
          }
        }
        const current = Number(host.dataset.laTab || cfg.start || 0);
        panels.forEach((group, i) => group.forEach((p) => p.toggleAttribute("data-la-tab-hidden", i !== current)));
        [...bar.children].forEach((b, i) => {
          b.classList.toggle("is-active", i === current);
          b.setAttribute("aria-selected", String(i === current));
        });
      });
    });
  }

  // ch7 §5: a growing table of iterates scrolls inside its card; keep its newest row in view
  function iterTables() {
    if (PHONE?.matches) document.querySelectorAll("table.ch7l-iter").forEach((t) => (t.scrollTop = t.scrollHeight));
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

  // readouts change on every drag step and some labs animate their DOM nonstop: run at most
  // once per 160ms (a debounce would never fire while an animation keeps mutating)
  let timer = 0;
  const queueChoose = () => {
    if (timer) return;
    timer = setTimeout(() => {
      timer = 0;
      choose();
    }, 160);
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
