(() => {
  "use strict";
  const M = () => window.Ch1Math;
  const tex = (value) => (window.texInline ? window.texInline(String(value)) : String(value));
  const display = (value) => (window.texDisplay ? window.texDisplay(String(value)) : String(value));
  const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

  function renderFormal(el, section) {
    if (!el) return;
    const f = section.formal || {};
    const map = (f.map || []).map((item) => `<div><dt>${esc(item.label)}</dt><dd>${item.text}</dd></div>`).join("");
    const definitions = (f.definitions || []).map((item) => `<article class="definition-row"><strong>${item.title}</strong><p>${item.text}</p></article>`).join("");
    const cards = (f.cards || []).map((item) => `<article class="lesson-card"><span class="lesson-card-kicker">${item.kicker}</span><h3>${item.title}</h3><p>${item.text}</p></article>`).join("");
    const pitfalls = (f.pitfalls || []).length ? `<div class="ch1-pitfalls"><strong>常见误区</strong><ul>${f.pitfalls.map((item) => `<li>${item}</li>`).join("")}</ul></div>` : "";
    el.innerHTML = `<h2>${f.title || "定理与概念"}</h2>
      <div class="lesson-formal-layout ch1-formal">
        <p class="lesson-formal-intro">${f.intro || section.intro || ""}</p>
        ${f.equation ? `<div class="operation-map"><div class="operation-map-main">${display(f.equation)}</div><dl class="lesson-meta-list">${map}</dl></div>` : ""}
        <div class="definition-stack">${definitions}</div>
        <div class="lesson-card-grid">${cards}</div>
        ${pitfalls}
        ${f.note ? `<div class="lesson-reading-note"><strong>这一节的核心</strong><p>${f.note}</p></div>` : ""}
      </div>`;
  }

  function lab(el, title, description, controls, body) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>${title}</h3><p>${description}</p></div>
      ${controls ? `<div class="ch1-controls">${controls}</div>` : ""}
      ${body}
    </div>`;
  }

  function selectButtons(root, selector, selected) {
    root.querySelectorAll(selector).forEach((button) => button.classList.toggle("is-active", button === selected));
  }

  function readStrip(root, key) {
    const inputs = [...root.querySelectorAll(`[data-${key}]`)];
    const values = inputs.map((input) => {
      try { input.setCustomValidity(""); return M().parseR(input.value); }
      catch (error) { input.setCustomValidity("请输入整数、小数或分数，如 -3/2"); return M().R(0); }
    });
    return M().normalizePoly(values);
  }

  window.Ch1UI = { tex, display, esc, renderFormal, lab, selectButtons, readStrip };

  // §1 — number field lens
  function mountNumberFields(root) {
    const domains = {
      Z: { name: "整数集 ℤ", field: false, form: "n∈ℤ", gates: [true, true, true, false], witness: "1÷2=1/2 不属于 ℤ。", detail: "整数对加、减、乘封闭，但缺少一般非零元素的乘法逆元。" },
      Q: { name: "有理数域 ℚ", field: true, form: "p/q, q≠0", gates: [true, true, true, true], witness: "两个有理数四则运算后仍为有理数。", detail: "这是包含 1 的最小数域，也是有理系数多项式的舞台。" },
      Q2: { name: "二次域 ℚ(√2)", field: true, form: "a+b√2", gates: [true, true, true, true], witness: "1/(a+b√2)=(a−b√2)/(a²−2b²)。", detail: "分母非零时 a²−2b²≠0，求逆结果仍为 u+v√2。" },
      R: { name: "实数域 ℝ", field: true, form: "实数", gates: [true, true, true, true], witness: "实数对四则运算封闭（除数非零）。", detail: "允许 √2 等实数系数，但仍不允许 i。" },
      C: { name: "复数域 ℂ", field: true, form: "a+bi", gates: [true, true, true, true], witness: "非零 a+bi 的逆为 (a−bi)/(a²+b²)。", detail: "代数基本定理保证非常数复系数多项式至少有一个复根。" },
      P: { name: "正实数集 ℝ₊", field: false, form: "x>0", gates: [true, false, true, true], witness: "1−2=−1 不属于 ℝ₊，且 0 不在集合中。", detail: "乘除封闭并不足够；加法逆元和 0 也不可缺少。" },
    };
    const polys = [
      { formula: "x^2-2", coeff: { Z: true, Q: true, Q2: true, R: true, C: true, P: false }, factor: { Q: "不可约", Q2: "可分解", R: "可分解", C: "可分解" } },
      { formula: "x^2-\\sqrt2", coeff: { Z: false, Q: false, Q2: true, R: true, C: true, P: false }, factor: { Q2: "可分解", R: "可分解", C: "可分解" } },
      { formula: "x^2+1", coeff: { Z: true, Q: true, Q2: true, R: true, C: true, P: false }, factor: { Q: "不可约", Q2: "不可约", R: "不可约", C: "可分解" } },
      { formula: "x^2-i", coeff: { Z: false, Q: false, Q2: false, R: false, C: true, P: false }, factor: { C: "可分解" } },
    ];
    let current = "Q";
    const paint = () => {
      const d = domains[current];
      root.querySelector("[data-domain-name]").textContent = d.name;
      root.querySelector("[data-domain-form]").textContent = d.form;
      root.querySelector("[data-witness]").textContent = d.witness;
      root.querySelector("[data-domain-detail]").textContent = d.detail;
      const status = root.querySelector("[data-field-status]");
      status.className = `ch1-status ${d.field ? "is-ok" : "is-bad"}`;
      status.textContent = d.field ? "通过全部数域条件" : "不是数域";
      root.querySelector("[data-gates]").innerHTML = ["加法", "减法", "乘法", "非零除法"].map((label, i) => `<div class="ch1-gate ${d.gates[i] ? "is-ok" : "is-bad"}"><strong>${label}</strong><span>${d.gates[i] ? "封闭" : "失败"}</span></div>`).join("");
      root.querySelector("[data-poly-table]").innerHTML = polys.map((p) => {
        const legal = p.coeff[current];
        const factor = legal && p.factor[current] ? p.factor[current] : legal ? "本节不判定" : "无意义";
        return `<tr><td>${tex(p.formula)}</td><td><span class="ch1-status ${legal ? "is-ok" : "is-bad"}">${legal ? "系数合法" : "系数越界"}</span></td><td>${factor}</td></tr>`;
      }).join("");
      root.querySelector("[data-q2-proof]").innerHTML = current === "Q2" ? `${display("(a+b\\sqrt2)(c+d\\sqrt2)=(ac+2bd)+(ad+bc)\\sqrt2")} ${display("\\frac1{a+b\\sqrt2}=\\frac{a-b\\sqrt2}{a^2-2b^2}")}` : "选择 ℚ(√2) 查看乘法与求逆为什么仍留在同一形式。";
    };
    root.querySelectorAll("[data-domain]").forEach((button) => button.addEventListener("click", () => { current = button.dataset.domain; selectButtons(root, "[data-domain]", button); paint(); }));
    paint();
  }

  function interactive1(el, section) {
    lab(el, "数域透镜", section.interactive.description,
      ["Z", "Q", "Q2", "R", "C", "P"].map((key, i) => `<button type="button" data-domain="${key}"${i === 1 ? ' class="is-active"' : ""}>${{ Z: "ℤ", Q: "ℚ", Q2: "ℚ(√2)", R: "ℝ", C: "ℂ", P: "正实数" }[key]}</button>`).join(""),
      `<div class="ch1-metrics"><div class="ch1-metric"><span>当前集合</span><strong data-domain-name></strong><small data-domain-form></small></div><div class="ch1-metric"><span>判定</span><strong data-field-status class="ch1-status"></strong></div></div>
       <div class="ch1-gates" data-gates></div>
       <div class="ch1-callout"><strong>最短证据</strong><p data-witness></p><p class="ch1-muted" data-domain-detail></p></div>
       <div class="ch1-two-col"><div><h4>系数合法与可分解要分开</h4><div class="ch1-table-wrap"><table class="ch1-table"><thead><tr><th>表达式</th><th>系数</th><th>当前域中的分解状态</th></tr></thead><tbody data-poly-table></tbody></table></div></div><div><h4>ℚ(√2) 的封闭性</h4><div class="ch1-equation-stack" data-q2-proof></div><div class="ch1-nest"><div data-level="4" class="ch1-nest-layer">ℂ</div><div data-level="3" class="ch1-nest-layer">ℝ</div><div data-level="2" class="ch1-nest-layer">ℚ(√2)</div><div data-level="1" class="ch1-nest-layer">ℚ</div></div></div></div>`);
    mountNumberFields(el);
  }

  // §2 — coefficient strip and exact convolution
  function mountCoefficients(root) {
    const state = { f: M().poly([2, -1, 0, 3]), g: M().poly([-2, 1, 1, -3]), mode: "add", k: 3, scale: M().R(2) };
    const bounds = { xMin: -2.5, xMax: 2.5, yMin: -8, yMax: 8 };
    const inputLength = 5;
    function result() {
      if (state.mode === "add") return M().polyAdd(state.f, state.g);
      if (state.mode === "sub") return M().polySub(state.f, state.g);
      if (state.mode === "scale") return M().polyScale(state.f, state.scale);
      return M().polyMul(state.f, state.g);
    }
    function contributions() {
      const rows = [];
      if (state.mode !== "mul") return rows;
      for (let i = 0; i < state.f.length; i++) {
        const j = state.k - i;
        if (j < 0 || j >= state.g.length) continue;
        rows.push({ i, j, value: M().rMul(state.f[i], state.g[j]) });
      }
      return rows;
    }
    function paint(rebuildInputs = false) {
      const out = result();
      if (rebuildInputs) {
        root.querySelector("[data-f-strip]").innerHTML = M().coefficientStrip(state.f, { editable: true, key: "f", length: inputLength });
        root.querySelector("[data-g-strip]").innerHTML = M().coefficientStrip(state.g, { editable: true, key: "g", length: inputLength });
      }
      root.querySelector("[data-out-strip]").innerHTML = M().coefficientStrip(out);
      root.querySelector("[data-f-tex]").innerHTML = tex(M().formatPolyTex(state.f));
      root.querySelector("[data-g-tex]").innerHTML = tex(M().formatPolyTex(state.g));
      root.querySelector("[data-out-tex]").innerHTML = tex(M().formatPolyTex(out));
      root.querySelector("[data-deg-f]").textContent = M().isZeroPoly(state.f) ? "未定义（零多项式）" : M().deg(state.f);
      root.querySelector("[data-deg-g]").textContent = M().isZeroPoly(state.g) ? "未定义（零多项式）" : M().deg(state.g);
      root.querySelector("[data-deg-out]").textContent = M().isZeroPoly(out) ? "未定义（零多项式）" : M().deg(out);
      root.querySelector("[data-k-value]").textContent = state.k;
      const rows = contributions();
      root.querySelector("[data-contributions]").innerHTML = state.mode === "mul" ? (rows.length ? rows.map((row) => `<tr><td>${tex(`a_${row.i}`)}</td><td>${tex(`b_${row.j}`)}</td><td>${tex(M().formatRTex(row.value))}</td></tr>`).join("") : `<tr><td colspan="3">该次数没有配对</td></tr>`) : `<tr><td colspan="3">切换到乘法后查看 i+j=k 的完整配对。</td></tr>`;
      const coefficient = out[state.k] || M().R(0);
      root.querySelector("[data-k-coeff]").innerHTML = tex(M().formatRTex(coefficient));
      root.querySelector("[data-scale-box]").hidden = state.mode !== "scale";
      root.querySelector("[data-k-box]").hidden = state.mode !== "mul";
      M().drawPolynomial(root.querySelector("canvas"), out, { bounds, caption: "固定世界坐标 · 图像只是系数结构的观察窗口" });
    }
    root.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.matches("[data-f], [data-g]")) {
        state.f = readStrip(root, "f"); state.g = readStrip(root, "g"); paint(false);
      }
    });
    root.querySelector("[data-k]").addEventListener("input", (event) => { state.k = Number(event.target.value); paint(false); });
    root.querySelector("[data-scale]").addEventListener("change", (event) => { try { state.scale = M().parseR(event.target.value); event.target.setCustomValidity(""); } catch { event.target.setCustomValidity("请输入整数、小数或分数"); } paint(false); });
    root.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.mode; selectButtons(root, "[data-mode]", button); paint(false); }));
    root.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.preset === "cancel") { state.f = M().poly([1, 0, 0, 2]); state.g = M().poly([0, 1, 0, -2]); state.mode = "add"; }
      else if (button.dataset.preset === "fraction") { state.f = M().poly(["1/2", "-3/2", 0, 1]); state.g = M().poly(["-1/2", "3/2", 1]); state.mode = "mul"; }
      else if (button.dataset.preset === "zero") { state.f = M().poly([0]); state.g = M().poly([1, 2]); state.mode = "add"; }
      else { state.f = M().poly([2, -1, 0, 3]); state.g = M().poly([-2, 1, 1, -3]); state.mode = "add"; }
      root.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("is-active", b.dataset.mode === state.mode));
      paint(true);
    }));
    M().observeCanvas(root.querySelector(".ch1-stage"), () => paint(false));
    paint(true);
  }

  function interactive2(el, section) {
    lab(el, "系数带工作台", section.interactive.description,
      `<button type="button" data-mode="add" class="is-active">f+g</button><button type="button" data-mode="sub">f−g</button><button type="button" data-mode="mul">fg</button><button type="button" data-mode="scale">λf</button><span class="ch1-control-separator"></span><button type="button" data-preset="default">默认</button><button type="button" data-preset="cancel">首项抵消</button><button type="button" data-preset="fraction">分数系数</button><button type="button" data-preset="zero">零多项式</button>`,
      `<div class="ch1-two-col"><div class="ch1-panel"><div><h4>f 的系数带</h4><div data-f-strip></div><div class="ch1-inline-equation">${tex("f=")}<span data-f-tex></span> · deg f=<strong data-deg-f></strong></div></div><div><h4>g 的系数带</h4><div data-g-strip></div><div class="ch1-inline-equation">${tex("g=")}<span data-g-tex></span> · deg g=<strong data-deg-g></strong></div></div><div data-scale-box hidden><label class="ch1-field">λ（支持分数）<input type="text" value="2" data-scale></label></div><div data-k-box hidden><label class="ch1-slider-row"><span>结果次数 k</span><input type="range" min="0" max="8" value="3" data-k><output data-k-value>3</output></label></div></div><div class="ch1-stage"><canvas aria-label="结果多项式固定坐标图像"></canvas></div></div>
       <div class="ch1-result-band"><div><span>结果</span><strong data-out-tex></strong><small>次数：<span data-deg-out></span></small></div><div data-out-strip></div></div>
       <div class="ch1-two-col"><div><h4>指定次数贡献</h4><div class="ch1-table-wrap"><table class="ch1-table"><thead><tr><th>f 项</th><th>g 项</th><th>乘积</th></tr></thead><tbody data-contributions></tbody></table></div></div><div class="ch1-callout"><strong>${tex("[x^k](fg)")} 的当前值</strong><p>当 k=<span data-k-value></span> 时，系数为 <span data-k-coeff></span>。</p><p class="ch1-muted">输入允许整数、小数与分数，例如 −3/2；计算在有理数上精确完成。</p></div></div>`);
    mountCoefficients(el);
  }

  // §3 — division stepper
  function mountDivision(root) {
    const presets = {
      default: { f: M().poly([-1, 0, 0, 0, 1]), g: M().poly([1, 1, 1]), name: "x⁴−1 ÷ (x²+x+1)" },
      divides: { f: M().poly([-1, 0, 0, 1]), g: M().poly([-1, 1]), name: "x³−1 ÷ (x−1)" },
      fraction: { f: M().poly(["1/2", "-1/2", 0, 1]), g: M().poly(["1/2", 1]), name: "分数系数示例" },
    };
    let current = presets.default;
    let steps = M().divisionSteps(current.f, current.g);
    let index = 0;
    const paint = () => {
      steps = M().divisionSteps(current.f, current.g);
      index = Math.min(index, steps.length - 1);
      const step = steps[index];
      const done = step.kind === "done";
      const divides = done && M().isZeroPoly(step.r);
      root.querySelector("[data-title]").textContent = current.name;
      root.querySelector("[data-step]").textContent = `${index + 1}/${steps.length}`;
      root.querySelector("[data-note]").textContent = step.note;
      root.querySelector("[data-f]").innerHTML = tex(M().formatPolyTex(current.f));
      root.querySelector("[data-g]").innerHTML = tex(M().formatPolyTex(current.g));
      root.querySelector("[data-q]").innerHTML = tex(M().formatPolyTex(step.q));
      root.querySelector("[data-r]").innerHTML = tex(M().formatPolyTex(step.r));
      root.querySelector("[data-invariant]").innerHTML = `${tex(M().formatPolyTex(current.f))} = (${tex(M().formatPolyTex(step.q))})(${tex(M().formatPolyTex(current.g))}) + (${tex(M().formatPolyTex(step.r))})`;
      root.querySelector("[data-q-strip]").innerHTML = M().coefficientStrip(step.q);
      root.querySelector("[data-r-strip]").innerHTML = M().coefficientStrip(step.r);
      const status = root.querySelector("[data-status]");
      status.className = `ch1-status ${done ? (divides ? "is-ok" : "is-bad") : "is-warn"}`;
      status.textContent = done ? (divides ? "整除成立" : "不整除") : "首项消去中";
      root.querySelector("[data-degree]").textContent = M().isZeroPoly(step.r) ? "余式为 0" : `deg r=${M().deg(step.r)}，deg g=${M().deg(current.g)}`;
      root.querySelector("[data-current-operation]").innerHTML = step.kind === "eliminate" ? `${tex(M().formatPolyTex(step.before))} − (${tex(M().formatPolyTex(step.term))})(${tex(M().formatPolyTex(current.g))}) = ${tex(M().formatPolyTex(step.r))}` : done ? "次数条件已经满足，算法停止。" : "从被除式开始。";
      root.querySelector("[data-ledger]").innerHTML = steps.map((s, i) => `<div class="${i === index ? "is-current" : ""}"><span>${i + 1}</span><p>${s.kind === "eliminate" ? `${tex(M().formatPolyTex(s.before))} → ${tex(M().formatPolyTex(s.r))}` : s.note}</p></div>`).join("");
      root.querySelector("[data-prev]").disabled = index === 0;
      root.querySelector("[data-next]").disabled = index === steps.length - 1;
    };
    root.querySelector("[data-prev]").addEventListener("click", () => { index = Math.max(0, index - 1); paint(); });
    root.querySelector("[data-next]").addEventListener("click", () => { index = Math.min(steps.length - 1, index + 1); paint(); });
    root.querySelector("[data-reset]").addEventListener("click", () => { index = 0; paint(); });
    root.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => { current = presets[button.dataset.preset]; index = 0; selectButtons(root, "[data-preset]", button); paint(); }));
    paint();
  }

  function interactive3(el, section) {
    lab(el, "除法阶梯", section.interactive.description,
      `<button type="button" data-prev>上一步</button><button type="button" data-next>下一步</button><button type="button" data-reset>重置</button><span class="ch1-control-separator"></span><button type="button" data-preset="default" class="is-active">非整除</button><button type="button" data-preset="divides">整除</button><button type="button" data-preset="fraction">分数系数</button>`,
      `<div class="ch1-metrics"><div class="ch1-metric"><span>示例</span><strong data-title></strong></div><div class="ch1-metric"><span>步骤</span><strong data-step></strong></div><div class="ch1-metric"><span>状态</span><strong data-status class="ch1-status"></strong></div></div>
       <div class="ch1-equation-grid"><div><span>f</span><strong data-f></strong></div><div><span>g</span><strong data-g></strong></div><div><span>q</span><strong data-q></strong></div><div><span>r</span><strong data-r></strong></div></div>
       <div class="ch1-callout"><strong>不变量 f=qg+r</strong><p data-invariant></p><p class="ch1-muted" data-degree></p><p data-current-operation></p></div>
       <div class="ch1-two-col"><div><h4>商的系数带</h4><div data-q-strip></div><h4>当前余式</h4><div data-r-strip></div><p class="ch1-muted" data-note></p></div><div><h4>步骤账本</h4><div class="ch1-ledger" data-ledger></div></div></div>`);
    mountDivision(el);
  }

  // §4 — extended Euclid and Bezout
  function mountEuclid(root) {
    const presets = {
      default: { f: M().poly([-1, 0, 0, 0, 1]), g: M().poly([-1, 0, 0, 1]), name: "gcd(x⁴−1,x³−1)" },
      coprime: { f: M().poly([1, 0, 1]), g: M().poly([1, 1]), name: "gcd(x²+1,x+1)" },
      shared: { f: M().poly([-2, 1, 2, -1]), g: M().poly([-1, 0, 1]), name: "含公共二次因式" },
    };
    let current = presets.default;
    let steps = M().extendedEuclidSteps(current.f, current.g);
    let index = 0;
    const doneStep = () => steps.at(-1);
    function paint() {
      steps = M().extendedEuclidSteps(current.f, current.g);
      index = Math.min(index, steps.length - 1);
      const step = steps[index];
      const final = doneStep();
      root.querySelector("[data-name]").textContent = current.name;
      root.querySelector("[data-step]").textContent = `${index + 1}/${steps.length}`;
      root.querySelector("[data-a]").innerHTML = tex(M().formatPolyTex(step.a || M().zeroPoly()));
      root.querySelector("[data-b]").innerHTML = tex(M().formatPolyTex(step.b || M().zeroPoly()));
      root.querySelector("[data-q]").innerHTML = step.q ? tex(M().formatPolyTex(step.q)) : "—";
      root.querySelector("[data-r]").innerHTML = step.remainder ? tex(M().formatPolyTex(step.remainder)) : "—";
      root.querySelector("[data-note]").textContent = step.note;
      root.querySelector("[data-gcd]").innerHTML = tex(M().formatPolyTex(final.d || final.a));
      root.querySelector("[data-s]").innerHTML = tex(M().formatPolyTex(final.s || M().zeroPoly()));
      root.querySelector("[data-t]").innerHTML = tex(M().formatPolyTex(final.t || M().zeroPoly()));
      const verify = M().polyAdd(M().polyMul(final.s, current.f), M().polyMul(final.t, current.g));
      root.querySelector("[data-verify]").innerHTML = `${tex(M().formatPolyTex(final.s))}·(${tex(M().formatPolyTex(current.f))}) + ${tex(M().formatPolyTex(final.t))}·(${tex(M().formatPolyTex(current.g))}) = ${tex(M().formatPolyTex(verify))}`;
      const coprime = M().polyEq(final.d, M().onePoly());
      const status = root.querySelector("[data-coprime]"); status.className = `ch1-status ${coprime ? "is-ok" : "is-warn"}`; status.textContent = coprime ? "互素" : "有非常数公共因式";
      root.querySelector("[data-ledger]").innerHTML = steps.map((s, i) => `<div class="${i === index ? "is-current" : ""}"><span>${i + 1}</span><p>${s.note}</p>${s.q ? `<small>q=${tex(M().formatPolyTex(s.q))}，r=${tex(M().formatPolyTex(s.remainder))}</small>` : ""}</div>`).join("");
      root.querySelector("[data-prev]").disabled = index === 0; root.querySelector("[data-next]").disabled = index === steps.length - 1;
    }
    root.querySelector("[data-prev]").addEventListener("click", () => { index = Math.max(0, index - 1); paint(); });
    root.querySelector("[data-next]").addEventListener("click", () => { index = Math.min(steps.length - 1, index + 1); paint(); });
    root.querySelector("[data-reset]").addEventListener("click", () => { index = 0; paint(); });
    root.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => { current = presets[button.dataset.preset]; index = 0; selectButtons(root, "[data-preset]", button); paint(); }));
    paint();
  }

  function interactive4(el, section) {
    lab(el, "欧几里得瀑布与 Bézout 回代", section.interactive.description,
      `<button type="button" data-prev>上一步</button><button type="button" data-next>下一步</button><button type="button" data-reset>重置</button><span class="ch1-control-separator"></span><button type="button" data-preset="default" class="is-active">x⁴−1 与 x³−1</button><button type="button" data-preset="coprime">互素示例</button><button type="button" data-preset="shared">公共因式示例</button>`,
      `<div class="ch1-metrics"><div class="ch1-metric"><span>当前示例</span><strong data-name></strong></div><div class="ch1-metric"><span>步骤</span><strong data-step></strong></div><div class="ch1-metric"><span>结论</span><strong data-coprime class="ch1-status"></strong></div></div>
       <div class="ch1-equation-grid"><div><span>A</span><strong data-a></strong></div><div><span>B</span><strong data-b></strong></div><div><span>商 q</span><strong data-q></strong></div><div><span>余式 r</span><strong data-r></strong></div></div>
       <div class="ch1-two-col"><div><h4>欧几里得账本</h4><div class="ch1-ledger" data-ledger></div><p class="ch1-muted" data-note></p></div><div><h4>Bézout 证书</h4><div class="ch1-result-band"><div><span>首一 gcd</span><strong data-gcd></strong></div></div><div class="ch1-equation-grid"><div><span>s</span><strong data-s></strong></div><div><span>t</span><strong data-t></strong></div></div><div class="ch1-callout"><strong>代回验证</strong><p data-verify></p></div></div></div>`);
    mountEuclid(el);
  }

  window.defineChapter1Renderer("number-fields", { formal: renderFormal, interactive: interactive1 });
  window.defineChapter1Renderer("univariate-polynomials", { formal: renderFormal, interactive: interactive2 });
  window.defineChapter1Renderer("polynomial-divisibility", { formal: renderFormal, interactive: interactive3 });
  window.defineChapter1Renderer("gcd-polynomials", { formal: renderFormal, interactive: interactive4 });
})();
