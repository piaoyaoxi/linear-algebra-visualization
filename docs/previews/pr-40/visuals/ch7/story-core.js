/* Chapter 7 geometric story core.
 * Loaded after the previous cinematic layer; section files re-register the
 * same lesson ids with independent, geometry-first renderers.
 */
(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);
  const EPS = 1e-9;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const fmt = (value, digits = 2) => {
    const clean = Math.abs(value) < EPS ? 0 : value;
    if (Number.isInteger(clean)) return String(clean);
    return clean.toFixed(digits).replace(/\.00$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
  };
  const add = (u, v) => u.map((value, index) => value + v[index]);
  const sub = (u, v) => u.map((value, index) => value - v[index]);
  const scale = (factor, vector) => vector.map((value) => factor * value);
  const dot = (u, v) => u.reduce((sum, value, index) => sum + value * v[index], 0);
  const norm = (vector) => Math.hypot(...vector);
  const normalize = (vector) => {
    const length = norm(vector);
    return length < EPS ? vector.map(() => 0) : vector.map((value) => value / length);
  };
  const cross2 = (u, v) => u[0] * v[1] - u[1] * v[0];
  const matVec = (matrix, vector) => matrix.map((row) => dot(row, vector));
  const matMul = (A, B) => A.map((row) => B[0].map((_, column) => row.reduce((sum, value, index) => sum + value * B[index][column], 0)));
  const det2 = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const inv2 = (A) => {
    const determinant = det2(A);
    if (Math.abs(determinant) < EPS) return null;
    return [
      [A[1][1] / determinant, -A[0][1] / determinant],
      [-A[1][0] / determinant, A[0][0] / determinant],
    ];
  };
  const identity2 = [[1, 0], [0, 1]];
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpVec = (a, b, t) => a.map((value, index) => lerp(value, b[index], t));
  const lerpMatrix = (A, B, t) => A.map((row, index) => row.map((value, column) => lerp(value, B[index][column], t)));
  const vectorText = (vector, digits = 2) => `(${vector.map((value) => fmt(value, digits)).join(", ")})`;

  function eventBinder() {
    const cleanups = [];
    return {
      on(target, type, handler, options) {
        if (!target) return;
        target.addEventListener(type, handler, options);
        cleanups.push(() => target.removeEventListener(type, handler, options));
      },
      cleanup() {
        cleanups.splice(0).forEach((cleanup) => cleanup());
      },
    };
  }

  function formalRenderer(formal, lesson) {
    if (!formal || !lesson?.formal) return;
    const concepts = lesson.concepts || [];
    const blocks = lesson.formal.blocks || [];
    formal.innerHTML = `
      <h2>${lesson.formal.heading}</h2>
      <div class="ch7-story-formal">
        <header>
          <span>本节主线</span>
          <h3>${lesson.question}</h3>
          <p>${lesson.formal.lead || ""}</p>
          ${lesson.formal.formula ? `<div class="ch7-story-formal-formula">${display(lesson.formal.formula)}</div>` : ""}
        </header>
        <ol class="ch7-story-formal-steps">
          ${concepts.map((concept, index) => `
            <li>
              <span>${String(index + 1).padStart(2, "0")}</span>
              <div><strong>${concept.label}</strong><p>${concept.text}</p></div>
            </li>`).join("")}
        </ol>
        ${blocks.length ? `<div class="ch7-story-formal-notes">${blocks.map((block) => `<section><h3>${block.title}</h3><p>${block.body}</p></section>`).join("")}</div>` : ""}
        ${lesson.formal.note ? `<p class="ch7-story-boundary"><strong>边界：</strong>${lesson.formal.note}</p>` : ""}
      </div>`;
  }

  function createStory(section, lesson, options = {}) {
    const prompts = (lesson.interactive?.prompts || []).slice(0, 3);
    section.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch7-story" data-story="${lesson.id}">
        <header class="ch7-story-intro">
          <div>
            <span>${options.kicker || "几何实验"}</span>
            <h3>${options.title || lesson.interactive?.title || lesson.question}</h3>
            <p>${options.description || lesson.interactive?.description || ""}</p>
          </div>
          ${prompts.length ? `<ol>${prompts.map((prompt, index) => `<li><span>${index + 1}</span>${prompt}</li>`).join("")}</ol>` : ""}
        </header>
        <div class="ch7-story-toolbar" data-story-toolbar></div>
        <div class="ch7-story-stage" data-story-stage></div>
        <div class="ch7-story-controls" data-story-controls></div>
        <div class="ch7-story-result" data-story-result aria-live="polite"></div>
      </div>`;
    return {
      root: section.querySelector(".ch7-story"),
      toolbar: section.querySelector("[data-story-toolbar]"),
      stage: section.querySelector("[data-story-stage]"),
      controls: section.querySelector("[data-story-controls]"),
      result: section.querySelector("[data-story-result]"),
    };
  }

  function buttons(items, active, attribute = "mode") {
    return `<div class="ch7-story-buttons" role="group">${items.map((item) => {
      const value = typeof item === "string" ? item : item.value;
      const label = typeof item === "string" ? item : item.label;
      return `<button type="button" data-${attribute}="${value}" class="${String(value) === String(active) ? "is-active" : ""}">${label}</button>`;
    }).join("")}</div>`;
  }

  function setActive(root, selector, active) {
    root.querySelectorAll(selector).forEach((button) => button.classList.toggle("is-active", button === active));
  }

  function mountRanges(container, specs, state, onInput) {
    container.innerHTML = specs.length ? `<div class="ch7-story-range-row">${specs.map((spec) => `
      <label class="ch7-story-range">
        <span>${spec.label}<output data-output="${spec.key}">${fmt(state[spec.key], spec.digits ?? 2)}${spec.suffix || ""}</output></span>
        <input type="range" data-key="${spec.key}" min="${spec.min}" max="${spec.max}" step="${spec.step ?? 0.01}" value="${state[spec.key]}" aria-label="${spec.label}">
      </label>`).join("")}</div>` : "";
    const cleanups = [];
    container.querySelectorAll('input[type="range"]').forEach((input) => {
      const handler = () => {
        const key = input.dataset.key;
        state[key] = Number(input.value);
        const spec = specs.find((item) => item.key === key);
        const output = container.querySelector(`[data-output="${key}"]`);
        if (output) output.textContent = `${fmt(state[key], spec?.digits ?? 2)}${spec?.suffix || ""}`;
        onInput?.(key);
      };
      input.addEventListener("input", handler);
      cleanups.push(() => input.removeEventListener("input", handler));
    });
    return () => cleanups.splice(0).forEach((cleanup) => cleanup());
  }

  function result({ tone = "neutral", title, text, formula = "", facts = [] }) {
    return `
      <div class="ch7-story-result-inner is-${tone}">
        <div>
          <span>${tone === "pass" ? "结论成立" : tone === "fail" ? "出现反例" : tone === "warn" ? "观察边界" : "当前结论"}</span>
          <strong>${title}</strong>
          <p>${text}</p>
        </div>
        ${formula ? `<div class="ch7-story-result-formula">${display(formula)}</div>` : ""}
        ${facts.length ? `<dl>${facts.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join("")}</dl>` : ""}
      </div>`;
  }

  function softArrow(x1, y1, x2, y2, className = "") {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const px = -uy;
    const py = ux;
    const shaft = Math.min(3.2, Math.max(1.8, length / 100));
    const headLength = Math.min(18, Math.max(12, length * 0.18));
    const headWidth = Math.min(8.5, Math.max(6, length * 0.08));
    const neckX = x2 - ux * headLength;
    const neckY = y2 - uy * headLength;
    const point = (x, y) => `${x.toFixed(2)} ${y.toFixed(2)}`;
    const path = [
      `M ${point(x1 + px * shaft, y1 + py * shaft)}`,
      `L ${point(neckX + px * shaft, neckY + py * shaft)}`,
      `L ${point(neckX + px * headWidth, neckY + py * headWidth)}`,
      `Q ${point(x2 - ux * 2 + px, y2 - uy * 2 + py)} ${point(x2, y2)}`,
      `Q ${point(x2 - ux * 2 - px, y2 - uy * 2 - py)} ${point(neckX - px * headWidth, neckY - py * headWidth)}`,
      `L ${point(neckX - px * shaft, neckY - py * shaft)}`,
      `L ${point(x1 - px * shaft, y1 - py * shaft)}`,
      `A ${shaft} ${shaft} 0 0 0 ${point(x1 + px * shaft, y1 + py * shaft)}`,
      "Z",
    ].join(" ");
    return `<path class="ch7-story-arrow ${className}" d="${path}"></path>`;
  }

  function createPlane({ x = 0, y = 0, width = 800, height = 500, extent = 3, className = "" } = {}) {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const sx = width / (extent * 2);
    const sy = height / (extent * 2);
    const p = ([vx, vy]) => [cx + vx * sx, cy - vy * sy];
    const v = ([px, py]) => [(px - cx) / sx, (cy - py) / sy];
    const grid = (step = 1, extraClass = "") => {
      const lines = [];
      for (let value = Math.ceil(-extent); value <= Math.floor(extent); value += step) {
        const [gx] = p([value, 0]);
        const [, gy] = p([0, value]);
        lines.push(`<line x1="${gx}" y1="${y}" x2="${gx}" y2="${y + height}" class="ch7-story-grid ${extraClass}"/>`);
        lines.push(`<line x1="${x}" y1="${gy}" x2="${x + width}" y2="${gy}" class="ch7-story-grid ${extraClass}"/>`);
      }
      return lines.join("");
    };
    const axes = () => `<line x1="${x}" y1="${cy}" x2="${x + width}" y2="${cy}" class="ch7-story-axis"/><line x1="${cx}" y1="${y}" x2="${cx}" y2="${y + height}" class="ch7-story-axis"/>`;
    const vector = (to, role = "primary", label = "", from = [0, 0], extraClass = "") => {
      const [x1, y1] = p(from);
      const [x2, y2] = p(to);
      return `${softArrow(x1, y1, x2, y2, `is-${role} ${extraClass}`)}${label ? `<text x="${x2 + 10}" y="${y2 - 10}" class="ch7-story-label is-${role}">${label}</text>` : ""}`;
    };
    const line = (direction, role = "primary", widthScale = extent * 1.45, extraClass = "") => {
      const unit = normalize(direction);
      const a = p(scale(-widthScale, unit));
      const b = p(scale(widthScale, unit));
      return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ch7-story-line is-${role} ${extraClass}"/>`;
    };
    const band = (direction, role = "primary", thickness = 0.16, extraClass = "") => {
      const unit = normalize(direction);
      const normal = [-unit[1], unit[0]];
      const length = extent * 1.45;
      const points = [
        add(scale(-length, unit), scale(thickness, normal)),
        add(scale(length, unit), scale(thickness, normal)),
        add(scale(length, unit), scale(-thickness, normal)),
        add(scale(-length, unit), scale(-thickness, normal)),
      ].map((point) => p(point).join(",")).join(" ");
      return `<polygon points="${points}" class="ch7-story-band is-${role} ${extraClass}"/>`;
    };
    const point = (at, role = "primary", radius = 6, label = "", extraClass = "") => {
      const [px, py] = p(at);
      return `<circle cx="${px}" cy="${py}" r="${radius}" class="ch7-story-point is-${role} ${extraClass}"/>${label ? `<text x="${px + 10}" y="${py - 10}" class="ch7-story-label is-${role}">${label}</text>` : ""}`;
    };
    return { x, y, width, height, cx, cy, sx, sy, p, v, grid, axes, vector, line, band, point, className };
  }

  function transformedGrid(plane, matrix, options = {}) {
    const extent = options.extent ?? 3;
    const step = options.step ?? 0.5;
    const role = options.role || "output";
    const className = options.className || "";
    const paths = [];
    const samples = 48;
    for (let fixed = -extent; fixed <= extent + EPS; fixed += step) {
      const vertical = [];
      const horizontal = [];
      for (let index = 0; index <= samples; index += 1) {
        const t = -extent + (2 * extent * index) / samples;
        vertical.push(plane.p(matVec(matrix, [fixed, t])));
        horizontal.push(plane.p(matVec(matrix, [t, fixed])));
      }
      const path = (points) => points.map((point, index) => `${index ? "L" : "M"}${point[0].toFixed(2)} ${point[1].toFixed(2)}`).join(" ");
      paths.push(`<path d="${path(vertical)}" class="ch7-story-warp-grid is-${role} ${className}"/>`);
      paths.push(`<path d="${path(horizontal)}" class="ch7-story-warp-grid is-${role} ${className}"/>`);
    }
    return paths.join("");
  }

  function svg(content, { width = 960, height = 560, label = "线性代数几何实验", className = "" } = {}) {
    return `<svg class="ch7-story-svg ${className}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">${content}</svg>`;
  }

  function dragPoint(svgElement, plane, onMove, options = {}) {
    if (!svgElement) return () => {};
    let active = false;
    const binder = eventBinder();
    const update = (event) => {
      const rect = svgElement.getBoundingClientRect();
      const viewBox = svgElement.viewBox.baseVal;
      const px = viewBox.x + ((event.clientX - rect.left) / rect.width) * viewBox.width;
      const py = viewBox.y + ((event.clientY - rect.top) / rect.height) * viewBox.height;
      onMove(plane.v([px, py]), event);
    };
    binder.on(svgElement, "pointerdown", (event) => {
      const handle = event.target.closest(options.selector || "[data-drag-handle]");
      if (!handle) return;
      active = true;
      svgElement.setPointerCapture?.(event.pointerId);
      update(event);
      event.preventDefault();
    }, { passive: false });
    binder.on(svgElement, "pointermove", (event) => {
      if (!active) return;
      update(event);
      event.preventDefault();
    }, { passive: false });
    const end = (event) => {
      if (!active) return;
      active = false;
      if (svgElement.hasPointerCapture?.(event.pointerId)) svgElement.releasePointerCapture(event.pointerId);
    };
    binder.on(svgElement, "pointerup", end);
    binder.on(svgElement, "pointercancel", end);
    return () => binder.cleanup();
  }

  const api = {
    EPS,
    inline,
    display,
    clamp,
    fmt,
    add,
    sub,
    scale,
    dot,
    norm,
    normalize,
    cross2,
    matVec,
    matMul,
    det2,
    inv2,
    identity2,
    lerp,
    lerpVec,
    lerpMatrix,
    vectorText,
    eventBinder,
    formalRenderer,
    createStory,
    buttons,
    setActive,
    mountRanges,
    result,
    softArrow,
    createPlane,
    transformedGrid,
    svg,
    dragPoint,
    register(id, interactive, formal = formalRenderer) {
      window.defineChapter7Renderer?.(id, { formal, interactive });
    },
  };

  window.Ch7Story = api;
})();
