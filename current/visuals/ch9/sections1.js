(() => {
  const { inline, display, clamp, rad, dot, norm, sub, scale, palette, setupCanvas, roundedRect, arrow, grid, axes, world, clear, renderFormal, labShell, range, readingRow, setReadout, setOutput, bindRange, bindButtons, activate, animate } = window.Chapter9Native;

  function innerProductLab(root) {
    root.innerHTML = labShell({
      title: "内积与有向投影",
      description: `固定青绿色向量 ${inline("x")} 的方向，只移动金棕色向量 ${inline("y")}。先判断方向关系，再显示垂线与投影。`,
      taskTitle: "让夹角依次经过锐角、直角与钝角",
      task: "注意内积的负号并不是来自向量颜色或坐标正负，而是来自 y 在 x 方向上的影子反向。",
      controls: `<div class="ch9-toolbar" role="group" aria-label="内积预设"><button class="is-active" type="button" data-ip-preset="acute">锐角</button><button type="button" data-ip-preset="right">直角</button><button type="button" data-ip-preset="obtuse">钝角</button><button type="button" data-ip-preset="parallel">线性相关</button><button type="button" data-ip-preset="zero">零向量</button></div><div class="ch9-steps" style="--ch9-steps:3"><button class="is-active" type="button" data-ip-step="0">01 看夹角</button><button type="button" data-ip-step="1">02 看投影</button><button type="button" data-ip-step="2">03 看内积</button></div><div class="ch9-range-list">${range("angle", "y 的方向", -170, 170, 1, 48, "°")}</div>`,
      body: `<div class="ch9-lab-grid"><div class="ch9-panel"><div class="ch9-stage"><canvas data-ip-canvas tabindex="0" aria-label="两个向量的夹角与有向投影"></canvas></div><div class="ch9-equation" data-ip-equation></div></div><div class="ch9-panel"><div class="ch9-reading"><h4>当前读数</h4>${readingRow("夹角", "angle")}${readingRow("有向投影", "projection")}${readingRow("内积", "dot")}</div><div class="ch9-result" data-ip-result><span class="ch9-status" data-ip-status></span><h4 data-ip-title></h4><p data-ip-copy></p></div></div></div>`,
    });
    const canvas = root.querySelector("[data-ip-canvas]");
    const state = { angle: 48, length: 2.55, step: 0, reveal: 0 };
    let redraw = () => {};
    let stopMotion = () => {};
    const presets = { acute: [48, 2.55], right: [90, 2.55], obtuse: [132, 2.55], parallel: [0, 2.8], zero: [48, 0] };
    const [presetButtons, cleanPreset] = bindButtons(root, "[data-ip-preset]", (button) => {
      const [angle, length] = presets[button.dataset.ipPreset];
      activate(presetButtons, button.dataset.ipPreset, "ipPreset");
      stopMotion();
      state.step = 0;
      state.reveal = 0;
      activate(stepButtons, 0, "ipStep");
      root.querySelector('[data-range="angle"]').value = String(angle);
      stopMotion = animate(state, { angle, length }, ["angle", "length"], redraw, 480);
    });
    const [stepButtons, cleanSteps] = bindButtons(root, "[data-ip-step]", (button) => {
      const target = Number(button.dataset.ipStep);
      state.step = target;
      activate(stepButtons, state.step, "ipStep");
      stopMotion();
      stopMotion = animate(state, { reveal: target }, ["reveal"], redraw, 420);
    });
    const cleanRange = bindRange(root, "angle", (value) => {
      stopMotion();
      state.angle = value;
      state.length = Math.max(state.length, 2.55);
      presetButtons.forEach((button) => button.classList.remove("is-active"));
      redraw();
    });
    function paintInner(ctx, width, height, colors) {
      clear(ctx, width, height);
      grid(ctx, width, height, colors, Math.max(36, width / 12));
      const origin = [width * 0.25, height * 0.72];
      axes(ctx, origin, width, height, colors);
      const unit = Math.min(width / 8.2, height / 4.3);
      const x = [3.15, 0];
      const y = [state.length * Math.cos(rad(state.angle)), state.length * Math.sin(rad(state.angle))];
      const xEnd = world(x, origin, unit);
      const yEnd = world(y, origin, unit);
      const projection = y[0];
      const pEnd = world([projection, 0], origin, unit);
      arrow(ctx, origin, xEnd, colors.accentStrong, "x", { width: 4.5, labelY: -9 });
      arrow(ctx, origin, yEnd, colors.coral, "y", { width: 4.5, labelY: -9 });
      if (state.length > 0.001) {
        ctx.save();
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        const radius = 38;
        if (state.angle >= 0) ctx.arc(origin[0], origin[1], radius, 0, -rad(state.angle), true);
        else ctx.arc(origin[0], origin[1], radius, 0, -rad(state.angle), false);
        ctx.stroke();
        ctx.restore();
      }
      const projectionReveal = clamp(state.reveal, 0, 1);
      const productReveal = clamp(state.reveal - 1, 0, 1);
      if (projectionReveal > 0.001 && state.length > 0.001) {
        ctx.save();
        ctx.globalAlpha = projectionReveal;
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = colors.muted;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(yEnd[0], yEnd[1]);
        ctx.lineTo(pEnd[0], pEnd[1]);
        ctx.stroke();
        arrow(ctx, origin, pEnd, colors.text, "投影", { width: 2.6, head: 10, wing: 5, labelY: 19 });
        ctx.strokeStyle = colors.coral;
        ctx.setLineDash([]);
        ctx.lineWidth = 1.8;
        const direction = projection >= 0 ? 1 : -1;
        ctx.strokeRect(pEnd[0], pEnd[1] - 12, direction * 12, 12);
        ctx.restore();
      }
      if (productReveal > 0.001) {
        ctx.save();
        ctx.globalAlpha = productReveal;
        roundedRect(ctx, width - 225, 24, 190, 76, 12);
        ctx.fillStyle = colors.paper;
        ctx.fill();
        ctx.strokeStyle = colors.line;
        ctx.stroke();
        ctx.fillStyle = colors.muted;
        ctx.font = "12px ui-sans-serif, system-ui";
        ctx.fillText("长度 × 有向投影", width - 207, 50);
        ctx.fillStyle = colors.text;
        ctx.font = "700 16px ui-monospace, monospace";
        ctx.fillText(`${fmt(3.15, 2)} × ${fmt(projection, 2)} = ${fmt(3.15 * projection, 2)}`, width - 207, 77);
        ctx.restore();
      }
      const angle = state.length < 0.001 ? NaN : Math.abs(state.angle);
      const product = 3.15 * projection;
      setOutput(root, "angle", `${fmt(state.angle, 0)}°`);
      setReadout(root, "angle", Number.isFinite(angle) ? `${fmt(angle, 0)}°` : "未定义");
      setReadout(root, "projection", fmt(projection, 3));
      setReadout(root, "dot", fmt(product, 3));
      root.querySelector("[data-ip-equation]").innerHTML = state.step < 2 ? display("\\langle x,y\\rangle=\\lVert x\\rVert\\,\\lVert y\\rVert\\cos\\theta") : display(`\\langle x,y\\rangle=${fmt(product, 3)}`);
      const result = root.querySelector("[data-ip-result]");
      const status = root.querySelector("[data-ip-status]");
      if (state.length < 0.001) {
        result.className = "ch9-result is-warning";
        status.className = "ch9-status is-warn";
        status.textContent = "零向量边界";
        root.querySelector("[data-ip-title]").textContent = "内积为 0，但夹角没有定义";
        root.querySelector("[data-ip-copy]").textContent = "不能把零向量与其他向量内积为 0 机械解释成一个直角。";
      } else if (Math.abs(projection) < 0.025) {
        result.className = "ch9-result is-success";
        status.className = "ch9-status is-ok";
        status.textContent = "正交";
        root.querySelector("[data-ip-title]").textContent = "有向投影恰好为 0";
        root.querySelector("[data-ip-copy]").textContent = "垂线落在原点，内积同时为 0。";
      } else {
        const positive = product > 0;
        result.className = positive ? "ch9-result is-success" : "ch9-result is-warning";
        status.className = positive ? "ch9-status is-ok" : "ch9-status is-warn";
        status.textContent = positive ? "内积为正" : "内积为负";
        root.querySelector("[data-ip-title]").textContent = positive ? "影子与 x 同向" : "影子落在 x 的反向";
        root.querySelector("[data-ip-copy]").textContent = positive ? "两个非零向量形成锐角。" : "两个非零向量形成钝角，负号来自反向投影。";
      }
    }
    const cleanCanvas = setupCanvas(canvas, paintInner);
    redraw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const ctx = canvas.getContext("2d");
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintInner(ctx, rect.width, rect.height, palette());
    };
    return [cleanCanvas, cleanRange, cleanPreset, cleanSteps, () => stopMotion()];
  }

  function gramSchmidtLab(root) {
    root.innerHTML = labShell({
      title: "Gram–Schmidt：减掉旧方向",
      description: "不是把两个向量直接掰成直角，而是先找出第二个向量中已经由第一方向解释的部分。",
      taskTitle: "按四步播放，不要跳过投影",
      task: "灰色投影是要减掉的平行部分，剩下的金棕色余量才是真正的新方向。",
      controls: `<div class="ch9-toolbar" role="group" aria-label="正交化预设"><button class="is-active" type="button" data-gs-preset="general">一般位置</button><button type="button" data-gs-preset="near">接近相关</button><button type="button" data-gs-preset="dependent">线性相关</button></div><div class="ch9-steps" style="--ch9-steps:4"><button class="is-active" type="button" data-gs-step="0">01 原向量</button><button type="button" data-gs-step="1">02 投影</button><button type="button" data-gs-step="2">03 做减法</button><button type="button" data-gs-step="3">04 单位化</button></div>`,
      body: `<div class="ch9-lab-grid"><div class="ch9-panel"><div class="ch9-stage"><canvas data-gs-canvas aria-label="Gram-Schmidt 正交化步骤"></canvas></div><div class="ch9-equation" data-gs-equation></div></div><div class="ch9-panel"><div class="ch9-reading"><h4>正交证书</h4>${readingRow("投影系数", "coefficient")}${readingRow("余量长度", "residual")}${readingRow("最终内积", "orthogonality")}</div><div class="ch9-result" data-gs-result><span class="ch9-status" data-gs-status></span><h4 data-gs-title></h4><p data-gs-copy></p></div></div></div>`,
    });
    const canvas = root.querySelector("[data-gs-canvas]");
    const state = { step: 0, reveal: 0, preset: "general" };
    const vectors = { general: [[3, 0.65], [2.05, 2.55]], near: [[3, 0.65], [3.05, 0.82]], dependent: [[3, 0.65], [3.6, 0.78]] };
    let paintNow = () => {};
    let stopMotion = () => {};
    const [presetButtons, cleanPreset] = bindButtons(root, "[data-gs-preset]", (button) => {
      stopMotion();
      state.preset = button.dataset.gsPreset;
      state.step = 0;
      state.reveal = 0;
      activate(presetButtons, state.preset, "gsPreset");
      activate(stepButtons, 0, "gsStep");
      paintNow();
    });
    const [stepButtons, cleanStep] = bindButtons(root, "[data-gs-step]", (button) => {
      const target = Number(button.dataset.gsStep);
      state.step = target;
      activate(stepButtons, state.step, "gsStep");
      stopMotion();
      stopMotion = animate(state, { reveal: target }, ["reveal"], paintNow, 430);
    });
    function paint(ctx, width, height, colors) {
      clear(ctx, width, height);
      grid(ctx, width, height, colors, Math.max(38, width / 12));
      const origin = [width * 0.25, height * 0.76];
      axes(ctx, origin, width, height, colors);
      const unit = Math.min(width / 8.2, height / 4.2);
      const [v1, v2] = vectors[state.preset];
      const e1 = scale(1 / norm(v1), v1);
      const coefficient = dot(v2, e1);
      const projection = scale(coefficient, e1);
      const residualVector = sub(v2, projection);
      const residual = norm(residualVector);
      const e2 = residual > 1e-6 ? scale(1 / residual, residualVector) : null;
      const v1p = world(v1, origin, unit);
      const v2p = world(v2, origin, unit);
      const pp = world(projection, origin, unit);
      arrow(ctx, origin, v1p, colors.accentStrong, "v₁", { width: 4.5 });
      arrow(ctx, origin, v2p, colors.coral, "v₂", { width: 4.5 });
      const projectionReveal = clamp(state.reveal, 0, 1);
      const residualReveal = clamp(state.reveal - 1, 0, 1);
      const unitReveal = clamp(state.reveal - 2, 0, 1);
      if (projectionReveal > 0.001) {
        ctx.save();
        ctx.globalAlpha = projectionReveal;
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = colors.muted;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(v2p[0], v2p[1]);
        ctx.lineTo(pp[0], pp[1]);
        ctx.stroke();
        arrow(ctx, origin, pp, colors.muted, "投影", { width: 2.6, head: 10, wing: 5, labelY: 18 });
        ctx.restore();
      }
      if (residualReveal > 0.001 && residual > 1e-6) {
        ctx.save();
        ctx.globalAlpha = residualReveal;
        arrow(ctx, pp, v2p, colors.coral, "u₂", { width: 4.2, labelX: 10 });
        const rp = world(residualVector, origin, unit);
        arrow(ctx, origin, rp, colors.coral, "u₂", { width: 3, labelY: 19 });
        ctx.restore();
      }
      if (unitReveal > 0.001 && e2) {
        ctx.save();
        ctx.globalAlpha = unitReveal;
        const e1p = world(e1, origin, unit * 1.35);
        const e2p = world(e2, origin, unit * 1.35);
        arrow(ctx, origin, e1p, colors.accentStrong, "e₁", { width: 5 });
        arrow(ctx, origin, e2p, colors.coral, "e₂", { width: 5 });
        ctx.restore();
      }
      setReadout(root, "coefficient", fmt(coefficient, 3));
      setReadout(root, "residual", fmt(residual, 4));
      setReadout(root, "orthogonality", e2 ? fmt(dot(e1, e2), 5) : "—");
      root.querySelector("[data-gs-equation]").innerHTML = state.step < 1 ? display("e_1=v_1/\\lVert v_1\\rVert") : state.step === 1 ? display("\\operatorname{proj}_{e_1}v_2=\\langle v_2,e_1\\rangle e_1") : state.step === 2 ? display("u_2=v_2-\\operatorname{proj}_{e_1}v_2") : display("e_2=u_2/\\lVert u_2\\rVert");
      const result = root.querySelector("[data-gs-result]");
      const status = root.querySelector("[data-gs-status]");
      if (residual < 0.02) {
        result.className = "ch9-result is-warning";
        status.className = "ch9-status is-warn";
        status.textContent = "零余量";
        root.querySelector("[data-gs-title]").textContent = "当前向量没有带来新方向";
        root.querySelector("[data-gs-copy]").textContent = "第二个向量已经属于第一方向的张成空间，算法在单位化前停止。";
      } else if (state.step === 3) {
        result.className = "ch9-result is-success";
        status.className = "ch9-status is-ok";
        status.textContent = "正交化完成";
        root.querySelector("[data-gs-title]").textContent = "两条单位方向彼此正交";
        root.querySelector("[data-gs-copy]").textContent = "新基改变了坐标骨架，但没有改变原向量组张成的平面。";
      } else {
        result.className = "ch9-result";
        status.className = "ch9-status is-neutral";
        status.textContent = `第 ${state.step + 1} 步`;
        root.querySelector("[data-gs-title]").textContent = "继续观察投影与余量";
        root.querySelector("[data-gs-copy]").textContent = "每一步只处理一个几何动作。";
      }
    }
    const cleanCanvas = setupCanvas(canvas, paint);
    paintNow = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(ctx, rect.width, rect.height, palette());
    };
    return [cleanCanvas, cleanPreset, cleanStep, () => stopMotion()];
  }

  window.defineChapter9Renderer?.("inner-product-geometry", { formal: renderFormal, interactive: innerProductLab });
  window.defineChapter9Renderer?.("orthonormal-bases", { formal: renderFormal, interactive: gramSchmidtLab });
})();
