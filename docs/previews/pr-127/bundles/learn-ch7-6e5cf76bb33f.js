
;/* visuals/ch7/figures.js */
/*
 * Chapter 7 static figures (inline SVG, themed through CSS tokens) and the
 * sections that only need theorem blocks: §1, §2 and §8 have no lab.
 */
(() => {
  const K = window.Ch7Kit;

  // the point lands exactly on (x2, y2); the shaft stops inside the notched head
  // trim = [px off the start, px off the end], e.g. to stop at the edge of a dot
  function arrow(x1, y1, x2, y2, cls, head = 9, trim = [0, 0]) {
    const full = Math.hypot(x2 - x1, y2 - y1) || 1;
    const ux = (x2 - x1) / full;
    const uy = (y2 - y1) / full;
    [x1, y1, x2, y2] = [x1 + ux * trim[0], y1 + uy * trim[0], x2 - ux * trim[1], y2 - uy * trim[1]];
    const len = Math.max(1, full - trim[0] - trim[1]);
    const h = Math.min(head, len * 0.5);
    const half = h * 0.42;
    const notch = h * 0.72;
    const f = (v) => v.toFixed(1);
    const sx = x2 - ux * (notch - 0.5);
    const sy = y2 - uy * (notch - 0.5);
    const pts = [
      [x2, y2],
      [x2 - ux * h - uy * half, y2 - uy * h + ux * half],
      [x2 - ux * notch, y2 - uy * notch],
      [x2 - ux * h + uy * half, y2 - uy * h - ux * half],
    ].map(([x, y]) => `${f(x)},${f(y)}`).join(" ");
    return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(sx)}" y2="${f(sy)}" class="ch7f-stroke ${cls}"/><polygon points="${pts}" class="ch7f-fill ${cls}"/>`;
  }

  // math labels: Greek/Latin letters in italic, "_0" as a lowered small subscript
  function mathText(x, y, text, cls, anchor = "start") {
    const body = String(text)
      .replace(/([\u4e00-\u9fff]+)/g, '<tspan class="ch7f-cjk">$1</tspan>')
      .replace(/_([0-9A-Za-z])/g, '<tspan class="ch7f-sub" dy="4">$1</tspan><tspan dy="-4">\u200b</tspan>');
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" class="ch7f-math ${cls}">${body}</text>`;
  }

  /*
   * §1: a translation τ(α)=α+β₀ breaks additivity by exactly β₀. Two panels on the same grid:
   * add first, then translate (one β₀); translate first, then add (two β₀). Same α, β, β₀ in both.
   */
  function translationGap() {
    const s = 56;
    const O = [30, 176];
    const P = ([x, y]) => [O[0] + x * s, O[1] - y * s];
    const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
    const al = [2, 0.5];
    const be = [0.75, 1.75];
    const b0 = [0.75, -0.75];
    const ab = add(al, be);
    const tab = add(ab, b0);
    const ta = add(al, b0);
    const tb = add(be, b0);
    const sum = add(ta, tb);
    const A = (p, q, cls, head = 9, trim) => arrow(...P(p), ...P(q), cls, head, trim);
    const L = (p, q, cls) => `<line x1="${P(p)[0]}" y1="${P(p)[1]}" x2="${P(q)[0]}" y2="${P(q)[1]}" class="ch7f-stroke ${cls}"/>`;
    const dot = (p, cls, r = 4) => `<circle cx="${P(p)[0]}" cy="${P(p)[1]}" r="${r}" class="ch7f-dot ${cls}"/>`;
    const T = (p, text, cls, dx, dy, anchor) => mathText(P(p)[0] + dx, P(p)[1] + dy, text, cls, anchor);
    let grid = "";
    for (let i = 0; i <= 5; i += 1) grid += `<line x1="${P([i, 0])[0]}" y1="${P([0, 2.7])[1]}" x2="${P([i, 0])[0]}" y2="${P([0, -0.55])[1]}" class="ch7f-grid"/>`;
    for (let j = 0; j <= 2; j += 1) grid += `<line x1="${P([-0.3, j])[0]}" y1="${P([0, j])[1]}" x2="${P([5.4, j])[0]}" y2="${P([0, j])[1]}" class="ch7f-grid"/>`;
    grid += `<line x1="${P([-0.3, 0])[0]}" y1="${O[1]}" x2="${P([5.4, 0])[0]}" y2="${O[1]}" class="ch7f-axis"/><line x1="${O[0]}" y1="${P([0, 2.7])[1]}" x2="${O[0]}" y2="${P([0, -0.55])[1]}" class="ch7f-axis"/>`;
    const svg = (label, body) => `<svg class="ch7f-svg" viewBox="0 16 340 199" role="img" aria-label="${label}">${grid}${body}</svg>`;
    const left = svg("先相加再平移：α+β 平移一次 β₀，得到 τ(α+β)", `
      ${L(al, ab, "is-muted is-dash")}${L(be, ab, "is-muted is-dash")}
      ${A([0, 0], al, "is-muted is-thin")}${A([0, 0], be, "is-muted is-thin")}
      ${A([0, 0], ab, "is-text is-mid")}
      ${A(ab, tab, "is-gold", 9, [0, 5])}
      ${dot(tab, "is-accent")}
      ${T(al, "α", "is-muted", 4, 16)}${T(be, "β", "is-muted", -14, 4)}
      ${T(ab, "α+β", "is-text", -8, -6, "end")}
      ${T([(ab[0] + tab[0]) / 2, (ab[1] + tab[1]) / 2], "β_0", "is-gold", 8, -2)}
      ${T(tab, "τ(α+β)", "is-accent", 9, 5)}
    `);
    const right = svg("先平移再相加：α、β 各平移一次 β₀，相加后得到 τ(α)+τ(β)，比 τ(α+β) 多一个 β₀", `
      ${A([0, 0], al, "is-muted is-faint is-thin")}${A([0, 0], be, "is-muted is-faint is-thin")}
      ${A(al, ta, "is-gold is-thin", 8)}${A(be, tb, "is-gold is-thin", 8)}
      ${L(ta, sum, "is-coral is-dash")}${L(tb, sum, "is-coral is-dash")}
      ${A([0, 0], ta, "is-coral")}${A([0, 0], tb, "is-coral")}
      ${A(tab, sum, "is-gold is-strong", 10, [5, 5])}
      ${dot(tab, "is-accent is-hollow")}${dot(sum, "is-coral")}
      ${T(ta, "τ(α)", "is-coral", 6, 16)}${T(tb, "τ(β)", "is-coral", -8, -9, "end")}
      ${T(tab, "τ(α+β)", "is-accent", -6, -9, "end")}
      ${T(sum, "τ(α)+τ(β)", "is-coral", 20, 25, "middle")}
      ${mathText(P([(tab[0] + sum[0]) / 2, (tab[1] + sum[1]) / 2])[0] + 10, P([(tab[0] + sum[0]) / 2, (tab[1] + sum[1]) / 2])[1] - 6, "差 β_0", "is-gold is-strong")}
    `);
    return `<div class="ch7f-pair">
      <div class="ch7f-panel"><p class="ch7f-cap">先相加，再平移</p>${left}</div>
      <div class="ch7f-panel"><p class="ch7f-cap">先平移，再相加</p>${right}</div>
    </div>`;
  }

  /* §8: J(λ,3)⊕J(λ,1) drawn as two chains pushed by σ−λE. */
  function jordanChain() {
    const box = (x, y, w, label, cls = "") => `<rect x="${x}" y="${y - 17}" width="${w}" height="34" rx="9" class="ch7f-box ${cls}"/><text x="${x + w / 2}" y="${y + 5}" text-anchor="middle" class="ch7f-text ${cls}">${label}</text>`;
    const link = (x1, x2, y, label) => `${arrow(x1 + 4, y, x2 - 4, y, "is-text", 8)}${label ? `<text x="${(x1 + x2) / 2}" y="${y - 24}" text-anchor="middle" class="ch7f-small">${label}</text>` : ""}`;
    const r1 = 56;
    const r2 = 150;
    return `<svg class="ch7f-svg" viewBox="0 0 440 200" role="img" aria-label="若尔当形 J(λ,3)⊕J(λ,1) 对应的两条链">
      <text x="6" y="${r1 + 5}" class="ch7f-small">J(λ,3)</text>
      ${box(66, r1, 46, "ε₁", "is-accent")}${link(112, 168, r1, "σ−λE")}
      ${box(168, r1, 46, "ε₂", "is-accent")}${link(214, 270, r1, "σ−λE")}
      ${box(270, r1, 46, "ε₃", "is-gold")}${link(316, 372, r1, "σ−λE")}
      <text x="384" y="${r1 + 5}" class="ch7f-text">0</text>
      <text x="6" y="${r2 + 5}" class="ch7f-small">J(λ,1)</text>
      ${box(270, r2, 46, "ε₄", "is-gold")}${link(316, 372, r2, "σ−λE")}
      <text x="384" y="${r2 + 5}" class="ch7f-text">0</text>
      <text x="293" y="${(r1 + r2) / 2 + 5}" text-anchor="middle" class="ch7f-small is-gold">链尾：特征向量</text>
      <text x="66" y="${r2 + 5}" class="ch7f-small">两条链 · 两个块</text>
    </svg>`;
  }

  window.Ch7Figures = Object.freeze({
    "translation-gap": translationGap,
    "jordan-chain": jordanChain,
  });

  if (K) ["linear-map-definition", "linear-map-operations", "jordan-form-introduction"].forEach((id) => K.register(id, null));
})();


;/* visuals/ch7/labs-2d.js */
/*
 * Chapter 7 labs in the plane (plus the 3D eigen-plane view of §4):
 *   §3 matrix-of-linear-map   — the same σ recorded in two bases, B = X⁻¹AX
 *   §4 eigenvalues-eigenvectors — direction sweep in ℝ², eigen-plane in ℝ³
 *   §5 diagonal-matrices      — iterating x_{k+1} = A x_k, split into eigen-components
 * Every decision (diagonal or not, collinear or not, on an eigen-line or not)
 * is made with exact rationals; floats are only used for drawing.
 */
