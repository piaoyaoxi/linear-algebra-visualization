(() => {
  const M = () => window.Ch6Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);

  function formalShell(title, lead, modulesHtml) {
    return `<h2>${title}</h2><div class="ch6-formal"><p class="ch6-formal-lead">${lead}</p>${modulesHtml}</div>`;
  }

  function module(num, title, sub, body) {
    return `<section class="ch6-module"><div class="ch6-module-heading"><span>${num}</span><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;
  }

  function labShell(title, desc, body, stack = false) {
    return `<div class="ch6-lab"><div class="ch6-lab-head"><h3>${title}</h3><p>${desc}</p></div><div class="ch6-lab-grid${stack ? " is-stack" : ""}">${body}</div></div>`;
  }

  // ───────────────────────── §1 Map Builder ─────────────────────────
  function mountMapBuilder(root) {
    const X = ["1", "2", "3"];
    const Y = ["a", "b", "c"];
    let map = { 1: "a", 2: "b", 3: "c" };
    const presets = {
      bijection: { 1: "a", 2: "b", 3: "c" },
      collide: { 1: "a", 2: "a", 3: "b" },
      miss: { 1: "a", 2: "b", 3: "a" },
      constant: { 1: "a", 2: "a", 3: "a" },
    };

    root.innerHTML = labShell(
      "映射构造器与双射仪表",
      "为每个输入指定恰好一个输出。有限等势集合上，单射、满射与双射同时成立或同时失败；请重点观察碰撞与未命中。",
      `
      <div>
        <div class="ch6-map-board">
          <div class="ch6-set" data-set-x></div>
          <div class="ch6-arrow-col">f : X → Y<div class="ch6-muted">复合时右边先作用</div></div>
          <div class="ch6-set" data-set-y></div>
        </div>
        <div class="ch6-controls" style="margin-top:12px">
          <button type="button" data-preset="bijection">双射</button>
          <button type="button" data-preset="collide">输入碰撞</button>
          <button type="button" data-preset="miss">输出未满</button>
          <button type="button" data-preset="constant">常值映射</button>
        </div>
      </div>
      <div class="ch6-panel">
        <div class="ch6-readout">
          <strong>判定</strong>
          <div data-map-status></div>
          <div class="ch6-metric-grid" style="margin-top:8px">
            <div class="ch6-metric"><span>单射</span><strong data-inj>—</strong></div>
            <div class="ch6-metric"><span>满射</span><strong data-sur>—</strong></div>
            <div class="ch6-metric"><span>双射</span><strong data-bij>—</strong></div>
            <div class="ch6-metric"><span>值域</span><strong data-image>—</strong></div>
          </div>
        </div>
        <div class="ch6-readout">
          <strong>原像查看</strong>
          <div class="ch6-controls" data-preimage-btns></div>
          <div class="ch6-muted" data-preimage-out>点击输出元素查看原像。</div>
        </div>
        <div class="ch6-readout">
          <strong>逆映射</strong>
          <div class="ch6-muted" data-inverse>仅双射时定义。</div>
        </div>
      </div>`,
    );

    function render() {
      const values = X.map((x) => map[x]);
      const defined = X.every((x) => Y.includes(map[x]));
      const image = [...new Set(values)];
      const injective = defined && new Set(values).size === values.length;
      const surjective = defined && Y.every((y) => values.includes(y));
      const bijective = injective && surjective;

      root.querySelector("[data-set-x]").innerHTML =
        "<h4>定义域 X</h4>" +
        X.map(
          (x) =>
            `<div class="ch6-node"><strong>${x}</strong><label>→ <select data-x="${x}">${Y.map(
              (y) => `<option value="${y}" ${map[x] === y ? "selected" : ""}>${y}</option>`,
            ).join("")}</select></label></div>`,
        ).join("");

      root.querySelector("[data-set-y]").innerHTML =
        "<h4>陪域 Y</h4>" +
        Y.map((y) => {
          const hits = X.filter((x) => map[x] === y);
          return `<div class="ch6-node"><strong>${y}</strong><span class="ch6-muted">${hits.length ? `被 ${hits.join(",")}` : "未被命中"}</span></div>`;
        }).join("");

      const st = root.querySelector("[data-map-status]");
      st.className = `ch6-status ${defined ? "is-ok" : "is-bad"}`;
      st.textContent = defined ? "构成映射：每个输入恰有一个输出" : "尚未构成映射";
      root.querySelector("[data-inj]").textContent = injective ? "是" : "否";
      root.querySelector("[data-sur]").textContent = surjective ? "是" : "否";
      root.querySelector("[data-bij]").textContent = bijective ? "是" : "否";
      root.querySelector("[data-image]").textContent = `{${image.join(", ")}}`;
      root.querySelector("[data-preimage-btns]").innerHTML = Y.map(
        (y) => `<button type="button" class="ch6-chip" data-y="${y}">原像 ${y}</button>`,
      ).join("");
      root.querySelector("[data-inverse]").textContent = bijective
        ? `逆映射：${Y.map((y) => `${y}↦${X.find((x) => map[x] === y)}`).join("，")}`
        : "非双射：逆映射不存在。需要同时单射且满射。";

      root.querySelectorAll("select[data-x]").forEach((sel) => {
        sel.onchange = () => {
          map[sel.dataset.x] = sel.value;
          render();
        };
      });
      root.querySelectorAll("[data-y]").forEach((btn) => {
        btn.onclick = () => {
          const y = btn.dataset.y;
          const pre = X.filter((x) => map[x] === y);
          root.querySelector("[data-preimage-out]").textContent = pre.length
            ? `${y} 的原像 = {${pre.join(", ")}}`
            : `${y} 的原像为空集。`;
        };
      });
      M().pulseClass(st);
    }

    root.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        map = { ...presets[btn.dataset.preset] };
        render();
      });
    });
    render();
  }

  // ───────────────────────── §2 Closure Lab ─────────────────────────
  function mountClosureLab(root) {
    const sets = {
      R2: {
        label: "ℝ²",
        contains: () => true,
        note: "标准线性空间。",
      },
      line0: {
        label: "过原点直线 span{(1,1)}",
        contains: (v) => Math.abs(v[0] - v[1]) < 1e-6,
        note: "对加法和数乘封闭。",
      },
      line1: {
        label: "不过原点直线 x+y=1",
        contains: (v) => Math.abs(v[0] + v[1] - 1) < 1e-6,
        note: "仿射直线：零向量不在其中。",
      },
      quad: {
        label: "第一象限（含边界）",
        contains: (v) => v[0] >= -1e-9 && v[1] >= -1e-9,
        note: "负标量数乘会失败。",
      },
      rgb: {
        label: "RGB 立方体 [0,1]²（类比）",
        contains: (v) => v[0] >= 0 && v[0] <= 1 && v[1] >= 0 && v[1] <= 1,
        note: "范围限制破坏封闭性；只作反例。",
      },
    };
    let key = "R2";
    let u = [1, 0.2];
    let v = [0.3, 0.8];
    let s = -1.2;

    root.innerHTML = labShell(
      "封闭性实验室",
      "选择候选集合，检查加法与数乘结果是否仍在集合中。RGB 仅作为视觉类比与反例。",
      `
      <div>
        <div class="ch6-stage" data-stage></div>
        <div class="ch6-legend" style="margin-top:8px">
          <span><i style="background:#2f6fed"></i>u</span>
          <span><i style="background:#d9835f"></i>v</span>
          <span><i style="background:#1f8a4c"></i>u+v</span>
          <span><i style="background:#7c5cff"></i>s·u</span>
        </div>
      </div>
      <div class="ch6-panel">
        <div class="ch6-controls" data-set-btns></div>
        <div class="ch6-slider-row"><label>标量 s = <span data-s-val></span></label><input type="range" min="-2" max="2" step="0.05" value="-1.2" data-s /></div>
        <div class="ch6-readout">
          <strong data-set-label></strong>
          <div class="ch6-muted" data-set-note></div>
          <div class="ch6-gates" style="margin-top:8px">
            <div class="ch6-gate" data-g-add></div>
            <div class="ch6-gate" data-g-scale></div>
            <div class="ch6-gate" data-g-zero></div>
            <div class="ch6-gate" data-g-neg></div>
          </div>
        </div>
        <div class="ch6-muted">拖动画布可移动 u；按住 Shift 拖动移动 v。</div>
      </div>`,
    );

    const stageHost = root.querySelector("[data-stage]");
    const stage = M().createCanvasStage(stageHost);
    root.querySelector("[data-set-btns]").innerHTML = Object.entries(sets)
      .map(([k, sdef]) => `<button type="button" data-set="${k}">${sdef.label}</button>`)
      .join("");

    function gate(el, ok, title, detail) {
      el.className = `ch6-gate ${ok ? "is-ok" : "is-bad"}`;
      el.innerHTML = `<strong>${title}</strong><div class="ch6-muted">${ok ? "通过" : "失败"} · ${detail}</div>`;
    }

    function draw() {
      const S = sets[key];
      const sum = M().add(u, v);
      const su = M().scale(u, s);
      const zeroOk = S.contains([0, 0]);
      const addOk = S.contains(u) && S.contains(v) && S.contains(sum);
      const scaleOk = S.contains(u) && S.contains(su);
      const negOk = S.contains(u) && S.contains(M().scale(u, -1));

      stage.clear();
      stage.drawAxes();
      // region hints
      if (key === "line0") stage.drawSpanLine([1, 1], { color: "rgba(47,111,237,0.16)" });
      if (key === "line1") {
        // draw affine line x+y=1
        stage.drawArrow([-1, 2], [2, -1], { color: "rgba(200,80,80,0.35)", width: 8, label: "x+y=1" });
      }
      if (key === "quad" || key === "rgb") {
        const ctx = stage.ctx;
        const o = [stage.state.width / 2, stage.state.height / 2];
        const a = stage.worldToScreen([0, 0], 48, o);
        const b = stage.worldToScreen([key === "rgb" ? 1 : 4, key === "rgb" ? 1 : 4], 48, o);
        ctx.save();
        ctx.fillStyle = "rgba(47,111,237,0.08)";
        ctx.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
        ctx.restore();
      }
      stage.drawArrow([0, 0], u, { color: "#2f6fed", label: "u" });
      stage.drawArrow([0, 0], v, { color: "#d9835f", label: "v" });
      stage.drawArrow([0, 0], sum, { color: "#1f8a4c", label: "u+v" });
      stage.drawArrow([0, 0], su, { color: "#7c5cff", label: "s u" });

      root.querySelector("[data-set-label]").textContent = S.label;
      root.querySelector("[data-set-note]").textContent = S.note;
      root.querySelector("[data-s-val]").textContent = M().fmt(s, 2);
      gate(root.querySelector("[data-g-add]"), addOk, "加法封闭", `${M().fmtVec(sum)}`);
      gate(root.querySelector("[data-g-scale]"), scaleOk, "数乘封闭", `s=${M().fmt(s, 2)} → ${M().fmtVec(su)}`);
      gate(root.querySelector("[data-g-zero]"), zeroOk, "含零向量", zeroOk ? "0∈集合" : "0∉集合");
      gate(root.querySelector("[data-g-neg]"), negOk, "加法逆", `-u=${M().fmtVec(M().scale(u, -1))}`);
      root.querySelectorAll("[data-set]").forEach((b) => b.classList.toggle("is-active", b.dataset.set === key));
    }

    let drag = null;
    stage.canvas.addEventListener("pointerdown", (evt) => {
      drag = evt.shiftKey ? "v" : "u";
      stage.canvas.setPointerCapture(evt.pointerId);
    });
    stage.canvas.addEventListener("pointermove", (evt) => {
      if (!drag) return;
      const p = stage.pointerWorld(evt);
      if (drag === "u") u = p;
      else v = p;
      draw();
    });
    stage.canvas.addEventListener("pointerup", () => {
      drag = null;
    });
    root.querySelector("[data-s]").addEventListener("input", (e) => {
      s = Number(e.target.value);
      draw();
    });
    root.querySelectorAll("[data-set]").forEach((btn) => {
      btn.addEventListener("click", () => {
        key = btn.dataset.set;
        draw();
      });
    });
    draw();
  }

  // ───────────────────────── §3 Span / Basis / Coords ─────────────────────────
  function mountSpanCoordLab(root) {
    let b1 = [1, 0.2];
    let b2 = [0.3, 1];
    let v = [1.2, 1.1];
    let mode = "span";

    root.innerHTML = labShell(
      "张成 · 独立性 · 坐标解析",
      "拖动两个生成向量与目标向量。观察张成、相关关系，并读取有序基下的坐标。",
      `
      <div>
        <div class="ch6-stage" data-stage></div>
        <div class="ch6-controls" style="margin-top:10px">
          <button type="button" data-mode="span">张成</button>
          <button type="button" data-mode="basis">基判定</button>
          <button type="button" data-mode="coords">坐标</button>
          <button type="button" data-preset="indep">独立</button>
          <button type="button" data-preset="dep">相关</button>
          <button type="button" data-preset="swap">交换基序</button>
        </div>
      </div>
      <div class="ch6-panel">
        <div class="ch6-readout">
          <strong data-title>状态</strong>
          <div class="ch6-muted" data-detail></div>
          <div class="ch6-metric-grid" style="margin-top:8px">
            <div class="ch6-metric"><span>det[b1 b2]</span><strong data-det></strong></div>
            <div class="ch6-metric"><span>是否无关</span><strong data-indep></strong></div>
            <div class="ch6-metric"><span>是否生成平面</span><strong data-span></strong></div>
            <div class="ch6-metric"><span>坐标 [v]_B</span><strong data-coord></strong></div>
          </div>
        </div>
        <div class="ch6-muted">颜色：b1 青绿、b2 蓝色、v 深色。坐标数字跟随基，不跟随 v 的颜色。</div>
      </div>`,
    );

    const stage = M().createCanvasStage(root.querySelector("[data-stage]"));

    function draw() {
      const mat = M().columnsMatrix(b1, b2);
      const d = M().det2(mat);
      const indep = !M().nearZero(d);
      const coord = indep ? M().solve2(mat, v) : null;

      stage.clear();
      stage.drawAxes();
      if (indep) stage.drawGrid(b1, b2, 48, "rgba(32,160,140,0.16)");
      else stage.drawSpanLine(b1, { color: "rgba(32,160,140,0.2)" });
      stage.drawArrow([0, 0], b1, { color: "#12a38a", label: "b1" });
      stage.drawArrow([0, 0], b2, { color: "#2f6fed", label: "b2" });
      stage.drawArrow([0, 0], v, { color: "#243447", label: "v", width: 3 });
      if (coord) {
        const p = M().scale(b1, coord[0]);
        stage.drawArrow([0, 0], p, { color: "rgba(18,163,138,0.55)", width: 2, label: `${M().fmt(coord[0])} b1` });
        stage.drawArrow(p, v, { color: "rgba(47,111,237,0.55)", width: 2, label: `${M().fmt(coord[1])} b2` });
      }

      root.querySelector("[data-det]").textContent = M().fmt(d, 3);
      root.querySelector("[data-indep]").textContent = indep ? "是" : "否";
      root.querySelector("[data-span]").textContent = indep ? "是（平面）" : "否（直线或 {0}）";
      root.querySelector("[data-coord]").textContent = coord ? M().fmtVec(coord) : "基退化";
      const title = root.querySelector("[data-title]");
      const detail = root.querySelector("[data-detail]");
      if (!indep) {
        title.textContent = "线性相关：存在冗余方向";
        detail.textContent = "两个生成向量共线时，张成仍是一条过原点直线，不能构成平面的基。";
      } else if (mode === "coords") {
        title.textContent = "有序基下的唯一坐标";
        detail.textContent = `v = ${M().fmt(coord[0])} b1 + ${M().fmt(coord[1])} b2。交换基顺序会交换坐标分量。`;
      } else {
        title.textContent = "构成 ℝ² 的一组基";
        detail.textContent = "既线性无关，又张成整个平面。维数 = 基向量个数 = 2。";
      }
      root.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("is-active", b.dataset.mode === mode));
    }

    let drag = null;
    stage.canvas.addEventListener("pointerdown", (evt) => {
      const p = stage.pointerWorld(evt);
      const ds = [
        ["b1", M().norm(M().sub(p, b1))],
        ["b2", M().norm(M().sub(p, b2))],
        ["v", M().norm(M().sub(p, v))],
      ].sort((a, b) => a[1] - b[1])[0];
      drag = ds[1] < 0.55 ? ds[0] : "v";
      stage.canvas.setPointerCapture(evt.pointerId);
    });
    stage.canvas.addEventListener("pointermove", (evt) => {
      if (!drag) return;
      const p = stage.pointerWorld(evt);
      if (drag === "b1") b1 = p;
      if (drag === "b2") b2 = p;
      if (drag === "v") v = p;
      draw();
    });
    stage.canvas.addEventListener("pointerup", () => {
      drag = null;
    });
    root.querySelectorAll("[data-mode]").forEach((btn) =>
      btn.addEventListener("click", () => {
        mode = btn.dataset.mode;
        draw();
      }),
    );
    root.querySelector("[data-preset='indep']").addEventListener("click", () => {
      b1 = [1, 0.2];
      b2 = [0.3, 1];
      draw();
    });
    root.querySelector("[data-preset='dep']").addEventListener("click", () => {
      b1 = [1, 0.5];
      b2 = [2, 1];
      draw();
    });
    root.querySelector("[data-preset='swap']").addEventListener("click", () => {
      const t = b1;
      b1 = b2;
      b2 = t;
      draw();
    });
    draw();
  }

  // ───────────────────────── §4 Change of basis ─────────────────────────
  function mountChangeOfBasis(root) {
    let v = [1.4, 1.0];
    let u1 = [1, 0];
    let u2 = [0, 1];
    let w1 = [1, 0.4];
    let w2 = [-0.3, 1];
    let mode = "passive"; // passive | active
    let A = [
      [1.1, 0.4],
      [0.2, 0.9],
    ];

    root.innerHTML = labShell(
      "同一向量，新的坐标",
      "被动换基：几何向量固定，基与坐标改变。主动变换：基固定，向量移动。",
      `
      <div>
        <div class="ch6-stage" data-stage></div>
        <div class="ch6-controls" style="margin-top:10px">
          <button type="button" data-mode="passive">被动换基</button>
          <button type="button" data-mode="active">主动变换</button>
          <button type="button" data-preset="same">两组基相同</button>
          <button type="button" data-preset="shear">剪切基</button>
          <button type="button" data-round>往返检查</button>
        </div>
      </div>
      <div class="ch6-panel">
        <div class="ch6-readout">
          <strong data-mode-title>被动换基</strong>
          <div class="ch6-muted" data-mode-note></div>
          <div class="ch6-metric-grid" style="margin-top:8px">
            <div class="ch6-metric"><span>[v]_U</span><strong data-x></strong></div>
            <div class="ch6-metric"><span>[v]_W</span><strong data-y></strong></div>
            <div class="ch6-metric"><span>P<sub>W←U</sub></span><strong data-p style="font-size:12px"></strong></div>
            <div class="ch6-metric"><span>验证</span><strong data-check></strong></div>
          </div>
        </div>
        <div class="ch6-muted">基 U：青绿/蓝；基 W：紫/橙。坐标颜色跟随基。纯换基时 v 端点保持不动。</div>
      </div>`,
    );

    const stage = M().createCanvasStage(root.querySelector("[data-stage]"));

    function draw() {
      const U = M().columnsMatrix(u1, u2);
      const W = M().columnsMatrix(w1, w2);
      const invU = M().inv2(U);
      const invW = M().inv2(W);
      const x = invU ? M().matVec(invU, mode === "active" ? M().matVec(A, v) : v) : null;
      const y = invW ? M().matVec(invW, mode === "active" ? M().matVec(A, v) : v) : null;
      const P = invW && invU ? M().mul2(invW, U) : null;
      const target = mode === "active" ? M().matVec(A, v) : v;

      stage.clear();
      stage.drawAxes();
      if (mode === "passive") {
        stage.drawGrid(u1, u2, 48, "rgba(18,163,138,0.12)");
        stage.drawGrid(w1, w2, 48, "rgba(124,92,255,0.12)");
      }
      stage.drawArrow([0, 0], u1, { color: "#12a38a", label: "u1" });
      stage.drawArrow([0, 0], u2, { color: "#2f6fed", label: "u2" });
      stage.drawArrow([0, 0], w1, { color: "#7c5cff", label: "w1" });
      stage.drawArrow([0, 0], w2, { color: "#e3942c", label: "w2" });
      if (mode === "active") {
        stage.drawArrow([0, 0], v, { color: "rgba(36,52,71,0.35)", label: "v", width: 2 });
        stage.drawArrow([0, 0], target, { color: "#243447", label: "Av", width: 3 });
      } else {
        stage.drawArrow([0, 0], v, { color: "#243447", label: "v", width: 3 });
      }

      root.querySelector("[data-mode-title]").textContent = mode === "passive" ? "被动换基：对象不动，表示在变" : "主动变换：基固定，向量移动";
      root.querySelector("[data-mode-note]").textContent =
        mode === "passive"
          ? "Ux = Wy。拖动 W 的基向量时，v 端点保持不动，只有坐标 y 改变。"
          : "现在观察 v ↦ Av。这与换基是不同的过程，不要共用“变换”一词含混带过。";
      root.querySelector("[data-x]").textContent = x ? M().fmtVec(x) : "U 退化";
      root.querySelector("[data-y]").textContent = y ? M().fmtVec(y) : "W 退化";
      root.querySelector("[data-p]").textContent = P ? M().fmtMat(P) : "—";
      let check = "—";
      if (x && y && P) {
        const y2 = M().matVec(P, x);
        const ok = M().nearly(y2, y);
        check = ok ? "y = P x 成立" : "数值异常";
      }
      root.querySelector("[data-check]").textContent = check;
      root.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("is-active", b.dataset.mode === mode));
    }

    let drag = null;
    stage.canvas.addEventListener("pointerdown", (evt) => {
      const p = stage.pointerWorld(evt);
      if (mode === "active") {
        drag = "v";
      } else {
        const cand = [
          ["w1", M().norm(M().sub(p, w1))],
          ["w2", M().norm(M().sub(p, w2))],
          ["u1", M().norm(M().sub(p, u1))],
          ["u2", M().norm(M().sub(p, u2))],
          ["v", M().norm(M().sub(p, v))],
        ].sort((a, b) => a[1] - b[1])[0];
        drag = cand[1] < 0.55 ? cand[0] : "v";
      }
      stage.canvas.setPointerCapture(evt.pointerId);
    });
    stage.canvas.addEventListener("pointermove", (evt) => {
      if (!drag) return;
      const p = stage.pointerWorld(evt);
      if (drag === "v") v = p;
      if (drag === "u1") u1 = p;
      if (drag === "u2") u2 = p;
      if (drag === "w1") w1 = p;
      if (drag === "w2") w2 = p;
      draw();
    });
    stage.canvas.addEventListener("pointerup", () => {
      drag = null;
    });
    root.querySelectorAll("[data-mode]").forEach((btn) =>
      btn.addEventListener("click", () => {
        mode = btn.dataset.mode;
        draw();
      }),
    );
    root.querySelector("[data-preset='same']").addEventListener("click", () => {
      w1 = [...u1];
      w2 = [...u2];
      mode = "passive";
      draw();
    });
    root.querySelector("[data-preset='shear']").addEventListener("click", () => {
      u1 = [1, 0];
      u2 = [0, 1];
      w1 = [1, 0.5];
      w2 = [0.2, 1];
      mode = "passive";
      draw();
    });
    root.querySelector("[data-round]").addEventListener("click", () => {
      const U = M().columnsMatrix(u1, u2);
      const W = M().columnsMatrix(w1, w2);
      const invU = M().inv2(U);
      const invW = M().inv2(W);
      if (!invU || !invW) return;
      const P = M().mul2(invW, U);
      const Q = M().mul2(invU, W);
      const I = M().mul2(Q, P);
      root.querySelector("[data-check]").textContent = `往返 P_{U←W}P_{W←U} ≈ ${M().fmtMat(I)}`;
      M().pulseClass(root.querySelector("[data-check]"));
    });
    draw();
  }

  // ───────────────────────── §5 Subspace judge ─────────────────────────
  function mountSubspaceLab(root) {
    let offset = 0; // translate line x-y=offset? use line through (offset,0) direction (1,1)
    let setKey = "line";

    root.innerHTML = labShell(
      "过原点过滤器与子空间判定",
      "平移一条候选直线，观察零向量是否仍在集合中；并对比几类标准候选。",
      `
      <div>
        <div class="ch6-stage" data-stage></div>
        <div class="ch6-slider-row" style="margin-top:10px"><label>平移量 t = <span data-t></span>（t=0 过原点）</label><input type="range" min="-1.5" max="1.5" step="0.05" value="0" data-offset /></div>
      </div>
      <div class="ch6-panel">
        <div class="ch6-controls">
          <button type="button" data-set="line">直线族</button>
          <button type="button" data-set="half">第一象限</button>
          <button type="button" data-set="homog">x+y=0</button>
          <button type="button" data-set="inhom">x+y=1</button>
        </div>
        <div class="ch6-readout">
          <strong data-title></strong>
          <div class="ch6-gates" style="margin-top:8px">
            <div class="ch6-gate" data-g0></div>
            <div class="ch6-gate" data-gadd></div>
            <div class="ch6-gate" data-gscale></div>
            <div class="ch6-gate" data-gfinal></div>
          </div>
          <div class="ch6-muted" data-note style="margin-top:8px"></div>
        </div>
      </div>`,
    );
    const stage = M().createCanvasStage(root.querySelector("[data-stage]"));

    function evaluate() {
      if (setKey === "line") {
        const contains = (p) => Math.abs(p[0] - p[1] - offset) < 1e-6 || Math.abs((p[0] - offset) - p[1]) < 1e-6;
        // line: points = (offset,0) + span{(1,1)} => x-y=offset
        const c = (p) => Math.abs(p[0] - p[1] - offset) < 1e-6;
        const zero = c([0, 0]);
        const add = c([1 + offset, 1]) && c([2 + offset, 2]) ? Math.abs(offset) < 1e-9 : false;
        // better explicit:
        const p1 = [offset + 1, 1];
        const p2 = [offset + 2, 2];
        const addOk = c(p1) && c(p2) && c(M().add(p1, p2));
        const scaleOk = c(p1) && c(M().scale(p1, -1));
        return {
          title: offset === 0 || Math.abs(offset) < 1e-9 ? "过原点直线：子空间候选通过" : "平移后的直线：仿射集合",
          zero,
          addOk,
          scaleOk,
          note: Math.abs(offset) < 1e-9 ? "含零、加法与数乘都封闭。" : "零向量离开集合；这是仿射直线，不是线性子空间。",
        };
      }
      if (setKey === "half") {
        const c = (p) => p[0] >= -1e-9 && p[1] >= -1e-9;
        return {
          title: "第一象限",
          zero: c([0, 0]),
          addOk: true,
          scaleOk: false,
          note: "加法在象限内看似安全，但负标量数乘会越界。",
        };
      }
      if (setKey === "homog") {
        const c = (p) => Math.abs(p[0] + p[1]) < 1e-6;
        return {
          title: "齐次方程 x+y=0",
          zero: true,
          addOk: true,
          scaleOk: true,
          note: "齐次解集是子空间。",
        };
      }
      const c = (p) => Math.abs(p[0] + p[1] - 1) < 1e-6;
      return {
        title: "非齐次方程 x+y=1",
        zero: false,
        addOk: false,
        scaleOk: false,
        note: "特解 + 齐次解，整体是仿射平面/直线，不是子空间。",
      };
    }

    function draw() {
      offset = Number(root.querySelector("[data-offset]").value);
      root.querySelector("[data-t]").textContent = M().fmt(offset, 2);
      stage.clear();
      stage.drawAxes();
      if (setKey === "line") {
        const a = [offset - 3, -3];
        const b = [offset + 3, 3];
        stage.drawArrow(a, b, { color: Math.abs(offset) < 1e-9 ? "rgba(18,163,138,0.55)" : "rgba(196,60,60,0.5)", width: 10, label: "候选直线" });
        stage.drawPoint([0, 0], { color: "#243447", label: "0" });
      } else if (setKey === "half") {
        const ctx = stage.ctx;
        const o = [stage.state.width / 2, stage.state.height / 2];
        const a = stage.worldToScreen([0, 0], 48, o);
        const b = stage.worldToScreen([4, 4], 48, o);
        ctx.save();
        ctx.fillStyle = "rgba(47,111,237,0.1)";
        ctx.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
        ctx.restore();
      } else if (setKey === "homog") {
        stage.drawSpanLine([1, -1], { color: "rgba(18,163,138,0.25)" });
      } else {
        stage.drawArrow([-2, 3], [3, -2], { color: "rgba(196,60,60,0.45)", width: 10, label: "x+y=1" });
      }

      const ev = evaluate();
      root.querySelector("[data-title]").textContent = ev.title;
      const g = (el, ok, label) => {
        el.className = `ch6-gate ${ok ? "is-ok" : "is-bad"}`;
        el.innerHTML = `<strong>${label}</strong><div class="ch6-muted">${ok ? "通过" : "失败"}</div>`;
      };
      g(root.querySelector("[data-g0]"), ev.zero, "含零向量");
      g(root.querySelector("[data-gadd]"), ev.addOk, "加法封闭");
      g(root.querySelector("[data-gscale]"), ev.scaleOk, "数乘封闭");
      const all = ev.zero && ev.addOk && ev.scaleOk;
      g(root.querySelector("[data-gfinal]"), all, "子空间判定");
      root.querySelector("[data-note]").textContent = ev.note;
      root.querySelectorAll("[data-set]").forEach((b) => b.classList.toggle("is-active", b.dataset.set === setKey));
      root.querySelector("[data-offset]").disabled = setKey !== "line";
    }

    root.querySelector("[data-offset]").addEventListener("input", draw);
    root.querySelectorAll("[data-set]").forEach((btn) =>
      btn.addEventListener("click", () => {
        setKey = btn.dataset.set;
        draw();
      }),
    );
    draw();
  }

  // ───────────────────────── §6 Intersection / Sum ─────────────────────────
  function mountIntersectionSum(root) {
    let a = 0.35; // angle of U line
    let b = -0.55; // angle of W line
    let preset = "two-lines";

    root.innerHTML = labShell(
      "子空间混合器与维数账本",
      "两条过原点直线的交与和。和空间是全部 u+w，不是集合并。",
      `
      <div>
        <div class="ch6-stage" data-stage></div>
        <div class="ch6-controls" style="margin-top:10px">
          <button type="button" data-preset="two-lines">两不同直线</button>
          <button type="button" data-preset="same">两相同直线</button>
          <button type="button" data-preset="perp">接近正交</button>
        </div>
        <div class="ch6-slider-row"><label>方向 U</label><input type="range" min="-1.4" max="1.4" step="0.02" value="0.35" data-a /></div>
        <div class="ch6-slider-row"><label>方向 W</label><input type="range" min="-1.4" max="1.4" step="0.02" value="-0.55" data-b /></div>
      </div>
      <div class="ch6-panel">
        <div class="ch6-readout">
          <strong>维数账本</strong>
          <div class="ch6-metric-grid" style="margin-top:8px">
            <div class="ch6-metric"><span>dim U</span><strong data-du></strong></div>
            <div class="ch6-metric"><span>dim W</span><strong data-dw></strong></div>
            <div class="ch6-metric"><span>dim(U∩W)</span><strong data-di></strong></div>
            <div class="ch6-metric"><span>dim(U+W)</span><strong data-ds></strong></div>
          </div>
          <div class="ch6-muted" data-formula style="margin-top:8px"></div>
        </div>
        <div class="ch6-readout">
          <strong data-sum-title></strong>
          <div class="ch6-muted" data-sum-note></div>
        </div>
      </div>`,
    );
    const stage = M().createCanvasStage(root.querySelector("[data-stage]"));

    function dir(t) {
      return [Math.cos(t), Math.sin(t)];
    }

    function draw() {
      a = Number(root.querySelector("[data-a]").value);
      b = Number(root.querySelector("[data-b]").value);
      const u = dir(a);
      const w = dir(b);
      const same = Math.abs(M().cross(u, w)) < 1e-3;
      const dimU = 1;
      const dimW = 1;
      const dimI = same ? 1 : 0;
      const dimS = dimU + dimW - dimI;

      stage.clear();
      stage.drawAxes();
      if (!same) {
        // sum is whole plane
        const ctx = stage.ctx;
        ctx.save();
        ctx.fillStyle = "rgba(47,111,237,0.06)";
        ctx.fillRect(0, 0, stage.state.width, stage.state.height);
        ctx.restore();
      }
      stage.drawSpanLine(u, { color: "rgba(18,163,138,0.35)", width: 16 });
      stage.drawSpanLine(w, { color: "rgba(124,92,255,0.35)", width: 16 });
      if (same) stage.drawSpanLine(u, { color: "rgba(227,148,44,0.45)", width: 8 });
      stage.drawArrow([0, 0], u, { color: "#12a38a", label: "U" });
      stage.drawArrow([0, 0], w, { color: "#7c5cff", label: "W" });
      stage.drawPoint([0, 0], { color: "#243447", label: "0" });

      root.querySelector("[data-du]").textContent = String(dimU);
      root.querySelector("[data-dw]").textContent = String(dimW);
      root.querySelector("[data-di]").textContent = String(dimI);
      root.querySelector("[data-ds]").textContent = String(dimS);
      root.querySelector("[data-formula]").textContent = `dim(U+W)=${dimU}+${dimW}-${dimI}=${dimS}。公共方向只应计算一次。`;
      root.querySelector("[data-sum-title]").textContent = same ? "U+W 仍是同一条直线" : "U+W 是整个平面";
      root.querySelector("[data-sum-note]").textContent = same
        ? "交与和都是这条直线。集合并也是它，但一般情形并集不是子空间。"
        : "任意平面向量都可写成 u 方向与 w 方向分量之和。这不是两线颜色的简单重叠。";
    }

    root.querySelector("[data-a]").addEventListener("input", draw);
    root.querySelector("[data-b]").addEventListener("input", draw);
    root.querySelectorAll("[data-preset]").forEach((btn) =>
      btn.addEventListener("click", () => {
        preset = btn.dataset.preset;
        if (preset === "two-lines") {
          root.querySelector("[data-a]").value = "0.35";
          root.querySelector("[data-b]").value = "-0.55";
        }
        if (preset === "same") {
          root.querySelector("[data-a]").value = "0.4";
          root.querySelector("[data-b]").value = "0.4";
        }
        if (preset === "perp") {
          root.querySelector("[data-a]").value = "0";
          root.querySelector("[data-b]").value = "1.57";
        }
        draw();
      }),
    );
    draw();
  }

  // ───────────────────────── §7 Direct sum ─────────────────────────
  function mountDirectSum(root) {
    let v = [1.3, 1.0];
    let uDir = [1, 0.2];
    let wDir = [0.2, 1];
    let share = 0; // 0 = direct sum, >0 blend shared direction
    let orthogonal = false;

    root.innerHTML = labShell(
      "分解实验室与唯一性破坏器",
      "先看非正交直和的唯一分解；再引入公共方向，观察分解如何不再唯一。",
      `
      <div>
        <div class="ch6-stage" data-stage></div>
        <div class="ch6-controls" style="margin-top:10px">
          <button type="button" data-preset="direct">非正交直和</button>
          <button type="button" data-preset="break">破坏唯一性</button>
          <button type="button" data-ortho>切换正交模式</button>
        </div>
        <div class="ch6-slider-row"><label>公共方向混合 s = <span data-s></span></label><input type="range" min="0" max="1" step="0.02" value="0" data-share /></div>
        <div class="ch6-slider-row"><label>分解参数 t（仅交非零时）</label><input type="range" min="-1" max="1" step="0.02" value="0" data-t /></div>
      </div>
      <div class="ch6-panel">
        <div class="ch6-readout">
          <strong data-gate-title></strong>
          <div class="ch6-gates" style="margin-top:8px">
            <div class="ch6-gate" data-cover></div>
            <div class="ch6-gate" data-unique></div>
          </div>
          <div class="ch6-metric-grid" style="margin-top:8px">
            <div class="ch6-metric"><span>u ∈ U</span><strong data-u></strong></div>
            <div class="ch6-metric"><span>w ∈ W</span><strong data-w></strong></div>
          </div>
          <div class="ch6-muted" data-note style="margin-top:8px"></div>
        </div>
      </div>`,
    );
    const stage = M().createCanvasStage(root.querySelector("[data-stage]"));
    let t = 0;

    function currentDirs() {
      let u = [...uDir];
      let w = [...wDir];
      if (orthogonal) {
        u = [1, 0];
        w = [0, 1];
      }
      if (share > 0) {
        const z = [1, 1];
        u = M().add(M().scale(u, 1 - share), M().scale(z, share));
        w = M().add(M().scale(w, 1 - share), M().scale(z, share));
      }
      return { u, w };
    }

    function draw() {
      share = Number(root.querySelector("[data-share]").value);
      t = Number(root.querySelector("[data-t]").value);
      root.querySelector("[data-s]").textContent = M().fmt(share, 2);
      const { u: ud, w: wd } = currentDirs();
      const mat = M().columnsMatrix(ud, wd);
      const det = M().det2(mat);
      const unique = Math.abs(det) > 1e-6;
      const cover = unique; // in R2, two indep lines cover
      let uComp = [0, 0];
      let wComp = [0, 0];
      if (unique) {
        const coef = M().solve2(mat, v);
        uComp = M().scale(ud, coef[0]);
        wComp = M().scale(wd, coef[1]);
      } else {
        // shared direction roughly z
        const z = M().norm(ud) > 1e-6 ? ud : [1, 1];
        // pick one decomposition along the line family if v parallel enough
        const base = M().scale(v, 0.5);
        uComp = M().add(base, M().scale(z, t));
        wComp = M().sub(v, uComp);
      }

      stage.clear();
      stage.drawAxes();
      stage.drawSpanLine(ud, { color: "rgba(18,163,138,0.25)", width: 14 });
      stage.drawSpanLine(wd, { color: "rgba(124,92,255,0.25)", width: 14 });
      stage.drawArrow([0, 0], uComp, { color: "#12a38a", label: "u" });
      stage.drawArrow(uComp, v, { color: "#7c5cff", label: "w" });
      stage.drawArrow([0, 0], v, { color: "#243447", label: "v", width: 3 });

      const gate = (el, ok, title) => {
        el.className = `ch6-gate ${ok ? "is-ok" : "is-bad"}`;
        el.innerHTML = `<strong>${title}</strong><div class="ch6-muted">${ok ? "通过" : "失败"}</div>`;
      };
      gate(root.querySelector("[data-cover]"), cover, "覆盖：U+W=ℝ²");
      gate(root.querySelector("[data-unique]"), unique, "唯一：U∩W={0}");
      root.querySelector("[data-gate-title]").textContent = cover && unique ? "ℝ² = U ⊕ W" : "尚未形成直和";
      root.querySelector("[data-u]").textContent = M().fmtVec(uComp);
      root.querySelector("[data-w]").textContent = M().fmtVec(wComp);
      root.querySelector("[data-note]").textContent = unique
        ? orthogonal
          ? "正交直和是特殊情形：分量可用投影读取，但定义仍是覆盖+零交。"
          : "非正交也可唯一分解。直和不要求垂直。"
        : "存在公共方向时，v=(u+tz)+(w-tz) 给出无穷多分解。拖动 t 观察。";
      root.querySelector("[data-t]").disabled = unique;
    }

    stage.canvas.addEventListener("pointerdown", (evt) => {
      stage.canvas.setPointerCapture(evt.pointerId);
      stage.canvas._drag = true;
    });
    stage.canvas.addEventListener("pointermove", (evt) => {
      if (!stage.canvas._drag) return;
      v = stage.pointerWorld(evt);
      draw();
    });
    stage.canvas.addEventListener("pointerup", () => {
      stage.canvas._drag = false;
    });
    root.querySelector("[data-share]").addEventListener("input", draw);
    root.querySelector("[data-t]").addEventListener("input", draw);
    root.querySelector("[data-preset='direct']").addEventListener("click", () => {
      share = 0;
      root.querySelector("[data-share]").value = "0";
      uDir = [1, 0.25];
      wDir = [0.3, 1];
      orthogonal = false;
      draw();
    });
    root.querySelector("[data-preset='break']").addEventListener("click", () => {
      root.querySelector("[data-share]").value = "0.85";
      draw();
    });
    root.querySelector("[data-ortho]").addEventListener("click", () => {
      orthogonal = !orthogonal;
      root.querySelector("[data-share]").value = "0";
      draw();
    });
    draw();
  }

  // ───────────────────────── §8 Isomorphism ─────────────────────────
  function mountIsomorphism(root) {
    let a = 1;
    let b = -0.5;
    let c = 0.8;
    let basis = "std";

    root.innerHTML = labShell(
      "结构桥：P₂ 与 ℝ³ 的坐标同构",
      "多项式与坐标列外表不同，却共享加法和数乘结构。维数相同是有限维同构的关键前提。",
      `
      <div class="ch6-panel" style="grid-column:1/-1">
        <div class="ch6-controls">
          <button type="button" data-basis="std">基 (1,x,x²)</button>
          <button type="button" data-basis="shift">基 (1,1+x,x²)</button>
          <button type="button" data-mismatch>维数不匹配示意</button>
        </div>
        <div class="ch6-slider-row"><label>a = <span data-av></span></label><input type="range" min="-2" max="2" step="0.05" value="1" data-a /></div>
        <div class="ch6-slider-row"><label>b = <span data-bv></span></label><input type="range" min="-2" max="2" step="0.05" value="-0.5" data-b /></div>
        <div class="ch6-slider-row"><label>c = <span data-cv></span></label><input type="range" min="-2" max="2" step="0.05" value="0.8" data-c /></div>
        <div class="ch6-metric-grid">
          <div class="ch6-metric"><span>多项式</span><strong data-poly></strong></div>
          <div class="ch6-metric"><span>坐标 [f]_B</span><strong data-coord></strong></div>
          <div class="ch6-metric"><span>T(f+g) 与 Tf+Tg</span><strong data-linadd>一致</strong></div>
          <div class="ch6-metric"><span>逆映射</span><strong data-inv></strong></div>
        </div>
        <div class="ch6-readout" style="margin-top:8px">
          <strong data-title>坐标同构</strong>
          <div class="ch6-muted" data-note></div>
        </div>
      </div>`,
      true,
    );

    function draw() {
      a = Number(root.querySelector("[data-a]").value);
      b = Number(root.querySelector("[data-b]").value);
      c = Number(root.querySelector("[data-c]").value);
      root.querySelector("[data-av]").textContent = M().fmt(a, 2);
      root.querySelector("[data-bv]").textContent = M().fmt(b, 2);
      root.querySelector("[data-cv]").textContent = M().fmt(c, 2);

      let poly = "";
      let coord = [];
      let inv = "";
      if (basis === "std") {
        poly = `${M().fmt(a, 2)} + ${M().fmt(b, 2)}x + ${M().fmt(c, 2)}x²`;
        coord = [a, b, c];
        inv = `(a,b,c)ᵀ ↦ a+bx+cx²`;
        root.querySelector("[data-title]").textContent = "T: P₂ → ℝ³ 是同构";
        root.querySelector("[data-note]").textContent =
          "线性且双射。有限维、同一数域下，维数相等 ⇒ 存在同构；不同基给出不同坐标同构。";
      } else if (basis === "shift") {
        // f = α·1 + β·(1+x) + γ·x² = (α+β) + β x + γ x²
        // given a,b,c as coefficients in standard, display coords in new basis
        // a=α+β, b=β, c=γ => β=b, α=a-b, γ=c
        const alpha = a - b;
        const beta = b;
        const gamma = c;
        poly = `${M().fmt(a, 2)} + ${M().fmt(b, 2)}x + ${M().fmt(c, 2)}x²`;
        coord = [alpha, beta, gamma];
        inv = "用新基系数恢复同一多项式";
        root.querySelector("[data-title]").textContent = "换基后同构映射改变";
        root.querySelector("[data-note]").textContent =
          "同一个多项式在基 (1,1+x,x²) 下坐标变为另一列。同构存在，但不唯一、不天然。";
      } else {
        poly = `${M().fmt(a, 2)} + ${M().fmt(b, 2)}x`;
        coord = [a, b];
        inv = "二维坐标无法可逆覆盖三维";
        root.querySelector("[data-title]").textContent = "维数不匹配 ⇒ 无线性同构";
        root.querySelector("[data-note]").textContent =
          "P₁ 与 ℝ³ 维数不同：再双射集合对应也无法成为线性同构。维数是同构不变量。";
      }
      root.querySelector("[data-poly]").textContent = poly;
      root.querySelector("[data-coord]").textContent = `(${coord.map((x) => M().fmt(x, 2)).join(", ")})`;
      root.querySelector("[data-inv]").textContent = inv;
      root.querySelectorAll("[data-basis]").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.basis === basis));
    }

    ["a", "b", "c"].forEach((k) => root.querySelector(`[data-${k}]`).addEventListener("input", draw));
    root.querySelectorAll("[data-basis]").forEach((btn) =>
      btn.addEventListener("click", () => {
        basis = btn.dataset.basis;
        draw();
      }),
    );
    root.querySelector("[data-mismatch]").addEventListener("click", () => {
      basis = "mismatch";
      draw();
    });
    draw();
  }

  function formalFor(sectionId) {
    const map = {
      "sets-maps": formalShell(
        "集合与映射的语言",
        "先把对象装进集合，再规定每个输入恰有一个输出。后面的线性结构都建立在这套语言上。",
        module("1", "映射的合法性", "每个输入恰有一个输出", `<p>没有输出或一个输入对应两个输出，都不是映射。不同输入可以共享同一输出。</p>`) +
          module("2", "像 · 原像 · 值域", "陪域由声明给出", `<p>值域是实际被命中的输出；原像可能为空、一个或多个元素。</p>`) +
          module("3", "单射 · 满射 · 双射", "三个独立指标", `<p>双射 ⇔ 可逆。复合映射 ${tex("g\\circ f")} 右边先作用。</p>`),
      ),
      "vector-space-definition": formalShell(
        "线性空间：共同的运算结构",
        "忘掉向量的外观，只保留加法和数乘。公理按加法结构与数乘兼容分组理解。",
        module("1", "四件套", "集合 · 数域 · 加法 · 数乘", `<p>几何向量、多项式、矩阵、函数都可以成为线性空间。</p>`) +
          module("2", "封闭性", "运算结果仍在集合内", `<p>不过原点直线、第一象限、RGB 立方体是常见失败案例。</p>`) +
          module("3", "简单性质", "由公理推出", `<p>${tex("0v=0")}、${tex("a0=0")}、${tex("(-1)v=-v")} 等需标明所用公理。</p>`),
      ),
      "basis-coordinates": formalShell(
        "基是空间的骨架",
        "生成与无关同时成立时，有序基给出每个向量的唯一坐标。",
        module("1", "张成与相关", "够不够，多不多", `<p>共线向量不增加维数；冗余方向使线性相关。</p>`) +
          module("2", "维数", "基的向量个数", `<p>维数属于空间，不属于某一组坐标外观。</p>`) +
          module("3", "坐标", "相对有序基的编码", `<p>${tex("v=x_1b_1+\\cdots+x_nb_n")}，基顺序改变则坐标改变。</p>`),
      ),
      "change-of-basis": formalShell(
        "对象与表示",
        "换基时几何向量可以不动；移动的是基、网格与坐标。主动变换是另一回事。",
        module("1", "基矩阵", tex("v=Ux"), `<p>矩阵列就是有序基向量。</p>`) +
          module("2", "过渡矩阵", tex("P_{W\\leftarrow U}=W^{-1}U"), `<p>方向记号不能省略：${tex("y=P_{W\\leftarrow U}x")}。</p>`) +
          module("3", "主动 / 被动", "必须分开", `<p>主动：${tex("v\\mapsto Av")}；被动：同一 v，不同坐标。</p>`),
      ),
      subspaces: formalShell(
        "子空间继承线性结构",
        "子集要成为线性空间，必须含零并对加法和数乘封闭。",
        module("1", "判定", "零 · 加法 · 数乘", `<p>也可合并为 ${tex("\\alpha u+\\beta v\\in U")}。</p>`) +
          module("2", "仿射反例", "平移离开原点", `<p>形状仍是直线或平面，却不是子空间。</p>`) +
          module("3", "标准来源", "span 与齐次解集", `<p>非齐次解集一般只是仿射平移。</p>`),
      ),
      "intersection-sum": formalShell(
        "交与和",
        "交收集公共方向；和收集全部 u+w。维数公式用交空间校正重复计算。",
        module("1", "定义", tex("U\\cap W") + " 与 " + tex("U+W"), `<p>两者仍是子空间；集合并一般不是。</p>`) +
          module("2", "基合并", "生成组去冗余", `<p>得到 U+W 的基。</p>`) +
          module("3", "维数公式", tex("\\dim(U+W)=\\dim U+\\dim W-\\dim(U\\cap W)"), `<p>公共方向只计一次。</p>`),
      ),
      "direct-sum": formalShell(
        "直和：唯一分解",
        "覆盖且零交，等价于每个向量唯一写成 u+w。正交只是特例。",
        module("1", "双条件", tex("V=U+W") + " 且 " + tex("U\\cap W=\\{0\\}"), `<p>缺一不可。</p>`) +
          module("2", "破坏唯一性", "公共方向", `<p>${tex("v=(u+tz)+(w-tz)")}。</p>`) +
          module("3", "正交直和", "更强结构", `<p>可用投影读分量，但不能替代一般定义。</p>`),
      ),
      isomorphism: formalShell(
        "同构：结构相同",
        "线性且双射。有限维同数域空间同构当且仅当维数相同。",
        module("1", "线性映射", tex("T(au+bv)=aT(u)+bT(v)"), `<p>先保持运算，再谈是否可逆。</p>`) +
          module("2", "坐标同构", tex("v\\mapsto [v]_B"), `<p>选定基后 ${tex("V\\cong K^n")}。</p>`) +
          module("3", "同构 ≠ 相等", "也不等于等距", `<p>外表可以不同；内积结构是额外数据。</p>`),
      ),
    };
    return map[sectionId] || "";
  }

  const mounts = {
    "sets-maps": mountMapBuilder,
    "vector-space-definition": mountClosureLab,
    "basis-coordinates": mountSpanCoordLab,
    "change-of-basis": mountChangeOfBasis,
    subspaces: mountSubspaceLab,
    "intersection-sum": mountIntersectionSum,
    "direct-sum": mountDirectSum,
    isomorphism: mountIsomorphism,
  };

  Object.keys(mounts).forEach((id) => {
    window.defineChapter6Renderer(id, {
      formal(formalRoot, section) {
        if (!formalRoot) return;
        const html = formalFor(id);
        if (!html) return;
        const concepts = (section?.concepts || [])
          .map((c) => `<div class="concept-item"><strong>${c.label}</strong><p>${c.text}</p></div>`)
          .join("");
        const textbook = section?.textbook
          ? `<div class="script-panel textbook-panel"><h3>${section.textbookSection || section.title} · ${section.textbook.reference || ""}</h3><ul>${(section.textbook.items || []).map((item) => `<li>${item}</li>`).join("")}</ul></div>`
          : "";
        formalRoot.innerHTML = `<h2>定理概念</h2>${html}${concepts ? `<div class="concept-strip">${concepts}</div>` : ""}${textbook}`;
      },
      interactive(interactiveRoot, section) {
        if (!interactiveRoot) return;
        const title = section?.interactive?.title || "交互实验";
        const task = section?.interactive?.task || "";
        const prompts = section?.interactive?.prompts || [];
        const promptBlock =
          task || prompts.length
            ? `<div class="script-panel"><h3>操作任务</h3>${task ? `<p>${task}</p>` : ""}${
                prompts.length ? `<ol>${prompts.map((item) => `<li>${item}</li>`).join("")}</ol>` : ""
              }</div>`
            : "";
        interactiveRoot.innerHTML = `<h2>交互实验</h2><div data-ch6-lab></div>${promptBlock}`;
        mounts[id](interactiveRoot.querySelector("[data-ch6-lab]"));
      },
    });
  });
})();
