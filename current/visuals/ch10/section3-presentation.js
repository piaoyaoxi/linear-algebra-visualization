(() => {
  const ui = window.chapter10UI;
  const {
    q, qa, clamp, format, dot, scale, multiplyMatrixVector, transpose2, mathInline,
    markerDefs, gridPaths, vectorSvg, implicitLineSvg, bindSvgDrag, animateNumbers,
    renderModuleHeading,
  } = ui;

  const matrix = [2, 1, -1, 3];

  function renderIntuition() {
    return `<div class="ch10-intuition-visual">
      <figure>
        <svg viewBox="0 0 640 250" role="img" aria-label="固定双线性函数的一项后得到线性函数">
          <g class="ch10-static-slot" transform="translate(34 70)">
            <rect x="0" y="0" width="126" height="76"></rect><text x="63" y="31">活动输入 x</text><text class="ch10-static-caption" x="63" y="55">可以移动</text>
          </g>
          <text class="ch10-static-symbol" x="182" y="116">,</text>
          <g class="ch10-static-slot is-fixed" transform="translate(210 70)">
            <rect x="0" y="0" width="126" height="76"></rect><text x="63" y="31">固定输入 y</text><text class="ch10-static-caption" x="63" y="55">保持不动</text>
          </g>
          <path class="ch10-static-pairing" d="M356 108H406"></path>
          <g transform="translate(420 33)">
            <path class="ch10-static-levels" d="M0 166L130 26M38 180L168 40M76 180L206 40"></path>
            <path class="ch10-static-kernel" d="M0 118L88 22"></path>
            <text x="92" y="20">x ↦ B(x,y)</text>
            <text class="ch10-static-caption" x="18" y="205">关于 x 的线性读取层</text>
          </g>
        </svg>
        <figcaption>固定右槽后，y 通过 B 产生关于 x 的线性函数；它的平行层随 y 一起改变。</figcaption>
      </figure>
      <div class="ch10-intuition-copy">
        <p><strong>固定 y</strong><span>得到协向量 x ↦ B(x,y)。</span></p>
        <p><strong>选定标准坐标</strong><span>Ay 记录该协向量的系数；等值层与 Ay 垂直。</span></p>
        <p><strong>交换角色</strong><span>固定 x 后同样得到关于 y 的线性函数。</span></p>
      </div>
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
          <div class="ch10-readout-block ch10-readout-conclusion">
            <span class="ch10-readout-label">两个输入</span>
            <p class="ch10-readout-copy"><span data-bilinear-x></span> 与 <span data-bilinear-y></span></p>
            <p class="ch10-readout-copy" data-bilinear-conclusion></p>
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
        ${renderModuleHeading("03", "交换、退化与二次型各看什么", "三种问题需要分别检查，再沿公式连接起来。", "bilinear-structure-title")}
        <div class="ch10-static-diagram">
          <div class="ch10-static-row"><strong>对称 / 斜对称</strong><p>比较 ${mathInline("B(x,y)")} 与 ${mathInline("B(y,x)")}；当数域特征不为 2 时，一般双线性型可唯一分成这两部分。</p></div>
          <div class="ch10-static-row"><strong>退化</strong><p>若存在非零方向与另一槽所有向量的配对都为 0，就出现左根或右根。</p></div>
          <div class="ch10-static-row"><strong>二次型</strong><p>${mathInline("Q(x)=B(x,x)")} 看不见斜对称部分，因此不能恢复一般双线性函数。</p></div>
        </div>
      </section>
      <aside class="ch10-boundary-note"><strong>先分清两个空间与同一空间</strong><p>在 ${mathInline("V\\times W")} 上分别换基得到 ${mathInline("A'=P^TAQ")}；同一空间的双线性型在两槽使用同一新基时，才得到合同 ${mathInline("A'=P^TAP")}。配对值始终不变。</p></aside>
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
      const readerLength = Math.hypot(reader[0], reader[1]) || 1;
      const readerVisual = scale(2.2 / readerLength, reader);
      svg.innerHTML = `${markerDefs}<g class="ch10-grid">${gridPaths()}</g>${levels}${implicitLineSvg(reader[0], reader[1], 0, "ch10-kernel-line")}${implicitLineSvg(reader[0], reader[1], value, "ch10-current-level")}${vectorSvg(readerVisual, state.mode === "right" ? "Ay" : "Aᵀx", "measure", { handleRadius: 0 })}${vectorSvg(active, activeLabel, activeRole, { ariaLabel: `拖动活动输入 ${activeLabel}` })}<text class="ch10-line-label is-kernel" x="11" y="87">读数 0</text><text class="ch10-line-label is-current" x="72" y="23">B = ${format(value)}</text>`;
      q(lab, "[data-bilinear-x]").textContent = `(${format(state.x[0])}, ${format(state.x[1])})`;
      q(lab, "[data-bilinear-y]").textContent = `(${format(state.y[0])}, ${format(state.y[1])})`;
      q(lab, "[data-bilinear-value]").textContent = format(value);
      q(lab, "[data-bilinear-formula]").innerHTML = mathInline(`B(x,y)=x^TAy=${format(value)}`);
      if (state.mode === "right") {
        q(lab, "[data-bilinear-reader]").innerHTML = mathInline(`Ay=(${format(reader[0])},${format(reader[1])})^T`);
        q(lab, "[data-bilinear-reader-copy]").innerHTML = `固定 y 后，${mathInline("x\\mapsto x^T(Ay)")} 是协向量；图中的 Ay 只标出它在标准坐标下的法向代表。`;
      } else {
        q(lab, "[data-bilinear-reader]").innerHTML = mathInline(`A^Tx=(${format(reader[0])},${format(reader[1])})^T`);
        q(lab, "[data-bilinear-reader-copy]").innerHTML = `固定 x 后，${mathInline("y\\mapsto (A^Tx)^Ty")} 是 W 上的协向量；Aᵀx 记录它的坐标系数。`;
      }
      q(lab, "[data-bilinear-conclusion]").textContent = state.mode === "right"
        ? "y 决定 Ay 与整组读取层；拖动 x 只改变它落在哪一层。"
        : "x 决定 Aᵀx 与整组读取层；拖动 y 只改变它落在哪一层。";
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
