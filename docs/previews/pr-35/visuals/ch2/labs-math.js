/* Chapter 2 shared math, canvas, and animation engine. */
(() => {
  const EPS = 1e-9;
  const frames = new WeakMap();
  const matrixState = new WeakMap();

  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - ((-2 * t + 2) ** 3) / 2);
  const reducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpVec = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  const lerpMat2 = (from, to, t) => from.map((row, i) => row.map((value, j) => lerp(value, to[i][j], t)));
  const cloneMat = (matrix) => matrix.map((row) => row.slice());
  const det2 = (matrix) => matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  const det3 = (matrix) =>
    matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
    matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
    matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
  const mul2 = (A, B) => [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
  ];

  function determinant(matrix) {
    const n = matrix.length;
    if (!n) return 1;
    if (n === 1) return matrix[0][0];
    if (n === 2) return det2(matrix);
    const work = cloneMat(matrix).map((row) => row.map(Number));
    let sign = 1;
    let product = 1;
    for (let col = 0; col < n; col += 1) {
      let pivot = col;
      for (let row = col + 1; row < n; row += 1) {
        if (Math.abs(work[row][col]) > Math.abs(work[pivot][col])) pivot = row;
      }
      if (Math.abs(work[pivot][col]) < EPS) return 0;
      if (pivot !== col) {
        [work[pivot], work[col]] = [work[col], work[pivot]];
        sign *= -1;
      }
      const pivotValue = work[col][col];
      product *= pivotValue;
      for (let row = col + 1; row < n; row += 1) {
        const factor = work[row][col] / pivotValue;
        for (let j = col + 1; j < n; j += 1) work[row][j] -= factor * work[col][j];
      }
    }
    return sign * product;
  }

  function formatNum(value, digits = 3) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    const safe = Math.abs(number) < 5 * 10 ** -(digits + 1) ? 0 : number;
    const rounded = Math.round(safe * 10 ** digits) / 10 ** digits;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  }

  function getPalette() {
    const style = getComputedStyle(document.body);
    return {
      surface: style.getPropertyValue("--surface-solid").trim() || "#ffffff",
      soft: style.getPropertyValue("--surface-soft").trim() || "#eef4f6",
      text: style.getPropertyValue("--text").trim() || "#071512",
      muted: style.getPropertyValue("--muted").trim() || "#66717f",
      line: style.getPropertyValue("--line-strong").trim() || "rgba(28,43,61,.2)",
      accent: style.getPropertyValue("--accent").trim() || "#0f8f88",
      accentStrong: style.getPropertyValue("--accent-strong").trim() || "#08736e",
      coral: style.getPropertyValue("--coral").trim() || "#d9835f",
      blue: style.getPropertyValue("--blue").trim() || "#547ec8",
      warning: style.getPropertyValue("--warning").trim() || "#9a6a12",
    };
  }

  function cancelAnim(key) {
    const frame = frames.get(key);
    if (frame) cancelAnimationFrame(frame);
    frames.delete(key);
  }

  function animateTo(key, from, to, duration, onUpdate) {
    cancelAnim(key);
    const actualDuration = reducedMotion() ? 0 : duration;
    if (actualDuration <= 0) {
      onUpdate(to, 1);
      return Promise.resolve(to);
    }
    const started = performance.now();
    return new Promise((resolve) => {
      const step = (now) => {
        const raw = Math.min(1, (now - started) / actualDuration);
        const t = easeInOutCubic(raw);
        const current = typeof from === "number" ? lerp(from, to, t) : Array.isArray(from[0]) ? lerpMat2(from, to, t) : lerpVec(from, to, t);
        onUpdate(current, raw);
        if (raw < 1) {
          frames.set(key, requestAnimationFrame(step));
          return;
        }
        frames.delete(key);
        onUpdate(to, 1);
        resolve(to);
      };
      frames.set(key, requestAnimationFrame(step));
    });
  }

  function setupCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width || canvas.clientWidth || 520);
    const height = Math.max(1, rect.height || canvas.clientHeight || 320);
    const dpr = window.devicePixelRatio || 1;
    const pixelWidth = Math.max(1, Math.round(width * dpr));
    const pixelHeight = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height, dpr };
  }

  function drawArrow(ctx, from, to, color, width = 2.8) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    if (length < 2) return;
    const angle = Math.atan2(dy, dx);
    const head = Math.min(12, Math.max(7, length * 0.14));
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - head * Math.cos(angle - 0.35), to.y - head * Math.sin(angle - 0.35));
    ctx.lineTo(to.x - head * Math.cos(angle + 0.35), to.y - head * Math.sin(angle + 0.35));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function fitView(matrix, width, height, options = {}) {
    const [a, b] = matrix[0];
    const [c, d] = matrix[1];
    const points = [
      [0, 0], [1, 0], [0, 1], [1, 1],
      [a, c], [b, d], [a + b, c + d],
      [-0.35, -0.35], [1.25, 1.25],
    ];
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    points.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });
    const pad = options.pad ?? 30;
    const worldWidth = Math.max(1e-6, maxX - minX);
    const worldHeight = Math.max(1e-6, maxY - minY);
    const scale = clamp(Math.min((width - pad * 2) / worldWidth, (height - pad * 2) / worldHeight), 20, Math.min(width, height) * 0.42);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    return {
      origin: { x: width * 0.5 - centerX * scale, y: height * 0.55 + centerY * scale },
      scale,
      bounds: { minX, maxX, minY, maxY },
    };
  }

  function drawTransformScene(canvas, matrix, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const [a, b] = matrix[0];
    const [c, d] = matrix[1];
    const fitted = fitView(matrix, width, height, options);
    const origin = options.origin || fitted.origin;
    const scale = options.scale ?? fitted.scale;
    const det = a * d - b * c;
    const map = (x, y) => ({ x: origin.x + x * scale, y: origin.y - y * scale });

    ctx.save();
    ctx.fillStyle = palette.soft;
    ctx.globalAlpha = 0.42;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.48;
    const halfX = Math.ceil(width / scale) + 2;
    const halfY = Math.ceil(height / scale) + 2;
    for (let i = -halfX; i <= halfX; i += 1) {
      const x = origin.x + i * scale;
      if (x >= 0 && x <= width) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
    }
    for (let j = -halfY; j <= halfY; j += 1) {
      const y = origin.y - j * scale;
      if (y >= 0 && y <= height) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = palette.muted;
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(0, origin.y); ctx.lineTo(width, origin.y);
    ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, height);
    ctx.stroke();
    ctx.restore();

    if (options.showUnit !== false) {
      const unit = [map(0, 0), map(1, 0), map(1, 1), map(0, 1)];
      ctx.save();
      ctx.beginPath();
      unit.forEach((point, index) => (index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
      ctx.closePath();
      ctx.strokeStyle = palette.muted;
      ctx.setLineDash([5, 5]);
      ctx.globalAlpha = 0.58;
      ctx.stroke();
      ctx.restore();
    }

    const p0 = map(0, 0);
    const p1 = map(a, c);
    const p2 = map(a + b, c + d);
    const p3 = map(b, d);
    const nearZero = Math.abs(det) < 1e-7;
    const statusColor = nearZero ? palette.warning : det > 0 ? palette.accent : palette.coral;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
    ctx.fillStyle = statusColor;
    ctx.globalAlpha = 0.18;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    drawArrow(ctx, p0, p1, palette.blue, 3);
    drawArrow(ctx, p0, p3, palette.coral, 3);

    ctx.save();
    ctx.fillStyle = palette.text;
    ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(options.firstLabel || "Ae₁", p1.x + 8, p1.y - 7);
    ctx.fillText(options.secondLabel || "Ae₂", p3.x + 8, p3.y - 7);
    if (options.caption) {
      ctx.fillStyle = palette.muted;
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(options.caption, 15, height - 14);
    }
    ctx.restore();

    matrixState.set(canvas, cloneMat(matrix));
    return { det, origin, scale, width, height, map, endpoints: [p1, p3] };
  }

  function animateMatrix(canvas, target, options = {}) {
    const from = cloneMat(matrixState.get(canvas) || [[1, 0], [0, 1]]);
    const to = cloneMat(target);
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width || canvas.clientWidth || 520);
    const height = Math.max(1, rect.height || canvas.clientHeight || 320);
    const both = [from, to];
    const points = [[0, 0], [1, 0], [0, 1], [1, 1]];
    both.forEach((matrix) => {
      points.push(
        [matrix[0][0], matrix[1][0]],
        [matrix[0][1], matrix[1][1]],
        [matrix[0][0] + matrix[0][1], matrix[1][0] + matrix[1][1]],
      );
    });
    let minX = Math.min(...points.map((p) => p[0]), -0.35);
    let maxX = Math.max(...points.map((p) => p[0]), 1.25);
    let minY = Math.min(...points.map((p) => p[1]), -0.35);
    let maxY = Math.max(...points.map((p) => p[1]), 1.25);
    const pad = 30;
    const scale = clamp(Math.min((width - pad * 2) / Math.max(1e-6, maxX - minX), (height - pad * 2) / Math.max(1e-6, maxY - minY)), 20, Math.min(width, height) * 0.42);
    const origin = { x: width * 0.5 - ((minX + maxX) / 2) * scale, y: height * 0.55 + ((minY + maxY) / 2) * scale };
    const drawOptions = { ...(options.drawOptions || {}), scale, origin };
    return animateTo(canvas, from, to, options.duration ?? 620, (current) => {
      drawTransformScene(canvas, current, drawOptions);
      options.onUpdate?.(current);
    }).then(() => {
      matrixState.set(canvas, to);
      drawTransformScene(canvas, to, options.drawOptions || {});
      return to;
    });
  }

  function inversionPairs(permutation) {
    const pairs = [];
    for (let i = 0; i < permutation.length; i += 1) {
      for (let j = i + 1; j < permutation.length; j += 1) {
        if (permutation[i] > permutation[j]) pairs.push({ i, j, a: permutation[i], b: permutation[j] });
      }
    }
    return pairs;
  }

  function allPositionPairs(length) {
    const pairs = [];
    for (let i = 0; i < length; i += 1) {
      for (let j = i + 1; j < length; j += 1) pairs.push({ i, j });
    }
    return pairs;
  }

  function signFromPerm(permutation) {
    return inversionPairs(permutation).length % 2 === 0 ? 1 : -1;
  }

  function permutations(n) {
    const out = [];
    const used = Array(n).fill(false);
    const current = [];
    function visit() {
      if (current.length === n) {
        out.push(current.slice());
        return;
      }
      for (let value = 1; value <= n; value += 1) {
        if (used[value - 1]) continue;
        used[value - 1] = true;
        current.push(value);
        visit();
        current.pop();
        used[value - 1] = false;
      }
    }
    visit();
    return out;
  }

  const minorMatrix = (matrix, row, col) => matrix.filter((_, r) => r !== row).map((line) => line.filter((_, c) => c !== col));
  const submatrix = (matrix, rows, cols) => rows.map((row) => cols.map((col) => matrix[row][col]));
  const complementIndices = (n, selected) => Array.from({ length: n }, (_, index) => index).filter((index) => !selected.includes(index));

  function detStatus(det, tolerance = 1e-7) {
    if (Math.abs(det) < tolerance) return { key: "zero", label: Math.abs(det) < EPS ? "维度塌缩" : "接近塌缩", cls: "is-zero" };
    if (det > 0) return { key: "positive", label: "方向保持", cls: "is-positive" };
    return { key: "negative", label: "方向翻转", cls: "is-negative" };
  }

  function classifySystem2(A, b) {
    const D = det2(A);
    if (Math.abs(D) >= EPS) return { kind: "unique", label: "唯一解" };
    const columns = [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];
    const nonzero = columns.find((vector) => Math.hypot(...vector) >= EPS);
    if (!nonzero) return Math.hypot(...b) < EPS ? { kind: "infinite", label: "无穷多解" } : { kind: "none", label: "无解" };
    const cross = nonzero[0] * b[1] - nonzero[1] * b[0];
    return Math.abs(cross) < EPS ? { kind: "infinite", label: "无穷多解" } : { kind: "none", label: "无解" };
  }

  function pulseClass(element, className = "is-pulse") {
    if (!element || reducedMotion()) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  window.Ch2Math = {
    EPS,
    easeInOutCubic,
    reducedMotion,
    clamp,
    lerp,
    lerpVec,
    lerpMat2,
    cloneMat,
    det2,
    det3,
    determinant,
    mul2,
    formatNum,
    getPalette,
    cancelAnim,
    animateTo,
    setupCanvas,
    drawArrow,
    fitView,
    drawTransformScene,
    animateMatrix,
    matrixState,
    inversionPairs,
    allPositionPairs,
    signFromPerm,
    permutations,
    minorMatrix,
    submatrix,
    complementIndices,
    detStatus,
    classifySystem2,
    pulseClass,
  };
})();
