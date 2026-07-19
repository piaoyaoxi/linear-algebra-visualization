(() => {
  const { display, rad, dot, norm, add, scale, matVec, matMul, transpose, determinant, fmt, palette, setupCanvas, arrow, grid, axes, world, clear, renderFormal, labShell, range, readingRow, setReadout, setOutput, bindRange, bindButtons, activate } = window.Chapter9Native;

  function isometryLab(root) {
    root.innerHTML = labShell({
      title: "坐标是否保留几何",
      description: "左边是真实空间，右边是坐标空间。向量不变，只切换用于读取坐标的基。",
      taskTitle: "比较两边向量是否落在同半径圆上",
      task: "斜基坐标仍然唯一，但坐标列的普通长度不再等于原向量长度。",
      controls: `<div class="ch9-toolbar"><button class="is-active" type="button" data-iso-mode="orthonormal">标准正交基</button><button type="button" data-iso-mode="reflected">镜像标准正交基</button><button type="button" data-iso-mode="skew">一般斜基</button></div><div class="ch9-range-list">${range("basisAngle", "第一基方向", -120, 120, 1, 28, "°")}</div>`,
      body: `<div class="ch9-lab-grid"><div class="ch9-panel"><div class="ch9-stage"><canvas data-iso-canvas aria-label="真实空间和坐标空间的长度比较"></canvas></div></div><div class="ch9-panel"><div class="ch9-reading"><h4>长度比较</h4>${readingRow("原向量长度", "xNorm")}${readingRow("坐标列长度", "cNorm")}${readingRow("长度误差", "error")}</div><div class="ch9-result" data-iso-result><span class="ch9-status" data-iso-status></span><h4 data-iso-title></h4><p data-iso-copy></p></div></div></div>`,
    });
    const canvas = root.querySelector("[data-iso-canvas]");
    const state = { mode: "orthonormal", angle: 28, x: [2.2, 1.45] };
    let paintNow = () => {};
    const [buttons, cleanButtons] = bindButtons(root, "[data-iso-mode]", (button) => {
      state.mode = button.dataset.isoMode;
      activate(buttons, state.mode, "isoMode");
      paintNow();
    });
    const cleanRange = bindRange(root, "basisAngle", (value) => {
      state.angle = value;
      setOutput(root, "basisAngle", `${value}°`);
      paintNow();
    });
    function data() {
      const a = rad(state.angle);
      const e1 = [Math.cos(a), Math.sin(a)];
      const normal = [-Math.sin(a), Math.cos(a)];
      const e2 = state.mode === "skew" ? add(normal, scale(0.72, e1)) : state.mode === "reflected" ? scale(-1, normal) : normal;
      const B = [e1[0], e2[0], e1[1], e2[1]];
      const d = determinant(B);
      const inv = [B[3] / d, -B[1] / d, -B[2] / d, B[0] / d];
      return { e1, e2, coordinates: matVec(inv, state.x), orthonormal: state.mode !== "skew" };
    }
    function paint(ctx, width, height, colors) {
      clear(ctx, width, height);
      const { e1, e2, coordinates, orthonormal } = data();
      const left = [width * 0.25, height * 0.58];
      const right = [width * 0.75, height * 0.58];
      const unit = Math.min(width / 12, height / 5.2);
      ctx.save();
      ctx.strokeStyle = colors.line;
      ctx.beginPath();
      ctx.moveTo(width / 2, 22);
      ctx.lineTo(width / 2, height - 22);
      ctx.stroke();
      ctx.fillStyle = colors.muted;
      ctx.font = "700 12px ui-sans-serif, system-ui";
      ctx.fillText("真实空间 V", 24, 30);
      ctx.fillText("坐标空间 R²", width / 2 + 24, 30);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = colors.strongLine;
      ctx.lineWidth = 1.4;
      for (const [origin, x0, x1] of [[left, 18, width / 2 - 18], [right, width / 2 + 18, width - 18]]) {
        ctx.beginPath();
        ctx.moveTo(x0, origin[1]);
        ctx.lineTo(x1, origin[1]);
        ctx.moveTo(origin[0], height - 18);
        ctx.lineTo(origin[0], 48);
        ctx.stroke();
      }
      ctx.restore();
      const radius = norm(state.x) * unit;
      ctx.save();
      ctx.strokeStyle = colors.strongLine;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(left[0], left[1], radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(right[0], right[1], radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      arrow(ctx, left, world(e1, left, unit), colors.accentStrong, "b₁", { width: 3.2 });
      arrow(ctx, left, world(e2, left, unit), colors.coral, "b₂", { width: 3.2 });
      arrow(ctx, left, world(state.x, left, unit), colors.text, "x", { width: 4.5 });
      arrow(ctx, right, world(coordinates, right, unit), colors.text, "[x]ᵦ", { width: 4.5 });
      const xNorm = norm(state.x);
      const cNorm = norm(coordinates);
      const error = Math.abs(xNorm - cNorm);
      setReadout(root, "xNorm", fmt(xNorm, 3));
      setReadout(root, "cNorm", fmt(cNorm, 3));
      setReadout(root, "error", fmt(error, 4));
      const result = root.querySelector("[data-iso-result]");
      const status = root.querySelector("[data-iso-status]");
      if (orthonormal) {
        result.className = "ch9-result is-success";
        status.className = "ch9-status is-ok";
        status.textContent = state.mode === "reflected" ? "等距 · 翻转定向" : "等距";
        root.querySelector("[data-iso-title]").textContent = "两边落在同半径圆上";
        root.querySelector("[data-iso-copy]").textContent = "标准正交坐标完整保留原向量长度。";
      } else {
        result.className = "ch9-result is-warning";
        status.className = "ch9-status is-warn";
        status.textContent = "仅线性同构";
        root.querySelector("[data-iso-title]").textContent = "坐标唯一，但已经不等距";
        root.querySelector("[data-iso-copy]").textContent = `坐标长度与真实长度相差 ${fmt(error, 3)}。`;
      }
    }
    const cleanCanvas = setupCanvas(canvas, paint);
    paintNow = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(ctx, rect.width, rect.height, palette());
    };
    return [cleanCanvas, cleanButtons, cleanRange];
  }

  function transformMatrix(mode, angle, amount) {
    const c = Math.cos(rad(angle));
    const s = Math.sin(rad(angle));
    if (mode === "rotation") return [c, -s, s, c];
    if (mode === "reflection") return [c, s, s, -c];
    if (mode === "stretch") return [1 + amount * 0.65, 0, 0, 1 - amount * 0.42];
    return [1, amount, 0, 1];
  }

  function orthogonalLab(root) {
    root.innerHTML = labShell({
      title: "单位圆形变检验",
      description: "同一张浅色网格接受四种变换。虚线是原单位圆，实线是当前像。",
      taskTitle: "先看圆，再看矩阵证书",
      task: "旋转与镜像只改变位置或定向；伸缩与剪切会把圆变成椭圆或斜椭圆。",
      controls: `<div class="ch9-toolbar"><button class="is-active" type="button" data-ortho-mode="rotation">旋转</button><button type="button" data-ortho-mode="reflection">镜像</button><button type="button" data-ortho-mode="stretch">伸缩</button><button type="button" data-ortho-mode="shear">剪切</button></div><div class="ch9-range-list">${range("progress", "变换进度", 0, 1, 0.01, 1)}${range("angle", "旋转/镜像方向", -180, 180, 1, 35, "°")}${range("amount", "形变强度", -1.2, 1.2, 0.05, 0.7)}</div>`,
      body: `<div class="ch9-lab-grid"><div class="ch9-panel"><div class="ch9-stage"><canvas data-ortho-canvas aria-label="正交与非正交变换对单位圆的作用"></canvas></div><div class="ch9-equation" data-ortho-equation></div></div><div class="ch9-panel"><div class="ch9-reading"><h4>矩阵证书</h4>${readingRow("det Q", "det")}${readingRow("两列内积", "columnDot")}${readingRow("QᵀQ 与 I 的误差", "error")}</div><div class="ch9-result" data-ortho-result><span class="ch9-status" data-ortho-status></span><h4 data-ortho-title></h4><p data-ortho-copy></p></div></div></div>`,
    });
    const canvas = root.querySelector("[data-ortho-canvas]");
    const state = { mode: "rotation", progress: 1, angle: 35, amount: 0.7 };
    let paintNow = () => {};
    const [buttons, cleanButtons] = bindButtons(root, "[data-ortho-mode]", (button) => {
      state.mode = button.dataset.orthoMode;
      activate(buttons, state.mode, "orthoMode");
      paintNow();
    });
    const cleans = [
      bindRange(root, "progress", (v) => { state.progress = v; setOutput(root, "progress", fmt(v, 2)); paintNow(); }),
      bindRange(root, "angle", (v) => { state.angle = v; setOutput(root, "angle", `${fmt(v, 0)}°`); paintNow(); }),
      bindRange(root, "amount", (v) => { state.amount = v; setOutput(root, "amount", fmt(v, 2)); paintNow(); }),
    ];
    function paint(ctx, width, height, colors) {
      clear(ctx, width, height);
      grid(ctx, width, height, colors, Math.max(38, width / 12));
      const origin = [width * 0.42, height * 0.58];
      const unit = Math.min(width / 6.8, height / 3.4);
      axes(ctx, origin, width, height, colors);
      const target = transformMatrix(state.mode, state.angle, state.amount);
      const p = state.progress;
      const m = [1 + (target[0] - 1) * p, target[1] * p, target[2] * p, 1 + (target[3] - 1) * p];
      ctx.save();
      ctx.strokeStyle = colors.strongLine;
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(origin[0], origin[1], unit, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = colors.accentStrong;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= 160; i += 1) {
        const a = (Math.PI * 2 * i) / 160;
        const point = world(matVec(m, [Math.cos(a), Math.sin(a)]), origin, unit);
        if (i === 0) ctx.moveTo(point[0], point[1]); else ctx.lineTo(point[0], point[1]);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      const q1 = matVec(m, [1, 0]);
      const q2 = matVec(m, [0, 1]);
      arrow(ctx, origin, world(q1, origin, unit), colors.accentStrong, "Qe₁", { width: 3.5, labelY: 18 });
      arrow(ctx, origin, world(q2, origin, unit), colors.coral, "Qe₂", { width: 3.5 });
      const gram = matMul(transpose(m), m);
      const error = Math.max(Math.abs(gram[0] - 1), Math.abs(gram[1]), Math.abs(gram[2]), Math.abs(gram[3] - 1));
      const pass = error < 0.015;
      setReadout(root, "det", fmt(determinant(m), 3));
      setReadout(root, "columnDot", fmt(dot(q1, q2), 5));
      setReadout(root, "error", fmt(error, 5));
      root.querySelector("[data-ortho-equation]").innerHTML = display(pass ? "Q^TQ=I" : "Q^TQ\\ne I");
      const result = root.querySelector("[data-ortho-result]");
      const status = root.querySelector("[data-ortho-status]");
      result.className = pass ? "ch9-result is-success" : "ch9-result is-warning";
      status.className = pass ? "ch9-status is-ok" : "ch9-status is-warn";
      status.textContent = pass ? "正交变换" : "发生形变";
      root.querySelector("[data-ortho-title]").textContent = pass ? (determinant(m) < 0 ? "长度保持，定向翻转" : "长度和定向都保持") : "单位圆已经不再是圆";
      root.querySelector("[data-ortho-copy]").textContent = pass ? "矩阵两列长度为 1 且彼此正交。" : "至少有一批方向的长度或夹角发生改变。";
    }
    const cleanCanvas = setupCanvas(canvas, paint);
    paintNow = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(ctx, rect.width, rect.height, palette());
    };
    return [cleanCanvas, cleanButtons, ...cleans];
  }

  window.defineChapter9Renderer?.("euclidean-isomorphism", { formal: renderFormal, interactive: isometryLab });
  window.defineChapter9Renderer?.("orthogonal-transformations", { formal: renderFormal, interactive: orthogonalLab });
})();
