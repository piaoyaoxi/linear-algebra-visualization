(() => {
  const { M, tex, display, aEntry, productTermHtml, formalShell, module, proofSteps, misconception, taskBox } = window.Ch2PresentationUtils;
  // ---------- §5 ----------
  function mountStrategy(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const initial = [[2, 1, 0], [1, 3, 1], [0, 2, 1]];
    let matrix = M().cloneMat(initial);
    let factor = 1;
    const ledger = [];
    const history = [];
    let busy = false;

    function isUpperTriangular(value) {
      for (let row = 1; row < value.length; row += 1) {
        for (let col = 0; col < row; col += 1) {
          if (Math.abs(value[row][col]) > 1e-8) return false;
        }
      }
      return true;
    }

    function snapshot() {
      history.push({ matrix: M().cloneMat(matrix), factor, ledger: ledger.slice() });
    }

    function setBusy(value) {
      busy = value;
      root.querySelectorAll("button").forEach((button) => {
        if (!button.matches("[data-op-undo]")) button.disabled = value;
      });
      root.querySelector("[data-op-undo]").disabled = value || history.length === 0;
    }

    function render({ pulse = false } = {}) {
      const table = root.querySelector("[data-mat-table]");
      table.innerHTML = matrix.map((row) => `<tr>${row.map((value) => `<td class="${pulse ? "is-updated" : ""}">${M().formatNum(value, 3)}</td>`).join("")}</tr>`).join("");
      if (pulse && !M().reducedMotion()) setTimeout(() => table.querySelectorAll("td").forEach((cell) => cell.classList.remove("is-updated")), 420);
      const current = M().determinant(matrix);
      const original = Math.abs(factor) < M().EPS ? NaN : current / factor;
      root.querySelector("[data-cur]").textContent = M().formatNum(current, 4);
      root.querySelector("[data-factor]").textContent = M().formatNum(factor, 4);
      root.querySelector("[data-orig]").textContent = M().formatNum(original, 4);
      root.querySelector("[data-step-count]").textContent = String(ledger.length);
      const triangular = isUpperTriangular(matrix);
      const status = root.querySelector("[data-triangle-status]");
      status.textContent = triangular ? `已经是上三角：对角线乘积 ${M().formatNum(matrix[0][0] * matrix[1][1] * matrix[2][2], 4)}` : "尚未形成上三角；继续制造主对角线下方的零。";
      status.className = triangular ? "ch2-note is-positive" : "ch2-note";
      root.querySelector("[data-ledger]").innerHTML = ledger.length ? ledger.map((line) => `<li>${line}</li>`).join("") : "<li>起点：累计倍率 1</li>";
      root.querySelector("[data-op-undo]").disabled = busy || history.length === 0;
    }

    async function apply(next, multiplier, line, allowBusy = false) {
      if (busy && !allowBusy) return;
      snapshot();
      matrix = next;
      factor *= multiplier;
      ledger.push(line);
      render({ pulse: true });
      if (!M().reducedMotion()) await new Promise((resolve) => setTimeout(resolve, 260));
    }

    const operations = {
      swap: (allowBusy = false) => apply([matrix[1].slice(), matrix[0].slice(), matrix[2].slice()], -1, "R₁ ↔ R₂　累计倍率 ×(−1)", allowBusy),
      scale: (allowBusy = false) => {
        const next = M().cloneMat(matrix);
        next[1] = next[1].map((value) => value * 2);
        return apply(next, 2, "R₂ ← 2R₂　累计倍率 ×2", allowBusy);
      },
      eliminateFirst: (allowBusy = false) => {
        const next = M().cloneMat(matrix);
        if (Math.abs(next[0][0]) < M().EPS) return Promise.resolve();
        const coefficient = next[1][0] / next[0][0];
        next[1] = next[1].map((value, col) => value - coefficient * next[0][col]);
        return apply(next, 1, `R₂ ← R₂−(${M().formatNum(coefficient, 3)})R₁　×1`, allowBusy);
      },
      eliminateSecond: (allowBusy = false) => {
        const next = M().cloneMat(matrix);
        if (Math.abs(next[1][1]) < M().EPS) return Promise.resolve();
        const coefficient = next[2][1] / next[1][1];
        next[2] = next[2].map((value, col) => value - coefficient * next[1][col]);
        return apply(next, 1, `R₃ ← R₃−(${M().formatNum(coefficient, 3)})R₂　×1`, allowBusy);
      },
    };

    root.querySelector("[data-op-swap]").addEventListener("click", () => operations.swap(), { signal });
    root.querySelector("[data-op-scale]").addEventListener("click", () => operations.scale(), { signal });
    root.querySelector("[data-op-add]").addEventListener("click", () => operations.eliminateFirst(), { signal });
    root.querySelector("[data-op-add2]").addEventListener("click", () => operations.eliminateSecond(), { signal });
    root.querySelector("[data-op-undo]").addEventListener("click", () => {
      if (busy || !history.length) return;
      const previous = history.pop();
      matrix = previous.matrix;
      factor = previous.factor;
      ledger.splice(0, ledger.length, ...previous.ledger);
      render({ pulse: true });
    }, { signal });
    root.querySelector("[data-op-reset]").addEventListener("click", () => {
      if (busy) return;
      matrix = M().cloneMat(initial);
      factor = 1;
      ledger.length = 0;
      history.length = 0;
      render({ pulse: true });
    }, { signal });
    root.querySelector("[data-op-demo]").addEventListener("click", async () => {
      if (busy) return;
      matrix = M().cloneMat(initial);
      factor = 1;
      ledger.length = 0;
      history.length = 0;
      render({ pulse: true });
      setBusy(true);
      try {
        await operations.eliminateFirst(true);
        await operations.eliminateSecond(true);
      } finally {
        setBusy(false);
        render();
      }
    }, { signal });

    render();
    return () => controller.abort();
  }

  defineChapter2Renderer("determinant-computation", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "计算从识别结构开始",
        "定义说明行列式是什么，性质决定怎样高效计算。每一步操作都要同时回答两个问题：它能制造什么结构，它对行列式乘了多少。",
        module("01", "策略优先级", "先减少非零结构，再选择终点。", `
          <div class="ch2-card-grid">
            <article class="ch2-card"><span class="kicker">读结构</span><h4>零、因子、相似行列</h4><p>先观察矩阵已经提供了哪些捷径。</p></article>
            <article class="ch2-card"><span class="kicker">制造零</span><h4>倍加保持 det</h4><p>用消元把主对角线下方或某一展开方向清空。</p></article>
            <article class="ch2-card"><span class="kicker">抵达终点</span><h4>三角或零多展开</h4><p>三角形读对角线，零多行列只算少量余子式。</p></article>
          </div>
        `) + module("02", "倍率账本", "当前值与原值之间始终保留可验证关系。", proofSteps([
          "交换：当前行列式乘 −1。",
          "一行整体倍乘 λ：当前行列式乘 λ。",
          "倍加：当前行列式保持不变。",
          "终点求出当前值后，用累计倍率恢复原行列式。",
        ]) + misconception([
          "只有三角矩阵才能直接读取主对角线乘积。",
          "计算路线可以不同；账本完整时结果应一致。",
        ])),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>行列式策略台 · 造零、撤销与验证</h3><p>矩阵、当前 det、累计倍率和操作历史同步。形成上三角后，系统显示对角线乘积。</p></div>
          <div class="ch2-task"><strong>观察任务</strong><span>只用两次倍加完成三角化；再尝试交换或倍乘并撤销，核对账本。</span></div>
          <div class="ch2-lab-grid">
            <div class="ch2-matrix-box">
              <table class="ch2-matrix-table is-static" data-mat-table aria-label="三阶计算策略矩阵"></table>
              <div class="ch2-toolbar">
                <button type="button" data-op-add>消去 R₂ 第一项</button>
                <button type="button" data-op-add2>消去 R₃ 第二项</button>
                <button type="button" data-op-swap>交换 R₁、R₂</button>
                <button type="button" data-op-scale>R₂ ×2</button>
                <button type="button" data-op-undo>撤销</button>
                <button type="button" data-op-demo>播放三角化</button>
                <button type="button" data-op-reset>重置</button>
              </div>
            </div>
            <div class="ch2-side">
              <div class="ch2-meter is-2">
                <div class="ch2-meter-card"><strong>当前 det</strong><span data-cur></span></div>
                <div class="ch2-meter-card"><strong>累计倍率</strong><span data-factor></span></div>
                <div class="ch2-meter-card"><strong>原 det</strong><span data-orig></span></div>
                <div class="ch2-meter-card"><strong>步骤数</strong><span data-step-count></span></div>
              </div>
              <div data-triangle-status class="ch2-note"></div>
              <div class="ch2-ledger"><strong>操作账本</strong><ol data-ledger></ol></div>
            </div>
          </div>
        </div>`;
      return mountStrategy(root);
    },
  });

})();
