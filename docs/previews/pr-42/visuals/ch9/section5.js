(() => {
  const sectionId = "orthogonal-subspaces";

  function foundation(api) {
    const i = api.inline;
    const d = api.display;
    return `
      ${api.foundationIntro(
        "子空间不只会相加",
        "正交补给出最自然的互补方向",
        `给定子空间 W，${i("W^\\perp")} 收集所有与 W 中每个向量都正交的方向。有限维欧几里得空间中，每个向量都能唯一拆成 W 内部分与 W 的正交余量。`,
      )}
      <div class="ch9v2-foundation">
        ${api.module(
          "01",
          "正交补不是“随便找一条垂线”",
          "它要求与整个子空间中的所有向量都正交。",
          `<div class="ch9v2-definition-focus">
            ${d("W^\\perp=\\{x\\in V:\\langle x,w\\rangle=0,\\ \\forall w\\in W\\}")}
            <div><span>${i("W\\cap W^\\perp=\\{0\\}")}</span><span>${i("\\dim W+\\dim W^\\perp=\\dim V")}</span></div>
          </div>`,
        )}
        ${api.module(
          "02",
          "每个向量只有一种正交拆法",
          "一个分量留在 W 中，另一个分量垂直离开 W。",
          `<div class="ch9v2-decomposition-card">
            <div class="ch9v2-decomposition-visual"><i class="is-x"></i><i class="is-p"></i><i class="is-e"></i></div>
            <div>${d("x=p+e,\\qquad p\\in W,\\ e\\in W^\\perp")}<p>记 ${i("p=P_Wx")}。这不是一幅示意图，而是由“属于 W”和“残差正交”两条条件唯一确定。</p></div>
          </div>`,
        )}
        ${api.module(
          "03",
          "标准正交基让投影直接相加",
          "每个基方向取一次投影系数，再把分量加回去。",
          `<div class="ch9v2-theorem-band">${d("P_Wx=\\sum_{i=1}^{k}\\langle x,e_i\\rangle e_i")}
          <p>若 Q 的列是 W 的标准正交基，则 ${i("P_W=QQ^T")}，并满足 ${i("P_W^2=P_W")}、${i("P_W^T=P_W")}。</p></div>`,
        )}
        ${api.module(
          "04",
          "为什么投影点一定最近",
          "任意其他候选点都会额外多出一段位于 W 内的距离。",
          `<div class="ch9v2-pythagoras-proof">
            ${d("x-w=(x-p)+(p-w)")}
            <span>${i("x-p\\perp p-w")}</span>
            ${d("\\lVert x-w\\rVert^2=\\lVert x-p\\rVert^2+\\lVert p-w\\rVert^2")}
            <p>第二项只有在 ${i("w=p")} 时为 0，因此 p 是 W 中唯一最近点。</p>
          </div>`,
        )}
      </div>`;
  }

  function interactive(api) {
    return api.labShell({
      kicker: "交互实验 · 最近点不是凭眼睛猜",
      title: "先做正交分解，再让所有候选点来挑战投影点",
      intro: "左图显示 x=p+e；右图把 W 上每个候选点的距离平方画成一条碗形曲线。垂足 p 与曲线最低点必须落在同一个参数位置。",
      steps: ["落下垂线", "移动候选点", "核对最小值"],
      body: `
        <div class="ch9v2-workbench ch9v2-projection-lab">
          <figure class="ch9v2-stage-card">
            <div class="ch9v2-stage-toolbar">
              <div><span data-proj-stage-kicker>分解图</span><strong data-proj-stage-title>x 被拆成 W 内分量与正交余量</strong></div>
              <div class="ch9v2-legend"><span><i class="is-blue"></i>x</span><span><i class="is-accent"></i>p=P_Wx</span><span><i class="is-coral"></i>e=x−p</span><span><i class="is-gray"></i>候选点 w</span></div>
            </div>
            <div class="ch9v2-projection-stage">
              <div><strong>几何分解</strong><canvas data-proj-main tabindex="0" aria-label="向量到直线子空间的正交投影、残差与候选点"></canvas></div>
              <div><strong>距离平方随候选点变化</strong><canvas data-proj-bowl aria-label="候选点参数与距离平方的抛物线"></canvas></div>
            </div>
            <figcaption data-proj-caption>拖动左图中的 x；青色投影点和右图最低点会同步移动。</figcaption>
          </figure>
          <aside class="ch9v2-panel">
            <div class="ch9v2-step-tabs" role="group" aria-label="投影实验步骤">
              <button type="button" class="is-active" data-proj-step="0">01 分解</button>
              <button type="button" data-proj-step="1">02 比距离</button>
              <button type="button" data-proj-step="2">03 看定理</button>
            </div>
            <div class="ch9v2-control-block">
              <div class="ch9v2-control-heading"><strong>子空间与候选点</strong><small>W 是过原点的一维子空间</small></div>
              <div class="ch9v2-chip-row">
                <button type="button" data-proj-preset="horizontal">水平 W</button>
                <button type="button" data-proj-preset="diagonal">斜线 W</button>
                <button type="button" data-proj-preset="perpendicular">x∈W⊥</button>
                <button type="button" data-proj-best>把 w 移到 p</button>
              </div>
              ${api.range("angle", "W 的方向", -90, 90, 1, 25, "°")}
              ${api.range("candidate", "候选参数 t", -4, 4, 0.05, 0.5)}
            </div>
            <div class="ch9v2-formula-story" data-proj-formula></div>
            <div class="ch9v2-metric-grid">
              ${api.metric("⟨e,u⟩", "orthogonality")}
              ${api.metric("最短距离 ‖e‖", "bestDistance")}
              ${api.metric("当前距离 ‖x−w‖", "candidateDistance")}
              ${api.metric("多出的距离平方", "extraSquare")}
            </div>
            <div class="ch9v2-observation" data-proj-observation aria-live="polite"></div>
          </aside>
        </div>`,
    });
  }

  function mount(root, api) {
    const main = root.querySelector("[data-proj-main]");
    const bowl = root.querySelector("[data-proj-bowl]");
    const state = { step: 0, angle: 25, candidate: 0.5, x: [2.5, 2.65] };
    const stepButtons = [...root.querySelectorAll("[data-proj-step]")];
    const presetButtons = [...root.querySelectorAll("[data-proj-preset]")];
    let dragging = false;

    function geometry() {
      const u = [Math.cos(api.radians(state.angle)), Math.sin(api.radians(state.angle))];
      const coefficient = api.dot(state.x, u);
      const p = api.scale(coefficient, u);
      const e = api.sub(state.x, p);
      const w = api.scale(state.candidate, u);
      return { u, coefficient, p, e, w };
    }

    function drawMain(data) {
      const system = api.plane(main, 4.3, 14);
      api.drawGrid(system);
      const colors = api.palette();
      const a = system.toScreen(api.scale(-5, data.u));
      const b = system.toScreen(api.scale(5, data.u));
      system.ctx.save();
      system.ctx.strokeStyle = colors.accent;
      system.ctx.lineWidth = 3;
      system.ctx.globalAlpha = 0.55;
      system.ctx.beginPath(); system.ctx.moveTo(a.x, a.y); system.ctx.lineTo(b.x, b.y); system.ctx.stroke();
      system.ctx.restore();
      const xEnd = system.toScreen(state.x);
      const pEnd = system.toScreen(data.p);
      const wEnd = system.toScreen(data.w);
      api.drawArrow(system.ctx, system.origin, xEnd, colors.blue, "x", { width: 4.5 });
      api.drawArrow(system.ctx, system.origin, pEnd, colors.accentStrong, "p", { width: 4.5, labelDy: 18 });
      api.drawArrow(system.ctx, pEnd, xEnd, colors.coral, "e", { width: 4 });
      api.drawPoint(system.ctx, wEnd, colors.muted, 6);
      system.ctx.save();
      system.ctx.strokeStyle = colors.muted;
      system.ctx.lineWidth = 2;
      system.ctx.setLineDash([6, 6]);
      system.ctx.globalAlpha = state.step >= 1 ? 0.8 : 0.28;
      system.ctx.beginPath(); system.ctx.moveTo(wEnd.x, wEnd.y); system.ctx.lineTo(xEnd.x, xEnd.y); system.ctx.stroke();
      system.ctx.restore();
      if (state.step >= 2) {
        const marker = 12;
        system.ctx.save();
        system.ctx.strokeStyle = colors.coral;
        system.ctx.lineWidth = 2;
        system.ctx.beginPath();
        system.ctx.moveTo(pEnd.x, pEnd.y);
        system.ctx.lineTo(pEnd.x - data.u[1] * marker, pEnd.y - data.u[0] * marker);
        system.ctx.lineTo(pEnd.x - data.u[1] * marker + data.u[0] * marker, pEnd.y - data.u[0] * marker - data.u[1] * marker);
        system.ctx.stroke();
        system.ctx.restore();
      }
    }

    function drawBowl(data) {
      const { ctx, width, height } = api.fitCanvas(bowl);
      const colors = api.palette();
      const pad = { left: 38, right: 18, top: 30, bottom: 34 };
      const xMin = -4;
      const xMax = 4;
      const bestSquare = api.dot(data.e, data.e);
      const maxY = bestSquare + 18;
      const sx = (value) => pad.left + ((value - xMin) / (xMax - xMin)) * (width - pad.left - pad.right);
      const sy = (value) => height - pad.bottom - (value / maxY) * (height - pad.top - pad.bottom);
      ctx.save();
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 1;
      for (let value = -4; value <= 4; value += 2) {
        ctx.globalAlpha = 0.18;
        ctx.beginPath(); ctx.moveTo(sx(value), pad.top); ctx.lineTo(sx(value), height - pad.bottom); ctx.stroke();
      }
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = colors.muted;
      ctx.beginPath(); ctx.moveTo(pad.left, height - pad.bottom); ctx.lineTo(width - pad.right, height - pad.bottom); ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let index = 0; index <= 160; index += 1) {
        const t = xMin + (index / 160) * (xMax - xMin);
        const value = bestSquare + (t - data.coefficient) ** 2;
        const point = { x: sx(t), y: sy(value) };
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
      ctx.restore();
      const bestPoint = { x: sx(data.coefficient), y: sy(bestSquare) };
      const currentSquare = bestSquare + (state.candidate - data.coefficient) ** 2;
      const currentPoint = { x: sx(state.candidate), y: sy(currentSquare) };
      api.drawPoint(ctx, bestPoint, colors.accentStrong, 6);
      api.drawPoint(ctx, currentPoint, colors.muted, 6);
      ctx.save();
      ctx.fillStyle = colors.text;
      ctx.font = "650 12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("p", bestPoint.x + 8, bestPoint.y - 7);
      ctx.fillText("w", currentPoint.x + 8, currentPoint.y - 7);
      ctx.restore();
    }

    function draw() {
      const data = geometry();
      api.setPressed(stepButtons, (button) => Number(button.dataset.projStep) === state.step);
      root.querySelectorAll("[data-v2-path-step]").forEach((item, index) => item.classList.toggle("is-active", index <= state.step));
      root.querySelector('[data-v2-range="angle"]').value = String(state.angle);
      root.querySelector('[data-v2-range="candidate"]').value = String(state.candidate);
      api.update(root, "angle", `${api.format(state.angle, 0)}°`);
      api.update(root, "candidate", api.format(state.candidate, 2));
      const bestDistance = api.norm(data.e);
      const candidateDistance = api.norm(api.sub(state.x, data.w));
      const extraSquare = (state.candidate - data.coefficient) ** 2;
      api.update(root, "orthogonality", api.format(api.dot(data.e, data.u), 5));
      api.update(root, "bestDistance", api.format(bestDistance, 3));
      api.update(root, "candidateDistance", api.format(candidateDistance, 3));
      api.update(root, "extraSquare", api.format(extraSquare, 4));
      drawMain(data);
      drawBowl(data);

      const formula = root.querySelector("[data-proj-formula]");
      if (state.step === 0) {
        formula.innerHTML = `<span>先满足投影的两条刻画条件</span>${api.display("p\\in W,\\qquad e=x-p\\in W^\\perp")}`;
        api.setText(root, "[data-proj-stage-kicker]", "分解图");
        api.setText(root, "[data-proj-stage-title]", "x 被拆成 W 内分量与正交余量");
        api.setText(root, "[data-proj-caption]", "拖动左图中的 x；青色投影点和右图最低点会同步移动。");
      } else if (state.step === 1) {
        formula.innerHTML = `<span>让任意候选点 w 与投影点 p 比距离</span>${api.display(`\\lVert x-w\\rVert=${api.format(candidateDistance, 3)},\\qquad\\lVert x-p\\rVert=${api.format(bestDistance, 3)}`)}`;
        api.setText(root, "[data-proj-stage-kicker]", "距离比较");
        api.setText(root, "[data-proj-stage-title]", "移动 w，看右侧灰点沿碗形曲线移动");
        api.setText(root, "[data-proj-caption]", "只有 w 与 p 重合时，右图灰点才能落到最低点。");
      } else {
        formula.innerHTML = `<span>正交让距离平方自动分账</span>${api.display("\\lVert x-w\\rVert^2=\\lVert x-p\\rVert^2+\\lVert p-w\\rVert^2")}`;
        api.setText(root, "[data-proj-stage-kicker]", "Pythagoras 证书");
        api.setText(root, "[data-proj-stage-title]", "多出的距离平方就是 ‖p−w‖²");
        api.setText(root, "[data-proj-caption]", `当前额外项为 ${api.format(extraSquare, 4)}，它永远不可能为负。`);
      }

      const observation = root.querySelector("[data-proj-observation]");
      const atBest = Math.abs(state.candidate - data.coefficient) < 0.025;
      observation.classList.toggle("is-warning", !atBest);
      if (atBest) observation.innerHTML = `<strong>最近点命中</strong><p>w=p，额外距离平方为 0；左图的垂足与右图的最低点完全对应。</p>`;
      else observation.innerHTML = `<strong>候选点还不是最近点</strong><p>把 w 沿 W 移到 p，当前距离还可以继续减少；多出的平方项为 ${api.format(extraSquare, 3)}。</p>`;
    }

    stepButtons.forEach((button) => api.on(button, "click", () => {
      state.step = Number(button.dataset.projStep);
      draw();
    }));
    const presets = {
      horizontal: { angle: 0, x: [2.3, 2.4], candidate: 0.6 },
      diagonal: { angle: 42, x: [2.8, 1.2], candidate: 0.4 },
      perpendicular: { angle: 20, x: [-1.1, 3.02], candidate: 1 },
    };
    presetButtons.forEach((button) => api.on(button, "click", () => {
      const preset = presets[button.dataset.projPreset];
      Object.assign(state, { angle: preset.angle, x: [...preset.x], candidate: preset.candidate, step: 0 });
      api.setPressed(presetButtons, (item) => item === button);
      draw();
    }));
    api.on(root.querySelector("[data-proj-best]"), "click", () => {
      state.candidate = geometry().coefficient;
      state.step = 2;
      draw();
    });
    api.bindRange(root, "angle", (value) => {
      state.angle = value;
      api.setPressed(presetButtons, () => false);
      draw();
    });
    api.bindRange(root, "candidate", (value) => {
      state.candidate = value;
      draw();
    });
    api.on(main, "pointerdown", (event) => {
      dragging = true;
      main.setPointerCapture(event.pointerId);
    });
    api.on(main, "pointermove", (event) => {
      if (!dragging) return;
      const system = api.plane(main, 4.3, 14);
      state.x = system.toWorld(api.pointer(event, main)).map((value) => api.clamp(value, -3.8, 3.8));
      api.setPressed(presetButtons, () => false);
      draw();
    });
    api.on(main, "pointerup", (event) => {
      dragging = false;
      if (main.hasPointerCapture(event.pointerId)) main.releasePointerCapture(event.pointerId);
    });
    api.installRedraw(draw, [main, bowl]);
  }

  window.Chapter9V2.register(sectionId, { foundation, interactive, mount });
})();
