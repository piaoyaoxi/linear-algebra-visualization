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
      "正定：每个非零方向都为正",
      "有限抽样不能证明正定。实对称矩阵正定当且仅当顺序主子式全为正，也当且仅当正惯性指数等于阶数。半正定不能把口诀简单改成“顺序主子式全非负”。",
      module(
        "1",
        "五种符号类型",
        "正定 / 半正定 / 负定 / 半负定 / 不定",
        `<p class="ch5-muted">正定要求对一切 ${tex("x\\neq0")} 有 ${tex("x^TAx>0")}。半正定允许非零零方向；不定则既能取正也能取负。</p>`,
      ) +
        module(
          "2",
          "顺序主子式判据",
          "只看左上角嵌套子矩阵",
          `<div class="ch5-poly">${tex("\\Delta_k=\\det A_k>0\\ (k=1,\\ldots,n)")}</div>
           <p class="ch5-muted" style="margin:10px 0 0">二阶：${tex("a>0")} 且 ${tex("ac-b^2>0")}。</p>`,
        ) +
        module(
          "3",
          "Gram 与 Cholesky",
          "结构连接，非本章唯一主线",
          `<p class="ch5-muted">${tex("x^TB^TBx=\\|Bx\\|^2\\ge0")}；正定矩阵可写 ${tex("A=R^TR")}。它们解释“为什么总是非负/正”，但不取代顺序主子式与标准形判据。</p>`,
        ),
    );
  }

  function mountLab(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch5-lab">
        <div class="ch5-lab-head">
          <h3>正定性实验室</h3>
          <p>同步调节 a、b、c，查看分类、顺序主子式、单位圆方向值与等高线。预设覆盖临界状态。</p>
        </div>
        <div class="ch5-toolbar" data-presets>
          <button type="button" class="is-active" data-p="id">单位</button>
          <button type="button" data-p="pd">正定椭圆</button>
          <button type="button" data-p="psd">半正定</button>
          <button type="button" data-p="nd">负定</button>
          <button type="button" data-p="indef">不定</button>
          <button type="button" data-p="edge">近临界</button>
        </div>
        <div class="ch5-lab-grid">
          <div class="ch5-panel">
            <div class="ch5-sliders">
              <label class="ch5-slider-row"><span>a</span><input data-k="a" type="range" min="-2" max="3" step="0.05" value="1" /><span data-v="a">1</span></label>
              <label class="ch5-slider-row"><span>b</span><input data-k="b" type="range" min="-2" max="2" step="0.05" value="0.3" /><span data-v="b">0.3</span></label>
              <label class="ch5-slider-row"><span>c</span><input data-k="c" type="range" min="-2" max="3" step="0.05" value="1.2" /><span data-v="c">1.2</span></label>
            </div>
            <div class="ch5-readout" data-class-card>
              <strong>分类</strong>
              <span data-class class="ch5-status">—</span>
              <p class="ch5-muted" data-class-note></p>
            </div>
            <div class="ch5-readout">
              <strong>顺序主子式仪表盘</strong>
              <div class="ch5-meters">
                <div class="ch5-meter"><span>Δ₁=a</span><strong data-d1>—</strong></div>
                <div class="ch5-meter"><span>Δ₂=ac−b²</span><strong data-d2>—</strong></div>
              </div>
              <p class="ch5-muted">Sylvester：正定 ⇔ Δ₁>0 且 Δ₂>0。当前 <span data-sylv class="ch5-status">—</span></p>
              <div data-minor-boxes style="margin-top:8px"></div>
            </div>
            <div class="ch5-readout">
              <strong>Cholesky 门</strong>
              <p class="ch5-muted" data-chol></p>
            </div>
          </div>
          <div class="ch5-panel">
            <div class="ch5-stage is-short"><canvas data-scan aria-label="单位圆扫描"></canvas></div>
            <div class="ch5-stage is-short"><canvas data-contour aria-label="等高线"></canvas></div>
            <div class="ch5-stage is-short"><canvas data-surface aria-label="曲面"></canvas></div>
          </div>
        </div>
        <div class="ch5-readout">
          <strong>Gram 一瞥</strong>
          <p class="ch5-muted">取 ${"B"} 为上三角因子试探：若 Cholesky 成功，则 ${"xᵀAx = ‖Rx‖² ≥ 0"}，且仅在 x=0 时取 0 当 R 可逆。</p>
          <div data-gram></div>
        </div>
      </div>`;

    const presets = {
      id: { a: 1, b: 0, c: 1 },
      pd: { a: 2, b: 0.5, c: 1.5 },
      psd: { a: 1, b: 0, c: 0 },
      nd: { a: -1.2, b: 0.2, c: -1 },
      indef: { a: 1, b: 0, c: -1 },
      edge: { a: 1, b: 0.95, c: 1 },
    };

    const state = { a: 1, b: 0.3, c: 1.2 };

    function A() {
      return M().mat2FromAbc(state.a, state.b, state.c);
    }

    function paint() {
      ["a", "b", "c"].forEach((k) => {
        root.querySelector(`[data-k="${k}"]`).value = String(state[k]);
        root.querySelector(`[data-v="${k}"]`).textContent = M().formatNum(state[k], 2);
      });
      const mat = A();
      const cls = M().classify2(mat);
      const classEl = root.querySelector("[data-class]");
      classEl.textContent = cls.label;
      classEl.className = `ch5-status ${cls.cls}`;
      root.querySelector("[data-class-note]").textContent =
        cls.key === "pd"
          ? "所有非零方向上 q>0；单位圆扫描曲线在 0 上方。"
          : cls.key === "psd"
            ? "q≥0 且存在非零零方向；曲线接触 0 但不穿过。"
            : cls.key === "indef"
              ? "既能取正也能取负；曲线穿过 0。"
              : cls.key === "nd"
                ? "所有非零方向上 q<0。"
                : "查看 Δ₁、Δ₂ 与惯性计数以细分。";

      const d1 = state.a;
      const d2 = state.a * state.c - state.b * state.b;
      root.querySelector("[data-d1]").textContent = M().formatNum(d1, 3);
      root.querySelector("[data-d2]").textContent = M().formatNum(d2, 3);
      const sylvOk = d1 > 1e-8 && d2 > 1e-8;
      const sylv = root.querySelector("[data-sylv]");
      sylv.textContent = sylvOk ? "顺序主子式全正 → 正定" : "未同时全正";
      sylv.className = `ch5-status ${sylvOk ? "is-ok" : "is-warn"}`;

      root.querySelector("[data-minor-boxes]").innerHTML = `
        <div class="ch5-compare">
          <div class="ch5-compare-card"><strong>A₁</strong><div>${M().matrixHtml([[state.a]])}</div><span class="ch5-muted">Δ₁=${M().formatNum(d1, 3)}</span></div>
          <div class="ch5-compare-card"><strong>A₂=A</strong><div>${M().matrixHtml(mat)}</div><span class="ch5-muted">Δ₂=${M().formatNum(d2, 3)}</span></div>
        </div>`;

      const chol = M().cholesky2(mat);
      root.querySelector("[data-chol]").textContent = chol.ok
        ? `成功：R=[[${M().formatNum(chol.R[0][0])}, ${M().formatNum(chol.R[0][1])}],[0, ${M().formatNum(chol.R[1][1])}]]，A=RᵀR。`
        : `中断于步骤 ${chol.step}：${chol.reason}`;

      root.querySelector("[data-gram]").innerHTML = chol.ok
        ? `<div class="ch5-poly">${tex("x^TAx=\\|Rx\\|^2")}</div>`
        : `<p class="ch5-muted">当前矩阵未通过 Cholesky 门；改用顺序主子式或标准形判断。</p>`;

      M().drawUnitCircleScan(root.querySelector("[data-scan]"), mat, {
        caption: "单位圆方向值 q(θ)",
      });
      M().drawContours(root.querySelector("[data-contour]"), mat, { caption: "等高线" });
      M().drawSurface(root.querySelector("[data-surface]"), mat, { caption: "曲面示意" });
      M().pulseClass(root.querySelector("[data-class-card]"));
    }

    root.querySelectorAll("[data-k]").forEach((input) => {
      input.addEventListener("input", () => {
        state[input.dataset.k] = Number(input.value);
        paint();
      });
    });

    root.querySelectorAll("[data-p]").forEach((btn) => {
      btn.addEventListener("click", () => {
        Object.assign(state, presets[btn.dataset.p]);
        root.querySelectorAll("[data-p]").forEach((b) => b.classList.toggle("is-active", b === btn));
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

  window.defineChapter5Renderer("positive-definite", {
    formal: renderFormal,
    interactive: mountLab,
  });
})();
