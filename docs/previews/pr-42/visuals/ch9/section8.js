(() => {
  const sectionId = "unitary-spaces";

  function foundation(api) {
    const i = api.inline;
    const d = api.display;
    return `
      ${api.foundationIntro(
        "复数域中必须多一步共轭",
        "普通转置不能保证“长度平方”是非负实数",
        `若直接用 ${i("z^Tz")}，例如 ${i("z=i")} 会得到 −1。复内积把第一变量共轭，使 ${i("\\langle z,z\\rangle")} 成为模长平方之和。`,
      )}
      <div class="ch9v2-foundation">
        ${api.module(
          "01",
          "共轭把旋转方向翻到实轴另一侧",
          "z 与 z̄ 关于实轴对称，相乘后相位抵消。",
          `<div class="ch9v2-conjugate-story">
            <div class="ch9v2-complex-icon"><i class="is-z"></i><i class="is-conjugate"></i><b></b></div>
            <div>${d("\\overline z z=|z|^2\\in\\mathbb R_{\\ge0}")}<p>这正是复内积正定性的来源。</p></div>
          </div>`,
        )}
        ${api.module(
          "02",
          "实数结构到复数结构的对应表",
          "核心公式形状不变，只把转置升级为共轭转置。",
          `<div class="ch9v2-dictionary-table">
            <div><span>实向量空间</span><span>复向量空间</span></div>
            <div><strong>${i("A^T")}</strong><strong>${i("A^*=\\overline A^T")}</strong></div>
            <div><strong>对称矩阵</strong><strong>Hermitian 矩阵</strong></div>
            <div><strong>${i("Q^TQ=I")}</strong><strong>${i("U^*U=I")}</strong></div>
            <div><strong>正交变换</strong><strong>酉变换</strong></div>
          </div>`,
        )}
        ${api.module(
          "03",
          "酉变换保持复内积",
          "相位可以变化，模长与正交关系不能变化。",
          `<div class="ch9v2-proof-line">${d("\\langle Ux,Uy\\rangle=x^*U^*Uy=x^*y=\\langle x,y\\rangle")}</div>
          <div class="ch9v2-theorem-band is-secondary">${d("U^{-1}=U^*")}<p>在一维复空间中，乘以 ${i("e^{i\\phi}")} 就是最简单的酉变换：只旋转相位，不改变模长。</p></div>`,
        )}
        ${api.module(
          "04",
          "Hermitian 对应实对称矩阵",
          "本节只建立入口，不提前展开完整复谱定理。",
          `<div class="ch9v2-boundary-pair">
            <article><strong>${i("A^*=A")}</strong><p>Hermitian 矩阵的特征值为实数，对角元也必须是实数。</p></article>
            <article><strong>实数特例</strong><p>元素全为实数时，共轭转置就是普通转置，酉矩阵退化为正交矩阵。</p></article>
          </div>`,
          "is-compact",
        )}
      </div>`;
  }

  function interactive(api) {
    return api.labShell({
      kicker: "交互实验 · 先看共轭，再看酉相位",
      title: "让 z、z̄ 与 Uz 在同一个复平面中说清楚",
      intro: "先观察共轭关于实轴镜像，再验证 z̄z 是非负实数，最后施加相位变换。非酉缩放会立刻破坏模长证书。",
      steps: ["看共轭", "得到 |z|²", "施加酉相位"],
      body: `
        <div class="ch9v2-workbench ch9v2-unitary-lab">
          <figure class="ch9v2-stage-card">
            <div class="ch9v2-stage-toolbar">
              <div><span data-u-stage-kicker>第 1 步</span><strong data-u-stage-title>z 与 z̄ 关于实轴对称</strong></div>
              <div class="ch9v2-legend"><span><i class="is-blue"></i>z</span><span><i class="is-coral"></i>z̄</span><span><i class="is-accent"></i>Uz</span></div>
            </div>
            <canvas data-u-v2-canvas tabindex="0" aria-label="复数 z、共轭 z bar 和相位变换 Uz 的复平面"></canvas>
            <figcaption data-u-caption>拖动 z 的箭头端点；共轭向量会在实轴另一侧同步镜像。</figcaption>
          </figure>
          <aside class="ch9v2-panel">
            <div class="ch9v2-step-tabs" role="group" aria-label="酉空间实验步骤">
              <button type="button" class="is-active" data-u-step="0">01 共轭</button>
              <button type="button" data-u-step="1">02 长度</button>
              <button type="button" data-u-step="2">03 酉变换</button>
            </div>
            <div class="ch9v2-choice-cards is-two-column">
              <button type="button" class="is-active" data-u-mode="unitary"><span>U*U=I</span><strong>纯相位</strong><small>只旋转，不缩放</small></button>
              <button type="button" data-u-mode="scaled"><span>U*U≠I</span><strong>相位 + 缩放</strong><small>作为失败对照</small></button>
            </div>
            <div class="ch9v2-control-block">
              ${api.range("zAngle", "z 的相位", -180, 180, 1, 42, "°")}
              ${api.range("zLength", "|z|", 0, 3.4, 0.1, 2.2)}
              ${api.range("phase", "U 的相位 φ", -180, 180, 1, 70, "°")}
              ${api.range("scale", "非酉缩放 ρ", 0.4, 1.8, 0.05, 1.35)}
            </div>
            <div class="ch9v2-formula-story" data-u-formula></div>
            <div class="ch9v2-metric-grid">
              ${api.metric("z̄z", "selfInner")}
              ${api.metric("|z| / |Uz|", "normPair")}
              ${api.metric("U*U−1", "unitaryError")}
              ${api.metric("长度平方误差", "normError")}
            </div>
            <div class="ch9v2-observation" data-u-observation aria-live="polite"></div>
          </aside>
        </div>`,
    });
  }

  function mount(root, api) {
    const canvas = root.querySelector("[data-u-v2-canvas]");
    const state = { step: 0, mode: "unitary", zAngle: 42, zLength: 2.2, phase: 70, scale: 1.35 };
    const stepButtons = [...root.querySelectorAll("[data-u-step]")];
    const modeButtons = [...root.querySelectorAll("[data-u-mode]")];
    let dragging = false;

    function complexFromPolar(length, angleDegrees) {
      const angle = api.radians(angleDegrees);
      return [length * Math.cos(angle), length * Math.sin(angle)];
    }

    function multiply(a, b) {
      return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
    }

    function draw() {
      const z = complexFromPolar(state.zLength, state.zAngle);
      const conjugate = [z[0], -z[1]];
      const rho = state.mode === "unitary" ? 1 : state.scale;
      const factor = complexFromPolar(rho, state.phase);
      const transformed = multiply(factor, z);
      const transformedLength = api.norm(transformed);
      const selfInner = state.zLength ** 2;
      const unitaryError = Math.abs(rho ** 2 - 1);
      const normError = Math.abs(transformedLength ** 2 - selfInner);
      api.setPressed(stepButtons, (button) => Number(button.dataset.uStep) === state.step);
      api.setPressed(modeButtons, (button) => button.dataset.uMode === state.mode);
      root.querySelectorAll("[data-v2-path-step]").forEach((item, index) => item.classList.toggle("is-active", index <= state.step));
      for (const name of ["zAngle", "zLength", "phase", "scale"]) {
        const input = root.querySelector(`[data-v2-range="${name}"]`);
        if (input) input.value = String(state[name]);
      }
      api.update(root, "zAngle", `${api.format(state.zAngle, 0)}°`);
      api.update(root, "zLength", api.format(state.zLength, 1));
      api.update(root, "phase", `${api.format(state.phase, 0)}°`);
      api.update(root, "scale", api.format(state.scale, 2));
      api.update(root, "selfInner", api.format(selfInner, 3));
      api.update(root, "normPair", `${api.format(state.zLength, 3)} / ${api.format(transformedLength, 3)}`);
      api.update(root, "unitaryError", api.format(unitaryError, 4));
      api.update(root, "normError", api.format(normError, 4));

      const system = api.plane(canvas, 3.8, 10);
      api.drawGrid(system);
      const colors = api.palette();
      api.drawArrow(system.ctx, system.origin, system.toScreen(z), colors.blue, "z", { width: 4.5 });
      if (state.step >= 0) api.drawArrow(system.ctx, system.origin, system.toScreen(conjugate), colors.coral, "z̄", { width: 3.8, alpha: state.step === 0 ? 1 : 0.48 });
      if (state.step >= 2) api.drawArrow(system.ctx, system.origin, system.toScreen(transformed), colors.accentStrong, "Uz", { width: 5 });
      if (state.step >= 1) {
        system.ctx.save();
        system.ctx.strokeStyle = colors.accent;
        system.ctx.lineWidth = 2;
        system.ctx.setLineDash([6, 6]);
        system.ctx.beginPath();
        system.ctx.arc(system.origin.x, system.origin.y, state.zLength * system.unit, 0, Math.PI * 2);
        system.ctx.stroke();
        system.ctx.restore();
      }

      const formula = root.querySelector("[data-u-formula]");
      if (state.step === 0) {
        formula.innerHTML = `<span>共轭只翻转虚部</span>${api.display(`z=${api.format(z[0], 2)}+${api.format(z[1], 2)}i,\\qquad\\overline z=${api.format(conjugate[0], 2)}+${api.format(conjugate[1], 2)}i`)}`;
        api.setText(root, "[data-u-stage-kicker]", "第 1 步");
        api.setText(root, "[data-u-stage-title]", "z 与 z̄ 关于实轴对称");
        api.setText(root, "[data-u-caption]", "拖动 z 的箭头端点；共轭向量会在实轴另一侧同步镜像。");
      } else if (state.step === 1) {
        formula.innerHTML = `<span>相位相消，只留下非负实数</span>${api.display(`\\overline z z=|z|^2=${api.format(selfInner, 3)}`)}`;
        api.setText(root, "[data-u-stage-kicker]", "第 2 步");
        api.setText(root, "[data-u-stage-title]", "z̄z 落在非负实轴上");
        api.setText(root, "[data-u-caption]", "虚部不再进入长度平方；虚线圆表示所有与 z 模长相同的复数。");
      } else {
        formula.innerHTML = `<span>一维酉变换就是纯相位</span>${api.display(`U=${api.format(rho, 2)}e^{i${api.format(state.phase, 0)}^\\circ},\\qquad Uz=U z`)}`;
        api.setText(root, "[data-u-stage-kicker]", "第 3 步");
        api.setText(root, "[data-u-stage-title]", state.mode === "unitary" ? "Uz 只沿等模圆旋转" : "Uz 同时旋转并改变模长");
        api.setText(root, "[data-u-caption]", state.mode === "unitary" ? "蓝色 z 与青色 Uz 落在同一条等模圆上。" : "非酉缩放把 Uz 推离原等模圆，长度证书立刻失败。");
      }

      const observation = root.querySelector("[data-u-observation]");
      const pass = state.mode === "unitary";
      observation.classList.toggle("is-warning", !pass);
      if (state.zLength < 1e-8) observation.innerHTML = `<strong>零向量</strong><p>z̄z=0，任何线性变换都把零向量送到零向量；相位不再可辨认。</p>`;
      else if (pass) observation.innerHTML = `<strong>酉证书通过</strong><p>U*U=1，|Uz|=|z|；变换只改变相位，不改变复内积给出的长度。</p>`;
      else observation.innerHTML = `<strong>非酉对照</strong><p>当前 U*U−1=${api.format(unitaryError, 3)}，长度平方误差为 ${api.format(normError, 3)}。</p>`;
    }

    stepButtons.forEach((button) => api.on(button, "click", () => {
      state.step = Number(button.dataset.uStep);
      draw();
    }));
    modeButtons.forEach((button) => api.on(button, "click", () => {
      state.mode = button.dataset.uMode;
      state.step = 2;
      draw();
    }));
    for (const name of ["zAngle", "zLength", "phase", "scale"]) {
      api.bindRange(root, name, (value) => {
        state[name] = value;
        if (name === "scale") state.mode = "scaled";
        draw();
      });
    }
    api.on(canvas, "pointerdown", (event) => {
      dragging = true;
      canvas.setPointerCapture(event.pointerId);
    });
    api.on(canvas, "pointermove", (event) => {
      if (!dragging) return;
      const system = api.plane(canvas, 3.8, 10);
      const vector = system.toWorld(api.pointer(event, canvas));
      state.zLength = api.clamp(api.norm(vector), 0, 3.4);
      state.zAngle = api.degrees(Math.atan2(vector[1], vector[0]));
      draw();
    });
    api.on(canvas, "pointerup", (event) => {
      dragging = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    });
    api.installRedraw(draw, [canvas]);
  }

  window.Chapter9V2.register(sectionId, { foundation, interactive, mount });
})();
