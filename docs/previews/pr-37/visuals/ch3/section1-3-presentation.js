(() => {
  const M = () => window.Ch3Math;
  const tex = (source) => M().tex(source);
  const texD = (source) => M().texD(source);

  function formalShell(title, lead, body) {
    return `<h2>${title}</h2><div class="ch3-formal"><p class="ch3-formal-lead">${lead}</p>${body}</div>`;
  }

  function module(number, title, subtitle, body) {
    return `<section class="ch3-module"><div class="ch3-module-heading"><span>${number}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  }

  function cards(items) {
    return `<div class="ch3-card-grid">${items
      .map(([kicker, title, text]) => `<article class="ch3-card"><span class="kicker">${kicker}</span><h4>${title}</h4><p>${text}</p></article>`)
      .join("")}</div>`;
  }

  function optionList(count, prefix) {
    return Array.from({ length: count }, (_, index) => `<option value="${index}">${prefix}${index + 1}</option>`).join("");
  }

  // §1 -----------------------------------------------------------------------
  function formalElimination(root) {
    if (!root) return;
    root.innerHTML = formalShell(
      "定理与方法",
      "消元法的可靠性来自可逆性：每次行操作都能被另一条行操作撤销，所以它改变方程的外观，却不改变同时满足全部方程的向量。",
      module(
        "01",
        "三类初等行变换",
        "把“允许做什么”与“为什么允许”放在一起",
        cards([
          ["交换", "交换两行", "只调整方程顺序；再交换一次即可恢复。"],
          ["倍乘", "一行乘非零数", "逆操作是乘其倒数；因子为零时约束会被抹掉。"],
          ["倍加", "一行加另一行的倍数", "逆操作是加相反倍数；最常用于清除主元下方元素。"],
        ]),
      ) +
        module(
          "02",
          "主元与阶梯形",
          "每个主元锁定一个新的独立约束",
          `<div class="ch3-theorem-row"><div>${texD(String.raw`\begin{bmatrix}* & * & * & | & *\\0 & * & * & | & *\\0 & 0 & * & | & *\end{bmatrix}`)}</div><p>主元逐级向右下推进。阶梯形完成前向消元；从最后一行开始回代，就能逐层恢复主元变量。</p></div>`,
        ) +
        module(
          "03",
          "终局判读",
          "在真正算出每个变量前，先读结构信号",
          cards([
            ["唯一", "每列都有主元", "没有矛盾行，也没有自由列。"],
            ["无解", "出现矛盾行", `某行化为 ${tex(String.raw`0=c`)}, ${tex(String.raw`c\neq0`)}。`],
            ["无穷", "存在自由列", "没有矛盾，但至少一个未知量列没有主元。"],
          ]),
        ),
    );
  }

  function interactiveElimination(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch3-lab" data-ch3-lab="elimination">
        <div class="ch3-lab-head"><span class="ch3-lab-kicker">目标 · 用可逆操作逐步找到主元</span><h3>一步一步完成消元</h3><p>每做一次行变换，就同时观察方程、增广矩阵和几何解集：方程写法在改变，共同解保持不变。</p></div><div class="ch3-mission"><strong>你来试一试</strong><span>当前例子第一行没有 x 项。先交换两行建立第一个主元，再继续化到简化阶梯形。</span><span class="ch3-mission-result">观察：主元和自由列决定解的类型</span></div>
        <div class="ch3-presets" aria-label="方程组预设">
          <button type="button" data-preset="unique2">唯一解</button>
          <button type="button" data-preset="parallel2">平行无解</button>
          <button type="button" data-preset="sameLine2">重合无穷多解</button>
          <button type="button" class="is-active" data-preset="swapPivot">需要换行</button>
          <button type="button" data-preset="upper3">三元上三角</button>
        </div>
        <div class="ch3-lab-grid">
          <div class="ch3-stage"><canvas data-canvas aria-label="方程组几何视图"></canvas></div>
          <div class="ch3-side">
            <div class="ch3-meter is-4">
              <div class="ch3-meter-card" data-status-card><strong>解的类型</strong><span data-status>—</span></div>
              <div class="ch3-meter-card"><strong>rank(A)</strong><span data-rank-a>—</span></div>
              <div class="ch3-meter-card"><strong>rank([A|b])</strong><span data-rank-aug>—</span></div>
              <div class="ch3-meter-card"><strong>自由变量</strong><span data-free>—</span></div>
            </div>
            <div class="ch3-panel"><h4>当前方程</h4><div data-equations></div></div>
            <div class="ch3-panel"><h4>当前增广矩阵</h4><div data-matrix></div></div>
          </div>
        </div>
        <div class="ch3-operation-grid">
          <label>操作
            <select data-op-type>
              <option value="add">倍加</option>
              <option value="swap">交换</option>
              <option value="scale">倍乘</option>
            </select>
          </label>
          <label>目标行<select data-target></select></label>
          <label data-source-wrap>来源行<select data-source></select></label>
          <label data-factor-wrap>因子<input data-factor type="text" value="-1" inputmode="decimal" aria-label="行操作因子" /></label>
          <button type="button" class="button primary" data-apply>执行操作</button>
        </div>
        <div class="ch3-toolbar">
          <button type="button" data-guide>下一步建议</button>
          <button type="button" data-echelon>直接看阶梯形</button>
          <button type="button" data-rref>直接看简化阶梯形</button>
          <button type="button" data-undo>撤销</button>
          <button type="button" data-reset>重置</button>
        </div>
        <p class="ch3-feedback" data-feedback aria-live="polite"></p>
        <div class="ch3-lab-grid">
          <div class="ch3-panel"><h4>主元列</h4><div data-pivots></div></div>
          <div class="ch3-panel"><h4>已经做过的步骤</h4><ol class="ch3-history" data-history></ol></div>
        </div>
      </div>`;

    const scope = M().createScope(root);
    const presets = M().PRESETS.systems;
    const state = { key: "swapPivot", initial: null, aug: null, history: [], changed: [] };
    const canvas = root.querySelector("[data-canvas]");

    function setFeedback(message, bad = false) {
      const el = root.querySelector("[data-feedback]");
      el.textContent = message;
      el.classList.toggle("is-bad", bad);
    }

    function snapshot(label) {
      state.history.push({ label, matrix: M().cloneMat(state.aug) });
      if (state.history.length > 50) state.history.shift();
    }

    function rebuildRowOptions() {
      const count = state.aug.length;
      root.querySelector("[data-target]").innerHTML = optionList(count, "R");
      root.querySelector("[data-source]").innerHTML = optionList(count, "R");
      root.querySelector("[data-source]").value = count > 1 ? "1" : "0";
    }

    function loadPreset(key) {
      const preset = presets[key];
      state.key = key;
      state.initial = M().matFromNumbers(preset.aug);
      state.aug = M().cloneMat(state.initial);
      state.changed = [];
      state.history = [];
      snapshot(`载入：${preset.label}`);
      rebuildRowOptions();
      if (key === "swapPivot") {
        root.querySelector("[data-op-type]").value = "swap";
        root.querySelector("[data-target]").value = "0";
        root.querySelector("[data-source]").value = "1";
        updateOperationFields();
      }
      setFeedback("选择一种可逆行操作，或查看下一步建议。");
      render();
    }

    function updateOperationFields() {
      const type = root.querySelector("[data-op-type]").value;
      root.querySelector("[data-source-wrap]").hidden = type === "scale";
      root.querySelector("[data-factor-wrap]").hidden = type === "swap";
    }

    function draw() {
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const frame = M().drawAxes(sized.ctx, sized.width, sized.height, 42);
      const n = state.aug[0].length - 1;
      if (n !== 2) {
        sized.ctx.fillStyle = frame.p.muted;
        sized.ctx.font = "600 13px ui-sans-serif, system-ui";
        sized.ctx.fillText("三元系统：几何画布暂只显示二元直线；矩阵计算仍为完整精确计算。", 16, 28);
        return;
      }
      const numeric = M().matToNumbers(state.aug);
      const colors = [frame.p.accent, frame.p.coral, frame.p.blue];
      numeric.forEach((row, index) => M().drawLineEquation(sized.ctx, frame, row[0], row[1], row[2], colors[index % colors.length], 2.6));
      const classification = M().classifySystem(state.aug);
      if (classification.key === "unique") {
        const solution = M().particularSolution(state.aug);
        if (solution.ok) M().drawPoint(sized.ctx, frame, solution.x.slice(0, 2).map(M().toNumber), frame.p.blue, "解");
      }
    }

    function render() {
      const classification = M().classifySystem(state.aug);
      const info = classification.info;
      root.querySelector("[data-equations]").innerHTML = M().htmlEquations(state.aug, state.changed);
      root.querySelector("[data-matrix]").innerHTML = M().htmlMatrix(state.aug, info.n);
      const status = root.querySelector("[data-status]");
      status.textContent = classification.label;
      status.className = `ch3-status ${classification.cls}`;
      root.querySelector("[data-rank-a]").textContent = String(info.rankA);
      root.querySelector("[data-rank-aug]").textContent = String(info.rankAug);
      root.querySelector("[data-free]").textContent = info.free.length ? info.free.map((i) => `x${i + 1}`).join(", ") : "无";
      root.querySelector("[data-pivots]").innerHTML = info.pivots.length
        ? info.pivots.map((column, row) => `<span class="viz-badge">R${row + 1} → x${column + 1}</span>`).join(" ")
        : "没有主元";
      root.querySelector("[data-history]").innerHTML = state.history.map((entry) => `<li>${M().escapeHtml(entry.label)}</li>`).join("");
      root.querySelector("[data-undo]").disabled = state.history.length <= 1;
      M().pulse(root.querySelector("[data-status-card]"));
      draw();
    }

    function applyOperation() {
      const type = root.querySelector("[data-op-type]").value;
      const target = Number(root.querySelector("[data-target]").value);
      const source = Number(root.querySelector("[data-source]").value);
      const before = M().cloneMat(state.aug);
      try {
        let label = "";
        if (type === "swap") {
          if (target === source) throw new RangeError("请选择两条不同的行。 ");
          state.aug = M().rowSwap(state.aug, target, source);
          label = `R${target + 1} ↔ R${source + 1}`;
        } else if (type === "scale") {
          const factor = M().parseF(root.querySelector("[data-factor]").value);
          state.aug = M().rowScale(state.aug, target, factor);
          label = `R${target + 1} ← (${M().formatF(factor)})R${target + 1}`;
        } else {
          if (target === source) throw new RangeError("倍加时目标行和来源行必须不同。 ");
          const factor = M().parseF(root.querySelector("[data-factor]").value);
          state.aug = M().rowAdd(state.aug, target, source, factor);
          label = `R${target + 1} ← R${target + 1} + (${M().formatF(factor)})R${source + 1}`;
        }
        state.changed = M().changedRows(before, state.aug);
        snapshot(label);
        setFeedback(`${label} 已执行；该操作可通过相反操作撤销。`);
        render();
      } catch (error) {
        setFeedback(error.message || "无法执行该操作。", true);
      }
    }

    function useComputed(next, label) {
      const before = M().cloneMat(state.aug);
      state.aug = M().cloneMat(next);
      state.changed = M().changedRows(before, state.aug);
      snapshot(label);
      setFeedback(label);
      render();
    }

    root.querySelectorAll("[data-preset]").forEach((button) => scope.listen(button, "click", () => {
      root.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      loadPreset(button.dataset.preset);
    }));
    scope.listen(root.querySelector("[data-op-type]"), "change", updateOperationFields);
    scope.listen(root.querySelector("[data-apply]"), "click", applyOperation);
    scope.listen(root.querySelector("[data-guide]"), "click", () => {
      const step = M().echelon(state.aug, state.aug[0].length - 1).steps[0];
      if (!step) {
        setFeedback("当前已经是行阶梯形；可以回代或继续化为简化阶梯形。");
        return;
      }
      useComputed(step.matrix, `建议并执行：${step.label}`);
    });
    scope.listen(root.querySelector("[data-echelon]"), "click", () => useComputed(M().echelon(state.aug, state.aug[0].length - 1).matrix, "化到行阶梯形"));
    scope.listen(root.querySelector("[data-rref]"), "click", () => useComputed(M().rref(state.aug, state.aug[0].length - 1).matrix, "化到简化阶梯形"));
    scope.listen(root.querySelector("[data-undo]"), "click", () => {
      if (state.history.length <= 1) return;
      state.history.pop();
      const previous = state.history[state.history.length - 1];
      state.aug = M().cloneMat(previous.matrix);
      state.changed = [];
      setFeedback("已撤销最后一步。 ");
      render();
    });
    scope.listen(root.querySelector("[data-reset]"), "click", () => loadPreset(state.key));
    scope.resize(draw);
    updateOperationFields();
    loadPreset("swapPivot");
    return scope.cleanup;
  }

  // §2 -----------------------------------------------------------------------
  function formalVectorSpace(root) {
    if (!root) return;
    root.innerHTML = formalShell(
      "定理与概念",
      "高维空间不要求我们画出所有坐标轴。只要坐标顺序、数域和运算规则明确，Fⁿ 中的每一步运算都可以被完整核验。",
      module(
        "01",
        "Fⁿ 与标准基",
        "坐标不是标签，而是相对于固定基的系数",
        `<div class="ch3-theorem-row"><div>${texD(String.raw`x=\begin{bmatrix}x_1\\\vdots\\x_n\end{bmatrix}=x_1e_1+\cdots+x_ne_n`)}</div><p>标准基中的第 i 个向量只有第 i 个坐标为 1。坐标分解唯一，因此每个位置都承担固定含义。</p></div>`,
      ) +
        module(
          "02",
          "线性组合",
          "先缩放，再相加；所有坐标同步参与",
          cards([
            ["闭合", "结果仍在 Fⁿ", "同维向量相加、数乘后坐标个数不变。"],
            ["零向量", "所有坐标为 0", "它是加法单位元，也是所有线性组合的共同基准。"],
            ["投影", "只保留部分坐标", "投影适合观察，但不能代替完整高维判定。"],
          ]),
        ),
    );
  }

  function interactiveVectorSpace(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch3-lab ch3-lab--vector" data-ch3-lab="vector-space">
        <div class="ch3-lab-head">
<span class="ch3-lab-kicker">向量表示从起点到终点的有向位移</span>
<h3>把线性组合走一遍</h3>
<p>先沿着 αu 走，再从它的终点沿 βv 走；最终从原点指向终点的箭头，就是 w=αu+βv。</p>
        </div>
        <div class="ch3-mission" aria-label="实验任务">
<strong>你来试一试</strong>
<span>改变 α、β 或任意坐标，观察“首尾相接”的两段位移怎样合成为 w。</span>
<span class="ch3-mission-result">观察：每一个坐标都按同一组系数相加</span>
        </div>
        <div class="ch3-control-row ch3-scenario-row">
<label>空间维数 n <input type="range" min="1" max="8" step="1" value="3" data-n /></label>
<span class="viz-badge" data-n-value>3</span>
<button type="button" data-negate>反向 u</button>
<button type="button" data-swap>交换 u、v</button>
<button type="button" data-zero>清零</button>
        </div>
        <div class="ch3-scene-grid">
<section class="ch3-stage-shell" aria-label="线性组合几何过程">
  <div class="ch3-stage-caption"><strong>几何视图</strong><span data-projection-note>前两坐标投影</span></div>
  <div class="ch3-stage"><canvas data-canvas aria-label="向量首尾相接与合向量"></canvas></div>
  <div class="ch3-stage-legend" aria-label="图例">
    <span><i class="is-accent"></i>第一段 αu</span>
    <span><i class="is-coral"></i>第二段 βv</span>
    <span><i class="is-blue"></i>合向量 w</span>
  </div>
</section>
<aside class="ch3-readout ch3-vector-readout">
  <section class="ch3-equation-hero" data-formula-card>
    <span>当前线性组合</span>
    <div data-formula></div>
    <p>虚线平行四边形只帮助观察；右侧坐标列才是完整的 n 维向量。</p>
  </section>
  <section class="ch3-coefficient-panel">
    <h4>缩放两条位移</h4>
    <label class="ch3-slider"><span>α</span><input type="range" min="-2" max="2" step="0.05" value="1" data-alpha /><strong data-alpha-value>1</strong></label>
    <label class="ch3-slider"><span>β</span><input type="range" min="-2" max="2" step="0.05" value="1" data-beta /><strong data-beta-value>1</strong></label>
  </section>
  <section class="ch3-vector-table" aria-label="完整坐标">
    <div><span>u</span><div data-u-vector></div></div>
    <div><span>v</span><div data-v-vector></div></div>
    <div class="is-result"><span>w</span><div data-w-vector></div></div>
  </section>
</aside>
        </div>
        <details class="ch3-details" open>
<summary>编辑完整坐标</summary>
<div class="ch3-vector-editor">
  <section><h4>u 的坐标</h4><div class="ch3-sliders" data-u-sliders></div></section>
  <section><h4>v 的坐标</h4><div class="ch3-sliders" data-v-sliders></div></section>
</div>
        </details>
        <section class="ch3-coordinate-summary"><div><h4>w 的每个坐标</h4><p>条形只表示大小，右端数字保留正负号。</p></div><div class="ch3-coord-bars" data-bars></div></section>
        <p class="ch3-feedback" data-note aria-live="polite"></p>
      </div>`;
    const scope = M().createScope(root);
    const state = {
      n: 3,
      u: [1.2, 0.4, -0.6, 0.8, 0, 0, 0, 0],
      v: [-0.3, 1.1, 0.5, 0, 0, 0, 0, 0],
      alpha: 1,
      beta: 1,
    };
    const canvas = root.querySelector("[data-canvas]");

    function formatCombo(vector) {
      const terms = [];
      vector.forEach((value, index) => {
        if (Math.abs(value) < 1e-9) return;
        const magnitude = M().formatNumber(Math.abs(value));
        const body = magnitude === "1" ? `e_{${index + 1}}` : `${magnitude}e_{${index + 1}}`;
        if (!terms.length) terms.push(value < 0 ? `-${body}` : body);
        else terms.push(value < 0 ? `- ${body}` : `+ ${body}`);
      });
      return terms.join(" ") || "0";
    }

    function wVector() {
      return Array.from({ length: state.n }, (_, index) => state.alpha * state.u[index] + state.beta * state.v[index]);
    }

    function buildSliders(key, container) {
      container.innerHTML = Array.from({ length: state.n }, (_, index) => `
        <label class="ch3-slider"><span>${key}<sub>${index + 1}</sub></span>
<input type="range" min="-2" max="2" step="0.05" value="${state[key][index]}" data-coordinate="${index}" />
<strong data-value>${M().formatNumber(state[key][index])}</strong>
        </label>`).join("");
      container.querySelectorAll("[data-coordinate]").forEach((input) => scope.listen(input, "input", () => {
        const index = Number(input.dataset.coordinate);
        state[key][index] = Number(input.value);
        input.parentElement.querySelector("[data-value]").textContent = M().formatNumber(state[key][index]);
        render();
      }));
    }

    function rebuildEditors() {
      buildSliders("u", root.querySelector("[data-u-sliders]"));
      buildSliders("v", root.querySelector("[data-v-sliders]"));
    }

    function draw() {
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const frame = M().drawAxes(sized.ctx, sized.width, sized.height, 54);
      const w = wVector();
      const alphaU = [state.alpha * (state.u[0] || 0), state.alpha * (state.u[1] || 0)];
      const betaV = [state.beta * (state.v[0] || 0), state.beta * (state.v[1] || 0)];
      const total = [alphaU[0] + betaV[0], alphaU[1] + betaV[1]];
      const O = [0, 0];

      const points = [O, alphaU, total, betaV].map((point) => M().toCanvas(frame, point));
      sized.ctx.save();
      sized.ctx.strokeStyle = frame.p.muted;
      sized.ctx.globalAlpha = 0.42;
      sized.ctx.lineWidth = 1.4;
      sized.ctx.setLineDash([6, 6]);
      sized.ctx.beginPath();
      sized.ctx.moveTo(...points[0]);
      sized.ctx.lineTo(...points[1]);
      sized.ctx.lineTo(...points[2]);
      sized.ctx.lineTo(...points[3]);
      sized.ctx.closePath();
      sized.ctx.stroke();
      sized.ctx.restore();

      M().drawArrowBetween(sized.ctx, frame, O, alphaU, frame.p.accent, "αu", 3.1, { tailDot: true, labelT: 0.72, labelOffset: -9 });
      M().drawArrowBetween(sized.ctx, frame, alphaU, total, frame.p.coral, "βv", 3.1, { labelT: 0.48, labelOffset: 12 });
      M().drawArrowBetween(sized.ctx, frame, O, total, frame.p.blue, "w", 3.7, { labelT: 1, labelOffset: -12 });

      sized.ctx.save();
      sized.ctx.fillStyle = frame.p.muted;
      sized.ctx.font = "650 12px ui-sans-serif, system-ui";
      sized.ctx.fillText(state.n > 2 ? `二维投影 · 完整向量属于 F^${state.n}` : "二维完整视图", 14, 22);
      sized.ctx.restore();
    }

    function render() {
      const w = wVector();
      root.querySelector("[data-n-value]").textContent = String(state.n);
      root.querySelector("[data-alpha-value]").textContent = M().formatNumber(state.alpha);
      root.querySelector("[data-beta-value]").textContent = M().formatNumber(state.beta);
      root.querySelector("[data-projection-note]").textContent = state.n > 2 ? `仅显示第 1、2 坐标 · 完整维数 n=${state.n}` : "二维完整视图";
      root.querySelector("[data-u-vector]").innerHTML = M().htmlVector(state.u.slice(0, state.n).map(M().fromNumber));
      root.querySelector("[data-v-vector]").innerHTML = M().htmlVector(state.v.slice(0, state.n).map(M().fromNumber));
      root.querySelector("[data-w-vector]").innerHTML = M().htmlVector(w.map(M().fromNumber));
      root.querySelector("[data-formula]").innerHTML = `${texD(String.raw`w=${M().formatNumber(state.alpha)}u+(${M().formatNumber(state.beta)})v`)}<div class="ch3-basis-line">${tex(String.raw`w=${formatCombo(w)}`)}</div>`;
      root.querySelector("[data-bars]").innerHTML = w.map((value, index) => {
        const width = Math.min(100, Math.abs(value) / 4 * 100);
        return `<div class="ch3-bar-row ${value < 0 ? "is-negative" : "is-positive"}"><span>w${index + 1}</span><div class="ch3-bar-track"><div class="ch3-bar-fill" style="width:${width}%"></div></div><strong>${M().formatNumber(value)}</strong></div>`;
      }).join("");
      root.querySelector("[data-note]").textContent = state.n > 2
        ? "图中只保留前两坐标，所以它是投影，不是完整的高维向量；完整结论请读右侧坐标列。"
        : "αu 与 βv 首尾相接，合向量 w 从原点直接指向同一个终点。";
      M().pulse(root.querySelector("[data-formula-card]"));
      draw();
    }

    scope.listen(root.querySelector("[data-n]"), "input", (event) => {
      state.n = Number(event.target.value);
      rebuildEditors();
      render();
    });
    scope.listen(root.querySelector("[data-alpha]"), "input", (event) => { state.alpha = Number(event.target.value); render(); });
    scope.listen(root.querySelector("[data-beta]"), "input", (event) => { state.beta = Number(event.target.value); render(); });
    scope.listen(root.querySelector("[data-negate]"), "click", () => {
      for (let i = 0; i < state.n; i += 1) state.u[i] *= -1;
      rebuildEditors(); render();
    });
    scope.listen(root.querySelector("[data-swap]"), "click", () => {
      [state.u, state.v] = [state.v, state.u];
      rebuildEditors(); render();
    });
    scope.listen(root.querySelector("[data-zero]"), "click", () => {
      for (let i = 0; i < state.n; i += 1) { state.u[i] = 0; state.v[i] = 0; }
      rebuildEditors(); render();
    });
    scope.resize(draw);
    rebuildEditors();
    render();
    return scope.cleanup;
  }

  // §3 -----------------------------------------------------------------------
  function formalDependence(root) {
    if (!root) return;
    root.innerHTML = formalShell(
      "定理与概念",
      "图形可以提示共线、共面或冗余；严格判断来自一个不全为零的系数向量，它使线性组合恰好等于零。",
      module(
        "01",
        "非平凡零组合",
        "把向量作为矩阵的列，问题变成齐次方程",
        `<div class="ch3-theorem-row"><div>${texD(String.raw`c_1v_1+\cdots+c_pv_p=0\quad\Longleftrightarrow\quad Ac=0`)}</div><p>若零空间中存在非零 c，向量组相关；若零空间只有零向量，向量组无关。</p></div>`,
      ) +
        module(
          "02",
          "张成是否增长",
          "加入与删除是同一问题的两个方向",
          cards([
            ["加入", "新向量在旧张成外", "张成维数增加，提供新方向。"],
            ["冗余", "新向量在旧张成内", "可由原向量表示，整体相关。"],
            ["极大", "删去冗余后的骨架", "保持原张成且内部线性无关。"],
          ]),
        ),
    );
  }

  function interactiveDependence(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch3-lab" data-ch3-lab="dependence">
        <div class="ch3-lab-head"><span class="ch3-lab-kicker">目标 · 判断新向量有没有带来新方向</span><h3>新向量会不会增加维数</h3><p>拖动向量箭头，让 v₃ 进入或离开已有张成。先看张成是否扩大，再用右侧的非平凡线性关系作严格判断。</p></div><div class="ch3-mission"><strong>你来试一试</strong><span>选择“第三个是和”，观察 v₃ 如何由 v₁、v₂ 合成；再取消保留 v₃，比较张成维数。</span><span class="ch3-mission-result">观察：删掉冗余向量，张成不变</span></div>
        <div class="ch3-presets">
          <button type="button" data-preset="basis">二维基</button>
          <button type="button" data-preset="proportional">比例向量</button>
          <button type="button" class="is-active" data-preset="three">第三个是和</button>
          <button type="button" data-preset="near">近共线</button>
          <button type="button" data-preset="zero">含零向量</button>
        </div>
        <div class="ch3-lab-grid">
          <div class="ch3-stage"><canvas data-canvas aria-label="可拖动向量与张成"></canvas></div>
          <div class="ch3-side">
            <div class="ch3-meter is-3">
              <div class="ch3-meter-card" data-result-card><strong>判定</strong><span data-status>—</span></div>
              <div class="ch3-meter-card"><strong>秩</strong><span data-rank>—</span></div>
              <div class="ch3-meter-card"><strong>张成维数</strong><span data-span>—</span></div>
            </div>
            <div class="ch3-panel"><h4>当前向量</h4><div data-vectors></div></div>
            <div class="ch3-panel"><h4>非平凡线性关系</h4><div data-certificate></div></div>
            <div class="ch3-panel"><h4>加入顺序</h4><div data-independence></div></div>
          </div>
        </div>
        <div class="ch3-delete-row" data-delete-row></div>
        <p class="ch3-feedback" data-note aria-live="polite"></p>
      </div>`;
    const scope = M().createScope(root);
    const canvas = root.querySelector("[data-canvas]");
    const presets = {
      basis: [[1.2, 0.2], [0.25, 1.1]],
      proportional: [[1, 0.5], [2, 1]],
      three: [[1, 0], [0, 1], [1, 1]],
      near: [[1, 0.25], [1.05, 0.3]],
      zero: [[1.1, 0.4], [0, 0]],
    };
    const state = { key: "three", vectors: [], enabled: [] };

    function load(key) {
      state.key = key;
      state.vectors = presets[key].map((vector) => vector.slice());
      state.enabled = state.vectors.map(() => true);
      buildDeleteControls();
      render();
    }

    function activeEntries() {
      return state.vectors.map((vector, index) => ({ vector, index })).filter((entry) => state.enabled[entry.index]);
    }

    function buildDeleteControls() {
      root.querySelector("[data-delete-row]").innerHTML = state.vectors.map((_, index) => `
        <label class="form-check"><input class="form-check-input" type="checkbox" checked data-enable="${index}" id="ch3-enable-${index}" />
          <span class="form-check-label">保留 v${index + 1}</span></label>`).join("");
      root.querySelectorAll("[data-enable]").forEach((input) => scope.listen(input, "change", () => {
        state.enabled[Number(input.dataset.enable)] = input.checked;
        render();
      }));
    }

    function certificateWithOriginalLabels(entries) {
      const certificate = M().relationCertificate(entries.map((entry) => entry.vector));
      if (!certificate.dependent) return { ...certificate, latex: "" };
      const terms = [];
      certificate.coeffs.forEach((coefficient, position) => {
        if (M().isZero(coefficient)) return;
        const original = entries[position].index + 1;
        const magnitude = M().absF(coefficient);
        const coeffText = M().eq(magnitude, M().F(1)) ? "" : M().latexF(magnitude);
        const term = `${coeffText}v_{${original}}`;
        if (!terms.length) terms.push(coefficient.n < 0 ? `-${term}` : term);
        else terms.push(coefficient.n < 0 ? `- ${term}` : `+ ${term}`);
      });
      return { ...certificate, latex: `${terms.join(" ")} = 0` };
    }

    function draw() {
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const frame = M().drawAxes(sized.ctx, sized.width, sized.height, 52);
      const entries = activeEntries();
      M().drawSpan(sized.ctx, frame, entries.map((entry) => entry.vector), frame.p.accent);
      const colors = [frame.p.accent, frame.p.coral, frame.p.blue, frame.p.muted];
      state.vectors.forEach((vector, index) => {
        if (!state.enabled[index]) return;
        M().drawArrow(sized.ctx, frame, vector, colors[index % colors.length], `v${index + 1}`);
      });
      sized.ctx.fillStyle = frame.p.muted;
      sized.ctx.font = "600 12px ui-sans-serif, system-ui";
      sized.ctx.fillText("拖动箭头端点；坐标吸附到 0.05 网格", 14, 22);
    }

    function render() {
      const entries = activeEntries();
      const certificate = certificateWithOriginalLabels(entries);
      const status = root.querySelector("[data-status]");
      status.textContent = entries.length ? (certificate.dependent ? "线性相关" : "线性无关") : "空组";
      status.className = `ch3-status ${certificate.dependent ? "is-bad" : "is-ok"}`;
      root.querySelector("[data-rank]").textContent = String(certificate.rank || 0);
      root.querySelector("[data-span]").textContent = certificate.rank === 0 ? "点" : certificate.rank === 1 ? "直线" : "平面";
      root.querySelector("[data-vectors]").innerHTML = entries.length
        ? entries.map((entry) => `<div>${tex(String.raw`v_{${entry.index + 1}}=`)}${M().htmlVector(entry.vector.map(M().fromNumber))}</div>`).join("")
        : "没有保留任何向量";
      root.querySelector("[data-certificate]").innerHTML = certificate.dependent
        ? tex(certificate.latex)
        : "只有全零系数能使组合回到零。";
      const accepted = [];
      const steps = entries.map((entry) => {
        const before = M().relationCertificate(accepted.map((item) => item.vector)).rank || 0;
        const afterEntries = [...accepted, entry];
        const after = M().relationCertificate(afterEntries.map((item) => item.vector)).rank || 0;
        const grows = after > before;
        if (grows) accepted.push(entry);
        return `<span class="viz-badge${grows ? "" : " is-muted"}">v${entry.index + 1}：${grows ? "新增方向" : "冗余"}</span>`;
      });
      root.querySelector("[data-independence]").innerHTML = steps.join(" ") || "—";
      if (state.key === "near") {
        const det = entries.length >= 2 ? Math.abs(entries[0].vector[0] * entries[1].vector[1] - entries[0].vector[1] * entries[1].vector[0]) : 0;
        root.querySelector("[data-note]").textContent = `当前二维面积指标约为 ${M().formatNumber(det, 3)}。只要它精确不为 0，两向量仍然线性无关。`;
      } else {
        root.querySelector("[data-note]").textContent = "删除一个向量后若秩不变，该向量相对其余向量是冗余的。";
      }
      M().pulse(root.querySelector("[data-result-card]"));
      draw();
    }

    root.querySelectorAll("[data-preset]").forEach((button) => scope.listen(button, "click", () => {
      root.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      load(button.dataset.preset);
    }));
    M().bindDraggablePoints(scope, canvas, () => state.vectors, (index, point) => {
      state.vectors[index] = point.map((value) => Math.max(-2.5, Math.min(2.5, value)));
      render();
    }, render, 20);
    scope.resize(draw);
    load("three");
    return scope.cleanup;
  }

  window.defineChapter3Renderer?.("elimination", { formal: formalElimination, interactive: interactiveElimination });
  window.defineChapter3Renderer?.("n-vector-space", { formal: formalVectorSpace, interactive: interactiveVectorSpace });
  window.defineChapter3Renderer?.("linear-dependence", { formal: formalDependence, interactive: interactiveDependence });
})();
