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
      title: "为什么一整条不同的输入，会落到完全相同的输出？",
      description: "左图的仿射纤维经过当前 x，方向则来自过原点的核空间。沿核方向移动，只改变被 T 完全抹去的那部分。",
      task: "先拖动左图圆环选择 x，再拖动“沿纤维移动”。盯住右图共同像，确认它没有移动。",
    });
    shell.toolbar.innerHTML = S.buttonGroup("选择变换", presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset");
    const binder = S.eventBinder();
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "沿纤维移动", key: "fiber", min: -1.8, max: 1.8, step: 0.02 },
    ], state, () => draw());

    const affineLine = (plane, base, direction, role = "secondary") => {
      const a = plane.p(S.add(base, S.scale(-4.4, direction)));
      const b = plane.p(S.add(base, S.scale(4.4, direction)));
      return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ch7-line is-${role}"/>`;
    };

    const draw = () => {
      const A = presets[state.preset].A;
      const rank = rank2(A);
      const kernel = kernelDirection(A);
      const image = imageDirection(A);
      const input = kernel ? S.add(state.base, S.scale(state.fiber, kernel)) : state.base;
      const output = S.matVec(A, input);
      const left = S.createPlane({ x: 32, y: 92, width: 360, height: 410, extent: 3.1 });
      const right = S.createPlane({ x: 448, y: 92, width: 360, height: 410, extent: 3.5 });
      let content = `${left.grid()}${left.axes()}${right.grid()}${right.axes()}
        <text x="32" y="42" class="ch7-svg-title">输入空间：可区分的点</text>
        <text x="32" y="67" class="ch7-svg-caption">圆点是不同输入，圆环是当前 x</text>
        <text x="448" y="42" class="ch7-svg-title">输出空间：T 能看到的部分</text>
        <text x="448" y="67" class="ch7-svg-caption">同一纤维的样本汇聚到共同像</text>
        <text x="420" y="300" text-anchor="middle" class="ch7-svg-title">T</text>`;

      if (kernel) {
        content += affineLine(left, state.base, kernel);
        const normal = [-kernel[1], kernel[0]];
        const band = [
          S.add(S.add(state.base, S.scale(-4.2, kernel)), S.scale(0.08, normal)),
          S.add(S.add(state.base, S.scale(4.2, kernel)), S.scale(0.08, normal)),
          S.add(S.add(state.base, S.scale(4.2, kernel)), S.scale(-0.08, normal)),
          S.add(S.add(state.base, S.scale(-4.2, kernel)), S.scale(-0.08, normal)),
        ];
        content += `<polygon points="${band.map((point) => left.p(point).join(",")).join(" ")}" class="ch7-band-secondary"/>`;
        [-1.55, -0.78, 0, 0.78, 1.55].forEach((amount, index) => {
          const source = S.add(state.base, S.scale(amount, kernel));
          const target = S.matVec(A, source);
          const a = left.p(source);
          const b = right.p(target);
          content += left.point(source, "secondary", 4.5);
          content += `<path d="M${a[0]} ${a[1]}C410 ${a[1]},430 ${b[1]},${b[0]} ${b[1]}" class="ch7-trace" opacity="${0.42 + index * 0.09}"/>`;
        });
        const labelAt = left.p(S.add(state.base, S.scale(-1.95, kernel)));
        content += `<text x="${labelAt[0] + 10}" y="${labelAt[1] - 12}" class="ch7-svg-label is-secondary">x + ker T</text>`;
      } else if (rank === 0) {
        [[-1.2, -0.8], [-0.6, 1.15], [0.55, -1.25], [1.3, 0.75]].forEach((source, index) => {
          const a = left.p(source);
          const b = right.p([0, 0]);
          content += left.point(source, "secondary", 4.5);
          content += `<path d="M${a[0]} ${a[1]}C410 ${a[1]},430 ${b[1]},${b[0]} ${b[1]}" class="ch7-trace" opacity="${0.45 + index * 0.08}"/>`;
        });
        content += `<rect x="${left.x + 8}" y="${left.y + 8}" width="${left.width - 16}" height="${left.height - 16}" rx="14" class="ch7-band-secondary" opacity="0.36"/>`;
      }

      if (image) {
        content += right.line(image, "primary", 4.7);
        const imageLabel = right.p(S.scale(2.6, image));
        content += `<text x="${imageLabel[0] - 24}" y="${imageLabel[1] - 12}" class="ch7-svg-label is-primary">im T</text>`;
      } else if (rank === 2) {
        content += `<rect x="${right.x + 8}" y="${right.y + 8}" width="${right.width - 16}" height="${right.height - 16}" rx="14" class="ch7-band-primary" opacity="0.45"/>`;
      }

      content += left.handle(input, "base", "拖动当前输入 x");
      const inputTip = left.p(input);
      content += `<text x="${inputTip[0] + 14}" y="${inputTip[1] - 14}" class="ch7-svg-label is-guide">当前 x</text>`;
      content += right.point(output, "primary", 7);
      const outputTip = right.p(output);
      content += `<text x="${outputTip[0] + 13}" y="${outputTip[1] - 13}" class="ch7-svg-label is-primary">${rank === 1 ? "共同像 T(x)" : "T(x)"}</text>`;

      const rankLabel = rank === 2 ? "二维平面" : rank === 1 ? "一条直线" : "一个点";
      const kernelLabel = rank === 2 ? "{0}" : rank === 1 ? "一条过原点的直线" : "整个输入平面";
      const imageLabel = rank === 2 ? "整个输出平面" : rank === 1 ? "一条过原点的直线" : "{0}";
      const tone = rank === 2 ? "pass" : rank === 1 ? "warn" : "fail";
      const title = rank === 2 ? "没有非零方向被抹去" : rank === 1 ? "整条 x+ker T 汇聚到同一个输出" : "所有输入都汇聚到原点";
      const text = rank === 2 ? "不同输入仍可区分，值域保持二维。" : rank === 1 ? "左图圆环沿仿射纤维移动，右图共同像保持不动。" : "核是整个输入空间，值域只剩零向量。";
      const formula = rank === 2 ? "\\ker T=\\{0\\}" : rank === 1 ? "T(x+k)=T(x),\\quad k\\in\\ker T" : "T(x)=0\\quad(\\forall x)";
      shell.stage.innerHTML = S.svg(content, { width: 840, height: 560, label: "正确的仿射纤维经过当前输入 x，多个样本映到同一个输出" });
      shell.result.innerHTML = S.conclusion({ tone, title, text, formula, facts: [["值域", rankLabel], ["ker T", kernelLabel], ["im T", imageLabel], ["维数", `2=${rank}+${2 - rank}`]] });
      const fiberInput = shell.controls.querySelector('[data-key="fiber"]');
      if (fiberInput) fiberInput.disabled = !kernel;
      shell.root.dataset.fiberPass = String(!kernel || S.norm(S.sub(S.matVec(A, state.base), output)) < 1e-7);
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

    S.bindDrag(binder, shell.stage, "[data-drag]", (clientX, clientY) => {
      const svg = shell.stage.querySelector("svg");
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const plane = S.createPlane({ x: 32, y: 92, width: 360, height: 410, extent: 3.1 });
      const point = plane.v([((clientX - rect.left) / rect.width) * 840, ((clientY - rect.top) / rect.height) * 560]).map((number) => S.clamp(number, -2.65, 2.65));
      const kernel = kernelDirection(presets[state.preset].A);
      state.base = kernel ? S.sub(point, S.scale(state.fiber, kernel)) : point;
      draw();
    });

    draw();
    return () => {
      cleanupRange();
      binder.cleanup();
    };
  }

  S.register("image-and-kernel", render);
})();
