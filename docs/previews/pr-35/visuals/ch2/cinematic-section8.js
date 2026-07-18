/* Chapter 2 cinematic interaction — section 8. */
(() => {
  const { M, fmt, setActive, cinemaShell, defs } = window.Ch2Cinema;

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
      const exponent = rows.reduce((sum, value) => sum + value + 1, 0) + cols.reduce((sum, value) => sum + value + 1, 0);
      const sign = exponent % 2 === 0 ? 1 : -1;
      return { cols, complementCols, minorDet, complementDet, sign, term: sign * minorDet * complementDet };
    }

    const all = pairs.map(contribution);
    const total = all.reduce((sum, item) => sum + item.term, 0);
    const svg = root.querySelector("[data-c8-laplace-svg]");

    function render() {
      const item = all[selected];
      const x0 = 90;
      const y0 = 160;
      const gap = 92;
      const size = 68;
      svg.querySelector("[data-c8-cells]").innerHTML = A.map((row, r) => row.map((value, c) => {
        const primary = rows.includes(r) && item.cols.includes(c);
        const complement = !rows.includes(r) && item.complementCols.includes(c);
        return `<g class="cinema-lap-cell${primary ? " is-primary" : ""}${complement ? " is-complement" : ""}"><rect x="${x0 + c * gap}" y="${y0 + r * gap}" width="${size}" height="${size}" rx="16"/><text x="${x0 + c * gap + size / 2}" y="${y0 + r * gap + 43}" text-anchor="middle">${value}</text></g>`;
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
    let current = { A: [[2, 0], [0, 1]], B: [[1.5, 0], [0, 1]] };
    const presets = {
      scale: { A: [[2, 0], [0, 1]], B: [[1.5, 0], [0, 1]] },
      shear: { A: [[1.2, 0], [0, 1]], B: [[1, 1], [0, 1]] },
      mirror: { A: [[0, -1], [1, 0]], B: [[-1, 0], [0, 1]] },
      project: { A: [[1, 0], [0, 1]], B: [[1, 0], [0, 0]] },
    };
    const panels = [{ x: 35 }, { x: 350 }, { x: 665 }];

    function polygon(A, panel) {
      const ox = panel.x + 82;
      const oy = 420;
      const scale = 55;
      const map = ([x, y]) => [ox + x * scale, oy - y * scale];
      return [[0, 0], [A[0][0], A[1][0]], [A[0][0] + A[0][1], A[1][0] + A[1][1]], [A[0][1], A[1][1]]].map(map).map((point) => point.join(",")).join(" ");
    }

    function render() {
      const I = [[1, 0], [0, 1]];
      const AB = M().mul2(current.A, current.B);
      const matrices = [I, current.B, AB];
      svg.querySelector("[data-c8-product-scenes]").innerHTML = panels.map((panel, index) => {
        const determinant = M().det2(matrices[index]);
        const caption = index === 0 ? "单位形 I" : index === 1 ? "第一步：I → B" : "第二步：B → AB";
        return `<g><rect x="${panel.x}" y="118" width="300" height="390" rx="26" class="cinema-panel-bg"/><text x="${panel.x + 22}" y="154" class="cinema-small">${caption}</text><polygon points="${polygon(matrices[index], panel)}" class="cinema-parallelogram${determinant < 0 ? " is-negative" : ""}${Math.abs(determinant) < 1e-8 ? " is-zero" : ""}"/><text x="${panel.x + 22}" y="486" class="cinema-title-small">det = ${fmt(determinant, 3)}</text></g>`;
      }).join("");
      const dA = M().det2(current.A);
      const dB = M().det2(current.B);
      const dAB = M().det2(AB);
      root.querySelector("[data-da]").textContent = fmt(dA, 3);
      root.querySelector("[data-db]").textContent = fmt(dB, 3);
      root.querySelector("[data-prod]").textContent = fmt(dA * dB, 3);
      root.querySelector("[data-dab]").textContent = fmt(dAB, 3);
    }

    root.querySelectorAll("[data-prod-preset]").forEach((button) => button.addEventListener("click", () => {
      const preset = presets[button.dataset.prodPreset];
      current = { A: preset.A.map((row) => row.slice()), B: preset.B.map((row) => row.slice()) };
      setActive(root, "[data-prod-preset]", button);
      render();
    }, { signal }));
    root.querySelector("[data-prod-replay]").addEventListener("click", render, { signal });

    render();
    return () => controller.abort();
  }

  window.extendChapter2Renderer("laplace-and-product", {
    interactive(root) {
      if (!root) return;
      const pairButtons = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]].map((pair, index) => `<button type="button" data-pair="${index}" class="${index === 0 ? "is-active" : ""}">列 ${pair.map((value) => value + 1).join("、")}</button>`).join("");
      root.innerHTML = `<h2>交互实验</h2>
        ${cinemaShell(
          "先看一组子式怎样找到它的互补子式",
          "固定前两行，再选择两列。青色块是子式，橙色块是互补子式；它们的位置关系决定符号，二者乘积形成一项贡献。",
          "逐个切换六种列组合，观察青色块与橙色块怎样互补覆盖整个 4×4 矩阵。",
          pairButtons,
          `<div class="ch2-cinema-stage"><svg data-c8-laplace-svg viewBox="0 0 1000 580" role="img" aria-label="四阶矩阵中的子式和互补子式配对">${defs("c8l")}<text x="40" y="52" class="cinema-kicker">广义 Laplace 展开</text><text x="40" y="86" class="cinema-title">选中的子式与互补子式共同覆盖全部行列</text><g data-c8-cells></g><g transform="translate(570 164)"><text class="cinema-small">所选列</text><text y="52" class="cinema-title-small" data-pair-cols></text><text y="126" class="cinema-small">互补列</text><text y="178" class="cinema-title-small" data-pair-comp></text><text y="264" class="cinema-small">一项贡献</text><text y="316" class="cinema-title-small"><tspan data-pair-minor></tspan> × <tspan data-pair-sign></tspan> × <tspan data-pair-complement></tspan> = <tspan data-pair-term></tspan></text></g></svg></div>`,
          `<div class="ch2-cinema-equation-grid is-compact"><div><span>六项和</span><strong data-pair-sum></strong></div><i>=</i><div><span>原 det</span><strong data-pair-det></strong></div></div>`,
        )}
        ${cinemaShell(
          "再看两次变换怎样把面积倍率相乘",
          "右侧第三个画面不是重新从单位形开始，而是从 B 已经得到的形状继续施加 A。",
          "比较两次缩放、镜像与投影。尤其观察投影把中间面积压成 0 后，第二次变换再也无法恢复二维面积。",
          `<button type="button" class="is-active" data-prod-preset="scale">两次缩放</button><button type="button" data-prod-preset="shear">剪切后缩放</button><button type="button" data-prod-preset="mirror">镜像后旋转</button><button type="button" data-prod-preset="project">含投影</button><button type="button" data-prod-replay>重播</button>`,
          `<div class="ch2-cinema-stage"><svg data-c8-product-svg viewBox="0 0 1000 580" role="img" aria-label="单位形先经过 B 再经过 A 得到 AB">${defs("c8p")}<text x="40" y="52" class="cinema-kicker">行列式的乘法规则</text><text x="40" y="86" class="cinema-title">面积先乘 det(B)，再乘 det(A)</text><g data-c8-product-scenes></g></svg></div>`,
          `<div class="ch2-cinema-equation-grid is-compact"><div><span>det(A)</span><strong data-da></strong></div><i>×</i><div><span>det(B)</span><strong data-db></strong></div><i>=</i><div><span>乘积</span><strong data-prod></strong></div><i>=</i><div><span>det(AB)</span><strong data-dab></strong></div></div>`,
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
