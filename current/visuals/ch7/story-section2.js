(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "旋转与剪切", T: [[0, -1], [1, 0]], U: [[1, 0.8], [0, 1]] },
      { name: "投影与旋转", T: [[0, -1], [1, 0]], U: [[1, 0], [0, 0]] },
      { name: "两个缩放", T: [[1.5, 0], [0, 0.7]], U: [[0.8, 0], [0, 1.25]] },
    ];
    const modes = [
      { value: "TU", label: "先 U 后 T" },
      { value: "UT", label: "先 T 后 U" },
      { value: "sum", label: "逐点相加" },
      { value: "inverse", label: "尝试撤销" },
    ];
    const state = { preset: 0, mode: "TU", progress: 0 };
    const shell = S.createLab(section, lesson, {
      layout: "motion-track",
      title: "同样两台变换机器，为什么交换顺序会改变结果？",
      description: "用一个不对称旗形保留方向信息。形状在同一条轨道上连续经过每一步，复合顺序和信息丢失会直接出现在终点。",
      task: "拖动“作用进度”从输入走到输出，再切换另一种顺序，比较最右端两个轮廓是否重合。",
    });
    shell.toolbar.innerHTML = `${S.buttonGroup("组合", presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset")}${S.buttonGroup("运算", modes, state.mode, "mode")}`;
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "作用进度", key: "progress", min: 0, max: 2, step: 0.01 },
    ], state, () => draw());
    const binder = S.eventBinder();
    const base = [[-0.9, -0.55], [0.45, -0.55], [0.45, 0], [1.05, 0.32], [0.45, 0.64], [-0.9, 0.64]];
    const transform = (A) => base.map((point) => S.matVec(A, point));
    const polygon = (points, cx, cy, scale, className) => `<polygon points="${points.map(([x, y]) => `${cx + x * scale},${cy - y * scale}`).join(" ")}" class="ch7-shape ${className}"/>`;
    const label = (x, title, detail) => `<text x="${x}" y="72" text-anchor="middle" class="ch7-svg-title">${title}</text><text x="${x}" y="94" text-anchor="middle" class="ch7-svg-caption">${detail}</text>`;

    const draw = () => {
      const preset = presets[state.preset];
      const xPos = [155, 500, 845];
      const cy = 300;
      const scale = 66;
      let content = `<path d="M90 ${cy}H910" class="ch7-helper"/>
        ${label(xPos[0], "输入", "同一个不对称旗形")}
        <circle cx="${xPos[0]}" cy="${cy}" r="3" class="ch7-point is-muted"/>`;
      let tone = "neutral";
      let title = "";
      let text = "";
      let formula = "";
      let facts = [];

      if (state.mode === "sum") {
        const Tshape = transform(preset.T);
        const Ushape = transform(preset.U);
        const Sum = preset.T.map((row, i) => row.map((value, j) => value + preset.U[i][j]));
        const sumShape = transform(Sum);
        content += label(xPos[1], "两条并行支路", "T(x) 与 U(x) 同时计算") + label(xPos[2], "输出相加", "同一位置的向量求和");
        content += polygon(base, xPos[0], cy, scale, "") + polygon(Tshape, xPos[1], cy - 78, scale * 0.72, "") + polygon(Ushape, xPos[1], cy + 82, scale * 0.72, "is-secondary") + polygon(sumShape, xPos[2], cy, scale * 0.72, "");
        content += `<path d="M225 ${cy}C340 ${cy},360 ${cy - 78},420 ${cy - 78}M225 ${cy}C340 ${cy},360 ${cy + 82},420 ${cy + 82}" class="ch7-trace"/>
          <path d="M580 ${cy - 78}C680 ${cy - 78},700 ${cy},770 ${cy}M580 ${cy + 82}C680 ${cy + 82},700 ${cy},770 ${cy}" class="ch7-trace"/>
          <text x="500" y="${cy - 145}" text-anchor="middle" class="ch7-svg-label is-primary">T(x)</text>
          <text x="500" y="${cy + 154}" text-anchor="middle" class="ch7-svg-label is-secondary">U(x)</text>`;
        title = "T+U 是同一个输入的两个像逐点相加";
        text = "两条支路没有先后关系，所以它和复合运算表达的是不同结构。";
        formula = "(T+U)(x)=T(x)+U(x)";
        tone = "pass";
        facts = [["顺序", "无"], ["输入份数", "同一个 x"]];
      } else if (state.mode === "inverse") {
        const forward = state.preset === 1 ? preset.U : preset.T;
        const inverse = S.inv2(forward);
        const mid = transform(forward);
        const end = inverse ? base : mid;
        content += label(xPos[1], "先做变换", inverse ? "信息仍然完整" : "一个方向已经消失") + label(xPos[2], "反向恢复", inverse ? "唯一回到原形" : "无法知道原输入");
        content += polygon(base, xPos[0], cy, scale, "") + polygon(mid, xPos[1], cy, scale, "is-secondary") + polygon(end, xPos[2], cy, scale, inverse ? "" : "is-muted");
        content += `<text x="327" y="${cy - 22}" text-anchor="middle" class="ch7-svg-title">T</text><text x="672" y="${cy - 22}" text-anchor="middle" class="ch7-svg-title">${inverse ? "T⁻¹" : "?"}</text>`;
        if (!inverse) content += `<path d="M790 ${cy - 80}L900 ${cy + 80}M900 ${cy - 80}L790 ${cy + 80}" class="ch7-leak" opacity="0.65"/>`;
        tone = inverse ? "pass" : "fail";
        title = inverse ? "逆变换把全部方向信息带回输入" : "投影已经丢掉一个方向，无法唯一撤销";
        text = inverse ? "每个输出只有一个来源，所以倒序作用能够恢复原对象。" : "同一条输出线对应无数个输入，逆变换没有足够信息。";
        formula = inverse ? "T^{-1}(T(x))=x" : "\\det T=0\\Rightarrow T^{-1}\\text{ 不存在}";
        facts = [["行列式", S.fmt(S.det2(forward))], ["是否可逆", inverse ? "是" : "否"]];
      } else {
        const first = state.mode === "TU" ? preset.U : preset.T;
        const second = state.mode === "TU" ? preset.T : preset.U;
        const firstName = state.mode === "TU" ? "U" : "T";
        const secondName = state.mode === "TU" ? "T" : "U";
        const combined = S.matMul(second, first);
        const other = S.matMul(first, second);
        const stages = [S.identity2, first, combined];
        const t = S.clamp(state.progress, 0, 2);
        const segment = Math.min(1, Math.floor(t));
        const local = t - segment;
        const currentMatrix = S.lerpMatrix(stages[segment], stages[segment + 1], local);
        const currentX = S.lerp(xPos[segment], xPos[segment + 1], local);
        content += label(xPos[1], `先经过 ${firstName}`, "中间状态成为下一步输入") + label(xPos[2], `再经过 ${secondName}`, "最终形状与方向");
        content += polygon(transform(stages[0]), xPos[0], cy, scale, "is-muted") + polygon(transform(stages[1]), xPos[1], cy, scale, "is-muted") + polygon(transform(stages[2]), xPos[2], cy, scale, "is-muted");
        content += polygon(transform(currentMatrix), currentX, cy, scale, "");
        content += polygon(transform(other), xPos[2], cy, scale, "is-secondary");
        content += `<text x="327" y="${cy - 22}" text-anchor="middle" class="ch7-svg-title">${firstName}</text><text x="672" y="${cy - 22}" text-anchor="middle" class="ch7-svg-title">${secondName}</text>
          <text x="845" y="470" text-anchor="middle" class="ch7-svg-caption">青绿：当前顺序　珊瑚：交换顺序</text>`;
        const probe = [1.25, 0.7];
        const out = S.matVec(combined, probe);
        const otherOut = S.matVec(other, probe);
        const same = S.norm(S.sub(out, otherOut)) < 1e-7;
        tone = same ? "warn" : "pass";
        title = same ? "这组特殊缩放恰好可以交换" : "交换顺序后，终点轮廓不再重合";
        text = same ? "对角缩放各自作用在独立方向上。这是特殊情况。" : `右边的 ${firstName} 先作用，它先改变了第二台机器收到的输入。`;
        formula = state.mode === "TU" ? "(T\\circ U)(x)=T(U(x))" : "(U\\circ T)(x)=U(T(x))";
        facts = [["当前终点", S.vectorText(out)], ["交换后", S.vectorText(otherOut)], ["是否相同", same ? "是" : "否"]];
      }

      shell.stage.innerHTML = S.svg(content, { width: 1000, height: 540, label: "线性变换相加、复合和逆变换的连续轨道" });
      shell.result.innerHTML = S.conclusion({ tone, title, text, formula, facts });
    };

    binder.on(shell.toolbar, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) {
        state.preset = Number(preset.dataset.preset);
        state.progress = 0;
        S.setActive(shell.toolbar, "[data-preset]", preset);
        draw();
        return;
      }
      const mode = event.target.closest("[data-mode]");
      if (mode) {
        state.mode = mode.dataset.mode;
        state.progress = 0;
        S.setActive(shell.toolbar, "[data-mode]", mode);
        draw();
      }
    });

    draw();
    return () => { cleanupRange(); binder.cleanup(); };
  }

  S.register("linear-map-operations", render);
})();
