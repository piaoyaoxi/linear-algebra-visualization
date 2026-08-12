(() => {
  const { M, tex, formalFromSection, labIntro, mountPrediction } = window.Ch2PresentationUtils;

  function matrixTex(matrix) {
    return tex(`\\begin{bmatrix}${matrix.map((row) => row.map((value) => M().formatNum(value, 3)).join("&")).join("\\\\")}\\end{bmatrix}`);
  }

  function mountLaplacePairing(root, section) {
    const controller = new AbortController();
    const { signal } = controller;
    mountPrediction(root, section, signal);
    const matrix = [[1, 2, 0, 1], [0, 1, 1, 0], [2, 0, 1, 1], [1, 1, 0, 2]];
    const rows = [0, 1];
    const pairs = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
    let selected = 0;

    function contribution(cols) {
      const complementRows = M().complementIndices(4, rows);
      const complementCols = M().complementIndices(4, cols);
      const minorMatrix = M().submatrix(matrix, rows, cols);
      const complementMatrix = M().submatrix(matrix, complementRows, complementCols);
      const minor = M().determinant(minorMatrix);
      const complement = M().determinant(complementMatrix);
      const exponent = rows.reduce((sum, value) => sum + value + 1, 0) + cols.reduce((sum, value) => sum + value + 1, 0);
      const sign = exponent % 2 === 0 ? 1 : -1;
      return { cols, complementCols, minorMatrix, complementMatrix, minor, complement, sign, term: sign * minor * complement };
    }

    const all = pairs.map(contribution);
    const total = all.reduce((sum, item) => sum + item.term, 0);

    function render() {
      const list = root.querySelector("[data-pair-list]");
      list.innerHTML = all.map((item, index) => `<button type="button" class="ch2-pair${index === selected ? " is-active" : ""}" data-pair="${index}" aria-pressed="${index === selected}"><span>列 ${item.cols.map((value) => value + 1).join("")}</span><strong>${M().formatNum(item.term, 2)}</strong></button>`).join("");
      list.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
        selected = Number(button.dataset.pair);
        render();
      }, { signal }));
      const item = all[selected];
      root.querySelector("[data-pair-cols]").textContent = item.cols.map((value) => value + 1).join(", ");
      root.querySelector("[data-pair-comp]").textContent = item.complementCols.map((value) => value + 1).join(", ");
      root.querySelector("[data-pair-minor-matrix]").innerHTML = matrixTex(item.minorMatrix);
      root.querySelector("[data-pair-complement-matrix]").innerHTML = matrixTex(item.complementMatrix);
      root.querySelector("[data-pair-minor]").textContent = M().formatNum(item.minor, 3);
      root.querySelector("[data-pair-sign]").textContent = item.sign > 0 ? "+1" : "−1";
      root.querySelector("[data-pair-complement]").textContent = M().formatNum(item.complement, 3);
      root.querySelector("[data-pair-term]").textContent = M().formatNum(item.term, 3);
      root.querySelector("[data-pair-sum]").textContent = M().formatNum(total, 3);
      root.querySelector("[data-pair-det]").textContent = M().formatNum(M().determinant(matrix), 3);
      root.querySelector("[data-pair-explain]").textContent = `符号指数 = (1+2)+(${item.cols.map((value) => value + 1).join("+")})，因此本项符号为 ${item.sign > 0 ? "+1" : "−1"}。`;
      root.querySelectorAll("[data-laplace-table] td").forEach((cell) => {
        const row = Number(cell.dataset.r);
        const col = Number(cell.dataset.c);
        cell.classList.toggle("is-selected", rows.includes(row) && item.cols.includes(col));
        cell.classList.toggle("is-complement", !rows.includes(row) && item.complementCols.includes(col));
      });
    }

    const table = root.querySelector("[data-laplace-table]");
    table.innerHTML = matrix.map((row, rowIndex) => `<tr>${row.map((value, colIndex) => `<td data-r="${rowIndex}" data-c="${colIndex}">${value}</td>`).join("")}</tr>`).join("");
    render();
    return () => controller.abort();
  }

  function mountProduct(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const presets = {
      scale: { A: [[2, 0], [0, 1]], B: [[1.5, 0], [0, 1]] },
      shearScale: { A: [[1.2, 0], [0, 1]], B: [[1, 1], [0, 1]] },
      mirrorRotate: { A: [[0, -1], [1, 0]], B: [[-1, 0], [0, 1]] },
      doubleMirror: { A: [[-1, 0], [0, 1]], B: [[1, 0], [0, -1]] },
      project: { A: [[1, 0], [0, 1]], B: [[1, 0], [0, 0]] },
    };
    const cI = root.querySelector("[data-c-i]");
    const cB = root.querySelector("[data-c-b]");
    const cAB = root.querySelector("[data-c-ab]");
    let current = presets.scale;
    let busy = false;

    function setBusy(value) {
      busy = value;
      root.querySelectorAll("[data-prod-preset], [data-prod-replay]").forEach((button) => {
        button.disabled = value;
      });
    }

    function setFinalMeters(A, B, AB) {
      const dA = M().det2(A);
      const dB = M().det2(B);
      const dAB = M().det2(AB);
      root.querySelector("[data-da]").textContent = M().formatNum(dA, 3);
      root.querySelector("[data-db]").textContent = M().formatNum(dB, 3);
      root.querySelector("[data-prod]").textContent = M().formatNum(dA * dB, 3);
      root.querySelector("[data-dab]").textContent = M().formatNum(dAB, 3);
      const status = root.querySelector("[data-rule-status]");
      status.textContent = Math.abs(dAB - dA * dB) < 1e-8
        ? `验证完成：${M().formatNum(dAB, 3)} = ${M().formatNum(dA, 3)} × ${M().formatNum(dB, 3)}`
        : "数值未对齐，请重播。";
      status.className = Math.abs(dAB - dA * dB) < 1e-8 ? "is-positive" : "is-negative";
    }

    function paint(A, B) {
      const I = [[1, 0], [0, 1]];
      const AB = M().mul2(A, B);
      M().drawTransformScene(cI, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "单位形" });
      M().drawTransformScene(cB, B, { firstLabel: "Be₁", secondLabel: "Be₂", caption: "第一阶段：B" });
      M().drawTransformScene(cAB, AB, { firstLabel: "ABe₁", secondLabel: "ABe₂", caption: "第二阶段：A(B·)" });
      setFinalMeters(A, B, AB);
    }

    async function play(A, B) {
      if (busy) return;
      setBusy(true);
      current = { A, B };
      const I = [[1, 0], [0, 1]];
      const AB = M().mul2(A, B);
      const dA = M().det2(A);
      const dB = M().det2(B);
      const status = root.querySelector("[data-rule-status]");
      try {
        M().drawTransformScene(cI, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "单位形" });
        M().drawTransformScene(cB, I, { firstLabel: "e₁", secondLabel: "e₂", caption: "准备作用 B" });
        M().drawTransformScene(cAB, B, { firstLabel: "Be₁", secondLabel: "Be₂", caption: "第二阶段从 B 开始" });
        root.querySelector("[data-da]").textContent = M().formatNum(dA, 3);
        root.querySelector("[data-db]").textContent = "1";
        root.querySelector("[data-prod]").textContent = M().formatNum(dA, 3);
        root.querySelector("[data-dab]").textContent = M().formatNum(dB, 3);
        status.textContent = "第一阶段：单位形正在变为 B。右侧已经固定在第二阶段的真实起点 B。";
        status.className = "";

        await M().animateMatrix(cB, B, {
          duration: 700,
          drawOptions: { firstLabel: "Be₁", secondLabel: "Be₂", caption: "第一步：I → B" },
          onUpdate(intermediate) {
            const currentDB = M().det2(intermediate);
            root.querySelector("[data-db]").textContent = M().formatNum(currentDB, 3);
            root.querySelector("[data-prod]").textContent = M().formatNum(dA * currentDB, 3);
          },
        });

        root.querySelector("[data-db]").textContent = M().formatNum(dB, 3);
        root.querySelector("[data-prod]").textContent = M().formatNum(dA * dB, 3);
        status.textContent = "第二阶段：保持 B 的结果，再作用 A；右侧从 B 连续变为 AB。";

        await M().animateMatrix(cAB, AB, {
          duration: 780,
          drawOptions: { firstLabel: "ABe₁", secondLabel: "ABe₂", caption: "第二步：B → AB（再作用 A）" },
          onUpdate(intermediate) {
            root.querySelector("[data-dab]").textContent = M().formatNum(M().det2(intermediate), 3);
          },
        });
        paint(A, B);
      } finally {
        setBusy(false);
      }
    }

    root.querySelectorAll("[data-prod-preset]").forEach((button) => button.addEventListener("click", () => {
      if (busy) return;
      root.querySelectorAll("[data-prod-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      const preset = presets[button.dataset.prodPreset];
      play(preset.A, preset.B);
    }, { signal }));
    root.querySelector("[data-prod-replay]").addEventListener("click", () => play(current.A, current.B), { signal });
    window.addEventListener("resize", () => document.body.contains(cI) && paint(current.A, current.B), { signal, passive: true });

    play(current.A, current.B);
    return () => {
      controller.abort();
      [cI, cB, cAB].forEach((canvas) => M().cancelAnim(canvas));
    };
  }

  defineChapter2Renderer("laplace-and-product", {
    formal(formal, section) {
      if (!formal) return;
      formal.innerHTML = formalFromSection(section);
    },
    interactive(root, section) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          ${labIntro(section, "Laplace 展开 · 子式与互补子式", "固定前两行并逐项读取互补配对。", "laplace", false)}
          <div class="ch2-laplace-layout">
            <div class="ch2-pair-list" data-pair-list></div>
            <div class="ch2-laplace-main">
              <div class="ch2-matrix-box"><table class="ch2-matrix-table is-static ch2-laplace-table" data-laplace-table aria-label="四阶 Laplace 子式配对矩阵"></table></div>
              <div class="ch2-note"><strong>所选子矩阵</strong> <span data-pair-minor-matrix></span><br /><strong>互补子矩阵</strong> <span data-pair-complement-matrix></span></div>
            </div>
            <div class="ch2-meter ch2-laplace-meter">
                <div class="ch2-meter-card"><strong>所选列</strong><span data-pair-cols></span></div>
                <div class="ch2-meter-card"><strong>互补列</strong><span data-pair-comp></span></div>
                <div class="ch2-meter-card"><strong>子式</strong><span data-pair-minor></span></div>
                <div class="ch2-meter-card"><strong>位置符号</strong><span data-pair-sign></span></div>
                <div class="ch2-meter-card"><strong>互补子式</strong><span data-pair-complement></span></div>
                <div class="ch2-meter-card"><strong>本项贡献</strong><span data-pair-term></span></div>
            </div>
            <div class="ch2-laplace-footer">
              <div class="ch2-note" data-pair-explain></div>
              <div class="ch2-note">六项和：<strong data-pair-sum></strong>　原 det：<strong data-pair-det></strong></div>
            </div>
          </div>
        </div>
        <div class="ch2-lab ch2-lab-spaced">
          ${labIntro(section, "两阶段体积实验 · I → B → AB", "第二阶段从 B 的图形继续。", "product", true)}
          <div class="ch2-stage-row">
            <div class="ch2-stage-panel"><div class="ch2-stage"><canvas data-c-i aria-label="单位形"></canvas></div><div class="ch2-stage-caption">I · 单位形</div></div>
            <div class="ch2-stage-panel"><div class="ch2-stage"><canvas data-c-b aria-label="经过 B 的图形"></canvas></div><div class="ch2-stage-caption">第一阶段 · I → B</div></div>
            <div class="ch2-stage-panel"><div class="ch2-stage"><canvas data-c-ab aria-label="从 B 经过 A 到 AB 的图形"></canvas></div><div class="ch2-stage-caption">第二阶段 · B → AB</div></div>
          </div>
          <div class="ch2-meter is-4">
            <div class="ch2-meter-card"><strong>det(A)</strong><span data-da></span></div>
            <div class="ch2-meter-card"><strong>det(B)</strong><span data-db></span></div>
            <div class="ch2-meter-card"><strong>det(A)det(B)</strong><span data-prod></span></div>
            <div class="ch2-meter-card"><strong>det(AB)</strong><span data-dab></span></div>
          </div>
          <div class="ch2-note">验证状态：<strong data-rule-status aria-live="polite"></strong></div>
          <div class="ch2-presets">
            <button type="button" class="is-active" data-prod-preset="scale">两次缩放</button>
            <button type="button" data-prod-preset="shearScale">剪切后缩放</button>
            <button type="button" data-prod-preset="mirrorRotate">镜像后旋转</button>
            <button type="button" data-prod-preset="doubleMirror">两次镜像</button>
            <button type="button" data-prod-preset="project">含投影</button>
            <button type="button" data-prod-replay>重播</button>
          </div>
        </div>`;
      const cleanupPairing = mountLaplacePairing(root, section);
      const cleanupProduct = mountProduct(root);
      return () => {
        cleanupProduct?.();
        cleanupPairing?.();
      };
    },
  });
})();
