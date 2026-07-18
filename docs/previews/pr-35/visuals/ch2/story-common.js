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
      return tex(`\\begin{bmatrix}${fmt(matrix[0][0], digits)}&${fmt(matrix[0][1], digits)}\\\\${fmt(matrix[1][0], digits)}&${fmt(matrix[1][1], digits)}\\end{bmatrix}`);
    }
    return tex(`\\begin{bmatrix}${matrix.map((row) => row.map((value) => fmt(value, digits)).join("&")).join("\\\\")}\\end{bmatrix}`);
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
})();
