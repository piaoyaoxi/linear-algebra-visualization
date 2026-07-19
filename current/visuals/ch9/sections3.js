(() => {
  const {
    display, clamp, rad, dot, norm, sub, scale, matVec, matMul, transpose, fmt,
    palette, setupCanvas, roundedRect, arrow, grid, axes, world, clear,
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

  function projectionLab(root) {
    root.innerHTML = labShell({
      title: "垂足与距离最低点",
      description: "左边做正交分解，右边记录子空间中所有候选点的距离平方。",
      taskTitle: "移动候选点，找到唯一最低点",
      task: "右侧曲线不是另一个问题；它完整记录左侧每个候选点到 x 的距离。",
      controls: `<div class="ch9-toolbar"><button type="button" class="ch9-action is-primary" data-proj-best>把候选点移到垂足</button><button type="button" data-proj-preset="perp">让 x 位于 W⊥</button><button type="button" data-proj-preset="general">恢复一般位置</button></div><div class="ch9-range-list">${range("lineAngle", "子空间方向", -70, 70, 1, 28, "°")}${range("candidate", "候选参数 t", -4, 4, 0.05, 0.4)}</div>`,
      body: `<div class="ch9-lab-grid is-even"><div class="ch9-panel"><div class="ch9-stage"><canvas data-proj-geometry aria-label="向量到子空间的正交投影"></canvas></div><div class="ch9-reading"><h4>几何分解</h4>${readingRow("最短距离", "bestDistance")}${readingRow("当前距离", "currentDistance")}</div></div><div class="ch9-panel"><div class="ch9-stage"><canvas data-proj-curve aria-label="候选点距离平方曲线"></canvas></div><div class="ch9-result" data-proj-result><span class="ch9-status" data-proj-status></span><h4 data-proj-title></h4><p data-proj-copy></p></div></div></div>`,
    });
    const geometry = root.querySelector("[data-proj-geometry]");
    const curve = root.querySelector("[data-proj-curve]");
    const state = { angle: 28, candidate: 0.4, x: [2.3, 2.45] };
    let repaint = () => {};
    let stopAnimation = () => {};

    function values() {
      const u = [Math.cos(rad(state.angle)), Math.sin(rad(state.angle))];
      const coefficient = dot(state.x, u);
      const p = scale(coefficient, u);
      const e = sub(state.x, p);
      return { u, coefficient, p, e, w: scale(state.candidate, u) };
    }

    function paintGeometry(ctx, width, height, colors) {
      clear(ctx, width, height);
      grid(ctx, width, height, colors, Math.max(38, width / 10));
      const origin = [width * 0.32, height * 0.72];
      const unit = Math.min(width / 7.5, height / 4.2);
      axes(ctx, origin, width, height, colors);
      const data = values();
      const a = world(scale(-4.5, data.u), origin, unit);
      const b = world(scale(4.5, data.u), origin, unit);
      ctx.save();
      ctx.strokeStyle = colors.accentStrong;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
      ctx.restore();
      const xPoint = world(state.x, origin, unit);
      const pPoint = world(data.p, origin, unit);
      const wPoint = world(data.w, origin, unit);
      arrow(ctx, origin, xPoint, colors.text, "x", { width: 4.2 });
      arrow(ctx, origin, pPoint, colors.accentStrong, "p", { width: 3.8, labelY: 18 });
      arrow(ctx, pPoint, xPoint, colors.coral, "e", { width: 3.4 });
      ctx.save();
      ctx.strokeStyle = colors.muted;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(wPoint[0], wPoint[1]);
      ctx.lineTo(xPoint[0], xPoint[1]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.text;
      ctx.beginPath();
      ctx.arc(wPoint[0], wPoint[1], 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.muted;
      ctx.font = "700 12px ui-sans-serif, system-ui";
      ctx.fillText("w", wPoint[0] + 8, wPoint[1] - 7);
      ctx.restore();
    }

    function paintCurve(ctx, width, height, colors) {
      clear(ctx, width, height);
      const data = values();
      const minimum = dot(data.e, data.e);
      const left = 50;
      const right = width - 30;
      const top = 28;
      const bottom = height - 52;
      ctx.save();
      ctx.strokeStyle = colors.strongLine;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(left, bottom);
      ctx.lineTo(right, bottom);
      ctx.moveTo(left, bottom);
      ctx.lineTo(left, top);
      ctx.stroke();
      ctx.strokeStyle = colors.accentStrong;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= 140; i += 1) {
        const t = -4 + (8 * i) / 140;
        const value = minimum + (t - data.coefficient) ** 2;
        const x = left + ((t + 4) / 8) * (right - left);
        const y = bottom - Math.min(value / 20, 1) * (bottom - top);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      const point = (t, value) => [left + ((t + 4) / 8) * (right - left), bottom - Math.min(value / 20, 1) * (bottom - top)];
      const best = point(data.coefficient, minimum);
      const currentSquare = minimum + (state.candidate - data.coefficient) ** 2;
      const current = point(state.candidate, currentSquare);
      ctx.fillStyle = colors.accentStrong;
      ctx.beginPath();
      ctx.arc(best[0], best[1], 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.text;
      ctx.beginPath();
      ctx.arc(current[0], current[1], 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "700 12px ui-sans-serif, system-ui";
      ctx.fillStyle = colors.accentStrong;
      ctx.fillText("垂足", best[0] + 8, best[1] - 8);
      ctx.fillStyle = colors.muted;
      ctx.fillText("当前 w", current[0] + 8, current[1] + 16);
      ctx.restore();
      const hit = Math.abs(state.candidate - data.coefficient) < 0.015;
      setReadout(root, "bestDistance", fmt(norm(data.e), 3));
      setReadout(root, "currentDistance", fmt(Math.sqrt(currentSquare), 3));
      const result = root.querySelector("[data-proj-result]");
      const status = root.querySelector("[data-proj-status]");
      result.className = hit ? "ch9-result is-success" : "ch9-result";
      status.className = hit ? "ch9-status is-ok" : "ch9-status is-neutral";
      status.textContent = hit ? "最近点命中" : "仍是候选点";
      root.querySelector("[data-proj-title]").textContent = hit ? "垂足与曲线最低点对齐" : "候选点还可以继续靠近";
      root.querySelector("[data-proj-copy]").textContent = hit ? "多出的距离平方为 0，最近点唯一。" : `当前多出 ${fmt((state.candidate - data.coefficient) ** 2, 3)} 的距离平方。`;
    }

    const cleanGeometry = setupCanvas(geometry, paintGeometry);
    const cleanCurve = setupCanvas(curve, paintCurve);
    repaint = () => {
      repaintCanvas(geometry, paintGeometry);
      repaintCanvas(curve, paintCurve);
    };
    const cleanRanges = [
      bindRange(root, "lineAngle", (value) => { state.angle = value; setOutput(root, "lineAngle", `${fmt(value, 0)}°`); repaint(); }),
      bindRange(root, "candidate", (value) => { state.candidate = value; setOutput(root, "candidate", fmt(value, 2)); repaint(); }),
    ];
    const [, cleanPresets] = bindButtons(root, "[data-proj-preset]", (button) => {
      state.x = button.dataset.projPreset === "perp" ? [-1.18, 2.2] : [2.3, 2.45];
      repaint();
    });
    const bestButton = root.querySelector("[data-proj-best]");
    const bestHandler = () => {
      const data = values();
      stopAnimation();
      stopAnimation = animate(state, { candidate: data.coefficient }, ["candidate"], () => {
        root.querySelector('[data-range="candidate"]').value = String(state.candidate);
        setOutput(root, "candidate", fmt(state.candidate, 2));
        repaint();
      });
    };
    bestButton.addEventListener("click", bestHandler);
    return [cleanGeometry, cleanCurve, ...cleanRanges, cleanPresets, () => { bestButton.removeEventListener("click", bestHandler); stopAnimation(); }];
  }

  function rotation(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [c, -s, s, c];
  }

  function spectralLab(root) {
    root.innerHTML = labShell({
      title: "正交谱分解的三步动作",
      description: "不要把 A=QΛQᵀ 当作一串符号。每次只执行一次坐标动作。",
      taskTitle: "按 Qᵀ → Λ → Q 的顺序播放",
      task: "先把特征方向转到坐标轴，再独立伸缩，最后转回原空间。",
      controls: `<div class="ch9-toolbar"><button class="is-active" type="button" data-sp-preset="positive">正定</button><button type="button" data-sp-preset="indefinite">一正一负</button><button type="button" data-sp-preset="repeated">重特征值</button><button type="button" data-sp-preset="nonsymmetric">非对称对照</button></div><div class="ch9-steps" style="--ch9-steps:4"><button class="is-active" type="button" data-sp-step="0">I</button><button type="button" data-sp-step="1">Qᵀ</button><button type="button" data-sp-step="2">ΛQᵀ</button><button type="button" data-sp-step="3">QΛQᵀ</button></div>`,
      body: `<div class="ch9-lab-grid"><div class="ch9-panel"><div class="ch9-stage"><canvas data-sp-canvas aria-label="实对称矩阵正交谱分解"></canvas></div><div class="ch9-equation" data-sp-equation></div></div><div class="ch9-panel"><div class="ch9-reading"><h4>当前结构</h4>${readingRow("λ₁ / λ₂", "lambdas")}${readingRow("A−Aᵀ 的误差", "symmetry")}${readingRow("当前阶段", "stage")}</div><div class="ch9-result" data-sp-result><span class="ch9-status" data-sp-status></span><h4 data-sp-title></h4><p data-sp-copy></p></div></div></div>`,
    });
    const canvas = root.querySelector("[data-sp-canvas]");
    const state = { step: 0, reveal: 0, preset: "positive" };
    const presets = {
      positive: { angle: 30, l1: 2.4, l2: 0.9, asym: 0 },
      indefinite: { angle: 24, l1: 2.1, l2: -1.1, asym: 0 },
      repeated: { angle: 0, l1: 1.55, l2: 1.55, asym: 0 },
      nonsymmetric: { angle: 26, l1: 2.1, l2: 0.9, asym: 0.65 },
    };
    let paintNow = () => {};
    let stopMotion = () => {};
    const [presetButtons, cleanPreset] = bindButtons(root, "[data-sp-preset]", (button) => {
      stopMotion();
      state.preset = button.dataset.spPreset;
      state.step = 0;
      state.reveal = 0;
      activate(presetButtons, state.preset, "spPreset");
      activate(stepButtons, state.step, "spStep");
      paintNow();
    });
    const [stepButtons, cleanStep] = bindButtons(root, "[data-sp-step]", (button) => {
      if (state.preset === "nonsymmetric") return;
      const target = Number(button.dataset.spStep);
      state.step = target;
      activate(stepButtons, state.step, "spStep");
      stopMotion();
      stopMotion = animate(state, { reveal: target }, ["reveal"], paintNow, 620);
    });

    function paint(ctx, width, height, colors) {
      clear(ctx, width, height);
      grid(ctx, width, height, colors, Math.max(38, width / 12));
      const origin = [width * 0.42, height * 0.58];
      const unit = Math.min(width / 7, height / 3.8);
      axes(ctx, origin, width, height, colors);
      const preset = presets[state.preset];
      const q = rotation(rad(preset.angle));
      const lambda = [preset.l1, 0, 0, preset.l2];
      const symmetricA = matMul(matMul(q, lambda), transpose(q));
      const A = [symmetricA[0], symmetricA[1] + preset.asym, symmetricA[2], symmetricA[3]];
      const symmetric = Math.abs(A[1] - A[2]) < 1e-8;
      const transforms = [[1, 0, 0, 1], transpose(q), matMul(lambda, transpose(q)), symmetricA];
      const reveal = clamp(state.reveal, 0, 3);
      const lower = Math.floor(reveal);
      const upper = Math.min(3, lower + 1);
      const blend = reveal - lower;
      const current = symmetric ? transforms[lower].map((value, index) => value + (transforms[upper][index] - value) * blend) : A;
      ctx.save();
      ctx.strokeStyle = symmetric ? colors.accentStrong : colors.coral;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= 180; i += 1) {
        const angle = (Math.PI * 2 * i) / 180;
        const point = world(matVec(current, [Math.cos(angle), Math.sin(angle)]), origin, unit);
        if (i === 0) ctx.moveTo(point[0], point[1]); else ctx.lineTo(point[0], point[1]);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      if (symmetric && (state.step === 0 || state.step === 3)) {
        arrow(ctx, origin, world([q[0], q[2]], origin, unit * 1.25), colors.accentStrong, "q₁", { width: 3.5 });
        arrow(ctx, origin, world([q[1], q[3]], origin, unit * 1.25), colors.coral, "q₂", { width: 3.5 });
      }
      ctx.save();
      roundedRect(ctx, width - 205, 28, 170, 118, 12);
      ctx.fillStyle = colors.paper;
      ctx.fill();
      ctx.strokeStyle = colors.line;
      ctx.stroke();
      ctx.fillStyle = colors.muted;
      ctx.font = "12px ui-sans-serif, system-ui";
      ctx.fillText("当前复合", width - 185, 54);
      ctx.fillStyle = symmetric ? colors.accentStrong : colors.coral;
      ctx.font = "700 16px ui-monospace, monospace";
      ctx.fillText(symmetric ? ["I", "Qᵀ", "ΛQᵀ", "QΛQᵀ"][state.step] : "Aᵀ ≠ A", width - 185, 82);
      ctx.fillStyle = colors.muted;
      ctx.font = "12px ui-sans-serif, system-ui";
      ctx.fillText(`λ₁=${fmt(preset.l1, 2)}  λ₂=${fmt(preset.l2, 2)}`, width - 185, 112);
      ctx.restore();
      setReadout(root, "lambdas", `${fmt(preset.l1, 2)} / ${fmt(preset.l2, 2)}`);
      setReadout(root, "symmetry", fmt(Math.abs(A[1] - A[2]), 4));
      setReadout(root, "stage", symmetric ? ["原坐标", "转入特征坐标", "独立伸缩", "旋回原坐标"][state.step] : "谱路径关闭");
      root.querySelector("[data-sp-equation]").innerHTML = display(symmetric ? ["x", "Q^Tx", "\\Lambda Q^Tx", "Q\\Lambda Q^Tx=Ax"][state.step] : "A^T\\ne A");
      const result = root.querySelector("[data-sp-result]");
      const status = root.querySelector("[data-sp-status]");
      if (!symmetric) {
        result.className = "ch9-result is-warning";
        status.className = "ch9-status is-warn";
        status.textContent = "结论关闭";
        root.querySelector("[data-sp-title]").textContent = "矩阵不对称";
        root.querySelector("[data-sp-copy]").textContent = "不能直接宣称存在实标准正交特征基。";
      } else if (Math.abs(preset.l1 - preset.l2) < 0.01) {
        result.className = "ch9-result is-success";
        status.className = "ch9-status is-ok";
        status.textContent = "重特征值";
        root.querySelector("[data-sp-title]").textContent = "图形各向同性";
        root.querySelector("[data-sp-copy]").textContent = "特征方向不唯一，但仍可以选择标准正交基。";
      } else if (state.step === 3) {
        result.className = "ch9-result is-success";
        status.className = "ch9-status is-ok";
        status.textContent = "谱分解完成";
        root.querySelector("[data-sp-title]").textContent = "三步复合与 A 一致";
        root.querySelector("[data-sp-copy]").textContent = "主轴方向和两个独立伸缩量已经全部可见。";
      } else {
        result.className = "ch9-result";
        status.className = "ch9-status is-neutral";
        status.textContent = `第 ${state.step + 1} 幅`;
        root.querySelector("[data-sp-title]").textContent = "继续沿三步路径观察";
        root.querySelector("[data-sp-copy]").textContent = "不要跳过坐标旋转，只看最终椭圆。";
      }
    }
    const cleanCanvas = setupCanvas(canvas, paint);
    paintNow = () => repaintCanvas(canvas, paint);
    return [cleanCanvas, cleanPreset, cleanStep, () => stopMotion()];
  }

  window.defineChapter9Renderer?.("orthogonal-subspaces", { formal: renderFormal, interactive: projectionLab });
  window.defineChapter9Renderer?.("symmetric-canonical-form", { formal: renderFormal, interactive: spectralLab });
})();
