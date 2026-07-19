/* Shared mathematics and drawing language for Chapter 7.
 *
 * The chapter deliberately reuses the site's existing paper, ink, teal,
 * coral and gold tokens. Section renderers own their composition; this file
 * only supplies small, semantically named primitives.
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
      <div class="ch7-formal">
        <p class="ch7-formal-lead">${lesson.formal.lead || ""}</p>
        ${lesson.formal.formula ? `<div class="ch7-formal-equation">${display(lesson.formal.formula)}</div>` : ""}
        <ol class="ch7-concept-list">
          ${concepts.map((concept, index) => `
            <li>
              <span>${String(index + 1).padStart(2, "0")}</span>
              <div><h3>${concept.label}</h3><p>${concept.text}</p></div>
            </li>`).join("")}
        </ol>
        ${blocks.length ? `<div class="ch7-reading-notes">${blocks.map((block) => `<section><h3>${block.title}</h3><p>${block.body}</p></section>`).join("")}</div>` : ""}
        ${lesson.formal.note ? `<p class="ch7-boundary-note"><strong>边界：</strong>${lesson.formal.note}</p>` : ""}
      </div>`;
  }

  function createLab(section, lesson, options = {}) {
    const prompt = options.task || lesson.interactive?.task || lesson.interactive?.prompts?.[0] || "改变参数，观察图中的数学对象。";
    section.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch7-lab ch7-lab-${options.layout || "plane"}" data-ch7-lab="${lesson.id}">
        <header class="ch7-lab-head">
          <span>本实验要回答</span>
          <h3>${options.title || lesson.interactive?.title || lesson.question}</h3>
          <p>${options.description || lesson.interactive?.description || ""}</p>
          <p class="ch7-lab-task"><strong>操作：</strong>${prompt}</p>
        </header>
        <div class="ch7-lab-toolbar" data-lab-toolbar></div>
        <div class="ch7-lab-stage" data-lab-stage></div>
        <div class="ch7-lab-controls" data-lab-controls></div>
        <div class="ch7-lab-result" data-lab-result aria-live="polite"></div>
      </div>`;
    return {
      root: section.querySelector(".ch7-lab"),
      toolbar: section.querySelector("[data-lab-toolbar]"),
      stage: section.querySelector("[data-lab-stage]"),
      controls: section.querySelector("[data-lab-controls]"),
      result: section.querySelector("[data-lab-result]"),
    };
  }

  function buttonGroup(label, items, active, attribute = "mode") {
    return `<div class="ch7-control-group"><span class="ch7-control-label">${label}</span><div class="ch7-choice-row" role="group" aria-label="${label}">${items.map((item) => {
      const value = typeof item === "string" ? item : item.value;
      const text = typeof item === "string" ? item : item.label;
      return `<button type="button" data-${attribute}="${value}" class="${String(value) === String(active) ? "is-active" : ""}">${text}</button>`;
    }).join("")}</div></div>`;
  }

  function setActive(root, selector, active) {
    root.querySelectorAll(selector).forEach((button) => button.classList.toggle("is-active", button === active));
  }

  function mountRanges(container, specs, state, onInput) {
    container.innerHTML = specs.length ? `<div class="ch7-range-grid">${specs.map((spec) => `
      <label class="ch7-range">
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
      let dragMode = null;
      let pointerId = null;
      const setFromClientX = (clientX) => {
        const rect = input.getBoundingClientRect();
        if (!rect.width) return;
        const min = Number(input.min);
        const max = Number(input.max);
        const step = Number(input.step) || 0.01;
        const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
        const stepped = min + Math.round(((min + ratio * (max - min)) - min) / step) * step;
        input.value = String(clamp(stepped, min, max));
        handler();
      };
      const add = (target, type, listener, options) => {
        target.addEventListener(type, listener, options);
        cleanups.push(() => target.removeEventListener(type, listener, options));
      };
      input.addEventListener("input", handler);
      cleanups.push(() => input.removeEventListener("input", handler));
      add(input, "mousedown", (event) => {
        if (event.button !== 0 || input.disabled) return;
        dragMode = "mouse";
        input.focus({ preventScroll: true });
        setFromClientX(event.clientX);
        event.preventDefault();
      }, { passive: false });
      add(window, "mousemove", (event) => {
        if (dragMode !== "mouse") return;
        setFromClientX(event.clientX);
        event.preventDefault();
      }, { passive: false });
      add(window, "mouseup", (event) => {
        if (dragMode !== "mouse" || event.button !== 0) return;
        setFromClientX(event.clientX);
        dragMode = null;
        event.preventDefault();
      }, { passive: false });
      add(input, "pointerdown", (event) => {
        if (event.pointerType === "mouse" || input.disabled) return;
        dragMode = "pointer";
        pointerId = event.pointerId;
        input.focus({ preventScroll: true });
        setFromClientX(event.clientX);
        event.preventDefault();
      }, { passive: false });
      add(window, "pointermove", (event) => {
        if (dragMode !== "pointer" || pointerId !== event.pointerId) return;
        setFromClientX(event.clientX);
        event.preventDefault();
      }, { passive: false });
      const finishPointer = (event) => {
        if (dragMode !== "pointer" || pointerId !== event.pointerId) return;
        setFromClientX(event.clientX);
        dragMode = null;
        pointerId = null;
        event.preventDefault();
      };
      add(window, "pointerup", finishPointer, { passive: false });
      add(window, "pointercancel", finishPointer, { passive: false });
    });
    return () => cleanups.splice(0).forEach((cleanup) => cleanup());
  }

  function conclusion({ tone = "neutral", title, text, formula = "", facts = [] }) {
    const label = tone === "pass" ? "结论成立" : tone === "fail" ? "出现反例" : tone === "warn" ? "观察边界" : "当前结论";
    return `
      <div class="ch7-conclusion is-${tone}">
        <div class="ch7-conclusion-copy"><span>${label}</span><strong>${title}</strong><p>${text}</p></div>
        ${formula ? `<div class="ch7-conclusion-formula">${display(formula)}</div>` : ""}
        ${facts.length ? `<dl>${facts.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join("")}</dl>` : ""}
      </div>`;
  }

  function arrowPath(x1, y1, x2, y2, className = "") {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const px = -uy;
    const py = ux;
    const shaft = Math.min(2.4, Math.max(1.4, length / 130));
    const headLength = Math.min(16, Math.max(11, length * 0.15));
    const headWidth = Math.min(7.5, Math.max(5.5, length * 0.065));
    const neckX = x2 - ux * headLength;
    const neckY = y2 - uy * headLength;
    const point = (x, y) => `${x.toFixed(2)} ${y.toFixed(2)}`;
    return `<path class="ch7-vector ${className}" d="M ${point(x1 + px * shaft, y1 + py * shaft)} L ${point(neckX + px * shaft, neckY + py * shaft)} L ${point(neckX + px * headWidth, neckY + py * headWidth)} L ${point(x2, y2)} L ${point(neckX - px * headWidth, neckY - py * headWidth)} L ${point(neckX - px * shaft, neckY - py * shaft)} L ${point(x1 - px * shaft, y1 - py * shaft)} Z"></path>`;
  }

  function createPlane({ x = 0, y = 0, width = 800, height = 500, extent = 3 } = {}) {
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
        lines.push(`<line x1="${gx}" y1="${y}" x2="${gx}" y2="${y + height}" class="ch7-grid ${extraClass}"/>`);
        lines.push(`<line x1="${x}" y1="${gy}" x2="${x + width}" y2="${gy}" class="ch7-grid ${extraClass}"/>`);
      }
      return lines.join("");
    };
    const axes = () => `<line x1="${x}" y1="${cy}" x2="${x + width}" y2="${cy}" class="ch7-axis"/><line x1="${cx}" y1="${y}" x2="${cx}" y2="${y + height}" class="ch7-axis"/>`;
    const vector = (to, role = "primary", label = "", from = [0, 0], extraClass = "") => {
      const [x1, y1] = p(from);
      const [x2, y2] = p(to);
      return `${arrowPath(x1, y1, x2, y2, `is-${role} ${extraClass}`)}${label ? `<text x="${x2 + 9}" y="${y2 - 9}" class="ch7-svg-label is-${role}">${label}</text>` : ""}`;
    };
    const line = (direction, role = "primary", length = extent * 1.45, extraClass = "") => {
      const unit = normalize(direction);
      const a = p(scale(-length, unit));
      const b = p(scale(length, unit));
      return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ch7-line is-${role} ${extraClass}"/>`;
    };
    const point = (at, role = "primary", radius = 5, label = "", extraClass = "") => {
      const [px, py] = p(at);
      return `<circle cx="${px}" cy="${py}" r="${radius}" class="ch7-point is-${role} ${extraClass}"/>${label ? `<text x="${px + 9}" y="${py - 9}" class="ch7-svg-label is-${role}">${label}</text>` : ""}`;
    };
    const cross = (at, role = "primary", size = 6, label = "") => {
      const [px, py] = p(at);
      return `<path d="M${px - size} ${py - size}L${px + size} ${py + size}M${px + size} ${py - size}L${px - size} ${py + size}" class="ch7-cross is-${role}"/>${label ? `<text x="${px + 10}" y="${py - 10}" class="ch7-svg-label is-${role}">${label}</text>` : ""}`;
    };
    const hitLine = (to, key, from = [0, 0]) => {
      const a = p(from);
      const b = p(to);
      return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ch7-drag-line" data-drag="${key}"/>`;
    };
    return { x, y, width, height, cx, cy, sx, sy, extent, p, v, grid, axes, vector, line, point, cross, hitLine };
  }

  function transformedGrid(plane, matrix, options = {}) {
    const extent = options.extent ?? plane.extent;
    const step = options.step ?? 0.5;
    const role = options.role || "secondary";
    const className = options.className || "";
    const paths = [];
    for (let fixed = -extent; fixed <= extent + EPS; fixed += step) {
      const vertical = [];
      const horizontal = [];
      for (let index = 0; index <= 36; index += 1) {
        const t = -extent + (2 * extent * index) / 36;
        vertical.push(plane.p(matVec(matrix, [fixed, t])));
        horizontal.push(plane.p(matVec(matrix, [t, fixed])));
      }
      const path = (points) => points.map((point, index) => `${index ? "L" : "M"}${point[0].toFixed(2)} ${point[1].toFixed(2)}`).join(" ");
      paths.push(`<path d="${path(vertical)}" class="ch7-warp-grid is-${role} ${className}"/>`);
      paths.push(`<path d="${path(horizontal)}" class="ch7-warp-grid is-${role} ${className}"/>`);
    }
    return paths.join("");
  }

  function svg(content, { width = 960, height = 560, label = "线性代数几何实验", className = "" } = {}) {
    return `<svg class="ch7-svg ${className}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">${content}</svg>`;
  }

  function bindDrag(binder, stage, selector, onMove) {
    let kind = null;
    let pointerId = null;
    const move = (event) => onMove(event.clientX, event.clientY, event);
    binder.on(stage, "mousedown", (event) => {
      if (event.button !== 0 || !event.target.closest(selector)) return;
      kind = "mouse";
      move(event);
      event.preventDefault();
    }, { passive: false });
    binder.on(window, "mousemove", (event) => {
      if (kind !== "mouse") return;
      move(event);
      event.preventDefault();
    }, { passive: false });
    binder.on(window, "mouseup", (event) => {
      if (kind !== "mouse" || event.button !== 0) return;
      move(event);
      kind = null;
      event.preventDefault();
    }, { passive: false });
    binder.on(stage, "pointerdown", (event) => {
      if (event.pointerType === "mouse" || !event.target.closest(selector)) return;
      kind = "pointer";
      pointerId = event.pointerId;
      move(event);
      event.preventDefault();
    }, { passive: false });
    binder.on(window, "pointermove", (event) => {
      if (kind !== "pointer" || pointerId !== event.pointerId) return;
      move(event);
      event.preventDefault();
    }, { passive: false });
    const finish = (event) => {
      if (kind !== "pointer" || pointerId !== event.pointerId) return;
      move(event);
      kind = null;
      pointerId = null;
      event.preventDefault();
    };
    binder.on(window, "pointerup", finish, { passive: false });
    binder.on(window, "pointercancel", finish, { passive: false });
  }

  window.Ch7Story = {
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
    createLab,
    buttonGroup,
    setActive,
    mountRanges,
    conclusion,
    arrowPath,
    createPlane,
    transformedGrid,
    svg,
    bindDrag,
    register(id, interactive, formal = formalRenderer) {
      window.defineChapter7Renderer?.(id, { formal, interactive });
    },
  };
})();
