
;/* visuals/ch2/labs-math.js */
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

  /*
   * The tip lands exactly on `to`: the shaft stops inside the head (butt end) so no stroke
   * pokes past the point, and the head has a shallow notch at its back.
   */
  function drawArrow(ctx, from, to, color, width = 2.8) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    if (length < 2) return;
    const ux = dx / length;
    const uy = dy / length;
    const head = Math.min(length * 0.5, clamp(width * 3.4 + 3, 9, 15));
    const half = head * 0.4;
    const notch = head * 0.74;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x - ux * (notch - 0.5), to.y - uy * (notch - 0.5));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - ux * head - uy * half, to.y - uy * head + ux * half);
    ctx.lineTo(to.x - ux * notch, to.y - uy * notch);
    ctx.lineTo(to.x - ux * head + uy * half, to.y - uy * head - ux * half);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /*
   * The world box a view has to show: the unit square, a little margin around the origin and
   * every column and parallelogram corner of the given matrices. Returns the world centre and
   * the scale, so two canvases of the same size can share one view (equal areas look equal).
   */
  function fitWorld(matrices, width, height, options = {}) {
    const points = [[0, 0], [1, 0], [0, 1], [1, 1], [-0.35, -0.35], [1.25, 1.25]];
    matrices.filter(Boolean).forEach(([[a, b], [c, d]]) => points.push([a, c], [b, d], [a + b, c + d]));
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
    return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, scale, bounds: { minX, maxX, minY, maxY } };
  }

  function worldView(world, width, height) {
    return {
      origin: { x: width * 0.5 - world.cx * world.scale, y: height * 0.55 + world.cy * world.scale },
      scale: world.scale,
      bounds: world.bounds,
    };
  }

  function fitView(matrix, width, height, options = {}) {
    return worldView(fitWorld([matrix, options.ghost], width, height, options), width, height);
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

  const LABEL_SERIF = "'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
  const SUBSCRIPTS = "₀₁₂₃₄₅₆₇₈₉";

  /*
   * Canvas labels such as "C₁", "Be₂" or "平行于 C₁": a Latin name with Unicode subscript digits
   * is set like the page's KaTeX (math italic, a real lowered subscript); other text stays upright.
   * `size` is the upright text size in px.
   */
  function labelRuns(text, size, weight = 600) {
    const runs = [];
    String(text).split(/([A-Za-z]+[₀-₉]+)/).forEach((part, index) => {
      if (!part) return;
      if (index % 2) {
        const [, base, sub] = /^([A-Za-z]+)([₀-₉]+)$/.exec(part);
        runs.push({ text: base, font: `italic ${Math.round(size * 1.18)}px KaTeX_Math, ${LABEL_SERIF}`, dy: 0 });
        runs.push({ text: [...sub].map((ch) => SUBSCRIPTS.indexOf(ch)).join(""), font: `${Math.round(size * 0.86)}px KaTeX_Main, ${LABEL_SERIF}`, dy: size * 0.3 });
      } else {
        runs.push({ text: part, font: `${weight} ${size}px ${LABEL_SERIF}`, dy: 0 });
      }
    });
    return runs;
  }

  function measureLabel(ctx, text, size = 12, weight = 600) {
    ctx.save();
    const width = labelRuns(text, size, weight).reduce((sum, run) => {
      ctx.font = run.font;
      return sum + ctx.measureText(run.text).width;
    }, 0);
    ctx.restore();
    return width;
  }

  // x is the left edge, y the middle of the line
  function haloText(ctx, text, x, y, palette, color = palette.text, size = 12, weight = 600) {
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    let cursor = x;
    labelRuns(text, size, weight).forEach((run) => {
      ctx.font = run.font;
      ctx.lineWidth = 4;
      ctx.strokeStyle = palette.paper;
      ctx.strokeText(run.text, cursor, y + run.dy);
      ctx.fillStyle = color;
      ctx.fillText(run.text, cursor, y + run.dy);
      cursor += ctx.measureText(run.text).width;
    });
    ctx.restore();
  }

  function tipLabel(ctx, text, base, tip, other, palette, width, height, fallback = 1) {
    const { u, n } = sideAway(base, tip, other, fallback);
    const w = measureLabel(ctx, text, 13);
    // a point 13px off the line, a little before the tip; the text grows away from the line
    let x = tip.x - u.x * 4 + n.x * 13;
    let y = tip.y - u.y * 4 + n.y * 13;
    if (n.x < -0.35) x -= w;
    else if (Math.abs(n.x) <= 0.35) x -= w / 2;
    y += n.y * 3;
    x = clamp(x, 4, width - w - 4);
    y = clamp(y, 9, height - 9);
    haloText(ctx, text, x, y, palette, palette.text, 13);
    return { x, y: y - 9, w, h: 18 };
  }

  // does the segment a–b pass through the box {x, y, w, h}?
  function segmentHitsBox(a, b, box) {
    const steps = Math.max(2, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 3));
    for (let i = 0; i <= steps; i += 1) {
      const x = a.x + ((b.x - a.x) * i) / steps;
      const y = a.y + ((b.y - a.y) * i) / steps;
      if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) return true;
    }
    return false;
  }

  /*
   * Place a w×h label centred on one of the candidate points; the first spot that stays on the
   * canvas and clear of the given segments wins, otherwise the one with the fewest hits.
   */
  function placeLabel(candidates, w, h, segments, width, height, boxes = []) {
    let best = null;
    const overlaps = (p, q) => p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.h && q.y < p.y + p.h;
    candidates.forEach((c, order) => {
      const box = { x: c.x - w / 2 - 3, y: c.y - h / 2 - 3, w: w + 6, h: h + 6 };
      const outside = box.x < 2 || box.y < 2 || box.x + box.w > width - 2 || box.y + box.h > height - 2;
      const hits = segments.filter(([a, b]) => segmentHitsBox(a, b, box)).length;
      const covered = boxes.filter((other) => overlaps(box, other)).length;
      const cost = hits * 10 + covered * 30 + (outside ? 100 : 0) + order * 0.1;
      if (!best || cost < best.cost) best = { cost, x: c.x, y: c.y, box };
    });
    return best;
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

    // quarter lines once a unit is wide enough to show them: the drag snaps to them
    if (options.minorGrid && scale >= 96) {
      ctx.save();
      ctx.strokeStyle = palette.gridMajor;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 0.6;
      const step = scale / 4;
      ctx.beginPath();
      for (let x = origin.x - Math.ceil(origin.x / step) * step; x <= width; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = origin.y - Math.ceil(origin.y / step) * step; y <= height; y += step) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();
      ctx.restore();
    }

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

    // everything drawn is an obstacle for the labels placed at the end
    const obstacles = [
      [{ x: 0, y: origin.y }, { x: width, y: origin.y }],
      [{ x: origin.x, y: 0 }, { x: origin.x, y: height }],
    ];
    const deferred = [];

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
      obstacles.push([g0, g1], [g0, g3]);
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
      obstacles.push([from, to]);
      if (options.guideLabel) {
        // along the slide line, just off it: before the old tip first, then past the new one
        const sx = to.x - from.x;
        const sy = to.y - from.y;
        const sl = Math.hypot(sx, sy) || 1;
        const nx = -sy / sl;
        const ny = sx / sl;
        const text = options.guideLabel;
        deferred.push((boxes) => {
          const w = measureLabel(ctx, text, 12, 500);
          const candidates = [];
          [-0.45, -0.8, 1.4, 1.75, -1.2, 0.5].forEach((t) => {
            const at = map(point[0] + dir[0] * t, point[1] + dir[1] * t);
            // the upper side of the line first
            const ext = 8 + Math.abs(nx) * (w / 2) + Math.abs(ny) * 7;
            (ny < 0 ? [1, -1] : [-1, 1]).forEach((side) => candidates.push({ x: at.x + nx * side * ext, y: at.y + ny * side * ext }));
          });
          const spot = placeLabel(candidates, w, 14, obstacles, width, height, boxes);
          haloText(ctx, text, spot.x - w / 2, spot.y, palette, palette.v2, 12, 500);
          boxes.push(spot.box);
        });
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
     * altitude: the height of the parallelogram over the base column 1, a dashed drop from the
     * tip of column 2 with a right-angle mark. Shears keep it; scaling column 1 keeps it too.
     */
    if (options.altitude && !nearZero) {
      const bl = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      if (bl > 4) {
        const u = { x: (p1.x - p0.x) / bl, y: (p1.y - p0.y) / bl };
        const along = (p3.x - p0.x) * u.x + (p3.y - p0.y) * u.y;
        const foot = { x: p0.x + u.x * along, y: p0.y + u.y * along };
        const drop = Math.hypot(p3.x - foot.x, p3.y - foot.y);
        const v = { x: (p3.x - foot.x) / (drop || 1), y: (p3.y - foot.y) / (drop || 1) };
        ctx.save();
        ctx.strokeStyle = palette.warning;
        ctx.fillStyle = palette.warning;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.55;
        ctx.setLineDash([3, 4]);
        // extend the base line when the foot falls outside column 1
        if (along < 0 || along > bl) {
          const from = along < 0 ? p0 : p1;
          ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(foot.x, foot.y); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1.6;
        ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(p3.x, p3.y); ctx.lineTo(foot.x, foot.y); ctx.stroke();
        ctx.setLineDash([]);
        const k = Math.min(8, drop * 0.4);
        const side = along > bl / 2 ? -1 : 1;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(foot.x + u.x * k * side, foot.y + u.y * k * side);
        ctx.lineTo(foot.x + u.x * k * side + v.x * k, foot.y + u.y * k * side + v.y * k);
        ctx.lineTo(foot.x + v.x * k, foot.y + v.y * k);
        ctx.stroke();
        ctx.restore();
        obstacles.push([p3, foot]);
        const text = options.altitudeLabel || "高";
        deferred.push((boxes) => {
          const w = measureLabel(ctx, text, 12);
          const candidates = [0.5, 0.3, 0.7].flatMap((t) => {
            const m = { x: foot.x + (p3.x - foot.x) * t, y: foot.y + (p3.y - foot.y) * t };
            const off = Math.abs(u.x) * (w / 2) + Math.abs(u.y) * 7 + 6;
            return [-side, side].map((sd) => ({ x: m.x + u.x * sd * off, y: m.y + u.y * sd * off }));
          });
          const spot = placeLabel(candidates, w, 14, obstacles, width, height, boxes);
          haloText(ctx, text, spot.x - w / 2, spot.y, palette, palette.warning, 12);
          boxes.push(spot.box);
        });
      }
    }

    /*
     * orientation: the smaller turn from column 1 to column 2, with an arrowhead whose point
     * stops just short of column 2. It runs counterclockwise exactly when det > 0.
     */
    if (options.orientation && !nearZero) {
      const t1 = Math.atan2(c, a);
      let turn = Math.atan2(d, b) - t1;
      while (turn > Math.PI) turn -= 2 * Math.PI;
      while (turn <= -Math.PI) turn += 2 * Math.PI;
      const shortest = Math.min(Math.hypot(a, c), Math.hypot(b, d)) * scale;
      const r = clamp(shortest * 0.42, 18, 46);
      const sgn = turn > 0 ? 1 : -1;
      // canvas y points down: the point at math angle t is (cos t, −sin t)
      const at = (t) => ({ x: p0.x + r * Math.cos(t), y: p0.y - r * Math.sin(t) });
      const head = 9;
      const tipAngle = t1 + turn - sgn * (3.5 / r);
      const backAngle = tipAngle - sgn * (head / r);
      const startAngle = t1 + sgn * (2.5 / r);
      ctx.save();
      ctx.strokeStyle = palette.image;
      ctx.fillStyle = palette.image;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      if ((backAngle - startAngle) * sgn > 0) {
        ctx.beginPath();
        ctx.arc(p0.x, p0.y, r, -startAngle, -(backAngle + sgn * (1.5 / r)), turn > 0);
        ctx.stroke();
      }
      // the head's axis is the chord from the arc point `head` px back to the tip
      const tip = at(tipAngle);
      const back = at(backAngle);
      const hl = Math.hypot(tip.x - back.x, tip.y - back.y) || 1;
      const hx = (tip.x - back.x) / hl;
      const hy = (tip.y - back.y) / hl;
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y);
      ctx.lineTo(back.x - hy * head * 0.42, back.y + hx * head * 0.42);
      ctx.lineTo(back.x + hx * head * 0.22, back.y + hy * head * 0.22);
      ctx.lineTo(back.x + hy * head * 0.42, back.y - hx * head * 0.42);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      // the label goes where it crosses nothing drawn: beside the arc first, then behind the origin
      const label = det > 0 ? "逆时针 · det>0" : "顺时针 · det<0";
      deferred.push((boxes) => {
        const w = measureLabel(ctx, label, 12, 650);
        const mid = t1 + turn / 2;
        const ray = (angle, gap) => {
          const ux = Math.cos(angle);
          const uy = -Math.sin(angle);
          const extent = Math.abs(ux) * (w / 2) + Math.abs(uy) * 7;
          return { x: p0.x + ux * (gap + extent), y: p0.y + uy * (gap + extent) };
        };
        const candidates = [];
        [r + 8, r + 26].forEach((gap) => {
          [0, 1, -1, 2, -2, 3, -3, 4, -4].forEach((k) => candidates.push(ray(mid + k * 0.26, gap)));
        });
        [12, 30, 52].forEach((gap) => [0, 1, -1, 2, -2].forEach((k) => candidates.push(ray(mid + Math.PI + k * 0.4, gap))));
        // last resort: a wider ring around the origin
        [r + 50, r + 80, r + 120].forEach((gap) => {
          for (let k = 0; k < 16; k += 1) candidates.push(ray(mid + (k * Math.PI) / 8, gap));
        });
        const spot = placeLabel(candidates, w, 14, obstacles, width, height, boxes);
        haloText(ctx, label, spot.x - w / 2, spot.y, palette, palette.image, 12, 650);
        boxes.push(spot.box);
      });
    }

    drawArrow(ctx, p0, p1, palette.v1, 3);
    drawArrow(ctx, p0, p3, palette.v2, 3);

    ctx.save();
    const boxes = [...(options.avoid || [])];
    boxes.push(tipLabel(ctx, options.firstLabel || "Ae₁", p0, p1, p3, palette, width, height, 1));
    boxes.push(tipLabel(ctx, options.secondLabel || "Ae₂", p0, p3, p1, palette, width, height, -1));
    if (options.caption) {
      // on a paper halo, so an axis running under it does not cut through the words
      haloText(ctx, options.caption, 15, height - 18, palette, palette.muted, 12, 400);
      boxes.push({ x: 11, y: height - 30, w: measureLabel(ctx, options.caption, 12, 400) + 8, h: 24 });
    }
    obstacles.push([p0, p1], [p0, p3], [p1, p2], [p3, p2]);
    deferred.forEach((place) => place(boxes));
    ctx.restore();

    matrixState.set(canvas, cloneMat(matrix));
    return { det, origin, scale, width, height, map, endpoints: [p1, p3] };
  }

  function animateMatrix(canvas, target, options = {}) {
    const from = cloneMat(matrixState.get(canvas) || [[1, 0], [0, 1]]);
    const to = cloneMat(target);
    // a fixed view (scale and origin given) stays put during and after the move
    if (options.drawOptions?.scale != null && options.drawOptions?.origin) {
      return animateTo(canvas, from, to, options.duration ?? 620, (current) => {
        drawTransformScene(canvas, current, options.drawOptions);
        options.onUpdate?.(current);
      }).then(() => {
        matrixState.set(canvas, to);
        drawTransformScene(canvas, to, options.drawOptions);
        return to;
      });
    }
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
    fitWorld,
    worldView,
    measureLabel,
    placeLabel,
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


;/* visuals/ch2/presentation-utils.js */
/* Shared Chapter 2 presentation helpers. */
(() => {
  const M = () => window.Ch2Math;
  const tex = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);
  const aEntry = (row, col) => tex(`a_{${row}${col}}`);
  const productTermHtml = (permutation) => permutation.map((col, row) => aEntry(row + 1, col)).join("");
  const formalShell = (title, lead, body) => `<h2>${title}</h2><div class="ch2-formal"><p class="ch2-formal-lead">${lead}</p>${body}</div>`;
  const module = (number, title, subtitle, body) => `<section class="ch2-module"><div class="ch2-module-heading"><span>${number}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  const proofSteps = (items) => `<ol class="ch2-proof-steps">${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
  const misconception = (items) => `<div class="ch2-misconception"><strong>辨析</strong><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul></div>`;
  const taskBox = (title, text) => `<div class="ch2-reading-note"><strong>${title}</strong><p>${text}</p></div>`;
  window.Ch2PresentationUtils = { M, tex, display, aEntry, productTermHtml, formalShell, module, proofSteps, misconception, taskBox };
})();


;/* visuals/ch2/section1-presentation.js */
(() => {
  const { M, tex, display, aEntry, productTermHtml, formalShell, module, proofSteps, misconception, taskBox } = window.Ch2PresentationUtils;
  // ---------- §1 ----------
  function mountDetMeter(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const canvas = root.querySelector("[data-ch2-canvas]");
    // quarter steps keep every entry and det exact (det = 7/8 at the start)
    const state = { matrix: [[1, 0.5], [0.25, 1]], view: null, dragging: -1, animating: false, zoom: 1 };
    /*
     * The view is fixed: the origin sits in the middle and one grid square is always area 1,
     * so a bigger |det| is a bigger shape on screen. Zoom only changes how many squares fit.
     * At zoom 1 the columns' whole drag range (±2.5) is in view.
     */
    const ZOOMS = [0.55, 0.75, 1, 1.4, 2];
    let zoomIndex = 2;
    const zoomKey = {};
    function view() {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || canvas.clientWidth || 520;
      const height = rect.height || canvas.clientHeight || 420;
      return { origin: { x: width / 2, y: height / 2 }, scale: (Math.min(width, height) / (2 * 2.75)) * state.zoom };
    }
    const snap = (x) => Math.round(x * 4) / 4;
    const lab = root.querySelector(".ch2-lab");
    const gate = window.LAPredictGate?.mount(root.querySelector("[data-orient-gate]"), {
      root: lab,
      key: "visuals/ch2/section1-presentation.js#orient",
      question: `从第 1 列转到第 2 列（取较小的那个角）。如果这一转是顺时针的，${tex("\\det")} 的符号是什么？`,
      options: [
        ["负", true, ""],
        ["正", false, "逆时针才给正号。把第 2 列拖到第 1 列的另一侧，看紫色的转向弧。"],
        [tex("\\det=0"), false, "det=0 时两列共线，没有转角。"],
        ["要看平行四边形面积多大", false, "面积给出 |det|，符号只由转向决定。"],
      ],
      right: `✓ 逆时针为正，顺时针为负，${tex("|\\det|")} 是面积。两列共线时转角消失，${tex("\\det=0")}；拖着第 2 列穿过第 1 列所在的直线，转向弧随之翻转。`,
      onReveal: () => { if (!state.animating) draw(state.matrix); },
    });
    // the turning arc names the sign rule, so it waits for a prediction and a first move
    const open = () => !gate || gate.revealed;
    const presets = {
      identity: [[1, 0], [0, 1]],
      scale2: [[2, 0], [0, 1]],
      shear: [[1, 1], [0, 1]],
      mirror: [[-1, 0], [0, 1]],
      collinear: [[1, 2], [0.5, 1]],
      negative2: [[-2, 0], [0, 1]],
    };

    function readControls() {
      return [
        [Number(root.querySelector('[data-key="a"]').value), Number(root.querySelector('[data-key="b"]').value)],
        [Number(root.querySelector('[data-key="c"]').value), Number(root.querySelector('[data-key="d"]').value)],
      ];
    }

    // labels = the settled matrix: while a preset slides, the sliders move but the numbers show where it lands
    function writeControls(matrix, labels = matrix) {
      const values = { a: [0, 0], b: [0, 1], c: [1, 0], d: [1, 1] };
      Object.entries(values).forEach(([key, [i, j]]) => {
        const input = root.querySelector(`[data-key="${key}"]`);
        const label = root.querySelector(`[data-val="${key}"]`);
        if (input) input.value = String(matrix[i][j]);
        if (label) label.textContent = M().formatFrac(labels[i][j]);
      });
    }

    function syncReadout(matrix) {
      const det = M().det2(matrix);
      const status = M().detStatus(det);
      const detElement = root.querySelector("[data-det]");
      detElement.textContent = M().formatFrac(det);
      detElement.className = status.cls;
      root.querySelector("[data-abs]").textContent = M().formatFrac(Math.abs(det));
      const statusElement = root.querySelector("[data-status]");
      statusElement.textContent = status.label;
      statusElement.className = `ch2-status ${status.cls}`;
      const f = (x) => {
        const v = M().formatFrac(x).replace("−", "-").replace(/^(-?)(\d+)\/(\d+)$/, "$1\\tfrac{$2}{$3}");
        return x < 0 ? `(${v})` : v;
      };
      root.querySelector("[data-formula]").innerHTML = tex(`${f(matrix[0][0])}\\cdot${f(matrix[1][1])}-${f(matrix[0][1])}\\cdot${f(matrix[1][0])}`);
      const hint = root.querySelector("[data-zero-hint]");
      hint.hidden = Math.abs(det) > 0.25;
      if (!hint.hidden) hint.textContent = Math.abs(det) < M().EPS ? "两列已经共线：二维面积完全消失。" : "接近零：继续拖动会穿过维度塌缩边界。";
      M().pulseClass(root.querySelector("[data-det-card]"));
    }

    function paint(matrix) {
      state.view = M().drawTransformScene(canvas, matrix, {
        firstLabel: "第 1 列",
        secondLabel: "第 2 列",
        caption: `det = ${M().formatFrac(M().det2(state.target || matrix))} · 一格面积为 1`,
        orientation: open(),
        minorGrid: true,
        // keep labels clear of the zoom control in the top-right corner
        avoid: [{ x: canvas.getBoundingClientRect().width - 140, y: 0, w: 140, h: 48 }],
        ...view(),
      });
    }

    function draw(matrix) {
      paint(matrix);
      writeControls(matrix, state.target || matrix);
      syncReadout(state.target || matrix);
    }

    // a new preset interrupts a running one: it starts from where the columns are now
    let run = 0;
    async function goTo(target) {
      const id = ++run;
      M().cancelAnim(canvas);
      const from = M().cloneMat(state.matrix);
      state.animating = true;
      state.target = M().cloneMat(target);
      writeControls(state.matrix, target);
      syncReadout(target);
      try {
        await M().animateTo(canvas, from, target, 650, (current) => {
          state.matrix = M().cloneMat(current);
          paint(current);
          writeControls(current, target);
        });
        if (id !== run) return;
        state.matrix = M().cloneMat(target);
        state.target = null;
        draw(state.matrix);
      } finally {
        if (id === run) {
          state.animating = false;
          state.target = null;
        }
      }
    }

    root.querySelectorAll("[data-key]").forEach((input) => {
      input.addEventListener("input", () => {
        if (state.animating) return;
        state.matrix = readControls();
        draw(state.matrix);
      }, { signal });
    });

    root.querySelectorAll("[data-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        root.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
        goTo(presets[button.dataset.preset]);
      }, { signal });
    });

    // zooming is not an action on the columns: it neither counts for the prediction nor moves them
    root.querySelectorAll("[data-zoom]").forEach((button) => {
      ["pointerup", "click"].forEach((type) => button.addEventListener(type, (event) => event.stopPropagation(), { signal }));
      button.addEventListener("click", () => {
        const step = Number(button.dataset.zoom);
        zoomIndex = step ? M().clamp(zoomIndex + step, 0, ZOOMS.length - 1) : 2;
        root.querySelector('[data-zoom="-1"]').disabled = zoomIndex === 0;
        root.querySelector('[data-zoom="1"]').disabled = zoomIndex === ZOOMS.length - 1;
        M().animateTo(zoomKey, state.zoom, ZOOMS[zoomIndex], 260, (z) => {
          state.zoom = z;
          paint(state.matrix);
        });
      }, { signal });
    });

    const nearEnd = (event) => {
      const rect = canvas.getBoundingClientRect();
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const distances = state.view.endpoints.map((end) => Math.hypot(end.x - point.x, end.y - point.y));
      const nearest = distances[0] <= distances[1] ? 0 : 1;
      return distances[nearest] > 34 ? -1 : nearest;
    };

    canvas.addEventListener("pointerdown", (event) => {
      if (state.animating || !state.view) return;
      const nearest = nearEnd(event);
      if (nearest < 0) return;
      state.dragging = nearest;
      canvas.setPointerCapture(event.pointerId);
      canvas.classList.add("is-dragging");
    }, { signal });

    canvas.addEventListener("pointermove", (event) => {
      if (state.dragging < 0 && state.view && event.pointerType === "mouse") canvas.classList.toggle("is-grabbable", !state.animating && nearEnd(event) >= 0);
      if (state.dragging < 0 || !state.view) return;
      const rect = canvas.getBoundingClientRect();
      const x = snap(M().clamp((event.clientX - rect.left - state.view.origin.x) / state.view.scale, -2.5, 2.5));
      const y = snap(M().clamp(-(event.clientY - rect.top - state.view.origin.y) / state.view.scale, -2.5, 2.5));
      if (state.dragging === 0) {
        state.matrix[0][0] = x;
        state.matrix[1][0] = y;
      } else {
        state.matrix[0][1] = x;
        state.matrix[1][1] = y;
      }
      draw(state.matrix);
    }, { signal });

    const stopDrag = () => {
      state.dragging = -1;
      canvas.classList.remove("is-dragging");
    };
    canvas.addEventListener("pointerup", stopDrag, { signal });
    canvas.addEventListener("pointercancel", stopDrag, { signal });
    window.addEventListener("resize", () => document.body.contains(canvas) && draw(state.matrix), { signal, passive: true });

    draw(state.matrix);
    // the subscript labels use KaTeX's fonts; redraw once they are ready
    document.fonts?.ready.then(() => document.body.contains(canvas) && !state.animating && draw(state.matrix));
    return () => {
      controller.abort();
      M().cancelAnim(canvas);
      M().cancelAnim(zoomKey);
    };
  }

  defineChapter2Renderer("determinant-intro", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "从平行四边形到有向面积",
        `二维图像负责建立直觉：矩阵的两列决定变换后的两条生成边。一般 ${tex("n")} 阶结论将在 §3 通过排列求和定义得到严格支撑。`,
        module("01", "二阶公式的几何落点", "同一公式同时读取面积、方向与塌缩。", `
          <div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">公式</span><strong>${display("\\det\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}=ad-bc")}</strong><p>两列张成的平行四边形有向面积为 ${tex("ad-bc")}，普通面积取绝对值。</p></article>
            <article class="ch2-def"><span class="kicker">符号</span><strong>正号保持定向，负号翻转定向</strong><p>符号记录有序基的方向；它不把普通几何面积变成负数。</p></article>
            <article class="ch2-def"><span class="kicker">零值</span><strong>共线使二维面积消失</strong><p>两列线性相关时，输出只能落在直线或点上，完整二维信息无法恢复。</p></article>
          </div>
        `) +
        module("02", "从零值连接到可逆与唯一解", "三个表述描述同一个二维边界。", proofSteps([
          `${tex("\\det(A)=0")} 表示两列张成的平行四边形面积为 0。`,
          "面积为 0 等价于两列共线，因此列向量线性相关。",
          "列向量无法构成平面的基，变换会丢失一个方向。",
          `丢失方向后无法唯一撤回，方程 ${tex("Ax=b")} 也不再对所有 ${tex("b")} 保证唯一解。`,
        ]) + misconception([
          `${tex("\\det(A)=1")} 只说明有向面积倍率为 1，并不要求 ${tex("A=E")}。`,
          `${tex("\\det<0")} 表示定向翻转；普通面积仍为 ${tex("|\\det|")}。`,
        ]) + taskBox("阅读线索", `在交互中让 ${tex("\\det")} 连续穿过 0。零点前后面积绝对值连续，方向状态在零点两侧发生改变。`)),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>有向面积 · 拖动两列</h3></div>
          <div data-orient-gate></div>
          <p class="ch2-lab-hint">拖动两根列向量的端点（每次四分之一格），也可以使用滑杆与预设。视角固定，一格面积为 1，平行四边形占几格，${tex("|\\det|")} 就是几；猜过并动手后，紫色弧标出从第 1 列到第 2 列的转向。</p>
          <div class="ch2-lab-grid ch2-area-layout">
            <div class="ch2-stage"><canvas data-ch2-canvas aria-label="可拖动两列向量的有向面积画布"></canvas><div class="ch2-zoom" role="group" aria-label="缩放视图"><button type="button" data-zoom="-1" aria-label="缩小">−</button><button type="button" data-zoom="0" aria-label="恢复原始大小">1:1</button><button type="button" data-zoom="1" aria-label="放大">+</button></div></div>
            <div class="ch2-side">
              <div class="ch2-meter">
                <div class="ch2-meter-card" data-det-card><strong>${tex("\\det")}</strong><span data-det>1</span></div>
                <div class="ch2-meter-card"><strong>${tex("|\\det|")}</strong><span data-abs>1</span></div>
                <div class="ch2-meter-card"><strong>状态</strong><span data-status class="ch2-status is-positive">方向保持</span></div>
              </div>
              <div class="ch2-note">计算：<strong data-formula></strong></div>
              <div class="ch2-note is-zero" data-zero-hint hidden></div>
              <div class="ch2-sliders">
                ${["a", "b", "c", "d"].map((key) => `<label><span>${tex(key)}</span><input data-key="${key}" type="range" min="-2.5" max="2.5" step="0.25" aria-label="矩阵元素 ${key}" /><span data-val="${key}">0</span></label>`).join("")}
              </div>
              <div class="ch2-side-presets">
                <span>预设</span>
                <div class="ch2-presets">
                  <button type="button" data-preset="identity">单位</button>
                  <button type="button" data-preset="scale2">面积 ${tex("\\times2")}</button>
                  <button type="button" data-preset="shear">剪切 ${tex("\\det=1")}</button>
                  <button type="button" data-preset="mirror">镜像</button>
                  <button type="button" data-preset="collinear">共线</button>
                  <button type="button" data-preset="negative2">${tex("\\det=-2")}</button>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      return mountDetMeter(root);
    },
  });

})();


