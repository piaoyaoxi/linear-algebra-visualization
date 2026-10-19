(() => {
  const M = () => window.Ch1Math;
  const tex = (source) => (window.texInline ? window.texInline(source) : source);
  const listen = (...args) => window.ch1Listen?.(...args);

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
        poly: M().poly(["-1", "-1", "1", "2"]),
        note: "有理根定理给候选；每个候选仍需精确代入。",
      },
      eisenstein: {
        label: "x⁵+10x+5",
        poly: M().poly(["5", "10", "0", "0", "0", "1"]),
        note: "取 p=5，满足艾森斯坦判别法的三个条件。",
      },
      quartic: {
        label: "x⁴+4",
        poly: M().poly(["4", "0", "0", "0", "1"]),
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

  function interactive9(el) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>有理根筛选器与素数透镜</h3><p>候选根显示精确代值；艾森斯坦判别法的条件不满足时只写“未判定”，绝不误报“可约”。</p></div>
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
          <h4>艾森斯坦判别法：p=<span data-prime-value></span></h4>
          <div class="ch1-check-list" data-eisenstein-checks></div>
          <div><span data-eisenstein-status></span></div>
        </section>
      </div>
    </div>`;
    mountRationalLab(el);
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

  defineLessonRenderer("ch1", "rational-polynomials", { interactive: interactive9 });
  defineLessonRenderer("ch1", "symmetric-polynomials", { interactive: interactive11 });
})();