(() => {
  const K = window.Ch7Kit;
  if (!K) return;
  const { tex, texD, F, num, lf, el } = K;
  const M = () => window.Ch3Math;

  const fmt = (x, d = 2) => {
    const r = Math.round(x * 10 ** d) / 10 ** d;
    return Object.is(r, -0) || Math.abs(r) < 10 ** -(d + 1) ? "0" : String(r);
  };
  const vecText = (v, d = 2) => `(${v.map((x) => fmt(x, d)).join(", ")})`;
  /*
   * An exact fraction while it stays readable (denominator at most 999), otherwise
   * ≈ with three digits: powers like (4/5)⁴ = 256/625 are exact, (4/5)¹⁰ is not shown so.
   */
  const nice = (x) => {
    const f = M().fromNumber(x, 999);
    if (Math.abs(f.n / f.d - x) < 1e-9 && Math.abs(f.n) < 1e5) return tex(lf(f));
    return `≈${fmt(x, 3)}`;
  };
  const vecNice = (v) => `(${v.map(nice).join(", ")})`;
  const matNum = (A) => A.map((r) => r.map(num));
  /* Matrices with fractions: full-size \dfrac and a little more row space, so rows do not touch. */
  const roomy = (t) => (t.includes("\\frac") ? t.replace(/\\frac/g, "\\dfrac").replace(/\\\\(?!\[)/g, "\\\\[10pt]") : t);
  const apply2 = (A, v) => [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];

  /* ================= §3 线性变换的矩阵 ================= */

  const BASIS_PRESETS = {
    stretch: {
      label: "两个伸缩方向",
      A: [[2, 1], [0, 3]],
      eigen: [[1, 0], [1, 1]],
      note: `${tex("\\sigma")} 把直线 ${tex("L((1,0))")} 上的向量乘 2，把直线 ${tex("L((1,1))")} 上的向量乘 3。`,
    },
    project: {
      label: `投影到直线 ${tex("x_1+x_2=0")}`,
      A: [["1/2", "-1/2"], ["-1/2", "1/2"]],
      eigen: [[1, -1], [1, 1]],
      note: `${tex("\\sigma")} 保持直线 ${tex("L((1,-1))")} 上的向量，把直线 ${tex("L((1,1))")} 压成 ${tex("0")}。`,
    },
    shear: {
      label: "剪切",
      A: [[1, 1], [0, 1]],
      eigen: [[1, 0]],
      note: `${tex("\\sigma")} 只保持 ${tex("x_1")} 轴这一条直线。`,
    },
  };

  function basisLab(root) {
    const lab = K.labShell(root, {
      title: `同一个 ${tex("\\sigma")}，换一组基记录`,
      task: `左图用标准基 ${tex("\\varepsilon_1,\\varepsilon_2")} 记录 ${tex("\\sigma")}，右图用你拖动的 ${tex("\\eta_1,\\eta_2")} 记录同一个 ${tex("\\sigma")}。紫色箭头是基向量的像，它在网格里的坐标就是矩阵的一列。`,
    });
    const state = { key: "stretch", eta: [[1, 0.5], [-0.5, 1]] };
    const toolbar = el("div", "ch7l-toolbar");
    const gateHost = el("div");
    const pair = el("div", "ch7l-pair");
    const left = el("div", "ch7l-view", `<div class="ch7l-view-title">标准基 ${tex("\\varepsilon_1,\\varepsilon_2")}：矩阵 ${tex("A")}</div>`);
    const right = el("div", "ch7l-view", `<div class="ch7l-view-title">新基 ${tex("\\eta_1,\\eta_2")}：矩阵 ${tex("B")}</div>`);
    pair.append(left, right);
    const strip = el("div", "ch7l-strip");
    const result = el("div", "ch7l-result");
    lab.append(toolbar, gateHost, pair, strip, result);
    const L = K.plane2d(left, { extent: 3.2, hint: "", label: "标准网格中的 σ", spreadLabels: true });
    const R = K.plane2d(right, { extent: 3.2, hint: "拖动 η₁、η₂（每次半格）", label: "新基网格中的 σ", spreadLabels: true });
    let flow = null;

    /* Both views share one scale, wide enough for every image arrow; refit when a drag ends. */
    function fitExtent() {
      const An = matNum(K.mat(preset().A));
      const pts = [...state.eta, ...state.eta.map((e) => apply2(An, e)), [An[0][0], An[1][0]], [An[0][1], An[1][1]]];
      const need = Math.max(...pts.flat().map(Math.abs));
      const ext = Math.min(6, Math.max(3.2, need * 1.12 + 0.3));
      L.setExtent(ext);
      R.setExtent(ext);
    }

    const preset = () => BASIS_PRESETS[state.key];

    function compute() {
      const A = K.mat(preset().A);
      const X = [[F(state.eta[0][0]), F(state.eta[1][0])], [F(state.eta[0][1]), F(state.eta[1][1])]];
      const Xi = K.inv(X);
      const B = Xi ? K.mul(Xi, K.mul(A, X)) : null;
      return { A, X, B };
    }

    /* ηⱼ is an eigenvector exactly when ση_j ∥ ηⱼ, i.e. det(ηⱼ, Aηⱼ) = 0 (exact). */
    function onFixedLine(A, j) {
      const v = [F(state.eta[j][0]), F(state.eta[j][1])];
      const w = K.matVec(A, v);
      return M().isZero(M().sub(M().mul(v[0], w[1]), M().mul(v[1], w[0])));
    }

    function drawEigen(d) {
      if (!flow?.revealed) return;
      const A = K.mat(preset().A);
      const hit = [0, 1].filter((j) => onFixedLine(A, j)).map((j) => state.eta[j]);
      preset().eigen.forEach((v) => {
        const lit = hit.some((e) => Math.abs(e[0] * v[1] - e[1] * v[0]) < 1e-9);
        if (lit) d.line([0, 0], v, "subspace", { width: 8, alpha: d.pal.dark ? 0.2 : 0.16 });
        d.line([0, 0], v, "subspace", { width: lit ? 1.8 : 1.4, dash: [5, 5], alpha: 0.9 });
      });
    }

    /* After the reveal, η is pulled onto a fixed line when dragged close to it. */
    function magnet(p) {
      const grid = p.map((x) => Math.round(x * 2) / 2);
      if (!flow?.revealed) return grid;
      let best = null;
      preset().eigen.forEach((v) => {
        const vv = v[0] * v[0] + v[1] * v[1];
        const t = Math.round(((p[0] * v[0] + p[1] * v[1]) / vv) * 2) / 2;
        const q = [t * v[0], t * v[1]];
        const dist = Math.hypot(p[0] - q[0], p[1] - q[1]);
        if (t !== 0 && dist < 0.32 && (!best || dist < best.dist)) best = { q, dist };
      });
      return best ? best.q : grid;
    }

    function redraw() {
      const { A, X, B } = compute();
      const An = matNum(A);
      const [e1, e2] = state.eta;
      L.setDraw((d) => {
        d.grid(undefined, { alpha: 0.7 });
        d.axes();
        drawEigen(d);
        d.arrow([0, 0], e1, "v1", { width: 1.4, alpha: 0.35, dash: [4, 4] });
        d.arrow([0, 0], e2, "v2", { width: 1.4, alpha: 0.35, dash: [4, 4] });
        d.arrow([0, 0], [1, 0], "v1", { width: 2.4, label: "ε₁" });
        d.arrow([0, 0], [0, 1], "v2", { width: 2.4, label: "ε₂" });
        d.arrow([0, 0], [An[0][0], An[1][0]], "image", { width: 2.6, label: "σε₁" });
        d.arrow([0, 0], [An[0][1], An[1][1]], "image", { width: 2.6, label: "σε₂", ldy: 4 });
      });
      R.setDraw((d) => {
        if (B) d.grid(state.eta, { color: "subspace", alpha: 0.28 });
        d.axes(null);
        drawEigen(d);
        if (B) {
          const Bn = matNum(B);
          [0, 1].forEach((j) => {
            const img = apply2(An, state.eta[j]);
            const c1 = Bn[0][j];
            const corner = [c1 * e1[0], c1 * e1[1]];
            d.segment([0, 0], corner, "image", { width: 1.2, dash: [3, 4], alpha: 0.7 });
            d.segment(corner, img, "image", { width: 1.2, dash: [3, 4], alpha: 0.7 });
          });
        }
        if (flow?.revealed)
          [0, 1].forEach((j) => {
            if (onFixedLine(A, j)) d.segment([0, 0], state.eta[j], j ? "v2" : "v1", { width: 9, alpha: d.pal.dark ? 0.2 : 0.16 });
          });
        d.arrow([0, 0], e1, "v1", { width: 2.8, label: "η₁" });
        d.arrow([0, 0], e2, "v2", { width: 2.8, label: "η₂" });
        d.arrow([0, 0], apply2(An, e1), "image", { width: 2.6, label: "ση₁" });
        d.arrow([0, 0], apply2(An, e2), "image", { width: 2.6, label: "ση₂", ldy: 4 });
      });
      const tr = M().add(A[0][0], A[1][1]);
      // after the reveal, an off-diagonal 0 caused by ηⱼ lying on a fixed line is highlighted
      const lit = flow?.revealed ? [0, 1].map((j) => onFixedLine(A, j)) : [false, false];
      const bTex = B
        ? `\\begin{bmatrix}${lf(B[0][0])}&${lit[1] ? K.hlTex(lf(B[0][1])) : lf(B[0][1])}\\\\${lit[0] ? K.hlTex(lf(B[1][0])) : lf(B[1][0])}&${lf(B[1][1])}\\end{bmatrix}`
        : "";
      const coord = (j) => {
        const a = B[0][j];
        const b = B[1][j];
        const term = (c, name) => (M().isZero(c) ? "" : `${M().eq(c, F(1)) ? "" : M().eq(c, F(-1)) ? "-" : lf(c)}${name}`);
        const parts = [term(a, "\\eta_1"), term(b, "\\eta_2")].filter(Boolean);
        return `\\sigma\\eta_${j + 1}=${parts.join("+").replace(/\+-/g, "-") || "0"}`;
      };
      let html = `<div class="ch7l-matrix-row">
        <div>${texD(`A=${roomy(K.latexMatrix(A))}`)}</div>
        <div>${texD(`X=(\\eta_1,\\eta_2)=${roomy(K.latexMatrix(X))}`)}</div>
        <div>${B ? K.hlHtml(texD(`B=X^{-1}AX=${roomy(bTex)}`)) : texD("B=\\ ?")}</div></div>`;
      if (B) html += `<p>${tex(coord(0))}，${tex(coord(1))}</p>`;
      if (!B) {
        html += `<p class="ch7l-bad">${tex("\\eta_1,\\eta_2")} 共线，不构成基，${tex("B")} 无从谈起。</p>`;
      } else {
        const trB = M().add(B[0][0], B[1][1]);
        html += `<p>${tex(`\\operatorname{tr}A=${lf(tr)}`)}，${tex(`\\operatorname{tr}B=${lf(trB)}`)}；${tex(`|A|=${lf(K.det(A))}`)}，<span class="la-keep">${tex(`|B|=${lf(K.det(B))}`)}。</span></p>`;
        const named = [tex("\\eta_1"), tex("\\eta_2")].filter((_, j) => lit[j]);
        html += flow?.revealed && K.isDiagonal(B)
          ? `<p class="ch7l-ok">${tex("B")} 是对角矩阵：每个 ${tex("\\sigma\\eta_j")} 都是 ${tex("\\eta_j")} 的倍数。</p>`
          : flow?.revealed && named.length
            ? `<p class="ch7l-muted">${named.join("、")} 在 ${tex("\\sigma")} 的不动直线上，${tex("B")} 中对应的非对角元为 ${tex("0")}。</p>`
            : `<p class="ch7l-muted">${tex("B")} 的第 ${tex("j")} 列 ${tex("=\\sigma\\eta_j")} 在 ${tex("\\eta_1,\\eta_2")} 下的坐标（右图虚线）。</p>`;
      }
      strip.innerHTML = html;
    }

    const handle = (i, color) => ({
      color,
      limit: 2.5,
      get: () => state.eta[i],
      set: (raw) => {
        const p = magnet(raw);
        if (Math.abs(p[0]) + Math.abs(p[1]) < 1e-9) return;
        state.eta[i] = p;
        redraw();
      },
      end: () => {
        fitExtent();
        flow?.acted();
      },
    });
    R.setHandles([handle(0, "drag"), handle(1, "drag")]);

    function newFlow() {
      flow = K.predictFlow(gateHost, result, {
        question: `拖动 ${tex("\\eta_1,\\eta_2")}。什么时候 ${tex("B=X^{-1}AX")} 会成为对角矩阵？`,
        options: [
          { text: `${tex("\\eta_1")}、${tex("\\eta_2")} 分别落在 ${tex("\\sigma")} 保持的两条直线上`, correct: true },
          { text: `${tex("\\eta_1")}、${tex("\\eta_2")} 互相垂直且等长`, why: "试试“两个伸缩方向”：垂直的 η 一般得不到对角的 B。" },
          { text: `只有 ${tex("\\eta")} 等于 ${tex("\\varepsilon")} 时`, why: "η=ε 时 B=A，A 本身不一定是对角的。" },
          { text: "永远不会，换基不改变矩阵", why: "换基不改变 σ，矩阵却会变。" },
        ],
        conclusion: `${tex("B")} 的第 ${tex("j")} 列是 ${tex("\\sigma\\eta_j")} 在新基下的坐标。${tex("B")} 是对角矩阵，当且仅当 ${tex("\\sigma\\eta_j=\\lambda_j\\eta_j")}，即每个 ${tex("\\eta_j")} 都在 ${tex("\\sigma")} 保持的直线上（图中绿色虚线，把 ${tex("\\eta")} 拖近它会吸附上去）。无论怎样换基，迹与行列式都不变，因为 ${tex("B")} 与 ${tex("A")} 相似。${preset().note}${state.key === "shear" ? `剪切只有一条这样的直线，${tex("B")} 最多化成三角形。` : ""}`,
        onReveal: redraw,
      });
    }

    K.chips(toolbar, Object.entries(BASIS_PRESETS).map(([k, v]) => [k, v.label]), (k) => {
      state.key = k;
      newFlow();
      redraw();
      fitExtent();
    }, state.key);
    newFlow();
    redraw();
    fitExtent();
    return () => {
      L.destroy();
      R.destroy();
    };
  }

  /* ================= §4 特征值与特征向量 ================= */

  /* Exact eigen-directions at integer angles, verified at load with rationals. */
  const SWEEP_PRESETS = {
    sym: {
      label: "对称拉伸",
      A: [[2, 1], [1, 2]],
      eigen: [{ angle: 45, v: [1, 1] }, { angle: 135, v: [-1, 1] }],
      predict: {
        question: `把 ${tex("v")} 从 0° 转到 180°，${tex("v")} 与 ${tex("Av")} 共线会出现几次？`,
        options: [
          { text: "2 次", correct: true },
          { text: "1 次", why: "转到 135° 附近再看一看。" },
          { text: "4 次", why: "θ 与 θ+180° 是同一条直线，0°–180° 已经走遍所有直线。" },
          { text: "0 次", why: "转到 45° 看 v 和 Av。" },
        ],
        conclusion: `45° 与 135° 两条直线被保持，${tex("\\lambda")} 分别是 ${tex("3")} 和 ${tex("1")}。对称矩阵的两条特征直线互相垂直。`,
      },
    },
    upper: {
      label: "非对称",
      A: [[1, 1], [0, 2]],
      eigen: [{ angle: 0, v: [1, 0] }, { angle: 45, v: [1, 1] }],
      predict: {
        question: `${tex("A=\\begin{pmatrix}1&1\\\\0&2\\end{pmatrix}")} 的两条特征直线互相垂直吗？`,
        options: [
          { text: "不垂直，夹角 45°", correct: true },
          { text: "垂直", why: "转到 0° 和 45° 各看一次。" },
          { text: "只有一条特征直线", why: "这里有两个不同的特征值 1 和 2。" },
          { text: "没有特征直线", why: "转到 0°：Av=v。" },
        ],
        conclusion: `0° 方向 ${tex("\\lambda=1")}，45° 方向 ${tex("\\lambda=2")}。特征直线只需线性无关，不必垂直。`,
      },
    },
    shear: {
      label: "剪切",
      A: [[1, 1], [0, 1]],
      eigen: [{ angle: 0, v: [1, 0] }],
      predict: {
        question: `剪切 ${tex("\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}")} 有几条特征直线？`,
        options: [
          { text: "1 条", correct: true },
          { text: "2 条", why: "特征值 1 是二重根，但 (E−A)x=0 的解只有一维。" },
          { text: "0 条", why: "转到 0° 看看。" },
          { text: "无穷多条", why: "除了 0°，其余方向都被推歪了。" },
        ],
        conclusion: `只有 ${tex("x_1")} 轴被保持（${tex("\\lambda=1")}）。二重特征值只给出一条特征直线，所以凑不出两个线性无关的特征向量。`,
      },
    },
    project: {
      label: "投影",
      A: [[1, 0], [0, 0]],
      eigen: [{ angle: 0, v: [1, 0] }, { angle: 90, v: [0, 1] }],
      predict: {
        question: `投影到 ${tex("x_1")} 轴时，${tex("x_2")} 轴上的 ${tex("v")} 满足 ${tex("Av=0")}。${tex("x_2")} 轴算特征直线吗？`,
        options: [
          { text: `算，对应 ${tex("\\lambda=0")}`, correct: true },
          { text: `不算，${tex("Av=0")} 不能叫伸缩`, why: "Av=0·v 正是 λ=0 的情形，v 本身非零即可。" },
          { text: "不算，零向量不是特征向量", why: "v 不是零向量；被送到零的是 Av。" },
          { text: `只有 ${tex("x_1")} 轴才算`, why: "转到 90° 看 Av。" },
        ],
        conclusion: `${tex("x_1")} 轴上 ${tex("\\lambda=1")}，${tex("x_2")} 轴上 ${tex("\\lambda=0")}。特征值可以是 ${tex("0")}，此时特征子空间就是核。`,
      },
    },
    rotate: {
      label: "旋转 90°",
      A: [[0, -1], [1, 0]],
      eigen: [],
      predict: {
        question: "旋转 90° 有没有实的特征直线？",
        options: [
          { text: "没有", correct: true },
          { text: "有一条", why: "转一整圈，Av 始终与 v 垂直。" },
          { text: "每条直线都是", why: "旋转把每条直线都转走了。" },
          { text: `取决于 ${tex("v")} 的长度`, why: "是否共线与长度无关。" },
        ],
        conclusion: `${tex("|\\lambda E-A|=\\lambda^2+1")} 在实数域上没有根。复数域上特征值是 ${tex("\\pm i")}，但复特征向量不能画在实平面上。`,
      },
    },
  };

  Object.values(SWEEP_PRESETS).forEach((p) => {
    const A = K.mat(p.A);
    p.eigen.forEach((e) => {
      const v = K.vec(e.v);
      const Av = K.matVec(A, v);
      const k = v.findIndex((x) => !M().isZero(x));
      e.lambda = M().div(Av[k], v[k]);
      const ok = Av.every((x, i) => M().eq(x, M().mul(e.lambda, v[i])));
      if (!ok) console.warn("Chapter 7 sweep preset has a wrong eigen-direction", p.label);
    });
  });

  const SPACE_A = [[1, 2, 2], [2, 1, 2], [2, 2, 1]];

  function eigenLab(root) {
    const lab = K.labShell(root, {
      title: "哪些方向只被伸缩",
      task: `紫色曲线是单位圆上所有方向经过 ${tex("A")} 以后的终点。转动金色的 ${tex("v")}，看 ${tex("Av")} 何时与 ${tex("v")} 落在同一条直线上。`,
    });
    const modeBar = el("div", "ch7l-toolbar ch7l-modes");
    lab.append(modeBar);
    const host = el("div", "ch7l-modehost");
    lab.append(host);
    let cleanup = null;

    function mount(mode) {
      cleanup?.();
      host.innerHTML = "";
      cleanup = mode === "space" ? spaceMode(host, lab) : planeMode(host, lab);
    }
    K.chips(modeBar, [["plane", "平面：转动方向"], ["space", "空间：二维特征子空间"]], mount, "plane");
    mount("plane");
    return () => cleanup?.();
  }

  function planeMode(host, lab) {
    lab.querySelector(".ch7l-head p").innerHTML = `紫色曲线是单位圆上所有方向经过 ${tex("A")} 以后的终点。转动金色的 ${tex("v")}，看 ${tex("Av")} 何时与 ${tex("v")} 落在同一条直线上。`;
    const state = { key: "sym", theta: 20 };
    const toolbar = el("div", "ch7l-toolbar");
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    body.append(stage, side);
    host.append(toolbar, body);
    const plane = K.plane2d(stage, { extent: 3, hint: "拖动 v 的端点，或用下方滑杆", label: "方向 v 与它的像 Av" });
    const control = el("div", "ch7l-card");
    control.innerHTML = `<div class="ch7l-actions"><button type="button" class="ch7l-btn is-primary" data-sweep>从 0° 转到 180°</button></div><label class="ch7l-range"><span>${tex("\\theta")}</span><input type="range" min="0" max="359" step="1" value="${state.theta}" data-theta aria-label="方向角" /><b data-theta-v>${state.theta}°</b></label>`;
    const info = el("div", "ch7l-card");
    const gateHost = el("div");
    const result = el("div", "ch7l-result");
    side.append(gateHost, control, info, result);
    let flow = null;
    const preset = () => SWEEP_PRESETS[state.key];

    /*
     * Angle strip: the signed angle ψ(θ) from the line of v to Av, folded into
     * (−90°, 90°]. The trace records the directions the student has swept
     * (only after predicting); ψ = 0 marks an eigen-line, shown after reveal.
     */
    const strip = el("figure", "ch7l-anglestrip");
    stage.append(strip);
    const visited = new Map();
    let lastSwept = null;
    let sweepRaf = 0;
    // the strip is drawn at its on-screen width so tick labels keep their size on phones
    let SW = 520;
    const SH = 112;
    const pad = { l: 40, r: 12, t: 12, b: 22 };
    const sx = (t) => pad.l + (t / 180) * (SW - pad.l - pad.r);
    const sy = (p) => pad.t + ((90 - p) / 180) * (SH - pad.t - pad.b);

    function psiAt(A, deg) {
      const t = (deg * Math.PI) / 180;
      const v = [Math.cos(t), Math.sin(t)];
      const Av = apply2(A, v);
      if (Math.hypot(Av[0], Av[1]) < 1e-12) return null;
      let p = (Math.atan2(v[0] * Av[1] - v[1] * Av[0], v[0] * Av[0] + v[1] * Av[1]) * 180) / Math.PI;
      if (p > 90) p -= 180;
      if (p <= -90) p += 180;
      return p;
    }

    function drawStrip(A) {
      const P = preset();
      SW = Math.max(280, Math.min(640, (strip.clientWidth || 536) - 16));
      const parts = [];
      [-90, 0, 90].forEach((p) => {
        parts.push(`<line x1="${pad.l}" y1="${sy(p)}" x2="${SW - pad.r}" y2="${sy(p)}" class="${p === 0 ? "ch7s-zero" : "ch7s-grid"}"/>`);
        parts.push(`<text x="${pad.l - 6}" y="${sy(p) + 4}" class="ch7s-tick" text-anchor="end">${p === -90 ? "−90°" : `${p}°`}</text>`);
      });
      [0, 45, 90, 135, 180].forEach((t) => {
        parts.push(`<line x1="${sx(t)}" y1="${pad.t}" x2="${sx(t)}" y2="${SH - pad.b}" class="ch7s-grid"/>`);
        parts.push(`<text x="${sx(t)}" y="${SH - 6}" class="ch7s-tick" text-anchor="middle">${t}°</text>`);
      });
      if (flow?.revealed) {
        P.eigen.forEach((e) => {
          (e.angle === 0 ? [0, 180] : [e.angle]).forEach((t) => {
            parts.push(`<line x1="${sx(t)}" y1="${pad.t}" x2="${sx(t)}" y2="${SH - pad.b}" class="ch7s-eigen"/>`);
            parts.push(`<circle cx="${sx(t)}" cy="${sy(0)}" r="4" class="ch7s-eigen-dot"/>`);
            parts.push(`<text x="${sx(t) + (t === 180 ? -5 : 5)}" y="${pad.t + 10}" class="ch7s-eigen-label" text-anchor="${t === 180 ? "end" : "start"}">λ=${String(e.lambda.n).replace("-", "−")}${e.lambda.d === 1 ? "" : `/${e.lambda.d}`}</text>`);
          });
        });
      }
      // trace of swept directions, broken at gaps and at the ±90° fold
      const degs = [...visited.keys()].sort((a, b) => a - b);
      let d = "";
      let prev = null;
      degs.forEach((t) => {
        const p = visited.get(t);
        if (p == null) {
          prev = null;
          return;
        }
        const jump = !prev || t - prev.t > 1 || Math.abs(p - prev.p) > 90;
        d += `${jump ? "M" : "L"}${sx(t).toFixed(1)} ${sy(p).toFixed(1)}`;
        prev = { t, p };
      });
      if (d) parts.push(`<path d="${d}" class="ch7s-trace"/>`);
      const now = state.theta % 180;
      const pNow = psiAt(A, now);
      if (pNow != null) parts.push(`<circle cx="${sx(now)}" cy="${sy(pNow)}" r="4.5" class="ch7s-now"/>`);
      strip.innerHTML = `<svg viewBox="0 0 ${SW} ${SH}" role="img" aria-label="v 与 Av 的有向夹角随 θ 的变化">${parts.join("")}</svg><figcaption>${tex("v")} 到 ${tex("Av")} 的有向夹角（${tex("\\theta")} 从 0° 到 180°）${flow?.predicted ? "" : " · 猜过之后记录轨迹"}</figcaption>`;
    }

    function hit() {
      return preset().eigen.find((e) => e.angle === state.theta % 180) || null;
    }

    function redraw() {
      const P = preset();
      const A = P.A.map((r) => r.map((x) => num(F(x))));
      let smax = 0;
      const ring = [];
      for (let i = 0; i <= 120; i += 1) {
        const t = (i / 120) * Math.PI * 2;
        const img = apply2(A, [Math.cos(t), Math.sin(t)]);
        smax = Math.max(smax, Math.hypot(img[0], img[1]));
        ring.push(img);
      }
      const r = Math.min(1.5, 2.55 / Math.max(smax, 1e-9));
      const th = (state.theta * Math.PI) / 180;
      const v = [r * Math.cos(th), r * Math.sin(th)];
      const Av = apply2(A, v);
      const h = hit();
      if (flow?.predicted) {
        const now = state.theta % 180;
        const last = lastSwept;
        // fill the degrees passed over since the last frame (shortest way round mod 180)
        let delta = last == null ? 0 : ((now - last + 270) % 180) - 90;
        if (Math.abs(delta) > 45) delta = 0;
        for (let k = 0; k <= Math.abs(delta); k += 1) {
          const t = (((now - Math.sign(delta) * k) % 180) + 180) % 180;
          visited.set(t, psiAt(A, t));
        }
        if (now === 0) visited.set(180, psiAt(A, 180));
        lastSwept = now;
      }
      drawStrip(A);
      plane.setDraw((d) => {
        d.grid(undefined, { alpha: 0.55 });
        d.axes();
        const circle = [];
        for (let i = 0; i <= 96; i += 1) {
          const t = (i / 96) * Math.PI * 2;
          circle.push([r * Math.cos(t), r * Math.sin(t)]);
        }
        d.polyline(circle, "axis", { dash: [4, 5], width: 1.2, alpha: 0.7 });
        d.polyline(ring.map(([x, y]) => [x * r, y * r]), "image", { close: true, fill: "image", fillAlpha: 0.06, width: 1.6, alpha: 0.75 });
        if (flow?.revealed) P.eigen.forEach((e) => d.line([0, 0], e.v, "subspace", { width: 1.4, dash: [6, 5] }));
        d.line([0, 0], v, h ? "subspace" : "drag", { width: h ? 2.2 : 1.2, alpha: h ? 0.8 : 0.55, dash: h ? undefined : [3, 5] });
        const avLen = Math.hypot(Av[0], Av[1]);
        if (!h && avLen > 1e-9) {
          const a0 = th;
          let a1 = Math.atan2(Av[1], Av[0]);
          while (a1 - a0 > Math.PI) a1 -= 2 * Math.PI;
          while (a1 - a0 < -Math.PI) a1 += 2 * Math.PI;
          d.arc(36, a0, a1, "image", { width: 2 });
        }
        // Highlight on a hit: the same colours with a glow underneath.
        if (h && avLen > 1e-9) d.segment([0, 0], Av, "image", { width: 7, alpha: 0.16 });
        d.arrow([0, 0], v, "drag", { label: "v" });
        if (avLen > 1e-9) d.arrow([0, 0], Av, "image", { label: "Av", width: 2.6, ldy: 4 });
        else d.point([0, 0], "image", { r: 5, label: "Av=0" });
      });
      control.querySelector("[data-theta-v]").textContent = `${state.theta}°`;
      control.querySelector("[data-theta]").value = String(state.theta);
      if (h) {
        info.innerHTML = `<h4>共线</h4><p>${tex(`Av=${lf(h.lambda)}\\,v`)}，${tex(`\\lambda=${lf(h.lambda)}`)}</p><p class="ch7l-muted">方向 ${tex(K.latexRow(K.vec(h.v)))} 上的每个非零向量都是特征向量。</p>`;
      } else {
        const avLen = Math.hypot(Av[0], Av[1]);
        const ang = avLen < 1e-9 ? 0 : (Math.acos(Math.max(-1, Math.min(1, (v[0] * Av[0] + v[1] * Av[1]) / (r * avLen)))) * 180) / Math.PI;
        const line = Math.min(ang, 180 - ang);
        info.innerHTML = `<h4>${tex("v")} 与 ${tex("Av")}</h4><p>${tex("Av")} 偏离 ${tex("v")} 所在直线 ${fmt(line, 1) === "0" ? "0" : `≈${fmt(line, 1)}`}°</p><p class="ch7l-muted">偏离为 0 时，${tex("Av=\\lambda v")}。</p>`;
      }
    }

    plane.setHandles([
      {
        color: "drag",
        get: () => {
          const P = preset();
          const A = P.A.map((rr) => rr.map((x) => num(F(x))));
          let smax = 0;
          for (let i = 0; i < 120; i += 1) {
            const t = (i / 120) * Math.PI * 2;
            const img = apply2(A, [Math.cos(t), Math.sin(t)]);
            smax = Math.max(smax, Math.hypot(img[0], img[1]));
          }
          const r = Math.min(1.5, 2.55 / Math.max(smax, 1e-9));
          const th = (state.theta * Math.PI) / 180;
          return [r * Math.cos(th), r * Math.sin(th)];
        },
        set: (p) => {
          if (Math.hypot(p[0], p[1]) < 0.15) return;
          state.theta = (Math.round((Math.atan2(p[1], p[0]) * 180) / Math.PI) + 360) % 360;
          redraw();
        },
        end: () => flow?.acted(),
      },
    ]);
    control.querySelector("[data-theta]").addEventListener("input", (e) => {
      state.theta = Number(e.target.value);
      redraw();
    });
    control.querySelector("[data-theta]").addEventListener("change", () => flow?.acted());
    control.querySelector("[data-sweep]").addEventListener("click", () => {
      cancelAnimationFrame(sweepRaf);
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      state.theta = 0;
      lastSwept = null;
      if (reduce) {
        for (let t = 0; t <= 180; t += 1) {
          state.theta = t;
          redraw();
        }
        flow?.acted();
        return;
      }
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(180, Math.round(((now - start) / 2400) * 180));
        state.theta = t;
        redraw();
        if (t < 180) sweepRaf = requestAnimationFrame(step);
        else flow?.acted();
      };
      sweepRaf = requestAnimationFrame(step);
    });

    function load(key) {
      cancelAnimationFrame(sweepRaf);
      state.key = key;
      state.theta = 20;
      visited.clear();
      lastSwept = null;
      flow = K.predictFlow(gateHost, result, {
        ...preset().predict,
        onReveal: redraw,
      });
      // picking a prediction starts the trace at the current direction
      flow.element.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", redraw));
      redraw();
    }
    K.chips(toolbar, Object.entries(SWEEP_PRESETS).map(([k, v]) => [k, v.label]), load, state.key);
    load("sym");
    return () => {
      cancelAnimationFrame(sweepRaf);
      plane.destroy();
    };
  }

  function spaceMode(host, lab) {
    lab.querySelector(".ch7l-head p").innerHTML = `${tex("A=\\begin{pmatrix}1&2&2\\\\2&1&2\\\\2&2&1\\end{pmatrix}")}。拖动 ${tex("v")} 改变方向（图中 ${tex("v")} 画成固定长度），看 ${tex("Av")} 何时与 ${tex("v")} 共线。`;
    const A = K.mat(SPACE_A);
    const An = matNum(A);
    const state = { u: [1, 0, 0.5] };
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    body.append(stage, side);
    host.append(body);
    const scene = window.LAScene3D.create(stage, { range: 2.6, label: "三维中的 v 与 Av", hint: "拖动空白处旋转 · 拖动圆点改变 v", yaw: -0.75, pitch: 0.38 });
    const tools = el("div", "ch7l-actions");
    tools.innerHTML = `<button type="button" class="ch7l-btn" data-plane>放进平面 ${tex("x_1+x_2+x_3=0")}</button><button type="button" class="ch7l-btn" data-line>放到 ${tex("(1,1,1)")} 方向</button><button type="button" class="ch7l-btn" data-look>沿 ${tex("(1,1,1)")} 看</button><button type="button" class="ch7l-btn" data-edge>侧看平面</button>`;
    const info = el("div", "ch7l-card");
    const gateHost = el("div");
    const result = el("div", "ch7l-result");
    side.append(gateHost, tools, info, result);
    let flow = null;
    const LEN = 0.85;

    const dir = () => {
      const l = Math.hypot(...state.u);
      return state.u.map((x) => (x / l) * LEN);
    };

    function status() {
      const u = K.vec(state.u);
      const Au = K.matVec(A, u);
      const parallel = K.isZeroVec(K.cross3(u, Au));
      let lambda = null;
      if (parallel) {
        const k = u.findIndex((x) => !M().isZero(x));
        lambda = M().div(Au[k], u[k]);
      }
      return { u, Au, parallel, lambda };
    }

    function redraw() {
      const s = status();
      const v = dir();
      const Av = [0, 1, 2].map((i) => An[i].reduce((acc, a, j) => acc + a * v[j], 0));
      scene.setObjects(() => {
        const objs = [];
        if (flow?.revealed) {
          objs.push({ type: "plane", n: [1, 1, 1], d: 0, color: "subspace", alpha: 0.12, label: "V₋₁" });
          objs.push({ type: "line", dir: [1, 1, 1], color: "subspace", width: 2.2, label: "V₅" });
        }
        objs.push({ type: "line", dir: v, color: "drag", width: 1.2, dash: [4, 5], alpha: s.parallel ? 0.9 : 0.5 });
        objs.push({ type: "arrow", to: v, color: "drag", label: "v" });
        // Highlight when collinear: the same colour with a glow underneath.
        if (s.parallel) objs.push({ type: "segment", a: [0, 0, 0], b: Av, color: "image", width: 7, alpha: 0.16 });
        objs.push({ type: "arrow", to: Av, color: "image", width: 2.6, label: "Av" });
        return objs;
      });
      info.innerHTML = `<h4>读数</h4><p>${tex("v")} 的方向 ${tex(K.latexRow(s.u))}，${tex(`Av\\ \\text{的方向}\\ ${K.latexRow(s.Au)}`)}</p>${
        s.parallel
          ? `<p class="ch7l-ok">共线：${tex(`Av=${lf(s.lambda)}\\,v`)}</p>`
          : `<p class="ch7l-muted">不共线：${tex("Av")} 离开了 ${tex("v")} 所在的直线。</p>`
      }`;
    }

    scene.setHandles([
      {
        color: "drag",
        get: dir,
        set: (p) => {
          const q = p.map((x) => Math.round(x * 2) / 2);
          if (q.every((x) => x === 0)) return;
          state.u = q;
          redraw();
        },
        end: () => flow?.acted(),
      },
    ]);
    tools.querySelector("[data-plane]").addEventListener("click", () => {
      // subtract the mean: exact, stays on the half grid after doubling if needed
      const u = K.vec(state.u);
      const mean = M().div(u.reduce((a, b) => M().add(a, b), F(0)), F(3));
      let w = u.map((x) => M().sub(x, mean));
      if (K.isZeroVec(w)) w = K.vec([1, -1, 0]);
      state.u = w.map(num);
      redraw();
      flow?.acted();
    });
    tools.querySelector("[data-line]").addEventListener("click", () => {
      state.u = [1, 1, 1];
      redraw();
      flow?.acted();
    });
    tools.querySelector("[data-look]").addEventListener("click", () => scene.lookAlong([1, 1, 1]));
    tools.querySelector("[data-edge]").addEventListener("click", () => scene.lookAlong([1, -1, 0]));

    flow = K.predictFlow(gateHost, result, {
      question: `${tex("A")} 保持多少条过原点的直线（直线上的 ${tex("v")} 满足 ${tex("Av")} 与 ${tex("v")} 共线）？`,
      options: [
        { text: "无穷多条", correct: true },
        { text: "恰好 3 条", why: "三阶矩阵最多三个特征值，可一个特征值可以对应一整个平面。" },
        { text: "1 条", why: "先点“放进平面”，看 Av 与 v 的关系。" },
        { text: "没有", why: "点“放到 (1,1,1) 方向”。" },
      ],
      conclusion: `${tex("\\lambda=5")} 只给出直线 ${tex("V_5=L((1,1,1)^T)")}；${tex("\\lambda=-1")} 是二重根，${tex("(-E-A)x=0")} 只有一个独立方程 ${tex("x_1+x_2+x_3=0")}，${tex("V_{-1}")} 是一整个平面，平面里每条直线都被保持（${tex("v")} 被反向）。点“沿 ${tex("(1,1,1)")} 看”：平面正对着你，${tex("V_5")} 缩成一点。`,
      onReveal: redraw,
    });
    redraw();
    return () => scene.destroy();
  }

  /* ================= §5 对角矩阵：迭代 ================= */

  const ITER_PRESETS = {
    attract: {
      label: "吸引",
      A: [["1/2", "3/10"], [0, "4/5"]],
      vecs: [[1, 0], [1, 1]],
      lambdas: ["1/2", "4/5"],
      // x₀ = 2η₁ + η₂ starts away from the η₂ line, so the path visibly bends onto it
      x0: [3, 1],
      extent: 3.2,
      predict: {
        question: "点会趋向原点。最后几步，它贴着哪条特征直线进来？",
        options: [
          { text: `${tex("\\eta_2")} 方向（${tex("\\lambda=4/5")}）`, correct: true },
          { text: `${tex("\\eta_1")} 方向（${tex("\\lambda=1/2")}）`, why: "1/2ᵏ 衰减得更快，这一份先消失。" },
          { text: `沿 ${tex("x_0")} 与原点的连线`, why: "两个分量缩小的速度不同，方向会改变。" },
          { text: "绕原点转圈", why: "两个特征值都是正实数，没有转动。" },
        ],
        conclusion: `${tex("x_k=c_1(1/2)^k\\eta_1+c_2(4/5)^k\\eta_2")}。两份都在缩小，${tex("(1/2)^k")} 缩得快，剩下的主要是 ${tex("\\eta_2")} 分量，所以点贴着 ${tex("\\eta_2")} 所在的直线进入原点。`,
      },
    },
    saddle: {
      label: "鞍点",
      A: [["1/2", "7/10"], [0, "6/5"]],
      vecs: [[1, 0], [1, 1]],
      lambdas: ["1/2", "6/5"],
      x0: [1.5, 0.5],
      extent: 4.2,
      predict: {
        question: `${tex("\\lambda_1=1/2")}，${tex("\\lambda_2=6/5")}。多数初始点最后沿哪条直线跑远？`,
        options: [
          { text: `${tex("\\eta_2")} 所在直线`, correct: true },
          { text: `${tex("\\eta_1")} 所在直线`, why: "η₁ 分量每步乘 1/2，越来越小。" },
          { text: "所有点都跑向原点", why: "6/5>1，η₂ 分量在增长。" },
          { text: "点停在原地不动", why: "按一次“作用一次”看看。" },
        ],
        conclusion: `${tex("\\eta_2")} 分量每步乘 ${tex("6/5")}，越来越大，${tex("\\eta_1")} 分量趋于 ${tex("0")}，点沿 ${tex("\\eta_2")} 的方向跑远。只有恰好落在 ${tex("\\eta_1")} 直线上（${tex("c_2=0")}）的点会跑向原点：把 ${tex("x_0")} 拖到 ${tex("x_1")} 轴上试试。`,
      },
    },
    markov: {
      label: "马尔可夫",
      A: [["4/5", "3/10"], ["1/5", "7/10"]],
      vecs: [[3, 2], [1, -1]],
      lambdas: [1, "1/2"],
      x0: [2, 0],
      extent: 2.6,
      predict: {
        question: `每列元素之和为 1。从 ${tex("x_0=(2,0)")} 出发，最后停在哪里？`,
        options: [
          { text: `${tex("(6/5,4/5)")}`, correct: true },
          { text: `${tex("(1,1)")}`, why: "极限在 λ=1 的特征直线 L((3,2)) 上。" },
          { text: "原点", why: "λ=1 的分量不衰减。" },
          { text: "不会停下", why: "λ=1/2 的分量越来越小，点会停下。" },
        ],
        conclusion: `${tex("\\lambda=1")} 的分量保持不变，${tex("\\lambda=1/2")} 的分量衰减为 ${tex("0")}，${tex("x_k")} 趋于 ${tex("c_1\\eta_1")}。分量之和保持为 ${tex("2")}，所以极限是 ${tex("2\\cdot(3/5,2/5)=(6/5,4/5)")}。`,
      },
    },
    jordan: {
      label: "特征向量不够",
      A: [[1, 1], [0, 1]],
      vecs: [[1, 0]],
      lambdas: [1],
      x0: [-2.5, 0.5],
      extent: 3.2,
      predict: {
        question: `${tex("A=\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}")} 只有一条特征直线。反复作用，点怎样运动？`,
        options: [
          { text: "沿水平方向等距前进", correct: true },
          { text: "越走越快（指数增长）", why: "每一步 x₁ 加上的都是同一个 x₂。" },
          { text: "趋向原点", why: "特征值是 1，没有衰减。" },
          { text: "绕原点转动", why: "x₂ 坐标始终不变。" },
        ],
        conclusion: `${tex("A^k=\\begin{pmatrix}1&k\\\\0&1\\end{pmatrix}")}，${tex("x_k=(x_1+k\\cdot x_2,x_2)")}：每步平移 ${tex("x_2")}，是等差的漂移。特征向量只有一个，${tex("x_0")} 拆不成两个按几何级数伸缩的分量，${tex("A")} 不能对角化。`,
      },
    },
  };

  function iterationLab(root) {
    const lab = K.labShell(root, {
      title: `反复作用 ${tex("A")}，点跑向哪里`,
      task: `拖动金色的 ${tex("x_0")}，然后按“作用一次”。蓝、朱两支箭头是 ${tex("x_k")} 的两个特征分量，每按一次各乘自己的 ${tex("\\lambda")}；紫色折线是轨迹。`,
    });
    const state = { key: "attract", x0: [3, 1], k: 0 };
    const toolbar = el("div", "ch7l-toolbar");
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    body.append(stage, side);
    lab.append(toolbar, body);
    const plane = K.plane2d(stage, { extent: 3.2, hint: "拖动 x₀（每次半格）", label: "迭代轨迹" });
    const tools = el("div", "ch7l-actions");
    tools.innerHTML = `<button type="button" class="ch7l-btn is-primary" data-step>作用一次 ${tex("A")}</button><button type="button" class="ch7l-btn" data-ten>连续 10 次</button><button type="button" class="ch7l-btn" data-reset>回到 ${tex("x_0")}</button>`;
    const info = el("div", "ch7l-card");
    const gateHost = el("div");
    const result = el("div", "ch7l-result");
    side.append(gateHost, tools, info, result);
    let flow = null;
    let timer = 0;
    const preset = () => ITER_PRESETS[state.key];

    function exactCoeffs() {
      const P = preset();
      if (P.vecs.length < 2) return null;
      const vs = P.vecs.map(K.vec);
      return K.coordinatesIn(vs, K.vec(state.x0));
    }

    function trajectory() {
      const A = matNum(K.mat(preset().A));
      const pts = [state.x0.slice()];
      for (let i = 0; i < state.k; i += 1) pts.push(apply2(A, pts[i]));
      return pts;
    }

    function redraw() {
      const P = preset();
      const pts = trajectory();
      const xk = pts[pts.length - 1];
      const c = exactCoeffs();
      const lam = P.lambdas.map((x) => num(F(x)));
      const colors = ["v1", "v2"];
      plane.setDraw((d) => {
        d.grid(undefined, { alpha: 0.5 });
        d.axes();
        P.vecs.forEach((v, i) => {
          d.line([0, 0], v, colors[i], { width: 1.3, dash: [6, 5], alpha: 0.75 });
          // named at the far (negative) end: the positive ends meet the axis names and the trajectory
          const l = Math.hypot(...v);
          const r = Math.min(d.halfW, d.halfH) * 0.82;
          d.text([(-v[0] / l) * r, (-v[1] / l) * r], `η${"₁₂"[i]}`, colors[i], { dx: 6, dy: -10 });
        });
        if (c) {
          const parts = [0, 1].map((i) => {
            const s = num(c[i]) * lam[i] ** state.k;
            return [P.vecs[i][0] * s, P.vecs[i][1] * s];
          });
          d.segment(parts[0], xk, "v2", { width: 1, dash: [3, 4], alpha: 0.7 });
          d.segment(parts[1], xk, "v1", { width: 1, dash: [3, 4], alpha: 0.7 });
          d.arrow([0, 0], parts[0], "v1", { width: 2.6 });
          d.arrow([0, 0], parts[1], "v2", { width: 2.6 });
        }
        // x₀ is the dragged point; x₁, x₂, … are images under A.
        d.polyline(pts, "image", { width: 1.6, alpha: 0.85 });
        pts.forEach((p, i) => d.point(p, i ? "image" : "drag", { r: i === pts.length - 1 ? 5.5 : 3, alpha: i === pts.length - 1 ? 1 : 0.7 }));
        d.text(xk, state.k ? `x${toSub(state.k)}` : "x₀", state.k ? "image" : "drag", { dx: 10, dy: 12 });
      });
      let html = `<h4>${tex(`k=${state.k}`)}</h4><p>${tex(`x_{${state.k}}=`)} ${vecNice(xk)}</p>`;
      if (c) {
        const co = (x) => { const t = lf(x); return t === "1" ? "" : t === "-1" ? "-" : t; };
        html += `<p>${tex(`x_0=${co(c[0])}\\eta_1${c[1].n < 0 ? "" : "+"}${co(c[1])}\\eta_2`)}</p>`;
        // the k-th power through the eigenbasis: only the diagonal factor depends on k
        const X = [[F(P.vecs[0][0]), F(P.vecs[1][0])], [F(P.vecs[0][1]), F(P.vecs[1][1])]];
        const pow = (l) => {
          const t = lf(F(l));
          return /frac|-/.test(t) ? `\\left(${t}\\right)^{${state.k}}` : `${t}^{${state.k}}`;
        };
        html += `<div class="ch7l-power">${texD(`A^{${state.k}}=X\\begin{pmatrix}${pow(P.lambdas[0])}&0\\\\[4pt]0&${pow(P.lambdas[1])}\\end{pmatrix}X^{-1}`)}${texD(`X=(\\eta_1,\\eta_2)=${roomy(K.latexMatrix(X))},\\ X^{-1}=${roomy(K.latexMatrix(K.inv(X)))}`)}</div>`;
        // last five steps: each component is multiplied by its own λ; the ratio column
        // (weaker over stronger component) shows which one dies out
        const strong = Math.abs(lam[1]) >= Math.abs(lam[0]) ? 1 : 0;
        const weak = 1 - strong;
        const comp = (i, k) => num(c[i]) * lam[i] ** k;
        const rows = [];
        for (let k = Math.max(0, state.k - 4); k <= state.k; k += 1) rows.push(k);
        const ratioHead = tex(`\\eta_${weak + 1}/\\eta_${strong + 1}`);
        html += `<table class="ch7l-table ch7l-iter"><thead><tr><th>${tex("k")}</th>
          <th style="color:var(--cv-v1)">${tex("\\eta_1")} 分量 ${tex(`\\times${P.lambdas[0]}`)}</th>
          <th style="color:var(--cv-v2)">${tex("\\eta_2")} 分量 ${tex(`\\times${P.lambdas[1]}`)}</th>
          <th>${ratioHead}</th></tr></thead><tbody>
          ${rows.map((k) => {
            const a = comp(0, k), b = comp(1, k);
            const st = comp(strong, k), wk = comp(weak, k);
            const ratio = Math.abs(st) < 1e-12 ? "—" : nice(wk / st);
            return `<tr${k === state.k ? ' class="is-now"' : ""}><td>${k}</td><td>${nice(a)}</td><td>${nice(b)}</td><td>${ratio}</td></tr>`;
          }).join("")}
          </tbody></table>`;
        const onLine = c.findIndex((x) => M().isZero(x));
        if (onLine >= 0) html += `<p class="ch7l-ok">${tex("x_0")} 在 ${tex(`\\eta_${2 - onLine}`)} 所在直线上：${tex(`c_${onLine + 1}=0`)}，点永远不离开这条直线。</p>`;
      } else {
        html += `<p class="ch7l-muted">只有一条特征直线，${tex("x_k")} 拆不成两个特征分量。${tex(`A^{k}=\\begin{pmatrix}1&${state.k}\\\\0&1\\end{pmatrix}`)}</p>`;
      }
      info.innerHTML = html;
    }

    function toSub(n) {
      return String(n).split("").map((ch) => "₀₁₂₃₄₅₆₇₈₉"[Number(ch)]).join("");
    }

    // the conclusion waits for a few steps: one step barely shows which component wins
    function step() {
      if (state.k >= 40) return;
      state.k += 1;
      redraw();
      if (state.k >= 3) flow?.acted();
    }

    plane.setHandles([
      {
        color: "drag",
        snap: 0.5,
        limit: 3,
        get: () => state.x0,
        set: (p) => {
          clearInterval(timer);
          state.x0 = p;
          state.k = 0;
          redraw();
        },
      },
    ]);
    tools.querySelector("[data-step]").addEventListener("click", step);
    tools.querySelector("[data-ten]").addEventListener("click", () => {
      clearInterval(timer);
      let n = 0;
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        for (let i = 0; i < 10; i += 1) step();
        return;
      }
      timer = setInterval(() => {
        step();
        n += 1;
        if (n >= 10) clearInterval(timer);
      }, 160);
    });
    tools.querySelector("[data-reset]").addEventListener("click", () => {
      clearInterval(timer);
      state.k = 0;
      redraw();
    });

    function load(key) {
      clearInterval(timer);
      state.key = key;
      state.x0 = preset().x0.slice();
      state.k = 0;
      plane.setExtent(preset().extent);
      flow = K.predictFlow(gateHost, result, { ...preset().predict, actHint: "记下了你的猜测。按“作用一次 A”至少三次，结论随后出现。" });
      redraw();
    }
    K.chips(toolbar, Object.entries(ITER_PRESETS).map(([k, v]) => [k, v.label]), load, state.key);
    load("attract");
    return () => {
      clearInterval(timer);
      plane.destroy();
    };
  }

  K.register("matrix-of-linear-map", basisLab);
  K.register("eigenvalues-eigenvectors", eigenLab);
  K.register("diagonal-matrices", iterationLab);
})();


