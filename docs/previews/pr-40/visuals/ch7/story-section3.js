(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function render(section, lesson) {
    if (!section) return;
    const A = [[2, 1], [1, 2]];
    const bases = [
      { name: "标准基", P: [[1, 0], [0, 1]], symbol: "E" },
      { name: "斜基", P: [[1, 1], [0, 1]], symbol: "B" },
      { name: "特征基", P: [[1, 1], [1, -1]], symbol: "V" },
    ];
    const stages = [
      { value: "col1", label: "送入 b₁" },
      { value: "col2", label: "送入 b₂" },
      { value: "rebuild", label: "重建任意输入" },
      { value: "basis", label: "比较坐标记录" },
    ];
    const state = { basis: 0, stage: "col1", alpha: 1.15, beta: 0.7 };
    const shell = S.createStory(section, lesson, {
      title: "矩阵的两列，是两根基向量穿过 T 后留下的记录",
      description: "先只追踪一根基向量，再加入第二根。两列确定以后，整张网格和每一个输入的像都随之确定。",
    });
    shell.toolbar.innerHTML = `${S.buttons(bases.map((item, index) => ({ value: index, label: item.name })), state.basis, "basis")}${S.buttons(stages, state.stage, "stage")}`;
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "坐标 α", key: "alpha", min: -2, max: 2, step: 0.05 },
      { label: "坐标 β", key: "beta", min: -2, max: 2, step: 0.05 },
    ], state, () => draw());
    const binder = S.eventBinder();
    let dragging = false;

    const draw = () => {
      shell.controls.hidden = !["rebuild", "basis"].includes(state.stage);
      const basis = bases[state.basis];
      const P = basis.P;
      const Pinv = S.inv2(P);
      const Bmat = S.matMul(S.matMul(Pinv, A), P);
      const b1 = [P[0][0], P[1][0]];
      const b2 = [P[0][1], P[1][1]];
      const Tb1 = S.matVec(A, b1);
      const Tb2 = S.matVec(A, b2);
      const col1 = S.matVec(Pinv, Tb1);
      const col2 = S.matVec(Pinv, Tb2);
      const x = S.add(S.scale(state.alpha, b1), S.scale(state.beta, b2));
      const Tx = S.matVec(A, x);
      const width = 980;
      const height = 570;
      const plane = S.createPlane({ x: 45, y: 60, width: 650, height: 455, extent: 4.2 });
      const matrixX = 760;
      let content = `${plane.grid()}${plane.axes()}`;
      let title = "";
      let text = "";
      let formula = "";
      let facts = [];
      let tone = "neutral";

      content += `<rect x="730" y="80" width="215" height="400" rx="24" class="ch7-story-panel-bg"/>`;
      content += `<text x="760" y="118" class="ch7-story-panel-title">当前矩阵 [T]${basis.symbol}</text>`;
      content += `<text x="760" y="145" class="ch7-story-panel-subtitle">每一列都来自一根基向量的像</text>`;
      content += `<path d="M780 190 h-14 v160 h14 M915 190 h14 v160 h-14" class="ch7-story-helper"/>`;
      content += `<rect x="790" y="205" width="52" height="130" rx="12" class="ch7-story-column-bracket"/><rect x="854" y="205" width="52" height="130" rx="12" class="ch7-story-column-bracket"/>`;
      content += `<text x="816" y="245" text-anchor="middle" class="ch7-story-matrix-text">${S.fmt(col1[0])}</text><text x="816" y="305" text-anchor="middle" class="ch7-story-matrix-text">${S.fmt(col1[1])}</text>`;
      content += `<text x="880" y="245" text-anchor="middle" class="ch7-story-matrix-text">${S.fmt(col2[0])}</text><text x="880" y="305" text-anchor="middle" class="ch7-story-matrix-text">${S.fmt(col2[1])}</text>`;
      content += `<text x="816" y="372" text-anchor="middle" class="ch7-story-label is-primary">第 1 列</text><text x="880" y="372" text-anchor="middle" class="ch7-story-label is-secondary">第 2 列</text>`;

      const unitSquare = [[0, 0], b1, S.add(b1, b2), b2].map((point) => plane.p(point).join(",")).join(" ");
      const imageSquare = [[0, 0], Tb1, S.add(Tb1, Tb2), Tb2].map((point) => plane.p(point).join(",")).join(" ");

      if (state.stage === "col1") {
        content += plane.line(b1, "primary", 4.5, "is-dashed");
        content += plane.vector(b1, "primary", "b₁") + plane.vector(Tb1, "output", "T(b₁)");
        const end = plane.p(Tb1);
        content += `<path d="M${end[0] + 20} ${end[1]} C700 ${end[1]},720 250,770 250" class="ch7-story-trace"/>`;
        content += `<rect x="790" y="205" width="52" height="130" rx="12" fill="none" stroke="var(--story-primary)" stroke-width="4"/>`;
        title = "第一列从 T(b₁) 直接读出";
        text = "把 b₁ 送入算子，再用同一组基描述它的像；这两个坐标就是矩阵的第一列。";
        formula = "T(b_1)=a_{11}b_1+a_{21}b_2";
        facts = [["T(b₁) 的坐标", S.vectorText(col1)]];
      } else if (state.stage === "col2") {
        content += plane.line(b2, "secondary", 4.5, "is-dashed");
        content += plane.vector(b2, "secondary", "b₂") + plane.vector(Tb2, "output", "T(b₂)");
        const end = plane.p(Tb2);
        content += `<path d="M${end[0] + 20} ${end[1]} C700 ${end[1]},720 290,850 290" class="ch7-story-trace"/>`;
        content += `<rect x="854" y="205" width="52" height="130" rx="12" fill="none" stroke="var(--story-secondary)" stroke-width="4"/>`;
        title = "第二列从 T(b₂) 直接读出";
        text = "第二根基向量经过 T 后的坐标进入第二列。到这里，整个线性变换已经被两列唯一确定。";
        formula = "T(b_2)=a_{12}b_1+a_{22}b_2";
        facts = [["T(b₂) 的坐标", S.vectorText(col2)]];
      } else if (state.stage === "rebuild") {
        content += `<polygon points="${unitSquare}" class="ch7-story-parallelogram"/><polygon points="${imageSquare}" class="ch7-story-shape is-output"/>`;
        content += plane.vector(b1, "primary", "b₁") + plane.vector(b2, "secondary", "b₂");
        content += plane.vector(Tb1, "primary", "T(b₁)") + plane.vector(Tb2, "secondary", "T(b₂)");
        content += plane.vector(x, "gold", "x") + plane.vector(Tx, "output", "T(x)");
        const handle = plane.p(x);
        content += `<circle cx="${handle[0]}" cy="${handle[1]}" r="11" class="ch7-story-handle" style="color:var(--story-gold)" data-drag-handle/>`;
        content += `${plane.vector(S.scale(state.alpha, Tb1), "primary", "αT(b₁)")}`;
        const aT = S.scale(state.alpha, Tb1);
        const aTp = plane.p(aT);
        const txp = plane.p(Tx);
        content += S.softArrow(aTp[0], aTp[1], txp[0], txp[1], "is-secondary");
        title = "任意输入只是在重组这两列";
        text = "输入用系数 α、β 组合 b₁、b₂，输出便用完全相同的系数组合 T(b₁)、T(b₂)。";
        formula = "T(\alpha b_1+\beta b_2)=\alpha T(b_1)+\beta T(b_2)";
        facts = [["输入坐标", `(${S.fmt(state.alpha)}, ${S.fmt(state.beta)})`], ["T(x)", S.vectorText(Tx)]];
        tone = "pass";
      } else {
        content += S.transformedGrid(plane, P, { extent: 3.3, step: 0.5, role: "input" });
        content += S.transformedGrid(plane, S.matMul(A, P), { extent: 3.3, step: 0.5, role: "output" });
        content += plane.vector(b1, "primary", "b₁") + plane.vector(b2, "secondary", "b₂") + plane.vector(x, "gold", "同一个 x") + plane.vector(Tx, "output", "同一个 T(x)");
        const handle = plane.p(x);
        content += `<circle cx="${handle[0]}" cy="${handle[1]}" r="11" class="ch7-story-handle" style="color:var(--story-gold)" data-drag-handle/>`;
        const diagonal = Math.abs(Bmat[0][1]) < 1e-7 && Math.abs(Bmat[1][0]) < 1e-7;
        tone = diagonal ? "pass" : "neutral";
        title = diagonal ? "特征基让两列分别落到两条坐标轴上" : "基改变了数字记录，没有改变真实变换";
        text = diagonal ? "两个坐标分量不再混合，矩阵成为对角矩阵。" : "切换基时，真实空间中的 x 与 T(x) 没有被搬走；变化的只是坐标网格和矩阵数字。";
        formula = "[T]_B=P^{-1}AP";
        facts = [["当前基", basis.name], ["矩阵", `[[${S.fmt(Bmat[0][0])}, ${S.fmt(Bmat[0][1])}], [${S.fmt(Bmat[1][0])}, ${S.fmt(Bmat[1][1])}]]`]];
      }

      shell.stage.innerHTML = S.svg(content, { width, height, label: "基向量的像逐列生成线性变换矩阵" });
      shell.result.innerHTML = S.result({ tone, title, text, formula, facts });
    };

    binder.on(shell.toolbar, "click", (event) => {
      const basis = event.target.closest("[data-basis]");
      if (basis) {
        state.basis = Number(basis.dataset.basis);
        S.setActive(shell.toolbar, "[data-basis]", basis);
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
      const plane = S.createPlane({ x: 45, y: 60, width: 650, height: 455, extent: 4.2 });
      const point = plane.v([px, py]);
      const basis = bases[state.basis];
      const coordinates = S.matVec(S.inv2(basis.P), point);
      state.alpha = S.clamp(coordinates[0], -2, 2);
      state.beta = S.clamp(coordinates[1], -2, 2);
      shell.controls.querySelector('[data-key="alpha"]')?.setAttribute("value", state.alpha);
      shell.controls.querySelector('[data-key="beta"]')?.setAttribute("value", state.beta);
      const aInput = shell.controls.querySelector('[data-key="alpha"]');
      const bInput = shell.controls.querySelector('[data-key="beta"]');
      if (aInput) aInput.value = state.alpha;
      if (bInput) bInput.value = state.beta;
      const aOut = shell.controls.querySelector('[data-output="alpha"]');
      const bOut = shell.controls.querySelector('[data-output="beta"]');
      if (aOut) aOut.textContent = S.fmt(state.alpha);
      if (bOut) bOut.textContent = S.fmt(state.beta);
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

  S.register("matrix-of-linear-map", render);
})();
