/* Chapter 5 refined renderer, section 1. */
(() => {
  const { M, tex, display, q, qa, formalShell, moduleCard, status, makeController, setActive, eigenSystem2, spectrumHtml, inertiaHtml, drawContoursWithBasis, classificationNote } = window.Ch5Refine;
  /* ------------------------------------------------------------------ §1 */
  function renderFormal1(formal) {
    if (!formal) return;
    formal.innerHTML = formalShell(
      "一个对象，四种写法",
      "二次型的关键不是背下 xᵀAx，而是看清多项式、对称矩阵、方向值和几何图像如何一一对应。合同变换随后告诉我们：换变量时，哪些只是表达变化，哪些结构会被保存。",
      [
        moduleCard(
          "1",
          "先检查“二次齐次”",
          "二次不等于二次型",
          `<div class="ch5-definition-grid"><div>${status("属于二次型", "is-ok")}<p>${tex("2x_1^2-3x_1x_2+x_2^2")}</p></div><div>${status("不属于", "is-bad")}<p>${tex("x_1^2+x_2+1")}</p></div></div><p class="ch5-muted">只有每一项总次数都为 2，才进入本章的矩阵语言。</p>`,
        ),
        moduleCard(
          "2",
          "交叉项为什么平分",
          "两个对称位置各贡献一次",
          `${display("\\begin{bmatrix}x_1&x_2\\end{bmatrix}\\begin{bmatrix}a&b\\\\b&c\\end{bmatrix}\\begin{bmatrix}x_1\\\\x_2\\end{bmatrix}=ax_1^2+2bx_1x_2+cx_2^2")}
          <div class="ch5-split-proof"><span>多项式交叉系数 2b</span><span>→</span><span>a₁₂=b</span><span>+</span><span>a₂₁=b</span></div>`,
        ),
        moduleCard(
          "3",
          "为什么必须对称化",
          "斜对称信息完全不可见",
          `${display("B=\\frac{B+B^T}{2}+\\frac{B-B^T}{2}=S+K")}
          <p class="ch5-muted">${tex("x^TKx")} 是一个标量，转置后却变为 ${tex("-x^TKx")}，所以它只能等于 0。二次型真正看见的只有 S。</p>`,
        ),
        moduleCard(
          "4",
          "变量替换与合同",
          "先分开“恒等式”和“可逆换坐标”",
          `${display("x=Cy\\quad\\Longrightarrow\\quad x^TAx=y^T(C^TAC)y")}
          <div class="ch5-two-gates"><div><strong>代数恒等式</strong><p>对任意 C 都成立。</p></div><div><strong>合同 / 坐标替换</strong><p>还必须 det C≠0。</p></div></div>`,
        ),
      ],
    );
  }

  function mountLab1(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch5-lab ch5-refined" data-ch5-section="1">
        <div class="ch5-lab-head"><h3>三重翻译器</h3><p>不要把公式、矩阵和图形分开记。三个工作台分别回答：系数怎样进矩阵、非对称矩阵哪些信息会消失、合同为何必须可逆。</p></div>
        <div class="ch5-toolbar ch5-mode-tabs" role="tablist">
          <button type="button" class="is-active" data-s1-mode="coeff">① 系数映射</button>
          <button type="button" data-s1-mode="sym">② 对称化</button>
          <button type="button" data-s1-mode="cong">③ 合同桥</button>
        </div>

        <section data-s1-pane="coeff">
          <div class="ch5-lab-grid">
            <div class="ch5-panel">
              <div class="ch5-equation-card" data-s1-poly></div>
              <div class="ch5-sliders">
                <label class="ch5-slider-row wide"><span>x₁² 系数 a</span><input type="range" min="-3" max="3" step="0.1" value="2" data-s1-coeff="a"><output data-s1-value="a">2</output></label>
                <label class="ch5-slider-row wide"><span>x₁x₂ 系数 m</span><input type="range" min="-5" max="5" step="0.1" value="4" data-s1-coeff="m"><output data-s1-value="m">4</output></label>
                <label class="ch5-slider-row wide"><span>x₂² 系数 c</span><input type="range" min="-3" max="3" step="0.1" value="1" data-s1-coeff="c"><output data-s1-value="c">1</output></label>
              </div>
              <div class="ch5-toolbar">
                <button type="button" data-s1-coeff-preset="diagonal">无交叉项</button>
                <button type="button" data-s1-coeff-preset="cross">纯交叉项</button>
                <button type="button" data-s1-coeff-preset="bowl">倾斜碗面</button>
                <button type="button" data-s1-coeff-preset="saddle">马鞍</button>
              </div>
              <div class="ch5-stage"><canvas data-s1-coeff-canvas aria-label="二次型等高线"></canvas></div>
            </div>
            <div class="ch5-panel">
              <div class="ch5-readout"><strong>唯一实对称矩阵 A</strong><div data-s1-matrix class="ch5-matrix-wrap"></div></div>
              <div class="ch5-cross-split"><span data-s1-cross-total></span><div><b data-s1-cross-left></b><i>+</i><b data-s1-cross-right></b></div><small>两个对称位置合计还原交叉项</small></div>
              <div data-s1-coeff-inertia></div>
              <div class="ch5-readout"><strong>方向核对</strong><div data-s1-direction-check class="ch5-checks"></div></div>
            </div>
          </div>
        </section>

        <section data-s1-pane="sym" hidden>
          <div class="ch5-lab-grid">
            <div class="ch5-panel">
              <div class="ch5-toolbar">
                <button type="button" data-s1-b-preset="asym">明显非对称</button>
                <button type="button" data-s1-b-preset="upper">上三角</button>
                <button type="button" data-s1-b-preset="skew">纯斜对称</button>
                <button type="button" data-s1-b-preset="sym">已经对称</button>
              </div>
              <div class="ch5-sliders compact-four">
                <label><span>b₁₁</span><input type="range" min="-3" max="3" step="0.1" data-s1-b="0"><output data-s1-bv="0"></output></label>
                <label><span>b₁₂</span><input type="range" min="-3" max="3" step="0.1" data-s1-b="1"><output data-s1-bv="1"></output></label>
                <label><span>b₂₁</span><input type="range" min="-3" max="3" step="0.1" data-s1-b="2"><output data-s1-bv="2"></output></label>
                <label><span>b₂₂</span><input type="range" min="-3" max="3" step="0.1" data-s1-b="3"><output data-s1-bv="3"></output></label>
              </div>
              <label class="ch5-slider-row wide"><span>测试方向 θ</span><input type="range" min="0" max="6.283" step="0.01" value="0.7" data-s1-theta><output data-s1-theta-value>0.70</output></label>
              <div class="ch5-stage"><canvas data-s1-sym-canvas aria-label="对称部分的等高线"></canvas></div>
            </div>
            <div class="ch5-panel">
              <div class="ch5-three-matrices"><div><strong>B</strong><div data-s1-b-mat></div></div><span>=</span><div><strong>S</strong><div data-s1-s-mat></div></div><span>+</span><div><strong>K</strong><div data-s1-k-mat></div></div></div>
              <div class="ch5-readout ch5-equality-ledger">
                <div><span>xᵀBx</span><strong data-s1-qb></strong></div>
                <div><span>xᵀSx</span><strong data-s1-qs></strong></div>
                <div><span>xᵀKx</span><strong data-s1-qk></strong></div>
                <p data-s1-sym-verdict></p>
              </div>
            </div>
          </div>
        </section>

        <section data-s1-pane="cong" hidden>
          <div class="ch5-lab-grid">
            <div class="ch5-panel">
              <div class="ch5-readout"><strong>固定 A（来自工作台①）</strong><div data-s1-cong-a></div></div>
              <div class="ch5-toolbar">
                <button type="button" class="is-active" data-s1-c-preset="id">单位</button>
                <button type="button" data-s1-c-preset="shear">剪切</button>
                <button type="button" data-s1-c-preset="scale">非等比缩放</button>
                <button type="button" data-s1-c-preset="rotate">旋转</button>
                <button type="button" data-s1-c-preset="singular">奇异压缩</button>
              </div>
              <div class="ch5-sliders compact-four">
                <label><span>c₁₁</span><input type="range" min="-2" max="2" step="0.05" data-s1-c="0"><output data-s1-cv="0"></output></label>
                <label><span>c₁₂</span><input type="range" min="-2" max="2" step="0.05" data-s1-c="1"><output data-s1-cv="1"></output></label>
                <label><span>c₂₁</span><input type="range" min="-2" max="2" step="0.05" data-s1-c="2"><output data-s1-cv="2"></output></label>
                <label><span>c₂₂</span><input type="range" min="-2" max="2" step="0.05" data-s1-c="3"><output data-s1-cv="3"></output></label>
              </div>
              <label class="ch5-slider-row wide"><span>测试 y 的方向</span><input type="range" min="0" max="6.283" step="0.01" value="0.5" data-s1-ytheta><output data-s1-ytheta-value>0.50</output></label>
              <div class="ch5-readout"><strong>替换矩阵 C</strong><div data-s1-cong-c></div><p>det C = <b data-s1-detc></b></p></div>
            </div>
            <div class="ch5-panel">
              <div class="ch5-readout"><strong>B=CᵀAC</strong><div data-s1-cong-b></div></div>
              <div class="ch5-gate-grid">
                <div data-s1-identity-gate><span>代数恒等式</span><strong></strong><p></p></div>
                <div data-s1-coordinate-gate><span>坐标 / 合同闸门</span><strong></strong><p></p></div>
              </div>
              <div class="ch5-compare-canvases"><div><canvas data-s1-cong-canvas-a></canvas><small>A：x 坐标</small></div><div><canvas data-s1-cong-canvas-b></canvas><small>B：y 坐标</small></div></div>
              <div data-s1-rank-compare></div>
            </div>
          </div>
        </section>
      </div>`;

    const life = makeController(root);
    const state = {
      mode: "coeff",
      a: 2,
      m: 4,
      c: 1,
      Braw: [
        [2, 3],
        [-1, 1],
      ],
      theta: 0.7,
      ytheta: 0.5,
      C: [
        [1, 0],
        [0, 1],
      ],
    };

    const coeffPresets = {
      diagonal: { a: 2, m: 0, c: 1 },
      cross: { a: 0, m: 4, c: 0 },
      bowl: { a: 2, m: 1.8, c: 1.4 },
      saddle: { a: 1, m: 2.4, c: -1 },
    };
    const bPresets = {
      asym: [
        [2, 3],
        [-1, 1],
      ],
      upper: [
        [1, 4],
        [0, 2],
      ],
      skew: [
        [0, 2],
        [-2, 0],
      ],
      sym: [
        [2, 1],
        [1, -1],
      ],
    };
    const cPresets = {
      id: [
        [1, 0],
        [0, 1],
      ],
      shear: [
        [1, 0.9],
        [0, 1],
      ],
      scale: [
        [1.6, 0],
        [0, 0.55],
      ],
      rotate: [
        [0.707, -0.707],
        [0.707, 0.707],
      ],
      singular: [
        [1, 2],
        [0.5, 1],
      ],
    };

    const coeffMatrix = () => M().mat2FromAbc(state.a, state.m / 2, state.c);

    function paintCoeff() {
      const A = coeffMatrix();
      ["a", "m", "c"].forEach((key) => {
        q(root, `[data-s1-coeff="${key}"]`).value = String(state[key]);
        q(root, `[data-s1-value="${key}"]`).textContent = M().formatNum(state[key], 2);
      });
      q(root, "[data-s1-poly]").innerHTML = `${tex(`f=${M().polyTex2(A)}`)}<small>这里 m=${M().formatNum(state.m, 2)}，矩阵非对角元是 m/2。</small>`;
      q(root, "[data-s1-matrix]").innerHTML = M().matrixHtml(A, { highlight: { i: 0, j: 1, twin: true } });
      q(root, "[data-s1-cross-total]").textContent = `交叉项系数 m = ${M().formatNum(state.m, 2)}`;
      q(root, "[data-s1-cross-left]").textContent = `a₁₂=${M().formatNum(state.m / 2, 2)}`;
      q(root, "[data-s1-cross-right]").textContent = `a₂₁=${M().formatNum(state.m / 2, 2)}`;
      const inn = M().inertiaSymmetric(A);
      q(root, "[data-s1-coeff-inertia]").innerHTML = inertiaHtml(inn);
      const samples = [
        [1, 0],
        [0, 1],
        [1, 1],
      ];
      q(root, "[data-s1-direction-check]").innerHTML = samples
        .map((x) => `<div class="ch5-check-row"><span>x=(${x.join(",")})</span><strong>${M().formatNum(M().qForm(A, x), 3)}</strong></div>`)
        .join("");
      M().drawContours(q(root, "[data-s1-coeff-canvas]"), A, { caption: "同一个矩阵同时决定方向值和等高线" });
    }

    function paintSym() {
      const B = M().cloneMat(state.Braw);
      const S = M().symmetrize(B);
      const K = [
        [B[0][0] - S[0][0], B[0][1] - S[0][1]],
        [B[1][0] - S[1][0], B[1][1] - S[1][1]],
      ];
      const x = [Math.cos(state.theta), Math.sin(state.theta)];
      const qb = M().qForm(B, x);
      const qs = M().qForm(S, x);
      const qk = M().qForm(K, x);
      const flat = [B[0][0], B[0][1], B[1][0], B[1][1]];
      flat.forEach((value, index) => {
        q(root, `[data-s1-b="${index}"]`).value = String(value);
        q(root, `[data-s1-bv="${index}"]`).textContent = M().formatNum(value, 2);
      });
      q(root, "[data-s1-theta]").value = String(state.theta);
      q(root, "[data-s1-theta-value]").textContent = M().formatNum(state.theta, 2);
      q(root, "[data-s1-b-mat]").innerHTML = M().matrixHtml(B);
      q(root, "[data-s1-s-mat]").innerHTML = M().matrixHtml(S);
      q(root, "[data-s1-k-mat]").innerHTML = M().matrixHtml(K);
      q(root, "[data-s1-qb]").textContent = M().formatNum(qb, 5);
      q(root, "[data-s1-qs]").textContent = M().formatNum(qs, 5);
      q(root, "[data-s1-qk]").textContent = M().formatNum(qk, 5);
      const ok = Math.abs(qb - qs) < 1e-7 && Math.abs(qk) < 1e-7;
      q(root, "[data-s1-sym-verdict]").innerHTML = ok
        ? `${status("验证通过", "is-ok")} B 与 S 给出同一个二次型，K 对当前方向和所有方向都贡献 0。`
        : `${status("数值异常", "is-bad")} 请检查对称化计算。`;
      M().drawContours(q(root, "[data-s1-sym-canvas]"), S, { caption: "B 的二次型图像完全由对称部分 S 决定" });
    }

    function paintCong() {
      const A = coeffMatrix();
      const C = state.C;
      const B = M().symmetrize(M().congruence(A, C));
      const detC = M().det2(C);
      const invertible = Math.abs(detC) > 1e-7;
      const y = [Math.cos(state.ytheta), Math.sin(state.ytheta)];
      const x = M().matVec(C, y);
      const left = M().qForm(A, x);
      const right = M().qForm(B, y);
      const identityOk = Math.abs(left - right) < 1e-7;
      q(root, "[data-s1-ytheta]").value = String(state.ytheta);
      q(root, "[data-s1-ytheta-value]").textContent = M().formatNum(state.ytheta, 2);
      q(root, "[data-s1-cong-a]").innerHTML = M().matrixHtml(A);
      q(root, "[data-s1-cong-b]").innerHTML = M().matrixHtml(B);
      q(root, "[data-s1-cong-c]").innerHTML = M().matrixHtml(C);
      q(root, "[data-s1-detc]").textContent = M().formatNum(detC, 4);
      const flat = [C[0][0], C[0][1], C[1][0], C[1][1]];
      flat.forEach((value, index) => {
        q(root, `[data-s1-c="${index}"]`).value = String(value);
        q(root, `[data-s1-cv="${index}"]`).textContent = M().formatNum(value, 2);
      });
      const identityGate = q(root, "[data-s1-identity-gate]");
      identityGate.className = `ch5-gate ${identityOk ? "is-open" : "is-closed"}`;
      q(identityGate, "strong").textContent = identityOk ? "恒成立" : "异常";
      q(identityGate, "p").textContent = `xᵀAx=${M().formatNum(left, 4)}，yᵀBy=${M().formatNum(right, 4)}。这一步不要求 C 可逆。`;
      const coordinateGate = q(root, "[data-s1-coordinate-gate]");
      coordinateGate.className = `ch5-gate ${invertible ? "is-open" : "is-closed"}`;
      q(coordinateGate, "strong").textContent = invertible ? "合同有效" : "合同失效";
      q(coordinateGate, "p").textContent = invertible
        ? "det C≠0，新旧变量可互相恢复；A 与 B 是同一二次型的两套坐标表达。"
        : "det C=0，平面被压到低维；恒等式仍对，但不能称为非退化换元或合同。";
      const innA = M().inertiaSymmetric(A);
      const innB = M().inertiaSymmetric(B);
      q(root, "[data-s1-rank-compare]").innerHTML = `<div class="ch5-compare"><div class="ch5-compare-card"><strong>A</strong>${inertiaHtml(innA)}</div><div class="ch5-compare-card"><strong>B</strong>${inertiaHtml(innB)}</div></div>`;
      M().drawContours(q(root, "[data-s1-cong-canvas-a]"), A, { caption: "A：x 坐标" });
      M().drawContours(q(root, "[data-s1-cong-canvas-b]"), B, { caption: invertible ? "B：y 坐标" : "B：奇异代入后的低维表达" });
    }

    function paint() {
      qa(root, "[data-s1-pane]").forEach((pane) => (pane.hidden = pane.dataset.s1Pane !== state.mode));
      paintCoeff();
      paintSym();
      paintCong();
    }

    qa(root, "[data-s1-mode]").forEach((button) => life.on(button, "click", () => {
      state.mode = button.dataset.s1Mode;
      setActive(root, "[data-s1-mode]", button);
      paint();
    }));
    qa(root, "[data-s1-coeff]").forEach((input) => life.on(input, "input", () => {
      state[input.dataset.s1Coeff] = Number(input.value);
      paint();
    }));
    qa(root, "[data-s1-coeff-preset]").forEach((button) => life.on(button, "click", () => {
      Object.assign(state, coeffPresets[button.dataset.s1CoeffPreset]);
      paint();
    }));
    qa(root, "[data-s1-b-preset]").forEach((button) => life.on(button, "click", () => {
      state.Braw = M().cloneMat(bPresets[button.dataset.s1BPreset]);
      paint();
    }));
    qa(root, "[data-s1-b]").forEach((input) => life.on(input, "input", () => {
      const flat = [state.Braw[0][0], state.Braw[0][1], state.Braw[1][0], state.Braw[1][1]];
      flat[Number(input.dataset.s1B)] = Number(input.value);
      state.Braw = [
        [flat[0], flat[1]],
        [flat[2], flat[3]],
      ];
      paint();
    }));
    life.on(q(root, "[data-s1-theta]"), "input", (event) => {
      state.theta = Number(event.target.value);
      paint();
    });
    qa(root, "[data-s1-c-preset]").forEach((button) => life.on(button, "click", () => {
      state.C = M().cloneMat(cPresets[button.dataset.s1CPreset]);
      setActive(root, "[data-s1-c-preset]", button);
      paint();
    }));
    qa(root, "[data-s1-c]").forEach((input) => life.on(input, "input", () => {
      const flat = [state.C[0][0], state.C[0][1], state.C[1][0], state.C[1][1]];
      flat[Number(input.dataset.s1C)] = Number(input.value);
      state.C = [
        [flat[0], flat[1]],
        [flat[2], flat[3]],
      ];
      qa(root, "[data-s1-c-preset]").forEach((button) => button.classList.remove("is-active"));
      paint();
    }));
    life.on(q(root, "[data-s1-ytheta]"), "input", (event) => {
      state.ytheta = Number(event.target.value);
      paint();
    });
    life.resize(paint);
    paint();
    return () => life.cleanup();
  }

  window.defineChapter5Renderer("quadratic-matrix", { formal: renderFormal1, interactive: mountLab1 });
})();
