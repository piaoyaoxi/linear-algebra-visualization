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
      ctx.fillStyle = palette.muted;
      ctx.font = "12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(options.caption, 15, height - 14);
      boxes.push({ x: 11, y: height - 30, w: ctx.measureText(options.caption).width + 8, h: 24 });
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
