(() => {
  const { M, tex, display, formalShell, module, proofSteps, misconception } = window.Ch2PresentationUtils;

  const KEYS = ["a11", "a12", "a21", "a22", "b1", "b2"];
  const PRESETS = {
    ex: { a11: 2, a12: 1, a21: 1, a22: 3, b1: 5, b2: 5 },
    // a₂ leans one tenth off a₁: D = 1/10, x = (1, 2); b₂ − 1/10 sends x to (3, 1)
    near: { a11: 1, a12: 2, a21: 1, a22: 2.1, b1: 5, b2: 5.2 },
    sing: { a11: 1, a12: 2, a21: 2, a22: 4, b1: 3, b2: 6 },
    none: { a11: 1, a12: 2, a21: 2, a22: 4, b1: 1, b2: 0 },
  };
  // stretch factors for the lens; the tag reads "厚度 ×N"
  const STRETCH = [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
  const FONT = "'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";

  /* every value sits on the 0.1 grid of the sliders, so tenths are exact integers */
  const tenths = (value) => Math.round(Number(value) * 10);
  const gcd = (a, b) => {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) [x, y] = [y, x % y];
    return x || 1;
  };
  // the exact fraction n/d (integers) as plain text and as TeX
  function ratio(n, d) {
    const num = d < 0 ? -n : n;
    const den = Math.abs(d);
    if (num === 0) return { text: "0", tex: "0" };
    const g = gcd(num, den);
    const p = Math.abs(num) / g;
    const q = den / g;
    const sign = num < 0;
    return {
      text: `${sign ? "−" : ""}${q === 1 ? p : `${p}/${q}`}`,
      tex: `${sign ? "-" : ""}${q === 1 ? p : `\\tfrac{${p}}{${q}}`}`,
    };
  }
  const add = (p, q) => [p[0] + q[0], p[1] + q[1]];

  /* exact readouts and decisions (D, D₁, D₂ are integers in hundredths) */
  function exact(s) {
    const t = Object.fromEntries(KEYS.map((key) => [key, tenths(s[key])]));
    const D = t.a11 * t.a22 - t.a12 * t.a21;
    const D1 = t.b1 * t.a22 - t.a12 * t.b2;
    const D2 = t.a11 * t.b2 - t.b1 * t.a21;
    let kind = "unique";
    if (D === 0) {
      const column = t.a11 || t.a21 ? [t.a11, t.a21] : [t.a12, t.a22];
      if (!column[0] && !column[1]) kind = t.b1 || t.b2 ? "none" : "infinite";
      else kind = column[0] * t.b2 - column[1] * t.b1 === 0 ? "infinite" : "none";
    }
    // a thin parallelogram: the sine of the angle between the columns is below 0.06 (display only)
    const near = D !== 0 && Math.abs(D) < 0.06 * Math.hypot(t.a11, t.a21) * Math.hypot(t.a12, t.a22);
    return { t, D, D1, D2, kind, near };
  }

  /* floating-point geometry for drawing (also used while the canvas animates) */
  function geometry(s) {
    const a1 = [s.a11, s.a21];
    const a2 = [s.a12, s.a22];
    const b = [s.b1, s.b2];
    const D = s.a11 * s.a22 - s.a12 * s.a21;
    const solvable = Math.abs(D) > 1e-9;
    const x1 = solvable ? (s.b1 * s.a22 - s.a12 * s.b2) / D : null;
    return { a1, a2, b, D, x1, land: solvable ? [x1 * a1[0], x1 * a1[1]] : null };
  }

  /* lens coordinates: a₁ laid flat along x, the height across a₁ drawn N times taller */
  function lensOf(g) {
    const length = Math.hypot(g.a1[0], g.a1[1]);
    const u = [g.a1[0] / length, g.a1[1] / length];
    const along = (p) => p[0] * u[0] + p[1] * u[1];
    const across = (p) => u[0] * p[1] - u[1] * p[0];
    const ends = [0, along(g.a1), along(g.a2), along(add(g.a1, g.a2))];
    const span = Math.max(...ends) - Math.min(...ends);
    const need = (0.3 * span) / (Math.abs(g.D) / length);
    const N = STRETCH.find((value) => value >= need) || STRETCH[STRETCH.length - 1];
    return { N, to: (p) => [along(p), N * across(p)] };
  }

  const lensPoints = (g) => [[0, 0], g.a1, g.a2, add(g.a1, g.a2), g.b, ...(g.land ? [g.land] : [])];

  function dot(ctx, point, color, palette, radius = 3.4) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = palette.paper;
    ctx.stroke();
    ctx.restore();
  }

  function label(ctx, text, x, y, palette, align = "left", size = 12) {
    ctx.save();
    ctx.font = `600 ${size}px ${FONT}`;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.strokeStyle = palette.paper;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = palette.text;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function mountCramer(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const lab = root.querySelector(".ch2-lab");
    const canvas = root.querySelector("[data-cramer-canvas]");
    const nudge = root.querySelector("[data-cramer-nudge]");
    const state = { ...PRESETS.ex };
    let shown = { ...state }; // what the canvas draws; it lerps while animating
    let ghost = null; // the state just before the last change of b (same a₁, a₂)
    let frame = null; // while only b slides: the fixed pair of states that sets camera and lens
    let dragging = false;
    let animating = false;

    const gate = window.LAPredictGate?.mount(root.querySelector("[data-cramer-gate]"), {
      root: lab,
      manual: true,
      key: "visuals/ch2/section7-presentation.js#near",
      question: "按「接近奇异」：a₁、a₂ 几乎平行，D 很小但不为 0。再让 b₂ 只减小 1/10，解 x₁、x₂ 会怎样？",
      options: [
        ["仍是唯一解，但变化很大", true, ""],
        ["仍是唯一解，只变化一点点", false, "放大框里，b 只挪了一点，沿 a₂ 滑回 a₁ 所在直线的落点 x₁a₁ 却移出一大段。"],
        ["变成无解", false, "D≠0 时，a₁、a₂ 能组合出平面上的任何 b，解一定存在。"],
        ["变成无穷多解", false, "无穷多解要求 D=0；D≠0 时只有一组 x₁、x₂。"],
      ],
      right: "✓ D≠0，解仍唯一。a₂ 几乎与 a₁ 平行，b 要沿 a₂ 走很远才能滑回 a₁ 所在直线，所以 b 稍一挪动，落点 x₁a₁ 就移出一大段。xᵢ=Dᵢ/D 的分母越小，解对 b 越敏感。",
      onPick: () => render(),
      onReveal: () => render(),
    });
    const picked = () => !gate || gate.picked;
    const revealed = () => !gate || gate.revealed;

    function matrixHtml(matrix) {
      const e = (value) => ratio(value, 10).tex;
      return tex(`\\begin{bmatrix}${e(matrix[0][0])}&${e(matrix[0][1])}\\\\${e(matrix[1][0])}&${e(matrix[1][1])}\\end{bmatrix}`);
    }

    function cameraFor(states) {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width || 520);
      const height = Math.max(1, rect.height || 340);
      const points = [[0, 0], [1, 0], [0, 1], [1, 1]];
      states.forEach((s) => {
        const g = geometry(s);
        points.push(g.a1, g.a2, add(g.a1, g.a2), g.b, add(g.b, g.a2));
        if (g.land && Math.abs(g.x1) <= 12) points.push(g.land, add(g.land, g.a2));
      });
      const minX = Math.min(...points.map((point) => point[0]), -0.5);
      const maxX = Math.max(...points.map((point) => point[0]), 0.5);
      const minY = Math.min(...points.map((point) => point[1]), -0.5);
      const maxY = Math.max(...points.map((point) => point[1]), 0.5);
      const pad = 34;
      const scale = M().clamp(Math.min((width - pad * 2) / Math.max(1, maxX - minX), (height - pad * 2) / Math.max(1, maxY - minY)), 16, Math.min(width, height) * 0.3);
      return { scale, origin: { x: width * 0.5 - ((minX + maxX) / 2) * scale, y: height * 0.53 + ((minY + maxY) / 2) * scale } };
    }

    /*
     * The lens: a framed box in the emptiest corner. a₁ lies flat, the thickness across a₁
     * is drawn N times larger, so the thin D, the height of b and the slide along a₂ are
     * visible. Parallel lines stay parallel and area ratios (Dᵢ/D) are unchanged.
     */
    function drawLens(ctx, view, palette, g, states, samples) {
      const { width, height } = view;
      const map = (p) => ({ x: view.origin.x + p[0] * view.scale, y: view.origin.y - p[1] * view.scale });
      const lens = lensOf(g);
      const all = states.flatMap((s) => lensPoints(geometry(s)));
      const q = all.map(lens.to);
      const minS = Math.min(...q.map((p) => p[0]));
      const maxS = Math.max(...q.map((p) => p[0]));
      const minT = Math.min(...q.map((p) => p[1]));
      const maxT = Math.max(...q.map((p) => p[1]));
      // the box hugs the stretched figure (uniform scale k), within a size budget;
      // the tag takes the side D leaves empty, the labels of a₁ and x₁a₁ the other side
      const up = g.D > 0;
      const tagH = 16;
      const labelH = 14;
      const padX = 12;
      const padY = 8;
      const extraH = 2 * padY + tagH + labelH;
      const maxW = M().clamp(Math.round(width * 0.5), 150, 250);
      const maxH = M().clamp(Math.round(height * 0.42), 110, 176);
      const k = Math.min((maxW - 2 * padX) / Math.max(1e-6, maxS - minS), (maxH - extraH) / Math.max(1e-6, maxT - minT));
      const boxW = Math.max(130, Math.round((maxS - minS) * k + 2 * padX));
      const boxH = Math.max(76, Math.round((maxT - minT) * k + extraH));
      const m = 10;
      const corners = [
        { x: m, y: m },
        { x: width - m - boxW, y: m },
        { x: width - m - boxW, y: height - m - boxH },
        { x: m, y: height - m - boxH },
      ];
      let box = corners[0];
      let best = Infinity;
      corners.forEach((corner) => {
        const hits = samples.filter((p) => p.x > corner.x - 8 && p.x < corner.x + boxW + 8 && p.y > corner.y - 8 && p.y < corner.y + boxH + 8).length;
        if (hits < best) {
          best = hits;
          box = corner;
        }
      });

      // the strip being magnified, ringed on the main view
      const screen = all.map(map);
      const sLen = Math.hypot(g.a1[0], g.a1[1]);
      const us = { x: g.a1[0] / sLen, y: -g.a1[1] / sLen };
      const ns = { x: -us.y, y: us.x };
      const al = screen.map((p) => p.x * us.x + p.y * us.y);
      const ac = screen.map((p) => p.x * ns.x + p.y * ns.y);
      const pad = 8;
      const halfW = (Math.max(...ac) - Math.min(...ac)) / 2 + pad;
      const halfL = Math.max(halfW, (Math.max(...al) - Math.min(...al)) / 2 + pad);
      const midL = (Math.max(...al) + Math.min(...al)) / 2;
      const midC = (Math.max(...ac) + Math.min(...ac)) / 2;
      const center = { x: us.x * midL + ns.x * midC, y: us.y * midL + ns.y * midC };
      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.rotate(Math.atan2(us.y, us.x));
      ctx.beginPath();
      ctx.moveTo(-(halfL - halfW), -halfW);
      ctx.lineTo(halfL - halfW, -halfW);
      ctx.arc(halfL - halfW, 0, halfW, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(-(halfL - halfW), halfW);
      ctx.arc(-(halfL - halfW), 0, halfW, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.closePath();
      ctx.strokeStyle = palette.axis;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.stroke();
      ctx.restore();

      // dotted leader from that ring to the box
      const boxCenter = { x: box.x + boxW / 2, y: box.y + boxH / 2 };
      const d = { x: boxCenter.x - center.x, y: boxCenter.y - center.y };
      const along = M().clamp(d.x * us.x + d.y * us.y, -(halfL - halfW), halfL - halfW);
      const side = d.x * ns.x + d.y * ns.y < 0 ? -1 : 1;
      const start = { x: center.x + us.x * along + ns.x * side * halfW, y: center.y + us.y * along + ns.y * side * halfW };
      const end = { x: M().clamp(start.x, box.x, box.x + boxW), y: M().clamp(start.y, box.y, box.y + boxH) };
      if (Math.hypot(end.x - start.x, end.y - start.y) > 6) {
        ctx.save();
        ctx.strokeStyle = palette.axis;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.restore();
      }

      const inner = { x: box.x + padX, y: box.y + padY + (up ? tagH : labelH), w: boxW - 2 * padX, h: boxH - extraH };
      const P = (p) => {
        const [s, t] = lens.to(p);
        return { x: inner.x + inner.w / 2 + (s - (minS + maxS) / 2) * k, y: inner.y + inner.h / 2 - (t - (minT + maxT) / 2) * k };
      };

      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(box.x, box.y, boxW, boxH, 6);
      else ctx.rect(box.x, box.y, boxW, boxH);
      ctx.fillStyle = palette.paper;
      ctx.fill();
      ctx.strokeStyle = palette.axis;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.clip();

      // the line of a₁ (where D=0 would squash everything)
      const o = P([0, 0]);
      ctx.save();
      ctx.strokeStyle = palette.axis;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(box.x, o.y);
      ctx.lineTo(box.x + boxW, o.y);
      ctx.stroke();
      ctx.restore();

      // D itself, now thick enough to see
      const corners4 = [[0, 0], g.a1, add(g.a1, g.a2), g.a2].map(P);
      ctx.save();
      ctx.beginPath();
      corners4.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.closePath();
      ctx.fillStyle = palette.image;
      ctx.globalAlpha = 0.14;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = palette.image;
      ctx.lineWidth = 1.4;
      if (g.D < 0) ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.restore();

      // the previous b, its slide and its landing point
      if (ghost) {
        const old = geometry(ghost);
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.setLineDash([5, 4]);
        M().drawArrow(ctx, o, P(old.b), palette.image, 2.2);
        if (old.land) {
          ctx.strokeStyle = palette.image;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(P(old.b).x, P(old.b).y);
          ctx.lineTo(P(old.land).x, P(old.land).y);
          ctx.stroke();
          dot(ctx, P(old.land), palette.image, palette, 3);
        }
        ctx.restore();
      }

      // b slides along a₂ back to the line of a₁ and lands on x₁a₁;
      // the slid parallelogram (x₁a₁, a₂) has the area D₁ = x₁D
      if (g.land) {
        ctx.save();
        ctx.beginPath();
        [[0, 0], g.land, add(g.land, g.a2), g.a2].map(P).forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
        ctx.strokeStyle = palette.muted;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = palette.image;
        ctx.lineWidth = 1.3;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(P(g.b).x, P(g.b).y);
        ctx.lineTo(P(g.land).x, P(g.land).y);
        ctx.stroke();
        ctx.restore();
      }
      M().drawArrow(ctx, o, P(g.a1), palette.v1, 2.2);
      M().drawArrow(ctx, o, P(g.a2), palette.v2, 2.2);
      M().drawArrow(ctx, o, P(g.b), palette.image, 2.4);
      if (g.land) dot(ctx, P(g.land), palette.image, palette);

      // labels: a₁ and x₁a₁ on the side away from D, a₂ and b at their tips
      const away = up ? 12 : -12;
      // labels stay inside the box and out of the tag's strip
      const top = box.y + 9 + (up ? tagH : 0);
      const bottom = box.y + boxH - 9 - (up ? 0 : tagH);
      const fit = (p) => ({ x: M().clamp(p.x, box.x + 14, box.x + boxW - 14), y: M().clamp(p.y, top, bottom) });
      // x₁a₁ near the tip of a₁ (x₁ close to 1): a₁ moves toward the origin, x₁a₁ to the right
      const landX = g.land ? P(g.land).x : null;
      const crowded = landX !== null && Math.abs(landX - (o.x + (P(g.a1).x - o.x) * 0.38)) < 36;
      const a1Mid = fit({ x: o.x + (P(g.a1).x - o.x) * (crowded ? 0.22 : 0.38), y: o.y + away });
      label(ctx, "a₁", a1Mid.x, a1Mid.y, palette, "center", 11.5);
      const a2Tip = fit({ x: P(g.a2).x - 6, y: P(g.a2).y - (up ? 7 : -7) });
      label(ctx, "a₂", a2Tip.x, a2Tip.y, palette, "right", 11.5);
      const bTip = P(g.b);
      label(ctx, "b", M().clamp(bTip.x + 7, box.x + 8, box.x + boxW - 12), M().clamp(bTip.y - (up ? 6 : -6), top, bottom), palette, "left", 11.5);
      if (g.land) {
        const at = fit({ x: crowded ? landX + 4 : landX, y: o.y + away });
        label(ctx, "x₁a₁", crowded ? Math.min(at.x, box.x + boxW - 34) : at.x, at.y, palette, crowded ? "left" : "center", 11.5);
      }
      ctx.restore();

      ctx.save();
      ctx.font = `12px ${FONT}`;
      ctx.fillStyle = palette.muted;
      ctx.textBaseline = "middle";
      ctx.fillText(`a₁ 放平 · 厚度 ×${lens.N}`, box.x + 10, up ? box.y + 13 : box.y + boxH - 11);
      ctx.restore();
    }

    function drawScene() {
      const cur = shown;
      const g = geometry(cur);
      const ex = exact(state);
      // a preset animation changes a₁, a₂ as well: no ghost, no lens until it settles
      const moving = animating && !frame;
      const states = frame ? frame.states : [ghost, cur].filter(Boolean);
      const camera = cameraFor(states);
      const view = M().drawTransformScene(canvas, [[cur.a11, cur.a12], [cur.a21, cur.a22]], {
        firstLabel: "a₁",
        secondLabel: "a₂",
        caption: "实线箭头为 b；虚线显示沿 a₂ 方向滑动",
        ...camera,
      });
      const ctx = canvas.getContext("2d");
      const palette = M().getPalette();
      const map = (vector) => ({ x: view.origin.x + vector[0] * view.scale, y: view.origin.y - vector[1] * view.scale });
      const lensOn = !moving && ex.near && picked();
      // almost parallel and no prediction yet: no landing point, no ghost (they would show the jump)
      const hideJump = ex.near && !picked();
      const samples = [];
      const seg = (p, q, n = 24) => {
        for (let i = 0; i <= n; i += 1) samples.push({ x: p.x + ((q.x - p.x) * i) / n, y: p.y + ((q.y - p.y) * i) / n });
      };

      if (ghost && !moving && !hideJump) {
        const old = geometry(ghost);
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.setLineDash([5, 4]);
        M().drawArrow(ctx, view.origin, map(old.b), palette.image, 2.6);
        if (old.land) {
          ctx.strokeStyle = palette.image;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(map(old.b).x, map(old.b).y);
          ctx.lineTo(map(old.land).x, map(old.land).y);
          ctx.stroke();
          // the old solution: x₁a₁ on the a₁ line and the slid parallelogram, both faint
          const oldArea = [[0, 0], old.land, add(old.land, old.a2), old.a2].map(map);
          ctx.beginPath();
          oldArea.forEach((point, index) => (index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
          ctx.closePath();
          ctx.lineWidth = 1;
          ctx.stroke();
          dot(ctx, map(old.land), palette.image, palette, 3);
        }
        ctx.restore();
        if (old.land) label(ctx, "改动前", map(old.land).x + 8, map(old.land).y + 14, palette, "left");
      }

      const target = map(g.b);
      M().drawArrow(ctx, view.origin, target, palette.image, 3.2);

      if (g.land) {
        const a2 = g.a2;
        const base = g.land;
        const currentArea = [[0, 0], g.b, add(g.b, a2), a2].map(map);
        const slidArea = [[0, 0], base, add(base, a2), a2].map(map);
        ctx.save();
        ctx.beginPath();
        currentArea.forEach((point, index) => (index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
        ctx.closePath();
        ctx.fillStyle = palette.image;
        ctx.globalAlpha = 0.09;
        ctx.fill();
        ctx.globalAlpha = 0.78;
        ctx.strokeStyle = palette.image;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.beginPath();
        slidArea.forEach((point, index) => (index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
        ctx.closePath();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = palette.muted;
        ctx.stroke();
        const slid = map(base);
        ctx.beginPath();
        ctx.moveTo(target.x, target.y);
        ctx.lineTo(slid.x, slid.y);
        ctx.strokeStyle = palette.image;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();
        if (!hideJump) dot(ctx, slid, palette.image, palette, 3);
        if (!lensOn) {
          ctx.save();
          ctx.fillStyle = palette.text;
          ctx.font = `600 12px ${FONT}`;
          ctx.fillText("沿 a₂ 方向滑到 x₁a₁", (target.x + slid.x) / 2 + 7, (target.y + slid.y) / 2 - 7);
          ctx.restore();
        }
        [currentArea, slidArea].forEach((area) => area.forEach((p, i) => seg(p, area[(i + 1) % 4])));
        seg(target, slid);
      } else {
        const direction = Math.hypot(...g.a1) > 1e-8 ? g.a1 : g.a2;
        const length = Math.hypot(...direction) || 1;
        const unit = [direction[0] / length, direction[1] / length];
        const pA = map([-unit[0] * 8, -unit[1] * 8]);
        const pB = map([unit[0] * 8, unit[1] * 8]);
        ctx.save();
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = palette.muted;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();
        ctx.restore();
        // name the line on its left, away from the caption and the tip labels
        const reach = 0.6 * Math.max(Math.hypot(...g.a1), Math.hypot(...g.a2), Math.abs(g.b[0] * unit[0] + g.b[1] * unit[1]), 1);
        const at = map([unit[0] * reach, unit[1] * reach]);
        // screen normal of the line, turned to point left (or up for a horizontal line)
        let side = { x: unit[1], y: unit[0] };
        if (side.x > 1e-9 || (Math.abs(side.x) <= 1e-9 && side.y > 0)) side = { x: -side.x, y: -side.y };
        label(ctx, "列空间", at.x + side.x * 12, at.y + side.y * 12, palette, side.x < -0.3 ? "right" : "center");
      }
      ctx.save();
      ctx.fillStyle = palette.text;
      ctx.font = `600 12px ${FONT}`;
      ctx.fillText("b", target.x + 8, target.y - 7);
      ctx.restore();

      if (lensOn) {
        const o = view.origin;
        [g.a1, g.a2, g.b, add(g.a1, g.a2)].forEach((p) => seg(o, map(p)));
        [map(g.a1), map(g.a2), target].forEach((p) => seg({ x: p.x + 4, y: p.y - 7 }, { x: p.x + 24, y: p.y - 7 }, 4));
        seg({ x: 15, y: view.height - 16 }, { x: 15 + ctx.measureText("实线箭头为 b；虚线显示沿 a₂ 方向滑动").width * 1.15, y: view.height - 16 });
        drawLens(ctx, view, palette, g, states, samples);
      }
    }

    function render() {
      const ex = exact(state);
      const { t } = ex;
      const hundredths = (value) => ratio(value, 100).text;
      root.querySelector("[data-d]").textContent = hundredths(ex.D);
      root.querySelector("[data-d1]").textContent = hundredths(ex.D1);
      root.querySelector("[data-d2]").textContent = hundredths(ex.D2);
      root.querySelector("[data-a-matrix]").innerHTML = matrixHtml([[t.a11, t.a12], [t.a21, t.a22]]);
      root.querySelector("[data-a1-matrix]").innerHTML = matrixHtml([[t.b1, t.a12], [t.b2, t.a22]]);
      root.querySelector("[data-a2-matrix]").innerHTML = matrixHtml([[t.a11, t.b1], [t.a21, t.b2]]);

      const solution = root.querySelector("[data-sol]");
      const residual = root.querySelector("[data-residual]");
      const proof = root.querySelector("[data-slide-proof]");
      if (ex.D !== 0) {
        const x1 = ratio(ex.D1, ex.D).text;
        const x2 = ratio(ex.D2, ex.D).text;
        const old = ghost ? exact(ghost) : null;
        const before = old && old.D !== 0 ? `（改动前：x₁=${ratio(old.D1, old.D).text}，x₂=${ratio(old.D2, old.D).text}）` : "";
        if (ex.near) {
          // the size of the jump answers the prediction: x stays hidden until a prediction is picked
          solution.innerHTML = !picked()
            ? "<strong>两列接近共线，D 很小但不为 0</strong>　x₁=?，x₂=?。"
            : !revealed()
              ? `<strong>两列接近共线，D 很小但不为 0</strong>　x₁=${x1}，x₂=${x2}${before}。`
              : `<strong>唯一但敏感</strong>　x₁=${x1}，x₂=${x2}${before}。两列接近共线，D 很小，b 的微小变化会被 Dᵢ/D 放大。`;
          solution.className = "ch2-note is-zero";
        } else {
          solution.innerHTML = `<strong>唯一解</strong>　x₁=${x1}，x₂=${x2}${before}。分子有向面积分别是原有向面积的 x₁、x₂ 倍。`;
          solution.className = "ch2-note is-positive";
        }
        residual.innerHTML = `重构：${tex(`x_1a_1+x_2a_2=\\left(${ratio(t.b1, 10).tex},\\,${ratio(t.b2, 10).tex}\\right)^T`)}，正好回到 b。`;
        residual.className = "ch2-note is-positive";
        proof.innerHTML = `${tex("D_1=\\det(b,a_2)=\\det(x_1a_1,a_2)=x_1D")}：把 b 沿 a₂ 方向滑到 x₁a₁，底边改变但有向面积不变。`;
      } else {
        const infinite = ex.kind === "infinite";
        solution.innerHTML = infinite
          ? "<strong>D=0 · 无穷多解</strong>　b 仍落在塌缩后的列空间中；克拉默公式没有非零分母，改用消元描述自由变量。"
          : "<strong>D=0 · 无解</strong>　b 不在列空间中；塌缩后的列向量无法合成 b。";
        solution.className = infinite ? "ch2-note is-zero" : "ch2-note is-negative";
        residual.textContent = infinite ? "列组合能够到达 b，但表示不唯一。" : "任何列向量组合都无法到达 b。";
        residual.className = infinite ? "ch2-note is-zero" : "ch2-note is-negative";
        proof.textContent = infinite
          ? "两列压到同一条列空间直线上，b 也在线上：可以到达，但表示不唯一。"
          : "两列压到同一条列空间直线上，b 却离开直线：任何列组合都无法到达。";
      }

      KEYS.forEach((key) => {
        root.querySelector(`[data-k="${key}"]`).value = String(state[key]);
        root.querySelector(`[data-v="${key}"]`).textContent = ratio(t[key], 10).text;
      });
      nudge.disabled = !picked() || animating || t.b2 - 1 < -60;
      if (!picked()) nudge.title = "先在上方作出预测";
      else nudge.removeAttribute("title");
      drawScene();
      M().pulseClass(root.querySelector("[data-d-card]"));
    }

    // a change of b counts as the action once a prediction exists and the columns are almost parallel
    function bChanged() {
      if (gate?.picked && !gate.revealed && exact(state).near) gate.acted();
    }

    // a new preset may interrupt a running animation: the newest run wins
    let run = 0;
    async function goTo(target) {
      const id = ++run;
      M().cancelAnim(canvas);
      const from = { ...shown };
      ghost = null;
      frame = null;
      dragging = false;
      Object.assign(state, target);
      animating = true;
      render(); // readouts show the final values; the canvas follows
      try {
        await M().animateTo(canvas, 0, 1, 620, (k) => {
          shown = Object.fromEntries(KEYS.map((key) => [key, M().lerp(from[key], target[key], k)]));
          drawScene();
        });
      } finally {
        if (id === run) {
          animating = false;
          shown = { ...state };
          render();
        }
      }
    }

    async function nudgeB() {
      if (animating) return;
      const id = ++run;
      const step = exact(state).t.b2 - 1;
      if (step < -60) return;
      const from = { ...state };
      const to = { ...state, b2: step / 10 };
      ghost = from;
      frame = { states: [from, to] };
      dragging = false;
      Object.assign(state, to);
      animating = true;
      render();
      try {
        await M().animateTo(canvas, 0, 1, 520, (k) => {
          shown = { ...from, b2: M().lerp(from.b2, to.b2, k) };
          drawScene();
        });
      } finally {
        if (id === run) {
          animating = false;
          frame = null;
          shown = { ...state };
          render();
          bChanged();
        }
      }
    }

    root.querySelectorAll("[data-k]").forEach((input) => {
      const isB = input.dataset.k === "b1" || input.dataset.k === "b2";
      input.addEventListener("input", () => {
        if (animating) return;
        // the state before this drag stays as a ghost, also when a₁ or a₂ is moved
        if (!dragging) ghost = { ...state };
        dragging = true;
        state[input.dataset.k] = tenths(input.value) / 10;
        shown = { ...state };
        render();
      }, { signal });
      input.addEventListener("change", () => {
        dragging = false;
        if (isB) bChanged();
      }, { signal });
    });
    nudge.addEventListener("click", nudgeB, { signal });
    root.querySelector("[data-cramer-ex]").addEventListener("click", () => goTo(PRESETS.ex), { signal });
    root.querySelector("[data-cramer-near]").addEventListener("click", () => goTo(PRESETS.near), { signal });
    root.querySelector("[data-cramer-sing]").addEventListener("click", () => goTo(PRESETS.sing), { signal });
    root.querySelector("[data-cramer-none]").addEventListener("click", () => goTo(PRESETS.none), { signal });
    window.addEventListener("resize", () => document.body.contains(canvas) && drawScene(), { signal, passive: true });

    render();
    return () => {
      controller.abort();
      M().cancelAnim(canvas);
    };
  }

  defineChapter2Renderer("cramer-rule", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "克拉默法则来自列线性",
        "把 b 放进第 i 列后，沿这一列的线性展开会自动消去所有含重复列的项，只留下 xᵢdet(A)。二维面积比给出同一结论的几何版本。",
        module("01", "替换列推导", "先写 b 的列组合，再利用重复列为零。", proofSteps([
          `${tex("b=x_1a_1+\\cdots+x_na_n")}。`,
          `在 ${tex("A_i")} 中把第 i 列替换为 b，并对该列使用分别线性。`,
          "当 b 的展开项使用 aⱼ（j≠i）时，矩阵中出现两列 aⱼ，行列式为 0。",
          `只剩 ${tex("\\det(A_i)=x_i\\det(A)")}；当 det(A)≠0 时可除得公式。`,
        ]) + `
          <article class="ch2-def ch2-formula-block"><span class="kicker">公式</span><strong>${display("x_i=\\frac{\\det(A_i)}{\\det(A)}")}</strong><p>分母非零是公式成立与唯一解存在的共同条件。</p></article>
        `) + module("02", "D=0 与接近 D=0 是两种边界", "一个决定解的类型，另一个提醒坐标对扰动敏感。", `
          <div class="ch2-card-grid">
            <article class="ch2-card"><span class="kicker">D=0 且相容</span><h4>无穷多解</h4><p>b 落在塌缩后的列空间中，表示不唯一。</p></article>
            <article class="ch2-card"><span class="kicker">D=0 且不相容</span><h4>无解</h4><p>b 离开列空间，任何列组合都无法到达它。</p></article>
            <article class="ch2-card"><span class="kicker">D 很小但非零</span><h4>唯一但敏感</h4><p>两列接近共线，Dᵢ/D 会放大输入中的微小变化。</p></article>
          </div>
        `) + misconception([
          "替换的是第 i 列，因为 Ax 是列向量的线性组合。",
          "D=0 只说明克拉默公式不可用；无解与无穷多解需要继续判定。",
          "D 很小不等于 D=0；理论上仍可能有唯一解，但数值会变得敏感。",
        ]),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>Cramer 法则 · 列空间与面积比</h3><p>系数列、b、D、D₁、D₂ 与坐标重构同步变化。作出预测后，两列接近平行时，角上的放大框把细长的 D 放平、加厚；D=0 时改用列空间判断相容性。</p></div>
          <div data-cramer-gate></div>
          <div class="ch2-cramer-layout">
            <div class="ch2-cramer-main">
              <div class="ch2-stage"><canvas data-cramer-canvas aria-label="克拉默法则列向量与常数向量画布"></canvas></div>
              <div class="ch2-side">
              <div class="ch2-presets ch2-cramer-act"><button type="button" class="is-primary" data-cramer-nudge>b₂ 减小 1/10</button></div>
              <div class="ch2-meter">
                <div class="ch2-meter-card" data-d-card><strong>D</strong><span data-d></span></div>
                <div class="ch2-meter-card"><strong>D₁</strong><span data-d1></span></div>
                <div class="ch2-meter-card"><strong>D₂</strong><span data-d2></span></div>
              </div>
              <div class="ch2-note"><strong>A</strong> <span data-a-matrix></span><br /><strong>A₁</strong> <span data-a1-matrix></span><br /><strong>A₂</strong> <span data-a2-matrix></span></div>
              <div data-sol class="ch2-note" aria-live="polite"></div>
              </div>
            </div>
            <div class="ch2-cramer-explanation">
              <div class="ch2-cramer-proof" data-slide-proof></div>
              <div data-residual class="ch2-note" aria-live="polite"></div>
            </div>
            <div class="ch2-cramer-controls">
              <details class="ch2-tuning"><summary>调整 a₁、a₂ 与 b</summary><div class="ch2-sliders">
                ${["a11", "a12", "a21", "a22", "b1", "b2"].map((key) => `<label><span>${key}</span><input data-k="${key}" type="range" min="-6" max="6" step="0.1" aria-label="${key}" /><span data-v="${key}"></span></label>`).join("")}
              </div></details>
              <div class="ch2-presets">
                <button type="button" data-cramer-ex>唯一解示例</button>
                <button type="button" data-cramer-near>接近奇异</button>
                <button type="button" data-cramer-sing>D=0 · 无穷多解</button>
                <button type="button" data-cramer-none>D=0 · 无解</button>
              </div>
            </div>
          </div>
        </div>`;
      return mountCramer(root);
    },
  });
})();
