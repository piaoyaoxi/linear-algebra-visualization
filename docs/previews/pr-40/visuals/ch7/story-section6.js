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
    const first = [A[0][0], A[1][0]];
    const second = [A[0][1], A[1][1]];
    return S.normalize(S.norm(first) > 1e-8 ? first : second);
  };

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "满秩", A: [[1.3, 0.45], [-0.2, 1.1]], note: "平面仍是平面" },
      { name: "正交投影", A: [[1, 0], [0, 0]], note: "沿 y 轴的差异完全消失" },
      { name: "秩一压缩", A: [[1, 1], [2, 2]], note: "整张平面压成一条斜线" },
      { name: "零变换", A: [[0, 0], [0, 0]], note: "所有输入都压到原点" },
    ];
    const state = { preset: 1, progress: 1, x: [1.15, 0.75], fiber: 0 };
    const shell = S.createStory(section, lesson, {
      title: "看整张平面怎样压成线、点，或仍保持二维",
      description: "拖动变换进度观察网格坍缩；再直接拖动橙色输入点。沿红色核方向移动时，最终紫色输出保持不动。",
    });
    shell.toolbar.innerHTML = S.buttons(presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset");
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "变换进度", key: "progress", min: 0, max: 1, step: 0.01, digits: 2 },
      { label: "沿核方向移动", key: "fiber", min: -1.8, max: 1.8, step: 0.02, digits: 2 },
    ], state, (key) => {
      if (key === "fiber") {
        const kernel = kernelDirection(presets[state.preset].A);
        if (kernel) state.x = S.add(state.baseX || state.x, S.scale(state.fiber, kernel));
      }
      draw();
    });
    const binder = S.eventBinder();
    let dragging = false;

    const syncControls = () => {
      const progress = shell.controls.querySelector('[data-key="progress"]');
      if (progress) progress.value = state.progress;
      const progressOut = shell.controls.querySelector('[data-output="progress"]');
      if (progressOut) progressOut.textContent = S.fmt(state.progress, 2);
      const fiber = shell.controls.querySelector('[data-key="fiber"]');
      if (fiber) fiber.value = state.fiber;
      const fiberOut = shell.controls.querySelector('[data-output="fiber"]');
      if (fiberOut) fiberOut.textContent = S.fmt(state.fiber, 2);
    };

    const draw = () => {
      const preset = presets[state.preset];
      const A = preset.A;
      const rank = rank2(A);
      const nullity = 2 - rank;
      const kernel = kernelDirection(A);
      const image = imageDirection(A);
      const B = S.lerpMatrix(S.identity2, A, state.progress);
      const current = S.matVec(B, state.x);
      const final = S.matVec(A, state.x);
      const width = 980;
      const height = 600;
      const plane = S.createPlane({ x: 90, y: 65, width: 800, height: 470, extent: 3.6 });
      let content = `${S.transformedGrid(plane, S.identity2, { extent: 3.4, step: 0.5, role: "input", className: "is-reference" })}${S.transformedGrid(plane, B, { extent: 3.4, step: 0.5, role: "output" })}${plane.axes()}`;
      content += `<text x="110" y="43" class="ch7-story-panel-title">灰青网格：输入平面</text><text x="365" y="43" class="ch7-story-panel-title">紫色网格：当前 Tₜ(V)</text><text x="742" y="43" class="ch7-story-panel-subtitle">t=${S.fmt(state.progress, 2)}</text>`;

      if (kernel) {
        content += plane.band(kernel, "danger", 0.10) + plane.line(kernel, "danger", 4.5, "is-dashed");
        const base = state.baseX || S.sub(state.x, S.scale(state.fiber, kernel));
        const trailStart = S.add(base, S.scale(-1.75, kernel));
        const trailEnd = S.add(base, S.scale(1.75, kernel));
        const a = plane.p(trailStart);
        const b = plane.p(trailEnd);
        content += `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" class="ch7-story-kernel-trail"/>`;
        [-1.5, -0.75, 0, 0.75, 1.5].forEach((t) => {
          const input = S.add(base, S.scale(t, kernel));
          const output = S.matVec(A, input);
          content += plane.point(input, Math.abs(t - state.fiber) < 0.2 ? "gold" : "danger", Math.abs(t - state.fiber) < 0.2 ? 6 : 3.5);
          const out = plane.p(output);
          content += `<circle cx="${out[0]}" cy="${out[1]}" r="${Math.abs(t) < 0.1 ? 8 : 3.5}" class="ch7-story-point is-output" opacity="${Math.abs(t) < 0.1 ? 1 : 0.35}"/>`;
        });
      }

      if (image) {
        const unit = S.normalize(image);
        const start = plane.p(S.scale(-4.5, unit));
        const end = plane.p(S.scale(4.5, unit));
        content += `<line x1="${start[0]}" y1="${start[1]}" x2="${end[0]}" y2="${end[1]}" class="ch7-story-image-glow"/>`;
        content += plane.line(image, "success", 4.8);
        content += `<text x="${end[0] - 65}" y="${end[1] - 15}" class="ch7-story-label is-success">im T</text>`;
      } else if (rank === 0) {
        content += `<circle cx="${plane.cx}" cy="${plane.cy}" r="28" class="ch7-story-zero-seal"/><text x="${plane.cx}" y="${plane.cy + 6}" text-anchor="middle" class="ch7-story-big-label">im T={0}</text>`;
      }

      content += plane.vector(state.x, "gold", "x");
      content += plane.vector(current, state.progress > 0.985 ? "output" : "primary", state.progress > 0.985 ? "T(x)" : "Tₜ(x)");
      const xHandle = plane.p(state.x);
      content += `<circle cx="${xHandle[0]}" cy="${xHandle[1]}" r="13" class="ch7-story-handle" style="color:var(--story-gold)" data-drag-handle/>`;
      const currentTip = plane.p(current);
      const finalTip = plane.p(final);
      if (state.progress < 0.985) {
        content += `<circle cx="${finalTip[0]}" cy="${finalTip[1]}" r="8" class="ch7-story-point is-output is-hollow"/><path d="M${currentTip[0]} ${currentTip[1]} Q${plane.cx + 90} ${plane.cy - 130},${finalTip[0]} ${finalTip[1]}" class="ch7-story-trace"/>`;
      }

      const rankLabel = rank === 2 ? "二维平面" : rank === 1 ? "一条直线" : "一个点";
      const kernelLabel = rank === 2 ? "{0}" : rank === 1 ? `span${S.vectorText(kernel)}` : "整个平面";
      const imageLabel = rank === 2 ? "整个平面" : rank === 1 ? `span${S.vectorText(image)}` : "{0}";
      let tone = rank === 2 ? "pass" : rank === 1 ? "warn" : "fail";
      let title = rank === 2 ? "没有非零方向被压成零，输出仍铺满二维" : rank === 1 ? "整张平面最终坍缩到一条线" : "所有方向最终都坍缩到原点";
      let text = rank === 2 ? "不同输入仍保持可区分，值域与陪域同为二维。" : rank === 1 ? "沿红色核方向移动输入不会改变最终紫色输出；与核垂直的有效信息组成绿色值域方向。" : "输入空间中的全部差异都被抹去，核是整个空间，值域只剩零向量。";
      let formula = rank === 2 ? "\\ker T=\\{0\\},\\quad \\operatorname{im}T=W" : rank === 1 ? "T(x+k)=T(x),\\quad k\\in\\ker T" : "T(x)=0\\quad(\\forall x)";
      const facts = [["最终形状", rankLabel], ["ker T", kernelLabel], ["im T", imageLabel], ["维数账本", `2=${rank}+${nullity}`]];

      shell.stage.innerHTML = S.svg(content, { width, height, label: "线性变换把整张输入网格连续压缩成平面、直线或点" });
      shell.result.innerHTML = S.result({ tone, title, text, formula, facts });
    };

    binder.on(shell.toolbar, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (!preset) return;
      state.preset = Number(preset.dataset.preset);
      state.progress = 1;
      state.fiber = 0;
      state.x = [1.15, 0.75];
      state.baseX = [...state.x];
      const fiberInput = shell.controls.querySelector('[data-key="fiber"]');
      if (fiberInput) fiberInput.disabled = !kernelDirection(presets[state.preset].A);
      syncControls();
      S.setActive(shell.toolbar, "[data-preset]", preset);
      draw();
    });

    binder.on(shell.stage, "pointerdown", (event) => {
      if (!event.target.closest("[data-drag-handle]")) return;
      dragging = true;
      event.target.closest("svg")?.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    }, { passive: false });
    binder.on(shell.stage, "pointermove", (event) => {
      if (!dragging) return;
      const svg = shell.stage.querySelector("svg");
      const rect = svg.getBoundingClientRect();
      const px = ((event.clientX - rect.left) / rect.width) * 980;
      const py = ((event.clientY - rect.top) / rect.height) * 600;
      const plane = S.createPlane({ x: 90, y: 65, width: 800, height: 470, extent: 3.6 });
      state.x = plane.v([px, py]).map((value) => S.clamp(value, -3.1, 3.1));
      state.baseX = [...state.x];
      state.fiber = 0;
      syncControls();
      draw();
      event.preventDefault();
    }, { passive: false });
    const end = () => { dragging = false; };
    binder.on(shell.stage, "pointerup", end);
    binder.on(shell.stage, "pointercancel", end);

    state.baseX = [...state.x];
    const fiberInput = shell.controls.querySelector('[data-key="fiber"]');
    if (fiberInput) fiberInput.disabled = !kernelDirection(presets[state.preset].A);
    draw();
    return () => {
      cleanupRange();
      binder.cleanup();
    };
  }

  S.register("image-and-kernel", render);
})();
