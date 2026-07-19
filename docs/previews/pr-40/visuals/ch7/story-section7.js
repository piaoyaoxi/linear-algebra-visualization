(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "对称矩阵", A: [[2, 1], [1, 2]] },
      { name: "剪切", A: [[1, 1], [0, 1]] },
      { name: "反射", A: [[1, 0], [0, -1]] },
      { name: "90° 旋转", A: [[0, -1], [1, 0]] },
    ];
    const modes = [
      { value: "line", label: "一维候选 W" },
      { value: "whole", label: "整个空间 V" },
      { value: "zero", label: "零子空间 {0}" },
    ];
    const state = { preset: 0, mode: "line", angle: 20 };
    const shell = S.createLab(section, lesson, {
      layout: "subspace-samples",
      title: "怎样验证整个 W 都被 T 保持？",
      description: "一支向量留在 W 中还不够。把 W 上多个样本同时送入 T，若所有像都没有垂直于 W 的泄漏，才有 T(W)⊆W。",
      task: "拖动候选直线改变方向，观察五个样本的像是否全部留在线内，并对照右侧矩阵左下角的泄漏系数。",
    });
    shell.toolbar.innerHTML = `${S.buttonGroup("变换", presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset")}${S.buttonGroup("子空间", modes, state.mode, "mode")}`;
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "候选方向 θ", key: "angle", min: 0, max: 179, step: 1, suffix: "°", digits: 0 },
    ], state, () => draw());
    const binder = S.eventBinder();

    const syncAngle = () => {
      const input = shell.controls.querySelector('[data-key="angle"]');
      const output = shell.controls.querySelector('[data-output="angle"]');
      if (input) input.value = state.angle;
      if (output) output.textContent = `${state.angle}°`;
    };

    const draw = () => {
      shell.controls.hidden = state.mode !== "line";
      const A = presets[state.preset].A;
      const plane = S.createPlane({ x: 38, y: 62, width: 690, height: 455, extent: 3.4 });
      let content = `${plane.grid()}${plane.axes()}`;
      let tone = "pass";
      let title = "";
      let text = "";
      let formula = "";
      let facts = [];

      if (state.mode === "whole") {
        content += `<rect x="${plane.x + 12}" y="${plane.y + 12}" width="${plane.width - 24}" height="${plane.height - 24}" rx="12" class="ch7-band-primary" opacity="0.72"/>
          <text x="${plane.cx}" y="${plane.cy}" text-anchor="middle" class="ch7-svg-title">W=V，所有输出仍属于 V</text>`;
        title = "整个空间 V 对任何线性算子都不变";
        text = "这是平凡不变子空间。真正有结构信息的是中间维数的子空间。";
        formula = "T(V)\\subseteq V";
        facts = [["类型", "平凡不变子空间"]];
      } else if (state.mode === "zero") {
        content += plane.cross([0, 0], "primary", 10, "T(0)=0");
        title = "零子空间也始终不变";
        text = "线性变换固定零向量，所以 {0} 永远被保持。";
        formula = "T(\\{0\\})=\\{0\\}";
        facts = [["类型", "平凡不变子空间"]];
      } else {
        const theta = state.angle * Math.PI / 180;
        const direction = [Math.cos(theta), Math.sin(theta)];
        const imageDirection = S.matVec(A, direction);
        const residual = S.norm(imageDirection) < 1e-8 ? 0 : Math.abs(S.cross2(direction, imageDirection)) / S.norm(imageDirection);
        const invariant = residual < 0.02;
        const normal = [-direction[1], direction[0]];
        content += `<polygon points="${[
          S.add(S.scale(-3.3, direction), S.scale(0.16, normal)),
          S.add(S.scale(3.3, direction), S.scale(0.16, normal)),
          S.add(S.scale(3.3, direction), S.scale(-0.16, normal)),
          S.add(S.scale(-3.3, direction), S.scale(-0.16, normal)),
        ].map((point) => plane.p(point).join(",")).join(" ")}" class="ch7-band-primary"/>`;
        content += plane.line(direction, "primary", 4.6) + plane.hitLine(S.scale(3.3, direction), "angle", S.scale(-3.3, direction));
        [-2, -1, 0.7, 1.45, 2.2].forEach((t, index) => {
          const w = S.scale(t, direction);
          const Tw = S.matVec(A, w);
          const a = plane.p(w);
          const b = plane.p(Tw);
          content += plane.point(w, "primary", 4.4);
          content += `<path d="M${a[0]} ${a[1]}Q${(a[0] + b[0]) / 2 + 8} ${(a[1] + b[1]) / 2 - 12},${b[0]} ${b[1]}" class="ch7-trace" opacity="${0.42 + index * 0.09}"/>`;
          content += plane.cross(Tw, invariant ? "primary" : "secondary", 5);
        });
        if (!invariant) {
          const probe = S.scale(1.45, direction);
          const image = S.matVec(A, probe);
          const projection = S.scale(S.dot(image, direction), direction);
          const a = plane.p(projection);
          const b = plane.p(image);
          content += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ch7-leak"/>
            <text x="${(a[0] + b[0]) / 2 + 8}" y="${(a[1] + b[1]) / 2 - 8}" class="ch7-svg-label is-secondary">泄漏</text>`;
        }
        const complement = normal;
        const P = [[direction[0], complement[0]], [direction[1], complement[1]]];
        const B = S.matMul(S.matMul(S.inv2(P), A), P);
        content += `<text x="774" y="100" class="ch7-svg-caption">适应基下的矩阵</text>
          <path d="M794 142H780V314H794M926 142H940V314H926" class="ch7-helper"/>
          <text x="820" y="188" text-anchor="middle" class="ch7-matrix-text">${S.fmt(B[0][0])}</text><text x="900" y="188" text-anchor="middle" class="ch7-matrix-text">${S.fmt(B[0][1])}</text>
          <rect x="795" y="232" width="50" height="58" rx="8" class="ch7-matrix-column ${invariant ? "is-primary" : "is-secondary"}"/>
          <text x="820" y="268" text-anchor="middle" class="ch7-matrix-text">${S.fmt(B[1][0], 3)}</text><text x="900" y="268" text-anchor="middle" class="ch7-matrix-text">${S.fmt(B[1][1])}</text>
          <text x="778" y="350" class="ch7-svg-caption">左下角表示从 W 泄漏到补空间的分量。</text>`;
        tone = invariant ? "pass" : "fail";
        title = invariant ? "五个样本的像全部留在 W 中" : "样本的像出现垂直于 W 的泄漏";
        text = invariant ? "这里不要求向量逐点固定，只要求 W 中所有向量的像仍属于 W。" : "泄漏系数非零，说明整个像 T(W) 已经离开 W。";
        formula = invariant ? "T(W)\\subseteq W" : "T(W)\\not\\subseteq W";
        facts = [["方向误差", S.fmt(residual, 4)], ["矩阵左下角", S.fmt(B[1][0], 4)], ["是否不变", invariant ? "是" : "否"]];
      }

      shell.stage.innerHTML = S.svg(content, { width: 980, height: 555, label: "用多个样本检查整个子空间是否在变换下保持" });
      shell.result.innerHTML = S.conclusion({ tone, title, text, formula, facts });
    };

    binder.on(shell.toolbar, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) {
        state.preset = Number(preset.dataset.preset);
        state.mode = "line";
        state.angle = 20;
        syncAngle();
        S.setActive(shell.toolbar, "[data-preset]", preset);
        const line = shell.toolbar.querySelector('[data-mode="line"]');
        if (line) S.setActive(shell.toolbar, "[data-mode]", line);
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

    S.bindDrag(binder, shell.stage, "[data-drag]", (clientX, clientY) => {
      if (state.mode !== "line") return;
      const svg = shell.stage.querySelector("svg");
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const plane = S.createPlane({ x: 38, y: 62, width: 690, height: 455, extent: 3.4 });
      const vector = plane.v([((clientX - rect.left) / rect.width) * 980, ((clientY - rect.top) / rect.height) * 555]);
      let angle = Math.atan2(vector[1], vector[0]) * 180 / Math.PI;
      angle = ((angle % 180) + 180) % 180;
      state.angle = Math.round(angle);
      syncAngle();
      draw();
    });

    draw();
    return () => { cleanupRange(); binder.cleanup(); };
  }

  S.register("invariant-subspaces", render);
})();
