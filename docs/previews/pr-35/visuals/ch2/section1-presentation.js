(() => {
  const { M, tex, display, aEntry, productTermHtml, formalShell, module, proofSteps, misconception, taskBox } = window.Ch2PresentationUtils;
  // ---------- §1 ----------
  function mountDetMeter(root) {
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
        const label = root.querySelector(`[data-val="${key}"]`);
        if (input) input.value = String(value);
        if (label) label.textContent = M().formatNum(value, 2);
      });
    }

    function syncReadout(matrix) {
      const det = M().det2(matrix);
      const status = M().detStatus(det);
      const detElement = root.querySelector("[data-det]");
      detElement.textContent = M().formatNum(det, 3);
      detElement.className = status.cls;
      root.querySelector("[data-abs]").textContent = M().formatNum(Math.abs(det), 3);
      const statusElement = root.querySelector("[data-status]");
      statusElement.textContent = status.label;
      statusElement.className = `ch2-status ${status.cls}`;
      root.querySelector("[data-formula]").textContent = `${M().formatNum(matrix[0][0])}·${M().formatNum(matrix[1][1])} − ${M().formatNum(matrix[0][1])}·${M().formatNum(matrix[1][0])}`;
      const hint = root.querySelector("[data-zero-hint]");
      hint.hidden = Math.abs(det) >= 0.08;
      if (!hint.hidden) hint.textContent = Math.abs(det) < M().EPS ? "两列已经共线：二维面积完全消失。" : "接近零：继续拖动会穿过维度塌缩边界。";
      M().pulseClass(root.querySelector("[data-det-card]"));
    }

    function draw(matrix) {
      state.view = M().drawTransformScene(canvas, matrix, {
        firstLabel: "第 1 列",
        secondLabel: "第 2 列",
        caption: `det = ${M().formatNum(M().det2(matrix), 3)} · 可拖动两个箭头端点`,
      });
      writeControls(matrix);
      syncReadout(matrix);
    }

    async function goTo(target) {
      if (state.animating) return;
      state.animating = true;
      try {
        await M().animateMatrix(canvas, target, {
          duration: 650,
          drawOptions: { firstLabel: "第 1 列", secondLabel: "第 2 列" },
          onUpdate(current) {
            state.matrix = M().cloneMat(current);
            writeControls(current);
            syncReadout(current);
          },
        });
        state.matrix = M().cloneMat(target);
        draw(state.matrix);
      } finally {
        state.animating = false;
      }
    }

    root.querySelectorAll("[data-key]").forEach((input) => {
      input.addEventListener("input", () => {
        if (state.animating) return;
        state.matrix = readControls();
        draw(state.matrix);
      }, { signal });
    });

    root.querySelectorAll("[data-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        root.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
        goTo(presets[button.dataset.preset]);
      }, { signal });
    });

    canvas.addEventListener("pointerdown", (event) => {
      if (state.animating || !state.view) return;
      const rect = canvas.getBoundingClientRect();
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const distances = state.view.endpoints.map((end) => Math.hypot(end.x - point.x, end.y - point.y));
      const nearest = distances[0] <= distances[1] ? 0 : 1;
      if (distances[nearest] > 34) return;
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

  defineChapter2Renderer("determinant-intro", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "从平行四边形到有向面积",
        "二维图像负责建立直觉：矩阵的两列决定变换后的两条生成边。一般 n 阶结论将在 §3 通过排列求和定义得到严格支撑。",
        module("01", "二阶公式的几何落点", "同一公式同时读取面积、方向与塌缩。", `
          <div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">公式</span><strong>${display("\\det\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}=ad-bc")}</strong><p>两列张成的平行四边形有向面积为 ad−bc，普通面积取绝对值。</p></article>
            <article class="ch2-def"><span class="kicker">符号</span><strong>正号保持定向，负号翻转定向</strong><p>符号记录有序基的方向；它不把普通几何面积变成负数。</p></article>
            <article class="ch2-def"><span class="kicker">零值</span><strong>共线使二维面积消失</strong><p>两列线性相关时，输出只能落在直线或点上，完整二维信息无法恢复。</p></article>
          </div>
        `) +
        module("02", "从零值连接到可逆与唯一解", "三个表述描述同一个二维边界。", proofSteps([
          `${tex("\\det(A)=0")} 表示两列张成的平行四边形面积为 0。`,
          "面积为 0 等价于两列共线，因此列向量线性相关。",
          "列向量无法构成平面的基，变换会丢失一个方向。",
          "丢失方向后无法唯一撤回，方程 Ax=b 也不再对所有 b 保证唯一解。",
        ]) + misconception([
          `${tex("\\det(A)=1")} 只说明有向面积倍率为 1，并不要求 ${tex("A=I")}。`,
          "det<0 表示定向翻转；普通面积仍为 |det|。",
        ]) + taskBox("阅读线索", "在交互中让 det 连续穿过 0。零点前后面积绝对值连续，方向状态在零点两侧发生改变。")),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>有向面积 · 拖动两列</h3><p>拖动两根列向量的端点，也可以使用滑杆与预设。图形、ad−bc、|det| 与状态同步更新。</p></div>
          <div class="ch2-task"><strong>观察任务</strong><span>构造明显剪切但 det=1 的图形，再让两列共线并继续拖到 det<0。</span></div>
          <div class="ch2-lab-grid">
            <div class="ch2-stage"><canvas data-ch2-canvas aria-label="可拖动两列向量的有向面积画布"></canvas></div>
            <div class="ch2-side">
              <div class="ch2-meter">
                <div class="ch2-meter-card" data-det-card><strong>det</strong><span data-det>1</span></div>
                <div class="ch2-meter-card"><strong>|det|</strong><span data-abs>1</span></div>
                <div class="ch2-meter-card"><strong>状态</strong><span data-status class="ch2-status is-positive">方向保持</span></div>
              </div>
              <div class="ch2-note">计算：<strong data-formula></strong></div>
              <div class="ch2-note is-zero" data-zero-hint hidden></div>
              <div class="ch2-sliders">
                ${["a", "b", "c", "d"].map((key) => `<label><span>${key}</span><input data-key="${key}" type="range" min="-2.5" max="2.5" step="0.05" aria-label="矩阵元素 ${key}" /><span data-val="${key}">0</span></label>`).join("")}
              </div>
              <div class="ch2-presets">
                <button type="button" data-preset="identity">单位</button>
                <button type="button" data-preset="scale2">面积 ×2</button>
                <button type="button" data-preset="shear">剪切 det=1</button>
                <button type="button" data-preset="mirror">镜像</button>
                <button type="button" data-preset="collinear">共线</button>
                <button type="button" data-preset="negative2">det=−2</button>
              </div>
            </div>
          </div>
        </div>`;
      return mountDetMeter(root);
    },
  });

})();
