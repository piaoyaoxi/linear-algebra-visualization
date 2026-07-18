/* Chapter 2 geometry-first interaction — section 1. */
(() => {
  const { M, fmt, setActive, svgPoint, matrixTex2, softArrowPath, cinemaShell, defs } = window.Ch2Cinema;

  function mountAreaCinema(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-c1-svg]");
    const polygon = svg.querySelector("[data-c1-parallelogram]");
    const unit = svg.querySelector("[data-c1-unit]");
    const uArrow = svg.querySelector("[data-c1-u]");
    const vArrow = svg.querySelector("[data-c1-v]");
    const uHit = svg.querySelector('[data-handle="u"]');
    const vHit = svg.querySelector('[data-handle="v"]');
    const uLabel = svg.querySelector("[data-c1-u-label]");
    const vLabel = svg.querySelector("[data-c1-v-label]");
    const origin = { x: 430, y: 420 };
    const scale = 145;
    const state = { u: [1, 0], v: [0.65, 1], dragging: null, animating: false };
    let queuedTarget = null;
    const presets = {
      identity: { u: [1, 0], v: [0, 1] },
      shear: { u: [1, 0], v: [1.15, 1] },
      scale2: { u: [2, 0], v: [0, 1] },
      mirror: { u: [-1, 0], v: [0, 1] },
      collinear: { u: [1, 0.5], v: [2, 1] },
      negative2: { u: [-2, 0], v: [0, 1] },
    };
    const map = ([x, y]) => [origin.x + x * scale, origin.y - y * scale];

    function render() {
      const { u, v } = state;
      const det = u[0] * v[1] - v[0] * u[1];
      const p0 = map([0, 0]);
      const p1 = map(u);
      const p2 = map([u[0] + v[0], u[1] + v[1]]);
      const p3 = map(v);
      polygon.setAttribute("points", [p0, p1, p2, p3].map((point) => point.join(",")).join(" "));
      polygon.classList.toggle("is-negative", det < -1e-7);
      polygon.classList.toggle("is-zero", Math.abs(det) <= 1e-7);

      const up = map(u);
      const vp = map(v);
      uArrow.setAttribute("d", softArrowPath(origin.x, origin.y, up[0], up[1], { halfWidth: 3.4, headHalf: 9 }));
      vArrow.setAttribute("d", softArrowPath(origin.x, origin.y, vp[0], vp[1], { halfWidth: 3.4, headHalf: 9 }));
      uHit.setAttribute("cx", up[0]);
      uHit.setAttribute("cy", up[1]);
      vHit.setAttribute("cx", vp[0]);
      vHit.setAttribute("cy", vp[1]);
      uLabel.setAttribute("x", up[0] + (up[0] >= origin.x ? 14 : -62));
      uLabel.setAttribute("y", up[1] - 12);
      vLabel.setAttribute("x", vp[0] + (vp[0] >= origin.x ? 14 : -62));
      vLabel.setAttribute("y", vp[1] - 12);

      root.querySelector("[data-c1-matrix]").innerHTML = matrixTex2([[u[0], v[0]], [u[1], v[1]]]);
      root.querySelector("[data-c1-formula]").textContent = `${fmt(u[0], 2)}×${fmt(v[1], 2)} − ${fmt(v[0], 2)}×${fmt(u[1], 2)}`;
      root.querySelector("[data-det]").textContent = fmt(det, 3);
      root.querySelector("[data-c1-abs]").textContent = fmt(Math.abs(det), 3);
      const status = root.querySelector("[data-status]");
      if (Math.abs(det) < 1e-7) {
        status.textContent = "二维塌缩成一条线";
        status.className = "is-zero";
      } else if (det < 0) {
        status.textContent = "方向翻转";
        status.className = "is-negative";
      } else {
        status.textContent = "方向保持";
        status.className = "is-positive";
      }
      root.querySelector("[data-c1-meaning]").textContent = Math.abs(det) < 1e-7
        ? "两列向量共线，平行四边形退化成线段；二维面积与二维信息同时消失。"
        : det < 0
          ? `普通面积是 ${fmt(Math.abs(det), 3)}；负号只记录两列向量的有序方向发生翻转。`
          : `两列向量从同一原点出发，围成面积为 ${fmt(Math.abs(det), 3)} 的平行四边形。`;
    }

    function setTarget(target) {
      state.u = target.u.slice();
      state.v = target.v.slice();
      render();
    }

    async function goTo(target) {
      if (M().reducedMotion()) {
        state.animating = false;
        queuedTarget = null;
        setTarget(target);
        return;
      }
      if (state.animating) {
        queuedTarget = target;
        return;
      }
      state.animating = true;
      const from = { u: state.u.slice(), v: state.v.slice() };
      try {
        await M().animateTo(svg, 0, 1, 720, (t) => {
          state.u = [M().lerp(from.u[0], target.u[0], t), M().lerp(from.u[1], target.u[1], t)];
          state.v = [M().lerp(from.v[0], target.v[0], t), M().lerp(from.v[1], target.v[1], t)];
          render();
        });
        setTarget(target);
      } finally {
        state.animating = false;
      }
      if (queuedTarget) {
        const next = queuedTarget;
        queuedTarget = null;
        void goTo(next);
      }
    }

    root.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
      setActive(root, "[data-preset]", button);
      void goTo(presets[button.dataset.preset]);
    }, { signal }));

    [uHit, vHit].forEach((handle) => {
      handle.addEventListener("pointerdown", (event) => {
        if (state.animating) return;
        state.dragging = handle.dataset.handle;
        handle.setPointerCapture(event.pointerId);
      }, { signal });
      handle.addEventListener("pointermove", (event) => {
        if (state.dragging !== handle.dataset.handle || state.animating) return;
        const point = svgPoint(svg, event);
        const vector = [
          M().clamp((point.x - origin.x) / scale, -2.2, 2.2),
          M().clamp((origin.y - point.y) / scale, -1.4, 2.2),
        ];
        state[state.dragging] = vector;
        root.querySelectorAll("[data-preset]").forEach((button) => button.classList.remove("is-active"));
        render();
      }, { signal });
      const stop = () => { state.dragging = null; };
      handle.addEventListener("pointerup", stop, { signal });
      handle.addEventListener("pointercancel", stop, { signal });
    });

    unit.setAttribute("points", [[0, 0], [1, 0], [1, 1], [0, 1]].map(map).map((point) => point.join(",")).join(" "));
    render();
    return () => {
      controller.abort();
      M().cancelAnim(svg);
    };
  }

  window.extendChapter2Renderer("determinant-intro", {
    interactive(root) {
      if (!root) return;
      const controls = `
        <button type="button" data-preset="identity">单位形</button>
        <button type="button" data-preset="shear">剪切但 det=1</button>
        <button type="button" data-preset="scale2">面积 ×2</button>
        <button type="button" data-preset="mirror">镜像</button>
        <button type="button" data-preset="collinear">两列共线</button>
        <button type="button" data-preset="negative2">翻转且 ×2</button>`;
      const stage = `
        <div class="ch2-cinema-stage">
          <svg data-c1-svg viewBox="0 0 1000 560" role="img" aria-label="两列向量从同一原点出发，围成有向平行四边形">
            ${defs("c1")}
            <rect width="1000" height="560" fill="url(#c1-grid)" />
            <line x1="0" y1="420" x2="1000" y2="420" class="cinema-axis" />
            <line x1="430" y1="0" x2="430" y2="560" class="cinema-axis" />
            <polygon data-c1-unit class="cinema-unit" />
            <polygon data-c1-parallelogram class="cinema-parallelogram" />
            <path data-c1-u class="cinema-vector cyan" />
            <path data-c1-v class="cinema-vector orange" />
            <circle cx="430" cy="420" r="4" class="cinema-origin" />
            <circle data-handle="u" class="cinema-vector-hit" r="24" />
            <circle data-handle="v" class="cinema-vector-hit" r="24" />
            <text data-c1-u-label class="cinema-label cyan">第一列 a₁</text>
            <text data-c1-v-label class="cinema-label orange">第二列 a₂</text>
            <text x="36" y="44" class="cinema-kicker">同一起点 · 两个方向 · 一个有向面积</text>
            <text x="36" y="76" class="cinema-title">矩阵的两列不是两根杠，而是两支真正的向量</text>
          </svg>
        </div>`;
      const after = `
        <div class="ch2-cinema-equation-grid">
          <div><span>矩阵的两列</span><strong data-c1-matrix></strong></div>
          <i>→</i>
          <div><span>交叉相乘相减</span><strong data-c1-formula></strong></div>
          <i>→</i>
          <div><span>有向面积 det</span><strong data-det></strong></div>
          <i>→</i>
          <div><span>普通面积 |det|</span><strong data-c1-abs></strong></div>
        </div>
        <div class="ch2-cinema-conclusion"><strong data-status></strong><span data-c1-meaning></span></div>`;
      root.innerHTML = `<h2>交互实验</h2>${cinemaShell(
        "拖动两列向量，看面积怎样出现、消失并翻转",
        "两支箭头从同一个原点出发，它们就是矩阵的两列。平行四边形只是这两个方向共同张成的面积，不是另一个无关装饰。",
        "先看箭头方向，再看它们围成的图形。依次比较剪切、共线和方向翻转时，什么改变、什么保持。",
        controls,
        stage,
        after,
      )}`;
      return mountAreaCinema(root);
    },
  });
})();