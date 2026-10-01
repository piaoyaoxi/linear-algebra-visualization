(() => {
  const {
    display, rad, dot, norm, sub, scale, fmt, palette, setupCanvas, repaintCanvas,
    arrow, grid, axes, world, clear, renderFormal, experimentHeader, taskBlock, range,
    setReadout, setOutput, bindRange, bindButtons, activate,
  } = window.Chapter9Native;

  function metric(label, key) {
    return `<div><span data-metric-label="${key}">${label}</span><strong data-readout="${key}">待观察</strong></div>`;
  }

  function conclusion(key) {
    return `<div class="ch9-conclusion" data-conclusion="${key}"><strong data-conclusion-title></strong><p data-conclusion-copy></p></div>`;
  }

  function innerProductLab(root) {
    root.innerHTML = `<h2>交互实验</h2><section class="ch9-inner-lab" data-ch9-lab data-lab-kind="inner-product">
      ${experimentHeader("从夹角到内积", "固定向量 x，改变 y 的方向。图中的夹角、垂足、投影和公式始终对应同一组向量。")}
      <div class="ch9-inner-body">
        <div class="ch9-inner-scene">
          <div class="ch9-stage">
            <div class="ch9-stage-top"><strong>夹角、垂足与有向投影</strong><span>图形与下方公式使用同一组颜色</span></div>
            <canvas data-ip-canvas aria-label="内积的夹角、垂足和有向投影几何图"></canvas>
          </div>
          <div class="ch9-equation" data-ip-equation></div>
        </div>
        <aside class="ch9-inner-side">
          <div class="ch9-toolbar" role="group" aria-label="内积典型状态">
            <button type="button" data-ip-preset="acute" class="is-active">锐角</button>
            <button type="button" data-ip-preset="right">正交</button>
            <button type="button" data-ip-preset="obtuse">钝角</button>
            <button type="button" data-ip-preset="zero">零向量</button>
          </div>
          <div class="ch9-range-list">${range("ipAngle", "向量 y 的方向", 0, 180, 1, 48, "°")}</div>
          <div class="ch9-metric-strip">${metric("夹角 θ", "angle")}${metric("有向投影", "projection")}${metric("〈x,y〉", "inner")}</div>
          ${conclusion("ip")}
        </aside>
      </div>
      ${taskBlock(["先在锐角、直角和钝角之间切换，观察垂足落在原点哪一侧。", "拖动 y 的方向，找出内积从正数变成负数的准确位置。", "切换到零向量，说明为什么夹角不定义而内积仍等于 0。"])}
    </section>`;

    const canvas = root.querySelector("[data-ip-canvas]");
    const state = { angle: 48, yLength: 2.35, preset: "acute" };
    const presets = { acute: [48, 2.35], right: [90, 2.35], obtuse: [132, 2.35], zero: [48, 0] };

    function paint(ctx, width, height, colors) {
      clear(ctx, width, height);
      grid(ctx, width, height, colors, Math.max(44, width / 13));
      const origin = [width * .43, height * .68];
      const unit = Math.min(width / 8.2, height / 4.7);
      axes(ctx, origin, width, height, colors);
      const x = [2.8, 0];
      const y = [state.yLength * Math.cos(rad(state.angle)), state.yLength * Math.sin(rad(state.angle))];
      const projection = y[0];
      const foot = world([projection, 0], origin, unit);
      const yPoint = world(y, origin, unit);
      const xPoint = world(x, origin, unit);

      if (state.yLength > 0) {
        ctx.save();
        ctx.strokeStyle = colors.coral;
        ctx.globalAlpha = .34;
        ctx.lineWidth = 9;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(origin[0], origin[1]);
        ctx.lineTo(foot[0], foot[1]);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = colors.muted;
        ctx.lineWidth = 1.6;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.moveTo(yPoint[0], yPoint[1]);
        ctx.lineTo(foot[0], foot[1]);
        ctx.stroke();
        ctx.setLineDash([]);
        const sign = projection >= 0 ? 1 : -1;
        ctx.strokeStyle = colors.muted;
        ctx.beginPath();
        ctx.moveTo(foot[0] - sign * 12, foot[1]);
        ctx.lineTo(foot[0] - sign * 12, foot[1] - 12);
        ctx.lineTo(foot[0], foot[1] - 12);
        ctx.stroke();
        ctx.strokeStyle = colors.accentStrong;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(origin[0], origin[1], unit * .62, -rad(state.angle), 0, state.angle > 180);
        ctx.stroke();
        ctx.fillStyle = colors.accentStrong;
        ctx.font = "700 13px ui-sans-serif, system-ui";
        ctx.fillText("θ", origin[0] + unit * .7 * Math.cos(rad(state.angle / 2)), origin[1] - unit * .7 * Math.sin(rad(state.angle / 2)));
        ctx.fillStyle = colors.coral;
        ctx.fillText("projₓ y", (origin[0] + foot[0]) / 2 - 24, origin[1] + 24);
        ctx.restore();
      }
      arrow(ctx, origin, xPoint, colors.accentStrong, "x", { width: 4.2, labelY: -13 });
      if (state.yLength > 0) arrow(ctx, origin, yPoint, colors.coral, "y", { width: 4.2 });
      else {
        ctx.save();
        ctx.fillStyle = colors.coral;
        ctx.beginPath();
        ctx.arc(origin[0], origin[1], 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "700 13px ui-sans-serif, system-ui";
        ctx.fillText("y = 0", origin[0] + 12, origin[1] - 14);
        ctx.restore();
      }

      const inner = dot(x, y);
      const signedProjection = state.yLength ? inner / norm(x) : 0;
      setReadout(root, "angle", state.yLength ? `${fmt(state.angle, 0)}°` : "未定义");
      setReadout(root, "projection", fmt(signedProjection, 3));
      setReadout(root, "inner", fmt(inner, 3));
      root.querySelector("[data-ip-equation]").innerHTML = display(`\\langle x,y\\rangle=\\lVert x\\rVert\\,\\operatorname{proj}^{\\pm}_{x}(y)=${fmt(norm(x), 2)}\\times ${fmt(signedProjection, 2)}=${fmt(inner, 2)}`);
      const box = root.querySelector('[data-conclusion="ip"]');
      const title = box.querySelector("[data-conclusion-title]");
      const copy = box.querySelector("[data-conclusion-copy]");
      box.classList.toggle("is-warning", state.yLength === 0);
      if (state.yLength === 0) {
        title.textContent = "零向量没有方向，夹角不定义";
        copy.textContent = "内积仍然等于 0；判断正交时必须单独处理这个边界。";
      } else if (Math.abs(inner) < .04) {
        title.textContent = "垂足落在原点：x 与 y 正交";
        copy.textContent = "有向投影为 0，因此内积也为 0。";
      } else if (inner > 0) {
        title.textContent = "垂足落在 x 的正向：内积为正";
        copy.textContent = "锐角让 y 在 x 方向上留下正的有向分量。";
      } else {
        title.textContent = "垂足落在 x 的反向：内积为负";
        copy.textContent = "钝角让 y 在 x 方向上留下负的有向分量。";
      }
    }

    const cleanupCanvas = setupCanvas(canvas, paint);
    const repaint = () => repaintCanvas(canvas, paint);
    const [buttons, cleanupButtons] = bindButtons(root, "[data-ip-preset]", (button) => {
      state.preset = button.dataset.ipPreset;
      [state.angle, state.yLength] = presets[state.preset];
      activate(buttons, state.preset, "ipPreset");
      const slider = root.querySelector('[data-range="ipAngle"]');
      slider.value = String(state.angle);
      slider.disabled = state.yLength === 0;
      setOutput(root, "ipAngle", `${fmt(state.angle, 0)}°`);
      repaint();
    });
    activate(buttons, state.preset, "ipPreset");
    const cleanupRange = bindRange(root, "ipAngle", (value) => {
      state.angle = value;
      state.yLength = 2.35;
      state.preset = value === 90 ? "right" : value < 90 ? "acute" : "obtuse";
      activate(buttons, state.preset, "ipPreset");
      setOutput(root, "ipAngle", `${fmt(value, 0)}°`);
      repaint();
    });
    return [cleanupCanvas, cleanupButtons, cleanupRange];
  }

  function gramSchmidtLab(root) {
    root.innerHTML = `<h2>交互实验</h2><section class="ch9-gs-lab" data-ch9-lab data-lab-kind="gram-schmidt">
      ${experimentHeader("Gram-Schmidt：减掉旧方向，留下新方向", "四个步骤共用一幅图。当前步骤只显示已经定义的向量和数值，不提前给出后面的结论。")}
      <div class="ch9-gs-body">
        <div class="ch9-stage">
          <div class="ch9-stage-top"><strong>同一舞台上的四步正交化</strong><span>青绿：旧方向　金棕：新方向　虚线：被减掉的部分</span></div>
          <canvas data-gs-canvas aria-label="Gram-Schmidt 投影、减法和单位化步骤图"></canvas>
        </div>
        <aside class="ch9-gs-side">
          <div class="ch9-toolbar" role="group" aria-label="向量组预设">
            <button type="button" class="is-active" data-gs-preset="general">一般位置</button>
            <button type="button" data-gs-preset="near">接近相关</button>
            <button type="button" data-gs-preset="dependent">线性相关</button>
          </div>
          <div class="ch9-metric-strip">${metric("投影系数", "coefficient")}${metric("余量长度", "residual")}${metric("〈e₁,e₂〉", "orthogonality")}</div>
          <div class="ch9-equation" data-gs-equation></div>
          ${conclusion("gs")}
        </aside>
      </div>
      <div class="ch9-stepper" role="group" aria-label="Gram-Schmidt 四步">
        <button type="button" class="is-active" data-gs-step="0"><span>01</span>保留第一方向</button>
        <button type="button" data-gs-step="1"><span>02</span>找出平行投影</button>
        <button type="button" data-gs-step="2"><span>03</span>减去投影</button>
        <button type="button" data-gs-step="3"><span>04</span>把余量单位化</button>
      </div>
      ${taskBlock(["依次完成四步，并在图中指出被减掉的平行部分。", "切换到接近相关，观察余量为什么很短。", "切换到线性相关，说明算法为什么必须停在第三步。"])}
    </section>`;

    const canvas = root.querySelector("[data-gs-canvas]");
    const vectors = { general: [[2.5, .9], [1.35, 2.55]], near: [[2.5, .9], [2.35, 1.18]], dependent: [[2.5, .9], [1.75, .63]] };
    const state = { preset: "general", step: 0 };

    function data() {
      const [v1, v2] = vectors[state.preset];
      const coefficient = dot(v2, v1) / dot(v1, v1);
      const projection = scale(coefficient, v1);
      const residual = sub(v2, projection);
      const residualNorm = norm(residual);
      const e1 = scale(1 / norm(v1), v1);
      const e2 = residualNorm > 1e-6 ? scale(1 / residualNorm, residual) : [0, 0];
      return { v1, v2, coefficient, projection, residual, residualNorm, e1, e2 };
    }

    function paint(ctx, width, height, colors) {
      clear(ctx, width, height);
      grid(ctx, width, height, colors, Math.max(44, width / 13));
      const origin = [width * .42, height * .72];
      const unit = Math.min(width / 8.2, height / 4.6);
      axes(ctx, origin, width, height, colors);
      const d = data();
      const v1Point = world(d.v1, origin, unit);
      const v2Point = world(d.v2, origin, unit);
      const projectionPoint = world(d.projection, origin, unit);
      arrow(ctx, origin, v1Point, colors.accentStrong, "v₁", { width: 4.2 });
      arrow(ctx, origin, v2Point, colors.coral, "v₂", { width: 4.2 });
      if (state.step >= 1) {
        ctx.save();
        ctx.strokeStyle = colors.muted;
        ctx.setLineDash([7, 6]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(v2Point[0], v2Point[1]);
        ctx.lineTo(projectionPoint[0], projectionPoint[1]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = .38;
        arrow(ctx, origin, projectionPoint, colors.muted, "proj₍ᵥ₁₎v₂", { width: 7, labelY: 20 });
        ctx.restore();
      }
      if (state.step >= 2 && d.residualNorm > 1e-6) {
        arrow(ctx, projectionPoint, v2Point, colors.coral, "u₂", { width: 4.2, labelX: 10 });
        ctx.save();
        ctx.strokeStyle = colors.muted;
        ctx.setLineDash([5, 5]);
        const residualAtOrigin = world(d.residual, origin, unit);
        ctx.beginPath();
        ctx.moveTo(v2Point[0], v2Point[1]);
        ctx.lineTo(residualAtOrigin[0], residualAtOrigin[1]);
        ctx.stroke();
        ctx.restore();
        arrow(ctx, origin, residualAtOrigin, colors.coral, "u₂", { width: 4.2 });
      }
      if (state.step >= 3 && d.residualNorm > 1e-6) {
        arrow(ctx, origin, world(scale(1.45, d.e1), origin, unit), colors.accentStrong, "e₁", { width: 5 });
        arrow(ctx, origin, world(scale(1.45, d.e2), origin, unit), colors.coral, "e₂", { width: 5 });
      }
      if (state.step >= 2 && d.residualNorm <= 1e-6) {
        ctx.save();
        ctx.fillStyle = colors.coral;
        ctx.font = "700 14px ui-sans-serif, system-ui";
        ctx.fillText("u₂ = 0：没有新方向", origin[0] + 22, origin[1] - 28);
        ctx.restore();
      }

      setReadout(root, "coefficient", state.step >= 1 ? fmt(d.coefficient, 3) : "待计算");
      setReadout(root, "residual", state.step >= 2 ? fmt(d.residualNorm, 3) : "待计算");
      const orthogonality = root.querySelector('[data-metric-label="orthogonality"]');
      if (state.step === 2) {
        orthogonality.textContent = "〈v₁,u₂〉";
        setReadout(root, "orthogonality", d.residualNorm > 1e-6 ? fmt(dot(d.v1, d.residual), 5) : "u₂ = 0");
      } else if (state.step >= 3) {
        orthogonality.textContent = "〈e₁,e₂〉";
        setReadout(root, "orthogonality", d.residualNorm > 1e-6 ? fmt(dot(d.e1, d.e2), 5) : "e₂ 不存在");
      } else {
        orthogonality.textContent = "正交检验";
        setReadout(root, "orthogonality", "尚未进行");
      }
      const equations = ["u_1=v_1", `\\operatorname{proj}_{v_1}v_2=${fmt(d.coefficient, 2)}v_1`, "u_2=v_2-\\operatorname{proj}_{v_1}v_2", d.residualNorm > 1e-6 ? "e_i=u_i/\\lVert u_i\\rVert" : "u_2=0\\;\\Rightarrow\\;\\text{停止}"];
      root.querySelector("[data-gs-equation]").innerHTML = display(equations[state.step]);
      const box = root.querySelector('[data-conclusion="gs"]');
      const title = box.querySelector("[data-conclusion-title]");
      const copy = box.querySelector("[data-conclusion-copy]");
      box.classList.toggle("is-warning", d.residualNorm <= 1e-6);
      if (d.residualNorm <= 1e-6) {
        title.textContent = "余量为零，算法在第三步停止";
        copy.textContent = "v₂ 完全落在旧方向上，这组输入只张成一条直线。";
      } else if (state.step < 2) {
        title.textContent = "先识别需要减掉的平行部分";
        copy.textContent = "投影属于 span(v₁)，减去它不会引入额外方向。";
      } else if (state.step === 2) {
        title.textContent = "余量 u₂ 与 v₁ 垂直";
        copy.textContent = "u₂ 仍位于原来两个向量张成的平面内。";
      } else {
        title.textContent = "标准正交组完成，张成空间保持不变";
        copy.textContent = "单位化只改变长度，e₁ 与 e₂ 的内积为 0。";
      }
    }

    const cleanupCanvas = setupCanvas(canvas, paint);
    const repaint = () => repaintCanvas(canvas, paint);
    const [presetButtons, cleanupPresets] = bindButtons(root, "[data-gs-preset]", (button) => {
      state.preset = button.dataset.gsPreset;
      state.step = state.preset === "dependent" ? 2 : 0;
      activate(presetButtons, state.preset, "gsPreset");
      activate(stepButtons, state.step, "gsStep");
      const normalize = root.querySelector('[data-gs-step="3"]');
      normalize.disabled = state.preset === "dependent";
      repaint();
    });
    const [stepButtons, cleanupSteps] = bindButtons(root, "[data-gs-step]", (button) => {
      if (button.disabled) return;
      state.step = Number(button.dataset.gsStep);
      activate(stepButtons, state.step, "gsStep");
      repaint();
    });
    activate(presetButtons, state.preset, "gsPreset");
    activate(stepButtons, state.step, "gsStep");
    return [cleanupCanvas, cleanupPresets, cleanupSteps];
  }

  window.defineChapter9Renderer?.("inner-product-geometry", { formal: renderFormal, interactive: innerProductLab });
  window.defineChapter9Renderer?.("orthonormal-bases", { formal: renderFormal, interactive: gramSchmidtLab });
})();
