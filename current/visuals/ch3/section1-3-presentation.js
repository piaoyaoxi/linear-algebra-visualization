(() => {
  const M = () => window.Ch3Math;
  const tex = (s) => M().tex(s);

  function formalShell(title, lead, body) {
    return `<h2>${title}</h2><div class="ch3-formal"><p class="ch3-formal-lead">${lead}</p>${body}</div>`;
  }

  function module(num, title, sub, body) {
    return `<section class="ch3-module"><div class="ch3-module-heading"><span>${num}</span><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;
  }

  // ========== §1 ==========
  function mountElimination(root) {
    const state = {
      key: "unique2",
      aug: null,
      stack: [],
      dirty: [],
    };

    function snapshot(label) {
      state.stack.push({ aug: M().cloneMat(state.aug), label, dirty: state.dirty.slice() });
      if (state.stack.length > 40) state.stack.shift();
    }

    function loadPreset(key) {
      const preset = M().PRESETS[key];
      if (!preset?.aug) return;
      state.key = key;
      state.aug = M().matFromNumbers(preset.aug);
      state.stack = [];
      state.dirty = [];
      snapshot(`载入：${preset.label}`);
      render();
    }

    function apply(kind) {
      const before = M().cloneMat(state.aug);
      let label = "";
      if (kind === "swap") {
        state.aug = M().rowSwap(state.aug, 0, Math.min(1, state.aug.length - 1));
        label = "交换 R1 ↔ R2";
      } else if (kind === "scale") {
        state.aug = M().rowScale(state.aug, 0, 2);
        label = "R1 ← 2·R1";
      } else if (kind === "add") {
        const a00 = state.aug[0][0];
        const a10 = state.aug[1][0];
        let k = M().F(-1);
        if (!M().isZero(a00)) k = M().neg(M().div(a10, a00));
        state.aug = M().rowAdd(state.aug, 1, 0, k);
        label = `R2 ← R2 + (${M().formatF(k)})·R1`;
      } else if (kind === "rref") {
        state.aug = M().analyzeAugmented(state.aug).rref;
        label = "化到简化阶梯形";
      } else if (kind === "undo") {
        if (state.stack.length <= 1) return;
        state.stack.pop();
        const prev = state.stack[state.stack.length - 1];
        state.aug = M().cloneMat(prev.aug);
        state.dirty = prev.dirty.slice();
        render();
        return;
      } else if (kind === "reset") {
        loadPreset(state.key);
        return;
      }
      state.dirty = M().changedRows(before, state.aug);
      snapshot(label);
      render();
    }

    function draw() {
      const canvas = root.querySelector("[data-ch3-canvas]");
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const { ctx, width, height } = sized;
      const frame = M().drawAxes(ctx, width, height, 38);
      const n = state.aug[0].length - 1;
      if (n !== 2) {
        ctx.fillStyle = frame.p.muted;
        ctx.font = "600 13px ui-sans-serif, system-ui";
        ctx.fillText("几何视图仅对二元系统显示直线交点", 16, 28);
        return;
      }
      const nums = M().matToNumbers(state.aug);
      const colors = [frame.p.accent, frame.p.coral, frame.p.blue];
      nums.forEach((row, i) => {
        M().drawLineFromEq(ctx, frame, row[0], row[1], row[2], colors[i % colors.length], 2.7);
      });
      const cls = M().classifySystem(state.aug);
      if (cls.key === "unique") {
        const sol = M().particularSolution(state.aug);
        if (sol.ok) {
          M().drawPoint(ctx, frame, [M().toNumber(sol.x[0]), M().toNumber(sol.x[1])], frame.p.blue, "解");
        }
      }
    }

    function render() {
      const barAt = state.aug[0].length - 1;
      const cls = M().classifySystem(state.aug);
      root.querySelector("[data-eqs]").innerHTML = M().htmlEqs(state.aug, state.dirty);
      root.querySelector("[data-mat]").innerHTML = M().htmlMat(state.aug, barAt);
      const status = root.querySelector("[data-status]");
      status.textContent = cls.label;
      status.className = `ch3-status ${cls.cls}`;
      root.querySelector("[data-pivots]").innerHTML = cls.info.pivots.length
        ? tex(cls.info.pivots.map((p) => `x_{${p + 1}}`).join(",\\;"))
        : "—";
      root.querySelector("[data-rank]").textContent = String(cls.info.rankA);
      root.querySelector("[data-free]").textContent = cls.info.free.length
        ? cls.info.free.map((j) => `x${j + 1}`).join(", ")
        : "无";
      root.querySelector("[data-history]").innerHTML = state.stack
        .slice(-8)
        .map((h) => `<li>${h.label}</li>`)
        .join("");
      M().pulseClass(root.querySelector("[data-status-card]"));
      draw();
    }

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-preset]").forEach((b) => b.classList.toggle("is-active", b === btn));
        loadPreset(btn.dataset.preset);
      });
    });
    root.querySelectorAll("[data-op]").forEach((btn) => {
      btn.addEventListener("click", () => apply(btn.dataset.op));
    });
    const onResize = () => {
      if (document.body.contains(root)) draw();
    };
    window.addEventListener("resize", onResize, { passive: true });
    loadPreset("unique2");
  }

  // ========== §2 ==========
  function mountDimensionDial(root) {
    const state = {
      n: 3,
      coords: [1.2, 0.6, -0.4, 0, 0, 0, 0, 0],
      other: [0.4, -0.8, 0.5, 0, 0, 0, 0, 0],
    };

    function renderSliders() {
      const box = root.querySelector("[data-sliders]");
      box.innerHTML = Array.from({ length: state.n }, (_, i) => {
        const v = state.coords[i] ?? 0;
        return `<label class="ch3-slider"><span>${tex(`x_{${i + 1}}`)}</span><input type="range" min="-2" max="2" step="0.05" value="${v}" data-coord="${i}" /><span data-val="${i}">${M().formatSigned(v)}</span></label>`;
      }).join("");
      box.querySelectorAll("[data-coord]").forEach((input) => {
        input.addEventListener("input", () => {
          const i = Number(input.dataset.coord);
          state.coords[i] = Number(input.value);
          const lab = root.querySelector(`[data-val="${i}"]`);
          if (lab) lab.textContent = M().formatSigned(state.coords[i]);
          sync();
        });
      });
    }

    function sync() {
      const n = state.n;
      const x = state.coords.slice(0, n);
      const y = state.other.slice(0, n);
      const sum = x.map((v, i) => v + y[i]);

      root.querySelector("[data-n]").textContent = String(n);
      const comboLatex = (() => {
        const terms = [];
        x.forEach((v, i) => {
          if (Math.abs(v) < 1e-9) return;
          const mag = M().formatSigned(Math.abs(v));
          const body = mag === "1" ? `e_{${i + 1}}` : `${mag} e_{${i + 1}}`;
          if (!terms.length) terms.push(v < 0 ? `-${body}` : body);
          else terms.push(v < 0 ? `- ${body}` : `+ ${body}`);
        });
        return terms.length ? terms.join(" ") : "0";
      })();
      root.querySelector("[data-combo]").innerHTML = tex(comboLatex);
      root.querySelector("[data-col]").innerHTML = M().htmlVec(x.map((v) => M().fromNumber(v)));
      root.querySelector("[data-sum]").innerHTML = M().htmlVec(sum.map((v) => M().fromNumber(v)));

      const bars = root.querySelector("[data-bars]");
      bars.innerHTML = x
        .map((v, i) => {
          const pct = Math.min(100, (Math.abs(v) / 2) * 100);
          return `<div class="ch3-bar-row"><span>${tex(`x_{${i + 1}}`)}</span><div class="ch3-bar-track"><div class="ch3-bar-fill" style="width:${pct}%"></div></div><span>${M().formatSigned(v)}</span></div>`;
        })
        .join("");

      const canvas = root.querySelector("[data-ch3-canvas]");
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const { ctx, width, height } = sized;
      const frame = M().drawAxes(ctx, width, height, 42);
      if (n >= 2) {
        M().drawArrow(ctx, frame, [x[0], x[1]], frame.p.accent, "x");
        M().drawArrow(ctx, frame, [y[0], y[1]], frame.p.coral, "y");
        M().drawArrow(ctx, frame, [sum[0], sum[1]], frame.p.blue, "x+y");
        if (n > 2) {
          ctx.fillStyle = frame.p.muted;
          ctx.font = "600 12px ui-sans-serif, system-ui";
          ctx.fillText(`仅显示前两坐标的投影（真实维数 n=${n}）`, 14, 22);
        }
      } else {
        ctx.fillStyle = frame.p.muted;
        ctx.font = "600 13px ui-sans-serif, system-ui";
        ctx.fillText("一维：用分量条与坐标列阅读向量", 16, 28);
      }
      M().pulseClass(root.querySelector("[data-combo-card]"));
    }

    root.querySelector("[data-n-range]").addEventListener("input", (e) => {
      state.n = Number(e.target.value);
      renderSliders();
      sync();
    });
    root.querySelector("[data-neg]").addEventListener("click", () => {
      for (let i = 0; i < state.n; i += 1) state.coords[i] = -state.coords[i];
      renderSliders();
      sync();
    });
    root.querySelector("[data-zero]").addEventListener("click", () => {
      for (let i = 0; i < state.n; i += 1) state.coords[i] = 0;
      renderSliders();
      sync();
    });
    root.querySelector("[data-add]").addEventListener("click", () => {
      // show x+y already; pulse sum
      M().pulseClass(root.querySelector("[data-sum-card]"));
      sync();
    });
    window.addEventListener(
      "resize",
      () => {
        if (document.body.contains(root)) sync();
      },
      { passive: true },
    );
    renderSliders();
    sync();
  }

  // ========== §3 ==========
  function mountDependency(root) {
    const presets = {
      basis: {
        v: [
          [1.2, 0.2],
          [0.3, 1.1],
        ],
      },
      prop: {
        v: [
          [1, 0.5],
          [2, 1],
        ],
      },
      three: {
        v: [
          [1, 0],
          [0, 1],
          [1, 1],
        ],
      },
      near: {
        v: [
          [1, 0.25],
          [1.05, 0.28],
        ],
      },
      zero: {
        v: [
          [1.1, 0.4],
          [0, 0],
        ],
      },
    };
    const state = { key: "basis", vectors: presets.basis.v.map((v) => v.slice()), drop: -1 };

    function activeVectors() {
      return state.vectors.filter((_, i) => i !== state.drop);
    }

    function draw() {
      const canvas = root.querySelector("[data-ch3-canvas]");
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const { ctx, width, height } = sized;
      const frame = M().drawAxes(ctx, width, height, 44);
      const list = activeVectors();
      if (list.length >= 2) M().drawSpanDisk(ctx, frame, list, frame.p.accent);
      const colors = [frame.p.accent, frame.p.coral, frame.p.blue, frame.p.muted];
      state.vectors.forEach((v, i) => {
        if (state.drop === i) return;
        M().drawArrow(ctx, frame, v, colors[i % colors.length], `v${i + 1}`);
      });
    }

    function render() {
      const list = activeVectors();
      const cert = M().relationCertificate(list);
      const status = root.querySelector("[data-dep-status]");
      status.textContent = cert.dependent ? "线性相关" : "线性无关";
      status.className = `ch3-status ${cert.dependent ? "is-bad" : "is-ok"}`;
      root.querySelector("[data-rank]").textContent = String(cert.rank ?? 0);
      root.querySelector("[data-cert]").innerHTML = cert.dependent
        ? tex(M().latexRelation(cert.coeffs))
        : tex("\\text{只有全零系数使组合为零}");
      root.querySelector("[data-vec-list]").innerHTML = list
        .map((v, i) => tex(`v_{${i + 1}}=\\begin{bmatrix}${v.map((t) => M().formatSigned(t)).join("\\\\")}\\end{bmatrix}`))
        .join('<span class="ch3-sep"> </span>');
      // near note
      const nearNote = root.querySelector("[data-near-note]");
      if (state.key === "near") {
        nearNote.hidden = false;
        nearNote.textContent = "几何上很扁，但精确判定仍可能无关：不要把近相关当成严格相关。";
      } else {
        nearNote.hidden = true;
      }
      M().pulseClass(root.querySelector("[data-dep-card]"));
      draw();
    }

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-preset]").forEach((b) => b.classList.toggle("is-active", b === btn));
        state.key = btn.dataset.preset;
        state.vectors = presets[state.key].v.map((v) => v.slice());
        state.drop = -1;
        const sel = root.querySelector("[data-drop]");
        sel.value = "-1";
        // update drag ranges
        const v0 = state.vectors[0];
        root.querySelector('[data-drag="0"][data-axis="x"]').value = v0[0];
        root.querySelector('[data-drag="0"][data-axis="y"]').value = v0[1];
        render();
      });
    });
    root.querySelector("[data-drop]").addEventListener("change", (e) => {
      state.drop = Number(e.target.value);
      render();
    });
    root.querySelectorAll("[data-drag]").forEach((input) => {
      input.addEventListener("input", () => {
        const which = Number(input.dataset.drag);
        const axis = input.dataset.axis === "x" ? 0 : 1;
        if (!state.vectors[which]) return;
        state.vectors[which][axis] = Number(input.value);
        render();
      });
    });
    window.addEventListener(
      "resize",
      () => {
        if (document.body.contains(root)) draw();
      },
      { passive: true },
    );
    render();
  }

  defineChapter3Renderer("elimination", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "同一解集的三种语言",
        `方程、增广矩阵与几何交点始终描述同一组解。初等行变换只改写表达，不改写解集。`,
        module(
          "01",
          "三类可逆行变换",
          "每一步都能撤回，所以不会凭空增删约束。",
          `<div class="ch3-card-grid">
            <article class="ch3-card"><span class="kicker">交换</span><h4>${tex("R_i \\leftrightarrow R_j")}</h4><p>只改变方程顺序。</p></article>
            <article class="ch3-card"><span class="kicker">倍乘</span><h4>${tex("R_i \\leftarrow \\lambda R_i")}</h4><p>${tex("\\lambda \\neq 0")} 时得到等价方程。</p></article>
            <article class="ch3-card"><span class="kicker">倍加</span><h4>${tex("R_i \\leftarrow R_i + \\mu R_j")}</h4><p>用等价方程替换，可由逆操作撤回。</p></article>
          </div>`,
        ) +
          module(
            "02",
            "主元、阶梯与终局信号",
            "前向消元锁定主元；矛盾行与缺主元列提示终局。",
            `<div class="ch3-card-grid">
              <article class="ch3-card"><span class="kicker">高斯</span><h4>阶梯形 + 回代</h4><p>先化到阶梯，再逐层回代求未知量。</p></article>
              <article class="ch3-card"><span class="kicker">Gauss-Jordan</span><h4>简化阶梯形</h4><p>继续清主元上方，主元变量更直接。</p></article>
              <article class="ch3-card"><span class="kicker">信号</span><h4>${tex("[0\\ \\cdots\\ 0\\ |\\ c]")}</h4><p>${tex("c\\neq 0")} 为矛盾行；缺主元列预示自由变量。</p></article>
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
            <h3>消元手术台</h3>
            <p>观察任务：在方程、增广矩阵与几何之间执行行变换，识别唯一解、无解与无穷多解信号。分数保持精确约分。</p>
          </div>
          <div class="ch3-presets">
            <button type="button" class="is-active" data-preset="unique2">唯一解</button>
            <button type="button" data-preset="parallel2">平行无解</button>
            <button type="button" data-preset="sameLine2">重合无穷</button>
            <button type="button" data-preset="swapPivot">需换行</button>
            <button type="button" data-preset="upper3">三元上三角</button>
          </div>
          <div class="ch3-lab-grid is-3">
            <div class="ch3-panel"><h4>方程组</h4><div data-eqs></div></div>
            <div class="ch3-panel"><h4>增广矩阵</h4><div data-mat></div></div>
            <div class="ch3-stage"><canvas data-ch3-canvas aria-label="直线交点"></canvas></div>
          </div>
          <div class="ch3-meter is-4">
            <div class="ch3-meter-card" data-status-card><strong>解状态</strong><span data-status class="ch3-status">—</span></div>
            <div class="ch3-meter-card"><strong>主元</strong><span data-pivots>—</span></div>
            <div class="ch3-meter-card"><strong>rank(A)</strong><span data-rank>—</span></div>
            <div class="ch3-meter-card"><strong>自由变量</strong><span data-free>—</span></div>
          </div>
          <div class="ch3-toolbar">
            <button type="button" data-op="swap">交换两行</button>
            <button type="button" data-op="scale">R1 × 2</button>
            <button type="button" data-op="add">倍加消元</button>
            <button type="button" data-op="rref">到 RREF</button>
            <button type="button" data-op="undo">撤销</button>
            <button type="button" data-op="reset">重置预设</button>
          </div>
          <div class="ch3-panel"><h4>步骤历史</h4><ol class="ch3-history" data-history></ol></div>
        </div>`;
      mountElimination(root);
    },
  });

  defineChapter3Renderer("n-vector-space", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "未知量列就是一个向量",
        `${tex("F^n")} 中的运算定义在坐标上：看不见高维，也能完整记录与操作。`,
        module(
          "01",
          "标准基分解",
          "每个坐标对应一个基方向。",
          `<p class="ch3-note">${tex("x = x_1 e_1 + \\cdots + x_n e_n")}。只改一个坐标，就只沿对应基方向移动。</p>`,
        ) +
          module(
            "02",
            "高维怎样表示",
            "用坐标列与分量条，不伪造透视。",
            `<div class="ch3-card-grid">
              <article class="ch3-card"><span class="kicker">坐标列</span><h4>完整对象</h4><p>n 个有序数字构成一个点。</p></article>
              <article class="ch3-card"><span class="kicker">分量条</span><h4>可读尺寸</h4><p>每个分量的大小一目了然。</p></article>
              <article class="ch3-card"><span class="kicker">投影</span><h4>辅助直觉</h4><p>只显示前两个坐标的几何影子，并明确标注。</p></article>
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
            <h3>坐标维数台</h3>
            <p>观察任务：调节维数与坐标，读出标准基分解；比较取负、归零与加法。高维只显示前两坐标投影。</p>
          </div>
          <div class="ch3-lab-grid">
            <div class="ch3-stage"><canvas data-ch3-canvas aria-label="二维投影"></canvas></div>
            <div class="ch3-side">
              <div class="ch3-meter">
                <div class="ch3-meter-card"><strong>维数 n</strong><span data-n>3</span></div>
                <div class="ch3-meter-card" data-combo-card><strong>标准基分解</strong><span class="ch3-small" data-combo>—</span></div>
              </div>
              <label class="ch3-slider"><span>n</span><input data-n-range type="range" min="1" max="8" step="1" value="3" /><span></span></label>
              <div class="ch3-sliders" data-sliders></div>
              <div class="ch3-toolbar">
                <button type="button" data-neg>取负 −x</button>
                <button type="button" data-zero>归零</button>
                <button type="button" data-add>查看 x+y</button>
              </div>
              <div class="ch3-panel"><h4>坐标列 x</h4><div data-col></div></div>
              <div class="ch3-panel" data-sum-card><h4>x + y（对比向量）</h4><div data-sum></div></div>
              <div class="ch3-panel"><h4>分量条</h4><div class="ch3-coord-bars" data-bars></div></div>
            </div>
          </div>
        </div>`;
      mountDimensionDial(root);
    },
  });

  defineChapter3Renderer("linear-dependence", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "冗余方向如何被发现",
        `相关意味着存在非平凡关系 ${tex("c_1 v_1 + \\cdots + c_p v_p = 0")}；删除测试检查张成是否变化。`,
        module(
          "01",
          "三种基本相关",
          "零向量、比例向量、落入已有张成。",
          `<div class="ch3-card-grid">
            <article class="ch3-card"><span class="kicker">零向量</span><h4>${tex("0")}</h4><p>系数 1 打在零向量上即可得平凡关系。</p></article>
            <article class="ch3-card"><span class="kicker">比例</span><h4>${tex("v_2=\\lambda v_1")}</h4><p>两向量共线则相关。</p></article>
            <article class="ch3-card"><span class="kicker">落入张成</span><h4>${tex("v_3\\in\\operatorname{span}\\{v_1,v_2\\}")}</h4><p>新向量不增加维数。</p></article>
          </div>`,
        ) +
          module(
            "02",
            "极大无关组与齐次视角",
            "个数一致，选择不必唯一。",
            `<p class="ch3-note">把向量排成矩阵列后，相关等价于 ${tex("Ac=0")} 有非零解。逐个加入向量：在张成之外则保留并升维，在张成之内则标记冗余。下一节把极大无关组的个数叫做秩。</p>`,
          ),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch3-lab">
          <div class="ch3-lab-head">
            <h3>冗余探测器</h3>
            <p>观察任务：判定相关/无关，读出关系证书，并用删除测试看张成是否变化。</p>
          </div>
          <div class="ch3-presets">
            <button type="button" class="is-active" data-preset="basis">二维基</button>
            <button type="button" data-preset="prop">比例向量</button>
            <button type="button" data-preset="three">三向量相关</button>
            <button type="button" data-preset="near">近共线</button>
            <button type="button" data-preset="zero">含零向量</button>
          </div>
          <div class="ch3-lab-grid">
            <div class="ch3-stage"><canvas data-ch3-canvas aria-label="向量组"></canvas></div>
            <div class="ch3-side">
              <div class="ch3-meter">
                <div class="ch3-meter-card" data-dep-card><strong>判定</strong><span data-dep-status class="ch3-status">—</span></div>
                <div class="ch3-meter-card"><strong>当前秩</strong><span data-rank>—</span></div>
              </div>
              <div class="ch3-panel"><h4>关系证书</h4><div class="ch3-math" data-cert>—</div></div>
              <div class="ch3-panel"><h4>当前向量</h4><div class="ch3-vec-row" data-vec-list>—</div></div>
              <p class="ch3-note" data-near-note hidden></p>
              <label class="ch3-slider"><span>删除测试</span>
                <select data-drop>
                  <option value="-1">不删除</option>
                  <option value="0">删 v1</option>
                  <option value="1">删 v2</option>
                  <option value="2">删 v3</option>
                </select>
                <span></span>
              </label>
              <div class="ch3-sliders">
                <label class="ch3-slider"><span>v1·x</span><input data-drag="0" data-axis="x" type="range" min="-2" max="2" step="0.05" value="1.2" /><span></span></label>
                <label class="ch3-slider"><span>v1·y</span><input data-drag="0" data-axis="y" type="range" min="-2" max="2" step="0.05" value="0.2" /><span></span></label>
              </div>
            </div>
          </div>
        </div>`;
      mountDependency(root);
    },
  });
})();
