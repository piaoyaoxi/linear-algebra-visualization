(() => {
  const sectionId = "inner-product-geometry";

  function foundation(api) {
    const i = api.inline;
    const d = api.display;
    return `
      ${api.foundationIntro(
        "先建立几何语言",
        "一个内积，长出四种测量",
        `线性空间只告诉我们怎样相加与数乘。指定 ${i("\\langle x,y\\rangle")} 后，长度、夹角、正交和距离才有了共同的来源。不要把它们当成四套孤立公式。`,
      )}
      <div class="ch9v2-foundation">
        ${api.module(
          "01",
          "先认清依赖关系",
          "所有几何量都从内积向外生长。",
          `<div class="ch9v2-source-map">
            <div class="ch9v2-source-core">${i("\\langle x,y\\rangle")}</div>
            <div class="ch9v2-source-branch"><span>长度</span>${i("\\lVert x\\rVert=\\sqrt{\\langle x,x\\rangle}")}</div>
            <div class="ch9v2-source-branch"><span>夹角</span>${i("\\cos\\theta=\\frac{\\langle x,y\\rangle}{\\lVert x\\rVert\\lVert y\\rVert}")}</div>
            <div class="ch9v2-source-branch"><span>正交</span>${i("x\\perp y\\iff\\langle x,y\\rangle=0")}</div>
            <div class="ch9v2-source-branch"><span>距离</span>${i("d(x,y)=\\lVert x-y\\rVert")}</div>
          </div>`,
          "is-map",
        )}
        ${api.module(
          "02",
          "同一个内积的三种读法",
          "坐标计算、夹角判断与投影长度说的是同一件事。",
          `<div class="ch9v2-three-readings">
            <article><span>坐标读法</span>${d("\\langle x,y\\rangle=x_1y_1+x_2y_2")}<p>逐坐标配对相乘再相加。</p></article>
            <article><span>夹角读法</span>${d("\\langle x,y\\rangle=\\lVert x\\rVert\\lVert y\\rVert\\cos\\theta")}<p>正、零、负分别对应锐角、直角、钝角。</p></article>
            <article><span>投影读法</span>${d("\\langle x,y\\rangle=\\lVert x\\rVert\\cdot\\operatorname{comp}_x(y)")}<p>等于 x 的长度乘以 y 在 x 方向上的有向影子。</p></article>
          </div>`,
        )}
        ${api.module(
          "03",
          "边界比一般状态更重要",
          "公式在零向量、正交和线性相关处会发生什么？",
          `<div class="ch9v2-boundary-strip">
            <div><strong>锐角</strong><span>内积为正</span></div>
            <div><strong>正交</strong><span>内积为 0</span></div>
            <div><strong>钝角</strong><span>内积为负</span></div>
            <div><strong>线性相关</strong><span>Cauchy–Schwarz 取等号</span></div>
            <div><strong>零向量</strong><span>正交成立，夹角不定义</span></div>
          </div>`,
          "is-compact",
        )}
        ${api.module(
          "04",
          "为什么夹角公式一定合法",
          "Cauchy–Schwarz 把内积限制在两长度乘积之间。",
          `<div class="ch9v2-theorem-band">
            ${d("|\\langle x,y\\rangle|\\le\\lVert x\\rVert\\,\\lVert y\\rVert")}
            <p>因此 ${i("-1\\le\\cos\\theta\\le1")}。等号只在线性相关时出现；这正是实验最后一格的边界状态。</p>
          </div>`,
        )}
      </div>`;
  }

  function interactive(api) {
    return api.labShell({
      kicker: "交互实验 · 内积不是一串数字",
      title: "沿着“夹角 → 投影 → 乘积”读懂内积",
      intro: "先只看两个方向，再落下垂线找到有向投影，最后把投影长度与 x 的长度相乘。每一步只增加一个新信息。",
      steps: ["看夹角", "看有向投影", "得到内积"],
      body: `
        <div class="ch9v2-workbench ch9v2-inner-lab">
          <figure class="ch9v2-stage-card">
            <div class="ch9v2-stage-toolbar">
              <div><span data-ip-stage-kicker>第 1 步</span><strong data-ip-stage-title>先判断两个方向的关系</strong></div>
              <div class="ch9v2-legend"><span><i class="is-blue"></i>x</span><span><i class="is-coral"></i>y</span><span><i class="is-accent"></i>y 在 x 上的影子</span></div>
            </div>
            <canvas data-ip-v2-canvas tabindex="0" aria-label="向量 x、向量 y 与 y 在 x 方向上的有向投影"></canvas>
            <figcaption data-ip-caption>拖动 y 的箭头端点，先观察夹角从锐角经过直角变为钝角。</figcaption>
          </figure>
          <aside class="ch9v2-panel">
            <div class="ch9v2-step-buttons" role="group" aria-label="内积实验步骤">
              <button type="button" class="is-active" data-ip-step="0"><span>01</span><strong>看夹角</strong><small>只判断方向关系</small></button>
              <button type="button" data-ip-step="1"><span>02</span><strong>看投影</strong><small>落下垂线找影子</small></button>
              <button type="button" data-ip-step="2"><span>03</span><strong>算内积</strong><small>长度 × 有向影子</small></button>
            </div>
            <div class="ch9v2-control-block">
              <div class="ch9v2-control-heading"><strong>典型状态</strong><small>先用预设看清边界</small></div>
              <div class="ch9v2-chip-row">
                <button type="button" data-ip-preset="acute">锐角</button>
                <button type="button" data-ip-preset="orthogonal">正交</button>
                <button type="button" data-ip-preset="obtuse">钝角</button>
                <button type="button" data-ip-preset="parallel">同向相关</button>
                <button type="button" data-ip-preset="zero">零向量</button>
              </div>
            </div>
            <div class="ch9v2-control-block">
              <div class="ch9v2-control-heading"><strong>连续调节</strong><small>也可以直接拖动画布中的 y</small></div>
              ${api.range("angle", "y 的方向", -180, 180, 1, 62, "°")}
              ${api.range("yLength", "y 的长度", 0, 3.6, 0.1, 2.4)}
              ${api.range("xLength", "x 的长度", 0.6, 3.6, 0.1, 2.8)}
            </div>
            <div class="ch9v2-formula-story" data-ip-formula></div>
            <div class="ch9v2-metric-grid">
              ${api.metric("夹角 θ", "theta")}
              ${api.metric("有向投影", "shadow")}
              ${api.metric("内积", "dot")}
              ${api.metric("等号比率", "ratio")}
            </div>
            <div class="ch9v2-observation" data-ip-observation aria-live="polite"></div>
          </aside>
        </div>`,
    });
  }

  function mount(root, api) {
    const canvas = root.querySelector("[data-ip-v2-canvas]");
    const state = { step: 0, angle: 62, yLength: 2.4, xLength: 2.8 };
    const stepButtons = [...root.querySelectorAll("[data-ip-step]")];
    const presetButtons = [...root.querySelectorAll("[data-ip-preset]")];
    let dragging = false;

    const vectorY = () => [state.yLength * Math.cos(api.radians(state.angle)), state.yLength * Math.sin(api.radians(state.angle))];

    function syncControls() {
      for (const name of ["angle", "yLength", "xLength"]) {
        const input = root.querySelector(`[data-v2-range="${name}"]`);
        if (input) input.value = String(state[name]);
      }
      api.update(root, "angle", `${api.format(state.angle, 0)}°`);
      api.update(root, "yLength", api.format(state.yLength, 1));
      api.update(root, "xLength", api.format(state.xLength, 1));
      api.setPressed(stepButtons, (button) => Number(button.dataset.ipStep) === state.step);
      root.querySelectorAll("[data-v2-path-step]").forEach((item, index) => item.classList.toggle("is-active", index <= state.step));
    }

    function draw() {
      syncControls();
      const p = api.palette();
      const system = api.plane(canvas, 4.15, 16);
      api.drawGrid(system);
      const x = [state.xLength, 0];
      const y = vectorY();
      const xEnd = system.toScreen(x);
      const yEnd = system.toScreen(y);
      const shadowScalar = state.yLength * Math.cos(api.radians(state.angle));
      const shadow = [shadowScalar, 0];
      const shadowEnd = system.toScreen(shadow);
      const product = state.xLength * shadowScalar;
      const hasAngle = state.yLength > 1e-8;
      const normalized = hasAngle ? Math.abs(product) / (state.xLength * state.yLength) : NaN;

      api.drawArrow(system.ctx, system.origin, xEnd, p.blue, "x", { width: 4 });
      api.drawArrow(system.ctx, system.origin, yEnd, p.coral, "y", { width: 4 });
      api.drawPoint(system.ctx, yEnd, p.coral, 5.5);

      if (state.step >= 1 && state.yLength > 1e-8) {
        system.ctx.save();
        system.ctx.strokeStyle = p.faint;
        system.ctx.lineWidth = 2;
        system.ctx.setLineDash([6, 6]);
        system.ctx.beginPath();
        system.ctx.moveTo(yEnd.x, yEnd.y);
        system.ctx.lineTo(shadowEnd.x, shadowEnd.y);
        system.ctx.stroke();
        system.ctx.restore();
        api.drawArrow(system.ctx, system.origin, shadowEnd, p.accentStrong, "影子", { width: 5, labelDy: 20 });
        const direction = shadowScalar >= 0 ? 1 : -1;
        const markerSize = 12;
        system.ctx.save();
        system.ctx.strokeStyle = p.faint;
        system.ctx.lineWidth = 2;
        system.ctx.beginPath();
        system.ctx.moveTo(shadowEnd.x, shadowEnd.y);
        system.ctx.lineTo(shadowEnd.x, shadowEnd.y - markerSize);
        system.ctx.lineTo(shadowEnd.x + direction * markerSize, shadowEnd.y - markerSize);
        system.ctx.stroke();
        system.ctx.restore();
      }

      if (hasAngle && state.yLength > 0.15) {
        const start = 0;
        let delta = -api.radians(state.angle);
        while (delta > Math.PI) delta -= Math.PI * 2;
        while (delta < -Math.PI) delta += Math.PI * 2;
        system.ctx.save();
        system.ctx.strokeStyle = p.accent;
        system.ctx.lineWidth = 2.5;
        system.ctx.beginPath();
        system.ctx.arc(system.origin.x, system.origin.y, 42, start, start + delta, delta < 0);
        system.ctx.stroke();
        system.ctx.restore();
      }

      api.update(root, "theta", hasAngle ? `${api.format(Math.abs(((state.angle + 180) % 360) - 180), 0)}°` : "未定义");
      api.update(root, "shadow", state.yLength > 1e-8 ? api.format(shadowScalar, 2) : "0");
      api.update(root, "dot", api.format(product, 2));
      api.update(root, "ratio", hasAngle ? api.format(normalized, 2) : "未定义");

      const formula = root.querySelector("[data-ip-formula]");
      if (state.step === 0) {
        formula.innerHTML = `<span>现在只看方向</span>${api.display("\\cos\\theta\\begin{cases}>0&\\text{锐角}\\\\=0&\\text{直角}\\\\<0&\\text{钝角}\\end{cases}")}`;
        api.setText(root, "[data-ip-stage-kicker]", "第 1 步");
        api.setText(root, "[data-ip-stage-title]", "先判断两个方向的关系");
        api.setText(root, "[data-ip-caption]", "拖动 y 的箭头端点，先观察夹角从锐角经过直角变为钝角。");
      } else if (state.step === 1) {
        formula.innerHTML = `<span>落下垂线，读取有向影子</span>${api.display(`\\operatorname{comp}_x(y)=\\lVert y\\rVert\\cos\\theta=${api.format(shadowScalar, 2)}`)}`;
        api.setText(root, "[data-ip-stage-kicker]", "第 2 步");
        api.setText(root, "[data-ip-stage-title]", "把 y 投到 x 的方向上");
        api.setText(root, "[data-ip-caption]", "青色箭头是 y 在 x 方向上的有向影子；落在原点左侧时数值为负。");
      } else {
        formula.innerHTML = `<span>最后乘上 x 的长度</span>${api.display(`\\langle x,y\\rangle=\\lVert x\\rVert\\operatorname{comp}_x(y)=${api.format(state.xLength, 1)}\\times${api.format(shadowScalar, 2)}=${api.format(product, 2)}`)}`;
        api.setText(root, "[data-ip-stage-kicker]", "第 3 步");
        api.setText(root, "[data-ip-stage-title]", "内积就是长度乘以有向影子");
        api.setText(root, "[data-ip-caption]", "图形、投影读数与公式来自同一组数值；改变夹角时三者同步变化。");
      }

      const observation = root.querySelector("[data-ip-observation]");
      observation.classList.toggle("is-warning", !hasAngle);
      if (!hasAngle) observation.innerHTML = `<strong>零向量边界</strong><p>y 与所有向量正交，但夹角公式的分母为 0，所以夹角必须显示为“未定义”。</p>`;
      else if (Math.abs(product) < 1e-6) observation.innerHTML = `<strong>正交状态</strong><p>有向影子缩成 0，因此内积为 0；这比“图上看起来像 90°”更可靠。</p>`;
      else if (normalized > 0.999) observation.innerHTML = `<strong>Cauchy–Schwarz 取等号</strong><p>两个向量线性相关，y 的全部长度都落在 x 的方向上。</p>`;
      else if (product > 0) observation.innerHTML = `<strong>锐角状态</strong><p>影子落在 x 的正方向，所以内积为正。</p>`;
      else observation.innerHTML = `<strong>钝角状态</strong><p>影子越过原点落在反方向，所以内积为负。</p>`;
    }

    const presets = {
      acute: { angle: 48, yLength: 2.4, xLength: 2.8 },
      orthogonal: { angle: 90, yLength: 2.4, xLength: 2.8 },
      obtuse: { angle: 132, yLength: 2.4, xLength: 2.8 },
      parallel: { angle: 0, yLength: 2.1, xLength: 2.8 },
      zero: { angle: 50, yLength: 0, xLength: 2.8 },
    };

    stepButtons.forEach((button) => api.on(button, "click", () => {
      state.step = Number(button.dataset.ipStep);
      draw();
    }));
    presetButtons.forEach((button) => api.on(button, "click", () => {
      Object.assign(state, presets[button.dataset.ipPreset]);
      api.setPressed(presetButtons, (item) => item === button);
      draw();
    }));
    api.bindRange(root, "angle", (value) => {
      state.angle = value;
      api.setPressed(presetButtons, () => false);
      draw();
    });
    api.bindRange(root, "yLength", (value) => {
      state.yLength = value;
      api.setPressed(presetButtons, () => false);
      draw();
    });
    api.bindRange(root, "xLength", (value) => {
      state.xLength = value;
      api.setPressed(presetButtons, () => false);
      draw();
    });

    api.on(canvas, "pointerdown", (event) => {
      dragging = true;
      canvas.setPointerCapture(event.pointerId);
    });
    api.on(canvas, "pointermove", (event) => {
      if (!dragging) return;
      const system = api.plane(canvas, 4.15, 16);
      const vector = system.toWorld(api.pointer(event, canvas));
      state.yLength = api.clamp(api.norm(vector), 0, 3.6);
      state.angle = api.degrees(Math.atan2(vector[1], vector[0]));
      api.setPressed(presetButtons, () => false);
      draw();
    });
    api.on(canvas, "pointerup", (event) => {
      dragging = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    });
    api.on(canvas, "keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "ArrowLeft") state.angle -= event.shiftKey ? 5 : 1;
      if (event.key === "ArrowRight") state.angle += event.shiftKey ? 5 : 1;
      if (event.key === "ArrowUp") state.yLength = api.clamp(state.yLength + 0.1, 0, 3.6);
      if (event.key === "ArrowDown") state.yLength = api.clamp(state.yLength - 0.1, 0, 3.6);
      draw();
    });

    api.installRedraw(draw, [canvas]);
  }

  window.Chapter9V2.register(sectionId, { foundation, interactive, mount });
})();
