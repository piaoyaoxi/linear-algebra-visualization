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

  /** Level sets via polar sampling: r² = L / q(uθ). Cleaner than marching squares. */
  /** Cleaner wire surface with z-clipping by depth order (painter). */
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

  window.Ch5Math = {
    clamp,
    reducedMotion,
    formatNum,
    identity,
    matVec,
    det2,
    symmetrize,
    qForm,
    mat2FromAbc,
    polyPlain2,
    congruence,
    matrixRank,
    eigenvalues2,
    inertiaSymmetric,
    completeSquareSteps2,
    getPalette,
    setupCanvas,
    matrixHtml,
  };
})();
