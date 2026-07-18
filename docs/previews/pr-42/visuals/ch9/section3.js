(() => {
  const sectionId = "euclidean-isomorphism";

  function foundation(api) {
    const i = api.inline;
    const d = api.display;
    return `
      ${api.foundationIntro(
        "同维还不够",
        "线性同构保存运算，欧氏同构还保存测量",
        `可逆剪切也能把一个二维空间线性地对应到另一个二维空间，但它会改变长度和夹角。欧氏同构需要更强的条件：${i("\\langle Tx,Ty\\rangle=\\langle x,y\\rangle")}。`,
      )}
      <div class="ch9v2-foundation">
        ${api.module(
          "01",
          "两道不同的结构闸门",
          "先问能否还原，再问几何是否原样保留。",
          `<div class="ch9v2-gate-pair">
            <article><span>线性同构</span><strong>线性 + 双射</strong><p>保持加法、数乘与线性关系。</p></article>
            <div class="ch9v2-gate-plus">+</div>
            <article class="is-accent"><span>欧氏同构</span><strong>再保持内积</strong><p>长度、距离、夹角和正交自动全部保持。</p></article>
          </div>`,
          "is-compact",
        )}
        ${api.module(
          "02",
          "标准正交基天然给出等距坐标",
          "坐标不是随便排成一列，而是沿标准正交方向的投影。",
          `<div class="ch9v2-coordinate-bridge">
            <div class="ch9v2-bridge-space"><span>抽象欧几里得空间 V</span>${d("x=\\sum_i\\langle x,e_i\\rangle e_i")}</div>
            <div class="ch9v2-bridge-arrow"><b>Φ</b><small>保持内积</small></div>
            <div class="ch9v2-bridge-space"><span>标准坐标空间</span>${d("\\Phi(x)=\\begin{bmatrix}\\langle x,e_1\\rangle\\\\\\vdots\\\\\\langle x,e_n\\rangle\\end{bmatrix}")}</div>
          </div>`,
        )}
        ${api.module(
          "03",
          "为什么坐标长度没有变",
          "Parseval 等式就是等距性的数值证书。",
          `<div class="ch9v2-theorem-band">${d("\\lVert\\Phi(x)\\rVert^2=\\sum_i|\\langle x,e_i\\rangle|^2=\\lVert x\\rVert^2")}<p>同样地，${i("\\langle\\Phi(x),\\Phi(y)\\rangle=\\langle x,y\\rangle")}。因此同维有限维欧几里得空间可以通过标准正交基彼此等距对应。</p></div>`,
        )}
        ${api.module(
          "04",
          "斜基坐标为什么不能冒充等距坐标",
          "它仍是合法坐标，但坐标列的普通长度不再代表原向量长度。",
          `<div class="ch9v2-warning-comparison">
            <div><strong>标准正交基</strong><span>${i("c_i=\\langle x,e_i\\rangle")}</span><p>${i("\\lVert c\\rVert=\\lVert x\\rVert")}</p></div>
            <div><strong>一般斜基</strong><span>${i("x=Bc")}</span><p>通常 ${i("\\lVert c\\rVert\\ne\\lVert x\\rVert")}</p></div>
          </div>`,
          "is-compact",
        )}
      </div>`;
  }

  function interactive(api) {
    return api.labShell({
      kicker: "交互实验 · 坐标也有几何质量",
      title: "同一个向量，放进标准正交基与斜基会发生什么",
      intro: "左边固定真实向量 x，右边画出它的坐标列。标准正交基下两边长度相同；斜基仍能表示 x，但坐标长度失去几何意义。",
      steps: ["选择坐标基", "读取坐标", "检查等距"],
      body: `
        <div class="ch9v2-workbench ch9v2-isomorphism-lab">
          <figure class="ch9v2-stage-card">
            <div class="ch9v2-stage-toolbar">
              <div><span data-iso-stage-kicker>真实空间</span><strong data-iso-stage-title>同一个向量 x 不动，只改变坐标基</strong></div>
              <div class="ch9v2-legend"><span><i class="is-blue"></i>第一基向量</span><span><i class="is-coral"></i>第二基向量</span><span><i class="is-accent"></i>x 与坐标 Φ(x)</span></div>
            </div>
            <div class="ch9v2-dual-canvas">
              <div><strong>V 中的向量</strong><canvas data-iso-physical tabindex="0" aria-label="真实空间中的向量和所选基"></canvas></div>
              <div><strong>坐标空间中的列向量</strong><canvas data-iso-coordinate aria-label="向量在所选基下的坐标"></canvas></div>
            </div>
            <figcaption data-iso-caption>拖动左边的 x；右边坐标立即更新。</figcaption>
          </figure>
          <aside class="ch9v2-panel">
            <div class="ch9v2-control-block">
              <div class="ch9v2-control-heading"><strong>坐标基</strong><small>三种基都线性无关，但只有前两种标准正交</small></div>
              <div class="ch9v2-choice-cards">
                <button type="button" class="is-active" data-iso-mode="rotated"><span>标准正交</span><strong>旋转基</strong><small>长度与夹角保持</small></button>
                <button type="button" data-iso-mode="reflected"><span>标准正交</span><strong>镜像基</strong><small>长度保持，定向翻转</small></button>
                <button type="button" data-iso-mode="skew"><span>一般基</span><strong>斜基</strong><small>坐标合法但不等距</small></button>
              </div>
              ${api.range("basisAngle", "第一基方向", -160, 160, 1, 32, "°")}
              ${api.range("skew", "第二方向倾斜量", -1.2, 1.2, 0.05, 0.75)}
            </div>
            <div class="ch9v2-formula-story" data-iso-formula></div>
            <div class="ch9v2-metric-grid">
              ${api.metric("‖x‖", "xNorm")}
              ${api.metric("‖坐标列‖", "cNorm")}
              ${api.metric("长度误差", "normError")}
              ${api.metric("基向量内积", "basisDot")}
            </div>
            <div class="ch9v2-observation" data-iso-observation aria-live="polite"></div>
          </aside>
        </div>`,
    });
  }

  function inverse2(api, matrix) {
    const det = api.determinant(matrix);
    if (Math.abs(det) < 1e-8) return null;
    return [matrix[3] / det, -matrix[1] / det, -matrix[2] / det, matrix[0] / det];
  }

  function basisFor(api, state) {
    const angle = api.radians(state.basisAngle);
    const e1 = [Math.cos(angle), Math.sin(angle)];
    if (state.mode === "reflected") {
      const e2 = [Math.sin(angle), -Math.cos(angle)];
      return { e1, e2, orthonormal: true };
    }
    if (state.mode === "skew") {
      const normal = [-Math.sin(angle), Math.cos(angle)];
      const e2 = api.add(normal, api.scale(state.skew, e1));
      return { e1, e2, orthonormal: false };
    }
    const e2 = [-Math.sin(angle), Math.cos(angle)];
    return { e1, e2, orthonormal: true };
  }

  function mount(root, api) {
    const physical = root.querySelector("[data-iso-physical]");
    const coordinate = root.querySelector("[data-iso-coordinate]");
    const state = { mode: "rotated", basisAngle: 32, skew: 0.75, x: [2.4, 1.55] };
    const modeButtons = [...root.querySelectorAll("[data-iso-mode]")];
    let dragging = false;

    function drawPhysical(basis) {
      const system = api.plane(physical, 3.8, 14);
      api.drawGrid(system);
      const p = api.palette();
      const reach = 4.2;
      for (const [vector, color] of [[basis.e1, p.blue], [basis.e2, p.coral]]) {
        const a = system.toScreen(api.scale(-reach, vector));
        const b = system.toScreen(api.scale(reach, vector));
        system.ctx.save();
        system.ctx.strokeStyle = color;
        system.ctx.globalAlpha = 0.17;
        system.ctx.lineWidth = 2;
        system.ctx.beginPath(); system.ctx.moveTo(a.x, a.y); system.ctx.lineTo(b.x, b.y); system.ctx.stroke();
        system.ctx.restore();
      }
      api.drawArrow(system.ctx, system.origin, system.toScreen(basis.e1), p.blue, "b₁", { width: 4, labelDy: 18 });
      api.drawArrow(system.ctx, system.origin, system.toScreen(basis.e2), p.coral, "b₂", { width: 4, labelDy: 18 });
      api.drawArrow(system.ctx, system.origin, system.toScreen(state.x), p.accentStrong, "x", { width: 5 });
      api.drawPoint(system.ctx, system.toScreen(state.x), p.accentStrong, 5.5);
    }

    function drawCoordinate(coords) {
      const system = api.plane(coordinate, 3.8, 14);
      api.drawGrid(system);
      const p = api.palette();
      api.drawArrow(system.ctx, system.origin, system.toScreen([1, 0]), p.blue, "c₁", { width: 3.5, alpha: 0.7, labelDy: 18 });
      api.drawArrow(system.ctx, system.origin, system.toScreen([0, 1]), p.coral, "c₂", { width: 3.5, alpha: 0.7 });
      api.drawArrow(system.ctx, system.origin, system.toScreen(coords), p.accentStrong, "Φ(x)", { width: 5 });
      api.drawPoint(system.ctx, system.toScreen(coords), p.accentStrong, 5.5);
      system.ctx.save();
      system.ctx.strokeStyle = p.faint;
      system.ctx.lineWidth = 2;
      system.ctx.setLineDash([5, 5]);
      const point = system.toScreen(coords);
      const xFoot = system.toScreen([coords[0], 0]);
      const yFoot = system.toScreen([0, coords[1]]);
      system.ctx.beginPath(); system.ctx.moveTo(point.x, point.y); system.ctx.lineTo(xFoot.x, xFoot.y); system.ctx.stroke();
      system.ctx.beginPath(); system.ctx.moveTo(point.x, point.y); system.ctx.lineTo(yFoot.x, yFoot.y); system.ctx.stroke();
      system.ctx.restore();
    }

    function draw() {
      const basis = basisFor(api, state);
      const matrix = [basis.e1[0], basis.e2[0], basis.e1[1], basis.e2[1]];
      const inverse = inverse2(api, matrix);
      const coords = api.matVec(inverse, state.x);
      const xNorm = api.norm(state.x);
      const cNorm = api.norm(coords);
      const basisDot = api.dot(basis.e1, basis.e2);
      const normError = Math.abs(xNorm - cNorm);
      api.setPressed(modeButtons, (button) => button.dataset.isoMode === state.mode);
      root.querySelector('[data-v2-range="basisAngle"]').value = String(state.basisAngle);
      root.querySelector('[data-v2-range="skew"]').value = String(state.skew);
      api.update(root, "basisAngle", `${api.format(state.basisAngle, 0)}°`);
      api.update(root, "skew", api.format(state.skew, 2));
      api.update(root, "xNorm", api.format(xNorm, 3));
      api.update(root, "cNorm", api.format(cNorm, 3));
      api.update(root, "normError", api.format(normError, 4));
      api.update(root, "basisDot", api.format(basisDot, 4));
      drawPhysical(basis);
      drawCoordinate(coords);

      const formula = root.querySelector("[data-iso-formula]");
      const coordinateFormula = `\\Phi(x)=\\begin{bmatrix}${api.format(coords[0], 2)}\\\\${api.format(coords[1], 2)}\\end{bmatrix}`;
      if (basis.orthonormal) {
        formula.innerHTML = `<span>标准正交坐标直接由内积读取</span>${api.display(`${coordinateFormula}=\\begin{bmatrix}\\langle x,b_1\\rangle\\\\\\langle x,b_2\\rangle\\end{bmatrix}`)}`;
      } else {
        formula.innerHTML = `<span>斜基坐标必须解 Bc=x</span>${api.display(`${coordinateFormula},\\qquad x=B\\Phi(x)`)}`;
      }
      const observation = root.querySelector("[data-iso-observation]");
      observation.classList.toggle("is-warning", !basis.orthonormal);
      if (basis.orthonormal && state.mode === "reflected") observation.innerHTML = `<strong>等距但翻转定向</strong><p>两条基向量仍标准正交，所以长度与夹角保持；基的排列方向被镜像翻转。</p>`;
      else if (basis.orthonormal) observation.innerHTML = `<strong>等距坐标通过</strong><p>基向量内积为 0，坐标列长度与 x 的长度一致；这就是标准正交坐标映射。</p>`;
      else observation.innerHTML = `<strong>这里只是线性坐标</strong><p>斜基仍能唯一表示 x，但坐标列的普通长度与真实长度相差 ${api.format(normError, 3)}，不能把它当作欧氏同构。</p>`;
    }

    modeButtons.forEach((button) => api.on(button, "click", () => {
      state.mode = button.dataset.isoMode;
      draw();
    }));
    api.bindRange(root, "basisAngle", (value) => {
      state.basisAngle = value;
      draw();
    });
    api.bindRange(root, "skew", (value) => {
      state.skew = value;
      if (state.mode !== "skew") state.mode = "skew";
      draw();
    });
    api.on(physical, "pointerdown", (event) => {
      dragging = true;
      physical.setPointerCapture(event.pointerId);
    });
    api.on(physical, "pointermove", (event) => {
      if (!dragging) return;
      const system = api.plane(physical, 3.8, 14);
      state.x = system.toWorld(api.pointer(event, physical)).map((value) => api.clamp(value, -3.4, 3.4));
      draw();
    });
    api.on(physical, "pointerup", (event) => {
      dragging = false;
      if (physical.hasPointerCapture(event.pointerId)) physical.releasePointerCapture(event.pointerId);
    });
    api.installRedraw(draw, [physical, coordinate]);
  }

  window.Chapter9V2.register(sectionId, { foundation, interactive, mount });
})();
