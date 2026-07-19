/* Final fitted renderer for Chapter 5 orbit canvases. */
(() => {
  const M = () => window.Ch5Math;
  const $ = (root, selector) => root.querySelector(selector);
  const $$ = (root, selector) => [...root.querySelectorAll(selector)];
  const TAU = Math.PI * 2;
  const EPS = 1e-5;

  function matrixFrom(root, selector) {
    const values = $$(root, `${selector} .ch5-cell`).map((cell) => Number(cell.textContent));
    if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) return null;
    return [[values[0], values[1]], [values[2], values[3]]];
  }

  function vectorFromText(text) {
    const values = String(text || "").match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    return values.length >= 2 ? values.slice(0, 2) : null;
  }

  function cameraFrom(canvas) {
    return {
      yaw: Number(canvas.dataset.cameraYaw || -0.72),
      pitch: Number(canvas.dataset.cameraPitch || 0.46),
    };
  }

  function eigenDirections(A) {
    const angle = 0.5 * Math.atan2(2 * A[0][1], A[0][0] - A[1][1]);
    return [[Math.cos(angle), Math.sin(angle)], [-Math.sin(angle), Math.cos(angle)]];
  }

  function zScaleFor(matrices, half) {
    const maximum = Math.max(
      1,
      ...matrices.flatMap((A) => M().eigenvalues2(A).map((value) => Math.abs(value) * half * half)),
    );
    return 1.55 / maximum;
  }

  function rotate(x, y, z, camera, zScale) {
    const cy = Math.cos(camera.yaw);
    const sy = Math.sin(camera.yaw);
    const cp = Math.cos(camera.pitch);
    const sp = Math.sin(camera.pitch);
    const u = cy * x - sy * y;
    const rotatedY = sy * x + cy * y;
    const scaledZ = z * zScale;
    return {
      u,
      v: cp * rotatedY + sp * scaledZ,
      depth: sp * rotatedY - cp * scaledZ,
    };
  }

  function makeFrame(width, height, matrices, camera, options = {}) {
    const half = options.half || 1.65;
    const zScale = zScaleFor(matrices, half);
    const samples = [];
    const add = (x, y, z) => samples.push(rotate(x, y, z, camera, zScale));
    matrices.forEach((A) => {
      for (let i = 0; i <= 14; i += 1) {
        for (let j = 0; j <= 14; j += 1) {
          const x = -half + (2 * half * i) / 14;
          const y = -half + (2 * half * j) / 14;
          add(x, y, M().qForm(A, [x, y]));
        }
      }
    });
    const axis = half * 1.08;
    add(axis, 0, 0);
    add(-axis, 0, 0);
    add(0, axis, 0);
    add(0, -axis, 0);
    add(0, 0, 1.75 / zScale);
    add(0, 0, -1.2 / zScale);
    if (options.point) {
      add(options.point[0], options.point[1], 0);
      add(options.point[0], options.point[1], M().qForm(matrices[0], options.point));
    }

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
    const padding = { left: 30, right: 30, top: 58, bottom: 34, ...options.padding };
    const availableWidth = Math.max(60, width - padding.left - padding.right);
    const availableHeight = Math.max(60, height - padding.top - padding.bottom);
    const scale = Math.min(
      availableWidth / Math.max(0.001, maxU - minU),
      availableHeight / Math.max(0.001, maxV - minV),
    ) * 0.94;
    const centerU = (minU + maxU) / 2;
    const centerV = (minV + maxV) / 2;
    const centerX = padding.left + availableWidth / 2;
    const centerY = padding.top + availableHeight / 2;
    return {
      half,
      zScale,
      project(x, y, z) {
        const point = rotate(x, y, z, camera, zScale);
        return {
          x: centerX + (point.u - centerU) * scale,
          y: centerY - (point.v - centerV) * scale,
          depth: point.depth,
        };
      },
    };
  }

  function path(ctx, points, color, width = 1, alpha = 1) {
    if (points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.stroke();
    ctx.restore();
  }

  function signedPath(ctx, samples, palette, width = 1) {
    ctx.save();
    ctx.lineWidth = width;
    ctx.globalAlpha = 0.42;
    for (let index = 1; index < samples.length; index += 1) {
      const previous = samples[index - 1];
      const current = samples[index];
      const value = (previous.value + current.value) / 2;
      ctx.strokeStyle = value < -EPS ? palette.neg : value > EPS ? palette.pos : palette.coral;
      ctx.beginPath();
      ctx.moveTo(previous.point.x, previous.point.y);
      ctx.lineTo(current.point.x, current.point.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function arrow(ctx, start, end, color) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - ux * 8 - uy * 4.5, end.y - uy * 8 + ux * 4.5);
    ctx.lineTo(end.x - ux * 8 + uy * 4.5, end.y - uy * 8 - ux * 4.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawSurface(canvas, A, options = {}) {
    const { ctx, width, height } = M().setupCanvas(canvas);
    if (!ctx) return;
    const palette = M().getPalette();
    const camera = cameraFrom(canvas);
    const matrices = options.frameMatrices?.length ? options.frameMatrices : [A];
    const frame = makeFrame(width, height, matrices, camera, options);
    const half = frame.half;

    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, palette.soft);
    background.addColorStop(1, palette.surface);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    for (let fixed = -1.5; fixed <= 1.5; fixed += 0.5) {
      const row = [];
      const column = [];
      for (let step = 0; step <= 40; step += 1) {
        const t = -half + (2 * half * step) / 40;
        row.push(frame.project(t, fixed, 0));
        column.push(frame.project(fixed, t, 0));
      }
      path(ctx, row, palette.line, 1, 0.2);
      path(ctx, column, palette.line, 1, 0.2);
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
      ctx.fillStyle = quad.value < -EPS ? palette.neg : palette.pos;
      ctx.globalAlpha = quad.value < -EPS ? 0.17 : 0.13;
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
        const rowValue = M().qForm(A, [t, fixed]);
        const columnValue = M().qForm(A, [fixed, t]);
        row.push({ value: rowValue, point: frame.project(t, fixed, rowValue) });
        column.push({ value: columnValue, point: frame.project(fixed, t, columnValue) });
      }
      signedPath(ctx, row, palette, 0.95);
      signedPath(ctx, column, palette, 0.95);
    }

    eigenDirections(A).forEach((direction, index) => {
      const points = [];
      for (let step = -48; step <= 48; step += 1) {
        const t = (half * step) / 48;
        const x = direction[0] * t;
        const y = direction[1] * t;
        points.push(frame.project(x, y, M().qForm(A, [x, y])));
      }
      path(ctx, points, index ? palette.coral : palette.accentStrong, 3, 0.96);
    });

    const origin = frame.project(0, 0, 0);
    const axis = half * 1.08;
    const xAxis = frame.project(axis, 0, 0);
    const yAxis = frame.project(0, axis, 0);
    const zAxis = frame.project(0, 0, 1.72 / frame.zScale);
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
      const value = M().qForm(A, options.point);
      const onSurface = frame.project(options.point[0], options.point[1], value);
      ctx.save();
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
      ctx.restore();
    }
  }

  function drawDirectionWheel(canvas, A) {
    const { ctx, width, height } = M().setupCanvas(canvas);
    if (!ctx) return;
    const palette = M().getPalette();
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.31;
    const values = [];
    ctx.fillStyle = palette.soft;
    ctx.fillRect(0, 0, width, height);
    for (let index = 0; index < 240; index += 1) {
      const angle = (TAU * index) / 240;
      const value = M().qForm(A, [Math.cos(angle), Math.sin(angle)]);
      values.push(value);
      ctx.strokeStyle = value > EPS ? palette.pos : value < -EPS ? palette.neg : palette.coral;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, angle, angle + TAU / 240 + 0.015);
      ctx.stroke();
    }
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const state = minimum > EPS ? "全部 > 0" : minimum < -EPS ? "出现 < 0" : "接触 0";
    ctx.fillStyle = palette.text;
    ctx.font = "800 22px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(state, cx, cy - 2);
    ctx.fillStyle = palette.muted;
    ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(`min ${M().formatNum(minimum, 3)} · max ${M().formatNum(maximum, 3)}`, cx, cy + 22);
    ctx.textAlign = "left";
  }

  function ensureSection4Compatibility(root) {
    if ($(root, "[data-s4-region]")) return;
    const compatibility = document.createElement("div");
    compatibility.hidden = true;
    compatibility.setAttribute("data-s4-region", "");
    compatibility.innerHTML = '<b data-s4-marker></b>';
    root.append(compatibility);
  }

  function enhance(section, root) {
    if (!root) return undefined;
    const controller = new AbortController();
    let redraw = () => {};

    if (section.id === "quadratic-matrix") {
      const left = $(root, "[data-s1-a-canvas]");
      const right = $(root, "[data-s1-b-canvas]");
      redraw = () => {
        const A = [[2, 0.8], [0.8, 1.4]];
        const B = matrixFrom(root, "[data-s1-b]") || A;
        const x = vectorFromText($(root, "[data-s1-x]")?.textContent) || [1, 0];
        const active = $(root, "[data-s1-y].is-active")?.dataset.s1Y;
        const y = active === "e2" ? [0, 1] : active === "sum" ? [1, 1] : [1, 0];
        const half = Math.max(1.65, ...x.map((value) => Math.abs(value) * 1.12));
        drawSurface(left, A, { point: x, half, frameMatrices: [A, B] });
        drawSurface(right, B, { point: y, half, frameMatrices: [A, B] });
      };
    }

    if (section.id === "quadratic-standard-form") {
      const canvas = $(root, "[data-s2-canvas]");
      redraw = () => {
        const D = matrixFrom(root, "[data-s2-d]");
        if (D) drawSurface(canvas, D, { frameMatrices: [D] });
      };
    }

    if (section.id === "quadratic-uniqueness") {
      const left = $(root, "[data-s3-a-canvas]");
      const right = $(root, "[data-s3-b-canvas]");
      redraw = () => {
        const A = matrixFrom(root, "[data-s3-a]");
        const B = matrixFrom(root, "[data-s3-b]");
        if (!A || !B) return;
        drawSurface(left, A, { frameMatrices: [A, B] });
        drawSurface(right, B, { frameMatrices: [A, B] });
      };
    }

    if (section.id === "positive-definite") {
      ensureSection4Compatibility(root);
      const surface = $(root, "[data-s4-surface]");
      const wheel = $(root, "[data-s4-scan]");
      redraw = () => {
        const t = Number($(root, "[data-s4-t]")?.value || 0);
        const A = [[1, t], [t, 1]];
        drawSurface(surface, A, { frameMatrices: [A], padding: { top: 58, bottom: 42 } });
        drawDirectionWheel(wheel, A);
      };
    }

    const schedule = () => requestAnimationFrame(redraw);
    root.addEventListener("pointermove", schedule, { signal: controller.signal });
    root.addEventListener("click", schedule, { signal: controller.signal });
    root.addEventListener("input", schedule, { signal: controller.signal });
    window.addEventListener("resize", schedule, { signal: controller.signal, passive: true });
    schedule();
    return () => controller.abort();
  }

  window.defineChapter5LessonEnhancer?.((section, lessonRoot) => {
    if (!["quadratic-matrix", "quadratic-standard-form", "quadratic-uniqueness", "positive-definite"].includes(section?.id)) return undefined;
    return enhance(section, lessonRoot.querySelector(`#${CSS.escape(section.id)}-interactive`));
  });
})();