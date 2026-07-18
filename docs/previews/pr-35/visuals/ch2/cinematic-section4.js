/* Chapter 2 geometry-first interaction — section 4. */
(() => {
  const { M, fmt, setActive, softArrowPath, cinemaShell, defs } = window.Ch2Cinema;

  function mountPropertyCinema(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-c4-svg]");
    const base = [[1.2, 0.35], [0.2, 1.1]];
    let mode = "swap";
    const scenes = {
      swap: {
        A: [[0.35, 1.2], [1.1, 0.2]],
        factor: -1,
        label: "交换两列",
        reason: "两支向量仍围成同一个普通面积，但有序绕行方向反了，所以 det 只改变符号。",
      },
      scale: {
        A: [[1.8, 0.35], [0.3, 1.1]],
        factor: 1.5,
        label: "第一列乘 1.5",
        reason: "第一支生成向量被拉长 1.5 倍；与第二支向量对应的高度不变，因此有向面积也乘 1.5。",
      },
      add: {
        A: [[1.2, 1.55], [0.2, 1.3]],
        factor: 1,
        label: "第二列加第一列",
        reason: "第二支向量沿第一支方向平移成新的生成边，图形发生剪切；底与高的乘积不变，所以 det 不变。",
      },
    };
    const panels = [{ x: 70, y: 118 }, { x: 580, y: 118 }];

    function geometry(A, panel) {
      const origin = [panel.x + 128, panel.y + 280];
      const scale = 105;
      const map = ([x, y]) => [origin[0] + x * scale, origin[1] - y * scale];
      const a1 = [A[0][0], A[1][0]];
      const a2 = [A[0][1], A[1][1]];
      const p0 = map([0, 0]);
      const p1 = map(a1);
      const p2 = map([a1[0] + a2[0], a1[1] + a2[1]]);
      const p3 = map(a2);
      return {
        origin,
        a1: p1,
        a2: p3,
        polygon: [p0, p1, p2, p3].map((point) => point.join(",")).join(" "),
      };
    }

    function renderPanel(prefix, A, panel) {
      const g = geometry(A, panel);
      svg.querySelector(`[data-${prefix}-poly]`).setAttribute("points", g.polygon);
      svg.querySelector(`[data-${prefix}-a1]`).setAttribute("d", softArrowPath(g.origin[0], g.origin[1], g.a1[0], g.a1[1], { halfWidth: 3, headHalf: 8 }));
      svg.querySelector(`[data-${prefix}-a2]`).setAttribute("d", softArrowPath(g.origin[0], g.origin[1], g.a2[0], g.a2[1], { halfWidth: 3, headHalf: 8 }));
      svg.querySelector(`[data-${prefix}-a1-label]`).setAttribute("x", g.a1[0] + 10);
      svg.querySelector(`[data-${prefix}-a1-label]`).setAttribute("y", g.a1[1] - 10);
      svg.querySelector(`[data-${prefix}-a2-label]`).setAttribute("x", g.a2[0] + 10);
      svg.querySelector(`[data-${prefix}-a2-label]`).setAttribute("y", g.a2[1] - 10);
    }

    function render() {
      const scene = scenes[mode];
      renderPanel("c4-before", base, panels[0]);
      renderPanel("c4-after", scene.A, panels[1]);
      svg.querySelector("[data-c4-op-label]").textContent = scene.label;
      const d0 = M().det2(base);
      const d1 = M().det2(scene.A);
      root.querySelector("[data-base-det]").textContent = fmt(d0, 3);
      root.querySelector("[data-cur-det]").textContent = fmt(d1, 3);
      root.querySelector("[data-factor]").textContent = fmt(scene.factor, 3);
      root.querySelector("[data-check]").textContent = `${fmt(d1, 3)} = ${fmt(scene.factor, 3)} × ${fmt(d0, 3)}`;
      root.querySelector("[data-c4-reason]").textContent = scene.reason;
    }

    root.querySelectorAll("[data-c4-mode]").forEach((button) => button.addEventListener("click", () => {
      mode = button.dataset.c4Mode;
      setActive(root, "[data-c4-mode]", button);
      render();
    }, { signal }));

    render();
    return () => controller.abort();
  }

  window.extendChapter2Renderer("determinant-properties", {
    interactive(root) {
      if (!root) return;
      const controls = `
        <button type="button" class="is-active" data-c4-mode="swap" data-op-swap>交换两列</button>
        <button type="button" data-c4-mode="scale" data-op-scale>第一列 ×1.5</button>
        <button type="button" data-c4-mode="add" data-op-add>第二列加第一列</button>`;
      const stage = `
        <div class="ch2-cinema-stage">
          <svg data-c4-svg viewBox="0 0 1000 560" role="img" aria-label="两列向量在列操作前后的方向和有向面积变化">
            ${defs("c4")}
            <text x="40" y="44" class="cinema-kicker">同一原点 · 两列向量 · 三种几何动作</text>
            <text x="40" y="76" class="cinema-title">先看两支向量怎样变化，再读 det 的倍率</text>
            <g class="cinema-panel">
              <rect x="60" y="102" width="370" height="404" rx="24" />
              <text x="88" y="138">操作前</text>
              <polygon data-c4-before-poly class="cinema-parallelogram" />
              <path data-c4-before-a1 class="cinema-vector cyan" />
              <path data-c4-before-a2 class="cinema-vector orange" />
              <circle cx="198" cy="398" r="4" class="cinema-origin" />
              <text data-c4-before-a1-label class="cinema-label cyan">a₁</text>
              <text data-c4-before-a2-label class="cinema-label orange">a₂</text>
            </g>
            <path d="M447 304H553" class="cinema-operation-arrow" marker-end="url(#c4-arrow-white)" />
            <text data-c4-op-label x="500" y="280" text-anchor="middle" class="cinema-small"></text>
            <g class="cinema-panel">
              <rect x="570" y="102" width="370" height="404" rx="24" />
              <text x="598" y="138">操作后</text>
              <polygon data-c4-after-poly class="cinema-parallelogram alt" />
              <path data-c4-after-a1 class="cinema-vector cyan" />
              <path data-c4-after-a2 class="cinema-vector orange" />
              <circle cx="708" cy="398" r="4" class="cinema-origin" />
              <text data-c4-after-a1-label class="cinema-label cyan">a₁′</text>
              <text data-c4-after-a2-label class="cinema-label orange">a₂′</text>
            </g>
          </svg>
        </div>`;
      const after = `
        <div class="ch2-cinema-equation-grid is-compact">
          <div><span>原 det</span><strong data-base-det></strong></div>
          <i>→</i>
          <div><span>操作倍率</span><strong data-factor></strong></div>
          <i>→</i>
          <div><span>新 det</span><strong data-cur-det></strong></div>
          <i>→</i>
          <div><span>核对</span><strong data-check></strong></div>
        </div>
        <div class="ch2-cinema-conclusion"><strong>为什么</strong><span data-c4-reason></span></div>`;
      root.innerHTML = `<h2>交互实验</h2>${cinemaShell(
        "交换、伸缩和剪切，分别怎样改变有向面积",
        "矩阵的两列始终画成从同一原点出发的两支箭头。操作后的向量不是一根粗杠，也不是抽象标签；它们仍然直接决定新的平行四边形。",
        "每次只比较两件事：箭头方向发生了什么，围成的面积发生了什么。然后再读下方倍率。",
        controls,
        stage,
        after,
      )}`;
      return mountPropertyCinema(root);
    },
  });
})();