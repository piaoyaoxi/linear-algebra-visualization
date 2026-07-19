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
      { value: "col1", label: "记录第一列" },
      { value: "col2", label: "记录第二列" },
      { value: "rebuild", label: "重建任意输入" },
      { value: "basis", label: "比较换基" },
    ];
    const state = { basis: 0, stage: "col1", alpha: 1.1, beta: 0.7 };
    const shell = S.createLab(section, lesson, {
      layout: "matrix-columns",
      title: "矩阵的两列究竟从哪里来？",
      description: "先把一根基向量送入 T，再把它的像写成坐标。第二根基向量重复同样动作，两列便完整记录了变换。",
      task: "依次记录第一列和第二列，再拖动 α、β，检验任意输入的像能否只由这两列重建。",
    });
    shell.toolbar.innerHTML = `${S.buttonGroup("基", bases.map((item, index) => ({ value: index, label: item.name })), state.basis, "basis")}${S.buttonGroup("观察", stages, state.stage, "stage")}`;
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "坐标 α", key: "alpha", min: -2, max: 2, step: 0.05 },
      { label: "坐标 β", key: "beta", min: -2, max: 2, step: 0.05 },
    ], state, () => draw());
    const binder = S.eventBinder();

    const drawMatrix = (col1, col2, active) => `
      <rect x="748" y="128" width="188" height="270" rx="12" class="ch7-matrix-frame"/>
      <text x="842" y="164" text-anchor="middle" class="ch7-svg-title">[T]${bases[state.basis].symbol}</text>
      <path d="M782 196H770V342H782M902 196H914V342H902" class="ch7-helper"/>
      <rect x="790" y="205" width="48" height="126" rx="8" class="ch7-matrix-column ${active === 1 ? "is-primary" : ""}"/>
      <rect x="850" y="205" width="48" height="126" rx="8" class="ch7-matrix-column ${active === 2 ? "is-secondary" : ""}"/>
      <text x="814" y="247" text-anchor="middle" class="ch7-matrix-text">${S.fmt(col1[0])}</text>
      <text x="814" y="302" text-anchor="middle" class="ch7-matrix-text">${S.fmt(col1[1])}</text>
      <text x="874" y="247" text-anchor="middle" class="ch7-matrix-text">${S.fmt(col2[0])}</text>
      <text x="874" y="302" text-anchor="middle" class="ch7-matrix-text">${S.fmt(col2[1])}</text>
      <text x="814" y="368" text-anchor="middle" class="ch7-svg-label is-primary">第 1 列</text>
      <text x="874" y="368" text-anchor="middle" class="ch7-svg-label is-secondary">第 2 列</text>`;

    const draw = () => {
      shell.controls.hidden = !["rebuild", "basis"].includes(state.stage);
      const basis = bases[state.basis];
      const P = basis.P;
      const Pinv = S.inv2(P);
      const matrix = S.matMul(S.matMul(Pinv, A), P);
      const b1 = [P[0][0], P[1][0]];
      const b2 = [P[0][1], P[1][1]];
      const Tb1 = S.matVec(A, b1);
      const Tb2 = S.matVec(A, b2);
      const col1 = S.matVec(Pinv, Tb1);
      const col2 = S.matVec(Pinv, Tb2);
      const x = S.add(S.scale(state.alpha, b1), S.scale(state.beta, b2));
      const Tx = S.matVec(A, x);
      const plane = S.createPlane({ x: 40, y: 72, width: 660, height: 430, extent: 4.1 });
      let content = `${plane.grid()}${plane.axes()}${drawMatrix(col1, col2, state.stage === "col1" ? 1 : state.stage === "col2" ? 2 : 0)}`;
      let tone = "neutral";
      let title = "";
      let text = "";
      let formula = "";
      let facts = [];

      if (state.stage === "col1") {
        content += plane.vector(b1, "muted", "b₁") + plane.vector(Tb1, "primary", "T(b₁)");
        const tip = plane.p(Tb1);
        content += `<path d="M${tip[0] + 14} ${tip[1]}C700 ${tip[1]},716 250,790 250" class="ch7-trace"/>`;
        title = "T(b₁) 的坐标直接进入第一列";
        text = "这一列只回答一个问题：第一根基向量经过 T 后，沿两根基向量各走多少。";
        formula = "T(b_1)=a_{11}b_1+a_{21}b_2";
        facts = [["第一列", S.vectorText(col1)]];
      } else if (state.stage === "col2") {
        content += plane.vector(b2, "muted", "b₂") + plane.vector(Tb2, "secondary", "T(b₂)");
        const tip = plane.p(Tb2);
        content += `<path d="M${tip[0] + 14} ${tip[1]}C700 ${tip[1]},716 292,850 292" class="ch7-trace"/>`;
        title = "T(b₂) 的坐标进入第二列";
        text = "两列都确定以后，线性性保证每个输入的像都已经确定。";
        formula = "T(b_2)=a_{12}b_1+a_{22}b_2";
        facts = [["第二列", S.vectorText(col2)]];
      } else if (state.stage === "rebuild") {
        const aTb1 = S.scale(state.alpha, Tb1);
        content += plane.vector(b1, "primary", "b₁") + plane.vector(b2, "secondary", "b₂");
        content += plane.vector(x, "guide", "x") + plane.vector(Tx, "primary", "T(x)");
        content += S.arrowPath(plane.cx, plane.cy, ...plane.p(aTb1), "is-primary");
        content += S.arrowPath(...plane.p(aTb1), ...plane.p(Tx), "is-secondary");
        content += `<text x="66" y="486" class="ch7-svg-caption">输入系数原样复制到两列的线性组合中。</text>`;
        tone = "pass";
        title = "任意输入只是用同一组系数重组两列";
        text = "α、β 改变时，输出始终由 αT(b₁)+βT(b₂) 得到。";
        formula = "T(\\alpha b_1+\\beta b_2)=\\alpha T(b_1)+\\beta T(b_2)";
        facts = [["输入坐标", `(${S.fmt(state.alpha)}, ${S.fmt(state.beta)})`], ["T(x)", S.vectorText(Tx)]];
      } else {
        content = `${S.transformedGrid(plane, P, { extent: 3.2, step: 0.5, role: "primary" })}${plane.axes()}${drawMatrix(col1, col2, 0)}`;
        content += plane.vector(b1, "primary", "b₁") + plane.vector(b2, "secondary", "b₂") + plane.vector(x, "guide", "同一个 x") + plane.vector(Tx, "primary", "同一个 T(x)");
        const diagonal = Math.abs(matrix[0][1]) < 1e-7 && Math.abs(matrix[1][0]) < 1e-7;
        tone = diagonal ? "pass" : "neutral";
        title = diagonal ? "特征基让两列分别落在两条坐标轴上" : "换基只改变坐标记录，不改变真实向量";
        text = diagonal ? "两个分量不再相互混合，所以矩阵成为对角矩阵。" : "网格和矩阵数字发生变化，x 与 T(x) 在真实空间中的位置保持不变。";
        formula = "[T]_B=P^{-1}AP";
        facts = [["当前基", basis.name], ["矩阵", `[[${S.fmt(matrix[0][0])}, ${S.fmt(matrix[0][1])}], [${S.fmt(matrix[1][0])}, ${S.fmt(matrix[1][1])}]]`]];
      }

      shell.stage.innerHTML = S.svg(content, { width: 980, height: 550, label: "基向量的像直接生成矩阵两列" });
      shell.result.innerHTML = S.conclusion({ tone, title, text, formula, facts });
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

    draw();
    return () => { cleanupRange(); binder.cleanup(); };
  }

  S.register("matrix-of-linear-map", render);
})();
