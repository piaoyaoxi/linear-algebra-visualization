(() => {
  const { M, tex, display, aEntry, productTermHtml, formalShell, module, proofSteps, misconception } = window.Ch2PresentationUtils;

  function mountSelectionGrid(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const n = 3;
    let chosen = Array(n).fill(null);
    let triangular = false;
    let pathFrame = 0;
    const gate = window.LAPredictGate?.mount(root.querySelector("[data-term-gate]"), {
      root: root.querySelector(".ch2-lab"),
      manual: true,
      key: "visuals/ch2/section3-presentation.js#upper",
      question: "把矩阵换成上三角（主对角线下方全是 0）。六条合法路径里，有几条的乘积可能不为 0？",
      options: [
        ["只有 1 条：主对角线", true, ""],
        ["3 条：带正号的三条", false, "符号与是否为 0 无关；其余五条每条都至少经过一个对角线下方的 0。"],
        ["6 条都可能", false, "除主对角线外，每条路径都要在某一行走到对角线左下方，那里是 0。"],
        ["一条也没有", false, "主对角线不经过下方的 0，a₁₁a₂₂a₃₃ 一般不为 0。"],
      ],
      right: `✓ 五条路径都踩到对角线下方的 0，只剩主对角线：上三角行列式 ${tex("=a_{11}a_{22}a_{33}")}。`,
      onReveal: () => paintTerms(),
    });

    // on an upper triangular matrix, the five paths that pick a zero are greyed out
    function paintTerms() {
      const open = triangular && (!gate || gate.revealed);
      root.querySelectorAll("[data-six]").forEach((button) => {
        const permutation = button.dataset.six.split("").map(Number);
        const zero = permutation.some((col, row) => row > col - 1);
        button.classList.toggle("is-zero-path", open && zero);
        button.querySelector(".ch2-term-zero")?.remove();
        if (open && zero) button.insertAdjacentHTML("beforeend", `<b class="ch2-term-zero">= 0</b>`);
      });
      const sum = root.querySelector("[data-six-sum]");
      if (sum) {
        sum.hidden = !open;
        sum.innerHTML = open ? `五条路径为 0，${tex("\\det A=a_{11}a_{22}a_{33}")}` : "";
      }
    }

    function labelAt(row, col) {
      if (triangular && row > col) return tex("0");
      return aEntry(row + 1, col + 1);
    }

    function currentPermutation() {
      return chosen.every((col) => col !== null) ? chosen.map((col) => col + 1) : null;
    }

    function schedulePath() {
      cancelAnimationFrame(pathFrame);
      pathFrame = requestAnimationFrame(() => {
        const permutation = currentPermutation();
        const svg = root.querySelector("[data-term-path]");
        const scene = root.querySelector("[data-term-scene]");
        if (!permutation || !svg || !scene) {
          if (svg) svg.innerHTML = "";
          return;
        }
        // every path stays inside the matrix: one segment from each row's choice to the next row's
        const sceneRect = scene.getBoundingClientRect();
        const points = permutation.map((col, row) => {
          const node = root.querySelector(`[data-main-r="${row}"][data-main-c="${col - 1}"]`);
          const rect = node.getBoundingClientRect();
          return { x: rect.left - sceneRect.left + rect.width / 2, y: rect.top - sceneRect.top + rect.height / 2 };
        });
        svg.setAttribute("viewBox", `0 0 ${sceneRect.width} ${sceneRect.height}`);
        svg.innerHTML = points.slice(0, -1).map((point, index) => {
          const next = points[index + 1];
          return `<line x1="${point.x}" y1="${point.y}" x2="${next.x}" y2="${next.y}" />`;
        }).join("");
      });
    }

    function matrixRows() {
      return Array.from({ length: n }, (_, row) => `
        <tr>${Array.from({ length: n }, (_, col) => {
          const selected = chosen[row] === col;
          const usedElsewhere = chosen.some((value, otherRow) => otherRow !== row && value === col);
          const hit = selected && triangular && row > col;
          const zero = triangular && row > col;
          return `<td class="${selected ? "is-selected" : ""}${hit ? " is-zero-hit" : ""}${zero ? " is-zero-cell" : ""}${usedElsewhere ? " is-locked-col" : ""}"><button type="button" data-main-r="${row}" data-main-c="${col}" data-r="${row}" data-c="${col}" aria-pressed="${selected}" ${usedElsewhere && !selected ? "disabled" : ""}>${labelAt(row, col)}</button></td>`;
        }).join("")}</tr>
      `).join("");
    }

    function render() {
      const table = root.querySelector("[data-select-table]");
      const permutation = currentPermutation();
      table.innerHTML = matrixRows();

      table.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          const row = Number(button.dataset.r);
          const col = Number(button.dataset.c);
          tour += 1;
          chosen[row] = chosen[row] === col ? null : col;
          const message = root.querySelector("[data-select-msg]");
          message.textContent = "继续选择：每行每列恰好一个。";
          message.className = "ch2-note";
          render();
        }, { signal });
      });

      if (!permutation) {
        root.querySelector("[data-perm-out]").textContent = "未完成";
        root.querySelector("[data-term-out]").textContent = "—";
        root.querySelector("[data-sign-out]").textContent = "—";
        root.querySelector("[data-zero-out]").textContent = "—";
        root.querySelector("[data-term-path]").innerHTML = "";
        return;
      }
      const sign = M().signFromPerm(permutation);
      const containsForcedZero = triangular && permutation.some((col, row) => row > col - 1);
      root.querySelector("[data-perm-out]").textContent = permutation.join("");
      root.querySelector("[data-term-out]").innerHTML = productTermHtml(permutation);
      root.querySelector("[data-sign-out]").textContent = sign > 0 ? "+" : "−";
      root.querySelector("[data-zero-out]").textContent = containsForcedZero ? "合法，但贡献为 0" : "合法，可能非零";
      const message = root.querySelector("[data-select-msg]");
      message.textContent = containsForcedZero
        ? "这条路径满足每行每列各一次，因此是合法项；上三角结构使它选中了主对角线下方的零。"
        : "合法取项已完成：排列、乘积和符号已经同步。";
      message.className = containsForcedZero ? "ch2-note is-zero" : "ch2-note is-positive";
      schedulePath();
    }

    /*
     * On the upper triangular matrix, walk the six paths one by one: each path is drawn on the
     * matrix and the zero below the diagonal it picks is circled; the main diagonal comes last.
     */
    let tour = 0;
    const TOUR = ["132", "213", "231", "312", "321", "123"];
    const markTerm = (key) => root.querySelectorAll("[data-six]").forEach((item) => item.classList.toggle("is-active", item.dataset.six === key));
    async function walkPaths() {
      const token = ++tour;
      for (const key of TOUR) {
        if (token !== tour || !triangular) return;
        chosen = key.split("").map((value) => Number(value) - 1);
        markTerm(key);
        render();
        if (!M().reducedMotion()) await new Promise((resolve) => setTimeout(resolve, 950));
      }
    }

    root.querySelector("[data-select-reset]").addEventListener("click", () => {
      tour += 1;
      chosen = Array(n).fill(null);
      render();
    }, { signal });
    root.querySelector("[data-select-231]").addEventListener("click", async () => {
      tour += 1;
      chosen = Array(n).fill(null);
      render();
      const path = [1, 2, 0];
      for (let row = 0; row < path.length; row += 1) {
        chosen[row] = path[row];
        render();
        if (!M().reducedMotion()) await new Promise((resolve) => setTimeout(resolve, 180));
      }
    }, { signal });
    root.querySelector("[data-triangle-toggle]").addEventListener("click", (event) => {
      triangular = !triangular;
      event.currentTarget.classList.toggle("is-active", triangular);
      event.currentTarget.textContent = triangular ? "恢复一般矩阵" : "观察上三角矩阵";
      render();
      if (triangular) gate?.acted();
      paintTerms();
      if (triangular) walkPaths();
      else tour += 1;
    }, { signal });

    const terms = root.querySelector("[data-six-terms]");
    terms.innerHTML = M().permutations(3).map((permutation) => {
      const sign = M().signFromPerm(permutation);
      return `<button type="button" data-six="${permutation.join("")}" class="ch2-term-btn" aria-label="排列 ${permutation.join("")} 对应项">${sign > 0 ? "+" : "−"}${productTermHtml(permutation)}</button>`;
    }).join("");
    terms.querySelectorAll("[data-six]").forEach((button) => {
      button.addEventListener("click", () => {
        tour += 1;
        chosen = button.dataset.six.split("").map((value) => Number(value) - 1);
        terms.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
        render();
      }, { signal });
    });

    render();
    window.addEventListener("resize", schedulePath, { signal, passive: true });
    return () => {
      cancelAnimationFrame(pathFrame);
      controller.abort();
    };
  }

  defineChapter2Renderer("n-order-determinant", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "n 阶定义：带符号的合法取项求和",
        "合法取项解决‘选哪些元素’，排列奇偶解决‘带什么符号’。两部分合在一起得到统一定义。",
        module("01", "Leibniz 定义", "每个排列生成且只生成一个乘积项。", `
          <article class="ch2-def ch2-formula-block"><span class="kicker">定义</span><strong>${display("\\det(A)=\\sum_{\\sigma\\in S_n}\\operatorname{sgn}(\\sigma)\\prod_{i=1}^{n}a_{i,\\sigma(i)}")}</strong><p>求和范围 ${tex("S_n")} 包含全部 n! 个排列。第 i 行选择第 σ(i) 列，因此每行每列各出现一次。</p></article>
        `) + module("02", "从一般定义回到二阶与三阶", "熟悉公式只是列出较小 n 的全部排列。", `
          <div class="ch2-card-grid">
            <article class="ch2-card"><span class="kicker">n=2</span><h4>${tex("a_{11}a_{22}-a_{12}a_{21}")}</h4><p>排列 12 为偶，21 为奇。</p></article>
            <article class="ch2-card"><span class="kicker">n=3</span><h4>三正三负，共六项</h4><p>Sarrus 图可辅助记忆三阶，定义仍来自六个排列。</p></article>
            <article class="ch2-card"><span class="kicker">合法与非零</span><h4>两个概念必须分开</h4><p>路径合法只说明下标结构正确；若选中零元素，该项仍贡献 0。</p></article>
          </div>
          <article class="ch2-def ch2-formula-block"><span class="kicker">三阶完整展开</span><strong>${display("\\begin{aligned}\\det(A)={}&a_{11}a_{22}a_{33}+a_{12}a_{23}a_{31}+a_{13}a_{21}a_{32}\\\\&-a_{13}a_{22}a_{31}-a_{12}a_{21}a_{33}-a_{11}a_{23}a_{32}\\end{aligned}")}</strong></article>
        `) + module("03", "上三角矩阵为什么只剩一项", "零结构会消去除恒等排列外的所有合法路径。", proofSteps([
          "恒等排列 σ(i)=i 选择主对角线，得到 a₁₁a₂₂⋯aₙₙ。",
          "若 σ 不是恒等排列，则必存在某个 i 使 σ(i)&lt;i。",
          "上三角矩阵在 i>j 时有 aᵢⱼ=0，因此该排列项含有零因子。",
          "所以只有恒等排列项可能非零，行列式等于主对角线乘积。",
        ]) + misconception([
          "合法项必须同时满足每行与每列各一次；只满足列条件仍可能遗漏某一行。",
          "Sarrus 法只用于三阶；四阶及以上回到定义、性质与展开。",
          "上三角的非恒等路径同样合法，只是因零结构贡献 0。",
        ])),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>Leibniz 取项 · 从矩阵到一项</h3><p>每行选择一个元素。已经使用的列会被锁定；完成后依次读出排列、符号与乘积项。</p></div>
          <div data-term-gate></div>
          <div class="ch2-term-workbench">
            <div class="ch2-term-scene" data-term-scene>
              <svg class="ch2-term-path" data-term-path aria-hidden="true"></svg>
              <div class="ch2-determinant-view">
                <span>原行列式</span>
                <table class="ch2-matrix-table ch2-term-matrix" data-select-table aria-label="三阶行列式取项网格"></table>
              </div>
            </div>
            <div class="ch2-term-reading">
              <div class="ch2-term-flow" aria-live="polite">
                <span>排列 <strong data-perm-out>未完成</strong></span>
                <i>→</i><span>符号 <strong data-sign-out>—</strong></span>
                <i>→</i><span>乘积 <strong data-term-out>—</strong></span>
                <i>→</i><span data-zero-out>—</span>
              </div>
              <div class="ch2-note" data-select-msg aria-live="polite">继续选择：每行每列恰好一个。</div>
              <div class="ch2-toolbar">
                <button type="button" data-select-reset>清空</button>
                <button type="button" data-select-231>播放排列 231</button>
                <button type="button" class="is-primary" data-triangle-toggle>观察上三角矩阵</button>
              </div>
            </div>
            <div class="ch2-term-index"><strong>六条合法路径</strong><div data-six-terms></div><p class="ch2-six-sum" data-six-sum hidden></p></div>
          </div>
        </div>`;
      return mountSelectionGrid(root);
    },
  });
})();