;/* visuals/ch2/section2-presentation.js */
(() => {
  const { M, tex, formalShell, module, proofSteps, misconception } = window.Ch2PresentationUtils;

  function mountPermutationLab(root) {
    const controller = new AbortController();
    const { signal } = controller;
    let permutation = [3, 1, 4, 2];
    let selected = -1;
    let scannerIndex = 0;
    const HINT = "先在上方猜一猜，再动手：按“相邻交换一步”，或点两个数字对换。";
    let lastAction = HINT;
    // the readouts (τ, parity, sgn, det P, the inversion list) answer the prediction: they
    // appear once a guess has been made and the student has then changed the permutation
    let touched = false;
    const open = () => !gate || (gate.picked && touched);
    const pairOrder = M().allPositionPairs(4);
    const list = root.querySelector("[data-perm-list]");
    // adjacent swaps counted from the last loaded or hand-made permutation
    let startTau = 3;
    let startText = "3142";
    let startPerm = [3, 1, 4, 2];
    let adjSteps = 0;
    let swappedRows = [];
    const gate = window.LAPredictGate?.mount(root.querySelector("[data-perm-gate]"), {
      root: root.querySelector(".ch2-lab"),
      manual: true,
      key: "visuals/ch2/section2-presentation.js#adjacent",
      question: `从 ${tex("3142")} 出发，每次交换一对相邻的逆序数，直到变成 ${tex("1234")}。置换矩阵的 ${tex("\\det P")} 一路怎样变？${tex("\\operatorname{sgn}(3142)")} 是多少？`,
      options: [
        [`每换一次翻一次号，${tex("\\operatorname{sgn}(3142)=-1")}`, true, ""],
        [`每换一次翻一次号，${tex("\\operatorname{sgn}(3142)=(-1)^4")}，由排列长度决定`, false, "翻号次数等于交换次数 τ，与长度 4 无关：τ 从 3 减到 0，翻了 3 次。"],
        [`相邻交换不改变 ${tex("\\det P")}，${tex("\\operatorname{sgn}(3142)=+1")}`, false, "每一次相邻交换 τ 恰好减 1，det P 翻一次号。"],
        [`翻号次数取决于先换哪一对，${tex("\\operatorname{sgn}")} 不确定`, false, "无论先换哪一对相邻逆序数，τ 都恰好减 1，所以总共翻号 τ 次。"],
      ],
      // a (new) guess waits for the next action before the readouts appear
      onPick: () => {
        touched = false;
        render();
      },
      right: `✓ 每一次相邻交换只改变一对数的先后，${tex("\\tau")} 恰好减 1，${tex("\\det P")} 翻一次号。从 ${tex("\\tau=3")} 到 ${tex("\\tau=0")} 共 3 步，终点 ${tex("\\det E=+1")}，所以 ${tex("\\operatorname{sgn}(3142)=\\det P=(-1)^3=-1")}。`,
    });

    const tau = () => M().inversionPairs(permutation).length;

    function drawWires() {
      const svg = root.querySelector("[data-wires]");
      const xs = [42, 116, 190, 264];
      const pair = pairOrder[scannerIndex % pairOrder.length];
      // the wiring the count started from stays as a dashed ghost
      const moved = startPerm.some((value, index) => value !== permutation[index]);
      const ghost = moved ? startPerm.map((value, index) => `<path class="is-ghost" d="M ${xs[index]} 28 C ${xs[index]} 70, ${xs[value - 1]} 82, ${xs[value - 1]} 132" />`).join("") : "";
      svg.innerHTML = `
        ${ghost}
        ${xs.map((x, index) => `<text x="${x}" y="18" text-anchor="middle">${index + 1}</text>`).join("")}
        ${xs.map((x, index) => `<text x="${x}" y="146" text-anchor="middle">${index + 1}</text>`).join("")}
        ${permutation.map((value, index) => `<path class="${index === pair.i || index === pair.j ? "is-focus" : ""}" d="M ${xs[index]} 28 C ${xs[index]} 70, ${xs[value - 1]} 82, ${xs[value - 1]} 132" data-wire-index="${index}" />`).join("")}
      `;
    }

    function renderScanner() {
      const pair = pairOrder[scannerIndex % pairOrder.length];
      const inversion = permutation[pair.i] > permutation[pair.j];
      root.querySelector("[data-scan-pair]").textContent = `位置 ${pair.i + 1} 与 ${pair.j + 1}：${permutation[pair.i]}、${permutation[pair.j]}`;
      const result = root.querySelector("[data-scan-result]");
      result.textContent = inversion ? "构成逆序" : "顺序正常";
      result.className = inversion ? "is-negative" : "is-positive";
      list.querySelectorAll("[data-index]").forEach((button) => {
        const index = Number(button.dataset.index);
        button.classList.toggle("is-scanning", index === pair.i || index === pair.j);
      });
      drawWires();
    }

    // permutation matrix: row i has its 1 in column σ(i); det P = sgn σ
    function renderMatrix(sign) {
      const box = root.querySelector("[data-perm-matrix]");
      if (!box) return;
      box.innerHTML = `<table class="ch2-perm-matrix" aria-label="置换矩阵">${permutation.map((value, row) => `<tr class="${swappedRows.includes(row) ? "is-swapped" : ""}">${[1, 2, 3, 4].map((col) => `<td class="${col === value ? "is-one" : ""}">${col === value ? 1 : 0}</td>`).join("")}</tr>`).join("")}</table>
        <p class="ch2-perm-det">${tex("\\det P=")} ${!open() ? "<b>?</b>" : `${swappedRows.length ? `<s>${sign > 0 ? "−1" : "+1"}</s> → ` : ""}<b class="${sign > 0 ? "is-plus" : "is-minus"}">${sign > 0 ? "+1" : "−1"}</b>`}</p>`;
      const done = permutation.every((value, index) => value === index + 1);
      const counter = root.querySelector("[data-adj-count]");
      counter.innerHTML = done && adjSteps > 0
        ? `从 ${startText} 出发：相邻交换 <b>${adjSteps}</b> 次，${tex(`\\tau(${startText})=`)} <b>${startTau}</b>`
        : `从 ${startText} 出发：相邻交换 <b>${adjSteps}</b> 次`;
      counter.classList.toggle("is-positive", done && adjSteps > 0);
      // τ strip: one cell per adjacent swap made so far, det P = (−1)^τ under each
      const strip = root.querySelector("[data-tau-strip]");
      if (strip && !open()) strip.innerHTML = "";
      else if (strip) {
        const cells = [];
        for (let k = 0; k <= adjSteps; k += 1) {
          const t = startTau - k;
          const plus = t % 2 === 0;
          cells.push(`<span class="ch2-tau-cell${k === adjSteps ? " is-current" : ""}"><b>${tex(`\\tau=${t}`)}</b><small class="${plus ? "is-plus" : "is-minus"}">${tex(`\\det P=${plus ? "+1" : "-1"}`)}</small></span>`);
        }
        strip.innerHTML = cells.join('<i aria-hidden="true">→</i>');
      }
    }

    function restart() {
      startTau = tau();
      startText = permutation.join("");
      startPerm = permutation.slice();
      adjSteps = 0;
      swappedRows = [];
    }

    function describeParityChange(beforeTau, afterTau, action) {
      const delta = afterTau - beforeTau;
      const magnitude = Math.abs(delta);
      const parityText = magnitude % 2 === 1 ? "奇数" : "偶数";
      lastAction = `${action}：${tex("\\tau")} 从 ${beforeTau} 变为 ${afterTau}，改变 ${magnitude}（${parityText}），所以符号${magnitude % 2 === 1 ? "翻转" : "保持"}。`;
    }

    function render({ pulse = false } = {}) {
      list.innerHTML = permutation.map((value, index) => `
        <button type="button" class="ch2-perm-item${pulse ? " is-swap" : ""}${selected === index ? " is-selected" : ""}" draggable="true" data-index="${index}" aria-label="位置 ${index + 1} 的数 ${value}" aria-pressed="${selected === index}">${value}</button>
      `).join("");
      const inversions = M().inversionPairs(permutation);
      const sign = M().signFromPerm(permutation);
      const shown = open();
      root.querySelector("[data-tau]").textContent = shown ? String(inversions.length) : "—";
      root.querySelector("[data-parity]").textContent = !shown ? "—" : inversions.length % 2 === 0 ? "偶排列" : "奇排列";
      root.querySelector("[data-sgn]").textContent = !shown ? "—" : sign > 0 ? "+1" : "−1";
      root.querySelector("[data-perm-text]").textContent = permutation.join(" ");
      // selecting a number says nothing about τ; every other message does
      const neutral = lastAction === HINT || lastAction.startsWith("已选择") || lastAction.startsWith("已取消");
      const wait = gate?.picked ? "已记下你的猜测。按“相邻交换一步”，读数随后出现。" : "先在上方猜一猜，读数随后出现。";
      root.querySelector("[data-action]").innerHTML = shown || (neutral && !gate?.picked) ? lastAction : wait;
      root.querySelector("[data-inv-list]").innerHTML = !shown
        ? "猜一猜并动手后显示"
        : inversions.length
          ? inversions.map(({ a, b }) => `<span>${tex(`(${a},${b})`)}</span>`).join("")
          : "<span>无逆序对</span>";
      drawWires();
      renderMatrix(sign);

      let dragIndex = -1;
      list.querySelectorAll("[data-index]").forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.index);
          if (selected < 0) {
            selected = index;
            lastAction = `已选择位置 ${index + 1}；再选一个位置将执行一次对换。`;
            render();
            return;
          }
          if (selected === index) {
            selected = -1;
            lastAction = "已取消选择。";
            render();
            return;
          }
          const first = selected;
          const beforeTau = tau();
          [permutation[first], permutation[index]] = [permutation[index], permutation[first]];
          const afterTau = tau();
          describeParityChange(beforeTau, afterTau, `对换位置 ${first + 1} 与 ${index + 1}`);
          touched = !gate || gate.picked;
          restart();
          swappedRows = [first, index];
          selected = -1;
          scannerIndex = 0;
          render({ pulse: true });
        }, { signal });
        button.addEventListener("dragstart", () => { dragIndex = Number(button.dataset.index); }, { signal });
        button.addEventListener("dragover", (event) => event.preventDefault(), { signal });
        button.addEventListener("drop", () => {
          const target = Number(button.dataset.index);
          if (dragIndex < 0 || target === dragIndex) return;
          const beforeTau = tau();
          const distance = Math.abs(target - dragIndex);
          const next = permutation.slice();
          const [moved] = next.splice(dragIndex, 1);
          next.splice(target, 0, moved);
          permutation = next;
          touched = !gate || gate.picked;
          restart();
          const afterTau = tau();
          lastAction = `把 ${moved} 从位置 ${dragIndex + 1} 移到位置 ${target + 1}，跨过 ${distance} 个相邻位置；这等价于 ${distance} 次相邻交换。${tex("\\tau")}：${tex(`${beforeTau}\\to${afterTau}`)}，符号${distance % 2 ? "翻转" : "保持"}。`;
          selected = -1;
          scannerIndex = 0;
          render({ pulse: true });
        }, { signal });
      });
      renderScanner();
      M().pulseClass(root.querySelector("[data-tau-card]"));
    }

    root.querySelectorAll("[data-perm-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        const presets = {
          id: [1, 2, 3, 4],
          adjacent: [1, 3, 2, 4],
          reverse: [4, 3, 2, 1],
          cycle: [2, 3, 4, 1],
          example: [3, 1, 4, 2],
        };
        permutation = presets[button.dataset.permPreset].slice();
        touched = !gate || gate.picked;
        restart();
        selected = -1;
        scannerIndex = 0;
        lastAction = `载入排列 ${permutation.join("")}：请先猜一猜逆序数，再用扫描器核对。`;
        render({ pulse: true });
      }, { signal });
    });

    root.querySelector("[data-scan-next]").addEventListener("click", () => {
      scannerIndex = (scannerIndex + 1) % pairOrder.length;
      renderScanner();
    }, { signal });

    root.querySelector("[data-adj-step]").addEventListener("click", () => {
      for (let index = 0; index < permutation.length - 1; index += 1) {
        if (permutation[index] > permutation[index + 1]) {
          const beforeTau = tau();
          [permutation[index], permutation[index + 1]] = [permutation[index + 1], permutation[index]];
          const afterTau = tau();
          lastAction = `相邻交换位置 ${index + 1}、${index + 2}：${tex("\\tau")} 从 ${beforeTau} 降到 ${afterTau}，恰好减少 1，符号翻转。`;
          adjSteps += 1;
          touched = !gate || gate.picked;
          swappedRows = [index, index + 1];
          selected = -1;
          scannerIndex = 0;
          render({ pulse: true });
          if (afterTau === 0 && startText === "3142") gate?.acted();
          return;
        }
      }
      lastAction = "已经还原为恒等排列 1234，没有逆序。";
      root.querySelector("[data-action]").innerHTML = lastAction;
      root.querySelector("[data-scan-result]").textContent = "已经还原为恒等排列";
    }, { signal });

    render();
    return () => controller.abort();
  }

  defineChapter2Renderer("permutations", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "符号来自排列的奇偶性",
        "行列式的乘积项都采用每行每列各一次的取法。列指标形成排列，而排列中的交叉数量决定正负号。",
        module("01", "逆序数与排列符号", "先逐对比较，再压缩为一个符号。", `
          <div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">逆序</span><strong>${tex("i<j,\\;\\sigma(i)>\\sigma(j)")}</strong><p>位置靠前的数反而更大时，这一对形成逆序。</p></article>
            <article class="ch2-def"><span class="kicker">逆序数</span><strong>${tex("\\tau(\\sigma)")}</strong><p>全部逆序对的数量。</p></article>
            <article class="ch2-def"><span class="kicker">符号</span><strong>${tex("\\operatorname{sgn}(\\sigma)=(-1)^{\\tau(\\sigma)}")}</strong><p>偶排列取 +1，奇排列取 −1。</p></article>
          </div>
        `) + module("02", "相邻交换为什么翻转奇偶性", "只改变一对相邻元素的相对顺序。", proofSteps([
          "相邻元素之外的每个数，与这两个元素形成的逆序总数保持不变。",
          "被交换的两个相邻元素彼此之间的顺序恰好翻转一次。",
          "因此逆序数恰好改变 1，排列奇偶性翻转。",
          "任意对换可以分解为奇数次相邻交换，所以任意对换也翻转奇偶性。",
        ]) + misconception([
          "逆序数统计所有位置对，不等于最大元素或元素之和。",
          "一次对换一定翻转符号，但逆序数不一定只改变 1。",
          `把一个数移过 ${tex("d")} 个位置，等价于 ${tex("d")} 次相邻交换，与一次对换不同。`,
        ])),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>排列与逆序 · 逐对扫描</h3></div>
          <div data-perm-gate></div>
          <p class="ch2-lab-hint">点击两个数字完成一次对换，或拖动一个数字改变位置。扫描器逐对检查，连线图把逆序显示为交叉。</p>
          <div class="ch2-lab-grid ch2-permutation-layout">
            <div class="ch2-side ch2-permutation-scene">
              <div class="ch2-note">当前排列：<strong data-perm-text></strong></div>
              <div class="ch2-perm-row" data-perm-list></div>
              <div class="ch2-wire-pair">
                <svg class="ch2-wires" data-wires viewBox="0 0 306 160" role="img" aria-label="排列连线图，交叉表示逆序"></svg>
                <figure class="ch2-perm-matrix-box" data-perm-matrix></figure>
              </div>
              <div class="ch2-note" data-adj-count aria-live="polite"></div>
              <div class="ch2-tau-strip" data-tau-strip aria-label="每次相邻交换后的逆序数与 det P"></div>
            </div>
            <div class="ch2-side">
              <div class="ch2-meter">
                <div class="ch2-meter-card" data-tau-card><strong>${tex("\\tau(\\sigma)")}</strong><span data-tau></span></div>
                <div class="ch2-meter-card"><strong>奇偶</strong><span data-parity></span></div>
                <div class="ch2-meter-card"><strong>${tex("\\operatorname{sgn}")}</strong><span data-sgn></span></div>
              </div>
              <div class="ch2-note" data-action aria-live="polite"></div>
              <div class="ch2-note"><strong>全部逆序对</strong><div class="ch2-inversion-list" data-inv-list></div></div>
              <div class="ch2-note"><strong data-scan-pair></strong><br /><span data-scan-result></span></div>
              <div class="ch2-toolbar">
                <button type="button" data-scan-next>扫描下一对</button>
                <button type="button" class="is-primary" data-adj-step>相邻交换一步</button>
              </div>
            </div>
          </div>
          <div class="ch2-presets ch2-wide-controls">
            <button type="button" data-perm-preset="id">恒等 1234</button>
            <button type="button" data-perm-preset="adjacent">一次相邻交换</button>
            <button type="button" data-perm-preset="reverse">完全逆序</button>
            <button type="button" data-perm-preset="cycle">循环 2341</button>
            <button type="button" data-perm-preset="example">例题 3142</button>
          </div>
        </div>`;
      return mountPermutationLab(root);
    },
  });
})();


;/* visuals/ch2/section3-presentation.js */
(() => {
  const { M, tex, display, aEntry, productTermHtml, formalShell, module, proofSteps, misconception } = window.Ch2PresentationUtils;

  function mountSelectionGrid(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const n = 3;
    let chosen = Array(n).fill(null);
    let triangular = false;
    let pathFrame = 0;
    const gate = window.LAPredictGate?.mount(root.querySelector("[data-term-gate]"), {
      root: root.querySelector(".ch2-lab"),
      manual: true,
      key: "visuals/ch2/section3-presentation.js#upper",
      question: "把矩阵换成上三角（主对角线下方全是 0）。六条合法路径里，有几条的乘积可能不为 0？",
      options: [
        ["只有 1 条：主对角线", true, ""],
        ["3 条：带正号的三条", false, "符号与是否为 0 无关；其余五条每条都至少经过一个对角线下方的 0。"],
        ["6 条都可能", false, "除主对角线外，每条路径都要在某一行走到对角线左下方，那里是 0。"],
        ["一条也没有", false, "主对角线不经过下方的 0，a₁₁a₂₂a₃₃ 一般不为 0。"],
      ],
      right: `✓ 五条路径都踩到对角线下方的 0，只剩主对角线：上三角行列式 ${tex("=a_{11}a_{22}a_{33}")}。`,
      onReveal: () => paintTerms(),
    });

    // on an upper triangular matrix, the five paths that pick a zero are greyed out
    function paintTerms() {
      const open = triangular && (!gate || gate.revealed);
      root.querySelectorAll("[data-six]").forEach((button) => {
        const permutation = button.dataset.six.split("").map(Number);
        const zero = permutation.some((col, row) => row > col - 1);
        button.classList.toggle("is-zero-path", open && zero);
        button.querySelector(".ch2-term-zero")?.remove();
        if (open && zero) button.insertAdjacentHTML("beforeend", `<b class="ch2-term-zero">= 0</b>`);
      });
      const sum = root.querySelector("[data-six-sum]");
      if (sum) {
        sum.hidden = !open;
        sum.innerHTML = open ? `五条路径为 0，${tex("\\det A=a_{11}a_{22}a_{33}")}` : "";
      }
    }

    function labelAt(row, col) {
      if (triangular && row > col) return tex("0");
      return aEntry(row + 1, col + 1);
    }

    function currentPermutation() {
      return chosen.every((col) => col !== null) ? chosen.map((col) => col + 1) : null;
    }

    function schedulePath() {
      cancelAnimationFrame(pathFrame);
      pathFrame = requestAnimationFrame(() => {
        const permutation = currentPermutation();
        const svg = root.querySelector("[data-term-path]");
        const scene = root.querySelector("[data-term-scene]");
        if (!permutation || !svg || !scene) {
          if (svg) svg.innerHTML = "";
          return;
        }
        // every path stays inside the matrix: one segment from each row's choice to the next row's
        const sceneRect = scene.getBoundingClientRect();
        const points = permutation.map((col, row) => {
          const node = root.querySelector(`[data-main-r="${row}"][data-main-c="${col - 1}"]`);
          const rect = node.getBoundingClientRect();
          return { x: rect.left - sceneRect.left + rect.width / 2, y: rect.top - sceneRect.top + rect.height / 2 };
        });
        svg.setAttribute("viewBox", `0 0 ${sceneRect.width} ${sceneRect.height}`);
        svg.innerHTML = points.slice(0, -1).map((point, index) => {
          const next = points[index + 1];
          return `<line x1="${point.x}" y1="${point.y}" x2="${next.x}" y2="${next.y}" />`;
        }).join("");
      });
    }

    function matrixRows() {
      return Array.from({ length: n }, (_, row) => `
        <tr>${Array.from({ length: n }, (_, col) => {
          const selected = chosen[row] === col;
          const usedElsewhere = chosen.some((value, otherRow) => otherRow !== row && value === col);
          const hit = selected && triangular && row > col;
          const zero = triangular && row > col;
          return `<td class="${selected ? "is-selected" : ""}${hit ? " is-zero-hit" : ""}${zero ? " is-zero-cell" : ""}${usedElsewhere ? " is-locked-col" : ""}"><button type="button" data-main-r="${row}" data-main-c="${col}" data-r="${row}" data-c="${col}" aria-pressed="${selected}" ${usedElsewhere && !selected ? "disabled" : ""}>${labelAt(row, col)}</button></td>`;
        }).join("")}</tr>
      `).join("");
    }

    function render() {
      const table = root.querySelector("[data-select-table]");
      const permutation = currentPermutation();
      table.innerHTML = matrixRows();

      table.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          const row = Number(button.dataset.r);
          const col = Number(button.dataset.c);
          tour += 1;
          chosen[row] = chosen[row] === col ? null : col;
          const message = root.querySelector("[data-select-msg]");
          message.textContent = "继续选择：每行每列恰好一个。";
          message.className = "ch2-note";
          render();
        }, { signal });
      });

      if (!permutation) {
        root.querySelector("[data-perm-out]").textContent = "未完成";
        root.querySelector("[data-term-out]").textContent = "—";
        root.querySelector("[data-sign-out]").textContent = "—";
        root.querySelector("[data-zero-out]").textContent = "—";
        root.querySelector("[data-term-path]").innerHTML = "";
        return;
      }
      const sign = M().signFromPerm(permutation);
      const containsForcedZero = triangular && permutation.some((col, row) => row > col - 1);
      root.querySelector("[data-perm-out]").textContent = permutation.join("");
      root.querySelector("[data-term-out]").innerHTML = productTermHtml(permutation);
      root.querySelector("[data-sign-out]").textContent = sign > 0 ? "+" : "−";
      root.querySelector("[data-zero-out]").textContent = containsForcedZero ? "合法，但贡献为 0" : "合法，可能非零";
      const message = root.querySelector("[data-select-msg]");
      message.textContent = containsForcedZero
        ? "这条路径满足每行每列各一次，因此是合法项；上三角结构使它选中了主对角线下方的零。"
        : "合法取项已完成：排列、乘积和符号已经同步。";
      message.className = containsForcedZero ? "ch2-note is-zero" : "ch2-note is-positive";
      schedulePath();
    }

    /*
     * On the upper triangular matrix, walk the six paths one by one: each path is drawn on the
     * matrix and the zero below the diagonal it picks is circled; the main diagonal comes last.
     */
    let tour = 0;
    const TOUR = ["132", "213", "231", "312", "321", "123"];
    const markTerm = (key) => root.querySelectorAll("[data-six]").forEach((item) => item.classList.toggle("is-active", item.dataset.six === key));
    async function walkPaths() {
      const token = ++tour;
      for (const key of TOUR) {
        if (token !== tour || !triangular) return;
        chosen = key.split("").map((value) => Number(value) - 1);
        markTerm(key);
        render();
        if (!M().reducedMotion()) await new Promise((resolve) => setTimeout(resolve, 950));
      }
    }

    root.querySelector("[data-select-reset]").addEventListener("click", () => {
      tour += 1;
      chosen = Array(n).fill(null);
      render();
    }, { signal });
    root.querySelector("[data-select-231]").addEventListener("click", async () => {
      tour += 1;
      chosen = Array(n).fill(null);
      render();
      const path = [1, 2, 0];
      for (let row = 0; row < path.length; row += 1) {
        chosen[row] = path[row];
        render();
        if (!M().reducedMotion()) await new Promise((resolve) => setTimeout(resolve, 180));
      }
    }, { signal });
    root.querySelector("[data-triangle-toggle]").addEventListener("click", (event) => {
      triangular = !triangular;
      event.currentTarget.classList.toggle("is-active", triangular);
      event.currentTarget.textContent = triangular ? "恢复一般矩阵" : "观察上三角矩阵";
      render();
      if (triangular) gate?.acted();
      paintTerms();
      if (triangular) walkPaths();
      else tour += 1;
    }, { signal });

    const terms = root.querySelector("[data-six-terms]");
    terms.innerHTML = M().permutations(3).map((permutation) => {
      const sign = M().signFromPerm(permutation);
      return `<button type="button" data-six="${permutation.join("")}" class="ch2-term-btn" aria-label="排列 ${permutation.join("")} 对应项">${sign > 0 ? "+" : "−"}${productTermHtml(permutation)}</button>`;
    }).join("");
    terms.querySelectorAll("[data-six]").forEach((button) => {
      button.addEventListener("click", () => {
        tour += 1;
        chosen = button.dataset.six.split("").map((value) => Number(value) - 1);
        terms.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
        render();
      }, { signal });
    });

    render();
    window.addEventListener("resize", schedulePath, { signal, passive: true });
    return () => {
      cancelAnimationFrame(pathFrame);
      controller.abort();
    };
  }

  defineChapter2Renderer("n-order-determinant", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "n 阶定义：带符号的合法取项求和",
        "合法取项解决‘选哪些元素’，排列奇偶解决‘带什么符号’。两部分合在一起得到统一定义。",
        module("01", "Leibniz 定义", "每个排列生成且只生成一个乘积项。", `
          <article class="ch2-def ch2-formula-block"><span class="kicker">定义</span><strong>${display("\\det(A)=\\sum_{\\sigma\\in S_n}\\operatorname{sgn}(\\sigma)\\prod_{i=1}^{n}a_{i,\\sigma(i)}")}</strong><p>求和范围 ${tex("S_n")} 包含全部 ${tex("n!")} 个排列。第 ${tex("i")} 行选择第 ${tex("\\sigma(i)")} 列，因此每行每列各出现一次。</p></article>
        `) + module("02", "从一般定义回到二阶与三阶", `熟悉公式只是列出较小 ${tex("n")} 的全部排列。`, `
          <div class="ch2-card-grid">
            <article class="ch2-card"><span class="kicker">${tex("n=2")}</span><h4>${tex("a_{11}a_{22}-a_{12}a_{21}")}</h4><p>排列 ${tex("12")} 为偶，${tex("21")} 为奇。</p></article>
            <article class="ch2-card"><span class="kicker">${tex("n=3")}</span><h4>三正三负，共六项</h4><p>对角线法则可辅助记忆三阶，定义仍来自六个排列。</p></article>
            <article class="ch2-card"><span class="kicker">合法与非零</span><h4>两个概念必须分开</h4><p>路径合法只说明下标结构正确；若选中零元素，该项仍贡献 0。</p></article>
          </div>
          <article class="ch2-def ch2-formula-block"><span class="kicker">三阶完整展开</span><strong>${display("\\begin{aligned}\\det(A)={}&a_{11}a_{22}a_{33}+a_{12}a_{23}a_{31}+a_{13}a_{21}a_{32}\\\\&-a_{13}a_{22}a_{31}-a_{12}a_{21}a_{33}-a_{11}a_{23}a_{32}\\end{aligned}")}</strong></article>
        `) + module("03", "上三角矩阵为什么只剩一项", "零结构会消去除恒等排列外的所有合法路径。", proofSteps([
          `恒等排列 ${tex("\\sigma(i)=i")} 选择主对角线，得到 ${tex("a_{11}a_{22}\\cdots a_{nn}")}。`,
          `若 ${tex("\\sigma")} 不是恒等排列，则必存在某个 ${tex("i")} 使 ${tex("\\sigma(i)<i")}。`,
          `上三角矩阵在 ${tex("i>j")} 时有 ${tex("a_{ij}=0")}，因此该排列项含有零因子。`,
          "所以只有恒等排列项可能非零，行列式等于主对角线乘积。",
        ]) + misconception([
          "合法项必须同时满足每行与每列各一次；只满足列条件仍可能遗漏某一行。",
          "对角线法则只适用于二阶与三阶；四阶及以上回到定义、性质与展开。",
          "上三角的非恒等路径同样合法，只是因零结构贡献 0。",
        ])),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>Leibniz 取项 · 从矩阵到一项</h3></div>
          <div data-term-gate></div>
          <p class="ch2-lab-hint">每行选择一个元素。已经使用的列会被锁定；完成后依次读出排列、符号与乘积项。</p>
          <div class="ch2-term-workbench">
            <div class="ch2-term-scene" data-term-scene>
              <svg class="ch2-term-path" data-term-path aria-hidden="true"></svg>
              <div class="ch2-determinant-view">
                <span>原行列式</span>
                <table class="ch2-matrix-table ch2-term-matrix" data-select-table aria-label="三阶行列式取项网格"></table>
              </div>
            </div>
            <div class="ch2-term-reading">
              <div class="ch2-term-flow" aria-live="polite">
                <span>排列 <strong data-perm-out>未完成</strong></span>
                <i>→</i><span>符号 <strong data-sign-out>—</strong></span>
                <i>→</i><span>乘积 <strong data-term-out>—</strong></span>
                <i>→</i><span data-zero-out>—</span>
              </div>
              <div class="ch2-note" data-select-msg aria-live="polite">继续选择：每行每列恰好一个。</div>
              <div class="ch2-toolbar">
                <button type="button" data-select-reset>清空</button>
                <button type="button" data-select-231>播放排列 231</button>
                <button type="button" class="is-primary" data-triangle-toggle>观察上三角矩阵</button>
              </div>
            </div>
            <div class="ch2-term-index"><strong>六条合法路径</strong><div data-six-terms></div><p class="ch2-six-sum" data-six-sum hidden></p></div>
          </div>
        </div>`;
      return mountSelectionGrid(root);
    },
  });
})();


