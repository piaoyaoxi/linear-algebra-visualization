(() => {
  const M = () => window.Ch3Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);

  function formalShell(title, lead, modulesHtml) {
    return `<h2>${title}</h2><div class="ch3-formal"><p class="ch3-formal-lead">${lead}</p>${modulesHtml}</div>`;
  }

  function module(num, title, sub, body) {
    return `<section class="ch3-module"><div class="ch3-module-heading"><span>${num}</span><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;
  }

  // ========== §4 Rank Observatory ==========
  function mountRankLab(root) {
    const presets = {
      full2: M().PRESETS.full2.A,
      rankOne: M().PRESETS.rankOne.A,
      fullCol32: M().PRESETS.fullCol32.A,
      dep: [
        [1, 2, 3],
        [2, 4, 6],
        [0, 1, 1],
      ],
    };
    const state = { key: "full2", A: M().matFromNumbers(presets.full2) };

    function render() {
      const rank = M().rankOf(state.A);
      const nums = M().matToNumbers(state.A);
      const cols = nums[0].map((_, j) => nums.map((row) => row[j]));
      const cert = M().relationCertificate(cols);
      root.querySelector("[data-mat]").textContent = M().formatMat(state.A);
      root.querySelector("[data-rank]").textContent = String(rank);
      root.querySelector("[data-bound]").textContent = `≤ ${Math.min(nums.length, nums[0].length)}`;
      root.querySelector("[data-col-note]").textContent = cert.dependent
        ? `列相关：${cert.coeffs.map((c, i) => `${M().formatF(c)}·c${i + 1}`).join(" + ")} = 0`
        : "当前列组线性无关（在列空间维数意义下已满）。";
      const aug = state.A.map((row) => [...row, M().F(0)]);
      const info = M().analyzeAugmented(aug);
      root.querySelector("[data-pivots]").textContent = info.pivots.map((p) => `列 ${p + 1}`).join(", ") || "—";
      root.querySelector("[data-rref]").textContent = M().formatMat(info.rref.map((r) => r.slice(0, -1)));
      M().pulseClass(root.querySelector("[data-rank-card]"));

      const canvas = root.querySelector("[data-ch3-canvas]");
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const { ctx, width, height } = sized;
      const frame = M().drawAxes(ctx, width, height, 40);
      if (nums.length >= 2 && nums[0].length >= 1) {
        const colors = [frame.p.accent, frame.p.coral, frame.p.blue];
        for (let j = 0; j < Math.min(3, nums[0].length); j += 1) {
          const v = [nums[0][j], nums[1] ? nums[1][j] : 0];
          M().drawArrow(ctx, frame, v, colors[j % colors.length], `c${j + 1}`);
        }
      }
    }

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-preset]").forEach((b) => b.classList.toggle("is-active", b === btn));
        state.key = btn.dataset.preset;
        state.A = M().matFromNumbers(presets[state.key]);
        render();
      });
    });
    root.querySelector("[data-row-add]").addEventListener("click", () => {
      if (state.A.length < 2) return;
      state.A = M().rowAdd(state.A, 1, 0, 1);
      render();
    });
    root.querySelector("[data-reset]").addEventListener("click", () => {
      state.A = M().matFromNumbers(presets[state.key]);
      render();
    });
    window.addEventListener(
      "resize",
      () => {
        if (document.body.contains(root)) render();
      },
      { passive: true },
    );
    render();
  }

  // ========== §5 Consistency Gate ==========
  function mountSolvability(root) {
    const presets = {
      full: {
        A: [
          [1, 0],
          [0, 1],
        ],
        b: [1, 1],
      },
      line: {
        A: [
          [1, 2],
          [2, 4],
        ],
        b: [1, 2],
      },
      miss: {
        A: [
          [1, 2],
          [2, 4],
        ],
        b: [1, 3],
      },
      homo: {
        A: [
          [1, 2],
          [2, 4],
        ],
        b: [0, 0],
      },
    };
    const state = {
      key: "line",
      A: M().matFromNumbers(presets.line.A),
      b: presets.line.b.slice(),
    };

    function render() {
      const augNums = M().matToNumbers(state.A).map((row, i) => [...row, state.b[i]]);
      const aug = M().matFromNumbers(augNums);
      const info = M().analyzeAugmented(aug);
      const rankA = M().rankOf(state.A);
      const ok = !info.inconsistent && info.rankA === info.rankAug;
      root.querySelector("[data-rank-a]").textContent = String(rankA);
      root.querySelector("[data-rank-aug]").textContent = String(info.rankAug);
      root.querySelector("[data-gate]").textContent = ok ? "有解 · b ∈ Col(A)" : "无解 · b ∉ Col(A)";
      root.querySelector("[data-gate]").className = `ch3-status ${ok ? "is-ok" : "is-bad"}`;
      root.querySelector("[data-mat]").textContent = M().formatMat(aug, state.A[0].length);
      root.querySelector("[data-b]").textContent = `(${state.b.map((v) => v.toFixed(2)).join(", ")})^T`;
      M().pulseClass(root.querySelector("[data-gate-card]"));

      const canvas = root.querySelector("[data-ch3-canvas]");
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const { ctx, width, height } = sized;
      const frame = M().drawAxes(ctx, width, height, 40);
      const An = M().matToNumbers(state.A);
      // draw column space for 2x2 rank1 as a line through origin along first col
      if (An.length >= 2) {
        const c0 = [An[0][0], An[1][0]];
        const c1 = An[0].length > 1 ? [An[0][1], An[1][1]] : [0, 0];
        M().drawArrow(ctx, frame, c0, frame.p.accent, "a1");
        if (An[0].length > 1) M().drawArrow(ctx, frame, c1, frame.p.coral, "a2");
        // column space line if rank 1
        if (rankA === 1) {
          const v = Math.hypot(c0[0], c0[1]) > 1e-9 ? c0 : c1;
          ctx.strokeStyle = frame.p.blue;
          ctx.setLineDash([6, 4]);
          ctx.lineWidth = 2;
          const [x0, y0] = [frame.cx - v[0] * frame.scale * 8, frame.cy + v[1] * frame.scale * 8];
          const [x1, y1] = [frame.cx + v[0] * frame.scale * 8, frame.cy - v[1] * frame.scale * 8];
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        M().drawPoint(ctx, frame, state.b, ok ? frame.p.accentStrong : frame.p.coral, "b");
      }
    }

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-preset]").forEach((b) => b.classList.toggle("is-active", b === btn));
        state.key = btn.dataset.preset;
        const p = presets[state.key];
        state.A = M().matFromNumbers(p.A);
        state.b = p.b.slice();
        root.querySelector('[data-bx]').value = state.b[0];
        root.querySelector('[data-by]').value = state.b[1];
        render();
      });
    });
    root.querySelector("[data-bx]").addEventListener("input", (e) => {
      state.b[0] = Number(e.target.value);
      render();
    });
    root.querySelector("[data-by]").addEventListener("input", (e) => {
      state.b[1] = Number(e.target.value);
      render();
    });
    window.addEventListener(
      "resize",
      () => {
        if (document.body.contains(root)) render();
      },
      { passive: true },
    );
    render();
  }

  // ========== §6 Solution Family ==========
  function mountSolutionFamily(root) {
    const presets = {
      unique: {
        aug: [
          [1, 1, 3],
          [1, 2, 4],
        ],
      },
      line: {
        aug: [
          [1, 1, 2],
          [2, 2, 4],
        ],
      },
      plane: {
        aug: [
          [1, 1, 1, 2],
          [2, 2, 2, 4],
        ],
      },
      homo: {
        aug: [
          [1, 1, 0],
          [2, 2, 0],
        ],
      },
    };
    const state = { key: "line", params: [0, 0] };

    function current() {
      const aug = M().matFromNumbers(presets[state.key].aug);
      const part = M().particularSolution(aug);
      const A = aug.map((row) => row.slice(0, -1));
      const ns = M().nullspaceBasis(A);
      return { aug, part, ns, A };
    }

    function render() {
      const { part, ns } = current();
      if (!part.ok) {
        root.querySelector("[data-sol]").textContent = "无解，不生成通解。";
        return;
      }
      const basis = ns.basis;
      const x = part.x.map((v) => M().toNumber(v));
      for (let k = 0; k < basis.length; k += 1) {
        const s = state.params[k] || 0;
        for (let i = 0; i < x.length; i += 1) x[i] += s * M().toNumber(basis[k][i]);
      }
      root.querySelector("[data-free]").textContent = basis.length ? basis.map((_, i) => `s${i + 1}`).join(", ") : "无";
      root.querySelector("[data-nullity]").textContent = String(basis.length);
      root.querySelector("[data-x0]").textContent = `(${part.x.map(M().formatF).join(", ")})^T`;
      root.querySelector("[data-basis]").textContent = basis.length
        ? basis.map((v, i) => `η${i + 1}=(${v.map(M().formatF).join(", ")})^T`).join("  ")
        : "仅零向量";
      root.querySelector("[data-sol]").textContent = `(${x.map((v) => v.toFixed(2)).join(", ")})^T`;
      const sliderBox = root.querySelector("[data-param-sliders]");
      sliderBox.innerHTML = basis
        .map(
          (_, i) =>
            `<label class="ch3-slider"><span>s${i + 1}</span><input type="range" min="-2" max="2" step="0.05" value="${state.params[i] || 0}" data-param="${i}" /><span>${(state.params[i] || 0).toFixed(2)}</span></label>`,
        )
        .join("") || `<p class="ch3-note">没有自由变量：解集是单点。</p>`;
      sliderBox.querySelectorAll("[data-param]").forEach((input) => {
        input.addEventListener("input", () => {
          const i = Number(input.dataset.param);
          state.params[i] = Number(input.value);
          input.nextElementSibling.textContent = state.params[i].toFixed(2);
          render();
        });
      });

      const canvas = root.querySelector("[data-ch3-canvas]");
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const { ctx, width, height } = sized;
      const frame = M().drawAxes(ctx, width, height, 40);
      if (x.length >= 2) {
        // draw affine line if one free in 2D
        if (basis.length === 1) {
          const d = [M().toNumber(basis[0][0]), M().toNumber(basis[0][1] || 0)];
          const p0 = [M().toNumber(part.x[0]), M().toNumber(part.x[1] || 0)];
          ctx.strokeStyle = frame.p.blue;
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 4]);
          const a = [p0[0] - 8 * d[0], p0[1] - 8 * d[1]];
          const b = [p0[0] + 8 * d[0], p0[1] + 8 * d[1]];
          const A = [frame.cx + a[0] * frame.scale, frame.cy - a[1] * frame.scale];
          const B = [frame.cx + b[0] * frame.scale, frame.cy - b[1] * frame.scale];
          ctx.beginPath();
          ctx.moveTo(A[0], A[1]);
          ctx.lineTo(B[0], B[1]);
          ctx.stroke();
          ctx.setLineDash([]);
          M().drawArrow(ctx, frame, d, frame.p.coral, "η");
          M().drawPoint(ctx, frame, p0, frame.p.accent, "x0");
        }
        M().drawPoint(ctx, frame, [x[0], x[1] || 0], frame.p.accentStrong, "x");
      }
      M().pulseClass(root.querySelector("[data-sol-card]"));
    }

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-preset]").forEach((b) => b.classList.toggle("is-active", b === btn));
        state.key = btn.dataset.preset;
        state.params = [0, 0];
        render();
      });
    });
    window.addEventListener(
      "resize",
      () => {
        if (document.body.contains(root)) render();
      },
      { passive: true },
    );
    render();
  }

  defineChapter3Renderer("matrix-rank", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "四个窗口，同一个秩",
        "列空间维数、行空间维数、主元个数与子式证书最终一致。",
        module(
          "01",
          "列秩与行秩",
          "独立信息的两种数法。",
          `<p class="ch3-note">列极大无关组的个数是列秩；行极大无关组的个数是行秩。二者相等，统称 ${tex("\\operatorname{rank}(A)")}。</p>`,
        ) +
          module(
            "02",
            "主元与行变换",
            "消元给出可计算的证书。",
            `<div class="ch3-card-grid">
              <article class="ch3-card"><span class="kicker">主元</span><h4>个数即秩</h4><p>阶梯形中非零主元的个数。</p></article>
              <article class="ch3-card"><span class="kicker">不变</span><h4>行变换</h4><p>初等行变换不改变秩。</p></article>
              <article class="ch3-card"><span class="kicker">上界</span><h4>min(m,n)</h4><p>独立方向不可能超过尺寸限制。</p></article>
            </div>`,
          ),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch3-lab">
          <div class="ch3-lab-head">
            <h3>秩观测台</h3>
            <p>切换预设并做一次行倍加，对照列几何、主元与秩值。</p>
          </div>
          <div class="ch3-presets">
            <button type="button" class="is-active" data-preset="full2">满秩 2×2</button>
            <button type="button" data-preset="rankOne">秩一外积</button>
            <button type="button" data-preset="fullCol32">3×2 满列秩</button>
            <button type="button" data-preset="dep">相关 3×3</button>
          </div>
          <div class="ch3-lab-grid">
            <div class="ch3-stage"><canvas data-ch3-canvas aria-label="列向量"></canvas></div>
            <div class="ch3-side">
              <div class="ch3-meter">
                <div class="ch3-meter-card" data-rank-card><strong>rank</strong><span data-rank>—</span></div>
                <div class="ch3-meter-card"><strong>上界</strong><span data-bound>—</span></div>
              </div>
              <div class="ch3-panel"><h4>矩阵</h4><pre class="ch3-matrix-pre" data-mat></pre></div>
              <div class="ch3-panel"><h4>主元列</h4><p class="ch3-note" data-pivots>—</p></div>
              <div class="ch3-panel"><h4>列关系</h4><p class="ch3-note" data-col-note>—</p></div>
              <div class="ch3-panel"><h4>行简化后的系数部分</h4><pre class="ch3-matrix-pre" data-rref></pre></div>
              <div class="ch3-toolbar">
                <button type="button" data-row-add>R2 ← R2+R1</button>
                <button type="button" data-reset>重置</button>
              </div>
            </div>
          </div>
        </div>`;
      mountRankLab(root);
    },
  });

  defineChapter3Renderer("solvability", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "b 是否落在列空间",
        `${tex("Ax=b")} 先问可达性：${tex("\\operatorname{rank}(A)=\\operatorname{rank}([A|b])")} 当且仅当有解。`,
        module(
          "01",
          "列组合视角",
          "未知量是组合系数。",
          `<p class="ch3-note">${tex("x_1a_1+\\cdots+x_na_n=b")}。有解意味着目标点可由列向量搭出。</p>`,
        ) +
          module(
            "02",
            "齐次特殊性",
            "零向量永远可达。",
            `<p class="ch3-note">${tex("Ax=0")} 总有零解；是否还有非零解取决于自由变量，下一节展开。</p>`,
          ),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch3-lab">
          <div class="ch3-lab-head">
            <h3>有解闸门</h3>
            <p>拖动目标 b，比较 rank(A) 与 rank([A|b])，并在列空间图上观察 b 的位置。</p>
          </div>
          <div class="ch3-presets">
            <button type="button" data-preset="full">满列空间</button>
            <button type="button" class="is-active" data-preset="line">直线列空间·在线上</button>
            <button type="button" data-preset="miss">直线列空间·线外</button>
            <button type="button" data-preset="homo">齐次 b=0</button>
          </div>
          <div class="ch3-lab-grid">
            <div class="ch3-stage"><canvas data-ch3-canvas aria-label="列空间与 b"></canvas></div>
            <div class="ch3-side">
              <div class="ch3-meter is-3">
                <div class="ch3-meter-card"><strong>rank(A)</strong><span data-rank-a>—</span></div>
                <div class="ch3-meter-card"><strong>rank([A|b])</strong><span data-rank-aug>—</span></div>
                <div class="ch3-meter-card" data-gate-card><strong>结论</strong><span data-gate class="ch3-status">—</span></div>
              </div>
              <label class="ch3-slider"><span>b1</span><input data-bx type="range" min="-2" max="2" step="0.05" value="1" /><span></span></label>
              <label class="ch3-slider"><span>b2</span><input data-by type="range" min="-2" max="2" step="0.05" value="2" /><span></span></label>
              <div class="ch3-panel"><h4>当前 b</h4><p class="ch3-note" data-b>—</p></div>
              <div class="ch3-panel"><h4>增广矩阵</h4><pre class="ch3-matrix-pre" data-mat></pre></div>
            </div>
          </div>
        </div>`;
      mountSolvability(root);
    },
  });

  defineChapter3Renderer("solution-structure", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "特解平移零空间",
        `有解时全部解写成 ${tex("x=x_0+x_h")}，其中 ${tex("Ax_0=b")} 且 ${tex("Ax_h=0")}。`,
        module(
          "01",
          "自由变量",
          "每个自由变量贡献一个齐次方向。",
          `<p class="ch3-note">主元列被约束；非主元列取参数。自由变量个数等于 ${tex("n-\\operatorname{rank}(A)")}。</p>`,
        ) +
          module(
            "02",
            "数量分类",
            "不要用“方程个数 vs 未知数个数”偷懒。",
            `<div class="ch3-card-grid">
              <article class="ch3-card"><span class="kicker">无解</span><h4>增广秩更大</h4><p>${tex("\\operatorname{rank}(A)<\\operatorname{rank}([A|b])")}</p></article>
              <article class="ch3-card"><span class="kicker">唯一</span><h4>满列秩有解</h4><p>${tex("\\operatorname{rank}(A)=n")}</p></article>
              <article class="ch3-card"><span class="kicker">无穷</span><h4>有自由变量</h4><p>${tex("\\operatorname{rank}(A)<n")}</p></article>
            </div>`,
          ),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch3-lab">
          <div class="ch3-lab-head">
            <h3>解族生成器</h3>
            <p>拆解特解与齐次方向，拖动参数观察仿射解集。</p>
          </div>
          <div class="ch3-presets">
            <button type="button" data-preset="unique">唯一解</button>
            <button type="button" class="is-active" data-preset="line">仿射直线</button>
            <button type="button" data-preset="plane">平面解集</button>
            <button type="button" data-preset="homo">齐次系统</button>
          </div>
          <div class="ch3-lab-grid">
            <div class="ch3-stage"><canvas data-ch3-canvas aria-label="解集"></canvas></div>
            <div class="ch3-side">
              <div class="ch3-meter">
                <div class="ch3-meter-card"><strong>自由度</strong><span data-nullity>—</span></div>
                <div class="ch3-meter-card" data-sol-card><strong>当前解</strong><span style="font-size:12px" data-sol>—</span></div>
              </div>
              <div class="ch3-panel"><h4>特解 x0</h4><p class="ch3-note" data-x0>—</p></div>
              <div class="ch3-panel"><h4>齐次基</h4><p class="ch3-note" data-basis>—</p></div>
              <div class="ch3-panel"><h4>自由变量</h4><p class="ch3-note" data-free>—</p></div>
              <div data-param-sliders class="ch3-sliders"></div>
            </div>
          </div>
        </div>`;
      mountSolutionFamily(root);
    },
  });
})();
