/* Final vector-language overrides for Chapter 2 §§1 and 4. */
(() => {
  const C = window.Ch2Story;
  const V = window.Ch2VectorPolish;
  if (!C || !V || typeof window.extendChapter2Renderer !== "function") return;
  const { M, fmt, tex, shell, setActive, mapPoint, pointsString, parallelogram, animate } = C;
  const { arrowPath, gridMarkup } = V;

  function mountArea(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-story-area-svg]");
    const origin = [410, 390];
    const scale = 126;
    const state = { u: [1, 0], v: [0.55, 1], dragging: null, busy: false };
    const presets = {
      identity: { u: [1, 0], v: [0, 1] },
      shear: { u: [1, 0], v: [1.1, 1] },
      scale2: { u: [2, 0], v: [0, 1] },
      mirror: { u: [-1, 0], v: [0, 1] },
      collapse: { u: [1, 0.5], v: [2, 1] },
      negative: { u: [-1.6, 0], v: [0, 1] },
    };

    function render() {
      const { u, v } = state;
      const det = u[0] * v[1] - u[1] * v[0];
      const U = mapPoint(origin, scale, u);
      const W = mapPoint(origin, scale, v);
      const polygon = svg.querySelector("[data-area-poly]");
      polygon.setAttribute("points", pointsString(parallelogram(origin, scale, u, v)));
      polygon.setAttribute("class", Math.abs(det) < 1e-7 || det < 0 ? "story-fill-negative" : "story-fill-primary");
      svg.querySelector("[data-area-u]").setAttribute("d", arrowPath(origin[0], origin[1], U[0], U[1]));
      svg.querySelector("[data-area-v]").setAttribute("d", arrowPath(origin[0], origin[1], W[0], W[1]));
      const uHit = svg.querySelector('[data-area-handle="u"]');
      const vHit = svg.querySelector('[data-area-handle="v"]');
      uHit.setAttribute("cx", U[0]); uHit.setAttribute("cy", U[1]);
      vHit.setAttribute("cx", W[0]); vHit.setAttribute("cy", W[1]);
      const uLabel = svg.querySelector("[data-area-u-label]");
      const vLabel = svg.querySelector("[data-area-v-label]");
      uLabel.setAttribute("x", U[0] + (U[0] >= origin[0] ? 12 : -74));
      uLabel.setAttribute("y", U[1] - 12);
      vLabel.setAttribute("x", W[0] + (W[0] >= origin[0] ? 12 : -74));
      vLabel.setAttribute("y", W[1] - 12);
      root.querySelector("[data-area-matrix]").innerHTML = tex(`\\begin{bmatrix}${fmt(u[0], 2)}&${fmt(v[0], 2)}\\\\${fmt(u[1], 2)}&${fmt(v[1], 2)}\\end{bmatrix}`);
      root.querySelector("[data-area-cross]").textContent = `${fmt(u[0], 2)}×${fmt(v[1], 2)} − ${fmt(v[0], 2)}×${fmt(u[1], 2)}`;
      root.querySelector("[data-area-det]").textContent = fmt(det, 3);
      root.querySelector("[data-area-abs]").textContent = fmt(Math.abs(det), 3);
      const status = root.querySelector("[data-area-status]");
      const message = root.querySelector("[data-area-message]");
      if (Math.abs(det) < 1e-7) {
        status.textContent = "二维面积消失";
        message.textContent = "两支列向量落到同一直线上，平行四边形退化成线段；这才是 det=0 的几何含义。";
      } else if (det < 0) {
        status.textContent = "方向翻转";
        message.textContent = `两支箭头仍围成普通面积 ${fmt(Math.abs(det), 3)}，负号只记录有序方向被翻转。`;
      } else {
        status.textContent = "方向保持";
        message.textContent = `两支列向量从同一原点出发，围成有向面积 ${fmt(det, 3)}。`;
      }
    }

    async function go(target) {
      if (state.busy) M().cancelAnim(svg);
      const from = { u: state.u.slice(), v: state.v.slice() };
      state.busy = true;
      try {
        await animate(svg, 620, (t) => {
          state.u = [M().lerp(from.u[0], target.u[0], t), M().lerp(from.u[1], target.u[1], t)];
          state.v = [M().lerp(from.v[0], target.v[0], t), M().lerp(from.v[1], target.v[1], t)];
          render();
        });
      } finally {
        state.u = target.u.slice();
        state.v = target.v.slice();
        state.busy = false;
        render();
      }
    }

    root.querySelectorAll("[data-area-preset]").forEach((button) => button.addEventListener("click", () => {
      setActive(root, "[data-area-preset]", button);
      void go(presets[button.dataset.areaPreset]);
    }, { signal }));

    const localPoint = (event) => {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const matrix = svg.getScreenCTM();
      const local = matrix ? point.matrixTransform(matrix.inverse()) : point;
      return [(local.x - origin[0]) / scale, (origin[1] - local.y) / scale];
    };

    svg.querySelectorAll("[data-area-handle]").forEach((handle) => {
      handle.addEventListener("pointerdown", (event) => {
        M().cancelAnim(svg);
        state.busy = false;
        state.dragging = handle.dataset.areaHandle;
        handle.setPointerCapture(event.pointerId);
      }, { signal });
      handle.addEventListener("pointermove", (event) => {
        if (state.dragging !== handle.dataset.areaHandle) return;
        const [x, y] = localPoint(event);
        state[state.dragging] = [M().clamp(x, -2.2, 2.2), M().clamp(y, -1.2, 2.2)];
        root.querySelectorAll("[data-area-preset]").forEach((button) => {
          button.classList.remove("is-active");
          button.setAttribute("aria-pressed", "false");
        });
        render();
      }, { signal });
      const stop = () => { state.dragging = null; };
      handle.addEventListener("pointerup", stop, { signal });
      handle.addEventListener("pointercancel", stop, { signal });
    });

    render();
    return () => { controller.abort(); M().cancelAnim(svg); };
  }

  window.extendChapter2Renderer("determinant-intro", {
    interactive(root) {
      if (!root) return;
      const controls = [
        ["identity", "单位形"], ["shear", "剪切但面积不变"], ["scale2", "面积 ×2"],
        ["collapse", "两列共线"], ["mirror", "镜像"], ["negative", "翻转且放大"],
      ].map(([key, label], index) => `<button type="button" data-area-preset="${key}" class="${index === 0 ? "is-active" : ""}" aria-pressed="${index === 0}">${label}</button>`).join("");
      const stage = `<div class="ch2-story-stage"><svg data-story-area-svg viewBox="0 0 900 520" role="img" aria-label="两支矩阵列向量从同一原点出发并围成有向面积">${gridMarkup(900, 520)}<line class="story-axis" x1="0" y1="390" x2="900" y2="390"/><line class="story-axis" x1="410" y1="0" x2="410" y2="520"/><polygon class="story-ghost" points="410,390 536,390 536,264 410,264"/><polygon data-area-poly/><path data-area-u class="story-arrow-shape primary"/><path data-area-v class="story-arrow-shape secondary"/><circle class="story-origin" cx="410" cy="390" r="4"/><circle data-area-handle="u" class="story-vector-hit" r="24"/><circle data-area-handle="v" class="story-vector-hit" r="24"/><text data-area-u-label class="story-label">第一列 a₁</text><text data-area-v-label class="story-label">第二列 a₂</text><text x="26" y="34" class="story-caption">虚线是单位正方形；两支箭头是矩阵的两列，不是粗杠和装饰圆点</text></svg></div>`;
      const formula = `<div><span>矩阵的两列</span><strong data-area-matrix></strong></div><div><span>交叉相乘相减</span><strong data-area-cross></strong></div><div><span>有向面积</span><strong data-area-det></strong></div><div><span>普通面积</span><strong data-area-abs></strong></div>`;
      root.innerHTML = `<h2>交互实验</h2>${shell("两支列向量怎样共同决定有向面积", "箭头从同一原点出发，方向和长度都由矩阵两列决定。平行四边形只是它们共同张成的面积。", "先看箭头，再看面积。依次比较剪切、共线与方向翻转；也可以直接拖动箭头末端。", controls, stage, formula, `<strong data-area-status></strong><span data-area-message></span>`)}`;
      return mountArea(root);
    },
  });

  function mountProperties(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-property-svg]");
    const base = { u: [1.35, 0.25], v: [0.35, 1.15] };
    const state = { u: base.u.slice(), v: base.v.slice(), busy: false, label: "原图形" };
    const origin = [390, 380];
    const scale = 135;
    const detOf = (u, v) => u[0] * v[1] - u[1] * v[0];

    function render() {
      const baseDet = detOf(base.u, base.v);
      const det = detOf(state.u, state.v);
      const U = mapPoint(origin, scale, state.u);
      const W = mapPoint(origin, scale, state.v);
      svg.querySelector("[data-property-ghost]").setAttribute("points", pointsString(parallelogram(origin, scale, base.u, base.v)));
      const current = svg.querySelector("[data-property-current]");
      current.setAttribute("points", pointsString(parallelogram(origin, scale, state.u, state.v)));
      current.setAttribute("class", det < 0 ? "story-fill-negative" : "story-fill-primary");
      svg.querySelector("[data-property-u]").setAttribute("d", arrowPath(origin[0], origin[1], U[0], U[1]));
      svg.querySelector("[data-property-v]").setAttribute("d", arrowPath(origin[0], origin[1], W[0], W[1]));
      const uLabel = svg.querySelector("[data-property-u-label]");
      const vLabel = svg.querySelector("[data-property-v-label]");
      uLabel.setAttribute("x", U[0] + 10); uLabel.setAttribute("y", U[1] - 10);
      vLabel.setAttribute("x", W[0] + 10); vLabel.setAttribute("y", W[1] - 10);
      root.querySelector("[data-property-before]").textContent = fmt(baseDet, 3);
      root.querySelector("[data-property-after]").textContent = fmt(det, 3);
      root.querySelector("[data-property-factor]").textContent = fmt(det / baseDet, 3);
      root.querySelector("[data-property-label]").textContent = state.label;
      root.querySelector("[data-property-message]").textContent = state.label === "交换两列"
        ? "两支箭头交换身份，普通面积相同，但有序方向反了，所以 det 只改变符号。"
        : state.label === "第一列乘 1.7"
          ? "第一支箭头拉长 1.7 倍，第二支方向不变，因此有向面积也乘 1.7。"
          : state.label === "第二列加 0.8 倍第一列"
            ? "第二支箭头沿第一支方向滑动，图形发生剪切；对应高度不变，所以面积不变。"
            : "虚线保留原来的两列与面积，彩色箭头显示当前操作后的两列。";
    }

    async function go(target, label, button) {
      if (state.busy) M().cancelAnim(svg);
      setActive(root, "[data-property-op]", button);
      const from = { u: state.u.slice(), v: state.v.slice() };
      state.busy = true;
      state.label = label;
      try {
        await animate(svg, 620, (t) => {
          state.u = [M().lerp(from.u[0], target.u[0], t), M().lerp(from.u[1], target.u[1], t)];
          state.v = [M().lerp(from.v[0], target.v[0], t), M().lerp(from.v[1], target.v[1], t)];
          render();
        });
      } finally {
        state.u = target.u.slice(); state.v = target.v.slice(); state.busy = false; render();
      }
    }

    root.querySelectorAll("[data-property-op]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.propertyOp;
      if (key === "reset") void go(base, "原图形", button);
      if (key === "swap") void go({ u: base.v, v: base.u }, "交换两列", button);
      if (key === "scale") void go({ u: base.u.map((value) => 1.7 * value), v: base.v }, "第一列乘 1.7", button);
      if (key === "shear") void go({ u: base.u, v: [base.v[0] + 0.8 * base.u[0], base.v[1] + 0.8 * base.u[1]] }, "第二列加 0.8 倍第一列", button);
    }, { signal }));

    render();
    return () => { controller.abort(); M().cancelAnim(svg); };
  }

  window.extendChapter2Renderer("determinant-properties", {
    interactive(root) {
      if (!root) return;
      const controls = `<button type="button" data-property-op="reset" class="is-active" aria-pressed="true">原图形</button><button type="button" data-property-op="swap">交换两列</button><button type="button" data-property-op="scale">一列倍乘</button><button type="button" data-property-op="shear">一列倍加另一列</button>`;
      const stage = `<div class="ch2-story-stage"><svg data-property-svg viewBox="0 0 900 520" role="img" aria-label="两支列向量在交换、倍乘和倍加中的变化">${gridMarkup(900, 520)}<line class="story-axis" x1="0" y1="380" x2="900" y2="380"/><line class="story-axis" x1="390" y1="0" x2="390" y2="520"/><polygon data-property-ghost class="story-ghost"/><polygon data-property-current/><path data-property-u class="story-arrow-shape primary"/><path data-property-v class="story-arrow-shape secondary"/><circle class="story-origin" cx="390" cy="380" r="4"/><text data-property-u-label class="story-label">a₁′</text><text data-property-v-label class="story-label">a₂′</text><text x="24" y="34" class="story-caption">虚线保留原图形；彩色箭头明确显示两列究竟怎样改变</text></svg></div>`;
      const formula = `<div><span>原 det</span><strong data-property-before></strong></div><div><span>当前 det</span><strong data-property-after></strong></div><div><span>变化倍率</span><strong data-property-factor></strong></div><div><span>当前操作</span><strong data-property-label></strong></div>`;
      root.innerHTML = `<h2>交互实验</h2>${shell("三个性质，是两支列向量的三种具体动作", "交换、伸缩和剪切都直接作用在矩阵两列上。图形只是两支向量共同围成的结果。", "每次先看箭头的方向和长度，再看平行四边形，最后核对 det 的倍率。", controls, stage, formula, `<strong>几何原因</strong><span data-property-message></span>`)}`;
      return mountProperties(root);
    },
  });
})();