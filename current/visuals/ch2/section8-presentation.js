(() => {
  const { M, tex, display, formalShell, module, proofSteps, misconception } = window.Ch2PresentationUtils;

  function matrixTex(matrix) {
    return tex(`\\begin{bmatrix}${matrix.map((row) => row.map((value) => M().formatNum(value, 3)).join("&")).join("\\\\")}\\end{bmatrix}`);
  }

  /*
   * Worked example (static): fix rows 1, 2 of a 4×4 matrix; the six column pairs
   * give six signed products of a minor and its complementary minor. Sum = det = 6.
   */
  function laplaceExample() {
    const matrix = [[1, 2, 0, 1], [0, 1, 1, 0], [2, 0, 1, 1], [1, 1, 0, 2]];
    const rows = [0, 1];
    const pairs = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
    const num = (v) => (v < 0 ? `−${-v}` : String(v));
    const terms = pairs.map((cols) => {
      const compCols = M().complementIndices(4, cols);
      const minor = M().determinant(M().submatrix(matrix, rows, cols));
      const comp = M().determinant(M().submatrix(matrix, M().complementIndices(4, rows), compCols));
      const exponent = 1 + 2 + cols[0] + 1 + cols[1] + 1;
      const sign = exponent % 2 === 0 ? 1 : -1;
      return { cols, compCols, minor: Math.round(minor), comp: Math.round(comp), sign, term: Math.round(sign * minor * comp) };
    });
    const total = terms.reduce((sum, t) => sum + t.term, 0);
    const det = Math.round(M().determinant(matrix));
    const matrixTexStr = `A=\\begin{pmatrix}${matrix.map((r) => r.join("&")).join("\\\\")}\\end{pmatrix}`;
    return `<article class="ch2-def ch2-laplace-example">
      <span class="kicker">例：固定第 1、2 行</span>
      <div class="ch2-laplace-example-body">
        <div class="ch2-laplace-example-matrix">${display(matrixTexStr)}</div>
        <div class="ch2-table-wrap"><table class="ch2-laplace-terms">
          <thead><tr><th>所选列 ${tex("J")}</th><th>子式</th><th>符号</th><th>互补子式</th><th>本项</th></tr></thead>
          <tbody>${terms.map((t) => `<tr data-pair-row><td>${t.cols.map((c) => c + 1).join(", ")}</td><td>${num(t.minor)}</td><td>${tex(`(-1)^{3+${t.cols[0] + 1}+${t.cols[1] + 1}}=${t.sign > 0 ? "+1" : "-1"}`)}</td><td>${num(t.comp)}</td><td><b>${num(t.term)}</b></td></tr>`).join("")}</tbody>
          <tfoot><tr><td colspan="4">六项之和</td><td><b data-pair-sum>${num(total)}</b></td></tr></tfoot>
        </table></div>
      </div>
      <p>${tex(`\\binom42=6`)} 种取列方式，六项之和 ${num(total)} 正好等于 ${tex("\\det A=")} <b data-pair-det>${num(det)}</b>。${tex("k=1")} 时每个子式只是一个元素，展开就回到 §6 的按一行展开。</p>
    </article>`;
  }

  /*
   * Product rule lab: the unit square goes E → B → AB.
   * Area tiles: 1 tile → |det B| tiles → |det B| columns of |det A| tiles,
   * so “each tile of B's image is multiplied by det A” is visible as a grid.
   * Mid-animation the live value is the current signed area; det(AB) appears at the end.
   */
  function mountProduct(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const presets = {
      scale: { A: [[2, 0], [0, 1]], B: [[1, 0], [0, 3]] },
      shearScale: { A: [[2, 0], [0, 1]], B: [[1, 1], [0, 1]] },
      mirrorRotate: { A: [[0, -1], [1, 0]], B: [[-1, 0], [0, 1]] },
      doubleMirror: { A: [[-1, 0], [0, 1]], B: [[1, 0], [0, -1]] },
      project: { A: [[2, 0], [0, 1]], B: [[1, 0], [0, 0]] },
    };
    const I = [[1, 0], [0, 1]];
    const cI = root.querySelector("[data-c-i]");
    const cB = root.querySelector("[data-c-b]");
    const cAB = root.querySelector("[data-c-ab]");
    const replay = root.querySelector("[data-prod-replay]");
    const status = root.querySelector("[data-rule-status]");
    const tiles = root.querySelector("[data-prod-tiles]");
    const liveLabel = root.querySelector("[data-dab-label]");
    const n = (v) => M().formatNum(v, 3);
    let current = presets.scale;
    let busy = false;
    let run = 0;
    let finished = false;

    const gate = window.LAPredictGate?.mount(root.querySelector("[data-prod-gate]"), {
      root: root.querySelector("[data-prod-lab]"),
      manual: true,
      key: "visuals/ch2/section8-presentation.js#product",
      question: `${tex("\\det A=2")}，${tex("\\det B=3")}。单位正方形先经过 ${tex("B")}，再经过 ${tex("A")}，最后的有向面积是多少？`,
      options: [
        ["6", true, ""],
        ["5", false, "两步的倍率不相加：经过 B 后面积是 3，A 再把其中每一块放大 2 倍。"],
        ["2", false, "A 作用在 B 的结果上，B 已经把面积变成 3，不是从 1 重新开始。"],
        ["要看两个矩阵的具体形状才能定", false, "形状会变，面积倍率只取决于两个行列式。"],
      ],
      right: `✓ ${tex("B")} 把单位正方形变成面积 3 的图形，${tex("A")} 再把其中每一小块的面积都乘 2：${tex("\\det(AB)=\\det A\\cdot\\det B=6")}。符号同样相乘：翻转两次等于不翻转。`,
    });

    function setBusy(value) {
      busy = value;
      root.querySelectorAll("[data-prod-preset]").forEach((button) => { button.disabled = value; });
      if (gate?.picked || !gate) replay.disabled = value;
    }

    // tiles: stage 0 = the unit square, 1 = after B, 2 = after A
    function paintTiles(A, B, stage) {
      const dA = Math.round(M().det2(A));
      const dB = Math.round(M().det2(B));
      // the signed area is written on the block itself
      const group = (label, cols, rows, sign, cls, value) => {
        const cells = cols * rows;
        const tag = `<b class="ch2-tile-val">${value}</b>`;
        const body = cells === 0
          ? `<div class="ch2-tiles is-zero"><i>0</i></div>`
          : `<div class="ch2-tiles${sign < 0 ? " is-flipped" : ""}" style="--cols:${cols}">${Array.from({ length: cells }, (_, k) => `<i class="${cls}"></i>`).join("")}</div>`;
        return `<figure class="ch2-tile-group">${tag}${body}<figcaption>${label}</figcaption></figure>`;
      };
      const parts = [group(`单位正方形：1`, 1, 1, 1, "is-unit", "1")];
      if (stage >= 1) parts.push(`<b class="ch2-tile-op">${tex(`\\times${dB < 0 ? `(${n(dB)})` : n(dB)}`)}</b>`, group(`经过 ${tex("B")}：${n(dB)}`, Math.abs(dB), 1, Math.sign(dB), "is-b", tex(`\\det B=${n(dB)}`)));
      if (stage >= 2) parts.push(`<b class="ch2-tile-op">${tex(`\\times${dA < 0 ? `(${n(dA)})` : n(dA)}`)}</b>`, group(`再经过 ${tex("A")}：${n(dA * dB)}`, Math.abs(dB), Math.abs(dA), Math.sign(dA * dB), "is-ab", tex(`\\det(AB)=${n(dA * dB)}`)));
      tiles.innerHTML = parts.join("");
    }

    function showGivens(A, B) {
      root.querySelector("[data-da]").textContent = n(M().det2(A));
      root.querySelector("[data-db]").textContent = n(M().det2(B));
      // the product is the answer to the prediction; it appears with det(AB) at the end
      root.querySelector("[data-prod]").textContent = "?";
    }

    function idle(A, B) {
      run += 1;
      finished = false;
      [cI, cB, cAB].forEach((canvas) => M().cancelAnim(canvas));
      M().drawTransformScene(cI, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "单位正方形" });
      M().drawTransformScene(cB, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "等待作用 B" });
      M().drawTransformScene(cAB, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "等待作用 A" });
      showGivens(A, B);
      liveLabel.innerHTML = tex("\\det(AB)");
      root.querySelector("[data-dab]").textContent = "?";
      status.innerHTML = `按“播放”，看单位正方形依次经过 ${tex("B")} 和 ${tex("A")}。`;
      status.className = "";
      paintTiles(A, B, 0);
    }

    async function play(A, B) {
      if (busy) return;
      setBusy(true);
      const id = ++run;
      current = { A, B };
      const AB = M().mul2(A, B);
      const dA = M().det2(A);
      const dB = M().det2(B);
      const dab = root.querySelector("[data-dab]");
      try {
        idle(A, B);
        run = id;
        liveLabel.textContent = "当前有向面积（动画中）";
        dab.textContent = "1";
        status.innerHTML = `第一步：作用 ${tex("B")}。`;
        await M().animateMatrix(cB, B, {
          duration: 700,
          drawOptions: { firstLabel: "Be₁", secondLabel: "Be₂", caption: "第一步：E → B", ghost: I },
          onUpdate(m) { dab.textContent = `≈ ${M().formatNum(M().det2(m), 2)}`; },
        });
        if (id !== run) return;
        dab.textContent = n(dB);
        paintTiles(A, B, 1);
        M().drawTransformScene(cAB, B, { firstLabel: "Be₁", secondLabel: "Be₂", caption: "从 B 的结果出发" });
        status.innerHTML = `第二步：从 ${tex("B")} 的结果出发，再作用 ${tex("A")}。`;
        await new Promise((resolve) => setTimeout(resolve, M().reducedMotion() ? 0 : 360));
        if (id !== run) return;
        await M().animateMatrix(cAB, AB, {
          duration: 780,
          drawOptions: { firstLabel: "ABe₁", secondLabel: "ABe₂", caption: "第二步：B → AB", ghost: B },
          onUpdate(m) { dab.textContent = `≈ ${M().formatNum(M().det2(m), 2)}`; },
        });
        if (id !== run) return;
        // final, exact values only
        liveLabel.innerHTML = tex("\\det(AB)");
        dab.textContent = n(M().det2(AB));
        root.querySelector("[data-prod]").textContent = n(dA * dB);
        paintTiles(A, B, 2);
        const ok = Math.abs(M().det2(AB) - dA * dB) < 1e-9;
        const factor = (v) => (v < 0 ? `(${n(v)})` : n(v));
        status.innerHTML = ok ? `验证完成：${tex(`\\det(AB)=${n(M().det2(AB))}=${factor(dA)}\\times${factor(dB)}`)}` : "";
        status.className = ok ? "is-positive" : "";
        finished = true;
        gate?.acted();
      } finally {
        if (id === run) setBusy(false);
      }
    }

    root.querySelectorAll("[data-prod-preset]").forEach((button) => button.addEventListener("click", () => {
      if (busy) return;
      root.querySelectorAll("[data-prod-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      const preset = presets[button.dataset.prodPreset];
      current = preset;
      // before a prediction a preset only sets the matrices; playing waits for the prediction
      if (gate && !gate.picked) idle(preset.A, preset.B);
      else play(preset.A, preset.B);
    }, { signal }));
    replay.addEventListener("click", () => play(current.A, current.B), { signal });
    window.addEventListener("resize", () => {
      if (!document.body.contains(cI) || busy) return;
      if (!finished) { idle(current.A, current.B); return; }
      const AB = M().mul2(current.A, current.B);
      M().drawTransformScene(cI, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "单位正方形" });
      M().drawTransformScene(cB, current.B, { firstLabel: "Be₁", secondLabel: "Be₂", caption: "第一步：E → B", ghost: I });
      M().drawTransformScene(cAB, AB, { firstLabel: "ABe₁", secondLabel: "ABe₂", caption: "第二步：B → AB", ghost: current.B });
    }, { signal, passive: true });

    idle(current.A, current.B);
    return () => {
      run += 1;
      controller.abort();
      [cI, cB, cAB].forEach((canvas) => M().cancelAnim(canvas));
    };
  }

  defineChapter2Renderer("laplace-and-product", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "从子式配对到复合倍率",
        `广义 Laplace 定理把按一行展开推广到按 ${tex("k")} 行展开；乘法规则说明线性变换复合时，有向体积倍率相乘。`,
        module("01", "广义 Laplace 定理", `固定 ${tex("k")} 行，遍历全部 ${tex("k")} 列组合。`, `
          <div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">子式</span><strong>所选 ${tex("k")} 行与 ${tex("k")} 列交叉得到 ${tex("k")} 阶行列式</strong><p>未被选择的行列形成互补子式。</p></article>
            <article class="ch2-def"><span class="kicker">位置符号</span><strong>${tex("(-1)^{\\sum I+\\sum J}")}</strong><p>${tex("I")}、${tex("J")} 分别是所选行指标集与列指标集。</p></article>
          </div>
          <article class="ch2-def ch2-formula-block ch2-laplace-formula"><span class="kicker">固定行指标集 ${tex("I")} 的展开</span><strong>${display("\\det(A)=\\sum_{|J|=k}(-1)^{\\sum I+\\sum J}\\det A[I,J]\\,\\det A[I^c,J^c]")}</strong><p>${tex("J")} 取遍 ${tex("\\{1,\\ldots,n\\}")} 的全部 ${tex("k")} 元子集。当 ${tex("k=1")} 时，子式就是一个元素，互补子式就是余子式，公式退化为 §6。</p></article>
          ${laplaceExample()}
        `) + module("02", "乘法规则", `先作用 ${tex("B")}，再作用 ${tex("A")}，倍率依次相乘。`, `
          <article class="ch2-def ch2-formula-block"><span class="kicker">定理</span><strong>${display("\\det(AB)=\\det(A)\\det(B)")}</strong><p>向量先经过 ${tex("B")}，再经过 ${tex("A")}；有向体积先乘 ${tex("\\det(B)")}，随后乘 ${tex("\\det(A)")}。</p></article>
          ${proofSteps([
            `几何入口：单位体积经过 ${tex("B")} 后乘 ${tex("\\det(B)")}，再经过 ${tex("A")} 后乘 ${tex("\\det(A)")}。`,
            `代数入口：把 ${tex("AB")} 的每一列写成 ${tex("A")} 的列向量的线性组合。`,
            `对所有列使用多重线性展开；含重复 ${tex("A")} 列的项全部为零。`,
            `剩余列指标必须构成排列，其符号与 ${tex("B")} 的 Leibniz 展开一致。`,
            `把 ${tex("A")} 的排列和与 ${tex("B")} 的排列和分离，得到 ${tex("\\det(A)\\det(B)")}。`,
          ])}
        `) + module("03", "重要推论", "乘法规则把多个结论压缩成一行计算。", `
          <div class="ch2-card-grid">
            <article class="ch2-card"><span class="kicker">逆矩阵</span><h4>${tex("\\det(A^{-1})=1/\\det(A)")}</h4><p>由 ${tex("\\det(E)=\\det(A)\\det(A^{-1})")}。</p></article>
            <article class="ch2-card"><span class="kicker">矩阵幂</span><h4>${tex("\\det(A^m)=\\det(A)^m")}</h4><p>重复复合，倍率重复相乘。</p></article>
            <article class="ch2-card"><span class="kicker">相似</span><h4>${tex("\\det(P^{-1}AP)=\\det(A)")}</h4><p>换基前后的两个 ${tex("P")} 因子相互抵消。</p></article>
          </div>
        `) + misconception([
          `${tex("AB")} 与 ${tex("BA")} 通常不同，但二者行列式都等于 ${tex("\\det(A)\\det(B)")}。`,
          `二维面积只说明 ${tex("n=2")} 的情形；一般 ${tex("n")} 阶的证明要用多重线性与排列。`,
        ]),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab" data-prod-lab>
          <div class="ch2-lab-head"><h3>两次变换，面积倍率相乘</h3></div>
          <div data-prod-gate></div>
          <p class="ch2-lab-hint">单位正方形先经过 ${tex("B")}，再从 ${tex("B")} 的结果出发经过 ${tex("A")}，合起来就是 ${tex("AB")}。</p>
          <div class="ch2-presets">
            <button type="button" class="is-primary" data-prod-replay>播放 ${tex("E\\to B\\to AB")}</button>
            <button type="button" class="is-active" data-prod-preset="scale">两次缩放</button>
            <button type="button" data-prod-preset="shearScale">剪切后缩放</button>
            <button type="button" data-prod-preset="mirrorRotate">镜像后旋转</button>
            <button type="button" data-prod-preset="doubleMirror">两次镜像</button>
            <button type="button" data-prod-preset="project">含投影</button>
          </div>
          <div class="ch2-stage-row">
            <div class="ch2-stage-panel"><div class="ch2-stage"><canvas data-c-i aria-label="单位正方形"></canvas></div><div class="ch2-stage-caption">${tex("E")} · 单位正方形</div></div>
            <div class="ch2-stage-panel"><div class="ch2-stage"><canvas data-c-b aria-label="经过 B 的图形"></canvas></div><div class="ch2-stage-caption">第一步 · ${tex("E\\to B")}</div></div>
            <div class="ch2-stage-panel"><div class="ch2-stage"><canvas data-c-ab aria-label="从 B 经过 A 到 AB 的图形"></canvas></div><div class="ch2-stage-caption">第二步 · ${tex("B\\to AB")}（虚线是 ${tex("B")} 的结果）</div></div>
          </div>
          <div class="ch2-tile-row" data-prod-tiles aria-label="面积块"></div>
          <div class="ch2-meter is-4">
            <div class="ch2-meter-card"><strong>${tex("\\det(A)")}</strong><span data-da></span></div>
            <div class="ch2-meter-card"><strong>${tex("\\det(B)")}</strong><span data-db></span></div>
            <div class="ch2-meter-card"><strong>${tex("\\det(A)\\det(B)")}</strong><span data-prod></span></div>
            <div class="ch2-meter-card"><strong data-dab-label>${tex("\\det(AB)")}</strong><span data-dab></span></div>
          </div>
          <div class="ch2-note">${"验证状态："}<strong data-rule-status aria-live="polite"></strong></div>
        </div>`;
      const cleanupProduct = mountProduct(root);
      return () => cleanupProduct?.();
    },
  });
})();
