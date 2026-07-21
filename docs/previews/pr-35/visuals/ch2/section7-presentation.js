(() => {
  const { M, tex, display, formalShell, module, proofSteps, misconception } = window.Ch2PresentationUtils;

  function mountCramer(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const state = { a11: 2, a12: 1, a21: 1, a22: 3, b1: 5, b2: 5 };
    let displayState = { ...state };
    let animating = false;
    const canvas = root.querySelector("[data-cramer-canvas]");

    function values(current) {
      const A = [[current.a11, current.a12], [current.a21, current.a22]];
      const b = [current.b1, current.b2];
      const A1 = [[current.b1, current.a12], [current.b2, current.a22]];
      const A2 = [[current.a11, current.b1], [current.a21, current.b2]];
      return { A, A1, A2, b, D: M().det2(A), D1: M().det2(A1), D2: M().det2(A2) };
    }

    function matrixHtml(matrix) {
      return tex(`\\begin{bmatrix}${M().formatNum(matrix[0][0], 2)}&${M().formatNum(matrix[0][1], 2)}\\\\${M().formatNum(matrix[1][0], 2)}&${M().formatNum(matrix[1][1], 2)}\\end{bmatrix}`);
    }

    function scaleOf(A) {
      return Math.max(1, ...A.flat().map((value) => Math.abs(value)));
    }

    function cameraFor(A, b) {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width || 520);
      const height = Math.max(1, rect.height || 340);
      const points = [[0, 0], [1, 0], [0, 1], [1, 1], [A[0][0], A[1][0]], [A[0][1], A[1][1]], [A[0][0] + A[0][1], A[1][0] + A[1][1]], b, [b[0] + A[0][1], b[1] + A[1][1]]];
      const minX = Math.min(...points.map((point) => point[0]), -0.5);
      const maxX = Math.max(...points.map((point) => point[0]), 0.5);
      const minY = Math.min(...points.map((point) => point[1]), -0.5);
      const maxY = Math.max(...points.map((point) => point[1]), 0.5);
      const pad = 34;
      const scale = M().clamp(Math.min((width - pad * 2) / Math.max(1, maxX - minX), (height - pad * 2) / Math.max(1, maxY - minY)), 16, Math.min(width, height) * 0.3);
      return { scale, origin: { x: width * 0.5 - ((minX + maxX) / 2) * scale, y: height * 0.53 + ((minY + maxY) / 2) * scale } };
    }

    function drawScene(current) {
      const { A, b, D, D1 } = values(current);
      const camera = cameraFor(A, b);
      const view = M().drawTransformScene(canvas, A, {
        firstLabel: "a₁",
        secondLabel: "a₂",
        caption: "实线箭头为 b；虚线显示沿 a₂ 方向滑动",
        ...camera,
      });
      const ctx = canvas.getContext("2d");
      const palette = M().getPalette();
      const target = { x: view.origin.x + b[0] * view.scale, y: view.origin.y - b[1] * view.scale };
      M().drawArrow(ctx, view.origin, target, palette.accentStrong, 3.2);
      const map = (vector) => ({ x: view.origin.x + vector[0] * view.scale, y: view.origin.y - vector[1] * view.scale });

      if (Math.abs(D) > 1e-8) {
        const x1 = D1 / D;
        const a2 = [A[0][1], A[1][1]];
        const base = [x1 * A[0][0], x1 * A[1][0]];
        const currentArea = [[0, 0], b, [b[0] + a2[0], b[1] + a2[1]], a2].map(map);
        const slidArea = [[0, 0], base, [base[0] + a2[0], base[1] + a2[1]], a2].map(map);
        ctx.save();
        ctx.beginPath();
        currentArea.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
        ctx.closePath();
        ctx.fillStyle = palette.accent;
        ctx.globalAlpha = .09;
        ctx.fill();
        ctx.globalAlpha = .78;
        ctx.strokeStyle = palette.accentStrong;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.beginPath();
        slidArea.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
        ctx.closePath();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = palette.muted;
        ctx.stroke();
        const slid = map(base);
        ctx.beginPath();
        ctx.moveTo(target.x, target.y);
        ctx.lineTo(slid.x, slid.y);
        ctx.strokeStyle = palette.accentStrong;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = palette.text;
        ctx.font = "600 12px system-ui, sans-serif";
        ctx.fillText("沿 a₂ 方向滑到 x₁a₁", (target.x + slid.x) / 2 + 7, (target.y + slid.y) / 2 - 7);
        ctx.restore();
      } else {
        const direction = Math.hypot(A[0][0], A[1][0]) > 1e-8 ? [A[0][0], A[1][0]] : [A[0][1], A[1][1]];
        const length = Math.hypot(...direction) || 1;
        const unit = [direction[0] / length, direction[1] / length];
        const pA = map([-unit[0] * 8, -unit[1] * 8]);
        const pB = map([unit[0] * 8, unit[1] * 8]);
        ctx.save();
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = palette.muted;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();
        ctx.fillStyle = palette.text;
        ctx.font = "600 12px system-ui, sans-serif";
        ctx.fillText("列空间", view.origin.x + 10, view.origin.y + 18);
        ctx.restore();
      }
      ctx.save();
      ctx.fillStyle = palette.text;
      ctx.font = "600 12px system-ui, sans-serif";
      ctx.fillText("b", target.x + 8, target.y - 7);
      ctx.restore();
    }

    function sync(current) {
      const { A, A1, A2, b, D, D1, D2 } = values(current);
      root.querySelector("[data-d]").textContent = M().formatNum(D, 3);
      root.querySelector("[data-d1]").textContent = M().formatNum(D1, 3);
      root.querySelector("[data-d2]").textContent = M().formatNum(D2, 3);
      root.querySelector("[data-a-matrix]").innerHTML = matrixHtml(A);
      root.querySelector("[data-a1-matrix]").innerHTML = matrixHtml(A1);
      root.querySelector("[data-a2-matrix]").innerHTML = matrixHtml(A2);

      const solution = root.querySelector("[data-sol]");
      const residual = root.querySelector("[data-residual]");
      const scale = scaleOf(A);
      const exactTolerance = 1e-8 * scale * scale;
      const relativeArea = Math.abs(D) / (scale * scale);

      if (Math.abs(D) > exactTolerance) {
        const x1 = D1 / D;
        const x2 = D2 / D;
        const reconstructed = [A[0][0] * x1 + A[0][1] * x2, A[1][0] * x1 + A[1][1] * x2];
        const error = Math.hypot(reconstructed[0] - b[0], reconstructed[1] - b[1]);
        const nearSingular = relativeArea < 0.035;
        solution.innerHTML = nearSingular
          ? `<strong>理论上仍有唯一解，但基底接近共线</strong>　x₁=${M().formatNum(x1, 3)}，x₂=${M().formatNum(x2, 3)}。D 很小，输入的微小变化会被比值放大。`
          : `<strong>唯一解</strong>　x₁=${M().formatNum(x1, 3)}，x₂=${M().formatNum(x2, 3)}。分子有向面积分别是原有向面积的 x₁、x₂ 倍。`;
        solution.className = nearSingular ? "ch2-note is-zero" : "ch2-note is-positive";
        residual.innerHTML = `重构：${tex(`x_1a_1+x_2a_2=(${M().formatNum(reconstructed[0], 3)},${M().formatNum(reconstructed[1], 3)})^T`)}；与 b 的误差 ${M().formatNum(error, 6)}。`;
        residual.className = "ch2-note is-positive";
        root.querySelector("[data-slide-proof]").innerHTML = `${tex("D_1=\\det(b,a_2)=\\det(x_1a_1,a_2)=x_1D")}：把 b 沿 a₂ 方向滑到 x₁a₁，底边改变但有向面积不变。`;
      } else {
        const classification = M().classifySystem2(A, b);
        solution.innerHTML = classification.kind === "infinite"
          ? "<strong>D=0 · 无穷多解</strong>　b 仍落在塌缩后的列空间中；克拉默公式没有非零分母，改用消元描述自由变量。"
          : "<strong>D=0 · 无解</strong>　b 不在列空间中；塌缩后的列向量无法合成 b。";
        solution.className = classification.kind === "infinite" ? "ch2-note is-zero" : "ch2-note is-negative";
        residual.textContent = classification.kind === "infinite"
          ? "列组合能够到达 b，但表示不唯一。"
          : "任何列向量组合都无法到达 b。";
        residual.className = classification.kind === "infinite" ? "ch2-note is-zero" : "ch2-note is-negative";
        root.querySelector("[data-slide-proof]").textContent = classification.kind === "infinite"
          ? "两列压到同一条列空间直线上，b 也在线上：可以到达，但表示不唯一。"
          : "两列压到同一条列空间直线上，b 却离开直线：任何列组合都无法到达。";
      }

      ["a11", "a12", "a21", "a22", "b1", "b2"].forEach((key) => {
        const input = root.querySelector(`[data-k="${key}"]`);
        const label = root.querySelector(`[data-v="${key}"]`);
        input.value = String(current[key]);
        label.textContent = M().formatNum(current[key], 2);
      });
      drawScene(current);
      M().pulseClass(root.querySelector("[data-d-card]"));
    }

    async function goTo(target) {
      if (animating) return;
      animating = true;
      const from = { ...displayState };
      const keys = Object.keys(from);
      try {
        await M().animateTo(canvas, 0, 1, 620, (t) => {
          const current = {};
          keys.forEach((key) => { current[key] = M().lerp(from[key], target[key], M().easeInOutCubic(t)); });
          displayState = current;
          sync(current);
        });
        Object.assign(state, target);
        displayState = { ...target };
        sync(displayState);
      } finally {
        animating = false;
      }
    }

    root.querySelectorAll("[data-k]").forEach((input) => {
      input.addEventListener("input", () => {
        if (animating) return;
        state[input.dataset.k] = Number(input.value);
        displayState = { ...state };
        sync(displayState);
      }, { signal });
    });
    root.querySelector("[data-cramer-ex]").addEventListener("click", () => goTo({ a11: 2, a12: 1, a21: 1, a22: 3, b1: 5, b2: 5 }), { signal });
    root.querySelector("[data-cramer-near]").addEventListener("click", () => goTo({ a11: 1, a12: 2, a21: 1.02, a22: 2.02, b1: 3, b2: 3.04 }), { signal });
    root.querySelector("[data-cramer-sing]").addEventListener("click", () => goTo({ a11: 1, a12: 2, a21: 2, a22: 4, b1: 3, b2: 6 }), { signal });
    root.querySelector("[data-cramer-none]").addEventListener("click", () => goTo({ a11: 1, a12: 2, a21: 2, a22: 4, b1: 1, b2: 0 }), { signal });
    window.addEventListener("resize", () => document.body.contains(canvas) && sync(displayState), { signal, passive: true });

    sync(displayState);
    return () => {
      controller.abort();
      M().cancelAnim(canvas);
    };
  }

  defineChapter2Renderer("cramer-rule", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "克拉默法则来自列线性",
        "把 b 放进第 i 列后，沿这一列的线性展开会自动消去所有含重复列的项，只留下 xᵢdet(A)。二维面积比给出同一结论的几何版本。",
        module("01", "替换列推导", "先写 b 的列组合，再利用重复列为零。", proofSteps([
          `${tex("b=x_1a_1+\\cdots+x_na_n")}。`,
          `在 ${tex("A_i")} 中把第 i 列替换为 b，并对该列使用分别线性。`,
          "当 b 的展开项使用 aⱼ（j≠i）时，矩阵中出现两列 aⱼ，行列式为 0。",
          `只剩 ${tex("\\det(A_i)=x_i\\det(A)")}；当 det(A)≠0 时可除得公式。`,
        ]) + `
          <article class="ch2-def ch2-formula-block"><span class="kicker">公式</span><strong>${display("x_i=\\frac{\\det(A_i)}{\\det(A)}")}</strong><p>分母非零是公式成立与唯一解存在的共同条件。</p></article>
        `) + module("02", "D=0 与接近 D=0 是两种边界", "一个决定解的类型，另一个提醒坐标对扰动敏感。", `
          <div class="ch2-card-grid">
            <article class="ch2-card"><span class="kicker">D=0 且相容</span><h4>无穷多解</h4><p>b 落在塌缩后的列空间中，表示不唯一。</p></article>
            <article class="ch2-card"><span class="kicker">D=0 且不相容</span><h4>无解</h4><p>b 离开列空间，任何列组合都无法到达它。</p></article>
            <article class="ch2-card"><span class="kicker">D 很小但非零</span><h4>唯一但敏感</h4><p>两列接近共线，Dᵢ/D 会放大输入中的微小变化。</p></article>
          </div>
        `) + misconception([
          "替换的是第 i 列，因为 Ax 是列向量的线性组合。",
          "D=0 只说明克拉默公式不可用；无解与无穷多解需要继续判定。",
          "D 很小不等于 D=0；理论上仍可能有唯一解，但数值会变得敏感。",
        ]),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>Cramer 法则 · 列空间与面积比</h3><p>系数列、b、D、D₁、D₂ 与坐标重构同步变化。D=0 时改用列空间判断相容性。</p></div>
          <div class="ch2-task"><strong>观察任务</strong><span>先读取唯一解，再比较接近奇异、D=0 相容和 D=0 不相容三种边界。</span></div>
          <div class="ch2-lab-grid">
            <div class="ch2-stage"><canvas data-cramer-canvas aria-label="克拉默法则列向量与常数向量画布"></canvas></div>
            <div class="ch2-side">
              <div class="ch2-meter">
                <div class="ch2-meter-card" data-d-card><strong>D</strong><span data-d></span></div>
                <div class="ch2-meter-card"><strong>D₁</strong><span data-d1></span></div>
                <div class="ch2-meter-card"><strong>D₂</strong><span data-d2></span></div>
              </div>
              <div class="ch2-note"><strong>A</strong> <span data-a-matrix></span><br /><strong>A₁</strong> <span data-a1-matrix></span><br /><strong>A₂</strong> <span data-a2-matrix></span></div>
              <div data-sol class="ch2-note" aria-live="polite"></div>
              <div class="ch2-cramer-proof" data-slide-proof></div>
              <div data-residual class="ch2-note" aria-live="polite"></div>
              <details class="ch2-tuning"><summary>调整 a₁、a₂ 与 b</summary><div class="ch2-sliders">
                ${["a11", "a12", "a21", "a22", "b1", "b2"].map((key) => `<label><span>${key}</span><input data-k="${key}" type="range" min="-6" max="6" step="0.1" aria-label="${key}" /><span data-v="${key}"></span></label>`).join("")}
              </div></details>
              <div class="ch2-presets">
                <button type="button" data-cramer-ex>唯一解示例</button>
                <button type="button" data-cramer-near>接近奇异</button>
                <button type="button" data-cramer-sing>D=0 · 无穷多解</button>
                <button type="button" data-cramer-none>D=0 · 无解</button>
              </div>
            </div>
          </div>
        </div>`;
      return mountCramer(root);
    },
  });
})();
