(() => {
  const { M, tex, display, aEntry, formalShell, module, proofSteps, misconception } = window.Ch2PresentationUtils;

  function mountCofactor(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const matrix = [[1, 2, 0], [0, 3, 0], [4, 5, 6]];
    let active = { row: 1, col: 1 };
    let route = { type: "row", index: 1 };
    const gate = window.LAPredictGate?.mount(root.querySelector("[data-cof-gate]"), {
      root: root.querySelector(".ch2-lab"),
      manual: true,
      key: "visuals/ch2/section6-presentation.js#row2",
      question: "第 2 行是 (0, 3, 0)。按第 2 行展开时，真正要算几个 2 阶余子式？",
      options: [
        ["1 个：只有 a₂₂ 不为 0", true, ""],
        ["3 个：每个元素一个", false, "零元素那一项是 0×C=0，它的余子式不必算。"],
        ["0 个：这一行有 0，det 就是 0", false, "一行里有 0 只消去对应的项；a₂₂C₂₂=3×6=18 仍要算。"],
        ["2 个：两个 0 各算一个", false, "要算的是非零元素的余子式；两个 0 的项直接为 0。"],
      ],
      right: `✓ 两个零块直接为 0，只剩一块：${tex("\\det A=a_{22}C_{22}=3\\times6=18")}。展开时挑零最多的行或列。`,
      onPick: () => render(),
      onReveal: () => render(),
    });
    const open = () => !gate || gate.revealed;

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
      // before the prediction the routes are locked and their counts hidden
      const locked = gate && !gate.picked;
      container.innerHTML = routes.map((item) => `<button type="button" class="${open() && route.type === item.type && route.index === item.index ? "is-active" : ""}" data-route-type="${item.type}" data-route-index="${item.index}" ${locked ? 'disabled title="先在上方作出预测"' : ""}>${item.type === "row" ? `第 ${item.index + 1} 行` : `第 ${item.index + 1} 列`}${open() ? ` · ${item.cost} 个非零项` : ""}</button>`).join("");
      container.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          route = { type: button.dataset.routeType, index: Number(button.dataset.routeIndex) };
          gate?.acted();
          render();
        }, { signal });
      });
    }

    // one tile a_ij × C_ij per entry of the route; tiles of zero entries are greyed
    function renderExpansionTiles(result) {
      const tiles = result.allItems.map((item) => {
        const zero = Math.abs(item.element) <= M().EPS;
        const c = `C_{${item.row + 1}${item.col + 1}}`;
        return `<figure class="ch2-cof-tile${zero ? " is-zero" : ""}">
          <span>${aEntry(item.row + 1, item.col + 1)}${tex(`\\times`)}${tex(c)}</span>
          <strong>${zero ? tex(`0\\times ${c}=0`) : tex(`${M().formatNum(item.element, 3)}\\times${item.value < 0 ? `(${M().formatNum(item.value, 3)})` : M().formatNum(item.value, 3)}=${M().formatNum(item.contribution, 3)}`)}</strong>
          <small>${zero ? "不必算余子式" : `要算 ${tex(`M_{${item.row + 1}${item.col + 1}}`)}`}</small>
        </figure>`;
      });
      return `${tiles.join('<b class="ch2-cof-op">+</b>')}<b class="ch2-cof-op">=</b><figure class="ch2-cof-tile is-sum"><span>det A</span><strong>${tex(M().formatNum(result.total, 3))}</strong></figure>`;
    }

    /*
     * The six terms of the 3-order determinant, sgn(p)·a₁ₚ₁a₂ₚ₂a₃ₚ₃ in lexicographic order. The two
     * terms that contain the selected a_ij share that factor; what is left is (−1)^{i+j}M_ij = C_ij.
     */
    const PERMS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
    const permSign = (p) => {
      let inv = 0;
      for (let i = 0; i < 3; i += 1) for (let j = i + 1; j < 3; j += 1) if (p[i] > p[j]) inv += 1;
      return inv % 2 ? -1 : 1;
    };
    const sub = (r, c) => `a_{${r + 1}${c + 1}}`;
    function renderLeibniz() {
      const { row: i, col: j } = active;
      const terms = PERMS.map((p) => ({
        p,
        sign: permSign(p),
        hit: p[i] === j,
        value: permSign(p) * p.reduce((acc, c, r) => acc * matrix[r][c], 1),
      }));
      const tiles = terms.map((t, k) => `<figure class="ch2-leib-term${t.hit ? " is-hit" : ""}">
          <span>${tex(`${t.sign > 0 ? (k ? "+" : "") : "-"}${t.p.map((c, r) => sub(r, c)).join("")}`)}</span>
          <small>${tex(M().formatNum(t.value, 3))}</small>
        </figure>`).join("");
      // the two hits with a_ij taken out
      const hits = terms.filter((t) => t.hit);
      const rest = (t) => t.p.map((c, r) => (r === i ? "" : sub(r, c))).join("");
      const inner = hits.map((t, k) => `${t.sign > 0 ? (k ? "+" : "") : "-"}${rest(t)}`).join("");
      const rows = [0, 1, 2].filter((r) => r !== i);
      const cols = [0, 1, 2].filter((c) => c !== j);
      const minor = `${sub(rows[0], cols[0])}${sub(rows[1], cols[1])}-${sub(rows[0], cols[1])}${sub(rows[1], cols[0])}`;
      const ij = `${i + 1}${j + 1}`;
      const selected = cofactor(i, j);
      const sum = hits.reduce((acc, t) => acc + t.value, 0);
      root.querySelector("[data-leibniz]").innerHTML = `
        <p class="ch2-leib-title">${tex("\\det A")} 的 6 项中，含 ${tex(sub(i, j))} 的恰好 2 项</p>
        <div class="ch2-leib-terms">${tiles}</div>
        <p class="ch2-leib-factor">${tex(`${sub(i, j)}\\bigl(${inner}\\bigr)=(-1)^{${i + 1}+${j + 1}}\\,${sub(i, j)}\\bigl(${minor}\\bigr)=${sub(i, j)}\\,C_{${ij}}`)}</p>
        <p class="ch2-leib-value">括号里正是 ${tex(`M_{${ij}}`)} 的两项，符号为 ${tex(`(-1)^{${i + 1}+${j + 1}}=${selected.sign > 0 ? "+1" : "-1"}`)}；这两项之和为 ${tex(`${M().formatNum(matrix[i][j], 3)}\\times${selected.value < 0 ? `(${M().formatNum(selected.value, 3)})` : M().formatNum(selected.value, 3)}=${M().formatNum(sum, 3)}`)}。</p>`;
    }

    function render() {
      renderMatrix();
      renderLeibniz();
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
      const explorer = root.querySelector("[data-route-reading]");
      explorer.hidden = !open();
      root.querySelector("[data-route-wait]").hidden = open();
      if (open()) {
        root.querySelector("[data-expand]").innerHTML = renderExpansionTiles(result);
        root.querySelector("[data-cost]").textContent = `${result.items.length} 个非零余子式`;
        root.querySelector("[data-omitted]").textContent = omitted ? `${omitted} 个零元素的项直接为 0。` : "本路线没有零元素可省。";
      }
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
          <div data-cof-gate></div>
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
          <div class="ch2-leibniz" data-leibniz aria-live="polite"></div>
          <div class="ch2-route-explorer">
            <div class="ch2-presets ch2-route-list" data-route-list></div>
            <div class="ch2-note" data-route-wait>选好预测后，点一条展开路线，看它的各项怎样相加。</div>
            <div class="ch2-note" data-route-reading hidden><strong data-route-title></strong> · <span data-cost></span><div class="ch2-cof-tiles" data-expand></div><span data-omitted></span></div>
          </div>
        </div>`;
      return mountCofactor(root);
    },
  });
})();
