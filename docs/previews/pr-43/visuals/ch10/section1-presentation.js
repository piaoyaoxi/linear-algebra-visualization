(() => {
  const ui = window.chapter10UI;
  const {
    q, qa, clamp, format, nearZero, dot, mathInline,
    markerDefs, gridPaths, vectorSvg, implicitLineSvg, bindSvgDrag, animateNumbers,
    renderModuleHeading,
  } = ui;

  function renderIntuition(section) {
    return `<div class="ch10-intuition-visual">
      <figure>
        <svg viewBox="0 0 640 250" role="img" aria-label="线性函数的平行等值层、核与读数方向">
          <g class="ch10-static-grid">
            <path d="M42 64H598M42 125H598M42 186H598M116 28V222M320 28V222M524 28V222"></path>
          </g>
          <g class="ch10-static-levels">
            <path d="M122 220L304 30M218 220L400 30M410 220L592 30"></path>
          </g>
          <path class="ch10-static-kernel" d="M314 220L496 30"></path>
          <line class="ch10-static-vector" x1="320" y1="125" x2="438" y2="82"></line>
          <circle class="ch10-static-point" cx="438" cy="82" r="5"></circle>
          <text x="448" y="78">x</text>
          <text class="is-kernel" x="458" y="56">f = 0（核）</text>
          <text class="is-value" x="236" y="197">同一条平行层上的读数相同</text>
        </svg>
        <figcaption>一组平行线就是一把“标量刻度尺”；穿过原点的零值层是核。</figcaption>
      </figure>
      <div class="ch10-intuition-copy">
        <p><strong>沿着层走</strong><span>位置改变，读数不变。</span></p>
        <p><strong>横穿核</strong><span>读数经过 0，并改变符号。</span></p>
        <p><strong>改变倍率</strong><span>刻度疏密改变，核的方向不变。</span></p>
      </div>
    </div>`;
  }

  function renderInteractive(section) {
    return `<div class="ch10-core-lab functional-core" data-functional-core>
      <header class="ch10-core-head">
        <div>
          <span>观察任务</span>
          <strong>${section.interactive.question}</strong>
          <p>拖动图中的 x。先沿同一层移动，再穿过虚线所示的核。</p>
        </div>
        <button class="ch10-core-reset" type="button" data-functional-reset>恢复初始位置</button>
      </header>
      <div class="ch10-core-layout">
        <div class="ch10-plot-column">
          <div class="ch10-plot-shell">
            <svg viewBox="0 0 100 100" data-functional-svg role="img" aria-label="线性函数的平行等值层、核和可拖动向量 x"></svg>
          </div>
          <div class="ch10-action-bar" aria-label="线性函数观察动作">
            <button type="button" data-functional-action="level">沿等值层移动</button>
            <button type="button" data-functional-action="cross">穿过核</button>
            <button type="button" data-functional-action="scale" aria-pressed="false">倍率变为 2</button>
          </div>
        </div>
        <aside class="ch10-core-readout" aria-label="实验同步读数">
          <div class="ch10-readout-block">
            <span class="ch10-readout-label">当前读数</span>
            <strong class="ch10-readout-value" data-functional-value></strong>
            <div class="ch10-readout-formula" data-functional-formula></div>
          </div>
          <div class="ch10-readout-block">
            <span class="ch10-readout-label">当前所在层</span>
            <p class="ch10-readout-copy" data-functional-layer-copy></p>
          </div>
          <div class="ch10-readout-block ch10-readout-conclusion">
            <span class="ch10-readout-label">这一帧说明</span>
            <p class="ch10-readout-copy" data-functional-conclusion></p>
          </div>
        </aside>
      </div>
      <div class="ch10-status" aria-live="polite" data-functional-status></div>
    </div>`;
  }

  function renderFormal(section) {
    return `<div class="ch10-formal-flow">
      <p class="ch10-formal-lead">图中真正不变的是“平行等值层 + 穿过原点的零值层”。下面把这幅图压缩成定义。</p>
      <section class="ch10-module" aria-labelledby="functional-definition-title">
        ${renderModuleHeading("01", "线性函数、核与等值层", "几何画面和代数条件描述的是同一个对象。", "functional-definition-title")}
        <div class="ch10-concept-list">
          ${section.concepts.slice(0, 3).map((concept) => `<article><span>${concept.label}</span><p>${concept.text}</p></article>`).join("")}
        </div>
      </section>
      <section class="ch10-module" aria-labelledby="functional-linearity-title">
        ${renderModuleHeading("02", "为什么这不是普通的平行线图案", "必须同时通过加法、数乘和零向量三项检查。", "functional-linearity-title")}
        <div class="ch10-static-diagram">
          <div class="ch10-static-row"><strong>${mathInline("f(x+y)=f(x)+f(y)")}</strong><p>先相加再测量，与分别测量再相加，读数相同。</p></div>
          <div class="ch10-static-row"><strong>${mathInline("f(\\lambda x)=\\lambda f(x)")}</strong><p>输入缩放多少倍，输出就缩放多少倍。</p></div>
          <div class="ch10-static-row"><strong>${mathInline("f(0)=0")}</strong><p>所以核必经过原点；这一步把线性函数与仿射函数区分开。</p></div>
        </div>
      </section>
      <aside class="ch10-boundary-note"><strong>坐标只是记录方式</strong><p>选定基后可写成 ${mathInline("f(x)=a^Tx")}。行向量 ${mathInline("a^T")} 是函数在这组基下的坐标，不是函数本身。</p></aside>
    </div>`;
  }

  function mountInteractive(section, root) {
    const lab = q(root, "[data-functional-core]");
    if (!lab) return;
    const svg = q(lab, "[data-functional-svg]");
    const state = { vector: [2, 1], multiplier: 1, lastAction: "drag" };
    let cancelAnimation = () => {};

    const draw = () => {
      const coefficients = [state.multiplier, state.multiplier];
      const value = dot(coefficients, state.vector);
      const levels = [-4, -2, 2, 4]
        .map((level) => implicitLineSvg(coefficients[0], coefficients[1], level, "ch10-level-line"))
        .join("");
      svg.innerHTML = `${markerDefs}<g class="ch10-grid">${gridPaths()}</g><text class="ch10-region-label" x="82" y="17">f &gt; 0</text><text class="ch10-region-label" x="11" y="86">f &lt; 0</text>${levels}${implicitLineSvg(coefficients[0], coefficients[1], 0, "ch10-kernel-line")}${implicitLineSvg(coefficients[0], coefficients[1], value, "ch10-current-level")}${vectorSvg(state.vector, "x", "x", { ariaLabel: "拖动向量 x" })}<text class="ch10-line-label is-kernel" x="62" y="88">f = 0</text><text class="ch10-line-label is-current" x="69" y="26">f = ${format(value)}</text>`;
      const handle = q(svg, '[data-vector-handle="x"]');
      handle?.setAttribute("aria-valuetext", `x 等于 ${format(state.vector[0])}, ${format(state.vector[1])}`);
      q(lab, "[data-functional-value]").textContent = format(value);
      q(lab, "[data-functional-formula]").innerHTML = mathInline(`f(x)=${state.multiplier}(x_1+x_2)=${format(value)}`);
      q(lab, "[data-functional-layer-copy]").innerHTML = nearZero(value)
        ? `<strong>现在位于核上。</strong> 读数为 0，这是正负读数的分界。`
        : `当前 x 位于 ${mathInline(`f(x)=${format(value)}`)} 的等值层；沿这条线移动，读数不变。`;
      q(lab, "[data-functional-conclusion]").textContent = nearZero(value)
        ? "零值层经过原点，把正读数与负读数区域分开。"
        : state.multiplier === 2
          ? "倍率只重标读数；零值层的方向没有改变。"
          : "向量的位置由等值层转成一个标量读数。";
      const messages = {
        level: ["读数没有改变", "位置变了，但 x₁+x₂ 保持不变，所以仍在同一等值层。"],
        cross: ["读数穿过 0 并变号", "越过核以后，向量进入了另一侧的读数区域。"],
        scale: ["核没有转动", "倍率改变了读数刻度与等值层间距，但零值方向保持不变。"],
        drag: ["拖动 x，观察读数与高亮层同步", "与核平行的移动不改读数；横穿核才会改变符号。"],
      };
      const [title, copy] = messages[state.lastAction];
      q(lab, "[data-functional-status]").innerHTML = `<strong>${title}</strong><p>${copy}</p>`;
      q(lab, '[data-functional-action="scale"]').setAttribute("aria-pressed", String(state.multiplier === 2));
    };

    bindSvgDrag(svg, "x", () => [...state.vector], (vector) => {
      cancelAnimation();
      state.vector = vector;
      state.lastAction = "drag";
      draw();
    });
    qa(lab, "[data-functional-action]").forEach((button) => button.addEventListener("click", () => {
      const action = button.dataset.functionalAction;
      const target = [state.vector[0], state.vector[1], state.multiplier];
      if (action === "level") [target[0], target[1]] = [clamp(state.vector[0] + 0.9, -3.6, 3.6), clamp(state.vector[1] - 0.9, -3.6, 3.6)];
      if (action === "cross") [target[0], target[1]] = [-1.6, -1.1];
      if (action === "scale") target[2] = state.multiplier === 2 ? 1 : 2;
      state.lastAction = action;
      cancelAnimation();
      cancelAnimation = animateNumbers([state.vector[0], state.vector[1], state.multiplier], target, (values) => {
        state.vector = values.slice(0, 2);
        state.multiplier = values[2];
        draw();
      });
    }));
    q(lab, "[data-functional-reset]").addEventListener("click", () => {
      cancelAnimation();
      state.vector = [2, 1];
      state.multiplier = 1;
      state.lastAction = "drag";
      draw();
    });
    draw();
    return () => cancelAnimation();
  }

  window.defineChapter10Renderer("linear-functional", {
    renderIntuition,
    renderInteractive,
    renderFormal,
    mountInteractive,
  });
})();
