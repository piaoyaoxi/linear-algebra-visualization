(() => {
  const sectionId = "symmetric-canonical-form";

  function foundation(api) {
    const i = api.inline;
    const d = api.display;
    return `
      ${api.foundationIntro(
        "对称性不是外观",
        "Aᵀ=A 迫使特征方向彼此正交",
        `一般矩阵可能没有足够特征向量，也可能只有一组很歪的特征基。实对称矩阵不同：它总能找到一组标准正交特征基，并由一个正交矩阵把 A 化成实对角形。`,
      )}
      <div class="ch9v2-foundation">
        ${api.module(
          "01",
          "不同特征值为什么自动正交",
          "关键只用了一次 Aᵀ=A。",
          `<div class="ch9v2-proof-chain">
            ${d("Au=\\lambda u,\\qquad Av=\\mu v")}
            ${d("\\lambda\\langle u,v\\rangle=\\langle Au,v\\rangle=\\langle u,Av\\rangle=\\mu\\langle u,v\\rangle")}
            <p>当 ${i("\\lambda\\ne\\mu")} 时，只有 ${i("\\langle u,v\\rangle=0")} 才可能成立。</p>
          </div>`,
        )}
        ${api.module(
          "02",
          "谱定理给出的不是普通对角化",
          "坐标变换矩阵 Q 本身正交，所以逆变换就是转置。",
          `<div class="ch9v2-spectral-equations">
            <article><span>标准形</span>${d("Q^TAQ=\\Lambda")}</article>
            <article><span>重构</span>${d("A=Q\\Lambda Q^T")}</article>
            <article><span>谱分解</span>${d("A=\\sum_i\\lambda_iq_iq_i^T")}</article>
          </div>`,
          "is-compact",
        )}
        ${api.module(
          "03",
          "把 A 看成三个连续动作",
          "先转到特征坐标，再沿各特征方向独立伸缩，最后转回原坐标。",
          `<div class="ch9v2-three-machine">
            <div><span>1</span><strong>${i("Q^T")}</strong><small>转到特征基</small></div>
            <i>→</i>
            <div><span>2</span><strong>${i("\\Lambda")}</strong><small>沿坐标轴伸缩</small></div>
            <i>→</i>
            <div><span>3</span><strong>${i("Q")}</strong><small>转回原坐标</small></div>
          </div>`,
        )}
        ${api.module(
          "04",
          "两种容易误判的边界",
          "重特征值不是失败，非对称矩阵才是结论闸门。",
          `<div class="ch9v2-boundary-pair">
            <article><strong>重特征值</strong><p>特征方向不唯一，但可在对应特征空间内任选标准正交基。</p></article>
            <article class="is-warning"><strong>非对称矩阵</strong><p>不能继续宣称存在实正交标准形；若 A 能被实正交矩阵对角化，它必然对称。</p></article>
          </div>`,
          "is-compact",
        )}
      </div>`;
  }

  function interactive(api) {
    return api.labShell({
      kicker: "交互实验 · 不要只盯着最终椭圆",
      title: "把 A=QΛQᵀ 拆成三次看得见的动作",
      intro: "沿时间线走完“转到特征基 → 独立伸缩 → 转回原坐标”。每一步都显示当前复合矩阵、图形状态和对应公式。",
      steps: ["原坐标", "应用 Qᵀ", "应用 Λ", "应用 Q"],
      body: `
        <div class="ch9v2-workbench ch9v2-spectral-lab">
          <figure class="ch9v2-stage-card">
            <div class="ch9v2-stage-toolbar">
              <div><span data-sp-stage-kicker>起点</span><strong data-sp-stage-title>单位圆与标准基</strong></div>
              <div class="ch9v2-stage-badge" data-sp-badge></div>
            </div>
            <canvas data-sp-v2-canvas aria-label="实对称矩阵谱分解的三个连续几何动作"></canvas>
            <div class="ch9v2-timeline" data-sp-timeline>
              <button type="button" class="is-active" data-sp-step="0"><span>00</span><strong>I</strong><small>原图形</small></button>
              <button type="button" data-sp-step="1"><span>01</span><strong>Qᵀ</strong><small>转到特征基</small></button>
              <button type="button" data-sp-step="2"><span>02</span><strong>ΛQᵀ</strong><small>独立伸缩</small></button>
              <button type="button" data-sp-step="3"><span>03</span><strong>QΛQᵀ</strong><small>回到原坐标</small></button>
            </div>
            <figcaption data-sp-caption>单位圆是起点；两条彩色方向是 A 的标准正交特征向量。</figcaption>
          </figure>
          <aside class="ch9v2-panel">
            <div class="ch9v2-control-block">
              <div class="ch9v2-control-heading"><strong>谱参数</strong><small>先用清晰预设，再连续调节</small></div>
              <div class="ch9v2-chip-row">
                <button type="button" class="is-active" data-sp-preset="positive">正定椭圆</button>
                <button type="button" data-sp-preset="indefinite">一正一负</button>
                <button type="button" data-sp-preset="repeated">重特征值</button>
                <button type="button" data-sp-preset="nonsymmetric">非对称对照</button>
              </div>
              ${api.range("angle", "特征方向角", -90, 90, 1, 32, "°")}
              ${api.range("lambda1", "λ₁", -3, 3, 0.1, 2.8)}
              ${api.range("lambda2", "λ₂", -3, 3, 0.1, 1.1)}
              ${api.range("asym", "非对称扰动", 0, 1.2, 0.05, 0)}
            </div>
            <div class="ch9v2-formula-story" data-sp-formula></div>
            <div class="ch9v2-metric-grid">
              ${api.metric("λ₁ / λ₂", "lambdas")}
              ${api.metric("⟨q₁,q₂⟩", "qdot")}
              ${api.metric("‖A−Aᵀ‖∞", "symmetryError")}
              ${api.metric("重构误差", "reconstruction")}
            </div>
            <div class="ch9v2-observation" data-sp-observation aria-live="polite"></div>
          </aside>
        </div>`,
    });
  }

  function rotation(api, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [c, -s, s, c];
  }

  function currentTransform(api, q, lambda, step) {
    if (step === 0) return [1, 0, 0, 1];
    if (step === 1) return api.transpose(q);
    if (step === 2) return api.matMul(lambda, api.transpose(q));
    return api.matMul(api.matMul(q, lambda), api.transpose(q));
  }

  function drawSpectral(canvas, api, state, q, lambda, matrix, symmetric) {
    const system = api.plane(canvas, 4.25, 16);
    api.drawGrid(system);
    const colors = api.palette();
    const transform = symmetric ? currentTransform(api, q, lambda, state.step) : matrix;
    const circle = [];
    for (let index = 0; index <= 200; index += 1) {
      const angle = (index / 200) * Math.PI * 2;
      circle.push(api.matVec(transform, [Math.cos(angle), Math.sin(angle)]));
    }
    system.ctx.save();
    system.ctx.strokeStyle = symmetric ? colors.accent : colors.coral;
    system.ctx.lineWidth = 3;
    system.ctx.beginPath();
    circle.forEach((point, index) => {
      const screen = system.toScreen(point);
      if (index === 0) system.ctx.moveTo(screen.x, screen.y);
      else system.ctx.lineTo(screen.x, screen.y);
    });
    system.ctx.closePath();
    system.ctx.stroke();
    system.ctx.restore();

    const sample = [1.45, 0.75];
    const sampleOut = api.matVec(transform, sample);
    api.drawArrow(system.ctx, system.origin, system.toScreen(sampleOut), colors.violet, state.step === 0 ? "x" : "当前像", { width: 4 });

    const q1 = [q[0], q[2]];
    const q2 = [q[1], q[3]];
    if (symmetric && (state.step === 0 || state.step === 3)) {
      const reach = 3.8;
      for (const [vector, color] of [[q1, colors.blue], [q2, colors.coral]]) {
        const a = system.toScreen(api.scale(-reach, vector));
        const b = system.toScreen(api.scale(reach, vector));
        system.ctx.save();
        system.ctx.strokeStyle = color;
        system.ctx.lineWidth = 2;
        system.ctx.globalAlpha = 0.24;
        system.ctx.beginPath(); system.ctx.moveTo(a.x, a.y); system.ctx.lineTo(b.x, b.y); system.ctx.stroke();
        system.ctx.restore();
      }
      api.drawArrow(system.ctx, system.origin, system.toScreen(q1), colors.blue, "q₁", { width: 4, labelDy: 18 });
      api.drawArrow(system.ctx, system.origin, system.toScreen(q2), colors.coral, "q₂", { width: 4 });
    } else if (symmetric) {
      api.drawArrow(system.ctx, system.origin, system.toScreen([1, 0]), colors.blue, "特征坐标 1", { width: 3.5, alpha: 0.65, labelDy: 18 });
      api.drawArrow(system.ctx, system.origin, system.toScreen([0, 1]), colors.coral, "特征坐标 2", { width: 3.5, alpha: 0.65 });
    }
  }

  function mount(root, api) {
    const canvas = root.querySelector("[data-sp-v2-canvas]");
    const state = { step: 0, angle: 32, lambda1: 2.8, lambda2: 1.1, asym: 0 };
    const stepButtons = [...root.querySelectorAll("[data-sp-step]")];
    const presetButtons = [...root.querySelectorAll("[data-sp-preset]")];

    function draw() {
      const q = rotation(api, api.radians(state.angle));
      const lambda = [state.lambda1, 0, 0, state.lambda2];
      const symmetricMatrix = api.matMul(api.matMul(q, lambda), api.transpose(q));
      const matrix = [symmetricMatrix[0], symmetricMatrix[1] + state.asym, symmetricMatrix[2], symmetricMatrix[3]];
      const symmetric = Math.abs(state.asym) < 1e-9;
      const symmetryError = Math.abs(matrix[1] - matrix[2]);
      const reconstruction = symmetric ? Math.max(...matrix.map((value, index) => Math.abs(value - symmetricMatrix[index]))) : NaN;
      const q1 = [q[0], q[2]];
      const q2 = [q[1], q[3]];
      if (!symmetric) state.step = 3;
      api.setPressed(stepButtons, (button) => Number(button.dataset.spStep) === state.step);
      stepButtons.forEach((button) => button.disabled = !symmetric && Number(button.dataset.spStep) !== 3);
      root.querySelectorAll("[data-v2-path-step]").forEach((item, index) => item.classList.toggle("is-active", index <= state.step && symmetric));
      root.querySelector('[data-v2-range="angle"]').value = String(state.angle);
      root.querySelector('[data-v2-range="lambda1"]').value = String(state.lambda1);
      root.querySelector('[data-v2-range="lambda2"]').value = String(state.lambda2);
      root.querySelector('[data-v2-range="asym"]').value = String(state.asym);
      api.update(root, "angle", `${api.format(state.angle, 0)}°`);
      api.update(root, "lambda1", api.format(state.lambda1, 1));
      api.update(root, "lambda2", api.format(state.lambda2, 1));
      api.update(root, "asym", api.format(state.asym, 2));
      api.update(root, "lambdas", `${api.format(state.lambda1, 2)} / ${api.format(state.lambda2, 2)}`);
      api.update(root, "qdot", api.format(api.dot(q1, q2), 5));
      api.update(root, "symmetryError", api.format(symmetryError, 5));
      api.update(root, "reconstruction", symmetric ? api.format(reconstruction, 6) : "关闭");
      drawSpectral(canvas, api, state, q, lambda, matrix, symmetric);

      const badge = root.querySelector("[data-sp-badge]");
      badge.className = `ch9v2-stage-badge ${symmetric ? "is-pass" : "is-fail"}`;
      badge.textContent = symmetric ? (Math.abs(state.lambda1 - state.lambda2) < 1e-7 ? "对称 · 重特征值" : "对称 · 正交标准形") : "非对称 · 谱定理关闭";
      const formula = root.querySelector("[data-sp-formula]");
      if (!symmetric) {
        formula.innerHTML = `<span>当前矩阵不满足 Aᵀ=A</span>${api.display(`A=\\begin{bmatrix}${api.format(matrix[0], 2)}&${api.format(matrix[1], 2)}\\\\${api.format(matrix[2], 2)}&${api.format(matrix[3], 2)}\\end{bmatrix}`)}`;
        api.setText(root, "[data-sp-stage-kicker]", "结论闸门");
        api.setText(root, "[data-sp-stage-title]", "非对称矩阵不能套用 QΛQᵀ");
        api.setText(root, "[data-sp-caption]", "这里只显示 A 对单位圆的直接作用，不再冒充实对称谱分解。");
      } else if (state.step === 0) {
        formula.innerHTML = `<span>起点：在原坐标中标出两条特征方向</span>${api.display("Aq_1=\\lambda_1q_1,\\qquad Aq_2=\\lambda_2q_2")}`;
        api.setText(root, "[data-sp-stage-kicker]", "起点");
        api.setText(root, "[data-sp-stage-title]", "单位圆与标准正交特征方向");
        api.setText(root, "[data-sp-caption]", "单位圆是起点；两条彩色方向是 A 的标准正交特征向量。");
      } else if (state.step === 1) {
        formula.innerHTML = `<span>Qᵀ 把特征方向转成坐标轴</span>${api.display("x\\longmapsto Q^Tx")}`;
        api.setText(root, "[data-sp-stage-kicker]", "动作 1 · Qᵀ");
        api.setText(root, "[data-sp-stage-title]", "转到特征坐标");
        api.setText(root, "[data-sp-caption]", "圆仍是圆，因为 Qᵀ 只是正交旋转；此时特征方向与坐标轴对齐。");
      } else if (state.step === 2) {
        formula.innerHTML = `<span>Λ 沿两条坐标轴独立伸缩</span>${api.display(`\\Lambda=\\begin{bmatrix}${api.format(state.lambda1, 2)}&0\\\\0&${api.format(state.lambda2, 2)}\\end{bmatrix}`)}`;
        api.setText(root, "[data-sp-stage-kicker]", "动作 2 · Λ");
        api.setText(root, "[data-sp-stage-title]", "在特征坐标中独立伸缩");
        api.setText(root, "[data-sp-caption]", "椭圆此时轴对齐；负特征值还会把对应方向翻转。");
      } else {
        formula.innerHTML = `<span>Q 把轴对齐椭圆转回原坐标</span>${api.display("A=Q\\Lambda Q^T")}`;
        api.setText(root, "[data-sp-stage-kicker]", "动作 3 · Q");
        api.setText(root, "[data-sp-stage-title]", "回到原坐标，得到 A 的最终作用");
        api.setText(root, "[data-sp-caption]", "最终椭圆的主轴正是 q₁、q₂，沿轴的有向伸缩量是 λ₁、λ₂。");
      }

      const observation = root.querySelector("[data-sp-observation]");
      observation.classList.toggle("is-warning", !symmetric);
      if (!symmetric) observation.innerHTML = `<strong>谱定理已关闭</strong><p>对称误差为 ${api.format(symmetryError, 3)}。不能使用对称部分的特征方向替代 A 的真正结构。</p>`;
      else if (Math.abs(state.lambda1 - state.lambda2) < 1e-7) observation.innerHTML = `<strong>重特征值</strong><p>A 在所有方向上的伸缩相同，特征方向不唯一；任何标准正交基都可以作为 Q。</p>`;
      else if (state.lambda1 * state.lambda2 < 0) observation.innerHTML = `<strong>一正一负</strong><p>两条特征方向中的一条发生翻转；正交对角化仍然完全成立。</p>`;
      else observation.innerHTML = `<strong>谱分解通过</strong><p>两条主轴互相垂直，三步复合与直接应用 A 完全一致。</p>`;
    }

    stepButtons.forEach((button) => api.on(button, "click", () => {
      if (button.disabled) return;
      state.step = Number(button.dataset.spStep);
      draw();
    }));
    const presets = {
      positive: { angle: 32, lambda1: 2.8, lambda2: 1.1, asym: 0, step: 0 },
      indefinite: { angle: -28, lambda1: 2.4, lambda2: -1.2, asym: 0, step: 0 },
      repeated: { angle: 40, lambda1: 1.7, lambda2: 1.7, asym: 0, step: 0 },
      nonsymmetric: { angle: 25, lambda1: 2.4, lambda2: 0.9, asym: 0.7, step: 3 },
    };
    presetButtons.forEach((button) => api.on(button, "click", () => {
      Object.assign(state, presets[button.dataset.spPreset]);
      api.setPressed(presetButtons, (item) => item === button);
      draw();
    }));
    for (const name of ["angle", "lambda1", "lambda2", "asym"]) {
      api.bindRange(root, name, (value) => {
        state[name] = value;
        api.setPressed(presetButtons, () => false);
        draw();
      });
    }
    api.installRedraw(draw, [canvas]);
  }

  window.Chapter9V2.register(sectionId, { foundation, interactive, mount });
})();
