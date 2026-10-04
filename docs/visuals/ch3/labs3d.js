/*
 * Chapter 3 interactive labs built on the shared 3D scene (visuals/shared/scene3d.js).
 * Each lab follows the same rhythm: the student commits to a prediction, acts on
 * the picture, and only then reads the conclusion. All ranks and solution sets
 * are decided with exact rational arithmetic (Ch3Math), never with float tolerances.
 */
(() => {
  const M = () => window.Ch3Math;
  const S = () => window.LAScene3D;
  const tex = (s) => M().tex(s);
  const texD = (s) => M().texD(s);
  const F = (x) => M().parseF(x);
  const num = (x) => M().toNumber(x);
  const fmt = (x) => M().latexF(x);
  const vecNum = (v) => v.map(num);
  const vecF = (v) => v.map(F);
  /* Slider and preset values are halves or quarters: show them as exact fractions. */
  const texNum = (x) => tex(fmt(F(x)));
  /* A value in motion: two decimals at most, marked approximate, with a true minus sign. */
  const approx = (x) => `≈${String(Math.round(x * 100) / 100).replace("-", "−")}`;

  /* √N for a positive integer N as [k, m] with N = k²m and m squarefree. */
  function sqrtSplit(N) {
    let k = 1;
    let m = N;
    for (let p = 2; p * p <= m; p += 1) {
      while (m % (p * p) === 0) {
        m /= p * p;
        k *= p;
      }
    }
    return [k, m];
  }

  /* Exact LaTeX for |r| / √N (a point-to-plane distance), e.g. \frac{3}{2\sqrt{14}}. */
  function distTex(r, N) {
    if (M().isZero(r)) return "0";
    const [k, m] = sqrtSplit(N);
    const top = Math.abs(r.n);
    const bottom = r.d * k;
    if (m === 1) return fmt(F(top, bottom));
    return `\\frac{${top}}{${bottom === 1 ? "" : bottom}\\sqrt{${m}}}`;
  }

  /* ---------- shared UI pieces ---------- */

  function el(tag, cls, html) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function buttons(host, items, onPick, activeKey) {
    host.innerHTML = items
      .map(([key, label]) => `<button type="button" class="ch3l-chip${key === activeKey ? " is-active" : ""}" data-key="${key}">${label}</button>`)
      .join("");
    host.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => {
        host.querySelectorAll("button").forEach((x) => x.classList.toggle("is-active", x === b));
        onPick(b.dataset.key);
      }),
    );
  }

  /*
   * Prediction gate: the student picks an answer before the conclusion panel
   * opens. Wrong picks stay visible so the student can compare with the picture.
   */
  function predictGate(host, spec, onAnswered) {
    spec = { ...spec, options: window.LAStableShuffle ? window.LAStableShuffle(spec.options, spec.question) : spec.options };
    const box = el("div", "ch3l-predict");
    box.innerHTML = `<div class="ch3l-predict-q"><span>先猜一猜</span><p>${spec.question}</p></div>
      <div class="ch3l-predict-options">${spec.options.map((o, i) => `<button type="button" data-i="${i}" data-ok="${o.correct ? "true" : "false"}" data-why="${String(o.why || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">${o.text}</button>`).join("")}</div>
      <p class="ch3l-predict-feedback" hidden></p>`;
    host.append(box);
    const feedback = box.querySelector(".ch3l-predict-feedback");
    /*
     * Predict -> act -> reveal, as in the other chapters: the verdict and the
     * conclusion open only after the student has also acted on the picture.
     */
    let choice = null;
    let revealed = false;
    function reveal() {
      if (revealed || choice == null) return;
      revealed = true;
      const o = spec.options[choice];
      feedback.innerHTML = o.correct ? `✓ ${spec.right}` : `再看看图：${o.why || spec.hint || "再看看图。"}`;
      box.querySelectorAll("[data-i]").forEach((x, i) => {
        x.classList.remove("is-picked");
        x.classList.toggle(spec.options[i].correct ? "is-right" : "is-wrong", i === choice);
      });
      box.classList.add("is-done");
      onAnswered?.();
    }
    box.querySelectorAll("[data-i]").forEach((b) =>
      b.addEventListener("click", () => {
        if (revealed) return;
        choice = Number(b.dataset.i);
        box.querySelectorAll("[data-i]").forEach((x) => x.classList.toggle("is-picked", x === b));
        feedback.hidden = false;
        feedback.textContent = "记下了你的猜测。现在在图上动手操作一次，结论随后出现。";
        spec.onPick?.();
      }),
    );
    const lab = host.closest(".ch3l-lab") || host.parentElement;
    /*
     * Acting means changing what the lab reports. Rotating the camera, a view-only
     * button or a click on the text leaves the readouts as they were, so it does
     * not count; moving b, v₃, c or running a step changes them.
     */
    const state = () => {
      const parts = [];
      const walk = document.createTreeWalker(lab, NodeFilter.SHOW_TEXT);
      while (walk.nextNode()) {
        const node = walk.currentNode;
        if (node.parentElement?.closest(".ch3l-predict, button, .ch3l-head, .la-figcaption, .la3d-hint, .katex-mathml")) continue;
        parts.push(node.textContent.trim());
      }
      lab.querySelectorAll("input").forEach((input) => parts.push(input.value));
      return parts.join("|");
    };
    // the readouts at the moment of the pick; refreshed once after the lab's own redraw,
    // unless the student has already acted by then
    let before = null;
    let touched = false;
    box.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => {
      if (before != null) return;
      before = state();
      requestAnimationFrame(() => { if (!touched && !revealed) before = state(); });
    }));
    const check = () => {
      if (choice == null || revealed || before == null) return;
      if (state() !== before) reveal();
    };
    const acted = (event) => {
      if (choice == null || revealed || box.contains(event.target)) return;
      touched = true;
      // the lab redraws its readouts after its own handlers, and animations finish later
      setTimeout(check, 60);
      setTimeout(check, 400);
      setTimeout(check, 1100);
    };
    ["pointerup", "input", "change", "keyup", "click"].forEach((type) => lab?.addEventListener(type, acted));
    // dragging a handle on the canvas is acting even when the readouts are still hidden
    lab?.addEventListener("la-handle-move", () => { if (choice != null && before != null) reveal(); });
    return box;
  }

  function labShell(root, { title, task }) {
    root.innerHTML = `<h2>交互实验</h2>`;
    const lab = el("section", "ch3l-lab");
    lab.innerHTML = `<header class="ch3l-head"><h3>${title}</h3><p>${task}</p></header>`;
    root.append(lab);
    return lab;
  }

  function planeObj(row, color, extra = {}) {
    return { type: "plane", n: vecNum(row.slice(0, 3)), d: num(row[3]), color, alpha: 0.14, ...extra };
  }

  function isZeroRow(row, upTo = 3) {
    return row.slice(0, upTo).every((x) => M().isZero(x));
  }

  /* Intersection line of two planes (rows [a|d]); null when parallel. */
  function planeLine(r1, r2) {
    const aug = [r1.map(F), r2.map(F)];
    const part = M().particularSolution(aug);
    if (!part.ok) return null;
    const ns = M().nullspaceBasis(aug.map((r) => r.slice(0, 3))).basis;
    if (ns.length !== 1) return null;
    return { p: vecNum(part.x), dir: vecNum(ns[0]) };
  }

  /* Solution set of a 3-variable system as drawable objects. */
  function solutionObjects(aug, color = "drag") {
    const part = M().particularSolution(aug);
    if (!part.ok) return [];
    const ns = M().nullspaceBasis(aug.map((r) => r.slice(0, 3))).basis.map(vecNum);
    const p = vecNum(part.x);
    if (ns.length === 0) return [{ type: "point", p, color, r: 6.5, label: "解" }];
    if (ns.length === 1) return [{ type: "line", p, dir: ns[0], color, width: 3.6, label: "解集" }];
    if (ns.length === 2) {
      const n = S().vec.cross(ns[0], ns[1]);
      return [{ type: "plane", n, d: S().vec.dot(n, p), color, alpha: 0.22 }];
    }
    return [];
  }

  function describeSolution(aug) {
    const c = M().classifySystem(aug);
    const { rankA, rankAug, free } = c.info;
    if (c.key === "none") return `无解：${tex(`\\operatorname{rank}A=${rankA}<\\operatorname{rank}[A\\mid b]=${rankAug}`)}`;
    if (c.key === "unique") {
      const x = M().particularSolution(aug).x;
      return `唯一解 ${tex(`x=(${x.map(fmt).join(",")})`)}`;
    }
    return `无穷多解：${free.length} 个自由变量，解集是${free.length === 1 ? "一条直线" : "一个平面"}`;
  }

  /*
   * Colour roles (docs/design-spec.md §2): the first and second equation / row /
   * column take v1 and v2; the third takes the subspace green. Solution sets are
   * gold because they are where the student's x can sit.
   */
  const PLANE_COLORS = ["v1", "v2", "subspace"];

  /* ================= §1 消元法 ================= */

  const ELIM_PRESETS = {
    unique: { label: "交于一点", rows: [[1, 1, 1, 2], [2, 2, 3, 5], [1, -1, 1, 0]] },
    prism: { label: "三棱柱（无解）", rows: [[1, 1, 1, 1], [1, -1, 2, 2], [2, 0, 3, 4]] },
    line: { label: "共一条线", rows: [[1, 1, 1, 1], [1, -1, 2, 2], [2, 0, 3, 3]] },
    parallel: { label: "两平面平行", rows: [[1, 1, 1, 1], [1, 1, 1, 3], [1, -1, 0, 0]] },
  };

  function eliminationLab(root) {
    const lab = labShell(root, {
      title: "消元：平面绕交线转动，解点不动",
      task: "选一个倍加操作，拖动倍数 c，看第 i 个平面怎样变化。消去某个未知量的那一刻，新平面恰好平行于对应坐标轴。",
    });
    const presetBar = el("div", "ch3l-toolbar");
    lab.append(presetBar);
    const body = el("div", "ch3l-body");
    lab.append(body);
    const stage = el("div", "ch3l-stage");
    const side = el("aside", "ch3l-side");
    body.append(stage, side);

    const scene = S().create(stage, { range: 3.2, label: "三个方程对应的三个平面", yaw: -0.8, pitch: 0.38, spreadLabels: true, labelSafe: true });
    const state = { key: "unique", rows: null, target: 1, source: 0, c: 0, history: [], animating: false };

    const opBox = el("div", "ch3l-card");
    opBox.innerHTML = `<h4>倍加 ${tex("R_i\\leftarrow R_i+cR_j")}</h4>
      <div class="ch3l-op-row"><label>i <select data-t></select></label><label>j <select data-s></select></label></div>
      <label class="ch3l-range"><span>c</span><input type="range" min="-4" max="4" step="0.25" value="0" data-c /><b data-cv>0</b></label>
      <div class="ch3l-actions"><button type="button" class="ch3l-btn" data-suggest>消去一个未知量</button><button type="button" class="ch3l-btn is-primary" data-apply>执行</button></div>
      <div class="ch3l-actions"><button type="button" class="ch3l-btn" data-swap>交换 R₂、R₃</button><button type="button" class="ch3l-btn" data-undo>撤销</button><button type="button" class="ch3l-btn" data-look>沿 x₁ 看</button></div>`;
    const sysBox = el("div", "ch3l-card");
    const resultBox = el("div", "ch3l-result");
    resultBox.hidden = true;
    side.append(opBox, sysBox);

    const gateHost = el("div");
    side.append(gateHost, resultBox);

    const $ = (s) => opBox.querySelector(s);
    const tSel = $("[data-t]");
    const sSel = $("[data-s]");
    [tSel, sSel].forEach((sel) => {
      sel.innerHTML = [0, 1, 2].map((i) => `<option value="${i}">R${"₁₂₃"[i]}</option>`).join("");
    });

    function preview() {
      const rows = state.rows.map((r) => r.slice());
      if (state.target !== state.source && state.c !== 0) {
        rows[state.target] = M().rowAdd(rows, state.target, state.source, F(state.c))[state.target];
      }
      return rows;
    }

    function redraw() {
      const rows = preview();
      scene.setObjects(() => {
        const objs = [];
        rows.forEach((r, i) => {
          if (isZeroRow(r)) return;
          const moving = i === state.target && state.c !== 0 && state.target !== state.source;
          objs.push(planeObj(r, PLANE_COLORS[i], { label: `平面 ${i + 1}`, alpha: moving ? 0.22 : 0.12, width: moving ? 2.2 : 1.2 }));
        });
        // the hinge names the answer to the prediction, so it appears with the verdict
        if (state.target !== state.source && !resultBox.hidden) {
          const hinge = planeLine(state.rows[state.target], state.rows[state.source]);
          if (hinge) objs.push({ type: "line", ...hinge, color: "axis", width: 2.8, dash: [8, 5], label: "铰链" });
        }
        objs.push(...solutionObjects(rows));
        return objs;
      });
      const changed = state.c !== 0 && state.target !== state.source ? [state.target] : [];
      // while c is sliding between nice values, the equations show the nearest twelfth
      // instead of fractions like 437/1000; the planes still move smoothly
      let shown = rows;
      if ((state.animating || !Number.isInteger(state.c * 12)) && state.target !== state.source) {
        shown = state.rows.map((r) => r.slice());
        shown[state.target] = M().rowAdd(shown, state.target, state.source, F(Math.round(state.c * 12) / 12))[state.target];
      }
      sysBox.innerHTML = `<h4>当前方程组${shown === rows ? "" : "（约）"}</h4>${M().htmlEquations(shown, changed)}<p class="ch3l-muted">${describeSolution(shown)}</p>`;
      // “执行” only makes sense when it changes something
      $("[data-apply]").disabled = state.animating || state.c === 0 || state.target === state.source;
      // the slider moves in quarters, so c is exact at rest; mid-animation it is marked ≈
      $("[data-cv]").innerHTML = !state.animating && Number.isInteger(state.c * 12) ? texNum(state.c) : approx(state.c);
      $("[data-undo]").disabled = !state.history.length;
    }

    function load(key) {
      cancelAnimationFrame(anim);
      state.animating = false;
      state.key = key;
      state.rows = ELIM_PRESETS[key].rows.map((r) => r.map(F));
      state.history = [];
      state.c = 0;
      $("[data-c]").value = "0";
      scene.resetView(false);
      redraw();
    }

    buttons(presetBar, Object.entries(ELIM_PRESETS).map(([k, v]) => [k, v.label]), load, "unique");
    tSel.value = "1";
    sSel.value = "0";
    tSel.addEventListener("change", () => {
      state.target = Number(tSel.value);
      redraw();
    });
    sSel.addEventListener("change", () => {
      state.source = Number(sSel.value);
      redraw();
    });
    $("[data-c]").addEventListener("input", (e) => {
      cancelAnimationFrame(anim);
      state.animating = false;
      state.c = Number(e.target.value);
      redraw();
    });

    /* Pick the factor that clears the first nonzero coefficient the source row can clear. */
    function eliminatingFactor() {
      const t = state.rows[state.target];
      const s = state.rows[state.source];
      for (let k = 0; k < 3; k += 1) {
        if (!M().isZero(s[k]) && !M().isZero(t[k])) return { c: M().neg(M().div(t[k], s[k])), k };
      }
      return null;
    }

    let anim = 0;
    $("[data-suggest]").addEventListener("click", () => {
      if (state.target === state.source) return;
      const f = eliminatingFactor();
      if (!f) return;
      const goal = num(f.c);
      const start = state.c;
      const t0 = performance.now();
      cancelAnimationFrame(anim);
      state.animating = true;
      const step = (now) => {
        const t = Math.min(1, (now - t0) / 900);
        state.c = Math.round((start + (goal - start) * (1 - (1 - t) ** 3)) * 1000) / 1000;
        if (t >= 1) {
          state.c = goal; // goal is exactly num(f.c); F() recovers the fraction
          state.animating = false;
        }
        $("[data-c]").value = String(state.c);
        redraw();
        if (t < 1) anim = requestAnimationFrame(step);
        else state.eliminated = f.k;
      };
      anim = requestAnimationFrame(step);
      $("[data-look]").textContent = `沿 x${"₁₂₃"[f.k]} 看`;
      $("[data-look]").dataset.axis = String(f.k);
    });
    $("[data-apply]").addEventListener("click", () => {
      if (state.target === state.source || state.c === 0) return;
      state.history.push(state.rows.map((r) => r.slice()));
      state.rows = M().rowAdd(state.rows, state.target, state.source, F(state.c));
      state.c = 0;
      $("[data-c]").value = "0";
      redraw();
    });
    $("[data-swap]").addEventListener("click", () => {
      state.history.push(state.rows.map((r) => r.slice()));
      state.rows = M().rowSwap(state.rows, 1, 2);
      redraw();
    });
    $("[data-undo]").addEventListener("click", () => {
      if (!state.history.length) return;
      state.rows = state.history.pop();
      state.c = 0;
      $("[data-c]").value = "0";
      redraw();
    });
    $("[data-look]").addEventListener("click", () => {
      const k = Number($("[data-look]").dataset.axis || 0);
      const d = [0, 0, 0];
      d[k] = 1;
      scene.lookAlong(d);
    });

    predictGate(
      gateHost,
      {
        question: `对“交于一点”的方程组做 ${tex("R_2\\leftarrow R_2+cR_1")}。c 连续变化时，平面 2 会怎样运动？`,
        options: [
          { text: "绕平面 1 与平面 2 的交线转动", correct: true },
          { text: "平行移动", why: "倍加同时改变法向和右端，平面不会只平移。" },
          { text: "绕平面 2 与平面 3 的交线转动", why: "平面 3 没有参与这次操作。" },
          { text: "绕 x₁ 轴转动", why: "转轴由参与操作的两个方程决定。" },
        ],
        right: "新方程是两个旧方程的组合，凡满足旧方程 1、2 的点都满足它，所以新平面始终含着这条交线（图中的虚线“铰链”），解点也就一直在上面。",
      },
      () => {
        resultBox.hidden = false;
        redraw();
      },
    );
    resultBox.innerHTML = `<strong>结论</strong><p>倍加得到的新方程是旧方程的组合，逆操作是 ${tex("R_i\\leftarrow R_i-cR_j")}。两个方向都不丢解、不添解，所以解集不变。消去 ${tex("x_k")} 就是把新平面转到与 ${tex("x_k")} 轴平行，此时沿 ${tex("x_k")} 轴看，这个平面只剩一条线。</p>`;

    load("unique");
    return () => {
      cancelAnimationFrame(anim);
      scene.destroy();
    };
  }

  /* ================= §2 n维向量空间：行图景 ↔ 列图景 ================= */

  function vectorSpaceLab(root) {
    const lab = labShell(root, {
      title: "同一个方程组，两幅图同时成立",
      task: "调节 x₁、x₂、x₃。左图是输入空间：点 x 要落在三个平面的公共点上。右图是输出空间：箭头链 x₁a₁+x₂a₂+x₃a₃ 要命中 b。",
    });
    const A = [[1, 2, 3], [2, 5, 2], [6, -3, 1]].map((r) => r.map(F));
    const targets = { b1: { label: "b=(6,4,2)", b: [6, 4, 2] }, b2: { label: "b=(4,4,7)", b: [4, 4, 7] } };
    const cols = [0, 1, 2].map((j) => A.map((r) => r[j]));
    const state = { x: [0, 0, 0], key: "b1" };

    const toolbar = el("div", "ch3l-toolbar");
    lab.append(toolbar);
    const pair = el("div", "ch3l-pair");
    const left = el("div", "ch3l-view");
    const right = el("div", "ch3l-view");
    left.innerHTML = `<div class="ch3l-view-title">行图景 · 输入空间 ${tex("\\mathbb R^3")}</div>`;
    right.innerHTML = `<div class="ch3l-view-title">列图景 · 输出空间 ${tex("\\mathbb R^3")}</div>`;
    pair.append(left, right);
    lab.append(pair);
    const rowScene = S().create(left, { range: 3, label: "三个平面与点 x", hint: "拖动旋转", spreadLabels: true, labelSafe: true });
    const colScene = S().create(right, { range: 7, label: "列向量的组合与目标 b", hint: "拖动旋转", axisNames: ["b₁", "b₂", "b₃"] });

    const controls = el("div", "ch3l-controls");
    controls.innerHTML = [0, 1, 2]
      .map((i) => `<label class="ch3l-range"><span>${tex(`x_${i + 1}`)}</span><input type="range" min="-3" max="3" step="0.5" value="0" data-x="${i}" /><b data-xv="${i}">0</b></label>`)
      .join("");
    const status = el("div", "ch3l-status");
    lab.append(controls, status);
    const gateHost = el("div");
    lab.append(gateHost);

    function b() {
      return targets[state.key].b.map(F);
    }

    function redraw() {
      const x = state.x.map(F);
      const Ax = M().matVec(A, x);
      const bb = b();
      const hit = Ax.every((v, i) => M().eq(v, bb[i]));
      const aug = A.map((r, i) => [...r, bb[i]]);
      /*
       * Perpendiculars from x to each plane: (Ax−b)ᵢ = 0 exactly when x lies on
       * plane i; that plane then glows and its readout chip turns green.
       */
      const resid = Ax.map((v, i) => M().sub(v, bb[i]));
      rowScene.setObjects(() => {
        const objs = aug.map((r, i) => planeObj(r, PLANE_COLORS[i], { alpha: 0.12, glow: M().isZero(resid[i]) ? 1 : 0 }));
        aug.forEach((r, i) => {
          if (M().isZero(resid[i])) return;
          const n = vecNum(r.slice(0, 3));
          const t = num(resid[i]) / S().vec.dot(n, n);
          const foot = S().vec.sub(state.x, S().vec.mul(n, t));
          // drop lines thick enough to read against the planes
          objs.push({ type: "segment", a: state.x, b: foot, color: PLANE_COLORS[i], width: 2.6, dash: [5, 4] });
          objs.push({ type: "point", p: foot, color: PLANE_COLORS[i], r: 4.5 });
        });
        objs.push({ type: "point", p: state.x, color: "drag", r: hit ? 7 : 5.5, label: "x" });
        return objs;
      });
      colScene.setObjects(() => {
        const objs = [];
        let tail = [0, 0, 0];
        cols.forEach((c, j) => {
          const step = vecNum(c).map((v) => v * state.x[j]);
          const head = S().vec.add(tail, step);
          objs.push({ type: "arrow", from: [0, 0, 0], to: vecNum(c), color: PLANE_COLORS[j], width: 1.4, alpha: 0.45, label: `a${"₁₂₃"[j]}` });
          if (state.x[j] !== 0) objs.push({ type: "arrow", from: tail, to: head, color: PLANE_COLORS[j], width: 3 });
          tail = head;
        });
        objs.push({ type: "point", p: vecNum(bb), color: "image", r: 7, hollow: !hit, label: "b" });
        if (!hit) objs.push({ type: "segment", a: tail, b: vecNum(bb), color: "axis", dash: [4, 5] });
        return objs;
      });
      controls.querySelectorAll("[data-xv]").forEach((n) => (n.innerHTML = texNum(state.x[Number(n.dataset.xv)])));
      // distance from x to plane i is |(Ax−b)ᵢ| / |nᵢ|, with |nᵢ|² an integer
      const NORM2 = aug.map((r) => r.slice(0, 3).reduce((s, a) => s + num(a) * num(a), 0));
      const dists = resid
        .map((r, i) => {
          const on = M().isZero(r);
          const d = distTex(r, NORM2[i]);
          return `<span class="ch3l-dist${on ? " is-on" : ""}" data-plane="${i + 1}">${on ? "✓ " : ""}到平面 ${i + 1}：${tex(d)}</span>`;
        })
        .join("");
      status.innerHTML = `<div class="ch3l-dists">${dists}</div>${
        hit
          ? `<span class="ch3l-ok">命中</span> ${tex(`x=(${x.map(fmt).join(",")})`)}：点 x 落在三个平面的公共点上，同时箭头链的终点就是 b。`
          : `${tex(`Ax=(${Ax.map(fmt).join(",")})`)}，目标 ${tex(`b=(${bb.map(fmt).join(",")})`)}。`
      }`;
    }

    buttons(toolbar, Object.entries(targets).map(([k, v]) => [k, v.label]), (k) => {
      state.key = k;
      redraw();
    }, "b1");
    controls.querySelectorAll("[data-x]").forEach((input) =>
      input.addEventListener("input", () => {
        state.x[Number(input.dataset.x)] = Number(input.value);
        redraw();
      }),
    );
    predictGate(gateHost, {
      question: `A 的三列是 ${tex("a_1=(1,2,6),\\ a_2=(2,5,-3),\\ a_3=(3,2,1)")}。不做消元，${tex("b=(6,4,2)")} 该取怎样的 x？`,
      options: [
        { text: tex("x=(0,0,2)"), correct: true },
        { text: tex("x=(6,4,2)"), why: "x 是列的权重，不是 b 的坐标。" },
        { text: tex("x=(2,0,0)"), why: "2a₁=(2,4,12)，只有第二个分量与 b 相同。" },
        { text: "必须先消元才能知道", why: "观察一下 b 和 a₃ 的关系。" },
      ],
      right: "b=2a₃。把 x₃ 调到 2 验证：左图的点同时落到三个平面上。",
    });

    redraw();
    return () => {
      rowScene.destroy();
      colScene.destroy();
    };
  }

  /* ================= §3 线性相关性：张成增长与体积塌缩 ================= */

  function dependenceLab(root) {
    const lab = labShell(root, {
      title: "第三个向量有没有带来新方向",
      task: "v₁、v₂ 张成一个过原点的平面。拖动 v₃（每次移动半格），看平行六面体的体积：体积为 0 的那一刻，v₃ 落进了平面，三个向量线性相关。",
    });
    const state = { v: [[1, 0, 1], [0, 1, 1], [1, 1, 0]], stage: 3, showDrop: false };
    const toolbar = el("div", "ch3l-toolbar");
    lab.append(toolbar);
    const body = el("div", "ch3l-body");
    const stage = el("div", "ch3l-stage");
    const side = el("aside", "ch3l-side");
    body.append(stage, side);
    lab.append(body);
    const scene = S().create(stage, { range: 2.5, label: "三个向量与它们张成的空间", yaw: 0.4, pitch: 0.35, spreadLabels: true, labelSafe: true });
    const info = el("div", "ch3l-card");
    const tools = el("div", "ch3l-actions");
    tools.innerHTML = `<button type="button" class="ch3l-btn" data-snap>把 v₃ 放进平面</button><button type="button" class="ch3l-btn" data-look>沿平面看</button><button type="button" class="ch3l-btn" data-reset>回到默认视角</button>`;
    const gateHost = el("div");
    const result = el("div", "ch3l-result");
    result.hidden = true;
    side.append(info, tools, gateHost, result);

    const colors = ["v1", "v2", "drag"];

    function redraw() {
      const vs = state.v.slice(0, state.stage);
      const cross = S().vec.cross(state.v[0], state.v[1]);
      const planeOk = state.stage >= 2 && S().vec.len(cross) > 1e-9;
      scene.setObjects(() => {
        const objs = [];
        if (state.stage === 1) objs.push({ type: "line", dir: state.v[0], color: "subspace", width: 1.6, alpha: 0.6, label: "span{v₁}" });
        if (planeOk) objs.push({ type: "plane", n: cross, d: 0, color: "subspace", alpha: 0.12, label: "span{v₁,v₂}" });
        if (state.stage === 3) {
          objs.push({ type: "box", vectors: state.v, color: "image", alpha: 0.07 });
          if (state.showDrop && planeOk && Math.abs(cross[2]) > 1e-9) {
            // Where the vertical line through v3 meets the plane: no inner product needed.
            const [x, y] = state.v[2];
            const z = -(cross[0] * x + cross[1] * y) / cross[2];
            objs.push({ type: "segment", a: state.v[2], b: [x, y, z], color: "axis", dash: [4, 4], width: 1.4 });
          }
        }
        vs.forEach((v, i) => objs.push({ type: "arrow", to: v, color: colors[i], label: `v${"₁₂₃"[i]}` }));
        return objs;
      });
      scene.setHandles(
        state.v.slice(0, state.stage).map((_, i) => ({
          color: "drag",
          snap: 0.5,
          get: () => state.v[i],
          set: (p) => {
            state.v[i] = p;
            redraw();
          },
        })),
      );
      const matrix = [0, 1, 2].map((r) => state.v.slice(0, state.stage).map((v) => F(v[r])));
      const rank = M().rankOf(matrix);
      let html = `<h4>当前读数</h4><p>秩 ${tex(`r=${rank}`)}，向量个数 ${state.stage}</p>`;
      if (state.stage === 3) {
        const det = M().determinant(matrix);
        html += `<p>有向体积 ${tex(`\\det[v_1\\ v_2\\ v_3]=${fmt(det)}`)}</p>`;
        const cert = M().relationCertificate(state.v.map(vecF));
        html += cert.dependent
          ? `<p class="ch3l-bad">线性相关：${tex(M().latexRelation(cert.coeffs))}</p>`
          : `<p class="ch3l-ok">线性无关：只有零组合等于 0</p>`;
      }
      info.innerHTML = html;
    }

    buttons(
      toolbar,
      [["1", "只有 v₁"], ["2", "加入 v₂"], ["3", "加入 v₃"]],
      (k) => {
        state.stage = Number(k);
        redraw();
      },
      "3",
    );
    tools.querySelector("[data-snap]").addEventListener("click", () => {
      // Keep x, y of v3 and drop it vertically onto span{v1, v2}.
      const c = S().vec.cross(state.v[0], state.v[1]);
      if (Math.abs(c[2]) < 1e-9) return;
      const [x, y] = state.v[2];
      state.v[2] = [x, y, -(c[0] * x + c[1] * y) / c[2]];
      state.showDrop = true;
      redraw();
      // turn straight to the edge-on view: the plane becomes a line and v₃ lies on it
      scene.lookAlong(state.v[0]);
    });
    tools.querySelector("[data-look]").addEventListener("click", () => scene.lookAlong(state.v[0]));
    tools.querySelector("[data-reset]").addEventListener("click", () => scene.resetView());

    predictGate(
      gateHost,
      {
        question: `把 ${tex("v_3")} 从 ${tex("(1,1,0)")} 拖到 ${tex("(1,1,2)")}，体积会变成多少？`,
        options: [
          { text: "0", correct: true },
          { text: "2", why: "看看 (1,1,2) 与 v₁+v₂ 的关系。" },
          { text: "−2", why: "(1,1,0) 时体积是 −2；换到 (1,1,2) 以后呢？" },
          { text: "取决于视角", why: "体积由三个向量决定，与观察方向无关。" },
        ],
        right: "(1,1,2)=v₁+v₂ 落在平面里，六面体被压扁。点“沿平面看”，三个向量排成一条线。",
      },
      () => {
        result.hidden = false;
        state.showDrop = true;
        redraw();
      },
    );
    result.innerHTML = `<strong>结论</strong><p>v₃ 带来新方向，当且仅当它不在 ${tex("\\operatorname{span}\\{v_1,v_2\\}")} 里。不在平面里，体积非零，三个向量无关；落进平面，体积为 0，并且可以写出一个非平凡关系。体积很小但不为 0，仍然是无关。</p>`;

    redraw();
    return () => scene.destroy();
  }

  /* ================= §4 矩阵的秩：行空间与列空间 ================= */

  const RANK_PRESETS = {
    r2: { label: "秩 2", A: [[1, 2, 3], [2, 4, 6], [0, 1, 1]], ops: [[1, 0, -2], [0, 2, -2], "swap12"] },
    r1: { label: "秩 1", A: [[1, 2, 1], [2, 4, 2], [-1, -2, -1]], ops: [[1, 0, -2], [2, 0, 1]] },
    r3: { label: "秩 3", A: [[1, 0, 1], [0, 1, 1], [1, 1, 0]], ops: [[2, 0, -1], [2, 1, -1]] },
  };

  function spanObjects(vectors, color) {
    const vs = vectors.map(vecNum).filter((v) => S().vec.len(v) > 1e-9);
    const r = M().rankOf([0, 1, 2].map((i) => vectors.map((v) => v[i])));
    if (r === 1) return [{ type: "line", dir: vs[0], color, width: 1.8, alpha: 0.7 }];
    if (r === 2) {
      let n = [0, 0, 0];
      for (let i = 0; i < vs.length && S().vec.len(n) < 1e-9; i += 1)
        for (let j = i + 1; j < vs.length && S().vec.len(n) < 1e-9; j += 1) n = S().vec.cross(vs[i], vs[j]);
      return [{ type: "plane", n, d: 0, color, alpha: 0.13 }];
    }
    return [];
  }

  function spanName(r) {
    return ["原点", "一条直线", "一个平面", "整个空间"][r];
  }

  /*
   * Linear relations among the columns, read once from the preset and solved for
   * the free column: c₃ = c₁ + c₂ for the rank-2 preset. Row operations multiply
   * every column by the same invertible P, so each relation survives every step.
   */
  function columnRelations(A) {
    const SUB = "₁₂₃";
    return M()
      .nullspaceBasis(A)
      .basis.map((v) => {
        const free = v.findIndex((x, i) => !M().isZero(x) && v.slice(i + 1).every((y) => M().isZero(y)));
        const terms = v
          .map((x, i) => ({ i, c: M().neg(x) }))
          .filter(({ i, c }) => i !== free && !M().isZero(c));
        const text = terms
          .map(({ i, c }, k) => {
            const abs = M().absF(c);
            const coef = M().eq(abs, F(1)) ? "" : M().formatF(abs);
            return `${c.n < 0 ? "−" : k ? "+" : ""}${coef}c${SUB[i]}`;
          })
          .join("");
        return { free, terms, text: `c${SUB[free]}=${text || "0"}` };
      });
  }

  function relationHolds(A, rel) {
    const col = (j) => A.map((r) => r[j]);
    const rhs = rel.terms.reduce((acc, { i, c }) => acc.map((x, k) => M().add(x, M().mul(c, col(i)[k]))), [F(0), F(0), F(0)]);
    return rhs.every((x, k) => M().eq(x, col(rel.free)[k]));
  }

  /* Arrows for a list of vectors; identical vectors share one merged label (c₁=c₃). */
  function labelledArrows(vectors, letter, colors) {
    const SUB = "₁₂₃";
    const same = (u, v) => u.every((x, k) => M().eq(x, v[k]));
    return vectors.map((v, i) => {
      const first = vectors.findIndex((u) => same(u, v));
      const twins = vectors.map((u, j) => (same(u, v) ? j : -1)).filter((j) => j >= 0);
      const label = first === i ? twins.map((j) => `${letter}${SUB[j]}`).join("=") : "";
      return { type: "arrow", to: vecNum(v), color: colors[i], label, width: first === i ? 2.8 : 2 };
    });
  }

  /* Zoom so the longest vector fills the view without leaving it (a larger k zooms in further). */
  function fitRange(vectors, k = 1.3, min = 1.6) {
    const longest = Math.max(...vectors.map((v) => S().vec.len(vecNum(v))), 1);
    return Math.max(min, Math.min(5, longest / k));
  }

  function rankLab(root) {
    const lab = labShell(root, {
      title: "行变换：行空间不动，列空间在动，维数都不变",
      task: "左图是三个行向量在输入空间里张成的行空间，右图是三个列向量在输出空间里张成的列空间。逐步做行变换化到阶梯形：虚线平面是上一步的位置，虚线平行四边形检验列之间的关系。",
    });
    const state = { key: "r2", A: null, prev: null, step: 0, relations: [] };
    const toolbar = el("div", "ch3l-toolbar");
    lab.append(toolbar);
    const pair = el("div", "ch3l-pair");
    const left = el("div", "ch3l-view");
    const right = el("div", "ch3l-view");
    left.innerHTML = `<div class="ch3l-view-title">行空间（输入空间）</div>`;
    right.innerHTML = `<div class="ch3l-view-title">列空间（输出空间）</div>`;
    pair.append(left, right);
    lab.append(pair);
    const rowScene = S().create(left, { range: 4, hint: "拖动旋转", label: "行向量与行空间", yaw: 0.4, pitch: 0.35, spreadLabels: true });
    const colScene = S().create(right, { range: 4, hint: "拖动旋转", label: "列向量与列空间", yaw: -0.55, pitch: 0.7, axisNames: ["y₁", "y₂", "y₃"], spreadLabels: true });
    const strip = el("div", "ch3l-strip");
    lab.append(strip);
    const gateHost = el("div");
    lab.append(gateHost);

    function ops() {
      return RANK_PRESETS[state.key].ops;
    }

    const rowsOf = (A) => A.map((r) => r);
    const colsOf = (A) => [0, 1, 2].map((j) => A.map((r) => r[j]));

    /* Dashed parallelogram: c_i and c_j (scaled) close exactly on the dependent column. */
    function relationObjects(A) {
      const cols = colsOf(A);
      const objs = [];
      state.relations.forEach((rel) => {
        if (rel.terms.length !== 2) return;
        const [p, q] = rel.terms.map(({ i, c }) => cols[i].map((x) => num(M().mul(c, x))));
        const tip = S().vec.add(p, q);
        const [ci, cj] = rel.terms.map(({ i }) => PLANE_COLORS[i]);
        objs.push(
          // filled: c₁ and c₂ span it, and its far corner lands on the dependent column
          { type: "polygon", pts: [[0, 0, 0], p, tip, q], color: "image", alpha: 0.16, strokeAlpha: 0 },
          { type: "segment", a: p, b: tip, color: cj, width: 1.2, dash: [2, 3] },
          { type: "segment", a: q, b: tip, color: ci, width: 1.2, dash: [2, 3] },
        );
        if (relationHolds(A, rel)) objs.push({ type: "point", p: tip, color: PLANE_COLORS[rel.free], r: 4.5 });
      });
      return objs;
    }

    function redraw() {
      const A = state.A;
      const rows = rowsOf(A);
      const cols = colsOf(A);
      const r = M().rankOf(A);
      const prev = state.prev;
      rowScene.setObjects(() => [
        ...(prev ? spanObjects(rowsOf(prev), "subspace").map((o) => ({ ...o, ghost: true })) : []),
        ...spanObjects(rows, "subspace"),
        ...labelledArrows(rows, "r", PLANE_COLORS),
      ]);
      colScene.setObjects(() => [
        ...(prev ? spanObjects(colsOf(prev), "subspace").map((o) => ({ ...o, ghost: true })) : []),
        ...spanObjects(cols, "subspace"),
        ...relationObjects(A),
        ...labelledArrows(cols, "c", PLANE_COLORS),
      ]);
      rowScene.setRange(fitRange(rows));
      // the column space is zoomed in further: its vectors are short next to the rows
      colScene.setRange(fitRange(cols, 2, 1.4));
      const list = ops();
      const next = list[state.step];
      const label = next === "swap12" ? "R_2\\leftrightarrow R_3" : next ? `R_${next[0] + 1}\\leftarrow R_${next[0] + 1}${num(F(next[2])) < 0 ? "-" : "+"}${Math.abs(next[2]) === 1 ? "" : Math.abs(next[2])}R_${next[1] + 1}` : "";
      const relText = state.relations.length
        ? state.relations.map((rel) => `${rel.text}${state.step ? (relationHolds(A, rel) ? " ✓" : " ×") : ""}`).join("，")
        : "三列线性无关";
      strip.innerHTML = `<div class="ch3l-matrix">${texD(`A=${M().latexMatrix(A)}`)}</div>
        <div class="ch3l-strip-info"><p>行空间：${spanName(r)}　列空间：${spanName(r)}</p><p>${tex(`\\dim\\text{行空间}=\\dim\\text{列空间}=${r}`)}</p>
        <p>列的关系：${relText}${state.step ? `（第 ${state.step} 步后）` : ""}</p>
        <div class="ch3l-actions">${next ? `<button type="button" class="ch3l-btn is-primary" data-next>下一步 ${tex(label)}</button>` : `<span class="ch3l-ok">已化到阶梯形</span>`}<button type="button" class="ch3l-btn" data-restart>重来</button></div></div>`;
      strip.querySelector("[data-next]")?.addEventListener("click", () => {
        const op = list[state.step];
        state.prev = state.A;
        state.A = op === "swap12" ? M().rowSwap(state.A, 1, 2) : M().rowAdd(state.A, op[0], op[1], F(op[2]));
        state.step += 1;
        redraw();
      });
      strip.querySelector("[data-restart]").addEventListener("click", () => load(state.key));
    }

    function load(key) {
      state.key = key;
      state.A = RANK_PRESETS[key].A.map((r) => r.map(F));
      state.prev = null;
      state.step = 0;
      state.relations = columnRelations(state.A);
      redraw();
    }

    buttons(toolbar, Object.entries(RANK_PRESETS).map(([k, v]) => [k, v.label]), load, "r2");
    predictGate(gateHost, {
      question: `对秩 2 的 A 做第一步 ${tex("R_2\\leftarrow R_2-2R_1")}。右图的列空间平面和关系 ${tex("c_3=c_1+c_2")} 会怎样？`,
      options: [
        { text: "平面换了位置，c₃=c₁+c₂ 仍成立", correct: true },
        { text: "平面不动，c₃=c₁+c₂ 仍成立", why: "看右图：新平面离开了虚线留下的旧平面。" },
        { text: "平面换了位置，c₃=c₁+c₂ 不再成立", why: "看虚线平行四边形：c₁+c₂ 的顶点仍落在 c₃ 的箭头尖上。" },
        { text: "平面不动，关系也不再成立", why: "两处都和图不符：平面动了，平行四边形仍闭合。" },
      ],
      right: "行变换把每一列都左乘同一个可逆矩阵 P，Pc₃=Pc₁+Pc₂，所以列之间的线性关系每一步都成立。列空间换了位置，维数却不变；左图的行空间始终是同一个平面（虚线与实线重合）。",
    });
    load("r2");
    return () => {
      rowScene.destroy();
      colScene.destroy();
    };
  }

  /* ================= §5 有解判别：b 离开列空间 ================= */

  function solvabilityLab(root) {
    const lab = labShell(root, {
      title: "把 b 拖离列空间，三个平面失去公共线",
      task: "A 的第三列等于前两列之和，列空间是平面 b₃=b₁+b₂。拖动 b：它在平面上时方程组有解，一离开就无解。虚线竖段是偏离量 b₃−b₁−b₂。右图同步显示三个方程对应的平面。",
    });
    // rows (1,0,1), (0,1,1), (1,1,2): the end-on triangle has sides √6/3, √6/3, √2 (no sliver)
    const A = [[1, 0, 1], [0, 1, 1], [1, 1, 2]].map((r) => r.map(F));
    // every pair of the three planes meets along this direction (n₁×n₂ = (−1,−1,1))
    const LINE_DIR = [-1, -1, 1];
    const state = { b: [1, 2, 3], picked: false, revealed: false, endOn: false };
    let endOnCorners = [];
    const pair = el("div", "ch3l-pair");
    const left = el("div", "ch3l-view");
    const right = el("div", "ch3l-view");
    left.innerHTML = `<div class="ch3l-view-title">列空间与目标 b（输出空间）</div>`;
    right.innerHTML = `<div class="ch3l-view-title">三个方程的平面（输入空间）</div>`;
    pair.append(left, right);
    lab.append(pair);
    const colScene = S().create(left, { range: 5, label: "列空间平面与可拖动的 b", hint: "拖动 b 或旋转", yaw: 0.4, pitch: 0.35, axisNames: ["b₁", "b₂", "b₃"], spreadLabels: true, labelSafe: true });
    const rowScene = S().create(right, { range: 3.5, label: "三个平面", hint: "拖动旋转", yaw: 0.35, pitch: 0.3, clampLabels: true });
    rowScene.on("camera", () => {
      // any orbit away from the end-on view gives the button back its first meaning
      const d = S().vec.norm(LINE_DIR);
      const cp = Math.cos(rowScene.camera.pitch);
      const view = [cp * Math.cos(rowScene.camera.yaw), cp * Math.sin(rowScene.camera.yaw), Math.sin(rowScene.camera.pitch)];
      state.endOn = Math.abs(S().vec.dot(view, d)) > 0.999;
      lookBtn.textContent = state.endOn ? "转回斜视" : "沿交线方向看";
      redraw();
    });
    const status = el("div", "ch3l-status");
    const tools = el("div", "ch3l-actions");
    tools.innerHTML = `<button type="button" class="ch3l-btn" data-on>b=(1,2,3)</button><button type="button" class="ch3l-btn" data-off>b=(1,2,4)</button><button type="button" class="ch3l-btn" data-look>沿列空间平面看</button><button type="button" class="ch3l-btn" data-along disabled>沿交线方向看</button>`;
    lab.append(tools, status);
    const lookBtn = tools.querySelector("[data-along]");
    const gateHost = el("div");
    lab.append(gateHost);

    function redraw() {
      const b = state.b.map(F);
      const aug = A.map((r, i) => [...r, b[i]]);
      const info = M().analyzeAugmented(aug);
      const h = M().sub(M().sub(b[2], b[0]), b[1]);
      const onPlane = M().isZero(h);
      const cols = [0, 1, 2].map((j) => A.map((r) => r[j]));
      const foot = [state.b[0], state.b[1], state.b[0] + state.b[1]];
      colScene.setObjects(() => [
        { type: "plane", n: [1, 1, -1], d: 0, color: "subspace", alpha: 0.12, label: "Col(A)" },
        ...cols.map((c, i) => ({ type: "arrow", to: vecNum(c), color: PLANE_COLORS[i], width: 1.6, alpha: 0.6, label: `a${"₁₂₃"[i]}` })),
        ...(onPlane
          ? []
          : [
              { type: "segment", a: state.b, b: foot, color: "axis", dash: [5, 4], width: 1.8, label: `b₃−b₁−b₂=${M().formatF(h).replace("-", "−")}` },
              { type: "point", p: foot, color: "subspace", r: 3.5 },
            ]),
        { type: "arrow", to: state.b, color: "drag", width: 3, label: "b" },
      ]);
      colScene.setHandles([
        {
          color: "drag",
          snap: 0.5,
          get: () => state.b,
          set: (p) => {
            state.b = p;
            redraw();
          },
        },
      ]);
      rowScene.setObjects(() => {
        const objs = aug.map((r, i) => planeObj(r, PLANE_COLORS[i], { alpha: 0.12, width: state.endOn ? 2.4 : 1.2 }));
        if (onPlane) objs.push(...solutionObjects(aug));
        else if (state.revealed) {
          const corners = [];
          [[0, 1], [1, 2], [0, 2]].forEach(([i, j]) => {
            const l = planeLine(aug[i], aug[j]);
            if (l) objs.push({ type: "line", ...l, color: "axis", width: 1.6, dash: [6, 5] });
            // where this pairwise line pierces the plane through 0 normal to it: a corner of the end-on triangle
            const hit = M().particularSolution([aug[i], aug[j], [...LINE_DIR.map(F), F(0)]]);
            if (hit.ok) corners.push(vecNum(hit.x));
          });
          if (state.endOn && corners.length === 3) {
            objs.push({ type: "polygon", pts: corners, color: "axis", alpha: 0.2, strokeAlpha: 0.5 });
            corners.forEach((p) => objs.push({ type: "point", p, color: "axis", r: 3.5 }));
          }
          endOnCorners = corners;
        }
        return objs;
      });
      // end-on and off the plane: centre and magnify the view on the triangle
      if (state.endOn && !onPlane && state.revealed && endOnCorners.length === 3) rowScene.fitView(endOnCorners, { pad: 1.9 });
      else rowScene.resetFit();
      const picture = !state.revealed
        ? ""
        : onPlane
          ? "三个平面交于一条直线。"
          : "三个平面两两相交成三条平行线，沿交线方向看是一个三角形，没有公共点。";
      status.innerHTML = `${tex(`b=(${b.map(fmt).join(",")})`)}，偏离量 ${tex(`b_3-b_1-b_2=${fmt(h)}`)}。
        ${tex(`\\operatorname{rank}A=${info.rankA}`)}，${tex(`\\operatorname{rank}[A\\mid b]=${info.rankAug}`)}：
        ${onPlane ? `<span class="ch3l-ok">有解</span>` : `<span class="ch3l-bad">无解</span>`}${picture ? `，${picture}` : "。"}`;
    }

    tools.querySelector("[data-on]").addEventListener("click", () => {
      state.b = [1, 2, 3];
      redraw();
    });
    tools.querySelector("[data-off]").addEventListener("click", () => {
      state.b = [1, 2, 4];
      redraw();
    });
    tools.querySelector("[data-look]").addEventListener("click", () => colScene.lookAlong([1, 0, 1]));
    lookBtn.addEventListener("click", () => {
      if (state.endOn) rowScene.resetView();
      else rowScene.lookAlong(LINE_DIR);
    });
    predictGate(gateHost, {
      question: `把 ${tex("b")} 从 ${tex("(1,2,3)")} 拉到 ${tex("(1,2,4)")}，右边三个平面会变成什么样？`,
      options: [
        { text: "两两相交，三条交线互相平行", correct: true },
        { text: "仍然交于一条直线", why: "看右图，公共线断开了。" },
        { text: "出现两个平行平面", why: "三个法向两两不平行，任意两个平面都相交。" },
        { text: "交于一个点", why: "rank A=2，任何 b 都不会给出唯一解。" },
      ],
      right: "没有两个平面平行，却没有公共点：沿交线方向看，三个平面围成一个三角形（三棱柱）。此时化简后最后一行是 [0 0 0 | b₃−b₁−b₂]，偏离量不为 0，增广矩阵的秩比 A 的秩多 1。",
      onPick: () => {
        state.picked = true;
        lookBtn.disabled = false;
      },
    }, () => {
      state.revealed = true;
      redraw();
    });
    redraw();
    return () => {
      colScene.destroy();
      rowScene.destroy();
    };
  }

  /* ================= §6 解的结构：特解 + 零空间 ================= */

  function structureLab(root) {
    const presets = {
      line: {
        label: "两个方程",
        A: [[1, 1, 1], [1, 2, -1]],
        b: [3, 4],
        task: "实线平面是两个方程，它们的交线是全部解；虚线平面是对应的齐次方程，交线是零空间。改变 b，或者沿解线移动 t，比较两条直线。蓝色箭头是一个特解 x₀，金色点 x 是解线上的任意一个解。",
        predict: {
          question: `改变 ${tex("b_1")} 或 ${tex("b_2")}，金色的解线会怎样？`,
          options: [
            { text: "只平移，方向不变", correct: true },
            { text: "绕特解转动", why: "方向由齐次方程 Ax=0 决定，与 b 无关。" },
            { text: "变成一个平面", why: "解集的维数是 n−rank A，与 b 无关。" },
            { text: "穿过原点", why: "b≠0 时 A·0=0≠b，原点不是解。" },
          ],
          right: "两个平面各自平移，交线也跟着平移，但始终与零空间平行。全部解 = 一个特解 + 零空间。",
        },
      },
      plane: {
        label: "一个方程",
        A: [[1, 1, 1]],
        b: [2],
        task: "只有一个方程 x₁+x₂+x₃=b₁：全部解是一个平面，零空间是过原点的平行平面，由两个基础解向量张成。用 s、t 在解平面上移动点 x；蓝色箭头是一个特解 x₀。",
        predict: {
          question: `这个方程有 3 个未知量、秩为 1。基础解系含几个向量？`,
          options: [
            { text: "2 个", correct: true },
            { text: "1 个", why: "自由未知量的个数是 n−r=3−1。" },
            { text: "3 个", why: "秩为 1，主元未知量占掉一个。" },
            { text: "0 个", why: "方程个数少于未知量个数，一定有自由未知量。" },
          ],
          right: "n−r=2：零空间是一个平面，解集是把这个平面平移到特解处。",
        },
      },
    };
    const lab = labShell(root, { title: "解集是零空间平移过去的样子", task: presets.line.task });
    // ghostB: b before the last change, so the old solution set stays on the picture
    const state = { key: "line", b: [3, 4], t: 0, s: 0, ghostB: null, lastInput: 0 };
    const toolbar = el("div", "ch3l-toolbar");
    lab.append(toolbar);
    const body = el("div", "ch3l-body");
    const stage = el("div", "ch3l-stage");
    const side = el("aside", "ch3l-side");
    body.append(stage, side);
    lab.append(body);
    const scene = S().create(stage, { range: 3.6, label: "解集与零空间", yaw: -0.7, pitch: 0.4, spreadLabels: true, labelSafe: true });
    const controls = el("div", "ch3l-card");
    const info = el("div", "ch3l-card");
    const gateHost = el("div");
    side.append(controls, info, gateHost);

    function redraw() {
      const P = presets[state.key];
      const A = P.A.map((r) => r.map(F));
      const b = state.b.map(F);
      const aug = A.map((r, i) => [...r, b[i]]);
      const hom = A.map((r) => [...r, F(0)]);
      const part = M().particularSolution(aug);
      const ns = M().nullspaceBasis(A).basis.map(vecNum);
      const xp = vecNum(part.x);
      const params = [state.t, state.s];
      const x = ns.reduce((acc, v, i) => S().vec.add(acc, S().vec.mul(v, params[i] || 0)), xp);
      scene.setObjects(() => {
        const objs = [];
        aug.forEach((r, i) => objs.push(planeObj(r, ns.length === 2 ? "drag" : PLANE_COLORS[i], { alpha: ns.length === 2 ? 0.2 : 0.1, label: ns.length === 2 ? "解集" : undefined })));
        hom.forEach((r, i) => objs.push(planeObj(r, ns.length === 2 ? "subspace" : PLANE_COLORS[i], { alpha: 0.03, dash: [5, 5], strokeAlpha: 0.45, label: ns.length === 2 ? "零空间" : undefined })));
        // the solution set before the last change of b: same colour, dashed and faint
        const gb = state.ghostB && state.ghostB.some((v, i) => v !== state.b[i]) ? state.ghostB : null;
        const gp = gb ? M().particularSolution(A.map((r, i) => [...r, F(gb[i])])) : null;
        if (gp?.ok) {
          const g = vecNum(gp.x);
          if (ns.length === 1) objs.push({ type: "line", p: g, dir: ns[0], color: "drag", width: 3, ghost: true, alpha: 0.5, label: "原来的解集" });
          if (ns.length === 2) {
            const n = S().vec.cross(ns[0], ns[1]);
            objs.push({ type: "plane", n, d: S().vec.dot(n, g), color: "drag", ghost: true, alpha: 0.05, label: "原来的解集" });
          }
        }
        if (ns.length === 1) {
          objs.push({ type: "line", dir: ns[0], color: "subspace", width: 2, dash: [7, 5], label: "零空间" });
          objs.push({ type: "line", p: xp, dir: ns[0], color: "drag", width: 3.4, label: "解集" });
        }
        // the blue arrow is the particular solution (named in the task text); an on-canvas
        // label would sit on the gold x, which starts at the arrow tip
        objs.push({ type: "arrow", to: xp, color: "v1", width: 2.4 });
        if (S().vec.len(S().vec.sub(x, xp)) > 1e-9) objs.push({ type: "arrow", from: xp, to: x, color: "subspace", width: 2.4 });
        objs.push({ type: "point", p: x, color: "drag", r: 6, label: "x" });
        return objs;
      });
      const Ax = M().matVec(A, x.map(F));
      info.innerHTML = `<h4>读数</h4>
        <p>${tex(`x_0=(${part.x.map(fmt).join(",")})`)}</p>
        <p>基础解系 ${M().nullspaceBasis(A).basis.map((v) => tex(`(${v.map(fmt).join(",")})`)).join("、")}</p>
        <p>${tex(`Ax=(${Ax.map(fmt).join(",")})=b`)}：在解集上移动，Ax 始终等于 b。</p>`;
    }

    function renderControls() {
      const P = presets[state.key];
      const ranges = P.b.map((_, i) => `<label class="ch3l-range"><span>${tex(`b_${i + 1}`)}</span><input type="range" min="-3" max="5" step="0.5" value="${state.b[i]}" data-b="${i}" /><b data-bv="${i}">${texNum(state.b[i])}</b></label>`);
      ranges.push(`<label class="ch3l-range"><span>${tex("t")}</span><input type="range" min="-1.5" max="1.5" step="0.25" value="${state.t}" data-p="t" /><b data-pv="t">${texNum(state.t)}</b></label>`);
      if (state.key === "plane") ranges.push(`<label class="ch3l-range"><span>${tex("s")}</span><input type="range" min="-1.5" max="1.5" step="0.25" value="${state.s}" data-p="s" /><b data-pv="s">${texNum(state.s)}</b></label>`);
      controls.innerHTML = `<h4>调节</h4>${ranges.join("")}`;
      controls.querySelectorAll("[data-b]").forEach((input) => {
        // a new burst of changes (a drag, or key presses close together) keeps the
        // solution set it started from as the ghost
        input.addEventListener("input", () => {
          const now = performance.now();
          if (now - state.lastInput > 900) state.ghostB = state.b.slice();
          state.lastInput = now;
          state.b[Number(input.dataset.b)] = Number(input.value);
          controls.querySelector(`[data-bv="${input.dataset.b}"]`).innerHTML = texNum(Number(input.value));
          redraw();
        });
      });
      controls.querySelectorAll("[data-p]").forEach((input) =>
        input.addEventListener("input", () => {
          state[input.dataset.p] = Number(input.value);
          controls.querySelector(`[data-pv="${input.dataset.p}"]`).innerHTML = texNum(Number(input.value));
          redraw();
        }),
      );
    }

    function load(key) {
      state.key = key;
      state.b = presets[key].b.slice();
      state.t = 0;
      state.s = 0;
      state.ghostB = null;
      state.lastInput = 0;
      lab.querySelector(".ch3l-head p").textContent = presets[key].task;
      gateHost.innerHTML = "";
      predictGate(gateHost, presets[key].predict);
      renderControls();
      redraw();
    }

    buttons(toolbar, Object.entries(presets).map(([k, v]) => [k, v.label]), load, "line");
    load("line");
    return () => scene.destroy();
  }

  /* ---------- formal sections: compact theorem blocks from content data ---------- */

  /* Static figures for theorem blocks: { html, mount(el) -> cleanup }. */
  const FIGURES = {
    "three-planes": () => {
      const cases = [
        { label: "交于一点", sub: "唯一解", rows: [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]] },
        { label: "交于一条直线", sub: "无穷多解", rows: [[1, 0, -1, 0], [0, 1, -1, 0], [1, 1, -2, 0]] },
        { label: "三棱柱", sub: "两两相交，无公共点", rows: [[1, 0, -1, 0.8], [0, 1, -1, -0.8], [1, 1, -2, 0.8]], view: [1, 0.94, 1.04] },
        { label: "两个平面平行", sub: "无解", rows: [[0, 0, 1, -1], [0, 0, 1, 1], [1, -1, 0, 0]] },
        { label: "三个平面重合", sub: "解集是一个平面", rows: [[1, 1, 1, 0], [2, 2, 2, 0], [-1, -1, -1, 0]] },
      ];
      return {
        html: `<div class="ch3l-mini-row">${cases.map((c, i) => `<figure class="ch3l-mini" data-mini="${i}"><figcaption><strong>${c.label}</strong><span>${c.sub}</span></figcaption></figure>`).join("")}</div>`,
        mount(el) {
          const scenes = cases.map((c, i) => {
            const host = el.querySelector(`[data-mini="${i}"]`);
            const scene = S().create(host, { range: 2.2, yaw: -0.75, pitch: 0.42, hint: "", frame: false, label: c.label });
            host.prepend(scene.element);
            if (c.view) scene.lookAlong(c.view, false);
            const aug = c.rows.map((r) => r.map(F));
            scene.setObjects(() => [
              ...c.rows.map((r, j) => ({ type: "plane", n: r.slice(0, 3), d: r[3], color: PLANE_COLORS[j], alpha: 0.16, width: 1 })),
              ...solutionObjects(aug).map((o) => ({ ...o, label: undefined })),
            ]);
            return scene;
          });
          return () => scenes.forEach((sc) => sc.destroy());
        },
      };
    },
  };

  function renderFormal(root, section) {
    const f = section.lesson3d;
    if (!root || !f) return undefined;
    const mounts = [];
    const figureHtml = (key, i) => {
      const make = FIGURES[key];
      if (!make) return "";
      const fig = make();
      mounts.push({ i, fig });
      return `<div class="ch3l-figure" data-figure="${i}">${fig.html}</div>`;
    };
    const ponder = (p) =>
      p ? `<details class="ch3l-ponder"><summary><span>停一下</span>${p.q}</summary><p>${p.a}</p></details>` : "";
    root.innerHTML = `<h2>定理与方法</h2><div class="ch3l-formal">${f.blocks
      .map(
        (b, i) =>
          `<article class="ch3l-theorem"><h3>${b.title}</h3>${b.tex ? `<div class="ch3l-theorem-math">${texD(b.tex)}</div>` : ""}${b.text ? `<p>${b.text}</p>` : ""}${b.figure ? figureHtml(b.figure, i) : ""}${ponder(b.ponder)}</article>`,
      )
      .join("")}${f.pitfalls?.length ? `<div class="ch3l-pitfalls"><h3>容易错在哪里</h3><ul>${f.pitfalls.map((p) => `<li>${p}</li>`).join("")}</ul></div>` : ""}</div>`;
    const cleanups = mounts.map(({ i, fig }) => fig.mount(root.querySelector(`[data-figure="${i}"]`)));
    return () => cleanups.forEach((c) => c?.());
  }

  const LABS = {
    elimination: eliminationLab,
    "n-vector-space": vectorSpaceLab,
    "linear-dependence": dependenceLab,
    "matrix-rank": rankLab,
    solvability: solvabilityLab,
    "solution-structure": structureLab,
  };

  Object.entries(LABS).forEach(([id, lab]) => {
    window.defineChapter3Renderer?.(id, {
      formal: (root, section) => renderFormal(root, section),
      interactive: (root, section, page) => {
        if (!root) return undefined;
        // Picture first: the lab sits above the theorem block.
        const formal = page?.querySelector(`#${CSS.escape(section.id)}-formal`);
        if (formal && formal.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING) formal.before(root);
        return lab(root);
      },
    });
  });
})();