;/* visuals/ch7/labs-3d.js */
/*
 * Chapter 7 labs on the shared 3D scene (visuals/shared/scene3d.js):
 *   §6 image-and-kernel     — slide x along the kernel, the image point stays put
 *   §7 invariant-subspaces  — does σW leave the candidate line/plane W?
 *   §9 minimal-polynomial   — Krylov sequence v, Av, A²v, … until it falls back
 * Kernels, images, invariance and linear relations are all decided exactly.
 */
(() => {
  const K = window.Ch7Kit;
  if (!K) return;
  const { tex, texD, F, num, lf, el } = K;
  const M = () => window.Ch3Math;
  const S = () => window.LAScene3D;
  const V = () => window.LAScene3D.vec;

  const numVec = (v) => v.map(num);
  const snapHalf = (x) => Math.round(x * 2) / 2;
  const colsOf = (A) => A[0].map((_, j) => A.map((r) => r[j]));

  /* Independent columns of a rational matrix (a basis of its column space). */
  function columnBasis(A) {
    const cols = colsOf(A);
    const basis = [];
    cols.forEach((c) => {
      if (K.rankOfVectors([...basis, c]) > basis.length) basis.push(c);
    });
    return basis;
  }

  /* Drawable object for the span of 1 or 2 rational vectors. */
  function spanObject(basis, color, extra = {}) {
    const b = basis.map(numVec);
    if (b.length === 1) return { type: "line", dir: b[0], color, width: 2.6, ...extra };
    if (b.length === 2) return { type: "plane", n: V().cross(b[0], b[1]), d: 0, color, alpha: 0.13, ...extra };
    return null;
  }

  function dimName(k) {
    return ["只有零向量", "一条直线", "一个平面", "整个空间"][k];
  }

  /* ================= §6 值域与核 ================= */

  const KERNEL_MODES = {
    oblique: {
      label: "沿直线压到平面",
      A: [[1, 0, "-1/2"], [0, 1, "-1/2"], [0, 0, 0]],
      x: [1.5, -0.5, 2],
      axes: ["x₁", "x₂", "x₃"],
      predict: {
        question: `${tex("\\sigma")} 沿一条直线把 ${tex("\\mathbb R^3")} 压到一个平面上。${tex("\\dim\\sigma^{-1}(0)+\\dim\\sigma V")} 等于多少？`,
        options: [
          { text: "3", correct: true },
          { text: "2", why: "核是压缩方向那条直线，它也占一维。" },
          { text: "4", why: "数一数：核一条直线，值域一个平面。" },
          { text: "取决于压缩的方向", why: "换个方向压，核与值域的维数都不变。" },
        ],
        conclusion: `核是压缩方向所在的直线（1 维），值域是平面 ${tex("x_3=0")}（2 维），${tex("1+2=3")}。沿核拖动 ${tex("x'")}，${tex("\\sigma x'")} 始终等于 ${tex("\\sigma x")}：${tex("\\sigma x")} 的全部原像恰是 ${tex("x+\\sigma^{-1}(0)")}。这个 ${tex("\\sigma")} 满足 ${tex("\\sigma^2=\\sigma")}，此时 ${tex("\\mathbb R^3=\\sigma V\\oplus\\sigma^{-1}(0)")}。`,
      },
    },
    toLine: {
      label: "沿平面压到直线",
      A: [[0, 0, "1/2"], [0, 0, "1/2"], [0, 0, 1]],
      x: [1.5, -1, 2],
      axes: ["x₁", "x₂", "x₃"],
      predict: {
        question: `换成沿平面 ${tex("x_3=0")} 压到直线 ${tex("L((1,1,2)^T)")} 上。核与值域各是几维？`,
        options: [
          { text: "核 2 维，值域 1 维", correct: true },
          { text: "核 1 维，值域 2 维", why: "被压成 0 的是平面 x₃=0 里的全部向量。" },
          { text: "核 2 维，值域 2 维", why: "所有像都落在一条直线上。" },
          { text: "核 0 维，值域 3 维", why: "x₃=0 的向量都被送到 0。" },
        ],
        conclusion: `这个变换是 ${tex("E-\\sigma")}（${tex("\\sigma")} 是第一种模式）：核与值域对调，${tex("2+1=3")}。在核平面里拖动 ${tex("x'")}，像始终是同一个点。`,
      },
    },
    deriv: {
      label: `求导 ${tex("D")}（${tex("P[x]_3")}）`,
      A: [[0, 1, 0], [0, 0, 2], [0, 0, 0]],
      x: [1, 1.5, 1],
      axes: ["a₀", "a₁", "a₂"],
      predict: {
        question: `点 ${tex("(a_0,a_1,a_2)")} 代表 ${tex("a_0+a_1x+a_2x^2")}。${tex("D")} 的核（常数）与值域（次数 ${tex("\\le1")} 的多项式）是什么关系？`,
        options: [
          { text: "核含在值域里，两者的和不是整个空间", correct: true },
          { text: `两者互补，${tex("P[x]_3=DV\\oplus D^{-1}(0)")}`, why: "常数 1 在核里，同时 1=D(x) 也在值域里。" },
          { text: "两者只交于零向量", why: "常数 1 既在核里，也等于 D(x)。" },
          { text: `值域是整个 ${tex("P[x]_3")}`, why: "x² 不是任何次数 <3 的多项式的导数。" },
        ],
        conclusion: `${tex("D^{-1}(0)=L(1)")} 是 ${tex("a_0")} 轴，${tex("DV=L(1,x)")} 是 ${tex("a_0a_1")} 平面。${tex("1+2=3")} 照样成立，但 ${tex("a_0")} 轴在 ${tex("a_0a_1")} 平面里：${tex("DV+D^{-1}(0)=DV\\ne P[x]_3")}。维数公式不保证直和。`,
      },
    },
  };

  /* n1 x1 + n2 x2 + n3 x3 without zero terms or unit coefficients. */
  function planeLatex(n0) {
    // scale the normal so its first nonzero coefficient is ±1 (3/2 x₃=0 reads x₃=0)
    const lead = n0.find((c) => !M().isZero(c));
    const n = lead ? n0.map((c) => M().div(c, M().absF(lead))) : n0;
    const terms = [];
    n.forEach((c, i) => {
      if (M().isZero(c)) return;
      const neg = c.n < 0;
      const mag = M().absF(c);
      const coef = M().eq(mag, M().F(1)) ? "" : lf(mag);
      terms.push(`${terms.length ? (neg ? "-" : "+") : neg ? "-" : ""}${coef}x_${i + 1}`);
    });
    return terms.join("") || "0";
  }

  function kernelLab(root) {
    const lab = K.labShell(root, {
      title: "沿核滑动，像不动",
      task: `金色圆点 ${tex("x")} 可以随意拖动，紫色点是它的像 ${tex("\\sigma x")}。金色圆点 ${tex("x'")} 只能沿绿色虚线 ${tex("x+\\sigma^{-1}(0)")} 移动：拖动它，看 ${tex("\\sigma x'")} 会不会离开 ${tex("\\sigma x")}。`,
    });
    const toolbar = el("div", "ch7l-toolbar");
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    body.append(stage, side);
    lab.append(toolbar, body);
    const gateHost = el("div");
    const tools = el("div", "ch7l-actions");
    tools.innerHTML = `<button type="button" class="ch7l-btn is-primary" data-slide>让 ${tex("x'")} 走遍 ${tex("x+\\sigma^{-1}(0)")}</button><button type="button" class="ch7l-btn" data-look-ker>沿核看</button><button type="button" class="ch7l-btn" data-reset>回到默认视角</button>`;
    const info = el("div", "ch7l-card");
    const result = el("div", "ch7l-result");
    side.append(gateHost, tools, info, result);
    let scene = null;
    let flow = null;
    const state = { key: "oblique", x: [1.5, -0.5, 2], w: [0, 0, 0] };
    // positions x′ has visited on the slice x+σ⁻¹(0): every one maps to the same σx
    const trail = new Map();
    let slideTimer = 0;
    let startW = null;
    const remember = () => trail.set(state.w.join(","), state.w.slice());

    const mode = () => KERNEL_MODES[state.key];
    const A = () => K.mat(mode().A);

    function structure() {
      const a = A();
      const ker = K.nullspace(a);
      const im = columnBasis(a);
      const sum = K.rankOfVectors([...ker, ...im]);
      return { ker, im, cap: ker.length + im.length - sum };
    }

    function xPrime() {
      return state.x.map((v, i) => v + state.w[i]);
    }

    function redraw() {
      const a = A();
      const { ker, im, cap } = structure();
      const x = K.vec(state.x);
      const xp = K.vec(xPrime());
      const sx = K.matVec(a, x);
      const sxp = K.matVec(a, xp);
      const same = sx.every((v, i) => M().eq(v, sxp[i]));
      const sxN = numVec(sx);
      scene.setObjects(() => {
        const objs = [];
        const imObj = spanObject(im, "image", { label: state.key === "deriv" ? "DV" : "σV" });
        const kerObj = spanObject(ker, "subspace", { label: state.key === "deriv" ? "D⁻¹(0)" : "σ⁻¹(0)" });
        // The labelled spans are the answer to the prediction: draw them afterwards.
        if (flow?.revealed && imObj) objs.push(imObj);
        if (flow?.revealed && kerObj) objs.push(kerObj);
        // the fibre through x: x + ker
        if (ker.length === 1) objs.push({ type: "line", p: state.x, dir: numVec(ker[0]), color: "subspace", width: 1.4, dash: [6, 5], alpha: 0.8 });
        if (ker.length === 2) {
          const n = V().cross(numVec(ker[0]), numVec(ker[1]));
          objs.push({ type: "plane", n, d: V().dot(n, state.x), color: "subspace", alpha: 0.06, dash: [6, 5], strokeAlpha: 0.5 });
        }
        trail.forEach((w) => {
          const p = state.x.map((v, i) => v + w[i]);
          objs.push({ type: "segment", a: p, b: sxN, color: "drag", dash: [2, 3], width: 1.1, alpha: 0.5 });
          objs.push({ type: "point", p, color: "drag", r: 2.8 });
        });
        objs.push({ type: "segment", a: state.x, b: sxN, color: "axis", dash: [4, 4], width: 1.3 });
        objs.push({ type: "segment", a: xPrime(), b: sxN, color: "axis", dash: [4, 4], width: 1.3 });
        // x and x′ are both gold drag handles: name them on the picture.
        objs.push({ type: "point", p: state.x, color: "drag", r: 0.01, label: "x" });
        objs.push({ type: "point", p: xPrime(), color: "drag", r: 0.01, label: "x′" });
        objs.push({ type: "point", p: sxN, color: "image", r: 6.5, label: same ? "σx = σx′" : "σx" });
        if (!same) objs.push({ type: "point", p: numVec(sxp), color: "image", r: 5, hollow: true, label: "σx′" });
        return objs;
      });
      const poly = (v) => K.polyLatex(v, "x");
      let html = `<h4>读数</h4>`;
      if (state.key === "deriv") {
        html += `<p>${tex(`f=${poly(x)}`)}，${tex(`Df=${poly(sx)}`)}</p>`;
        html += `<p>${tex(`g=${poly(xp)}`)}，${tex(`Dg=${poly(sxp)}`)}</p>`;
      } else {
        html += `<p>${tex(`x=${K.latexRow(x)}`)}，${tex(`\\sigma x=${K.latexRow(sx)}`)}</p><p>${tex(`x'=${K.latexRow(xp)}`)}，${tex(`\\sigma x'=${K.latexRow(sxp)}`)}</p>`;
      }
      const D = state.key === "deriv";
      const s = D ? "D" : "\\sigma";
      html += same
        ? `<p class="ch7l-ok">${tex(D ? "Dg=Df" : "\\sigma x'=\\sigma x")}：${tex(D ? "g-f" : "x'-x")} 在核里。</p>`
        : `<p class="ch7l-bad">${tex(D ? "Dg\\ne Df" : "\\sigma x'\\ne\\sigma x")}</p>`;
      if (flow?.revealed) {
        html += `<p>${tex(`\\dim ${s}^{-1}(0)=${ker.length}`)}（${dimName(ker.length)}），${tex(`\\dim ${s} V=${im.length}`)}（${dimName(im.length)}），${tex(`\\dim(${s} V\\cap ${s}^{-1}(0))=${cap}`)}</p>`;
      }
      info.innerHTML = html;
    }

    function handles() {
      const { ker } = structure();
      const kerN = ker.map(numVec);
      const xHandle = {
        color: "drag",
        snap: 0.5,
        get: () => state.x,
        set: (p) => {
          const q = p.slice();
          if (state.key === "deriv") q[2] = Math.max(-1.5, Math.min(1.5, q[2]));
          state.x = q;
          trail.clear();
          redraw();
        },
        end: () => flow?.acted(),
      };
      const xpHandle = {
        color: "drag",
        get: xPrime,
        set: (p) => {
          const d = p.map((v, i) => v - state.x[i]);
          if (kerN.length === 1) {
            const k = kerN[0];
            const t = snapHalf(V().dot(d, k) / V().dot(k, k));
            state.w = k.map((c) => c * t);
          } else {
            // kernel plane x₃ = 0 in this lab
            state.w = [snapHalf(d[0]), snapHalf(d[1]), 0];
          }
          remember();
          redraw();
        },
        end: () => flow?.acted(),
      };
      if (kerN.length === 1) Object.assign(xpHandle, { mode: "line", dir: kerN[0] });
      else {
        xpHandle.mode = "plane";
        Object.defineProperty(xpHandle, "plane", { get: () => ({ n: [0, 0, 1], d: state.x[2] }) });
      }
      scene.setHandles([xHandle, xpHandle]);
    }

    /* Exact stops for x′ on the slice that stay inside the view cube. */
    function slideStops() {
      const { ker } = structure();
      const kerN = ker.map(numVec);
      const inside = (w) => state.x.every((v, i) => Math.abs(v + w[i]) <= 2.8);
      const stops = [];
      if (kerN.length === 1) {
        for (let t = -6; t <= 6; t += 0.5) {
          const w = kerN[0].map((c) => c * t);
          if (inside(w)) stops.push(w);
        }
      } else {
        // a zigzag over the kernel plane x₃ = 0
        for (let b = -2; b <= 2; b += 1) {
          const row = [];
          for (let a = -2; a <= 2; a += 1) if (inside([a, b, 0])) row.push([a, b, 0]);
          stops.push(...(b % 2 ? row.reverse() : row));
        }
      }
      return stops;
    }

    function slide() {
      clearInterval(slideTimer);
      const stops = slideStops();
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const visit = (w) => {
        state.w = w.map((c) => c + 0);
        remember();
      };
      // the sweep ends back at the starting offset, so x′ does not stop on top of x
      const home = startW ? [startW] : [];
      if (reduce) {
        [...stops, ...home].forEach(visit);
        redraw();
        flow?.acted();
        return;
      }
      const path = [...stops, ...home];
      let i = 0;
      slideTimer = setInterval(() => {
        visit(path[i]);
        redraw();
        i += 1;
        if (i >= path.length) {
          clearInterval(slideTimer);
          flow?.acted();
        }
      }, 140);
    }

    function load(key) {
      clearInterval(slideTimer);
      trail.clear();
      state.key = key;
      tools.querySelector("[data-slide]").innerHTML = key === "deriv" ? `让 ${tex("x'")} 走遍 ${tex("x+D^{-1}(0)")}` : `让 ${tex("x'")} 走遍 ${tex("x+\\sigma^{-1}(0)")}`;
      state.x = mode().x.slice();
      const { ker } = structure();
      // x′ starts well away from x and from σx (so handles and labels do not overlap), on the half grid
      const sx = numVec(K.matVec(A(), K.vec(state.x)));
      const start = () => {
        const k = numVec(ker[0]);
        for (const t of [-2, 2, -1.5, 1.5, -3, 3, -1, 1]) {
          const w = k.map((c) => c * t);
          const far = Math.hypot(...state.x.map((v, i) => v + w[i] - sx[i])) >= 1;
          const ok = far && w.every((c, i) => Number.isInteger(c * 2) && Math.abs(state.x[i] + c) <= 2.5) && Math.hypot(...w) >= 1.2;
          if (ok) return w;
        }
        return k.map((c) => -c);
      };
      state.w = ker.length === 1 ? start() : [-1.5, 1.5, 0];
      startW = state.w.slice();
      scene?.destroy();
      // the old scene's caption (added by lab-layout.js) goes with it
      stage.querySelectorAll(".la-figcaption").forEach((n) => n.remove());
      scene = S().create(stage, { range: 3, label: "核、值域与一个点的像", hint: "拖动空白处旋转 · 拖动金色圆点 x 或 x′", yaw: -0.9, pitch: 0.35, axisNames: mode().axes, spreadLabels: true, labelSafe: true });
      handles();
      flow = K.predictFlow(gateHost, result, { ...mode().predict, onReveal: redraw });
      redraw();
    }

    tools.querySelector("[data-slide]").addEventListener("click", slide);
    tools.querySelector("[data-look-ker]").addEventListener("click", () => {
      const { ker } = structure();
      if (ker.length === 1) scene.lookAlong(numVec(ker[0]));
      else scene.lookAlong([1, -1, 0]);
    });
    tools.querySelector("[data-reset]").addEventListener("click", () => scene.resetView());
    K.chips(toolbar, Object.entries(KERNEL_MODES).map(([k, v]) => [k, v.label]), load, state.key);
    load("oblique");
    return () => {
      clearInterval(slideTimer);
      scene?.destroy();
    };
  }

  /* ================= §7 不变子空间 ================= */

  const INVARIANT_PRESETS = {
    standard: {
      label: "转 90° 再拉伸",
      A: [[0, -1, 0], [1, 0, 0], [0, 0, 2]],
      basis: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
      basisName: "\\varepsilon_1,\\varepsilon_2\\mid\\varepsilon_3",
      predict: {
        question: `${tex("A")} 先绕 ${tex("x_3")} 轴转 90°，再沿 ${tex("x_3")} 轴拉伸 2 倍。有没有不变的平面？那个平面里有没有特征向量？`,
        options: [
          { text: `${tex("x_1x_2")} 平面不变，但平面里没有实特征向量`, correct: true },
          { text: `${tex("x_1x_2")} 平面不变，所以平面里一定有特征向量`, why: "平面里每个方向都被转了 90°。" },
          { text: "没有不变平面", why: "试试候选平面 x₁x₂。" },
          { text: `每个含 ${tex("x_3")} 轴的平面都不变`, why: "试试 x₁x₃ 平面：Aε₁=ε₂ 跑了出去。" },
        ],
        conclusion: `${tex("A")} 把 ${tex("x_1x_2")} 平面转 90°，平面整体留在原处，平面里的每条直线却都被转走，所以没有实特征向量。不变直线只有 ${tex("x_3")} 轴（${tex("\\lambda=2")}）。按 ${tex("x_1x_2")} 平面的基接上 ${tex("x_3")} 轴的基，矩阵是一个 2 阶块和一个 1 阶块组成的准对角矩阵。`,
      },
    },
    tilted: {
      label: "同样结构，斜放",
      A: [[-1, -1, 0], [2, 1, 0], [1, 2, 2]],
      basis: [[1, -1, 0], [0, 1, -1], [0, 0, 1]],
      basisName: "\\eta_1,\\eta_2\\mid\\eta_3",
      predict: {
        question: `${tex("A'=\\begin{pmatrix}-1&-1&0\\\\2&1&0\\\\1&2&2\\end{pmatrix}")} 的特征多项式也是 ${tex("(\\lambda^2+1)(\\lambda-2)")}。它的不变平面在哪里？`,
        options: [
          { text: `平面 ${tex("x_1+x_2+x_3=0")}`, correct: true },
          { text: `仍是 ${tex("x_1x_2")} 平面`, why: "A′ε₁=(−1,2,1)ᵀ 离开了 x₁x₂ 平面。" },
          { text: `每个含 ${tex("x_3")} 轴的平面`, why: "拖动法向试几个，A′W 会转开。" },
          { text: "没有不变平面", why: "把法向 n 拖到 (1,1,1) 方向。" },
        ],
        conclusion: `${tex("A'(1,-1,0)^T=(0,1,-1)^T")}，${tex("A'(0,1,-1)^T=(-1,1,0)^T")}，都留在 ${tex("x_1+x_2+x_3=0")} 里；${tex("A'\\varepsilon_3=2\\varepsilon_3")}。取这三个向量作基，矩阵就化成准对角形。`,
      },
    },
  };

  const CANDIDATES = [
    ["z", `${tex("x_3")} 轴`, { kind: "line", u: [0, 0, 1.5] }],
    ["x", `${tex("x_1")} 轴`, { kind: "line", u: [1.5, 0, 0] }],
    ["xy", `${tex("x_1x_2")} 平面`, { kind: "plane", n: [0, 0, 1.5] }],
    ["xz", `${tex("x_1x_3")} 平面`, { kind: "plane", n: [0, 1.5, 0] }],
    ["sum", tex("x_1+x_2+x_3=0"), { kind: "plane", n: [1, 1, 1] }],
  ];

  function invariantLab(root) {
    const lab = K.labShell(root, {
      title: `${tex("\\sigma W")} 有没有离开 ${tex("W")}`,
      task: `绿色是候选子空间 ${tex("W")}，紫色是它的像 ${tex("AW")}。拖动金色圆点改变候选直线的方向或候选平面的法向；${tex("AW")} 与 ${tex("W")} 重合、${tex("W")} 加深时，${tex("W")} 就是不变子空间。`,
    });
    const state = { key: "standard", kind: "plane", u: [1, 0.5, 1], n: [0.5, 1, 1.5] };
    const toolbar = el("div", "ch7l-toolbar");
    const kindBar = el("div", "ch7l-toolbar");
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    body.append(stage, side);
    lab.append(toolbar, body);
    const scene = S().create(stage, { range: 2.6, label: "候选子空间与它的像", hint: "拖动空白处旋转 · 拖动圆点改变候选", yaw: -0.8, pitch: 0.4, spreadLabels: true, labelSafe: true });
    const gateHost = el("div");
    const quick = el("div", "ch7l-actions ch7l-quick");
    const info = el("div", "ch7l-card");
    const result = el("div", "ch7l-result");
    const blockBox = el("div", "ch7l-card");
    blockBox.hidden = true;
    side.append(gateHost, kindBar, quick, info, result, blockBox);
    let flow = null;
    const preset = () => INVARIANT_PRESETS[state.key];

    function analyse() {
      const A = K.mat(preset().A);
      if (state.kind === "line") {
        const u = K.vec(state.u);
        const Au = K.matVec(A, u);
        const inv = K.isZeroVec(K.cross3(u, Au));
        return { A, u, Au, inv };
      }
      const n = K.vec(state.n);
      const basis = K.nullspace([n]);
      const images = basis.map((w) => K.matVec(A, w));
      const inv = images.every((w) => M().isZero(K.dotF(n, w)));
      // real eigenvectors of these presets: only λ = 2, eigen-line ker(A − 2E)
      const eig = K.nullspace(K.sub(A, K.scaleMat(K.identity(3), 2)));
      const hasEig = eig.some((e) => M().isZero(K.dotF(n, e)));
      return { A, n, basis, images, inv, hasEig };
    }

    const angleBetween = (a, b) => {
      const c = Math.abs(V().dot(a, b)) / (V().len(a) * V().len(b) || 1);
      return (Math.acos(Math.min(1, c)) * 180) / Math.PI;
    };

    function scaled(v, len) {
      const l = V().len(v);
      return l < 1e-9 ? v : v.map((x) => (x / l) * len);
    }

    function redraw() {
      const r = analyse();
      const kind = state.kind; // the closure must match the analysis it was built from
      const W = "subspace";
      scene.setObjects(() => {
        const objs = [];
        if (kind === "line") {
          const u = numVec(r.u);
          const Au = numVec(r.Au);
          // Highlight when invariant: the same colour with a glow underneath.
          if (r.inv) objs.push({ type: "line", dir: u, color: W, width: 7, alpha: 0.16 });
          objs.push({ type: "line", dir: u, color: W, width: 2.6, label: r.inv ? "AW=W" : "W" });
          // AW stays on the picture as a ghost, also when it lands on W
          objs.push({ type: "line", dir: Au, color: "image", width: 1.8, ghost: true, alpha: 0.6, label: r.inv ? undefined : "AW" });
          objs.push({ type: "arrow", to: u, color: "drag", label: "u" });
          objs.push({ type: "arrow", to: scaled(Au, Math.min(2.4, V().len(Au))), color: "image", width: 2.4, label: "Au" });
        } else {
          const n = numVec(r.n);
          objs.push({ type: "plane", n, d: 0, color: W, alpha: r.inv ? 0.26 : 0.14, width: r.inv ? 2.2 : 1.3, label: r.inv ? "AW=W" : "W" });
          const imgs = r.images.map(numVec);
          const nImg = V().cross(imgs[0], imgs[1]);
          // AW stays on the picture as a ghost, also when it lands on W
          if (V().len(nImg) > 1e-9) objs.push({ type: "plane", n: nImg, d: 0, color: "image", ghost: true, alpha: r.inv ? 0.03 : 0.06, strokeAlpha: 0.6, width: 1.4, label: r.inv ? undefined : "AW" });
          const ws = r.basis.map(numVec);
          const tipsW = ws.map((w) => scaled(w, 1.4));
          const tipsA = imgs.map((a, i) => scaled(a, 1.4 * (V().len(a) / V().len(ws[i]))));
          // when Awᵢ lands exactly on w_j (e.g. w₂ = Aw₁) the two arrows share one label
          const same = (p, q) => V().len(V().sub(p, q)) < 0.05;
          const namesW = ws.map((_, j) => `w${"₁₂"[j]}`);
          const merged = tipsA.map((a) => tipsW.findIndex((w) => same(a, w)));
          merged.forEach((j, i) => { if (j >= 0) namesW[j] += `=Aw${"₁₂"[i]}`; });
          ws.forEach((w, i) => {
            objs.push({ type: "arrow", to: tipsW[i], color: W, width: 2.2, label: namesW[i] });
            objs.push({ type: "arrow", to: tipsA[i], color: "image", width: 2.2, label: merged[i] >= 0 ? undefined : `Aw${"₁₂"[i]}` });
          });
          objs.push({ type: "segment", a: [0, 0, 0], b: n, color: "drag", width: 1.4, dash: [3, 3] });
          objs.push({ type: "label", p: n, text: "法向 n", color: "drag" });
        }
        return objs;
      });
      let html = `<h4>${state.kind === "line" ? "候选直线" : "候选平面"}</h4>`;
      if (state.kind === "line") {
        html += `<p>${tex(`W=L(${K.latexRow(r.u)}^{T})`)}，${tex(`Au=${K.latexRow(r.Au)}^{T}`)}</p>`;
        html += r.inv ? `<p class="ch7l-ok">${tex("AW=W")}：${tex("u")} 是特征向量</p>` : `<p class="ch7l-muted">${tex("AW")} 与 ${tex("W")} 夹角 ≈${angleBetween(numVec(r.u), numVec(r.Au)).toFixed(1)}°</p>`;
      } else {
        html += `<p>${tex(`W:\\ ${planeLatex(r.n)}=0`)}</p>`;
        if (r.inv) {
          html += `<p class="ch7l-ok">${tex("AW=W")}：${tex("W")} 是不变子空间</p>`;
          html += r.hasEig ? `<p class="ch7l-muted">${tex("W")} 中含有特征向量（${tex("x_3")} 轴方向）。</p>` : `<p class="ch7l-muted">${tex("W")} 中没有实特征向量：每条直线都被转走，平面整体不动。</p>`;
        } else {
          const imgs = r.images.map(numVec);
          html += `<p class="ch7l-muted">${tex("AW")} 与 ${tex("W")} 的夹角 ≈${angleBetween(numVec(r.n), V().cross(imgs[0], imgs[1])).toFixed(1)}°</p>`;
        }
      }
      // legend at the bottom of the readout: what the colours and the deeper W mean
      html += `<div class="ch7l-legend"><span><i class="is-w"></i><span>${tex("W")}：候选${state.kind === "line" ? "直线" : "平面"}</span></span><span><i class="is-aw"></i><span>${tex("AW")}：${tex("W")} 的像（虚线）</span></span><span><i class="is-same"></i><span>${tex("AW=W")} 时两者重合，${tex("W")} 加深</span></span></div>`;
      info.innerHTML = html;
      if (flow?.revealed) {
        const A = K.mat(preset().A);
        const X = K.transpose(K.mat(preset().basis));
        const Bm = K.mul(K.inv(X), K.mul(A, X));
        blockBox.hidden = false;
        blockBox.innerHTML = `<h4>适配基 ${tex(preset().basisName)}</h4>${texD(`X^{-1}AX=${K.latexMatrix(Bm)}`)}<p class="ch7l-muted">前两个基向量张成不变平面，第三个张成不变直线。</p>`;
      } else {
        blockBox.hidden = true;
      }
    }

    function setHandles() {
      scene.setHandles([
        {
          color: "drag",
          snap: 0.5,
          get: () => (state.kind === "line" ? state.u : state.n),
          set: (p) => {
            if (p.every((x) => x === 0)) return;
            if (state.kind === "line") state.u = p;
            else state.n = p;
            redraw();
          },
          end: () => flow?.acted(),
        },
      ]);
    }

    function setKind(kind) {
      state.kind = kind;
      kindBar.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b.dataset.key === kind));
      redraw();
      setHandles();
    }

    K.chips(kindBar, [["line", "候选直线"], ["plane", "候选平面"]], setKind, state.kind);
    quick.innerHTML = CANDIDATES.map(([k, label]) => `<button type="button" class="ch7l-btn" data-c="${k}">${label}</button>`).join("");
    quick.querySelectorAll("[data-c]").forEach((b) =>
      b.addEventListener("click", () => {
        const spec = CANDIDATES.find((c) => c[0] === b.dataset.c)[2];
        if (spec.kind === "line") state.u = spec.u.slice();
        else state.n = spec.n.slice();
        setKind(spec.kind);
        flow?.acted();
      }),
    );

    function load(key) {
      state.key = key;
      flow = K.predictFlow(gateHost, result, { ...preset().predict, onReveal: redraw });
      redraw();
    }
    K.chips(toolbar, Object.entries(INVARIANT_PRESETS).map(([k, v]) => [k, v.label]), load, state.key);
    setHandles();
    load("standard");
    return () => scene.destroy();
  }

  /* ================= §9 最小多项式：Krylov 序列 ================= */

  const KRYLOV_PRESETS = {
    j21: {
      label: tex("J(2,2)\\oplus J(2,1)"),
      A: [[2, 0, 0], [1, 2, 0], [0, 0, 2]],
      v: [1, 0, 1],
      // look at L(v, Av) (normal (−1,0,1)) from slightly off its normal
      camera: { yaw: 2.75, pitch: 0.62 },
      predict: {
        question: `这个 ${tex("A")} 的特征多项式是 ${tex("(\\lambda-2)^3")}。从 ${tex("v")} 出发依次作用 ${tex("A")}：${tex("v")}、${tex("Av")}、${tex("A^2v")} 在哪一步落回前面向量张成的空间，那一步的关系式就给出最小多项式。${tex("A")} 的最小多项式是什么？`,
        options: [
          { text: `${tex("(\\lambda-2)^2")}`, correct: true },
          { text: `${tex("\\lambda-2")}`, why: "A≠2E：从 v=(1,0,1)ᵀ 出发，Av 与 v 不共线。" },
          { text: `${tex("(\\lambda-2)^3")}`, why: "多拖几个 v：A²v 总落回平面 L(v,Av)，2 次多项式已经零化 A。" },
          { text: `${tex("(\\lambda-2)^2(\\lambda-1)")}`, why: "1 不是 A 的特征值，最小多项式的根都是特征值。" },
        ],
        conclusion: `${tex("(A-2E)^2=O")}，所以对每个 ${tex("v")} 都有 ${tex("A^2v=4Av-4v")}，张成最多是平面：${tex("m=(\\lambda-2)^2")}。它有重因式，${tex("A")} 不能对角化。对照 ${tex("\\operatorname{diag}(2,2,1)")}：${tex("A^2v")} 同样在第 2 步落回平面，关系式却是 ${tex("A^2v=3Av-2v")}，最小多项式 ${tex("(\\lambda-1)(\\lambda-2)")} 没有重因式。`,
      },
    },
    d221: {
      label: tex("\\operatorname{diag}(2,2,1)"),
      A: [[2, 0, 0], [0, 2, 0], [0, 0, 1]],
      v: [1, 1, 1],
      // L(v, Av) has normal (−1,1,0)
      camera: { yaw: 2.05, pitch: 0.3 },
      predict: {
        question: `${tex("A=\\operatorname{diag}(2,2,1)")}，从 ${tex("v=(1,1,1)^T")} 出发。${tex("A^2v")} 落回 ${tex("L(v,Av)")} 时，得到的 ${tex("m_v")} 是什么？`,
        options: [
          { text: `${tex("(\\lambda-1)(\\lambda-2)")}`, correct: true },
          { text: `${tex("(\\lambda-2)^2")}`, why: "落回的关系是 A²v=3Av−2v，对应 λ²−3λ+2。" },
          { text: `${tex("(\\lambda-2)^2(\\lambda-1)")}`, why: "这是特征多项式；A²v 已经落回平面，mᵥ 只有 2 次。" },
          { text: `${tex("\\lambda-2")}`, why: "v 不是特征向量，Av 与 v 不共线。" },
        ],
        conclusion: `${tex("A^2v=3Av-2v")}，${tex("m_v=(\\lambda-1)(\\lambda-2)")}，它也是 ${tex("A")} 的最小多项式：没有重因式，${tex("A")} 可以对角化。${tex("J(2,2)\\oplus J(2,1)")} 也在第 2 步落回平面，但那里的关系式给出 ${tex("(\\lambda-2)^2")}，有重因式，不能对角化。`,
      },
    },
    j3: {
      label: tex("J(2,3)"),
      A: [[2, 0, 0], [1, 2, 0], [0, 1, 2]],
      v: [1, 0, 0],
      predict: {
        question: `${tex("A=J(2,3)")}，特征多项式是 ${tex("(\\lambda-2)^3")}。它的最小多项式是几次？`,
        options: [
          { text: "3 次", correct: true },
          { text: "1 次", why: "A≠2E。" },
          { text: "2 次", why: "从 v=ε₁ 出发，看 A²v 是否落回。" },
          { text: "4 次", why: "最小多项式整除特征多项式。" },
        ],
        conclusion: `${tex("v=\\varepsilon_1")} 时 ${tex("v,Av,A^2v")} 线性无关，所以没有 2 次多项式零化 ${tex("A")}，${tex("m=(\\lambda-2)^3")} 与特征多项式相同，有重因式，不能对角化。${tex("v=\\varepsilon_3")} 是特征向量，一步就停：${tex("m_v=\\lambda-2")}。`,
      },
    },
  };

  /* A polynomial with integer roots has a repeated factor iff some root also kills its derivative. */
  function hasRepeatedFactor(coeffs) {
    const deriv = coeffs.slice(1).map((c, k) => M().mul(c, F(k + 1)));
    const at = (p, r) => p.reduceRight((acc, c) => M().add(M().mul(acc, r), c), F(0));
    for (let r = -12; r <= 12; r += 1) if (M().isZero(at(coeffs, F(r))) && M().isZero(at(deriv, F(r)))) return true;
    return false;
  }

  function krylovLab(root) {
    const lab = K.labShell(root, {
      title: `${tex("v,Av,A^2v,\\dots")} 第几步落回`,
      task: `拖动 ${tex("v")} 选一个起点，然后逐个加入 ${tex("Av,A^2v,\\dots")}。张成从直线长成平面，再长满空间；新向量第一次落回已有张成时，得到 ${tex("v")} 的最小多项式 ${tex("m_v")}。`,
    });
    const state = { key: "j21", v: [1, 0, 1], seq: null, flash: 0 };
    const toolbar = el("div", "ch7l-toolbar");
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    body.append(stage, side);
    lab.append(toolbar, body);
    const scene = S().create(stage, { range: 2, label: "Krylov 序列与它的张成", hint: "拖动空白处旋转 · 拖动圆点改变 v（箭头只画方向）", yaw: -0.85, pitch: 0.4, spreadLabels: true, labelSafe: true });
    const gateHost = el("div");
    const tools = el("div", "ch7l-actions");
    tools.innerHTML = `<button type="button" class="ch7l-btn is-primary" data-next>加入下一个</button><button type="button" class="ch7l-btn" data-restart>只留 ${tex("v")}</button><button type="button" class="ch7l-btn" data-e1>${tex("v=\\varepsilon_1")}</button><button type="button" class="ch7l-btn" data-e3>${tex("v=\\varepsilon_3")}</button>`;
    const info = el("div", "ch7l-card");
    const result = el("div", "ch7l-result");
    const polyBox = el("div", "ch7l-card");
    polyBox.hidden = true;
    side.append(gateHost, tools, info, result, polyBox);
    let flow = null;
    const preset = () => KRYLOV_PRESETS[state.key];
    // v is dragged; Av, A²v, A³v are images under A (fading so they stay apart).
    const COLORS = ["drag", "image", "image", "image"];
    const ALPHAS = [1, 1, 0.75, 0.55];
    const TEXT_VARS = ["--cv-drag-text", "--cv-image", "--cv-image", "--cv-image"];
    const NAMES = ["v", "Av", "A²v", "A³v"];
    const NAMES_TEX = ["v", "Av", "A^2v", "A^3v"];

    function reset() {
      state.seq = { vs: [K.vec(state.v)], stop: null };
      state.flash = 0;
    }

    /* The span that Aᵏv falls into pulses three times, then keeps a steady glow. */
    let flashAnim = 0;
    function flash() {
      cancelAnimationFrame(flashAnim);
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        state.flash = 1;
        scene.render();
        return;
      }
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / 1500);
        state.flash = t < 1 ? 1 + 1.6 * Math.abs(Math.sin(t * Math.PI * 3)) : 1;
        scene.render();
        if (t < 1) flashAnim = requestAnimationFrame(step);
      };
      flashAnim = requestAnimationFrame(step);
    }

    function next() {
      const seq = state.seq;
      if (seq.stop || seq.vs.length >= 4) return;
      const A = K.mat(preset().A);
      const w = K.matVec(A, seq.vs[seq.vs.length - 1]);
      const c = K.coordinatesIn(seq.vs, w);
      seq.vs.push(w);
      if (c) seq.stop = { k: seq.vs.length - 1, c };
      redraw();
      // graded once the sequence falls back with mᵥ = m_A (mᵥ always divides m_A, so equal degrees suffice);
      // an early stop at an eigenvector answers a different question
      if (c) {
        flash();
        if (asked()) flow?.acted();
      }
    }

    const asked = () => Boolean(state.seq.stop) && state.seq.stop.k === K.minimalPolynomial(K.mat(preset().A)).length - 1;

    function redraw() {
      const { vs, stop } = state.seq;
      const indep = stop ? vs.slice(0, -1) : vs;
      const dirs = vs.map((v) => {
        const n = numVec(v);
        const l = V().len(n);
        return l < 1e-9 ? n : n.map((x) => (x / l) * 1.6);
      });
      scene.setObjects(() => {
        const objs = [];
        const d = indep.map((_, i) => dirs[i]);
        // once Aᵏv has fallen back, the span it fell into is highlighted (pulse, then steady glow)
        const glow = stop ? state.flash : 0;
        const spanName = ["", "L(v)", "L(v, Av)", ""][indep.length];
        if (indep.length === 1) objs.push({ type: "line", dir: d[0], color: "subspace", width: glow ? 2 : 1.4, alpha: glow ? 0.9 : 0.5, dash: [5, 5], glow, label: stop ? spanName : "" });
        if (indep.length === 2) objs.push({ type: "plane", n: V().cross(d[0], d[1]), d: 0, color: "subspace", alpha: 0.13 + 0.05 * glow, width: glow ? 2 : 1.3, glow, label: spanName });
        if (indep.length === 3) objs.push({ type: "box", vectors: d, color: "subspace", alpha: 0.06 });
        dirs.forEach((p, i) => {
          const fell = stop && i === vs.length - 1;
          // The vector that falls back is highlighted with a glow of its own colour.
          if (fell) objs.push({ type: "segment", a: [0, 0, 0], b: p, color: COLORS[i], width: 8, alpha: 0.18 });
          objs.push({ type: "arrow", to: p, color: COLORS[i], width: 2.6, alpha: fell ? 1 : ALPHAS[i], label: NAMES[i] });
        });
        return objs;
      });
      const rows = vs
        .map((v, i) => `<li><span style="color:var(${TEXT_VARS[i]})">${tex(NAMES_TEX[i])}</span> ${tex(K.latexRow(v))}</li>`)
        .join("");
      let html = `<h4>序列（张成维数 ${indep.length}）</h4><ul class="ch7l-seq">${rows}</ul>`;
      if (stop) {
        const { k, c } = stop;
        const rhs = c
          .map((x, i) => ({ x, i }))
          .filter(({ x }) => !M().isZero(x))
          .map(({ x, i }, j) => {
            const coef = M().eq(x, F(1)) ? "" : M().eq(x, F(-1)) ? "-" : lf(x);
            const sign = j === 0 || x.n < 0 ? "" : "+";
            return `${sign}${coef}${NAMES_TEX[i]}`;
          })
          .join("") || "0";
        const mv = [...c.map((x) => M().neg(x)), F(1)];
        html += `<p class="ch7l-ok">${tex(NAMES_TEX[k])} 落回了${["", `直线 ${tex("L(v)")}`, `平面 ${tex("L(v,Av)")}`, "前面的张成"][k]}：</p><p>${tex(`${NAMES_TEX[k]}=${rhs}`)}</p><p>${tex(`m_v(\\lambda)=${K.polyFactorLatex(mv)}`)}</p>`;
        if (flow?.predicted && !flow.revealed && !asked()) html += `<p class="ch7l-muted">换一个 ${tex("v")} 再试。</p>`;
      } else {
        html += `<p class="ch7l-muted">${vs.length === 1 ? "先按“加入下一个”。" : "还没有落回，继续加入。"}</p>`;
      }
      info.innerHTML = html;
      tools.querySelector("[data-next]").disabled = Boolean(stop);
      if (flow?.revealed) {
        const A = K.mat(preset().A);
        polyBox.hidden = false;
        polyBox.innerHTML = `<h4>整个矩阵</h4><p>${tex(`m_A(\\lambda)=${K.polyFactorLatex(K.minimalPolynomial(A))}`)}</p><p>${tex(`f(\\lambda)=|\\lambda E-A|=${K.polyFactorLatex(K.charPolynomial(A))}`)}</p><p class="${hasRepeatedFactor(K.minimalPolynomial(A)) ? "ch7l-bad" : "ch7l-ok"}">${tex("m_A")} ${hasRepeatedFactor(K.minimalPolynomial(A)) ? `有重因式，${tex("A")} 不能对角化` : `没有重因式，${tex("A")} 可以对角化`}。</p><p class="ch7l-muted">每个 ${tex("m_v")} 都整除 ${tex("m_A")}，${tex("m_A")} 又整除 ${tex("f")}。</p>`;
      } else polyBox.hidden = true;
    }

    scene.setHandles([
      {
        color: "drag",
        snap: 0.5,
        get: () => state.v,
        set: (p) => {
          if (p.every((x) => x === 0)) return;
          state.v = p;
          reset();
          redraw();
        },
      },
    ]);
    tools.querySelector("[data-next]").addEventListener("click", next);
    tools.querySelector("[data-restart]").addEventListener("click", () => {
      reset();
      redraw();
    });
    tools.querySelector("[data-e1]").addEventListener("click", () => {
      state.v = [1.5, 0, 0];
      reset();
      redraw();
    });
    tools.querySelector("[data-e3]").addEventListener("click", () => {
      state.v = [0, 0, 1.5];
      reset();
      redraw();
    });

    function load(key) {
      state.key = key;
      state.v = preset().v.slice();
      scene.setCamera(preset().camera || { yaw: -0.85, pitch: 0.4 });
      reset();
      flow = K.predictFlow(gateHost, result, { ...preset().predict, onReveal: redraw });
      redraw();
    }
    K.chips(toolbar, Object.entries(KRYLOV_PRESETS).map(([k, v]) => [k, v.label]), load, state.key);
    load("j21");
    return () => {
      cancelAnimationFrame(flashAnim);
      scene.destroy();
    };
  }

  K.register("image-and-kernel", kernelLab);
  K.register("invariant-subspaces", invariantLab);
  K.register("minimal-polynomial", krylovLab);
})();


;/* visuals/ch7/mount.js */
/* Attach Chapter 7 renderers after the generic lesson shell is ready. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.renderLessonPage = function renderLessonPageWithChapter7(section, chapter) {
    window.teardownChapter7Lesson?.();
    baseRenderLessonPage(section, chapter);
    const owner = chapter || window.findStructuredSection?.(section?.id)?.chapter;
    if (owner?.id === "ch7") window.mountChapter7Lesson?.(section, document.querySelector("#mainContent"));
  };
})();

