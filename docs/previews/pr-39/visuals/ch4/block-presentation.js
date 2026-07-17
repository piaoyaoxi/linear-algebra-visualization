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
      [metaRow("操作合法性", "CR₁ 必须和 R₂ 有相同的行列结构，才能相减。"), metaRow("怎样构造 E", "对分块单位矩阵执行同一个块行操作。"), metaRow("为什么还是左乘", "左侧矩阵的块行组合右侧矩阵的块行，所以改变的是块行。")].join(""),
      [definition("块初等矩阵", `对 ${inline("\\begin{pmatrix}I&0\\\\0&I\\end{pmatrix}")} 做块行操作 ${inline("R_2\\leftarrow R_2-CR_1")}，得到 ${inline("\\begin{pmatrix}I&0\\\\-C&I\\end{pmatrix}")}。`), definition("消去左下块", "当左下块恰好是 C 时，左乘这个 E 会把它变为 0；矩阵因此变成块上三角形式。"), definition("应用逻辑", "块上三角系统可以先解第一块，再代回第二块；这就是“块回代”。")].join(""),
      "和 §6 的关系",
      "§6 中的数字倍数在这里变成了矩阵 C。逻辑从来没有换：同一操作先作用于单位对象，再通过左乘作用于原系统。",
    );
  }

  const blockSteps = [
    { label: "第 1 步 / 3：识别耦合位置", note: `考虑 ${inline("x=f")} 与 ${inline("Cx+y=g")}。第二个方程含有 x，因此左下块 C 正在把两个变量组耦合起来。`, leftTitle: "分块方程组", left: "\\begin{pmatrix}I&0\\\\C&I\\end{pmatrix}\\begin{pmatrix}x\\\\y\\end{pmatrix}=\\begin{pmatrix}f\\\\g\\end{pmatrix}", rightTitle: "要消去的块", right: "\\begin{pmatrix}I&0\\\\\\color{#d46b4f}{C}&I\\end{pmatrix}", caption: "目标是把左下块 C 变成 0，让第二块方程不再含有 x。" },
    { label: "第 2 步 / 3：对分块单位矩阵做同一操作", note: `执行 ${inline("R_2\\leftarrow R_2-CR_1")}。对分块单位矩阵做这件事，得到块初等矩阵 E。`, leftTitle: "块初等矩阵 E", left: "E=\\begin{pmatrix}I&0\\\\-C&I\\end{pmatrix}", rightTitle: "同一条块行规则", right: "R_2\\leftarrow R_2-CR_1", caption: "这里的 C 是矩阵块；它的尺寸恰好让 CR₁ 能与 R₂ 相减。" },
    { label: "第 3 步 / 3：左乘 E，消去耦合块", note: `左乘 E 后，左下块变为 ${inline("-CI+IC=0")}；右端第二块也同步变为 ${inline("g-Cf")}。`, leftTitle: "消元后的系统", left: "\\begin{pmatrix}I&0\\\\0&I\\end{pmatrix}\\begin{pmatrix}x\\\\y\\end{pmatrix}=\\begin{pmatrix}f\\\\g-Cf\\end{pmatrix}", rightTitle: "按块读出解", right: "x=f,\\quad y=g-Cf", caption: "块消元把耦合系统化成两个可直接读取的块方程；这就是分块初等变换的一个完整应用。" },
  ];

  function blockStepView(index) {
    const step = blockSteps[index];
    return `<div class="block-stepper"><div class="block-progress">${step.label}</div><p class="block-caption">${step.note}</p><div class="block-system"><div class="block-system-card"><strong>${step.leftTitle}</strong>${display(step.left)}</div><div class="block-system-card"><strong>${step.rightTitle}</strong>${display(step.right)}</div></div><p class="block-caption">${step.caption}</p></div>`;
  }

  function renderSection7Interactive(section) {
    if (!section) return;
    let step = 0;
    section.innerHTML = `<h2>块消元演示</h2><div class="block-lab"><div class="block-lab-head"><h3>把左下块消成 0</h3><p>按三步走完一个耦合系统：先看到 C 在哪里，再构造 E，最后看 E 怎样让系统按块可解。</p></div><div class="block-lab-panel" data-block-step-panel>${blockStepView(step)}</div><div class="block-step-controls"><button type="button" class="button" data-block-prev disabled>上一步</button><button type="button" class="button primary" data-block-next>下一步</button><button type="button" class="button" data-block-reset>重新开始</button></div></div>`;
    const panel = section.querySelector("[data-block-step-panel]");
    const previous = section.querySelector("[data-block-prev]");
    const next = section.querySelector("[data-block-next]");
    const reset = section.querySelector("[data-block-reset]");
    const paint = () => {
      if (panel) panel.innerHTML = blockStepView(step);
      if (previous) previous.disabled = step === 0;
      if (next) { next.disabled = step === blockSteps.length - 1; next.textContent = step === blockSteps.length - 1 ? "已完成" : "下一步"; }
    };
    previous?.addEventListener("click", () => { if (step > 0) { step -= 1; paint(); } });
    next?.addEventListener("click", () => { if (step < blockSteps.length - 1) { step += 1; paint(); } });
    reset?.addEventListener("click", () => { step = 0; paint(); });
  }

  defineChapter4Renderer("block-matrices", { formal: renderSection5Formal, interactive: renderSection5Interactive });
  defineChapter4Renderer("block-elementary-applications", { formal: renderSection7Formal, interactive: renderSection7Interactive });
})();
