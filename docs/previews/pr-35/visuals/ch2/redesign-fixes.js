/* Follow-up fixes discovered by the first Chromium screenshot pass. */
(() => {
  const { M, tex } = window.Ch2PresentationUtils;
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, M().reducedMotion() ? 0 : ms));

  function setActiveButtons(root, selector, active) {
    root.querySelectorAll(selector).forEach((button) => {
      const isActive = button === active;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function mountFixedTermBuilder(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const n = 3;
    let chosen = Array(n).fill(null);
    let triangular = false;

    const labelAt = (row, col) => (triangular && row > col ? tex("0") : tex(`a_{${row + 1}${col + 1}}`));
    const currentPermutation = () => (chosen.every((col) => col !== null) ? chosen.map((col) => col + 1) : null);

    function renderPath() {
      const overlay = root.querySelector("[data-path-overlay]");
      if (!overlay) return;
      const points = chosen
        .map((col, row) => (col === null ? null : [38 + col * 86, 38 + row * 86]))
        .filter(Boolean);
      overlay.innerHTML = `${points.length > 1 ? `<polyline points="${points.map((point) => point.join(",")).join(" ")}" />` : ""}${points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" />`).join("")}`;
    }

    function render() {
      const grid = root.querySelector("[data-select-table]");
      grid.innerHTML = Array.from({ length: n }, (_, row) => Array.from({ length: n }, (_, col) => {
        const selected = chosen[row] === col;
        const usedElsewhere = chosen.some((value, otherRow) => otherRow !== row && value === col);
        const zero = triangular && row > col;
        return `<button type="button" class="${selected ? "is-selected" : ""}${zero ? " is-zero" : ""}" data-r="${row}" data-c="${col}" aria-pressed="${selected}" ${usedElsewhere ? "disabled" : ""}>${labelAt(row, col)}</button>`;
      }).join("")).join("");
      grid.insertAdjacentHTML("beforeend", '<svg class="ch2-v2-path-overlay" data-path-overlay viewBox="0 0 248 248" preserveAspectRatio="none" aria-hidden="true"></svg>');

      grid.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
        const row = Number(button.dataset.r);
        const col = Number(button.dataset.c);
        chosen[row] = chosen[row] === col ? null : col;
        const message = root.querySelector("[data-select-msg]");
        message.className = "ch2-v2-status";
        message.textContent = chosen[row] === null
          ? `已取消第 ${row + 1} 行的选择。`
          : `第 ${row + 1} 行选择第 ${col + 1} 列；这一列现在被其余两行锁定。`;
        render();
      }, { signal }));

      renderPath();
      root.querySelectorAll("[data-row-choice]").forEach((rowEl) => {
        const row = Number(rowEl.dataset.rowChoice);
        rowEl.innerHTML = chosen[row] === null
          ? `<span>第 ${row + 1} 行</span><strong>尚未选择</strong><i>→</i>`
          : `<span>第 ${row + 1} 行</span><strong>${tex(`a_{${row + 1}${chosen[row] + 1}}`)}</strong><i>→</i>`;
      });

      const permutation = currentPermutation();
      if (!permutation) {
        root.querySelector("[data-perm-out]").textContent = "未完成";
        root.querySelector("[data-sign-out]").textContent = "—";
        root.querySelector("[data-term-out]").textContent = "每行选择一个元素后生成";
        root.querySelector("[data-zero-out]").textContent = "等待完整路径";
        return;
      }

      const sign = M().signFromPerm(permutation);
      const containsZero = triangular && permutation.some((col, row) => row > col - 1);
      root.querySelector("[data-perm-out]").textContent = permutation.join("");
      root.querySelector("[data-sign-out]").textContent = sign > 0 ? "+" : "−";
      root.querySelector("[data-term-out]").innerHTML = `${sign > 0 ? "+" : "−"} ${permutation.map((col, row) => tex(`a_{${row + 1}${col}}`)).join(" ")}`;
      root.querySelector("[data-zero-out]").textContent = containsZero ? "合法路径，但含零因子，所以贡献为 0" : "合法路径，形成一个 Leibniz 乘积项";
      const message = root.querySelector("[data-select-msg]");
      message.textContent = containsZero
        ? "路径没有重复列，因此完全合法；它为零只是因为上三角结构让其中一个被选格子等于 0。"
        : "三行各选一次、三列各用一次：排列、符号和乘积项已经一一对应。";
      message.className = containsZero ? "ch2-v2-status is-zero" : "ch2-v2-status is-positive";
    }

    root.querySelector("[data-select-reset]").addEventListener("click", () => {
      chosen = Array(n).fill(null);
      const message = root.querySelector("[data-select-msg]");
      message.className = "ch2-v2-status";
      message.textContent = "从第一行开始：每行选一个，同时不能重复使用同一列。";
      render();
    }, { signal });

    root.querySelector("[data-select-231]").addEventListener("click", async () => {
      chosen = Array(n).fill(null);
      render();
      const path = [1, 2, 0];
      for (let row = 0; row < path.length; row += 1) {
        chosen[row] = path[row];
        render();
        await pause(220);
      }
    }, { signal });

    root.querySelector("[data-triangle-toggle]").addEventListener("click", (event) => {
      triangular = !triangular;
      event.currentTarget.classList.toggle("is-active", triangular);
      event.currentTarget.textContent = triangular ? "恢复一般矩阵" : "切换上三角矩阵";
      render();
    }, { signal });

    const terms = root.querySelector("[data-six-terms]");
    terms.innerHTML = M().permutations(3).map((permutation) => {
      const sign = M().signFromPerm(permutation);
      return `<button type="button" data-six="${permutation.join("")}">${sign > 0 ? "+" : "−"} ${permutation.map((col, row) => `a${row + 1}${col}`).join("·")}</button>`;
    }).join("");
    terms.querySelectorAll("[data-six]").forEach((button) => button.addEventListener("click", () => {
      chosen = button.dataset.six.split("").map((value) => Number(value) - 1);
      setActiveButtons(root, "[data-six]", button);
      render();
    }, { signal }));

    render();
    return () => controller.abort();
  }

  window.extendChapter2Renderer("n-order-determinant", {
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab ch2-v2-lab">
          <div class="ch2-v2-head"><h3>亲手生成一个 Leibniz 乘积项</h3><p>每行选一个格子；一旦某列被使用，其余两行就不能再选这一列。完整路径自然给出一个排列，也自然决定乘积项的符号。</p></div>
          <div class="ch2-v2-task"><strong>先构造 231</strong><span>点击“播放 231”，观察三次选择怎样依次锁定三列；随后切换成上三角矩阵，看同一条合法路径为什么可能变成零贡献。</span></div>
          <div class="ch2-v2-toolbar">
            <button type="button" data-select-231>播放排列 231</button>
            <button type="button" data-triangle-toggle>切换上三角矩阵</button>
            <button type="button" data-select-reset>清空重来</button>
          </div>
          <div class="ch2-v2-workspace">
            <div class="ch2-v2-matrix-scene">
              <div class="ch2-v2-matrix-frame">
                <div class="ch2-v2-col-labels"><span>列 1</span><span>列 2</span><span>列 3</span></div>
                <div class="ch2-v2-row-labels"><span>行 1</span><span>行 2</span><span>行 3</span></div>
                <div class="ch2-v2-matrix-grid" data-select-table aria-label="三阶行列式取项矩阵"></div>
              </div>
            </div>
            <aside class="ch2-v2-inspector">
              <div class="ch2-v2-cramer-flow">
                <div class="ch2-v2-cramer-row" data-row-choice="0"><span>第 1 行</span><strong>尚未选择</strong><i>→</i></div>
                <div class="ch2-v2-cramer-row" data-row-choice="1"><span>第 2 行</span><strong>尚未选择</strong><i>→</i></div>
                <div class="ch2-v2-cramer-row" data-row-choice="2"><span>第 3 行</span><strong>尚未选择</strong><i>→</i></div>
              </div>
              <div class="ch2-v2-equation">
                <span>路径压缩成排列与符号</span>
                <div class="ch2-v2-result-flow"><div><span>排列 σ</span><strong data-perm-out>未完成</strong></div><i>→</i><div><span>sgn(σ)</span><strong data-sign-out>—</strong></div></div>
                <strong data-term-out>每行选择一个元素后生成</strong>
                <div class="ch2-v2-status" data-zero-out>等待完整路径</div>
              </div>
              <div class="ch2-v2-status" data-select-msg aria-live="polite">从第一行开始：每行选一个，同时不能重复使用同一列。</div>
            </aside>
          </div>
          <div class="ch2-v2-panel"><span class="ch2-v2-panel-label">三阶全部六条路径</span><div class="ch2-v2-term-strip" data-six-terms></div></div>
        </div>`;
      return mountFixedTermBuilder(root);
    },
  });

  window.defineChapter2LessonEnhancer((section, root) => {
    if (section.id === "determinant-intro") {
      root.querySelectorAll("[data-preset]").forEach((button) => {
        button.classList.remove("is-active");
        button.setAttribute("aria-pressed", "false");
      });
    }

    if (section.id === "cofactor-expansion") {
      const board = root.querySelector("[data-cofactor-board]");
      if (!board) return undefined;
      const syncStrikeOffsets = () => {
        const row = Number(board.style.getPropertyValue("--strike-row") || 1);
        const col = Number(board.style.getPropertyValue("--strike-col") || 1);
        const desired = {
          "--strike-row-desktop": `${(row - 1) * 98}px`,
          "--strike-col-desktop": `${(col - 1) * 98}px`,
          "--strike-row-mobile": `${(row - 1) * 84}px`,
          "--strike-col-mobile": `${(col - 1) * 84}px`,
        };
        Object.entries(desired).forEach(([property, value]) => {
          if (board.style.getPropertyValue(property) !== value) board.style.setProperty(property, value);
        });
      };
      syncStrikeOffsets();
      const observer = new MutationObserver(syncStrikeOffsets);
      observer.observe(board, { attributes: true, attributeFilter: ["style"] });
      return () => observer.disconnect();
    }

    if (section.id !== "laplace-and-product") return undefined;
    const sums = root.querySelectorAll("[data-pair-sum]");
    if (sums.length < 2) return undefined;
    const source = sums[0];
    const copies = Array.from(sums).slice(1);
    const sync = () => copies.forEach((copy) => { copy.textContent = source.textContent; });
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(source, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  });
})();