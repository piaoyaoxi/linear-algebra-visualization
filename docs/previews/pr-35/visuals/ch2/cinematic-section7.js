/* Chapter 2 cinematic interaction — section 7. */
(() => {
  const { M, fmt, setActive, cinemaShell, defs } = window.Ch2Cinema;

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

    function polygon(v1, v2, panel) {
      const ox = panel.x + 62;
      const oy = 430;
      const scale = 40;
      const map = ([x, y]) => [ox + x * scale, oy - y * scale];
      return [[0, 0], v1, [v1[0] + v2[0], v1[1] + v2[1]], v2].map(map).map((point) => point.join(",")).join(" ");
    }

    function vectorLine(vector, panel, className, label) {
      const ox = panel.x + 62;
      const oy = 430;
      const scale = 40;
      const x = ox + vector[0] * scale;
      const y = oy - vector[1] * scale;
      return `<line x1="${ox}" y1="${oy}" x2="${x}" y2="${y}" class="cinema-vector ${className}" marker-end="url(#c7-arrow-${className === "cyan" ? "cyan" : "orange"})"/><text x="${x + 10}" y="${y - 10}" class="cinema-label ${className}">${label}</text>`;
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
        return `<g><rect x="${panel.x}" y="112" width="300" height="382" rx="26" class="cinema-panel-bg"/><text x="${panel.x + 22}" y="150" class="cinema-small">${panel.title}</text><polygon points="${polygon(vectors[0], vectors[1], panel)}" class="cinema-parallelogram${value < 0 ? " is-negative" : ""}${Math.abs(value) < 1e-8 ? " is-zero" : ""}"/>${vectorLine(vectors[0], panel, "cyan", labels[0])}${vectorLine(vectors[1], panel, "orange", labels[1])}<text x="${panel.x + 22}" y="476" class="cinema-title-small">面积 = ${fmt(value, 3)}</text></g>`;
      }).join("");

      root.querySelector("[data-d]").textContent = fmt(D, 3);
      root.querySelector("[data-d1]").textContent = fmt(D1, 3);
      root.querySelector("[data-d2]").textContent = fmt(D2, 3);
      const solution = root.querySelector("[data-sol]");
      if (Math.abs(D) > 1e-8) {
        const x1 = D1 / D;
        const x2 = D2 / D;
        solution.innerHTML = `<strong>x₁ = D₁/D = ${fmt(x1, 3)}</strong><strong>x₂ = D₂/D = ${fmt(x2, 3)}</strong><span>${Math.abs(D) < 0.08 ? "仍有唯一解，但两列接近共线；分母很小，面积比会放大扰动。" : "D≠0，因此存在唯一解；两个坐标就是两个有向面积比。"}</span>`;
      } else {
        const kind = M().classifySystem2(state.A, state.b).kind;
        solution.innerHTML = kind === "infinite"
          ? "<strong>D=0，列空间塌缩成一条线</strong><span>b 仍在线上，所以有无穷多种表示。</span>"
          : "<strong>D=0，列空间塌缩成一条线</strong><span>b 不在线上，所以没有任何列组合能到达它。</span>";
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
        <button type="button" data-cramer-preset="near">接近奇异</button>
        <button type="button" data-cramer-preset="infinite">D=0 · 无穷多解</button>
        <button type="button" data-cramer-preset="none">D=0 · 无解</button>`;
      const stage = `<div class="ch2-cinema-stage"><svg data-c7-svg viewBox="0 0 1000 580" role="img" aria-label="三个并列平行四边形分别表示 D、D1、D2，从面积比读出克拉默坐标">${defs("c7")}<text x="40" y="52" class="cinema-kicker">克拉默法则不是三个孤立行列式</text><text x="40" y="86" class="cinema-title">把 b 换进一列，新的面积与原面积之比就是坐标</text><g data-c7-scenes></g></svg></div>`;
      const after = `<div class="ch2-cinema-equation-grid is-compact"><div><span>原面积 D</span><strong data-d></strong></div><i>→</i><div><span>替换第一列 D₁</span><strong data-d1></strong></div><i>→</i><div><span>替换第二列 D₂</span><strong data-d2></strong></div></div><div class="ch2-cinema-conclusion is-column" data-sol></div>`;
      root.innerHTML = `<h2>交互实验</h2>${cinemaShell(
        "把克拉默法则看成两个面积比",
        "左、中、右三个画面使用同一坐标尺度。原基底面积是分母，把 b 换进第 1 列或第 2 列得到两个分子。",
        "先看唯一解，再切到接近奇异。最后比较 D=0 时 b 在线上与不在线上的两种完全不同结果。",
        controls,
        stage,
        after,
      )}`;
      return mountCramerCinema(root);
    },
  });
})();
