/*
 * Chapter 7 static figures (inline SVG, themed through CSS tokens) and the
 * sections that only need theorem blocks: §1, §2 and §8 have no lab.
 */
(() => {
  const K = window.Ch7Kit;

  function arrow(x1, y1, x2, y2, cls, head = 9) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const bx = x2 - Math.cos(a) * head * 0.8;
    const by = y2 - Math.sin(a) * head * 0.8;
    const p1 = [x2 - Math.cos(a - 0.42) * head, y2 - Math.sin(a - 0.42) * head];
    const p2 = [x2 - Math.cos(a + 0.42) * head, y2 - Math.sin(a + 0.42) * head];
    return `<line x1="${x1}" y1="${y1}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" class="ch7f-stroke ${cls}"/><polygon points="${x2},${y2} ${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}" class="ch7f-fill ${cls}"/>`;
  }

  /* §1: a translation τ(α)=α+β₀ breaks additivity by exactly β₀. */
  function translationGap() {
    const O = [40, 226];
    const s = 56;
    const P = ([x, y]) => [O[0] + x * s, O[1] - y * s];
    const u = [2, 0.5];
    const v = [0.5, 1.5];
    const b = [0.75, 0.5];
    const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
    const uv = add(u, v);
    const tuv = add(uv, b);
    const sum = add(add(u, b), add(v, b));
    const A = (p, q, cls) => arrow(...P(p), ...P(q), cls);
    const T = (p, text, cls, dx = 8, dy = -8) => {
      const [x, y] = P(p);
      return `<text x="${x + dx}" y="${y + dy}" class="ch7f-text ${cls}">${text}</text>`;
    };
    let grid = "";
    for (let i = 0; i <= 5; i += 1) {
      const [x] = P([i, 0]);
      grid += `<line x1="${x}" y1="${P([0, 0])[1]}" x2="${x}" y2="${P([0, 3.6])[1]}" class="ch7f-grid"/>`;
    }
    for (let j = 0; j <= 3; j += 1) {
      const [, y] = P([0, j]);
      grid += `<line x1="${P([0, 0])[0]}" y1="${y}" x2="${P([5, 0])[0]}" y2="${y}" class="ch7f-grid"/>`;
    }
    return `<svg class="ch7f-svg" viewBox="0 0 360 250" role="img" aria-label="平移变换使两条计算路径相差 β₀">
      ${grid}
      ${A([0, 0], u, "is-muted")}${A([0, 0], v, "is-muted")}
      <line x1="${P(u)[0]}" y1="${P(u)[1]}" x2="${P(uv)[0]}" y2="${P(uv)[1]}" class="ch7f-stroke is-muted is-dash"/>
      <line x1="${P(v)[0]}" y1="${P(v)[1]}" x2="${P(uv)[0]}" y2="${P(uv)[1]}" class="ch7f-stroke is-muted is-dash"/>
      ${A([0, 0], tuv, "is-accent")}${A([0, 0], sum, "is-coral")}
      ${A(tuv, sum, "is-gold")}
      <circle cx="${P(uv)[0]}" cy="${P(uv)[1]}" r="3.5" class="ch7f-fill is-muted"/>
      ${T(u, "α", "is-muted", 6, 14)}${T(v, "β", "is-muted", -18, -4)}${T(uv, "α+β", "is-muted", 6, 16)}
      ${T(tuv, "τ(α+β)", "is-accent", -70, -10)}${T(sum, "τ(α)+τ(β)", "is-coral", -40, -12)}
      ${T([(tuv[0] + sum[0]) / 2, (tuv[1] + sum[1]) / 2], "差 β₀", "is-gold", 10, 10)}
    </svg>`;
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
