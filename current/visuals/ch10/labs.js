/*
 * Chapter 10 (双线性函数与辛空间) labs and theorem blocks.
 *   §1 linear-functional — a linear function drawn as a family of parallel level lines
 *   §2 dual-space        — a skew basis and its dual basis as coordinate readers
 *   §3 bilinear-form     — fixing y turns B(x, y) = xᵀAy into a linear function of x
 *   §4 symplectic-space  — ω(x, y) = x₁y₂ − x₂y₁ as signed area, kept by det-1 maps
 * Built on the Chapter 7 kit (lab shell, prediction gate, 2D plane). Every
 * reading and every decision uses exact rationals; floats only draw.
 */
(() => {
  const K = window.Ch7Kit;
  if (!K) return;
  const { tex, texD, F, num, lf, el } = K;
  const M = () => window.Ch3Math;

  /* ---------- exact helpers ---------- */

  /* Handles snap to quarters; read them back as exact rationals. */
  const fq = (x) => M().parseF(`${Math.round(x * 4)}/4`);
  const fv = (p) => p.map(fq);
  const dot = (u, v) => K.dotF(u, v);
  const isZero = (x) => M().isZero(x);
  const det2 = (a, b) => M().sub(M().mul(a[0], b[1]), M().mul(a[1], b[0]));
  const minus = (s) => String(s).replace(/^-/, "−");

  /* "3x₁ − x₂" style linear form in LaTeX from coefficients. */
  function formTex(coeffs, names) {
    const out = [];
    coeffs.forEach((c, i) => {
      if (isZero(c)) return;
      const mag = M().absF(c);
      const body = `${M().eq(mag, F(1)) ? "" : lf(mag)}${names[i]}`;
      out.push(out.length ? `${c.n < 0 ? "-" : "+"}${body}` : `${c.n < 0 ? "-" : ""}${body}`);
    });
    return out.join("") || "0";
  }

  /* fractions inside a matrix at full size, with room between the rows */
  const roomy = (t) => (t.includes("\\frac") ? t.replace(/\\frac/g, "\\dfrac").replace(/\\\\(?!\[)/g, "\\\\[4pt]") : t);

  const paren = (x) => (x.n < 0 ? `(${lf(x)})` : lf(x));

  /* ---------- drawing helpers ---------- */

  /*
   * The level lines c·x = k (k a multiple of the chosen step) of the linear
   * function with coefficient row c, plus labels along one side.
   */
  function levelLines(d, c, opts = {}) {
    const len = Math.hypot(c[0], c[1]);
    if (len < 1e-9) return;
    const color = opts.color || "subspace";
    const R = Math.hypot(d.halfW, d.halfH);
    const step = Math.max(1, Math.ceil((opts.minGap || 0.22) * len));
    const kMax = Math.floor((R * len) / step) * step;
    let u = [-c[1] / len, c[0] / len];
    if (u[1] < -1e-9 || (Math.abs(u[1]) < 1e-9 && u[0] < 0)) u = [-u[0], -u[1]];
    const ks = [];
    for (let k = -kMax; k <= kMax; k += step) {
      ks.push(k);
      const p = [(k * c[0]) / (len * len), (k * c[1]) / (len * len)];
      const zero = k === 0;
      if (zero && opts.zeroColor) d.line(p, u, opts.zeroColor, { width: 2.4 });
      else d.line(p, u, color, { width: zero ? 1.8 : 1.1, alpha: zero ? 0.85 : 0.5 });
      if (zero && opts.zeroLabel) {
        const r = -Math.min(d.halfW, d.halfH) * 0.72;
        d.text([u[0] * r, u[1] * r], opts.zeroLabel, opts.zeroColor || color, { dx: 10, align: "left", font: "700 12.5px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" });
      }
    }
    if (!opts.label) return;
    /*
     * Labels sit where the lines cross one edge (right or top). The edge where
     * the lines are spread out more wins; the other edge is used only when the
     * first one would carry fewer than two labels.
     */
    const X0 = d.halfW * 0.95;
    const Y0 = d.halfH * 0.88;
    const labelsOn = (edge) => {
      const coef = edge === "right" ? c[1] : c[0];
      if (Math.abs(coef) < 1e-9) return [];
      const every = Math.max(1, Math.ceil((56 * Math.abs(coef)) / (step * d.scale)));
      return ks
        .filter((k) => (k !== 0 || !opts.zeroLabel) && (k / step) % every === 0)
        .map((k) => ({ k, q: edge === "right" ? [X0, (k - c[0] * X0) / c[1]] : [(k - c[1] * Y0) / c[0], Y0] }))
        .filter(({ q }) => Math.abs(q[1]) <= d.halfH * 0.92 && (edge === "right" || Math.abs(q[0]) <= d.halfW - 26 / d.scale))
        /* keep clear of the axis names x₁ (right end of the x₁ axis) and x₂ (top of the x₂ axis) */
        .filter(({ q }) => (edge === "right" ? Math.abs(q[1]) * d.scale > 22 : Math.abs(q[0]) * d.scale > 34));
    };
    const first = opts.edge || (Math.abs(c[1]) <= Math.abs(c[0]) ? "right" : "top");
    let edge = first;
    let labels = labelsOn(first);
    if (labels.length < 2) {
      edge = first === "right" ? "top" : "right";
      labels = labelsOn(edge);
    }
    labels.forEach(({ k, q }) =>
      d.text(q, `${opts.label}=${minus(k)}`, color, { align: edge === "right" ? "right" : "center", dy: -8, font: "650 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" }),
    );
  }

  /*
   * Numbers on the integer level lines c·x = k, placed in a row across the
   * lines (perpendicular to them) in the lower part of the canvas. `strong`
   * holds the values to emphasise.
   */
  function numberLines(d, c, strong, color = "subspace") {
    const len2 = c[0] * c[0] + c[1] * c[1];
    if (len2 < 1e-9) return;
    const len = Math.sqrt(len2);
    let u = [-c[1] / len, c[0] / len];
    if (u[1] < -1e-9 || (Math.abs(u[1]) < 1e-9 && u[0] < 0)) u = [-u[0], -u[1]];
    const off = -d.halfH * 0.42;
    const kMax = Math.ceil(Math.hypot(d.halfW, d.halfH) * len);
    // keep at least 28px between numbers; a plain number gives way to a nearby emphasised one
    const every = Math.max(1, Math.ceil((28 * len) / d.scale));
    // crossed values keep the same spacing; the first and last crossed value always show
    const ends = strong.size ? [Math.min(...strong), Math.max(...strong)] : [];
    const nearEnd = (k) => ends.some((t) => t !== k && Math.abs(t - k) < every);
    for (let k = -kMax; k <= kMax; k += 1) {
      const isStrong = strong.has(k);
      const isEnd = ends.includes(k);
      if (!isEnd && (k % every || nearEnd(k))) continue;
      const q = [(k * c[0]) / len2 + u[0] * off, (k * c[1]) / len2 + u[1] * off];
      if (Math.abs(q[0]) > d.halfW - 12 / d.scale || Math.abs(q[1]) > d.halfH - 10 / d.scale) continue;
      d.text(q, minus(k), color, { align: "center", font: `${isStrong ? 750 : 600} ${isStrong ? 13.5 : 12}px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif` });
    }
  }

  /* Integer values k met by a path (exact f values at its vertices), leaving out the start value. */
  function crossedValues(fs) {
    if (fs.length < 2) return [];
    const lo = Math.min(...fs.map(num));
    const hi = Math.max(...fs.map(num));
    const start = fs[0].d === 1 ? fs[0].n : null;
    const out = [];
    for (let k = Math.ceil(lo - 1e-9); k <= Math.floor(hi + 1e-9); k += 1) if (k !== start) out.push(k);
    return out;
  }

  const waitNote = (what) => `<p class="ch7l-muted">先在上方猜一猜，再动手操作一次，${what}随后出现。</p>`;

  /* A reading next to a point, flipped to the left side near the right edge. */
  function pointLabel(d, p, text, color, dy) {
    // stay on the right of the point unless it is close to the right edge
    const left = p[0] > d.halfW * 0.6;
    d.text(p, text, color, { dx: left ? -14 : 14, dy, align: left ? "right" : "left" });
  }

  function rangeRow(label, key, value, min, max) {
    return `<label class="ch10l-range"><span>${label}</span><input type="range" min="${min}" max="${max}" step="1" value="${value}" data-${key} aria-label="${label.replace(/<[^>]+>/g, "")}" /><b data-${key}-v>${minus(value)}</b></label>`;
  }

  /* ================= §1 线性函数 ================= */

  const FUNCTIONAL_PRESETS = {
    p31: {
      label: "f(ε₁)=3, f(ε₂)=1",
      a: [3, 1],
      predict: {
        question: `${tex("f(\\varepsilon_1)=3,\\ f(\\varepsilon_2)=1")}。f=0 的直线是哪一条？`,
        options: [
          { text: "过原点、方向为 (1,−3) 的直线", correct: true },
          { text: "过原点、方向为 (3,1) 的直线", why: "f(3,1)=10，沿这个方向读数增长最快。" },
          { text: "过 ε₁、ε₂ 两个端点的直线", why: "这条线上 f(ε₁)=3、f(ε₂)=1，读数不相同。" },
          { text: "没有这样的直线", why: "f(0)=0，零向量总在 f=0 上。" },
        ],
        conclusion: "f(ε₁)=3、f(ε₂)=1 时 f(x)=3x₁+x₂，f=0 是过原点的直线 3x₁+x₂=0，方向 (1,−3)。其余等值线都与它平行：x 沿一条等值线移动，读数不变；每跨过一条整数等值线，读数改变 1。",
      },
    },
    p11: {
      label: "f(ε₁)=1, f(ε₂)=1",
      a: [1, 1],
      predict: {
        question: `${tex("f(\\varepsilon_1)=f(\\varepsilon_2)=1")}。让 x 沿着它所在的等值线移动，读数怎样变？`,
        options: [
          { text: "保持不变", correct: true },
          { text: "离原点越远越大", why: "等值线上的点可以离原点很远，读数仍然相同。" },
          { text: "先变大后变小", why: "f 沿一条直线是一次函数，在等值线上它是常数。" },
          { text: "取决于 x 的长度", why: "(2,0) 与 (1,1) 长度不同，读数都是 2。" },
        ],
        conclusion: "f(ε₁)=f(ε₂)=1 时 f(x)=x₁+x₂，它在每条直线 x₁+x₂=c 上取常值 c。读数只取决于 x 落在哪一条等值线上，与 x 的长度无关。",
      },
    },
    p20: {
      label: "f(ε₁)=2, f(ε₂)=0",
      a: [2, 0],
      predict: {
        question: `${tex("f(\\varepsilon_1)=2,\\ f(\\varepsilon_2)=0")}。等值线是什么方向？`,
        options: [
          { text: "竖直，与 ε₂ 平行", correct: true },
          { text: "水平，与 ε₁ 平行", why: "f(ε₁)=2≠0，沿 ε₁ 移动读数会变。" },
          { text: "斜 45°", why: "f(x)=2x₁ 与 x₂ 无关。" },
          { text: "只有 f=0 这一条", why: "每个值 c 都有自己的等值线 x₁=c/2。" },
        ],
        conclusion: "f(ε₁)=2、f(ε₂)=0 时 f(x)=2x₁。f(ε₂)=0 说明 ε₂∈ker f，ker f 就是 x₂ 轴，所以等值线都是竖直的，相邻两条整数等值线相距 1/2。",
      },
    },
  };

  function functionalLab(root) {
    const lab = K.labShell(root, {
      title: "等值线读出 f(x)",
      task: "每条绿色直线上 f 取同一个值，直线上的数字就是这个值，加粗的那条是 f=0，也就是 ker f。拖动金色的 x 读出 f(x)，它走过的路径越过哪几条直线会被加亮；用滑块改变 f(ε₁)、f(ε₂)，看整族直线怎样跟着变。",
    });
    const state = { key: "p31", a: [3, 1], x: [1, 0.5], path: [], dragging: false };
    const toolbar = el("div", "ch7l-toolbar");
    const gateHost = el("div");
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    const controls = el("div", "ch7l-card");
    const info = el("div", "ch7l-card");
    side.append(controls, info);
    body.append(stage, side);
    const result = el("div", "ch7l-result");
    lab.append(toolbar, gateHost, body, result);
    const plane = K.plane2d(stage, { extent: 3.2, hint: "拖动 x（每次四分之一格）", label: "线性函数的等值线" });
    let flow = null;
    gateHost.addEventListener("click", () => redraw());

    controls.innerHTML = `<h4>f 在基上的值</h4>${rangeRow(`f(ε₁)`, "a1", 3, -3, 3)}${rangeRow(`f(ε₂)`, "a2", 1, -3, 3)}`;
    const sliders = [controls.querySelector("[data-a1]"), controls.querySelector("[data-a2]")];

    function syncSliders() {
      sliders.forEach((s, i) => {
        s.value = state.a[i];
        controls.querySelector(`[data-a${i + 1}-v]`).textContent = minus(state.a[i]);
      });
    }

    function redraw() {
      const a = state.a.map(F);
      const x = fv(state.x);
      const value = dot(a, x);
      const zeroFn = a.every(isZero);
      // answer lines and readouts wait until the student has predicted and acted
      const open = Boolean(flow?.revealed);
      const pathF = state.path.map((q) => dot(a, fv(q)));
      const crossed = open && !zeroFn ? crossedValues(pathF) : [];
      plane.setDraw((d) => {
        d.grid(undefined, { alpha: 0.4 });
        d.axes();
        if (open && !zeroFn) {
          const len2 = state.a[0] ** 2 + state.a[1] ** 2;
          const dir = [-state.a[1], state.a[0]];
          // lines the path of x crossed: the same green with a glow underneath
          crossed.forEach((k) => d.line([(k * state.a[0]) / len2, (k * state.a[1]) / len2], dir, "subspace", { width: 7, alpha: 0.16 }));
          levelLines(d, state.a, { zeroColor: "subspace", zeroLabel: "f=0（ker f）" });
          numberLines(d, state.a, new Set(crossed));
          d.line(state.x, dir, "drag", { width: 1.6, dash: [6, 5], alpha: 0.75 });
          if (state.path.length > 1) {
            d.polyline(state.path, "drag", { width: 2, dash: [2, 4], alpha: 0.8 });
            // where the path first meets each crossed line
            crossed.forEach((k) => {
              for (let i = 1; i < state.path.length; i += 1) {
                const f0 = num(pathF[i - 1]);
                const f1 = num(pathF[i]);
                if ((f0 - k) * (f1 - k) <= 0 && f0 !== f1) {
                  const t = (k - f0) / (f1 - f0);
                  const [p0, p1] = [state.path[i - 1], state.path[i]];
                  d.point([p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t], "subspace", { r: 3.5 });
                  break;
                }
              }
            });
          }
        }
        d.arrow([0, 0], [1, 0], "v1", { width: 2.4, label: "ε₁", ldy: 6 });
        d.arrow([0, 0], [0, 1], "v2", { width: 2.4, label: "ε₂", ldx: -8 });
        d.segment([0, 0], [state.x[0], 0], "axis", { width: 1.2, dash: [3, 4] });
        d.segment([state.x[0], 0], state.x, "axis", { width: 1.2, dash: [3, 4] });
        d.arrow([0, 0], state.x, "drag", { width: 2.8 });
        if (open) pointLabel(d, state.x, `f(x)=${minus(M().formatF(value))}`, "drag", -14);
      });
      if (!open) {
        info.innerHTML = `<h4>读数</h4><p class="ch7l-muted">先在上方猜一猜，再动手操作一次，等值线和读数随后出现。</p>`;
        return;
      }
      nowNote(a, zeroFn);
      const sum = `${paren(x[0])}\\cdot${paren(a[0])}+${paren(x[1])}\\cdot${paren(a[1])}`;
      let html = `<h4>读数</h4><div>${texD(`f(x)=x_1f(\\varepsilon_1)+x_2f(\\varepsilon_2)`)}${texD(`=${sum}=${lf(value)}`)}</div>`;
      if (zeroFn) {
        html += `<p class="ch7l-muted">f(ε₁)=f(ε₂)=0：f 是零函数，整个平面都是 f=0。</p>`;
      } else {
        html += `<p>${tex(`f(x)=${formTex(a, ["x_1", "x_2"])}`)}，${tex(`\\ker f:\\ ${formTex(a, ["x_1", "x_2"])}=0`)}</p>`;
        html += isZero(value)
          ? `<p class="ch7l-ok">x 落在 ker f 上。</p>`
          : `<p class="ch7l-muted">x 所在的等值线（金色虚线）与 ker f 平行。</p>`;
        if (pathF.length > 1) {
          const f0 = pathF[0];
          const change = M().sub(value, f0);
          html += `<p data-lf-path>${tex(`f:\\ ${lf(f0)}\\to ${lf(value)}`)}，读数改变 ${tex(lf(change))}。${
            crossed.length ? `路径经过 ${crossed.length} 条整数等值线（${crossed.map(minus).join("、")}），已加亮。` : "路径没有越过整数等值线。"
          }</p>`;
        }
      }
      info.innerHTML = html;
    }

    /*
     * The conclusion explains the preset that was predicted; once the sliders
     * move f away from it, one more line describes the f now on screen.
     */
    function nowNote(a, zeroFn) {
      result.querySelector("[data-lf-now]")?.remove();
      const preset = FUNCTIONAL_PRESETS[state.key].a;
      if (result.hidden || (state.a[0] === preset[0] && state.a[1] === preset[1])) return;
      const [a1, a2] = state.a;
      let text;
      if (zeroFn) text = "现在 f(ε₁)=f(ε₂)=0：f 是零函数，整个平面都是 ker f。";
      else {
        const g = gcdInt(Math.abs(a1), Math.abs(a2)) || 1;
        let d = [-a2 / g, a1 / g];
        if (d[0] < 0 || (d[0] === 0 && d[1] < 0)) d = [-d[0], -d[1]];
        text = `现在 f(ε₁)=${minus(a1)}、f(ε₂)=${minus(a2)}：${tex(`f(x)=${formTex(a, ["x_1", "x_2"])}`)}，ker f 是过原点、方向为 (${d.map(minus).join(",")}) 的直线，其余等值线都与它平行。`;
      }
      result.insertAdjacentHTML("beforeend", `<p data-lf-now>${text}</p>`);
    }
    const gcdInt = (p, q) => (q ? gcdInt(q, p % q) : p);

    plane.setHandles([
      {
        color: "drag",
        snap: 0.25,
        limit: 3,
        get: () => state.x,
        set: (p) => {
          // a new drag starts a new path of x
          if (!state.dragging) {
            state.dragging = true;
            state.path = [state.x.slice()];
          }
          state.x = p;
          const last = state.path[state.path.length - 1];
          if (last[0] !== p[0] || last[1] !== p[1]) state.path.push(p.slice());
          redraw();
        },
        end: () => {
          state.dragging = false;
          flow?.acted();
        },
      },
    ]);

    sliders.forEach((s, i) =>
      s.addEventListener("input", () => {
        state.path = [];
        state.a[i] = Number(s.value);
        syncSliders();
        redraw();
        flow?.acted();
      }),
    );

    function newFlow() {
      const p = FUNCTIONAL_PRESETS[state.key].predict;
      flow = K.predictFlow(gateHost, result, { ...p, actHint: "记下了你的猜测。拖动 x 或移动滑块，结论随后出现。", onReveal: () => redraw() });
    }

    K.chips(
      toolbar,
      Object.entries(FUNCTIONAL_PRESETS).map(([k, v]) => [k, v.label]),
      (k) => {
        state.key = k;
        state.a = FUNCTIONAL_PRESETS[k].a.slice();
        state.path = [];
        syncSliders();
        newFlow();
        redraw();
      },
      state.key,
    );
    newFlow();
    redraw();
    return () => plane.destroy();
  }

  /* ================= §2 对偶空间 ================= */

  function dualLab(root) {
    const lab = K.labShell(root, {
      title: "斜基与它的对偶基",
      task: "η₁、η₂ 是一组斜的基，g₁、g₂ 是它的对偶基：g₁(η₁)=1，g₁(η₂)=0，g₂ 反过来。拖动 η₁、η₂ 看等值线族怎样跟着变（蓝线属于 g₁，朱线属于 g₂）；拖动金色的 x，读出它的两个坐标。",
    });
    const state = { view: "g1", eta: [[1.5, 0.5], [0.5, 1.5]], x: [1.75, 1.25] };
    const toolbar = el("div", "ch7l-toolbar");
    const gateHost = el("div");
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    const readCard = el("div", "ch7l-card");
    const matCard = el("div", "ch7l-card");
    side.append(readCard, matCard);
    body.append(stage, side);
    const result = el("div", "ch7l-result");
    lab.append(toolbar, gateHost, body, result);
    const plane = K.plane2d(stage, { extent: 3.2, hint: "拖动 η₁、η₂（每次半格）与 x", label: "对偶基的等值线", spreadLabels: true });
    let flow = null;
    gateHost.addEventListener("click", () => redraw());

    function compute() {
      const X = [[F(state.eta[0][0]), F(state.eta[1][0])], [F(state.eta[0][1]), F(state.eta[1][1])]];
      const Xi = K.inv(X);
      return { X, Xi, rows: Xi ? [Xi[0], Xi[1]] : null };
    }

    function redraw() {
      const { X, Xi, rows } = compute();
      const x = fv(state.x);
      const [e1, e2] = state.eta;
      const reads = rows ? rows.map((r) => dot(r, x)) : null;
      // answer lines and readouts wait until the student has predicted and acted
      const open = Boolean(flow?.revealed);
      plane.setDraw((d) => {
        d.grid(undefined, { alpha: 0.3 });
        d.axes();
        if (rows && open) {
          const rn = rows.map((r) => r.map(num));
          const both = state.view === "both";
          /*
           * gᵢ vanishes on the other basis vector, so every level line of g₁ is
           * parallel to η₂ (and g₂'s to η₁): the zero line through that vector
           * glows, and a dashed copy of it lies along the line gᵢ=1 through ηᵢ's tip.
           */
          const parallel = (own, other, color, otherColor) => {
            if (!both) {
              d.line([0, 0], other, color, { width: 8, alpha: 0.16 });
              d.segment([0, 0], other, otherColor, { width: 9, alpha: 0.18 });
            }
            d.arrow(own, [own[0] + other[0], own[1] + other[1]], otherColor, { width: 2, dash: [5, 4], alpha: 0.5 });
          };
          if (state.view !== "g2") parallel(e1, e2, "v1", "v2");
          if (state.view !== "g1") parallel(e2, e1, "v2", "v1");
          if (state.view !== "g2") levelLines(d, rn[0], { label: "g₁", color: "v1", zeroColor: both ? null : "v1", zeroLabel: both ? null : "g₁=0", edge: both ? "right" : undefined });
          if (state.view !== "g1") levelLines(d, rn[1], { label: "g₂", color: "v2", zeroColor: both ? null : "v2", zeroLabel: both ? null : "g₂=0", edge: both ? "top" : undefined });
          const r = reads.map(num);
          const corner = [r[0] * e1[0], r[0] * e1[1]];
          d.segment([0, 0], corner, "v1", { width: 1.4, dash: [4, 4] });
          d.segment(corner, state.x, "v2", { width: 1.4, dash: [4, 4] });
        }
        d.arrow([0, 0], e1, "v1", { width: 3, label: "η₁" });
        d.arrow([0, 0], e2, "v2", { width: 3, label: "η₂" });
        d.point(state.x, "drag", { r: 4 });
        d.text(state.x, "x", "drag", { dx: -14, dy: 12, align: "right", font: "700 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" });
        if (reads && open) pointLabel(d, state.x, `(${minus(M().formatF(reads[0]))}, ${minus(M().formatF(reads[1]))})`, "drag", -14);
      });
      if (rows && !open) {
        readCard.innerHTML = `<h4>读数</h4>${waitNote("等值线和读数")}`;
        matCard.innerHTML = `<h4>过渡矩阵</h4><p class="ch10l-arrow">ε → η：${tex("(\\eta_1,\\eta_2)=(\\varepsilon_1,\\varepsilon_2)A")}</p><div>${texD(`A=${roomy(K.latexMatrix(X))}`)}</div>`;
        return;
      }
      if (!rows) {
        readCard.innerHTML = `<h4>读数</h4><p class="ch7l-bad">η₁、η₂ 共线，不构成基，没有对偶基。</p>`;
        matCard.innerHTML = `<h4>过渡矩阵</h4><div>${texD(`A=${roomy(K.latexMatrix(X))},\\quad |A|=0`)}</div>`;
        return;
      }
      const parNote = {
        g1: "g₁(η₂)=0：η₂ 躺在 g₁=0 上，g₁ 的每条等值线都与 η₂ 平行（虚线是平移到 η₁ 终点的 η₂）。",
        g2: "g₂(η₁)=0：η₁ 躺在 g₂=0 上，g₂ 的每条等值线都与 η₁ 平行（虚线是平移到 η₂ 终点的 η₁）。",
        both: "g₁ 的等值线平行于 η₂，g₂ 的等值线平行于 η₁，两族合成 η₁、η₂ 的斜网格。",
      }[state.view];
      readCard.innerHTML = `<h4>读数</h4><ul class="ch10l-readout">
        <li>${tex(`g_1(x)=${lf(reads[0])},\\quad g_2(x)=${lf(reads[1])}`)}</li>
        <li>${tex(`x=${formTex(reads, ["\\eta_1", "\\eta_2"])}`)}</li></ul>
        <p class="ch7l-muted" data-dual-par>${parNote}</p>
        <p class="ch7l-muted">x 所在格点的两个编号就是它在 η₁、η₂ 下的坐标。</p>`;
      const B = K.transpose(Xi);
      matCard.innerHTML = `<h4>两个过渡矩阵</h4>
        <p class="ch10l-arrow">ε → η：${tex("(\\eta_1,\\eta_2)=(\\varepsilon_1,\\varepsilon_2)A")}</p>
        <div>${texD(`A=${roomy(K.latexMatrix(X))}`)}</div>
        <p class="ch10l-arrow">f → g：${tex("(g_1,g_2)=(f_1,f_2)(A^T)^{-1}")}</p>
        <div>${texD(`(A^T)^{-1}=${roomy(K.latexMatrix(B))}`)}</div>
        <ul class="ch10l-readout"><li>${tex(`g_1=${formTex(rows[0], ["f_1", "f_2"])}`)}</li><li>${tex(`g_2=${formTex(rows[1], ["f_1", "f_2"])}`)}</li></ul>`;
    }

    const etaHandle = (i, color) => ({
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
    plane.setHandles([
      etaHandle(0, "drag"),
      etaHandle(1, "drag"),
      {
        color: "drag",
        snap: 0.25,
        limit: 3,
        get: () => state.x,
        set: (p) => {
          state.x = p;
          redraw();
        },
        end: () => flow?.acted(),
      },
    ]);

    K.chips(
      toolbar,
      [
        ["g1", "g₁ 的等值线"],
        ["g2", "g₂ 的等值线"],
        ["both", "两族一起"],
      ],
      (k) => {
        state.view = k;
        redraw();
      },
      state.view,
    );
    flow = K.predictFlow(gateHost, result, {
      question: `${tex("\\eta_1")} 不动，只拖动 ${tex("\\eta_2")}。${tex("g_1")} 的等值线方向怎样变？`,
      options: [
        { text: "始终与 η₂ 平行，跟着 η₂ 转", correct: true },
        { text: "始终与 η₁ 平行", why: "g₁(η₁)=1≠0，沿 η₁ 方向读数在变。" },
        { text: "始终与 η₁ 垂直", why: "只有 η₂ 恰好与 η₁ 垂直时才如此。" },
        { text: "不变，g₁ 只由 η₁ 决定", why: "g₁ 还要满足 g₁(η₂)=0。" },
      ],
      actHint: "记下了你的猜测。拖动 η₂，结论随后出现。",
      onReveal: () => redraw(),
      conclusion: "g₁(η₂)=0，所以 g₁ 的零线就是 η₂ 所在的直线，g₁=1 的线经过 η₁ 的终点；同理 g₂ 的等值线都与 η₁ 平行。两族等值线织成 η₁、η₂ 的斜网格，x 所在格点的编号 (g₁(x), g₂(x)) 就是 x 在这组基下的坐标。",
    });
    redraw();
    return () => plane.destroy();
  }

  /* ================= §3 双线性函数 ================= */

  const BILINEAR_PRESETS = {
    ns: {
      label: "不对称",
      A: [[1, 2], [0, 1]],
      x: [1, 1],
      y: [1, 0],
      predict: {
        question: `现在 ${tex("y=\\varepsilon_1")}。${tex("f(x,\\varepsilon_1)")} 作为 x 的线性函数，系数由 A 的哪一部分给出？`,
        options: [
          { text: "A 的第 1 列", correct: true },
          { text: "A 的第 1 行", why: "第 1 行给出 f(ε₁,y) 的系数，那是固定 x=ε₁ 的情形。" },
          { text: "只有 a₁₁", why: "f(x,ε₁)=a₁₁x₁+a₂₁x₂，a₂₁ 也参与。" },
          { text: "A 的行列式", why: "行列式只是一个数，定不出一族直线的方向。" },
        ],
        conclusion: "f(x,y)=xᵀ(Ay)，固定 y 后系数是 Ay。y=ε₁ 时 Ay 就是 A 的第 1 列 (a₁₁,a₂₁)ᵀ=(1,0)ᵀ，等值线是竖直的。y 一动，系数 Ay 跟着变，整族等值线转动，疏密也变。",
      },
    },
    sym: {
      label: "对称",
      A: [[2, 1], [1, 2]],
      x: [0.5, 1.5],
      y: [1, 0.5],
      predict: {
        question: `${tex("A=A^T")}。交换 x 与 y，读数 ${tex("f(x,y)")} 怎样变？`,
        options: [
          { text: "不变", correct: true },
          { text: "变号", why: "变号是反对称的情形，这里 A=Aᵀ。" },
          { text: "一般会变", why: "A 对称时 xᵀAy=(xᵀAy)ᵀ=yᵀAx。" },
          { text: "变成 0", why: "f(y,x)=f(x,y)，一般不为 0。" },
        ],
        conclusion: "f(y,x)=yᵀAx 是一个数，等于它的转置 xᵀAᵀy，而 Aᵀ=A，所以 f(y,x)=xᵀAy=f(x,y)。A 对称时，固定 y 看 x 与固定 x 看 y 用的是同一个矩阵；切换到“不对称”再交换一次，读数就会改变。",
      },
    },
    deg: {
      label: "退化",
      A: [[1, 1], [1, 1]],
      x: [1, 1],
      y: [1, 0.5],
      predict: {
        question: `${tex("A=\\begin{pmatrix}1&1\\\\1&1\\end{pmatrix}")}。是否有非零的 y，使 f(x,y) 对一切 x 都等于 0？`,
        options: [
          { text: "有，y 沿 (1,−1) 方向", correct: true },
          { text: "没有，因为 A≠0", why: "A≠0 不够，这里 |A|=0。" },
          { text: "有，y 沿 (1,1) 方向", why: "f(x,(1,1))=2x₁+2x₂，不恒为 0。" },
          { text: "只有 y=0", why: "把 y 拖到 (1,−1) 看看。" },
        ],
        conclusion: "Ay=0 有非零解 y=(1,−1)ᵀ，这时 f(·,y) 是零函数，画面上的等值线全部消失。|A|=0，f 退化；|A|≠0 时只有 y=0 才会这样。",
      },
    },
  };

  function bilinearLab(root) {
    const lab = K.labShell(root, {
      title: "固定一个变量，得到一个线性函数",
      task: "f(x,y)=xᵀAy。固定朱色的 y，f(·,y) 就是 x 的线性函数，绿色直线是它的等值线，紫色箭头 Ay 是它们的法向。拖动 y 看这族直线怎样转动，拖动 x 读出 f(x,y)。",
    });
    const state = { key: "ns", mode: "fixY", x: [1, 1], y: [1, 0] };
    const toolbar = el("div", "ch7l-toolbar");
    // the two mode chips form one segmented control; the swap action sits beside it as a plain button
    const modeRow = el("div", "ch10l-moderow");
    const modes = el("div", "ch7l-toolbar");
    modeRow.append(modes);
    const gateHost = el("div");
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    const readCard = el("div", "ch7l-card");
    const matCard = el("div", "ch7l-card");
    side.append(readCard, matCard);
    body.append(stage, side);
    const result = el("div", "ch7l-result");
    // title → prediction → the mode switches and the picture
    lab.append(toolbar, gateHost, modeRow, body, result);
    const plane = K.plane2d(stage, { extent: 3.2, hint: "拖动 x、y（每次四分之一格）", label: "双线性函数的等值线", spreadLabels: true });
    let flow = null;
    gateHost.addEventListener("click", () => redraw());

    const A = () => K.mat(BILINEAR_PRESETS[state.key].A);

    function redraw() {
      const a = A();
      const x = fv(state.x);
      const y = fv(state.y);
      const fixY = state.mode === "fixY";
      const coef = fixY ? K.matVec(a, y) : K.matVec(K.transpose(a), x);
      const value = dot(x, K.matVec(a, y));
      const free = fixY ? "x" : "y";
      // answer lines and readouts wait until the student has predicted and acted
      const open = Boolean(flow?.revealed);
      plane.setDraw((d) => {
        d.grid(undefined, { alpha: 0.35 });
        d.axes();
        if (open && !K.isZeroVec(coef)) {
          levelLines(d, coef.map(num), { label: "f", color: "subspace", zeroColor: "subspace", zeroLabel: "f=0" });
          /*
           * The coefficient vector Ay (or Aᵀx) is normal to the level lines: a
           * right-angle mark where it leaves the line f=0. A long vector is
           * drawn shortened, keeping its direction.
           */
          const c = coef.map(num);
          const L = Math.hypot(c[0], c[1]);
          // a long vector stops short of the edge band where the level lines are numbered
          const room = Math.min(d.halfW, d.halfH) * 0.74;
          const k = L > room ? room / L : 1;
          const tip = [c[0] * k, c[1] * k];
          const n = [c[0] / L, c[1] / L];
          const t = [-n[1], n[0]];
          const m = 14 / d.scale;
          d.polyline([[t[0] * m, t[1] * m], [t[0] * m + n[0] * m, t[1] * m + n[1] * m], [n[0] * m, n[1] * m]], "subspace", { width: 1.5 });
          d.arrow([0, 0], tip, "image", { width: 2.8, dash: k < 1 ? [7, 4] : undefined, label: k < 1 ? `${fixY ? "Ay" : "Aᵀx"} 的方向` : fixY ? "Ay" : "Aᵀx" });
        }
        d.arrow([0, 0], state.y, "v2", { width: fixY ? 3.4 : 2.4, label: "y" });
        d.arrow([0, 0], state.x, "v1", { width: fixY ? 2.4 : 3.4, label: "x" });
        if (open) pointLabel(d, fixY ? state.x : state.y, `f(x,y)=${minus(M().formatF(value))}`, "text", 16);
      });
      const fixedName = fixY ? "y" : "x";
      const coefTex = fixY ? "Ay" : "A^Tx";
      let html = `<h4>固定 ${fixedName}，f 是 ${free} 的线性函数</h4>
        <ul class="ch10l-readout"><li>${tex(`${coefTex}=${K.latexVec(coef)}`)}</li>`;
      html += K.isZeroVec(coef)
        ? `<li class="ch7l-bad">${tex(coefTex)} 是零向量：对一切 ${free}，f(x,y)=0。</li>`
        : `<li>${tex(`f(x,y)=${formTex(coef, [`${free}_1`, `${free}_2`])}`)}</li><li class="ch7l-muted" data-bil-normal>紫色箭头 ${tex(coefTex)} 与每条等值线垂直；沿它的方向 f 增长最快。</li>`;
      html += `<li>${tex(`f(x,y)=x^TAy=${lf(value)}`)}</li></ul>`;
      readCard.innerHTML = open ? html : `<h4>固定 ${fixedName}，f 是 ${free} 的线性函数</h4><p class="ch7l-muted">先在上方猜一猜，再动手操作一次，等值线和读数随后出现。</p>`;
      const detA = K.det(a);
      matCard.innerHTML = `<h4>度量矩阵</h4><div>${texD(`A=${K.latexMatrix(a)},\\quad |A|=${lf(detA)}`)}</div>
        <p><span class="ch10l-badge${isZero(detA) ? " is-off" : ""}">${isZero(detA) ? "退化" : "非退化"}</span> <span class="ch7l-muted">${K.eqMat(a, K.transpose(a)) ? "A=Aᵀ，f 对称" : "A≠Aᵀ，f(x,y) 与 f(y,x) 一般不同"}</span></p>`;
    }

    const handle = (key, color) => ({
      color,
      snap: 0.25,
      limit: 2.75,
      get: () => state[key],
      set: (p) => {
        state[key] = p;
        redraw();
      },
      end: () => flow?.acted(),
    });
    plane.setHandles([handle("x", "drag"), handle("y", "drag")]);

    function newFlow() {
      flow = K.predictFlow(gateHost, result, {
        ...BILINEAR_PRESETS[state.key].predict,
        actHint: {
          sym: "记下了你的猜测。点“交换 x、y”，结论随后出现。",
          ns: "记下了你的猜测。拖动 x 或 y，结论随后出现；点“y=ε₁”让 y 回到 ε₁。",
        }[state.key] || "记下了你的猜测。拖动 y，结论随后出现。",
        onReveal: () => redraw(),
      });
    }

    function setMode(mode) {
      state.mode = mode;
      modeChips.forEach((b) => b.classList.toggle("is-active", b.dataset.key === mode));
      redraw();
    }

    modes.innerHTML = `<button type="button" class="ch7l-chip is-active" data-key="fixY">固定 y，看 x</button><button type="button" class="ch7l-chip" data-key="fixX">固定 x，看 y</button>`;
    modeRow.insertAdjacentHTML("beforeend", `<button type="button" class="ch7l-btn" data-swap>交换 x、y</button><button type="button" class="ch7l-btn" data-yeps>y=ε₁</button>`);
    const modeChips = [...modes.querySelectorAll(".ch7l-chip")];
    modeChips.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.key)));
    modeRow.querySelector("[data-swap]").addEventListener("click", () => {
      [state.x, state.y] = [state.y, state.x];
      redraw();
      flow?.acted();
    });
    // the prediction asks about y=ε₁: one click brings y back there after a drag
    modeRow.querySelector("[data-yeps]").addEventListener("click", () => {
      state.y = [1, 0];
      redraw();
      flow?.acted();
    });

    K.chips(
      toolbar,
      Object.entries(BILINEAR_PRESETS).map(([k, v]) => [k, v.label]),
      (k) => {
        const p = BILINEAR_PRESETS[k];
        state.key = k;
        state.x = p.x.slice();
        state.y = p.y.slice();
        newFlow();
        redraw();
      },
      state.key,
    );
    newFlow();
    redraw();
    return () => plane.destroy();
  }

  /* ================= ＊§4 辛空间 ================= */

  const SYMPLECTIC_MAPS = {
    shear: { label: "剪切", K: [[1, 1], [0, 1]] },
    squeeze: { label: "挤压", K: [[2, 0], [0, "1/2"]] },
    rotate: { label: "旋转 90°", K: [[0, -1], [1, 0]] },
    stretch: { label: "横向拉伸", K: [[2, 0], [0, 1]] },
    swap: { label: "交换坐标", K: [[0, 1], [1, 0]] },
  };

  function symplecticLab(root) {
    const lab = K.labShell(root, {
      title: "保持有向面积的变换",
      task: "ω(x,y)=x₁y₂−x₂y₁ 是 x、y 张成的平行四边形的有向面积。选一个线性变换 K，比较虚线框（x、y）与实色框（Kx、Ky）：长度、夹角、ω 各变了没有。剪切时可以拖动滑块 s，让上边沿水平线滑动。",
    });
    const state = { key: "shear", x: [1.5, 0], y: [0.5, 1.25], t: 1, s: 1 };
    const toolbar = el("div", "ch7l-toolbar");
    const gateHost = el("div");
    const body = el("div", "ch7l-body");
    const stage = el("div", "ch7l-stage");
    const side = el("aside", "ch7l-side");
    const readCard = el("div", "ch7l-card");
    const matCard = el("div", "ch7l-card");
    const shearCard = el("div", "ch7l-card");
    shearCard.innerHTML = `<label class="ch10l-range"><span>剪切量 s</span><input type="range" min="-2" max="2" step="0.25" value="1" data-shear aria-label="剪切量 s" /><b data-shear-v>1</b></label>`;
    // swapping x and y reverses the orientation of the parallelogram: ω(y,x)=−ω(x,y)
    const swapRow = el("div", "ch7l-actions");
    swapRow.innerHTML = `<button type="button" class="ch7l-btn" data-swapxy>交换 x、y</button>`;
    side.append(swapRow, shearCard, readCard, matCard);
    body.append(stage, side);
    const result = el("div", "ch7l-result");
    lab.append(toolbar, gateHost, body, result);
    const plane = K.plane2d(stage, { extent: 3.6, hint: "拖动 x、y（每次四分之一格）", label: "有向面积与线性变换", spreadLabels: true });
    let flow = null;
    gateHost.addEventListener("click", () => redraw());
    let raf = 0;

    const omega = (u, v) => det2(u, v);
    const len = (v) => Math.hypot(v[0], v[1]);
    const angle = (u, v) => {
      const c = (u[0] * v[0] + u[1] * v[1]) / (len(u) * len(v) || 1);
      return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
    };
    const fmt = (v) => (Math.round(v * 100) / 100).toString();
    // exact when the value is a simple fraction (a length like 3/2, an angle like 90°), otherwise ≈
    const shown = (v) => {
      const f = M().fromNumber(v, 64);
      return Math.abs(f.n / f.d - v) < 1e-9 ? minus(M().formatF(f)) : `≈${Math.round(v * 10) / 10}`;
    };

    const shearOn = () => state.key === "shear";
    const shearK = () => [[1, fq(state.s)], [0, 1]].map((r) => r.map((v) => (typeof v === "number" ? F(v) : v)));

    function redraw() {
      shearCard.hidden = !shearOn();
      const Kf = shearOn() ? shearK() : K.mat(SYMPLECTIC_MAPS[state.key].K);
      const Kn = Kf.map((r) => r.map(num));
      const t = state.t;
      const Kt = Kn.map((r, i) => r.map((v, j) => (1 - t) * (i === j ? 1 : 0) + t * v));
      const app = (A, v) => [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
      const x = fv(state.x);
      const y = fv(state.y);
      const Kx = K.matVec(Kf, x);
      const Ky = K.matVec(Kf, y);
      const w0 = omega(x, y);
      const w1 = omega(Kx, Ky);
      const detK = K.det(Kf);
      const keeps = M().eq(detK, F(1));
      const kx = app(Kt, state.x);
      const ky = app(Kt, state.y);
      // answer lines and readouts wait until the student has predicted and acted
      const open = Boolean(flow?.revealed);
      plane.setDraw((d) => {
        d.grid(undefined, { alpha: 0.35 });
        d.axes();
        const sum = (u, v) => [u[0] + v[0], u[1] + v[1]];
        // the parallelogram of x, y: the ghost of the image (same colour, dashed, light fill)
        d.polygon([[0, 0], state.x, sum(state.x, state.y), state.y], "image", { dash: [5, 5], width: 1.4, alpha: 0.6, fillAlpha: 0.07 });
        if (open && shearOn()) shearGuides(d, kx, ky);
        // Kx, Ky and their parallelogram are images; whether ω is kept shows in the readout, not in a hue.
        const tone = "image";
        d.polygon([[0, 0], kx, sum(kx, ky), ky], tone, { width: 1.8, fillAlpha: 0.16 });
        d.arrow([0, 0], kx, tone, { width: 2.6, label: "Kx", ldy: 14 });
        d.arrow([0, 0], ky, tone, { width: 2.6, label: "Ky" });
        d.arrow([0, 0], state.x, "v1", { width: 1.8, alpha: 0.75, label: "x" });
        d.arrow([0, 0], state.y, "v2", { width: 1.8, alpha: 0.75, label: "y" });
      });
      const Kxn = Kx.map(num);
      const Kyn = Ky.map(num);
      readCard.innerHTML = `<h4>比较</h4>
        <table class="ch7l-table"><thead><tr><th></th><th>x, y</th><th>Kx, Ky</th></tr></thead><tbody>
        <tr><td>长度</td><td>${shown(len(state.x))}, ${shown(len(state.y))}</td><td>${shown(len(Kxn))}, ${shown(len(Kyn))}</td></tr>
        <tr><td>夹角</td><td>${shown(angle(state.x, state.y))}°</td><td>${shown(angle(Kxn, Kyn))}°</td></tr>
        <tr><td>ω</td><td>${open ? minus(M().formatF(w0)) : "?"}</td><td>${open ? minus(M().formatF(w1)) : "?"}</td></tr></tbody></table>
        ${isZero(w0) ? `<p class="ch7l-muted">x、y 共线，平行四边形压扁，ω(x,y)=0。</p>` : ""}`;
      if (!open) {
        matCard.innerHTML = `<h4>变换矩阵</h4><div>${texD(`K=${K.latexMatrix(Kf)}`)}</div><p class="ch7l-muted">先在上方猜一猜，再动手操作一次，ω 的读数随后出现。</p>`;
        return;
      }
      const base = shearOn()
        ? state.x[1] === 0 && state.y[1] !== 0
          ? `<p class="ch7l-muted" data-sym-base>底边 x 不动，上边沿水平虚线滑动，高 h 不变：同底同高，面积相等。</p>`
          : `<p class="ch7l-muted" data-sym-base>每个点沿水平虚线滑动。把 x 拖回 x₁ 轴，可以看到同底同高。</p>`
        : "";
      matCard.innerHTML = `<h4>变换矩阵</h4><div>${texD(`K=${K.latexMatrix(Kf)},\\quad |K|=${lf(detK)}`)}</div>
        <div>${texD(`\\omega(Kx,Ky)=|K|\\,\\omega(x,y)`)}</div>
        <p><span class="ch10l-badge${keeps ? "" : " is-off"}">${keeps ? "K 保持 ω" : "K 不保持 ω"}</span></p>${base}
        <p data-sym-swap>${tex(`\\omega(y,x)=${lf(M().neg(w0))}=-\\omega(x,y)`)}</p>
        <p class="ch7l-muted">交换 x、y，平行四边形的定向反过来，ω 变号；所以 ${tex("\\omega(x,x)=0")}。</p>`;
    }

    /*
     * A shear moves every point along its horizontal line. With x on the x₁ axis
     * the base Ox stays put and the top edge slides along the line x₂ = y₂: same
     * base, same height, same area.
     */
    function shearGuides(d, kx, ky) {
      const [x, y] = [state.x, state.y];
      const tops = [y, [x[0] + y[0], x[1] + y[1]]];
      tops.forEach((q) => d.line([0, q[1]], [1, 0], "axis", { width: 1, dash: [2, 3] }));
      if (x[1] !== 0) d.line([0, x[1]], [1, 0], "axis", { width: 1, dash: [2, 3] });
      if (x[1] === 0 && y[1] !== 0) {
        d.segment([0, 0], x, "v1", { width: 8, alpha: 0.18 });
        [y, ky].forEach((q, i) => d.segment([q[0], 0], q, "axis", { width: 1.3, dash: [4, 3] }));
        const h = M().formatF(fq(y[1])).replace("-", "−");
        d.text([ky[0], ky[1] / 2], `h=${h}`, "axis", { dx: 8, align: "left", font: "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" });
      }
    }

    function animate() {
      cancelAnimationFrame(raf);
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        state.t = 1;
        redraw();
        return;
      }
      const start = performance.now();
      const step = (now) => {
        state.t = Math.min(1, (now - start) / 600);
        redraw();
        if (state.t < 1) raf = requestAnimationFrame(step);
      };
      state.t = 0;
      raf = requestAnimationFrame(step);
    }

    const handle = (key, color) => ({
      color,
      snap: 0.25,
      limit: 2.5,
      get: () => state[key],
      set: (p) => {
        state[key] = p;
        redraw();
      },
      end: () => flow?.acted(),
    });
    plane.setHandles([handle("x", "drag"), handle("y", "drag")]);

    swapRow.querySelector("[data-swapxy]").addEventListener("click", () => {
      [state.x, state.y] = [state.y, state.x];
      redraw();
      flow?.acted();
    });

    const shearIn = shearCard.querySelector("[data-shear]");
    shearIn.addEventListener("input", () => {
      cancelAnimationFrame(raf);
      state.s = Number(shearIn.value);
      state.t = 1;
      shearCard.querySelector("[data-shear-v]").textContent = M().formatF(fq(state.s)).replace("-", "−");
      redraw();
      flow?.acted();
    });

    K.chips(
      toolbar,
      Object.entries(SYMPLECTIC_MAPS).map(([k, v]) => [k, v.label]),
      (k) => {
        state.key = k;
        animate();
        flow?.acted();
      },
      state.key,
    );
    flow = K.predictFlow(gateHost, result, {
      question: `剪切 ${tex("K=\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}")} 改变了 x、y 的长度和夹角。${tex("\\omega(Kx,Ky)")} 与 ${tex("\\omega(x,y)")} 相比怎样？`,
      options: [
        { text: "相等", correct: true },
        { text: "变大", why: "拖动 x、y 看表格：ω 一栏的两个数始终相同。" },
        { text: "变号", why: "变号需要 |K|<0，剪切的 |K|=1。" },
        { text: "取决于 x、y", why: "ω(Kx,Ky)=|K|ω(x,y) 对一切 x、y 成立。" },
      ],
      actHint: "记下了你的猜测。拖动 x、y 或换一个变换，结论随后出现。",
      onReveal: () => redraw(),
      conclusion: "ω(Kx,Ky)=|K|·ω(x,y)。剪切、挤压与旋转的 |K|=1，有向面积不变，尽管长度与夹角都可能改变；横向拉伸 |K|=2，面积加倍；交换坐标 |K|=−1，有向面积变号。平面上保持 ω 的线性变换恰好是 |K|=1 的变换。",
    });
    redraw();
    return () => {
      cancelAnimationFrame(raf);
      plane.destroy();
    };
  }

  /* ---------- theorem blocks ---------- */

  function renderFormal(root, section) {
    const f = section.lesson3d;
    if (!root || !f) return;
    const ponder = (p) =>
      p ? `<details class="ch3l-ponder"><summary><span>停一下</span>${p.q}</summary><p>${p.a}</p></details>` : "";
    root.innerHTML = `<h2>定理与方法</h2><div class="ch7l-formal">${f.blocks
      .map(
        (b) =>
          `<article class="ch7l-theorem"><h3>${b.title}</h3>${b.tex ? `<div class="ch7l-theorem-math">${texD(b.tex)}</div>` : ""}${b.text ? `<p>${b.text}</p>` : ""}${ponder(b.ponder)}</article>`,
      )
      .join("")}${f.pitfalls?.length ? `<div class="ch7l-pitfalls"><h3>容易错在哪里</h3><ul>${f.pitfalls.map((p) => `<li>${p}</li>`).join("")}</ul></div>` : ""}</div>`;
  }

  /* Theorem blocks always; a lab when given, moved above the theorem blocks. */
  function register(id, lab) {
    window.defineChapter10Renderer?.(id, {
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

  register("linear-functional", functionalLab);
  register("dual-space", dualLab);
  register("bilinear-form", bilinearLab);
  register("symplectic-space", symplecticLab);
})();
