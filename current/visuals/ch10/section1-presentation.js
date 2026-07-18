(() => {
  const ui = window.chapter10UI;
  const {
    q, qa, format, nearZero, dot, add, scale, mathInline, mathDisplay,
    markerDefs, gridPaths, vectorSvg, implicitLineSvg, toSvgPoint,
    renderModuleHeading, bindSvgDrag,
  } = ui;

  function renderIntuition(section) {
    return `
      <div class="ch10-intro-stack">
        <div class="ch10-intro-copy">
          <strong>同一个平面，可以被不同的读取规则重新分层</strong>
          <p>下面三张卡片不先讲公式推导，只比较“哪些移动会改变读数”。</p>
        </div>
        <div class="ch10-intro-card-grid">
          ${section.openingCases.map((item, index) => `
            <article class="ch10-intro-card" data-functional-opening="${index}">
              <div class="ch10-intro-mini" aria-hidden="true">
                <span class="ch10-mini-kernel"></span>
                <i class="ch10-mini-point"></i>
              </div>
              <span>0${index + 1}</span>
              <h3>${item.label}</h3>
              <div>${item.formula}</div>
              <p>${item.text}</p>
            </article>`).join("")}
        </div>
        <div class="ch10-intro-transition"><span>一个函数</span><i>把整个空间按读数分层</i><strong>平行等值线 + 零值核</strong></div>
      </div>`;
  }

  function renderInteractive(section) {
    const presets = section.interactive.presets;
    return `
      <div class="ch10-primary-lab functional-field-lab" data-functional-lab>
        <div class="ch10-lab-toolbar">
          <div class="ch10-preset-group" role="group" aria-label="线性函数预设">
            ${presets.map((preset, index) => `<button type="button" data-functional-preset="${preset.id}" aria-pressed="${index === 2}">${preset.label}</button>`).join("")}
          </div>
          <button type="button" class="ch10-reset" data-functional-reset>重置</button>
        </div>

        <div class="ch10-lab-layout">
          <div class="ch10-canvas-column">
            <div class="ch10-canvas-head">
              <div><span>向量空间 V</span><strong data-functional-formula></strong></div>
              <div class="ch10-view-switches" role="group" aria-label="图层开关">
                <label><input type="checkbox" data-functional-layer="sign" checked />正负区域</label>
                <label><input type="checkbox" data-functional-layer="levels" checked />等值线</label>
                <label><input type="checkbox" data-functional-layer="basis" checked />基读数</label>
              </div>
            </div>
            <svg class="ch10-coordinate-stage" viewBox="0 0 100 100" data-functional-svg role="img" aria-label="线性函数的等值线、核和输入向量"></svg>
            <div class="ch10-guided-actions">
              <button type="button" data-functional-guide="level">沿等值线走</button>
              <button type="button" data-functional-guide="cross">穿过核直线</button>
              <button type="button" data-functional-guide="scale">倍率变成 2</button>
            </div>
          </div>

          <aside class="ch10-control-column">
            <div class="ch10-live-conclusion" data-functional-conclusion aria-live="polite"></div>
            <section class="ch10-control-group">
              <header><strong>先定方向，再定倍率</strong><span>方向决定核，倍率决定读数刻度</span></header>
              <label class="ch10-control-row">测量方向 <output data-functional-angle-output></output><input type="range" min="-180" max="180" step="1" value="45" data-functional-angle /></label>
              <label class="ch10-control-row">整体倍率 <output data-functional-scale-output></output><input type="range" min="0" max="3" step="0.1" value="1.4" data-functional-scale /></label>
            </section>
            <section class="ch10-control-group">
              <header><strong>输入向量 x</strong><span>可以拖动图中端点，也可以用滑块</span></header>
              <label class="ch10-control-row">x₁ <output data-functional-x-output></output><input type="range" min="-4" max="4" step="0.1" value="2" data-functional-x /></label>
              <label class="ch10-control-row">x₂ <output data-functional-y-output></output><input type="range" min="-4" max="4" step="0.1" value="1" data-functional-y /></label>
            </section>
            <div class="ch10-readout-grid" data-functional-readout></div>
          </aside>
        </div>
      </div>`;
  }

  function renderFormal(section) {
    return `
      <div class="ch10-formal-flow">
        <p class="ch10-formal-lead">交互中已经出现了“加法保持”“数乘保持”“核”“基上的读数”四件事。现在把它们逐层写成符号。</p>

        <section class="ch10-module" aria-labelledby="functional-linearity-title">
          ${renderModuleHeading("01", "两条路径必须汇合", "线性不是图像看起来像直线，而是运算顺序不影响最终读数。", "functional-linearity-title")}
          <div class="functional-linearity-lab" data-functional-linearity>
            <div class="ch10-tab-bar" role="tablist">
              ${section.linearityChecks.map((item, index) => `<button type="button" role="tab" data-linearity-tab="${item.id}" aria-selected="${index === 0}">${item.title}</button>`).join("")}
            </div>
            <div class="linearity-paths">
              <article><span>路径 A</span><div data-linearity-left></div><strong data-linearity-left-value></strong></article>
              <i>=</i>
              <article><span>路径 B</span><div data-linearity-right></div><strong data-linearity-right-value></strong></article>
            </div>
            <div class="linearity-controls">
              <label>x = <input type="range" min="-3" max="3" step="0.1" value="1.2" data-linearity-x /><output data-linearity-x-output></output></label>
              <label>y = <input type="range" min="-3" max="3" step="0.1" value="-0.4" data-linearity-y /><output data-linearity-y-output></output></label>
              <label>λ = <input type="range" min="-3" max="3" step="0.1" value="2" data-linearity-lambda /><output data-linearity-lambda-output></output></label>
            </div>
            <p data-linearity-explanation></p>
          </div>
        </section>

        <section class="ch10-module" aria-labelledby="functional-core-title">
          ${renderModuleHeading("02", "核、等值层与坐标表示", "同一结构用几何语言和坐标语言描述。", "functional-core-title")}
          <div class="ch10-concept-grid">
            ${section.concepts.map((concept) => `<article><span>${concept.label}</span><p>${concept.text}</p></article>`).join("")}
          </div>
        </section>

        <section class="ch10-module" aria-labelledby="basis-value-title">
          ${renderModuleHeading("03", section.basisBuilder.title, section.basisBuilder.instruction, "basis-value-title")}
          <div class="basis-value-builder" data-basis-value-builder>
            <div class="ch10-tab-bar" role="tablist">
              <button type="button" data-basis-mode="standard" aria-selected="true">标准基</button>
              <button type="button" data-basis-mode="skew" aria-selected="false">非标准基</button>
            </div>
            <div class="basis-builder-layout">
              <svg viewBox="0 0 100 100" data-basis-builder-svg aria-label="基向量、输入向量和坐标分解"></svg>
              <div class="basis-builder-equation" data-basis-builder-equation></div>
            </div>
          </div>
        </section>

        <section class="ch10-module" aria-labelledby="functional-boundary-title">
          ${renderModuleHeading("04", "线性与仿射：画面相似，结构不同", "只看一组平行线不够，还要检查零向量和运算规律。", "functional-boundary-title")}
          <div class="affine-comparator" data-affine-comparator>
            <div class="affine-cards">
              ${section.boundaryCases.map((item) => `<article data-affine-card="${item.id}"><span>${item.label}</span><div>${item.formula}</div><strong>${item.test}</strong><p>${item.conclusion}</p></article>`).join("")}
            </div>
            <label>常数项 c <input type="range" min="-2" max="2" step="0.1" value="1" data-affine-c /><output data-affine-c-output>1</output></label>
            <p data-affine-conclusion></p>
          </div>
        </section>

        <aside class="ch10-boundary-note"><strong>概念边界</strong><p>只有选定坐标与内积后，才可把线性函数写成 ${mathInline("f(x)=a^Tx")} 并画出代表向量 ${mathInline("a")}。线性函数的定义本身不依赖这支箭头。</p></aside>
      </div>`;
  }

  function directionFromState(state) {
    const radians = (state.angle * Math.PI) / 180;
    return [Math.cos(radians), Math.sin(radians)];
  }

  function coefficients(state) {
    const direction = directionFromState(state);
    return scale(state.magnitude, direction);
  }

  function renderFunctionalSvg(svg, state) {
    const [a, b] = coefficients(state);
    const value = a * state.vector[0] + b * state.vector[1];
    const isZero = nearZero(state.magnitude);
    const direction = directionFromState(state);
    const gradientVector = [direction[0], -direction[1]];
    const x1 = 50 - gradientVector[0] * 50;
    const y1 = 50 - gradientVector[1] * 50;
    const x2 = 50 + gradientVector[0] * 50;
    const y2 = 50 + gradientVector[1] * 50;

    const levels = !isZero && state.layers.levels
      ? [-4, -2, 2, 4].map((level) => implicitLineSvg(a, b, level, "ch10-level-line", format(level))).join("")
      : "";
    const currentLevel = !isZero
      ? implicitLineSvg(a, b, value, "ch10-current-level", `f(x)=${format(value)}`)
      : "";
    const kernel = !isZero ? implicitLineSvg(a, b, 0, "ch10-kernel-line", "ker f") : "";
    const basis = state.layers.basis && !isZero
      ? `${vectorSvg([1, 0], "e₁", "measure", { handleRadius: 0, ariaLabel: "第一标准基向量" })}${vectorSvg([0, 1], "e₂", "measure", { handleRadius: 0, ariaLabel: "第二标准基向量" })}`
      : "";

    svg.innerHTML = `
      ${markerDefs}
      <defs>
        <linearGradient id="functional-sign-gradient" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
          <stop offset="0" class="negative-stop"></stop>
          <stop offset="49%" class="negative-stop"></stop>
          <stop offset="51%" class="positive-stop"></stop>
          <stop offset="100%" class="positive-stop"></stop>
        </linearGradient>
      </defs>
      ${state.layers.sign && !isZero ? `<rect x="8" y="8" width="84" height="84" class="ch10-sign-field"></rect>` : ""}
      <g class="ch10-grid">${gridPaths()}</g>
      ${levels}
      ${kernel}
      ${currentLevel}
      ${basis}
      ${isZero ? `<rect x="8" y="8" width="84" height="84" class="ch10-zero-field"></rect><text x="50" y="50" text-anchor="middle" class="ch10-zero-label">f ≡ 0</text>` : ""}
      ${vectorSvg(state.vector, "x", "x", { ariaLabel: "拖动输入向量 x" })}
      ${!isZero ? vectorSvg(scale(1.25, direction), "读取方向", "measure", { handleRadius: 0, ariaLabel: "测量方向" }) : ""}`;

    const handle = q(svg, '[data-vector-handle="x"]');
    handle?.setAttribute("aria-valuetext", `x 等于 ${format(state.vector[0])}, ${format(state.vector[1])}`);
    return { a, b, value, direction, isZero };
  }

  function mountInteractive(section, root) {
    const lab = q(root, "[data-functional-lab]");
    if (!lab) return;
    const svg = q(lab, "[data-functional-svg]");
    const angleInput = q(lab, "[data-functional-angle]");
    const scaleInput = q(lab, "[data-functional-scale]");
    const xInput = q(lab, "[data-functional-x]");
    const yInput = q(lab, "[data-functional-y]");
    const state = {
      angle: 45,
      magnitude: Math.SQRT2,
      vector: [2, 1],
      layers: { sign: true, levels: true, basis: true },
    };
    let animationFrame = 0;

    const cancelAnimation = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const syncControls = () => {
      angleInput.value = state.angle;
      scaleInput.value = state.magnitude;
      xInput.value = state.vector[0];
      yInput.value = state.vector[1];
      q(lab, "[data-functional-angle-output]").value = `${Math.round(state.angle)}°`;
      q(lab, "[data-functional-scale-output]").value = format(state.magnitude);
      q(lab, "[data-functional-x-output]").value = format(state.vector[0]);
      q(lab, "[data-functional-y-output]").value = format(state.vector[1]);
    };

    const update = () => {
      syncControls();
      const result = renderFunctionalSvg(svg, state);
      q(lab, "[data-functional-formula]").innerHTML = result.isZero
        ? mathInline("f(x)=0")
        : mathInline(`f(x)=${format(result.a)}x_1${result.b >= 0 ? "+" : ""}${format(result.b)}x_2`);
      q(lab, "[data-functional-readout]").innerHTML = result.isZero
        ? `<article><span>函数状态</span><strong>零函数</strong><p>整个平面都是核；没有唯一的读取方向。</p></article>`
        : `
          <article><span>当前读数</span><strong>${format(result.value)}</strong><p>${mathInline(`[${format(result.a)}\\;${format(result.b)}]\\begin{bmatrix}${format(state.vector[0])}\\\\${format(state.vector[1])}\\end{bmatrix}`)}</p></article>
          <article><span>基向量读数</span><strong>f(e₁)=${format(result.a)} · f(e₂)=${format(result.b)}</strong><p>这两个数就是函数在标准基下的行坐标。</p></article>
          <article><span>核直线</span><strong>${format(result.a)}u₁ ${result.b >= 0 ? "+" : "−"} ${format(Math.abs(result.b))}u₂ = 0</strong><p>核只由方向决定，不受整体倍率影响。</p></article>`;

      let title = "读数随位置连续变化";
      let text = "沿当前高亮等值线移动时，读数保持不变；跨过核时符号改变。";
      if (result.isZero) {
        title = "所有向量都被读成 0";
        text = "零函数的核是整个空间，因此等值分层消失。";
      } else if (Math.abs(result.value) < 0.04) {
        title = "向量正位于核上";
        text = "当前位置属于零值层；沿核方向继续移动仍保持 0。";
      } else if (result.value > 0) {
        title = "向量位于正值区域";
        text = "当前等值线给出相同的正读数；向测量方向移动会增大读数。";
      } else {
        title = "向量位于负值区域";
        text = "穿过核后符号翻转；等值线仍与核平行。";
      }
      q(lab, "[data-functional-conclusion]").innerHTML = `<span>当前结论</span><strong>${title}</strong><p>${text}</p>`;
    };

    const applyPreset = (preset) => {
      cancelAnimation();
      const [dx, dy] = preset.direction;
      state.angle = nearZero(dx) && nearZero(dy) ? 0 : (Math.atan2(dy, dx) * 180) / Math.PI;
      state.magnitude = Math.hypot(dx, dy) * preset.scale;
      state.vector = preset.vector.slice();
      qa(lab, "[data-functional-preset]").forEach((button) => {
        const active = button.dataset.functionalPreset === preset.id;
        button.setAttribute("aria-pressed", String(active));
      });
      update();
    };

    const animateVector = (target) => {
      cancelAnimation();
      const start = state.vector.slice();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        state.vector = target;
        update();
        return;
      }
      const started = performance.now();
      const duration = 900;
      const step = (time) => {
        const progress = Math.min(1, (time - started) / duration);
        const eased = 1 - (1 - progress) ** 3;
        state.vector = [
          start[0] + (target[0] - start[0]) * eased,
          start[1] + (target[1] - start[1]) * eased,
        ];
        update();
        if (progress < 1) animationFrame = requestAnimationFrame(step);
        else animationFrame = 0;
      };
      animationFrame = requestAnimationFrame(step);
    };

    angleInput.addEventListener("input", () => { cancelAnimation(); state.angle = Number(angleInput.value); update(); });
    scaleInput.addEventListener("input", () => { cancelAnimation(); state.magnitude = Number(scaleInput.value); update(); });
    xInput.addEventListener("input", () => { cancelAnimation(); state.vector[0] = Number(xInput.value); update(); });
    yInput.addEventListener("input", () => { cancelAnimation(); state.vector[1] = Number(yInput.value); update(); });
    qa(lab, "[data-functional-layer]").forEach((input) => input.addEventListener("change", () => {
      state.layers[input.dataset.functionalLayer] = input.checked;
      update();
    }));
    qa(lab, "[data-functional-preset]").forEach((button) => button.addEventListener("click", () => {
      applyPreset(section.interactive.presets.find((preset) => preset.id === button.dataset.functionalPreset));
    }));
    q(lab, "[data-functional-reset]").addEventListener("click", () => applyPreset(section.interactive.presets[2]));
    qa(lab, "[data-functional-guide]").forEach((button) => button.addEventListener("click", () => {
      const direction = directionFromState(state);
      const perpendicular = [-direction[1], direction[0]];
      if (button.dataset.functionalGuide === "level") animateVector(add(state.vector, scale(2, perpendicular)));
      if (button.dataset.functionalGuide === "cross") animateVector(scale(-2, direction));
      if (button.dataset.functionalGuide === "scale") { state.magnitude = 2; update(); }
    }));
    bindSvgDrag(svg, "x", () => state.vector.slice(), (vector) => { cancelAnimation(); state.vector = vector; update(); });
    applyPreset(section.interactive.presets[2]);
    return cancelAnimation;
  }

  function mountLinearity(section, root) {
    const lab = q(root, "[data-functional-linearity]");
    if (!lab) return;
    let mode = "addition";
    const inputs = {
      x: q(lab, "[data-linearity-x]"),
      y: q(lab, "[data-linearity-y]"),
      lambda: q(lab, "[data-linearity-lambda]"),
    };
    const functional = (value) => 2 * value;
    const update = () => {
      const x = Number(inputs.x.value);
      const y = Number(inputs.y.value);
      const lambda = Number(inputs.lambda.value);
      q(lab, "[data-linearity-x-output]").value = format(x);
      q(lab, "[data-linearity-y-output]").value = format(y);
      q(lab, "[data-linearity-lambda-output]").value = format(lambda);
      const item = section.linearityChecks.find((check) => check.id === mode);
      q(lab, "[data-linearity-left]").innerHTML = item.left;
      q(lab, "[data-linearity-right]").innerHTML = item.right;
      const left = mode === "addition" ? functional(x + y) : functional(lambda * x);
      const right = mode === "addition" ? functional(x) + functional(y) : lambda * functional(x);
      q(lab, "[data-linearity-left-value]").textContent = format(left);
      q(lab, "[data-linearity-right-value]").textContent = format(right);
      q(lab, "[data-linearity-explanation]").textContent = `${item.text} 当前两条路径都得到 ${format(left)}。`;
      qa(lab, "[data-linearity-tab]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.linearityTab === mode)));
    };
    Object.values(inputs).forEach((input) => input.addEventListener("input", update));
    qa(lab, "[data-linearity-tab]").forEach((button) => button.addEventListener("click", () => { mode = button.dataset.linearityTab; update(); }));
    update();
  }

  function mountBasisBuilder(section, root) {
    const builder = q(root, "[data-basis-value-builder]");
    if (!builder) return;
    const svg = q(builder, "[data-basis-builder-svg]");
    let mode = "standard";
    const update = () => {
      const data = section.basisBuilder[mode];
      const basis1 = data.basis[0];
      const basis2 = data.basis[1];
      const matrix = [basis1[0], basis2[0], basis1[1], basis2[1]];
      const inverse = ui.inverse2(matrix);
      const coordinates = inverse ? ui.multiplyMatrixVector(inverse, data.vector) : data.vector;
      const value = coordinates[0] * data.values[0] + coordinates[1] * data.values[1];
      svg.innerHTML = `${markerDefs}<g class="ch10-grid">${gridPaths()}</g>${vectorSvg(basis1, mode === "standard" ? "e₁" : "v₁", "measure", { handleRadius: 0 })}${vectorSvg(basis2, mode === "standard" ? "e₂" : "v₂", "y", { handleRadius: 0 })}${vectorSvg(data.vector, "x", "x", { handleRadius: 0 })}`;
      q(builder, "[data-basis-builder-equation]").innerHTML = `
        <div class="basis-value-cards"><article><span>第一基向量</span><strong>${mode === "standard" ? "f(e₁)" : "f(v₁)"} = ${format(data.values[0])}</strong></article><article><span>第二基向量</span><strong>${mode === "standard" ? "f(e₂)" : "f(v₂)"} = ${format(data.values[1])}</strong></article></div>
        ${mathDisplay(`x=${format(coordinates[0])}${mode === "standard" ? "e_1" : "v_1"}${coordinates[1] >= 0 ? "+" : ""}${format(coordinates[1])}${mode === "standard" ? "e_2" : "v_2"}`)}
        ${mathDisplay(`f(x)=${format(coordinates[0])}(${format(data.values[0])})${coordinates[1] >= 0 ? "+" : ""}${format(coordinates[1])}(${format(data.values[1])})=${format(value)}`)}
        <p>基改变后，坐标与基值都改变；同一个几何函数对同一个几何向量的读数保持不变。</p>`;
      qa(builder, "[data-basis-mode]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.basisMode === mode)));
    };
    qa(builder, "[data-basis-mode]").forEach((button) => button.addEventListener("click", () => { mode = button.dataset.basisMode; update(); }));
    update();
  }

  function mountAffine(root) {
    const comparator = q(root, "[data-affine-comparator]");
    if (!comparator) return;
    const input = q(comparator, "[data-affine-c]");
    const update = () => {
      const c = Number(input.value);
      q(comparator, "[data-affine-c-output]").value = format(c);
      q(comparator, '[data-affine-card="affine"] strong').innerHTML = mathInline(`g(0)=${format(c)}`);
      const linear = nearZero(c);
      q(comparator, "[data-affine-conclusion]").innerHTML = linear
        ? `<strong>此时常数项为 0，两张卡片重合。</strong> ${mathInline("g=f")}，零值层重新穿过原点。`
        : `<strong>等值线仍平行，但结构已经改变。</strong> 因为 ${mathInline(`g(0)=${format(c)}\\ne0`)}，所以 g 不是线性函数。`;
    };
    input.addEventListener("input", update);
    update();
  }

  window.defineChapter10Renderer("linear-functional", {
    renderIntuition,
    renderInteractive,
    renderFormal,
    mountInteractive,
    mountFormal(section, root) {
      mountLinearity(section, root);
      mountBasisBuilder(section, root);
      mountAffine(root);
    },
  });
})();
