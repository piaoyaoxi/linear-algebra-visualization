(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "线性拉伸", kind: "linear", A: [[1.25, 0.55], [-0.25, 1.05]] },
      { name: "平移反例", kind: "translation", A: [[1, 0], [0, 1]], b: [0.8, 0.45] },
      { name: "绝对值反例", kind: "absolute" },
    ];
    const stages = [
      { value: "origin", label: "原点" },
      { value: "add", label: "加法" },
      { value: "scale", label: "数乘" },
    ];
    const state = {
      preset: 0,
      stage: "add",
      u: [1.15, 0.55],
      v: [-0.45, 1.15],
      alpha: 1.55,
    };

    const shell = S.createStory(section, lesson, {
      title: "让两条计算路径在图上相遇",
      description: "直接拖动输入向量。线性要求先组合再变换，与先变换再组合，最终抵达同一个位置。",
    });
    shell.toolbar.innerHTML = `${S.buttons(presets.map((preset, index) => ({ value: index, label: preset.name })), state.preset, "preset")}${S.buttons(stages, state.stage, "stage")}`;
    const cleanupRange = S.mountRanges(shell.controls, [{ label: "数乘系数 α", key: "alpha", min: -2, max: 2, step: 0.05 }], state, () => draw());
    const binder = S.eventBinder();
    let dragTarget = null;

    const apply = (vector) => {
      const preset = presets[state.preset];
      if (preset.kind === "translation") return S.add(S.matVec(preset.A, vector), preset.b);
      if (preset.kind === "absolute") return [Math.abs(vector[0]), vector[1]];
      return S.matVec(preset.A, vector);
    };

    const draw = () => {
      shell.controls.hidden = state.stage !== "scale";
      const width = 980;
      const height = 560;
      const left = S.createPlane({ x: 35, y: 82, width: 420, height: 420, extent: 2.8 });
      const right = S.createPlane({ x: 525, y: 82, width: 420, height: 420, extent: 3.4 });
      const common = `${left.grid()}${left.axes()}${right.grid()}${right.axes()}
        <text x="55" y="55" class="ch7-story-panel-title">输入空间</text>
        <text x="545" y="55" class="ch7-story-panel-title">输出空间</text>
        <path d="M470 292 C485 272 495 272 510 292" class="ch7-story-helper"/>
        <text x="490" y="250" text-anchor="middle" class="ch7-story-big-label">T</text>`;
      let content = common;
      let tone = "neutral";
      let title = "";
      let text = "";
      let formula = "";
      let facts = [];

      if (state.stage === "origin") {
        const zero = [0, 0];
        const image = apply(zero);
        content += `${left.point(zero, "primary", 7, "0")}${right.point(image, S.norm(image) < 1e-6 ? "success" : "danger", 9, "T(0)")}`;
        if (S.norm(image) < 1e-6) {
          tone = "pass";
          title = "原点仍然回到原点";
          text = "这是线性的第一道快检。它还不够证明线性，但一旦失败就可以立即排除。";
        } else {
          tone = "fail";
          title = "原点被送到了别处";
          text = "平移已经破坏零向量条件，因此无需再检查其他输入。";
        }
        formula = "T(0)=0";
        facts = [["T(0)", S.vectorText(image)]];
      } else if (state.stage === "add") {
        const sum = S.add(state.u, state.v);
        const Tu = apply(state.u);
        const Tv = apply(state.v);
        const Tsum = apply(sum);
        const sumImages = S.add(Tu, Tv);
        const error = S.norm(S.sub(Tsum, sumImages));
        const leftU = left.p(state.u);
        const leftV = left.p(state.v);
        const leftSum = left.p(sum);
        const rightTu = right.p(Tu);
        const rightTv = right.p(Tv);
        const rightTsum = right.p(Tsum);
        const rightSumImages = right.p(sumImages);

        content += `<polygon points="${left.p([0, 0]).join(",")} ${leftU.join(",")} ${leftSum.join(",")} ${leftV.join(",")}" class="ch7-story-parallelogram"/>`;
        content += left.vector(state.u, "primary", "u") + left.vector(state.v, "secondary", "v") + left.vector(sum, "gold", "u+v");
        content += `${S.softArrow(right.cx, right.cy, rightTu[0], rightTu[1], "is-primary")}${S.softArrow(rightTu[0], rightTu[1], rightSumImages[0], rightSumImages[1], "is-secondary")}`;
        content += `${S.softArrow(right.cx, right.cy, rightTsum[0], rightTsum[1], error < 0.02 ? "is-success" : "is-output")}`;
        content += `<text x="${rightTu[0] + 8}" y="${rightTu[1] - 9}" class="ch7-story-label is-primary">T(u)</text>`;
        content += `<text x="${rightSumImages[0] + 10}" y="${rightSumImages[1] - 12}" class="ch7-story-label is-secondary">T(u)+T(v)</text>`;
        content += `<text x="${rightTsum[0] + 10}" y="${rightTsum[1] + 22}" class="ch7-story-label is-output">T(u+v)</text>`;
        content += `<circle cx="${leftU[0]}" cy="${leftU[1]}" r="10" class="ch7-story-handle" style="color:var(--story-primary)" data-drag-handle data-target="u"/>`;
        content += `<circle cx="${leftV[0]}" cy="${leftV[1]}" r="10" class="ch7-story-handle" style="color:var(--story-secondary)" data-drag-handle data-target="v"/>`;
        if (error >= 0.02) content += `<line x1="${rightTsum[0]}" y1="${rightTsum[1]}" x2="${rightSumImages[0]}" y2="${rightSumImages[1]}" class="ch7-story-gap"/>`;

        tone = error < 0.02 ? "pass" : "fail";
        title = error < 0.02 ? "两条路径在同一点闭合" : "两个终点之间出现了缺口";
        text = error < 0.02 ? "先把 u、v 相加再变换，与分别变换后相加，画面中的两个终点始终重合。" : "拖动 u、v 时缺口仍然存在，这个具体输入已经构成非线性的反例。";
        formula = "T(u+v)=T(u)+T(v)";
        facts = [["路径误差", S.fmt(error, 4)], ["T(u+v)", S.vectorText(Tsum)], ["T(u)+T(v)", S.vectorText(sumImages)]];
      } else {
        const scaled = S.scale(state.alpha, state.u);
        const Tu = apply(state.u);
        const Tscaled = apply(scaled);
        const scaledImage = S.scale(state.alpha, Tu);
        const error = S.norm(S.sub(Tscaled, scaledImage));
        const handle = left.p(state.u);
        const rightA = right.p(Tscaled);
        const rightB = right.p(scaledImage);
        content += left.vector(state.u, "primary", "u") + left.vector(scaled, "gold", "αu");
        content += right.vector(Tu, "primary", "T(u)") + right.vector(Tscaled, error < 0.02 ? "success" : "output", "T(αu)");
        content += `<line x1="${right.cx}" y1="${right.cy}" x2="${rightB[0]}" y2="${rightB[1]}" class="ch7-story-line is-secondary is-dashed"/>`;
        content += `<text x="${rightB[0] + 10}" y="${rightB[1] - 10}" class="ch7-story-label is-secondary">αT(u)</text>`;
        content += `<circle cx="${handle[0]}" cy="${handle[1]}" r="10" class="ch7-story-handle" style="color:var(--story-primary)" data-drag-handle data-target="u"/>`;
        if (error >= 0.02) content += `<line x1="${rightA[0]}" y1="${rightA[1]}" x2="${rightB[0]}" y2="${rightB[1]}" class="ch7-story-gap"/>`;
        tone = error < 0.02 ? "pass" : "fail";
        title = error < 0.02 ? "缩放可以穿过 T" : "缩放前后得到不同终点";
        text = error < 0.02 ? "改变 α 时，两条输出箭头始终完全重合。" : "当前映射没有保留数乘，因而不是线性变换。";
        formula = "T(\alpha u)=\alpha T(u)";
        facts = [["α", S.fmt(state.alpha)], ["路径误差", S.fmt(error, 4)]];
      }

      shell.stage.innerHTML = S.svg(content, { width, height, label: "线性变换的原点、加法和数乘路径实验" });
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
      const stage = event.target.closest("[data-stage]");
      if (stage) {
        state.stage = stage.dataset.stage;
        S.setActive(shell.toolbar, "[data-stage]", stage);
        draw();
      }
    });

    binder.on(shell.stage, "pointerdown", (event) => {
      const handle = event.target.closest("[data-drag-handle]");
      if (!handle) return;
      dragTarget = handle.dataset.target;
      event.target.closest("svg")?.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    }, { passive: false });
    binder.on(shell.stage, "pointermove", (event) => {
      if (!dragTarget) return;
      const svg = shell.stage.querySelector("svg");
      const rect = svg.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      const px = vb.x + ((event.clientX - rect.left) / rect.width) * vb.width;
      const py = vb.y + ((event.clientY - rect.top) / rect.height) * vb.height;
      const left = S.createPlane({ x: 35, y: 82, width: 420, height: 420, extent: 2.8 });
      const value = left.v([px, py]).map((component) => S.clamp(component, -2.35, 2.35));
      state[dragTarget] = value;
      draw();
      event.preventDefault();
    }, { passive: false });
    const endDrag = () => { dragTarget = null; };
    binder.on(shell.stage, "pointerup", endDrag);
    binder.on(shell.stage, "pointercancel", endDrag);

    draw();
    return () => {
      cleanupRange();
      binder.cleanup();
    };
  }

  S.register("linear-map-definition", render);
})();
