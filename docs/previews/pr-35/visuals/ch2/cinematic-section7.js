/* Chapter 2 geometry-first interaction — section 7. */
(() => {
  const { M, fmt, setActive, softArrowPath, cinemaShell, defs } = window.Ch2Cinema;

  function mountCramerCinema(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-c7-svg]");
    let state = { A: [[2, 1], [1, 3]], b: [5, 5] };
    const presets = {
      unique: { A: [[2, 1], [1, 3]], b: [5, 5] },
      near: { A: [[1, 2], [1.02, 2.02]], b: [3, 3.04] },
      infinite: { A: [[1, 2], [2, 4]], b: [3, 6] },
      none: { A: [[1, 2], [2, 4]], b: [1, 0] },
    };
    const panels = [
      { x: 35, title: "D = det(a₁,a₂)", kind: "D" },
      { x: 350, title: "D₁ = det(b,a₂)", kind: "D1" },
      { x: 665, title: "D₂ = det(a₁,b)", kind: "D2" },
    ];

    function geometry(v1, v2, panel) {
      const origin = [panel.x + 68, 430];
      const scale = 39;
      const map = ([x, y]) => [origin[0] + x * scale, origin[1] - y * scale];
      const p1 = map(v1);
      const p2 = map(v2);
      const p12 = map([v1[0] + v2[0], v1[1] + v2[1]]);
      return {
        origin,
        p1,
        p2,
        polygon: [origin, p1, p12, p2].map((point) => point.join(",")).join(" "),
      };
    }

    function render() {
      const a1 = [state.A[0][0], state.A[1][0]];
      const a2 = [state.A[0][1], state.A[1][1]];
      const b = state.b;
      const D = M().det2(state.A);
      const D1 = M().det2([[b[0], a2[0]], [b[1], a2[1]]]);
      const D2 = M().det2([[a1[0], b[0]], [a1[1], b[1]]]);
      const scenes = svg.querySelector("[data-c7-scenes]");

      scenes.innerHTML = panels.map((panel) => {
        const vectors = panel.kind === "D" ? [a1, a2] : panel.kind === "D1" ? [b, a2] : [a1, b];
        const labels = panel.kind === "D" ? ["a₁", "a₂"] : panel.kind === "D1" ? ["b", "a₂"] : ["a₁", "b"];
        const value = panel.kind === "D" ? D : panel.kind === "D1" ? D1 : D2;
        const g = geometry(vectors[0], vectors[1], panel);
        return `
          <g>
            <rect x="${panel.x}" y="104" width="300" height="398" rx="24" class="cinema-panel-bg" />
            <text x="${panel.x + 22}" y="140" class="cinema-small">${panel.title}</text>
            <polygon points="${g.polygon}" class="cinema-parallelogram${value < 0 ? " is-negative" : ""}${Math.abs(value) < 1e-8 ? " is-zero" : ""}" />
            <path d="${softArrowPath(g.origin[0], g.origin[1], g.p1[0], g.p1[1], { halfWidth: 2.8, headHalf: 7.5 })}" class="cinema-vector cyan" />
            <path d="${softArrowPath(g.origin[0], g.origin[1], g.p2[0], g.p2[1], { halfWidth: 2.8, headHalf: 7.5 })}" class="cinema-vector orange" />
            <circle cx="${g.origin[0]}" cy="${g.origin[1]}" r="3.8" class="cinema-origin" />
            <text x="${g.p1[0] + 9}" y="${g.p1[1] - 9}" class="cinema-label cyan">${labels[0]}</text>
            <text x="${g.p2[0] + 9}" y="${g.p2[1] - 9}" class="cinema-label orange">${labels[1]}</text>
            <text x="${panel.x + 22}" y="482" class="cinema-title-small">有向面积 = ${fmt(value, 3)}</text>
          </g>`;
      }).join("");

      root.querySelector("[data-d]").textContent = fmt(D, 3);
      root.querySelector("[data-d1]").textContent = fmt(D1, 3);
      root.querySelector("[data-d2]").textContent = fmt(D2, 3);
      const solution = root.querySelector("[data-sol]");
      if (Math.abs(D) > 1e-8) {
        const x1 = D1 / D;
        const x2 = D2 / D;
        solution.innerHTML = `
          <strong>x₁ = D₁/D = ${fmt(x1, 3)}</strong>
          <strong>x₂ = D₂/D = ${fmt(x2, 3)}</strong>
          <span>${Math.abs(D) < 0.08
            ? "两支基向量接近共线，分母面积很小；解仍唯一，但面积比会放大微小扰动。"
            : "b 被原来的两支列向量线性组合出来；两个坐标正是两次替换后的有向面积比。"}</span>`;
      } else {
        const kind = M().classifySystem2(state.A, state.b).kind;
        solution.innerHTML = kind === "infinite"
          ? "<strong>D=0：两支列向量只张成一条过原点的直线</strong><span>b 也在这条直线上，因此同一个输出可以由无穷多组系数组合得到。</span>"
          : "<strong>D=0：两支列向量只张成一条过原点的直线</strong><span>b 不在这条直线上，所以不存在任何系数组合能到达它。</span>";
      }
    }

    root.querySelectorAll("[data-cramer-preset]").forEach((button) => button.addEventListener("click", () => {
      const preset = presets[button.dataset.cramerPreset];
      state = { A: preset.A.map((row) => row.slice()), b: preset.b.slice() };
      setActive(root, "[data-cramer-preset]", button);
      render();
    }, { signal }));

    render();
    return () => controller.abort();
  }

  window.extendChapter2Renderer("cramer-rule", {
    interactive(root) {
      if (!root) return;
      const controls = `
        <button type="button" class="is-active" data-cramer-preset="unique">唯一解</button>
        <button type="button" data-cramer-preset="near">接近共线</button>
        <button type="button" data-cramer-preset="infinite">D=0 · 无穷多解</button>
        <button type="button" data-cramer-preset="none">D=0 · 无解</button>`;
      const stage = `
        <div class="ch2-cinema-stage">
          <svg data-c7-svg viewBox="0 0 1000 560" role="img" aria-label="三组从同一原点出发的向量分别围成 D、D1、D2 的有向面积">
            ${defs("c7")}
            <text x="40" y="44" class="cinema-kicker">同一尺度 · 三组向量 · 两个面积比</text>
            <text x="40" y="76" class="cinema-title">把 b 换进一列，比较新面积与原面积</text>
            <g data-c7-scenes></g>
          </svg>
        </div>`;
      const after = `
        <div class="ch2-cinema-equation-grid is-compact">
          <div><span>原面积 D</span><strong data-d></strong></div>
          <i>→</i>
          <div><span>替换第一列 D₁</span><strong data-d1></strong></div>
          <i>→</i>
          <div><span>替换第二列 D₂</span><strong data-d2></strong></div>
        </div>
        <div class="ch2-cinema-conclusion is-column" data-sol></div>`;
      root.innerHTML = `<h2>交互实验</h2>${cinemaShell(
        "把 Cramer 法则看成两次清楚的有向面积比较",
        "三幅图全部使用同一坐标尺度。每一支对象都是从原点出发的向量；蓝色粗杠或孤立圆点都不能替代列向量和它们张成的空间。",
        "先看原来的两列是否张成整个平面，再看 b 替换某一列后面积怎样变化。只有 D≠0 时，面积比才是坐标。",
        controls,
        stage,
        after,
      )}`;
      return mountCramerCinema(root);
    },
  });
})();