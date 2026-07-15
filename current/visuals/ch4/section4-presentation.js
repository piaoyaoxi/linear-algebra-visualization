(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const IDENTITY = [1, 0, 0, 1];
  const EPSILON = 1e-9;
  const SQUARE = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];
  const SAMPLE_VECTOR = [0.68, 0.58];

  const PRESETS = [
    {
      key: "shear",
      label: "剪切",
      matrix: [1, 0.8, 0, 1],
      description: "网格被剪斜，但两个基方向仍然独立，完整的二维信息被保留下来。",
    },
    {
      key: "rotation",
      label: "旋转 90°",
      matrix: [0, -1, 1, 0],
      description: "平面只改变方向，没有被压扁；逆变换是反向旋转 90°。",
    },
    {
      key: "scale",
      label: "非零伸缩",
      matrix: [1.5, 0, 0, 0.65],
      description: "横向拉长、纵向压缩，但两个方向都没有消失，变换仍然可逆。",
    },
    {
      key: "collapse",
      label: "压到直线",
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

  function svgPoint(matrix, point, width = 420, height = 320, scale = 60) {
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
          <small><i aria-hidden="true"></i>${isInvertible ? "可逆" : "降秩"}</small>
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
            <h3>A 改变平面，A<sup>−1</sup> 把它还原</h3>
            <p>${section?.interactive?.task || "选择一个矩阵 A，观察基向量与网格如何变化；若两个方向都被保留，再应用逆矩阵回到单位变换。"}</p>
          </div>
          <div class="inverse-core-rule" aria-label="二维矩阵可逆判据">
            <span>二维可逆判据</span>
            <strong>${inline("\\operatorname{rank}(A)=2\\iff A^{-1}\\text{ 存在}")}</strong>
          </div>
        </header>

        <section class="inverse-preset-section" aria-label="选择线性变换">
          <div class="inverse-compact-heading">
            <strong>矩阵 A</strong>
            <small>选择一个变换</small>
          </div>
          <div class="inverse-preset-grid">
            ${PRESETS.map((preset, index) => presetButtonMarkup(preset, index === 0)).join("")}
          </div>
        </section>

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
              <svg class="inverse-plane" viewBox="0 0 420 320" role="img" aria-label="矩阵 A 与逆矩阵作用在二维网格上的连续变化">
                <defs>
                  <marker id="inverse-basis-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z"></path>
                  </marker>
                  <marker id="inverse-vector-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
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
                <text class="inverse-vector-label" data-inverse-vector-label></text>
              </svg>
            </div>
            <figcaption data-inverse-caption>起点：单位正方形的两条邻边正是 e₁ 与 e₂。</figcaption>
          </figure>

          <aside class="inverse-control-panel" aria-live="polite">
            <section class="inverse-stage-control" data-inverse-stage-control>
              <div class="inverse-control-heading">
                <div>
                  <span>变换路径</span>
                  <strong>三个阶段</strong>
                </div>
                <div class="inverse-composition">
                  <span>当前复合</span>
                  <strong data-inverse-composition>${inline("I")}</strong>
                </div>
              </div>

              <ol class="inverse-journey" aria-label="逆变换的三个阶段">
                <li class="is-current" data-inverse-step="0">
                  <button type="button" data-inverse-jump="0">
                    <span>01</span><small>起点</small><strong>${inline("I")}</strong>
                  </button>
                </li>
                <li data-inverse-step="1">
                  <button type="button" data-inverse-jump="1">
                    <span>02</span><small>应用 A</small><strong>${inline("A")}</strong>
                  </button>
                </li>
                <li data-inverse-step="2">
                  <button type="button" data-inverse-jump="2">
                    <span>03</span><small>应用 A<sup>−1</sup></small><strong>${inline("A^{-1}A=I")}</strong>
                  </button>
                </li>
              </ol>

              <div class="inverse-range-shell">
                <input
                  id="inverse-journey-progress"
                  data-inverse-progress
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value="0"
                  aria-label="在单位变换、应用 A、应用 A 逆三个阶段之间拖动"
                />
                <div class="inverse-range-marks" aria-hidden="true"><i></i><i></i><i></i></div>
              </div>

              <p class="inverse-equation" data-inverse-equation>${inline("Ix=x")}</p>
              <div class="inverse-control-row">
                <button class="button primary" type="button" data-inverse-next>应用 A</button>
                <button class="button ghost" type="button" data-inverse-reset>回到起点</button>
              </div>
            </section>

            <section class="inverse-state-summary" data-inverse-verdict>
              <div class="inverse-decision-heading">
                <div>
                  <span data-inverse-verdict-kicker>二维保留</span>
                  <strong data-inverse-verdict-title>A 可逆</strong>
                </div>
                <div class="inverse-conclusion" data-inverse-conclusion>
                  <small data-inverse-conclusion-label>两侧逆</small>
                  <strong data-inverse-conclusion-formula>${inline("A^{-1}A=I")} · ${inline("AA^{-1}=I")}</strong>
                </div>
              </div>

              <dl class="inverse-facts">
                <div class="is-matrix"><dt>矩阵 A</dt><dd data-inverse-matrix>${inline(matrixLatex(defaultPreset.matrix))}</dd></div>
                <div><dt>${inline("\\operatorname{rank}(A)")}</dt><dd data-inverse-rank>2</dd></div>
                <div><dt>${inline("\\det(A)")}</dt><dd data-inverse-det>1</dd></div>
                <div><dt>空间</dt><dd data-inverse-dimension>${inline("2\\to2")}</dd></div>
              </dl>
              <p class="inverse-explanation" data-inverse-explanation>${defaultPreset.description}</p>
            </section>
          </aside>
        </div>
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
      vectorLabel: lab.querySelector("[data-inverse-vector-label]"),
      stageLabel: lab.querySelector("[data-inverse-stage-label]"),
      stageTitle: lab.querySelector("[data-inverse-stage-title]"),
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
      next: lab.querySelector("[data-inverse-next]"),
      reset: lab.querySelector("[data-inverse-reset]"),
      controlRow: lab.querySelector(".inverse-control-row"),
      conclusion: lab.querySelector("[data-inverse-conclusion]"),
      conclusionLabel: lab.querySelector("[data-inverse-conclusion-label]"),
      conclusionFormula: lab.querySelector("[data-inverse-conclusion-formula]"),
      stageControl: lab.querySelector("[data-inverse-stage-control]"),
      steps: [...lab.querySelectorAll("[data-inverse-step]")],
      jumpButtons: [...lab.querySelectorAll("[data-inverse-jump]")],
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

    function setVectorLabel(label, point, text) {
      label.setAttribute("x", point[0] + 5);
      label.setAttribute("y", point[1]);
      label.setAttribute("dominant-baseline", "middle");
      label.setAttribute("text-anchor", "start");
      label.textContent = text;
    }

    function render() {
      const preset = PRESET_MAP[presetKey];
      const rank = matrixRank(preset.matrix);
      const det = determinant(preset.matrix);
      const isSingular = rank < 2;
      const maxJourney = isSingular ? 1 : 2;
      let journey = Math.min(Number(elements.progress.value), maxJourney);
      elements.progress.value = String(journey);
      elements.stageControl.style.setProperty("--journey-progress", `${(journey / 2) * 100}%`);

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
      setVectorLabel(elements.vectorLabel, vectorTip, stage === 1 ? "Ax" : stage === 2 ? "A⁻¹Ax = x" : "x");

      elements.matrix.innerHTML = inline(matrixLatex(preset.matrix));
      elements.rank.innerHTML = inline(String(rank));
      elements.determinant.innerHTML = inline(cleanNumber(det));
      elements.dimension.innerHTML = isSingular ? inline("2\\to1") : inline("2\\to2");
      elements.explanation.textContent = preset.description;

      lab.classList.toggle("is-singular", isSingular);
      lab.classList.toggle("is-restored", restored);
      elements.verdict.classList.toggle("is-singular", isSingular);
      elements.verdictKicker.textContent = isSingular ? "降为一维" : "二维保留";
      elements.verdictTitle.textContent = isSingular ? "A 不可逆" : "A 可逆";
      elements.conclusion.classList.toggle("is-unavailable", isSingular);
      elements.conclusionLabel.textContent = isSingular ? "逆矩阵" : "两侧逆";
      elements.conclusionFormula.innerHTML = isSingular
        ? inline("A^{-1}\\text{ 不存在}")
        : `${inline("A^{-1}A=I")}<i aria-hidden="true">·</i>${inline("AA^{-1}=I")}`;

      elements.steps.forEach((stepElement, index) => {
        stepElement.classList.toggle("is-current", index === stage);
        stepElement.classList.toggle("is-complete", index < stage || (index === 1 && restored));
        stepElement.classList.toggle("is-unavailable", isSingular && index === 2);
        const jumpButton = stepElement.querySelector("[data-inverse-jump]");
        if (jumpButton) {
          jumpButton.disabled = isSingular && index === 2;
          if (index === stage) jumpButton.setAttribute("aria-current", "step");
          else jumpButton.removeAttribute("aria-current");
        }
      });

      if (atIdentity) {
        elements.stageLabel.textContent = "单位变换";
        elements.stageTitle.textContent = "平面保持原样";
        elements.caption.textContent = "起点：e₁、e₂ 的端点与单位正方形的两个相邻顶点完全重合。";
        elements.composition.innerHTML = inline("I");
        elements.equation.innerHTML = inline("Ix=x");
      } else if (restored) {
        elements.stageLabel.textContent = "逆变换完成";
        elements.stageTitle.textContent = "网格回到原位";
        elements.caption.textContent = "恢复：A⁻¹Ae₁=e₁、A⁻¹Ae₂=e₂，单位正方形与向量 x 一起回到原位。";
        elements.composition.innerHTML = inline("A^{-1}A=I");
        elements.equation.innerHTML = inline("A^{-1}(Ax)=(A^{-1}A)x=Ix=x");
      } else if (isSingular && atA) {
        elements.stageLabel.textContent = "应用 A 完成";
        elements.stageTitle.textContent = "二维被压成一维";
        elements.caption.textContent = "网格坍缩到一条线：rank(A)=1，二维信息已经丢失。";
        elements.composition.innerHTML = inline("A");
        elements.equation.innerHTML = inline("x_1\\ne x_2\\;\\text{却可能有}\\;Ax_1=Ax_2");
      } else if (atA) {
        elements.stageLabel.textContent = "应用 A 完成";
        elements.stageTitle.textContent = "平面仍然是二维";
        elements.caption.textContent = "A 已作用：Ae₁、Ae₂ 正好构成变换后平行四边形的两条相邻边。";
        elements.composition.innerHTML = inline("A");
        elements.equation.innerHTML = inline("x\\mapsto Ax");
      } else {
        elements.stageLabel.textContent = movingBack ? "正在应用 A⁻¹" : "正在应用 A";
        elements.stageTitle.textContent = movingBack ? "变换正在被撤销" : isSingular ? "平面正在坍缩" : "平面仍保持二维";
        elements.caption.textContent = movingBack
          ? "A⁻¹ 正在把 A 的变化逐步撤回；彩色网格与浅色原网格重新重合。"
          : isSingular
            ? "两个基方向逐渐合并，单位正方形的面积正在降为 0。"
            : "A 同时移动两个基向量，并带动整张网格连续变形。";
        elements.composition.innerHTML = movingBack ? inline("A^{-1}A") : inline("A");
        elements.equation.innerHTML = movingBack ? inline("A^{-1}(Ax)\\longrightarrow x") : inline("x\\longrightarrow Ax");
      }

      let nextTarget = 1;
      let nextLabel = journey > 0.02 ? "完成应用 A" : "应用 A";
      let nextDisabled = false;
      if (restored) {
        nextTarget = 0;
        nextLabel = "重新演示";
      } else if (isSingular && atA) {
        nextTarget = 1;
        nextLabel = "A⁻¹ 不存在";
        nextDisabled = true;
      } else if (journey > 1.02) {
        nextTarget = 2;
        nextLabel = "完成还原";
      } else if (atA) {
        nextTarget = 2;
        nextLabel = "应用 A⁻¹";
      }
      elements.next.dataset.inverseTarget = String(nextTarget);
      elements.next.textContent = nextLabel;
      elements.next.disabled = nextDisabled;
      const showReset = !atIdentity && !restored;
      elements.reset.hidden = !showReset;
      elements.controlRow.classList.toggle("is-single", !showReset);
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
    elements.progress.addEventListener("change", () => {
      const maxJourney = matrixRank(PRESET_MAP[presetKey].matrix) < 2 ? 1 : 2;
      const target = Math.min(Math.round(Number(elements.progress.value)), maxJourney);
      animateTo(target, 240);
    });
    elements.jumpButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const target = Number(button.dataset.inverseJump);
        if (target > 1 && matrixRank(PRESET_MAP[presetKey].matrix) < 2) return;
        animateTo(target, target === 2 ? 900 : 620);
      });
    });
    elements.next.addEventListener("click", () => {
      const target = Number(elements.next.dataset.inverseTarget);
      animateTo(target, target === 2 ? 900 : 620);
    });
    elements.reset.addEventListener("click", () => animateTo(0, 700));

    render();
  }

  defineChapter4Renderer("matrix-inverse", {
    formal: renderSection4Formal,
    interactive: renderSection4Interactive,
  });
})();
