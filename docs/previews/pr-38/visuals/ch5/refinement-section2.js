/* Chapter 5 refined renderer, section 2. */
(() => {
  const { M, tex, display, q, qa, formalShell, moduleCard, status, makeController, setActive, eigenSystem2, spectrumHtml, inertiaHtml, drawContoursWithBasis, classificationNote } = window.Ch5Refine;
  /* ------------------------------------------------------------------ §2 */
  function renderFormal2(formal) {
    if (!formal) return;
    formal.innerHTML = formalShell(
      "消去交叉项：不是改形状，而是换坐标",
      "标准形把二次型写成平方项之和。配方法给出一般可逆替换；正交对角化把坐标轴旋到主轴方向。两条路都能消去交叉项，但保留的几何结构与得到的系数并不完全相同。",
      [
        moduleCard(
          "1",
          "标准形允许零项",
          "非零项数量就是秩",
          `${display("f=d_1y_1^2+\\cdots+d_ny_n^2")}
          <p class="ch5-muted">若秩为 r，恰有 r 个非零系数。零项不是遗漏，而是二次型在某些方向上完全没有二次变化。</p>`,
        ),
        moduleCard(
          "2",
          "Lagrange 配方法",
          "一个主平方项吸收一组交叉项",
          `${display("ax_1^2+2bx_1x_2+cx_2^2=a\\left(x_1+\\frac ba x_2\\right)^2+\\left(c-\\frac{b^2}{a}\\right)x_2^2")}
          <p class="ch5-muted">若 a=0 而 b≠0，先用和差替换制造平方项；不能硬除以 a。</p>`,
        ),
        moduleCard(
          "3",
          "矩阵语言：成对行列操作",
          "普通行消元不是合同消元",
          `<p class="ch5-muted">每次初等变换都要同时作用于行和对应列，才能保持对称，并可写成 ${tex("E^TAE")}。只做行变换会改变问题类型。</p>`,
        ),
        moduleCard(
          "4",
          "正交主轴法",
          "旋转坐标轴，系数成为特征值",
          `${display("A=Q\\Lambda Q^T,\\qquad Q^TAQ=\\Lambda")}
          <p class="ch5-muted">正交 Q 保持长度与角度；一般配方法得到的 C 通常不是正交矩阵。不要把两种对角化混成一个步骤。</p>`,
        ),
      ],
    );
  }

  function mountLab2(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch5-lab ch5-refined" data-ch5-section="2">
        <div class="ch5-lab-head"><h3>同一形状，两套坐标</h3><p>原二次型始终固定在左边。右边显示新变量中的矩阵。重点观察：交叉项消失时，几何对象没有被“修理”，只是坐标方向换了。</p></div>
        <div class="ch5-toolbar ch5-mode-tabs">
          <button type="button" class="is-active" data-s2-method="square">Lagrange 配方法</button>
          <button type="button" data-s2-method="orthogonal">正交主轴</button>
        </div>
        <div class="ch5-toolbar">
          <button type="button" data-s2-preset="ellipse">倾斜椭圆</button>
          <button type="button" data-s2-preset="saddle">倾斜马鞍</button>
          <button type="button" data-s2-preset="cross">纯交叉项</button>
          <button type="button" data-s2-preset="rank1">秩 1 山谷</button>
          <button type="button" data-s2-preset="diagonal">已经标准</button>
        </div>
        <div class="ch5-sliders ch5-coeff-row">
          <label><span>a</span><input type="range" min="-3" max="3" step="0.1" data-s2-coeff="a"><output data-s2-value="a"></output></label>
          <label><span>b（矩阵位）</span><input type="range" min="-2.5" max="2.5" step="0.1" data-s2-coeff="b"><output data-s2-value="b"></output></label>
          <label><span>c</span><input type="range" min="-3" max="3" step="0.1" data-s2-coeff="c"><output data-s2-value="c"></output></label>
        </div>
        <div class="ch5-coordinate-compare">
          <div class="ch5-coordinate-stage"><div class="ch5-stage"><canvas data-s2-original></canvas></div><div class="ch5-stage-caption"><strong>原坐标 x</strong><span data-s2-original-poly></span></div></div>
          <div class="ch5-coordinate-arrow" aria-hidden="true">x = C y<br><span>→</span></div>
          <div class="ch5-coordinate-stage"><div class="ch5-stage"><canvas data-s2-transformed></canvas></div><div class="ch5-stage-caption"><strong>新坐标 y</strong><span data-s2-new-poly></span></div></div>
        </div>
        <div class="ch5-lab-grid">
          <div class="ch5-panel">
            <div class="ch5-stepper-head"><button type="button" data-s2-step="prev">上一步</button><strong data-s2-step-label></strong><button type="button" data-s2-step="next">下一步</button><button type="button" data-s2-step="reset">重置</button></div>
            <div data-s2-steps class="ch5-steps"></div>
          </div>
          <div class="ch5-panel">
            <div class="ch5-readout"><strong>当前 C 与 D=CᵀAC</strong><div class="ch5-two-matrices"><div><span>C</span><div data-s2-c></div></div><div><span>D</span><div data-s2-d></div></div></div></div>
            <div class="ch5-gate-grid">
              <div class="ch5-gate" data-s2-invertible><span>可逆闸门</span><strong></strong><p></p></div>
              <div class="ch5-gate" data-s2-diagonal><span>交叉项闸门</span><strong></strong><p></p></div>
            </div>
            <div class="ch5-readout"><strong>方法说明</strong><p data-s2-method-note class="ch5-muted"></p><div data-s2-spectrum></div></div>
          </div>
        </div>
      </div>`;

    const life = makeController(root);
    const state = { a: 1, b: 0.9, c: 2, method: "square", step: 0 };
    const presets = {
      ellipse: { a: 1, b: 0.9, c: 2 },
      saddle: { a: 1, b: 0.6, c: -1.3 },
      cross: { a: 0, b: 1, c: 0 },
      rank1: { a: 1, b: 1, c: 1 },
      diagonal: { a: 2, b: 0, c: -1 },
    };
    const A = () => M().mat2FromAbc(state.a, state.b, state.c);

    function methodPack() {
      const mat = A();
      if (state.method === "orthogonal") {
        const eig = eigenSystem2(mat);
        return {
          C: eig.Q,
          D: eig.D,
          standard: [eig.D[0][0], eig.D[1][1]],
          steps: [
            { title: "识别主轴", poly: M().polyPlain2(mat), note: `对称矩阵的主轴角 θ=${M().formatNum(eig.theta, 3)} rad。`, matrix: mat, C: M().identity(2), kind: "start" },
            { title: "组装正交矩阵", poly: "Q 的列是两个单位特征向量", note: "QᵀQ=I，坐标只旋转或反射，不拉伸。", matrix: mat, C: eig.Q, kind: "sub" },
            { title: "主轴坐标", poly: M().polyPlain2(eig.D), note: "QᵀAQ 已对角化，两个系数就是特征值。", matrix: eig.D, C: eig.Q, kind: "check" },
          ],
          note: "正交主轴法保留长度和角度；对角系数是 A 的特征值。",
          spectrum: [eig.lambda1, eig.lambda2],
        };
      }
      const pack = M().completeSquareSteps2(mat);
      return {
        ...pack,
        note: pack.method === "sumdiff" ? "当前没有可直接使用的主平方项，因此先做和差替换。" : "配方法通过一般可逆 C 消去交叉项；C 通常不是正交矩阵。",
        spectrum: M().eigenvalues2(mat),
      };
    }

    function paint() {
      const mat = A();
      ["a", "b", "c"].forEach((key) => {
        q(root, `[data-s2-coeff="${key}"]`).value = String(state[key]);
        q(root, `[data-s2-value="${key}"]`).textContent = M().formatNum(state[key], 2);
      });
      const pack = methodPack();
      const steps = pack.steps || [];
      state.step = M().clamp(state.step, 0, Math.max(0, steps.length - 1));
      const current = steps[state.step] || { title: "起点", poly: M().polyPlain2(mat), note: "", C: M().identity(2), matrix: mat };
      const C = current.C || (state.step === steps.length - 1 ? pack.C : M().identity(2));
      const D = current.matrix || mat;
      q(root, "[data-s2-step-label]").textContent = `步骤 ${state.step + 1} / ${steps.length}`;
      q(root, "[data-s2-steps]").innerHTML = steps
        .map((step, index) => `<article class="ch5-step${index === state.step ? " is-active" : index < state.step ? " is-done" : ""}"><h4>${index + 1}. ${step.title}</h4><p class="ch5-step-poly">${step.poly}</p><p>${step.note}</p></article>`)
        .join("");
      q(root, "[data-s2-c]").innerHTML = M().matrixHtml(C);
      q(root, "[data-s2-d]").innerHTML = M().matrixHtml(D);
      q(root, "[data-s2-original-poly]").innerHTML = tex(`f=${M().polyTex2(mat)}`);
      q(root, "[data-s2-new-poly]").innerHTML = tex(`g=${M().polyTex2(D)}`);
      const detC = M().det2(C);
      const off = Math.abs(D[0][1]);
      const invGate = q(root, "[data-s2-invertible]");
      invGate.className = `ch5-gate ${Math.abs(detC) > 1e-7 ? "is-open" : "is-closed"}`;
      q(invGate, "strong").textContent = Math.abs(detC) > 1e-7 ? "通过" : "失败";
      q(invGate, "p").textContent = `det C=${M().formatNum(detC, 4)}。`;
      const diagGate = q(root, "[data-s2-diagonal]");
      diagGate.className = `ch5-gate ${off < 1e-7 ? "is-open" : "is-waiting"}`;
      q(diagGate, "strong").textContent = off < 1e-7 ? "交叉项已消失" : "尚未完成";
      q(diagGate, "p").textContent = `|D₁₂|=${M().formatNum(off, 6)}。`;
      q(root, "[data-s2-method-note]").textContent = pack.note;
      q(root, "[data-s2-spectrum]").innerHTML = spectrumHtml(pack.spectrum, "原矩阵特征值");
      drawContoursWithBasis(q(root, "[data-s2-original]"), mat, C, state.step ? "原对象与新基向量 Ce₁、Ce₂" : "原对象：交叉项反映坐标轴未对齐");
      M().drawContours(q(root, "[data-s2-transformed]"), D, { caption: off < 1e-7 ? "新坐标：等高线与坐标轴对齐" : "中间步骤：尚有交叉项" });
    }

    qa(root, "[data-s2-method]").forEach((button) => life.on(button, "click", () => {
      state.method = button.dataset.s2Method;
      state.step = 0;
      setActive(root, "[data-s2-method]", button);
      paint();
    }));
    qa(root, "[data-s2-preset]").forEach((button) => life.on(button, "click", () => {
      Object.assign(state, presets[button.dataset.s2Preset], { step: 0 });
      paint();
    }));
    qa(root, "[data-s2-coeff]").forEach((input) => life.on(input, "input", () => {
      state[input.dataset.s2Coeff] = Number(input.value);
      state.step = 0;
      paint();
    }));
    qa(root, "[data-s2-step]").forEach((button) => life.on(button, "click", () => {
      const max = Math.max(0, methodPack().steps.length - 1);
      if (button.dataset.s2Step === "next") state.step = Math.min(max, state.step + 1);
      if (button.dataset.s2Step === "prev") state.step = Math.max(0, state.step - 1);
      if (button.dataset.s2Step === "reset") state.step = 0;
      paint();
    }));
    life.resize(paint);
    paint();
    return () => life.cleanup();
  }

  window.defineChapter5Renderer("quadratic-standard-form", { formal: renderFormal2, interactive: mountLab2 });
})();
