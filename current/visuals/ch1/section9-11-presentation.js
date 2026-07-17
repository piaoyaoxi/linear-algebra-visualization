(() => {
  const M = () => window.Ch1Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);
  const display = (s) => (window.texDisplay ? window.texDisplay(s) : s);

  function divisors(n) {
    n = Math.abs(n | 0) || 1;
    const out = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i);
    return out;
  }

  function gcdInt(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }

  function mountRationalLab(root) {
    const poly = [5, 10, 0, 0, 0, 1]; // x^5 + 10x + 5
    let prime = 5;
    const rootPoly = M().polyFromNums([-1, -1, 1, 2]); // 2x^3 + x^2 - x - 1

    function checkEisenstein(coeffs, p) {
      const n = coeffs.length - 1;
      const lead = coeffs[n];
      const constant = coeffs[0];
      const c1 = lead % p !== 0;
      const c2 = coeffs.slice(0, n).every((c) => c % p === 0);
      const c3 = constant % (p * p) !== 0;
      return { c1, c2, c3, ok: c1 && c2 && c3 };
    }

    function candidates(a0, an) {
      const num = divisors(a0);
      const den = divisors(an);
      const set = new Set();
      num.forEach((p) => {
        den.forEach((q) => {
          const g = gcdInt(p, q);
          const pp = p / g;
          const qq = q / g;
          set.add(`${pp}/${qq}`);
          set.add(`${-pp}/${qq}`);
        });
      });
      return [...set];
    }

    function paint() {
      const es = checkEisenstein(poly, prime);
      root.querySelector("[data-prime]").textContent = String(prime);
      root.querySelector("[data-c1]").innerHTML = es.c1
        ? `<span class="ch1-status is-ok">条件 1 通过</span>：${tex("p\\nmid")} 首项系数`
        : `<span class="ch1-status is-bad">条件 1 失败</span>：${tex("p\\mid")} 首项`;
      root.querySelector("[data-c2]").innerHTML = es.c2
        ? `<span class="ch1-status is-ok">条件 2 通过</span>：${tex("p")} 整除其余所有系数`
        : `<span class="ch1-status is-bad">条件 2 失败</span>：存在不被 p 整除的中间/常数系数`;
      root.querySelector("[data-c3]").innerHTML = es.c3
        ? `<span class="ch1-status is-ok">条件 3 通过</span>：${tex("p^2\\nmid")} 常数项`
        : `<span class="ch1-status is-bad">条件 3 失败</span>：${tex("p^2\\mid")} 常数项`;
      const st = root.querySelector("[data-eis-status]");
      st.textContent = es.ok ? "三条件全满足 ⇒ 在 ℚ[x] 中不可约（Eisenstein）" : "条件未全满足（充分条件不成立）";
      st.className = `ch1-status ${es.ok ? "is-ok" : "is-bad"}`;
      root.querySelector("[data-eis-poly]").innerHTML = tex("x^5+10x+5");

      const cand = candidates(1, 2); // |a0|=1, an=2 for -1 + ... + 2x^3
      root.querySelector("[data-cand]").innerHTML = cand
        .map((c) => {
          const [ps, qs] = c.split("/");
          const p = Number(ps);
          const q = Number(qs);
          const val = M().evalPoly(rootPoly, M().R(p, q));
          const ok = M().rIsZero(val);
          const label = q === 1 ? String(p) : `${p}/${q}`;
          return `<span class="ch1-status ${ok ? "is-ok" : "is-warn"}">${tex(q === 1 ? String(p) : `\\dfrac{${p}}{${q}}`)}${ok ? " 是根" : ""}</span>`;
        })
        .join(" ");
      root.querySelector("[data-root-poly]").innerHTML = tex(M().formatPolyTex(rootPoly));
      root.querySelector("[data-cand-count]").textContent = `候选 ${cand.length} 个（约分去重，含正负）`;
    }

    root.querySelectorAll("[data-prime-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        prime = Number(btn.dataset.primeBtn);
        root.querySelectorAll("[data-prime-btn]").forEach((b) => b.classList.toggle("is-active", b === btn));
        paint();
      });
    });
    paint();
  }

  function mountLattice(root) {
    const terms = [
      { i: 3, j: 0, c: 1, label: "x³" },
      { i: 2, j: 1, c: 2, label: "2x²y" },
      { i: 1, j: 2, c: -1, label: "−xy²" },
      { i: 0, j: 3, c: 4, label: "4y³" },
      { i: 1, j: 0, c: 1, label: "x" },
      { i: 0, j: 0, c: -1, label: "−1" },
    ];
    let layer = "all";
    let active = null;
    let mulMode = false;

    function paint() {
      if (mulMode) return;
      const filtered = terms
        .filter((t) => (layer === "all" ? true : t.i + t.j === Number(layer)))
        .map((t) => ({ ...t, active: active && active.i === t.i && active.j === t.j }));
      M().drawLattice(root.querySelector("[data-ch1-canvas]"), filtered, { maxI: 4, maxJ: 4 });
      const layers = [0, 1, 2, 3].map((d) => {
        const items = terms.filter((t) => t.i + t.j === d);
        return `<div class="ch1-compare-card"><strong>总次数 ${d}</strong><div>${items.length ? items.map((t) => t.label).join(" + ") : "（空）"}</div></div>`;
      });
      root.querySelector("[data-layers]").innerHTML = layers.join("");
      root.querySelector("[data-total]").textContent = "总次数 = 3";
      root.querySelector("[data-active]").textContent = active
        ? `选中格点 (${active.i},${active.j}) → ${active.label}`
        : "点击预设高亮格点";
    }

    root.querySelectorAll("[data-layer]").forEach((btn) => {
      btn.addEventListener("click", () => {
        mulMode = false;
        layer = btn.dataset.layer;
        root.querySelectorAll("[data-layer]").forEach((b) => b.classList.toggle("is-active", b === btn));
        paint();
      });
    });
    root.querySelectorAll("[data-term]").forEach((btn) => {
      btn.addEventListener("click", () => {
        mulMode = false;
        const [i, j] = btn.dataset.term.split(",").map(Number);
        active = terms.find((t) => t.i === i && t.j === j) || null;
        paint();
      });
    });
    root.querySelector("[data-mul-demo]").addEventListener("click", () => {
      mulMode = true;
      root.querySelector("[data-mul-note]").innerHTML = `演示：${tex("(1,0)+(0,1)=(1,1)")}，对应 ${tex("x\\cdot y=xy")}。`;
      active = { i: 1, j: 1, label: "xy（乘积）", c: 1 };
      M().drawLattice(
        root.querySelector("[data-ch1-canvas]"),
        [
          { i: 1, j: 0, label: "x", active: false },
          { i: 0, j: 1, label: "y", active: false },
          { i: 1, j: 1, label: "xy", active: true },
        ],
        { maxI: 4, maxJ: 4 },
      );
      root.querySelector("[data-active]").textContent = "乘法演示：x 与 y 的指数向量相加 → xy";
    });
    window.addEventListener(
      "resize",
      () => {
        if (document.body.contains(root)) {
          if (mulMode) {
            root.querySelector("[data-mul-demo]").click();
          } else paint();
        }
      },
      { passive: true },
    );
    paint();
  }

  function mountSymmetric(root) {
    const exprs = {
      "x+y": { text: "x+y", tex: "x+y", sym: true },
      "x2+y2": { text: "x²+y²", tex: "x^2+y^2", sym: true },
      "x2+y": { text: "x²+y", tex: "x^2+y", sym: false },
      "x2y+xy2": { text: "x²y+xy²", tex: "x^2y+xy^2", sym: true },
    };
    let current = "x+y";
    let swapped = false;

    function swapVars(s) {
      return s.replaceAll("x", "§").replaceAll("y", "x").replaceAll("§", "y");
    }

    function paint() {
      const e = exprs[current];
      const afterTex = swapped ? swapVars(e.tex) : e.tex;
      const afterText = swapped ? swapVars(e.text) : e.text;
      root.querySelector("[data-before]").innerHTML = tex(e.tex);
      root.querySelector("[data-after]").innerHTML = tex(afterTex);
      const st = root.querySelector("[data-sym-status]");
      st.textContent = e.sym ? "对称：任意交换后本质不变" : "非对称：交换后改变";
      st.className = `ch1-status ${e.sym ? "is-ok" : "is-bad"}`;
      root.querySelector("[data-orbit]").innerHTML = `
        <div class="ch1-compare-card"><strong>x²y 的轨道（三变量示意）</strong>
        <div>${tex("x^2y")}, ${tex("x^2z")}, ${tex("y^2x")}, ${tex("y^2z")}, ${tex("z^2x")}, ${tex("z^2y")}</div></div>
        <div class="ch1-compare-card"><strong>基本对称多项式</strong>
        <div>${tex("\\sigma_1=x+y+z")}<br/>${tex("\\sigma_2=xy+xz+yz")}<br/>${tex("\\sigma_3=xyz")}</div></div>
        <div class="ch1-compare-card"><strong>σ 改写卡片</strong>
        <div>${tex("x^2+y^2+z^2=\\sigma_1^2-2\\sigma_2")}<br/>${tex("xy(x+y)+\\cdots")} 可进一步用 σ 表达</div></div>`;
      root.querySelector("[data-swap-state]").textContent = swapped
        ? `已交换 x↔y · 显示为 ${afterText}`
        : "原始变量顺序";
    }

    root.querySelectorAll("[data-expr]").forEach((btn) => {
      btn.addEventListener("click", () => {
        current = btn.dataset.expr;
        swapped = false;
        root.querySelectorAll("[data-expr]").forEach((b) => b.classList.toggle("is-active", b === btn));
        paint();
      });
    });
    root.querySelector("[data-swap]").addEventListener("click", () => {
      swapped = !swapped;
      paint();
    });
    paint();
  }

  function formal9(el) {
    if (!el) return;
    el.innerHTML = `
      <h2>有理系数：内容、有理根、Eisenstein</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">有理系数多项式可以先清分母，再提取内容，转到本原整系数多项式。Gauss 引理保证本原多项式的乘积仍本原，从而把 ${tex("\\mathbb{Q}[x]")} 上的分解问题与 ${tex("\\mathbb{Z}[x]")} 对齐。有理根定理给出有限个候选 ${tex("p/q")}；Eisenstein 判别给出在 ℚ 上不可约的充分条件。注意：“无有理根”不能直接推出任意次数不可约——二次、三次才可结合次数使用这一捷径。</p>
        <div class="operation-map">
          <div class="operation-map-main">${display("f=\\mathrm{cont}(f)\\,f^*,\\quad f^*\\ \\text{本原}")}</div>
          <dl class="lesson-meta-list">
            <div><dt>内容</dt><dd>整系数的最大公因数；本原部分内容为 ±1。</dd></div>
            <div><dt>Gauss</dt><dd>两本原多项式之积仍本原。</dd></div>
            <div><dt>有理根</dt><dd>${tex("p/q")} 既约 ⇒ ${tex("p\\mid a_0")}，${tex("q\\mid a_n")}。</dd></div>
            <div><dt>Eisenstein</dt><dd>素数 p：不整除首项，整除其余，p² 不整除常数项。</dd></div>
          </dl>
        </div>
        <div class="definition-stack">
          <article class="definition-row"><strong>内容与本原</strong><p>整系数多项式 f 的内容 cont(f) 是系数的最大公因数（可取正）。${tex("f=\\mathrm{cont}(f)\\,f^*")}，其中 ${tex("f^*")} 本原。有理系数先乘公分母变成整系数，再提内容。</p></article>
          <article class="definition-row"><strong>有理根定理</strong><p>若既约分数 ${tex("p/q")} 是整系数多项式的根，则 p 整除常数项，q 整除首项系数。候选有限：枚举后约分去重，再用 Horner 精确验证。例：${tex("2x^3+x^2-x-1")} 的候选来自 ±1 与 ±1,±2 的商。</p></article>
          <article class="definition-row"><strong>Eisenstein 三条件</strong><p>存在素数 p 使得：(1) p 不整除首项；(2) p 整除其余每个系数；(3) p² 不整除常数项。则 f 在 ${tex("\\mathbb{Q}[x]")} 中不可约。这是充分条件，不满足时仍可能不可约。</p></article>
          <article class="definition-row"><strong>常见误用</strong><p>四次及以上无有理根，仍可能因式分解为两个二次。不要把“筛完有理根”写成“任意次数不可约”。二次、三次因次数限制，无有理根即不可约。</p></article>
        </div>
        <div class="lesson-card-grid">
          <article class="lesson-card"><span class="lesson-card-kicker">筛选</span><h3>候选先约分</h3><p>同一有理数多种写法只保留既约代表，再 Horner 判定是否为根。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">透镜</span><h3>切换素数 p</h3><p>对 ${tex("x^5+10x+5")} 试 p=5：三条件全过 ⇒ 不可约。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">精确</span><h3>整数算术</h3><p>条件判定用整数取模，不用浮点近似，避免误判整除。</p></article>
        </div>
        <div class="lesson-reading-note"><strong>这一节的核心</strong><p>本原 + Gauss 连接 ℚ 与 ℤ；有理根有限候选；Eisenstein 三条件是充分不可约判据。下一节进入多元：用指数格点组织项与齐次层。</p></div>
      </div>`;
  }

  function formal10(el) {
    if (!el) return;
    el.innerHTML = `
      <h2>指数格点与齐次层</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">多个变量出现以后，单项式 ${tex("x^i y^j")} 对应平面格点 ${tex("(i,j)")}。总次数是 ${tex("i+j")}；斜线 ${tex("i+j=d")} 上的项组成齐次层。任意多项式可按总次数分层 ${tex("f=f_0+f_1+\\cdots+f_d")}。乘法对应指数向量相加，同格点上的系数再聚合。格点比一长串公式更能看清“哪些项存在、次数如何相加”。</p>
        <div class="operation-map">
          <div class="operation-map-main">${display("x^i y^j\\ \\longleftrightarrow\\ (i,j),\\quad (i,j)+(k,l)=(i+k,j+l)")}</div>
          <dl class="lesson-meta-list">
            <div><dt>格点</dt><dd>横轴 x 指数，纵轴 y 指数；位置即幂次。</dd></div>
            <div><dt>总次数</dt><dd>${tex("\\deg(x^i y^j)=i+j")}；多项式取最高项。</dd></div>
            <div><dt>齐次</dt><dd>同层项总次数相同；可按层过滤显示。</dd></div>
            <div><dt>乘法</dt><dd>指数向量相加，同点系数相加。</dd></div>
          </dl>
        </div>
        <div class="definition-stack">
          <article class="definition-row"><strong>单项式与格点</strong><p>二元情形把每个非零项画在整数格点上。例如 ${tex("2x^2y")} 在 (2,1)。零系数的点不画，或显示为空。读图时先报坐标，再报系数。</p></article>
          <article class="definition-row"><strong>齐次分层</strong><p>总次数为 d 的齐次元是 ${tex("i+j=d")} 的线性组合。一般多项式是各层之和。过滤某一层时，只点亮该斜线上的项，便于数次数与做齐次运算。</p></article>
          <article class="definition-row"><strong>乘法几何</strong><p>${tex("x\\cdot y")} 对应 ${tex("(1,0)+(0,1)=(1,1)")}。更一般地，两多项式相乘是支撑集的 Minkowski 和，再在重合格点上加系数。演示按钮单独高亮这一几何。</p></article>
          <article class="definition-row"><strong>舞台固定</strong><p>格点画布高度锁定 340px，网格范围固定（如 0…4）。交互只改哪些点亮起，不改坐标系尺度，避免“点一下视野跑掉”。</p></article>
        </div>
        <div class="lesson-card-grid">
          <article class="lesson-card"><span class="lesson-card-kicker">读写</span><h3>坐标 = 指数</h3><p>点 (3,0) 就是 ${tex("x^3")}；点 (0,0) 是常数项。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">分层</span><h3>斜线是齐次</h3><p>层 3：${tex("x^3,\\,x^2y,\\,xy^2,\\,y^3")} 所在的对角线。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">相乘</span><h3>向量加法</h3><p>先各自定位，再平移相加，最后合并同类项。</p></article>
        </div>
        <div class="lesson-reading-note"><strong>这一节的核心</strong><p>格点组织多元项；总次数 = 指数和；乘法 = 向量加。下一节讨论在变量置换下不变的对称多项式，以及基本对称多项式生成一切对称式。</p></div>
      </div>`;
  }

  function formal11(el) {
    if (!el) return;
    el.innerHTML = `
      <h2>对称、轨道与基本对称多项式</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">若多项式在任意变量置换下保持不变（标准化后相同），则称为对称多项式。单项式在置换群作用下生成轨道，轨道上所有像的和给出对称构件。基本对称多项式 ${tex("\\sigma_1,\\ldots,\\sigma_n")} 可以生成全部对称多项式——这就是对称多项式基本定理。根与系数的 Vieta 公式，正是把首一多项式的系数写成根的基本对称多项式。</p>
        <div class="operation-map">
          <div class="operation-map-main">${display("x^2+y^2+z^2=\\sigma_1^2-2\\sigma_2")}</div>
          <dl class="lesson-meta-list">
            <div><dt>对称</dt><dd>任意置换变量后，标准化结果相同。</dd></div>
            <div><dt>轨道</dt><dd>单项式在置换下的全部像；不重不漏。</dd></div>
            <div><dt>基本对称</dt><dd>三变量：${tex("\\sigma_1=x+y+z")}，${tex("\\sigma_2=xy+xz+yz")}，${tex("\\sigma_3=xyz")}。</dd></div>
            <div><dt>Vieta</dt><dd>首一多项式系数与根的 σ 相连。</dd></div>
          </dl>
        </div>
        <div class="definition-stack">
          <article class="definition-row"><strong>对称性检验</strong><p>交换 x 与 y 后，比较标准化结果是否相同。${tex("x+y")}、${tex("x^2+y^2")} 对称；${tex("x^2+y")} 不对称。不要只比字符串：项顺序可变，应先整理再比。</p></article>
          <article class="definition-row"><strong>轨道和</strong><p>从 ${tex("x^2y")} 出发，列出所有变量置换得到的像，相加得到对称多项式。轨道要完整：既不重复也不遗漏，否则改写会缺项或多项。</p></article>
          <article class="definition-row"><strong>σ 改写</strong><p>基本定理说任何对称多项式都是 σ 的多项式。算法思想：按最高项逐步减去 σ 的合适组合，直至余式为零。例：${tex("x^2+y^2+z^2=\\sigma_1^2-2\\sigma_2")}。</p></article>
          <article class="definition-row"><strong>Vieta 桥梁</strong><p>若 ${tex("(t-x)(t-y)(t-z)=t^3-\\sigma_1 t^2+\\sigma_2 t-\\sigma_3")}，则根与系数通过基本对称多项式相连。这把“对称改写”与解方程、因式分解串起来。</p></article>
        </div>
        <div class="lesson-card-grid">
          <article class="lesson-card"><span class="lesson-card-kicker">交换</span><h3>x↔y 试金石</h3><p>对称式交换后不变；非对称式立刻露馅。交互提供一键交换。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">轨道</span><h3>像集要完整</h3><p>三变量下 ${tex("x^2y")} 有 6 个像；漏一个就会破坏对称性。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">改写</span><h3>落到 σ</h3><p>最终目标是用 σ₁,σ₂,σ₃ 的多项式表达，便于计算与比较。</p></article>
        </div>
        <div class="lesson-reading-note"><strong>这一节的核心</strong><p>对称 = 置换不变；轨道和生成构件；一切对称式可用 σ 改写；Vieta 是系数与根的对称桥梁。第一章多项式部分到此收束：从数域、形式运算到分解、函数与对称结构。</p></div>
      </div>`;
  }

  window.defineChapter1Renderer("rational-polynomials", {
    formal: formal9,
    interactive: (el) => {
      if (!el) return;
      el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
        <div class="ch1-lab-head"><h3>有理根筛选 · Eisenstein 透镜</h3><p>精确整数判定三条件；有理根候选约分去重后用 Horner 验证。</p></div>
        <div class="ch1-controls">
          <button type="button" data-prime-btn="2">p=2</button>
          <button type="button" data-prime-btn="3">p=3</button>
          <button type="button" class="is-active" data-prime-btn="5">p=5</button>
          <button type="button" data-prime-btn="7">p=7</button>
        </div>
        <div class="ch1-lab-grid is-stack">
          <div class="ch1-readout">
            <div>目标多项式 <span data-eis-poly></span></div>
            <div>素数 p = <strong data-prime></strong></div>
            <div data-c1></div>
            <div data-c2></div>
            <div data-c3></div>
            <div class="ch1-status" data-eis-status></div>
          </div>
          <div class="ch1-readout">
            <div>有理根演示：<span data-root-poly></span></div>
            <div class="ch1-muted" data-cand-count></div>
            <div class="ch1-muted">候选（约分去重）与精确验证：</div>
            <div data-cand style="display:flex;flex-wrap:wrap;gap:6px"></div>
          </div>
        </div>
      </div>`;
      mountRationalLab(el);
    },
  });

  window.defineChapter1Renderer("multivariate-polynomials", {
    formal: formal10,
    interactive: (el) => {
      if (!el) return;
      el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
        <div class="ch1-lab-head"><h3>指数格点</h3><p>格点坐标与单项式指数严格一致；舞台高度固定 340px。可按齐次层过滤，或演示乘法向量加法。</p></div>
        <div class="ch1-controls">
          <button type="button" class="is-active" data-layer="all">全部</button>
          <button type="button" data-layer="0">层 0</button>
          <button type="button" data-layer="1">层 1</button>
          <button type="button" data-layer="2">层 2</button>
          <button type="button" data-layer="3">层 3</button>
          <button type="button" data-term="3,0">x³</button>
          <button type="button" data-term="2,1">2x²y</button>
          <button type="button" data-term="0,0">−1</button>
          <button type="button" data-mul-demo>乘法演示</button>
        </div>
        <div class="ch1-lab-grid">
          <div class="ch1-stage"><canvas data-ch1-canvas aria-label="指数格点"></canvas></div>
          <div class="ch1-panel">
            <div class="ch1-readout">
              <div><strong data-total></strong></div>
              <div class="ch1-muted" data-active></div>
              <div class="ch1-muted" data-mul-note>乘法：指数向量相加后在同格点聚合。</div>
            </div>
            <div class="ch1-compare" data-layers></div>
          </div>
        </div>
      </div>`;
      mountLattice(el);
    },
  });

  window.defineChapter1Renderer("symmetric-polynomials", {
    formal: formal11,
    interactive: (el) => {
      if (!el) return;
      el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
        <div class="ch1-lab-head"><h3>变量交换与轨道</h3><p>比较交换前后（KaTeX）；查看轨道、基本对称与 σ 改写卡片。</p></div>
        <div class="ch1-controls">
          <button type="button" class="is-active" data-expr="x+y">x+y</button>
          <button type="button" data-expr="x2+y2">x²+y²</button>
          <button type="button" data-expr="x2+y">x²+y</button>
          <button type="button" data-expr="x2y+xy2">x²y+xy²</button>
          <button type="button" data-swap>交换 x↔y</button>
        </div>
        <div class="ch1-readout">
          <div>交换前：<strong data-before></strong></div>
          <div>交换后：<strong data-after></strong></div>
          <div class="ch1-status" data-sym-status></div>
          <div class="ch1-muted" data-swap-state></div>
        </div>
        <div class="ch1-compare" data-orbit></div>
      </div>`;
      mountSymmetric(el);
    },
  });
})();
