/*
 * Chapter 7 labs in the plane (plus the 3D eigen-plane view of §4):
 *   §3 matrix-of-linear-map   — the same σ recorded in two bases, B = X⁻¹AX
 *   §4 eigenvalues-eigenvectors — direction sweep in ℝ², eigen-plane in ℝ³
 *   §5 diagonal-matrices      — iterating x_{k+1} = A x_k, split into eigen-components
 * Every decision (diagonal or not, collinear or not, on an eigen-line or not)
 * is made with exact rationals; floats are only used for drawing.
 */
(() => {
  const K = window.Ch7Kit;
  if (!K) return;
  const { tex, texD, F, num, lf, el } = K;
  const M = () => window.Ch3Math;

  const fmt = (x, d = 2) => {
    const r = Math.round(x * 10 ** d) / 10 ** d;
    return Object.is(r, -0) || Math.abs(r) < 10 ** -(d + 1) ? "0" : String(r);
  };
  const vecText = (v, d = 2) => `(${v.map((x) => fmt(x, d)).join(", ")})`;
  const matNum = (A) => A.map((r) => r.map(num));
  const apply2 = (A, v) => [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];

  /* ================= §3 线性变换的矩阵 ================= */

  const BASIS_PRESETS = {
    stretch: {
      label: "两个伸缩方向",
      A: [[2, 1], [0, 3]],
      eigen: [[1, 0], [1, 1]],
      note: "σ 把直线 L((1,0)) 上的向量乘 2，把直线 L((1,1)) 上的向量乘 3。",
    },
    project: {
      label: "投影到直线 x₁+x₂=0",
      A: [["1/2", "-1/2"], ["-1/2", "1/2"]],
      eigen: [[1, -1], [1, 1]],
      note: "σ 保持直线 L((1,−1)) 上的向量，把直线 L((1,1)) 压成 0。",
    },
    shear: {
      label: "剪切",
      A: [[1, 1], [0, 1]],
      eigen: [[1, 0]],
      note: "σ 只保持 x₁ 轴这一条直线。",
    },
  };

  function basisLab(root) {
    const lab = K.labShell(root, {
      title: "同一个 σ，换一组基记录",
      task: "左图用标准基 ε₁, ε₂ 记录 σ，右图用你拖动的 η₁, η₂ 记录同一个 σ。紫色箭头是基向量的像，它在网格里的坐标就是矩阵的一列。",
    });
    const state = { key: "stretch", eta: [[1, 0.5], [-0.5, 1]] };
    const toolbar = el("div", "ch7l-toolbar");
    const gateHost = el("div");
    const pair = el("div", "ch7l-pair");
    const left = el("div", "ch7l-view", `<div class="ch7l-view-title">标准基 ${tex("\\varepsilon_1,\\varepsilon_2")}：矩阵 ${tex("A")}</div>`);
    const right = el("div", "ch7l-view", `<div class="ch7l-view-title">新基 ${tex("\\eta_1,\\eta_2")}：矩阵 ${tex("B")}</div>`);
    pair.append(left, right);
    const strip = el("div", "ch7l-strip");
    const result = el("div", "ch7l-result");
    lab.append(toolbar, gateHost, pair, strip, result);
    const L = K.plane2d(left, { extent: 3.2, hint: "", label: "标准网格中的 σ" });
    const R = K.plane2d(right, { extent: 3.2, hint: "拖动 η₁、η₂（每次半格）", label: "新基网格中的 σ" });
    let flow = null;

    const preset = () => BASIS_PRESETS[state.key];

    function compute() {
      const A = K.mat(preset().A);
      const X = [[F(state.eta[0][0]), F(state.eta[1][0])], [F(state.eta[0][1]), F(state.eta[1][1])]];
      const Xi = K.inv(X);
      const B = Xi ? K.mul(Xi, K.mul(A, X)) : null;
      return { A, X, B };
    }

    function drawEigen(d) {
      if (!flow?.revealed) return;
      preset().eigen.forEach((v) => d.line([0, 0], v, "subspace", { width: 1.4, dash: [6, 5], alpha: 0.9 }));
    }

    function redraw() {
      const { A, X, B } = compute();
      const An = matNum(A);
      const [e1, e2] = state.eta;
      L.setDraw((d) => {
        d.grid(undefined, { alpha: 0.7 });
        d.axes();
        drawEigen(d);
        d.arrow([0, 0], e1, "v1", { width: 1.4, alpha: 0.35, dash: [4, 4] });
        d.arrow([0, 0], e2, "v2", { width: 1.4, alpha: 0.35, dash: [4, 4] });
        d.arrow([0, 0], [1, 0], "v1", { width: 2.4, label: "ε₁" });
        d.arrow([0, 0], [0, 1], "v2", { width: 2.4, label: "ε₂" });
        d.arrow([0, 0], [An[0][0], An[1][0]], "image", { width: 2.6, label: "σε₁" });
        d.arrow([0, 0], [An[0][1], An[1][1]], "image", { width: 2.6, label: "σε₂", ldy: 4 });
      });
      R.setDraw((d) => {
        if (B) d.grid(state.eta, { color: "subspace", alpha: 0.28 });
        d.axes(null);
        drawEigen(d);
        if (B) {
          const Bn = matNum(B);
          [0, 1].forEach((j) => {
            const img = apply2(An, state.eta[j]);
            const c1 = Bn[0][j];
            const corner = [c1 * e1[0], c1 * e1[1]];
            d.segment([0, 0], corner, "image", { width: 1.2, dash: [3, 4], alpha: 0.7 });
            d.segment(corner, img, "image", { width: 1.2, dash: [3, 4], alpha: 0.7 });
          });
        }
        d.arrow([0, 0], e1, "v1", { width: 2.8, label: "η₁" });
        d.arrow([0, 0], e2, "v2", { width: 2.8, label: "η₂" });
        d.arrow([0, 0], apply2(An, e1), "image", { width: 2.6, label: "ση₁" });
        d.arrow([0, 0], apply2(An, e2), "image", { width: 2.6, label: "ση₂", ldy: 4 });
      });
      const tr = M().add(A[0][0], A[1][1]);
      let html = `<div class="ch7l-matrix-row">
        <div>${texD(`A=${K.latexMatrix(A)}`)}</div>
        <div>${texD(`X=(\\eta_1,\\eta_2)=${K.latexMatrix(X)}`)}</div>
        <div>${B ? texD(`B=X^{-1}AX=${K.latexMatrix(B)}`) : texD("B=\\ ?")}</div></div>`;
      if (!B) {
        html += `<p class="ch7l-bad">η₁, η₂ 共线，不构成基，B 无从谈起。</p>`;
      } else {
        const trB = M().add(B[0][0], B[1][1]);
        html += `<p>${tex(`\\operatorname{tr}A=${lf(tr)}`)}，${tex(`\\operatorname{tr}B=${lf(trB)}`)}；${tex(`|A|=${lf(K.det(A))}`)}，${tex(`|B|=${lf(K.det(B))}`)}。</p>`;
        html += K.isDiagonal(B)
          ? `<p class="ch7l-ok">B 是对角矩阵：每个 σηⱼ 都是 ηⱼ 的倍数。</p>`
          : `<p class="ch7l-muted">B 的第 j 列 = σηⱼ 在 η₁, η₂ 下的坐标（右图虚线）。</p>`;
      }
      strip.innerHTML = html;
    }

    const handle = (i, color) => ({
      color,
      snap: 0.5,
      limit: 2.5,
      get: () => state.eta[i],
      set: (p) => {
        if (Math.abs(p[0]) + Math.abs(p[1]) < 1e-9) return;
        state.eta[i] = p;
        redraw();
      },
      end: () => flow?.acted(),
    });
    R.setHandles([handle(0, "drag"), handle(1, "drag")]);

    function newFlow() {
      flow = K.predictFlow(gateHost, result, {
        question: `拖动 ${tex("\\eta_1,\\eta_2")}。什么时候 ${tex("B=X^{-1}AX")} 会成为对角矩阵？`,
        options: [
          { text: "η₁、η₂ 分别落在 σ 保持的两条直线上", correct: true },
          { text: "η₁、η₂ 互相垂直且等长", why: "试试“两个伸缩方向”：垂直的 η 一般得不到对角的 B。" },
          { text: "只有 η 等于 ε 时", why: "η=ε 时 B=A，A 本身不一定是对角的。" },
          { text: "永远不会，换基不改变矩阵", why: "换基不改变 σ，矩阵却会变。" },
        ],
        conclusion: `B 的第 j 列是 ${tex("\\sigma\\eta_j")} 在新基下的坐标。B 是对角矩阵，当且仅当 ${tex("\\sigma\\eta_j=\\lambda_j\\eta_j")}，即每个 ${tex("\\eta_j")} 都在 σ 保持的直线上（图中绿色虚线）。无论怎样换基，迹与行列式都不变，因为 B 与 A 相似。${preset().note}${state.key === "shear" ? "剪切只有一条这样的直线，B 最多化成三角形。" : ""}`,
        onReveal: redraw,
      });
    }

    K.chips(toolbar, Object.entries(BASIS_PRESETS).map(([k, v]) => [k, v.label]), (k) => {
      state.key = k;
      newFlow();
      redraw();
    }, state.key);
    newFlow();
    redraw();
    return () => {
      L.destroy();
      R.destroy();
    };
  }

  /* ================= §4 特征值与特征向量 ================= */

  /* Exact eigen-directions at integer angles, verified at load with rationals. */
  const SWEEP_PRESETS = {
    sym: {
      label: "对称拉伸",
      A: [[2, 1], [1, 2]],
      eigen: [{ angle: 45, v: [1, 1] }, { angle: 135, v: [-1, 1] }],
      predict: {
        question: "把 v 从 0° 转到 180°，v 与 Av 共线会出现几次？",
        options: [
          { text: "2 次", correct: true },
          { text: "1 次", why: "转到 135° 附近再看一看。" },
          { text: "4 次", why: "θ 与 θ+180° 是同一条直线，0°–180° 已经走遍所有直线。" },
          { text: "0 次", why: "转到 45° 看 v 和 Av。" },
        ],
        conclusion: "45° 与 135° 两条直线被保持，λ 分别是 3 和 1。对称矩阵的两条特征直线互相垂直。",
      },
    },
    upper: {
      label: "非对称",
      A: [[1, 1], [0, 2]],
      eigen: [{ angle: 0, v: [1, 0] }, { angle: 45, v: [1, 1] }],
      predict: {
        question: `${tex("A=\\begin{pmatrix}1&1\\\\0&2\\end{pmatrix}")} 的两条特征直线互相垂直吗？`,
        options: [
          { text: "不垂直，夹角 45°", correct: true },
          { text: "垂直", why: "转到 0° 和 45° 各看一次。" },
          { text: "只有一条特征直线", why: "这里有两个不同的特征值 1 和 2。" },
          { text: "没有特征直线", why: "转到 0°：Av=v。" },
        ],
        conclusion: "0° 方向 λ=1，45° 方向 λ=2。特征直线只需线性无关，不必垂直。",
      },
    },
    shear: {
      label: "剪切",
      A: [[1, 1], [0, 1]],
      eigen: [{ angle: 0, v: [1, 0] }],
      predict: {
        question: `剪切 ${tex("\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}")} 有几条特征直线？`,
        options: [
          { text: "1 条", correct: true },
          { text: "2 条", why: "特征值 1 是二重根，但 (E−A)x=0 的解只有一维。" },
          { text: "0 条", why: "转到 0° 看看。" },
          { text: "无穷多条", why: "除了 0°，其余方向都被推歪了。" },
        ],
        conclusion: "只有 x₁ 轴被保持（λ=1）。二重特征值只给出一条特征直线，所以凑不出两个线性无关的特征向量。",
      },
    },
    project: {
      label: "投影",
      A: [[1, 0], [0, 0]],
      eigen: [{ angle: 0, v: [1, 0] }, { angle: 90, v: [0, 1] }],
      predict: {
        question: "投影到 x₁ 轴时，x₂ 轴上的 v 满足 Av=0。x₂ 轴算特征直线吗？",
        options: [
          { text: "算，对应 λ=0", correct: true },
          { text: "不算，Av=0 不能叫伸缩", why: "Av=0·v 正是 λ=0 的情形，v 本身非零即可。" },
          { text: "不算，零向量不是特征向量", why: "v 不是零向量；被送到零的是 Av。" },
          { text: "只有 x₁ 轴才算", why: "转到 90° 看 Av。" },
        ],
        conclusion: "x₁ 轴上 λ=1，x₂ 轴上 λ=0。特征值可以是 0，此时特征子空间就是核。",
      },
    },
    rotate: {
      label: "旋转 90°",
      A: [[0, -1], [1, 0]],
      eigen: [],
      predict: {
        question: "旋转 90° 有没有实的特征直线？",
        options: [
          { text: "没有", correct: true },
          { text: "有一条", why: "转一整圈，Av 始终与 v 垂直。" },
          { text: "每条直线都是", why: "旋转把每条直线都转走了。" },
          { text: "取决于 v 的长度", why: "是否共线与长度无关。" },
        ],
        conclusion: "|λE−A|=λ²+1 在实数域上没有根。复数域上特征值是 ±i，但复特征向量不能画在实平面上。",
      },
    },
  };

  Object.values(SWEEP_PRESETS).forEach((p) => {
    const A = K.mat(p.A);
    p.eigen.forEach((e) => {
      const v = K.vec(e.v);
      const Av = K.matVec(A, v);
      const k = v.findIndex((x) => !M().isZero(x));
      e.lambda = M().div(Av[k], v[k]);
      const ok = Av.every((x, i) => M().eq(x, M().mul(e.lambda, v[i])));
      if (!ok) console.warn("Chapter 7 sweep preset has a wrong eigen-direction", p.label);
    });
  });

  const SPACE_A = [[1, 2, 2], [2, 1, 2], [2, 2, 1]];

  function eigenLab(root) {
    const lab = K.labShell(root, {
      title: "哪些方向只被伸缩",
      task: "紫色曲线是单位圆上所有方向经过 A 以后的终点。转动金色的 v，看 Av 何时与 v 落在同一条直线上。",
    });
    const modeBar = el("div", "ch7l-toolbar ch7l-modes");
    lab.append(modeBar);
    const host = el("div", "ch7l-modehost");
    lab.append(host);
    let cleanup = null;

    function mount(mode) {
      cleanup?.();
      host.innerHTML = "";
      cleanup = mode === "space" ? spaceMode(host, lab) : planeMode(host, lab);
    }
    K.chips(modeBar, [["plane", "平面：转动方向"], ["space", "空间：二维特征子空间"]], mount, "plane");
    mount("plane");
    return () => cleanup?.();
  }

  function planeMode(host, lab) {
    lab.querySelector(".ch7l-head p").textContent = "紫色曲线是单位圆上所有方向经过 A 以后的终点。转动金色的 v，看 Av 何时与 v 落在同一条直线上。";
    const state = { key: "sym", theta: 20 };
    const toolbar = el("div", "ch7l-toolbar");
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    body.append(stage, side);
    host.append(toolbar, body);
    const plane = K.plane2d(stage, { extent: 3, hint: "拖动 v 的端点，或用下方滑杆", label: "方向 v 与它的像 Av" });
    const control = el("div", "ch7l-card");
    control.innerHTML = `<label class="ch7l-range"><span>${tex("\\theta")}</span><input type="range" min="0" max="359" step="1" value="${state.theta}" data-theta aria-label="方向角" /><b data-theta-v>${state.theta}°</b></label>`;
    const info = el("div", "ch7l-card");
    const gateHost = el("div");
    const result = el("div", "ch7l-result");
    side.append(gateHost, control, info, result);
    let flow = null;
    const preset = () => SWEEP_PRESETS[state.key];

    function hit() {
      return preset().eigen.find((e) => e.angle === state.theta % 180) || null;
    }

    function redraw() {
      const P = preset();
      const A = P.A.map((r) => r.map((x) => num(F(x))));
      let smax = 0;
      const ring = [];
      for (let i = 0; i <= 120; i += 1) {
        const t = (i / 120) * Math.PI * 2;
        const img = apply2(A, [Math.cos(t), Math.sin(t)]);
        smax = Math.max(smax, Math.hypot(img[0], img[1]));
        ring.push(img);
      }
      const r = Math.min(1.5, 2.55 / Math.max(smax, 1e-9));
      const th = (state.theta * Math.PI) / 180;
      const v = [r * Math.cos(th), r * Math.sin(th)];
      const Av = apply2(A, v);
      const h = hit();
      plane.setDraw((d) => {
        d.grid(undefined, { alpha: 0.55 });
        d.axes();
        const circle = [];
        for (let i = 0; i <= 96; i += 1) {
          const t = (i / 96) * Math.PI * 2;
          circle.push([r * Math.cos(t), r * Math.sin(t)]);
        }
        d.polyline(circle, "axis", { dash: [4, 5], width: 1.2, alpha: 0.7 });
        d.polyline(ring.map(([x, y]) => [x * r, y * r]), "image", { close: true, fill: "image", fillAlpha: 0.06, width: 1.6, alpha: 0.75 });
        if (flow?.revealed) P.eigen.forEach((e) => d.line([0, 0], e.v, "subspace", { width: 1.4, dash: [6, 5] }));
        d.line([0, 0], v, h ? "subspace" : "drag", { width: h ? 2.2 : 1.2, alpha: h ? 0.8 : 0.55, dash: h ? undefined : [3, 5] });
        const avLen = Math.hypot(Av[0], Av[1]);
        if (!h && avLen > 1e-9) {
          const a0 = th;
          let a1 = Math.atan2(Av[1], Av[0]);
          while (a1 - a0 > Math.PI) a1 -= 2 * Math.PI;
          while (a1 - a0 < -Math.PI) a1 += 2 * Math.PI;
          d.arc(36, a0, a1, "image", { width: 2 });
        }
        // Highlight on a hit: the same colours with a glow underneath.
        if (h && avLen > 1e-9) d.segment([0, 0], Av, "image", { width: 7, alpha: 0.16 });
        d.arrow([0, 0], v, "drag", { label: "v" });
        if (avLen > 1e-9) d.arrow([0, 0], Av, "image", { label: "Av", width: 2.6, ldy: 4 });
        else d.point([0, 0], "image", { r: 5, label: "Av=0" });
      });
      control.querySelector("[data-theta-v]").textContent = `${state.theta}°`;
      control.querySelector("[data-theta]").value = String(state.theta);
      if (h) {
        info.innerHTML = `<h4>共线</h4><p>${tex(`Av=${lf(h.lambda)}\\,v`)}，${tex(`\\lambda=${lf(h.lambda)}`)}</p><p class="ch7l-muted">方向 ${tex(K.latexRow(K.vec(h.v)))} 上的每个非零向量都是特征向量。</p>`;
      } else {
        const avLen = Math.hypot(Av[0], Av[1]);
        const ang = avLen < 1e-9 ? 0 : (Math.acos(Math.max(-1, Math.min(1, (v[0] * Av[0] + v[1] * Av[1]) / (r * avLen)))) * 180) / Math.PI;
        const line = Math.min(ang, 180 - ang);
        info.innerHTML = `<h4>v 与 Av</h4><p>Av 偏离 v 所在直线 ${fmt(line, 1)}°</p><p class="ch7l-muted">偏离为 0 时，Av=λv。</p>`;
      }
    }

    plane.setHandles([
      {
        color: "drag",
        get: () => {
          const P = preset();
          const A = P.A.map((rr) => rr.map((x) => num(F(x))));
          let smax = 0;
          for (let i = 0; i < 120; i += 1) {
            const t = (i / 120) * Math.PI * 2;
            const img = apply2(A, [Math.cos(t), Math.sin(t)]);
            smax = Math.max(smax, Math.hypot(img[0], img[1]));
          }
          const r = Math.min(1.5, 2.55 / Math.max(smax, 1e-9));
          const th = (state.theta * Math.PI) / 180;
          return [r * Math.cos(th), r * Math.sin(th)];
        },
        set: (p) => {
          if (Math.hypot(p[0], p[1]) < 0.15) return;
          state.theta = (Math.round((Math.atan2(p[1], p[0]) * 180) / Math.PI) + 360) % 360;
          redraw();
        },
        end: () => flow?.acted(),
      },
    ]);
    control.querySelector("[data-theta]").addEventListener("input", (e) => {
      state.theta = Number(e.target.value);
      redraw();
    });
    control.querySelector("[data-theta]").addEventListener("change", () => flow?.acted());

    function load(key) {
      state.key = key;
      state.theta = 20;
      flow = K.predictFlow(gateHost, result, { ...preset().predict, onReveal: redraw });
      redraw();
    }
    K.chips(toolbar, Object.entries(SWEEP_PRESETS).map(([k, v]) => [k, v.label]), load, state.key);
    load("sym");
    return () => plane.destroy();
  }

  function spaceMode(host, lab) {
    lab.querySelector(".ch7l-head p").innerHTML = `${tex("A=\\begin{pmatrix}1&2&2\\\\2&1&2\\\\2&2&1\\end{pmatrix}")}。拖动 v 改变方向（图中 v 画成固定长度），看 Av 何时与 v 共线。`;
    const A = K.mat(SPACE_A);
    const An = matNum(A);
    const state = { u: [1, 0, 0.5] };
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    body.append(stage, side);
    host.append(body);
    const scene = window.LAScene3D.create(stage, { range: 2.6, label: "三维中的 v 与 Av", hint: "拖动空白处旋转 · 拖动圆点改变 v", yaw: -0.75, pitch: 0.38 });
    const tools = el("div", "ch7l-actions");
    tools.innerHTML = `<button type="button" class="ch7l-btn" data-plane>放进平面 x₁+x₂+x₃=0</button><button type="button" class="ch7l-btn" data-line>放到 (1,1,1) 方向</button><button type="button" class="ch7l-btn" data-look>沿 (1,1,1) 看</button><button type="button" class="ch7l-btn" data-edge>侧看平面</button>`;
    const info = el("div", "ch7l-card");
    const gateHost = el("div");
    const result = el("div", "ch7l-result");
    side.append(gateHost, tools, info, result);
    let flow = null;
    const LEN = 0.85;

    const dir = () => {
      const l = Math.hypot(...state.u);
      return state.u.map((x) => (x / l) * LEN);
    };

    function status() {
      const u = K.vec(state.u);
      const Au = K.matVec(A, u);
      const parallel = K.isZeroVec(K.cross3(u, Au));
      let lambda = null;
      if (parallel) {
        const k = u.findIndex((x) => !M().isZero(x));
        lambda = M().div(Au[k], u[k]);
      }
      return { u, Au, parallel, lambda };
    }

    function redraw() {
      const s = status();
      const v = dir();
      const Av = [0, 1, 2].map((i) => An[i].reduce((acc, a, j) => acc + a * v[j], 0));
      scene.setObjects(() => {
        const objs = [];
        if (flow?.revealed) {
          objs.push({ type: "plane", n: [1, 1, 1], d: 0, color: "subspace", alpha: 0.12, label: "V₋₁" });
          objs.push({ type: "line", dir: [1, 1, 1], color: "subspace", width: 2.2, label: "V₅" });
        }
        objs.push({ type: "line", dir: v, color: "drag", width: 1.2, dash: [4, 5], alpha: s.parallel ? 0.9 : 0.5 });
        objs.push({ type: "arrow", to: v, color: "drag", label: "v" });
        // Highlight when collinear: the same colour with a glow underneath.
        if (s.parallel) objs.push({ type: "segment", a: [0, 0, 0], b: Av, color: "image", width: 7, alpha: 0.16 });
        objs.push({ type: "arrow", to: Av, color: "image", width: 2.6, label: "Av" });
        return objs;
      });
      info.innerHTML = `<h4>读数</h4><p>v 的方向 ${tex(K.latexRow(s.u))}，${tex(`Av\\ \\text{的方向}\\ ${K.latexRow(s.Au)}`)}</p>${
        s.parallel
          ? `<p class="ch7l-ok">共线：${tex(`Av=${lf(s.lambda)}\\,v`)}</p>`
          : `<p class="ch7l-muted">不共线：Av 离开了 v 所在的直线。</p>`
      }`;
    }

    scene.setHandles([
      {
        color: "drag",
        get: dir,
        set: (p) => {
          const q = p.map((x) => Math.round(x * 2) / 2);
          if (q.every((x) => x === 0)) return;
          state.u = q;
          redraw();
        },
        end: () => flow?.acted(),
      },
    ]);
    tools.querySelector("[data-plane]").addEventListener("click", () => {
      // subtract the mean: exact, stays on the half grid after doubling if needed
      const u = K.vec(state.u);
      const mean = M().div(u.reduce((a, b) => M().add(a, b), F(0)), F(3));
      let w = u.map((x) => M().sub(x, mean));
      if (K.isZeroVec(w)) w = K.vec([1, -1, 0]);
      state.u = w.map(num);
      redraw();
      flow?.acted();
    });
    tools.querySelector("[data-line]").addEventListener("click", () => {
      state.u = [1, 1, 1];
      redraw();
      flow?.acted();
    });
    tools.querySelector("[data-look]").addEventListener("click", () => scene.lookAlong([1, 1, 1]));
    tools.querySelector("[data-edge]").addEventListener("click", () => scene.lookAlong([1, -1, 0]));

    flow = K.predictFlow(gateHost, result, {
      question: "A 保持多少条过原点的直线（直线上的 v 满足 Av 与 v 共线）？",
      options: [
        { text: "无穷多条", correct: true },
        { text: "恰好 3 条", why: "三阶矩阵最多三个特征值，可一个特征值可以对应一整个平面。" },
        { text: "1 条", why: "先点“放进平面”，看 Av 与 v 的关系。" },
        { text: "没有", why: "点“放到 (1,1,1) 方向”。" },
      ],
      conclusion: `λ=5 只给出直线 ${tex("V_5=L((1,1,1)^T)")}；λ=−1 是二重根，${tex("(-E-A)x=0")} 只有一个独立方程 ${tex("x_1+x_2+x_3=0")}，${tex("V_{-1}")} 是一整个平面，平面里每条直线都被保持（v 被反向）。点“沿 (1,1,1) 看”：平面正对着你，V₅ 缩成一点。`,
      onReveal: redraw,
    });
    redraw();
    return () => scene.destroy();
  }

  /* ================= §5 对角矩阵：迭代 ================= */

  const ITER_PRESETS = {
    attract: {
      label: "吸引",
      A: [["1/2", "3/10"], [0, "4/5"]],
      vecs: [[1, 0], [1, 1]],
      lambdas: ["1/2", "4/5"],
      x0: [2.5, 2],
      extent: 3.2,
      predict: {
        question: "点会趋向原点。最后几步，它贴着哪条特征直线进来？",
        options: [
          { text: "η₂ 方向（λ=4/5）", correct: true },
          { text: "η₁ 方向（λ=1/2）", why: "1/2ᵏ 衰减得更快，这一份先消失。" },
          { text: "沿 x₀ 与原点的连线", why: "两个分量缩小的速度不同，方向会改变。" },
          { text: "绕原点转圈", why: "两个特征值都是正实数，没有转动。" },
        ],
        conclusion: "xₖ=c₁(1/2)ᵏη₁+c₂(4/5)ᵏη₂。两份都在缩小，(1/2)ᵏ 缩得快，剩下的主要是 η₂ 分量，所以点贴着 η₂ 所在的直线进入原点。",
      },
    },
    saddle: {
      label: "鞍点",
      A: [["1/2", "7/10"], [0, "6/5"]],
      vecs: [[1, 0], [1, 1]],
      lambdas: ["1/2", "6/5"],
      x0: [1.5, 0.5],
      extent: 4.2,
      predict: {
        question: "λ₁=1/2，λ₂=6/5。多数初始点最后沿哪条直线跑远？",
        options: [
          { text: "η₂ 所在直线", correct: true },
          { text: "η₁ 所在直线", why: "η₁ 分量每步乘 1/2，越来越小。" },
          { text: "所有点都跑向原点", why: "6/5>1，η₂ 分量在增长。" },
          { text: "点停在原地不动", why: "按一次“作用一次”看看。" },
        ],
        conclusion: "η₂ 分量每步乘 6/5，越来越大，η₁ 分量趋于 0，点沿 η₂ 的方向跑远。只有恰好落在 η₁ 直线上（c₂=0）的点会跑向原点：把 x₀ 拖到 x₁ 轴上试试。",
      },
    },
    markov: {
      label: "马尔可夫",
      A: [["4/5", "3/10"], ["1/5", "7/10"]],
      vecs: [[3, 2], [1, -1]],
      lambdas: [1, "1/2"],
      x0: [2, 0],
      extent: 2.6,
      predict: {
        question: "每列元素之和为 1。从 x₀=(2,0) 出发，最后停在哪里？",
        options: [
          { text: "(6/5, 4/5)", correct: true },
          { text: "(1, 1)", why: "极限在 λ=1 的特征直线 L((3,2)) 上。" },
          { text: "原点", why: "λ=1 的分量不衰减。" },
          { text: "不会停下", why: "λ=1/2 的分量越来越小，点会停下。" },
        ],
        conclusion: "λ=1 的分量保持不变，λ=1/2 的分量衰减为 0，xₖ 趋于 c₁η₁。分量之和保持为 2，所以极限是 2·(3/5, 2/5)=(6/5, 4/5)。",
      },
    },
    jordan: {
      label: "特征向量不够",
      A: [[1, 1], [0, 1]],
      vecs: [[1, 0]],
      lambdas: [1],
      x0: [-2.5, 0.5],
      extent: 3.2,
      predict: {
        question: `${tex("A=\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}")} 只有一条特征直线。反复作用，点怎样运动？`,
        options: [
          { text: "沿水平方向等距前进", correct: true },
          { text: "越走越快（指数增长）", why: "每一步 x₁ 加上的都是同一个 x₂。" },
          { text: "趋向原点", why: "特征值是 1，没有衰减。" },
          { text: "绕原点转动", why: "x₂ 坐标始终不变。" },
        ],
        conclusion: "Aᵏ=(1 k; 0 1)，xₖ=(x₁+k·x₂, x₂)：每步平移 x₂，是等差的漂移。特征向量只有一个，x₀ 拆不成两个按几何级数伸缩的分量，A 不能对角化。",
      },
    },
  };

  function iterationLab(root) {
    const lab = K.labShell(root, {
      title: "反复作用 A，点跑向哪里",
      task: "拖动金色的 x₀，然后按“作用一次”。蓝、朱两支箭头是 xₖ 的两个特征分量，每按一次各乘自己的 λ；紫色折线是轨迹。",
    });
    const state = { key: "attract", x0: [2.5, 2], k: 0 };
    const toolbar = el("div", "ch7l-toolbar");
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    body.append(stage, side);
    lab.append(toolbar, body);
    const plane = K.plane2d(stage, { extent: 3.2, hint: "拖动 x₀（每次半格）", label: "迭代轨迹" });
    const tools = el("div", "ch7l-actions");
    tools.innerHTML = `<button type="button" class="ch7l-btn is-primary" data-step>作用一次 A</button><button type="button" class="ch7l-btn" data-ten>连续 10 次</button><button type="button" class="ch7l-btn" data-reset>回到 x₀</button>`;
    const info = el("div", "ch7l-card");
    const gateHost = el("div");
    const result = el("div", "ch7l-result");
    side.append(gateHost, tools, info, result);
    let flow = null;
    let timer = 0;
    const preset = () => ITER_PRESETS[state.key];

    function exactCoeffs() {
      const P = preset();
      if (P.vecs.length < 2) return null;
      const vs = P.vecs.map(K.vec);
      return K.coordinatesIn(vs, K.vec(state.x0));
    }

    function trajectory() {
      const A = matNum(K.mat(preset().A));
      const pts = [state.x0.slice()];
      for (let i = 0; i < state.k; i += 1) pts.push(apply2(A, pts[i]));
      return pts;
    }

    function redraw() {
      const P = preset();
      const pts = trajectory();
      const xk = pts[pts.length - 1];
      const c = exactCoeffs();
      const lam = P.lambdas.map((x) => num(F(x)));
      const colors = ["v1", "v2"];
      plane.setDraw((d) => {
        d.grid(undefined, { alpha: 0.5 });
        d.axes();
        P.vecs.forEach((v, i) => {
          d.line([0, 0], v, colors[i], { width: 1.3, dash: [6, 5], alpha: 0.75 });
          const l = Math.hypot(...v);
          d.text([(v[0] / l) * d.halfW * 0.82, (v[1] / l) * d.halfW * 0.82], `η${"₁₂"[i]}`, colors[i], { dx: 6, dy: -10 });
        });
        if (c) {
          const parts = [0, 1].map((i) => {
            const s = num(c[i]) * lam[i] ** state.k;
            return [P.vecs[i][0] * s, P.vecs[i][1] * s];
          });
          d.segment(parts[0], xk, "v2", { width: 1, dash: [3, 4], alpha: 0.7 });
          d.segment(parts[1], xk, "v1", { width: 1, dash: [3, 4], alpha: 0.7 });
          d.arrow([0, 0], parts[0], "v1", { width: 2.6 });
          d.arrow([0, 0], parts[1], "v2", { width: 2.6 });
        }
        // x₀ is the dragged point; x₁, x₂, … are images under A.
        d.polyline(pts, "image", { width: 1.6, alpha: 0.85 });
        pts.forEach((p, i) => d.point(p, i ? "image" : "drag", { r: i === pts.length - 1 ? 5.5 : 3, alpha: i === pts.length - 1 ? 1 : 0.7 }));
        d.text(xk, state.k ? `x${toSub(state.k)}` : "x₀", state.k ? "image" : "drag", { dx: 10, dy: 12 });
      });
      let html = `<h4>k = ${state.k}</h4><p>${tex(`x_{${state.k}}=`)} ${vecText(xk, 3)}</p>`;
      if (c) {
        const co = (x) => { const t = lf(x); return t === "1" ? "" : t === "-1" ? "-" : t; };
        html += `<p>${tex(`x_0=${co(c[0])}\\eta_1${c[1].n < 0 ? "" : "+"}${co(c[1])}\\eta_2`)}</p>`;
        // last five steps: each component is multiplied by its own λ; the ratio column
        // (weaker over stronger component) shows which one dies out
        const strong = Math.abs(lam[1]) >= Math.abs(lam[0]) ? 1 : 0;
        const weak = 1 - strong;
        const comp = (i, k) => num(c[i]) * lam[i] ** k;
        const rows = [];
        for (let k = Math.max(0, state.k - 4); k <= state.k; k += 1) rows.push(k);
        const ratioHead = `η${"₁₂"[weak]} / η${"₁₂"[strong]}`;
        html += `<table class="ch7l-table ch7l-iter"><thead><tr><th>k</th>
          <th style="color:var(--cv-v1)">η₁ 分量 ×${P.lambdas[0]}</th>
          <th style="color:var(--cv-v2)">η₂ 分量 ×${P.lambdas[1]}</th>
          <th>${ratioHead}</th></tr></thead><tbody>
          ${rows.map((k) => {
            const a = comp(0, k), b = comp(1, k);
            const st = comp(strong, k), wk = comp(weak, k);
            const ratio = Math.abs(st) < 1e-12 ? "—" : fmt(wk / st, 3);
            return `<tr${k === state.k ? ' class="is-now"' : ""}><td>${k}</td><td>${fmt(a, 3)}</td><td>${fmt(b, 3)}</td><td>${ratio}</td></tr>`;
          }).join("")}
          </tbody></table>`;
        const onLine = c.findIndex((x) => M().isZero(x));
        if (onLine >= 0) html += `<p class="ch7l-ok">x₀ 在 η${"₁₂"[1 - onLine]} 所在直线上：c${"₁₂"[onLine]}=0，点永远不离开这条直线。</p>`;
      } else {
        html += `<p class="ch7l-muted">只有一条特征直线，xₖ 拆不成两个特征分量。${tex(`A^{k}=\\begin{pmatrix}1&${state.k}\\\\0&1\\end{pmatrix}`)}</p>`;
      }
      info.innerHTML = html;
    }

    function toSub(n) {
      return String(n).split("").map((ch) => "₀₁₂₃₄₅₆₇₈₉"[Number(ch)]).join("");
    }

    function step() {
      if (state.k >= 40) return;
      state.k += 1;
      redraw();
      flow?.acted();
    }

    plane.setHandles([
      {
        color: "drag",
        snap: 0.5,
        limit: 3,
        get: () => state.x0,
        set: (p) => {
          clearInterval(timer);
          state.x0 = p;
          state.k = 0;
          redraw();
        },
      },
    ]);
    tools.querySelector("[data-step]").addEventListener("click", step);
    tools.querySelector("[data-ten]").addEventListener("click", () => {
      clearInterval(timer);
      let n = 0;
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        for (let i = 0; i < 10; i += 1) step();
        return;
      }
      timer = setInterval(() => {
        step();
        n += 1;
        if (n >= 10) clearInterval(timer);
      }, 160);
    });
    tools.querySelector("[data-reset]").addEventListener("click", () => {
      clearInterval(timer);
      state.k = 0;
      redraw();
    });

    function load(key) {
      clearInterval(timer);
      state.key = key;
      state.x0 = preset().x0.slice();
      state.k = 0;
      plane.setExtent(preset().extent);
      flow = K.predictFlow(gateHost, result, preset().predict);
      redraw();
    }
    K.chips(toolbar, Object.entries(ITER_PRESETS).map(([k, v]) => [k, v.label]), load, state.key);
    load("attract");
    return () => {
      clearInterval(timer);
      plane.destroy();
    };
  }

  K.register("matrix-of-linear-map", basisLab);
  K.register("eigenvalues-eigenvectors", eigenLab);
  K.register("diagonal-matrices", iterationLab);
})();
