(() => {
  const {
    display, rad, fmt, palette, setupCanvas, arrow, grid, axes, world, clear,
    renderFormal, labShell, range, readingRow, setReadout, setOutput,
    bindRange, bindButtons, activate, animate,
  } = window.Chapter9Native;

  function repaintCanvas(canvas, paint) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint(ctx, rect.width, rect.height, palette());
  }

  function regression(points) {
    const n = points.length;
    const sx = points.reduce((sum, point) => sum + point[0], 0);
    const sy = points.reduce((sum, point) => sum + point[1], 0);
    const sxx = points.reduce((sum, point) => sum + point[0] ** 2, 0);
    const sxy = points.reduce((sum, point) => sum + point[0] * point[1], 0);
    const denominator = n * sxx - sx ** 2;
    const slope = (n * sxy - sx * sy) / denominator;
    return { slope, intercept: (sy - slope * sx) / n };
  }

  function residualData(points, slope, intercept) {
    const residuals = points.map(([x, y]) => y - (slope * x + intercept));
    return {
      residuals,
      sse: residuals.reduce((sum, value) => sum + value ** 2, 0),
      sum: residuals.reduce((sum, value) => sum + value, 0),
      weighted: residuals.reduce((sum, value, index) => sum + points[index][0] * value, 0),
    };
  }

  function leastSquaresLab(root) {
    root.innerHTML = labShell({
      title: "残差怎样把直线推向最佳位置",
      description: "青绿色虚线是最优位置，深色实线是当前候选，金棕色竖线表示有向残差。",
      taskTitle: "先手动降低 SSE，再播放到最佳解",
      task: "最佳解不是“看着最顺眼”，而是两条正规方程同时归零。",
      controls: `<div class="ch9-range-list">${range("slope", "斜率 m", -1, 2.2, 0.02, 0.55)}${range("intercept", "截距 c", -0.5, 4, 0.02, 2)}</div><button type="button" class="ch9-action is-primary" data-ls-best>连续移动到最小二乘解</button>`,
      body: `<div class="ch9-lab-grid"><div class="ch9-panel"><div class="ch9-stage"><canvas data-ls-canvas aria-label="最小二乘直线和残差"></canvas></div></div><div class="ch9-panel"><div class="ch9-reading"><h4>残差证书</h4>${readingRow("SSE", "sse")}${readingRow("Σrᵢ", "sumR")}${readingRow("Σxᵢrᵢ", "sumXR")}</div><div class="ch9-result" data-ls-result><span class="ch9-status" data-ls-status></span><h4 data-ls-title></h4><p data-ls-copy></p></div></div></div>`,
    });
    const canvas = root.querySelector("[data-ls-canvas]");
    const points = [[-2, 0.8], [-1, 1.35], [0, 2.15], [1, 3.25], [2, 4.45]];
    const state = { slope: 0.55, intercept: 2 };
    let repaint = () => {};
    let stopAnimation = () => {};

    function paint(ctx, width, height, colors) {
      clear(ctx, width, height);
      grid(ctx, width, height, colors, Math.max(38, width / 12));
      const left = 52;
      const right = width - 30;
      const top = 28;
      const bottom = height - 44;
      const sx = (x) => left + ((x + 2.6) / 5.2) * (right - left);
      const sy = (y) => bottom - ((y + 0.5) / 6.3) * (bottom - top);
      const best = regression(points);
      ctx.save();
      ctx.strokeStyle = colors.strongLine;
      ctx.beginPath();
      ctx.moveTo(left, bottom);
      ctx.lineTo(right, bottom);
      ctx.moveTo(sx(0), bottom);
      ctx.lineTo(sx(0), top);
      ctx.stroke();
      const drawLine = (slope, intercept, color, dashed, lineWidth) => {
        ctx.save();
        if (dashed) ctx.setLineDash([7, 6]);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(sx(-2.6), sy(slope * -2.6 + intercept));
        ctx.lineTo(sx(2.6), sy(slope * 2.6 + intercept));
        ctx.stroke();
        ctx.restore();
      };
      drawLine(best.slope, best.intercept, colors.accentStrong, true, 2.6);
      drawLine(state.slope, state.intercept, colors.text, false, 3.2);
      points.forEach(([x, y]) => {
        const fitted = state.slope * x + state.intercept;
        ctx.strokeStyle = colors.coral;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sx(x), sy(y));
        ctx.lineTo(sx(x), sy(fitted));
        ctx.stroke();
        ctx.fillStyle = colors.text;
        ctx.beginPath();
        ctx.arc(sx(x), sy(y), 4.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = colors.muted;
      ctx.font = "12px ui-sans-serif, system-ui";
      ctx.fillText("青绿虚线：最优位置", left + 8, top + 16);
      ctx.restore();
      const data = residualData(points, state.slope, state.intercept);
      const gap = Math.hypot(state.slope - best.slope, state.intercept - best.intercept);
      const optimal = gap < 0.003;
      setReadout(root, "sse", fmt(data.sse, 4));
      setReadout(root, "sumR", fmt(data.sum, 5));
      setReadout(root, "sumXR", fmt(data.weighted, 5));
      const result = root.querySelector("[data-ls-result]");
      const status = root.querySelector("[data-ls-status]");
      result.className = optimal ? "ch9-result is-success" : "ch9-result";
      status.className = optimal ? "ch9-status is-ok" : "ch9-status is-neutral";
      status.textContent = optimal ? "正规方程通过" : "候选直线";
      root.querySelector("[data-ls-title]").textContent = optimal ? "两条残差和同时归零" : "还可以继续降低 SSE";
      root.querySelector("[data-ls-copy]").textContent = optimal ? "残差同时垂直于常数列和横坐标列。" : "调节斜率和截距，观察残差如何重新平衡。";
    }

    const cleanCanvas = setupCanvas(canvas, paint);
    repaint = () => repaintCanvas(canvas, paint);
    const cleanRanges = [
      bindRange(root, "slope", (value) => { state.slope = value; setOutput(root, "slope", fmt(value, 2)); repaint(); }),
      bindRange(root, "intercept", (value) => { state.intercept = value; setOutput(root, "intercept", fmt(value, 2)); repaint(); }),
    ];
    const button = root.querySelector("[data-ls-best]");
    const bestHandler = () => {
      stopAnimation();
      stopAnimation = animate(state, regression(points), ["slope", "intercept"], () => {
        root.querySelector('[data-range="slope"]').value = String(state.slope);
        root.querySelector('[data-range="intercept"]').value = String(state.intercept);
        setOutput(root, "slope", fmt(state.slope, 2));
        setOutput(root, "intercept", fmt(state.intercept, 2));
        repaint();
      }, 720);
    };
    button.addEventListener("click", bestHandler);
    return [cleanCanvas, ...cleanRanges, () => { button.removeEventListener("click", bestHandler); stopAnimation(); }];
  }

  function unitaryLab(root) {
    root.innerHTML = labShell({
      title: "共轭与等模旋转",
      description: "青绿色 z 与金棕色共轭 z̄ 关于实轴镜像；深色 Uz 用来检验酉变换是否保持模长。",
      taskTitle: "先看共轭，再比较 Uz 是否离开等模圆",
      task: "纯相位只改变方向；加入缩放后，酉证书和几何圆同时失败。",
      controls: `<div class="ch9-toolbar"><button class="is-active" type="button" data-u-mode="unitary">纯相位</button><button type="button" data-u-mode="scaled">相位 + 缩放</button></div><div class="ch9-range-list">${range("zAngle", "z 的相位", -180, 180, 1, 42, "°")}${range("phase", "U 的相位", -180, 180, 1, 70, "°")}${range("rho", "缩放 ρ", 0.5, 1.7, 0.05, 1.3)}</div>`,
      body: `<div class="ch9-lab-grid"><div class="ch9-panel"><div class="ch9-stage"><canvas data-u-canvas aria-label="复平面中的共轭和酉变换"></canvas></div><div class="ch9-equation" data-u-equation></div></div><div class="ch9-panel"><div class="ch9-reading"><h4>酉证书</h4>${readingRow("z̄z", "self")}${readingRow("|z| / |Uz|", "norms")}${readingRow("U*U−1", "error")}</div><div class="ch9-result" data-u-result><span class="ch9-status" data-u-status></span><h4 data-u-title></h4><p data-u-copy></p></div></div></div>`,
    });
    const canvas = root.querySelector("[data-u-canvas]");
    const state = { mode: "unitary", zAngle: 42, phase: 70, rho: 1.3, length: 2.1 };
    let repaint = () => {};
    const [buttons, cleanButtons] = bindButtons(root, "[data-u-mode]", (button) => {
      state.mode = button.dataset.uMode;
      activate(buttons, state.mode, "uMode");
      repaint();
    });
    const cleanRanges = [
      bindRange(root, "zAngle", (value) => { state.zAngle = value; setOutput(root, "zAngle", `${fmt(value, 0)}°`); repaint(); }),
      bindRange(root, "phase", (value) => { state.phase = value; setOutput(root, "phase", `${fmt(value, 0)}°`); repaint(); }),
      bindRange(root, "rho", (value) => { state.rho = value; setOutput(root, "rho", fmt(value, 2)); repaint(); }),
    ];

    function polar(length, angle) {
      return [length * Math.cos(rad(angle)), length * Math.sin(rad(angle))];
    }

    function paint(ctx, width, height, colors) {
      clear(ctx, width, height);
      grid(ctx, width, height, colors, Math.max(38, width / 12));
      const origin = [width * 0.46, height * 0.55];
      const unit = Math.min(width / 7.3, height / 3.8);
      axes(ctx, origin, width, height, colors);
      const z = polar(state.length, state.zAngle);
      const conjugate = [z[0], -z[1]];
      const rho = state.mode === "unitary" ? 1 : state.rho;
      const uz = polar(state.length * rho, state.zAngle + state.phase);
      ctx.save();
      ctx.strokeStyle = colors.strongLine;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(origin[0], origin[1], state.length * unit, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      arrow(ctx, origin, world(z, origin, unit), colors.accentStrong, "z", { width: 4.2 });
      arrow(ctx, origin, world(conjugate, origin, unit), colors.coral, "z̄", { width: 3.5 });
      arrow(ctx, origin, world(uz, origin, unit), colors.text, "Uz", { width: 4.2, labelY: 18 });
      const error = Math.abs(rho ** 2 - 1);
      setReadout(root, "self", fmt(state.length ** 2, 3));
      setReadout(root, "norms", `${fmt(state.length, 3)} / ${fmt(state.length * rho, 3)}`);
      setReadout(root, "error", fmt(error, 4));
      root.querySelector("[data-u-equation]").innerHTML = display(state.mode === "unitary" ? "U^*U=I" : "U^*U\\ne I");
      const pass = state.mode === "unitary";
      const result = root.querySelector("[data-u-result]");
      const status = root.querySelector("[data-u-status]");
      result.className = pass ? "ch9-result is-success" : "ch9-result is-warning";
      status.className = pass ? "ch9-status is-ok" : "ch9-status is-warn";
      status.textContent = pass ? "酉变换" : "非酉缩放";
      root.querySelector("[data-u-title]").textContent = pass ? "Uz 留在同一等模圆上" : "Uz 已离开原等模圆";
      root.querySelector("[data-u-copy]").textContent = pass ? "相位改变，模长和复内积保持。" : "缩放因子使模长发生改变。";
    }
    const cleanCanvas = setupCanvas(canvas, paint);
    repaint = () => repaintCanvas(canvas, paint);
    return [cleanCanvas, cleanButtons, ...cleanRanges];
  }

  window.defineChapter9Renderer?.("least-squares-distance", { formal: renderFormal, interactive: leastSquaresLab });
  window.defineChapter9Renderer?.("unitary-spaces", { formal: renderFormal, interactive: unitaryLab });
})();
