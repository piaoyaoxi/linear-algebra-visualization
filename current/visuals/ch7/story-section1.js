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
      { value: "add", label: "加法路径" },
      { value: "scale", label: "数乘路径" },
      { value: "origin", label: "原点快检" },
    ];
    const state = { preset: 0, test: "add", u: [1.15, 0.55], v: [-0.55, 1.1], alpha: -1.4 };
    const shell = S.createLab(section, lesson, {
      layout: "two-paths",
      title: "先组合再变换，与先变换再组合，会到达同一点吗？",
      description: "线性由两条计算路径是否闭合来判断。图中不显示真假仪表，只让两个终点自己给出答案。",
      task: "拖动输入平面里的圆环手柄。观察输出平面两条路径的终点是否始终重合。",
    });
    shell.toolbar.innerHTML = `${S.buttonGroup("选择变换", presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset")}${S.buttonGroup("选择检验", tests, state.test, "test")}`;
    const binder = S.eventBinder();
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "标量 α", key: "alpha", min: -2, max: 2, step: 0.05 },
    ], state, () => draw());

    const apply = (vector) => {
      const preset = presets[state.preset];
      if (preset.kind === "translation") return S.add(S.matVec(preset.A, vector), preset.b);
      if (preset.kind === "absolute") return [Math.abs(vector[0]), vector[1]];
      return S.matVec(preset.A, vector);
    };

    const pathLabel = (x, y, text, role) => `<g><rect x="${x}" y="${y - 18}" width="${Math.max(78, text.length * 12 + 18)}" height="28" rx="14" class="ch7-stage-chip"/><text x="${x + 10}" y="${y + 1}" class="ch7-svg-label is-${role}">${text}</text></g>`;

    const draw = () => {
      shell.controls.hidden = state.test !== "scale";
      const left = S.createPlane({ x: 36, y: 100, width: 350, height: 380, extent: 2.7 });
      const right = S.createPlane({ x: 454, y: 100, width: 350, height: 380, extent: 3.1 });
      let content = `${left.grid()}${left.axes()}${right.grid()}${right.axes()}
        <text x="36" y="48" class="ch7-svg-title">输入：先在这里组合</text>
        <text x="36" y="73" class="ch7-svg-caption">拖动圆环，改变检验向量</text>
        <text x="454" y="48" class="ch7-svg-title">输出：比较两条路径</text>
        <text x="454" y="73" class="ch7-svg-caption">同一点表示本次检验通过</text>
        <path d="M404 290H436" class="ch7-helper"/>
        <text x="420" y="278" text-anchor="middle" class="ch7-svg-title">T</text>`;
      let tone = "neutral";
      let title = "";
      let text = "";
      let formula = "";
      let facts = [];

      if (state.test === "origin") {
        const image = apply([0, 0]);
        const error = S.norm(image);
        content += left.point([0, 0], "guide", 6, "0");
        content += right.point(image, error < 1e-7 ? "primary" : "secondary", 7, "T(0)");
        if (error >= 1e-7) {
          content += right.vector(image, "secondary");
          content += `<text x="476" y="520" class="ch7-svg-caption">原点被送离原点，一次检验已经得到反例。</text>`;
        }
        tone = error < 1e-7 ? "pass" : "fail";
        title = error < 1e-7 ? "原点仍然回到原点" : "原点被送到了别处";
        text = error < 1e-7 ? "这是线性的必要条件，还要继续检查加法和数乘。" : "线性变换必须把零向量送到零向量。";
        formula = "T(0)=0";
        facts = [["当前 T(0)", S.vectorText(image)]];
      } else if (state.test === "add") {
        const sum = S.add(state.u, state.v);
        const Tu = apply(state.u);
        const Tv = apply(state.v);
        const direct = apply(sum);
        const split = S.add(Tu, Tv);
        const error = S.norm(S.sub(direct, split));
        const origin = left.p([0, 0]);
        const uTip = left.p(state.u);
        const vTip = left.p(state.v);
        const sumTip = left.p(sum);
        const r0 = right.p([0, 0]);
        const rTu = right.p(Tu);
        const rDirect = right.p(direct);
        const rSplit = right.p(split);

        content += `<polygon points="${origin.join(",")} ${uTip.join(",")} ${sumTip.join(",")} ${vTip.join(",")}" class="ch7-band-guide"/>`;
        content += left.vector(state.u, "primary") + left.vector(state.v, "secondary");
        content += S.arrowPath(uTip[0], uTip[1], sumTip[0], sumTip[1], "is-secondary");
        content += S.arrowPath(vTip[0], vTip[1], sumTip[0], sumTip[1], "is-primary");
        content += left.handle(state.u, "u", "拖动 u") + left.handle(state.v, "v", "拖动 v");
        content += `<text x="${uTip[0] + 14}" y="${uTip[1] + 25}" class="ch7-svg-label is-primary">u</text>
          <text x="${vTip[0] - 24}" y="${vTip[1] - 17}" class="ch7-svg-label is-secondary">v</text>
          <text x="${sumTip[0] + 10}" y="${sumTip[1] - 14}" class="ch7-svg-label is-guide">u+v</text>`;

        content += S.arrowPath(r0[0], r0[1], rDirect[0], rDirect[1], "is-guide");
        content += S.arrowPath(r0[0], r0[1], rTu[0], rTu[1], "is-primary");
        content += S.arrowPath(rTu[0], rTu[1], rSplit[0], rSplit[1], "is-secondary");
        content += pathLabel(470, 516, "金色：T(u+v)", "guide") + pathLabel(625, 516, "青绿+珊瑚：T(u)+T(v)", "primary");
        if (error >= 0.012) {
          content += `<line x1="${rDirect[0]}" y1="${rDirect[1]}" x2="${rSplit[0]}" y2="${rSplit[1]}" class="ch7-leak"/>
            <text x="${(rDirect[0] + rSplit[0]) / 2 + 9}" y="${(rDirect[1] + rSplit[1]) / 2 - 9}" class="ch7-svg-label is-secondary">缺口</text>`;
        }
        tone = error < 0.012 ? "pass" : "fail";
        title = error < 0.012 ? "两条路径闭合在同一个终点" : "两条路径之间出现缺口";
        text = error < 0.012 ? "继续拖动时，直接路径和分开路径保持重合。" : "当前 u、v 已经构成不保持加法的反例。";
        formula = "T(u+v)=T(u)+T(v)";
        facts = [["终点距离", S.fmt(error, 4)]];
      } else {
        const scaled = S.scale(state.alpha, state.u);
        const direct = apply(scaled);
        const split = S.scale(state.alpha, apply(state.u));
        const error = S.norm(S.sub(direct, split));
        const uTip = left.p(state.u);
        const scaledTip = left.p(scaled);
        const directTip = right.p(direct);
        const splitTip = right.p(split);
        content += left.line(state.u, "muted", 3.7, "is-dashed");
        content += left.vector(state.u, "primary") + left.vector(scaled, "guide");
        content += left.handle(state.u, "u", "拖动 u");
        content += `<text x="${uTip[0] + 12}" y="${uTip[1] + 23}" class="ch7-svg-label is-primary">u</text>
          <text x="${scaledTip[0] + 12}" y="${scaledTip[1] - 13}" class="ch7-svg-label is-guide">αu</text>`;
        content += right.vector(direct, "guide") + right.vector(split, "primary");
        content += pathLabel(470, 516, "金色：T(αu)", "guide") + pathLabel(625, 516, "青绿：αT(u)", "primary");
        if (error >= 0.012) {
          content += `<line x1="${directTip[0]}" y1="${directTip[1]}" x2="${splitTip[0]}" y2="${splitTip[1]}" class="ch7-leak"/>`;
        }
        tone = error < 0.012 ? "pass" : "fail";
        title = error < 0.012 ? "数乘的两条路径保持闭合" : "负数缩放暴露了不一致";
        text = error < 0.012 ? "改变 α 或 u，两个终点仍然重合。" : "折叠映射不能保持负标量乘法。";
        formula = "T(\\alpha u)=\\alpha T(u)";
        facts = [["α", S.fmt(state.alpha)], ["终点距离", S.fmt(error, 4)]];
      }

      shell.stage.innerHTML = S.svg(content, { width: 840, height: 560, label: "拖动输入向量，比较线性条件中的两条计算路径" });
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
      const left = S.createPlane({ x: 36, y: 100, width: 350, height: 380, extent: 2.7 });
      const value = left.v([((clientX - rect.left) / rect.width) * 840, ((clientY - rect.top) / rect.height) * 560]).map((number) => S.clamp(number, -2.15, 2.15));
      const key = event.target?.closest?.("[data-drag]")?.dataset.drag || shell.stage.dataset.dragKey || "u";
      shell.stage.dataset.dragKey = key;
      state[key] = value;
      draw();
    });
    binder.on(window, "mouseup", () => { delete shell.stage.dataset.dragKey; });
    binder.on(window, "pointerup", () => { delete shell.stage.dataset.dragKey; });

    draw();
    return () => {
      cleanupRange();
      binder.cleanup();
    };
  }

  S.register("linear-map-definition", render);
})();
