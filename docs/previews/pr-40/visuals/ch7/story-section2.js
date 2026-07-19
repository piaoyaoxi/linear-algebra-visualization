(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "旋转 + 剪切", T: [[0, -1], [1, 0]], Sm: [[1, 0.8], [0, 1]], note: "两种顺序产生不同形状" },
      { name: "投影 + 旋转", T: [[0, -1], [1, 0]], Sm: [[1, 0], [0, 0]], note: "投影丢失信息，不能撤销" },
      { name: "两个缩放", T: [[1.5, 0], [0, 0.7]], Sm: [[0.8, 0], [0, 1.25]], note: "这组特殊变换彼此交换" },
    ];
    const modes = [
      { value: "sum", label: "T+S" },
      { value: "TS", label: "T∘S" },
      { value: "ST", label: "S∘T" },
      { value: "inverse", label: "撤销" },
    ];
    const state = { preset: 0, mode: "TS", probe: [1.25, 0.7] };
    const shell = S.createStory(section, lesson, {
      title: "同一个图形怎样穿过不同的变换机器",
      description: "不对称旗形保留方向信息。跟着它依次经过每道机器，就能看清逐点相加、复合顺序与逆变换的区别。",
    });
    shell.toolbar.innerHTML = `${S.buttons(presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset")}${S.buttons(modes, state.mode, "mode")}`;
    const binder = S.eventBinder();
    let dragging = false;

    const baseShape = [[-0.85, -0.55], [0.55, -0.55], [0.55, 0.05], [1.1, 0.35], [0.55, 0.65], [-0.85, 0.65]];
    const transformShape = (matrix) => baseShape.map((point) => S.matVec(matrix, point));
    const polygon = (plane, points, role, extra = "") => `<polygon points="${points.map((point) => plane.p(point).join(",")).join(" ")}" class="ch7-story-shape is-${role} ${extra}"/>`;
    const panel = (x, title, subtitle) => `<rect x="${x}" y="70" width="270" height="390" rx="24" class="ch7-story-panel-bg"/><text x="${x + 22}" y="105" class="ch7-story-panel-title">${title}</text><text x="${x + 22}" y="128" class="ch7-story-panel-subtitle">${subtitle}</text>`;
    const gate = (x, label) => `<rect x="${x}" y="228" width="64" height="78" rx="18" class="ch7-story-gate"/><text x="${x + 32}" y="276" text-anchor="middle" class="ch7-story-gate-label">${label}</text>`;

    const draw = () => {
      const preset = presets[state.preset];
      const T = preset.T;
      const Sm = preset.Sm;
      const TS = S.matMul(T, Sm);
      const ST = S.matMul(Sm, T);
      const width = 1000;
      const height = 540;
      let content = "";
      let title = "";
      let text = "";
      let formula = "";
      let tone = "neutral";
      let facts = [];

      if (state.mode === "sum") {
        const inputPlane = S.createPlane({ x: 35, y: 150, width: 250, height: 250, extent: 2.5 });
        const tPlane = S.createPlane({ x: 375, y: 75, width: 250, height: 190, extent: 2.8 });
        const sPlane = S.createPlane({ x: 375, y: 300, width: 250, height: 190, extent: 2.8 });
        const outPlane = S.createPlane({ x: 715, y: 150, width: 250, height: 250, extent: 4 });
        const Tx = S.matVec(T, state.probe);
        const Sx = S.matVec(Sm, state.probe);
        const sum = S.add(Tx, Sx);
        content += `${panel(25, "同一个输入 x", "分别送入 T 与 S")}${panel(365, "两条并行支路", "没有先后顺序")}${panel(705, "输出端相加", "把两个像作向量和")}`;
        content += inputPlane.grid() + inputPlane.axes() + tPlane.grid() + tPlane.axes() + sPlane.grid() + sPlane.axes() + outPlane.grid() + outPlane.axes();
        content += polygon(inputPlane, baseShape, "primary") + inputPlane.vector(state.probe, "gold", "x");
        content += polygon(tPlane, transformShape(T), "primary") + tPlane.vector(Tx, "primary", "T(x)");
        content += polygon(sPlane, transformShape(Sm), "secondary") + sPlane.vector(Sx, "secondary", "S(x)");
        content += outPlane.vector(Tx, "primary", "T(x)") + outPlane.vector(Sx, "secondary", "S(x)", Tx) + outPlane.vector(sum, "output", "(T+S)(x)");
        content += `<path d="M290 270 C330 270 330 170 365 170" class="ch7-story-helper"/><path d="M290 280 C330 280 330 395 365 395" class="ch7-story-helper"/><path d="M630 170 C670 170 670 260 705 260" class="ch7-story-helper"/><path d="M630 395 C670 395 670 290 705 290" class="ch7-story-helper"/>`;
        title = "T+S 是两条支路的输出相加";
        text = "它不是先做 T 再做 S。两台机器同时接收同一个 x，最后才把两个像相加。";
        formula = "(T+S)(x)=T(x)+S(x)";
        tone = "pass";
        facts = [["T(x)", S.vectorText(Tx)], ["S(x)", S.vectorText(Sx)], ["总输出", S.vectorText(sum)]];
      } else if (state.mode === "inverse") {
        const A = T;
        const inverse = S.inv2(A);
        const projection = Math.abs(S.det2(Sm)) < 1e-7 ? Sm : null;
        const forward = projection || A;
        const inv = S.inv2(forward);
        const x = state.probe;
        const y = S.matVec(forward, x);
        const recovered = inv ? S.matVec(inv, y) : null;
        const planes = [
          S.createPlane({ x: 35, y: 120, width: 250, height: 300, extent: 2.6 }),
          S.createPlane({ x: 375, y: 120, width: 250, height: 300, extent: 2.6 }),
          S.createPlane({ x: 715, y: 120, width: 250, height: 300, extent: 2.6 }),
        ];
        content += `${panel(25, "输入", "保留完整方向信息")}${panel(365, "经过变换", inv ? "信息仍完整" : "一个方向已经消失")}${panel(705, "尝试返回", inv ? "逆变换恢复原状" : "无法唯一复原")}`;
        content += planes.map((plane) => plane.grid() + plane.axes()).join("");
        content += polygon(planes[0], baseShape, "primary") + planes[0].vector(x, "gold", "x");
        content += polygon(planes[1], transformShape(forward), "output") + planes[1].vector(y, "output", "T(x)");
        if (recovered) {
          content += polygon(planes[2], baseShape, "success") + planes[2].vector(recovered, "success", "T⁻¹T(x)");
        } else {
          const collapsed = transformShape(forward);
          content += polygon(planes[2], collapsed, "danger") + `<text x="840" y="278" text-anchor="middle" class="ch7-story-big-label">?</text>`;
          content += `<path d="M760 360 H920" class="ch7-story-line is-danger is-dashed"/>`;
        }
        content += gate(302, "T") + gate(642, inv ? "T⁻¹" : "×");
        tone = inv ? "pass" : "fail";
        title = inv ? "倒序应用逆变换，原对象完整返回" : "投影已经压掉一个方向，逆变换不存在";
        text = inv ? "可逆变换没有丢失信息，因此每个输出都能追溯到唯一输入。" : "输出线上同一个点来自无数个输入；任何‘返回’都无法知道原先的垂直分量。";
        formula = inv ? "T^{-1}(T(x))=x" : "\det T=0\Rightarrow T^{-1}\text{ 不存在}";
        facts = [["det", S.fmt(S.det2(forward))], ["是否可逆", inv ? "是" : "否"]];
      } else {
        const first = state.mode === "TS" ? Sm : T;
        const second = state.mode === "TS" ? T : Sm;
        const firstName = state.mode === "TS" ? "S" : "T";
        const secondName = state.mode === "TS" ? "T" : "S";
        const combined = S.matMul(second, first);
        const x = state.probe;
        const mid = S.matVec(first, x);
        const out = S.matVec(combined, x);
        const planes = [
          S.createPlane({ x: 35, y: 120, width: 250, height: 300, extent: 2.7 }),
          S.createPlane({ x: 375, y: 120, width: 250, height: 300, extent: 3.1 }),
          S.createPlane({ x: 715, y: 120, width: 250, height: 300, extent: 3.8 }),
        ];
        content += `${panel(25, "输入对象", "方向不对称，便于追踪")}${panel(365, `先经过 ${firstName}`, "中间状态是下一步的输入")}${panel(705, `再经过 ${secondName}`, "最终输出")}`;
        content += planes.map((plane) => plane.grid() + plane.axes()).join("");
        content += polygon(planes[0], baseShape, "primary") + planes[0].vector(x, "gold", "x");
        content += polygon(planes[1], transformShape(first), "secondary") + planes[1].vector(mid, "secondary", `${firstName}(x)`);
        content += polygon(planes[2], transformShape(combined), "output") + planes[2].vector(out, "output", `${secondName}(${firstName}(x))`);
        content += gate(302, firstName) + gate(642, secondName);
        const other = state.mode === "TS" ? S.matVec(ST, x) : S.matVec(TS, x);
        const same = S.norm(S.sub(out, other)) < 1e-6;
        tone = same ? "warn" : "pass";
        title = same ? "这组特殊变换恰好交换" : `右侧的 ${firstName} 必须先作用`;
        text = same ? "两个对角缩放彼此独立，所以交换顺序没有改变结果；这不是一般规律。" : "中间形状一旦改变，第二台机器收到的输入也随之改变，最终方向和形状便不同。";
        formula = state.mode === "TS" ? "(T\circ S)(x)=T(S(x))" : "(S\circ T)(x)=S(T(x))";
        facts = [["当前终点", S.vectorText(out)], ["另一顺序", S.vectorText(other)], ["是否相同", same ? "是（特殊）" : "否"]];
      }

      shell.stage.innerHTML = S.svg(content, { width, height, label: "线性变换相加、复合与逆变换的视觉流水线" });
      shell.result.innerHTML = S.result({ tone, title, text, formula, facts });
    };

    binder.on(shell.toolbar, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) {
        state.preset = Number(preset.dataset.preset);
        S.setActive(shell.toolbar, "[data-preset]", preset);
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
      if (!event.target.closest(".ch7-story-svg")) return;
      dragging = true;
      event.target.closest("svg")?.setPointerCapture?.(event.pointerId);
    });
    binder.on(shell.stage, "pointermove", (event) => {
      if (!dragging) return;
      const svg = shell.stage.querySelector("svg");
      const rect = svg.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 1000;
      const y = ((event.clientY - rect.top) / rect.height) * 540;
      if (x < 310 && y > 110 && y < 440) {
        const plane = S.createPlane({ x: 35, y: 120, width: 250, height: 300, extent: 2.7 });
        state.probe = plane.v([x, y]).map((value) => S.clamp(value, -2.1, 2.1));
        draw();
      }
    });
    const end = () => { dragging = false; };
    binder.on(shell.stage, "pointerup", end);
    binder.on(shell.stage, "pointercancel", end);

    draw();
    return () => binder.cleanup();
  }

  S.register("linear-map-operations", render);
})();
