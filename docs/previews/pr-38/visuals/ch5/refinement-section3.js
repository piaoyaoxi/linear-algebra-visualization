/* Chapter 5 refined renderer, section 3. */
(() => {
  const { M, tex, display, q, qa, formalShell, moduleCard, status, makeController, setActive, eigenSystem2, spectrumHtml, inertiaHtml, drawContoursWithBasis, classificationNote } = window.Ch5Refine;
  /* ------------------------------------------------------------------ §3 */
  function renderFormal3(formal) {
    if (!formal) return;
    formal.innerHTML = formalShell(
      "系数会变，正负方向的维数不会变",
      "惯性定理不是一句需要死记的结论。它说：可逆换元可以旋转、剪切和缩放坐标，却不能把一个全正的二维区域改造成一正一负的马鞍结构。",
      [
        moduleCard(
          "1",
          "从标准形缩放到规范形",
          "丢掉大小，只保留符号",
          `${display("z_1^2+\\cdots+z_p^2-z_{p+1}^2-\\cdots-z_{p+q}^2")}
          <p class="ch5-muted">非零系数的绝对值可以通过缩放变量改变；正项数 p、负项数 q 和零项数才是结构标签。</p>`,
        ),
        moduleCard(
          "2",
          "维数解释",
          "p 与 q 为什么不可能改变",
          `<div class="ch5-two-gates"><div><strong>p</strong><p>二次型能在某个子空间上恒正的最大维数。</p></div><div><strong>q</strong><p>二次型能在某个子空间上恒负的最大维数。</p></div></div><p class="ch5-muted">可逆映射保持子空间维数，因此这两个最大值被锁定。</p>`,
        ),
        moduleCard(
          "3",
          "合同不保存特征值大小",
          "只保存正、负、零的个数",
          `${display("A\\sim_c B\\quad\\Longrightarrow\\quad (p_A,q_A,0_A)=(p_B,q_B,0_B)")}
          <p class="ch5-muted">例如 diag(1,−1) 与 diag(100,−0.01) 合同；它们的特征值数值完全不同，但都是一正一负。</p>`,
        ),
        moduleCard(
          "4",
          "合同分类",
          "秩相同远远不够",
          `<p class="ch5-muted">同阶实对称矩阵 A、B 合同，当且仅当 (p,q) 相同。diag(1,1) 与 diag(1,−1) 都满秩，却分别是碗面和马鞍面。</p>`,
        ),
      ],
    );
  }

  function canonicalForInertia(inn, scale = 1) {
    const values = [];
    for (let i = 0; i < inn.p; i++) values.push((i + 1) * scale);
    for (let i = 0; i < inn.q; i++) values.push(-(i + 1) * scale);
    while (values.length < 2) values.push(0);
    return [
      [values[0], 0],
      [0, values[1]],
    ];
  }

  function candidateFor(A, kind) {
    const inn = M().inertiaSymmetric(A);
    if (kind === "same") return canonicalForInertia(inn, 2.3);
    if (kind === "rank-only") {
      if (inn.rank === 2 && inn.p === 2) return [
        [2, 0],
        [0, -1],
      ];
      if (inn.rank === 2) return [
        [2, 0],
        [0, 1],
      ];
      if (inn.rank === 1 && inn.p === 1) return [
        [-2, 0],
        [0, 0],
      ];
      return [
        [2, 0],
        [0, 0],
      ];
    }
    return [
      [0, 0],
      [0, 0],
    ];
  }

  function renderCandidateExplanation(A, B) {
    const ia = M().inertiaSymmetric(A);
    const ib = M().inertiaSymmetric(B);
    const same = ia.p === ib.p && ia.q === ib.q && ia.zero === ib.zero;
    return {
      same,
      html: `<div class="ch5-compare"><div class="ch5-compare-card"><strong>A 的惯性</strong>${inertiaHtml(ia)}</div><div class="ch5-compare-card"><strong>候选矩阵</strong>${inertiaHtml(ib)}</div></div><p>${same ? "(p,q,0) 完全相同，所以合同。" : "惯性不同，所以不合同；即使秩碰巧相同也不够。"}</p>`,
    };
  }

  function mountLab3(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch5-lab ch5-refined" data-ch5-section="3">
        <div class="ch5-lab-head"><h3>惯性锁与合同判定器</h3><p>左半区连续生成 B=CᵀAC；右半区把“同秩”与“同惯性”放在一起比较。重点看特征值数值和符号计数的分离。</p></div>
        <div class="ch5-toolbar">
          <button type="button" class="is-active" data-s3-a="indef">不定 A（1,1）</button>
          <button type="button" data-s3-a="pd">正定 A（2,0）</button>
          <button type="button" data-s3-a="psd">半正定 A（1,0）</button>
          <button type="button" data-s3-a="nd">负定 A（0,2）</button>
        </div>
        <div class="ch5-lab-grid">
          <div class="ch5-panel">
            <div class="ch5-readout"><strong>A 与它的特征值</strong><div data-s3-a-mat></div><div data-s3-a-spectrum></div><div data-s3-a-inertia></div></div>
            <div class="ch5-sliders">
              <label class="ch5-slider-row wide"><span>旋转 θ</span><input type="range" min="0" max="6.283" step="0.02" value="0.4" data-s3-param="theta"><output data-s3-value="theta"></output></label>
              <label class="ch5-slider-row wide"><span>x 缩放</span><input type="range" min="0.3" max="2.5" step="0.05" value="1.4" data-s3-param="sx"><output data-s3-value="sx"></output></label>
              <label class="ch5-slider-row wide"><span>y 缩放</span><input type="range" min="0.3" max="2.5" step="0.05" value="0.8" data-s3-param="sy"><output data-s3-value="sy"></output></label>
              <label class="ch5-slider-row wide"><span>剪切 h</span><input type="range" min="-1.5" max="1.5" step="0.05" value="0.6" data-s3-param="shear"><output data-s3-value="shear"></output></label>
              <label class="ch5-slider-row wide"><span>ε（奇异闸门）</span><input type="range" min="0" max="1" step="0.01" value="1" data-s3-param="eps"><output data-s3-value="eps"></output></label>
            </div>
            <div class="ch5-readout"><strong>C</strong><div data-s3-c-mat></div><p>det C=<b data-s3-detc></b></p></div>
          </div>
          <div class="ch5-panel">
            <div class="ch5-readout"><strong>B=CᵀAC 与它的特征值</strong><div data-s3-b-mat></div><div data-s3-b-spectrum></div><div data-s3-b-inertia></div></div>
            <div class="ch5-gate" data-s3-lock><span>惯性锁</span><strong data-lock-status></strong><p data-s3-lock-note></p></div>
            <div class="ch5-compare-canvases"><div><canvas data-s3-canvas-a></canvas><small>A</small></div><div><canvas data-s3-canvas-b></canvas><small>B</small></div></div>
          </div>
        </div>
        <section class="ch5-contract-tester">
          <div><h4>合同判定器</h4><p>不必真的求 C。对同阶实对称矩阵，直接比较惯性就是完整判据。</p></div>
          <div class="ch5-toolbar">
            <button type="button" class="is-active" data-s3-candidate="same">同惯性</button>
            <button type="button" data-s3-candidate="rank-only">同秩异惯性</button>
            <button type="button" data-s3-candidate="zero">秩不同</button>
          </div>
          <div class="ch5-lab-grid"><div class="ch5-readout"><strong>候选矩阵 D</strong><div data-s3-candidate-mat></div></div><div class="ch5-readout" data-s3-candidate-result><strong data-candidate-verdict></strong><div data-s3-candidate-detail></div></div></div>
        </section>
      </div>`;

    const life = makeController(root);
    const presets = {
      indef: [
        [1, 0.35],
        [0.35, -1.2],
      ],
      pd: [
        [2, 0.45],
        [0.45, 1.1],
      ],
      psd: [
        [1, 1],
        [1, 1],
      ],
      nd: [
        [-1.6, 0.2],
        [0.2, -0.8],
      ],
    };
    const state = {
      A: M().cloneMat(presets.indef),
      theta: 0.4,
      sx: 1.4,
      sy: 0.8,
      shear: 0.6,
      eps: 1,
      candidate: "same",
    };

    function buildC() {
      const ct = Math.cos(state.theta);
      const st = Math.sin(state.theta);
      const H = [
        [state.sx, state.shear],
        [0, state.sy * state.eps],
      ];
      const R = [
        [ct, -st],
        [st, ct],
      ];
      return M().matMul(R, H);
    }

    function paint() {
      ["theta", "sx", "sy", "shear", "eps"].forEach((key) => {
        q(root, `[data-s3-param="${key}"]`).value = String(state[key]);
        q(root, `[data-s3-value="${key}"]`).textContent = M().formatNum(state[key], 2);
      });
      const A = state.A;
      const C = buildC();
      const detC = M().det2(C);
      const invertible = Math.abs(detC) > 1e-7;
      const B = M().symmetrize(M().congruence(A, C));
      const ia = M().inertiaSymmetric(A);
      const ib = M().inertiaSymmetric(B);
      q(root, "[data-s3-a-mat]").innerHTML = M().matrixHtml(A);
      q(root, "[data-s3-b-mat]").innerHTML = M().matrixHtml(B);
      q(root, "[data-s3-c-mat]").innerHTML = M().matrixHtml(C);
      q(root, "[data-s3-detc]").textContent = M().formatNum(detC, 4);
      q(root, "[data-s3-a-spectrum]").innerHTML = spectrumHtml(ia.eigenvalues, "A 的特征值");
      q(root, "[data-s3-b-spectrum]").innerHTML = spectrumHtml(ib.eigenvalues, "B 的特征值");
      q(root, "[data-s3-a-inertia]").innerHTML = inertiaHtml(ia);
      q(root, "[data-s3-b-inertia]").innerHTML = inertiaHtml(ib);
      const locked = ia.p === ib.p && ia.q === ib.q && ia.zero === ib.zero;
      const gate = q(root, "[data-s3-lock]");
      gate.className = `ch5-gate ${invertible && locked ? "is-open" : "is-closed"}`;
      q(root, "[data-lock-status]").textContent = invertible ? (locked ? "锁定" : "数值异常") : "合同停止";
      q(root, "[data-s3-lock-note]").textContent = invertible
        ? "特征值的大小已经变化，但正、负、零的数量与 A 完全相同。"
        : "ε=0 使 C 奇异，B 的秩与惯性可以下降；这不是“合同改变惯性”，因为合同前提已经失效。";
      M().drawContours(q(root, "[data-s3-canvas-a]"), A, { caption: "A 的等高线" });
      M().drawContours(q(root, "[data-s3-canvas-b]"), B, { caption: invertible ? "B：形状可拉伸，惯性锁定" : "B：奇异代入后的退化图像" });

      const candidate = candidateFor(A, state.candidate);
      const result = renderCandidateExplanation(A, candidate);
      q(root, "[data-s3-candidate-mat]").innerHTML = M().matrixHtml(candidate);
      q(root, "[data-candidate-verdict]").innerHTML = result.same ? status("合同", "is-ok") : status("不合同", "is-bad");
      q(root, "[data-s3-candidate-detail]").innerHTML = result.html;
    }

    qa(root, "[data-s3-a]").forEach((button) => life.on(button, "click", () => {
      state.A = M().cloneMat(presets[button.dataset.s3A]);
      state.candidate = "same";
      setActive(root, "[data-s3-a]", button);
      setActive(root, "[data-s3-candidate]", q(root, '[data-s3-candidate="same"]'));
      paint();
    }));
    qa(root, "[data-s3-param]").forEach((input) => life.on(input, "input", () => {
      state[input.dataset.s3Param] = Number(input.value);
      paint();
    }));
    qa(root, "[data-s3-candidate]").forEach((button) => life.on(button, "click", () => {
      state.candidate = button.dataset.s3Candidate;
      setActive(root, "[data-s3-candidate]", button);
      paint();
    }));
    life.resize(paint);
    paint();
    return () => life.cleanup();
  }

  window.defineChapter5Renderer("quadratic-uniqueness", { formal: renderFormal3, interactive: mountLab3 });
})();
