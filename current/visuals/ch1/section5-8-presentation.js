(() => {
  const M = () => window.Ch1Math;
  const tex = (source) => (window.texInline ? window.texInline(source) : source);
  const listen = (...args) => window.ch1Listen?.(...args);
  const observe = (...args) => window.ch1ObserveResize?.(...args);

  function formal(section, el, config) {
    window.renderChapter1Formal?.(el, section, config);
  }

  function mountFactorTree(root) {
    const data = {
      "x4-1": {
        title: "x^4-1",
        routes: [
          ["x^4-1", "(x^2-1)(x^2+1)", "(x-1)(x+1)(x^2+1)"],
          ["x^4-1", "(x-1)(x^3+x^2+x+1)", "(x-1)(x+1)(x^2+1)"],
        ],
        Q: { leaves: ["x-1", "x+1", "x^2+1"], kinds: ["linear", "linear", "irred"], note: "x²+1 在 Q 上不可约。" },
        R: { leaves: ["x-1", "x+1", "x^2+1"], kinds: ["linear", "linear", "irred"], note: "x²+1 在 R 上无根，仍不可约。" },
        C: { leaves: ["x-1", "x+1", "x-i", "x+i"], kinds: ["linear", "linear", "linear", "linear"], note: "在 C 上全部拆成一次因式。" },
      },
      "x2-2": {
        title: "x^2-2",
        routes: [["x^2-2", "在当前域尝试寻找一次因式"], ["x^2-2", "检查是否存在根"]],
        Q: { leaves: ["x^2-2"], kinds: ["irred"], note: "无有理根，二次故在 Q 上不可约。" },
        R: { leaves: ["x-\\sqrt2", "x+\\sqrt2"], kinds: ["linear", "linear"], note: "实根出现，拆成两个一次因式。" },
        C: { leaves: ["x-\\sqrt2", "x+\\sqrt2"], kinds: ["linear", "linear"], note: "根已经是实数，也属于 C。" },
      },
      "x2+1": {
        title: "x^2+1",
        routes: [["x^2+1", "检查当前域中的根"], ["x^2+1", "尝试一次×一次"]],
        Q: { leaves: ["x^2+1"], kinds: ["irred"], note: "无有理根，二次不可约。" },
        R: { leaves: ["x^2+1"], kinds: ["irred"], note: "无实根，二次不可约。" },
        C: { leaves: ["x-i", "x+i"], kinds: ["linear", "linear"], note: "非实根 ±i 使它继续分裂。" },
      },
      "x4+4": {
        title: "x^4+4",
        routes: [
          ["x^4+4", "x^4+4x^2+4-4x^2", "(x^2-2x+2)(x^2+2x+2)"],
          ["x^4+4", "(x^2+2)^2-(2x)^2", "(x^2-2x+2)(x^2+2x+2)"],
        ],
        Q: { leaves: ["x^2-2x+2", "x^2+2x+2"], kinds: ["irred", "irred"], note: "两个二次式判别式均为 −4，在 Q 上不可约。" },
        R: { leaves: ["x^2-2x+2", "x^2+2x+2"], kinds: ["irred", "irred"], note: "两个二次式无实根，在 R 上不可约。" },
        C: { leaves: ["x-(1+i)", "x-(1-i)", "x-(-1+i)", "x-(-1-i)"], kinds: ["linear", "linear", "linear", "linear"], note: "在 C 上四个一次因式全部出现。" },
      },
    };
    let polynomial = "x4-1";
    let domain = "Q";

    function renderRoute(route, index) {
      return `<article class="ch1-factor-route">
        <span>路线 ${index + 1}</span>
        ${route.map((node, i) => `${i ? '<b aria-hidden="true">→</b>' : ""}<div>${node.includes("x") ? tex(node) : node}</div>`).join("")}
      </article>`;
    }

    function render() {
      const item = data[polynomial];
      const result = item[domain];
      root.querySelector("[data-routes]").innerHTML = item.routes.map(renderRoute).join("");
      root.querySelector("[data-tree]").innerHTML = `
        <div class="ch1-factor-tree">
          <div class="ch1-factor-root">
            <span class="ch1-factor-node is-root">${tex(item.title)}</span>
            <span class="ch1-factor-domain">当前域 ${domain === "Q" ? "ℚ" : domain === "R" ? "ℝ" : "ℂ"}</span>
          </div>
          <div class="ch1-factor-branch" aria-hidden="true"></div>
          <div class="ch1-factor-leaves">
            ${result.leaves.map((leaf, i) => `<span class="ch1-factor-node is-leaf is-${result.kinds[i]}">${tex(leaf)}</span>`).join("")}
          </div>
          <p class="ch1-factor-note">${result.note}</p>
        </div>`;
      root.querySelector("[data-canonical]").innerHTML =
        `规范结果：提取非零常数、因式首一化、排序并合并重数。两条路线最终得到同一个不可约因式多重集合。`;
      root.querySelectorAll("[data-factor-domain]").forEach((button) => button.classList.toggle("is-active", button.dataset.factorDomain === domain));
      root.querySelectorAll("[data-factor-poly]").forEach((button) => button.classList.toggle("is-active", button.dataset.factorPoly === polynomial));
    }

    root.querySelectorAll("[data-factor-domain]").forEach((button) => listen(button, "click", () => {
      domain = button.dataset.factorDomain;
      render();
    }));
    root.querySelectorAll("[data-factor-poly]").forEach((button) => listen(button, "click", () => {
      polynomial = button.dataset.factorPoly;
      render();
    }));
    render();
  }

  function powerFactor(rootValue, multiplicity) {
    let result = [M().R(1)];
    const factor = [M().rNeg(rootValue), M().R(1)];
    for (let i = 0; i < multiplicity; i++) result = M().polyMul(result, factor);
    return result;
  }

  function mountMultiplicity(root) {
    const state = { mode: "multiplicity", a: M().R(1), m: 2, delta: M().R("0.4") };
    const graph = root.querySelector("[data-graph]");
    const rootsCanvas = root.querySelector("[data-roots]");
    const bounds = { xMin: -3, xMax: 3, yMin: -3, yMax: 5 };

    function current() {
      if (state.mode === "multiplicity") {
        const p = M().polyMul(powerFactor(state.a, state.m), M().polyFrom(["1", "1"]));
        return {
          poly: p,
          roots: [
            { x: M().rToNum(state.a), m: state.m, label: `a，m=${state.m}` },
            { x: -1, m: 1, label: "−1" },
          ],
          status: state.m === 1 ? "a 是单根" : `a 是 ${state.m} 重根`,
          note: state.m % 2 ? "奇数重数：穿过横轴" : "偶数重数：接触后返回",
        };
      }
      const left = M().rSub(state.a, state.delta);
      const right = M().rAdd(state.a, state.delta);
      let p = M().polyMul(powerFactor(left, 1), powerFactor(right, 1));
      p = M().polyMul(p, M().polyFrom(["1", "1"]));
      const merged = M().rIsZero(state.delta);
      return {
        poly: p,
        roots: merged
          ? [{ x: M().rToNum(state.a), m: 2, label: "精确二重根" }, { x: -1, m: 1, label: "−1" }]
          : [{ x: M().rToNum(left), m: 1, label: "a−δ" }, { x: M().rToNum(right), m: 1, label: "a+δ" }, { x: -1, m: 1, label: "−1" }],
        status: merged ? "δ=0：两个单根精确合并为二重根" : `δ=${M().formatR(state.delta)}：仍是两个不同单根`,
        note: merged ? "gcd(f,f′) 在临界点获得因式 x−a" : "无论画面多接近，只要 δ≠0 就没有该重因式",
      };
    }

    function render() {
      const item = current();
      const derivative = M().polyDerivative(item.poly);
      const gcd = M().polyGcd(item.poly, derivative);
      root.querySelector("[data-poly]").innerHTML = tex(M().formatPolyTex(item.poly));
      root.querySelector("[data-gcd]").innerHTML = tex(M().formatPolyTex(gcd));
      root.querySelector("[data-status]").textContent = item.status;
      root.querySelector("[data-note]").textContent = item.note;
      root.querySelector("[data-a-value]").textContent = M().formatR(state.a);
      root.querySelector("[data-m-value]").textContent = String(state.m);
      root.querySelector("[data-delta-value]").textContent = M().formatR(state.delta);
      root.querySelector("[data-m-row]").hidden = state.mode !== "multiplicity";
      root.querySelector("[data-delta-row]").hidden = state.mode !== "collision";
      root.querySelectorAll("[data-multiplicity-mode]").forEach((button) => button.classList.toggle("is-active", button.dataset.multiplicityMode === state.mode));
      M().drawPolyGraph(graph, item.poly, {
        bounds,
        points: item.roots.map((r) => ({ x: r.x, y: 0 })),
        caption: "固定相机 · 代数临界状态不由像素距离判定",
      });
      M().drawRootAxis(rootsCanvas, item.roots, { bounds: { xMin: -3, xMax: 3, yMin: -1.4, yMax: 1.4 } });
    }

    root.querySelectorAll("[data-multiplicity-mode]").forEach((button) => listen(button, "click", () => {
      state.mode = button.dataset.multiplicityMode;
      render();
    }));
    listen(root.querySelector("[data-a]"), "input", (event) => {
      state.a = M().R(String(event.target.value));
      render();
    });
    listen(root.querySelector("[data-m]"), "input", (event) => {
      state.m = Number(event.target.value);
      render();
    });
    listen(root.querySelector("[data-delta]"), "input", (event) => {
      state.delta = M().R(String(event.target.value));
      render();
    });
    root.querySelectorAll("[data-m-preset]").forEach((button) => listen(button, "click", () => {
      state.mode = "multiplicity";
      state.m = Number(button.dataset.mPreset);
      root.querySelector("[data-m]").value = String(state.m);
      render();
    }));
    observe(root.querySelector(".ch1-lab-grid"), render);
    render();
  }

  function mountEvaluation(root) {
    const state = {
      mode: "evaluation",
      polynomial: M().polyFrom(["1", "-3", "1"]),
      a: M().R(1),
      points: [
        { x: M().R(0), y: M().R(1) },
        { x: M().R(1), y: M().R(2) },
        { x: M().R(2), y: M().R(5) },
      ],
      basis: "sum",
    };
    const canvas = root.querySelector("canvas");

    function horner(poly, value) {
      const rows = [];
      let acc = M().R(0);
      for (let i = poly.length - 1; i >= 0; i--) {
        const before = acc;
        acc = M().rAdd(M().rMul(acc, value), poly[i]);
        rows.push({ degree: i, before, coefficient: poly[i], after: acc });
      }
      return { value: acc, rows };
    }

    function readPoints() {
      const next = state.points.map((point) => ({ ...point }));
      let valid = true;
      root.querySelectorAll("[data-node]").forEach((input) => {
        try {
          const [axis, indexText] = input.dataset.node.split("-");
          next[Number(indexText)][axis] = M().R(input.value);
          input.classList.remove("is-invalid");
          input.removeAttribute("aria-invalid");
        } catch {
          valid = false;
          input.classList.add("is-invalid");
          input.setAttribute("aria-invalid", "true");
        }
      });
      if (valid) state.points = next;
      return valid;
    }

    function renderEvaluation() {
      const result = horner(state.polynomial, state.a);
      root.querySelector("[data-polynomial]").innerHTML = tex(M().formatPolyTex(state.polynomial));
      root.querySelector("[data-a-value]").textContent = M().formatR(state.a);
      root.querySelector("[data-value]").innerHTML = tex(M().formatRTex(result.value));
      const isRoot = M().rIsZero(result.value);
      const status = root.querySelector("[data-factor-status]");
      status.textContent = isRoot ? "f(a)=0：x−a 是因式" : "f(a)≠0：x−a 不是因式";
      status.className = `ch1-status ${isRoot ? "is-ok" : "is-warn"}`;
      root.querySelector("[data-horner]").innerHTML = result.rows.map((row, index) => `
        <div class="${index === result.rows.length - 1 ? "is-current" : ""}">
          <span>${index + 1}</span>
          ${tex(`${M().formatRTex(row.before)}\\cdot${M().formatRTex(state.a)}+${M().formatRTex(row.coefficient)}=${M().formatRTex(row.after)}`)}
        </div>`).join("");
      M().drawPolyGraph(canvas, state.polynomial, {
        bounds: { xMin: -3, xMax: 3, yMin: -4, yMax: 7 },
        points: [{ x: M().rToNum(state.a), y: M().rToNum(result.value) }],
        caption: "评价模式 · Horner 结果与图上点同步",
      });
    }

    function renderInterpolation() {
      const status = root.querySelector("[data-interp-status]");
      try {
        const { poly, bases } = M().interpolate(state.points);
        status.textContent = "节点横坐标互异：插值存在且唯一";
        status.className = "ch1-status is-ok";
        const shown = state.basis === "sum" ? poly : bases[Number(state.basis)];
        root.querySelector("[data-interp-poly]").innerHTML = tex(M().formatPolyTex(poly));
        root.querySelector("[data-basis-formulas]").innerHTML = bases.map((basis, i) => `
          <button type="button" class="ch1-basis-row${state.basis === String(i) ? " is-active" : ""}" data-basis="${i}">
            ${tex(`L_${i}(x)=${M().formatPolyTex(basis)}`)}
            <span>${state.points.map((point, j) => `L${i}(x${j})=${M().formatR(M().evalPoly(basis, point.x))}`).join("，")}</span>
          </button>`).join("");
        M().drawPolyGraph(canvas, shown, {
          bounds: { xMin: -1, xMax: 3, yMin: -3, yMax: 7 },
          points: state.basis === "sum" ? state.points.map((point) => ({ x: M().rToNum(point.x), y: M().rToNum(point.y) })) : [],
          caption: state.basis === "sum" ? "插值总和" : `拉格朗日基 L${state.basis}`,
        });
      } catch (error) {
        status.textContent = error.message;
        status.className = "ch1-status is-bad";
        root.querySelector("[data-interp-poly]").textContent = "—";
        root.querySelector("[data-basis-formulas]").innerHTML = "<p>请先让三个横坐标互不相同。</p>";
        M().drawPolyGraph(canvas, [M().R(0)], {
          bounds: { xMin: -1, xMax: 3, yMin: -3, yMax: 7 },
          caption: "节点冲突：插值关闭",
        });
      }
      root.querySelectorAll("[data-basis]").forEach((button) => listen(button, "click", () => {
        state.basis = button.dataset.basis;
        render();
      }));
    }

    function render() {
      root.querySelector("[data-evaluation-controls]").hidden = state.mode !== "evaluation";
      root.querySelector("[data-interpolation-controls]").hidden = state.mode !== "interpolation";
      root.querySelectorAll("[data-eval-mode]").forEach((button) => button.classList.toggle("is-active", button.dataset.evalMode === state.mode));
      if (state.mode === "evaluation") renderEvaluation();
      else renderInterpolation();
    }

    root.querySelectorAll("[data-eval-mode]").forEach((button) => listen(button, "click", () => {
      state.mode = button.dataset.evalMode;
      render();
    }));
    listen(root.querySelector("[data-a]"), "input", (event) => {
      state.a = M().R(String(event.target.value));
      render();
    });
    root.querySelectorAll("[data-eval-preset]").forEach((button) => listen(button, "click", () => {
      state.polynomial = button.dataset.evalPreset === "root"
        ? M().polyFrom(["-2", "1", "1"])
        : M().polyFrom(["1", "-3", "1"]);
      render();
    }));
    listen(root, "input", (event) => {
      if (!(event.target instanceof HTMLInputElement) || !event.target.matches("[data-node]")) return;
      if (readPoints()) {
        state.basis = "sum";
        render();
      }
    });
    listen(root.querySelector("[data-show-sum]"), "click", () => {
      state.basis = "sum";
      render();
    });
    observe(root.querySelector(".ch1-stage"), render);
    render();
  }

  function mountConjugate(root) {
    const state = { a: M().R(1), b: M().R("1.5"), mode: "R" };
    const canvas = root.querySelector("canvas");

    function render() {
      const a = state.a;
      const b = state.b;
      const constant = M().rAdd(M().rMul(a, a), M().rMul(b, b));
      const quadratic = M().polyFrom([constant, M().rMul(M().R(-2), a), M().R(1)]);
      const bNumber = M().rToNum(b);
      root.querySelector("[data-a-value]").textContent = M().formatR(a);
      root.querySelector("[data-b-value]").textContent = M().formatR(b);
      root.querySelector("[data-quadratic]").innerHTML = tex(M().formatPolyTex(quadratic));
      root.querySelector("[data-linear]").innerHTML = bNumber === 0
        ? tex(`(x-${M().formatRTex(a)})^2`)
        : `${tex(`x-(${M().formatRTex(a)}+${M().formatRTex(b)}i)`)} · ${tex(`x-(${M().formatRTex(a)}-${M().formatRTex(b)}i)`)}`;
      const status = root.querySelector("[data-conjugate-status]");
      status.textContent = bNumber === 0
        ? "b=0：共轭对合并为实二重根"
        : state.mode === "R"
          ? "R 镜头：一对非实根合并为实二次因式"
          : "C 镜头：显示两个一次因式";
      status.className = `ch1-status ${bNumber === 0 ? "is-warn" : "is-ok"}`;
      root.querySelectorAll("[data-complex-mode]").forEach((button) => button.classList.toggle("is-active", button.dataset.complexMode === state.mode));
      M().drawComplexPlane(canvas, [
        { re: M().rToNum(a), im: bNumber, label: bNumber === 0 ? "a（二重）" : "α" },
        ...(bNumber === 0 ? [] : [{ re: M().rToNum(a), im: -bNumber, label: "ᾱ", color: M().getPalette().blue }]),
      ]);
    }

    root.querySelectorAll("[data-complex-mode]").forEach((button) => listen(button, "click", () => {
      state.mode = button.dataset.complexMode;
      render();
    }));
    listen(root.querySelector("[data-real]"), "input", (event) => {
      state.a = M().R(String(event.target.value));
      render();
    });
    listen(root.querySelector("[data-imag]"), "input", (event) => {
      state.b = M().R(String(event.target.value));
      render();
    });
    observe(root.querySelector(".ch1-stage"), render);
    render();
  }

  function formal5(el, section) {
    formal(section, el, {
      title: "因式树的终点与唯一性",
      formula: "f=c\\,p_1^{m_1}\\cdots p_r^{m_r}",
      details: [
        { title: "存在性", html: "只要当前因式可约，就拆成两个更低次的非常数因式；次数严格下降使拆分有限停止。" },
        { title: "唯一性", html: "中间路径可以不同；把常数提出、不可约因式首一化并排序后，叶节点与重数唯一。" },
        { title: "数域依赖", html: `${tex("x^2-2")}、${tex("x^2+1")} 在 ℚ、ℝ、ℂ 中会停在不同叶节点。` },
        { title: "没有根的限度", html: "二次、三次无根可推出不可约；四次以上仍可能分成没有根的高次因式。" },
      ],
      cards: [
        { kicker: "路线", title: "拆法可以不同", html: "双路线视图把“过程不唯一”和“终点唯一”同时显示。" },
        { kicker: "规范", title: "先首一再比较", html: "单位和排列是表面差异，规范化后才能判定是否同一分解。" },
        { kicker: "数域", title: "切换镜头，叶节点改变", html: "不可约性从来不是脱离系数域的标签。" },
      ],
    });
  }

  function formal6(el, section) {
    formal(section, el, {
      title: "重数、导数与精确根合并",
      formula: "\\gcd(f,f')=1\\iff f\\ \\text{无重因式}",
      details: [
        { title: "幂次定义", html: `${tex("p^m\\mid f")} 而 ${tex("p^{m+1}\\nmid f")} 时，m 是不可约因式 p 的重数。` },
        { title: "导数为什么少一层", html: `若 ${tex("f=(x-a)^mh")}，则 ${tex("f'=(x-a)^{m-1}(mh+(x-a)h')")}。` },
        { title: "实图像的奇偶", html: "奇数重数改变符号并穿过横轴；偶数重数不改变符号并返回；高重数使局部更平。" },
        { title: "接近不等于相等", html: "两个根是否重合由精确参数 δ=0 判定，不由屏幕像素或浮点阈值猜测。" },
      ],
      cards: [
        { kicker: "同步", title: "因式、gcd、图像同源", html: "三处由同一个精确多项式生成，不分别手写结论。" },
        { kicker: "临界", title: "δ=0 才跳变", html: "δ 很小仍是两个单根；精确为零时 gcd 才获得公共因式。" },
        { kicker: "相机", title: "固定坐标保持比较", html: "根移动和曲线变化不会触发自动缩放。" },
      ],
    });
  }

  function formal7(el, section) {
    formal(section, el, {
      title: "评价、因式定理与插值",
      formula: "f(x)=(x-a)q(x)+f(a)",
      details: [
        { title: "Horner 评价", html: "从高次系数开始，反复“乘 a 再加下一系数”；页面用精确分数记录每个累加器。" },
        { title: "根数上界", html: "n+1 个不同根会贡献 n+1 个一次因式，与非零 n 次多项式的次数矛盾。" },
        { title: "拉格朗日基", html: `${tex("L_i(x_j)=\\delta_{ij}")}，每个基只负责一个节点的纵坐标。` },
        { title: "唯一性", html: "两个次数≤n的插值多项式之差有 n+1 个根，只能是零多项式。" },
      ],
      cards: [
        { kicker: "代入", title: "公式、数值、图上点同步", html: "移动 a 时三者来自同一 Horner 结果。" },
        { kicker: "基函数", title: "一个点取 1，其余取 0", html: "可单独显示每个 Lᵢ，再切回加权总和。" },
        { kicker: "错误门", title: "重复横坐标关闭构造", html: "节点冲突时明确说明分母为 0，不生成伪结果。" },
      ],
    });
  }

  function formal8(el, section) {
    formal(section, el, {
      title: "复平面上的共轭锁",
      formula: "(x-(a+bi))(x-(a-bi))=x^2-2ax+a^2+b^2",
      details: [
        { title: "C 上完全分裂", html: "代数基本定理保证先找到一个根；对次数归纳即可拆成 n 个一次因式（含重数）。" },
        { title: "共轭为什么保根", html: `实系数时 ${tex("f(\\bar z)=\\overline{f(z)}")}；零的共轭仍是零。` },
        { title: "实二次卡片", html: "一对非实共轭根相乘后虚部消失；b≠0 时所得二次在 R 上无根而不可约。" },
        { title: "临界 b=0", html: "共轭点合并到实轴，二次式退化为 (x−a)²，成为实二重根。" },
      ],
      cards: [
        { kicker: "几何", title: "关于实轴严格镜像", html: "两点实部相同、虚部相反，直接由参数计算。" },
        { kicker: "R 镜头", title: "看实二次因式", html: "共轭一次因式配成一个实系数块。" },
        { kicker: "C 镜头", title: "拆到一次", html: "切换后显示同一根数据对应的两个一次因式。" },
      ],
    });
  }

  function interactive5(el) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>双路线因式树</h3><p>中间拆法可以不同；规范化后的不可约叶节点必须相同。切换数域会改变“不可约”的终点。</p></div>
      <div class="ch1-control-groups">
        <div class="ch1-controls">
          <button type="button" class="is-active" data-factor-domain="Q">ℚ</button>
          <button type="button" data-factor-domain="R">ℝ</button>
          <button type="button" data-factor-domain="C">ℂ</button>
        </div>
        <div class="ch1-controls">
          <button type="button" class="is-active" data-factor-poly="x4-1">x⁴−1</button>
          <button type="button" data-factor-poly="x2-2">x²−2</button>
          <button type="button" data-factor-poly="x2+1">x²+1</button>
          <button type="button" data-factor-poly="x4+4">x⁴+4</button>
        </div>
      </div>
      <div class="ch1-factor-routes" data-routes></div>
      <div data-tree></div>
      <div class="ch1-readout" data-canonical></div>
    </div>`;
    mountFactorTree(el);
  }

  function interactive6(el) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>重数与根合并</h3><p>重数模式比较 (x−a)^m；根合并模式比较 a−δ 与 a+δ。只有 δ 精确为 0 时才产生二重根。</p></div>
      <div class="ch1-controls">
        <button type="button" class="is-active" data-multiplicity-mode="multiplicity">重数模式</button>
        <button type="button" data-multiplicity-mode="collision">根合并模式</button>
        <button type="button" data-m-preset="1">m=1</button>
        <button type="button" data-m-preset="2">m=2</button>
        <button type="button" data-m-preset="3">m=3</button>
        <button type="button" data-m-preset="4">m=4</button>
      </div>
      <div class="ch1-lab-grid">
        <div class="ch1-panel">
          <div class="ch1-stage"><canvas data-graph aria-label="重数多项式图像"></canvas></div>
          <div class="ch1-stage is-short"><canvas data-roots aria-label="根与重数轴"></canvas></div>
        </div>
        <div class="ch1-panel">
          <label class="ch1-slider-row">根位置 a
            <input data-a type="range" min="-2" max="2" step="0.1" value="1" />
            <strong data-a-value>1</strong>
          </label>
          <label class="ch1-slider-row" data-m-row>重数 m
            <input data-m type="range" min="1" max="4" step="1" value="2" />
            <strong data-m-value>2</strong>
          </label>
          <label class="ch1-slider-row" data-delta-row hidden>根间半距 δ
            <input data-delta type="range" min="0" max="1" step="0.1" value="0.4" />
            <strong data-delta-value>0.4</strong>
          </label>
          <div class="ch1-readout">
            <div>f = <span data-poly></span></div>
            <div>gcd(f,f′) = <span data-gcd></span></div>
            <div><span class="ch1-status" data-status></span></div>
            <p class="ch1-muted" data-note></p>
          </div>
        </div>
      </div>
    </div>`;
    mountMultiplicity(el);
  }

  function interpolationInputs(points) {
    return points.map((point, index) => `<div class="ch1-node-row">
      <label>x${index}<input type="text" inputmode="decimal" data-node="x-${index}" value="${M().formatR(point.x)}" /></label>
      <label>y${index}<input type="text" inputmode="decimal" data-node="y-${index}" value="${M().formatR(point.y)}" /></label>
    </div>`).join("");
  }

  function interactive7(el) {
    const points = [
      { x: M().R(0), y: M().R(1) },
      { x: M().R(1), y: M().R(2) },
      { x: M().R(2), y: M().R(5) },
    ];
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>评价机器与拉格朗日构造器</h3><p>代入模式展示 Horner 账本；插值模式允许精确编辑节点并单独查看每个拉格朗日基。</p></div>
      <div class="ch1-controls">
        <button type="button" class="is-active" data-eval-mode="evaluation">评价</button>
        <button type="button" data-eval-mode="interpolation">插值</button>
      </div>
      <div class="ch1-lab-grid">
        <div class="ch1-stage"><canvas aria-label="多项式评价或插值图像"></canvas></div>
        <div class="ch1-panel">
          <div data-evaluation-controls>
            <div class="ch1-controls">
              <button type="button" data-eval-preset="default">x²−3x+1</button>
              <button type="button" data-eval-preset="root">x²+x−2</button>
            </div>
            <label class="ch1-slider-row">代入 a
              <input data-a type="range" min="-2" max="3" step="0.25" value="1" />
              <strong data-a-value>1</strong>
            </label>
            <div class="ch1-readout">
              <div>f = <span data-polynomial></span></div>
              <div>f(a) = <strong data-value></strong></div>
              <div><span data-factor-status></span></div>
            </div>
            <div class="ch1-ledger" data-horner></div>
          </div>
          <div data-interpolation-controls hidden>
            <div class="ch1-node-grid">${interpolationInputs(points)}</div>
            <div class="ch1-controls"><button type="button" data-show-sum>显示加权总和</button></div>
            <div class="ch1-readout">
              <div><span data-interp-status></span></div>
              <div>插值多项式 = <strong data-interp-poly></strong></div>
            </div>
            <div class="ch1-basis-list" data-basis-formulas></div>
          </div>
        </div>
      </div>
    </div>`;
    mountEvaluation(el);
  }

  function interactive8(el) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>共轭锁复平面</h3><p>根点、共轭点和实二次因式由同一组 a、b 生成；相机固定，b=0 是精确临界状态。</p></div>
      <div class="ch1-controls">
        <button type="button" class="is-active" data-complex-mode="R">ℝ：实二次</button>
        <button type="button" data-complex-mode="C">ℂ：一次因式</button>
      </div>
      <div class="ch1-lab-grid">
        <div class="ch1-stage"><canvas aria-label="共轭根复平面"></canvas></div>
        <div class="ch1-panel">
          <label class="ch1-slider-row">实部 a
            <input data-real type="range" min="-2" max="2" step="0.1" value="1" />
            <strong data-a-value>1</strong>
          </label>
          <label class="ch1-slider-row">虚部 b
            <input data-imag type="range" min="0" max="2.5" step="0.1" value="1.5" />
            <strong data-b-value>1.5</strong>
          </label>
          <div class="ch1-readout">
            <div>实二次因式：<span data-quadratic></span></div>
            <div>复一次因式：<span data-linear></span></div>
            <div><span data-conjugate-status></span></div>
          </div>
        </div>
      </div>
    </div>`;
    mountConjugate(el);
  }

  window.defineChapter1Renderer("factorization-theorem", { formal: formal5, interactive: interactive5 });
  window.defineChapter1Renderer("multiple-factors", { formal: formal6, interactive: interactive6 });
  window.defineChapter1Renderer("polynomial-functions", { formal: formal7, interactive: interactive7 });
  window.defineChapter1Renderer("complex-real-factorization", { formal: formal8, interactive: interactive8 });
})();