;/* visuals/ch2/section4-presentation.js */
(() => {
  const { M, tex, display, aEntry, productTermHtml, formalShell, module, proofSteps, misconception, taskBox } = window.Ch2PresentationUtils;
  // ---------- §4 ----------
  function mountColumnOperations(root) {
    const controller = new AbortController();
    const { signal } = controller;
    // integer columns, so every determinant on the way is an exact integer
    const initial = [[2, 1], [1, 2]];
    let matrix = M().cloneMat(initial);
    const baseDet = M().det2(initial);
    let factor = 1;
    const ledger = [];
    const history = [];
    const beforeCanvas = root.querySelector("[data-row-before]");
    const canvas = root.querySelector("[data-row-canvas]");
    let animating = false;
    let guide = null;
    /*
     * Both canvases share one view (same scale, same origin), so equal areas look equal:
     * the view frames the initial columns and the current ones, and glides when that box changes.
     */
    let world = null;
    const viewKey = {};
    const size = () => {
      const rect = canvas.getBoundingClientRect();
      return { width: rect.width || 360, height: rect.height || 320 };
    };
    const frame = (...matrices) => {
      const { width, height } = size();
      return M().fitWorld([initial, ...matrices], width, height, { pad: 34 });
    };
    const lerpWorld = (from, to, t) => ({ cx: M().lerp(from.cx, to.cx, t), cy: M().lerp(from.cy, to.cy, t), scale: M().lerp(from.scale, to.scale, t) });
    // the height over C₁ answers the prediction, so it appears with the verdict
    const revealed = () => !gate || gate.revealed;
    const gate = window.LAPredictGate?.mount(root.querySelector("[data-op-gate]"), {
      root: root.querySelector(".ch2-lab"),
      manual: true,
      key: "visuals/ch2/section4-presentation.js#add",
      question: `两列 ${tex("C_1")}、${tex("C_2")} 围成平行四边形。做倍加 ${tex("C_2\\leftarrow C_2+C_1")} 以后，它的有向面积 ${tex("\\det")} 会怎样？`,
      options: [
        ["不变", true, ""],
        ["变大：多加了一列", false, "C₂ 的端点沿平行于 C₁ 的虚线滑动，底 C₁ 和金色的高都没变。"],
        ["变成原来的两倍", false, "倍加不是倍乘；面积仍是 3。"],
        ["变号", false, "只有交换两列才变号；倍加不改变两列的先后次序。"],
      ],
      right: `✓ ${tex("C_2")} 的端点沿着与 ${tex("C_1")} 平行的直线滑动：底不变、高（金色虚线）不变，所以 ${tex("\\det")} 不变。交换乘 −1，倍乘 ${tex("C_1\\times2")} 乘 2，倍加乘 1。`,
    });

    function matrixHtml(value) {
      return tex(`\\begin{bmatrix}${M().formatNum(value[0][0], 2)}&${M().formatNum(value[0][1], 2)}\\\\${M().formatNum(value[1][0], 2)}&${M().formatNum(value[1][1], 2)}\\end{bmatrix}`);
    }

    function snapshot() {
      history.push({ matrix: M().cloneMat(matrix), factor, ledger: ledger.slice() });
    }

    function sync() {
      const det = M().det2(matrix);
      gate?.relock();
      root.querySelector("[data-mat]").innerHTML = matrixHtml(matrix);
      root.querySelector("[data-cur-det]").textContent = M().formatNum(det, 3);
      root.querySelector("[data-factor]").textContent = M().formatNum(factor, 3);
      root.querySelector("[data-base-det]").textContent = M().formatNum(baseDet, 3);
      root.querySelector("[data-check]").textContent = M().formatNum(baseDet * factor, 3);
      root.querySelector("[data-ledger]").innerHTML = ledger.length ? ledger.map((line) => `<li>${line}</li>`).join("") : "<li>起点：累计倍率 1</li>";
      root.querySelector("[data-op-undo]").disabled = history.length === 0 || animating;
      if (!world) world = frame(matrix);
      paint(matrix, world, `当前 det=${M().formatNum(det, 3)} · 虚线是初始图形`);
    }

    function paint(current, view, caption) {
      const { width, height } = size();
      const { origin, scale } = M().worldView(view, width, height);
      const shared = { firstLabel: "C₁", secondLabel: "C₂", orientation: true, showUnit: false, altitude: revealed(), origin, scale };
      M().drawTransformScene(canvas, current, { ...shared, ghost: initial, guide, guideLabel: guide ? "平行于 C₁" : "", caption });
      M().drawTransformScene(beforeCanvas, initial, { ...shared, caption: `固定参照 · det=${M().formatNum(baseDet, 3)}` });
    }

    // move the columns from `from` to `to` while the shared view glides to frame both ends
    function glide(from, to, duration, caption) {
      const startWorld = world || frame(from);
      const endWorld = frame(from, to);
      const finalWorld = frame(to);
      return M().animateTo(viewKey, 0, 1, duration, (t) => {
        // the view settles on the larger box first, then eases onto the final one
        const view = t < 0.5 ? lerpWorld(startWorld, endWorld, Math.min(1, t * 2.4)) : lerpWorld(endWorld, finalWorld, (t - 0.5) * 2);
        world = view;
        paint(M().lerpMat2(from, to, M().easeInOutCubic(t)), view, caption);
      });
    }

    async function apply(next, multiplier, line, track = null) {
      if (animating) return;
      snapshot();
      animating = true;
      factor *= multiplier;
      ledger.push(line.html);
      // C₁ ← 2C₁ keeps C₂ and the direction of C₁, so the slide line of an earlier shear stays valid
      guide = track || (multiplier === 2 ? guide : null);
      // the readouts show where the move lands; the orientation arc turns over during a swap
      root.querySelector("[data-cur-det]").textContent = M().formatNum(M().det2(next), 3);
      root.querySelector("[data-mat]").innerHTML = matrixHtml(next);
      try {
        await glide(M().cloneMat(matrix), next, track ? 900 : 560, line.text);
        matrix = M().cloneMat(next);
      } finally {
        animating = false;
        if (track) gate?.acted();
        sync();
      }
    }

    async function jumpTo(next) {
      animating = true;
      try {
        await glide(M().cloneMat(matrix), next, 380, "");
        matrix = M().cloneMat(next);
      } finally {
        animating = false;
        sync();
      }
    }

    root.querySelector("[data-op-swap]").addEventListener("click", () => apply(
      [[matrix[0][1], matrix[0][0]], [matrix[1][1], matrix[1][0]]],
      -1,
      { text: "C₁ ↔ C₂　累计倍率 ×(−1)", html: `${tex("C_1\\leftrightarrow C_2")}　累计倍率 ${tex("\\times(-1)")}` },
    ), { signal });
    root.querySelector("[data-op-scale]").addEventListener("click", () => apply(
      [[matrix[0][0] * 2, matrix[0][1]], [matrix[1][0] * 2, matrix[1][1]]],
      2,
      { text: "C₁ ← 2C₁　累计倍率 ×2", html: `${tex("C_1\\leftarrow 2C_1")}　累计倍率 ${tex("\\times2")}` },
    ), { signal });
    // the tip of C₂ slides along the line through it parallel to C₁
    root.querySelector("[data-op-add]").addEventListener("click", () => apply(
      [[matrix[0][0], matrix[0][1] + matrix[0][0]], [matrix[1][0], matrix[1][1] + matrix[1][0]]],
      1,
      { text: "倍加：C₂ ← C₂+C₁　累计倍率 ×1", html: `倍加：${tex("C_2\\leftarrow C_2+C_1")}　累计倍率 ${tex("\\times1")}` },
      { point: [matrix[0][1], matrix[1][1]], dir: [matrix[0][0], matrix[1][0]] },
    ), { signal });
    root.querySelector("[data-op-undo]").addEventListener("click", () => {
      if (animating || !history.length) return;
      const previous = history.pop();
      factor = previous.factor;
      guide = null;
      ledger.splice(0, ledger.length, ...previous.ledger);
      jumpTo(previous.matrix);
    }, { signal });
    root.querySelector("[data-op-reset]").addEventListener("click", () => {
      if (animating) return;
      factor = 1;
      guide = null;
      ledger.length = 0;
      history.length = 0;
      jumpTo(M().cloneMat(initial));
    }, { signal });
    window.addEventListener("resize", () => {
      if (!document.body.contains(canvas) || animating) return;
      world = frame(matrix);
      sync();
    }, { signal, passive: true });

    sync();
    document.fonts?.ready.then(() => document.body.contains(canvas) && !animating && sync());
    return () => {
      controller.abort();
      M().cancelAnim(viewKey);
    };
  }

  defineChapter2Renderer("determinant-properties", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "分别线性与交替性统一全部计算规则",
        `交互直接展示列操作，因为平行四边形的生成边就是矩阵的列。由 ${tex("\\det(A^T)=\\det(A)")}，所有结论逐字转化为行操作版本。`,
        module("01", "两条结构性质", "先抓住母性质，再记住派生规则。", `
          <div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">分别线性</span><strong>${tex("D(\\ldots,u+v,\\ldots)=D(\\ldots,u,\\ldots)+D(\\ldots,v,\\ldots)")}</strong><p>固定其余行或列后，对单独一个位置线性。</p></article>
            <article class="ch2-def"><span class="kicker">交替性</span><strong>交换两行或两列，行列式变号</strong><p>同一组生成向量的次序翻转，定向随之翻转。</p></article>
          </div>
        `) + module("02", "三类初等变换", "每一步都对应一个明确倍率。", `
          <div class="ch2-card-grid">
            <article class="ch2-card"><span class="kicker">交换</span><h4>${tex("\\times(-1)")}</h4><p>绝对值不变，定向翻转。</p></article>
            <article class="ch2-card"><span class="kicker">倍乘</span><h4>${tex("\\times\\lambda")}</h4><p>一条生成边缩放，体积同比缩放。</p></article>
            <article class="ch2-card"><span class="kicker">倍加</span><h4>${tex("\\times1")}</h4><p>产生剪切，底与高的乘积保持。</p></article>
          </div>
        `) + module("03", "派生结论的依赖链", "证明时回到结构，计算时使用结论。", proofSteps([
          "两行相同：交换后矩阵未变，但行列式应变号，因此只能为 0。",
          "一行加另一行的倍数：按分别线性拆开，新增项含两行相同而为 0。",
          "三角矩阵：用倍加逐步消元或直接由定义，最终只剩主对角线乘积。",
          `${tex("\\det(\\lambda A)=\\lambda^n\\det(A)")}：${tex("n")} 行都各自提出一个 ${tex("\\lambda")}。`,
        ]) + misconception([
          `${tex("\\det(A+B)")} 一般不满足整体线性；线性只针对一行或一列。`,
          "交互中的列操作与教材中的行操作规则一致，连接桥梁是转置不变性。",
        ])),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>三种列操作 · 对比几何变化</h3></div>
          <div data-op-gate></div>
          <p class="ch2-lab-hint">平行四边形由两列生成，所以画面直接操作列。两幅图比例相同，面积可以直接比较；右图的虚线是初始图形，读数同步验证当前 ${tex("\\det")}=初始 ${tex("\\det")}×累计倍率。</p>
          <div class="ch2-operation-layout">
            <div class="ch2-compare-stage">
              <div><span>变换前 · 固定参照</span><div class="ch2-stage"><canvas data-row-before aria-label="列操作前的有向面积"></canvas></div></div>
              <b aria-hidden="true">→</b>
              <div><span>变换后 · 当前状态</span><div class="ch2-stage"><canvas data-row-canvas aria-label="列操作后的有向面积"></canvas></div></div>
            </div>
            <div class="ch2-operation-summary">
              <div class="ch2-note">当前矩阵<br /><strong data-mat></strong></div>
              <div class="ch2-meter is-2">
                <div class="ch2-meter-card"><strong>当前 ${tex("\\det")}</strong><span data-cur-det></span></div>
                <div class="ch2-meter-card"><strong>初始 ${tex("\\det")}</strong><span data-base-det></span></div>
                <div class="ch2-meter-card"><strong>累计倍率</strong><span data-factor></span></div>
                <div class="ch2-meter-card"><strong>初始×倍率</strong><span data-check></span></div>
              </div>
              <div class="ch2-ledger"><strong>操作账本</strong><ol data-ledger></ol></div>
            </div>
            <div class="ch2-toolbar ch2-wide-controls">
              <button type="button" class="is-primary" data-op-add>倍加 ${tex("C_2\\leftarrow C_2+C_1")}</button>
              <button type="button" data-op-swap>交换 ${tex("C_1")}、${tex("C_2")}</button>
              <button type="button" data-op-scale>${tex("C_1\\times2")}</button>
              <button type="button" data-op-undo>撤销</button>
              <button type="button" data-op-reset>重置</button>
            </div>
          </div>
        </div>`;
      return mountColumnOperations(root);
    },
  });
})();


;/* visuals/ch2/section5-presentation.js */
(() => {
  const { M, tex, display, aEntry, productTermHtml, formalShell, module, proofSteps, misconception, taskBox } = window.Ch2PresentationUtils;
  // ---------- §5 ----------
  // exact value of a rational number with a small denominator: { tex, text }
  function frac(value) {
    if (Math.abs(value) < 1e-9) return { tex: "0", text: "0" };
    const sign = value < 0 ? -1 : 1;
    const x = Math.abs(value);
    for (let d = 1; d <= 60; d += 1) {
      const n = Math.round(x * d);
      if (Math.abs(n / d - x) < 1e-9) {
        if (d === 1) return { tex: `${sign < 0 ? "-" : ""}${n}`, text: `${sign < 0 ? "−" : ""}${n}` };
        return { tex: `${sign < 0 ? "-" : ""}\\tfrac{${n}}{${d}}`, text: `${sign < 0 ? "−" : ""}${n}/${d}` };
      }
    }
    return { tex: M().formatNum(value, 4), text: M().formatNum(value, 4) };
  }

  function mountStrategy(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const initial = [[2, 1, 0], [1, 3, 1], [0, 2, 1]];
    let matrix = M().cloneMat(initial);
    let factor = 1;
    const ledger = [];
    const history = [];
    let busy = false;
    let focus = { row: 1, col: 0, text: `先利用第 1 行，把 ${tex("a_{21}")} 消成 0。` };
    const lab = root.querySelector(".ch2-lab");
    const gate = window.LAPredictGate?.mount(root.querySelector("[data-elim-gate]"), {
      root: lab,
      manual: true,
      key: "visuals/ch2/section5-presentation.js#elim",
      question: `只用两次倍加（某行减去另一行的倍数）把矩阵化成上三角。原来的 ${tex("\\det")} 和上三角矩阵的对角线乘积有什么关系？`,
      options: [
        ["相等", true, ""],
        ["差一个负号", false, "只有交换两行才变号；两次倍加不改变 det。"],
        [`还要除以消元用到的系数 ${tex("\\tfrac12")}、${tex("\\tfrac45")}`, false, "倍加的系数不进入账本：倍加让 det 乘 1。"],
        [`上三角矩阵读不出 ${tex("\\det")}`, false, "上三角矩阵的 det 就是对角线乘积。"],
      ],
      right: `✓ 两次倍加都乘 1，所以原 ${tex("\\det")} 就是对角线乘积 ${tex("2\\cdot\\tfrac52\\cdot\\tfrac15=1")}。交换或倍乘时，再按账本里的倍率还原。`,
      onPick: () => { syncLocks(); render(); },
      onReveal: () => render(),
    });
    const free = () => !gate || gate.picked;
    function syncLocks() {
      ["[data-op-next]", "[data-op-demo]"].forEach((selector) => {
        const button = root.querySelector(selector);
        if (free()) {
          if (button.title) { button.disabled = busy; button.removeAttribute("title"); }
          return;
        }
        button.disabled = true;
        button.title = "先在上方猜一猜";
      });
    }

    function isUpperTriangular(value) {
      for (let row = 1; row < value.length; row += 1) {
        for (let col = 0; col < row; col += 1) {
          if (Math.abs(value[row][col]) > 1e-8) return false;
        }
      }
      return true;
    }

    function snapshot() {
      history.push({ matrix: M().cloneMat(matrix), factor, ledger: ledger.slice(), focus: { ...focus } });
    }

    function setBusy(value) {
      busy = value;
      root.querySelectorAll("button").forEach((button) => {
        if (!button.matches("[data-op-undo]")) button.disabled = value;
      });
      root.querySelector("[data-op-undo]").disabled = value || history.length === 0;
      if (!value) {
        root.querySelectorAll("[data-op-next], [data-op-demo]").forEach((button) => button.removeAttribute("title"));
        syncLocks();
        syncZeros();
      }
    }

    // the stepper names the entry it zeroes next; once upper triangular there is nothing left
    function nextTarget() {
      if (Math.abs(matrix[1][0]) > M().EPS) return "first";
      if (Math.abs(matrix[2][1]) > M().EPS) return "second";
      return null;
    }
    function syncZeros() {
      const next = root.querySelector("[data-op-next]");
      const target = nextTarget();
      next.innerHTML = target === "first" ? `下一步：消去 ${tex("a_{21}")}` : target === "second" ? `下一步：消去 ${tex("a_{32}")}` : "已是上三角";
      if (busy || !free()) return;
      next.disabled = !target;
    }

    // arrow from the pivot (row focus.col) to the entry being zeroed (row focus.row)
    function drawPivotArrow(triangular) {
      const svg = root.querySelector("[data-pivot-arrow]");
      const wrap = svg?.parentElement;
      if (!svg || !wrap) return;
      const pivot = root.querySelector(`[data-mat-table] tr:nth-child(${focus.col + 1}) td:nth-child(${focus.col + 1})`);
      const target = root.querySelector(`[data-mat-table] tr:nth-child(${focus.row + 1}) td:nth-child(${focus.col + 1})`);
      if (triangular || !pivot || !target || !free()) {
        svg.innerHTML = "";
        return;
      }
      const box = wrap.getBoundingClientRect();
      const a = pivot.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      // start and end just outside the left bracket of the matrix
      const edge = root.querySelector("[data-mat-table]").getBoundingClientRect().left - box.left - 6;
      const x1 = edge;
      const y1 = a.top - box.top + a.height / 2;
      const x2 = edge;
      const y2 = b.top - box.top + b.height / 2;
      const bend = Math.max(22, (y2 - y1) * 0.4);
      const coefficient = Math.abs(matrix[focus.col][focus.col]) > M().EPS ? matrix[focus.row][focus.col] / matrix[focus.col][focus.col] : 0;
      svg.setAttribute("width", String(box.width));
      svg.setAttribute("height", String(box.height));
      svg.innerHTML = `<defs><marker id="ch2-pivot-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" /></marker></defs>
        <path class="ch2-pivot-path" d="M${x1} ${y1} C ${x1 - bend} ${y1}, ${x2 - bend} ${y2}, ${x2 - 3} ${y2}" marker-end="url(#ch2-pivot-head)" />
        <text class="ch2-pivot-text" x="${Math.max(4, x1 - bend * 0.75 - 6)}" y="${(y1 + y2) / 2 + 4}" text-anchor="end">×(−${frac(coefficient).text})</text>`;
    }

    function render({ pulse = false } = {}) {
      const table = root.querySelector("[data-mat-table]");
      table.innerHTML = matrix.map((row, rowIndex) => `<tr>${row.map((value, colIndex) => {
        const classes = [
          pulse && rowIndex === focus.row ? "is-updated" : "",
          rowIndex === focus.row && colIndex === focus.col ? "is-target" : "",
          rowIndex === focus.col && colIndex === focus.col ? "is-pivot" : "",
          rowIndex > colIndex && Math.abs(value) < M().EPS ? "is-zero-entry" : "",
        ].filter(Boolean).join(" ");
        return `<td class="${classes}">${tex(frac(value).tex.replace("\\tfrac", "\\dfrac"))}</td>`;
      }).join("")}</tr>`).join("");
      if (pulse && !M().reducedMotion()) setTimeout(() => table.querySelectorAll("td").forEach((cell) => cell.classList.remove("is-updated")), 420);
      const current = M().determinant(matrix);
      const original = Math.abs(factor) < M().EPS ? NaN : current / factor;
      // the determinants answer the prediction: they appear once it is checked
      const open = !gate || gate.revealed;
      root.querySelector("[data-cur]").textContent = open ? frac(current).text : "?";
      root.querySelector("[data-factor]").textContent = frac(factor).text;
      root.querySelector("[data-orig]").textContent = open ? frac(original).text : "?";
      root.querySelector("[data-step-count]").textContent = String(ledger.length);
      const triangular = isUpperTriangular(matrix);
      const status = root.querySelector("[data-triangle-status]");
      status.innerHTML = triangular ? `已经是上三角：对角线乘积 ${tex(`${frac(matrix[0][0]).tex}\\cdot${frac(matrix[1][1]).tex}\\cdot${frac(matrix[2][2]).tex}=${frac(matrix[0][0] * matrix[1][1] * matrix[2][2]).tex}`)}` : "尚未形成上三角；继续制造主对角线下方的零。";
      if (triangular && Math.abs(factor - 1) < 1e-9 && ledger.length) gate?.acted();
      status.className = triangular ? "ch2-note is-positive" : "ch2-note";
      root.querySelector("[data-ledger]").innerHTML = ledger.length ? ledger.map((line) => `<li>${line}</li>`).join("") : "<li>起点：累计倍率 1</li>";
      root.querySelector("[data-current-operation]").innerHTML = triangular
        ? "三角化完成：现在只需读取主对角线乘积，并按账本还原原值。"
        : focus.text;
      root.querySelector("[data-op-undo]").disabled = busy || history.length === 0;
      syncZeros();
      drawPivotArrow(triangular);
    }

    async function apply(next, multiplier, line, nextFocus, allowBusy = false) {
      if (busy && !allowBusy) return;
      snapshot();
      matrix = next;
      factor *= multiplier;
      ledger.push(line);
      if (nextFocus) focus = nextFocus;
      render({ pulse: true });
      if (!M().reducedMotion()) await new Promise((resolve) => setTimeout(resolve, 260));
    }

    const operations = {
      swap: (allowBusy = false) => apply([matrix[1].slice(), matrix[0].slice(), matrix[2].slice()], -1, `${tex("R_1\\leftrightarrow R_2")}　累计倍率 ${tex("\\times(-1)")}`, { row: 1, col: 0, text: "交换改变了定向；继续选择主元并制造第一个零。" }, allowBusy),
      scale: (allowBusy = false) => {
        const next = M().cloneMat(matrix);
        next[1] = next[1].map((value) => value * 2);
        return apply(next, 2, `${tex("R_2\\leftarrow 2R_2")}　累计倍率 ${tex("\\times2")}`, { row: 1, col: 0, text: "整行倍乘会缩放行列式；账本已经记下倍率 2。" }, allowBusy);
      },
      eliminateFirst: (allowBusy = false) => {
        const next = M().cloneMat(matrix);
        if (Math.abs(next[0][0]) < M().EPS || Math.abs(next[1][0]) < M().EPS) return Promise.resolve();
        const coefficient = next[1][0] / next[0][0];
        next[1] = next[1].map((value, col) => value - coefficient * next[0][col]);
        return apply(next, 1, `${tex(`R_2\\leftarrow R_2-${frac(coefficient).tex}R_1`)}　${tex("\\times1")}`, { row: 2, col: 1, text: `第一个零已出现；接着利用新的第 2 行消去 ${tex("a_{32}")}。` }, allowBusy);
      },
      eliminateSecond: (allowBusy = false) => {
        const next = M().cloneMat(matrix);
        if (Math.abs(next[1][1]) < M().EPS || Math.abs(next[2][1]) < M().EPS) return Promise.resolve();
        const coefficient = next[2][1] / next[1][1];
        next[2] = next[2].map((value, col) => value - coefficient * next[1][col]);
        return apply(next, 1, `${tex(`R_3\\leftarrow R_3-${frac(coefficient).tex}R_2`)}　${tex("\\times1")}`, { row: 2, col: 1, text: "第二个零已出现，矩阵已经成为上三角。" }, allowBusy);
      },
    };

    root.querySelector("[data-op-swap]").addEventListener("click", () => operations.swap(), { signal });
    root.querySelector("[data-op-scale]").addEventListener("click", () => operations.scale(), { signal });
    root.querySelector("[data-op-next]").addEventListener("click", () => {
      const target = nextTarget();
      if (target === "first") operations.eliminateFirst();
      else if (target === "second") operations.eliminateSecond();
    }, { signal });
    root.querySelector("[data-op-undo]").addEventListener("click", () => {
      if (busy || !history.length) return;
      const previous = history.pop();
      matrix = previous.matrix;
      factor = previous.factor;
      focus = previous.focus;
      ledger.splice(0, ledger.length, ...previous.ledger);
      render({ pulse: true });
    }, { signal });
    root.querySelector("[data-op-reset]").addEventListener("click", () => {
      if (busy) return;
      matrix = M().cloneMat(initial);
      factor = 1;
      ledger.length = 0;
      history.length = 0;
      focus = { row: 1, col: 0, text: `先利用第 1 行，把 ${tex("a_{21}")} 消成 0。` };
      render({ pulse: true });
    }, { signal });
    root.querySelector("[data-op-demo]").addEventListener("click", async () => {
      if (busy) return;
      matrix = M().cloneMat(initial);
      factor = 1;
      ledger.length = 0;
      history.length = 0;
      render({ pulse: true });
      setBusy(true);
      try {
        await operations.eliminateFirst(true);
        await operations.eliminateSecond(true);
      } finally {
        setBusy(false);
        render();
      }
    }, { signal });

    window.addEventListener("resize", () => drawPivotArrow(isUpperTriangular(matrix)), { signal, passive: true });
    render();
    syncLocks();
    return () => controller.abort();
  }

  defineChapter2Renderer("determinant-computation", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "计算从识别结构开始",
        "定义说明行列式是什么，性质决定怎样高效计算。每一步操作都要同时回答两个问题：它能制造什么结构，它对行列式乘了多少。",
        module("01", "策略优先级", "先减少非零结构，再选择终点。", `
          <div class="ch2-card-grid">
            <article class="ch2-card"><span class="kicker">读结构</span><h4>零、因子、相似行列</h4><p>先观察矩阵已经提供了哪些捷径。</p></article>
            <article class="ch2-card"><span class="kicker">制造零</span><h4>倍加保持 ${tex("\\det")}</h4><p>用消元把主对角线下方或某一展开方向清空。</p></article>
            <article class="ch2-card"><span class="kicker">抵达终点</span><h4>三角或零多展开</h4><p>三角形读对角线，零多行列只算少量余子式。</p></article>
          </div>
        `) + module("02", "倍率账本", "当前值与原值之间始终保留可验证关系。", proofSteps([
          "交换：当前行列式乘 −1。",
          `一行整体倍乘 ${tex("\\lambda")}：当前行列式乘 ${tex("\\lambda")}。`,
          "倍加：当前行列式保持不变。",
          "终点求出当前值后，用累计倍率恢复原行列式。",
        ]) + misconception([
          "只有三角矩阵才能直接读取主对角线乘积。",
          "计算路线可以不同；账本完整时结果应一致。",
        ])),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>造零路线 · 两步到上三角</h3></div>
          <div data-elim-gate></div>
          <p class="ch2-lab-hint">按“下一步”逐个消去主对角线下方的元：箭头从主元指向要消去的元，旁边写着所乘的倍数。形成上三角后，读对角线乘积。</p>
          <div class="ch2-lab-grid ch2-elimination-layout">
            <div class="ch2-matrix-box">
              <div class="ch2-pivot-wrap"><table class="ch2-matrix-table is-static" data-mat-table aria-label="三阶计算策略矩阵"></table><svg class="ch2-pivot-arrow" data-pivot-arrow aria-hidden="true"></svg></div>
              <div class="ch2-operation-line"><span>当前目标</span><strong data-current-operation></strong></div>
              <div class="ch2-toolbar">
                <button type="button" class="is-primary" data-op-next>下一步：消去 ${tex("a_{21}")}</button>
                <button type="button" data-op-undo>上一步</button>
                <button type="button" data-op-demo>自动播放</button>
                <button type="button" data-op-reset>重置</button>
              </div>
              <div class="ch2-toolbar ch2-elim-compare"><span>对照：别的行变换怎样改 ${tex("\\det")}</span>
                <button type="button" data-op-swap>交换 ${tex("R_1")}、${tex("R_2")}</button>
                <button type="button" data-op-scale>${tex("R_2\\times2")}</button>
              </div>
            </div>
            <div class="ch2-side">
              <div class="ch2-meter is-2">
                <div class="ch2-meter-card"><strong>当前 ${tex("\\det")}</strong><span data-cur></span></div>
                <div class="ch2-meter-card"><strong>累计倍率</strong><span data-factor></span></div>
                <div class="ch2-meter-card"><strong>原 ${tex("\\det")}</strong><span data-orig></span></div>
                <div class="ch2-meter-card"><strong>步骤数</strong><span data-step-count></span></div>
              </div>
              <div data-triangle-status class="ch2-note"></div>
              <div class="ch2-ledger"><strong>操作账本</strong><ol data-ledger></ol></div>
            </div>
          </div>
        </div>`;
      return mountStrategy(root);
    },
  });

})();


