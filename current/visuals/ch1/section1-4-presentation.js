(() => {
  "use strict";
  const M = () => window.Ch1Math;
  const tex = (value) => (window.texInline ? window.texInline(String(value)) : String(value));
  const display = (value) => (window.texDisplay ? window.texDisplay(String(value)) : String(value));
  const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

  function renderFormal(el, section) {
    if (!el) return;
    const f = section.formal || {};
    const definitions = (f.definitions || []).slice(0, 3).map((item) => `<article class="definition-row"><strong>${item.title}</strong><p>${item.text}</p></article>`).join("");
    const pitfalls = (f.pitfalls || []).length ? `<div class="ch1-pitfalls"><strong>常见误区</strong><ul>${f.pitfalls.slice(0, 3).map((item) => `<li>${item}</li>`).join("")}</ul></div>` : "";
    el.innerHTML = `<h2>${f.title || "定理与概念"}</h2>
      <div class="lesson-formal-layout ch1-formal">
        ${f.intro ? `<p class="lesson-formal-intro">${f.intro}</p>` : ""}
        ${f.equation ? `<div class="ch1-formal-equation">${display(f.equation)}</div>` : ""}
        ${definitions ? `<div class="definition-stack">${definitions}</div>` : ""}
        ${pitfalls}
        ${f.note ? `<p class="ch1-next-note"><strong>${f.noteLabel || "下一节"}</strong>${f.note}</p>` : ""}
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

  // §2 — coefficient strip and exact convolution
  function mountCoefficients(root) {
    const state = { f: M().poly([2, -1, 0, 3]), g: M().poly([-2, 1, 1, -3]), mode: "mul", k: 3, scale: M().R(2) };
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
      // the i+j=k contributions only describe a product; hide them for f±g and λf
      const analysis = root.querySelector(".ch1-coeff-analysis");
      if (analysis) analysis.hidden = state.mode !== "mul";
      M().drawPolynomial(root.querySelector(".ch1-stage:not(.ch1-zero-stage) canvas"), out, { bounds, caption: "结果多项式的图像" });
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
      else { state.f = M().poly([2, -1, 0, 3]); state.g = M().poly([-2, 1, 1, -3]); state.mode = "mul"; }
      root.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("is-active", b.dataset.mode === state.mode));
      paint(true);
    }));
    M().observeCanvas(root.querySelector(".ch1-stage:not(.ch1-zero-stage)"), () => paint(false));
    paint(true);
  }

  /*
   * §2 opening module: the section question “can the middle 0 be dropped?”.
   * f = 3x³ − x + 2 ↔ (2, −1, 0, 3). Dropping the 0 gives (2, −1, 3) ↔ 3x² − x + 2:
   * the 3 moves from the x³ slot to the x² slot, and the two curves differ
   * (f − h = 3x²(x − 1), equal only at x = 0 and x = 1; f(2) = 24, h(2) = 12).
   */
  function mountZeroModule(root) {
    const box = root.querySelector("[data-zero-module]");
    if (!box) return;
    const f = M().poly([2, -1, 0, 3]);
    const h = M().poly([2, -1, 3]);
    const bounds = { xMin: -1.6, xMax: 2.4, yMin: -4, yMax: 26 };
    let dropped = false;
    const stage = box.querySelector(".ch1-zero-stage");
    const canvas = stage.querySelector("canvas");
    const toggle = box.querySelector("[data-zero-toggle]");
    const after = box.querySelector("[data-zero-after]");
    const readout = box.querySelector("[data-zero-readout]");

    function draw() {
      const pal = M().getPalette ? M().getPalette() : null;
      const st = getComputedStyle(canvas);
      const v1 = st.getPropertyValue("--cv-v1").trim() || pal?.v1 || "#2a64a8";
      const v2 = st.getPropertyValue("--cv-v2").trim() || pal?.v2 || "#c4552f";
      const axis = st.getPropertyValue("--cv-axis").trim() || "#8a8d84";
      const series = [{ p: f, color: v1, width: 2.4 }];
      if (dropped) series.push({ p: h, color: v2, width: 2.4 });
      const points = dropped ? [{ x: 2, y: 24, color: v1, r: 4.5 }, { x: 2, y: 12, color: v2, r: 4.5 }] : [];
      const cam = M().drawPolynomial(canvas, f, { bounds, series, points, clipToBounds: true });
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.font = "italic 600 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      const put = (text, x, y, color, dx = 8, dy = 0) => { const p = cam.toScreen(x, y); ctx.fillStyle = color; ctx.fillText(text, p.x + dx, p.y + dy); };
      put("3x³ − x + 2", 1.62, 14.5, v1, -110, 0);
      if (dropped) {
        put("3x² − x + 2", -1.55, 15.5, v2, 0, 0);
        const top = cam.toScreen(2, 24);
        const bottom = cam.toScreen(2, 0);
        ctx.strokeStyle = axis; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.lineTo(bottom.x, bottom.y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
        put("24", 2, 24, v1, 9, 4);
        put("12", 2, 12, v2, 9, 4);
      }
      ctx.restore();
    }

    function paint() {
      after.hidden = !dropped;
      toggle.textContent = dropped ? "恢复中间的 0" : "删去中间的 0";
      readout.hidden = !dropped || !gate?.revealed;
      draw();
    }

    const gate = window.LAPredictGate?.mount(box.querySelector("[data-zero-gate]"), {
      root: box,
      manual: true,
      key: "visuals/ch1/section1-4-presentation.js#middle-zero",
      question: `${tex("f(x)=3x^3-x+2")} 的系数序列是 ${tex("(2,-1,0,3)")}。删去中间的 0，写成 ${tex("(2,-1,3)")}，还是同一个多项式吗？`,
      options: [
        [`不是：3 挪到了 ${tex("x^2")} 的位置，变成 ${tex("3x^2-x+2")}`, true, ""],
        ["是：系数为 0 的项本来就不存在", false, `0 本身不贡献，但它占着 ${tex("x^2")} 的位置；删掉后，后面的系数都往前挪一位。`],
        ["是：只是写法更短", false, `${tex("(2,-1,3)")} 读作 ${tex("2-x+3x^2")}，在 x=2 处的值是 12，而 f(2)=24。`],
        ["只有次数变了，图像不变", false, "两条曲线只在 x=0 和 x=1 处相交，其他地方都分开了。"],
      ],
      right: `✓ 系数序列的第 k 位就是 ${tex("x^k")} 的系数，位置本身就是次数。中间的 0 必须保留；两个多项式相等，指每个同次项的系数都相等。`,
    });

    toggle.addEventListener("click", () => {
      dropped = !dropped;
      if (dropped) gate?.acted();
      paint();
    });
    M().observeCanvas(stage, draw);
    paint();
  }

  function interactive2(el, section) {
    lab(el, "系数带工作台", section.interactive.description,
      `<button type="button" data-mode="mul" class="is-active">fg</button><button type="button" data-mode="add">f+g</button><button type="button" data-mode="sub">f−g</button><button type="button" data-mode="scale">λf</button><span class="ch1-control-separator"></span><button type="button" data-preset="default">默认</button><button type="button" data-preset="cancel">首项抵消</button><button type="button" data-preset="fraction">分数系数</button><button type="button" data-preset="zero">零多项式</button>`,
      `<section class="ch1-learning-module ch1-zero-module" data-zero-module>
         <div class="ch1-module-heading"><span>01</span><div><h4>中间的 0 能不能省掉</h4></div></div>
         <div data-zero-gate></div>
         <div class="ch1-zero-body">
           <div class="ch1-zero-strips">
             <div class="ch1-zero-strip is-f"><b>${tex("f")} 的系数</b>${M().coefficientStrip(M().poly([2, -1, 0, 3]))}</div>
             <div class="ch1-zero-strip is-h" data-zero-after hidden><b>删去 0 后</b>${M().coefficientStrip(M().poly([2, -1, 3]))}</div>
             <div class="ch1-zero-actions"><button type="button" class="ch3l-btn is-primary" data-zero-toggle>删去中间的 0</button></div>
             <p class="ch1-zero-readout" data-zero-readout hidden>x=2 时，${tex("f(2)=24")}，而 ${tex("3\\cdot2^2-2+2=12")}。两者之差 ${tex("3x^2(x-1)")}，只在 x=0、x=1 处为 0。</p>
           </div>
           <div class="ch1-stage ch1-zero-stage"><canvas aria-label="3x³−x+2 与 3x²−x+2 的图像"></canvas></div>
         </div>
       </section>
       <div class="ch1-two-col"><div class="ch1-panel"><div><h4>f 的系数带</h4><div data-f-strip></div><div class="ch1-inline-equation">${tex("f=")}<span data-f-tex></span> · deg f=<strong data-deg-f></strong></div></div><div><h4>g 的系数带</h4><div data-g-strip></div><div class="ch1-inline-equation">${tex("g=")}<span data-g-tex></span> · deg g=<strong data-deg-g></strong></div></div><div data-scale-box hidden><label class="ch1-field">λ（支持分数）<input type="text" value="2" data-scale></label></div><div data-k-box hidden><label class="ch1-slider-row"><span>结果次数 k</span><input type="range" min="0" max="8" value="3" data-k><output data-k-value>3</output></label></div></div><div class="ch1-stage"><canvas aria-label="结果多项式固定坐标图像"></canvas></div></div>
       <div class="ch1-result-band"><div><span>结果</span><strong data-out-tex></strong><small>次数：<span data-deg-out></span></small></div><div data-out-strip></div></div>
       <div class="ch1-two-col"><div><h4>指定次数贡献</h4><div class="ch1-table-wrap"><table class="ch1-table"><thead><tr><th>f 项</th><th>g 项</th><th>乘积</th></tr></thead><tbody data-contributions></tbody></table></div></div><div class="ch1-callout"><strong>${tex("[x^k](fg)")} 的当前值</strong><p>当 k=<span data-k-value></span> 时，系数为 <span data-k-coeff></span>。</p><p class="ch1-muted">输入允许整数、小数与分数，例如 −3/2；计算在有理数上精确完成。</p></div></div>`);
    mountCoefficients(el);
    mountZeroModule(el);
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
    lab(el, "辗转相除与倒着代回", section.interactive.description,
      `<button type="button" data-prev>上一步</button><button type="button" data-next>下一步</button><button type="button" data-reset>重置</button><span class="ch1-control-separator"></span><button type="button" data-preset="default" class="is-active">x⁴−1 与 x³−1</button><button type="button" data-preset="coprime">互素示例</button><button type="button" data-preset="shared">公共因式示例</button>`,
      `<div class="ch1-metrics"><div class="ch1-metric"><span>当前示例</span><strong data-name></strong></div><div class="ch1-metric"><span>步骤</span><strong data-step></strong></div><div class="ch1-metric"><span>结论</span><strong data-coprime class="ch1-status"></strong></div></div>
       <div class="ch1-equation-grid"><div><span>A</span><strong data-a></strong></div><div><span>B</span><strong data-b></strong></div><div><span>商 q</span><strong data-q></strong></div><div><span>余式 r</span><strong data-r></strong></div></div>
       <div class="ch1-two-col"><div><h4>辗转相除的每一步</h4><div class="ch1-ledger" data-ledger></div><p class="ch1-muted" data-note></p></div><div><h4>倒着代回</h4><div class="ch1-result-band"><div><span>首一 gcd</span><strong data-gcd></strong></div></div><div class="ch1-equation-grid"><div><span>s</span><strong data-s></strong></div><div><span>t</span><strong data-t></strong></div></div><div class="ch1-callout"><strong>代回验证</strong><p data-verify></p></div></div></div>`);
    mountEuclid(el);
  }

  window.defineChapter1Renderer("number-fields", { formal: renderFormal });
  window.defineChapter1Renderer("univariate-polynomials", { formal: renderFormal, interactive: interactive2 });
  window.defineChapter1Renderer("polynomial-divisibility", { formal: renderFormal, interactive: interactive3 });
  window.defineChapter1Renderer("gcd-polynomials", { formal: renderFormal, interactive: interactive4 });
})();
