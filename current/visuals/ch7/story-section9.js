(() => {
  const S = window.Ch7Story;
  if (!S) return;

  const identity = (n) => Array.from({ length: n }, (_, row) => Array.from({ length: n }, (_, column) => row === column ? 1 : 0));
  const zero = (n) => Array.from({ length: n }, () => Array(n).fill(0));
  const matAdd = (A, B) => A.map((row, i) => row.map((value, j) => value + B[i][j]));
  const matScale = (factor, A) => A.map((row) => row.map((value) => factor * value));
  const basisVector = (n, index) => Array.from({ length: n }, (_, i) => i === index ? 1 : 0);
  const matrixNorm = (A) => Math.sqrt(A.flat().reduce((sum, value) => sum + value * value, 0));

  function polynomialMatrix(A, coefficients) {
    let result = zero(A.length);
    let power = identity(A.length);
    coefficients.forEach((coefficient) => {
      result = matAdd(result, matScale(coefficient, power));
      power = S.matMul(power, A);
    });
    return result;
  }

  function termVectors(A, coefficients, vector) {
    let powerVector = [...vector];
    return coefficients.map((coefficient, index) => {
      if (index > 0) powerVector = S.matVec(A, powerVector);
      return powerVector.map((value) => coefficient * value);
    });
  }

  function project(vector) {
    const directions = [[1, 0], [0, 1], [-0.72, 0.62], [0.48, 0.82]];
    return vector.reduce((sum, value, index) => S.add(sum, S.scale(value, directions[index] || [0.7, -0.55])), [0, 0]);
  }

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      {
        name: "diag(2,3)",
        A: [[2, 0], [0, 3]],
        candidates: [
          { label: "t−2", coefficients: [-2, 1] },
          { label: "(t−2)(t−3)", coefficients: [6, -5, 1] },
          { label: "χ(t)", coefficients: [6, -5, 1] },
        ],
        minimal: "(t−2)(t−3)",
        characteristic: "(t−2)(t−3)",
        minimalDegree: 2,
      },
      {
        name: "2I₂",
        A: [[2, 0], [0, 2]],
        candidates: [
          { label: "t−2", coefficients: [-2, 1] },
          { label: "(t−2)²", coefficients: [4, -4, 1] },
          { label: "χ(t)", coefficients: [4, -4, 1] },
        ],
        minimal: "t−2",
        characteristic: "(t−2)²",
        minimalDegree: 1,
      },
      {
        name: "J₂(2)",
        A: [[2, 1], [0, 2]],
        candidates: [
          { label: "t−2", coefficients: [-2, 1] },
          { label: "(t−2)²", coefficients: [4, -4, 1] },
          { label: "χ(t)", coefficients: [4, -4, 1] },
        ],
        minimal: "(t−2)²",
        characteristic: "(t−2)²",
        minimalDegree: 2,
      },
      {
        name: "J₃(2)",
        A: [[2, 1, 0], [0, 2, 1], [0, 0, 2]],
        candidates: [
          { label: "t−2", coefficients: [-2, 1] },
          { label: "(t−2)²", coefficients: [4, -4, 1] },
          { label: "(t−2)³", coefficients: [-8, 12, -6, 1] },
        ],
        minimal: "(t−2)³",
        characteristic: "(t−2)³",
        minimalDegree: 3,
      },
    ];
    const state = { preset: 0, candidate: 0 };
    const shell = S.createStory(section, lesson, {
      title: "同一个多项式必须让整个空间同时归零",
      description: "每一行代表一个基方向。彩色箭头依次相加形成 p(T)eᵢ；只要还有一行留下非零箭头，p(T) 就不是零算子。",
    });
    shell.toolbar.innerHTML = `${S.buttons(presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset")}<div class="ch7-story-polynomial-buttons" data-candidates></div>`;
    const binder = S.eventBinder();

    const updateCandidates = () => {
      const preset = presets[state.preset];
      const container = shell.toolbar.querySelector("[data-candidates]");
      container.innerHTML = preset.candidates.map((candidate, index) => `<button type="button" data-candidate="${index}" class="${index === state.candidate ? "is-active" : ""}"><strong>p(t)=${candidate.label}</strong><small>次数 ${candidate.coefficients.length - 1}</small></button>`).join("");
    };

    const draw = () => {
      const preset = presets[state.preset];
      const candidate = preset.candidates[state.candidate];
      const pA = polynomialMatrix(preset.A, candidate.coefficients);
      const dimension = preset.A.length;
      const outputs = Array.from({ length: dimension }, (_, index) => S.matVec(pA, basisVector(dimension, index)));
      const killed = outputs.map((output) => S.norm(output) < 1e-7);
      const isZero = killed.every(Boolean);
      const degree = candidate.coefficients.length - 1;
      const isMinimal = isZero && degree === preset.minimalDegree;
      const width = 1000;
      const height = dimension === 3 ? 650 : 570;
      const laneTop = 95;
      const laneHeight = dimension === 3 ? 160 : 195;
      let content = `<text x="58" y="52" class="ch7-story-panel-title">彩色箭头：c₀eᵢ + c₁Teᵢ + c₂T²eᵢ + ···</text><text x="680" y="52" class="ch7-story-panel-subtitle">粗箭头：最终剩余 p(T)eᵢ</text>`;
      const roles = ["primary", "secondary", "output", "gold"];

      for (let index = 0; index < dimension; index += 1) {
        const y = laneTop + index * laneHeight;
        content += `<rect x="45" y="${y}" width="910" height="${laneHeight - 28}" rx="24" class="ch7-story-equation-lane"/>`;
        content += `<text x="76" y="${y + 45}" class="ch7-story-panel-title">基方向 e${index + 1}</text>`;
        content += `<text x="76" y="${y + 72}" class="ch7-story-panel-subtitle">检查 p(T)e${index + 1}</text>`;
        const origin = [235, y + (laneHeight - 28) / 2 + 6];
        content += `<circle cx="${origin[0]}" cy="${origin[1]}" r="5" class="ch7-story-point is-muted"/>`;
        const terms = termVectors(preset.A, candidate.coefficients, basisVector(dimension, index));
        let current = [...origin];
        const scaleFactor = dimension === 3 ? 18 : 23;
        terms.forEach((term, termIndex) => {
          const projected = project(term);
          const next = [current[0] + projected[0] * scaleFactor, current[1] - projected[1] * scaleFactor];
          if (S.norm(projected) > 1e-8) {
            content += S.softArrow(current[0], current[1], next[0], next[1], `is-${roles[termIndex % roles.length]}`);
            content += `<text x="${(current[0] + next[0]) / 2}" y="${(current[1] + next[1]) / 2 - 9}" text-anchor="middle" class="ch7-story-caption">c${termIndex}T${termIndex ? `<tspan baseline-shift="super" font-size="9">${termIndex}</tspan>` : ""}e${index + 1}</text>`;
          }
          current = next;
        });
        const projectedOutput = project(outputs[index]);
        const resultEnd = [origin[0] + projectedOutput[0] * scaleFactor, origin[1] - projectedOutput[1] * scaleFactor];
        if (killed[index]) {
          content += `<circle cx="${origin[0]}" cy="${origin[1]}" r="25" class="ch7-story-zero-seal"/><text x="${origin[0] + 42}" y="${origin[1] + 5}" class="ch7-story-label is-success">=0</text>`;
        } else {
          content += S.softArrow(origin[0], origin[1], resultEnd[0], resultEnd[1], "is-danger");
          content += `<text x="${resultEnd[0] + 12}" y="${resultEnd[1] - 10}" class="ch7-story-label is-danger">仍存活 ${S.vectorText(outputs[index])}</text>`;
        }
        const statusX = 850;
        content += `<circle cx="${statusX}" cy="${origin[1]}" r="24" class="ch7-story-chain-node ${killed[index] ? "is-zero" : "is-active"}"/><text x="${statusX}" y="${origin[1] + 5}" text-anchor="middle" class="ch7-story-node-text">${killed[index] ? "0" : "≠0"}</text>`;
      }

      const sealY = height - 43;
      content += `<rect x="375" y="${sealY - 32}" width="250" height="64" rx="22" class="${isZero ? "ch7-story-zero-seal" : "ch7-story-chain-node"}"/><text x="500" y="${sealY + 7}" text-anchor="middle" class="ch7-story-big-label">${isZero ? "p(T)=0：整个空间闭合" : "仍有方向未被消去"}</text>`;

      let tone = isMinimal ? "pass" : isZero ? "warn" : "fail";
      let title = isMinimal ? "所有基方向归零，而且次数已经最低" : isZero ? "它确实消掉整个空间，但还不是最短关系" : killed.some(Boolean) ? "只消掉了部分方向，不能写成 p(T)=0" : "当前多项式没有消掉任何基方向";
      let text = isMinimal ? "检查一组基已经足够：线性保证 p(T) 也会消掉它们的所有线性组合。" : isZero ? "零化多项式不唯一；继续降低次数，直到再也无法保持全空间归零。" : "局部方向归零只是一个向量关系。零算子关系要求每一条基方向都同时归零。";
      let formula = isMinimal ? "m_T(T)=0" : isZero ? "p(T)=0,\\quad \\deg p>\\deg m_T" : "p(T)\\ne0";
      const facts = [["当前候选", candidate.label], ["最小多项式", preset.minimal], ["特征多项式", preset.characteristic], ["算子剩余范数", S.fmt(matrixNorm(pA), 5)]];

      shell.stage.innerHTML = S.svg(content, { width, height, label: "候选多项式对所有基方向的向量和与全空间零化检查" });
      shell.result.innerHTML = S.result({ tone, title, text, formula, facts });
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
