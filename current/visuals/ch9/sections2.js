(() => {
  const {
    display, rad, dot, norm, add, scale, matVec, matMul, transpose, determinant,
    fmt, setupCanvas, repaintCanvas, arrow, grid, axes, world, clear, renderFormal,
    labHeading, observation, range, bindRange, bindButtons, activate, setOutput,
  } = window.Chapter9Native;

  function basisData(mode, angle) {
    const a = rad(angle);
    const b1 = [Math.cos(a), Math.sin(a)];
    const normal = [-Math.sin(a), Math.cos(a)];
    const b2 = mode === "skew" ? add(normal, scale(.72, b1)) : mode === "reflected" ? scale(-1, normal) : normal;
    const B = [b1[0], b2[0], b1[1], b2[1]];
    const d = determinant(B);
    const inverse = [B[3] / d, -B[1] / d, -B[2] / d, B[0] / d];
    return { b1, b2, B, inverse, orthonormal: mode !== "skew" };
  }

  function isometryLab(root) {
    root.innerHTML = `<h2>交互实验</h2><section class="ch9-iso-lab" data-ch9-lab data-lab-kind="isometry">
      ${labHeading("§3 · 坐标映射桥", "坐标唯一，还要检查几何是否被保留", "左边的 x、y 是空间中的真实向量；右边是它们在基 B 下的坐标列。桥上的 ΦB 只负责换语言，长度与内积是否保持取决于 B。")}
      <div class="ch9-iso-controls">
        <div class="ch9-toolbar" role="group" aria-label="坐标基类型">
          <button type="button" class="is-active" data-iso-mode="orthonormal">旋转标准正交基</button>
          <button type="button" data-iso-mode="reflected">镜像标准正交基</button>
          <button type="button" data-iso-mode="skew">一般斜基</button>
        </div>
        <div class="ch9-range-list">${range("basisAngle", "基 b₁ 的方向", -80, 80, 1, 28, "°")}</div>
      </div>
      <div class="ch9-iso-scene">
        <div class="ch9-iso-stage">
          <div class="ch9-stage ch9-iso-pane"><div class="ch9-stage-top"><strong>欧氏空间 V</strong><span>基向量与真实向量</span></div><canvas data-iso-real aria-label="欧氏空间中的向量和所选基"></canvas></div>
          <div class="ch9-map-bridge" aria-label="坐标映射"><strong>Φ<sub>B</sub></strong><i></i><span>取坐标</span></div>
          <div class="ch9-stage ch9-iso-pane"><div class="ch9-stage-top"><strong>坐标空间 R²</strong><span>坐标列使用普通点积</span></div><canvas data-iso-coordinate aria-label="坐标空间中的坐标向量"></canvas></div>
        </div>
      </div>
      <div class="ch9-iso-footer">
        <div class="ch9-metric-strip"><div><span>‖x‖ / ‖[x]B‖</span><strong data-iso-norms></strong></div><div><span>〈x,y〉 / [x]B·[y]B</span><strong data-iso-dots></strong></div><div><span>度量矩阵 G</span><strong data-iso-metric></strong></div></div>
        <div class="ch9-conclusion" data-iso-conclusion><strong data-iso-title></strong><p data-iso-copy></p></div>
      </div>
    </section>`;

    const realCanvas = root.querySelector("[data-iso-real]");
    const coordinateCanvas = root.querySelector("[data-iso-coordinate]");
    const state = { mode: "orthonormal", angle: 28, x: [2.1, 1.15], y: [-.45, 2.0] };

    function vectors() {
      const b = basisData(state.mode, state.angle);
      return { ...b, cx: matVec(b.inverse, state.x), cy: matVec(b.inverse, state.y) };
    }

    function baseScene(ctx, width, height, colors) {
      clear(ctx, width, height);
      grid(ctx, width, height, colors, Math.max(42, width / 9));
      const origin = [width * .49, height * .61];
      axes(ctx, origin, width, height, colors);
      return { origin, unit: Math.min(width / 6.6, height / 4.4) };
    }

    function paintReal(ctx, width, height, colors) {
      const { origin, unit } = baseScene(ctx, width, height, colors);
      const d = vectors();
      arrow(ctx, origin, world(scale(1.35, d.b1), origin, unit), colors.accentStrong, "b₁", { width: 3 });
      arrow(ctx, origin, world(scale(1.35, d.b2), origin, unit), colors.coral, "b₂", { width: 3 });
      arrow(ctx, origin, world(state.x, origin, unit), colors.text, "x", { width: 4.2 });
      arrow(ctx, origin, world(state.y, origin, unit), colors.accentStrong, "y", { width: 4.2, labelY: 18 });
    }

    function paintCoordinate(ctx, width, height, colors) {
      const { origin, unit } = baseScene(ctx, width, height, colors);
      const d = vectors();
      arrow(ctx, origin, world(d.cx, origin, unit), colors.text, "[x]B", { width: 4.2 });
      arrow(ctx, origin, world(d.cy, origin, unit), colors.accentStrong, "[y]B", { width: 4.2, labelY: 18 });
      ctx.save();
      ctx.strokeStyle = colors.strongLine;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(origin[0], origin[1], norm(state.x) * unit, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const realNorm = norm(state.x);
      const coordinateNorm = norm(d.cx);
      const realDot = dot(state.x, state.y);
      const coordinateDot = dot(d.cx, d.cy);
      root.querySelector("[data-iso-norms]").textContent = `${fmt(realNorm, 2)} / ${fmt(coordinateNorm, 2)}`;
      root.querySelector("[data-iso-dots]").textContent = `${fmt(realDot, 2)} / ${fmt(coordinateDot, 2)}`;
      root.querySelector("[data-iso-metric]").textContent = d.orthonormal ? "I" : "BᵀB ≠ I";
      const box = root.querySelector("[data-iso-conclusion]");
      box.classList.toggle("is-warning", !d.orthonormal);
      if (d.orthonormal) {
        root.querySelector("[data-iso-title]").textContent = state.mode === "reflected" ? "坐标翻转定向，几何量仍全部保持" : "标准正交坐标建立等距同构";
        root.querySelector("[data-iso-copy]").textContent = "长度和内积两项同时相等，因此距离、夹角与正交也随之保持。";
      } else {
        root.querySelector("[data-iso-title]").textContent = "坐标仍唯一，但普通点积已经读错几何";
        root.querySelector("[data-iso-copy]").textContent = "斜基坐标需要度量矩阵 G=BᵀB 才能恢复真实内积。";
      }
    }

    const cleanReal = setupCanvas(realCanvas, paintReal);
    const cleanCoordinate = setupCanvas(coordinateCanvas, paintCoordinate);
    const repaint = () => { repaintCanvas(realCanvas, paintReal); repaintCanvas(coordinateCanvas, paintCoordinate); };
    const [buttons, cleanButtons] = bindButtons(root, "[data-iso-mode]", (button) => {
      state.mode = button.dataset.isoMode;
      activate(buttons, state.mode, "isoMode");
      repaint();
    });
    activate(buttons, state.mode, "isoMode");
    const cleanRange = bindRange(root, "basisAngle", (value) => {
      state.angle = value;
      setOutput(root, "basisAngle", `${fmt(value, 0)}°`);
      repaint();
    });
    return [cleanReal, cleanCoordinate, cleanButtons, cleanRange];
  }

  function transformMatrix(mode, angle, amount) {
    const c = Math.cos(rad(angle));
    const s = Math.sin(rad(angle));
    if (mode === "rotation") return [c, -s, s, c];
    if (mode === "reflection") return [Math.cos(2 * rad(angle)), Math.sin(2 * rad(angle)), Math.sin(2 * rad(angle)), -Math.cos(2 * rad(angle))];
    if (mode === "stretch") return [1 + amount * .68, 0, 0, 1 - amount * .38];
    return [1, amount, 0, 1];
  }

  function orthogonalLab(root) {
    root.innerHTML = `<h2>交互实验</h2><section class="ch9-ortho-lab" data-ch9-lab data-lab-kind="orthogonal-transform">
      ${labHeading("§4 · 三层证据", "正交变换只移动或翻转，不让图形变形", "舞台同时放入单位圆和一个带直角标记的小旗。先用眼睛判断形状，再用矩阵两列和 QᵀQ 验证。")}
      <div class="ch9-ortho-controls">
        <div class="ch9-toolbar" role="group" aria-label="线性变换类型">
          <button type="button" class="is-active" data-ortho-mode="rotation">旋转</button>
          <button type="button" data-ortho-mode="reflection">镜像</button>
          <button type="button" data-ortho-mode="stretch">伸缩反例</button>
          <button type="button" data-ortho-mode="shear">剪切反例</button>
        </div>
        <div class="ch9-range-list"><div data-direction-control>${range("direction", "旋转/镜像方向", -180, 180, 1, 35, "°")}</div><div data-shape-control hidden>${range("shape", "形变强度", .15, 1.2, .05, .7)}</div></div>
      </div>
      <div class="ch9-ortho-body">
        <div class="ch9-stage"><div class="ch9-stage-top"><strong>虚线原图与实线像</strong><span>圆、直角与两条基向量同时接受 Q</span></div><canvas data-ortho-canvas aria-label="正交和非正交变换对单位圆与直角标记的作用"></canvas></div>
        <aside class="ch9-certificate-stack">
          <div class="ch9-certificate" data-cert="shape"><span>图形证据</span><strong data-shape-proof></strong></div>
          <div class="ch9-certificate" data-cert="columns"><span>列向量证据</span><strong data-column-proof></strong></div>
          <div class="ch9-certificate" data-cert="matrix"><span>矩阵证书</span><strong data-matrix-proof></strong></div>
          <div class="ch9-equation" data-ortho-equation></div>
          <div class="ch9-conclusion" data-ortho-conclusion><strong data-ortho-title></strong><p data-ortho-copy></p></div>
        </aside>
      </div>
    </section>`;

    const canvas = root.querySelector("[data-ortho-canvas]");
    const state = { mode: "rotation", direction: 35, shape: .7 };

    function paint(ctx, width, height, colors) {
      clear(ctx, width, height);
      grid(ctx, width, height, colors, Math.max(44, width / 14));
      const origin = [width * .48, height * .57];
      const unit = Math.min(width / 7.4, height / 4.2);
      axes(ctx, origin, width, height, colors);
      const m = transformMatrix(state.mode, state.direction, state.shape);
      const q1 = matVec(m, [1, 0]);
      const q2 = matVec(m, [0, 1]);
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
      for (let i = 0; i <= 180; i += 1) {
        const a = Math.PI * 2 * i / 180;
        const p = world(matVec(m, [Math.cos(a), Math.sin(a)]), origin, unit);
        if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
      }
      ctx.closePath();
      ctx.stroke();
      const flag = [[0, 0], [1.35, 0], [1.35, .78], [.28, .78], [.28, .28], [0, .28]];
      ctx.strokeStyle = colors.coral;
      ctx.lineWidth = 3;
      ctx.beginPath();
      flag.forEach((p, i) => { const s = world(matVec(m, p), origin, unit); if (!i) ctx.moveTo(s[0], s[1]); else ctx.lineTo(s[0], s[1]); });
      ctx.stroke();
      ctx.restore();
      arrow(ctx, origin, world(q1, origin, unit), colors.accentStrong, "Qe₁", { width: 4 });
      arrow(ctx, origin, world(q2, origin, unit), colors.coral, "Qe₂", { width: 4 });

      const gram = matMul(transpose(m), m);
      const error = Math.max(Math.abs(gram[0] - 1), Math.abs(gram[1]), Math.abs(gram[2]), Math.abs(gram[3] - 1));
      const pass = error < .001;
      root.querySelector("[data-shape-proof]").textContent = pass ? "单位圆仍是圆，直角仍是直角" : "单位圆或直角已经变形";
      root.querySelector("[data-column-proof]").textContent = `‖q₁‖=${fmt(norm(q1), 2)}，‖q₂‖=${fmt(norm(q2), 2)}，q₁·q₂=${fmt(dot(q1, q2), 2)}`;
      root.querySelector("[data-matrix-proof]").textContent = pass ? `QᵀQ=I，det Q=${fmt(determinant(m), 0)}` : `‖QᵀQ−I‖∞=${fmt(error, 3)}`;
      root.querySelectorAll("[data-cert]").forEach((node) => { node.classList.toggle("is-pass", pass); node.classList.toggle("is-fail", !pass); });
      root.querySelector("[data-ortho-equation]").innerHTML = display(pass ? "Q^TQ=I\\;\\Longleftrightarrow\\;\\langle Qx,Qy\\rangle=\\langle x,y\\rangle" : "Q^TQ\\ne I\\;\\Longrightarrow\\;\\text{某些长度或夹角改变}");
      const box = root.querySelector("[data-ortho-conclusion]");
      box.classList.toggle("is-warning", !pass);
      root.querySelector("[data-ortho-title]").textContent = pass ? (determinant(m) < 0 ? "镜像翻转定向，同时保持全部距离" : "旋转保持定向与全部距离") : "这个变换包含形变，正交条件不成立";
      root.querySelector("[data-ortho-copy]").textContent = pass ? "单位圆、标准正交列与 QᵀQ=I 给出同一个结论。" : "图形证据和矩阵证书同时失败，可以定位长度或夹角的变化。";
    }

    const cleanupCanvas = setupCanvas(canvas, paint);
    const repaint = () => repaintCanvas(canvas, paint);
    const [buttons, cleanupButtons] = bindButtons(root, "[data-ortho-mode]", (button) => {
      state.mode = button.dataset.orthoMode;
      activate(buttons, state.mode, "orthoMode");
      root.querySelector("[data-direction-control]").hidden = !["rotation", "reflection"].includes(state.mode);
      root.querySelector("[data-shape-control]").hidden = ["rotation", "reflection"].includes(state.mode);
      repaint();
    });
    activate(buttons, state.mode, "orthoMode");
    const cleanupDirection = bindRange(root, "direction", (value) => { state.direction = value; setOutput(root, "direction", `${fmt(value, 0)}°`); repaint(); });
    const cleanupShape = bindRange(root, "shape", (value) => { state.shape = value; setOutput(root, "shape", fmt(value, 2)); repaint(); });
    return [cleanupCanvas, cleanupButtons, cleanupDirection, cleanupShape];
  }

  window.defineChapter9Renderer?.("euclidean-isomorphism", { formal: renderFormal, interactive: isometryLab });
  window.defineChapter9Renderer?.("orthogonal-transformations", { formal: renderFormal, interactive: orthogonalLab });
})();
