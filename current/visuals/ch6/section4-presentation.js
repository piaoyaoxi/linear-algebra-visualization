(() => {
  const U = () => window.Ch6UI;

  function basisGrid(matrix, className) {
    const b1 = [matrix[0][0], matrix[1][0]];
    const b2 = [matrix[0][1], matrix[1][1]];
    let result = "";
    for (let index = -5; index <= 5; index += 1) {
      const a = U().add(U().scale(b1, -5), U().scale(b2, index));
      const b = U().add(U().scale(b1, 5), U().scale(b2, index));
      const c = U().add(U().scale(b2, -5), U().scale(b1, index));
      const d = U().add(U().scale(b2, 5), U().scale(b1, index));
      const pa = U().point(a);
      const pb = U().point(b);
      const pc = U().point(c);
      const pd = U().point(d);
      result += `<line class="ch6-basis-grid ${className}" x1="${pa[0]}" y1="${pa[1]}" x2="${pb[0]}" y2="${pb[1]}"></line><line class="ch6-basis-grid ${className}" x1="${pc[0]}" y1="${pc[1]}" x2="${pd[0]}" y2="${pd[1]}"></line>`;
    }
    return result;
  }

  function staticCoordinateFigure() {
    const vector = [1.55, 1.05];
    const W = [[1, 0.35], [0.45, 1]];
    const y = U().matVec(U().inverse(W), vector);
    const config = { ...U().plane, width: 300, height: 220, origin: [150, 125], scale: 58 };
    const I = [[1, 0], [0, 1]];

    function localGrid(matrix, className) {
      const b1 = [matrix[0][0], matrix[1][0]];
      const b2 = [matrix[0][1], matrix[1][1]];
      let out = "";
      for (let k = -4; k <= 4; k += 1) {
        const a = U().add(U().scale(b1, -4), U().scale(b2, k));
        const b = U().add(U().scale(b1, 4), U().scale(b2, k));
        const c = U().add(U().scale(b2, -4), U().scale(b1, k));
        const d = U().add(U().scale(b2, 4), U().scale(b1, k));
        const pa = U().point(a, config);
        const pb = U().point(b, config);
        const pc = U().point(c, config);
        const pd = U().point(d, config);
        out += `<line class="ch6-basis-grid ${className}" x1="${pa[0]}" y1="${pa[1]}" x2="${pb[0]}" y2="${pb[1]}"></line><line class="ch6-basis-grid ${className}" x1="${pc[0]}" y1="${pc[1]}" x2="${pd[0]}" y2="${pd[1]}"></line>`;
      }
      return out;
    }

    const left = `<svg class="ch6-coordinate-frame" viewBox="0 0 300 220" role="img" aria-label="标准基 U 下的同一向量 v">${localGrid(I, "is-u-grid")}${U().softArrow([0, 0], [1, 0], "is-u", "", config)}${U().softArrow([0, 0], [0, 1], "is-u2", "", config)}${U().softArrow([0, 0], vector, "is-target", "v", config)}</svg>`;
    const right = `<svg class="ch6-coordinate-frame" viewBox="0 0 300 220" role="img" aria-label="新基 W 下的同一向量 v">${localGrid(W, "is-w-grid")}${U().softArrow([0, 0], [W[0][0], W[1][0]], "is-w", "", config)}${U().softArrow([0, 0], [W[0][1], W[1][1]], "is-w2", "", config)}${U().softArrow([0, 0], vector, "is-target", "v", config)}</svg>`;

    return `<div class="ch6-same-vector-figure"><article><span>标准基 U</span>${left}<strong>[v]ᵤ = ${U().formatVector(vector)}</strong></article><div class="ch6-fixed-object"><span>同一个 v</span><b>端点不动</b></div><article><span>新基 W</span>${right}<strong>[v]ᵥ = ${U().formatVector(y)}</strong></article></div>`;
  }

  function renderFormal(root) {
    const modules = [
      U().moduleBlock("01", "同一个向量可以有不同坐标", "坐标记录向量相对有序基的系数；向量本身保持不变", `${staticCoordinateFigure()}<div class="ch6-reading-note"><strong>始终固定的对象</strong><p>两幅图中向量 v 的起点和终点完全相同。变化的是基方向、网格和坐标数字。</p></div>`),
      U().moduleBlock("02", "基矩阵把坐标恢复成向量", "把有序基向量按列排成矩阵", `<div class="ch6-basis-matrix-story"><div>${U().formulaCard("基矩阵", "U=[u_1\\ \\cdots\\ u_n]", "列顺序与坐标分量顺序一一对应。")}</div><div class="ch6-flow-arrow">→</div><div>${U().formulaCard("坐标恢复", "v=U[v]_U", "坐标列经过基矩阵，恢复为同一个几何向量。")}</div></div>`),
      U().moduleBlock("03", "过渡矩阵必须带方向", "从 U 坐标出发，先恢复向量，再用 W 重新读取", `<div class="ch6-derivation-stack"><div>${U().texDisplay("v=Ux=Wy")}</div><span>同一个向量由两组坐标描述</span><div>${U().texDisplay("Wy=Ux")}</div><span>左乘 ${U().texInline("W^{-1}")}</span><div class="is-result">${U().texDisplay("y=W^{-1}Ux=P_{W\\leftarrow U}x")}</div></div><div class="ch6-direction-note"><strong>箭头方向写在下标里</strong><p>${U().texInline("P_{W\\leftarrow U}")} 把 U 坐标变成 W 坐标；反方向矩阵是它的逆。</p></div>`),
      U().moduleBlock("04", "主动变换与被动换基不能混在一起", "两种过程可以使用矩阵，但回答的问题不同", `<div class="ch6-active-passive-grid"><article><span>被动换基</span><h4>对象固定，表示改变</h4>${U().texDisplay("v\\text{ 固定},\\qquad [v]_U\\mapsto[v]_W")}<ul><li>基与网格改变</li><li>向量端点不动</li><li>使用过渡矩阵</li></ul></article><article><span>主动变换</span><h4>基固定，对象移动</h4>${U().texDisplay("v\\mapsto Av")}<ul><li>基与坐标轴固定</li><li>向量端点移动</li><li>A 描述真实作用</li></ul></article></div>`),
      U().moduleBlock("05", "基退化时，坐标系统失效", "两列相关就不能构成一组基", `<div class="ch6-degenerate-note">${U().texDisplay("\\det W=0\\quad\\Longrightarrow\\quad W^{-1}\\text{ 不存在}")}<p>此时新基不能覆盖整个空间，或同一个向量的系数不再唯一，因此不存在合法的坐标变换。</p></div>`),
    ];
    root.innerHTML = U().formalShell("对象与表示：换基真正改变的是什么", "换基最容易混淆的地方，是把“坐标数字改变”误当成“向量移动”。本节始终同时追踪三个对象：几何向量、基向量和坐标列。", modules, "下一节把视线从整套坐标系统转向空间内部：哪些子集本身仍保有线性结构。");
  }

  const interpolateMatrix = (from, to, t) => from.map((row, i) => row.map((value, j) => value + (to[i][j] - value) * t));

  function basisLabel(vector, label, progress, side = 1) {
    const anchor = U().point(U().scale(vector, progress));
    const length = Math.hypot(vector[0], vector[1]) || 1;
    const offsetX = (-vector[1] / length) * 15 * side;
    const offsetY = (-vector[0] / length) * 15 * side;
    return `<text class="ch6-basis-tip-label" x="${(anchor[0] + offsetX).toFixed(2)}" y="${(anchor[1] + offsetY).toFixed(2)}" text-anchor="middle" dominant-baseline="central">${label}</text>`;
  }

  function renderInteractive(root, section) {
    const I = [[1, 0], [0, 1]];
    const passiveTargets = {
      shear: { label: "剪切基", matrix: [[1, 0.35], [0.55, 1]], note: "新基 W 变斜，但仍保留两条独立方向。" },
      rotate: { label: "旋转基", matrix: [[0.78, -0.63], [0.63, 0.78]], note: "新基 W 整体旋转，而向量 v 的位置不动。" },
      scale: { label: "缩放基", matrix: [[1.45, 0], [0, 0.72]], note: "基向量长度改变，坐标数字会反向补偿。" },
      collapse: { label: "退化到共线", matrix: [[1, 1.8], [0.45, 0.81]], note: "两列最终共线，坐标系统在终点失效。" },
    };
    const activeTargets = {
      stretch: { label: "拉伸", matrix: [[1.55, 0], [0, 0.72]], note: "向量横向拉长、纵向压缩。" },
      shear: { label: "剪切", matrix: [[1, 0.75], [0, 1]], note: "纵向分量推动横向位移。" },
      rotate: { label: "旋转", matrix: [[0, -1], [1, 0]], note: "向量绕原点旋转 90°。" },
    };

    let mode = "passive";
    let passiveKey = "shear";
    let activeKey = "stretch";
    let progress = 1;
    let vector = [1.45, 1.05];
    let displayMatrix = passiveTargets.shear.matrix.map((row) => row.slice());
    let animationFrame = null;
    root.innerHTML = `<div data-ch6-change-lab></div>`;
    const host = root.querySelector("[data-ch6-change-lab]");

    function animateMatrix(next) {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        displayMatrix = next.map((row) => row.slice());
        progress = 1;
        render();
        return;
      }
      const start = displayMatrix.map((row) => row.slice());
      const started = performance.now();
      const duration = 380;
      const tick = (now) => {
        const raw = Math.min(1, (now - started) / duration);
        const t = 1 - Math.pow(1 - raw, 3);
        displayMatrix = interpolateMatrix(start, next, t);
        progress = 1;
        render(raw >= 1);
        if (raw < 1) animationFrame = requestAnimationFrame(tick);
      };
      animationFrame = requestAnimationFrame(tick);
    }

    function render(rebind = true) {
      const target = mode === "passive" ? passiveTargets[passiveKey] : activeTargets[activeKey];
      const matrix = displayMatrix;
      const det = U().determinant(matrix);
      const inv = U().inverse(matrix);
      const passiveCoordinates = inv ? U().matVec(inv, vector) : null;
      const activeVector = U().matVec(matrix, vector);
      let inner = U().planeGrid();

      if (mode === "passive") {
        inner += basisGrid(matrix, "is-w-grid");
        const w1 = [matrix[0][0], matrix[1][0]];
        const w2 = [matrix[0][1], matrix[1][1]];
        inner += U().softArrow([0, 0], w1, "is-w");
        inner += U().softArrow([0, 0], w2, "is-w2");
        inner += basisLabel(w1, "w₁", 0.62, 1);
        inner += basisLabel(w2, "w₂", 0.58, -1);
        inner += U().softArrow([0, 0], vector, "is-target", "v（固定）");
      } else {
        inner += U().softArrow([0, 0], vector, "is-target-soft", "输入 v");
        inner += U().softArrow([0, 0], activeVector, "is-target", "输出 Aₜv");
      }

      const modeControls = U().segmented([["passive", "被动换基：向量不动"], ["active", "主动变换：向量移动"]], "change-mode", mode);
      const presetControls = mode === "passive"
        ? U().segmented([["shear", "剪切基"], ["rotate", "旋转基"], ["scale", "缩放基"], ["collapse", "退化到共线"]], "passive-preset", passiveKey)
        : U().segmented([["stretch", "拉伸"], ["shear", "剪切"], ["rotate", "旋转"]], "active-preset", activeKey);
      const controls = `${modeControls}${presetControls}<div class="ch6-progress-control"><label>${mode === "passive" ? "从标准基走向当前基" : "从恒等变换走向当前变换"}<output>${Math.round(progress * 100)}%</output><input type="range" min="0" max="1" step="0.01" value="${progress}" data-change-progress></label><p>滑到 0 回到标准基/恒等变换，滑到 1 到达所选目标。</p></div><div class="ch6-coordinate-sliders"><label>向量 v 横坐标 <output>${U().formatNumber(vector[0], 1)}</output><input type="range" min="-2.2" max="2.2" step="0.1" value="${vector[0]}" data-change-vx></label><label>向量 v 纵坐标 <output>${U().formatNumber(vector[1], 1)}</output><input type="range" min="-1.8" max="1.8" step="0.1" value="${vector[1]}" data-change-vy></label></div>`;

      const readout = mode === "passive"
        ? `<div class="ch6-mode-badge is-passive"><span>被动过程</span><strong>向量 v 的端点始终固定</strong></div><div class="ch6-current-story"><span>当前新基 W</span><h4>${target.label}</h4><p>${target.note}</p></div><div class="ch6-coordinate-pair"><article><span>标准基 U 下</span><strong>${U().formatVector(vector)}</strong></article><b>→</b><article><span>新基 W 下</span><strong>${passiveCoordinates ? U().formatVector(passiveCoordinates) : "不存在"}</strong></article></div><div class="ch6-formula-readout">${passiveCoordinates ? U().texDisplay("[v]_W=W^{-1}U[v]_U") : U().texDisplay("\\det W=0\\Rightarrow W^{-1}\\text{ 不存在}")}</div><div class="ch6-metric-grid">${U().metric("det W", "change-det")}${U().metric("P(W←U)", "change-p")}</div><div class="ch6-conclusion-box ${inv ? "is-ok" : "is-bad"}"><span>对象 / 表示</span><strong>${inv ? "对象不动，坐标表示改变" : "W 不再是一组基"}</strong></div>`
        : `<div class="ch6-mode-badge is-active"><span>主动过程</span><strong>标准网格固定，向量从 v 移到 Aₜv</strong></div><div class="ch6-current-story"><span>当前变换 Aₜ</span><h4>${target.label}</h4><p>${target.note}</p></div><div class="ch6-coordinate-pair"><article><span>输入 v</span><strong>${U().formatVector(vector)}</strong></article><b>→</b><article><span>输出 Aₜv</span><strong>${U().formatVector(activeVector)}</strong></article></div><div class="ch6-formula-readout">${U().texDisplay("v\\mapsto A_tv")}</div><div class="ch6-conclusion-box is-warn"><span>注意</span><strong>这里没有过渡矩阵；移动的是向量本身</strong></div>`;

      host.innerHTML = U().labShell({
        title: "把“换坐标”和“移动向量”分开观察",
        lead: "先选择模式，再拖动进度。两种模式使用同一张坐标平面，但固定不动的对象完全不同。",
        focus: mode === "passive" ? "只盯住向量 v 的端点：新基 W 变化时，它不能移动。" : "比较输入 v 与输出 Aₜv；标准网格必须保持固定。",
        stage: `<div class="ch6-stage-shell"><div class="ch6-stage-caption">${mode === "passive" ? `<strong>固定对象：向量 v</strong><span>网格与基 W 连续变化，v 的端点保持在同一位置。</span>` : `<strong>固定参照：标准网格</strong><span>输入 v 被矩阵真正送到新的输出位置。</span>`}</div>${U().planeSvg(inner, mode === "passive" ? "被动换基实验" : "主动线性变换实验")}</div>`,
        controls,
        readout,
        tasks: U().taskBlock(section),
        className: `ch6-change-lab is-${mode}`,
      });

      if (mode === "passive") {
        host.querySelector("[data-change-det]").textContent = U().formatNumber(det, 3);
        host.querySelector("[data-change-p]").textContent = inv ? U().formatMatrix(inv) : "—";
      }
      if (!rebind) return;

      host.querySelectorAll("[data-change-mode]").forEach((button) => button.addEventListener("click", () => {
        mode = button.dataset.changeMode;
        const nextTarget = mode === "passive" ? passiveTargets[passiveKey] : activeTargets[activeKey];
        displayMatrix = nextTarget.matrix.map((row) => row.slice());
        progress = 1;
        render();
      }));
      host.querySelectorAll("[data-passive-preset]").forEach((button) => button.addEventListener("click", () => {
        passiveKey = button.dataset.passivePreset;
        animateMatrix(passiveTargets[passiveKey].matrix);
      }));
      host.querySelectorAll("[data-active-preset]").forEach((button) => button.addEventListener("click", () => {
        activeKey = button.dataset.activePreset;
        animateMatrix(activeTargets[activeKey].matrix);
      }));
      host.querySelector("[data-change-progress]").addEventListener("input", (event) => {
        progress = Number(event.target.value);
        displayMatrix = interpolateMatrix(I, target.matrix, progress);
        render();
      });
      host.querySelector("[data-change-vx]").addEventListener("input", (event) => {
        vector[0] = Number(event.target.value);
        render();
      });
      host.querySelector("[data-change-vy]").addEventListener("input", (event) => {
        vector[1] = Number(event.target.value);
        render();
      });
    }

    render();
  }

  U().register("change-of-basis", renderFormal, renderInteractive);
})();
