
;/* visuals/ch5/quadratic-engine.js */
/* Chapter 5 shared quadratic-form math and canvas helpers. */
(() => {
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  // step notes are HTML: symbols go through KaTeX
  const tex = (source) => (window.texInline ? window.texInline(source) : source);
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
  /** "+2x_2", "-x_2", "" for a zero coefficient: one signed term of a KaTeX sum */
  function signedTerm(coef, mono) {
    const abs = formatNum(Math.abs(coef));
    if (abs === "0") return "";
    return `${coef < 0 ? "-" : "+"}${abs === "1" ? "" : abs}${mono}`;
  }

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
            note: `${tex("a=0")} 且 ${tex("b=0")}，本身已是对角标准形。`,
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
        note: `以系数非零的 ${tex("x_1^2")} 为主项，把所有含 ${tex("x_1")} 的项归到一起。`,
        kind: "pick",
        matrix: cloneMat(A),
      },
      {
        title: "完成平方",
        poly: `${formatNum(a)}(x₁ + ${formatNum(r)} x₂)² + ${formatNum(d2)} x₂²`,
        note: `配方恒等式：${tex("ax_1^2+2bx_1x_2=a\\left(x_1+\\frac ba x_2\\right)^2-\\frac{b^2}{a}x_2^2")}。`,
        kind: "square",
        matrix: cloneMat(A),
      },
      {
        title: "变量替换",
        poly: `${formatNum(a)} y₁² + ${formatNum(d2)} y₂²`,
        note: `令 ${tex(`y_1=x_1${signedTerm(r, "x_2")}`)}，${tex("y_2=x_2")}。反解得 ${tex(`x_1=y_1${signedTerm(-r, "y_2")}`)}，${tex("x_2=y_2")}，即 ${tex("x=Cy")}。`,
        kind: "sub",
        C: cloneMat(C),
        matrix: cloneMat(D),
      },
      {
        title: "合同验证",
        poly: polyPlain2(D),
        note: `新矩阵 ${tex("B=C^TAC")} 应为对角矩阵 ${tex(`\\operatorname{diag}(${formatNum(a)},${formatNum(d2)})`)}。交叉项已消失。`,
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
        note: `主对角接近 0 时，直接对 ${tex("x_1")} 配方会失败。先做和差替换，让平方项出现。`,
        kind: "start",
        matrix: cloneMat(A),
      },
      {
        title: "和差替换",
        poly: "x₁ = (y₁+y₂)/2,\\quad x₂ = (y₁−y₂)/2",
        note: `这是可逆替换（${tex("\\det C=-1/2\\ne0")}）。交叉项会变成平方差。`,
        kind: "sub",
        C: cloneMat(C),
        matrix: cloneMat(A),
      },
      {
        title: "得到对角形",
        poly: polyPlain2(D),
        note: `${tex("B=C^TAC")} 已无交叉项（数值上接近对角）。`,
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
      /* canvas paper; surfaces and level sets use the subspace green */
      soft: g("--cv-paper", "#fdfcf8"),
      text: g("--text", "#071512"),
      muted: g("--muted", "#66717f"),
      line: g("--cv-axis", "#8a8d84"),
      accent: g("--cv-subspace", "#2c5e4a"),
      accentStrong: g("--cv-subspace", "#2c5e4a"),
      coral: g("--cv-v2", "#c4552f"),
      blue: g("--cv-v1", "#2a64a8"),
      pos: g("--cv-subspace", "#2c5e4a"),
      neg: g("--cv-v1", "#2a64a8"),
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
    ctx.globalAlpha = 1;
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
    ctx.font = "11px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
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
      ctx.font = "12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
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
    ctx.font = "12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
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
    ctx.globalAlpha = 1;
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
      ctx.font = "12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
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
          // shown with a true minus sign; data-v keeps the number for the canvases that read it
          return `<span class="ch5-cell${cls}" data-i="${i}" data-j="${j}" data-v="${Number(v)}">${formatNum(v, digits).replace(/^-/, "−")}</span>`;
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


;/* visuals/ch5/section1-presentation.js */
(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);

  function module(index, title, subtitle, body) {
    return `<section class="ch5-module"><div class="ch5-module-heading"><span>${index}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  }

  function matrixButtons() {
    return `<div class="ch5s1-matrix-map" role="group" aria-label="二次型对应的二阶对称矩阵">
      <button type="button" data-map-cell="a">2</button>
      <button type="button" data-map-cell="b">3</button>
      <button type="button" data-map-cell="b">3</button>
      <button type="button" data-map-cell="c">5</button>
    </div>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>从二次多项式到对称矩阵</h2>
      <div class="ch5-foundation ch5s1-foundation">
        <p class="ch5-lead">二次型的系数按固定规则填进一个对称矩阵：平方项进对角，交叉项的系数平分到两个对称位置。作变量替换 ${inline("x=Cy")} 以后，矩阵变为 ${inline("C^TAC")}。</p>

        ${module(
          "01",
          "先确认它真的是二次型",
          "每一项的总次数都必须等于 2",
          `<div class="ch5-mini-grid">
            <article class="ch5-card ch5s1-example is-yes"><span>二次型</span>${display("2x_1^2-3x_1x_2+x_2^2")}<p>平方项和交叉项的总次数都为 2。</p></article>
            <article class="ch5-card ch5s1-example is-no"><span>不是二次型</span>${display("x_1^2+x_2+1")}<p>它含有一次项和常数项，不是二次齐次多项式。</p></article>
          </div>`,
        )}

        ${module(
          "02",
          "交叉项为什么要除以 2",
          "点击一项，看它落到矩阵的哪个位置",
          `<div class="ch5s1-map-demo" data-s1-map>
            <div class="ch5s1-term-list" role="group" aria-label="选择多项式中的一项">
              <button type="button" class="is-active" data-map-term="a">${inline("2x_1^2")}</button>
              <button type="button" data-map-term="b">${inline("6x_1x_2")}</button>
              <button type="button" data-map-term="c">${inline("5x_2^2")}</button>
            </div>
            <span class="ch5s1-map-arrow" aria-hidden="true">→</span>
            <div>${matrixButtons()}<p class="ch5s1-map-copy" data-map-copy></p></div>
          </div>`,
        )}

        ${module(
          "03",
          "为什么只需要对称矩阵",
          "斜对称部分在二次型中自动消失",
          `<div class="ch5-pair">
            <div class="ch5-equation">${display("B=\\frac{B+B^T}{2}+\\frac{B-B^T}{2}=S+K")}</div>
            <div class="ch5-card"><p>${inline("x^TKx")} 是标量；转置以后又等于 ${inline("-x^TKx")}，所以只能为 0。因此 ${inline("x^TBx=x^TSx")}。二次型真正看见的只有对称部分。</p></div>
          </div>`,
        )}

        ${module(
          "04",
          "变量替换为什么产生合同",
          `左右两个 ${inline("C")} 分别来自哪里`,
          `<div class="ch5s1-derivation">
            <div>${inline("x=Cy")}</div><span>代入</span>
            <div>${inline("x^TAx=(Cy)^TA(Cy)")}</div><span>转置</span>
            <div>${inline("(Cy)^T=y^TC^T")}</div><span>合并</span>
            <div>${inline("x^TAx=y^T(C^TAC)y")}</div>
          </div>
          <div class="ch5-next-note"><span>注意</span><p>这个恒等式对任意矩阵 ${inline("C")} 都成立；只有当 ${inline("\\det C\\ne0")}、新旧变量可以互相恢复时，才称为非退化变量替换，并说 ${inline("A")} 与 ${inline("C^TAC")} 合同。</p></div>`,
        )}
      </div>`;

    const controller = new AbortController();
    const signal = controller.signal;
    const map = formal.querySelector("[data-s1-map]");
    const copy = formal.querySelector("[data-map-copy]");
    const messages = {
      a: `平方项只进入主对角位置 ${inline("a_{11}")}。`,
      b: `${inline("6x_1x_2")} 在展开中由 ${inline("a_{12}x_1x_2")} 与 ${inline("a_{21}x_2x_1")} 共同产生，所以两个位置各填 3。`,
      c: `平方项只进入主对角位置 ${inline("a_{22}")}。`,
    };

    function select(kind) {
      map.querySelectorAll("[data-map-term]").forEach((button) => button.classList.toggle("is-active", button.dataset.mapTerm === kind));
      map.querySelectorAll("[data-map-cell]").forEach((cell) => cell.classList.toggle("is-active", cell.dataset.mapCell === kind));
      copy.innerHTML = messages[kind];
    }

    map.querySelectorAll("[data-map-term], [data-map-cell]").forEach((button) => {
      button.addEventListener("click", () => select(button.dataset.mapTerm || button.dataset.mapCell), { signal });
    });
    select("a");
    return () => controller.abort();
  }

  window.defineChapter5Renderer("quadratic-matrix", { formal: renderFormal });
})();


;/* visuals/ch5/section2-presentation.js */
(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);

  function module(index, title, subtitle, body) {
    return `<section class="ch5-module"><div class="ch5-module-heading"><span>${index}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>把交叉项一步一步消掉</h2>
      <div class="ch5-foundation ch5s2-foundation">
        <p class="ch5-lead">化标准形，就是找一个可逆变量替换，把二次型改写成平方项之和。主要方法是配方法；在矩阵上，它对应成对进行的合同初等变换。</p>

        ${module(
          "01",
          "交叉项让等高线在当前坐标里倾斜",
          "同一个二次型，换坐标后可以写得更简单",
          `<div class="ch5-pair">
            <div class="ch5-card ch5s2-axis-card"><div class="ch5s2-tilted-axes"><span></span><i></i><b></b></div><h4>原坐标</h4><p>${inline("x_1^2+4x_1x_2+5x_2^2")} 含交叉项。</p></div>
            <div class="ch5-card ch5s2-axis-card"><div class="ch5s2-straight-axes"><span></span><i></i><b></b></div><h4>新坐标</h4><p>${inline("y_1^2+y_2^2")} 只剩平方项。</p></div>
          </div>`,
        )}

        ${module(
          "02",
          "什么叫标准形",
          "没有交叉项的对角二次型",
          `<div class="ch5-equation">${display("f=d_1y_1^2+\\cdots+d_ry_r^2,\\qquad d_i\\ne0")}</div>
          <ul class="ch5-check-list"><li>没有任何 ${inline("y_iy_j")} 交叉项。</li><li>非零平方项的个数 ${inline("r")} 等于二次型的秩。</li><li>具体系数通常不唯一：令 ${inline("y_i=kz_i")}（${inline("k\\ne0")}），系数 ${inline("d_i")} 变为 ${inline("k^2d_i")}。</li></ul>`,
        )}

        ${module(
          "03",
          "配方的一步到底做了什么",
          "先收集，再完成平方，再定义新变量",
          `<div class="ch5s2-square-identity">
            <div>${inline("ax_1^2+2bx_1x_2+cx_2^2")}</div><span>=</span>
            <div>${inline("a\\left(x_1+\\frac ba x_2\\right)^2+\\left(c-\\frac{b^2}{a}\\right)x_2^2")}</div>
          </div>
          <p class="ch5-muted">这里假设 ${inline("a\\ne0")}。若没有平方项却有交叉项，先作和差替换，把乘积变成平方差，再继续。</p>`,
        )}

        ${module(
          "04",
          "矩阵中必须行列成对",
          "普通行消元不是合同变换",
          `<div class="ch5s2-paired-operation"><div><strong>做一次行操作</strong><span>第 2 行减去 ${inline("k")} 倍第 1 行</span></div><b>+</b><div><strong>同步做同名列操作</strong><span>第 2 列减去 ${inline("k")} 倍第 1 列</span></div><b>→</b><div><strong>仍是 ${inline("C^TAC")}</strong><span>矩阵保持对称，换元可追踪</span></div></div>`,
        )}
      </div>`;
  }

  window.defineChapter5Renderer("quadratic-standard-form", { formal: renderFormal });
})();


;/* visuals/ch5/section3-presentation.js */
(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);

  function module(index, title, subtitle, body) {
    return `<section class="ch5-module"><div class="ch5-module-heading"><span>${index}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>标准形不唯一，符号骨架唯一</h2>
      <div class="ch5-foundation ch5s3-foundation">
        <p class="ch5-lead">同一个二次型可以化成系数不同的标准形，但正平方项、负平方项和零项的个数不随非退化变量替换改变。</p>

        ${module(
          "01",
          "先看一个明显的反差",
          "数字不同，正负结构相同",
          `<div class="ch5s3-form-pair">
            <article class="ch5-card">${display("2y_1^2-3y_2^2")}<div><span class="is-positive">1 个正项</span><span class="is-negative">1 个负项</span></div></article>
            <b>同一个二次型还可以写成</b>
            <article class="ch5-card">${display("8z_1^2-\\frac34z_2^2")}<div><span class="is-positive">1 个正项</span><span class="is-negative">1 个负项</span></div></article>
          </div>
          <p class="ch5-muted">系数大小可以通过变量缩放改变；“一正一负”却没有改变。</p>`,
        )}

        ${module(
          "02",
          "从标准形到实规范形",
          `把大小归一，只留下 ${inline("+1")}、${inline("-1")} 和 0`,
          `<div class="ch5-equation">${display("f=z_1^2+\\cdots+z_p^2-z_{p+1}^2-\\cdots-z_{p+q}^2")}</div>
          <div class="ch5-mini-grid">
            <div class="ch5-card"><h4>${inline("p")}：正惯性指数</h4><p>二次型能够在一个子空间上恒正的最大维数。</p></div>
            <div class="ch5-card"><h4>${inline("q")}：负惯性指数</h4><p>二次型能够在一个子空间上恒负的最大维数。</p></div>
          </div>
          <p class="ch5-muted">零项数量为 ${inline("n-p-q")}；秩为 ${inline("p+q")}；符号差为 ${inline("p-q")}。</p>`,
        )}

        ${module(
          "03",
          "惯性定理",
          "可逆变量替换保持正、负方向的维数",
          `<div class="ch5-card ch5s3-theorem"><strong>定理</strong><p>实二次型经过任意非退化实线性替换化为标准形后，正系数项的个数 ${inline("p")} 与负系数项的个数 ${inline("q")} 唯一确定。</p></div>
          <div class="ch5-next-note"><span>直觉</span><p>可逆映射不会改变子空间的维数，因此不能凭空消灭一个正方向，也不能把正方向改造成负方向。只有替换变得不可逆、方向信息真正丢失时，计数才可能下降。</p></div>`,
        )}

        ${module(
          "04",
          "合同分类只比较惯性",
          "同秩不一定合同",
          `<div class="ch5s3-classification">
            <article class="ch5-card"><div>${display("\\operatorname{diag}(1,1)")}</div><p>秩 2，惯性 ${inline("(2,0,0)")}：正定碗面。</p></article>
            <article class="ch5-card"><div>${display("\\operatorname{diag}(1,-1)")}</div><p>秩 2，惯性 ${inline("(1,1,0)")}：不定马鞍。</p></article>
          </div>
          <p class="ch5-muted">二者秩相同但惯性不同，所以不合同。两个同阶实对称矩阵合同，当且仅当它们的 ${inline("p")}、${inline("q")} 和零项数量完全相同。</p>`,
        )}
      </div>`;
  }

  window.defineChapter5Renderer("quadratic-uniqueness", { formal: renderFormal });
})();


;/* visuals/ch5/section4-presentation.js */
(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);

  function module(index, title, subtitle, body) {
    return `<section class="ch5-module"><div class="ch5-module-heading"><span>${index}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>怎样证明所有方向都为正</h2>
      <div class="ch5-foundation ch5s4-foundation">
        <p class="ch5-lead">正定要求对每一个非零向量 ${inline("x")} 都有 ${inline("x^TAx>0")}。非零向量有无穷多个，无法逐个检验；标准形与顺序主子式把它化成有限次计算。</p>

        ${module(
          "01",
          "有限抽样为什么不够",
          "没测到负方向，不等于不存在负方向",
          `<div class="ch5s4-sample-story">
            <div class="ch5-card"><strong>已测试</strong><span>${inline("q(1,0)>0")}</span><span>${inline("q(0,1)>0")}</span><span>${inline("q(1,1)>0")}</span></div>
            <b>但是</b>
            <div class="ch5-card"><strong>仍有无穷多个方向</strong><p>只有结构性判据才能覆盖所有非零向量。</p></div>
          </div>`,
        )}

        ${module(
          "02",
          "五种符号类型",
          "区别在于所有非零方向上能取到哪些符号",
          `<div class="ch5s4-type-grid">
            <article><strong>正定</strong><span>${inline("q(x)>0")}</span><p>所有非零方向严格为正。</p></article>
            <article><strong>半正定</strong><span>${inline("q(x)\\ge0")}</span><p>不为负，但存在非零零方向。</p></article>
            <article><strong>负定</strong><span>${inline("q(x)<0")}</span><p>所有非零方向严格为负。</p></article>
            <article><strong>半负定</strong><span>${inline("q(x)\\le0")}</span><p>不为正，但存在非零零方向。</p></article>
            <article><strong>不定</strong><span>正、负都能取到</span><p>曲面具有马鞍方向。</p></article>
          </div>`,
        )}

        ${module(
          "03",
          "标准形把定义变成符号检查",
          `正惯性指数等于 ${inline("n")}，才是正定`,
          `<div class="ch5-equation">${display("f=d_1y_1^2+\\cdots+d_ny_n^2")}</div>
          <ul class="ch5-check-list"><li>全部 ${inline("d_i>0")}：正定。</li><li>全部 ${inline("d_i\\ge0")} 且至少一个为 0：半正定。</li><li>既有正系数又有负系数：不定。</li></ul>`,
        )}

        ${module(
          "04",
          "顺序主子式判别",
          "正定只需检查左上角逐级扩大的子矩阵",
          `<div class="ch5s4-minor-chain"><div>${inline("A_1")}</div><span>${inline("\\subset")}</span><div>${inline("A_2")}</div><span>${inline("\\subset")}</span><div>${inline("\\cdots")}</div><span>${inline("\\subset")}</span><div>${inline("A_n=A")}</div></div>
          <div class="ch5-equation">${display("A>0\\quad\\Longleftrightarrow\\quad \\Delta_1>0,\\ldots,\\Delta_n>0")}</div>
          <div class="ch5-next-note"><span>边界</span><p>半正定不能把“全正”改成“顺序主子式全非负”：${inline("\\operatorname{diag}(0,-1)")} 的 ${inline("\\Delta_1=\\Delta_2=0")}，但 ${inline("q(0,1)=-1")}。一般需要检查所有主子式非负。二阶矩阵要同时检查 ${inline("a\\ge0")}、${inline("c\\ge0")} 和 ${inline("ac-b^2\\ge0")}。</p></div>`,
        )}

        ${module(
          "05",
          "长度平方是正定结构的另一种写法",
          `正定矩阵与 ${inline("E")} 合同`,
          `<div class="ch5-pair"><div class="ch5-card">${display("x^T(B^TB)x=\\|Bx\\|^2\\ge0")}<p>所以 ${inline("B^TB")} 总是半正定；${inline("B")} 列满秩时正定。</p></div><div class="ch5-card">${display("A=C^TC")}<p>${inline("A")} 正定时与 ${inline("E")} 合同，故有可逆矩阵 ${inline("C")} 使 ${inline("A=C^TC")}；此时 ${inline("x^TAx=\\|Cx\\|^2>0")}（${inline("x\\ne0")}）。</p></div></div>`,
        )}
      </div>`;
  }

  // The lab itself is built by geometry-upgrade.js (surface with level curves on its floor,
  // direction wheel, Sylvester readouts); this file only renders the formal block.
  window.defineChapter5Renderer("positive-definite", { formal: renderFormal });
})();


;/* visuals/ch5/geometry-upgrade.js */
/* Chapter 5 geometry-first interactive layer. */
(() => {
  const M = () => window.Ch5Math;
  const inline = (s) => (window.texInline ? window.texInline(s) : s);
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const fmt = (v, d = 3) => M().formatNum(v, d);
  const TAU = Math.PI * 2;

  function eigen(A) {
    const a = A[0][0], b = A[0][1], c = A[1][1];
    const angle = 0.5 * Math.atan2(2 * b, a - c);
    return { values: M().eigenvalues2(A), vectors: [[Math.cos(angle), Math.sin(angle)], [-Math.sin(angle), Math.cos(angle)]] };
  }

  function arrow(ctx, a, b, color, width = 2) {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len, s = 8;
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - ux * s - uy * s * 0.55, b.y - uy * s + ux * s * 0.55);
    ctx.lineTo(b.x - ux * s + uy * s * 0.55, b.y - uy * s - ux * s * 0.55);
    ctx.closePath(); ctx.fill();
  }

  function surface(canvas, A, title, point) {
    const { ctx, width, height } = M().setupCanvas(canvas); if (!ctx) return;
    const p = M().getPalette(), half = 1.7, res = width < 520 ? 22 : 30;
    const origin = { x: width * 0.5, y: height * 0.59 }, scale = Math.min(width * 0.255, height * 0.29), zScale = scale * 0.55;
    const project = (x, y, z) => ({ x: origin.x + (x - y) * scale * 0.92, y: origin.y + (x + y) * scale * 0.34 - Math.max(-3.6, Math.min(3.6, z)) * zScale, depth: x + y + z * 0.1 });
    const bg = ctx.createLinearGradient(0, 0, width, height); bg.addColorStop(0, p.soft); bg.addColorStop(1, p.soft);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
    ctx.save(); ctx.globalAlpha = 0.34; ctx.strokeStyle = p.line; ctx.lineWidth = 1;
    for (let k = -1.5; k <= 1.5; k += 0.5) {
      const a = project(-half, k, 0), b = project(half, k, 0), c = project(k, -half, 0), d = project(k, half, 0);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.stroke();
    }
    ctx.restore();
    const quads = [];
    for (let i = 0; i < res; i += 1) for (let j = 0; j < res; j += 1) {
      const x0 = -half + 2 * half * i / res, x1 = -half + 2 * half * (i + 1) / res;
      const y0 = -half + 2 * half * j / res, y1 = -half + 2 * half * (j + 1) / res;
      const pts = [[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(([x,y]) => { const z = M().qForm(A,[x,y]); return { ...project(x,y,z), z }; });
      quads.push({ pts, z: pts.reduce((s,v)=>s+v.z,0)/4, depth: pts.reduce((s,v)=>s+v.depth,0)/4 });
    }
    quads.sort((a,b)=>a.depth-b.depth).forEach((q) => {
      ctx.beginPath(); q.pts.forEach((v,i)=>i ? ctx.lineTo(v.x,v.y) : ctx.moveTo(v.x,v.y)); ctx.closePath();
      ctx.fillStyle = q.z >= 0 ? p.pos : p.neg; ctx.globalAlpha = 0.24; ctx.fill();
      ctx.strokeStyle = q.z >= 0 ? p.pos : p.neg; ctx.globalAlpha = 0.24; ctx.lineWidth = 0.7; ctx.stroke();
    });
    ctx.globalAlpha = 1;
    eigen(A).vectors.forEach((v, i) => {
      ctx.strokeStyle = i ? p.coral : p.accentStrong; ctx.lineWidth = 2.7; ctx.beginPath();
      for (let k = -36; k <= 36; k += 1) { const t = half * k / 36, x=v[0]*t, y=v[1]*t, s=project(x,y,M().qForm(A,[x,y])); k===-36?ctx.moveTo(s.x,s.y):ctx.lineTo(s.x,s.y); }
      ctx.stroke();
    });
    const o = project(0,0,0); arrow(ctx,o,project(1.65,0,0),p.text,1.3); arrow(ctx,o,project(0,1.65,0),p.text,1.3); arrow(ctx,o,project(0,0,2.1),p.text,1.3);
    ctx.fillStyle=p.muted; ctx.font="600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif"; ctx.fillText("x₁",project(1.65,0,0).x+4,project(1.65,0,0).y); ctx.fillText("x₂",project(0,1.65,0).x-17,project(0,1.65,0).y); ctx.fillText("q",project(0,0,2.1).x+5,project(0,0,2.1).y);
    if (point) { const z=M().qForm(A,point), a=project(point[0],point[1],0), b=project(point[0],point[1],z); ctx.strokeStyle=p.coral; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle=p.coral; ctx.beginPath(); ctx.arc(b.x,b.y,5,0,TAU); ctx.fill(); }
    ctx.fillStyle=p.surface; ctx.globalAlpha=.9; ctx.fillRect(14,14,Math.min(290,width-28),34); ctx.globalAlpha=1; ctx.fillStyle=p.text; ctx.font="800 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif"; ctx.fillText(title,26,36);
  }

  function counts(inn){return `<div class="qv-counts"><span>正<strong>${inn.p}</strong></span><span>负<strong>${inn.q}</strong></span><span>零<strong>${inn.zero}</strong></span></div>`;}

  function mountS1(root){
    root.innerHTML=`<h2>交互实验</h2><div class="qv-lab"><header class="qv-head"><h3>矩阵变了，曲面上的同一个高度没有变</h3><p>选择变量替换，再选择测试向量。左边在 ${inline('x=Cy')} 处读 ${inline('A')} 的曲面高度，右边在 ${inline('y')} 处读 ${inline('B=C^TAC')} 的曲面高度。</p></header><div data-s1-gate></div><div class="ch5-toolbar" role="group">${[["identity","不变"],["swap","交换变量"],["shear","剪切"],["scale","缩放"],["singular","奇异压缩"]].map(([k,l],i)=>`<button type="button" ${i?'':'class="is-active"'} data-s1-preset="${k}">${l}</button>`).join('')}</div><div class="qv-same"><figure><canvas data-s1-a-canvas></canvas><figcaption>先算 ${inline('x=Cy')}，再看 ${inline('x^TAx')}</figcaption></figure><div class="qv-equals"><strong data-s1-eq>?</strong><span data-s1-eq-copy>两根高度杆</span></div><figure><canvas data-s1-b-canvas></canvas><figcaption>在 ${inline('y')} 坐标中直接看 ${inline('y^TBy')}</figcaption></figure></div><div class="ch5-toolbar" role="group">${[["e1","y=(1,0)"],["e2","y=(0,1)"],["sum","y=(1,1)"]].map(([k,l],i)=>`<button type="button" ${i?'':'class="is-active"'} data-s1-y="${k}">${inline(l)}</button>`).join('')}</div><div class="qv-data"><div><span>${inline('C')}</span><div class="ch5-matrix-wrap" data-s1-c></div></div><div><span>${inline('B=C^TAC')}</span><div class="ch5-matrix-wrap" data-s1-b></div></div><div class="qv-values"><span>${inline('\\det C')}<strong data-s1-det></strong></span><span>${inline('x=Cy')}<strong data-s1-x></strong></span><span>${inline('x^TAx')}<strong data-s1-left></strong></span><span>${inline('y^TBy')}<strong data-s1-right></strong></span></div></div><div class="qv-result" data-s1-result><span class="ch5-status" data-s1-status></span><div><h4 data-s1-title></h4><p data-s1-copy></p></div></div></div>`;
    const A=[[2,1],[1,1]], presets={identity:[[1,0],[0,1]],swap:[[0,1],[1,0]],shear:[[1,1],[0,1]],scale:[[2,0],[0,1]],singular:[[1,1],[1,1]]},vectors={e1:[1,0],e2:[0,1],sum:[1,1]}; const state={p:'identity',v:'e1'}; const ctl=new AbortController();
    const lab=$(root,'.qv-lab');
    const gate=window.LAPredictGate?.mount($(root,'[data-s1-gate]'),{
      root:lab,manual:true,key:'visuals/ch5/geometry-upgrade.js#s1',
      question:`换一种变量替换 ${inline('x=Cy')}。左图在 ${inline('x')} 处读 ${inline('A')} 的曲面高度 ${inline('x^TAx')}，右图在 ${inline('y')} 处读 ${inline('B=C^TAC')} 的曲面高度 ${inline('y^TBy')}。两根高度杆会怎样？`,
      options:[
        ['一样高：同一个函数值，只是换了变量写法',true,''],
        [`右边更高：${inline('B')} 的元素变大了`,false,'B 的元素变大，但它在 y 处读数，而 x=Cy 往往更长；两根杆顶在同一水平面上。'],
        [`要看测试向量 ${inline('y')} 取哪一个`,false,'三个 y 下两根杆都一样高。'],
        [`只有 ${inline('\\det C\\ne0')} 时才一样高`,false,'奇异压缩下两根杆也一样高；det C=0 影响的是能不能称为合同。'],
      ],
      right:`✓ 两根杆顶在同一个水平面上：${inline('y^TBy=y^T(C^TAC)y=(Cy)^TA(Cy)=x^TAx')}。所以换变量后，新矩阵就是 ${inline('C^TAC')}。`,
      onReveal:()=>paint(),
    });
    function paint(){const C=presets[state.p],B=M().symmetrize(M().congruence(A,C)),y=vectors[state.v],x=M().matVec(C,y),l=M().qForm(A,x),r=M().qForm(B,y),det=M().det2(C),ok=Math.abs(det)>1e-8;surface($(root,'[data-s1-a-canvas]'),A,'A · 原坐标',x);surface($(root,'[data-s1-b-canvas]'),B,'B · 新坐标',y);$(root,'[data-s1-c]').innerHTML=M().matrixHtml(C);$(root,'[data-s1-b]').innerHTML=M().matrixHtml(B);$(root,'[data-s1-det]').textContent=fmt(det,4);$(root,'[data-s1-x]').textContent=`(${x.map(v=>fmt(v)).join(', ')})`;const open=!gate||gate.revealed;lab.toggleAttribute('data-s1-open',open);$(root,'[data-s1-left]').textContent=open?fmt(l,4):'?';$(root,'[data-s1-right]').textContent=open?fmt(r,4):'?';$(root,'[data-s1-eq]').textContent=open?'=':'?';$(root,'[data-s1-eq-copy]').textContent=open?`同一高度 ${fmt(l,4)}`:'两根高度杆';const s=$(root,'[data-s1-status]');if(!open){s.className='ch5-status';s.textContent='先猜一猜';$(root,'[data-s1-title]').textContent='猜好之后换一种替换';$(root,'[data-s1-copy]').textContent='看两根高度杆的顶端：它们是否落在同一个水平面上。';return;}s.className=`ch5-status ${ok?'is-ok':'is-warn'}`;s.textContent=ok?'合同成立':'不是合同';$(root,'[data-s1-title]').textContent=ok?'坐标换了，二次型没有换':'一个方向被压掉，无法反解';$(root,'[data-s1-copy]').innerHTML=ok?`${inline('\\det C\\ne0')}，新旧变量可互相恢复；两根高度杆顶在同一个水平面上。`:`代数恒等式仍成立，但 ${inline('\\det C=0')}，所以这不是非退化变量替换，也不能称为合同。`;}
    $$(root,'[data-s1-preset]').forEach(b=>b.addEventListener('click',()=>{state.p=b.dataset.s1Preset;$$(root,'[data-s1-preset]').forEach(x=>x.classList.toggle('is-active',x===b));if(gate?.picked&&state.p!=='identity')gate.acted();paint();},{signal:ctl.signal}));$$(root,'[data-s1-y]').forEach(b=>b.addEventListener('click',()=>{state.v=b.dataset.s1Y;$$(root,'[data-s1-y]').forEach(x=>x.classList.toggle('is-active',x===b));if(gate?.picked&&state.p!=='identity')gate.acted();paint();},{signal:ctl.signal}));window.addEventListener('resize',paint,{signal:ctl.signal,passive:true});paint();return()=>ctl.abort();
  }

  function mountS2(root){
    root.innerHTML=`<h2>交互实验</h2><div class="qv-lab"><header class="qv-head"><h3>配方：换一组变量，让交叉项消失</h3><p>每前进一步，公式、替换矩阵 ${inline('C')} 和曲面同步更新。曲面始终画在当前变量的坐标里；曲面下方的小图是从正上方看到的等高线。</p></header><div data-s2-gate></div><div class="ch5-toolbar">${[["regular","含交叉项"],["cross","只有交叉项"],["rank1","退化为一个平方"],["indef","一正一负"]].map(([k,l],i)=>`<button type="button" ${i?'':'class="is-active"'} data-s2-preset="${k}">${l}</button>`).join('')}</div><div class="qv-stepbar"><span data-s2-step-count></span><button data-s2-nav="prev">上一步</button><button class="is-primary" data-s2-nav="next">下一步</button><button data-s2-nav="reset">重置</button></div><div class="qv-progress" data-s2-progress></div><div class="qv-two"><section><div class="qv-s2-stage"><canvas class="qv-main-canvas" data-s2-canvas></canvas><figure class="qv-s2-inset"><canvas data-s2-top aria-label="俯视等高线"></canvas><figcaption data-s2-top-caption>俯视 · 等高线</figcaption></figure></div><p data-s2-look></p></section><aside><div class="qv-step"><span data-s2-kicker></span><h4 data-s2-title></h4><div data-s2-poly></div><p data-s2-note></p></div><div class="qv-s2-mats"><div><h4>当前替换 ${inline('C')}</h4><div class="ch5-matrix-wrap" data-s2-c></div></div><div><h4>当前矩阵</h4><div class="ch5-matrix-wrap" data-s2-d></div></div><p data-s2-substitution></p></div><div class="qv-values"><span>${inline('\\det C')}<strong data-s2-det></strong></span><span>交叉项系数<strong data-s2-cross></strong></span><span>原秩<strong data-s2-rank-a></strong></span><span>当前秩<strong data-s2-rank-d></strong></span></div><div class="qv-result" data-s2-result><span class="ch5-status" data-s2-status></span><div><h4 data-s2-result-title></h4><p data-s2-result-copy></p></div></div></aside></div></div>`;
    const presets={regular:M().mat2FromAbc(1,2,6),cross:M().mat2FromAbc(0,1,0),rank1:M().mat2FromAbc(1,1,1),indef:M().mat2FromAbc(1,1,-2)},state={p:'regular',step:0,t:1},ctl=new AbortController();
    const lab=$(root,'.qv-lab');
    let raf=0;
    const gate=window.LAPredictGate?.mount($(root,'[data-s2-gate]'),{
      root:lab,manual:true,key:'visuals/ch5/geometry-upgrade.js#s2',
      question:`例子“含交叉项”：${inline('q=x_1^2+4x_1x_2+6x_2^2')} 的等高线是斜着的椭圆。配方换成新变量 ${inline('y')} 以后，在 ${inline('y')} 的坐标里这些椭圆会怎样？`,
      options:[
        [`椭圆的两条轴摆正，落在 ${inline('y_1')}、${inline('y_2')} 坐标轴上`,true,''],
        ['椭圆仍然斜着，只是大小变了',false,'终点没有 y₁y₂ 项，等高线 y₁²+2y₂²=常数 的轴就在坐标轴上。'],
        ['椭圆变成圆',false,'两个平方项的系数是 1 和 2，不相等，仍是椭圆。'],
        ['椭圆变成双曲线',false,'可逆替换不改变曲面向上的方向个数，碗仍是碗，等高线仍是椭圆。'],
      ],
      right:`✓ 交叉项消失以后，等高线 ${inline('y_1^2+2y_2^2=c')} 的两条轴就是 ${inline('y_1')}、${inline('y_2')} 轴。配方就是在找一组让等高线摆正的新坐标。`,
      onPick:()=>{if(state.p!=='regular')$(root,'[data-s2-preset="regular"]')?.click();},
    });
    function pack(){return M().completeSquareSteps2(presets[state.p]);}
    // top view: level curves q = c of the current matrix, its principal axes (dashed),
    // a ghost of the starting curves; the axes are named after the current variables
    function topView(canvas,D,A0,vars,shear){
      const {ctx,width,height}=M().setupCanvas(canvas); if(!ctx)return;
      const p=M().getPalette(), cs=getComputedStyle(document.body), image=cs.getPropertyValue('--cv-image').trim()||'#8c4f86';
      const o={x:width/2,y:height/2}, half=2.4, sc=Math.min(width,height)/(2*half);
      ctx.fillStyle=p.soft;ctx.fillRect(0,0,width,height);
      ctx.strokeStyle=p.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(6,o.y);ctx.lineTo(width-6,o.y);ctx.moveTo(o.x,6);ctx.lineTo(o.x,height-6);ctx.stroke();
      const curve=(A,level,color,alpha,dash)=>{ctx.save();ctx.strokeStyle=color;ctx.globalAlpha=alpha;ctx.lineWidth=1.6;ctx.setLineDash(dash||[]);ctx.beginPath();let down=false;for(let i=0;i<=240;i+=1){const th=TAU*i/240,u=[Math.cos(th),Math.sin(th)],q=M().qForm(A,u);if(q*level<=1e-12){down=false;continue;}const r=Math.sqrt(level/q);if(r>half*1.6){down=false;continue;}const X=o.x+r*u[0]*sc,Y=o.y-r*u[1]*sc;if(down)ctx.lineTo(X,Y);else{ctx.moveTo(X,Y);down=true;}}ctx.stroke();ctx.restore();};
      const levels=[-1,1,3].filter(c=>c>0||M().inertiaSymmetric(D).q>0);
      if(A0) levels.forEach(c=>curve(A0,c,p.pos,.35,[4,4]));
      levels.forEach(c=>curve(D,c,c>0?p.pos:p.neg,.95));
      // principal axes of the current curves
      if(M().matrixRank(D)>0){eigen(D).vectors.forEach(v=>{ctx.save();ctx.strokeStyle=image;ctx.globalAlpha=.75;ctx.setLineDash([5,4]);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(o.x-v[0]*half*sc,o.y+v[1]*half*sc);ctx.lineTo(o.x+v[0]*half*sc,o.y-v[1]*half*sc);ctx.stroke();ctx.restore();});}
      ctx.fillStyle=vars==='y'?image:p.muted;ctx.font="italic 600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.fillText(`${vars}₁`,width-22,o.y-6);ctx.fillText(`${vars}₂`,o.x+6,16);
    }
    function animateTop(A,D){
      cancelAnimationFrame(raf);
      const c=$(root,'[data-s2-top]'),r=-A[0][1]/A[0][0],t0=performance.now(),dur=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:900;
      const tick=(now)=>{const t=dur?Math.min(1,(now-t0)/dur):1,e=t<.5?2*t*t:1-(-2*t+2)**2/2,C=[[1,r*e],[0,1]];topView(c,t<1?M().symmetrize(M().congruence(A,C)):D,A,t<1?'x':'y');if(t<1)raf=requestAnimationFrame(tick);else raf=0;};
      raf=requestAnimationFrame(tick);
    }
    function paint(){const A=presets[state.p],pk=pack(),steps=pk.steps||[];state.step=M().clamp(state.step,0,Math.max(0,steps.length-1));const st=steps[state.step]||{title:'起点',poly:M().polyPlain2(A),note:'',kind:'start',matrix:A},C=st.C||M().identity(2),D=st.matrix||A,final=state.step===steps.length-1,det=M().det2(C),cross=2*D[0][1],ra=M().matrixRank(A),rd=M().matrixRank(D);$(root,'[data-s2-step-count]').textContent=`第 ${state.step+1} 步 / ${steps.length}`;$(root,'[data-s2-progress]').style.setProperty('--p',`${100*(state.step+1)/steps.length}%`);$(root,'[data-s2-kicker]').textContent=st.kind==='done'?'标准形':'当前步骤';$(root,'[data-s2-title]').textContent=st.title;$(root,'[data-s2-poly]').innerHTML=inline(st.poly.replace(/(^|[+−=(-]\s*)1\s+(?=[xy(])/g,'$1').replace(/²/g,'^2').replace(/x₁/g,'x_1').replace(/x₂/g,'x_2').replace(/y₁/g,'y_1').replace(/y₂/g,'y_2'));$(root,'[data-s2-note]').innerHTML=st.note;$(root,'[data-s2-look]').innerHTML=final?`在新变量 ${inline('y')} 的坐标里，等高线不再倾斜，交叉项为 0。把 ${inline('y')} 轴画回原来的 ${inline('x')} 平面，它们一般是斜的，并不是曲面的主轴。`:'继续配方，观察当前坐标里的倾斜怎样消失。';$(root,'[data-s2-c]').innerHTML=M().matrixHtml(C);$(root,'[data-s2-d]').innerHTML=M().matrixHtml(D);$(root,'[data-s2-substitution]').innerHTML=st.C?(pk.method==='sumdiff'?`和差替换：${inline('x_1=(y_1+y_2)/2')}，${inline('x_2=(y_1-y_2)/2')}。`:`已经写出 ${inline('x=Cy')}，新旧变量可互相恢复。`):`尚未定义新变量，${inline('C')} 为单位矩阵。`;const vars=st.C?'y':'x';lab.dataset.s2Vars=vars;if(!raf)topView($(root,'[data-s2-top]'),D,st.C?A:null,vars);$(root,'[data-s2-top-caption]').innerHTML=st.C?`俯视 · 新坐标 ${inline('y')} 中的等高线（虚线是起点）`:`俯视 · 原坐标 ${inline('x')} 中的等高线`;if(final&&gate?.picked&&state.p==='regular')gate.acted();$(root,'[data-s2-det]').textContent=fmt(det,4);$(root,'[data-s2-cross]').textContent=fmt(cross,6);$(root,'[data-s2-rank-a]').textContent=ra;$(root,'[data-s2-rank-d]').textContent=rd;surface($(root,'[data-s2-canvas]'),D,final?'标准形 · 新变量 y':'当前二次型');const s=$(root,'[data-s2-status]');if(final){const ok=Math.abs(det)>1e-8&&Math.abs(cross)<1e-7&&ra===rd;s.className=`ch5-status ${ok?'is-ok':'is-warn'}`;s.textContent=ok?'标准形完成':'还需检查';$(root,'[data-s2-result-title]').textContent=ok?'可逆、无交叉项、秩保持':'尚未闭环';$(root,'[data-s2-result-copy]').textContent=ok?'三项同时成立，说明这一步确实是合同化标准形。':'检查变量替换和最终矩阵。';}else{s.className='ch5-status';s.textContent='处理中';$(root,'[data-s2-result-title]').textContent='还没有到终点';$(root,'[data-s2-result-copy]').textContent='不要只看公式；同时看当前坐标里的等高线是否仍然倾斜。';}if(gate?.picked&&!gate.revealed&&state.p!=='regular'){$(root,'[data-s2-result-copy]').textContent+='你的猜测针对“含交叉项”：回到这个例子走到最后一步，再核对猜测。';}}
    $$(root,'[data-s2-preset]').forEach(b=>b.addEventListener('click',()=>{state.p=b.dataset.s2Preset;state.step=0;$$(root,'[data-s2-preset]').forEach(x=>x.classList.toggle('is-active',x===b));paint();},{signal:ctl.signal}));$$(root,'[data-s2-nav]').forEach(b=>b.addEventListener('click',()=>{const before=(pack().steps||[])[state.step];if(b.dataset.s2Nav==='next')state.step+=1;if(b.dataset.s2Nav==='prev')state.step-=1;if(b.dataset.s2Nav==='reset')state.step=0;cancelAnimationFrame(raf);raf=0;paint();const steps=pack().steps||[],now=steps[Math.min(state.step,steps.length-1)],A=presets[state.p];if(before&&!before.C&&now?.C&&now.C[1][0]===0&&Math.abs(A[0][0])>1e-9){animateTop(A,now.matrix);}},{signal:ctl.signal}));ctl.signal.addEventListener('abort',()=>cancelAnimationFrame(raf));window.addEventListener('resize',paint,{signal:ctl.signal,passive:true});paint();return()=>ctl.abort();
  }

  /*
   * A slider that follows the pointer continuously (the lab redraws on every input), and on
   * release eases to the nearest stop, where every readout is an exact fraction again. Arrow keys
   * and glide(v) (presets) move from stop to stop with the same easing. get/set read and write
   * the lab's value; settle() runs once a stop is reached.
   */
  function smoothRange(input, { step, get, set, settle, signal }) {
    const min = Number(input.min), max = Number(input.max);
    let frame = 0, target = 0;
    const stop = () => { cancelAnimationFrame(frame); frame = 0; };
    const nearest = (v) => M().clamp(Math.round(v / step) * step, min, max);
    function glide(to) {
      stop();
      target = to;
      const from = get(), dist = to - from;
      if (Math.abs(dist) < 1e-9 || M().reducedMotion()) { set(to); settle(); return; }
      const start = performance.now(), dur = Math.min(340, 150 + (Math.abs(dist) / step) * 50);
      const tick = (now) => {
        const u = Math.min(1, (now - start) / dur);
        if (u < 1) { set(from + dist * (1 - (1 - u) ** 3)); frame = requestAnimationFrame(tick); }
        else { frame = 0; set(to); settle(); }
      };
      frame = requestAnimationFrame(tick);
    }
    input.addEventListener("input", () => { stop(); set(Number(input.value)); }, { signal });
    input.addEventListener("change", () => glide(nearest(get())), { signal });
    input.addEventListener("keydown", (e) => {
      const dir = { ArrowRight: 1, ArrowUp: 1, PageUp: 1, ArrowLeft: -1, ArrowDown: -1, PageDown: -1 }[e.key];
      if (!dir && e.key !== "Home" && e.key !== "End") return;
      e.preventDefault();
      // the next stop in the arrow's direction, counted from where a running glide is heading
      const v = (frame ? target : get()) / step;
      const next = (dir > 0 ? Math.floor(v + 1e-9) + 1 : Math.ceil(v - 1e-9) - 1) * step;
      glide(e.key === "Home" ? min : e.key === "End" ? max : M().clamp(next, min, max));
    }, { signal });
    signal.addEventListener("abort", stop);
    return { glide, stop };
  }

  /*
   * §3 inertia lab. A is fixed; C = (1 h; 0 1), h in steps of 1/2, det C = 1.
   * Entries are multiples of 1/4, shown as exact fractions (cells carry data-v for the surfaces).
   * Each surface gets its up / down principal directions; a sign wheel under it colours
   * every unit direction by the sign of q. Under an invertible C the arcs move, but the
   * number of up and down directions does not change.
   */
  function fracStr(v, tex = false) {
    if (Math.abs(v) < 1e-12) return "0";
    const sign = v < 0 ? (tex ? "-" : "−") : "";
    const x = Math.abs(v);
    for (const d of [1, 2, 4, 8, 16]) {
      const n = Math.round(x * d);
      if (Math.abs(n / d - x) < 1e-9) {
        if (d === 1) return `${sign}${n}`;
        return tex ? `${sign}\\tfrac{${n}}{${d}}` : `${sign}${n}/${d}`;
      }
    }
    // between the half steps while the slider is dragged: a rounded value, marked as such in text
    return tex ? `${sign}${fmt(x, 2)}` : `≈${sign}${fmt(x, 2)}`;
  }
  const fracMatrix = (A) => `<div class="ch5-matrix" role="table" aria-label="矩阵">${A.map((row, i) => `<div class="ch5-matrix-row">${row.map((v, j) => `<span class="ch5-cell" data-i="${i}" data-j="${j}" data-v="${v}">${fracStr(v)}</span>`).join("")}</div>`).join("")}</div>`;
  function polyFracTex(A) {
    const terms = [[A[0][0], "x_1^2"], [2 * A[0][1], "x_1x_2"], [A[1][1], "x_2^2"]].filter(([c]) => Math.abs(c) > 1e-12);
    if (!terms.length) return "0";
    return terms.map(([c, m], i) => {
      const mag = Math.abs(c);
      const coef = Math.abs(mag - 1) < 1e-12 ? "" : fracStr(mag, true);
      return `${c < 0 ? "-" : i ? "+" : ""}${coef}${m}`;
    }).join("");
  }

  function signWheel(canvas, A, label) {
    const { ctx, width, height } = M().setupCanvas(canvas); if (!ctx) return;
    const p = M().getPalette();
    // small = the inset on a surface's corner (phones): no title, tighter ring
    const small = width < 130;
    const cx = width / 2, cy = height / 2 + (small ? 0 : 4), r = Math.min(width, height) * (small ? 0.3 : 0.32);
    ctx.fillStyle = p.soft; ctx.fillRect(0, 0, width, height);
    const N = 360;
    for (let k = 0; k < N; k += 1) {
      const t = (TAU * k) / N;
      const v = M().qForm(A, [Math.cos(t), Math.sin(t)]);
      ctx.strokeStyle = v > 1e-9 ? p.pos : v < -1e-9 ? p.neg : p.zero;
      ctx.lineWidth = small ? 6 : 9;
      ctx.beginPath(); ctx.arc(cx, cy, r, -t, -t - TAU / N - 0.01, true); ctx.stroke();
    }
    // principal directions as diameters, labelled by sign
    // q on a unit principal direction is its eigenvalue
    eigen(A).vectors.forEach((vec) => {
      const lam = M().qForm(A, vec);
      const col = lam > 1e-9 ? p.pos : lam < -1e-9 ? p.neg : p.zero;
      const a = { x: cx - vec[0] * r, y: cy + vec[1] * r }, b = { x: cx + vec[0] * r, y: cy - vec[1] * r };
      ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.setLineDash(lam > 1e-9 || lam < -1e-9 ? [] : [3, 3]);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
      // the phone inset has no room beside its ring: the surface it sits on names the same directions
      if (small) return;
      ctx.fillStyle = col; ctx.font = `600 ${small ? 11 : 12}px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif`; ctx.textAlign = "center";
      const out = small ? 14 : 18;
      const tx = Math.max(14, Math.min(width - 14, cx + vec[0] * (r + out))), ty = Math.max(10, Math.min(height - 4, cy - vec[1] * (r + out) + 4));
      ctx.fillText(lam > 1e-9 ? "向上" : lam < -1e-9 ? "向下" : "平坦", tx, ty);
    });
    ctx.textAlign = "left";
    ctx.fillStyle = p.muted; ctx.font = "12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
    if (!small) ctx.fillText(label, 10, 16);
  }

  function mountS3(root){
    root.innerHTML=`<h2>交互实验</h2><div class="qv-lab qv-s3"><header class="qv-head"><h3>可逆变换可以扭曲曲面，却改不了向上、向下和平坦方向的数量</h3><p>${inline('B=C^TAC')}，${inline('C=\\begin{bmatrix}1&h\\\\0&1\\end{bmatrix}')}，${inline('\\det C=1')}。曲面上画出向上、向下的主方向；下方的符号轮把每个方向按 ${inline('q')} 的正负着色。</p></header>
      <div data-s3-gate></div>
      <div class="ch5-toolbar">${[["positive","两个正方向"],["indefinite","一正一负"],["rank1","一正一零"]].map(([k,l],i)=>`<button type="button" ${i===1?'class="is-active"':''} data-s3-preset="${k}">${l}</button>`).join('')}</div>
      <label class="ch5-range"><span>剪切参数 ${inline('h')}</span><input type="range" min="-1.5" max="1.5" step="0.01" value="0" data-s3-h><output data-s3-h-value>0</output></label>
      <div class="qv-same"><figure><canvas data-s3-a-canvas></canvas><figcaption>原曲面 ${inline('A')}<div data-s3-a-counts></div></figcaption></figure><div class="qv-equals"><strong>${inline('C^TAC')}</strong><span>可逆时只换坐标</span></div><figure><canvas data-s3-b-canvas></canvas><figcaption>变换后 ${inline('B')}<div data-s3-b-counts></div></figcaption></figure></div>
      <div class="qv-s3-wheels"><figure><canvas data-s3-a-wheel aria-label="A 的符号轮"></canvas></figure><figure><canvas data-s3-b-wheel aria-label="B 的符号轮"></canvas></figure></div>
      <div class="qv-data"><div><span>${inline('C')}</span><div class="ch5-matrix-wrap" data-s3-c></div></div><div><span>${inline('A')}</span><div class="ch5-matrix-wrap" data-s3-a></div></div><div><span>${inline('B')}</span><div class="ch5-matrix-wrap" data-s3-b></div></div><div class="qv-values"><span>${inline('\\det C')}<strong data-s3-det></strong></span><span>${inline('A')} 的多项式<strong data-s3-poly-a></strong></span><span>${inline('B')} 的多项式<strong data-s3-poly-b></strong></span></div></div>
      <div class="qv-actions"><button data-s3-singular>让替换奇异</button><button data-s3-reset>恢复可逆</button></div>
      <div class="qv-result" data-s3-result><span class="ch5-status" data-s3-status></span><div><h4 data-s3-title></h4><p data-s3-copy></p></div></div></div>`;
    const presets={positive:[[2,.5],[.5,1]],indefinite:[[1,.5],[.5,-1]],rank1:[[1,1],[1,1]]},state={p:'indefinite',h:0,singular:false},ctl=new AbortController();
    const gate=window.LAPredictGate?.mount($(root,'[data-s3-gate]'),{
      root:$(root,'.qv-lab'),manual:true,key:'visuals/ch5/geometry-upgrade.js#s3',
      question:`${inline('A')} 是一正一负的马鞍面。拖动 ${inline('h')}（${inline('\\det C=1')} 始终可逆），${inline('B')} 的曲面能不能变成两个方向都向上的碗？`,
      options:[
        ['不能：始终恰好一个方向向上、一个方向向下',true,''],
        [`能：${inline('h')} 足够大时`,false,'h 越大曲面越斜，但符号轮上蓝色的“向下”弧一直在。'],
        ['能：交叉项消失的那一刻',false,'交叉项消失时 B 是对角的，对角元仍是一正一负。'],
        ['会变成一个向上、一个平坦',false,'平坦方向意味着某个非零方向上 q 恒为 0，可逆替换造不出这样的方向。'],
      ],
      right:`✓ 可逆的 ${inline('C')} 把 ${inline('A')} 的“向下”方向 ${inline('v')} 换成 ${inline('B')} 的方向 ${inline('C^{-1}v')}：${inline('(C^{-1}v)^TB(C^{-1}v)=v^TAv<0')}。向下的方向只是换了位置，不会消失；向上的方向也一样。这就是惯性定理：${inline('p')}、${inline('q')} 由二次型本身决定。`,
      onPick:()=>{if(state.p!=='indefinite')$(root,'[data-s3-preset="indefinite"]')?.click();},
      onReveal:()=>paint(),
    });
    function C(){return state.singular?[[1,1],[1,1]]:[[1,state.h],[0,1]];}
    function paint(){
      const A=presets[state.p],c=C(),B=M().symmetrize(M().congruence(A,c)),det=M().det2(c),ok=Math.abs(det)>1e-8,ia=M().inertiaSymmetric(A),ib=M().inertiaSymmetric(B),same=ia.p===ib.p&&ia.q===ib.q&&ia.zero===ib.zero;
      const open=!gate||gate.revealed;
      $(root,'[data-s3-h]').value=state.h;$(root,'[data-s3-h]').disabled=state.singular;
      $(root,'[data-s3-h-value]').textContent=state.singular?'—':fracStr(state.h);
      $(root,'[data-s3-a]').innerHTML=fracMatrix(A);$(root,'[data-s3-b]').innerHTML=fracMatrix(B);$(root,'[data-s3-c]').innerHTML=fracMatrix(c);
      $(root,'[data-s3-det]').textContent=fracStr(det);
      $(root,'[data-s3-a-counts]').innerHTML=counts(ia);
      // B's counts are the answer: they appear once the prediction is checked
      $(root,'[data-s3-b-counts]').innerHTML=open?counts(ib):'<div class="qv-counts"><span>正<strong>?</strong></span><span>负<strong>?</strong></span><span>零<strong>?</strong></span></div>';
      $(root,'[data-s3-poly-a]').innerHTML=inline(polyFracTex(A));$(root,'[data-s3-poly-b]').innerHTML=inline(polyFracTex(B));
      surface($(root,'[data-s3-a-canvas]'),A,'A · 原曲面');surface($(root,'[data-s3-b-canvas]'),B,'B · 变换后');
      signWheel($(root,'[data-s3-a-wheel]'),A,'A 的符号轮');signWheel($(root,'[data-s3-b-wheel]'),B,'B 的符号轮');
      $(root,'[data-s3-singular]').disabled=!open;
      const s=$(root,'[data-s3-status]');
      $(root,'.qv-lab').dispatchEvent(new Event('la-redraw',{bubbles:true}));
      if(!open){s.className='ch5-status';s.textContent='先猜一猜';$(root,'[data-s3-title]').innerHTML=`猜好之后拖动 ${inline('h')}`;$(root,'[data-s3-copy]').innerHTML=gate?.picked&&state.p!=='indefinite'?`你的猜测针对“一正一负”：回到这个例子拖动 ${inline('h')}，再核对猜测。`:`盯住右边的曲面和符号轮：蓝色弧是 ${inline('q<0')} 的方向。`;return;}
      s.className=`ch5-status ${ok&&same?'is-ok':'is-warn'}`;s.textContent=ok?(same?'惯性锁定':'数值异常'):'合同停止';
      $(root,'[data-s3-title]').textContent=ok?'形状被拉斜，符号骨架没有变':'一个方向被真正丢失';
      $(root,'[data-s3-copy]').innerHTML=ok?`${inline('\\det C\\ne0')}，正、负、零方向数量与 ${inline('A')} 完全一致。`:`${inline('\\det C=0')}，平面被压到一条线；此时替换不可逆，已经离开合同的前提。`;
    }
    const hRange=smoothRange($(root,'[data-s3-h]'),{
      step:0.5,signal:ctl.signal,
      get:()=>state.h,
      set:(v)=>{state.h=v;state.singular=false;paint();},
      settle:()=>{if(gate?.picked&&state.h!==0&&state.p==='indefinite')gate.acted();paint();},
    });
    $$(root,'[data-s3-preset]').forEach(b=>b.addEventListener('click',()=>{hRange.stop();state.p=b.dataset.s3Preset;state.h=0;state.singular=false;$$(root,'[data-s3-preset]').forEach(x=>x.classList.toggle('is-active',x===b));paint();},{signal:ctl.signal}));
    $(root,'[data-s3-singular]').addEventListener('click',()=>{hRange.stop();state.singular=true;paint();},{signal:ctl.signal});
    $(root,'[data-s3-reset]').addEventListener('click',()=>{state.singular=false;hRange.glide(0);},{signal:ctl.signal});
    // phones: each sign wheel becomes a small inset on the corner of its own surface
    const wheelHome=$(root,'.qv-s3-wheels'),wheelFigs=[$(root,'[data-s3-a-wheel]').closest('figure'),$(root,'[data-s3-b-wheel]').closest('figure')];
    const surfaceFigs=[$(root,'[data-s3-a-canvas]').closest('figure'),$(root,'[data-s3-b-canvas]').closest('figure')];
    const phone=window.matchMedia('(max-width: 720px)');
    const placeWheels=()=>{wheelFigs.forEach((f,i)=>{const host=phone.matches?surfaceFigs[i]:wheelHome;if(f.parentElement!==host)host.append(f);f.classList.toggle('qv-s3-inset',phone.matches);});wheelHome.hidden=phone.matches;paint();};
    phone.addEventListener('change',placeWheels,{signal:ctl.signal});
    window.addEventListener('resize',paint,{signal:ctl.signal,passive:true});placeWheels();return()=>ctl.abort();
  }

  /*
   * §4 positive-definite boundary. A(t) = (1 t; t 1) with t = k/4, so every readout is an exact
   * fraction and the type is decided on the integer k (|k| < 4, = 4, > 4). The level curves sit on
   * the floor of the surface (geometry-orbit-fit.js); the direction wheel beside it colours every
   * unit direction by the sign of q. Until a prediction is picked the floor curves, the wheel's
   * colours and the sign readouts stay hidden; crossing |t| = 1 afterwards checks the prediction.
   */
  const S4_PRESETS = [[0, "圆碗"], [0.75, "狭长碗"], [1, "平底山谷"], [1.25, "马鞍"]];

  // q(cos θ, sin θ) = 1 + t·sin 2θ. Directions run counter-clockwise from x₁, as on the floor.
  function s4Wheel(canvas, k, open) {
    const { ctx, width, height } = M().setupCanvas(canvas); if (!ctx) return;
    const p = M().getPalette(), t = k / 4, font = "'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
    const textBand = 46, cx = width / 2, cy = (height - textBand) / 2 + 6;
    const r = Math.max(30, Math.min(width * 0.3, (height - textBand) / 2 - 24));
    const at = (u, s) => ({ x: cx + u[0] * s, y: cy - u[1] * s });
    ctx.fillStyle = p.soft; ctx.fillRect(0, 0, width, height);
    ctx.save(); ctx.strokeStyle = p.line; ctx.globalAlpha = 0.55; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - r - 16, cy); ctx.lineTo(cx + r + 16, cy); ctx.moveTo(cx, cy + r + 16); ctx.lineTo(cx, cy - r - 16); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = p.muted; ctx.font = `italic 13px ${font}`;
    ctx.fillText("x₁", cx + r + 19, cy + 4); ctx.fillText("x₂", cx + 6, cy - r - 9);
    const N = 360;
    for (let i = 0; i < N; i += 1) {
      const a = (TAU * i) / N, b = (TAU * (i + 1)) / N, q = 1 + t * Math.sin(a + b);
      ctx.strokeStyle = !open ? p.line : q > 0 ? p.pos : p.neg;
      ctx.globalAlpha = open ? 1 : 0.32;
      ctx.lineWidth = 9;
      ctx.beginPath(); ctx.arc(cx, cy, r, -a, -b - 0.01, true); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    if (!open) {
      ctx.fillStyle = p.muted; ctx.font = `600 22px ${font}`; ctx.fillText("?", cx, cy + 8);
      ctx.font = `13px ${font}`; ctx.fillText("先猜一猜，再看每个方向的正负", cx, height - 18);
      ctx.textAlign = "left";
      return;
    }
    // q = 0 directions (1, m), 1 + 2tm + m² = 0: dashed, as on the floor
    const ak = Math.abs(k), root2 = ak > 4 ? Math.sqrt(t * t - 1) : 0;
    const zeros = ak < 4 ? [] : ak === 4 ? [-t] : [-t + root2, -t - root2];
    zeros.forEach((m) => {
      const n = Math.hypot(1, m), u = [1 / n, m / n], a = at(u, -r * 1.16), b = at(u, r * 1.16);
      ctx.save(); ctx.strokeStyle = p.zero; ctx.lineWidth = 1.2; ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
    });
    // the lowest direction, q = 1 − |t|: the same direction as the second principal curve on the surface
    if (k !== 0) {
      const low = k > 0 ? [-Math.SQRT1_2, Math.SQRT1_2] : [Math.SQRT1_2, Math.SQRT1_2];
      const a = at(low, -r), b = at(low, r);
      ctx.save(); ctx.strokeStyle = p.coral; ctx.fillStyle = p.coral; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.globalAlpha = 1;
      [a, b].forEach((pt) => { ctx.beginPath(); ctx.arc(pt.x, pt.y, 4.5, 0, TAU); ctx.fill(); });
      ctx.restore();
    }
    const verdict = ak < 4 ? "全部 > 0" : ak === 4 ? "最小 = 0" : "出现 < 0";
    ctx.fillStyle = p.text; ctx.font = `600 17px ${font}`; ctx.fillText(verdict, cx, height - 26);
    ctx.fillStyle = p.muted; ctx.font = `13px ${font}`;
    ctx.fillText(`最小 ${fracStr(1 - ak / 4)} · 最大 ${fracStr(1 + ak / 4)}`, cx, height - 8);
    ctx.textAlign = "left";
  }

  function mountS4(root){
    root.innerHTML=`<h2>交互实验</h2><div class="qv-lab qv-s4"><header class="qv-head"><h3>正定性就是曲面是否在每个方向都向上</h3><p>改变交叉项 ${inline('t')}，让 ${inline('A(t)=\\begin{bmatrix}1&t\\\\t&1\\end{bmatrix}')} 连续变化。曲面底面上的曲线是等高线 ${inline('q(x)=c')}：从正上方看，同一高度的点连成的线。</p></header>
      <div data-s4-gate></div>
      <div class="ch5-toolbar" role="group" aria-label="t 的预设">${S4_PRESETS.map(([t],i)=>`<button type="button" ${i?'':'class="is-active"'} data-s4-preset="${t}">${inline(`t=${fracStr(t)}`)}</button>`).join('')}</div>
      <label class="ch5-range"><span>连续调节 ${inline('t')}</span><input type="range" min="-1.5" max="1.5" step="0.01" value="0" data-s4-t><output data-s4-t-value>0</output></label>
      <div class="qv-s4-grid">
        <div class="qv-s4-main"><div class="qv-hero"><canvas data-s4-surface></canvas><div><span class="ch5-status" data-s4-status></span><div><h4 data-s4-title></h4><p data-s4-scan-copy></p></div></div></div></div>
        <aside class="qv-s4-side">
          <figure class="qv-s4-wheel"><canvas data-s4-scan aria-label="方向轮：单位圆上每个方向的 q 值"></canvas><figcaption>方向轮：单位圆上的每个方向按 ${inline('q')} 的正负着色。圆点是 ${inline('q')} 最小的方向，虚线是 ${inline('q=0')} 的方向。</figcaption></figure>
          <div class="qv-s4-read"><div class="ch5-matrix-wrap" data-s4-matrix></div><div class="qv-values">
            <span class="qv-s4-wide"><b class="qv-s4-label" data-s4-label="min"></b><strong data-s4-min></strong></span>
            <span>${inline('\\Delta_1')}<strong data-s4-d1></strong></span>
            <span><b class="qv-s4-label" data-s4-label="d2"></b><strong data-s4-d2></strong></span>
            <span><b class="qv-s4-label" data-s4-label="lp"></b><strong data-s4-lp></strong></span>
            <span><b class="qv-s4-label" data-s4-label="lm"></b><strong data-s4-lm></strong></span>
            <span class="qv-s4-wide">二次型<strong data-s4-poly></strong></span>
          </div></div>
        </aside>
      </div></div>`;
    // t moves continuously while dragged and settles on quarters (t = k/4), where every readout is exact
    const state={t:0},ctl=new AbortController(),lab=$(root,'.qv-lab');
    const gate=window.LAPredictGate?.mount($(root,'[data-s4-gate]'),{
      root:lab,manual:true,key:'visuals/ch5/geometry-upgrade.js#s4',
      question:`${inline('A(t)')} 的对角元始终是 1。把交叉项 ${inline('t')} 从 0 往右拖，曲面从什么时候开始出现向下的方向？`,
      options:[
        [`${inline('t')} 超过 1 以后`,true,''],
        [`${inline('t')} 一离开 0 就出现`,false,'t=3/4 时方向轮仍然全在 0 上方，底面的等高线还是椭圆。'],
        ['不会出现：对角元都是正的',false,'t=5/4 时沿 x=(1,−1) 方向 q=2−2t=−1/2，曲面在这个方向向下。'],
        [`${inline('t')} 超过 ${inline('1/2')} 以后：交叉项系数 ${inline('2t')} 超过对角元 1`,false,'t=3/4 时 2t=3/2 已经超过 1，方向轮仍然全在 0 上方。'],
      ],
      right:`✓ 沿 ${inline('x=(1,-1)')} 方向 ${inline('q=2-2t')}：${inline('t=1')} 时等于 0，曲面沿这条直线贴住底面；${inline('t>1')} 时变成负的，曲面向下。同时 ${inline('\\Delta_2=1-t^2')} 由正变 0 再变负，所以 ${inline('A(t)')} 正定恰好是 ${inline('-1<t<1')}。`,
      onPick:()=>{tRange.stop();state.t=0;paint();},
      onReveal:()=>paint(),
    });
    // the formulas in t would give the boundary t = ±1 away, so they appear with the verdict
    const S4_LABELS={
      min:['\\min_{\\lVert x\\rVert=1}q_t(x)','\\min_{\\lVert x\\rVert=1}q_t(x)=1-|t|'],
      d2:['\\Delta_2','\\Delta_2=1-t^2'],
      lp:['\\lambda_1','\\lambda_1=1+t'],
      lm:['\\lambda_2','\\lambda_2=1-t'],
    };
    let labelsShown=null;
    const nameOf=(k)=>(S4_PRESETS.find(([t])=>t*4===k)||[])[1];
    function paint(){
      // on a stop k is an integer and every comparison below is exact
      const t=state.t,k=Math.abs(t*4-Math.round(t*4))<1e-9?Math.round(t*4):t*4,ak=Math.abs(k),A=[[1,t],[t,1]],open=!gate||gate.picked;
      const type=ak<4?'inside':ak===4?'edge':'outside';
      lab.toggleAttribute('data-s4-open',open);
      $(root,'[data-s4-t]').value=String(t);
      $(root,'[data-s4-t-value]').textContent=fracStr(t);
      // shape names would give the boundary away, so they join the presets after the prediction
      // the shape names (碗、山谷、马鞍) answer the prediction: they join the chips once it is revealed
      const named=!gate||Boolean(gate.revealed);
      $$(root,'[data-s4-preset]').forEach(b=>{const pk=Math.round(Number(b.dataset.s4Preset)*4);b.classList.toggle('is-active',pk===k);b.innerHTML=`${inline(`t=${fracStr(pk/4)}`)}${named?` · ${nameOf(pk)}`:''}`;});
      const full=Boolean(!gate||gate.revealed);
      if(labelsShown!==full){labelsShown=full;$$(root,'[data-s4-label]').forEach(b=>{b.innerHTML=inline(S4_LABELS[b.dataset.s4Label][full?1:0]);});}
      $(root,'[data-s4-matrix]').innerHTML=fracMatrix(A);
      $(root,'[data-s4-poly]').innerHTML=inline(polyFracTex(A));
      $(root,'[data-s4-d1]').textContent='1 > 0';
      $(root,'[data-s4-d2]').textContent=!open?'?':ak===4?'= 0':`${fracStr((16-k*k)/16)} ${ak<4?'> 0':'< 0'}`;
      $(root,'[data-s4-lp]').textContent=open?fracStr(1+t):'?';
      $(root,'[data-s4-lm]').textContent=open?fracStr(1-t):'?';
      $(root,'[data-s4-min]').textContent=open?fracStr(1-ak/4):'?';
      s4Wheel($(root,'[data-s4-scan]'),k,open);
      lab.dispatchEvent(new Event('la-redraw',{bubbles:true}));
      const status=$(root,'[data-s4-status]'),title=$(root,'[data-s4-title]'),copy=$(root,'[data-s4-scan-copy]');
      if(!open){status.className='ch5-status';status.textContent='先猜一猜';title.textContent='先在上方选一个猜测';copy.innerHTML=`选好以后把 ${inline('t')} 从 0 往右拖。曲面底面会画出等高线，方向轮会按 ${inline('q')} 的正负着色。`;return;}
      status.className=`ch5-status ${type==='inside'?'is-ok':'is-warn'}`;
      status.textContent=type==='inside'?'正定':type==='edge'?'半正定':'不定';
      if(type==='inside'){title.textContent='每个方向都向上：碗面';copy.innerHTML=k===0?`底面的等高线是圆，方向轮全在 0 上方；${inline('\\Delta_1>0')}，${inline('\\Delta_2>0')}。`:`底面的等高线是椭圆，${inline('t')} 离 0 越远越狭长；方向轮全在 0 上方，${inline('\\Delta_1>0')}，${inline('\\Delta_2>0')}。`;}
      else if(type==='edge'){title.textContent='一个方向变平：山谷';copy.innerHTML=`沿 ${inline(k>0?'x_1=-x_2':'x_1=x_2')} 方向 ${inline('q=0')}：曲面沿这条直线贴住底面，等高线变成平行直线，方向轮在这里碰到 0；${inline('\\Delta_2=0')}。`;}
      else{title.textContent='一个方向向下：马鞍';copy.innerHTML=`方向轮出现 0 下方的弧：曲面沿两条虚线穿过底面，等高线变成双曲线；${inline('\\Delta_2<0')}。`;}
    }
    // past |t| = 1 the prediction is checked, whether dragged, stepped or reached by a preset
    const tRange=smoothRange($(root,'[data-s4-t]'),{
      step:0.25,signal:ctl.signal,
      get:()=>state.t,
      set:(v)=>{state.t=v;if(gate?.picked&&Math.abs(v)>1)gate.acted();paint();},
      settle:()=>paint(),
    });
    $$(root,'[data-s4-preset]').forEach(b=>b.addEventListener('click',()=>tRange.glide(Number(b.dataset.s4Preset)),{signal:ctl.signal}));
    window.addEventListener('resize',paint,{signal:ctl.signal,passive:true});paint();return()=>ctl.abort();
  }

  const mounts={"quadratic-matrix":mountS1,"quadratic-standard-form":mountS2,"quadratic-uniqueness":mountS3,"positive-definite":mountS4};
  window.defineChapter5LessonEnhancer?.((section, root) => { const fn=mounts[section?.id]; if(!fn)return; const target=root.querySelector(`#${CSS.escape(section.id)}-interactive`); return fn(target); });
})();


;/* visuals/ch5/geometry-orbit.js */
/* Chapter 5 orbit-camera enhancement. Loaded after geometry-upgrade.js. */
(() => {
  const M = () => window.Ch5Math;
  const inline = (source) => (window.texInline ? window.texInline(source) : source);
  const $ = (root, selector) => root.querySelector(selector);
  const $$ = (root, selector) => [...root.querySelectorAll(selector)];
  const TAU = Math.PI * 2;
  const HOME = Object.freeze({ yaw: -0.72, pitch: 0.46 });
  // §4 looks across the direction x₁ = −x₂ (where q = 1 − |t| is lowest), so its flattening shows
  const HOME_S4 = Object.freeze({ yaw: 0.3, pitch: 0.56 });

  const matrixFrom = (root, selector) => {
    const cells = $$(root, `${selector} .ch5-cell`).map((cell) => Number(cell.dataset.v ?? cell.textContent));
    if (cells.length !== 4 || cells.some((value) => !Number.isFinite(value))) return null;
    return [[cells[0], cells[1]], [cells[2], cells[3]]];
  };

  const vectorFromText = (text) => {
    const values = String(text || "").match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    return values.length >= 2 ? values.slice(0, 2) : null;
  };

  function projectUnit(x, y, z, camera) {
    const cy = Math.cos(camera.yaw);
    const sy = Math.sin(camera.yaw);
    const cp = Math.cos(camera.pitch);
    const sp = Math.sin(camera.pitch);
    const u = cy * x - sy * y;
    const rotatedY = sy * x + cy * y;
    return { u, v: cp * rotatedY + sp * z, depth: sp * rotatedY - cp * z };
  }

  function sampleMatrix(A, half, camera, point) {
    const points = [];
    for (let i = 0; i <= 12; i += 1) {
      for (let j = 0; j <= 12; j += 1) {
        const x = -half + (2 * half * i) / 12;
        const y = -half + (2 * half * j) / 12;
        points.push(projectUnit(x, y, M().qForm(A, [x, y]), camera));
      }
    }
    const axis = half * 1.08;
    points.push(projectUnit(axis, 0, 0, camera));
    points.push(projectUnit(-axis, 0, 0, camera));
    points.push(projectUnit(0, axis, 0, camera));
    points.push(projectUnit(0, -axis, 0, camera));
    const largest = Math.max(1, ...M().eigenvalues2(A).map((value) => Math.abs(value)));
    points.push(projectUnit(0, 0, largest * half * half * 0.68, camera));
    points.push(projectUnit(0, 0, -largest * half * half * 0.42, camera));
    if (point) {
      points.push(projectUnit(point[0], point[1], 0, camera));
      points.push(projectUnit(point[0], point[1], M().qForm(A, point), camera));
    }
    return points;
  }

  function frameFor(matrices, width, height, camera, options = {}) {
    const half = options.half || 1.65;
    const samples = [];
    matrices.forEach((A, index) => samples.push(...sampleMatrix(A, half, camera, index === 0 ? options.point : null)));
    let minU = Infinity;
    let maxU = -Infinity;
    let minV = Infinity;
    let maxV = -Infinity;
    samples.forEach(({ u, v }) => {
      minU = Math.min(minU, u);
      maxU = Math.max(maxU, u);
      minV = Math.min(minV, v);
      maxV = Math.max(maxV, v);
    });
    const pad = { left: 28, right: 28, top: 56, bottom: 34, ...options.padding };
    const availableWidth = Math.max(40, width - pad.left - pad.right);
    const availableHeight = Math.max(40, height - pad.top - pad.bottom);
    const spanU = Math.max(0.001, maxU - minU);
    const spanV = Math.max(0.001, maxV - minV);
    const scale = Math.min(availableWidth / spanU, availableHeight / spanV) * 0.92;
    const centerU = (minU + maxU) / 2;
    const centerV = (minV + maxV) / 2;
    const centerX = pad.left + availableWidth / 2;
    const centerY = pad.top + availableHeight / 2;
    return {
      half,
      project(x, y, z) {
        const p = projectUnit(x, y, z, camera);
        return {
          x: centerX + (p.u - centerU) * scale,
          y: centerY - (p.v - centerV) * scale,
          depth: p.depth,
        };
      },
    };
  }

  function arrow(ctx, start, end, color) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - ux * 8 - uy * 4.4, end.y - uy * 8 + ux * 4.4);
    ctx.lineTo(end.x - ux * 8 + uy * 4.4, end.y - uy * 8 - ux * 4.4);
    ctx.closePath();
    ctx.fill();
  }

  function curve(ctx, points, color, width, alpha) {
    if (!points.length) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.stroke();
    ctx.restore();
  }

  function principalDirections(A) {
    const a = A[0][0];
    const b = A[0][1];
    const c = A[1][1];
    const angle = 0.5 * Math.atan2(2 * b, a - c);
    return [[Math.cos(angle), Math.sin(angle)], [-Math.sin(angle), Math.cos(angle)]];
  }

  function drawSurface(canvas, A, camera, options = {}) {
    const { ctx, width, height } = M().setupCanvas(canvas);
    if (!ctx) return;
    const palette = M().getPalette();
    const supplied = options.frameMatrices || [];
    const matrices = [A, ...supplied.filter((matrix) => matrix !== A)];
    const half = options.half || 1.65;
    const frame = frameFor(matrices, width, height, camera, {
      half,
      point: options.point,
      padding: options.padding,
    });
    canvas.dataset.cameraYaw = String(camera.yaw);
    canvas.dataset.cameraPitch = String(camera.pitch);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, palette.soft);
    gradient.addColorStop(1, palette.soft);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    for (let fixed = -1.5; fixed <= 1.5; fixed += 0.5) {
      const row = [];
      const column = [];
      for (let step = 0; step <= 40; step += 1) {
        const t = -half + (2 * half * step) / 40;
        row.push(frame.project(t, fixed, 0));
        column.push(frame.project(fixed, t, 0));
      }
      curve(ctx, row, palette.line, 1, 0.22);
      curve(ctx, column, palette.line, 1, 0.22);
    }

    const resolution = width < 560 ? 24 : 32;
    const quads = [];
    for (let i = 0; i < resolution; i += 1) {
      for (let j = 0; j < resolution; j += 1) {
        const x0 = -half + (2 * half * i) / resolution;
        const x1 = -half + (2 * half * (i + 1)) / resolution;
        const y0 = -half + (2 * half * j) / resolution;
        const y1 = -half + (2 * half * (j + 1)) / resolution;
        const world = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
        const points = world.map(([x, y]) => frame.project(x, y, M().qForm(A, [x, y])));
        quads.push({
          points,
          value: world.reduce((sum, [x, y]) => sum + M().qForm(A, [x, y]), 0) / 4,
          depth: points.reduce((sum, point) => sum + point.depth, 0) / 4,
        });
      }
    }
    quads.sort((left, right) => left.depth - right.depth).forEach((quad) => {
      ctx.beginPath();
      quad.points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
      ctx.closePath();
      ctx.fillStyle = quad.value >= 0 ? palette.pos : palette.neg;
      ctx.globalAlpha = quad.value >= 0 ? 0.14 : 0.16;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    const wireCount = width < 560 ? 9 : 12;
    for (let index = 0; index <= wireCount; index += 1) {
      const fixed = -half + (2 * half * index) / wireCount;
      const row = [];
      const column = [];
      for (let step = 0; step <= 72; step += 1) {
        const t = -half + (2 * half * step) / 72;
        row.push(frame.project(t, fixed, M().qForm(A, [t, fixed])));
        column.push(frame.project(fixed, t, M().qForm(A, [fixed, t])));
      }
      curve(ctx, row, palette.pos, 0.9, 0.34);
      curve(ctx, column, palette.pos, 0.9, 0.34);
    }

    principalDirections(A).forEach((direction, index) => {
      const points = [];
      for (let step = -48; step <= 48; step += 1) {
        const t = (half * step) / 48;
        const x = direction[0] * t;
        const y = direction[1] * t;
        points.push(frame.project(x, y, M().qForm(A, [x, y])));
      }
      curve(ctx, points, index ? palette.coral : palette.accentStrong, 3, 0.95);
    });

    const origin = frame.project(0, 0, 0);
    const axis = half * 1.08;
    const xAxis = frame.project(axis, 0, 0);
    const yAxis = frame.project(0, axis, 0);
    const largest = Math.max(1, ...M().eigenvalues2(A).map((value) => Math.abs(value)));
    const zAxis = frame.project(0, 0, largest * half * half * 0.62);
    arrow(ctx, origin, xAxis, palette.text);
    arrow(ctx, origin, yAxis, palette.text);
    arrow(ctx, origin, zAxis, palette.text);
    ctx.fillStyle = palette.muted;
    ctx.font = "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
    ctx.fillText("x₁", xAxis.x + 5, xAxis.y + 2);
    ctx.fillText("x₂", yAxis.x - 18, yAxis.y + 2);
    ctx.fillText("q", zAxis.x + 6, zAxis.y + 2);

    if (options.point) {
      const floor = frame.project(options.point[0], options.point[1], 0);
      const onSurface = frame.project(options.point[0], options.point[1], M().qForm(A, options.point));
      ctx.strokeStyle = palette.coral;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(floor.x, floor.y);
      ctx.lineTo(onSurface.x, onSurface.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = palette.coral;
      ctx.beginPath();
      ctx.arc(onSurface.x, onSurface.y, 5.5, 0, TAU);
      ctx.fill();
    }
  }

  function wrapCanvas(canvas, titleHtml) {
    if (!canvas || canvas.parentElement?.classList.contains("qv-orbit-shell")) return canvas?.parentElement;
    const shell = document.createElement("div");
    shell.className = "qv-orbit-shell";
    canvas.before(shell);
    shell.append(canvas);
    const title = document.createElement("div");
    title.className = "qv-orbit-title";
    title.innerHTML = titleHtml;
    const hint = document.createElement("div");
    hint.className = "qv-orbit-hint";
    hint.textContent = "拖动旋转 · 双击复位";
    shell.append(title, hint);
    return shell;
  }

  function addViewTools(reference, reset, linked) {
    if (!reference || reference.previousElementSibling?.classList.contains("qv-orbit-tools")) return;
    const tools = document.createElement("div");
    tools.className = "qv-orbit-tools";
    tools.innerHTML = `<span>${linked ? "拖动任一曲面，左右视角同步" : "在曲面的空白区域拖动，可从不同方向观察"}</span><button type="button">复位视角</button>`;
    tools.querySelector("button").addEventListener("click", reset);
    reference.before(tools);
  }

  function bindOrbit(canvases, camera, redraw, controller, home = HOME) {
    const drag = { active: false, id: null, x: 0, y: 0, yaw: 0, pitch: 0 };
    const reset = () => {
      camera.yaw = home.yaw;
      camera.pitch = home.pitch;
      redraw();
    };
    canvases.forEach((canvas) => {
      canvas.tabIndex = 0;
      canvas.setAttribute("role", "application");
      canvas.setAttribute("aria-label", "可拖动旋转的三维二次型曲面；方向键也可调整视角，Home 键复位");
      canvas.addEventListener("pointerdown", (event) => {
        drag.active = true;
        drag.id = event.pointerId;
        drag.x = event.clientX;
        drag.y = event.clientY;
        drag.yaw = camera.yaw;
        drag.pitch = camera.pitch;
        canvas.setPointerCapture?.(event.pointerId);
        canvas.classList.add("is-dragging");
        event.preventDefault();
      }, { signal: controller.signal });
      canvas.addEventListener("pointermove", (event) => {
        if (!drag.active || event.pointerId !== drag.id) return;
        camera.yaw = drag.yaw + (event.clientX - drag.x) * 0.007;
        camera.pitch = M().clamp(drag.pitch - (event.clientY - drag.y) * 0.006, 0.18, 1.18);
        redraw();
        event.preventDefault();
      }, { signal: controller.signal });
      const finish = (event) => {
        if (event.pointerId !== drag.id) return;
        drag.active = false;
        drag.id = null;
        canvas.classList.remove("is-dragging");
      };
      canvas.addEventListener("pointerup", finish, { signal: controller.signal });
      canvas.addEventListener("pointercancel", finish, { signal: controller.signal });
      canvas.addEventListener("dblclick", reset, { signal: controller.signal });
      canvas.addEventListener("keydown", (event) => {
        const step = event.shiftKey ? 0.12 : 0.06;
        if (event.key === "ArrowLeft") camera.yaw -= step;
        else if (event.key === "ArrowRight") camera.yaw += step;
        else if (event.key === "ArrowUp") camera.pitch = M().clamp(camera.pitch - step, 0.18, 1.18);
        else if (event.key === "ArrowDown") camera.pitch = M().clamp(camera.pitch + step, 0.18, 1.18);
        else if (event.key === "Home") reset();
        else return;
        redraw();
        event.preventDefault();
      }, { signal: controller.signal });
    });
    return reset;
  }

  function replaceLabel(span, formula) {
    if (!span) return;
    const value = span.querySelector("strong");
    span.innerHTML = inline(formula);
    if (value) span.append(value);
  }

  function enhanceSection(section, root) {
    const controller = new AbortController();
    const camera = { ...(section.id === "positive-definite" ? HOME_S4 : HOME) };
    let redraw = () => {};
    let canvases = [];

    if (section.id === "quadratic-matrix") {
      const left = $(root, "[data-s1-a-canvas]");
      const right = $(root, "[data-s1-b-canvas]");
      canvases = [left, right];
      wrapCanvas(left, `${inline("A")} · 原坐标`);
      wrapCanvas(right, `${inline("B=C^TAC")} · 新坐标`);
      const pair = $(root, ".qv-same");
      redraw = () => {
        const A = [[2, 1], [1, 1]];
        const B = matrixFrom(root, "[data-s1-b]") || A;
        const x = vectorFromText($(root, "[data-s1-x]")?.textContent) || [1, 0];
        const active = $(root, "[data-s1-y].is-active")?.dataset.s1Y;
        const y = active === "e2" ? [0, 1] : active === "sum" ? [1, 1] : [1, 0];
        const half = Math.max(1.65, ...x.map((value) => Math.abs(value) * 1.12));
        drawSurface(left, A, camera, { point: x, half, frameMatrices: [A, B] });
        drawSurface(right, B, camera, { point: y, half, frameMatrices: [A, B] });
      };
      const reset = bindOrbit(canvases, camera, redraw, controller);
      addViewTools(pair, reset, true);
      const captions = $$(root, ".qv-same figcaption");
      if (captions[0]) captions[0].innerHTML = `先算 ${inline("x=Cy")}，再看 ${inline("x^TAx")}`;
      if (captions[1]) captions[1].innerHTML = `在 ${inline("y")} 坐标中直接看 ${inline("y^TBy")}`;
      const labels = $$(root, ".qv-values > span");
      replaceLabel(labels[0], "\\det C");
      replaceLabel(labels[1], "x=Cy");
      replaceLabel(labels[2], "x^TAx");
      replaceLabel(labels[3], "y^TBy");
    }

    if (section.id === "quadratic-standard-form") {
      const canvas = $(root, "[data-s2-canvas]");
      canvases = [canvas];
      const shell = wrapCanvas(canvas, "当前二次型");
      redraw = () => {
        const D = matrixFrom(root, "[data-s2-d]");
        if (!D) return;
        drawSurface(canvas, D, camera, { frameMatrices: [D] });
        const final = $(root, "[data-s2-status]")?.textContent.includes("完成");
        const title = shell?.querySelector(".qv-orbit-title");
        if (title) title.innerHTML = final ? `标准形 · 新变量 ${inline("y")}` : "当前二次型";
      };
      const reset = bindOrbit(canvases, camera, redraw, controller);
      addViewTools(shell, reset, false);
    }

    if (section.id === "quadratic-uniqueness") {
      const left = $(root, "[data-s3-a-canvas]");
      const right = $(root, "[data-s3-b-canvas]");
      canvases = [left, right];
      wrapCanvas(left, `${inline("A")} · 原曲面`);
      wrapCanvas(right, `${inline("B=C^TAC")} · 变换后`);
      const pair = $(root, ".qv-same");
      redraw = () => {
        const A = matrixFrom(root, "[data-s3-a]");
        const B = matrixFrom(root, "[data-s3-b]");
        if (!A || !B) return;
        drawSurface(left, A, camera, { frameMatrices: [A, B] });
        drawSurface(right, B, camera, { frameMatrices: [A, B] });
      };
      const reset = bindOrbit(canvases, camera, redraw, controller);
      addViewTools(pair, reset, true);
      const middle = $(root, ".qv-equals strong");
      if (middle) middle.innerHTML = inline("C^TAC");
    }

    if (section.id === "positive-definite") {
      const canvas = $(root, "[data-s4-surface]");
      canvases = [canvas];
      const hero = $(root, ".qv-hero");
      hero?.classList.add("qv-orbit-shell", "qv-orbit-hero");
      const oldCaption = hero?.querySelector(":scope > div");
      if (oldCaption) {
        oldCaption.classList.add("qv-orbit-caption");
        hero.after(oldCaption);
      }
      const title = document.createElement("div");
      title.className = "qv-orbit-title";
      title.innerHTML = `${inline("q_t(x)")}<span data-orbit-class></span>`;
      const hint = document.createElement("div");
      hint.className = "qv-orbit-hint";
      hint.textContent = "拖动旋转 · 双击复位";
      hero?.append(title, hint);
      redraw = () => {
        const value = Number($(root, "[data-s4-t]")?.value || 0);
        const A = [[1, value], [value, 1]];
        drawSurface(canvas, A, camera, { frameMatrices: [A], padding: { top: 58, bottom: 42 } });
        // on a stop t = k/4 and the type is read off |k| exactly (between stops, while dragged, |4t|
        // as it is); it joins the title once a prediction is picked
        const k4 = Math.abs(value * 4);
        const k = Math.abs(k4 - Math.round(k4)) < 1e-9 ? Math.round(k4) : k4;
        const open = Boolean(root.querySelector(".qv-lab[data-s4-open]"));
        const clsNode = $(root, "[data-orbit-class]");
        if (clsNode) clsNode.textContent = open ? ` · ${k < 4 ? "正定" : k === 4 ? "半正定" : "不定"}` : "";
      };
      const reset = bindOrbit(canvases, camera, redraw, controller, HOME_S4);
      addViewTools(hero, reset, false);
    }

    if (!canvases.length) return undefined;
    const schedule = () => requestAnimationFrame(redraw);
    root.addEventListener("click", schedule, { signal: controller.signal });
    root.addEventListener("input", schedule, { signal: controller.signal });
    // a lab that animates a value without input events asks for a redraw this way. Redraw at
    // once: the lab has just painted its flat preview surface on the same canvas, and waiting for
    // the next frame would let that preview (at another scale) show for a frame — every frame
    // while the slider glides to its stop.
    root.addEventListener("la-redraw", () => redraw(), { signal: controller.signal });
    window.addEventListener("resize", schedule, { signal: controller.signal, passive: true });
    redraw();
    return () => controller.abort();
  }

  window.defineChapter5LessonEnhancer?.((section, lessonRoot) => {
    if (!["quadratic-matrix", "quadratic-standard-form", "quadratic-uniqueness", "positive-definite"].includes(section?.id)) return undefined;
    const root = lessonRoot.querySelector(`#${CSS.escape(section.id)}-interactive`);
    return enhanceSection(section, root);
  });
})();

;/* visuals/ch5/geometry-orbit-fit.js */
/* Final fitted renderer for Chapter 5 orbit canvases. */
(() => {
  const M = () => window.Ch5Math;
  const $ = (root, selector) => root.querySelector(selector);
  const $$ = (root, selector) => [...root.querySelectorAll(selector)];
  const TAU = Math.PI * 2;
  const EPS = 1e-5;

  function matrixFrom(root, selector) {
    const values = $$(root, `${selector} .ch5-cell`).map((cell) => Number(cell.dataset.v ?? cell.textContent));
    if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) return null;
    return [[values[0], values[1]], [values[2], values[3]]];
  }

  function vectorFromText(text) {
    const values = String(text || "").match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    return values.length >= 2 ? values.slice(0, 2) : null;
  }

  function cameraFrom(canvas) {
    return {
      yaw: Number(canvas.dataset.cameraYaw || -0.72),
      pitch: Number(canvas.dataset.cameraPitch || 0.46),
    };
  }

  function eigenDirections(A) {
    const angle = 0.5 * Math.atan2(2 * A[0][1], A[0][0] - A[1][1]);
    return [[Math.cos(angle), Math.sin(angle)], [-Math.sin(angle), Math.cos(angle)]];
  }

  function zScaleFor(matrices, half) {
    const maximum = Math.max(
      1,
      ...matrices.flatMap((A) => M().eigenvalues2(A).map((value) => Math.abs(value) * half * half)),
    );
    return 1.55 / maximum;
  }

  function rotate(x, y, z, camera, zScale) {
    const cy = Math.cos(camera.yaw);
    const sy = Math.sin(camera.yaw);
    const cp = Math.cos(camera.pitch);
    const sp = Math.sin(camera.pitch);
    const u = cy * x - sy * y;
    const rotatedY = sy * x + cy * y;
    const scaledZ = z * zScale;
    return {
      u,
      v: cp * rotatedY + sp * scaledZ,
      depth: sp * rotatedY - cp * scaledZ,
    };
  }

  function makeFrame(width, height, matrices, camera, options = {}) {
    const half = options.half || 1.65;
    const zScale = zScaleFor(matrices, half);
    const samples = [];
    const add = (x, y, z) => samples.push(rotate(x, y, z, camera, zScale));
    matrices.forEach((A) => {
      for (let i = 0; i <= 14; i += 1) {
        for (let j = 0; j <= 14; j += 1) {
          const x = -half + (2 * half * i) / 14;
          const y = -half + (2 * half * j) / 14;
          add(x, y, M().qForm(A, [x, y]));
        }
      }
    });
    const axis = half * 1.08;
    add(axis, 0, 0);
    add(-axis, 0, 0);
    add(0, axis, 0);
    add(0, -axis, 0);
    add(0, 0, 1.75 / zScale);
    add(0, 0, -1.2 / zScale);
    if (options.point) {
      add(options.point[0], options.point[1], 0);
      add(options.point[0], options.point[1], M().qForm(matrices[0], options.point));
    }

    let minU = Infinity;
    let maxU = -Infinity;
    let minV = Infinity;
    let maxV = -Infinity;
    samples.forEach(({ u, v }) => {
      minU = Math.min(minU, u);
      maxU = Math.max(maxU, u);
      minV = Math.min(minV, v);
      maxV = Math.max(maxV, v);
    });
    const padding = { left: 30, right: 30, top: 58, bottom: 34, ...options.padding };
    const availableWidth = Math.max(60, width - padding.left - padding.right);
    const availableHeight = Math.max(60, height - padding.top - padding.bottom);
    const scale = Math.min(
      availableWidth / Math.max(0.001, maxU - minU),
      availableHeight / Math.max(0.001, maxV - minV),
    ) * 0.94;
    const centerU = (minU + maxU) / 2;
    const centerV = (minV + maxV) / 2;
    const centerX = padding.left + availableWidth / 2;
    const centerY = padding.top + availableHeight / 2;
    return {
      half,
      zScale,
      project(x, y, z) {
        const point = rotate(x, y, z, camera, zScale);
        return {
          x: centerX + (point.u - centerU) * scale,
          y: centerY - (point.v - centerV) * scale,
          depth: point.depth,
        };
      },
    };
  }

  function path(ctx, points, color, width = 1, alpha = 1) {
    if (points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.stroke();
    ctx.restore();
  }

  function signedPath(ctx, samples, palette, width = 1) {
    ctx.save();
    ctx.lineWidth = width;
    ctx.globalAlpha = 0.42;
    for (let index = 1; index < samples.length; index += 1) {
      const previous = samples[index - 1];
      const current = samples[index];
      const value = (previous.value + current.value) / 2;
      ctx.strokeStyle = value < -EPS ? palette.neg : value > EPS ? palette.pos : palette.coral;
      ctx.beginPath();
      ctx.moveTo(previous.point.x, previous.point.y);
      ctx.lineTo(current.point.x, current.point.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function arrow(ctx, start, end, color) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - ux * 8 - uy * 4.5, end.y - uy * 8 + ux * 4.5);
    ctx.lineTo(end.x - ux * 8 + uy * 4.5, end.y - uy * 8 - ux * 4.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /*
   * §4: the level curves q = c drawn on the floor z = 0 under the surface (what a view from straight
   * above shows), clipped to the floor square, q > 0 in the surface's positive colour and q < 0 in its
   * negative colour; the q = 0 lines are dashed. They are drawn before the translucent surface, so the
   * surface passes over them and meets the floor exactly on the dashed lines.
   */
  function drawFloorLevels(ctx, frame, A, palette, floor) {
    const half = frame.half;
    const reach = half * Math.SQRT2 * 1.1;
    const corners = [[-half, -half], [half, -half], [half, half], [-half, half]].map(([x, y]) => frame.project(x, y, 0));
    ctx.save();
    ctx.beginPath();
    corners.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.closePath();
    ctx.fillStyle = palette.line;
    ctx.globalAlpha = 0.07;
    ctx.fill();
    ctx.strokeStyle = palette.line;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.clip();
    const N = 720;
    (floor.levels || []).forEach((level) => {
      ctx.strokeStyle = level > 0 ? palette.pos : palette.neg;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      let down = false;
      for (let i = 0; i <= N; i += 1) {
        const angle = (TAU * i) / N;
        const ux = Math.cos(angle);
        const uy = Math.sin(angle);
        const q = M().qForm(A, [ux, uy]);
        if (q * level <= 0) { down = false; continue; }
        const r = Math.sqrt(level / q);
        if (r > reach) { down = false; continue; }
        const point = frame.project(r * ux, r * uy, 0);
        if (down) ctx.lineTo(point.x, point.y);
        else { ctx.moveTo(point.x, point.y); down = true; }
      }
      ctx.stroke();
    });
    ctx.strokeStyle = palette.zero;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 5]);
    (floor.zeroDirections || []).forEach(([dx, dy]) => {
      const a = frame.project(-dx * reach, -dy * reach, 0);
      const b = frame.project(dx * reach, dy * reach, 0);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawSurface(canvas, A, options = {}) {
    const { ctx, width, height } = M().setupCanvas(canvas);
    if (!ctx) return;
    const palette = M().getPalette();
    const camera = cameraFrom(canvas);
    const matrices = options.frameMatrices?.length ? options.frameMatrices : [A];
    const frame = makeFrame(width, height, matrices, camera, options);
    const half = frame.half;

    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, palette.soft);
    background.addColorStop(1, palette.soft);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    for (let fixed = -1.5; fixed <= 1.5; fixed += 0.5) {
      const row = [];
      const column = [];
      for (let step = 0; step <= 40; step += 1) {
        const t = -half + (2 * half * step) / 40;
        row.push(frame.project(t, fixed, 0));
        column.push(frame.project(fixed, t, 0));
      }
      path(ctx, row, palette.line, 1, 0.2);
      path(ctx, column, palette.line, 1, 0.2);
    }

    if (options.floor) drawFloorLevels(ctx, frame, A, palette, options.floor);

    const resolution = width < 560 ? 24 : 32;
    const quads = [];
    for (let i = 0; i < resolution; i += 1) {
      for (let j = 0; j < resolution; j += 1) {
        const x0 = -half + (2 * half * i) / resolution;
        const x1 = -half + (2 * half * (i + 1)) / resolution;
        const y0 = -half + (2 * half * j) / resolution;
        const y1 = -half + (2 * half * (j + 1)) / resolution;
        const world = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
        const points = world.map(([x, y]) => frame.project(x, y, M().qForm(A, [x, y])));
        quads.push({
          points,
          value: world.reduce((sum, [x, y]) => sum + M().qForm(A, [x, y]), 0) / 4,
          depth: points.reduce((sum, point) => sum + point.depth, 0) / 4,
        });
      }
    }
    quads.sort((left, right) => left.depth - right.depth).forEach((quad) => {
      ctx.beginPath();
      quad.points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
      ctx.closePath();
      ctx.fillStyle = quad.value < -EPS ? palette.neg : palette.pos;
      ctx.globalAlpha = quad.value < -EPS ? 0.17 : 0.13;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    const wireCount = width < 560 ? 9 : 12;
    for (let index = 0; index <= wireCount; index += 1) {
      const fixed = -half + (2 * half * index) / wireCount;
      const row = [];
      const column = [];
      for (let step = 0; step <= 72; step += 1) {
        const t = -half + (2 * half * step) / 72;
        const rowValue = M().qForm(A, [t, fixed]);
        const columnValue = M().qForm(A, [fixed, t]);
        row.push({ value: rowValue, point: frame.project(t, fixed, rowValue) });
        column.push({ value: columnValue, point: frame.project(fixed, t, columnValue) });
      }
      signedPath(ctx, row, palette, 0.95);
      signedPath(ctx, column, palette, 0.95);
    }

    eigenDirections(A).forEach((direction, index) => {
      const points = [];
      for (let step = -48; step <= 48; step += 1) {
        const t = (half * step) / 48;
        const x = direction[0] * t;
        const y = direction[1] * t;
        points.push(frame.project(x, y, M().qForm(A, [x, y])));
      }
      if (!options.signedAxes) {
        path(ctx, points, index ? palette.coral : palette.accentStrong, 3, 0.96);
        return;
      }
      // §3: a principal direction is coloured and named by the sign of q along it
      const lambda = M().qForm(A, direction);
      const color = lambda > EPS ? palette.pos : lambda < -EPS ? palette.neg : palette.zero;
      ctx.save();
      if (Math.abs(lambda) <= EPS) ctx.setLineDash([6, 5]);
      path(ctx, points, color, 3, 0.96);
      ctx.restore();
      const end = points[points.length - 1];
      arrow(ctx, points[points.length - 4], end, color);
      ctx.save();
      ctx.fillStyle = color;
      ctx.font = "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.fillText(lambda > EPS ? "向上" : lambda < -EPS ? "向下" : "平坦", end.x + 6, end.y + (lambda < -EPS ? 14 : -6));
      ctx.restore();
    });

    const origin = frame.project(0, 0, 0);
    const axis = half * 1.08;
    const xAxis = frame.project(axis, 0, 0);
    const yAxis = frame.project(0, axis, 0);
    const zAxis = frame.project(0, 0, 1.72 / frame.zScale);
    arrow(ctx, origin, xAxis, palette.text);
    arrow(ctx, origin, yAxis, palette.text);
    arrow(ctx, origin, zAxis, palette.text);
    ctx.fillStyle = palette.muted;
    ctx.font = "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
    const [n1, n2] = options.axisLabels || ["x₁", "x₂"];
    ctx.fillText(n1, xAxis.x + 5, xAxis.y + 2);
    ctx.fillText(n2, yAxis.x - 18, yAxis.y + 2);
    ctx.fillText("q", zAxis.x + 6, zAxis.y + 2);

    if (Number.isFinite(options.level) && options.point) {
      // the level z = h: one translucent horizontal plane over the whole square, the level curve
      // q = h where it cuts the surface, a dashed line to the q axis and a tick there; both views
      // share one frame, so the planes are the same height
      const h = options.level;
      const [px, py] = options.point;
      const corners = [[-half, -half], [half, -half], [half, half], [-half, half]].map(([x, y]) => frame.project(x, y, h));
      const image = getComputedStyle(document.body).getPropertyValue("--cv-image").trim() || "#8c4f86";
      const axisPoint = frame.project(0, 0, h);
      const top = frame.project(px, py, h);
      ctx.save();
      ctx.beginPath();
      corners.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
      ctx.closePath();
      ctx.fillStyle = image;
      ctx.globalAlpha = 0.1;
      ctx.fill();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = image;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // level curve: r·u with q(u)·r² = h, kept inside the square
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      let down = false;
      for (let i = 0; i <= 720; i += 1) {
        const angle = (TAU * i) / 720;
        const u = [Math.cos(angle), Math.sin(angle)];
        const q = M().qForm(A, u);
        const r = q * h > 0 ? Math.sqrt(h / q) : Infinity;
        const x = r * u[0];
        const y = r * u[1];
        if (!Number.isFinite(r) || Math.abs(x) > half || Math.abs(y) > half) { down = false; continue; }
        const point = frame.project(x, y, h);
        if (down) ctx.lineTo(point.x, point.y);
        else { ctx.moveTo(point.x, point.y); down = true; }
      }
      ctx.stroke();
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.85;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(axisPoint.x, axisPoint.y);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(axisPoint.x - 6, axisPoint.y);
      ctx.lineTo(axisPoint.x + 6, axisPoint.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = image;
      ctx.font = "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.textAlign = "right";
      ctx.fillText(M().formatNum(h, 4), axisPoint.x - 9, axisPoint.y + 4);
      ctx.restore();
    }

    if (options.point) {
      const floor = frame.project(options.point[0], options.point[1], 0);
      const value = M().qForm(A, options.point);
      const onSurface = frame.project(options.point[0], options.point[1], value);
      const image = getComputedStyle(document.body).getPropertyValue("--cv-image").trim() || "#8c4f86";
      ctx.save();
      // vertical height stem from the base point up to the surface, on a paper halo so it reads over the mesh
      ctx.lineCap = "round";
      ctx.strokeStyle = palette.soft;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(floor.x, floor.y);
      ctx.lineTo(onSurface.x, onSurface.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = image;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(floor.x, floor.y);
      ctx.lineTo(onSurface.x, onSurface.y);
      ctx.stroke();
      ctx.fillStyle = image;
      // the tip sits on the level plane: glow it
      if (Number.isFinite(options.level) && Math.abs(value - options.level) < 1e-6) {
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(onSurface.x, onSurface.y, 12, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.beginPath();
      ctx.arc(onSurface.x, onSurface.y, 5.5, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(floor.x, floor.y, 3.5, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.font = "italic 600 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      if (options.pointLabel) ctx.fillText(options.pointLabel, floor.x + 7, floor.y + 15);
      if (options.stemLabel) {
        const text = options.stemLabel;
        const tw = ctx.measureText(text).width;
        const lx = Math.max(8, Math.min(width - tw - 8, onSurface.x + 10));
        const ly = Math.max(70, (floor.y + onSurface.y) / 2);
        ctx.fillStyle = palette.soft;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(lx - 4, ly - 14, tw + 8, 19);
        ctx.globalAlpha = 1;
        ctx.fillStyle = image;
        ctx.fillText(text, lx, ly);
      }
      ctx.restore();
    }
  }

  function enhance(section, root) {
    if (!root) return undefined;
    const controller = new AbortController();
    let redraw = () => {};

    if (section.id === "quadratic-matrix") {
      const left = $(root, "[data-s1-a-canvas]");
      const right = $(root, "[data-s1-b-canvas]");
      redraw = () => {
        const A = [[2, 1], [1, 1]];
        const B = matrixFrom(root, "[data-s1-b]") || A;
        const x = vectorFromText($(root, "[data-s1-x]")?.textContent) || [1, 0];
        const active = $(root, "[data-s1-y].is-active")?.dataset.s1Y;
        const y = active === "e2" ? [0, 1] : active === "sum" ? [1, 1] : [1, 0];
        const half = Math.max(1.65, ...x.map((value) => Math.abs(value) * 1.12));
        // after the prediction both views get the same level plane through the stem tops
        const open = Boolean(root.querySelector(".qv-lab[data-s1-open]"));
        const level = open ? M().qForm(A, x) : null;
        drawSurface(left, A, { point: x, half, frameMatrices: [A, B], level, stemLabel: open ? `xᵀAx = ${M().formatNum(level, 4)}` : "xᵀAx", pointLabel: "x" });
        drawSurface(right, B, { point: y, half, frameMatrices: [A, B], level, stemLabel: open ? `yᵀBy = ${M().formatNum(level, 4)}` : "yᵀBy", pointLabel: "y" });
      };
    }

    if (section.id === "quadratic-standard-form") {
      const canvas = $(root, "[data-s2-canvas]");
      redraw = () => {
        const D = matrixFrom(root, "[data-s2-d]");
        const y = root.querySelector(".qv-lab")?.dataset.s2Vars === "y";
        if (D) drawSurface(canvas, D, { frameMatrices: [D], axisLabels: y ? ["y₁", "y₂"] : ["x₁", "x₂"] });
      };
    }

    if (section.id === "quadratic-uniqueness") {
      const left = $(root, "[data-s3-a-canvas]");
      const right = $(root, "[data-s3-b-canvas]");
      redraw = () => {
        const A = matrixFrom(root, "[data-s3-a]");
        const B = matrixFrom(root, "[data-s3-b]");
        if (!A || !B) return;
        drawSurface(left, A, { frameMatrices: [A, B], signedAxes: true });
        drawSurface(right, B, { frameMatrices: [A, B], signedAxes: true });
      };
    }

    if (section.id === "positive-definite") {
      const surface = $(root, "[data-s4-surface]");
      redraw = () => {
        const t = Number($(root, "[data-s4-t]")?.value || 0);
        const A = [[1, t], [t, 1]];
        // the level curves would give the type away, so the floor stays bare until a prediction
        const open = Boolean(root.querySelector(".qv-lab[data-s4-open]"));
        surface.dataset.floor = open ? "on" : "off";
        // q = 0 directions (1, m) with 1 + 2tm + m² = 0; on a stop t = k/4, so |k| decides exactly
        // (between stops, while the slider is dragged, |4t| is compared as it is)
        const k4 = Math.abs(t * 4);
        const k = Math.abs(k4 - Math.round(k4)) < 1e-9 ? Math.round(k4) : k4;
        const root2 = k > 4 ? Math.sqrt(t * t - 1) : 0;
        const zeroDirections = (k < 4 ? [] : k === 4 ? [-t] : [-t + root2, -t - root2])
          .map((m) => [1 / Math.hypot(1, m), m / Math.hypot(1, m)]);
        drawSurface(surface, A, {
          frameMatrices: [A],
          padding: { top: 58, bottom: 42 },
          floor: open ? { levels: [-2, -1, -0.5, 0.5, 1, 2], zeroDirections } : null,
        });
      };
    }

    const schedule = () => requestAnimationFrame(redraw);
    root.addEventListener("pointermove", schedule, { signal: controller.signal });
    root.addEventListener("click", schedule, { signal: controller.signal });
    root.addEventListener("input", schedule, { signal: controller.signal });
    // a lab that animates a value without input events asks for a redraw this way. Redraw at
    // once: the lab has just painted its flat preview surface on the same canvas, and waiting for
    // the next frame would let that preview (at another scale) show for a frame — every frame
    // while the slider glides to its stop.
    root.addEventListener("la-redraw", () => redraw(), { signal: controller.signal });
    window.addEventListener("resize", schedule, { signal: controller.signal, passive: true });
    schedule();
    return () => controller.abort();
  }

  window.defineChapter5LessonEnhancer?.((section, lessonRoot) => {
    if (!["quadratic-matrix", "quadratic-standard-form", "quadratic-uniqueness", "positive-definite"].includes(section?.id)) return undefined;
    return enhance(section, lessonRoot.querySelector(`#${CSS.escape(section.id)}-interactive`));
  });
})();

;/* visuals/ch5/mount.js */
/* Attach Chapter 5 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  const tex = (source) => (window.texInline ? window.texInline(source) : source);
  const taskCopy = {
    "quadratic-matrix": ["看两根高度杆", `选一种替换，比较两根杆的顶端是否落在同一个水平面上；再看 ${tex("\\det C")} 判断是不是合同。`],
    "quadratic-standard-form": ["先看俯视小图里椭圆的倾斜", "逐步配方，直到新变量下交叉项消失；看椭圆的轴怎样摆正，并核对行列式和秩。"],
    "quadratic-uniqueness": ["先盯住向上、向下的方向", `猜好之后拖动剪切参数 ${tex("h")}，看曲面和符号轮怎样变；再让替换奇异，比较定理前提何时停止。`],
    "positive-definite": [`把 ${tex("t")} 从 0 往右拖`, "先看曲面和它底面的等高线，再用方向轮和主子式核对同一个边界。"],
  };

  window.renderLessonPage = function renderLessonPageWithChapter5Extensions(section, chapter) {
    baseRenderLessonPage(section, chapter);
    const root = document.querySelector("#mainContent");
    window.mountChapter5Lesson?.(section, root);
    const lab = root?.querySelector(".qv-lab");
    if (!lab) return;
    lab.classList.add("ch5-lab");
    const copy = taskCopy[section?.id];
    // title → prediction → lab: the task card goes under the prediction box, never between
    const gate = lab.querySelector(".ch3l-predict")?.parentElement;
    const anchor = gate && gate.parentElement === lab ? gate : lab.querySelector(".qv-head");
    if (copy && anchor && !lab.querySelector(".ch5-task")) {
      anchor.insertAdjacentHTML(
        "afterend",
        `<div class="ch5-task qv-task"><span>1</span><div><strong>${copy[0]}</strong><p>${copy[1]}</p></div></div>`,
      );
    }
  };
})();

