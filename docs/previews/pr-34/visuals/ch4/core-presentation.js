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
      role="tab" aria-selected="${active}" data-elementary-tab="${id}">${label}</button>`;

  const OPERATIONS = {
    add: {
      label: "倍加", rule: "R_2\\leftarrow R_2-3R_1", changed: 1,
      e: [[1, 0], [-3, 1]], ea: [[1, 2], [0, 1]], ae: [[-5, 2], [-18, 7]],
      inverse: "R_2\\leftarrow R_2+3R_1", inverseMatrix: "\\begin{pmatrix}1&0\\\\3&1\\end{pmatrix}",
      determinant: "行列式不变", geometry: "剪切", leftNote: "第二行变为 R₂−3R₁", rightNote: "第一列变为 C₁−3C₂",
    },
    swap: {
      label: "换行", rule: "R_1\\leftrightarrow R_2", changed: 0,
      e: [[0, 1], [1, 0]], ea: [[3, 7], [1, 2]], ae: [[2, 1], [7, 3]],
      inverse: "R_1\\leftrightarrow R_2", inverseMatrix: "\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}",
      determinant: "行列式变号", geometry: "坐标置换", leftNote: "两行交换", rightNote: "两列交换",
    },
    scale: {
      label: "非零倍乘", rule: "R_2\\leftarrow \\tfrac12R_2", changed: 1,
      e: [[1, 0], [0, 0.5]], ea: [[1, 2], [1.5, 3.5]], ae: [[1, 1], [3, 3.5]],
      inverse: "R_2\\leftarrow 2R_2", inverseMatrix: "\\begin{pmatrix}1&0\\\\0&2\\end{pmatrix}",
      determinant: "行列式乘以 1/2", geometry: "单向缩放", leftNote: "第二行缩小为一半", rightNote: "第二列缩小为一半",
    },
  };

  const BASE_MATRIX = [[1, 2], [3, 7]];

  function formatNumber(value) {
    return Number.isInteger(value) ? String(value) : String(value).replace("0.5", "½").replace("1.5", "3/2").replace("3.5", "7/2");
  }

  function numberMatrix(matrix, options = {}) {
    const { highlightRow = -1, highlightCol = -1, highlightRows = [], highlightCols = [], label = "" } = options;
    const cells = matrix.flatMap((row, rowIndex) => row.map((value, colIndex) => {
      const classes = ["number-matrix-cell"];
      if (rowIndex === highlightRow || highlightRows.includes(rowIndex)) classes.push("is-row-highlight");
      if (colIndex === highlightCol || highlightCols.includes(colIndex)) classes.push("is-col-highlight");
      return `<span class="${classes.join(" ")}">${formatNumber(value)}</span>`;
    })).join("");
    return `<div class="number-matrix-wrap">${label ? `<strong>${label}</strong>` : ""}<div class="number-matrix">${cells}</div></div>`;
  }

  function renderSection6Formal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>核心讲解</h2>
      <div class="matrix-lesson-formal elementary-formal-v2">
        <header class="matrix-formal-hero">
          <div>
            <span class="matrix-formal-kicker">一次操作，三种语言</span>
            <h3>初等矩阵把行操作写成左乘</h3>
            <p>对 I 做操作得到 E；计算 EA 改变 A 的行；把同一操作施加到方程组会保持解集。</p>
          </div>
          <div class="matrix-formal-equation">${display("I\\xrightarrow{\\text{行操作}}E,\\qquad A\\xrightarrow{\\text{同一操作}}EA")}</div>
        </header>
        <div class="matrix-concept-grid matrix-concept-grid-five">
          ${conceptCard(1, "交换", "交换两行；再交换一次即可恢复，行列式变号。")}
          ${conceptCard(2, "非零倍乘", "一行乘非零数；逆操作乘倒数，系数不能取 0。")}
          ${conceptCard(3, "倍加", "一行加另一行的倍数；逆操作改用相反数倍。")}
          ${conceptCard(4, "左右有别", `${inline("EA")} 改行，${inline("AE")} 改列；矩阵位置决定操作方向。`)}
          ${conceptCard(5, "连续左乘", `${inline("E_k\\cdots E_1A")} 记录完整消元过程；若结果为 I，乘积就是 ${inline("A^{-1}")}。`)}
        </div>
        <div class="matrix-formal-rule">
          <span>不变量</span>
          <p>三类初等操作都可逆，因此矩阵的秩和方程组的解集保持不变；行列式会按操作类型发生可追踪的变化。</p>
        </div>
      </div>`;
  }

  function operationStage(operationKey, step) {
    const operation = OPERATIONS[operationKey];
    const rowHighlights = operationKey === "swap" ? [0, 1] : [];
    if (step === 0) {
      return `
        <div class="elementary-stage-copy"><span>01 · 写下操作</span><strong>${operation.label}</strong><p>先让这条规则作用于单位矩阵，不急着改 A。</p></div>
        <div class="elementary-matrix-stage">${numberMatrix([[1, 0], [0, 1]], { highlightRow: operation.changed, highlightRows: rowHighlights, label: "单位矩阵 I" })}<span class="matrix-operation-symbol">${display(operation.rule)}</span>${numberMatrix(BASE_MATRIX, { label: "原矩阵 A" })}</div>
        <div class="elementary-stage-note"><strong>反向操作</strong>${inline(operation.inverse)}<span>${operation.geometry}</span></div>`;
    }
    if (step === 1) {
      return `
        <div class="elementary-stage-copy"><span>02 · I 变成 E</span><strong>同一条行规则被写进矩阵</strong><p>E 的变化行保存了如何组合其他矩阵各行的系数。</p></div>
        <div class="elementary-matrix-stage">${numberMatrix([[1, 0], [0, 1]], { label: "I" })}<span class="matrix-operation-symbol">→</span>${numberMatrix(operation.e, { highlightRow: operation.changed, highlightRows: rowHighlights, label: "初等矩阵 E" })}<span class="matrix-operation-symbol">${display(operation.rule)}</span></div>
        <div class="elementary-stage-note"><strong>E 的逆</strong>${inline(operation.inverseMatrix)}<span>${operation.determinant}</span></div>`;
    }
    return `
      <div class="elementary-stage-copy"><span>03 · 左乘 E</span><strong>EA 在 A 上执行相同行操作</strong><p>${operation.leftNote}；未指定的行保持原样。</p></div>
      <div class="elementary-matrix-stage">${numberMatrix(operation.e, { label: "E" })}<span class="matrix-operation-symbol">×</span>${numberMatrix(BASE_MATRIX, { label: "A" })}<span class="matrix-operation-symbol">=</span>${numberMatrix(operation.ea, { highlightRow: operation.changed, highlightRows: rowHighlights, label: "EA" })}</div>
      <div class="elementary-stage-note"><strong>本步结论</strong>${inline(`EA=\\text{对 A 执行 }${operation.rule}`)}<span>秩保持不变</span></div>`;
  }

  function sideComparison(operationKey) {
    const operation = OPERATIONS[operationKey];
    const highlightIndex = operationKey === "swap" ? 0 : 1;
    const highlightRows = operationKey === "swap" ? [0, 1] : [];
    const highlightCols = operationKey === "swap" ? [0, 1] : [];
    return `
      <div class="side-comparison-grid">
        <article>
          <header><span>E 在左侧</span><strong>EA · 改行</strong></header>
          <div class="side-matrix-equation">${numberMatrix(operation.e, { label: "E" })}<span>×</span>${numberMatrix(BASE_MATRIX, { label: "A" })}<span>=</span>${numberMatrix(operation.ea, { highlightRow: highlightIndex, highlightRows, label: "EA" })}</div>
          <p>${operation.leftNote}。左侧 E 的行系数直接重组 A 的行。</p>
        </article>
        <article>
          <header><span>E 在右侧</span><strong>AE · 改列</strong></header>
          <div class="side-matrix-equation">${numberMatrix(BASE_MATRIX, { label: "A" })}<span>×</span>${numberMatrix(operation.e, { label: "E" })}<span>=</span>${numberMatrix(operation.ae, { highlightCol: highlightIndex, highlightCols, label: "AE" })}</div>
          <p>${operation.rightNote}。右侧 E 的列系数直接重组 A 的列。</p>
        </article>
      </div>
      <div class="side-comparison-rule"><strong>位置记忆</strong><span>左乘看横向的行，右乘看纵向的列。</span></div>`;
  }

  const SYSTEM_STEPS = [
    {
      label: "原方程组", operation: "起点",
      a: [[1, 1], [2, 4]], b: [3, 8], equations: ["x_1+x_2=3", "2x_1+4x_2=8"],
      cumulative: "I", note: "两条直线相交于 (2,1)。从现在开始，只用可逆行操作重写方程。",
    },
    {
      label: "归一化第二行", operation: "R_2\\leftarrow \\tfrac12R_2",
      a: [[1, 1], [1, 2]], b: [3, 4], equations: ["x_1+x_2=3", "x_1+2x_2=4"],
      cumulative: "E_1=\\begin{pmatrix}1&0\\\\0&\\tfrac12\\end{pmatrix}", note: "第二条直线的表达式缩短了，几何位置与交点都没有改变。",
    },
    {
      label: "消去第二行的 x₁", operation: "R_2\\leftarrow R_2-R_1",
      a: [[1, 1], [0, 1]], b: [3, 1], equations: ["x_1+x_2=3", "x_2=1"],
      cumulative: "E_2E_1=\\begin{pmatrix}1&0\\\\-1&\\tfrac12\\end{pmatrix}", note: "第二条方程变成水平线 x₂=1，先读出 x₂。",
    },
    {
      label: "消去第一行的 x₂", operation: "R_1\\leftarrow R_1-R_2",
      a: [[1, 0], [0, 1]], b: [2, 1], equations: ["x_1=2", "x_2=1"],
      cumulative: "E_3E_2E_1=A^{-1}=\\begin{pmatrix}2&-\\tfrac12\\\\-1&\\tfrac12\\end{pmatrix}", note: "系数矩阵成为 I，两个解可以直接读取；交点仍是 (2,1)。",
    },
  ];

  function mapPoint(x, y) {
    const left = 34;
    const top = 18;
    const width = 252;
    const height = 216;
    return [left + ((x + 1) / 6) * width, top + ((5 - y) / 6) * height];
  }

  function linePath([a, b], c) {
    if (Math.abs(b) < 1e-9) {
      const x = c / a;
      const [x1, y1] = mapPoint(x, -1);
      const [, y2] = mapPoint(x, 5);
      return `M${x1.toFixed(2)} ${y1.toFixed(2)} L${x1.toFixed(2)} ${y2.toFixed(2)}`;
    }
    const x1 = -1;
    const x2 = 5;
    const y1 = (c - a * x1) / b;
    const y2 = (c - a * x2) / b;
    const p1 = mapPoint(x1, y1);
    const p2 = mapPoint(x2, y2);
    return `M${p1[0].toFixed(2)} ${p1[1].toFixed(2)} L${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }

  function equationPlane(step) {
    const solution = mapPoint(2, 1);
    const grid = Array.from({ length: 7 }, (_, index) => {
      const x = 34 + index * 42;
      const y = 18 + index * 36;
      return `<path d="M${x} 18V234"/><path d="M34 ${y}H286"/>`;
    }).join("");
    return `
      <svg class="equation-plane" viewBox="0 0 320 252" role="img" aria-label="两条等价方程的直线始终交于二逗号一">
        <defs><clipPath id="equation-plane-clip"><rect x="34" y="18" width="252" height="216" rx="10"/></clipPath></defs>
        <g class="plane-grid">${grid}</g>
        <g clip-path="url(#equation-plane-clip)">
          <path class="equation-line line-one" d="${linePath(step.a[0], step.b[0])}"/>
          <path class="equation-line line-two" d="${linePath(step.a[1], step.b[1])}"/>
        </g>
        <circle class="solution-halo" cx="${solution[0]}" cy="${solution[1]}" r="10"/>
        <circle class="solution-point" cx="${solution[0]}" cy="${solution[1]}" r="4"/>
        <text x="${solution[0] + 12}" y="${solution[1] - 10}">(2, 1)</text>
        <text class="axis-label" x="290" y="232">x₁</text><text class="axis-label" x="38" y="14">x₂</text>
      </svg>`;
  }

  function augmentedMatrix(step) {
    const rows = step.a.map((row, index) => [...row, step.b[index]]);
    const cells = rows.flatMap((row) => row.map((value, index) => `<span class="${index === 2 ? "is-constant" : ""}">${formatNumber(value)}</span>`)).join("");
    return `<div class="augmented-matrix" aria-label="增广矩阵">${cells}</div>`;
  }

  function systemView(index) {
    const step = SYSTEM_STEPS[index];
    return `
      <div class="system-progress"><span>0${index + 1} / 04</span><strong>${step.label}</strong><p>${display(step.operation)}</p></div>
      <div class="system-sync-grid">
        <article class="system-representation equations"><span>方程</span>${display(`\\begin{cases}${step.equations[0]}\\\\${step.equations[1]}\\end{cases}`)}</article>
        <article class="system-representation augmented"><span>增广矩阵</span>${augmentedMatrix(step)}<small>${display(step.cumulative)}</small></article>
        <article class="system-representation geometry"><span>几何</span>${equationPlane(step)}</article>
      </div>
      <div class="system-invariant"><strong>保持不变：解集</strong><p>${step.note}</p></div>`;
  }

  function renderSection6Interactive(interactive) {
    if (!interactive) return;
    let operationKey = "add";
    let operationStep = 0;
    let systemStep = 0;
    interactive.innerHTML = `
      <h2>可视化实验</h2>
      <div class="matrix-workbench elementary-workbench" data-section6-workbench>
        <header class="matrix-workbench-head">
          <div><span class="matrix-formal-kicker">ELEMENTARY MATRIX WORKBENCH</span><h3>让一条操作贯穿 I、A 与方程组</h3></div>
          <p>选择操作后，所有矩阵、方程和图形都从同一规则计算。</p>
        </header>
        <div class="matrix-workbench-tabs" role="tablist">
          ${tabButton("machine", "01 · I → E → EA", true)}
          ${tabButton("sides", "02 · 左乘 / 右乘")}
          ${tabButton("system", "03 · 方程同步")}
        </div>
        <section class="matrix-workbench-panel" data-elementary-panel="machine">
          <div class="workbench-question"><span>观察任务</span><strong>同一条操作怎样先改变 I，再通过左乘改变 A？逆操作在哪里？</strong></div>
          <div class="elementary-operation-picker">
            <button type="button" class="is-active" data-elementary-operation="add">倍加</button>
            <button type="button" data-elementary-operation="swap">换行</button>
            <button type="button" data-elementary-operation="scale">非零倍乘</button>
          </div>
          <div class="elementary-operation-stage" data-elementary-stage>${operationStage(operationKey, operationStep)}</div>
          <div class="matrix-step-controls">
            <button type="button" data-operation-prev disabled>上一步</button>
            <div class="step-dots" aria-hidden="true"><i class="is-active"></i><i></i><i></i></div>
            <button type="button" class="primary" data-operation-next>下一步</button>
            <button type="button" data-operation-reset>重置</button>
          </div>
        </section>
        <section class="matrix-workbench-panel" data-elementary-panel="sides" hidden>
          <div class="workbench-question"><span>观察任务</span><strong>保持 E 不变，只交换它位于 A 的哪一侧：被重组的是行还是列？</strong></div>
          <div class="elementary-operation-picker">
            <button type="button" class="is-active" data-side-operation="add">倍加矩阵 E</button>
            <button type="button" data-side-operation="swap">交换矩阵 E</button>
            <button type="button" data-side-operation="scale">倍乘矩阵 E</button>
          </div>
          <div class="side-comparison" data-side-comparison>${sideComparison("add")}</div>
        </section>
        <section class="matrix-workbench-panel" data-elementary-panel="system" hidden>
          <div class="workbench-question"><span>观察任务</span><strong>方程写法、增广矩阵和直线都在变化；为什么交点始终留在 (2,1)？</strong></div>
          <div class="system-sync-view" data-system-view>${systemView(0)}</div>
          <div class="matrix-step-controls">
            <button type="button" data-system-prev disabled>上一步</button>
            <div class="step-dots" aria-hidden="true">${SYSTEM_STEPS.map((_, index) => `<i class="${index === 0 ? "is-active" : ""}"></i>`).join("")}</div>
            <button type="button" class="primary" data-system-next>下一步</button>
            <button type="button" data-system-reset>重置</button>
          </div>
        </section>
      </div>`;

    const root = interactive.querySelector("[data-section6-workbench]");
    const tabs = [...root.querySelectorAll("[data-elementary-tab]")];
    const panels = [...root.querySelectorAll("[data-elementary-panel]")];
    tabs.forEach((tab) => tab.addEventListener("click", () => {
      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      panels.forEach((panel) => { panel.hidden = panel.dataset.elementaryPanel !== tab.dataset.elementaryTab; });
    }));

    const paintOperation = () => {
      root.querySelector("[data-elementary-stage]").innerHTML = operationStage(operationKey, operationStep);
      root.querySelector("[data-operation-prev]").disabled = operationStep === 0;
      const next = root.querySelector("[data-operation-next]");
      next.disabled = operationStep === 2;
      next.textContent = next.disabled ? "已完成" : "下一步";
      root.querySelectorAll("[data-elementary-panel=machine] .step-dots i").forEach((dot, index) => dot.classList.toggle("is-active", index <= operationStep));
    };
    root.querySelectorAll("[data-elementary-operation]").forEach((button) => button.addEventListener("click", () => {
      operationKey = button.dataset.elementaryOperation;
      operationStep = 0;
      root.querySelectorAll("[data-elementary-operation]").forEach((item) => item.classList.toggle("is-active", item === button));
      paintOperation();
    }));
    root.querySelector("[data-operation-prev]").addEventListener("click", () => { if (operationStep > 0) { operationStep -= 1; paintOperation(); } });
    root.querySelector("[data-operation-next]").addEventListener("click", () => { if (operationStep < 2) { operationStep += 1; paintOperation(); } });
    root.querySelector("[data-operation-reset]").addEventListener("click", () => { operationStep = 0; paintOperation(); });

    root.querySelectorAll("[data-side-operation]").forEach((button) => button.addEventListener("click", () => {
      root.querySelectorAll("[data-side-operation]").forEach((item) => item.classList.toggle("is-active", item === button));
      root.querySelector("[data-side-comparison]").innerHTML = sideComparison(button.dataset.sideOperation);
    }));

    const paintSystem = () => {
      root.querySelector("[data-system-view]").innerHTML = systemView(systemStep);
      root.querySelector("[data-system-prev]").disabled = systemStep === 0;
      const next = root.querySelector("[data-system-next]");
      next.disabled = systemStep === SYSTEM_STEPS.length - 1;
      next.textContent = next.disabled ? "已完成" : "下一步";
      root.querySelectorAll("[data-elementary-panel=system] .step-dots i").forEach((dot, index) => dot.classList.toggle("is-active", index <= systemStep));
    };
    root.querySelector("[data-system-prev]").addEventListener("click", () => { if (systemStep > 0) { systemStep -= 1; paintSystem(); } });
    root.querySelector("[data-system-next]").addEventListener("click", () => { if (systemStep < SYSTEM_STEPS.length - 1) { systemStep += 1; paintSystem(); } });
    root.querySelector("[data-system-reset]").addEventListener("click", () => { systemStep = 0; paintSystem(); });
  }

  defineChapter4Renderer("elementary-matrices", { formal: renderSection6Formal, interactive: renderSection6Interactive });
})();
