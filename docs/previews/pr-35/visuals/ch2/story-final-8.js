(() => {
  const C = window.Ch2Story, V = window.Ch2FinalVector;
  if (!C || !V || typeof window.extendChapter2Renderer !== "function") return;
  const { M, fmt, shell, setActive, mapPoint, pointsString, parallelogram, animate, determinant } = C;
  const { vectorMarkup, gridMarkup } = V;

  function mount(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const A4 = [[1, 2, 0, 1], [0, 1, 1, 0], [2, 0, 1, 1], [1, 1, 0, 2]];
    const rows = [0, 1];
    const pairs = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
    let pairIndex = 0;
    const lapSvg = root.querySelector("[data-laplace-story-svg]");
    const prodSvg = root.querySelector("[data-product-story-svg]");
    const I = [[1, 0], [0, 1]];
    let product = { A: [[1.25, 0], [0, 1]], B: [[1.4, .45], [0, 1]] };
    let productBusy = false;

    const laplaceReadouts = [...root.querySelectorAll("[data-laplace-readout]")];
    const productReadouts = [...root.querySelectorAll("[data-product-readout]")];

    function showReadoutGroup(group) {
      const productActive = group === "product";
      laplaceReadouts.forEach((cell) => { cell.hidden = productActive; });
      productReadouts.forEach((cell) => { cell.hidden = !productActive; });
      root.querySelector("[data-lap-message]").hidden = productActive;
      root.querySelector("[data-product-message]").hidden = !productActive;
    }

    function laplaceInfo(cols) {
      const complementRows = [2, 3];
      const complementCols = [0, 1, 2, 3].filter((index) => !cols.includes(index));
      const minor = rows.map((r) => cols.map((c) => A4[r][c]));
      const complement = complementRows.map((r) => complementCols.map((c) => A4[r][c]));
      const exponent = rows.reduce((sum, value) => sum + value + 1, 0) + cols.reduce((sum, value) => sum + value + 1, 0);
      const sign = exponent % 2 === 0 ? 1 : -1;
      return { cols, complementCols, sign, minorDet: determinant(minor), complementDet: determinant(complement) };
    }

    function renderLaplace() {
      const info = laplaceInfo(pairs[pairIndex]);
      const x0 = 92, y0 = 90, size = 64, gap = 14;
      lapSvg.querySelector("[data-laplace-cells]").innerHTML = A4.map((row, r) => row.map((value, c) => {
        const primary = rows.includes(r) && info.cols.includes(c);
        const complement = !rows.includes(r) && info.complementCols.includes(c);
        const muted = !primary && !complement;
        return `<g class="story-laplace-cell${primary ? " is-primary" : ""}${complement ? " is-complement" : ""}${muted ? " is-muted" : ""}"><rect x="${x0 + c * (size + gap)}" y="${y0 + r * (size + gap)}" width="${size}" height="${size}" rx="13"/><text x="${x0 + c * (size + gap) + size / 2}" y="${y0 + r * (size + gap) + size / 2 + 1}" text-anchor="middle" dominant-baseline="middle">${value}</text></g>`;
      }).join("")).join("");
      const term = info.sign * info.minorDet * info.complementDet;
      root.querySelector("[data-lap-cols]").textContent = info.cols.map((c) => c + 1).join("、");
      root.querySelector("[data-lap-comp]").textContent = info.complementCols.map((c) => c + 1).join("、");
      root.querySelectorAll("[data-lap-minor]").forEach((node) => { node.textContent = fmt(info.minorDet, 3); });
      root.querySelectorAll("[data-lap-sign]").forEach((node) => { node.textContent = info.sign > 0 ? "+1" : "−1"; });
      root.querySelectorAll("[data-lap-complement]").forEach((node) => { node.textContent = fmt(info.complementDet, 3); });
      root.querySelector("[data-lap-term]").textContent = fmt(term, 3);
      root.querySelector("[data-lap-message]").textContent = "青色子式占用两行两列，橙色互补子式只能占据剩余行列；两块合起来覆盖全部坐标位置。";
    }

    function geometry(matrix) {
      const origin = [300, 400], scale = 95;
      const a1 = [matrix[0][0], matrix[1][0]];
      const a2 = [matrix[0][1], matrix[1][1]];
      return { origin, a1, a2, p1: mapPoint(origin, scale, a1), p2: mapPoint(origin, scale, a2), polygon: pointsString(parallelogram(origin, scale, a1, a2)) };
    }

    function spanLine(g) {
      const nonzero = Math.hypot(...g.a1) > 1e-8 ? g.a1 : g.a2;
      const norm = Math.hypot(...nonzero);
      if (norm < 1e-8) return "";
      const unit = [nonzero[0] / norm, nonzero[1] / norm];
      const q1 = mapPoint(g.origin, 95, [-3.8 * unit[0], -3.8 * unit[1]]);
      const q2 = mapPoint(g.origin, 95, [5.6 * unit[0], 5.6 * unit[1]]);
      return `<line x1="${q1[0]}" y1="${q1[1]}" x2="${q2[0]}" y2="${q2[1]}" class="story-subspace-line"/>`;
    }

    function renderProduct(current, ghost, label) {
      const AB = M().mul2(product.A, product.B);
      const g = geometry(current), gg = geometry(ghost);
      prodSvg.querySelector("[data-product-ghost]").setAttribute("points", gg.polygon);
      prodSvg.querySelector("[data-product-current]").setAttribute("points", g.polygon);
      const collapsed = Math.abs(M().det2(current)) < 1e-8;
      prodSvg.querySelector("[data-product-vectors]").innerHTML = `${collapsed ? spanLine(g) : ""}${vectorMarkup(g.origin, g.p1, "primary", "v₁")}${vectorMarkup(g.origin, g.p2, "secondary", "v₂")}<circle class="story-origin" cx="${g.origin[0]}" cy="${g.origin[1]}" r="4"/>`;
      root.querySelector("[data-product-step]").textContent = label;
      root.querySelector("[data-product-da]").textContent = fmt(M().det2(product.A), 3);
      root.querySelector("[data-product-db]").textContent = fmt(M().det2(product.B), 3);
      root.querySelector("[data-product-dab]").textContent = fmt(M().det2(AB), 3);
      root.querySelector("[data-product-message]").textContent = label.includes("第一步")
        ? "同一对基向量正在变成 B 的两列；它们围成的面积倍率是 det(B)。"
        : label.includes("第二步")
          ? "第二次变换从已经得到的两支 B 向量继续，而不是重新从单位正方形开始。"
          : Math.abs(M().det2(product.B)) < 1e-8
            ? "B 已把两支向量压到同一直线上，二维面积丢失后，A 无法恢复它。"
            : "两次变换连续作用在同一对向量上，因此总面积倍率相乘。";
    }

    async function playProduct() {
      if (productBusy) return;
      productBusy = true;
      root.querySelectorAll("[data-product-preset], [data-product-play]").forEach((button) => { button.disabled = true; });
      const B = product.B.map((row) => row.slice());
      const AB = M().mul2(product.A, product.B);
      try {
        if (M().reducedMotion()) {
          renderProduct(AB, B, "完成：I → B → AB");
          return;
        }
        await animate(prodSvg, 680, (t) => renderProduct(M().lerpMat2(I, B, t), I, "第一步：I → B"));
        await animate(prodSvg, 760, (t) => renderProduct(M().lerpMat2(B, AB, t), B, "第二步：B → AB"));
        renderProduct(AB, B, "完成：两个面积倍率相乘");
      } finally {
        productBusy = false;
        root.querySelectorAll("[data-product-preset], [data-product-play]").forEach((button) => { button.disabled = false; });
      }
    }

    root.querySelectorAll("[data-story8-tab]").forEach((button) => button.addEventListener("click", () => {
      setActive(root, "[data-story8-tab]", button);
      const productTab = button.dataset.story8Tab === "product";
      root.querySelector("[data-story8-laplace]").hidden = productTab;
      root.querySelector("[data-story8-product]").hidden = !productTab;
      showReadoutGroup(productTab ? "product" : "laplace");
      if (productTab) void playProduct();
    }, { signal }));

    root.querySelectorAll("[data-laplace-pair]").forEach((button) => button.addEventListener("click", () => {
      pairIndex = Number(button.dataset.laplacePair);
      setActive(root, "[data-laplace-pair]", button);
      renderLaplace();
    }, { signal }));

    root.querySelectorAll("[data-product-preset]").forEach((button) => button.addEventListener("click", () => {
      setActive(root, "[data-product-preset]", button);
      const key = button.dataset.productPreset;
      if (key === "scale") product = { A: [[1.25, 0], [0, 1]], B: [[1.4, 0], [0, 1]] };
      if (key === "shear") product = { A: [[1.2, 0], [0, 1]], B: [[1, .7], [0, 1]] };
      if (key === "mirror") product = { A: [[0, -1], [1, 0]], B: [[-1, 0], [0, 1]] };
      if (key === "project") product = { A: [[1, 0], [0, 1]], B: [[1, 0], [0, 0]] };
      void playProduct();
    }, { signal }));

    root.querySelector("[data-product-play]").addEventListener("click", () => { void playProduct(); }, { signal });
    renderLaplace();
    renderProduct(I, I, "准备：从单位基 e₁,e₂ 出发");
    showReadoutGroup("laplace");
    return () => { controller.abort(); M().cancelAnim(prodSvg); };
  }

  window.extendChapter2Renderer("laplace-and-product", {
    interactive(root) {
      if (!root) return;
      const pairButtons = [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]].map((pair, i) => `<button type="button" data-laplace-pair="${i}" class="${i === 0 ? "is-active" : ""}" aria-pressed="${i === 0}">列 ${pair.join("、")}</button>`).join("");
      const productButtons = `<button type="button" data-product-preset="scale" class="is-active" aria-pressed="true">两次缩放</button><button type="button" data-product-preset="shear">剪切后缩放</button><button type="button" data-product-preset="mirror">镜像后旋转</button><button type="button" data-product-preset="project">含投影</button><button type="button" data-product-play>重播</button>`;
      const controls = `<button type="button" data-story8-tab="laplace" class="is-active" aria-pressed="true">互补子式</button><button type="button" data-story8-tab="product" aria-pressed="false">复合变换</button>`;
      const stage = `<div data-story8-laplace><div class="ch2-story-controls">${pairButtons}</div><div class="ch2-story-stage is-plain"><svg data-laplace-story-svg viewBox="0 0 900 500" role="img" aria-label="四阶矩阵中的子式与互补子式"><text x="36" y="44" class="story-caption">固定前两行，再选两列；剩余行列自动形成互补子式</text><g data-laplace-cells></g><rect x="490" y="75" width="340" height="330" rx="22" class="story-panel-soft"/><text x="520" y="115" class="story-label-small">所选列</text><text x="520" y="154" class="story-label" data-lap-cols></text><text x="520" y="215" class="story-label-small">互补列</text><text x="520" y="254" class="story-label" data-lap-comp></text><text x="520" y="330" class="story-label-small">本项贡献</text><text x="520" y="374" class="story-label"><tspan data-lap-minor></tspan> × <tspan data-lap-sign></tspan> × <tspan data-lap-complement></tspan> = <tspan data-lap-term></tspan></text></svg></div></div><div data-story8-product hidden><div class="ch2-story-controls">${productButtons}</div><div class="ch2-story-stage"><svg data-product-story-svg viewBox="0 0 900 500" role="img" aria-label="同一对基向量依次经历 B 和 A 两次线性变换">${gridMarkup(900,500)}<line class="story-axis" x1="0" y1="400" x2="900" y2="400"/><line class="story-axis" x1="300" y1="0" x2="300" y2="500"/><polygon data-product-ghost class="story-ghost"/><polygon data-product-current class="story-fill-primary"/><g data-product-vectors></g><rect x="500" y="118" width="330" height="190" rx="20" class="story-panel-soft"/><text x="530" y="160" class="story-label" data-product-step></text><text x="530" y="215" class="story-caption">第一步：两支基向量经过 B</text><text x="530" y="255" class="story-caption">第二步：从 B 的结果继续经过 A</text></svg></div></div>`;
      const formula = `<div data-laplace-readout><span>子式 det</span><strong data-lap-minor></strong></div><div data-laplace-readout><span>位置符号</span><strong data-lap-sign></strong></div><div data-laplace-readout><span>互补子式 det</span><strong data-lap-complement></strong></div><div data-product-readout hidden><span>det(A)</span><strong data-product-da></strong></div><div data-product-readout hidden><span>det(B)</span><strong data-product-db></strong></div><div data-product-readout hidden><span>det(AB)</span><strong data-product-dab></strong></div>`;
      root.innerHTML = `<h2>交互实验</h2>${shell("互补子式负责分割坐标，乘法规则负责追踪同一对向量", "第一幕观察行列位置怎样互补；第二幕让两支真实的基向量依次经过 B 和 A，而不是只看三个没有方向的色块。", "先切换列组合，再进入复合变换。含投影时，观察两支箭头怎样落到同一直线上。", controls, stage, formula, `<strong>当前解释</strong><span data-lap-message></span><span data-product-message hidden></span>`)}`;
      return mount(root);
    },
  });
})();