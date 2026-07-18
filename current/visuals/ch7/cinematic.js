/* Chapter 7 cinematic presentation layer.
 * Re-registers all Chapter 7 renderers with persistent controls and geometry-first SVG scenes.
 */
(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);
  const EPS = 1e-8;

  const fmt = (value, digits = 2) => {
    const clean = Math.abs(value) < 1e-9 ? 0 : value;
    if (Number.isInteger(clean)) return String(clean);
    return clean.toFixed(digits).replace(/\.00$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
  };
  const add = (u, v) => u.map((x, i) => x + v[i]);
  const sub = (u, v) => u.map((x, i) => x - v[i]);
  const scale = (c, v) => v.map((x) => c * x);
  const dot = (u, v) => u.reduce((sum, x, i) => sum + x * v[i], 0);
  const norm = (v) => Math.hypot(...v);
  const cross2 = (u, v) => u[0] * v[1] - u[1] * v[0];
  const normalize = (v) => {
    const n = norm(v);
    return n < EPS ? v.map(() => 0) : v.map((x) => x / n);
  };
  const matVec = (A, x) => A.map((row) => dot(row, x));
  const matMul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((sum, value, k) => sum + value * B[k][j], 0)));
  const matAdd = (A, B) => A.map((row, i) => row.map((value, j) => value + B[i][j]));
  const matScale = (c, A) => A.map((row) => row.map((value) => c * value));
  const identity = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  const zeroMatrix = (rows, cols = rows) => Array.from({ length: rows }, () => Array(cols).fill(0));
  const det2 = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const inv2 = (A) => {
    const d = det2(A);
    if (Math.abs(d) < EPS) return null;
    return [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]];
  };
  const matPow = (A, power) => {
    let result = identity(A.length);
    let base = A.map((row) => [...row]);
    let n = Math.max(0, Math.floor(power));
    while (n > 0) {
      if (n % 2 === 1) result = matMul(result, base);
      base = matMul(base, base);
      n = Math.floor(n / 2);
    }
    return result;
  };
  const matrixNorm = (A) => Math.sqrt(A.flat().reduce((sum, value) => sum + value * value, 0));
  const vectorText = (v, digits = 2) => `(${v.map((value) => fmt(value, digits)).join(", ")})`;
  const matrixHtml = (A, digits = 2) => display(`\\begin{bmatrix}${A.map((row) => row.map((v) => fmt(v, digits)).join("&")).join("\\\\")}\\end{bmatrix}`);

  function binder() {
    const cleanups = [];
    return {
      on(target, type, handler, options) {
        if (!target) return;
        target.addEventListener(type, handler, options);
        cleanups.push(() => target.removeEventListener(type, handler, options));
      },
      cleanup() { cleanups.splice(0).forEach((fn) => fn()); },
    };
  }

  function formalRenderer(formal, lesson) {
    if (!formal || !lesson?.formal) return;
    const data = lesson.formal;
    const concepts = lesson.concepts || [];
    formal.innerHTML = `
      <h2>${data.heading}</h2>
      <div class="ch7-cinema-formal">
        <section class="ch7-cinema-definition-hero">
          <div class="ch7-cinema-definition-copy">
            <span class="ch7-cinema-kicker">本节核心问题</span>
            <h3>${lesson.question}</h3>
            <p>${data.lead}</p>
          </div>
          ${data.formula ? `<div class="ch7-cinema-main-formula"><span>核心关系</span>${display(data.formula)}</div>` : ""}
        </section>
        ${concepts.length ? `<ol class="ch7-cinema-concept-list">${concepts.map((item, index) => `
          <li>
            <span>${String(index + 1).padStart(2, "0")}</span>
            <div><strong>${item.label}</strong><p>${item.text}</p></div>
          </li>`).join("")}</ol>` : ""}
        <section class="ch7-cinema-principles">
          ${(data.blocks || []).map((block, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${block.title}</h3><p>${block.body}</p></div></article>`).join("")}
        </section>
        ${data.note ? `<aside class="ch7-cinema-note"><strong>边界提醒</strong><p>${data.note}</p></aside>` : ""}
        ${data.bridge ? `<aside class="ch7-cinema-bridge"><strong>下一步</strong><p>${data.bridge}</p></aside>` : ""}
      </div>`;
  }

  function presetButtons(presets, activeIndex, attr = "preset") {
    return `<div class="ch7-cinema-preset-row" role="group" aria-label="选择案例">${presets.map((preset, index) => `<button type="button" class="${index === activeIndex ? "is-active" : ""}" data-${attr}="${index}">${preset.name}</button>`).join("")}</div>`;
  }

  function stageButtons(stages, active, attr = "stage") {
    if (!stages?.length) return "";
    return `<div class="ch7-cinema-stage-tabs" role="tablist">${stages.map((stage) => `<button type="button" role="tab" aria-selected="${stage.id === active}" class="${stage.id === active ? "is-active" : ""}" data-${attr}="${stage.id}"><span>${stage.step || ""}</span><strong>${stage.label}</strong></button>`).join("")}</div>`;
  }

  function createLab(section, lesson, { subtitle, presets = [], activePreset = 0, stages = [], activeStage = "" }) {
    const prompts = (lesson.interactive?.prompts || []).slice(0, 3);
    section.innerHTML = `<h2>交互实验</h2>
      <div class="ch7-lab ch7-cinema-lab">
        <header class="ch7-cinema-lab-head">
          <span class="ch7-cinema-kicker">几何实验</span>
          <h3>${lesson.interactive.title}</h3>
          <p>${subtitle || lesson.interactive.description}</p>
        </header>
        <section class="ch7-cinema-task">
          <div><span>先回答</span><strong>${lesson.question}</strong><p>${lesson.interactive?.task || lesson.interactive?.description || ""}</p></div>
          ${prompts.length ? `<ol>${prompts.map((prompt) => `<li>${prompt}</li>`).join("")}</ol>` : ""}
        </section>
        ${presets.length ? presetButtons(presets, activePreset) : ""}
        ${stageButtons(stages, activeStage)}
        <div class="ch7-cinema-scene-slot" data-cinema-scene></div>
        <div class="ch7-cinema-controls" data-cinema-controls></div>
        <div data-cinema-conclusion></div>
      </div>`;
    return {
      lab: section.querySelector(".ch7-cinema-lab"),
      scene: section.querySelector("[data-cinema-scene]"),
      controls: section.querySelector("[data-cinema-controls]"),
      conclusion: section.querySelector("[data-cinema-conclusion]"),
    };
  }

  function mountRanges(container, specs, state, onInput) {
    container.innerHTML = specs.length ? `<div class="ch7-cinema-range-grid">${specs.map((spec) => `<label class="ch7-cinema-range"><span>${spec.label}<output data-output="${spec.key}">${fmt(state[spec.key], spec.digits ?? 2)}${spec.suffix || ""}</output></span><input type="range" data-key="${spec.key}" min="${spec.min}" max="${spec.max}" step="${spec.step ?? 0.1}" value="${state[spec.key]}" aria-label="${spec.label}"></label>`).join("")}</div>` : "";
    const cleanups = [];
    container.querySelectorAll('input[type="range"]').forEach((input) => {
      const handler = () => {
        const key = input.dataset.key;
        state[key] = Number(input.value);
        const spec = specs.find((item) => item.key === key);
        const output = container.querySelector(`[data-output="${key}"]`);
        if (output) output.textContent = `${fmt(state[key], spec?.digits ?? 2)}${spec?.suffix || ""}`;
        onInput?.(key);
      };
      input.addEventListener("input", handler);
      cleanups.push(() => input.removeEventListener("input", handler));
    });
    return () => cleanups.splice(0).forEach((fn) => fn());
  }

  function updateActiveButtons(root, selector, active) {
    root.querySelectorAll(selector).forEach((button) => {
      const isActive = button === active;
      button.classList.toggle("is-active", isActive);
      if (button.hasAttribute("role")) button.setAttribute("aria-selected", String(isActive));
    });
  }

  function conclusion({ tone = "neutral", title, text, formula = "" }) {
    return `<div class="ch7-cinema-conclusion is-${tone}"><span>${tone === "pass" ? "✓" : tone === "fail" ? "×" : tone === "warn" ? "!" : "→"}</span><div><strong>${title}</strong><p>${text}</p></div>${formula ? `<div class="ch7-cinema-conclusion-formula">${inline(formula)}</div>` : ""}</div>`;
  }

  function readout({ eyebrow, title, formula = "", text, rows = [] }) {
    return `<aside class="ch7-cinema-readout"><span>${eyebrow}</span><h4>${title}</h4>${formula ? `<div class="ch7-cinema-readout-formula">${display(formula)}</div>` : ""}<p>${text}</p>${rows.length ? `<dl>${rows.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join("")}</dl>` : ""}</aside>`;
  }

  function svgDefs(id) {
    const roles = ["input", "output", "accent", "success", "danger", "muted", "gold"];
    return `<defs>
      ${roles.map((role) => `<marker id="${id}-arrow-${role}" markerWidth="12" markerHeight="12" refX="10.5" refY="6" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 L12 6 L0 12 Z" class="ch7-cinema-marker is-${role}"/></marker>`).join("")}
      <filter id="${id}-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <linearGradient id="${id}-plane" x1="0" y1="0" x2="1" y2="1"><stop offset="0" class="ch7-cinema-plane-stop-a"/><stop offset="1" class="ch7-cinema-plane-stop-b"/></linearGradient>
      <linearGradient id="${id}-band" x1="0" y1="0" x2="1" y2="0"><stop offset="0" class="ch7-cinema-band-stop-a"/><stop offset=".5" class="ch7-cinema-band-stop-b"/><stop offset="1" class="ch7-cinema-band-stop-a"/></linearGradient>
    </defs>`;
  }

  function makePlane({ id, x, y, width, height, extent = 3, label = "", grid = true, unitCircle = false }) {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const sx = width / (extent * 2);
    const sy = height / (extent * 2);
    const p = ([vx, vy]) => [cx + vx * sx, cy - vy * sy];
    const gridLines = [];
    if (grid) {
      for (let value = Math.ceil(-extent); value <= Math.floor(extent); value += 1) {
        const [gx] = p([value, 0]);
        const [, gy] = p([0, value]);
        gridLines.push(`<line x1="${gx}" y1="${y}" x2="${gx}" y2="${y + height}" class="ch7-cinema-grid"/>`);
        gridLines.push(`<line x1="${x}" y1="${gy}" x2="${x + width}" y2="${gy}" class="ch7-cinema-grid"/>`);
      }
    }
    const base = `<g class="ch7-cinema-plane-group"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="24" fill="url(#${id}-plane)" class="ch7-cinema-plane-bg"/>${gridLines.join("")}<line x1="${x}" y1="${cy}" x2="${x + width}" y2="${cy}" class="ch7-cinema-axis"/><line x1="${cx}" y1="${y}" x2="${cx}" y2="${y + height}" class="ch7-cinema-axis"/>${unitCircle ? `<circle cx="${cx}" cy="${cy}" r="${Math.min(sx, sy)}" class="ch7-cinema-unit-circle"/>` : ""}${label ? `<text x="${x + 18}" y="${y + 28}" class="ch7-cinema-plane-label">${label}</text>` : ""}</g>`;
    const arrow = ({ from = [0, 0], to, role = "input", label: arrowLabel = "", dx = 10, dy = -10, dashed = false, thin = false, glow = false }) => {
      const [x1, y1] = p(from);
      const [x2, y2] = p(to);
      const labelX = x2 + dx;
      const labelY = y2 + dy;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="ch7-cinema-arrow is-${role}${dashed ? " is-dashed" : ""}${thin ? " is-thin" : ""}${glow ? " is-glow" : ""}" marker-end="url(#${id}-arrow-${role})"/>${arrowLabel ? `<text x="${labelX}" y="${labelY}" class="ch7-cinema-svg-label">${arrowLabel}</text>` : ""}`;
    };
    const line = ({ direction, role = "muted", width: strokeWidth = 2.5, dashed = false, opacity = 1 }) => {
      const d = normalize(direction);
      const length = extent * 1.5;
      const [x1, y1] = p([-d[0] * length, -d[1] * length]);
      const [x2, y2] = p([d[0] * length, d[1] * length]);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="ch7-cinema-subspace is-${role}${dashed ? " is-dashed" : ""}" style="stroke-width:${strokeWidth};opacity:${opacity}"/>`;
    };
    const point = ({ at, role = "input", r = 4, label: pointLabel = "", dx = 8, dy = -8, hollow = false }) => {
      const [px, py] = p(at);
      return `<circle cx="${px}" cy="${py}" r="${r}" class="ch7-cinema-point is-${role}${hollow ? " is-hollow" : ""}"/>${pointLabel ? `<text x="${px + dx}" y="${py + dy}" class="ch7-cinema-svg-label">${pointLabel}</text>` : ""}`;
    };
    const segment = ({ from, to, role = "muted", dashed = false, width: strokeWidth = 2 }) => {
      const [x1, y1] = p(from);
      const [x2, y2] = p(to);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="ch7-cinema-segment is-${role}${dashed ? " is-dashed" : ""}" style="stroke-width:${strokeWidth}"/>`;
    };
    const polygon = ({ points, role = "input", opacity = 0.16, stroke = true }) => `<polygon points="${points.map((item) => p(item).join(",")).join(" ")}" class="ch7-cinema-polygon is-${role}" style="fill-opacity:${opacity};${stroke ? "" : "stroke:none"}"/>`;
    const band = ({ direction, role = "accent", halfWidth = 0.25, opacity = 0.18 }) => {
      const d = normalize(direction);
      const n = [-d[1], d[0]];
      const length = extent * 1.5;
      const corners = [
        add(scale(-length, d), scale(halfWidth, n)),
        add(scale(length, d), scale(halfWidth, n)),
        add(scale(length, d), scale(-halfWidth, n)),
        add(scale(-length, d), scale(-halfWidth, n)),
      ];
      return `<polygon points="${corners.map((item) => p(item).join(",")).join(" ")}" class="ch7-cinema-band is-${role}" style="opacity:${opacity}"/>`;
    };
    return { p, base, arrow, line, point, segment, polygon, band, cx, cy, sx, sy, x, y, width, height, extent };
  }

  function svgFrame(id, content, { width = 900, height = 470, label = "数学可视化" } = {}) {
    return `<svg class="ch7-cinema-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid meet">${svgDefs(id)}${content}</svg>`;
  }

  function sceneLayout(svg, aside) {
    return `<div class="ch7-cinema-scene"><div class="ch7-cinema-canvas">${svg}</div>${aside}</div>`;
  }

  function renderLinearity(section, lesson) {
    if (!section) return;
    const rad = (deg) => deg * Math.PI / 180;
    const presets = [
      { name: "旋转", formula: "T(x)=R_{35^\\circ}x", apply: ([x, y]) => { const a = rad(35); return [Math.cos(a) * x - Math.sin(a) * y, Math.sin(a) * x + Math.cos(a) * y]; } },
      { name: "剪切", formula: "T(x,y)=(x+0.8y,y)", apply: ([x, y]) => [x + 0.8 * y, y] },
      { name: "投影", formula: "T(x,y)=(x,0)", apply: ([x]) => [x, 0] },
      { name: "平移", formula: "T(x,y)=(x+0.8,y-0.4)", apply: ([x, y]) => [x + 0.8, y - 0.4] },
      { name: "分量平方", formula: "T(x,y)=(x^2,y)", apply: ([x, y]) => [x * x, y] },
      { name: "绝对值折叠", formula: "T(x,y)=(|x|,y)", apply: ([x, y]) => [Math.abs(x), y] },
    ];
    const stages = [
      { id: "origin", step: "01", label: "原点快检" },
      { id: "add", step: "02", label: "加法平行四边形" },
      { id: "scale", step: "03", label: "数乘同一直线" },
    ];
    const state = { preset: 0, stage: "add", ux: 1.15, uy: 0.65, vx: -0.45, vy: 1.0, c: -1.2 };
    const shell = createLab(section, lesson, { subtitle: "把定义变成两张图：输入端先构造线性关系，输出端检查同一关系是否仍然闭合。", presets, stages, activeStage: state.stage });
    const b = binder();
    let cleanupRanges = () => {};

    const controlsForStage = () => state.stage === "origin" ? [] : state.stage === "add" ? [
      { label: "向量 u 的横坐标", key: "ux", min: -2, max: 2 },
      { label: "向量 u 的纵坐标", key: "uy", min: -2, max: 2 },
      { label: "向量 v 的横坐标", key: "vx", min: -2, max: 2 },
      { label: "向量 v 的纵坐标", key: "vy", min: -2, max: 2 },
    ] : [
      { label: "向量 u 的横坐标", key: "ux", min: -2, max: 2 },
      { label: "向量 u 的纵坐标", key: "uy", min: -2, max: 2 },
      { label: "标量 c", key: "c", min: -2, max: 2 },
    ];

    const draw = () => {
      const preset = presets[state.preset];
      const u = [state.ux, state.uy];
      const v = [state.vx, state.vy];
      const id = `ch7-linearity-${state.stage}`;
      if (state.stage === "origin") {
        const T0 = preset.apply([0, 0]);
        const pass = norm(T0) < 1e-7;
        const plane = makePlane({ id, x: 90, y: 35, width: 520, height: 380, extent: 2.6, label: "零向量必须固定" });
        const originMark = `<circle cx="${plane.cx}" cy="${plane.cy}" r="13" class="ch7-cinema-origin-ring ${pass ? "is-pass" : "is-fail"}"/><text x="${plane.cx + 18}" y="${plane.cy - 14}" class="ch7-cinema-svg-label">0</text>`;
        const arrow = pass ? `<text x="${plane.cx}" y="${plane.cy + 42}" text-anchor="middle" class="ch7-cinema-svg-caption is-success">T(0)=0，原点没有移动</text>` : plane.arrow({ to: T0, role: "danger", label: "T(0)", glow: true });
        const svg = svgFrame(id, `${plane.base}${originMark}${arrow}`, { width: 700, height: 450, label: "线性变换的零向量检验" });
        shell.scene.innerHTML = sceneLayout(svg, readout({ eyebrow: "必要条件", title: pass ? "通过第一关，但还不能证明线性" : "原点一旦移动，立即否定线性", formula: "T(0)\\stackrel{?}{=}0", text: pass ? "旋转、剪切、投影都会固定原点；接下来还要检查加法与数乘。" : "平移在最便宜的检查中已经失败，不必继续计算。", rows: [["当前 T(0)", vectorText(T0)], ["判定", pass ? "继续检查" : "非线性"]] }));
        shell.conclusion.innerHTML = conclusion({ tone: pass ? "warn" : "fail", title: pass ? "必要条件成立" : "原点条件失败", text: pass ? "固定原点不是充分条件。" : "一次失败足以否定线性。", formula: preset.formula });
        return;
      }

      const leftPlane = makePlane({ id, x: 25, y: 35, width: 390, height: 390, extent: 3.1, label: "输入空间 V" });
      const rightPlane = makePlane({ id, x: 485, y: 35, width: 390, height: 390, extent: 3.5, label: "输出空间 W" });
      let svgContent = leftPlane.base + rightPlane.base;
      if (state.stage === "add") {
        const uv = add(u, v);
        const Tu = preset.apply(u);
        const Tv = preset.apply(v);
        const Tuv = preset.apply(uv);
        const sum = add(Tu, Tv);
        const gap = norm(sub(Tuv, sum));
        const pass = gap < 1e-6;
        svgContent += [
          leftPlane.arrow({ to: u, role: "input", label: "u" }),
          leftPlane.arrow({ to: v, role: "accent", label: "v" }),
          leftPlane.arrow({ to: uv, role: "gold", label: "u+v", glow: true }),
          leftPlane.segment({ from: u, to: uv, role: "accent", dashed: true }),
          leftPlane.segment({ from: v, to: uv, role: "input", dashed: true }),
          rightPlane.arrow({ to: Tu, role: "input", label: "T(u)" }),
          rightPlane.arrow({ to: Tv, role: "accent", label: "T(v)" }),
          rightPlane.arrow({ to: sum, role: "success", label: "T(u)+T(v)", glow: pass }),
          rightPlane.arrow({ to: Tuv, role: "output", label: "T(u+v)", glow: pass }),
          rightPlane.segment({ from: Tu, to: sum, role: "accent", dashed: true }),
          rightPlane.segment({ from: Tv, to: sum, role: "input", dashed: true }),
          !pass ? rightPlane.arrow({ from: sum, to: Tuv, role: "danger", label: "缺口", thin: true, glow: true }) : "",
          `<path d="M430 225 C445 205 458 205 472 225" class="ch7-cinema-map-curve" marker-end="url(#${id}-arrow-muted)"/><text x="451" y="190" text-anchor="middle" class="ch7-cinema-svg-caption">T</text>`,
        ].join("");
        const svg = svgFrame(id, svgContent, { width: 900, height: 455, label: "线性变换保持向量加法的平行四边形实验" });
        shell.scene.innerHTML = sceneLayout(svg, readout({ eyebrow: "加法结构", title: pass ? "输出端的平行四边形仍然闭合" : "输出端出现了可见缺口", formula: "T(u+v)\\stackrel{?}{=}T(u)+T(v)", text: pass ? "蓝色与绿色箭头落在同一个终点。这一组输入通过加法检验。" : "红色缺口就是一个具体反例，不需要再做抽象猜测。", rows: [["T(u+v)", vectorText(Tuv)], ["T(u)+T(v)", vectorText(sum)], ["缺口长度", fmt(gap, 3)]] }));
        shell.conclusion.innerHTML = conclusion({ tone: pass ? "pass" : "fail", title: pass ? "这一组向量通过加法检验" : "找到加法反例", text: pass ? "定义要求对任意 u、v 都成立，继续尝试不同输入。" : "一次不闭合就足以否定线性。", formula: preset.formula });
      } else {
        const cu = scale(state.c, u);
        const Tu = preset.apply(u);
        const Tcu = preset.apply(cu);
        const cTu = scale(state.c, Tu);
        const gap = norm(sub(Tcu, cTu));
        const pass = gap < 1e-6;
        svgContent += [
          leftPlane.line({ direction: u, role: "muted", dashed: true }),
          leftPlane.arrow({ to: u, role: "input", label: "u" }),
          leftPlane.arrow({ to: cu, role: "gold", label: "cu", glow: true }),
          rightPlane.line({ direction: Tu, role: "muted", dashed: true }),
          rightPlane.arrow({ to: Tu, role: "input", label: "T(u)" }),
          rightPlane.arrow({ to: cTu, role: "success", label: "cT(u)", glow: pass }),
          rightPlane.arrow({ to: Tcu, role: "output", label: "T(cu)", glow: pass }),
          !pass ? rightPlane.arrow({ from: cTu, to: Tcu, role: "danger", label: "缺口", thin: true, glow: true }) : "",
          `<path d="M430 225 C445 205 458 205 472 225" class="ch7-cinema-map-curve" marker-end="url(#${id}-arrow-muted)"/><text x="451" y="190" text-anchor="middle" class="ch7-cinema-svg-caption">T</text>`,
        ].join("");
        const svg = svgFrame(id, svgContent, { width: 900, height: 455, label: "线性变换保持数乘的共线实验" });
        shell.scene.innerHTML = sceneLayout(svg, readout({ eyebrow: "数乘结构", title: pass ? "先缩放与后缩放得到同一箭头" : "缩放顺序改变了结果", formula: "T(cu)\\stackrel{?}{=}cT(u)", text: state.c < 0 ? "负标量会反转方向，最容易揭露绝对值折叠一类非线性。" : "改变 c，检查关系是否只在少数标量上偶然成立。", rows: [["标量 c", fmt(state.c)], ["T(cu)", vectorText(Tcu)], ["cT(u)", vectorText(cTu)], ["缺口长度", fmt(gap, 3)]] }));
        shell.conclusion.innerHTML = conclusion({ tone: pass ? "pass" : "fail", title: pass ? "这一组输入通过数乘检验" : "找到数乘反例", text: pass ? "还要与加法检验同时对所有输入成立。" : "映射没有保持线性组合。", formula: preset.formula });
      }
    };

    const rebuildControls = () => {
      cleanupRanges();
      cleanupRanges = mountRanges(shell.controls, controlsForStage(), state, draw);
    };
    b.on(shell.lab, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) {
        state.preset = Number(preset.dataset.preset);
        updateActiveButtons(shell.lab, "[data-preset]", preset);
        draw();
        return;
      }
      const stage = event.target.closest("[data-stage]");
      if (stage) {
        state.stage = stage.dataset.stage;
        updateActiveButtons(shell.lab, "[data-stage]", stage);
        rebuildControls();
        draw();
      }
    });
    rebuildControls();
    draw();
    return () => { cleanupRanges(); b.cleanup(); };
  }

  function transformPoints(A, points) { return points.map((point) => matVec(A, point)); }

  function renderOperator(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "旋转 + 剪切", T: [[0, -1], [1, 0]], S: [[1, 0.8], [0, 1]], note: "两步都可逆，但顺序通常不同" },
      { name: "投影 + 旋转", T: [[0, -1], [1, 0]], S: [[1, 0], [0, 0]], note: "投影会丢失信息" },
      { name: "缩放 + 反射", T: [[1.6, 0], [0, 0.7]], S: [[1, 0], [0, -1]], note: "这组对角作用恰好交换" },
    ];
    const stages = [
      { id: "sum", step: "01", label: "逐点相加 T+S" },
      { id: "TS", step: "02", label: "先 S 后 T" },
      { id: "ST", step: "03", label: "先 T 后 S" },
      { id: "inverse", step: "04", label: "倒序撤销" },
    ];
    const state = { preset: 0, stage: "TS", x1: 1.2, x2: 0.75 };
    const shell = createLab(section, lesson, { subtitle: "同样写着 T 和 S，逐点相加与先后复合是两种完全不同的几何过程。", presets, stages, activeStage: state.stage });
    const b = binder();
    const cleanupRanges = mountRanges(shell.controls, [
      { label: "探针向量 x₁", key: "x1", min: -2, max: 2 },
      { label: "探针向量 x₂", key: "x2", min: -2, max: 2 },
    ], state, () => draw());
    const baseShape = [[0, 0], [1.25, 0.15], [0.35, 1.05]];

    const drawMiniPlane = (id, x, label, A, vector, role, shapeRole) => {
      const plane = makePlane({ id, x, y: 62, width: 250, height: 300, extent: 2.5, label });
      const points = A ? transformPoints(A, baseShape) : baseShape;
      const v = A ? matVec(A, vector) : vector;
      return `${plane.base}${plane.polygon({ points, role: shapeRole, opacity: 0.18 })}${plane.arrow({ to: v, role, label: label === "输入" ? "x" : label, glow: label !== "输入" })}`;
    };

    const draw = () => {
      const preset = presets[state.preset];
      const x = [state.x1, state.x2];
      const Tx = matVec(preset.T, x);
      const Sx = matVec(preset.S, x);
      const TS = matMul(preset.T, preset.S);
      const ST = matMul(preset.S, preset.T);
      const TSx = matVec(TS, x);
      const STx = matVec(ST, x);
      const commute = norm(sub(TSx, STx)) < 1e-6;
      const id = `ch7-operator-${state.stage}`;
      if (state.stage === "sum") {
        const sum = add(Tx, Sx);
        const plane = makePlane({ id, x: 65, y: 30, width: 520, height: 400, extent: 3.3, label: "同一个输入，同时送入 T 与 S" });
        const svg = svgFrame(id, `${plane.base}${plane.arrow({ to: Tx, role: "input", label: "T(x)" })}${plane.arrow({ to: Sx, role: "accent", label: "S(x)" })}${plane.arrow({ to: sum, role: "success", label: "(T+S)(x)", glow: true })}${plane.segment({ from: Tx, to: sum, role: "accent", dashed: true })}${plane.segment({ from: Sx, to: sum, role: "input", dashed: true })}`, { width: 650, height: 465, label: "线性变换逐点相加的平行四边形" });
        shell.scene.innerHTML = sceneLayout(svg, readout({ eyebrow: "逐点相加", title: "两台机器同时读取同一个 x", formula: "(T+S)(x)=T(x)+S(x)", text: "这里没有先后顺序。先分别得到两个输出，再在陪域中做向量加法。", rows: [["T(x)", vectorText(Tx)], ["S(x)", vectorText(Sx)], ["和", vectorText(sum)]] }));
        shell.conclusion.innerHTML = conclusion({ tone: "neutral", title: "T+S 不是连续做两步", text: "平行四边形表示的是两个输出向量相加。", formula: "(T+S)(x)=T(x)+S(x)" });
        return;
      }

      if (state.stage === "inverse") {
        const invT = inv2(preset.T);
        const invS = inv2(preset.S);
        const recover = invT && invS ? matVec(invS, matVec(invT, TSx)) : null;
        const content = `${drawMiniPlane(id, 22, "输入", null, x, "input", "input")}${drawMiniPlane(id, 325, "S(x)", preset.S, x, "accent", "accent")}${drawMiniPlane(id, 628, "T(S(x))", TS, x, "output", "output")}<path d="M280 210 H310" class="ch7-cinema-process-arrow" marker-end="url(#${id}-arrow-muted)"/><text x="295" y="190" text-anchor="middle" class="ch7-cinema-svg-caption">S</text><path d="M583 210 H613" class="ch7-cinema-process-arrow" marker-end="url(#${id}-arrow-muted)"/><text x="598" y="190" text-anchor="middle" class="ch7-cinema-svg-caption">T</text><path d="M755 388 C590 450 330 450 145 388" class="ch7-cinema-reverse-arrow" marker-end="url(#${id}-arrow-${recover ? "success" : "danger"})"/><text x="450" y="448" text-anchor="middle" class="ch7-cinema-svg-caption">${recover ? "先 T⁻¹，再 S⁻¹" : "信息丢失，无法倒推"}</text>`;
        const svg = svgFrame(id, content, { width: 900, height: 470, label: "线性变换复合与倒序求逆" });
        shell.scene.innerHTML = sceneLayout(svg, readout({ eyebrow: "逆变换", title: recover ? "撤销必须按照相反顺序" : "其中一步丢失信息，整条链无法撤销", formula: "(T\\circ S)^{-1}=S^{-1}\\circ T^{-1}", text: recover ? "最后执行的 T 最先被撤销，然后才轮到 S。" : "投影把一整条方向压成同一点，之后再旋转也无法恢复原信息。", rows: [["T 可逆", invT ? "是" : "否"], ["S 可逆", invS ? "是" : "否"], ["恢复结果", recover ? vectorText(recover) : "不存在"]] }));
        shell.conclusion.innerHTML = conclusion({ tone: recover ? "pass" : "fail", title: recover ? "倒序撤销回到原输入" : "逆变换不存在", text: preset.note, formula: recover ? "S^{-1}T^{-1}TSx=x" : "\\det S=0" });
        return;
      }

      const firstA = state.stage === "TS" ? preset.S : preset.T;
      const secondA = state.stage === "TS" ? preset.T : preset.S;
      const firstLabel = state.stage === "TS" ? "S(x)" : "T(x)";
      const finalLabel = state.stage === "TS" ? "T(S(x))" : "S(T(x))";
      const first = matVec(firstA, x);
      const final = matVec(secondA, first);
      const content = `${drawMiniPlane(id, 22, "输入", null, x, "input", "input")}${drawMiniPlane(id, 325, firstLabel, firstA, x, "accent", "accent")}${drawMiniPlane(id, 628, finalLabel, matMul(secondA, firstA), x, "output", "output")}<path d="M280 210 H310" class="ch7-cinema-process-arrow" marker-end="url(#${id}-arrow-muted)"/><path d="M583 210 H613" class="ch7-cinema-process-arrow" marker-end="url(#${id}-arrow-muted)"/>`;
      const svg = svgFrame(id, content, { width: 900, height: 420, label: "线性变换复合的顺序实验" });
      shell.scene.innerHTML = sceneLayout(svg, readout({ eyebrow: "复合顺序", title: state.stage === "TS" ? "右边的 S 先作用" : "这次右边的 T 先作用", formula: state.stage === "TS" ? "(T\\circ S)(x)=T(S(x))" : "(S\\circ T)(x)=S(T(x))", text: "中间图形一旦不同，下一步接收到的输入就不同；因此最终形状和探针终点通常都会改变。", rows: [["当前终点", vectorText(final)], ["另一顺序", vectorText(state.stage === "TS" ? STx : TSx)], ["是否交换", commute ? "是（特殊）" : "否"]] }));
      shell.conclusion.innerHTML = conclusion({ tone: commute ? "warn" : "pass", title: commute ? "这组变换恰好交换" : "顺序确实改变结果", text: commute ? "这是特殊结构，不是一般规律。" : preset.note, formula: commute ? "TS=ST" : "TS\\ne ST" });
    };

    b.on(shell.lab, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { state.preset = Number(preset.dataset.preset); updateActiveButtons(shell.lab, "[data-preset]", preset); draw(); return; }
      const stage = event.target.closest("[data-stage]");
      if (stage) { state.stage = stage.dataset.stage; updateActiveButtons(shell.lab, "[data-stage]", stage); draw(); }
    });
    draw();
    return () => { cleanupRanges(); b.cleanup(); };
  }

  function renderMatrix(section, lesson) {
    if (!section) return;
    const A = [[2, 1], [1, 2]];
    const bases = [
      { name: "标准基", P: [[1, 0], [0, 1]], label: "E" },
      { name: "斜基", P: [[1, 1], [0, 1]], label: "B" },
      { name: "特征基", P: [[1, 1], [1, -1]], label: "V" },
    ];
    const stages = [
      { id: "col1", step: "01", label: "第一列来自 T(b₁)" },
      { id: "col2", step: "02", label: "第二列来自 T(b₂)" },
      { id: "rebuild", step: "03", label: "两列重建任意输入" },
    ];
    const state = { preset: 0, stage: "col1", a: 1.35, b: 0.7 };
    const shell = createLab(section, lesson, { subtitle: "矩阵不是突然出现的数字表。它把每个基向量的像依次装进列中。", presets: bases, stages, activeStage: state.stage });
    const b = binder();
    const cleanupRanges = mountRanges(shell.controls, [
      { label: "坐标 α", key: "a", min: -2, max: 2 },
      { label: "坐标 β", key: "b", min: -2, max: 2 },
    ], state, () => draw());

    const draw = () => {
      const basis = bases[state.preset];
      const P = basis.P;
      const Pinv = inv2(P);
      const Bmat = matMul(matMul(Pinv, A), P);
      const b1 = [P[0][0], P[1][0]];
      const b2 = [P[0][1], P[1][1]];
      const Tb1 = matVec(A, b1);
      const Tb2 = matVec(A, b2);
      const col1 = matVec(Pinv, Tb1);
      const col2 = matVec(Pinv, Tb2);
      const x = add(scale(state.a, b1), scale(state.b, b2));
      const Tx = matVec(A, x);
      const TxCoords = matVec(Bmat, [state.a, state.b]);
      const id = `ch7-matrix-${state.stage}`;
      const left = makePlane({ id, x: 25, y: 45, width: 390, height: 365, extent: 3.4, label: `输入基 ${basis.label}` });
      const right = makePlane({ id, x: 485, y: 45, width: 390, height: 365, extent: 4.2, label: "同一个几何变换 T" });
      let content = left.base + right.base + `<path d="M430 225 C445 205 458 205 472 225" class="ch7-cinema-map-curve" marker-end="url(#${id}-arrow-muted)"/><text x="451" y="190" text-anchor="middle" class="ch7-cinema-svg-caption">T</text>`;
      let title = "";
      let formula = "";
      let text = "";
      let rows = [];
      if (state.stage === "col1" || state.stage === "col2") {
        const index = state.stage === "col1" ? 0 : 1;
        const vector = index === 0 ? b1 : b2;
        const image = index === 0 ? Tb1 : Tb2;
        const column = index === 0 ? col1 : col2;
        content += left.line({ direction: b1, role: "input", opacity: index === 0 ? 0.8 : 0.28 }) + left.line({ direction: b2, role: "accent", opacity: index === 1 ? 0.8 : 0.28 });
        content += left.arrow({ to: vector, role: index === 0 ? "input" : "accent", label: `b${index + 1}`, glow: true });
        content += right.arrow({ to: image, role: "output", label: `T(b${index + 1})`, glow: true });
        title = `矩阵第 ${index + 1} 列就是 T(b${index + 1}) 的坐标`;
        formula = `T(b_${index + 1})=${fmt(column[0])}b_1+${fmt(column[1])}b_2`;
        text = "先把一个基向量送入 T，再用同一组输出基描述它的像；这组坐标直接进入相应矩阵列。";
        rows = [["当前列", vectorText(column)], ["完整矩阵", `[[${fmt(Bmat[0][0])}, ${fmt(Bmat[0][1])}], [${fmt(Bmat[1][0])}, ${fmt(Bmat[1][1])}]]`]];
      } else {
        content += left.line({ direction: b1, role: "input", opacity: 0.6 }) + left.line({ direction: b2, role: "accent", opacity: 0.6 });
        content += left.arrow({ to: b1, role: "input", label: "b₁" }) + left.arrow({ to: b2, role: "accent", label: "b₂" }) + left.arrow({ to: x, role: "gold", label: "x", glow: true });
        content += right.arrow({ to: Tb1, role: "input", label: "T(b₁)" }) + right.arrow({ to: Tb2, role: "accent", label: "T(b₂)" }) + right.arrow({ to: Tx, role: "output", label: "T(x)", glow: true });
        content += right.segment({ from: scale(state.a, Tb1), to: Tx, role: "accent", dashed: true }) + right.arrow({ to: scale(state.a, Tb1), role: "input", label: "αT(b₁)", thin: true });
        title = "两列一旦确定，任意输入只是在重组这两列";
        formula = "[T(x)]_B=[T]_B[x]_B";
        text = "线性把输入坐标 α、β 原封不动地带到输出组合中，因此无需逐点重新定义 T。";
        rows = [["输入坐标", `(${fmt(state.a)}, ${fmt(state.b)})`], ["几何 T(x)", vectorText(Tx)], ["矩阵算得坐标", vectorText(TxCoords)]];
      }
      const svg = svgFrame(id, content, { width: 900, height: 455, label: "线性变换矩阵的列与基向量的像" });
      shell.scene.innerHTML = sceneLayout(svg, readout({ eyebrow: `当前基 ${basis.name}`, title, formula, text, rows }));
      shell.conclusion.innerHTML = conclusion({ tone: basis.label === "V" ? "pass" : "neutral", title: basis.label === "V" ? "特征基让矩阵两列落在各自坐标轴上" : "矩阵记录随基改变，真实变换不变", text: basis.label === "V" ? "坐标不再混合，因此得到对角矩阵。" : "切换基时，空间中的箭头没有移动，只有描述数字改变。", formula: "[T]_B=P^{-1}AP" });
    };

    b.on(shell.lab, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { state.preset = Number(preset.dataset.preset); updateActiveButtons(shell.lab, "[data-preset]", preset); draw(); return; }
      const stage = event.target.closest("[data-stage]");
      if (stage) { state.stage = stage.dataset.stage; updateActiveButtons(shell.lab, "[data-stage]", stage); draw(); }
    });
    draw();
    return () => { cleanupRanges(); b.cleanup(); };
  }

  function eigenDirections(A) {
    const a = A[0][0], b = A[0][1], c = A[1][0], d = A[1][1];
    const disc = (a + d) ** 2 - 4 * (a * d - b * c);
    if (disc < -1e-9) return [];
    const root = Math.sqrt(Math.max(0, disc));
    const lambdas = [(a + d + root) / 2, (a + d - root) / 2];
    const result = [];
    lambdas.forEach((lambda) => {
      let v = Math.abs(b) > Math.abs(c) ? [b, lambda - a] : [lambda - d, c];
      if (norm(v) < EPS) v = [1, 0];
      v = normalize(v);
      let angle = Math.atan2(v[1], v[0]) * 180 / Math.PI;
      angle = ((angle % 180) + 180) % 180;
      if (!result.some((item) => Math.abs(item.angle - angle) < 0.5)) result.push({ lambda, angle, v });
    });
    return result;
  }

  function renderEigen(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "对称矩阵", A: [[2, 1], [1, 2]] },
      { name: "剪切", A: [[1, 1], [0, 1]] },
      { name: "反射", A: [[1, 0], [0, -1]] },
      { name: "90°旋转", A: [[0, -1], [1, 0]] },
    ];
    const state = { preset: 0, angle: 18 };
    const shell = createLab(section, lesson, { subtitle: "旋转候选方向。真正的特征方向不是某个点，而是一整条经过原点、变换后仍保持自身的直线。", presets });
    const b = binder();
    const cleanupRanges = mountRanges(shell.controls, [{ label: "扫描方向 θ", key: "angle", min: 0, max: 179, step: 1, suffix: "°", digits: 0 }], state, () => draw());

    const draw = () => {
      const preset = presets[state.preset];
      const theta = state.angle * Math.PI / 180;
      const v = [Math.cos(theta), Math.sin(theta)];
      const Av = matVec(preset.A, v);
      const error = norm(Av) < EPS ? 0 : Math.abs(cross2(v, Av)) / norm(Av);
      const lambda = dot(v, Av);
      const hit = error < 0.018;
      const dirs = eigenDirections(preset.A);
      const id = "ch7-eigen-compass";
      const plane = makePlane({ id, x: 70, y: 25, width: 500, height: 420, extent: 3.0, label: "方向罗盘", unitCircle: true });
      const ringTicks = Array.from({ length: 72 }, (_, index) => {
        const a = index * 2.5 * Math.PI / 180;
        const q = [Math.cos(a), Math.sin(a)];
        const Aq = matVec(preset.A, q);
        const e = norm(Aq) < EPS ? 0 : Math.abs(cross2(q, Aq)) / norm(Aq);
        const r1 = 1.08;
        const r2 = 1.08 + 0.22 * (1 - Math.min(1, e));
        const [x1, y1] = plane.p(scale(r1, q));
        const [x2, y2] = plane.p(scale(r2, q));
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="ch7-cinema-eigen-tick ${e < 0.025 ? "is-hit" : ""}"/>`;
      }).join("");
      const candidateLine = plane.line({ direction: v, role: hit ? "success" : "muted", width: hit ? 4 : 2.2, dashed: !hit, opacity: hit ? 1 : 0.75 });
      const content = `${plane.base}${ringTicks}${candidateLine}${plane.arrow({ to: v, role: "input", label: "v", glow: true })}${plane.arrow({ to: Av, role: "output", label: "Av", glow: hit })}<path d="M${plane.cx} ${plane.cy} m42 0 A42 42 0 0 0 ${plane.cx + 42 * Math.cos(Math.atan2(-Av[1], Av[0]))} ${plane.cy - 42 * Math.sin(Math.atan2(-Av[1], Av[0]))}" class="ch7-cinema-angle-arc"/>`;
      const svg = svgFrame(id, content, { width: 640, height: 470, label: "特征方向扫描罗盘" });
      const gates = `<div class="ch7-cinema-gates"><div class="is-pass"><span>1</span><strong>v 非零</strong><small>单位向量</small></div><div class="${hit ? "is-pass" : "is-fail"}"><span>2</span><strong>Av 与 v 共线</strong><small>误差 ${fmt(error, 4)}</small></div><div class="${hit ? "is-pass" : "is-wait"}"><span>3</span><strong>读取伸缩比</strong><small>${hit ? `λ=${fmt(lambda, 3)}` : "等待共线"}</small></div></div>`;
      const snaps = dirs.length ? `<div class="ch7-cinema-snap-row"><span>吸附到特征直线</span>${dirs.map((item) => `<button type="button" data-eigen-snap="${item.angle}">${fmt(item.angle, 0)}° · λ=${fmt(item.lambda)}</button>`).join("")}</div>` : `<div class="ch7-cinema-no-snap">实数域中没有可以吸附的一维特征方向</div>`;
      shell.scene.innerHTML = sceneLayout(svg, readout({ eyebrow: "特征方向判定", title: hit ? "两支箭头落在同一条直线上" : dirs.length ? "Av 正在离开候选直线" : "无论怎样扫描，Av 都会转离原直线", formula: "Av=\\lambda v", text: hit ? "箭头可以变长、缩短或反向；真正保持的是向量张成的一维子空间。" : dirs.length ? "拖动方向，寻找罗盘外圈最亮的低误差方向。" : "90° 旋转在实数平面没有一维不变方向，但在复数域仍可讨论特征值。", rows: [["当前角度", `${fmt(state.angle, 0)}°`], ["共线误差", fmt(error, 4)], ["实特征直线数", dirs.length]] }) + gates + snaps);
      shell.conclusion.innerHTML = conclusion({ tone: hit ? "pass" : dirs.length ? "warn" : "fail", title: hit ? "命中特征直线" : dirs.length ? "继续旋转候选方向" : "实数域没有特征直线", text: hit ? `Av=${fmt(lambda, 3)}v。` : dirs.length ? "罗盘亮刻度标出可能的特征方向。" : "这不是程序漏画，而是数域决定的结构事实。", formula: hit ? "Av=\\lambda v" : "\\det(A-\\lambda I)=0" });
    };

    let dragging = false;
    const setAngleFromPointer = (event) => {
      const svg = shell.scene.querySelector(".ch7-cinema-svg");
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width * 640;
      const y = (event.clientY - rect.top) / rect.height * 470;
      const dx = x - 320;
      const dy = 235 - y;
      let angle = Math.atan2(dy, dx) * 180 / Math.PI;
      angle = ((angle % 180) + 180) % 180;
      state.angle = Math.round(angle);
      const input = shell.controls.querySelector('[data-key="angle"]');
      const output = shell.controls.querySelector('[data-output="angle"]');
      if (input) input.value = state.angle;
      if (output) output.textContent = `${state.angle}°`;
      draw();
    };
    b.on(shell.scene, "pointerdown", (event) => { dragging = true; shell.scene.setPointerCapture?.(event.pointerId); setAngleFromPointer(event); });
    b.on(shell.scene, "pointermove", (event) => { if (dragging) setAngleFromPointer(event); });
    b.on(shell.scene, "pointerup", () => { dragging = false; });
    b.on(shell.scene, "pointercancel", () => { dragging = false; });
    b.on(shell.lab, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { state.preset = Number(preset.dataset.preset); state.angle = 18; updateActiveButtons(shell.lab, "[data-preset]", preset); const input = shell.controls.querySelector('[data-key="angle"]'); const output = shell.controls.querySelector('[data-output="angle"]'); if (input) input.value = state.angle; if (output) output.textContent = `${state.angle}°`; draw(); return; }
      const snap = event.target.closest("[data-eigen-snap]");
      if (snap) { state.angle = Number(snap.dataset.eigenSnap); const input = shell.controls.querySelector('[data-key="angle"]'); const output = shell.controls.querySelector('[data-output="angle"]'); if (input) input.value = state.angle; if (output) output.textContent = `${fmt(state.angle, 0)}°`; draw(); }
    });
    draw();
    return () => { cleanupRanges(); b.cleanup(); };
  }

  function renderDiagonal(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "对称可对角化", A: [[2, 1], [1, 2]], P: [[1, 1], [1, -1]], D: [[3, 0], [0, 1]], note: "两条正交特征方向" },
      { name: "非对称可对角化", A: [[3, 1], [0, 2]], P: [[1, -1], [0, 1]], D: [[3, 0], [0, 2]], note: "特征向量不必正交" },
      { name: "Jordan 块", A: [[2, 1], [0, 2]], P: null, D: null, note: "只有一条独立特征方向" },
    ];
    const stages = [
      { id: "decompose", step: "01", label: "沿特征方向分解 x" },
      { id: "scale", step: "02", label: "两个分量独立缩放" },
      { id: "recombine", step: "03", label: "重新合成为 Ax" },
    ];
    const state = { preset: 0, stage: "decompose", x1: 1.2, x2: 0.7, power: 3 };
    const shell = createLab(section, lesson, { subtitle: "对角化不是把真实向量搬到另一张图上，而是找到一组不会互相混合的方向。", presets, stages, activeStage: state.stage });
    const b = binder();
    const cleanupRanges = mountRanges(shell.controls, [
      { label: "输入 x₁", key: "x1", min: -2, max: 2 },
      { label: "输入 x₂", key: "x2", min: -2, max: 2 },
      { label: "矩阵幂 n", key: "power", min: 0, max: 6, step: 1, digits: 0 },
    ], state, () => draw());

    const draw = () => {
      const preset = presets[state.preset];
      const id = `ch7-diagonal-${state.stage}`;
      if (!preset.P) {
        const plane = makePlane({ id, x: 75, y: 35, width: 500, height: 390, extent: 2.8, label: "Jordan 块只有一条特征直线" });
        const x = [1.1, 1.0];
        const Ax = matVec(preset.A, x);
        const content = `${plane.base}${plane.line({ direction: [1, 0], role: "success", width: 4 })}${plane.arrow({ to: [1.4, 0], role: "success", label: "唯一特征方向", glow: true })}${plane.arrow({ to: x, role: "input", label: "第二个候选方向" })}${plane.arrow({ to: Ax, role: "output", label: "A(x)" })}`;
        const svg = svgFrame(id, content, { width: 650, height: 465, label: "不可对角化矩阵缺少第二条独立特征方向" });
        shell.scene.innerHTML = sceneLayout(svg, readout({ eyebrow: "对角化闸门", title: "平面需要两条线性无关特征方向，这里却只有一条", formula: "\\dim E_2=1<2", text: "这不是计算技巧不够，而是算子本身没有足够多的特征向量。Jordan 链将在后面补上缺失的方向。", rows: [["代数重数", 2], ["几何重数", 1], ["能否组成特征基", "不能"]] }));
        shell.conclusion.innerHTML = conclusion({ tone: "fail", title: "对角化在结构上失败", text: "不能伪造第二条特征方向。", formula: "A\\ne PDP^{-1}" });
        return;
      }
      const Pinv = inv2(preset.P);
      const x = [state.x1, state.x2];
      const coeff = matVec(Pinv, x);
      const v1 = [preset.P[0][0], preset.P[1][0]];
      const v2 = [preset.P[0][1], preset.P[1][1]];
      const c1v1 = scale(coeff[0], v1);
      const c2v2 = scale(coeff[1], v2);
      const s1 = scale(preset.D[0][0], c1v1);
      const s2 = scale(preset.D[1][1], c2v2);
      const Ax = add(s1, s2);
      const plane = makePlane({ id, x: 60, y: 30, width: 520, height: 410, extent: 4.0, label: "真实空间：始终是同一个 x 与 Ax" });
      let content = `${plane.base}${plane.line({ direction: v1, role: "input", width: 3.3, opacity: 0.8 })}${plane.line({ direction: v2, role: "accent", width: 3.3, opacity: 0.8 })}`;
      let title;
      let formula;
      let text;
      if (state.stage === "decompose") {
        content += plane.arrow({ to: c1v1, role: "input", label: "c₁v₁" }) + plane.arrow({ from: c1v1, to: x, role: "accent", label: "c₂v₂" }) + plane.arrow({ to: x, role: "gold", label: "x", glow: true });
        title = "先沿两条特征方向把 x 拆成两个分量";
        formula = "x=c_1v_1+c_2v_2";
        text = "P⁻¹ 计算的是这两个系数，它改变的是坐标记录，不是空间中的真实位置。";
      } else if (state.stage === "scale") {
        content += plane.arrow({ to: c1v1, role: "muted", label: "c₁v₁", dashed: true }) + plane.arrow({ from: c1v1, to: x, role: "muted", label: "c₂v₂", dashed: true }) + plane.arrow({ to: s1, role: "input", label: "λ₁c₁v₁", glow: true }) + plane.arrow({ to: s2, role: "accent", label: "λ₂c₂v₂", glow: true });
        title = "每个特征分量只沿自身方向伸缩";
        formula = "D(c_1,c_2)=(\\lambda_1c_1,\\lambda_2c_2)";
        text = "这是对角矩阵最重要的几何意义：两个方向互不混合。";
      } else {
        content += plane.arrow({ to: s1, role: "input", label: "λ₁c₁v₁" }) + plane.arrow({ from: s1, to: Ax, role: "accent", label: "λ₂c₂v₂" }) + plane.arrow({ to: Ax, role: "output", label: "Ax", glow: true }) + plane.arrow({ to: x, role: "gold", label: "x", dashed: true });
        title = "缩放后的两个分量重新合成真实输出 Ax";
        formula = "Ax=PDP^{-1}x";
        text = "P 只是把特征坐标翻译回原坐标；最终结果仍在同一个真实空间中。";
      }
      const APower = matPow(preset.A, state.power);
      const DPower = [[preset.D[0][0] ** state.power, 0], [0, preset.D[1][1] ** state.power]];
      const via = matMul(matMul(preset.P, DPower), Pinv);
      const error = matrixNorm(via.map((row, i) => row.map((value, j) => value - APower[i][j])));
      const svg = svgFrame(id, content, { width: 650, height: 465, label: "线性变换对角化的特征方向分解" });
      shell.scene.innerHTML = sceneLayout(svg, readout({ eyebrow: preset.note, title, formula, text, rows: [["特征坐标", vectorText(coeff)], ["特征值", `${fmt(preset.D[0][0])}, ${fmt(preset.D[1][1])}`], [`A^${state.power} 重构误差`, fmt(error, 6)]] }));
      shell.conclusion.innerHTML = conclusion({ tone: "pass", title: `A^${state.power} 只需分别计算两个特征方向的幂`, text: "复杂迭代被拆成两个独立的一维缩放。", formula: "A^n=PD^nP^{-1}" });
    };

    b.on(shell.lab, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { state.preset = Number(preset.dataset.preset); updateActiveButtons(shell.lab, "[data-preset]", preset); draw(); return; }
      const stage = event.target.closest("[data-stage]");
      if (stage) { state.stage = stage.dataset.stage; updateActiveButtons(shell.lab, "[data-stage]", stage); draw(); }
    });
    draw();
    return () => { cleanupRanges(); b.cleanup(); };
  }

  function rank2(A) {
    if (A.flat().every((value) => Math.abs(value) < EPS)) return 0;
    return Math.abs(det2(A)) > EPS ? 2 : 1;
  }
  function kernelDirection2(A) {
    if (rank2(A) !== 1) return null;
    const row = norm(A[0]) > EPS ? A[0] : A[1];
    return normalize([-row[1], row[0]]);
  }
  function imageDirection2(A) {
    if (rank2(A) !== 1) return null;
    const c1 = [A[0][0], A[1][0]];
    const c2 = [A[0][1], A[1][1]];
    return normalize(norm(c1) > EPS ? c1 : c2);
  }

  function renderKernelImage(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "满秩", A: [[1.3, 0.4], [-0.2, 1.1]], note: "没有非零隐形方向" },
      { name: "正交投影", A: [[1, 0], [0, 0]], note: "沿 y 轴移动不会改变输出" },
      { name: "秩一压缩", A: [[1, 1], [2, 2]], note: "整个平面压到一条斜直线" },
      { name: "零变换", A: [[0, 0], [0, 0]], note: "所有输入都变得不可区分" },
    ];
    const state = { preset: 1, x1: 1.15, x2: 0.75, fiber: 0.85 };
    const shell = createLab(section, lesson, { subtitle: "左边追踪哪些输入差异会消失，右边追踪所有可能到达的输出。核和值域是同一压缩现象的两面。", presets, activePreset: 1 });
    const b = binder();
    const cleanupRanges = mountRanges(shell.controls, [
      { label: "输入 x₁", key: "x1", min: -2, max: 2 },
      { label: "输入 x₂", key: "x2", min: -2, max: 2 },
      { label: "沿核方向展开", key: "fiber", min: 0.3, max: 1.4 },
    ], state, () => draw());

    const draw = () => {
      const preset = presets[state.preset];
      const A = preset.A;
      const rank = rank2(A);
      const nullity = 2 - rank;
      const kernel = kernelDirection2(A);
      const image = imageDirection2(A);
      const x = [state.x1, state.x2];
      const Ax = matVec(A, x);
      const id = "ch7-kernel-image";
      const left = makePlane({ id, x: 25, y: 40, width: 390, height: 380, extent: 3.2, label: "输入空间 V" });
      const right = makePlane({ id, x: 485, y: 40, width: 390, height: 380, extent: 3.2, label: "输出空间 W" });
      let content = left.base + right.base + `<path d="M430 225 C445 205 458 205 472 225" class="ch7-cinema-map-curve" marker-end="url(#${id}-arrow-muted)"/><text x="451" y="190" text-anchor="middle" class="ch7-cinema-svg-caption">T</text>`;
      const ts = [-2, -1, 0, 1, 2];
      if (kernel) {
        const fiberPoints = ts.map((t) => add(x, scale(t * state.fiber, kernel)));
        content += left.band({ direction: kernel, role: "danger", halfWidth: 0.12, opacity: 0.16 }) + left.line({ direction: kernel, role: "danger", dashed: true, width: 3 });
        content += fiberPoints.map((point, index) => left.point({ at: point, role: index === 2 ? "input" : "danger", r: index === 2 ? 5 : 3.5 })).join("");
        content += left.arrow({ to: x, role: "input", label: "x", glow: true });
        content += right.point({ at: Ax, role: "output", r: 7, label: "共同的像" });
        content += fiberPoints.map((point) => {
          const [sx, sy] = left.p(point);
          const [tx, ty] = right.p(Ax);
          return `<path d="M${sx} ${sy} C${sx + 70} ${sy},${tx - 70} ${ty},${tx} ${ty}" class="ch7-cinema-fiber-trail"/>`;
        }).join("");
      } else if (rank === 2) {
        content += left.arrow({ to: x, role: "input", label: "x", glow: true }) + right.arrow({ to: Ax, role: "output", label: "T(x)", glow: true });
        const samples = [[-1.7, -1.3], [-1.2, 1.4], [0.2, -1.6], [1.3, 1.2], [1.7, -0.4]];
        content += samples.map((point) => right.point({ at: matVec(A, point), role: "success", r: 3.2 })).join("");
      } else {
        const samples = [[-1.7, -1.3], [-1.2, 1.4], [0.2, -1.6], [1.3, 1.2], [1.7, -0.4]];
        content += samples.map((point) => left.point({ at: point, role: "danger", r: 3.2 })).join("");
        content += samples.map(() => right.point({ at: [0, 0], role: "output", r: 4.5 })).join("");
      }
      if (image) {
        content += right.band({ direction: image, role: "success", halfWidth: 0.13, opacity: 0.16 }) + right.line({ direction: image, role: "success", width: 4 });
        content += ts.map((t) => right.point({ at: scale(t * 0.65, image), role: "success", r: 3 })).join("");
      }
      const svg = svgFrame(id, content, { width: 900, height: 455, label: "线性变换的核、纤维和值域" });
      const kernelLabel = rank === 2 ? "{0}" : rank === 1 ? `span${vectorText(kernel)}` : "整个平面";
      const imageLabel = rank === 2 ? "整个平面" : rank === 1 ? `span${vectorText(image)}` : "{0}";
      shell.scene.innerHTML = sceneLayout(svg, readout({ eyebrow: "同一压缩的两面", title: preset.note, formula: "T(x+k)=T(x),\\quad k\\in\\ker T", text: kernel ? "红色纤维中的所有输入虽然彼此不同，却沿着核方向相差；输出端无法看见这种差异。" : rank === 2 ? "没有非零方向会完全消失，因此不同输入保持可区分。" : "所有方向都被压到零，输入空间的全部信息消失。", rows: [["ker T", kernelLabel], ["im T", imageLabel], ["维数账本", `2 = ${rank} + ${nullity}`]] }));
      shell.conclusion.innerHTML = conclusion({ tone: rank === 2 ? "pass" : rank === 1 ? "warn" : "fail", title: `rank T=${rank}，nullity T=${nullity}`, text: "核描述看不见的输入方向，值域描述真正能到达的输出。", formula: "\\dim V=\\operatorname{rank}T+\\operatorname{nullity}T" });
    };

    b.on(shell.lab, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { state.preset = Number(preset.dataset.preset); updateActiveButtons(shell.lab, "[data-preset]", preset); draw(); }
    });
    draw();
    return () => { cleanupRanges(); b.cleanup(); };
  }

  function renderInvariant(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "对称矩阵", A: [[2, 1], [1, 2]], dirs: [45, 135] },
      { name: "剪切", A: [[1, 1], [0, 1]], dirs: [0] },
      { name: "反射", A: [[1, 0], [0, -1]], dirs: [0, 90] },
      { name: "90°旋转", A: [[0, -1], [1, 0]], dirs: [] },
    ];
    const state = { preset: 0, angle: 20, mode: "line" };
    const shell = createLab(section, lesson, { subtitle: "不变子空间不是一支幸运箭头。必须检查 W 中许多样本的像是否仍然留在同一个 W 中。", presets });
    const b = binder();
    const cleanupRanges = mountRanges(shell.controls, [{ label: "候选直线角度", key: "angle", min: 0, max: 179, step: 1, suffix: "°", digits: 0 }], state, () => draw());

    const draw = () => {
      const preset = presets[state.preset];
      const id = "ch7-invariant";
      if (state.mode !== "line") {
        const formula = state.mode === "whole" ? "T(V)\\subseteq V" : "T(\\{0\\})=\\{0\\}";
        const title = state.mode === "whole" ? "整个空间永远是不变子空间" : "零子空间永远是不变子空间";
        const plane = makePlane({ id, x: 70, y: 35, width: 500, height: 390, extent: 2.7, label: state.mode === "whole" ? "W=V" : "W={0}" });
        const content = state.mode === "whole" ? `${plane.base}<rect x="${plane.x + 12}" y="${plane.y + 12}" width="${plane.width - 24}" height="${plane.height - 24}" rx="18" class="ch7-cinema-whole-space"/><text x="${plane.cx}" y="${plane.cy}" text-anchor="middle" class="ch7-cinema-big-symbol">V</text>` : `${plane.base}<circle cx="${plane.cx}" cy="${plane.cy}" r="18" class="ch7-cinema-origin-ring is-pass"/><text x="${plane.cx}" y="${plane.cy + 6}" text-anchor="middle" class="ch7-cinema-big-symbol">0</text>`;
        const svg = svgFrame(id, content, { width: 650, height: 465, label: title });
        shell.scene.innerHTML = sceneLayout(svg, readout({ eyebrow: "普遍情况", title, formula, text: state.mode === "whole" ? "任何线性变换的输出仍属于陪域中的整个空间；若讨论算子 T:V→V，这给出平凡不变子空间 V。" : "线性变换必满足 T(0)=0，因此 {0} 总被保持。", rows: [] }));
        shell.conclusion.innerHTML = conclusion({ tone: "pass", title, text: "真正有信息的是介于 {0} 与 V 之间的非平凡不变子空间。", formula });
        return;
      }
      const theta = state.angle * Math.PI / 180;
      const direction = [Math.cos(theta), Math.sin(theta)];
      const samples = [-1.7, -0.85, 0.45, 1.25].map((t) => scale(t, direction));
      const images = samples.map((point) => matVec(preset.A, point));
      const residuals = images.map((point) => Math.abs(cross2(direction, point)));
      const residual = Math.max(...residuals);
      const invariant = residual < 0.025;
      const Av = matVec(preset.A, direction);
      const complement = [-direction[1], direction[0]];
      const P = [[direction[0], complement[0]], [direction[1], complement[1]]];
      const B = matMul(matMul(inv2(P), preset.A), P);
      const plane = makePlane({ id, x: 65, y: 30, width: 520, height: 410, extent: 3.2, label: "候选子空间 W" });
      let content = `${plane.base}${plane.band({ direction, role: invariant ? "success" : "accent", halfWidth: 0.18, opacity: 0.18 })}${plane.line({ direction, role: invariant ? "success" : "accent", width: 4 })}`;
      samples.forEach((point, index) => {
        content += plane.point({ at: point, role: "input", r: 4 });
        content += plane.arrow({ from: point, to: images[index], role: residuals[index] < 0.025 ? "success" : "danger", thin: true });
        content += plane.point({ at: images[index], role: residuals[index] < 0.025 ? "success" : "danger", r: 4.5 });
      });
      content += plane.arrow({ to: direction, role: "input", label: "w" }) + plane.arrow({ to: Av, role: "output", label: "T(w)", glow: invariant });
      const svg = svgFrame(id, content, { width: 650, height: 465, label: "不变子空间的多样本检查" });
      const snapButtons = preset.dirs.length ? `<div class="ch7-cinema-snap-row"><span>已知不变直线</span>${preset.dirs.map((angle) => `<button type="button" data-invariant-snap="${angle}">${angle}°</button>`).join("")}</div>` : `<div class="ch7-cinema-no-snap">实数域中没有一维不变子空间</div>`;
      const universal = `<div class="ch7-cinema-universal-row"><button type="button" data-invariant-mode="whole">整个空间 V</button><button type="button" data-invariant-mode="zero">零子空间 {0}</button></div>`;
      shell.scene.innerHTML = sceneLayout(svg, readout({ eyebrow: "集合级检查", title: invariant ? "所有样本像都留在 W 中" : "至少一个样本像逃离 W", formula: "T(W)\\subseteq W", text: invariant ? "不要求每个向量保持不动，只要求它们的像仍属于同一个子空间。" : "红色短箭头展示了从 W 泄漏到补空间的分量。", rows: [["最大离开残差", fmt(residual, 4)], ["适配基左下角", fmt(B[1][0], 4)], ["是否不变", invariant ? "是" : "否"]] }) + snapButtons + universal);
      shell.conclusion.innerHTML = conclusion({ tone: invariant ? "pass" : preset.dirs.length ? "warn" : "fail", title: invariant ? "W 是不变子空间" : "W 不是不变子空间", text: invariant ? "适配基下矩阵左下角为 0，W 不会泄漏到补空间。" : preset.dirs.length ? "旋转 W，寻找所有样本像重新落回带状区域的方向。" : "90° 旋转在实数平面没有非平凡一维不变子空间。", formula: invariant ? "[T]_B=\\begin{bmatrix}* & *\\\\0 & *\\end{bmatrix}" : "T(W)\\not\\subseteq W" });
    };

    b.on(shell.lab, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { state.preset = Number(preset.dataset.preset); state.mode = "line"; updateActiveButtons(shell.lab, "[data-preset]", preset); draw(); return; }
      const snap = event.target.closest("[data-invariant-snap]");
      if (snap) { state.angle = Number(snap.dataset.invariantSnap); state.mode = "line"; const input = shell.controls.querySelector('[data-key="angle"]'); const output = shell.controls.querySelector('[data-output="angle"]'); if (input) input.value = state.angle; if (output) output.textContent = `${state.angle}°`; draw(); return; }
      const mode = event.target.closest("[data-invariant-mode]");
      if (mode) { state.mode = mode.dataset.invariantMode; draw(); }
    });
    draw();
    return () => { cleanupRanges(); b.cleanup(); };
  }

  function renderJordan(section, lesson) {
    if (!section) return;
    const structures = [
      { name: "两个 1×1 块", size: 2, split: true },
      { name: "J₂(λ)", size: 2, split: false },
      { name: "J₃(λ)", size: 3, split: false },
    ];
    const state = { preset: 1, mode: "N", lambda: 2, step: 0 };
    const shell = createLab(section, lesson, { subtitle: "先看几何失败：只有一条特征直线时，Jordan 块通过“缩放 + 沿特征方向剪切”记录缺失的信息。", presets: structures, activePreset: 1 });
    const b = binder();
    const cleanupRanges = mountRanges(shell.controls, [{ label: "特征值 λ", key: "lambda", min: -2, max: 3, step: 0.5 }], state, () => draw());

    const buildMatrices = () => {
      const spec = structures[state.preset];
      const J = zeroMatrix(spec.size);
      for (let i = 0; i < spec.size; i += 1) J[i][i] = state.lambda;
      if (!spec.split) for (let i = 0; i < spec.size - 1; i += 1) J[i][i + 1] = 1;
      const N = matAdd(J, matScale(-state.lambda, identity(spec.size)));
      return { spec, J, N };
    };

    const draw = () => {
      const { spec, J, N } = buildMatrices();
      const id = "ch7-jordan-geometry";
      const plane = makePlane({ id, x: 55, y: 30, width: 520, height: 410, extent: 3.1, label: state.mode === "N" ? "幂零部分 N：只保留链传递" : "完整 T=λI+N：缩放再剪切" });
      let content = plane.base;
      const e1 = [1, 0];
      const e2 = [0, 1];
      if (spec.split) {
        content += plane.line({ direction: e1, role: "input", width: 3.6 }) + plane.line({ direction: e2, role: "accent", width: 3.6 });
        content += plane.arrow({ to: state.mode === "N" ? [0, 0] : scale(state.lambda, e1), role: "input", label: state.mode === "N" ? "N(v₁)=0" : "T(v₁)=λv₁" });
        content += plane.arrow({ to: state.mode === "N" ? [0, 0] : scale(state.lambda, e2), role: "accent", label: state.mode === "N" ? "N(v₂)=0" : "T(v₂)=λv₂" });
      } else {
        const v1 = [1.35, 0];
        const v2 = [0.45, 1.25];
        content += plane.line({ direction: v1, role: "success", width: 4 });
        content += plane.arrow({ to: v1, role: "success", label: "v₁ 特征方向", glow: true });
        content += plane.arrow({ to: v2, role: "accent", label: spec.size === 2 ? "v₂ 广义方向" : "链尾方向" });
        if (state.mode === "N") {
          content += plane.arrow({ from: v2, to: v1, role: "output", label: "N", glow: true });
          content += `<path d="M${plane.p(v1)[0]} ${plane.p(v1)[1]} C${plane.p(v1)[0] - 45} ${plane.p(v1)[1] - 55},${plane.cx + 20} ${plane.cy - 45},${plane.cx} ${plane.cy}" class="ch7-cinema-reverse-arrow" marker-end="url(#${id}-arrow-muted)"/><text x="${plane.cx + 34}" y="${plane.cy - 54}" class="ch7-cinema-svg-caption">N(v₁)=0</text>`;
        } else {
          const Tv2 = add(scale(state.lambda, v2), v1);
          const Tv1 = scale(state.lambda, v1);
          content += plane.arrow({ to: Tv1, role: "input", label: "λv₁" }) + plane.arrow({ to: Tv2, role: "output", label: "λv₂+v₁", glow: true });
          content += plane.segment({ from: scale(state.lambda, v2), to: Tv2, role: "success", dashed: true, width: 3 });
          content += plane.arrow({ to: scale(state.lambda, v2), role: "accent", label: "λv₂", dashed: true, thin: true });
        }
      }
      const svg = svgFrame(id, content, { width: 650, height: 465, label: "Jordan 块的缩放与链传递几何" });
      const chainNodes = Array.from({ length: spec.size }, (_, index) => spec.size - index).map((n) => `<div class="${state.step === spec.size - n ? "is-active" : ""}"><strong>v${n}</strong><span>${n === 1 ? "特征向量" : "广义特征向量"}</span></div>`).join(`<i>N→</i>`);
      const chain = spec.split ? `<div class="ch7-cinema-chain"><div><strong>v₁</strong><span>N→0</span></div><div><strong>v₂</strong><span>N→0</span></div></div>` : `<div class="ch7-cinema-chain">${chainNodes}<i>N→</i><div class="is-zero"><strong>0</strong></div></div>`;
      const modeButtons = `<div class="ch7-cinema-mode-row"><button type="button" data-jordan-mode="N" class="${state.mode === "N" ? "is-active" : ""}">只看 N=T−λI</button><button type="button" data-jordan-mode="T" class="${state.mode === "T" ? "is-active" : ""}">看完整 T=λI+N</button><button type="button" data-jordan-step>沿链走一步</button><button type="button" data-jordan-reset>重置</button></div>`;
      const title = state.mode === "N" ? (spec.split ? "没有链耦合，N=0" : "N 只把链尾向前推一级") : (spec.split ? "只有 λ 倍缩放" : "完整 T 同时包含 λ 倍缩放与向前一级的剪切");
      const formula = state.mode === "N" ? "Nv_k=v_{k-1},\\quad Nv_1=0" : "Tv_k=\\lambda v_k+v_{k-1}";
      shell.scene.innerHTML = sceneLayout(svg, readout({ eyebrow: "Jordan 的几何意义", title, formula, text: state.mode === "N" ? "只有幂零部分会沿链最终到达 0；它测量的是偏离纯缩放的额外剪切。" : "当 λ≠0 时，完整 T 通常不会归零。它每次保留 λ 倍自身，同时叠加前一个链向量。", rows: [["链长", spec.split ? "1+1" : spec.size], ["幂零指数", spec.split ? 1 : spec.size], ["当前步", state.step]] }) + chain + modeButtons);
      shell.conclusion.innerHTML = conclusion({ tone: state.mode === "N" ? "warn" : "neutral", title, text: spec.split ? "相同特征值并不自动形成 Jordan 链。" : `最大链长 ${spec.size} 决定 (T−λI) 的必要指数。`, formula });
    };

    b.on(shell.lab, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { state.preset = Number(preset.dataset.preset); state.step = 0; updateActiveButtons(shell.lab, "[data-preset]", preset); draw(); return; }
      const mode = event.target.closest("[data-jordan-mode]");
      if (mode) { state.mode = mode.dataset.jordanMode; state.step = 0; draw(); return; }
      if (event.target.closest("[data-jordan-step]")) { const { spec } = buildMatrices(); state.step = Math.min(state.step + 1, spec.split ? 1 : spec.size); draw(); return; }
      if (event.target.closest("[data-jordan-reset]")) { state.step = 0; draw(); }
    });
    draw();
    return () => { cleanupRanges(); b.cleanup(); };
  }

  function polynomialEvaluate(A, coefficients) {
    let result = zeroMatrix(A.length);
    let power = identity(A.length);
    coefficients.forEach((coefficient) => {
      result = matAdd(result, matScale(coefficient, power));
      power = matMul(power, A);
    });
    return result;
  }

  function renderMinimal(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "diag(2,3)", A: [[2, 0], [0, 3]], candidates: [{ label: "t−2", c: [-2, 1] }, { label: "(t−2)(t−3)", c: [6, -5, 1] }, { label: "χ(t)", c: [6, -5, 1] }], minimal: "(t−2)(t−3)", characteristic: "(t−2)(t−3)", chain: [1, 1] },
      { name: "2I₂", A: [[2, 0], [0, 2]], candidates: [{ label: "t−2", c: [-2, 1] }, { label: "(t−2)²", c: [4, -4, 1] }, { label: "χ(t)", c: [4, -4, 1] }], minimal: "t−2", characteristic: "(t−2)²", chain: [1, 1] },
      { name: "J₂(2)", A: [[2, 1], [0, 2]], candidates: [{ label: "t−2", c: [-2, 1] }, { label: "(t−2)²", c: [4, -4, 1] }, { label: "χ(t)", c: [4, -4, 1] }], minimal: "(t−2)²", characteristic: "(t−2)²", chain: [2] },
      { name: "J₃(2)", A: [[2, 1, 0], [0, 2, 1], [0, 0, 2]], candidates: [{ label: "t−2", c: [-2, 1] }, { label: "(t−2)²", c: [4, -4, 1] }, { label: "(t−2)³", c: [-8, 12, -6, 1] }], minimal: "(t−2)³", characteristic: "(t−2)³", chain: [3] },
    ];
    const state = { preset: 0, candidate: 0 };
    const shell = createLab(section, lesson, { subtitle: "候选多项式不能只消掉一支箭头。它必须同时消掉一组基的所有方向，而且次数还要尽可能低。", presets });
    const b = binder();

    const draw = () => {
      const preset = presets[state.preset];
      const candidate = preset.candidates[state.candidate] || preset.candidates[0];
      const pA = polynomialEvaluate(preset.A, candidate.c);
      const outputs = identity(preset.A.length).map((_, index) => matVec(pA, identity(preset.A.length).map((row) => row[index])));
      const killed = outputs.map((output) => norm(output) < 1e-7);
      const isZero = killed.every(Boolean);
      const degree = candidate.c.length - 1;
      const minimalDegree = preset.minimal.includes("³") ? 3 : preset.minimal.includes("²") ? 2 : preset.minimal.includes(")(") ? 2 : 1;
      const id = "ch7-minimal-polynomial";
      const lanes = preset.chain.map((length, laneIndex) => {
        const y = 105 + laneIndex * 130;
        const nodes = Array.from({ length }, (_, index) => {
          const x = 150 + index * 120;
          const active = degree <= index;
          return `<circle cx="${x}" cy="${y}" r="25" class="ch7-cinema-chain-orbit ${active ? "is-alive" : "is-killed"}"/><text x="${x}" y="${y + 6}" text-anchor="middle" class="ch7-cinema-chain-text">v${length - index}</text>${index < length - 1 ? `<path d="M${x + 32} ${y} H${x + 88}" class="ch7-cinema-process-arrow" marker-end="url(#${id}-arrow-muted)"/>` : `<path d="M${x + 32} ${y} H${x + 88}" class="ch7-cinema-process-arrow" marker-end="url(#${id}-arrow-muted)"/><text x="${x + 110}" y="${y + 6}" class="ch7-cinema-chain-text">0</text>`}`;
        }).join("");
        return `<g>${nodes}<text x="70" y="${y + 6}" class="ch7-cinema-plane-label">链 ${laneIndex + 1}</text></g>`;
      }).join("");
      const basisLanes = outputs.map((output, index) => {
        const y = 300 + index * 55;
        return `<g><text x="90" y="${y + 5}" class="ch7-cinema-plane-label">e${index + 1}</text><path d="M130 ${y} H430" class="ch7-cinema-annihilation-track ${killed[index] ? "is-killed" : "is-alive"}"/><circle cx="430" cy="${y}" r="9" class="ch7-cinema-point ${killed[index] ? "is-success" : "is-danger"}"/><text x="452" y="${y + 5}" class="ch7-cinema-svg-label">${killed[index] ? "0" : vectorText(output)}</text></g>`;
      }).join("");
      const svg = svgFrame(id, `${lanes}<g transform="translate(0,-15)">${basisLanes}</g>`, { width: 650, height: 470, label: "最小多项式对所有基方向的全局消去" });
      const candidates = `<div class="ch7-cinema-candidates">${preset.candidates.map((item, index) => `<button type="button" data-minimal-candidate="${index}" class="${index === state.candidate ? "is-active" : ""}"><strong>p(t)=${item.label}</strong><span>次数 ${item.c.length - 1}</span></button>`).join("")}</div>`;
      shell.scene.innerHTML = sceneLayout(svg, readout({ eyebrow: "全空间检查", title: isZero ? (degree === minimalDegree ? "所有方向归零，并且次数已经最低" : "所有方向归零，但次数还可以降低") : killed.some(Boolean) ? "只消掉了部分方向" : "没有消掉任何基方向", formula: "p(T)=0", text: isZero ? "检查一组基已经足够：线性保证 p(T) 会消掉它们的全部线性组合。" : "只要还有一个基方向存活，p(T) 就不是零算子。", rows: [["当前候选", candidate.label], ["最小多项式", preset.minimal], ["特征多项式", preset.characteristic]] }) + candidates);
      shell.conclusion.innerHTML = conclusion({ tone: isZero && degree === minimalDegree ? "pass" : isZero ? "warn" : "fail", title: isZero && degree === minimalDegree ? "这就是最小多项式" : isZero ? "能湮灭，但次数不是最低" : "当前候选不是湮灭多项式", text: preset.chain.some((length) => length > 1) ? `最大 Jordan 链长 ${Math.max(...preset.chain)} 决定 (t−λ) 的必要指数。` : "不同特征值都必须被相应因子覆盖。", formula: "m_T(T)=0,\\quad m_T\\mid\\chi_T" });
    };

    b.on(shell.lab, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { state.preset = Number(preset.dataset.preset); state.candidate = 0; updateActiveButtons(shell.lab, "[data-preset]", preset); draw(); return; }
      const candidate = event.target.closest("[data-minimal-candidate]");
      if (candidate) { state.candidate = Number(candidate.dataset.minimalCandidate); draw(); }
    });
    draw();
    return () => b.cleanup();
  }

  const register = (id, interactive) => window.defineChapter7Renderer?.(id, { formal: formalRenderer, interactive });
  register("linear-map-definition", renderLinearity);
  register("linear-map-operations", renderOperator);
  register("matrix-of-linear-map", renderMatrix);
  register("eigenvalues-eigenvectors", renderEigen);
  register("diagonal-matrices", renderDiagonal);
  register("image-and-kernel", renderKernelImage);
  register("invariant-subspaces", renderInvariant);
  register("jordan-form-introduction", renderJordan);
  register("minimal-polynomial", renderMinimal);
})();
