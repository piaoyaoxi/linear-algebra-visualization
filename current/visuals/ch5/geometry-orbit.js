/* Chapter 5 orbit-camera enhancement. Loaded after geometry-upgrade.js. */
(() => {
  const M = () => window.Ch5Math;
  const inline = (source) => (window.texInline ? window.texInline(source) : source);
  const $ = (root, selector) => root.querySelector(selector);
  const $$ = (root, selector) => [...root.querySelectorAll(selector)];
  const TAU = Math.PI * 2;
  const HOME = Object.freeze({ yaw: -0.72, pitch: 0.46 });

  const matrixFrom = (root, selector) => {
    const cells = $$(root, `${selector} .ch5-cell`).map((cell) => Number(cell.textContent));
    if (cells.length !== 4 || cells.some((value) => !Number.isFinite(value))) return null;
    return [[cells[0], cells[1]], [cells[2], cells[3]]];
  };

  const vectorFromText = (text) => {
    const values = String(text || "").match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    return values.length >= 2 ? values.slice(0, 2) : null;
  };

  function projectUnit(x, y, z, camera) {
    const cy = Math.cos(camera.yaw);
    const sy = Math.sin(camera.yaw);
    const cp = Math.cos(camera.pitch);
    const sp = Math.sin(camera.pitch);
    const u = cy * x - sy * y;
    const rotatedY = sy * x + cy * y;
    return { u, v: cp * rotatedY + sp * z, depth: sp * rotatedY - cp * z };
  }

  function sampleMatrix(A, half, camera, point) {
    const points = [];
    for (let i = 0; i <= 12; i += 1) {
      for (let j = 0; j <= 12; j += 1) {
        const x = -half + (2 * half * i) / 12;
        const y = -half + (2 * half * j) / 12;
        points.push(projectUnit(x, y, M().qForm(A, [x, y]), camera));
      }
    }
    const axis = half * 1.08;
    points.push(projectUnit(axis, 0, 0, camera));
    points.push(projectUnit(-axis, 0, 0, camera));
    points.push(projectUnit(0, axis, 0, camera));
    points.push(projectUnit(0, -axis, 0, camera));
    const largest = Math.max(1, ...M().eigenvalues2(A).map((value) => Math.abs(value)));
    points.push(projectUnit(0, 0, largest * half * half * 0.68, camera));
    points.push(projectUnit(0, 0, -largest * half * half * 0.42, camera));
    if (point) {
      points.push(projectUnit(point[0], point[1], 0, camera));
      points.push(projectUnit(point[0], point[1], M().qForm(A, point), camera));
    }
    return points;
  }

  function frameFor(matrices, width, height, camera, options = {}) {
    const half = options.half || 1.65;
    const samples = [];
    matrices.forEach((A, index) => samples.push(...sampleMatrix(A, half, camera, index === 0 ? options.point : null)));
    let minU = Infinity;
    let maxU = -Infinity;
    let minV = Infinity;
    let maxV = -Infinity;
    samples.forEach(({ u, v }) => {
      minU = Math.min(minU, u);
      maxU = Math.max(maxU, u);
      minV = Math.min(minV, v);
      maxV = Math.max(maxV, v);
    });
    const pad = { left: 28, right: 28, top: 56, bottom: 34, ...options.padding };
    const availableWidth = Math.max(40, width - pad.left - pad.right);
    const availableHeight = Math.max(40, height - pad.top - pad.bottom);
    const spanU = Math.max(0.001, maxU - minU);
    const spanV = Math.max(0.001, maxV - minV);
    const scale = Math.min(availableWidth / spanU, availableHeight / spanV) * 0.92;
    const centerU = (minU + maxU) / 2;
    const centerV = (minV + maxV) / 2;
    const centerX = pad.left + availableWidth / 2;
    const centerY = pad.top + availableHeight / 2;
    return {
      half,
      project(x, y, z) {
        const p = projectUnit(x, y, z, camera);
        return {
          x: centerX + (p.u - centerU) * scale,
          y: centerY - (p.v - centerV) * scale,
          depth: p.depth,
        };
      },
    };
  }

  function arrow(ctx, start, end, color) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - ux * 8 - uy * 4.4, end.y - uy * 8 + ux * 4.4);
    ctx.lineTo(end.x - ux * 8 + uy * 4.4, end.y - uy * 8 - ux * 4.4);
    ctx.closePath();
    ctx.fill();
  }

  function curve(ctx, points, color, width, alpha) {
    if (!points.length) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.stroke();
    ctx.restore();
  }

  function principalDirections(A) {
    const a = A[0][0];
    const b = A[0][1];
    const c = A[1][1];
    const angle = 0.5 * Math.atan2(2 * b, a - c);
    return [[Math.cos(angle), Math.sin(angle)], [-Math.sin(angle), Math.cos(angle)]];
  }

  function drawSurface(canvas, A, camera, options = {}) {
    const { ctx, width, height } = M().setupCanvas(canvas);
    if (!ctx) return;
    const palette = M().getPalette();
    const supplied = options.frameMatrices || [];
    const matrices = [A, ...supplied.filter((matrix) => matrix !== A)];
    const half = options.half || 1.65;
    const frame = frameFor(matrices, width, height, camera, {
      half,
      point: options.point,
      padding: options.padding,
    });
    canvas.dataset.cameraYaw = String(camera.yaw);
    canvas.dataset.cameraPitch = String(camera.pitch);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, palette.soft);
    gradient.addColorStop(1, palette.surface);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    for (let fixed = -1.5; fixed <= 1.5; fixed += 0.5) {
      const row = [];
      const column = [];
      for (let step = 0; step <= 40; step += 1) {
        const t = -half + (2 * half * step) / 40;
        row.push(frame.project(t, fixed, 0));
        column.push(frame.project(fixed, t, 0));
      }
      curve(ctx, row, palette.line, 1, 0.22);
      curve(ctx, column, palette.line, 1, 0.22);
    }

    const resolution = width < 560 ? 24 : 32;
    const quads = [];
    for (let i = 0; i < resolution; i += 1) {
      for (let j = 0; j < resolution; j += 1) {
        const x0 = -half + (2 * half * i) / resolution;
        const x1 = -half + (2 * half * (i + 1)) / resolution;
        const y0 = -half + (2 * half * j) / resolution;
        const y1 = -half + (2 * half * (j + 1)) / resolution;
        const world = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
        const points = world.map(([x, y]) => frame.project(x, y, M().qForm(A, [x, y])));
        quads.push({
          points,
          value: world.reduce((sum, [x, y]) => sum + M().qForm(A, [x, y]), 0) / 4,
          depth: points.reduce((sum, point) => sum + point.depth, 0) / 4,
        });
      }
    }
    quads.sort((left, right) => left.depth - right.depth).forEach((quad) => {
      ctx.beginPath();
      quad.points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
      ctx.closePath();
      ctx.fillStyle = quad.value >= 0 ? palette.pos : palette.neg;
      ctx.globalAlpha = quad.value >= 0 ? 0.14 : 0.16;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    const wireCount = width < 560 ? 9 : 12;
    for (let index = 0; index <= wireCount; index += 1) {
      const fixed = -half + (2 * half * index) / wireCount;
      const row = [];
      const column = [];
      for (let step = 0; step <= 72; step += 1) {
        const t = -half + (2 * half * step) / 72;
        row.push(frame.project(t, fixed, M().qForm(A, [t, fixed])));
        column.push(frame.project(fixed, t, M().qForm(A, [fixed, t])));
      }
      curve(ctx, row, palette.pos, 0.9, 0.34);
      curve(ctx, column, palette.pos, 0.9, 0.34);
    }

    principalDirections(A).forEach((direction, index) => {
      const points = [];
      for (let step = -48; step <= 48; step += 1) {
        const t = (half * step) / 48;
        const x = direction[0] * t;
        const y = direction[1] * t;
        points.push(frame.project(x, y, M().qForm(A, [x, y])));
      }
      curve(ctx, points, index ? palette.coral : palette.accentStrong, 3, 0.95);
    });

    const origin = frame.project(0, 0, 0);
    const axis = half * 1.08;
    const xAxis = frame.project(axis, 0, 0);
    const yAxis = frame.project(0, axis, 0);
    const largest = Math.max(1, ...M().eigenvalues2(A).map((value) => Math.abs(value)));
    const zAxis = frame.project(0, 0, largest * half * half * 0.62);
    arrow(ctx, origin, xAxis, palette.text);
    arrow(ctx, origin, yAxis, palette.text);
    arrow(ctx, origin, zAxis, palette.text);
    ctx.fillStyle = palette.muted;
    ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("x₁", xAxis.x + 5, xAxis.y + 2);
    ctx.fillText("x₂", yAxis.x - 18, yAxis.y + 2);
    ctx.fillText("q", zAxis.x + 6, zAxis.y + 2);

    if (options.point) {
      const floor = frame.project(options.point[0], options.point[1], 0);
      const onSurface = frame.project(options.point[0], options.point[1], M().qForm(A, options.point));
      ctx.strokeStyle = palette.coral;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(floor.x, floor.y);
      ctx.lineTo(onSurface.x, onSurface.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = palette.coral;
      ctx.beginPath();
      ctx.arc(onSurface.x, onSurface.y, 5.5, 0, TAU);
      ctx.fill();
    }
  }

  function wrapCanvas(canvas, titleHtml) {
    if (!canvas || canvas.parentElement?.classList.contains("qv-orbit-shell")) return canvas?.parentElement;
    const shell = document.createElement("div");
    shell.className = "qv-orbit-shell";
    canvas.before(shell);
    shell.append(canvas);
    const title = document.createElement("div");
    title.className = "qv-orbit-title";
    title.innerHTML = titleHtml;
    const hint = document.createElement("div");
    hint.className = "qv-orbit-hint";
    hint.textContent = "拖动旋转 · 双击复位";
    shell.append(title, hint);
    return shell;
  }

  function addViewTools(reference, reset, linked) {
    if (!reference || reference.previousElementSibling?.classList.contains("qv-orbit-tools")) return;
    const tools = document.createElement("div");
    tools.className = "qv-orbit-tools";
    tools.innerHTML = `<span>${linked ? "拖动任一曲面，左右视角同步" : "在曲面的空白区域拖动，可从不同方向观察"}</span><button type="button">复位视角</button>`;
    tools.querySelector("button").addEventListener("click", reset);
    reference.before(tools);
  }

  function bindOrbit(canvases, camera, redraw, controller) {
    const drag = { active: false, id: null, x: 0, y: 0, yaw: 0, pitch: 0 };
    const reset = () => {
      camera.yaw = HOME.yaw;
      camera.pitch = HOME.pitch;
      redraw();
    };
    canvases.forEach((canvas) => {
      canvas.tabIndex = 0;
      canvas.setAttribute("role", "application");
      canvas.setAttribute("aria-label", "可拖动旋转的三维二次型曲面；方向键也可调整视角，Home 键复位");
      canvas.addEventListener("pointerdown", (event) => {
        drag.active = true;
        drag.id = event.pointerId;
        drag.x = event.clientX;
        drag.y = event.clientY;
        drag.yaw = camera.yaw;
        drag.pitch = camera.pitch;
        canvas.setPointerCapture?.(event.pointerId);
        canvas.classList.add("is-dragging");
        event.preventDefault();
      }, { signal: controller.signal });
      canvas.addEventListener("pointermove", (event) => {
        if (!drag.active || event.pointerId !== drag.id) return;
        camera.yaw = drag.yaw + (event.clientX - drag.x) * 0.007;
        camera.pitch = M().clamp(drag.pitch - (event.clientY - drag.y) * 0.006, 0.18, 1.18);
        redraw();
        event.preventDefault();
      }, { signal: controller.signal });
      const finish = (event) => {
        if (event.pointerId !== drag.id) return;
        drag.active = false;
        drag.id = null;
        canvas.classList.remove("is-dragging");
      };
      canvas.addEventListener("pointerup", finish, { signal: controller.signal });
      canvas.addEventListener("pointercancel", finish, { signal: controller.signal });
      canvas.addEventListener("dblclick", reset, { signal: controller.signal });
      canvas.addEventListener("keydown", (event) => {
        const step = event.shiftKey ? 0.12 : 0.06;
        if (event.key === "ArrowLeft") camera.yaw -= step;
        else if (event.key === "ArrowRight") camera.yaw += step;
        else if (event.key === "ArrowUp") camera.pitch = M().clamp(camera.pitch - step, 0.18, 1.18);
        else if (event.key === "ArrowDown") camera.pitch = M().clamp(camera.pitch + step, 0.18, 1.18);
        else if (event.key === "Home") reset();
        else return;
        redraw();
        event.preventDefault();
      }, { signal: controller.signal });
    });
    return reset;
  }

  function replaceLabel(span, formula) {
    if (!span) return;
    const value = span.querySelector("strong");
    span.innerHTML = inline(formula);
    if (value) span.append(value);
  }

  function enhanceSection(section, root) {
    const controller = new AbortController();
    const camera = { ...HOME };
    let redraw = () => {};
    let canvases = [];

    if (section.id === "quadratic-matrix") {
      const left = $(root, "[data-s1-a-canvas]");
      const right = $(root, "[data-s1-b-canvas]");
      canvases = [left, right];
      wrapCanvas(left, `${inline("A")} · 原坐标`);
      wrapCanvas(right, `${inline("B=C^TAC")} · 新坐标`);
      const pair = $(root, ".qv-same");
      redraw = () => {
        const A = [[2, 0.8], [0.8, 1.4]];
        const B = matrixFrom(root, "[data-s1-b]") || A;
        const x = vectorFromText($(root, "[data-s1-x]")?.textContent) || [1, 0];
        const active = $(root, "[data-s1-y].is-active")?.dataset.s1Y;
        const y = active === "e2" ? [0, 1] : active === "sum" ? [1, 1] : [1, 0];
        const half = Math.max(1.65, ...x.map((value) => Math.abs(value) * 1.12));
        drawSurface(left, A, camera, { point: x, half, frameMatrices: [A, B] });
        drawSurface(right, B, camera, { point: y, half, frameMatrices: [A, B] });
      };
      const reset = bindOrbit(canvases, camera, redraw, controller);
      addViewTools(pair, reset, true);
      const captions = $$(root, ".qv-same figcaption");
      if (captions[0]) captions[0].innerHTML = `先算 ${inline("x=Cy")}，再看 ${inline("x^TAx")}`;
      if (captions[1]) captions[1].innerHTML = `在 ${inline("y")} 坐标中直接看 ${inline("y^TBy")}`;
      const labels = $$(root, ".qv-values > span");
      replaceLabel(labels[0], "\\det C");
      replaceLabel(labels[1], "x=Cy");
      replaceLabel(labels[2], "x^TAx");
      replaceLabel(labels[3], "y^TBy");
    }

    if (section.id === "quadratic-standard-form") {
      const canvas = $(root, "[data-s2-canvas]");
      canvases = [canvas];
      const shell = wrapCanvas(canvas, "当前二次型");
      redraw = () => {
        const D = matrixFrom(root, "[data-s2-d]");
        if (!D) return;
        drawSurface(canvas, D, camera, { frameMatrices: [D] });
        const final = $(root, "[data-s2-status]")?.textContent.includes("完成");
        const title = shell?.querySelector(".qv-orbit-title");
        if (title) title.textContent = final ? "标准形 · 变量已解耦" : "当前二次型";
      };
      const reset = bindOrbit(canvases, camera, redraw, controller);
      addViewTools(shell, reset, false);
    }

    if (section.id === "quadratic-uniqueness") {
      const left = $(root, "[data-s3-a-canvas]");
      const right = $(root, "[data-s3-b-canvas]");
      canvases = [left, right];
      wrapCanvas(left, `${inline("A")} · 原曲面`);
      wrapCanvas(right, `${inline("B=C^TAC")} · 变换后`);
      const pair = $(root, ".qv-same");
      redraw = () => {
        const A = matrixFrom(root, "[data-s3-a]");
        const B = matrixFrom(root, "[data-s3-b]");
        if (!A || !B) return;
        drawSurface(left, A, camera, { frameMatrices: [A, B] });
        drawSurface(right, B, camera, { frameMatrices: [A, B] });
        const polyA = $(root, "[data-s3-poly-a]");
        const polyB = $(root, "[data-s3-poly-b]");
        if (polyA) polyA.innerHTML = inline(M().polyTex2(A));
        if (polyB) polyB.innerHTML = inline(M().polyTex2(B));
      };
      const reset = bindOrbit(canvases, camera, redraw, controller);
      addViewTools(pair, reset, true);
      const middle = $(root, ".qv-equals strong");
      if (middle) middle.innerHTML = inline("C^TAC");
    }

    if (section.id === "positive-definite") {
      const canvas = $(root, "[data-s4-surface]");
      canvases = [canvas];
      const hero = $(root, ".qv-hero");
      hero?.classList.add("qv-orbit-shell", "qv-orbit-hero");
      const oldCaption = hero?.querySelector(":scope > div");
      if (oldCaption) {
        oldCaption.classList.add("qv-orbit-caption");
        hero.after(oldCaption);
      }
      const title = document.createElement("div");
      title.className = "qv-orbit-title";
      title.innerHTML = `${inline("q_t")} · <span data-orbit-class>正定</span>`;
      const hint = document.createElement("div");
      hint.className = "qv-orbit-hint";
      hint.textContent = "拖动旋转 · 双击复位";
      hero?.append(title, hint);
      redraw = () => {
        const value = Number($(root, "[data-s4-t]")?.value || 0);
        const A = [[1, value], [value, 1]];
        drawSurface(canvas, A, camera, { frameMatrices: [A], padding: { top: 58, bottom: 42 } });
        const cls = M().classify2(A).label;
        const clsNode = $(root, "[data-orbit-class]");
        if (clsNode) clsNode.textContent = cls;
        const poly = $(root, "[data-s4-poly]");
        if (poly) poly.innerHTML = inline(M().polyTex2(A));
      };
      const reset = bindOrbit(canvases, camera, redraw, controller);
      addViewTools(hero, reset, false);
      const labels = $$(root, ".qv-three .qv-values > span");
      replaceLabel(labels[0], "\\lambda_1=1+t");
      replaceLabel(labels[1], "\\lambda_2=1-t");
      replaceLabel(labels[2], "\\Delta_1");
      replaceLabel(labels[3], "\\Delta_2=1-t^2");
      replaceLabel(labels[4], "\\min_{\\lVert x\\rVert=1}q_t(x)=1-|t|");
    }

    if (!canvases.length) return undefined;
    const schedule = () => requestAnimationFrame(redraw);
    root.addEventListener("click", schedule, { signal: controller.signal });
    root.addEventListener("input", schedule, { signal: controller.signal });
    window.addEventListener("resize", schedule, { signal: controller.signal, passive: true });
    redraw();
    return () => controller.abort();
  }

  window.defineChapter5LessonEnhancer?.((section, lessonRoot) => {
    if (!["quadratic-matrix", "quadratic-standard-form", "quadratic-uniqueness", "positive-definite"].includes(section?.id)) return undefined;
    const root = lessonRoot.querySelector(`#${CSS.escape(section.id)}-interactive`);
    return enhanceSection(section, root);
  });
})();
