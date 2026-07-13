(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const IDENTITY = [1, 0, 0, 1];
  const EPSILON = 1e-9;
  const SQUARE = [
    [0, 0],
    [1.25, 0],
    [1.25, 1.25],
    [0, 1.25],
  ];

  const CASE_GROUPS = [
    {
      key: "full-rank",
      title: "不降秩 · 可逆",
      description: "二维区域仍然铺开，行列式不为 0，可以用逆矩阵恢复。",
      items: [
        {
          key: "shear",
          label: "剪切",
          matrix: [1, 1, 0, 1],
          description: "平行四边形仍有面积，两个基方向仍然独立。",
        },
        {
          key: "rotation",
          label: "旋转",
          matrix: [0, -1, 1, 0],
          description: "只改变方向，不压扁平面，面积保持不变。",
        },
        {
          key: "scale",
          label: "非零缩放",
          matrix: [1.6, 0, 0, 0.65],
          description: "两个方向都保留，只是按不同倍数伸缩。",
        },
      ],
    },
    {
      key: "rank-drop",
      title: "降秩 · 不可逆",
      description: "二维区域被压成直线，行列式等于 0，输入信息发生合并。",
      items: [
        {
          key: "collapse-diagonal-down",
          label: "压向斜线 I",
          matrix: [1, -1, -1, 1],
          description: "两列互为相反数，输出只剩一个方向。",
        },
        {
          key: "collapse-horizontal",
          label: "压向横轴",
          matrix: [1, 1, 0, 0],
          description: "所有输出都落在同一条水平直线上。",
        },
        {
          key: "collapse-diagonal-up",
          label: "压向斜线 II",
          matrix: [1, 0, 1, 0],
          description: "一个基方向被送到零向量，只保留一个方向。",
        },
        {
          key: "collapse-diagonal-wide",
          label: "压向斜线 III",
          matrix: [1, -1, 1, -1],
          description: "两列再次线性相关，正方形塌成线段。",
        },
      ],
    },
  ];

  const PRESETS = CASE_GROUPS.flatMap((group) => group.items).reduce((result, preset) => {
    result[preset.key] = preset;
    return result;
  }, {});

  function normalizeConcepts(section) {
    return (section?.concepts || []).map((concept) =>
      Array.isArray(concept) ? { label: concept[0], text: concept[1] } : concept,
    );
  }

  function renderSection4Formal(formal, section) {
    if (!formal) return;
    const concepts = normalizeConcepts(section);
    formal.innerHTML = `
      <h2>定理概念</h2>
      <div class="section4-formal">
        <div class="definition-stack">
          ${concepts
            .map(
              (concept) => `
                <article class="definition-row">
                  <strong>${concept.label}</strong>
                  <p>${concept.text}</p>
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

  function interpolate(from, to, amount) {
    return from.map((value, index) => value + (to[index] - value) * amount);
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

  function nullDirection(matrix) {
    const [a, b, c, d] = matrix;
    let vector = Math.abs(a) + Math.abs(b) > EPSILON ? [-b, a] : [-d, c];
    const length = Math.hypot(vector[0], vector[1]) || 1;
    vector = [vector[0] / length, vector[1] / length];
    return vector;
  }

  function pointPair(preset) {
    const rank = matrixRank(preset.matrix);
    const first = [0.65, 0.82];
    if (rank === 2) return [first, [1.08, 0.35]];
    const direction = nullDirection(preset.matrix);
    return [first, [first[0] + direction[0] * 0.92, first[1] + direction[1] * 0.92]];
  }

  function svgPoint(matrix, point, width = 330, height = 330, scale = 58) {
    const transformed = apply(matrix, point);
    return [width / 2 + transformed[0] * scale, height / 2 - transformed[1] * scale];
  }

  function lineMarkup(matrix, from, to, className) {
    const [x1, y1] = svgPoint(matrix, from);
    const [x2, y2] = svgPoint(matrix, to);
    return `<line class="${className}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
  }

  function gridMarkup(matrix) {
    const lines = [];
    for (let value = -4; value <= 4; value += 1) {
      lines.push(lineMarkup(matrix, [value, -4], [value, 4], value === 0 ? "rank-axis" : "rank-grid-line"));
      lines.push(lineMarkup(matrix, [-4, value], [4, value], value === 0 ? "rank-axis" : "rank-grid-line"));
    }
    return lines.join("");
  }

  function polygonPoints(matrix, points) {
    return points.map((point) => svgPoint(matrix, point).join(",")).join(" ");
  }

  function pointMarkup(matrix, point, className, label) {
    const [x, y] = svgPoint(matrix, point);
    return `
      <circle class="${className}" cx="${x}" cy="${y}" r="7" />
      <text class="rank-point-label" x="${x + 10}" y="${y - 10}">${label}</text>
    `;
  }

  function presetButtonMarkup(preset, first) {
    const rank = matrixRank(preset.matrix);
    const isInvertible = rank === 2;
    return `
      <button
        type="button"
        class="rank-case-card${first ? " is-active" : ""}"
        data-rank-preset="${preset.key}"
        aria-pressed="${first ? "true" : "false"}"
      >
        <span class="rank-case-status ${isInvertible ? "is-invertible" : "is-singular"}">${isInvertible ? "可逆" : "不可逆"}</span>
        <strong>${preset.label}</strong>
        <span class="rank-case-matrix">${inline(matrixLatex(preset.matrix))}</span>
      </button>
    `;
  }

  function renderCaseGroups() {
    let first = true;
    return CASE_GROUPS.map((group) => {
      const cards = group.items
        .map((preset) => {
          const markup = presetButtonMarkup(preset, first);
          first = false;
          return markup;
        })
        .join("");
      return `
        <section class="rank-case-group" data-rank-group="${group.key}">
          <div class="rank-case-group-head">
            <h4>${group.title}</h4>
            <p>${group.description}</p>
          </div>
          <div class="rank-case-grid">${cards}</div>
        </section>
      `;
    }).join("");
  }

  function renderSection4Interactive(interactive, section) {
    if (!interactive) return;
    const defaultPreset = CASE_GROUPS[0].items[0];

    interactive.innerHTML = `
      <h2>交互实验</h2>
      <div class="rank-inverse-lab" data-rank-inverse-lab>
        <header class="rank-inverse-head">
          <div>
            <span class="rank-inverse-kicker">满秩、行列式与可逆性</span>
            <h3>矩阵什么时候还能倒着走？</h3>
            <p>${section?.interactive?.task || "点击一个矩阵，观察单位正方形是否仍然占据二维面积；再尝试用逆矩阵恢复。"}</p>
          </div>
          <div class="rank-equivalence" aria-label="二阶方阵可逆判定">
            <div><span class="rank-dot is-invertible"></span>${inline("\\operatorname{rank}(A)=2")} <b>⇔</b> ${inline("\\det(A)\\ne0")} <b>⇔</b> 可逆</div>
            <div><span class="rank-dot is-singular"></span>${inline("\\operatorname{rank}(A)<2")} <b>⇔</b> ${inline("\\det(A)=0")} <b>⇔</b> 不可逆</div>
          </div>
        </header>

        <div class="rank-case-groups">${renderCaseGroups()}</div>

        <div class="rank-stage-grid">
          <figure class="rank-plane-card">
            <div class="rank-plane-title"><span>输入</span><strong>二维平面</strong></div>
            <svg class="rank-plane" viewBox="0 0 330 330" role="img" aria-label="原始单位正方形与两个输入点">
              <g>${gridMarkup(IDENTITY)}</g>
              <polygon class="rank-input-shape" points="${polygonPoints(IDENTITY, SQUARE)}"></polygon>
              <line class="rank-basis rank-basis-x" x1="${svgPoint(IDENTITY, [0, 0])[0]}" y1="${svgPoint(IDENTITY, [0, 0])[1]}" x2="${svgPoint(IDENTITY, [1, 0])[0]}" y2="${svgPoint(IDENTITY, [1, 0])[1]}" />
              <line class="rank-basis rank-basis-y" x1="${svgPoint(IDENTITY, [0, 0])[0]}" y1="${svgPoint(IDENTITY, [0, 0])[1]}" x2="${svgPoint(IDENTITY, [0, 1])[0]}" y2="${svgPoint(IDENTITY, [0, 1])[1]}" />
              <g data-rank-input-points></g>
            </svg>
            <figcaption>单位正方形有非零面积，两个输入点彼此不同。</figcaption>
          </figure>

          <div class="rank-stage-operator" aria-live="polite">
            <span>当前矩阵</span>
            <strong data-rank-matrix>${inline(matrixLatex(defaultPreset.matrix))}</strong>
            <div class="rank-forward-arrow" aria-hidden="true">→</div>
            <div class="rank-inverse-indicator" data-rank-inverse-indicator></div>
          </div>

          <figure class="rank-plane-card is-output">
            <div class="rank-plane-title"><span>输出</span><strong data-rank-output-title>仍是二维</strong></div>
            <svg class="rank-plane" viewBox="0 0 330 330" role="img" aria-label="矩阵作用后的图形、基向量和输出点">
              <g data-rank-output-grid></g>
              <polygon class="rank-output-shape" data-rank-output-shape></polygon>
              <line class="rank-basis rank-basis-x" data-rank-basis-x />
              <line class="rank-basis rank-basis-y" data-rank-basis-y />
              <g data-rank-output-points></g>
            </svg>
            <figcaption data-rank-output-caption>面积仍不为 0，两个输出点保持分离。</figcaption>
          </figure>
        </div>

        <div class="rank-analysis-grid" aria-live="polite">
          <article class="rank-verdict-card" data-rank-verdict-card>
            <span data-rank-verdict-kicker>判定结果</span>
            <strong data-rank-verdict>可逆</strong>
            <p data-rank-explanation>${defaultPreset.description}</p>
          </article>
          <dl class="rank-math-list">
            <div><dt>${inline("\\det(A)")}</dt><dd data-rank-det></dd></div>
            <div><dt>${inline("\\operatorname{rank}(A)")}</dt><dd data-rank-value></dd></div>
            <div><dt>面积倍率</dt><dd data-rank-area></dd></div>
            <div><dt>${inline("A^{-1}")}</dt><dd data-rank-inverse></dd></div>
          </dl>
          <article class="rank-reason-card">
            <span>为什么？</span>
            <p data-rank-reason></p>
            <div class="rank-point-equation" data-rank-point-equation></div>
          </article>
        </div>

        <div class="rank-controls">
          <label for="rank-transform-progress">变换进度</label>
          <input id="rank-transform-progress" data-rank-progress type="range" min="0" max="1" step="0.01" value="0" />
          <div class="rank-control-row">
            <button class="button primary" type="button" data-rank-apply>应用 A</button>
            <button class="button" type="button" data-rank-undo>应用 A<sup>−1</sup></button>
            <button class="button" type="button" data-rank-reset>重置</button>
            <span data-rank-result>选择矩阵并观察它怎样改变二维区域。</span>
          </div>
        </div>
      </div>
    `;

    const lab = interactive.querySelector("[data-rank-inverse-lab]");
    if (!lab) return;

    const elements = {
      inputPoints: lab.querySelector("[data-rank-input-points]"),
      outputGrid: lab.querySelector("[data-rank-output-grid]"),
      outputShape: lab.querySelector("[data-rank-output-shape]"),
      outputPoints: lab.querySelector("[data-rank-output-points]"),
      basisX: lab.querySelector("[data-rank-basis-x]"),
      basisY: lab.querySelector("[data-rank-basis-y]"),
      matrix: lab.querySelector("[data-rank-matrix]"),
      inverseIndicator: lab.querySelector("[data-rank-inverse-indicator]"),
      outputTitle: lab.querySelector("[data-rank-output-title]"),
      outputCaption: lab.querySelector("[data-rank-output-caption]"),
      verdictCard: lab.querySelector("[data-rank-verdict-card]"),
      verdictKicker: lab.querySelector("[data-rank-verdict-kicker]"),
      verdict: lab.querySelector("[data-rank-verdict]"),
      explanation: lab.querySelector("[data-rank-explanation]"),
      determinant: lab.querySelector("[data-rank-det]"),
      rank: lab.querySelector("[data-rank-value]"),
      area: lab.querySelector("[data-rank-area]"),
      inverse: lab.querySelector("[data-rank-inverse]"),
      reason: lab.querySelector("[data-rank-reason]"),
      pointEquation: lab.querySelector("[data-rank-point-equation]"),
      progress: lab.querySelector("[data-rank-progress]"),
      apply: lab.querySelector("[data-rank-apply]"),
      undo: lab.querySelector("[data-rank-undo]"),
      reset: lab.querySelector("[data-rank-reset]"),
      result: lab.querySelector("[data-rank-result]"),
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
      const start = performance.now();

      function tick(now) {
        if (!lab.isConnected) {
          stopAnimation();
          return;
        }
        const amount = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - amount, 3);
        elements.progress.value = String(startValue + (target - startValue) * eased);
        render();
        if (amount < 1) animationFrame = requestAnimationFrame(tick);
        else animationFrame = 0;
      }

      animationFrame = requestAnimationFrame(tick);
    }

    function render() {
      const preset = PRESETS[presetKey];
      const progress = Number(elements.progress.value);
      const matrix = interpolate(IDENTITY, preset.matrix, progress);
      const det = determinant(preset.matrix);
      const rank = matrixRank(preset.matrix);
      const inv = inverse(preset.matrix);
      const [inputOne, inputTwo] = pointPair(preset);
      const outputOne = apply(matrix, inputOne);
      const outputTwo = apply(matrix, inputTwo);
      const origin = svgPoint(matrix, [0, 0]);
      const basisX = svgPoint(matrix, [1, 0]);
      const basisY = svgPoint(matrix, [0, 1]);
      const isSingular = rank < 2;
      const fullyApplied = progress > 0.985;

      elements.inputPoints.innerHTML = `${pointMarkup(IDENTITY, inputOne, "rank-input-point is-first", "x₁")}${pointMarkup(
        IDENTITY,
        inputTwo,
        "rank-input-point is-second",
        "x₂",
      )}`;
      elements.outputGrid.innerHTML = gridMarkup(matrix);
      elements.outputShape.setAttribute("points", polygonPoints(matrix, SQUARE));
      elements.outputPoints.innerHTML = `${pointMarkup(IDENTITY, outputOne, "rank-output-point is-first", "Ax₁")}${pointMarkup(
        IDENTITY,
        outputTwo,
        "rank-output-point is-second",
        "Ax₂",
      )}`;
      elements.basisX.setAttribute("x1", origin[0]);
      elements.basisX.setAttribute("y1", origin[1]);
      elements.basisX.setAttribute("x2", basisX[0]);
      elements.basisX.setAttribute("y2", basisX[1]);
      elements.basisY.setAttribute("x1", origin[0]);
      elements.basisY.setAttribute("y1", origin[1]);
      elements.basisY.setAttribute("x2", basisY[0]);
      elements.basisY.setAttribute("y2", basisY[1]);

      elements.matrix.innerHTML = inline(matrixLatex(preset.matrix));
      elements.determinant.innerHTML = inline(cleanNumber(det));
      elements.rank.innerHTML = inline(String(rank));
      elements.area.innerHTML = inline(`|\\det(A)|=${cleanNumber(Math.abs(det))}`);
      elements.inverse.innerHTML = inv ? inline(matrixLatex(inv)) : '<span class="rank-no-inverse">不存在</span>';
      elements.explanation.textContent = preset.description;

      lab.classList.toggle("is-singular", isSingular);
      elements.verdictCard.classList.toggle("is-singular", isSingular);
      elements.verdictKicker.textContent = isSingular ? "降秩" : "不降秩";
      elements.verdict.textContent = isSingular ? "不可逆" : "可逆";
      elements.outputTitle.textContent = fullyApplied ? (isSingular ? "降为一维" : "仍是二维") : "变换中";

      if (isSingular) {
        elements.inverseIndicator.innerHTML = `<span class="rank-back-arrow is-disabled">←</span><strong>${inline("A^{-1}")}</strong><em>不存在</em>`;
        elements.outputCaption.textContent = fullyApplied
          ? "正方形面积变成 0，两个不同输入在输出端重合。"
          : "继续拖动，观察二维区域逐渐被压成一条线。";
        elements.reason.textContent = "矩阵把两个独立方向压成一个方向，二维信息已经丢失，输出无法唯一追溯到输入。";
        elements.pointEquation.innerHTML = fullyApplied
          ? `${inline("x_1\\ne x_2")}，但 ${inline("Ax_1=Ax_2")}`
          : `${inline("\\det(A)=0")}，输出面积将降为 0`;
        elements.result.textContent = fullyApplied
          ? "降秩完成：det(A)=0，rank(A)=1，逆矩阵不存在。"
          : "二维区域正在向一条直线坍缩。";
      } else {
        elements.inverseIndicator.innerHTML = `<span class="rank-back-arrow">←</span><strong>${inline("A^{-1}")}</strong><em>可以恢复</em>`;
        elements.outputCaption.textContent = fullyApplied
          ? "平行四边形仍有非零面积，两个不同输入仍对应不同输出。"
          : "图形在二维平面内连续变形，面积没有塌为 0。";
        elements.reason.textContent = "两个基向量仍然线性无关，输出保留完整的二维信息，所以每个输出都有唯一输入。";
        elements.pointEquation.innerHTML = fullyApplied
          ? `${inline("\\det(A)\\ne0")}，所以 ${inline("A^{-1}A=I")}`
          : `${inline("\\operatorname{rank}(A)=2")}，二维结构仍被保留`;
        elements.result.textContent = fullyApplied
          ? "不降秩：det(A)≠0，rank(A)=2，可以点击 A⁻¹ 恢复。"
          : "图形正在二维平面内变换。";
      }

      elements.apply.disabled = fullyApplied;
      elements.undo.disabled = isSingular || !fullyApplied;
      elements.undo.title = isSingular ? "det(A)=0，逆矩阵不存在" : fullyApplied ? "应用逆矩阵恢复输入" : "先完整应用 A";
    }

    lab.querySelectorAll("[data-rank-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        stopAnimation();
        presetKey = button.dataset.rankPreset;
        elements.progress.value = "0";
        lab.querySelectorAll("[data-rank-preset]").forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        render();
        animateTo(1, 820);
      });
    });

    elements.progress.addEventListener("input", () => {
      stopAnimation();
      render();
    });
    elements.apply.addEventListener("click", () => animateTo(1));
    elements.undo.addEventListener("click", () => {
      if (matrixRank(PRESETS[presetKey].matrix) === 2) animateTo(0);
    });
    elements.reset.addEventListener("click", () => {
      stopAnimation();
      elements.progress.value = "0";
      render();
    });

    render();
  }

  defineChapter4Renderer("matrix-inverse", {
    formal: renderSection4Formal,
    interactive: renderSection4Interactive,
  });
})();
