(() => {
  const {
    display, rad, dot, norm, sub, scale, matVec, matMul, transpose, fmt,
    setupCanvas, repaintCanvas, arrow, grid, axes, world, clear, renderFormal,
    labHeading, range, bindRange, bindButtons, activate, setOutput, animate,
  } = window.Chapter9Native;

  function projectionLab(root) {
    root.innerHTML = `<h2>交互实验</h2><section class="ch9-proj-lab" data-ch9-lab data-lab-kind="projection">
      ${labHeading("§5 · 同一个参数，两种证据", "垂足为什么是唯一最近点", "左图中的候选点 w 与右图中的金棕色点使用同一个参数 t。沿 W 移动 w，右侧就在完整记录距离平方。")}
      <div class="ch9-proj-controls">
        <div class="ch9-toolbar"><button type="button" class="ch9-action is-primary" data-proj-best>把 w 移到垂足</button><button type="button" data-proj-perp>让 x 位于 W⊥</button><button type="button" data-proj-reset>恢复一般位置</button></div>
        <div class="ch9-range-list">${range("lineAngle", "子空间 W 的方向", -65, 65, 1, 28, "°")}${range("candidate", "候选点参数 t", -4, 4, .05, .4)}</div>
      </div>
      <div class="ch9-proj-linked">
        <div class="ch9-proj-panel"><header>几何图：x = p + e</header><canvas data-proj-geometry aria-label="向量到直线子空间的正交分解"></canvas></div>
        <div class="ch9-proj-panel"><header>距离图：f(t) = ‖x − tu‖²</header><canvas data-proj-curve aria-label="候选点到向量的距离平方曲线"></canvas></div>
      </div>
      <div class="ch9-proj-footer">
        <div class="ch9-equation" data-proj-equation></div>
        <div class="ch9-conclusion" data-proj-conclusion><strong data-proj-title></strong><p data-proj-copy></p></div>
      </div>
    </section>`;

    const geometry = root.querySelector("[data-proj-geometry]");
    const curve = root.querySelector("[data-proj-curve]");
    const state = { angle: 28, candidate: .4, x: [2.3, 2.45] };
    let stop = () => {};

    function values() {
      const u = [Math.cos(rad(state.angle)), Math.sin(rad(state.angle))];
      const coefficient = dot(state.x, u);
      const p = scale(coefficient, u);
      const e = sub(state.x, p);
      return { u, coefficient, p, e, w: scale(state.candidate, u) };
    }

    function paintGeometry(ctx, width, height, colors) {
      clear(ctx, width, height);
      grid(ctx, width, height, colors, Math.max(44, width / 12));
      const origin = [width * .39, height * .72];
      const unit = Math.min(width / 8.2, height / 4.6);
      axes(ctx, origin, width, height, colors);
      const d = values();
      const a = world(scale(-4.8, d.u), origin, unit);
      const b = world(scale(4.8, d.u), origin, unit);
      ctx.save();
      ctx.strokeStyle = colors.accentStrong;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      ctx.fillStyle = colors.accentStrong;
      ctx.font = "700 13px ui-sans-serif, system-ui";
      ctx.fillText("W", b[0] - 24, b[1] - 12);
      ctx.restore();
      const xPoint = world(state.x, origin, unit);
      const pPoint = world(d.p, origin, unit);
      const wPoint = world(d.w, origin, unit);
      arrow(ctx, origin, xPoint, colors.text, "x", { width: 4.2 });
      arrow(ctx, origin, pPoint, colors.accentStrong, "p", { width: 3.7, labelY: 18 });
      arrow(ctx, pPoint, xPoint, colors.coral, "e", { width: 3.7 });
      ctx.save();
      ctx.strokeStyle = colors.coral;
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(wPoint[0], wPoint[1]); ctx.lineTo(xPoint[0], xPoint[1]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.coral;
      ctx.beginPath(); ctx.arc(wPoint[0], wPoint[1], 6, 0, Math.PI * 2); ctx.fill();
      ctx.font = "700 13px ui-sans-serif, system-ui";
      ctx.fillText("w(t)", wPoint[0] + 8, wPoint[1] - 8);
      ctx.restore();
    }

    function paintCurve(ctx, width, height, colors) {
      clear(ctx, width, height);
      const d = values();
      const minimum = dot(d.e, d.e);
      const left = 52, right = width - 26, top = 32, bottom = height - 52;
      ctx.save();
      ctx.strokeStyle = colors.strongLine; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(left, bottom); ctx.lineTo(right, bottom); ctx.moveTo(left, bottom); ctx.lineTo(left, top); ctx.stroke();
      ctx.fillStyle = colors.muted; ctx.font = "12px ui-sans-serif, system-ui";
      ctx.fillText("t", right - 8, bottom + 24); ctx.fillText("距离²", left - 16, top - 9);
      const tToX = (t) => left + (t + 4) / 8 * (right - left);
      const maxValue = Math.max(16, minimum + 16);
      const vToY = (value) => bottom - Math.min(value / maxValue, 1) * (bottom - top);
      ctx.strokeStyle = colors.accentStrong; ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= 160; i += 1) {
        const t = -4 + 8 * i / 160;
        const value = minimum + (t - d.coefficient) ** 2;
        const px = tToX(t), py = vToY(value);
        if (!i) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      const currentValue = minimum + (state.candidate - d.coefficient) ** 2;
      const bx = tToX(d.coefficient), by = vToY(minimum);
      const cx = tToX(state.candidate), cy = vToY(currentValue);
      ctx.strokeStyle = colors.coral; ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(cx, bottom); ctx.lineTo(cx, cy); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = colors.accentStrong; ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = colors.coral; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
      ctx.font = "700 12px ui-sans-serif, system-ui";
      ctx.fillStyle = colors.accentStrong; ctx.fillText("最低点 p", bx + 8, by - 9);
      ctx.fillStyle = colors.coral; ctx.fillText("当前 w", cx + 8, cy + 17);
      ctx.restore();

      const extra = (state.candidate - d.coefficient) ** 2;
      root.querySelector("[data-proj-equation]").innerHTML = display(`\\lVert x-w\\rVert^2=\\underbrace{${fmt(minimum, 2)}}_{\\lVert e\\rVert^2}+\\underbrace{${fmt(extra, 2)}}_{\\lVert p-w\\rVert^2}`);
      const hit = extra < .001;
      const box = root.querySelector("[data-proj-conclusion]");
      box.classList.toggle("is-warning", !hit);
      root.querySelector("[data-proj-title]").textContent = hit ? "同一个 t 同时命中垂足和曲线最低点" : `当前距离还多出 ${fmt(extra, 2)} 的平方`;
      root.querySelector("[data-proj-copy]").textContent = hit ? "附加项 ‖p−w‖² 等于 0，所以 p 是唯一最近点。" : "继续沿 W 移动金棕色候选点，直到它与青绿色投影点重合。";
    }

    const cleanGeometry = setupCanvas(geometry, paintGeometry);
    const cleanCurve = setupCanvas(curve, paintCurve);
    const repaint = () => { repaintCanvas(geometry, paintGeometry); repaintCanvas(curve, paintCurve); };
    const cleanRanges = [
      bindRange(root, "lineAngle", (value) => { state.angle = value; setOutput(root, "lineAngle", `${fmt(value, 0)}°`); repaint(); }),
      bindRange(root, "candidate", (value) => { state.candidate = value; setOutput(root, "candidate", fmt(value, 2)); repaint(); }),
    ];
    const best = root.querySelector("[data-proj-best]");
    const perpendicular = root.querySelector("[data-proj-perp]");
    const reset = root.querySelector("[data-proj-reset]");
    const bestHandler = () => {
      stop();
      stop = animate(state, { candidate: values().coefficient }, ["candidate"], () => {
        root.querySelector('[data-range="candidate"]').value = String(state.candidate);
        setOutput(root, "candidate", fmt(state.candidate, 2)); repaint();
      }, 620);
    };
    const perpendicularHandler = () => { const a = rad(state.angle); state.x = scale(2.65, [-Math.sin(a), Math.cos(a)]); state.candidate = 0; root.querySelector('[data-range="candidate"]').value = "0"; setOutput(root, "candidate", "0"); repaint(); };
    const resetHandler = () => { state.x = [2.3, 2.45]; state.candidate = .4; root.querySelector('[data-range="candidate"]').value = ".4"; setOutput(root, "candidate", "0.4"); repaint(); };
    best.addEventListener("click", bestHandler); perpendicular.addEventListener("click", perpendicularHandler); reset.addEventListener("click", resetHandler);
    return [cleanGeometry, cleanCurve, ...cleanRanges, () => { stop(); best.removeEventListener("click", bestHandler); perpendicular.removeEventListener("click", perpendicularHandler); reset.removeEventListener("click", resetHandler); }];
  }

  function rotation(angle) { const c = Math.cos(angle), s = Math.sin(angle); return [c, -s, s, c]; }

  function spectralLab(root) {
    root.innerHTML = `<h2>交互实验</h2><section class="ch9-spectral-lab" data-ch9-lab data-lab-kind="spectral">
      ${labHeading("§6 · 三幅连续场景", "把 A = QΛQᵀ 拆成三次可见动作", "每一幅都保留上一幅的数学含义：先改用特征坐标，再沿两个坐标轴独立伸缩，最后回到原坐标。")}
      <div class="ch9-spectral-controls">
        <div class="ch9-toolbar" role="group" aria-label="谱分解矩阵类型"><button type="button" class="is-active" data-sp-preset="positive">正定对称</button><button type="button" data-sp-preset="indefinite">一正一负</button><button type="button" data-sp-preset="repeated">重特征值</button><button type="button" data-sp-preset="nonsymmetric">非对称矩阵</button></div>
        <div class="ch9-toolbar" role="group" aria-label="谱分解观察步骤"><button type="button" class="is-active" data-sp-step="0">1　Qᵀ</button><button type="button" data-sp-step="1">2　Λ</button><button type="button" data-sp-step="2">3　Q</button></div>
      </div>
      <div class="ch9-spectral-story" data-sp-story>
        <div class="ch9-spectral-frame is-current" data-sp-frame="0"><header><strong>① 转入特征坐标</strong><span>Qᵀ：特征方向对准坐标轴</span></header><canvas data-sp-canvas="0" aria-label="转入特征坐标"></canvas></div>
        <div class="ch9-spectral-frame" data-sp-frame="1"><header><strong>② 沿坐标轴独立伸缩</strong><span>Λ：两个方向互不混合</span></header><canvas data-sp-canvas="1" aria-label="特征坐标中的独立伸缩"></canvas></div>
        <div class="ch9-spectral-frame" data-sp-frame="2"><header><strong>③ 旋回原坐标</strong><span>Q：椭圆主轴成为 q₁、q₂</span></header><canvas data-sp-canvas="2" aria-label="旋回原坐标后的对称变换"></canvas></div>
      </div>
      <div class="ch9-theorem-warning" data-sp-warning hidden><strong>定理闸门关闭：Aᵀ ≠ A</strong><p>一般矩阵不能直接写成 QΛQᵀ。这里先停止动画，避免把实谱定理套到不满足假设的对象上。</p></div>
      <div class="ch9-spectral-footer"><div class="ch9-equation" data-sp-equation></div><div class="ch9-conclusion" data-sp-conclusion><strong data-sp-title></strong><p data-sp-copy></p></div></div>
    </section>`;

    const canvases = [0, 1, 2].map((index) => root.querySelector(`[data-sp-canvas="${index}"]`));
    const state = { preset: "positive", step: 0 };
    const presets = { positive: { angle: 30, l1: 2.2, l2: .85 }, indefinite: { angle: 24, l1: 2.0, l2: -1.05 }, repeated: { angle: 0, l1: 1.45, l2: 1.45 } };

    function paintFrame(index, ctx, width, height, colors) {
      clear(ctx, width, height);
      grid(ctx, width, height, colors, Math.max(38, width / 8));
      const origin = [width * .5, height * .56];
      const unit = Math.min(width / 6.2, height / 4.2);
      axes(ctx, origin, width, height, colors);
      const p = presets[state.preset] || presets.positive;
      const q = rotation(rad(p.angle));
      const lambda = [p.l1, 0, 0, p.l2];
      const transform = index === 0 ? [1, 0, 0, 1] : index === 1 ? lambda : matMul(matMul(q, lambda), transpose(q));
      ctx.save();
      ctx.strokeStyle = index === 0 ? colors.strongLine : colors.accentStrong;
      ctx.lineWidth = index === 0 ? 2 : 3;
      ctx.beginPath();
      for (let i = 0; i <= 180; i += 1) {
        const a = Math.PI * 2 * i / 180;
        const point = world(matVec(transform, [Math.cos(a), Math.sin(a)]), origin, unit);
        if (!i) ctx.moveTo(point[0], point[1]); else ctx.lineTo(point[0], point[1]);
      }
      ctx.closePath(); ctx.stroke(); ctx.restore();
      if (index === 0) {
        ctx.save();
        ctx.strokeStyle = colors.muted;
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1.5;
        for (const direction of [[q[0], q[2]], [q[1], q[3]]]) {
          const a = world(scale(-1.35, direction), origin, unit);
          const b = world(scale(1.35, direction), origin, unit);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        }
        ctx.restore();
        arrow(ctx, origin, world([1.35, 0], origin, unit), colors.accentStrong, "Qᵀq₁=e₁", { width: 3.3, labelY: -13 });
        arrow(ctx, origin, world([0, 1.35], origin, unit), colors.coral, "Qᵀq₂=e₂", { width: 3.3 });
      } else if (index === 2) {
        arrow(ctx, origin, world(scale(1.28, [q[0], q[2]]), origin, unit), colors.accentStrong, "q₁", { width: 3.3 });
        arrow(ctx, origin, world(scale(1.28, [q[1], q[3]]), origin, unit), colors.coral, "q₂", { width: 3.3 });
      } else {
        arrow(ctx, origin, world([Math.sign(p.l1) * Math.min(Math.abs(p.l1), 1.7), 0], origin, unit), colors.accentStrong, `λ₁=${fmt(p.l1, 2)}`, { width: 3.3, labelY: -13 });
        arrow(ctx, origin, world([0, Math.sign(p.l2) * Math.min(Math.abs(p.l2), 1.7)], origin, unit), colors.coral, `λ₂=${fmt(p.l2, 2)}`, { width: 3.3 });
      }
    }

    const paintFunctions = canvases.map((_, index) => (ctx, width, height, colors) => paintFrame(index, ctx, width, height, colors));
    const cleanCanvases = canvases.map((canvas, index) => setupCanvas(canvas, paintFunctions[index]));
    const repaint = () => canvases.forEach((canvas, index) => repaintCanvas(canvas, paintFunctions[index]));

    function update() {
      const nonsymmetric = state.preset === "nonsymmetric";
      root.querySelector("[data-sp-story]").hidden = nonsymmetric;
      root.querySelector("[data-sp-warning]").hidden = !nonsymmetric;
      root.querySelectorAll("[data-sp-step]").forEach((button) => { button.disabled = nonsymmetric; });
      root.querySelectorAll("[data-sp-frame]").forEach((frame) => frame.classList.toggle("is-current", Number(frame.dataset.spFrame) === state.step));
      if (nonsymmetric) {
        root.querySelector("[data-sp-equation]").innerHTML = display("A^T\\ne A\\;\\Longrightarrow\\;\\text{不能直接使用实谱定理}");
        root.querySelector("[data-sp-conclusion]").classList.add("is-warning");
        root.querySelector("[data-sp-title]").textContent = "先检查对称性，再谈正交对角化";
        root.querySelector("[data-sp-copy]").textContent = "非对称矩阵可能有实特征值，也未必拥有标准正交特征基。";
        return;
      }
      const p = presets[state.preset];
      const equations = ["x\\xmapsto{Q^T}Q^Tx", "Q^Tx\\xmapsto{\\Lambda}\\Lambda Q^Tx", "\\Lambda Q^Tx\\xmapsto{Q}Q\\Lambda Q^Tx=Ax"];
      root.querySelector("[data-sp-equation]").innerHTML = display(equations[state.step]);
      root.querySelector("[data-sp-conclusion]").classList.remove("is-warning");
      if (state.preset === "repeated") {
        root.querySelector("[data-sp-title]").textContent = "重特征值使图形各向同性";
        root.querySelector("[data-sp-copy]").textContent = "特征方向不唯一，但仍可从特征空间中选择标准正交基。";
      } else {
        root.querySelector("[data-sp-title]").textContent = ["Qᵀ 只换坐标，不改变长度", "Λ 沿两个正交方向分别缩放", "Q 把主轴送回 q₁、q₂"][state.step];
        root.querySelector("[data-sp-copy]").textContent = `当前 λ₁=${fmt(p.l1, 2)}，λ₂=${fmt(p.l2, 2)}；三步合成就是 A=QΛQᵀ。`;
      }
      repaint();
    }

    const [presetButtons, cleanPresets] = bindButtons(root, "[data-sp-preset]", (button) => { state.preset = button.dataset.spPreset; state.step = 0; activate(presetButtons, state.preset, "spPreset"); activate(stepButtons, state.step, "spStep"); update(); });
    const [stepButtons, cleanSteps] = bindButtons(root, "[data-sp-step]", (button) => { if (button.disabled) return; state.step = Number(button.dataset.spStep); activate(stepButtons, state.step, "spStep"); update(); });
    activate(presetButtons, state.preset, "spPreset");
    activate(stepButtons, state.step, "spStep");
    update();
    return [...cleanCanvases, cleanPresets, cleanSteps];
  }

  window.defineChapter9Renderer?.("orthogonal-subspaces", { formal: renderFormal, interactive: projectionLab });
  window.defineChapter9Renderer?.("symmetric-canonical-form", { formal: renderFormal, interactive: spectralLab });
})();
