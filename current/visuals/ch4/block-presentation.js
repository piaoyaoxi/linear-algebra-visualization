(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);

  const conceptCard = (index, title, text) => `
    <article class="matrix-concept-card" data-index="${index}">
      <span class="matrix-concept-index">0${index}</span>
      <div><strong>${title}</strong><p>${text}</p></div>
    </article>`;

  const tabButton = (id, label, active = false) => `
    <button class="matrix-workbench-tab${active ? " is-active" : ""}" type="button"
      role="tab" aria-selected="${active}" data-workbench-tab="${id}">${label}</button>`;

  function bindTabs(root) {
    const tabs = [...root.querySelectorAll("[data-workbench-tab]")];
    const panels = [...root.querySelectorAll("[data-workbench-panel]")];
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.dataset.workbenchTab;
        tabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-selected", String(active));
        });
        panels.forEach((panel) => {
          panel.hidden = panel.dataset.workbenchPanel !== id;
        });
      });
    });
  }

  function renderSection5Formal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>核心讲解</h2>
      <div class="matrix-lesson-formal block-formal-v2">
        <header class="matrix-formal-hero">
          <div>
            <span class="matrix-formal-kicker">先确定分组，再让块参与运算</span>
            <h3>分块是带尺寸的阅读方式</h3>
            <p>切割不会改变矩阵。真正改变的是我们能否看见输入组、输出组和子系统之间的联系。</p>
          </div>
          <div class="matrix-formal-equation">${display("A=\\begin{pmatrix}A_{11}&A_{12}\\\\A_{21}&A_{22}\\end{pmatrix}")}</div>
        </header>
        <div class="matrix-concept-grid matrix-concept-grid-five">
          ${conceptCard(1, "完整切割", "一条切割线贯穿完整行或列，每个块才能拥有确定的行数与列数。")}
          ${conceptCard(2, "运算兼容", "逐块相加要求相同切法；块乘法要求相邻的内部尺寸一致。")}
          ${conceptCard(3, "转置两步", `块位置关于主对角线交换，每个块内部再转置。`)}
          ${conceptCard(4, "块行乘块列", `${inline("C_{ij}")} 只读取 A 的第 i 块行和 B 的第 j 块列。`)}
          ${conceptCard(5, "结构可见", "块对角表示互不耦合；块上三角表示单向依赖。")}
        </div>
        <div class="matrix-formal-rule">
          <span>阅读规则</span>
          <p>先读结果块下标，再找对应块行和块列，最后逐项检查尺寸。这个顺序能避免同时盯住全部块。</p>
        </div>
      </div>`;
  }

  const CUT_VALUES = [
    [2, 1, 0, 4, 3, 1],
    [0, 3, 2, 1, 5, 2],
    [4, 2, 1, 0, 2, 3],
    [1, 5, 3, 2, 1, 0],
  ];

  function cutterGrid(rowCut, colCut, compact = false) {
    const cells = CUT_VALUES.flatMap((row, rowIndex) => row.map((value, colIndex) => {
      const blockRow = rowIndex < rowCut ? 1 : 2;
      const blockCol = colIndex < colCut ? 1 : 2;
      const classes = ["block-cutter-cell", `is-block-${blockRow}${blockCol}`];
      if (rowIndex === rowCut - 1) classes.push("is-row-cut");
      if (colIndex === colCut - 1) classes.push("is-col-cut");
      return `<span class="${classes.join(" ")}">${compact ? "" : value}</span>`;
    })).join("");
    return `<div class="block-cutter-grid${compact ? " is-compact" : ""}" style="--matrix-rows:4;--matrix-cols:6">${cells}</div>`;
  }

  function cutterSizes(rowCut, colCut) {
    return [
      ["A₁₁", rowCut, colCut],
      ["A₁₂", rowCut, 6 - colCut],
      ["A₂₁", 4 - rowCut, colCut],
      ["A₂₂", 4 - rowCut, 6 - colCut],
    ].map(([label, rows, cols]) => `<span><strong>${label}</strong>${rows} × ${cols}</span>`).join("");
  }

  function cutterView(rowCut, colCut, compatible) {
    const partnerRow = compatible ? rowCut : Math.min(3, rowCut + 1);
    const partnerCol = compatible ? colCut : Math.max(1, colCut - 1);
    return `
      <div class="block-cutter-stage">
        <div class="block-cutter-primary">
          <div class="matrix-stage-label"><span>原矩阵 A · 4 × 6</span><strong>切割线只能沿完整行列移动</strong></div>
          ${cutterGrid(rowCut, colCut)}
          <div class="block-size-strip">${cutterSizes(rowCut, colCut)}</div>
        </div>
        <aside class="block-compatibility-card${compatible ? " is-valid" : " is-invalid"}">
          <span class="matrix-stage-label">候选矩阵 B 的切法</span>
          ${cutterGrid(partnerRow, partnerCol, true)}
          <strong>${compatible ? "可以逐块相加" : "逐块相加被锁定"}</strong>
          <p>${compatible ? "A 与 B 的行列分组完全一致，对应块同型。" : "总尺寸相同仍不够：对应块的边界没有对齐。"}</p>
        </aside>
      </div>`;
  }

  const PRODUCT_TARGETS = {
    "11": {
      title: "C₁₁ · 2 × 1",
      row: ["A11", "A12"], col: ["B11", "B21"], result: "C11",
      formula: "C_{11}=A_{11}B_{11}+A_{12}B_{21}",
      dimensions: "(2\\times2)(2\\times1)+(2\\times2)(2\\times1)\\to2\\times1",
      note: "第一块行与第一块列配对。两个乘积都得到 2×1，才能继续相加。",
    },
    "12": {
      title: "C₁₂ · 2 × 2",
      row: ["A11", "A12"], col: ["B12", "B22"], result: "C12",
      formula: "C_{12}=A_{11}B_{12}+A_{12}B_{22}",
      dimensions: "(2\\times2)(2\\times2)+(2\\times2)(2\\times2)\\to2\\times2",
      note: "第一块行与第二块列配对。输出位置只决定块行与块列，不改变乘法顺序。",
    },
    "21": {
      title: "C₂₁ · 1 × 1",
      row: ["A21", "A22"], col: ["B11", "B21"], result: "C21",
      formula: "C_{21}=A_{21}B_{11}+A_{22}B_{21}",
      dimensions: "(1\\times2)(2\\times1)+(1\\times2)(2\\times1)\\to1\\times1",
      note: "第二块行与第一块列配对，块的形状随外侧尺寸变成 1×1。",
    },
    "22": {
      title: "C₂₂ · 1 × 2",
      row: ["A21", "A22"], col: ["B12", "B22"], result: "C22",
      formula: "C_{22}=A_{21}B_{12}+A_{22}B_{22}",
      dimensions: "(1\\times2)(2\\times2)+(1\\times2)(2\\times2)\\to1\\times2",
      note: "第二块行与第二块列配对；外侧的 1 和 2 决定结果块尺寸。",
    },
  };

  const BLOCK_LAYOUTS = {
    A: { cols: "1fr 1fr", rows: "2fr 1fr", cells: [["A11", "A₁₁", "2 × 2"], ["A12", "A₁₂", "2 × 2"], ["A21", "A₂₁", "1 × 2"], ["A22", "A₂₂", "1 × 2"]] },
    B: { cols: "1fr 2fr", rows: "1fr 1fr", cells: [["B11", "B₁₁", "2 × 1"], ["B12", "B₁₂", "2 × 2"], ["B21", "B₂₁", "2 × 1"], ["B22", "B₂₂", "2 × 2"]] },
    C: { cols: "1fr 2fr", rows: "2fr 1fr", cells: [["C11", "C₁₁", "2 × 1"], ["C12", "C₁₂", "2 × 2"], ["C21", "C₂₁", "1 × 1"], ["C22", "C₂₂", "1 × 2"]] },
  };

  function proportionalBlockMatrix(name, sourceKeys = [], resultKey = "") {
    const layout = BLOCK_LAYOUTS[name];
    const cells = layout.cells.map(([key, label, size]) => {
      const classes = ["proportional-block"];
      if (sourceKeys.includes(key)) classes.push("is-source");
      if (key === resultKey) classes.push("is-result");
      return `<span class="${classes.join(" ")}"><strong>${label}</strong><small>${size}</small></span>`;
    }).join("");
    return `<div class="proportional-matrix-wrap"><strong>${name}${name === "C" ? " = AB" : ""}</strong><div class="proportional-matrix" style="grid-template-columns:${layout.cols};grid-template-rows:${layout.rows}">${cells}</div></div>`;
  }

  function productView(key) {
    const target = PRODUCT_TARGETS[key];
    return `
      <div class="block-product-copy"><span>当前输出块</span><strong>${target.title}</strong><p>${target.note}</p></div>
      <div class="block-product-stage">
        ${proportionalBlockMatrix("A", target.row)}<span class="matrix-operation-symbol">×</span>
        ${proportionalBlockMatrix("B", target.col)}<span class="matrix-operation-symbol">→</span>
        ${proportionalBlockMatrix("C", [], target.result)}
      </div>
      <div class="block-product-equations">
        <div>${display(target.formula)}</div>
        <div class="dimension-equation">${display(target.dimensions)}</div>
      </div>`;
  }

  function structureView(mode) {
    if (mode === "upper") {
      return `
        <div class="structure-equation">${display("\\begin{pmatrix}A&B\\\\0&D\\end{pmatrix}\\begin{pmatrix}x_1\\\\x_2\\end{pmatrix}=\\begin{pmatrix}Ax_1+Bx_2\\\\Dx_2\\end{pmatrix}")}</div>
        <div class="dependency-map is-upper">
          <span class="dependency-node input-one">x₁</span><span class="dependency-node input-two">x₂</span>
          <span class="dependency-node output-one">y₁</span><span class="dependency-node output-two">y₂</span>
          <svg viewBox="0 0 520 180" aria-hidden="true"><path d="M92 48 C220 48 250 48 420 48"/><path d="M92 132 C235 132 270 132 420 132"/><path class="cross-link" d="M92 132 C230 132 275 56 420 48"/></svg>
        </div>
        <p>第二组输入 x₂ 同时影响 y₂ 和 y₁；第一组输入 x₁ 只影响 y₁。依赖具有方向，因此可以先处理下面的块方程。</p>`;
    }
    if (mode === "transpose") {
      return `
        <div class="block-transpose-stage">
          <div>${display("A=\\begin{pmatrix}A_{11}&A_{12}\\\\A_{21}&A_{22}\\end{pmatrix}")}</div>
          <span class="transpose-arrow">位置交换<br><b>+</b><br>内部转置</span>
          <div>${display("A^T=\\begin{pmatrix}A_{11}^T&A_{21}^T\\\\A_{12}^T&A_{22}^T\\end{pmatrix}")}</div>
        </div>
        <p>右上块 A₁₂ 移到左下位置，同时变成 A₁₂ᵀ。只交换大块而忽略内部转置，会得到错误结果。</p>`;
    }
    return `
      <div class="structure-equation">${display("\\begin{pmatrix}A&0\\\\0&D\\end{pmatrix}\\begin{pmatrix}x_1\\\\x_2\\end{pmatrix}=\\begin{pmatrix}Ax_1\\\\Dx_2\\end{pmatrix}")}</div>
      <div class="dependency-map">
        <span class="dependency-node input-one">x₁</span><span class="dependency-node input-two">x₂</span>
        <span class="dependency-node output-one">y₁</span><span class="dependency-node output-two">y₂</span>
        <svg viewBox="0 0 520 180" aria-hidden="true"><path d="M92 48 C220 48 250 48 420 48"/><path d="M92 132 C235 132 270 132 420 132"/></svg>
      </div>
      <p>两条通路彼此独立。矩阵幂、求解以及可逆时的逆矩阵都可以按两个对角块分别处理。</p>`;
  }

  function renderSection5Interactive(interactive) {
    if (!interactive) return;
    let rowCut = 2;
    let colCut = 3;
    let compatible = true;
    interactive.innerHTML = `
      <h2>可视化实验</h2>
      <div class="matrix-workbench block-workbench" data-section5-workbench>
        <header class="matrix-workbench-head">
          <div><span class="matrix-formal-kicker">BLOCK STRUCTURE WORKBENCH</span><h3>从切割线走到结构矩阵</h3></div>
          <p>三个视图共用同一条规则：任何高亮和公式都必须带着尺寸。</p>
        </header>
        <div class="matrix-workbench-tabs" role="tablist">
          ${tabButton("cutter", "01 · 分块切割器", true)}
          ${tabButton("product", "02 · 块乘法透镜")}
          ${tabButton("structure", "03 · 结构与转置")}
        </div>
        <section class="matrix-workbench-panel" data-workbench-panel="cutter">
          <div class="workbench-question"><span>观察任务</span><strong>移动切割线后，四个块的尺寸怎样联动？总尺寸相同是否足以逐块相加？</strong></div>
          <div class="block-cutter-controls">
            <label>横向切在第 <output data-row-cut-output>2</output> 行后<input type="range" min="1" max="3" value="2" data-row-cut /></label>
            <label>纵向切在第 <output data-col-cut-output>3</output> 列后<input type="range" min="1" max="5" value="3" data-col-cut /></label>
            <div class="segmented-control" aria-label="候选矩阵切法">
              <button type="button" class="is-active" data-compatibility="match">相同切法</button>
              <button type="button" data-compatibility="mismatch">不同切法</button>
            </div>
          </div>
          <div data-cutter-stage>${cutterView(rowCut, colCut, compatible)}</div>
        </section>
        <section class="matrix-workbench-panel" data-workbench-panel="product" hidden>
          <div class="workbench-question"><span>观察任务</span><strong>选择 C 的一个块，只追踪真正参与计算的块行、块列和内部尺寸。</strong></div>
          <div class="block-target-picker" aria-label="选择结果块">
            ${["11", "12", "21", "22"].map((key) => `<button type="button" class="${key === "12" ? "is-active" : ""}" data-product-target="${key}">C<sub>${key}</sub></button>`).join("")}
          </div>
          <div class="block-product-view" data-product-view>${productView("12")}</div>
        </section>
        <section class="matrix-workbench-panel" data-workbench-panel="structure" hidden>
          <div class="workbench-question"><span>观察任务</span><strong>比较零块的位置：它在控制哪些输入可以影响哪些输出？</strong></div>
          <div class="structure-mode-picker">
            <button type="button" class="is-active" data-structure-mode="diagonal">块对角</button>
            <button type="button" data-structure-mode="upper">块上三角</button>
            <button type="button" data-structure-mode="transpose">分块转置</button>
          </div>
          <div class="structure-view" data-structure-view>${structureView("diagonal")}</div>
        </section>
      </div>`;

    const root = interactive.querySelector("[data-section5-workbench]");
    bindTabs(root);
    const paintCutter = () => {
      root.querySelector("[data-row-cut-output]").value = rowCut;
      root.querySelector("[data-col-cut-output]").value = colCut;
      root.querySelector("[data-cutter-stage]").innerHTML = cutterView(rowCut, colCut, compatible);
    };
    root.querySelector("[data-row-cut]").addEventListener("input", (event) => { rowCut = Number(event.target.value); paintCutter(); });
    root.querySelector("[data-col-cut]").addEventListener("input", (event) => { colCut = Number(event.target.value); paintCutter(); });
    root.querySelectorAll("[data-compatibility]").forEach((button) => button.addEventListener("click", () => {
      compatible = button.dataset.compatibility === "match";
      root.querySelectorAll("[data-compatibility]").forEach((item) => item.classList.toggle("is-active", item === button));
      paintCutter();
    }));
    root.querySelectorAll("[data-product-target]").forEach((button) => button.addEventListener("click", () => {
      root.querySelectorAll("[data-product-target]").forEach((item) => item.classList.toggle("is-active", item === button));
      root.querySelector("[data-product-view]").innerHTML = productView(button.dataset.productTarget);
    }));
    root.querySelectorAll("[data-structure-mode]").forEach((button) => button.addEventListener("click", () => {
      root.querySelectorAll("[data-structure-mode]").forEach((item) => item.classList.toggle("is-active", item === button));
      root.querySelector("[data-structure-view]").innerHTML = structureView(button.dataset.structureMode);
    }));
  }

  function renderSection7Formal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>核心讲解</h2>
      <div class="matrix-lesson-formal elimination-formal">
        <header class="matrix-formal-hero">
          <div>
            <span class="matrix-formal-kicker">从标量倍数升级到矩阵块</span>
            <h3>块行操作的第一关是尺寸</h3>
            <p>普通行倍加的逻辑不变。新的要求是：矩阵块 M 必须把第一块行变成第二块行的高度。</p>
          </div>
          <div class="matrix-formal-equation">${display("R_2\\leftarrow R_2-MR_1")}</div>
        </header>
        <div class="matrix-concept-grid matrix-concept-grid-five">
          ${conceptCard(1, "交换块行", "交换具有相同列分组的两条块方程。")}
          ${conceptCard(2, "可逆倍乘", "用可逆矩阵左乘一条块行，保证操作能够撤销。")}
          ${conceptCard(3, "块行倍加", "M 的尺寸由目标块行高度和来源块行高度共同决定。")}
          ${conceptCard(4, "构造块 E", "把相同操作施加到分块单位矩阵，再左乘原系统。")}
          ${conceptCard(5, "同步右端", "操作作用于整条方程，系数块和右端必须同时更新。")}
        </div>
        <div class="matrix-formal-rule">
          <span>消元抓手</span>
          <p>${inline("C")} 与 ${inline("-C")} 的抵消来自矩阵乘法；${inline("g-Cf")} 来自同一行操作对右端的同步作用。</p>
        </div>
      </div>`;
  }

  const BLOCK_OPERATIONS = {
    swap: {
      title: "交换两条块行", formula: "R_1\\leftrightarrow R_2",
      e: "E=P_{\\mathrm{swap}}",
      inverse: "E^{-1}=P_{\\mathrm{swap}}^T=P_{\\mathrm{swap}}", note: "用行置换矩阵整体交换两条块行；交换两次回到原系统。",
    },
    scale: {
      title: "用可逆 P 左乘第二块行", formula: "R_2\\leftarrow PR_2",
      e: "E=\\begin{pmatrix}I_p&0\\\\0&P\\end{pmatrix}",
      inverse: "E^{-1}=\\begin{pmatrix}I_p&0\\\\0&P^{-1}\\end{pmatrix}", note: "P 必须是 q 阶可逆矩阵；不可逆倍乘会删除第二块行中的信息。",
    },
    add: {
      title: "第二块行减去 M 倍第一块行", formula: "R_2\\leftarrow R_2-MR_1",
      e: "E=\\begin{pmatrix}I_p&0\\\\-M&I_q\\end{pmatrix}",
      inverse: "E^{-1}=\\begin{pmatrix}I_p&0\\\\M&I_q\\end{pmatrix}", note: "若第一、第二块行高度分别为 p、q，则 M 必须是 q×p。",
    },
  };

  function operationView(mode) {
    const item = BLOCK_OPERATIONS[mode];
    return `
      <div class="block-operation-card">
        <span>${item.title}</span><strong>${display(item.formula)}</strong><p>${item.note}</p>
      </div>
      <div class="block-operation-pair"><div><span>分块初等矩阵</span>${display(item.e)}</div><div><span>反向操作</span>${display(item.inverse)}</div></div>`;
  }

  const ELIMINATION_STEPS = [
    {
      label: "01 / 04 · 识别耦合",
      title: "左下块 C 把 x 带进第二条块方程",
      coefficient: "\\begin{pmatrix}I_p&0\\\\\\color{#d46b4f}{C}&I_q\\end{pmatrix}",
      rhs: "\\begin{pmatrix}f\\\\g\\end{pmatrix}",
      rule: "x=f,\\qquad Cx+y=g",
      caption: "目标是消去 C，让第二条方程不再含 x。",
      state: "coupled",
    },
    {
      label: "02 / 04 · 构造块初等矩阵",
      title: "把同一操作施加到分块单位矩阵",
      coefficient: "E=\\begin{pmatrix}I_p&0\\\\\\color{#447f78}{-C}&I_q\\end{pmatrix}",
      rhs: "R_2\\leftarrow R_2-CR_1",
      rule: "C\\in\\mathbb{R}^{q\\times p}",
      caption: "C 的尺寸 q×p 正好把第一块行高度 p 转成第二块行高度 q。",
      state: "operator",
    },
    {
      label: "03 / 04 · 左乘并抵消",
      title: "C 与 −C 在左下位置相遇",
      coefficient: "\\begin{pmatrix}I_p&0\\\\-C&I_q\\end{pmatrix}\\begin{pmatrix}I_p&0\\\\C&I_q\\end{pmatrix}=\\begin{pmatrix}I_p&0\\\\0&I_q\\end{pmatrix}",
      rhs: "\\begin{pmatrix}I_p&0\\\\-C&I_q\\end{pmatrix}\\begin{pmatrix}f\\\\g\\end{pmatrix}=\\begin{pmatrix}f\\\\g-Cf\\end{pmatrix}",
      rule: "-CI_p+I_qC=0",
      caption: "行操作作用于整个增广系统，因此右端同步出现 g−Cf。",
      state: "cancelled",
    },
    {
      label: "04 / 04 · 按块读出解",
      title: "耦合消失，两个变量组可以依次读取",
      coefficient: "\\begin{pmatrix}I_p&0\\\\0&I_q\\end{pmatrix}\\begin{pmatrix}x\\\\y\\end{pmatrix}=\\begin{pmatrix}f\\\\g-Cf\\end{pmatrix}",
      rhs: "x=f,\\qquad y=g-Cf",
      rule: "E^{-1}=\\begin{pmatrix}I_p&0\\\\C&I_q\\end{pmatrix}",
      caption: "这次消元不要求 C 可逆；恢复耦合时只需执行反向块行倍加。",
      state: "solved",
    },
  ];

  function couplingDiagram(state) {
    const coupled = state === "coupled";
    const operator = state === "operator";
    const solved = state === "solved";
    return `
      <div class="coupling-diagram is-${state}">
        <div class="subsystem-node"><small>第一变量组</small><strong>x</strong><span>x = f</span></div>
        <div class="coupling-arrow${coupled ? " is-live" : ""}"><span>${operator ? "−C" : coupled ? "C" : "C + (−C) = 0"}</span><i></i></div>
        <div class="subsystem-node"><small>第二变量组</small><strong>y</strong><span>${solved ? "y = g − Cf" : "Cx + y = g"}</span></div>
      </div>`;
  }

  function eliminationView(index) {
    const step = ELIMINATION_STEPS[index];
    return `
      <div class="elimination-progress"><span>${step.label}</span><strong>${step.title}</strong></div>
      ${couplingDiagram(step.state)}
      <div class="elimination-equation-grid">
        <div><span>系数块 / 操作矩阵</span>${display(step.coefficient)}</div>
        <div><span>方程右端</span>${display(step.rhs)}</div>
      </div>
      <div class="elimination-invariant"><span>本步依据</span>${display(step.rule)}<p>${step.caption}</p></div>`;
  }

  function renderSection7Interactive(interactive) {
    if (!interactive) return;
    let dimensionChoice = "3x2";
    let eliminationStep = 0;
    interactive.innerHTML = `
      <h2>可视化实验</h2>
      <div class="matrix-workbench elimination-workbench" data-section7-workbench>
        <header class="matrix-workbench-head">
          <div><span class="matrix-formal-kicker">BLOCK ELIMINATION WORKBENCH</span><h3>先过尺寸闸门，再执行块消元</h3></div>
          <p>每一步都同步显示分块单位矩阵、系数块和方程右端。</p>
        </header>
        <div class="matrix-workbench-tabs" role="tablist">
          ${tabButton("dimensions", "01 · 尺寸闸门", true)}
          ${tabButton("operations", "02 · 三类块操作")}
          ${tabButton("elimination", "03 · 块消元")}
        </div>
        <section class="matrix-workbench-panel" data-workbench-panel="dimensions">
          <div class="workbench-question"><span>观察任务</span><strong>第一块行高度 p=2、第二块行高度 q=3，M 应选什么尺寸才能执行 R₂←R₂−MR₁？</strong></div>
          <div class="dimension-gate-stage">
            <div class="block-row-silhouette"><span>R₁ · 高度 p=2</span><i style="--row-height:2"></i></div>
            <div class="dimension-gate-multiplier"><span>M</span><strong data-dimension-choice-label>3 × 2</strong></div>
            <div class="block-row-silhouette target"><span>R₂ · 高度 q=3</span><i style="--row-height:3"></i></div>
          </div>
          <div class="dimension-choice-row">
            ${[["3x2", "3 × 2"], ["2x3", "2 × 3"], ["2x2", "2 × 2"]].map(([key, label]) => `<button type="button" class="${key === "3x2" ? "is-active" : ""}" data-dimension-choice="${key}">${label}</button>`).join("")}
          </div>
          <div class="dimension-gate-result is-valid" data-dimension-result>
            <strong>闸门打开</strong><p>(3×2)·(2×n) 得到 3×n，恰好与第二块行同高。</p>
          </div>
        </section>
        <section class="matrix-workbench-panel" data-workbench-panel="operations" hidden>
          <div class="workbench-question"><span>观察任务</span><strong>每类块初等操作怎样写成 E？它的逆操作又是什么？</strong></div>
          <div class="block-operation-picker">
            <button type="button" data-block-operation="swap">交换块行</button>
            <button type="button" data-block-operation="scale">可逆倍乘</button>
            <button type="button" class="is-active" data-block-operation="add">块行倍加</button>
          </div>
          <div class="block-operation-view" data-block-operation-view>${operationView("add")}</div>
        </section>
        <section class="matrix-workbench-panel" data-workbench-panel="elimination" hidden>
          <div class="workbench-question"><span>观察任务</span><strong>追踪 C 与 −C 的来源，并确认右端为什么同时变成 g−Cf。</strong></div>
          <div class="block-elimination-view" data-elimination-view>${eliminationView(0)}</div>
          <div class="matrix-step-controls">
            <button type="button" data-elimination-prev disabled>上一步</button>
            <div class="step-dots" aria-hidden="true">${ELIMINATION_STEPS.map((_, index) => `<i class="${index === 0 ? "is-active" : ""}"></i>`).join("")}</div>
            <button type="button" class="primary" data-elimination-next>下一步</button>
            <button type="button" data-elimination-reset>重置</button>
          </div>
        </section>
      </div>`;

    const root = interactive.querySelector("[data-section7-workbench]");
    bindTabs(root);
    root.querySelectorAll("[data-dimension-choice]").forEach((button) => button.addEventListener("click", () => {
      dimensionChoice = button.dataset.dimensionChoice;
      root.querySelectorAll("[data-dimension-choice]").forEach((item) => item.classList.toggle("is-active", item === button));
      const label = dimensionChoice.replace("x", " × ");
      root.querySelector("[data-dimension-choice-label]").textContent = label;
      const valid = dimensionChoice === "3x2";
      const result = root.querySelector("[data-dimension-result]");
      result.className = `dimension-gate-result ${valid ? "is-valid" : "is-invalid"}`;
      result.innerHTML = valid
        ? "<strong>闸门打开</strong><p>(3×2)·(2×n) 得到 3×n，恰好与第二块行同高。</p>"
        : `<strong>尺寸不匹配</strong><p>${label} 无法同时接收高度 2 的 R₁，并输出高度 3 的块行。</p>`;
    }));
    root.querySelectorAll("[data-block-operation]").forEach((button) => button.addEventListener("click", () => {
      root.querySelectorAll("[data-block-operation]").forEach((item) => item.classList.toggle("is-active", item === button));
      root.querySelector("[data-block-operation-view]").innerHTML = operationView(button.dataset.blockOperation);
    }));
    const paintElimination = () => {
      root.querySelector("[data-elimination-view]").innerHTML = eliminationView(eliminationStep);
      root.querySelector("[data-elimination-prev]").disabled = eliminationStep === 0;
      const next = root.querySelector("[data-elimination-next]");
      next.disabled = eliminationStep === ELIMINATION_STEPS.length - 1;
      next.textContent = next.disabled ? "已完成" : "下一步";
      root.querySelectorAll(".step-dots i").forEach((dot, index) => dot.classList.toggle("is-active", index <= eliminationStep));
    };
    root.querySelector("[data-elimination-prev]").addEventListener("click", () => { if (eliminationStep > 0) { eliminationStep -= 1; paintElimination(); } });
    root.querySelector("[data-elimination-next]").addEventListener("click", () => { if (eliminationStep < ELIMINATION_STEPS.length - 1) { eliminationStep += 1; paintElimination(); } });
    root.querySelector("[data-elimination-reset]").addEventListener("click", () => { eliminationStep = 0; paintElimination(); });
  }

  defineChapter4Renderer("block-matrices", { formal: renderSection5Formal, interactive: renderSection5Interactive });
  defineChapter4Renderer("block-elementary-applications", { formal: renderSection7Formal, interactive: renderSection7Interactive });
})();
