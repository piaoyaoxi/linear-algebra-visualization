/*
 * Chapter 9 (欧几里得空间) labs. Plane pictures use Ch9Plane (plane2d.js); space
 * pictures use the shared 3D scene (visuals/shared/scene3d.js). Every lab asks
 * for a prediction first and opens its conclusion only after the student has
 * answered. Orthogonality, equality and dimension decisions use exact rational
 * arithmetic from Ch3Math; floating point is used only to draw.
 */
(() => {
  const M = () => window.Ch3Math;
  const S = () => window.LAScene3D;
  const P = () => window.Ch9Plane;
  const tex = (s) => M().tex(s);
  const texD = (s) => M().texD(s);
  const F = (x) => M().parseF(x);
  const num = (x) => M().toNumber(x);
  const lf = (x) => M().latexF(x);
  const V3 = () => S().vec;

  /* ---------- exact helpers ---------- */
  const ZERO = () => F(0);
  const addF = (u, v) => u.map((x, i) => M().add(x, v[i]));
  const subF = (u, v) => u.map((x, i) => M().sub(x, v[i]));
  const scaleF = (c, v) => v.map((x) => M().mul(c, x));
  const dotF = (u, v) => u.reduce((s, x, i) => M().add(s, M().mul(x, v[i])), ZERO());
  const isZeroVec = (v) => v.every((x) => M().isZero(x));
  const toF = (v) => v.map(F);
  const toN = (v) => v.map(num);
  const matF = (A) => A.map((r) => r.map(F));
  const matN = (A) => A.map((r) => r.map(num));
  const transposeF = (A) => A[0].map((_, j) => A.map((r) => r[j]));
  const matMulF = (A, B) => A.map((r) => B[0].map((_, j) => r.reduce((s, x, k) => M().add(s, M().mul(x, B[k][j])), ZERO())));
  const isIdentity = (A) => A.every((r, i) => r.every((x, j) => M().eq(x, F(i === j ? 1 : 0))));
  const quadF = (G, x, y) => dotF(x, M().matVec(G, y));
  const vtex = (v) => `(${v.map(lf).join(",")})`;
  const det2 = (A) => M().sub(M().mul(A[0][0], A[1][1]), M().mul(A[0][1], A[1][0]));
  const isPosDef2 = (G) => G[0][0].n > 0 && det2(G).n > 0;
  /* Slider values are halves: show them as exact fractions. */
  const texNum = (x) => tex(lf(F(x)));

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

  /*
   * cos θ = (u,v) / √((u,u)(v,v)) as exact LaTeX (a fraction times one square
   * root), plus the angle itself: exact for the angles whose cosine is 0, ±½,
   * ±√2/2, ±√3/2 or ±1, otherwise rounded to a tenth of a degree and marked ≈.
   */
  function angleTex(uv, uu, vv) {
    const P = M().mul(uu, vv); // (u,u)(v,v) = p/q, √(p/q) = √(pq)/q
    const [k, m] = sqrtSplit(P.n * P.d);
    const c = M().div(M().mul(uv, F(P.d)), F(k * m)); // cos θ = c·√m
    let cos;
    if (m === 1 || M().isZero(c)) cos = lf(c);
    else {
      const top = `${Math.abs(c.n) === 1 ? "" : Math.abs(c.n)}\\sqrt{${m}}`;
      cos = `${c.n < 0 ? "-" : ""}${c.d === 1 ? top : `\\tfrac{${top}}{${c.d}}`}`;
    }
    const cos2 = M().div(M().mul(uv, uv), P);
    const special = { "0/1": 90, "1/4": 60, "1/2": 45, "3/4": 30, "1/1": 0 }[`${cos2.n}/${cos2.d}`];
    let angle;
    if (special != null) angle = `\\theta=${uv.n < 0 ? 180 - special : special}^\\circ`;
    else {
      const deg = (Math.acos(Math.max(-1, Math.min(1, num(uv) / Math.sqrt(num(P))))) * 180) / Math.PI;
      angle = `\\theta\\approx${deg.toFixed(1)}^\\circ`;
    }
    return { cos: `\\cos\\theta=${cos}`, angle };
  }

  /* Latex for c₁·name₁ + c₂·name₂ + … (skips zero terms). */
  function combo(coeffs, names) {
    const out = [];
    coeffs.forEach((c, i) => {
      if (M().isZero(c)) return;
      const mag = M().absF(c);
      const body = `${M().eq(mag, F(1)) ? "" : lf(mag)}${names[i]}`;
      out.push(out.length ? `${c.n < 0 ? "-" : "+"}${body}` : `${c.n < 0 ? "-" : ""}${body}`);
    });
    return out.join("") || "0";
  }

  /* ---------- shared UI ---------- */
  /* a formula and the punctuation after it stay on one line */
  const keep = (html) => `<span class="la-keep">${html}</span>`;

  function el(tag, cls, html) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function chips(host, items, onPick, activeKey) {
    host.innerHTML = items
      .map(([key, label]) => `<button type="button" class="ch9l-chip${key === activeKey ? " is-active" : ""}" data-key="${key}">${label}</button>`)
      .join("");
    const all = [...host.querySelectorAll("button")];
    all.forEach((b) =>
      b.addEventListener("click", () => {
        all.forEach((x) => x.classList.toggle("is-active", x === b));
        onPick(b.dataset.key);
      }),
    );
    return (key) => all.forEach((x) => x.classList.toggle("is-active", x.dataset.key === key));
  }

  /*
   * Predict -> act -> reveal. Picking an option only records the prediction
   * (spec.onPick); the verdict and onAnswered wait for the first action in the
   * lab after the pick: a drag on the picture, a slider, a preset or a button
   * outside the gate. With spec.manual the lab decides itself and calls
   * box.act() (§2 waits until the third step has run).
   */
  function predictGate(host, spec, onAnswered) {
    spec = { ...spec, options: window.LAStableShuffle ? window.LAStableShuffle(spec.options, spec.question) : spec.options };
    const box = el("div", "ch9l-predict");
    box.dataset.ch9Predict = "";
    box.innerHTML = `<div class="ch9l-predict-q"><span>先猜一猜</span><p>${spec.question}</p></div>
      <div class="ch9l-predict-options">${spec.options.map((o, i) => `<button type="button" data-i="${i}" data-ok="${o.correct ? "true" : "false"}" data-why="${String(o.why || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">${o.text}</button>`).join("")}</div>
      <p class="ch9l-predict-feedback" hidden></p>`;
    host.append(box);
    const feedback = box.querySelector(".ch9l-predict-feedback");
    let answered = false;
    let picked = null;

    function verdict(b) {
      const o = spec.options[Number(b.dataset.i)];
      box.querySelectorAll("[data-i]").forEach((x) => x.classList.remove("is-right", "is-wrong", "is-picked"));
      b.classList.add(o.correct ? "is-right" : "is-wrong");
      feedback.hidden = false;
      feedback.innerHTML = o.correct ? `✓ ${spec.right}` : `再看看图：${o.why || "动手操作后看看发生了什么。"}`;
      if (!answered) {
        answered = true;
        box.dataset.answered = "true";
        box.classList.add("is-done");
        onAnswered?.();
      }
    }

    box.querySelectorAll("[data-i]").forEach((b) =>
      b.addEventListener("click", () => {
        if (answered) return verdict(b);
        const first = !picked;
        picked = b;
        box.dataset.picked = "true";
        box.querySelectorAll("[data-i]").forEach((x) => x.classList.toggle("is-picked", x === b));
        feedback.hidden = false;
        feedback.textContent = spec.actHint || "记下了你的猜测。现在动手操作一次，结论随后出现。";
        if (first) spec.onPick?.();
      }),
    );

    box.act = () => {
      if (picked && !answered) verdict(picked);
    };
    const actRoot = spec.manual ? null : spec.defer || host.closest("[data-ch9-lab]");
    if (actRoot) {
      /*
       * Acting means changing what the lab reports: rotating the camera, a view
       * button or an empty click leaves the readouts as they were and does not count.
       */
      const state = () => {
        const parts = [];
        const walk = document.createTreeWalker(actRoot, NodeFilter.SHOW_TEXT);
        while (walk.nextNode()) {
          const node = walk.currentNode;
          if (node.parentElement?.closest("[data-ch9-predict], button, .ch9l-head, .la-figcaption, .ch9p-hint, .la3d-hint, .katex-mathml, [data-ch9-result]")) continue;
          parts.push(node.textContent.trim());
        }
        actRoot.querySelectorAll("input").forEach((input) => parts.push(input.value));
        return parts.join("|");
      };
      // the readouts at the moment of the pick; refreshed once after the lab's own redraw,
      // unless the student has already acted by then
      let before = null;
      let touched = false;
      box.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => {
        if (before != null) return;
        before = state();
        requestAnimationFrame(() => { if (!touched && !answered) before = state(); });
      }));
      const check = () => {
        if (!picked || answered || before == null) return;
        if (state() !== before) verdict(picked);
      };
      const act = (e) => {
        if (!picked || answered || box.contains(e.target)) return;
        touched = true;
        setTimeout(check, 60);
        setTimeout(check, 400);
      setTimeout(check, 1100);
      };
      ["input", "change", "pointerup", "click", "keyup"].forEach((t) => actRoot.addEventListener(t, act));
      // dragging a handle on the canvas is acting even when the readouts are still hidden
      actRoot.addEventListener("la-handle-move", () => { if (picked && !answered && before != null) verdict(picked); });
    }
    return box;
  }

  function labShell(root, { title, task, kind }) {
    root.innerHTML = `<h2>交互实验</h2>`;
    const lab = el("section", "ch9l-lab");
    lab.dataset.ch9Lab = "";
    lab.dataset.labKind = kind;
    lab.innerHTML = `<header class="ch9l-head"><h3>${title}</h3><p>${task}</p></header>`;
    root.append(lab);
    return lab;
  }

  function resultBox(html) {
    const box = el("div", "ch9l-result", `<strong>结论</strong>${html}`);
    box.dataset.ch9Result = "";
    box.hidden = true;
    return box;
  }

  function stageLayout(lab) {
    const body = el("div", "ch9l-body");
    const stage = el("div", "ch9l-stage");
    const side = el("aside", "ch9l-side");
    body.append(stage, side);
    lab.append(body);
    return { stage, side };
  }

  function btn(label, attr, cls = "") {
    return `<button type="button" class="ch9l-btn${cls ? ` ${cls}` : ""}" ${attr}>${label}</button>`;
  }

  /* Two segments forming a right-angle mark at `at` in 3D. */
  function rightAngle3(at, u, v, s = 0.28) {
    const V = V3();
    if (V.len(u) < 1e-9 || V.len(v) < 1e-9) return [];
    const U = V.mul(V.norm(u), s);
    const W = V.mul(V.norm(v), s);
    const a = V.add(at, U);
    const b = V.add(a, W);
    const c = V.add(at, W);
    return [
      { type: "segment", a, b, color: "axis", width: 1.4 },
      { type: "segment", a: b, b: c, color: "axis", width: 1.4 },
    ];
  }

  const unit2 = (v) => {
    const l = Math.hypot(v[0], v[1]);
    return l < 1e-12 ? [0, 0] : [v[0] / l, v[1] / l];
  };

  /* ================= §1 内积：换一个内积，垂直就变了 ================= */

  const IP_PRESETS = {
    dot: { label: "标准内积", G: [[1, 0], [0, 1]] },
    diag: { label: tex("G=\\operatorname{diag}(1,4)"), G: [[1, 0], [0, 4]] },
    tilt: { label: tex("G=\\left[\\begin{smallmatrix}2&1\\\\1&2\\end{smallmatrix}\\right]"), G: [[2, 1], [1, 2]] },
    bad: { label: "不正定的 G", G: [[1, 2], [2, 1]] },
  };

  function innerProductLab(root) {
    const lab = labShell(root, {
      kind: "inner-product",
      title: "度量矩阵 G 决定什么叫“垂直”",
      task: `在 ${tex("\\mathbb R^2")} 上取内积 ${tex("(\\alpha,\\beta)=X^TGY")}。绿色曲线是这个内积下的单位圆 ${tex("\\{\\alpha:(\\alpha,\\alpha)=1\\}")}，虚线圆是普通点积的单位圆。拖动 u、v（每次半格），读出它们的内积。`,
    });
    const toolbar = el("div", "ch9l-toolbar");
    lab.append(toolbar);
    const { stage, side } = stageLayout(lab);
    const plane = P().create(stage, { range: 2.5, label: "内积的单位圆与两个向量", hint: "拖动圆点改变 u、v" });
    lab.ch9Views = { plane };
    const info = el("div", "ch9l-card");
    info.dataset.ch9Readout = "ip";
    const gateHost = el("div");
    const result = resultBox(
      `<p>同一个线性空间可以带不同的内积。单位圆换成椭圆后，与 u 正交的方向正是椭圆在 u 方向上那一点的切线方向，和屏幕上看到的直角无关。长度、夹角、正交全由内积给出，所以欧氏空间要把内积写进定义；取定基后它由正定的度量矩阵 ${tex("G=((\\varepsilon_i,\\varepsilon_j))")} 记录。</p>`,
    );
    side.append(info, gateHost, result);
    const state = { key: "diag", u: [1, 1], v: [1, -1], revealed: false };

    function redraw() {
      const G = matF(IP_PRESETS[state.key].G);
      const Gn = matN(G);
      const pd = isPosDef2(G);
      const u = toF(state.u);
      const v = toF(state.v);
      const uv = quadF(G, u, v);
      const uu = quadF(G, u, u);
      const vv = quadF(G, v, v);
      const Gu = toN(M().matVec(G, u));
      const perpDir = [-Gu[1], Gu[0]];
      const orth = pd && !isZeroVec(u) && !isZeroVec(v) && M().isZero(uv);
      plane.setObjects(() => {
        const objs = [];
        if (state.key !== "dot") objs.push({ type: "curve", pts: P().conic([[1, 0], [0, 1]]), closed: true, color: "axis", dash: [5, 5], width: 1.3 });
        objs.push({ type: "curve", pts: P().conic(Gn, 1, 6), closed: pd, color: "subspace", width: 2.6, fill: pd, fillAlpha: 0.07 });
        if (!pd) objs.push({ type: "curve", pts: P().conic(Gn.map((r) => r.map((x) => -x)), 1, 6), color: "subspace", width: 1.4, dash: [3, 4] });
        if (state.revealed && pd && !isZeroVec(u)) {
          objs.push({ type: "line", dir: perpDir, color: "subspace", width: 1.8, dash: [7, 5], label: "与 u 正交" });
          const r = Math.sqrt(num(uu));
          const t0 = [state.u[0] / r, state.u[1] / r];
          const d = unit2(perpDir);
          objs.push({ type: "segment", a: [t0[0] - d[0] * 0.9, t0[1] - d[1] * 0.9], b: [t0[0] + d[0] * 0.9, t0[1] + d[1] * 0.9], color: "axis", width: 2.2 });
          objs.push({ type: "point", p: t0, color: "axis", r: 4 });
        }
        objs.push({ type: "arrow", to: state.u, color: "v1", label: "u" });
        // Highlight when orthogonal: the same colour with a glow underneath.
        if (orth) objs.push({ type: "segment", a: [0, 0], b: state.v, color: "v2", width: 8, alpha: 0.18 });
        objs.push({ type: "arrow", to: state.v, color: "v2", label: "v" });
        return objs;
      });
      let status;
      if (!pd) {
        status = `<p class="ch9l-bad">G 不正定：${tex("\\alpha=(1,-1)")} 时 ${tex("(\\alpha,\\alpha)=-2<0")}。它满足对称性和线性，却不能当长度平方用，所以不是内积。</p>`;
        if (!isZeroVec(v) && vv.n <= 0) status += `<p class="ch9l-bad">当前 ${tex(`(v,v)=${lf(vv)}`)}。</p>`;
      } else if (orth) {
        status = `<p class="ch9l-ok">${tex("(u,v)=0")}：在这个内积下 u 与 v 正交。</p>`;
      } else if (isZeroVec(u) || isZeroVec(v)) {
        status = `<p class="ch9l-muted">零向量与任何向量正交，但夹角没有定义。</p>`;
      } else {
        // θ is read off a dragged picture: cos θ is exact, the angle exact only for the special values
        const a = angleTex(uv, uu, vv);
        status = `<p class="ch9l-muted" data-ip-angle>u 与 v 的夹角 θ：${tex(a.cos)}，${tex(a.angle)}</p>`;
      }
      info.innerHTML = `<h4>当前读数</h4>
        <p>${tex(`G=${M().latexMatrix(G)}`)}</p>
        <p>${tex(`u=${vtex(u)},\\ v=${vtex(v)}`)}</p>
        <p data-ip-value>${tex(`(u,v)=u^TGv=${lf(uv)}`)}</p>
        <p>${tex(`|u|^2=${lf(uu)},\\ |v|^2=${lf(vv)}`)}</p>
        <p class="ch9l-muted">对照：普通点积 ${tex(`u\\cdot v=${lf(dotF(u, v))}`)}</p>
        <div data-ip-status>${status}</div>`;
    }

    chips(toolbar, Object.entries(IP_PRESETS).map(([k, p]) => [k, p.label]), (k) => {
      state.key = k;
      redraw();
    }, state.key);
    plane.setHandles([
      { color: "drag", snap: 0.5, get: () => state.u, set: (p) => ((state.u = p), redraw()) },
      { color: "drag", snap: 0.5, get: () => state.v, set: (p) => ((state.v = p), redraw()) },
    ]);
    predictGate(
      gateHost,
      {
        question: `取 ${tex("G=\\operatorname{diag}(1,4)")}，即 ${tex("(\\alpha,\\beta)=a_1b_1+4a_2b_2")}。与 ${tex("u=(1,1)")} 正交的方向是哪一个？`,
        options: [
          { text: tex("(1,-1)"), why: `它和 u 的普通点积为 0；在这个内积下 ${tex("(u,v)=1-4=-3")}。` },
          { text: tex("(4,-1)"), correct: true },
          { text: tex("(1,-4)"), why: `${tex("(u,v)=1\\cdot1+4\\cdot1\\cdot(-4)=-15")}。` },
          { text: "没有与 u 正交的方向", why: "二维欧氏空间里，每个非零向量都有正交方向。" },
        ],
        right: `${tex("(u,v)=4-4=0")}。把 v 拖到 ${tex("(2,-\\tfrac12)")} 验证：绿色虚线上的向量都与 u 正交，它平行于椭圆在 u 方向那一点的切线。`,
      },
      () => {
        state.revealed = true;
        result.hidden = false;
        redraw();
      },
    );
    redraw();
    return () => plane.destroy();
  }

  /* ================= §2 施密特正交化：第三步在三维里 ================= */

  const GS_PRESETS = {
    general: { label: "一般的基", a: [[1, 1, 0], [1, 0, 1], [0, 1, 1]] },
    dependent: { label: "α₃ 落进平面", a: [[1, 1, 0], [1, 0, 1], [0, 1, -1]] },
  };
  const GS_STEPS = ["原向量组", "β₁ = α₁", "β₂ = α₂ − 投影", "β₃ = α₃ − 平面上的投影", "单位化"];

  function gramSchmidtLab(root) {
    const lab = labShell(root, {
      kind: "gram-schmidt",
      title: "施密特正交化的第三步：减去平面上的投影",
      task: "一步一步执行正交化。第二步减去 α₂ 在直线 β₁ 上的投影；第三步减去 α₃ 在 β₁、β₂ 所张平面上的投影，留下的 β₃ 垂直于整个平面。α₃ 可以拖动（每次半格）。",
    });
    const toolbar = el("div", "ch9l-toolbar");
    lab.append(toolbar);
    const { stage, side } = stageLayout(lab);
    const scene = S().create(stage, { range: 2, label: "施密特正交化的三维图", yaw: -0.55, pitch: 0.38, hint: "拖动空白处旋转 · 拖动圆点改变 α₃", spreadLabels: true, labelSafe: true });
    lab.ch9Views = { scene };
    const stepCard = el("div", "ch9l-card");
    stepCard.innerHTML = `<div class="ch9l-steps" data-gs-steps></div>
      <div class="ch9l-actions">${btn("上一步", "data-gs-prev")}${btn("下一步", "data-gs-next data-la-free", "is-primary")}${btn("沿平面看", "data-gs-look")}${btn("默认视角", "data-gs-reset")}</div>
      <p class="ch9l-note" data-gs-note hidden>先猜一猜下面的问题，再执行第三步。</p>`;
    const info = el("div", "ch9l-card");
    info.dataset.ch9Readout = "gs";
    const gateHost = el("div");
    const result = resultBox(
      `<p>第 k 步减去的是 ${tex("\\alpha_k")} 在 ${tex("\\operatorname{span}\\{\\beta_1,\\dots,\\beta_{k-1}\\}")} 上的投影。因为 ${tex("\\beta_1,\\beta_2")} 已经正交，平面上的投影才能拆成沿 ${tex("\\beta_1")}、沿 ${tex("\\beta_2")} 的两项相加。沿平面看时 ${tex("\\beta_3")} 与平面成直角；α₃ 落进平面时 ${tex("\\beta_3=0")}，原向量组线性相关。</p>`,
    );
    side.append(stepCard, info, gateHost, result);
    const state = { key: "general", a: GS_PRESETS.general.a.map((v) => v.slice()), step: 0, predicted: false };
    const colors = ["v1", "v2", "drag"]; // α₃ is the dragged vector

    function compute() {
      const a = state.a.map(toF);
      const b1 = a[0];
      const c21 = M().div(dotF(a[1], b1), dotF(b1, b1));
      const b2 = subF(a[1], scaleF(c21, b1));
      const c31 = M().div(dotF(a[2], b1), dotF(b1, b1));
      const c32 = M().div(dotF(a[2], b2), dotF(b2, b2));
      const p3 = addF(scaleF(c31, b1), scaleF(c32, b2));
      const b3 = subF(a[2], p3);
      return { a, b1, b2, b3, c21, c31, c32, p2: scaleF(c21, b1), p3 };
    }

    function redraw() {
      const V = V3();
      const c = compute();
      const dep = isZeroVec(c.b3);
      const step = state.step;
      const [b1, b2, b3, p2, p3] = [c.b1, c.b2, c.b3, c.p2, c.p3].map(toN);
      scene.setObjects(() => {
        const objs = [];
        const faded = step >= 4 ? 0.3 : step >= 1 ? 0.55 : 1;
        // the plane's name sits on the side away from the vectors, so it stays clear of their labels
        if (step >= 3) objs.push({ type: "plane", n: V.cross(b1, b2), d: 0, color: "subspace", alpha: 0.13, label: "span{β₁,β₂}", labelAt: V.mul(V.add(V.norm(b1), V.norm(b2)), -1.1) });
        // a faded αᵢ loses its name once βᵢ is drawn: β₁=α₁ carries one label, α₂ is replaced in step 3
        const named = (i) => step < 4 && !(i === 0 && step >= 1) && !(i === 1 && step >= 3);
        state.a.forEach((v, i) => objs.push({ type: "arrow", to: v, color: colors[i], alpha: faded, width: 2.2, label: named(i) ? `α${"₁₂₃"[i]}` : undefined }));
        if (step >= 1 && step < 4) objs.push({ type: "arrow", to: b1, color: "v1", width: 3.2, label: "β₁=α₁" });
        if (step >= 2 && step < 4) {
          objs.push({ type: "segment", a: state.a[1], b: p2, color: "axis", dash: [5, 4], width: 1.6 });
          objs.push({ type: "point", p: p2, color: "axis", r: 4 });
          objs.push(...rightAngle3(p2, V.mul(b1, -1), b2, 0.22));
          objs.push({ type: "arrow", to: b2, color: "v2", width: 3.2, label: "β₂" });
        }
        if (step >= 3 && step < 4) {
          objs.push({ type: "arrow", to: p3, color: "image", width: 2, label: "投影", labelAt: V.mul(p3, 0.3) });
          objs.push({ type: "segment", a: state.a[2], b: p3, color: "axis", dash: [5, 4], width: 1.8 });
          objs.push({ type: "point", p: p3, color: "image", r: 4.5 });
          if (!dep) {
            objs.push(...rightAngle3(p3, V.len(p3) > 1e-9 ? V.mul(p3, -1) : b1, b3, 0.25));
            objs.push({ type: "arrow", to: b3, color: "drag", width: 3.4, label: "β₃" });
          }
        }
        if (step >= 4) {
          const qs = [b1, b2, b3].map((v) => V.norm(v));
          objs.push({ type: "box", vectors: qs, color: "image", alpha: 0.06 });
          qs.forEach((q, i) => objs.push({ type: "arrow", to: q, color: colors[i], width: 3.4, label: `η${"₁₂₃"[i]}` }));
        }
        return objs;
      });
      scene.setHandles([
        {
          color: "drag",
          snap: 0.5,
          get: () => state.a[2],
          set: (p) => {
            state.a[2] = p;
            if (isZeroVec(compute().b3) && state.step > 3) state.step = 3;
            redraw();
          },
        },
      ]);

      // Step list and buttons.
      stepCard.querySelector("[data-gs-steps]").innerHTML = GS_STEPS.map((s, i) => `<span class="${i === step ? "is-active" : i < step ? "is-done" : ""}">${i}. ${s}</span>`).join("");
      const locked = step === 2 && !state.predicted;
      const next = stepCard.querySelector("[data-gs-next]");
      next.disabled = step >= 4 || locked || (step === 3 && dep);
      stepCard.querySelector("[data-gs-prev]").disabled = step === 0;
      stepCard.querySelector("[data-gs-note]").hidden = !locked;

      const lines = [`<h4>当前读数</h4>`, `<p>${tex(`\\alpha_1=${vtex(c.a[0])},\\ \\alpha_2=${vtex(c.a[1])},\\ \\alpha_3=${vtex(c.a[2])}`)}</p>`];
      if (step >= 1) lines.push(`<p>${tex(`\\beta_1=\\alpha_1=${vtex(c.b1)}`)}</p>`);
      if (step >= 2) lines.push(`<p>${tex(`\\beta_2=\\alpha_2-\\tfrac{(\\alpha_2,\\beta_1)}{(\\beta_1,\\beta_1)}\\beta_1=${combo([F(1), M().neg(c.c21)], ["\\alpha_2", "\\beta_1"])}=${vtex(c.b2)}`)}</p>`);
      if (step >= 3) {
        lines.push(`<p data-gs-beta3>${tex(`\\beta_3=${combo([F(1), M().neg(c.c31), M().neg(c.c32)], ["\\alpha_3", "\\beta_1", "\\beta_2"])}=${vtex(c.b3)}`)}</p>`);
        lines.push(
          dep
            ? `<p class="ch9l-bad" data-gs-status>${tex("\\beta_3=0")}：${tex("\\alpha_3")} 在 ${tex("\\operatorname{span}\\{\\alpha_1,\\alpha_2\\}")} 里，没有新方向，向量组线性相关，正交化在这里停止。</p>`
            : `<p class="ch9l-ok" data-gs-status>${tex(`(\\beta_3,\\beta_1)=${lf(dotF(c.b3, c.b1))},\\ (\\beta_3,\\beta_2)=${lf(dotF(c.b3, c.b2))}`)}：β₃ 垂直于整个平面。</p>`,
        );
      }
      if (step >= 4) {
        const n2 = [c.b1, c.b2, c.b3].map((v) => lf(dotF(v, v)));
        lines.push(`<p>${tex(`|\\beta_1|^2=${n2[0]},\\ |\\beta_2|^2=${n2[1]},\\ |\\beta_3|^2=${n2[2]}`)}</p><p>${tex("\\eta_i=\\beta_i/|\\beta_i|")}：η₁、η₂、η₃ 是一组标准正交基，单位立方体随之摆正。</p>`);
      }
      info.innerHTML = lines.join("");
      // the verdict waits until the third step has actually run
      if (step >= 3 && state.predicted) gate?.act();
    }

    chips(toolbar, Object.entries(GS_PRESETS).map(([k, p]) => [k, p.label]), (k) => {
      state.key = k;
      state.a = GS_PRESETS[k].a.map((v) => v.slice());
      if (k === "dependent" && state.step > 3) state.step = 3;
      redraw();
    }, state.key);
    stepCard.querySelector("[data-gs-next]").addEventListener("click", () => {
      state.step = Math.min(4, state.step + 1);
      redraw();
    });
    stepCard.querySelector("[data-gs-prev]").addEventListener("click", () => {
      state.step = Math.max(0, state.step - 1);
      redraw();
    });
    stepCard.querySelector("[data-gs-look]").addEventListener("click", () => scene.lookAlong(toN(compute().b1)));
    stepCard.querySelector("[data-gs-reset]").addEventListener("click", () => scene.resetView());
    let gate = null;
    gate = predictGate(
      gateHost,
      {
        question: `第三步要从 ${tex("\\alpha_3")} 中减去一个向量，使剩下的 ${tex("\\beta_3")} 与 ${tex("\\beta_1,\\beta_2")} 都正交。减去的是什么？`,
        options: [
          { text: `${tex("\\alpha_3")} 在 ${tex("\\beta_1,\\beta_2")} 所张平面上的投影`, correct: true },
          { text: `${tex("\\alpha_3")} 在 ${tex("\\beta_2")} 上的投影`, why: "只减这一项，剩下的部分一般仍与 β₁ 不正交。" },
          { text: `${tex("\\alpha_3")} 在 ${tex("\\alpha_1")} 上的投影与在 ${tex("\\alpha_2")} 上的投影之和`, why: `${tex("\\alpha_1,\\alpha_2")} 不正交，两个投影有重叠，相加会多减。对默认数据，剩下的是 ${tex("(-1,\\tfrac12,\\tfrac12)")}，它与 ${tex("\\alpha_1")} 的内积为 ${tex("-\\tfrac12")}。` },
          { text: `${tex("\\alpha_3")} 在 ${tex("\\beta_1\\times\\beta_2")} 方向上的分量`, why: "那一部分恰好是要留下的 β₃。" },
        ],
        right: `投影 ${tex("=\\tfrac{(\\alpha_3,\\beta_1)}{(\\beta_1,\\beta_1)}\\beta_1+\\tfrac{(\\alpha_3,\\beta_2)}{(\\beta_2,\\beta_2)}\\beta_2")}。执行第三步，再点“沿平面看”。`,
        manual: true,
        actHint: "记下了你的猜测。执行到第三步，结论随后出现。",
        onPick: () => {
          state.predicted = true;
          redraw();
        },
      },
      () => {
        result.hidden = false;
      },
    );
    redraw();
    return () => scene.destroy();
  }

  /* ================= §3 同构：坐标映射何时保持内积 ================= */

  const ISO_G = [[2, 1], [1, 1]];
  const ISO_PRESETS = {
    std: { label: "标准基 ε₁, ε₂", f: [[1, 0], [0, 1]] },
    dotperp: { label: "(1,1), (1,−1)", f: [[1, 1], [1, -1]] },
    other: { label: "(3/5,1/5), (−4/5,7/5)", f: [[0.6, 0.2], [-0.8, 1.4]] },
    scaled: { label: "(1,0), (−1,2)", f: [[1, 0], [-1, 2]] },
  };

  function isometryLab(root) {
    const lab = labShell(root, {
      kind: "isometry",
      title: "坐标映射把 V 的单位圆送到哪里",
      task: `V 是 ${tex("\\mathbb R^2")} 配上度量矩阵 ${tex("G=\\left[\\begin{smallmatrix}2&1\\\\1&1\\end{smallmatrix}\\right]")} 的欧氏空间。选一组基 ${tex("f_1,f_2")}（可拖动），σ 把 ${tex("\\alpha=x_1f_1+x_2f_2")} 送到坐标 ${tex("(x_1,x_2)\\in\\mathbb R^2")}，右边用普通点积。`,
    });
    const toolbar = el("div", "ch9l-toolbar");
    lab.append(toolbar);
    const pair = el("div", "ch9l-pair");
    const left = el("div", "ch9l-view", `<div class="ch9l-view-title">V（内积由 G 给出）</div>`);
    const right = el("div", "ch9l-view", `<div class="ch9l-view-title">${tex("\\mathbb R^2")}（普通点积）</div>`);
    pair.append(left, right);
    lab.append(pair);
    const lp = P().create(left, { range: 2.4, label: "V 中的单位椭圆与基", hint: "拖动 f₁、f₂、α" });
    const rp = P().create(right, { range: 2.4, label: "坐标空间中的像", hint: "", axisNames: ["y₁", "y₂"] });
    lab.ch9Views = { lp, rp };
    const status = el("div", "ch9l-status");
    status.dataset.ch9Readout = "iso";
    const gateHost = el("div");
    const result = resultBox(
      `<p>${tex("(\\alpha,\\beta)=X^TBY")}，其中 ${tex("B=C^TGC")} 是 ${tex("f_1,f_2")} 的度量矩阵，C 是从 ${tex("\\varepsilon_1,\\varepsilon_2")} 到 ${tex("f_1,f_2")} 的过渡矩阵。σ 保持内积 ⇔ ${tex("B=E")} ⇔ ${tex("f_1,f_2")} 是标准正交基。每个 n 维欧氏空间都有标准正交基，所以都同构于 ${tex("\\mathbb R^n")}。</p>`,
    );
    lab.append(status, gateHost, result);
    const G = matF(ISO_G);
    const Gn = matN(G);
    const state = { f: ISO_PRESETS.std.f.map((v) => v.slice()), alpha: [1, 1], revealed: false };

    /*
     * G-orthogonality drawn on the ellipse: t₁ is where the ray of f₁ meets the
     * G-unit ellipse, and the tangent there has direction J·Gf₁. f₂ is
     * G-orthogonal to f₁ exactly when it is parallel to that tangent; a dashed
     * copy of f₂'s direction through t₁ shows how far off it is.
     */
    function tangentMark(f, b12) {
      const [f1, f2] = state.f;
      const q = Gn[0][0] * f1[0] * f1[0] + 2 * Gn[0][1] * f1[0] * f1[1] + Gn[1][1] * f1[1] * f1[1];
      if (q < 1e-9 || Math.hypot(f2[0], f2[1]) < 1e-9) return [];
      const t1 = [f1[0] / Math.sqrt(q), f1[1] / Math.sqrt(q)];
      const Gf1 = [Gn[0][0] * f1[0] + Gn[0][1] * f1[1], Gn[1][0] * f1[0] + Gn[1][1] * f1[1]];
      const tan = unit2([-Gf1[1], Gf1[0]]);
      const d2 = unit2(f2);
      const orth = M().isZero(b12);
      const L = 1.05;
      const objs = [];
      if (orth) objs.push({ type: "segment", a: [t1[0] - tan[0] * L, t1[1] - tan[1] * L], b: [t1[0] + tan[0] * L, t1[1] + tan[1] * L], color: "subspace", width: 8, alpha: 0.18 });
      objs.push({ type: "segment", a: [t1[0] - tan[0] * L, t1[1] - tan[1] * L], b: [t1[0] + tan[0] * L, t1[1] + tan[1] * L], color: "subspace", width: 2 });
      objs.push({ type: "label", p: [t1[0] + tan[0] * L, t1[1] + tan[1] * L], text: "切线", color: "subspace", dx: 4, dy: -10, font: "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" });
      // f₂ moved to the point of tangency (dashed copy)
      const s = Math.min(1, 1.2 / Math.hypot(f2[0], f2[1]));
      objs.push({ type: "arrow", from: t1, to: [t1[0] + f2[0] * s, t1[1] + f2[1] * s], color: "v2", width: 1.8, dash: [5, 4], alpha: 0.55 });
      if (!orth) objs.push({ type: "segment", a: [t1[0] - d2[0] * 0.5, t1[1] - d2[1] * 0.5], b: t1, color: "v2", width: 1.6, dash: [5, 4], alpha: 0.55 });
      objs.push({ type: "point", p: t1, color: "subspace", r: 4 });
      return objs;
    }

    function redraw() {
      const f = state.f.map(toF);
      const C = [[f[0][0], f[1][0]], [f[0][1], f[1][1]]];
      const det = det2(C);
      const alpha = toF(state.alpha);
      const b12 = quadF(G, f[0], f[1]);
      const onEllipse = f.map((v) => M().eq(quadF(G, v, v), F(1)));
      lp.setObjects(() => [
        { type: "curve", pts: P().conic(Gn), closed: true, color: "subspace", width: 2.6, fill: true, fillAlpha: 0.07, label: "" },
        { type: "polygon", pts: [[0, 0], state.f[0], [state.f[0][0] + state.f[1][0], state.f[0][1] + state.f[1][1]], state.f[1]], color: "axis", fillAlpha: 0.05, width: 1 },
        ...(state.revealed && !M().isZero(det) ? tangentMark(f, b12) : []),
        // a basis vector of G-length 1 ends on the ellipse: its tip glows
        ...(state.revealed ? state.f.map((p, i) => (onEllipse[i] ? { type: "point", p, color: i ? "v2" : "v1", r: 14, alpha: 0.2 } : null)) : []),
        { type: "arrow", to: state.f[0], color: "v1", label: "f₁" },
        { type: "arrow", to: state.f[1], color: "v2", label: "f₂" },
        { type: "arrow", to: state.alpha, color: "drag", width: 2.2, label: "α" },
      ]);
      if (M().isZero(det)) {
        rp.setObjects(() => [{ type: "curve", pts: P().conic([[1, 0], [0, 1]]), closed: true, color: "axis", dash: [5, 5], width: 1.3 }]);
        status.innerHTML = `<p class="ch9l-bad">${tex("f_1,f_2")} 共线，不是基，σ 无法定义。</p>`;
        return;
      }
      const B = matMulF(matMulF(transposeF(C), G), C);
      const x = M().particularSolution([[C[0][0], C[0][1], alpha[0]], [C[1][0], C[1][1], alpha[1]]]).x;
      const iso = isIdentity(B);
      rp.setObjects(() => [
        { type: "curve", pts: P().conic([[1, 0], [0, 1]]), closed: true, color: "axis", dash: [5, 5], width: 1.3 },
        // Highlight when σ keeps the inner product: the same colour with a glow.
        ...(iso ? [{ type: "curve", pts: P().conic(matN(B), 1, 8), closed: true, color: "image", width: 8, alpha: 0.18 }] : []),
        { type: "curve", pts: P().conic(matN(B), 1, 8), closed: true, color: "image", width: 2.6, fill: true, fillAlpha: 0.07 },
        { type: "arrow", to: [1, 0], color: "v1", label: "σf₁" },
        { type: "arrow", to: [0, 1], color: "v2", label: "σf₂" },
        { type: "arrow", to: toN(x), color: "image", width: 2.2, label: "σα" },
      ]);
      const aa = quadF(G, alpha, alpha);
      const xx = dotF(x, x);
      const marks = state.revealed
        ? `<p class="ch9l-muted" data-iso-tangent>${tex(`(f_1,f_2)=${lf(b12)}`)}：${
            M().isZero(b12) ? "f₂ 平行于椭圆在 f₁ 方向上那一点的切线，f₁、f₂ 按 G 正交。" : "f₂（朱色虚线方向）偏离切线，f₁、f₂ 按 G 不正交。"
          }${onEllipse.every(Boolean) ? "两个端点都在单位椭圆上，长度都是 1。" : ""}</p>`
        : "";
      status.innerHTML = `<p>${tex(`B=C^TGC=${M().latexMatrix(B)}`)}　${tex(`|\\alpha|^2=${lf(aa)}`)}，${tex(`|\\sigma\\alpha|^2=${lf(xx)}`)}</p>${marks}
        <p data-iso-status class="${iso ? "ch9l-ok" : "ch9l-muted"}">${
          iso
            ? "B = E：σ 把 V 的单位椭圆送成单位圆，保持全部内积，是欧氏空间的同构。"
            : `B ≠ E：σ 是线性同构，但 ${tex("(\\sigma\\alpha,\\sigma\\beta)=X^TY\\ne X^TBY=(\\alpha,\\beta)")}，单位椭圆的像不是单位圆。`
        }</p>`;
    }

    chips(toolbar, Object.entries(ISO_PRESETS).map(([k, p]) => [k, p.label]), (k) => {
      state.f = ISO_PRESETS[k].f.map((v) => v.slice());
      redraw();
    }, "std");
    lp.setHandles([
      { color: "drag", snap: 0.5, get: () => state.f[0], set: (p) => ((state.f[0] = p), redraw()) },
      { color: "drag", snap: 0.5, get: () => state.f[1], set: (p) => ((state.f[1] = p), redraw()) },
      { color: "drag", snap: 0.5, get: () => state.alpha, set: (p) => ((state.alpha = p), redraw()) },
    ]);
    predictGate(
      gateHost,
      {
        question: `σ 把 ${tex("f_1,f_2")} 送到 ${tex("e_1,e_2")}，右边按普通点积计算。${tex("f_1,f_2")} 满足什么条件时，σ 保持内积？`,
        options: [
          { text: `${tex("f_1,f_2")} 按 V 的内积（G）是标准正交基`, correct: true },
          { text: `${tex("f_1,f_2")} 按普通点积互相垂直、长度为 1`, why: "V 里的长度和角度要用 G 计算。试试 (1,1)、(1,−1)。" },
          { text: "任意一组基都可以", why: "看右图：标准基的像是一个椭圆，长度被改变了。" },
          { text: `只有 ${tex("f_1=\\varepsilon_1,\\ f_2=\\varepsilon_2")}`, why: `${tex("(\\varepsilon_1,\\varepsilon_1)=2")}，标准基在 V 里不是单位向量。` },
        ],
        right: `例如 ${tex("f_1=(\\tfrac35,\\tfrac15),\\ f_2=(-\\tfrac45,\\tfrac75)")}：两个端点都在单位椭圆上，f₂ 平行于 f₁ 处的切线；${tex("B=E")}，右边的紫色曲线与虚线单位圆重合。`,
        defer: lab,
        actHint: "记下了你的猜测。换一组基或拖动 f₁、f₂，结论随后出现。",
      },
      () => {
        state.revealed = true;
        result.hidden = false;
        redraw();
      },
    );
    redraw();
    return () => {
      lp.destroy();
      rp.destroy();
    };
  }

  /* ================= §4 正交变换：单位圆是否保持 ================= */

  const ORTHO_PRESETS = {
    rot: { label: "旋转", Q: [["3/5", "-4/5"], ["4/5", "3/5"]] },
    refl: { label: "反射", Q: [["3/5", "-4/5"], ["-4/5", "-3/5"]] },
    swap: { label: "交换坐标", Q: [[0, 1], [1, 0]] },
    squeeze: { label: tex("\\operatorname{diag}(2,\\tfrac12)"), Q: [[2, 0], [0, "1/2"]] },
    shear: { label: "剪切", Q: [[1, 1], [0, 1]] },
  };
  const FLAG = [[0, 0], [0, 1.2], [0.7, 1.2], [0.7, 0.85], [0.25, 0.85], [0.25, 0]];

  function orthogonalLab(root) {
    const lab = labShell(root, {
      kind: "orthogonal-transform",
      title: "保持全部长度与夹角的线性变换",
      task: "选一个矩阵，看单位圆、小旗和两个可拖动的向量 x、y 的像。读数精确比较变换前后的长度平方和内积。",
    });
    const toolbar = el("div", "ch9l-toolbar");
    lab.append(toolbar);
    const { stage, side } = stageLayout(lab);
    const plane = P().create(stage, { range: 2.5, label: "单位圆与小旗在变换下的像", hint: "拖动圆点改变 x、y" });
    lab.ch9Views = { plane };
    const info = el("div", "ch9l-card");
    info.dataset.ch9Readout = "ortho";
    const gateHost = el("div");
    const result = resultBox(
      `<p>保持内积 ⇔ 保持长度 ⇔ 把标准正交基变成标准正交基 ⇔ 矩阵满足 ${tex("Q^TQ=E")}。${tex("\\det Q=\\pm1")} 只是必要条件：${tex("\\operatorname{diag}(2,\\tfrac12)")} 保持面积，却把 ${tex("\\varepsilon_1")} 拉长一倍。${tex("\\det Q=1")} 的是旋转（第一类），${tex("\\det Q=-1")} 的是反射（第二类）。</p>`,
    );
    side.append(info, gateHost, result);
    // the lab opens on the matrix the question asks about
    const state = { key: "squeeze", x: [1.5, 0.5], y: [0, 1], revealed: false };

    /*
     * Equal-length ticks and matching angle arcs: x and Qx carry one tick, y and
     * Qy two, the image carrying them only when the length is kept exactly; the
     * arc of ∠(Qx,Qy) is solid when it equals ∠(x,y) and dashed otherwise.
     */
    function marks(Q, ap) {
      const x = toF(state.x);
      const y = toF(state.y);
      const Qx = M().matVec(Q, x);
      const Qy = M().matVec(Q, y);
      const [nx, ny, mx, my] = [dotF(x, x), dotF(y, y), dotF(Qx, Qx), dotF(Qy, Qy)];
      const keepX = M().eq(nx, mx);
      const keepY = M().eq(ny, my);
      const objs = [];
      if (!M().isZero(nx)) {
        objs.push({ type: "ticks", a: [0, 0], b: state.x, n: 1, color: "v1", at: 0.55 });
        if (keepX) objs.push({ type: "ticks", a: [0, 0], b: ap(state.x), n: 1, color: "image", at: 0.55 });
      }
      if (!M().isZero(ny)) {
        objs.push({ type: "ticks", a: [0, 0], b: state.y, n: 2, color: "v2", at: 0.55 });
        if (keepY) objs.push({ type: "ticks", a: [0, 0], b: ap(state.y), n: 2, color: "image", at: 0.55 });
      }
      let sameAngle = false;
      const hasAngle = [nx, ny, mx, my].every((v) => !M().isZero(v));
      if (hasAngle) {
        const a = dotF(x, y);
        const b = dotF(Qx, Qy);
        // cos∠(x,y) = cos∠(Qx,Qy) exactly: same sign and a²·|Qx|²|Qy|² = b²·|x|²|y|²
        sameAngle = Math.sign(a.n) === Math.sign(b.n) && M().eq(M().mul(M().mul(a, a), M().mul(mx, my)), M().mul(M().mul(b, b), M().mul(nx, ny)));
        objs.push({ type: "arc", from: state.x, to: state.y, r: 22, color: "axis", width: 1.5 });
        objs.push({ type: "arc", from: ap(state.x), to: ap(state.y), r: 34, color: "image", width: 1.8, dash: sameAngle ? undefined : [3, 4] });
      }
      return { objs, keepX, keepY, sameAngle, hasAngle };
    }

    function redraw() {
      const Q = matF(ORTHO_PRESETS[state.key].Q);
      const Qn = matN(Q);
      const ap = (p) => [Qn[0][0] * p[0] + Qn[0][1] * p[1], Qn[1][0] * p[0] + Qn[1][1] * p[1]];
      const QtQ = matMulF(transposeF(Q), Q);
      const orth = isIdentity(QtQ);
      const det = det2(Q);
      const circle = P().conic([[1, 0], [0, 1]]);
      let mirror = null;
      if (orth && det.n < 0) {
        const ns = M().nullspaceBasis([[M().sub(Q[0][0], F(1)), Q[0][1]], [Q[1][0], M().sub(Q[1][1], F(1))]]).basis;
        if (ns.length) mirror = toN(ns[0]);
      }
      plane.setObjects(() => {
        const objs = [
          { type: "curve", pts: circle, closed: true, color: "axis", dash: [5, 5], width: 1.3 },
          { type: "polygon", pts: FLAG, color: "axis", fillAlpha: 0.06, width: 1, dash: [4, 4] },
          // Highlight when orthogonal: the same colour with a glow.
          ...(orth ? [{ type: "curve", pts: circle.map((p) => p && ap(p)), closed: true, color: "image", width: 8, alpha: 0.18 }] : []),
          { type: "curve", pts: circle.map((p) => p && ap(p)), closed: true, color: "image", width: 2.6 },
          { type: "polygon", pts: FLAG.map(ap), color: "image", fillAlpha: 0.16, width: 1.6 },
        ];
        if (mirror) objs.push({ type: "line", dir: mirror, color: "subspace", dash: [7, 5], width: 1.6, label: "反射轴" });
        const mk = state.revealed ? marks(Q, ap) : null;
        if (mk) objs.push(...mk.objs.filter((o) => o.type === "arc"));
        objs.push({ type: "arrow", to: state.x, color: "v1", width: 1.8, alpha: 0.7, label: "x" });
        objs.push({ type: "arrow", to: state.y, color: "v2", width: 1.8, alpha: 0.7, label: "y" });
        objs.push({ type: "arrow", to: ap(state.x), color: "image", width: 3, label: "Qx" });
        objs.push({ type: "arrow", to: ap(state.y), color: "image", width: 3, label: "Qy" });
        if (mk) objs.push(...mk.objs.filter((o) => o.type === "ticks"));
        return objs;
      });
      const x = toF(state.x);
      const y = toF(state.y);
      const Qx = M().matVec(Q, x);
      const Qy = M().matVec(Q, y);
      const cmp = (a, b) => (M().eq(a, b) ? "=" : "\\ne");
      let verdict;
      if (orth) verdict = `<p class="ch9l-ok" data-ortho-status>${tex("Q^TQ=E")}，正交变换，${det.n > 0 ? "第一类（旋转）" : "第二类（关于绿色虚线的反射）"}。</p>`;
      else {
        const c1 = [Q[0][0], Q[1][0]];
        const c2 = [Q[0][1], Q[1][1]];
        verdict = `<p class="ch9l-bad" data-ortho-status>${tex("Q^TQ\\ne E")}：列向量 ${tex(`|q_1|^2=${lf(dotF(c1, c1))},\\ |q_2|^2=${lf(dotF(c2, c2))},\\ (q_1,q_2)=${lf(dotF(c1, c2))}`)}，不是正交变换。</p>`;
      }
      // before the reveal the asked matrix shows only Q and det Q: the comparisons would answer the question
      if (state.key === "squeeze" && !state.revealed) {
        info.innerHTML = `<h4>当前读数</h4>
        <p>${tex(`Q=${M().latexMatrix(Q)},\\ \\det Q=${lf(det)}`)}</p>
        <p class="ch9l-muted" data-ortho-wait>先猜一猜，再看长度与内积的比较。</p>`;
        return;
      }
      info.innerHTML = `<h4>当前读数</h4>
        <p>${tex(`Q=${M().latexMatrix(Q)},\\ \\det Q=${lf(det)}`)}</p>
        <p>${tex(`Q^TQ=${M().latexMatrix(QtQ)}`)}</p>
        <p>${tex(`|x|^2=${lf(dotF(x, x))}\\ ${cmp(dotF(x, x), dotF(Qx, Qx))}\\ |Qx|^2=${lf(dotF(Qx, Qx))}`)}</p>
        <p>${tex(`(x,y)=${lf(dotF(x, y))}\\ ${cmp(dotF(x, y), dotF(Qx, Qy))}\\ (Qx,Qy)=${lf(dotF(Qx, Qy))}`)}</p>
        ${verdict}${state.revealed ? marksNote(marks(Q, () => [0, 0])) : ""}`;
    }

    function marksNote(mk) {
      const len = mk.keepX && mk.keepY ? "Qx、Qy 带着与 x、y 相同的刻痕：长度不变" : "像上缺了刻痕：有长度被改变";
      const ang = !mk.hasAngle ? "零向量没有夹角" : mk.sameAngle ? "两段弧都是实线：夹角不变" : "紫色弧是虚线：夹角变了";
      return `<p class="ch9l-muted" data-ortho-marks>${len}；${ang}。</p>`;
    }

    /*
     * The question is about diag(2,½): only an action on that matrix grades the guess
     * (dragging x or y, or coming back to it). The other matrices can be explored first;
     * the guess stays.
     */
    const actedOnAsked = () => {
      if (state.key === "squeeze") gate.act();
    };
    chips(toolbar, Object.entries(ORTHO_PRESETS).map(([k, p]) => [k, p.label]), (k) => {
      state.key = k;
      redraw();
      actedOnAsked();
    }, state.key);
    plane.setHandles([
      { color: "drag", snap: 0.5, clampX: [-2, 2], clampY: [-2, 2], get: () => state.x, set: (p) => ((state.x = p), redraw(), actedOnAsked()) },
      { color: "drag", snap: 0.5, clampX: [-2, 2], clampY: [-2, 2], get: () => state.y, set: (p) => ((state.y = p), redraw(), actedOnAsked()) },
    ]);
    const gate = predictGate(
      gateHost,
      {
        question: `${tex("A=\\operatorname{diag}(2,\\tfrac12)")} 的行列式为 1，它保持面积。A 是正交变换吗？`,
        options: [
          { text: `不是：它把 ${tex("\\varepsilon_1")} 拉长到长度 2`, correct: true },
          { text: "是：行列式为 1 的变换都是旋转", why: `行列式为 1 只说明面积不变。在 ${tex("\\operatorname{diag}(2,\\tfrac12)")} 下，单位圆变成了椭圆，长度被改变。` },
          { text: "是：单位圆的像面积不变", why: "面积不变，形状却变了：长度和夹角都可能改变。" },
          { text: "要看 x 取在哪里", why: "正交变换要求对所有 x 保持长度；只要有一个 x 被拉长就不是。" },
        ],
        right: `单位圆变成半轴为 2 和 ${tex("\\tfrac12")} 的椭圆；${tex("Q^TQ=\\operatorname{diag}(4,\\tfrac14)\\ne E")}，长度被改变：缺了刻痕的像，长度与原来不同。`,
        manual: true,
        actHint: "记下了你的猜测。在这个矩阵下拖动 x 或 y，结论随后出现。",
      },
      () => {
        state.revealed = true;
        result.hidden = false;
        redraw();
      },
    );
    redraw();
    return () => plane.destroy();
  }

  /* ================= §5 子空间：正交补与正交分解 ================= */

  const SUB_PRESETS = {
    plane: { label: "W 是平面", w: [[1, 1, 0], [0, 1, 1]] },
    line: { label: "W 是直线", w: [[1, 0, 1]] },
  };

  function complementLab(root) {
    const lab = labShell(root, {
      kind: "orthogonal-complement",
      title: "W 与它的正交补 W⊥",
      task: "W 由 w₁（和 w₂）张成，三个圆点都能拖动（每次半格）。猜过并动手操作后，图中出现 W⊥，以及 α 沿 W 与 W⊥ 的分解。",
    });
    const toolbar = el("div", "ch9l-toolbar");
    lab.append(toolbar);
    const { stage, side } = stageLayout(lab);
    const scene = S().create(stage, { range: 2.5, label: "子空间 W 与正交补", yaw: 0.8, pitch: 0.3, hint: "拖动空白处旋转 · 拖动圆点改变 w、α", clampLabels: true });
    lab.ch9Views = { scene };
    const tools = el("div", "ch9l-actions");
    tools.innerHTML = `${btn("沿 W⊥ 看", "data-sub-look")}${btn("侧面看 W", "data-sub-side")}${btn("默认视角", "data-sub-reset")}`;
    const info = el("div", "ch9l-card");
    info.dataset.ch9Readout = "sub";
    const gateHost = el("div");
    const result = resultBox(
      `<p>${tex("W^\\perp")} 由与 W 的每个生成元都正交的向量组成，就是齐次方程组 ${tex("w_i^TX=0")} 的解空间。于是 ${tex("\\dim W+\\dim W^\\perp=3")}，${tex("V=W\\oplus W^\\perp")}：每个 α 唯一地写成 ${tex("\\alpha_1+\\alpha_2")}，${tex("\\alpha_1\\in W")} 叫 α 在 W 上的内射影。拖动 w₁、w₂，W⊥ 始终跟着保持垂直。</p>`,
    );
    side.append(tools, info, gateHost, result);
    const state = { key: "plane", w: SUB_PRESETS.plane.w.map((v) => v.slice()), alpha: [0.5, -1.5, 2], revealed: false };

    function compute() {
      const ws = state.w.map(toF).filter((v) => !isZeroVec(v));
      const r = ws.length ? M().rankOf(transposeF(ws)) : 0;
      const idx = ws.length ? M().independentColumnIndices(transposeF(ws)) : [];
      const basis = idx.map((i) => ws[i]);
      const perp = ws.length ? M().nullspaceBasis(ws).basis : [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map(toF);
      const alpha = toF(state.alpha);
      let a1 = [ZERO(), ZERO(), ZERO()];
      if (basis.length) {
        const gram = basis.map((u) => basis.map((v) => dotF(u, v)));
        const rhs = basis.map((u) => dotF(u, alpha));
        const c = M().particularSolution(gram.map((row, i) => [...row, rhs[i]])).x;
        a1 = basis.reduce((s, v, i) => addF(s, scaleF(c[i], v)), a1);
      }
      return { ws, r, basis, perp, alpha, a1, a2: subF(alpha, a1) };
    }

    function normalOf(c) {
      if (c.r === 2) return V3().cross(toN(c.basis[0]), toN(c.basis[1]));
      if (c.r === 1) return toN(c.basis[0]);
      return [0, 0, 1];
    }

    /*
     * α₂ ⊥ W at the foot α₁: a right-angle mark with each of two orthogonal
     * directions of W (one when W is a line), and a small tile of W under it.
     */
    function footMark(c, a1, a2) {
      const V = V3();
      if (!c.r) return [];
      const u = V.norm(V.len(a1) > 1e-9 ? a1 : toN(c.basis[0]));
      const s = 0.36;
      const objs = [...rightAngle3(a1, u, a2, s)];
      if (c.r === 2) {
        const v = V.norm(V.cross(normalOf(c), u));
        objs.push(...rightAngle3(a1, v, a2, s));
        const P = (x, y) => V.add(a1, V.add(V.mul(u, x), V.mul(v, y)));
        objs.push({ type: "polygon", pts: [P(0, 0), P(s, 0), P(s, s), P(0, s)], color: "subspace", alpha: 0.45, strokeAlpha: 0.9 });
      }
      return objs.map((o) => (o.type === "segment" ? { ...o, width: 1.8 } : o));
    }

    function redraw() {
      const V = V3();
      const c = compute();
      const a1 = toN(c.a1);
      const a2 = toN(c.a2);
      scene.setObjects(() => {
        const objs = [];
        if (c.r === 2) objs.push({ type: "plane", n: normalOf(c), d: 0, color: "subspace", alpha: 0.14, label: "W" });
        if (c.r === 1) objs.push({ type: "line", dir: toN(c.basis[0]), color: "subspace", width: 2.6, label: "W" });
        if (state.revealed) {
          if (c.perp.length === 1) objs.push({ type: "line", dir: toN(c.perp[0]), color: "v2", width: 2.6, label: "W⊥" });
          if (c.perp.length === 2) objs.push({ type: "plane", n: V.cross(toN(c.perp[0]), toN(c.perp[1])), d: 0, color: "v2", alpha: 0.12, label: "W⊥" });
        }
        state.w.forEach((w, i) => {
          if (state.key === "line" && i > 0) return;
          objs.push({ type: "arrow", to: w, color: "subspace", width: 2, alpha: 0.75, label: `w${"₁₂"[i]}` });
        });
        objs.push({ type: "arrow", to: state.alpha, color: "drag", width: 3.2, label: "α" });
        if (state.revealed) {
          if (V.len(a1) > 1e-9) objs.push({ type: "arrow", to: a1, color: "image", width: 3, label: "α₁" });
          if (V.len(a2) > 1e-9) {
            objs.push({ type: "arrow", from: a1, to: state.alpha, color: "v2", width: 3, label: "α₂" });
            objs.push({ type: "segment", a: [0, 0, 0], b: a2, color: "v2", dash: [4, 4], width: 1.4 });
            objs.push({ type: "segment", a: a2, b: state.alpha, color: "image", dash: [4, 4], width: 1.4 });
            objs.push(...footMark(c, a1, a2));
          }
        }
        // every name goes where it stays clear of the other strokes, points and handles
        const handles = [state.alpha, ...state.w.filter((w, i) => w && !(state.key === "line" && i > 0))];
        return window.Ch6Kit?.placeLabels ? window.Ch6Kit.placeLabels(scene, objs, { handles }) : objs;
      });
      scene.setHandles([
        { color: "drag", snap: 0.5, get: () => state.alpha, set: (p) => ((state.alpha = p), redraw(), actedOnAsked()) },
        ...state.w.map((_, i) => ({ color: "drag", snap: 0.5, hidden: () => !state.w[i], get: () => state.w[i] || [0, 0, 0], set: (p) => ((state.w[i] = p), redraw()) })),
      ]);

      // one relation per line; a mark after a formula stays outside it and on its line
      const rows = (list, attr = "") => `<p class="ch9l-lines"${attr}>${list.map((r) => `<span>${r}</span>`).join("")}</p>`;
      const lines = [`<h4>当前读数</h4>`];
      lines.push(rows([keep(`${tex(`W=\\operatorname{span}\\{${c.ws.map(vtex).join(",") || "0"}\\}`)}，`), tex(`\\dim W=${c.r}`)]));
      if (state.revealed) {
        lines.push(rows([keep(`${tex(`W^\\perp=\\operatorname{span}\\{${c.perp.map(vtex).join(",") || "0"}\\}`)}，`), tex(`\\dim W^\\perp=${c.perp.length}`)], " data-sub-perp"));
        lines.push(rows([tex("\\alpha=\\alpha_1+\\alpha_2"), tex(`\\phantom{\\alpha}=${vtex(c.a1)}+${vtex(c.a2)}`)], " data-sub-split"));
        const checks = c.basis.map((b) => lf(dotF(c.a2, b)));
        if (checks.length) lines.push(`<p class="ch9l-ok ch9l-lines">${checks.map((v, i) => `<span>${keep(`${tex(`(\\alpha_2,${vtex(c.basis[i])})=${v}`)}${i < checks.length - 1 ? "，" : "，"}`)}</span>`).join("")}<span>${keep(`所以 ${tex("\\alpha_2\\in W^\\perp")}。`)}</span></p>`);
        lines.push(`<p class="ch9l-muted">${tex(`\\dim W+\\dim W^\\perp=${c.r}+${c.perp.length}=${c.r + c.perp.length}`)}</p>`);
      } else {
        lines.push(`<p class="ch9l-muted">猜过并动手操作后，显示 W⊥ 和 α 的分解。</p>`);
      }
      info.innerHTML = lines.join("");
      tools.querySelector("[data-sub-look]").textContent = c.r === 1 ? "沿 W 看" : "沿 W⊥ 看";
    }

    chips(toolbar, Object.entries(SUB_PRESETS).map(([k, p]) => [k, p.label]), (k) => {
      state.key = k;
      state.w = SUB_PRESETS[k].w.map((v) => v.slice());
      redraw();
      actedOnAsked();
    }, state.key);
    tools.querySelector("[data-sub-look]").addEventListener("click", () => scene.lookAlong(normalOf(compute())));
    tools.querySelector("[data-sub-side]").addEventListener("click", () => {
      const c = compute();
      scene.lookAlong(c.basis.length ? toN(c.basis[0]) : [1, 0, 0]);
    });
    tools.querySelector("[data-sub-reset]").addEventListener("click", () => scene.resetView());
    /*
     * The question is about W = span{(1,1,0),(0,1,1)}: an action grades the guess only
     * while that W is on screen (dragging α, or coming back to the plane preset). Moving
     * w₁, w₂ or picking the line explores freely; the guess stays.
     */
    const askedW = SUB_PRESETS.plane.w;
    function actedOnAsked() {
      const same = state.key === "plane" && state.w.length === askedW.length && state.w.every((w, i) => w && w.every((x, k) => x === askedW[i][k]));
      if (same) gate.act();
    }
    const gate = predictGate(
      gateHost,
      {
        question: `${tex("W=\\operatorname{span}\\{(1,1,0),(0,1,1)\\}")} 是一个平面。它的正交补 ${tex("W^\\perp")} 是什么？`,
        options: [
          { text: `过原点、方向为 ${tex("(1,-1,1)")} 的直线`, correct: true },
          { text: `方向为 ${tex("(1,2,1)")} 的直线`, why: `${tex("(1,2,1)=w_1+w_2")} 在 W 里面。` },
          { text: `方向为 ${tex("(1,1,1)")} 的直线`, why: `${tex("(1,1,1)\\cdot(1,1,0)=2\\ne0")}。` },
          { text: "另一个平面", why: "W⊥ 的维数是 3−2=1。" },
        ],
        right: `${tex("(1,-1,1)")} 与 ${tex("(1,1,0)")}、${tex("(0,1,1)")} 的内积都是 0。α 拆成 W 里的 α₁ 与 W⊥ 里的 α₂；在垂足 α₁ 处，α₂ 与 W 中两个互相垂直的方向都成直角。`,
        manual: true,
        actHint: "记下了你的猜测。在这个 W 下拖动 α，W⊥ 随后出现。",
      },
      () => {
        state.revealed = true;
        result.hidden = false;
        redraw();
      },
    );
    redraw();
    return () => scene.destroy();
  }

  /* ================= §6 实对称矩阵：A = TΛTᵀ 三步 ================= */

  const SP_PRESETS = {
    pos: { label: tex("\\left[\\begin{smallmatrix}2&1\\\\1&2\\end{smallmatrix}\\right]"), A: [[2, 1], [1, 2]], eig: [[3, [1, 1]], [1, [-1, 1]]] },
    indef: { label: tex("\\left[\\begin{smallmatrix}1&2\\\\2&-2\\end{smallmatrix}\\right]"), A: [[1, 2], [2, -2]], eig: [[2, [2, 1]], [-3, [-1, 2]]] },
    rep: { label: "重特征值 2E", A: [[2, 0], [0, 2]], eig: [[2, [1, 0]], [2, [0, 1]]] },
    nonsym: { label: "非对称 " + tex("\\left[\\begin{smallmatrix}2&1\\\\0&1\\end{smallmatrix}\\right]"), A: [[2, 1], [0, 1]], eig: [[2, [1, 0]], [1, [1, -1]]] },
  };

  function spectralLab(root) {
    const lab = labShell(root, {
      kind: "spectral",
      title: "A = TΛTᵀ：转过去、伸缩、转回来",
      task: "拖动进度条或点“播放”。单位圆和两条特征方向依次经过 Tᵀ（转到坐标轴）、Λ（沿坐标轴伸缩）、T（转回原位），最后与 A 直接作用的结果重合。",
    });
    const toolbar = el("div", "ch9l-toolbar");
    lab.append(toolbar);
    const { stage, side } = stageLayout(lab);
    const plane = P().create(stage, { range: 3.2, label: "单位圆在 Tᵀ、Λ、T 下的变化", hint: "" });
    lab.ch9Views = { plane };
    const ctrl = el("div", "ch9l-card");
    ctrl.innerHTML = `<div class="ch9l-steps" data-sp-steps></div>
      <label class="ch9l-range"><span>进度</span><input type="range" min="0" max="3" step="0.01" value="0" data-sp-s /><b data-sp-sv>起点</b></label>
      <div class="ch9l-actions">${btn("播放", "data-sp-play", "is-primary")}${btn("回到起点", "data-sp-zero")}</div>`;
    const info = el("div", "ch9l-card");
    info.dataset.ch9Readout = "sp";
    const gateHost = el("div");
    const result = resultBox(
      `<p>实对称矩阵的特征向量可以取成两两正交的单位向量，排成正交矩阵 T，于是 ${tex("T^TAT=\\Lambda")}，即 ${tex("A=T\\Lambda T^T")}。单位圆的像是椭圆，主轴就是特征方向，半轴长是 ${tex("|\\lambda_i|")}；负特征值让那个方向反向。非对称的 ${tex("\\left[\\begin{smallmatrix}2&1\\\\0&1\\end{smallmatrix}\\right]")} 也有两个特征方向，但它们夹 45°，不能用正交矩阵对角化。</p>`,
    );
    side.append(ctrl, info, gateHost, result);
    const state = { key: "pos", s: 0, picked: false, revealed: false };
    let anim = 0;

    const rot = (t) => [[Math.cos(t), -Math.sin(t)], [Math.sin(t), Math.cos(t)]];
    const mul = (A, B) => [
      [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
      [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
    ];
    const ap = (A, p) => [A[0][0] * p[0] + A[0][1] * p[1], A[1][0] * p[0] + A[1][1] * p[1]];

    function exact() {
      const pre = SP_PRESETS[state.key];
      const A = matF(pre.A);
      const sym = M().eq(A[0][1], A[1][0]);
      const eig = pre.eig.map(([l, v]) => ({ l: F(l), v: toF(v), ok: M().matVec(A, toF(v)).every((x, i) => M().eq(x, M().mul(F(l), toF(v)[i]))) }));
      const perp = M().isZero(dotF(eig[0].v, eig[1].v));
      return { pre, A, sym, eig, perp };
    }

    function transformAt(s, pre) {
      const v1 = unit2(pre.eig[0][1]);
      const th = Math.atan2(v1[1], v1[0]);
      const l1 = pre.eig[0][0];
      const l2 = pre.eig[1][0];
      const D = (t) => [[1 + (l1 - 1) * t, 0], [0, 1 + (l2 - 1) * t]];
      if (s <= 1) return rot(-th * s);
      if (s <= 2) return mul(D(s - 1), rot(-th));
      return mul(rot(th * (s - 2)), mul(D(1), rot(-th)));
    }

    function redraw() {
      const e = exact();
      const pre = e.pre;
      const circle = P().conic([[1, 0], [0, 1]]);
      const An = pre.A;
      plane.setObjects(() => {
        const objs = [{ type: "curve", pts: circle, closed: true, color: "axis", dash: [5, 5], width: 1.2 }];
        if (!e.sym) {
          objs.push({ type: "curve", pts: circle.map((p) => p && ap(An, p)), closed: true, color: "image", width: 2.6, fill: true, fillAlpha: 0.06 });
          pre.eig.forEach(([l, v]) => objs.push({ type: "line", dir: v, color: "subspace", dash: [6, 5], width: 1.6, label: `λ=${l}` }));
          return objs;
        }
        if (state.revealed) objs.push({ type: "curve", pts: circle.map((p) => p && ap(An, p)), closed: true, color: "image", dash: [3, 5], width: 1.6 });
        const T = transformAt(state.s, pre);
        objs.push({ type: "curve", pts: circle.map((p) => p && ap(T, p)), closed: true, color: "image", width: 2.8, fill: true, fillAlpha: 0.07 });
        if (state.revealed)
          pre.eig.forEach(([l, v], i) => {
            const tip = ap(T, unit2(v));
            objs.push({ type: "arrow", to: tip, color: i ? "v2" : "v1", width: 3, label: `q${"₁₂"[i]}` });
            // once Λ has acted, the arrow is a semi-axis of the ellipse: its length is |λ|.
            // The other half of that axis is drawn dashed and carries the length.
            if (state.s >= 2) {
              const back = [-tip[0], -tip[1]];
              const len = Math.hypot(tip[0], tip[1]) || 1;
              const side = [(-tip[1] / len) * 0.3, (tip[0] / len) * 0.3];
              objs.push({ type: "segment", a: [0, 0], b: back, color: i ? "v2" : "v1", dash: [5, 4], width: 1.4, alpha: 0.6 });
              objs.push({ type: "label", p: [back[0] / 2 + side[0], back[1] / 2 + side[1]], text: `半轴长 ${Math.abs(l)}`, color: i ? "v2" : "v1", align: "center", dx: 0, dy: 0, font: "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" });
            }
          });
        return objs;
      });
      const stepIdx = state.s < 1 ? 0 : state.s < 2 ? 1 : 2;
      ctrl.querySelector("[data-sp-steps]").innerHTML = ["① Tᵀ：特征方向转到坐标轴", "② Λ：沿坐标轴伸缩", "③ T：转回原位"]
        .map((t, i) => `<span class="${!e.sym ? "" : i === stepIdx ? "is-active" : i < stepIdx ? "is-done" : ""}">${t}</span>`)
        .join("");
      // the progress bar is a playback position: name the step it shows instead of a decimal
      ctrl.querySelector("[data-sp-sv]").textContent = state.s <= 0 ? "起点" : state.s >= 3 ? "完成" : "①②③"[stepIdx];
      ctrl.querySelector("[data-sp-s]").value = String(state.s);
      // Playing the steps would draw the answer, so it waits for the prediction.
      ctrl.querySelectorAll("input,button").forEach((x) => (x.disabled = !e.sym || !state.picked));

      const lines = [`<h4>当前读数</h4>`, `<p>${tex(`A=${M().latexMatrix(e.A)}`)}${e.sym ? "，对称" : `，${tex("A^T\\ne A")}`}</p>`];
      if (!state.revealed) {
        lines.push(`<p class="ch9l-muted">先猜一猜椭圆长轴的方向，再播放三步。</p>`);
        info.innerHTML = lines.join("");
        return;
      }
      e.eig.forEach((x, i) => lines.push(`<p>${tex(`A${vtex(x.v)}=${lf(x.l)}\\cdot${vtex(x.v)}`)}${x.ok ? "" : "（核对失败）"}</p>`));
      lines.push(
        e.perp
          ? `<p class="ch9l-ok" data-sp-status>${tex(`(${vtex(e.eig[0].v)},${vtex(e.eig[1].v)})=0`)}：两条特征方向正交。</p>`
          : `<p class="ch9l-bad" data-sp-status>${tex(`(${vtex(e.eig[0].v)},${vtex(e.eig[1].v)})=${lf(dotF(e.eig[0].v, e.eig[1].v))}\\ne0`)}：特征方向不正交，不存在正交矩阵 T 使 ${tex("T^TAT")} 为对角形。</p>`,
      );
      if (e.sym) {
        const n1 = lf(dotF(e.eig[0].v, e.eig[0].v));
        const Tl = `\\tfrac{1}{\\sqrt{${n1}}}\\begin{bmatrix}${lf(e.eig[0].v[0])}&${lf(e.eig[1].v[0])}\\\\${lf(e.eig[0].v[1])}&${lf(e.eig[1].v[1])}\\end{bmatrix}`;
        lines.push(`<p>${tex(`T=${n1 === "1" ? Tl.replace("\\tfrac{1}{\\sqrt{1}}", "") : Tl},\\ \\Lambda=\\operatorname{diag}(${lf(e.eig[0].l)},${lf(e.eig[1].l)})`)}</p>`);
      }
      info.innerHTML = lines.join("");
    }

    function play() {
      cancelAnimationFrame(anim);
      const start = state.s >= 2.999 ? 0 : state.s;
      if (P().reduceMotion()) {
        state.s = 3;
        redraw();
        return;
      }
      const t0 = performance.now();
      const dur = (3 - start) * 1100;
      const step = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        state.s = start + (3 - start) * t;
        if (t >= 1) state.s = 3;
        redraw();
        if (t < 1) anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    }

    chips(toolbar, Object.entries(SP_PRESETS).map(([k, p]) => [k, p.label]), (k) => {
      cancelAnimationFrame(anim);
      state.key = k;
      state.s = 0;
      redraw();
    }, state.key);
    ctrl.querySelector("[data-sp-s]").addEventListener("input", (ev) => {
      cancelAnimationFrame(anim);
      state.s = Number(ev.target.value);
      redraw();
    });
    ctrl.querySelector("[data-sp-play]").addEventListener("click", play);
    ctrl.querySelector("[data-sp-zero]").addEventListener("click", () => {
      cancelAnimationFrame(anim);
      state.s = 0;
      redraw();
    });
    predictGate(
      gateHost,
      {
        question: `${tex("A=\\left[\\begin{smallmatrix}2&1\\\\1&2\\end{smallmatrix}\\right]")} 把单位圆变成椭圆。椭圆的长轴沿哪个方向？长半轴多长？`,
        options: [
          { text: `沿 ${tex("(1,1)")}，长 3`, correct: true },
          { text: `沿 ${tex("(1,0)")}，长 2`, why: `${tex("A(1,0)=(2,1)")}，方向变了，(1,0) 不是主轴。` },
          { text: `沿 ${tex("(2,1)")}，长 ${tex("\\sqrt5")}`, why: `${tex("(2,1)=A\\varepsilon_1")} 只是椭圆上的一点，不在主轴上。` },
          { text: `沿 ${tex("(1,-1)")}，长 1`, why: "那是短轴：λ=1 的特征方向。" },
        ],
        right: `${tex("(1,1)")} 是属于 3 的特征向量，${tex("(-1,1)")} 是属于 1 的特征向量，两者正交。播放三步，紫色虚线是 A 直接作用的结果。`,
        actHint: "记下了你的猜测。播放三步或拖动进度条，结论随后出现。",
        onPick: () => {
          state.picked = true;
          redraw();
        },
      },
      () => {
        state.revealed = true;
        result.hidden = false;
        redraw();
      },
    );
    redraw();
    return () => {
      cancelAnimationFrame(anim);
      plane.destroy();
    };
  }

  /* ================= §7 最小二乘：b 投影到列空间 ================= */

  const LS_A = [[1, 0], [1, 1], [1, 2]];

  function leastSquaresLab(root) {
    const lab = labShell(root, {
      kind: "least-squares",
      title: "离 b 最近的 Ax：投影与拟合直线是同一件事",
      task: `用直线 ${tex("y=C+Dt")} 拟合 ${tex("t=0,1,2")} 处的三个数据 ${tex("b_1,b_2,b_3")}。左图：${tex("b\\in\\mathbb R^3")} 与 A 的列空间（平面）。右图：数据点与直线。两图联动，可以拖动 b 或数据点，也可以调 C、D 试一条直线。`,
    });
    const pair = el("div", "ch9l-pair");
    const left = el("div", "ch9l-view", `<div class="ch9l-view-title">${tex("\\mathbb R^3")}：b 与列空间 W</div>`);
    const right = el("div", "ch9l-view", `<div class="ch9l-view-title">数据点与直线 ${tex("y=C+Dt")}</div>`);
    pair.append(left, right);
    lab.append(pair);
    const scene = S().create(left, { range: 3.5, label: "b 在列空间上的投影", yaw: 0.3, pitch: 0.35, axisNames: ["b₁", "b₂", "b₃"], hint: "拖动 b 或旋转", spreadLabels: true });
    const fit = P().create(right, { bounds: { x: [-0.5, 2.6], y: [-3.8, 3.8] }, equal: false, label: "数据点与拟合直线", hint: "上下拖动数据点", axisNames: ["t", "y"], ticks: 1, grid: true });
    lab.ch9Views = { scene, fit };
    const controls = el("div", "ch9l-controls");
    controls.innerHTML = `<label class="ch9l-range"><span>${tex("C")}</span><input type="range" min="-4" max="4" step="0.5" value="0" data-ls-c /><b data-ls-cv>0</b></label>
      <label class="ch9l-range"><span>${tex("D")}</span><input type="range" min="-4" max="4" step="0.5" value="1" data-ls-d /><b data-ls-dv>1</b></label>
      <div class="ch9l-actions">${btn("看直角三角形", "data-ls-triview")}${btn("沿 e 的方向看", "data-ls-look")}${btn("沿平面看", "data-ls-side")}${btn("默认视角", "data-ls-reset")}</div>`;
    const status = el("div", "ch9l-status");
    status.dataset.ch9Readout = "ls";
    const gateHost = el("div");
    const result = resultBox(
      `<p>Ax 走遍平面 W。离 b 最近的点 ${tex("p=A\\hat x")} 是 b 在 W 上的内射影，误差 ${tex("e=b-A\\hat x")} 垂直于 W，也就垂直于 A 的两列：${tex("A^Te=0")}，即 ${tex("A^TA\\hat x=A^Tb")}。对任何一条直线都有 ${tex("|b-Ax|^2=|e|^2+|p-Ax|^2")}，所以投影给出的直线残差平方和最小。在右图里，${tex("e\\perp(1,1,1)")} 说明残差之和为 0，${tex("e\\perp(0,1,2)")} 说明 ${tex("\\sum t_ie_i=0")}。</p>`,
    );
    lab.append(controls, status, gateHost, result);
    const A = matF(LS_A);
    const At = transposeF(A);
    const state = { b: [3, 0, 3], C: 0, D: 1, revealed: false };
    const V = () => V3();

    function solve() {
      const b = toF(state.b);
      const AtA = matMulF(At, A);
      const Atb = M().matVec(At, b);
      const xh = M().particularSolution(AtA.map((r, i) => [...r, Atb[i]])).x;
      const p = M().matVec(A, xh);
      const e = subF(b, p);
      const xc = toF([state.C, state.D]);
      const Ax = M().matVec(A, xc);
      return { b, AtA, Atb, xh, p, e, xc, Ax, sse: dotF(subF(b, Ax), subF(b, Ax)), best: dotF(e, e), gap: dotF(subF(p, Ax), subF(p, Ax)) };
    }

    function redraw() {
      const s = solve();
      const p = toN(s.p);
      const Ax = toN(s.Ax);
      const n = [1, -2, 1];
      scene.setObjects(() => {
        const objs = [
          // the plane's name sits on the far side of the origin, away from b, p and Ax
          { type: "plane", n, d: 0, color: "subspace", alpha: 0.12, label: "W=列空间", labelAt: [-1.6, -1.6, -1.6] },
          { type: "arrow", to: [1, 1, 1], color: "subspace", width: 1.8, alpha: 0.7, label: "a₁" },
          { type: "arrow", to: [0, 1, 2], color: "subspace", width: 1.8, alpha: 0.7, label: "a₂" },
          { type: "point", p: Ax, color: "image", r: 5, hollow: true, label: "Ax" },
          state.revealed ? null : { type: "segment", a: state.b, b: Ax, color: "axis", dash: [4, 5], width: 1.4 },
          { type: "arrow", to: state.b, color: "drag", width: 3, label: "b" },
        ];
        if (state.revealed) {
          objs.push({ type: "arrow", to: p, color: "image", width: 3, label: "p" });
          const eLen = V().len(V().sub(state.b, p));
          const gLen = V().len(V().sub(Ax, p));
          // the right triangle b–p–Ax: legs e (⊥ W) and p−Ax (in W), hypotenuse b−Ax
          if (eLen > 1e-9 && gLen > 1e-9) {
            objs.push({ type: "polygon", pts: [state.b, p, Ax], color: "image", alpha: 0.1, strokeAlpha: 0, keepClear: true });
            objs.push({ type: "segment", a: p, b: Ax, color: "image", width: 2.2 });
            objs.push({ type: "segment", a: state.b, b: Ax, color: "axis", width: 1.6 });
            objs.push(...rightAngle3(p, V().sub(state.b, p), V().sub(Ax, p), 0.32).map((o) => ({ ...o, width: 1.8 })));
          }
          if (eLen > 1e-9) {
            objs.push({ type: "arrow", from: p, to: state.b, color: "v2", width: 3, label: "e", labelAt: V().mul(V().add(p, state.b), 0.5) });
            if (gLen <= 1e-9) objs.push(...rightAngle3(p, V().len(p) > 1e-9 ? V().mul(p, -1) : [1, 1, 1], V().sub(state.b, p), 0.3));
          }
        }
        return objs;
      });
      scene.setHandles([{ color: "drag", snap: 0.5, get: () => state.b, set: (q) => ((state.b = q), redraw()) }]);
      const xh = toN(s.xh);
      fit.setObjects(() => {
        const objs = [{ type: "line", p: [0, state.C], dir: [1, state.D], color: "image", dash: [6, 5], width: 1.8, label: "试的直线" }];
        // residuals of the trial line: faint, in the colour of that line
        [0, 1, 2].forEach((t) => objs.push({ type: "segment", a: [t - 0.04, state.b[t]], b: [t - 0.04, Ax[t]], color: "image", width: 2, dash: [3, 3], alpha: 0.45 }));
        if (state.revealed) {
          objs.push({ type: "line", p: [0, xh[0]], dir: [1, xh[1]], color: "image", width: 2.6, label: "最佳直线" });
          [0, 1, 2].forEach((t) => objs.push({ type: "segment", a: [t + 0.04, state.b[t]], b: [t + 0.04, p[t]], color: "v2", width: 2.6 }));
        }
        return objs;
      });
      fit.setHandles([0, 1, 2].map((t) => ({
        color: "drag",
        snap: 0.5,
        axis: "y",
        clampY: [-3.5, 3.5],
        get: () => [t, state.b[t]],
        set: (q) => {
          state.b[t] = q[1];
          redraw();
        },
      })));
      controls.querySelector("[data-ls-cv]").innerHTML = texNum(state.C);
      controls.querySelector("[data-ls-dv]").innerHTML = texNum(state.D);
      const parts = [
        `<p>${tex(`b=${vtex(s.b)}`)}，试的直线 ${tex(`x=(C,D)=${vtex(s.xc)}`)}：${tex(`|b-Ax|^2=${lf(s.sse)}`)}</p>`,
        `<p>${tex(`A^TA=${M().latexMatrix(s.AtA)},\\ A^Tb=${vtex(s.Atb)}`)}</p>`,
      ];
      if (state.revealed) {
        parts.push(`<p data-ls-best>${tex(`\\hat x=${vtex(s.xh)},\\ p=A\\hat x=${vtex(s.p)},\\ e=${vtex(s.e)}`)}</p>`);
        parts.push(`<p class="ch9l-ok">${tex(`(e,a_1)=${lf(dotF(s.e, A.map((r) => r[0])))},\\ (e,a_2)=${lf(dotF(s.e, A.map((r) => r[1])))}`)}：e 垂直于 W。</p>`);
        parts.push(`<p data-ls-tri>${M().isZero(s.gap) || M().isZero(s.best) ? "" : "直角三角形 b–p–Ax（直角在 p）："}${tex(`|b-Ax|^2=${lf(s.sse)}=|e|^2+|p-Ax|^2=${lf(s.best)}+${lf(s.gap)}`)}</p>`);
        if (M().isZero(s.gap)) parts.push(`<p class="ch9l-ok">试的直线就是最佳直线。</p>`);
      } else parts.push(`<p class="ch9l-muted">调 C、D 让 ${tex("|b-Ax|^2")} 尽量小；猜过并动手操作后，显示最佳直线与投影。</p>`);
      status.innerHTML = parts.join("");
      controls.querySelector("[data-ls-triview]").disabled = !state.revealed;
    }

    /*
     * Zoom the view to b, p, Ax and the origin: the smallest range (within
     * limits) that keeps the four points inside the canvas.
     */
    function fitTriangle(animate = true) {
      const s = solve();
      const canvas = scene.element.querySelector("canvas");
      const rect = canvas?.getBoundingClientRect();
      if (!rect?.width) return;
      const o = scene.project([0, 0, 0]);
      let ratio = 0;
      [state.b, toN(s.p), toN(s.Ax)].forEach((q) => {
        const p = scene.project(q);
        ratio = Math.max(ratio, Math.abs(p.x - o.x) / (rect.width / 2), Math.abs(p.y - o.y) / (rect.height / 2));
      });
      if (!ratio) return;
      const target = Math.max(2, Math.min(3.5, (scene.range * ratio) / 0.9));
      scene.setRange(target, animate);
    }

    function lookAtTriangle() {
      const s = solve();
      const V = V3();
      const p = toN(s.p);
      let n = V.cross(V.sub(state.b, p), V.sub(toN(s.Ax), p));
      if (V.len(n) < 1e-9) n = [1, -2, 1];
      const c = scene.camera;
      const toViewer = [Math.cos(c.pitch) * Math.cos(c.yaw), Math.cos(c.pitch) * Math.sin(c.yaw), Math.sin(c.pitch)];
      if (V.dot(n, toViewer) < 0) n = V.mul(n, -1);
      scene.lookAlong(n, false);
      fitTriangle();
    }

    const cIn = controls.querySelector("[data-ls-c]");
    const dIn = controls.querySelector("[data-ls-d]");
    cIn.addEventListener("input", () => ((state.C = Number(cIn.value)), redraw()));
    dIn.addEventListener("input", () => ((state.D = Number(dIn.value)), redraw()));
    controls.querySelector("[data-ls-look]").addEventListener("click", () => scene.lookAlong([1, -2, 1]));
    controls.querySelector("[data-ls-side]").addEventListener("click", () => scene.lookAlong([1, 1, 1]));
    controls.querySelector("[data-ls-reset]").addEventListener("click", () => {
      scene.resetView(false);
      scene.setRange(3.5);
    });
    controls.querySelector("[data-ls-triview]").addEventListener("click", lookAtTriangle);
    cIn.addEventListener("change", () => state.revealed && fitTriangle());
    dIn.addEventListener("change", () => state.revealed && fitTriangle());
    predictGate(
      gateHost,
      {
        question: `数据点 ${tex("(0,3),(1,0),(2,3)")} 不在一条直线上。最佳直线对应的误差 ${tex("e=b-A\\hat x")} 有什么特点？`,
        options: [
          { text: `e 与 A 的两列 ${tex("(1,1,1)")}、${tex("(0,1,2)")} 都正交`, correct: true },
          { text: "e = 0", why: "三点不共线，b 不在列空间里，误差不可能为 0。" },
          { text: "e 与 b 正交", why: "与 e 正交的是 p=Ax̂，b 本身不一定。" },
          { text: "e 的三个分量相等", why: "那样 e 平行于 (1,1,1)，在平面 W 里，不会垂直于 W。" },
        ],
        right: `这里 ${tex("\\hat x=(2,0)")}，最佳直线是 ${tex("y=2")}，${tex("e=(1,-2,1)")}，正好沿 W 的法向。b、p、Ax 围成直角三角形，直角在 p：${tex("|b-Ax|^2=|e|^2+|p-Ax|^2")}，所以 Ax 取 p 时最小。`,
        defer: lab,
        actHint: "记下了你的猜测。调 C、D 或拖动 b，结论随后出现。",
      },
      () => {
        state.revealed = true;
        result.hidden = false;
        redraw();
        fitTriangle();
      },
    );
    redraw();
    return () => {
      scene.destroy();
      fit.destroy();
    };
  }

  /* ---------- formal sections ---------- */

  const FIGURES = {
    conjugate: `<figure class="ch9l-figure"><svg viewBox="0 0 320 220" role="img" aria-label="复平面上的 z 与共轭 z̄">
      <line x1="20" y1="110" x2="300" y2="110" class="ax" /><line x1="110" y1="12" x2="110" y2="208" class="ax" />
      <text x="268" y="128" class="t">实轴</text><text x="116" y="22" class="t">虚轴</text>
      <circle cx="110" cy="110" r="89.4" class="ring" />
      <line x1="110" y1="110" x2="190" y2="70" class="z" /><circle cx="190" cy="70" r="4.5" class="zp" />
      <line x1="110" y1="110" x2="190" y2="150" class="zb" /><circle cx="190" cy="150" r="4.5" class="zbp" />
      <line x1="190" y1="70" x2="190" y2="150" class="dash" />
      <text x="198" y="66" class="tz">z = 2 + i</text><text x="198" y="160" class="tzb">共轭 2 − i</text>
      <text x="22" y="204" class="t">(2 − i)(2 + i) = 5 = |z|²</text>
    </svg><figcaption>共轭把 z 关于实轴翻折，辐角正负抵消，${tex("\\bar zz=|z|^2")} 是非负实数。若不取共轭，${tex("z^2=3+4i")} 不是实数。</figcaption></figure>`,
  };

  function renderFormal(root, section) {
    const f = section.lesson9;
    if (!root || !f) return;
    root.innerHTML = `<h2>定理与方法</h2><div class="ch9l-formal">${f.figure ? FIGURES[f.figure] || "" : ""}${f.blocks
      .map((b) => `<article class="ch9l-theorem"><h3>${b.title}</h3>${b.tex ? `<div class="ch9l-theorem-math">${texD(b.tex)}</div>` : ""}${b.text ? `<p>${b.text}</p>` : ""}</article>`)
      .join("")}${f.pitfalls?.length ? `<div class="ch9l-pitfalls"><h3>容易错在哪里</h3><ul>${f.pitfalls.map((p) => `<li>${p}</li>`).join("")}</ul></div>` : ""}</div>`;
  }

  const LABS = {
    "inner-product-geometry": innerProductLab,
    "orthonormal-bases": gramSchmidtLab,
    "euclidean-isomorphism": isometryLab,
    "orthogonal-transformations": orthogonalLab,
    "orthogonal-subspaces": complementLab,
    "symmetric-canonical-form": spectralLab,
    "least-squares-distance": leastSquaresLab,
  };

  [...Object.keys(LABS), "unitary-spaces"].forEach((id) => {
    window.defineChapter9Renderer?.(id, {
      formal: (root, section) => renderFormal(root, section),
      interactive: (root, section, page) => {
        const lab = LABS[id];
        if (!root || !lab) return undefined;
        // Picture first: the lab sits above the theorem block.
        const formal = page?.querySelector(`#${CSS.escape(section.id)}-formal`);
        if (formal && formal.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING) formal.before(root);
        return lab(root);
      },
    });
  });
})();
