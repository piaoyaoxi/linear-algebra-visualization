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
