(() => {
  const M = () => window.Ch1Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);

  function formalShell(title, lead, modulesHtml) {
    return `<h2>${title}</h2><div class="ch1-formal"><p class="ch1-formal-lead">${lead}</p>${modulesHtml}</div>`;
  }

  function module(num, title, sub, body) {
    return `<section class="ch1-module"><div class="ch1-module-heading"><span>${num}</span><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;
  }

  // —— §1 数域透镜 ——
  function mountDomainLens(root) {
    const domains = {
      Z: {
        label: "整数集 ℤ",
        gates: { add: true, sub: true, mul: true, div: false },
        reason: "1÷2 ∉ ℤ，除法门失败。",
        form: "n ∈ ℤ",
      },
      Q: {
        label: "有理数集 ℚ",
        gates: { add: true, sub: true, mul: true, div: true },
        reason: "非零除法仍为有理数。",
        form: "p/q",
      },
      R: {
        label: "实数集 ℝ",
        gates: { add: true, sub: true, mul: true, div: true },
        reason: "标准数域。",
        form: "实数",
      },
      C: {
        label: "复数集 ℂ",
        gates: { add: true, sub: true, mul: true, div: true },
        reason: "标准数域。",
        form: "a+bi",
      },
      Q2: {
        label: "ℚ(√2)",
        gates: { add: true, sub: true, mul: true, div: true },
        reason: "乘积与分母有理化后仍为 a+b√2。",
        form: "a+b√2（a,b∈ℚ）",
      },
    };

    const polys = [
      { id: "p1", tex: "x^2-2", coeffs: "有理", ok: { Z: true, Q: true, R: true, C: true, Q2: true } },
      { id: "p2", tex: "x^2-\\sqrt{2}", coeffs: "含 √2", ok: { Z: false, Q: false, R: true, C: true, Q2: true } },
      { id: "p3", tex: "x^2+1", coeffs: "有理", ok: { Z: true, Q: true, R: true, C: true, Q2: true } },
      { id: "p4", tex: "x^2-i", coeffs: "含 i", ok: { Z: false, Q: false, R: false, C: true, Q2: false } },
    ];

    let current = "Q";

    function render() {
      const d = domains[current];
      const gate = (key, name) => {
        const ok = d.gates[key];
        return `<div class="ch1-gate ${ok ? "is-ok" : "is-bad"}"><strong>${name}</strong><div>${ok ? "封闭" : "不封闭"}</div></div>`;
      };
      root.querySelector("[data-domain-label]").textContent = d.label;
      root.querySelector("[data-domain-form]").textContent = d.form;
      root.querySelector("[data-domain-reason]").textContent = d.reason;
      root.querySelector("[data-gates]").innerHTML =
        gate("add", "加法") + gate("sub", "减法") + gate("mul", "乘法") + gate("div", "非零除法");
      const status = Object.values(d.gates).every(Boolean);
      const st = root.querySelector("[data-domain-status]");
      st.textContent = status ? "是数域" : "不是数域";
      st.className = `ch1-status ${status ? "is-ok" : "is-bad"}`;

      root.querySelector("[data-poly-list]").innerHTML = polys
        .map((p) => {
          const ok = p.ok[current];
          return `<div class="ch1-compare-card"><strong>${tex(p.tex)}</strong><span class="ch1-status ${ok ? "is-ok" : "is-bad"}">${ok ? "系数合法" : "系数不合法"}</span><div class="ch1-muted">${p.coeffs}</div></div>`;
        })
        .join("");

      root.querySelector("[data-nest]").innerHTML = `
        <div class="ch1-nest-layer" data-level="4"><strong>ℂ</strong></div>
        <div class="ch1-nest-layer" data-level="3"><strong>ℝ</strong></div>
        <div class="ch1-nest-layer" data-level="2"><strong>ℚ(√2)</strong></div>
        <div class="ch1-nest-layer" data-level="1"><strong>ℚ</strong></div>`;
      M().pulseClass(root.querySelector("[data-domain-status]"));
    }

    root.querySelectorAll("[data-domain]").forEach((btn) => {
      btn.addEventListener("click", () => {
        current = btn.dataset.domain;
        root.querySelectorAll("[data-domain]").forEach((b) => b.classList.toggle("is-active", b === btn));
        render();
      });
    });
    render();
  }

  // —— §2 系数带 ——
  function mountCoeffWorkbench(root) {
    const state = {
      f: M().polyFromNums([2, -1, 0, 1]),
      g: M().polyFromNums([-2, 1, 1, -1]),
      mode: "add",
    };

    function readPoly(key) {
      const inputs = [...root.querySelectorAll(`[data-${key}]`)];
      if (!inputs.length) return state[key];
      return M().normalizePoly(inputs.map((el) => M().R(Number(el.value) || 0)));
    }

    function paint() {
      const f = state.f;
      const g = state.g;
      const sum = M().polyAdd(f, g);
      const prod = M().polyMul(f, g);
      const active = state.mode === "add" ? sum : prod;

      root.querySelector("[data-f-strip]").innerHTML = M().stripHtml(f, { editable: true, dataKey: "f" });
      root.querySelector("[data-g-strip]").innerHTML = M().stripHtml(g, { editable: true, dataKey: "g" });
      root.querySelector("[data-out-strip]").innerHTML = M().stripHtml(active);
      root.querySelector("[data-f-tex]").innerHTML = tex(M().formatPolyTex(f));
      root.querySelector("[data-g-tex]").innerHTML = tex(M().formatPolyTex(g));
      root.querySelector("[data-out-tex]").innerHTML = tex(M().formatPolyTex(active));
      root.querySelector("[data-deg-f]").textContent = M().isZeroPoly(f) ? "零多项式" : String(M().deg(f));
      root.querySelector("[data-deg-g]").textContent = M().isZeroPoly(g) ? "零多项式" : String(M().deg(g));
      root.querySelector("[data-deg-out]").textContent = M().isZeroPoly(active) ? "零多项式" : String(M().deg(active));

      const canvas = root.querySelector("[data-ch1-canvas]");
      M().drawPolyGraph(canvas, active, {
        bounds: { xMin: -3, xMax: 3, yMin: -4, yMax: 4 },
        caption: "固定相机 · 结果多项式图像",
      });

      if (state.mode === "mul") {
        const pairs = [];
        for (let i = 0; i < f.length; i++) {
          for (let j = 0; j < g.length; j++) {
            if (i + j === 3 && !M().rIsZero(M().rMul(f[i], g[j]))) {
              pairs.push(`a_${i}b_${j}=${M().formatR(M().rMul(f[i], g[j]))}`);
            }
          }
        }
        root.querySelector("[data-pair-note]").textContent = pairs.length
          ? `x³ 的贡献：${pairs.join("，")}`
          : "x³ 的贡献全为 0（或该次不存在非零配对）";
      } else {
        root.querySelector("[data-pair-note]").textContent =
          M().deg(sum) < Math.max(M().deg(f), M().deg(g))
            ? "加法出现首项抵消，次数下降。"
            : "加法按同次位置相加。";
      }

      root.querySelectorAll("[data-f], [data-g]").forEach((input) => {
        input.addEventListener("input", () => {
          state.f = readPoly("f");
          state.g = readPoly("g");
          paint();
        });
      });
    }

    root.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.mode = btn.dataset.mode;
        root.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("is-active", b === btn));
        paint();
      });
    });

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.preset === "cancel") {
          state.f = M().polyFromNums([1, 0, 0, 2]);
          state.g = M().polyFromNums([0, 0, 0, -2]);
        } else if (btn.dataset.preset === "zero") {
          state.f = M().polyFromNums([0, 0, 0]);
          state.g = M().polyFromNums([1, 2]);
        } else {
          state.f = M().polyFromNums([2, -1, 0, 1]);
          state.g = M().polyFromNums([-2, 1, 1, -1]);
        }
        paint();
      });
    });

    const onResize = () => {
      if (document.body.contains(root)) paint();
    };
    window.addEventListener("resize", onResize, { passive: true });
    paint();
  }

  // —— §3 除法阶梯 ——
  function mountDivision(root) {
    let f = M().polyFromNums([-1, 0, 0, 0, 1]); // x^4-1
    let g = M().polyFromNums([1, 1, 1]); // x^2+x+1
    let steps = M().divisionSteps(f, g);
    let idx = 0;

    function paint() {
      steps = M().divisionSteps(f, g);
      idx = Math.max(0, Math.min(idx, steps.length - 1));
      const step = steps[idx];
      root.querySelector("[data-step-label]").textContent = `${idx + 1} / ${steps.length}`;
      root.querySelector("[data-step-note]").textContent = step.note;
      root.querySelector("[data-f-tex]").innerHTML = tex(M().formatPolyTex(f));
      root.querySelector("[data-g-tex]").innerHTML = tex(M().formatPolyTex(g));
      root.querySelector("[data-q-tex]").innerHTML = tex(M().formatPolyTex(step.q || [M().R(0)]));
      root.querySelector("[data-r-tex]").innerHTML = tex(M().formatPolyTex(step.rem || [M().R(0)]));
      const rem = step.rem || [M().R(0)];
      const done = step.kind === "done";
      const divides = done && M().isZeroPoly(rem);
      const st = root.querySelector("[data-div-status]");
      st.textContent = !done ? "进行中" : divides ? "整除成立" : "不整除";
      st.className = `ch1-status ${!done ? "is-warn" : divides ? "is-ok" : "is-bad"}`;
      root.querySelector("[data-ledger]").innerHTML = steps
        .map((s, i) => `<div class="${i === idx ? "is-current" : ""}">${i + 1}. ${s.note}</div>`)
        .join("");
      root.querySelector("[data-q-strip]").innerHTML = M().stripHtml(step.q || [M().R(0)]);
      root.querySelector("[data-r-strip]").innerHTML = M().stripHtml(step.rem || [M().R(0)]);
      M().pulseClass(root.querySelector("[data-div-status]"));
    }

    root.querySelector("[data-next]").addEventListener("click", () => {
      idx = Math.min(steps.length - 1, idx + 1);
      paint();
    });
    root.querySelector("[data-prev]").addEventListener("click", () => {
      idx = Math.max(0, idx - 1);
      paint();
    });
    root.querySelector("[data-reset]").addEventListener("click", () => {
      idx = 0;
      paint();
    });
    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.preset === "divides") {
          f = M().polyFromNums([-1, 0, 0, 1]); // x^3-1
          g = M().polyFromNums([-1, 1]); // x-1
        } else {
          f = M().polyFromNums([-1, 0, 0, 0, 1]);
          g = M().polyFromNums([1, 1, 1]);
        }
        idx = 0;
        paint();
      });
    });
    paint();
  }

  // —— §4 欧几里得 ——
  function mountEuclid(root) {
    let f = M().polyFromNums([-1, 0, 0, 0, 1]);
    let g = M().polyFromNums([-1, 0, 0, 1]);
    let steps = M().euclidSteps(f, g);
    let idx = 0;

    function paint() {
      steps = M().euclidSteps(f, g);
      idx = Math.max(0, Math.min(idx, steps.length - 1));
      const step = steps[idx];
      root.querySelector("[data-step-label]").textContent = `${idx + 1} / ${steps.length}`;
      root.querySelector("[data-step-note]").textContent = step.note;
      root.querySelector("[data-a-tex]").innerHTML = tex(M().formatPolyTex(step.a));
      root.querySelector("[data-b-tex]").innerHTML = tex(M().formatPolyTex(step.b));
      root.querySelector("[data-r-tex]").innerHTML = step.r ? tex(M().formatPolyTex(step.r)) : "—";
      const last = steps[steps.length - 1];
      root.querySelector("[data-gcd-tex]").innerHTML = tex(M().formatPolyTex(last.a));
      root.querySelector("[data-ledger]").innerHTML = steps
        .map((s, i) => `<div class="${i === idx ? "is-current" : ""}">${i + 1}. ${s.note}</div>`)
        .join("");
      const d = last.a;
      const st = root.querySelector("[data-coprime]");
      const coprime = M().polyEq(d, [M().R(1)]);
      st.textContent = coprime ? "互素（gcd=1）" : "非互素";
      st.className = `ch1-status ${coprime ? "is-ok" : "is-warn"}`;
    }

    root.querySelector("[data-next]").addEventListener("click", () => {
      idx = Math.min(steps.length - 1, idx + 1);
      paint();
    });
    root.querySelector("[data-prev]").addEventListener("click", () => {
      idx = Math.max(0, idx - 1);
      paint();
    });
    root.querySelector("[data-reset]").addEventListener("click", () => {
      idx = 0;
      paint();
    });
    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.preset === "coprime") {
          f = M().polyFromNums([1, 1]);
          g = M().polyFromNums([1, -1, 1]);
        } else {
          f = M().polyFromNums([-1, 0, 0, 0, 1]);
          g = M().polyFromNums([-1, 0, 0, 1]);
        }
        idx = 0;
        paint();
      });
    });
    paint();
  }

  function formal1(el) {
    if (!el) return;
    el.innerHTML = formalShell(
      "先指定系数来自哪里",
      "数域不是“数的大小等级”，而是对四则运算封闭的系数舞台。",
      module("1", "四则封闭", "加、减、乘、非零除法", `<p>${tex("\\mathbb{Q},\\mathbb{R},\\mathbb{C}")} 与 ${tex("\\mathbb{Q}(\\sqrt{2})")} 是数域；${tex("\\mathbb{Z}")} 不是。</p>`) +
        module("2", "包含关系", "扩张而非枚举", `<p>${tex("\\mathbb{Q}\\subset\\mathbb{Q}(\\sqrt{2})\\subset\\mathbb{R}\\subset\\mathbb{C}")}</p>`) +
        module("3", "为分解埋线", "同一表达式，不同命运", `<p>${tex("x^2-2")} 在 ${tex("\\mathbb{Q}[x]")} 不可约，在 ${tex("\\mathbb{R}[x]")} 可分解。</p>`),
    );
  }

  function formal2(el) {
    if (!el) return;
    el.innerHTML = formalShell(
      "形式多项式与系数带",
      "先把多项式看成幂基下的有限坐标，再谈图像。",
      module("1", "系数带", "位置就是次数", `<p>${tex("[a_0,a_1,\\ldots,a_n]")}；内部零保留。</p>`) +
        module("2", "次数", "零多项式单独处理", `<p>非零时取最高非零下标；加法可能降低次数。</p>`) +
        module("3", "乘法", "卷积配对", `<p>${tex("\\deg(fg)=\\deg f+\\deg g")}（非零）。</p>`),
    );
  }

  function formal3(el) {
    if (!el) return;
    el.innerHTML = formalShell(
      "带余除法与整除",
      "每一步消去当前最高次项，余式次数严格下降。",
      module("1", "写法", "商与余式", `<p>${tex("f=qg+r")}，${tex("r=0")} 或 ${tex("\\deg r<\\deg g")}。</p>`) +
        module("2", "整除", "余式精确为 0", `<p>${tex("g\\mid f")} 当且仅当存在 ${tex("q")} 使 ${tex("f=qg")}。</p>`) +
        module("3", "相伴", "非零常数倍", `<p>${tex("f")} 与 ${tex("cf")} 互相整除。</p>`),
    );
  }

  function formal4(el) {
    if (!el) return;
    el.innerHTML = formalShell(
      "欧几里得算法与 Bézout",
      "用次数下降保证终止，用首一化消除常数倍歧义。",
      module("1", "替换原理", "公因式不变", `<p>${tex("\\gcd(f,g)=\\gcd(g,r)")}</p>`) +
        module("2", "首一规范", "唯一代表", `<p>最后非零余式首一化。</p>`) +
        module("3", "互素", "Bézout", `<p>${tex("\\gcd=1\\Rightarrow \\exists s,t:\\, sf+tg=1")}</p>`),
    );
  }

  function interactive1(el) {
    if (!el) return;
    el.innerHTML = `<h2>交互实验</h2>
      <div class="ch1-lab">
        <div class="ch1-lab-head"><h3>数域透镜</h3><p>切换集合，检查四则运算门，并查看多项式系数是否合法。</p></div>
        <div class="ch1-controls">
          <button type="button" data-domain="Z">ℤ</button>
          <button type="button" class="is-active" data-domain="Q">ℚ</button>
          <button type="button" data-domain="R">ℝ</button>
          <button type="button" data-domain="C">ℂ</button>
          <button type="button" data-domain="Q2">ℚ(√2)</button>
        </div>
        <div class="ch1-lab-grid">
          <div class="ch1-panel">
            <div class="ch1-readout">
              <strong data-domain-label>有理数集 ℚ</strong>
              <span class="ch1-status is-ok" data-domain-status>是数域</span>
              <div class="ch1-muted">元素形式：<span data-domain-form>p/q</span></div>
              <div class="ch1-muted" data-domain-reason></div>
            </div>
            <div class="ch1-gate-grid" data-gates></div>
            <div class="ch1-nest" data-nest></div>
          </div>
          <div class="ch1-panel">
            <div class="ch1-compare" data-poly-list></div>
          </div>
        </div>
      </div>`;
    mountDomainLens(el);
  }

  function interactive2(el) {
    if (!el) return;
    el.innerHTML = `<h2>交互实验</h2>
      <div class="ch1-lab">
        <div class="ch1-lab-head"><h3>系数带工作台</h3><p>编辑两个多项式，观察加法/乘法、次数与固定相机下的图像。</p></div>
        <div class="ch1-controls">
          <button type="button" class="is-active" data-mode="add">加法</button>
          <button type="button" data-mode="mul">乘法</button>
          <button type="button" data-preset="default">默认</button>
          <button type="button" data-preset="cancel">首项抵消</button>
          <button type="button" data-preset="zero">零多项式</button>
        </div>
        <div class="ch1-lab-grid">
          <div class="ch1-stage"><canvas data-ch1-canvas aria-label="多项式图像"></canvas></div>
          <div class="ch1-panel">
            <div class="ch1-readout">
              <div>f = <span data-f-tex></span> · 次数 <strong data-deg-f></strong></div>
              <div>g = <span data-g-tex></span> · 次数 <strong data-deg-g></strong></div>
              <div>结果 = <span data-out-tex></span> · 次数 <strong data-deg-out></strong></div>
              <div class="ch1-muted" data-pair-note></div>
            </div>
            <div><div class="ch1-muted">f 系数带</div><div data-f-strip></div></div>
            <div><div class="ch1-muted">g 系数带</div><div data-g-strip></div></div>
            <div><div class="ch1-muted">结果系数带</div><div data-out-strip></div></div>
          </div>
        </div>
      </div>`;
    mountCoeffWorkbench(el);
  }

  function interactive3(el) {
    if (!el) return;
    el.innerHTML = `<h2>交互实验</h2>
      <div class="ch1-lab">
        <div class="ch1-lab-head"><h3>多项式除法阶梯</h3><p>单步查看首项消去；余式次数必须下降。</p></div>
        <div class="ch1-controls">
          <button type="button" data-prev>上一步</button>
          <button type="button" data-next>下一步</button>
          <button type="button" data-reset>重置</button>
          <button type="button" data-preset="default">x⁴−1 ÷ (x²+x+1)</button>
          <button type="button" data-preset="divides">整除示例</button>
        </div>
        <div class="ch1-lab-grid is-stack">
          <div class="ch1-readout">
            <div>被除式 f = <span data-f-tex></span></div>
            <div>除式 g = <span data-g-tex></span></div>
            <div>商 q = <span data-q-tex></span></div>
            <div>余式 r = <span data-r-tex></span></div>
            <div>步骤 <strong data-step-label></strong> · <span class="ch1-status" data-div-status></span></div>
            <div class="ch1-muted" data-step-note></div>
          </div>
          <div class="ch1-lab-grid">
            <div><div class="ch1-muted">商的系数带</div><div data-q-strip></div></div>
            <div><div class="ch1-muted">当前余式</div><div data-r-strip></div></div>
          </div>
          <div class="ch1-ledger" data-ledger></div>
        </div>
      </div>`;
    mountDivision(el);
  }

  function interactive4(el) {
    if (!el) return;
    el.innerHTML = `<h2>交互实验</h2>
      <div class="ch1-lab">
        <div class="ch1-lab-head"><h3>欧几里得瀑布</h3><p>余式次数下降，最后非零余式首一化即为最大公因式。</p></div>
        <div class="ch1-controls">
          <button type="button" data-prev>上一步</button>
          <button type="button" data-next>下一步</button>
          <button type="button" data-reset>重置</button>
          <button type="button" data-preset="default">gcd(x⁴−1,x³−1)</button>
          <button type="button" data-preset="coprime">互素示例</button>
        </div>
        <div class="ch1-readout">
          <div>A = <span data-a-tex></span></div>
          <div>B = <span data-b-tex></span></div>
          <div>R = <span data-r-tex></span></div>
          <div>当前最大公因式 = <span data-gcd-tex></span> · <span class="ch1-status" data-coprime></span></div>
          <div>步骤 <strong data-step-label></strong></div>
          <div class="ch1-muted" data-step-note></div>
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
