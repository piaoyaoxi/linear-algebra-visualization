(() => {
  const M = () => window.Ch3Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);

  function formalShell(title, lead, modulesHtml) {
    return `<h2>${title}</h2><div class="ch3-formal"><p class="ch3-formal-lead">${lead}</p>${modulesHtml}</div>`;
  }

  function module(num, title, sub, body) {
    return `<section class="ch3-module"><div class="ch3-module-heading"><span>${num}</span><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;
  }

  function eqsFromAug(augNums) {
    return augNums.map((row, i) => {
      const a = row[0];
      const b = row[1];
      const c = row[2];
      const left = [];
      if (a !== 0) left.push(`${a === 1 ? "" : a === -1 ? "-" : a}x`);
      if (b !== 0) {
        const term = `${Math.abs(b) === 1 ? "" : Math.abs(b)}y`;
        left.push((b > 0 && left.length ? "+ " : b < 0 ? "- " : "") + term);
      }
      if (!left.length) left.push("0");
      return `R${i + 1}: ${left.join(" ")} = ${c}`;
    });
  }

  // ========== §1 Elimination Theatre ==========
  function mountElimination(root) {
    const state = {
      key: "unique2",
      history: [],
      aug: null,
    };

    function loadPreset(key) {
      const preset = M().PRESETS[key];
      state.key = key;
      state.aug = M().matFromNumbers(preset.aug);
      state.history = ["载入预设：" + preset.label];
      render();
    }

    function applyOp(kind) {
      const before = M().cloneMat(state.aug);
      if (kind === "swap") {
        state.aug = M().rowSwap(state.aug, 0, 1);
        state.history.push("交换 R1 ↔ R2");
      } else if (kind === "scale") {
        state.aug = M().rowScale(state.aug, 0, 2);
        state.history.push("R1 ← 2·R1");
      } else if (kind === "add") {
        // R2 <- R2 - (a20/a00)*R1 if possible, else R2 - R1
        const a00 = state.aug[0][0];
        const a10 = state.aug[1][0];
        let k = M().F(-1);
        if (!M().isZero(a00)) k = M().neg(M().div(a10, a00));
        state.aug = M().rowAdd(state.aug, 1, 0, k);
        state.history.push(`R2 ← R2 + (${M().formatF(k)})·R1`);
      } else if (kind === "rref") {
        const info = M().analyzeAugmented(state.aug);
        state.aug = info.rref;
        state.history.push("化到简化阶梯形 (RREF)");
      } else if (kind === "undo") {
        if (state.history.length <= 1) return;
        loadPreset(state.key);
        return;
      }
      void before;
      render();
    }

    function classify() {
      const info = M().analyzeAugmented(state.aug);
      if (info.inconsistent) return { label: "无解", cls: "is-bad" };
      if (info.free.length) return { label: "无穷多解信号", cls: "is-inf" };
      return { label: "唯一解", cls: "is-ok" };
    }

    function draw() {
      const canvas = root.querySelector("[data-ch3-canvas]");
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const { ctx, width, height } = sized;
      const frame = M().drawAxes(ctx, width, height, 36);
      const nums = M().matToNumbers(state.aug);
      if (nums[0].length >= 3) {
        M().drawLineFromEq(ctx, frame, nums[0][0], nums[0][1], nums[0][2], frame.p.accent, 2.6);
        M().drawLineFromEq(ctx, frame, nums[1][0], nums[1][1], nums[1][2], frame.p.coral, 2.6);
        const info = M().analyzeAugmented(state.aug);
        if (!info.inconsistent && !info.free.length) {
          const sol = M().particularSolution(state.aug);
          if (sol.ok) {
            M().drawPoint(ctx, frame, [M().toNumber(sol.x[0]), M().toNumber(sol.x[1])], frame.p.blue, "解");
          }
        }
      }
    }

    function render() {
      const nums = M().matToNumbers(state.aug);
      const eqs = eqsFromAug(nums);
      const info = M().analyzeAugmented(state.aug);
      const status = classify();
      root.querySelector("[data-eqs]").innerHTML = eqs
        .map((e, i) => `<div class="${i === 1 ? "is-changed" : ""}">${e}</div>`)
        .join("");
      root.querySelector("[data-mat]").textContent = M().formatMat(state.aug, nums[0].length - 1);
      root.querySelector("[data-status]").textContent = status.label;
      root.querySelector("[data-status]").className = `ch3-status ${status.cls}`;
      root.querySelector("[data-pivots]").textContent = info.pivots.map((p) => `x${p + 1}`).join(", ") || "—";
      root.querySelector("[data-rank]").textContent = String(info.rankA);
      root.querySelector("[data-history]").innerHTML = state.history
        .slice(-6)
        .map((h) => `<li>${h}</li>`)
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
      btn.addEventListener("click", () => applyOp(btn.dataset.op));
    });
    window.addEventListener(
      "resize",
      () => {
        if (document.body.contains(root)) draw();
      },
      { passive: true },
    );
    loadPreset("unique2");
  }

  // ========== §2 Dimension Dial ==========
  function mountDimensionDial(root) {
    const state = {
      n: 3,
      coords: [1, 0.5, -0.5, 0, 0, 0, 0, 0],
      other: [0.5, -0.5, 0.25, 0, 0, 0, 0, 0],
      mode: "combo",
    };

    function sync() {
      const n = state.n;
      const x = state.coords.slice(0, n);
      const bars = root.querySelector("[data-bars]");
      bars.innerHTML = x
        .map((v, i) => {
          const pct = Math.min(100, Math.abs(v) * 28);
          return `<div class="ch3-bar-row"><span>x${i + 1}</span><div class="ch3-bar-track"><div class="ch3-bar-fill" style="width:${pct}%"></div></div><span>${v.toFixed(2)}</span></div>`;
        })
        .join("");
      const combo = x.map((v, i) => `${v.toFixed(2)}e${i + 1}`).join(" + ");
      root.querySelector("[data-combo]").textContent = combo || "0";
      root.querySelector("[data-col]").textContent = `(${x.map((v) => v.toFixed(2)).join(", ")})^T`;
      root.querySelector("[data-n]").textContent = String(n);

      const canvas = root.querySelector("[data-ch3-canvas]");
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const { ctx, width, height } = sized;
      const frame = M().drawAxes(ctx, width, height, 40);
      if (n >= 2) {
        M().drawArrow(ctx, frame, [x[0], x[1]], frame.p.accent, "x");
        const y = state.other.slice(0, n);
        M().drawArrow(ctx, frame, [y[0], y[1]], frame.p.coral, "y");
        M().drawArrow(ctx, frame, [x[0] + y[0], x[1] + y[1]], frame.p.blue, "x+y");
      }
      M().pulseClass(root.querySelector("[data-combo-card]"));
    }

    function rebuildSliders() {
      const box = root.querySelector("[data-sliders]");
      box.innerHTML = Array.from({ length: state.n }, (_, i) => {
        return `<label class="ch3-slider"><span>x${i + 1}</span><input type="range" min="-2" max="2" step="0.05" value="${state.coords[i]}" data-coord="${i}" /><span data-val="${i}">${state.coords[i].toFixed(2)}</span></label>`;
      }).join("");
      box.querySelectorAll("[data-coord]").forEach((input) => {
        input.addEventListener("input", () => {
          const i = Number(input.dataset.coord);
          state.coords[i] = Number(input.value);
          root.querySelector(`[data-val="${i}"]`).textContent = state.coords[i].toFixed(2);
          sync();
        });
      });
    }

    root.querySelector("[data-n-range]").addEventListener("input", (e) => {
      state.n = Number(e.target.value);
      rebuildSliders();
      sync();
    });
    root.querySelector("[data-neg]").addEventListener("click", () => {
      for (let i = 0; i < state.n; i += 1) state.coords[i] = -state.coords[i];
      rebuildSliders();
      sync();
    });
    root.querySelector("[data-zero]").addEventListener("click", () => {
      for (let i = 0; i < state.n; i += 1) state.coords[i] = 0;
      rebuildSliders();
      sync();
    });
    window.addEventListener(
      "resize",
      () => {
        if (document.body.contains(root)) sync();
      },
      { passive: true },
    );
    rebuildSliders();
    sync();
  }

  // ========== §3 Dependency Lab ==========
  function mountDependency(root) {
    const presets = {
      basis: {
        label: "二维基",
        v: [
          [1, 0],
          [0, 1],
        ],
      },
      prop: {
        label: "比例向量",
        v: [
          [1, 0.5],
          [2, 1],
        ],
      },
      three: {
        label: "三向量相关",
        v: [
          [1, 0],
          [0, 1],
          [1, 1],
        ],
      },
      near: {
        label: "近共线",
        v: [
          [1, 0.2],
          [1.05, 0.22],
        ],
      },
      zero: {
        label: "含零向量",
        v: [
          [1, 0.5],
          [0, 0],
        ],
      },
    };
    const state = { key: "basis", vectors: presets.basis.v.map((v) => v.slice()), drop: -1 };

    function analyze() {
      const cert = M().relationCertificate(state.vectors);
      return cert;
    }

    function draw() {
      const canvas = root.querySelector("[data-ch3-canvas]");
      const sized = M().sizeCanvas(canvas);
      if (!sized) return;
      const { ctx, width, height } = sized;
      const frame = M().drawAxes(ctx, width, height, 42);
      const colors = [frame.p.accent, frame.p.coral, frame.p.blue, frame.p.muted];
      state.vectors.forEach((v, i) => {
        if (state.drop === i) return;
        M().drawArrow(ctx, frame, v, colors[i % colors.length], `v${i + 1}`);
      });
    }

    function render() {
      const list = state.drop >= 0 ? state.vectors.filter((_, i) => i !== state.drop) : state.vectors;
      const cert = M().relationCertificate(list);
      const status = cert.dependent ? "线性相关" : "线性无关";
      root.querySelector("[data-dep-status]").textContent = status;
      root.querySelector("[data-dep-status]").className = `ch3-status ${cert.dependent ? "is-bad" : "is-ok"}`;
      root.querySelector("[data-rank]").textContent = String(cert.rank ?? list.length);
      if (cert.dependent && cert.coeffs) {
        root.querySelector("[data-cert]").textContent = cert.coeffs
          .map((c, i) => `${M().formatF(c)}·v${i + 1}`)
          .join(" + ") + " = 0";
      } else {
        root.querySelector("[data-cert]").textContent = "只有全零系数能使组合为零。";
      }
      root.querySelector("[data-vec-list]").textContent = list
        .map((v, i) => `v${i + 1}=(${v.map((t) => t.toFixed(2)).join(", ")})`)
        .join("  ");
      M().pulseClass(root.querySelector("[data-dep-card]"));
      draw();
    }

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-preset]").forEach((b) => b.classList.toggle("is-active", b === btn));
        state.key = btn.dataset.preset;
        state.vectors = presets[state.key].v.map((v) => v.slice());
        state.drop = -1;
        root.querySelector("[data-drop]").value = "-1";
        render();
      });
    });
    root.querySelector("[data-drop]").addEventListener("change", (e) => {
      state.drop = Number(e.target.value);
      render();
    });

    // drag last vector roughly via sliders for first two components of v1
    root.querySelectorAll("[data-drag]").forEach((input) => {
      input.addEventListener("input", () => {
        const which = Number(input.dataset.drag);
        const axis = input.dataset.axis;
        if (!state.vectors[which]) return;
        state.vectors[which][axis === "x" ? 0 : 1] = Number(input.value);
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
        "同一解集，三种语言",
        "方程、增广矩阵与几何交点始终描述同一组解。行变换只改写表达，不改写解集。",
        module(
          "01",
          "三类可逆行变换",
          "交换、倍乘、倍加都有逆操作。",
          `<div class="ch3-card-grid">
            <article class="ch3-card"><span class="kicker">交换</span><h4>R_i ↔ R_j</h4><p>只改变方程顺序。</p></article>
            <article class="ch3-card"><span class="kicker">倍乘</span><h4>R_i ← λR_i</h4><p>${tex("\\lambda\\neq 0")}，得到等价方程。</p></article>
            <article class="ch3-card"><span class="kicker">倍加</span><h4>R_i ← R_i+μR_j</h4><p>用等价方程替换原方程，可撤销。</p></article>
          </div>`,
        ) +
          module(
            "02",
            "主元、阶梯与终局信号",
            "前向消元锁定主元；矛盾行与缺主元列提示终局。",
            `<p class="ch3-note">高斯消元到阶梯形后回代；Gauss-Jordan 继续清上方得到简化阶梯形。${tex("[0\\,\\cdots\\,0\\,|\\,c]")}（${tex("c\\neq 0")}）是无解信号。</p>`,
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
            <p>方程、增广矩阵与二维直线同步更新。用预设观察唯一解、无解与无穷多解信号。</p>
          </div>
          <div class="ch3-presets">
            <button type="button" class="is-active" data-preset="unique2">唯一解</button>
            <button type="button" data-preset="parallel2">平行无解</button>
            <button type="button" data-preset="sameLine2">重合无穷</button>
            <button type="button" data-preset="swapPivot">需换行</button>
          </div>
          <div class="ch3-lab-grid is-3">
            <div class="ch3-panel"><h4>方程组</h4><div class="ch3-eq-list" data-eqs></div></div>
            <div class="ch3-panel"><h4>增广矩阵</h4><pre class="ch3-matrix-pre" data-mat></pre></div>
            <div class="ch3-stage"><canvas data-ch3-canvas aria-label="直线交点"></canvas></div>
          </div>
          <div class="ch3-meter is-3">
            <div class="ch3-meter-card" data-status-card><strong>解状态</strong><span data-status class="ch3-status">—</span></div>
            <div class="ch3-meter-card"><strong>主元列</strong><span data-pivots>—</span></div>
            <div class="ch3-meter-card"><strong>rank(A)</strong><span data-rank>—</span></div>
          </div>
          <div class="ch3-toolbar">
            <button type="button" data-op="swap">交换两行</button>
            <button type="button" data-op="scale">R1 × 2</button>
            <button type="button" data-op="add">倍加消元</button>
            <button type="button" data-op="rref">到 RREF</button>
            <button type="button" data-op="undo">重置预设</button>
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
          `<p class="ch3-note">${tex("x=x_1e_1+\\cdots+x_ne_n")}。只改一个坐标，就只沿对应基方向移动。</p>`,
        ) +
          module(
            "02",
            "高维表示",
            "用分量条与坐标列，而不是假透视。",
            `<div class="ch3-card-grid">
              <article class="ch3-card"><span class="kicker">坐标列</span><h4>完整对象</h4><p>n 个有序数字构成一个点。</p></article>
              <article class="ch3-card"><span class="kicker">分量条</span><h4>可读尺寸</h4><p>每个分量的大小一目了然。</p></article>
              <article class="ch3-card"><span class="kicker">2D 投影</span><h4>辅助直觉</h4><p>只显示前两个坐标的几何影子。</p></article>
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
            <p>调节维数与坐标，同步查看坐标列、标准基组合与分量条；二维投影显示 x、对比向量 y 与 x+y。</p>
          </div>
          <div class="ch3-lab-grid">
            <div class="ch3-stage"><canvas data-ch3-canvas aria-label="二维投影"></canvas></div>
            <div class="ch3-side">
              <div class="ch3-meter">
                <div class="ch3-meter-card"><strong>维数 n</strong><span data-n>3</span></div>
                <div class="ch3-meter-card" data-combo-card><strong>组合</strong><span style="font-size:12px" data-combo>—</span></div>
              </div>
              <label class="ch3-slider"><span>n</span><input data-n-range type="range" min="1" max="8" step="1" value="3" /><span></span></label>
              <div class="ch3-sliders" data-sliders></div>
              <div class="ch3-toolbar">
                <button type="button" data-neg>取负</button>
                <button type="button" data-zero>归零</button>
              </div>
              <div class="ch3-panel"><h4>坐标列</h4><pre data-col class="ch3-matrix-pre"></pre></div>
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
        `相关意味着存在非平凡关系 ${tex("c_1v_1+\\cdots+c_pv_p=0")}；删除测试检查张成是否变化。`,
        module(
          "01",
          "三种基本相关",
          "零向量、比例向量、落在已有张成中的向量。",
          `<div class="ch3-card-grid">
            <article class="ch3-card"><span class="kicker">零向量</span><h4>直接冗余</h4><p>系数 1 打在零向量上即可。</p></article>
            <article class="ch3-card"><span class="kicker">比例</span><h4>同一方向</h4><p>两向量共线则相关。</p></article>
            <article class="ch3-card"><span class="kicker">落入张成</span><h4>可被表达</h4><p>新向量不增加维数。</p></article>
          </div>`,
        ) +
          module(
            "02",
            "极大无关组",
            "个数一致，选择不必唯一。",
            `<p class="ch3-note">逐个加入向量：在张成之外则保留并升维，在张成之内则标记冗余。下一节把这个个数叫做秩。</p>`,
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
            <p>切换预设或微调向量，查看相关判定、关系证书与删除测试。</p>
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
              <div class="ch3-panel"><h4>关系证书</h4><p class="ch3-note" data-cert>—</p></div>
              <div class="ch3-panel"><h4>当前向量</h4><p class="ch3-note" data-vec-list>—</p></div>
              <label class="ch3-slider"><span>删除</span>
                <select data-drop>
                  <option value="-1">不删除</option>
                  <option value="0">删 v1</option>
                  <option value="1">删 v2</option>
                  <option value="2">删 v3</option>
                </select>
                <span></span>
              </label>
              <div class="ch3-sliders">
                <label class="ch3-slider"><span>v1.x</span><input data-drag="0" data-axis="x" type="range" min="-2" max="2" step="0.05" value="1" /><span></span></label>
                <label class="ch3-slider"><span>v1.y</span><input data-drag="0" data-axis="y" type="range" min="-2" max="2" step="0.05" value="0" /><span></span></label>
              </div>
            </div>
          </div>
        </div>`;
      mountDependency(root);
    },
  });
})();
