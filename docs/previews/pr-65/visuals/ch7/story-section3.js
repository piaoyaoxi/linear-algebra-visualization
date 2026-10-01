(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function render(section, lesson) {
    if (!section) return;
    const modes = [
      { value: "columns", label: "拖动两列" },
      { value: "rebuild", label: "重建 T(x)" },
      { value: "basis", label: "同一变换换基" },
    ];
    const bases = [
      { name: "标准基", P: [[1, 0], [0, 1]], symbol: "E" },
      { name: "斜基", P: [[1, 1], [0, 1]], symbol: "B" },
      { name: "特征基", P: [[1, 1], [1, -1]], symbol: "V" },
    ];
    const state = { mode: "columns", basis: 0, col1: [2, 1], col2: [1, 2], alpha: 1.1, beta: 0.7 };
    const shell = S.createLab(section, lesson, {
      layout: "matrix-columns",
      title: "为什么二维矩阵的两列，正好就是两根基向量的像？",
      description: "整张变换网格由两根列向量撑开。矩阵不是旁边的一张数字表，它和网格中的两根箭头是同一个信息。",
      task: "先拖动青绿、珊瑚圆环，观察整张网格和矩阵两列同步变化；再用同一组系数重建 T(x)。",
    });
    shell.toolbar.innerHTML = `${S.buttonGroup("观察", modes, state.mode, "mode")}<div data-basis-choice hidden>${S.buttonGroup("选基", bases.map((item, index) => ({ value: index, label: item.name })), state.basis, "basis")}</div>`;
    const binder = S.eventBinder();
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "输入坐标 α", key: "alpha", min: -2, max: 2, step: 0.05 },
      { label: "输入坐标 β", key: "beta", min: -2, max: 2, step: 0.05 },
    ], state, () => draw());

    const matrixFromColumns = () => [[state.col1[0], state.col2[0]], [state.col1[1], state.col2[1]]];
    const matrixPanel = (matrix, symbol, active = "") => `
      <rect x="638" y="126" width="170" height="292" rx="14" class="ch7-matrix-frame"/>
      <text x="723" y="164" text-anchor="middle" class="ch7-svg-title">[T]${symbol}</text>
      <path d="M675 201H662V333H675M771 201H784V333H771" class="ch7-helper"/>
      <rect x="683" y="211" width="38" height="111" rx="8" class="ch7-matrix-column ${active === "col1" ? "is-primary" : ""}"/>
      <rect x="733" y="211" width="38" height="111" rx="8" class="ch7-matrix-column ${active === "col2" ? "is-secondary" : ""}"/>
      <text x="702" y="250" text-anchor="middle" class="ch7-matrix-text">${S.fmt(matrix[0][0])}</text>
      <text x="702" y="299" text-anchor="middle" class="ch7-matrix-text">${S.fmt(matrix[1][0])}</text>
      <text x="752" y="250" text-anchor="middle" class="ch7-matrix-text">${S.fmt(matrix[0][1])}</text>
      <text x="752" y="299" text-anchor="middle" class="ch7-matrix-text">${S.fmt(matrix[1][1])}</text>
      <text x="702" y="357" text-anchor="middle" class="ch7-svg-label is-primary">T(b₁)</text>
      <text x="752" y="385" text-anchor="middle" class="ch7-svg-label is-secondary">T(b₂)</text>`;

    const draw = () => {
      const A = matrixFromColumns();
      const basis = bases[state.basis];
      const P = basis.P;
      const Pinv = S.inv2(P);
      const recorded = S.matMul(S.matMul(Pinv, A), P);
      const plane = S.createPlane({ x: 32, y: 66, width: 574, height: 470, extent: 4.1 });
      const b1 = [P[0][0], P[1][0]];
      const b2 = [P[0][1], P[1][1]];
      const x = S.add(S.scale(state.alpha, b1), S.scale(state.beta, b2));
      const Tx = S.matVec(A, x);
      const basisChoice = shell.toolbar.querySelector("[data-basis-choice]");
      if (basisChoice) basisChoice.hidden = state.mode !== "basis";
      shell.controls.hidden = state.mode === "columns";

      let content = `<defs><clipPath id="ch7-s3-grid"><rect x="${plane.x}" y="${plane.y}" width="${plane.width}" height="${plane.height}"/></clipPath></defs>
        <g clip-path="url(#ch7-s3-grid)">${S.transformedGrid(plane, A, { extent: 3.7, step: 0.5, role: "primary" })}</g>
        ${plane.axes()}
        <text x="32" y="38" class="ch7-svg-title">两根列向量撑开整张输出网格</text>`;
      let tone = "pass";
      let title = "";
      let text = "";
      let formula = "";
      let facts = [];

      if (state.mode === "columns") {
        content += plane.vector(state.col1, "primary") + plane.vector(state.col2, "secondary");
        content += plane.handle(state.col1, "col1", "拖动第一列") + plane.handle(state.col2, "col2", "拖动第二列");
        const c1 = plane.p(state.col1);
        const c2 = plane.p(state.col2);
        content += `<text x="${c1[0] + 14}" y="${c1[1] - 14}" class="ch7-svg-label is-primary">T(e₁)</text>
          <text x="${c2[0] + 14}" y="${c2[1] + 25}" class="ch7-svg-label is-secondary">T(e₂)</text>
          ${matrixPanel(A, "E", "")}`;
        title = "箭头坐标与矩阵两列同步改变";
        text = "知道 T(e₁) 和 T(e₂)，就知道了整张网格如何变化。";
        formula = "A=\\begin{bmatrix}\\vert&\\vert\\\\T(e_1)&T(e_2)\\\\\\vert&\\vert\\end{bmatrix}";
        facts = [["第一列", S.vectorText(state.col1)], ["第二列", S.vectorText(state.col2)]];
      } else if (state.mode === "rebuild") {
        const firstPart = S.scale(state.alpha, state.col1);
        content += plane.vector(state.col1, "muted") + plane.vector(state.col2, "muted");
        content += plane.vector(x, "guide", "x");
        content += S.arrowPath(plane.cx, plane.cy, ...plane.p(firstPart), "is-primary");
        content += S.arrowPath(...plane.p(firstPart), ...plane.p(Tx), "is-secondary");
        content += plane.vector(Tx, "primary");
        const firstTip = plane.p(firstPart);
        const txTip = plane.p(Tx);
        content += `<text x="${firstTip[0] + 12}" y="${firstTip[1] - 12}" class="ch7-svg-label is-primary">α·第1列</text>
          <text x="${txTip[0] + 12}" y="${txTip[1] - 12}" class="ch7-svg-label is-primary">T(x)</text>
          ${matrixPanel(A, "E", "")}`;
        title = "输入的同一组系数直接重组两列";
        text = "不必逐点重新定义 T，线性性已经把任意输入的像确定下来。";
        formula = "T(\\alpha e_1+\\beta e_2)=\\alpha T(e_1)+\\beta T(e_2)";
        facts = [["输入坐标", `(${S.fmt(state.alpha)}, ${S.fmt(state.beta)})`], ["输出", S.vectorText(Tx)]];
      } else {
        content = `<defs><clipPath id="ch7-s3-grid"><rect x="${plane.x}" y="${plane.y}" width="${plane.width}" height="${plane.height}"/></clipPath></defs>
          <g clip-path="url(#ch7-s3-grid)">${S.transformedGrid(plane, P, { extent: 3.6, step: 0.5, role: "muted" })}${S.transformedGrid(plane, A, { extent: 3.6, step: 0.5, role: "primary" })}</g>
          ${plane.axes()}${plane.line(b1, "primary", 4.3)}${plane.line(b2, "secondary", 4.3)}
          ${plane.vector(x, "guide", "同一个 x")}${plane.vector(Tx, "primary", "同一个 T(x)")}
          <text x="32" y="38" class="ch7-svg-title">真实向量不动，坐标记录随基改变</text>
          ${matrixPanel(recorded, basis.symbol, "")}`;
        const diagonal = Math.abs(recorded[0][1]) < 1e-7 && Math.abs(recorded[1][0]) < 1e-7;
        tone = diagonal ? "pass" : "neutral";
        title = diagonal ? "特征基让矩阵成为对角记录" : "换基没有改变真实空间中的 x 与 T(x)";
        text = diagonal ? "两根基向量各自沿自身方向伸缩，两个分量不再混合。" : "变化的是坐标网格和矩阵数字，不是线性变换本身。";
        formula = "[T]_B=P^{-1}AP";
        facts = [["当前基", basis.name], ["记录", `[[${S.fmt(recorded[0][0])}, ${S.fmt(recorded[0][1])}], [${S.fmt(recorded[1][0])}, ${S.fmt(recorded[1][1])}]]`]];
      }

      shell.stage.innerHTML = S.svg(content, { width: 840, height: 570, label: "拖动两根列向量并观察输出网格与矩阵同步改变" });
      shell.result.innerHTML = S.conclusion({ tone, title, text, formula, facts });
    };

    binder.on(shell.toolbar, "click", (event) => {
      const mode = event.target.closest("[data-mode]");
      if (mode) {
        state.mode = mode.dataset.mode;
        S.setActive(shell.toolbar, "[data-mode]", mode);
        draw();
        return;
      }
      const basis = event.target.closest("[data-basis]");
      if (basis) {
        state.basis = Number(basis.dataset.basis);
        S.setActive(shell.toolbar, "[data-basis]", basis);
        draw();
      }
    });

    S.bindDrag(binder, shell.stage, "[data-drag]", (clientX, clientY, event) => {
      if (state.mode !== "columns") return;
      const svg = shell.stage.querySelector("svg");
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const plane = S.createPlane({ x: 32, y: 66, width: 574, height: 470, extent: 4.1 });
      const value = plane.v([((clientX - rect.left) / rect.width) * 840, ((clientY - rect.top) / rect.height) * 570]).map((number) => S.clamp(number, -3.5, 3.5));
      const key = event.target?.closest?.("[data-drag]")?.dataset.drag || shell.stage.dataset.dragKey || "col1";
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

  S.register("matrix-of-linear-map", render);
})();
