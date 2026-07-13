(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);

  const IDENTITY = [1, 0, 0, 1];
  const POINT = [1.55, 1.05];
  const PRESETS = {
    shear: {
      label: "剪切",
      matrix: [1, 0.85, 0, 1],
      description: "先向右剪切，再用相反剪切撤销。",
    },
    rotation: {
      label: "旋转",
      matrix: (() => {
        const angle = Math.PI / 5;
        return [Math.cos(angle), -Math.sin(angle), Math.sin(angle), Math.cos(angle)];
      })(),
      description: "先逆时针旋转，再按相反角度转回来。",
    },
    scale: {
      label: "缩放",
      matrix: [1.55, 0, 0, 0.68],
      description: "两个方向分别缩放，再按倒数比例恢复。",
    },
    projection: {
      label: "投影",
      matrix: [1, 0, 0, 0],
      description: "平面被压到一条直线，多个输入合并成同一个输出。",
      singular: true,
    },
  };

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

  function inverse(matrix) {
    const det = determinant(matrix);
    if (Math.abs(det) < 1e-9) return null;
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

  function pointLatex(point) {
    return `\\begin{bmatrix}${cleanNumber(point[0])}\\\\${cleanNumber(point[1])}\\end{bmatrix}`;
  }

  function currentMatrix(preset, progress) {
    if (progress <= 1) return interpolate(IDENTITY, preset.matrix, progress);
    if (preset.singular) return preset.matrix;
    const undoAmount = progress - 1;
    const progressiveInverse = interpolate(IDENTITY, inverse(preset.matrix), undoAmount);
    return multiply(progressiveInverse, preset.matrix);
  }

  function stageCopy(preset, progress) {
    if (progress < 0.04) return { label: "原始输入", formula: "x", note: "还没有施加矩阵作用。" };
    if (progress < 0.98) return { label: "正在应用 A", formula: "A_t x", note: "输入、基向量和整张网格一起变化。" };
    if (progress <= 1.02) return { label: "得到输出", formula: "Ax", note: preset.singular ? "二维信息已经被压到一条直线上。" : "继续向右，开始施加逆矩阵。" };
    if (preset.singular) return { label: "无法唯一撤销", formula: "A^{-1}\\ \text{不存在}", note: "不同输入已经落到同一个输出，无法判断原来是哪一个。" };
    if (progress < 1.96) return { label: "正在应用 A^{-1}", formula: "A_s^{-1}Ax", note: "逆矩阵从输出端反向撤销原来的作用。" };
    return { label: "恢复完成", formula: "A^{-1}Ax=x", note: "复合矩阵回到单位矩阵 I。" };
  }

  function svgPoint(matrix, point, width = 640, height = 390, scale = 48) {
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
    for (let value = -6; value <= 6; value += 1) {
      lines.push(lineMarkup(matrix, [value, -4.5], [value, 4.5], value === 0 ? "inverse-axis" : "inverse-grid-line"));
      lines.push(lineMarkup(matrix, [-6.5, value], [6.5, value], value === 0 ? "inverse-axis" : "inverse-grid-line"));
    }
    return lines.join("");
  }

  function polygonPoints(matrix, points) {
    return points.map((point) => svgPoint(matrix, point).join(",")).join(" ");
  }

  function renderSection4Interactive(interactive, section) {
    if (!interactive) return;
    interactive.innerHTML = `
      <h2>交互实验</h2>
      <div class="inverse-lab" data-inverse-lab>
        <div class="inverse-lab-head">
          <div>
            <h3>把一次变换倒着走回来</h3>
            <p>${section?.interactive?.task || "先施加矩阵 A，再用 A 的逆把同一个对象送回原位。"}</p>
          </div>
          <div class="inverse-preset-group" role="group" aria-label="选择矩阵变换">
            ${Object.entries(PRESETS)
              .map(
                ([key, preset], index) =>
                  `<button type="button" class="${index === 0 ? "is-active" : ""}" data-inverse-preset="${key}" aria-pressed="${index === 0}">${preset.label}</button>`,
              )
              .join("")}
          </div>
        </div>

        <div class="inverse-lab-body">
          <div class="inverse-stage-wrap">
            <svg class="inverse-stage" data-inverse-stage viewBox="0 0 640 390" role="img" aria-label="矩阵变换与逆变换的坐标网格动画">
              <g data-inverse-grid></g>
              <polygon class="inverse-original-shape" points="${polygonPoints(IDENTITY, [[-1.35, -1], [1.35, -1], [1.35, 1], [-1.35, 1]])}" />
              <polygon class="inverse-current-shape" data-inverse-shape></polygon>
              <line class="inverse-vector inverse-vector-x" data-inverse-vector-x />
              <line class="inverse-vector inverse-vector-y" data-inverse-vector-y />
              <circle class="inverse-input-point" cx="${svgPoint(IDENTITY, POINT)[0]}" cy="${svgPoint(IDENTITY, POINT)[1]}" r="5" />
              <circle class="inverse-current-point" data-inverse-point r="7" />
              <text class="inverse-point-label" data-inverse-point-label>x</text>
            </svg>
            <div class="inverse-stage-caption">
              <div>
                <span data-inverse-stage-label>原始输入</span>
                <strong data-inverse-stage-formula>${inline("x")}</strong>
              </div>
              <p data-inverse-stage-note>还没有施加矩阵作用。</p>
            </div>
          </div>

          <aside class="inverse-readout" aria-live="polite">
            <div class="inverse-readout-card">
              <span>当前变换</span>
              <strong data-inverse-preset-title>剪切</strong>
              <p data-inverse-description>${PRESETS.shear.description}</p>
            </div>
            <dl class="inverse-math-list">
              <div><dt>${inline("A")}</dt><dd data-inverse-a></dd></div>
              <div><dt>${inline("A^{-1}")}</dt><dd data-inverse-inverse></dd></div>
              <div><dt>当前复合</dt><dd data-inverse-current></dd></div>
              <div><dt>${inline("\\det(A)")}</dt><dd data-inverse-det></dd></div>
              <div><dt>当前点</dt><dd data-inverse-current-point></dd></div>
            </dl>
          </aside>
        </div>

        <div class="inverse-controls">
          <div class="inverse-progress-labels" aria-hidden="true">
            <span>原始</span><span>应用 A</span><span>应用 A<sup>−1</sup></span>
          </div>
          <input data-inverse-progress type="range" min="0" max="2" step="0.01" value="0" aria-label="变换与逆变换进度" />
          <div class="inverse-control-row">
            <button class="button primary" type="button" data-inverse-play>播放全过程</button>
            <button class="button" type="button" data-inverse-reset>回到原始</button>
            <span data-inverse-result>拖到中点观察 Ax，再继续向右。</span>
          </div>
        </div>
      </div>
    `;

    const lab = interactive.querySelector("[data-inverse-lab]");
    if (!lab) return;

    const elements = {
      grid: lab.querySelector("[data-inverse-grid]"),
      shape: lab.querySelector("[data-inverse-shape]"),
      vectorX: lab.querySelector("[data-inverse-vector-x]"),
      vectorY: lab.querySelector("[data-inverse-vector-y]"),
      point: lab.querySelector("[data-inverse-point]"),
      pointLabel: lab.querySelector("[data-inverse-point-label]"),
      progress: lab.querySelector("[data-inverse-progress]"),
      play: lab.querySelector("[data-inverse-play]"),
      reset: lab.querySelector("[data-inverse-reset]"),
      stageLabel: lab.querySelector("[data-inverse-stage-label]"),
      stageFormula: lab.querySelector("[data-inverse-stage-formula]"),
      stageNote: lab.querySelector("[data-inverse-stage-note]"),
      presetTitle: lab.querySelector("[data-inverse-preset-title]"),
      description: lab.querySelector("[data-inverse-description]"),
      matrixA: lab.querySelector("[data-inverse-a]"),
      matrixInverse: lab.querySelector("[data-inverse-inverse]"),
      matrixCurrent: lab.querySelector("[data-inverse-current]"),
      determinant: lab.querySelector("[data-inverse-det]"),
      currentPoint: lab.querySelector("[data-inverse-current-point]"),
      result: lab.querySelector("[data-inverse-result]"),
    };

    let presetKey = "shear";
    let animationFrame = 0;

    function stopAnimation() {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      elements.play.textContent = "播放全过程";
    }

    function render() {
      const preset = PRESETS[presetKey];
      const progress = Number(elements.progress.value);
      const matrix = currentMatrix(preset, progress);
      const inv = inverse(preset.matrix);
      const point = apply(matrix, POINT);
      const stage = stageCopy(preset, progress);
      const [pointX, pointY] = svgPoint(matrix, POINT);
      const [xVectorX, xVectorY] = svgPoint(matrix, [1, 0]);
      const [yVectorX, yVectorY] = svgPoint(matrix, [0, 1]);
      const origin = svgPoint(matrix, [0, 0]);

      elements.grid.innerHTML = gridMarkup(matrix);
      elements.shape.setAttribute("points", polygonPoints(matrix, [[-1.35, -1], [1.35, -1], [1.35, 1], [-1.35, 1]]));
      elements.vectorX.setAttribute("x1", origin[0]);
      elements.vectorX.setAttribute("y1", origin[1]);
      elements.vectorX.setAttribute("x2", xVectorX);
      elements.vectorX.setAttribute("y2", xVectorY);
      elements.vectorY.setAttribute("x1", origin[0]);
      elements.vectorY.setAttribute("y1", origin[1]);
      elements.vectorY.setAttribute("x2", yVectorX);
      elements.vectorY.setAttribute("y2", yVectorY);
      elements.point.setAttribute("cx", pointX);
      elements.point.setAttribute("cy", pointY);
      elements.pointLabel.setAttribute("x", pointX + 10);
      elements.pointLabel.setAttribute("y", pointY - 10);
      elements.pointLabel.textContent = progress < 0.04 || progress > 1.96 ? "x" : progress <= 1.02 ? "Ax" : preset.singular ? "Ax" : "A⁻¹Ax";

      elements.stageLabel.textContent = stage.label;
      elements.stageFormula.innerHTML = inline(stage.formula);
      elements.stageNote.textContent = stage.note;
      elements.presetTitle.textContent = preset.label;
      elements.description.textContent = preset.description;
      elements.matrixA.innerHTML = inline(matrixLatex(preset.matrix));
      elements.matrixInverse.innerHTML = inv ? inline(matrixLatex(inv)) : '<span class="inverse-no-value">不存在</span>';
      elements.matrixCurrent.innerHTML = inline(matrixLatex(matrix));
      elements.determinant.innerHTML = inline(cleanNumber(determinant(preset.matrix)));
      elements.currentPoint.innerHTML = inline(pointLatex(point));

      if (preset.singular && progress > 1.02) {
        elements.result.textContent = "投影已经合并不同输入，继续向右也不能恢复原点。";
        lab.classList.add("is-singular");
      } else if (!preset.singular && progress > 1.96) {
        elements.result.textContent = "A⁻¹A = I：网格、方格和点都回到了原位。";
        lab.classList.remove("is-singular");
      } else {
        elements.result.textContent = progress < 1 ? "正在观察 A 怎样改变输入。" : "现在从输出端反向撤销。";
        lab.classList.toggle("is-singular", Boolean(preset.singular));
      }
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

    elements.reset.addEventListener("click", () => {
      stopAnimation();
      elements.progress.value = "0";
      render();
    });

    elements.play.addEventListener("click", () => {
      if (animationFrame) {
        stopAnimation();
        return;
      }
      elements.progress.value = "0";
      elements.play.textContent = "暂停";
      const start = performance.now();
      const duration = PRESETS[presetKey].singular ? 3600 : 4800;

      function tick(now) {
        if (!lab.isConnected) {
          stopAnimation();
          return;
        }
        const amount = Math.min(1, (now - start) / duration);
        elements.progress.value = String(amount * 2);
        render();
        if (amount < 1) animationFrame = requestAnimationFrame(tick);
        else stopAnimation();
      }

      animationFrame = requestAnimationFrame(tick);
    });

    render();
  }

  defineChapter4Renderer("matrix-inverse", {
    formal: renderSection4Formal,
    interactive: renderSection4Interactive,
  });
})();