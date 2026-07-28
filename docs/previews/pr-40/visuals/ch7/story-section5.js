(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "正交特征基", A: [[2, 1], [1, 2]], P: [[1, 1], [1, -1]], D: [[3, 0], [0, 1]] },
      { name: "斜特征基", A: [[2, 1], [0, 1]], P: [[1, -1], [0, 1]], D: [[2, 0], [0, 1]] },
      { name: "Jordan 块", A: [[2, 1], [0, 2]], P: null, D: null },
    ];
    const state = { preset: 0, progress: 0, x: [1.2, 0.75] };
    const shell = S.createLab(section, lesson, {
      layout: "coordinate-pair",
      title: "同一个向量换到特征坐标后，为什么只剩两个互不干扰的缩放？",
      description: "左边是真实空间，右边只记录同一个向量在特征基中的两个坐标。坐标记录改变，不代表向量被搬进另一个物理空间。",
      task: "先拖动左图的 x，再缓慢拖动过程滑杆。依次看“读出坐标、分别缩放、回到真实空间”。",
    });
    shell.toolbar.innerHTML = S.buttonGroup("选择矩阵", presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset");
    const binder = S.eventBinder();
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "过程", key: "progress", min: 0, max: 2, step: 0.01 },
    ], state, () => draw());

    const syncProgress = () => {
      const input = shell.controls.querySelector('[data-key="progress"]');
      const output = shell.controls.querySelector('[data-output="progress"]');
      if (input) input.value = state.progress;
      if (output) output.textContent = S.fmt(state.progress, 2);
    };

    const draw = () => {
      const preset = presets[state.preset];
      const left = S.createPlane({ x: 32, y: 102, width: 360, height: 390, extent: 4 });
      const right = S.createPlane({ x: 448, y: 102, width: 360, height: 390, extent: 4 });
      let content = `<text x="32" y="42" class="ch7-svg-title">真实空间中的向量</text>
        <text x="32" y="67" class="ch7-svg-caption">几何位置只在这里解释</text>
        <text x="448" y="42" class="ch7-svg-title">特征基中的坐标记录</text>
        <text x="448" y="67" class="ch7-svg-caption">两根坐标轴分别管理一个分量</text>`;

      if (!preset.P) {
        const eigen = [1, 0];
        const candidate = [0.5, 1.25];
        const image = S.matVec(preset.A, candidate);
        const scaled = S.scale(2, candidate);
        const a = left.p(scaled);
        const b = left.p(image);
        content += `${left.grid()}${left.axes()}${right.grid()}${right.axes()}
          ${left.line(eigen, "primary", 4.2)}
          ${left.vector(eigen, "primary")}
          ${left.vector(candidate, "guide")}
          ${left.vector(image, "secondary")}
          <line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ch7-leak"/>
          <text x="55" y="128" class="ch7-svg-label is-primary">唯一特征方向</text>
          <text x="${(a[0] + b[0]) / 2 + 8}" y="${(a[1] + b[1]) / 2 - 10}" class="ch7-svg-label is-secondary">额外剪切</text>
          <rect x="482" y="188" width="292" height="180" rx="16" fill="var(--surface-soft)" stroke="var(--line)"/>
          <text x="628" y="232" text-anchor="middle" class="ch7-svg-title">无法建立二维特征坐标</text>
          <text x="628" y="273" text-anchor="middle" class="ch7-svg-caption">独立特征方向：1 条</text>
          <text x="628" y="306" text-anchor="middle" class="ch7-svg-caption">空间维数：2</text>
          <text x="628" y="345" text-anchor="middle" class="ch7-svg-label is-secondary">流程在换基之前停止</text>`;
        shell.stage.innerHTML = S.svg(content, { width: 840, height: 560, label: "Jordan 块缺少第二条独立特征方向，无法建立特征坐标" });
        shell.result.innerHTML = S.conclusion({
          tone: "fail",
          title: "独立特征向量不足，右侧坐标系无法建立",
          text: "只有一条特征方向，不能拼成可逆的 P，因此不能相似于对角矩阵。",
          formula: "A\\not\\sim D_{\\mathrm{diag}}",
          facts: [["独立方向", "1"], ["所需方向", "2"]],
        });
        shell.controls.hidden = true;
        return;
      }

      shell.controls.hidden = false;
      const Pinv = S.inv2(preset.P);
      const coeff = S.matVec(Pinv, state.x);
      const stretched = S.matVec(preset.D, coeff);
      const Ax = S.matVec(preset.A, state.x);
      const v1 = [preset.P[0][0], preset.P[1][0]];
      const v2 = [preset.P[0][1], preset.P[1][1]];
      const t = S.clamp(state.progress, 0, 2);
      const scaleT = S.clamp(t, 0, 1);
      const returnT = S.clamp(t - 1, 0, 1);
      const currentCoeff = S.lerpVec(coeff, stretched, scaleT);
      const currentReal = S.lerpVec(state.x, Ax, returnT);
      const component1 = S.scale(currentCoeff[0], v1);
      const component2 = S.scale(currentCoeff[1], v2);
      const xTip = left.p(state.x);
      const currentTip = left.p(currentReal);

      content += `${left.grid()}${left.axes()}${right.grid()}${right.axes()}
        ${left.line(v1, "primary", 4.3)}${left.line(v2, "secondary", 4.3)}
        ${left.vector(state.x, "guide")}
        ${left.handle(state.x, "x", "拖动输入向量 x")}
        <text x="${xTip[0] + 14}" y="${xTip[1] - 14}" class="ch7-svg-label is-guide">x</text>
        ${right.vector(coeff, "muted")}
        ${right.vector(currentCoeff, "primary")}
        <text x="${right.p(currentCoeff)[0] + 13}" y="${right.p(currentCoeff)[1] - 13}" class="ch7-svg-label is-primary">${t < 0.02 ? "(c₁,c₂)" : "(λ₁c₁,λ₂c₂)"}</text>`;

      if (t >= 0.02) {
        content += `${S.arrowPath(left.cx, left.cy, ...left.p(component1), "is-primary")}
          ${S.arrowPath(...left.p(component1), ...left.p(S.add(component1, component2)), "is-secondary")}`;
      }
      if (returnT > 0.02) {
        content += left.vector(currentReal, "primary");
        content += `<text x="${currentTip[0] + 13}" y="${currentTip[1] + 24}" class="ch7-svg-label is-primary">${returnT > 0.98 ? "Ax" : "合成中"}</text>`;
      }

      const stepLabel = t < 0.15 ? "P⁻¹：读出两个特征坐标" : t < 1 ? "D：两个坐标分别缩放" : "P：把缩放后的分量合成为 Ax";
      content += `<rect x="186" y="520" width="468" height="38" rx="19" class="ch7-stage-chip"/>
        <text x="420" y="545" text-anchor="middle" class="ch7-svg-title">${stepLabel}</text>`;

      let title;
      let text;
      let formula;
      if (t < 0.15) {
        title = "P⁻¹ 只是在右图读出 x 的两个坐标";
        text = "左图中的向量位置没有改变。";
        formula = "P^{-1}x=(c_1,c_2)";
      } else if (t < 1) {
        title = "D 让两个特征坐标独立伸缩";
        text = "对角矩阵没有交叉项，一个坐标的变化不会混入另一个坐标。";
        formula = "D(c_1,c_2)=(\\lambda_1c_1,\\lambda_2c_2)";
      } else {
        title = "缩放后的两个分量重新合成为 Ax";
        text = "三步只是换一种更清楚的方式执行原来的 A。";
        formula = "Ax=PDP^{-1}x";
      }
      shell.stage.innerHTML = S.svg(content, { width: 840, height: 590, label: "真实空间与特征坐标同步显示同一个向量的对角化过程" });
      shell.result.innerHTML = S.conclusion({ tone: "pass", title, text, formula, facts: [["特征坐标", S.vectorText(coeff)], ["缩放后", S.vectorText(stretched)]] });
    };

    binder.on(shell.toolbar, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (!preset) return;
      state.preset = Number(preset.dataset.preset);
      state.progress = 0;
      syncProgress();
      S.setActive(shell.toolbar, "[data-preset]", preset);
      draw();
    });

    S.bindDrag(binder, shell.stage, "[data-drag]", (clientX, clientY) => {
      if (!presets[state.preset].P) return;
      const svg = shell.stage.querySelector("svg");
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const plane = S.createPlane({ x: 32, y: 102, width: 360, height: 390, extent: 4 });
      state.x = plane.v([((clientX - rect.left) / rect.width) * 840, ((clientY - rect.top) / rect.height) * 590]).map((number) => S.clamp(number, -3.3, 3.3));
      draw();
    });

    draw();
    return () => {
      cleanupRange();
      binder.cleanup();
    };
  }

  S.register("diagonal-matrices", render);
})();
