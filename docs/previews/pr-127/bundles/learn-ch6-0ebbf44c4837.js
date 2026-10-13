
;/* visuals/ch6/kit.js */
/*
 * Chapter 6 shared kit: lab shell, prediction gate, theorem blocks, exact
 * polynomial helpers and a small SVG function plotter. Exact arithmetic comes
 * from Ch3Math (loaded on every page); 3D drawing from LAScene3D.
 */
(() => {
  const M = () => window.Ch3Math;
  const S = () => window.LAScene3D;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);
  const texD = (s) => (window.texDisplay ? window.texDisplay(s) : s);
  const F = (x) => M().parseF(x);
  const num = (x) => M().toNumber(x);
  const fmt = (x) => M().latexF(x);

  function el(tag, cls, html) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function chips(host, items, onPick, activeKey) {
    host.innerHTML = items
      .map(([key, label]) => `<button type="button" class="ch6l-chip${key === activeKey ? " is-active" : ""}" data-key="${key}" aria-pressed="${key === activeKey}">${label}</button>`)
      .join("");
    host.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => {
        host.querySelectorAll("button").forEach((x) => {
          x.classList.toggle("is-active", x === b);
          x.setAttribute("aria-pressed", String(x === b));
        });
        onPick(b.dataset.key);
      }),
    );
  }

  /*
   * Predict -> act -> reveal. Picking an option only records the prediction;
   * the verdict and onReveal wait until the lab reports a real action
   * (gate.acted(): a drag, a slider, a preset or a button) after the pick.
   */
  function predictGate(host, spec, onReveal) {
    spec = { ...spec, options: window.LAStableShuffle ? window.LAStableShuffle(spec.options, spec.question) : spec.options };
    const box = el("div", "ch6l-predict");
    box.innerHTML = `<div class="ch6l-predict-q"><span>先猜一猜</span><p>${spec.question}</p></div>
      <div class="ch6l-predict-options">${spec.options.map((o, i) => `<button type="button" data-i="${i}" data-ok="${o.correct ? "true" : "false"}" data-why="${String(o.why || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">${o.text}</button>`).join("")}</div>
      <p class="ch6l-predict-feedback" hidden></p>`;
    host.append(box);
    const feedback = box.querySelector(".ch6l-predict-feedback");
    const buttons = [...box.querySelectorAll("[data-i]")];
    const state = { choice: null, acted: false, revealed: false };

    function grade() {
      const o = spec.options[state.choice];
      buttons.forEach((x, i) => {
        x.classList.remove("is-picked", "is-right", "is-wrong");
        if (i === state.choice) x.classList.add(o.correct ? "is-right" : "is-wrong");
      });
      feedback.hidden = false;
      feedback.innerHTML = o.correct ? `✓ ${spec.right}` : `再看看图：${o.why || "动手操作后看看发生了什么。"}`;
    }

    function reveal() {
      if (state.revealed || state.choice == null || !state.acted) return;
      state.revealed = true;
      box.classList.add("is-done");
      grade();
      onReveal?.();
    }

    buttons.forEach((b, i) =>
      b.addEventListener("click", () => {
        state.choice = i;
        if (state.revealed) return grade();
        buttons.forEach((x) => x.classList.toggle("is-picked", x === b));
        feedback.hidden = false;
        feedback.textContent = spec.actHint || "记下了你的猜测。现在动手操作一次，结论随后出现。";
      }),
    );

    return {
      element: box,
      acted() {
        if (state.choice == null) return;
        state.acted = true;
        reveal();
      },
      get predicted() {
        return state.choice != null;
      },
      get revealed() {
        return state.revealed;
      },
    };
  }

  function labShell(root, { title, task }) {
    root.innerHTML = `<h2>交互实验</h2>`;
    const lab = el("section", "ch6l-lab");
    lab.innerHTML = `<header class="ch6l-head"><h3>${title}</h3><p>${task}</p></header>`;
    root.append(lab);
    return lab;
  }

  function resultBox(html) {
    const box = el("div", "ch6l-result", `<strong>结论</strong>${html}`);
    box.hidden = true;
    return box;
  }

  /* Labs sit above the theorem block: picture first. */
  function placeAboveFormal(root, section, page) {
    const formal = page?.querySelector(`#${CSS.escape(section.id)}-formal`);
    if (formal && root && formal.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING) formal.before(root);
  }

  /* ---------- exact polynomial helpers (coefficients low → high) ---------- */

  function polyTex(coeffs, variable = "x") {
    const terms = [];
    coeffs.forEach((c, k) => {
      if (M().isZero(c)) return;
      const mag = M().absF(c);
      const mono = k === 0 ? "" : k === 1 ? variable : `${variable}^{${k}}`;
      let body;
      if (k === 0) body = fmt(mag);
      else body = `${M().eq(mag, F(1)) ? "" : fmt(mag)}${mono}`;
      const neg = c.n < 0;
      if (!terms.length) terms.push(neg ? `-${body}` : body);
      else terms.push(neg ? `-${body}` : `+${body}`);
    });
    return terms.join("") || "0";
  }

  function polyEval(coeffs, x) {
    return coeffs.reduceRight((acc, c) => acc * x + num(c), 0);
  }

  function polyEvalF(coeffs, x) {
    const X = F(x);
    return coeffs.reduceRight((acc, c) => M().add(M().mul(acc, X), c), F(0));
  }

  const vecTex = (v) => `(${v.map(fmt).join(",")})`;
  const colTex = (v) => `\\begin{pmatrix}${v.map(fmt).join("\\\\")}\\end{pmatrix}`;
  const matTex = (rows) => `\\begin{pmatrix}${rows.map((r) => r.map(fmt).join("&")).join("\\\\")}\\end{pmatrix}`;

  /* Drawable span of 3-vectors (exact rank decides line / plane). */
  function spanObjects(vectors, color, extra = {}) {
    const vs = vectors.map((v) => v.map(num)).filter((v) => S().vec.len(v) > 1e-12);
    const r = vectors.length ? M().rankOf([0, 1, 2].map((i) => vectors.map((v) => v[i]))) : 0;
    if (r === 1) return [{ type: "line", dir: vs[0], color, width: 2.2, alpha: 0.75, ...extra }];
    if (r === 2) {
      let n = [0, 0, 0];
      for (let i = 0; i < vs.length && S().vec.len(n) < 1e-12; i += 1)
        for (let j = i + 1; j < vs.length && S().vec.len(n) < 1e-12; j += 1) n = S().vec.cross(vs[i], vs[j]);
      return [{ type: "plane", n, d: 0, color, alpha: 0.13, ...extra }];
    }
    return [];
  }

  /* Columns → matrix rows for Ch3Math. */
  const colsToRows = (cols) => [0, 1, 2].map((i) => cols.map((c) => c[i]));

  /* Independent subset of the given vectors (exact). */
  function independent(vectors) {
    if (!vectors.length) return [];
    return M().independentColumnIndices(colsToRows(vectors)).map((i) => vectors[i]);
  }

  /*
   * Screen-space label placement for a LAScene3D scene (call it at the end of the
   * objects function, so it follows the camera; create the scene with clampLabels and
   * without spreadLabels). Every labelled arrow, line, plane, segment and point gets
   * its name at the candidate spot farthest from the other strokes on screen (axes,
   * arrow shafts, lines, plane edges, dashed segments), from points, drag handles,
   * axis names and labels already placed; ties go to the usual spot (just past an
   * arrow's tip, near a line's end). The label becomes a separate "label" object.
   */
  const LABEL_FONTS = { arrow: "700 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif", other: "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif", axis: "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" };
  let measureCtx = null;
  function textWidth(text, font) {
    measureCtx ||= document.createElement("canvas").getContext("2d");
    measureCtx.font = font;
    return measureCtx.measureText(text).width + 4;
  }
  function segRectDist([a, b], r) {
    const inside = (p) => p.x >= r.x0 && p.x <= r.x1 && p.y >= r.y0 && p.y <= r.y1;
    if (inside(a) || inside(b)) return 0;
    const ptSeg = (p, s, t) => {
      const vx = t.x - s.x;
      const vy = t.y - s.y;
      const k = Math.max(0, Math.min(1, ((p.x - s.x) * vx + (p.y - s.y) * vy) / (vx * vx + vy * vy || 1)));
      return Math.hypot(s.x + vx * k - p.x, s.y + vy * k - p.y);
    };
    const corners = [{ x: r.x0, y: r.y0 }, { x: r.x1, y: r.y0 }, { x: r.x1, y: r.y1 }, { x: r.x0, y: r.y1 }];
    const edges = corners.map((c, i) => [c, corners[(i + 1) % 4]]);
    const cross = (p, q, s, t) => {
      const d = (q.x - p.x) * (t.y - s.y) - (q.y - p.y) * (t.x - s.x);
      if (Math.abs(d) < 1e-9) return false;
      const u = ((s.x - p.x) * (t.y - s.y) - (s.y - p.y) * (t.x - s.x)) / d;
      const v = ((s.x - p.x) * (q.y - p.y) - (s.y - p.y) * (q.x - p.x)) / d;
      return u >= 0 && u <= 1 && v >= 0 && v <= 1;
    };
    if (edges.some(([s, t]) => cross(a, b, s, t))) return 0;
    return Math.min(...corners.map((c) => ptSeg(c, a, b)), ...[a, b].map((p) => Math.hypot(Math.max(r.x0 - p.x, 0, p.x - r.x1), Math.max(r.y0 - p.y, 0, p.y - r.y1))));
  }
  function rectRectDist(a, b) {
    return Math.hypot(Math.max(0, a.x0 - b.x1, b.x0 - a.x1), Math.max(0, a.y0 - b.y1, b.y0 - a.y1));
  }

  function placeLabels(scene, objs, { handles = [], axisNames = ["x₁", "x₂", "x₃"], frame = true } = {}) {
    const V = S().vec;
    const rect = scene.canvas.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    if (!W || !H) return objs;
    const L = scene.range;
    const P = (p) => scene.project(p);
    const { yaw, pitch } = scene.camera;
    const right = V.norm([-Math.sin(yaw), Math.cos(yaw), 0]);
    const d = [Math.cos(pitch) * Math.cos(yaw), Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch)];
    const up = V.cross(d, right);
    const s = P(right).x - P([0, 0, 0]).x || 1;
    // the 3D point whose label (drawn at +6,−6 from it, text left-aligned) has this centre
    const anchorFor = (cx, cy, w) => {
      const qx = cx - w / 2 - 6 + 2;
      const qy = cy + 6;
      const o = P([0, 0, 0]);
      return V.add(V.mul(right, (qx - o.x) / s), V.mul(up, -(qy - o.y) / s));
    };

    const segs = [];
    const dots = [];
    const boxes = [];
    const hideAxis = [];
    const planeEdges = (o) => {
      const poly = S().clipPlane(o.n, o.d || 0, L).map(P);
      return poly.map((p, i) => [p, poly[(i + 1) % poly.length]]);
    };
    objs.forEach((o) => {
      if (!o || o.hidden) return;
      if (o.type === "arrow") {
        const a = P(o.from || [0, 0, 0]);
        const b = P(o.to);
        if (Math.hypot(b.x - a.x, b.y - a.y) > 1) segs.push([a, b]);
      } else if (o.type === "line") {
        const sg = S().clipLine(o.p || [0, 0, 0], o.dir, L);
        if (sg) segs.push(sg.map(P));
      } else if (o.type === "segment") segs.push([P(o.a), P(o.b)]);
      else if (o.type === "plane") segs.push(...planeEdges(o).map((e) => Object.assign(e, { soft: true })));
      else if (o.type === "polygon" && o.strokeAlpha !== 0) {
        const pts = o.pts.map(P);
        pts.forEach((p, i) => segs.push([p, pts[(i + 1) % pts.length]]));
      } else if (o.type === "point") dots.push({ ...P(o.p), r: (o.r || 5) + 2 });
    });
    handles.forEach((p) => dots.push({ ...P(p), r: 12 }));
    /*
     * Axis names: one that sits on an object (or an axis seen end-on, whose name lands
     * on the origin) is left out through an invisible keepClear square around its anchor.
     */
    if (frame) {
      const objSegs = segs.filter((sg) => !sg.soft);
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach((e, i) => {
        const a = P(V.mul(e, -L));
        const b = P(V.mul(e, L));
        const at = V.mul(e, L * 1.08);
        const q = P(at);
        const w = textWidth(axisNames[i], LABEL_FONTS.axis);
        const box = { x0: q.x + 6, x1: q.x + 6 + w, y0: q.y - 14, y1: q.y + 2 };
        const blocked =
          Math.hypot(b.x - a.x, b.y - a.y) < 24 ||
          objSegs.some((sg) => segRectDist(sg, box) < 1) ||
          dots.some((c) => Math.hypot(Math.max(box.x0 - c.x, 0, c.x - box.x1), Math.max(box.y0 - c.y, 0, c.y - box.y1)) < c.r);
        segs.push(Object.assign([a, b], { soft: true }));
        if (!blocked) return boxes.push(box);
        const k = 6 / s;
        const corner = (x, y) => V.add(at, V.add(V.mul(right, x * k), V.mul(up, y * k)));
        hideAxis.push({ type: "polygon", pts: [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)], color: "axis", alpha: 0, strokeAlpha: 0, keepClear: true });
      });
    }

    const clearance = (r) => {
      if (r.x0 < 3 || r.x1 > W - 3 || r.y0 < 2 || r.y1 > H - 2) return -1;
      let m = 40;
      // a thin plane edge or axis may be crossed when nothing better is free: it counts as 3px clear
      segs.forEach((sg) => (m = Math.min(m, segRectDist(sg, r) + (sg.soft ? 3 : 0))));
      dots.forEach((c) => (m = Math.min(m, Math.max(0, Math.hypot(Math.max(r.x0 - c.x, 0, c.x - r.x1), Math.max(r.y0 - c.y, 0, c.y - r.y1)) - c.r))));
      boxes.forEach((b) => (m = Math.min(m, rectRectDist(r, b) - 2)));
      return m;
    };

    const out = [];
    const extra = [];
    objs.forEach((o) => {
      if (!o || o.hidden || !o.label || !["arrow", "line", "plane", "segment", "point"].includes(o.type)) return out.push(o);
      const font = o.type === "arrow" ? LABEL_FONTS.arrow : o.font || LABEL_FONTS.other;
      const w = textWidth(o.label, font);
      const h = 16;
      const cands = [];
      const around = (c, rx, ry, prefer) => {
        for (let k = 0; k < 16; k += 1) {
          const t = prefer + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 8);
          cands.push([c.x + Math.cos(t) * (w / 2 + rx), c.y + Math.sin(t) * (h / 2 + ry), c]);
        }
      };
      if (o.type === "arrow" || o.type === "point") {
        const tip = P(o.type === "arrow" ? o.to : o.p);
        const tail = o.type === "arrow" ? P(o.from || [0, 0, 0]) : { x: tip.x - 1, y: tip.y + 1 };
        const len = Math.hypot(tip.x - tail.x, tip.y - tail.y);
        // an arrow seen end-on shrinks to a dot at its tail: its name would sit on the others there
        if (o.type === "arrow" && len < 5) return out.push({ ...o, label: undefined });
        const prefer = Math.atan2(tip.y - tail.y, tip.x - tail.x);
        [6, 12, 20, 30].forEach((gap) => around(tip, gap, gap, prefer));
        if (o.type === "arrow") {
          // beside the shaft, a little before the tip
          const nx = -(tip.y - tail.y) / len;
          const ny = (tip.x - tail.x) / len;
          [0.75, 0.55, 0.4].forEach((f) => [1, -1].forEach((sg) => {
            const m = { x: tail.x + (tip.x - tail.x) * f, y: tail.y + (tip.y - tail.y) * f };
            [6, 12].forEach((gap) => {
              // the box's half-extent across the shaft, plus the gap
              const e = Math.abs(nx) * w / 2 + Math.abs(ny) * h / 2 + gap;
              cands.push([m.x + sg * nx * e, m.y + sg * ny * e, m]);
            });
          }));
        }
      } else if (o.type === "line" || o.type === "segment") {
        const sg = o.type === "line" ? S().clipLine(o.p || [0, 0, 0], o.dir, L)?.map(P) : [P(o.a), P(o.b)];
        if (!sg) return out.push(o);
        const [a, b] = o.type === "line" ? sg.slice().reverse() : sg;
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const nx = -(b.y - a.y) / len;
        const ny = (b.x - a.x) / len;
        const ts = o.type === "line" ? [0.03, 0.1, 0.18, 0.97, 0.9, 0.82] : [0.5, 0.35, 0.65];
        ts.forEach((t) => [1, -1].forEach((sgn) => [6, 14].forEach((gap) => {
          const m = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
          const e = Math.abs(nx) * w / 2 + Math.abs(ny) * h / 2 + gap;
          cands.push([m.x + sgn * nx * e, m.y + sgn * ny * e, m]);
        })));
      } else if (o.type === "plane") {
        const poly = S().clipPlane(o.n, o.d || 0, L).map(P);
        if (!poly.length) return out.push(o);
        const c = poly.reduce((acc, p) => ({ x: acc.x + p.x / poly.length, y: acc.y + p.y / poly.length }), { x: 0, y: 0 });
        poly.forEach((p) => [0.12, 0.22, 0.35].forEach((f) => cands.push([p.x + (c.x - p.x) * f, p.y + (c.y - p.y) * f])));
      }
      let best = null;
      let bestScore = -Infinity;
      cands.forEach(([cx, cy, ref], i) => {
        const r = { x0: cx - w / 2, x1: cx + w / 2, y0: cy - h / 2, y1: cy + h / 2 };
        const c = clearance(r);
        if (c < 0) return;
        /*
         * A label that touches something (under 3px) loses to any clear spot; above that,
         * 1px more clearance (up to 8px) is worth 7px more distance from its own object,
         * so a name stays next to what it names. Ties go to the earlier (usual) spot.
         */
        const gap = ref ? Math.hypot(Math.max(r.x0 - ref.x, 0, ref.x - r.x1), Math.max(r.y0 - ref.y, 0, ref.y - r.y1)) : 0;
        const score = (c < 3 ? -1000 : 0) + Math.min(c, 8) * 10 - gap * 1.4 - i * 0.01;
        if (score > bestScore) {
          bestScore = score;
          best = r;
        }
      });
      if (!best) return out.push(o);
      boxes.push(best);
      out.push({ ...o, label: undefined });
      extra.push({ type: "label", p: anchorFor((best.x0 + best.x1) / 2, (best.y0 + best.y1) / 2, w), text: o.label, color: o.color, font });
    });
    return [...hideAxis, ...out, ...extra];
  }

  /* ---------- SVG function plot ---------- */

  let plotId = 0;
  // Colour roles (v1, v2, drag, image, subspace, axis) map to the canvas tokens.
  const ROLE_VARS = { v1: "cv-v1", v2: "cv-v2", drag: "cv-drag", image: "cv-image", subspace: "cv-subspace", axis: "cv-axis" };
  const cssColor = (c) => (ROLE_VARS[c] ? `var(--${ROLE_VARS[c]})` : c && /^[a-z-]+$/.test(c) ? `var(--${c})` : c || "var(--text)");

  function plot(spec) {
    const W = spec.width || 520;
    const H = spec.height || 300;
    const pad = { l: 30, r: 14, t: 14, b: 26 };
    const [x0, x1] = spec.x;
    const [y0, y1] = spec.y;
    const sx = (x) => pad.l + ((x - x0) / (x1 - x0)) * (W - pad.l - pad.r);
    const sy = (y) => H - pad.b - ((y - y0) / (y1 - y0)) * (H - pad.t - pad.b);
    const id = `ch6clip${(plotId += 1)}`;
    const parts = [];
    parts.push(`<defs><clipPath id="${id}"><rect x="${pad.l}" y="${pad.t}" width="${W - pad.l - pad.r}" height="${H - pad.t - pad.b}"/></clipPath></defs>`);
    // grid + ticks
    const grid = [];
    for (let x = Math.ceil(x0); x <= x1; x += 1) {
      grid.push(`<line x1="${sx(x)}" y1="${pad.t}" x2="${sx(x)}" y2="${H - pad.b}" class="ch6p-grid"/>`);
      if (x !== 0) grid.push(`<text x="${sx(x)}" y="${H - 8}" class="ch6p-tick" text-anchor="middle">${x}</text>`);
    }
    const ystep = spec.ystep || (y1 - y0 > 12 ? 2 : 1);
    for (let y = Math.ceil(y0 / ystep) * ystep; y <= y1; y += ystep) {
      grid.push(`<line x1="${pad.l}" y1="${sy(y)}" x2="${W - pad.r}" y2="${sy(y)}" class="ch6p-grid"/>`);
      if (y !== 0) grid.push(`<text x="${pad.l - 6}" y="${sy(y) + 4}" class="ch6p-tick" text-anchor="end">${y}</text>`);
    }
    parts.push(grid.join(""));
    if (y0 <= 0 && y1 >= 0) parts.push(`<line x1="${pad.l}" y1="${sy(0)}" x2="${W - pad.r}" y2="${sy(0)}" class="ch6p-axis"/>`);
    if (x0 <= 0 && x1 >= 0) parts.push(`<line x1="${sx(0)}" y1="${pad.t}" x2="${sx(0)}" y2="${H - pad.b}" class="ch6p-axis"/>`);
    const body = [];
    (spec.vlines || []).forEach((v) => {
      body.push(`<line x1="${sx(v.x)}" y1="${pad.t}" x2="${sx(v.x)}" y2="${H - pad.b}" style="stroke:${cssColor(v.color)};stroke-width:${v.width || 1.2};opacity:${v.opacity ?? 0.55}"/>`);
    });
    (spec.curves || []).forEach((c) => {
      const n = 180;
      const [a, b] = c.domain || [x0, x1];
      let d = "";
      for (let i = 0; i <= n; i += 1) {
        const x = a + ((b - a) * i) / n;
        let y = c.f(x);
        if (!Number.isFinite(y)) continue;
        y = Math.max(y0 - (y1 - y0), Math.min(y1 + (y1 - y0), y));
        d += `${i ? "L" : "M"}${sx(x).toFixed(2)} ${sy(y).toFixed(2)}`;
      }
      body.push(`<path d="${d}" fill="none" style="stroke:${cssColor(c.color)};stroke-width:${c.width || 2.4};opacity:${c.opacity ?? 1}" stroke-linecap="round" stroke-linejoin="round"/>`);
    });
    (spec.segments || []).forEach((s) => {
      body.push(`<line x1="${sx(s.a[0])}" y1="${sy(s.a[1])}" x2="${sx(s.b[0])}" y2="${sy(s.b[1])}" style="stroke:${cssColor(s.color)};stroke-width:${s.width || 3};opacity:${s.opacity ?? 1}" stroke-linecap="round"/>`);
    });
    parts.push(`<g clip-path="url(#${id})">${body.join("")}</g>`);
    (spec.points || []).forEach((p) => {
      if (p.y < y0 || p.y > y1) return;
      parts.push(
        p.hollow
          ? `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="${p.r || 5}" style="fill:var(--surface-solid);stroke:${cssColor(p.color)};stroke-width:2.2"/>`
          : `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="${p.r || 5}" style="fill:${cssColor(p.color)}"/>`,
      );
      if (p.label) parts.push(`<text x="${sx(p.x) + (p.dx ?? 8)}" y="${sy(p.y) + (p.dy ?? -8)}" class="ch6p-label" style="fill:${cssColor(p.color)}" text-anchor="${p.anchor || "start"}">${p.label}</text>`);
    });
    (spec.labels || []).forEach((l) => {
      parts.push(`<text x="${sx(l.x)}" y="${sy(l.y)}" class="ch6p-label" style="fill:${cssColor(l.color)}" text-anchor="${l.anchor || "start"}">${l.text}</text>`);
    });
    return `<svg class="ch6p-plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="${spec.label || "函数图像"}">${parts.join("")}</svg>`;
  }

  function legend(items) {
    return `<div class="ch6l-legend">${items.map(([color, text]) => `<span><i style="background:${cssColor(color)}"></i>${text}</span>`).join("")}</div>`;
  }

  /* ---------- theorem blocks from content data ---------- */

  const figures = new Map();
  function defineFigure(key, render) {
    figures.set(key, render);
  }

  function renderFormal(root, section) {
    const f = section.lesson;
    if (!root || !f) return;
    const figure = f.figure && figures.get(f.figure);
    const fig = figure ? `<figure class="ch6l-figure">${figure()}</figure>` : "";
    const blocks = f.blocks
      .map((b) => `<article class="ch6l-theorem"><h3>${b.title}</h3>${b.tex ? `<div class="ch6l-theorem-math">${texD(b.tex)}</div>` : ""}${b.text ? `<p>${b.text}</p>` : ""}</article>`)
      .join("");
    const pitfalls = f.pitfalls?.length ? `<div class="ch6l-pitfalls"><h3>容易错在哪里</h3><ul>${f.pitfalls.map((p) => `<li>${p}</li>`).join("")}</ul></div>` : "";
    const ordered = f.figureLast ? blocks + fig + pitfalls : fig + blocks + pitfalls;
    root.innerHTML = `<h2>定理与方法</h2><div class="ch6l-formal">${ordered}</div>`;
  }

  window.Ch6Kit = Object.freeze({
    M,
    S,
    tex,
    texD,
    F,
    num,
    fmt,
    el,
    chips,
    predictGate,
    labShell,
    resultBox,
    placeAboveFormal,
    polyTex,
    polyEval,
    polyEvalF,
    vecTex,
    colTex,
    matTex,
    spanObjects,
    colsToRows,
    independent,
    placeLabels,
    plot,
    legend,
    defineFigure,
    renderFormal,
  });
})();