;/* visuals/ch2/section6-presentation.js */
(() => {
  const { M, tex, display, aEntry, formalShell, module, proofSteps, misconception } = window.Ch2PresentationUtils;

  function mountCofactor(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const matrix = [[1, 2, 0], [0, 3, 0], [4, 5, 6]];
    let active = { row: 1, col: 1 };
    let route = { type: "row", index: 1 };
    const gate = window.LAPredictGate?.mount(root.querySelector("[data-cof-gate]"), {
      root: root.querySelector(".ch2-lab"),
      manual: true,
      key: "visuals/ch2/section6-presentation.js#row2",
      question: `第 2 行是 ${tex("(0,3,0)")}。按第 2 行展开时，真正要算几个 2 阶余子式？`,
      options: [
        [`1 个：只有 ${tex("a_{22}")} 不为 0`, true, ""],
        ["3 个：每个元素一个", false, "零元素那一项是 0×C=0，它的余子式不必算。"],
        [`0 个：这一行有 0，${tex("\\det")} 就是 0`, false, "一行里有 0 只消去对应的项；a₂₂C₂₂=3×6=18 仍要算。"],
        ["2 个：两个 0 各算一个", false, "要算的是非零元素的余子式；两个 0 的项直接为 0。"],
      ],
      right: `✓ 两个零块直接为 0，只剩一块：${tex("\\det A=a_{22}C_{22}=3\\times6=18")}。展开时挑零最多的行或列。`,
      onPick: () => render(),
      onReveal: () => render(),
    });
    const open = () => !gate || gate.revealed;

    function cofactor(row, col) {
      const minor = M().minorMatrix(matrix, row, col);
      const minorValue = M().det2(minor);
      const sign = (row + col) % 2 === 0 ? 1 : -1;
      return { minor, minorValue, sign, value: sign * minorValue };
    }

    function expansion(type, index) {
      const allItems = [];
      let total = 0;
      for (let cursor = 0; cursor < 3; cursor += 1) {
        const row = type === "row" ? index : cursor;
        const col = type === "row" ? cursor : index;
        const element = matrix[row][col];
        const cof = cofactor(row, col);
        const contribution = element * cof.value;
        allItems.push({ row, col, element, ...cof, contribution });
        total += contribution;
      }
      return {
        allItems,
        items: allItems.filter((item) => Math.abs(item.element) > M().EPS),
        total,
      };
    }

    function renderMatrix() {
      const table = root.querySelector("[data-cof-table]");
      const cut = root.querySelector("[data-cut-matrix]");
      cut.style.setProperty("--cut-row", `${(active.row + 0.5) * 33.333}%`);
      cut.style.setProperty("--cut-col", `${(active.col + 0.5) * 33.333}%`);
      table.innerHTML = matrix.map((row, rowIndex) => `<tr>${row.map((value, colIndex) => {
        const deleted = rowIndex === active.row || colIndex === active.col;
        const selected = rowIndex === active.row && colIndex === active.col;
        return `<td class="${selected ? "is-selected" : ""}${deleted ? " is-deleted" : ""}"><button type="button" data-r="${rowIndex}" data-c="${colIndex}" aria-label="选择第 ${rowIndex + 1} 行第 ${colIndex + 1} 列元素">${value}</button></td>`;
      }).join("")}</tr>`).join("");
      table.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          active = { row: Number(button.dataset.r), col: Number(button.dataset.c) };
          render();
        }, { signal });
      });
    }

    function renderRoutes() {
      const routes = [];
      for (const type of ["row", "col"]) {
        for (let index = 0; index < 3; index += 1) {
          const result = expansion(type, index);
          routes.push({ type, index, cost: result.items.length });
        }
      }
      const container = root.querySelector("[data-route-list]");
      // before the prediction the routes are locked and their counts hidden
      const locked = gate && !gate.picked;
      container.innerHTML = routes.map((item) => `<button type="button" class="${open() && route.type === item.type && route.index === item.index ? "is-active" : ""}" data-route-type="${item.type}" data-route-index="${item.index}" ${locked ? 'disabled title="先在上方猜一猜"' : ""}>${item.type === "row" ? `第 ${item.index + 1} 行` : `第 ${item.index + 1} 列`}${open() ? ` · ${item.cost} 个非零项` : ""}</button>`).join("");
      container.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          route = { type: button.dataset.routeType, index: Number(button.dataset.routeIndex) };
          // the question is about row 2: only that route judges the guess; other routes keep it
          if (route.type === "row" && route.index === 1) gate?.acted();
          render();
        }, { signal });
      });
    }

    // one tile a_ij × C_ij per entry of the route; tiles of zero entries are greyed
    function renderExpansionTiles(result) {
      const tiles = result.allItems.map((item) => {
        const zero = Math.abs(item.element) <= M().EPS;
        const c = `C_{${item.row + 1}${item.col + 1}}`;
        return `<figure class="ch2-cof-tile${zero ? " is-zero" : ""}">
          <span>${aEntry(item.row + 1, item.col + 1)}${tex(`\\times`)}${tex(c)}</span>
          <strong>${zero ? tex(`0\\times ${c}=0`) : tex(`${M().formatNum(item.element, 3)}\\times${item.value < 0 ? `(${M().formatNum(item.value, 3)})` : M().formatNum(item.value, 3)}=${M().formatNum(item.contribution, 3)}`)}</strong>
          <small>${zero ? "不必算余子式" : `要算 ${tex(`M_{${item.row + 1}${item.col + 1}}`)}`}</small>
        </figure>`;
      });
      return `${tiles.join('<b class="ch2-cof-op">+</b>')}<b class="ch2-cof-op">=</b><figure class="ch2-cof-tile is-sum"><span>${tex("\\det A")}</span><strong>${tex(M().formatNum(result.total, 3))}</strong></figure>`;
    }

    /*
     * The six terms of the 3-order determinant, sgn(p)·a₁ₚ₁a₂ₚ₂a₃ₚ₃ in lexicographic order. The two
     * terms that contain the selected a_ij share that factor; what is left is (−1)^{i+j}M_ij = C_ij.
     */
    const PERMS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
    const permSign = (p) => {
      let inv = 0;
      for (let i = 0; i < 3; i += 1) for (let j = i + 1; j < 3; j += 1) if (p[i] > p[j]) inv += 1;
      return inv % 2 ? -1 : 1;
    };
    const sub = (r, c) => `a_{${r + 1}${c + 1}}`;
    function renderLeibniz() {
      // the six-term panel explains the answer, so it opens with the verdict
      const panel = root.querySelector("[data-leibniz]");
      panel.hidden = !open();
      if (!open()) return;
      const { row: i, col: j } = active;
      const terms = PERMS.map((p) => ({
        p,
        sign: permSign(p),
        hit: p[i] === j,
        value: permSign(p) * p.reduce((acc, c, r) => acc * matrix[r][c], 1),
      }));
      const tiles = terms.map((t, k) => `<figure class="ch2-leib-term${t.hit ? " is-hit" : ""}">
          <span>${tex(`${t.sign > 0 ? (k ? "+" : "") : "-"}${t.p.map((c, r) => sub(r, c)).join("")}`)}</span>
          <small>${tex(M().formatNum(t.value, 3))}</small>
        </figure>`).join("");
      // the two hits with a_ij taken out
      const hits = terms.filter((t) => t.hit);
      const rest = (t) => t.p.map((c, r) => (r === i ? "" : sub(r, c))).join("");
      const inner = hits.map((t, k) => `${t.sign > 0 ? (k ? "+" : "") : "-"}${rest(t)}`).join("");
      const rows = [0, 1, 2].filter((r) => r !== i);
      const cols = [0, 1, 2].filter((c) => c !== j);
      const minor = `${sub(rows[0], cols[0])}${sub(rows[1], cols[1])}-${sub(rows[0], cols[1])}${sub(rows[1], cols[0])}`;
      const ij = `${i + 1}${j + 1}`;
      const selected = cofactor(i, j);
      const sum = hits.reduce((acc, t) => acc + t.value, 0);
      root.querySelector("[data-leibniz]").innerHTML = `
        <p class="ch2-leib-title">${tex("\\det A")} 的 6 项中，含 ${tex(sub(i, j))} 的恰好 2 项</p>
        <div class="ch2-leib-terms">${tiles}</div>
        <p class="ch2-leib-factor">${tex(`${sub(i, j)}\\bigl(${inner}\\bigr)=(-1)^{${i + 1}+${j + 1}}\\,${sub(i, j)}\\bigl(${minor}\\bigr)=${sub(i, j)}\\,C_{${ij}}`)}</p>
        <p class="ch2-leib-value">括号里正是 ${tex(`M_{${ij}}`)} 的两项，符号为 ${tex(`(-1)^{${i + 1}+${j + 1}}=${selected.sign > 0 ? "+1" : "-1"}`)}；这两项之和为 ${tex(`${M().formatNum(matrix[i][j], 3)}\\times${selected.value < 0 ? `(${M().formatNum(selected.value, 3)})` : M().formatNum(selected.value, 3)}=${M().formatNum(sum, 3)}`)}。</p>`;
    }

    function render() {
      renderMatrix();
      renderLeibniz();
      renderRoutes();
      const selected = cofactor(active.row, active.col);
      root.querySelector("[data-pos]").innerHTML = aEntry(active.row + 1, active.col + 1);
      root.querySelector("[data-mij]").textContent = M().formatNum(selected.minorValue, 3);
      root.querySelector("[data-sign]").textContent = selected.sign > 0 ? "+1" : "−1";
      root.querySelector("[data-cij]").textContent = M().formatNum(selected.value, 3);
      root.querySelector("[data-minor-table]").innerHTML = selected.minor
        .map((line) => `<tr>${line.map((value) => `<td>${value}</td>`).join("")}</tr>`)
        .join("");
      root.querySelector("[data-cut-label]").textContent = `删去第 ${active.row + 1} 行与第 ${active.col + 1} 列`;
      root.querySelectorAll("[data-board] span").forEach((span, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        span.classList.toggle("is-active", row === active.row && col === active.col);
      });
      const result = expansion(route.type, route.index);
      const omitted = result.allItems.length - result.items.length;
      root.querySelector("[data-route-title]").textContent = route.type === "row" ? `沿第 ${route.index + 1} 行展开` : `沿第 ${route.index + 1} 列展开`;
      const explorer = root.querySelector("[data-route-reading]");
      explorer.hidden = !open();
      const wait = root.querySelector("[data-route-wait]");
      wait.hidden = open();
      if (!open()) {
        wait.textContent = gate?.picked && !(route.type === "row" && route.index === 1)
          ? "题目问的是第 2 行：点「第 2 行」，看它的各项怎样相加。"
          : "猜好之后，点「第 2 行」，看它的各项怎样相加。";
      }
      if (open()) {
        root.querySelector("[data-expand]").innerHTML = renderExpansionTiles(result);
        root.querySelector("[data-cost]").textContent = `${result.items.length} 个非零余子式`;
        root.querySelector("[data-omitted]").textContent = omitted ? `${omitted} 个零元素的项直接为 0。` : "本路线没有零元素可省。";
      }
      M().pulseClass(root.querySelector("[data-cij-card]"));
    }

    const board = root.querySelector("[data-board]");
    board.innerHTML = Array.from({ length: 9 }, (_, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const plus = (row + col) % 2 === 0;
      return `<span class="${plus ? "plus" : "minus"}">${plus ? "+" : "−"}</span>`;
    }).join("");
    render();
    return () => controller.abort();
  }

  defineChapter2Renderer("cofactor-expansion", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "从删行删列到按行列展开",
        "三个对象要严格区分：余子矩阵是矩阵，余子式是它的行列式，代数余子式再加入位置符号。",
        module("01", "代数余子式", "位置符号把每条低阶路径接回原排列符号。", `
          <div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">余子矩阵</span><strong>删去第 ${tex("i")} 行与第 ${tex("j")} 列</strong><p>得到一个 ${tex("(n-1)")} 阶矩阵。</p></article>
            <article class="ch2-def"><span class="kicker">余子式</span><strong>${tex("M_{ij}")}</strong><p>对余子矩阵取行列式，结果是标量。</p></article>
            <article class="ch2-def"><span class="kicker">代数余子式</span><strong>${tex("C_{ij}=(-1)^{i+j}M_{ij}")}</strong><p>棋盘符号由 ${tex("i+j")} 的奇偶决定。</p></article>
          </div>
        `) + module("02", "展开公式与路线选择", "结果固定，计算量由所选方向决定。", `
          <div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">按第 ${tex("i")} 行</span><strong>${display("\\det(A)=\\sum_{j=1}^{n}a_{ij}C_{ij}")}</strong><p>第 ${tex("i")} 行中的每个元素与对应代数余子式配对。</p></article>
            <article class="ch2-def"><span class="kicker">按第 ${tex("j")} 列</span><strong>${display("\\det(A)=\\sum_{i=1}^{n}a_{ij}C_{ij}")}</strong><p>优先选择零多的方向，减少需要计算的低阶行列式。</p></article>
          </div>
        `) + module("03", "交叉恒等式为什么等于零", "把一行复制到另一行，再沿被替换行展开。", proofSteps([
          `固定两行 ${tex("r\\ne s")}，考虑和 ${tex("\\sum_j a_{rj}C_{sj}")}。`,
          `构造一个新行列式：把原矩阵第 ${tex("s")} 行替换成第 ${tex("r")} 行，其余行保持不变。`,
          `沿新矩阵第 ${tex("s")} 行展开，得到的正是 ${tex("\\sum_j a_{rj}C_{sj}")}。`,
          `新矩阵的第 ${tex("r")}、${tex("s")} 行相同，所以其行列式为 0，交叉和也等于 0。`,
        ]) + misconception([
          `棋盘符号帮助记忆，定义仍是 ${tex("(-1)^{i+j}")}。`,
          "一行中出现零只会消去相应项，不会自动使整个行列式为零。",
          "展开式中的负贡献应作为独立带符号项读取，不能把‘+ −’当作新的运算规则。",
        ])),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>余子式 · 删去一行与一列</h3></div>
          <div data-cof-gate></div>
          <p class="ch2-lab-hint">点击元素后，横线与竖线划去对应行列；剩余元素保持相对位置组成余子矩阵。</p>
          <div class="ch2-lab-grid ch2-cofactor-top">
            <div class="ch2-matrix-box ch2-cofactor-visual">
              <div class="ch2-cut-matrix" data-cut-matrix>
                <table class="ch2-matrix-table" data-cof-table aria-label="余子式选择矩阵"></table>
                <i class="ch2-cut-line is-row" aria-hidden="true"></i>
                <i class="ch2-cut-line is-col" aria-hidden="true"></i>
              </div>
              <div class="ch2-cofactor-arrow" aria-hidden="true">→</div>
              <div class="ch2-minor-result">
                <span>剩余元素保持相对位置</span>
                <table class="ch2-matrix-table ch2-minor-table" data-minor-table aria-label="余子矩阵"></table>
              </div>
              <strong class="ch2-cut-label" data-cut-label></strong>
              <div class="ch2-sign-board"><span>位置符号</span><div class="ch2-checkerboard" data-board aria-label="代数余子式符号棋盘"></div></div>
            </div>
            <div class="ch2-side">
              <div class="ch2-meter is-2">
                <div class="ch2-meter-card"><strong>选中</strong><span data-pos></span></div>
                <div class="ch2-meter-card"><strong>${tex("M_{ij}")}</strong><span data-mij></span></div>
                <div class="ch2-meter-card"><strong>位置符号</strong><span data-sign></span></div>
                <div class="ch2-meter-card" data-cij-card><strong>${tex("C_{ij}")}</strong><span data-cij></span></div>
              </div>
              <div class="ch2-note">先在左侧任选元素，读取“余子矩阵 → 余子式 → 代数余子式”的对应关系。</div>
            </div>
          </div>
          <div class="ch2-leibniz" data-leibniz aria-live="polite"></div>
          <div class="ch2-route-explorer">
            <div class="ch2-presets ch2-route-list" data-route-list></div>
            <div class="ch2-note" data-route-wait>猜好之后，点「第 2 行」，看它的各项怎样相加。</div>
            <div class="ch2-note" data-route-reading hidden><strong data-route-title></strong> · <span data-cost></span><div class="ch2-cof-tiles" data-expand></div><span data-omitted></span></div>
          </div>
        </div>`;
      return mountCofactor(root);
    },
  });
})();


;/* visuals/ch2/section7-presentation.js */
(() => {
  const { M, tex, display, formalShell, module, proofSteps, misconception } = window.Ch2PresentationUtils;

  const KEYS = ["a11", "a12", "a21", "a22", "b1", "b2"];
  const PRESETS = {
    ex: { a11: 2, a12: 1, a21: 1, a22: 3, b1: 5, b2: 5 },
    // a₂ leans one tenth off a₁: D = 1/10, x = (1, 2); b₂ − 1/10 sends x to (3, 1)
    near: { a11: 1, a12: 2, a21: 1, a22: 2.1, b1: 5, b2: 5.2 },
    sing: { a11: 1, a12: 2, a21: 2, a22: 4, b1: 3, b2: 6 },
    none: { a11: 1, a12: 2, a21: 2, a22: 4, b1: 1, b2: 0 },
  };
  // stretch factors for the lens; the tag reads "厚度 ×N"
  const STRETCH = [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
  const FONT = "'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";

  /* every value sits on the 0.1 grid of the sliders, so tenths are exact integers */
  const tenths = (value) => Math.round(Number(value) * 10);
  const gcd = (a, b) => {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) [x, y] = [y, x % y];
    return x || 1;
  };
  // the exact fraction n/d (integers) as plain text and as TeX
  function ratio(n, d) {
    const num = d < 0 ? -n : n;
    const den = Math.abs(d);
    if (num === 0) return { text: "0", tex: "0" };
    const g = gcd(num, den);
    const p = Math.abs(num) / g;
    const q = den / g;
    const sign = num < 0;
    return {
      text: `${sign ? "−" : ""}${q === 1 ? p : `${p}/${q}`}`,
      tex: `${sign ? "-" : ""}${q === 1 ? p : `\\tfrac{${p}}{${q}}`}`,
    };
  }
  const add = (p, q) => [p[0] + q[0], p[1] + q[1]];

  /* exact readouts and decisions (D, D₁, D₂ are integers in hundredths) */
  function exact(s) {
    const t = Object.fromEntries(KEYS.map((key) => [key, tenths(s[key])]));
    const D = t.a11 * t.a22 - t.a12 * t.a21;
    const D1 = t.b1 * t.a22 - t.a12 * t.b2;
    const D2 = t.a11 * t.b2 - t.b1 * t.a21;
    let kind = "unique";
    if (D === 0) {
      const column = t.a11 || t.a21 ? [t.a11, t.a21] : [t.a12, t.a22];
      if (!column[0] && !column[1]) kind = t.b1 || t.b2 ? "none" : "infinite";
      else kind = column[0] * t.b2 - column[1] * t.b1 === 0 ? "infinite" : "none";
    }
    // a thin parallelogram: the sine of the angle between the columns is below 0.06 (display only)
    const near = D !== 0 && Math.abs(D) < 0.06 * Math.hypot(t.a11, t.a21) * Math.hypot(t.a12, t.a22);
    return { t, D, D1, D2, kind, near };
  }

  /* floating-point geometry for drawing (also used while the canvas animates) */
  function geometry(s) {
    const a1 = [s.a11, s.a21];
    const a2 = [s.a12, s.a22];
    const b = [s.b1, s.b2];
    const D = s.a11 * s.a22 - s.a12 * s.a21;
    const solvable = Math.abs(D) > 1e-9;
    const x1 = solvable ? (s.b1 * s.a22 - s.a12 * s.b2) / D : null;
    return { a1, a2, b, D, x1, land: solvable ? [x1 * a1[0], x1 * a1[1]] : null };
  }

  /* lens coordinates: a₁ laid flat along x, the height across a₁ drawn N times taller */
  function lensOf(g) {
    const length = Math.hypot(g.a1[0], g.a1[1]);
    const u = [g.a1[0] / length, g.a1[1] / length];
    const along = (p) => p[0] * u[0] + p[1] * u[1];
    const across = (p) => u[0] * p[1] - u[1] * p[0];
    const ends = [0, along(g.a1), along(g.a2), along(add(g.a1, g.a2))];
    const span = Math.max(...ends) - Math.min(...ends);
    const need = (0.3 * span) / (Math.abs(g.D) / length);
    const N = STRETCH.find((value) => value >= need) || STRETCH[STRETCH.length - 1];
    return { N, to: (p) => [along(p), N * across(p)] };
  }

  const lensPoints = (g) => [[0, 0], g.a1, g.a2, add(g.a1, g.a2), g.b, ...(g.land ? [g.land] : [])];

  function dot(ctx, point, color, palette, radius = 3.4) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = palette.paper;
    ctx.stroke();
    ctx.restore();
  }

  function label(ctx, text, x, y, palette, align = "left", size = 12) {
    ctx.save();
    ctx.font = `600 ${size}px ${FONT}`;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.strokeStyle = palette.paper;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = palette.text;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function mountCramer(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const lab = root.querySelector(".ch2-lab");
    const canvas = root.querySelector("[data-cramer-canvas]");
    const nudge = root.querySelector("[data-cramer-nudge]");
    const state = { ...PRESETS.near }; // the prediction is about this example
    let shown = { ...state }; // what the canvas draws; it lerps while animating
    let ghost = null; // the state just before the last change of b (same a₁, a₂)
    let frame = null; // while only b slides: the fixed pair of states that sets camera and lens
    let dragging = false;
    let animating = false;

    const gate = window.LAPredictGate?.mount(root.querySelector("[data-cramer-gate]"), {
      root: lab,
      manual: true,
      key: "visuals/ch2/section7-presentation.js#near",
      question: `图中 ${tex("a_1")}、${tex("a_2")} 几乎平行，${tex("D")} 很小但不为 0。让 ${tex("b_2")} 只减小 1/10，解 ${tex("x_1")}、${tex("x_2")} 会怎样？`,
      options: [
        ["仍是唯一解，但变化很大", true, ""],
        ["仍是唯一解，只变化一点点", false, "放大框里，b 只挪了一点，沿 a₂ 滑回 a₁ 所在直线的落点 x₁a₁ 却移出一大段。"],
        ["变成无解", false, "D≠0 时，a₁、a₂ 能组合出平面上的任何 b，解一定存在。"],
        ["变成无穷多解", false, "无穷多解要求 D=0；D≠0 时只有一组 x₁、x₂。"],
      ],
      right: `✓ ${tex("D\\ne0")}，解仍唯一。${tex("a_2")} 几乎与 ${tex("a_1")} 平行，${tex("b")} 要沿 ${tex("a_2")} 走很远才能滑回 ${tex("a_1")} 所在直线，所以 ${tex("b")} 稍一挪动，落点 ${tex("x_1a_1")} 就移出一大段。${tex("x_i=D_i/D")} 的分母越小，解对 ${tex("b")} 越敏感。`,
      onPick: () => render(),
      onReveal: () => render(),
    });
    const picked = () => !gate || gate.picked;
    const revealed = () => !gate || gate.revealed;

    function matrixHtml(matrix) {
      // matrix entries use full-size fractions so they read at the same size as the integers
      const e = (value) => ratio(value, 10).tex.replace("\\tfrac", "\\dfrac");
      const gap = [matrix[0][0], matrix[0][1], matrix[1][0], matrix[1][1]].some((v) => v % 10) ? "[4pt]" : "";
      return tex(`\\begin{bmatrix}${e(matrix[0][0])}&${e(matrix[0][1])}\\\\${gap}${e(matrix[1][0])}&${e(matrix[1][1])}\\end{bmatrix}`);
    }

    function cameraFor(states) {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width || 520);
      const height = Math.max(1, rect.height || 340);
      const points = [[0, 0], [1, 0], [0, 1], [1, 1]];
      states.forEach((s) => {
        const g = geometry(s);
        points.push(g.a1, g.a2, add(g.a1, g.a2), g.b, add(g.b, g.a2));
        if (g.land && Math.abs(g.x1) <= 12) points.push(g.land, add(g.land, g.a2));
      });
      const minX = Math.min(...points.map((point) => point[0]), -0.5);
      const maxX = Math.max(...points.map((point) => point[0]), 0.5);
      const minY = Math.min(...points.map((point) => point[1]), -0.5);
      const maxY = Math.max(...points.map((point) => point[1]), 0.5);
      const pad = 34;
      const scale = M().clamp(Math.min((width - pad * 2) / Math.max(1, maxX - minX), (height - pad * 2) / Math.max(1, maxY - minY)), 16, Math.min(width, height) * 0.3);
      return { scale, origin: { x: width * 0.5 - ((minX + maxX) / 2) * scale, y: height * 0.53 + ((minY + maxY) / 2) * scale } };
    }

    /*
     * The lens: a framed box in the emptiest corner. a₁ lies flat, the thickness across a₁
     * is drawn N times larger, so the thin D, the height of b and the slide along a₂ are
     * visible. Parallel lines stay parallel and area ratios (Dᵢ/D) are unchanged.
     */
    function drawLens(ctx, view, palette, g, states, samples) {
      const { width, height } = view;
      const map = (p) => ({ x: view.origin.x + p[0] * view.scale, y: view.origin.y - p[1] * view.scale });
      const lens = lensOf(g);
      const all = states.flatMap((s) => lensPoints(geometry(s)));
      const q = all.map(lens.to);
      const minS = Math.min(...q.map((p) => p[0]));
      const maxS = Math.max(...q.map((p) => p[0]));
      const minT = Math.min(...q.map((p) => p[1]));
      const maxT = Math.max(...q.map((p) => p[1]));
      // the box hugs the stretched figure (uniform scale k), within a size budget;
      // the tag takes the side D leaves empty, the labels of a₁ and x₁a₁ the other side
      const up = g.D > 0;
      const tagH = 16;
      const labelH = 14;
      const padX = 12;
      const padY = 8;
      const extraH = 2 * padY + tagH + labelH;
      const maxW = M().clamp(Math.round(width * 0.5), 150, 250);
      const maxH = M().clamp(Math.round(height * 0.42), 110, 176);
      const k = Math.min((maxW - 2 * padX) / Math.max(1e-6, maxS - minS), (maxH - extraH) / Math.max(1e-6, maxT - minT));
      const boxW = Math.max(130, Math.round((maxS - minS) * k + 2 * padX));
      const boxH = Math.max(76, Math.round((maxT - minT) * k + extraH));
      const m = 10;
      const corners = [
        { x: m, y: m },
        { x: width - m - boxW, y: m },
        { x: width - m - boxW, y: height - m - boxH },
        { x: m, y: height - m - boxH },
      ];
      let box = corners[0];
      let best = Infinity;
      corners.forEach((corner) => {
        const hits = samples.filter((p) => p.x > corner.x - 8 && p.x < corner.x + boxW + 8 && p.y > corner.y - 8 && p.y < corner.y + boxH + 8).length;
        if (hits < best) {
          best = hits;
          box = corner;
        }
      });

      // the strip being magnified, ringed on the main view
      const screen = all.map(map);
      const sLen = Math.hypot(g.a1[0], g.a1[1]);
      const us = { x: g.a1[0] / sLen, y: -g.a1[1] / sLen };
      const ns = { x: -us.y, y: us.x };
      const al = screen.map((p) => p.x * us.x + p.y * us.y);
      const ac = screen.map((p) => p.x * ns.x + p.y * ns.y);
      const pad = 8;
      const halfW = (Math.max(...ac) - Math.min(...ac)) / 2 + pad;
      const halfL = Math.max(halfW, (Math.max(...al) - Math.min(...al)) / 2 + pad);
      const midL = (Math.max(...al) + Math.min(...al)) / 2;
      const midC = (Math.max(...ac) + Math.min(...ac)) / 2;
      const center = { x: us.x * midL + ns.x * midC, y: us.y * midL + ns.y * midC };
      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.rotate(Math.atan2(us.y, us.x));
      ctx.beginPath();
      ctx.moveTo(-(halfL - halfW), -halfW);
      ctx.lineTo(halfL - halfW, -halfW);
      ctx.arc(halfL - halfW, 0, halfW, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(-(halfL - halfW), halfW);
      ctx.arc(-(halfL - halfW), 0, halfW, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.closePath();
      ctx.strokeStyle = palette.axis;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.stroke();
      ctx.restore();

      // dotted leader from that ring to the box
      const boxCenter = { x: box.x + boxW / 2, y: box.y + boxH / 2 };
      const d = { x: boxCenter.x - center.x, y: boxCenter.y - center.y };
      const along = M().clamp(d.x * us.x + d.y * us.y, -(halfL - halfW), halfL - halfW);
      const side = d.x * ns.x + d.y * ns.y < 0 ? -1 : 1;
      const start = { x: center.x + us.x * along + ns.x * side * halfW, y: center.y + us.y * along + ns.y * side * halfW };
      const end = { x: M().clamp(start.x, box.x, box.x + boxW), y: M().clamp(start.y, box.y, box.y + boxH) };
      if (Math.hypot(end.x - start.x, end.y - start.y) > 6) {
        ctx.save();
        ctx.strokeStyle = palette.axis;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.restore();
      }

      const inner = { x: box.x + padX, y: box.y + padY + (up ? tagH : labelH), w: boxW - 2 * padX, h: boxH - extraH };
      const P = (p) => {
        const [s, t] = lens.to(p);
        return { x: inner.x + inner.w / 2 + (s - (minS + maxS) / 2) * k, y: inner.y + inner.h / 2 - (t - (minT + maxT) / 2) * k };
      };

      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(box.x, box.y, boxW, boxH, 6);
      else ctx.rect(box.x, box.y, boxW, boxH);
      ctx.fillStyle = palette.paper;
      ctx.fill();
      ctx.strokeStyle = palette.axis;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.clip();

      // the line of a₁ (where D=0 would squash everything)
      const o = P([0, 0]);
      ctx.save();
      ctx.strokeStyle = palette.axis;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(box.x, o.y);
      ctx.lineTo(box.x + boxW, o.y);
      ctx.stroke();
      ctx.restore();

      // D itself, now thick enough to see
      const corners4 = [[0, 0], g.a1, add(g.a1, g.a2), g.a2].map(P);
      ctx.save();
      ctx.beginPath();
      corners4.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.closePath();
      ctx.fillStyle = palette.image;
      ctx.globalAlpha = 0.14;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = palette.image;
      ctx.lineWidth = 1.4;
      if (g.D < 0) ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.restore();

      // the previous b, its slide and its landing point
      if (ghost) {
        const old = geometry(ghost);
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.setLineDash([5, 4]);
        M().drawArrow(ctx, o, P(old.b), palette.image, 2.2);
        if (old.land) {
          ctx.strokeStyle = palette.image;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(P(old.b).x, P(old.b).y);
          ctx.lineTo(P(old.land).x, P(old.land).y);
          ctx.stroke();
          dot(ctx, P(old.land), palette.image, palette, 3);
        }
        ctx.restore();
      }

      // b slides along a₂ back to the line of a₁ and lands on x₁a₁;
      // the slid parallelogram (x₁a₁, a₂) has the area D₁ = x₁D
      if (g.land) {
        ctx.save();
        ctx.beginPath();
        [[0, 0], g.land, add(g.land, g.a2), g.a2].map(P).forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
        ctx.strokeStyle = palette.muted;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = palette.image;
        ctx.lineWidth = 1.3;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(P(g.b).x, P(g.b).y);
        ctx.lineTo(P(g.land).x, P(g.land).y);
        ctx.stroke();
        ctx.restore();
      }
      M().drawArrow(ctx, o, P(g.a1), palette.v1, 2.2);
      M().drawArrow(ctx, o, P(g.a2), palette.v2, 2.2);
      M().drawArrow(ctx, o, P(g.b), palette.image, 2.4);
      if (g.land) dot(ctx, P(g.land), palette.image, palette);

      // labels: a₁ and x₁a₁ on the side away from D, a₂ and b at their tips
      const away = up ? 12 : -12;
      // labels stay inside the box and out of the tag's strip
      const top = box.y + 9 + (up ? tagH : 0);
      const bottom = box.y + boxH - 9 - (up ? 0 : tagH);
      const fit = (p) => ({ x: M().clamp(p.x, box.x + 14, box.x + boxW - 14), y: M().clamp(p.y, top, bottom) });
      // x₁a₁ near the tip of a₁ (x₁ close to 1): a₁ moves toward the origin, x₁a₁ to the right
      const landX = g.land ? P(g.land).x : null;
      const crowded = landX !== null && Math.abs(landX - (o.x + (P(g.a1).x - o.x) * 0.38)) < 36;
      const a1Mid = fit({ x: o.x + (P(g.a1).x - o.x) * (crowded ? 0.22 : 0.38), y: o.y + away });
      label(ctx, "a₁", a1Mid.x, a1Mid.y, palette, "center", 11.5);
      const a2Tip = fit({ x: P(g.a2).x - 6, y: P(g.a2).y - (up ? 7 : -7) });
      label(ctx, "a₂", a2Tip.x, a2Tip.y, palette, "right", 11.5);
      const bTip = P(g.b);
      label(ctx, "b", M().clamp(bTip.x + 7, box.x + 8, box.x + boxW - 12), M().clamp(bTip.y - (up ? 6 : -6), top, bottom), palette, "left", 11.5);
      if (g.land) {
        const at = fit({ x: crowded ? landX + 4 : landX, y: o.y + away });
        label(ctx, "x₁a₁", crowded ? Math.min(at.x, box.x + boxW - 34) : at.x, at.y, palette, crowded ? "left" : "center", 11.5);
      }
      ctx.restore();

      ctx.save();
      ctx.font = `12px ${FONT}`;
      ctx.fillStyle = palette.muted;
      ctx.textBaseline = "middle";
      ctx.fillText(`a₁ 放平 · 厚度 ×${lens.N}`, box.x + 10, up ? box.y + 13 : box.y + boxH - 11);
      ctx.restore();
    }

    function drawScene() {
      const cur = shown;
      const g = geometry(cur);
      const ex = exact(state);
      // a preset animation changes a₁, a₂ as well: no ghost, no lens until it settles
      const moving = animating && !frame;
      const states = frame ? frame.states : [ghost, cur].filter(Boolean);
      const camera = cameraFor(states);
      const view = M().drawTransformScene(canvas, [[cur.a11, cur.a12], [cur.a21, cur.a22]], {
        firstLabel: "a₁",
        secondLabel: "a₂",
        caption: "实线箭头为 b；虚线显示沿 a₂ 方向滑动",
        ...camera,
      });
      const ctx = canvas.getContext("2d");
      const palette = M().getPalette();
      const map = (vector) => ({ x: view.origin.x + vector[0] * view.scale, y: view.origin.y - vector[1] * view.scale });
      const lensOn = !moving && ex.near && picked();
      // almost parallel and no prediction yet: no landing point, no ghost (they would show the jump)
      const hideJump = ex.near && !picked();
      const samples = [];
      const seg = (p, q, n = 24) => {
        for (let i = 0; i <= n; i += 1) samples.push({ x: p.x + ((q.x - p.x) * i) / n, y: p.y + ((q.y - p.y) * i) / n });
      };

      if (ghost && !moving && !hideJump) {
        const old = geometry(ghost);
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.setLineDash([5, 4]);
        M().drawArrow(ctx, view.origin, map(old.b), palette.image, 2.6);
        if (old.land) {
          ctx.strokeStyle = palette.image;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(map(old.b).x, map(old.b).y);
          ctx.lineTo(map(old.land).x, map(old.land).y);
          ctx.stroke();
          // the old solution: x₁a₁ on the a₁ line and the slid parallelogram, both faint
          const oldArea = [[0, 0], old.land, add(old.land, old.a2), old.a2].map(map);
          ctx.beginPath();
          oldArea.forEach((point, index) => (index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
          ctx.closePath();
          ctx.lineWidth = 1;
          ctx.stroke();
          dot(ctx, map(old.land), palette.image, palette, 3);
        }
        ctx.restore();
        if (old.land) {
          // on the a₂ side of the a₁ line: the label of a₁ sits on the other side
          const { n } = M().sideAway(view.origin, map(old.a1), map(old.a2));
          const at = map(old.land);
          label(ctx, "改动前", at.x - n.x * 16, at.y - n.y * 16, palette, -n.x > 0.35 ? "left" : -n.x < -0.35 ? "right" : "center");
        }
      }

      const target = map(g.b);
      M().drawArrow(ctx, view.origin, target, palette.image, 3.2);

      if (g.land) {
        const a2 = g.a2;
        const base = g.land;
        const currentArea = [[0, 0], g.b, add(g.b, a2), a2].map(map);
        const slidArea = [[0, 0], base, add(base, a2), a2].map(map);
        ctx.save();
        ctx.beginPath();
        currentArea.forEach((point, index) => (index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
        ctx.closePath();
        ctx.fillStyle = palette.image;
        ctx.globalAlpha = 0.09;
        ctx.fill();
        ctx.globalAlpha = 0.78;
        ctx.strokeStyle = palette.image;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.beginPath();
        slidArea.forEach((point, index) => (index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
        ctx.closePath();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = palette.muted;
        ctx.stroke();
        const slid = map(base);
        ctx.beginPath();
        ctx.moveTo(target.x, target.y);
        ctx.lineTo(slid.x, slid.y);
        ctx.strokeStyle = palette.image;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();
        if (!hideJump) dot(ctx, slid, palette.image, palette, 3);
        if (!lensOn) {
          // beside the middle of the slide, on the side away from the origin (the two areas lie toward it)
          const mid = { x: (target.x + slid.x) / 2, y: (target.y + slid.y) / 2 };
          const { n } = M().sideAway(slid, target, view.origin);
          ctx.save();
          ctx.font = `600 12px ${FONT}`;
          const place = (text) => {
            const w = ctx.measureText(text).width;
            const x = mid.x + n.x * 12 - (n.x < -0.35 ? w : Math.abs(n.x) <= 0.35 ? w / 2 : 0);
            return { x, w, fits: x >= 6 && x + w <= view.width - 6 };
          };
          // one line when it fits beside the slide, otherwise two shorter lines
          const one = place("沿 a₂ 方向滑到 x₁a₁");
          const lines = one.fits ? ["沿 a₂ 方向滑到 x₁a₁"] : ["沿 a₂ 方向", "滑到 x₁a₁"];
          const spot = one.fits ? one : place("滑到 x₁a₁");
          const x = M().clamp(spot.x, 6, view.width - spot.w - 6);
          const y = M().clamp(mid.y + n.y * 14 - (lines.length - 1) * 7, 10, view.height - 30 - (lines.length - 1) * 14);
          ctx.restore();
          lines.forEach((text, i) => label(ctx, text, x, y + i * 14, palette, "left"));
        }
        [currentArea, slidArea].forEach((area) => area.forEach((p, i) => seg(p, area[(i + 1) % 4])));
        seg(target, slid);
      } else {
        const direction = Math.hypot(...g.a1) > 1e-8 ? g.a1 : g.a2;
        const length = Math.hypot(...direction) || 1;
        const unit = [direction[0] / length, direction[1] / length];
        const pA = map([-unit[0] * 8, -unit[1] * 8]);
        const pB = map([unit[0] * 8, unit[1] * 8]);
        ctx.save();
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = palette.muted;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();
        ctx.restore();
        // name the line where it is farthest from the tips (and so from their labels)
        const reach = Math.max(Math.hypot(...g.a1), Math.hypot(...g.a2), Math.abs(g.b[0] * unit[0] + g.b[1] * unit[1]), 1);
        const tips = [[0, 0], g.a1, g.a2, g.b].map(map);
        const normal = { x: -unit[1], y: -unit[0] }; // screen normal of the line (y points down)
        let best = null;
        for (let k = 3; k <= 13; k += 1) {
          for (const sgn of [1, -1]) {
            const on = map([unit[0] * reach * k / 10, unit[1] * reach * k / 10]);
            const at = { x: on.x + sgn * normal.x * 16, y: on.y + sgn * normal.y * 16 };
            if (at.x < 50 || at.x > view.width - 50 || at.y < 14 || at.y > view.height - 34) continue;
            const score = Math.min(...tips.map((p) => Math.hypot(p.x - at.x, p.y - at.y)));
            if (!best || score > best.score) best = { at, score, nx: sgn * normal.x };
          }
        }
        if (best) label(ctx, "列空间", best.at.x, best.at.y, palette, best.nx < -0.3 ? "right" : best.nx > 0.3 ? "left" : "center");
      }
      {
        // b just past its tip, along its own direction
        const length = Math.hypot(target.x - view.origin.x, target.y - view.origin.y) || 1;
        const u = { x: (target.x - view.origin.x) / length, y: (target.y - view.origin.y) / length };
        label(ctx, "b", M().clamp(target.x + u.x * 12, 8, view.width - 8), M().clamp(target.y + u.y * 12, 9, view.height - 9), palette, "center");
      }

      if (lensOn) {
        const o = view.origin;
        [g.a1, g.a2, g.b, add(g.a1, g.a2)].forEach((p) => seg(o, map(p)));
        [map(g.a1), map(g.a2), target].forEach((p) => seg({ x: p.x + 4, y: p.y - 7 }, { x: p.x + 24, y: p.y - 7 }, 4));
        seg({ x: 15, y: view.height - 16 }, { x: 15 + ctx.measureText("实线箭头为 b；虚线显示沿 a₂ 方向滑动").width * 1.15, y: view.height - 16 });
        drawLens(ctx, view, palette, g, states, samples);
      }
    }

    function render() {
      const ex = exact(state);
      const { t } = ex;
      const hundredths = (value) => ratio(value, 100).text;
      root.querySelector("[data-d]").textContent = hundredths(ex.D);
      root.querySelector("[data-d1]").textContent = hundredths(ex.D1);
      root.querySelector("[data-d2]").textContent = hundredths(ex.D2);
      root.querySelector("[data-a-matrix]").innerHTML = matrixHtml([[t.a11, t.a12], [t.a21, t.a22]]);
      root.querySelector("[data-a1-matrix]").innerHTML = matrixHtml([[t.b1, t.a12], [t.b2, t.a22]]);
      root.querySelector("[data-a2-matrix]").innerHTML = matrixHtml([[t.a11, t.b1], [t.a21, t.b2]]);

      const solution = root.querySelector("[data-sol]");
      const residual = root.querySelector("[data-residual]");
      const proof = root.querySelector("[data-slide-proof]");
      if (ex.D !== 0) {
        const x1 = ratio(ex.D1, ex.D).tex;
        const x2 = ratio(ex.D2, ex.D).tex;
        const xs = (a, b) => `${tex(`x_1=${a}`)}，${tex(`x_2=${b}`)}`;
        const old = ghost ? exact(ghost) : null;
        const before = old && old.D !== 0 ? `（改动前：${xs(ratio(old.D1, old.D).tex, ratio(old.D2, old.D).tex)}）` : "";
        const thin = `<strong>两列接近共线，${tex("D")} 很小但不为 0</strong>`;
        if (ex.near) {
          // the size of the jump answers the prediction: x stays hidden until a prediction is picked
          solution.innerHTML = !picked()
            ? `${thin}　${xs("?", "?")}。`
            : !revealed()
              ? `${thin}　${xs(x1, x2)}${before}。`
              : `<strong>唯一但敏感</strong>　${xs(x1, x2)}${before}。两列接近共线，${tex("D")} 很小，${tex("b")} 的微小变化会被 ${tex("D_i/D")} 放大。`;
          solution.className = "ch2-note is-zero";
        } else {
          solution.innerHTML = `<strong>唯一解</strong>　${xs(x1, x2)}${before}。分子有向面积分别是原有向面积的 ${tex("x_1")}、${tex("x_2")} 倍。`;
          solution.className = "ch2-note is-positive";
        }
        residual.innerHTML = `重构：${tex(`x_1a_1+x_2a_2=\\left(${ratio(t.b1, 10).tex},\\,${ratio(t.b2, 10).tex}\\right)^T`)}，正好回到 ${tex("b")}。`;
        residual.className = "ch2-note is-positive";
        proof.innerHTML = `${tex("D_1=\\det(b,a_2)=\\det(x_1a_1,a_2)=x_1D")}：把 ${tex("b")} 沿 ${tex("a_2")} 方向滑到 ${tex("x_1a_1")}，底边改变但有向面积不变。`;
      } else {
        const infinite = ex.kind === "infinite";
        solution.innerHTML = infinite
          ? `<strong>${tex("D=0")} · 无穷多解</strong>　${tex("b")} 仍落在塌缩后的列空间中；克拉默公式没有非零分母，改用消元描述自由变量。`
          : `<strong>${tex("D=0")} · 无解</strong>　${tex("b")} 不在列空间中；塌缩后的列向量无法合成 ${tex("b")}。`;
        solution.className = infinite ? "ch2-note is-zero" : "ch2-note is-negative";
        residual.innerHTML = infinite ? `列组合能够到达 ${tex("b")}，但表示不唯一。` : `任何列向量组合都无法到达 ${tex("b")}。`;
        residual.className = infinite ? "ch2-note is-zero" : "ch2-note is-negative";
        proof.innerHTML = infinite
          ? `两列压到同一条列空间直线上，${tex("b")} 也在线上：可以到达，但表示不唯一。`
          : `两列压到同一条列空间直线上，${tex("b")} 却离开直线：任何列组合都无法到达。`;
      }

      KEYS.forEach((key) => {
        root.querySelector(`[data-k="${key}"]`).value = String(state[key]);
        root.querySelector(`[data-v="${key}"]`).textContent = ratio(t[key], 10).text;
      });
      nudge.disabled = !picked() || animating || t.b2 - 1 < -60;
      if (!picked()) nudge.title = "先在上方猜一猜";
      else nudge.removeAttribute("title");
      drawScene();
      M().pulseClass(root.querySelector("[data-d-card]"));
    }

    // a change of b counts as the action once a prediction exists and the columns are almost parallel
    function bChanged() {
      if (gate?.picked && !gate.revealed && exact(state).near) gate.acted();
    }

    // a new preset may interrupt a running animation: the newest run wins
    let run = 0;
    async function goTo(target) {
      const id = ++run;
      M().cancelAnim(canvas);
      const from = { ...shown };
      ghost = null;
      frame = null;
      dragging = false;
      Object.assign(state, target);
      animating = true;
      render(); // readouts show the final values; the canvas follows
      try {
        await M().animateTo(canvas, 0, 1, 620, (k) => {
          shown = Object.fromEntries(KEYS.map((key) => [key, M().lerp(from[key], target[key], k)]));
          drawScene();
        });
      } finally {
        if (id === run) {
          animating = false;
          shown = { ...state };
          render();
        }
      }
    }

    async function nudgeB() {
      if (animating) return;
      const id = ++run;
      const step = exact(state).t.b2 - 1;
      if (step < -60) return;
      const from = { ...state };
      const to = { ...state, b2: step / 10 };
      ghost = from;
      frame = { states: [from, to] };
      dragging = false;
      Object.assign(state, to);
      animating = true;
      render();
      try {
        await M().animateTo(canvas, 0, 1, 520, (k) => {
          shown = { ...from, b2: M().lerp(from.b2, to.b2, k) };
          drawScene();
        });
      } finally {
        if (id === run) {
          animating = false;
          frame = null;
          shown = { ...state };
          render();
          bChanged();
        }
      }
    }

    root.querySelectorAll("[data-k]").forEach((input) => {
      const isB = input.dataset.k === "b1" || input.dataset.k === "b2";
      input.addEventListener("input", () => {
        if (animating) return;
        // the state before this drag stays as a ghost, also when a₁ or a₂ is moved
        if (!dragging) ghost = { ...state };
        dragging = true;
        state[input.dataset.k] = tenths(input.value) / 10;
        shown = { ...state };
        render();
      }, { signal });
      input.addEventListener("change", () => {
        dragging = false;
        if (isB) bChanged();
      }, { signal });
    });
    nudge.addEventListener("click", nudgeB, { signal });
    // switching examples never judges and never clears the guess; only b₂ − 1/10 on 接近奇异 does
    [["ex", PRESETS.ex], ["near", PRESETS.near], ["sing", PRESETS.sing], ["none", PRESETS.none]].forEach(([name, preset]) => {
      const button = root.querySelector(`[data-cramer-${name}]`);
      button.addEventListener("click", () => {
        root.querySelectorAll(".ch2-cramer-presets button").forEach((item) => item.classList.toggle("is-active", item === button));
        goTo(preset);
      }, { signal });
    });
    window.addEventListener("resize", () => document.body.contains(canvas) && drawScene(), { signal, passive: true });

    render();
    return () => {
      controller.abort();
      M().cancelAnim(canvas);
    };
  }

  defineChapter2Renderer("cramer-rule", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "克拉默法则来自列线性",
        `把 ${tex("b")} 放进第 ${tex("i")} 列后，沿这一列的线性展开会自动消去所有含重复列的项，只留下 ${tex("x_i\\det(A)")}。二维面积比给出同一结论的几何版本。`,
        module("01", "替换列推导", `先写 ${tex("b")} 的列组合，再利用重复列为零。`, proofSteps([
          `${tex("b=x_1a_1+\\cdots+x_na_n")}。`,
          `在 ${tex("A_i")} 中把第 ${tex("i")} 列替换为 ${tex("b")}，并对该列使用分别线性。`,
          `当 ${tex("b")} 的展开项使用 ${tex("a_j")}（${tex("j\\ne i")}）时，矩阵中出现两列 ${tex("a_j")}，行列式为 0。`,
          `只剩 ${tex("\\det(A_i)=x_i\\det(A)")}；当 ${tex("\\det(A)\\ne0")} 时可除得公式。`,
        ]) + `
          <article class="ch2-def ch2-formula-block"><span class="kicker">公式</span><strong>${display("x_i=\\frac{\\det(A_i)}{\\det(A)}")}</strong><p>分母非零是公式成立与唯一解存在的共同条件。</p></article>
        `) + module("02", `${tex("D=0")} 与接近 ${tex("D=0")} 是两种边界`, "一个决定解的类型，另一个提醒坐标对扰动敏感。", `
          <div class="ch2-card-grid">
            <article class="ch2-card"><span class="kicker">${tex("D=0")} 且相容</span><h4>无穷多解</h4><p>${tex("b")} 落在塌缩后的列空间中，表示不唯一。</p></article>
            <article class="ch2-card"><span class="kicker">${tex("D=0")} 且不相容</span><h4>无解</h4><p>${tex("b")} 离开列空间，任何列组合都无法到达它。</p></article>
            <article class="ch2-card"><span class="kicker">${tex("D")} 很小但非零</span><h4>唯一但敏感</h4><p>两列接近共线，${tex("D_i/D")} 会放大输入中的微小变化。</p></article>
          </div>
        `) + misconception([
          `替换的是第 ${tex("i")} 列，因为 ${tex("Ax")} 是列向量的线性组合。`,
          `${tex("D=0")} 只说明克拉默公式不可用；无解与无穷多解需要继续判定。`,
          `${tex("D")} 很小不等于 ${tex("D=0")}；理论上仍可能有唯一解，但数值会变得敏感。`,
        ]),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>Cramer 法则 · 列空间与面积比</h3></div>
          <div data-cramer-gate></div>
          <div class="ch2-cramer-layout">
            <div class="ch2-presets ch2-cramer-presets">
              <button type="button" class="is-active" data-cramer-near>接近奇异</button>
              <button type="button" data-cramer-ex>唯一解示例</button>
              <button type="button" data-cramer-sing>${tex("D=0")} · 无穷多解</button>
              <button type="button" data-cramer-none>${tex("D=0")} · 无解</button>
            </div>
            <div class="ch2-cramer-main">
              <div class="ch2-stage"><canvas data-cramer-canvas aria-label="克拉默法则列向量与常数向量画布"></canvas></div>
              <div class="ch2-side">
              <div class="ch2-presets ch2-cramer-act"><button type="button" class="is-primary" data-cramer-nudge>${tex("b_2")} 减小 1/10</button></div>
              <div class="ch2-meter">
                <div class="ch2-meter-card" data-d-card><strong>${tex("D")}</strong><span data-d></span></div>
                <div class="ch2-meter-card"><strong>${tex("D_1")}</strong><span data-d1></span></div>
                <div class="ch2-meter-card"><strong>${tex("D_2")}</strong><span data-d2></span></div>
              </div>
              <div class="ch2-note ch2-cramer-mats"><div><strong>${tex("A")}</strong><span data-a-matrix></span></div><div><strong>${tex("A_1")}</strong><span data-a1-matrix></span></div><div><strong>${tex("A_2")}</strong><span data-a2-matrix></span></div></div>
              <div data-sol class="ch2-note" aria-live="polite"></div>
              </div>
            </div>
            <div class="ch2-cramer-explanation">
              <div class="ch2-cramer-proof" data-slide-proof></div>
              <div data-residual class="ch2-note" aria-live="polite"></div>
            </div>
            <div class="ch2-cramer-controls">
              <details class="ch2-tuning"><summary>调整 ${tex("a_1")}、${tex("a_2")} 与 ${tex("b")}</summary><div class="ch2-sliders">
                ${["a11", "a12", "a21", "a22", "b1", "b2"].map((key) => `<label><span>${tex(key.replace(/(\d+)$/, "_{$1}"))}</span><input data-k="${key}" type="range" min="-6" max="6" step="0.1" aria-label="${key}" /><span data-v="${key}"></span></label>`).join("")}
              </div></details>
            </div>
          </div>
        </div>`;
      return mountCramer(root);
    },
  });
})();


