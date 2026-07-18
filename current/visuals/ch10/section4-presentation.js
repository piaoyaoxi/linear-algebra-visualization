(() => {
  const ui = window.chapter10UI;
  const {
    q, qa, format, nearZero, add, scale, determinant, multiplyMatrixVector,
    transpose2, multiply2, matrixDifferenceNorm, mathInline, mathDisplay,
    markerDefs, gridPaths, vectorSvg, toSvgPoint, renderModuleHeading, bindSvgDrag,
  } = ui;
  const J = [0, 1, -1, 0];

  function pairing(x, y) {
    return x[0] * y[1] - x[1] * y[0];
  }

  function areaPolygon(x, y, className) {
    const points = [[0, 0], x, add(x, y), y].map((point) => toSvgPoint(point).join(",")).join(" ");
    return `<polygon class="ch10-oriented-area ${className}" points="${points}"></polygon>`;
  }

  function renderIntuition() {
    return `
      <div class="symplectic-intuition">
        <div class="oriented-area-sequence">
          <article><span>01</span><div class="area-mini is-positive"><i></i><b>x</b><em>y</em></div><strong>逆时针顺序</strong><p>有向面积为正。</p></article>
          <article><span>02</span><div class="area-mini is-negative"><i></i><b>y</b><em>x</em></div><strong>交换输入</strong><p>面积绝对值不变，符号反转。</p></article>
          <article><span>03</span><div class="area-mini is-zero"><i></i><b>x</b><em>y</em></div><strong>两向量共线</strong><p>平行四边形收缩为 0。</p></article>
        </div>
        <div class="symplectic-intro-equation">
          <span>二维入口</span>
          ${mathDisplay("\\omega(x,y)=\\det[x\\;y]=x^TJy")}
          <p>这只是辛结构的入口。高维中还要保留全部配对关系，而不仅仅是总体积。</p>
        </div>
      </div>`;
  }

  function renderInteractive(section) {
    return `
      <div class="ch10-primary-lab symplectic-area-lab" data-symplectic-area>
        <div class="ch10-lab-toolbar">
          <div class="ch10-tab-bar" role="tablist">
            <button type="button" data-symplectic-mode="pairing" aria-selected="true">先研究有向面积</button>
            <button type="button" data-symplectic-mode="transform" aria-selected="false">再比较线性变换</button>
          </div>
          <button type="button" class="ch10-reset" data-symplectic-reset>重置</button>
        </div>

        <div class="symplectic-pairing-view" data-symplectic-view="pairing">
          <div class="ch10-lab-layout">
            <div class="ch10-canvas-column">
              <div class="ch10-canvas-head"><div><span>有向面积</span><strong data-symplectic-caption></strong></div></div>
              <svg class="ch10-coordinate-stage" viewBox="0 0 100 100" data-symplectic-svg aria-label="两个向量与有向平行四边形"></svg>
              <div class="ch10-guided-actions">
                <button type="button" data-area-action="swap">交换 x 与 y</button>
                <button type="button" data-area-action="collinear">令 y 与 x 共线</button>
                <button type="button" data-area-action="scale">把 x 放大 2 倍</button>
                <button type="button" data-area-action="shear">令 y ← y+x</button>
              </div>
            </div>
            <aside class="ch10-control-column">
              <div class="ch10-live-conclusion" data-symplectic-conclusion aria-live="polite"></div>
              <section class="ch10-control-group"><header><strong>向量 x</strong><span>青绿色</span></header><label class="ch10-control-row">x₁ <output data-sx1-output></output><input type="range" min="-3" max="3" step="0.1" value="2" data-sx1 /></label><label class="ch10-control-row">x₂ <output data-sx2-output></output><input type="range" min="-3" max="3" step="0.1" value="1" data-sx2 /></label></section>
              <section class="ch10-control-group"><header><strong>向量 y</strong><span>珊瑚色</span></header><label class="ch10-control-row">y₁ <output data-sy1-output></output><input type="range" min="-3" max="3" step="0.1" value="-1" data-sy1 /></label><label class="ch10-control-row">y₂ <output data-sy2-output></output><input type="range" min="-3" max="3" step="0.1" value="2" data-sy2 /></label></section>
              <div class="ch10-readout-grid" data-symplectic-readout></div>
            </aside>
          </div>
        </div>

        <div class="symplectic-transform-view" data-symplectic-view="transform" hidden>
          <div class="ch10-preset-group" role="group" aria-label="线性变换预设">
            ${section.transformLab.presets.map((preset, index) => `<button type="button" data-symplectic-preset="${preset.id}" aria-pressed="${index === 1}">${preset.label}</button>`).join("")}
          </div>
          <div class="symplectic-transform-grid">
            <article><header><span>变换前</span><strong data-transform-before-caption></strong></header><svg viewBox="0 0 100 100" data-transform-before></svg></article>
            <div class="transform-matrix-card"><span>线性变换 S</span><div data-transform-matrix></div><label>参数 t <input type="range" min="-2" max="2" step="0.1" value="1" data-transform-parameter /><output data-transform-parameter-output></output></label></div>
            <article><header><span>变换后</span><strong data-transform-after-caption></strong></header><svg viewBox="0 0 100 100" data-transform-after></svg></article>
          </div>
          <div class="symplectic-transform-verdict" data-transform-verdict></div>
        </div>
      </div>`;
  }

  function renderJLense(section) {
    return `
      <div class="j-lens" data-j-lens>
        <div class="j-flow">${section.jLens.steps.map((step, index) => `<article data-j-step="${index}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${step.label}</strong><div>${step.formula}</div></article>${index < section.jLens.steps.length - 1 ? "<i>→</i>" : ""}`).join("")}</div>
        <div class="j-stage"><svg viewBox="0 0 100 100" data-j-svg aria-label="y、Jy 与 x 的配对计算"></svg><div data-j-readout></div></div>
        <button type="button" data-j-next>沿计算路径前进</button>
      </div>`;
  }

  function renderStructureTests(section) {
    return `
      <div class="symplectic-tests" data-symplectic-tests>
        <article data-test-kind="alternating"><span>${section.structureTests.alternating.label}</span><div>${section.structureTests.alternating.formula}</div><p>${section.structureTests.alternating.text}</p><button type="button" data-test-action="merge">让 y 逐渐靠近 x</button><strong data-alternating-result></strong></article>
        <article data-test-kind="nondegenerate"><span>${section.structureTests.nondegenerate.label}</span><div>${section.structureTests.nondegenerate.formula}</div><p>${section.structureTests.nondegenerate.text}</p><label>让 y 绕 x 搜索 <input type="range" min="0" max="360" value="0" data-nondegenerate-angle /></label><strong data-nondegenerate-result></strong></article>
        <article class="is-degenerate"><span>${section.structureTests.degenerateContrast.label}</span><div class="degenerate-direction"><i></i><b>隐身方向</b></div><p>${section.structureTests.degenerateContrast.text}</p><strong>只满足交错，不满足非退化</strong></article>
      </div>`;
  }

  function renderEvenDimension(section) {
    return `
      <div class="even-dimension-explainer" data-even-dimension>
        <div class="paired-planes"><article><span>(e₁,f₁)</span><div class="paired-plane-mini"></div><strong>一个面积单元</strong></article><article><span>(e₂,f₂)</span><div class="paired-plane-mini is-second"></div><strong>另一个面积单元</strong></article><article class="unpaired-direction"><span>剩余方向</span><div></div><strong>无法非退化地配对</strong></article></div>
        <ol>${section.evenDimension.algebra.map((item) => `<li>${item}</li>`).join("")}</ol>
      </div>`;
  }

  function renderBasisComposer(section) {
    return `
      <div class="symplectic-basis-composer" data-symplectic-basis>
        <div class="basis-pair-cards"><article><span>第一对</span><strong>(e₁,f₁)</strong><p>ω(e₁,f₁)=1</p></article><article><span>第二对</span><strong>(e₂,f₂)</strong><p>ω(e₂,f₂)=1</p></article></div>
        <div class="symplectic-pairing-table"><span></span>${section.symplecticBasis.order.map((label) => `<strong>${label}</strong>`).join("")}${section.symplecticBasis.order.map((rowLabel, row) => `<strong>${rowLabel}</strong>${section.symplecticBasis.pairings[row].map((value, column) => `<button type="button" data-symplectic-cell="${row}-${column}" data-value="${value}">${value}</button>`).join("")}`).join("")}</div>
        <p data-symplectic-basis-copy>${section.symplecticBasis.task}</p>
      </div>`;
  }

  function renderPreservation(section) {
    return `
      <div class="preservation-comparison" data-preservation-comparison>
        ${section.preservationCompare.map((item) => `<article data-preservation="${item.id}"><span>${item.title}</span><strong>${item.keeps}</strong><div>${item.condition}</div><p>${item.visual}</p></article>`).join("")}
        <aside><strong>${section.highDimCounterexample.title}</strong><div>${section.highDimCounterexample.matrix}</div><p>${section.highDimCounterexample.determinant}，但 ${section.highDimCounterexample.failure}。${section.highDimCounterexample.text}</p></aside>
      </div>`;
  }

  function renderComplement(section) {
    return `
      <div class="symplectic-complement" data-symplectic-complement>
        <div class="complement-definition"><span>定义</span>${section.complement.definition}<p>${section.complement.conclusion}</p></div>
        <svg viewBox="0 0 100 100" data-complement-svg aria-label="一条直线与它的辛正交补"></svg>
        <label>搜索方向 <input type="range" min="-180" max="180" value="65" data-complement-angle /><output data-complement-output></output></label>
        <div data-complement-result></div>
      </div>`;
  }

  function renderFormal(section) {
    return `
      <div class="ch10-formal-flow">
        <p class="ch10-formal-lead">二维面积负责建立入口；随后必须把交错、非退化、偶数维、辛基与辛变换逐层分开，避免把辛空间缩成一句“高维面积”。</p>
        <section class="ch10-module" aria-labelledby="symplectic-definition-title">${renderModuleHeading("01", "交错且非退化", "这两个条件回答不同问题，缺一不可。", "symplectic-definition-title")}<div class="ch10-concept-grid">${section.concepts.map((concept) => `<article><span>${concept.label}</span><p>${concept.text}</p></article>`).join("")}</div></section>
        <section class="ch10-module" aria-labelledby="j-lens-title">${renderModuleHeading("02", section.jLens.title, "把矩阵公式拆成可追踪的计算路径，再落回有向面积。", "j-lens-title")}${renderJLense(section)}</section>
        <section class="ch10-module" aria-labelledby="symplectic-tests-title">${renderModuleHeading("03", section.structureTests.title, "交错检查自配对；非退化检查有没有对所有搭档都不可见的方向。", "symplectic-tests-title")}${renderStructureTests(section)}</section>
        <section class="ch10-module" aria-labelledby="even-dimension-title">${renderModuleHeading("04", section.evenDimension.title, "视觉层看成成对面积单元，代数层看奇数阶斜对称矩阵。", "even-dimension-title")}${renderEvenDimension(section)}</section>
        <section class="ch10-module" aria-labelledby="symplectic-basis-title">${renderModuleHeading("05", section.symplecticBasis.title, "四维不伪装成三维箭头；用成对平面和配对矩阵表达。", "symplectic-basis-title")}${renderBasisComposer(section)}</section>
        <section class="ch10-module" aria-labelledby="preservation-title">${renderModuleHeading("06", "辛、正交、体积保持有什么不同", "比较它们分别保持的对象与矩阵条件。", "preservation-title")}${renderPreservation(section)}</section>
        <section class="ch10-module" aria-labelledby="complement-title">${renderModuleHeading("07", section.complement.title, "二维中的反直觉现象：一条非零直线的辛正交补就是它自身。", "complement-title")}${renderComplement(section)}</section>
        <aside class="ch10-boundary-note"><strong>概念边界</strong><p>二维中 ${mathInline("S^TJS=(\\det S)J")}，所以 ${mathInline("Sp(2,\\mathbb R)=SL(2,\\mathbb R)")}。这一特殊结论不能直接推广到更高维。</p></aside>
      </div>`;
  }

  function transformMatrix(kind, parameter) {
    if (kind === "identity") return [1, 0, 0, 1];
    if (kind === "shear") return [1, parameter, 0, 1];
    if (kind === "rotation") {
      const angle = parameter * Math.PI / 3;
      return [Math.cos(angle), -Math.sin(angle), Math.sin(angle), Math.cos(angle)];
    }
    if (kind === "reciprocal") {
      const s = parameter >= 0 ? 1 + Math.abs(parameter) : 1 / (1 + Math.abs(parameter));
      return [s, 0, 0, 1 / s];
    }
    const s = parameter >= 0 ? 1 + Math.abs(parameter) : 1 / (1 + Math.abs(parameter));
    return [s, 0, 0, s];
  }

  function matrixHtml(matrix) {
    return mathDisplay(`\\begin{bmatrix}${format(matrix[0])}&${format(matrix[1])}\\\\${format(matrix[2])}&${format(matrix[3])}\\end{bmatrix}`);
  }

  function drawArea(svg, x, y, interactive = true) {
    const value = pairing(x, y);
    svg.innerHTML = `${markerDefs}<g class="ch10-grid">${gridPaths()}</g>${areaPolygon(x, y, value >= 0 ? "is-positive" : "is-negative")}${vectorSvg(x, "x", "x", { handleRadius: interactive ? 2.5 : 0, ariaLabel: "向量 x" })}${vectorSvg(y, "y", "y", { handleRadius: interactive ? 2.5 : 0, ariaLabel: "向量 y" })}`;
    return value;
  }

  function mountInteractive(section, root) {
    const lab = q(root, "[data-symplectic-area]");
    if (!lab) return;
    const svg = q(lab, "[data-symplectic-svg]");
    const beforeSvg = q(lab, "[data-transform-before]");
    const afterSvg = q(lab, "[data-transform-after]");
    const inputs = { x1: q(lab, "[data-sx1]"), x2: q(lab, "[data-sx2]"), y1: q(lab, "[data-sy1]"), y2: q(lab, "[data-sy2]") };
    const parameterInput = q(lab, "[data-transform-parameter]");
    const state = { x: [2, 1], y: [-1, 2], mode: "pairing", transform: "shear", parameter: 1 };

    const updatePairing = () => {
      Object.entries(inputs).forEach(([key, input]) => {
        const vector = key.startsWith("x") ? state.x : state.y;
        const value = vector[Number(key[1]) - 1];
        input.value = value;
        q(lab, `[data-s${key}-output]`).value = format(value);
      });
      const value = drawArea(svg, state.x, state.y, true);
      const orientation = nearZero(value, 0.001) ? "共线 · 配对为 0" : value > 0 ? "逆时针 · 正配对" : "顺时针 · 负配对";
      q(lab, "[data-symplectic-caption]").innerHTML = mathInline(`\\omega(x,y)=${format(value)}`);
      q(lab, "[data-symplectic-readout]").innerHTML = `
        <article><span>有向面积</span><strong>${format(value)}</strong><p>${orientation}</p></article>
        <article><span>交换顺序</span><strong>${format(-value)}</strong><p>${mathInline("\\omega(y,x)=-\\omega(x,y)")}</p></article>
        <article><span>自配对</span><strong>0</strong><p>${mathInline("\\omega(x,x)=0")}</p></article>`;
      q(lab, "[data-symplectic-conclusion]").innerHTML = nearZero(value, 0.001)
        ? `<span>当前结论</span><strong>这两个向量共线</strong><p>这一对向量的配对为 0，但这并不说明整个辛形式退化。</p>`
        : `<span>当前结论</span><strong>${orientation}</strong><p>交换输入只翻转符号；把一个输入加上另一个输入的倍数不会改变面积。</p>`;
    };

    const updateTransform = () => {
      const preset = section.transformLab.presets.find((item) => item.id === state.transform);
      const S = transformMatrix(preset.kind, state.parameter);
      const sx = multiplyMatrixVector(S, state.x);
      const sy = multiplyMatrixVector(S, state.y);
      const before = drawArea(beforeSvg, state.x, state.y, false);
      const after = drawArea(afterSvg, sx, sy, false);
      q(lab, "[data-transform-before-caption]").innerHTML = mathInline(`\\omega(x,y)=${format(before)}`);
      q(lab, "[data-transform-after-caption]").innerHTML = mathInline(`\\omega(Sx,Sy)=${format(after)}`);
      q(lab, "[data-transform-matrix]").innerHTML = matrixHtml(S);
      parameterInput.value = state.parameter;
      q(lab, "[data-transform-parameter-output]").value = format(state.parameter);
      const errorMatrix = multiply2(transpose2(S), multiply2(J, S));
      const error = matrixDifferenceNorm(errorMatrix, J);
      const isSymplectic = error < ui.EPS.symplectic;
      q(lab, "[data-transform-verdict]").innerHTML = `
        <article><span>矩阵检验</span><strong>${isSymplectic ? "SᵀJS = J" : "SᵀJS ≠ J"}</strong><div>${matrixHtml(errorMatrix)}</div></article>
        <article><span>配对检验</span><strong>${format(after)} ${isSymplectic ? "=" : "≠"} ${format(before)}</strong><p>${isSymplectic ? "长度和角度可以改变，但辛配对保持。" : "该变换改变了辛配对。"}</p></article>
        <article><span>二维行列式</span><strong>${format(determinant(S))}</strong><p>二维可快速判断；高维仍必须检查完整矩阵条件。</p></article>`;
      qa(lab, "[data-symplectic-preset]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.symplecticPreset === state.transform)));
    };

    const updateMode = () => {
      qa(lab, "[data-symplectic-view]").forEach((view) => { view.hidden = view.dataset.symplecticView !== state.mode; });
      qa(lab, "[data-symplectic-mode]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.symplecticMode === state.mode)));
      if (state.mode === "pairing") updatePairing(); else updateTransform();
    };

    Object.entries(inputs).forEach(([key, input]) => input.addEventListener("input", () => {
      const vector = key.startsWith("x") ? state.x : state.y;
      vector[Number(key[1]) - 1] = Number(input.value);
      updatePairing();
      updateTransform();
    }));
    qa(lab, "[data-area-action]").forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.areaAction === "swap") { const copy = state.x; state.x = state.y; state.y = copy; }
      if (button.dataset.areaAction === "collinear") state.y = scale(0.75, state.x);
      if (button.dataset.areaAction === "scale") state.x = scale(2, state.x);
      if (button.dataset.areaAction === "shear") state.y = add(state.y, state.x);
      updatePairing();
      updateTransform();
    }));
    qa(lab, "[data-symplectic-mode]").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.symplecticMode; updateMode(); }));
    qa(lab, "[data-symplectic-preset]").forEach((button) => button.addEventListener("click", () => { state.transform = button.dataset.symplecticPreset; updateTransform(); }));
    parameterInput.addEventListener("input", () => { state.parameter = Number(parameterInput.value); updateTransform(); });
    q(lab, "[data-symplectic-reset]").addEventListener("click", () => { state.x = [2, 1]; state.y = [-1, 2]; state.mode = "pairing"; state.transform = "shear"; state.parameter = 1; updateMode(); updateTransform(); });
    bindSvgDrag(svg, "x", () => state.x.slice(), (vector) => { state.x = vector; updatePairing(); updateTransform(); });
    bindSvgDrag(svg, "y", () => state.y.slice(), (vector) => { state.y = vector; updatePairing(); updateTransform(); });
    updateMode();
    updateTransform();
  }

  function mountJLense(section, root) {
    const panel = q(root, "[data-j-lens]");
    if (!panel) return;
    const svg = q(panel, "[data-j-svg]");
    const x = section.jLens.vectorX;
    const y = section.jLens.vectorY;
    const Jy = multiplyMatrixVector(J, y);
    let step = 0;
    const update = () => {
      qa(panel, "[data-j-step]").forEach((card, index) => { card.classList.toggle("is-visible", index <= step); card.classList.toggle("is-current", index === step); });
      svg.innerHTML = `${markerDefs}<g class="ch10-grid">${gridPaths()}</g>${vectorSvg(x, "x", "x", { handleRadius: 0 })}${step >= 1 ? vectorSvg(y, "y", "y", { handleRadius: 0 }) : ""}${step >= 2 ? vectorSvg(Jy, "Jy", "measure", { handleRadius: 0 }) : ""}${step >= 3 ? areaPolygon(x, y, pairing(x, y) >= 0 ? "is-positive" : "is-negative") : ""}`;
      q(panel, "[data-j-readout]").innerHTML = step === 0 ? `<strong>先固定左输入 x</strong>` : step === 1 ? `<strong>右输入 y 进入 J</strong>` : step === 2 ? `${mathDisplay(`Jy=\\begin{bmatrix}${format(Jy[0])}\\\\${format(Jy[1])}\\end{bmatrix}`)}<p>在当前符号约定下，J 把 y 改写为可由 xᵀ 读取的方向。</p>` : `${mathDisplay(`x^TJy=${format(pairing(x, y))}=\\det[x\\;y]`)}<p>矩阵路径与有向面积路径汇合。</p>`;
      q(panel, "[data-j-next]").textContent = step === 3 ? "重新查看" : "沿计算路径前进";
    };
    q(panel, "[data-j-next]").addEventListener("click", () => { step = step === 3 ? 0 : step + 1; update(); });
    update();
  }

  function mountTests(section, root) {
    const panel = q(root, "[data-symplectic-tests]");
    if (!panel) return;
    const x = [2, 1];
    const angleInput = q(panel, "[data-nondegenerate-angle]");
    let mergeProgress = 0;
    const updateAlternating = () => {
      const y = [2 - mergeProgress, -1 + 2 * mergeProgress];
      const value = pairing(x, y);
      q(panel, "[data-alternating-result]").innerHTML = `${mathInline(`\\omega(x,y)=${format(value)}`)}${mergeProgress === 1 ? "，两个输入已经相同。" : ""}`;
    };
    q(panel, "[data-test-action=merge]").addEventListener("click", () => { mergeProgress = mergeProgress === 1 ? 0 : 1; updateAlternating(); });
    const updateNondegenerate = () => {
      const angle = Number(angleInput.value) * Math.PI / 180;
      const y = [Math.cos(angle), Math.sin(angle)];
      const value = pairing(x, y);
      q(panel, "[data-nondegenerate-result]").innerHTML = `${mathInline(`\\omega(x,y)=${format(value)}`)} · ${nearZero(value, 0.03) ? "当前搭档共线，继续旋转。" : "已经找到非零配对。"}`;
    };
    angleInput.addEventListener("input", updateNondegenerate);
    updateAlternating();
    updateNondegenerate();
  }

  function mountBasis(section, root) {
    const panel = q(root, "[data-symplectic-basis]");
    if (!panel) return;
    qa(panel, "[data-symplectic-cell]").forEach((cell) => cell.addEventListener("click", () => {
      const [row, column] = cell.dataset.symplecticCell.split("-").map(Number);
      const value = Number(cell.dataset.value);
      qa(panel, "[data-symplectic-cell]").forEach((item) => item.classList.toggle("is-active", item === cell));
      const rowLabel = section.symplecticBasis.order[row];
      const columnLabel = section.symplecticBasis.order[column];
      q(panel, "[data-symplectic-basis-copy]").innerHTML = `${mathInline(`\\omega(${rowLabel.replace(/<[^>]+>/g, "")},${columnLabel.replace(/<[^>]+>/g, "")})=${value}`)}。${value === 0 ? "这两个基方向不构成配对单元。" : value > 0 ? "按标准顺序形成正面积单元。" : "交换顺序后符号翻转。"}`;
    }));
  }

  function mountComplement(section, root) {
    const panel = q(root, "[data-symplectic-complement]");
    if (!panel) return;
    const svg = q(panel, "[data-complement-svg]");
    const input = q(panel, "[data-complement-angle]");
    const u = section.complement.vector;
    const update = () => {
      const angle = Number(input.value) * Math.PI / 180;
      const v = [2 * Math.cos(angle), 2 * Math.sin(angle)];
      const value = pairing(v, u);
      input.nextElementSibling.value = `${Math.round(Number(input.value))}°`;
      svg.innerHTML = `${markerDefs}<g class="ch10-grid">${gridPaths()}</g><line class="complement-line" x1="${toSvgPoint(scale(-4, u))[0]}" y1="${toSvgPoint(scale(-4, u))[1]}" x2="${toSvgPoint(scale(4, u))[0]}" y2="${toSvgPoint(scale(4, u))[1]}"></line>${vectorSvg(u, "u", "x", { handleRadius: 0 })}${vectorSvg(v, "v", "y", { handleRadius: 0 })}`;
      q(panel, "[data-complement-result]").innerHTML = `<strong>${mathInline(`\\omega(v,u)=${format(value)}`)}</strong><p>${nearZero(value, 0.03) ? "v 与 u 共线，因此 v 属于 U 的辛正交补。" : "继续旋转 v；只有与 u 共线时配对为 0。"}</p>`;
    };
    input.addEventListener("input", update);
    update();
  }

  window.defineChapter10Renderer("symplectic-space", {
    renderIntuition,
    renderInteractive,
    renderFormal,
    mountInteractive,
    mountFormal(section, root) {
      mountJLense(section, root);
      mountTests(section, root);
      mountBasis(section, root);
      mountComplement(section, root);
    },
  });
})();
