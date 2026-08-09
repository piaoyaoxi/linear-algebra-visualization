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

  function termVectors(A, coefficients, vector) {
    let power = identity(A.length);
    return coefficients.map((coefficient) => {
      const term = S.scale(coefficient, S.matVec(power, vector));
      power = S.matMul(power, A);
      return term;
    });
  }

  function render(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "diag(2,3)", A: [[2, 0], [0, 3]], candidates: [{ label: "t-2", c: [-2, 1] }, { label: "(t-2)(t-3)", c: [6, -5, 1] }, { label: "χ(t)", c: [6, -5, 1] }], minimal: "(t-2)(t-3)", characteristic: "(t-2)(t-3)", degree: 2 },
      { name: "2I₂", A: [[2, 0], [0, 2]], candidates: [{ label: "t-2", c: [-2, 1] }, { label: "(t-2)²", c: [4, -4, 1] }, { label: "χ(t)", c: [4, -4, 1] }], minimal: "t-2", characteristic: "(t-2)²", degree: 1 },
      { name: "J₂(2)", A: [[2, 1], [0, 2]], candidates: [{ label: "t-2", c: [-2, 1] }, { label: "(t-2)²", c: [4, -4, 1] }, { label: "χ(t)", c: [4, -4, 1] }], minimal: "(t-2)²", characteristic: "(t-2)²", degree: 2 },
      { name: "J₃(2)", A: [[2, 1, 0], [0, 2, 1], [0, 0, 2]], candidates: [{ label: "t-2", c: [-2, 1] }, { label: "(t-2)²", c: [4, -4, 1] }, { label: "(t-2)³", c: [-8, 12, -6, 1] }], minimal: "(t-2)³", characteristic: "(t-2)³", degree: 3 },
    ];
    const state = { preset: 0, candidate: 0, term: 0 };
    const shell = S.createLab(section, lesson, {
      layout: "annihilator-terms",
      title: "候选多项式的各项逐个加入后，所有基方向都能同时闭合回零吗？",
      description: "每一行对应一个基方向。彩色箭头依次表示 c₀eᵢ、c₁Teᵢ、c₂T²eᵢ 等贡献，首尾闭合才表示这个方向被消去。",
      task: "选择候选 p(t)，再把“已加入到第几次幂”拖到最右。逐行检查最终残量，不能只看其中一行。",
    });
    shell.toolbar.innerHTML = `${S.buttonGroup("选择算子", presets.map((item, index) => ({ value: index, label: item.name })), state.preset, "preset")}<div data-candidates></div>`;
    const binder = S.eventBinder();
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "已加入到第几次幂", key: "term", min: 0, max: 2, step: 1, digits: 0 },
    ], state, () => draw());

    const updateCandidates = () => {
      const preset = presets[state.preset];
      shell.toolbar.querySelector("[data-candidates]").innerHTML = S.buttonGroup("候选 p(t)", preset.candidates.map((item, index) => ({ value: index, label: item.label })), state.candidate, "candidate");
    };

    const syncTerm = () => {
      const preset = presets[state.preset];
      const candidate = preset.candidates[state.candidate];
      const input = shell.controls.querySelector('[data-key="term"]');
      const output = shell.controls.querySelector('[data-output="term"]');
      const degree = candidate.c.length - 1;
      state.term = Math.min(state.term, degree);
      if (input) {
        input.max = degree;
        input.value = state.term;
      }
      if (output) output.textContent = String(state.term);
    };

    const draw = () => {
      syncTerm();
      const preset = presets[state.preset];
      const candidate = preset.candidates[state.candidate];
      const dimension = preset.A.length;
      const degree = candidate.c.length - 1;
      const complete = state.term >= degree;
      const allTerms = Array.from({ length: dimension }, (_, index) => termVectors(preset.A, candidate.c, basisVector(dimension, index)));
      const partials = allTerms.map((terms) => {
        let sum = Array(dimension).fill(0);
        return terms.map((term) => {
          sum = S.add(sum, term);
          return sum;
        });
      });
      const maxLength = Math.max(1, ...allTerms.flat().map((vector) => S.norm(project(vector))), ...partials.flat().map((vector) => S.norm(project(vector))));
      const scalePx = Math.min(58, 150 / maxLength);
      const pA = polynomialMatrix(preset.A, candidate.c);
      const outputs = Array.from({ length: dimension }, (_, index) => S.matVec(pA, basisVector(dimension, index)));
      const killed = outputs.map((output) => S.norm(output) < 1e-7);
      const isZero = killed.every(Boolean);
      const isMinimal = isZero && degree === preset.degree;
      const laneYs = dimension === 3 ? [166, 326, 486] : [218, 420];
      const roles = ["guide", "primary", "secondary", "guide"];
      let content = `<text x="36" y="45" class="ch7-svg-title">把 p(T) 展开成向量首尾相接的和</text>
        <text x="804" y="45" text-anchor="end" class="ch7-svg-caption">当前已加入到 T${state.term === 0 ? "⁰" : state.term === 1 ? "¹" : state.term === 2 ? "²" : "³"}</text>`;

      allTerms.forEach((terms, row) => {
        const y = laneYs[row];
        const origin = [184, y];
        let cursor = origin;
        content += `<rect x="30" y="${y - 68}" width="780" height="136" rx="16" fill="var(--surface-soft)" opacity="0.58"/>
          <text x="54" y="${y - 29}" class="ch7-svg-title">基方向 e${row + 1}</text>
          <path d="M${origin[0] - 24} ${y}H${origin[0] + 545}" class="ch7-helper"/>`;
        terms.forEach((term, index) => {
          if (index > state.term) return;
          const projected = project(term);
          const next = [cursor[0] + projected[0] * scalePx, cursor[1] - projected[1] * scalePx];
          const role = roles[index % roles.length];
          if (S.norm(projected) > 1e-8) {
            content += S.arrowPath(cursor[0], cursor[1], next[0], next[1], `is-${role}`);
          }
          const mid = [(cursor[0] + next[0]) / 2, (cursor[1] + next[1]) / 2];
          content += `<text x="${mid[0]}" y="${mid[1] - 12 - (index % 2) * 12}" text-anchor="middle" class="ch7-svg-caption">c${index}T${index === 0 ? "⁰" : index === 1 ? "¹" : index === 2 ? "²" : "³"}e${row + 1}</text>`;
          cursor = next;
        });
        const partial = partials[row][state.term];
        const residual = S.norm(partial);
        if (residual < 1e-7) {
          content += `<circle cx="${origin[0]}" cy="${origin[1]}" r="8" fill="var(--surface-solid)" stroke="var(--accent-strong)" stroke-width="3"/>
            <text x="744" y="${y + 5}" text-anchor="end" class="ch7-svg-label is-primary">首尾闭合：0</text>`;
        } else {
          content += `<path d="M${origin[0]} ${origin[1]}L${cursor[0]} ${cursor[1]}" class="ch7-trace"/>
            <text x="786" y="${y + 5}" text-anchor="end" class="ch7-svg-label is-secondary">当前残量 ${S.vectorText(partial)}</text>`;
        }
      });

      let tone = "neutral";
      let title;
      let text;
      let formula;
      if (!complete) {
        title = `还只累加到 T${state.term === 0 ? "⁰" : state.term === 1 ? "¹" : state.term === 2 ? "²" : "³"}，不能提前判断 p(T)`;
        text = "继续向右拖动，让候选多项式的每一项都进入向量和。";
        formula = `p(t)=${candidate.label}`;
      } else if (isMinimal) {
        tone = "pass";
        title = "所有基方向同时闭合，而且次数已经最低";
        text = "检查一组基已经足够，线性会把零化关系推广到整个空间。";
        formula = "m_T(T)=0";
      } else if (isZero) {
        tone = "warn";
        title = "所有行都闭合，但这个零化关系还不是最短";
        text = "继续寻找次数更低的首一多项式，才得到最小多项式。";
        formula = "p(T)=0,\\quad \\deg p>\\deg m_T";
      } else {
        tone = "fail";
        title = killed.some(Boolean) ? "有些行闭合，但至少一个基方向仍有残量" : "每个基方向都还留下残量";
        text = "只要一行没有回到零，就不能把 p(T) 写成零算子。";
        formula = "p(T)\\ne0";
      }

      shell.stage.innerHTML = S.svg(content, { width: 840, height: 600, label: "逐项累加候选多项式在所有基方向上的向量贡献" });
      shell.result.innerHTML = S.conclusion({ tone, title, text, formula, facts: [["当前候选", candidate.label], ["最小多项式", preset.minimal], ["特征多项式", preset.characteristic], ["最终矩阵范数", complete ? S.fmt(matrixNorm(pA), 5) : "尚未完成"]] });
      shell.root.dataset.annihilatorPass = String(!complete || isZero === (matrixNorm(pA) < 1e-7));
    };

    binder.on(shell.toolbar, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) {
        state.preset = Number(preset.dataset.preset);
        state.candidate = 0;
        state.term = 0;
        S.setActive(shell.toolbar, "[data-preset]", preset);
        updateCandidates();
        syncTerm();
        draw();
        return;
      }
      const candidate = event.target.closest("[data-candidate]");
      if (candidate) {
        state.candidate = Number(candidate.dataset.candidate);
        state.term = 0;
        S.setActive(shell.toolbar, "[data-candidate]", candidate);
        syncTerm();
        draw();
      }
    });

    updateCandidates();
    syncTerm();
    draw();
    return () => {
      cleanupRange();
      binder.cleanup();
    };
  }

  S.register("minimal-polynomial", render);
})();
