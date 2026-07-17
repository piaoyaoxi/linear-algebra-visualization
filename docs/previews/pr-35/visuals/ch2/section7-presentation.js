(() => {
  const { M, tex, display, aEntry, productTermHtml, formalShell, module, proofSteps, misconception, taskBox } = window.Ch2PresentationUtils;
  // ---------- §7 ----------
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
      return {
        A,
        b,
        D: M().det2(A),
        D1: M().det2([[current.b1, current.a12], [current.b2, current.a22]]),
        D2: M().det2([[current.a11, current.b1], [current.a21, current.b2]]),
      };
    }

    function cameraFor(A, b) {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width || 520);
      const height = Math.max(1, rect.height || 340);
      const points = [[0, 0], [1, 0], [0, 1], [1, 1], [A[0][0], A[1][0]], [A[0][1], A[1][1]], [A[0][0] + A[0][1], A[1][0] + A[1][1]], b];
      let minX = Math.min(...points.map((point) => point[0]), -0.5);
      let maxX = Math.max(...points.map((point) => point[0]), 0.5);
      let minY = Math.min(...points.map((point) => point[1]), -0.5);
      let maxY = Math.max(...points.map((point) => point[1]), 0.5);
      const pad = 34;
      const scale = M().clamp(Math.min((width - pad * 2) / Math.max(1, maxX - minX), (height - pad * 2) / Math.max(1, maxY - minY)), 16, Math.min(width, height) * 0.3);
      return { scale, origin: { x: width * 0.5 - ((minX + maxX) / 2) * scale, y: height * 0.53 + ((minY + maxY) / 2) * scale } };
    }

    function drawScene(current) {
      const { A, b } = values(current);
      const camera = cameraFor(A, b);
      const view = M().drawTransformScene(canvas, A, {
        firstLabel: "a₁",
        secondLabel: "a₂",
        caption: "a₁、a₂ 张成基底；绿色箭头为 b",
        ...camera,
      });
      const ctx = canvas.getContext("2d");
      const palette = M().getPalette();
      const target = { x: view.origin.x + b[0] * view.scale, y: view.origin.y - b[1] * view.scale };
      M().drawArrow(ctx, view.origin, target, palette.accentStrong, 3.2);
      ctx.save();
      ctx.fillStyle = palette.text;
      ctx.font = "600 12px system-ui, sans-serif";
      ctx.fillText("b", target.x + 8, target.y - 7);
      ctx.restore();
    }

    function sync(current) {
      const { A, b, D, D1, D2 } = values(current);
      root.querySelector("[data-d]").textContent = M().formatNum(D, 3);
      root.querySelector("[data-d1]").textContent = M().formatNum(D1, 3);
      root.querySelector("[data-d2]").textContent = M().formatNum(D2, 3);
      const solution = root.querySelector("[data-sol]");
      if (Math.abs(D) >= 1e-7) {
        solution.innerHTML = `<strong>唯一解</strong>　x₁=${M().formatNum(D1 / D, 3)}，x₂=${M().formatNum(D2 / D, 3)}。分子面积分别是原面积的 x₁、x₂ 倍。`;
        solution.className = "ch2-note is-positive";
      } else {
        const classification = M().classifySystem2(A, b);
        solution.innerHTML = classification.kind === "infinite"
          ? "<strong>D=0 · 无穷多解</strong>　b 仍落在塌缩后的列空间中；克拉默公式没有非零分母，改用消元描述自由变量。"
          : "<strong>D=0 · 无解</strong>　b 不在列空间中；塌缩后的列向量无法合成 b。";
        solution.className = classification.kind === "infinite" ? "ch2-note is-zero" : "ch2-note is-negative";
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
        "把 b 放进第 i 列后，沿这一列的线性展开会自动消去所有含重复列的项，只留下 xi det(A)。二维面积比给出同一结论的几何版本。",
        module("01", "替换列推导", "先写 b 的列组合，再利用重复列为零。", proofSteps([
          `${tex("b=x_1a_1+\\cdots+x_na_n")}。`,
          `在 ${tex("A_i")} 中把第 i 列替换为 b，并对该列使用分别线性。`,
          "当 b 的展开项使用 aj（j≠i）时，矩阵中出现两列 aj，行列式为 0。",
          `只剩 ${tex("\\det(A_i)=x_i\\det(A)")}；当 det(A)≠0 时可除得公式。`,
        ]) + `
          <article class="ch2-def ch2-formula-block"><span class="kicker">公式</span><strong>${display("x_i=\\frac{\\det(A_i)}{\\det(A)}")}</strong><p>分母非零是公式成立与唯一解存在的共同条件。</p></article>
        `) + module("02", "D=0 的两条分支", "公式失效后，继续判断 b 是否位于列空间。", `
          <div class="ch2-card-grid is-2">
            <article class="ch2-card"><span class="kicker">相容</span><h4>无穷多解</h4><p>b 落在塌缩后的列空间中，至少一个自由变量保留。</p></article>
            <article class="ch2-card"><span class="kicker">不相容</span><h4>无解</h4><p>b 离开列空间，任何列组合都无法到达它。</p></article>
          </div>
        `) + misconception([
          "替换的是第 i 列，因为 Ax 是列向量的线性组合。",
          "D=0 只说明克拉默公式不可用；无解与无穷多解需要继续判定。",
        ]),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>替换列实验室 · 面积比与奇异边界</h3><p>系数列、b、D、D₁、D₂ 同步变化。D=0 时系统继续判断相容性。</p></div>
          <div class="ch2-task"><strong>观察任务</strong><span>先读取唯一解，再分别进入 D=0 的相容与不相容预设。</span></div>
          <div class="ch2-lab-grid">
            <div class="ch2-stage"><canvas data-cramer-canvas aria-label="克拉默法则列向量与常数向量画布"></canvas></div>
            <div class="ch2-side">
              <div class="ch2-meter">
                <div class="ch2-meter-card" data-d-card><strong>D</strong><span data-d></span></div>
                <div class="ch2-meter-card"><strong>D₁</strong><span data-d1></span></div>
                <div class="ch2-meter-card"><strong>D₂</strong><span data-d2></span></div>
              </div>
              <div data-sol class="ch2-note" aria-live="polite"></div>
              <div class="ch2-sliders">
                ${["a11", "a12", "a21", "a22", "b1", "b2"].map((key) => `<label><span>${key}</span><input data-k="${key}" type="range" min="-6" max="6" step="0.1" aria-label="${key}" /><span data-v="${key}"></span></label>`).join("")}
              </div>
              <div class="ch2-presets">
                <button type="button" data-cramer-ex>唯一解示例</button>
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
