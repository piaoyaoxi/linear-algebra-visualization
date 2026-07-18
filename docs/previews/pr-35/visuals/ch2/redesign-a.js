/* Chapter 2 interaction redesign — sections 1–4. */
(() => {
  const { M, tex } = window.Ch2PresentationUtils;
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, M().reducedMotion() ? 0 : ms));

  function matrix2Html(matrix, digits = 2) {
    return tex(`\\begin{bmatrix}${M().formatNum(matrix[0][0], digits)}&${M().formatNum(matrix[0][1], digits)}\\\\${M().formatNum(matrix[1][0], digits)}&${M().formatNum(matrix[1][1], digits)}\\end{bmatrix}`);
  }

  function setActiveButtons(root, selector, active) {
    root.querySelectorAll(selector).forEach((button) => {
      const isActive = button === active;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  // §1 — determinant as oriented area.
  function mountDeterminantStudio(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const canvas = root.querySelector("[data-ch2-canvas]");
    const state = { matrix: [[1, 0.65], [0.15, 1]], view: null, dragging: -1, animating: false };
    const presets = {
      identity: [[1, 0], [0, 1]],
      scale2: [[2, 0], [0, 1]],
      shear: [[1, 1.15], [0, 1]],
      mirror: [[-1, 0], [0, 1]],
      collinear: [[1, 2], [0.5, 1]],
      negative2: [[-2, 0], [0, 1]],
    };

    function readControls() {
      return [
        [Number(root.querySelector('[data-key="a"]').value), Number(root.querySelector('[data-key="b"]').value)],
        [Number(root.querySelector('[data-key="c"]').value), Number(root.querySelector('[data-key="d"]').value)],
      ];
    }

    function writeControls(matrix) {
      const values = { a: matrix[0][0], b: matrix[0][1], c: matrix[1][0], d: matrix[1][1] };
      Object.entries(values).forEach(([key, value]) => {
        const input = root.querySelector(`[data-key="${key}"]`);
        const output = root.querySelector(`[data-val="${key}"]`);
        if (input) input.value = String(value);
        if (output) output.textContent = M().formatNum(value, 2);
      });
    }

    function sync(matrix) {
      const [a, b] = matrix[0];
      const [c, d] = matrix[1];
      const det = M().det2(matrix);
      const status = M().detStatus(det);
      root.querySelector("[data-current-matrix]").innerHTML = matrix2Html(matrix);
      root.querySelector("[data-formula]").textContent = `${M().formatNum(a, 2)} × ${M().formatNum(d, 2)} − ${M().formatNum(b, 2)} × ${M().formatNum(c, 2)}`;
      root.querySelector("[data-det]").textContent = M().formatNum(det, 3);
      root.querySelector("[data-abs]").textContent = M().formatNum(Math.abs(det), 3);
      const statusEl = root.querySelector("[data-status]");
      statusEl.textContent = status.label;
      statusEl.className = status.cls;

      const meaning = {
        scale: root.querySelector('[data-meaning="scale"]'),
        orientation: root.querySelector('[data-meaning="orientation"]'),
        collapse: root.querySelector('[data-meaning="collapse"]'),
      };
      Object.values(meaning).forEach((item) => item.classList.remove("is-active"));
      const nearZero = Math.abs(det) < 0.08;
      if (nearZero) {
        meaning.collapse.classList.add("is-active");
        meaning.collapse.querySelector("span").textContent = Math.abs(det) < M().EPS
          ? "两列共线，平面被压成一条线，面积完全消失。"
          : "两列接近共线，二维信息正在接近塌缩边界。";
      } else if (det < 0) {
        meaning.orientation.classList.add("is-active");
        meaning.orientation.querySelector("span").textContent = "符号为负：两列的先后方向发生翻转，普通面积仍取绝对值。";
      } else {
        meaning.scale.classList.add("is-active");
        meaning.scale.querySelector("span").textContent = `单位面积变为 ${M().formatNum(Math.abs(det), 3)}；这就是当前面积倍率。`;
      }
      writeControls(matrix);
    }

    function draw(matrix) {
      state.view = M().drawTransformScene(canvas, matrix, {
        firstLabel: "第一列",
        secondLabel: "第二列",
        caption: "拖动两个箭头端点，让 det 连续穿过 0",
        pad: 48,
      });
      sync(matrix);
    }

    async function goTo(target) {
      if (state.animating) return;
      state.animating = true;
      root.querySelectorAll("button, input").forEach((control) => { control.disabled = true; });
      try {
        await M().animateMatrix(canvas, target, {
          duration: 680,
          drawOptions: { firstLabel: "第一列", secondLabel: "第二列", caption: "观察面积、符号与塌缩如何同步变化", pad: 48 },
          onUpdate(current) {
            state.matrix = M().cloneMat(current);
            sync(current);
          },
        });
        state.matrix = M().cloneMat(target);
        draw(state.matrix);
      } finally {
        state.animating = false;
        root.querySelectorAll("button, input").forEach((control) => { control.disabled = false; });
      }
    }

    root.querySelectorAll("[data-key]").forEach((input) => input.addEventListener("input", () => {
      if (state.animating) return;
      state.matrix = readControls();
      draw(state.matrix);
    }, { signal }));

    root.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
      setActiveButtons(root, "[data-preset]", button);
      goTo(presets[button.dataset.preset]);
    }, { signal }));

    canvas.addEventListener("pointerdown", (event) => {
      if (state.animating || !state.view) return;
      const rect = canvas.getBoundingClientRect();
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const distances = state.view.endpoints.map((end) => Math.hypot(end.x - point.x, end.y - point.y));
      const nearest = distances[0] <= distances[1] ? 0 : 1;
      if (distances[nearest] > 40) return;
      state.dragging = nearest;
      canvas.setPointerCapture(event.pointerId);
      canvas.classList.add("is-dragging");
    }, { signal });

    canvas.addEventListener("pointermove", (event) => {
      if (state.dragging < 0 || !state.view) return;
      const rect = canvas.getBoundingClientRect();
      const x = M().clamp((event.clientX - rect.left - state.view.origin.x) / state.view.scale, -2.5, 2.5);
      const y = M().clamp(-(event.clientY - rect.top - state.view.origin.y) / state.view.scale, -2.5, 2.5);
      if (state.dragging === 0) {
        state.matrix[0][0] = x;
        state.matrix[1][0] = y;
      } else {
        state.matrix[0][1] = x;
        state.matrix[1][1] = y;
      }
      draw(state.matrix);
    }, { signal });

    const stopDrag = () => {
      state.dragging = -1;
      canvas.classList.remove("is-dragging");
    };
    canvas.addEventListener("pointerup", stopDrag, { signal });
    canvas.addEventListener("pointercancel", stopDrag, { signal });
    window.addEventListener("resize", () => document.body.contains(canvas) && draw(state.matrix), { signal, passive: true });

    draw(state.matrix);
    return () => {
      controller.abort();
      M().cancelAnim(canvas);
    };
  }

  window.extendChapter2Renderer("determinant-intro", {
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab ch2-v2-lab">
          <div class="ch2-v2-head">
            <h3>把两个列向量拖成一个面积</h3>
            <p>画面中的蓝色和橙色箭头就是矩阵的两列。它们围出的平行四边形直接展示普通面积，箭头先后顺序决定行列式的正负号。</p>
          </div>
          <div class="ch2-v2-task"><strong>先做这件事</strong><span>先点击“剪切 det=1”，确认形状改变但面积不变；再让两列共线，最后继续穿过零点进入方向翻转。</span></div>
          <div class="ch2-v2-preset-bar" role="group" aria-label="行列式图形预设">
            <button type="button" class="is-active" data-preset="identity" aria-pressed="true">单位形</button>
            <button type="button" data-preset="scale2" aria-pressed="false">面积 ×2</button>
            <button type="button" data-preset="shear" aria-pressed="false">剪切 det=1</button>
            <button type="button" data-preset="mirror" aria-pressed="false">镜像</button>
            <button type="button" data-preset="collinear" aria-pressed="false">共线 det=0</button>
            <button type="button" data-preset="negative2" aria-pressed="false">翻转且 ×2</button>
          </div>
          <div class="ch2-v2-workspace">
            <div class="ch2-v2-visual-column">
              <div class="ch2-v2-stage">
                <div class="ch2-v2-stage-badge">两列决定整个二维变换</div>
                <canvas data-ch2-canvas aria-label="拖动两列向量观察有向面积"></canvas>
                <div class="ch2-v2-stage-legend"><span>第一列</span><span>第二列</span></div>
              </div>
            </div>
            <aside class="ch2-v2-inspector">
              <div class="ch2-v2-matrix-card"><span>当前矩阵</span><strong data-current-matrix></strong></div>
              <div class="ch2-v2-equation">
                <span>同一条计算链</span>
                <strong data-formula></strong>
                <div class="ch2-v2-result-flow">
                  <div><span>有向面积 det</span><strong data-det>1</strong></div>
                  <i>→</i>
                  <div><span>普通面积 |det|</span><strong data-abs>1</strong></div>
                </div>
                <div class="ch2-v2-status">当前状态：<strong data-status class="is-positive">方向保持</strong></div>
              </div>
              <div class="ch2-v2-meaning">
                <article data-meaning="scale"><strong>面积倍率</strong><span>单位面积会被放大或缩小多少。</span></article>
                <article data-meaning="orientation"><strong>方向符号</strong><span>两列的先后方向是否发生翻转。</span></article>
                <article data-meaning="collapse"><strong>维度塌缩</strong><span>两列共线时，二维面积会消失。</span></article>
              </div>
              <details class="ch2-v2-details">
                <summary>精确调节矩阵元素</summary>
                <div class="ch2-v2-control-grid">
                  ${["a", "b", "c", "d"].map((key) => `<label><span>${key}</span><input data-key="${key}" type="range" min="-2.5" max="2.5" step="0.05" aria-label="矩阵元素 ${key}" /><output data-val="${key}">0</output></label>`).join("")}
                </div>
              </details>
            </aside>
          </div>
        </div>`;
      return mountDeterminantStudio(root);
    },
  });

  // §2 — permutation parity.
  function mountPermutationStudio(root) {
    const controller = new AbortController();
    const { signal } = controller;
    let permutation = [3, 1, 4, 2];
    let selected = -1;
    let scannerIndex = 0;
    let lastAction = "起点 3142 有三个逆序，因此是奇排列。";
    const pairOrder = M().allPositionPairs(4);
    const list = root.querySelector("[data-perm-list]");
    const tau = () => M().inversionPairs(permutation).length;

    function drawWires() {
      const svg = root.querySelector("[data-wires]");
      const xs = [70, 195, 320, 445];
      svg.innerHTML = `
        ${xs.map((x, index) => `<text x="${x}" y="22" text-anchor="middle">位置 ${index + 1}</text>`).join("")}
        ${xs.map((x, index) => `<text x="${x}" y="262" text-anchor="middle">${index + 1}</text>`).join("")}
        ${permutation.map((value, index) => `<path d="M ${xs[index]} 42 C ${xs[index]} 120, ${xs[value - 1]} 164, ${xs[value - 1]} 240" />`).join("")}
      `;
    }

    function renderScanner() {
      const pair = pairOrder[scannerIndex % pairOrder.length];
      const inversion = permutation[pair.i] > permutation[pair.j];
      root.querySelector("[data-scan-pair]").textContent = `检查位置 ${pair.i + 1}、${pair.j + 1}：${permutation[pair.i]} 与 ${permutation[pair.j]}`;
      const result = root.querySelector("[data-scan-result]");
      result.textContent = inversion ? "前面的数更大，这一对形成逆序。" : "前面的数更小，这一对不是逆序。";
      result.className = inversion ? "is-negative" : "is-positive";
      list.querySelectorAll("[data-index]").forEach((button) => {
        const index = Number(button.dataset.index);
        button.classList.toggle("is-scanning", index === pair.i || index === pair.j);
      });
    }

    function describeChange(before, after, action) {
      const delta = Math.abs(after - before);
      lastAction = `${action}：逆序数 ${before} → ${after}，改变 ${delta}。因为变化量是${delta % 2 ? "奇数" : "偶数"}，排列符号${delta % 2 ? "翻转" : "保持"}。`;
    }

    function render({ pulse = false } = {}) {
      list.innerHTML = permutation.map((value, index) => `
        <button type="button" class="ch2-v2-perm-card${selected === index ? " is-selected" : ""}" draggable="true" data-index="${index}" aria-label="位置 ${index + 1} 的数 ${value}" aria-pressed="${selected === index}">${value}</button>
      `).join("");
      const inversions = M().inversionPairs(permutation);
      const sign = M().signFromPerm(permutation);
      root.querySelector("[data-perm-text]").textContent = permutation.join("");
      root.querySelector("[data-tau]").textContent = String(inversions.length);
      root.querySelector("[data-parity]").textContent = inversions.length % 2 === 0 ? "偶排列" : "奇排列";
      root.querySelector("[data-sgn]").textContent = sign > 0 ? "+1" : "−1";
      root.querySelector("[data-action]").textContent = lastAction;
      root.querySelector("[data-inv-list]").innerHTML = inversions.length
        ? inversions.map(({ a, b }) => `<span>(${a}, ${b})</span>`).join("")
        : "<span>没有逆序对</span>";
      drawWires();

      let dragIndex = -1;
      list.querySelectorAll("[data-index]").forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.index);
          if (selected < 0) {
            selected = index;
            lastAction = `已选中位置 ${index + 1}。再点一张卡片，就执行一次对换。`;
            render();
            return;
          }
          if (selected === index) {
            selected = -1;
            lastAction = "已取消选择。";
            render();
            return;
          }
          const first = selected;
          const before = tau();
          [permutation[first], permutation[index]] = [permutation[index], permutation[first]];
          describeChange(before, tau(), `对换位置 ${first + 1} 与 ${index + 1}`);
          selected = -1;
          scannerIndex = 0;
          render({ pulse: true });
        }, { signal });
        button.addEventListener("dragstart", () => { dragIndex = Number(button.dataset.index); }, { signal });
        button.addEventListener("dragover", (event) => event.preventDefault(), { signal });
        button.addEventListener("drop", () => {
          const target = Number(button.dataset.index);
          if (dragIndex < 0 || target === dragIndex) return;
          const before = tau();
          const distance = Math.abs(target - dragIndex);
          const next = permutation.slice();
          const [moved] = next.splice(dragIndex, 1);
          next.splice(target, 0, moved);
          permutation = next;
          lastAction = `把 ${moved} 跨过 ${distance} 个相邻位置，相当于 ${distance} 次相邻交换。逆序数 ${before} → ${tau()}，符号${distance % 2 ? "翻转" : "保持"}。`;
          selected = -1;
          scannerIndex = 0;
          render({ pulse: true });
        }, { signal });
      });
      renderScanner();
      if (pulse) M().pulseClass(root.querySelector("[data-sign-card]"));
    }

    root.querySelectorAll("[data-perm-preset]").forEach((button) => button.addEventListener("click", () => {
      const presets = {
        id: [1, 2, 3, 4],
        adjacent: [1, 3, 2, 4],
        reverse: [4, 3, 2, 1],
        cycle: [2, 3, 4, 1],
        example: [3, 1, 4, 2],
      };
      permutation = presets[button.dataset.permPreset].slice();
      selected = -1;
      scannerIndex = 0;
      lastAction = `载入 ${permutation.join("")}。先数交叉，再看右侧逆序列表。`;
      setActiveButtons(root, "[data-perm-preset]", button);
      render({ pulse: true });
    }, { signal }));

    root.querySelector("[data-scan-next]").addEventListener("click", () => {
      scannerIndex = (scannerIndex + 1) % pairOrder.length;
      renderScanner();
    }, { signal });

    root.querySelector("[data-adj-step]").addEventListener("click", () => {
      for (let index = 0; index < permutation.length - 1; index += 1) {
        if (permutation[index] > permutation[index + 1]) {
          const before = tau();
          [permutation[index], permutation[index + 1]] = [permutation[index + 1], permutation[index]];
          lastAction = `相邻交换位置 ${index + 1}、${index + 2}：逆序数 ${before} → ${tau()}，恰好减少 1，所以符号翻转。`;
          selected = -1;
          scannerIndex = 0;
          render({ pulse: true });
          return;
        }
      }
      lastAction = "已经还原为 1234：没有交叉，也没有逆序。";
      render();
    }, { signal });

    render();
    return () => controller.abort();
  }

  window.extendChapter2Renderer("permutations", {
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab ch2-v2-lab">
          <div class="ch2-v2-head"><h3>让交叉线替你数逆序</h3><p>上方四个位置按顺序出发，连到下方排列中的数。每一次线的交叉，恰好对应一对逆序。</p></div>
          <div class="ch2-v2-task"><strong>操作顺序</strong><span>从 3142 开始，反复点击“相邻交换一步”。每一步只消掉一个交叉，因此逆序数每次恰好减少 1。</span></div>
          <div class="ch2-v2-preset-bar" role="group" aria-label="排列预设">
            <button type="button" data-perm-preset="id">1234</button>
            <button type="button" data-perm-preset="adjacent">1324</button>
            <button type="button" data-perm-preset="reverse">4321</button>
            <button type="button" data-perm-preset="cycle">2341</button>
            <button type="button" class="is-active" data-perm-preset="example">3142</button>
          </div>
          <div class="ch2-v2-workspace">
            <div class="ch2-v2-permutation-stage">
              <div class="ch2-v2-perm-labels"><span>点击两张卡片＝一次对换</span><span>拖动一张卡片＝若干次相邻交换</span></div>
              <div class="ch2-v2-perm-row" data-perm-list></div>
              <svg class="ch2-v2-wires" data-wires viewBox="0 0 520 280" role="img" aria-label="排列连线图，交叉表示逆序"></svg>
              <div class="ch2-v2-toolbar">
                <button type="button" data-adj-step>相邻交换一步</button>
                <button type="button" data-scan-next>逐对扫描</button>
              </div>
            </div>
            <aside class="ch2-v2-inspector">
              <div class="ch2-v2-sign-card" data-sign-card>
                <strong data-sgn>−1</strong>
                <div><span class="ch2-v2-panel-label">排列 <b data-perm-text>3142</b></span><h3 data-parity>奇排列</h3><p>逆序数 τ = <b data-tau>3</b></p></div>
              </div>
              <div class="ch2-v2-status" data-action aria-live="polite"></div>
              <div class="ch2-v2-panel"><span class="ch2-v2-panel-label">全部逆序对</span><div class="ch2-inversion-list" data-inv-list></div></div>
              <div class="ch2-v2-panel"><strong data-scan-pair></strong><p data-scan-result></p></div>
              <div class="ch2-v2-callout">只要记住一条：<strong>一次相邻交换恰好改变一个逆序，因此一定翻转符号。</strong></div>
            </aside>
          </div>
        </div>`;
      return mountPermutationStudio(root);
    },
  });

  // §3 — legal term builder.
  function mountTermBuilder(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const n = 3;
    let chosen = Array(n).fill(null);
    let triangular = false;

    const labelAt = (row, col) => (triangular && row > col ? tex("0") : tex(`a_{${row + 1}${col + 1}}`));
    const permutation = () => (chosen.every((col) => col !== null) ? chosen.map((col) => col + 1) : null);

    function renderPath() {
      const overlay = root.querySelector("[data-path-overlay]");
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

      grid.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
        const row = Number(button.dataset.r);
        const col = Number(button.dataset.c);
        chosen[row] = chosen[row] === col ? null : col;
        root.querySelector("[data-select-msg]").textContent = chosen[row] === null
          ? `已取消第 ${row + 1} 行的选择。`
          : `第 ${row + 1} 行选择第 ${col + 1} 列；这一列会被其余两行锁定。`;
        render();
      }, { signal }));

      renderPath();
      root.querySelectorAll("[data-row-choice]").forEach((rowEl) => {
        const row = Number(rowEl.dataset.rowChoice);
        rowEl.innerHTML = chosen[row] === null ? `<span>第 ${row + 1} 行</span><strong>尚未选择</strong>` : `<span>第 ${row + 1} 行</span><strong>${tex(`a_{${row + 1}${chosen[row] + 1}}`)}</strong>`;
      });

      const perm = permutation();
      if (!perm) {
        root.querySelector("[data-perm-out]").textContent = "未完成";
        root.querySelector("[data-sign-out]").textContent = "—";
        root.querySelector("[data-term-out]").textContent = "每行选择一个元素后生成";
        root.querySelector("[data-zero-out]").textContent = "等待完整路径";
        return;
      }
      const sign = M().signFromPerm(perm);
      const containsZero = triangular && perm.some((col, row) => row > col - 1);
      root.querySelector("[data-perm-out]").textContent = perm.join("");
      root.querySelector("[data-sign-out]").textContent = sign > 0 ? "+" : "−";
      root.querySelector("[data-term-out]").innerHTML = `${sign > 0 ? "+" : "−"} ${perm.map((col, row) => tex(`a_{${row + 1}${col}}`)).join(" ")}`;
      root.querySelector("[data-zero-out]").textContent = containsZero ? "合法路径，但含零因子，所以贡献为 0" : "合法路径，形成一个 Leibniz 乘积项";
      const message = root.querySelector("[data-select-msg]");
      message.textContent = containsZero
        ? "路径没有重复列，因此完全合法；它为零只是因为上三角结构把其中一个格子变成了 0。"
        : "三行各选一次、三列各用一次：排列、符号和乘积项已经一一对应。";
      message.className = containsZero ? "ch2-v2-status is-zero" : "ch2-v2-status is-positive";
    }

    root.querySelector("[data-select-reset]").addEventListener("click", () => {
      chosen = Array(n).fill(null);
      root.querySelector("[data-select-msg]").className = "ch2-v2-status";
      root.querySelector("[data-select-msg]").textContent = "从第一行开始：每行选一个，同时不能重复使用同一列。";
      render();
    }, { signal });

    root.querySelector("[data-select-231]").addEventListener("click", async () => {
      chosen = Array(n).fill(null);
      render();
      for (const [row, col] of [1, 2, 0].entries()) {
        chosen[row] = col;
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
    terms.innerHTML = M().permutations(3).map((perm) => {
      const sign = M().signFromPerm(perm);
      return `<button type="button" data-six="${perm.join("")}">${sign > 0 ? "+" : "−"} ${perm.map((col, row) => `a${row + 1}${col}`).join("·")}</button>`;
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
                <div class="ch2-v2-matrix-grid" data-select-table aria-label="三阶行列式取项矩阵">
                  <svg class="ch2-v2-path-overlay" data-path-overlay viewBox="0 0 248 248" preserveAspectRatio="none"></svg>
                </div>
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
                <div class="ch2-v2-result-flow">
                  <div><span>排列 σ</span><strong data-perm-out>未完成</strong></div><i>→</i><div><span>sgn(σ)</span><strong data-sign-out>—</strong></div>
                </div>
                <strong data-term-out>每行选择一个元素后生成</strong>
                <div class="ch2-v2-status" data-zero-out>等待完整路径</div>
              </div>
              <div class="ch2-v2-status" data-select-msg aria-live="polite">从第一行开始：每行选一个，同时不能重复使用同一列。</div>
            </aside>
          </div>
          <div class="ch2-v2-panel"><span class="ch2-v2-panel-label">三阶全部六条路径</span><div class="ch2-v2-term-strip" data-six-terms></div></div>
        </div>`;
      return mountTermBuilder(root);
    },
  });

  // §4 — determinant properties as visible column operations.
  function mountOperationStudio(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const initial = [[1.2, 0.35], [0.2, 1.1]];
    let matrix = M().cloneMat(initial);
    const baseDet = M().det2(initial);
    let factor = 1;
    let animating = false;
    const history = [];
    const ledger = [];
    const canvas = root.querySelector("[data-row-canvas]");
    let operationText = "起点：尚未执行列操作。";
    let reasonText = "先观察两列围出的有向面积，再预测下一次操作会怎样改变它。";

    function snapshot() {
      history.push({ matrix: M().cloneMat(matrix), factor, ledger: ledger.slice(), operationText, reasonText });
    }

    function sync() {
      const currentDet = M().det2(matrix);
      root.querySelector("[data-mat]").innerHTML = matrix2Html(matrix);
      root.querySelector("[data-cur-det]").textContent = M().formatNum(currentDet, 3);
      root.querySelector("[data-base-det]").textContent = M().formatNum(baseDet, 3);
      root.querySelector("[data-factor]").textContent = M().formatNum(factor, 3);
      root.querySelector("[data-check]").textContent = M().formatNum(baseDet * factor, 3);
      root.querySelector("[data-current-op]").textContent = operationText;
      root.querySelector("[data-operation-reason]").textContent = reasonText;
      root.querySelector("[data-ledger]").innerHTML = ledger.length ? ledger.map((line) => `<li>${line}</li>`).join("") : "<li>起点：累计倍率为 1</li>";
      root.querySelector("[data-op-undo]").disabled = animating || history.length === 0;
      M().drawTransformScene(canvas, matrix, {
        firstLabel: "C₁",
        secondLabel: "C₂",
        caption: `${operationText}　当前 det=${M().formatNum(currentDet, 3)}`,
        pad: 48,
      });
    }

    async function apply(next, multiplier, text, reason) {
      if (animating) return;
      snapshot();
      animating = true;
      operationText = text;
      reasonText = reason;
      factor *= multiplier;
      ledger.push(`${text}　倍率 ×${M().formatNum(multiplier, 3)}`);
      root.querySelectorAll("[data-op-swap], [data-op-scale], [data-op-add]").forEach((button) => { button.disabled = true; });
      try {
        await M().animateMatrix(canvas, next, {
          duration: 650,
          drawOptions: { firstLabel: "C₁", secondLabel: "C₂", caption: text, pad: 48 },
          onUpdate(current) {
            matrix = M().cloneMat(current);
            root.querySelector("[data-mat]").innerHTML = matrix2Html(current);
            root.querySelector("[data-cur-det]").textContent = M().formatNum(M().det2(current), 3);
          },
        });
        matrix = M().cloneMat(next);
      } finally {
        animating = false;
        root.querySelectorAll("[data-op-swap], [data-op-scale], [data-op-add]").forEach((button) => { button.disabled = false; });
        sync();
      }
    }

    root.querySelector("[data-op-swap]").addEventListener("click", () => apply(
      [[matrix[0][1], matrix[0][0]], [matrix[1][1], matrix[1][0]]],
      -1,
      "交换 C₁ 与 C₂",
      "两条生成边互换先后次序，平行四边形本身大小不变，但定向翻转。",
    ), { signal });
    root.querySelector("[data-op-scale]").addEventListener("click", () => apply(
      [[matrix[0][0] * 1.5, matrix[0][1]], [matrix[1][0] * 1.5, matrix[1][1]]],
      1.5,
      "C₁ ← 1.5C₁",
      "第一条生成边拉长 1.5 倍，高不变，所以有向面积也乘 1.5。",
    ), { signal });
    root.querySelector("[data-op-add]").addEventListener("click", () => apply(
      [[matrix[0][0], matrix[0][1] + matrix[0][0]], [matrix[1][0], matrix[1][1] + matrix[1][0]]],
      1,
      "C₂ ← C₂ + C₁",
      "第二条边沿第一条边方向滑动，形成剪切；底与高没有改变，所以面积倍率为 1。",
    ), { signal });
    root.querySelector("[data-op-undo]").addEventListener("click", () => {
      if (animating || !history.length) return;
      const previous = history.pop();
      matrix = previous.matrix;
      factor = previous.factor;
      operationText = previous.operationText;
      reasonText = previous.reasonText;
      ledger.splice(0, ledger.length, ...previous.ledger);
      sync();
    }, { signal });
    root.querySelector("[data-op-reset]").addEventListener("click", () => {
      if (animating) return;
      matrix = M().cloneMat(initial);
      factor = 1;
      history.length = 0;
      ledger.length = 0;
      operationText = "起点：尚未执行列操作。";
      reasonText = "先观察两列围出的有向面积，再预测下一次操作会怎样改变它。";
      sync();
    }, { signal });
    window.addEventListener("resize", () => document.body.contains(canvas) && sync(), { signal, passive: true });

    sync();
    return () => {
      controller.abort();
      M().cancelAnim(canvas);
    };
  }

  window.extendChapter2Renderer("determinant-properties", {
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab ch2-v2-lab">
          <div class="ch2-v2-head"><h3>每次只做一种列操作，直接看面积怎样变</h3><p>三类按钮分别对应交换、倍乘和倍加。先预测图形与 det，再点击；右侧只保留一条“初始值 × 累计倍率 = 当前值”的验证链。</p></div>
          <div class="ch2-v2-task"><strong>建议顺序</strong><span>先交换两列，再倍乘第一列，最后把第一列加到第二列。比较三次操作中，哪一次只改变符号，哪一次改变大小，哪一次保持 det。</span></div>
          <div class="ch2-v2-toolbar">
            <button type="button" data-op-swap>交换 C₁、C₂</button>
            <button type="button" data-op-scale>C₁ ×1.5</button>
            <button type="button" data-op-add>C₂ ← C₂+C₁</button>
            <button type="button" data-op-undo>撤销一步</button>
            <button type="button" data-op-reset>回到起点</button>
          </div>
          <div class="ch2-v2-workspace">
            <div class="ch2-v2-stage">
              <div class="ch2-v2-stage-badge">画面操作的是矩阵的两列</div>
              <canvas data-row-canvas aria-label="列操作改变有向面积的坐标画布"></canvas>
              <div class="ch2-v2-stage-legend"><span>C₁</span><span>C₂</span></div>
            </div>
            <aside class="ch2-v2-inspector">
              <div class="ch2-v2-matrix-card"><span>当前矩阵</span><strong data-mat></strong></div>
              <div class="ch2-v2-equation">
                <span>这一刻发生了什么</span>
                <strong data-current-op></strong>
                <p data-operation-reason></p>
              </div>
              <div class="ch2-v2-result-flow">
                <div><span>初始 det</span><strong data-base-det></strong></div><i>×</i><div><span>累计倍率</span><strong data-factor></strong></div>
              </div>
              <div class="ch2-v2-result-flow">
                <div><span>初始 × 倍率</span><strong data-check></strong></div><i>=</i><div><span>当前 det</span><strong data-cur-det></strong></div>
              </div>
              <div class="ch2-v2-ledger"><strong>操作历史</strong><ol data-ledger></ol></div>
            </aside>
          </div>
        </div>`;
      return mountOperationStudio(root);
    },
  });
})();