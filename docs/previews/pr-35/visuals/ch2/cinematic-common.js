/* Shared helpers for Chapter 2 geometry-first SVG interactions. */
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

  /*
   * One closed path per arrow, following the mature Chapter 4 implementation.
   * The shaft and arrowhead can never split into different colors or appear as
   * a decorative bar with a detached point.
   */
  function softArrowPath(x1, y1, x2, y2, options = {}) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const px = -uy;
    const py = ux;
    const halfWidth = options.halfWidth ?? 3.2;
    const headLength = Math.min(options.maxHeadLength ?? 22, Math.max(options.minHeadLength ?? 15, length * 0.18));
    const headHalf = options.headHalf ?? 8.5;
    const neckX = x2 - ux * headLength;
    const neckY = y2 - uy * headLength;
    const f = (value) => Number(value).toFixed(2);
    const point = (x, y) => `${f(x)} ${f(y)}`;
    return [
      `M ${point(x1 + px * halfWidth, y1 + py * halfWidth)}`,
      `L ${point(neckX + px * halfWidth, neckY + py * halfWidth)}`,
      `L ${point(neckX + px * headHalf, neckY + py * headHalf)}`,
      `Q ${point(x2 - ux * headLength * 0.16 + px * 1.2, y2 - uy * headLength * 0.16 + py * 1.2)} ${point(x2, y2)}`,
      `Q ${point(x2 - ux * headLength * 0.16 - px * 1.2, y2 - uy * headLength * 0.16 - py * 1.2)} ${point(neckX - px * headHalf, neckY - py * headHalf)}`,
      `L ${point(neckX - px * halfWidth, neckY - py * halfWidth)}`,
      `L ${point(x1 - px * halfWidth, y1 - py * halfWidth)}`,
      `A ${halfWidth} ${halfWidth} 0 0 0 ${point(x1 + px * halfWidth, y1 + py * halfWidth)}`,
      "Z",
    ].join(" ");
  }

  function cinemaShell(title, lead, task, controls, stage, after = "") {
    return `
      <div class="ch2-cinema">
        <div class="ch2-cinema-head">
          <span class="ch2-cinema-kicker">GEOMETRY FIRST · 几何先于公式</span>
          <h3>${title}</h3>
          <p>${lead}</p>
        </div>
        <div class="ch2-cinema-task"><strong>只看这一件事</strong><span>${task}</span></div>
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

  window.Ch2Cinema = {
    M,
    tex,
    fmt,
    pause,
    setActive,
    svgPoint,
    matrixTex2,
    softArrowPath,
    cinemaShell,
    defs,
  };
})();