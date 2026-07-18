/* Shared helpers for Chapter 2 geometry-first visual stories. */
(() => {
  const P = window.Ch2PresentationUtils;
  const M = () => window.Ch2Math;
  const fmt = (value, digits = 3) => M().formatNum(value, digits);
  const tex = (source) => P?.tex ? P.tex(source) : source;

  function shell(title, lead, task, controls, stage, formula = "", conclusion = "") {
    return `
      <div class="ch2-story">
        <div class="ch2-story-head"><h3>${title}</h3><p>${lead}</p></div>
        <div class="ch2-story-task"><strong>观察任务</strong><span>${task}</span></div>
        ${controls ? `<div class="ch2-story-controls">${controls}</div>` : ""}
        ${stage}
        ${formula ? `<div class="ch2-story-formula">${formula}</div>` : ""}
        ${conclusion ? `<div class="ch2-story-conclusion">${conclusion}</div>` : ""}
      </div>`;
  }

  function defs(prefix) {
    return `
      <defs>
        <marker id="${prefix}-arrow-cyan" viewBox="0 0 10 10" refX="8.2" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#48b9c5"/></marker>
        <marker id="${prefix}-arrow-orange" viewBox="0 0 10 10" refX="8.2" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#e8a15d"/></marker>
        <marker id="${prefix}-arrow-yellow" viewBox="0 0 10 10" refX="8.2" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#d7ae4f"/></marker>
        <marker id="${prefix}-arrow-muted" viewBox="0 0 10 10" refX="8.2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#71808a"/></marker>
      </defs>`;
  }

  function setActive(root, selector, active) {
    root.querySelectorAll(selector).forEach((button) => {
      const on = button === active;
      button.classList.toggle("is-active", on);
      button.setAttribute("aria-pressed", String(on));
    });
  }

  function mapPoint(origin, scale, vector) {
    return [origin[0] + vector[0] * scale, origin[1] - vector[1] * scale];
  }

  function pointsString(points) {
    return points.map((point) => point.map((value) => Number(value).toFixed(2)).join(",")).join(" ");
  }

  function parallelogram(origin, scale, u, v) {
    return [
      mapPoint(origin, scale, [0, 0]),
      mapPoint(origin, scale, u),
      mapPoint(origin, scale, [u[0] + v[0], u[1] + v[1]]),
      mapPoint(origin, scale, v),
    ];
  }

  function animate(key, duration, onFrame) {
    return M().animateTo(key, 0, 1, duration, (t) => onFrame(M().easeInOutCubic(t)));
  }

  function matrixHtml(matrix, digits = 2) {
    const rows = matrix.map((row) => row.map((value) => fmt(value, digits)).join("&")).join("\\\\");
    return tex(`\\begin{bmatrix}${rows}\\end{bmatrix}`);
  }

  function determinant(matrix) {
    return M().determinant(matrix);
  }

  window.Ch2Story = {
    P,
    M,
    fmt,
    tex,
    shell,
    defs,
    setActive,
    mapPoint,
    pointsString,
    parallelogram,
    animate,
    matrixHtml,
    determinant,
  };

  if (!document.querySelector("#ch2-story-polish")) {
    const style = document.createElement("style");
    style.id = "ch2-story-polish";
    style.textContent = `
      .story-plain-matrix {
        position: relative;
        display: grid;
        grid-template-columns: repeat(2, minmax(28px, auto));
        gap: 5px 14px;
        width: max-content;
        min-width: 82px;
        padding: 5px 14px;
        color: var(--story-ink);
        font: 600 1rem/1.25 system-ui, sans-serif;
        text-align: center;
      }
      .story-plain-matrix::before,
      .story-plain-matrix::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        width: 7px;
        border-top: 2px solid currentColor;
        border-bottom: 2px solid currentColor;
      }
      .story-plain-matrix::before {
        left: 0;
        border-left: 2px solid currentColor;
      }
      .story-plain-matrix::after {
        right: 0;
        border-right: 2px solid currentColor;
      }
      .ch2-story-formula [data-area-matrix] {
        display: flex;
        align-items: center;
        min-height: 48px;
        overflow: visible;
      }
      [data-perm-svg] > .story-caption { display: none; }
      .ch2-story-matrix-stage {
        min-height: 320px;
        padding-block: 12px;
      }
      .ch2-story-matrix-grid {
        grid-template-columns: repeat(3, 108px);
        gap: 12px;
      }
      .ch2-story-matrix-grid button,
      .ch2-story-matrix-grid span {
        width: 108px;
        height: 82px;
        font-size: 1.22rem;
      }
      @media (max-width: 820px) {
        .ch2-story-matrix-stage { min-height: 300px; padding-block: 10px; }
        .ch2-story-matrix-grid { grid-template-columns: repeat(3, 78px); gap: 9px; }
        .ch2-story-matrix-grid button,
        .ch2-story-matrix-grid span { width: 78px; height: 66px; font-size: 1.05rem; }
      }
    `;
    document.head.append(style);
  }

  function mirrorText(root, selector) {
    const nodes = Array.from(root.querySelectorAll(selector));
    if (nodes.length < 2) return null;
    const source = nodes[0];
    const sync = () => nodes.slice(1).forEach((node) => { node.textContent = source.textContent; });
    const observer = new MutationObserver(sync);
    observer.observe(source, { childList: true, subtree: true, characterData: true });
    sync();
    return () => observer.disconnect();
  }

  function polishAreaMatrix(root) {
    const source = root.querySelector("[data-area-cross]");
    const target = root.querySelector("[data-area-matrix]");
    if (!source || !target) return null;

    const sync = () => {
      const values = String(source.textContent || "").match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
      if (values.length < 4) return;
      const [u0, v1, v0, u1] = values;
      target.innerHTML = `
        <span class="story-plain-matrix" role="img" aria-label="矩阵，第一行 ${fmt(u0, 2)}，${fmt(v0, 2)}；第二行 ${fmt(u1, 2)}，${fmt(v1, 2)}">
          <span>${fmt(u0, 2)}</span><span>${fmt(v0, 2)}</span>
          <span>${fmt(u1, 2)}</span><span>${fmt(v1, 2)}</span>
        </span>`;
    };

    const observer = new MutationObserver(sync);
    observer.observe(source, { childList: true, subtree: true, characterData: true });
    sync();
    return () => observer.disconnect();
  }

  function polishCramerLabels(root) {
    const scene = root.querySelector("[data-cramer-scene]");
    if (!scene) return null;
    const apply = () => {
      scene.querySelectorAll("text").forEach((label) => {
        if (label.textContent === "a₁") {
          label.setAttribute("x", "248");
          label.setAttribute("y", "404");
        }
        if (label.textContent === "2a₁") {
          label.setAttribute("x", "310");
          label.setAttribute("y", "344");
        }
      });
    };
    const observer = new MutationObserver(apply);
    observer.observe(scene, { childList: true, subtree: true });
    apply();
    return () => observer.disconnect();
  }

  window.defineChapter2LessonEnhancer?.((section, root) => {
    const cleanups = [];
    if (section?.id === "determinant-intro") {
      const cleanup = polishAreaMatrix(root);
      if (cleanup) cleanups.push(cleanup);
    }
    if (section?.id === "determinant-computation") {
      const cleanup = mirrorText(root, "[data-elim-op]");
      if (cleanup) cleanups.push(cleanup);
    }
    if (section?.id === "laplace-and-product") {
      ["[data-lap-minor]", "[data-lap-sign]", "[data-lap-complement]"].forEach((selector) => {
        const cleanup = mirrorText(root, selector);
        if (cleanup) cleanups.push(cleanup);
      });
    }
    if (section?.id === "cramer-rule") {
      const cleanup = polishCramerLabels(root);
      if (cleanup) cleanups.push(cleanup);
    }
    return cleanups.length ? () => cleanups.reverse().forEach((cleanup) => cleanup()) : undefined;
  });
})();
