/* Chapter 3 shared rational linear algebra + canvas helpers. */
(() => {
  const EPS = 1e-10;

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x || 1;
  }

  function F(n = 0, d = 1) {
    n = Number(n);
    d = Number(d);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return { n: 0, d: 1 };
    if (d < 0) {
      n = -n;
      d = -d;
    }
    if (!Number.isInteger(n) || !Number.isInteger(d)) {
      // best-effort from float for display-only paths
      const scale = 10000;
      n = Math.round(n * scale);
      d = Math.round(d * scale);
    }
    const g = gcd(n, d);
    return { n: n / g, d: d / g };
  }

  const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
  const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
  const mul = (a, b) => F(a.n * b.n, a.d * b.d);
  const div = (a, b) => F(a.n * b.d, a.d * b.n);
  const neg = (a) => F(-a.n, a.d);
  const isZero = (a) => a.n === 0;
  const eq = (a, b) => a.n === b.n && a.d === b.d;
  const cmpAbs = (a, b) => Math.abs(a.n * b.d) - Math.abs(b.n * a.d);
  const toNumber = (a) => a.n / a.d;

  function formatF(a) {
    if (a.d === 1) return String(a.n);
    if (a.n < 0) return `-(${-a.n}/${a.d})`;
    return `${a.n}/${a.d}`;
  }

  function latexF(a) {
    if (a.d === 1) return String(a.n);
    if (a.n < 0) return `-\\frac{${-a.n}}{${a.d}}`;
    return `\\frac{${a.n}}{${a.d}}`;
  }

  function fromNumber(value) {
    if (typeof value === "object" && value && "n" in value) return F(value.n, value.d);
    const n = Number(value);
    if (!Number.isFinite(n)) return F(0);
    if (Number.isInteger(n)) return F(n);
    // limit denominators for slider-driven values
    const den = 20;
    return F(Math.round(n * den), den);
  }

  function cloneMat(m) {
    return m.map((row) => row.map((v) => F(v.n, v.d)));
  }

  function matFromNumbers(rows) {
    return rows.map((row) => row.map((v) => fromNumber(v)));
  }

  function matToNumbers(m) {
    return m.map((row) => row.map(toNumber));
  }

  function rowSwap(m, i, j) {
    const out = cloneMat(m);
    [out[i], out[j]] = [out[j], out[i]];
    return out;
  }

  function rowScale(m, i, k) {
    const out = cloneMat(m);
    const factor = fromNumber(k);
    out[i] = out[i].map((v) => mul(v, factor));
    return out;
  }

  function rowAdd(m, target, source, k) {
    const out = cloneMat(m);
    const factor = fromNumber(k);
    out[target] = out[target].map((v, j) => add(v, mul(out[source][j], factor)));
    return out;
  }

  function formatMat(m, barAt = null) {
    return m
      .map((row) => {
        const cells = row.map((v, j) => {
          const text = formatF(v);
          if (barAt != null && j === barAt) return `| ${text}`;
          return text;
        });
        return `[ ${cells.join("  ")} ]`;
      })
      .join("\n");
  }

  function latexMat(m, barAt = null) {
    const body = m
      .map((row) =>
        row
          .map((v, j) => {
            const t = latexF(v);
            if (barAt != null && j === barAt) return `\\,|\\, ${t}`;
            return t;
          })
          .join(" & "),
      )
      .join(" \\\\ ");
    return `\\begin{bmatrix}${body}\\end{bmatrix}`;
  }

  function analyzeAugmented(aug) {
    // aug is m x (n+1)
    const m = aug.length;
    const n = aug[0].length - 1;
    let A = cloneMat(aug);
    const pivots = [];
    let row = 0;
    for (let col = 0; col < n && row < m; col += 1) {
      let pivot = row;
      for (let i = row + 1; i < m; i += 1) {
        if (cmpAbs(A[i][col], A[pivot][col]) > 0) pivot = i;
      }
      if (isZero(A[pivot][col])) continue;
      if (pivot !== row) A = rowSwap(A, pivot, row);
      const piv = A[row][col];
      A = rowScale(A, row, div(F(1), piv));
      for (let i = 0; i < m; i += 1) {
        if (i === row || isZero(A[i][col])) continue;
        A = rowAdd(A, i, row, neg(A[i][col]));
      }
      pivots.push(col);
      row += 1;
    }
    let inconsistent = false;
    for (let i = 0; i < m; i += 1) {
      const allZero = A[i].slice(0, n).every(isZero);
      if (allZero && !isZero(A[i][n])) inconsistent = true;
    }
    const rankA = pivots.length;
    let rankAug = rankA;
    if (inconsistent) rankAug = rankA + 1;
    else {
      // count nonzero rows of RREF
      rankAug = A.filter((r) => !r.every(isZero)).length;
    }
    const free = [];
    for (let j = 0; j < n; j += 1) if (!pivots.includes(j)) free.push(j);
    return { rref: A, pivots, free, inconsistent, rankA, rankAug, m, n };
  }

  function rankOf(matrix) {
    const m = matrix.length;
    const n = matrix[0].length;
    const aug = matrix.map((row) => [...row.map((v) => F(v.n, v.d)), F(0)]);
    return analyzeAugmented(aug).rankA;
  }

  function nullspaceBasis(A) {
    const m = A.length;
    const n = A[0].length;
    const aug = A.map((row) => [...row.map((v) => F(v.n, v.d)), F(0)]);
    const info = analyzeAugmented(aug);
    if (info.inconsistent) return { basis: [], info };
    const { rref, pivots, free } = info;
    const pivotRow = new Map(pivots.map((c, i) => [c, i]));
    const basis = free.map((f) => {
      const vec = Array.from({ length: n }, () => F(0));
      vec[f] = F(1);
      pivots.forEach((p) => {
        const r = pivotRow.get(p);
        // x_p + sum free coeffs = 0 in RREF
        vec[p] = neg(rref[r][f]);
      });
      return vec;
    });
    return { basis, info };
  }

  function particularSolution(aug) {
    const info = analyzeAugmented(aug);
    if (info.inconsistent) return { ok: false, info };
    const { rref, pivots, free, n } = info;
    const x = Array.from({ length: n }, () => F(0));
    free.forEach((f) => {
      x[f] = F(0);
    });
    pivots.forEach((p, i) => {
      x[p] = rref[i][n];
    });
    return { ok: true, x, info };
  }

  function relationCertificate(vectors) {
    // vectors as columns
    if (!vectors.length) return { dependent: false, coeffs: [] };
    const n = vectors[0].length;
    const p = vectors.length;
    const A = Array.from({ length: n }, (_, i) => vectors.map((v) => fromNumber(v[i])));
    const { basis, info } = nullspaceBasis(A);
    if (!basis.length) return { dependent: false, coeffs: [], rank: info.rankA };
    return { dependent: true, coeffs: basis[0], rank: info.rankA };
  }

  const PRESETS = {
    unique2: {
      label: "唯一解",
      aug: [
        [1, 1, 3],
        [1, 2, 4],
      ],
    },
    parallel2: {
      label: "平行无解",
      aug: [
        [1, 1, 2],
        [2, 2, 5],
      ],
    },
    sameLine2: {
      label: "重合无穷",
      aug: [
        [1, 1, 2],
        [2, 2, 4],
      ],
    },
    swapPivot: {
      label: "需换行",
      aug: [
        [0, 1, 2],
        [1, 1, 3],
      ],
    },
    upper3: {
      label: "三元上三角",
      aug: [
        [1, 1, 1, 6],
        [0, 1, 1, 3],
        [0, 0, 1, 1],
      ],
    },
    rankOne: {
      label: "秩一",
      A: [
        [1, 2],
        [2, 4],
      ],
    },
    full2: {
      label: "满秩 2×2",
      A: [
        [1, 0],
        [0, 1],
      ],
    },
    fullCol32: {
      label: "3×2 满列秩",
      A: [
        [1, 0],
        [0, 1],
        [1, 1],
      ],
    },
    lineCol: {
      label: "直线列空间",
      A: [
        [1, 2],
        [2, 4],
      ],
      b: [1, 2],
    },
    affineLine: {
      label: "仿射直线",
      aug: [
        [1, 1, 2],
        [2, 2, 4],
      ],
    },
    planeSol: {
      label: "平面解集",
      aug: [
        [1, 1, 1, 2],
        [2, 2, 2, 4],
      ],
    },
  };

  function reducedMotion() {
    return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
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

  function sizeCanvas(canvas) {
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width: rect.width, height: rect.height, dpr };
  }

  function drawAxes(ctx, width, height, scale = 40) {
    const p = getPalette();
    const cx = width / 2;
    const cy = height / 2;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = p.soft;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = cx % scale; x < width; x += scale) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = cy % scale; y < height; y += scale) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
    ctx.strokeStyle = p.muted;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();
    return { cx, cy, scale, p };
  }

  function toCanvas(pt, frame) {
    return [frame.cx + pt[0] * frame.scale, frame.cy - pt[1] * frame.scale];
  }

  function drawLineFromEq(ctx, frame, a, b, c, color, width = 2.5) {
    // ax+by=c
    const { width: W, height: H } = { width: ctx.canvas.clientWidth, height: ctx.canvas.clientHeight };
    const pts = [];
    const tryPush = (x, y) => {
      const [X, Y] = toCanvas([x, y], frame);
      if (X >= -2 && X <= W + 2 && Y >= -2 && Y <= H + 2) pts.push([X, Y]);
    };
    if (Math.abs(b) > 1e-9) {
      tryPush(-10, (c - a * -10) / b);
      tryPush(10, (c - a * 10) / b);
    } else if (Math.abs(a) > 1e-9) {
      const x = c / a;
      tryPush(x, -10);
      tryPush(x, 10);
    }
    if (pts.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    ctx.lineTo(pts[1][0], pts[1][1]);
    ctx.stroke();
  }

  function drawArrow(ctx, frame, vec, color, label) {
    const [x0, y0] = toCanvas([0, 0], frame);
    const [x1, y1] = toCanvas(vec, frame);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    const ang = Math.atan2(y0 - y1, x1 - x0);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - 10 * Math.cos(ang - 0.4), y1 + 10 * Math.sin(ang - 0.4));
    ctx.lineTo(x1 - 10 * Math.cos(ang + 0.4), y1 + 10 * Math.sin(ang + 0.4));
    ctx.closePath();
    ctx.fill();
    if (label) {
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(label, x1 + 6, y1 - 6);
    }
  }

  function drawPoint(ctx, frame, pt, color, label) {
    const [x, y] = toCanvas(pt, frame);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    if (label) {
      ctx.fillStyle = frame.p.text;
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(label, x + 8, y - 8);
    }
  }

  function det2num(A) {
    return A[0][0] * A[1][1] - A[0][1] * A[1][0];
  }

  // Resultant of f=x^2 + p x + q and g=x + r (monic linear) via Sylvester 3x3
  // For demo: circle x^2 + y^2 - 1 and x - y => f=x^2 + (y^2-1), g=x-y
  function resultantQuadraticLinear(p, q, r) {
    // f = x^2 + p x + q, g = x + r  (g = x - y => r = -y)
    // Sylvester 3x3:
    // [1 p q]
    // [1 r 0]
    // [0 1 r]
    const a = 1;
    const b = p;
    const c = q;
    const d = 1;
    const e = r;
    // det
    return a * (e * e - 0) - b * (d * e - 0) + c * (d * 1 - 0);
  }

  function pulseClass(el, cls = "is-pulse") {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  window.Ch3Math = {
    F,
    add,
    sub,
    mul,
    div,
    neg,
    isZero,
    eq,
    toNumber,
    formatF,
    latexF,
    fromNumber,
    cloneMat,
    matFromNumbers,
    matToNumbers,
    rowSwap,
    rowScale,
    rowAdd,
    formatMat,
    latexMat,
    analyzeAugmented,
    rankOf,
    nullspaceBasis,
    particularSolution,
    relationCertificate,
    PRESETS,
    reducedMotion,
    getPalette,
    sizeCanvas,
    drawAxes,
    drawLineFromEq,
    drawArrow,
    drawPoint,
    det2num,
    resultantQuadraticLinear,
    pulseClass,
    EPS,
  };
})();