;/* visuals/ch6/figures.js */
/*
 * Chapter 6 static figures (no interaction): mapping diagrams, the space
 * gallery, subspace curve families, and the extra views used by §6 and §7.
 */
(() => {
  const K = () => window.Ch6Kit;
  const tex = (s) => K().tex(s);

  /* ---------- §1 three small mapping diagrams ---------- */

  let markerSeq = 0;
  function miniMap({ left, right, map, caption, verdict }) {
    const W = 230;
    const rowH = 34;
    const rows = Math.max(left.length, right.length);
    const H = rows * rowH + 24;
    const yAt = (i, n) => 12 + (H - 24 - n * rowH) / 2 + i * rowH + rowH / 2;
    const id = `ch6map${(markerSeq += 1)}`;
    const hits = right.map((_, j) => map.filter((t) => t === j).length);
    const parts = [`<defs><marker id="${id}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 Z" style="fill:var(--muted)"/></marker></defs>`];
    parts.push(`<rect x="6" y="4" width="74" height="${H - 8}" rx="12" class="ch6m-set"/><rect x="${W - 80}" y="4" width="74" height="${H - 8}" rx="12" class="ch6m-set"/>`);
    map.forEach((t, i) => {
      const y1 = yAt(i, left.length);
      const y2 = yAt(t, right.length);
      parts.push(`<path d="M 64 ${y1} C 110 ${y1}, 120 ${y2}, ${W - 70} ${y2}" class="ch6m-edge${hits[t] > 1 ? " is-hot" : ""}" marker-end="url(#${id})"/>`);
    });
    left.forEach((label, i) => {
      const y = yAt(i, left.length);
      parts.push(`<rect x="20" y="${y - 12}" width="44" height="24" rx="7" class="ch6m-node"/><text x="42" y="${y + 4.5}" text-anchor="middle" class="ch6m-text">${label}</text>`);
    });
    right.forEach((label, j) => {
      const y = yAt(j, right.length);
      const cls = hits[j] === 0 ? " is-missed" : hits[j] > 1 ? " is-hot" : "";
      parts.push(`<rect x="${W - 66}" y="${y - 12}" width="44" height="24" rx="7" class="ch6m-node${cls}"/><text x="${W - 44}" y="${y + 4.5}" text-anchor="middle" class="ch6m-text">${label}</text>`);
    });
    return `<div class="ch6f-card"><svg viewBox="0 0 ${W} ${H}" class="ch6m-svg" role="img" aria-label="${caption}">${parts.join("")}</svg><h4>${caption}</h4><p>${verdict}</p></div>`;
  }

  K().defineFigure("maps", () => `<div class="ch6f-grid is-three">
      ${miniMap({ left: ["1", "2", "3"], right: ["a", "b", "c", "d"], map: [0, 1, 2], caption: "单射，不满射", verdict: `没有两个元素撞到同一个像；${tex("d")} 没有原像。` })}
      ${miniMap({ left: ["1", "2", "3", "4"], right: ["a", "b", "c"], map: [0, 1, 2, 0], caption: "满射，不单射", verdict: `每个输出都被取到；1 和 4 撞到同一个 ${tex("a")}。` })}
      ${miniMap({ left: ["1", "2", "3"], right: ["a", "b", "c"], map: [1, 2, 0], caption: "双射", verdict: "每个输出恰有一个原像，箭头可以整体反过来。" })}
    </div>
    <figcaption>${tex("X")} 在左、${tex("Y")} 在右。有限集元素个数相等时，单射与满射同时成立或同时不成立。</figcaption>`);

  /* ---------- §2 gallery: pointwise sums and the space R+ ---------- */

  function functionSum() {
    const f = (x) => 0.5 * x + 1;
    const g = (x) => 1.2 - 0.5 * x * x;
    const h = (x) => f(x) + g(x);
    const bars = [-1.2, 0.9].flatMap((x) => [
      { a: [x - 0.05, 0], b: [x - 0.05, f(x)], color: "v1", width: 4 },
      { a: [x + 0.05, f(x)], b: [x + 0.05, h(x)], color: "v2", width: 4 },
    ]);
    return K().plot({
      x: [-2.2, 2.2],
      y: [-2.2, 2.8],
      width: 420,
      height: 260,
      label: "两个函数逐点相加",
      vlines: [{ x: -1.2, color: "faint", opacity: 0.4 }, { x: 0.9, color: "faint", opacity: 0.4 }],
      curves: [
        { f, color: "v1", width: 2 },
        { f: g, color: "v2", width: 2 },
        { f: h, color: "image", width: 3 },
      ],
      segments: bars,
      labels: [
        { x: 1.75, y: f(1.75) + 0.3, text: "f", color: "v1" },
        { x: -2.1, y: g(-2.1) + 0.55, text: "g", color: "v2" },
        { x: 1.45, y: h(1.45) + 0.45, text: "f+g", color: "image" },
      ],
    });
  }

  function positiveReals() {
    const W = 420;
    const H = 170;
    const L = (a) => 40 + ((Math.log2(a) + 2) / 5) * (W - 80); // log scale, 1/4 … 8
    const ticks = [0.25, 0.5, 1, 2, 3, 4, 6, 8];
    const y = 110;
    const tickLabel = { 0.25: "1/4", 0.5: "1/2" };
    const parts = [`<line x1="30" y1="${y}" x2="${W - 20}" y2="${y}" class="ch6p-axis"/>`];
    ticks.forEach((t) => {
      parts.push(`<line x1="${L(t)}" y1="${y - 5}" x2="${L(t)}" y2="${y + 5}" class="ch6p-axis"/><text x="${L(t)}" y="${y + 22}" text-anchor="middle" class="ch6p-tick">${tickLabel[t] || t}</text>`);
    });
    const arrow = (from, to, lift, color, label) => {
      const x1 = L(from);
      const x2 = L(to);
      const mid = (x1 + x2) / 2;
      return `<path d="M ${x1} ${y - 8} Q ${mid} ${y - 8 - lift} ${x2} ${y - 8}" fill="none" style="stroke:var(--${color});stroke-width:2.4"/><circle cx="${x2}" cy="${y - 8}" r="3.6" style="fill:var(--${color})"/><text x="${mid}" y="${y - 12 - lift / 2}" text-anchor="middle" class="ch6p-label" style="fill:var(--${color})">${label}</text>`;
    };
    parts.push(arrow(1, 2, 34, "cv-v1", "2"));
    parts.push(arrow(2, 6, 46, "cv-v2", "⊕3"));
    parts.push(arrow(1, 0.5, 30, "cv-image", "2 的负向量"));
    parts.push(`<circle cx="${L(1)}" cy="${y}" r="6" style="fill:var(--surface-solid);stroke:var(--text);stroke-width:2.4"/><text x="${L(1)}" y="${y + 40}" text-anchor="middle" class="ch6p-label" style="fill:var(--text)">零向量 1</text>`);
    return `<svg class="ch6p-plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="正实数在对数刻度上的加法">${parts.join("")}</svg>`;
  }

  K().defineFigure("gallery", () => `<div class="ch6f-grid">
      <div class="ch6f-card">${functionSum()}<h4>函数也是向量</h4><p>${tex("(f+g)(x)=f(x)+g(x)")}：在每个 ${tex("x")} 处把两段高度接起来。${tex("P[x]_n")}、${tex("C[a,b]")} 都按这种方式相加。</p></div>
      <div class="ch6f-card">${positiveReals()}<h4>${tex("\\mathbb R^+")}：乘法充当加法</h4><p>规定 ${tex("a\\oplus b=ab")}，${tex("k\\circ a=a^k")}。按对数刻度画，${tex("\\oplus")} 变成长度相接：${tex("2\\oplus3=6")}，零向量是 1，2 的负向量是 ${tex("\\tfrac12")}。</p></div>
    </div>`);

  /* ---------- §5 curve families through a fixed point ---------- */

  K().defineFigure("curve-families", () => {
    const zero = K().plot({
      x: [-2, 2.6],
      y: [-3, 3],
      width: 400,
      height: 260,
      label: "满足 p(1)=0 的多项式",
      vlines: [{ x: 1, color: "faint", opacity: 0.45 }],
      curves: [
        { f: (x) => x - 1, color: "v1", width: 2 },
        { f: (x) => 1 - x * x, color: "v2", width: 2 },
        { f: (x) => x - x * x, color: "image", width: 3 },
      ],
      points: [{ x: 1, y: 0, color: "image", r: 5.5, label: "(1,0)", dx: 8, dy: 16 }],
      labels: [
        { x: 2.05, y: 1.45, text: "p", color: "v1" },
        { x: -1.9, y: -2.4, text: "q", color: "v2" },
        { x: 1.72, y: -0.7, text: "p+q", color: "image" },
      ],
    });
    const one = K().plot({
      x: [-2, 2.6],
      y: [-1, 5],
      width: 400,
      height: 260,
      label: "满足 p(1)=1 的多项式",
      vlines: [{ x: 1, color: "faint", opacity: 0.45 }],
      curves: [
        { f: (x) => x, color: "v1", width: 2 },
        { f: (x) => x * x, color: "v2", width: 2 },
        { f: (x) => x + x * x, color: "image", width: 3 },
      ],
      points: [
        { x: 1, y: 1, color: "muted", r: 5, hollow: true, label: "(1,1)", dx: 10, dy: 14 },
        { x: 1, y: 2, color: "image", r: 5.5, label: "(1,2)", dx: -8, dy: -8, anchor: "end" },
      ],
      labels: [
        { x: 2.2, y: 1.7, text: "p", color: "v1" },
        { x: -1.95, y: 3.2, text: "q", color: "v2" },
        { x: 1.55, y: 4.4, text: "p+q", color: "image" },
      ],
    });
    return `<div class="ch6f-grid">
      <div class="ch6f-card">${zero}<h4>${tex("W_0=\\{p\\in P[x]_3:p(1)=0\\}")}</h4><p>曲线都过 ${tex("(1,0)")}。两条相加、乘任意数，仍过这一点：${tex("W_0")} 是子空间。</p></div>
      <div class="ch6f-card">${one}<h4>${tex("W_1=\\{p\\in P[x]_3:p(1)=1\\}")}</h4><p>曲线都过 ${tex("(1,1)")}，相加后却过 ${tex("(1,2)")}，离开了 ${tex("W_1")}；它也不含零多项式。</p></div>
    </div>`;
  });

  /* ---------- §6 static view: U ∩ W in P[x]_4 ---------- */

  K().defineFigure("intersection-curves", () => {
    const svg = K().plot({
      x: [-2.2, 2.2],
      y: [-3, 3],
      width: 520,
      height: 250,
      label: "同时过 (1,0) 与 (-1,0) 的多项式",
      vlines: [{ x: 1, color: "v1", opacity: 0.35 }, { x: -1, color: "v2", opacity: 0.35 }],
      curves: [
        { f: (x) => 0.5 * (x - 1) * (x + 2), color: "v1", width: 2 },
        { f: (x) => 0.5 * (x + 1) * (x - 2), color: "v2", width: 2 },
        { f: (x) => x * x - 1, color: "subspace", width: 3 },
        { f: (x) => x * (x * x - 1), color: "subspace", width: 3, opacity: 0.6 },
      ],
      points: [
        { x: 1, y: 0, color: "text", r: 4.5 },
        { x: -1, y: 0, color: "text", r: 4.5 },
      ],
      labels: [
        { x: 1.6, y: 2.25, text: "U 中", color: "v1" },
        { x: -2.1, y: 2.25, text: "W 中", color: "v2" },
        { x: 1.55, y: -1.1, text: "U∩W 中", color: "subspace" },
      ],
    });
    return `<div class="ch6f-card is-wide">${svg}<p>${tex("P[x]_4")} 中 ${tex("U=\\{p:p(1)=0\\}")}，${tex("W=\\{p:p(-1)=0\\}")}。交里的曲线同时过两个点，恰好是 ${tex("(x^2-1)(a+bx)")}。</p></div>`;
  });

  /* ---------- §7 static view: even ⊕ odd ---------- */

  K().defineFigure("even-odd", () => {
    const svg = K().plot({
      x: [-2.2, 2.2],
      y: [-4, 6],
      width: 520,
      height: 250,
      ystep: 2,
      label: "e^x 分解为偶函数与奇函数",
      curves: [
        { f: Math.exp, color: "text", width: 3 },
        { f: Math.cosh, color: "v1", width: 2.2 },
        { f: Math.sinh, color: "v2", width: 2.2 },
      ],
      labels: [
        { x: 1.25, y: 5.3, text: "eˣ", color: "text" },
        { x: -2.15, y: 4.9, text: "cosh x（偶）", color: "v1" },
        { x: -2.1, y: -3.4, text: "sinh x（奇）", color: "v2" },
      ],
    });
    return `<div class="ch6f-card is-wide">${svg}<p>全体实函数构成的空间，是偶函数子空间与奇函数子空间的直和：${tex("f(x)=\\frac{f(x)+f(-x)}2+\\frac{f(x)-f(-x)}2")}。既偶又奇的函数只有 0，所以分解唯一；${tex("e^x=\\cosh x+\\sinh x")}。</p></div>`;
  });
})();


