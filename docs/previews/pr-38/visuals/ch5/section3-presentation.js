(() => {
  const M = () => window.Ch5Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);
  const display = (s) => (window.texDisplay ? window.texDisplay(s) : s);

  function formalShell(title, lead, body) {
    return `<h2>${title}</h2><div class="ch5-formal"><p class="ch5-formal-lead">${lead}</p>${body}</div>`;
  }

  function module(num, title, sub, body) {
    return `<section class="ch5-module"><div class="ch5-module-heading"><span>${num}</span><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = formalShell(
      "标准形不唯一，惯性唯一",
      "同一个实二次型可以写出许多标准形，但正平方项个数与负平方项个数不会因可逆替换而改变。这就是 Sylvester 惯性定理，也是实对称矩阵合同分类的标签。",
      module(
        "1",
        "从标准形到规范形",
        "缩放系数到 ±1",
        `<p class="ch5-muted">复数域：非零项可全部化为 1，不变量只有秩。</p>
         <p class="ch5-muted">实数域：${tex("f=z_1^2+\\cdots+z_p^2-z_{p+1}^2-\\cdots-z_{p+q}^2")}，其中 p、q 为正、负惯性指数。</p>`,
      ) +
        module(
          "2",
          "惯性定理",
          "p 与 q 是合同不变量",
          `${display("\\operatorname{rank}=p+q,\\quad \\text{符号差}=p-q")}
           <p class="ch5-muted" style="margin:12px 0 0">任意非退化实替换化到标准形后，正系数项个数 p 与负系数项个数 q 唯一确定。一般合同不保持每个特征值的具体数值。</p>`,
        ) +
        module(
          "3",
          "合同分类",
          "同阶实对称矩阵",
          `<p class="ch5-muted">A 与 B 合同 ⇔ 它们有相同的 (p,q)。只比较秩不够：例如 diag(1,−1) 与 diag(1,1) 秩都是 2，但不定与正定互不合同。</p>`,
        ),
    );
  }

  function mountLab(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch5-lab">
        <div class="ch5-lab-head">
          <h3>惯性锁</h3>
          <p>固定 A，用可逆 C 做合同得到 B。系数与等高线会变，但在 det C≠0 时 p、q、零项数锁定。把 ε 拉到 0 可观察退化断点。</p>
        </div>
        <div class="ch5-toolbar" data-a-presets>
          <button type="button" class="is-active" data-ap="pd">正定 (2,0)</button>
          <button type="button" data-ap="psd">半正定 (1,0)</button>
          <button type="button" data-ap="indef">不定 (1,1)</button>
          <button type="button" data-ap="nd">负定 (0,2)</button>
        </div>
        <div class="ch5-lab-grid">
          <div class="ch5-panel">
            <div class="ch5-readout">
              <strong>矩阵 A（固定）</strong>
              <div data-mat-a class="ch5-matrix-wrap"></div>
              <p class="ch5-muted">A 的惯性（目标锁）：p=<span data-ap></span>，q=<span data-aq></span></p>
            </div>
            <div class="ch5-sliders">
              <label class="ch5-slider-row"><span>旋转 θ</span><input data-theta type="range" min="0" max="6.28" step="0.02" value="0.5" /><span data-theta-v>0.5</span></label>
              <label class="ch5-slider-row"><span>缩放 s</span><input data-scale type="range" min="0.4" max="2.2" step="0.05" value="1.2" /><span data-scale-v>1.2</span></label>
              <label class="ch5-slider-row"><span>ε（第 2 列）</span><input data-eps type="range" min="0" max="1" step="0.01" value="1" /><span data-eps-v>1</span></label>
            </div>
            <p class="ch5-muted">C 由旋转与缩放生成；ε=0 时第二列消失，det C=0，合同前提失效。</p>
            <div class="ch5-readout">
              <strong>当前 C</strong>
              <div data-mat-c class="ch5-matrix-wrap"></div>
              <p class="ch5-muted">det C = <span data-det></span></p>
            </div>
          </div>
          <div class="ch5-panel">
            <div class="ch5-readout" data-b-card>
              <strong>B = Cᵀ A C</strong>
              <div data-mat-b class="ch5-matrix-wrap"></div>
              <p class="ch5-muted"><span data-status class="ch5-status">—</span></p>
              <p class="ch5-muted" data-status-note></p>
            </div>
            <div class="ch5-meters" data-meters>
              <div class="ch5-meter"><span>p 正</span><strong data-p>—</strong></div>
              <div class="ch5-meter"><span>q 负</span><strong data-q>—</strong></div>
              <div class="ch5-meter"><span>零项</span><strong data-z>—</strong></div>
              <div class="ch5-meter"><span>秩</span><strong data-r>—</strong></div>
              <div class="ch5-meter"><span>符号差</span><strong data-sig>—</strong></div>
            </div>
            <div class="ch5-stage"><canvas data-contour aria-label="B 的等高线"></canvas></div>
            <p class="ch5-muted">说明：p、q 由实对称矩阵的符号结构（标准形系数符号）计算；可逆合同时它们必须与 A 一致。</p>
          </div>
        </div>
      </div>`;

    const aPresets = {
      pd: [
        [2, 0.4],
        [0.4, 1.2],
      ],
      psd: [
        [1, 0],
        [0, 0],
      ],
      indef: [
        [1, 0.25],
        [0.25, -1],
      ],
      nd: [
        [-1.4, 0.2],
        [0.2, -1],
      ],
    };

    const state = {
      A: M().cloneMat(aPresets.pd),
      theta: 0.5,
      scale: 1.2,
      eps: 1,
    };

    function buildC() {
      const ct = Math.cos(state.theta);
      const st = Math.sin(state.theta);
      return [
        [state.scale * ct, state.scale * state.eps * -st],
        [state.scale * st, state.scale * state.eps * ct],
      ];
    }

    function paint(opts = {}) {
      root.querySelector("[data-theta]").value = String(state.theta);
      root.querySelector("[data-theta-v]").textContent = M().formatNum(state.theta, 2);
      root.querySelector("[data-scale]").value = String(state.scale);
      root.querySelector("[data-scale-v]").textContent = M().formatNum(state.scale, 2);
      root.querySelector("[data-eps]").value = String(state.eps);
      root.querySelector("[data-eps-v]").textContent = M().formatNum(state.eps, 2);

      const innA = M().inertiaSymmetric(state.A);
      root.querySelector("[data-mat-a]").innerHTML = M().matrixHtml(state.A);
      root.querySelector("[data-ap]").textContent = String(innA.p);
      root.querySelector("[data-aq]").textContent = String(innA.q);

      const C = buildC();
      const detC = M().det2(C);
      const invertible = Math.abs(detC) > 1e-8;
      const B = M().symmetrize(M().congruence(state.A, C));
      const innB = M().inertiaSymmetric(B);

      root.querySelector("[data-mat-c]").innerHTML = M().matrixHtml(C);
      root.querySelector("[data-mat-b]").innerHTML = M().matrixHtml(B);
      root.querySelector("[data-det]").textContent = M().formatNum(detC, 3);

      const st = root.querySelector("[data-status]");
      const note = root.querySelector("[data-status-note]");
      const meters = root.querySelector("[data-meters]");

      if (invertible) {
        const locked = innA.p === innB.p && innA.q === innB.q;
        st.textContent = locked ? "惯性锁定 · 合同有效" : "数值异常";
        st.className = `ch5-status ${locked ? "is-ok" : "is-bad"}`;
        note.textContent = locked
          ? "B 的具体数字变了，但 (p,q) 与 A 相同。这就是惯性定理要保护的信息。"
          : "可逆合同时惯性应一致；请检查计算。";
        meters.classList.remove("is-disabled");
        // always show A's inertia as the locked truth when invertible
        root.querySelector("[data-p]").textContent = String(innA.p);
        root.querySelector("[data-q]").textContent = String(innA.q);
        root.querySelector("[data-z]").textContent = String(innA.zero);
        root.querySelector("[data-r]").textContent = String(innA.rank);
        root.querySelector("[data-sig]").textContent = String(innA.signature);
      } else {
        st.textContent = "替换退化 · 停止合同";
        st.className = "ch5-status is-bad";
        note.textContent = "det C=0：变量信息丢失，惯性定理不适用。下方计数若变化，不能当作“合同改变了惯性”的反例。";
        meters.classList.add("is-disabled");
        root.querySelector("[data-p]").textContent = String(innB.p);
        root.querySelector("[data-q]").textContent = String(innB.q);
        root.querySelector("[data-z]").textContent = String(innB.zero);
        root.querySelector("[data-r]").textContent = String(innB.rank);
        root.querySelector("[data-sig]").textContent = String(innB.signature);
      }

      M().drawContours(root.querySelector("[data-contour]"), invertible ? B : state.A, {
        caption: invertible ? "合同下等高线可变，惯性不变" : "退化路径上的图像（非合同）",
      });

      if (opts.pulse) M().pulseClass(root.querySelector("[data-b-card]"));
    }

    root.querySelectorAll("[data-ap]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.A = M().cloneMat(aPresets[btn.dataset.ap]);
        root.querySelectorAll("[data-ap]").forEach((b) => b.classList.toggle("is-active", b === btn));
        paint({ pulse: true });
      });
    });

    root.querySelector("[data-theta]").addEventListener("input", (e) => {
      state.theta = Number(e.target.value);
      paint();
    });
    root.querySelector("[data-scale]").addEventListener("input", (e) => {
      state.scale = Number(e.target.value);
      paint();
    });
    root.querySelector("[data-eps]").addEventListener("input", (e) => {
      state.eps = Number(e.target.value);
      paint();
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

  window.defineChapter5Renderer("quadratic-uniqueness", {
    formal: renderFormal,
    interactive: mountLab,
  });
})();
