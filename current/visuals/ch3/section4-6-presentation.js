(() => {
  const M = () => window.Ch3Math;
  const tex = (s) => M().tex(s);

  function formalShell(title, lead, body) {
    return `<h2>${title}</h2><div class="ch3-formal"><p class="ch3-formal-lead">${lead}</p>${body}</div>`;
  }

  function module(num, title, sub, body) {
    return `<section class="ch3-module"><div class="ch3-module-heading"><span>${num}</span><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;
  }

  // ========== §4 ==========
  function mountRankLab(root) {
    const presets = {
      full2: M().PRESETS.full2.A,
      rankOne: M().PRESETS.rankOne.A,
      fullCol32: M().PRESETS.fullCol32.A,
      dep: M().PRESETS.dep33.A,
    };
    const state = { key: "full2", A: M().matFromNumbers(presets.full2) };

    function render() {
      const rank = M().rankOf(state.A);
      const m = state.A.length;
      const n = state.A[0].length;
      const aug = state.A.map((row) => [...row, M().F(0)]);
      const info = M().analyzeAugmented(aug);
      const cols = M().matToNumbers(state.A)[0].map((_, j) => M().matToNumbers(state.A).map((row) => row[j]));
      // only use first min(dim) components for 2d cert
      const cols2 = cols.map((c) => c.slice(0, Math.min(2, c.length)));
      const cert = M().relationCertificate(cols2.length ? cols2 : cols);

      root.querySelector("[data-mat]").innerHTML = M().htmlMat(state.A);
      root.querySelector("[data-rank]").textContent = String(rank);
      root.querySelector("[data-bound]").textContent = `≤ ${Math.min(m, n)}`;
      root.querySelector("[data-pivots]").innerHTML = info.pivots.length
        ? tex(info.pivots.map((p) => `\\text{列 }${p + 1}`).join(",\\;"))
        : "—";
      root.querySelector("[data-rref]").innerHTML = M().htmlMat(info.rref.map((r) => r.slice(0, -1)));
      root.querySelector("[data-col-note]").innerHTML = cert.dependent
        ? tex(M().latexRelation(cert.coeffs).replace(/v_/g, "c_"))
        : tex("\\text{当前列在投影视图下线性无关}");
      root.querySelector("[data-size]").textContent = `${m}×${n}`;
      M().pulseClass(root.querySelector("[data-rank-card]"));

      const canvas = root.querySelector("[data-ch3-canvas]");
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const { ctx, width, height } = sized;
      const frame = M().drawAxes(ctx, width, height, 42);
      const An = M().matToNumbers(state.A);
      const colors = [frame.p.accent, frame.p.coral, frame.p.blue];
      if (An.length >= 2) {
        if (An[0].length >= 2) M().drawSpanDisk(ctx, frame, [
          [An[0][0], An[1][0]],
          [An[0][1], An[1][1]],
        ], frame.p.accent);
        for (let j = 0; j < Math.min(3, An[0].length); j += 1) {
          M().drawArrow(ctx, frame, [An[0][j], An[1][j]], colors[j % colors.length], `c${j + 1}`);
        }
        if (An.length > 2) {
          ctx.fillStyle = frame.p.muted;
          ctx.font = "600 12px ui-sans-serif, system-ui";
          ctx.fillText("几何：仅用前两行坐标作投影", 14, 22);
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

  // ========== §5 ==========
  function mountSolvability(root) {
    const presets = {
      full: {
        A: [
          [1, 0],
          [0, 1],
        ],
        b: [1.2, 0.8],
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
    const state = { key: "line", A: M().matFromNumbers(presets.line.A), b: presets.line.b.slice() };

    function render() {
      const An = M().matToNumbers(state.A);
      const augNums = An.map((row, i) => [...row, state.b[i]]);
      const aug = M().matFromNumbers(augNums);
      const info = M().analyzeAugmented(aug);
      const rankA = M().rankOf(state.A);
      const ok = !info.inconsistent;

      root.querySelector("[data-rank-a]").textContent = String(rankA);
      root.querySelector("[data-rank-aug]").textContent = String(info.rankAug);
      const gate = root.querySelector("[data-gate]");
      gate.textContent = ok ? "有解 · b∈Col(A)" : "无解 · b∉Col(A)";
      gate.className = `ch3-status ${ok ? "is-ok" : "is-bad"}`;
      root.querySelector("[data-mat]").innerHTML = M().htmlMat(aug, state.A[0].length);
      root.querySelector("[data-b]").innerHTML = M().htmlVec(state.b.map((v) => M().fromNumber(v)));
      root.querySelector("[data-bx-val]").textContent = M().formatSigned(state.b[0]);
      root.querySelector("[data-by-val]").textContent = M().formatSigned(state.b[1]);
      M().pulseClass(root.querySelector("[data-gate-card]"));

      const canvas = root.querySelector("[data-ch3-canvas]");
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const { ctx, width, height } = sized;
      const frame = M().drawAxes(ctx, width, height, 42);
      const c0 = [An[0][0], An[1][0]];
      const c1 = An[0].length > 1 ? [An[0][1], An[1][1]] : [0, 0];
      if (rankA === 2) M().drawSpanDisk(ctx, frame, [c0, c1], frame.p.accent);
      if (rankA === 1) {
        const v = Math.hypot(c0[0], c0[1]) > 1e-9 ? c0 : c1;
        ctx.save();
        ctx.strokeStyle = frame.p.blue;
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 2.2;
        const a = toFar(frame, v, -8);
        const b = toFar(frame, v, 8);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
        ctx.restore();
      }
      M().drawArrow(ctx, frame, c0, frame.p.accent, "a1");
      if (An[0].length > 1) M().drawArrow(ctx, frame, c1, frame.p.coral, "a2");
      M().drawPoint(ctx, frame, state.b, ok ? frame.p.accentStrong : frame.p.coral, "b");
    }

    function toFar(frame, v, t) {
      return [frame.cx + v[0] * frame.scale * t, frame.cy - v[1] * frame.scale * t];
    }

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-preset]").forEach((b) => b.classList.toggle("is-active", b === btn));
        state.key = btn.dataset.preset;
        const p = presets[state.key];
        state.A = M().matFromNumbers(p.A);
        state.b = p.b.slice();
        root.querySelector("[data-bx]").value = state.b[0];
        root.querySelector("[data-by]").value = state.b[1];
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

  // ========== §6 ==========
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
    const state = { key: "line", params: [0, 0, 0] };

    function current() {
      const aug = M().matFromNumbers(presets[state.key].aug);
      const part = M().particularSolution(aug);
      const A = aug.map((row) => row.slice(0, -1));
      const ns = M().nullspaceBasis(A);
      return { aug, part, ns, A };
    }

    function ensureSliders(basisLen) {
      const box = root.querySelector("[data-param-sliders]");
      if (box.dataset.len === String(basisLen)) return;
      box.dataset.len = String(basisLen);
      if (!basisLen) {
        box.innerHTML = `<p class="ch3-note">没有自由变量：解集是单点。</p>`;
        return;
      }
      box.innerHTML = Array.from({ length: basisLen }, (_, i) => {
        const v = state.params[i] || 0;
        return `<label class="ch3-slider"><span>${tex(`s_{${i + 1}}`)}</span><input type="range" min="-2" max="2" step="0.05" value="${v}" data-param="${i}" /><span data-pval="${i}">${M().formatSigned(v)}</span></label>`;
      }).join("");
      box.querySelectorAll("[data-param]").forEach((input) => {
        input.addEventListener("input", () => {
          const i = Number(input.dataset.param);
          state.params[i] = Number(input.value);
          const lab = box.querySelector(`[data-pval="${i}"]`);
          if (lab) lab.textContent = M().formatSigned(state.params[i]);
          renderReadout();
        });
      });
    }

    function renderReadout() {
      const { part, ns } = current();
      if (!part.ok) {
        root.querySelector("[data-sol]").textContent = "无解，不生成通解。";
        root.querySelector("[data-formula]").innerHTML = tex("\\text{无解}");
        return;
      }
      const basis = ns.basis;
      ensureSliders(basis.length);
      const x = part.x.map((v) => M().toNumber(v));
      for (let k = 0; k < basis.length; k += 1) {
        const s = state.params[k] || 0;
        for (let i = 0; i < x.length; i += 1) x[i] += s * M().toNumber(basis[k][i]);
      }
      root.querySelector("[data-free]").textContent = basis.length
        ? basis.map((_, i) => `s${i + 1}`).join(", ")
        : "无";
      root.querySelector("[data-nullity]").textContent = String(basis.length);
      root.querySelector("[data-x0]").innerHTML = M().htmlVec(part.x);
      root.querySelector("[data-basis]").innerHTML = basis.length
        ? basis.map((v, i) => `${tex(`\\eta_{${i + 1}}=`)}${M().htmlVec(v)}`).join('<div class="ch3-sep"></div>')
        : tex("\\{0\\}");
      root.querySelector("[data-sol]").innerHTML = M().htmlVec(x.map((v) => M().fromNumber(v)));

      // formula x = x0 + s1 η1 + ...
      let formula = "x = x_0";
      basis.forEach((_, i) => {
        formula += ` + s_{${i + 1}}\\eta_{${i + 1}}`;
      });
      root.querySelector("[data-formula]").innerHTML = tex(formula);
      M().pulseClass(root.querySelector("[data-sol-card]"));

      const canvas = root.querySelector("[data-ch3-canvas]");
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const { ctx, width, height } = sized;
      const frame = M().drawAxes(ctx, width, height, 42);
      const p0 = [M().toNumber(part.x[0]), M().toNumber(part.x[1] || 0)];
      if (basis.length === 1 && x.length >= 2) {
        const d = [M().toNumber(basis[0][0]), M().toNumber(basis[0][1] || 0)];
        ctx.save();
        ctx.strokeStyle = frame.p.blue;
        ctx.lineWidth = 2.2;
        ctx.setLineDash([5, 4]);
        const A = [frame.cx + (p0[0] - 8 * d[0]) * frame.scale, frame.cy - (p0[1] - 8 * d[1]) * frame.scale];
        const B = [frame.cx + (p0[0] + 8 * d[0]) * frame.scale, frame.cy - (p0[1] + 8 * d[1]) * frame.scale];
        ctx.beginPath();
        ctx.moveTo(A[0], A[1]);
        ctx.lineTo(B[0], B[1]);
        ctx.stroke();
        ctx.restore();
        M().drawArrow(ctx, frame, d, frame.p.coral, "η");
        M().drawPoint(ctx, frame, p0, frame.p.accent, "x0");
      } else if (basis.length >= 2 && x.length >= 2) {
        ctx.fillStyle = frame.p.muted;
        ctx.font = "600 12px ui-sans-serif, system-ui";
        ctx.fillText("≥2 个自由变量：用右侧参数与坐标读解集", 14, 22);
        M().drawPoint(ctx, frame, p0, frame.p.accent, "x0");
      } else if (basis.length === 0 && x.length >= 2) {
        M().drawPoint(ctx, frame, [x[0], x[1] || 0], frame.p.accentStrong, "解");
      }
      if (x.length >= 2) M().drawPoint(ctx, frame, [x[0], x[1] || 0], frame.p.accentStrong, "x");
    }

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-preset]").forEach((b) => b.classList.toggle("is-active", b === btn));
        state.key = btn.dataset.preset;
        state.params = [0, 0, 0];
        root.querySelector("[data-param-sliders]").dataset.len = "";
        renderReadout();
      });
    });
    window.addEventListener(
      "resize",
      () => {
        if (document.body.contains(root)) renderReadout();
      },
      { passive: true },
    );
    renderReadout();
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
              <article class="ch3-card"><span class="kicker">上界</span><h4>${tex("\\min(m,n)")}</h4><p>独立方向不可能超过尺寸限制。</p></article>
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
            <p>观察任务：切换预设并做行倍加，对照列几何、主元个数与秩值是否一致。</p>
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
              <div class="ch3-meter is-3">
                <div class="ch3-meter-card" data-rank-card><strong>rank</strong><span data-rank>—</span></div>
                <div class="ch3-meter-card"><strong>上界</strong><span data-bound>—</span></div>
                <div class="ch3-meter-card"><strong>尺寸</strong><span data-size>—</span></div>
              </div>
              <div class="ch3-panel"><h4>矩阵 A</h4><div data-mat></div></div>
              <div class="ch3-panel"><h4>主元列</h4><div data-pivots class="ch3-math">—</div></div>
              <div class="ch3-panel"><h4>列关系（投影）</h4><div data-col-note class="ch3-math">—</div></div>
              <div class="ch3-panel"><h4>行简化后的系数部分</h4><div data-rref></div></div>
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
          `<p class="ch3-note">${tex("x_1 a_1 + \\cdots + x_n a_n = b")}。有解意味着目标点可由列向量搭出。</p>`,
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
            <p>观察任务：拖动目标 ${tex("b")}，比较 ${tex("\\operatorname{rank}(A)")} 与 ${tex("\\operatorname{rank}([A|b])")}，并在列空间图上观察位置。</p>
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
              <label class="ch3-slider"><span>${tex("b_1")}</span><input data-bx type="range" min="-2" max="2" step="0.05" value="1" /><span data-bx-val>1</span></label>
              <label class="ch3-slider"><span>${tex("b_2")}</span><input data-by type="range" min="-2" max="2" step="0.05" value="2" /><span data-by-val>2</span></label>
              <div class="ch3-panel"><h4>当前 b</h4><div data-b></div></div>
              <div class="ch3-panel"><h4>增广矩阵</h4><div data-mat></div></div>
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
        `有解时全部解写成 ${tex("x = x_0 + x_h")}，其中 ${tex("A x_0 = b")} 且 ${tex("A x_h = 0")}。`,
        module(
          "01",
          "自由变量",
          "每个自由变量贡献一个齐次方向。",
          `<p class="ch3-note">主元列被约束；非主元列取参数。自由变量个数等于 ${tex("n - \\operatorname{rank}(A)")}。</p>`,
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
            <p>观察任务：拆解特解与齐次方向，拖动参数观察仿射解集，并核对通解公式。</p>
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
                <div class="ch3-meter-card" data-sol-card><strong>当前解</strong><span class="ch3-small" data-sol>—</span></div>
              </div>
              <div class="ch3-panel"><h4>通解公式</h4><div class="ch3-math" data-formula>—</div></div>
              <div class="ch3-panel"><h4>特解 x0</h4><div data-x0></div></div>
              <div class="ch3-panel"><h4>齐次基</h4><div data-basis></div></div>
              <div class="ch3-panel"><h4>自由变量</h4><p class="ch3-note" data-free>—</p></div>
              <div data-param-sliders class="ch3-sliders" data-len=""></div>
            </div>
          </div>
        </div>`;
      mountSolutionFamily(root);
    },
  });
})();
