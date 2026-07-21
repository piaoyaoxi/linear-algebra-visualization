(() => {
  const { M, tex, display, aEntry, productTermHtml, formalShell, module, proofSteps, misconception, taskBox } = window.Ch2PresentationUtils;
  // ---------- §4 ----------
  function mountColumnOperations(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const initial = [[1.2, 0.35], [0.2, 1.1]];
    let matrix = M().cloneMat(initial);
    const baseDet = M().det2(initial);
    let factor = 1;
    const ledger = [];
    const history = [];
    const beforeCanvas = root.querySelector("[data-row-before]");
    const canvas = root.querySelector("[data-row-canvas]");
    let animating = false;

    function matrixHtml(value) {
      return tex(`\\begin{bmatrix}${M().formatNum(value[0][0], 2)}&${M().formatNum(value[0][1], 2)}\\\\${M().formatNum(value[1][0], 2)}&${M().formatNum(value[1][1], 2)}\\end{bmatrix}`);
    }

    function snapshot() {
      history.push({ matrix: M().cloneMat(matrix), factor, ledger: ledger.slice() });
    }

    function sync() {
      const det = M().det2(matrix);
      root.querySelector("[data-mat]").innerHTML = matrixHtml(matrix);
      root.querySelector("[data-cur-det]").textContent = M().formatNum(det, 3);
      root.querySelector("[data-factor]").textContent = M().formatNum(factor, 3);
      root.querySelector("[data-base-det]").textContent = M().formatNum(baseDet, 3);
      root.querySelector("[data-check]").textContent = M().formatNum(baseDet * factor, 3);
      root.querySelector("[data-ledger]").innerHTML = ledger.length ? ledger.map((line) => `<li>${line}</li>`).join("") : "<li>起点：累计倍率 1</li>";
      root.querySelector("[data-op-undo]").disabled = history.length === 0 || animating;
      M().drawTransformScene(canvas, matrix, {
        firstLabel: "第 1 列",
        secondLabel: "第 2 列",
        caption: `当前 det=${M().formatNum(det, 3)} · 图形展示列操作`,
      });
      M().drawTransformScene(beforeCanvas, initial, {
        firstLabel: "初始 C₁",
        secondLabel: "初始 C₂",
        caption: `固定参照 · det=${M().formatNum(baseDet, 3)}`,
      });
    }

    async function apply(next, multiplier, line) {
      if (animating) return;
      snapshot();
      animating = true;
      factor *= multiplier;
      ledger.push(line);
      try {
        await M().animateMatrix(canvas, next, {
          duration: 560,
          drawOptions: { firstLabel: "第 1 列", secondLabel: "第 2 列", caption: line },
          onUpdate(current) {
            root.querySelector("[data-cur-det]").textContent = M().formatNum(M().det2(current), 3);
            root.querySelector("[data-mat]").innerHTML = matrixHtml(current);
          },
        });
        matrix = M().cloneMat(next);
      } finally {
        animating = false;
        sync();
      }
    }

    root.querySelector("[data-op-swap]").addEventListener("click", () => apply(
      [[matrix[0][1], matrix[0][0]], [matrix[1][1], matrix[1][0]]],
      -1,
      "C₁ ↔ C₂　累计倍率 ×(−1)",
    ), { signal });
    root.querySelector("[data-op-scale]").addEventListener("click", () => apply(
      [[matrix[0][0] * 1.5, matrix[0][1]], [matrix[1][0] * 1.5, matrix[1][1]]],
      1.5,
      "C₁ ← 1.5C₁　累计倍率 ×1.5",
    ), { signal });
    root.querySelector("[data-op-add]").addEventListener("click", () => apply(
      [[matrix[0][0], matrix[0][1] + matrix[0][0]], [matrix[1][0], matrix[1][1] + matrix[1][0]]],
      1,
      "C₂ ← C₂+C₁　累计倍率 ×1",
    ), { signal });
    root.querySelector("[data-op-undo]").addEventListener("click", () => {
      if (animating || !history.length) return;
      const previous = history.pop();
      matrix = previous.matrix;
      factor = previous.factor;
      ledger.splice(0, ledger.length, ...previous.ledger);
      sync();
    }, { signal });
    root.querySelector("[data-op-reset]").addEventListener("click", () => {
      matrix = M().cloneMat(initial);
      factor = 1;
      ledger.length = 0;
      history.length = 0;
      sync();
    }, { signal });
    window.addEventListener("resize", () => document.body.contains(canvas) && sync(), { signal, passive: true });

    sync();
    return () => {
      controller.abort();
      M().cancelAnim(canvas);
      M().cancelAnim(beforeCanvas);
    };
  }

  defineChapter2Renderer("determinant-properties", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "分别线性与交替性统一全部计算规则",
        "交互直接展示列操作，因为平行四边形的生成边就是矩阵的列。由 det(Aᵀ)=det(A)，所有结论逐字转化为行操作版本。",
        module("01", "两条结构性质", "先抓住母性质，再记住派生规则。", `
          <div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">分别线性</span><strong>${tex("D(\\ldots,u+v,\\ldots)=D(\\ldots,u,\\ldots)+D(\\ldots,v,\\ldots)")}</strong><p>固定其余行或列后，对单独一个位置线性。</p></article>
            <article class="ch2-def"><span class="kicker">交替性</span><strong>交换两行或两列，行列式变号</strong><p>同一组生成向量的次序翻转，定向随之翻转。</p></article>
          </div>
        `) + module("02", "三类初等变换", "每一步都对应一个明确倍率。", `
          <div class="ch2-card-grid">
            <article class="ch2-card"><span class="kicker">交换</span><h4>×(−1)</h4><p>绝对值不变，定向翻转。</p></article>
            <article class="ch2-card"><span class="kicker">倍乘</span><h4>×λ</h4><p>一条生成边缩放，体积同比缩放。</p></article>
            <article class="ch2-card"><span class="kicker">倍加</span><h4>×1</h4><p>产生剪切，底与高的乘积保持。</p></article>
          </div>
        `) + module("03", "派生结论的依赖链", "证明时回到结构，计算时使用结论。", proofSteps([
          "两行相同：交换后矩阵未变，但行列式应变号，因此只能为 0。",
          "一行加另一行的倍数：按分别线性拆开，新增项含两行相同而为 0。",
          "三角矩阵：用倍加逐步消元或直接由定义，最终只剩主对角线乘积。",
          `${tex("\\det(\\lambda A)=\\lambda^n\\det(A)")}：n 行都各自提出一个 λ。`,
        ]) + misconception([
          `${tex("\\det(A+B)")} 一般不满足整体线性；线性只针对一行或一列。`,
          "交互中的列操作与教材中的行操作规则一致，连接桥梁是转置不变性。",
        ])),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>三种列操作 · 对比几何变化</h3><p>平行四边形由两列生成，所以画面直接操作列。右侧同步验证当前 det=初始 det×累计倍率。</p></div>
          <div class="ch2-task"><strong>观察任务</strong><span>依次做交换、倍乘、倍加，再逐步撤销；每一步先预测 det。</span></div>
          <div class="ch2-lab-grid">
            <div class="ch2-compare-stage">
              <div><span>变换前 · 固定参照</span><div class="ch2-stage"><canvas data-row-before aria-label="列操作前的有向面积"></canvas></div></div>
              <b aria-hidden="true">→</b>
              <div><span>变换后 · 当前状态</span><div class="ch2-stage"><canvas data-row-canvas aria-label="列操作后的有向面积"></canvas></div></div>
            </div>
            <div class="ch2-side">
              <div class="ch2-note">当前矩阵<br /><strong data-mat></strong></div>
              <div class="ch2-meter is-2">
                <div class="ch2-meter-card"><strong>当前 det</strong><span data-cur-det></span></div>
                <div class="ch2-meter-card"><strong>初始 det</strong><span data-base-det></span></div>
                <div class="ch2-meter-card"><strong>累计倍率</strong><span data-factor></span></div>
                <div class="ch2-meter-card"><strong>初始×倍率</strong><span data-check></span></div>
              </div>
              <div class="ch2-ledger"><strong>操作账本</strong><ol data-ledger></ol></div>
              <div class="ch2-toolbar">
                <button type="button" data-op-swap>交换 C₁、C₂</button>
                <button type="button" data-op-scale>C₁ ×1.5</button>
                <button type="button" data-op-add>C₂ ← C₂+C₁</button>
                <button type="button" data-op-undo>撤销</button>
                <button type="button" data-op-reset>重置</button>
              </div>
            </div>
          </div>
        </div>`;
      return mountColumnOperations(root);
    },
  });
})();