;/* visuals/ch6/labs.js */
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

  /*
   * A matrix whose j-th column carries the colour role of the j-th vector.
   * KaTeX (trust off) only accepts literal colours, so the columns are marked
   * with sentinel colours and swapped for theme variables after rendering.
   */
  const COL_SENTINEL = ["#0a0c01", "#0a0c02", "#0a0c03"];
  function colourColumnsTex(rows) {
    return `\\begin{pmatrix}${rows.map((r) => r.map((x, j) => `\\textcolor{${COL_SENTINEL[j]}}{${fmt(x)}}`).join("&")).join("\\\\")}\\end{pmatrix}`;
  }
  function colourColumnsHtml(html, roles) {
    return roles.reduce((out, role, j) => out.split(`color:${COL_SENTINEL[j]}`).join(`color:var(--cv-${role})`), String(html));
  }

  /* ================= §3 维数·基与坐标 ================= */

  function coordinatesLab(root) {
    const lab = K().labShell(root, {
      title: "多项式与它的坐标点",
      task: `${tex("P[x]_3")} 中取基 ${tex("1,x,x^2")}，每个多项式 ${tex("a_0+a_1x+a_2x^2")} 对应坐标 ${tex("(a_0,a_1,a_2)")}。左图是曲线，右图是坐标点；拖动右图的圆点，左边的曲线跟着变。`,
    });
    const PRESETS = {
      lay: { label: `${tex("1+2x^2")}，${tex("4+x+5x^2")}，${tex("3+2x")}`, polys: [[1, 0, 2], [4, 1, 5], [3, 2, 0]], range: 5.5, cam: { yaw: -0.75, pitch: 0.36 } },
      // seen from here the chain 2p₂ → +p₃ bends visibly instead of lining up with q
      basis: { label: `${tex("1+x")}，${tex("x+x^2")}，${tex("1+x^2")}`, polys: [[1, 1, 0], [0, 1, 1], [1, 0, 1]], range: 3.5, cam: { yaw: -1.9, pitch: 0.45 } },
    };
    const Q = [1, 2, 3];
    const state = { key: "lay", polys: PRESETS.lay.polys.map((p) => p.slice()), c: [F(0), F(0), F(0)], revealed: false };

    const toolbar = el("div", "ch6l-toolbar");
    lab.append(toolbar);
    const { plotBox, right } = pairViews(lab, "函数图像", `坐标空间（基 ${tex("1,x,x^2")}）`);
    const scene = S().create(right, { range: 5.5, label: "三个多项式的坐标点", hint: "拖动圆点改变多项式 · 拖动空白处旋转", axisNames: ["1", "x", "x²"], yaw: -0.75, pitch: 0.36, spreadLabels: true, labelSafe: true });
    const grid = el("div", "ch6l-grid2");
    const controls = el("div", "ch6l-card");
    const info = el("div", "ch6l-card");
    grid.append(controls, info);
    lab.append(grid);
    const gateHost = el("div");
    const result = K().resultBox("");
    lab.append(gateHost, result);
    let gate = null;
    const acted = () => gate?.acted();

    /* The conclusion explains the polynomials now on screen. */
    function conclusion(ps, det) {
      const lead = `坐标把 ${tex("P[x]_3")} 一对一地搬到 ${tex("P^3")}，并且保持加法和数乘。于是 ${tex("p_1,p_2,p_3")} 线性相关，当且仅当三个坐标点与原点共面。`;
      const cert = M().relationCertificate(ps);
      if (cert.dependent) {
        const pairwise = [[0, 1], [0, 2], [1, 2]].every(([i, j]) => M().rankOf(K().colsToRows([ps[i], ps[j]])) === 2);
        return `<p>${lead}现在 ${tex(M().latexRelation(cert.coeffs, ["p_1", "p_2", "p_3"]))}：三个坐标点与原点共面，${tex("p_1,p_2,p_3")} 线性相关，不是基。${pairwise ? "三条曲线两两不成比例，三个一起仍然相关。" : ""}</p>`;
      }
      const part = M().particularSolution([0, 1, 2].map((k) => [ps[0][k], ps[1][k], ps[2][k], fv(Q)[k]]));
      return `<p>${lead}现在坐标矩阵的行列式为 ${tex(fmt(det))}，不为 0：三个坐标点不与原点共面，${tex("p_1,p_2,p_3")} 是一组基。于是每个 ${tex("q")} 恰有一组坐标，${tex("q=1+2x+3x^2")} 的坐标是 ${tex(vecTex(part.x))}，三段折线只有这一种走法停在 ${tex("q")}。</p>`;
    }

    controls.innerHTML = `<h4>组合 ${tex("c_1p_1+c_2p_2+c_3p_3")}，目标 ${tex("q=1+2x+3x^2")}</h4>
      ${[0, 1, 2].map((i) => rangeInput(tex(`c_${i + 1}`), `c${i}`, -3, 3, 0.5, 0)).join("")}
      <div class="ch6l-actions"><button type="button" class="ch6l-btn is-primary" data-solve>解出 ${tex("q")} 的坐标</button><button type="button" class="ch6l-btn" data-look>沿平面看</button><button type="button" class="ch6l-btn" data-reset>回到默认视角</button></div>`;

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
            if (!gate?.predicted) return;
            state.polys[i] = p;
            redraw();
            acted();
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
        html += `<p class="ch6l-muted">先在下方猜一猜，再看秩的判定。</p>`;
      }
      html += `<p>${tex(`c_1p_1+c_2p_2+c_3p_3=${K().polyTex(cm)}`)}</p>`;
      html += hit ? `<p class="ch6l-ok">命中 ${tex("q")}：坐标为 ${tex(vecTex(state.c))}</p>` : "";
      if (hit && state.revealed && rank === 3) html += `<p class="ch6l-muted">三段折线恰好停在 ${tex("q")}。换任何一个系数，终点都会离开 ${tex("q")}：基下的坐标唯一。</p>`;
      info.innerHTML = html;
      if (state.revealed) result.innerHTML = `<strong>结论</strong>${conclusion(ps, det)}`;
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
        box.insertAdjacentHTML("beforeend", `<p class="ch6l-bad">${tex("q")} 不在 ${tex("L(p_1,p_2,p_3)")} 中：没有任何组合等于 ${tex("q")}。</p>`);
        return;
      }
      state.c = part.x;
      controls.querySelectorAll("input[type=range]").forEach((input, i) => (input.value = String(num(state.c[i]))));
      redraw();
      if (M().rankOf(aug.map((r) => r.slice(0, 3))) < 3) box.insertAdjacentHTML("beforeend", `<p class="ch6l-muted">这只是其中一组：三者相关时，组合方式不唯一。</p>`);
    }

    function load(key) {
      if (gate && !gate.predicted) return;
      state.key = key;
      state.polys = PRESETS[key].polys.map((p) => p.slice());
      state.c = [F(0), F(0), F(0)];
      controls.querySelectorAll("input[type=range]").forEach((input) => (input.value = "0"));
      scene.setCamera(PRESETS[key].cam, false);
      scene.setRange(PRESETS[key].range, false);
      redraw();
      acted();
    }

    K().chips(toolbar, Object.entries(PRESETS).map(([k, v]) => [k, v.label]), load, "lay");
    controls.querySelectorAll("input[type=range]").forEach((input, i) =>
      input.addEventListener("input", () => {
        state.c[i] = F(Number(input.value));
        redraw();
        acted();
      }),
    );
    controls.querySelector("[data-solve]").addEventListener("click", () => {
      acted();
      solve();
    });
    controls.querySelector("[data-reset]").addEventListener("click", () => scene.setCamera(PRESETS[state.key].cam));
    controls.querySelector("[data-look]").addEventListener("click", () => {
      if (!gate?.predicted) return;
      const ps = polysF();
      const nonzero = ps.find((p) => p.some((x) => !M().isZero(x)));
      if (nonzero) scene.lookAlong(nonzero.map(num));
      acted();
    });

    gate = K().predictGate(
      gateHost,
      {
        question: `${tex("p_1=1+2x^2,\\ p_2=4+x+5x^2,\\ p_3=3+2x")} 是 ${tex("P[x]_3")} 的一组基吗？`,
        options: [
          { text: "是，三个多项式两两不成比例", why: "两两不成比例保证不了三个一起无关。旋转右图，看三个坐标点和原点的位置关系。" },
          { text: "是，个数恰好等于维数 3", why: "个数对上之后，还要线性无关。" },
          { text: "不是，三个坐标点与原点共面", correct: true },
          { text: "无法用坐标判断", why: "坐标保持线性组合，相关性可以完全在坐标里判断。" },
        ],
        right: `点“沿平面看”，三个点排成一条线：${tex("p_1,p_2,p_3")} 线性相关。`,
      },
      () => {
        state.revealed = true;
        result.hidden = false;
        redraw();
      },
    );

    // Keep the question tied to its original three polynomials until a guess is made.
    // Camera rotation and zoom remain available before the prediction.
    const syncBasisPrediction = () => {
      const locked = !gate?.predicted;
      controls.querySelector("[data-look]").disabled = locked;
      toolbar.querySelectorAll("button").forEach((button) => { button.disabled = locked; });
    };
    gateHost.addEventListener("click", (event) => {
      if (event.target.closest("button[data-i]")) syncBasisPrediction();
    });
    syncBasisPrediction();
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
      sq1: { label: tex("p=x^2-1"), p: [-1, 0, 1] },
      sq: { label: tex("p=x^2"), p: [0, 0, 1] },
      lin: { label: tex("p=1+x"), p: [1, 1, 0] },
    };
    const state = { key: "sq1", a: F(0), revealed: false };
    const toolbar = el("div", "ch6l-toolbar");
    lab.append(toolbar);
    const { plotBox, right } = pairViews(lab, "函数图像", `旧坐标空间（基 ${tex("1,x,x^2")}）`);
    const scene = S().create(right, { range: 3, label: "新基向量与固定的坐标点", hint: "拖动空白处旋转", axisNames: ["1", "x", "x²"], yaw: -0.6, pitch: 0.4, clampLabels: true });
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

      const cols = [0, 1, 2].map((j) => A.map((r) => num(r[j])));
      const chain = [[0, 0, 0]];
      if (state.revealed) cols.forEach((c, j) => chain.push(S().vec.add(chain[chain.length - 1], S().vec.mul(c, num(Y[j])))));
      scene.setObjects(() => {
        const objs = cols.map((c, j) => ({ type: "arrow", to: c, color: COLORS[j], width: 2.2, alpha: 0.85, label: `η${SUB[j]}` }));
        chain.slice(1).forEach((head, j) => {
          const tail = chain[j];
          if (S().vec.len(S().vec.sub(head, tail)) > 1e-9) objs.push({ type: "arrow", from: tail, to: head, color: COLORS[j], width: 3.4 });
        });
        objs.push({ type: "point", p: X.map(num), color: "text", r: 7, label: "X" });
        return K().placeLabels(scene, objs, { axisNames: ["1", "x", "x²"] });
      });
      // zoom so the basis vectors and the chain fill the view
      scene.fitRange([...cols, ...chain, X.map(num)], { pad: 1.25, min: 1.5, max: 5 });

      const check = M().matVec(A, Y).every((x, i) => M().eq(x, X[i]));
      info.innerHTML = `<div>${colourColumnsHtml(texD(`A_a=${colourColumnsTex(A)}`), COLORS)}</div>
        <div>${texD(`X=${K().colTex(X)}`)}</div>
        <div>${state.revealed ? texD(`Y=${K().colTex(Y)}`) : texD("Y=\\;?")}</div>
        <p>${state.revealed ? `${tex(`A_aY=${vecTex(M().matVec(A, Y))}^T`)} ${check ? `<span class="ch6l-ok">${tex("=X")}</span>` : ""}` : `先猜一猜 ${tex("a=1")} 时的 ${tex("Y")}，再揭示新坐标。`}</p>`;
      info.dataset.check = String(check);
      const out = controls.querySelector("[data-a-v]");
      out.innerHTML = tex(fmt(a));
    }

    let gate = null;
    // the question is about p = x²−1 at a = 1: only reaching that state grades the guess
    const actedOnAsked = () => {
      if (state.key === "sq1" && M().eq(state.a, F(1))) gate?.acted();
    };
    K().chips(toolbar, Object.entries(PRESETS).map(([k, v]) => [k, v.label]), (k) => {
      state.key = k;
      redraw();
      actedOnAsked();
    }, "sq1");
    controls.querySelector("[data-a]").addEventListener("input", (e) => {
      state.a = F(Number(e.target.value));
      redraw();
      actedOnAsked();
    });
    gate = K().predictGate(
      gateHost,
      {
        question: `取 ${tex("p=x^2-1")}，${tex("a=1")}。${tex("p")} 在新基 ${tex("1,\\,x-1,\\,(x-1)^2")} 下的坐标 ${tex("Y")} 是什么？（提示：把 ${tex("x")} 写成 ${tex("(x-1)+1")}。）`,
        options: [
          { text: tex("(-1,0,1)^T"), why: "这是旧坐标 X，只有 a=0 时两者相同。" },
          { text: tex("(1,-2,1)^T"), why: "这是 (x−1)² 在旧基下的坐标，也就是 A₁ 的第三列。" },
          { text: tex("(0,2,1)^T"), correct: true },
          { text: tex("(0,1,1)^T"), why: "第二个坐标是 p 在 x=1 处的斜率。" },
        ],
        right: `${tex("x^2-1=0+2(x-1)+(x-1)^2")}。左图中 ${tex("a=1")} 处的点落在 ${tex("x")} 轴上，切线斜率为 2。`,
        actHint: "记下了你的猜测。取 p=x²−1，把 a 拖到 1，结论随后出现。",
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

  const spaceName = (d) => [tex("\\{0\\}"), "一条直线", "一个平面", tex("\\mathbb R^3")][d];
  // after a Chinese word: a formula name takes the usual space, a Chinese name none
  const isSpace = (d) => `是${d === 0 || d === 3 ? " " : ""}${spaceName(d)}`;

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
    const scene = S().create(stage, { range: 2.5, label: "两个子空间、它们的交与和", yaw: -0.85, pitch: 0.38, spreadLabels: true, labelSafe: true });
    const info = el("div", "ch6l-card");
    const tools = el("div", "ch6l-actions");
    tools.innerHTML = `<button type="button" class="ch6l-btn" data-look>沿交线看</button><button type="button" class="ch6l-btn" data-reset>回到默认视角</button>`;
    const gateHost = el("div");
    const result = K().resultBox(`<p>维数公式 <span class="la-keep">${tex("\\dim U+\\dim W=\\dim(U+W)+\\dim(U\\cap W)")}。</span>在 ${tex("\\mathbb R^3")} 中 ${tex("\\dim(U+W)\\le3")}，所以两个平面的交至少是 ${tex("2+2-3=1")} 维：沿交线看，两个平面都缩成直线，交点就是那条公共直线。平面与直线一般只交于原点，和是 ${tex("\\mathbb R^3")}；直线落进平面后，交是这条直线，和退回平面。</p>`);
    side.append(info, tools, gateHost, result);

    function compute() {
      const U = state.u.map(fv);
      const W = state.w.map(fv);
      const { Bu, Bw, basis } = intersectionBasis(U, W);
      const sum = M().rankOf(K().colsToRows([...U, ...W]));
      return { U, W, Bu, Bw, basis, sum };
    }

    /*
     * Basis of U∩W (α, green), extended inside U by β (blue) and inside W by
     * γ (vermilion): α,β is a basis of U, α,γ of W, and α,β,γ of U+W, so the
     * shared α is counted once.
     */
    function extendBasis(start, gens) {
      const out = [];
      gens.forEach((g) => {
        const all = [...start, ...out, g];
        if (M().rankOf(K().colsToRows(all)) === all.length) out.push(g);
      });
      return out;
    }

    function redraw() {
      const { U, W, Bu, Bw, basis, sum } = compute();
      const inter = basis.length;
      const alphas = basis.map(primitive);
      const betas = extendBasis(alphas, Bu);
      const gammas = extendBasis(alphas, Bw);
      const name = (letter, i, n) => (n > 1 ? `${letter}${SUB[i]}` : letter);
      scene.setObjects(() => {
        const objs = [...K().spanObjects(Bu, "v1", { label: "U" }), ...K().spanObjects(Bw, "v2", { label: "W", alpha: 0.12 })];
        if (state.revealed && inter === 1) objs.push({ type: "line", dir: basis[0].map(num), color: "subspace", width: 4.2, label: "U∩W" });
        const ghost = state.revealed;
        U.forEach((v, i) => objs.push({ type: "arrow", to: v.map(num), color: "v1", width: 2.4, label: ghost ? undefined : `u${SUB[i]}`, ghost }));
        W.forEach((v, i) => objs.push({ type: "arrow", to: v.map(num), color: "v2", width: 2.4, label: ghost ? undefined : `w${SUB[i]}`, ghost }));
        if (state.revealed) {
          // a long primitive vector would leave the view; any non-zero multiple is a basis of U∩W
          const fit = (v) => {
            const len = S().vec.len(v);
            return len > 2.2 ? S().vec.mul(v, 1.6 / len) : v;
          };
          alphas.forEach((v, i) => objs.push({ type: "arrow", to: fit(v.map(num)), color: "subspace", width: 3.4, label: name("α", i, alphas.length) }));
          betas.forEach((v, i) => objs.push({ type: "arrow", to: v.map(num), color: "v1", width: 3.4, label: name("β", i, betas.length) }));
          gammas.forEach((v, i) => objs.push({ type: "arrow", to: v.map(num), color: "v2", width: 3.4, label: name("γ", i, gammas.length) }));
        }
        return objs;
      });
      scene.setHandles([
        ...state.u.map((_, i) => ({ color: "drag", snap: 0.5, get: () => state.u[i], set: (p) => ((state.u[i] = p), redraw(), actedOnAsked()) })),
        ...state.w.map((_, i) => ({ color: "drag", snap: 0.5, get: () => state.w[i], set: (p) => ((state.w[i] = p), redraw(), actedOnAsked()) })),
      ]);
      const dU = Bu.length;
      const dW = Bw.length;
      let html = `<h4>维数账本</h4><p>${tex(`\\dim U=${dU}`)}（${spaceName(dU)}），${tex(`\\dim W=${dW}`)}（${spaceName(dW)}）</p>`;
      if (state.revealed) {
        html += `<p>${tex(`\\dim(U\\cap W)=${inter}`)}${inter ? `，${inter === 1 ? tex(`U\\cap W=L(${vecTex(primitive(basis[0]))})`) : `${tex("U\\cap W")} 是整个平面`}` : "，只有零向量"}</p>`;
        html += `<p>${tex(`\\dim(U+W)=${sum}`)}，${tex("U+W")} ${isSpace(sum)}</p>`;
        // names carry the arrow colours: β → v1 (sentinel 0), γ → v2 (1), α → subspace (2)
        const tn = (letter, list, j) => list.map((_, i) => `\\textcolor{${COL_SENTINEL[j]}}{\\${letter}${list.length > 1 ? `_${i + 1}` : ""}}`);
        const A = tn("alpha", alphas, 2);
        const B = tn("beta", betas, 0);
        const G = tn("gamma", gammas, 1);
        const basisOf = (names) => names.join(",");
        html += colourColumnsHtml(
          `<ul class="ch6l-bases">
          <li>${tex("U")} 的基 ${tex(basisOf([...A, ...B]))}</li>
          <li>${tex("W")} 的基 ${tex(basisOf([...A, ...G]))}</li>
          <li>${tex("U+W")} 的基 ${tex(basisOf([...A, ...B, ...G]))}${A.length ? `，其中 ${tex(basisOf(A))} 只数一次` : ""}</li>
        </ul>`,
          COLORS,
        );
        html += `<p class="ch6l-ok">${tex(`\\dim(U+W)=${dU}+${dW}-${inter}=${sum}`)}</p>`;
      } else {
        html += `<p class="ch6l-muted">先猜一猜，再看交与和的维数。</p>`;
      }
      info.innerHTML = html;
      info.dataset.ledger = [dU, dW, inter, sum].join(",");
      info.dataset.bases = [alphas.length, betas.length, gammas.length].join(",");
      tools.querySelector("[data-look]").disabled = !state.revealed || inter !== 1;
    }

    let gate = null;
    /*
     * The question is about two different planes: only an action that leaves two
     * different planes on screen grades the guess. The other presets can be explored
     * freely; the guess stays until the student comes back to two planes.
     */
    function actedOnAsked() {
      const { Bu, Bw, sum } = compute();
      if (Bu.length === 2 && Bw.length === 2 && sum === 3) gate?.acted();
    }
    function load(key) {
      scene.setHandles([]);
      state.key = key;
      state.u = [[1, 0, 1], [0, 1, 1]];
      state.w = PRESETS[key].w.map((v) => v.slice());
      scene.resetView(false);
      redraw();
    }

    K().chips(toolbar, Object.entries(PRESETS).map(([k, v]) => [k, v.label]), (key) => {
      load(key);
      actedOnAsked();
    }, "planes");
    tools.querySelector("[data-look]").addEventListener("click", () => {
      const { basis } = compute();
      if (basis.length === 1) scene.lookAlong(basis[0].map(num));
    });
    tools.querySelector("[data-reset]").addEventListener("click", () => scene.resetView());
    gate = K().predictGate(
      gateHost,
      {
        question: `${tex("\\mathbb R^3")} 中两个不同的过原点平面，交可以只有零向量吗？`,
        options: [
          { text: "可以，只要两个平面错开得足够开", why: "拖动 w₁、w₂ 试试：只要两个平面不重合，绿色交线就一直在。" },
          { text: "可以，两个平面互相垂直时", why: "xy 平面与 xz 平面互相垂直，仍交于 x 轴。" },
          { text: "不可以，交至少是一条直线", correct: true },
          { text: "取决于观察角度", why: "交是两个集合的公共部分，与怎么看无关。" },
        ],
        right: `${tex("2+2-3=1")}：${tex("U+W")} 最多是 ${tex("\\mathbb R^3")}，所以交至少 1 维。点“沿交线看”。`,
        actHint: "记下了你的猜测。在两个不同的平面上拖动一个端点，结论随后出现。",
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
        label: `直线 ${tex("\\oplus")} 平面`,
        task: `${tex("W")} 是水平面，${tex("U=L(u)")} 是一条斜线。拖动 ${tex("v")}：它沿 ${tex("U")} 的方向落到 ${tex("W")} 上，分成 ${tex("v=u'+w'")}。再拖动 ${tex("u")}，让直线向平面倾斜。`,
        predict: {
          question: `把 ${tex("u")} 压低，让直线越来越贴近平面 ${tex("W")}（但不落进去），${tex("v")} 的两个分量会怎样？`,
          options: [
            { text: "越来越长", correct: true },
            { text: "长度不变，只转方向", why: "压低 u，看 u′ 的箭头。" },
            { text: "越来越短", why: "u 的高度越小，要走更多倍的 u 才能升到 v 的高度。" },
            { text: "立刻变成正交分解", why: "分解沿 U 的方向进行，与是否垂直无关。" },
          ],
          right: `${tex("u'=tu")}，其中 ${tex("t=v_3/u_3")}。${tex("u_3\\to0")} 时 ${tex("t")} 无限增大；${tex("u_3=0")} 时 ${tex("U\\subset W")}，${tex("U+W=W")}，直和不再成立。`,
          actHint: "记下了你的猜测。把 u 压低一次（拖动 u 或点“把 u 压低”），结论随后出现。",
        },
        result: (kind) =>
          ({
            direct: `<p>${tex("U\\cap W=\\{0\\}")} 且 <span class="la-keep">${tex("\\dim U+\\dim W=3")}，</span>所以 <span class="la-keep">${tex("\\mathbb R^3=U\\oplus W")}，</span>每个 ${tex("v")} 恰有一种分解 ${tex("v=u'+w'")}。分解沿着 ${tex("U")} 的方向，画出的平行四边形一般不是矩形。直线越贴近平面，${tex("u'=tu")} 中的 ${tex("t=v_3/u_3")} 越大，两个分量越长。</p>`,
            outside: `<p>现在 ${tex("u")} 落进了 ${tex("W")}：${tex("U\\subset W")}，${tex("U\\cap W=U")}，${tex("U+W=W")} 只是平面，不再是直和。${tex("v")} 在平面外，没有任何分解；把 ${tex("v")} 也放进平面，分解就有无穷多种。</p>`,
            inside: `<p>现在 ${tex("u")} 和 ${tex("v")} 都在 ${tex("W")} 里：${tex("U\\subset W")}，${tex("U\\cap W=U\\ne\\{0\\}")}，${tex("U+W=W")} 不是直和。图中两个不同的平行四边形给出同一个 ${tex("v")}：沿 ${tex("U")} 走多少都可以，分解有无穷多种。</p>`,
          })[kind],
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
          right: `${tex("k_1w_1+k_2w_2+k_3w_3=0")} 有非零解，三段箭头首尾相接回到原点。维数 ${tex("1+1+1=3")}，和空间却只是 2 维的平面。`,
          actHint: "记下了你的猜测。点“从上方看”，或在水平面里拖动 w₃，结论随后出现。",
        },
        result: (kind) =>
          `<p>多个子空间的和是直和，当且仅当每个 ${tex("W_i")} 与其余子空间之和只交于零，也等价于 ${tex("\\dim(W_1+W_2+W_3)=\\dim W_1+\\dim W_2+\\dim W_3")}。${
            kind === "direct"
              ? `现在 ${tex("w_3")} 离开了水平面，${tex("\\dim(W_1+W_2+W_3)=3=1+1+1")}，直和成立，${tex("\\mathbb R^3=W_1\\oplus W_2\\oplus W_3")}。`
              : `现在 ${tex("W_3\\subset W_1+W_2")}，和空间只有 2 维，条件失败：零向量有非零的分解。把 ${tex("w_3")} 拖出水平面，三个维数之和等于 3，直和成立。`
          }</p>`,
      },
    };
    const lab = K().labShell(root, { title: "分解什么时候唯一", task: MODES.split.task });
    const state = { mode: "split", u: [1, 0.5, 1], v: [-1, 2, 2], w3: [1, 1, 0], revealed: false };
    const toolbar = el("div", "ch6l-toolbar");
    lab.append(toolbar);
    const { stage, side } = stageBody(lab);
    const scene = S().create(stage, { range: 3, label: "直线与平面的直和分解", yaw: -0.9, pitch: 0.32, clampLabels: true });
    const info = el("div", "ch6l-card");
    const tools = el("div", "ch6l-actions");
    // one prediction per mode; switching modes keeps the other mode's guess
    const gateHosts = { split: el("div"), three: el("div") };
    const gates = {};
    const result = K().resultBox("");
    side.append(info, tools, gateHosts.split, gateHosts.three, result);
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
      const splits = ok
        ? []
        : [1, -1].map((s) => {
            const ucS = u.map((x) => M().mul(x, F(s)));
            return { t: s, uc: ucS, wc: v.map((x, k) => M().sub(x, ucS[k])) };
          });
      tools.querySelector("[data-vflat]")?.toggleAttribute("hidden", ok || M().isZero(v[2]));
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
        } else if (state.revealed && M().isZero(v[2])) {
          // U ⊂ W and v ∈ W: two different parallelograms give the same v.
          splits.forEach(({ uc: ucF, wc: wcF }, k) => {
            const ucn = ucF.map(num);
            const wcn = wcF.map(num);
            const ghost = k === 1;
            objs.push({ type: "polygon", pts: [[0, 0, 0], ucn, state.v, wcn], color: "drag", alpha: ghost ? 0.04 : 0.08, strokeAlpha: 0 });
            objs.push({ type: "segment", a: ucn, b: state.v, color: "axis", dash: [5, 4], width: 1.2 });
            objs.push({ type: "segment", a: wcn, b: state.v, color: "axis", dash: [5, 4], width: 1.2 });
            objs.push({ type: "arrow", to: ucn, color: "v1", width: 3, ghost, label: ghost ? "u″" : "u′" });
            objs.push({ type: "arrow", to: wcn, color: "v2", width: 3, ghost, label: ghost ? "w″" : "w′" });
          });
        }
        objs.push({ type: "arrow", to: state.v, color: "drag", width: 3.4, label: "v" });
        return K().placeLabels(scene, objs, { handles: [state.u, state.v] });
      });
      scene.setHandles([
        {
          color: "drag",
          snap: 0.5,
          get: () => state.u,
          set: (p) => {
            const before = Math.abs(state.u[2]);
            if (!gates.split?.predicted) return;
            state.u = nonzero(p, state.u);
            redraw();
            if (lowered(before)) acted();
          },
        },
        { color: "drag", snap: 0.5, get: () => state.v, set: (p) => { if (!gates.split?.predicted) return; state.v = p; redraw(); } },
      ]);
      const inter = ok ? 0 : 1;
      const sum = ok ? 3 : 2;
      let html = `<h4>读数</h4><p>${tex(`u=${vecTex(u)},\\ v=${vecTex(v)}`)}</p>`;
      if (state.revealed) {
        html += `<p>${tex(`\\dim(U\\cap W)=${inter}`)}，${tex(`\\dim(U+W)=${sum}`)}</p>`;
        if (ok) {
          html += `<p>${tex(`u'=${fmt(t)}\\,u=${vecTex(uc)}`)}</p><p>${tex(`w'=v-u'=${vecTex(wc)}`)}</p><p class="ch6l-ok">${tex("\\mathbb R^3=U\\oplus W")}，分解唯一</p>`;
        } else if (M().isZero(v[2])) {
          html += `<p class="ch6l-bad">${tex("U\\subset W")}：${tex("v")} 在 ${tex("W")} 内，分解有无穷多种</p>`;
          html += splits.map(({ uc: a, wc: b }, k) => `<p>${tex(`v=${vecTex(a)}+${vecTex(b)}`)}${k ? "（虚线）" : ""}</p>`).join("");
        } else {
          html += `<p class="ch6l-bad">${tex("U\\subset W")}：${tex("v")} 不在 ${tex("U+W=W")} 中，无法分解</p>`;
        }
      } else {
        html += `<p class="ch6l-muted">先猜一猜，再看分量的数值。</p>`;
      }
      info.innerHTML = html;
      info.dataset.state = ok ? "direct" : "inside";
      setResult(ok ? "direct" : M().isZero(v[2]) ? "inside" : "outside");
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
        return K().placeLabels(scene, objs, { handles: [state.w3] });
      });
      scene.setHandles([{ color: "drag", snap: 0.5, get: () => state.w3, set: (p) => { if (!gates.three?.predicted) return; state.w3 = nonzero(p, state.w3); redraw(); if (threeInPlane()) acted(); } }]);
      const pairsText = pairOk.every(Boolean) ? `两两交为 ${tex("\\{0\\}")}` : "有两条直线重合";
      let html = `<h4>读数</h4><p>${pairsText}</p>`;
      if (state.revealed) {
        html += `<p>${tex(`\\dim(W_1+W_2+W_3)=${rank}`)}，维数之和 ${tex("=3")}</p>`;
        html += rank === 3
          ? `<p class="ch6l-ok">直和：${tex("\\mathbb R^3=W_1\\oplus W_2\\oplus W_3")}</p>`
          : `<p class="ch6l-bad">不是直和：${tex(M().latexRelation(cert.coeffs, ["w_1", "w_2", "w_3"]))}</p>`;
      } else {
        html += `<p class="ch6l-muted">先猜一猜，再看维数。</p>`;
      }
      info.innerHTML = html;
      info.dataset.state = rank === 3 ? "direct" : "not-direct";
      setResult(rank === 3 ? "direct" : "not-direct");
    }

    const acted = () => gates[state.mode]?.acted();
    /*
     * Each question names its own situation, and only an action in that situation grades
     * the guess: in “直线 ⊕ 平面” lowering u while it stays out of W; in “三条直线” a look
     * or a drag while all three lines lie in the horizontal plane, pairwise different.
     */
    const lowered = (before) => state.u[2] !== 0 && Math.abs(state.u[2]) < before;
    function threeInPlane() {
      const vs = [W1, W2, state.w3].map(fv);
      return state.w3[2] === 0 && [[0, 1], [0, 2], [1, 2]].every(([i, j]) => M().rankOf(K().colsToRows([vs[i], vs[j]])) === 2);
    }
    function setResult(kind) {
      result.innerHTML = `<strong>结论</strong>${MODES[state.mode].result(kind)}`;
      result.dataset.kind = kind;
    }

    function redraw() {
      if (state.mode === "split") drawSplit();
      else drawThree();
    }

    function syncDirectSumTools() {
      const locked = !gates[state.mode]?.predicted;
      tools.querySelectorAll("[data-low], [data-flat], [data-vflat], [data-lift], [data-top]")
        .forEach((button) => { button.disabled = locked; });
    }

    Object.values(gateHosts).forEach((host) => host.addEventListener("click", (event) => {
      if (event.target.closest("button[data-i]")) syncDirectSumTools();
    }));

    function setTools() {
      tools.innerHTML =
        state.mode === "split"
          ? `<button type="button" class="ch6l-btn" data-low>把 ${tex("u")} 压低</button><button type="button" class="ch6l-btn" data-flat>让 ${tex("u")} 落进平面</button><button type="button" class="ch6l-btn" data-vflat hidden>让 ${tex("v")} 也落进平面</button><button type="button" class="ch6l-btn" data-reset>回到默认视角</button>`
          : `<button type="button" class="ch6l-btn" data-lift>把 ${tex("w_3")} 抬出平面</button><button type="button" class="ch6l-btn" data-top>从上方看</button><button type="button" class="ch6l-btn" data-reset>回到默认视角</button>`;
      tools.querySelector("[data-reset]").addEventListener("click", () => scene.resetView());
      tools.querySelector("[data-low]")?.addEventListener("click", () => {
        const before = Math.abs(state.u[2]);
        state.u = [state.u[0], state.u[1], Math.sign(state.u[2] || 1) * Math.min(0.5, before / 2 || 0.5)];
        redraw();
        if (lowered(before)) acted();
      });
      tools.querySelector("[data-flat]")?.addEventListener("click", () => {
        state.u = [state.u[0], state.u[1], 0];
        redraw();
      });
      tools.querySelector("[data-vflat]")?.addEventListener("click", () => {
        state.v = [state.v[0], state.v[1], 0];
        redraw();
        // look nearly straight down so both parallelograms in W are open
        scene.lookAlong([0.2, -0.3, 1]);
      });
      tools.querySelector("[data-lift]")?.addEventListener("click", () => {
        state.w3 = [state.w3[0], state.w3[1], 1.5];
        redraw();
      });
      tools.querySelector("[data-top]")?.addEventListener("click", () => {
        scene.lookAlong([0, 0, 1]);
        if (threeInPlane()) acted();
      });
      syncDirectSumTools();
    }

    function load(mode) {
      state.mode = mode;
      state.u = [1, 0.5, 1];
      state.v = [-1, 2, 2];
      state.w3 = [1, 1, 0];
      lab.querySelector(".ch6l-head p").innerHTML = MODES[mode].task;
      gates[mode] ||= K().predictGate(gateHosts[mode], MODES[mode].predict, () => {
        if (state.mode !== mode) return;
        state.revealed = true;
        result.hidden = false;
        redraw();
      });
      Object.entries(gateHosts).forEach(([k, host]) => (host.hidden = k !== mode));
      state.revealed = gates[mode].revealed;
      result.hidden = !state.revealed;
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
      coef: { label: `系数：${tex("\\sigma(p)=(a_0,a_1,a_2)")}`, name: "σ" },
      value: { label: `取值：${tex("\\tau(p)=(p(0),p(1),p(2))")}`, name: "τ" },
      square: { label: `把 ${tex("a_2")} 换成 ${tex("a_2^2")}`, name: "f" },
    };
    const state = { mode: "coef", p: [1, -1, 0.5].map(F), q: [0, 1.5, -0.5].map(F), revealed: false };
    const toolbar = el("div", "ch6l-toolbar");
    lab.append(toolbar);
    const { plotBox, right } = pairViews(lab, `${tex("P[x]_3")} 中的三条曲线`, `像所在的 ${tex("\\mathbb R^3")}`);
    const scene = S().create(right, { range: 1.7, label: "像与平行四边形", hint: "拖动圆点改变多项式 · 拖动空白处旋转", yaw: 2.7, pitch: 0.65, spreadLabels: true, labelSafe: true });
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
          // placed first, so the vertex keeps its label next to it
          ...(closes ? [] : [{ type: "label", p: C, text: "第四个顶点", color: "axis", font: "600 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" }]),
          { type: "polygon", pts: [[0, 0, 0], P, C, Q], color: "axis", alpha: 0.06, strokeAlpha: 0.6, dash: [5, 4] },
          { type: "arrow", to: P, color: "v1", width: 2.8, label: `${name}(p)` },
          { type: "arrow", to: Q, color: "v2", width: 2.8, label: `${name}(q)` },
          // with a gap at the tip, the label moves to the shaft so it stays off the gap
          { type: "arrow", to: Sn, color: "image", width: 3.2, label: `${name}(p+q)`, ...(closes ? {} : { labelAt: S().vec.mul(Sn, 0.55) }) },
        ];
        if (!closes) {
          // the gap that additivity would close, in the second-vector / error colour
          objs.push({ type: "segment", a: Sn, b: C, color: "v2", width: 3.4, glow: true });
          objs.push({ type: "point", p: C, color: "axis", r: 5.5, hollow: true });
        }
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
                gate?.acted();
              },
            })),
      );
      info.dataset.closes = String(closes);
      info.innerHTML = `${tex(`${name}(p)=${vecTex(ip)},\\ ${name}(q)=${vecTex(iq)}`)}<br>${tex(`${name}(p+q)=${vecTex(is)}`)}，${tex(`${name}(p)+${name}(q)=${vecTex(corner)}`)}：${
        closes ? `<span class="ch6l-ok">两者相等，平行四边形闭合</span>` : `<span class="ch6l-bad">两者不等，加法没有被保持</span>`
      }${closes ? "" : `<br>从 ${tex(`${name}(p+q)`)} 到第四个顶点的线段：${tex(`${name}(p)+${name}(q)-${name}(p+q)=${vecTex(corner.map((x, i) => M().sub(x, is[i])))}`)}`}`;
    }

    let gate = null;
    K().chips(toolbar, Object.entries(MODES).map(([k, v]) => [k, v.label]), (k) => {
      state.mode = k;
      redraw();
      // without handles to drag, magnify the parallelogram so the gap is easy to see
      if (k === "square") {
        const s = add(state.p, state.q);
        scene.fitView([[0, 0, 0], image(state.p), image(state.q), image(s), add(image(state.p), image(state.q))].map((v) => v.map(num)), { pad: 1.35, max: 2 });
      } else scene.resetFit();
      gate?.acted();
    }, "coef");
    gate = K().predictGate(
      gateHost,
      {
        question: `${tex("\\tau(p)=(p(0),p(1),p(2))")} 是 ${tex("P[x]_3")} 到 ${tex("\\mathbb R^3")} 的同构吗？`,
        options: [
          { text: `不是，像不是 ${tex("p")} 的系数`, why: "同构只要求保持运算并且是双射，没有要求用系数。切到“取值”模式拖一拖。" },
          { text: "是", correct: true },
          { text: "不是，它不保持加法", why: "切到“取值”模式，看平行四边形是否闭合。" },
          { text: "只对一次多项式成立", why: "τ 对 P[x]₃ 中每个多项式都有定义；拖动 τ(p) 的三个坐标试试。" },
        ],
        right: `${tex("\\tau")} 线性，并且右图任意一点都对应唯一一条过三点的曲线。`,
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


;/* visuals/ch6/mount.js */
/* Attach Chapter 6 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.renderLessonPage = function renderLessonPageWithChapter6Extensions(section, chapter) {
    window.teardownChapter6Lesson?.();
    baseRenderLessonPage(section, chapter);
    window.mountChapter6Lesson?.(section, document.querySelector("#mainContent"));
  };
})();

