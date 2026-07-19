(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function eigenDirections(A) {
    const [a, b] = A[0];
    const [c, d] = A[1];
    const trace = a + d;
    const determinant = a * d - b * c;
    const discriminant = trace * trace - 4 * determinant;
    if (discriminant < -1e-8) return [];
    const root = Math.sqrt(Math.max(0, discriminant));
    const values = [(trace + root) / 2, (trace - root) / 2];
    const result = [];
    values.forEach((lambda) => {
      let vector = Math.abs(b) > Math.abs(c) ? [b, lambda - a] : [lambda - d, c];
      if (S.norm(vector) < S.EPS) vector = [1, 0];
      vector = S.normalize(vector);
      let angle = Math.atan2(vector[1], vector[0]) * 180 / Math.PI;
      angle = ((angle % 180) + 180) % 180;
      if (!result.some((item) => Math.abs(item.angle - angle) < 0.5)) result.push({ lambda, vector, angle });
    });
    return result;
  }

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "对称拉伸", A: [[2, 1], [1, 2]] },
      { name: "剪切", A: [[1, 1], [0, 1]] },
      { name: "反射", A: [[1, 0], [0, -1]] },
      { name: "90°旋转", A: [[0, -1], [1, 0]] },
    ];
    const state = { preset: 0, angle: 18 };
    const shell = S.createStory(section, lesson, {
      title: "在变形网格中寻找完全不转向的直线",
      description: "直接抓住候选方向旋转。普通方向会被扭开；特征方向只会伸长、缩短或反向，始终留在原来的直线上。",
    });
    shell.toolbar.innerHTML = S.buttons(presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset");
    const cleanupRange = S.mountRanges(shell.controls, [{ label: "候选方向 θ", key: "angle", min: 0, max: 179, step: 1, suffix: "°", digits: 0 }], state, () => draw());
    const binder = S.eventBinder();
    let dragging = false;

    const draw = () => {
      const preset = presets[state.preset];
      const theta = state.angle * Math.PI / 180;
      const v = [Math.cos(theta), Math.sin(theta)];
      const Av = S.matVec(preset.A, v);
      const error = S.norm(Av) < S.EPS ? 0 : Math.abs(S.cross2(v, Av)) / S.norm(Av);
      const lambda = S.dot(v, Av);
      const hit = error < 0.018;
      const directions = eigenDirections(preset.A);
      const width = 980;
      const height = 570;
      const plane = S.createPlane({ x: 85, y: 55, width: 700, height: 470, extent: 3.2 });
      let content = `${S.transformedGrid(plane, S.identity2, { extent: 3.1, step: 0.5, role: "input" })}${S.transformedGrid(plane, preset.A, { extent: 3.1, step: 0.5, role: "output" })}${plane.axes()}`;
      const ringRadius = Math.min(plane.sx, plane.sy) * 1.08;
      content += `<circle cx="${plane.cx}" cy="${plane.cy}" r="${ringRadius}" class="ch7-story-eigen-ring"/>`;
      for (let index = 0; index < 72; index += 1) {
        const angle = index * 2.5 * Math.PI / 180;
        const q = [Math.cos(angle), Math.sin(angle)];
        const Aq = S.matVec(preset.A, q);
        const qError = S.norm(Aq) < S.EPS ? 0 : Math.abs(S.cross2(q, Aq)) / S.norm(Aq);
        const near = qError < 0.035;
        const inner = [plane.cx + Math.cos(angle) * ringRadius, plane.cy - Math.sin(angle) * ringRadius];
        const outerRadius = ringRadius + 8 + 18 * (1 - Math.min(1, qError));
        const outer = [plane.cx + Math.cos(angle) * outerRadius, plane.cy - Math.sin(angle) * outerRadius];
        content += `<line x1="${inner[0]}" y1="${inner[1]}" x2="${outer[0]}" y2="${outer[1]}" class="ch7-story-eigen-tick ${near ? "is-near" : ""}"/>`;
      }
      directions.forEach((direction) => {
        content += plane.line(direction.vector, "success", 3.5, "is-dashed");
      });
      content += plane.line(v, hit ? "success" : "gold", 4.2);
      content += plane.vector(S.scale(1.45, v), hit ? "success" : "gold", "v");
      content += plane.vector(Av, hit ? "success" : "output", "Av");
      const handle = plane.p(S.scale(1.45, v));
      content += `<circle cx="${handle[0]}" cy="${handle[1]}" r="13" class="ch7-story-handle" style="color:${hit ? "var(--story-success)" : "var(--story-gold)"}" data-drag-handle/>`;
      const vTip = plane.p(S.scale(1.45, v));
      const avTip = plane.p(Av);
      if (!hit) content += `<path d="M${vTip[0]} ${vTip[1]} Q${plane.cx + 110} ${plane.cy - 145},${avTip[0]} ${avTip[1]}" class="ch7-story-gap" opacity="0.65"/>`;

      content += `<rect x="820" y="90" width="125" height="340" rx="24" class="ch7-story-panel-bg"/>`;
      const gates = [
        ["1", "非零", true],
        ["2", "共线", hit],
        ["3", "伸缩比", hit],
      ];
      gates.forEach(([number, label, pass], index) => {
        const y = 145 + index * 92;
        content += `<circle cx="852" cy="${y}" r="18" class="ch7-story-point is-${pass ? "success" : index === 0 ? "success" : "muted"}"/>`;
        content += `<text x="852" y="${y + 5}" text-anchor="middle" class="ch7-story-node-text">${number}</text>`;
        content += `<text x="882" y="${y + 5}" class="ch7-story-panel-title">${label}</text>`;
      });
      content += `<text x="882" y="402" class="ch7-story-panel-subtitle">方向误差</text><text x="882" y="428" class="ch7-story-panel-title">${S.fmt(error, 4)}</text>`;

      let tone = hit ? "pass" : directions.length ? "neutral" : "fail";
      let title = hit ? "v 与 Av 完全共线：找到一条特征直线" : directions.length ? "当前方向被扭开，继续旋转寻找共线位置" : "所有实方向都会转向";
      let text = hit ? `沿这条直线的每个非零向量都只乘上同一个比例 ${S.fmt(lambda)}。` : directions.length ? "外圈绿色长刻度提示方向误差的低谷；直接拖动圆环上的手柄靠近它。" : "90° 旋转在实数平面中没有任何经过原点的直线保持自身。";
      let formula = hit ? "Av=\lambda v" : directions.length ? "Av\notin\operatorname{span}(v)" : "\text{实数域中无特征向量}";
      const facts = [["θ", `${S.fmt(state.angle, 0)}°`], ["方向误差", S.fmt(error, 4)], ["λ", hit ? S.fmt(lambda) : "尚不可读"]];

      shell.stage.innerHTML = S.svg(content, { width, height, label: "在原网格与变换网格中拖动方向寻找特征向量" });
      shell.result.innerHTML = S.result({ tone, title, text, formula, facts });
    };

    binder.on(shell.toolbar, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (!preset) return;
      state.preset = Number(preset.dataset.preset);
      state.angle = 18;
      const input = shell.controls.querySelector('[data-key="angle"]');
      if (input) input.value = state.angle;
      const output = shell.controls.querySelector('[data-output="angle"]');
      if (output) output.textContent = `${state.angle}°`;
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
      const py = ((event.clientY - rect.top) / rect.height) * 570;
      const plane = S.createPlane({ x: 85, y: 55, width: 700, height: 470, extent: 3.2 });
      const vector = plane.v([px, py]);
      let angle = Math.atan2(vector[1], vector[0]) * 180 / Math.PI;
      angle = ((angle % 180) + 180) % 180;
      state.angle = Math.round(angle);
      const input = shell.controls.querySelector('[data-key="angle"]');
      if (input) input.value = state.angle;
      const output = shell.controls.querySelector('[data-output="angle"]');
      if (output) output.textContent = `${state.angle}°`;
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

  S.register("eigenvalues-eigenvectors", render);
})();
