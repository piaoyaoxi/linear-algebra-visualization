/* Shared helpers for Chapter 2 cinematic SVG interactions. */
(() => {
  const { M, tex } = window.Ch2PresentationUtils;
  const fmt = (value, digits = 3) => M().formatNum(value, digits);
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, M().reducedMotion() ? 0 : ms));
  function setActive(root, selector, active) {
    root.querySelectorAll(selector).forEach((button) => {
      const on = button === active;
      button.classList.toggle("is-active", on);
      button.setAttribute("aria-pressed", String(on));
    });
  }
  function svgPoint(svg, event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = svg.getScreenCTM();
    return matrix ? point.matrixTransform(matrix.inverse()) : point;
  }
  function matrixTex2(A) {
    return tex(`\\begin{bmatrix}${fmt(A[0][0], 2)}&${fmt(A[0][1], 2)}\\\\${fmt(A[1][0], 2)}&${fmt(A[1][1], 2)}\\end{bmatrix}`);
  }
  function cinemaShell(title, lead, task, controls, stage, after = "") {
    return `
      <div class="ch2-cinema">
        <div class="ch2-cinema-head"><h3>${title}</h3><p>${lead}</p></div>
        <div class="ch2-cinema-task"><strong>观察任务</strong><span>${task}</span></div>
        ${controls ? `<div class="ch2-cinema-controls">${controls}</div>` : ""}
        ${stage}
        ${after}
      </div>`;
  }
  function defs(id) {
    return `
      <defs>
        <pattern id="${id}-grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0H0V44" class="cinema-grid-line" /></pattern>
        <marker id="${id}-arrow-cyan" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M0 0L10 5L0 10Z" class="cinema-fill-cyan" /></marker>
        <marker id="${id}-arrow-orange" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M0 0L10 5L0 10Z" class="cinema-fill-orange" /></marker>
        <marker id="${id}-arrow-white" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M0 0L10 5L0 10Z" class="cinema-fill-white" /></marker>
      </defs>`;
  }
  window.Ch2Cinema = { M, tex, fmt, pause, setActive, svgPoint, matrixTex2, cinemaShell, defs };
})();
