/*
 * Chapter 5 surfaces: the rotatable 3D view of q(x) = xᵀAx on every lab canvas.
 * geometry-upgrade.js builds the labs and their readouts; this file draws the surfaces
 * from the lab state (matrix cells and the test vector carry their numbers in data-v)
 * and owns the camera: drag, arrow keys, Home / double-click to reset.
 */
(() => {
  const M = () => window.Ch5Math;
  const inline = (source) => (window.texInline ? window.texInline(source) : source);
  const $ = (root, selector) => root.querySelector(selector);
  const $$ = (root, selector) => [...root.querySelectorAll(selector)];
  const TAU = Math.PI * 2;
  const EPS = 1e-5;
  const HOME = Object.freeze({ yaw: -0.72, pitch: 0.46 });
  // §4 looks across the direction x₁ = −x₂ (where q = 1 − |t| is lowest), so its flattening shows
  const HOME_S4 = Object.freeze({ yaw: 0.3, pitch: 0.56 });
  const SECTIONS = ["quadratic-matrix", "quadratic-standard-form", "quadratic-uniqueness", "positive-definite"];

  function matrixFrom(root, selector) {
    const values = $$(root, `${selector} .ch5-cell`).map((cell) => Number(cell.dataset.v));
    if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) return null;
    return [[values[0], values[1]], [values[2], values[3]]];
  }

  // geometry-upgrade.js keeps the vector in data-v; the visible text is for reading only
  function vectorFrom(el) {
    try {
      const values = JSON.parse(el?.dataset.v || "null");
      return Array.isArray(values) && values.length >= 2 && values.every(Number.isFinite) ? values.slice(0, 2) : null;
    } catch {
      return null;
    }
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

  /*
   * §4: the level curves q = c drawn on the floor z = 0 under the surface (what a view from straight
   * above shows), clipped to the floor square, q > 0 in the surface's positive colour and q < 0 in its
   * negative colour; the q = 0 lines are dashed. They are drawn before the translucent surface, so the
   * surface passes over them and meets the floor exactly on the dashed lines.
   */
  function drawFloorLevels(ctx, frame, A, palette, floor) {
    const half = frame.half;
    const reach = half * Math.SQRT2 * 1.1;
    const corners = [[-half, -half], [half, -half], [half, half], [-half, half]].map(([x, y]) => frame.project(x, y, 0));
    ctx.save();
    ctx.beginPath();
    corners.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.closePath();
    ctx.fillStyle = palette.line;
    ctx.globalAlpha = 0.07;
    ctx.fill();
    ctx.strokeStyle = palette.line;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.clip();
    const N = 720;
    (floor.levels || []).forEach((level) => {
      ctx.strokeStyle = level > 0 ? palette.pos : palette.neg;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      let down = false;
      for (let i = 0; i <= N; i += 1) {
        const angle = (TAU * i) / N;
        const ux = Math.cos(angle);
        const uy = Math.sin(angle);
        const q = M().qForm(A, [ux, uy]);
        if (q * level <= 0) { down = false; continue; }
        const r = Math.sqrt(level / q);
        if (r > reach) { down = false; continue; }
        const point = frame.project(r * ux, r * uy, 0);
        if (down) ctx.lineTo(point.x, point.y);
        else { ctx.moveTo(point.x, point.y); down = true; }
      }
      ctx.stroke();
    });
    ctx.strokeStyle = palette.zero;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 5]);
    (floor.zeroDirections || []).forEach(([dx, dy]) => {
      const a = frame.project(-dx * reach, -dy * reach, 0);
      const b = frame.project(dx * reach, dy * reach, 0);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawSurface(canvas, A, camera, options = {}) {
    const { ctx, width, height } = M().setupCanvas(canvas);
    if (!ctx) return;
    const palette = M().getPalette();
    // the browser checks read the view angle from here
    canvas.dataset.cameraYaw = String(camera.yaw);
    canvas.dataset.cameraPitch = String(camera.pitch);
    const matrices = options.frameMatrices?.length ? options.frameMatrices : [A];
    const frame = makeFrame(width, height, matrices, camera, options);
    const half = frame.half;

    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, palette.soft);
    background.addColorStop(1, palette.soft);
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

    if (options.floor) drawFloorLevels(ctx, frame, A, palette, options.floor);

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
      if (!options.signedAxes) {
        path(ctx, points, index ? palette.coral : palette.accentStrong, 3, 0.96);
        return;
      }
      // §3: a principal direction is coloured and named by the sign of q along it
      const lambda = M().qForm(A, direction);
      const color = lambda > EPS ? palette.pos : lambda < -EPS ? palette.neg : palette.zero;
      ctx.save();
      if (Math.abs(lambda) <= EPS) ctx.setLineDash([6, 5]);
      path(ctx, points, color, 3, 0.96);
      ctx.restore();
      const end = points[points.length - 1];
      arrow(ctx, points[points.length - 4], end, color);
      ctx.save();
      ctx.fillStyle = color;
      ctx.font = "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.fillText(lambda > EPS ? "向上" : lambda < -EPS ? "向下" : "平坦", end.x + 6, end.y + (lambda < -EPS ? 14 : -6));
      ctx.restore();
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
    ctx.font = "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
    const [n1, n2] = options.axisLabels || ["x₁", "x₂"];
    ctx.fillText(n1, xAxis.x + 5, xAxis.y + 2);
    ctx.fillText(n2, yAxis.x - 18, yAxis.y + 2);
    ctx.fillText("q", zAxis.x + 6, zAxis.y + 2);

    if (Number.isFinite(options.level) && options.point) {
      // the level z = h: one translucent horizontal plane over the whole square, the level curve
      // q = h where it cuts the surface, a dashed line to the q axis and a tick there; both views
      // share one frame, so the planes are the same height
      const h = options.level;
      const [px, py] = options.point;
      const corners = [[-half, -half], [half, -half], [half, half], [-half, half]].map(([x, y]) => frame.project(x, y, h));
      const image = getComputedStyle(document.body).getPropertyValue("--cv-image").trim() || "#8c4f86";
      const axisPoint = frame.project(0, 0, h);
      const top = frame.project(px, py, h);
      ctx.save();
      ctx.beginPath();
      corners.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
      ctx.closePath();
      ctx.fillStyle = image;
      ctx.globalAlpha = 0.1;
      ctx.fill();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = image;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // level curve: r·u with q(u)·r² = h, kept inside the square
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      let down = false;
      for (let i = 0; i <= 720; i += 1) {
        const angle = (TAU * i) / 720;
        const u = [Math.cos(angle), Math.sin(angle)];
        const q = M().qForm(A, u);
        const r = q * h > 0 ? Math.sqrt(h / q) : Infinity;
        const x = r * u[0];
        const y = r * u[1];
        if (!Number.isFinite(r) || Math.abs(x) > half || Math.abs(y) > half) { down = false; continue; }
        const point = frame.project(x, y, h);
        if (down) ctx.lineTo(point.x, point.y);
        else { ctx.moveTo(point.x, point.y); down = true; }
      }
      ctx.stroke();
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.85;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(axisPoint.x, axisPoint.y);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(axisPoint.x - 6, axisPoint.y);
      ctx.lineTo(axisPoint.x + 6, axisPoint.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = image;
      ctx.font = "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.textAlign = "right";
      ctx.fillText(M().formatNum(h, 4).replace(/^-/, "−"), axisPoint.x - 9, axisPoint.y + 4);
      ctx.restore();
    }

    if (options.point) {
      const floor = frame.project(options.point[0], options.point[1], 0);
      const value = M().qForm(A, options.point);
      const onSurface = frame.project(options.point[0], options.point[1], value);
      const image = getComputedStyle(document.body).getPropertyValue("--cv-image").trim() || "#8c4f86";
      ctx.save();
      // vertical height stem from the base point up to the surface, on a paper halo so it reads over the mesh
      ctx.lineCap = "round";
      ctx.strokeStyle = palette.soft;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(floor.x, floor.y);
      ctx.lineTo(onSurface.x, onSurface.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = image;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(floor.x, floor.y);
      ctx.lineTo(onSurface.x, onSurface.y);
      ctx.stroke();
      ctx.fillStyle = image;
      // the tip sits on the level plane: glow it
      if (Number.isFinite(options.level) && Math.abs(value - options.level) < 1e-6) {
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(onSurface.x, onSurface.y, 12, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.beginPath();
      ctx.arc(onSurface.x, onSurface.y, 5.5, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(floor.x, floor.y, 3.5, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.font = "italic 600 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      if (options.pointLabel) ctx.fillText(options.pointLabel, floor.x + 7, floor.y + 15);
      if (options.stemLabel) {
        const text = options.stemLabel;
        const tw = ctx.measureText(text).width;
        const lx = Math.max(8, Math.min(width - tw - 8, onSurface.x + 10));
        const ly = Math.max(70, (floor.y + onSurface.y) / 2);
        ctx.fillStyle = palette.soft;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(lx - 4, ly - 14, tw + 8, 19);
        ctx.globalAlpha = 1;
        ctx.fillStyle = image;
        ctx.fillText(text, lx, ly);
      }
      ctx.restore();
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

  function bindOrbit(canvases, camera, redraw, controller, home = HOME) {
    const drag = { active: false, id: null, x: 0, y: 0, yaw: 0, pitch: 0 };
    const reset = () => {
      camera.yaw = home.yaw;
      camera.pitch = home.pitch;
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
    const camera = { ...(section.id === "positive-definite" ? HOME_S4 : HOME) };
    let redraw = () => {};
    let canvases = [];
    let reference = null;
    let linked = false;
    let home = HOME;

    if (section.id === "quadratic-matrix") {
      const left = $(root, "[data-s1-a-canvas]");
      const right = $(root, "[data-s1-b-canvas]");
      canvases = [left, right];
      wrapCanvas(left, `${inline("A")} · 原坐标`);
      wrapCanvas(right, `${inline("B=C^TAC")} · 新坐标`);
      reference = $(root, ".qv-same");
      linked = true;
      redraw = () => {
        const A = [[2, 1], [1, 1]];
        const B = matrixFrom(root, "[data-s1-b]") || A;
        const x = vectorFrom($(root, "[data-s1-x]")) || [1, 0];
        const active = $(root, "[data-s1-y].is-active")?.dataset.s1Y;
        const y = active === "e2" ? [0, 1] : active === "sum" ? [1, 1] : [1, 0];
        const half = Math.max(1.65, ...x.map((value) => Math.abs(value) * 1.12));
        // after the prediction both views get the same level plane through the stem tops
        const open = Boolean(root.querySelector(".qv-lab[data-s1-open]"));
        const level = open ? M().qForm(A, x) : null;
        const shown = open ? M().formatNum(level, 4).replace(/^-/, "−") : "";
        drawSurface(left, A, camera, { point: x, half, frameMatrices: [A, B], level, stemLabel: open ? `xᵀAx = ${shown}` : "xᵀAx", pointLabel: "x" });
        drawSurface(right, B, camera, { point: y, half, frameMatrices: [A, B], level, stemLabel: open ? `yᵀBy = ${shown}` : "yᵀBy", pointLabel: "y" });
      };
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
      reference = wrapCanvas(canvas, "当前二次型");
      redraw = () => {
        const D = matrixFrom(root, "[data-s2-d]");
        if (!D) return;
        const y = root.querySelector(".qv-lab")?.dataset.s2Vars === "y";
        drawSurface(canvas, D, camera, { frameMatrices: [D], axisLabels: y ? ["y₁", "y₂"] : ["x₁", "x₂"] });
        const final = $(root, "[data-s2-status]")?.textContent.includes("完成");
        const title = reference?.querySelector(".qv-orbit-title");
        if (title) title.innerHTML = final ? `标准形 · 新变量 ${inline("y")}` : "当前二次型";
      };
    }

    if (section.id === "quadratic-uniqueness") {
      const left = $(root, "[data-s3-a-canvas]");
      const right = $(root, "[data-s3-b-canvas]");
      canvases = [left, right];
      wrapCanvas(left, `${inline("A")} · 原曲面`);
      wrapCanvas(right, `${inline("B=C^TAC")} · 变换后`);
      reference = $(root, ".qv-same");
      linked = true;
      redraw = () => {
        const A = matrixFrom(root, "[data-s3-a]");
        const B = matrixFrom(root, "[data-s3-b]");
        if (!A || !B) return;
        drawSurface(left, A, camera, { frameMatrices: [A, B], signedAxes: true });
        drawSurface(right, B, camera, { frameMatrices: [A, B], signedAxes: true });
      };
      const middle = $(root, ".qv-equals strong");
      if (middle) middle.innerHTML = inline("C^TAC");
    }

    if (section.id === "positive-definite") {
      const canvas = $(root, "[data-s4-surface]");
      canvases = [canvas];
      home = HOME_S4;
      const hero = $(root, ".qv-hero");
      hero?.classList.add("qv-orbit-shell", "qv-orbit-hero");
      const oldCaption = hero?.querySelector(":scope > div");
      if (oldCaption) {
        oldCaption.classList.add("qv-orbit-caption");
        hero.after(oldCaption);
      }
      const title = document.createElement("div");
      title.className = "qv-orbit-title";
      title.innerHTML = `${inline("q_t(x)")}<span data-orbit-class></span>`;
      const hint = document.createElement("div");
      hint.className = "qv-orbit-hint";
      hint.textContent = "拖动旋转 · 双击复位";
      hero?.append(title, hint);
      reference = hero;
      redraw = () => {
        const t = Number($(root, "[data-s4-t]")?.value || 0);
        const A = [[1, t], [t, 1]];
        // the level curves would give the type away, so the floor stays bare until a prediction
        const open = Boolean(root.querySelector(".qv-lab[data-s4-open]"));
        canvas.dataset.floor = open ? "on" : "off";
        // on a stop t = k/4 the type is read off |k| exactly (between stops, while the slider is
        // dragged, |4t| is compared as it is); q = 0 along (1, m) with 1 + 2tm + m² = 0
        const k4 = Math.abs(t * 4);
        const k = Math.abs(k4 - Math.round(k4)) < 1e-9 ? Math.round(k4) : k4;
        const root2 = k > 4 ? Math.sqrt(t * t - 1) : 0;
        const zeroDirections = (k < 4 ? [] : k === 4 ? [-t] : [-t + root2, -t - root2])
          .map((m) => [1 / Math.hypot(1, m), m / Math.hypot(1, m)]);
        drawSurface(canvas, A, camera, {
          frameMatrices: [A],
          padding: { top: 58, bottom: 42 },
          floor: open ? { levels: [-2, -1, -0.5, 0.5, 1, 2], zeroDirections } : null,
        });
        // the type joins the title once a prediction is picked
        const clsNode = $(root, "[data-orbit-class]");
        if (clsNode) clsNode.textContent = open ? ` · ${k < 4 ? "正定" : k === 4 ? "半正定" : "不定"}` : "";
      };
    }

    if (!canvases.length || canvases.some((canvas) => !canvas)) return undefined;
    const reset = bindOrbit(canvases, camera, redraw, controller, home);
    addViewTools(reference, reset, linked);
    const schedule = () => requestAnimationFrame(redraw);
    root.addEventListener("click", schedule, { signal: controller.signal });
    root.addEventListener("input", schedule, { signal: controller.signal });
    // a lab that animates a value without input events (a slider gliding to its stop) asks
    // for a redraw this way, once per frame
    root.addEventListener("la-redraw", () => redraw(), { signal: controller.signal });
    window.addEventListener("resize", schedule, { signal: controller.signal, passive: true });
    redraw();
    return () => controller.abort();
  }

  defineChapterEnhancer("ch5", (section, lessonRoot) => {
    if (!SECTIONS.includes(section?.id)) return undefined;
    return enhanceSection(section, lessonRoot.querySelector(`#${CSS.escape(section.id)}-interactive`));
  });
})();
