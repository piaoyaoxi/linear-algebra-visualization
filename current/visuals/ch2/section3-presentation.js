(() => {
  const { M, tex, aEntry, productTermHtml, formalFromSection, labIntro, mountPrediction } = window.Ch2PresentationUtils;

  function mountSelectionGrid(root, section) {
    const controller = new AbortController();
    const { signal } = controller;
    mountPrediction(root, section, signal);
    const n = 3;
    let chosen = Array(n).fill(null);
    let triangular = false;
    let pathFrame = 0;

    const repeatMaps = {
      132: [0, 0, 1],
      213: [0, 1, 1],
      231: [0, 0, 1],
      312: [0, 1, 1],
    };

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
        const key = permutation.join("");
        const copies = repeatMaps[key] || [0, 0, 0];
        const sceneRect = scene.getBoundingClientRect();
        const points = permutation.map((col, row) => {
          const selector = copies[row]
            ? `[data-repeat-r="${row}"][data-repeat-c="${col - 1}"]`
            : `[data-main-r="${row}"][data-main-c="${col - 1}"]`;
          const node = root.querySelector(selector);
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

    function matrixRows(repeated = false, copies = [0, 0, 0]) {
      return Array.from({ length: n }, (_, row) => `
        <tr>${Array.from({ length: n }, (_, col) => {
          const selected = chosen[row] === col;
          const usedElsewhere = chosen.some((value, otherRow) => otherRow !== row && value === col);
          if (repeated) {
            const onPath = selected && copies[row] === 1;
            return `<td class="${onPath ? "is-selected" : ""}"><span data-repeat-r="${row}" data-repeat-c="${col}">${labelAt(row, col)}</span></td>`;
          }
          return `<td class="${selected ? "is-selected" : ""}${usedElsewhere ? " is-locked-col" : ""}"><button type="button" data-main-r="${row}" data-main-c="${col}" data-r="${row}" data-c="${col}" aria-pressed="${selected}" ${usedElsewhere && !selected ? "disabled" : ""}>${labelAt(row, col)}</button></td>`;
        }).join("")}</tr>
      `).join("");
    }

    function render() {
      const table = root.querySelector("[data-select-table]");
      const permutation = currentPermutation();
      const key = permutation?.join("") || "";
      const copies = repeatMaps[key] || [0, 0, 0];
      const repeat = root.querySelector("[data-repeat-view]");
      const repeatTable = root.querySelector("[data-repeat-table]");
      table.innerHTML = matrixRows(false, copies);
      repeat.hidden = !repeatMaps[key];
      repeatTable.innerHTML = matrixRows(true, copies);

      table.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          const row = Number(button.dataset.r);
          const col = Number(button.dataset.c);
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
        root.querySelector("[data-repeat-caption]").textContent = "";
        return;
      }
      const sign = M().signFromPerm(permutation);
      const containsForcedZero = triangular && permutation.some((col, row) => row > col - 1);
      root.querySelector("[data-perm-out]").textContent = permutation.join("");
      root.querySelector("[data-term-out]").innerHTML = productTermHtml(permutation);
      root.querySelector("[data-sign-out]").textContent = sign > 0 ? "+" : "−";
      root.querySelector("[data-zero-out]").textContent = containsForcedZero ? "合法，但贡献为 0" : "合法，可能非零";
      root.querySelector("[data-repeat-caption]").textContent = repeatMaps[key]
        ? "灰色虚线行列式是同一矩阵的周期延伸，只为让取项路径连续。"
        : "这条路径在原行列式内已经连续，不需要重复视图。";
      const message = root.querySelector("[data-select-msg]");
      message.textContent = containsForcedZero
        ? "这条路径满足每行每列各一次，因此是合法项；上三角结构使它选中了主对角线下方的零。"
        : "合法取项已完成：排列、乘积和符号已经同步。";
      message.className = containsForcedZero ? "ch2-note is-zero" : "ch2-note is-positive";
      schedulePath();
    }

    root.querySelector("[data-select-reset]").addEventListener("click", () => {
      chosen = Array(n).fill(null);
      render();
    }, { signal });
    root.querySelector("[data-select-231]").addEventListener("click", async () => {
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
    }, { signal });

    const terms = root.querySelector("[data-six-terms]");
    terms.innerHTML = M().permutations(3).map((permutation) => {
      const sign = M().signFromPerm(permutation);
      return `<button type="button" data-six="${permutation.join("")}" class="ch2-term-btn" aria-label="排列 ${permutation.join("")} 对应项">${sign > 0 ? "+" : "−"}${productTermHtml(permutation)}</button>`;
    }).join("");
    terms.querySelectorAll("[data-six]").forEach((button) => {
      button.addEventListener("click", () => {
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
    formal(formal, section) {
      if (!formal) return;
      formal.innerHTML = formalFromSection(section);
    },
    interactive(root, section) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          ${labIntro(section, "Leibniz 取项 · 从矩阵到一项", "完成合法路径后依次读出排列、符号与乘积项。")}
          <div class="ch2-term-workbench">
            <div class="ch2-term-scene" data-term-scene>
              <svg class="ch2-term-path" data-term-path aria-hidden="true"></svg>
              <div class="ch2-determinant-view">
                <span>原行列式</span>
                <table class="ch2-matrix-table ch2-term-matrix" data-select-table aria-label="三阶行列式取项网格"></table>
              </div>
              <div class="ch2-determinant-view is-repeat" data-repeat-view hidden>
                <span>重复视图</span>
                <table class="ch2-matrix-table ch2-term-matrix" data-repeat-table aria-hidden="true"></table>
              </div>
            </div>
            <div class="ch2-term-reading">
              <p class="ch2-term-caption" data-repeat-caption></p>
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
                <button type="button" data-triangle-toggle>观察上三角矩阵</button>
              </div>
            </div>
            <div class="ch2-term-index"><strong>六条合法路径</strong><div data-six-terms></div></div>
          </div>
        </div>`;
      return mountSelectionGrid(root, section);
    },
  });
})();
