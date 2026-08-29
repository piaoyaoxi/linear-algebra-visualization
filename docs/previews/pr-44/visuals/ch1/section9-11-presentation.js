(() => {
  const M = () => window.Ch1Math;
  const tex = (source) => (window.texInline ? window.texInline(source) : source);
  const listen = (...args) => window.ch1Listen?.(...args);
  const observe = (...args) => window.ch1ObserveResize?.(...args);

  function integerDivisors(value) {
    const n = Math.abs(Math.trunc(value));
    if (n === 0) return [0];
    const result = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) result.push(i);
    return result;
  }

  function rationalCandidates(poly) {
    const p = M().normalizePoly(poly);
    const constant = Math.abs(p[0].n);
    const leading = Math.abs(p[p.length - 1].n);
    const values = new Map();
    integerDivisors(constant).forEach((numerator) => {
      integerDivisors(leading).forEach((denominator) => {
        if (!denominator) return;
        [1, -1].forEach((sign) => {
          const candidate = M().R(sign * numerator, denominator);
          values.set(M().formatR(candidate), candidate);
        });
      });
    });
    return [...values.values()].sort(M().rCmp);
  }

  function mountRationalLab(root) {
    const normalizationExamples = {
      fraction: {
        label: "(3/2)x³−(9/4)x+3/8",
        poly: M().polyFrom(["3/8", "-9/4", "0", "3/2"]),
      },
      integer: {
        label: "6x⁴+9x²−3",
        poly: M().polyFrom(["-3", "0", "9", "0", "6"]),
      },
    };
    const examples = {
      root: {
        label: "2x³+x²−x−1",
        poly: M().polyFrom(["-1", "-1", "1", "2"]),
        note: "有理根定理给候选；每个候选仍需精确代入。",
      },
      eisenstein: {
        label: "x⁵+10x+5",
        poly: M().polyFrom(["5", "10", "0", "0", "0", "1"]),
        note: "用 p=5 满足 Eisenstein 三条件。",
      },
      quartic: {
        label: "x⁴+4",
        poly: M().polyFrom(["4", "0", "0", "0", "1"]),
        note: "没有有理根，但它仍可分成两个二次式；用来阻止错误推理。",
        evidence: "x^4+4=(x^2-2x+2)(x^2+2x+2)",
      },
    };
    let normalization = "fraction";
    let current = "root";
    let prime = 5;
    let revealedCandidates = new Set();
    let lastCandidateIndex = null;

    function setCurrentObservation(message) {
      root.querySelector("[data-rational-current-observation]").textContent = message;
    }

    function renderNormalization(announce = false) {
      const item = normalizationExamples[normalization];
      const result = M().contentAndPrimitive(item.poly);
      const cleared = M().polyFrom(result.integers);
      root.querySelector("[data-normalization-original]").innerHTML = tex(M().formatPolyTex(item.poly));
      root.querySelector("[data-common-denominator]").textContent = String(result.commonDen);
      root.querySelector("[data-cleared-poly]").innerHTML = tex(M().formatPolyTex(cleared));
      root.querySelector("[data-content]").innerHTML = tex(M().formatRTex(result.content));
      root.querySelector("[data-primitive]").innerHTML = tex(M().formatPolyTex(result.primitive));
      root.querySelector("[data-normalization-check]").innerHTML = tex(`${M().formatPolyTex(item.poly)}=(${M().formatRTex(result.content)})(${M().formatPolyTex(result.primitive)})`);
      root.querySelectorAll("[data-normalization-example]").forEach((button) => {
        const active = button.dataset.normalizationExample === normalization;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      if (announce) {
        setCurrentObservation(`${normalization === "fraction" ? "分数系数" : "有公共因子"}示例：公分母为 ${result.commonDen}，提出常数 ${M().formatR(result.content)}；规范化等式已完整显示。`);
      }
      return result;
    }

    function eisenstein(poly, p) {
      const coefficients = poly.map((c) => c.d === 1 ? c.n : NaN);
      if (coefficients.some((c) => !Number.isInteger(c))) {
        return { applicable: false, checks: [false, false, false], message: "先清分母并本原化为整系数多项式。" };
      }
      const top = coefficients.length - 1;
      const c1 = coefficients[top] % p !== 0;
      const c2 = coefficients.slice(0, top).every((c) => c % p === 0);
      const c3 = coefficients[0] % (p * p) !== 0;
      return {
        applicable: c1 && c2 && c3,
        checks: [c1, c2, c3],
        message: c1 && c2 && c3
          ? `p=${p} 满足全部条件：在 ℚ[x] 中不可约。`
          : `p=${p} 未通过全部条件：这条判据没有给出结论，并不表示可约。`,
      };
    }

    function renderCandidates() {
      const item = examples[current];
      const poly = item.poly;
      const candidates = rationalCandidates(poly);
      const revealedCount = revealedCandidates.size;
      root.querySelector("[data-candidate-count]").textContent = `共 ${candidates.length} 个（已约分、去重并包含正负）`;
      root.querySelector("[data-candidates]").innerHTML = candidates.map((candidate, index) => {
        const revealed = revealedCandidates.has(index);
        const value = M().evalPoly(poly, candidate);
        const isRoot = M().rIsZero(value);
        return `<button type="button" class="ch1-candidate ${revealed ? "is-revealed" : ""} ${revealed && isRoot ? "is-root" : ""}" data-candidate-index="${index}" aria-expanded="${revealed}" aria-label="验算候选 ${M().formatR(candidate)}">
          <strong>${tex(M().formatRTex(candidate))}</strong>
          ${revealed
            ? `<span data-candidate-result>${tex(`f(${M().formatRTex(candidate)})=${M().formatRTex(value)}`)}</span><em>${isRoot ? "是根" : "不是根"}</em>`
            : "<span>点击后显示精确代入值</span><em>待验算</em>"}
        </button>`;
      }).join("") || "<p>常数项为 0 时先提出 x，再对剩余多项式使用定理。</p>";

      const observation = root.querySelector("[data-candidate-observation]");
      if (lastCandidateIndex !== null && candidates[lastCandidateIndex]) {
        const candidate = candidates[lastCandidateIndex];
        const value = M().evalPoly(poly, candidate);
        const verdict = M().rIsZero(value) ? "是根" : "不是根";
        observation.textContent = `刚验算：f(${M().formatR(candidate)})=${M().formatR(value)}，${candidate.n === 0 ? "0" : M().formatR(candidate)} ${verdict}。已完成 ${revealedCount}/${candidates.length}。`;
      } else {
        observation.textContent = "候选尚未验算；点击任一卡片后才会显示代入值。";
      }
      return { item, poly, candidates };
    }

    function renderExample() {
      const item = examples[current];
      root.querySelector("[data-rational-poly]").innerHTML = tex(M().formatPolyTex(item.poly));
      root.querySelector("[data-rational-note]").textContent = item.note;
      const evidence = root.querySelector("[data-rational-evidence]");
      evidence.hidden = !item.evidence;
      evidence.querySelector("p").innerHTML = item.evidence ? tex(item.evidence) : "";
      root.querySelectorAll("[data-rational-example]").forEach((button) => {
        const active = button.dataset.rationalExample === current;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      return renderCandidates();
    }

    function renderEisenstein() {
      const poly = examples[current].poly;
      const result = eisenstein(poly, prime);
      const labels = [
        `${prime} 不整除首项系数`,
        `${prime} 整除其余所有系数（缺项 0 也计入）`,
        `${prime ** 2} 不整除常数项`,
      ];
      root.querySelector("[data-eisenstein-checks]").innerHTML = labels.map((label, index) => `
        <div class="ch1-check-row ${result.checks[index] ? "is-ok" : "is-bad"}">
          <span>${result.checks[index] ? "✓" : "×"}</span><p>${label}</p>
        </div>`).join("");
      const status = root.querySelector("[data-eisenstein-status]");
      status.textContent = result.message;
      status.className = `ch1-status ${result.applicable ? "is-ok" : "is-warn"}`;
      root.querySelector("[data-prime-value]").textContent = String(prime);
      root.querySelectorAll("[data-prime]").forEach((button) => {
        const active = Number(button.dataset.prime) === prime;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      return result;
    }

    function render() {
      renderNormalization();
      renderExample();
      renderEisenstein();
    }

    root.querySelectorAll("[data-rational-example]").forEach((button) => listen(button, "click", () => {
      current = button.dataset.rationalExample;
      revealedCandidates = new Set();
      lastCandidateIndex = null;
      render();
      const count = rationalCandidates(examples[current].poly).length;
      setCurrentObservation(`${examples[current].label} 有 ${count} 个既约有理根候选；点击候选后再判断它是否为根。`);
    }));
    root.querySelectorAll("[data-prime]").forEach((button) => listen(button, "click", () => {
      prime = Number(button.dataset.prime);
      const result = renderEisenstein();
      setCurrentObservation(result.message);
    }));
    root.querySelectorAll("[data-normalization-example]").forEach((button) => listen(button, "click", () => {
      normalization = button.dataset.normalizationExample;
      renderNormalization(true);
    }));
    listen(root.querySelector("[data-candidates]"), "click", (event) => {
      const button = event.target.closest?.("[data-candidate-index]");
      if (!button) return;
      const index = Number(button.dataset.candidateIndex);
      revealedCandidates.add(index);
      lastCandidateIndex = index;
      const { candidates, poly } = renderCandidates();
      const candidate = candidates[index];
      const value = M().evalPoly(poly, candidate);
      const verdict = M().rIsZero(value) ? "是根" : "不是根";
      const hasRationalRoot = candidates.some((valueCandidate) => M().rIsZero(M().evalPoly(poly, valueCandidate)));
      const noRootConclusion = M().deg(poly) <= 3
        ? "这个二次或三次多项式在 ℚ[x] 中不可约。"
        : "这个多项式没有有理根；仍需排除二次或更高次数的因式。";
      const completed = revealedCandidates.size === candidates.length
        ? `全部 ${candidates.length} 个候选已经验算。${hasRationalRoot ? "实际有理根已在卡片中标出。" : noRootConclusion}`
        : `已验算 ${revealedCandidates.size}/${candidates.length} 个候选。`;
      setCurrentObservation(`f(${M().formatR(candidate)})=${M().formatR(value)}，所以 ${M().formatR(candidate)} ${verdict}；${completed}`);
      root.querySelector(`[data-candidate-index="${index}"]`)?.focus({ preventScroll: true });
    });
    render();
    setCurrentObservation("三个工作台使用独立示例：先核对规范化等式，再点击候选验算，最后选择素数检查 Eisenstein 条件。");
  }

  function mountExponentLattice(root) {
    const baseTerms = [
      { i: 3, j: 0, c: 1, label: "x³" },
      { i: 2, j: 1, c: 2, label: "2x²y" },
      { i: 1, j: 2, c: -1, label: "−xy²" },
      { i: 0, j: 3, c: 4, label: "4y³" },
      { i: 1, j: 0, c: 1, label: "x" },
      { i: 0, j: 0, c: -1, label: "−1" },
    ];
    const state = { layer: "all", selected: { i: 2, j: 1 }, first: { i: 2, j: 1 }, second: { i: 1, j: 0 }, mode: "support" };
    const canvas = root.querySelector("canvas");
    let lattice = null;

    function termAt(i, j) {
      return baseTerms.find((term) => term.i === i && term.j === j) || null;
    }

    function render() {
      root.querySelectorAll("[data-lattice-mode]").forEach((button) => button.classList.toggle("is-active", button.dataset.latticeMode === state.mode));
      root.querySelectorAll("[data-layer]").forEach((button) => button.classList.toggle("is-active", button.dataset.layer === state.layer));
      if (state.mode === "support") {
        const terms = baseTerms
          .filter((term) => state.layer === "all" || term.i + term.j === Number(state.layer))
          .map((term) => ({ ...term, active: term.i === state.selected.i && term.j === state.selected.j }));
        lattice = M().drawLattice(canvas, terms, { maxI: 4, maxJ: 4 });
        const selected = termAt(state.selected.i, state.selected.j);
        root.querySelector("[data-lattice-readout]").innerHTML = selected
          ? `格点 ${tex(`(${selected.i},${selected.j})`)} 表示 ${tex(selected.label.replace("−", "-"))}；该项总次数 ${selected.i + selected.j}。`
          : `格点 ${tex(`(${state.selected.i},${state.selected.j})`)} 的系数为 0，是支撑之外的位置。`;
      } else {
        const sum = { i: state.first.i + state.second.i, j: state.first.j + state.second.j };
        lattice = M().drawLattice(canvas, [
          { ...state.first, label: `α=(${state.first.i},${state.first.j})` },
          { ...state.second, label: `β=(${state.second.i},${state.second.j})` },
          { ...sum, label: `α+β=(${sum.i},${sum.j})`, active: true },
        ], { maxI: 5, maxJ: 5 });
        root.querySelector("[data-lattice-readout]").innerHTML =
          `${tex(`(${state.first.i},${state.first.j})+(${state.second.i},${state.second.j})=(${sum.i},${sum.j})`)}，对应单项式指数逐坐标相加。`;
      }
      root.querySelector("[data-layers]").innerHTML = [0, 1, 2, 3].map((degree) => {
        const terms = baseTerms.filter((term) => term.i + term.j === degree);
        return `<article class="ch1-compare-card"><strong>f${degree}</strong><p>${terms.length ? terms.map((term) => term.label).join(" + ") : "0"}</p></article>`;
      }).join("");
      root.querySelector("[data-degree-summary]").textContent = "deg f=3，degₓ f=3，degᵧ f=3；这些三个数字碰巧相同，但定义不同。";
      root.querySelector("[data-product-coefficient]").innerHTML =
        `${tex("[x^3y]f(x-y)")}：${tex("2x^2y\\cdot x")} 贡献 2，${tex("x^3\\cdot(-y)")} 贡献 −1，合计 1。`;
    }

    listen(canvas, "click", (event) => {
      const rect = canvas.getBoundingClientRect();
      const point = lattice?.hitTest(event.clientX - rect.left, event.clientY - rect.top);
      if (!point) return;
      state.selected = { i: point.i, j: point.j };
      state.mode = "support";
      render();
    });
    root.querySelectorAll("[data-lattice-mode]").forEach((button) => listen(button, "click", () => {
      state.mode = button.dataset.latticeMode;
      render();
    }));
    root.querySelectorAll("[data-layer]").forEach((button) => listen(button, "click", () => {
      state.layer = button.dataset.layer;
      state.mode = "support";
      render();
    }));
    root.querySelectorAll("[data-first]").forEach((button) => listen(button, "click", () => {
      state.first = JSON.parse(button.dataset.first);
      state.mode = "multiply";
      render();
    }));
    root.querySelectorAll("[data-second]").forEach((button) => listen(button, "click", () => {
      state.second = JSON.parse(button.dataset.second);
      state.mode = "multiply";
      render();
    }));
    observe(root.querySelector(".ch1-stage"), render);
    render();
  }

  function monomialKey(exp) {
    return exp.join(",");
  }

  function canonical(expression) {
    const map = new Map();
    expression.forEach(({ c, e }) => {
      const key = monomialKey(e);
      map.set(key, (map.get(key) || 0) + c);
    });
    return [...map.entries()]
      .filter(([, coefficient]) => coefficient !== 0)
      .map(([key, c]) => ({ c, e: key.split(",").map(Number) }))
      .sort((a, b) => {
        const da = a.e.reduce((sum, value) => sum + value, 0);
        const db = b.e.reduce((sum, value) => sum + value, 0);
        if (da !== db) return db - da;
        for (let i = 0; i < a.e.length; i++) if (a.e[i] !== b.e[i]) return b.e[i] - a.e[i];
        return 0;
      });
  }

  function permute(expression, permutation) {
    return canonical(expression.map(({ c, e }) => ({ c, e: permutation.map((source) => e[source]) })));
  }

  function expressionEquals(a, b) {
    const A = canonical(a);
    const B = canonical(b);
    return A.length === B.length && A.every((term, index) => term.c === B[index].c && monomialKey(term.e) === monomialKey(B[index].e));
  }

  function expressionTex(expression) {
    const vars = ["x", "y", "z"];
    const terms = canonical(expression);
    if (!terms.length) return "0";
    return terms.map((term, index) => {
      const absolute = Math.abs(term.c);
      const factors = term.e.map((power, i) => {
        if (!power) return "";
        return power === 1 ? vars[i] : `${vars[i]}^{${power}}`;
      }).join("");
      const body = factors ? `${absolute === 1 ? "" : absolute}${factors}` : String(absolute);
      const sign = term.c < 0 ? "-" : index ? "+" : "";
      return `${sign}${body}`;
    }).join("");
  }

  function mountSymmetry(root) {
    const expressions = {
      squares: {
        label: "x²+y²+z²",
        terms: [{ c: 1, e: [2, 0, 0] }, { c: 1, e: [0, 2, 0] }, { c: 1, e: [0, 0, 2] }],
      },
      orbit: {
        label: "Σsym x²y",
        terms: [
          [2,1,0],[2,0,1],[1,2,0],[0,2,1],[1,0,2],[0,1,2],
        ].map((e) => ({ c: 1, e })),
      },
      nonsym: {
        label: "x²+y",
        terms: [{ c: 1, e: [2,0,0] }, { c: 1, e: [0,1,0] }],
      },
      cyclic: {
        label: "x²y+y²z+z²x",
        terms: [{ c: 1, e: [2,1,0] }, { c: 1, e: [0,2,1] }, { c: 1, e: [1,0,2] }],
      },
    };
    const state = { current: "squares", permutation: [0,1,2], rewrite: "squares", step: 0, roots: [1, 2, 3] };
    const rewriteSteps = {
      squares: [
        { title: "目标", formula: "x^2+y^2+z^2" },
        { title: "展开 σ₁²", formula: "\\sigma_1^2=x^2+y^2+z^2+2\\sigma_2" },
        { title: "移项", formula: "x^2+y^2+z^2=\\sigma_1^2-2\\sigma_2" },
      ],
      orbit: [
        { title: "目标轨道和", formula: "\\sum_{sym}x^2y" },
        { title: "展开 σ₁σ₂", formula: "\\sigma_1\\sigma_2=\\sum_{sym}x^2y+3xyz" },
        { title: "识别 σ₃", formula: "\\sigma_1\\sigma_2=\\sum_{sym}x^2y+3\\sigma_3" },
        { title: "移项", formula: "\\sum_{sym}x^2y=\\sigma_1\\sigma_2-3\\sigma_3" },
      ],
      cubes: [
        { title: "目标", formula: "x^3+y^3+z^3" },
        { title: "展开 σ₁³", formula: "\\sigma_1^3=x^3+y^3+z^3+3\\sum_{sym}x^2y+6xyz" },
        { title: "代入轨道和", formula: "\\sum_{sym}x^2y=\\sigma_1\\sigma_2-3\\sigma_3" },
        { title: "合并", formula: "x^3+y^3+z^3=\\sigma_1^3-3\\sigma_1\\sigma_2+3\\sigma_3" },
      ],
    };

    function signedTerm(coefficient, body, first = false) {
      if (coefficient === 0) return "";
      const sign = coefficient < 0 ? "-" : first ? "" : "+";
      const absolute = Math.abs(coefficient);
      const magnitude = body && absolute === 1 ? "" : String(absolute);
      return `${sign}${magnitude}${body}`;
    }

    function renderVieta() {
      const [r1, r2, r3] = state.roots;
      const sigma1 = r1 + r2 + r3;
      const sigma2 = r1 * r2 + r1 * r3 + r2 * r3;
      const sigma3 = r1 * r2 * r3;
      const formula = `t^3${signedTerm(-sigma1, "t^2")}${signedTerm(sigma2, "t")}${signedTerm(-sigma3, "")}`;
      root.querySelector("[data-vieta-sigma1]").textContent = String(sigma1);
      root.querySelector("[data-vieta-sigma2]").textContent = String(sigma2);
      root.querySelector("[data-vieta-sigma3]").textContent = String(sigma3);
      root.querySelector("[data-vieta-polynomial]").innerHTML = tex(formula);
      root.querySelector("[data-vieta-factorization]").innerHTML = tex(`(t-(${r1}))(t-(${r2}))(t-(${r3}))`);
    }

    function composePermutation(next) {
      state.permutation = next.map((source) => state.permutation[source]);
    }

    function render() {
      const item = expressions[state.current];
      const transformed = permute(item.terms, state.permutation);
      const unchanged = expressionEquals(item.terms, transformed);
      root.querySelector("[data-sym-before]").innerHTML = tex(expressionTex(item.terms));
      root.querySelector("[data-sym-after]").innerHTML = tex(expressionTex(transformed));
      root.querySelector("[data-permutation]").textContent = `当前变量顺序：${state.permutation.map((index) => ["x","y","z"][index]).join("，")}`;
      const status = root.querySelector("[data-sym-status]");
      status.textContent = unchanged ? "这次置换后保持不变" : "这次置换后改变";
      status.className = `ch1-status ${unchanged ? "is-ok" : "is-bad"}`;
      const allSymmetric = [[1,0,2],[0,2,1]].every((permutation) => expressionEquals(item.terms, permute(item.terms, permutation)));
      root.querySelector("[data-global-status]").textContent =
        state.current === "cyclic"
          ? "三循环保持不变，但换位 x↔y 会改变：循环对称不等于全对称。"
          : allSymmetric
            ? "通过生成换位检查：全对称。"
            : "存在换位使表达式改变：不是全对称。";
      root.querySelectorAll("[data-sym-expression]").forEach((button) => button.classList.toggle("is-active", button.dataset.symExpression === state.current));

      const steps = rewriteSteps[state.rewrite];
      state.step = Math.min(state.step, steps.length - 1);
      root.querySelector("[data-rewrite-step]").textContent = `${state.step + 1} / ${steps.length}`;
      root.querySelector("[data-rewrite-title]").textContent = steps[state.step].title;
      root.querySelector("[data-rewrite-formula]").innerHTML = tex(steps[state.step].formula);
      root.querySelector("[data-rewrite-prev]").disabled = state.step === 0;
      root.querySelector("[data-rewrite-next]").disabled = state.step === steps.length - 1;
      root.querySelectorAll("[data-rewrite-kind]").forEach((button) => button.classList.toggle("is-active", button.dataset.rewriteKind === state.rewrite));
      root.querySelector("[data-orbit]").innerHTML = expressions.orbit.terms.map((term) => `<span>${tex(expressionTex([term]))}</span>`).join("");
      renderVieta();
    }

    root.querySelectorAll("[data-sym-expression]").forEach((button) => listen(button, "click", () => {
      state.current = button.dataset.symExpression;
      state.permutation = [0,1,2];
      render();
    }));
    listen(root.querySelector("[data-swap-xy]"), "click", () => {
      composePermutation([1,0,2]);
      render();
    });
    listen(root.querySelector("[data-cycle]"), "click", () => {
      composePermutation([1,2,0]);
      render();
    });
    listen(root.querySelector("[data-permutation-reset]"), "click", () => {
      state.permutation = [0,1,2];
      render();
    });
    root.querySelectorAll("[data-rewrite-kind]").forEach((button) => listen(button, "click", () => {
      state.rewrite = button.dataset.rewriteKind;
      state.step = 0;
      render();
    }));
    listen(root.querySelector("[data-rewrite-prev]"), "click", () => {
      state.step -= 1;
      render();
    });
    listen(root.querySelector("[data-rewrite-next]"), "click", () => {
      state.step += 1;
      render();
    });
    listen(root.querySelector("[data-rewrite-reset]"), "click", () => {
      state.step = 0;
      render();
    });
    root.querySelectorAll("[data-root]").forEach((input) => listen(input, "input", () => {
      state.roots[Number(input.dataset.root)] = Number(input.value);
      renderVieta();
    }));
    render();
  }

  function formal9(el, section) {
    window.Ch1UI?.renderFormal(el, section);
  }

  function formal10(el, section) {
    window.Ch1UI?.renderFormal(el, section);
  }

  function formal11(el, section) {
    window.Ch1UI?.renderFormal(el, section);
  }

  function interactive9(el) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>三种整数检验，各自回答一个问题</h3><p>本原化、有理根验算和 Eisenstein 检查使用独立示例；每个结果都保留可核验的精确等式。</p></div>
      <span hidden data-rational-current-observation></span>
      <section class="ch1-panel ch1-primitive-workbench">
        <div class="ch1-panel-head"><div><span>01 · 本原化</span><h4>清分母，再提出内容</h4></div><div class="ch1-controls"><button type="button" class="is-active" data-normalization-example="fraction" aria-pressed="true">分数系数</button><button type="button" data-normalization-example="integer" aria-pressed="false">有公共因子</button></div></div>
        <div class="ch1-equation-grid">
          <div><span>原多项式 f</span><strong data-normalization-original></strong></div>
          <div><span>公分母 L</span><strong data-common-denominator></strong></div>
          <div><span>Lf</span><strong data-cleared-poly></strong></div>
          <div><span>提出常数 c</span><strong data-content></strong></div>
          <div><span>本原部分 f*</span><strong data-primitive></strong></div>
        </div>
        <div class="ch1-callout"><strong>规范化核验</strong><p data-normalization-check></p></div>
      </section>
      <div class="ch1-control-groups">
        <div class="ch1-controls">
          <span>02 · 选择待检验多项式：</span>
          <button type="button" class="is-active" data-rational-example="root" aria-pressed="true">2x³+x²−x−1</button>
          <button type="button" data-rational-example="eisenstein" aria-pressed="false">x⁵+10x+5</button>
          <button type="button" data-rational-example="quartic" aria-pressed="false">x⁴+4 反例</button>
        </div>
        <div class="ch1-controls">
          <span>03 · 选择素数 p：</span>
          <button type="button" data-prime="2" aria-pressed="false">2</button>
          <button type="button" data-prime="3" aria-pressed="false">3</button>
          <button type="button" class="is-active" data-prime="5" aria-pressed="true">5</button>
        </div>
      </div>
      <div class="ch1-readout">
        <div>f = <strong data-rational-poly></strong></div>
        <p class="ch1-muted" data-rational-note></p>
      </div>
      <div class="ch1-callout" data-rational-evidence hidden><strong>分解证据</strong><p></p></div>
      <div class="ch1-lab-grid">
        <section class="ch1-panel">
          <h4>逐个验算有理根候选</h4>
          <p class="ch1-muted" data-candidate-count></p>
          <div class="ch1-candidate-grid" data-candidates></div>
          <p class="ch1-candidate-observation" data-candidate-observation aria-live="polite"></p>
        </section>
        <section class="ch1-panel">
          <h4>Eisenstein：p=<span data-prime-value></span></h4>
          <div class="ch1-check-list" data-eisenstein-checks></div>
          <div><span data-eisenstein-status></span></div>
        </section>
      </div>
    </div>`;
    mountRationalLab(el);
  }

  function interactive10(el) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>指数格点与乘法合成</h3><p>点击格点读取项；过滤齐次层；切到乘法模式看指数向量的和点。</p></div>
      <div class="ch1-controls">
        <button type="button" class="is-active" data-lattice-mode="support">支撑与齐次层</button>
        <button type="button" data-lattice-mode="multiply">乘法合成</button>
        <button type="button" class="is-active" data-layer="all">全部层</button>
        <button type="button" data-layer="0">d=0</button>
        <button type="button" data-layer="1">d=1</button>
        <button type="button" data-layer="2">d=2</button>
        <button type="button" data-layer="3">d=3</button>
      </div>
      <div class="ch1-lab-grid">
        <div class="ch1-stage"><canvas aria-label="二元多项式指数格点"></canvas></div>
        <div class="ch1-panel">
          <div class="ch1-readout" data-lattice-readout></div>
          <p class="ch1-muted" data-degree-summary></p>
          <div class="ch1-compare" data-layers></div>
          <div class="ch1-controls">
            <span>第一指数：</span>
            <button type="button" data-first='{"i":2,"j":1}'>(2,1)</button>
            <button type="button" data-first='{"i":1,"j":2}'>(1,2)</button>
            <span>第二指数：</span>
            <button type="button" data-second='{"i":1,"j":0}'>(1,0)</button>
            <button type="button" data-second='{"i":0,"j":1}'>(0,1)</button>
          </div>
          <div class="ch1-readout" data-product-coefficient></div>
        </div>
      </div>
    </div>`;
    mountExponentLattice(el);
  }

  function interactive11(el) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>置换轨道与 σ 改写</h3><p>表达式先按指数向量规范化再比较。三循环与换位分开测试，避免把循环对称误当全对称。</p></div>
      <div class="ch1-controls">
        <button type="button" class="is-active" data-sym-expression="squares">x²+y²+z²</button>
        <button type="button" data-sym-expression="orbit">Σsym x²y</button>
        <button type="button" data-sym-expression="cyclic">循环对称反例</button>
        <button type="button" data-sym-expression="nonsym">x²+y</button>
      </div>
      <div class="ch1-controls">
        <button type="button" data-swap-xy>换位 x↔y</button>
        <button type="button" data-cycle>三循环 x→y→z→x</button>
        <button type="button" data-permutation-reset>恢复变量顺序</button>
      </div>
      <div class="ch1-lab-grid">
        <section class="ch1-panel">
          <div class="ch1-readout">
            <div>原式：<strong data-sym-before></strong></div>
            <div>置换后：<strong data-sym-after></strong></div>
            <div class="ch1-muted" data-permutation></div>
            <div><span data-sym-status></span></div>
            <p data-global-status></p>
          </div>
          <h4>x²y 的完整轨道</h4>
          <div class="ch1-orbit" data-orbit></div>
        </section>
        <section class="ch1-panel">
          <div class="ch1-controls">
            <button type="button" class="is-active" data-rewrite-kind="squares">平方和改写</button>
            <button type="button" data-rewrite-kind="orbit">六项轨道和改写</button>
            <button type="button" data-rewrite-kind="cubes">立方和改写</button>
          </div>
          <div class="ch1-rewrite-stage">
            <span>步骤 <strong data-rewrite-step></strong></span>
            <h4 data-rewrite-title></h4>
            <div data-rewrite-formula></div>
          </div>
          <div class="ch1-controls">
            <button type="button" data-rewrite-prev>上一步</button>
            <button type="button" data-rewrite-next>下一步</button>
            <button type="button" data-rewrite-reset>重置</button>
          </div>
        </section>
      </div>
      <section class="ch1-panel ch1-vieta-workbench">
        <div class="ch1-panel-head"><div><span>ROOTS → COEFFICIENTS</span><h4>把根代入 σ，直接生成首一三次式</h4></div></div>
        <div class="ch1-vieta-grid">
          <div class="ch1-node-grid">
            <label>根 r₁<input type="number" step="1" min="-4" max="4" value="1" data-root="0"></label>
            <label>根 r₂<input type="number" step="1" min="-4" max="4" value="2" data-root="1"></label>
            <label>根 r₃<input type="number" step="1" min="-4" max="4" value="3" data-root="2"></label>
          </div>
          <div class="ch1-equation-grid">
            <div><span>σ₁=r₁+r₂+r₃</span><strong data-vieta-sigma1></strong></div>
            <div><span>σ₂=Σrᵢrⱼ</span><strong data-vieta-sigma2></strong></div>
            <div><span>σ₃=r₁r₂r₃</span><strong data-vieta-sigma3></strong></div>
          </div>
        </div>
        <div class="ch1-result-band"><div><span>因式形式</span><strong data-vieta-factorization></strong></div><div><span>展开形式</span><strong data-vieta-polynomial></strong></div></div>
      </section>
    </div>`;
    mountSymmetry(el);
  }

  window.defineChapter1Renderer("rational-polynomials", { formal: formal9, interactive: interactive9 });
  window.defineChapter1Renderer("multivariate-polynomials", { formal: formal10, interactive: interactive10 });
  window.defineChapter1Renderer("symmetric-polynomials", { formal: formal11, interactive: interactive11 });
})();
