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
