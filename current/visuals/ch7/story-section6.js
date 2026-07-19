(() => {
  const S = window.Ch7Story;
  if (!S) return;

  const rank2 = (A) => {
    if (A.flat().every((value) => Math.abs(value) < 1e-8)) return 0;
    return Math.abs(S.det2(A)) > 1e-8 ? 2 : 1;
  };
  const kernelDirection = (A) => {
    if (rank2(A) !== 1) return null;
    const row = S.norm(A[0]) > 1e-8 ? A[0] : A[1];
    return S.normalize([-row[1], row[0]]);
  };
  const imageDirection = (A) => {
    if (rank2(A) !== 1) return null;
    const c1 = [A[0][0], A[1][0]];
    const c2 = [A[0][1], A[1][1]];
    return S.normalize(S.norm(c1) > 1e-8 ? c1 : c2);
  };

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "满秩", A: [[1.3, 0.45], [-0.2, 1.1]] },
      { name: "正交投影", A: [[1, 0], [0, 0]] },
      { name: "秩一压缩", A: [[1, 1], [2, 2]] },
      { name: "零变换", A: [[0, 0], [0, 0]] },
    ];
    const state = { preset: 1, fiber: 0, base: [1.15, 0.55] };
    const shell = S.createLab(section, lesson, {
      layout: "fiber-map",
      title: "为什么沿核方向移动输入，输出完全不变？",
      description: "输入空间中的一整条纤维 x+ker T 会汇聚到同一个像。值域记录所有可能的输出，核记录被完全抹去的方向。",
      task: "拖动“沿纤维移动”，观察左侧选中点改变而右侧 T(x) 保持不动；再比较秩为 2、1、0 时的维数账本。",
    });
    shell.toolbar.innerHTML = S.buttonGroup("变换", presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset");
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "沿纤维移动", key: "fiber", min: -1.8, max: 1.8, step: 0.02 },
    ], state, () => draw());
    const binder = S.eventBinder();

    const draw = () => {
      const A = presets[state.preset].A;
      const rank = rank2(A);
      const kernel = kernelDirection(A);
      const image = imageDirection(A);
      const input = kernel ? S.add(state.base, S.scale(state.fiber, kernel)) : state.base;
      const output = S.matVec(A, input);
      const left = S.createPlane({ x: 35, y: 92, width: 400, height: 390, extent: 3 });
      const right = S.createPlane({ x: 545, y: 92, width: 400, height: 390, extent: 3.4 });
      let content = `${left.grid()}${left.axes()}${right.grid()}${right.axes()}
        <text x="35" y="55" class="ch7-svg-title">输入空间 V</text>
        <text x="545" y="55" class="ch7-svg-title">输出空间 W</text>
        <text x="490" y="285" text-anchor="middle" class="ch7-svg-title">T</text>`;

      if (kernel) {
        content += left.line(kernel, "secondary", 4.2, "is-dashed");
        const samples = [-1.5, -0.75, 0, 0.75, 1.5];
        samples.forEach((t, index) => {
          const source = S.add(state.base, S.scale(t, kernel));
          const target = S.matVec(A, source);
          const a = left.p(source);
          const b = right.p(target);
          content += left.point(source, Math.abs(t - state.fiber) < 0.15 ? "guide" : "secondary", Math.abs(t - state.fiber) < 0.15 ? 6 : 4);
          content += `<path d="M${a[0]} ${a[1]}C470 ${a[1]},510 ${b[1]},${b[0]} ${b[1]}" class="ch7-trace" opacity="${index === 2 ? 0.9 : 0.45}"/>`;
        });
        content += `<text x="55" y="505" class="ch7-svg-label is-secondary">x+ker T</text>`;
      } else if (rank === 0) {
        [-1.2, -0.4, 0.5, 1.25].forEach((t) => {
          const source = [t, Math.sin(t)];
          const a = left.p(source);
          const b = right.p([0, 0]);
          content += left.point(source, "secondary", 4) + `<path d="M${a[0]} ${a[1]}C470 ${a[1]},510 ${b[1]},${b[0]} ${b[1]}" class="ch7-trace" opacity="0.46"/>`;
        });
      }

      if (image) {
        content += right.line(image, "primary", 4.7);
        content += `<text x="565" y="505" class="ch7-svg-label is-primary">im T</text>`;
      }
      if (rank === 2) {
        const columns = [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];
        content += right.vector(columns[0], "primary", "第一列") + right.vector(columns[1], "secondary", "第二列");
      }
      content += left.point(input, "guide", 7, "当前输入") + right.point(output, "primary", 7, "T(x)");
      if (rank === 0) content += `<text x="${right.cx + 18}" y="${right.cy - 18}" class="ch7-svg-label is-primary">im T={0}</text>`;

      const rankLabel = rank === 2 ? "二维平面" : rank === 1 ? "一条直线" : "一个点";
      const kernelLabel = rank === 2 ? "{0}" : rank === 1 ? `span${S.vectorText(kernel)}` : "整个平面";
      const imageLabel = rank === 2 ? "整个输出平面" : rank === 1 ? `span${S.vectorText(image)}` : "{0}";
      const tone = rank === 2 ? "pass" : rank === 1 ? "warn" : "fail";
      const title = rank === 2 ? "没有非零方向被抹去" : rank === 1 ? "一整条纤维汇聚到同一个输出" : "所有输入都汇聚到原点";
      const text = rank === 2 ? "不同输入仍可区分，值域保持二维。" : rank === 1 ? "沿核方向改变输入，不会改变输出中的任何信息。" : "核是整个输入空间，值域只剩零向量。";
      const formula = rank === 2 ? "\\ker T=\\{0\\}" : rank === 1 ? "T(x+k)=T(x),\\quad k\\in\\ker T" : "T(x)=0\\quad(\\forall x)";
      shell.stage.innerHTML = S.svg(content, { width: 980, height: 540, label: "输入纤维中的多个点映到同一个输出" });
      shell.result.innerHTML = S.conclusion({ tone, title, text, formula, facts: [["值域形状", rankLabel], ["ker T", kernelLabel], ["im T", imageLabel], ["维数", `2=${rank}+${2 - rank}`]] });
      const fiberInput = shell.controls.querySelector('[data-key="fiber"]');
      if (fiberInput) fiberInput.disabled = !kernel;
    };

    binder.on(shell.toolbar, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (!preset) return;
      state.preset = Number(preset.dataset.preset);
      state.fiber = 0;
      const input = shell.controls.querySelector('[data-key="fiber"]');
      const output = shell.controls.querySelector('[data-output="fiber"]');
      if (input) input.value = 0;
      if (output) output.textContent = "0";
      S.setActive(shell.toolbar, "[data-preset]", preset);
      draw();
    });

    draw();
    return () => { cleanupRange(); binder.cleanup(); };
  }

  S.register("image-and-kernel", render);
})();
