(() => {
  const sectionId = "orthonormal-bases";

  function foundation(api) {
    const i = api.inline;
    const d = api.display;
    return `
      ${api.foundationIntro(
        "坐标为什么会突然变简单",
        "标准正交基把“解方程”变成“做内积”",
        `一般基也能表示向量，但坐标通常要联立求解。若基向量两两正交且长度为 1，坐标就直接是 ${i("\\langle x,e_i\\rangle")}。`,
      )}
      <div class="ch9v2-foundation">
        ${api.module(
          "01",
          "先分清正交与标准正交",
          "方向互相垂直还不够，长度还要统一为 1。",
          `<div class="ch9v2-basis-compare">
            <article><div class="ch9v2-mini-axis is-orthogonal"><i></i><b></b></div><strong>正交组</strong><p>${i("\\langle u_i,u_j\\rangle=0")}，但长度可以不同。</p></article>
            <article><div class="ch9v2-mini-axis is-normal"><i></i><b></b></div><strong>标准正交组</strong><p>${i("\\langle e_i,e_j\\rangle=\\delta_{ij}")}，方向分开且长度统一。</p></article>
          </div>`,
          "is-compact",
        )}
        ${api.module(
          "02",
          "坐标就是沿各方向的投影系数",
          "不再解线性方程，每个坐标都能直接读出。",
          `<div class="ch9v2-coordinate-story">
            <div class="ch9v2-coordinate-vector">${d("x=\\sum_{i=1}^{n}\\langle x,e_i\\rangle e_i")}</div>
            <div class="ch9v2-coordinate-arrow">→</div>
            <div class="ch9v2-coordinate-column">${d("[x]_{\\mathcal E}=\\begin{bmatrix}\\langle x,e_1\\rangle\\\\\\vdots\\\\\\langle x,e_n\\rangle\\end{bmatrix}")}</div>
          </div>
          <div class="ch9v2-theorem-band is-secondary">${d("\\lVert x\\rVert^2=\\sum_i|\\langle x,e_i\\rangle|^2")}<p>这就是 Parseval 等式：几何长度平方等于标准正交坐标的平方和。</p></div>`,
        )}
        ${api.module(
          "03",
          "Gram–Schmidt 只重复一个动作",
          "每次都把新向量在旧方向上的部分减掉。",
          `<div class="ch9v2-algorithm-track">
            <div><span>1</span><strong>保留第一方向</strong>${i("u_1=v_1")}</div>
            <i>→</i>
            <div><span>2</span><strong>减去投影</strong>${i("u_2=v_2-\\operatorname{proj}_{u_1}v_2")}</div>
            <i>→</i>
            <div><span>3</span><strong>单位化</strong>${i("e_k=u_k/\\lVert u_k\\rVert")}</div>
          </div>`,
        )}
        ${api.module(
          "04",
          "算法为什么不会改变张成空间",
          "减掉的投影本来就在旧方向里，剩余向量与旧向量仍能还原原输入。",
          `<div class="ch9v2-proof-split">
            <div>${d("u_2=v_2-c u_1")}</div>
            <div>${d("v_2=u_2+c u_1")}</div>
            <p>两个方向可以互相表示，所以 ${i("\\operatorname{span}(v_1,v_2)=\\operatorname{span}(u_1,u_2)")}。若余量变成 0，说明新向量根本没有带来新方向。</p>
          </div>`,
        )}
      </div>`;
  }

  function interactive(api) {
    return api.labShell({
      kicker: "交互实验 · 每一步都有原因",
      title: "把第二个向量拆成“平行部分 + 垂直部分”",
      intro: "不要一次跳到最终答案。依次保留第一方向、投影、相减、单位化，观察每一步到底改变了什么，又保留了什么。",
      steps: ["保留 v₁", "投影 v₂", "减去投影", "单位化"],
      body: `
        <div class="ch9v2-workbench ch9v2-gs-lab">
          <figure class="ch9v2-stage-card">
            <div class="ch9v2-stage-toolbar">
              <div><span data-gs-stage-kicker>第 1 步</span><strong data-gs-stage-title>先确定第一条方向</strong></div>
              <div class="ch9v2-legend"><span><i class="is-blue"></i>第一方向</span><span><i class="is-coral"></i>原第二向量</span><span><i class="is-accent"></i>正交余量</span></div>
            </div>
            <canvas data-gs-v2-canvas aria-label="Gram–Schmidt 正交化的四个步骤"></canvas>
            <figcaption data-gs-caption>v₁ 决定第一条方向；先把它单位化得到 e₁。</figcaption>
          </figure>
          <aside class="ch9v2-panel">
            <div class="ch9v2-step-buttons is-four" role="group" aria-label="Gram–Schmidt 步骤">
              <button type="button" class="is-active" data-gs-step="0"><span>01</span><strong>保留 v₁</strong><small>确定 e₁</small></button>
              <button type="button" data-gs-step="1"><span>02</span><strong>投影 v₂</strong><small>找平行部分</small></button>
              <button type="button" data-gs-step="2"><span>03</span><strong>做减法</strong><small>留下垂直余量</small></button>
              <button type="button" data-gs-step="3"><span>04</span><strong>单位化</strong><small>得到 e₂</small></button>
            </div>
            <div class="ch9v2-control-block">
              <div class="ch9v2-control-heading"><strong>输入状态</strong><small>先看清成功与失败的差别</small></div>
              <div class="ch9v2-chip-row">
                <button type="button" data-gs-preset="general">一般位置</button>
                <button type="button" data-gs-preset="near">接近相关</button>
                <button type="button" data-gs-preset="dependent">线性相关</button>
                <button type="button" data-gs-swap>交换顺序</button>
              </div>
              ${api.range("v2x", "v₂ 的横坐标", -3, 3, 0.1, 2)}
              ${api.range("v2y", "v₂ 的纵坐标", -3, 3, 0.1, 2.5)}
            </div>
            <div class="ch9v2-formula-story" data-gs-formula></div>
            <div class="ch9v2-metric-grid">
              ${api.metric("投影系数", "coefficient")}
              ${api.metric("余量长度", "residual")}
              ${api.metric("⟨e₁,e₂⟩", "orthogonality")}
              ${api.metric("原平行四边形面积", "area")}
            </div>
            <div class="ch9v2-observation" data-gs-observation aria-live="polite"></div>
          </aside>
        </div>`,
    });
  }

  function calculate(api, v1, v2) {
    const n1 = api.norm(v1);
    if (n1 < 1e-8) return { valid: false, reason: "第一向量为零，无法确定第一条基方向。" };
    const e1 = api.scale(1 / n1, v1);
    const coefficient = api.dot(v2, e1);
    const projection = api.scale(coefficient, e1);
    const u2 = api.sub(v2, projection);
    const residual = api.norm(u2);
    if (residual < 1e-7) return { valid: false, e1, coefficient, projection, u2, residual, reason: "余量为 0：v₂ 已经完全落在第一方向上，没有带来新方向。" };
    const e2 = api.scale(1 / residual, u2);
    return { valid: true, e1, coefficient, projection, u2, residual, e2 };
  }

  function mount(root, api) {
    const canvas = root.querySelector("[data-gs-v2-canvas]");
    const state = { step: 0, v1: [2.6, 0.8], v2: [2, 2.5] };
    const stepButtons = [...root.querySelectorAll("[data-gs-step]")];
    const presetButtons = [...root.querySelectorAll("[data-gs-preset]")];

    function sync() {
      const xInput = root.querySelector('[data-v2-range="v2x"]');
      const yInput = root.querySelector('[data-v2-range="v2y"]');
      if (xInput) xInput.value = String(state.v2[0]);
      if (yInput) yInput.value = String(state.v2[1]);
      api.update(root, "v2x", api.format(state.v2[0], 1));
      api.update(root, "v2y", api.format(state.v2[1], 1));
      api.setPressed(stepButtons, (button) => Number(button.dataset.gsStep) === state.step);
      root.querySelectorAll("[data-v2-path-step]").forEach((item, index) => item.classList.toggle("is-active", index <= state.step));
    }

    function draw() {
      sync();
      const data = calculate(api, state.v1, state.v2);
      const p = api.palette();
      const system = api.plane(canvas, 4.3, 16);
      api.drawGrid(system);
      const v1End = system.toScreen(state.v1);
      const v2End = system.toScreen(state.v2);
      api.drawArrow(system.ctx, system.origin, v1End, p.blue, "v₁", { width: 4 });
      api.drawArrow(system.ctx, system.origin, v2End, p.coral, "v₂", { width: 3.5, alpha: state.step === 0 ? 1 : 0.45 });

      if (data.e1) {
        const e1End = system.toScreen(data.e1);
        if (state.step === 0 || state.step === 3) api.drawArrow(system.ctx, system.origin, e1End, p.blue, "e₁", { width: 5, labelDy: 18 });
      }
      if (state.step >= 1 && data.projection) {
        const projectionEnd = system.toScreen(data.projection);
        api.drawArrow(system.ctx, system.origin, projectionEnd, p.muted, "proj", { width: 3, dash: [6, 5], labelDy: 20 });
        system.ctx.save();
        system.ctx.strokeStyle = p.faint;
        system.ctx.setLineDash([6, 6]);
        system.ctx.lineWidth = 2;
        system.ctx.beginPath();
        system.ctx.moveTo(projectionEnd.x, projectionEnd.y);
        system.ctx.lineTo(v2End.x, v2End.y);
        system.ctx.stroke();
        system.ctx.restore();
      }
      if (state.step >= 2 && data.u2) {
        const projectionEnd = system.toScreen(data.projection);
        api.drawArrow(system.ctx, projectionEnd, v2End, p.accentStrong, "u₂", { width: 4 });
        api.drawArrow(system.ctx, system.origin, system.toScreen(data.u2), p.accent, "u₂", { width: 3.6, alpha: 0.7, labelDy: 18 });
      }
      if (state.step === 3 && data.valid) {
        api.drawArrow(system.ctx, system.origin, system.toScreen(data.e2), p.accentStrong, "e₂", { width: 5, labelDy: 18 });
        system.ctx.save();
        system.ctx.strokeStyle = p.accent;
        system.ctx.lineWidth = 2;
        const a = system.toScreen(api.scale(-4, data.e1));
        const b = system.toScreen(api.scale(4, data.e1));
        const c = system.toScreen(api.scale(-4, data.e2));
        const d = system.toScreen(api.scale(4, data.e2));
        system.ctx.globalAlpha = 0.16;
        system.ctx.beginPath(); system.ctx.moveTo(a.x, a.y); system.ctx.lineTo(b.x, b.y); system.ctx.stroke();
        system.ctx.beginPath(); system.ctx.moveTo(c.x, c.y); system.ctx.lineTo(d.x, d.y); system.ctx.stroke();
        system.ctx.restore();
      }

      const area = Math.abs(state.v1[0] * state.v2[1] - state.v1[1] * state.v2[0]);
      api.update(root, "coefficient", data.e1 ? api.format(data.coefficient, 3) : "—");
      api.update(root, "residual", data.u2 ? api.format(api.norm(data.u2), 3) : "—");
      api.update(root, "orthogonality", data.valid ? api.format(api.dot(data.e1, data.e2), 5) : "—");
      api.update(root, "area", api.format(area, 3));

      const formula = root.querySelector("[data-gs-formula]");
      const observation = root.querySelector("[data-gs-observation]");
      observation.classList.toggle("is-warning", !data.valid);
      if (state.step === 0) {
        formula.innerHTML = `<span>第一方向只需单位化</span>${api.display("e_1=\\frac{v_1}{\\lVert v_1\\rVert}")}`;
        api.setText(root, "[data-gs-stage-kicker]", "第 1 步");
        api.setText(root, "[data-gs-stage-title]", "先确定第一条方向");
        api.setText(root, "[data-gs-caption]", "v₁ 决定第一条方向；把长度调整为 1 得到 e₁。");
      } else if (state.step === 1) {
        formula.innerHTML = `<span>先找 v₂ 在 e₁ 上的平行部分</span>${api.display(`\\operatorname{proj}_{e_1}v_2=\\langle v_2,e_1\\rangle e_1=${api.format(data.coefficient, 3)}e_1`)}`;
        api.setText(root, "[data-gs-stage-kicker]", "第 2 步");
        api.setText(root, "[data-gs-stage-title]", "把重复的第一方向标出来");
        api.setText(root, "[data-gs-caption]", "灰色虚线箭头是 v₂ 中已经被 e₁ 表达的部分。");
      } else if (state.step === 2) {
        formula.innerHTML = `<span>从 v₂ 中减掉重复方向</span>${api.display("u_2=v_2-\\operatorname{proj}_{e_1}v_2")}`;
        api.setText(root, "[data-gs-stage-kicker]", "第 3 步");
        api.setText(root, "[data-gs-stage-title]", "留下与 e₁ 垂直的新信息");
        api.setText(root, "[data-gs-caption]", "青色余量 u₂ 与第一方向垂直；它为 0 时算法在此停止。");
      } else {
        formula.innerHTML = data.valid
          ? `<span>最后只调整长度，不改变方向</span>${api.display("e_2=\\frac{u_2}{\\lVert u_2\\rVert},\\qquad\\langle e_1,e_2\\rangle=0")}`
          : `<span>单位化被关闭</span>${api.display("u_2=0\\quad\\Rightarrow\\quad e_2\\text{ 不存在}")}`;
        api.setText(root, "[data-gs-stage-kicker]", "第 4 步");
        api.setText(root, "[data-gs-stage-title]", data.valid ? "得到标准正交基" : "余量为零，不能继续单位化");
        api.setText(root, "[data-gs-caption]", data.valid ? "e₁、e₂ 长度都是 1 且互相垂直；原向量组与新基张成同一空间。" : "线性相关不是程序故障，而是输入没有提供第二个独立方向。");
      }

      if (!data.valid) observation.innerHTML = `<strong>算法边界</strong><p>${data.reason}</p>`;
      else if (data.residual < 0.2) observation.innerHTML = `<strong>接近线性相关</strong><p>余量很短，说明 v₂ 带来的新方向很少；数值计算中这会放大误差。</p>`;
      else observation.innerHTML = `<strong>正交化通过</strong><p>减投影改变了坐标骨架，但没有改变张成空间；最终内积接近 0。</p>`;
    }

    const presets = {
      general: [[2.6, 0.8], [2, 2.5]],
      near: [[2.8, 1], [2.7, 1.08]],
      dependent: [[2.4, 1.2], [1.6, 0.8]],
    };
    stepButtons.forEach((button) => api.on(button, "click", () => {
      state.step = Number(button.dataset.gsStep);
      draw();
    }));
    presetButtons.forEach((button) => api.on(button, "click", () => {
      const [v1, v2] = presets[button.dataset.gsPreset];
      state.v1 = [...v1];
      state.v2 = [...v2];
      state.step = 0;
      api.setPressed(presetButtons, (item) => item === button);
      draw();
    }));
    api.on(root.querySelector("[data-gs-swap]"), "click", () => {
      [state.v1, state.v2] = [state.v2, state.v1];
      state.step = 0;
      api.setPressed(presetButtons, () => false);
      draw();
    });
    api.bindRange(root, "v2x", (value) => {
      state.v2[0] = value;
      api.setPressed(presetButtons, () => false);
      draw();
    });
    api.bindRange(root, "v2y", (value) => {
      state.v2[1] = value;
      api.setPressed(presetButtons, () => false);
      draw();
    });
    api.installRedraw(draw, [canvas]);
  }

  window.Chapter9V2.register(sectionId, { foundation, interactive, mount });
})();
