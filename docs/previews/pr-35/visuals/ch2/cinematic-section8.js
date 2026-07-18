/* Chapter 2 geometry-first interaction — section 8. */
(() => {
  const { M, fmt, setActive, softArrowPath, cinemaShell, defs } = window.Ch2Cinema;

  function mountLaplaceCinema(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const A = [[1, 2, 0, 1], [0, 1, 1, 0], [2, 0, 1, 1], [1, 1, 0, 2]];
    const rows = [0, 1];
    const pairs = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
    let selected = 0;

    function contribution(cols) {
      const complementRows = M().complementIndices(4, rows);
      const complementCols = M().complementIndices(4, cols);
      const minor = M().submatrix(A, rows, cols);
      const complement = M().submatrix(A, complementRows, complementCols);
      const minorDet = M().det2(minor);
      const complementDet = M().det2(complement);
      const exponent = rows.reduce((sum, value) => sum + value + 1, 0)
        + cols.reduce((sum, value) => sum + value + 1, 0);
      const sign = exponent % 2 === 0 ? 1 : -1;
      return { cols, complementCols, minorDet, complementDet, sign, term: sign * minorDet * complementDet };
    }

    const all = pairs.map(contribution);
    const total = all.reduce((sum, item) => sum + item.term, 0);
    const svg = root.querySelector("[data-c8-laplace-svg]");

    function render() {
      const item = all[selected];
      const x0 = 90;
      const y0 = 150;
      const gap = 92;
      const size = 68;
      svg.querySelector("[data-c8-cells]").innerHTML = A.map((row, r) => row.map((value, c) => {
        const primary = rows.includes(r) && item.cols.includes(c);
        const complement = !rows.includes(r) && item.complementCols.includes(c);
        return `
          <g class="cinema-lap-cell${primary ? " is-primary" : ""}${complement ? " is-complement" : ""}">
            <rect x="${x0 + c * gap}" y="${y0 + r * gap}" width="${size}" height="${size}" rx="14" />
            <text x="${x0 + c * gap + size / 2}" y="${y0 + r * gap + 43}" text-anchor="middle">${value}</text>
          </g>`;
      }).join("")).join("");
      root.querySelector("[data-pair-cols]").textContent = item.cols.map((col) => col + 1).join("、");
      root.querySelector("[data-pair-comp]").textContent = item.complementCols.map((col) => col + 1).join("、");
      root.querySelector("[data-pair-minor]").textContent = fmt(item.minorDet, 2);
      root.querySelector("[data-pair-sign]").textContent = item.sign > 0 ? "+1" : "−1";
      root.querySelector("[data-pair-complement]").textContent = fmt(item.complementDet, 2);
      root.querySelector("[data-pair-term]").textContent = fmt(item.term, 2);
      root.querySelector("[data-pair-sum]").textContent = fmt(total, 2);
      root.querySelector("[data-pair-det]").textContent = fmt(M().determinant(A), 2);
    }

    root.querySelectorAll("[data-pair]").forEach((button) => button.addEventListener("click", () => {
      selected = Number(button.dataset.pair);
      setActive(root, "[data-pair]", button);
      render();
    }, { signal }));

    render();
    return () => controller.abort();
  }

  function mountProductCinema(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-c8-product-svg]");
    const I = [[1, 0], [0, 1]];
    let current = { A: [[2, 0], [0, 1]], B: [[1.5, 0], [0, 1]] };
    let busy = false;
    const presets = {
      scale: { A: [[2, 0], [0, 1]], B: [[1.5, 0], [0, 1]] },
      shear: { A: [[1.2, 0], [0, 1]], B: [[1, 1], [0, 1]] },
      mirror: { A: [[0, -1], [1, 0]], B: [[-1, 0], [0, 1]] },
      project: { A: [[1, 0], [0, 1]], B: [[1, 0], [0, 0]] },
    };
    const panels = [{ x: 35 }, { x: 350 }, { x: 665 }];

    function geometry(matrix, panel) {
      const origin = [panel.x + 82, 420];
      const scale = 55;
      const map = ([x, y]) => [origin[0] + x * scale, origin[1] - y * scale];
      const a1 = [matrix[0][0], matrix[1][0]];
      const a2 = [matrix[0][1], matrix[1][1]];
      const p1 = map(a1);
      const p2 = map(a2);
      const p12 = map([a1[0] + a2[0], a1[1] + a2[1]]);
      return {
        origin,
        p1,
        p2,
        polygon: [origin, p1, p12, p2].map((point) => point.join(",")).join(" "),
      };
    }

    function setBusy(value) {
      busy = value;
      root.querySelectorAll("[data-prod-preset], [data-prod-replay]").forEach((button) => {
        button.disabled = value;
      });
    }

    function paint(stageB, stageAB) {
      const matrices = [I, stageB, stageAB];
      svg.querySelector("[data-c8-product-scenes]").innerHTML = panels.map((panel, index) => {
        const determinant = M().det2(matrices[index]);
        const caption = index === 0 ? "单位基 e₁,e₂" : index === 1 ? "先经过 B" : "再经过 A，得到 AB";
        const g = geometry(matrices[index], panel);
        return `
          <g class="cinema-product-panel" data-product-panel="${index}">
            <rect x="${panel.x}" y="108" width="300" height="400" rx="24" class="cinema-panel-bg" />
            <text x="${panel.x + 22}" y="144" class="cinema-small">${caption}</text>
            <polygon points="${g.polygon}" class="cinema-parallelogram${determinant < 0 ? " is-negative" : ""}${Math.abs(determinant) < 1e-8 ? " is-zero" : ""}" />
            <path d="${softArrowPath(g.origin[0], g.origin[1], g.p1[0], g.p1[1], { halfWidth: 2.8, headHalf: 7.5 })}" class="cinema-vector cyan" />
            <path d="${softArrowPath(g.origin[0], g.origin[1], g.p2[0], g.p2[1], { halfWidth: 2.8, headHalf: 7.5 })}" class="cinema-vector orange" />
            <circle cx="${g.origin[0]}" cy="${g.origin[1]}" r="3.8" class="cinema-origin" />
            <text x="${g.p1[0] + 8}" y="${g.p1[1] - 8}" class="cinema-label cyan">v₁</text>
            <text x="${g.p2[0] + 8}" y="${g.p2[1] - 8}" class="cinema-label orange">v₂</text>
            <text x="${panel.x + 22}" y="486" class="cinema-title-small">det = ${fmt(determinant, 3)}</text>
          </g>`;
      }).join("");

      const dA = M().det2(current.A);
      const dB = M().det2(stageB);
      const dAB = M().det2(stageAB);
      root.querySelector("[data-da]").textContent = fmt(dA, 3);
      root.querySelector("[data-db]").textContent = fmt(dB, 3);
      root.querySelector("[data-prod]").textContent = fmt(dA * dB, 3);
      root.querySelector("[data-dab]").textContent = fmt(dAB, 3);
      root.querySelector("[data-product-note]").textContent = Math.abs(dB) < 1e-8
        ? "B 已把两支向量压到同一直线上；二维面积一旦丢失，后面的 A 无法恢复。"
        : "同一对基向量先经过 B，再经过 A；第二步作用在第一步的结果上，所以面积倍率连续相乘。";
    }

    function renderFinal() {
      paint(current.B, M().mul2(current.A, current.B));
    }

    async function play() {
      if (busy) return;
      if (M().reducedMotion()) {
        renderFinal();
        return;
      }
      setBusy(true);
      const B = current.B.map((row) => row.slice());
      const AB = M().mul2(current.A, current.B);
      try {
        paint(I, B);
        await M().animateTo(svg, 0, 1, 700, (t) => {
          paint(M().lerpMat2(I, B, M().easeInOutCubic(t)), B);
        });
        paint(B, B);
        await M().animateTo(svg, 0, 1, 760, (t) => {
          paint(B, M().lerpMat2(B, AB, M().easeInOutCubic(t)));
        });
        renderFinal();
      } finally {
        setBusy(false);
      }
    }

    root.querySelectorAll("[data-prod-preset]").forEach((button) => button.addEventListener("click", () => {
      if (busy) return;
      const preset = presets[button.dataset.prodPreset];
      current = { A: preset.A.map((row) => row.slice()), B: preset.B.map((row) => row.slice()) };
      setActive(root, "[data-prod-preset]", button);
      void play();
    }, { signal }));

    root.querySelector("[data-prod-replay]").addEventListener("click", () => {
      void play();
    }, { signal });

    void play();
    return () => {
      controller.abort();
      M().cancelAnim(svg);
    };
  }

  window.extendChapter2Renderer("laplace-and-product", {
    interactive(root) {
      if (!root) return;
      const pairButtons = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]
        .map((pair, index) => `<button type="button" data-pair="${index}" class="${index === 0 ? "is-active" : ""}">列 ${pair.map((value) => value + 1).join("、")}</button>`)
        .join("");
      root.innerHTML = `<h2>交互实验</h2>
        ${cinemaShell(
          "先看一个子式怎样唯一确定它的互补子式",
          "固定前两行并选择两列。青色区域占用这些行列后，橙色区域只能落在剩余行列；二者不是两块随意上色的卡片，而是一组互补坐标选择。",
          "切换六种列组合，只观察青色与橙色区域怎样共同覆盖全部行列。",
          pairButtons,
          `<div class="ch2-cinema-stage">
            <svg data-c8-laplace-svg viewBox="0 0 1000 560" role="img" aria-label="四阶矩阵中的子式和互补子式共同覆盖全部行列">
              ${defs("c8l")}
              <text x="40" y="44" class="cinema-kicker">选中一组行列，剩余位置自动成为互补子式</text>
              <text x="40" y="76" class="cinema-title">局部选择怎样拼回整个行列式</text>
              <g data-c8-cells></g>
              <g transform="translate(570 150)">
                <rect x="-22" y="-24" width="350" height="344" rx="22" class="cinema-panel-bg" />
                <text class="cinema-small">所选列</text>
                <text y="48" class="cinema-title-small" data-pair-cols></text>
                <text y="112" class="cinema-small">互补列</text>
                <text y="160" class="cinema-title-small" data-pair-comp></text>
                <text y="224" class="cinema-small">这一项贡献</text>
                <text y="272" class="cinema-title-small"><tspan data-pair-minor></tspan> × <tspan data-pair-sign></tspan> × <tspan data-pair-complement></tspan> = <tspan data-pair-term></tspan></text>
              </g>
            </svg>
          </div>`,
          `<div class="ch2-cinema-equation-grid is-compact"><div><span>六项贡献之和</span><strong data-pair-sum></strong></div><i>=</i><div><span>原行列式 det(A)</span><strong data-pair-det></strong></div></div>`,
        )}
        ${cinemaShell(
          "再看两次线性变换怎样连续改变同一块面积",
          "三幅图中的箭头始终表示两支基向量。第二幅不是结果标签，第三幅也不是重新开始；它们是同一对向量依次经过 B、再经过 A 的连续过程。",
          "先沿 I → B → AB 阅读箭头，再比较三个面积。含投影时，注意两支箭头何时落到同一直线上。",
          `<button type="button" class="is-active" data-prod-preset="scale">两次缩放</button><button type="button" data-prod-preset="shear">剪切后缩放</button><button type="button" data-prod-preset="mirror">镜像后旋转</button><button type="button" data-prod-preset="project">含投影</button><button type="button" data-prod-replay>重播 I→B→AB</button>`,
          `<div class="ch2-cinema-stage">
            <svg data-c8-product-svg viewBox="0 0 1000 560" role="img" aria-label="同一对基向量先经过 B 再经过 A，面积倍率连续相乘">
              ${defs("c8p")}
              <text x="40" y="44" class="cinema-kicker">同一对向量 · 两次变换 · 三个连续状态</text>
              <text x="40" y="76" class="cinema-title">面积先乘 det(B)，再乘 det(A)</text>
              <g data-c8-product-scenes></g>
            </svg>
          </div>`,
          `<div class="ch2-cinema-equation-grid is-compact"><div><span>det(A)</span><strong data-da></strong></div><i>×</i><div><span>det(B)</span><strong data-db></strong></div><i>=</i><div><span>乘积</span><strong data-prod></strong></div><i>=</i><div><span>det(AB)</span><strong data-dab></strong></div></div><div class="ch2-cinema-conclusion"><strong>连续变换</strong><span data-product-note></span></div>`,
        )}`;
      const cleanupLaplace = mountLaplaceCinema(root);
      const cleanupProduct = mountProductCinema(root);
      return () => {
        cleanupProduct?.();
        cleanupLaplace?.();
      };
    },
  });
})();