(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "旋转 + 剪切", T: [[0, -1], [1, 0]], U: [[1, 0.8], [0, 1]] },
      { name: "投影 + 旋转", T: [[0, -1], [1, 0]], U: [[1, 0], [0, 0]] },
      { name: "两次缩放", T: [[1.5, 0], [0, 0.7]], U: [[0.8, 0], [0, 1.25]] },
    ];
    const modes = [
      { value: "compose", label: "比较复合顺序" },
      { value: "sum", label: "逐点相加" },
      { value: "inverse", label: "尝试撤销" },
    ];
    const state = { preset: 0, mode: "compose", progress: 0 };
    const shell = S.createLab(section, lesson, {
      layout: "motion-track",
      title: "同样两台变换机器，交换顺序以后还是同一个结果吗？",
      description: "上下两条轨道使用完全相同的输入。每条轨道一次只显示输入、当前中间状态和最终轮廓。",
      task: "把作用进度从 0 拖到 2。先跟完上轨，再看下轨，最后只比较两条轨道最右端的轮廓。",
    });
    shell.toolbar.innerHTML = `${S.buttonGroup("机器组合", presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset")}${S.buttonGroup("研究内容", modes, state.mode, "mode")}`;
    const binder = S.eventBinder();
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "作用进度", key: "progress", min: 0, max: 2, step: 0.01 },
    ], state, () => draw());
    const base = [[-0.9, -0.55], [0.45, -0.55], [0.45, 0], [1.05, 0.32], [0.45, 0.64], [-0.9, 0.64]];
    const transform = (matrix) => base.map((point) => S.matVec(matrix, point));
    const polygon = (points, cx, cy, scale, className = "") => `<polygon points="${points.map(([x, y]) => `${cx + x * scale},${cy - y * scale}`).join(" ")}" class="ch7-shape ${className}"/>`;
    const lane = (y, label, steps, role, progress) => {
      const xs = [100, 410, 720];
      const t = S.clamp(progress, 0, 2);
      const segment = Math.min(1, Math.floor(t));
      const local = t - segment;
      const currentMatrix = S.lerpMatrix(steps[segment], steps[segment + 1], local);
      const currentX = S.lerp(xs[segment], xs[segment + 1], local);
      return `
        <rect x="28" y="${y - 80}" width="784" height="160" rx="18" fill="var(--surface-soft)" opacity="0.65"/>
        <text x="48" y="${y - 51}" class="ch7-lane-label">${label}</text>
        <path d="M94 ${y}H726" class="ch7-helper"/>
        ${xs.map((x, index) => polygon(transform(steps[index]), x, y, 44, "is-muted")).join("")}
        ${polygon(transform(currentMatrix), currentX, y, 48, role === "primary" ? "" : "is-secondary")}
        <text x="${xs[0]}" y="${y + 66}" text-anchor="middle" class="ch7-lane-note">输入 x</text>
        <text x="${xs[1]}" y="${y + 66}" text-anchor="middle" class="ch7-lane-note">中间状态</text>
        <text x="${xs[2]}" y="${y + 66}" text-anchor="middle" class="ch7-lane-note">最终输出</text>`;
    };

    const draw = () => {
      const preset = presets[state.preset];
      let content = "";
      let tone = "neutral";
      let title = "";
      let text = "";
      let formula = "";
      let facts = [];

      if (state.mode === "compose") {
        const TU = S.matMul(preset.T, preset.U);
        const UT = S.matMul(preset.U, preset.T);
        content += `<text x="28" y="37" class="ch7-svg-title">两条轨道从同一个 x 出发</text>
          <text x="812" y="37" text-anchor="end" class="ch7-svg-caption">只比较最右端</text>`;
        content += lane(190, "上轨：先 U，再 T", [S.identity2, preset.U, TU], "primary", state.progress);
        content += lane(445, "下轨：先 T，再 U", [S.identity2, preset.T, UT], "secondary", state.progress);
        const probe = [1.1, 0.65];
        const top = S.matVec(TU, probe);
        const bottom = S.matVec(UT, probe);
        const same = S.norm(S.sub(top, bottom)) < 1e-7;
        tone = same ? "warn" : "pass";
        title = same ? "这组特殊缩放可以交换" : "两条轨道的最终轮廓不同";
        text = same ? "两次对角缩放各自管理独立方向，这是特殊情形。" : "第一台机器改变了第二台机器接收到的输入，所以交换顺序通常改变结果。";
        formula = same ? "T\\circ U=U\\circ T" : "T\\circ U\\ne U\\circ T";
        facts = [["上轨探针", S.vectorText(top)], ["下轨探针", S.vectorText(bottom)]];
      } else if (state.mode === "sum") {
        const Tshape = transform(preset.T);
        const Ushape = transform(preset.U);
        const sumMatrix = preset.T.map((row, i) => row.map((value, j) => value + preset.U[i][j]));
        const sumShape = transform(sumMatrix);
        content += `<text x="28" y="42" class="ch7-svg-title">同一个输入同时进入两条支路</text>
          <rect x="38" y="82" width="764" height="420" rx="18" fill="var(--surface-soft)" opacity="0.56"/>
          ${polygon(base, 105, 290, 62)}
          <path d="M180 290C250 290,255 188,320 188M180 290C250 290,255 392,320 392" class="ch7-trace"/>
          ${polygon(Tshape, 395, 188, 54)}
          ${polygon(Ushape, 395, 392, 54, "is-secondary")}
          <path d="M470 188C555 188,555 290,625 290M470 392C555 392,555 290,625 290" class="ch7-trace"/>
          ${polygon(sumShape, 710, 290, 54)}
          <text x="105" y="420" text-anchor="middle" class="ch7-svg-caption">输入 x</text>
          <text x="395" y="103" text-anchor="middle" class="ch7-svg-label is-primary">T(x)</text>
          <text x="395" y="477" text-anchor="middle" class="ch7-svg-label is-secondary">U(x)</text>
          <text x="710" y="420" text-anchor="middle" class="ch7-svg-caption">逐点相加后的输出</text>`;
        tone = "pass";
        title = "T+U 没有先后顺序";
        text = "两条支路同时计算同一个输入的像，再把对应位置的向量相加。";
        formula = "(T+U)(x)=T(x)+U(x)";
        facts = [["输入份数", "同一个 x"], ["顺序", "无"]];
      } else {
        const forward = state.preset === 1 ? preset.U : preset.T;
        const inverse = S.inv2(forward);
        const stages = [S.identity2, forward, inverse ? S.identity2 : forward];
        content += `<text x="28" y="42" class="ch7-svg-title">沿同一条轨道前进，再尝试返回</text>`;
        content += lane(300, inverse ? "信息完整：能够唯一返回" : "信息丢失：返回路径不唯一", stages, inverse ? "primary" : "secondary", state.progress);
        if (!inverse) {
          content += `<path d="M662 223L778 377M778 223L662 377" class="ch7-leak" opacity="0.55"/>
            <text x="720" y="405" text-anchor="middle" class="ch7-svg-label is-secondary">缺少被投影掉的方向</text>`;
        }
        tone = inverse ? "pass" : "fail";
        title = inverse ? "逆变换沿原路径唯一返回" : "投影丢失方向后无法唯一撤销";
        text = inverse ? "每个输出保留了完整方向信息。" : "同一输出对应无数输入，反向机器不知道该回到哪一个。";
        formula = inverse ? "T^{-1}(T(x))=x" : "\\det T=0\\Rightarrow T^{-1}\\text{ 不存在}";
        facts = [["行列式", S.fmt(S.det2(forward))], ["能否撤销", inverse ? "能" : "不能"]];
      }

      shell.stage.innerHTML = S.svg(content, { width: 840, height: 600, label: "沿两条独立轨道比较线性变换的复合顺序" });
      shell.result.innerHTML = S.conclusion({ tone, title, text, formula, facts });
      shell.controls.hidden = state.mode === "sum";
    };

    const resetProgress = () => {
      state.progress = 0;
      const input = shell.controls.querySelector('[data-key="progress"]');
      const output = shell.controls.querySelector('[data-output="progress"]');
      if (input) input.value = 0;
      if (output) output.textContent = "0";
    };

    binder.on(shell.toolbar, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) {
        state.preset = Number(preset.dataset.preset);
        resetProgress();
        S.setActive(shell.toolbar, "[data-preset]", preset);
        draw();
        return;
      }
      const mode = event.target.closest("[data-mode]");
      if (mode) {
        state.mode = mode.dataset.mode;
        resetProgress();
        S.setActive(shell.toolbar, "[data-mode]", mode);
        draw();
      }
    });

    draw();
    return () => {
      cleanupRange();
      binder.cleanup();
    };
  }

  S.register("linear-map-operations", render);
})();
