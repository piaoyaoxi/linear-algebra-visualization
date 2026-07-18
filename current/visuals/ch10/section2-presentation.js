(() => {
  const ui = window.chapter10UI;
  const {
    q, qa, format, nearZero, dot, scale, determinant, inverse2, multiplyMatrixVector,
    mathInline, mathDisplay, markerDefs, gridPaths, vectorSvg, implicitLineSvg,
    toSvgPoint, renderModuleHeading, bindSvgDrag,
  } = ui;

  function measurementStrips(a, b, selectedValue = 0, className = "dual-strip") {
    if (nearZero(Math.hypot(a, b))) return `<text x="50" y="50" text-anchor="middle" class="ch10-zero-label">零函数</text>`;
    return [-4, -2, 0, 2, 4]
      .map((value) => implicitLineSvg(a, b, value, `${className}${nearZero(value - selectedValue, 0.04) ? " is-current" : ""}`, format(value)))
      .join("");
  }

  function renderIntuition(section) {
    return `
      <div class="dual-intuition">
        <div class="dual-who-row">
          <article class="dual-object-card is-vector">
            <span>原空间 V</span>
            <div class="dual-object-visual"><i class="dual-vector-symbol">x</i></div>
            <strong>被测量的对象</strong>
            <p>向量可以相加、缩放，并在空间中表示方向和位置。</p>
          </article>
          <div class="dual-evaluation-channel"><span>输入函数与向量</span><strong>f(x)</strong><i>输出标量</i></div>
          <article class="dual-object-card is-covector">
            <span>对偶空间 V*</span>
            <div class="dual-reader-stack" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
            <strong>测量方法</strong>
            <p>每个对象是一套平行等值层，而不是原空间中的第二支普通箭头。</p>
          </article>
        </div>
        <div class="dual-function-cards">
          ${section.openingFunctions.map((item) => `<article><span>${item.label}</span><strong>f = [${item.coefficients.join("  ")}]</strong><small>它们可以相加，也可以数乘</small></article>`).join("")}
        </div>
        <p class="dual-intuition-conclusion">所有线性测量方法在逐点加法和数乘下封闭，因此它们自己组成一个向量空间。</p>
      </div>`;
  }

  function renderInteractive(section) {
    return `
      <div class="ch10-primary-lab dual-probe-lab" data-dual-probe>
        <div class="ch10-lab-toolbar">
          <div class="ch10-tab-bar" role="tablist" aria-label="观察空间">
            <button type="button" data-dual-view="vector" aria-selected="true">固定 f，看 V 中的等值线</button>
            <button type="button" data-dual-view="functional" aria-selected="false">固定 x，看 V* 中的等值线</button>
          </div>
          <button type="button" class="ch10-reset" data-dual-reset>重置</button>
        </div>
        <div class="dual-probe-layout">
          <article class="dual-plane-card">
            <header><span>向量空间 V</span><strong data-dual-vector-label></strong></header>
            <svg class="ch10-coordinate-stage" viewBox="0 0 100 100" data-dual-vector-svg aria-label="向量空间中的向量和函数等值线"></svg>
            <div class="dual-plane-controls">
              <label>x₁ <input type="range" min="-4" max="4" step="0.1" value="2" data-dual-x1 /><output data-dual-x1-output></output></label>
              <label>x₂ <input type="range" min="-4" max="4" step="0.1" value="1" data-dual-x2 /><output data-dual-x2-output></output></label>
            </div>
          </article>

          <div class="dual-pairing-meter">
            <span>自然配对</span>
            <div class="dual-meter-track"><i data-dual-meter-fill></i><b>0</b></div>
            <strong data-dual-pairing></strong>
            <p data-dual-pairing-copy></p>
          </div>

          <article class="dual-plane-card is-functional-plane">
            <header><span>对偶空间 V*</span><strong data-dual-functional-label></strong></header>
            <svg class="ch10-coordinate-stage" viewBox="0 0 100 100" data-dual-functional-svg aria-label="对偶空间中的函数参数与配对等值线"></svg>
            <div class="dual-plane-controls">
              <label>a <input type="range" min="-4" max="4" step="0.1" value="1" data-dual-a /><output data-dual-a-output></output></label>
              <label>b <input type="range" min="-4" max="4" step="0.1" value="-1" data-dual-b /><output data-dual-b-output></output></label>
            </div>
          </article>
        </div>
        <div class="ch10-live-conclusion" data-dual-conclusion aria-live="polite"></div>
      </div>`;
  }

  function renderReaderPanel(section) {
    return `
      <div class="coordinate-reader" data-coordinate-reader>
        <div class="reader-stage">
          <svg viewBox="0 0 100 100" data-reader-svg aria-label="标准基、输入向量与两个坐标读取器"></svg>
        </div>
        <div class="reader-cards">
          <article data-reader-card="first"><span>第一读取器 e¹</span><div class="reader-strips is-first"><i></i><i></i><i></i></div><strong data-reader-first></strong><p>核沿 e₂ 方向，只读取 e₁ 坐标。</p></article>
          <article data-reader-card="second"><span>第二读取器 e²</span><div class="reader-strips is-second"><i></i><i></i><i></i></div><strong data-reader-second></strong><p>核沿 e₁ 方向，只读取 e₂ 坐标。</p></article>
        </div>
        <div class="reader-pairing-table" aria-label="对偶基配对表">
          <span></span><strong>e₁</strong><strong>e₂</strong>
          <strong>e¹</strong><button type="button" data-reader-cell="0-0">1</button><button type="button" data-reader-cell="0-1">0</button>
          <strong>e²</strong><button type="button" data-reader-cell="1-0">0</button><button type="button" data-reader-cell="1-1">1</button>
        </div>
      </div>`;
  }

  function renderDualBasisBuilder(section) {
    return `
      <div class="dual-basis-builder" data-dual-basis-builder>
        <div class="ch10-preset-group" role="group" aria-label="基向量预设">
          ${section.dualBasisBuilder.presets.map((preset, index) => `<button type="button" data-dual-basis-preset="${preset.id}" aria-pressed="${index === 1}">${preset.label}</button>`).join("")}
        </div>
        <div class="dual-basis-layout">
          <svg viewBox="0 0 100 100" data-dual-basis-svg aria-label="非标准基与对偶读取器的核"></svg>
          <div class="dual-basis-readout" data-dual-basis-readout></div>
        </div>
        <div class="dual-sensitivity" data-dual-sensitivity></div>
      </div>`;
  }

  function renderBalance(section) {
    return `
      <div class="covector-balance" data-covector-balance>
        <div class="ch10-tab-bar" role="tablist">
          <button type="button" data-balance-mode="standard" aria-selected="true">标准基坐标</button>
          <button type="button" data-balance-mode="new" aria-selected="false">新基坐标</button>
        </div>
        <div class="balance-equation" data-balance-equation></div>
        <div class="balance-scales">
          <article><span>向量坐标</span><div data-balance-vector></div><p>列坐标随基改变。</p></article>
          <i>共同保持</i>
          <article><span>函数坐标</span><div data-balance-functional></div><p>行坐标以相反配合方式改变。</p></article>
        </div>
        <div class="balance-invariant" data-balance-invariant></div>
      </div>`;
  }

  function renderStepCards(items, className, buttonLabel) {
    return `
      <div class="${className}" data-step-sequence>
        <div class="step-sequence-track">${items.map((item, index) => `<article data-step-index="${index}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${item.label}</strong><div>${item.formula}</div>${item.text ? `<p>${item.text}</p>` : ""}</article>`).join("")}</div>
        <div class="step-sequence-actions"><button type="button" data-step-previous>上一步</button><span data-step-progress></span><button type="button" data-step-next>${buttonLabel || "下一步"}</button></div>
      </div>`;
  }

  function renderFormal(section) {
    return `
      <div class="ch10-formal-flow">
        <p class="ch10-formal-lead">对偶空间的难点不在计算，而在区分“向量”“函数”“函数的坐标表示”三个层次。下面每个模块只解决一个层次。</p>

        <section class="ch10-module" aria-labelledby="dual-definition-title">
          ${renderModuleHeading("01", "测量方法也组成向量空间", "逐点相加和逐点数乘不会破坏线性。", "dual-definition-title")}
          <div class="ch10-concept-grid">${section.concepts.map((concept) => `<article><span>${concept.label}</span><p>${concept.text}</p></article>`).join("")}</div>
        </section>

        <section class="ch10-module" aria-labelledby="coordinate-reader-title">
          ${renderModuleHeading("02", section.coordinateReaders.title, "对偶基不画成普通箭头，而画成穿过空间的读取层。", "coordinate-reader-title")}
          ${renderReaderPanel(section)}
        </section>

        <section class="ch10-module" aria-labelledby="dual-basis-title">
          ${renderModuleHeading("03", section.dualBasisBuilder.title, "读取器的核沿另一支基向量方向；基越接近共线，读取越敏感。", "dual-basis-title")}
          ${renderDualBasisBuilder(section)}
        </section>

        <section class="ch10-module" aria-labelledby="covector-balance-title">
          ${renderModuleHeading("04", section.balance.title, section.balance.text, "covector-balance-title")}
          ${renderBalance(section)}
        </section>

        <section class="ch10-module" aria-labelledby="double-dual-title">
          ${renderModuleHeading("05", section.doubleDual.title, "向量固定后，可以把所有函数的求值结果作为新的线性读取。", "double-dual-title")}
          ${renderStepCards(section.doubleDual.steps, "double-dual-stepper", "下一步")}
        </section>

        <section class="ch10-module" aria-labelledby="pullback-title">
          ${renderModuleHeading("06", section.pullback.title, "先做 T 再测量，把 W 上的函数拉回成 V 上的函数。", "pullback-title")}
          ${renderStepCards(section.pullback.steps, "pullback-stepper", "沿传送带继续")}
        </section>

        <aside class="ch10-boundary-note"><strong>概念边界</strong><p>${mathInline("\\dim V^*=\\dim V")} 只说明有限维时存在同构；它不等于 ${mathInline("V=V^*")}。相反，${mathInline("V\\to V^{**}")} 的求值映射不依赖基，是自然的。</p></aside>
      </div>`;
  }

  function mountIntuition(section, root) {
    const cards = qa(root, "[data-functional-opening]");
    let index = 0;
    const update = () => cards.forEach((card, cardIndex) => card.classList.toggle("is-active", cardIndex === index));
    update();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => { index = (index + 1) % cards.length; update(); }, 2300);
    return () => window.clearInterval(timer);
  }

  function mountInteractive(section, root) {
    const lab = q(root, "[data-dual-probe]");
    if (!lab) return;
    const vectorSvgNode = q(lab, "[data-dual-vector-svg]");
    const functionalSvgNode = q(lab, "[data-dual-functional-svg]");
    const inputs = {
      x1: q(lab, "[data-dual-x1]"), x2: q(lab, "[data-dual-x2]"),
      a: q(lab, "[data-dual-a]"), b: q(lab, "[data-dual-b]"),
    };
    const state = { vector: [2, 1], functional: [1, -1], view: "vector" };

    const update = () => {
      const [x1, x2] = state.vector;
      const [a, b] = state.functional;
      const pairing = dot(state.functional, state.vector);
      inputs.x1.value = x1; inputs.x2.value = x2; inputs.a.value = a; inputs.b.value = b;
      q(lab, "[data-dual-x1-output]").value = format(x1);
      q(lab, "[data-dual-x2-output]").value = format(x2);
      q(lab, "[data-dual-a-output]").value = format(a);
      q(lab, "[data-dual-b-output]").value = format(b);
      q(lab, "[data-dual-vector-label]").innerHTML = mathInline(`x=\\begin{bmatrix}${format(x1)}\\\\${format(x2)}\end{bmatrix}`);
      q(lab, "[data-dual-functional-label]").innerHTML = mathInline(`f=[${format(a)}\\;${format(b)}]`);

      vectorSvgNode.innerHTML = `${markerDefs}<g class="ch10-grid">${gridPaths()}</g>${state.view === "vector" ? measurementStrips(a, b, pairing, "dual-strip") : ""}${vectorSvg(state.vector, "x", "x", { ariaLabel: "拖动向量 x" })}`;
      const functionPoint = toSvgPoint(state.functional);
      functionalSvgNode.innerHTML = `${markerDefs}<g class="ch10-grid">${gridPaths()}</g>${state.view === "functional" ? measurementStrips(x1, x2, pairing, "dual-functional-strip") : ""}<g class="dual-functional-point" data-functional-point tabindex="0" role="slider" aria-label="拖动线性函数的参数"><circle cx="${functionPoint[0]}" cy="${functionPoint[1]}" r="3"></circle><path d="M${functionPoint[0] - 6} ${functionPoint[1] + 5}L${functionPoint[0] + 6} ${functionPoint[1] - 5}M${functionPoint[0] - 6} ${functionPoint[1] + 9}L${functionPoint[0] + 6} ${functionPoint[1] - 1}"></path><text x="${functionPoint[0] + 4}" y="${functionPoint[1] - 4}">f</text></g>`;

      q(lab, "[data-dual-pairing]").innerHTML = mathInline(`f(x)=${format(pairing)}`);
      q(lab, "[data-dual-pairing-copy]").textContent = state.view === "vector"
        ? "函数固定：V 中每条平行线代表相同读数。"
        : "向量固定：V* 中每条平行线代表一组对 x 给出相同读数的函数。";
      const fill = q(lab, "[data-dual-meter-fill]");
      fill.style.setProperty("--pairing", `${Math.min(100, Math.abs(pairing) * 12)}%`);
      fill.classList.toggle("is-negative", pairing < 0);
      q(lab, "[data-dual-conclusion]").innerHTML = `<span>当前结论</span><strong>${state.view === "vector" ? "函数固定，向量槽线性变化" : "向量固定，函数槽线性变化"}</strong><p>把当前可动对象放大 2 倍，配对值也放大 2 倍；自然配对对两个槽分别线性。</p>`;
      qa(lab, "[data-dual-view]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.dualView === state.view)));
    };

    Object.entries(inputs).forEach(([key, input]) => input.addEventListener("input", () => {
      if (key === "x1") state.vector[0] = Number(input.value);
      if (key === "x2") state.vector[1] = Number(input.value);
      if (key === "a") state.functional[0] = Number(input.value);
      if (key === "b") state.functional[1] = Number(input.value);
      update();
    }));
    qa(lab, "[data-dual-view]").forEach((button) => button.addEventListener("click", () => { state.view = button.dataset.dualView; update(); }));
    q(lab, "[data-dual-reset]").addEventListener("click", () => { state.vector = [2, 1]; state.functional = [1, -1]; state.view = "vector"; update(); });
    bindSvgDrag(vectorSvgNode, "x", () => state.vector.slice(), (vector) => { state.vector = vector; update(); });

    let draggingFunction = false;
    functionalSvgNode.addEventListener("pointerdown", (event) => {
      if (!event.target.closest("[data-functional-point]")) return;
      draggingFunction = true;
      functionalSvgNode.setPointerCapture(event.pointerId);
    });
    functionalSvgNode.addEventListener("pointermove", (event) => {
      if (!draggingFunction) return;
      state.functional = ui.fromPointer(functionalSvgNode, event);
      update();
    });
    functionalSvgNode.addEventListener("pointerup", () => { draggingFunction = false; });
    functionalSvgNode.addEventListener("keydown", (event) => {
      if (!event.target.closest("[data-functional-point]")) return;
      const step = event.shiftKey ? 0.5 : 0.1;
      if (event.key === "ArrowLeft") state.functional[0] -= step;
      else if (event.key === "ArrowRight") state.functional[0] += step;
      else if (event.key === "ArrowDown") state.functional[1] -= step;
      else if (event.key === "ArrowUp") state.functional[1] += step;
      else return;
      event.preventDefault();
      update();
    });
    update();
  }

  function mountCoordinateReader(section, root) {
    const panel = q(root, "[data-coordinate-reader]");
    if (!panel) return;
    const svg = q(panel, "[data-reader-svg]");
    const vector = section.coordinateReaders.vector.slice();
    const update = (highlight = "") => {
      svg.innerHTML = `${markerDefs}<g class="ch10-grid">${gridPaths()}</g>${implicitLineSvg(1, 0, 0, "reader-kernel is-first", "ker e¹")}${implicitLineSvg(0, 1, 0, "reader-kernel is-second", "ker e²")}${vectorSvg([1, 0], "e₁", "measure", { handleRadius: 0 })}${vectorSvg([0, 1], "e₂", "y", { handleRadius: 0 })}${vectorSvg(vector, "x", "x", { handleRadius: 0 })}`;
      q(panel, "[data-reader-first]").innerHTML = mathInline(`e^1(x)=${format(vector[0])}`);
      q(panel, "[data-reader-second]").innerHTML = mathInline(`e^2(x)=${format(vector[1])}`);
      qa(panel, "[data-reader-cell]").forEach((cell) => cell.classList.toggle("is-active", cell.dataset.readerCell === highlight));
      qa(panel, "[data-reader-card]").forEach((card) => card.classList.toggle("is-active", highlight.startsWith(card.dataset.readerCard === "first" ? "0" : "1")));
    };
    qa(panel, "[data-reader-cell]").forEach((cell) => cell.addEventListener("click", () => update(cell.dataset.readerCell)));
    update("0-0");
  }

  function dualRows(basis) {
    const matrix = [basis[0][0], basis[1][0], basis[0][1], basis[1][1]];
    return { matrix, inverse: inverse2(matrix), determinant: determinant(matrix) };
  }

  function mountDualBasis(section, root) {
    const builder = q(root, "[data-dual-basis-builder]");
    if (!builder) return;
    const svg = q(builder, "[data-dual-basis-svg]");
    let active = section.dualBasisBuilder.presets[1];
    const update = () => {
      const { matrix, inverse, determinant: det } = dualRows(active.basis);
      qa(builder, "[data-dual-basis-preset]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.dualBasisPreset === active.id)));
      const basisSvg = `${vectorSvg(active.basis[0], "v₁", "x", { handleRadius: 0 })}${vectorSvg(active.basis[1], "v₂", "y", { handleRadius: 0 })}`;
      if (!inverse) {
        svg.innerHTML = `${markerDefs}<g class="ch10-grid">${gridPaths()}</g>${basisSvg}`;
        q(builder, "[data-dual-basis-readout]").innerHTML = `<div class="dual-basis-error"><strong>这两支向量不构成基</strong><p>${mathInline("\\det P=0")}，无法分别定义“第一坐标”和“第二坐标”，因此对偶基不存在。</p></div>`;
        q(builder, "[data-dual-sensitivity]").innerHTML = `<strong>精确退化</strong><span>停止构造读取器，避免出现数值爆炸残影。</span>`;
        return;
      }
      const row1 = [inverse[0], inverse[1]];
      const row2 = [inverse[2], inverse[3]];
      svg.innerHTML = `${markerDefs}<g class="ch10-grid">${gridPaths()}</g>${measurementStrips(row1[0], row1[1], 0, "dual-basis-strip is-first")}${measurementStrips(row2[0], row2[1], 0, "dual-basis-strip is-second")}${basisSvg}`;
      const pairing = [
        dot(row1, active.basis[0]), dot(row1, active.basis[1]),
        dot(row2, active.basis[0]), dot(row2, active.basis[1]),
      ];
      q(builder, "[data-dual-basis-readout]").innerHTML = `
        <div class="dual-basis-equations">
          <article><span>第一读取器</span>${mathDisplay(`v^1=[${format(row1[0])}\\;${format(row1[1])}]`)}<p>核沿 v₂ 方向。</p></article>
          <article><span>第二读取器</span>${mathDisplay(`v^2=[${format(row2[0])}\\;${format(row2[1])}]`)}<p>核沿 v₁ 方向。</p></article>
        </div>
        <div class="dual-kronecker-live"><span></span><strong>v₁</strong><strong>v₂</strong><strong>v¹</strong><b>${format(pairing[0])}</b><b>${format(pairing[1])}</b><strong>v²</strong><b>${format(pairing[2])}</b><b>${format(pairing[3])}</b></div>
        <p>${mathInline(`P^{-1}=\\begin{bmatrix}${format(inverse[0])}&${format(inverse[1])}\\\\${format(inverse[2])}&${format(inverse[3])}\end{bmatrix}`)}；逆矩阵的两行就是对偶基。</p>`;
      const sensitivity = Math.max(...inverse.map(Math.abs));
      q(builder, "[data-dual-sensitivity]").innerHTML = Math.abs(det) < 0.2
        ? `<strong>接近退化</strong><span>最大读取器系数约为 ${format(sensitivity)}。基向量几乎共线时，微小坐标误差会被明显放大。</span>`
        : `<strong>稳定基</strong><span>${mathInline(`\\det P=${format(det)}`)}，两个坐标可以稳定地区分。</span>`;
    };
    qa(builder, "[data-dual-basis-preset]").forEach((button) => button.addEventListener("click", () => {
      active = section.dualBasisBuilder.presets.find((preset) => preset.id === button.dataset.dualBasisPreset);
      update();
    }));
    update();
  }

  function mountBalance(section, root) {
    const panel = q(root, "[data-covector-balance]");
    if (!panel) return;
    let mode = "standard";
    const standard = section.balance.standardBasis;
    const changed = section.balance.newBasis;
    const newMatrix = [changed[0][0], changed[1][0], changed[0][1], changed[1][1]];
    const inverse = inverse2(newMatrix);
    const vectorNew = multiplyMatrixVector(inverse, section.balance.vector);
    const functionNew = [
      section.balance.functional[0] * newMatrix[0] + section.balance.functional[1] * newMatrix[2],
      section.balance.functional[0] * newMatrix[1] + section.balance.functional[1] * newMatrix[3],
    ];
    const value = dot(section.balance.functional, section.balance.vector);
    const update = () => {
      const vector = mode === "standard" ? section.balance.vector : vectorNew;
      const functional = mode === "standard" ? section.balance.functional : functionNew;
      q(panel, "[data-balance-vector]").innerHTML = mathDisplay(`[x]=\\begin{bmatrix}${format(vector[0])}\\\\${format(vector[1])}\end{bmatrix}`);
      q(panel, "[data-balance-functional]").innerHTML = mathDisplay(`[f]=[${format(functional[0])}\\;${format(functional[1])}]`);
      q(panel, "[data-balance-equation]").innerHTML = mode === "standard" ? mathInline("x=2e_1+e_2") : mathInline(`x=${format(vector[0])}v_1${vector[1] >= 0 ? "+" : ""}${format(vector[1])}v_2`);
      q(panel, "[data-balance-invariant]").innerHTML = `<span>不变量</span><strong>${mathInline(`[f][x]=${format(value)}`)}</strong><p>坐标表示改变，几何配对值不变。</p>`;
      qa(panel, "[data-balance-mode]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.balanceMode === mode)));
    };
    qa(panel, "[data-balance-mode]").forEach((button) => button.addEventListener("click", () => { mode = button.dataset.balanceMode; update(); }));
    update();
  }

  function mountStepSequence(root, selector) {
    qa(root, selector).forEach((sequence) => {
      const cards = qa(sequence, "[data-step-index]");
      let index = 0;
      const update = () => {
        cards.forEach((card, cardIndex) => {
          card.classList.toggle("is-visible", cardIndex <= index);
          card.classList.toggle("is-current", cardIndex === index);
        });
        q(sequence, "[data-step-progress]").textContent = `${index + 1} / ${cards.length}`;
        q(sequence, "[data-step-previous]").disabled = index === 0;
        q(sequence, "[data-step-next]").textContent = index === cards.length - 1 ? "重新播放" : "下一步";
      };
      q(sequence, "[data-step-previous]").addEventListener("click", () => { index = Math.max(0, index - 1); update(); });
      q(sequence, "[data-step-next]").addEventListener("click", () => { index = index === cards.length - 1 ? 0 : index + 1; update(); });
      update();
    });
  }

  window.defineChapter10Renderer("dual-space", {
    renderIntuition,
    renderInteractive,
    renderFormal,
    mountIntuition,
    mountInteractive,
    mountFormal(section, root) {
      mountCoordinateReader(section, root);
      mountDualBasis(section, root);
      mountBalance(section, root);
      mountStepSequence(root, "[data-step-sequence]");
    },
  });
})();
