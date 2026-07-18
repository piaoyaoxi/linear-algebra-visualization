(() => {
  const ui = window.chapter10UI;
  const {
    q, qa, format, nearZero, dot, determinant, multiplyMatrixVector, transpose2,
    multiply2, mathInline, mathDisplay, markerDefs, gridPaths, vectorSvg,
    implicitLineSvg, renderModuleHeading, bindSvgDrag,
  } = ui;

  function renderIntuition() {
    return `
      <div class="bilinear-intuition">
        <div class="two-slot-machine">
          <div class="slot-input is-left"><span>左输入槽</span><strong>x</strong><small>固定 y 后，对 x 线性</small></div>
          <i>→</i>
          <div class="slot-core"><span>B</span><small>配对规则</small></div>
          <i>←</i>
          <div class="slot-input is-right"><span>右输入槽</span><strong>y</strong><small>固定 x 后，对 y 线性</small></div>
          <div class="slot-output"><span>唯一输出</span><strong>B(x,y) ∈ F</strong></div>
        </div>
        <div class="two-slot-cautions">
          <article><strong>分别线性</strong><p>每次固定一个槽，再检查另一个槽的加法和数乘。</p></article>
          <article><strong>不是整体线性</strong><p>同时把 x、y 都放大 λ 倍，输出会放大 λ² 倍。</p></article>
          <article><strong>矩阵记录配对</strong><p>第 i 行第 j 列对应 B(eᵢ,fⱼ)。</p></article>
        </div>
      </div>`;
  }

  function renderInteractive(section) {
    return `
      <div class="ch10-primary-lab bilinear-mixer-lab" data-bilinear-lab>
        <div class="ch10-lab-toolbar">
          <div class="ch10-preset-group" role="group" aria-label="双线性函数结构预设">
            ${section.interactive.presets.map((preset, index) => `<button type="button" data-bilinear-preset="${preset.id}" aria-pressed="${index === 0}">${preset.label}</button>`).join("")}
          </div>
          <button type="button" class="ch10-reset" data-bilinear-reset>重置</button>
        </div>

        <div class="bilinear-mode-row">
          <div class="ch10-tab-bar" role="tablist">
            <button type="button" data-bilinear-mode="right-fixed" aria-selected="true">固定 y，移动 x</button>
            <button type="button" data-bilinear-mode="left-fixed" aria-selected="false">固定 x，移动 y</button>
          </div>
          <button type="button" data-bilinear-swap>交换 x 与 y</button>
          <button type="button" data-bilinear-radical>寻找隐身方向</button>
        </div>

        <div class="ch10-lab-layout">
          <div class="ch10-canvas-column">
            <div class="ch10-canvas-head"><div><span>两个输入槽</span><strong data-bilinear-caption></strong></div></div>
            <svg class="ch10-coordinate-stage" viewBox="0 0 100 100" data-bilinear-svg aria-label="两个输入向量与固定槽产生的等值线"></svg>
            <div class="bilinear-pipeline-switch" role="tablist">
              <button type="button" data-pipeline="right" aria-selected="true">先算 Ay，再由 xᵀ 读取</button>
              <button type="button" data-pipeline="left" aria-selected="false">先算 Aᵀx，再由 yᵀ 读取</button>
            </div>
            <div class="bilinear-pipeline" data-bilinear-pipeline></div>
          </div>

          <aside class="ch10-control-column">
            <div class="ch10-live-conclusion" data-bilinear-conclusion aria-live="polite"></div>
            <section class="ch10-control-group">
              <header><strong>左输入 x</strong><span>青绿色</span></header>
              <label class="ch10-control-row">x₁ <output data-bi-x1-output></output><input type="range" min="-3" max="3" step="0.1" value="1" data-bi-x1 /></label>
              <label class="ch10-control-row">x₂ <output data-bi-x2-output></output><input type="range" min="-3" max="3" step="0.1" value="2" data-bi-x2 /></label>
            </section>
            <section class="ch10-control-group">
              <header><strong>右输入 y</strong><span>珊瑚色</span></header>
              <label class="ch10-control-row">y₁ <output data-bi-y1-output></output><input type="range" min="-3" max="3" step="0.1" value="2" data-bi-y1 /></label>
              <label class="ch10-control-row">y₂ <output data-bi-y2-output></output><input type="range" min="-3" max="3" step="0.1" value="-1" data-bi-y2 /></label>
            </section>
            <div class="bilinear-matrix-editor" data-bilinear-matrix-editor></div>
            <div class="ch10-readout-grid" data-bilinear-readout></div>
          </aside>
        </div>
      </div>`;
  }

  function renderPairingTable(section) {
    const matrix = section.pairingMatrix.matrix;
    return `
      <div class="pairing-matrix-lab" data-pairing-matrix>
        <div class="pairing-basis-board">
          <div class="pairing-machine-mini"><span data-pair-left>e₁</span><i>进入左槽</i><strong>B</strong><i>进入右槽</i><span data-pair-right>e₁</span><b data-pair-output>2</b></div>
          <p data-pair-explanation>矩阵左上角记录 B(e₁,e₁)。</p>
        </div>
        <div class="pairing-table">
          <span></span><strong>e₁</strong><strong>e₂</strong>
          <strong>e₁</strong>${matrix[0].map((value, index) => `<button type="button" data-pair-cell="0-${index}">${value}</button>`).join("")}
          <strong>e₂</strong>${matrix[1].map((value, index) => `<button type="button" data-pair-cell="1-${index}">${value}</button>`).join("")}
        </div>
      </div>`;
  }

  function renderRebuild(section) {
    return `
      <div class="pairing-rebuild" data-pairing-rebuild>
        ${section.rebuild.steps.map((step, index) => `<article data-rebuild-step="${index}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${step.label}</strong><div>${step.formula}</div></article>`).join("")}
        <button type="button" data-rebuild-next>逐步展开</button>
      </div>`;
  }

  function renderCongruence(section) {
    return `
      <div class="congruence-stage" data-congruence-stage>
        <div class="ch10-tab-bar" role="tablist"><button type="button" data-congruence-mode="old" aria-selected="true">原基记录</button><button type="button" data-congruence-mode="new" aria-selected="false">新基记录</button></div>
        <div class="congruence-cards">
          <article><span>配对矩阵</span><div data-congruence-matrix></div></article>
          <article><span>x 的坐标</span><div data-congruence-x></div></article>
          <article><span>y 的坐标</span><div data-congruence-y></div></article>
        </div>
        <div class="congruence-invariant" data-congruence-invariant></div>
      </div>`;
  }

  function renderSymmetrySplit(section) {
    return `
      <div class="symmetry-split" data-symmetry-split>
        <div class="symmetry-matrix-stack">
          <article><span>一般矩阵 A</span><div data-symmetry-whole></div></article>
          <i>=</i>
          <article><span>对称部分 S</span><div data-symmetry-symmetric></div></article>
          <i>+</i>
          <article><span>斜对称部分 K</span><div data-symmetry-skew></div></article>
        </div>
        <div class="ch10-tab-bar" role="tablist">${section.symmetrySplit.tabs.map((tab, index) => `<button type="button" data-symmetry-tab="${tab.id}" aria-selected="${index === 2}">${tab.label}</button>`).join("")}</div>
        <div class="symmetry-relation" data-symmetry-relation></div>
      </div>`;
  }

  function renderRadical(section) {
    return `
      <div class="radical-lab" data-radical-lab>
        <div class="ch10-preset-group">
          <button type="button" data-radical-preset="full" aria-pressed="true">满秩</button>
          <button type="button" data-radical-preset="symmetric">对称退化</button>
          <button type="button" data-radical-preset="nonsymmetric">非对称退化</button>
        </div>
        <div class="radical-layout"><svg viewBox="0 0 100 100" data-radical-svg aria-label="左根与右槽任意向量"></svg><div data-radical-readout></div></div>
        <label>任意右输入的方向 <input type="range" min="-180" max="180" value="25" data-radical-angle /><output data-radical-angle-output></output></label>
      </div>`;
  }

  function renderQuadratic(section) {
    return `
      <div class="quadratic-merge" data-quadratic-merge>
        <div class="quadratic-inputs"><span>x</span><i>进入左槽</i><strong>B</strong><i>进入右槽</i><span>x</span></div>
        <div class="quadratic-components"><article><span>对称部分贡献</span><strong data-quadratic-symmetric></strong></article><article><span>斜对称部分贡献</span><strong data-quadratic-skew></strong></article><article><span>总二次型</span><strong data-quadratic-total></strong></article></div>
        <p>${section.quadraticMerge.conclusion}</p>
      </div>`;
  }

  function renderFormal(section) {
    return `
      <div class="ch10-formal-flow">
        <p class="ch10-formal-lead">先把两个槽、矩阵格子与两条计算路径对应起来，再讨论换基、对称性与退化。这样每个公式都能在画面中找到对象。</p>
        <section class="ch10-module" aria-labelledby="bilinear-definition-title">${renderModuleHeading("01", "两个槽分别线性", "固定任意一槽，另一槽就成为线性函数。", "bilinear-definition-title")}<div class="ch10-concept-grid">${section.concepts.map((concept) => `<article><span>${concept.label}</span><p>${concept.text}</p></article>`).join("")}</div></section>
        <section class="ch10-module" aria-labelledby="pairing-matrix-title">${renderModuleHeading("02", section.pairingMatrix.title, section.pairingMatrix.task, "pairing-matrix-title")}${renderPairingTable(section)}</section>
        <section class="ch10-module" aria-labelledby="pairing-rebuild-title">${renderModuleHeading("03", section.rebuild.title, "从基向量配对表恢复任意输入的配对值。", "pairing-rebuild-title")}${renderRebuild(section)}</section>
        <section class="ch10-module" aria-labelledby="congruence-title">${renderModuleHeading("04", section.congruence.title, section.congruence.text, "congruence-title")}${renderCongruence(section)}</section>
        <section class="ch10-module" aria-labelledby="symmetry-title">${renderModuleHeading("05", section.symmetrySplit.title, "把一般配对拆成交换不变与交换变号两部分。", "symmetry-title")}${renderSymmetrySplit(section)}</section>
        <section class="ch10-module" aria-labelledby="radical-title">${renderModuleHeading("06", section.radical.title, section.radical.text, "radical-title")}${renderRadical(section)}</section>
        <section class="ch10-module" aria-labelledby="quadratic-title">${renderModuleHeading("07", section.quadraticMerge.title, "令两个输入槽都取 x，观察哪些信息消失。", "quadratic-title")}${renderQuadratic(section)}</section>
        <aside class="ch10-boundary-note"><strong>概念边界</strong><p>一般双线性函数不必对称、正定或非退化。内积只是带有额外条件的一类特殊双线性函数；二次型也不能恢复一般配对的斜对称部分。</p></aside>
      </div>`;
  }

  function matrixHtml(matrix) {
    return mathDisplay(`\\begin{bmatrix}${format(matrix[0])}&${format(matrix[1])}\\\\${format(matrix[2])}&${format(matrix[3])}\\end{bmatrix}`);
  }

  function mountInteractive(section, root) {
    const lab = q(root, "[data-bilinear-lab]");
    if (!lab) return;
    const svg = q(lab, "[data-bilinear-svg]");
    const inputs = {
      x1: q(lab, "[data-bi-x1]"), x2: q(lab, "[data-bi-x2]"),
      y1: q(lab, "[data-bi-y1]"), y2: q(lab, "[data-bi-y2]"),
    };
    const state = { x: [1, 2], y: [2, -1], matrix: section.interactive.presets[0].matrix.slice(), mode: "right-fixed", pipeline: "right" };

    const editor = q(lab, "[data-bilinear-matrix-editor]");
    editor.innerHTML = `<header><strong>配对矩阵 A</strong><span>直接编辑四个基配对值</span></header><div class="matrix-editor-grid">${["a₁₁", "a₁₂", "a₂₁", "a₂₂"].map((label, index) => `<label>${label}<input type="number" step="0.1" value="${state.matrix[index]}" data-matrix-entry="${index}" /></label>`).join("")}</div>`;

    const update = () => {
      Object.entries(inputs).forEach(([key, input]) => {
        const value = key.startsWith("x") ? state.x[Number(key[1]) - 1] : state.y[Number(key[1]) - 1];
        input.value = value;
        q(lab, `[data-bi-${key}-output]`).value = format(value);
      });
      qa(editor, "[data-matrix-entry]").forEach((input) => { input.value = state.matrix[Number(input.dataset.matrixEntry)]; });
      const Ay = multiplyMatrixVector(state.matrix, state.y);
      const Atx = multiplyMatrixVector(transpose2(state.matrix), state.x);
      const value = dot(state.x, Ay);
      const swapped = dot(state.y, multiplyMatrixVector(state.matrix, state.x));
      const fixedCoefficients = state.mode === "right-fixed" ? Ay : Atx;
      const moving = state.mode === "right-fixed" ? state.x : state.y;
      svg.innerHTML = `${markerDefs}<g class="ch10-grid">${gridPaths()}</g>${implicitLineSvg(fixedCoefficients[0], fixedCoefficients[1], value, "ch10-current-level", `B=${format(value)}`)}${implicitLineSvg(fixedCoefficients[0], fixedCoefficients[1], 0, "ch10-kernel-line", "零值线")}${vectorSvg(state.x, "x", "x", { ariaLabel: "左输入向量 x" })}${vectorSvg(state.y, "y", "y", { ariaLabel: "右输入向量 y" })}`;
      q(lab, "[data-bilinear-caption]").innerHTML = mathInline(`B(x,y)=${format(value)}`);
      q(lab, "[data-bilinear-pipeline]").innerHTML = state.pipeline === "right"
        ? `<article><span>01</span><strong>${mathInline(`Ay=\\begin{bmatrix}${format(Ay[0])}\\\\${format(Ay[1])}\\end{bmatrix}`)}</strong><p>固定 y 后，Ay 给出左槽中的线性读取器。</p></article><i>→</i><article><span>02</span><strong>${mathInline(`x^T(Ay)=${format(value)}`)}</strong><p>由 x 读取这个中间向量。</p></article>`
        : `<article><span>01</span><strong>${mathInline(`A^Tx=\\begin{bmatrix}${format(Atx[0])}\\\\${format(Atx[1])}\\end{bmatrix}`)}</strong><p>固定 x 后，Aᵀx 给出右槽中的读取器。</p></article><i>→</i><article><span>02</span><strong>${mathInline(`(A^Tx)^Ty=${format(value)}`)}</strong><p>两条计算路线汇合为同一个标量。</p></article>`;
      const det = determinant(state.matrix);
      const symmetric = nearZero(state.matrix[1] - state.matrix[2]);
      const alternating = nearZero(state.matrix[0]) && nearZero(state.matrix[3]) && nearZero(state.matrix[1] + state.matrix[2]);
      q(lab, "[data-bilinear-readout]").innerHTML = `
        <article><span>交换输入</span><strong>B(y,x)=${format(swapped)}</strong><p>${alternating ? "交错：交换后变号。" : symmetric ? "对称：交换后不变。" : "一般情形：没有固定的相等或变号关系。"}</p></article>
        <article><span>退化性</span><strong>${nearZero(det) ? "退化" : "非退化"}</strong><p>${mathInline(`\\det A=${format(det)}`)}</p></article>
        <article><span>当前固定槽</span><strong>${state.mode === "right-fixed" ? "固定 y" : "固定 x"}</strong><p>当前等值线是移动槽中的线性函数等值线。</p></article>`;
      q(lab, "[data-bilinear-conclusion]").innerHTML = `<span>当前结论</span><strong>${state.mode === "right-fixed" ? "固定 y 后，x ↦ B(x,y) 是线性函数" : "固定 x 后，y ↦ B(x,y) 是线性函数"}</strong><p>沿高亮等值线移动 ${state.mode === "right-fixed" ? "x" : "y"}，配对值保持 ${format(value)}。</p>`;
      qa(lab, "[data-bilinear-mode]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.bilinearMode === state.mode)));
      qa(lab, "[data-pipeline]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.pipeline === state.pipeline)));
    };

    Object.entries(inputs).forEach(([key, input]) => input.addEventListener("input", () => {
      const target = key.startsWith("x") ? state.x : state.y;
      target[Number(key[1]) - 1] = Number(input.value);
      update();
    }));
    qa(editor, "[data-matrix-entry]").forEach((input) => input.addEventListener("input", () => { state.matrix[Number(input.dataset.matrixEntry)] = Number(input.value); update(); }));
    qa(lab, "[data-bilinear-preset]").forEach((button) => button.addEventListener("click", () => {
      const preset = section.interactive.presets.find((item) => item.id === button.dataset.bilinearPreset);
      state.matrix = preset.matrix.slice();
      qa(lab, "[data-bilinear-preset]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      update();
    }));
    qa(lab, "[data-bilinear-mode]").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.bilinearMode; update(); }));
    qa(lab, "[data-pipeline]").forEach((button) => button.addEventListener("click", () => { state.pipeline = button.dataset.pipeline; update(); }));
    q(lab, "[data-bilinear-swap]").addEventListener("click", () => { const copy = state.x; state.x = state.y; state.y = copy; update(); });
    q(lab, "[data-bilinear-reset]").addEventListener("click", () => { state.x = [1, 2]; state.y = [2, -1]; state.matrix = section.interactive.presets[0].matrix.slice(); state.mode = "right-fixed"; state.pipeline = "right"; update(); });
    q(lab, "[data-bilinear-radical]").addEventListener("click", () => {
      if (!nearZero(determinant(state.matrix))) {
        q(lab, "[data-bilinear-conclusion]").innerHTML = `<span>没有非零隐身方向</span><strong>当前矩阵满秩</strong><p>左根与右根都只有零向量；先切换退化预设再测试。</p>`;
        return;
      }
      const leftDirection = Math.abs(state.matrix[0]) + Math.abs(state.matrix[2]) > ui.EPS.zero
        ? [-state.matrix[2], state.matrix[0]] : [-state.matrix[3], state.matrix[1]];
      state.x = leftDirection;
      state.mode = "right-fixed";
      update();
    });
    bindSvgDrag(svg, "x", () => state.x.slice(), (vector) => { state.x = vector; update(); });
    bindSvgDrag(svg, "y", () => state.y.slice(), (vector) => { state.y = vector; update(); });
    update();
  }

  function mountPairingMatrix(section, root) {
    const panel = q(root, "[data-pairing-matrix]");
    if (!panel) return;
    const matrix = section.pairingMatrix.matrix;
    const update = (row, column) => {
      q(panel, "[data-pair-left]").textContent = `e${row + 1}`;
      q(panel, "[data-pair-right]").textContent = `e${column + 1}`;
      q(panel, "[data-pair-output]").textContent = matrix[row][column];
      q(panel, "[data-pair-explanation]").innerHTML = `矩阵第 ${row + 1} 行第 ${column + 1} 列记录 ${mathInline(`B(e_${row + 1},e_${column + 1})=${matrix[row][column]}`)}。`;
      qa(panel, "[data-pair-cell]").forEach((cell) => cell.classList.toggle("is-active", cell.dataset.pairCell === `${row}-${column}`));
    };
    qa(panel, "[data-pair-cell]").forEach((cell) => cell.addEventListener("click", () => { const [row, column] = cell.dataset.pairCell.split("-").map(Number); update(row, column); }));
    update(0, 0);
  }

  function mountRebuild(root) {
    const panel = q(root, "[data-pairing-rebuild]");
    if (!panel) return;
    const steps = qa(panel, "[data-rebuild-step]");
    let index = 0;
    const update = () => {
      steps.forEach((step, stepIndex) => step.classList.toggle("is-visible", stepIndex <= index));
      q(panel, "[data-rebuild-next]").textContent = index === steps.length - 1 ? "重新展开" : "继续展开";
    };
    q(panel, "[data-rebuild-next]").addEventListener("click", () => { index = index === steps.length - 1 ? 0 : index + 1; update(); });
    update();
  }

  function mountCongruence(section, root) {
    const panel = q(root, "[data-congruence-stage]");
    if (!panel) return;
    let mode = "old";
    const A = section.congruence.matrix;
    const P = section.congruence.basisChange;
    const inverse = ui.inverse2(P);
    const Anew = multiply2(transpose2(P), multiply2(A, P));
    const xNew = multiplyMatrixVector(inverse, section.congruence.vectorX);
    const yNew = multiplyMatrixVector(inverse, section.congruence.vectorY);
    const value = dot(section.congruence.vectorX, multiplyMatrixVector(A, section.congruence.vectorY));
    const update = () => {
      const matrix = mode === "old" ? A : Anew;
      const x = mode === "old" ? section.congruence.vectorX : xNew;
      const y = mode === "old" ? section.congruence.vectorY : yNew;
      q(panel, "[data-congruence-matrix]").innerHTML = matrixHtml(matrix);
      q(panel, "[data-congruence-x]").innerHTML = mathDisplay(`\\begin{bmatrix}${format(x[0])}\\\\${format(x[1])}\\end{bmatrix}`);
      q(panel, "[data-congruence-y]").innerHTML = mathDisplay(`\\begin{bmatrix}${format(y[0])}\\\\${format(y[1])}\\end{bmatrix}`);
      q(panel, "[data-congruence-invariant]").innerHTML = `<span>同一几何配对</span><strong>${mathInline(`x^TAy=${format(value)}`)}</strong><p>${mode === "old" ? "原基中的坐标记录。" : "新基中矩阵与两个坐标同时变化，结果不变。"}</p>`;
      qa(panel, "[data-congruence-mode]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.congruenceMode === mode)));
    };
    qa(panel, "[data-congruence-mode]").forEach((button) => button.addEventListener("click", () => { mode = button.dataset.congruenceMode; update(); }));
    update();
  }

  function mountSymmetry(section, root) {
    const panel = q(root, "[data-symmetry-split]");
    if (!panel) return;
    const A = section.symmetrySplit.matrix;
    const At = transpose2(A);
    const S = A.map((value, index) => (value + At[index]) / 2);
    const K = A.map((value, index) => (value - At[index]) / 2);
    q(panel, "[data-symmetry-whole]").innerHTML = matrixHtml(A);
    q(panel, "[data-symmetry-symmetric]").innerHTML = matrixHtml(S);
    q(panel, "[data-symmetry-skew]").innerHTML = matrixHtml(K);
    const update = (id) => {
      const tab = section.symmetrySplit.tabs.find((item) => item.id === id);
      q(panel, "[data-symmetry-relation]").innerHTML = `<strong>${tab.formula}</strong><p>${tab.relation}</p>`;
      qa(panel, "[data-symmetry-tab]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.symmetryTab === id)));
    };
    qa(panel, "[data-symmetry-tab]").forEach((button) => button.addEventListener("click", () => update(button.dataset.symmetryTab)));
    update("whole");
  }

  function radicalDirection(matrix, left = true) {
    if (!nearZero(determinant(matrix))) return null;
    if (left) return Math.abs(matrix[0]) + Math.abs(matrix[2]) > ui.EPS.zero ? [-matrix[2], matrix[0]] : [-matrix[3], matrix[1]];
    return Math.abs(matrix[0]) + Math.abs(matrix[1]) > ui.EPS.zero ? [-matrix[1], matrix[0]] : [-matrix[3], matrix[2]];
  }

  function mountRadical(section, root) {
    const panel = q(root, "[data-radical-lab]");
    if (!panel) return;
    const svg = q(panel, "[data-radical-svg]");
    const input = q(panel, "[data-radical-angle]");
    const matrices = { full: section.radical.fullRank, symmetric: section.radical.degenerate, nonsymmetric: section.radical.nonsymmetricDegenerate };
    let preset = "full";
    const update = () => {
      const matrix = matrices[preset];
      const angle = (Number(input.value) * Math.PI) / 180;
      const y = [2 * Math.cos(angle), 2 * Math.sin(angle)];
      const left = radicalDirection(matrix, true);
      q(panel, "[data-radical-angle-output]").value = `${Math.round(Number(input.value))}°`;
      svg.innerHTML = `${markerDefs}<g class="ch10-grid">${gridPaths()}</g>${left ? vectorSvg(left, "左根 x", "x", { handleRadius: 0 }) : ""}${vectorSvg(y, "任意 y", "y", { handleRadius: 0 })}`;
      const value = left ? dot(left, multiplyMatrixVector(matrix, y)) : 0;
      q(panel, "[data-radical-readout]").innerHTML = left
        ? `<span>非零左根方向</span>${mathDisplay(`x=\\begin{bmatrix}${format(left[0])}\\\\${format(left[1])}\\end{bmatrix}`)}<strong>${mathInline(`B(x,y)=${format(value)}`)}</strong><p>转动任意右输入 y，输出始终为 0。</p>${preset === "nonsymmetric" ? `<p class="radical-warning">非对称情形中，左根与右根方向不同，不能混为一谈。</p>` : ""}`
        : `<span>没有非零隐身方向</span><strong>当前矩阵满秩</strong><p>左根和右根都只有零向量。</p>`;
      qa(panel, "[data-radical-preset]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.radicalPreset === preset)));
    };
    input.addEventListener("input", update);
    qa(panel, "[data-radical-preset]").forEach((button) => button.addEventListener("click", () => { preset = button.dataset.radicalPreset; update(); }));
    update();
  }

  function mountQuadratic(section, root) {
    const panel = q(root, "[data-quadratic-merge]");
    if (!panel) return;
    const x = section.quadraticMerge.vector;
    const symmetricValue = dot(x, multiplyMatrixVector(section.quadraticMerge.symmetric, x));
    const skewValue = dot(x, multiplyMatrixVector(section.quadraticMerge.skew, x));
    q(panel, "[data-quadratic-symmetric]").textContent = format(symmetricValue);
    q(panel, "[data-quadratic-skew]").textContent = format(skewValue);
    q(panel, "[data-quadratic-total]").textContent = format(symmetricValue + skewValue);
    q(panel, "[data-quadratic-skew]").closest("article").classList.add("is-vanishing");
  }

  window.defineChapter10Renderer("bilinear-form", {
    renderIntuition,
    renderInteractive,
    renderFormal,
    mountInteractive,
    mountFormal(section, root) {
      mountPairingMatrix(section, root);
      mountRebuild(root);
      mountCongruence(section, root);
      mountSymmetry(section, root);
      mountRadical(section, root);
      mountQuadratic(section, root);
    },
  });
})();
