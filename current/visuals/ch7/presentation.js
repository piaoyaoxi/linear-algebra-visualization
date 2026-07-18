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
  const matrixHtml = (A, digits = 2) => display(`\\begin{bmatrix}${A.map((row) => row.map((v) => fmt(v, digits)).join("&")).join("\\\\")}\\end{bmatrix}`);
  const vectorText = (v, digits = 2) => `(${v.map((value) => fmt(value, digits)).join(", ")})`;

  function renderFormal(formal, section) {
    if (!formal || !section?.formal) return;
    const data = section.formal;
    const concepts = section.concepts || [];
    formal.innerHTML = `
      <h2>${data.heading}</h2>
      <div class="ch7-formal">
        <div class="ch7-formal-opening">
          <div>
            <span class="ch7-eyebrow">本节先回答</span>
            <p class="ch7-formal-question">${section.question}</p>
          </div>
          <p class="ch7-formal-lead">${data.lead}</p>
        </div>
        ${concepts.length ? `<div class="ch7-concept-path">${concepts.map((item, i) => `<div><span>${String(i + 1).padStart(2, "0")}</span><strong>${item.label}</strong><p>${item.text}</p></div>`).join("")}</div>` : ""}
        ${data.formula ? `<div class="ch7-formula"><span>主公式</span>${display(data.formula)}</div>` : ""}
        <div class="ch7-definition-grid">
          ${(data.blocks || []).map((block, index) => `<article class="ch7-definition-card"><span class="ch7-card-index">${String(index + 1).padStart(2, "0")}</span><div><h3>${block.title}</h3><p>${block.body}</p></div></article>`).join("")}
        </div>
        ${data.note ? `<div class="ch7-note"><strong>边界提醒</strong><p>${data.note}</p></div>` : ""}
        ${data.bridge ? `<div class="ch7-bridge"><span>下一步</span><p>${data.bridge}</p></div>` : ""}
      </div>`;
  }

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

  function presetButtons(presets, activeIndex, attr = "preset") {
    return `<div class="ch7-preset-row" role="group" aria-label="选择案例">${presets.map((preset, index) => `<button type="button" class="${index === activeIndex ? "is-active" : ""}" data-${attr}="${index}">${preset.name}</button>`).join("")}</div>`;
  }

  function stageButtons(stages, active, attr = "stage") {
    return `<div class="ch7-stage-tabs" role="tablist">${stages.map((stage) => `<button type="button" role="tab" aria-selected="${stage.id === active}" class="${stage.id === active ? "is-active" : ""}" data-${attr}="${stage.id}"><span>${stage.step || ""}</span>${stage.label}</button>`).join("")}</div>`;
  }

  function rangeControl({ label, key, value, min, max, step = 0.1, suffix = "" }) {
    return `<label class="ch7-range"><span>${label}<output data-output="${key}">${fmt(value)}${suffix}</output></span><input type="range" data-range="${key}" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
  }

  function taskPanel(lesson) {
    const prompts = lesson.interactive?.prompts || [];
    return `<div class="ch7-task-panel">
      <div class="ch7-task-question"><span>实验问题</span><strong>${lesson.question}</strong><p>${lesson.interactive?.task || lesson.interactive?.description || ""}</p></div>
      ${prompts.length ? `<ol>${prompts.map((prompt) => `<li>${prompt}</li>`).join("")}</ol>` : ""}
    </div>`;
  }

  function labHeader(lesson, subtitle) {
    return `<div class="ch7-lab-head"><div><span class="ch7-lab-kicker">交互实验</span><h3>${lesson.interactive.title}</h3><p>${subtitle || lesson.interactive.description}</p></div></div>${taskPanel(lesson)}`;
  }

  function legend(items) {
    return `<div class="ch7-legend">${items.map((item) => `<span><i style="--legend:${item.color}"></i>${item.label}</span>`).join("")}</div>`;
  }

  function statusBanner({ tone = "neutral", title, text, formula = "" }) {
    return `<div class="ch7-status-banner is-${tone}"><div><span>${tone === "pass" ? "✓" : tone === "fail" ? "×" : tone === "warn" ? "!" : "→"}</span><strong>${title}</strong></div><p>${text}</p>${formula ? `<div>${inline(formula)}</div>` : ""}</div>`;
  }

  function metric(label, value, note = "") {
    return `<div class="ch7-metric"><span>${label}</span><strong>${value}</strong>${note ? `<small>${note}</small>` : ""}</div>`;
  }

  function svgPlane({ id, vectors = [], lines = [], points = [], segments = [], size = 360, extent = 3.2, circle = false, label = "坐标平面" }) {
    const center = size / 2;
    const unit = size / (extent * 2);
    const px = (x) => center + x * unit;
    const py = (y) => center - y * unit;
    const grid = [];
    for (let i = -Math.floor(extent); i <= Math.floor(extent); i += 1) {
      if (i === 0) continue;
      grid.push(`<line x1="${px(i)}" y1="0" x2="${px(i)}" y2="${size}" class="ch7-grid-line"/>`);
      grid.push(`<line x1="0" y1="${py(i)}" x2="${size}" y2="${py(i)}" class="ch7-grid-line"/>`);
    }
    const markerIds = vectors.map((_, i) => `${id}-arrow-${i}`);
    return `<svg class="ch7-plane" viewBox="0 0 ${size} ${size}" role="img" aria-label="${label}">
      <defs>${vectors.map((vector, i) => `<marker id="${markerIds[i]}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="${vector.color || "currentColor"}"/></marker>`).join("")}</defs>
      <rect x="0" y="0" width="${size}" height="${size}" rx="20" class="ch7-plane-bg"/>
      ${grid.join("")}
      <line x1="0" y1="${center}" x2="${size}" y2="${center}" class="ch7-axis"/>
      <line x1="${center}" y1="0" x2="${center}" y2="${size}" class="ch7-axis"/>
      ${circle ? `<circle cx="${center}" cy="${center}" r="${unit}" class="ch7-unit-circle"/>` : ""}
      ${lines.map((line) => { const d = normalize(line.direction || [1, 0]); const length = extent * 1.6; return `<line x1="${px(-d[0] * length)}" y1="${py(-d[1] * length)}" x2="${px(d[0] * length)}" y2="${py(d[1] * length)}" class="${line.className || "ch7-subspace-line"}" style="--line-color:${line.color || "var(--accent)"}"/>`; }).join("")}
      ${segments.map((segment) => `<line x1="${px(segment.from[0])}" y1="${py(segment.from[1])}" x2="${px(segment.to[0])}" y2="${py(segment.to[1])}" class="${segment.className || "ch7-segment"}" style="--line-color:${segment.color || "var(--accent)"}"/>`).join("")}
      ${vectors.map((vector, i) => `<line x1="${px(vector.from?.[0] || 0)}" y1="${py(vector.from?.[1] || 0)}" x2="${px(vector.to[0])}" y2="${py(vector.to[1])}" stroke="${vector.color || "var(--accent)"}" class="ch7-vector ${vector.className || ""}" marker-end="url(#${markerIds[i]})"/><circle cx="${px(vector.to[0])}" cy="${py(vector.to[1])}" r="4" fill="${vector.color || "var(--accent)"}"/>${vector.label ? `<text x="${px(vector.to[0]) + (vector.dx ?? 8)}" y="${py(vector.to[1]) + (vector.dy ?? -9)}" class="ch7-svg-label">${vector.label}</text>` : ""}`).join("")}
      ${points.map((point) => `<circle cx="${px(point.at[0])}" cy="${py(point.at[1])}" r="${point.radius || 4}" fill="${point.color || "var(--accent)"}" class="${point.className || ""}"/>${point.label ? `<text x="${px(point.at[0]) + 7}" y="${py(point.at[1]) - 7}" class="ch7-svg-label">${point.label}</text>` : ""}`).join("")}
    </svg>`;
  }

  function bindRanges(section, state, render) {
    const b = binder();
    section.querySelectorAll("[data-range]").forEach((input) => b.on(input, "input", () => {
      state[input.dataset.range] = Number(input.value);
      const output = section.querySelector(`[data-output="${input.dataset.range}"]`);
      if (output) output.textContent = fmt(Number(input.value));
      render();
    }));
    return () => b.cleanup();
  }

  function renderLinearity(section, lesson) {
    if (!section) return;
    const rad = (deg) => (deg * Math.PI) / 180;
    const presets = [
      { name: "旋转", formula: "T(x)=R_{35^\\circ}x", apply: ([x, y]) => { const a = rad(35); return [Math.cos(a) * x - Math.sin(a) * y, Math.sin(a) * x + Math.cos(a) * y]; } },
      { name: "剪切", formula: "T(x,y)=(x+0.8y,y)", apply: ([x, y]) => [x + 0.8 * y, y] },
      { name: "投影", formula: "T(x,y)=(x,0)", apply: ([x]) => [x, 0] },
      { name: "平移", formula: "T(x,y)=(x+0.8,y-0.4)", apply: ([x, y]) => [x + 0.8, y - 0.4] },
      { name: "分量平方", formula: "T(x,y)=(x^2,y)", apply: ([x, y]) => [x * x, y] },
      { name: "绝对值折叠", formula: "T(x,y)=(|x|,y)", apply: ([x, y]) => [Math.abs(x), y] },
    ];
    const stages = [{ id: "origin", step: "01", label: "原点快检" }, { id: "add", step: "02", label: "加法两条路径" }, { id: "scale", step: "03", label: "数乘两条路径" }];
    const state = { preset: 0, stage: "add", ux: 1.2, uy: 0.6, vx: -0.5, vy: 1.1, c: -1.2 };
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab ch7-linearity-lab">${labHeader(lesson, "不要先猜图形像不像线性；只比较同一输入的两条合法计算路径。")}${presetButtons(presets, state.preset)}${stageButtons(stages, state.stage)}<div data-linearity-workspace></div></div>`;
    const workspace = section.querySelector("[data-linearity-workspace]");
    const b = binder();
    const render = () => {
      const preset = presets[state.preset];
      const u = [state.ux, state.uy];
      const v = [state.vx, state.vy];
      const origin = preset.apply([0, 0]);
      let visual = "";
      let outcome = "";
      let controls = "";
      if (state.stage === "origin") {
        const pass = norm(origin) < 1e-7;
        visual = `<div class="ch7-workspace"><div class="ch7-canvas-card"><div class="ch7-canvas-title"><span>先看最便宜的必要条件</span><strong>零向量必须仍是零向量</strong></div>${svgPlane({ id: "lin-origin", vectors: [{ to: origin, color: "var(--ch7-c)", label: "T(0)" }], extent: 2.4 })}</div><aside class="ch7-insight-card"><span class="ch7-panel-kicker">原点快检</span>${display("T(0)\\stackrel{?}{=}0")}<div class="ch7-metrics">${metric("T(0)", vectorText(origin))}${metric("能否直接否定", pass ? "不能" : "能")}</div><p>通过原点检查只说明“还没有被淘汰”；要证明线性，仍需检查任意加法与任意数乘。</p></aside></div>`;
        outcome = statusBanner({ tone: pass ? "warn" : "fail", title: pass ? "通过必要条件，但还不能下结论" : "原点已经移动，立即判定非线性", text: pass ? "继续进入加法和数乘检验。" : "平移类映射在第一关就失败。", formula: preset.formula });
      } else if (state.stage === "add") {
        const left = preset.apply(add(u, v));
        const right = add(preset.apply(u), preset.apply(v));
        const error = sub(left, right);
        const pass = norm(error) < 1e-6;
        visual = `<div class="ch7-path-board"><div class="ch7-path-card"><span>路径 A · 先相加，再变换</span><div>${inline("u+v")}<i>→</i>${inline("T(u+v)")}</div><strong>${vectorText(left)}</strong></div><div class="ch7-path-equals">${pass ? "=" : "≠"}</div><div class="ch7-path-card"><span>路径 B · 先变换，再相加</span><div>${inline("T(u),T(v)")}<i>→</i>${inline("T(u)+T(v)")}</div><strong>${vectorText(right)}</strong></div></div><div class="ch7-workspace"><div class="ch7-canvas-card">${legend([{ color: "var(--ch7-a)", label: "路径 A" }, { color: "var(--ch7-b)", label: "路径 B" }, { color: "var(--danger)", label: "误差" }])}${svgPlane({ id: "lin-add", vectors: [{ to: left, color: "var(--ch7-a)", label: "A" }, { to: right, color: "var(--ch7-b)", label: "B" }, ...(!pass ? [{ from: right, to: left, color: "var(--danger)", label: "差" }] : [])], extent: 3.4 })}</div><aside class="ch7-insight-card"><span class="ch7-panel-kicker">加法闸门</span>${display("T(u+v)\\stackrel{?}{=}T(u)+T(v)")}<div class="ch7-metrics">${metric("路径 A", vectorText(left))}${metric("路径 B", vectorText(right))}${metric("误差长度", fmt(norm(error), 3))}</div><p>${pass ? "两个彩色终点完全重合。" : "红色误差箭头就是一个具体反例。"}</p></aside></div>`;
        controls = `<div class="ch7-control-dock">${rangeControl({ label: "u₁", key: "ux", value: state.ux, min: -2, max: 2 })}${rangeControl({ label: "u₂", key: "uy", value: state.uy, min: -2, max: 2 })}${rangeControl({ label: "v₁", key: "vx", value: state.vx, min: -2, max: 2 })}${rangeControl({ label: "v₂", key: "vy", value: state.vy, min: -2, max: 2 })}</div>`;
        outcome = statusBanner({ tone: pass ? "pass" : "fail", title: pass ? "这组向量通过加法检验" : "找到加法反例", text: pass ? "还要继续检查数乘，且定义要求对任意向量都成立。" : "一次失败足以否定线性。", formula: preset.formula });
      } else {
        const left = preset.apply(scale(state.c, u));
        const right = scale(state.c, preset.apply(u));
        const error = sub(left, right);
        const pass = norm(error) < 1e-6;
        visual = `<div class="ch7-path-board"><div class="ch7-path-card"><span>路径 A · 先数乘，再变换</span><div>${inline("cu")}<i>→</i>${inline("T(cu)")}</div><strong>${vectorText(left)}</strong></div><div class="ch7-path-equals">${pass ? "=" : "≠"}</div><div class="ch7-path-card"><span>路径 B · 先变换，再数乘</span><div>${inline("T(u)")}<i>→</i>${inline("cT(u)")}</div><strong>${vectorText(right)}</strong></div></div><div class="ch7-workspace"><div class="ch7-canvas-card">${legend([{ color: "var(--ch7-a)", label: "路径 A" }, { color: "var(--ch7-b)", label: "路径 B" }, { color: "var(--danger)", label: "误差" }])}${svgPlane({ id: "lin-scale", vectors: [{ to: left, color: "var(--ch7-a)", label: "A" }, { to: right, color: "var(--ch7-b)", label: "B" }, ...(!pass ? [{ from: right, to: left, color: "var(--danger)", label: "差" }] : [])], extent: 3.4 })}</div><aside class="ch7-insight-card"><span class="ch7-panel-kicker">数乘闸门</span>${display("T(cu)\\stackrel{?}{=}cT(u)")}<div class="ch7-metrics">${metric("标量 c", fmt(state.c))}${metric("路径 A", vectorText(left))}${metric("路径 B", vectorText(right))}${metric("误差长度", fmt(norm(error), 3))}</div><p>${state.c < 0 ? "负标量会把方向反向，正好能揭露绝对值一类折叠。" : "改变 c，检查规则是否只在少数标量上偶然成立。"}</p></aside></div>`;
        controls = `<div class="ch7-control-dock">${rangeControl({ label: "u₁", key: "ux", value: state.ux, min: -2, max: 2 })}${rangeControl({ label: "u₂", key: "uy", value: state.uy, min: -2, max: 2 })}${rangeControl({ label: "标量 c", key: "c", value: state.c, min: -2, max: 2 })}</div>`;
        outcome = statusBanner({ tone: pass ? "pass" : "fail", title: pass ? "这组输入通过数乘检验" : "找到数乘反例", text: pass ? "加法与数乘两关都要对任意输入成立。" : "一次失败足以否定线性。", formula: preset.formula });
      }
      workspace.innerHTML = `${visual}${controls}${outcome}`;
      bindRanges(workspace, state, render);
    };
    b.on(section, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { state.preset = Number(preset.dataset.preset); section.querySelectorAll("[data-preset]").forEach((el) => el.classList.toggle("is-active", el === preset)); render(); return; }
      const stage = event.target.closest("[data-stage]");
      if (stage) { state.stage = stage.dataset.stage; section.querySelectorAll("[data-stage]").forEach((el) => { el.classList.toggle("is-active", el === stage); el.setAttribute("aria-selected", String(el === stage)); }); render(); }
    });
    render();
    return () => b.cleanup();
  }

  function renderOperator(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "旋转 + 剪切", T: [[0, -1], [1, 0]], S: [[1, 0.8], [0, 1]], note: "两个可逆变换，顺序通常不同" },
      { name: "投影 + 旋转", T: [[0, -1], [1, 0]], S: [[1, 0], [0, 0]], note: "投影丢失信息，复合不可逆" },
      { name: "缩放 + 反射", T: [[1.6, 0], [0, 0.7]], S: [[1, 0], [0, -1]], note: "这组对角作用恰好交换" },
    ];
    const stages = [{ id: "sum", step: "01", label: "逐点相加" }, { id: "TS", step: "02", label: "先 S 后 T" }, { id: "ST", step: "03", label: "先 T 后 S" }, { id: "inverse", step: "04", label: "倒序撤销" }];
    const state = { preset: 0, stage: "TS", x1: 1.2, x2: 0.8 };
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab">${labHeader(lesson, "把“同时算两个输出”和“把输出交给下一个变换”分成不同场景，不让符号混在一起。")}${presetButtons(presets, 0)}${stageButtons(stages, state.stage)}<div data-operator-workspace></div></div>`;
    const workspace = section.querySelector("[data-operator-workspace]");
    const b = binder();
    const render = () => {
      const preset = presets[state.preset];
      const x = [state.x1, state.x2];
      const Tx = matVec(preset.T, x);
      const Sx = matVec(preset.S, x);
      const TSx = matVec(preset.T, Sx);
      const STx = matVec(preset.S, Tx);
      const TS = matMul(preset.T, preset.S);
      const ST = matMul(preset.S, preset.T);
      const commute = matrixNorm(TS.map((row, i) => row.map((v, j) => v - ST[i][j]))) < 1e-8;
      let main = "";
      if (state.stage === "sum") {
        const result = add(Tx, Sx);
        main = `<div class="ch7-workspace"><div class="ch7-canvas-card">${legend([{ color: "var(--ch7-a)", label: "T(x)" }, { color: "var(--ch7-b)", label: "S(x)" }, { color: "var(--ch7-c)", label: "(T+S)(x)" }])}${svgPlane({ id: "op-sum", vectors: [{ to: Tx, color: "var(--ch7-a)", label: "T(x)" }, { to: Sx, color: "var(--ch7-b)", label: "S(x)" }, { to: result, color: "var(--ch7-c)", label: "和" }], segments: [{ from: Tx, to: result, color: "var(--ch7-b)" }, { from: Sx, to: result, color: "var(--ch7-a)" }], extent: 3.3 })}</div><aside class="ch7-insight-card"><span class="ch7-panel-kicker">同一个输入，同时求值</span>${display("(T+S)(x)=T(x)+S(x)")}<div class="ch7-flow-line"><span>x</span><i>↙</i><span>T(x)</span><b>+</b><span>S(x)</span><i>→</i><strong>${vectorText(result)}</strong></div><p>这里没有先后顺序。两台“机器”都读取同一个 x，最后在陪域中把两个输出相加。</p></aside></div>${statusBanner({ tone: "neutral", title: "不要把 T+S 画成两步复合", text: "平行四边形表示的是输出向量相加。", formula: "(T+S)(x)=T(x)+S(x)" })}`;
      } else if (state.stage === "TS" || state.stage === "ST") {
        const first = state.stage === "TS" ? Sx : Tx;
        const final = state.stage === "TS" ? TSx : STx;
        const firstName = state.stage === "TS" ? "S" : "T";
        const secondName = state.stage === "TS" ? "T" : "S";
        main = `<div class="ch7-machine-pipeline"><div><span>输入</span><strong>x = ${vectorText(x)}</strong></div><i>→</i><div><span>第 1 步 · ${firstName}</span><strong>${vectorText(first)}</strong></div><i>→</i><div class="is-final"><span>第 2 步 · ${secondName}</span><strong>${vectorText(final)}</strong></div></div><div class="ch7-workspace"><div class="ch7-canvas-card">${legend([{ color: "var(--ch7-a)", label: "输入 x" }, { color: "var(--ch7-b)", label: "中间结果" }, { color: "var(--ch7-c)", label: "最终结果" }])}${svgPlane({ id: `op-${state.stage}`, vectors: [{ to: x, color: "var(--ch7-a)", label: "x" }, { to: first, color: "var(--ch7-b)", label: `${firstName}(x)` }, { to: final, color: "var(--ch7-c)", label: `${secondName}(${firstName}(x))` }], extent: 3.3 })}</div><aside class="ch7-insight-card"><span class="ch7-panel-kicker">复合从右向左读</span>${display(state.stage === "TS" ? "(T\\circ S)(x)=T(S(x))" : "(S\\circ T)(x)=S(T(x))")}<div class="ch7-metrics">${metric("当前终点", vectorText(final))}${metric("另一顺序终点", vectorText(state.stage === "TS" ? STx : TSx))}${metric("TS = ST ?", commute ? "是" : "否")}</div><p>${commute ? "这组变换恰好交换，但这不是一般规律。" : "同样两步，换序后中间结果改变，最终终点也改变。"}</p></aside></div>${statusBanner({ tone: commute ? "warn" : "pass", title: commute ? "特殊案例：两种顺序得到同一结果" : "顺序确实改变结果", text: preset.note, formula: state.stage === "TS" ? "TSx" : "STx" })}`;
      } else {
        const invT = inv2(preset.T);
        const invS = inv2(preset.S);
        const recover1 = invT ? matVec(invT, TSx) : null;
        const recover2 = recover1 && invS ? matVec(invS, recover1) : null;
        const reversible = Boolean(invT && invS);
        main = `<div class="ch7-machine-pipeline is-undo"><div><span>输入</span><strong>${vectorText(x)}</strong></div><i>→ S</i><div><span>中间</span><strong>${vectorText(Sx)}</strong></div><i>→ T</i><div><span>结果</span><strong>${vectorText(TSx)}</strong></div><i>→ T⁻¹</i><div><span>先撤销 T</span><strong>${recover1 ? vectorText(recover1) : "不可撤销"}</strong></div><i>→ S⁻¹</i><div class="is-final"><span>再撤销 S</span><strong>${recover2 ? vectorText(recover2) : "不可撤销"}</strong></div></div><div class="ch7-workspace"><div class="ch7-canvas-card">${svgPlane({ id: "op-inverse", vectors: [{ to: x, color: "var(--ch7-a)", label: "x" }, { to: TSx, color: "var(--ch7-c)", label: "TSx" }, ...(recover2 ? [{ to: recover2, color: "var(--success)", label: "恢复" }] : [])], extent: 3.3 })}</div><aside class="ch7-insight-card"><span class="ch7-panel-kicker">撤销顺序</span>${display("(T\\circ S)^{-1}=S^{-1}\\circ T^{-1}")}<div class="ch7-metrics">${metric("T 可逆", invT ? "是" : "否")}${metric("S 可逆", invS ? "是" : "否")}${metric("是否恢复 x", recover2 && norm(sub(recover2, x)) < 1e-7 ? "是" : "否")}</div><p>${reversible ? "最后做的 T 必须先撤销，然后才能撤销 S。" : "只要其中一步丢失信息，整个复合就无法完全倒推。"}</p></aside></div>${statusBanner({ tone: reversible ? "pass" : "fail", title: reversible ? "倒序撤销回到原输入" : "信息已经丢失，逆变换不存在", text: preset.note })}`;
      }
      workspace.innerHTML = `${main}<div class="ch7-control-dock">${rangeControl({ label: "输入 x₁", key: "x1", value: state.x1, min: -2, max: 2 })}${rangeControl({ label: "输入 x₂", key: "x2", value: state.x2, min: -2, max: 2 })}</div>`;
      bindRanges(workspace, state, render);
    };
    b.on(section, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { state.preset = Number(preset.dataset.preset); section.querySelectorAll("[data-preset]").forEach((el) => el.classList.toggle("is-active", el === preset)); render(); return; }
      const stage = event.target.closest("[data-stage]");
      if (stage) { state.stage = stage.dataset.stage; section.querySelectorAll("[data-stage]").forEach((el) => el.classList.toggle("is-active", el === stage)); render(); }
    });
    render();
    return () => b.cleanup();
  }

  function renderBasis(section, lesson) {
    if (!section) return;
    const A = [[2, 1], [1, 2]];
    const bases = [
      { name: "标准基", P: [[1, 0], [0, 1]], label: "E" },
      { name: "斜基", P: [[1, 1], [0, 1]], label: "B" },
      { name: "特征基", P: [[1, 1], [1, -1]], label: "V" },
    ];
    const stages = [{ id: "col1", step: "01", label: "送入第 1 个基向量" }, { id: "col2", step: "02", label: "送入第 2 个基向量" }, { id: "rebuild", step: "03", label: "用两列重建任意向量" }];
    const state = { preset: 0, stage: "col1", a: 1.4, b: 0.7 };
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab">${labHeader(lesson, "先亲手把基向量的像装进矩阵两列，再讨论换基；这样矩阵不是凭空出现的。")}${presetButtons(bases, 0)}${stageButtons(stages, state.stage)}<div data-basis-workspace></div></div>`;
    const workspace = section.querySelector("[data-basis-workspace]");
    const b = binder();
    const render = () => {
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
      const coords = [state.a, state.b];
      const TxCoords = matVec(Bmat, coords);
      const active = state.stage === "col1" ? 0 : state.stage === "col2" ? 1 : -1;
      const focusVector = active === 0 ? b1 : b2;
      const focusImage = active === 0 ? Tb1 : Tb2;
      const focusCol = active === 0 ? col1 : col2;
      const planeVectors = state.stage === "rebuild" ? [
        { to: b1, color: "var(--ch7-a)", label: "b₁" }, { to: b2, color: "var(--ch7-b)", label: "b₂" },
        { to: x, color: "var(--ch7-d)", label: "x" }, { to: Tx, color: "var(--ch7-c)", label: "T(x)" },
      ] : [
        { to: focusVector, color: "var(--ch7-a)", label: active === 0 ? "b₁" : "b₂" },
        { to: focusImage, color: "var(--ch7-c)", label: active === 0 ? "T(b₁)" : "T(b₂)" },
      ];
      const explanation = state.stage === "rebuild"
        ? `<span class="ch7-panel-kicker">线性组合自动带动</span>${display(`[x]_${basis.label}=\\begin{bmatrix}${fmt(state.a)}\\\\${fmt(state.b)}\\end{bmatrix},\\qquad [T(x)]_${basis.label}=[T]_${basis.label}[x]_${basis.label}`)}<div class="ch7-metrics">${metric("几何 x", vectorText(x))}${metric("几何 T(x)", vectorText(Tx))}${metric("坐标结果", vectorText(TxCoords))}</div><p>两列一旦确定，任意输入都只是把这两列按坐标系数重新组合。</p>`
        : `<span class="ch7-panel-kicker">矩阵的第 ${active + 1} 列</span>${display(`T(b_${active + 1})=${fmt(focusCol[0])}b_1+${fmt(focusCol[1])}b_2`)}<div class="ch7-column-builder"><div class="${active === 0 ? "is-active" : ""}"><span>第 1 列</span><strong>${matrixHtml(col1.map((v) => [v]))}</strong></div><div class="${active === 1 ? "is-active" : ""}"><span>第 2 列</span><strong>${matrixHtml(col2.map((v) => [v]))}</strong></div></div><p>先送入基向量，再把像用同一组基表示；得到的坐标列就是矩阵的一列。</p>`;
      workspace.innerHTML = `<div class="ch7-workspace"><div class="ch7-canvas-card"><div class="ch7-canvas-title"><span>同一几何空间</span><strong>换基只改变坐标网格，不移动真实箭头</strong></div>${svgPlane({ id: "basis-builder", vectors: planeVectors, lines: [{ direction: b1, color: "color-mix(in srgb,var(--ch7-a) 45%,transparent)" }, { direction: b2, color: "color-mix(in srgb,var(--ch7-b) 45%,transparent)" }], extent: 3.5 })}</div><aside class="ch7-insight-card"><span class="ch7-panel-kicker">当前基下的完整记录</span><div class="ch7-matrix-focus"><strong>[T]${basis.label === "E" ? "ₑ" : `_${basis.label}`}</strong>${matrixHtml(Bmat)}</div>${explanation}<div class="ch7-matrix-identity">${inline("[T]_{B}=P^{-1}AP")}</div></aside></div>${state.stage === "rebuild" ? `<div class="ch7-control-dock">${rangeControl({ label: "坐标 α", key: "a", value: state.a, min: -2, max: 2 })}${rangeControl({ label: "坐标 β", key: "b", value: state.b, min: -2, max: 2 })}</div>` : ""}${statusBanner({ tone: basis.label === "V" ? "pass" : "neutral", title: basis.label === "V" ? "特征基让两列各自落在坐标轴上" : "矩阵的列来自基向量的像", text: basis.label === "V" ? "因此表示矩阵没有坐标混合，成为对角矩阵。" : "切换基后矩阵记录改变，但 T 和空间中的向量没有改变。" })}`;
      bindRanges(workspace, state, render);
    };
    b.on(section, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { state.preset = Number(preset.dataset.preset); section.querySelectorAll("[data-preset]").forEach((el) => el.classList.toggle("is-active", el === preset)); render(); return; }
      const stage = event.target.closest("[data-stage]");
      if (stage) { state.stage = stage.dataset.stage; section.querySelectorAll("[data-stage]").forEach((el) => el.classList.toggle("is-active", el === stage)); render(); }
    });
    render();
    return () => b.cleanup();
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
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab">${labHeader(lesson, "把“方向不变”画成一条候选直线：v 与 Av 只要都落在线上，就命中特征方向。")}${presetButtons(presets, 0)}<div data-eigen-workspace></div></div>`;
    const workspace = section.querySelector("[data-eigen-workspace]");
    const b = binder();
    const render = () => {
      const preset = presets[state.preset];
      const theta = state.angle * Math.PI / 180;
      const v = [Math.cos(theta), Math.sin(theta)];
      const Av = matVec(preset.A, v);
      const error = norm(Av) < EPS ? 0 : Math.abs(cross2(v, Av)) / norm(Av);
      const lambda = dot(v, Av);
      const hit = error < 0.018;
      const dirs = eigenDirections(preset.A);
      const samples = Array.from({ length: 37 }, (_, i) => {
        const a = i * 5 * Math.PI / 180;
        const q = [Math.cos(a), Math.sin(a)];
        const Aq = matVec(preset.A, q);
        return norm(Aq) < EPS ? 0 : Math.abs(cross2(q, Aq)) / norm(Aq);
      });
      const max = Math.max(...samples, 0.001);
      const bars = samples.map((value, i) => `<i style="height:${8 + 34 * value / max}px" class="${value < 0.025 ? "is-hit" : ""}" title="${i * 5}°"></i>`).join("");
      workspace.innerHTML = `<div class="ch7-workspace"><div class="ch7-canvas-card">${legend([{ color: "var(--ch7-a)", label: "候选 v" }, { color: "var(--ch7-c)", label: "像 Av" }, { color: "var(--success)", label: "候选直线 span(v)" }])}${svgPlane({ id: "eigen", vectors: [{ to: v, color: "var(--ch7-a)", label: "v" }, { to: Av, color: "var(--ch7-c)", label: "Av" }], lines: [{ direction: v, color: hit ? "var(--success)" : "var(--ch7-muted)" }], circle: true, extent: 3.2 })}<div class="ch7-direction-map"><div>${bars}</div><span>0°</span><strong>方向偏转谱：越矮越接近特征方向</strong><span>180°</span></div></div><aside class="ch7-insight-card"><span class="ch7-panel-kicker">三道判定</span><div class="ch7-gate-list"><div class="is-pass"><span>1</span><p><strong>v ≠ 0</strong>当前是单位向量</p></div><div class="${hit ? "is-pass" : "is-fail"}"><span>2</span><p><strong>Av 与 v 共线</strong>归一化叉积误差 ${fmt(error, 4)}</p></div><div class="${hit ? "is-pass" : "is-wait"}"><span>3</span><p><strong>读取 λ</strong>${hit ? `λ = ${fmt(lambda, 3)}` : "先命中特征直线"}</p></div></div>${display("Av=\\lambda v")}<p>${dirs.length ? `当前矩阵在实数域有 ${dirs.length} 条不同特征直线。` : "当前矩阵在实数域没有一维特征方向。"}</p><div class="ch7-snap-row">${dirs.length ? dirs.map((item) => `<button type="button" data-eigen-snap="${item.angle}">${fmt(item.angle)}° · λ=${fmt(item.lambda)}</button>`).join("") : `<span>没有可吸附的实特征方向</span>`}</div></aside></div><div class="ch7-control-dock">${rangeControl({ label: "扫描角 θ（度）", key: "angle", value: state.angle, min: 0, max: 179, step: 1 })}</div>${statusBanner({ tone: hit ? "pass" : dirs.length ? "warn" : "fail", title: hit ? "命中特征直线" : dirs.length ? "仍在偏转：继续扫描" : "实数域没有特征直线", text: hit ? `Av=${fmt(lambda, 3)}v；箭头可反向，但所在直线保持。` : dirs.length ? "观察偏转谱的低谷，或使用吸附按钮。" : "复数域中仍可研究它的特征值。" })}`;
      bindRanges(workspace, state, render);
    };
    b.on(section, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { state.preset = Number(preset.dataset.preset); section.querySelectorAll("[data-preset]").forEach((el) => el.classList.toggle("is-active", el === preset)); state.angle = 18; render(); return; }
      const snap = event.target.closest("[data-eigen-snap]");
      if (snap) { state.angle = Number(snap.dataset.eigenSnap); render(); const input = workspace.querySelector('[data-range="angle"]'); if (input) input.value = state.angle; }
    });
    render();
    return () => b.cleanup();
  }

  function renderDiagonal(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "对称可对角化", A: [[2, 1], [1, 2]], P: [[1, 1], [1, -1]], D: [[3, 0], [0, 1]], note: "两条正交特征直线" },
      { name: "非对称可对角化", A: [[3, 1], [0, 2]], P: [[1, -1], [0, 1]], D: [[3, 0], [0, 2]], note: "特征向量不必正交" },
      { name: "Jordan 块", A: [[2, 1], [0, 2]], P: null, D: null, note: "只有一条独立特征直线" },
    ];
    const stages = [{ id: "toEigen", step: "01", label: "P⁻¹：换到特征坐标" }, { id: "scale", step: "02", label: "D：各轴独立缩放" }, { id: "back", step: "03", label: "P：回到原坐标" }];
    const state = { preset: 0, stage: "toEigen", power: 3, x1: 1.2, x2: 0.7 };
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab">${labHeader(lesson, "把 A=PDP⁻¹ 拆成三次可见操作；若特征向量凑不成基，第一步就无法开始。")}${presetButtons(presets, 0)}${stageButtons(stages, state.stage)}<div data-diagonal-workspace></div></div>`;
    const workspace = section.querySelector("[data-diagonal-workspace]");
    const b = binder();
    const render = () => {
      const preset = presets[state.preset];
      const diagonalizable = Boolean(preset.P && preset.D);
      if (!diagonalizable) {
        workspace.innerHTML = `<div class="ch7-failure-stage"><div class="ch7-canvas-card">${svgPlane({ id: "diag-fail", vectors: [{ to: [1, 0], color: "var(--ch7-a)", label: "唯一特征方向" }, { to: [1, 1], color: "var(--ch7-d)", label: "缺少第二方向" }], lines: [{ direction: [1, 0], color: "var(--success)" }], extent: 2.6 })}</div><aside class="ch7-insight-card"><span class="ch7-panel-kicker">对角化闸门</span><h4>需要 2 个线性无关特征向量</h4><div class="ch7-gate-list"><div class="is-pass"><span>1</span><p><strong>特征多项式分裂</strong>只有特征值 λ=2</p></div><div class="is-fail"><span>2</span><p><strong>特征空间维数</strong>只有 1，无法组成平面的一组基</p></div></div>${display("A\\ne PDP^{-1}")}</aside></div>${statusBanner({ tone: "fail", title: "不是计算失败，而是特征向量数量不足", text: "这正是下一节 Jordan 结构要修补的问题。" })}`;
        return;
      }
      const Pinv = inv2(preset.P);
      const x = [state.x1, state.x2];
      const y = matVec(Pinv, x);
      const Dy = matVec(preset.D, y);
      const Ax = matVec(preset.P, Dy);
      const currentLabel = state.stage === "toEigen" ? "特征坐标 y=P⁻¹x" : state.stage === "scale" ? "独立缩放 Dy" : "原坐标 Ax=P(Dy)";
      const v1 = [preset.P[0][0], preset.P[1][0]];
      const v2 = [preset.P[0][1], preset.P[1][1]];
      const APower = matPow(preset.A, state.power);
      const DPower = [[preset.D[0][0] ** state.power, 0], [0, preset.D[1][1] ** state.power]];
      const via = matMul(matMul(preset.P, DPower), Pinv);
      const stageFormula = state.stage === "toEigen"
        ? "y=P^{-1}x"
        : state.stage === "scale"
          ? "z=Dy"
          : "Ax=Pz=PDP^{-1}x";
      const stageText = state.stage === "toEigen"
        ? "这里只是在翻译坐标：真实向量 x 没有被 P⁻¹ 几何地移动。"
        : state.stage === "scale"
          ? "在特征坐标里，两个分量互不混合，只分别乘以对应特征值。"
          : "最后把缩放后的特征坐标翻译回原坐标，得到真实输出 Ax。";
      workspace.innerHTML = `<div class="ch7-translation-steps"><div class="${state.stage === "toEigen" ? "is-active" : ""}"><span>P⁻¹</span><p>翻译：原坐标 → 特征坐标</p><strong>${vectorText(y)}</strong></div><i>→</i><div class="${state.stage === "scale" ? "is-active" : ""}"><span>D</span><p>作用：各特征分量独立缩放</p><strong>${vectorText(Dy)}</strong></div><i>→</i><div class="${state.stage === "back" ? "is-active" : ""}"><span>P</span><p>翻译：特征坐标 → 原坐标</p><strong>${vectorText(Ax)}</strong></div></div><div class="ch7-workspace"><div class="ch7-canvas-card"><div class="ch7-canvas-title"><span>真实空间</span><strong>坐标翻译发生在数字记录里；空间中只比较 x 与 Ax</strong></div>${legend([{ color: "var(--ch7-d)", label: "输入 x" }, { color: "var(--ch7-c)", label: "最终输出 Ax" }, { color: "var(--ch7-a)", label: "特征方向 v₁" }, { color: "var(--ch7-b)", label: "特征方向 v₂" }])}${svgPlane({ id: "diag", vectors: [{ to: x, color: "var(--ch7-d)", label: "x" }, { to: Ax, color: "var(--ch7-c)", label: "Ax" }], lines: [{ direction: v1, color: "var(--ch7-a)" }, { direction: v2, color: "var(--ch7-b)" }], extent: 4 })}</div><aside class="ch7-insight-card"><span class="ch7-panel-kicker">当前只看这一步</span><h4>${currentLabel}</h4>${display(stageFormula)}<p>${stageText}</p><div class="ch7-matrix-triple"><div><span>P⁻¹ · 翻译进去</span>${matrixHtml(Pinv)}</div><div><span>D · 真正缩放</span>${matrixHtml(preset.D)}</div><div><span>P · 翻译回来</span>${matrixHtml(preset.P)}</div></div><div class="ch7-metrics">${metric("原坐标 x", vectorText(x))}${metric("特征坐标 y", vectorText(y))}${metric("缩放后 z", vectorText(Dy))}${metric("真实输出 Ax", vectorText(Ax))}</div></aside></div><div class="ch7-control-dock">${rangeControl({ label: "输入 x₁", key: "x1", value: state.x1, min: -2, max: 2 })}${rangeControl({ label: "输入 x₂", key: "x2", value: state.x2, min: -2, max: 2 })}${rangeControl({ label: "幂 n", key: "power", value: state.power, min: 0, max: 6, step: 1 })}</div>${statusBanner({ tone: "pass", title: `A^${state.power} 只需把 D 的对角元分别乘方`, text: `重构误差 ${fmt(matrixNorm(via.map((row, i) => row.map((v, j) => v - APower[i][j]))), 6)}；${preset.note}。`, formula: "A^n=PD^nP^{-1}" })}`;
      bindRanges(workspace, state, render);
    };
    b.on(section, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { state.preset = Number(preset.dataset.preset); section.querySelectorAll("[data-preset]").forEach((el) => el.classList.toggle("is-active", el === preset)); render(); return; }
      const stage = event.target.closest("[data-stage]");
      if (stage) { state.stage = stage.dataset.stage; section.querySelectorAll("[data-stage]").forEach((el) => el.classList.toggle("is-active", el === stage)); render(); }
    });
    render();
    return () => b.cleanup();
  }

  function rank2(A) {
    if (A.flat().every((v) => Math.abs(v) < EPS)) return 0;
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
      { name: "秩一压缩", A: [[1, 1], [2, 2]], note: "平面压到一条斜直线" },
      { name: "零变换", A: [[0, 0], [0, 0]], note: "所有输入都变得不可区分" },
    ];
    const state = { preset: 1, x1: 1.2, x2: 0.8, fiber: 0.9 };
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab">${labHeader(lesson, "左边看“哪些移动看不见”，右边看“哪些输出到得了”；核和值域必须同步出现。")}${presetButtons(presets, 1)}<div data-kernel-workspace></div></div>`;
    const workspace = section.querySelector("[data-kernel-workspace]");
    const b = binder();
    const render = () => {
      const preset = presets[state.preset];
      const A = preset.A;
      const rank = rank2(A);
      const nullity = 2 - rank;
      const k = kernelDirection2(A);
      const image = imageDirection2(A);
      const x = [state.x1, state.x2];
      const Ax = matVec(A, x);
      const ts = [-1.2, -0.6, 0, 0.6, 1.2];
      const fiberPoints = k ? ts.map((t) => add(x, scale(t * state.fiber, k))) : [x];
      const outputPoints = fiberPoints.map((p) => matVec(A, p));
      const imageSamples = Array.from({ length: 16 }, (_, i) => { const a = 2 * Math.PI * i / 16; return matVec(A, [Math.cos(a), Math.sin(a)]); });
      const kernelLabel = rank === 2 ? "{0}" : rank === 1 ? `span${vectorText(k)}` : "整个输入平面";
      const imageLabel = rank === 2 ? "整个输出平面" : rank === 1 ? `span${vectorText(image)}` : "{0}";
      workspace.innerHTML = `<div class="ch7-dual-space"><article class="ch7-space-card"><div class="ch7-space-heading"><span>输入空间 V</span><strong>沿核方向移动，输出看不见</strong></div>${svgPlane({ id: "kernel-input", vectors: [{ to: x, color: "var(--ch7-a)", label: "x" }], lines: k ? [{ direction: k, color: "var(--danger)" }] : [], points: fiberPoints.map((p, i) => ({ at: p, color: i === 2 ? "var(--ch7-a)" : "var(--danger)", radius: i === 2 ? 5 : 3 })), extent: 3.4 })}</article><div class="ch7-map-arrow">T →</div><article class="ch7-space-card"><div class="ch7-space-heading"><span>输出空间 W</span><strong>所有可达输出组成值域</strong></div>${svgPlane({ id: "kernel-output", vectors: [{ to: Ax, color: "var(--ch7-c)", label: "T(x)" }], lines: image ? [{ direction: image, color: "var(--success)" }] : [], points: [...outputPoints.map((p) => ({ at: p, color: "var(--ch7-c)", radius: 3 })), ...imageSamples.map((p) => ({ at: p, color: "color-mix(in srgb,var(--success) 55%,transparent)", radius: 2 }))], extent: 3.4 })}</article></div><div class="ch7-insight-strip"><div><span>核 · invisible motion</span><strong>ker T = ${kernelLabel}</strong><p>${k ? "红色同一条纤维上的多个输入，全部落到同一个输出点。" : rank === 2 ? "只有零向量能在输出中完全消失。" : "任何方向都被压成零。"}</p></div><div><span>值域 · reachable outputs</span><strong>im T = ${imageLabel}</strong><p>${rank === 2 ? "输出能覆盖整个平面。" : rank === 1 ? "所有输出只能沿绿色直线移动。" : "唯一可达输出是零向量。"}</p></div><div class="ch7-dimension-ledger"><span>维数账本</span><strong>2 = ${rank} + ${nullity}</strong><small>dim V = rank T + nullity T</small></div></div><div class="ch7-control-dock">${rangeControl({ label: "输入 x₁", key: "x1", value: state.x1, min: -2, max: 2 })}${rangeControl({ label: "输入 x₂", key: "x2", value: state.x2, min: -2, max: 2 })}${k ? rangeControl({ label: "沿核移动幅度", key: "fiber", value: state.fiber, min: 0.3, max: 1.4 }) : ""}</div>${statusBanner({ tone: rank === 2 ? "pass" : rank === 1 ? "warn" : "fail", title: preset.note, text: k ? `验证 T(x+k)=T(x)：${vectorText(outputPoints[0])} 与 ${vectorText(outputPoints.at(-1))} 相同。` : `当前 rank=${rank}, nullity=${nullity}。`, formula: "T(x+k)=T(x),\\quad k\\in\\ker T" })}`;
      bindRanges(workspace, state, render);
    };
    b.on(section, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { state.preset = Number(preset.dataset.preset); section.querySelectorAll("[data-preset]").forEach((el) => el.classList.toggle("is-active", el === preset)); render(); }
    });
    render();
    return () => b.cleanup();
  }

  function renderInvariant(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "上三角", A: [[2, 1], [0, 1]], dirs: [0, 135] },
      { name: "反射", A: [[1, 0], [0, -1]], dirs: [0, 90] },
      { name: "投影", A: [[1, 0], [0, 0]], dirs: [0, 90] },
      { name: "90°旋转", A: [[0, -1], [1, 0]], dirs: [] },
    ];
    const modes = [{ id: "line", label: "候选直线" }, { id: "plane", label: "整个平面" }, { id: "zero", label: "零子空间" }];
    const state = { preset: 0, mode: "line", angle: 20 };
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab">${labHeader(lesson, "不要只盯着一个向量：在 W 上取一排样本点，检查它们的像是否全部留在 W 内。")}${presetButtons(presets, 0)}<div class="ch7-mode-row">${modes.map((m) => `<button type="button" class="${m.id === state.mode ? "is-active" : ""}" data-mode="${m.id}">${m.label}</button>`).join("")}</div><div data-invariant-workspace></div></div>`;
    const workspace = section.querySelector("[data-invariant-workspace]");
    const b = binder();
    const render = () => {
      const preset = presets[state.preset];
      if (state.mode !== "line") {
        const text = state.mode === "plane" ? "整个空间总是不变：T(V)⊆V。" : "零子空间总是不变：T(0)=0。";
        workspace.innerHTML = `<div class="ch7-universal-case"><div>${state.mode === "plane" ? "V" : "{0}"}</div><i>→ T →</i><div>${state.mode === "plane" ? "T(V)⊆V" : "T(0)=0"}</div></div>${statusBanner({ tone: "pass", title: text, text: "这两个是任何线性算子的平凡不变子空间；真正有信息的是介于二者之间的子空间。" })}`;
        return;
      }
      const theta = state.angle * Math.PI / 180;
      const v = [Math.cos(theta), Math.sin(theta)];
      const Av = matVec(preset.A, v);
      const residual = norm(Av) < EPS ? 0 : Math.abs(cross2(v, Av)) / norm(Av);
      const invariant = residual < 0.018;
      const samples = [-1.6, -0.8, 0.8, 1.6].map((t) => scale(t, v));
      const images = samples.map((p) => matVec(preset.A, p));
      const u = [-v[1], v[0]];
      const P = [[v[0], u[0]], [v[1], u[1]]];
      const B = matMul(matMul(inv2(P), preset.A), P);
      workspace.innerHTML = `<div class="ch7-workspace"><div class="ch7-canvas-card">${legend([{ color: "var(--ch7-a)", label: "W 上的样本" }, { color: "var(--ch7-c)", label: "样本的像" }, { color: invariant ? "var(--success)" : "var(--danger)", label: "候选子空间 W" }])}${svgPlane({ id: "invariant", lines: [{ direction: v, color: invariant ? "var(--success)" : "var(--ch7-a)" }], points: [...samples.map((p) => ({ at: p, color: "var(--ch7-a)", radius: 3 })), ...images.map((p) => ({ at: p, color: "var(--ch7-c)", radius: 4 }))], vectors: [{ to: v, color: "var(--ch7-a)", label: "w" }, { to: Av, color: "var(--ch7-c)", label: "T(w)" }], extent: 3.5 })}</div><aside class="ch7-insight-card"><span class="ch7-panel-kicker">不变性闸门</span><h4>${invariant ? "所有样本像都留在 W" : "至少一个样本像离开 W"}</h4>${display("T(W)\\subseteq W")}<div class="ch7-metrics">${metric("离开 W 的残差", fmt(residual, 4))}${metric("是否逐点固定", norm(sub(Av, v)) < 1e-6 ? "是" : "否")}${metric("是否不变", invariant ? "是" : "否")}</div><div class="ch7-block-matrix"><span>适应基下</span>${matrixHtml(B)}<p>左下角 ${fmt(B[1][0], 4)} ${invariant ? "为 0：W 不会泄漏到补空间。" : "不为 0：出现补空间分量。"}</p></div></aside></div><div class="ch7-snap-row"><span>已知不变直线：</span>${preset.dirs.length ? preset.dirs.map((angle) => `<button type="button" data-invariant-snap="${angle}">${angle}°</button>`).join("") : `<em>实数域中没有一维不变子空间</em>`}</div><div class="ch7-control-dock">${rangeControl({ label: "候选直线角度", key: "angle", value: state.angle, min: 0, max: 179, step: 1 })}</div>${statusBanner({ tone: invariant ? "pass" : preset.dirs.length ? "warn" : "fail", title: invariant ? "W 是不变子空间" : "W 不是不变子空间", text: invariant ? "不要求每个向量保持不动，只要求像仍在 W 中。" : preset.dirs.length ? "旋转候选直线，寻找残差归零的方向。" : "90°旋转在实数平面没有一维不变子空间。" })}`;
      bindRanges(workspace, state, render);
    };
    b.on(section, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { state.preset = Number(preset.dataset.preset); state.angle = presets[state.preset].dirs[0] ?? 20; section.querySelectorAll("[data-preset]").forEach((el) => el.classList.toggle("is-active", el === preset)); render(); return; }
      const mode = event.target.closest("[data-mode]");
      if (mode) { state.mode = mode.dataset.mode; section.querySelectorAll("[data-mode]").forEach((el) => el.classList.toggle("is-active", el === mode)); render(); return; }
      const snap = event.target.closest("[data-invariant-snap]");
      if (snap) { state.angle = Number(snap.dataset.invariantSnap); render(); }
    });
    render();
    return () => b.cleanup();
  }

  function renderJordan(section, lesson) {
    if (!section) return;
    const structures = [
      { name: "对角块 λI₂", size: 2, split: true },
      { name: "J₂(λ)", size: 2, split: false },
      { name: "J₃(λ)", size: 3, split: false },
    ];
    const state = { structure: 1, lambda: 2, mode: "N", steps: 0, vector: [0, 1] };
    const reset = () => { const spec = structures[state.structure]; state.vector = Array(spec.size).fill(0); state.vector[spec.size - 1] = 1; state.steps = 0; };
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab">${labHeader(lesson, "先回答为什么对角化失败：只有一个特征方向时，用广义特征向量补成一条可传递的链。")}${presetButtons(structures, state.structure, "structure")}<div class="ch7-mode-row"><button type="button" class="is-active" data-jordan-mode="N">只看 N=T−λI</button><button type="button" data-jordan-mode="T">看完整 T=λI+N</button></div><div data-jordan-workspace></div></div>`;
    const workspace = section.querySelector("[data-jordan-workspace]");
    const b = binder();
    const build = () => {
      const spec = structures[state.structure];
      const J = zeroMatrix(spec.size), N = zeroMatrix(spec.size);
      for (let i = 0; i < spec.size; i += 1) J[i][i] = state.lambda;
      if (!spec.split) for (let i = 0; i < spec.size - 1; i += 1) { J[i][i + 1] = 1; N[i][i + 1] = 1; }
      return { spec, J, N };
    };
    const render = () => {
      const { spec, J, N } = build();
      const nodes = Array.from({ length: spec.size }, (_, i) => spec.size - i);
      const zero = norm(state.vector) < EPS;
      const chain = spec.split
        ? `<div class="ch7-chain is-split">${nodes.map((n) => `<div class="ch7-chain-node ${Math.abs(state.vector[n - 1]) > EPS ? "is-active" : ""}"><span>v${n}</span><small>特征向量</small></div><i>N→0</i>`).join("")}</div>`
        : `<div class="ch7-chain">${nodes.map((n) => `<div class="ch7-chain-node ${Math.abs(state.vector[n - 1]) > EPS ? "is-active" : ""}"><span>v${n}</span><small>${n === 1 ? "特征向量" : "广义特征向量"}</small></div>${n > 1 ? `<i>N→</i>` : `<i>N→</i><div class="ch7-chain-zero">0</div>`}`).join("")}</div>`;
      const relation = spec.split ? "N(v_1)=0,\\quad N(v_2)=0" : spec.size === 2 ? "N(v_2)=v_1,\\quad N(v_1)=0" : "N(v_3)=v_2,\\quad N(v_2)=v_1,\\quad N(v_1)=0";
      workspace.innerHTML = `<div class="ch7-jordan-motivation"><div><span>对角化想要</span><strong>每个基向量都是特征向量</strong></div><i>但特征方向不足</i><div><span>Jordan 的补法</span><strong>用广义特征向量接成链</strong></div></div><div class="ch7-workspace"><div class="ch7-canvas-card"><div class="ch7-canvas-title"><span>${spec.name}</span><strong>${state.mode === "N" ? "N 只保留链传递" : "T 同时做 λ 缩放与链传递"}</strong></div>${chain}<div class="ch7-current-vector"><span>第 ${state.steps} 次作用后的坐标</span>${matrixHtml(state.vector.map((v) => [v]))}</div></div><aside class="ch7-insight-card"><span class="ch7-panel-kicker">读链规则</span>${display(relation)}<div class="ch7-matrix-pair"><div><span>J</span>${matrixHtml(J)}</div><div><span>N=J−λI</span>${matrixHtml(N)}</div></div><div class="ch7-metrics">${metric("链长", spec.split ? "1 + 1" : spec.size)}${metric("幂零指数", spec.split ? 1 : spec.size)}${metric("当前是否归零", zero ? "是" : "否")}${metric("λ", fmt(state.lambda))}</div><p>${state.mode === "N" ? "每按一次，链尾向前移动一级；最终落到 0。" : "每次作用既保留 λ 倍的自身，又添加前一个链向量。"}</p></aside></div><div class="ch7-action-row"><button type="button" class="primary" data-jordan-step>${state.mode === "N" && zero ? "N 已经归零" : "作用一次"}</button><button type="button" data-jordan-reset>重置到链尾</button></div><div class="ch7-control-dock">${rangeControl({ label: "特征值 λ", key: "lambda", value: state.lambda, min: -2, max: 3, step: 0.5 })}</div>${statusBanner({ tone: state.mode === "T" ? "neutral" : spec.split || zero ? "pass" : "warn", title: state.mode === "T" ? (spec.split ? "完整 T 只有 λ 倍缩放，没有链耦合" : "完整 T 同时包含 λ 倍自身与向前一项的链耦合") : spec.split ? "N=0：两个 1×1 块没有链传递" : zero ? `经过 ${state.steps} 次 N 已归零` : `还需沿链继续传递`, text: state.mode === "T" ? (spec.split ? "相同特征值并不自动形成 Jordan 链。" : "完整 T 在 λ≠0 时通常不会归零；这里观察的是额外出现的前一链向量分量。") : spec.split ? "对角块的幂零部分为零。" : `最大链长 ${spec.size} 决定 (T−λI) 的最低必要指数。` })}`;
      bindRanges(workspace, state, () => { reset(); render(); });
    };
    b.on(section, "click", (event) => {
      const structure = event.target.closest("[data-structure]");
      if (structure) { state.structure = Number(structure.dataset.structure); section.querySelectorAll("[data-structure]").forEach((el) => el.classList.toggle("is-active", el === structure)); reset(); render(); return; }
      const mode = event.target.closest("[data-jordan-mode]");
      if (mode) { state.mode = mode.dataset.jordanMode; section.querySelectorAll("[data-jordan-mode]").forEach((el) => el.classList.toggle("is-active", el === mode)); reset(); render(); return; }
      if (event.target.closest("[data-jordan-reset]")) { reset(); render(); return; }
      if (event.target.closest("[data-jordan-step]")) { const { J, N } = build(); if (norm(state.vector) >= EPS) { state.vector = matVec(state.mode === "N" ? N : J, state.vector); state.steps += 1; } render(); }
    });
    render();
    return () => b.cleanup();
  }

  function polynomialEvaluateMatrix(coeffs, A) {
    let result = zeroMatrix(A.length);
    let power = identity(A.length);
    coeffs.forEach((coefficient) => { result = matAdd(result, matScale(coefficient, power)); power = matMul(power, A); });
    return result;
  }

  function renderMinimal(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "2I₂", A: [[2, 0], [0, 2]], minimal: "t-2", characteristic: "(t-2)^2", story: "两个方向都在一次 (A−2I) 后归零", candidates: [{ label: "t−2", coeffs: [-2, 1] }, { label: "(t−2)²", coeffs: [4, -4, 1] }, { label: "t", coeffs: [0, 1] }] },
      { name: "J₂(2)", A: [[2, 1], [0, 2]], minimal: "(t-2)^2", characteristic: "(t-2)^2", story: "链尾需要两次 (A−2I) 才归零", candidates: [{ label: "t−2", coeffs: [-2, 1] }, { label: "(t−2)²", coeffs: [4, -4, 1] }, { label: "(t−2)³", coeffs: [-8, 12, -6, 1] }] },
      { name: "diag(2,−1)", A: [[2, 0], [0, -1]], minimal: "(t-2)(t+1)", characteristic: "(t-2)(t+1)", story: "两个不同因子分别消掉两个特征方向", candidates: [{ label: "t−2", coeffs: [-2, 1] }, { label: "t+1", coeffs: [1, 1] }, { label: "(t−2)(t+1)", coeffs: [-2, -1, 1] }] },
      { name: "J₃(0)", A: [[0, 1, 0], [0, 0, 1], [0, 0, 0]], minimal: "t^3", characteristic: "t^3", story: "最大 Jordan 链长为 3", candidates: [{ label: "t", coeffs: [0, 1] }, { label: "t²", coeffs: [0, 0, 1] }, { label: "t³", coeffs: [0, 0, 0, 1] }] },
    ];
    const state = { preset: 1, candidate: 0 };
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab">${labHeader(lesson, "不要只看 p(A) 的矩阵；逐个检查基方向或 Jordan 链，看看候选多项式究竟消掉了谁。")}${presetButtons(presets, state.preset)}<div data-minimal-workspace></div></div>`;
    const workspace = section.querySelector("[data-minimal-workspace]");
    const b = binder();
    const render = () => {
      const preset = presets[state.preset];
      const candidate = preset.candidates[state.candidate];
      const pA = polynomialEvaluateMatrix(candidate.coeffs, preset.A);
      const basis = identity(preset.A.length).map((_, j) => identity(preset.A.length).map((row) => row[j]));
      const outputs = basis.map((e) => matVec(pA, e));
      const killed = outputs.map((v) => norm(v) < 1e-7);
      const isZero = killed.every(Boolean);
      const degree = candidate.coeffs.length - 1;
      const minimalDegree = preset.minimal.includes("^3") ? 3 : preset.minimal.includes("^2") ? 2 : preset.minimal.includes(")(") ? 2 : 1;
      const candidateButtons = preset.candidates.map((item, index) => `<button type="button" class="ch7-candidate ${index === state.candidate ? "is-active" : ""}" data-candidate="${index}"><strong>${item.label}</strong><span>${index === 0 ? "先试低次" : index === preset.candidates.length - 1 ? "比较结果" : "继续增加因子/次数"}</span></button>`).join("");
      workspace.innerHTML = `<div class="ch7-minimal-layout"><div class="ch7-candidate-panel"><span class="ch7-panel-kicker">选择候选 p(t)</span>${candidateButtons}<div class="ch7-factor-story"><span>当前矩阵结构</span><strong>${preset.story}</strong></div></div><div class="ch7-minimal-result"><div class="ch7-minimal-status ${isZero ? "is-pass" : killed.some(Boolean) ? "is-warn" : "is-fail"}"><span>${isZero ? "全局归零" : killed.some(Boolean) ? "只消掉部分方向" : "没有消掉任何基方向"}</span><strong>p(t) = ${candidate.label}</strong><p>${isZero ? "p(A) 对整个空间都是零算子。" : "只要还有一个方向输出非零，就不是湮灭多项式。"}</p></div><div class="ch7-annihilation-lanes">${outputs.map((out, i) => `<div class="${killed[i] ? "is-killed" : "is-alive"}"><span>测试 e${i + 1}</span><i>p(A)</i><strong>${vectorText(out)}</strong><small>${killed[i] ? "归零" : "仍存活"}</small></div>`).join("")}</div><div class="ch7-matrix-pair"><div><span>A</span>${matrixHtml(preset.A)}</div><div><span>p(A)</span>${matrixHtml(pA)}</div></div><div class="ch7-metrics">${metric("候选次数", degree)}${metric("最小多项式次数", minimalDegree)}${metric("最小多项式", preset.minimal)}${metric("特征多项式", preset.characteristic)}</div></div></div>${statusBanner({ tone: isZero && degree === minimalDegree ? "pass" : isZero ? "warn" : "fail", title: isZero && degree === minimalDegree ? "这就是最小多项式" : isZero ? "能湮灭，但次数还可能不是最低" : "当前候选不是湮灭多项式", text: isZero ? `检查次数：${degree}；最低需要 ${minimalDegree}。` : "继续补足缺失的因子或提高 Jordan 因子的指数。", formula: "m_T(T)=0,\\qquad m_T\\mid\\chi_T" })}`;
    };
    b.on(section, "click", (event) => {
      const preset = event.target.closest("[data-preset]");
      if (preset) { state.preset = Number(preset.dataset.preset); state.candidate = 0; section.querySelectorAll("[data-preset]").forEach((el) => el.classList.toggle("is-active", el === preset)); render(); return; }
      const candidate = event.target.closest("[data-candidate]");
      if (candidate) { state.candidate = Number(candidate.dataset.candidate); render(); }
    });
    render();
    return () => b.cleanup();
  }

  function register(sectionId, interactive) {
    window.defineChapter7Renderer?.(sectionId, { formal: renderFormal, interactive });
  }

  register("linear-map-definition", renderLinearity);
  register("linear-map-operations", renderOperator);
  register("matrix-of-linear-map", renderBasis);
  register("eigenvalues-eigenvectors", renderEigen);
  register("diagonal-matrices", renderDiagonal);
  register("image-and-kernel", renderKernelImage);
  register("invariant-subspaces", renderInvariant);
  register("jordan-form-introduction", renderJordan);
  register("minimal-polynomial", renderMinimal);
})();
