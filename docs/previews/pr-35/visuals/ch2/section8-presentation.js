(() => {
  const { M, tex, display, formalShell, module, proofSteps, misconception } = window.Ch2PresentationUtils;

  function matrixTex(matrix) {
    return tex(`\\begin{bmatrix}${matrix.map((row) => row.map((value) => M().formatNum(value, 3)).join("&")).join("\\\\")}\\end{bmatrix}`);
  }

  function mountLaplacePairing(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const matrix = [[1, 2, 0, 1], [0, 1, 1, 0], [2, 0, 1, 1], [1, 1, 0, 2]];
    const rows = [0, 1];
    const pairs = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
    let selected = 0;

    function contribution(cols) {
      const complementRows = M().complementIndices(4, rows);
      const complementCols = M().complementIndices(4, cols);
      const minorMatrix = M().submatrix(matrix, rows, cols);
      const complementMatrix = M().submatrix(matrix, complementRows, complementCols);
      const minor = M().determinant(minorMatrix);
      const complement = M().determinant(complementMatrix);
      const exponent = rows.reduce((sum, value) => sum + value + 1, 0) + cols.reduce((sum, value) => sum + value + 1, 0);
      const sign = exponent % 2 === 0 ? 1 : -1;
      return { cols, complementCols, minorMatrix, complementMatrix, minor, complement, sign, term: sign * minor * complement };
    }

    const all = pairs.map(contribution);
    const total = all.reduce((sum, item) => sum + item.term, 0);

    function render() {
      const list = root.querySelector("[data-pair-list]");
      list.innerHTML = all.map((item, index) => `<button type="button" class="ch2-pair${index === selected ? " is-active" : ""}" data-pair="${index}" aria-pressed="${index === selected}"><span>列 ${item.cols.map((value) => value + 1).join("")}</span><strong>${M().formatNum(item.term, 2)}</strong></button>`).join("");
      list.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
        selected = Number(button.dataset.pair);
        render();
      }, { signal }));
      const item = all[selected];
      root.querySelector("[data-pair-cols]").textContent = item.cols.map((value) => value + 1).join(", ");
      root.querySelector("[data-pair-comp]").textContent = item.complementCols.map((value) => value + 1).join(", ");
      root.querySelector("[data-pair-minor-matrix]").innerHTML = matrixTex(item.minorMatrix);
      root.querySelector("[data-pair-complement-matrix]").innerHTML = matrixTex(item.complementMatrix);
      root.querySelector("[data-pair-minor]").textContent = M().formatNum(item.minor, 3);
      root.querySelector("[data-pair-sign]").textContent = item.sign > 0 ? "+1" : "−1";
      root.querySelector("[data-pair-complement]").textContent = M().formatNum(item.complement, 3);
      root.querySelector("[data-pair-term]").textContent = M().formatNum(item.term, 3);
      root.querySelector("[data-pair-sum]").textContent = M().formatNum(total, 3);
      root.querySelector("[data-pair-det]").textContent = M().formatNum(M().determinant(matrix), 3);
      root.querySelector("[data-pair-explain]").textContent = `符号指数 = (1+2)+(${item.cols.map((value) => value + 1).join("+")})，因此本项符号为 ${item.sign > 0 ? "+1" : "−1"}。`;
      root.querySelectorAll("[data-laplace-table] td").forEach((cell) => {
        const row = Number(cell.dataset.r);
        const col = Number(cell.dataset.c);
        cell.classList.toggle("is-selected", rows.includes(row) && item.cols.includes(col));
        cell.classList.toggle("is-complement", !rows.includes(row) && item.complementCols.includes(col));
      });
    }

    const table = root.querySelector("[data-laplace-table]");
    table.innerHTML = matrix.map((row, rowIndex) => `<tr>${row.map((value, colIndex) => `<td data-r="${rowIndex}" data-c="${colIndex}">${value}</td>`).join("")}</tr>`).join("");
    render();
    return () => controller.abort();
  }

  function mountProduct(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const presets = {
      scale: { A: [[2, 0], [0, 1]], B: [[1.5, 0], [0, 1]] },
      shearScale: { A: [[1.2, 0], [0, 1]], B: [[1, 1], [0, 1]] },
      mirrorRotate: { A: [[0, -1], [1, 0]], B: [[-1, 0], [0, 1]] },
      doubleMirror: { A: [[-1, 0], [0, 1]], B: [[1, 0], [0, -1]] },
      project: { A: [[1, 0], [0, 1]], B: [[1, 0], [0, 0]] },
    };
    const cI = root.querySelector("[data-c-i]");
    const cB = root.querySelector("[data-c-b]");
    const cAB = root.querySelector("[data-c-ab]");
    let current = presets.scale;
    let busy = false;

    function setBusy(value) {
      busy = value;
      root.querySelectorAll("[data-prod-preset], [data-prod-replay]").forEach((button) => {
        button.disabled = value;
      });
    }

    function setFinalMeters(A, B, AB) {
      const dA = M().det2(A);
      const dB = M().det2(B);
      const dAB = M().det2(AB);
      root.querySelector("[data-da]").textContent = M().formatNum(dA, 3);
      root.querySelector("[data-db]").textContent = M().formatNum(dB, 3);
      root.querySelector("[data-prod]").textContent = M().formatNum(dA * dB, 3);
      root.querySelector("[data-dab]").textContent = M().formatNum(dAB, 3);
      const status = root.querySelector("[data-rule-status]");
      status.textContent = Math.abs(dAB - dA * dB) < 1e-8
        ? `验证完成：${M().formatNum(dAB, 3)} = ${M().formatNum(dA, 3)} × ${M().formatNum(dB, 3)}`
        : "数值未对齐，请重播。";
      status.className = Math.abs(dAB - dA * dB) < 1e-8 ? "is-positive" : "is-negative";
    }

    function paint(A, B) {
      const I = [[1, 0], [0, 1]];
      const AB = M().mul2(A, B);
      M().drawTransformScene(cI, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "单位形" });
      M().drawTransformScene(cB, B, { firstLabel: "Be₁", secondLabel: "Be₂", caption: "第一阶段：B" });
      M().drawTransformScene(cAB, AB, { firstLabel: "ABe₁", secondLabel: "ABe₂", caption: "第二阶段：A(B·)" });
      setFinalMeters(A, B, AB);
    }

    async function play(A, B) {
      if (busy) return;
      setBusy(true);
      current = { A, B };
      const I = [[1, 0], [0, 1]];
      const AB = M().mul2(A, B);
      const dA = M().det2(A);
      const dB = M().det2(B);
      const status = root.querySelector("[data-rule-status]");
      try {
        M().drawTransformScene(cI, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "单位形" });
        M().drawTransformScene(cB, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "准备作用 B" });
        M().drawTransformScene(cAB, B, { firstLabel: "Be₁", secondLabel: "Be₂", caption: "第二阶段从 B 开始" });
        root.querySelector("[data-da]").textContent = M().formatNum(dA, 3);
        root.querySelector("[data-db]").textContent = "1";
        root.querySelector("[data-prod]").textContent = M().formatNum(dA, 3);
        root.querySelector("[data-dab]").textContent = M().formatNum(dB, 3);
        status.textContent = "第一阶段：单位形正在变为 B。右侧已经固定在第二阶段的真实起点 B。";
        status.className = "";

        await M().animateMatrix(cB, B, {
          duration: 700,
          drawOptions: { firstLabel: "Be₁", secondLabel: "Be₂", caption: "第一步：I → B" },
          onUpdate(intermediate) {
            const currentDB = M().det2(intermediate);
            root.querySelector("[data-db]").textContent = M().formatNum(currentDB, 3);
            root.querySelector("[data-prod]").textContent = M().formatNum(dA * currentDB, 3);
          },
        });

        root.querySelector("[data-db]").textContent = M().formatNum(dB, 3);
        root.querySelector("[data-prod]").textContent = M().formatNum(dA * dB, 3);
        status.textContent = "第二阶段：保持 B 的结果，再作用 A；右侧从 B 连续变为 AB。";

        await M().animateMatrix(cAB, AB, {
          duration: 780,
          drawOptions: { firstLabel: "ABe₁", secondLabel: "ABe₂", caption: "第二步：B → AB（再作用 A）" },
          onUpdate(intermediate) {
            root.querySelector("[data-dab]").textContent = M().formatNum(M().det2(intermediate), 3);
          },
        });
        paint(A, B);
      } finally {
        setBusy(false);
      }
    }

    root.querySelectorAll("[data-prod-preset]").forEach((button) => button.addEventListener("click", () => {
      if (busy) return;
      root.querySelectorAll("[data-prod-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      const preset = presets[button.dataset.prodPreset];
      play(preset.A, preset.B);
    }, { signal }));
    root.querySelector("[data-prod-replay]").addEventListener("click", () => play(current.A, current.B), { signal });
    window.addEventListener("resize", () => document.body.contains(cI) && paint(current.A, current.B), { signal, passive: true });

    play(current.A, current.B);
    return () => {
      controller.abort();
      [cI, cB, cAB].forEach((canvas) => M().cancelAnim(canvas));
    };
  }

  defineChapter2Renderer("laplace-and-product", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "从子式配对到复合倍率",
        "本节包含两条收束主线：广义 Laplace 定理把单行展开推广到多个行；乘法规则把行列式解释为线性变换复合时可乘的有向体积倍率。",
        module("01", "广义 Laplace 定理", "固定 k 行，遍历全部 k 列组合。", `
          <div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">子式</span><strong>所选 k 行与 k 列交叉得到 k 阶行列式</strong><p>未被选择的行列形成互补子式。</p></article>
            <article class="ch2-def"><span class="kicker">位置符号</span><strong>${tex("(-1)^{\\sum I+\\sum J}")}</strong><p>I、J 分别是所选行指标集与列指标集。</p></article>
          </div>
          <article class="ch2-def ch2-formula-block"><span class="kicker">固定行指标集 I 的展开</span><strong>${display("\\det(A)=\\sum_{\\substack{J\\subset\\{1,\\ldots,n\\}\\\\|J|=k}}(-1)^{\\sum I+\\sum J}\\det A[I,J]\\,\\det A[I^c,J^c]")}</strong><p>当 k=1 时，子式就是一个元素，互补子式就是余子式，公式退化为 §6。</p></article>
        `) + module("02", "乘法规则", "第二阶段必须从 B 后的图形继续，而非重新从单位形开始。", `
          <article class="ch2-def ch2-formula-block"><span class="kicker">定理</span><strong>${display("\\det(AB)=\\det(A)\\det(B)")}</strong><p>向量先经过 B，再经过 A；有向体积先乘 det(B)，随后乘 det(A)。</p></article>
          ${proofSteps([
            "几何入口：单位体积经过 B 后乘 det(B)，再经过 A 后乘 det(A)。",
            "代数入口：把 AB 的每一列写成 A 的列向量的线性组合。",
            "对所有列使用多重线性展开；含重复 A 列的项全部为零。",
            "剩余列指标必须构成排列，其符号与 B 的 Leibniz 展开一致。",
            "把 A 的排列和与 B 的排列和分离，得到 det(A)det(B)。",
          ])}
        `) + module("03", "重要推论", "乘法规则把多个结论压缩成一行计算。", `
          <div class="ch2-card-grid">
            <article class="ch2-card"><span class="kicker">逆矩阵</span><h4>${tex("\\det(A^{-1})=1/\\det(A)")}</h4><p>由 det(I)=det(A)det(A⁻¹)。</p></article>
            <article class="ch2-card"><span class="kicker">矩阵幂</span><h4>${tex("\\det(A^m)=\\det(A)^m")}</h4><p>重复复合，倍率重复相乘。</p></article>
            <article class="ch2-card"><span class="kicker">相似</span><h4>${tex("\\det(P^{-1}AP)=\\det(A)")}</h4><p>换基前后的两个 P 因子相互抵消。</p></article>
          </div>
        `) + misconception([
          "AB 与 BA 通常不同，但二者行列式都等于 det(A)det(B)。",
          "几何动画解释公式为何自然；一般 n 阶的严格证明仍要回到多重线性与排列。",
          "广义 Laplace 定理与乘法规则是本节两条独立而相互呼应的结论。",
        ]),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>子式配对板</h3><p>固定前两行，4×4 中共有六个两列组合。每张卡片显示子式、互补子式、位置符号与最终贡献。</p></div>
          <div class="ch2-task"><strong>观察任务</strong><span>浏览六个组合，核对贡献之和与原 4 阶行列式完全一致。</span></div>
          <div class="ch2-lab-grid">
            <div class="ch2-matrix-box"><table class="ch2-matrix-table is-static ch2-laplace-table" data-laplace-table aria-label="四阶 Laplace 子式配对矩阵"></table></div>
            <div class="ch2-side">
              <div class="ch2-pair-list" data-pair-list></div>
              <div class="ch2-note"><strong>所选子矩阵</strong> <span data-pair-minor-matrix></span><br /><strong>互补子矩阵</strong> <span data-pair-complement-matrix></span></div>
              <div class="ch2-meter is-2">
                <div class="ch2-meter-card"><strong>所选列</strong><span data-pair-cols></span></div>
                <div class="ch2-meter-card"><strong>互补列</strong><span data-pair-comp></span></div>
                <div class="ch2-meter-card"><strong>子式</strong><span data-pair-minor></span></div>
                <div class="ch2-meter-card"><strong>位置符号</strong><span data-pair-sign></span></div>
                <div class="ch2-meter-card"><strong>互补子式</strong><span data-pair-complement></span></div>
                <div class="ch2-meter-card"><strong>本项贡献</strong><span data-pair-term></span></div>
              </div>
              <div class="ch2-note" data-pair-explain></div>
              <div class="ch2-note">六项和：<strong data-pair-sum></strong>　原 det：<strong data-pair-det></strong></div>
            </div>
          </div>
        </div>
        <div class="ch2-lab ch2-lab-spaced">
          <div class="ch2-lab-head"><h3>两阶段体积实验 · I → B → AB</h3><p>中间屏先从 I 变为 B；右侧屏以 B 为真实起点，再连续变为 AB。</p></div>
          <div class="ch2-task"><strong>观察任务</strong><span>比较一次镜像、两次镜像与含投影三种符号或零值情形。</span></div>
          <div class="ch2-stage-row">
            <div class="ch2-stage-panel"><div class="ch2-stage"><canvas data-c-i aria-label="单位形"></canvas></div><div class="ch2-stage-caption">I · 单位形</div></div>
            <div class="ch2-stage-panel"><div class="ch2-stage"><canvas data-c-b aria-label="经过 B 的图形"></canvas></div><div class="ch2-stage-caption">第一阶段 · I → B</div></div>
            <div class="ch2-stage-panel"><div class="ch2-stage"><canvas data-c-ab aria-label="从 B 经过 A 到 AB 的图形"></canvas></div><div class="ch2-stage-caption">第二阶段 · B → AB</div></div>
          </div>
          <div class="ch2-meter is-4">
            <div class="ch2-meter-card"><strong>det(A)</strong><span data-da></span></div>
            <div class="ch2-meter-card"><strong>det(B)</strong><span data-db></span></div>
            <div class="ch2-meter-card"><strong>det(A)det(B)</strong><span data-prod></span></div>
            <div class="ch2-meter-card"><strong>det(AB)</strong><span data-dab></span></div>
          </div>
          <div class="ch2-note">验证状态：<strong data-rule-status aria-live="polite"></strong></div>
          <div class="ch2-presets">
            <button type="button" class="is-active" data-prod-preset="scale">两次缩放</button>
            <button type="button" data-prod-preset="shearScale">剪切后缩放</button>
            <button type="button" data-prod-preset="mirrorRotate">镜像后旋转</button>
            <button type="button" data-prod-preset="doubleMirror">两次镜像</button>
            <button type="button" data-prod-preset="project">含投影</button>
            <button type="button" data-prod-replay>重播</button>
          </div>
        </div>`;
      const cleanupPairing = mountLaplacePairing(root);
      const cleanupProduct = mountProduct(root);
      return () => {
        cleanupProduct?.();
        cleanupPairing?.();
      };
    },
  });
})();