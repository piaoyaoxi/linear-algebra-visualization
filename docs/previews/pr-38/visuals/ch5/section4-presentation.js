(() => {
  const M = () => window.Ch5Math;
  const inline = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);

  function module(index, title, subtitle, body) {
    return `<section class="ch5-module"><div class="ch5-module-heading"><span>${index}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>怎样证明所有方向都为正</h2>
      <div class="ch5-foundation ch5s4-foundation">
        <p class="ch5-lead">正定不是“看起来像碗”，也不是“试了几个向量都为正”。它要求每一个非零方向都严格为正。本节把这个无穷多方向的问题压缩成可计算的标准形与顺序主子式判据。</p>

        ${module(
          "01",
          "有限抽样为什么不够",
          "没测到负方向，不等于不存在负方向",
          `<div class="ch5s4-sample-story">
            <div class="ch5-card"><strong>已测试</strong><span>${inline("q(1,0)>0")}</span><span>${inline("q(0,1)>0")}</span><span>${inline("q(1,1)>0")}</span></div>
            <b>但是</b>
            <div class="ch5-card"><strong>仍有无穷多个方向</strong><p>只有结构性判据才能覆盖所有非零向量。</p></div>
          </div>`,
        )}

        ${module(
          "02",
          "五种符号类型",
          "区别在于所有非零方向上能取到哪些符号",
          `<div class="ch5s4-type-grid">
            <article><strong>正定</strong><span>${inline("q(x)>0")}</span><p>所有非零方向严格为正。</p></article>
            <article><strong>半正定</strong><span>${inline("q(x)\\ge0")}</span><p>不为负，但存在非零零方向。</p></article>
            <article><strong>负定</strong><span>${inline("q(x)<0")}</span><p>所有非零方向严格为负。</p></article>
            <article><strong>半负定</strong><span>${inline("q(x)\\le0")}</span><p>不为正，但存在非零零方向。</p></article>
            <article><strong>不定</strong><span>正、负都能取到</span><p>曲面具有马鞍方向。</p></article>
          </div>`,
        )}

        ${module(
          "03",
          "标准形把定义变成符号检查",
          "正惯性指数等于 n，才是正定",
          `<div class="ch5-equation">${display("f=d_1y_1^2+\\cdots+d_ny_n^2")}</div>
          <ul class="ch5-check-list"><li>全部 ${inline("d_i>0")}：正定。</li><li>全部 ${inline("d_i\\ge0")} 且至少一个为 0：半正定。</li><li>既有正系数又有负系数：不定。</li></ul>`,
        )}

        ${module(
          "04",
          "Sylvester 顺序主子式判据",
          "正定只需检查左上角逐级扩大的子矩阵",
          `<div class="ch5s4-minor-chain"><div>${inline("A_1")}</div><span>⊂</span><div>${inline("A_2")}</div><span>⊂</span><div>⋯</div><span>⊂</span><div>${inline("A_n=A")}</div></div>
          <div class="ch5-equation">${display("A>0\\quad\\Longleftrightarrow\\quad \\Delta_1>0,\\ldots,\\Delta_n>0")}</div>
          <div class="ch5-next-note"><span>边界</span><p>半正定不能把上面的“全正”机械改成“顺序主子式全非负”。一般需要检查所有主子式非负。二阶矩阵要同时检查 ${inline("a\\ge0")}、${inline("c\\ge0")} 和 ${inline("ac-b^2\\ge0")}。</p></div>`,
        )}

        ${module(
          "05",
          "长度平方是正定结构的另一种写法",
          "Gram 与 Cholesky 只作连接，不替代教材判据",
          `<div class="ch5-pair"><div class="ch5-card">${display("x^T(B^TB)x=\\|Bx\\|^2\\ge0")}<p>所以 ${inline("B^TB")} 总是半正定；B 列满秩时正定。</p></div><div class="ch5-card">${display("A=R^TR")}<p>正定矩阵可以写成长度平方结构；具体分解算法留作后续连接。</p></div></div>`,
        )}
      </div>`;
  }

  function regionClass(t) {
    const abs = Math.abs(t);
    if (Math.abs(abs - 1) < 1e-8) return "edge";
    return abs < 1 ? "inside" : "outside";
  }

  function mountLab(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch5-lab ch5s4-lab">
        <div class="ch5-lab-head"><h3>正定边界：从碗到山谷，再到马鞍</h3><p>只研究一个参数族 ${inline("A(t)=\\begin{bmatrix}1&t\\\\t&1\\end{bmatrix}")}。这样每一次变化都有明确含义：交叉项 t 逐渐增大，直到破坏“所有方向都为正”。</p></div>
        <div class="ch5-task"><span>1</span><div><strong>按 0 → 0.8 → 1 → 1.2 的顺序观察</strong><p>每次都先看单位圆方向值是否碰到 0，再看行列式 Δ₂ 是否同时到达临界值。</p></div></div>
        <div class="ch5-toolbar" role="group" aria-label="选择正定边界预设">
          <button type="button" class="is-active" data-s4-preset="0">t=0 · 单位碗</button>
          <button type="button" data-s4-preset="0.8">t=0.8 · 仍正定</button>
          <button type="button" data-s4-preset="1">t=1 · 临界山谷</button>
          <button type="button" data-s4-preset="1.2">t=1.2 · 马鞍</button>
        </div>
        <label class="ch5-range"><span>连续调节 t</span><input type="range" min="-1.5" max="1.5" step="0.01" value="0" data-s4-t><output data-s4-t-value>0</output></label>

        <div class="ch5s4-region" data-s4-region>
          <div class="is-outside"><span>t&lt;−1</span><strong>不定</strong></div>
          <i data-edge-left>−1</i>
          <div class="is-inside"><span>−1&lt;t&lt;1</span><strong>正定</strong></div>
          <i data-edge-right>1</i>
          <div class="is-outside"><span>t&gt;1</span><strong>不定</strong></div>
          <b data-s4-marker></b>
        </div>

        <div class="ch5-lab-grid">
          <div class="ch5-panel">
            <div class="ch5-stage"><canvas data-s4-contour aria-label="参数二次型的等高线"></canvas></div>
            <div class="ch5-reading"><h4>看形状</h4><p data-s4-contour-copy></p></div>
          </div>
          <div class="ch5-panel">
            <div class="ch5-stage"><canvas data-s4-scan aria-label="单位圆所有方向的二次型值"></canvas></div>
            <div class="ch5-reading"><h4>看所有方向</h4><p data-s4-scan-copy></p></div>
          </div>
        </div>

        <div class="ch5-lab-grid">
          <div class="ch5-reading">
            <h4>代数判据</h4>
            <div class="ch5-matrix-wrap" data-s4-matrix></div>
            <div class="ch5-reading-row"><span>二次型</span><strong data-s4-poly></strong></div>
            <div class="ch5-reading-row"><span>Δ₁</span><strong data-s4-d1></strong></div>
            <div class="ch5-reading-row"><span>Δ₂=1−t²</span><strong data-s4-d2></strong></div>
            <div class="ch5-reading-row"><span>最小方向值</span><strong data-s4-min></strong></div>
          </div>
          <div class="ch5-result-card" data-s4-result><span class="ch5-status" data-s4-status></span><h4 data-s4-title></h4><p data-s4-copy></p></div>
        </div>
      </div>`;

    const controller = new AbortController();
    const signal = controller.signal;
    const state = { t: 0 };

    function matrix() {
      return [[1, state.t], [state.t, 1]];
    }

    function paint() {
      const A = matrix();
      const cls = M().classify2(A);
      const d1 = 1;
      const d2 = 1 - state.t * state.t;
      const minValue = 1 - Math.abs(state.t);
      const region = regionClass(state.t);

      root.querySelector("[data-s4-t]").value = String(state.t);
      root.querySelector("[data-s4-t-value]").textContent = M().formatNum(state.t, 2);
      root.querySelector("[data-s4-matrix]").innerHTML = M().matrixHtml(A);
      root.querySelector("[data-s4-poly]").textContent = M().polyPlain2(A);
      root.querySelector("[data-s4-d1]").textContent = "1 > 0";
      root.querySelector("[data-s4-d2]").textContent = `${M().formatNum(d2, 4)} ${d2 > 1e-8 ? "> 0" : Math.abs(d2) <= 1e-8 ? "= 0" : "< 0"}`;
      root.querySelector("[data-s4-min]").textContent = M().formatNum(minValue, 4);

      const marker = root.querySelector("[data-s4-marker]");
      marker.style.left = `${((state.t + 1.5) / 3) * 100}%`;
      root.querySelector("[data-s4-region]").dataset.state = region;

      const result = root.querySelector("[data-s4-result]");
      const status = root.querySelector("[data-s4-status]");
      status.textContent = cls.label;
      if (region === "inside") {
        result.className = "ch5-result-card is-success";
        status.className = "ch5-status is-ok";
        root.querySelector("[data-s4-title]").textContent = "所有非零方向仍严格为正";
        root.querySelector("[data-s4-copy]").textContent = "方向值曲线完整位于 0 上方，同时 Δ₁>0、Δ₂>0。几何观察与 Sylvester 判据给出同一个结论：A(t) 正定。";
        root.querySelector("[data-s4-contour-copy]").textContent = "等高线是椭圆。t 越接近 ±1，椭圆越狭长，说明某个方向的二次变化正在变弱。";
        root.querySelector("[data-s4-scan-copy]").textContent = "整条 q(θ) 曲线高于 0；最低点就是当前最危险的方向。";
      } else if (region === "edge") {
        result.className = "ch5-result-card is-warning";
        status.className = "ch5-status is-warn";
        root.querySelector("[data-s4-title]").textContent = "最小方向第一次碰到 0";
        root.querySelector("[data-s4-copy]").textContent = "Δ₂=0，矩阵秩降为 1。二次型从正定变成半正定：不出现负值，但存在一条非零零方向。";
        root.querySelector("[data-s4-contour-copy]").textContent = "椭圆退化成平行线式的山谷结构；沿零方向移动，二次型值不变。";
        root.querySelector("[data-s4-scan-copy]").textContent = "q(θ) 恰好接触 0，但没有穿过；这正是半正定边界。";
      } else {
        result.className = "ch5-result-card is-warning";
        status.className = "ch5-status is-warn";
        root.querySelector("[data-s4-title]").textContent = "已经出现负方向";
        root.querySelector("[data-s4-copy]").textContent = "Δ₂<0，两个方向的符号一正一负。单位圆扫描穿过 0，二次型不定，曲面对应马鞍结构。";
        root.querySelector("[data-s4-contour-copy]").textContent = "等高线由椭圆转为双曲型；虚线方向对应 q(x)=0。";
        root.querySelector("[data-s4-scan-copy]").textContent = "曲线一部分在 0 上方、一部分在 0 下方，因此既能取正值也能取负值。";
      }

      M().drawContours(root.querySelector("[data-s4-contour]"), A, { caption: "等高线：观察椭圆如何退化并变成双曲型" });
      M().drawUnitCircleScan(root.querySelector("[data-s4-scan]"), A, { caption: "单位圆方向值 q(θ)：一次检查所有方向" });
    }

    root.querySelectorAll("[data-s4-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        state.t = Number(button.dataset.s4Preset);
        root.querySelectorAll("[data-s4-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
        paint();
      }, { signal });
    });
    root.querySelector("[data-s4-t]").addEventListener("input", (event) => {
      state.t = Number(event.target.value);
      root.querySelectorAll("[data-s4-preset]").forEach((item) => item.classList.toggle("is-active", Number(item.dataset.s4Preset) === state.t));
      paint();
    }, { signal });
    window.addEventListener("resize", paint, { signal, passive: true });
    paint();
    return () => controller.abort();
  }

  window.defineChapter5Renderer("positive-definite", { formal: renderFormal, interactive: mountLab });
})();
