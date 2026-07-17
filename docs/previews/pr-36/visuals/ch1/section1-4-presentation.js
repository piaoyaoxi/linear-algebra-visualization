(() => {
  const M = () => window.Ch1Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);
  const display = (s) => (window.texDisplay ? window.texDisplay(s) : s);

  // —— §1 数域透镜 ——
  function mountDomainLens(root) {
    const domains = {
      Z: {
        label: "整数集 ℤ",
        gates: { add: true, sub: true, mul: true, div: false },
        reason: "1÷2 ∉ ℤ，除法门失败。整数对加、减、乘封闭，但对非零除法不封闭，故不是数域。",
        form: "n ∈ ℤ",
      },
      Q: {
        label: "有理数集 ℚ",
        gates: { add: true, sub: true, mul: true, div: true },
        reason: "非零除法结果仍是有理数。四则运算门全部通过，是标准数域。",
        form: "p/q（q≠0）",
      },
      R: {
        label: "实数集 ℝ",
        gates: { add: true, sub: true, mul: true, div: true },
        reason: "实数域是最常用的系数舞台；包含所有极限、根号与超越数。",
        form: "实数",
      },
      C: {
        label: "复数集 ℂ",
        gates: { add: true, sub: true, mul: true, div: true },
        reason: "代数闭域：非常数多项式在 ℂ 上必有根。",
        form: "a+bi",
      },
      Q2: {
        label: "ℚ(√2)",
        gates: { add: true, sub: true, mul: true, div: true },
        reason: "乘积与分母有理化后仍为 a+b√2（a,b∈ℚ），故是数域。",
        form: "a+b√2（a,b∈ℚ）",
      },
    };

    const polys = [
      { id: "p1", tex: "x^2-2", coeffs: "有理系数", ok: { Z: true, Q: true, R: true, C: true, Q2: true } },
      { id: "p2", tex: "x^2-\\sqrt{2}", coeffs: "含 √2", ok: { Z: false, Q: false, R: true, C: true, Q2: true } },
      { id: "p3", tex: "x^2+1", coeffs: "有理系数", ok: { Z: true, Q: true, R: true, C: true, Q2: true } },
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
        <div class="ch1-nest-layer" data-level="4"><strong>ℂ</strong> · 代数闭</div>
        <div class="ch1-nest-layer" data-level="3"><strong>ℝ</strong> · 实数域</div>
        <div class="ch1-nest-layer" data-level="2"><strong>ℚ(√2)</strong> · 二次扩张</div>
        <div class="ch1-nest-layer" data-level="1"><strong>ℚ</strong> · 最小常用域</div>`;
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

  // —— §2 系数带（委托绑定，避免 paint 重复挂监听） ——
  function mountCoeffWorkbench(root) {
    const state = {
      f: M().polyFromNums([2, -1, 0, 1]),
      g: M().polyFromNums([-2, 1, 1, -1]),
      mode: "add",
    };
    const bounds = { xMin: -3, xMax: 3, yMin: -4, yMax: 4 };

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
        bounds,
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
    }

    // 单次委托：输入变化时读系数，不在 paint 内重复 addEventListener
    root.addEventListener("input", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLInputElement)) return;
      if (t.matches("[data-f], [data-g]")) {
        state.f = readPoly("f");
        state.g = readPoly("g");
        paint();
      }
    });

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

    window.addEventListener(
      "resize",
      () => {
        if (document.body.contains(root)) paint();
      },
      { passive: true },
    );
    paint();
  }

  // —— §3 除法阶梯（账本用 KaTeX） ——
  function mountDivision(root) {
    let f = M().polyFromNums([-1, 0, 0, 0, 1]);
    let g = M().polyFromNums([1, 1, 1]);
    let steps = M().divisionSteps(f, g);
    let idx = 0;

    function ledgerLine(s, i) {
      if (s.kind === "start") {
        return `<div class="${i === idx ? "is-current" : ""}">${i + 1}. 开始：${tex(M().formatPolyTex(s.rem))}</div>`;
      }
      if (s.kind === "eliminate") {
        return `<div class="${i === idx ? "is-current" : ""}">${i + 1}. 商加 ${tex(M().formatPolyTex(s.term))}，余式 → ${tex(M().formatPolyTex(s.rem))}</div>`;
      }
      return `<div class="${i === idx ? "is-current" : ""}">${i + 1}. ${s.note} · q=${tex(M().formatPolyTex(s.q))}，r=${tex(M().formatPolyTex(s.rem))}</div>`;
    }

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
      root.querySelector("[data-ledger]").innerHTML = steps.map(ledgerLine).join("");
      root.querySelector("[data-q-strip]").innerHTML = M().stripHtml(step.q || [M().R(0)]);
      root.querySelector("[data-r-strip]").innerHTML = M().stripHtml(step.rem || [M().R(0)]);
      if (step.kind === "eliminate" && step.product) {
        root.querySelector("[data-elim-detail]").innerHTML =
          `本步：${tex(M().formatPolyTex(step.term))} · ${tex(M().formatPolyTex(g))} = ${tex(M().formatPolyTex(step.product))}，从余式减去。`;
      } else {
        root.querySelector("[data-elim-detail]").innerHTML = done
          ? `终态：${tex("f=qg+r")}，${divides ? "r=0" : "deg r < deg g"}。`
          : "点“下一步”看首项消去。";
      }
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
          f = M().polyFromNums([-1, 0, 0, 1]);
          g = M().polyFromNums([-1, 1]);
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

  // —— §4 欧几里得（账本 KaTeX） ——
  function mountEuclid(root) {
    let f = M().polyFromNums([-1, 0, 0, 0, 1]);
    let g = M().polyFromNums([-1, 0, 0, 1]);
    let steps = M().euclidSteps(f, g);
    let idx = 0;

    function ledgerLine(s, i) {
      if (s.r == null && s.q == null) {
        return `<div class="${i === idx ? "is-current" : ""}">${i + 1}. ${s.note} · ${tex(M().formatPolyTex(s.a))}${s.b && !M().isZeroPoly(s.b) ? "，" + tex(M().formatPolyTex(s.b)) : ""}</div>`;
      }
      if (s.r != null) {
        return `<div class="${i === idx ? "is-current" : ""}">${i + 1}. ${tex(M().formatPolyTex(s.a))} = (${tex(M().formatPolyTex(s.q))})(${tex(M().formatPolyTex(s.b))}) + (${tex(M().formatPolyTex(s.r))})</div>`;
      }
      return `<div class="${i === idx ? "is-current" : ""}">${i + 1}. ${s.note}</div>`;
    }

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
      root.querySelector("[data-ledger]").innerHTML = steps.map(ledgerLine).join("");
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
    el.innerHTML = `
      <h2>先指定系数来自哪里</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">多项式的系数不是“随便一堆数字”，而是来自某个对四则运算封闭的集合——数域。教材把数域定义为复数域的子域：含 0 与 1，对加、减、乘封闭，并对每个非零元的除法封闭。集合更大不等于自动封闭；封闭性必须单独检验。后面所有“有没有根、能不能分解”的结论，都要先写清系数所在的数域。</p>
        <div class="operation-map">
          <div class="operation-map-main">${display("\\mathbb{Q}\\subset\\mathbb{Q}(\\sqrt{2})\\subset\\mathbb{R}\\subset\\mathbb{C}")}</div>
          <dl class="lesson-meta-list">
            <div><dt>四则门</dt><dd>加、减、乘、非零除法四门全过，才称为数域。</dd></div>
            <div><dt>常见数域</dt><dd>${tex("\\mathbb{Q}")}、${tex("\\mathbb{R}")}、${tex("\\mathbb{C}")} 与 ${tex("\\mathbb{Q}(\\sqrt{2})")}=\\{a+b\\sqrt{2}\\}。</dd></div>
            <div><dt>典型反例</dt><dd>${tex("\\mathbb{Z}")} 对除法不封闭；正实数集缺 0 与负元。</dd></div>
            <div><dt>包含关系</dt><dd>上式建立扩张直觉，不枚举全部子域。</dd></div>
          </dl>
        </div>
        <div class="definition-stack">
          <article class="definition-row"><strong>数域定义</strong><p>复数域 ${tex("\\mathbb{C}")} 的子域 ${tex("F")}：${tex("0,1\\in F")}，对加、减、乘封闭，且对任意 ${tex("a\\in F\\setminus\\{0\\}")} 有 ${tex("a^{-1}\\in F")}。除法只对非零元提出要求。</p></article>
          <article class="definition-row"><strong>ℤ 不是数域</strong><p>整数对加、减、乘封闭，但 ${tex("1/2\\notin\\mathbb{Z}")}。只要有一个非零元的倒数跑出集合，就不是数域。这是最常见的反例，后面写 ${tex("\\mathbb{Z}[x]")} 时要换另一套语言。</p></article>
          <article class="definition-row"><strong>二次扩张 ℚ(√2)</strong><p>元素写成 ${tex("a+b\\sqrt{2}")}（${tex("a,b\\in\\mathbb{Q}")}）。乘法按 ${tex("\\sqrt{2}^2=2")} 展开；求逆时对分母有理化，结果仍是同形。因此它比 ${tex("\\mathbb{Q}")} 大，但仍是数域。</p></article>
          <article class="definition-row"><strong>系数域改变命运</strong><p>同一表达式 ${tex("x^2-2")}：在 ${tex("\\mathbb{Q}[x]")} 中不可约（无有理根且二次），在 ${tex("\\mathbb{R}[x]")} 中可分解为 ${tex("(x-\\sqrt{2})(x+\\sqrt{2})")}。系数含 ${tex("i")} 的多项式不属于 ${tex("\\mathbb{R}[x]")}。</p></article>
        </div>
        <div class="lesson-card-grid">
          <article class="lesson-card"><span class="lesson-card-kicker">检验顺序</span><h3>先看 0、1 与逆元</h3><p>缺少加法单位元或加法逆元的集合（如正实数）立刻出局；再查非零除法是否封闭。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">包含 ≠ 封闭</span><h3>更大集合仍可能失败</h3><p>集合包含只说明元素更多，不保证运算结果仍在集合内。封闭性要按运算逐条验证。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">为分解埋线</span><h3>同一式，不同叶</h3><p>不可约性依赖系数域。后面因式树切换 ℚ/ℝ/ℂ 时，先确认当前镜头对准哪一个域。</p></article>
        </div>
        <div class="lesson-reading-note"><strong>这一节的核心</strong><p>写多项式之前先写系数来自 ${tex("F")}。检验数域时抓住“非零除法”这一门；反例用 ${tex("\\mathbb{Z}")} 与正实数。包含链 ${tex("\\mathbb{Q}\\subset\\cdots\\subset\\mathbb{C}")} 只给扩张直觉。下一节把多项式本身建成有位置的系数对象。</p></div>
      </div>`;
  }

  function formal2(el) {
    if (!el) return;
    el.innerHTML = `
      <h2>形式多项式与系数带</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">一元多项式首先是形式对象：在幂基 ${tex("1,x,x^2,\\ldots")} 下的有限系数序列，系数取自指定数域 ${tex("F")}。图像只是其中一个观察窗口，不能代替系数位置。内部的零系数保留位置；尾部的零系数在规范化时删掉。加法按同次对齐，乘法是卷积配对，次数公式在非零时精确成立。</p>
        <div class="operation-map">
          <div class="operation-map-main">${display("f(x)=a_0+a_1x+\\cdots+a_nx^n\\quad\\longleftrightarrow\\quad[a_0,a_1,\\ldots,a_n]")}</div>
          <dl class="lesson-meta-list">
            <div><dt>系数带</dt><dd>从低次到高次排列；位置就是次数下标。</dd></div>
            <div><dt>次数</dt><dd>非零时取最高非零系数下标；零多项式单独处理。</dd></div>
            <div><dt>加法</dt><dd>同次位置相加；首项可抵消，次数可能下降。</dd></div>
            <div><dt>乘法</dt><dd>${tex("i")} 与 ${tex("j")} 贡献到 ${tex("i+j")}；${tex("\\deg(fg)=\\deg f+\\deg g")}（非零）。</dd></div>
          </dl>
        </div>
        <div class="definition-stack">
          <article class="definition-row"><strong>形式与相等</strong><p>${tex("F[x]")} 中的多项式由系数序列唯一确定。两个多项式相等当且仅当所有同次系数相等。中间的零不能随便丢掉：${tex("[2,-1,0,3]")} 与 ${tex("[2,-1,3]")} 表示不同对象。</p></article>
          <article class="definition-row"><strong>次数规则</strong><p>非零多项式的次数是最高非零系数的下标。零多项式不赋予普通整数次数，计算时单独分支。加法满足 ${tex("\\deg(f+g)\\le\\max(\\deg f,\\deg g)")}，等号在首项不抵消时成立。</p></article>
          <article class="definition-row"><strong>乘法卷积</strong><p>乘积 ${tex("x^{k}")} 的系数是所有 ${tex("a_i b_j")}（${tex("i+j=k")}）之和。非零时 ${tex("\\deg(fg)=\\deg f+\\deg g")}；首项系数是两边首项之积。指定某一项时，要列出全部配对再求和。</p></article>
          <article class="definition-row"><strong>图像只是窗口</strong><p>固定相机下画出的曲线帮助直觉，但代数运算以系数带为准。抵消、零多项式、次数变化都发生在系数层，而不是像素层。</p></article>
        </div>
        <div class="lesson-card-grid">
          <article class="lesson-card"><span class="lesson-card-kicker">读写</span><h3>先写系数带来源</h3><p>例：${tex("2-x+3x^3")} 对应 ${tex("[2,-1,0,3]")}。先对齐位置，再谈运算与图像。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">抵消</span><h3>加法可降低次数</h3><p>两边三次项相反时，和的次数严格小于两边最大值。这是后续除法与欧几里得中次数下降的原型。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">配对</span><h3>乘积一项多来源</h3><p>${tex("x^3")} 系数来自 ${tex("(0,3),(1,2),(2,1),(3,0)")} 等对，不能只看两边三次项之积。</p></article>
        </div>
        <div class="lesson-reading-note"><strong>这一节的核心</strong><p>把多项式当成有位置的有限坐标。内部零保留，尾部零规范化；加法对齐、乘法卷积；次数公式在非零情形精确。下一节用同一套系数语言做带余除法与整除判定。</p></div>
      </div>`;
  }

  function formal3(el) {
    if (!el) return;
    el.innerHTML = `
      <h2>带余除法与整除</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">整数除法里的“商和余数”迁移到多项式，写成 ${tex("f=qg+r")}，其中余式要么为零，要么次数严格低于除式。算法每一步用当前余式首项除以除式首项，得到商的下一项，再从余式中减去对应倍数，保证余式次数严格下降，因此必然有限步终止。整除要求余式精确为零，不允许“差不多为零”。</p>
        <div class="operation-map">
          <div class="operation-map-main">${display("f=qg+r,\\quad r=0\\ \\text{或}\\ \\deg r<\\deg g")}</div>
          <dl class="lesson-meta-list">
            <div><dt>整除</dt><dd>${tex("g\\mid f")} 当且仅当存在 ${tex("q")} 使 ${tex("f=qg")}（${tex("r=0")}）。</dd></div>
            <div><dt>唯一性</dt><dd>除式非零时，商与余式唯一。</dd></div>
            <div><dt>首项消去</dt><dd>每步消掉当前最高次项，次数下降。</dd></div>
            <div><dt>相伴</dt><dd>非零常数倍互相整除；后续 gcd 常取首一。</dd></div>
          </dl>
        </div>
        <div class="definition-stack">
          <article class="definition-row"><strong>带余除法</strong><p>设 ${tex("g\\ne 0")}。存在唯一的 ${tex("q,r")} 使 ${tex("f=qg+r")}，且 ${tex("r=0")} 或 ${tex("\\deg r<\\deg g")}。证明构造性：反复做首项相除并相减，次数构成严格下降的非负整数列。</p></article>
          <article class="definition-row"><strong>整除与精确零</strong><p>${tex("g\\mid f")} 的判定是余式是否精确为零，而不是图像是否“贴住”或数值是否很小。计算中用精确有理系数，避免浮点误判。</p></article>
          <article class="definition-row"><strong>单位与相伴</strong><p>数域中的非零常数称为单位。若 ${tex("f=c g")} 且 ${tex("c\\ne 0")}，则 ${tex("f")} 与 ${tex("g")} 相伴：互相整除。最大公因式在相伴意义下唯一，教材统一取首一代表。</p></article>
          <article class="definition-row"><strong>例：x⁴−1 除以 x²+x+1</strong><p>商 ${tex("x^2-x")}，余式 ${tex("x-1")}\\ne 0，故不整除。每一步只消最高次：先 ${tex("x^2")}，再 ${tex("-x")}，余式次数 1 已低于 2，停止。</p></article>
        </div>
        <div class="lesson-card-grid">
          <article class="lesson-card"><span class="lesson-card-kicker">算法</span><h3>看当前最高次</h3><p>不要一次扫完全部项。每一步只计算“余式首项 ÷ 除式首项”，乘回后相减。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">终止</span><h3>次数严格下降</h3><p>余式次数是非负整数且每步变小，故算法不能无限进行。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">判定</span><h3>整除看 r=0</h3><p>状态灯只在余式精确为零时亮“整除”；有非零余式就是不整除。</p></article>
        </div>
        <div class="lesson-reading-note"><strong>这一节的核心</strong><p>记住 ${tex("f=qg+r")} 与余式次数限制；整除等价于 ${tex("r=0")}；相伴用非零常数倍描述。下一节把除法嵌进欧几里得算法，求首一最大公因式。</p></div>
      </div>`;
  }

  function formal4(el) {
    if (!el) return;
    el.innerHTML = `
      <h2>欧几里得算法与 Bézout</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">两个多项式的最大公因式，是同时整除二者、又被任何公因式整除的多项式。在非零常数倍意义下它唯一，页面统一取首一形式。欧几里得算法反复使用带余除法：${tex("\\gcd(f,g)=\\gcd(g,r)")}，其中 ${tex("f=qg+r")}。余式次数严格下降保证终止；最后非零余式首一化即为答案。互素时 ${tex("\\gcd=1")}，并有 Bézout 等式。</p>
        <div class="operation-map">
          <div class="operation-map-main">${display("\\gcd(f,g)=\\gcd(g,r),\\quad f=qg+r")}</div>
          <dl class="lesson-meta-list">
            <div><dt>替换原理</dt><dd>同时整除 ${tex("f,g")} 等价于同时整除 ${tex("g,r")}。</dd></div>
            <div><dt>终止</dt><dd>余式次数下降的非负整数列必然停止。</dd></div>
            <div><dt>首一规范</dt><dd>最后非零余式除以首项系数，消除常数倍歧义。</dd></div>
            <div><dt>Bézout</dt><dd>存在 ${tex("s,t")} 使 ${tex("d=sf+tg")}；互素时可得 1。</dd></div>
          </dl>
        </div>
        <div class="definition-stack">
          <article class="definition-row"><strong>公因式与最大公因式</strong><p>${tex("d")} 是公因式，若 ${tex("d\\mid f")} 且 ${tex("d\\mid g")}。若 ${tex("d")} 又被任意公因式整除，则称为最大公因式。首一化后记作 ${tex("\\gcd(f,g)")}。</p></article>
          <article class="definition-row"><strong>算法步骤</strong><p>对 ${tex("(A,B)=(f,g)")} 做除法得 ${tex("A=qB+r")}，用 ${tex("(B,r)")} 替换 ${tex("(A,B)")}，直到余式为零。此时当前 ${tex("A")} 的首一化就是 gcd。例：${tex("\\gcd(x^4-1,x^3-1)=x-1")}。</p></article>
          <article class="definition-row"><strong>Bézout 等式</strong><p>回溯欧几里得过程，可把 gcd 写成 ${tex("sf+tg")} 的组合。互素时存在 ${tex("s,t")} 使 ${tex("sf+tg=1")}。这在证明“无公共根”时特别有用：若有公共根 ${tex("a")}，则 ${tex("1=0")} 矛盾。</p></article>
          <article class="definition-row"><strong>互素判定</strong><p>${tex("\\gcd(f,g)=1")} 称为互素。算法输出首一 1 时点亮互素状态；否则读出具体的非平凡公因式。</p></article>
        </div>
        <div class="lesson-card-grid">
          <article class="lesson-card"><span class="lesson-card-kicker">瀑布</span><h3>次数一层层掉</h3><p>每一步余式次数变小，像瀑布下坠。交互里用步骤标签读当前位置。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">首一</span><h3>去掉常数倍噪声</h3><p>最后非零余式可能不是首一；除以首项后才与教材答案对齐。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">互素</span><h3>gcd=1 的意义</h3><p>互素不代表没有各自的因式，而代表没有非常数的公共因式。</p></article>
        </div>
        <div class="lesson-reading-note"><strong>这一节的核心</strong><p>gcd 取首一；算法就是反复 ${tex("\\gcd(f,g)\\to\\gcd(g,r)")}；终止靠次数下降；Bézout 把 gcd 写成线性组合。下一节进入因式分解的存在与唯一，数域切换会改变不可约叶节点。</p></div>
      </div>`;
  }

  function interactive1(el) {
    if (!el) return;
    el.innerHTML = `<h2>交互实验</h2>
      <div class="ch1-lab">
        <div class="ch1-lab-head"><h3>数域透镜</h3><p>切换集合，检查四则运算门是否全部通过，并对照多项式系数在当前域是否合法。嵌套层显示常用扩张链。</p></div>
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
            <div class="ch1-muted" style="margin-bottom:8px">当前域下的系数合法性</div>
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
        <div class="ch1-lab-head"><h3>系数带工作台</h3><p>编辑两个多项式的系数，观察加法/乘法、次数变化与固定相机下的结果图像。世界坐标锁定，点击不会放大。</p></div>
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
        <div class="ch1-lab-head"><h3>多项式除法阶梯</h3><p>单步查看首项消去；账本用 KaTeX 显示商项与余式。余式次数必须严格下降。</p></div>
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
            <div class="ch1-muted" data-elim-detail></div>
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
        <div class="ch1-lab-head"><h3>欧几里得瀑布</h3><p>逐步显示 A、B、余式链条；账本用 KaTeX。最后非零余式首一化即为最大公因式。</p></div>
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
