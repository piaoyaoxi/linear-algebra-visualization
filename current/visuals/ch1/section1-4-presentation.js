(() => {
  const M = () => window.Ch1Math;
  const tex = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);
  const listen = (...args) => window.ch1Listen?.(...args);
  const observe = (...args) => window.ch1ObserveResize?.(...args);

  function formal(section, el, config) {
    window.renderChapter1Formal?.(el, section, config);
  }

  function mountDomainLens(root) {
    const domains = {
      Z: {
        label: "整数集 ℤ",
        form: "n，n∈ℤ",
        gates: [true, true, true, false],
        reason: "1÷2 不再是整数；一条反例已经足够否定数域。",
        inverse: "非零元素 2 的倒数 1/2 跑出 ℤ。",
      },
      Q: {
        label: "有理数域 ℚ",
        form: "p/q，p,q∈ℤ，q≠0",
        gates: [true, true, true, true],
        reason: "两个有理数做四则运算（除数非零）仍是有理数。",
        inverse: "(p/q)⁻¹=q/p，p≠0。",
      },
      Q2: {
        label: "二次扩张 ℚ(√2)",
        form: "a+b√2，a,b∈ℚ",
        gates: [true, true, true, true],
        reason: "乘法与分母有理化后仍回到 a+b√2 的形式。",
        inverse: "(a+b√2)⁻¹=(a−b√2)/(a²−2b²)。",
      },
      R: {
        label: "实数域 ℝ",
        form: "实数",
        gates: [true, true, true, true],
        reason: "实数对四则运算封闭，是实系数多项式的舞台。",
        inverse: "每个非零实数都有实数倒数。",
      },
      C: {
        label: "复数域 ℂ",
        form: "a+bi，a,b∈ℝ",
        gates: [true, true, true, true],
        reason: "复数对四则运算封闭；非常数复系数多项式最终都有根。",
        inverse: "(a+bi)⁻¹=(a−bi)/(a²+b²)。",
      },
      POS: {
        label: "正实数集 ℝ₊",
        form: "x>0",
        gates: [true, false, true, true],
        reason: "不含 0，且 1−2=−1 跑出集合；它不是数域。",
        inverse: "乘除封闭不够，仍缺加法单位元和加法逆元。",
      },
    };
    const polynomialRows = [
      { formula: "x^2-2", coeff: { Z: true, Q: true, Q2: true, R: true, C: true, POS: false }, fate: { Q: "不可约", Q2: "分成 x±√2", R: "分成 x±√2", C: "分成 x±√2" } },
      { formula: "x^2-\\sqrt2", coeff: { Z: false, Q: false, Q2: true, R: true, C: true, POS: false }, fate: { Q2: "系数合法", R: "系数合法", C: "系数合法" } },
      { formula: "x^2+1", coeff: { Z: true, Q: true, Q2: true, R: true, C: true, POS: false }, fate: { Q: "不可约", Q2: "不可约", R: "不可约", C: "分成 x±i" } },
      { formula: "x^2-i", coeff: { Z: false, Q: false, Q2: false, R: false, C: true, POS: false }, fate: { C: "系数合法" } },
    ];
    let current = "Q";

    const buttons = [...root.querySelectorAll("[data-domain]")];
    function render() {
      const domain = domains[current];
      root.querySelector("[data-domain-title]").textContent = domain.label;
      root.querySelector("[data-domain-form]").textContent = domain.form;
      root.querySelector("[data-domain-reason]").textContent = domain.reason;
      root.querySelector("[data-domain-inverse]").textContent = domain.inverse;
      const labels = ["加法", "减法", "乘法", "非零除法"];
      root.querySelector("[data-gates]").innerHTML = labels.map((label, index) => `
        <div class="ch1-gate ${domain.gates[index] ? "is-ok" : "is-bad"}">
          <strong>${label}</strong><span>${domain.gates[index] ? "封闭" : "失败"}</span>
        </div>`).join("");
      const field = domain.gates.every(Boolean);
      const status = root.querySelector("[data-field-status]");
      status.textContent = field ? "四门全过：是数域" : "存在失败：不是数域";
      status.className = `ch1-status ${field ? "is-ok" : "is-bad"}`;
      root.querySelector("[data-polynomials]").innerHTML = polynomialRows.map((row) => {
        const legal = Boolean(row.coeff[current]);
        const fate = legal ? row.fate[current] || "系数合法" : "系数不合法";
        return `<article class="ch1-compare-card">
          <strong>${tex(row.formula)}</strong>
          <span class="ch1-status ${legal ? "is-ok" : "is-bad"}">${legal ? "属于当前系数环" : "离开当前系数环"}</span>
          <p>${fate}</p>
        </article>`;
      }).join("");
      buttons.forEach((button) => button.classList.toggle("is-active", button.dataset.domain === current));
    }
    buttons.forEach((button) => listen(button, "click", () => {
      current = button.dataset.domain;
      render();
    }));
    render();
  }

  function mountCoefficientWorkbench(root) {
    const state = {
      f: M().polyFrom(["2", "-1", "0", "3"]),
      g: M().polyFrom(["-2", "1", "1", "-3"]),
      mode: "add",
      target: 3,
    };
    const length = 4;
    const fHost = root.querySelector("[data-f-strip]");
    const gHost = root.querySelector("[data-g-strip]");
    fHost.innerHTML = M().editableStripHtml(state.f, "f", length);
    gHost.innerHTML = M().editableStripHtml(state.g, "g", length);

    function setInputs(key, poly) {
      root.querySelectorAll(`[data-poly="${key}"]`).forEach((input) => {
        const degree = Number(input.dataset.degree);
        input.value = M().formatR(poly[degree] || M().R(0));
        input.classList.remove("is-invalid");
        input.removeAttribute("aria-invalid");
      });
    }

    function readInputs(key) {
      const values = [];
      let valid = true;
      root.querySelectorAll(`[data-poly="${key}"]`).forEach((input) => {
        try {
          values[Number(input.dataset.degree)] = M().R(input.value);
          input.classList.remove("is-invalid");
          input.removeAttribute("aria-invalid");
        } catch {
          valid = false;
          input.classList.add("is-invalid");
          input.setAttribute("aria-invalid", "true");
        }
      });
      return valid ? M().normalizePoly(values) : null;
    }

    function render() {
      const result = state.mode === "add" ? M().polyAdd(state.f, state.g) : M().polyMul(state.f, state.g);
      const maxLength = state.mode === "add" ? length : length * 2 - 1;
      root.querySelector("[data-f-formula]").innerHTML = tex(M().formatPolyTex(state.f));
      root.querySelector("[data-g-formula]").innerHTML = tex(M().formatPolyTex(state.g));
      root.querySelector("[data-result-formula]").innerHTML = tex(M().formatPolyTex(result));
      root.querySelector("[data-f-degree]").textContent = M().isZeroPoly(state.f) ? "零多项式" : String(M().deg(state.f));
      root.querySelector("[data-g-degree]").textContent = M().isZeroPoly(state.g) ? "零多项式" : String(M().deg(state.g));
      root.querySelector("[data-result-degree]").textContent = M().isZeroPoly(result) ? "零多项式" : String(M().deg(result));
      root.querySelector("[data-result-strip]").innerHTML = M().staticStripHtml(result, maxLength, state.mode === "mul" ? state.target : null);
      root.querySelector("[data-target-wrap]").hidden = state.mode !== "mul";
      const target = root.querySelector("[data-target]");
      target.max = String(maxLength - 1);
      target.value = String(Math.min(state.target, maxLength - 1));
      state.target = Number(target.value);
      root.querySelector("[data-target-value]").textContent = String(state.target);

      if (state.mode === "mul") {
        const pairs = M().coefficientPairs(state.f, state.g, state.target);
        const total = pairs.reduce((acc, pair) => M().rAdd(acc, pair.product), M().R(0));
        root.querySelector("[data-pairs]").innerHTML = pairs.length
          ? pairs.map((pair) => `<div>${tex(`a_${pair.i}b_${pair.j}`)} = ${tex(`${M().formatRTex(pair.a)}\\cdot${M().formatRTex(pair.b)}=${M().formatRTex(pair.product)}`)}</div>`).join("")
          : "<div>没有满足 i+j=k 的位置。</div>";
        root.querySelector("[data-pair-total]").innerHTML = `合计 ${tex(`[x^{${state.target}}](fg)=${M().formatRTex(total)}`)}`;
      } else {
        const top = Math.max(M().deg(state.f), M().deg(state.g));
        const cancellation = Number.isFinite(top) && M().deg(result) < top;
        root.querySelector("[data-pairs]").innerHTML = `<div>${cancellation ? "最高次系数抵消，和的次数下降。" : "同次位置逐项相加。"}</div>`;
        root.querySelector("[data-pair-total]").textContent = "";
      }

      M().drawPolyGraph(root.querySelector("canvas"), result, {
        bounds: { xMin: -3, xMax: 3, yMin: -6, yMax: 6 },
        caption: "固定世界坐标 · 曲线只作系数结果的观察窗口",
      });
      root.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("is-active", button.dataset.mode === state.mode));
    }

    listen(root, "input", (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      if (input.matches("[data-poly]")) {
        const key = input.dataset.poly;
        const parsed = readInputs(key);
        if (parsed) {
          state[key] = parsed;
          render();
        }
      } else if (input.matches("[data-target]")) {
        state.target = Number(input.value);
        render();
      }
    });

    root.querySelectorAll("[data-mode]").forEach((button) => listen(button, "click", () => {
      state.mode = button.dataset.mode;
      render();
    }));
    root.querySelectorAll("[data-preset]").forEach((button) => listen(button, "click", () => {
      const preset = button.dataset.preset;
      if (preset === "cancel") {
        state.f = M().polyFrom(["1", "0", "0", "2"]);
        state.g = M().polyFrom(["0", "0", "0", "-2"]);
      } else if (preset === "fraction") {
        state.f = M().polyFrom(["1/2", "-3/4", "0", "1"]);
        state.g = M().polyFrom(["-1/2", "3/4", "1", "-1"]);
      } else if (preset === "zero") {
        state.f = M().polyFrom(["0", "0", "0", "0"]);
        state.g = M().polyFrom(["1", "2", "0", "0"]);
      } else {
        state.f = M().polyFrom(["2", "-1", "0", "3"]);
        state.g = M().polyFrom(["-2", "1", "1", "-3"]);
      }
      setInputs("f", state.f);
      setInputs("g", state.g);
      render();
    }));
    observe(root.querySelector(".ch1-stage"), render);
    render();
  }

  function createStepper(root, getSteps, renderStep) {
    let index = 0;
    let timer = null;
    const playButton = root.querySelector("[data-play]");
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
      if (playButton) playButton.textContent = "自动播放";
    }
    window.ch1UseCleanup?.(stop);
    function paint() {
      const steps = getSteps();
      index = Math.max(0, Math.min(index, steps.length - 1));
      renderStep(steps, index);
      root.querySelector("[data-step-count]").textContent = `${index + 1} / ${steps.length}`;
      root.querySelector("[data-prev]").disabled = index === 0;
      root.querySelector("[data-next]").disabled = index === steps.length - 1;
      if (index === steps.length - 1) stop();
    }
    listen(root.querySelector("[data-prev]"), "click", () => { stop(); index -= 1; paint(); });
    listen(root.querySelector("[data-next]"), "click", () => { stop(); index += 1; paint(); });
    listen(root.querySelector("[data-reset]"), "click", () => { stop(); index = 0; paint(); });
    if (playButton) listen(playButton, "click", () => {
      if (timer) {
        stop();
        return;
      }
      playButton.textContent = "暂停";
      timer = setInterval(() => {
        const steps = getSteps();
        if (index >= steps.length - 1) {
          stop();
          return;
        }
        index += 1;
        paint();
      }, window.Ch1Math.reducedMotion() ? 80 : 900);
    });
    return {
      reset() { stop(); index = 0; paint(); },
      paint,
    };
  }

  function mountDivision(root) {
    let f = M().polyFrom(["-1", "0", "0", "0", "1"]);
    let g = M().polyFrom(["1", "1", "1"]);
    let controller;
    function steps() { return M().divisionSteps(f, g); }
    function renderStep(all, index) {
      const step = all[index];
      const done = step.kind === "done";
      const divides = done && M().isZeroPoly(step.rem);
      root.querySelector("[data-f]").innerHTML = tex(M().formatPolyTex(f));
      root.querySelector("[data-g]").innerHTML = tex(M().formatPolyTex(g));
      root.querySelector("[data-q]").innerHTML = tex(M().formatPolyTex(step.q));
      root.querySelector("[data-r]").innerHTML = tex(M().formatPolyTex(step.rem));
      root.querySelector("[data-invariant]").innerHTML = tex(`${M().formatPolyTex(f)}=(${M().formatPolyTex(step.q)})(${M().formatPolyTex(g)})+(${M().formatPolyTex(step.rem)})`);
      const status = root.querySelector("[data-status]");
      status.textContent = done ? (divides ? "余式为 0：整除" : "余式非零：不整除") : "首项消去进行中";
      status.className = `ch1-status ${done ? (divides ? "is-ok" : "is-warn") : "is-neutral"}`;
      root.querySelector("[data-degree]").textContent = M().isZeroPoly(step.rem) ? "−∞（零余式）" : String(M().deg(step.rem));
      root.querySelector("[data-ledger]").innerHTML = all.map((item, i) => {
        let body = "";
        if (item.kind === "start") body = `开始：余式 ${tex(M().formatPolyTex(item.rem))}`;
        else if (item.kind === "done") body = `停止：q=${tex(M().formatPolyTex(item.q))}，r=${tex(M().formatPolyTex(item.rem))}`;
        else body = `${tex(M().formatPolyTex(item.term))}×${tex(M().formatPolyTex(g))}=${tex(M().formatPolyTex(item.product))}；新余式 ${tex(M().formatPolyTex(item.rem))}`;
        return `<div class="${i === index ? "is-current" : ""}"><span>${i + 1}</span>${body}</div>`;
      }).join("");
      root.querySelector("[data-q-strip]").innerHTML = M().staticStripHtml(step.q);
      root.querySelector("[data-r-strip]").innerHTML = M().staticStripHtml(step.rem);
    }
    controller = createStepper(root, steps, renderStep);
    root.querySelectorAll("[data-division-preset]").forEach((button) => listen(button, "click", () => {
      if (button.dataset.divisionPreset === "divides") {
        f = M().polyFrom(["-1", "0", "0", "1"]);
        g = M().polyFrom(["-1", "1"]);
      } else if (button.dataset.divisionPreset === "fraction") {
        f = M().polyFrom(["1/2", "-1", "0", "1"]);
        g = M().polyFrom(["1/2", "1"]);
      } else {
        f = M().polyFrom(["-1", "0", "0", "0", "1"]);
        g = M().polyFrom(["1", "1", "1"]);
      }
      controller.reset();
    }));
    controller.paint();
  }

  function mountEuclid(root) {
    let f = M().polyFrom(["-1", "0", "0", "0", "1"]);
    let g = M().polyFrom(["-1", "0", "0", "1"]);
    let controller;
    function steps() { return M().extendedEuclidSteps(f, g); }
    function combination(s, t) {
      return `${tex(M().formatPolyTex(s))}·f + ${tex(M().formatPolyTex(t))}·g`;
    }
    function renderStep(all, index) {
      const step = all[index];
      const final = all[all.length - 1];
      root.querySelector("[data-a]").innerHTML = tex(M().formatPolyTex(step.a));
      root.querySelector("[data-b]").innerHTML = tex(M().formatPolyTex(step.b));
      root.querySelector("[data-a-combo]").innerHTML = combination(step.sa, step.ta);
      root.querySelector("[data-b-combo]").innerHTML = combination(step.sb, step.tb);
      root.querySelector("[data-gcd]").innerHTML = tex(M().formatPolyTex(final.a));
      root.querySelector("[data-bezout]").innerHTML = `${tex(M().formatPolyTex(final.sa))}·f + ${tex(M().formatPolyTex(final.ta))}·g = ${tex(M().formatPolyTex(final.a))}`;
      const coprime = M().polyEq(final.a, [M().R(1)]);
      const status = root.querySelector("[data-coprime]");
      status.textContent = coprime ? "互素" : "有非常数公共因式";
      status.className = `ch1-status ${coprime ? "is-ok" : "is-warn"}`;
      root.querySelector("[data-ledger]").innerHTML = all.map((item, i) => {
        let text = "";
        if (item.kind === "start") text = `初始化 A=f，B=g`;
        else if (item.kind === "done") text = `首一化：gcd=${tex(M().formatPolyTex(item.a))}`;
        else text = `${tex(M().formatPolyTex(item.a))}=(${tex(M().formatPolyTex(item.q))})(${tex(M().formatPolyTex(item.b))})+${tex(M().formatPolyTex(item.remainder))}`;
        return `<div class="${i === index ? "is-current" : ""}"><span>${i + 1}</span>${text}</div>`;
      }).join("");
    }
    controller = createStepper(root, steps, renderStep);
    root.querySelectorAll("[data-euclid-preset]").forEach((button) => listen(button, "click", () => {
      if (button.dataset.euclidPreset === "coprime") {
        f = M().polyFrom(["1", "1"]);
        g = M().polyFrom(["1", "-1", "1"]);
      } else if (button.dataset.euclidPreset === "fraction") {
        f = M().polyFrom(["-1/2", "0", "1"]);
        g = M().polyFrom(["-1/2", "1"]);
      } else {
        f = M().polyFrom(["-1", "0", "0", "0", "1"]);
        g = M().polyFrom(["-1", "0", "0", "1"]);
      }
      controller.reset();
    }));
    controller.paint();
  }

  function formal1(el, section) {
    formal(section, el, {
      title: "先确定系数所在的数域",
      formula: "\\mathbb{Q}\\subset\\mathbb{Q}(\\sqrt2)\\subset\\mathbb{R}\\subset\\mathbb{C}",
      details: [
        { title: "封闭性检验", html: "数域必须含 0、1，并对加、减、乘和非零除法封闭。判断一个候选集合失败，只需找到一条决定性反例。" },
        { title: "ℚ(√2) 为什么封闭", html: `${tex("(a+b\\sqrt2)(c+d\\sqrt2)=(ac+2bd)+(ad+bc)\\sqrt2")}；求逆时分母有理化，仍得到同一形式。` },
        { title: "系数合法性", html: `${tex("f\\in F[x]")} 要求每个系数都在 ${tex("F")} 中；这与 ${tex("f")} 是否在 ${tex("F")} 中有根是不同问题。` },
        { title: "域改变分解", html: `${tex("x^2-2")} 在 ℚ 上不可约，在 ℝ 上分裂；${tex("x^2+1")} 在 ℂ 上分裂。` },
      ],
      cards: [
        { kicker: "判断", title: "先找失败门", html: "缺 0、缺负元或一个倒数跑出集合，都可立即否定。" },
        { kicker: "合法", title: "逐个看系数", html: "一个系数不属于 F，整个表达式就不属于 F[x]。" },
        { kicker: "连接", title: "为分解埋线", html: "后续每次说“不可约”，都必须带着当前数域一起读。" },
      ],
    });
  }

  function formal2(el, section) {
    formal(section, el, {
      title: "形式多项式与系数卷积",
      formula: "[x^k](fg)=\\sum_{i+j=k}a_i b_j",
      details: [
        { title: "系数位置", html: `${tex("[a_0,a_1,\\ldots,a_n]")} 按低次到高次排列；内部 0 仍编码一个次数位置。` },
        { title: "相等与规范化", html: "逐项系数相等才是形式相等；只删除最高端连续的零，不移动内部位置。" },
        { title: "加法次数", html: `${tex("\\deg(f+g)\\le\\max(\\deg f,\\deg g)")}；最高项抵消时严格下降。` },
        { title: "乘法次数", html: `非零时 ${tex("\\deg(fg)=\\deg f+\\deg g")}，因为两首项之积非零。` },
      ],
      cards: [
        { kicker: "精确输入", title: "分数不变小数", html: "工作台接受 1/2、−3/4 等精确有理数，不把它们四舍五入。" },
        { kicker: "卷积", title: "一个格子，多对来源", html: "选择目标次数 k，逐对查看 i+j=k 的所有贡献。" },
        { kicker: "图像", title: "固定相机只作观察", html: "曲线变化不改变代数判定，系数带始终是主对象。" },
      ],
    });
  }

  function formal3(el, section) {
    formal(section, el, {
      title: "带余除法：每一步消掉一个最高次项",
      formula: "f=qg+r,\\qquad r=0\\ \\text{或}\\ \\deg r<\\deg g",
      details: [
        { title: "算法不变量", html: "从开始到结束始终保持 f=当前商×g+当前余式。" },
        { title: "商项来源", html: "当前余式首项除以 g 的首项，唯一决定下一项商；乘回后最高次项精确相消。" },
        { title: "为什么停止", html: "只要还可继续，余式次数就严格下降；非负整数次数不能无限下降。" },
        { title: "整除与相伴", html: "终态 r=0 才是整除；相差非零常数倍的多项式互相整除。" },
      ],
      cards: [
        { kicker: "单步", title: "只推进一个消去动作", html: "账本将商项、乘回项和新余式分开显示。" },
        { kicker: "检查", title: "随时核对不变量", html: "任一步都能重组 qg+r，必须精确等于原被除式。" },
        { kicker: "边界", title: "小是次数低", html: "余式条件与数值大小无关，也没有“近似整除”。" },
      ],
    });
  }

  function formal4(el, section) {
    formal(section, el, {
      title: "欧几里得算法与 Bézout 回代",
      formula: "\\gcd(f,g)=\\gcd(g,r),\\qquad f=qg+r",
      details: [
        { title: "公因式集合不变", html: `若 ${tex("d\\mid f,g")}，则 ${tex("d\\mid f-qg=r")}；反向同理，所以两对多项式的公因式完全相同。` },
        { title: "首一化", html: "最后非零余式只确定到非零常数倍；除以首项系数后得到唯一的首一 gcd。" },
        { title: "扩展算法", html: `同时追踪 ${tex("A=s_1f+t_1g")}、${tex("B=s_2f+t_2g")}；同样的商更新系数，终态直接给出 Bézout 等式。` },
        { title: "互素", html: `${tex("\\gcd(f,g)=1")} 等价于存在 ${tex("sf+tg=1")}，也是许多整除命题的发动机。` },
      ],
      cards: [
        { kicker: "次数", title: "瀑布有限下落", html: "每个非零余式次数比前一个更低。" },
        { kicker: "不变量", title: "每一行都能回到原输入", html: "A、B 始终是原始 f、g 的线性组合。" },
        { kicker: "验证", title: "终态直接代回", html: "页面同时显示 gcd 和具体 s,t，不停在一句“可回代”。" },
      ],
    });
  }

  function interactive1(el) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>数域透镜</h3><p>逐门检查封闭性，并把“系数是否合法”与“在当前域能否继续分解”分开读取。</p></div>
      <div class="ch1-controls">
        <button type="button" data-domain="Z">ℤ</button>
        <button type="button" class="is-active" data-domain="Q">ℚ</button>
        <button type="button" data-domain="Q2">ℚ(√2)</button>
        <button type="button" data-domain="R">ℝ</button>
        <button type="button" data-domain="C">ℂ</button>
        <button type="button" data-domain="POS">正实数</button>
      </div>
      <div class="ch1-lab-grid">
        <section class="ch1-panel">
          <div class="ch1-readout">
            <div><strong data-domain-title></strong> <span data-field-status></span></div>
            <div>元素形式：<span data-domain-form></span></div>
            <p data-domain-reason></p>
            <p class="ch1-muted" data-domain-inverse></p>
          </div>
          <div class="ch1-gate-grid" data-gates></div>
          <div class="ch1-domain-chain" aria-label="常用包含链">ℚ <span>⊂</span> ℚ(√2) <span>⊂</span> ℝ <span>⊂</span> ℂ</div>
        </section>
        <section class="ch1-panel">
          <h4>当前域下的多项式</h4>
          <div class="ch1-compare" data-polynomials></div>
        </section>
      </div>
    </div>`;
    mountDomainLens(el);
  }

  function interactive2(el) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>系数带工作台</h3><p>输入整数、小数或分数。编辑框不在每次输入时重建，因此焦点、负号和分数输入保持稳定。</p></div>
      <div class="ch1-controls">
        <button type="button" class="is-active" data-mode="add">加法</button>
        <button type="button" data-mode="mul">乘法</button>
        <button type="button" data-preset="default">例题</button>
        <button type="button" data-preset="cancel">首项抵消</button>
        <button type="button" data-preset="fraction">精确分数</button>
        <button type="button" data-preset="zero">零多项式</button>
      </div>
      <div class="ch1-lab-grid">
        <div class="ch1-stage"><canvas aria-label="结果多项式的固定坐标图像"></canvas></div>
        <div class="ch1-panel">
          <div class="ch1-readout">
            <div>f = <span data-f-formula></span> · 次数 <strong data-f-degree></strong></div>
            <div>g = <span data-g-formula></span> · 次数 <strong data-g-degree></strong></div>
            <div>结果 = <span data-result-formula></span> · 次数 <strong data-result-degree></strong></div>
          </div>
          <div><span class="ch1-eyebrow">f 的系数</span><div data-f-strip></div></div>
          <div><span class="ch1-eyebrow">g 的系数</span><div data-g-strip></div></div>
          <div data-target-wrap>
            <label class="ch1-slider-row">目标次数 k
              <input data-target type="range" min="0" max="6" step="1" value="3" />
              <strong data-target-value>3</strong>
            </label>
          </div>
          <div><span class="ch1-eyebrow">结果系数</span><div data-result-strip></div></div>
          <div class="ch1-ledger" data-pairs></div>
          <div class="ch1-readout" data-pair-total></div>
        </div>
      </div>
    </div>`;
    mountCoefficientWorkbench(el);
  }

  function interactive3(el) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>多项式除法阶梯</h3><p>一步只做一次首项消去；可回退、自动播放，并随时检查 f=qg+r。</p></div>
      <div class="ch1-controls">
        <button type="button" data-prev>上一步</button>
        <button type="button" data-next>下一步</button>
        <button type="button" data-play>自动播放</button>
        <button type="button" data-reset>重置</button>
        <button type="button" data-division-preset="default">非整除示例</button>
        <button type="button" data-division-preset="divides">整除示例</button>
        <button type="button" data-division-preset="fraction">分数系数</button>
      </div>
      <div class="ch1-readout">
        <div>f = <span data-f></span></div><div>g = <span data-g></span></div>
        <div>q = <span data-q></span></div><div>r = <span data-r></span></div>
        <div><span data-status></span> · 当前余式次数 <strong data-degree></strong> · 步骤 <strong data-step-count></strong></div>
        <div class="ch1-invariant" data-invariant></div>
      </div>
      <div class="ch1-lab-grid">
        <div><span class="ch1-eyebrow">当前商</span><div data-q-strip></div></div>
        <div><span class="ch1-eyebrow">当前余式</span><div data-r-strip></div></div>
      </div>
      <div class="ch1-ledger" data-ledger></div>
    </div>`;
    mountDivision(el);
  }

  function interactive4(el) {
    el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
      <div class="ch1-lab-head"><h3>扩展欧几里得瀑布</h3><p>余式链和 Bézout 系数同时推进；每一行都显示当前对象如何由原始 f、g 组合而来。</p></div>
      <div class="ch1-controls">
        <button type="button" data-prev>上一步</button>
        <button type="button" data-next>下一步</button>
        <button type="button" data-play>自动播放</button>
        <button type="button" data-reset>重置</button>
        <button type="button" data-euclid-preset="default">gcd(x⁴−1,x³−1)</button>
        <button type="button" data-euclid-preset="coprime">互素示例</button>
        <button type="button" data-euclid-preset="fraction">分数系数</button>
      </div>
      <div class="ch1-lab-grid">
        <div class="ch1-readout">
          <div>A = <span data-a></span></div>
          <div class="ch1-muted">A = <span data-a-combo></span></div>
          <div>B = <span data-b></span></div>
          <div class="ch1-muted">B = <span data-b-combo></span></div>
          <div>步骤 <strong data-step-count></strong></div>
        </div>
        <div class="ch1-readout">
          <div>首一 gcd = <strong data-gcd></strong> <span data-coprime></span></div>
          <div class="ch1-invariant" data-bezout></div>
        </div>
      </div>
      <div class="ch1-ledger" data-ledger></div>
    </div>`;
    mountEuclid(el);
  }

  window.defineChapter1Renderer("number-fields", { formal: formal1, interactive: interactive1 });
  window.defineChapter1Renderer("univariate-polynomials", { formal: formal2, interactive: interactive2 });
  window.defineChapter1Renderer("polynomial-divisibility", { formal: formal3, interactive: interactive3 });
  window.defineChapter1Renderer("gcd-polynomials", { formal: formal4, interactive: interactive4 });
})();