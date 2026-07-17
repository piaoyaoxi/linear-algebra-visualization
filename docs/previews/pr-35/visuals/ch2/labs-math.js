/* Chapter 2 shared math, canvas, and animation engine (ch4-quality). */
(() => {
  const EPS = 1e-9;
  const frames = new WeakMap();
  const matrixState = new WeakMap();

  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);
  const reducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpVec = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  const lerpMat2 = (from, to, t) => from.map((row, i) => row.map((v, j) => lerp(v, to[i][j], t)));
  const cloneMat = (m) => m.map((r) => r.slice());
  const det2 = (m) => m[0][0] * m[1][1] - m[0][1] * m[1][0];
  const mul2 = (A, B) => [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
  ];
  const matFromFlat = (a, b, c, d) => [[a, b], [c, d]];
  const flatFromMat = (m) => [m[0][0], m[0][1], m[1][0], m[1][1]];

  function formatNum(value, digits = 2) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0";
    const safe = Math.abs(n) < 5 * 10 ** -(digits + 1) ? 0 : n;
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
    };
  }

  function cancelAnim(key) {
    const id = frames.get(key);
    if (id) cancelAnimationFrame(id);
    frames.delete(key);
  }

  function animateTo(key, from, to, duration, onUpdate) {
    cancelAnim(key);
    const dur = reducedMotion() ? 0 : duration;
    if (dur <= 0) {
      onUpdate(to, 1);
      return Promise.resolve(to);
    }
    const start = performance.now();
    return new Promise((resolve) => {
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = easeInOutCubic(t);
        const current = typeof from === "number" ? lerp(from, to, eased) : Array.isArray(from[0]) ? lerpMat2(from, to, eased) : lerpVec(from, to, eased);
        onUpdate(current, t);
        if (t < 1) {
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
    const height = Math.max(1, rect.height || canvas.clientHeight || 300);
    const dpr = window.devicePixelRatio || 1;
    const pw = Math.max(1, Math.round(width * dpr));
    const ph = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }

  function drawArrow(ctx, from, to, color, width = 2.8) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy);
    if (len < 2) return;
    const angle = Math.atan2(dy, dx);
    const head = Math.min(12, Math.max(7, len * 0.14));
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

  /** Fit world coords so unit square + transformed columns stay in view. */
  function fitView(matrix, width, height, options = {}) {
    const a = matrix[0][0];
    const b = matrix[0][1];
    const c = matrix[1][0];
    const d = matrix[1][1];
    // corners of unit square and image of unit square (parallelogram)
    const points = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
      [a, c],
      [b, d],
      [a + b, c + d],
      [-0.2, -0.2],
      [1.2, 1.2],
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
    // keep origin in frame with some air
    minX = Math.min(minX, -0.35);
    maxX = Math.max(maxX, 0.35);
    minY = Math.min(minY, -0.35);
    maxY = Math.max(maxY, 0.35);

    const pad = options.pad ?? 28;
    const worldW = Math.max(1e-6, maxX - minX);
    const worldH = Math.max(1e-6, maxY - minY);
    const scale = Math.min((width - pad * 2) / worldW, (height - pad * 2) / worldH);
    // never explode or shrink to nothing
    const clamped = clamp(scale, 18, Math.min(width, height) * 0.42);
    const origin = {
      x: pad + (width - pad * 2) * ((0 - minX) / worldW),
      y: pad + (height - pad * 2) * (1 - (0 - minY) / worldH),
    };
    // re-center if origin would pin to edge oddly
    const cx = width * 0.5;
    const cy = height * 0.55;
    // blend toward geometric center of content for stability
    const contentCx = (minX + maxX) / 2;
    const contentCy = (minY + maxY) / 2;
    const origin2 = {
      x: cx - contentCx * clamped,
      y: cy + contentCy * clamped,
    };
    return { origin: origin2, scale: clamped, bounds: { minX, maxX, minY, maxY } };
  }

  /** Draw unit square transformed by 2x2 matrix [[a,b],[c,d]] (columns). */
  function drawTransformScene(canvas, matrix, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const a = matrix[0][0];
    const b = matrix[0][1];
    const c = matrix[1][0];
    const d = matrix[1][1];
    const fitted = fitView(matrix, width, height, options);
    const origin = options.origin || fitted.origin;
    const scale = options.scale != null ? options.scale : fitted.scale;
    const det = a * d - b * c;
    const col1 = palette.blue;
    const col2 = palette.coral;

    // background wash
    ctx.fillStyle = palette.soft;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    // grid in world units that cover the view
    const halfCellsX = Math.ceil(width / scale) + 2;
    const halfCellsY = Math.ceil(height / scale) + 2;
    const originCellX = Math.round(origin.x / scale);
    const originCellY = Math.round(origin.y / scale);
    ctx.save();
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (let i = -halfCellsX; i <= halfCellsX; i += 1) {
      const x = origin.x + i * scale;
      if (x < 0 || x > width) continue;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let j = -halfCellsY; j <= halfCellsY; j += 1) {
      const y = origin.y - j * scale;
      if (y < 0 || y > height) continue;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // axes
    ctx.save();
    ctx.strokeStyle = palette.muted;
    ctx.lineWidth = 1.25;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(width, origin.y);
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, height);
    ctx.stroke();
    ctx.restore();

    const map = (x, y) => ({ x: origin.x + x * scale, y: origin.y - y * scale });

    // ghost unit square
    if (options.showUnit !== false) {
      const u0 = map(0, 0);
      const u1 = map(1, 0);
      const u2 = map(1, 1);
      const u3 = map(0, 1);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(u0.x, u0.y);
      ctx.lineTo(u1.x, u1.y);
      ctx.lineTo(u2.x, u2.y);
      ctx.lineTo(u3.x, u3.y);
      ctx.closePath();
      ctx.strokeStyle = palette.muted;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.55;
      ctx.stroke();
      ctx.restore();
    }

    // parallelogram
    const p0 = map(0, 0);
    const p1 = map(a, c);
    const p2 = map(a + b, c + d);
    const p3 = map(b, d);
    let fill;
    if (Math.abs(det) < 1e-8) fill = "rgba(176,122,18,0.22)";
    else if (det > 0) fill = "rgba(15,143,136,0.20)";
    else fill = "rgba(217,131,95,0.22)";

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = Math.abs(det) < 1e-8 ? "#b07a12" : det > 0 ? palette.accent : palette.coral;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    // columns as arrows
    drawArrow(ctx, p0, p1, col1, 3);
    drawArrow(ctx, p0, p3, col2, 3);

    // labels
    ctx.save();
    ctx.fillStyle = palette.text;
    ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
    ctx.globalAlpha = 0.9;
    ctx.fillText(options.firstLabel || "Ae₁", p1.x + 8, p1.y - 6);
    ctx.fillText(options.secondLabel || "Ae₂", p3.x + 8, p3.y - 6);
    if (options.caption) {
      ctx.fillStyle = palette.muted;
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(options.caption, 16, height - 14);
    }
    ctx.restore();

    matrixState.set(canvas, cloneMat(matrix));
    return { det, origin, scale };
  }

  function animateMatrix(canvas, target, options = {}) {
    const from = cloneMat(matrixState.get(canvas) || [[1, 0], [0, 1]]);
    const to = cloneMat(target);
    const key = canvas;
    // Lock camera for the whole tween so the view does not zoom every frame.
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width || canvas.clientWidth || 520);
    const height = Math.max(1, rect.height || canvas.clientHeight || 300);
    const aPts = [];
    [from, to].forEach((m) => {
      aPts.push([0, 0], [1, 0], [0, 1], [1, 1], [m[0][0], m[1][0]], [m[0][1], m[1][1]], [m[0][0] + m[0][1], m[1][0] + m[1][1]]);
    });
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    aPts.forEach(([x, y]) => {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    });
    minX = Math.min(minX, -0.35); maxX = Math.max(maxX, 0.35);
    minY = Math.min(minY, -0.35); maxY = Math.max(maxY, 0.35);
    const pad = 28;
    const worldW = Math.max(1e-6, maxX - minX);
    const worldH = Math.max(1e-6, maxY - minY);
    const lockedScale = clamp(Math.min((width - pad * 2) / worldW, (height - pad * 2) / worldH), 18, Math.min(width, height) * 0.42);
    const contentCx = (minX + maxX) / 2;
    const contentCy = (minY + maxY) / 2;
    const lockedOrigin = {
      x: width * 0.5 - contentCx * lockedScale,
      y: height * 0.55 + contentCy * lockedScale,
    };
    const drawOpts = {
      ...(options.drawOptions || {}),
      scale: lockedScale,
      origin: lockedOrigin,
    };
    return animateTo(key, from, to, options.duration ?? 620, (current) => {
      drawTransformScene(canvas, current, drawOpts);
      options.onUpdate?.(current);
    }).then(() => {
      matrixState.set(canvas, to);
      drawTransformScene(canvas, to, options.drawOptions || {});
      return to;
    });
  }

  function inversionPairs(perm) {
    const pairs = [];
    for (let i = 0; i < perm.length; i += 1) {
      for (let j = i + 1; j < perm.length; j += 1) {
        if (perm[i] > perm[j]) pairs.push([perm[i], perm[j]]);
      }
    }
    return pairs;
  }

  function signFromPerm(perm) {
    return inversionPairs(perm).length % 2 === 0 ? 1 : -1;
  }

  function permutations(n) {
    const base = Array.from({ length: n }, (_, i) => i + 1);
    const out = [];
    const used = Array(n).fill(false);
    const cur = [];
    function dfs() {
      if (cur.length === n) {
        out.push(cur.slice());
        return;
      }
      for (let i = 0; i < n; i += 1) {
        if (used[i]) continue;
        used[i] = true;
        cur.push(base[i]);
        dfs();
        cur.pop();
        used[i] = false;
      }
    }
    dfs();
    return out;
  }

  function minorMatrix(m, row, col) {
    return m.filter((_, r) => r !== row).map((line) => line.filter((_, c) => c !== col));
  }

  function det3(m) {
    return (
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
  }

  function detStatus(det) {
    if (Math.abs(det) < 1e-8) return { key: "zero", label: "维度塌缩", cls: "is-zero" };
    if (det > 0) return { key: "pos", label: "方向保持", cls: "is-positive" };
    return { key: "neg", label: "方向翻转", cls: "is-negative" };
  }

  function pulseClass(el, cls = "is-pulse") {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
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
    mul2,
    matFromFlat,
    flatFromMat,
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
    signFromPerm,
    permutations,
    minorMatrix,
    detStatus,
    pulseClass,
  };
})();
