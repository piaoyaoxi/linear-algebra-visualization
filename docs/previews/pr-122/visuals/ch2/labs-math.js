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

  /* exact text of a rational number with a small denominator: "7/8", "−2" */
  function formatFrac(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    if (Math.abs(number) < 1e-9) return "0";
    const sign = number < 0 ? "−" : "";
    const x = Math.abs(number);
    for (let d = 1; d <= 64; d += 1) {
      const n = Math.round(x * d);
      if (Math.abs(n / d - x) < 1e-9) return d === 1 ? `${sign}${n}` : `${sign}${n}/${d}`;
    }
    return formatNum(number, 3).replace("-", "−");
  }

  function getPalette() {
    const style = getComputedStyle(document.body);
    return {
      surface: style.getPropertyValue("--surface-solid").trim() || "#ffffff",
      soft: style.getPropertyValue("--surface-soft").trim() || "#eef4f6",
      text: style.getPropertyValue("--text").trim() || "#071512",
      muted: style.getPropertyValue("--muted").trim() || "#66717f",
      line: style.getPropertyValue("--line-strong").trim() || "rgba(28,43,61,.2)",
      accent: style.getPropertyValue("--accent").trim() || "#2c5e4a",
      accentStrong: style.getPropertyValue("--accent-strong").trim() || "#1f4a39",
      coral: style.getPropertyValue("--coral").trim() || "#d9835f",
      warning: style.getPropertyValue("--warning").trim() || "#9a6a12",
      v1: style.getPropertyValue("--cv-v1").trim() || "#2a64a8",
      v2: style.getPropertyValue("--cv-v2").trim() || "#c4552f",
      image: style.getPropertyValue("--cv-image").trim() || "#8c4f86",
      paper: style.getPropertyValue("--cv-paper").trim() || "#fdfcf8",
      gridMajor: style.getPropertyValue("--cv-grid-major").trim() || "#e2ddd0",
      axis: style.getPropertyValue("--cv-axis").trim() || "#8a8d84",
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
    if (options.ghost) {
      const [[ga, gb], [gc, gd]] = options.ghost;
      points.push([ga, gc], [gb, gd], [ga + gb, gc + gd]);
    }
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

  /*
   * Name the column vector tip − base just past its tip, on the side away from the other column
   * (the outside of the parallelogram), on a paper halo so crossing lines stay readable.
   * `fallback` (±1) picks opposite sides for the two columns when they are collinear.
   */
  function sideAway(base, tip, other, fallback = 1) {
    const vx = tip.x - base.x;
    const vy = tip.y - base.y;
    const len = Math.hypot(vx, vy);
    if (len < 1e-6) return { u: { x: 0.7071, y: -0.7071 }, n: { x: 0.7071, y: 0.7071 } };
    const u = { x: vx / len, y: vy / len };
    let n = { x: -u.y, y: u.x };
    const side = other ? (other.x - base.x) * n.x + (other.y - base.y) * n.y : 0;
    const otherLen = other ? Math.hypot(other.x - base.x, other.y - base.y) : 0;
    if (Math.abs(side) > 0.04 * otherLen) {
      if (side > 0) n = { x: -n.x, y: -n.y };
    } else if (fallback < 0) n = { x: -n.x, y: -n.y };
    return { u, n };
  }

  function haloText(ctx, text, x, y, palette, color = palette.text) {
    ctx.save();
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.strokeStyle = palette.paper;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function tipLabel(ctx, text, base, tip, other, palette, width, height, fallback = 1) {
    const { u, n } = sideAway(base, tip, other, fallback);
    const w = ctx.measureText(text).width;
    // a point 13px off the line, a little before the tip; the text grows away from the line
    let x = tip.x - u.x * 4 + n.x * 13;
    let y = tip.y - u.y * 4 + n.y * 13;
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    if (n.x < -0.35) x -= w;
    else if (Math.abs(n.x) <= 0.35) x -= w / 2;
    y += n.y * 3;
    x = clamp(x, 4, width - w - 4);
    y = clamp(y, 9, height - 9);
    haloText(ctx, text, x, y, palette);
    ctx.restore();
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
    ctx.fillStyle = palette.paper;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = palette.gridMajor;
    ctx.lineWidth = 1;
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
    ctx.strokeStyle = palette.axis;
    ctx.lineWidth = 1;
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

    // ghost of the previous stage: same colours, dashed, 35% alpha
    if (options.ghost) {
      const [[ga, gb], [gc, gd]] = options.ghost;
      const g0 = map(0, 0);
      const g1 = map(ga, gc);
      const g2 = map(ga + gb, gc + gd);
      const g3 = map(gb, gd);
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = palette.image;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(g0.x, g0.y); ctx.lineTo(g1.x, g1.y); ctx.lineTo(g2.x, g2.y); ctx.lineTo(g3.x, g3.y); ctx.closePath();
      ctx.stroke();
      drawArrow(ctx, g0, g1, palette.v1, 2);
      drawArrow(ctx, g0, g3, palette.v2, 2);
      ctx.restore();
    }

    // guide: a dashed line through `point` along `dir` (e.g. the track of C₂'s tip in a shear)
    if (options.guide) {
      const { point, dir } = options.guide;
      const len = Math.hypot(dir[0], dir[1]) || 1;
      const reach = (width + height) / scale;
      const from = map(point[0] - (dir[0] / len) * reach, point[1] - (dir[1] / len) * reach);
      const to = map(point[0] + (dir[0] / len) * reach, point[1] + (dir[1] / len) * reach);
      ctx.save();
      ctx.strokeStyle = palette.v2;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.restore();
      if (options.guideLabel) {
        // named halfway along the slide, a little off the line on its upper side
        const mid = map(point[0] + dir[0] * 0.5, point[1] + dir[1] * 0.5);
        const sx = to.x - from.x;
        const sy = to.y - from.y;
        const sl = Math.hypot(sx, sy) || 1;
        let nx = -sy / sl;
        let ny = sx / sl;
        if (ny > 0) { nx = -nx; ny = -ny; }
        ctx.save();
        ctx.fillStyle = palette.v2;
        ctx.font = "italic 600 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(options.guideLabel, mid.x + nx * 14, mid.y + ny * 14);
        ctx.restore();
      }
    }

    const p0 = map(0, 0);
    const p1 = map(a, c);
    const p2 = map(a + b, c + d);
    const p3 = map(b, d);
    const nearZero = Math.abs(det) < 1e-7;
    // the area is a result (purple); a negative orientation is drawn dashed, zero area grey
    const statusColor = nearZero ? palette.muted : palette.image;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
    ctx.fillStyle = statusColor;
    ctx.globalAlpha = det < 0 ? 0.08 : 0.14;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 1.6;
    if (det < 0 && !nearZero) ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.restore();

    /*
     * orientation: the smaller turn from column 1 to column 2, with an arrowhead.
     * It runs counterclockwise exactly when det > 0 and flips when det < 0.
     */
    if (options.orientation && !nearZero) {
      const t1 = Math.atan2(c, a);
      let turn = Math.atan2(d, b) - t1;
      while (turn > Math.PI) turn -= 2 * Math.PI;
      while (turn <= -Math.PI) turn += 2 * Math.PI;
      const shortest = Math.min(Math.hypot(a, c), Math.hypot(b, d)) * scale;
      const r = clamp(shortest * 0.42, 18, 46);
      const end = t1 + turn;
      ctx.save();
      ctx.strokeStyle = palette.image;
      ctx.fillStyle = palette.image;
      ctx.lineWidth = 2;
      ctx.beginPath();
      // canvas y points down: math angle t is screen angle −t
      ctx.arc(p0.x, p0.y, r, -t1, -end, turn > 0);
      ctx.stroke();
      const tip = { x: p0.x + r * Math.cos(-end), y: p0.y + r * Math.sin(-end) };
      // tangent in the direction of travel
      const dir = turn > 0 ? -end - Math.PI / 2 : -end + Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(tip.x + 8 * Math.cos(dir), tip.y + 8 * Math.sin(dir));
      ctx.lineTo(tip.x + 8 * Math.cos(dir + 2.6), tip.y + 8 * Math.sin(dir + 2.6));
      ctx.lineTo(tip.x + 8 * Math.cos(dir - 2.6), tip.y + 8 * Math.sin(dir - 2.6));
      ctx.closePath();
      ctx.fill();
      const mid = -(t1 + turn / 2);
      ctx.font = "650 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.textAlign = Math.cos(mid) < -0.3 ? "right" : Math.cos(mid) > 0.3 ? "left" : "center";
      ctx.textBaseline = "middle";
      const label = det > 0 ? "逆时针 · det>0" : "顺时针 · det<0";
      const lx = clamp(p0.x + (r + 14) * Math.cos(mid), 8, width - 8);
      const ly = clamp(p0.y + (r + 14) * Math.sin(mid), 10, height - 10);
      ctx.lineWidth = 4;
      ctx.strokeStyle = palette.paper;
      ctx.strokeText(label, lx, ly);
      ctx.fillText(label, lx, ly);
      ctx.restore();
    }

    drawArrow(ctx, p0, p1, palette.v1, 3);
    drawArrow(ctx, p0, p3, palette.v2, 3);

    ctx.save();
    ctx.font = "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
    tipLabel(ctx, options.firstLabel || "Ae₁", p0, p1, p3, palette, width, height, 1);
    tipLabel(ctx, options.secondLabel || "Ae₂", p0, p3, p1, palette, width, height, -1);
    ctx.fillStyle = palette.text;
    if (options.caption) {
      ctx.fillStyle = palette.muted;
      ctx.font = "12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
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
    const both = [from, to, ...(options.drawOptions?.ghost ? [options.drawOptions.ghost] : [])];
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
    formatFrac,
    getPalette,
    cancelAnim,
    animateTo,
    setupCanvas,
    drawArrow,
    fitView,
    drawTransformScene,
    sideAway,
    haloText,
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
