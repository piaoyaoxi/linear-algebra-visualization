(() => {
  const { M, formalFromSection, labIntro, mountPrediction } = window.Ch2PresentationUtils;
  // ---------- §1 ----------
  function mountDetMeter(root, section) {
    const controller = new AbortController();
    const { signal } = controller;
    mountPrediction(root, section, signal);
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
    formal(formal, section) {
      if (!formal) return;
      formal.innerHTML = formalFromSection(section);
    },
    interactive(root, section) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          ${labIntro(section, "有向面积 · 拖动两列", "拖动两根列向量的端点，图形与行列式读数同步更新。")}
          <div class="ch2-lab-grid ch2-area-layout">
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
            </div>
          </div>
          <div class="ch2-presets ch2-wide-controls">
            <button type="button" data-preset="identity">单位</button>
            <button type="button" data-preset="scale2">面积 ×2</button>
            <button type="button" data-preset="shear">剪切 det=1</button>
            <button type="button" data-preset="mirror">镜像</button>
            <button type="button" data-preset="collinear">共线</button>
            <button type="button" data-preset="negative2">det=−2</button>
          </div>
        </div>`;
      return mountDetMeter(root, section);
    },
  });

})();
