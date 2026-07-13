(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const IDENTITY = [1, 0, 0, 1];
  const EPSILON = 1e-9;
  const SQUARE = [
    [0, 0],
    [1.35, 0],
    [1.35, 1.35],
    [0, 1.35],
  ];
  const SAMPLE_VECTOR = [1.15, 0.72];

  const PRESETS = [
    {
      key: "shear",
      label: "剪切",
      kind: "不降秩",
      matrix: [1, 0.8, 0, 1],
      description: "网格被剪斜，但两个基方向仍然独立，完整的二维信息被保留下来。",
    },
    {
      key: "rotation",
      label: "旋转 90°",
      kind: "不降秩",
      matrix: [0, -1, 1, 0],
      description: "平面只改变方向，没有被压扁；逆变换是反向旋转 90°。",
    },
    {
      key: "scale",
      label: "非零伸缩",
      kind: "不降秩",
      matrix: [1.5, 0, 0, 0.65],
      description: "横向拉长、纵向压缩，但两个方向都没有消失，变换仍然可逆。",
    },
    {
      key: "collapse",
      label: "压到直线",
      kind: "降秩对照",
      matrix: [1, 1, 0, 0],
      description: "二维平面被压到一条直线，不同输入可能得到同一个输出，信息无法恢复。",
    },
  ];

  const PRESET_MAP = Object.fromEntries(PRESETS.map((preset) => [preset.key, preset]));

  function normalizeConcepts(section) {
    return (section?.concepts || []).map((concept) =>
      Array.isArray(concept) ? { label: concept[0], text: concept[1] } : concept,
    );
  }

  function renderSection4Formal(formal, section) {
    if (!formal) return;
    const concepts = normalizeConcepts(section);
    formal.innerHTML = `
      <div class="section4-formal-head">
        <div>
          <span>从几何动作回到代数定义</span>
          <h2>定理概念</h2>
        </div>
        <p>先抓住“做完能够原路返回”，再整理可逆的判定与计算。</p>
      </div>
      <div class="section4-formal">
        <div class="definition-stack">
          ${concepts
            .map(
              (concept, index) => `
                <article class="definition-row${index === 0 ? " is-anchor" : ""}">
                  <span class="definition-index">${String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>${concept.label}</strong>
                    <p>${concept.text}</p>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function determinant(matrix) {
    return matrix[0] * matrix[3] - matrix[1] * matrix[2];
  }

  function matrixRank(matrix) {
    if (Math.abs(determinant(matrix)) > EPSILON) return 2;
    return matrix.some((value) => Math.abs(value) > EPSILON) ? 1 : 0;
  }

  function inverse(matrix) {
    const det = determinant(matrix);
    if (Math.abs(det) < EPSILON) return null;
    return [matrix[3] / det, -matrix[1] / det, -matrix[2] / det, matrix[0] / det];
  }

  function multiply(left, right) {
    return [
      left[0] * right[0] + left[1] * right[2],
      left[0] * right[1] + left[1] * right[3],
      left[2] * right[0] + left[3] * right[2],
      left[2] * right[1] + left[3] * right[3],
    ];
  }

  function interpolate(from, to, amount) {
    return from.map((value, index) => value + (to[index] - value) * amount);
  }

  function effectiveMatrix(matrix, journey) {
    if (journey <= 1) return interpolate(IDENTITY, matrix, journey);
    const matrixInverse = inverse(matrix);
    if (!matrixInverse) return matrix;
    const undoProgress = journey - 1;
    const inverseInMotion = interpolate(IDENTITY, matrixInverse, undoProgress);
    return multiply(inverseInMotion, matrix);
  }

  function apply(matrix, point) {
    return [matrix[0] * point[0] + matrix[1] * point[1], matrix[2] * point[0] + matrix[3] * point[1]];
  }

  function cleanNumber(value) {
    if (Math.abs(value) < 0.005) return "0";
    const rounded = Math.round(value * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  }

  function matrixLatex(matrix) {
    return `\\begin{bmatrix}${cleanNumber(matrix[0])}&${cleanNumber(matrix[1])}\\\\${cleanNumber(matrix[2])}&${cleanNumber(matrix[3])}\\end{bmatrix}`;
  }

  function svgPoint(matrix, point, width = 420, height = 420, scale = 68) {
    const transformed = apply(matrix, point);
    return [width / 2 + transformed[0] * scale, height / 2 - transformed[1] * scale];
  }

  function lineMarkup(matrix, from, to, className) {
    const [x1, y1] = svgPoint(matrix, from);
    const [x2, y2] = svgPoint(matrix, to);
    return `<line class="${className}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
  }

  function gridMarkup(matrix, className) {
    const lines = [];
    for (let value = -4; value <= 4; value += 1) {
      lines.push(lineMarkup(matrix, [value, -4], [value, 4], value === 0 ? `${className} is-axis` : className));
      lines.push(lineMarkup(matrix, [-4, value], [4, value], value === 0 ? `${className} is-axis` : className));
    }
    return lines.join("");
  }

  function polygonPoints(matrix, points) {
    return points.map((point) => svgPoint(matrix, point).join(",")).join(" ");
  }

  function presetButtonMarkup(preset, first) {
    const isInvertible = matrixRank(preset.matrix) === 2;
    return `
      <button
        type="button"
        class="inverse-preset${first ? " is-active" : ""}${isInvertible ? "" : " is-singular"}"
        data-inverse-preset="${preset.key}"
        aria-pressed="${first ? "true" : "false"}"
      >
        <span class="inverse-preset-copy">
          <small>${preset.kind}</small>
          <strong>${preset.label}</strong>
        </span>
        <span class="inverse-preset-matrix">${inline(matrixLatex(preset.matrix))}</span>
      </button>
    `;
  }

  function renderSection4Interactive(interactive, section) {
    if (!interactive) return;
    const defaultPreset = PRESETS[0];

    interactive.innerHTML = `
      <h2>交互实验</h2>
      <div class="inverse-transform-lab" data-inverse-transform-lab>
        <header class="inverse-lab-head">
          <div>
            <span class="inverse-lab-kicker">线性变换工作台</span>
            <h3>先用 A 改变平面，再用 A<sup>−1</sup> 原路返回</h3>
            <p>${section?.interactive?.task || "选择一个矩阵 A，先观察它怎样移动基向量和网格；若没有降秩，再应用逆矩阵，把整个变换恢复为单位变换。"}</p>
          </div>
          <div class="inverse-core-rule">
            <span>可逆的核心信号</span>
            <strong>${inline("\\mathbb R^2\\xrightarrow{A}\\mathbb R^2")}</strong>
            <p>${inline("\\operatorname{rank}(A)=2")}，两个独立方向都被保留。</p>
          </div>
        </header>

        <section class="inverse-preset-section" aria-label="选择线性变换">
          <div class="inverse-section-label">
            <span>01</span>
            <div><strong>选择线性变换 A</strong><small>前三个不降秩；最后一个用来观察信息丢失。</small></div>
          </div>
          <div class="inverse-preset-grid">
            ${PRESETS.map((preset, index) => presetButtonMarkup(preset, index === 0)).join("")}
          </div>
        </section>

        <section class="inverse-journey-section">
          <div class="inverse-section-label">
            <span>02</span>
            <div><strong>按顺序执行变换</strong><small>舞台中的浅色网格是原位置，彩色网格是当前结果。</small></div>
          </div>

          <ol class="inverse-journey" aria-label="逆变换的三个阶段">
            <li class="is-current" data-inverse-step="0">
              <span>1</span><div><small>起点</small><strong>${inline("I x=x")}</strong></div>
            </li>
            <li data-inverse-step="1">
              <span>2</span><div><small>应用 A</small><strong>${inline("x\\mapsto Ax")}</strong></div>
            </li>
            <li data-inverse-step="2">
              <span>3</span><div><small>应用 A<sup>−1</sup></small><strong>${inline("A^{-1}Ax=x")}</strong></div>
            </li>
          </ol>

          <div class="inverse-workbench">
            <figure class="inverse-plane-card">
              <div class="inverse-plane-toolbar">
                <div>
                  <span data-inverse-stage-label>单位变换</span>
                  <strong data-inverse-stage-title>平面保持原样</strong>
                </div>
                <div class="inverse-plane-legend" aria-label="图例">
                  <span><i class="is-reference"></i>原网格</span>
                  <span><i class="is-current"></i>当前网格</span>
                </div>
              </div>
              <div class="inverse-plane-wrap">
                <svg class="inverse-plane" viewBox="0 0 420 420" role="img" aria-label="矩阵 A 与逆矩阵作用在二维网格上的连续变化">
                  <defs>
                    <marker id="inverse-basis-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z"></path>
                    </marker>
                    <marker id="inverse-vector-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z"></path>
                    </marker>
                  </defs>
                  <g class="inverse-reference-grid">${gridMarkup(IDENTITY, "inverse-reference-line")}</g>
                  <polygon class="inverse-reference-square" points="${polygonPoints(IDENTITY, SQUARE)}"></polygon>
                  <g data-inverse-grid></g>
                  <polygon class="inverse-current-square" data-inverse-square></polygon>
                  <line class="inverse-basis is-x" data-inverse-basis-x />
                  <line class="inverse-basis is-y" data-inverse-basis-y />
                  <text class="inverse-basis-label is-x" data-inverse-basis-x-label></text>
                  <text class="inverse-basis-label is-y" data-inverse-basis-y-label></text>
                  <line class="inverse-sample-vector" data-inverse-vector />
                  <circle class="inverse-vector-tip" data-inverse-vector-tip r="5" />
                  <text class="inverse-vector-label" data-inverse-vector-label></text>
                </svg>
                <div class="inverse-stage-chip" data-inverse-stage-chip>${inline("I")}</div>
              </div>
              <figcaption data-inverse-caption>起点是单位矩阵 I：基向量、网格与向量 x 都在原位置。</figcaption>
            </figure>

            <aside class="inverse-state-panel" aria-live="polite">
              <div class="inverse-composition">
                <span>当前复合变换</span>
                <strong data-inverse-composition>${inline("I")}</strong>
                <p data-inverse-equation>${inline("Ix=x")}</p>
              </div>

              <dl class="inverse-facts">
                <div><dt>矩阵 A</dt><dd data-inverse-matrix>${inline(matrixLatex(defaultPreset.matrix))}</dd></div>
                <div><dt>${inline("\\operatorname{rank}(A)")}</dt><dd data-inverse-rank>2</dd></div>
                <div><dt>${inline("\\det(A)")}</dt><dd data-inverse-det>1</dd></div>
                <div><dt>维数变化</dt><dd data-inverse-dimension>${inline("2\\to2")}</dd></div>
              </dl>

              <div class="inverse-verdict" data-inverse-verdict>
                <span data-inverse-verdict-kicker>没有降秩</span>
                <strong data-inverse-verdict-title>因此 A 可逆</strong>
                <p data-inverse-explanation>${defaultPreset.description}</p>
              </div>
            </aside>
          </div>

          <div class="inverse-controls">
            <label for="inverse-journey-progress">拖动查看整个过程</label>
            <input id="inverse-journey-progress" data-inverse-progress type="range" min="0" max="2" step="0.01" value="0" />
            <div class="inverse-control-row">
              <button class="button primary" type="button" data-inverse-apply>应用 A</button>
              <button class="button" type="button" data-inverse-undo disabled>应用 A<sup>−1</sup></button>
              <button class="button ghost" type="button" data-inverse-reset>回到起点</button>
              <span data-inverse-result>先点击“应用 A”，观察线性变换怎样改变整个平面。</span>
            </div>
          </div>
        </section>

        <section class="inverse-conclusion" data-inverse-conclusion>
          <span>03</span>
          <div>
            <small>把图像读成公式</small>
            <strong>${inline("A^{-1}A=I")}，同时 ${inline("AA^{-1}=I")}</strong>
            <p>先做 A、再做 A<sup>−1</sup> 时，实际复合顺序是 ${inline("A^{-1}A")}；两个变换抵消，网格和每个向量都回到原位。</p>
          </div>
        </section>
      </div>
    `;

    const lab = interactive.querySelector("[data-inverse-transform-lab]");
    if (!lab) return;

    const elements = {
      grid: lab.querySelector("[data-inverse-grid]"),
      square: lab.querySelector("[data-inverse-square]"),
      basisX: lab.querySelector("[data-inverse-basis-x]"),
      basisY: lab.querySelector("[data-inverse-basis-y]"),
      basisXLabel: lab.querySelector("[data-inverse-basis-x-label]"),
      basisYLabel: lab.querySelector("[data-inverse-basis-y-label]"),
      vector: lab.querySelector("[data-inverse-vector]"),
      vectorTip: lab.querySelector("[data-inverse-vector-tip]"),
      vectorLabel: lab.querySelector("[data-inverse-vector-label]"),
      stageLabel: lab.querySelector("[data-inverse-stage-label]"),
      stageTitle: lab.querySelector("[data-inverse-stage-title]"),
      stageChip: lab.querySelector("[data-inverse-stage-chip]"),
      caption: lab.querySelector("[data-inverse-caption]"),
      composition: lab.querySelector("[data-inverse-composition]"),
      equation: lab.querySelector("[data-inverse-equation]"),
      matrix: lab.querySelector("[data-inverse-matrix]"),
      rank: lab.querySelector("[data-inverse-rank]"),
      determinant: lab.querySelector("[data-inverse-det]"),
      dimension: lab.querySelector("[data-inverse-dimension]"),
      verdict: lab.querySelector("[data-inverse-verdict]"),
      verdictKicker: lab.querySelector("[data-inverse-verdict-kicker]"),
      verdictTitle: lab.querySelector("[data-inverse-verdict-title]"),
      explanation: lab.querySelector("[data-inverse-explanation]"),
      progress: lab.querySelector("[data-inverse-progress]"),
      apply: lab.querySelector("[data-inverse-apply]"),
      undo: lab.querySelector("[data-inverse-undo]"),
      reset: lab.querySelector("[data-inverse-reset]"),
      result: lab.querySelector("[data-inverse-result]"),
      conclusion: lab.querySelector("[data-inverse-conclusion]"),
      steps: [...lab.querySelectorAll("[data-inverse-step]")],
    };

    let presetKey = defaultPreset.key;
    let animationFrame = 0;

    function stopAnimation() {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    function animateTo(target, duration = 900) {
      stopAnimation();
      const startValue = Number(elements.progress.value);
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const actualDuration = reducedMotion ? 0 : duration;
      const start = performance.now();

      function tick(now) {
        if (!lab.isConnected) {
          stopAnimation();
          return;
        }
        const amount = actualDuration === 0 ? 1 : Math.min(1, (now - start) / actualDuration);
        const eased = 1 - Math.pow(1 - amount, 3);
        elements.progress.value = String(startValue + (target - startValue) * eased);
        render();
        if (amount < 1) animationFrame = requestAnimationFrame(tick);
        else animationFrame = 0;
      }

      animationFrame = requestAnimationFrame(tick);
    }

    function setLine(line, from, to) {
      line.setAttribute("x1", from[0]);
      line.setAttribute("y1", from[1]);
      line.setAttribute("x2", to[0]);
      line.setAttribute("y2", to[1]);
    }

    function setLabel(label, point, text) {
      label.setAttribute("x", point[0] + 9);
      label.setAttribute("y", point[1] - 9);
      label.textContent = text;
    }

    function render() {
      const preset = PRESET_MAP[presetKey];
      const rank = matrixRank(preset.matrix);
      const det = determinant(preset.matrix);
      const matrixInverse = inverse(preset.matrix);
      const isSingular = rank < 2;
      const maxJourney = isSingular ? 1 : 2;
      let journey = Math.min(Number(elements.progress.value), maxJourney);
      elements.progress.value = String(journey);
      elements.progress.max = String(maxJourney);

      const currentMatrix = effectiveMatrix(preset.matrix, journey);
      const origin = svgPoint(currentMatrix, [0, 0]);
      const basisX = svgPoint(currentMatrix, [1, 0]);
      const basisY = svgPoint(currentMatrix, [0, 1]);
      const vectorTip = svgPoint(currentMatrix, SAMPLE_VECTOR);
      const stage = journey < 0.02 ? 0 : journey < 1.98 ? 1 : 2;
      const atA = Math.abs(journey - 1) < 0.02;
      const atIdentity = journey < 0.02;
      const restored = journey > 1.98;
      const movingBack = journey > 1.02 && !restored;

      elements.grid.innerHTML = gridMarkup(currentMatrix, "inverse-current-line");
      elements.square.setAttribute("points", polygonPoints(currentMatrix, SQUARE));
      setLine(elements.basisX, origin, basisX);
      setLine(elements.basisY, origin, basisY);
      setLabel(elements.basisXLabel, basisX, stage === 1 ? "Ae₁" : "e₁");
      setLabel(elements.basisYLabel, basisY, stage === 1 ? "Ae₂" : "e₂");
      setLine(elements.vector, origin, vectorTip);
      elements.vectorTip.setAttribute("cx", vectorTip[0]);
      elements.vectorTip.setAttribute("cy", vectorTip[1]);
      setLabel(elements.vectorLabel, vectorTip, stage === 1 ? "Ax" : stage === 2 ? "A⁻¹Ax = x" : "x");

      elements.matrix.innerHTML = inline(matrixLatex(preset.matrix));
      elements.rank.innerHTML = inline(String(rank));
      elements.determinant.innerHTML = inline(cleanNumber(det));
      elements.dimension.innerHTML = isSingular ? inline("2\\to1") : inline("2\\to2");
      elements.explanation.textContent = preset.description;

      lab.classList.toggle("is-singular", isSingular);
      lab.classList.toggle("is-restored", restored);
      elements.verdict.classList.toggle("is-singular", isSingular);
      elements.verdictKicker.textContent = isSingular ? "发生降秩" : "没有降秩";
      elements.verdictTitle.textContent = isSingular ? "因此 A 不可逆" : "因此 A 可逆";

      elements.steps.forEach((stepElement, index) => {
        stepElement.classList.toggle("is-current", index === stage);
        stepElement.classList.toggle("is-complete", index < stage || (index === 1 && restored));
        stepElement.classList.toggle("is-unavailable", isSingular && index === 2);
      });

      if (atIdentity) {
        elements.stageLabel.textContent = "单位变换";
        elements.stageTitle.textContent = "平面保持原样";
        elements.stageChip.innerHTML = inline("I");
        elements.caption.textContent = "起点是单位矩阵 I：基向量、网格与向量 x 都在原位置。";
        elements.composition.innerHTML = inline("I");
        elements.equation.innerHTML = inline("Ix=x");
        elements.result.textContent = "先点击“应用 A”，观察线性变换怎样改变整个平面。";
      } else if (restored) {
        elements.stageLabel.textContent = "逆变换完成";
        elements.stageTitle.textContent = "网格回到原位";
        elements.stageChip.innerHTML = inline("A^{-1}A=I");
        elements.caption.textContent = "A⁻¹ 撤销了 A：两个基向量、单位正方形与向量 x 都回到原位置。";
        elements.composition.innerHTML = inline("A^{-1}A=I");
        elements.equation.innerHTML = inline("A^{-1}(Ax)=(A^{-1}A)x=Ix=x");
        elements.result.textContent = "恢复完成：连续执行 A 与 A⁻¹，最终效果就是单位变换 I。";
      } else if (isSingular && atA) {
        elements.stageLabel.textContent = "应用 A 完成";
        elements.stageTitle.textContent = "二维被压成一维";
        elements.stageChip.innerHTML = inline("A");
        elements.caption.textContent = "网格坍缩到一条线：rank(A)=1，二维信息已经丢失。";
        elements.composition.innerHTML = inline("A");
        elements.equation.innerHTML = inline("x_1\\ne x_2\\;\\text{却可能有}\\;Ax_1=Ax_2");
        elements.result.textContent = "A 已经降秩，没有 A⁻¹ 可以把丢失的方向恢复出来。";
      } else if (atA) {
        elements.stageLabel.textContent = "应用 A 完成";
        elements.stageTitle.textContent = "平面仍然是二维";
        elements.stageChip.innerHTML = inline("A");
        elements.caption.textContent = "A 改变了网格的形状，但 Ae₁、Ae₂ 仍然独立，二维信息完整保留。";
        elements.composition.innerHTML = inline("A");
        elements.equation.innerHTML = inline("x\\mapsto Ax");
        elements.result.textContent = "A 没有降秩：现在点击“应用 A⁻¹”，把这次变换完整撤销。";
      } else {
        elements.stageLabel.textContent = movingBack ? "正在应用 A⁻¹" : "正在应用 A";
        elements.stageTitle.textContent = movingBack ? "变换正在被撤销" : isSingular ? "平面正在坍缩" : "平面仍保持二维";
        elements.stageChip.innerHTML = movingBack ? inline("A^{-1}A") : inline("A");
        elements.caption.textContent = movingBack
          ? "A⁻¹ 正在把 A 的变化逐步撤回；彩色网格与浅色原网格重新重合。"
          : isSingular
            ? "两个基方向逐渐合并，单位正方形的面积正在降为 0。"
            : "A 同时移动两个基向量，并带动整张网格连续变形。";
        elements.composition.innerHTML = movingBack ? inline("A^{-1}A") : inline("A");
        elements.equation.innerHTML = movingBack ? inline("A^{-1}(Ax)\\longrightarrow x") : inline("x\\longrightarrow Ax");
        elements.result.textContent = movingBack
          ? "正在应用 A⁻¹：观察当前网格怎样返回原网格。"
          : "正在应用 A：观察 e₁、e₂ 是否仍然提供两个独立方向。";
      }

      elements.apply.disabled = journey > 0.98;
      elements.undo.disabled = isSingular || !atA;
      elements.undo.title = isSingular
        ? "A 发生降秩，逆矩阵不存在"
        : atA
          ? `应用 ${matrixLatex(matrixInverse)} 撤销 A`
          : "先完整应用 A";
      elements.conclusion.classList.toggle("is-active", restored);
    }

    lab.querySelectorAll("[data-inverse-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        stopAnimation();
        presetKey = button.dataset.inversePreset;
        elements.progress.value = "0";
        lab.querySelectorAll("[data-inverse-preset]").forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        render();
      });
    });

    elements.progress.addEventListener("input", () => {
      stopAnimation();
      render();
    });
    elements.apply.addEventListener("click", () => animateTo(1));
    elements.undo.addEventListener("click", () => {
      if (inverse(PRESET_MAP[presetKey].matrix)) animateTo(2, 1050);
    });
    elements.reset.addEventListener("click", () => animateTo(0, 700));

    render();
  }

  defineChapter4Renderer("matrix-inverse", {
    formal: renderSection4Formal,
    interactive: renderSection4Interactive,
  });
})();
