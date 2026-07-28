(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "对称矩阵", A: [[2, 1], [1, 2]] },
      { name: "剪切", A: [[1, 1], [0, 1]] },
      { name: "反射", A: [[1, 0], [0, -1]] },
      { name: "90° 旋转", A: [[0, -1], [1, 0]] },
    ];
    const modes = [
      { value: "line", label: "一维候选 W" },
      { value: "whole", label: "整个空间 V" },
      { value: "zero", label: "零子空间 {0}" },
    ];
    const state = { preset: 0, mode: "line", angle: 20 };
    const shell = S.createLab(section, lesson, {
      layout: "eigen-pair",
      title: "把整条 W 送入 T 后，得到的 T(W) 还与 W 是同一条直线吗？",
      description: "不再用五个点代替整个子空间。金色是候选 W，珊瑚是整条像子空间 T(W)，两条直线的夹角就是是否泄漏的证据。",
      task: "抓住 W 上的圆环旋转候选子空间。让金色 W 与珊瑚 T(W) 重合，再观察左下角泄漏系数是否同时归零。",
    });
    shell.toolbar.innerHTML = `${S.buttonGroup("选择变换", presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset")}${S.buttonGroup("候选子空间", modes, state.mode, "mode")}`;
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

    const band = (plane, direction, role) => {
      const unit = S.normalize(direction);
      const normal = [-unit[1], unit[0]];
      const points = [
        S.add(S.scale(-4.4, unit), S.scale(0.11, normal)),
        S.add(S.scale(4.4, unit), S.scale(0.11, normal)),
        S.add(S.scale(4.4, unit), S.scale(-0.11, normal)),
        S.add(S.scale(-4.4, unit), S.scale(-0.11, normal)),
      ];
      return `<polygon points="${points.map((point) => plane.p(point).join(",")).join(" ")}" class="ch7-band-${role}"/>`;
    };

    const draw = () => {
      shell.controls.hidden = state.mode !== "line";
      const A = presets[state.preset].A;
      const plane = S.createPlane({ x: 38, y: 64, width: 764, height: 500, extent: 3.5 });
      let content = `${plane.grid()}${plane.axes()}`;
      let tone = "pass";
      let title = "";
      let text = "";
      let formula = "";
      let facts = [];

      if (state.mode === "whole") {
        content += `<rect x="${plane.x + 10}" y="${plane.y + 10}" width="${plane.width - 20}" height="${plane.height - 20}" rx="18" class="ch7-band-primary" opacity="0.58"/>
          <text x="${plane.cx}" y="${plane.cy - 8}" text-anchor="middle" class="ch7-svg-title">W=V</text>
          <text x="${plane.cx}" y="${plane.cy + 28}" text-anchor="middle" class="ch7-svg-caption">T 的每个输出仍然属于整个空间 V</text>`;
        title = "整个空间对任何线性算子都不变";
        text = "这是平凡不变子空间。真正携带结构信息的是中间维数的子空间。";
        formula = "T(V)\\subseteq V";
        facts = [["类型", "平凡不变子空间"]];
      } else if (state.mode === "zero") {
        content += `<circle cx="${plane.cx}" cy="${plane.cy}" r="12" fill="var(--surface-solid)" stroke="var(--accent-strong)" stroke-width="3"/>
          <text x="${plane.cx + 24}" y="${plane.cy - 18}" class="ch7-svg-label is-primary">W={0}</text>
          <text x="${plane.cx + 24}" y="${plane.cy + 18}" class="ch7-svg-caption">线性保证 T(0)=0</text>`;
        title = "零子空间也始终不变";
        text = "这里只有一个向量，线性变换把它固定在零向量。";
        formula = "T(\\{0\\})=\\{0\\}";
        facts = [["类型", "平凡不变子空间"]];
      } else {
        const theta = state.angle * Math.PI / 180;
        const direction = [Math.cos(theta), Math.sin(theta)];
        const imageDirection = S.matVec(A, direction);
        const imageNorm = S.norm(imageDirection);
        const signed = imageNorm < 1e-8 ? 0 : Math.atan2(S.cross2(direction, imageDirection), Math.abs(S.dot(direction, imageDirection)));
        const angleGap = Math.abs(signed) * 180 / Math.PI;
        const normal = [-direction[1], direction[0]];
        const P = [[direction[0], normal[0]], [direction[1], normal[1]]];
        const B = S.matMul(S.matMul(S.inv2(P), A), P);
        const geometricLeak = Math.abs(S.cross2(direction, imageDirection));
        const matrixLeak = Math.abs(B[1][0]);
        const invariant = imageNorm < 1e-8 || geometricLeak < 0.025;
        content += band(plane, direction, "guide");
        content += plane.line(direction, "guide", 4.6);
        if (imageNorm > 1e-8) {
          content += band(plane, imageDirection, invariant ? "primary" : "secondary");
          content += plane.line(imageDirection, invariant ? "primary" : "secondary", 4.6);
        }
        content += plane.handle(S.scale(1.9, direction), "angle", "旋转候选子空间 W");
        content += plane.hitLine(S.scale(3.35, direction), "angle", S.scale(-3.35, direction));
        content += `<text x="58" y="92" class="ch7-svg-label is-guide">W</text>
          <text x="58" y="120" class="ch7-svg-label is-${invariant ? "primary" : "secondary"}">${invariant ? "T(W)=W" : "T(W)"}</text>`;

        if (!invariant) {
          const radius = 68;
          const start = [plane.cx + radius * Math.cos(theta), plane.cy - radius * Math.sin(theta)];
          const endAngle = theta + signed;
          const end = [plane.cx + radius * Math.cos(endAngle), plane.cy - radius * Math.sin(endAngle)];
          content += `<path d="M${start[0]} ${start[1]}A${radius} ${radius} 0 0 ${signed > 0 ? 0 : 1} ${end[0]} ${end[1]}" class="ch7-angle-arc"/>
            <text x="${plane.cx + 106}" y="${plane.cy - 76}" class="ch7-svg-label is-secondary">子空间夹角 ${S.fmt(angleGap, 1)}°</text>`;
        } else {
          content += `<text x="${plane.cx + 78}" y="${plane.cy - 62}" class="ch7-svg-label is-primary">整条像仍在线内</text>`;
        }

        tone = invariant ? "pass" : "fail";
        title = invariant ? "整条 T(W) 与 W 重合" : "T(W) 整体旋转离开了 W";
        text = invariant ? "这里不要求每个向量保持不动，只要求所有像仍属于 W。" : "子空间夹角非零，适应基下的左下角泄漏系数也非零。";
        formula = invariant ? "T(W)\\subseteq W" : "T(W)\\not\\subseteq W";
        facts = [["子空间夹角", `${S.fmt(angleGap, 2)}°`], ["左下角系数", S.fmt(B[1][0], 4)], ["是否不变", invariant ? "是" : "否"]];
        shell.root.dataset.invariantPass = String(Math.abs(geometricLeak - matrixLeak) < 1e-7);
      }

      shell.stage.innerHTML = S.svg(content, { width: 840, height: 600, label: "旋转整个候选子空间并比较 W 与 T(W) 是否重合" });
      shell.result.innerHTML = S.conclusion({ tone, title, text, formula, facts });
    };

    binder.on(shell.toolbar, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) {
        state.preset = Number(preset.dataset.preset);
        state.mode = "line";
        state.angle = 20;
        syncAngle();
        S.setActive(shell.toolbar, "[data-preset]", preset);
        const line = shell.toolbar.querySelector('[data-mode="line"]');
        if (line) S.setActive(shell.toolbar, "[data-mode]", line);
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

    S.bindDrag(binder, shell.stage, "[data-drag]", (clientX, clientY) => {
      if (state.mode !== "line") return;
      const svg = shell.stage.querySelector("svg");
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const plane = S.createPlane({ x: 38, y: 64, width: 764, height: 500, extent: 3.5 });
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

  S.register("invariant-subspaces", render);
})();
