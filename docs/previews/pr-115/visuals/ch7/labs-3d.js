/*
 * Chapter 7 labs on the shared 3D scene (visuals/shared/scene3d.js):
 *   §6 image-and-kernel     — slide x along the kernel, the image point stays put
 *   §7 invariant-subspaces  — does σW leave the candidate line/plane W?
 *   §9 minimal-polynomial   — Krylov sequence v, Av, A²v, … until it falls back
 * Kernels, images, invariance and linear relations are all decided exactly.
 */
(() => {
  const K = window.Ch7Kit;
  if (!K) return;
  const { tex, texD, F, num, lf, el } = K;
  const M = () => window.Ch3Math;
  const S = () => window.LAScene3D;
  const V = () => window.LAScene3D.vec;

  const numVec = (v) => v.map(num);
  const snapHalf = (x) => Math.round(x * 2) / 2;
  const colsOf = (A) => A[0].map((_, j) => A.map((r) => r[j]));

  /* Independent columns of a rational matrix (a basis of its column space). */
  function columnBasis(A) {
    const cols = colsOf(A);
    const basis = [];
    cols.forEach((c) => {
      if (K.rankOfVectors([...basis, c]) > basis.length) basis.push(c);
    });
    return basis;
  }

  /* Drawable object for the span of 1 or 2 rational vectors. */
  function spanObject(basis, color, extra = {}) {
    const b = basis.map(numVec);
    if (b.length === 1) return { type: "line", dir: b[0], color, width: 2.6, ...extra };
    if (b.length === 2) return { type: "plane", n: V().cross(b[0], b[1]), d: 0, color, alpha: 0.13, ...extra };
    return null;
  }

  function dimName(k) {
    return ["只有零向量", "一条直线", "一个平面", "整个空间"][k];
  }

  /* ================= §6 值域与核 ================= */

  const KERNEL_MODES = {
    oblique: {
      label: "沿直线压到平面",
      A: [[1, 0, "-1/2"], [0, 1, "-1/2"], [0, 0, 0]],
      x: [1.5, -0.5, 2],
      axes: ["x₁", "x₂", "x₃"],
      predict: {
        question: "σ 沿一条直线把 ℝ³ 压到一个平面上。dim σ⁻¹(0) + dim σV 等于多少？",
        options: [
          { text: "3", correct: true },
          { text: "2", why: "核是压缩方向那条直线，它也占一维。" },
          { text: "4", why: "数一数：核一条直线，值域一个平面。" },
          { text: "取决于压缩的方向", why: "换个方向压，核与值域的维数都不变。" },
        ],
        conclusion: "核是压缩方向所在的直线（1 维），值域是平面 x₃=0（2 维），1+2=3。沿核拖动 x′，σx′ 始终等于 σx：σx 的全部原像恰是 x+σ⁻¹(0)。这个 σ 满足 σ²=σ，此时 ℝ³=σV⊕σ⁻¹(0)。",
      },
    },
    toLine: {
      label: "沿平面压到直线",
      A: [[0, 0, "1/2"], [0, 0, "1/2"], [0, 0, 1]],
      x: [1.5, -1, 2],
      axes: ["x₁", "x₂", "x₃"],
      predict: {
        question: "换成沿平面 x₃=0 压到直线 L((1,1,2)ᵀ) 上。核与值域各是几维？",
        options: [
          { text: "核 2 维，值域 1 维", correct: true },
          { text: "核 1 维，值域 2 维", why: "被压成 0 的是平面 x₃=0 里的全部向量。" },
          { text: "核 2 维，值域 2 维", why: "所有像都落在一条直线上。" },
          { text: "核 0 维，值域 3 维", why: "x₃=0 的向量都被送到 0。" },
        ],
        conclusion: "这个变换是 E−σ（σ 是第一种模式）：核与值域对调，2+1=3。在核平面里拖动 x′，像始终是同一个点。",
      },
    },
    deriv: {
      label: "求导 D（P[x]₃）",
      A: [[0, 1, 0], [0, 0, 2], [0, 0, 0]],
      x: [1, 1.5, 1],
      axes: ["a₀", "a₁", "a₂"],
      predict: {
        question: "点 (a₀,a₁,a₂) 代表 a₀+a₁x+a₂x²。D 的核（常数）与值域（次数 ≤1 的多项式）是什么关系？",
        options: [
          { text: "核含在值域里，两者的和不是整个空间", correct: true },
          { text: "两者互补，P[x]₃=DV⊕D⁻¹(0)", why: "常数 1 在核里，同时 1=D(x) 也在值域里。" },
          { text: "两者只交于零向量", why: "常数 1 既在核里，也等于 D(x)。" },
          { text: "值域是整个 P[x]₃", why: "x² 不是任何次数 <3 的多项式的导数。" },
        ],
        conclusion: "D⁻¹(0)=L(1) 是 a₀ 轴，DV=L(1,x) 是 a₀a₁ 平面。1+2=3 照样成立，但 a₀ 轴在 a₀a₁ 平面里：DV+D⁻¹(0)=DV≠P[x]₃。维数公式不保证直和。",
      },
    },
  };

  /* n1 x1 + n2 x2 + n3 x3 without zero terms or unit coefficients. */
  function planeLatex(n0) {
    // scale the normal so its first nonzero coefficient is ±1 (3/2 x₃=0 reads x₃=0)
    const lead = n0.find((c) => !M().isZero(c));
    const n = lead ? n0.map((c) => M().div(c, M().absF(lead))) : n0;
    const terms = [];
    n.forEach((c, i) => {
      if (M().isZero(c)) return;
      const neg = c.n < 0;
      const mag = M().absF(c);
      const coef = M().eq(mag, M().F(1)) ? "" : lf(mag);
      terms.push(`${terms.length ? (neg ? "-" : "+") : neg ? "-" : ""}${coef}x_${i + 1}`);
    });
    return terms.join("") || "0";
  }

  function kernelLab(root) {
    const lab = K.labShell(root, {
      title: "沿核滑动，像不动",
      task: "金色圆点 x 可以随意拖动，紫色点是它的像 σx。金色圆点 x′ 只能沿绿色虚线 x+σ⁻¹(0) 移动：拖动它，看 σx′ 会不会离开 σx。",
    });
    const toolbar = el("div", "ch7l-toolbar");
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    body.append(stage, side);
    lab.append(toolbar, body);
    const gateHost = el("div");
    const tools = el("div", "ch7l-actions");
    tools.innerHTML = `<button type="button" class="ch7l-btn is-primary" data-slide>让 x′ 走遍 x+σ⁻¹(0)</button><button type="button" class="ch7l-btn" data-look-ker>沿核看</button><button type="button" class="ch7l-btn" data-reset>回到默认视角</button>`;
    const info = el("div", "ch7l-card");
    const result = el("div", "ch7l-result");
    side.append(gateHost, tools, info, result);
    let scene = null;
    let flow = null;
    const state = { key: "oblique", x: [1.5, -0.5, 2], w: [0, 0, 0] };
    // positions x′ has visited on the slice x+σ⁻¹(0): every one maps to the same σx
    const trail = new Map();
    let slideTimer = 0;
    let startW = null;
    const remember = () => trail.set(state.w.join(","), state.w.slice());

    const mode = () => KERNEL_MODES[state.key];
    const A = () => K.mat(mode().A);

    function structure() {
      const a = A();
      const ker = K.nullspace(a);
      const im = columnBasis(a);
      const sum = K.rankOfVectors([...ker, ...im]);
      return { ker, im, cap: ker.length + im.length - sum };
    }

    function xPrime() {
      return state.x.map((v, i) => v + state.w[i]);
    }

    function redraw() {
      const a = A();
      const { ker, im, cap } = structure();
      const x = K.vec(state.x);
      const xp = K.vec(xPrime());
      const sx = K.matVec(a, x);
      const sxp = K.matVec(a, xp);
      const same = sx.every((v, i) => M().eq(v, sxp[i]));
      const sxN = numVec(sx);
      scene.setObjects(() => {
        const objs = [];
        const imObj = spanObject(im, "image", { label: state.key === "deriv" ? "DV" : "σV" });
        const kerObj = spanObject(ker, "subspace", { label: state.key === "deriv" ? "D⁻¹(0)" : "σ⁻¹(0)" });
        // The labelled spans are the answer to the prediction: draw them afterwards.
        if (flow?.revealed && imObj) objs.push(imObj);
        if (flow?.revealed && kerObj) objs.push(kerObj);
        // the fibre through x: x + ker
        if (ker.length === 1) objs.push({ type: "line", p: state.x, dir: numVec(ker[0]), color: "subspace", width: 1.4, dash: [6, 5], alpha: 0.8 });
        if (ker.length === 2) {
          const n = V().cross(numVec(ker[0]), numVec(ker[1]));
          objs.push({ type: "plane", n, d: V().dot(n, state.x), color: "subspace", alpha: 0.06, dash: [6, 5], strokeAlpha: 0.5 });
        }
        trail.forEach((w) => {
          const p = state.x.map((v, i) => v + w[i]);
          objs.push({ type: "segment", a: p, b: sxN, color: "drag", dash: [2, 3], width: 1.1, alpha: 0.5 });
          objs.push({ type: "point", p, color: "drag", r: 2.8 });
        });
        objs.push({ type: "segment", a: state.x, b: sxN, color: "axis", dash: [4, 4], width: 1.3 });
        objs.push({ type: "segment", a: xPrime(), b: sxN, color: "axis", dash: [4, 4], width: 1.3 });
        // x and x′ are both gold drag handles: name them on the picture.
        objs.push({ type: "point", p: state.x, color: "drag", r: 0.01, label: "x" });
        objs.push({ type: "point", p: xPrime(), color: "drag", r: 0.01, label: "x′" });
        objs.push({ type: "point", p: sxN, color: "image", r: 6.5, label: same ? "σx = σx′" : "σx" });
        if (!same) objs.push({ type: "point", p: numVec(sxp), color: "image", r: 5, hollow: true, label: "σx′" });
        return objs;
      });
      const poly = (v) => K.polyLatex(v, "x");
      let html = `<h4>读数</h4>`;
      if (state.key === "deriv") {
        html += `<p>${tex(`f=${poly(x)}`)}，${tex(`Df=${poly(sx)}`)}</p>`;
        html += `<p>${tex(`g=${poly(xp)}`)}，${tex(`Dg=${poly(sxp)}`)}</p>`;
      } else {
        html += `<p>${tex(`x=${K.latexRow(x)}`)}，${tex(`\\sigma x=${K.latexRow(sx)}`)}</p><p>${tex(`x'=${K.latexRow(xp)}`)}，${tex(`\\sigma x'=${K.latexRow(sxp)}`)}</p>`;
      }
      const D = state.key === "deriv";
      const s = D ? "D" : "\\sigma";
      html += same
        ? `<p class="ch7l-ok">${tex(D ? "Dg=Df" : "\\sigma x'=\\sigma x")}：${tex(D ? "g-f" : "x'-x")} 在核里。</p>`
        : `<p class="ch7l-bad">${tex(D ? "Dg\\ne Df" : "\\sigma x'\\ne\\sigma x")}</p>`;
      if (flow?.revealed) {
        html += `<p>${tex(`\\dim ${s}^{-1}(0)=${ker.length}`)}（${dimName(ker.length)}），${tex(`\\dim ${s} V=${im.length}`)}（${dimName(im.length)}），${tex(`\\dim(${s} V\\cap ${s}^{-1}(0))=${cap}`)}</p>`;
      }
      info.innerHTML = html;
    }

    function handles() {
      const { ker } = structure();
      const kerN = ker.map(numVec);
      const xHandle = {
        color: "drag",
        snap: 0.5,
        get: () => state.x,
        set: (p) => {
          const q = p.slice();
          if (state.key === "deriv") q[2] = Math.max(-1.5, Math.min(1.5, q[2]));
          state.x = q;
          trail.clear();
          redraw();
        },
        end: () => flow?.acted(),
      };
      const xpHandle = {
        color: "drag",
        get: xPrime,
        set: (p) => {
          const d = p.map((v, i) => v - state.x[i]);
          if (kerN.length === 1) {
            const k = kerN[0];
            const t = snapHalf(V().dot(d, k) / V().dot(k, k));
            state.w = k.map((c) => c * t);
          } else {
            // kernel plane x₃ = 0 in this lab
            state.w = [snapHalf(d[0]), snapHalf(d[1]), 0];
          }
          remember();
          redraw();
        },
        end: () => flow?.acted(),
      };
      if (kerN.length === 1) Object.assign(xpHandle, { mode: "line", dir: kerN[0] });
      else {
        xpHandle.mode = "plane";
        Object.defineProperty(xpHandle, "plane", { get: () => ({ n: [0, 0, 1], d: state.x[2] }) });
      }
      scene.setHandles([xHandle, xpHandle]);
    }

    /* Exact stops for x′ on the slice that stay inside the view cube. */
    function slideStops() {
      const { ker } = structure();
      const kerN = ker.map(numVec);
      const inside = (w) => state.x.every((v, i) => Math.abs(v + w[i]) <= 2.8);
      const stops = [];
      if (kerN.length === 1) {
        for (let t = -6; t <= 6; t += 0.5) {
          const w = kerN[0].map((c) => c * t);
          if (inside(w)) stops.push(w);
        }
      } else {
        // a zigzag over the kernel plane x₃ = 0
        for (let b = -2; b <= 2; b += 1) {
          const row = [];
          for (let a = -2; a <= 2; a += 1) if (inside([a, b, 0])) row.push([a, b, 0]);
          stops.push(...(b % 2 ? row.reverse() : row));
        }
      }
      return stops;
    }

    function slide() {
      clearInterval(slideTimer);
      const stops = slideStops();
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const visit = (w) => {
        state.w = w.map((c) => c + 0);
        remember();
      };
      // the sweep ends back at the starting offset, so x′ does not stop on top of x
      const home = startW ? [startW] : [];
      if (reduce) {
        [...stops, ...home].forEach(visit);
        redraw();
        flow?.acted();
        return;
      }
      const path = [...stops, ...home];
      let i = 0;
      slideTimer = setInterval(() => {
        visit(path[i]);
        redraw();
        i += 1;
        if (i >= path.length) {
          clearInterval(slideTimer);
          flow?.acted();
        }
      }, 140);
    }

    function load(key) {
      clearInterval(slideTimer);
      trail.clear();
      state.key = key;
      tools.querySelector("[data-slide]").textContent = key === "deriv" ? "让 x′ 走遍 x+D⁻¹(0)" : "让 x′ 走遍 x+σ⁻¹(0)";
      state.x = mode().x.slice();
      const { ker } = structure();
      // x′ starts well away from x and from σx (so handles and labels do not overlap), on the half grid
      const sx = numVec(K.matVec(A(), K.vec(state.x)));
      const start = () => {
        const k = numVec(ker[0]);
        for (const t of [-2, 2, -1.5, 1.5, -3, 3, -1, 1]) {
          const w = k.map((c) => c * t);
          const far = Math.hypot(...state.x.map((v, i) => v + w[i] - sx[i])) >= 1;
          const ok = far && w.every((c, i) => Number.isInteger(c * 2) && Math.abs(state.x[i] + c) <= 2.5) && Math.hypot(...w) >= 1.2;
          if (ok) return w;
        }
        return k.map((c) => -c);
      };
      state.w = ker.length === 1 ? start() : [-1.5, 1.5, 0];
      startW = state.w.slice();
      scene?.destroy();
      // the old scene's caption (added by lab-layout.js) goes with it
      stage.querySelectorAll(".la-figcaption").forEach((n) => n.remove());
      scene = S().create(stage, { range: 3, label: "核、值域与一个点的像", hint: "拖动空白处旋转 · 拖动金色圆点 x 或 x′", yaw: -0.9, pitch: 0.35, axisNames: mode().axes, spreadLabels: true, labelSafe: true });
      handles();
      flow = K.predictFlow(gateHost, result, { ...mode().predict, onReveal: redraw });
      redraw();
    }

    tools.querySelector("[data-slide]").addEventListener("click", slide);
    tools.querySelector("[data-look-ker]").addEventListener("click", () => {
      const { ker } = structure();
      if (ker.length === 1) scene.lookAlong(numVec(ker[0]));
      else scene.lookAlong([1, -1, 0]);
    });
    tools.querySelector("[data-reset]").addEventListener("click", () => scene.resetView());
    K.chips(toolbar, Object.entries(KERNEL_MODES).map(([k, v]) => [k, v.label]), load, state.key);
    load("oblique");
    return () => {
      clearInterval(slideTimer);
      scene?.destroy();
    };
  }

  /* ================= §7 不变子空间 ================= */

  const INVARIANT_PRESETS = {
    standard: {
      label: "转 90° 再拉伸",
      A: [[0, -1, 0], [1, 0, 0], [0, 0, 2]],
      basis: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
      basisName: "\\varepsilon_1,\\varepsilon_2\\mid\\varepsilon_3",
      predict: {
        question: "A 先绕 x₃ 轴转 90°，再沿 x₃ 轴拉伸 2 倍。有没有不变的平面？那个平面里有没有特征向量？",
        options: [
          { text: "x₁x₂ 平面不变，但平面里没有实特征向量", correct: true },
          { text: "x₁x₂ 平面不变，所以平面里一定有特征向量", why: "平面里每个方向都被转了 90°。" },
          { text: "没有不变平面", why: "试试候选平面 x₁x₂。" },
          { text: "每个含 x₃ 轴的平面都不变", why: "试试 x₁x₃ 平面：Aε₁=ε₂ 跑了出去。" },
        ],
        conclusion: "A 把 x₁x₂ 平面转 90°，平面整体留在原处，平面里的每条直线却都被转走，所以没有实特征向量。不变直线只有 x₃ 轴（λ=2）。按 x₁x₂ 平面的基接上 x₃ 轴的基，矩阵是一个 2 阶块和一个 1 阶块组成的准对角矩阵。",
      },
    },
    tilted: {
      label: "同样结构，斜放",
      A: [[-1, -1, 0], [2, 1, 0], [1, 2, 2]],
      basis: [[1, -1, 0], [0, 1, -1], [0, 0, 1]],
      basisName: "\\eta_1,\\eta_2\\mid\\eta_3",
      predict: {
        question: `${tex("A'=\\begin{pmatrix}-1&-1&0\\\\2&1&0\\\\1&2&2\\end{pmatrix}")} 的特征多项式也是 ${tex("(\\lambda^2+1)(\\lambda-2)")}。它的不变平面在哪里？`,
        options: [
          { text: "平面 x₁+x₂+x₃=0", correct: true },
          { text: "仍是 x₁x₂ 平面", why: "A′ε₁=(−1,2,1)ᵀ 离开了 x₁x₂ 平面。" },
          { text: "每个含 x₃ 轴的平面", why: "拖动法向试几个，A′W 会转开。" },
          { text: "没有不变平面", why: "把法向 n 拖到 (1,1,1) 方向。" },
        ],
        conclusion: "A′(1,−1,0)ᵀ=(0,1,−1)ᵀ，A′(0,1,−1)ᵀ=(−1,1,0)ᵀ，都留在 x₁+x₂+x₃=0 里；A′ε₃=2ε₃。取这三个向量作基，矩阵就化成准对角形。",
      },
    },
  };

  const CANDIDATES = [
    ["z", "x₃ 轴", { kind: "line", u: [0, 0, 1.5] }],
    ["x", "x₁ 轴", { kind: "line", u: [1.5, 0, 0] }],
    ["xy", "x₁x₂ 平面", { kind: "plane", n: [0, 0, 1.5] }],
    ["xz", "x₁x₃ 平面", { kind: "plane", n: [0, 1.5, 0] }],
    ["sum", "x₁+x₂+x₃=0", { kind: "plane", n: [1, 1, 1] }],
  ];

  function invariantLab(root) {
    const lab = K.labShell(root, {
      title: "σW 有没有离开 W",
      task: "绿色是候选子空间 W，紫色是它的像 AW。拖动金色圆点改变候选直线的方向或候选平面的法向；AW 与 W 重合、W 加深时，W 就是不变子空间。",
    });
    const state = { key: "standard", kind: "plane", u: [1, 0.5, 1], n: [0.5, 1, 1.5] };
    const toolbar = el("div", "ch7l-toolbar");
    const kindBar = el("div", "ch7l-toolbar");
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    body.append(stage, side);
    lab.append(toolbar, body);
    const scene = S().create(stage, { range: 2.6, label: "候选子空间与它的像", hint: "拖动空白处旋转 · 拖动圆点改变候选", yaw: -0.8, pitch: 0.4 });
    const gateHost = el("div");
    const quick = el("div", "ch7l-actions ch7l-quick");
    const info = el("div", "ch7l-card");
    const result = el("div", "ch7l-result");
    const blockBox = el("div", "ch7l-card");
    blockBox.hidden = true;
    side.append(gateHost, kindBar, quick, info, result, blockBox);
    let flow = null;
    const preset = () => INVARIANT_PRESETS[state.key];

    function analyse() {
      const A = K.mat(preset().A);
      if (state.kind === "line") {
        const u = K.vec(state.u);
        const Au = K.matVec(A, u);
        const inv = K.isZeroVec(K.cross3(u, Au));
        return { A, u, Au, inv };
      }
      const n = K.vec(state.n);
      const basis = K.nullspace([n]);
      const images = basis.map((w) => K.matVec(A, w));
      const inv = images.every((w) => M().isZero(K.dotF(n, w)));
      // real eigenvectors of these presets: only λ = 2, eigen-line ker(A − 2E)
      const eig = K.nullspace(K.sub(A, K.scaleMat(K.identity(3), 2)));
      const hasEig = eig.some((e) => M().isZero(K.dotF(n, e)));
      return { A, n, basis, images, inv, hasEig };
    }

    const angleBetween = (a, b) => {
      const c = Math.abs(V().dot(a, b)) / (V().len(a) * V().len(b) || 1);
      return (Math.acos(Math.min(1, c)) * 180) / Math.PI;
    };

    function scaled(v, len) {
      const l = V().len(v);
      return l < 1e-9 ? v : v.map((x) => (x / l) * len);
    }

    function redraw() {
      const r = analyse();
      const kind = state.kind; // the closure must match the analysis it was built from
      const W = "subspace";
      scene.setObjects(() => {
        const objs = [];
        if (kind === "line") {
          const u = numVec(r.u);
          const Au = numVec(r.Au);
          // Highlight when invariant: the same colour with a glow underneath.
          if (r.inv) objs.push({ type: "line", dir: u, color: W, width: 7, alpha: 0.16 });
          objs.push({ type: "line", dir: u, color: W, width: 2.6, label: r.inv ? "AW=W" : "W" });
          // AW stays on the picture as a ghost, also when it lands on W
          objs.push({ type: "line", dir: Au, color: "image", width: 1.8, ghost: true, alpha: 0.6, label: r.inv ? undefined : "AW" });
          objs.push({ type: "arrow", to: u, color: "drag", label: "u" });
          objs.push({ type: "arrow", to: scaled(Au, Math.min(2.4, V().len(Au))), color: "image", width: 2.4, label: "Au" });
        } else {
          const n = numVec(r.n);
          objs.push({ type: "plane", n, d: 0, color: W, alpha: r.inv ? 0.26 : 0.14, width: r.inv ? 2.2 : 1.3, label: r.inv ? "AW=W" : "W" });
          const imgs = r.images.map(numVec);
          const nImg = V().cross(imgs[0], imgs[1]);
          // AW stays on the picture as a ghost, also when it lands on W
          if (V().len(nImg) > 1e-9) objs.push({ type: "plane", n: nImg, d: 0, color: "image", ghost: true, alpha: r.inv ? 0.03 : 0.06, strokeAlpha: 0.6, width: 1.4, label: r.inv ? undefined : "AW" });
          const ws = r.basis.map(numVec);
          const tipsW = ws.map((w) => scaled(w, 1.4));
          const tipsA = imgs.map((a, i) => scaled(a, 1.4 * (V().len(a) / V().len(ws[i]))));
          // when Awᵢ lands exactly on w_j (e.g. w₂ = Aw₁) the two arrows share one label
          const same = (p, q) => V().len(V().sub(p, q)) < 0.05;
          const namesW = ws.map((_, j) => `w${"₁₂"[j]}`);
          const merged = tipsA.map((a) => tipsW.findIndex((w) => same(a, w)));
          merged.forEach((j, i) => { if (j >= 0) namesW[j] += `=Aw${"₁₂"[i]}`; });
          ws.forEach((w, i) => {
            objs.push({ type: "arrow", to: tipsW[i], color: W, width: 2.2, label: namesW[i] });
            objs.push({ type: "arrow", to: tipsA[i], color: "image", width: 2.2, label: merged[i] >= 0 ? undefined : `Aw${"₁₂"[i]}` });
          });
          objs.push({ type: "segment", a: [0, 0, 0], b: n, color: "drag", width: 1.4, dash: [3, 3] });
          objs.push({ type: "label", p: n, text: "法向 n", color: "drag" });
        }
        return objs;
      });
      let html = `<h4>${state.kind === "line" ? "候选直线" : "候选平面"}</h4>`;
      if (state.kind === "line") {
        html += `<p>${tex(`W=L(${K.latexRow(r.u)}^{T})`)}，${tex(`Au=${K.latexRow(r.Au)}^{T}`)}</p>`;
        html += r.inv ? `<p class="ch7l-ok">AW=W：u 是特征向量</p>` : `<p class="ch7l-muted">AW 与 W 夹角 ≈${angleBetween(numVec(r.u), numVec(r.Au)).toFixed(1)}°</p>`;
      } else {
        html += `<p>${tex(`W:\\ ${planeLatex(r.n)}=0`)}</p>`;
        if (r.inv) {
          html += `<p class="ch7l-ok">AW=W：W 是不变子空间</p>`;
          html += r.hasEig ? `<p class="ch7l-muted">W 中含有特征向量（x₃ 轴方向）。</p>` : `<p class="ch7l-muted">W 中没有实特征向量：每条直线都被转走，平面整体不动。</p>`;
        } else {
          const imgs = r.images.map(numVec);
          html += `<p class="ch7l-muted">AW 与 W 的夹角 ≈${angleBetween(numVec(r.n), V().cross(imgs[0], imgs[1])).toFixed(1)}°</p>`;
        }
      }
      // legend at the bottom of the readout: what the colours and the deeper W mean
      html += `<div class="ch7l-legend"><span><i class="is-w"></i>W：候选${state.kind === "line" ? "直线" : "平面"}</span><span><i class="is-aw"></i>AW：W 的像（虚线）</span><span><i class="is-same"></i>AW=W 时两者重合，W 加深</span></div>`;
      info.innerHTML = html;
      if (flow?.revealed) {
        const A = K.mat(preset().A);
        const X = K.transpose(K.mat(preset().basis));
        const Bm = K.mul(K.inv(X), K.mul(A, X));
        blockBox.hidden = false;
        blockBox.innerHTML = `<h4>适配基 ${tex(preset().basisName)}</h4>${texD(`X^{-1}AX=${K.latexMatrix(Bm)}`)}<p class="ch7l-muted">前两个基向量张成不变平面，第三个张成不变直线。</p>`;
      } else {
        blockBox.hidden = true;
      }
    }

    function setHandles() {
      scene.setHandles([
        {
          color: "drag",
          snap: 0.5,
          get: () => (state.kind === "line" ? state.u : state.n),
          set: (p) => {
            if (p.every((x) => x === 0)) return;
            if (state.kind === "line") state.u = p;
            else state.n = p;
            redraw();
          },
          end: () => flow?.acted(),
        },
      ]);
    }

    function setKind(kind) {
      state.kind = kind;
      kindBar.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b.dataset.key === kind));
      redraw();
      setHandles();
    }

    K.chips(kindBar, [["line", "候选直线"], ["plane", "候选平面"]], setKind, state.kind);
    quick.innerHTML = CANDIDATES.map(([k, label]) => `<button type="button" class="ch7l-btn" data-c="${k}">${label}</button>`).join("");
    quick.querySelectorAll("[data-c]").forEach((b) =>
      b.addEventListener("click", () => {
        const spec = CANDIDATES.find((c) => c[0] === b.dataset.c)[2];
        if (spec.kind === "line") state.u = spec.u.slice();
        else state.n = spec.n.slice();
        setKind(spec.kind);
        flow?.acted();
      }),
    );

    function load(key) {
      state.key = key;
      flow = K.predictFlow(gateHost, result, { ...preset().predict, onReveal: redraw });
      redraw();
    }
    K.chips(toolbar, Object.entries(INVARIANT_PRESETS).map(([k, v]) => [k, v.label]), load, state.key);
    setHandles();
    load("standard");
    return () => scene.destroy();
  }

  /* ================= §9 最小多项式：Krylov 序列 ================= */

  const KRYLOV_PRESETS = {
    j21: {
      label: "J(2,2)⊕J(2,1)",
      A: [[2, 0, 0], [1, 2, 0], [0, 0, 2]],
      v: [1, 0, 1],
      // look at L(v, Av) (normal (−1,0,1)) from slightly off its normal
      camera: { yaw: 2.75, pitch: 0.62 },
      predict: {
        question: "这个 A 的特征多项式是 (λ−2)³。从 v 出发依次作用 A：v、Av、A²v 在哪一步落回前面向量张成的空间，那一步的关系式就给出最小多项式。A 的最小多项式是什么？",
        options: [
          { text: "(λ−2)²", correct: true },
          { text: "λ−2", why: "A≠2E：从 v=(1,0,1)ᵀ 出发，Av 与 v 不共线。" },
          { text: "(λ−2)³", why: "多拖几个 v：A²v 总落回平面 L(v,Av)，2 次多项式已经零化 A。" },
          { text: "(λ−2)²(λ−1)", why: "1 不是 A 的特征值，最小多项式的根都是特征值。" },
        ],
        conclusion: "(A−2E)²=O，所以对每个 v 都有 A²v=4Av−4v，张成最多是平面：m=(λ−2)²。它有重因式，A 不能对角化。对照 diag(2,2,1)：A²v 同样在第 2 步落回平面，关系式却是 A²v=3Av−2v，最小多项式 (λ−1)(λ−2) 没有重因式。",
      },
    },
    d221: {
      label: "diag(2,2,1)",
      A: [[2, 0, 0], [0, 2, 0], [0, 0, 1]],
      v: [1, 1, 1],
      // L(v, Av) has normal (−1,1,0)
      camera: { yaw: 2.05, pitch: 0.3 },
      predict: {
        question: "A=diag(2,2,1)，从 v=(1,1,1)ᵀ 出发。A²v 落回 L(v,Av) 时，得到的 mᵥ 是什么？",
        options: [
          { text: "(λ−1)(λ−2)", correct: true },
          { text: "(λ−2)²", why: "落回的关系是 A²v=3Av−2v，对应 λ²−3λ+2。" },
          { text: "(λ−2)²(λ−1)", why: "这是特征多项式；A²v 已经落回平面，mᵥ 只有 2 次。" },
          { text: "λ−2", why: "v 不是特征向量，Av 与 v 不共线。" },
        ],
        conclusion: "A²v=3Av−2v，mᵥ=(λ−1)(λ−2)，它也是 A 的最小多项式：没有重因式，A 可以对角化。J(2,2)⊕J(2,1) 也在第 2 步落回平面，但那里的关系式给出 (λ−2)²，有重因式，不能对角化。",
      },
    },
    j3: {
      label: "J(2,3)",
      A: [[2, 0, 0], [1, 2, 0], [0, 1, 2]],
      v: [1, 0, 0],
      predict: {
        question: "A=J(2,3)，特征多项式是 (λ−2)³。它的最小多项式是几次？",
        options: [
          { text: "3 次", correct: true },
          { text: "1 次", why: "A≠2E。" },
          { text: "2 次", why: "从 v=ε₁ 出发，看 A²v 是否落回。" },
          { text: "4 次", why: "最小多项式整除特征多项式。" },
        ],
        conclusion: "v=ε₁ 时 v, Av, A²v 线性无关，所以没有 2 次多项式零化 A，m=(λ−2)³ 与特征多项式相同，有重因式，不能对角化。v=ε₃ 是特征向量，一步就停：mᵥ=λ−2。",
      },
    },
  };

  /* A polynomial with integer roots has a repeated factor iff some root also kills its derivative. */
  function hasRepeatedFactor(coeffs) {
    const deriv = coeffs.slice(1).map((c, k) => M().mul(c, F(k + 1)));
    const at = (p, r) => p.reduceRight((acc, c) => M().add(M().mul(acc, r), c), F(0));
    for (let r = -12; r <= 12; r += 1) if (M().isZero(at(coeffs, F(r))) && M().isZero(at(deriv, F(r)))) return true;
    return false;
  }

  function krylovLab(root) {
    const lab = K.labShell(root, {
      title: "v, Av, A²v, … 第几步落回",
      task: "拖动 v 选一个起点，然后逐个加入 Av, A²v, …。张成从直线长成平面，再长满空间；新向量第一次落回已有张成时，得到 v 的最小多项式 mᵥ。",
    });
    const state = { key: "j21", v: [1, 0, 1], seq: null, flash: 0 };
    const toolbar = el("div", "ch7l-toolbar");
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    body.append(stage, side);
    lab.append(toolbar, body);
    const scene = S().create(stage, { range: 2, label: "Krylov 序列与它的张成", hint: "拖动空白处旋转 · 拖动圆点改变 v（箭头只画方向）", yaw: -0.85, pitch: 0.4, spreadLabels: true, labelSafe: true });
    const gateHost = el("div");
    const tools = el("div", "ch7l-actions");
    tools.innerHTML = `<button type="button" class="ch7l-btn is-primary" data-next>加入下一个</button><button type="button" class="ch7l-btn" data-restart>只留 v</button><button type="button" class="ch7l-btn" data-e1>v=ε₁</button><button type="button" class="ch7l-btn" data-e3>v=ε₃</button>`;
    const info = el("div", "ch7l-card");
    const result = el("div", "ch7l-result");
    const polyBox = el("div", "ch7l-card");
    polyBox.hidden = true;
    side.append(gateHost, tools, info, result, polyBox);
    let flow = null;
    const preset = () => KRYLOV_PRESETS[state.key];
    // v is dragged; Av, A²v, A³v are images under A (fading so they stay apart).
    const COLORS = ["drag", "image", "image", "image"];
    const ALPHAS = [1, 1, 0.75, 0.55];
    const TEXT_VARS = ["--cv-drag-text", "--cv-image", "--cv-image", "--cv-image"];
    const NAMES = ["v", "Av", "A²v", "A³v"];
    const NAMES_TEX = ["v", "Av", "A^2v", "A^3v"];

    function reset() {
      state.seq = { vs: [K.vec(state.v)], stop: null };
      state.flash = 0;
    }

    /* The span that Aᵏv falls into pulses three times, then keeps a steady glow. */
    let flashAnim = 0;
    function flash() {
      cancelAnimationFrame(flashAnim);
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        state.flash = 1;
        scene.render();
        return;
      }
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / 1500);
        state.flash = t < 1 ? 1 + 1.6 * Math.abs(Math.sin(t * Math.PI * 3)) : 1;
        scene.render();
        if (t < 1) flashAnim = requestAnimationFrame(step);
      };
      flashAnim = requestAnimationFrame(step);
    }

    function next() {
      const seq = state.seq;
      if (seq.stop || seq.vs.length >= 4) return;
      const A = K.mat(preset().A);
      const w = K.matVec(A, seq.vs[seq.vs.length - 1]);
      const c = K.coordinatesIn(seq.vs, w);
      seq.vs.push(w);
      if (c) seq.stop = { k: seq.vs.length - 1, c };
      redraw();
      if (c) flash();
      flow?.acted();
    }

    function redraw() {
      const { vs, stop } = state.seq;
      const indep = stop ? vs.slice(0, -1) : vs;
      const dirs = vs.map((v) => {
        const n = numVec(v);
        const l = V().len(n);
        return l < 1e-9 ? n : n.map((x) => (x / l) * 1.6);
      });
      scene.setObjects(() => {
        const objs = [];
        const d = indep.map((_, i) => dirs[i]);
        // once Aᵏv has fallen back, the span it fell into is highlighted (pulse, then steady glow)
        const glow = stop ? state.flash : 0;
        const spanName = ["", "L(v)", "L(v, Av)", ""][indep.length];
        if (indep.length === 1) objs.push({ type: "line", dir: d[0], color: "subspace", width: glow ? 2 : 1.4, alpha: glow ? 0.9 : 0.5, dash: [5, 5], glow, label: stop ? spanName : "" });
        if (indep.length === 2) objs.push({ type: "plane", n: V().cross(d[0], d[1]), d: 0, color: "subspace", alpha: 0.13 + 0.05 * glow, width: glow ? 2 : 1.3, glow, label: spanName });
        if (indep.length === 3) objs.push({ type: "box", vectors: d, color: "subspace", alpha: 0.06 });
        dirs.forEach((p, i) => {
          const fell = stop && i === vs.length - 1;
          // The vector that falls back is highlighted with a glow of its own colour.
          if (fell) objs.push({ type: "segment", a: [0, 0, 0], b: p, color: COLORS[i], width: 8, alpha: 0.18 });
          objs.push({ type: "arrow", to: p, color: COLORS[i], width: 2.6, alpha: fell ? 1 : ALPHAS[i], label: NAMES[i] });
        });
        return objs;
      });
      const rows = vs
        .map((v, i) => `<li><span style="color:var(${TEXT_VARS[i]})">${NAMES[i]}</span> ${tex(K.latexRow(v))}</li>`)
        .join("");
      let html = `<h4>序列（张成维数 ${indep.length}）</h4><ul class="ch7l-seq">${rows}</ul>`;
      if (stop) {
        const { k, c } = stop;
        const rhs = c
          .map((x, i) => ({ x, i }))
          .filter(({ x }) => !M().isZero(x))
          .map(({ x, i }, j) => {
            const coef = M().eq(x, F(1)) ? "" : M().eq(x, F(-1)) ? "-" : lf(x);
            const sign = j === 0 || x.n < 0 ? "" : "+";
            return `${sign}${coef}${NAMES_TEX[i]}`;
          })
          .join("") || "0";
        const mv = [...c.map((x) => M().neg(x)), F(1)];
        html += `<p class="ch7l-ok">${NAMES[k]} 落回了${["", "直线 L(v)", "平面 L(v, Av)", "前面的张成"][k]}：</p><p>${tex(`${NAMES_TEX[k]}=${rhs}`)}</p><p>${tex(`m_v(\\lambda)=${K.polyFactorLatex(mv)}`)}</p>`;
      } else {
        html += `<p class="ch7l-muted">${vs.length === 1 ? "先按“加入下一个”。" : "还没有落回，继续加入。"}</p>`;
      }
      info.innerHTML = html;
      tools.querySelector("[data-next]").disabled = Boolean(stop);
      if (flow?.revealed) {
        const A = K.mat(preset().A);
        polyBox.hidden = false;
        polyBox.innerHTML = `<h4>整个矩阵</h4><p>${tex(`m_A(\\lambda)=${K.polyFactorLatex(K.minimalPolynomial(A))}`)}</p><p>${tex(`f(\\lambda)=|\\lambda E-A|=${K.polyFactorLatex(K.charPolynomial(A))}`)}</p><p class="${hasRepeatedFactor(K.minimalPolynomial(A)) ? "ch7l-bad" : "ch7l-ok"}">${tex("m_A")} ${hasRepeatedFactor(K.minimalPolynomial(A)) ? "有重因式，A 不能对角化" : "没有重因式，A 可以对角化"}。</p><p class="ch7l-muted">每个 ${tex("m_v")} 都整除 ${tex("m_A")}，${tex("m_A")} 又整除 f。</p>`;
      } else polyBox.hidden = true;
    }

    scene.setHandles([
      {
        color: "drag",
        snap: 0.5,
        get: () => state.v,
        set: (p) => {
          if (p.every((x) => x === 0)) return;
          state.v = p;
          reset();
          redraw();
        },
      },
    ]);
    tools.querySelector("[data-next]").addEventListener("click", next);
    tools.querySelector("[data-restart]").addEventListener("click", () => {
      reset();
      redraw();
    });
    tools.querySelector("[data-e1]").addEventListener("click", () => {
      state.v = [1.5, 0, 0];
      reset();
      redraw();
    });
    tools.querySelector("[data-e3]").addEventListener("click", () => {
      state.v = [0, 0, 1.5];
      reset();
      redraw();
    });

    function load(key) {
      state.key = key;
      state.v = preset().v.slice();
      scene.setCamera(preset().camera || { yaw: -0.85, pitch: 0.4 });
      reset();
      flow = K.predictFlow(gateHost, result, { ...preset().predict, onReveal: redraw });
      redraw();
    }
    K.chips(toolbar, Object.entries(KRYLOV_PRESETS).map(([k, v]) => [k, v.label]), load, state.key);
    load("j21");
    return () => {
      cancelAnimationFrame(flashAnim);
      scene.destroy();
    };
  }

  K.register("image-and-kernel", kernelLab);
  K.register("invariant-subspaces", invariantLab);
  K.register("minimal-polynomial", krylovLab);
})();
