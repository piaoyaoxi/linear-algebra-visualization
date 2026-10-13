(() => {
  const { M, tex, display, aEntry, productTermHtml, formalShell, module, proofSteps, misconception, taskBox } = window.Ch2PresentationUtils;
  // ---------- §1 ----------
  function mountDetMeter(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const canvas = root.querySelector("[data-ch2-canvas]");
    // quarter steps keep every entry and det exact (det = 7/8 at the start)
    const state = { matrix: [[1, 0.5], [0.25, 1]], view: null, dragging: -1, animating: false, zoom: 1 };
    /*
     * The view is fixed: the origin sits in the middle and one grid square is always area 1,
     * so a bigger |det| is a bigger shape on screen. Zoom only changes how many squares fit.
     * At zoom 1 the columns' whole drag range (±2.5) is in view.
     */
    const ZOOMS = [0.55, 0.75, 1, 1.4, 2];
    let zoomIndex = 2;
    const zoomKey = {};
    function view() {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || canvas.clientWidth || 520;
      const height = rect.height || canvas.clientHeight || 420;
      return { origin: { x: width / 2, y: height / 2 }, scale: (Math.min(width, height) / (2 * 2.75)) * state.zoom };
    }
    const snap = (x) => Math.round(x * 4) / 4;
    const lab = root.querySelector(".ch2-lab");
    const gate = window.LAPredictGate?.mount(root.querySelector("[data-orient-gate]"), {
      root: lab,
      key: "visuals/ch2/section1-presentation.js#orient",
      question: `从第 1 列转到第 2 列（取较小的那个角）。如果这一转是顺时针的，${tex("\\det")} 的符号是什么？`,
      options: [
        ["负", true, ""],
        ["正", false, "逆时针才给正号。把第 2 列拖到第 1 列的另一侧，看紫色的转向弧。"],
        [tex("\\det=0"), false, "det=0 时两列共线，没有转角。"],
        ["要看平行四边形面积多大", false, "面积给出 |det|，符号只由转向决定。"],
      ],
      right: `✓ 逆时针为正，顺时针为负，${tex("|\\det|")} 是面积。两列共线时转角消失，${tex("\\det=0")}；拖着第 2 列穿过第 1 列所在的直线，转向弧随之翻转。`,
      onReveal: () => { if (!state.animating) draw(state.matrix); },
    });
    // the turning arc names the sign rule, so it waits for a prediction and a first move
    const open = () => !gate || gate.revealed;
    const presets = {
      identity: [[1, 0], [0, 1]],
      scale2: [[2, 0], [0, 1]],
      shear: [[1, 1], [0, 1]],
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

    // labels = the settled matrix: while a preset slides, the sliders move but the numbers show where it lands
    function writeControls(matrix, labels = matrix) {
      const values = { a: [0, 0], b: [0, 1], c: [1, 0], d: [1, 1] };
      Object.entries(values).forEach(([key, [i, j]]) => {
        const input = root.querySelector(`[data-key="${key}"]`);
        const label = root.querySelector(`[data-val="${key}"]`);
        if (input) input.value = String(matrix[i][j]);
        if (label) label.textContent = M().formatFrac(labels[i][j]);
      });
    }

    function syncReadout(matrix) {
      const det = M().det2(matrix);
      const status = M().detStatus(det);
      const detElement = root.querySelector("[data-det]");
      detElement.textContent = M().formatFrac(det);
      detElement.className = status.cls;
      root.querySelector("[data-abs]").textContent = M().formatFrac(Math.abs(det));
      const statusElement = root.querySelector("[data-status]");
      statusElement.textContent = status.label;
      statusElement.className = `ch2-status ${status.cls}`;
      const f = (x) => {
        const v = M().formatFrac(x).replace("−", "-").replace(/^(-?)(\d+)\/(\d+)$/, "$1\\tfrac{$2}{$3}");
        return x < 0 ? `(${v})` : v;
      };
      root.querySelector("[data-formula]").innerHTML = tex(`${f(matrix[0][0])}\\cdot${f(matrix[1][1])}-${f(matrix[0][1])}\\cdot${f(matrix[1][0])}`);
      const hint = root.querySelector("[data-zero-hint]");
      hint.hidden = Math.abs(det) > 0.25;
      if (!hint.hidden) hint.textContent = Math.abs(det) < M().EPS ? "两列已经共线：二维面积完全消失。" : "接近零：继续拖动会穿过维度塌缩边界。";
      M().pulseClass(root.querySelector("[data-det-card]"));
    }

    function paint(matrix) {
      state.view = M().drawTransformScene(canvas, matrix, {
        firstLabel: "第 1 列",
        secondLabel: "第 2 列",
        caption: `det = ${M().formatFrac(M().det2(state.target || matrix))} · 一格面积为 1`,
        orientation: open(),
        minorGrid: true,
        // keep labels clear of the zoom control in the top-right corner
        avoid: [{ x: canvas.getBoundingClientRect().width - 140, y: 0, w: 140, h: 48 }],
        ...view(),
      });
    }

    function draw(matrix) {
      paint(matrix);
      writeControls(matrix, state.target || matrix);
      syncReadout(state.target || matrix);
    }

    // a new preset interrupts a running one: it starts from where the columns are now
    let run = 0;
    async function goTo(target) {
      const id = ++run;
      M().cancelAnim(canvas);
      const from = M().cloneMat(state.matrix);
      state.animating = true;
      state.target = M().cloneMat(target);
      writeControls(state.matrix, target);
      syncReadout(target);
      try {
        await M().animateTo(canvas, from, target, 650, (current) => {
          state.matrix = M().cloneMat(current);
          paint(current);
          writeControls(current, target);
        });
        if (id !== run) return;
        state.matrix = M().cloneMat(target);
        state.target = null;
        draw(state.matrix);
      } finally {
        if (id === run) {
          state.animating = false;
          state.target = null;
        }
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

    // zooming is not an action on the columns: it neither counts for the prediction nor moves them
    root.querySelectorAll("[data-zoom]").forEach((button) => {
      ["pointerup", "click"].forEach((type) => button.addEventListener(type, (event) => event.stopPropagation(), { signal }));
      button.addEventListener("click", () => {
        const step = Number(button.dataset.zoom);
        zoomIndex = step ? M().clamp(zoomIndex + step, 0, ZOOMS.length - 1) : 2;
        root.querySelector('[data-zoom="-1"]').disabled = zoomIndex === 0;
        root.querySelector('[data-zoom="1"]').disabled = zoomIndex === ZOOMS.length - 1;
        M().animateTo(zoomKey, state.zoom, ZOOMS[zoomIndex], 260, (z) => {
          state.zoom = z;
          paint(state.matrix);
        });
      }, { signal });
    });

    const nearEnd = (event) => {
      const rect = canvas.getBoundingClientRect();
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const distances = state.view.endpoints.map((end) => Math.hypot(end.x - point.x, end.y - point.y));
      const nearest = distances[0] <= distances[1] ? 0 : 1;
      return distances[nearest] > 34 ? -1 : nearest;
    };

    canvas.addEventListener("pointerdown", (event) => {
      if (state.animating || !state.view) return;
      const nearest = nearEnd(event);
      if (nearest < 0) return;
      state.dragging = nearest;
      canvas.setPointerCapture(event.pointerId);
      canvas.classList.add("is-dragging");
    }, { signal });

    canvas.addEventListener("pointermove", (event) => {
      if (state.dragging < 0 && state.view && event.pointerType === "mouse") canvas.classList.toggle("is-grabbable", !state.animating && nearEnd(event) >= 0);
      if (state.dragging < 0 || !state.view) return;
      const rect = canvas.getBoundingClientRect();
      const x = snap(M().clamp((event.clientX - rect.left - state.view.origin.x) / state.view.scale, -2.5, 2.5));
      const y = snap(M().clamp(-(event.clientY - rect.top - state.view.origin.y) / state.view.scale, -2.5, 2.5));
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
    // the subscript labels use KaTeX's fonts; redraw once they are ready
    document.fonts?.ready.then(() => document.body.contains(canvas) && !state.animating && draw(state.matrix));
    return () => {
      controller.abort();
      M().cancelAnim(canvas);
      M().cancelAnim(zoomKey);
    };
  }

  defineChapter2Renderer("determinant-intro", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "从平行四边形到有向面积",
        `二维图像负责建立直觉：矩阵的两列决定变换后的两条生成边。一般 ${tex("n")} 阶结论将在 §3 通过排列求和定义得到严格支撑。`,
        module("01", "二阶公式的几何落点", "同一公式同时读取面积、方向与塌缩。", `
          <div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">公式</span><strong>${display("\\det\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}=ad-bc")}</strong><p>两列张成的平行四边形有向面积为 ${tex("ad-bc")}，普通面积取绝对值。</p></article>
            <article class="ch2-def"><span class="kicker">符号</span><strong>正号保持定向，负号翻转定向</strong><p>符号记录有序基的方向；它不把普通几何面积变成负数。</p></article>
            <article class="ch2-def"><span class="kicker">零值</span><strong>共线使二维面积消失</strong><p>两列线性相关时，输出只能落在直线或点上，完整二维信息无法恢复。</p></article>
          </div>
        `) +
        module("02", "从零值连接到可逆与唯一解", "三个表述描述同一个二维边界。", proofSteps([
          `${tex("\\det(A)=0")} 表示两列张成的平行四边形面积为 0。`,
          "面积为 0 等价于两列共线，因此列向量线性相关。",
          "列向量无法构成平面的基，变换会丢失一个方向。",
          `丢失方向后无法唯一撤回，方程 ${tex("Ax=b")} 也不再对所有 ${tex("b")} 保证唯一解。`,
        ]) + misconception([
          `${tex("\\det(A)=1")} 只说明有向面积倍率为 1，并不要求 ${tex("A=E")}。`,
          `${tex("\\det<0")} 表示定向翻转；普通面积仍为 ${tex("|\\det|")}。`,
        ]) + taskBox("阅读线索", `在交互中让 ${tex("\\det")} 连续穿过 0。零点前后面积绝对值连续，方向状态在零点两侧发生改变。`)),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>有向面积 · 拖动两列</h3></div>
          <div data-orient-gate></div>
          <p class="ch2-lab-hint">拖动两根列向量的端点（每次四分之一格），也可以使用滑杆与预设。视角固定，一格面积为 1，平行四边形占几格，${tex("|\\det|")} 就是几；猜过并动手后，紫色弧标出从第 1 列到第 2 列的转向。</p>
          <div class="ch2-lab-grid ch2-area-layout">
            <div class="ch2-stage"><canvas data-ch2-canvas aria-label="可拖动两列向量的有向面积画布"></canvas><div class="ch2-zoom" role="group" aria-label="缩放视图"><button type="button" data-zoom="-1" aria-label="缩小">−</button><button type="button" data-zoom="0" aria-label="恢复原始大小">1:1</button><button type="button" data-zoom="1" aria-label="放大">+</button></div></div>
            <div class="ch2-side">
              <div class="ch2-meter">
                <div class="ch2-meter-card" data-det-card><strong>${tex("\\det")}</strong><span data-det>1</span></div>
                <div class="ch2-meter-card"><strong>${tex("|\\det|")}</strong><span data-abs>1</span></div>
                <div class="ch2-meter-card"><strong>状态</strong><span data-status class="ch2-status is-positive">方向保持</span></div>
              </div>
              <div class="ch2-note">计算：<strong data-formula></strong></div>
              <div class="ch2-note is-zero" data-zero-hint hidden></div>
              <div class="ch2-sliders">
                ${["a", "b", "c", "d"].map((key) => `<label><span>${tex(key)}</span><input data-key="${key}" type="range" min="-2.5" max="2.5" step="0.25" aria-label="矩阵元素 ${key}" /><span data-val="${key}">0</span></label>`).join("")}
              </div>
              <div class="ch2-side-presets">
                <span>预设</span>
                <div class="ch2-presets">
                  <button type="button" data-preset="identity">单位</button>
                  <button type="button" data-preset="scale2">面积 ${tex("\\times2")}</button>
                  <button type="button" data-preset="shear">剪切 ${tex("\\det=1")}</button>
                  <button type="button" data-preset="mirror">镜像</button>
                  <button type="button" data-preset="collinear">共线</button>
                  <button type="button" data-preset="negative2">${tex("\\det=-2")}</button>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      return mountDetMeter(root);
    },
  });

})();