;/* visuals/ch2/section8-presentation.js */
(() => {
  const { M, tex, display, formalShell, module, proofSteps, misconception } = window.Ch2PresentationUtils;

  function matrixTex(matrix) {
    return tex(`\\begin{bmatrix}${matrix.map((row) => row.map((value) => M().formatNum(value, 3)).join("&")).join("\\\\")}\\end{bmatrix}`);
  }

  /*
   * Worked example (static): fix rows 1, 2 of a 4×4 matrix; the six column pairs
   * give six signed products of a minor and its complementary minor. Sum = det = 6.
   */
  function laplaceExample() {
    const matrix = [[1, 2, 0, 1], [0, 1, 1, 0], [2, 0, 1, 1], [1, 1, 0, 2]];
    const rows = [0, 1];
    const pairs = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
    const num = (v) => (v < 0 ? `−${-v}` : String(v));
    const terms = pairs.map((cols) => {
      const compCols = M().complementIndices(4, cols);
      const minor = M().determinant(M().submatrix(matrix, rows, cols));
      const comp = M().determinant(M().submatrix(matrix, M().complementIndices(4, rows), compCols));
      const exponent = 1 + 2 + cols[0] + 1 + cols[1] + 1;
      const sign = exponent % 2 === 0 ? 1 : -1;
      return { cols, compCols, minor: Math.round(minor), comp: Math.round(comp), sign, term: Math.round(sign * minor * comp) };
    });
    const total = terms.reduce((sum, t) => sum + t.term, 0);
    const det = Math.round(M().determinant(matrix));
    const matrixTexStr = `A=\\begin{pmatrix}${matrix.map((r) => r.join("&")).join("\\\\")}\\end{pmatrix}`;
    return `<article class="ch2-def ch2-laplace-example">
      <span class="kicker">例：固定第 1、2 行</span>
      <div class="ch2-laplace-example-body">
        <div class="ch2-laplace-example-matrix">${display(matrixTexStr)}</div>
        <div class="ch2-table-wrap"><table class="ch2-laplace-terms">
          <thead><tr><th>所选列 ${tex("J")}</th><th>子式</th><th>符号</th><th>互补子式</th><th>本项</th></tr></thead>
          <tbody>${terms.map((t) => `<tr data-pair-row><td>${t.cols.map((c) => c + 1).join(", ")}</td><td>${num(t.minor)}</td><td>${tex(`(-1)^{3+${t.cols[0] + 1}+${t.cols[1] + 1}}=${t.sign > 0 ? "+1" : "-1"}`)}</td><td>${num(t.comp)}</td><td><b>${num(t.term)}</b></td></tr>`).join("")}</tbody>
          <tfoot><tr><td colspan="4">六项之和</td><td><b data-pair-sum>${num(total)}</b></td></tr></tfoot>
        </table></div>
      </div>
      <p>${tex(`\\binom42=6`)} 种取列方式，六项之和 ${num(total)} 正好等于 ${tex("\\det A=")} <b data-pair-det>${num(det)}</b>。${tex("k=1")} 时每个子式只是一个元素，展开就回到 §6 的按一行展开。</p>
    </article>`;
  }

  /*
   * Product rule lab: the unit square goes E → B → AB.
   * Area tiles: 1 tile → |det B| tiles → |det B| columns of |det A| tiles,
   * so “each tile of B's image is multiplied by det A” is visible as a grid.
   * Mid-animation the live value is the current signed area; det(AB) appears at the end.
   */
  function mountProduct(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const presets = {
      scale: { A: [[2, 0], [0, 1]], B: [[1, 0], [0, 3]] },
      shearScale: { A: [[2, 0], [0, 1]], B: [[1, 1], [0, 1]] },
      mirrorRotate: { A: [[0, -1], [1, 0]], B: [[-1, 0], [0, 1]] },
      doubleMirror: { A: [[-1, 0], [0, 1]], B: [[1, 0], [0, -1]] },
      project: { A: [[2, 0], [0, 1]], B: [[1, 0], [0, 0]] },
    };
    const I = [[1, 0], [0, 1]];
    const cI = root.querySelector("[data-c-i]");
    const cB = root.querySelector("[data-c-b]");
    const cAB = root.querySelector("[data-c-ab]");
    const replay = root.querySelector("[data-prod-replay]");
    const status = root.querySelector("[data-rule-status]");
    const tiles = root.querySelector("[data-prod-tiles]");
    const liveLabel = root.querySelector("[data-dab-label]");
    const n = (v) => M().formatNum(v, 3);
    let current = presets.scale;
    let busy = false;
    let run = 0;
    let finished = false;

    const gate = window.LAPredictGate?.mount(root.querySelector("[data-prod-gate]"), {
      root: root.querySelector("[data-prod-lab]"),
      manual: true,
      key: "visuals/ch2/section8-presentation.js#product",
      question: `${tex("\\det A=2")}，${tex("\\det B=3")}。单位正方形先经过 ${tex("B")}，再经过 ${tex("A")}，最后的有向面积是多少？`,
      options: [
        ["6", true, ""],
        ["5", false, "两步的倍率不相加：经过 B 后面积是 3，A 再把其中每一块放大 2 倍。"],
        ["2", false, "A 作用在 B 的结果上，B 已经把面积变成 3，不是从 1 重新开始。"],
        ["要看两个矩阵的具体形状才能定", false, "形状会变，面积倍率只取决于两个行列式。"],
      ],
      right: `✓ ${tex("B")} 把单位正方形变成面积 3 的图形，${tex("A")} 再把其中每一小块的面积都乘 2：${tex("\\det(AB)=\\det A\\cdot\\det B=6")}。符号同样相乘：翻转两次等于不翻转。`,
    });

    /*
     * One view for all three canvases (same scale, same origin), framing E, B and AB of the current
     * pair: a square of area 1 has the same size in every panel, so the area multiplies visibly.
     */
    function viewFor(A, B) {
      const rect = cI.getBoundingClientRect();
      const width = rect.width || 300;
      const height = rect.height || 285;
      const world = M().fitWorld([I, B, M().mul2(A, B)], width, height, { pad: 26 });
      const { origin, scale } = M().worldView(world, width, height);
      return { origin, scale };
    }

    function setBusy(value) {
      busy = value;
      root.querySelectorAll("[data-prod-preset]").forEach((button) => { button.disabled = value; });
      if (gate?.picked || !gate) replay.disabled = value;
    }

    // tiles: stage 0 = the unit square, 1 = after B, 2 = after A
    function paintTiles(A, B, stage) {
      const dA = Math.round(M().det2(A));
      const dB = Math.round(M().det2(B));
      // the signed area is written on the block itself
      const group = (label, cols, rows, sign, cls, value) => {
        const cells = cols * rows;
        const tag = `<b class="ch2-tile-val">${value}</b>`;
        const body = cells === 0
          ? `<div class="ch2-tiles is-zero"><i>0</i></div>`
          : `<div class="ch2-tiles${sign < 0 ? " is-flipped" : ""}" style="--cols:${cols}">${Array.from({ length: cells }, (_, k) => `<i class="${cls}"></i>`).join("")}</div>`;
        return `<figure class="ch2-tile-group">${tag}${body}<figcaption>${label}</figcaption></figure>`;
      };
      const parts = [group(`单位正方形：1`, 1, 1, 1, "is-unit", "1")];
      if (stage >= 1) parts.push(`<b class="ch2-tile-op">${tex(`\\times${dB < 0 ? `(${n(dB)})` : n(dB)}`)}</b>`, group(`经过 ${tex("B")}：${n(dB)}`, Math.abs(dB), 1, Math.sign(dB), "is-b", tex(`\\det B=${n(dB)}`)));
      if (stage >= 2) parts.push(`<b class="ch2-tile-op">${tex(`\\times${dA < 0 ? `(${n(dA)})` : n(dA)}`)}</b>`, group(`再经过 ${tex("A")}：${n(dA * dB)}`, Math.abs(dB), Math.abs(dA), Math.sign(dA * dB), "is-ab", tex(`\\det(AB)=${n(dA * dB)}`)));
      tiles.innerHTML = parts.join("");
    }

    function showGivens(A, B) {
      root.querySelector("[data-da]").textContent = n(M().det2(A));
      root.querySelector("[data-db]").textContent = n(M().det2(B));
      // the product is the answer to the prediction; it appears with det(AB) at the end
      root.querySelector("[data-prod]").textContent = "?";
    }

    function idle(A, B) {
      run += 1;
      finished = false;
      [cI, cB, cAB].forEach((canvas) => M().cancelAnim(canvas));
      const view = viewFor(A, B);
      M().drawTransformScene(cI, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "单位正方形", ...view });
      M().drawTransformScene(cB, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "等待作用 B", ...view });
      M().drawTransformScene(cAB, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "等待作用 A", ...view });
      showGivens(A, B);
      liveLabel.innerHTML = tex("\\det(AB)");
      root.querySelector("[data-dab]").textContent = "?";
      status.innerHTML = `按“播放”，看单位正方形依次经过 ${tex("B")} 和 ${tex("A")}。`;
      status.className = "";
      paintTiles(A, B, 0);
    }

    async function play(A, B) {
      if (busy) return;
      setBusy(true);
      const id = ++run;
      current = { A, B };
      const AB = M().mul2(A, B);
      const dA = M().det2(A);
      const dB = M().det2(B);
      const dab = root.querySelector("[data-dab]");
      try {
        idle(A, B);
        run = id;
        liveLabel.textContent = "当前有向面积（动画中）";
        dab.textContent = "1";
        status.innerHTML = `第一步：作用 ${tex("B")}。`;
        const view = viewFor(A, B);
        await M().animateMatrix(cB, B, {
          duration: 700,
          drawOptions: { firstLabel: "Be₁", secondLabel: "Be₂", caption: "第一步：E → B", ghost: I, ...view },
          onUpdate(m) { dab.textContent = `≈ ${M().formatNum(M().det2(m), 2)}`; },
        });
        if (id !== run) return;
        dab.textContent = n(dB);
        paintTiles(A, B, 1);
        M().drawTransformScene(cAB, B, { firstLabel: "Be₁", secondLabel: "Be₂", caption: "从 B 的结果出发", ...view });
        status.innerHTML = `第二步：从 ${tex("B")} 的结果出发，再作用 ${tex("A")}。`;
        await new Promise((resolve) => setTimeout(resolve, M().reducedMotion() ? 0 : 360));
        if (id !== run) return;
        await M().animateMatrix(cAB, AB, {
          duration: 780,
          drawOptions: { firstLabel: "ABe₁", secondLabel: "ABe₂", caption: "第二步：B → AB", ghost: B, ...view },
          onUpdate(m) { dab.textContent = `≈ ${M().formatNum(M().det2(m), 2)}`; },
        });
        if (id !== run) return;
        // final, exact values only
        liveLabel.innerHTML = tex("\\det(AB)");
        dab.textContent = n(M().det2(AB));
        root.querySelector("[data-prod]").textContent = n(dA * dB);
        paintTiles(A, B, 2);
        const ok = Math.abs(M().det2(AB) - dA * dB) < 1e-9;
        const factor = (v) => (v < 0 ? `(${n(v)})` : n(v));
        status.innerHTML = ok ? `验证完成：${tex(`\\det(AB)=${n(M().det2(AB))}=${factor(dA)}\\times${factor(dB)}`)}` : "";
        status.className = ok ? "is-positive" : "";
        finished = true;
        gate?.acted();
      } finally {
        if (id === run) setBusy(false);
      }
    }

    root.querySelectorAll("[data-prod-preset]").forEach((button) => button.addEventListener("click", () => {
      if (busy) return;
      root.querySelectorAll("[data-prod-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      const preset = presets[button.dataset.prodPreset];
      current = preset;
      // before a prediction a preset only sets the matrices; playing waits for the prediction
      if (gate && !gate.picked) idle(preset.A, preset.B);
      else play(preset.A, preset.B);
    }, { signal }));
    replay.addEventListener("click", () => play(current.A, current.B), { signal });
    window.addEventListener("resize", () => {
      if (!document.body.contains(cI) || busy) return;
      if (!finished) { idle(current.A, current.B); return; }
      const AB = M().mul2(current.A, current.B);
      const view = viewFor(current.A, current.B);
      M().drawTransformScene(cI, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "单位正方形", ...view });
      M().drawTransformScene(cB, current.B, { firstLabel: "Be₁", secondLabel: "Be₂", caption: "第一步：E → B", ghost: I, ...view });
      M().drawTransformScene(cAB, AB, { firstLabel: "ABe₁", secondLabel: "ABe₂", caption: "第二步：B → AB", ghost: current.B, ...view });
    }, { signal, passive: true });

    idle(current.A, current.B);
    return () => {
      run += 1;
      controller.abort();
      [cI, cB, cAB].forEach((canvas) => M().cancelAnim(canvas));
    };
  }

  defineChapter2Renderer("laplace-and-product", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "从子式配对到复合倍率",
        `广义 Laplace 定理把按一行展开推广到按 ${tex("k")} 行展开；乘法规则说明线性变换复合时，有向体积倍率相乘。`,
        module("01", "广义 Laplace 定理", `固定 ${tex("k")} 行，遍历全部 ${tex("k")} 列组合。`, `
          <div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">子式</span><strong>所选 ${tex("k")} 行与 ${tex("k")} 列交叉得到 ${tex("k")} 阶行列式</strong><p>未被选择的行列形成互补子式。</p></article>
            <article class="ch2-def"><span class="kicker">位置符号</span><strong>${tex("(-1)^{\\sum I+\\sum J}")}</strong><p>${tex("I")}、${tex("J")} 分别是所选行指标集与列指标集。</p></article>
          </div>
          <article class="ch2-def ch2-formula-block ch2-laplace-formula"><span class="kicker">固定行指标集 ${tex("I")} 的展开</span><strong>${display("\\det(A)=\\sum_{|J|=k}(-1)^{\\sum I+\\sum J}\\det A[I,J]\\,\\det A[I^c,J^c]")}</strong><p>${tex("J")} 取遍 ${tex("\\{1,\\ldots,n\\}")} 的全部 ${tex("k")} 元子集。当 ${tex("k=1")} 时，子式就是一个元素，互补子式就是余子式，公式退化为 §6。</p></article>
          ${laplaceExample()}
        `) + module("02", "乘法规则", `先作用 ${tex("B")}，再作用 ${tex("A")}，倍率依次相乘。`, `
          <article class="ch2-def ch2-formula-block"><span class="kicker">定理</span><strong>${display("\\det(AB)=\\det(A)\\det(B)")}</strong><p>向量先经过 ${tex("B")}，再经过 ${tex("A")}；有向体积先乘 ${tex("\\det(B)")}，随后乘 ${tex("\\det(A)")}。</p></article>
          ${proofSteps([
            `几何入口：单位体积经过 ${tex("B")} 后乘 ${tex("\\det(B)")}，再经过 ${tex("A")} 后乘 ${tex("\\det(A)")}。`,
            `代数入口：把 ${tex("AB")} 的每一列写成 ${tex("A")} 的列向量的线性组合。`,
            `对所有列使用多重线性展开；含重复 ${tex("A")} 列的项全部为零。`,
            `剩余列指标必须构成排列，其符号与 ${tex("B")} 的 Leibniz 展开一致。`,
            `把 ${tex("A")} 的排列和与 ${tex("B")} 的排列和分离，得到 ${tex("\\det(A)\\det(B)")}。`,
          ])}
        `) + module("03", "重要推论", "乘法规则把多个结论压缩成一行计算。", `
          <div class="ch2-card-grid">
            <article class="ch2-card"><span class="kicker">逆矩阵</span><h4>${tex("\\det(A^{-1})=1/\\det(A)")}</h4><p>由 ${tex("\\det(E)=\\det(A)\\det(A^{-1})")}。</p></article>
            <article class="ch2-card"><span class="kicker">矩阵幂</span><h4>${tex("\\det(A^m)=\\det(A)^m")}</h4><p>重复复合，倍率重复相乘。</p></article>
            <article class="ch2-card"><span class="kicker">相似</span><h4>${tex("\\det(P^{-1}AP)=\\det(A)")}</h4><p>换基前后的两个 ${tex("P")} 因子相互抵消。</p></article>
          </div>
        `) + misconception([
          `${tex("AB")} 与 ${tex("BA")} 通常不同，但二者行列式都等于 ${tex("\\det(A)\\det(B)")}。`,
          `二维面积只说明 ${tex("n=2")} 的情形；一般 ${tex("n")} 阶的证明要用多重线性与排列。`,
        ]),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab" data-prod-lab>
          <div class="ch2-lab-head"><h3>两次变换，面积倍率相乘</h3></div>
          <div data-prod-gate></div>
          <p class="ch2-lab-hint">单位正方形先经过 ${tex("B")}，再从 ${tex("B")} 的结果出发经过 ${tex("A")}，合起来就是 ${tex("AB")}。三幅图比例相同，一格面积都是 1。</p>
          <div class="ch2-presets">
            <button type="button" class="is-primary" data-prod-replay>播放 ${tex("E\\to B\\to AB")}</button>
            <button type="button" class="is-active" data-prod-preset="scale">两次缩放</button>
            <button type="button" data-prod-preset="shearScale">剪切后缩放</button>
            <button type="button" data-prod-preset="mirrorRotate">镜像后旋转</button>
            <button type="button" data-prod-preset="doubleMirror">两次镜像</button>
            <button type="button" data-prod-preset="project">含投影</button>
          </div>
          <div class="ch2-stage-row">
            <div class="ch2-stage-panel"><div class="ch2-stage"><canvas data-c-i aria-label="单位正方形"></canvas></div><div class="ch2-stage-caption">${tex("E")} · 单位正方形</div></div>
            <div class="ch2-stage-panel"><div class="ch2-stage"><canvas data-c-b aria-label="经过 B 的图形"></canvas></div><div class="ch2-stage-caption">第一步 · ${tex("E\\to B")}</div></div>
            <div class="ch2-stage-panel"><div class="ch2-stage"><canvas data-c-ab aria-label="从 B 经过 A 到 AB 的图形"></canvas></div><div class="ch2-stage-caption">第二步 · ${tex("B\\to AB")}（虚线是 ${tex("B")} 的结果）</div></div>
          </div>
          <div class="ch2-tile-row" data-prod-tiles aria-label="面积块"></div>
          <div class="ch2-meter is-4">
            <div class="ch2-meter-card"><strong>${tex("\\det(A)")}</strong><span data-da></span></div>
            <div class="ch2-meter-card"><strong>${tex("\\det(B)")}</strong><span data-db></span></div>
            <div class="ch2-meter-card"><strong>${tex("\\det(A)\\det(B)")}</strong><span data-prod></span></div>
            <div class="ch2-meter-card"><strong data-dab-label>${tex("\\det(AB)")}</strong><span data-dab></span></div>
          </div>
          <div class="ch2-note">${"验证状态："}<strong data-rule-status aria-live="polite"></strong></div>
        </div>`;
      const cleanupProduct = mountProduct(root);
      return () => cleanupProduct?.();
    },
  });
})();


;/* visuals/ch2/mount.js */
/* Attach Chapter 2 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  function enhanceChapter2Lesson(section, root) {
    const summary = root.querySelector(`#${CSS.escape(section.id)}-summary`);
    if (summary && section.bridge) {
      const bridge = document.createElement("div");
      bridge.className = "ch2-lesson-bridge";
      bridge.innerHTML = `<strong>下一步</strong><p>${section.bridge}</p>`;
      const markButton = summary.querySelector("[data-complete]");
      if (markButton) markButton.before(bridge);
      else summary.append(bridge);
    }
  }

  window.defineChapter2LessonEnhancer?.(enhanceChapter2Lesson);

  window.renderLessonPage = function renderLessonPageWithChapter2Extensions(section, chapter) {
    baseRenderLessonPage(section, chapter);
    window.mountChapter2Lesson?.(section, document.querySelector("#mainContent"));
  };

  window.addEventListener("hashchange", () => window.teardownChapter2Lesson?.());
  window.addEventListener("pagehide", () => window.teardownChapter2Lesson?.());
})();

