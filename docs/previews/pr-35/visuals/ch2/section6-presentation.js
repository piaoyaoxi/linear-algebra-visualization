(() => {
  const { M, tex, display, aEntry, formalShell, module, proofSteps, misconception } = window.Ch2PresentationUtils;

  function mountCofactor(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const matrix = [[1, 2, 0], [0, 3, 0], [4, 5, 6]];
    let active = { row: 1, col: 1 };
    let route = { type: "row", index: 1 };

    function cofactor(row, col) {
      const minor = M().minorMatrix(matrix, row, col);
      const minorValue = M().det2(minor);
      const sign = (row + col) % 2 === 0 ? 1 : -1;
      return { minor, minorValue, sign, value: sign * minorValue };
    }

    function expansion(type, index) {
      const allItems = [];
      let total = 0;
      for (let cursor = 0; cursor < 3; cursor += 1) {
        const row = type === "row" ? index : cursor;
        const col = type === "row" ? cursor : index;
        const element = matrix[row][col];
        const cof = cofactor(row, col);
        const contribution = element * cof.value;
        allItems.push({ row, col, element, ...cof, contribution });
        total += contribution;
      }
      return {
        allItems,
        items: allItems.filter((item) => Math.abs(item.element) > M().EPS),
        total,
      };
    }

    function renderMatrix() {
      const table = root.querySelector("[data-cof-table]");
      const cut = root.querySelector("[data-cut-matrix]");
      cut.style.setProperty("--cut-row", `${(active.row + 0.5) * 33.333}%`);
      cut.style.setProperty("--cut-col", `${(active.col + 0.5) * 33.333}%`);
      table.innerHTML = matrix.map((row, rowIndex) => `<tr>${row.map((value, colIndex) => {
        const deleted = rowIndex === active.row || colIndex === active.col;
        const selected = rowIndex === active.row && colIndex === active.col;
        return `<td class="${selected ? "is-selected" : ""}${deleted ? " is-deleted" : ""}"><button type="button" data-r="${rowIndex}" data-c="${colIndex}" aria-label="选择第 ${rowIndex + 1} 行第 ${colIndex + 1} 列元素">${value}</button></td>`;
      }).join("")}</tr>`).join("");
      table.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          active = { row: Number(button.dataset.r), col: Number(button.dataset.c) };
          render();
        }, { signal });
      });
    }

    function renderRoutes() {
      const routes = [];
      for (const type of ["row", "col"]) {
        for (let index = 0; index < 3; index += 1) {
          const result = expansion(type, index);
          routes.push({ type, index, cost: result.items.length });
        }
      }
      const container = root.querySelector("[data-route-list]");
      container.innerHTML = routes.map((item) => `<button type="button" class="${route.type === item.type && route.index === item.index ? "is-active" : ""}" data-route-type="${item.type}" data-route-index="${item.index}">${item.type === "row" ? `第 ${item.index + 1} 行` : `第 ${item.index + 1} 列`} · ${item.cost} 个非零项</button>`).join("");
      container.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          route = { type: button.dataset.routeType, index: Number(button.dataset.routeIndex) };
          render();
        }, { signal });
      });
    }

    function renderExpansionTerms(result) {
      if (!result.items.length) return "<span>所有元素均为 0，因此展开和为 0。</span>";
      return result.items
        .map((item) => `<span>${aEntry(item.row + 1, item.col + 1)}${tex(`C_{${item.row + 1}${item.col + 1}}`)} = ${tex(M().formatNum(item.contribution, 3))}</span>`)
        .join("<br />");
    }

    function render() {
      renderMatrix();
      renderRoutes();
      const selected = cofactor(active.row, active.col);
      root.querySelector("[data-pos]").innerHTML = aEntry(active.row + 1, active.col + 1);
      root.querySelector("[data-mij]").textContent = M().formatNum(selected.minorValue, 3);
      root.querySelector("[data-sign]").textContent = selected.sign > 0 ? "+1" : "−1";
      root.querySelector("[data-cij]").textContent = M().formatNum(selected.value, 3);
      root.querySelector("[data-minor-table]").innerHTML = selected.minor
        .map((line) => `<tr>${line.map((value) => `<td>${value}</td>`).join("")}</tr>`)
        .join("");
      root.querySelector("[data-cut-label]").textContent = `删去第 ${active.row + 1} 行与第 ${active.col + 1} 列`;
      root.querySelectorAll("[data-board] span").forEach((span, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        span.classList.toggle("is-active", row === active.row && col === active.col);
      });
      const result = expansion(route.type, route.index);
      const omitted = result.allItems.length - result.items.length;
      root.querySelector("[data-route-title]").textContent = route.type === "row" ? `沿第 ${route.index + 1} 行展开` : `沿第 ${route.index + 1} 列展开`;
      root.querySelector("[data-expand]").innerHTML = renderExpansionTerms(result);
      root.querySelector("[data-true]").textContent = M().formatNum(result.total, 3);
      root.querySelector("[data-cost]").textContent = `${result.items.length} 个非零余子式`;
      root.querySelector("[data-omitted]").textContent = omitted ? `已省略 ${omitted} 个零元素对应项。` : "本路线没有可省略的零项。";
      M().pulseClass(root.querySelector("[data-cij-card]"));
    }

    const board = root.querySelector("[data-board]");
    board.innerHTML = Array.from({ length: 9 }, (_, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const plus = (row + col) % 2 === 0;
      return `<span class="${plus ? "plus" : "minus"}">${plus ? "+" : "−"}</span>`;
    }).join("");
    render();
    return () => controller.abort();
  }

  defineChapter2Renderer("cofactor-expansion", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "从删行删列到按行列展开",
        "三个对象要严格区分：余子矩阵是矩阵，余子式是它的行列式，代数余子式再加入位置符号。",
        module("01", "代数余子式", "位置符号把每条低阶路径接回原排列符号。", `
          <div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">余子矩阵</span><strong>删去第 i 行与第 j 列</strong><p>得到一个 (n−1) 阶矩阵。</p></article>
            <article class="ch2-def"><span class="kicker">余子式</span><strong>${tex("M_{ij}")}</strong><p>对余子矩阵取行列式，结果是标量。</p></article>
            <article class="ch2-def"><span class="kicker">代数余子式</span><strong>${tex("C_{ij}=(-1)^{i+j}M_{ij}")}</strong><p>棋盘符号由 i+j 的奇偶决定。</p></article>
          </div>
        `) + module("02", "展开公式与路线选择", "结果固定，计算量由所选方向决定。", `
          <div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">按第 i 行</span><strong>${display("\\det(A)=\\sum_{j=1}^{n}a_{ij}C_{ij}")}</strong><p>第 i 行中的每个元素与对应代数余子式配对。</p></article>
            <article class="ch2-def"><span class="kicker">按第 j 列</span><strong>${display("\\det(A)=\\sum_{i=1}^{n}a_{ij}C_{ij}")}</strong><p>优先选择零多的方向，减少需要计算的低阶行列式。</p></article>
          </div>
        `) + module("03", "交叉恒等式为什么等于零", "把一行复制到另一行，再沿被替换行展开。", proofSteps([
          `固定两行 r≠s，考虑和 ${tex("\\sum_j a_{rj}C_{sj}")}。`,
          "构造一个新行列式：把原矩阵第 s 行替换成第 r 行，其余行保持不变。",
          `沿新矩阵第 s 行展开，得到的正是 ${tex("\\sum_j a_{rj}C_{sj}")}。`,
          "新矩阵的第 r、s 行相同，所以其行列式为 0，交叉和也等于 0。",
        ]) + misconception([
          "棋盘符号帮助记忆，定义仍是 (−1)^(i+j)。",
          "一行中出现零只会消去相应项，不会自动使整个行列式为零。",
          "展开式中的负贡献应作为独立带符号项读取，不能把‘+ −’当作新的运算规则。",
        ])),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>余子式 · 删去一行与一列</h3><p>点击元素后，横线与竖线划去对应行列；剩余元素保持相对位置组成余子矩阵。</p></div>
          <div class="ch2-task"><strong>观察任务</strong><span>比较第 2 行与第 3 列的成本，再任选另一条路线核对相同结果。</span></div>
          <div class="ch2-lab-grid ch2-cofactor-top">
            <div class="ch2-matrix-box ch2-cofactor-visual">
              <div class="ch2-cut-matrix" data-cut-matrix>
                <table class="ch2-matrix-table" data-cof-table aria-label="余子式选择矩阵"></table>
                <i class="ch2-cut-line is-row" aria-hidden="true"></i>
                <i class="ch2-cut-line is-col" aria-hidden="true"></i>
              </div>
              <div class="ch2-cofactor-arrow" aria-hidden="true">→</div>
              <div class="ch2-minor-result">
                <span>剩余元素保持相对位置</span>
                <table class="ch2-matrix-table ch2-minor-table" data-minor-table aria-label="余子矩阵"></table>
              </div>
              <strong class="ch2-cut-label" data-cut-label></strong>
              <div class="ch2-sign-board"><span>位置符号</span><div class="ch2-checkerboard" data-board aria-label="代数余子式符号棋盘"></div></div>
            </div>
            <div class="ch2-side">
              <div class="ch2-meter is-2">
                <div class="ch2-meter-card"><strong>选中</strong><span data-pos></span></div>
                <div class="ch2-meter-card"><strong>Mij</strong><span data-mij></span></div>
                <div class="ch2-meter-card"><strong>位置符号</strong><span data-sign></span></div>
                <div class="ch2-meter-card" data-cij-card><strong>Cij</strong><span data-cij></span></div>
              </div>
              <div class="ch2-note">先在左侧任选元素，读取“余子矩阵 → 余子式 → 代数余子式”的对应关系。</div>
            </div>
          </div>
          <div class="ch2-route-explorer">
            <div class="ch2-presets ch2-route-list" data-route-list></div>
            <div class="ch2-note"><strong data-route-title></strong> · <span data-cost></span><br /><span data-expand></span><br />展开和 = <strong data-true></strong><br /><span data-omitted></span></div>
          </div>
        </div>`;
      return mountCofactor(root);
    },
  });
})();
