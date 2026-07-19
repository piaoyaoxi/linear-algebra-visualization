(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "对称矩阵", A: [[2, 1], [1, 2]], P: [[1, 1], [1, -1]], D: [[3, 0], [0, 1]], note: "两条正交特征方向" },
      { name: "斜特征基", A: [[2, 1], [0, 1]], P: [[1, -1], [0, 1]], D: [[2, 0], [0, 1]], note: "特征方向不必正交" },
      { name: "Jordan 块", A: [[2, 1], [0, 2]], P: null, D: null, note: "只有一条独立特征方向" },
    ];
    const stages = [
      { value: "decompose", label: "1 分解" },
      { value: "scale", label: "2 独立缩放" },
      { value: "recombine", label: "3 重新合成" },
    ];
    const state = { preset: 0, stage: "decompose", x1: 1.25, x2: 0.8 };
    const shell = S.createStory(section, lesson, {
      title: "把混合运动拆成两条互不干扰的一维缩放",
      description: "同一个向量依次经过坐标翻译、独立缩放和返回原坐标。三个镜头只改变观察语言，不制造三个不同的空间。",
    });
    shell.toolbar.innerHTML = `${S.buttons(presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset")}${S.buttons(stages, state.stage, "stage")}`;
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "输入 x₁", key: "x1", min: -2, max: 2, step: 0.05 },
      { label: "输入 x₂", key: "x2", min: -2, max: 2, step: 0.05 },
    ], state, () => draw());
    const binder = S.eventBinder();

    const draw = () => {
      const preset = presets[state.preset];
      const x = [state.x1, state.x2];
      const width = 1000;
      const height = 570;
      const panelXs = [30, 350, 670];
      const planes = panelXs.map((panelX) => S.createPlane({ x: panelX + 18, y: 120, width: 284, height: 320, extent: 3.5 }));
      let content = "";
      const panelTitles = ["真实空间", "特征坐标", "回到真实空间"];
      const panelSubs = ["混合的几何作用", "两个坐标分量", "合成最终输出"];
      panelXs.forEach((panelX, index) => {
        content += `<rect x="${panelX}" y="70" width="310" height="405" rx="24" class="ch7-story-panel-bg"/><text x="${panelX + 22}" y="102" class="ch7-story-panel-title">${panelTitles[index]}</text><text x="${panelX + 22}" y="125" class="ch7-story-panel-subtitle">${panelSubs[index]}</text>`;
      });
      content += `<path d="M325 280 H340" class="ch7-story-helper"/><path d="M645 280 H660" class="ch7-story-helper"/>`;
      content += `<text x="333" y="260" text-anchor="middle" class="ch7-story-big-label">P⁻¹</text><text x="653" y="260" text-anchor="middle" class="ch7-story-big-label">P</text>`;

      if (!preset.P) {
        const plane = planes[0];
        content += plane.grid() + plane.axes() + S.transformedGrid(plane, preset.A, { extent: 3, step: 0.5, role: "output" });
        const eigen = [1, 0];
        const generalized = [0.55, 1.15];
        const Ag = S.matVec(preset.A, generalized);
        content += plane.line(eigen, "success", 4.2) + plane.vector(eigen, "success", "唯一特征方向");
        content += plane.vector(generalized, "secondary", "候选第二方向") + plane.vector(Ag, "output", "A(v₂)");
        content += `<path d="M${planes[1].cx - 75} ${planes[1].cy} H${planes[1].cx + 75}" class="ch7-story-line is-danger is-dashed"/><text x="${planes[1].cx}" y="${planes[1].cy - 28}" text-anchor="middle" class="ch7-story-big-label">缺少第二条独立特征轴</text>`;
        content += `<text x="${planes[2].cx}" y="${planes[2].cy}" text-anchor="middle" class="ch7-story-big-label">流程在这里停止</text>`;
        shell.stage.innerHTML = S.svg(content, { width, height, label: "Jordan 块因特征向量不足而无法对角化" });
        shell.result.innerHTML = S.result({
          tone: "fail",
          title: "不是所有矩阵都能找到一整组特征基",
          text: "这里只有一条独立特征直线。不能伪造第二个方向，因此 P 不可逆，P⁻¹AP=D 的流程从结构上失败。",
          formula: "A\\ne PDP^{-1}",
          facts: [["几何重数", "1"], ["空间维数", "2"]],
        });
        return;
      }

      const Pinv = S.inv2(preset.P);
      const coeff = S.matVec(Pinv, x);
      const v1 = [preset.P[0][0], preset.P[1][0]];
      const v2 = [preset.P[0][1], preset.P[1][1]];
      const component1 = S.scale(coeff[0], v1);
      const component2 = S.scale(coeff[1], v2);
      const scaled1 = S.scale(preset.D[0][0], component1);
      const scaled2 = S.scale(preset.D[1][1], component2);
      const Ax = S.add(scaled1, scaled2);
      const transformedX = S.matVec(preset.A, x);

      planes.forEach((plane) => { content += plane.grid() + plane.axes(); });
      content += S.transformedGrid(planes[0], preset.A, { extent: 3.1, step: 0.5, role: "output" });
      content += planes[0].line(v1, "primary", 4) + planes[0].line(v2, "secondary", 4);
      content += planes[0].vector(x, "gold", "x") + planes[0].vector(transformedX, "output", "Ax");
      content += planes[1].vector([coeff[0], 0], "primary", "c₁") + planes[1].vector([0, coeff[1]], "secondary", "c₂");
      content += `<line x1="${planes[1].cx}" y1="${planes[1].cy}" x2="${planes[1].p([coeff[0], coeff[1]])[0]}" y2="${planes[1].p([coeff[0], coeff[1]])[1]}" class="ch7-story-line is-gold is-dashed"/>`;
      content += planes[2].line(v1, "primary", 4) + planes[2].line(v2, "secondary", 4);
      content += planes[2].vector(scaled1, "primary", "λ₁c₁v₁") + planes[2].vector(scaled2, "secondary", "λ₂c₂v₂", scaled1) + planes[2].vector(Ax, "output", "Ax");

      if (state.stage === "decompose") {
        content += `<rect x="42" y="82" width="286" height="380" rx="20" fill="none" stroke="var(--story-gold)" stroke-width="4"/><rect x="362" y="82" width="286" height="380" rx="20" fill="none" stroke="var(--story-primary)" stroke-width="4" opacity="0.55"/>`;
      } else if (state.stage === "scale") {
        const before = planes[1].p([coeff[0], coeff[1]]);
        const after = planes[1].p([preset.D[0][0] * coeff[0], preset.D[1][1] * coeff[1]]);
        content += planes[1].vector([preset.D[0][0] * coeff[0], 0], "primary", "λ₁c₁") + planes[1].vector([0, preset.D[1][1] * coeff[1]], "secondary", "λ₂c₂");
        content += `<path d="M${before[0]} ${before[1]} Q${planes[1].cx + 45} ${planes[1].cy - 65},${after[0]} ${after[1]}" class="ch7-story-trace"/>`;
        content += `<rect x="362" y="82" width="286" height="380" rx="20" fill="none" stroke="var(--story-output)" stroke-width="4"/>`;
      } else {
        content += `<rect x="682" y="82" width="286" height="380" rx="20" fill="none" stroke="var(--story-success)" stroke-width="4"/>`;
      }

      let title;
      let text;
      let formula;
      if (state.stage === "decompose") {
        title = "P⁻¹ 只是在读取 x 沿两条特征方向的坐标";
        text = "真实向量没有被搬到另一个世界；我们只是把同一个 x 写成 c₁v₁+c₂v₂。";
        formula = "P^{-1}x=(c_1,c_2)";
      } else if (state.stage === "scale") {
        title = "D 分别缩放两个坐标，不让它们互相混合";
        text = "对角矩阵最重要的几何意义，就是每条特征方向只负责自己的伸缩。";
        formula = "D(c_1,c_2)=(\\lambda_1c_1,\\lambda_2c_2)";
      } else {
        title = "P 把缩放后的两个分量重新合成为真实输出 Ax";
        text = "三个步骤合起来仍是原来的变换 A；中间只是换了一种更容易计算的语言。";
        formula = "Ax=PDP^{-1}x";
      }
      const facts = [["特征坐标", S.vectorText(coeff)], ["特征值", `${S.fmt(preset.D[0][0])}, ${S.fmt(preset.D[1][1])}`], ["重构误差", S.fmt(S.norm(S.sub(Ax, transformedX)), 6)]];
      shell.stage.innerHTML = S.svg(content, { width, height, label: "对角化的坐标翻译、独立缩放与重新合成" });
      shell.result.innerHTML = S.result({ tone: "pass", title, text, formula, facts });
    };

    binder.on(shell.toolbar, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) {
        state.preset = Number(preset.dataset.preset);
        state.stage = "decompose";
        S.setActive(shell.toolbar, "[data-preset]", preset);
        const firstStage = shell.toolbar.querySelector('[data-stage="decompose"]');
        if (firstStage) S.setActive(shell.toolbar, "[data-stage]", firstStage);
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

    draw();
    return () => {
      cleanupRange();
      binder.cleanup();
    };
  }

  S.register("diagonal-matrices", render);
})();
