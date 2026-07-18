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
      <h2>标准形不唯一，符号骨架唯一</h2>
      <div class="ch5-foundation ch5s3-foundation">
        <p class="ch5-lead">上一节已经说明同一个二次型可以得到不同的标准形。本节不再追求某一组具体系数，而是寻找所有合法变量替换都无法改变的信息：正平方项、负平方项和零项的数量。</p>

        ${module(
          "01",
          "先看一个明显的反差",
          "数字不同，正负结构相同",
          `<div class="ch5s3-form-pair">
            <article class="ch5-card">${display("2y_1^2-3y_2^2")}<div><span class="is-positive">1 个正项</span><span class="is-negative">1 个负项</span></div></article>
            <b>同一个二次型还可以写成</b>
            <article class="ch5-card">${display("8z_1^2-\\frac34z_2^2")}<div><span class="is-positive">1 个正项</span><span class="is-negative">1 个负项</span></div></article>
          </div>
          <p class="ch5-muted">系数大小可以通过变量缩放改变；“一正一负”却没有改变。</p>`,
        )}

        ${module(
          "02",
          "从标准形到实规范形",
          "把大小归一，只留下 +1、−1 和 0",
          `<div class="ch5-equation">${display("f=z_1^2+\\cdots+z_p^2-z_{p+1}^2-\\cdots-z_{p+q}^2")}</div>
          <div class="ch5-mini-grid">
            <div class="ch5-card"><h4>p：正惯性指数</h4><p>二次型能够在一个子空间上恒正的最大维数。</p></div>
            <div class="ch5-card"><h4>q：负惯性指数</h4><p>二次型能够在一个子空间上恒负的最大维数。</p></div>
          </div>
          <p class="ch5-muted">零项数量为 ${inline("n-p-q")}；秩为 ${inline("p+q")}；符号差为 ${inline("p-q")}。</p>`,
        )}

        ${module(
          "03",
          "Sylvester 惯性定理",
          "可逆变量替换保持正、负方向的维数",
          `<div class="ch5-card ch5s3-theorem"><strong>定理</strong><p>实二次型经过任意非退化实线性替换化为标准形后，正系数项的个数 p 与负系数项的个数 q 唯一确定。</p></div>
          <div class="ch5-next-note"><span>直觉</span><p>可逆映射不会改变子空间的维数，因此不能凭空消灭一个正方向，也不能把正方向改造成负方向。只有替换变得不可逆、方向信息真正丢失时，计数才可能下降。</p></div>`,
        )}

        ${module(
          "04",
          "合同分类只比较惯性",
          "同秩不一定合同",
          `<div class="ch5s3-classification">
            <article class="ch5-card"><div>${display("\\operatorname{diag}(1,1)")}</div><p>秩 2，惯性 (2,0,0)：正定碗面。</p></article>
            <article class="ch5-card"><div>${display("\\operatorname{diag}(1,-1)")}</div><p>秩 2，惯性 (1,1,0)：不定马鞍。</p></article>
          </div>
          <p class="ch5-muted">二者秩相同但惯性不同，所以不合同。两个同阶实对称矩阵合同，当且仅当它们的 p、q 和零项数量完全相同。</p>`,
        )}
      </div>`;
  }

  function countHtml(inn) {
    return `<div class="ch5s3-counts"><div class="is-positive"><span>正</span><strong>${inn.p}</strong></div><div class="is-negative"><span>负</span><strong>${inn.q}</strong></div><div class="is-zero"><span>零</span><strong>${inn.zero}</strong></div></div>`;
  }

  function mountLab(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch5-lab ch5s3-lab">
        <div class="ch5-lab-head"><h3>惯性锁</h3><p>这里不让你同时调四个矩阵元素。只改变一个剪切参数 h，观察矩阵数字和等高线怎样明显变化，同时盯住正、负、零三个计数器。</p></div>
        <div class="ch5-task"><span>1</span><div><strong>选择一种符号结构</strong><p>先选“不定”，拖动 h；再按“让替换奇异”，比较什么时候惯性锁会失效。</p></div></div>
        <div class="ch5-toolbar" role="group" aria-label="选择原二次型">
          <button type="button" data-s3-preset="positive">两个正方向</button>
          <button type="button" class="is-active" data-s3-preset="indefinite">一正一负</button>
          <button type="button" data-s3-preset="rank1">一正一零</button>
        </div>
        <label class="ch5-range"><span>剪切参数 h</span><input type="range" min="-1.5" max="1.5" step="0.05" value="0" data-s3-h><output data-s3-h-value>0</output></label>
        <div class="ch5-controls-row"><p class="ch5-muted">正常路径使用 ${inline("C=\\begin{bmatrix}1&h\\\\0&1\\end{bmatrix}")}，所以 det C 恒为 1。</p><div class="ch5-toolbar"><button type="button" data-s3-singular>让替换奇异</button><button type="button" data-s3-reset>恢复可逆</button></div></div>

        <div class="ch5s3-compare">
          <article>
            <div class="ch5s3-compare-head"><div><span>原矩阵</span><strong>A</strong></div><div class="ch5-matrix-wrap" data-s3-a></div></div>
            <div class="ch5-stage"><canvas data-s3-a-canvas aria-label="原二次型等高线"></canvas></div>
            <div data-s3-a-counts></div>
          </article>
          <div class="ch5s3-arrow" aria-hidden="true"><span>CᵀAC</span><b>→</b></div>
          <article>
            <div class="ch5s3-compare-head"><div><span>变换后</span><strong>B</strong></div><div class="ch5-matrix-wrap" data-s3-b></div></div>
            <div class="ch5-stage"><canvas data-s3-b-canvas aria-label="合同后的二次型等高线"></canvas></div>
            <div data-s3-b-counts></div>
          </article>
        </div>

        <div class="ch5-lab-grid">
          <div class="ch5-reading">
            <h4>当前替换</h4>
            <div class="ch5-matrix-wrap" data-s3-c></div>
            <div class="ch5-reading-row"><span>det C</span><strong data-s3-det></strong></div>
            <div class="ch5-reading-row"><span>A 的多项式</span><strong data-s3-poly-a></strong></div>
            <div class="ch5-reading-row"><span>B 的多项式</span><strong data-s3-poly-b></strong></div>
          </div>
          <div class="ch5-result-card" data-s3-result><span class="ch5-status" data-s3-status></span><h4 data-s3-title></h4><p data-s3-copy></p></div>
        </div>
      </div>`;

    const controller = new AbortController();
    const signal = controller.signal;
    const presets = {
      positive: [[2, 0.35], [0.35, 1]],
      indefinite: [[1, 0.3], [0.3, -1]],
      rank1: [[1, 1], [1, 1]],
    };
    const state = { preset: "indefinite", h: 0, singular: false };

    function buildC() {
      return state.singular ? [[1, 1], [1, 1]] : [[1, state.h], [0, 1]];
    }

    function paint() {
      const A = presets[state.preset];
      const C = buildC();
      const B = M().symmetrize(M().congruence(A, C));
      const detC = M().det2(C);
      const invertible = Math.abs(detC) > 1e-8;
      const innA = M().inertiaSymmetric(A);
      const innB = M().inertiaSymmetric(B);
      const same = innA.p === innB.p && innA.q === innB.q && innA.zero === innB.zero;

      root.querySelector("[data-s3-h]").value = String(state.h);
      root.querySelector("[data-s3-h]").disabled = state.singular;
      root.querySelector("[data-s3-h-value]").textContent = state.singular ? "—" : M().formatNum(state.h, 2);
      root.querySelector("[data-s3-a]").innerHTML = M().matrixHtml(A);
      root.querySelector("[data-s3-b]").innerHTML = M().matrixHtml(B);
      root.querySelector("[data-s3-c]").innerHTML = M().matrixHtml(C);
      root.querySelector("[data-s3-det]").textContent = M().formatNum(detC, 4);
      root.querySelector("[data-s3-a-counts]").innerHTML = countHtml(innA);
      root.querySelector("[data-s3-b-counts]").innerHTML = countHtml(innB);
      root.querySelector("[data-s3-poly-a]").textContent = M().polyPlain2(A);
      root.querySelector("[data-s3-poly-b]").textContent = M().polyPlain2(B);

      const result = root.querySelector("[data-s3-result]");
      const status = root.querySelector("[data-s3-status]");
      if (invertible) {
        result.className = `ch5-result-card ${same ? "is-success" : "is-warning"}`;
        status.className = `ch5-status ${same ? "is-ok" : "is-warn"}`;
        status.textContent = same ? "惯性锁定" : "数值异常";
        root.querySelector("[data-s3-title]").textContent = "数字和形状变了，计数没有变";
        root.querySelector("[data-s3-copy]").textContent = "剪切可以改变矩阵元素、交叉项和等高线倾斜程度，但 det C≠0 时，正、负、零方向数量必须与 A 完全相同。";
      } else {
        result.className = "ch5-result-card is-warning";
        status.className = "ch5-status is-warn";
        status.textContent = "合同停止";
        root.querySelector("[data-s3-title]").textContent = "惯性定理的前提已经失效";
        root.querySelector("[data-s3-copy]").textContent = "det C=0，两个新变量方向被压到同一条线上。B 的秩和惯性可以下降，但这不是合同改变了惯性，而是替换已经不可逆。";
      }

      M().drawContours(root.querySelector("[data-s3-a-canvas]"), A, { caption: "A：原来的等高线" });
      M().drawContours(root.querySelector("[data-s3-b-canvas]"), B, { caption: invertible ? "B：拉伸或倾斜后，惯性不变" : "B：奇异压缩后的退化图像" });
    }

    root.querySelectorAll("[data-s3-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        state.preset = button.dataset.s3Preset;
        state.h = 0;
        state.singular = false;
        root.querySelectorAll("[data-s3-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
        paint();
      }, { signal });
    });
    root.querySelector("[data-s3-h]").addEventListener("input", (event) => {
      state.h = Number(event.target.value);
      state.singular = false;
      paint();
    }, { signal });
    root.querySelector("[data-s3-singular]").addEventListener("click", () => {
      state.singular = true;
      paint();
    }, { signal });
    root.querySelector("[data-s3-reset]").addEventListener("click", () => {
      state.singular = false;
      state.h = 0;
      paint();
    }, { signal });
    window.addEventListener("resize", paint, { signal, passive: true });
    paint();
    return () => controller.abort();
  }

  window.defineChapter5Renderer("quadratic-uniqueness", { formal: renderFormal, interactive: mountLab });
})();
