(() => {
  const ui = window.chapter10UI;
  const {
    q, qa, format, dot, add, scale, inverse2, mathInline,
    markerDefs, gridPaths, vectorSvg, implicitLineSvg, bindSvgDrag, animateNumbers,
    renderModuleHeading,
  } = ui;

  const basis = [[1.4, 0.55], [-0.65, 1.25]];
  const basisMatrix = [basis[0][0], basis[1][0], basis[0][1], basis[1][1]];
  const dualRows = inverse2(basisMatrix);

  function renderIntuition() {
    return `<div class="ch10-intuition-list">
      <article><span>01</span><strong>向量 x 是被测对象</strong><p>x 可以相加和缩放；它属于原空间 V。</p></article>
      <article><span>02</span><strong>函数 f 是测量规则</strong><p>它表现为一组平行读取层，而不是原空间里的另一支箭头。</p></article>
      <article><span>03</span><strong>两者相遇得到 f(x)</strong><p>一个向量槽与一个函数槽共同输出标量。</p></article>
    </div>`;
  }

  function renderInteractive(section) {
    return `<div class="ch10-core-lab dual-core" data-dual-core>
      <header class="ch10-core-head">
        <div>
          <span>观察任务</span>
          <strong>对偶基怎样从一组斜基中准确读出两个坐标？</strong>
          <p>切换 v¹、v²，观察读取层和核的方向；拖动 x，右侧坐标同步更新。</p>
        </div>
        <button class="ch10-core-reset" type="button" data-dual-reset>恢复示例向量</button>
      </header>
      <div class="ch10-segmented" role="tablist" aria-label="选择对偶读取器">
        <button type="button" role="tab" data-dual-reader="0" aria-selected="true">用 v¹ 读取第一坐标</button>
        <button type="button" role="tab" data-dual-reader="1" aria-selected="false">用 v² 读取第二坐标</button>
      </div>
      <div class="ch10-core-layout">
        <div class="ch10-plot-column">
          <div class="ch10-plot-shell">
            <svg viewBox="0 0 100 100" data-dual-svg role="img" aria-label="斜基、对偶基读取层和可拖动向量 x"></svg>
          </div>
          <div class="ch10-action-bar" aria-label="对偶基验证动作">
            <button type="button" data-dual-action="v1">把 x 放到 v₁</button>
            <button type="button" data-dual-action="v2">把 x 放到 v₂</button>
            <button type="button" data-dual-action="mix">查看一般组合</button>
          </div>
        </div>
        <aside class="ch10-core-readout">
          <div class="ch10-readout-block">
            <span class="ch10-readout-label">当前坐标</span>
            <strong class="ch10-readout-value" data-dual-coordinates></strong>
            <div class="ch10-readout-formula" data-dual-rebuild></div>
          </div>
          <div class="ch10-readout-block">
            <span class="ch10-readout-label">选中的测量规则</span>
            <div class="ch10-readout-formula" data-dual-reader-formula></div>
            <p class="ch10-readout-copy" data-dual-reader-copy></p>
          </div>
          <div class="ch10-readout-block">
            <span class="ch10-readout-label">不要混淆</span>
            <p class="ch10-readout-copy">斜基向量画成箭头；对偶基元素只通过<strong>读取层、核和数值</strong>呈现。</p>
          </div>
        </aside>
      </div>
      <div class="ch10-status" aria-live="polite" data-dual-status></div>
    </div>`;
  }

  function renderFormal(section) {
    return `<div class="ch10-formal-flow">
      <p class="ch10-formal-lead">对偶空间不是另一个几何平面，而是所有线性测量规则组成的空间。对偶基只是其中最精确的一组坐标读取器。</p>
      <section class="ch10-module" aria-labelledby="dual-definition-title">
        ${renderModuleHeading("01", "对偶空间与自然配对", "先区分对象，再写配对。", "dual-definition-title")}
        <div class="ch10-concept-list">
          ${section.concepts.map((concept) => `<article><span>${concept.label}</span><p>${concept.text}</p></article>`).join("")}
        </div>
      </section>
      <section class="ch10-module" aria-labelledby="dual-basis-title">
        ${renderModuleHeading("02", "对偶基就是坐标读取表", "每一行只认出一支基向量。", "dual-basis-title")}
        <div class="ch10-matrix-table" aria-label="对偶基 Kronecker 配对表">
          <span></span><strong>v₁</strong><strong>v₂</strong>
          <strong>v¹</strong><span>1</span><span>0</span>
          <strong>v²</strong><span>0</span><span>1</span>
        </div>
      </section>
      <section class="ch10-module" aria-labelledby="dual-change-title">
        ${renderModuleHeading("03", "坐标改变，配对值不变", "换基与对偶映射都在维护同一个求值结果。", "dual-change-title")}
        <div class="ch10-static-diagram">
          <div class="ch10-static-row"><strong>换基</strong><p>向量列坐标与函数行坐标以互相配合的方式改变，${mathInline("f(x)")} 保持不变。</p></div>
          <div class="ch10-static-row"><strong>对偶映射</strong><p>若 ${mathInline("T:V\\to W")}，则 ${mathInline("T^*(g)=g\\circ T")} 把 W 上的测量拉回 V。</p></div>
        </div>
      </section>
      <aside class="ch10-boundary-note"><strong>有限维不等于天然相同</strong><p>${mathInline("\\dim V=\\dim V^*")} 只说明它们同构；没有额外结构时，不能把向量与协向量直接当成同一种对象。</p></aside>
    </div>`;
  }

  function mountInteractive(section, root) {
    const lab = q(root, "[data-dual-core]");
    if (!lab) return;
    const svg = q(lab, "[data-dual-svg]");
    const state = { vector: add(scale(1.4, basis[0]), scale(-0.7, basis[1])), reader: 0, lastAction: "mix", animating: false };
    let cancelAnimation = () => {};

    const draw = () => {
      const row1 = [dualRows[0], dualRows[1]];
      const row2 = [dualRows[2], dualRows[3]];
      const rows = [row1, row2];
      const coordinates = [dot(row1, state.vector), dot(row2, state.vector)];
      const selected = rows[state.reader];
      const selectedValue = coordinates[state.reader];
      const levels = [-2, -1, 1, 2].map((level) => implicitLineSvg(selected[0], selected[1], level, "ch10-level-line")).join("");
      svg.innerHTML = `${markerDefs}<g class="ch10-grid">${gridPaths()}</g>${levels}${implicitLineSvg(selected[0], selected[1], 0, "ch10-kernel-line", `ker v${state.reader === 0 ? "¹" : "²"}`)}${implicitLineSvg(selected[0], selected[1], selectedValue, "ch10-current-level")}${vectorSvg(basis[0], "v₁", "measure", { handleRadius: 0 })}${vectorSvg(basis[1], "v₂", "measure", { handleRadius: 0 })}${vectorSvg(state.vector, "x", "x", { ariaLabel: "拖动被读取的向量 x" })}`;
      q(lab, "[data-dual-coordinates]").textContent = `(${format(coordinates[0])}, ${format(coordinates[1])})`;
      q(lab, "[data-dual-rebuild]").innerHTML = mathInline(`x=${format(coordinates[0])}v_1${coordinates[1] < 0 ? "" : "+"}${format(coordinates[1])}v_2`);
      q(lab, "[data-dual-reader-formula]").innerHTML = mathInline(`v^{${state.reader + 1}}(x)=${format(selectedValue)}`);
      q(lab, "[data-dual-reader-copy]").innerHTML = state.reader === 0
        ? `v¹ 的核沿 v₂ 方向，因此 ${mathInline("v^1(v_2)=0")}。`
        : `v² 的核沿 v₁ 方向，因此 ${mathInline("v^2(v_1)=0")}。`;
      const actionCopy = {
        v1: ["v¹(v₁)=1，v²(v₁)=0", "第一支基向量的坐标被准确读成 (1,0)。"],
        v2: ["v¹(v₂)=0，v²(v₂)=1", "第二支基向量的坐标被准确读成 (0,1)。"],
        mix: ["两台读取器共同恢复 x", "读数就是 x 在斜基 (v₁,v₂) 下的两个坐标。"],
        drag: ["拖动 x，读取层与坐标同步", "协向量没有变成箭头；变化的是 x 落在哪一条读取层上。"],
      };
      const [title, copy] = state.animating
        ? ["读取过程正在连续变化", "当前坐标、读取层和重建公式对应同一个中间向量。"]
        : actionCopy[state.lastAction];
      q(lab, "[data-dual-status]").innerHTML = `<strong>${title}</strong><p>${copy}</p>`;
      qa(lab, "[data-dual-reader]").forEach((button) => button.setAttribute("aria-selected", String(Number(button.dataset.dualReader) === state.reader)));
    };

    bindSvgDrag(svg, "x", () => [...state.vector], (vector) => {
      cancelAnimation();
      state.vector = vector;
      state.lastAction = "drag";
      state.animating = false;
      draw();
    });
    qa(lab, "[data-dual-reader]").forEach((button) => button.addEventListener("click", () => {
      state.reader = Number(button.dataset.dualReader);
      draw();
    }));
    qa(lab, "[data-dual-action]").forEach((button) => button.addEventListener("click", () => {
      const action = button.dataset.dualAction;
      let target = [...state.vector];
      if (action === "v1") target = [...basis[0]];
      if (action === "v2") target = [...basis[1]];
      if (action === "mix") target = add(scale(1.4, basis[0]), scale(-0.7, basis[1]));
      state.lastAction = action;
      cancelAnimation();
      cancelAnimation = animateNumbers([...state.vector], target, (values, raw) => {
        state.vector = values;
        state.animating = raw < 1;
        draw();
      });
    }));
    q(lab, "[data-dual-reset]").addEventListener("click", () => {
      cancelAnimation();
      state.vector = add(scale(1.4, basis[0]), scale(-0.7, basis[1]));
      state.reader = 0;
      state.lastAction = "mix";
      state.animating = false;
      draw();
    });
    draw();
    return () => cancelAnimation();
  }

  window.defineChapter10Renderer("dual-space", {
    renderIntuition,
    renderInteractive,
    renderFormal,
    mountInteractive,
  });
})();
