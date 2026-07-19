(() => {
  const ui = window.chapter10UI;
  const {
    q, qa, clamp, format, dot, scale, multiplyMatrixVector, transpose2, mathInline,
    markerDefs, gridPaths, vectorSvg, implicitLineSvg, bindSvgDrag, animateNumbers,
    renderModuleHeading,
  } = ui;

  const matrix = [2, 1, -1, 3];

  function renderIntuition() {
    return `<div class="ch10-intuition-list">
      <article><span>01</span><strong>两个输入槽</strong><p>${mathInline("B(x,y)")} 同时接收 x 和 y，但只输出一个标量。</p></article>
      <article><span>02</span><strong>先固定 y</strong><p>此时 ${mathInline("x\\mapsto B(x,y)")} 是关于 x 的线性函数。</p></article>
      <article><span>03</span><strong>再交换角色</strong><p>固定 x 后，${mathInline("y\\mapsto B(x,y)")} 也必须是线性函数。</p></article>
    </div>`;
  }

  function renderInteractive(section) {
    return `<div class="ch10-core-lab bilinear-core" data-bilinear-core>
      <header class="ch10-core-head">
        <div>
          <span>观察任务</span>
          <strong>${section.interactive.question}</strong>
          <p>先固定 y，拖动 x；再切换固定槽。高亮等值层和公式会同时改变。</p>
        </div>
        <button class="ch10-core-reset" type="button" data-bilinear-reset>恢复初始输入</button>
      </header>
      <div class="ch10-segmented" role="tablist" aria-label="选择固定输入槽">
        <button type="button" role="tab" data-bilinear-mode="right" aria-selected="true">固定 y，移动 x</button>
        <button type="button" role="tab" data-bilinear-mode="left" aria-selected="false">固定 x，移动 y</button>
      </div>
      <div class="ch10-core-layout">
        <div class="ch10-plot-column">
          <div class="ch10-slot-row" aria-label="双线性函数的两个输入槽与输出">
            <div class="ch10-slot"><span>左槽 x</span><strong data-bilinear-x></strong></div>
            <i class="ch10-slot-arrow">×</i>
            <div class="ch10-slot"><span>右槽 y</span><strong data-bilinear-y></strong></div>
            <i class="ch10-slot-arrow">→ B(x,y)</i>
          </div>
          <div class="ch10-plot-shell">
            <svg viewBox="0 0 100 100" data-bilinear-svg role="img" aria-label="固定一个输入后得到的线性函数等值层"></svg>
          </div>
          <div class="ch10-action-bar" aria-label="双线性函数观察动作">
            <button type="button" data-bilinear-action="level">沿等值层移动</button>
            <button type="button" data-bilinear-action="double">活动输入放大 2 倍</button>
            <button type="button" data-bilinear-action="swap">交换 x 与 y</button>
          </div>
        </div>
        <aside class="ch10-core-readout">
          <div class="ch10-readout-block">
            <span class="ch10-readout-label">当前配对值</span>
            <strong class="ch10-readout-value" data-bilinear-value></strong>
            <div class="ch10-readout-formula" data-bilinear-formula></div>
          </div>
          <div class="ch10-readout-block">
            <span class="ch10-readout-label">固定后出现的读取器</span>
            <div class="ch10-readout-formula" data-bilinear-reader></div>
            <p class="ch10-readout-copy" data-bilinear-reader-copy></p>
          </div>
          <div class="ch10-readout-block">
            <span class="ch10-readout-label">配对矩阵</span>
            <div class="ch10-readout-formula">${mathInline("A=\\begin{bmatrix}2&1\\\\-1&3\\end{bmatrix}")}</div>
            <p class="ch10-readout-copy">矩阵记录 ${mathInline("B(e_i,e_j)")}，它不是中间机器。</p>
          </div>
        </aside>
      </div>
      <div class="ch10-status" aria-live="polite" data-bilinear-status></div>
    </div>`;
  }

  function renderFormal(section) {
    return `<div class="ch10-formal-flow">
      <p class="ch10-formal-lead">交互里两次出现了线性函数：固定右槽得到左槽读取器，固定左槽得到右槽读取器。这就是“分别线性”。</p>
      <section class="ch10-module" aria-labelledby="bilinear-definition-title">
        ${renderModuleHeading("01", "分别线性与矩阵表示", "两个槽分别通过同一套线性检查。", "bilinear-definition-title")}
        <div class="ch10-concept-list">
          ${section.concepts.map((concept) => `<article><span>${concept.label}</span><p>${concept.text}</p></article>`).join("")}
        </div>
      </section>
      <section class="ch10-module" aria-labelledby="pairing-table-title">
        ${renderModuleHeading("02", "矩阵是一张基向量配对表", "第 i 行第 j 列就是 B(eᵢ,eⱼ)。", "pairing-table-title")}
        <div class="ch10-matrix-table" aria-label="双线性函数基向量配对表">
          <span></span><strong>e₁</strong><strong>e₂</strong>
          <strong>e₁</strong><span>2</span><span>1</span>
          <strong>e₂</strong><span>−1</span><span>3</span>
        </div>
      </section>
      <section class="ch10-module" aria-labelledby="bilinear-structure-title">
        ${renderModuleHeading("03", "交换、退化与二次型各看什么", "不要把不同结构压成一个按钮实验。", "bilinear-structure-title")}
        <div class="ch10-static-diagram">
          <div class="ch10-static-row"><strong>对称 / 斜对称</strong><p>比较 ${mathInline("B(x,y)")} 与 ${mathInline("B(y,x)")}；一般双线性函数可分成两部分。</p></div>
          <div class="ch10-static-row"><strong>退化</strong><p>若存在非零方向与另一槽所有向量的配对都为 0，就出现左根或右根。</p></div>
          <div class="ch10-static-row"><strong>二次型</strong><p>${mathInline("Q(x)=B(x,x)")} 看不见斜对称部分，因此不能恢复一般双线性函数。</p></div>
        </div>
      </section>
      <aside class="ch10-boundary-note"><strong>换基采用合同</strong><p>同一空间两个输入坐标同时改变，配对矩阵按 ${mathInline("A'=P^TAP")} 变化，而同一对几何向量的配对值不变。</p></aside>
    </div>`;
  }

  function mountInteractive(section, root) {
    const lab = q(root, "[data-bilinear-core]");
    if (!lab) return;
    const svg = q(lab, "[data-bilinear-svg]");
    const state = { x: [1.5, 0.5], y: [1, 1], mode: "right", lastAction: "drag", animating: false };
    let cancelAnimation = () => {};

    const draw = () => {
      const active = state.mode === "right" ? state.x : state.y;
      const reader = state.mode === "right"
        ? multiplyMatrixVector(matrix, state.y)
        : multiplyMatrixVector(transpose2(matrix), state.x);
      const value = dot(active, reader);
      const activeRole = state.mode === "right" ? "x" : "y";
      const activeLabel = activeRole;
      const levels = [-6, -3, 3, 6].map((level) => implicitLineSvg(reader[0], reader[1], level, "ch10-level-line")).join("");
      svg.innerHTML = `${markerDefs}<g class="ch10-grid">${gridPaths()}</g>${levels}${implicitLineSvg(reader[0], reader[1], 0, "ch10-kernel-line")}${implicitLineSvg(reader[0], reader[1], value, "ch10-current-level")}${vectorSvg(active, activeLabel, activeRole, { ariaLabel: `拖动活动输入 ${activeLabel}` })}`;
      q(lab, "[data-bilinear-x]").textContent = `(${format(state.x[0])}, ${format(state.x[1])})`;
      q(lab, "[data-bilinear-y]").textContent = `(${format(state.y[0])}, ${format(state.y[1])})`;
      q(lab, "[data-bilinear-value]").textContent = format(value);
      q(lab, "[data-bilinear-formula]").innerHTML = mathInline(`B(x,y)=x^TAy=${format(value)}`);
      if (state.mode === "right") {
        q(lab, "[data-bilinear-reader]").innerHTML = mathInline(`Ay=(${format(reader[0])},${format(reader[1])})^T`);
        q(lab, "[data-bilinear-reader-copy]").innerHTML = `固定 y 后，${mathInline("x\\mapsto x^T(Ay)")} 就是图中的线性读取层。`;
      } else {
        q(lab, "[data-bilinear-reader]").innerHTML = mathInline(`A^Tx=(${format(reader[0])},${format(reader[1])})^T`);
        q(lab, "[data-bilinear-reader-copy]").innerHTML = `固定 x 后，${mathInline("y\\mapsto (A^Tx)^Ty")} 是另一组线性读取层。`;
      }
      const messages = {
        drag: ["固定一槽，另一槽就是线性函数", "拖动活动输入时，等值层与配对值同步变化。"],
        level: ["位置改变，配对值保持", "活动输入沿当前等值层移动，读取器没有改变。"],
        double: ["配对值随活动输入放大 2 倍", "这正是固定另一槽后的齐次性。"],
        swap: ["交换输入后重新计算", "一般矩阵不保证 B(x,y) 与 B(y,x) 相等或互为相反数。"],
      };
      const [title, copy] = state.animating
        ? ["活动输入正在连续变化", "当前等值层、配对值与公式对应同一个中间帧。"]
        : messages[state.lastAction];
      q(lab, "[data-bilinear-status]").innerHTML = `<strong>${title}</strong><p>${copy}</p>`;
      qa(lab, "[data-bilinear-mode]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.bilinearMode === state.mode)));
    };

    const bindRole = (role) => bindSvgDrag(svg, role, () => [...(role === "x" ? state.x : state.y)], (vector) => {
      if ((state.mode === "right" ? "x" : "y") !== role) return;
      cancelAnimation();
      if (role === "x") state.x = vector;
      else state.y = vector;
      state.lastAction = "drag";
      state.animating = false;
      draw();
    });
    bindRole("x");
    bindRole("y");
    qa(lab, "[data-bilinear-mode]").forEach((button) => button.addEventListener("click", () => {
      cancelAnimation();
      state.mode = button.dataset.bilinearMode;
      state.lastAction = "drag";
      state.animating = false;
      draw();
    }));
    qa(lab, "[data-bilinear-action]").forEach((button) => button.addEventListener("click", () => {
      const action = button.dataset.bilinearAction;
      const reader = state.mode === "right" ? multiplyMatrixVector(matrix, state.y) : multiplyMatrixVector(transpose2(matrix), state.x);
      const target = state.mode === "right" ? state.x : state.y;
      let targetX = [...state.x];
      let targetY = [...state.y];
      if (action === "level") {
        const length = Math.hypot(reader[0], reader[1]) || 1;
        const moved = [target[0] + (reader[1] / length) * 0.9, target[1] - (reader[0] / length) * 0.9];
        if (state.mode === "right") targetX = moved.map((value) => clamp(value, -3.7, 3.7));
        else targetY = moved.map((value) => clamp(value, -3.7, 3.7));
      }
      if (action === "double") {
        if (state.mode === "right") targetX = scale(2, state.x).map((value) => clamp(value, -3.7, 3.7));
        else targetY = scale(2, state.y).map((value) => clamp(value, -3.7, 3.7));
      }
      if (action === "swap") [targetX, targetY] = [[...state.y], [...state.x]];
      state.lastAction = action;
      cancelAnimation();
      cancelAnimation = animateNumbers([...state.x, ...state.y], [...targetX, ...targetY], (values, raw) => {
        state.x = values.slice(0, 2);
        state.y = values.slice(2, 4);
        state.animating = raw < 1;
        draw();
      });
    }));
    q(lab, "[data-bilinear-reset]").addEventListener("click", () => {
      cancelAnimation();
      state.x = [1.5, 0.5];
      state.y = [1, 1];
      state.mode = "right";
      state.lastAction = "drag";
      state.animating = false;
      draw();
    });
    draw();
    return () => cancelAnimation();
  }

  window.defineChapter10Renderer("bilinear-form", {
    renderIntuition,
    renderInteractive,
    renderFormal,
    mountInteractive,
  });
})();
