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
    if (matrix.length === 2 && matrix[0].length === 2) {
      return tex(`\begin{bmatrix}${fmt(matrix[0][0], digits)}&${fmt(matrix[0][1], digits)}\\${fmt(matrix[1][0], digits)}&${fmt(matrix[1][1], digits)}\end{bmatrix}`);
    }
    return tex(`\begin{bmatrix}${matrix.map((row) => row.map((value) => fmt(value, digits)).join("&")).join("\\")}\end{bmatrix}`);
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

  // Screenshot-driven refinements shared by the story renderers.
  if (!document.querySelector("#ch2-story-polish")) {
    const style = document.createElement("style");
    style.id = "ch2-story-polish";
    style.textContent = `
      .ch2-story-formula [data-area-matrix],
      .ch2-story-formula [data-area-matrix] .katex {
        white-space: nowrap;
        overflow-wrap: normal;
      }
      .ch2-story-formula [data-area-matrix] {
        display: flex;
        align-items: center;
        min-height: 46px;
        overflow-x: auto;
      }
      [data-perm-svg] > .story-caption { display: none; }
      .ch2-story-matrix-stage {
        min-height: 350px;
        padding-block: 22px;
      }
      .ch2-story-matrix-grid {
        grid-template-columns: repeat(3, 96px);
        gap: 12px;
      }
      .ch2-story-matrix-grid button,
      .ch2-story-matrix-grid span {
        width: 96px;
        height: 76px;
        font-size: 1.16rem;
      }
      @media (max-width: 820px) {
        .ch2-story-matrix-stage { min-height: 315px; }
        .ch2-story-matrix-grid { grid-template-columns: repeat(3, 72px); gap: 9px; }
        .ch2-story-matrix-grid button,
        .ch2-story-matrix-grid span { width: 72px; height: 62px; }
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
