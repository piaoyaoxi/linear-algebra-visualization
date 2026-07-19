(() => {
  const EPS = Object.freeze({ zero: 1e-8, visual: 1e-5, rank: 1e-7, symplectic: 1e-7 });
  const q = (root, selector) => root?.querySelector(selector) || null;
  const qa = (root, selector) => [...(root?.querySelectorAll(selector) || [])];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const format = (value, digits = 2) => {
    const rounded = Math.round((Number(value) || 0) * 10 ** digits) / 10 ** digits;
    return String(Object.is(rounded, -0) ? 0 : rounded);
  };
  const nearZero = (value, epsilon = EPS.zero) => Math.abs(value) <= epsilon;
  const add = (u, v) => [u[0] + v[0], u[1] + v[1]];
  const scale = (scalar, vector) => [scalar * vector[0], scalar * vector[1]];
  const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
  const determinant = (matrix) => matrix[0] * matrix[3] - matrix[1] * matrix[2];
  const multiplyMatrixVector = (matrix, vector) => [
    matrix[0] * vector[0] + matrix[1] * vector[1],
    matrix[2] * vector[0] + matrix[3] * vector[1],
  ];
  const transpose2 = (matrix) => [matrix[0], matrix[2], matrix[1], matrix[3]];
  const multiply2 = (left, right) => [
    left[0] * right[0] + left[1] * right[2],
    left[0] * right[1] + left[1] * right[3],
    left[2] * right[0] + left[3] * right[2],
    left[2] * right[1] + left[3] * right[3],
  ];
  const inverse2 = (matrix) => {
    const det = determinant(matrix);
    if (nearZero(det)) return null;
    return [matrix[3] / det, -matrix[1] / det, -matrix[2] / det, matrix[0] / det];
  };
  const matrixDifferenceNorm = (left, right) => Math.sqrt(
    left.reduce((sum, value, index) => sum + (value - right[index]) ** 2, 0),
  );

  const mathInline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const mathDisplay = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);

  const stage = Object.freeze({ size: 100, origin: 50, reach: 42, range: 4 });
  const toSvgPoint = (vector, range = stage.range) => [
    stage.origin + (vector[0] / range) * stage.reach,
    stage.origin - (vector[1] / range) * stage.reach,
  ];
  const fromPointer = (svg, event, range = stage.range) => {
    const rect = svg.getBoundingClientRect();
    return [
      clamp((((event.clientX - rect.left) / rect.width) * stage.size - stage.origin) / stage.reach * range, -range, range),
      clamp((stage.origin - ((event.clientY - rect.top) / rect.height) * stage.size) / stage.reach * range, -range, range),
    ];
  };
  const gridPaths = (range = stage.range) => {
    let paths = "";
    for (let value = -range; value <= range; value += 1) {
      const position = stage.origin + (value / range) * stage.reach;
      const className = value === 0 ? "axis" : "grid";
      paths += `<path class="${className}" d="M8 ${position}H92 M${position} 8V92"></path>`;
    }
    return paths;
  };
  const markerDefs = `
    <defs>
      <marker id="ch10-arrow-x" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8Z"></path></marker>
      <marker id="ch10-arrow-y" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8Z"></path></marker>
      <marker id="ch10-arrow-measure" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8Z"></path></marker>
    </defs>`;
  const vectorSvg = (vector, label, role = "x", options = {}) => {
    const range = options.range ?? stage.range;
    const [x, y] = toSvgPoint(vector, range);
    const origin = toSvgPoint([0, 0], range);
    const interactive = options.handleRadius !== 0;
    const handleRadius = options.handleRadius ?? 2.5;
    const handle = interactive
      ? `<circle class="ch10-vector-handle is-${role}" cx="${x}" cy="${y}" r="${handleRadius}" data-vector-handle="${role}" tabindex="0" role="slider" aria-label="${options.ariaLabel || label}"></circle>`
      : "";
    return `
      <line class="ch10-vector is-${role}" x1="${origin[0]}" y1="${origin[1]}" x2="${x}" y2="${y}" marker-end="url(#ch10-arrow-${role})"></line>
      ${handle}
      <text class="ch10-vector-label is-${role}" x="${x + 2.4}" y="${y - 2.2}">${label}</text>`;
  };
  const lineClip = (a, b, c, range = stage.range) => {
    const points = [];
    const addPoint = (x, y) => {
      if (x >= -range - EPS.visual && x <= range + EPS.visual && y >= -range - EPS.visual && y <= range + EPS.visual) {
        if (!points.some((point) => Math.hypot(point[0] - x, point[1] - y) < EPS.visual)) points.push([x, y]);
      }
    };
    if (!nearZero(b)) {
      addPoint(-range, (c + a * range) / b);
      addPoint(range, (c - a * range) / b);
    }
    if (!nearZero(a)) {
      addPoint((c + b * range) / a, -range);
      addPoint((c - b * range) / a, range);
    }
    if (points.length < 2) return null;
    return [toSvgPoint(points[0], range), toSvgPoint(points[1], range)];
  };
  const implicitLineSvg = (a, b, c, className, label = "") => {
    const endpoints = lineClip(a, b, c);
    if (!endpoints) return "";
    const middle = [
      (endpoints[0][0] + endpoints[1][0]) / 2,
      (endpoints[0][1] + endpoints[1][1]) / 2,
    ];
    return `<line class="${className}" x1="${endpoints[0][0]}" y1="${endpoints[0][1]}" x2="${endpoints[1][0]}" y2="${endpoints[1][1]}"></line>${label ? `<text class="ch10-line-label" x="${middle[0] + 2}" y="${middle[1] - 2}">${label}</text>` : ""}`;
  };

  function renderModuleHeading(number, title, text, id) {
    return `
      <div class="ch10-module-heading">
        <span>${number}</span>
        <div><h3${id ? ` id="${id}"` : ""}>${title}</h3>${text ? `<p>${text}</p>` : ""}</div>
      </div>`;
  }

  function renderObservationHeader(interactive) {
    return `
      <div class="ch10-observation-head">
        <span>观察任务</span>
        <div><strong>${interactive.question}</strong><p>${interactive.instruction}</p></div>
      </div>`;
  }

  function renderTaskList(tasks) {
    return `<ol class="ch10-task-list">${tasks.map((task) => `<li>${task}</li>`).join("")}</ol>`;
  }

  function renderExample(section) {
    const example = section.example;
    if (!example) return "";
    return `
      <section class="section-band lesson-page-section" id="${section.id}-example">
        <h2>代表例题</h2>
        <article class="ch10-example" data-ch10-example>
          <header><span>例题</span><h3>${example.title}</h3></header>
          <div class="ch10-example-question">${example.question}</div>
          <div class="ch10-example-workspace">
            <button type="button" class="button ch10-example-start" data-example-start>开始分步解析</button>
            <div class="ch10-example-steps" data-example-steps aria-live="polite"></div>
            <div class="ch10-example-actions" hidden data-example-actions>
              <button type="button" class="button" data-example-previous>上一步</button>
              <span data-example-progress></span>
              <button type="button" class="button primary" data-example-next>下一步</button>
            </div>
          </div>
        </article>
      </section>`;
  }

  function bindExample(root, example) {
    const panel = q(root, "[data-ch10-example]");
    if (!panel || !example?.steps?.length) return;
    const stepsNode = q(panel, "[data-example-steps]");
    const actions = q(panel, "[data-example-actions]");
    const start = q(panel, "[data-example-start]");
    const previous = q(panel, "[data-example-previous]");
    const next = q(panel, "[data-example-next]");
    const progress = q(panel, "[data-example-progress]");
    let index = -1;

    const update = () => {
      const visible = example.steps.slice(0, index + 1);
      stepsNode.innerHTML = visible
        .map((step, stepIndex) => `<article class="ch10-example-step${stepIndex === index ? " is-current" : ""}"><span>${String(stepIndex + 1).padStart(2, "0")}</span><div><strong>${step.title}</strong><p>${step.text}</p></div></article>`)
        .join("");
      actions.hidden = index < 0;
      start.hidden = index >= 0;
      previous.disabled = index <= 0;
      next.textContent = index >= example.steps.length - 1 ? "重新查看" : "下一步";
      progress.textContent = index < 0 ? "" : `${index + 1} / ${example.steps.length}`;
    };

    start.addEventListener("click", () => { index = 0; update(); });
    previous.addEventListener("click", () => { index = Math.max(0, index - 1); update(); });
    next.addEventListener("click", () => {
      index = index >= example.steps.length - 1 ? 0 : index + 1;
      update();
    });
    update();
  }

  function bindRangeOutputs(root) {
    qa(root, "input[type=range]").forEach((input) => {
      const output = q(root, `[data-output-for="${input.id}"]`);
      const update = () => { if (output) output.value = format(input.value); };
      input.addEventListener("input", update);
      update();
    });
  }

  function bindSvgDrag(svg, role, getVector, setVector, options = {}) {
    const handleSelector = `[data-vector-handle="${role}"]`;
    let dragging = false;

    svg.addEventListener("pointerdown", (event) => {
      const handle = event.target.closest(handleSelector);
      if (!handle) return;
      dragging = true;
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    svg.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      setVector(fromPointer(svg, event, options.range || stage.range));
    });
    svg.addEventListener("pointerup", () => { dragging = false; });
    svg.addEventListener("pointercancel", () => { dragging = false; });
    svg.addEventListener("keydown", (event) => {
      const handle = event.target.closest(handleSelector);
      if (!handle) return;
      const step = event.shiftKey ? 0.5 : 0.1;
      const vector = getVector();
      if (event.key === "ArrowLeft") vector[0] -= step;
      else if (event.key === "ArrowRight") vector[0] += step;
      else if (event.key === "ArrowDown") vector[1] -= step;
      else if (event.key === "ArrowUp") vector[1] += step;
      else return;
      event.preventDefault();
      setVector(vector.map((value) => clamp(value, -(options.range || stage.range), options.range || stage.range)));
    });
  }

  function animateNumbers(from, to, onFrame, duration = 320) {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduced || duration <= 0) {
      onFrame([...to], 1);
      return () => {};
    }
    let frameId = 0;
    let cancelled = false;
    const startedAt = performance.now();
    const tick = (now) => {
      if (cancelled) return;
      const raw = clamp((now - startedAt) / duration, 0, 1);
      const eased = 1 - (1 - raw) ** 3;
      onFrame(from.map((value, index) => value + (to[index] - value) * eased), raw);
      if (raw < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (frameId) cancelAnimationFrame(frameId);
    };
  }

  window.chapter10UI = Object.freeze({
    EPS,
    q,
    qa,
    clamp,
    format,
    nearZero,
    add,
    scale,
    dot,
    determinant,
    multiplyMatrixVector,
    transpose2,
    multiply2,
    inverse2,
    matrixDifferenceNorm,
    mathInline,
    mathDisplay,
    stage,
    toSvgPoint,
    fromPointer,
    gridPaths,
    markerDefs,
    vectorSvg,
    lineClip,
    implicitLineSvg,
    renderModuleHeading,
    renderObservationHeader,
    renderTaskList,
    renderExample,
    bindExample,
    bindRangeOutputs,
    bindSvgDrag,
    animateNumbers,
  });
})();
