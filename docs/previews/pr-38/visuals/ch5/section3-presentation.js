(() => {
  const M = () => window.Ch5Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);

  function formalShell(title, lead, modulesHtml) {
    return `<h2>${title}</h2><div class="ch5-formal"><p class="ch5-formal-lead">${lead}</p>${modulesHtml}</div>`;
  }

  function module(num, title, sub, body) {
    return `<section class="ch5-module"><div class="ch5-module-heading"><span>${num}</span><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = formalShell(
      "标准形不唯一，惯性唯一",
      "同一个实二次型可以有许多标准形，但正平方项个数与负平方项个数不会因可逆替换而改变。这就是 Sylvester 惯性定理，也是合同分类的钥匙。",
      module(
        "1",
        "从标准形到规范形",
        "缩放系数到 ±1",
        `<p class="ch5-muted">复数域：非零项都可化为 1，只剩秩。实数域：${tex("f=z_1^2+\\cdots+z_p^2-z_{p+1}^2-\\cdots-z_{p+q}^2")}。</p>`,
      ) +
        module(
          "2",
          "惯性定理",
          "p 与 q 是合同不变量",
          `<p class="ch5-muted">经任意非退化实替换化标准形后，正系数项个数 p 与负系数项个数 q 唯一确定。rank=p+q，符号差=p−q。</p>`,
        ) +
        module(
          "3",
          "合同分类",
          "同阶实对称矩阵",
          `<p class="ch5-muted">A 与 B 合同 ⇔ 它们有相同的 (p,q)。只比较秩不够；一般合同也不保持每个特征值的具体数值。</p>`,
        ),
    );
  }

  function mountLab(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch5-lab">
        <div class="ch5-lab-head">
          <h3>惯性锁 Inertia Lock</h3>
          <p>固定 A，改变可逆 C。矩阵元素与等高线可变，但 p、q、零项数在 det C≠0 时锁定。</p>
        </div>
        <div class="ch5-toolbar" data-a-presets>
          <button type="button" class="is-active" data-ap="pd">正定碗</button>
          <button type="button" data-ap="psd">半正定山谷</button>
          <button type="button" data-ap="indef">不定马鞍</button>
          <button type="button" data-ap="nd">负定</button>
        </div>
        <div class="ch5-lab-grid is-triple">
          <div class="ch5-panel">
            <div class="ch5-readout">
              <strong>矩阵 A</strong>
              <div data-mat-a></div>
            </div>
            <div class="ch5-sliders">
              <label class="ch5-slider-row"><span>θ</span><input data-theta type="range" min="0" max="6.28" step="0.02" value="0.4" /><span data-theta-v>0.4</span></label>
              <label class="ch5-slider-row"><span>s</span><input data-scale type="range" min="0.4" max="2.2" step="0.05" value="1.2" /><span data-scale-v>1.2</span></label>
            </div>
            <p class="ch5-muted">C 由旋转角 θ 与缩放 s 生成；也可拖到奇异附近观察断点。</p>
            <label class="ch5-slider-row"><span>ε</span><input data-eps type="range" min="0" max="1" step="0.01" value="1" /><span data-eps-v>1</span></label>
            <p class="ch5-muted">ε 控制第二列长度；ε=0 时 det C=0。</p>
          </div>
          <div class="ch5-panel">
            <div class="ch5-readout" data-b-card>
              <strong>B = CᵀAC</strong>
              <div data-mat-b></div>
              <p class="ch5-muted">det C = <span data-det></span> · <span data-status class="ch5-status">—</span></p>
            </div>
            <div class="ch5-meters">
              <div class="ch5-meter"><span>p</span><strong data-p>—</strong></div>
              <div class="ch5-meter"><span>q</span><strong data-q>—</strong></div>
              <div class="ch5-meter"><span>zero</span><strong data-z>—</strong></div>
              <div class="ch5-meter"><span>rank</span><strong data-r>—</strong></div>
              <div class="ch5-meter"><span>sig</span><strong data-sig>—</strong></div>
            </div>
          </div>
          <div class="ch5-panel">
            <div class="ch5-stage is-short"><canvas data-contour aria-label="等高线"></canvas></div>
            <div class="ch5-stage is-short"><canvas data-surface aria-label="曲面示意"></canvas></div>
          </div>
        </div>
      </div>`;

    const aPresets = {
      pd: [
        [2, 0.3],
        [0.3, 1.2],
      ],
      psd: [
        [1, 0],
        [0, 0],
      ],
      indef: [
        [1, 0.2],
        [0.2, -1],
      ],
      nd: [
        [-1.5, 0.2],
        [0.2, -1],
      ],
    };

    const state = {
      A: M().cloneMat(aPresets.pd),
      theta: 0.4,
      scale: 1.2,
      eps: 1,
    };

    function buildC() {
      const ct = Math.cos(state.theta);
      const st = Math.sin(state.theta);
      // columns: scaled rotation, second column multiplied by eps
      return [
        [state.scale * ct, state.scale * state.eps * -st],
        [state.scale * st, state.scale * state.eps * ct],
      ];
    }

    function paint() {
      root.querySelector("[data-theta]").value = String(state.theta);
      root.querySelector("[data-theta-v]").textContent = M().formatNum(state.theta, 2);
      root.querySelector("[data-scale]").value = String(state.scale);
      root.querySelector("[data-scale-v]").textContent = M().formatNum(state.scale, 2);
      root.querySelector("[data-eps]").value = String(state.eps);
      root.querySelector("[data-eps-v]").textContent = M().formatNum(state.eps, 2);

      const C = buildC();
      const detC = M().det2(C);
      const invertible = Math.abs(detC) > 1e-8;
      const B = M().symmetrize(M().congruence(state.A, C));
      // Inertia is contract-invariant only when invertible; always compute of A for lock display when invertible
      const innA = M().inertiaSymmetric(state.A);
      const innB = M().inertiaSymmetric(B);
      const inn = invertible ? innA : innB;

      root.querySelector("[data-mat-a]").innerHTML = M().matrixHtml(state.A);
      root.querySelector("[data-mat-b]").innerHTML = M().matrixHtml(B);
      root.querySelector("[data-det]").textContent = M().formatNum(detC, 3);
      const st = root.querySelector("[data-status]");
      if (invertible) {
        st.textContent = "惯性锁定";
        st.className = "ch5-status is-ok";
        // verify p,q match
        if (innA.p !== innB.p || innA.q !== innB.q) {
          st.textContent = "计算异常";
          st.className = "ch5-status is-bad";
        }
      } else {
        st.textContent = "替换退化 · 停止合同";
        st.className = "ch5-status is-bad";
      }

      root.querySelector("[data-p]").textContent = String(inn.p);
      root.querySelector("[data-q]").textContent = String(inn.q);
      root.querySelector("[data-z]").textContent = String(inn.zero);
      root.querySelector("[data-r]").textContent = String(inn.rank);
      root.querySelector("[data-sig]").textContent = String(inn.signature);

      M().drawContours(root.querySelector("[data-contour]"), invertible ? B : state.A, {
        caption: invertible ? "合同下形状可变，惯性不变" : "退化路径上的图像",
      });
      M().drawSurface(root.querySelector("[data-surface]"), invertible ? B : state.A, {
        caption: "曲面类型示意",
      });
      M().pulseClass(root.querySelector("[data-b-card]"));
    }

    root.querySelectorAll("[data-ap]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.A = M().cloneMat(aPresets[btn.dataset.ap]);
        root.querySelectorAll("[data-ap]").forEach((b) => b.classList.toggle("is-active", b === btn));
        paint();
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
