(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "对称矩阵", A: [[2, 1], [1, 2]], P: [[1, 1], [1, -1]], D: [[3, 0], [0, 1]] },
      { name: "斜特征基", A: [[2, 1], [0, 1]], P: [[1, -1], [0, 1]], D: [[2, 0], [0, 1]] },
      { name: "Jordan 块", A: [[2, 1], [0, 2]], P: null, D: null },
    ];
    const phases = [
      { value: 0, label: "分解到特征方向" },
      { value: 1, label: "分别缩放" },
      { value: 2, label: "合成 Ax" },
    ];
    const state = { preset: 0, progress: 0, x1: 1.2, x2: 0.75 };
    const shell = S.createLab(section, lesson, {
      layout: "single-plane-diagonal",
      title: "换到特征基后，复杂变换为什么只剩两次独立缩放？",
      description: "整个过程留在同一个真实平面中。特征基只把 x 分解成两条不混合的分量，D 分别伸缩，再把分量相加得到 Ax。",
      task: "拖动过程滑杆，先看 x 沿两条特征方向的分解，再看两个分量独立伸缩，最后确认向量和等于 Ax。",
    });
    shell.toolbar.innerHTML = `${S.buttonGroup("矩阵", presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset")}${S.buttonGroup("阶段", phases, state.progress, "phase")}`;
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "过程", key: "progress", min: 0, max: 2, step: 0.01 },
      { label: "输入 x₁", key: "x1", min: -2, max: 2, step: 0.05 },
      { label: "输入 x₂", key: "x2", min: -2, max: 2, step: 0.05 },
    ], state, () => draw());
    const binder = S.eventBinder();

    const syncPhase = () => {
      const input = shell.controls.querySelector('[data-key="progress"]');
      const output = shell.controls.querySelector('[data-output="progress"]');
      if (input) input.value = state.progress;
      if (output) output.textContent = S.fmt(state.progress, 2);
    };

    const draw = () => {
      const preset = presets[state.preset];
      const x = [state.x1, state.x2];
      const plane = S.createPlane({ x: 45, y: 60, width: 720, height: 470, extent: 4 });
      let content = `${plane.grid()}${plane.axes()}`;

      if (!preset.P) {
        const eigen = [1, 0];
        const candidate = [0.45, 1.25];
        const image = S.matVec(preset.A, candidate);
        content += plane.line(eigen, "primary", 4.2) + plane.vector(eigen, "primary", "唯一特征方向");
        content += plane.vector(candidate, "guide", "第二个独立方向") + plane.vector(image, "secondary", "A(v₂)");
        const scaled = S.scale(2, candidate);
        const a = plane.p(scaled);
        const b = plane.p(image);
        content += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ch7-leak"/>
          <text x="${(a[0] + b[0]) / 2 + 10}" y="${(a[1] + b[1]) / 2 - 10}" class="ch7-svg-label is-secondary">额外剪切</text>
          <text x="812" y="150" class="ch7-svg-caption">独立特征方向</text><text x="932" y="150" text-anchor="end" class="ch7-svg-title">1 条</text>
          <path d="M812 178H932" class="ch7-helper"/>
          <text x="812" y="230" class="ch7-svg-caption">空间维数</text><text x="932" y="230" text-anchor="end" class="ch7-svg-title">2</text>
          <text x="812" y="342" class="ch7-svg-caption">缺少第二条特征轴，流程在这里停止。</text>`;
        shell.stage.innerHTML = S.svg(content, { width: 980, height: 570, label: "Jordan 块只有一条独立特征方向，无法对角化" });
        shell.result.innerHTML = S.conclusion({ tone: "fail", title: "独立特征向量不足，不能建立特征基", text: "不能用一个重复方向拼成可逆矩阵 P，所以 A 不能相似于对角矩阵。", formula: "A\\not\\sim D_{\\mathrm{diag}}", facts: [["几何重数", "1"], ["空间维数", "2"]] });
        return;
      }

      const Pinv = S.inv2(preset.P);
      const coeff = S.matVec(Pinv, x);
      const v1 = [preset.P[0][0], preset.P[1][0]];
      const v2 = [preset.P[0][1], preset.P[1][1]];
      const c1 = S.scale(coeff[0], v1);
      const c2 = S.scale(coeff[1], v2);
      const stretch = S.clamp(state.progress, 0, 1);
      const factor1 = S.lerp(1, preset.D[0][0], stretch);
      const factor2 = S.lerp(1, preset.D[1][1], stretch);
      const s1 = S.scale(factor1, c1);
      const s2 = S.scale(factor2, c2);
      const current = S.add(s1, s2);
      const Ax = S.matVec(preset.A, x);
      const reveal = S.clamp(state.progress - 1, 0, 1);

      content += plane.line(v1, "primary", 4.4) + plane.line(v2, "secondary", 4.4);
      content += plane.vector(x, "guide", "x");
      content += plane.vector(s1, "primary");
      content += S.arrowPath(...plane.p(s1), ...plane.p(current), "is-secondary");
      if (reveal > 0.02) content += `<g opacity="${reveal}">${plane.vector(Ax, "primary", "Ax")}</g>`;
      content += `<text x="812" y="116" class="ch7-svg-caption">同一个真实空间</text>
        <text x="812" y="158" class="ch7-svg-title">x=c₁v₁+c₂v₂</text>
        <path d="M812 184H938" class="ch7-helper"/>
        <text x="812" y="230" class="ch7-svg-caption">独立缩放</text>
        <text x="812" y="272" class="ch7-svg-title">(c₁,c₂) ↦ (λ₁c₁,λ₂c₂)</text>
        <path d="M812 298H938" class="ch7-helper"/>
        <text x="812" y="344" class="ch7-svg-caption">重新相加</text>
        <text x="812" y="386" class="ch7-svg-title">Ax=λ₁c₁v₁+λ₂c₂v₂</text>`;

      let title;
      let text;
      let formula;
      if (state.progress < 0.5) {
        title = "P⁻¹ 只负责读出 x 的两个特征坐标";
        text = "向量没有离开真实空间，只是被分解到两条特征方向。";
        formula = "P^{-1}x=(c_1,c_2)";
      } else if (state.progress < 1.5) {
        title = "D 分别缩放两个分量，彼此不混合";
        text = "对角矩阵的几何意义，就是每条特征方向只管理自己的伸缩。";
        formula = "D(c_1,c_2)=(\\lambda_1c_1,\\lambda_2c_2)";
      } else {
        title = "缩放后的两个分量相加，正好得到 Ax";
        text = "分解、独立缩放和重新合成合起来仍是原来的变换 A。";
        formula = "Ax=PDP^{-1}x";
      }
      shell.stage.innerHTML = S.svg(content, { width: 980, height: 570, label: "同一平面中分解、缩放并重组特征分量" });
      shell.result.innerHTML = S.conclusion({ tone: "pass", title, text, formula, facts: [["特征坐标", S.vectorText(coeff)], ["特征值", `${S.fmt(preset.D[0][0])}, ${S.fmt(preset.D[1][1])}`], ["重构误差", S.fmt(S.norm(S.sub(Ax, S.add(S.scale(preset.D[0][0], c1), S.scale(preset.D[1][1], c2)))), 6)]] });
    };

    binder.on(shell.toolbar, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) {
        state.preset = Number(preset.dataset.preset);
        state.progress = 0;
        syncPhase();
        S.setActive(shell.toolbar, "[data-preset]", preset);
        draw();
        return;
      }
      const phase = event.target.closest("[data-phase]");
      if (phase) {
        state.progress = Number(phase.dataset.phase);
        syncPhase();
        S.setActive(shell.toolbar, "[data-phase]", phase);
        draw();
      }
    });

    draw();
    return () => { cleanupRange(); binder.cleanup(); };
  }

  S.register("diagonal-matrices", render);
})();
