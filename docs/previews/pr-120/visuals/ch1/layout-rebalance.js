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
    };
    const canvas = root.querySelector("canvas");
    let lattice = null;
    let gate = null;

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
      drawLexOrder(terms);
      const selected = termAt(state.selected.i, state.selected.j);
      const readout = root.querySelector("[data-lattice-readout]");
      if (selected) {
        const rank = lexOrder().indexOf(selected) + 1;
        readout.innerHTML = `
          <span>当前格点 ${tex(`(${selected.i},${selected.j})`)}</span>
          <strong>${tex(selected.math)}</strong>
          <p>${tex("x")} 的指数是 ${selected.i}，${tex("y")} 的指数是 ${selected.j}，所以总次数是 ${selected.i + selected.j}。按字典序排第 ${rank}${rank === 1 ? "，是首项" : ""}。</p>`;
      } else {
        readout.innerHTML = `
          <span>当前格点 ${tex(`(${state.selected.i},${state.selected.j})`)}</span>
          <strong>系数为 0</strong>
          <p>这个位置属于指数空间，但不在当前多项式的支撑中。</p>`;
      }
      root.querySelector("[data-degree-summary]").innerHTML =
        `当前多项式的总次数、${tex("x")} 次数和 ${tex("y")} 次数都等于 3；数值相同只是巧合，定义并不相同。`;
    }

    // lexicographic order (x before y): compare the x exponent, then the y exponent
    const lexOrder = () => baseTerms.slice().sort((p, q) => q.i - p.i || q.j - p.j);

    // number every visible term by its place in the lexicographic order; the first one is the leading term
    function drawLexOrder(terms) {
      const ctx = canvas.getContext("2d");
      const pal = M().getPalette();
      const order = lexOrder();
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      terms.forEach((term) => {
        const k = order.findIndex((t) => t.i === term.i && t.j === term.j) + 1;
        const x = lattice.pad + term.i * lattice.sx - 14;
        const y = lattice.height - lattice.pad - term.j * lattice.sy + 14;
        ctx.beginPath();
        ctx.fillStyle = pal.paper;
        ctx.strokeStyle = k === 1 ? pal.accent : pal.axis;
        ctx.lineWidth = k === 1 ? 1.6 : 1;
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = k === 1 ? pal.accent : pal.muted;
        ctx.font = "600 11px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
        ctx.fillText(String(k), x, y + 0.5);
        if (k === 1) {
          ctx.textAlign = "left";
          ctx.font = "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
          ctx.lineWidth = 4; ctx.strokeStyle = pal.paper;
          ctx.strokeText("首项", x + 22, y + 2);
          ctx.fillText("首项", x + 22, y + 2);
          ctx.textAlign = "center";
        }
      });
      ctx.restore();
    }

    function arrow(ctx, from, to, color, { width = 2.4, dashed = false, alpha = 1 } = {}) {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.hypot(dx, dy);
      if (len < 1) return;
      const ux = dx / len;
      const uy = dy / len;
      const tip = { x: to.x - ux * 7, y: to.y - uy * 7 };
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
      if (dashed) ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(tip.x - ux * 3, tip.y - uy * 3); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(tip.x + ux * 7, tip.y + uy * 7);
      ctx.lineTo(tip.x - ux * 3 - uy * 4.5, tip.y - uy * 3 + ux * 4.5);
      ctx.lineTo(tip.x - ux * 3 + uy * 4.5, tip.y - uy * 3 - ux * 4.5);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    /*
     * x^a y^b · x^c y^d = x^{a+c} y^{b+d}: draw α from the origin, then β from the tip of α
     * (head to tail), landing on the product point α+β; β's ghost stays at the origin.
     */
    function renderMultiply() {
      const sum = { i: state.first.i + state.second.i, j: state.first.j + state.second.j };
      const pal = M().getPalette();
      lattice = M().drawLattice(canvas, [
        { ...state.first, color: pal.v1 },
        { ...sum, active: true, color: pal.image },
      ], { maxI: 5, maxJ: 5, layers: [sum.i + sum.j] });
      const ctx = canvas.getContext("2d");
      const at = (e) => ({ x: lattice.pad + e.i * lattice.sx, y: lattice.height - lattice.pad - e.j * lattice.sy });
      const o = at({ i: 0, j: 0 });
      const a = at(state.first);
      const ghost = at(state.second);
      const tipP = at(sum);
      arrow(ctx, o, ghost, pal.v2, { dashed: true, alpha: 0.35 });
      arrow(ctx, o, a, pal.v1);
      arrow(ctx, a, tipP, pal.v2);
      ctx.save();
      ctx.globalAlpha = 0.18; ctx.fillStyle = pal.image;
      ctx.beginPath(); ctx.arc(tipP.x, tipP.y, 15, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.font = "italic 600 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.lineWidth = 4; ctx.strokeStyle = pal.paper;
      const put = (text, p, color, dx, dy, align = "left") => { ctx.textAlign = align; ctx.fillStyle = color; ctx.strokeText(text, p.x + dx, p.y + dy); ctx.fillText(text, p.x + dx, p.y + dy); };
      const midA = { x: (o.x + a.x) / 2, y: (o.y + a.y) / 2 };
      const midB = { x: (a.x + tipP.x) / 2, y: (a.y + tipP.y) / 2 };
      put(`α=(${state.first.i},${state.first.j})`, midA, pal.v1, -10, -8, "right");
      put(`β=(${state.second.i},${state.second.j})`, midB, pal.v2, state.second.j ? 10 : 0, state.second.j ? 4 : 22, state.second.j ? "left" : "center");
      put(`α+β=(${sum.i},${sum.j})`, tipP, pal.image, 12, -12);
      ctx.font = "600 12.5px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      const layerEnd = { x: lattice.pad + Math.min(sum.i + sum.j, 5) * lattice.sx, y: lattice.height - lattice.pad - Math.max(0, sum.i + sum.j - 5) * lattice.sy };
      put(`i+j=${sum.i + sum.j}`, layerEnd, pal.subspace, 6, -6);
      ctx.restore();
      gate?.acted();
      root.querySelector("[data-lattice-readout]").innerHTML = `
        <span>指数向量相加</span>
        <strong>${tex(`(${state.first.i},${state.first.j})+(${state.second.i},${state.second.j})=(${sum.i},${sum.j})`)}</strong>
        <p>乘积格点的两个坐标，分别由 ${tex("x")} 指数和 ${tex("y")} 指数相加得到。</p>`;
      root.querySelector("[data-degree-summary]").textContent =
        "在指数空间中，单项式乘法就是向量加法；系数相乘，指数逐坐标相加。";
      root.querySelector("[data-product-result]").innerHTML = `
        <span>当前乘积</span>
        <strong>${tex(`${monomial(state.first)}\\cdot{}${monomial(state.second)}=${monomial(sum)}`)}</strong>
        <p>${tex(`(${state.first.i},${state.first.j})+(${state.second.i},${state.second.j})=(${sum.i},${sum.j})`)}，结果落在高亮格点。</p>`;
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

    // multiplication mode waits for a prediction; the support view stays free to explore
    const lockables = [...root.querySelectorAll('[data-lattice-mode="multiply"], [data-first], [data-second]')];
    gate = window.LAPredictGate?.mount(root.querySelector("[data-lattice-gate]"), {
      root,
      manual: true,
      key: "visuals/ch1/layout-rebalance.js#exponent-add",
      question: `${tex("x^2y")} 在格点 ${tex("(2,1)")}，${tex("x")} 在格点 ${tex("(1,0)")}。乘积 ${tex("x^2y\\cdot x")} 落在哪个格点，总次数是多少？`,
      options: [
        [`${tex("(3,1)")}，总次数 4`, true, ""],
        [`${tex("(2,0)")}，总次数 2`, false, `指数要相加：${tex("x^2\\cdot x=x^3")}，不是 ${tex("x^{2\\cdot1}")}。`],
        [`${tex("(3,1)")}，总次数仍是 3`, false, "总次数是两个指数之和 3+1=4，乘上一次项后升高 1。"],
        [`${tex("(2,1)")}，乘 ${tex("x")} 不改变位置`, false, `${tex("x^2y\\cdot x=x^3y")}，x 的指数从 2 变成 3。`],
      ],
      right: `✓ 单项式相乘，指数向量相加：${tex("(2,1)+(1,0)=(3,1)")}，首尾相接正好到达乘积格点；总次数也相加，${tex("3+1=4")}，乘积落在斜线 ${tex("i+j=4")} 上。`,
      onPick: () => lockables.forEach((node) => { node.disabled = false; }),
    });
    if (gate) lockables.forEach((node) => { node.disabled = true; });
    observe(root.querySelector(".ch1-multivariate-stage"), render);
    render();
  }

  function interactive(el, section) {
    el.innerHTML = `<h2>交互实验</h2>
      <div class="ch1-lab">
        <div class="ch1-lab-head">
          <h3>指数格点：先看位置，再看分层与乘法</h3>
          <p>${section.interactive.description}</p>
        </div>
        <div data-lattice-gate></div>
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
                  <div><strong>横坐标 ${tex("i")}</strong><small>${tex("x")} 的指数</small></div>
                  <div><strong>纵坐标 ${tex("j")}</strong><small>${tex("y")} 的指数</small></div>
                  <div><strong>斜线 ${tex("i+j=d")}</strong><small>同一齐次层</small></div>
                </div>
              </div>
              <p class="ch1-multivariate-summary" data-degree-summary></p>
            </aside>
          </div>

          <section class="ch1-multivariate-module" data-support-module>
            <header class="ch1-multivariate-module-head">
              <h4>按总次数查看齐次分层</h4>
              <p>选择一个 ${tex("d")}，只保留位于斜线 ${tex("i+j=d")} 上的项；下方同步列出完整齐次分解。</p>
            </header>
            <div class="ch1-controls" role="group" aria-label="选择总次数层">
              <button type="button" class="is-active" data-layer="all">全部层</button>
              ${[0, 1, 2, 3].map((d) => `<button type="button" data-layer="${d}">${tex(`d=${d}`)}</button>`).join("\n              ")}
            </div>
            <div class="ch1-multivariate-layer-grid" data-layers></div>
          </section>

          <section class="ch1-multivariate-module" data-multiply-module hidden>
            <header class="ch1-multivariate-module-head">
              <h4>用两个指数向量合成乘积格点</h4>
              <p>主图中 ${tex("\\alpha")} 从原点出发，${tex("\\beta")} 接在 ${tex("\\alpha")} 的末端，终点就是乘积的指数。</p>
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
          </section>
        </div>
      </div>`;
    mount(el);
  }

  window.defineChapter1Renderer("multivariate-polynomials", { interactive });
})();
