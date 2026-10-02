(() => {
  "use strict";
  const M = () => window.Ch1Math;
  const U = () => window.Ch1UI;
  const tex = (value) => U().tex(value);
  const display = (value) => U().display(value);
  const renderFormal = (el, section) => U().renderFormal(el, section);
  const lab = (...args) => U().lab(...args);
  const selectButtons = (...args) => U().selectButtons(...args);

  // §6 — multiplicity and root merge
  function mountMultiplicity(root) {
    const state = { mode: "merge", a: 1, m: 2, u: -0.7, v: 0.7 };
    const graphBounds = { xMin: -3, xMax: 3, yMin: -4, yMax: 6 };
    const currentPoly = () => state.mode === "multiplicity"
      ? M().polyMul(M().polyPow(M().poly([-state.a, 1]), state.m), M().poly([1, 1]))
      : M().polyMul(M().poly([-state.u, 1]), M().poly([-state.v, 1]));
    // In multiplicity mode f=(x-a)^m(x+1); when a=-1 the two factors merge into (x+1)^{m+1}.
    const effectiveM = () => (state.mode === "multiplicity" && state.a === -1 ? state.m + 1 : state.m);
    function rootData() {
      if (state.mode === "multiplicity") {
        if (state.a === -1) return [{ x: -1, m: state.m + 1, label: "a=−1" }];
        return [{ x: state.a, m: state.m, label: `a=${state.a}` }, { x: -1, m: 1, label: "−1" }];
      }
      const equal = Math.abs(state.u - state.v) < 1e-12;
      return equal ? [{ x: state.u, m: 2, label: "二重根" }] : [{ x: state.u, m: 1, label: "u" }, { x: state.v, m: 1, label: "v" }];
    }
    function paint() {
      const p = currentPoly();
      const dp = M().polyDerivative(p);
      const gcd = M().polyGcd(p, dp);
      const focus = state.mode === "multiplicity" ? M().parseR(state.a) : M().parseR(state.u);
      const derivatives = [];
      const maxOrder = state.mode === "multiplicity" ? effectiveM() : (Math.abs(state.u - state.v) < 1e-12 ? 2 : 1);
      for (let order = 0; order <= maxOrder; order++) derivatives.push({ order, value: M().evalPoly(M().polyDerivative(p, order), focus) });
      root.querySelector("[data-poly]").innerHTML = tex(M().formatPolyTex(p));
      root.querySelector("[data-derivative]").innerHTML = tex(M().formatPolyTex(dp));
      root.querySelector("[data-gcd]").innerHTML = tex(M().formatPolyTex(gcd));
      root.querySelector("[data-derivatives]").innerHTML = derivatives.map((row) => `<tr><td>${row.order === 0 ? "f" : `f<sup>(${row.order})</sup>`}</td><td>${M().formatR(row.value)}</td><td><span class="ch1-status ${M().rIsZero(row.value) ? "is-warn" : "is-ok"}">${M().rIsZero(row.value) ? "0" : "非零"}</span></td></tr>`).join("");
      const status = root.querySelector("[data-status]");
      if (state.mode === "multiplicity") {
        const m = effectiveM();
        status.textContent = `${state.a === -1 ? "−1" : state.a} 是 ${m} 重根${state.a === -1 ? "（与因式 x+1 合并）" : ""} · ${m % 2 ? "穿过横轴" : "与横轴相切后返回"}`;
        root.querySelector("[data-m-controls]").hidden = false; root.querySelector("[data-merge-controls]").hidden = true;
      } else {
        const equal = Math.abs(state.u - state.v) < 1e-12;
        status.textContent = equal ? "u=v：合并为二重根，曲线与横轴相切" : `u≠v：两个单根，曲线穿过横轴两次（间距 ${Math.abs(state.u - state.v).toFixed(2)}）`;
        root.querySelector("[data-m-controls]").hidden = true; root.querySelector("[data-merge-controls]").hidden = false;
      }
      status.className = `ch1-status ${M().polyEq(gcd, M().onePoly()) ? "is-ok" : "is-warn"}`;
      M().drawPolynomial(root.querySelector("[data-graph]"), p, { bounds: graphBounds, points: rootData().map((r) => ({ x: r.x, y: 0 })), caption: "y = f(x)" });
      M().drawRootAxis(root.querySelector("[data-roots]"), rootData(), { bounds: { xMin: -3, xMax: 3, yMin: -1.2, yMax: 1.2 } });
      root.querySelector("[data-a-value]").textContent = state.a; root.querySelector("[data-m-value]").textContent = state.m;
      root.querySelector("[data-u-value]").textContent = state.u.toFixed(2); root.querySelector("[data-v-value]").textContent = state.v.toFixed(2);
    }
    root.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.mode; selectButtons(root, "[data-mode]", button); paint(); }));
    root.querySelector("[data-a]").addEventListener("input", (e) => { state.a = Number(e.target.value); paint(); });
    root.querySelector("[data-m]").addEventListener("input", (e) => { state.m = Math.round(Number(e.target.value)); paint(); });
    root.querySelector("[data-u]").addEventListener("input", (e) => { state.u = Number(e.target.value); paint(); });
    root.querySelector("[data-v]").addEventListener("input", (e) => { state.v = Number(e.target.value); paint(); });
    root.querySelectorAll("[data-preset-m]").forEach((button) => button.addEventListener("click", () => { state.mode = "multiplicity"; state.m = Number(button.dataset.presetM); root.querySelector("[data-m]").value = state.m; root.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("is-active", b.dataset.mode === "multiplicity")); paint(); }));
    root.querySelector("[data-merge-exact]").addEventListener("click", () => { state.mode = "merge"; state.v = state.u; root.querySelector("[data-v]").value = state.v; paint(); });
    M().observeCanvas(root.querySelector(".ch1-stage"), paint);
    paint();
  }

  function interactive6(el, section) {
    lab(el, "重数与根合并实验室", section.interactive.description,
      `<button type="button" data-mode="merge" class="is-active">两根合并</button><button type="button" data-mode="multiplicity">单根重数</button><span class="ch1-control-separator"></span><button type="button" data-preset-m="1">m=1</button><button type="button" data-preset-m="2">m=2</button><button type="button" data-preset-m="3">m=3</button><button type="button" data-preset-m="4">m=4</button>`,
      `<div class="ch1-two-col"><div><div class="ch1-stage"><canvas data-graph aria-label="重数多项式图像"></canvas></div><div class="ch1-stage is-short"><canvas data-roots aria-label="实根与重数轴"></canvas></div></div><div class="ch1-panel"><div data-m-controls hidden><label class="ch1-slider-row"><span>根 a</span><input data-a type="range" min="-2" max="2" step="1" value="1"><output data-a-value></output></label><label class="ch1-slider-row"><span>重数 m</span><input data-m type="range" min="1" max="4" step="1" value="2"><output data-m-value></output></label></div><div data-merge-controls><label class="ch1-slider-row"><span>根 u</span><input data-u type="range" min="-2" max="2" step="0.05" value="-0.7"><output data-u-value></output></label><label class="ch1-slider-row"><span>根 v</span><input data-v type="range" min="-2" max="2" step="0.05" value="0.7"><output data-v-value></output></label><button type="button" class="ch1-btn ch1-merge-exact" data-merge-exact>令 v=u，两根合并</button></div><div class="ch1-result-band"><div><span>当前结论</span><strong data-status class="ch1-status"></strong></div></div><div class="ch1-equation-grid"><div><span>f</span><strong data-poly></strong></div><div><span>f′</span><strong data-derivative></strong></div><div><span>gcd(f,f′)</span><strong data-gcd></strong></div></div><h4>根处各阶导数的值</h4><div class="ch1-table-wrap"><table class="ch1-table"><thead><tr><th>导数</th><th>值</th><th>状态</th></tr></thead><tbody data-derivatives></tbody></table></div></div></div>`);
    mountMultiplicity(el);
  }

  // §7 — evaluation, root bound, interpolation
  function mountPolynomialFunctions(root) {
    const state = { mode: "eval", p: M().poly([1, -2, 0, 1]), a: 1, degree: 3, roots: 2, nodes: [{ x: M().R(0), y: M().R(1) }, { x: M().R(1), y: M().R(2) }, { x: M().R(2), y: M().R(5) }] };
    const bounds = { xMin: -2.5, xMax: 3.5, yMin: -4, yMax: 10 };
    function paintEval() {
      const h = M().hornerSteps(state.p, M().parseR(state.a));
      root.querySelector("[data-eval-panel]").hidden = false; root.querySelector("[data-root-panel]").hidden = true; root.querySelector("[data-interp-panel]").hidden = true;
      root.querySelector("[data-eval-poly]").innerHTML = tex(M().formatPolyTex(state.p));
      root.querySelector("[data-a-value]").textContent = state.a;
      root.querySelector("[data-fa]").innerHTML = tex(M().formatRTex(h.value));
      const signed = (t) => (t.startsWith("-") ? `−${tex(t.slice(1))}` : `+${tex(t)}`);
      root.querySelector("[data-horner]").innerHTML = h.steps.map((s, i) => `<div class="${i === h.steps.length - 1 ? "is-current" : ""}"><span>${i + 1}</span><p>(${tex(M().formatRTex(s.before))})·${state.a}${signed(M().formatRTex(s.coefficient))}=${tex(M().formatRTex(s.after))}</p></div>`).join("");
      const isRoot = M().rIsZero(h.value);
      const st = root.querySelector("[data-factor]"); st.className = `ch1-status ${isRoot ? "is-ok" : "is-warn"}`; st.textContent = isRoot ? `f(${state.a})=0，x−${state.a} 是因式` : `余式 f(${state.a})≠0`;
      M().drawPolynomial(root.querySelector("[data-canvas]"), state.p, { bounds, points: [{ x: state.a, y: M().rToNum(h.value) }], caption: "评价点 (a,f(a))" });
    }
    function paintRoots() {
      root.querySelector("[data-eval-panel]").hidden = true; root.querySelector("[data-root-panel]").hidden = false; root.querySelector("[data-interp-panel]").hidden = true;
      root.querySelector("[data-degree-value]").textContent = state.degree;
      root.querySelector("[data-roots-value]").textContent = state.roots;
      const possible = state.roots <= state.degree;
      const status = root.querySelector("[data-root-status]"); status.className = `ch1-status ${possible ? "is-ok" : "is-bad"}`; status.textContent = possible ? "可以构造非零多项式" : "超过次数上界：只能是零多项式";
      const roots = Array.from({ length: Math.min(state.roots, state.degree + 1) }, (_, i) => i - Math.floor(state.roots / 2));
      let p = M().onePoly();
      roots.forEach((r) => { p = M().polyMul(p, M().poly([-r, 1])); });
      while (M().deg(p) < state.degree) p = M().polyMul(p, M().poly([1, 1]));
      root.querySelector("[data-root-poly]").innerHTML = possible ? tex(M().formatPolyTex(p)) : "—";
      M().drawRootAxis(root.querySelector("[data-canvas]"), roots.map((x) => ({ x, m: 1, label: String(x) })), { bounds: { xMin: -4, xMax: 4, yMin: -1.4, yMax: 1.4 } });
    }
    function readNodes() {
      return [0, 1, 2].map((i) => ({ x: M().parseR(root.querySelector(`[data-node-x="${i}"]`).value), y: M().parseR(root.querySelector(`[data-node-y="${i}"]`).value) }));
    }
    function paintInterpolation() {
      root.querySelector("[data-eval-panel]").hidden = true; root.querySelector("[data-root-panel]").hidden = true; root.querySelector("[data-interp-panel]").hidden = false;
      let result;
      try {
        state.nodes = readNodes();
        result = M().lagrangeInterpolation(state.nodes);
        root.querySelector("[data-interp-error]").textContent = "";
      } catch (error) {
        root.querySelector("[data-interp-error]").textContent = error.message.includes("distinct") ? "横坐标必须互不相同。" : "请输入合法有理数。";
        return;
      }
      root.querySelector("[data-interp-poly]").innerHTML = tex(M().formatPolyTex(result.polynomial));
      root.querySelector("[data-bases]").innerHTML = result.bases.map((b, i) => `<div class="ch1-compare-card"><strong>${tex(`L_${i}(x)=${M().formatPolyTex(b.L)}`)}</strong><p>加权贡献：${tex(M().formatPolyTex(b.contribution))}</p></div>`).join("");
      M().drawPolynomial(root.querySelector("[data-canvas]"), result.polynomial, { bounds, points: state.nodes.map((n) => ({ x: M().rToNum(n.x), y: M().rToNum(n.y) })), caption: "Lagrange 插值 · 节点横坐标互异" });
    }
    function paint() { if (state.mode === "eval") paintEval(); else if (state.mode === "roots") paintRoots(); else paintInterpolation(); }
    root.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.mode; selectButtons(root, "[data-mode]", button); paint(); }));
    root.querySelector("[data-a]").addEventListener("input", (e) => { state.a = Number(e.target.value); paintEval(); });
    root.querySelector("[data-degree]").addEventListener("input", (e) => { state.degree = Math.round(Number(e.target.value)); paintRoots(); });
    root.querySelector("[data-root-count]").addEventListener("input", (e) => { state.roots = Math.round(Number(e.target.value)); paintRoots(); });
    root.querySelectorAll("[data-node-x], [data-node-y]").forEach((input) => input.addEventListener("change", paintInterpolation));
    root.querySelectorAll("[data-eval-preset]").forEach((button) => button.addEventListener("click", () => { state.p = button.dataset.evalPreset === "root" ? M().poly([-2, 1, 1]) : M().poly([1, -2, 0, 1]); paintEval(); }));
    M().observeCanvas(root.querySelector(".ch1-stage"), paint);
    paint();
  }

  function interactive7(el, section) {
    lab(el, "评价、根数与插值", section.interactive.description,
      `<button type="button" data-mode="eval" class="is-active">评价 / Horner</button><button type="button" data-mode="roots">根数上界</button><button type="button" data-mode="interp">Lagrange 插值</button>`,
      `<div class="ch1-two-col"><div class="ch1-stage"><canvas data-canvas aria-label="多项式函数实验图"></canvas></div><div class="ch1-panel"><section data-eval-panel><div class="ch1-controls"><button type="button" data-eval-preset="default">三次示例</button><button type="button" data-eval-preset="root">有整数根示例</button></div><label class="ch1-slider-row"><span>a</span><input data-a type="range" min="-2" max="3" step="1" value="1"><output data-a-value></output></label><div class="ch1-equation-grid"><div><span>f</span><strong data-eval-poly></strong></div><div><span>f(a)</span><strong data-fa></strong></div></div><div data-factor class="ch1-status"></div><div class="ch1-ledger" data-horner></div></section><section data-root-panel hidden><label class="ch1-slider-row"><span>次数 n</span><input data-degree type="range" min="1" max="6" value="3"><output data-degree-value></output></label><label class="ch1-slider-row"><span>不同根数 m</span><input data-root-count type="range" min="0" max="7" value="2"><output data-roots-value></output></label><div data-root-status class="ch1-status"></div><div class="ch1-callout"><strong>构造结果</strong><p data-root-poly></p></div></section><section data-interp-panel hidden><div class="ch1-node-grid">${[0,1,2].map((i) => `<label>节点 ${i}<span>x</span><input type="text" value="${i}" data-node-x="${i}"><span>y</span><input type="text" value="${[1,2,5][i]}" data-node-y="${i}"></label>`).join("")}</div><p class="ch1-error" data-interp-error aria-live="polite"></p><div class="ch1-result-band"><div><span>插值多项式</span><strong data-interp-poly></strong></div></div><div class="ch1-compare" data-bases></div></section></div></div>`);
    mountPolynomialFunctions(el);
  }

  // §8 — draggable complex roots
  function mountConjugate(root) {
    const state = { mode: "R", alpha: { re: 1, im: 1.5 }, beta: { re: -1, im: 0.75 }, dragging: null };
    const bounds = { xMin: -3, xMax: 3, yMin: -3, yMax: 3 };
    let cam = null;
    const formatComplex = (z) => `${z.re.toFixed(2)}${z.im < 0 ? "−" : "+"}${Math.abs(z.im).toFixed(2)}i`;
    function coefficients() {
      const b = state.mode === "R" ? { re: state.alpha.re, im: -state.alpha.im } : state.beta;
      const sum = { re: state.alpha.re + b.re, im: state.alpha.im + b.im };
      const product = { re: state.alpha.re * b.re - state.alpha.im * b.im, im: state.alpha.re * b.im + state.alpha.im * b.re };
      return { beta: b, sum, product };
    }
    function paint() {
      const c = coefficients();
      cam = M().drawComplexPlane(root.querySelector("canvas"), [
        { ...state.alpha, label: "α", color: M().getPalette().drag },
        { ...c.beta, label: state.mode === "R" ? "ᾱ" : "β", color: M().getPalette().accent },
      ], { bounds });
      root.querySelector("[data-alpha]").textContent = formatComplex(state.alpha);
      root.querySelector("[data-beta]").textContent = formatComplex(c.beta);
      root.querySelector("[data-sum]").textContent = `${c.sum.re.toFixed(2)}${c.sum.im < 0 ? "−" : "+"}${Math.abs(c.sum.im).toFixed(2)}i`;
      root.querySelector("[data-product]").textContent = `${c.product.re.toFixed(2)}${c.product.im < 0 ? "−" : "+"}${Math.abs(c.product.im).toFixed(2)}i`;
      root.querySelector("[data-factor]").innerHTML = state.mode === "R" ? tex(`x^2-${(2 * state.alpha.re).toFixed(2)}x+${(state.alpha.re ** 2 + state.alpha.im ** 2).toFixed(2)}`) : tex(`(x-(${formatComplex(state.alpha)}))(x-(${formatComplex(c.beta)}))`);
      const real = Math.abs(c.sum.im) < 1e-9 && Math.abs(c.product.im) < 1e-9;
      const st = root.querySelector("[data-real-status]"); st.className = `ch1-status ${real ? "is-ok" : "is-bad"}`; st.textContent = real ? "二次系数全部为实数" : "解锁后系数出现虚部";
      root.querySelector("[data-beta-controls]").hidden = state.mode === "R";
      root.querySelector("[data-re]").value = state.alpha.re; root.querySelector("[data-im]").value = state.alpha.im;
      root.querySelector("[data-bre]").value = state.beta.re; root.querySelector("[data-bim]").value = state.beta.im;
      root.querySelector("[data-re-value]").textContent = state.alpha.re.toFixed(2); root.querySelector("[data-im-value]").textContent = state.alpha.im.toFixed(2);
      root.querySelector("[data-bre-value]").textContent = state.beta.re.toFixed(2); root.querySelector("[data-bim-value]").textContent = state.beta.im.toFixed(2);
    }
    const canvas = root.querySelector("canvas");
    function pointFromEvent(event) {
      const rect = canvas.getBoundingClientRect();
      return cam.toWorld(event.clientX - rect.left, event.clientY - rect.top);
    }
    canvas.addEventListener("pointerdown", (event) => {
      const point = pointFromEvent(event);
      const c = coefficients();
      const da = Math.hypot(point.x - state.alpha.re, point.y - state.alpha.im);
      const db = Math.hypot(point.x - c.beta.re, point.y - c.beta.im);
      state.dragging = da <= db ? "alpha" : state.mode === "C" ? "beta" : "alpha";
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!state.dragging) return;
      const point = pointFromEvent(event);
      const target = state.dragging === "alpha" ? state.alpha : state.beta;
      target.re = Math.max(-2.5, Math.min(2.5, Math.round(point.x * 20) / 20));
      target.im = Math.max(-2.5, Math.min(2.5, Math.round(point.y * 20) / 20));
      paint();
    });
    canvas.addEventListener("pointerup", () => { state.dragging = null; });
    root.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.mode; selectButtons(root, "[data-mode]", button); paint(); }));
    [["re", "alpha", "re"], ["im", "alpha", "im"], ["bre", "beta", "re"], ["bim", "beta", "im"]].forEach(([key, object, prop]) => root.querySelector(`[data-${key}]`).addEventListener("input", (e) => { state[object][prop] = Number(e.target.value); paint(); }));
    root.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.preset === "real") state.alpha = { re: 1, im: 0 };
      else if (button.dataset.preset === "imag") state.alpha = { re: 0, im: 2 };
      else state.alpha = { re: 1, im: 1.5 };
      paint();
    }));
    M().observeCanvas(root.querySelector(".ch1-stage"), paint);
    paint();
  }

  function interactive8(el, section) {
    lab(el, "共轭锁复平面", section.interactive.description,
      `<button type="button" data-mode="R" class="is-active">实系数模式（共轭锁）</button><button type="button" data-mode="C">复系数模式（解锁）</button><span class="ch1-control-separator"></span><button type="button" data-preset="pair">一般共轭对</button><button type="button" data-preset="imag">纯虚根</button><button type="button" data-preset="real">虚部为 0</button>`,
      `<div class="ch1-two-col"><div><div class="ch1-stage ch1-draggable"><canvas aria-label="可拖动复根平面"></canvas><span class="ch1-canvas-hint">拖动 α；解锁后可拖动 β</span></div></div><div class="ch1-panel"><label class="ch1-slider-row"><span>Re(α)</span><input data-re type="range" min="-2.5" max="2.5" step="0.05"><output data-re-value></output></label><label class="ch1-slider-row"><span>Im(α)</span><input data-im type="range" min="-2.5" max="2.5" step="0.05"><output data-im-value></output></label><div data-beta-controls hidden><label class="ch1-slider-row"><span>Re(β)</span><input data-bre type="range" min="-2.5" max="2.5" step="0.05"><output data-bre-value></output></label><label class="ch1-slider-row"><span>Im(β)</span><input data-bim type="range" min="-2.5" max="2.5" step="0.05"><output data-bim-value></output></label></div><div class="ch1-equation-grid"><div><span>α</span><strong data-alpha></strong></div><div><span>第二个根</span><strong data-beta></strong></div><div><span>根之和</span><strong data-sum></strong></div><div><span>根之积</span><strong data-product></strong></div></div><div data-real-status class="ch1-status"></div><div class="ch1-result-band"><div><span>对应因式</span><strong data-factor></strong></div></div></div></div>`);
    mountConjugate(el);
  }

  window.defineChapter1Renderer("factorization-theorem", { formal: renderFormal });
  window.defineChapter1Renderer("multiple-factors", { formal: renderFormal, interactive: interactive6 });
  window.defineChapter1Renderer("polynomial-functions", { formal: renderFormal, interactive: interactive7 });
  window.defineChapter1Renderer("complex-real-factorization", { formal: renderFormal, interactive: interactive8 });
})();
