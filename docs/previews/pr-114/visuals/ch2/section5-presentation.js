(() => {
  const { M, tex, display, aEntry, productTermHtml, formalShell, module, proofSteps, misconception, taskBox } = window.Ch2PresentationUtils;
  // ---------- §5 ----------
  // exact value of a rational number with a small denominator: { tex, text }
  function frac(value) {
    if (Math.abs(value) < 1e-9) return { tex: "0", text: "0" };
    const sign = value < 0 ? -1 : 1;
    const x = Math.abs(value);
    for (let d = 1; d <= 60; d += 1) {
      const n = Math.round(x * d);
      if (Math.abs(n / d - x) < 1e-9) {
        if (d === 1) return { tex: `${sign < 0 ? "-" : ""}${n}`, text: `${sign < 0 ? "−" : ""}${n}` };
        return { tex: `${sign < 0 ? "-" : ""}\\tfrac{${n}}{${d}}`, text: `${sign < 0 ? "−" : ""}${n}/${d}` };
      }
    }
    return { tex: M().formatNum(value, 4), text: M().formatNum(value, 4) };
  }

  function mountStrategy(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const initial = [[2, 1, 0], [1, 3, 1], [0, 2, 1]];
    let matrix = M().cloneMat(initial);
    let factor = 1;
    const ledger = [];
    const history = [];
    let busy = false;
    let focus = { row: 1, col: 0, text: "先利用第 1 行，把 a₂₁ 消成 0。" };
    const lab = root.querySelector(".ch2-lab");
    const gate = window.LAPredictGate?.mount(root.querySelector("[data-elim-gate]"), {
      root: lab,
      manual: true,
      key: "visuals/ch2/section5-presentation.js#elim",
      question: "只用两次倍加（某行减去另一行的倍数）把矩阵化成上三角。原来的 det 和上三角矩阵的对角线乘积有什么关系？",
      options: [
        ["相等", true, ""],
        ["差一个负号", false, "只有交换两行才变号；两次倍加不改变 det。"],
        ["还要除以消元用到的系数 ½、⅘", false, "倍加的系数不进入账本：倍加让 det 乘 1。"],
        ["上三角矩阵读不出 det", false, "上三角矩阵的 det 就是对角线乘积。"],
      ],
      right: `✓ 两次倍加都乘 1，所以原 det 就是对角线乘积 ${tex("2\\cdot\\tfrac52\\cdot\\tfrac15=1")}。交换或倍乘时，再按账本里的倍率还原。`,
      onPick: () => { syncLocks(); render(); },
      onReveal: () => render(),
    });
    const free = () => !gate || gate.picked;
    function syncLocks() {
      ["[data-op-next]", "[data-op-demo]"].forEach((selector) => {
        const button = root.querySelector(selector);
        if (free()) {
          if (button.title) { button.disabled = busy; button.removeAttribute("title"); }
          return;
        }
        button.disabled = true;
        button.title = "先在上方猜一猜";
      });
    }

    function isUpperTriangular(value) {
      for (let row = 1; row < value.length; row += 1) {
        for (let col = 0; col < row; col += 1) {
          if (Math.abs(value[row][col]) > 1e-8) return false;
        }
      }
      return true;
    }

    function snapshot() {
      history.push({ matrix: M().cloneMat(matrix), factor, ledger: ledger.slice(), focus: { ...focus } });
    }

    function setBusy(value) {
      busy = value;
      root.querySelectorAll("button").forEach((button) => {
        if (!button.matches("[data-op-undo]")) button.disabled = value;
      });
      root.querySelector("[data-op-undo]").disabled = value || history.length === 0;
      if (!value) {
        root.querySelectorAll("[data-op-next], [data-op-demo]").forEach((button) => button.removeAttribute("title"));
        syncLocks();
        syncZeros();
      }
    }

    // the stepper names the entry it zeroes next; once upper triangular there is nothing left
    function nextTarget() {
      if (Math.abs(matrix[1][0]) > M().EPS) return "first";
      if (Math.abs(matrix[2][1]) > M().EPS) return "second";
      return null;
    }
    function syncZeros() {
      const next = root.querySelector("[data-op-next]");
      const target = nextTarget();
      next.textContent = target === "first" ? "下一步：消去 a₂₁" : target === "second" ? "下一步：消去 a₃₂" : "已是上三角";
      if (busy || !free()) return;
      next.disabled = !target;
    }

    // arrow from the pivot (row focus.col) to the entry being zeroed (row focus.row)
    function drawPivotArrow(triangular) {
      const svg = root.querySelector("[data-pivot-arrow]");
      const wrap = svg?.parentElement;
      if (!svg || !wrap) return;
      const pivot = root.querySelector(`[data-mat-table] tr:nth-child(${focus.col + 1}) td:nth-child(${focus.col + 1})`);
      const target = root.querySelector(`[data-mat-table] tr:nth-child(${focus.row + 1}) td:nth-child(${focus.col + 1})`);
      if (triangular || !pivot || !target || !free()) {
        svg.innerHTML = "";
        return;
      }
      const box = wrap.getBoundingClientRect();
      const a = pivot.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      // start and end just outside the left bracket of the matrix
      const edge = root.querySelector("[data-mat-table]").getBoundingClientRect().left - box.left - 6;
      const x1 = edge;
      const y1 = a.top - box.top + a.height / 2;
      const x2 = edge;
      const y2 = b.top - box.top + b.height / 2;
      const bend = Math.max(22, (y2 - y1) * 0.4);
      const coefficient = Math.abs(matrix[focus.col][focus.col]) > M().EPS ? matrix[focus.row][focus.col] / matrix[focus.col][focus.col] : 0;
      svg.setAttribute("width", String(box.width));
      svg.setAttribute("height", String(box.height));
      svg.innerHTML = `<defs><marker id="ch2-pivot-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" /></marker></defs>
        <path class="ch2-pivot-path" d="M${x1} ${y1} C ${x1 - bend} ${y1}, ${x2 - bend} ${y2}, ${x2 - 3} ${y2}" marker-end="url(#ch2-pivot-head)" />
        <text class="ch2-pivot-text" x="${Math.max(4, x1 - bend * 0.75 - 6)}" y="${(y1 + y2) / 2 + 4}" text-anchor="end">×(−${frac(coefficient).text})</text>`;
    }

    function render({ pulse = false } = {}) {
      const table = root.querySelector("[data-mat-table]");
      table.innerHTML = matrix.map((row, rowIndex) => `<tr>${row.map((value, colIndex) => {
        const classes = [
          pulse && rowIndex === focus.row ? "is-updated" : "",
          rowIndex === focus.row && colIndex === focus.col ? "is-target" : "",
          rowIndex === focus.col && colIndex === focus.col ? "is-pivot" : "",
          rowIndex > colIndex && Math.abs(value) < M().EPS ? "is-zero-entry" : "",
        ].filter(Boolean).join(" ");
        return `<td class="${classes}">${tex(frac(value).tex.replace("\\tfrac", "\\dfrac"))}</td>`;
      }).join("")}</tr>`).join("");
      if (pulse && !M().reducedMotion()) setTimeout(() => table.querySelectorAll("td").forEach((cell) => cell.classList.remove("is-updated")), 420);
      const current = M().determinant(matrix);
      const original = Math.abs(factor) < M().EPS ? NaN : current / factor;
      // the determinants answer the prediction: they appear once it is checked
      const open = !gate || gate.revealed;
      root.querySelector("[data-cur]").textContent = open ? frac(current).text : "?";
      root.querySelector("[data-factor]").textContent = frac(factor).text;
      root.querySelector("[data-orig]").textContent = open ? frac(original).text : "?";
      root.querySelector("[data-step-count]").textContent = String(ledger.length);
      const triangular = isUpperTriangular(matrix);
      const status = root.querySelector("[data-triangle-status]");
      status.innerHTML = triangular ? `已经是上三角：对角线乘积 ${tex(`${frac(matrix[0][0]).tex}\\cdot${frac(matrix[1][1]).tex}\\cdot${frac(matrix[2][2]).tex}=${frac(matrix[0][0] * matrix[1][1] * matrix[2][2]).tex}`)}` : "尚未形成上三角；继续制造主对角线下方的零。";
      if (triangular && Math.abs(factor - 1) < 1e-9 && ledger.length) gate?.acted();
      status.className = triangular ? "ch2-note is-positive" : "ch2-note";
      root.querySelector("[data-ledger]").innerHTML = ledger.length ? ledger.map((line) => `<li>${line}</li>`).join("") : "<li>起点：累计倍率 1</li>";
      root.querySelector("[data-current-operation]").textContent = triangular
        ? "三角化完成：现在只需读取主对角线乘积，并按账本还原原值。"
        : focus.text;
      root.querySelector("[data-op-undo]").disabled = busy || history.length === 0;
      syncZeros();
      drawPivotArrow(triangular);
    }

    async function apply(next, multiplier, line, nextFocus, allowBusy = false) {
      if (busy && !allowBusy) return;
      snapshot();
      matrix = next;
      factor *= multiplier;
      ledger.push(line);
      if (nextFocus) focus = nextFocus;
      render({ pulse: true });
      if (!M().reducedMotion()) await new Promise((resolve) => setTimeout(resolve, 260));
    }

    const operations = {
      swap: (allowBusy = false) => apply([matrix[1].slice(), matrix[0].slice(), matrix[2].slice()], -1, "R₁ ↔ R₂　累计倍率 ×(−1)", { row: 1, col: 0, text: "交换改变了定向；继续选择主元并制造第一个零。" }, allowBusy),
      scale: (allowBusy = false) => {
        const next = M().cloneMat(matrix);
        next[1] = next[1].map((value) => value * 2);
        return apply(next, 2, "R₂ ← 2R₂　累计倍率 ×2", { row: 1, col: 0, text: "整行倍乘会缩放行列式；账本已经记下倍率 2。" }, allowBusy);
      },
      eliminateFirst: (allowBusy = false) => {
        const next = M().cloneMat(matrix);
        if (Math.abs(next[0][0]) < M().EPS || Math.abs(next[1][0]) < M().EPS) return Promise.resolve();
        const coefficient = next[1][0] / next[0][0];
        next[1] = next[1].map((value, col) => value - coefficient * next[0][col]);
        return apply(next, 1, `${tex(`R_2\\leftarrow R_2-${frac(coefficient).tex}R_1`)}　×1`, { row: 2, col: 1, text: "第一个零已出现；接着利用新的第 2 行消去 a₃₂。" }, allowBusy);
      },
      eliminateSecond: (allowBusy = false) => {
        const next = M().cloneMat(matrix);
        if (Math.abs(next[1][1]) < M().EPS || Math.abs(next[2][1]) < M().EPS) return Promise.resolve();
        const coefficient = next[2][1] / next[1][1];
        next[2] = next[2].map((value, col) => value - coefficient * next[1][col]);
        return apply(next, 1, `${tex(`R_3\\leftarrow R_3-${frac(coefficient).tex}R_2`)}　×1`, { row: 2, col: 1, text: "第二个零已出现，矩阵已经成为上三角。" }, allowBusy);
      },
    };

    root.querySelector("[data-op-swap]").addEventListener("click", () => operations.swap(), { signal });
    root.querySelector("[data-op-scale]").addEventListener("click", () => operations.scale(), { signal });
    root.querySelector("[data-op-next]").addEventListener("click", () => {
      const target = nextTarget();
      if (target === "first") operations.eliminateFirst();
      else if (target === "second") operations.eliminateSecond();
    }, { signal });
    root.querySelector("[data-op-undo]").addEventListener("click", () => {
      if (busy || !history.length) return;
      const previous = history.pop();
      matrix = previous.matrix;
      factor = previous.factor;
      focus = previous.focus;
      ledger.splice(0, ledger.length, ...previous.ledger);
      render({ pulse: true });
    }, { signal });
    root.querySelector("[data-op-reset]").addEventListener("click", () => {
      if (busy) return;
      matrix = M().cloneMat(initial);
      factor = 1;
      ledger.length = 0;
      history.length = 0;
      focus = { row: 1, col: 0, text: "先利用第 1 行，把 a₂₁ 消成 0。" };
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

    window.addEventListener("resize", () => drawPivotArrow(isUpperTriangular(matrix)), { signal, passive: true });
    render();
    syncLocks();
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
          <div class="ch2-lab-head"><h3>造零路线 · 两步到上三角</h3><p>按“下一步”逐个消去主对角线下方的元：箭头从主元指向要消去的元，旁边写着所乘的倍数。形成上三角后，读对角线乘积。</p></div>
          <div data-elim-gate></div>
          <div class="ch2-lab-grid ch2-elimination-layout">
            <div class="ch2-matrix-box">
              <div class="ch2-pivot-wrap"><table class="ch2-matrix-table is-static" data-mat-table aria-label="三阶计算策略矩阵"></table><svg class="ch2-pivot-arrow" data-pivot-arrow aria-hidden="true"></svg></div>
              <div class="ch2-operation-line"><span>当前目标</span><strong data-current-operation></strong></div>
              <div class="ch2-toolbar">
                <button type="button" class="is-primary" data-op-next>下一步：消去 a₂₁</button>
                <button type="button" data-op-undo>上一步</button>
                <button type="button" data-op-demo>自动播放</button>
                <button type="button" data-op-reset>重置</button>
              </div>
              <div class="ch2-toolbar ch2-elim-compare"><span>对照：别的行变换怎样改 det</span>
                <button type="button" data-op-swap>交换 R₁、R₂</button>
                <button type="button" data-op-scale>R₂ ×2</button>
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
