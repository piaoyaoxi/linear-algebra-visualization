(() => {
  const M = () => window.Ch1Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);

  function formalShell(title, lead, body) {
    return `<h2>${title}</h2><div class="ch1-formal"><p class="ch1-formal-lead">${lead}</p>${body}</div>`;
  }
  function module(num, title, sub, body) {
    return `<section class="ch1-module"><div class="ch1-module-heading"><span>${num}</span><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;
  }

  // §5 factor tree by domain
  function mountFactorDomain(root) {
    const data = {
      Q: {
        "x2-2": { title: "x²−2", factors: ["不可约二次 x²−2"], note: "在 ℚ 上无有理根，二次故不可约。" },
        "x2+1": { title: "x²+1", factors: ["不可约二次 x²+1"], note: "在 ℚ、ℝ 均无实根。" },
        "x4-1": { title: "x⁴−1", factors: ["(x−1)", "(x+1)", "(x²+1)"], note: "x²+1 在 ℚ 仍不可约。" },
      },
      R: {
        "x2-2": { title: "x²−2", factors: ["(x−√2)", "(x+√2)"], note: "实根出现，拆成一次因式。" },
        "x2+1": { title: "x²+1", factors: ["不可约二次 x²+1"], note: "无实根，在 ℝ 仍不可约。" },
        "x4-1": { title: "x⁴−1", factors: ["(x−1)", "(x+1)", "(x²+1)"], note: "与 ℚ 相同的实分解终点。" },
      },
      C: {
        "x2-2": { title: "x²−2", factors: ["(x−√2)", "(x+√2)"], note: "一次因式。" },
        "x2+1": { title: "x²+1", factors: ["(x−i)", "(x+i)"], note: "在 ℂ 继续分裂。" },
        "x4-1": { title: "x⁴−1", factors: ["(x−1)", "(x+1)", "(x−i)", "(x+i)"], note: "全部一次因式。" },
      },
    };
    let domain = "Q";
    let poly = "x4-1";

    function paint() {
      const item = data[domain][poly];
      root.querySelector("[data-tree]").innerHTML = `
        <div class="ch1-compare-card"><strong>${item.title}</strong><div class="ch1-muted">数域 ${domain}</div>
        <ul>${item.factors.map((f) => `<li>${f}</li>`).join("")}</ul>
        <div class="ch1-muted">${item.note}</div></div>`;
      root.querySelector("[data-unique]").textContent =
        "存在性：次数下降保证拆完；唯一性：最终不可约多重集合（首一后）一致，中间路径可以不同。";
      M().pulseClass(root.querySelector("[data-tree]"));
    }

    root.querySelectorAll("[data-domain]").forEach((btn) => {
      btn.addEventListener("click", () => {
        domain = btn.dataset.domain;
        root.querySelectorAll("[data-domain]").forEach((b) => b.classList.toggle("is-active", b === btn));
        paint();
      });
    });
    root.querySelectorAll("[data-poly]").forEach((btn) => {
      btn.addEventListener("click", () => {
        poly = btn.dataset.poly;
        root.querySelectorAll("[data-poly]").forEach((b) => b.classList.toggle("is-active", b === btn));
        paint();
      });
    });
    paint();
  }

  // §6 multiplicity lab — FIXED camera
  function mountMultiplicity(root) {
    const state = { a: 1, m: 2 };
    const bounds = { xMin: -3, xMax: 3, yMin: -2, yMax: 4 };

    function poly() {
      // (x-a)^m * (x+1) to keep another simple factor
      let p = [M().R(1)];
      for (let k = 0; k < state.m; k++) p = M().polyMul(p, M().polyFromNums([M().rNeg(M().R(state.a)), M().R(1)]));
      p = M().polyMul(p, M().polyFromNums([M().R(1), M().R(1)]));
      return p;
    }

    function paint() {
      const p = poly();
      const dp = M().polyDerivative(p);
      const g = M().polyGcd(p, dp);
      root.querySelector("[data-m-val]").textContent = String(state.m);
      root.querySelector("[data-a-val]").textContent = String(state.a);
      root.querySelector("[data-poly-tex]").innerHTML = tex(M().formatPolyTex(p));
      root.querySelector("[data-gcd-tex]").innerHTML = tex(M().formatPolyTex(g));
      const parity = state.m % 2 === 0 ? "偶数重数：贴住横轴后返回" : "奇数重数：穿过横轴";
      root.querySelector("[data-shape]").textContent = parity;
      const st = root.querySelector("[data-multi-status]");
      st.textContent = state.m >= 2 ? `根 ${state.a} 为 ${state.m} 重` : `根 ${state.a} 为单根`;
      st.className = `ch1-status ${state.m >= 2 ? "is-warn" : "is-ok"}`;

      const canvas = root.querySelector("[data-ch1-canvas]");
      M().drawPolyGraph(canvas, p, {
        bounds,
        caption: "固定世界坐标 · 不会随点击放大",
        points: [{ x: state.a, y: 0, color: M().getPalette().coral }],
      });
      M().drawRootAxis(root.querySelector("[data-root-canvas]"), [{ x: state.a, m: state.m, label: `m=${state.m}` }, { x: -1, m: 1, label: "-1" }], {
        bounds: { xMin: -3, xMax: 3, yMin: -1.2, yMax: 1.2 },
      });
    }

    root.querySelector('[data-key="m"]').addEventListener("input", (e) => {
      state.m = Number(e.target.value);
      paint();
    });
    root.querySelector('[data-key="a"]').addEventListener("input", (e) => {
      state.a = Number(e.target.value);
      paint();
    });
    root.querySelectorAll("[data-preset-m]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.m = Number(btn.dataset.presetM);
        root.querySelector('[data-key="m"]').value = String(state.m);
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

  // §7 evaluation + interpolation
  function mountEvalLab(root) {
    const state = { coeffs: M().polyFromNums([1, 0, 1]), a: 1, mode: "eval" };
    const bounds = { xMin: -1, xMax: 3, yMin: -1, yMax: 8 };

    function horner(p, a) {
      const steps = [];
      let acc = M().R(0);
      for (let i = p.length - 1; i >= 0; i--) {
        acc = M().rAdd(M().rMul(acc, M().R(a)), p[i]);
        steps.push(`×${a} + ${M().formatR(p[i])} → ${M().formatR(acc)}`);
      }
      return { value: acc, steps };
    }

    function paint() {
      const p = state.coeffs;
      const { value, steps } = horner(p, state.a);
      root.querySelector("[data-poly-tex]").innerHTML = tex(M().formatPolyTex(p));
      root.querySelector("[data-a-val]").textContent = String(state.a);
      root.querySelector("[data-fa]").textContent = M().formatR(value, 4);
      root.querySelector("[data-horner]").innerHTML = steps.map((s) => `<div>${s}</div>`).join("");
      const isRoot = M().rIsZero(value);
      const st = root.querySelector("[data-factor-status]");
      st.textContent = isRoot ? `x−${state.a} 整除 f（因式定理）` : `f(${state.a})≠0，不是根`;
      st.className = `ch1-status ${isRoot ? "is-ok" : "is-warn"}`;

      if (state.mode === "interp") {
        // points (0,1),(1,2),(2,5) -> 1+x+x^2
        const ip = M().polyFromNums([1, 1, 1]);
        root.querySelector("[data-interp-note]").innerHTML = `插值预设：过 (0,1),(1,2),(2,5) 得 ${tex(M().formatPolyTex(ip))}`;
        M().drawPolyGraph(root.querySelector("[data-ch1-canvas]"), ip, {
          bounds,
          points: [
            { x: 0, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 5 },
          ],
          caption: "固定相机 · 插值曲线",
        });
      } else {
        root.querySelector("[data-interp-note]").textContent = "代入模式：移动 a，观察 Horner 与图上的点。";
        M().drawPolyGraph(root.querySelector("[data-ch1-canvas]"), p, {
          bounds: { xMin: -3, xMax: 3, yMin: -1, yMax: 6 },
          points: [{ x: state.a, y: M().rToNum(value), color: M().getPalette().coral }],
          caption: "固定相机 · 评价点 (a,f(a))",
        });
      }
    }

    root.querySelector('[data-key="a"]').addEventListener("input", (e) => {
      state.a = Number(e.target.value);
      paint();
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
        if (btn.dataset.preset === "quad") state.coeffs = M().polyFromNums([1, -3, 1]);
        else state.coeffs = M().polyFromNums([1, 0, 1]);
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

  // §8 conjugate lock
  function mountConjugate(root) {
    const state = { re: 1, im: 1.5, mode: "R" };

    function paint() {
      const a = state.re;
      const b = state.im;
      const quad = M().polyFromNums([a * a + b * b, -2 * a, 1]);
      root.querySelector("[data-root1]").textContent = `${a.toFixed(2)}+${b.toFixed(2)}i`;
      root.querySelector("[data-root2]").textContent = `${a.toFixed(2)}−${b.toFixed(2)}i`;
      root.querySelector("[data-quad]").innerHTML = tex(M().formatPolyTex(quad));
      root.querySelector("[data-mode-note]").textContent =
        state.mode === "R"
          ? "实系数模式：共轭锁开启，系数保持实数。"
          : "复系数模式：可单独显示一次因式 (x−α)(x−β)。";

      M().drawComplexPlane(
        root.querySelector("[data-ch1-canvas]"),
        [
          { re: a, im: b, label: "α", color: M().getPalette().coral },
          { re: a, im: -b, label: "ᾱ", color: M().getPalette().accent },
        ],
        { bounds: { xMin: -3, xMax: 3, yMin: -3, yMax: 3 } },
      );
      const linear = state.mode === "C" ? `${tex(`(x-(${a.toFixed(1)}+${b.toFixed(1)}i))(x-(${a.toFixed(1)}-${b.toFixed(1)}i))`)}` : "在 ℝ 中保持二次不可约（若 b≠0）";
      root.querySelector("[data-linear]").innerHTML = linear;
    }

    root.querySelector('[data-key="re"]').addEventListener("input", (e) => {
      state.re = Number(e.target.value);
      paint();
    });
    root.querySelector('[data-key="im"]').addEventListener("input", (e) => {
      state.im = Number(e.target.value);
      paint();
    });
    root.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.mode = btn.dataset.mode;
        root.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("is-active", b === btn));
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

  window.defineChapter1Renderer("factorization-theorem", {
    formal: (el) => {
      if (!el) return;
      el.innerHTML = formalShell(
        "因式分解：存在与唯一",
        "不可约性依赖系数域；唯一性针对最终不可约多重集合。",
        module("1", "存在性", "次数下降", "<p>每次拆成更低次数因式，树必然有限。</p>") +
          module("2", "唯一性", "相伴与顺序", "<p>标准化（首一+排序）后结果一致。</p>") +
          module("3", "数域", "同一多项式不同叶", `<p>${tex("x^2+1")} 在 ${tex("\\mathbb{R}")} 不可约，在 ${tex("\\mathbb{C}")} 可约。</p>`),
      );
    },
    interactive: (el) => {
      if (!el) return;
      el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
        <div class="ch1-lab-head"><h3>因式树 × 数域切换</h3><p>比较 ℚ / ℝ / ℂ 下的不可约叶节点。</p></div>
        <div class="ch1-controls">
          <button type="button" class="is-active" data-domain="Q">ℚ</button>
          <button type="button" data-domain="R">ℝ</button>
          <button type="button" data-domain="C">ℂ</button>
          <button type="button" data-poly="x2-2">x²−2</button>
          <button type="button" data-poly="x2+1">x²+1</button>
          <button type="button" class="is-active" data-poly="x4-1">x⁴−1</button>
        </div>
        <div data-tree></div>
        <div class="ch1-readout ch1-muted" data-unique></div>
      </div>`;
      mountFactorDomain(el);
    },
  });

  window.defineChapter1Renderer("multiple-factors", {
    formal: (el) => {
      if (!el) return;
      el.innerHTML = formalShell(
        "重因式与导数",
        "代数重数、导数条件与实图像局部形状同步变化。",
        module("1", "重数", "精确幂次", `<p>${tex("f=(x-a)^m h,\\ h(a)\\ne 0")}</p>`) +
          module("2", "判别", "gcd", `<p>${tex("\\gcd(f,f')=1")} ⇔ 无重因式。</p>`) +
          module("3", "图像", "奇偶", "<p>奇数穿过，偶数贴住；接近≠重合。</p>"),
      );
    },
    interactive: (el) => {
      if (!el) return;
      el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
        <div class="ch1-lab-head"><h3>根重数实验室</h3><p>调节 m 与根位置。相机世界坐标锁定，连点不会放大跑飞。</p></div>
        <div class="ch1-controls">
          <button type="button" data-preset-m="1">m=1</button>
          <button type="button" data-preset-m="2">m=2</button>
          <button type="button" data-preset-m="3">m=3</button>
          <button type="button" data-preset-m="4">m=4</button>
        </div>
        <div class="ch1-lab-grid">
          <div class="ch1-panel">
            <div class="ch1-stage"><canvas data-ch1-canvas aria-label="重因式图像"></canvas></div>
            <div class="ch1-stage is-short"><canvas data-root-canvas aria-label="根轴"></canvas></div>
          </div>
          <div class="ch1-panel">
            <div class="ch1-slider-row"><span>重数 m</span><input data-key="m" type="range" min="1" max="4" step="1" value="2" /><strong data-m-val>2</strong></div>
            <div class="ch1-slider-row"><span>根 a</span><input data-key="a" type="range" min="-2" max="2" step="0.1" value="1" /><strong data-a-val>1</strong></div>
            <div class="ch1-readout">
              <div>f = <span data-poly-tex></span></div>
              <div>gcd(f, f′) = <span data-gcd-tex></span></div>
              <div class="ch1-status" data-multi-status></div>
              <div class="ch1-muted" data-shape></div>
            </div>
          </div>
        </div>
      </div>`;
      mountMultiplicity(el);
    },
  });

  window.defineChapter1Renderer("polynomial-functions", {
    formal: (el) => {
      if (!el) return;
      el.innerHTML = formalShell(
        "从形式到函数",
        "代入、余数定理与根数上界把符号对象连到图像与插值。",
        module("1", "余数定理", "常数余式", `<p>${tex("f(x)=(x-a)q(x)+f(a)")}</p>`) +
          module("2", "根数", "上界", "<p>非零 n 次至多 n 个不同根。</p>") +
          module("3", "插值", "唯一性", "<p>n+1 个互异节点唯一确定次数 ≤n 的多项式。</p>"),
      );
    },
    interactive: (el) => {
      if (!el) return;
      el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
        <div class="ch1-lab-head"><h3>代入机器</h3><p>Horner 计算 f(a)，并在固定相机下标记点。</p></div>
        <div class="ch1-controls">
          <button type="button" class="is-active" data-mode="eval">代入</button>
          <button type="button" data-mode="interp">插值预设</button>
          <button type="button" data-preset="default">1+x²</button>
          <button type="button" data-preset="quad">1−3x+x²</button>
        </div>
        <div class="ch1-lab-grid">
          <div class="ch1-stage"><canvas data-ch1-canvas aria-label="多项式函数图像"></canvas></div>
          <div class="ch1-panel">
            <div class="ch1-slider-row"><span>a</span><input data-key="a" type="range" min="-2" max="2" step="0.1" value="1" /><strong data-a-val>1</strong></div>
            <div class="ch1-readout">
              <div>f = <span data-poly-tex></span></div>
              <div>f(a) = <strong data-fa></strong></div>
              <div class="ch1-status" data-factor-status></div>
              <div class="ch1-muted" data-interp-note></div>
              <div class="ch1-ledger" data-horner></div>
            </div>
          </div>
        </div>
      </div>`;
      mountEvalLab(el);
    },
  });

  window.defineChapter1Renderer("complex-real-factorization", {
    formal: (el) => {
      if (!el) return;
      el.innerHTML = formalShell(
        "复平面与共轭锁",
        "ℂ 上拆到一次；ℝ 上非实根成对并合成实二次。",
        module("1", "代数基本定理", "有根可拆", `<p>非常数 ${tex("f\\in\\mathbb{C}[x]")} 可分解为一次因式。</p>`) +
          module("2", "共轭", "实系数", `<p>${tex("a+bi")} 是根 ⇒ ${tex("a-bi")} 是根。</p>`) +
          module("3", "配对", "二次卡片", `<p>${tex("x^2-2ax+(a^2+b^2)")}</p>`),
      );
    },
    interactive: (el) => {
      if (!el) return;
      el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
        <div class="ch1-lab-head"><h3>共轭锁</h3><p>移动非实根，共轭镜像同步；相机固定在复平面窗口内。</p></div>
        <div class="ch1-controls">
          <button type="button" class="is-active" data-mode="R">ℝ 系数</button>
          <button type="button" data-mode="C">ℂ 系数</button>
        </div>
        <div class="ch1-lab-grid">
          <div class="ch1-stage"><canvas data-ch1-canvas aria-label="复平面根"></canvas></div>
          <div class="ch1-panel">
            <div class="ch1-slider-row"><span>Re</span><input data-key="re" type="range" min="-2" max="2" step="0.1" value="1" /><span></span></div>
            <div class="ch1-slider-row"><span>Im</span><input data-key="im" type="range" min="0.2" max="2.5" step="0.1" value="1.5" /><span></span></div>
            <div class="ch1-readout">
              <div>α = <strong data-root1></strong></div>
              <div>ᾱ = <strong data-root2></strong></div>
              <div>实二次 = <span data-quad></span></div>
              <div class="ch1-muted" data-mode-note></div>
              <div data-linear></div>
            </div>
          </div>
        </div>
      </div>`;
      mountConjugate(el);
    },
  });
})();
