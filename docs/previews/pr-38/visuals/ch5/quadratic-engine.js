/* Chapter 5 shared quadratic-form math and canvas helpers. */
(() => {
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

  function formatNum(value, digits = 2) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0";
    const thr = 5 * 10 ** -(digits + 1);
    const safe = Math.abs(n) < thr ? 0 : n;
    const rounded = Math.round(safe * 10 ** digits) / 10 ** digits;
    if (Object.is(rounded, -0) || rounded === 0) return "0";
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  }

  function nearZero(v, tol = 1e-9) {
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

  function det(m) {
    if (m.length === 1) return m[0][0];
    if (m.length === 2) return det2(m);
    const [[a, b, c], [d, e, f], [g, h, i]] = m;
    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  }

  function symmetrize(m) {
    const n = m.length;
    const S = zeros(n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) S[i][j] = 0.5 * (m[i][j] + m[j][i]);
    }
    return S;
  }

  function qForm(A, x) {
    const Ax = matVec(A, x);
    return x.reduce((s, xi, i) => s + xi * Ax[i], 0);
  }

  /** f = a x1^2 + 2b x1 x2 + c x2^2  ↔  symmetric [[a,b],[b,c]] */
  function mat2FromAbc(a, b, c) {
    return [
      [a, b],
      [b, c],
    ];
  }

  function abcFromMat2(A) {
    return { a: A[0][0], b: A[0][1], c: A[1][1] };
  }

  /** KaTeX body without surrounding $ : e.g. 2x_{1}^{2}+1.6x_{1}x_{2} */
  function polyTex2(A) {
    const { a, b, c } = abcFromMat2(A);
    const terms = [];
    const push = (coef, mono) => {
      if (nearZero(coef)) return;
      terms.push({ coef, mono });
    };
    push(a, "x_{1}^{2}");
    push(2 * b, "x_{1}x_{2}");
    push(c, "x_{2}^{2}");
    if (!terms.length) return "0";
    return terms
      .map((t, i) => {
        const abs = formatNum(Math.abs(t.coef), 3);
        const unit = abs === "1" ? t.mono : `${abs}${t.mono}`;
        if (i === 0) return t.coef < 0 ? `-${unit}` : unit;
        return t.coef < 0 ? `-${unit}` : `+${unit}`;
      })
      .join("");
  }

  function polyPlain2(A) {
    return polyTex2(A)
      .replace(/x_\{1\}/g, "x₁")
      .replace(/x_\{2\}/g, "x₂")
      .replace(/\^\{2\}/g, "²")
      .replace(/\^2/g, "²");
  }

  function congruence(A, C) {
    return matMul(transpose(C), matMul(A, C));
  }

  function leadingMinors(A) {
    const deltas = [];
    for (let k = 1; k <= A.length; k++) {
      const block = A.slice(0, k).map((row) => row.slice(0, k));
      deltas.push(det(block));
    }
    return deltas;
  }

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

  /** Real symmetric 2×2 eigenvalues (sorted descending). */
  function eigenvalues2(A) {
    const tr = A[0][0] + A[1][1];
    const d = det2(A);
    const disc = Math.max(0, tr * tr - 4 * d);
    const s = Math.sqrt(disc);
    const l1 = 0.5 * (tr + s);
    const l2 = 0.5 * (tr - s);
    return l1 >= l2 ? [l1, l2] : [l2, l1];
  }

  function inertiaSymmetric(A) {
    if (A.length === 1) {
      const l = A[0][0];
      const p = l > 1e-8 ? 1 : 0;
      const q = l < -1e-8 ? 1 : 0;
      return { p, q, zero: 1 - p - q, rank: p + q, signature: p - q, eigenvalues: [l] };
    }
    const eigs = eigenvalues2(A);
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
    const inn = inertiaSymmetric(A);
    if (inn.rank === 0) return { key: "zero", label: "零二次型", cls: "is-muted", inn };
    if (inn.p === 2 && inn.q === 0) return { key: "pd", label: "正定", cls: "is-ok", inn };
    if (inn.p === 0 && inn.q === 2) return { key: "nd", label: "负定", cls: "is-bad", inn };
    if (inn.p === 1 && inn.q === 1) return { key: "indef", label: "不定", cls: "is-warn", inn };
    if (inn.p >= 1 && inn.q === 0) return { key: "psd", label: "半正定", cls: "is-warn", inn };
    if (inn.q >= 1 && inn.p === 0) return { key: "nsd", label: "半负定", cls: "is-warn", inn };
    return { key: "other", label: "退化", cls: "is-muted", inn };
  }

  function sylvesterPositive(A) {
    const deltas = leadingMinors(A);
    return { deltas, ok: deltas.every((d) => d > 1e-8) };
  }

  /**
   * Complete-the-square for binary form with a ≠ 0.
   * y1 = x1 + (b/a) x2, y2 = x2
   * ⇔ x = C y with C = [[1, -b/a], [0, 1]]
   */
  function completeSquareSteps2(A) {
    const { a, b, c } = abcFromMat2(A);
    if (nearZero(a)) {
      if (!nearZero(b)) {
        return sumDiffThenSquare(A);
      }
      if (nearZero(c)) {
        return {
          ok: true,
          steps: [{ title: "零二次型", poly: "0", note: "已是标准形。", kind: "done", matrix: mat2FromAbc(0, 0, 0), C: identity(2) }],
          C: identity(2),
          standard: [0, 0],
          D: mat2FromAbc(0, 0, 0),
        };
      }
      return {
        ok: true,
        steps: [
          {
            title: "已无交叉项",
            poly: polyPlain2(A),
            note: "a=0 且 b=0，本身已是对角标准形。",
            kind: "done",
            matrix: mat2FromAbc(0, 0, c),
            C: identity(2),
          },
        ],
        C: identity(2),
        standard: [0, c],
        D: mat2FromAbc(0, 0, c),
      };
    }

    const r = b / a;
    const d2 = c - (b * b) / a;
    const C = [
      [1, -r],
      [0, 1],
    ];
    const D = symmetrize(congruence(A, C));

    const steps = [
      {
        title: "起点",
        poly: polyPlain2(A),
        note: "目标：消去交叉项，得到只含平方项的标准形。",
        kind: "start",
        matrix: cloneMat(A),
      },
      {
        title: "选取主平方项",
        poly: `${formatNum(a)} x₁² + ${formatNum(2 * b)} x₁x₂ + ${formatNum(c)} x₂²`,
        note: `以系数非零的 x₁² 为主项，把所有含 x₁ 的项归到一起。`,
        kind: "pick",
        matrix: cloneMat(A),
      },
      {
        title: "完成平方",
        poly: `${formatNum(a)}(x₁ + ${formatNum(r)} x₂)² + ${formatNum(d2)} x₂²`,
        note: `配方恒等式：a x₁² + 2b x₁x₂ = a(x₁ + (b/a)x₂)² − (b²/a)x₂²。`,
        kind: "square",
        matrix: cloneMat(A),
      },
      {
        title: "变量替换",
        poly: `${formatNum(a)} y₁² + ${formatNum(d2)} y₂²`,
        note: `令 y₁ = x₁ + ${formatNum(r)} x₂，y₂ = x₂。反解得 x₁ = y₁ − ${formatNum(r)} y₂，x₂ = y₂，即 x = C y。`,
        kind: "sub",
        C: cloneMat(C),
        matrix: cloneMat(D),
      },
      {
        title: "合同验证",
        poly: polyPlain2(D),
        note: `新矩阵 B = Cᵀ A C 应为对角矩阵 diag(${formatNum(a)}, ${formatNum(d2)})。交叉项已消失。`,
        kind: "check",
        C: cloneMat(C),
        matrix: cloneMat(D),
      },
    ];

    return { ok: true, steps, C, standard: [a, d2], D, method: "square" };
  }

  /** Pure cross term 2b x1 x2: first y1=x1+x2, y2=x1-x2 style via x=C y. */
  function sumDiffThenSquare(A) {
    const { a, b, c } = abcFromMat2(A);
    // C such that x1 = (y1+y2)/2, x2 = (y1-y2)/2  →  C = [[1/2,1/2],[1/2,-1/2]]
    // Then f = 2b x1 x2 becomes (b/2)(y1² - y2²) when a=c=0.
    const C = [
      [0.5, 0.5],
      [0.5, -0.5],
    ];
    const D = symmetrize(congruence(A, C));
    const steps = [
      {
        title: "无平方项",
        poly: polyPlain2(A),
        note: "主对角接近 0 时，直接对 x₁ 配方会失败。先做和差替换，让平方项出现。",
        kind: "start",
        matrix: cloneMat(A),
      },
      {
        title: "和差替换",
        poly: "x₁ = (y₁+y₂)/2，x₂ = (y₁−y₂)/2",
        note: "这是可逆替换（det C = −1/2 ≠ 0）。交叉项会变成平方差。",
        kind: "sub",
        C: cloneMat(C),
        matrix: cloneMat(A),
      },
      {
        title: "得到对角形",
        poly: polyPlain2(D),
        note: "B = Cᵀ A C 已无交叉项（数值上接近对角）。",
        kind: "check",
        C: cloneMat(C),
        matrix: cloneMat(D),
      },
    ];
    return {
      ok: true,
      steps,
      C,
      standard: [D[0][0], D[1][1]],
      D,
      method: "sumdiff",
    };
  }

  function cholesky2(A) {
    const { a, b, c } = abcFromMat2(A);
    if (a <= 1e-10) return { ok: false, step: 1, reason: "第一个主元 a ≤ 0，不能开平方。" };
    const r11 = Math.sqrt(a);
    const r12 = b / r11;
    const rem = c - r12 * r12;
    if (rem <= 1e-10) {
      return {
        ok: false,
        step: 2,
        reason: "第二个主元 ≤ 0，标准 Cholesky 在这一步中断。",
        Rpartial: [
          [r11, r12],
          [0, 0],
        ],
      };
    }
    return {
      ok: true,
      R: [
        [r11, r12],
        [0, Math.sqrt(rem)],
      ],
    };
  }

  function getPalette() {
    const style = getComputedStyle(document.body);
    const g = (name, fb) => style.getPropertyValue(name).trim() || fb;
    return {
      surface: g("--surface-solid", "#ffffff"),
      soft: g("--surface-soft", "#eef4f6"),
      text: g("--text", "#071512"),
      muted: g("--muted", "#66717f"),
      line: g("--line-strong", "rgba(28,43,61,.2)"),
      accent: g("--accent", "#0f8f88"),
      accentStrong: g("--accent-strong", "#08736e"),
      coral: g("--coral", "#d9835f"),
      blue: g("--blue", "#547ec8"),
      pos: g("--accent", "#0f8f88"),
      neg: g("--blue", "#3d5a9e"),
      zero: g("--muted", "#8892a0"),
    };
  }

  function setupCanvas(canvas) {
    if (!canvas) return { ctx: null, width: 0, height: 0 };
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
    void el.offsetWidth;
    el.classList.add(cls);
  }

  /** Level sets via polar sampling: r² = L / q(uθ). Cleaner than marching squares. */
  function drawContours(canvas, A, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    if (!ctx) return;
    const palette = getPalette();
    const half = options.half ?? 2.6;
    const origin = { x: width / 2, y: height / 2 };
    const scale = Math.min(width, height) / (2 * half);

    // soft background
    ctx.fillStyle = palette.soft;
    ctx.globalAlpha = 0.45;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    // sign field (coarse)
    const step = 6;
    for (let py = 0; py < height; py += step) {
      for (let px = 0; px < width; px += step) {
        const x = (px + step / 2 - origin.x) / scale;
        const y = (origin.y - (py + step / 2)) / scale;
        const v = qForm(A, [x, y]);
        if (v > 0.03) {
          ctx.fillStyle = palette.pos;
          ctx.globalAlpha = 0.08;
          ctx.fillRect(px, py, step, step);
        } else if (v < -0.03) {
          ctx.fillStyle = palette.neg;
          ctx.globalAlpha = 0.1;
          ctx.fillRect(px, py, step, step);
        }
      }
    }
    ctx.globalAlpha = 1;

    // axes
    ctx.strokeStyle = palette.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(12, origin.y);
    ctx.lineTo(width - 12, origin.y);
    ctx.moveTo(origin.x, 12);
    ctx.lineTo(origin.x, height - 12);
    ctx.stroke();
    ctx.fillStyle = palette.muted;
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("x₁", width - 22, origin.y - 8);
    ctx.fillText("x₂", origin.x + 8, 18);

    const levels = options.levels || [-2, -1, -0.5, 0.5, 1, 2];
    levels.forEach((level) => {
      if (nearZero(level)) return;
      ctx.strokeStyle = level > 0 ? palette.pos : palette.neg;
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = 0.92;
      ctx.beginPath();
      let penDown = false;
      const N = 240;
      for (let i = 0; i <= N; i++) {
        const th = (2 * Math.PI * i) / N;
        const ux = Math.cos(th);
        const uy = Math.sin(th);
        const q = qForm(A, [ux, uy]);
        if (q * level <= 1e-12 || Math.abs(q) < 1e-12) {
          penDown = false;
          continue;
        }
        const r = Math.sqrt(level / q);
        if (!Number.isFinite(r) || r > half * 1.35) {
          penDown = false;
          continue;
        }
        const px = origin.x + r * ux * scale;
        const py = origin.y - r * uy * scale;
        if (!penDown) {
          ctx.moveTo(px, py);
          penDown = true;
        } else ctx.lineTo(px, py);
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // zero set: directions with q=0 (asymptotes for indefinite)
    const inn = inertiaSymmetric(A);
    if (inn.p > 0 && inn.q > 0) {
      ctx.strokeStyle = palette.zero;
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 180; i++) {
        const th = (Math.PI * i) / 180;
        const q = qForm(A, [Math.cos(th), Math.sin(th)]);
        if (Math.abs(q) < 0.02) {
          const ux = Math.cos(th);
          const uy = Math.sin(th);
          ctx.beginPath();
          ctx.moveTo(origin.x - half * ux * scale, origin.y + half * uy * scale);
          ctx.lineTo(origin.x + half * ux * scale, origin.y - half * uy * scale);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }

    if (options.caption) {
      ctx.fillStyle = palette.muted;
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(options.caption, 12, height - 12);
    }
  }

  function drawUnitCircleScan(canvas, A, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    if (!ctx) return;
    const palette = getPalette();
    const padL = 36;
    const padR = 16;
    const padT = 22;
    const padB = 28;
    const samples = 200;
    const values = [];
    for (let i = 0; i <= samples; i++) {
      const th = (2 * Math.PI * i) / samples;
      values.push(qForm(A, [Math.cos(th), Math.sin(th)]));
    }
    let minV = Math.min(...values, 0);
    let maxV = Math.max(...values, 0);
    if (Math.abs(maxV - minV) < 1e-8) {
      minV -= 1;
      maxV += 1;
    }
    // pad vertical range
    const span = maxV - minV;
    minV -= span * 0.08;
    maxV += span * 0.08;

    const xAt = (i) => padL + ((width - padL - padR) * i) / samples;
    const yAt = (v) => padT + (1 - (v - minV) / (maxV - minV)) * (height - padT - padB);

    ctx.fillStyle = palette.soft;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    // zero line
    ctx.strokeStyle = palette.line;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padL, yAt(0));
    ctx.lineTo(width - padR, yAt(0));
    ctx.stroke();
    ctx.setLineDash([]);

    // fill above zero
    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(0));
    values.forEach((v, i) => ctx.lineTo(xAt(i), yAt(Math.max(v, 0))));
    ctx.lineTo(xAt(samples), yAt(0));
    ctx.closePath();
    ctx.fillStyle = palette.pos;
    ctx.globalAlpha = 0.12;
    ctx.fill();
    ctx.globalAlpha = 1;

    // fill below zero
    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(0));
    values.forEach((v, i) => ctx.lineTo(xAt(i), yAt(Math.min(v, 0))));
    ctx.lineTo(xAt(samples), yAt(0));
    ctx.closePath();
    ctx.fillStyle = palette.neg;
    ctx.globalAlpha = 0.12;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = palette.accentStrong;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = xAt(i);
      const y = yAt(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = palette.muted;
    ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(options.caption || "单位圆方向值 q(θ) = x(θ)ᵀ A x(θ)", 12, 16);
    ctx.fillText(`min ${formatNum(Math.min(...values), 3)} · max ${formatNum(Math.max(...values), 3)}`, 12, height - 10);
    ctx.fillText("0", 8, yAt(0) + 4);
  }

  /** Cleaner wire surface with z-clipping by depth order (painter). */
  function drawSurface(canvas, A, options = {}) {
    const { ctx, width, height } = setupCanvas(canvas);
    if (!ctx) return;
    const palette = getPalette();
    const half = options.half ?? 1.5;
    const res = options.res ?? 16;
    const origin = { x: width * 0.5, y: height * 0.58 };
    const scale = Math.min(width, height) * 0.2;

    ctx.fillStyle = palette.soft;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    const project = (x, y, z) => {
      const zz = clamp(z, -3.5, 3.5);
      const isoX = (x - y) * scale * 0.95;
      const isoY = (x + y) * scale * 0.32 - zz * scale * 0.5;
      return { x: origin.x + isoX, y: origin.y + isoY, depth: x + y + zz * 0.2 };
    };

    const quads = [];
    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const x0 = -half + (2 * half * i) / res;
        const y0 = -half + (2 * half * j) / res;
        const x1 = -half + (2 * half * (i + 1)) / res;
        const y1 = -half + (2 * half * (j + 1)) / res;
        const pts = [
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ].map(([x, y]) => {
          const z = qForm(A, [x, y]);
          return { ...project(x, y, z), z };
        });
        const zMid = pts.reduce((s, p) => s + p.z, 0) / 4;
        const depth = pts.reduce((s, p) => s + p.depth, 0) / 4;
        quads.push({ pts, zMid, depth });
      }
    }
    quads.sort((a, b) => a.depth - b.depth);
    quads.forEach((q) => {
      ctx.beginPath();
      q.pts.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = q.zMid >= 0 ? palette.pos : palette.neg;
      ctx.globalAlpha = 0.14;
      ctx.fill();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = q.zMid >= 0 ? palette.pos : palette.neg;
      ctx.lineWidth = 0.9;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

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
          let cls = "";
          if (highlight) {
            if (highlight.i === i && highlight.j === j) cls = " is-hot";
            else if (highlight.twin && highlight.i === j && highlight.j === i && i !== j) cls = " is-twin";
            else if (!highlight.twin && highlight.i === j && highlight.j === i && i !== j) cls = " is-twin";
          }
          return `<span class="ch5-cell${cls}" data-i="${i}" data-j="${j}">${formatNum(v, digits)}</span>`;
        })
        .join("");
      return `<div class="ch5-matrix-row">${cells}</div>`;
    }).join("");
    return `<div class="ch5-matrix" role="table" aria-label="矩阵">${rows}</div>`;
  }

  /** Random unit vector test: verify x^T A x equals polynomial evaluation. */
  function randomChecks(A, count = 4) {
    const results = [];
    for (let k = 0; k < count; k++) {
      const th = (Math.PI * 2 * k) / count + 0.3;
      const x = [Math.cos(th) * (0.7 + 0.3 * k), Math.sin(th) * (0.8 - 0.1 * k)];
      results.push({
        x,
        value: qForm(A, x),
      });
    }
    return results;
  }

  window.Ch5Math = {
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
    det,
    symmetrize,
    qForm,
    mat2FromAbc,
    abcFromMat2,
    polyTex2,
    polyPlain2,
    congruence,
    leadingMinors,
    matrixRank,
    eigenvalues2,
    inertiaSymmetric,
    classify2,
    sylvesterPositive,
    completeSquareSteps2,
    sumDiffThenSquare,
    cholesky2,
    getPalette,
    setupCanvas,
    pulseClass,
    drawContours,
    drawUnitCircleScan,
    drawSurface,
    matrixHtml,
    randomChecks,
  };
})();
