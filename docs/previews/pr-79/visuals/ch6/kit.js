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

  /* The student commits to an answer first; the conclusion opens afterwards. */
  function predictGate(host, spec, onAnswered) {
    const box = el("div", "ch6l-predict");
    box.innerHTML = `<div class="ch6l-predict-q"><span>先预测</span><p>${spec.question}</p></div>
      <div class="ch6l-predict-options">${spec.options.map((o, i) => `<button type="button" data-i="${i}">${o.text}</button>`).join("")}</div>
      <p class="ch6l-predict-feedback" hidden></p>`;
    host.append(box);
    const feedback = box.querySelector(".ch6l-predict-feedback");
    let answered = false;
    box.querySelectorAll("[data-i]").forEach((b) =>
      b.addEventListener("click", () => {
        const o = spec.options[Number(b.dataset.i)];
        box.querySelectorAll("[data-i]").forEach((x) => x.classList.remove("is-right", "is-wrong"));
        b.classList.add(o.correct ? "is-right" : "is-wrong");
        feedback.hidden = false;
        feedback.innerHTML = o.correct ? `✓ ${spec.right}` : `再对照图形想一想：${o.why || "动手操作后看看发生了什么。"}`;
        if (!answered) {
          answered = true;
          onAnswered?.();
        }
      }),
    );
    return box;
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

  /* ---------- SVG function plot ---------- */

  let plotId = 0;
  const cssColor = (c) => (c && /^[a-z-]+$/.test(c) ? `var(--${c})` : c || "var(--text)");

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
    plot,
    legend,
    defineFigure,
    renderFormal,
  });
})();
