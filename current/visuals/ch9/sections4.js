(() => {
  const {
    display, rad, fmt, setupCanvas, repaintCanvas, arrow, grid, axes, world, clear,
    renderFormal, experimentHeader, taskBlock, range, bindRange, bindButtons, activate,
    setOutput, animate,
  } = window.Chapter9Native;

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
    root.innerHTML = `<h2>交互实验</h2><section class="ch9-ls-lab" data-ch9-lab data-lab-kind="least-squares">
      ${experimentHeader("用残差把候选直线推向最小二乘解", "调节斜率和截距，观察残差棒与两条正交条件怎样一起变化。最优直线默认隐藏，先让图形给出方向。")}
      <div class="ch9-ls-body">
        <div class="ch9-stage"><div class="ch9-stage-top"><strong>候选直线与有向残差</strong><span data-ls-legend>最优位置暂时隐藏</span></div><canvas data-ls-canvas aria-label="可调候选直线、数据点和有向残差"></canvas></div>
        <aside class="ch9-ls-side">
          <div class="ch9-range-list">${range("slope", "斜率 m", -1, 2.2, .02, .55)}${range("intercept", "截距 c", -.5, 4, .02, 2)}</div>
          <div class="ch9-ls-readings"><div><span>误差平方和 SSE</span><strong data-ls-sse></strong></div><div><span>Σrᵢ</span><strong data-ls-sum></strong></div><div><span>Σxᵢrᵢ</span><strong data-ls-weighted></strong></div></div>
          <button type="button" class="ch9-action is-primary" data-ls-best>揭示并移动到最小二乘解</button>
          <div class="ch9-normal-equations" data-ls-normal hidden><strong>最佳解的正交证书</strong><div><span>与常数列正交</span><b>Σrᵢ = 0</b></div><div><span>与横坐标列正交</span><b>Σxᵢrᵢ = 0</b></div></div>
          <div class="ch9-conclusion" data-ls-conclusion><strong data-ls-title></strong><p data-ls-copy></p></div>
        </aside>
      </div>
      ${taskBlock(["先只调截距，让正负残差大致平衡。", "再调斜率，减少左右两端残差的系统偏向。", "揭示最优解，核对 Σrᵢ 和 Σxᵢrᵢ 是否同时等于 0。"])}
    </section>`;

    const canvas = root.querySelector("[data-ls-canvas]");
    const points = [[-2, .8], [-1, 1.35], [0, 2.15], [1, 3.25], [2, 4.45]];
    const best = regression(points);
    const state = { slope: .55, intercept: 2, revealed: false };
    let stop = () => {};

    function paint(ctx, width, height, colors) {
      clear(ctx, width, height);
      grid(ctx, width, height, colors, Math.max(44, width / 14));
      const left = 54, right = width - 32, top = 28, bottom = height - 48;
      const sx = (x) => left + (x + 2.6) / 5.2 * (right - left);
      const sy = (y) => bottom - (y + .5) / 6.3 * (bottom - top);
      ctx.save();
      ctx.strokeStyle = colors.strongLine; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(left, bottom); ctx.lineTo(right, bottom); ctx.moveTo(sx(0), bottom); ctx.lineTo(sx(0), top); ctx.stroke();
      const drawLine = (slope, intercept, color, dashed, widthValue) => {
        ctx.save(); if (dashed) ctx.setLineDash([7, 6]); ctx.strokeStyle = color; ctx.lineWidth = widthValue;
        ctx.beginPath(); ctx.moveTo(sx(-2.6), sy(slope * -2.6 + intercept)); ctx.lineTo(sx(2.6), sy(slope * 2.6 + intercept)); ctx.stroke(); ctx.restore();
      };
      if (state.revealed) drawLine(best.slope, best.intercept, colors.accentStrong, true, 2.5);
      drawLine(state.slope, state.intercept, colors.text, false, 3.2);
      points.forEach(([x, y], index) => {
        const fitted = state.slope * x + state.intercept;
        ctx.strokeStyle = colors.coral; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.moveTo(sx(x), sy(y)); ctx.lineTo(sx(x), sy(fitted)); ctx.stroke();
        ctx.fillStyle = colors.text; ctx.beginPath(); ctx.arc(sx(x), sy(y), 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = colors.coral; ctx.font = "700 11px ui-sans-serif, system-ui";
        ctx.fillText(`r${index + 1}`, sx(x) + 7, (sy(y) + sy(fitted)) / 2);
      });
      ctx.restore();

      const data = residualData(points, state.slope, state.intercept);
      const gap = Math.hypot(state.slope - best.slope, state.intercept - best.intercept);
      const optimal = gap < .002;
      root.querySelector("[data-ls-sse]").textContent = fmt(data.sse, 4);
      root.querySelector("[data-ls-sum]").textContent = fmt(data.sum, 4);
      root.querySelector("[data-ls-weighted]").textContent = fmt(data.weighted, 4);
      root.querySelector("[data-ls-legend]").textContent = state.revealed ? "青绿虚线：最优位置　深色实线：当前候选" : "最优位置暂时隐藏";
      const box = root.querySelector("[data-ls-conclusion]");
      box.classList.toggle("is-warning", !optimal);
      if (optimal) {
        root.querySelector("[data-ls-title]").textContent = "两条正交条件同时满足";
        root.querySelector("[data-ls-copy]").textContent = "残差向量同时垂直于 A 的两列，所以当前预测就是 b 在列空间上的投影。";
      } else {
        root.querySelector("[data-ls-title]").textContent = `当前 SSE = ${fmt(data.sse, 3)}`;
        root.querySelector("[data-ls-copy]").textContent = Math.abs(data.sum) > Math.abs(data.weighted) ? "Σrᵢ 偏离 0 较多，先整体调整截距。" : "Σxᵢrᵢ 偏离 0 较多，继续调整斜率。";
      }
    }

    const cleanupCanvas = setupCanvas(canvas, paint);
    const repaint = () => repaintCanvas(canvas, paint);
    const cleanRanges = [
      bindRange(root, "slope", (value) => { state.slope = value; setOutput(root, "slope", fmt(value, 2)); repaint(); }),
      bindRange(root, "intercept", (value) => { state.intercept = value; setOutput(root, "intercept", fmt(value, 2)); repaint(); }),
    ];
    const button = root.querySelector("[data-ls-best]");
    const handler = () => {
      state.revealed = true;
      root.querySelector("[data-ls-normal]").hidden = false;
      button.textContent = "最小二乘解已揭示";
      stop();
      stop = animate(state, best, ["slope", "intercept"], () => {
        root.querySelector('[data-range="slope"]').value = String(state.slope);
        root.querySelector('[data-range="intercept"]').value = String(state.intercept);
        setOutput(root, "slope", fmt(state.slope, 2)); setOutput(root, "intercept", fmt(state.intercept, 2)); repaint();
      }, 720);
    };
    button.addEventListener("click", handler);
    return [cleanupCanvas, ...cleanRanges, () => { stop(); button.removeEventListener("click", handler); }];
  }

  function unitaryLab(root) {
    root.innerHTML = `<h2>交互实验</h2><section class="ch9-unitary-lab" data-ch9-lab data-lab-kind="unitary">
      ${experimentHeader("共轭保证正定，单位复数保证等模", "实验分成两个独立问题。第一步只看共轭如何消去相位，第二步再看复数乘法什么时候保持模长。")}
      <div class="ch9-unitary-tabs" role="group" aria-label="酉空间实验步骤"><button type="button" class="ch9-action is-primary" aria-pressed="true" data-u-tab="conjugate">A　为什么需要共轭</button><button type="button" class="ch9-action" aria-pressed="false" data-u-tab="motion">B　什么是酉变换</button></div>
      <div class="ch9-unitary-body">
        <div class="ch9-stage"><div class="ch9-stage-top"><strong data-u-stage-title>共轭把相位变成相反数</strong><span data-u-stage-copy>z 与 z̄ 关于实轴镜像</span></div><canvas data-u-canvas aria-label="复平面上的共轭乘积与酉变换"></canvas></div>
        <aside class="ch9-unitary-side">
          <div data-u-conjugate-controls class="ch9-range-list">${range("zAngle", "z 的相位", -165, 165, 1, 42, "°")}</div>
          <div data-u-motion-controls hidden><div class="ch9-toolbar" role="group" aria-label="复数乘法类型"><button type="button" class="is-active" data-u-mode="unitary">单位复数</button><button type="button" data-u-mode="scaled">加入缩放反例</button></div><div class="ch9-range-list">${range("phase", "U 的相位", -180, 180, 1, 70, "°")}${range("rho", "缩放 ρ", .6, 1.6, .05, 1.3)}</div></div>
          <div class="ch9-equation" data-u-equation></div>
          <div class="ch9-metric-strip"><div data-u-self-metric><span>z̄z</span><strong data-u-self></strong></div><div><span>|z|</span><strong data-u-z-norm></strong></div><div data-u-uz-metric hidden><span>|Uz|</span><strong data-u-uz-norm></strong></div></div>
          <div class="ch9-conclusion" data-u-conclusion><strong data-u-title></strong><p data-u-copy></p></div>
          <div class="ch9-dictionary"><div>实空间</div><div>复空间</div><div>转置 Aᵀ</div><div>共轭转置 A*</div><div>正交 QᵀQ=I</div><div>酉 U*U=I</div></div>
        </aside>
      </div>
      ${taskBlock(["在问题 A 中改变 z 的相位，确认 z̄z 始终落在非负实轴。", "切换到问题 B，让单位复数改变相位，观察 |Uz| 是否变化。", "加入缩放反例，指出酉条件失效的几何证据。"])}
    </section>`;

    const canvas = root.querySelector("[data-u-canvas]");
    const state = { tab: "conjugate", mode: "unitary", zAngle: 42, phase: 70, rho: 1.3, length: 2.05 };
    const polar = (length, angle) => [length * Math.cos(rad(angle)), length * Math.sin(rad(angle))];

    function paint(ctx, width, height, colors) {
      clear(ctx, width, height);
      grid(ctx, width, height, colors, Math.max(44, width / 14));
      const origin = [width < 520 ? width * .36 : width * .4, height * .57];
      const unit = Math.min(width / 8, height / 4.4);
      axes(ctx, origin, width, height, colors);
      const z = polar(state.length, state.zAngle);
      const conjugate = [z[0], -z[1]];
      if (state.tab === "conjugate") {
        arrow(ctx, origin, world(z, origin, unit), colors.accentStrong, "z", { width: 4.2 });
        arrow(ctx, origin, world(conjugate, origin, unit), colors.coral, "z̄", { width: 4.2 });
        ctx.save();
        ctx.strokeStyle = colors.muted; ctx.setLineDash([5, 5]);
        const zp = world(z, origin, unit), cp = world(conjugate, origin, unit);
        ctx.beginPath(); ctx.moveTo(zp[0], zp[1]); ctx.lineTo(cp[0], cp[1]); ctx.stroke(); ctx.setLineDash([]);
        const productY = height - 36;
        ctx.strokeStyle = colors.strongLine;
        ctx.beginPath();
        ctx.moveTo(28, productY);
        ctx.lineTo(width - 28, productY);
        ctx.stroke();
        ctx.fillStyle = colors.accentStrong;
        ctx.font = "700 12px ui-sans-serif, system-ui";
        ctx.textAlign = "center";
        ctx.fillText("z̄z = |z|² 落在非负实轴", width / 2, productY - 10);
        ctx.restore();
        root.querySelector("[data-u-equation]").innerHTML = display(`\\bar z z=${fmt(state.length, 2)}^2=${fmt(state.length ** 2, 2)}\\ge 0`);
        root.querySelector("[data-u-title]").textContent = "共轭消去相位，留下模长平方";
        root.querySelector("[data-u-copy]").textContent = "z 的相位是 θ，共轭的相位是 −θ；相乘后相位相消。";
        root.querySelector("[data-u-conclusion]").classList.remove("is-warning");
      } else {
        const rho = state.mode === "unitary" ? 1 : state.rho;
        const uz = polar(state.length * rho, state.zAngle + state.phase);
        ctx.save();
        ctx.strokeStyle = colors.strongLine; ctx.setLineDash([6, 5]);
        ctx.beginPath(); ctx.arc(origin[0], origin[1], state.length * unit, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        arrow(ctx, origin, world(z, origin, unit), colors.accentStrong, "z", { width: 4.2 });
        arrow(ctx, origin, world(uz, origin, unit), colors.coral, "Uz", { width: 4.2 });
        root.querySelector("[data-u-equation]").innerHTML = display(state.mode === "unitary" ? "U=e^{i\\varphi},\\quad U^*U=1,\\quad |Uz|=|z|" : `U=${fmt(rho, 2)}e^{i\\varphi},\\quad U^*U=${fmt(rho ** 2, 2)}\\ne1`);
        const pass = state.mode === "unitary";
        root.querySelector("[data-u-title]").textContent = pass ? "Uz 只沿等模圆转动" : "Uz 离开等模圆，酉条件失败";
        root.querySelector("[data-u-copy]").textContent = pass ? "单位复数只增加相位，模长保持不变。" : "缩放因子 ρ 改变模长，因此 U*U 不再等于 1。";
        root.querySelector("[data-u-conclusion]").classList.toggle("is-warning", !pass);
      }
      const rho = state.tab === "motion" && state.mode === "scaled" ? state.rho : 1;
      root.querySelector("[data-u-self]").textContent = fmt(state.length ** 2, 3);
      root.querySelector("[data-u-z-norm]").textContent = fmt(state.length, 3);
      root.querySelector("[data-u-uz-norm]").textContent = fmt(state.length * rho, 3);
    }

    const cleanupCanvas = setupCanvas(canvas, paint);
    const repaint = () => repaintCanvas(canvas, paint);
    const [tabButtons, cleanTabs] = bindButtons(root, "[data-u-tab]", (button) => {
      state.tab = button.dataset.uTab;
      tabButtons.forEach((item) => { const active = item === button; item.classList.toggle("is-primary", active); item.setAttribute("aria-pressed", String(active)); });
      root.querySelector("[data-u-conjugate-controls]").hidden = state.tab !== "conjugate";
      root.querySelector("[data-u-motion-controls]").hidden = state.tab !== "motion";
      root.querySelector("[data-u-self-metric]").hidden = state.tab !== "conjugate";
      root.querySelector("[data-u-uz-metric]").hidden = state.tab !== "motion";
      root.querySelector("[data-u-stage-title]").textContent = state.tab === "conjugate" ? "共轭把相位变成相反数" : "单位复数乘法沿等模圆转动";
      root.querySelector("[data-u-stage-copy]").textContent = state.tab === "conjugate" ? "z 与 z̄ 关于实轴镜像" : "比较 z 与 Uz 是否落在同一个圆上";
      repaint();
    });
    const [modeButtons, cleanModes] = bindButtons(root, "[data-u-mode]", (button) => { state.mode = button.dataset.uMode; activate(modeButtons, state.mode, "uMode"); root.querySelector('[data-range="rho"]').closest(".ch9-range").hidden = state.mode === "unitary"; repaint(); });
    activate(modeButtons, state.mode, "uMode");
    root.querySelector('[data-range="rho"]').closest(".ch9-range").hidden = true;
    const cleanRanges = [
      bindRange(root, "zAngle", (value) => { state.zAngle = value; setOutput(root, "zAngle", `${fmt(value, 0)}°`); repaint(); }),
      bindRange(root, "phase", (value) => { state.phase = value; setOutput(root, "phase", `${fmt(value, 0)}°`); repaint(); }),
      bindRange(root, "rho", (value) => { state.rho = value; setOutput(root, "rho", fmt(value, 2)); repaint(); }),
    ];
    return [cleanupCanvas, cleanTabs, cleanModes, ...cleanRanges];
  }

  window.defineChapter9Renderer?.("least-squares-distance", { formal: renderFormal, interactive: leastSquaresLab });
  window.defineChapter9Renderer?.("unitary-spaces", { formal: renderFormal, interactive: unitaryLab });
})();
