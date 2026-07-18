/* Chapter 2 interaction redesign — sections 5–8. */
(() => {
  const { M, tex } = window.Ch2PresentationUtils;
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, M().reducedMotion() ? 0 : ms));

  function matrixHtml(matrix, digits = 3) {
    return tex(`\\begin{bmatrix}${matrix.map((row) => row.map((value) => M().formatNum(value, digits)).join("&")).join("\\\\")}\\end{bmatrix}`);
  }

  function setActiveButtons(root, selector, active) {
    root.querySelectorAll(selector).forEach((button) => {
      const isActive = button === active;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  // §5 — guided determinant calculation.
  function mountCalculationStudio(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const initial = [[2, 1, 0], [1, 3, 1], [0, 2, 1]];
    let matrix = M().cloneMat(initial);
    let factor = 1;
    let stage = 0;
    let busy = false;
    let currentOperation = "先读结构：主对角线下方还有两个非零元素需要消去。";
    const ledger = [];
    const history = [];

    function isUpperTriangular(value) {
      for (let row = 1; row < value.length; row += 1) {
        for (let col = 0; col < row; col += 1) {
          if (Math.abs(value[row][col]) > 1e-8) return false;
        }
      }
      return true;
    }

    function snapshot() {
      history.push({ matrix: M().cloneMat(matrix), factor, stage, currentOperation, ledger: ledger.slice() });
    }

    function highlightClass(row, col) {
      const classes = ["cell"];
      if (isUpperTriangular(matrix) && row === col) classes.push("is-diagonal");
      if (stage === 0 && row === 1 && col === 0) classes.push("is-target");
      if (stage === 0 && row === 0 && col === 0) classes.push("is-pivot");
      if (stage === 1 && row === 2 && col === 1) classes.push("is-target");
      if (stage === 1 && row === 1 && col === 1) classes.push("is-pivot");
      if ((stage >= 1 && row === 1 && col === 0) || (stage >= 2 && row === 2 && col === 1)) classes.push("is-new-zero");
      return classes.join(" ");
    }

    function render({ pulse = false } = {}) {
      const grid = root.querySelector("[data-mat-table]");
      grid.innerHTML = matrix.map((row, rowIndex) => row.map((value, colIndex) => `<span class="${highlightClass(rowIndex, colIndex)}${pulse ? " is-updated" : ""}">${M().formatNum(value, 3)}</span>`).join("")).join("");
      const current = M().determinant(matrix);
      const original = Math.abs(factor) < M().EPS ? NaN : current / factor;
      const triangular = isUpperTriangular(matrix);
      root.querySelector("[data-cur]").textContent = M().formatNum(current, 4);
      root.querySelector("[data-factor]").textContent = M().formatNum(factor, 4);
      root.querySelector("[data-orig]").textContent = M().formatNum(original, 4);
      root.querySelector("[data-step-count]").textContent = String(ledger.length);
      root.querySelector("[data-current-operation]").textContent = currentOperation;
      root.querySelector("[data-ledger]").innerHTML = ledger.length ? ledger.map((line) => `<li>${line}</li>`).join("") : "<li>尚未开始操作</li>";
      const status = root.querySelector("[data-triangle-status]");
      if (triangular) {
        const product = matrix[0][0] * matrix[1][1] * matrix[2][2];
        status.textContent = `已经是上三角：当前 det = 对角线乘积 = ${M().formatNum(product, 4)}；再除以累计倍率即可恢复原 det。`;
        status.className = "ch2-v2-status is-positive";
        stage = 3;
      } else {
        status.textContent = stage === 0
          ? "目标 1：用第一行消去 a₂₁。"
          : stage === 1
            ? "目标 2：用第二行消去 a₃₂。"
            : "继续观察主对角线下方的非零元素。";
        status.className = "ch2-v2-status";
      }
      root.querySelectorAll("[data-step-marker]").forEach((marker) => {
        const index = Number(marker.dataset.stepMarker);
        marker.classList.toggle("is-done", index < stage);
        marker.classList.toggle("is-active", index === Math.min(stage, 3));
      });
      root.querySelector("[data-op-undo]").disabled = busy || history.length === 0;
      if (pulse && !M().reducedMotion()) setTimeout(() => grid.querySelectorAll(".is-updated").forEach((cell) => cell.classList.remove("is-updated")), 430);
    }

    async function apply(next, multiplier, line, nextStage, allowBusy = false) {
      if (busy && !allowBusy) return;
      snapshot();
      matrix = next;
      factor *= multiplier;
      currentOperation = line;
      ledger.push(`${line}　行列式倍率 ×${M().formatNum(multiplier, 3)}`);
      stage = nextStage;
      render({ pulse: true });
      await pause(340);
    }

    const operations = {
      eliminateFirst: (allowBusy = false) => {
        const next = M().cloneMat(matrix);
        if (Math.abs(next[0][0]) < M().EPS) return Promise.resolve();
        const coefficient = next[1][0] / next[0][0];
        next[1] = next[1].map((value, col) => value - coefficient * next[0][col]);
        return apply(next, 1, `R₂ ← R₂ − (${M().formatNum(coefficient, 3)})R₁，制造 a₂₁=0`, 1, allowBusy);
      },
      eliminateSecond: (allowBusy = false) => {
        const next = M().cloneMat(matrix);
        if (Math.abs(next[1][1]) < M().EPS) return Promise.resolve();
        const coefficient = next[2][1] / next[1][1];
        next[2] = next[2].map((value, col) => value - coefficient * next[1][col]);
        return apply(next, 1, `R₃ ← R₃ − (${M().formatNum(coefficient, 3)})R₂，制造 a₃₂=0`, 2, allowBusy);
      },
      swap: (allowBusy = false) => apply([matrix[1].slice(), matrix[0].slice(), matrix[2].slice()], -1, "R₁ ↔ R₂：交换两行", stage, allowBusy),
      scale: (allowBusy = false) => {
        const next = M().cloneMat(matrix);
        next[1] = next[1].map((value) => value * 2);
        return apply(next, 2, "R₂ ← 2R₂：第二行整体倍乘 2", stage, allowBusy);
      },
    };

    root.querySelector("[data-op-add]").addEventListener("click", () => operations.eliminateFirst(), { signal });
    root.querySelector("[data-op-add2]").addEventListener("click", () => operations.eliminateSecond(), { signal });
    root.querySelector("[data-op-swap]").addEventListener("click", () => operations.swap(), { signal });
    root.querySelector("[data-op-scale]").addEventListener("click", () => operations.scale(), { signal });
    root.querySelector("[data-op-undo]").addEventListener("click", () => {
      if (busy || !history.length) return;
      const previous = history.pop();
      matrix = previous.matrix;
      factor = previous.factor;
      stage = previous.stage;
      currentOperation = previous.currentOperation;
      ledger.splice(0, ledger.length, ...previous.ledger);
      render({ pulse: true });
    }, { signal });
    root.querySelector("[data-op-reset]").addEventListener("click", () => {
      if (busy) return;
      matrix = M().cloneMat(initial);
      factor = 1;
      stage = 0;
      history.length = 0;
      ledger.length = 0;
      currentOperation = "先读结构：主对角线下方还有两个非零元素需要消去。";
      render({ pulse: true });
    }, { signal });
    root.querySelector("[data-op-demo]").addEventListener("click", async () => {
      if (busy) return;
      matrix = M().cloneMat(initial);
      factor = 1;
      stage = 0;
      history.length = 0;
      ledger.length = 0;
      currentOperation = "自动演示：先锁定 a₂₁。";
      render({ pulse: true });
      busy = true;
      root.querySelectorAll("button").forEach((button) => { button.disabled = true; });
      try {
        await operations.eliminateFirst(true);
        await operations.eliminateSecond(true);
      } finally {
        busy = false;
        root.querySelectorAll("button").forEach((button) => { button.disabled = false; });
        render();
      }
    }, { signal });

    render();
    return () => controller.abort();
  }

  window.extendChapter2Renderer("determinant-computation", {
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab ch2-v2-lab">
          <div class="ch2-v2-head"><h3>把“算行列式”变成一条有目标的消元路线</h3><p>画面只强调当前主元与下一个要消掉的元素。每完成一步，目标从 a₂₁ 移到 a₃₂；形成上三角后再读取对角线乘积。</p></div>
          <div class="ch2-v2-task"><strong>挑战</strong><span>先只用两次倍加完成三角化。完成后再尝试交换或倍乘，观察为什么必须把倍率记在账本中。</span></div>
          <div class="ch2-v2-stepper" aria-label="计算路线">
            <span class="is-active" data-step-marker="0">1 读结构</span><span data-step-marker="1">2 消去 a₂₁</span><span data-step-marker="2">3 消去 a₃₂</span><span data-step-marker="3">4 读对角线</span>
          </div>
          <div class="ch2-v2-toolbar">
            <button type="button" data-op-add>消去 a₂₁</button>
            <button type="button" data-op-add2>消去 a₃₂</button>
            <button type="button" data-op-demo>播放两步三角化</button>
            <button type="button" data-op-swap>交换 R₁、R₂</button>
            <button type="button" data-op-scale>R₂ ×2</button>
            <button type="button" data-op-undo>撤销</button>
            <button type="button" data-op-reset>重置</button>
          </div>
          <div class="ch2-v2-workspace">
            <div class="ch2-v2-matrix-scene">
              <div class="ch2-v2-matrix-grid" data-mat-table aria-label="三阶行列式消元矩阵"></div>
            </div>
            <aside class="ch2-v2-inspector">
              <div class="ch2-v2-equation"><span>当前操作</span><strong data-current-operation></strong></div>
              <div data-triangle-status class="ch2-v2-status"></div>
              <div class="ch2-v2-result-flow"><div><span>当前 det</span><strong data-cur></strong></div><i>÷</i><div><span>累计倍率</span><strong data-factor></strong></div></div>
              <div class="ch2-v2-result-flow"><div><span>恢复原 det</span><strong data-orig></strong></div><i>·</i><div><span>已走步骤</span><strong data-step-count></strong></div></div>
              <div class="ch2-v2-ledger"><strong>倍率账本</strong><ol data-ledger></ol></div>
            </aside>
          </div>
        </div>`;
      return mountCalculationStudio(root);
    },
  });

  // §6 — minors and cofactor expansion.
  function mountCofactorStudio(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const matrix = [[1, 2, 0], [0, 3, 0], [4, 5, 6]];
    let active = { row: 1, col: 1 };
    let route = { type: "row", index: 1 };
    let tab = "minor";

    function cofactor(row, col) {
      const minorMatrix = M().minorMatrix(matrix, row, col);
      const minor = M().det2(minorMatrix);
      const sign = (row + col) % 2 === 0 ? 1 : -1;
      return { minorMatrix, minor, sign, cofactor: sign * minor };
    }

    function expansion(type, index) {
      const allItems = [];
      let total = 0;
      for (let cursor = 0; cursor < 3; cursor += 1) {
        const row = type === "row" ? index : cursor;
        const col = type === "row" ? cursor : index;
        const element = matrix[row][col];
        const cof = cofactor(row, col);
        const contribution = element * cof.cofactor;
        allItems.push({ row, col, element, ...cof, contribution });
        total += contribution;
      }
      return { allItems, nonzero: allItems.filter((item) => Math.abs(item.element) > M().EPS), total };
    }

    function renderMinorBoard() {
      const board = root.querySelector("[data-cofactor-board]");
      board.style.setProperty("--strike-row", active.row);
      board.style.setProperty("--strike-col", active.col);
      const grid = root.querySelector("[data-cof-table]");
      grid.innerHTML = matrix.map((row, rowIndex) => row.map((value, colIndex) => {
        const selected = rowIndex === active.row && colIndex === active.col;
        const deleted = rowIndex === active.row || colIndex === active.col;
        const remaining = !deleted;
        return `<button type="button" class="${selected ? "is-selected " : ""}${deleted ? "is-deleted " : ""}${remaining ? "is-remaining" : ""}" data-r="${rowIndex}" data-c="${colIndex}" ${deleted && !selected ? "disabled" : ""} aria-label="元素 a${rowIndex + 1}${colIndex + 1}，数值 ${value}">${value}</button>`;
      }).join("")).join("");
      grid.querySelectorAll("button:not(:disabled)").forEach((button) => button.addEventListener("click", () => {
        active = { row: Number(button.dataset.r), col: Number(button.dataset.c) };
        render();
      }, { signal }));

      const selected = cofactor(active.row, active.col);
      root.querySelector("[data-selected-position]").innerHTML = tex(`a_{${active.row + 1}${active.col + 1}}`);
      root.querySelector("[data-minor-grid]").innerHTML = selected.minorMatrix.flat().map((value) => `<span>${value}</span>`).join("");
      root.querySelector("[data-minor-value]").textContent = M().formatNum(selected.minor, 3);
      root.querySelector("[data-position-sign]").textContent = selected.sign > 0 ? "+1" : "−1";
      root.querySelector("[data-cofactor-value]").textContent = M().formatNum(selected.cofactor, 3);
      root.querySelectorAll("[data-sign-cell]").forEach((cell) => {
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        cell.classList.toggle("is-active", row === active.row && col === active.col);
      });
      root.querySelector("[data-minor-explanation]").textContent = `横线删去第 ${active.row + 1} 行，竖线删去第 ${active.col + 1} 列；剩下四格按原相对位置组成余子矩阵。`;
    }

    function renderRoutes() {
      const routes = [];
      for (const type of ["row", "col"]) {
        for (let index = 0; index < 3; index += 1) {
          const result = expansion(type, index);
          routes.push({ type, index, cost: result.nonzero.length });
        }
      }
      const routeBar = root.querySelector("[data-route-list]");
      routeBar.innerHTML = routes.map((item) => `<button type="button" class="${route.type === item.type && route.index === item.index ? "is-active" : ""}" data-route-type="${item.type}" data-route-index="${item.index}" aria-pressed="${route.type === item.type && route.index === item.index}">${item.type === "row" ? `第 ${item.index + 1} 行` : `第 ${item.index + 1} 列`} · ${item.cost} 项</button>`).join("");
      routeBar.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
        route = { type: button.dataset.routeType, index: Number(button.dataset.routeIndex) };
        renderExpansion();
      }, { signal }));
    }

    function renderExpansionMatrix() {
      const grid = root.querySelector("[data-expansion-matrix]");
      grid.innerHTML = matrix.map((row, rowIndex) => row.map((value, colIndex) => {
        const onRoute = route.type === "row" ? rowIndex === route.index : colIndex === route.index;
        return `<span class="cell${onRoute ? " is-selected" : ""}">${value}</span>`;
      }).join("")).join("");
    }

    function renderExpansion() {
      renderRoutes();
      renderExpansionMatrix();
      const result = expansion(route.type, route.index);
      const omitted = result.allItems.length - result.nonzero.length;
      root.querySelector("[data-route-title]").textContent = route.type === "row" ? `沿第 ${route.index + 1} 行展开` : `沿第 ${route.index + 1} 列展开`;
      root.querySelector("[data-route-cost]").textContent = `${result.nonzero.length} 个非零贡献`;
      root.querySelector("[data-expand]").innerHTML = result.allItems.map((item) => `
        <div class="ch2-v2-contribution${Math.abs(item.element) < M().EPS ? " is-zero" : ""}">
          <span>${tex(`a_{${item.row + 1}${item.col + 1}}C_{${item.row + 1}${item.col + 1}}`)} = ${item.element} × ${M().formatNum(item.cofactor, 3)}</span>
          <strong>${M().formatNum(item.contribution, 3)}</strong>
        </div>`).join("");
      root.querySelector("[data-true]").textContent = M().formatNum(result.total, 3);
      root.querySelector("[data-omitted]").textContent = omitted ? `其中 ${omitted} 项因行列元素为 0，可以直接省略。` : "这一条路线没有零项可省略。";
    }

    function renderTabs() {
      root.querySelector("[data-minor-panel]").hidden = tab !== "minor";
      root.querySelector("[data-expansion-panel]").hidden = tab !== "expansion";
      root.querySelectorAll("[data-cofactor-tab]").forEach((button) => {
        const activeTab = button.dataset.cofactorTab === tab;
        button.classList.toggle("is-active", activeTab);
        button.setAttribute("aria-pressed", String(activeTab));
      });
    }

    function render() {
      renderMinorBoard();
      renderExpansion();
      renderTabs();
    }

    root.querySelectorAll("[data-cofactor-tab]").forEach((button) => button.addEventListener("click", () => {
      tab = button.dataset.cofactorTab;
      renderTabs();
    }, { signal }));
    root.querySelector("[data-minor-reset]").addEventListener("click", () => {
      active = { row: 1, col: 1 };
      renderMinorBoard();
    }, { signal });

    render();
    return () => controller.abort();
  }

  window.extendChapter2Renderer("cofactor-expansion", {
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab ch2-v2-lab">
          <div class="ch2-v2-head"><h3>先看清“删行删列”，再讨论沿哪一行展开</h3><p>两个动作分成两个标签页：第一步只理解一个代数余子式怎样产生；第二步再比较六条展开路线的计算量。</p></div>
          <div class="ch2-v2-tab-bar" role="group" aria-label="余子式实验模式">
            <button type="button" class="is-active" data-cofactor-tab="minor" aria-pressed="true">1 看余子式</button>
            <button type="button" data-cofactor-tab="expansion" aria-pressed="false">2 看展开路线</button>
          </div>

          <section data-minor-panel>
            <div class="ch2-v2-task"><strong>点击一个元素</strong><span>细横线划掉它所在的行，细竖线划掉它所在的列。被划掉的格子会弱化并暂时不可选，剩下四格立即组成右侧余子矩阵。</span></div>
            <div class="ch2-v2-toolbar" style="margin:12px 0"><button type="button" data-minor-reset>回到中心元素 a₂₂</button></div>
            <div class="ch2-v2-cofactor-flow">
              <div class="ch2-v2-cofactor-board" data-cofactor-board>
                <div class="ch2-v2-matrix-grid" data-cof-table aria-label="点击元素并划去对应行列"></div>
                <span class="ch2-v2-strike-row" aria-hidden="true"></span>
                <span class="ch2-v2-strike-col" aria-hidden="true"></span>
              </div>
              <div class="ch2-v2-flow-arrow" aria-hidden="true">→</div>
              <aside class="ch2-v2-minor-result">
                <div><span class="ch2-v2-panel-label">选中元素</span><h3 data-selected-position></h3></div>
                <p data-minor-explanation></p>
                <div class="ch2-v2-mini-matrix" data-minor-grid aria-label="删行删列后得到的余子矩阵"></div>
                <div class="ch2-v2-result-flow"><div><span>余子式 Mij</span><strong data-minor-value></strong></div><i>×</i><div><span>位置符号</span><strong data-position-sign></strong></div></div>
                <div class="ch2-v2-status is-positive">代数余子式 Cij = <strong data-cofactor-value></strong></div>
                <div class="ch2-v2-sign-board" aria-label="代数余子式符号棋盘">
                  ${Array.from({ length: 9 }, (_, index) => { const row = Math.floor(index / 3); const col = index % 3; const sign = (row + col) % 2 === 0 ? "+" : "−"; return `<span data-sign-cell data-row="${row}" data-col="${col}">${sign}</span>`; }).join("")}
                </div>
              </aside>
            </div>
          </section>

          <section data-expansion-panel hidden>
            <div class="ch2-v2-task"><strong>路线竞速</strong><span>选择一行或一列。画面直接突出展开方向，并把三个带符号贡献逐项列出；零元素对应项会弱化。</span></div>
            <div class="ch2-v2-route-bar" data-route-list style="margin:12px 0"></div>
            <div class="ch2-v2-expansion-grid">
              <div class="ch2-v2-matrix-scene"><div class="ch2-v2-matrix-grid" data-expansion-matrix></div></div>
              <aside class="ch2-v2-inspector">
                <div class="ch2-v2-equation"><span data-route-title></span><strong data-route-cost></strong></div>
                <div class="ch2-v2-contribution-list" data-expand></div>
                <div class="ch2-v2-result-flow"><div><span>展开和</span><strong data-true></strong></div><i>=</i><div><span>原行列式</span><strong>18</strong></div></div>
                <div class="ch2-v2-status" data-omitted></div>
              </aside>
            </div>
          </section>
        </div>`;
      return mountCofactorStudio(root);
    },
  });

  // §7 — Cramer's rule as replacement-column flow.
  function mountCramerStudio(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const state = { a11: 2, a12: 1, a21: 1, a22: 3, b1: 3, b2: 4 };
    let displayed = { ...state };
    let animating = false;
    const canvas = root.querySelector("[data-cramer-canvas]");

    function values(current) {
      const A = [[current.a11, current.a12], [current.a21, current.a22]];
      const b = [current.b1, current.b2];
      const A1 = [[current.b1, current.a12], [current.b2, current.a22]];
      const A2 = [[current.a11, current.b1], [current.a21, current.b2]];
      return { A, b, A1, A2, D: M().det2(A), D1: M().det2(A1), D2: M().det2(A2) };
    }

    function cameraFor(A, b) {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width || 700);
      const height = Math.max(1, rect.height || 470);
      const points = [[0, 0], [1, 0], [0, 1], [1, 1], [A[0][0], A[1][0]], [A[0][1], A[1][1]], [A[0][0] + A[0][1], A[1][0] + A[1][1]], b];
      const minX = Math.min(...points.map((point) => point[0]), -0.4);
      const maxX = Math.max(...points.map((point) => point[0]), 0.8);
      const minY = Math.min(...points.map((point) => point[1]), -0.4);
      const maxY = Math.max(...points.map((point) => point[1]), 0.8);
      const pad = 58;
      const scale = M().clamp(Math.min((width - pad * 2) / Math.max(1, maxX - minX), (height - pad * 2) / Math.max(1, maxY - minY)), 22, Math.min(width, height) * 0.34);
      return { scale, origin: { x: width * 0.48 - ((minX + maxX) / 2) * scale, y: height * 0.55 + ((minY + maxY) / 2) * scale } };
    }

    function draw(current) {
      const { A, b } = values(current);
      const camera = cameraFor(A, b);
      const view = M().drawTransformScene(canvas, A, { firstLabel: "a₁", secondLabel: "a₂", caption: "b 要被表示成 x₁a₁+x₂a₂", ...camera });
      const ctx = canvas.getContext("2d");
      const palette = M().getPalette();
      const target = { x: view.origin.x + b[0] * view.scale, y: view.origin.y - b[1] * view.scale };
      M().drawArrow(ctx, view.origin, target, palette.accentStrong, 3.5);
      ctx.save();
      ctx.fillStyle = palette.text;
      ctx.font = "700 13px system-ui, sans-serif";
      ctx.fillText("b", target.x + 9, target.y - 8);
      ctx.restore();
    }

    function sync(current) {
      const { A, b, A1, A2, D, D1, D2 } = values(current);
      root.querySelector("[data-a-matrix]").innerHTML = matrixHtml(A, 2);
      root.querySelector("[data-a1-matrix]").innerHTML = matrixHtml(A1, 2);
      root.querySelector("[data-a2-matrix]").innerHTML = matrixHtml(A2, 2);
      root.querySelector("[data-d]").textContent = M().formatNum(D, 3);
      root.querySelector("[data-d1]").textContent = M().formatNum(D1, 3);
      root.querySelector("[data-d2]").textContent = M().formatNum(D2, 3);
      const scale = Math.max(1, ...A.flat().map((value) => Math.abs(value)));
      const exactTolerance = 1e-8 * scale * scale;
      const relativeArea = Math.abs(D) / (scale * scale);
      const solution = root.querySelector("[data-sol]");
      const residual = root.querySelector("[data-residual]");
      if (Math.abs(D) > exactTolerance) {
        const x1 = D1 / D;
        const x2 = D2 / D;
        const reconstructed = [A[0][0] * x1 + A[0][1] * x2, A[1][0] * x1 + A[1][1] * x2];
        const error = Math.hypot(reconstructed[0] - b[0], reconstructed[1] - b[1]);
        const nearSingular = relativeArea < 0.035;
        root.querySelector("[data-x1]").textContent = M().formatNum(x1, 3);
        root.querySelector("[data-x2]").textContent = M().formatNum(x2, 3);
        solution.textContent = nearSingular
          ? "理论上仍有唯一解，但两列接近共线；分母很小，会放大输入扰动。"
          : "唯一解：两个面积比正好给出 b 在基底 a₁、a₂ 下的坐标。";
        solution.className = nearSingular ? "ch2-v2-status is-zero" : "ch2-v2-status is-positive";
        residual.textContent = `重构 x₁a₁+x₂a₂ = (${M().formatNum(reconstructed[0], 3)}, ${M().formatNum(reconstructed[1], 3)})，与 b 的误差 ${M().formatNum(error, 6)}。`;
        residual.className = "ch2-v2-status is-positive";
      } else {
        const classification = M().classifySystem2(A, b);
        root.querySelector("[data-x1]").textContent = "—";
        root.querySelector("[data-x2]").textContent = "—";
        solution.textContent = classification.kind === "infinite"
          ? "D=0 · 无穷多解：b 仍在塌缩后的列空间中，但表示不唯一。"
          : "D=0 · 无解：b 不在塌缩后的列空间中，任何列组合都到不了它。";
        solution.className = classification.kind === "infinite" ? "ch2-v2-status is-zero" : "ch2-v2-status is-negative";
        residual.textContent = classification.kind === "infinite" ? "列组合能够到达 b，但必须改用消元描述自由变量。" : "列空间只有一条方向，而 b 离开了这条方向。";
        residual.className = solution.className;
      }
      ["a11", "a12", "a21", "a22", "b1", "b2"].forEach((key) => {
        const input = root.querySelector(`[data-k="${key}"]`);
        const output = root.querySelector(`[data-v="${key}"]`);
        input.value = String(current[key]);
        output.textContent = M().formatNum(current[key], 2);
      });
      draw(current);
    }

    async function goTo(target) {
      if (animating) return;
      animating = true;
      root.querySelectorAll("button, input").forEach((control) => { control.disabled = true; });
      const from = { ...displayed };
      const keys = Object.keys(from);
      try {
        await M().animateTo(canvas, 0, 1, 650, (t) => {
          const current = {};
          keys.forEach((key) => { current[key] = M().lerp(from[key], target[key], M().easeInOutCubic(t)); });
          displayed = current;
          sync(current);
        });
        Object.assign(state, target);
        displayed = { ...target };
        sync(displayed);
      } finally {
        animating = false;
        root.querySelectorAll("button, input").forEach((control) => { control.disabled = false; });
      }
    }

    root.querySelectorAll("[data-k]").forEach((input) => input.addEventListener("input", () => {
      if (animating) return;
      state[input.dataset.k] = Number(input.value);
      displayed = { ...state };
      sync(displayed);
    }, { signal }));
    const presets = {
      ex: { a11: 2, a12: 1, a21: 1, a22: 3, b1: 3, b2: 4 },
      near: { a11: 1, a12: 2, a21: 1.02, a22: 2.02, b1: 3, b2: 3.04 },
      sing: { a11: 1, a12: 2, a21: 2, a22: 4, b1: 3, b2: 6 },
      none: { a11: 1, a12: 2, a21: 2, a22: 4, b1: 1, b2: 0 },
    };
    root.querySelector("[data-cramer-ex]").addEventListener("click", (event) => { setActiveButtons(root, "[data-cramer-ex], [data-cramer-near], [data-cramer-sing], [data-cramer-none]", event.currentTarget); goTo(presets.ex); }, { signal });
    root.querySelector("[data-cramer-near]").addEventListener("click", (event) => { setActiveButtons(root, "[data-cramer-ex], [data-cramer-near], [data-cramer-sing], [data-cramer-none]", event.currentTarget); goTo(presets.near); }, { signal });
    root.querySelector("[data-cramer-sing]").addEventListener("click", (event) => { setActiveButtons(root, "[data-cramer-ex], [data-cramer-near], [data-cramer-sing], [data-cramer-none]", event.currentTarget); goTo(presets.sing); }, { signal });
    root.querySelector("[data-cramer-none]").addEventListener("click", (event) => { setActiveButtons(root, "[data-cramer-ex], [data-cramer-near], [data-cramer-sing], [data-cramer-none]", event.currentTarget); goTo(presets.none); }, { signal });
    window.addEventListener("resize", () => document.body.contains(canvas) && sync(displayed), { signal, passive: true });

    sync(displayed);
    return () => {
      controller.abort();
      M().cancelAnim(canvas);
    };
  }

  window.extendChapter2Renderer("cramer-rule", {
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab ch2-v2-lab">
          <div class="ch2-v2-head"><h3>把替换列法画成三条并行的面积计算</h3><p>左侧只画一个坐标空间：a₁、a₂ 围出原平行四边形，绿色 b 是要表示的目标。右侧依次比较 A、A₁、A₂，而不是把六个滑杆和三张矩阵同时塞进第一眼。</p></div>
          <div class="ch2-v2-task"><strong>先看唯一解</strong><span>默认例子中 b=a₁+a₂。核对 D₁/D 与 D₂/D 都等于 1，再进入接近奇异、无穷多解和无解三个边界。</span></div>
          <div class="ch2-v2-preset-bar">
            <button type="button" class="is-active" data-cramer-ex>唯一解</button>
            <button type="button" data-cramer-near>接近奇异</button>
            <button type="button" data-cramer-sing>D=0 · 无穷多解</button>
            <button type="button" data-cramer-none>D=0 · 无解</button>
          </div>
          <div class="ch2-v2-workspace">
            <div class="ch2-v2-stage">
              <div class="ch2-v2-stage-badge">寻找 b 在列基底中的坐标</div>
              <canvas data-cramer-canvas aria-label="系数列向量和常数向量的坐标画布"></canvas>
              <div class="ch2-v2-stage-legend"><span>a₁、a₂</span><span>b</span></div>
            </div>
            <aside class="ch2-v2-inspector">
              <div class="ch2-v2-cramer-flow">
                <div class="ch2-v2-cramer-row"><span>A</span><strong data-a-matrix></strong><b>D = <i data-d></i></b></div>
                <div class="ch2-v2-cramer-row"><span>A₁</span><strong data-a1-matrix></strong><b>D₁ = <i data-d1></i></b></div>
                <div class="ch2-v2-cramer-row"><span>A₂</span><strong data-a2-matrix></strong><b>D₂ = <i data-d2></i></b></div>
              </div>
              <div class="ch2-v2-solution-formula">
                <div><span class="ch2-v2-panel-label">x₁ = D₁/D</span><strong data-x1></strong></div>
                <div><span class="ch2-v2-panel-label">x₂ = D₂/D</span><strong data-x2></strong></div>
              </div>
              <div data-sol class="ch2-v2-status" aria-live="polite"></div>
              <div data-residual class="ch2-v2-status" aria-live="polite"></div>
              <details class="ch2-v2-details">
                <summary>精确调节 A 与 b</summary>
                <div class="ch2-v2-control-grid">
                  ${["a11", "a12", "a21", "a22", "b1", "b2"].map((key) => `<label><span>${key}</span><input data-k="${key}" type="range" min="-6" max="6" step="0.1" aria-label="${key}" /><output data-v="${key}"></output></label>`).join("")}
                </div>
              </details>
            </aside>
          </div>
        </div>`;
      return mountCramerStudio(root);
    },
  });

  // §8 — generalized Laplace pairing and product rule.
  function mountLaplaceStudio(root) {
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
      const pairStrip = root.querySelector("[data-pair-list]");
      pairStrip.innerHTML = all.map((item, index) => `<button type="button" class="${index === selected ? "is-active" : ""}" data-pair="${index}" aria-pressed="${index === selected}">选列 ${item.cols.map((value) => value + 1).join("")} <strong>${M().formatNum(item.term, 2)}</strong></button>`).join("");
      pairStrip.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
        selected = Number(button.dataset.pair);
        render();
      }, { signal }));
      const item = all[selected];
      const grid = root.querySelector("[data-laplace-table]");
      grid.innerHTML = matrix.map((row, rowIndex) => row.map((value, colIndex) => {
        const inSelected = rows.includes(rowIndex) && item.cols.includes(colIndex);
        const inComplement = !rows.includes(rowIndex) && item.complementCols.includes(colIndex);
        const muted = !inSelected && !inComplement;
        return `<span class="cell${inSelected ? " is-selected" : ""}${inComplement ? " is-complement" : ""}${muted ? " is-muted" : ""}">${value}</span>`;
      }).join("")).join("");
      root.querySelector("[data-pair-minor-matrix]").innerHTML = matrixHtml(item.minorMatrix);
      root.querySelector("[data-pair-complement-matrix]").innerHTML = matrixHtml(item.complementMatrix);
      root.querySelector("[data-pair-minor]").textContent = M().formatNum(item.minor, 3);
      root.querySelector("[data-pair-sign]").textContent = item.sign > 0 ? "+1" : "−1";
      root.querySelector("[data-pair-complement]").textContent = M().formatNum(item.complement, 3);
      root.querySelector("[data-pair-term]").textContent = M().formatNum(item.term, 3);
      root.querySelector("[data-pair-sum]").textContent = M().formatNum(total, 3);
      root.querySelector("[data-pair-det]").textContent = M().formatNum(M().determinant(matrix), 3);
      root.querySelector("[data-pair-explain]").textContent = `固定行 1、2，选择列 ${item.cols.map((value) => value + 1).join("、")}；其余列 ${item.complementCols.map((value) => value + 1).join("、")} 自动成为互补列。`;
    }

    render();
    return () => controller.abort();
  }

  function mountProductStudio(root) {
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

    function setFinal(A, B, AB) {
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
      status.className = Math.abs(dAB - dA * dB) < 1e-8 ? "ch2-v2-status is-positive" : "ch2-v2-status is-negative";
    }

    function paint(A, B) {
      const I = [[1, 0], [0, 1]];
      const AB = M().mul2(A, B);
      M().drawTransformScene(cI, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "单位形", pad: 34 });
      M().drawTransformScene(cB, B, { firstLabel: "Be₁", secondLabel: "Be₂", caption: "第一阶段：B", pad: 34 });
      M().drawTransformScene(cAB, AB, { firstLabel: "ABe₁", secondLabel: "ABe₂", caption: "第二阶段：A(B·)", pad: 34 });
      setFinal(A, B, AB);
    }

    async function play(A, B) {
      if (busy) return;
      busy = true;
      current = { A, B };
      root.querySelectorAll("[data-prod-preset], [data-prod-replay]").forEach((button) => { button.disabled = true; });
      const I = [[1, 0], [0, 1]];
      const AB = M().mul2(A, B);
      const status = root.querySelector("[data-rule-status]");
      try {
        M().drawTransformScene(cI, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "单位形", pad: 34 });
        M().drawTransformScene(cB, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "准备作用 B", pad: 34 });
        M().drawTransformScene(cAB, B, { firstLabel: "Be₁", secondLabel: "Be₂", caption: "第二阶段真实起点：B", pad: 34 });
        status.textContent = "第一步：单位形正在经过 B。右侧已经停在第二步的真实起点 B。";
        status.className = "ch2-v2-status";
        await M().animateMatrix(cB, B, { duration: 720, drawOptions: { firstLabel: "Be₁", secondLabel: "Be₂", caption: "I → B", pad: 34 } });
        status.textContent = "第二步：保持 B 的结果，再作用 A；右侧从 B 连续变为 AB。";
        await M().animateMatrix(cAB, AB, { duration: 800, drawOptions: { firstLabel: "ABe₁", secondLabel: "ABe₂", caption: "B → AB", pad: 34 } });
        paint(A, B);
      } finally {
        busy = false;
        root.querySelectorAll("[data-prod-preset], [data-prod-replay]").forEach((button) => { button.disabled = false; });
      }
    }

    root.querySelectorAll("[data-prod-preset]").forEach((button) => button.addEventListener("click", () => {
      if (busy) return;
      setActiveButtons(root, "[data-prod-preset]", button);
      const preset = presets[button.dataset.prodPreset];
      play(preset.A, preset.B);
    }, { signal }));
    root.querySelector("[data-prod-replay]").addEventListener("click", () => play(current.A, current.B), { signal });
    window.addEventListener("resize", () => document.body.contains(cI) && paint(current.A, current.B), { signal, passive: true });

    paint(current.A, current.B);
    return () => {
      controller.abort();
      [cI, cB, cAB].forEach((canvas) => M().cancelAnim(canvas));
    };
  }

  window.extendChapter2Renderer("laplace-and-product", {
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab ch2-v2-lab">
          <div class="ch2-v2-head"><h3>广义 Laplace：一组子式怎样和互补子式配成一项</h3><p>固定前两行后，只需要选择两列。画面用青色标出所选 2×2 子矩阵，用橙色标出自动确定的互补 2×2 子矩阵，其余格子淡出。</p></div>
          <div class="ch2-v2-task"><strong>浏览六种配对</strong><span>每次只沿一条流水线阅读：所选子式 × 位置符号 × 互补子式 = 本项贡献。最后六项相加得到原 4 阶行列式。</span></div>
          <div class="ch2-v2-pair-strip" data-pair-list></div>
          <div class="ch2-v2-laplace-grid">
            <div class="ch2-v2-laplace-matrix"><div class="ch2-v2-matrix-grid" data-laplace-table aria-label="四阶矩阵中的子式和互补子式"></div></div>
            <aside class="ch2-v2-inspector">
              <div class="ch2-v2-status" data-pair-explain></div>
              <div class="ch2-v2-pipeline">
                <div><span class="ch2-v2-panel-label">所选子矩阵</span><strong data-pair-minor-matrix></strong><b data-pair-minor></b></div>
                <i>×</i>
                <div><span class="ch2-v2-panel-label">位置符号</span><strong data-pair-sign></strong></div>
                <i>×</i>
                <div><span class="ch2-v2-panel-label">互补子矩阵</span><strong data-pair-complement-matrix></strong><b data-pair-complement></b></div>
              </div>
              <div class="ch2-v2-result-flow"><div><span>本项贡献</span><strong data-pair-term></strong></div><i>→</i><div><span>六项和</span><strong data-pair-sum></strong></div></div>
              <div class="ch2-v2-status is-positive">六项和 <strong data-pair-sum></strong> = 原 det <strong data-pair-det></strong></div>
            </aside>
          </div>
        </div>

        <div class="ch2-lab ch2-v2-lab">
          <div class="ch2-v2-head"><h3>乘法规则：同一个图形连续经历 B 和 A</h3><p>三个坐标空间按时间顺序排开。中间不是一张独立示意图，右侧也不是重新从单位形开始；真正的过程是 I → B → AB。</p></div>
          <div class="ch2-v2-task"><strong>比较三个边界</strong><span>先看两次缩放，再看一次镜像、两次镜像和含投影。注意符号怎样相乘，以及任一阶段塌缩后最终 det 为什么一定为 0。</span></div>
          <div class="ch2-v2-preset-bar">
            <button type="button" class="is-active" data-prod-preset="scale">两次缩放</button>
            <button type="button" data-prod-preset="shearScale">剪切后缩放</button>
            <button type="button" data-prod-preset="mirrorRotate">一次镜像</button>
            <button type="button" data-prod-preset="doubleMirror">两次镜像</button>
            <button type="button" data-prod-preset="project">含投影</button>
            <button type="button" data-prod-replay>重播当前过程</button>
          </div>
          <div class="ch2-v2-product-flow">
            <div class="ch2-v2-product-node"><div class="ch2-v2-stage is-compact"><canvas data-c-i aria-label="单位形"></canvas></div><strong>I · 单位形</strong></div>
            <div class="ch2-v2-product-arrow"><span>先作用 B</span><b>→</b></div>
            <div class="ch2-v2-product-node"><div class="ch2-v2-stage is-compact"><canvas data-c-b aria-label="经过 B 的图形"></canvas></div><strong>B · 第一阶段</strong></div>
            <div class="ch2-v2-product-arrow"><span>再作用 A</span><b>→</b></div>
            <div class="ch2-v2-product-node"><div class="ch2-v2-stage is-compact"><canvas data-c-ab aria-label="经过 AB 的图形"></canvas></div><strong>AB · 最终阶段</strong></div>
          </div>
          <div class="ch2-v2-det-line">det(AB) <strong data-dab></strong> = det(A) <strong data-da></strong> × det(B) <strong data-db></strong> = <strong data-prod></strong></div>
          <div class="ch2-v2-status is-positive" data-rule-status aria-live="polite"></div>
        </div>`;
      const cleanLaplace = mountLaplaceStudio(root);
      const cleanProduct = mountProductStudio(root);
      return () => {
        cleanProduct?.();
        cleanLaplace?.();
      };
    },
  });
})();