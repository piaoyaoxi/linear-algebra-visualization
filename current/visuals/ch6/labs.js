/*
 * Chapter 6 labs. Abstract vectors (polynomials) are drawn as curves and,
 * through a basis, as points of the shared 3D scene. Every lab asks for a
 * prediction before its conclusion opens. Ranks, dimensions and equalities are
 * decided with exact rationals (Ch3Math); handles snap to halves so the values
 * stay exact.
 */
(() => {
  const K = () => window.Ch6Kit;
  const M = () => window.Ch3Math;
  const S = () => window.LAScene3D;
  const tex = (s) => K().tex(s);
  const texD = (s) => K().texD(s);
  const F = (x) => M().parseF(x);
  const num = (x) => M().toNumber(x);
  const fmt = (x) => M().latexF(x);
  const el = (...a) => K().el(...a);
  const vecTex = (v) => K().vecTex(v);
  const SUB = "₁₂₃";
  /*
   * Colour roles (docs/design-spec.md §2): the first and second vector take v1
   * and v2; a third vector takes drag when the student moves it, else subspace.
   */
  const COLORS = ["v1", "v2", "subspace"];
  const COLORS_DRAG3 = ["v1", "v2", "drag"];

  function pairViews(lab, leftTitle, rightTitle) {
    const pair = el("div", "ch6l-pair");
    const left = el("div", "ch6l-view", `<div class="ch6l-view-title">${leftTitle}</div>`);
    const right = el("div", "ch6l-view", `<div class="ch6l-view-title">${rightTitle}</div>`);
    const plotBox = el("div", "ch6l-plotbox");
    left.append(plotBox);
    pair.append(left, right);
    lab.append(pair);
    return { left, right, plotBox };
  }

  function stageBody(lab) {
    const body = el("div", "ch6l-body");
    const stage = el("div", "ch6l-stage");
    const side = el("aside", "ch6l-side");
    body.append(stage, side);
    lab.append(body);
    return { stage, side };
  }

  function rangeInput(label, key, min, max, step, value) {
    return `<label class="ch6l-range"><span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-${key} /><b data-${key}-v>${value}</b></label>`;
  }

  const fv = (v) => v.map(F);

  /* ================= §3 维数·基与坐标 ================= */

  function coordinatesLab(root) {
    const lab = K().labShell(root, {
      title: "多项式与它的坐标点",
      task: `${tex("P[x]_3")} 中取基 ${tex("1,x,x^2")}，每个多项式 ${tex("a_0+a_1x+a_2x^2")} 对应坐标 ${tex("(a_0,a_1,a_2)")}。左图是曲线，右图是坐标点；拖动右图的圆点，左边的曲线跟着变。`,
    });
    const PRESETS = {
      lay: { label: "1+2x²，4+x+5x²，3+2x", polys: [[1, 0, 2], [4, 1, 5], [3, 2, 0]], range: 5.5 },
      basis: { label: "1+x，x+x²，1+x²", polys: [[1, 1, 0], [0, 1, 1], [1, 0, 1]], range: 3.5 },
    };
    const Q = [1, 2, 3];
    const state = { polys: PRESETS.lay.polys.map((p) => p.slice()), c: [F(0), F(0), F(0)], revealed: false };

    const toolbar = el("div", "ch6l-toolbar");
    lab.append(toolbar);
    const { plotBox, right } = pairViews(lab, "函数图像", `坐标空间（基 ${tex("1,x,x^2")}）`);
    const scene = S().create(right, { range: 5.5, label: "三个多项式的坐标点", hint: "拖动圆点改变多项式 · 拖动空白处旋转", axisNames: ["1", "x", "x²"], yaw: -0.75, pitch: 0.36 });
    const grid = el("div", "ch6l-grid2");
    const controls = el("div", "ch6l-card");
    const info = el("div", "ch6l-card");
    grid.append(controls, info);
    lab.append(grid);
    const gateHost = el("div");
    const result = K().resultBox(`<p>坐标把 ${tex("P[x]_3")} 一对一地搬到 ${tex("P^3")}，并且保持加法和数乘。于是 ${tex("p_1,p_2,p_3")} 线性相关，当且仅当三个坐标点与原点共面。预设的三条曲线两两不成比例，坐标点却在同一平面上：${tex("3+2x=2(4+x+5x^2)-5(1+2x^2)")}。换成一组基后，每个 ${tex("q")} 恰有一组坐标。</p>`);
    lab.append(gateHost, result);

    controls.innerHTML = `<h4>组合 ${tex("c_1p_1+c_2p_2+c_3p_3")}，目标 ${tex("q=1+2x+3x^2")}</h4>
      ${[0, 1, 2].map((i) => rangeInput(tex(`c_${i + 1}`), `c${i}`, -3, 3, 0.5, 0)).join("")}
      <div class="ch6l-actions"><button type="button" class="ch6l-btn is-primary" data-solve>解出 q 的坐标</button><button type="button" class="ch6l-btn" data-look>沿平面看</button><button type="button" class="ch6l-btn" data-reset>回到默认视角</button></div>`;

    const polysF = () => state.polys.map(fv);

    function combo() {
      const ps = polysF();
      return [0, 1, 2].map((k) => ps.reduce((s, p, i) => M().add(s, M().mul(state.c[i], p[k])), F(0)));
    }

    function redraw() {
      const ps = polysF();
      const cm = combo();
      const qF = fv(Q);
      const hit = cm.every((x, k) => M().eq(x, qF[k]));
      const anyC = state.c.some((c) => !M().isZero(c));
      const curves = ps.map((p, i) => ({ f: (x) => K().polyEval(p, x), color: COLORS_DRAG3[i], width: 2.2 }));
      curves.unshift({ f: (x) => K().polyEval(qF, x), color: "faint", width: 5, opacity: 0.45 });
      if (anyC) curves.push({ f: (x) => K().polyEval(cm, x), color: "image", width: 3 });
      plotBox.innerHTML =
        K().plot({ x: [-2.5, 2.5], y: [-6, 12], ystep: 2, curves, label: "三个多项式与组合的图像" }) +
        K().legend([
          ...ps.map((p, i) => [COLORS_DRAG3[i], tex(`p_${i + 1}=${K().polyTex(p)}`)]),
          ["faint", tex("q=1+2x+3x^2")],
          ...(anyC ? [["image", "组合"]] : []),
        ]);

      scene.setObjects(() => {
        const vs = ps.map((p) => p.map(num));
        const objs = state.revealed ? [...K().spanObjects(ps, "subspace", { alpha: 0.1 })] : [];
        vs.forEach((v, i) => objs.push({ type: "arrow", to: v, color: COLORS_DRAG3[i], width: 2.2, label: `p${SUB[i]}` }));
        /*
         * Head-to-tail chain c₁p₁ → +c₂p₂ → +c₃p₃, each step in its vector's
         * colour; a dotted gap remains until the chain ends exactly on q.
         */
        let tail = [0, 0, 0];
        ps.forEach((p, i) => {
          if (M().isZero(state.c[i])) return;
          const head = S().vec.add(tail, p.map((x) => num(M().mul(x, state.c[i]))));
          objs.push({ type: "arrow", from: tail, to: head, color: COLORS_DRAG3[i], width: 3.2, label: `c${SUB[i]}p${SUB[i]}`, labelAt: S().vec.add(tail, S().vec.mul(S().vec.sub(head, tail), S().vec.len(tail) < 1e-9 ? 0.78 : 0.42)) });
          tail = head;
        });
        if (anyC && !hit) objs.push({ type: "segment", a: tail, b: Q, color: "axis", dash: [2, 3], width: 1.2 });
        objs.push({ type: "point", p: Q, color: hit ? "image" : "axis", r: hit ? 7.5 : 6.5, hollow: !hit, label: "q" });
        return objs;
      });
      scene.setHandles(
        state.polys.map((_, i) => ({
          color: "drag",
          snap: 0.5,
          get: () => state.polys[i],
          set: (p) => {
            state.polys[i] = p;
            redraw();
          },
        })),
      );

      const cols = ps;
      const rows = K().colsToRows(cols);
      const rank = M().rankOf(rows);
      const det = M().determinant(rows);
      const cert = M().relationCertificate(ps);
      let html = `<h4>读数</h4><p>坐标矩阵 ${tex(`(X_1,X_2,X_3)=${K().matTex(rows)}`)}</p>`;
      if (state.revealed) {
        html += `<p>${tex(`\\det=${fmt(det)}`)}，秩 ${tex(`=${rank}`)}</p>`;
        html += cert.dependent
          ? `<p class="ch6l-bad">线性相关：${tex(M().latexRelation(cert.coeffs, ["p_1", "p_2", "p_3"]))}，不是基</p>`
          : `<p class="ch6l-ok">线性无关，是 ${tex("P[x]_3")} 的一组基</p>`;
      } else {
        html += `<p class="ch6l-muted">先在下方作出预测，再看秩的判定。</p>`;
      }
      html += `<p>${tex(`c_1p_1+c_2p_2+c_3p_3=${K().polyTex(cm)}`)}</p>`;
      html += hit ? `<p class="ch6l-ok">命中 q：坐标为 ${tex(vecTex(state.c))}</p>` : "";
      if (hit && state.revealed && rank === 3) html += `<p class="ch6l-muted">三段折线恰好停在 q。换任何一个系数，终点都会离开 q：基下的坐标唯一。</p>`;
      info.innerHTML = html;
      info.dataset.rank = String(rank);
      info.dataset.hit = String(hit);
      controls.querySelectorAll("[data-c0-v],[data-c1-v],[data-c2-v]").forEach((b, i) => (b.innerHTML = tex(fmt(state.c[i]))));
    }

    function solve() {
      const ps = polysF();
      const qF = fv(Q);
      const aug = [0, 1, 2].map((k) => [ps[0][k], ps[1][k], ps[2][k], qF[k]]);
      const part = M().particularSolution(aug);
      const box = info;
      if (!part.ok) {
        redraw();
        box.insertAdjacentHTML("beforeend", `<p class="ch6l-bad">q 不在 ${tex("L(p_1,p_2,p_3)")} 中：没有任何组合等于 q。</p>`);
        return;
      }
      state.c = part.x;
      controls.querySelectorAll("input[type=range]").forEach((input, i) => (input.value = String(num(state.c[i]))));
      redraw();
      if (M().rankOf(aug.map((r) => r.slice(0, 3))) < 3) box.insertAdjacentHTML("beforeend", `<p class="ch6l-muted">这只是其中一组：三者相关时，组合方式不唯一。</p>`);
    }

    function load(key) {
      state.polys = PRESETS[key].polys.map((p) => p.slice());
      state.c = [F(0), F(0), F(0)];
      controls.querySelectorAll("input[type=range]").forEach((input) => (input.value = "0"));
      scene.resetView(false);
      scene.setRange(PRESETS[key].range, false);
      redraw();
    }

    K().chips(toolbar, Object.entries(PRESETS).map(([k, v]) => [k, v.label]), load, "lay");
    controls.querySelectorAll("input[type=range]").forEach((input, i) =>
      input.addEventListener("input", () => {
        state.c[i] = F(Number(input.value));
        redraw();
      }),
    );
    controls.querySelector("[data-solve]").addEventListener("click", solve);
    controls.querySelector("[data-reset]").addEventListener("click", () => scene.resetView());
    controls.querySelector("[data-look]").addEventListener("click", () => {
      const ps = polysF();
      const nonzero = ps.find((p) => p.some((x) => !M().isZero(x)));
      if (nonzero) scene.lookAlong(nonzero.map(num));
    });

    K().predictGate(
      gateHost,
      {
        question: `${tex("p_1=1+2x^2,\\ p_2=4+x+5x^2,\\ p_3=3+2x")} 是 ${tex("P[x]_3")} 的一组基吗？`,
        options: [
          { text: "是，三个多项式两两不成比例", why: "两两不成比例保证不了三个一起无关。旋转右图，看三个坐标点和原点的位置关系。" },
          { text: "是，个数恰好等于维数 3", why: "个数对上之后，还要线性无关。" },
          { text: "不是，三个坐标点与原点共面", correct: true },
          { text: "无法用坐标判断", why: "坐标保持线性组合，相关性可以完全在坐标里判断。" },
        ],
        right: "点“沿平面看”，三个点排成一条线：p₁、p₂、p₃ 线性相关。",
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

  /* ================= §4 基变换与坐标变换 ================= */

  function changeOfBasisLab(root) {
    const lab = K().labShell(root, {
      title: "同一条曲线，换一组基",
      task: `旧基 ${tex("\\varepsilon=(1,x,x^2)")}，新基 ${tex("\\eta=(1,\\,x-a,\\,(x-a)^2)")}。拖动 ${tex("a")}：曲线 ${tex("p")} 和它的旧坐标 ${tex("X")} 都不动，新基和新坐标 ${tex("Y")} 在变。`,
    });
    const PRESETS = {
      sq1: { label: "p=x²−1", p: [-1, 0, 1] },
      sq: { label: "p=x²", p: [0, 0, 1] },
      lin: { label: "p=1+x", p: [1, 1, 0] },
    };
    const state = { key: "sq1", a: F(0), revealed: false };
    const toolbar = el("div", "ch6l-toolbar");
    lab.append(toolbar);
    const { plotBox, right } = pairViews(lab, "函数图像", `旧坐标空间（基 ${tex("1,x,x^2")}）`);
    const scene = S().create(right, { range: 3, label: "新基向量与固定的坐标点", hint: "拖动空白处旋转", axisNames: ["1", "x", "x²"], yaw: -0.6, pitch: 0.4 });
    const controls = el("div", "ch6l-controls is-one");
    controls.innerHTML = rangeInput(tex("a"), "a", -2, 2, 0.5, 0);
    lab.append(controls);
    const info = el("div", "ch6l-status ch6l-matrices");
    lab.append(info);
    const gateHost = el("div");
    const result = K().resultBox(`<p>新坐标就是 Taylor 系数：${tex("Y=\\bigl(p(a),\\,p'(a),\\,\\tfrac12p''(a)\\bigr)^T")}。前两项 ${tex("Y_1+Y_2(x-a)")} 正是 ${tex("x=a")} 处的切线。${tex("A_a")} 的第 ${tex("j")} 列是新基第 ${tex("j")} 个向量在旧基下的坐标，坐标变换为 ${tex("X=A_aY")}：右图中沿新基走 ${tex("Y_1\\eta_1+Y_2\\eta_2+Y_3\\eta_3")}，终点仍是固定的 ${tex("X")}。</p>`);
    lab.append(gateHost, result);

    function data() {
      const p = PRESETS[state.key].p.map(F);
      const a = state.a;
      const a2 = M().mul(a, a);
      const Y = [M().add(M().add(p[0], M().mul(p[1], a)), M().mul(p[2], a2)), M().add(p[1], M().mul(F(2), M().mul(p[2], a))), p[2]];
      const A = [
        [F(1), M().neg(a), a2],
        [F(0), F(1), M().mul(F(-2), a)],
        [F(0), F(0), F(1)],
      ];
      return { p, a, Y, A, X: p };
    }

    function redraw() {
      const { p, a, Y, A, X } = data();
      const an = num(a);
      const curves = [
        { f: () => 1, color: COLORS[0], width: 1.6, opacity: 0.45 },
        { f: (x) => x - an, color: COLORS[1], width: 1.6, opacity: 0.45 },
        { f: (x) => (x - an) ** 2, color: COLORS[2], width: 1.6, opacity: 0.45 },
        { f: (x) => K().polyEval(p, x), color: "text", width: 3.2 },
      ];
      if (state.revealed) curves.push({ f: (x) => num(Y[0]) + num(Y[1]) * (x - an), color: "image", width: 2.4 });
      plotBox.innerHTML =
        K().plot({
          x: [-3, 3],
          y: [-3, 5],
          curves,
          vlines: [{ x: an, color: "drag", opacity: 0.5 }],
          points: [{ x: an, y: num(Y[0]), color: "drag", r: 5.5 }],
          label: "固定曲线与新基函数",
        }) +
        K().legend([
          ["text", tex(`p=${K().polyTex(p)}`)],
          [COLORS[0], tex("\\eta_1=1")],
          [COLORS[1], tex("\\eta_2=x-a")],
          [COLORS[2], tex("\\eta_3=(x-a)^2")],
          ...(state.revealed ? [["image", "前两项（切线）"]] : []),
        ]);

      scene.setObjects(() => {
        const cols = [0, 1, 2].map((j) => A.map((r) => num(r[j])));
        const objs = cols.map((c, j) => ({ type: "arrow", to: c, color: COLORS[j], width: 2.2, alpha: 0.85, label: `η${SUB[j]}` }));
        if (state.revealed) {
          let tail = [0, 0, 0];
          cols.forEach((c, j) => {
            const head = S().vec.add(tail, S().vec.mul(c, num(Y[j])));
            if (S().vec.len(S().vec.sub(head, tail)) > 1e-9) objs.push({ type: "arrow", from: tail, to: head, color: COLORS[j], width: 3.4 });
            tail = head;
          });
        }
        objs.push({ type: "point", p: X.map(num), color: "text", r: 7, label: "X" });
        return objs;
      });

      const check = M().matVec(A, Y).every((x, i) => M().eq(x, X[i]));
      info.innerHTML = `<div>${texD(`A_a=${K().matTex(A)}`)}</div>
        <div>${texD(`X=${K().colTex(X)}`)}</div>
        <div>${state.revealed ? texD(`Y=${K().colTex(Y)}`) : texD("Y=\\;?")}</div>
        <p>${state.revealed ? `${tex(`A_aY=${vecTex(M().matVec(A, Y))}^T`)} ${check ? `<span class="ch6l-ok">= X</span>` : ""}` : `先预测 ${tex("a=1")} 时的 ${tex("Y")}，再揭示新坐标。`}</p>`;
      info.dataset.check = String(check);
      const out = controls.querySelector("[data-a-v]");
      out.innerHTML = tex(fmt(a));
    }

    K().chips(toolbar, Object.entries(PRESETS).map(([k, v]) => [k, v.label]), (k) => {
      state.key = k;
      redraw();
    }, "sq1");
    controls.querySelector("[data-a]").addEventListener("input", (e) => {
      state.a = F(Number(e.target.value));
      redraw();
    });
    K().predictGate(
      gateHost,
      {
        question: `取 ${tex("p=x^2-1")}，${tex("a=1")}。${tex("p")} 在新基 ${tex("1,\\,x-1,\\,(x-1)^2")} 下的坐标 ${tex("Y")} 是什么？`,
        options: [
          { text: tex("(-1,0,1)^T"), why: "这是旧坐标 X，只有 a=0 时两者相同。" },
          { text: tex("(1,-2,1)^T"), why: "这是 (x−1)² 在旧基下的坐标，也就是 A₁ 的第三列。" },
          { text: tex("(0,2,1)^T"), correct: true },
          { text: tex("(0,1,1)^T"), why: "第二个坐标是 p 在 x=1 处的斜率。" },
        ],
        right: "x²−1=0+2(x−1)+(x−1)²。把 a 拖到 1 验证：左图的点落在 x 轴上，切线斜率为 2。",
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

  /* ================= subspace helpers (§6, §7) ================= */

  /* Exact intersection of L(U) and L(W): basis vectors of U ∩ W. */
  function intersectionBasis(Ugens, Wgens) {
    const Bu = K().independent(Ugens);
    const Bw = K().independent(Wgens);
    if (!Bu.length || !Bw.length) return { Bu, Bw, basis: [] };
    const cols = [...Bu, ...Bw.map((w) => w.map(M().neg))];
    const { basis } = M().nullspaceBasis(K().colsToRows(cols));
    const vecs = basis.map((coef) => [0, 1, 2].map((k) => Bu.reduce((s, u, i) => M().add(s, M().mul(coef[i], u[k])), F(0))));
    return { Bu, Bw, basis: vecs };
  }

  /* Scale an exact vector to small integers for display. */
  function primitive(v) {
    const den = v.reduce((l, x) => (l * x.d) / gcd(l, x.d), 1);
    let ints = v.map((x) => (x.n * den) / x.d);
    const g = ints.reduce((a, b) => gcd(a, b), 0) || 1;
    ints = ints.map((x) => x / g);
    const first = ints.find((x) => x !== 0);
    if (first < 0) ints = ints.map((x) => -x);
    return ints.map((x) => F(x));
  }
  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a;
  }

  const spaceName = (d) => ["{0}", "一条直线", "一个平面", "ℝ³"][d];

  /* ================= §6 子空间的交与和 ================= */

  function intersectionLab(root) {
    const lab = K().labShell(root, {
      title: "两个子空间合起来有多大",
      task: `${tex("U=L(u_1,u_2)")} 与 ${tex("W")} 是 ${tex("\\mathbb R^3")} 中过原点的子空间。拖动生成向量的端点（每次半格），看交 ${tex("U\\cap W")} 与和 ${tex("U+W")} 怎样变化。`,
    });
    const PRESETS = {
      planes: { label: "两个平面", mode: "planes", w: [[1, 1, 0], [1, -1, 2]] },
      same: { label: "两平面重合", mode: "planes", w: [[1, 1, 2], [1, -1, 0]] },
      line: { label: "平面与直线", mode: "line", w: [[1, 1, 0]] },
      lineIn: { label: "直线落进平面", mode: "line", w: [[1, 1, 2]] },
    };
    const state = { key: "planes", u: [[1, 0, 1], [0, 1, 1]], w: PRESETS.planes.w.map((v) => v.slice()), revealed: false };
    const toolbar = el("div", "ch6l-toolbar");
    lab.append(toolbar);
    const { stage, side } = stageBody(lab);
    const scene = S().create(stage, { range: 2.5, label: "两个子空间、它们的交与和", yaw: -0.85, pitch: 0.38 });
    const info = el("div", "ch6l-card");
    const tools = el("div", "ch6l-actions");
    tools.innerHTML = `<button type="button" class="ch6l-btn" data-look>沿交线看</button><button type="button" class="ch6l-btn" data-reset>回到默认视角</button>`;
    const gateHost = el("div");
    const result = K().resultBox(`<p>维数公式 ${tex("\\dim U+\\dim W=\\dim(U+W)+\\dim(U\\cap W)")}。在 ${tex("\\mathbb R^3")} 中 ${tex("\\dim(U+W)\\le3")}，所以两个平面的交至少是 ${tex("2+2-3=1")} 维：沿交线看，两个平面都缩成直线，交点就是那条公共直线。平面与直线一般只交于原点，和是 ${tex("\\mathbb R^3")}；直线落进平面后，交是这条直线，和退回平面。</p>`);
    side.append(info, tools, gateHost, result);

    function compute() {
      const U = state.u.map(fv);
      const W = state.w.map(fv);
      const { Bu, Bw, basis } = intersectionBasis(U, W);
      const sum = M().rankOf(K().colsToRows([...U, ...W]));
      return { U, W, Bu, Bw, basis, sum };
    }

    function redraw() {
      const { U, W, Bu, Bw, basis, sum } = compute();
      const inter = basis.length;
      scene.setObjects(() => {
        const objs = [...K().spanObjects(Bu, "v1", { label: "U" }), ...K().spanObjects(Bw, "v2", { label: "W", alpha: 0.12 })];
        if (state.revealed && inter === 1) objs.push({ type: "line", dir: basis[0].map(num), color: "subspace", width: 4.2, label: "U∩W" });
        U.forEach((v, i) => objs.push({ type: "arrow", to: v.map(num), color: "v1", width: 2.4, label: `u${SUB[i]}` }));
        W.forEach((v, i) => objs.push({ type: "arrow", to: v.map(num), color: "v2", width: 2.4, label: `w${SUB[i]}` }));
        return objs;
      });
      scene.setHandles([
        ...state.u.map((_, i) => ({ color: "drag", snap: 0.5, get: () => state.u[i], set: (p) => ((state.u[i] = p), redraw()) })),
        ...state.w.map((_, i) => ({ color: "drag", snap: 0.5, get: () => state.w[i], set: (p) => ((state.w[i] = p), redraw()) })),
      ]);
      const dU = Bu.length;
      const dW = Bw.length;
      let html = `<h4>维数账本</h4><p>${tex(`\\dim U=${dU}`)}（${spaceName(dU)}），${tex(`\\dim W=${dW}`)}（${spaceName(dW)}）</p>`;
      if (state.revealed) {
        html += `<p>${tex(`\\dim(U\\cap W)=${inter}`)}${inter ? `，${inter === 1 ? tex(`U\\cap W=L(${vecTex(primitive(basis[0]))})`) : "U∩W 是整个平面"}` : "，只有零向量"}</p>`;
        html += `<p>${tex(`\\dim(U+W)=${sum}`)}，${tex("U+W")} 是${spaceName(sum)}</p>`;
        html += `<p class="ch6l-ok">${tex(`${dU}+${dW}=${sum}+${inter}`)}</p>`;
      } else {
        html += `<p class="ch6l-muted">先作出预测，再看交与和的维数。</p>`;
      }
      info.innerHTML = html;
      info.dataset.ledger = [dU, dW, inter, sum].join(",");
      tools.querySelector("[data-look]").disabled = !state.revealed || inter !== 1;
    }

    function load(key) {
      scene.setHandles([]);
      state.key = key;
      state.u = [[1, 0, 1], [0, 1, 1]];
      state.w = PRESETS[key].w.map((v) => v.slice());
      scene.resetView(false);
      redraw();
    }

    K().chips(toolbar, Object.entries(PRESETS).map(([k, v]) => [k, v.label]), load, "planes");
    tools.querySelector("[data-look]").addEventListener("click", () => {
      const { basis } = compute();
      if (basis.length === 1) scene.lookAlong(basis[0].map(num));
    });
    tools.querySelector("[data-reset]").addEventListener("click", () => scene.resetView());
    K().predictGate(
      gateHost,
      {
        question: `${tex("\\mathbb R^3")} 中两个不同的过原点平面，交可以只有零向量吗？`,
        options: [
          { text: "可以，只要两个平面错开得足够开", why: "拖动 w₁、w₂ 试试：只要两个平面不重合，绿色交线就一直在。" },
          { text: "可以，两个平面互相垂直时", why: "xy 平面与 xz 平面互相垂直，仍交于 x 轴。" },
          { text: "不可以，交至少是一条直线", correct: true },
          { text: "取决于观察角度", why: "交是两个集合的公共部分，与怎么看无关。" },
        ],
        right: "2+2−3=1：U+W 最多是 ℝ³，所以交至少 1 维。点“沿交线看”。",
      },
      () => {
        state.revealed = true;
        result.hidden = false;
        redraw();
      },
    );
    load("planes");
    return () => scene.destroy();
  }

  /* ================= §7 子空间的直和 ================= */

  function directSumLab(root) {
    const MODES = {
      split: {
        label: "直线 ⊕ 平面",
        task: `${tex("W")} 是水平面，${tex("U=L(u)")} 是一条斜线。拖动 ${tex("v")}：它沿 ${tex("U")} 的方向落到 ${tex("W")} 上，分成 ${tex("v=u'+w'")}。再拖动 ${tex("u")}，让直线向平面倾斜。`,
        predict: {
          question: `把 ${tex("u")} 压低，让直线越来越贴近平面 ${tex("W")}（但不落进去），${tex("v")} 的两个分量会怎样？`,
          options: [
            { text: "越来越长", correct: true },
            { text: "长度不变，只转方向", why: "压低 u，看 u′ 的箭头。" },
            { text: "越来越短", why: "u 的高度越小，要走更多倍的 u 才能升到 v 的高度。" },
            { text: "立刻变成正交分解", why: "分解沿 U 的方向进行，与是否垂直无关。" },
          ],
          right: "u′=t·u，其中 t=v₃/u₃。u₃→0 时 t 无限增大；u₃=0 时 U⊂W，U+W=W，直和不再成立。",
        },
        result: `<p>${tex("U\\cap W=\\{0\\}")} 且 ${tex("\\dim U+\\dim W=3")}，所以 ${tex("\\mathbb R^3=U\\oplus W")}，每个 ${tex("v")} 恰有一种分解。分解沿着 ${tex("U")} 的方向，画出的平行四边形一般不是矩形。直线越贴近平面，分量越长；直线落进平面后，平面外的 ${tex("v")} 无法分解，平面内的 ${tex("v")} 有无穷多种分解。</p>`,
      },
      three: {
        label: "同一平面内三条直线",
        task: `${tex("W_1,W_2,W_3")} 是三条过原点的直线，两两只交于原点。拖动 ${tex("w_3")} 的端点，看 ${tex("W_1+W_2+W_3")} 是不是直和。`,
        predict: {
          question: `三条直线都在水平面里，两两只交于原点。${tex("W_1+W_2+W_3")} 是直和吗？`,
          options: [
            { text: "是，两两交为零就够了", why: "看紫色箭头：零向量有一种非零分解。" },
            { text: "要看三条直线是否互相垂直", why: "直和与夹角无关，只看维数。" },
            { text: "不是，零向量有非零的分解", correct: true },
          ],
          right: "k₁w₁+k₂w₂+k₃w₃=0 有非零解，三段箭头首尾相接回到原点。维数 1+1+1=3，和空间却只是 2 维的平面。",
        },
        result: `<p>多个子空间的和是直和，当且仅当每个 ${tex("W_i")} 与其余子空间之和只交于零，也等价于 ${tex("\\dim(W_1+W_2+W_3)=\\dim W_1+\\dim W_2+\\dim W_3")}。这里 ${tex("W_3\\subset W_1+W_2")}，条件失败。把 ${tex("w_3")} 拖出水平面，三个维数之和等于 3，直和成立，${tex("\\mathbb R^3=W_1\\oplus W_2\\oplus W_3")}。</p>`,
      },
    };
    const lab = K().labShell(root, { title: "分解什么时候唯一", task: MODES.split.task });
    const state = { mode: "split", u: [1, 0.5, 1], v: [-1, 2, 2], w3: [1, 1, 0], revealed: false };
    const toolbar = el("div", "ch6l-toolbar");
    lab.append(toolbar);
    const { stage, side } = stageBody(lab);
    const scene = S().create(stage, { range: 3, label: "直线与平面的直和分解", yaw: -0.9, pitch: 0.32 });
    const info = el("div", "ch6l-card");
    const tools = el("div", "ch6l-actions");
    const gateHost = el("div");
    const result = K().resultBox("");
    side.append(info, tools, gateHost, result);
    const W1 = [1, 0, 0];
    const W2 = [0, 1, 0];

    // A line needs a nonzero direction vector: refuse to drag it onto the origin.
    const nonzero = (p, prev) => (p.every((x) => Math.abs(x) < 1e-12) ? prev : p);

    function drawSplit() {
      const u = fv(state.u);
      const v = fv(state.v);
      const uz = u[2];
      const ok = !M().isZero(uz);
      const t = ok ? M().div(v[2], uz) : null;
      const uc = ok ? u.map((x) => M().mul(x, t)) : null;
      const wc = ok ? v.map((x, k) => M().sub(x, uc[k])) : null;
      scene.setObjects(() => {
        const objs = [
          { type: "plane", n: [0, 0, 1], d: 0, color: "v2", alpha: 0.12, label: "W" },
          { type: "line", dir: state.u, color: "v1", width: 2, alpha: 0.7, label: "U" },
          { type: "arrow", to: state.u, color: "v1", width: 2, alpha: 0.7, label: "u" },
        ];
        if (ok) {
          const ucn = uc.map(num);
          const wcn = wc.map(num);
          objs.push({ type: "polygon", pts: [[0, 0, 0], ucn, state.v, wcn], color: "drag", alpha: 0.07, strokeAlpha: 0 });
          objs.push({ type: "segment", a: ucn, b: state.v, color: "axis", dash: [5, 4], width: 1.4 });
          objs.push({ type: "segment", a: wcn, b: state.v, color: "axis", dash: [5, 4], width: 1.4 });
          objs.push({ type: "arrow", to: ucn, color: "v1", width: 3.4, label: "u′" });
          objs.push({ type: "arrow", to: wcn, color: "v2", width: 3.4, label: "w′" });
        }
        objs.push({ type: "arrow", to: state.v, color: "drag", width: 3.4, label: "v" });
        return objs;
      });
      scene.setHandles([
        { color: "drag", snap: 0.5, get: () => state.u, set: (p) => ((state.u = nonzero(p, state.u)), redraw()) },
        { color: "drag", snap: 0.5, get: () => state.v, set: (p) => ((state.v = p), redraw()) },
      ]);
      const inter = ok ? 0 : 1;
      const sum = ok ? 3 : 2;
      let html = `<h4>读数</h4><p>${tex(`u=${vecTex(u)},\\ v=${vecTex(v)}`)}</p>`;
      if (state.revealed) {
        html += `<p>${tex(`\\dim(U\\cap W)=${inter}`)}，${tex(`\\dim(U+W)=${sum}`)}</p>`;
        if (ok) {
          html += `<p>${tex(`u'=${fmt(t)}\\,u=${vecTex(uc)}`)}</p><p>${tex(`w'=v-u'=${vecTex(wc)}`)}</p><p class="ch6l-ok">${tex("\\mathbb R^3=U\\oplus W")}，分解唯一</p>`;
        } else if (M().isZero(v[2])) {
          html += `<p class="ch6l-bad">${tex("U\\subset W")}：v 在 W 内，分解有无穷多种</p>`;
        } else {
          html += `<p class="ch6l-bad">${tex("U\\subset W")}：v 不在 ${tex("U+W=W")} 中，无法分解</p>`;
        }
      } else {
        html += `<p class="ch6l-muted">先作出预测，再看分量的数值。</p>`;
      }
      info.innerHTML = html;
      info.dataset.state = ok ? "direct" : "inside";
    }

    function drawThree() {
      const vs = [W1, W2, state.w3].map(fv);
      const rank = M().rankOf(K().colsToRows(vs));
      const pairOk = [[0, 1], [0, 2], [1, 2]].map(([i, j]) => M().rankOf(K().colsToRows([vs[i], vs[j]])) === 2);
      const cert = M().relationCertificate(vs);
      scene.setObjects(() => {
        const objs = [{ type: "plane", n: [0, 0, 1], d: 0, color: "faint", alpha: 0.08 }];
        vs.forEach((v, i) => {
          const vn = v.map(num);
          if (S().vec.len(vn) < 1e-9) return;
          objs.push({ type: "line", dir: vn, color: COLORS_DRAG3[i], width: 1.8, alpha: 0.65, label: `W${SUB[i]}` });
          objs.push({ type: "arrow", to: vn, color: COLORS_DRAG3[i], width: 2.6, label: `w${SUB[i]}` });
        });
        if (state.revealed && cert.dependent && rank === 2) {
          let tail = [0, 0, 0];
          vs.forEach((v, i) => {
            const head = S().vec.add(tail, v.map((x) => num(M().mul(x, cert.coeffs[i]))));
            if (S().vec.len(S().vec.sub(head, tail)) > 1e-9) objs.push({ type: "arrow", from: tail, to: head, color: "image", width: 3.2 });
            tail = head;
          });
        }
        return objs;
      });
      scene.setHandles([{ color: "drag", snap: 0.5, get: () => state.w3, set: (p) => ((state.w3 = nonzero(p, state.w3)), redraw()) }]);
      const pairsText = pairOk.every(Boolean) ? "两两交为 {0}" : "有两条直线重合";
      let html = `<h4>读数</h4><p>${pairsText}</p>`;
      if (state.revealed) {
        html += `<p>${tex(`\\dim(W_1+W_2+W_3)=${rank}`)}，维数之和 ${tex("=3")}</p>`;
        html += rank === 3
          ? `<p class="ch6l-ok">直和：${tex("\\mathbb R^3=W_1\\oplus W_2\\oplus W_3")}</p>`
          : `<p class="ch6l-bad">不是直和：${tex(M().latexRelation(cert.coeffs, ["w_1", "w_2", "w_3"]))}</p>`;
      } else {
        html += `<p class="ch6l-muted">先作出预测，再看维数。</p>`;
      }
      info.innerHTML = html;
      info.dataset.state = rank === 3 ? "direct" : "not-direct";
    }

    function redraw() {
      if (state.mode === "split") drawSplit();
      else drawThree();
    }

    function setTools() {
      tools.innerHTML =
        state.mode === "split"
          ? `<button type="button" class="ch6l-btn" data-low>把 u 压低</button><button type="button" class="ch6l-btn" data-flat>让 u 落进平面</button><button type="button" class="ch6l-btn" data-reset>回到默认视角</button>`
          : `<button type="button" class="ch6l-btn" data-lift>把 w₃ 抬出平面</button><button type="button" class="ch6l-btn" data-top>从上方看</button><button type="button" class="ch6l-btn" data-reset>回到默认视角</button>`;
      tools.querySelector("[data-reset]").addEventListener("click", () => scene.resetView());
      tools.querySelector("[data-low]")?.addEventListener("click", () => {
        state.u = [state.u[0], state.u[1], 0.5];
        redraw();
      });
      tools.querySelector("[data-flat]")?.addEventListener("click", () => {
        state.u = [state.u[0], state.u[1], 0];
        redraw();
      });
      tools.querySelector("[data-lift]")?.addEventListener("click", () => {
        state.w3 = [state.w3[0], state.w3[1], 1.5];
        redraw();
      });
      tools.querySelector("[data-top]")?.addEventListener("click", () => scene.lookAlong([0, 0, 1]));
    }

    function load(mode) {
      state.mode = mode;
      state.revealed = false;
      state.u = [1, 0.5, 1];
      state.v = [-1, 2, 2];
      state.w3 = [1, 1, 0];
      lab.querySelector(".ch6l-head p").innerHTML = MODES[mode].task;
      result.innerHTML = `<strong>结论</strong>${MODES[mode].result}`;
      result.hidden = true;
      gateHost.innerHTML = "";
      K().predictGate(gateHost, MODES[mode].predict, () => {
        state.revealed = true;
        result.hidden = false;
        redraw();
      });
      setTools();
      scene.resetView(false);
      redraw();
    }

    K().chips(toolbar, Object.entries(MODES).map(([k, v]) => [k, v.label]), load, "split");
    load("split");
    return () => scene.destroy();
  }

  /* ================= §8 线性空间的同构 ================= */

  function isomorphismLab(root) {
    const lab = K().labShell(root, {
      title: "两张“坐标”，同一套运算",
      task: `左图是 ${tex("p")}、${tex("q")} 和 ${tex("p+q")} 三条曲线，右图是它们在 ${tex("\\mathbb R^3")} 中的像。拖动右图中 ${tex("p")}、${tex("q")} 的像（每次半格），看 ${tex("p+q")} 的像是否落在平行四边形的第四个顶点。`,
    });
    const MODES = {
      coef: { label: "系数：σ(p)=(a₀,a₁,a₂)", name: "σ" },
      value: { label: "取值：τ(p)=(p(0),p(1),p(2))", name: "τ" },
      square: { label: "把 a₂ 换成 a₂²", name: "f" },
    };
    const state = { mode: "coef", p: [1, -1, 0.5].map(F), q: [0, 1.5, -0.5].map(F), revealed: false };
    const toolbar = el("div", "ch6l-toolbar");
    lab.append(toolbar);
    const { plotBox, right } = pairViews(lab, `${tex("P[x]_3")} 中的三条曲线`, `像所在的 ${tex("\\mathbb R^3")}`);
    const scene = S().create(right, { range: 2.5, label: "像与平行四边形", hint: "拖动圆点改变多项式 · 拖动空白处旋转", yaw: 0.4, pitch: 0.35 });
    const info = el("div", "ch6l-status");
    const gateHost = el("div");
    const result = K().resultBox(`<p>${tex("\\tau")} 保持加法和数乘：${tex("(p+q)(k)=p(k)+q(k)")}。它是单射，因为次数小于 3 的多项式若有 0、1、2 三个根，只能是零多项式；两边维数都是 3，所以 ${tex("\\tau")} 也是满射，是同构。拖动 ${tex("\\tau(p)")} 时，左图的曲线始终穿过三个指定高度的点，这就是插值。同构不唯一：${tex("\\sigma")} 与 ${tex("\\tau")} 是两个不同的同构。第三种对应把平方作用在系数上，${tex("p+q")} 的像离开第四个顶点，它不保持加法。</p>`);
    lab.append(info, gateHost, result);

    const add = (a, b) => a.map((x, i) => M().add(x, b[i]));
    function image(p) {
      if (state.mode === "coef") return p;
      if (state.mode === "value") return [0, 1, 2].map((k) => K().polyEvalF(p, k));
      return [p[0], p[1], M().mul(p[2], p[2])];
    }
    /* Inverse of σ or τ (Newton interpolation through x = 0, 1, 2). */
    function preimage(y) {
      if (state.mode === "coef") return y;
      const d1 = M().sub(y[1], y[0]);
      const d2 = M().add(M().sub(y[2], M().mul(F(2), y[1])), y[0]);
      const a2 = M().div(d2, F(2));
      return [y[0], M().sub(d1, a2), a2];
    }

    function redraw() {
      const s = add(state.p, state.q);
      const ip = image(state.p);
      const iq = image(state.q);
      const is = image(s);
      const corner = add(ip, iq);
      const closes = is.every((x, i) => M().eq(x, corner[i]));
      const pts = [];
      if (state.mode === "value") {
        [0, 1, 2].forEach((k) => {
          pts.push({ x: k, y: num(ip[k]), color: "v1", r: 4.5 });
          pts.push({ x: k, y: num(iq[k]), color: "v2", r: 4.5 });
          pts.push({ x: k, y: num(is[k]), color: "image", r: 5 });
        });
      }
      plotBox.innerHTML =
        K().plot({
          x: [-1.5, 3],
          y: [-3, 4],
          curves: [
            { f: (x) => K().polyEval(state.p, x), color: "v1", width: 2.2 },
            { f: (x) => K().polyEval(state.q, x), color: "v2", width: 2.2 },
            { f: (x) => K().polyEval(s, x), color: "image", width: 3 },
          ],
          vlines: state.mode === "value" ? [0, 1, 2].map((x) => ({ x, color: "faint", opacity: 0.5 })) : [],
          points: pts,
          label: "p、q 与 p+q 的图像",
        }) +
        K().legend([
          ["v1", tex(`p=${K().polyTex(state.p)}`)],
          ["v2", tex(`q=${K().polyTex(state.q)}`)],
          ["image", tex(`p+q=${K().polyTex(s)}`)],
        ]);
      const name = MODES[state.mode].name;
      scene.setObjects(() => {
        const [P, Q, Sn, C] = [ip, iq, is, corner].map((v) => v.map(num));
        const objs = [
          { type: "polygon", pts: [[0, 0, 0], P, C, Q], color: "axis", alpha: 0.06, strokeAlpha: 0.6, dash: [5, 4] },
          { type: "arrow", to: P, color: "v1", width: 2.8, label: `${name}(p)` },
          { type: "arrow", to: Q, color: "v2", width: 2.8, label: `${name}(q)` },
          { type: "arrow", to: Sn, color: "image", width: 3.2, label: `${name}(p+q)` },
        ];
        if (!closes) objs.push({ type: "point", p: C, color: "axis", r: 5.5, hollow: true, label: "第四个顶点" });
        return objs;
      });
      scene.setHandles(
        state.mode === "square"
          ? []
          : ["p", "q"].map((key) => ({
              color: "drag",
              snap: 0.5,
              get: () => image(state[key]).map(num),
              set: (pt) => {
                state[key] = preimage(fv(pt));
                redraw();
              },
            })),
      );
      info.dataset.closes = String(closes);
      info.innerHTML = `${tex(`${name}(p)=${vecTex(ip)},\\ ${name}(q)=${vecTex(iq)}`)}<br>${tex(`${name}(p+q)=${vecTex(is)}`)}，${tex(`${name}(p)+${name}(q)=${vecTex(corner)}`)}：${
        closes ? `<span class="ch6l-ok">两者相等，平行四边形闭合</span>` : `<span class="ch6l-bad">两者不等，加法没有被保持</span>`
      }`;
    }

    K().chips(toolbar, Object.entries(MODES).map(([k, v]) => [k, v.label]), (k) => {
      state.mode = k;
      redraw();
    }, "coef");
    K().predictGate(
      gateHost,
      {
        question: `${tex("\\tau(p)=(p(0),p(1),p(2))")} 是 ${tex("P[x]_3")} 到 ${tex("\\mathbb R^3")} 的同构吗？`,
        options: [
          { text: "不是，像不是 p 的系数", why: "同构只要求保持运算并且是双射，没有要求用系数。切到“取值”模式拖一拖。" },
          { text: "是", correct: true },
          { text: "不是，它不保持加法", why: "切到“取值”模式，看平行四边形是否闭合。" },
          { text: "只对一次多项式成立", why: "τ 对 P[x]₃ 中每个多项式都有定义；拖动 τ(p) 的三个坐标试试。" },
        ],
        right: "τ 线性，并且右图任意一点都对应唯一一条过三点的曲线。",
      },
      () => {
        state.revealed = true;
        result.hidden = false;
      },
    );
    redraw();
    return () => scene.destroy();
  }

  /* ---------- registration ---------- */

  const LABS = {
    "basis-coordinates": coordinatesLab,
    "change-of-basis": changeOfBasisLab,
    "intersection-sum": intersectionLab,
    "direct-sum": directSumLab,
    isomorphism: isomorphismLab,
  };

  ["sets-maps", "vector-space-definition", "basis-coordinates", "change-of-basis", "subspaces", "intersection-sum", "direct-sum", "isomorphism"].forEach((id) => {
    const lab = LABS[id];
    window.defineChapter6Renderer?.(id, {
      formal: (root, section) => K().renderFormal(root, section),
      interactive: lab
        ? (root, section, page) => {
            if (!root) return undefined;
            K().placeAboveFormal(root, section, page);
            return lab(root);
          }
        : undefined,
    });
  });
})();
