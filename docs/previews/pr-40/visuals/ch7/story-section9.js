(() => {
  const S = window.Ch7Story;
  if (!S) return;

  const identity = (n) => Array.from({ length: n }, (_, row) => Array.from({ length: n }, (_, column) => row === column ? 1 : 0));
  const zero = (n) => Array.from({ length: n }, () => Array(n).fill(0));
  const matAdd = (A, B) => A.map((row, i) => row.map((value, j) => value + B[i][j]));
  const matScale = (factor, A) => A.map((row) => row.map((value) => factor * value));
  const basisVector = (n, index) => Array.from({ length: n }, (_, i) => i === index ? 1 : 0);
  const matrixNorm = (A) => Math.sqrt(A.flat().reduce((sum, value) => sum + value * value, 0));
  const project = (vector) => {
    const directions = [[1, 0], [0, 1], [-0.72, 0.62]];
    return vector.reduce((sum, value, index) => S.add(sum, S.scale(value, directions[index] || [0.6, -0.5])), [0, 0]);
  };

  function polynomialMatrix(A, coefficients) {
    let result = zero(A.length);
    let power = identity(A.length);
    coefficients.forEach((coefficient) => {
      result = matAdd(result, matScale(coefficient, power));
      power = S.matMul(power, A);
    });
    return result;
  }

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "diag(2,3)", A: [[2, 0], [0, 3]], candidates: [{ label: "t-2", c: [-2, 1] }, { label: "(t-2)(t-3)", c: [6, -5, 1] }, { label: "χ(t)", c: [6, -5, 1] }], minimal: "(t-2)(t-3)", characteristic: "(t-2)(t-3)", degree: 2 },
      { name: "2I₂", A: [[2, 0], [0, 2]], candidates: [{ label: "t-2", c: [-2, 1] }, { label: "(t-2)²", c: [4, -4, 1] }, { label: "χ(t)", c: [4, -4, 1] }], minimal: "t-2", characteristic: "(t-2)²", degree: 1 },
      { name: "J₂(2)", A: [[2, 1], [0, 2]], candidates: [{ label: "t-2", c: [-2, 1] }, { label: "(t-2)²", c: [4, -4, 1] }, { label: "χ(t)", c: [4, -4, 1] }], minimal: "(t-2)²", characteristic: "(t-2)²", degree: 2 },
      { name: "J₃(2)", A: [[2, 1, 0], [0, 2, 1], [0, 0, 2]], candidates: [{ label: "t-2", c: [-2, 1] }, { label: "(t-2)²", c: [4, -4, 1] }, { label: "(t-2)³", c: [-8, 12, -6, 1] }], minimal: "(t-2)³", characteristic: "(t-2)³", degree: 3 },
    ];
    const state = { preset: 0, candidate: 0 };
    const shell = S.createLab(section, lesson, {
      layout: "annihilator",
      title: "哪个最低次数多项式能同时消掉所有方向？",
      description: "p(T)=0 是零算子关系。只消掉某一支向量不够，必须检查一组基的每个方向都没有残量。",
      task: "选择算子和候选多项式，先看坐标平面中的残量箭头，再核对右侧每个基方向是否都归零。",
    });
    shell.toolbar.innerHTML = `${S.buttonGroup("算子", presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset")}<div data-candidates></div>`;
    const binder = S.eventBinder();

    const updateCandidates = () => {
      const preset = presets[state.preset];
      shell.toolbar.querySelector("[data-candidates]").innerHTML = S.buttonGroup("候选", preset.candidates.map((item, index) => ({ value: index, label: `p(t)=${item.label}` })), state.candidate, "candidate");
    };

    const draw = () => {
      const preset = presets[state.preset];
      const candidate = preset.candidates[state.candidate];
      const pA = polynomialMatrix(preset.A, candidate.c);
      const dimension = preset.A.length;
      const outputs = Array.from({ length: dimension }, (_, index) => S.matVec(pA, basisVector(dimension, index)));
      const killed = outputs.map((output) => S.norm(output) < 1e-7);
      const isZero = killed.every(Boolean);
      const degree = candidate.c.length - 1;
      const isMinimal = isZero && degree === preset.degree;
      const plane = S.createPlane({ x: 45, y: 82, width: 600, height: 420, extent: 3.2 });
      let content = `${plane.grid()}${plane.axes()}
        <text x="45" y="50" class="ch7-svg-title">全空间残量 p(T)eᵢ</text>`;
      let hasKilledDirection = false;
      for (let index = 0; index < dimension; index += 1) {
        const residual = project(outputs[index]);
        if (killed[index]) {
          hasKilledDirection = true;
        } else {
          const tip = plane.p(residual);
          content += plane.vector(residual, "danger");
          content += `<text x="${tip[0] + 10}" y="${tip[1] - 10}" class="ch7-svg-label is-danger">e${index + 1} 的残量</text>`;
        }
      }
      if (hasKilledDirection) {
        content += plane.cross([0, 0], "primary", 7);
        content += `<text x="${plane.cx + 12}" y="${plane.cy + 22}" class="ch7-svg-label is-primary">归零的方向都落在原点</text>`;
      }
      content += `<text x="700" y="82" class="ch7-svg-caption">当前候选</text>
        <text x="700" y="118" class="ch7-svg-title">p(t)=${candidate.label}</text>
        <path d="M700 142H936" class="ch7-helper"/>`;
      outputs.forEach((output, index) => {
        const y = 188 + index * 84;
        content += `<text x="700" y="${y}" class="ch7-svg-title">e${index + 1}</text>
          <text x="748" y="${y}" class="ch7-svg-caption">经过 p(T)</text>
          <text x="936" y="${y}" text-anchor="end" class="ch7-svg-title">${killed[index] ? "→ 0" : `→ ${S.vectorText(output)}`}</text>
          <path d="M700 ${y + 22}H936" class="ch7-helper"/>`;
      });
      if (preset.name.startsWith("J")) {
        const chainY = 520;
        const labels = Array.from({ length: dimension }, (_, index) => `v${dimension - index}`);
        content += `<text x="65" y="${chainY}" class="ch7-svg-caption">Jordan 链：</text>`;
        labels.forEach((label, index) => {
          const x = 160 + index * 120;
          content += `<text x="${x}" y="${chainY}" class="ch7-svg-title">${label}</text>`;
          if (index < labels.length - 1) content += `<path d="M${x + 28} ${chainY - 5}H${x + 94}" class="ch7-chain-arrow"/>`;
        });
        content += `<path d="M${160 + labels.length * 120 - 92} ${chainY - 5}H${160 + labels.length * 120 - 34}" class="ch7-chain-arrow"/><text x="${160 + labels.length * 120}" y="${chainY}" class="ch7-svg-title">0</text>`;
      }

      const tone = isMinimal ? "pass" : isZero ? "warn" : "fail";
      const title = isMinimal ? "所有基方向归零，而且次数已经最低" : isZero ? "整个空间已经归零，但关系还可以更短" : killed.some(Boolean) ? "仍有基方向留下残量" : "当前多项式没有消掉任何基方向";
      const text = isMinimal ? "检查一组基已经足够，线性会把结论推广到所有线性组合。" : isZero ? "零化多项式不唯一，继续降低次数才能得到最小多项式。" : "只要有一支残量箭头存在，就不能写 p(T)=0。";
      const formula = isMinimal ? "m_T(T)=0" : isZero ? "p(T)=0,\\quad \\deg p>\\deg m_T" : "p(T)\\ne 0";
      shell.stage.innerHTML = S.svg(content, { width: 980, height: 570, label: "候选多项式作用于全部基方向后的残量" });
      shell.result.innerHTML = S.conclusion({ tone, title, text, formula, facts: [["当前候选", candidate.label], ["最小多项式", preset.minimal], ["特征多项式", preset.characteristic], ["剩余范数", S.fmt(matrixNorm(pA), 5)]] });
    };

    binder.on(shell.toolbar, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) {
        state.preset = Number(preset.dataset.preset);
        state.candidate = 0;
        S.setActive(shell.toolbar, "[data-preset]", preset);
        updateCandidates();
        draw();
        return;
      }
      const candidate = event.target.closest("[data-candidate]");
      if (candidate) {
        state.candidate = Number(candidate.dataset.candidate);
        S.setActive(shell.toolbar, "[data-candidate]", candidate);
        draw();
      }
    });

    updateCandidates();
    draw();
    return () => binder.cleanup();
  }

  S.register("minimal-polynomial", render);
})();
