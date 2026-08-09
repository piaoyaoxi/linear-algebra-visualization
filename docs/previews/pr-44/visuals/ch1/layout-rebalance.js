/* Chapter 1 layout rebalance: a focused multivariate workspace with no dead column. */
(() => {
  "use strict";

  const M = () => window.Ch1Math;
  const tex = (source) => (window.texInline ? window.texInline(source) : source);
  const listen = (...args) => window.ch1Listen?.(...args);
  const observe = (...args) => window.ch1ObserveResize?.(...args);

  const baseTerms = [
    { i: 3, j: 0, c: 1, plain: "x³", math: "x^3" },
    { i: 2, j: 1, c: 2, plain: "2x²y", math: "2x^2y" },
    { i: 1, j: 2, c: -1, plain: "−xy²", math: "-xy^2" },
    { i: 0, j: 3, c: 4, plain: "4y³", math: "4y^3" },
    { i: 1, j: 0, c: 1, plain: "x", math: "x" },
    { i: 0, j: 0, c: -1, plain: "−1", math: "-1" },
  ];
  const multiplierTerms = [
    { i: 1, j: 0, c: 1, math: "x" },
    { i: 0, j: 1, c: -1, math: "-y" },
  ];

  function termAt(i, j) {
    return baseTerms.find((term) => term.i === i && term.j === j) || null;
  }

  function layerFormula(degree) {
    const terms = baseTerms.filter((term) => term.i + term.j === degree);
    if (!terms.length) return "0";
    return terms.map((term, index) => {
      const body = term.math.startsWith("-") ? term.math.slice(1) : term.math;
      if (index === 0) return term.math;
      return `${term.c < 0 ? "-" : "+"}${body}`;
    }).join("");
  }

  function monomial(exp) {
    const x = exp.i === 0 ? "" : exp.i === 1 ? "x" : `x^{${exp.i}}`;
    const y = exp.j === 0 ? "" : exp.j === 1 ? "y" : `y^{${exp.j}}`;
    return x || y ? `${x}${y}` : "1";
  }

  function mount(root) {
    const state = {
      mode: "support",
      layer: "all",
      selected: { i: 2, j: 1 },
      first: { i: 2, j: 1 },
      second: { i: 1, j: 0 },
      target: { i: 3, j: 1 },
    };
    const canvas = root.querySelector("canvas");
    let lattice = null;

    function setActive(selector, value, key) {
      root.querySelectorAll(selector).forEach((button) => {
        const active = button.dataset[key] === String(value);
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }

    function renderSupport() {
      const terms = baseTerms
        .filter((term) => state.layer === "all" || term.i + term.j === Number(state.layer))
        .map((term) => ({
          i: term.i,
          j: term.j,
          c: term.c,
          label: term.plain,
          active: term.i === state.selected.i && term.j === state.selected.j,
        }));
      lattice = M().drawLattice(canvas, terms, { maxI: 4, maxJ: 4 });
      const selected = termAt(state.selected.i, state.selected.j);
      const readout = root.querySelector("[data-lattice-readout]");
      if (selected) {
        readout.innerHTML = `
          <span>当前格点 (${selected.i}, ${selected.j})</span>
          <strong>${tex(selected.math)}</strong>
          <p>x 的指数是 ${selected.i}，y 的指数是 ${selected.j}，所以总次数是 ${selected.i + selected.j}。</p>`;
      } else {
        readout.innerHTML = `
          <span>当前格点 (${state.selected.i}, ${state.selected.j})</span>
          <strong>系数为 0</strong>
          <p>这个位置属于指数空间，但不在当前多项式的支撑中。</p>`;
      }
      root.querySelector("[data-degree-summary]").textContent =
        "当前多项式的总次数、x 次数和 y 次数都等于 3；数值相同只是巧合，定义并不相同。";
    }

    function renderMultiply() {
      const sum = { i: state.first.i + state.second.i, j: state.first.j + state.second.j };
      lattice = M().drawLattice(canvas, [
        { ...state.first, label: `α=(${state.first.i},${state.first.j})` },
        { ...state.second, label: `β=(${state.second.i},${state.second.j})` },
        { ...sum, label: `α+β=(${sum.i},${sum.j})`, active: true },
      ], { maxI: 5, maxJ: 5 });
      root.querySelector("[data-lattice-readout]").innerHTML = `
        <span>指数向量相加</span>
        <strong>${tex(`(${state.first.i},${state.first.j})+(${state.second.i},${state.second.j})=(${sum.i},${sum.j})`)}</strong>
        <p>乘积格点的两个坐标，分别由 x 指数和 y 指数相加得到。</p>`;
      root.querySelector("[data-degree-summary]").textContent =
        "在指数空间中，单项式乘法就是向量加法；系数相乘，指数逐坐标相加。";
      root.querySelector("[data-product-result]").innerHTML = `
        <span>当前乘积</span>
        <strong>${tex(`${monomial(state.first)}\\cdot{}${monomial(state.second)}=${monomial(sum)}`)}</strong>
        <p>${tex(`(${state.first.i},${state.first.j})+(${state.second.i},${state.second.j})=(${sum.i},${sum.j})`)}，结果落在高亮格点。</p>`;

      const contributions = [];
      baseTerms.forEach((left) => {
        multiplierTerms.forEach((right) => {
          if (left.i + right.i !== state.target.i || left.j + right.j !== state.target.j) return;
          contributions.push({ left, right, value: left.c * right.c });
        });
      });
      const total = contributions.reduce((sumValue, item) => sumValue + item.value, 0);
      root.querySelector("[data-target-expression]").innerHTML = tex(`[${monomial(state.target)}]\\,f(x,y)(x-y)`);
      root.querySelector("[data-coefficient-ledger]").innerHTML = contributions.length
        ? contributions.map((item) => `<tr><td>${tex(item.left.math)}</td><td>${tex(item.right.math)}</td><td>${item.value}</td></tr>`).join("")
        : `<tr><td colspan="3">没有指数和落到这个格点，系数为 0。</td></tr>`;
      root.querySelector("[data-target-coefficient]").textContent = String(total);
      setActive("[data-target]", JSON.stringify(state.target), "target");
    }

    function renderLayers() {
      root.querySelector("[data-layers]").innerHTML = [0, 1, 2, 3].map((degree) => `
        <article class="ch1-multivariate-layer-card ${state.layer === String(degree) ? "is-active" : ""}">
          <span>总次数 ${degree}</span>
          <strong>${tex(`f_${degree}=${layerFormula(degree)}`)}</strong>
        </article>`).join("");
    }

    function render() {
      setActive("[data-lattice-mode]", state.mode, "latticeMode");
      setActive("[data-layer]", state.layer, "layer");
      setActive("[data-first]", JSON.stringify(state.first), "first");
      setActive("[data-second]", JSON.stringify(state.second), "second");
      root.querySelector("[data-support-module]").hidden = state.mode !== "support";
      root.querySelector("[data-multiply-module]").hidden = state.mode !== "multiply";
      if (state.mode === "support") renderSupport();
      else renderMultiply();
      renderLayers();
    }

    listen(canvas, "click", (event) => {
      if (state.mode !== "support") return;
      const rect = canvas.getBoundingClientRect();
      const point = lattice?.hitTest(event.clientX - rect.left, event.clientY - rect.top);
      if (!point) return;
      state.selected = { i: point.i, j: point.j };
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
    root.querySelectorAll("[data-target]").forEach((button) => listen(button, "click", () => {
      state.target = JSON.parse(button.dataset.target);
      state.mode = "multiply";
      render();
    }));

    observe(root.querySelector(".ch1-multivariate-stage"), render);
    render();
  }

  function interactive(el, section) {
    el.innerHTML = `<h2>交互实验</h2>
      <div class="ch1-lab">
        <div class="ch1-lab-head">
          <h3>指数格点：先看位置，再看分层与乘法</h3>
          <p>${section.interactive.description} 主图只承担格点观察；齐次分层和乘法计算分别放在图下方，不再挤进右栏。</p>
        </div>
        <div class="ch1-controls" role="group" aria-label="选择指数格点观察模式">
          <button type="button" class="is-active" data-lattice-mode="support" aria-pressed="true">支撑与齐次层</button>
          <button type="button" data-lattice-mode="multiply" aria-pressed="false">乘法合成</button>
        </div>
        <div class="ch1-multivariate-workspace">
          <div class="ch1-multivariate-primary">
            <div class="ch1-stage ch1-multivariate-stage"><canvas aria-label="二元多项式指数格点"></canvas></div>
            <aside class="ch1-multivariate-inspector">
              <div class="ch1-multivariate-readout" data-lattice-readout></div>
              <div class="ch1-multivariate-axis-key">
                <span>怎样读这张图</span>
                <div class="ch1-axis-key-grid">
                  <div><strong>横坐标 i</strong><small>x 的指数</small></div>
                  <div><strong>纵坐标 j</strong><small>y 的指数</small></div>
                  <div><strong>斜线 i+j=d</strong><small>同一齐次层</small></div>
                </div>
              </div>
              <p class="ch1-multivariate-summary" data-degree-summary></p>
            </aside>
          </div>

          <section class="ch1-multivariate-module" data-support-module>
            <header class="ch1-multivariate-module-head">
              <span>HOMOGENEOUS LAYERS</span>
              <h4>按总次数查看齐次分层</h4>
              <p>选择一个 d，只保留位于斜线 i+j=d 上的项；下方同步列出完整齐次分解。</p>
            </header>
            <div class="ch1-controls" role="group" aria-label="选择总次数层">
              <button type="button" class="is-active" data-layer="all">全部层</button>
              <button type="button" data-layer="0">d=0</button>
              <button type="button" data-layer="1">d=1</button>
              <button type="button" data-layer="2">d=2</button>
              <button type="button" data-layer="3">d=3</button>
            </div>
            <div class="ch1-multivariate-layer-grid" data-layers></div>
          </section>

          <section class="ch1-multivariate-module" data-multiply-module hidden>
            <header class="ch1-multivariate-module-head">
              <span>MONOMIAL PRODUCT &amp; COEFFICIENT CONVOLUTION</span>
              <h4>先合成一个乘积格点，再汇总多项式乘积的全部来源</h4>
              <p>上半部分解释一个指数和；下半部分固定 f(x,y)(x−y) 的目标格点，收集所有到达它的系数贡献。</p>
            </header>
            <div class="ch1-multivariate-product-grid">
              <div class="ch1-multivariate-product-controls">
                <div class="ch1-exponent-choice">
                  <span>第一指数</span>
                  <div class="ch1-controls">
                    <button type="button" class="is-active" data-first='{"i":2,"j":1}'>(2,1)</button>
                    <button type="button" data-first='{"i":1,"j":2}'>(1,2)</button>
                  </div>
                </div>
                <div class="ch1-exponent-choice">
                  <span>第二指数</span>
                  <div class="ch1-controls">
                    <button type="button" class="is-active" data-second='{"i":1,"j":0}'>(1,0)</button>
                    <button type="button" data-second='{"i":0,"j":1}'>(0,1)</button>
                  </div>
                </div>
              </div>
              <div class="ch1-multivariate-product-result" data-product-result></div>
            </div>
            <div class="ch1-coefficient-aggregation">
              <div class="ch1-multivariate-module-head">
                <span>COEFFICIENT LEDGER</span>
                <h4>目标系数的完整来源</h4>
                <p>选择结果地址 γ；只有满足 α+β=γ 的项对会进入账本。</p>
              </div>
              <div class="ch1-controls" role="group" aria-label="选择乘积中的目标指数">
                <button type="button" class="is-active" data-target='{"i":3,"j":1}' aria-pressed="true">γ=(3,1)</button>
                <button type="button" data-target='{"i":2,"j":2}' aria-pressed="false">γ=(2,2)</button>
                <button type="button" data-target='{"i":1,"j":3}' aria-pressed="false">γ=(1,3)</button>
                <button type="button" data-target='{"i":4,"j":0}' aria-pressed="false">γ=(4,0)</button>
              </div>
              <div class="ch1-equation-grid">
                <div><span>正在计算</span><strong data-target-expression></strong></div>
                <div><span>聚合后系数</span><strong data-target-coefficient></strong></div>
              </div>
              <div class="ch1-table-wrap"><table class="ch1-table"><thead><tr><th>f 中的项</th><th>x−y 中的项</th><th>系数贡献</th></tr></thead><tbody data-coefficient-ledger></tbody></table></div>
            </div>
          </section>
        </div>
      </div>`;
    mount(el);
  }

  window.defineChapter1Renderer("multivariate-polynomials", { interactive });
})();
