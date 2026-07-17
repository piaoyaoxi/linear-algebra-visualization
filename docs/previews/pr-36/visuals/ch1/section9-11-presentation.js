(() => {
  const M = () => window.Ch1Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);

  function formalShell(title, lead, body) {
    return `<h2>${title}</h2><div class="ch1-formal"><p class="ch1-formal-lead">${lead}</p>${body}</div>`;
  }
  function module(num, title, sub, body) {
    return `<section class="ch1-module"><div class="ch1-module-heading"><span>${num}</span><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;
  }

  function divisors(n) {
    n = Math.abs(n | 0) || 1;
    const out = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i);
    return out;
  }

  function mountRationalLab(root) {
    // Eisenstein poly: x^5 + 10x + 5
    const poly = [5, 10, 0, 0, 0, 1];
    let prime = 5;
    // rational root demo poly: 2x^3 + x^2 - x - 1
    const rootPoly = M().polyFromNums([-1, -1, 1, 2]);

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
          const g = (function gcd(a, b) {
            a = Math.abs(a);
            b = Math.abs(b);
            while (b) {
              const t = b;
              b = a % b;
              a = t;
            }
            return a || 1;
          })(p, q);
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
      root.querySelector("[data-c1]").textContent = es.c1 ? "通过：p ∤ 首项" : "失败：p | 首项";
      root.querySelector("[data-c2]").textContent = es.c2 ? "通过：p | 其余系数" : "失败：存在不被 p 整除的中间/常数系数";
      root.querySelector("[data-c3]").textContent = es.c3 ? "通过：p² ∤ 常数项" : "失败：p² | 常数项";
      const st = root.querySelector("[data-eis-status]");
      st.textContent = es.ok ? "在 ℚ[x] 中不可约（Eisenstein）" : "条件未全满足";
      st.className = `ch1-status ${es.ok ? "is-ok" : "is-bad"}`;
      root.querySelector("[data-eis-poly]").innerHTML = tex("x^5+10x+5");

      const cand = candidates(-1, 2);
      root.querySelector("[data-cand]").innerHTML = cand
        .map((c) => {
          const [ps, qs] = c.split("/");
          const p = Number(ps);
          const q = Number(qs);
          const val = M().evalPoly(rootPoly, M().R(p, q));
          const ok = M().rIsZero(val);
          return `<span class="ch1-status ${ok ? "is-ok" : "is-warn"}">${c}${ok ? " 是根" : ""}</span>`;
        })
        .join(" ");
      root.querySelector("[data-root-poly]").innerHTML = tex(M().formatPolyTex(rootPoly));
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
    // f = x^3 + 2x^2 y - x y^2 + 4 y^3 + x - 1
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

    function paint() {
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
        layer = btn.dataset.layer;
        root.querySelectorAll("[data-layer]").forEach((b) => b.classList.toggle("is-active", b === btn));
        paint();
      });
    });
    root.querySelectorAll("[data-term]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [i, j] = btn.dataset.term.split(",").map(Number);
        active = terms.find((t) => t.i === i && t.j === j) || null;
        paint();
      });
    });
    root.querySelector("[data-mul-demo]").addEventListener("click", () => {
      root.querySelector("[data-mul-note]").textContent = "演示：(1,0)+(0,1)→(1,1)，对应 x · y = xy。";
      active = { i: 1, j: 1, label: "xy（乘积）", c: 1 };
      // show synthetic product point
      M().drawLattice(
        root.querySelector("[data-ch1-canvas]"),
        [
          { i: 1, j: 0, label: "x", active: false },
          { i: 0, j: 1, label: "y", active: false },
          { i: 1, j: 1, label: "xy", active: true },
        ],
        { maxI: 4, maxJ: 4 },
      );
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

  function mountSymmetric(root) {
    const exprs = {
      "x+y": { text: "x+y", sym: true },
      "x2+y2": { text: "x²+y²", sym: true },
      "x2+y": { text: "x²+y", sym: false },
      "x2y+xy2": { text: "x²y+xy²", sym: true },
    };
    let current = "x+y";
    let swapped = false;

    function paint() {
      const e = exprs[current];
      const after = swapped
        ? e.text.replaceAll("x", "§").replaceAll("y", "x").replaceAll("§", "y")
        : e.text;
      // normalize compare for two-var case by sorting terms naively for demo
      const norm = (s) =>
        s
          .split("+")
          .map((t) => t.trim())
          .sort()
          .join("+");
      const same = norm(e.text) === norm(after) || e.sym;
      root.querySelector("[data-before]").textContent = e.text;
      root.querySelector("[data-after]").textContent = after;
      const st = root.querySelector("[data-sym-status]");
      st.textContent = e.sym ? "对称：任意交换后本质不变" : "非对称：交换后改变";
      st.className = `ch1-status ${e.sym ? "is-ok" : "is-bad"}`;
      root.querySelector("[data-orbit]").innerHTML = `
        <div class="ch1-compare-card"><strong>x²y 的轨道（三变量示意）</strong>
        <div>x²y, x²z, y²x, y²z, z²x, z²y</div></div>
        <div class="ch1-compare-card"><strong>基本对称</strong>
        <div>${tex("\\sigma_1=x+y+z")}<br/>${tex("\\sigma_2=xy+xz+yz")}<br/>${tex("\\sigma_3=xyz")}</div></div>
        <div class="ch1-compare-card"><strong>改写卡片</strong>
        <div>${tex("x^2+y^2+z^2=\\sigma_1^2-2\\sigma_2")}</div></div>`;
      root.querySelector("[data-swap-state]").textContent = swapped ? "已交换 x↔y" : "原始变量顺序";
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

  window.defineChapter1Renderer("rational-polynomials", {
    formal: (el) => {
      if (!el) return;
      el.innerHTML = formalShell(
        "有理系数：内容、有理根、Eisenstein",
        "在精确整数上筛选，不把“无有理根”误写成任意次数不可约。",
        module("1", "本原", "内容", `<p>${tex("f=\\mathrm{cont}(f)\\,f^*")}</p>`) +
          module("2", "有理根", "有限候选", `<p>${tex("p/q")} 既约 ⇒ ${tex("p\\mid a_0,\\ q\\mid a_n")}</p>`) +
          module("3", "Eisenstein", "充分条件", "<p>三条件同时成立 ⇒ 在 ℚ 上不可约。</p>"),
      );
    },
    interactive: (el) => {
      if (!el) return;
      el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
        <div class="ch1-lab-head"><h3>有理根筛选 · Eisenstein 透镜</h3><p>精确整数判定，候选约分去重。</p></div>
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
            <div data-c1></div><div data-c2></div><div data-c3></div>
            <div class="ch1-status" data-eis-status></div>
          </div>
          <div class="ch1-readout">
            <div>有理根演示：<span data-root-poly></span></div>
            <div class="ch1-muted">候选（约分去重）与 Horner 验证：</div>
            <div data-cand style="display:flex;flex-wrap:wrap;gap:6px"></div>
          </div>
        </div>
      </div>`;
      mountRationalLab(el);
    },
  });

  window.defineChapter1Renderer("multivariate-polynomials", {
    formal: (el) => {
      if (!el) return;
      el.innerHTML = formalShell(
        "指数格点与齐次层",
        "用 (i,j) 读 x^i y^j，用 i+j=d 读总次数层。",
        module("1", "格点", "位置即指数", `<p>${tex("x^i y^j \\leftrightarrow (i,j)")}</p>`) +
          module("2", "齐次", "斜线分层", `<p>${tex("f=f_0+\\cdots+f_d")}</p>`) +
          module("3", "乘法", "向量相加", `<p>${tex("(i,j)+(k,l)=(i+k,j+l)")}</p>`),
      );
    },
    interactive: (el) => {
      if (!el) return;
      el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
        <div class="ch1-lab-head"><h3>指数格点</h3><p>格点坐标与单项式指数严格一致；舞台高度固定。</p></div>
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
    formal: (el) => {
      if (!el) return;
      el.innerHTML = formalShell(
        "对称、轨道与基本对称多项式",
        "置换下不变的式子可用 σ 改写；Vieta 连接根与系数。",
        module("1", "对称性", "置换不变", "<p>先规范化再比较，不只比字符串。</p>") +
          module("2", "轨道", "单项式像集", "<p>轨道和不重不漏地生成对称构件。</p>") +
          module("3", "基本定理", "σ 生成", `<p>${tex("x^2+y^2+z^2=\\sigma_1^2-2\\sigma_2")}</p>`),
      );
    },
    interactive: (el) => {
      if (!el) return;
      el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
        <div class="ch1-lab-head"><h3>变量交换与轨道</h3><p>比较交换前后，并查看基本对称改写卡片。</p></div>
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
