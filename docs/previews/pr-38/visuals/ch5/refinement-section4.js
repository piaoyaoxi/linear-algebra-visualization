/* Chapter 5 refined renderer, section 4. */
(() => {
  const { M, tex, display, q, qa, formalShell, moduleCard, status, makeController, setActive, eigenSystem2, spectrumHtml, inertiaHtml, drawContoursWithBasis, classificationNote } = window.Ch5Refine;
  /* ------------------------------------------------------------------ §4 */
  function renderFormal4(formal) {
    if (!formal) return;
    formal.innerHTML = formalShell(
      "把无穷多个方向压缩成有限判据",
      "正定要求所有非零方向严格为正。方向扫描、特征值、惯性、标准形、主子式与 Cholesky 看似是不同工具，实际上都在寻找同一个事实：最小二次方向是否仍高于 0。",
      [
        moduleCard(
          "1",
          "五种符号类型",
          "严格同号、允许零、或同时出现正负",
          `<div class="ch5-sign-cases"><span class="is-positive">正定</span><span>半正定</span><span class="is-negative">负定</span><span>半负定</span><span class="is-warning">不定</span></div><p class="ch5-muted">半正定与正定的区别只发生在“是否存在非零零方向”，但这个边界会同时让最小特征值、行列式和 Cholesky 主元归零。</p>`,
        ),
        moduleCard(
          "2",
          "四条等价主线",
          "同一个正定事实",
          `<div class="ch5-equivalence-chain"><span>q(x)>0</span><i>⇔</i><span>λmin>0</span><i>⇔</i><span>p=n</span><i>⇔</i><span>标准形全正</span></div>`,
        ),
        moduleCard(
          "3",
          "Sylvester 判据",
          "只需左上角嵌套主子式",
          `${display("A>0\\quad\\Longleftrightarrow\\quad \\Delta_1>0,\\ldots,\\Delta_n>0")}
          <p class="ch5-muted">负定时符号交替：${tex("(-1)^k\\Delta_k>0")}。半正定不能把“>0”机械换成“≥0”。</p>`,
        ),
        moduleCard(
          "4",
          "长度平方结构",
          "Gram 与 Cholesky",
          `${display("A=R^TR\\quad\\Longrightarrow\\quad x^TAx=\\|Rx\\|^2")}
          <p class="ch5-muted">BᵀB 总半正定，B 列满秩时正定。Cholesky 成功与顺序主子式全正是同一门槛的数值版本。</p>`,
        ),
      ],
    );
  }

  function renderWrongCriterion(label, pass, detail) {
    return `<div class="ch5-criterion ${pass ? "is-pass" : "is-fail"}"><span>${label}</span><strong>${pass ? "满足" : "不满足"}</strong><p>${detail}</p></div>`;
  }

  function mountLab4(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch5-lab ch5-refined" data-ch5-section="4">
        <div class="ch5-lab-head"><h3>从碗面穿过山谷到马鞍</h3><p>默认使用 A(t)=[[1,t],[t,1]]。t=1 是所有判据同时触碰 0 的临界点。越过它以后，原本的碗面出现负方向并变成马鞍。</p></div>
        <div class="ch5-toolbar ch5-mode-tabs">
          <button type="button" class="is-active" data-s4-mode="family">临界参数族</button>
          <button type="button" data-s4-mode="custom">自定义 / 反例</button>
        </div>
        <section data-s4-family>
          <label class="ch5-slider-row family-slider"><span>t</span><input type="range" min="-1.5" max="1.5" step="0.01" value="0" data-s4-t><output data-s4-t-value>0</output></label>
          <div class="ch5-family-marks"><span>−1：半正定</span><span>0：单位碗</span><span>1：半正定</span></div>
        </section>
        <section data-s4-custom hidden>
          <div class="ch5-sliders ch5-coeff-row">
            <label><span>a</span><input type="range" min="-3" max="3" step="0.1" data-s4-coeff="a"><output data-s4-value="a"></output></label>
            <label><span>b（矩阵位）</span><input type="range" min="-3" max="3" step="0.1" data-s4-coeff="b"><output data-s4-value="b"></output></label>
            <label><span>c</span><input type="range" min="-3" max="3" step="0.1" data-s4-coeff="c"><output data-s4-value="c"></output></label>
          </div>
          <div class="ch5-toolbar">
            <button type="button" data-s4-counter="diag-positive">对角元正仍不定</button>
            <button type="button" data-s4-counter="det-positive">det>0 仍负定</button>
            <button type="button" data-s4-counter="leading-nonnegative">顺序主子式非负仍非半正定</button>
            <button type="button" data-s4-counter="psd">真正半正定</button>
          </div>
        </section>
        <div class="ch5-observatory-grid">
          <div class="ch5-observation"><div class="ch5-stage"><canvas data-s4-surface></canvas></div><strong>曲面 z=xᵀAx</strong></div>
          <div class="ch5-observation"><div class="ch5-stage"><canvas data-s4-contour></canvas></div><strong>等高线与零方向</strong></div>
          <div class="ch5-observation"><div class="ch5-stage"><canvas data-s4-scan></canvas></div><strong>单位圆方向值 q(θ)</strong></div>
        </div>
        <div class="ch5-lab-grid">
          <div class="ch5-panel">
            <div class="ch5-readout ch5-classification-card"><div><strong>当前分类</strong><span data-s4-class></span></div><p data-s4-class-note></p><div data-s4-matrix></div></div>
            <div class="ch5-dashboard">
              <div><span>λmax</span><strong data-s4-lmax></strong></div>
              <div><span>λmin</span><strong data-min-eig></strong></div>
              <div><span>Δ₁</span><strong data-s4-d1></strong></div>
              <div><span>Δ₂</span><strong data-d2></strong></div>
              <div><span>p,q,0</span><strong data-s4-inertia></strong></div>
              <div><span>min q(θ)</span><strong data-s4-minq></strong></div>
            </div>
            <div class="ch5-gate-grid">
              <div class="ch5-gate" data-s4-sylvester><span>Sylvester 正定闸门</span><strong></strong><p></p></div>
              <div class="ch5-gate" data-s4-cholesky><span>Cholesky 闸门</span><strong data-chol-status></strong><p data-s4-chol-note></p></div>
            </div>
          </div>
          <div class="ch5-panel">
            <div class="ch5-readout"><strong>常见“伪判据”现场核对</strong><div data-s4-criteria class="ch5-criteria-grid"></div><p class="ch5-muted">这些条件即使显示“满足”，也不能单独推出正定。真正可靠的是等价判据的完整条件。</p></div>
            <div class="ch5-readout"><strong>半正定额外检查（二阶）</strong><div data-s4-psd-minors></div><p class="ch5-muted">二阶实对称矩阵半正定 ⇔ a≥0、c≥0、det A≥0，也就是所有主子式非负；只查左上顺序主子式不够。</p></div>
          </div>
        </div>
      </div>`;

    const life = makeController(root);
    const state = { mode: "family", t: 0, a: 1, b: 0, c: 1 };
    const counterexamples = {
      "diag-positive": { a: 1, b: 2, c: 1 },
      "det-positive": { a: -1, b: 0, c: -2 },
      "leading-nonnegative": { a: 0, b: 0, c: -1 },
      psd: { a: 1, b: 1, c: 1 },
    };

    const matrix = () => (state.mode === "family" ? M().mat2FromAbc(1, state.t, 1) : M().mat2FromAbc(state.a, state.b, state.c));

    function paint() {
      q(root, "[data-s4-family]").hidden = state.mode !== "family";
      q(root, "[data-s4-custom]").hidden = state.mode !== "custom";
      q(root, "[data-s4-t]").value = String(state.t);
      q(root, "[data-s4-t-value]").textContent = M().formatNum(state.t, 2);
      ["a", "b", "c"].forEach((key) => {
        q(root, `[data-s4-coeff="${key}"]`).value = String(state[key]);
        q(root, `[data-s4-value="${key}"]`).textContent = M().formatNum(state[key], 2);
      });
      const A = matrix();
      const cls = M().classify2(A);
      const inn = cls.inn;
      const [lmax, lmin] = inn.eigenvalues;
      const d1 = A[0][0];
      const d2 = M().det2(A);
      const sylvester = d1 > 1e-8 && d2 > 1e-8;
      q(root, "[data-s4-class]").innerHTML = status(cls.label, cls.cls);
      q(root, "[data-s4-class-note]").textContent = classificationNote(cls);
      q(root, "[data-s4-matrix]").innerHTML = M().matrixHtml(A);
      q(root, "[data-s4-lmax]").textContent = M().formatNum(lmax, 4);
      q(root, "[data-min-eig]").textContent = M().formatNum(lmin, 4);
      q(root, "[data-s4-d1]").textContent = M().formatNum(d1, 4);
      q(root, "[data-d2]").textContent = M().formatNum(d2, 4);
      q(root, "[data-s4-inertia]").textContent = `${inn.p}, ${inn.q}, ${inn.zero}`;
      q(root, "[data-s4-minq]").textContent = M().formatNum(lmin, 4);
      const sylvGate = q(root, "[data-s4-sylvester]");
      sylvGate.className = `ch5-gate ${sylvester ? "is-open" : "is-closed"}`;
      q(sylvGate, "strong").textContent = sylvester ? "通过：正定" : "未通过";
      q(sylvGate, "p").textContent = `Δ₁=${M().formatNum(d1, 3)}，Δ₂=${M().formatNum(d2, 3)}。`;
      const chol = M().cholesky2(A);
      const cholGate = q(root, "[data-s4-cholesky]");
      cholGate.className = `ch5-gate ${chol.ok ? "is-open" : "is-closed"}`;
      q(root, "[data-chol-status]").textContent = chol.ok ? "成功" : "中断";
      q(root, "[data-s4-chol-note]").textContent = chol.ok
        ? `A=RᵀR，R=${chol.R.map((row) => row.map((v) => M().formatNum(v, 3)).join(",")).join(" ; ")}。`
        : `${chol.reason}`;
      const diagonalPositive = A[0][0] > 0 && A[1][1] > 0;
      const detPositive = d2 > 0;
      const entriesPositive = A.flat().every((v) => v > 0);
      q(root, "[data-s4-criteria]").innerHTML = [
        renderWrongCriterion("两个对角元都正", diagonalPositive, diagonalPositive ? "只是必要现象之一，交叉项仍可能过大。" : "当前连这个必要现象都不满足。"),
        renderWrongCriterion("det A > 0", detPositive, detPositive ? "也可能两个特征值都负，因此不足。" : "当前行列式没有给出正定信号。"),
        renderWrongCriterion("所有元素都正", entriesPositive, entriesPositive ? "元素符号不是合同不变量，仍可能不定。" : "当前不满足，但这本来也不是必要条件。"),
      ].join("");
      const principal = [A[0][0], A[1][1], d2];
      q(root, "[data-s4-psd-minors]").innerHTML = `<div class="ch5-principal-minors">${principal
        .map((value, index) => `<span class="${value >= -1e-8 ? "is-ok" : "is-bad"}">${["a", "c", "det A"][index]} = ${M().formatNum(value, 3)}</span>`)
        .join("")}</div>`;
      M().drawSurface(q(root, "[data-s4-surface]"), A, { caption: "正值与负值用不同区域显示" });
      M().drawContours(q(root, "[data-s4-contour]"), A, { caption: "零方向在临界点出现" });
      M().drawUnitCircleScan(q(root, "[data-s4-scan]"), A, { caption: "min q(θ)=最小特征值" });
    }

    qa(root, "[data-s4-mode]").forEach((button) => life.on(button, "click", () => {
      state.mode = button.dataset.s4Mode;
      setActive(root, "[data-s4-mode]", button);
      paint();
    }));
    life.on(q(root, "[data-s4-t]"), "input", (event) => {
      state.t = Number(event.target.value);
      paint();
    });
    qa(root, "[data-s4-coeff]").forEach((input) => life.on(input, "input", () => {
      state[input.dataset.s4Coeff] = Number(input.value);
      paint();
    }));
    qa(root, "[data-s4-counter]").forEach((button) => life.on(button, "click", () => {
      Object.assign(state, counterexamples[button.dataset.s4Counter]);
      state.mode = "custom";
      setActive(root, "[data-s4-mode]", q(root, '[data-s4-mode="custom"]'));
      paint();
    }));
    life.resize(paint);
    paint();
    return () => life.cleanup();
  }

  window.defineChapter5Renderer("positive-definite", { formal: renderFormal4, interactive: mountLab4 });
})();
