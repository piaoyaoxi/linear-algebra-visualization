(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "对称矩阵", A: [[2, 1], [1, 2]] },
      { name: "剪切", A: [[1, 1], [0, 1]] },
      { name: "反射", A: [[1, 0], [0, -1]] },
      { name: "90°旋转", A: [[0, -1], [1, 0]] },
    ];
    const modes = [
      { value: "line", label: "一维候选 W" },
      { value: "whole", label: "整个空间 V" },
      { value: "zero", label: "零子空间 {0}" },
    ];
    const state = { preset: 0, mode: "line", angle: 20 };
    const shell = S.createStory(section, lesson, {
      title: "比较整个 W 与整个 T(W)，而不是盯住一支幸运箭头",
      description: "拖动候选子空间的方向。青绿色带表示 W，紫色带表示它经过 T 后形成的整个集合 T(W)。只有二者仍落在同一条带中，W 才不变。",
    });
    shell.toolbar.innerHTML = `${S.buttons(presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset")}${S.buttons(modes, state.mode, "mode")}`;
    const cleanupRange = S.mountRanges(shell.controls, [{ label: "候选方向 θ", key: "angle", min: 0, max: 179, step: 1, suffix: "°", digits: 0 }], state, () => draw());
    const binder = S.eventBinder();
    let dragging = false;

    const syncAngle = () => {
      const input = shell.controls.querySelector('[data-key="angle"]');
      if (input) input.value = state.angle;
      const output = shell.controls.querySelector('[data-output="angle"]');
      if (output) output.textContent = `${S.fmt(state.angle, 0)}°`;
    };

    const draw = () => {
      shell.controls.hidden = state.mode !== "line";
      const preset = presets[state.preset];
      const width = 980;
      const height = 585;
      const plane = S.createPlane({ x: 85, y: 65, width: 810, height: 465, extent: 3.5 });
      let content = `${plane.grid()}${plane.axes()}${S.transformedGrid(plane, preset.A, { extent: 3.25, step: 0.75, role: "output" })}`;
      let tone = "pass";
      let title = "";
      let text = "";
      let formula = "";
      let facts = [];

      content += `<text x="105" y="43" class="ch7-story-panel-title">青绿：候选子空间 W</text><text x="385" y="43" class="ch7-story-panel-title">紫色：整个像 T(W)</text>`;

      if (state.mode === "whole") {
        content += `<rect x="105" y="85" width="770" height="425" rx="28" class="ch7-story-band is-success" opacity="0.22"/><text x="${plane.cx}" y="${plane.cy + 8}" text-anchor="middle" class="ch7-story-big-label">W=V，T(W) 仍在 V 内</text>`;
        title = "整个空间 V 对任何线性算子都不变";
        text = "当 T:V→V 时，无论网格怎样扭曲，输出仍属于同一个整个空间。真正有信息的是中间维数的非平凡子空间。";
        formula = "T(V)\subseteq V";
        facts = [["类型", "平凡不变子空间"]];
      } else if (state.mode === "zero") {
        content += `<circle cx="${plane.cx}" cy="${plane.cy}" r="34" class="ch7-story-zero-seal"/><text x="${plane.cx}" y="${plane.cy + 6}" text-anchor="middle" class="ch7-story-big-label">0</text>`;
        title = "零子空间也始终不变";
        text = "线性变换必满足 T(0)=0，所以 {0} 永远被保持。";
        formula = "T(\{0\})=\{0\}";
        facts = [["类型", "平凡不变子空间"]];
      } else {
        const theta = state.angle * Math.PI / 180;
        const direction = [Math.cos(theta), Math.sin(theta)];
        const imageDirection = S.matVec(preset.A, direction);
        const collapsed = S.norm(imageDirection) < 1e-8;
        const residual = collapsed ? 0 : Math.abs(S.cross2(direction, imageDirection)) / S.norm(imageDirection);
        const invariant = residual < 0.02;
        const normalizedImage = collapsed ? direction : S.normalize(imageDirection);

        content += plane.band(direction, invariant ? "success" : "primary", 0.22, "ch7-story-overlap") + plane.line(direction, invariant ? "success" : "primary", 4.5);
        if (collapsed) {
          content += `<circle cx="${plane.cx}" cy="${plane.cy}" r="26" class="ch7-story-zero-seal"/><text x="${plane.cx + 36}" y="${plane.cy - 24}" class="ch7-story-label is-output">T(W)={0}</text>`;
        } else {
          content += plane.band(normalizedImage, invariant ? "success" : "output", 0.17, "ch7-story-overlap") + plane.line(normalizedImage, invariant ? "success" : "output", 4.5);
        }

        const probe = S.scale(1.4, direction);
        const imageProbe = S.matVec(preset.A, probe);
        content += plane.vector(probe, "gold", "w") + plane.vector(imageProbe, invariant ? "success" : "output", "T(w)");
        const handle = plane.p(probe);
        content += `<circle cx="${handle[0]}" cy="${handle[1]}" r="13" class="ch7-story-handle" style="color:var(--story-gold)" data-drag-handle/>`;

        if (!invariant && !collapsed) {
          const imageUnit = S.normalize(imageDirection);
          const projectionLength = S.dot(imageProbe, direction);
          const projection = S.scale(projectionLength, direction);
          const a = plane.p(projection);
          const b = plane.p(imageProbe);
          content += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ch7-story-leak"/><text x="${(a[0] + b[0]) / 2 + 8}" y="${(a[1] + b[1]) / 2 - 8}" class="ch7-story-label is-danger">泄漏到 W 外</text>`;
          const length = 3.3;
          const Wnormal = [-direction[1], direction[0]];
          const I = normalizedImage;
          const Inormal = [-I[1], I[0]];
          const wPoly = [
            S.add(S.scale(-length, direction), S.scale(0.22, Wnormal)),
            S.add(S.scale(length, direction), S.scale(0.22, Wnormal)),
            S.add(S.scale(length, direction), S.scale(-0.22, Wnormal)),
            S.add(S.scale(-length, direction), S.scale(-0.22, Wnormal)),
          ];
          const iPoly = [
            S.add(S.scale(-length, I), S.scale(0.17, Inormal)),
            S.add(S.scale(length, I), S.scale(0.17, Inormal)),
            S.add(S.scale(length, I), S.scale(-0.17, Inormal)),
            S.add(S.scale(-length, I), S.scale(-0.17, Inormal)),
          ];
          content += `<polyline points="${wPoly.map((point) => plane.p(point).join(",")).join(" ")}" class="ch7-story-helper is-dashed" opacity="0.4"/>`;
          content += `<polyline points="${iPoly.map((point) => plane.p(point).join(",")).join(" ")}" class="ch7-story-helper is-dashed" opacity="0.4"/>`;
        }

        const complement = [-direction[1], direction[0]];
        const P = [[direction[0], complement[0]], [direction[1], complement[1]]];
        const B = S.matMul(S.matMul(S.inv2(P), preset.A), P);
        tone = invariant ? "pass" : "fail";
        title = invariant ? "整个 T(W) 仍被 W 包含" : "T(W) 整体转出了 W";
        text = invariant ? "这里并不要求每个向量原地不动；只要求 W 中所有向量的像仍然属于 W。" : "一支探针已经显示泄漏分量，而两条整带的夹角说明这不是某个样本的偶然现象。";
        formula = invariant ? "T(W)\subseteq W" : "T(W)\not\subseteq W";
        facts = [["方向误差", S.fmt(residual, 4)], ["适配基左下角", S.fmt(B[1][0], 4)], ["是否不变", invariant ? "是" : "否"]];
      }

      shell.stage.innerHTML = S.svg(content, { width, height, label: "候选子空间 W 与其整体像 T(W) 的带状集合比较" });
      shell.result.innerHTML = S.result({ tone, title, text, formula, facts });
    };

    binder.on(shell.toolbar, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) {
        state.preset = Number(preset.dataset.preset);
        state.mode = "line";
        state.angle = 20;
        syncAngle();
        S.setActive(shell.toolbar, "[data-preset]", preset);
        const lineButton = shell.toolbar.querySelector('[data-mode="line"]');
        if (lineButton) S.setActive(shell.toolbar, "[data-mode]", lineButton);
        draw();
        return;
      }
      const mode = event.target.closest("[data-mode]");
      if (mode) {
        state.mode = mode.dataset.mode;
        S.setActive(shell.toolbar, "[data-mode]", mode);
        draw();
      }
    });

    binder.on(shell.stage, "pointerdown", (event) => {
      if (!event.target.closest("[data-drag-handle]")) return;
      dragging = true;
      event.target.closest("svg")?.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    }, { passive: false });
    binder.on(shell.stage, "pointermove", (event) => {
      if (!dragging || state.mode !== "line") return;
      const svg = shell.stage.querySelector("svg");
      const rect = svg.getBoundingClientRect();
      const px = ((event.clientX - rect.left) / rect.width) * 980;
      const py = ((event.clientY - rect.top) / rect.height) * 585;
      const plane = S.createPlane({ x: 85, y: 65, width: 810, height: 465, extent: 3.5 });
      const vector = plane.v([px, py]);
      let angle = Math.atan2(vector[1], vector[0]) * 180 / Math.PI;
      angle = ((angle % 180) + 180) % 180;
      state.angle = Math.round(angle);
      syncAngle();
      draw();
      event.preventDefault();
    }, { passive: false });
    const end = () => { dragging = false; };
    binder.on(shell.stage, "pointerup", end);
    binder.on(shell.stage, "pointercancel", end);

    draw();
    return () => {
      cleanupRange();
      binder.cleanup();
    };
  }

  S.register("invariant-subspaces", render);
})();
