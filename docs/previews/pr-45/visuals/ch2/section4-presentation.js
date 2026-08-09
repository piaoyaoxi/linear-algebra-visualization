(() => {
  const { M, tex, formalFromSection, labIntro, mountPrediction } = window.Ch2PresentationUtils;
  // ---------- §4 ----------
  function mountColumnOperations(root, section) {
    const controller = new AbortController();
    const { signal } = controller;
    mountPrediction(root, section, signal);
    const initial = [[1.2, 0.35], [0.2, 1.1]];
    let matrix = M().cloneMat(initial);
    const baseDet = M().det2(initial);
    let factor = 1;
    const ledger = [];
    const history = [];
    const beforeCanvas = root.querySelector("[data-row-before]");
    const canvas = root.querySelector("[data-row-canvas]");
    let animating = false;

    function matrixHtml(value) {
      return tex(`\\begin{bmatrix}${M().formatNum(value[0][0], 2)}&${M().formatNum(value[0][1], 2)}\\\\${M().formatNum(value[1][0], 2)}&${M().formatNum(value[1][1], 2)}\\end{bmatrix}`);
    }

    function snapshot() {
      history.push({ matrix: M().cloneMat(matrix), factor, ledger: ledger.slice() });
    }

    function sync() {
      const det = M().det2(matrix);
      root.querySelector("[data-mat]").innerHTML = matrixHtml(matrix);
      root.querySelector("[data-cur-det]").textContent = M().formatNum(det, 3);
      root.querySelector("[data-factor]").textContent = M().formatNum(factor, 3);
      root.querySelector("[data-base-det]").textContent = M().formatNum(baseDet, 3);
      root.querySelector("[data-check]").textContent = M().formatNum(baseDet * factor, 3);
      root.querySelector("[data-ledger]").innerHTML = ledger.length ? ledger.map((line) => `<li>${line}</li>`).join("") : "<li>起点：累计倍率 1</li>";
      root.querySelector("[data-op-undo]").disabled = history.length === 0 || animating;
      M().drawTransformScene(canvas, matrix, {
        firstLabel: "第 1 列",
        secondLabel: "第 2 列",
        caption: `当前 det=${M().formatNum(det, 3)} · 图形展示列操作`,
      });
      M().drawTransformScene(beforeCanvas, initial, {
        firstLabel: "初始 C₁",
        secondLabel: "初始 C₂",
        caption: `固定参照 · det=${M().formatNum(baseDet, 3)}`,
      });
    }

    async function apply(next, multiplier, line) {
      if (animating) return;
      snapshot();
      animating = true;
      factor *= multiplier;
      ledger.push(line);
      try {
        await M().animateMatrix(canvas, next, {
          duration: 560,
          drawOptions: { firstLabel: "第 1 列", secondLabel: "第 2 列", caption: line },
          onUpdate(current) {
            root.querySelector("[data-cur-det]").textContent = M().formatNum(M().det2(current), 3);
            root.querySelector("[data-mat]").innerHTML = matrixHtml(current);
          },
        });
        matrix = M().cloneMat(next);
      } finally {
        animating = false;
        sync();
      }
    }

    root.querySelector("[data-op-swap]").addEventListener("click", () => apply(
      [[matrix[0][1], matrix[0][0]], [matrix[1][1], matrix[1][0]]],
      -1,
      "C₁ ↔ C₂　累计倍率 ×(−1)",
    ), { signal });
    root.querySelector("[data-op-scale]").addEventListener("click", () => apply(
      [[matrix[0][0] * 1.5, matrix[0][1]], [matrix[1][0] * 1.5, matrix[1][1]]],
      1.5,
      "C₁ ← 1.5C₁　累计倍率 ×1.5",
    ), { signal });
    root.querySelector("[data-op-add]").addEventListener("click", () => apply(
      [[matrix[0][0], matrix[0][1] + matrix[0][0]], [matrix[1][0], matrix[1][1] + matrix[1][0]]],
      1,
      "剪切：C₂ ← C₂+C₁　累计倍率 ×1",
    ), { signal });
    root.querySelector("[data-op-undo]").addEventListener("click", () => {
      if (animating || !history.length) return;
      const previous = history.pop();
      matrix = previous.matrix;
      factor = previous.factor;
      ledger.splice(0, ledger.length, ...previous.ledger);
      sync();
    }, { signal });
    root.querySelector("[data-op-reset]").addEventListener("click", () => {
      matrix = M().cloneMat(initial);
      factor = 1;
      ledger.length = 0;
      history.length = 0;
      sync();
    }, { signal });
    window.addEventListener("resize", () => document.body.contains(canvas) && sync(), { signal, passive: true });

    sync();
    return () => {
      controller.abort();
      M().cancelAnim(canvas);
      M().cancelAnim(beforeCanvas);
    };
  }

  defineChapter2Renderer("determinant-properties", {
    formal(formal, section) {
      if (!formal) return;
      formal.innerHTML = formalFromSection(section);
    },
    interactive(root, section) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          ${labIntro(section, "三种列操作 · 对比几何变化", "平行四边形由两列生成，右侧同步验证倍率账本。")}
          <div class="ch2-operation-layout">
            <div class="ch2-compare-stage">
              <div><span>变换前 · 固定参照</span><div class="ch2-stage"><canvas data-row-before aria-label="列操作前的有向面积"></canvas></div></div>
              <b aria-hidden="true">→</b>
              <div><span>变换后 · 当前状态</span><div class="ch2-stage"><canvas data-row-canvas aria-label="列操作后的有向面积"></canvas></div></div>
            </div>
            <div class="ch2-operation-summary">
              <div class="ch2-note">当前矩阵<br /><strong data-mat></strong></div>
              <div class="ch2-meter is-2">
                <div class="ch2-meter-card"><strong>当前 det</strong><span data-cur-det></span></div>
                <div class="ch2-meter-card"><strong>初始 det</strong><span data-base-det></span></div>
                <div class="ch2-meter-card"><strong>累计倍率</strong><span data-factor></span></div>
                <div class="ch2-meter-card"><strong>初始×倍率</strong><span data-check></span></div>
              </div>
              <div class="ch2-ledger"><strong>操作账本</strong><ol data-ledger></ol></div>
            </div>
            <div class="ch2-toolbar ch2-wide-controls">
              <button type="button" data-op-swap>交换 C₁、C₂</button>
              <button type="button" data-op-scale>C₁ ×1.5</button>
              <button type="button" data-op-add>C₂ ← C₂+C₁</button>
              <button type="button" data-op-undo>撤销</button>
              <button type="button" data-op-reset>重置</button>
            </div>
          </div>
        </div>`;
      return mountColumnOperations(root, section);
    },
  });
})();
