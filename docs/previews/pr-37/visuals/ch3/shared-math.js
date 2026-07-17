/* Chapter 3 shared rational linear algebra + rendering helpers. */
(() => {
  const EPS = 1e-10;

  function gcd(a, b) {
    let x = Math.abs(Math.trunc(a));
    let y = Math.abs(Math.trunc(b));
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
      const scale = 1000;
      n = Math.round(n * scale);
      d = Math.round(d * scale) || scale;
    }
    const g = gcd(n, d);
    return { n: n / g, d: d / g };
  }

  const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
  const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
  const mul = (a, b) => F(a.n * b.n, a.d * b.d);
  const div = (a, b) => F(a.n * b.d, a.d * b.n);
  const neg = (a) => F(-a.n, a.d);
  const isZero = (a) => !a || a.n === 0;
  const eq = (a, b) => a.n === b.n && a.d === b.d;
  const cmpAbs = (a, b) => Math.abs(a.n * b.d) - Math.abs(b.n * a.d);
  const toNumber = (a) => a.n / a.d;

  function formatF(a) {
    if (!a) return "0";
    if (a.d === 1) return String(a.n);
    if (a.n < 0) return `-(${-a.n}/${a.d})`;
    return `${a.n}/${a.d}`;
  }

  function latexF(a) {
    if (!a) return "0";
    if (a.d === 1) return String(a.n);
    if (a.n < 0) return `-\\dfrac{${-a.n}}{${a.d}}`;
    return `\\dfrac{${a.n}}{${a.d}}`;
  }

  function fromNumber(value) {
    if (typeof value === "object" && value && "n" in value) return F(value.n, value.d);
    const n = Number(value);
    if (!Number.isFinite(n)) return F(0);
    if (Number.isInteger(n)) return F(n);
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

  function matsEqual(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (a[i].length !== b[i].length) return false;
      for (let j = 0; j < a[i].length; j += 1) if (!eq(a[i][j], b[i][j])) return false;
    }
    return true;
  }

  function changedRows(before, after) {
    if (!before || !after) return [];
    const rows = [];
    for (let i = 0; i < after.length; i += 1) {
      if (!before[i] || before[i].some((v, j) => !eq(v, after[i][j]))) rows.push(i);
    }
    return rows;
  }

  function latexMat(m, barAt = null) {
    const body = m
      .map((row) =>
        row
          .map((v, j) => {
            const t = latexF(v);
            if (barAt != null && j === barAt) return `\\,|\\,${t}`;
            return t;
          })
          .join(" & "),
      )
      .join(" \\\\ ");
    return `\\begin{bmatrix}${body}\\end{bmatrix}`;
  }

  function latexVec(vec, transpose = true) {
    const body = vec.map(latexF).join(transpose ? " \\\\ " : " & ");
    const core = `\\begin{bmatrix}${body}\\end{bmatrix}`;
    return transpose ? core : core; // column by default
  }

  function latexEqFromRow(row, nVars) {
    // row length nVars+1
    const parts = [];
    for (let j = 0; j < nVars; j += 1) {
      const c = row[j];
      if (isZero(c)) continue;
      const name = nVars <= 3 ? ["x", "y", "z"][j] || `x_{${j + 1}}` : `x_{${j + 1}}`;
      const abs = F(Math.abs(c.n), c.d);
      const coeff =
        abs.n === 1 && abs.d === 1 ? "" : latexF(abs);
      const term = coeff ? `${coeff}${name}` : name;
      if (!parts.length) {
        parts.push(c.n < 0 ? `-${term}` : term);
      } else {
        parts.push(c.n < 0 ? `- ${term}` : `+ ${term}`);
      }
    }
    if (!parts.length) parts.push("0");
    return `${parts.join(" ")} = ${latexF(row[nVars])}`;
  }

  function latexEqs(aug) {
    const nVars = aug[0].length - 1;
    return aug.map((row, i) => `R_{${i + 1}}:\\; ${latexEqFromRow(row, nVars)}`);
  }

  function tex(source) {
    return window.texInline ? window.texInline(source) : source;
  }

  function texD(source) {
    return window.texDisplay ? window.texDisplay(source) : source;
  }

  function htmlMat(m, barAt = null) {
    return `<div class="ch3-math">${texD(latexMat(m, barAt))}</div>`;
  }

  function htmlEqs(aug, highlightRows = []) {
    const lines = latexEqs(aug);
    return `<div class="ch3-eqs">${lines
      .map((line, i) => `<div class="ch3-eq${highlightRows.includes(i) ? " is-changed" : ""}">${tex(line)}</div>`)
      .join("")}</div>`;
  }

  function htmlVec(vec) {
    return tex(latexVec(vec));
  }

  function formatSigned(value, digits = 2) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0";
    const rounded = Math.round(n * 10 ** digits) / 10 ** digits;
    if (Object.is(rounded, -0) || Math.abs(rounded) < 5 * 10 ** -(digits + 1)) return "0";
    return String(rounded);
  }

  function formatCombo(coords) {
    const terms = [];
    coords.forEach((v, i) => {
      const n = Number(v);
      if (!Number.isFinite(n) || Math.abs(n) < 1e-9) return;
      const mag = formatSigned(Math.abs(n));
      const body = mag === "1" ? `e_{${i + 1}}` : `${mag}e_{${i + 1}}`;
      if (!terms.length) terms.push(n < 0 ? `-${body}` : body);
      else terms.push(n < 0 ? `- ${body}` : `+ ${body}`);
    });
    return terms.length ? terms.join(" ") : "0";
  }

  function analyzeAugmented(aug) {
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
    if (inconsistent) {
      rankAug = rankA + 1;
    } else {
      rankAug = A.filter((r) => !r.every(isZero)).length;
    }
    const free = [];
    for (let j = 0; j < n; j += 1) if (!pivots.includes(j)) free.push(j);
    return { rref: A, pivots, free, inconsistent, rankA, rankAug, m, n };
  }

  function rankOf(matrix) {
    const aug = matrix.map((row) => [...row.map((v) => F(v.n, v.d)), F(0)]);
    return analyzeAugmented(aug).rankA;
  }

  function nullspaceBasis(A) {
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
    if (!vectors.length) return { dependent: false, coeffs: [], rank: 0 };
    const n = vectors[0].length;
    const A = Array.from({ length: n }, (_, i) => vectors.map((v) => fromNumber(v[i])));
    const { basis, info } = nullspaceBasis(A);
    if (!basis.length) return { dependent: false, coeffs: [], rank: info.rankA };
    // prefer smallest-integer looking certificate: flip sign so first nonzero > 0
    let coeffs = basis[0].map((c) => F(c.n, c.d));
    const first = coeffs.find((c) => !isZero(c));
    if (first && first.n < 0) coeffs = coeffs.map(neg);
    return { dependent: true, coeffs, rank: info.rankA };
  }

  function latexRelation(coeffs) {
    const parts = [];
    coeffs.forEach((c, i) => {
      if (isZero(c)) return;
      const name = `v_{${i + 1}}`;
      const abs = F(Math.abs(c.n), c.d);
      const coeff = abs.n === 1 && abs.d === 1 ? "" : latexF(abs);
      const term = `${coeff}${name}`;
      if (!parts.length) parts.push(c.n < 0 ? `-${term}` : term);
      else parts.push(c.n < 0 ? `- ${term}` : `+ ${term}`);
    });
    return parts.length ? `${parts.join(" ")} = 0` : "仅零系数";
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
    dep33: {
      label: "相关 3×3",
      A: [
        [1, 2, 3],
        [2, 4, 6],
        [0, 1, 1],
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
    const cssW = Math.max(1, rect.width || canvas.clientWidth || 320);
    const cssH = Math.max(1, rect.height || canvas.clientHeight || 300);
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width: cssW, height: cssH, dpr };
  }

  function drawAxes(ctx, width, height, scale = 40) {
    const p = getPalette();
    const cx = width / 2;
    const cy = height / 2;
    ctx.clearRect(0, 0, width, height);
    // soft panel
    const grd = ctx.createLinearGradient(0, 0, width, height);
    grd.addColorStop(0, p.soft);
    grd.addColorStop(1, p.surface);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.55;
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
    ctx.globalAlpha = 1;

    ctx.strokeStyle = p.muted;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();
    return { cx, cy, scale, p, width, height };
  }

  function toCanvas(pt, frame) {
    return [frame.cx + pt[0] * frame.scale, frame.cy - pt[1] * frame.scale];
  }

  function drawLineFromEq(ctx, frame, a, b, c, color, lineWidth = 2.6) {
    // ax + by = c  →  y = (c - a x)/b
    const { width: W, height: H } = frame;
    const pts = [];
    const pushIf = (x, y) => {
      const [X, Y] = toCanvas([x, y], frame);
      pts.push([X, Y]);
    };
    // sample far points in world coords
    const span = Math.max(W, H) / frame.scale + 2;
    if (Math.abs(b) > 1e-9) {
      pushIf(-span, (c - a * -span) / b);
      pushIf(span, (c - a * span) / b);
    } else if (Math.abs(a) > 1e-9) {
      const x = c / a;
      pushIf(x, -span);
      pushIf(x, span);
    } else {
      return;
    }
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    ctx.lineTo(pts[1][0], pts[1][1]);
    ctx.stroke();
    ctx.restore();
  }

  function drawArrow(ctx, frame, vec, color, label) {
    const [x0, y0] = toCanvas([0, 0], frame);
    const [x1, y1] = toCanvas(vec, frame);
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    if (len < 2) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x0, y0, 4, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    const ang = Math.atan2(dy, dx);
    const head = Math.min(12, Math.max(8, len * 0.12));
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - head * Math.cos(ang - 0.4), y1 - head * Math.sin(ang - 0.4));
    ctx.lineTo(x1 - head * Math.cos(ang + 0.4), y1 - head * Math.sin(ang + 0.4));
    ctx.closePath();
    ctx.fill();
    if (label) {
      ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(label, x1 + 8, y1 - 8);
    }
  }

  function drawPoint(ctx, frame, pt, color, label) {
    const [x, y] = toCanvas(pt, frame);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = frame.p.surface;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (label) {
      ctx.fillStyle = frame.p.text;
      ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(label, x + 9, y - 9);
    }
  }

  function drawSpanDisk(ctx, frame, vectors, color) {
    // rough 2D parallelogram for first two vectors
    if (vectors.length < 2) return;
    const a = vectors[0];
    const b = vectors[1];
    const pts = [
      [0, 0],
      a,
      [a[0] + b[0], a[1] + b[1]],
      b,
    ].map((p) => toCanvas(p, frame));
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach((p) => ctx.lineTo(p[0], p[1]));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function pulseClass(el, cls = "is-pulse") {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function classifySystem(aug) {
    const info = analyzeAugmented(aug);
    if (info.inconsistent) return { key: "none", label: "无解", cls: "is-bad", info };
    if (info.free.length) return { key: "inf", label: "无穷多解", cls: "is-inf", info };
    return { key: "unique", label: "唯一解", cls: "is-ok", info };
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
    matsEqual,
    changedRows,
    latexMat,
    latexVec,
    latexEqs,
    latexRelation,
    tex,
    texD,
    htmlMat,
    htmlEqs,
    htmlVec,
    formatSigned,
    formatCombo,
    analyzeAugmented,
    rankOf,
    nullspaceBasis,
    particularSolution,
    relationCertificate,
    classifySystem,
    PRESETS,
    reducedMotion,
    getPalette,
    sizeCanvas,
    drawAxes,
    drawLineFromEq,
    drawArrow,
    drawPoint,
    drawSpanDisk,
    pulseClass,
    EPS,
  };
})();
