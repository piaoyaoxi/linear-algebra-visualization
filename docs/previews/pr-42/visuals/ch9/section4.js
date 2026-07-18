(() => {
  const sectionId = "orthogonal-transformations";

  function foundation(api) {
    const i = api.inline;
    const d = api.display;
    return `
      ${api.foundationIntro(
        "允许移动，不允许变形",
        "正交变换只改变位置与定向，不改变任何欧氏测量",
        `旋转和镜像可以把整个空间搬到新位置，却不会拉长、压扁或剪斜。矩阵条件 ${i("Q^TQ=I")} 是这一整套几何不变量的统一证书。`,
      )}
      <div class="ch9v2-foundation">
        ${api.module(
          "01",
          "先看它保留了什么",
          "不是“图形看起来差不多”，而是所有向量对都通过同一组检验。",
          `<div class="ch9v2-invariant-grid">
            <article><strong>长度</strong>${i("\\lVert Qx\\rVert=\\lVert x\\rVert")}</article>
            <article><strong>内积</strong>${i("\\langle Qx,Qy\\rangle=\\langle x,y\\rangle")}</article>
            <article><strong>夹角</strong>${i("\\angle(Qx,Qy)=\\angle(x,y)")}</article>
            <article><strong>正交</strong>${i("x\\perp y\\Rightarrow Qx\\perp Qy")}</article>
          </div>`,
          "is-compact",
        )}
        ${api.module(
          "02",
          "为什么只检查 QᵀQ 就够了",
          "矩阵乘法把“对所有 x、y”压缩成一条矩阵恒等式。",
          `<div class="ch9v2-proof-line">${d("\\langle Qx,Qy\\rangle=x^TQ^TQy=x^Ty")}</div>
          <div class="ch9v2-theorem-band is-secondary">${d("Q^TQ=I\\iff Q^{-1}=Q^T")}<p>Q 的列与行都构成标准正交基，所以它不会把独立方向挤到一起。</p></div>`,
        )}
        ${api.module(
          "03",
          "二维只有两类真正的正交动作",
          "行列式只告诉我们定向是否翻转，不影响长度保持。",
          `<div class="ch9v2-transform-types">
            <article><span>det Q = 1</span><strong>旋转</strong><div class="ch9v2-transform-icon is-rotation"><i></i></div><p>保持长度，也保持定向。</p></article>
            <article><span>det Q = −1</span><strong>镜像 + 旋转</strong><div class="ch9v2-transform-icon is-reflection"><i></i></div><p>保持长度，但翻转定向。</p></article>
          </div>`,
        )}
        ${api.module(
          "04",
          "单位圆是最直接的整体检测器",
          "所有单位向量组成单位圆；若长度全部保持，它的像仍必须是单位圆。",
          `<div class="ch9v2-circle-test"><div class="is-circle"></div><span>正交变换</span><div class="is-circle is-rotated"></div><b>对照</b><div class="is-ellipse"></div><p>伸缩或剪切会把单位圆变成椭圆，因此不可能满足 ${i("Q^TQ=I")}。</p></div>`,
        )}
      </div>`;
  }

  function interactive(api) {
    return api.labShell({
      kicker: "交互实验 · 用三层证据判断",
      title: "先看单位圆，再看基向量，最后读矩阵证书",
      intro: "选择一种变换。图形层告诉你有没有变形，基向量层告诉你列是否标准正交，矩阵层给出 QᵀQ 与行列式的最终判定。",
      steps: ["看图形", "看两列", "看证书"],
      body: `
        <div class="ch9v2-workbench ch9v2-orthogonal-lab">
          <figure class="ch9v2-stage-card">
            <div class="ch9v2-stage-toolbar">
              <div><span data-ortho-stage-kicker>图形层</span><strong data-ortho-stage-title>单位圆和三角形是否发生形变</strong></div>
              <div class="ch9v2-stage-badge" data-ortho-badge></div>
            </div>
            <canvas data-ortho-v2-canvas aria-label="单位圆、测试三角形和两条基向量经过所选线性变换后的图形"></canvas>
            <figcaption data-ortho-caption>圆仍是圆，说明所有单位方向的长度都保持。</figcaption>
          </figure>
          <aside class="ch9v2-panel">
            <div class="ch9v2-choice-cards is-two-column">
              <button type="button" class="is-active" data-ortho-mode="rotation"><span>正交</span><strong>旋转</strong><small>保持定向</small></button>
              <button type="button" data-ortho-mode="reflection"><span>正交</span><strong>镜像</strong><small>翻转定向</small></button>
              <button type="button" data-ortho-mode="stretch"><span>非正交</span><strong>伸缩</strong><small>圆变椭圆</small></button>
              <button type="button" data-ortho-mode="shear"><span>非正交</span><strong>剪切</strong><small>角度改变</small></button>
            </div>
            <div class="ch9v2-step-tabs" role="group" aria-label="正交变换观察层">
              <button type="button" class="is-active" data-ortho-step="0">01 图形</button>
              <button type="button" data-ortho-step="1">02 两列</button>
              <button type="button" data-ortho-step="2">03 证书</button>
            </div>
            <div class="ch9v2-control-block">
              ${api.range("angle", "旋转/镜像方向", -180, 180, 1, 38, "°")}
              ${api.range("amount", "伸缩/剪切强度", -1.3, 1.3, 0.05, 0.7)}
            </div>
            <div class="ch9v2-formula-story" data-ortho-formula></div>
            <div class="ch9v2-metric-grid">
              ${api.metric("det Q", "det")}
              ${api.metric("‖QᵀQ−I‖∞", "error")}
              ${api.metric("两列内积", "columnDot")}
              ${api.metric("列长度", "columnNorms")}
            </div>
            <div class="ch9v2-observation" data-ortho-observation aria-live="polite"></div>
          </aside>
        </div>`,
    });
  }

  function matrixFor(api, state) {
    const angle = api.radians(state.angle);
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    if (state.mode === "rotation") return [c, -s, s, c];
    if (state.mode === "reflection") return [c, s, s, -c];
    if (state.mode === "stretch") return [1 + 0.65 * state.amount, 0, 0, 1 - 0.45 * state.amount];
    return [1, state.amount, 0, 1];
  }

  function drawShape(root, canvas, api, matrix, step) {
    const p = api.palette();
    const system = api.plane(canvas, 3.9, 16);
    api.drawGrid(system);
    const circle = [];
    for (let index = 0; index <= 180; index += 1) {
      const angle = (index / 180) * Math.PI * 2;
      circle.push(api.matVec(matrix, [Math.cos(angle), Math.sin(angle)]));
    }
    system.ctx.save();
    system.ctx.strokeStyle = p.accent;
    system.ctx.lineWidth = step === 0 ? 3 : 2;
    system.ctx.globalAlpha = step === 0 ? 1 : 0.34;
    system.ctx.beginPath();
    circle.forEach((point, index) => {
      const screen = system.toScreen(point);
      if (index === 0) system.ctx.moveTo(screen.x, screen.y);
      else system.ctx.lineTo(screen.x, screen.y);
    });
    system.ctx.closePath();
    system.ctx.stroke();
    system.ctx.restore();

    const triangle = [[0.25, 0.35], [2.2, 0.35], [0.8, 1.65]];
    system.ctx.save();
    system.ctx.fillStyle = p.violet;
    system.ctx.strokeStyle = p.violet;
    system.ctx.globalAlpha = step === 0 ? 0.2 : 0.08;
    system.ctx.lineWidth = 2;
    system.ctx.beginPath();
    triangle.forEach((point, index) => {
      const screen = system.toScreen(api.matVec(matrix, point));
      if (index === 0) system.ctx.moveTo(screen.x, screen.y);
      else system.ctx.lineTo(screen.x, screen.y);
    });
    system.ctx.closePath();
    system.ctx.fill();
    system.ctx.globalAlpha = step === 0 ? 0.9 : 0.3;
    system.ctx.stroke();
    system.ctx.restore();

    const q1 = api.matVec(matrix, [1, 0]);
    const q2 = api.matVec(matrix, [0, 1]);
    api.drawArrow(system.ctx, system.origin, system.toScreen(q1), p.blue, "q₁", { width: step >= 1 ? 5 : 3, alpha: step >= 1 ? 1 : 0.45, labelDy: 18 });
    api.drawArrow(system.ctx, system.origin, system.toScreen(q2), p.coral, "q₂", { width: step >= 1 ? 5 : 3, alpha: step >= 1 ? 1 : 0.45 });
    if (step >= 1) {
      const q1End = system.toScreen(q1);
      system.ctx.save();
      system.ctx.strokeStyle = p.faint;
      system.ctx.setLineDash([5, 5]);
      system.ctx.lineWidth = 2;
      system.ctx.beginPath();
      system.ctx.moveTo(q1End.x, q1End.y);
      system.ctx.lineTo(q1End.x + q2[0] * system.unit * 0.35, q1End.y - q2[1] * system.unit * 0.35);
      system.ctx.stroke();
      system.ctx.restore();
    }
  }

  function mount(root, api) {
    const canvas = root.querySelector("[data-ortho-v2-canvas]");
    const state = { mode: "rotation", step: 0, angle: 38, amount: 0.7 };
    const modeButtons = [...root.querySelectorAll("[data-ortho-mode]")];
    const stepButtons = [...root.querySelectorAll("[data-ortho-step]")];

    function draw() {
      const matrix = matrixFor(api, state);
      const transpose = api.transpose(matrix);
      const gram = api.matMul(transpose, matrix);
      const error = Math.max(Math.abs(gram[0] - 1), Math.abs(gram[1]), Math.abs(gram[2]), Math.abs(gram[3] - 1));
      const q1 = [matrix[0], matrix[2]];
      const q2 = [matrix[1], matrix[3]];
      const n1 = api.norm(q1);
      const n2 = api.norm(q2);
      const pass = error < 1e-7;
      api.setPressed(modeButtons, (button) => button.dataset.orthoMode === state.mode);
      api.setPressed(stepButtons, (button) => Number(button.dataset.orthoStep) === state.step);
      root.querySelectorAll("[data-v2-path-step]").forEach((item, index) => item.classList.toggle("is-active", index <= state.step));
      root.querySelector('[data-v2-range="angle"]').value = String(state.angle);
      root.querySelector('[data-v2-range="amount"]').value = String(state.amount);
      api.update(root, "angle", `${api.format(state.angle, 0)}°`);
      api.update(root, "amount", api.format(state.amount, 2));
      api.update(root, "det", api.format(api.determinant(matrix), 3));
      api.update(root, "error", api.format(error, 5));
      api.update(root, "columnDot", api.format(api.dot(q1, q2), 5));
      api.update(root, "columnNorms", `${api.format(n1, 3)} / ${api.format(n2, 3)}`);
      drawShape(root, canvas, api, matrix, state.step);

      const badge = root.querySelector("[data-ortho-badge]");
      badge.className = `ch9v2-stage-badge ${pass ? "is-pass" : "is-fail"}`;
      badge.textContent = pass ? (api.determinant(matrix) > 0 ? "正交 · 保持定向" : "正交 · 翻转定向") : "非正交 · 发生形变";
      const formula = root.querySelector("[data-ortho-formula]");
      const matrixTex = `\\begin{bmatrix}${api.format(matrix[0], 2)}&${api.format(matrix[1], 2)}\\\\${api.format(matrix[2], 2)}&${api.format(matrix[3], 2)}\\end{bmatrix}`;
      if (state.step === 0) {
        formula.innerHTML = `<span>先用单位圆做整体检查</span>${api.display("\\lVert x\\rVert=1\\Rightarrow\\lVert Qx\\rVert=1")}`;
        api.setText(root, "[data-ortho-stage-kicker]", "图形层");
        api.setText(root, "[data-ortho-stage-title]", "单位圆和三角形是否发生形变");
        api.setText(root, "[data-ortho-caption]", pass ? "单位圆仍是单位圆；三角形只移动或翻转。" : "单位圆已变成椭圆，长度保持在整体上失败。");
      } else if (state.step === 1) {
        formula.innerHTML = `<span>矩阵的两列就是 Qe₁、Qe₂</span>${api.display(`Q=${matrixTex}`)}`;
        api.setText(root, "[data-ortho-stage-kicker]", "基向量层");
        api.setText(root, "[data-ortho-stage-title]", "两列是否仍是一组标准正交基");
        api.setText(root, "[data-ortho-caption]", `列长度为 ${api.format(n1, 2)}、${api.format(n2, 2)}，两列内积为 ${api.format(api.dot(q1, q2), 3)}。`);
      } else {
        formula.innerHTML = `<span>最后用一条矩阵恒等式封口</span>${api.display(`Q^TQ=\\begin{bmatrix}${api.format(gram[0], 2)}&${api.format(gram[1], 2)}\\\\${api.format(gram[2], 2)}&${api.format(gram[3], 2)}\\end{bmatrix}`)}`;
        api.setText(root, "[data-ortho-stage-kicker]", "矩阵层");
        api.setText(root, "[data-ortho-stage-title]", pass ? "QᵀQ=I，全部向量对同时通过" : "QᵀQ≠I，不能称为正交变换");
        api.setText(root, "[data-ortho-caption]", pass ? "逆矩阵就是转置；行列式的正负只区分是否翻转定向。" : "变换虽然可能可逆，但可逆远弱于保持内积。");
      }
      const observation = root.querySelector("[data-ortho-observation]");
      observation.classList.toggle("is-warning", !pass);
      if (pass && api.determinant(matrix) > 0) observation.innerHTML = `<strong>旋转类</strong><p>长度、夹角与定向都保持，det Q=1。</p>`;
      else if (pass) observation.innerHTML = `<strong>镜像类</strong><p>长度与夹角保持，但定向翻转，det Q=−1。</p>`;
      else observation.innerHTML = `<strong>对照失败</strong><p>当前误差为 ${api.format(error, 4)}；单位圆、列长度或列间夹角至少有一项已经改变。</p>`;
    }

    modeButtons.forEach((button) => api.on(button, "click", () => {
      state.mode = button.dataset.orthoMode;
      draw();
    }));
    stepButtons.forEach((button) => api.on(button, "click", () => {
      state.step = Number(button.dataset.orthoStep);
      draw();
    }));
    api.bindRange(root, "angle", (value) => {
      state.angle = value;
      if (!["rotation", "reflection"].includes(state.mode)) state.mode = "rotation";
      draw();
    });
    api.bindRange(root, "amount", (value) => {
      state.amount = value;
      if (["rotation", "reflection"].includes(state.mode)) state.mode = "shear";
      draw();
    });
    api.installRedraw(draw, [canvas]);
  }

  window.Chapter9V2.register(sectionId, { foundation, interactive, mount });
})();
