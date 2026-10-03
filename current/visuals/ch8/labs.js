/*
 * Chapter 8 (λ-矩阵) labs, figures and theorem blocks.
 *   §1 lambda-matrix          — scan λ along the real line: rank of M(λ₀) and |M(λ)|
 *   §2 smith-form             — a Smith workbench: pick the corner, divide, repeat
 *   §3 invariant-factors      — the wall of k-th minors; D_k survives elementary operations
 *   §4 similarity-criterion   — theorem blocks with a figure (no lab)
 *   §5 elementary-divisors    — invariant factors split into prime-power blocks, field by field
 *   §6 jordan-derivation      — kernel layers of N=A−λ₀E and the chain tower
 *   §7 rational-canonical-form — the companion matrix as shift plus feedback
 * Built on the Chapter 7 kit (lab shell, prediction gate, canvas plane) and on
 * Ch8Poly (exact polynomials in λ). Every decision is exact; floats only draw.
 */
(() => {
  const K = window.Ch7Kit;
  const P = window.Ch8Poly;
  if (!K || !P) return;
  const { tex, texD, el, F, lf } = K;
  const M = () => window.Ch3Math;
  const minus = (s) => String(s).replace(/-/g, "−");

  /* ---------- shared pieces ---------- */

  const gate = (gateHost, result, spec) => K.predictFlow(gateHost, result, spec);

  /* Lab skeleton: toolbar, gate, stage + side cards, result. */
  function skeleton(root, { title, task, cards = 2, toolbars = 1 }) {
    const lab = K.labShell(root, { title, task });
    const bars = Array.from({ length: toolbars }, () => el("div", "ch7l-toolbar"));
    const gateHost = el("div");
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    const sideCards = Array.from({ length: cards }, () => el("div", "ch7l-card"));
    side.append(...sideCards);
    body.append(stage, side);
    const result = el("div", "ch7l-result");
    lab.append(...bars, gateHost, body, result);
    return { lab, bars, gateHost, stage, cards: sideCards, result };
  }

  /* Pixel-space helpers on top of the kit's plane (d.W maps pixels to world). */
  const size = (d) => [d.halfW * 2 * d.scale, d.halfH * 2 * d.scale];
  const at = (d, x, y) => d.W([x, y]);

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  const ptex = (p) => P.latex(p);
  const numMatrix = (A) => `\\begin{pmatrix}${A.map((row) => row.map(lf).join("&")).join("\\\\")}\\end{pmatrix}`;
  const pfac = (p) => P.factorLatex(p);
  const waitNote = (what) => `<p class="ch7l-muted">先在上方作出预测，${what}随后出现。</p>`;

  /* ================= §1 λ-矩阵 ================= */

  const SCAN_PRESETS = {
    jordan: {
      label: "λE−A，A 有一个 2 阶若尔当块",
      M: () => P.charMatrix([[2, 1], [0, 2]]),
      predict: {
        question: `${tex("A=\\begin{pmatrix}2&1\\\\0&2\\end{pmatrix}")}，${tex("|\\lambda E-A|=(\\lambda-2)^2")}。λ 扫到 2 时，数字矩阵 ${tex("2E-A")} 的秩是多少？`,
        options: [
          { text: "1", correct: true },
          { text: "0", why: "2E−A 的右上角是 −1，不是零矩阵。" },
          { text: "2", why: "|2E−A|=0，秩必须小于 2。" },
          { text: "由二重根决定，必为 0", why: "二重根只说明行列式在 λ=2 处有二重零点，秩要看 2E−A 本身。" },
        ],
        conclusion: "2E−A 的秩是 1，所以属于 2 的特征向量只有一个方向。换成 A=2E，特征多项式同样是 (λ−2)²，λ=2 处秩却降到 0。行列式只记录在哪里降秩，λE−A 本身还记录降多少。",
      },
    },
    scalar: {
      label: "λE−A，A=2E",
      M: () => P.charMatrix([[2, 0], [0, 2]]),
      predict: {
        question: `${tex("A=2E")}，${tex("|\\lambda E-A|=(\\lambda-2)^2")}。λ 扫到 2 时，${tex("2E-A")} 的秩是多少？`,
        options: [
          { text: "0", correct: true },
          { text: "1", why: "这是 A 有若尔当块时的情形，这里 2E−A 是零矩阵。" },
          { text: "2", why: "|2E−A|=0，秩必须小于 2。" },
          { text: "无法确定", why: "λ₀=2 代入后是一个具体的数字矩阵，它的秩是确定的。" },
        ],
        conclusion: "2E−A 是零矩阵，秩为 0，平面上每个非零向量都是特征向量。和上一组比较：两个特征多项式完全相同，λ=2 处降秩的幅度不同。",
      },
    },
    unimodular: {
      label: "U(λ)，行列式为 1",
      M: () => P.matrix([[1, [0, 1]], [0, 1]]),
      predict: {
        question: `${tex("U(\\lambda)=\\begin{pmatrix}1&\\lambda\\\\0&1\\end{pmatrix}")} 是可逆的 λ-矩阵吗？即是否有 λ-矩阵 V(λ) 使 ${tex("UV=VU=E")}？`,
        options: [
          { text: "可逆", correct: true },
          { text: "不可逆，因为元素里有 λ", why: "V(λ)=(1 −λ; 0 1) 就满足 UV=VU=E。" },
          { text: "只在 λ≠0 时可逆", why: "λ-矩阵的可逆是一个整体性质；这里 |U(λ)|=1，对每个 λ 都不降秩。" },
          { text: "需要先代入 λ 的值才能判断", why: "可逆 λ-矩阵要求逆矩阵的元素也是 λ 的多项式，这可以直接判断。" },
        ],
        conclusion: "|U(λ)|=1 是非零常数，伴随矩阵除以 1 仍是多项式矩阵，所以 U(λ)⁻¹=(1 −λ; 0 1)。扫遍整条数轴，U(λ₀) 的秩始终是 2，行列式曲线是一条水平线。",
      },
    },
    rotation: {
      label: "λE−A，|λE−A|=λ²+1",
      M: () => P.charMatrix([[0, -1], [1, 0]]),
      predict: {
        question: `${tex("|\\lambda E-A|=\\lambda^2+1")}，对每个实数 λ₀，${tex("\\lambda_0E-A")} 都满秩。${tex("\\lambda E-A")} 是可逆的 λ-矩阵吗？`,
        options: [
          { text: "不可逆", correct: true },
          { text: "可逆，因为实数 λ 处都不降秩", why: "逆矩阵的元素会带分母 λ²+1，不是多项式。" },
          { text: "可逆，因为行列式不是零多项式", why: "不是零多项式只说明秩为 2；可逆要求行列式是非零常数。" },
          { text: "取决于数域", why: "无论在哪个数域上，λ²+1 都不是非零常数。" },
        ],
        conclusion: "(λE−A)⁻¹ 的元素是 λ/(λ²+1) 一类分式，不在 P[λ] 中，所以 λE−A 不可逆。在复数 λ=±i 处它会降秩。一般地，λE−A 的行列式是 n 次多项式，λE−A 从来不是可逆的 λ-矩阵。",
      },
    },
  };

  function scanLab(root) {
    const ui = skeleton(root, {
      title: "沿数轴扫描 λ",
      task: "把 λ 换成一个数 λ₀，λ-矩阵就变成数字矩阵。拖动数轴上的 λ₀，看行列式曲线与秩怎样随 λ₀ 变化；切换上方的矩阵比较。",
    });
    const [matCard, readCard] = ui.cards;
    const state = { key: "jordan", x: 0.5 };
    let flow = null;
    ui.gateHost.addEventListener("click", () => redraw());
    const LO = -1;
    const HI = 5;
    const MID = 2;
    const AXIS = -1.5;
    const plane = K.plane2d(ui.stage, { extent: 3.1, hint: "拖动 λ₀（每次四分之一）", label: "λ₀ 沿数轴移动时的行列式与秩" });

    function data() {
      const Mx = SCAN_PRESETS[state.key].M();
      const det = P.det(Mx);
      const n = Mx.length;
      const roots = [];
      for (let q = LO * 4; q <= HI * 4; q += 1) {
        const r = F(`${q}/4`);
        if (M().isZero(P.evalAt(det, r))) roots.push(r);
      }
      return { Mx, det, n, roots };
    }

    function redraw() {
      const { Mx, det, n, roots } = data();
      const open = Boolean(flow?.predicted);
      const x0 = F(`${Math.round(state.x * 4)}/4`);
      const val = P.evalMatrix(Mx, x0);
      const r = M().rankOf(val);
      const yScale = 0.42;
      plane.setDraw((d) => {
        const X = (lam) => lam - MID;
        d.segment([X(LO) - 0.3, AXIS], [X(HI) + 0.3, AXIS], "axis", { width: 1.3 });
        for (let t = LO; t <= HI; t += 1) {
          d.segment([X(t), AXIS - 0.06], [X(t), AXIS + 0.06], "axis", { width: 1.2 });
          d.text([X(t), AXIS], minus(t), "muted", { dy: 14, align: "center", font: "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" });
        }
        d.text([X(HI) + 0.3, AXIS], "λ₀", "muted", { dy: -12, align: "right", font: "650 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" });
        if (!open) {
          d.text([0, 0.6], "先在上方作出预测", "faint", { align: "center", font: "650 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" });
          return;
        }
        const pts = [];
        for (let i = 0; i <= 240; i += 1) {
          const lam = LO + ((HI - LO) * i) / 240;
          pts.push([X(lam), AXIS + yScale * M().toNumber(P.evalAt(det, F(`${Math.round(lam * 400)}/400`)))]);
        }
        d.polyline(pts, "v1", { width: 2.4 });
        d.text([X(HI) - 0.2, Math.min(d.halfH - 0.3, pts[pts.length - 1][1])], `|M(λ)|`, "v1", { align: "right", dy: -10, font: "700 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" });
        /* rank track below the axis */
        const TRACK = AXIS - 0.55;
        d.text([X(LO), TRACK], `秩 ${n}`, "muted", { align: "left", dy: 16, font: "650 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" });
        d.segment([X(LO), TRACK], [X(HI), TRACK], "v1", { width: 3, alpha: 0.55 });
        roots.forEach((root) => {
          const rr = M().rankOf(P.evalMatrix(Mx, root));
          const rx = X(M().toNumber(root));
          d.point([rx, TRACK], "v2", { r: 5 });
          d.point([rx, AXIS], "v2", { r: 4 });
          d.text([rx, TRACK], `秩 ${rr}`, "v2", { dy: 16, align: "center", font: "700 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" });
        });
        const xv = X(M().toNumber(x0));
        const yv = AXIS + yScale * M().toNumber(P.evalAt(det, x0));
        d.segment([xv, AXIS], [xv, yv], "drag", { width: 1.4, dash: [5, 4] });
        d.point([xv, yv], "drag", { r: 4.5 });
        const right = xv > d.halfW * 0.3;
        d.text([xv, yv], `|M(λ₀)|=${minus(M().formatF(P.evalAt(det, x0)))}`, "drag", { dx: right ? -12 : 12, dy: -12, align: right ? "right" : "left" });
      });
      matCard.innerHTML = `<h4>λ-矩阵</h4><div>${texD(`M(\\lambda)=${P.latexMatrix(Mx)}`)}</div>${
        open ? `<p>${tex(`|M(\\lambda)|=${pfac(det)}`)}</p>` : ""
      }`;
      if (!open) {
        readCard.innerHTML = `<h4>代入 λ₀</h4>${waitNote("行列式曲线与秩")}`;
        return;
      }
      const drop = r < n;
      let html = `<h4>代入 λ₀=${minus(M().formatF(x0))}</h4><div>${texD(`M(${lf(x0)})=${numMatrix(val)}`)}</div>
        <p>秩 ${tex(`${r}`)}${drop ? `，<span class="ch7l-bad">比 ${n} 少 ${n - r}</span>` : "，满秩"}</p>`;
      if (state.key === "unimodular") html += `<p class="ch7l-muted">${tex("U(\\lambda)^{-1}=\\begin{pmatrix}1&-\\lambda\\\\0&1\\end{pmatrix}")} 也是 λ-矩阵。</p>`;
      if (state.key === "rotation") html += `<p class="ch7l-muted">实轴上没有降秩点；在复数 λ=±i 处秩降为 1。</p>`;
      readCard.innerHTML = html;
    }

    plane.setHandles([
      {
        color: "drag",
        snap: 0.25,
        limit: 3,
        hidden: () => !flow?.predicted,
        get: () => [state.x - MID, AXIS],
        set: (p) => {
          state.x = Math.max(LO, Math.min(HI, p[0] + MID));
          redraw();
        },
        end: () => flow?.acted(),
      },
    ]);

    function newFlow() {
      flow = gate(ui.gateHost, ui.result, { ...SCAN_PRESETS[state.key].predict, actHint: "已记下你的预测。拖动 λ₀ 扫过数轴，结论随后出现。" });
    }

    K.chips(
      ui.bars[0],
      Object.entries(SCAN_PRESETS).map(([k, v]) => [k, v.label]),
      (k) => {
        state.key = k;
        newFlow();
        redraw();
      },
      state.key,
    );
    newFlow();
    redraw();
    return () => plane.destroy();
  }

  /* ================= §2 λ-矩阵的标准形 ================= */

  /* Elementary operations in the textbook notation: [i,j], [i(c)], [i+j(φ)] for rows, braces for columns. */
  const opTex = {
    swapR: (i, j) => `[${Math.min(i, j) + 1},${Math.max(i, j) + 1}]`,
    swapC: (i, j) => `\\{${Math.min(i, j) + 1},${Math.max(i, j) + 1}\\}`,
    scaleR: (i, c) => `[${i + 1}(${lf(c)})]`,
    addR: (i, j, q) => `[${i + 1}+${j + 1}(${ptex(q)})]`,
    addC: (i, j, q) => `\\{${i + 1}+${j + 1}(${ptex(q)})\\}`,
  };

  const SMITH_PRESETS = {
    diag: {
      label: "diag(λ, λ+1)",
      A: () => P.matrix([[[0, 1], 0], [0, [1, 1]]]),
      predict: {
        question: `把 ${tex("\\begin{pmatrix}\\lambda&0\\\\0&\\lambda+1\\end{pmatrix}")} 化成标准形，左上角的 ${tex("d_1(\\lambda)")} 是什么？`,
        options: [
          { text: tex("1"), correct: true },
          { text: tex("\\lambda"), why: "λ 不整除 λ+1，标准形要求 d₁ 整除其余每个元素。" },
          { text: tex("\\lambda+1"), why: "λ+1 也不整除 λ。" },
          { text: tex("\\lambda(\\lambda+1)"), why: "这是 d₂。两个对角元之积要等于行列式 λ(λ+1)。" },
        ],
        conclusion: "λ 与 λ+1 互素，带余除法在角上留下余式 1，标准形是 diag(1, λ(λ+1))。一个对角 λ-矩阵不一定是标准形：标准形还要求对角元首一，并且每一个整除下一个。",
      },
    },
    jordan: {
      label: "λE−A，A=(2 1; 0 2)",
      A: () => P.charMatrix([[2, 1], [0, 2]]),
      predict: {
        question: `${tex("A=\\begin{pmatrix}2&1\\\\0&2\\end{pmatrix}")}。${tex("\\lambda E-A")} 的标准形是什么？`,
        options: [
          { text: tex("\\operatorname{diag}(1,(\\lambda-2)^2)"), correct: true },
          { text: tex("\\operatorname{diag}(\\lambda-2,\\lambda-2)"), why: "这是 A=2E 的情形。这里右上角是非零常数 −1，它能整除一切，d₁=1。" },
          { text: tex("\\operatorname{diag}(1,\\lambda-2)"), why: "对角元之积要等于行列式 (λ−2)²（相差一个非零常数）。" },
          { text: tex("\\operatorname{diag}(-1,(\\lambda-2)^2)"), why: "标准形的对角元取首项系数为 1 的多项式。" },
        ],
        conclusion: "−1 是非零常数，换到角上就能清掉整行整列，标准形是 diag(1,(λ−2)²)。A=2E 时 λE−A 的标准形是 diag(λ−2, λ−2)：两个特征多项式相同的矩阵，标准形不同。",
      },
    },
    pku: {
      label: "三阶 λ-矩阵",
      A: () =>
        P.matrix([
          [[1, -1], [-1, 2], [0, 1]],
          [[0, 1], [0, 0, 1], [0, -1]],
          [[1, 0, 1], [-1, 1, 0, 1], [0, 0, -1]],
        ]),
      predict: {
        question: "这个三阶 λ-矩阵的行列式是 −λ³−λ²。化成标准形 diag(d₁, d₂, d₃) 后，d₃(λ) 是什么？",
        options: [
          { text: tex("\\lambda(\\lambda+1)"), correct: true },
          { text: tex("\\lambda^2(\\lambda+1)"), why: "这是 d₁d₂d₃。d₂=λ 已经分走了一个因子 λ。" },
          { text: tex("\\lambda+1"), why: "d₂=λ 必须整除 d₃。" },
          { text: tex("\\lambda^3+\\lambda^2"), why: "这是行列式（乘以 −1），三个对角元之积才等于它。" },
        ],
        conclusion: "标准形是 diag(1, λ, λ(λ+1))。三个对角元之积是 λ²(λ+1)，与行列式只差常数 −1；整除链 1 | λ | λ(λ+1) 成立。",
      },
    },
  };

  function smithLab(root) {
    const ui = skeleton(root, {
      title: "标准形工作台",
      task: "每一步由你决定：点一个元素把它换到左上角，再用它做带余除法清掉同行同列。角上留下的余式次数会越来越低，直到它整除剩下的每个元素。",
    });
    const [stepCard, logCard] = ui.cards;
    const state = { key: "diag", A: null, k: 0, log: [], history: [], changed: new Set() };
    let flow = null;
    ui.gateHost.addEventListener("click", () => redraw());
    const board = el("div", "ch8l-board");
    ui.stage.append(board);

    function reset() {
      state.A = SMITH_PRESETS[state.key].A();
      state.k = 0;
      state.log = [];
      state.history = [];
      state.changed = new Set();
    }

    const n = () => state.A.length;
    const cell = (i, j) => state.A[i][j];

    function snapshot() {
      state.history.push({ A: state.A.map((r) => r.slice()), k: state.k, log: state.log.slice() });
    }

    function swapRows(i, j) {
      [state.A[i], state.A[j]] = [state.A[j], state.A[i]];
      state.log.push(opTex.swapR(i, j));
    }

    function swapCols(i, j) {
      state.A.forEach((row) => ([row[i], row[j]] = [row[j], row[i]]));
      state.log.push(opTex.swapC(i, j));
    }

    function addRow(i, j, q) {
      state.A[i] = state.A[i].map((x, c) => P.add(x, P.mul(q, state.A[j][c])));
      state.log.push(opTex.addR(i, j, q));
    }

    function addCol(i, j, q) {
      state.A.forEach((row) => (row[i] = P.add(row[i], P.mul(q, row[j]))));
      state.log.push(opTex.addC(i, j, q));
    }

    /* What the board looks like now, and which moves make progress. */
    function analyse() {
      const k = state.k;
      const N = n();
      const active = [];
      for (let i = k; i < N; i += 1) for (let j = k; j < N; j += 1) if (!P.isZero(cell(i, j))) active.push([i, j]);
      if (k >= N || !active.length) return { phase: "done" };
      const corner = cell(k, k);
      if (P.isZero(corner)) return { phase: "pick" };
      const line = [];
      for (let t = k + 1; t < N; t += 1) {
        if (!P.isZero(cell(t, k))) line.push([t, k]);
        if (!P.isZero(cell(k, t))) line.push([k, t]);
      }
      if (line.length) {
        const reducible = line.some(([i, j]) => P.deg(cell(i, j)) >= P.deg(corner));
        return { phase: reducible ? "clear" : "lower", line };
      }
      for (let i = k + 1; i < N; i += 1)
        for (let j = k + 1; j < N; j += 1) if (!P.divides(corner, cell(i, j))) return { phase: "lift", bad: [i, j] };
      return { phase: "next" };
    }

    function act(fn) {
      if (!flow?.predicted) return;
      snapshot();
      const before = state.A.map((r) => r.map((p) => P.latex(p)));
      fn();
      state.changed = new Set();
      state.A.forEach((row, i) => row.forEach((p, j) => P.latex(p) !== before[i][j] && state.changed.add(`${i},${j}`)));
      redraw();
      if (analyse().phase === "done") flow.acted();
    }

    function pick(i, j) {
      const k = state.k;
      if (i < k || j < k || P.isZero(cell(i, j)) || (i === k && j === k)) return;
      act(() => {
        if (i !== k) swapRows(i, k);
        if (j !== k) swapCols(j, k);
      });
    }

    function clearLine() {
      act(() => {
        const k = state.k;
        const corner = cell(k, k);
        for (let i = k + 1; i < n(); i += 1) {
          const q = P.divmod(cell(i, k), corner).q;
          if (!P.isZero(q)) addRow(i, k, P.neg(q));
        }
        for (let j = k + 1; j < n(); j += 1) {
          const q = P.divmod(cell(k, j), corner).q;
          if (!P.isZero(q)) addCol(j, k, P.neg(q));
        }
      });
    }

    function lift(i) {
      act(() => addRow(state.k, i, P.one()));
    }

    function next() {
      act(() => {
        const k = state.k;
        const c = P.lc(cell(k, k));
        if (!M().eq(c, F(1))) {
          const inv = M().div(F(1), c);
          state.A[k] = state.A[k].map((x) => P.scale(x, inv));
          state.log.push(opTex.scaleR(k, inv));
        }
        state.k += 1;
      });
    }

    function undo() {
      const last = state.history.pop();
      if (!last) return;
      Object.assign(state, { A: last.A, k: last.k, log: last.log, changed: new Set() });
      redraw();
    }

    function redraw() {
      const open = Boolean(flow?.predicted);
      const info = analyse();
      const N = n();
      const k = state.k;
      const corner = k < N ? cell(k, k) : null;
      const head = `<span class="ch8l-axis"></span>${Array.from({ length: N }, (_, j) => `<span class="ch8l-axis">第 ${j + 1} 列</span>`).join("")}`;
      const finished = info.phase === "done";
      const rows = state.A.map(
        (row, i) =>
          `<span class="ch8l-axis is-row">第 ${i + 1} 行</span>${row
            .map((p, j) => {
              const done = i < k || j < k || finished;
              const cls = ["ch8l-tile"];
              if (P.isZero(p)) cls.push("is-zero");
              if (finished && i === j && !P.isZero(p)) cls.push("is-final");
              else if (done) cls.push("is-done");
              if (!done && i === k && j === k) cls.push("is-corner");
              if (open && info.phase === "lift" && i === info.bad[0] && j === info.bad[1]) cls.push("is-bad");
              if (state.changed.has(`${i},${j}`)) cls.push("is-changed");
              const clickable = open && !done && !P.isZero(p) && !(i === k && j === k);
              const degree = P.isZero(p) ? "" : P.deg(p) === 0 ? "常数" : `${P.deg(p)} 次`;
              return `<button type="button" class="${cls.join(" ")}" data-cell="${i},${j}"${clickable ? "" : " disabled"}><b>${tex(ptex(p))}</b><small>${degree}</small></button>`;
            })
            .join("")}`,
      );
      board.style.setProperty("--n", N);
      board.innerHTML = head + rows.join("");
      board.querySelectorAll("[data-cell]").forEach((b) =>
        b.addEventListener("click", () => {
          const [i, j] = b.dataset.cell.split(",").map(Number);
          pick(i, j);
        }),
      );

      if (!open) {
        stepCard.innerHTML = `<h4>下一步</h4>${waitNote("操作按钮")}`;
        logCard.innerHTML = `<h4>已做的初等变换</h4><p class="ch7l-muted">还没有。</p>`;
        return;
      }
      let html = "<h4>下一步</h4>";
      const btn = (key, label, enabled) => `<button type="button" class="ch7l-btn${enabled ? " is-primary" : ""}" data-act="${key}"${enabled ? "" : " disabled"}>${label}</button>`;
      if (info.phase === "done") {
        const diag = state.A.map((row, i) => row[i]).filter((p) => !P.isZero(p));
        const chain = diag.map((p) => pfac(p)).join("\\mid ");
        html += `<p class="ch7l-ok">化成标准形了。</p><div>${texD(`\\operatorname{diag}(${diag.map(pfac).join(",")})`)}</div><p>整除链 ${tex(chain)}</p>`;
      } else if (info.phase === "pick") {
        html += `<p>左上角是 0。点一个非零元素，把它换到左上角。</p>`;
      } else if (info.phase === "lower") {
        html += `<p>同行同列里有比角元 ${tex(ptex(corner))} 次数更低的元素，带余除法消不动它。点它，把它换到左上角。</p>`;
      } else if (info.phase === "clear") {
        html += `<p>用角元 ${tex(ptex(corner))} 对同行同列的元素做带余除法，减去商的倍数。余式的次数会低于角元。</p>`;
      } else if (info.phase === "lift") {
        const [i, j] = info.bad;
        html += `<p>同行同列已清零，但角元 ${tex(ptex(corner))} 不能整除 ${tex(ptex(cell(i, j)))}。把第 ${i + 1} 行加到第 ${k + 1} 行，再做带余除法。</p>`;
      } else {
        html += `<p>角元 ${tex(ptex(corner))} 整除剩下的每个元素。把它化成首一多项式，进入右下角的子矩阵。</p>`;
      }
      const moves = info.phase === "done" ? "" : `${btn("clear", "带余除法清同行同列", info.phase === "clear")}${
        info.phase === "lift" ? btn("lift", `第 ${info.bad[0] + 1} 行加到第 ${k + 1} 行`, true) : ""
      }${btn("next", "首一化，进入下一阶", info.phase === "next")}`;
      html += `<div class="ch7l-actions">${moves}<button type="button" class="ch7l-btn" data-act="undo"${state.history.length ? "" : " disabled"}>撤销</button><button type="button" class="ch7l-btn" data-act="reset">重来</button></div>`;
      stepCard.innerHTML = html;
      stepCard.querySelectorAll("[data-act]").forEach((b) =>
        b.addEventListener("click", () => {
          const a = b.dataset.act;
          if (a === "clear") clearLine();
          if (a === "lift") lift(info.bad[0]);
          if (a === "next") next();
          if (a === "undo") undo();
          if (a === "reset") {
            reset();
            redraw();
          }
        }),
      );
      logCard.innerHTML = `<h4>已做的初等变换（${state.log.length} 步）</h4>${
        state.log.length ? `<p class="ch8l-log">${state.log.map((s) => tex(s)).join(" ")}</p>` : `<p class="ch7l-muted">还没有。</p>`
      }`;
    }

    function newFlow() {
      flow = gate(ui.gateHost, ui.result, { ...SMITH_PRESETS[state.key].predict, actHint: "已记下你的预测。动手把矩阵化成标准形，结论随后出现。" });
    }

    K.chips(
      ui.bars[0],
      Object.entries(SMITH_PRESETS).map(([key, v]) => [key, v.label]),
      (key) => {
        state.key = key;
        reset();
        newFlow();
        redraw();
      },
      state.key,
    );
    reset();
    newFlow();
    redraw();
    return undefined;
  }

  /* ================= §3 不变因子 ================= */

  const MINOR_PRESETS = {
    pku: {
      label: "三阶 λ-矩阵",
      k: 2,
      A: SMITH_PRESETS.pku.A,
      predict: {
        question: `对这个 λ-矩阵做一次初等变换，矩阵的元素和 2 阶子式都会变。2 阶行列式因子 ${tex("D_2(\\lambda)")} 会怎样？`,
        options: [
          { text: "不变", correct: true },
          { text: "可能变成它的一个因式", why: "变换可以撤回：新子式都是旧子式的组合，旧子式也是新子式的组合，两组子式的公因式互相整除。" },
          { text: "加上 φ(λ) 倍时会多出因子 φ(λ)", why: "新子式等于旧子式加上 φ(λ) 乘另一个旧子式，公因式不会多出 φ(λ)。" },
          { text: "取决于做了哪一种变换", why: "三种初等变换都不改变 D₂；换行换列只改变一些子式的符号。" },
        ],
        conclusion: "每做一次初等变换，子式的值在变，它们的最大公因式不变，所以 D₁、D₂、D₃ 都不变，dₖ=Dₖ/Dₖ₋₁ 也不变。标准形的对角元就是 dₖ，因此标准形是唯一的。",
      },
    },
    diag: {
      label: "diag(λ, λ+1, λ(λ+1))",
      k: 2,
      A: () => P.matrix([[[0, 1], 0, 0], [0, [1, 1], 0], [0, 0, [0, 1, 1]]]),
      predict: {
        question: `${tex("A(\\lambda)=\\operatorname{diag}(\\lambda,\\ \\lambda+1,\\ \\lambda(\\lambda+1))")}。它的 2 阶行列式因子 ${tex("D_2(\\lambda)")} 是什么？`,
        options: [
          { text: tex("\\lambda(\\lambda+1)"), correct: true },
          { text: tex("\\lambda^2(\\lambda+1)"), why: "这只是其中一个 2 阶子式。D₂ 是全部 2 阶子式的最大公因式。" },
          { text: tex("\\lambda"), why: "λ+1 也整除每一个非零的 2 阶子式。" },
          { text: tex("1"), why: "三个非零 2 阶子式都含有因式 λ(λ+1)。" },
        ],
        conclusion: "非零的 2 阶子式是 λ(λ+1)、λ²(λ+1)、λ(λ+1)²，最大公因式 D₂=λ(λ+1)。又 D₁=1，D₃=λ²(λ+1)²，所以不变因子是 1, λ(λ+1), λ(λ+1)，标准形是 diag(1, λ(λ+1), λ(λ+1))。原来的对角矩阵不是标准形。",
      },
    },
    jordan: {
      label: "λE−A，A 是 3 阶若尔当块",
      k: 2,
      A: () => P.charMatrix([[2, 0, 0], [1, 2, 0], [0, 1, 2]]),
      predict: {
        question: `${tex("A=\\begin{pmatrix}2&0&0\\\\1&2&0\\\\0&1&2\\end{pmatrix}")}。${tex("\\lambda E-A")} 的 2 阶行列式因子 ${tex("D_2(\\lambda)")} 是什么？`,
        options: [
          { text: tex("1"), correct: true },
          { text: tex("(\\lambda-2)^2"), why: "取第 2、3 行与第 1、2 列，这个 2 阶子式等于 1。" },
          { text: tex("\\lambda-2"), why: "有一个 2 阶子式等于 1，λ−2 不能整除它。" },
          { text: tex("(\\lambda-2)^3"), why: "这是 D₃，即 |λE−A|。" },
        ],
        conclusion: "第 2、3 行与第 1、2 列的子式是 1，所以 D₁=D₂=1，D₃=(λ−2)³，不变因子是 1, 1, (λ−2)³。若尔当块的特征矩阵只有最后一个不变因子不是 1。",
      },
    },
  };

  const OP_FACTORS = [[0, 1], [-1], [1, 1], [2], [0, -1], [-2, 1]];

  function minorLab(root) {
    const ui = skeleton(root, {
      title: "子式墙",
      task: "墙上是全部 k 阶子式。点一块，上方矩阵会标出它取的行与列。Dₖ(λ) 是这些子式的最大公因式。做几次初等变换，看哪些在变、哪些不变。",
      toolbars: 2,
    });
    const [factorCard, opCard] = ui.cards;
    const state = { key: "pku", k: 2, A: null, picked: 0, ops: [], seed: 7 };
    let flow = null;
    ui.gateHost.addEventListener("click", () => redraw());
    const matHost = el("div", "ch8l-mat");
    const wall = el("div", "ch8l-wall");
    const wallHead = el("p", "ch8l-wall-head");
    const stageBox = el("div", "ch8l-stagebox");
    stageBox.append(matHost, wallHead, wall);
    ui.stage.append(stageBox);

    function reset() {
      state.A = MINOR_PRESETS[state.key].A();
      state.k = MINOR_PRESETS[state.key].k;
      state.picked = 0;
      state.ops = [];
    }

    function rand() {
      state.seed = (Math.imul(state.seed, 1664525) + 1013904223) >>> 0;
      return state.seed / 4294967296;
    }

    function randomOp() {
      const N = state.A.length;
      for (let attempt = 0; attempt < 12; attempt += 1) {
        const i = Math.floor(rand() * N);
        let j = Math.floor(rand() * (N - 1));
        if (j >= i) j += 1;
        const kind = Math.floor(rand() * 5);
        const q = P.make(OP_FACTORS[Math.floor(rand() * OP_FACTORS.length)]);
        let B = state.A.map((r) => r.slice());
        let label;
        if (kind === 0) {
          [B[i], B[j]] = [B[j], B[i]];
          label = opTex.swapR(i, j);
        } else if (kind === 1) {
          B.forEach((row) => ([row[i], row[j]] = [row[j], row[i]]));
          label = opTex.swapC(i, j);
        } else if (kind === 2) {
          B[i] = B[i].map((x, c) => P.add(x, P.mul(q, B[j][c])));
          label = opTex.addR(i, j, q);
        } else if (kind === 3) {
          B.forEach((row) => (row[i] = P.add(row[i], P.mul(q, row[j]))));
          label = opTex.addC(i, j, q);
        } else {
          const c = F(rand() < 0.5 ? -1 : 2);
          B = B.map((row, r) => (r === i ? row.map((x) => P.scale(x, c)) : row));
          label = opTex.scaleR(i, c);
        }
        const maxDeg = Math.max(...B.flat().map(P.deg));
        if (maxDeg <= 4 || attempt === 11) {
          state.A = B;
          state.ops.push(label);
          return;
        }
      }
    }

    function redraw() {
      const open = Boolean(flow?.predicted);
      const N = state.A.length;
      const list = P.minors(state.A, state.k);
      const m = list[Math.min(state.picked, list.length - 1)];
      matHost.style.setProperty("--n", N);
      matHost.innerHTML = state.A.map((row, i) =>
        row
          .map((p, j) => {
            const inRow = m.rows.includes(i);
            const inCol = m.cols.includes(j);
            return `<span class="ch8l-mcell${inRow && inCol ? " is-in" : inRow || inCol ? " is-line" : ""}">${tex(ptex(p))}</span>`;
          })
          .join(""),
      ).join("");
      wallHead.textContent = `全部 ${list.length} 个 ${state.k} 阶子式（点一块，看它取的行与列）`;
      wall.style.setProperty("--cols", Math.min(list.length, N === 3 && state.k !== 3 ? 3 : list.length));
      wall.innerHTML = list
        .map(
          (x, idx) =>
            `<button type="button" class="ch8l-minor${open && P.isZero(x.value) ? " is-zero" : ""}${idx === state.picked ? " is-picked" : ""}" data-minor="${idx}"><small>行 ${x.rows.map((r) => r + 1).join(",")}　列 ${x.cols.map((c) => c + 1).join(",")}</small><b>${open ? tex(pfac(x.value)) : "?"}</b></button>`,
        )
        .join("");
      wall.querySelectorAll("[data-minor]").forEach((b) =>
        b.addEventListener("click", () => {
          state.picked = Number(b.dataset.minor);
          redraw();
        }),
      );

      if (!open) {
        factorCard.innerHTML = `<h4>行列式因子</h4>${waitNote("Dₖ 与 dₖ")}`;
        opCard.innerHTML = `<h4>初等变换</h4>${waitNote("操作按钮")}`;
        return;
      }
      const D = P.determinantFactors(state.A);
      const d = P.invariantFactors(state.A);
      factorCard.innerHTML = `<h4>行列式因子与不变因子</h4><ul class="ch8l-list">${D.map(
        (x, i) => `<li class="${i + 1 === state.k ? "is-on" : ""}">${tex(`D_${i + 1}=${pfac(x)}`)}</li>`,
      ).join("")}</ul><ul class="ch8l-list">${d.map((x, i) => `<li>${tex(`d_${i + 1}=${pfac(x)}`)}</li>`).join("")}</ul>`;
      opCard.innerHTML = `<h4>初等变换</h4><div class="ch7l-actions"><button type="button" class="ch7l-btn is-primary" data-op>随机做一次初等变换</button><button type="button" class="ch7l-btn" data-reset${state.ops.length ? "" : " disabled"}>还原</button></div>${
        state.ops.length ? `<p class="ch8l-log">已做：${state.ops.map((s) => tex(s)).join(" ")}</p>` : `<p class="ch7l-muted">还没有做变换。</p>`
      }`;
      opCard.querySelector("[data-op]").addEventListener("click", () => {
        randomOp();
        redraw();
        flow?.acted();
      });
      opCard.querySelector("[data-reset]").addEventListener("click", () => {
        const k = state.k;
        reset();
        state.k = k;
        redraw();
      });
    }

    function newFlow() {
      flow = gate(ui.gateHost, ui.result, { ...MINOR_PRESETS[state.key].predict, actHint: "已记下你的预测。做一次初等变换，或换一个阶数看看，结论随后出现。" });
    }

    function orderChips() {
      const N = MINOR_PRESETS[state.key].A().length;
      K.chips(
        ui.bars[1],
        Array.from({ length: N }, (_, i) => [String(i + 1), `${i + 1} 阶子式`]),
        (k) => {
          state.k = Number(k);
          state.picked = 0;
          redraw();
          flow?.acted();
        },
        String(state.k),
      );
    }

    K.chips(
      ui.bars[0],
      Object.entries(MINOR_PRESETS).map(([key, v]) => [key, v.label]),
      (key) => {
        state.key = key;
        reset();
        orderChips();
        newFlow();
        redraw();
      },
      state.key,
    );
    reset();
    orderChips();
    newFlow();
    redraw();
    return undefined;
  }

  /* ================= §5 初等因子 ================= */

  /* Irreducible factors over the reals; "q" splits over the complex numbers. */
  const PRIMES = {
    a: { tex: "\\lambda-1", text: "λ−1", deg: 1, color: "v1" },
    b: { tex: "\\lambda+2", text: "λ+2", deg: 1, color: "v2" },
    c: { tex: "\\lambda+1", text: "λ+1", deg: 1, color: "v2" },
    q: { tex: "\\lambda^2+1", text: "λ²+1", deg: 2, color: "subspace", split: ["ip", "im"] },
    ip: { tex: "\\lambda-\\mathrm{i}", text: "λ−i", deg: 1, color: "subspace" },
    im: { tex: "\\lambda+\\mathrm{i}", text: "λ+i", deg: 1, color: "image" },
  };
  const SUPS = ["", "", "²", "³", "⁴"];

  const DIVISOR_PRESETS = {
    split: {
      label: "由不变因子求初等因子",
      rows: [{}, { a: 1 }, { a: 2, b: 1 }],
      start: "inv",
      predict: {
        question: `三阶矩阵 A 的不变因子是 ${tex("1,\\ \\lambda-1,\\ (\\lambda-1)^2(\\lambda+2)")}。A 的初等因子是哪些？`,
        options: [
          { text: tex("\\lambda-1,\\ (\\lambda-1)^2,\\ \\lambda+2"), correct: true },
          { text: tex("(\\lambda-1)^3,\\ \\lambda+2"), why: "每个不变因子各自分解，出现在不同不变因子中的同一个素因式方幂分别计数，不相乘合并。" },
          { text: tex("\\lambda-1,\\ (\\lambda-1)^2(\\lambda+2)"), why: "(λ−1)²(λ+2) 还要拆成 (λ−1)² 与 λ+2 两个方幂。" },
          { text: tex("\\lambda-1,\\ \\lambda+2"), why: "初等因子是带重数、带幂次的，(λ−1)² 与 λ−1 都要列出。" },
        ],
        conclusion: "把每个次数大于零的不变因子分解成素因式的方幂：d₂=λ−1，d₃=(λ−1)²·(λ+2)。全部方幂合在一起就是初等因子 λ−1, (λ−1)², λ+2。同一个素因式在不同的 dₖ 里出现，就各算一个初等因子。",
      },
    },
    field: {
      label: "数域的影响",
      rows: [{}, {}, {}, { q: 1 }, { a: 1, q: 1 }],
      start: "inv",
      predict: {
        question: `五阶矩阵的不变因子是 ${tex("1,1,1,\\ \\lambda^2+1,\\ (\\lambda-1)(\\lambda^2+1)")}。在复数域上，它有几个初等因子？`,
        options: [
          { text: "5 个", correct: true },
          { text: "3 个", why: "这是实数域上的个数。在复数域上 λ²+1=(λ−i)(λ+i)，一块要拆成两块。" },
          { text: "4 个", why: "两个 λ²+1 各拆成两个一次因式，共多出 2 个。" },
          { text: "2 个", why: "初等因子是逐个方幂计数的，不是逐个不变因子计数。" },
        ],
        conclusion: "实数域上 λ²+1 不可约，初等因子是 λ²+1, λ−1, λ²+1，共 3 个；复数域上 λ²+1=(λ−i)(λ+i)，初等因子是 λ−i, λ+i, λ−1, λ−i, λ+i，共 5 个。初等因子依赖于所在的数域，讨论若尔当标准形时取复数域。",
      },
    },
    rebuild: {
      label: "由初等因子还原不变因子",
      rows: [{}, {}, {}, { a: 1 }, { a: 2, c: 2 }],
      start: "ed",
      predict: {
        question: `五阶矩阵的初等因子是 ${tex("(\\lambda-1)^2,\\ \\lambda-1,\\ (\\lambda+1)^2")}。最后一个不变因子 ${tex("d_5(\\lambda)")} 是什么？`,
        options: [
          { text: tex("(\\lambda-1)^2(\\lambda+1)^2"), correct: true },
          { text: tex("(\\lambda-1)^3(\\lambda+1)^2"), why: "d₅ 取每个素因式的最高次方幂，次高的 λ−1 留给 d₄。" },
          { text: tex("(\\lambda-1)^2"), why: "(λ+1)² 也要放进 d₅，否则它无处可放：d₄ 必须整除 d₅。" },
          { text: tex("(\\lambda-1)(\\lambda+1)"), why: "初等因子的方幂要原样放进不变因子，不能拆小。" },
        ],
        conclusion: "把每个素因式的方幂按次数从高到低排：(λ−1)², λ−1 与 (λ+1)²。各取最高次的相乘得 d₅=(λ−1)²(λ+1)²，各取次高的相乘得 d₄=λ−1，其余补 1：d₁=d₂=d₃=1。这样 d₄ | d₅ 自动成立。",
      },
    },
  };

  function divisorLab(root) {
    const ui = skeleton(root, {
      title: "初等因子积木",
      task: "每一块积木是一个素因式的方幂，宽度是它的次数。按行排，每一行乘起来是一个不变因子；把行拆开，剩下的积木就是初等因子。切换数域，看 λ²+1 会不会碎开。",
      toolbars: 2,
    });
    const [invCard, edCard] = ui.cards;
    const state = { key: "split", view: "inv", field: "R" };
    let flow = null;
    let anim = { from: new Map(), t: 1, raf: 0 };
    let last = new Map();
    ui.gateHost.addEventListener("click", () => redraw());
    const plane = K.plane2d(ui.stage, { extent: 3, hint: "", label: "不变因子与初等因子的积木" });

    /* Blocks of the current preset under the current field: one per (row, prime). */
    function blocks() {
      const { rows } = DIVISOR_PRESETS[state.key];
      const out = [];
      rows.forEach((row, r) =>
        Object.entries(row).forEach(([p, e]) => {
          const prime = PRIMES[p];
          if (state.field === "C" && prime.split) prime.split.forEach((s) => out.push({ id: `${r}-${s}`, parent: `${r}-${p}`, r, p: s, e }));
          else out.push({ id: `${r}-${p}`, r, p, e });
        }),
      );
      return out;
    }

    const label = (b) => (b.e > 1 ? `(${PRIMES[b.p].text})${SUPS[b.e]}` : PRIMES[b.p].text);
    const btex = (b) => (b.e > 1 ? `(${PRIMES[b.p].tex})^{${b.e}}` : PRIMES[b.p].tex);

    function layout(d) {
      const [w, h] = size(d);
      const list = blocks();
      const { rows } = DIVISOR_PRESETS[state.key];
      const firstRow = rows.findIndex((row) => Object.keys(row).length);
      const shown = rows.length - firstRow;
      const maxDeg = Math.max(...rows.map((row) => Object.entries(row).reduce((s, [p, e]) => s + PRIMES[p].deg * e, 0)));
      const left = w < 520 ? 74 : 110;
      const unit = Math.min(112, (w - left - 40) / Math.max(maxDeg, 3));
      const bh = Math.min(62, (h - 120) / Math.max(shown, 3));
      const pos = new Map();
      if (state.view === "inv") {
        const top = h / 2 - (shown * (bh + 14)) / 2 + 20;
        list.forEach((b) => {
          const row = rows[b.r];
          const order = Object.keys(row);
          let x = left;
          const y = top + (b.r - firstRow) * (bh + 14);
          for (const p of order) {
            const prime = PRIMES[p];
            const parts = state.field === "C" && prime.split ? prime.split : [p];
            for (const s of parts) {
              const bw = PRIMES[s].deg * row[p] * unit;
              if (`${b.r}-${s}` === b.id) pos.set(b.id, { x, y, w: bw - 6, h: bh });
              x += bw;
            }
          }
        });
        return { pos, top, firstRow, left, bh };
      }
      /* elementary-divisor view: one flowing line per prime, sorted by power */
      const groups = new Map();
      list.forEach((b) => groups.set(b.p, [...(groups.get(b.p) || []), b]));
      const lines = [...groups.values()];
      const top = h / 2 - (lines.length * (bh + 14)) / 2 + 20;
      lines.forEach((g, li) => {
        let x = left;
        g.sort((p, q) => p.e - q.e).forEach((b) => {
          const bw = PRIMES[b.p].deg * b.e * unit;
          pos.set(b.id, { x, y: top + li * (bh + 14), w: bw - 6, h: bh });
          x += bw + 10;
        });
      });
      return { pos, top, firstRow, left, bh, lines };
    }

    function animate() {
      cancelAnimationFrame(anim.raf);
      anim.from = new Map(last);
      anim.t = 0;
      const t0 = performance.now();
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const step = (now) => {
        anim.t = reduce ? 1 : Math.min(1, (now - t0) / 650);
        plane.render();
        if (anim.t < 1) anim.raf = requestAnimationFrame(step);
      };
      anim.raf = requestAnimationFrame(step);
    }

    function redraw() {
      const open = Boolean(flow?.predicted);
      const preset = DIVISOR_PRESETS[state.key];
      plane.setDraw((d) => {
        const ctx = d.ctx;
        const [w] = size(d);
        const L = layout(d);
        const ease = (t) => 1 - (1 - t) ** 3;
        const t = ease(anim.t);
        const font = (px, wt = 650) => `${wt} ${px}px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif`;
        const write = (x, y, str, color, opts = {}) => d.text(at(d, x, y), str, color, { font: font(opts.size || 13, opts.weight), align: opts.align || "left" });
        if (state.view === "inv") {
          const { rows } = preset;
          rows.forEach((row, r) => {
            if (r < L.firstRow) return;
            const y = L.top + (r - L.firstRow) * (L.bh + 14) + L.bh / 2;
            write(L.left - 14, y, `d${"₁₂₃₄₅"[r]}`, "muted", { align: "right", size: 14, weight: 700 });
          });
          if (L.firstRow > 0) write(L.left, L.top - 24, `d₁${L.firstRow > 1 ? `=…=d${"₁₂₃₄₅"[L.firstRow - 1]}` : ""}=1`, "faint", { size: 12.5 });
        } else {
          write(L.left, L.top - 24, `初等因子（${state.field === "C" ? "复数域" : "实数域"}上共 ${blocks().length} 个）`, "muted", { size: 13, weight: 700 });
        }
        if (!open && state.view === "inv") {
          /* Before the prediction each row is one unfactored block. */
          preset.rows.forEach((row, r) => {
            const mine = blocks().filter((b) => b.r === r);
            if (!mine.length) return;
            const boxes = mine.map((b) => L.pos.get(b.id));
            mine.forEach((b, i) => last.set(b.id, boxes[i]));
            const x = Math.min(...boxes.map((q) => q.x));
            const x2 = Math.max(...boxes.map((q) => q.x + q.w));
            const y = boxes[0].y;
            ctx.save();
            roundRect(ctx, x, y, x2 - x, L.bh, 9);
            ctx.fillStyle = d.alpha(d.color("muted"), 0.1);
            ctx.fill();
            ctx.lineWidth = 1.6;
            ctx.strokeStyle = d.color("muted");
            ctx.stroke();
            ctx.restore();
            const text = mine.map((b) => (mine.length > 1 && b.e === 1 ? `(${label(b)})` : label(b))).join("");
            write((x + x2) / 2, y + L.bh / 2, text, "text", { align: "center", size: w < 520 ? 12.5 : 14, weight: 700 });
          });
          return;
        }
        blocks().forEach((b) => {
          const to = L.pos.get(b.id);
          let from = anim.from.get(b.id);
          if (!from && b.parent && anim.from.get(b.parent)) {
            const pf = anim.from.get(b.parent);
            const half = PRIMES[b.p] === PRIMES[PRIMES.q.split[0]] ? 0 : 1;
            from = { x: pf.x + (half * (pf.w + 6)) / 2, y: pf.y, w: pf.w / 2 - 3, h: pf.h };
          }
          if (!from) {
            const kids = PRIMES[b.p].split;
            const child = kids && anim.from.get(`${b.r}-${kids[0]}`);
            const child2 = kids && anim.from.get(`${b.r}-${kids[1]}`);
            from = child && child2 ? { x: child.x, y: child.y, w: child2.x + child2.w - child.x, h: child.h } : to;
          }
          const box = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, w: from.w + (to.w - from.w) * t, h: from.h + (to.h - from.h) * t };
          last.set(b.id, box);
          const color = d.color(PRIMES[b.p].color);
          ctx.save();
          roundRect(ctx, box.x, box.y, Math.max(8, box.w), box.h, 9);
          ctx.fillStyle = d.alpha(color, 0.2);
          ctx.fill();
          ctx.lineWidth = 1.8;
          ctx.strokeStyle = color;
          ctx.stroke();
          ctx.restore();
          write(box.x + box.w / 2, box.y + box.h / 2, label(b), "text", { align: "center", size: w < 520 ? 12.5 : 14, weight: 700 });
        });
        [...last.keys()].forEach((id) => blocks().some((b) => b.id === id) || last.delete(id));
      });

      const rowsTex = preset.rows.map((row) => {
        const list = Object.entries(row).flatMap(([p, e]) =>
          state.field === "C" && PRIMES[p].split ? PRIMES[p].split.map((s) => ({ p: s, e })) : [{ p, e }],
        );
        return list.length ? list.map((b) => (list.length > 1 && b.e === 1 ? `(${PRIMES[b.p].tex})` : btex(b))).join("") : "1";
      });
      const eds = blocks().map(btex);
      const givenInv = preset.start === "inv";
      invCard.innerHTML = `<h4>不变因子</h4>${
        open || givenInv ? `<ul class="ch8l-list">${rowsTex.map((x, i) => `<li>${tex(`d_${i + 1}=${x}`)}</li>`).join("")}</ul>` : waitNote("不变因子")
      }`;
      edCard.innerHTML = `<h4>初等因子（${state.field === "C" ? "复数域" : "实数域"}）</h4>${
        open || !givenInv ? `<p>${tex(eds.join(",\\ "))}</p><p class="ch7l-muted">共 ${eds.length} 个。</p>` : waitNote("初等因子")
      }`;
      ui.bars[1].querySelectorAll("button").forEach((b) => (b.disabled = !open));
    }

    function setView(v) {
      if (v === state.view) return;
      state.view = v;
      animate();
      redraw();
    }

    function viewChips() {
      const bar = ui.bars[1];
      bar.innerHTML = "";
      const views = el("div", "ch7l-toolbar");
      const fields = el("div", "ch7l-toolbar");
      bar.append(views, fields);
      K.chips(
        views,
        [
          ["inv", "按不变因子排"],
          ["ed", "拆成初等因子"],
        ],
        (v) => {
          setView(v);
          flow?.acted();
        },
        state.view,
      );
      K.chips(
        fields,
        [
          ["R", "实数域"],
          ["C", "复数域"],
        ],
        (f) => {
          state.field = f;
          animate();
          redraw();
          flow?.acted();
        },
        state.field,
      );
    }

    function load(key) {
      state.key = key;
      state.view = DIVISOR_PRESETS[key].start;
      state.field = "R";
      last = new Map();
      anim = { from: new Map(), t: 1, raf: 0 };
      viewChips();
      flow = gate(ui.gateHost, ui.result, { ...DIVISOR_PRESETS[key].predict, actHint: "已记下你的预测。切换排法或数域，结论随后出现。" });
      redraw();
    }

    K.chips(
      ui.bars[0],
      Object.entries(DIVISOR_PRESETS).map(([key, v]) => [key, v.label]),
      (key) => load(key),
      state.key,
    );
    load("split");
    return () => {
      cancelAnimationFrame(anim.raf);
      plane.destroy();
    };
  }

  /* ================= §6 若尔当标准形的理论推导 ================= */

  /* Integer matrices with the single eigenvalue 2 (built as XJX⁻¹ with |X|=1). */
  const TOWER_PRESETS = {
    a: {
      label: "A₁",
      A: [[3, -1, 1, -2], [1, 2, 0, -1], [0, 1, 1, 1], [0, 0, 0, 2]],
      predict: {
        question: `${tex("|\\lambda E-A_1|=(\\lambda-2)^4")}，${tex("N=A_1-2E")} 的秩是 2。A₁ 的若尔当形中有几个若尔当块？`,
        options: [
          { text: "2 个", correct: true },
          { text: "1 个", why: "块数等于 dim ker N=4−rank N=2。" },
          { text: "3 个", why: "三个块时 ker N 是 3 维的，rank N=1。" },
          { text: "4 个", why: "四个一阶块意味着 N=0，A₁=2E。" },
        ],
        conclusion: "每个若尔当块恰好贡献 ker N 的一个方向（链的最后一个向量），所以块数是 ν₁=dim ker N=2。继续往上：ν₂=3、ν₃=4，每层新增 bₖ=νₖ−νₖ₋₁ 个点：b₁=2，b₂=1，b₃=1。阶数不小于 k 的块有 bₖ 个，于是块的阶数是 3 和 1，初等因子是 (λ−2)³, λ−2。",
      },
    },
    b: {
      label: "A₂",
      A: [[4, -3, 4, -6], [2, 0, 2, -4], [2, -3, 6, -6], [1, -2, 3, -2]],
      predict: {
        question: `${tex("|\\lambda E-A_2|=(\\lambda-2)^4")}，${tex("N=A_2-2E")} 的秩是 2，且 ${tex("N^2=0")}。若尔当块的阶数是多少？`,
        options: [
          { text: "2, 2", correct: true },
          { text: "3, 1", why: "有 3 阶块时 N²≠0：链 ε₁→ε₂→ε₃ 上 N²ε₁=ε₃。" },
          { text: "2, 1, 1", why: "三个块意味着 dim ker N=3，即 rank N=1。" },
          { text: "4", why: "一个 4 阶块时 rank N=3。" },
        ],
        conclusion: "ν₁=2，ν₂=4：两条链，到第二层就用完了全部 4 个维度，b₁=b₂=2，没有第三层。两个块都是 2 阶，初等因子是 (λ−2)², (λ−2)²。与 A₁ 比较：rank N 都是 2，块数相同，块的大小由更高层的 νₖ 决定。",
      },
    },
    c: {
      label: "A₃",
      A: [[3, -1, 1, -2], [2, 0, 2, -4], [1, -1, 3, -2], [0, 0, 0, 2]],
      predict: {
        question: `${tex("|\\lambda E-A_3|=(\\lambda-2)^4")}，${tex("N=A_3-2E")} 的秩是 1。下列哪一个结论一定成立？`,
        options: [
          { text: "有 3 个若尔当块，其中一个是 2 阶", correct: true },
          { text: "A₃ 可以对角化", why: "可对角化要求 N=0，这里 rank N=1。" },
          { text: "有 2 个 2 阶块", why: "两个块时 dim ker N=2，rank N 应为 2。" },
          { text: "有 1 个 4 阶块", why: "一个 4 阶块时 rank N=3。" },
        ],
        conclusion: "ν₁=3：三条链。四个维度分给三条链，只能是 2+1+1，ν₂=4。若尔当形是 diag(J(2,2), J(2,1), J(2,1))，初等因子是 (λ−2)², λ−2, λ−2。",
      },
    },
  };

  function towerLab(root) {
    const ui = skeleton(root, {
      title: "核空间一层一层长高",
      task: "N=A−2E。ker N ⊆ ker N² ⊆ ⋯ 一层层长大，第 k 层新增的维数 bₖ 等于阶数不小于 k 的若尔当块的个数。逐层往上，看链怎样搭成塔。",
    });
    const [matCard, tableCard] = ui.cards;
    const state = { key: "a", k: 1 };
    let flow = null;
    ui.gateHost.addEventListener("click", () => redraw());
    const plane = K.plane2d(ui.stage, { extent: 3, hint: "", label: "若尔当链组成的塔与核空间的维数" });
    const controls = el("div", "ch7l-actions ch8l-under");
    ui.stage.append(controls);

    function analyse() {
      const A = K.mat(TOWER_PRESETS[state.key].A);
      const n = A.length;
      const N = K.sub(A, K.scaleMat(K.identity(n), 2));
      const nu = [0];
      let Nk = K.identity(n);
      while (nu[nu.length - 1] < n && nu.length <= n) {
        Nk = K.mul(Nk, N);
        nu.push(n - K.rank(Nk));
      }
      const top = nu.length - 1;
      const b = nu.map((v, i) => (i ? v - nu[i - 1] : 0));
      /* chain lengths: b_k chains reach level k */
      const chains = Array.from({ length: b[1] }, (_, j) => b.filter((x, i) => i >= 1 && x > j).length);
      return { A, n, nu, b, top, chains };
    }

    const SUB = "₀₁₂₃₄₅";
    // chain vectors get their own letters so they are not read as the standard basis ε
    const NAMES = ["α", "β", "γ", "δ"];

    function redraw() {
      const open = Boolean(flow?.predicted);
      const { A, n, nu, b, top, chains } = analyse();
      const k = Math.min(state.k, top);
      plane.setDraw((d) => {
        const ctx = d.ctx;
        const [w, h] = size(d);
        const write = (x, y, str, color, opts = {}) =>
          d.text(at(d, x, y), str, color, { font: `${opts.weight || 650} ${opts.size || 13}px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif`, align: opts.align || "left" });
        const narrow = w < 520;
        const towerW = narrow ? w * 0.58 : w * 0.56;
        const gapY = Math.min(96, (h - 110) / Math.max(top, 3));
        const baseY = h - 54;
        if (!open) {
          /* only the empty bottom layer: it says nothing about how many chains there are */
          const yTop = baseY - 0.5 * gapY;
          ctx.save();
          roundRect(ctx, 12, yTop, towerW - 12, gapY - 8, 12);
          ctx.fillStyle = d.alpha(d.color("subspace"), 0.04);
          ctx.fill();
          ctx.setLineDash([5, 5]);
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = d.alpha(d.color("subspace"), 0.45);
          ctx.stroke();
          ctx.restore();
          write(20, yTop + 14, "ker N", "faint", { size: 12, weight: 700 });
          write(towerW / 2 + 6, yTop - 28, "先在上方作出预测，再一层层往上搭", "faint", { align: "center", size: 13 });
          return;
        }
        const dx = Math.min(86, (towerW - 70) / Math.max(chains.length, 2));
        const x0 = (narrow ? 64 : 92) + dx / 2;
        const R = narrow ? 13 : 16;
        /* ker N^j bands */
        for (let j = top; j >= 1; j -= 1) {
          const yTop = baseY - (j - 0.5) * gapY;
          const on = j <= k;
          ctx.save();
          roundRect(ctx, 12, yTop, towerW - 12, baseY + gapY * 0.5 - yTop - 8 + (j === 1 ? 0 : 0), 12);
          ctx.fillStyle = d.alpha(d.color("subspace"), on ? 0.07 : 0.02);
          ctx.fill();
          if (j === k) {
            ctx.lineWidth = 1.6;
            ctx.strokeStyle = d.alpha(d.color("subspace"), 0.7);
            ctx.stroke();
          }
          ctx.restore();
          write(20, yTop + 14, `ker N${j > 1 ? "²³⁴"[j - 2] : ""}`, on ? "subspace" : "faint", { size: 12, weight: 700 });
        }
        /* chains: level 1 at the bottom is the eigenvector; the generator sits on top */
        chains.forEach((len, c) => {
          const x = x0 + c * dx;
          for (let lv = 1; lv <= len; lv += 1) {
            const y = baseY - (lv - 1) * gapY;
            const on = lv <= k;
            if (lv > 1) {
              const yb = y + gapY;
              ctx.save();
              ctx.strokeStyle = d.alpha(d.color("text"), on ? 0.7 : 0.25);
              ctx.lineWidth = 1.6;
              ctx.beginPath();
              ctx.moveTo(x, y + R + 2);
              ctx.lineTo(x, yb - R - 6);
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(x, yb - R - 2);
              ctx.lineTo(x - 5, yb - R - 10);
              ctx.lineTo(x + 5, yb - R - 10);
              ctx.closePath();
              ctx.fillStyle = ctx.strokeStyle;
              ctx.fill();
              ctx.restore();
            }
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, R, 0, Math.PI * 2);
            ctx.fillStyle = on ? d.color("subspace") : d.alpha(d.color("muted"), 0.12);
            ctx.fill();
            ctx.lineWidth = 1.6;
            ctx.strokeStyle = on ? d.color("subspace") : d.alpha(d.color("muted"), 0.5);
            ctx.stroke();
            ctx.restore();
            const idx = len - lv + 1;
            ctx.save();
            ctx.font = `750 ${narrow ? 12 : 14}px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = on ? (d.pal.dark ? "#0e121b" : "#ffffff") : d.color("faint");
            ctx.fillText(`${NAMES[c]}${SUB[idx]}`, x, y + 1);
            ctx.restore();
          }
          write(x, baseY + R + 14, "↓0", "faint", { align: "center", size: 11 });
        });
        /* staircase: ν_j bars */
        const bx = towerW + (narrow ? 14 : 30);
        const bw = Math.min(44, (w - bx - 16) / (top + 1) - 8);
        const unitH = (h - 120) / n;
        write(bx, 26, "νⱼ = dim ker Nʲ", "muted", { size: 12.5, weight: 700 });
        for (let j = 1; j <= top; j += 1) {
          const x = bx + (j - 1) * (bw + 8);
          const on = j <= k;
          const hh = nu[j] * unitH;
          ctx.save();
          roundRect(ctx, x, baseY + R - hh, bw, hh, 6);
          ctx.fillStyle = on ? d.alpha(d.color("subspace"), 0.22) : d.alpha(d.color("muted"), 0.06);
          ctx.fill();
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = on ? d.color("subspace") : d.alpha(d.color("muted"), 0.35);
          ctx.stroke();
          if (on && j > 1) {
            const prev = nu[j - 1] * unitH;
            ctx.fillStyle = d.alpha(d.color("subspace"), 0.35);
            roundRect(ctx, x, baseY + R - hh, bw, hh - prev, 6);
            ctx.fill();
          }
          ctx.restore();
          write(x + bw / 2, baseY + R + 14, `ν${SUB[j]}`, on ? "text" : "faint", { align: "center", size: 12, weight: 700 });
          if (on) write(x + bw / 2, baseY + R - hh - 12, `${nu[j]}`, "subspace", { align: "center", size: 13, weight: 750 });
          if (on) write(x + bw / 2, baseY + R - hh - 28, `+${b[j]}`, "subspace", { align: "center", size: 11.5, weight: 750 });
        }
      });

      matCard.innerHTML = `<h4>矩阵</h4><div>${texD(`A=${numMatrix(A)}`)}</div><p>${tex("|\\lambda E-A|=(\\lambda-2)^4")}，${tex("N=A-2E")}</p>`;
      if (!open) {
        controls.innerHTML = "";
        tableCard.innerHTML = `<h4>逐层计数</h4>${waitNote("核空间的维数")}`;
        return;
      }
      controls.innerHTML = `<button type="button" class="ch7l-btn" data-down${k <= 1 ? " disabled" : ""}>往下一层</button><button type="button" class="ch7l-btn is-primary" data-up${k >= top ? " disabled" : ""}>往上一层</button><span class="ch7l-muted">当前：ker N${k > 1 ? "²³⁴"[k - 2] : ""}，维数 ${nu[k]}</span>`;
      // the conclusion (all block sizes) opens only once the tower reaches the top layer
      controls.querySelector("[data-up]").addEventListener("click", () => {
        state.k = Math.min(top, k + 1);
        if (state.k >= top) flow?.acted();
        redraw();
      });
      controls.querySelector("[data-down]").addEventListener("click", () => {
        state.k = Math.max(1, k - 1);
        redraw();
      });
      const rows = [];
      for (let j = 1; j <= k; j += 1)
        rows.push(`<tr><td>${j}</td><td>${n - nu[j]}</td><td>${nu[j]}</td><td>${b[j]}</td></tr>`);
      let html = `<h4>逐层计数</h4><table class="ch7l-table"><thead><tr><th>j</th><th>rank Nʲ</th><th>νⱼ</th><th>bⱼ=νⱼ−νⱼ₋₁</th></tr></thead><tbody>${rows.join("")}</tbody></table>`;
      if (k >= top) {
        const sizes = chains.slice();
        const blocks = sizes.map((s) => `J(2,${s})`).join(",\\ ");
        const ed = sizes.map((s) => (s > 1 ? `(\\lambda-2)^{${s}}` : "\\lambda-2")).join(",\\ ");
        html += `<p class="ch7l-ok">ν 已经等于 ${n}，塔搭完了。</p><p>${tex(`J=\\operatorname{diag}(${blocks})`)}</p><p>初等因子 ${tex(ed)}</p>`;
      } else {
        html += `<p class="ch7l-muted">继续往上一层。</p>`;
      }
      tableCard.innerHTML = html;
    }

    K.chips(
      ui.bars[0],
      Object.entries(TOWER_PRESETS).map(([key, v]) => [key, v.label]),
      (key) => {
        state.key = key;
        state.k = 1;
        flow = gate(ui.gateHost, ui.result, { ...TOWER_PRESETS[key].predict, actHint: "已记下你的预测。逐层往上数一数，结论随后出现。" });
        redraw();
      },
      state.key,
    );
    flow = gate(ui.gateHost, ui.result, { ...TOWER_PRESETS[state.key].predict, actHint: "已记下你的预测。逐层往上数一数，结论随后出现。" });
    redraw();
    return () => plane.destroy();
  }

  /* ================= §7 矩阵的有理标准形 ================= */

  const COMPANION_PRESETS = {
    p1: { label: "λ³−2λ+1", a: [1, -2, 0] },
    p2: { label: "(λ−1)²(λ+1)", a: [1, -1, -1] },
    p3: { label: "λ³", a: [0, 0, 0] },
  };

  function companionLab(root) {
    const ui = skeleton(root, {
      title: "伴随矩阵：平移加反馈",
      task: "d(λ)=λ³+a₂λ²+a₁λ+a₀ 的伴随矩阵 C 把 e₁ 送到 e₂，e₂ 送到 e₃，再把 e₃ 按系数 −a₀, −a₁, −a₂ 送回来。用滑块改变系数，看 C、它的最小多项式和不变因子。",
    });
    const [ctrlCard, readCard] = ui.cards;
    const state = { a: COMPANION_PRESETS.p1.a.slice() };
    let flow = null;
    ui.gateHost.addEventListener("click", () => redraw());
    const plane = K.plane2d(ui.stage, { extent: 3, hint: "", label: "伴随矩阵作用在 e₁, e₂, e₃ 上" });
    ctrlCard.innerHTML = `<h4>d(λ) 的系数</h4>${["a₀", "a₁", "a₂"]
      .map(
        (name, i) =>
          `<label class="ch8l-range"><span>${name}</span><input type="range" min="-3" max="3" step="1" value="${state.a[i]}" data-a="${i}" aria-label="${name}" /><b data-av="${i}">${minus(state.a[i])}</b></label>`,
      )
      .join("")}<p data-dpoly></p>`;
    const sliders = [...ctrlCard.querySelectorAll("[data-a]")];

    const companion = () => [
      [0, 0, -state.a[0]],
      [1, 0, -state.a[1]],
      [0, 1, -state.a[2]],
    ];
    const dpoly = () => P.make([state.a[0], state.a[1], state.a[2], 1]);

    function redraw() {
      const open = Boolean(flow?.predicted);
      sliders.forEach((s, i) => {
        s.value = state.a[i];
        ctrlCard.querySelector(`[data-av="${i}"]`).textContent = minus(state.a[i]);
      });
      ctrlCard.querySelector("[data-dpoly]").innerHTML = tex(`d(\\lambda)=${ptex(dpoly())}`);
      plane.setDraw((d) => {
        const ctx = d.ctx;
        const [w, h] = size(d);
        const narrow = w < 520;
        const y = h * 0.42;
        const xs = [w * 0.18, w * 0.5, w * 0.82];
        const R = narrow ? 22 : 28;
        const write = (x, yy, str, color, opts = {}) =>
          d.text(at(d, x, yy), str, color, { font: `${opts.weight || 700} ${opts.size || 14}px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif`, align: opts.align || "center" });
        const arrowHead = (x, yy, ang, color) => {
          ctx.beginPath();
          ctx.moveTo(x, yy);
          ctx.lineTo(x - Math.cos(ang - 0.42) * 11, yy - Math.sin(ang - 0.42) * 11);
          ctx.lineTo(x - Math.cos(ang + 0.42) * 11, yy - Math.sin(ang + 0.42) * 11);
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
        };
        /* shift arrows e1 -> e2 -> e3 */
        [0, 1].forEach((i) => {
          ctx.save();
          ctx.strokeStyle = d.color("text");
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(xs[i] + R + 4, y);
          ctx.lineTo(xs[i + 1] - R - 10, y);
          ctx.stroke();
          arrowHead(xs[i + 1] - R - 4, y, 0, d.color("text"));
          ctx.restore();
          write((xs[i] + xs[i + 1]) / 2, y - 14, "C", "text", { size: 13 });
        });
        /* feedback from e3 */
        const coef = [-state.a[0], -state.a[1], -state.a[2]];
        [0, 1].forEach((i) => {
          const c = coef[i];
          const color = c === 0 ? d.alpha(d.color("muted"), 0.35) : d.color("image");
          const depth = (i === 0 ? 0.36 : 0.22) * h;
          const x1 = xs[2] - R * 0.4;
          const x2 = xs[i] + R * 0.4;
          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = c === 0 ? 1.4 : 1.6 + Math.abs(c) * 1.1;
          if (c === 0) ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(x1, y + R);
          ctx.bezierCurveTo(x1, y + depth, x2, y + depth, x2, y + R + 8);
          ctx.stroke();
          ctx.setLineDash([]);
          arrowHead(x2, y + R + 2, -Math.PI / 2, color);
          ctx.restore();
          write((x1 + x2) / 2, y + depth * 0.78 + 14, minus(c), c === 0 ? "faint" : "image", { size: 13 });
        });
        {
          const c = coef[2];
          const color = c === 0 ? d.alpha(d.color("muted"), 0.35) : d.color("image");
          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = c === 0 ? 1.4 : 1.6 + Math.abs(c) * 1.1;
          if (c === 0) ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(xs[2], y - R - 18, 18, Math.PI * 0.85, Math.PI * 2.15);
          ctx.stroke();
          ctx.restore();
          write(xs[2], y - R - 50, `${minus(c)}`, c === 0 ? "faint" : "image", { size: 13 });
        }
        ["e₁", "e₂", "e₃"].forEach((name, i) => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(xs[i], y, R, 0, Math.PI * 2);
          ctx.fillStyle = d.alpha(d.color("subspace"), 0.16);
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = d.color("subspace");
          ctx.stroke();
          ctx.restore();
          write(xs[i], y, name, "text", { size: narrow ? 14 : 16 });
        });
        const combo = coef
          .map((c, i) => ({ c, v: `e${"₁₂₃"[i]}` }))
          .filter(({ c }) => c !== 0)
          .map(({ c, v }, i) => `${c < 0 ? "−" : i ? "+" : ""}${Math.abs(c) === 1 ? "" : Math.abs(c)}${v}`)
          .join("") || "0";
        write(w / 2, h - 34, `Ce₁=e₂，Ce₂=e₃，Ce₃=${combo}`, "muted", { size: narrow ? 11.5 : 13, weight: 650 });
      });
      if (!open) {
        readCard.innerHTML = `<h4>伴随矩阵</h4>${waitNote("C、最小多项式与不变因子")}`;
        return;
      }
      const C = K.mat(companion());
      const minimal = K.minimalPolynomial(C);
      const mp = P.make(minimal.map((x) => x));
      const inv = P.invariantFactors(P.charMatrix(companion()));
      const shown = Boolean(flow?.revealed);
      readCard.innerHTML = `<h4>伴随矩阵</h4><div>${texD(`C=${numMatrix(C)}`)}</div>
        <ul class="ch8l-list"><li>${tex(`|\\lambda E-C|=${pfac(P.det(P.charMatrix(companion())))}`)}</li>
        ${shown ? `<li>最小多项式 ${tex(pfac(mp))}</li>
        <li>不变因子 ${tex(inv.map(pfac).join(",\\ "))}</li>` : ""}</ul>
        ${shown ? `<p class="ch7l-muted">${P.eq(mp, dpoly()) ? "最小多项式就是 d(λ)。" : ""}e₁, Ce₁, C²e₁ 恰好是 e₁, e₂, e₃。</p>` : `<p class="ch7l-muted">拖动滑块或换一个 d(λ)，最小多项式与不变因子随后出现。</p>`}`;
    }

    sliders.forEach((s) =>
      s.addEventListener("input", () => {
        state.a[Number(s.dataset.a)] = Number(s.value);
        flow?.acted();
        redraw();
      }),
    );
    K.chips(
      ui.bars[0],
      Object.entries(COMPANION_PRESETS).map(([key, v]) => [key, `d(λ)=${v.label}`]),
      (key) => {
        state.a = COMPANION_PRESETS[key].a.slice();
        flow?.acted();
        redraw();
      },
      "p1",
    );
    flow = gate(ui.gateHost, ui.result, {
      question: `${tex("d(\\lambda)=\\lambda^3+a_2\\lambda^2+a_1\\lambda+a_0")}，C 是它的伴随矩阵。C 的最小多项式是什么？`,
      options: [
        { text: "就是 d(λ)", correct: true },
        { text: "d(λ) 有重根时是它的真因式", why: "e₁, Ce₁, C²e₁ 线性无关，次数小于 3 的多项式 g 都使 g(C)e₁≠0。" },
        { text: "总是 λ³", why: "C³=0 只在 a₀=a₁=a₂=0 时成立。" },
        { text: "取决于 a₀, a₁, a₂ 的取值，没有统一答案", why: "对任何系数，C 的最小多项式都是 d(λ)。" },
      ],
      actHint: "已记下你的预测。拖动滑块或换一个 d(λ)，结论随后出现。",
      conclusion: "C 把 e₁ 依次送到 e₂、e₃，C³e₁=Ce₃=−a₀e₁−a₁e₂−a₂e₃，所以 d(C)e₁=0，进而 d(C)=0。e₁, Ce₁, C²e₁ 线性无关，次数更低的多项式消不掉 e₁，最小多项式就是 d(λ)，λE−C 的不变因子是 1, 1, d(λ)。即使 d(λ)=(λ−1)²(λ+1) 有重根也是如此。",
    });
    redraw();
    return () => plane.destroy();
  }

  /* ---------- figures (inline SVG, themed by the Chapter 7 figure classes) ---------- */

  const FIGURES = {};

  /* §4: three matrices with |λE−A|=(λ−2)³ and three different lists of invariant factors. */
  FIGURES.sameCharPoly = () => {
    const cols = [
      { x: 90, name: "A₁=2E", ones: [], d: ["λ−2", "λ−2", "λ−2"] },
      { x: 270, name: "A₂", ones: [[1, 0]], d: ["1", "λ−2", "(λ−2)²"] },
      { x: 450, name: "A₃", ones: [[1, 0], [2, 1]], d: ["1", "1", "(λ−2)³"] },
    ];
    const s = 24;
    const body = cols
      .map(({ x, name, ones, d }) => {
        let g = `<text x="${x}" y="22" text-anchor="middle" class="ch7f-text">${name}</text>`;
        const x0 = x - 1.5 * s;
        const y0 = 36;
        g += `<path d="M${x0 - 4} ${y0}h-4v${3 * s}h4M${x0 + 3 * s + 4} ${y0}h4v${3 * s}h-4" class="ch7f-stroke is-muted" style="stroke-width:1.4"/>`;
        for (let i = 0; i < 3; i += 1)
          for (let j = 0; j < 3; j += 1) {
            const one = ones.some(([a, b]) => a === i && b === j);
            const v = i === j ? "2" : one ? "1" : "0";
            g += `<text x="${x0 + j * s + s / 2}" y="${y0 + i * s + s / 2 + 5}" text-anchor="middle" class="${v === "0" ? "ch7f-small" : one ? "ch7f-text is-coral" : "ch7f-text"}">${v}</text>`;
          }
        d.forEach((t, k) => {
          const y = 132 + k * 34;
          const unit = t === "1";
          g += `<rect x="${x - 62}" y="${y}" width="124" height="26" rx="8" class="ch7f-box${unit ? "" : " is-accent"}"/><text x="${x}" y="${y + 18}" text-anchor="middle" class="${unit ? "ch7f-small" : "ch7f-text is-accent"}">d${"₁₂₃"[k]}=${t}</text>`;
        });
        return g;
      })
      .join("");
    return `<svg class="ch7f-svg" viewBox="0 0 540 270" role="img" aria-label="特征多项式都是 (λ−2)³ 的三个矩阵有三组不同的不变因子">
      ${body}<text x="270" y="262" text-anchor="middle" class="ch7f-small">三者的特征多项式都是 (λ−2)³，不变因子各不相同，两两不相似</text></svg>`;
  };

  /* ---------- theorem blocks ---------- */

  function renderFormal(root, section) {
    const f = section.lesson3d;
    if (!root || !f) return;
    const ponder = (p) =>
      p ? `<details class="ch3l-ponder"><summary><span>停一下</span>${p.q}</summary><p>${p.a}</p></details>` : "";
    const figure = (key) => (FIGURES[key] ? `<figure class="ch7l-figure ch8l-figure">${FIGURES[key]()}</figure>` : "");
    root.innerHTML = `<h2>定理与方法</h2><div class="ch7l-formal">${f.blocks
      .map(
        (b) =>
          `<article class="ch7l-theorem"><h3>${b.title}</h3>${b.tex ? `<div class="ch7l-theorem-math">${texD(b.tex)}</div>` : ""}${b.figure ? figure(b.figure) : ""}${b.text ? `<p>${b.text}</p>` : ""}${ponder(b.ponder)}</article>`,
      )
      .join("")}${f.pitfalls?.length ? `<div class="ch7l-pitfalls"><h3>容易错在哪里</h3><ul>${f.pitfalls.map((p) => `<li>${p}</li>`).join("")}</ul></div>` : ""}</div>`;
  }

  /* Theorem blocks always; a lab when given, moved above the theorem blocks. */
  function register(id, lab) {
    window.defineChapter8Renderer?.(id, {
      formal: (root, section) => renderFormal(root, section),
      interactive: lab
        ? (root, section, page) => {
            if (!root) return undefined;
            const formal = page?.querySelector(`#${CSS.escape(section.id)}-formal`);
            if (formal && formal.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING) formal.before(root);
            return lab(root, section);
          }
        : undefined,
    });
  }

  register("lambda-matrix", scanLab);
  register("smith-form", smithLab);
  register("invariant-factors", minorLab);
  register("similarity-criterion");
  register("elementary-divisors", divisorLab);
  register("jordan-derivation", towerLab);
  register("rational-canonical-form", companionLab);
})();
