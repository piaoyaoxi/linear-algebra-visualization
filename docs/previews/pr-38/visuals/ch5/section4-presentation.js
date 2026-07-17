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
      "正定：所有非零方向都为正",
      "有限个向量抽样永远不能证明正定。实对称矩阵正定 ⇔ 顺序主子式全正 ⇔ 正惯性指数 p=n。半正定不能把口诀改成“顺序主子式全非负”。",
      module(
        "1",
        "五种符号类型",
        "看非零方向上的取值结构",
        `<ul class="ch5-rule-list">
           <li><strong>正定</strong>：一切 ${tex("x\\neq0")} 有 ${tex("x^TAx>0")}</li>
           <li><strong>半正定</strong>：${tex("x^TAx\\ge0")}，且存在非零零方向</li>
           <li><strong>负定 / 半负定</strong>：符号相反</li>
           <li><strong>不定</strong>：既能取正也能取负</li>
         </ul>`,
      ) +
        module(
          "2",
          "顺序主子式判据",
          "只看左上角嵌套子矩阵",
          `${display("\\Delta_1>0,\\ \\Delta_2>0,\\ \\ldots,\\ \\Delta_n>0")}
           <p class="ch5-muted" style="margin:12px 0 0">二阶：${tex("a>0")} 且 ${tex("ac-b^2>0")}。不要用“对角元为正”“行列式为正”“元素全为正”代替。</p>`,
        ) +
        module(
          "3",
          "Gram 与 Cholesky",
          "结构连接，不是本章唯一主线",
          `<p class="ch5-muted">${tex("x^TB^TBx=\\|Bx\\|^2\\ge0")}，故 ${tex("B^TB")} 半正定；列满秩时正定。正定矩阵可写 ${tex("A=R^TR")}，给出长度平方解释，但不取代顺序主子式与标准形判据。</p>`,
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
          <p>调节 a、b、c，同步读分类、顺序主子式与单位圆方向值。预设覆盖正定、半正定、不定与临界边界。</p>
        </div>
        <div class="ch5-toolbar" data-presets>
          <button type="button" class="is-active" data-p="id">单位</button>
          <button type="button" data-p="pd">正定</button>
          <button type="button" data-p="psd">半正定</button>
          <button type="button" data-p="nd">负定</button>
          <button type="button" data-p="indef">不定</button>
          <button type="button" data-p="edge">临界（半正定）</button>
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
              <div class="ch5-sylvester" data-sylv-boxes></div>
              <p class="ch5-muted">Sylvester：正定 ⇔ Δ₁>0 且 Δ₂>0。
                当前 <span data-sylv class="ch5-status">—</span></p>
            </div>
            <div class="ch5-readout">
              <strong>Cholesky 门（扩展）</strong>
              <p class="ch5-muted" data-chol></p>
              <div data-chol-mat class="ch5-matrix-wrap"></div>
            </div>
          </div>
          <div class="ch5-panel">
            <div class="ch5-toolbar" data-view-bar>
              <button type="button" class="is-active" data-view="scan">单位圆扫描</button>
              <button type="button" data-view="contour">等高线</button>
            </div>
            <div class="ch5-stage" data-stage-scan><canvas data-scan aria-label="单位圆方向值"></canvas></div>
            <div class="ch5-stage" data-stage-contour hidden><canvas data-contour aria-label="等高线"></canvas></div>
            <div class="ch5-readout">
              <strong>读图要点</strong>
              <ul class="ch5-rule-list" data-read-tips>
                <li>正定：q(θ) 全程在 0 上方</li>
                <li>半正定：接触 0 但不穿过</li>
                <li>不定：曲线穿过 0</li>
              </ul>
            </div>
          </div>
        </div>
      </div>`;

    // Critical PSD: a=1, b=1, c=1 → ac-b²=0, a>0
    const presets = {
      id: { a: 1, b: 0, c: 1 },
      pd: { a: 2, b: 0.4, c: 1.5 },
      psd: { a: 1, b: 0, c: 0 },
      nd: { a: -1.2, b: 0.15, c: -1 },
      indef: { a: 1, b: 0.2, c: -1 },
      edge: { a: 1, b: 1, c: 1 },
    };

    const state = { a: 1, b: 0.3, c: 1.2, view: "scan" };

    function mat() {
      return M().mat2FromAbc(state.a, state.b, state.c);
    }

    function paint(opts = {}) {
      ["a", "b", "c"].forEach((k) => {
        root.querySelector(`[data-k="${k}"]`).value = String(state[k]);
        root.querySelector(`[data-v="${k}"]`).textContent = M().formatNum(state[k], 2);
      });

      const A = mat();
      const cls = M().classify2(A);
      const classEl = root.querySelector("[data-class]");
      classEl.textContent = cls.label;
      classEl.className = `ch5-status ${cls.cls}`;

      const notes = {
        pd: "所有非零方向 q>0。单位圆扫描全程在 0 上方；顺序主子式应全正。",
        psd: "q≥0 且存在非零零方向。曲线接触 0 但不穿过；Δ₂=0 是典型临界信号。",
        indef: "既能取正也能取负。曲线穿过 0；Δ₂ 通常为负。",
        nd: "所有非零方向 q<0。",
        nsd: "q≤0 且存在非零零方向。",
        zero: "恒为 0。",
        other: "查看 Δ₁、Δ₂ 与惯性计数细分。",
      };
      root.querySelector("[data-class-note]").textContent = notes[cls.key] || notes.other;

      const d1 = state.a;
      const d2 = state.a * state.c - state.b * state.b;
      const sylvOk = d1 > 1e-8 && d2 > 1e-8;
      const sylv = root.querySelector("[data-sylv]");
      sylv.textContent = sylvOk ? "全正 → 判为正定" : "未同时全正";
      sylv.className = `ch5-status ${sylvOk ? "is-ok" : "is-warn"}`;

      const d1ok = d1 > 1e-8;
      const d2ok = d2 > 1e-8;
      root.querySelector("[data-sylv-boxes]").innerHTML = `
        <div class="ch5-sylv-card ${d1ok ? "is-ok" : "is-bad"}">
          <div class="ch5-sylv-kicker">A₁ · 左上 1×1</div>
          ${M().matrixHtml([[state.a]])}
          <div>Δ₁ = ${M().formatNum(d1, 3)} ${d1ok ? "> 0" : "≤ 0"}</div>
        </div>
        <div class="ch5-sylv-card ${d2ok ? "is-ok" : "is-bad"}">
          <div class="ch5-sylv-kicker">A₂ = A · 左上 2×2</div>
          ${M().matrixHtml(A)}
          <div>Δ₂ = ac−b² = ${M().formatNum(d2, 3)} ${d2ok ? "> 0" : "≤ 0"}</div>
        </div>`;

      const chol = M().cholesky2(A);
      if (chol.ok) {
        root.querySelector("[data-chol]").textContent = "成功：得到上三角 R，满足 A = RᵀR，从而 xᵀAx = ‖Rx‖²。";
        root.querySelector("[data-chol-mat]").innerHTML = M().matrixHtml(chol.R);
      } else {
        root.querySelector("[data-chol]").textContent = `中断于步骤 ${chol.step}：${chol.reason}`;
        root.querySelector("[data-chol-mat]").innerHTML = chol.Rpartial ? M().matrixHtml(chol.Rpartial) : "";
      }

      root.querySelector("[data-stage-scan]").hidden = state.view !== "scan";
      root.querySelector("[data-stage-contour]").hidden = state.view !== "contour";
      if (state.view === "scan") {
        M().drawUnitCircleScan(root.querySelector("[data-scan]"), A, {
          caption: "单位圆方向值 q(θ)",
        });
      } else {
        M().drawContours(root.querySelector("[data-contour]"), A, {
          caption: "等高线：正定偏椭圆型，不定偏双曲型",
        });
      }

      if (opts.pulse) M().pulseClass(root.querySelector("[data-class-card]"));
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
        paint({ pulse: true });
      });
    });

    root.querySelectorAll("[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.view = btn.dataset.view;
        root.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("is-active", b === btn));
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
