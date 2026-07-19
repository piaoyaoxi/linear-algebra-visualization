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
      { name: "90° 旋转", A: [[0, -1], [1, 0]] },
    ];
    const state = { preset: 0, angle: 18 };
    const shell = S.createLab(section, lesson, {
      layout: "eigen-search",
      title: "哪些方向经过 T 后完全不转向？",
      description: "候选直线保持不动，只比较 v 与 Av。若两支箭头留在同一直线上，这条直线就是特征方向。",
      task: "拖动候选直线或下方滑杆改变 θ，盯住 v 与 Av 之间的偏转角；偏转归零时再读取 λ。",
    });
    shell.toolbar.innerHTML = S.buttonGroup("变换", presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset");
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
      const A = presets[state.preset].A;
      const theta = state.angle * Math.PI / 180;
      const v = [Math.cos(theta), Math.sin(theta)];
      const Av = S.matVec(A, v);
      const avNorm = S.norm(Av);
      const directionError = avNorm < S.EPS ? 0 : Math.abs(S.cross2(v, Av)) / avNorm;
      const bend = Math.asin(Math.min(1, directionError)) * 180 / Math.PI;
      const lambda = S.dot(v, Av);
      const hit = directionError < 0.018;
      const directions = eigenDirections(A);
      const plane = S.createPlane({ x: 45, y: 56, width: 730, height: 470, extent: 3.25 });
      let content = `<defs><clipPath id="ch7-eigen-clip"><rect x="${plane.x}" y="${plane.y}" width="${plane.width}" height="${plane.height}"/></clipPath></defs>
        <g clip-path="url(#ch7-eigen-clip)">${S.transformedGrid(plane, S.identity2, { extent: 3.1, step: 0.5, role: "muted" })}${S.transformedGrid(plane, A, { extent: 3.1, step: 0.5, role: "secondary" })}</g>
        ${plane.axes()}
        ${plane.line(v, hit ? "primary" : "guide", 4.2)}
        ${plane.vector(S.scale(1.55, v), "primary", "v")}
        ${plane.vector(Av, hit ? "primary" : "secondary", "Av")}
        ${plane.hitLine(S.scale(3.2, v), "angle", S.scale(-3.2, v))}`;
      if (!hit) {
        const a = plane.p(S.scale(1.55, v));
        const b = plane.p(S.normalize(Av).map((n) => n * 1.55));
        content += `<path d="M${a[0]} ${a[1]}Q${plane.cx + 54} ${plane.cy - 72},${b[0]} ${b[1]}" class="ch7-arc is-secondary"/>
          <text x="${plane.cx + 72}" y="${plane.cy - 82}" class="ch7-svg-label is-secondary">偏转 ${S.fmt(bend, 1)}°</text>`;
      } else {
        content += `<text x="${plane.cx + 82}" y="${plane.cy - 82}" class="ch7-svg-label is-primary">方向不变</text>`;
      }
      content += `<path d="M812 126H936M812 236H936M812 346H936" class="ch7-helper"/>
        <text x="812" y="102" class="ch7-svg-caption">非零</text><text x="936" y="102" text-anchor="end" class="ch7-svg-title">是</text>
        <text x="812" y="212" class="ch7-svg-caption">偏转角</text><text x="936" y="212" text-anchor="end" class="ch7-svg-title">${S.fmt(bend, 1)}°</text>
        <text x="812" y="322" class="ch7-svg-caption">伸缩比 λ</text><text x="936" y="322" text-anchor="end" class="ch7-svg-title">${hit ? S.fmt(lambda) : "找到方向后读取"}</text>
        <text x="812" y="440" class="ch7-svg-caption">青绿箭头 v　珊瑚箭头 Av</text>`;

      const tone = hit ? "pass" : directions.length ? "neutral" : "fail";
      const title = hit ? "v 与 Av 共线，找到一条特征直线" : directions.length ? "当前方向发生偏转，继续旋转" : "每一条实直线都会被旋转离开自身";
      const text = hit ? `这条直线上的每个非零向量都只乘上比例 ${S.fmt(lambda)}。` : directions.length ? "只观察两支箭头是否共线，不需要先看特征方程。" : "90° 旋转在实数平面中没有特征方向。";
      const formula = hit ? "Av=\\lambda v" : directions.length ? "Av\\notin\\operatorname{span}(v)" : "\\text{实数域中没有特征向量}";
      shell.stage.innerHTML = S.svg(content, { width: 980, height: 570, label: "拖动候选方向比较向量 v 与 Av 是否共线" });
      shell.result.innerHTML = S.conclusion({ tone, title, text, formula, facts: [["θ", `${state.angle}°`], ["偏转角", `${S.fmt(bend, 2)}°`], ["λ", hit ? S.fmt(lambda) : "暂不可读"]] });
    };

    binder.on(shell.toolbar, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (!preset) return;
      state.preset = Number(preset.dataset.preset);
      state.angle = 18;
      syncAngle();
      S.setActive(shell.toolbar, "[data-preset]", preset);
      draw();
    });

    S.bindDrag(binder, shell.stage, "[data-drag]", (clientX, clientY) => {
      const svg = shell.stage.querySelector("svg");
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const plane = S.createPlane({ x: 45, y: 56, width: 730, height: 470, extent: 3.25 });
      const point = [((clientX - rect.left) / rect.width) * 980, ((clientY - rect.top) / rect.height) * 570];
      const vector = plane.v(point);
      let angle = Math.atan2(vector[1], vector[0]) * 180 / Math.PI;
      angle = ((angle % 180) + 180) % 180;
      state.angle = Math.round(angle);
      syncAngle();
      draw();
    });

    draw();
    return () => { cleanupRange(); binder.cleanup(); };
  }

  S.register("eigenvalues-eigenvectors", render);
})();
