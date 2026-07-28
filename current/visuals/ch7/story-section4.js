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
      layout: "eigen-pair",
      title: "把方向慢慢旋转，哪一刻 v 与 Av 不再张开夹角？",
      description: "金色直线是正在检验的方向，青绿是 v，珊瑚是 Av。特征方向出现时，两支箭头共线，偏转弧会收缩为零。",
      task: "抓住 v 尖端附近的圆环直接旋转，或拖动角度滑杆。先看夹角，不要先看 λ。",
    });
    shell.toolbar.innerHTML = S.buttonGroup("选择变换", presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset");
    const binder = S.eventBinder();
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "候选方向 θ", key: "angle", min: 0, max: 179, step: 1, suffix: "°", digits: 0 },
    ], state, () => draw());

    const syncAngle = () => {
      const input = shell.controls.querySelector('[data-key="angle"]');
      const output = shell.controls.querySelector('[data-output="angle"]');
      if (input) input.value = state.angle;
      if (output) output.textContent = `${state.angle}°`;
    };

    const curve = (plane, matrix, radius = 1.55) => {
      const points = Array.from({ length: 97 }, (_, index) => {
        const angle = (index / 96) * Math.PI * 2;
        return plane.p(S.matVec(matrix, [radius * Math.cos(angle), radius * Math.sin(angle)]));
      });
      return points.map((point, index) => `${index ? "L" : "M"}${point[0].toFixed(2)} ${point[1].toFixed(2)}`).join(" ") + " Z";
    };

    const draw = () => {
      const A = presets[state.preset].A;
      const theta = state.angle * Math.PI / 180;
      const v = [Math.cos(theta), Math.sin(theta)];
      const Av = S.matVec(A, v);
      const avNorm = S.norm(Av);
      const signed = avNorm < S.EPS ? 0 : Math.atan2(S.cross2(v, Av), Math.abs(S.dot(v, Av)));
      const bend = Math.abs(signed) * 180 / Math.PI;
      const lambda = S.dot(v, Av);
      const hit = Math.abs(Math.sin(signed)) < 0.018;
      const directions = eigenDirections(A);
      const plane = S.createPlane({ x: 42, y: 54, width: 756, height: 500, extent: 3.35 });
      const vDraw = S.scale(1.55, v);
      const avDraw = S.scale(Math.min(2.75 / Math.max(avNorm, 1e-8), 1), Av);
      const vTip = plane.p(vDraw);
      const avTip = plane.p(avDraw);
      const arcRadius = 72;
      const start = [plane.cx + arcRadius * Math.cos(theta), plane.cy - arcRadius * Math.sin(theta)];
      const avAngle = theta + signed;
      const end = [plane.cx + arcRadius * Math.cos(avAngle), plane.cy - arcRadius * Math.sin(avAngle)];
      const largeArc = Math.abs(signed) > Math.PI ? 1 : 0;
      const sweep = signed > 0 ? 0 : 1;

      let content = `<defs><clipPath id="ch7-eigen-disc"><rect x="${plane.x}" y="${plane.y}" width="${plane.width}" height="${plane.height}" rx="14"/></clipPath></defs>
        <g clip-path="url(#ch7-eigen-disc)">
          ${plane.grid()}${plane.axes()}
          <circle cx="${plane.cx}" cy="${plane.cy}" r="${plane.sx * 1.55}" fill="none" class="ch7-helper is-dashed"/>
          <path d="${curve(plane, A)}" fill="color-mix(in srgb, var(--coral) 7%, transparent)" stroke="color-mix(in srgb, var(--coral) 55%, transparent)" stroke-width="2" vector-effect="non-scaling-stroke"/>
          ${plane.line(v, hit ? "primary" : "guide", 4.4)}
          ${plane.vector(vDraw, "primary")}
          ${plane.vector(avDraw, hit ? "primary" : "secondary")}
          ${plane.hitLine(S.scale(3.2, v), "angle", S.scale(-3.2, v))}
          ${plane.handle(vDraw, "angle", "旋转候选向量 v")}
        </g>
        <text x="60" y="82" class="ch7-svg-caption">虚线圆：所有单位方向</text>
        <text x="60" y="105" class="ch7-svg-caption">珊瑚曲线：这些方向经过 A 后的终点</text>
        <text x="${vTip[0] + 14}" y="${vTip[1] - 14}" class="ch7-svg-label is-primary">v</text>
        <text x="${avTip[0] + 14}" y="${avTip[1] + 24}" class="ch7-svg-label is-${hit ? "primary" : "secondary"}">Av</text>`;

      if (bend > 1) {
        content += `<path d="M${start[0]} ${start[1]}A${arcRadius} ${arcRadius} 0 ${largeArc} ${sweep} ${end[0]} ${end[1]}" class="ch7-angle-arc"/>
          <text x="${plane.cx + 88}" y="${plane.cy - 76}" class="ch7-svg-label is-secondary">${S.fmt(bend, 1)}°</text>`;
      } else {
        content += `<circle cx="${plane.cx}" cy="${plane.cy}" r="82" fill="none" stroke="color-mix(in srgb, var(--accent) 28%, transparent)" stroke-width="8"/>
          <text x="${plane.cx + 92}" y="${plane.cy - 70}" class="ch7-svg-label is-primary">夹角为 0</text>`;
      }

      const tone = hit ? "pass" : directions.length ? "neutral" : "fail";
      const title = hit ? "两支箭头共线，候选直线被 T 保持" : directions.length ? "v 与 Av 仍张开夹角" : "每个实方向都会被旋转离开自身";
      const text = hit ? `现在才读取伸缩比 λ=${S.fmt(lambda)}。这条直线上的非零向量都是特征向量。` : directions.length ? "继续旋转，让偏转弧缩短到零。" : "90° 旋转在实数平面中没有特征方向。";
      const formula = hit ? "Av=\\lambda v" : directions.length ? "Av\\notin\\operatorname{span}(v)" : "\\mathbb{R}^2\\text{ 中没有特征向量}";
      shell.stage.innerHTML = S.svg(content, { width: 840, height: 600, label: "直接旋转向量 v 并观察 v 与 Av 的夹角" });
      shell.result.innerHTML = S.conclusion({ tone, title, text, formula, facts: [["偏转角", `${S.fmt(bend, 2)}°`], ["λ", hit ? S.fmt(lambda) : "夹角归零后读取"]] });
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
      const plane = S.createPlane({ x: 42, y: 54, width: 756, height: 500, extent: 3.35 });
      const vector = plane.v([((clientX - rect.left) / rect.width) * 840, ((clientY - rect.top) / rect.height) * 600]);
      let angle = Math.atan2(vector[1], vector[0]) * 180 / Math.PI;
      angle = ((angle % 180) + 180) % 180;
      state.angle = Math.round(angle);
      syncAngle();
      draw();
    });

    draw();
    return () => {
      cleanupRange();
      binder.cleanup();
    };
  }

  S.register("eigenvalues-eigenvectors", render);
})();
