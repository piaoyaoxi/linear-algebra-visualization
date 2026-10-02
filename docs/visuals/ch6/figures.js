/*
 * Chapter 6 static figures (no interaction): mapping diagrams, the space
 * gallery, subspace curve families, and the extra views used by §6 and §7.
 */
(() => {
  const K = () => window.Ch6Kit;
  const tex = (s) => K().tex(s);

  /* ---------- §1 three small mapping diagrams ---------- */

  let markerSeq = 0;
  function miniMap({ left, right, map, caption, verdict }) {
    const W = 230;
    const rowH = 34;
    const rows = Math.max(left.length, right.length);
    const H = rows * rowH + 24;
    const yAt = (i, n) => 12 + (H - 24 - n * rowH) / 2 + i * rowH + rowH / 2;
    const id = `ch6map${(markerSeq += 1)}`;
    const hits = right.map((_, j) => map.filter((t) => t === j).length);
    const parts = [`<defs><marker id="${id}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--muted)"/></marker></defs>`];
    parts.push(`<rect x="6" y="4" width="74" height="${H - 8}" rx="12" class="ch6m-set"/><rect x="${W - 80}" y="4" width="74" height="${H - 8}" rx="12" class="ch6m-set"/>`);
    map.forEach((t, i) => {
      const y1 = yAt(i, left.length);
      const y2 = yAt(t, right.length);
      parts.push(`<path d="M 64 ${y1} C 110 ${y1}, 120 ${y2}, ${W - 70} ${y2}" class="ch6m-edge${hits[t] > 1 ? " is-hot" : ""}" marker-end="url(#${id})"/>`);
    });
    left.forEach((label, i) => {
      const y = yAt(i, left.length);
      parts.push(`<rect x="20" y="${y - 12}" width="44" height="24" rx="7" class="ch6m-node"/><text x="42" y="${y + 4.5}" text-anchor="middle" class="ch6m-text">${label}</text>`);
    });
    right.forEach((label, j) => {
      const y = yAt(j, right.length);
      const cls = hits[j] === 0 ? " is-missed" : hits[j] > 1 ? " is-hot" : "";
      parts.push(`<rect x="${W - 66}" y="${y - 12}" width="44" height="24" rx="7" class="ch6m-node${cls}"/><text x="${W - 44}" y="${y + 4.5}" text-anchor="middle" class="ch6m-text">${label}</text>`);
    });
    return `<div class="ch6f-card"><svg viewBox="0 0 ${W} ${H}" class="ch6m-svg" role="img" aria-label="${caption}">${parts.join("")}</svg><h4>${caption}</h4><p>${verdict}</p></div>`;
  }

  K().defineFigure("maps", () => `<div class="ch6f-grid is-three">
      ${miniMap({ left: ["1", "2", "3"], right: ["a", "b", "c", "d"], map: [0, 1, 2], caption: "单射，不满射", verdict: "没有两个元素撞到同一个像；d 没有原像。" })}
      ${miniMap({ left: ["1", "2", "3", "4"], right: ["a", "b", "c"], map: [0, 1, 2, 0], caption: "满射，不单射", verdict: "每个输出都被取到；1 和 4 撞到同一个 a。" })}
      ${miniMap({ left: ["1", "2", "3"], right: ["a", "b", "c"], map: [1, 2, 0], caption: "双射", verdict: "每个输出恰有一个原像，箭头可以整体反过来。" })}
    </div>
    <figcaption>${tex("X")} 在左、${tex("Y")} 在右。有限集元素个数相等时，单射与满射同时成立或同时不成立。</figcaption>`);

  /* ---------- §2 gallery: pointwise sums and the space R+ ---------- */

  function functionSum() {
    const f = (x) => 0.5 * x + 1;
    const g = (x) => 1.2 - 0.5 * x * x;
    const h = (x) => f(x) + g(x);
    const bars = [-1.2, 0.9].flatMap((x) => [
      { a: [x - 0.05, 0], b: [x - 0.05, f(x)], color: "v1", width: 4 },
      { a: [x + 0.05, f(x)], b: [x + 0.05, h(x)], color: "v2", width: 4 },
    ]);
    return K().plot({
      x: [-2.2, 2.2],
      y: [-2.2, 2.8],
      width: 420,
      height: 260,
      label: "两个函数逐点相加",
      vlines: [{ x: -1.2, color: "faint", opacity: 0.4 }, { x: 0.9, color: "faint", opacity: 0.4 }],
      curves: [
        { f, color: "v1", width: 2 },
        { f: g, color: "v2", width: 2 },
        { f: h, color: "image", width: 3 },
      ],
      segments: bars,
      labels: [
        { x: 1.75, y: f(1.75) + 0.3, text: "f", color: "v1" },
        { x: -2.1, y: g(-2.1) + 0.55, text: "g", color: "v2" },
        { x: 1.45, y: h(1.45) + 0.45, text: "f+g", color: "image" },
      ],
    });
  }

  function positiveReals() {
    const W = 420;
    const H = 170;
    const L = (a) => 40 + ((Math.log2(a) + 2) / 5) * (W - 80); // log scale, 1/4 … 8
    const ticks = [0.25, 0.5, 1, 2, 3, 4, 6, 8];
    const y = 110;
    const tickLabel = { 0.25: "1/4", 0.5: "1/2" };
    const parts = [`<line x1="30" y1="${y}" x2="${W - 20}" y2="${y}" class="ch6p-axis"/>`];
    ticks.forEach((t) => {
      parts.push(`<line x1="${L(t)}" y1="${y - 5}" x2="${L(t)}" y2="${y + 5}" class="ch6p-axis"/><text x="${L(t)}" y="${y + 22}" text-anchor="middle" class="ch6p-tick">${tickLabel[t] || t}</text>`);
    });
    const arrow = (from, to, lift, color, label) => {
      const x1 = L(from);
      const x2 = L(to);
      const mid = (x1 + x2) / 2;
      return `<path d="M ${x1} ${y - 8} Q ${mid} ${y - 8 - lift} ${x2} ${y - 8}" fill="none" style="stroke:var(--${color});stroke-width:2.4"/><circle cx="${x2}" cy="${y - 8}" r="3.6" style="fill:var(--${color})"/><text x="${mid}" y="${y - 12 - lift / 2}" text-anchor="middle" class="ch6p-label" style="fill:var(--${color})">${label}</text>`;
    };
    parts.push(arrow(1, 2, 34, "cv-v1", "2"));
    parts.push(arrow(2, 6, 46, "cv-v2", "⊕3"));
    parts.push(arrow(1, 0.5, 30, "cv-image", "2 的负向量"));
    parts.push(`<circle cx="${L(1)}" cy="${y}" r="6" style="fill:var(--surface-solid);stroke:var(--text);stroke-width:2.4"/><text x="${L(1)}" y="${y + 40}" text-anchor="middle" class="ch6p-label" style="fill:var(--text)">零向量 1</text>`);
    return `<svg class="ch6p-plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="正实数在对数刻度上的加法">${parts.join("")}</svg>`;
  }

  K().defineFigure("gallery", () => `<div class="ch6f-grid">
      <div class="ch6f-card">${functionSum()}<h4>函数也是向量</h4><p>${tex("(f+g)(x)=f(x)+g(x)")}：在每个 ${tex("x")} 处把两段高度接起来。${tex("P[x]_n")}、${tex("C[a,b]")} 都按这种方式相加。</p></div>
      <div class="ch6f-card">${positiveReals()}<h4>${tex("\\mathbb R^+")}：乘法充当加法</h4><p>规定 ${tex("a\\oplus b=ab")}，${tex("k\\circ a=a^k")}。按对数刻度画，${tex("\\oplus")} 变成长度相接：${tex("2\\oplus3=6")}，零向量是 1，2 的负向量是 ${tex("\\tfrac12")}。</p></div>
    </div>`);

  /* ---------- §5 curve families through a fixed point ---------- */

  K().defineFigure("curve-families", () => {
    const zero = K().plot({
      x: [-2, 2.6],
      y: [-3, 3],
      width: 400,
      height: 260,
      label: "满足 p(1)=0 的多项式",
      vlines: [{ x: 1, color: "faint", opacity: 0.45 }],
      curves: [
        { f: (x) => x - 1, color: "v1", width: 2 },
        { f: (x) => 1 - x * x, color: "v2", width: 2 },
        { f: (x) => x - x * x, color: "image", width: 3 },
      ],
      points: [{ x: 1, y: 0, color: "image", r: 5.5, label: "(1,0)", dx: 8, dy: 16 }],
      labels: [
        { x: 2.05, y: 1.45, text: "p", color: "v1" },
        { x: -1.9, y: -2.4, text: "q", color: "v2" },
        { x: 1.72, y: -0.7, text: "p+q", color: "image" },
      ],
    });
    const one = K().plot({
      x: [-2, 2.6],
      y: [-1, 5],
      width: 400,
      height: 260,
      label: "满足 p(1)=1 的多项式",
      vlines: [{ x: 1, color: "faint", opacity: 0.45 }],
      curves: [
        { f: (x) => x, color: "v1", width: 2 },
        { f: (x) => x * x, color: "v2", width: 2 },
        { f: (x) => x + x * x, color: "image", width: 3 },
      ],
      points: [
        { x: 1, y: 1, color: "muted", r: 5, hollow: true, label: "(1,1)", dx: 10, dy: 14 },
        { x: 1, y: 2, color: "image", r: 5.5, label: "(1,2)", dx: -8, dy: -8, anchor: "end" },
      ],
      labels: [
        { x: 2.2, y: 1.7, text: "p", color: "v1" },
        { x: -1.95, y: 3.2, text: "q", color: "v2" },
        { x: 1.55, y: 4.4, text: "p+q", color: "image" },
      ],
    });
    return `<div class="ch6f-grid">
      <div class="ch6f-card">${zero}<h4>${tex("W_0=\\{p\\in P[x]_3:p(1)=0\\}")}</h4><p>曲线都过 ${tex("(1,0)")}。两条相加、乘任意数，仍过这一点：${tex("W_0")} 是子空间。</p></div>
      <div class="ch6f-card">${one}<h4>${tex("W_1=\\{p\\in P[x]_3:p(1)=1\\}")}</h4><p>曲线都过 ${tex("(1,1)")}，相加后却过 ${tex("(1,2)")}，离开了 ${tex("W_1")}；它也不含零多项式。</p></div>
    </div>`;
  });

  /* ---------- §6 static view: U ∩ W in P[x]_4 ---------- */

  K().defineFigure("intersection-curves", () => {
    const svg = K().plot({
      x: [-2.2, 2.2],
      y: [-3, 3],
      width: 520,
      height: 250,
      label: "同时过 (1,0) 与 (-1,0) 的多项式",
      vlines: [{ x: 1, color: "v1", opacity: 0.35 }, { x: -1, color: "v2", opacity: 0.35 }],
      curves: [
        { f: (x) => 0.5 * (x - 1) * (x + 2), color: "v1", width: 2 },
        { f: (x) => 0.5 * (x + 1) * (x - 2), color: "v2", width: 2 },
        { f: (x) => x * x - 1, color: "subspace", width: 3 },
        { f: (x) => x * (x * x - 1), color: "subspace", width: 3, opacity: 0.6 },
      ],
      points: [
        { x: 1, y: 0, color: "text", r: 4.5 },
        { x: -1, y: 0, color: "text", r: 4.5 },
      ],
      labels: [
        { x: 1.6, y: 2.25, text: "U 中", color: "v1" },
        { x: -2.1, y: 2.25, text: "W 中", color: "v2" },
        { x: 1.55, y: -1.1, text: "U∩W 中", color: "subspace" },
      ],
    });
    return `<div class="ch6f-card is-wide">${svg}<p>${tex("P[x]_4")} 中 ${tex("U=\\{p:p(1)=0\\}")}，${tex("W=\\{p:p(-1)=0\\}")}。交里的曲线同时过两个点，恰好是 ${tex("(x^2-1)(a+bx)")}。</p></div>`;
  });

  /* ---------- §7 static view: even ⊕ odd ---------- */

  K().defineFigure("even-odd", () => {
    const svg = K().plot({
      x: [-2.2, 2.2],
      y: [-4, 6],
      width: 520,
      height: 250,
      ystep: 2,
      label: "e^x 分解为偶函数与奇函数",
      curves: [
        { f: Math.exp, color: "text", width: 3 },
        { f: Math.cosh, color: "v1", width: 2.2 },
        { f: Math.sinh, color: "v2", width: 2.2 },
      ],
      labels: [
        { x: 1.25, y: 5.3, text: "eˣ", color: "text" },
        { x: -2.15, y: 4.9, text: "cosh x（偶）", color: "v1" },
        { x: -2.1, y: -3.4, text: "sinh x（奇）", color: "v2" },
      ],
    });
    return `<div class="ch6f-card is-wide">${svg}<p>全体实函数构成的空间，是偶函数子空间与奇函数子空间的直和：${tex("f(x)=\\frac{f(x)+f(-x)}2+\\frac{f(x)-f(-x)}2")}。既偶又奇的函数只有 0，所以分解唯一；${tex("e^x=\\cosh x+\\sinh x")}。</p></div>`;
  });
})();
