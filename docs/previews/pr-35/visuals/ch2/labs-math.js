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

  /** Draw unit square transformed by 2x2 matrix [[a,b],[c,d]] (columns). */
  function drawTransformScene(canvas, matrix, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const a = matrix[0][0];
    const b = matrix[0][1];
    const c = matrix[1][0];
    const d = matrix[1][1];
    const origin = options.origin || { x: width * 0.42, y: height * 0.62 };
    const scale = options.scale || Math.min(width, height) * 0.22;
    const det = a * d - b * c;
    const col1 = palette.blue;
    const col2 = palette.coral;

    // background wash
    ctx.fillStyle = palette.soft;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    // grid
    ctx.save();
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.55;
    for (let i = -6; i <= 6; i += 1) {
      const x = origin.x + i * scale;
      const y = origin.y - i * scale;
      ctx.beginPath();
      ctx.moveTo(x, 12);
      ctx.lineTo(x, height - 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(12, y);
      ctx.lineTo(width - 12, y);
      ctx.stroke();
    }
    ctx.restore();

    // axes
    ctx.save();
    ctx.strokeStyle = palette.muted;
    ctx.lineWidth = 1.25;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(16, origin.y);
    ctx.lineTo(width - 16, origin.y);
    ctx.moveTo(origin.x, 16);
    ctx.lineTo(origin.x, height - 16);
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
      ctx.globalAlpha = 0.45;
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
    return animateTo(key, from, to, options.duration ?? 620, (current, t) => {
      drawTransformScene(canvas, current, options.drawOptions || {});
      options.onUpdate?.(current, t);
    }).then(() => {
      matrixState.set(canvas, to);
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
