(() => {
  const sectionId = "least-squares-distance";

  function foundation(api) {
    const i = api.inline;
    const d = api.display;
    return `
      ${api.foundationIntro(
        "没有精确解，不等于没有最佳解",
        "最小二乘把不相容方程改写成列空间中的最近点",
        `当 ${i("b\\notin\\operatorname{Col}(A)")} 时，任何 Ax 都到不了 b。我们不再强求残差为 0，而是在列空间中找离 b 最近的向量 ${i("A\\hat x")}。`,
      )}
      <div class="ch9v2-foundation">
        ${api.module(
          "01",
          "先把代数问题翻译成投影问题",
          "Ax 的所有可能值恰好组成 A 的列空间。",
          `<div class="ch9v2-least-geometry">
            <div class="ch9v2-least-plane"><i class="is-plane"></i><i class="is-b"></i><i class="is-proj"></i><i class="is-residual"></i></div>
            <div>${d("b=A\\hat x+r")}<p>${i("A\\hat x\\in\\operatorname{Col}(A)")}，残差 ${i("r=b-A\\hat x")} 垂直于整个列空间。</p></div>
          </div>`,
        )}
        ${api.module(
          "02",
          "残差垂直于列空间意味着什么",
          "与每一列都正交，就等价于一个矩阵方程。",
          `<div class="ch9v2-proof-line">${d("r\\perp\\operatorname{Col}(A)\\iff A^Tr=0")}</div>
          <div class="ch9v2-theorem-band is-secondary">${d("A^T(A\\hat x-b)=0\\iff A^TA\\hat x=A^Tb")}<p>这就是正规方程。它不是凭空出现的计算技巧，而是正交投影条件的坐标表达。</p></div>`,
        )}
        ${api.module(
          "03",
          "什么时候最小二乘系数唯一",
          "列满秩让 AᵀA 变成正定矩阵。",
          `<div class="ch9v2-uniqueness-chain">
            <span>A 列满秩</span><i>→</i><span>${i("x^TA^TAx=\\lVert Ax\\rVert^2>0")}</span><i>→</i><span>${i("A^TA")} 可逆</span><i>→</i><span>${i("\\hat x")} 唯一</span>
          </div>`,
          "is-compact",
        )}
        ${api.module(
          "04",
          "线性回归只是同一个投影故事的具体版本",
          "斜率与截距是系数，预测值组成列空间中的向量。",
          `<div class="ch9v2-regression-dictionary">
            <article><span>设计矩阵</span>${d("A=\\begin{bmatrix}1&x_1\\\\\\vdots&\\vdots\\\\1&x_n\\end{bmatrix}")}</article>
            <article><span>系数</span>${d("\\hat x=\\begin{bmatrix}c\\\\m\\end{bmatrix}")}</article>
            <article><span>预测向量</span>${d("A\\hat x=(c+mx_i)_i")}</article>
            <article><span>残差条件</span>${d("\\sum r_i=0,\\qquad\\sum x_ir_i=0")}</article>
          </div>`,
        )}
      </div>`;
  }

  function interactive(api) {
    return api.labShell({
      kicker: "交互实验 · 从“看起来贴合”到可验证的最优",
      title: "先选一条线，再看残差，最后让正规方程同时归零",
      intro: "上图显示数据与残差棒，下图把所有残差排成一个向量。只有在最小二乘解处，残差同时垂直于常数列和 x 坐标列。",
      steps: ["选择直线", "读取残差", "比较 SSE", "检查正交"],
      body: `
        <div class="ch9v2-workbench ch9v2-least-lab">
          <figure class="ch9v2-stage-card">
            <div class="ch9v2-stage-toolbar">
              <div><span data-ls-stage-kicker>第 1 步</span><strong data-ls-stage-title>先用斜率与截距选择一条候选直线</strong></div>
              <div class="ch9v2-legend"><span><i class="is-blue"></i>当前直线</span><span><i class="is-accent"></i>最优直线</span><span><i class="is-coral"></i>残差</span></div>
            </div>
            <div class="ch9v2-least-stage">
              <div><strong>数据与拟合</strong><canvas data-ls-main aria-label="数据点、候选直线、最小二乘直线和残差棒"></canvas></div>
              <div><strong>残差向量 r</strong><canvas data-ls-residual aria-label="每个数据点的有向残差条"></canvas></div>
            </div>
            <figcaption data-ls-caption>先调斜率与截距，观察蓝线移动；青色虚线暂时只作为最佳位置参照。</figcaption>
          </figure>
          <aside class="ch9v2-panel">
            <div class="ch9v2-step-tabs is-four" role="group" aria-label="最小二乘实验步骤">
              <button type="button" class="is-active" data-ls-step="0">01 选线</button>
              <button type="button" data-ls-step="1">02 残差</button>
              <button type="button" data-ls-step="2">03 SSE</button>
              <button type="button" data-ls-step="3">04 正交</button>
            </div>
            <div class="ch9v2-control-block">
              ${api.range("slope", "斜率 m", -1, 2.5, 0.02, 0.7)}
              ${api.range("intercept", "截距 c", -1, 4, 0.02, 2)}
              ${api.range("pointY", "紫色数据点 y", -0.5, 6, 0.05, 3.2)}
              <button class="button primary" type="button" data-ls-best>跳到最小二乘解</button>
            </div>
            <div class="ch9v2-formula-story" data-ls-formula></div>
            <div class="ch9v2-metric-grid">
              ${api.metric("SSE=Σrᵢ²", "sse")}
              ${api.metric("Σrᵢ", "sumR")}
              ${api.metric("Σxᵢrᵢ", "sumXR")}
              ${api.metric("距最优参数", "parameterGap")}
            </div>
            <div class="ch9v2-observation" data-ls-observation aria-live="polite"></div>
          </aside>
        </div>`,
    });
  }

  function optimum(points) {
    const n = points.length;
    const sx = points.reduce((sum, point) => sum + point[0], 0);
    const sy = points.reduce((sum, point) => sum + point[1], 0);
    const sxx = points.reduce((sum, point) => sum + point[0] ** 2, 0);
    const sxy = points.reduce((sum, point) => sum + point[0] * point[1], 0);
    const denominator = n * sxx - sx ** 2;
    const slope = (n * sxy - sx * sy) / denominator;
    const intercept = (sy - slope * sx) / n;
    return { slope, intercept };
  }

  function residuals(points, slope, intercept) {
    const values = points.map(([x, y]) => y - (slope * x + intercept));
    return {
      values,
      sse: values.reduce((sum, value) => sum + value ** 2, 0),
      sum: values.reduce((sum, value) => sum + value, 0),
      weighted: values.reduce((sum, value, index) => sum + points[index][0] * value, 0),
    };
  }

  function drawData(canvas, points, state, best, step, api) {
    const { ctx, width, height } = api.fitCanvas(canvas);
    const colors = api.palette();
    const pad = { left: 44, right: 18, top: 28, bottom: 36 };
    const xMin = -2.6;
    const xMax = 2.6;
    const yMin = -0.6;
    const yMax = 6.1;
    const sx = (x) => pad.left + ((x - xMin) / (xMax - xMin)) * (width - pad.left - pad.right);
    const sy = (y) => height - pad.bottom - ((y - yMin) / (yMax - yMin)) * (height - pad.top - pad.bottom);
    ctx.save();
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1;
    for (let x = -2; x <= 2; x += 1) {
      ctx.globalAlpha = 0.17;
      ctx.beginPath(); ctx.moveTo(sx(x), pad.top); ctx.lineTo(sx(x), height - pad.bottom); ctx.stroke();
    }
    for (let y = 0; y <= 5; y += 1) {
      ctx.globalAlpha = 0.17;
      ctx.beginPath(); ctx.moveTo(pad.left, sy(y)); ctx.lineTo(width - pad.right, sy(y)); ctx.stroke();
    }
    ctx.restore();
    const line = (slope, intercept, color, dash = [], alpha = 1) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = alpha;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(sx(xMin), sy(slope * xMin + intercept));
      ctx.lineTo(sx(xMax), sy(slope * xMax + intercept));
      ctx.stroke();
      ctx.restore();
    };
    line(best.slope, best.intercept, colors.accent, [8, 6], step === 0 ? 0.34 : 0.72);
    line(state.slope, state.intercept, colors.blue, [], 1);
    points.forEach(([x, y], index) => {
      const fitted = state.slope * x + state.intercept;
      if (step >= 1) {
        ctx.save();
        ctx.strokeStyle = colors.coral;
        ctx.lineWidth = step >= 2 ? 3 : 2;
        ctx.globalAlpha = 0.82;
        ctx.beginPath(); ctx.moveTo(sx(x), sy(y)); ctx.lineTo(sx(x), sy(fitted)); ctx.stroke();
        ctx.restore();
      }
      api.drawPoint(ctx, { x: sx(x), y: sy(y) }, index === 3 ? colors.violet : colors.text, index === 3 ? 6.5 : 5.5);
    });
  }

  function drawResidual(canvas, values, step, api) {
    const { ctx, width, height } = api.fitCanvas(canvas);
    const colors = api.palette();
    const pad = { left: 34, right: 16, top: 24, bottom: 34 };
    const max = Math.max(1.2, ...values.map((value) => Math.abs(value))) * 1.25;
    const sx = (index) => pad.left + ((index + 0.5) / values.length) * (width - pad.left - pad.right);
    const sy = (value) => height / 2 - (value / max) * (height / 2 - pad.top);
    ctx.save();
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(pad.left, height / 2); ctx.lineTo(width - pad.right, height / 2); ctx.stroke();
    ctx.restore();
    values.forEach((value, index) => {
      const x = sx(index);
      ctx.save();
      ctx.strokeStyle = value >= 0 ? colors.coral : colors.blue;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.globalAlpha = step >= 1 ? 0.9 : 0.22;
      ctx.beginPath(); ctx.moveTo(x, height / 2); ctx.lineTo(x, sy(value)); ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.fillStyle = colors.muted;
      ctx.font = "650 11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText(`r${index + 1}`, x - 8, height - 12);
      ctx.restore();
    });
  }

  function mount(root, api) {
    const main = root.querySelector("[data-ls-main]");
    const residualCanvas = root.querySelector("[data-ls-residual]");
    const points = [[-2, 0.8], [-1, 1.4], [0, 2.2], [1, 3.2], [2, 4.5]];
    const state = { step: 0, slope: 0.7, intercept: 2, pointY: 3.2 };
    const stepButtons = [...root.querySelectorAll("[data-ls-step]")];

    function draw() {
      points[3][1] = state.pointY;
      const best = optimum(points);
      const data = residuals(points, state.slope, state.intercept);
      const bestData = residuals(points, best.slope, best.intercept);
      const parameterGap = Math.hypot(state.slope - best.slope, state.intercept - best.intercept);
      const optimal = parameterGap < 1e-5;
      api.setPressed(stepButtons, (button) => Number(button.dataset.lsStep) === state.step);
      root.querySelectorAll("[data-v2-path-step]").forEach((item, index) => item.classList.toggle("is-active", index <= state.step));
      root.querySelector('[data-v2-range="slope"]').value = String(state.slope);
      root.querySelector('[data-v2-range="intercept"]').value = String(state.intercept);
      root.querySelector('[data-v2-range="pointY"]').value = String(state.pointY);
      api.update(root, "slope", api.format(state.slope, 2));
      api.update(root, "intercept", api.format(state.intercept, 2));
      api.update(root, "pointY", api.format(state.pointY, 2));
      api.update(root, "sse", api.format(data.sse, 4));
      api.update(root, "sumR", api.format(data.sum, 4));
      api.update(root, "sumXR", api.format(data.weighted, 4));
      api.update(root, "parameterGap", api.format(parameterGap, 4));
      drawData(main, points, state, best, state.step, api);
      drawResidual(residualCanvas, data.values, state.step, api);

      const formula = root.querySelector("[data-ls-formula]");
      if (state.step === 0) {
        formula.innerHTML = `<span>一条候选线对应一组系数</span>${api.display(`y=${api.format(state.slope, 2)}x+${api.format(state.intercept, 2)}`)}`;
        api.setText(root, "[data-ls-stage-kicker]", "第 1 步");
        api.setText(root, "[data-ls-stage-title]", "先用斜率与截距选择一条候选直线");
        api.setText(root, "[data-ls-caption]", "先调斜率与截距，观察蓝线移动；青色虚线暂时只作为最佳位置参照。");
      } else if (state.step === 1) {
        formula.innerHTML = `<span>每个竖直差就是一个有向残差</span>${api.display("r_i=y_i-(mx_i+c)")}`;
        api.setText(root, "[data-ls-stage-kicker]", "第 2 步");
        api.setText(root, "[data-ls-stage-title]", "把所有点到直线的竖直差排成残差向量");
        api.setText(root, "[data-ls-caption]", "上图的每根红色竖棒，对应下图中的一个有向残差分量。");
      } else if (state.step === 2) {
        formula.innerHTML = `<span>平方后相加，避免正负残差互相抵消</span>${api.display(`\\operatorname{SSE}=\\sum_i r_i^2=${api.format(data.sse, 4)}`)}`;
        api.setText(root, "[data-ls-stage-kicker]", "第 3 步");
        api.setText(root, "[data-ls-stage-title]", "比较所有候选直线的残差平方和");
        api.setText(root, "[data-ls-caption]", `当前 SSE 为 ${api.format(data.sse, 3)}，最佳 SSE 为 ${api.format(bestData.sse, 3)}。`);
      } else {
        formula.innerHTML = `<span>最优状态由两条正交条件封口</span>${api.display("\\sum_i r_i=0,\\qquad\\sum_i x_ir_i=0")}`;
        api.setText(root, "[data-ls-stage-kicker]", "第 4 步");
        api.setText(root, "[data-ls-stage-title]", "残差垂直于设计矩阵的两列");
        api.setText(root, "[data-ls-caption]", "两条和式同时接近 0，才是正规方程真正通过。");
      }

      const observation = root.querySelector("[data-ls-observation]");
      observation.classList.toggle("is-warning", !optimal);
      if (optimal) observation.innerHTML = `<strong>最小二乘解已命中</strong><p>Σrᵢ=${api.format(data.sum, 5)}，Σxᵢrᵢ=${api.format(data.weighted, 5)}；残差与两列同时正交。</p>`;
      else observation.innerHTML = `<strong>仍可继续改进</strong><p>当前 SSE 比最优值多 ${api.format(data.sse - bestData.sse, 3)}。仅靠“看起来贴合”不能证明最优。</p>`;
    }

    stepButtons.forEach((button) => api.on(button, "click", () => {
      state.step = Number(button.dataset.lsStep);
      draw();
    }));
    for (const name of ["slope", "intercept", "pointY"]) {
      api.bindRange(root, name, (value) => {
        state[name] = value;
        draw();
      });
    }
    api.on(root.querySelector("[data-ls-best]"), "click", () => {
      points[3][1] = state.pointY;
      const best = optimum(points);
      state.slope = best.slope;
      state.intercept = best.intercept;
      state.step = 3;
      draw();
    });
    api.installRedraw(draw, [main, residualCanvas]);
  }

  window.Chapter9V2.register(sectionId, { foundation, interactive, mount });
})();
