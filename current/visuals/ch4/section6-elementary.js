/*
 * Chapter 4 §6 初等矩阵: what each elementary matrix does to the plane.
 * Mode 1: pick one elementary row operation, see I -> E and the grid under E
 *         (swap = reflection, scale = stretch, row-add = shear; det E = -1, k, 1).
 * Mode 2: build an invertible A as a product of elementary matrices, one step
 *         at a time, and watch the grid arrive at A. Each finished step leaves
 *         its unit-square image as a dashed ghost named by its product, so the
 *         chain I → E₁ → E₂E₁ → E₃E₂E₁ → E₄E₃E₂E₁ = A stays on the picture.
 * Overrides the step-only renderer registered in core-presentation.js.
 */
(() => {
  const tex = (s) => (window.texInline ? window.texInline(s) : s);
  const texD = (s) => (window.texDisplay ? window.texDisplay(s) : s);
  const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const mul = (A, B) => [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
  ];
  const det = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const I = [[1, 0], [0, 1]];
  const lerp = (A, B, t) => A.map((r, i) => r.map((v, j) => v + (B[i][j] - v) * t));
  /*
   * Exact values. Every entry here is a multiple of 1/2 (exact in binary), or 1/k for
   * such a k (k = 3/2 gives 2/3, k = 5/2 gives 2/5), so a small denominator always fits.
   */
  const ratio = (x) => {
    for (let d = 1; d <= 64; d += 1) {
      const n = Math.round(x * d);
      if (Math.abs(n / d - x) < 1e-9) return [n, d];
    }
    return [x, 1];
  };
  // TeX: 2, -\tfrac{1}{2}
  const fmt = (x) => {
    const [n, d] = ratio(x);
    if (d === 1) return String(n);
    return `${n < 0 ? "-" : ""}\\tfrac{${Math.abs(n)}}{${d}}`;
  };
  // plain text for a slider readout: 2, −1/2
  const txt = (x) => {
    const [n, d] = ratio(x);
    return `${n < 0 ? "−" : ""}${Math.abs(n)}${d === 1 ? "" : `/${d}`}`;
  };
  // c·v in TeX: y, -y, 2y, \tfrac{1}{2}x
  const coef = (c, v) => (c === 0 ? "0" : c === 1 ? v : c === -1 ? `-${v}` : `${fmt(c)}${v}`);
  const texM = (A) => `\\begin{pmatrix}${fmt(A[0][0])}&${fmt(A[0][1])}\\\\${fmt(A[1][0])}&${fmt(A[1][1])}\\end{pmatrix}`;

  /* Elementary operations on 2x2. */
  function elementary(op) {
    if (op.type === "swap") return { E: [[0, 1], [1, 0]], label: "R_1\\leftrightarrow R_2", inv: "R_1\\leftrightarrow R_2", geo: "关于直线 y=x 的反射", det: -1 };
    if (op.type === "scale") {
      const E = op.row === 0 ? [[op.k, 0], [0, 1]] : [[1, 0], [0, op.k]];
      const axis = op.row === 0 ? "x" : "y";
      const times = tex(fmt(Math.abs(op.k)));
      return { E, label: `R_${op.row + 1}\\leftarrow ${fmt(op.k)}R_${op.row + 1}`, inv: `R_${op.row + 1}\\leftarrow ${fmt(1 / op.k)}R_${op.row + 1}`, geo: Math.abs(op.k) === 1 ? (op.k < 0 ? `沿 ${axis} 方向翻转，长度不变` : "每个点都不动") : op.k < 0 ? `沿 ${axis} 方向伸缩 ${times} 倍并翻转` : `沿 ${axis} 方向伸缩 ${times} 倍`, det: op.k };
    }
    // add: R_i <- R_i + c R_j
    const E = [[1, 0], [0, 1]];
    E[op.row][1 - op.row] = op.c;
    const moving = op.row === 0 ? "x" : "y";
    const by = op.row === 0 ? "y" : "x";
    const sign = op.c < 0 ? "-" : "+";
    return { E, label: `R_${op.row + 1}\\leftarrow R_${op.row + 1}${sign}${Math.abs(op.c) === 1 ? "" : fmt(Math.abs(op.c))}R_${2 - op.row}`, inv: `R_${op.row + 1}\\leftarrow R_${op.row + 1}${op.c < 0 ? "+" : "-"}${Math.abs(op.c) === 1 ? "" : fmt(Math.abs(op.c))}R_${2 - op.row}`, geo: `剪切：每个点的 ${moving} 坐标加上 ${tex(coef(op.c, by))}`, det: 1 };
  }

  /*
   * Drawing: grid image under M, unit square, e1/e2 images.
   * opts.view "build" frames the first quadrant, where the chain I → … → A lives.
   * opts.ghosts: earlier unit-square images [{ M, text, spot }], drawn dashed at 35%
   * under the current one; opts.tag names the current image at its spot.
   */
  const FONT = "'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
  function drawPlane(canvas, M, opts = {}) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const style = getComputedStyle(canvas);
    const col = (name, fb) => style.getPropertyValue(name).trim() || fb;
    const v1 = col("--cv-v1", "#2a64a8");
    const v2 = col("--cv-v2", "#c4552f");
    const image = col("--cv-image", "#8c4f86");
    const line = col("--cv-grid-major", "#e2ddd0");
    const muted = col("--cv-axis", "#8a8d84");
    const paper = col("--cv-paper", "#fdfcf8");
    let s = Math.min(w, h) / 8.4;
    let cx = w / 2;
    let cy = h / 2;
    if (opts.view === "build") {
      const [x0, x1, y0, y1] = BUILD_VIEW;
      s = Math.min(w / (x1 - x0), h / (y1 - y0));
      cx = w / 2 - (s * (x0 + x1)) / 2;
      cy = h / 2 + (s * (y0 + y1)) / 2;
    }
    const at = (G, x, y) => [cx + (G[0][0] * x + G[0][1] * y) * s, cy - (G[1][0] * x + G[1][1] * y) * s];
    const P = (x, y) => at(M, x, y);
    const Praw = (x, y) => [cx + x * s, cy - y * s];
    const square = (G) => {
      ctx.beginPath();
      [at(G, 0, 0), at(G, 1, 0), at(G, 1, 1), at(G, 0, 1)].forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
      ctx.closePath();
    };
    // reference grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = line;
    for (let k = -8; k <= 8; k += 1) {
      ctx.beginPath(); ctx.moveTo(...Praw(k, -8)); ctx.lineTo(...Praw(k, 8)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(...Praw(-8, k)); ctx.lineTo(...Praw(8, k)); ctx.stroke();
    }
    // transformed grid
    ctx.strokeStyle = `color-mix(in srgb, ${image} 34%, transparent)`;
    ctx.lineWidth = 1.1;
    for (let k = -8; k <= 8; k += 1) {
      ctx.beginPath(); ctx.moveTo(...P(k, -8)); ctx.lineTo(...P(k, 8)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(...P(-8, k)); ctx.lineTo(...P(8, k)); ctx.stroke();
    }
    // axes
    ctx.strokeStyle = muted;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    // ghosts of the earlier steps: same colour, dashed, 35%, under the current image
    const ghosts = opts.ghosts || [];
    ghosts.forEach((g) => {
      square(g.M);
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = image;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([6, 5]);
      ctx.stroke();
      ctx.restore();
    });
    // unit square image
    square(M);
    // the image of the unit square is a result; a reversed orientation is dashed
    // canvas colours take no color-mix(): tints are the same colour at a low alpha
    ctx.save();
    ctx.globalAlpha = det(M) < 0 ? 0.07 : 0.12;
    ctx.fillStyle = image;
    ctx.fill();
    if (ghosts.length) {
      // the current image is the focus: a wide halo of the same colour underneath
      ctx.globalAlpha = 0.16;
      ctx.strokeStyle = image;
      ctx.lineWidth = 7;
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = image;
    ctx.lineWidth = 1.6;
    if (det(M) < 0) ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    // basis images
    const arrow = (to, color, label) => {
      const [x0, y0] = P(0, 0);
      const [x1, y1] = to;
      const a = Math.atan2(y1 - y0, x1 - x0);
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * 8, y1 - Math.sin(a) * 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.45) * 11, y1 - Math.sin(a - 0.45) * 11); ctx.lineTo(x1 - Math.cos(a + 0.45) * 11, y1 - Math.sin(a + 0.45) * 11); ctx.closePath(); ctx.fill();
      if (label) {
        // a paper halo keeps the label readable where it crosses grid lines and ghosts
        ctx.font = `700 13px ${FONT}`;
        ctx.lineJoin = "round";
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = paper;
        ctx.strokeText(label, x1 + 6, y1 - 6);
        ctx.fillText(label, x1 + 6, y1 - 6);
      }
    };
    arrow(P(1, 0), v1, opts.e1 ?? "Ee₁");
    arrow(P(0, 1), v2, opts.e2 ?? "Ee₂");
    // names of the images, beside a corner: spot.v is that corner of the unit square
    const name = (G, text, spot, { size, alpha }) => {
      const [x, y] = at(G, ...spot.v);
      const gap = 8;
      const place = {
        left: [x - gap, y, "right", "middle"],
        right: [x + gap, y, "left", "middle"],
        above: [x, y - gap, "center", "bottom"],
        below: [x, y + gap, "center", "top"],
      }[spot.side];
      ctx.save();
      ctx.font = `600 ${size}px ${FONT}`;
      ctx.textAlign = place[2];
      ctx.textBaseline = place[3];
      // keep the name inside the canvas
      const tw = ctx.measureText(text).width;
      const left = place[2] === "left" ? place[0] : place[2] === "right" ? place[0] - tw : place[0] - tw / 2;
      const tx = place[0] + Math.max(0, 4 - left) - Math.max(0, left + tw - (w - 4));
      ctx.lineJoin = "round";
      ctx.lineWidth = 4;
      ctx.strokeStyle = paper;
      ctx.strokeText(text, tx, place[1]);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = image;
      ctx.fillText(text, tx, place[1]);
      ctx.restore();
    };
    // the ghosts' names stay readable: nearly the size of the current one
    ghosts.forEach((g) => name(g.M, g.text, g.spot, { size: 13.5, alpha: 0.85 }));
    if (opts.tag) name(M, opts.tag.text, opts.tag.spot, { size: 14, alpha: 1 });
  }

  function animate(from, to, paint, done) {
    if (reduceMotion()) {
      paint(to);
      done?.();
      return () => {};
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / 650);
      paint(lerp(from, to, 1 - (1 - t) ** 3));
      if (t < 1) raf = requestAnimationFrame(step);
      else done?.();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }

  /* A = [[2,1],[1,1]] = E₄E₃E₂E₁: E₁ acts first, every later step multiplies on the left. */
  const BUILD = [
    { op: { type: "scale", row: 1, k: 0.5 }, why: "先把 y 方向压成一半" },
    { op: { type: "scale", row: 0, k: 2 }, why: "再把 x 方向拉长 2 倍" },
    { op: { type: "add", row: 0, c: 2 }, why: "水平剪切：x 坐标加上 2y" },
    { op: { type: "add", row: 1, c: 0.5 }, why: "竖直剪切：y 坐标加上 x/2" },
  ];
  const TARGET = [[2, 1], [1, 1]];
  // the region x ∈ [−0.6, 4], y ∈ [−0.5, 2.5] holds every image of the chain and its name
  const BUILD_VIEW = [-0.6, 4, -0.5, 2.5];
  /*
   * Where each image of the chain is named (k = 0 … 4): a corner of the unit square
   * and the side to write on. The images are I = [0,1]², E₁ = [0,1]×[0,½],
   * E₂E₁ = [0,2]×[0,½], E₃E₂E₁ with corners (2,0), (3,½), (1,½), and A; these spots
   * keep the five names apart and off the arrows Ae₁, Ae₂.
   */
  const SPOTS = [
    { v: [0, 1], side: "left" },
    { v: [0, 1], side: "left" },
    { v: [1, 0], side: "below" },
    { v: [1, 1], side: "right" },
    { v: [1, 1], side: "above" },
  ];
  const SUB = "₀₁₂₃₄₅₆₇₈₉";
  // E_k ⋯ E_1 as a matrix, and its name: I, E₁, E₂E₁, …
  const chainAt = (k) => BUILD.slice(0, k).reduce((M, step) => mul(elementary(step.op).E, M), I);
  const chainName = (k) => (k ? Array.from({ length: k }, (_, i) => `E${SUB[k - i]}`).join("") : "I");
  const chainTex = (k) => (k ? Array.from({ length: k }, (_, i) => `E_${k - i}`).join("") : "I");
  // the same four factors in the opposite order: E₁E₂E₃E₄ = (4 4; 1/4 1/2), not A
  const WRONG_ORDER = BUILD.reduce((W, step) => mul(W, elementary(step.op).E), I);

  function renderInteractive(root, section, page) {
    if (!root) return undefined;
    // Picture first: the lab sits above the theorem block.
    const formal = page?.querySelector("#elementary-matrices-formal");
    if (formal && formal.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING) formal.before(root);
    root.innerHTML = `<h2>交互实验</h2>
      <section class="ch3l-lab el6-lab">
        <header class="ch3l-head"><h3>初等矩阵在平面上做什么</h3><p data-el-task></p></header>
        <div class="ch3l-toolbar" data-el-modes></div>
        <div data-el-gate="single"></div>
        <div data-el-gate="build" hidden></div>
        <div class="ch3l-body">
          <div class="el6-stage"><canvas class="el6-canvas" aria-label="初等矩阵作用下的网格"></canvas></div>
          <aside class="ch3l-side" data-el-side></aside>
        </div>
      </section>`;
    const canvas = root.querySelector("canvas");
    const side = root.querySelector("[data-el-side]");
    const task = root.querySelector("[data-el-task]");
    // ghosts: unit-square images of the finished build steps; moving: an animation is running
    const state = { mode: "single", op: { type: "swap" }, shown: I, build: 0, ghosts: [], moving: false };
    let stop = () => {};
    let ro = null;
    let buildGate = null;
    const paint = (M) => {
      if (!canvas.isConnected) {
        // The lesson shell re-renders on navigation; release everything once detached.
        ro?.disconnect();
        stop();
        return;
      }
      state.shown = M;
      if (state.mode !== "build") {
        drawPlane(canvas, M, {});
        return;
      }
      // names and arrow labels belong to a finished step, so they wait for the motion to end
      const k = state.build;
      const settled = !state.moving;
      const last = k === BUILD.length;
      drawPlane(canvas, M, {
        view: "build",
        e1: settled && k === 0 ? "e₁" : settled && last ? "Ae₁" : "",
        e2: settled && k === 0 ? "e₂" : settled && last ? "Ae₂" : "",
        ghosts: state.ghosts,
        tag: settled ? { text: last ? `${chainName(k)} = A` : chainName(k), spot: SPOTS[k] } : null,
      });
    };

    function singleSide() {
      const e = elementary(state.op);
      const typeBtn = (t, l) => `<button type="button" class="ch3l-chip${state.op.type === t ? " is-active" : ""}" data-type="${t}">${l}</button>`;
      let param = "";
      if (state.op.type === "scale") param = `<label class="ch3l-range"><span>${tex("k")}</span><input type="range" min="-2" max="3" step="0.5" value="${state.op.k}" data-k /><b>${txt(state.op.k)}</b></label><div class="ch3l-actions">${[0, 1].map((r) => `<button type="button" class="ch3l-chip${state.op.row === r ? " is-active" : ""}" data-row="${r}">第 ${r + 1} 行</button>`).join("")}</div>`;
      if (state.op.type === "add") param = `<label class="ch3l-range"><span>${tex("c")}</span><input type="range" min="-2" max="2" step="0.5" value="${state.op.c}" data-c /><b>${txt(state.op.c)}</b></label><div class="ch3l-actions">${[1, 0].map((r) => `<button type="button" class="ch3l-chip${state.op.row === r ? " is-active" : ""}" data-row="${r}">${tex(r === 1 ? "R_2\\leftarrow R_2+cR_1" : "R_1\\leftarrow R_1+cR_2")}</button>`).join("")}</div>`;
      side.innerHTML = `<div class="ch3l-card"><h4>选择一次行变换</h4><div class="ch3l-actions">${typeBtn("swap", "换行")}${typeBtn("scale", "倍乘")}${typeBtn("add", "倍加")}</div>${param}</div>
        <div class="ch3l-card"><h4>对 I 做 ${tex(e.label)}</h4>${texD(`I=${texM(I)}\\ \\longrightarrow\\ E=${texM(e.E)}`)}<p>${e.geo}</p><p>${tex(`\\det E=${fmt(e.det)}`)}：${Math.abs(e.det) === 1 ? "单位正方形的面积不变" : `单位正方形的面积变为原来的 ${tex(fmt(Math.abs(e.det)))} 倍`}${e.det < 0 ? "，定向翻转" : ""}。</p><p class="ch3l-muted">逆变换 ${tex(e.inv)}，所以 E 可逆。</p></div>`;
      side.querySelectorAll("[data-type]").forEach((b) => b.addEventListener("click", () => {
        const t = b.dataset.type;
        state.op = t === "swap" ? { type: "swap" } : t === "scale" ? { type: "scale", row: 1, k: 2 } : { type: "add", row: 1, c: 2 };
        update();
      }));
      side.querySelectorAll("[data-row]").forEach((b) => b.addEventListener("click", () => { state.op.row = Number(b.dataset.row); update(); }));
      side.querySelector("[data-k]")?.addEventListener("input", (ev) => {
        const k = Number(ev.target.value);
        state.op.k = k === 0 ? 0.5 : k; // multiplying a row by 0 is not an elementary operation
        update();
      });
      side.querySelector("[data-c]")?.addEventListener("input", (ev) => { state.op.c = Number(ev.target.value); update(); });
    }

    function buildSide() {
      const k = state.build;
      const picked = !buildGate || buildGate.picked;
      const list = BUILD.map((s, i) => {
        const e = elementary(s.op);
        const cls = i < k ? "is-done" : i === k ? "is-next" : "";
        return `<li class="${cls}">${tex(`E_${i + 1}=${texM(e.E)}`)}<small class="el6-why">${s.why}</small></li>`;
      }).join("");
      const note = k === BUILD.length
        ? `网格到达 A：${tex("A=E_4E_3E_2E_1")}，A 是初等矩阵的乘积。`
        : k === 0
          ? `网格依次经过 ${tex("E_1")}、${tex("E_2")}、${tex("E_3")}、${tex("E_4")} 四步。`
          : `再作用 ${BUILD.length - k} 步到达 A。`;
      // data-la-free: this button waits for the build prediction, which this lab tracks itself
      side.innerHTML = `<div class="ch3l-actions"><button type="button" class="ch3l-btn is-primary" data-next data-la-free${!picked || k >= BUILD.length ? " disabled" : ""}${picked ? "" : ' title="先在上方作出预测"'}>作用下一步</button><button type="button" class="ch3l-btn" data-restart>重来</button></div>
        <div class="ch3l-card"><h4>目标 ${tex(`A=${texM(TARGET)}`)}</h4><ol class="el6-steps">${list}</ol></div>
        <div class="ch3l-card"><h4>当前乘积</h4>${texD(`${chainTex(k)}=${texM(chainAt(k))}`)}<p>${note}</p></div>`;
      side.querySelector("[data-next]").addEventListener("click", () => {
        if (state.build >= BUILD.length || (buildGate && !buildGate.picked)) return;
        const done = state.build;
        const from = chainAt(done);
        const to = mul(elementary(BUILD[done].op).E, from);
        // the finished image stays behind as a ghost, named by its product
        state.ghosts.push({ M: from, text: chainName(done), spot: SPOTS[done] });
        state.build = done + 1;
        buildSide();
        stop();
        state.moving = true;
        stop = animate(state.shown, to, paint, () => {
          state.moving = false;
          paint(to);
          if (state.build === BUILD.length) buildGate?.acted();
        });
      });
      side.querySelector("[data-restart]").addEventListener("click", () => {
        state.build = 0;
        state.ghosts = [];
        buildSide();
        stop();
        state.moving = true;
        stop = animate(state.shown, I, paint, () => {
          state.moving = false;
          paint(I);
        });
      });
    }

    function update() {
      if (state.mode === "single") {
        singleSide();
        const to = elementary(state.op).E;
        stop();
        stop = animate(state.shown, to, paint);
      } else {
        buildSide();
      }
    }

    const TASKS = {
      single: "选一种行变换，先看它把单位矩阵变成哪个 E，再看 E 把整张网格变成什么样。淡色网格是原来的坐标网格。",
      build: "可逆矩阵可以写成初等矩阵的乘积。逐步作用四个初等矩阵，看网格怎样一步步到达 A。虚线是前几步的像。",
    };
    const modes = root.querySelector("[data-el-modes]");
    const modeDefs = [["single", "一个初等矩阵"], ["build", "用初等矩阵拼出 A"]];
    modes.innerHTML = modeDefs.map(([k, l]) => `<button type="button" class="ch3l-chip${k === state.mode ? " is-active" : ""}" data-mode="${k}">${l}</button>`).join("");
    modes.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
      modes.querySelectorAll("[data-mode]").forEach((x) => x.classList.toggle("is-active", x === b));
      state.mode = b.dataset.mode;
      task.textContent = TASKS[state.mode];
      root.querySelector('[data-el-gate="single"]').hidden = state.mode !== "single";
      root.querySelector('[data-el-gate="build"]').hidden = state.mode !== "build";
      // a fresh start: no ghosts from an earlier build
      stop();
      state.moving = false;
      state.ghosts = [];
      if (state.mode === "build") {
        state.build = 0;
        paint(I);
      }
      update();
    }));
    task.textContent = TASKS.single;

    // Prediction before the first exploration result is explained.
    const gate = root.querySelector('[data-el-gate="single"]');
    gate.innerHTML = `<div class="ch3l-predict"><div class="ch3l-predict-q"><span>先预测</span><p>${tex("R_2\\leftarrow R_2+2R_1")} 对应的 ${tex("E=\\begin{pmatrix}1&0\\\\2&1\\end{pmatrix}")} 会把单位正方形变成什么？</p></div>
      <div class="ch3l-predict-options">${(window.LAStableShuffle || ((a) => a))([
        ["沿竖直方向剪切，面积不变", true, ""],
        ["沿水平方向剪切，面积不变", false, "E 改变的是第 2 个坐标：(x,y) 变成 (x, 2x+y)。"],
        ["竖直方向拉长 2 倍，面积变为 2 倍", false, "det E=1，面积不变。"],
        ["绕原点旋转", false, "e₁ 被送到 (1,2)，e₂ 保持不动，长度变了，所以不是旋转。"],
      ], "visuals/ch4/section6-elementary.js").map(([t, ok, why], i) => `<button type="button" data-i="${i}" data-ok="${ok}" data-why="${why}">${t}</button>`).join("")}</div><p class="ch3l-predict-feedback" hidden></p></div>`;
    // predict → act → reveal: the verdict opens only after the student also acts on the lab
    let picked = null;
    let revealed = false;
    const fb = gate.querySelector(".ch3l-predict-feedback");
    const reveal = () => {
      if (revealed || !picked) return;
      revealed = true;
      const ok = picked.dataset.ok === "true";
      gate.querySelectorAll("[data-i]").forEach((x) => x.classList.remove("is-picked"));
      picked.classList.add(ok ? "is-right" : "is-wrong");
      gate.querySelector(".ch3l-predict").classList.add("is-done");
      fb.innerHTML = ok
        ? "✓ 每个点的 y 坐标加上 2x，x 坐标不变：竖直方向的剪切。倍加矩阵的行列式为 1，所以面积不变，这正是第二章“倍加不改变行列式”的几何原因。"
        : `和图中看到的不一致：${picked.dataset.why}`;
    };
    gate.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => {
      if (revealed) return;
      picked = b;
      gate.querySelectorAll("[data-i]").forEach((x) => x.classList.toggle("is-picked", x === b));
      fb.hidden = false;
      fb.textContent = "已记下你的预测。现在动手操作一次，结论随后出现。";
    }));
    // a click in either prediction box is not an action on the lab
    const acted = (e) => { if (!e.target.closest("[data-el-gate]")) reveal(); };
    ["input", "change", "pointerup"].forEach((t) => root.addEventListener(t, acted));
    root.addEventListener("click", (e) => { if (e.target.closest("button") && !e.target.closest("[data-el-gate]")) reveal(); });

    /*
     * The build has its own prediction: in which order do the four factors end up?
     * The steps open once it is picked; the verdict waits until the grid reaches A.
     */
    const buildBox = root.querySelector('[data-el-gate="build"]');
    const wrong = `${tex("E_1E_2E_3E_4")} 算出来是 ${tex(texM(WRONG_ORDER))}`;
    buildGate = window.LAPredictGate?.mount(buildBox, {
      question: `按 ${tex("E_1")}、${tex("E_2")}、${tex("E_3")}、${tex("E_4")} 的次序一步步作用（${tex("E_1")} 最先），网格最后停在哪个乘积上？`,
      options: [
        [tex("E_4E_3E_2E_1"), true, ""],
        [tex("E_1E_2E_3E_4"), false, `每作用一步，新的初等矩阵乘在左边，最先作用的 ${tex("E_1")} 留在最右边。${wrong}，网格停不到 A。`],
        ["两种次序结果一样", false, `矩阵乘法一般不能交换次序，${wrong}，不等于 A。`],
      ],
      key: "visuals/ch4/section6-elementary.js#build",
      right: `✓ 每作用一步，新的初等矩阵就乘在左边。图中的虚线依次是 ${tex("I")}、${tex("E_1")}、${tex("E_2E_1")}、${tex("E_3E_2E_1")} 的像，最后到达 ${tex("A=E_4E_3E_2E_1")}。`,
      root: buildBox,
      manual: true,
      onPick: () => {
        const note = buildBox.querySelector(".ch3l-predict-feedback");
        if (note) note.textContent = "已记下你的预测。按“作用下一步”走完四步，结论随后出现。";
        if (state.mode === "build") buildSide();
      },
    }) || null;

    ro = new ResizeObserver(() => paint(state.shown));
    ro.observe(canvas);
    update();
    return () => {
      stop();
      ro.disconnect();
    };
  }

  function renderFormal(root) {
    if (!root) return;
    const block = (title, math, text) => `<article class="ch3l-theorem"><h3>${title}</h3>${math ? `<div class="ch3l-theorem-math">${texD(math)}</div>` : ""}<p>${text}</p></article>`;
    root.innerHTML = `<h2>定理概念</h2><div class="ch3l-formal">
      ${block("对 I 做一次行变换，得到初等矩阵", "P(i,j),\\qquad P(i(k))\\ (k\\ne0),\\qquad P(i,j(k))", "三类初等矩阵分别来自交换 I 的两行、用非零数 k 乘 I 的一行、把 I 的第 j 行的 k 倍加到第 i 行。")}
      ${block("左乘做行变换，右乘做列变换", "P\\,A=\\text{对 }A\\text{ 做同一行变换},\\qquad A\\,P=\\text{对 }A\\text{ 做对应的列变换}", `左乘时，P 的每一行组合 A 的各行，所以 P 记录的行规则原样作用到 A 上。三类初等矩阵都可逆，逆矩阵就是逆变换对应的初等矩阵；它们的行列式分别是 ${tex("-1")}、${tex("k")}、${tex("1")}。`)}
      ${block("可逆矩阵 = 初等矩阵的乘积", "A\\ \\text{可逆}\\iff A=P_1P_2\\cdots P_s", "可逆矩阵可以经过初等行变换化成 I，把这些变换倒过来，就把 A 写成了初等矩阵的乘积。几何上，任何可逆线性变换都由若干次剪切、伸缩和反射复合而成。")}
      <div class="ch3l-pitfalls"><h3>容易错在哪里</h3><ul>
        <li>把 ${tex("R_2\\leftarrow R_2+2R_1")} 的 2 写到第 1 行第 2 列。对 I 做这次变换，改变的是第 2 行，2 应落在 (2,1) 位置。</li>
        <li>把左乘和右乘弄反：行变换左乘，列变换右乘。</li>
        <li>以为“一行乘 0”也是初等变换。它不可逆，不对应初等矩阵。</li>
      </ul></div></div>`;
  }

  window.defineChapter4Renderer?.("elementary-matrices", { formal: renderFormal, interactive: renderInteractive });
})();
