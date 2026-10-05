(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);
  const metaRow = (title, text) => `<div><dt>${title}</dt><dd>${text}</dd></div>`;
  const definition = (title, text) => `<article class="block-definition"><strong>${title}</strong><p>${text}</p></article>`;
  const formalShell = (title, intro, main, meta, definitions, noteTitle, noteText) => `<h2>${title}</h2><div class="block-formal"><p class="block-intro">${intro}</p><div class="block-map"><div class="block-map-main">${main}</div><dl class="block-meta">${meta}</dl></div><div class="block-definition-stack">${definitions}</div><div class="block-note"><strong>${noteTitle}</strong><p>${noteText}</p></div></div>`;

  function renderSection5Formal(formal) {
    if (!formal) return;
    formal.innerHTML = formalShell(
      "先定分组，再谈分块运算",
      "把一个大矩阵切成块之前，先要知道每一组行和列代表什么。只要分组一致，块可以像较大的元素那样参与加法、数乘和乘法；但尺寸不匹配时，块运算同样没有定义。",
      display("\\begin{pmatrix}A_{11}&A_{12}\\\\A_{21}&A_{22}\\end{pmatrix}\\begin{pmatrix}B_{11}&B_{12}\\\\B_{21}&B_{22}\\end{pmatrix}"),
      [metaRow("先看尺寸", "每个块本身都是矩阵；要相加或相乘，内部尺寸仍必须匹配。"), metaRow("块行乘块列", `${inline("(AB)_{ij}")} 来自 A 的第 i 个块行和 B 的第 j 个块列。`), metaRow("块对角", "非对角块为 0 时，不同部分互不影响，可以分别处理。")].join(""),
      [definition("分块来自结构", "一个合理的分块往往来自变量分组、方程组分组或子空间分解；它应该反映原问题的结构。"), definition("块乘法", `与普通行列乘法完全同构。例如 ${inline("(AB)_{12}=A_{11}B_{12}+A_{12}B_{22}")}。`), definition("块对角结构", "当非对角块为 0，前一组变量不影响后一组，反之也一样；求解与求逆都可以按块分开。")].join(""),
      "阅读顺序",
      "先找输出块的位置，再选 A 的对应块行和 B 的对应块列。不要一上来试图同时看四个块。",
    );
  }

  const blockTargets = {
    "11": { title: "输出块 C₁₁", formula: "C_{11}=A_{11}B_{11}+A_{12}B_{21}", row: ["A_{11}", "A_{12}"], col: ["B_{11}", "B_{21}"], result: "C_{11}", note: "取 A 的第一块行，再取 B 的第一块列；两段配对相乘后相加。" },
    "12": { title: "输出块 C₁₂", formula: "C_{12}=A_{11}B_{12}+A_{12}B_{22}", row: ["A_{11}", "A_{12}"], col: ["B_{12}", "B_{22}"], result: "C_{12}", note: "右上块只用 A 的第一块行和 B 的第二块列；参与配对的块由输出位置决定。" },
    "21": { title: "输出块 C₂₁", formula: "C_{21}=A_{21}B_{11}+A_{22}B_{21}", row: ["A_{21}", "A_{22}"], col: ["B_{11}", "B_{21}"], result: "C_{21}", note: "下左块对应 A 的第二块行与 B 的第一块列。" },
    "22": { title: "输出块 C₂₂", formula: "C_{22}=A_{21}B_{12}+A_{22}B_{22}", row: ["A_{21}", "A_{22}"], col: ["B_{12}", "B_{22}"], result: "C_{22}", note: "下右块对应 A 的第二块行与 B 的第二块列。" },
  };

  function grid(label, cells, sourceSet, result) {
    return `<div><div class="block-grid-label">${label}</div><div class="block-grid">${cells.map((cell) => `<span class="block-cell${sourceSet?.includes(cell) ? " is-source" : ""}${result === cell ? " is-result" : ""}">${inline(cell)}</span>`).join("")}</div></div>`;
  }

  function blockProductView(targetKey) {
    const target = blockTargets[targetKey];
    return `<h4>${target.title}</h4><p>${target.note}</p><div class="block-grid-wrap">${grid("矩阵 A", ["A_{11}", "A_{12}", "A_{21}", "A_{22}"], target.row)}<span class="block-grid-symbol">×</span>${grid("矩阵 B", ["B_{11}", "B_{12}", "B_{21}", "B_{22}"], target.col)}<span class="block-grid-symbol">→</span>${grid("结果 C=AB", ["C_{11}", "C_{12}", "C_{21}", "C_{22}"], [], target.result)}</div><div class="block-math">${display(target.formula)}</div><div class="block-explanation"><ul class="block-points"><li>高亮的两个 A 块来自同一块行。</li><li>高亮的两个 B 块来自同一块列。</li><li>这就是“块行乘块列”；普通矩阵的行列乘法并没有变。</li></ul></div>`;
  }

  function renderSection5Interactive(section) {
    if (!section) return;
    section.innerHTML = `<h2>块配对实验</h2><div class="block-lab"><div class="block-lab-head"><h3>一个输出块到底由谁算出来</h3><p>选择 C 的不同位置。页面会只高亮参与该输出块计算的那一块行和那一块列。</p></div><div class="block-choice-row"><button type="button" class="block-choice is-active" data-block-target="11">C₁₁</button><button type="button" class="block-choice" data-block-target="12">C₁₂</button><button type="button" class="block-choice" data-block-target="21">C₂₁</button><button type="button" class="block-choice" data-block-target="22">C₂₂</button></div><div class="block-lab-panel" data-block-product-panel>${blockProductView("11")}</div></div>`;
    section.querySelectorAll("[data-block-target]").forEach((button) => button.addEventListener("click", () => {
      const target = button.dataset.blockTarget;
      section.querySelectorAll("[data-block-target]").forEach((item) => item.classList.toggle("is-active", item === button));
      const panel = section.querySelector("[data-block-product-panel]");
      if (panel) panel.innerHTML = blockProductView(target);
    }));
  }

  function renderSection7Formal(formal) {
    if (!formal) return;
    formal.innerHTML = formalShell(
      "把“倍数”升级成矩阵块",
      "普通消元里可以用一行减去另一行的若干倍；分块消元里，可以用一整块行减去另一块行左乘合适矩阵后的结果。唯一新增的要求是：这个矩阵块的尺寸必须匹配。",
      display("R_2\\leftarrow R_2-CR_1"),
      [metaRow("操作合法性", "CR₁ 必须和 R₂ 有相同的行列结构，才能相减。"), metaRow("怎样构造 P", "对分块单位矩阵执行同一个块行操作。"), metaRow("为什么还是左乘", "左侧矩阵的块行组合右侧矩阵的块行，所以改变的是块行。")].join(""),
      [definition("块初等矩阵", `对 ${inline("\\begin{pmatrix}E&0\\\\0&E\\end{pmatrix}")} 做块行操作 ${inline("R_2\\leftarrow R_2-CR_1")}，得到 ${inline("\\begin{pmatrix}E&0\\\\-C&E\\end{pmatrix}")}。`), definition("消去左下块", "当左下块恰好是 C 时，左乘这个 P 会把它变为 0；矩阵因此变成块上三角形式。"), definition("应用逻辑", "块上三角系统可以先解第一块，再代回第二块；这就是“块回代”。")].join(""),
      "和 §6 的关系",
      "§6 中的数字倍数在这里变成了矩阵 C。逻辑从来没有换：同一操作先作用于单位对象，再通过左乘作用于原系统。",
    );
  }

  /*
   * §7 lab: the coupled system x = f, Cx + y = g with real 2×2 blocks.
   * The student picks the block X and left-multiplies by E = (I 0; X I):
   * the lower-left block becomes C + X and the right side g + Xf.
   * Only X = −C clears the coupling; then y = g − Cf can be read off.
   */
  const C7 = [[2, 1], [1, 1]]; // det C = 1, C⁻¹ = (1 −1; −1 2)
  const F7 = [1, -1];
  const G7 = [3, 2];
  const MULTIPLIERS = {
    negC: { label: "-C", X: [[-2, -1], [-1, -1]] },
    C: { label: "C", X: [[2, 1], [1, 1]] },
    negCinv: { label: "-C^{-1}", X: [[-1, 1], [1, -2]] },
    negI: { label: "-E", X: [[-1, 0], [0, -1]] },
  };
  const num = (v) => (v < 0 ? `−${-v}` : String(v));
  const add2 = (P, Q) => P.map((r, i) => r.map((v, j) => v + Q[i][j]));
  const apply2 = (P, v) => P.map((r) => r[0] * v[0] + r[1] * v[1]);
  const texM2 = (P) => `\\begin{pmatrix}${P.map((r) => r.join("&")).join("\\\\")}\\end{pmatrix}`;
  const texV2 = (v) => `\\begin{pmatrix}${v.join("\\\\")}\\end{pmatrix}`;

  // augmented [M | b] as 4 rows × 5 columns, with a class per cell role
  function augmented(lower, rhsLower) {
    const top = [[1, 0, 0, 0, F7[0]], [0, 1, 0, 0, F7[1]]];
    const bottom = [0, 1].map((i) => [lower[i][0], lower[i][1], i === 0 ? 1 : 0, i === 1 ? 1 : 0, rhsLower[i]]);
    return top.concat(bottom);
  }

  function augGrid(M, roles, was) {
    return `<table class="blk-grid bk7-grid"><tbody>${M.map((r, i) => `<tr class="${i === 1 ? "cut-below" : ""}">${r.map((v, j) => {
      const role = roles(i, j);
      const old = was?.[i]?.[j];
      const changed = old !== undefined && old !== v;
      const cls = [j === 1 ? "cut-right" : "", j === 3 ? "bk7-bar" : "", role, changed ? "is-new" : ""].filter(Boolean).join(" ");
      // the old value stays readable in (M | b) right beside; a changed cell is only tinted
      return `<td class="${cls}"><b>${num(v)}</b></td>`;
    }).join("")}</tr>`).join("")}</tbody></table>`;
  }

  function eGrid(X) {
    const E = [[1, 0, 0, 0], [0, 1, 0, 0], [X ? X[0][0] : "?", X ? X[0][1] : "?", 1, 0], [X ? X[1][0] : "?", X ? X[1][1] : "?", 0, 1]];
    return `<table class="blk-grid bk7-grid"><tbody>${E.map((r, i) => `<tr class="${i === 1 ? "cut-below" : ""}">${r.map((v, j) => `<td class="${[j === 1 ? "cut-right" : "", i > 1 && j < 2 ? "bk7-x" : ""].filter(Boolean).join(" ")}"><b>${typeof v === "number" ? num(v) : v}</b></td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }

  function renderSection7Interactive(section) {
    if (!section) return;
    const state = { pick: null, applied: null };
    section.innerHTML = `<h2>交互实验</h2>
      <section class="ch3l-lab bk7-lab">
        <header class="ch3l-head"><h3>用一次块行变换消去 C</h3><p>方程组 ${inline("x=f")}，${inline("Cx+y=g")} 中 x、y 各有两个分量。选一个 2×2 块 X，把第一块行左乘 X 后加到第二块行，也就是左乘 ${inline("P=\\begin{pmatrix}E&0\\\\X&E\\end{pmatrix}")}。</p></header>
        <div data-bk7-gate></div>
        <div class="blk-stage bk7-stage" data-bk7-stage></div>
        <div class="bk7-tools"><b class="bk7-tools-label">选 X</b><div class="ch3l-toolbar">${Object.entries(MULTIPLIERS).map(([k, m]) => `<button type="button" class="ch3l-chip" data-x="${k}">${inline(m.label)}</button>`).join("")}</div></div>
        <div class="ch3l-actions bk7-actions"><button type="button" class="ch3l-btn is-primary" data-bk7-apply>左乘 P</button><button type="button" class="ch3l-btn" data-bk7-reset>重来</button></div>
        <figure class="bk7-couple" data-bk7-couple aria-label="x 对 y 的耦合"></figure>
        <div class="ch3l-card bk7-readout" data-bk7-readout></div>
      </section>`;
    const stage = section.querySelector("[data-bk7-stage]");
    const readout = section.querySelector("[data-bk7-readout]");
    const lab = section.querySelector(".bk7-lab");
    const startAug = augmented(C7, G7);
    const roles = (lowerZero) => (i, j) => {
      if (j === 4) return i < 2 ? "bk7-f" : lowerZero === undefined ? "bk7-g" : "bk7-res";
      if (i > 1 && j < 2) return lowerZero ? "bk7-zero" : "bk7-c";
      return "";
    };

    /*
     * Coupling diagram: x → y through the lower-left block. The arrow's weight follows
     * ‖C+X‖ / ‖C‖ (Frobenius); it fades out at C+X=0 and turns red and thicker when the
     * coupling grows (X = C gives 2C).
     */
    const couple = section.querySelector("[data-bk7-couple]");
    const norm = (P) => Math.hypot(...P.flat());
    function paintCouple(lower, label) {
      const k = norm(lower) / norm(C7);
      const zero = k === 0;
      const grow = k > 1 + 1e-9;
      const width = zero ? 1.2 : 1.6 + 2.4 * Math.min(k, 2);
      const tone = zero ? "is-zero" : grow ? "is-grow" : "";
      const head = zero ? "" : `<path class="bk7-link-head ${tone}" d="M246 44 l-${8 + width} -${4 + width / 2} v${8 + width} z"></path>`;
      couple.innerHTML = `<svg viewBox="0 0 320 96" role="img" aria-label="${zero ? "x 不再影响 y" : "x 通过左下块影响 y"}">
        <circle class="bk7-node is-x" cx="46" cy="44" r="20"></circle><text class="bk7-node-name" x="46" y="49" text-anchor="middle">x</text>
        <circle class="bk7-node is-y" cx="274" cy="44" r="20"></circle><text class="bk7-node-name" x="274" y="49" text-anchor="middle">y</text>
        <text class="bk7-node-note" x="46" y="86" text-anchor="middle">x = f</text>
        <text class="bk7-node-note" x="274" y="86" text-anchor="middle">${zero ? "y = g − Cf" : "y 还含 x"}</text>
        <line class="bk7-link ${tone}" x1="72" y1="44" x2="${zero ? 246 : 238}" y2="44" style="stroke-width:${width};opacity:${zero ? 0.3 : Math.min(1, 0.35 + 0.65 * k)}" ${zero ? 'stroke-dasharray="4 4"' : ""}></line>
        ${head}
        <text class="bk7-link-label ${tone}" x="160" y="30" text-anchor="middle">${label}</text>
      </svg>`;
    }

    function paint() {
      const m = state.pick ? MULTIPLIERS[state.pick] : null;
      section.querySelectorAll("[data-x]").forEach((b) => b.classList.toggle("is-active", b.dataset.x === state.pick));
      const before = `<div class="blk-mat"><span>${inline("(M\\mid b)")}</span>${augGrid(startAug, roles(undefined))}</div>`;
      if (!state.applied) {
        stage.innerHTML = `<div class="blk-mat"><span>${inline(m ? `P,\\ X=${m.label}` : "P")}</span>${eGrid(m ? m.X : null)}</div><b class="blk-op">×</b>${before}`;
        readout.innerHTML = `<div class="bk7-head"><b>左下块</b><strong>${inline("C")}</strong></div><p>第二个方程 ${inline("Cx+y=g")} 同时含有 x 和 y，两组未知量耦合在一起。选好 X 后按“左乘 P”。</p>`;
        paintCouple(C7, "C");
        return;
      }
      const a = MULTIPLIERS[state.applied];
      const lower = add2(C7, a.X);
      const rhs = G7.map((v, i) => v + apply2(a.X, F7)[i]);
      const zero = lower.every((r) => r.every((v) => v === 0));
      const after = augmented(lower, rhs);
      paintCouple(lower, zero ? "C+X = 0" : state.applied === "C" ? "C+X = 2C" : "C+X ≠ 0");
      stage.innerHTML = `<div class="blk-mat"><span>${inline(`P,\\ X=${a.label}`)}</span>${eGrid(a.X)}</div><b class="blk-op">×</b>${before}<b class="blk-op">=</b><div class="blk-mat"><span>${inline("P(M\\mid b)")}</span>${augGrid(after, roles(zero), startAug)}</div>`;
      readout.innerHTML = zero
        ? `<div class="bk7-head"><b>左下块</b><strong class="ch3l-ok">${inline("C+X=0")}</strong></div><p>第二块方程不再含 x，两组未知量分开了：</p><div class="blk-math">${display(`x=f=${texV2(F7)},\\qquad y=g-Cf=${texV2(rhs)}`)}</div>`
        : `<div class="bk7-head"><b>左下块</b><strong class="ch3l-bad">${inline(`C+X=${texM2(lower)}`)}</strong></div><p>左下块没有变成 0，第二块方程仍含 x：${inline(`${texM2(lower)}x+y=${texV2(rhs)}`)}。换一个 X 再试。</p>`;
    }

    const gate = window.LAPredictGate?.mount(section.querySelector("[data-bk7-gate]"), {
      root: lab,
      manual: true,
      key: "visuals/ch4/block-presentation.js#s7",
      question: `要让左下块 C 变成 0，第二块行应加上第一块行左乘哪个块 X？`,
      options: [
        [inline("X=-C"), true, ""],
        [inline("X=C"), false, "左下块变成 C+C=2C，耦合反而加倍。"],
        [inline("X=-C^{-1}"), false, `左下块变成 ${inline("C-C^{-1}")}，一般不为 0。`],
        [inline("X=-E"), false, `左下块变成 ${inline("C-E")}，只有 C=E 时才为 0。`],
      ],
      right: `✓ 左下块变成 ${inline("C-C=0")}，右端变成 ${inline("g-Cf")}。普通消元里的倍数，在这里换成了矩阵块 ${inline("-C")}，乘在第一块行的左边。`,
    });

    section.querySelectorAll("[data-x]").forEach((b) => b.addEventListener("click", () => {
      state.pick = b.dataset.x;
      state.applied = null;
      paint();
    }));
    section.querySelector("[data-bk7-apply]").addEventListener("click", () => {
      if (!state.pick) return;
      state.applied = state.pick;
      paint();
      gate?.acted();
    });
    section.querySelector("[data-bk7-reset]").addEventListener("click", () => {
      state.applied = null;
      paint();
    });
    paint();
  }

  defineChapter4Renderer("block-matrices", { formal: renderSection5Formal, interactive: renderSection5Interactive });
  defineChapter4Renderer("block-elementary-applications", { formal: renderSection7Formal, interactive: renderSection7Interactive });
})();
