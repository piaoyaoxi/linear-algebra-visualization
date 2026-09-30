(() => {
  const M = () => window.Ch1Math;
  const tex = (source) => (window.texInline ? window.texInline(source) : source);
  const listen = (...args) => window.ch1Listen?.(...args);
  const observe = (...args) => window.ch1ObserveResize?.(...args);

  function formal(section, el, config) {
    window.renderChapter1Formal?.(el, section, config);
  }

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
      },
    };
    let current = "root";
    let prime = 5;

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

    function render() {
      const item = examples[current];
      const poly = item.poly;
      root.querySelector("[data-rational-poly]").innerHTML = tex(M().formatPolyTex(poly));
      root.querySelector("[data-rational-note]").textContent = item.note;
      const candidates = rationalCandidates(poly);
      root.querySelector("[data-candidate-count]").textContent = `候选 ${candidates.length} 个（约分、去重、含正负）`;
      root.querySelector("[data-candidates]").innerHTML = candidates.map((candidate) => {
        const value = M().evalPoly(poly, candidate);
        const isRoot = M().rIsZero(value);
        return `<article class="ch1-candidate ${isRoot ? "is-root" : ""}">
          <strong>${tex(M().formatRTex(candidate))}</strong>
          <span>${tex(`f(${M().formatRTex(candidate)})=${M().formatRTex(value)}`)}</span>
          <em>${isRoot ? "是根" : "不是根"}</em>
        </article>`;
      }).join("") || "<p>常数项为 0 时先提出 x，再对剩余多项式使用定理。</p>";

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
      root.querySelectorAll("[data-rational-example]").forEach((button) => button.classList.toggle("is-active", button.dataset.rationalExample === current));
      root.querySelectorAll("[data-prime]").forEach((button) => button.classList.toggle("is-active", Number(button.dataset.prime) === prime));
    }

    root.querySelectorAll("[data-rational-example]").forEach((button) => listen(button, "click", () => {
      current = button.dataset.rationalExample;
      render();
    }));
    root.querySelectorAll("[data-prime]").forEach((button) => listen(button, "click", () => {
      prime = Number(button.dataset.prime);
      render();
    }));
    render();
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
    const state = { current: "squares", permutation: [0,1,2], rewrite: "squares", step: 0 };
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
    };

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
    render();
  }

  function formal9(el, section) {
    formal(section, el, {
      title: "从有理系数到精确整数判据",
      formula: "f=\\operatorname{cont}(f)f^*,\\qquad \\gcd(\\text{coefficients of }f^*)=1",
      details: [
        { title: "清分母与本原化", html: "先乘最小公倍数得到整系数，再提出系数最大公因数；剩余本原部分承载真正的分解问题。" },
        { title: "有理根候选", html: `既约根 ${tex("p/q")} 必满足 ${tex("p\\mid a_0,q\\mid a_n")}；这是候选条件，不是自动判根。` },
        { title: "Eisenstein 三门", html: "素数 p 不整除首项，整除其余所有系数，且 p² 不整除常数项。" },
        { title: "逻辑方向", html: "有理根和 Eisenstein 都是工具。判据失败应写“未得到结论”，不能反写成“可约”。" },
      ],
      cards: [
        { kicker: "候选", title: "约分、去重、含正负", html: "筛选器显示每个候选的精确代值。" },
        { kicker: "素数", title: "失败定位到具体条件", html: "切换 p 后逐行说明哪一门通过或失败。" },
        { kicker: "反例", title: "无有理根未必不可约", html: "x⁴+4 没有有理根，却能分成两个二次因式。" },
      ],
    });
  }

  function formal10(el, section) {
    formal(section, el, {
      title: "指数格点与齐次分层",
      formula: "x^\\alpha x^\\beta=x^{\\alpha+\\beta},\\qquad |\\alpha|=\\sum_i\\alpha_i",
      details: [
        { title: "支撑", html: "非零系数对应的指数格点集合就是多项式的支撑；缺项不会改变格点坐标系。" },
        { title: "三种次数", html: "degₓ、degᵧ 分别取单个坐标最大值；总次数逐项求指数和再取最大。" },
        { title: "齐次层", html: `二元情形 ${tex("i+j=d")} 是一条斜线；同一斜线上的项组成 ${tex("f_d")}。` },
        { title: "乘法聚合", html: "指数向量相加给出落点，所有落到同一格点的系数再相加。" },
      ],
      cards: [
        { kicker: "点击", title: "格点直接读取单项式", html: "点击空格点也会明确显示系数为 0。" },
        { kicker: "过滤", title: "按总次数看齐次层", html: "0、1、2、3 层保持同一坐标系，不重新排列。" },
        { kicker: "配对", title: "指定系数追踪来源", html: "x³y 的系数同时接收 x·2x²y 与 −y·x³。" },
      ],
    });
  }

  function formal11(el, section) {
    formal(section, el, {
      title: "置换不变性与基本对称构件",
      formula: "\\sigma_1=x+y+z,\\quad\\sigma_2=xy+xz+yz,\\quad\\sigma_3=xyz",
      details: [
        { title: "规范比较", html: "置换后先按统一单项式次序合并同类项，再比较；不能依赖字符串顺序。" },
        { title: "轨道和", html: "一个单项式的全部置换像构成轨道；任何置换只重排轨道，因此等系数轨道和对称。" },
        { title: "基本定理的算法", html: "用 σ 的乘积匹配当前最高单项式并相减；规定次序下最高项严格下降，最终终止。" },
        { title: "Vieta", html: "把变量换成一元多项式的根，σ₁、σ₂、… 正好给出带交替符号的系数。" },
      ],
      cards: [
        { kicker: "区分", title: "循环对称不等于全对称", html: "三循环保持不变仍可能在一个换位下改变。" },
        { kicker: "轨道", title: "x²y 产生六个不同项", html: "页面列出并检查不重不漏。" },
        { kicker: "改写", title: "一步一步消去最高项", html: "平方和与六项轨道和各有完整推导。" },
      ],
    });
  }

  function interactive9(el) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>有理根筛选器与素数透镜</h3><p>候选根显示精确代值；Eisenstein 失败只写“未判定”，绝不误报“可约”。</p></div>
      <div class="ch1-control-groups">
        <div class="ch1-controls">
          <button type="button" class="is-active" data-rational-example="root">2x³+x²−x−1</button>
          <button type="button" data-rational-example="eisenstein">x⁵+10x+5</button>
          <button type="button" data-rational-example="quartic">x⁴+4 反例</button>
        </div>
        <div class="ch1-controls">
          <span>素数 p：</span>
          <button type="button" data-prime="2">2</button>
          <button type="button" data-prime="3">3</button>
          <button type="button" class="is-active" data-prime="5">5</button>
        </div>
      </div>
      <div class="ch1-readout">
        <div>f = <strong data-rational-poly></strong></div>
        <p class="ch1-muted" data-rational-note></p>
      </div>
      <div class="ch1-lab-grid">
        <section class="ch1-panel">
          <h4>有理根候选</h4>
          <p class="ch1-muted" data-candidate-count></p>
          <div class="ch1-candidate-grid" data-candidates></div>
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
    </div>`;
    mountSymmetry(el);
  }

  window.defineChapter1Renderer("rational-polynomials", { formal: formal9, interactive: interactive9 });
  window.defineChapter1Renderer("multivariate-polynomials", { formal: formal10, interactive: interactive10 });
  window.defineChapter1Renderer("symmetric-polynomials", { formal: formal11, interactive: interactive11 });
})();