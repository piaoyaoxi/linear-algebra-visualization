/* Chapter 5 shared quadratic-form math and canvas helpers. */
(() => {
  const EPS = 1e-9;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

  function formatNum(value, digits = 2) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0";
    const safe = Math.abs(n) < 5 * 10 ** -(digits + 1) ? 0 : n;
    const rounded = Math.round(safe * 10 ** digits) / 10 ** digits;
    return Object.is(rounded, -0) ? "0" : Number.isInteger(rounded) ? String(rounded) : String(rounded);
  }

  function nearZero(v, tol = 1e-8) {
    return Math.abs(v) < tol;
  }

  function cloneMat(m) {
    return m.map((row) => row.slice());
  }

  function zeros(n) {
    return Array.from({ length: n }, () => Array(n).fill(0));
  }

  function identity(n) {
    const I = zeros(n);
    for (let i = 0; i < n; i++) I[i][i] = 1;
    return I;
  }

  function transpose(m) {
    const n = m.length;
    const p = m[0].length;
    const t = Array.from({ length: p }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) for (let j = 0; j < p; j++) t[j][i] = m[i][j];
    return t;
  }

  function matMul(A, B) {
    const n = A.length;
    const m = B[0].length;
    const k = B.length;
    const C = Array.from({ length: n }, () => Array(m).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        let s = 0;
        for (let t = 0; t < k; t++) s += A[i][t] * B[t][j];
        C[i][j] = s;
      }
    }
    return C;
  }

  function matVec(A, x) {
    return A.map((row) => row.reduce((s, a, j) => s + a * x[j], 0));
  }

  function det2(m) {
    return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  }

  function det3(m) {
    const [[a, b, c], [d, e, f], [g, h, i]] = m;
    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  }

  function det(m) {
    if (m.length === 1) return m[0][0];
    if (m.length === 2) return det2(m);
    if (m.length === 3) return det3(m);
    throw new Error("det supports n≤3");
  }

  function symmetrize(m) {
    const n = m.length;
    const S = zeros(n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        S[i][j] = 0.5 * (m[i][j] + m[j][i]);
      }
    }
    return S;
  }

  function skewPart(m) {
    const n = m.length;
    const K = zeros(n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        K[i][j] = 0.5 * (m[i][j] - m[j][i]);
      }
    }
    return K;
  }

  function isSymmetric(m, tol = 1e-8) {
    for (let i = 0; i < m.length; i++) {
      for (let j = i + 1; j < m.length; j++) {
        if (Math.abs(m[i][j] - m[j][i]) > tol) return false;
      }
    }
    return true;
  }

  /** Quadratic form value x^T A x. */
  function qForm(A, x) {
    const Ax = matVec(A, x);
    return x.reduce((s, xi, i) => s + xi * Ax[i], 0);
  }

  /** Build symmetric matrix from 2-var coeffs a,b,c where f=a x^2 + 2b xy + c y^2. */
  function mat2FromAbc(a, b, c) {
    return [
      [a, b],
      [b, c],
    ];
  }

  function abcFromMat2(A) {
    return { a: A[0][0], b: A[0][1], c: A[1][1] };
  }

  /** Polynomial string for 2×2 symmetric matrix. */
  function polyTex2(A) {
    const { a, b, c } = abcFromMat2(A);
    const parts = [];
    const push = (coef, mono) => {
      if (nearZero(coef)) return;
      const abs = formatNum(Math.abs(coef), 3);
      const sign = coef < 0 ? " - " : parts.length ? " + " : "";
      const body = abs === "1" && mono ? mono : `${abs}${mono ? mono : ""}`;
      parts.push(sign + (coef < 0 && !parts.length ? `-${body}` : body));
    };
    // rebuild carefully
    const terms = [];
    if (!nearZero(a)) terms.push({ c: a, m: "x_1^2" });
    if (!nearZero(2 * b)) terms.push({ c: 2 * b, m: "x_1x_2" });
    if (!nearZero(c)) terms.push({ c: c, m: "x_2^2" });
    if (!terms.length) return "0";
    return terms
      .map((t, i) => {
        const abs = formatNum(Math.abs(t.c), 3);
        const core = abs === "1" ? t.m : `${abs}${t.m}`;
        if (i === 0) return t.c < 0 ? `-${core}` : core;
        return t.c < 0 ? `-${core}` : `+${core}`;
      })
      .join("");
  }

  function polyPlain2(A) {
    return polyTex2(A)
      .replace(/x_1/g, "x₁")
      .replace(/x_2/g, "x₂")
      .replace(/\^2/g, "²");
  }

  function congruence(A, C) {
    return matMul(transpose(C), matMul(A, C));
  }

  function leadingMinors(A) {
    const n = A.length;
    const deltas = [];
    for (let k = 1; k <= n; k++) {
      const block = A.slice(0, k).map((row) => row.slice(0, k));
      deltas.push(det(block));
    }
    return deltas;
  }

  /** Rank via Gaussian elimination with partial pivoting (for n≤3). */
  function matrixRank(A, tol = 1e-8) {
    const M = cloneMat(A);
    const n = M.length;
    let rank = 0;
    let row = 0;
    for (let col = 0; col < n && row < n; col++) {
      let pivot = row;
      for (let i = row + 1; i < n; i++) {
        if (Math.abs(M[i][col]) > Math.abs(M[pivot][col])) pivot = i;
      }
      if (Math.abs(M[pivot][col]) < tol) continue;
      if (pivot !== row) {
        const tmp = M[row];
        M[row] = M[pivot];
        M[pivot] = tmp;
      }
      const div = M[row][col];
      for (let j = col; j < n; j++) M[row][j] /= div;
      for (let i = 0; i < n; i++) {
        if (i === row) continue;
        const factor = M[i][col];
        for (let j = col; j < n; j++) M[i][j] -= factor * M[row][j];
      }
      rank += 1;
      row += 1;
    }
    return rank;
  }

  /**
   * Inertia (p,q) for real symmetric 2×2 via eigenvalues of characteristic poly.
   * For 3×3 uses characteristic roots numerically for display (symmetric QR-lite).
   */
  function inertiaSymmetric(A) {
    const n = A.length;
    if (n === 2) {
      const tr = A[0][0] + A[1][1];
      const d = det2(A);
      const disc = Math.max(0, tr * tr - 4 * d);
      const s = Math.sqrt(disc);
      const l1 = 0.5 * (tr + s);
      const l2 = 0.5 * (tr - s);
      let p = 0;
      let q = 0;
      let z = 0;
      [l1, l2].forEach((l) => {
        if (l > 1e-8) p += 1;
        else if (l < -1e-8) q += 1;
        else z += 1;
      });
      return { p, q, zero: z, rank: p + q, signature: p - q, eigenvalues: [l1, l2] };
    }
    if (n === 1) {
      const l = A[0][0];
      const p = l > 1e-8 ? 1 : 0;
      const q = l < -1e-8 ? 1 : 0;
      return { p, q, zero: 1 - p - q, rank: p + q, signature: p - q, eigenvalues: [l] };
    }
    // 3×3: Jacobi-like off-diagonal sweep
    const M = cloneMat(A);
    for (let iter = 0; iter < 40; iter++) {
      let maxAbs = 0;
      let pi = 0;
      let pj = 1;
      for (let i = 0; i < 3; i++) {
        for (let j = i + 1; j < 3; j++) {
          if (Math.abs(M[i][j]) > maxAbs) {
            maxAbs = Math.abs(M[i][j]);
            pi = i;
            pj = j;
          }
        }
      }
      if (maxAbs < 1e-10) break;
      const app = M[pi][pi];
      const aqq = M[pj][pj];
      const apq = M[pi][pj];
      const tau = (aqq - app) / (2 * apq);
      const t = Math.sign(tau) / (Math.abs(tau) + Math.sqrt(1 + tau * tau));
      const c = 1 / Math.sqrt(1 + t * t);
      const s = t * c;
      for (let k = 0; k < 3; k++) {
        if (k === pi || k === pj) continue;
        const mik = M[k][pi];
        const mjk = M[k][pj];
        M[k][pi] = M[pi][k] = c * mik - s * mjk;
        M[k][pj] = M[pj][k] = s * mik + c * mjk;
      }
      M[pi][pi] = app - t * apq;
      M[pj][pj] = aqq + t * apq;
      M[pi][pj] = M[pj][pi] = 0;
    }
    const eigs = [M[0][0], M[1][1], M[2][2]];
    let p = 0;
    let q = 0;
    let z = 0;
    eigs.forEach((l) => {
      if (l > 1e-8) p += 1;
      else if (l < -1e-8) q += 1;
      else z += 1;
    });
    return { p, q, zero: z, rank: p + q, signature: p - q, eigenvalues: eigs };
  }

  function classify2(A) {
    const { a, b, c } = abcFromMat2(A);
    const d1 = a;
    const d2 = a * c - b * b;
    const inn = inertiaSymmetric(A);
    if (inn.p === 2 && inn.q === 0) return { key: "pd", label: "正定", cls: "is-ok" };
    if (inn.p === 0 && inn.q === 2) return { key: "nd", label: "负定", cls: "is-bad" };
    if (inn.p === 1 && inn.q === 1) return { key: "indef", label: "不定", cls: "is-warn" };
    if (inn.p >= 1 && inn.q === 0 && inn.zero >= 1) return { key: "psd", label: "半正定", cls: "is-warn" };
    if (inn.q >= 1 && inn.p === 0 && inn.zero >= 1) return { key: "nsd", label: "半负定", cls: "is-warn" };
    if (inn.rank === 0) return { key: "zero", label: "零二次型", cls: "is-muted" };
    return { key: "other", label: "退化", cls: "is-muted", d1, d2 };
  }

  function sylvesterPositive(A) {
    const deltas = leadingMinors(A);
    return { deltas, ok: deltas.every((d) => d > 1e-8) };
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
      pos: style.getPropertyValue("--accent").trim() || "#0f8f88",
      neg: style.getPropertyValue("--blue").trim() || "#3d5a9e",
      zero: style.getPropertyValue("--muted").trim() || "#8892a0",
    };
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

  function pulseClass(el, cls = "is-pulse") {
    if (!el) return;
    el.classList.remove(cls);
    // force reflow
    void el.offsetWidth;
    el.classList.add(cls);
  }

  /** Draw 2D level sets of f(x,y)=x^T A x on a fixed camera. */
  function drawContours(canvas, A, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const half = options.half ?? 2.4;
    const levels = options.levels || [-2, -1, -0.5, 0.5, 1, 2];
    const origin = { x: width / 2, y: height / 2 };
    const scale = Math.min(width, height) / (2 * half);

    ctx.fillStyle = palette.soft;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    // axes
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(width, origin.y);
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, height);
    ctx.stroke();

    const toWorld = (px, py) => [(px - origin.x) / scale, (origin.y - py) / scale];
    const sample = (x, y) => qForm(A, [x, y]);

    // heat background
    const step = 4;
    for (let py = 0; py < height; py += step) {
      for (let px = 0; px < width; px += step) {
        const [x, y] = toWorld(px + step / 2, py + step / 2);
        const v = sample(x, y);
        if (v > 0.02) {
          ctx.fillStyle = palette.pos;
          ctx.globalAlpha = clamp(0.05 + Math.min(0.22, v * 0.08), 0, 0.28);
          ctx.fillRect(px, py, step, step);
        } else if (v < -0.02) {
          ctx.fillStyle = palette.neg;
          ctx.globalAlpha = clamp(0.05 + Math.min(0.22, -v * 0.08), 0, 0.28);
          ctx.fillRect(px, py, step, step);
        }
      }
    }
    ctx.globalAlpha = 1;

    // marching-squares lite for levels
    levels.forEach((level) => {
      ctx.strokeStyle = level > 0 ? palette.pos : level < 0 ? palette.neg : palette.zero;
      ctx.lineWidth = level === 0 ? 2 : 1.4;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      const res = 48;
      for (let i = 0; i < res; i++) {
        for (let j = 0; j < res; j++) {
          const x0 = -half + (2 * half * i) / res;
          const y0 = -half + (2 * half * j) / res;
          const x1 = -half + (2 * half * (i + 1)) / res;
          const y1 = -half + (2 * half * (j + 1)) / res;
          const v00 = sample(x0, y0) - level;
          const v10 = sample(x1, y0) - level;
          const v01 = sample(x0, y1) - level;
          const v11 = sample(x1, y1) - level;
          const crossings = [];
          const edge = (va, vb, ax, ay, bx, by) => {
            if (va === 0 && vb === 0) return;
            if (va * vb > 0) return;
            const t = va / (va - vb);
            crossings.push([ax + t * (bx - ax), ay + t * (by - ay)]);
          };
          edge(v00, v10, x0, y0, x1, y0);
          edge(v10, v11, x1, y0, x1, y1);
          edge(v11, v01, x1, y1, x0, y1);
          edge(v01, v00, x0, y1, x0, y0);
          if (crossings.length >= 2) {
            const [p, q] = crossings;
            ctx.moveTo(origin.x + p[0] * scale, origin.y - p[1] * scale);
            ctx.lineTo(origin.x + q[0] * scale, origin.y - q[1] * scale);
          }
        }
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    if (options.caption) {
      ctx.fillStyle = palette.muted;
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(options.caption, 12, height - 12);
    }
  }

  /** Unit circle scanner: q(θ)=x(θ)^T A x(θ). */
  function drawUnitCircleScan(canvas, A, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const pad = 28;
    const samples = 180;
    const values = [];
    for (let i = 0; i <= samples; i++) {
      const th = (2 * Math.PI * i) / samples;
      const x = [Math.cos(th), Math.sin(th)];
      values.push(qForm(A, x));
    }
    let minV = Math.min(...values, -0.5);
    let maxV = Math.max(...values, 0.5);
    if (Math.abs(maxV - minV) < 1e-6) {
      minV -= 1;
      maxV += 1;
    }
    const xAt = (i) => pad + ((width - 2 * pad) * i) / samples;
    const yAt = (v) => {
      const t = (v - minV) / (maxV - minV);
      return height - pad - t * (height - 2 * pad);
    };

    ctx.fillStyle = palette.soft;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    // zero line
    ctx.strokeStyle = palette.line;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad, yAt(0));
    ctx.lineTo(width - pad, yAt(0));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = palette.accentStrong;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = xAt(i);
      const y = yAt(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // fill positive / negative bands lightly
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = palette.pos;
    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(0));
    values.forEach((v, i) => {
      if (v >= 0) ctx.lineTo(xAt(i), yAt(v));
      else ctx.lineTo(xAt(i), yAt(0));
    });
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = palette.muted;
    ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(options.caption || "单位圆方向值 q(θ)", 12, 16);
    ctx.fillText(`min ${formatNum(Math.min(...values), 3)} · max ${formatNum(Math.max(...values), 3)}`, 12, height - 10);
  }

  /** Simple isometric-ish surface z = f(x,y) wireframe. */
  function drawSurface(canvas, A, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    const palette = getPalette();
    const half = options.half ?? 1.6;
    const res = options.res ?? 18;
    const origin = { x: width * 0.5, y: height * 0.62 };
    const scale = Math.min(width, height) * 0.22;

    ctx.fillStyle = palette.soft;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    const project = (x, y, z) => {
      const isoX = (x - y) * scale * 0.9;
      const isoY = (x + y) * scale * 0.35 - z * scale * 0.55;
      return { x: origin.x + isoX, y: origin.y + isoY };
    };

    const grid = [];
    for (let i = 0; i <= res; i++) {
      const row = [];
      for (let j = 0; j <= res; j++) {
        const x = -half + (2 * half * i) / res;
        const y = -half + (2 * half * j) / res;
        const z = qForm(A, [x, y]);
        row.push({ x, y, z, p: project(x, y, clamp(z, -4, 4)) });
      }
      grid.push(row);
    }

    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const a = grid[i][j];
        const b = grid[i + 1][j];
        const c = grid[i][j + 1];
        const zMid = (a.z + b.z + c.z) / 3;
        ctx.strokeStyle = zMid >= 0 ? palette.pos : palette.neg;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.p.x, a.p.y);
        ctx.lineTo(b.p.x, b.p.y);
        ctx.moveTo(a.p.x, a.p.y);
        ctx.lineTo(c.p.x, c.p.y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // axes
    const o = project(0, 0, 0);
    const ex = project(half, 0, 0);
    const ey = project(0, half, 0);
    const ez = project(0, 0, 1.2);
    ctx.strokeStyle = palette.muted;
    ctx.lineWidth = 1.2;
    [[ex, "x₁"], [ey, "x₂"], [ez, "f"]].forEach(([p, label]) => {
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.fillStyle = palette.muted;
      ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(label, p.x + 4, p.y);
    });

    if (options.caption) {
      ctx.fillStyle = palette.muted;
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(options.caption, 12, height - 12);
    }
  }

  function matrixHtml(A, options = {}) {
    const digits = options.digits ?? 2;
    const highlight = options.highlight || null;
    const rows = A.map((row, i) => {
      const cells = row
        .map((v, j) => {
          const active = highlight && highlight.i === i && highlight.j === j;
          const twin = highlight && highlight.i === j && highlight.j === i && i !== j;
          const cls = active ? " is-hot" : twin ? " is-twin" : "";
          return `<span class="ch5-cell${cls}" data-i="${i}" data-j="${j}">${formatNum(v, digits)}</span>`;
        })
        .join("");
      return `<div class="ch5-matrix-row">${cells}</div>`;
    }).join("");
    return `<div class="ch5-matrix" role="table">${rows}</div>`;
  }

  // —— Complete-the-square demo for f = a x^2 + 2b xy + c y^2 with a≠0 ——
  function completeSquareSteps2(A) {
    const { a, b, c } = abcFromMat2(A);
    if (nearZero(a)) {
      return {
        ok: false,
        reason: "当前主平方项 a 接近 0，请先做和差替换或换元再配方。",
        steps: [],
      };
    }
    const steps = [];
    steps.push({
      title: "选取主平方项",
      poly: polyPlain2(A),
      note: `以 ${formatNum(a)} x₁² 为主项，收集含 x₁ 的项。`,
    });
    const ratio = b / a;
    steps.push({
      title: "完成平方",
      poly: `${formatNum(a)}(x₁ + ${formatNum(ratio)} x₂)² + ${formatNum(c - (b * b) / a)} x₂²`,
      note: `配方：a(x₁ + (b/a)x₂)² + (c − b²/a)x₂²。`,
    });
    const d2 = c - (b * b) / a;
    steps.push({
      title: "定义新变量",
      poly: `${formatNum(a)} y₁² + ${formatNum(d2)} y₂²`,
      note: `令 y₁ = x₁ + ${formatNum(ratio)} x₂，y₂ = x₂。替换矩阵 C = [[1, ${formatNum(ratio)}],[0, 1]]（按 x=Cy 的列含义时需写成相应形式）。`,
      C: [
        [1, -ratio],
        [0, 1],
      ],
      // x = C y with y1 = x1 + ratio x2, y2 = x2 ⇒ x1 = y1 - ratio y2, x2 = y2
      standard: [a, d2],
    });
    // fix C for x=Cy: [x1,x2]^T = [[1,-ratio],[0,1]] [y1,y2]
    const C = [
      [1, -ratio],
      [0, 1],
    ];
    const D = congruence(A, C);
    steps.push({
      title: "合同验证",
      poly: polyPlain2(symmetrize(D)),
      note: `CᵀAC 应接近对角：diag(${formatNum(a)}, ${formatNum(d2)})。`,
      C,
      D: symmetrize(D),
    });
    return { ok: true, steps, C, standard: [a, d2] };
  }

  function cholesky2(A) {
    const { a, b, c } = abcFromMat2(A);
    if (a <= 1e-10) return { ok: false, step: 1, reason: "主元 a≤0，无法开平方。" };
    const r11 = Math.sqrt(a);
    const r12 = b / r11;
    const rem = c - r12 * r12;
    if (rem <= 1e-10) return { ok: false, step: 2, reason: "第二主元 ≤0，标准 Cholesky 中断。", Rpartial: [[r11, r12], [0, 0]] };
    const r22 = Math.sqrt(rem);
    return {
      ok: true,
      R: [
        [r11, r12],
        [0, r22],
      ],
    };
  }

  window.Ch5Math = {
    EPS,
    clamp,
    reducedMotion,
    formatNum,
    nearZero,
    cloneMat,
    zeros,
    identity,
    transpose,
    matMul,
    matVec,
    det2,
    det3,
    det,
    symmetrize,
    skewPart,
    isSymmetric,
    qForm,
    mat2FromAbc,
    abcFromMat2,
    polyTex2,
    polyPlain2,
    congruence,
    leadingMinors,
    matrixRank,
    inertiaSymmetric,
    classify2,
    sylvesterPositive,
    getPalette,
    setupCanvas,
    pulseClass,
    drawContours,
    drawUnitCircleScan,
    drawSurface,
    matrixHtml,
    completeSquareSteps2,
    cholesky2,
  };
})();
