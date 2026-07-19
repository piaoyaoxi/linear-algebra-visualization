(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "剪切", kind: "linear", A: [[1, 0.8], [0, 1]] },
      { name: "投影", kind: "linear", A: [[1, 0], [0, 0]] },
      { name: "平移", kind: "translation", A: [[1, 0], [0, 1]], b: [0.75, 0.45] },
      { name: "折叠", kind: "absolute" },
    ];
    const tests = [
      { value: "add", label: "检验加法" },
      { value: "scale", label: "检验数乘" },
      { value: "origin", label: "检查原点" },
    ];
    const state = { preset: 0, test: "add", u: [1.15, 0.55], v: [-0.55, 1.1], alpha: -1.4 };
    const shell = S.createLab(section, lesson, {
      layout: "two-paths",
      title: "两条计算路径会不会到达同一点？",
      description: "线性不是一种外观。它要求先组合再变换，与先变换再组合，在每次实验中都得到相同结果。",
      task: "选择一种变换和一种检验，直接拖动图中向量的箭身，观察输出端的两个十字是否始终重合。",
    });
    shell.toolbar.innerHTML = `${S.buttonGroup("变换", presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset")}${S.buttonGroup("检验", tests, state.test, "test")}`;
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "标量 α", key: "alpha", min: -2, max: 2, step: 0.05 },
    ], state, () => draw());
    const binder = S.eventBinder();

    const apply = (vector) => {
      const preset = presets[state.preset];
      if (preset.kind === "translation") return S.add(S.matVec(preset.A, vector), preset.b);
      if (preset.kind === "absolute") return [Math.abs(vector[0]), vector[1]];
      return S.matVec(preset.A, vector);
    };

    const draw = () => {
      shell.controls.hidden = state.test !== "scale";
      const left = S.createPlane({ x: 40, y: 100, width: 390, height: 360, extent: 2.7 });
      const right = S.createPlane({ x: 550, y: 100, width: 390, height: 360, extent: 3.1 });
      let content = `${left.grid()}${left.axes()}${right.grid()}${right.axes()}
        <text x="40" y="58" class="ch7-svg-title">输入空间</text>
        <text x="550" y="58" class="ch7-svg-title">输出空间</text>
        <path d="M455 280H525" class="ch7-helper"/>
        <text x="490" y="265" text-anchor="middle" class="ch7-svg-title">T</text>`;
      let tone = "neutral";
      let title = "";
      let text = "";
      let formula = "";
      let facts = [];

      if (state.test === "origin") {
        const image = apply([0, 0]);
        const error = S.norm(image);
        content += left.cross([0, 0], "primary", 7, "0") + right.cross(image, error < 1e-7 ? "primary" : "danger", 7, "T(0)");
        content += `<text x="60" y="505" class="ch7-svg-caption">原点不是向量端点，这里用十字标记位置。</text>`;
        tone = error < 1e-7 ? "pass" : "fail";
        title = error < 1e-7 ? "原点仍然回到原点" : "平移把原点送到了别处";
        text = error < 1e-7 ? "这是必要条件。继续检查加法和数乘，才能确认线性。" : "一次原点检查已经足以否定线性。";
        formula = "T(0)=0";
        facts = [["T(0)", S.vectorText(image)]];
      } else if (state.test === "add") {
        const sum = S.add(state.u, state.v);
        const Tu = apply(state.u);
        const Tv = apply(state.v);
        const direct = apply(sum);
        const split = S.add(Tu, Tv);
        const error = S.norm(S.sub(direct, split));
        const p0 = left.p([0, 0]);
        const pu = left.p(state.u);
        const pv = left.p(state.v);
        const ps = left.p(sum);
        const r0 = right.p([0, 0]);
        const rTu = right.p(Tu);
        const rSplit = right.p(split);
        content += `<polygon points="${p0.join(",")} ${pu.join(",")} ${ps.join(",")} ${pv.join(",")}" class="ch7-band-primary" opacity="0.52"/>`;
        content += left.vector(state.u, "primary") + left.vector(state.v, "secondary") + left.vector(sum, "guide");
        content += `<text x="${pu[0] + 10}" y="${pu[1] + 20}" class="ch7-svg-label is-primary">u</text>
          <text x="${pv[0] - 20}" y="${pv[1] - 12}" class="ch7-svg-label is-secondary">v</text>
          <text x="${ps[0] + 10}" y="${ps[1] - 12}" class="ch7-svg-label is-guide">u+v</text>`;
        content += left.hitLine(state.u, "u") + left.hitLine(state.v, "v");
        content += S.arrowPath(r0[0], r0[1], rTu[0], rTu[1], "is-primary");
        content += S.arrowPath(rTu[0], rTu[1], rSplit[0], rSplit[1], "is-secondary");
        content += right.vector(direct, "guide");
        const directPoint = right.p(direct);
        const splitPoint = right.p(split);
        if (error < 0.012) {
          content += right.cross(direct, "primary", 8);
          content += `<text x="${directPoint[0] + 13}" y="${directPoint[1] - 13}" class="ch7-svg-label is-guide">T(u+v)</text>
            <text x="${directPoint[0] + 13}" y="${directPoint[1] + 20}" class="ch7-svg-label is-primary">T(u)+T(v)</text>`;
        } else {
          content += right.cross(direct, "guide", 7) + right.cross(split, "danger", 7);
          content += `<text x="${directPoint[0] + 12}" y="${directPoint[1] - 12}" class="ch7-svg-label is-guide">T(u+v)</text>
            <text x="${splitPoint[0] + 12}" y="${splitPoint[1] + 20}" class="ch7-svg-label is-danger">T(u)+T(v)</text>`;
          const a = right.p(direct);
          const b = right.p(split);
          content += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ch7-leak"/>`;
        }
        tone = error < 0.012 ? "pass" : "fail";
        title = error < 0.012 ? "两条路径始终落在同一个十字上" : "两个终点之间出现了可见缺口";
        text = error < 0.012 ? "拖动 u、v 时，先相加和先变换的结果持续重合。" : "当前输入已经给出加法不保持的反例。";
        formula = "T(u+v)=T(u)+T(v)";
        facts = [["路径误差", S.fmt(error, 4)], ["直接路径", S.vectorText(direct)], ["分开路径", S.vectorText(split)]];
      } else {
        const scaled = S.scale(state.alpha, state.u);
        const direct = apply(scaled);
        const split = S.scale(state.alpha, apply(state.u));
        const error = S.norm(S.sub(direct, split));
        const uPoint = left.p(state.u);
        const scaledPoint = left.p(scaled);
        const directPoint = right.p(direct);
        const splitPoint = right.p(split);
        content += left.vector(state.u, "primary") + left.vector(scaled, "guide") + left.hitLine(state.u, "u");
        content += `<text x="${uPoint[0] + 10}" y="${uPoint[1] + 20}" class="ch7-svg-label is-primary">u</text>
          <text x="${scaledPoint[0] + 10}" y="${scaledPoint[1] - 12}" class="ch7-svg-label is-guide">αu</text>`;
        content += right.vector(direct, "guide") + right.vector(split, "primary");
        if (error < 0.012) {
          content += right.cross(direct, "primary", 8);
          content += `<text x="${directPoint[0] + 13}" y="${directPoint[1] - 13}" class="ch7-svg-label is-guide">T(αu)</text>
            <text x="${directPoint[0] + 13}" y="${directPoint[1] + 20}" class="ch7-svg-label is-primary">αT(u)</text>`;
        }
        else {
          content += right.cross(direct, "guide", 7) + right.cross(split, "danger", 7);
          content += `<text x="${directPoint[0] + 12}" y="${directPoint[1] - 12}" class="ch7-svg-label is-guide">T(αu)</text>
            <text x="${splitPoint[0] + 12}" y="${splitPoint[1] + 20}" class="ch7-svg-label is-danger">αT(u)</text>`;
          const a = right.p(direct);
          const b = right.p(split);
          content += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ch7-leak"/>`;
        }
        tone = error < 0.012 ? "pass" : "fail";
        title = error < 0.012 ? "缩放可以穿过 T" : "负数缩放暴露了不一致";
        text = error < 0.012 ? "改变 α 时，两个输出仍落在同一点。" : "折叠映射不能保持负标量乘法。";
        formula = "T(\\alpha u)=\\alpha T(u)";
        facts = [["α", S.fmt(state.alpha)], ["路径误差", S.fmt(error, 4)]];
      }

      shell.stage.innerHTML = S.svg(content, { width: 980, height: 530, label: "线性变换的两条计算路径比较" });
      shell.result.innerHTML = S.conclusion({ tone, title, text, formula, facts });
    };

    binder.on(shell.toolbar, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) {
        state.preset = Number(preset.dataset.preset);
        S.setActive(shell.toolbar, "[data-preset]", preset);
        draw();
        return;
      }
      const test = event.target.closest("[data-test]");
      if (test) {
        state.test = test.dataset.test;
        S.setActive(shell.toolbar, "[data-test]", test);
        draw();
      }
    });

    S.bindDrag(binder, shell.stage, "[data-drag]", (clientX, clientY, event) => {
      if (state.test === "origin") return;
      const svg = shell.stage.querySelector("svg");
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const left = S.createPlane({ x: 40, y: 100, width: 390, height: 360, extent: 2.7 });
      const value = left.v([((clientX - rect.left) / rect.width) * 980, ((clientY - rect.top) / rect.height) * 530]).map((n) => S.clamp(n, -2.25, 2.25));
      const key = event.target?.closest?.("[data-drag]")?.dataset.drag || shell.stage.dataset.dragKey || "u";
      shell.stage.dataset.dragKey = key;
      state[key] = value;
      draw();
    });

    binder.on(window, "mouseup", () => { delete shell.stage.dataset.dragKey; });
    binder.on(window, "pointerup", () => { delete shell.stage.dataset.dragKey; });
    draw();
    return () => { cleanupRange(); binder.cleanup(); };
  }

  S.register("linear-map-definition", render);
})();
