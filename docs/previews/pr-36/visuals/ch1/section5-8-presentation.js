(() => {
  const M = () => window.Ch1Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);
  const display = (s) => (window.texDisplay ? window.texDisplay(s) : s);

  // §5 factor tree by domain
  function mountFactorDomain(root) {
    const data = {
      Q: {
        "x2-2": {
          title: "x^2-2",
          leaves: [{ tex: "x^2-2", kind: "irred" }],
          note: "在 ℚ 上无有理根，二次故不可约。",
        },
        "x2+1": {
          title: "x^2+1",
          leaves: [{ tex: "x^2+1", kind: "irred" }],
          note: "在 ℚ、ℝ 均无实根，二次不可约。",
        },
        "x4-1": {
          title: "x^4-1",
          leaves: [
            { tex: "x-1", kind: "linear" },
            { tex: "x+1", kind: "linear" },
            { tex: "x^2+1", kind: "irred" },
          ],
          note: "x²+1 在 ℚ 仍不可约，不能继续拆。",
        },
      },
      R: {
        "x2-2": {
          title: "x^2-2",
          leaves: [
            { tex: "x-\\sqrt{2}", kind: "linear" },
            { tex: "x+\\sqrt{2}", kind: "linear" },
          ],
          note: "实根出现，拆成一次因式。",
        },
        "x2+1": {
          title: "x^2+1",
          leaves: [{ tex: "x^2+1", kind: "irred" }],
          note: "无实根，在 ℝ 仍不可约。",
        },
        "x4-1": {
          title: "x^4-1",
          leaves: [
            { tex: "x-1", kind: "linear" },
            { tex: "x+1", kind: "linear" },
            { tex: "x^2+1", kind: "irred" },
          ],
          note: "与 ℚ 相同的实分解终点（对这个例子）。",
        },
      },
      C: {
        "x2-2": {
          title: "x^2-2",
          leaves: [
            { tex: "x-\\sqrt{2}", kind: "linear" },
            { tex: "x+\\sqrt{2}", kind: "linear" },
          ],
          note: "一次因式。",
        },
        "x2+1": {
          title: "x^2+1",
          leaves: [
            { tex: "x-i", kind: "linear" },
            { tex: "x+i", kind: "linear" },
          ],
          note: "在 ℂ 继续分裂为一次因式。",
        },
        "x4-1": {
          title: "x^4-1",
          leaves: [
            { tex: "x-1", kind: "linear" },
            { tex: "x+1", kind: "linear" },
            { tex: "x-i", kind: "linear" },
            { tex: "x+i", kind: "linear" },
          ],
          note: "全部一次因式；中间路径可不同，叶多重集合唯一。",
        },
      },
    };
    let domain = "Q";
    let poly = "x4-1";

    function paint() {
      const item = data[domain][poly];
      const domainLabel = { Q: "ℚ", R: "ℝ", C: "ℂ" }[domain];
      root.querySelector("[data-tree]").innerHTML = `
        <div class="ch1-factor-tree">
          <div class="ch1-factor-root">
            <span class="ch1-factor-node is-root">${tex(item.title)}</span>
            <span class="ch1-factor-domain">数域 ${domainLabel}</span>
          </div>
          <div class="ch1-factor-branch" aria-hidden="true"></div>
          <div class="ch1-factor-leaves">
            ${item.leaves
              .map(
                (leaf) =>
                  `<span class="ch1-factor-node is-leaf is-${leaf.kind}">${tex(leaf.tex)}</span>`,
              )
              .join("")}
          </div>
          <p class="ch1-factor-note">${item.note}</p>
        </div>`;
      root.querySelector("[data-unique]").innerHTML =
        "存在性：次数下降保证拆完；唯一性：最终不可约因式的<strong>多重集合</strong>（首一后）一致，中间路径可以不同。标准化：常数提前、因式首一、按次数与字典序排序。";
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
      let p = [M().R(1)];
      for (let k = 0; k < state.m; k++) {
        p = M().polyMul(p, M().polyFromNums([M().rNeg(M().R(state.a)), M().R(1)]));
      }
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
      M().drawRootAxis(
        root.querySelector("[data-root-canvas]"),
        [
          { x: state.a, m: state.m, label: `m=${state.m}` },
          { x: -1, m: 1, label: "-1" },
        ],
        { bounds: { xMin: -3, xMax: 3, yMin: -1.2, yMax: 1.2 } },
      );
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
    const boundsEval = { xMin: -3, xMax: 3, yMin: -1, yMax: 6 };
    const boundsInterp = { xMin: -1, xMax: 3, yMin: -1, yMax: 8 };

    function horner(p, a) {
      const steps = [];
      let acc = M().R(0);
      for (let i = p.length - 1; i >= 0; i--) {
        acc = M().rAdd(M().rMul(acc, M().R(a)), p[i]);
        steps.push({
          html: `${tex("\\times")} ${a} ${tex("+")} ${tex(M().formatRTex(p[i]))} ${tex("\\rightarrow")} ${tex(M().formatRTex(acc))}`,
        });
      }
      return { value: acc, steps };
    }

    function paint() {
      const p = state.coeffs;
      const { value, steps } = horner(p, state.a);
      root.querySelector("[data-poly-tex]").innerHTML = tex(M().formatPolyTex(p));
      root.querySelector("[data-a-val]").textContent = String(state.a);
      root.querySelector("[data-fa]").textContent = M().formatR(value, 4);
      root.querySelector("[data-horner]").innerHTML = steps.map((s, i) => `<div class="${i === steps.length - 1 ? "is-current" : ""}">${i + 1}. ${s.html}</div>`).join("");
      const isRoot = M().rIsZero(value);
      const st = root.querySelector("[data-factor-status]");
      st.textContent = isRoot ? `x−${state.a} 整除 f（因式定理）` : `f(${state.a})≠0，不是根`;
      st.className = `ch1-status ${isRoot ? "is-ok" : "is-warn"}`;

      if (state.mode === "interp") {
        const ip = M().polyFromNums([1, 1, 1]);
        root.querySelector("[data-interp-note]").innerHTML = `插值预设：过 (0,1)、(1,2)、(2,5) 得 ${tex(M().formatPolyTex(ip))}。n+1 个互异节点唯一确定次数 ≤n 的多项式。`;
        M().drawPolyGraph(root.querySelector("[data-ch1-canvas]"), ip, {
          bounds: boundsInterp,
          points: [
            { x: 0, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 5 },
          ],
          caption: "固定相机 · 插值曲线",
        });
      } else {
        root.querySelector("[data-interp-note]").textContent = "代入模式：移动 a，观察 Horner 与图上的点 (a,f(a))。";
        M().drawPolyGraph(root.querySelector("[data-ch1-canvas]"), p, {
          bounds: boundsEval,
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
    const bounds = { xMin: -3, xMax: 3, yMin: -3, yMax: 3 };

    function paint() {
      const a = state.re;
      const b = state.im;
      const quad = M().polyFromNums([a * a + b * b, -2 * a, 1]);
      root.querySelector("[data-root1]").textContent = `${a.toFixed(2)}+${b.toFixed(2)}i`;
      root.querySelector("[data-root2]").textContent = `${a.toFixed(2)}−${b.toFixed(2)}i`;
      root.querySelector("[data-quad]").innerHTML = tex(M().formatPolyTex(quad));
      root.querySelector("[data-mode-note]").textContent =
        state.mode === "R"
          ? "实系数模式：共轭锁开启，非实根成对，系数保持实数。"
          : "复系数模式：可单独写出一次因式 (x−α)(x−β)。";

      M().drawComplexPlane(
        root.querySelector("[data-ch1-canvas]"),
        [
          { re: a, im: b, label: "α", color: M().getPalette().coral },
          { re: a, im: -b, label: "ᾱ", color: M().getPalette().accent },
        ],
        { bounds },
      );
      if (state.mode === "C") {
        root.querySelector("[data-linear]").innerHTML = tex(
          `(x-(${a.toFixed(1)}+${b.toFixed(1)}i))(x-(${a.toFixed(1)}-${b.toFixed(1)}i))`,
        );
      } else {
        root.querySelector("[data-linear]").innerHTML =
          b === 0 ? "虚部为 0：退化为实一次因式的平方（或两实根）。" : "在 ℝ 中保持二次不可约（b≠0）。";
      }
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

  function formal5(el) {
    if (!el) return;
    el.innerHTML = `
      <h2>因式分解：存在与唯一</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">因式分解定理回答两件事：存在性——非零非常数多项式可以拆成不可约因式之积；唯一性——在单位（非零常数）与顺序意义下，最终不可约因式的多重集合唯一。关键点：不可约性依赖系数域。同一多项式在 ℚ、ℝ、ℂ 上可能停在不同的“叶节点”。中间拆分路径可以不同，标准化后的结果必须一致。</p>
        <div class="operation-map">
          <div class="operation-map-main">${display("f=c\\,p_1^{e_1}\\cdots p_k^{e_k}\\quad(p_i\\ \\text{首一不可约})")}</div>
          <dl class="lesson-meta-list">
            <div><dt>不可约</dt><dd>非常数，且不能写成两个更低次数非常数因式之积。</dd></div>
            <div><dt>存在性</dt><dd>每次拆分降低次数，有限步到达叶节点。</dd></div>
            <div><dt>唯一性</dt><dd>叶的多重集合在相伴意义下唯一，非中间路径唯一。</dd></div>
            <div><dt>数域</dt><dd>${tex("x^2-2")} 在 ℚ 不可约、在 ℝ 可约；${tex("x^2+1")} 在 ℝ 不可约、在 ℂ 可约。</dd></div>
          </dl>
        </div>
        <div class="definition-stack">
          <article class="definition-row"><strong>可约与不可约</strong><p>定义总是“在某个数域 ${tex("F")} 上”。${tex("x^2+1")} 在 ${tex("\\mathbb{R}[x]")} 不可约，在 ${tex("\\mathbb{C}[x]")} 可约。切换域等于更换镜头，叶节点集合会变。</p></article>
          <article class="definition-row"><strong>存在性论证</strong><p>若可约则写成两个正次数、更低次数因式之积；对次数做归纳，最终得到不可约因式。次数是非负整数，下降过程必停。</p></article>
          <article class="definition-row"><strong>唯一性与标准化</strong><p>唯一性针对最终不可约多重集合。为了比较，把非零常数提到最前，每个不可约因式首一化，再按次数与字典序排序。路径不同没关系，标准形相同。</p></article>
          <article class="definition-row"><strong>例：x⁴−1</strong><p>在 ℚ 与 ℝ 上可写成 ${tex("(x-1)(x+1)(x^2+1)")}；在 ℂ 上 ${tex("x^2+1")} 继续拆成 ${tex("(x-i)(x+i)")}。先固定数域，再谈“能不能再拆”。</p></article>
        </div>
        <div class="lesson-card-grid">
          <article class="lesson-card"><span class="lesson-card-kicker">镜头</span><h3>先选数域</h3><p>同一表达式换域，不可约叶可以变。交互中用 ℚ/ℝ/ℂ 三按钮切换。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">叶节点</span><h3>停在不可约</h3><p>一次因式在任意域都不可再拆；二次是否再拆取决于是否有根在域中。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">比较</span><h3>比标准形，不比路径</h3><p>先拆 ${tex("x^2-1")} 还是先拆别的，只要最后叶多重集合一致即可。</p></article>
        </div>
        <div class="lesson-reading-note"><strong>这一节的核心</strong><p>存在靠次数下降，唯一靠相伴与标准化。不可约性随域变。下一节研究同一不可约因式重复出现——重数、导数与图像形状。</p></div>
      </div>`;
  }

  function formal6(el) {
    if (!el) return;
    el.innerHTML = `
      <h2>重因式与导数</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">当不可约因式 ${tex("p")} 满足 ${tex("p^m\\mid f")} 但 ${tex("p^{m+1}\\nmid f")} 时，称 ${tex("m")} 为重数。对线性因式，${tex("f=(x-a)^m h")} 且 ${tex("h(a)\\ne 0")} 时，a 是 m 重根。代数上，${tex("f")} 无重因式当且仅当 ${tex("\\gcd(f,f')=1")}。图像上，奇数重数穿过横轴，偶数重数贴住后返回；真正重根由精确代数条件判定，不由像素距离猜测。</p>
        <div class="operation-map">
          <div class="operation-map-main">${display("f=(x-a)^m h,\\quad h(a)\\ne 0\\quad\\Longleftrightarrow\\quad a\\ \\text{为 }m\\text{ 重根}")}</div>
          <dl class="lesson-meta-list">
            <div><dt>重数</dt><dd>精确幂次 ${tex("m")}；${tex("h(a)\\ne 0")} 保证不再更高。</dd></div>
            <div><dt>导数判别</dt><dd>${tex("\\gcd(f,f')=1")} ⇔ 无重因式（平方自由）。</dd></div>
            <div><dt>奇偶图像</dt><dd>奇数穿过，偶数贴住；重数越高局部越平。</dd></div>
            <div><dt>精确临界</dt><dd>两根很接近仍是两个单根；只有精确重合才是重根。</dd></div>
          </dl>
        </div>
        <div class="definition-stack">
          <article class="definition-row"><strong>重数定义</strong><p>把 ${tex("f")} 写成 ${tex("(x-a)^m h(x)")} 且 ${tex("h(a)\\ne 0")}。m=1 为单根；m≥2 为重根。交互中固定另一因式 ${tex("(x+1)")}，调节 a 与 m 观察结构 ${tex("(x-a)^m(x+1)")}。</p></article>
          <article class="definition-row"><strong>导数与 gcd</strong><p>若 a 是 m 重根（m≥2），则 a 也是 ${tex("f'")} 的根，从而 ${tex("x-a")} 整除 ${tex("\\gcd(f,f')")}。反过来，${tex("\\gcd(f,f')=1")} 说明没有公共根型重因式。计算用精确欧几里得，不靠浮点。</p></article>
          <article class="definition-row"><strong>图像局部形状</strong><p>奇数重数：曲线穿过横轴；偶数重数：接触后返回同一侧。重数增大时，在根附近更平坦。这是局部形状描述，不能替代代数重数定义。</p></article>
          <article class="definition-row"><strong>接近 ≠ 重合</strong><p>两个单根可以任意靠近，在像素上看像“贴在一起”，但 gcd 仍为 1。只有精确 ${tex("m\\ge 2")} 才是重根。固定相机避免误以为“点一下放大就重合”。</p></article>
        </div>
        <div class="lesson-card-grid">
          <article class="lesson-card"><span class="lesson-card-kicker">实验</span><h3>调 m 看穿过/贴住</h3><p>m=1 穿过；m=2 贴住返回；m=3 更平地穿过。同步读 gcd(f,f′)。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">根轴</span><h3>叠放标记重数</h3><p>下方短舞台用叠放圆点表示重数，高度固定 260px。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">相机</span><h3>世界坐标锁定</h3><p>主图 340px，bounds 固定；交互只改多项式，不改镜头。</p></article>
        </div>
        <div class="lesson-reading-note"><strong>这一节的核心</strong><p>重数是精确幂次；${tex("\\gcd(f,f')")} 判别有无重因式；奇偶解释穿过/贴住。下一节把形式多项式通过代入变成函数，连接余数定理、根数上界与插值。</p></div>
      </div>`;
  }

  function formal7(el) {
    if (!el) return;
    el.innerHTML = `
      <h2>从形式到函数</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">把不定元 x 换成数 a，得到函数值 f(a)，这是评价映射。余数定理说：f 除以 x−a 的余式是常数 f(a)。因而 f(a)=0 当且仅当 x−a 整除 f（因式定理）。非零 n 次多项式至多有 n 个不同根；在无限数域上，足够多的取值唯一确定一个低次多项式——这就是插值的唯一性。</p>
        <div class="operation-map">
          <div class="operation-map-main">${display("f(x)=(x-a)q(x)+f(a)")}</div>
          <dl class="lesson-meta-list">
            <div><dt>评价</dt><dd>${tex("a\\mapsto f(a)")}；Horner 法稳定计算。</dd></div>
            <div><dt>因式定理</dt><dd>${tex("f(a)=0\\iff (x-a)\\mid f(x)")}。</dd></div>
            <div><dt>根数上界</dt><dd>非零 n 次至多 n 个不同根。</dd></div>
            <div><dt>插值</dt><dd>n+1 个互异横坐标唯一确定次数 ≤n 的多项式。</dd></div>
          </dl>
        </div>
        <div class="definition-stack">
          <article class="definition-row"><strong>余数定理</strong><p>带余除法对一次除式 ${tex("x-a")} 给出常数余式。该常数必为 ${tex("f(a)")}：把 x=a 代入两边即得。因此计算 f(a) 与判断 x−a 是否为因式是同一件事的两面。</p></article>
          <article class="definition-row"><strong>Horner 算法</strong><p>从高次系数起，反复“乘 a 再加下一项系数”。运算次数少、数值稳定，适合手算与程序。交互账本逐步显示累加器变化。</p></article>
          <article class="definition-row"><strong>根数上界</strong><p>若有 n+1 个不同根，则 f 有 n+1 个一次因式，次数至少 n+1，与 deg f=n 矛盾（f 非零）。因此非零 n 次多项式至多 n 个不同根。</p></article>
          <article class="definition-row"><strong>插值唯一性</strong><p>给定 n+1 个横坐标互异的点，存在唯一次数 ≤n 的多项式穿过它们。若有两个，差的根过多必为零多项式。拉格朗日基满足 ${tex("L_i(x_j)=\\delta_{ij}")}。</p></article>
        </div>
        <div class="lesson-card-grid">
          <article class="lesson-card"><span class="lesson-card-kicker">代入</span><h3>移动 a 同步三点</h3><p>公式 f、数值 f(a)、图上点 (a,f(a)) 必须一致。根处因式定理点亮。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">插值</span><h3>三点定二次</h3><p>预设过 (0,1),(1,2),(2,5)，得 ${tex("1+x+x^2")}。固定相机看曲线与节点。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">无限域</span><h3>函数与形式</h3><p>在无限数域上，多项式函数由足够多点唯一确定；有限域上形式与函数可能脱节。</p></article>
        </div>
        <div class="lesson-reading-note"><strong>这一节的核心</strong><p>${tex("f(x)=(x-a)q+f(a)")}；根 ⇔ 一次因式；根数 ≤ 次数；插值靠节点个数。下一节进入复平面：代数基本定理与实系数的共轭锁。</p></div>
      </div>`;
  }

  function formal8(el) {
    if (!el) return;
    el.innerHTML = `
      <h2>复平面与共轭锁</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">在 ${tex("\\mathbb{C}[x]")} 中，代数基本定理保证非常数多项式有根，因而可一直拆到一次因式。若系数全为实数，则非实根必须成共轭对出现：${tex("a+bi")} 是根 ⇒ ${tex("a-bi")} 是根。于是可把一对共轭一次因式合并为实系数二次因式 ${tex("x^2-2ax+(a^2+b^2)")}。ℝ 上不可约多项式只有一次与无实根二次两类。</p>
        <div class="operation-map">
          <div class="operation-map-main">${display("(x-(a+bi))(x-(a-bi))=x^2-2ax+(a^2+b^2)")}</div>
          <dl class="lesson-meta-list">
            <div><dt>代数基本定理</dt><dd>非常数 ${tex("f\\in\\mathbb{C}[x]")} 在 ℂ 中有根，可拆到一次。</dd></div>
            <div><dt>共轭锁</dt><dd>实系数 ⇒ 非实根成对，虚部相反。</dd></div>
            <div><dt>配对卡片</dt><dd>一对共轭根对应一个实二次因式。</dd></div>
            <div><dt>ℝ 上不可约</dt><dd>一次，或判别式为负的二次。</dd></div>
          </dl>
        </div>
        <div class="definition-stack">
          <article class="definition-row"><strong>ℂ 上完全分裂</strong><p>有根即可提出一次因式，对次数归纳得到 ${tex("f=c(x-r_1)\\cdots(x-r_n)")}。重根对应重复的一次因式。这是“最细”的分解。</p></article>
          <article class="definition-row"><strong>共轭为什么锁住</strong><p>实系数时，对 ${tex("f(\\overline{z})=\\overline{f(z)}")}。若 ${tex("f(z)=0")}，则 ${tex("f(\\overline{z})=0")}。故非实根拖着它的共轭一起出现，重数也相同。</p></article>
          <article class="definition-row"><strong>合并为实二次</strong><p>${tex("(x-(a+bi))(x-(a-bi))=x^2-2ax+(a^2+b^2)")}，系数全实。当 b≠0 时该二次在 ℝ 上无实根，因而在 ${tex("\\mathbb{R}[x]")} 中不可约。</p></article>
          <article class="definition-row"><strong>两种镜头</strong><p>ℝ 模式：保持共轭锁，读实二次卡片。ℂ 模式：允许一次因式全部展开。交互中移动 α，镜像 ᾱ 同步，相机固定在复平面窗口内。</p></article>
        </div>
        <div class="lesson-card-grid">
          <article class="lesson-card"><span class="lesson-card-kicker">平面</span><h3>Re–Im 固定窗口</h3><p>舞台 340px，bounds 锁定。点的位置变，镜头不变。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">镜像</span><h3>关于实轴对称</h3><p>α 与 ᾱ 的实部相同、虚部相反。拖动时两者一起动。</p></article>
          <article class="lesson-card"><span class="lesson-card-kicker">卡片</span><h3>二次系数实时</h3><p>读 ${tex("x^2-2ax+(a^2+b^2)")}，核对与平面上两点一致。</p></article>
        </div>
        <div class="lesson-reading-note"><strong>这一节的核心</strong><p>ℂ 拆到一次；实系数非实根成对；配对得实二次。下一节回到有理系数：内容、有理根定理与 Eisenstein 判别。</p></div>
      </div>`;
  }

  window.defineChapter1Renderer("factorization-theorem", {
    formal: formal5,
    interactive: (el) => {
      if (!el) return;
      el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
        <div class="ch1-lab-head"><h3>因式树 × 数域切换</h3><p>比较 ℚ / ℝ / ℂ 下同一多项式的不可约叶节点。叶节点用 KaTeX 显示；路径可不同，标准形应一致。</p></div>
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
    formal: formal6,
    interactive: (el) => {
      if (!el) return;
      el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
        <div class="ch1-lab-head"><h3>根重数实验室</h3><p>结构 ${tex("(x-a)^m(x+1)")}。调节 m 与根位置。主图 340px、根轴 260px，世界坐标锁定。</p></div>
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
    formal: formal7,
    interactive: (el) => {
      if (!el) return;
      el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
        <div class="ch1-lab-head"><h3>代入机器与插值</h3><p>Horner 逐步计算 f(a)，固定相机标记点；插值预设展示三点定二次。</p></div>
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
    formal: formal8,
    interactive: (el) => {
      if (!el) return;
      el.innerHTML = `<h2>交互实验</h2><div class="ch1-lab">
        <div class="ch1-lab-head"><h3>共轭锁</h3><p>移动非实根，共轭镜像同步；相机固定在复平面窗口内。ℝ 模式读实二次，ℂ 模式展开一次因式。</p></div>
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
