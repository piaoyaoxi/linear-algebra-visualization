(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`);
  const EPS = 1e-8;

  const fmt = (value, digits = 2) => {
    const clean = Math.abs(value) < 1e-9 ? 0 : value;
    if (Number.isInteger(clean)) return String(clean);
    return clean.toFixed(digits).replace(/\.00$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
  };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
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
  const matMul = (A, B) =>
    A.map((row) => B[0].map((_, j) => row.reduce((sum, value, k) => sum + value * B[k][j], 0)));
  const matAdd = (A, B) => A.map((row, i) => row.map((value, j) => value + B[i][j]));
  const matScale = (c, A) => A.map((row) => row.map((value) => c * value));
  const identity = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  const zeroMatrix = (rows, cols = rows) => Array.from({ length: rows }, () => Array(cols).fill(0));
  const det2 = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const inv2 = (A) => {
    const d = det2(A);
    if (Math.abs(d) < EPS) return null;
    return [
      [A[1][1] / d, -A[0][1] / d],
      [-A[1][0] / d, A[0][0] / d],
    ];
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
  const matrixHtml = (A, digits = 2) => {
    const rows = A.map((row) => row.map((value) => fmt(value, digits)).join("&")).join("\\\\");
    return display(`\\begin{bmatrix}${rows}\\end{bmatrix}`);
  };
  const vectorText = (v, digits = 2) => `(${v.map((value) => fmt(value, digits)).join(", ")})`;

  function renderFormal(formal, section) {
    if (!formal || !section?.formal) return;
    const data = section.formal;
    formal.innerHTML = `
      <h2>${data.heading}</h2>
      <div class="ch7-formal">
        <p class="ch7-formal-lead">${data.lead}</p>
        ${data.formula ? `<div class="ch7-formula">${display(data.formula)}</div>` : ""}
        <div class="ch7-definition-grid">
          ${(data.blocks || [])
            .map(
              (block, index) => `
                <article class="ch7-definition-card">
                  <span class="ch7-card-index">${String(index + 1).padStart(2, "0")}</span>
                  <div><h3>${block.title}</h3><p>${block.body}</p></div>
                </article>`,
            )
            .join("")}
        </div>
        ${data.note ? `<div class="ch7-note"><strong>边界提醒</strong><p>${data.note}</p></div>` : ""}
        ${data.bridge ? `<div class="ch7-bridge"><span>下一步</span><p>${data.bridge}</p></div>` : ""}
      </div>`;
  }

  function presetButtons(presets, activeIndex, attr = "preset") {
    return `<div class="ch7-preset-row" role="group" aria-label="预设">
      ${presets
        .map(
          (preset, index) =>
            `<button type="button" class="${index === activeIndex ? "is-active" : ""}" data-${attr}="${index}">${preset.name}</button>`,
        )
        .join("")}
    </div>`;
  }

  function rangeControl({ label, key, value, min, max, step = 0.1, suffix = "" }) {
    return `<label class="ch7-range"><span>${label}<output data-output="${key}">${fmt(value)}${suffix}</output></span><input type="range" data-range="${key}" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
  }

  function labHeader(title, description, status = "") {
    return `<div class="ch7-lab-head"><div><span class="ch7-lab-kicker">交互实验</span><h3>${title}</h3><p>${description}</p></div>${status ? `<div class="ch7-live-status" data-live-status>${status}</div>` : ""}</div>`;
  }

  function svgPlane({ id, vectors = [], lines = [], points = [], size = 300, extent = 3.2, circle = false, labels = [] }) {
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
    return `<svg class="ch7-plane" viewBox="0 0 ${size} ${size}" role="img" aria-label="坐标平面">
      <defs>${vectors
        .map(
          (vector, i) => `<marker id="${markerIds[i]}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="${vector.color || "currentColor"}"/></marker>`,
        )
        .join("")}</defs>
      <rect x="0" y="0" width="${size}" height="${size}" rx="18" class="ch7-plane-bg"/>
      ${grid.join("")}
      <line x1="0" y1="${center}" x2="${size}" y2="${center}" class="ch7-axis"/>
      <line x1="${center}" y1="0" x2="${center}" y2="${size}" class="ch7-axis"/>
      ${circle ? `<circle cx="${center}" cy="${center}" r="${unit}" class="ch7-unit-circle"/>` : ""}
      ${lines
        .map((line) => {
          const d = normalize(line.direction || [1, 0]);
          const length = extent * 1.5;
          return `<line x1="${px(-d[0] * length)}" y1="${py(-d[1] * length)}" x2="${px(d[0] * length)}" y2="${py(d[1] * length)}" class="${line.className || "ch7-subspace-line"}" style="--line-color:${line.color || "var(--accent)"}"/>`;
        })
        .join("")}
      ${vectors
        .map(
          (vector, i) => `<line x1="${px(vector.from?.[0] || 0)}" y1="${py(vector.from?.[1] || 0)}" x2="${px(vector.to[0])}" y2="${py(vector.to[1])}" stroke="${vector.color || "var(--accent)"}" class="ch7-vector" marker-end="url(#${markerIds[i]})"/><circle cx="${px(vector.to[0])}" cy="${py(vector.to[1])}" r="3.5" fill="${vector.color || "var(--accent)"}"/>${vector.label ? `<text x="${px(vector.to[0]) + 7}" y="${py(vector.to[1]) - 7}" class="ch7-svg-label">${vector.label}</text>` : ""}`,
        )
        .join("")}
      ${points
        .map((point) => `<circle cx="${px(point.at[0])}" cy="${py(point.at[1])}" r="${point.radius || 4}" fill="${point.color || "var(--accent)"}" class="${point.className || ""}"/>`)
        .join("")}
      ${labels.map((label) => `<text x="${px(label.at[0])}" y="${py(label.at[1])}" class="ch7-svg-label">${label.text}</text>`).join("")}
    </svg>`;
  }

  function bindRanges(section, state, render) {
    const listeners = [];
    section.querySelectorAll("[data-range]").forEach((input) => {
      const handler = () => {
        state[input.dataset.range] = Number(input.value);
        const output = section.querySelector(`[data-output="${input.dataset.range}"]`);
        if (output) output.textContent = fmt(Number(input.value));
        render();
      };
      input.addEventListener("input", handler);
      listeners.push(() => input.removeEventListener("input", handler));
    });
    return () => listeners.forEach((cleanup) => cleanup());
  }

  function renderLinearity(section, lesson) {
    if (!section) return;
    const rad = (deg) => (deg * Math.PI) / 180;
    const presets = [
      {
        name: "旋转",
        formula: "T(x)=R_{35^\\circ}x",
        apply: (x) => {
          const a = rad(35);
          return [Math.cos(a) * x[0] - Math.sin(a) * x[1], Math.sin(a) * x[0] + Math.cos(a) * x[1]];
        },
      },
      { name: "剪切", formula: "T(x,y)=(x+0.8y,y)", apply: ([x, y]) => [x + 0.8 * y, y] },
      { name: "投影", formula: "T(x,y)=(x,0)", apply: ([x]) => [x, 0] },
      { name: "平移", formula: "T(x,y)=(x+0.8,y-0.4)", apply: ([x, y]) => [x + 0.8, y - 0.4] },
      { name: "分量平方", formula: "T(x,y)=(x^2,y)", apply: ([x, y]) => [x * x, y] },
      { name: "绝对值折叠", formula: "T(x,y)=(|x|,y)", apply: ([x, y]) => [Math.abs(x), y] },
    ];
    const state = { preset: 0, ux: 1.2, uy: 0.6, vx: -0.5, vy: 1.1, c: -1.2 };
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab ch7-linearity-lab">
      ${labHeader(lesson.interactive.title, lesson.interactive.description)}
      ${presetButtons(presets, state.preset)}
      <div class="ch7-lab-grid ch7-lab-grid-2" data-stage></div>
      <div class="ch7-controls-grid">
        ${rangeControl({ label: "u₁", key: "ux", value: state.ux, min: -2, max: 2 })}
        ${rangeControl({ label: "u₂", key: "uy", value: state.uy, min: -2, max: 2 })}
        ${rangeControl({ label: "v₁", key: "vx", value: state.vx, min: -2, max: 2 })}
        ${rangeControl({ label: "v₂", key: "vy", value: state.vy, min: -2, max: 2 })}
        ${rangeControl({ label: "标量 c", key: "c", value: state.c, min: -2, max: 2 })}
      </div>
      <div class="ch7-observation" data-observation></div>
    </div>`;

    const stage = section.querySelector("[data-stage]");
    const observation = section.querySelector("[data-observation]");
    const render = () => {
      const preset = presets[state.preset];
      const u = [state.ux, state.uy];
      const v = [state.vx, state.vy];
      const Tu = preset.apply(u);
      const Tv = preset.apply(v);
      const addLeft = preset.apply(add(u, v));
      const addRight = add(Tu, Tv);
      const homLeft = preset.apply(scale(state.c, u));
      const homRight = scale(state.c, Tu);
      const addError = sub(addLeft, addRight);
      const homError = sub(homLeft, homRight);
      const addPass = norm(addError) < 1e-6;
      const homPass = norm(homError) < 1e-6;
      const origin = preset.apply([0, 0]);
      stage.innerHTML = `
        <article class="ch7-compare-card ${addPass ? "is-pass" : "is-fail"}">
          <div class="ch7-compare-head"><div><span>加法检验</span><strong>${inline("T(u+v)\\stackrel{?}{=}T(u)+T(v)")}</strong></div><b>${addPass ? "路径重合" : "路径分离"}</b></div>
          ${svgPlane({
            id: "lin-add",
            vectors: [
              { to: addLeft, color: "var(--ch7-a)", label: "T(u+v)" },
              { to: addRight, color: "var(--ch7-b)", label: "T(u)+T(v)" },
              ...(!addPass ? [{ from: addRight, to: addLeft, color: "var(--danger)", label: "误差" }] : []),
            ],
            extent: 3.4,
          })}
          <div class="ch7-path-readout"><span>${vectorText(addLeft)}</span><span>${vectorText(addRight)}</span><span>误差 ${vectorText(addError)}</span></div>
        </article>
        <article class="ch7-compare-card ${homPass ? "is-pass" : "is-fail"}">
          <div class="ch7-compare-head"><div><span>数乘检验</span><strong>${inline("T(cu)\\stackrel{?}{=}cT(u)")}</strong></div><b>${homPass ? "路径重合" : "路径分离"}</b></div>
          ${svgPlane({
            id: "lin-hom",
            vectors: [
              { to: homLeft, color: "var(--ch7-a)", label: "T(cu)" },
              { to: homRight, color: "var(--ch7-b)", label: "cT(u)" },
              ...(!homPass ? [{ from: homRight, to: homLeft, color: "var(--danger)", label: "误差" }] : []),
            ],
            extent: 3.4,
          })}
          <div class="ch7-path-readout"><span>${vectorText(homLeft)}</span><span>${vectorText(homRight)}</span><span>误差 ${vectorText(homError)}</span></div>
        </article>`;
      const verdict = addPass && homPass;
      observation.innerHTML = `<div><span class="ch7-status-dot ${verdict ? "is-pass" : "is-fail"}"></span><strong>${preset.name}：${verdict ? "两项检验都通过" : "至少一项检验失败"}</strong><p>${inline(preset.formula)}。${verdict ? "当前误差严格为零；这个预设保持任意线性组合。" : "上方误差向量给出了一个具体反例。"}</p></div><dl><div><dt>T(0)</dt><dd>${vectorText(origin)}</dd></div><div><dt>结论</dt><dd>${verdict ? "线性" : origin.some((x) => Math.abs(x) > 1e-8) ? "原点条件已失败" : "需看可见反例"}</dd></div></dl>`;
    };
    section.querySelectorAll("[data-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        state.preset = Number(button.dataset.preset);
        section.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
        render();
      });
    });
    const cleanupRanges = bindRanges(section, state, render);
    render();
    return cleanupRanges;
  }

  function renderOperator(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "旋转 + 剪切", T: [[0, -1], [1, 0]], S: [[1, 0.8], [0, 1]], note: "两个可逆变换，顺序通常不同" },
      { name: "投影 + 旋转", T: [[0, -1], [1, 0]], S: [[1, 0], [0, 0]], note: "投影丢失信息，复合不可逆" },
      { name: "缩放 + 反射", T: [[1.6, 0], [0, 0.7]], S: [[1, 0], [0, -1]], note: "这组对角作用恰好交换" },
    ];
    const modes = [
      { id: "sum", label: "T + S" },
      { id: "scale", label: "cT" },
      { id: "TS", label: "先 S 后 T" },
      { id: "ST", label: "先 T 后 S" },
    ];
    const state = { preset: 0, mode: "sum", x1: 1.2, x2: 0.8, c: -1 };
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab">
      ${labHeader(lesson.interactive.title, lesson.interactive.description)}
      ${presetButtons(presets, state.preset)}
      <div class="ch7-mode-row" role="tablist">${modes.map((mode) => `<button type="button" role="tab" class="${mode.id === state.mode ? "is-active" : ""}" data-mode="${mode.id}">${mode.label}</button>`).join("")}</div>
      <div class="ch7-operator-layout"><div data-operator-plane></div><div class="ch7-operator-panel" data-operator-panel></div></div>
      <div class="ch7-controls-grid">${rangeControl({ label: "x₁", key: "x1", value: state.x1, min: -2, max: 2 })}${rangeControl({ label: "x₂", key: "x2", value: state.x2, min: -2, max: 2 })}${rangeControl({ label: "标量 c", key: "c", value: state.c, min: -2, max: 2 })}</div>
    </div>`;
    const plane = section.querySelector("[data-operator-plane]");
    const panel = section.querySelector("[data-operator-panel]");
    const render = () => {
      const { T, S, note } = presets[state.preset];
      const x = [state.x1, state.x2];
      const Tx = matVec(T, x);
      const Sx = matVec(S, x);
      let vectors = [{ to: x, color: "var(--ch7-muted)", label: "x" }];
      let result;
      let formula;
      let explanation;
      if (state.mode === "sum") {
        result = add(Tx, Sx);
        vectors = vectors.concat([
          { to: Tx, color: "var(--ch7-a)", label: "T(x)" },
          { to: Sx, color: "var(--ch7-b)", label: "S(x)" },
          { from: Tx, to: result, color: "var(--ch7-b)" },
          { from: Sx, to: result, color: "var(--ch7-a)" },
          { to: result, color: "var(--ch7-c)", label: "(T+S)(x)" },
        ]);
        formula = "(T+S)(x)=T(x)+S(x)";
        explanation = "两次作用从同一个输入出发，最后在陪域中相加。";
      } else if (state.mode === "scale") {
        result = scale(state.c, Tx);
        vectors = vectors.concat([
          { to: Tx, color: "var(--ch7-a)", label: "T(x)" },
          { to: result, color: "var(--ch7-c)", label: "cT(x)" },
        ]);
        formula = "(cT)(x)=c\\,T(x)";
        explanation = "只缩放输出，不再执行第二个变换。";
      } else if (state.mode === "TS") {
        result = matVec(T, Sx);
        vectors = vectors.concat([
          { to: Sx, color: "var(--ch7-b)", label: "S(x)" },
          { from: Sx, to: result, color: "var(--ch7-a)", label: "T(Sx)" },
          { to: result, color: "var(--ch7-c)", label: "TS(x)" },
        ]);
        formula = "(TS)(x)=T(S(x))";
        explanation = "右边的 S 先作用，T 接收 S 的输出。";
      } else {
        result = matVec(S, Tx);
        vectors = vectors.concat([
          { to: Tx, color: "var(--ch7-a)", label: "T(x)" },
          { from: Tx, to: result, color: "var(--ch7-b)", label: "S(Tx)" },
          { to: result, color: "var(--ch7-c)", label: "ST(x)" },
        ]);
        formula = "(ST)(x)=S(T(x))";
        explanation = "这次 T 先作用；第二步面对的是不同的中间对象。";
      }
      plane.innerHTML = svgPlane({ id: "operator", vectors, extent: 4 });
      const TS = matMul(T, S);
      const ST = matMul(S, T);
      panel.innerHTML = `<span class="ch7-panel-kicker">当前模式</span><h4>${inline(formula)}</h4><p>${explanation}</p><div class="ch7-matrix-pair"><div><span>T</span>${matrixHtml(T)}</div><div><span>S</span>${matrixHtml(S)}</div></div><dl class="ch7-ledger"><div><dt>x</dt><dd>${vectorText(x)}</dd></div><div><dt>结果</dt><dd>${vectorText(result)}</dd></div><div><dt>TS = ST?</dt><dd>${matrixNorm(subMatrix(TS, ST)) < 1e-7 ? "是（本预设恰好交换）" : "否"}</dd></div><div><dt>可逆性</dt><dd>${Math.abs(det2(T)) > EPS && Math.abs(det2(S)) > EPS ? "两个因素都可逆" : "至少一个因素丢失信息"}</dd></div></dl><div class="ch7-mini-note">${note}</div>`;
    };
    const subMatrix = (A, B) => A.map((row, i) => row.map((value, j) => value - B[i][j]));
    section.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
      state.preset = Number(button.dataset.preset);
      section.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    }));
    section.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      section.querySelectorAll("[data-mode]").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    }));
    const cleanupRanges = bindRanges(section, state, render);
    render();
    return cleanupRanges;
  }

  function renderBasis(section, lesson) {
    if (!section) return;
    const A = [[2, 1], [1, 2]];
    const presets = [
      { name: "标准基", P: [[1, 0], [0, 1]], label: "B=E" },
      { name: "斜基", P: [[1, 1], [0, 1]], label: "B=((1,0),(1,1))" },
      { name: "特征基", P: [[1, 1], [1, -1]], label: "B=((1,1),(1,-1))" },
    ];
    const state = { preset: 0, x1: 1.4, x2: 0.7 };
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab">
      ${labHeader(lesson.interactive.title, lesson.interactive.description)}
      ${presetButtons(presets, state.preset)}
      <div class="ch7-basis-layout"><div data-basis-plane></div><div class="ch7-basis-record" data-basis-record></div></div>
      <div class="ch7-controls-grid">${rangeControl({ label: "几何向量 x₁", key: "x1", value: state.x1, min: -2, max: 2 })}${rangeControl({ label: "几何向量 x₂", key: "x2", value: state.x2, min: -2, max: 2 })}</div>
    </div>`;
    const plane = section.querySelector("[data-basis-plane]");
    const record = section.querySelector("[data-basis-record]");
    const render = () => {
      const preset = presets[state.preset];
      const P = preset.P;
      const Pinv = inv2(P);
      const Bmat = matMul(matMul(Pinv, A), P);
      const x = [state.x1, state.x2];
      const Ax = matVec(A, x);
      const xB = matVec(Pinv, x);
      const AxB = matVec(Pinv, Ax);
      const b1 = [P[0][0], P[1][0]];
      const b2 = [P[0][1], P[1][1]];
      plane.innerHTML = `<div class="ch7-basis-plane-title"><span>同一个几何空间</span><strong>箭头不随换基移动</strong></div>${svgPlane({
        id: "basis",
        vectors: [
          { to: b1, color: "var(--ch7-a)", label: "b₁" },
          { to: b2, color: "var(--ch7-b)", label: "b₂" },
          { to: x, color: "var(--ch7-c)", label: "x" },
          { to: Ax, color: "var(--ch7-d)", label: "T(x)" },
        ],
        lines: [
          { direction: b1, color: "var(--ch7-a)", className: "ch7-basis-line" },
          { direction: b2, color: "var(--ch7-b)", className: "ch7-basis-line" },
        ],
        extent: 3.4,
      })}`;
      record.innerHTML = `<span class="ch7-panel-kicker">坐标记录</span><h4>${preset.label}</h4><div class="ch7-coordinate-equation"><div><span>[x]B</span>${matrixHtml(xB.map((v) => [v]))}</div><span>→</span><div><span>[T]B</span>${matrixHtml(Bmat)}</div><span>→</span><div><span>[T(x)]B</span>${matrixHtml(AxB.map((v) => [v]))}</div></div><div class="ch7-similarity-chain"><div><span>P</span>${matrixHtml(P)}</div><div><span>P⁻¹AP</span>${matrixHtml(Bmat)}</div></div><dl class="ch7-ledger"><div><dt>几何 x</dt><dd>${vectorText(x)}</dd></div><div><dt>几何 T(x)</dt><dd>${vectorText(Ax)}</dd></div><div><dt>坐标校验</dt><dd>${norm(sub(matVec(Bmat, xB), AxB)) < 1e-7 ? "[T]B[x]B=[T(x)]B" : "未通过"}</dd></div><div><dt>结构</dt><dd>${state.preset === 2 ? "特征基下无坐标混合" : "坐标之间仍会混合"}</dd></div></dl>`;
    };
    section.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
      state.preset = Number(button.dataset.preset);
      section.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    }));
    const cleanupRanges = bindRanges(section, state, render);
    render();
    return cleanupRanges;
  }

  function renderEigen(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "对称矩阵", A: [[2, 1], [1, 2]], dirs: [45, -45], values: [3, 1], poly: "(\\lambda-3)(\\lambda-1)" },
      { name: "剪切", A: [[1, 1], [0, 1]], dirs: [0], values: [1], poly: "(\\lambda-1)^2" },
      { name: "反射", A: [[1, 0], [0, -1]], dirs: [0, 90], values: [1, -1], poly: "(\\lambda-1)(\\lambda+1)" },
      { name: "90°旋转", A: [[0, -1], [1, 0]], dirs: [], values: [], poly: "\\lambda^2+1" },
    ];
    const state = { preset: 0, angle: 18 };
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab">
      ${labHeader(lesson.interactive.title, lesson.interactive.description)}
      ${presetButtons(presets, state.preset)}
      <div class="ch7-eigen-layout"><div data-eigen-plane></div><div class="ch7-eigen-panel" data-eigen-panel></div></div>
      <div class="ch7-snap-row" data-snap-row></div>
      <div class="ch7-controls-grid">${rangeControl({ label: "扫描角 θ（度）", key: "angle", value: state.angle, min: -180, max: 180, step: 1 })}</div>
    </div>`;
    const plane = section.querySelector("[data-eigen-plane]");
    const panel = section.querySelector("[data-eigen-panel]");
    const snapRow = section.querySelector("[data-snap-row]");
    const render = () => {
      const preset = presets[state.preset];
      const theta = (state.angle * Math.PI) / 180;
      const v = [Math.cos(theta), Math.sin(theta)];
      const Av = matVec(preset.A, v);
      const error = norm(Av) < EPS ? 0 : Math.abs(cross2(v, Av)) / norm(Av);
      const lambda = dot(v, Av);
      const hit = error < 0.018;
      plane.innerHTML = svgPlane({
        id: "eigen",
        vectors: [
          { to: v, color: "var(--ch7-a)", label: "v" },
          { to: Av, color: hit ? "var(--success)" : "var(--ch7-c)", label: "Av" },
        ],
        lines: hit ? [{ direction: v, color: "var(--success)" }] : [],
        circle: true,
        extent: 3.2,
      });
      panel.innerHTML = `<span class="ch7-panel-kicker">方向判定</span><h4>${hit ? "命中特征直线" : preset.dirs.length ? "仍在偏转" : "没有实特征方向"}</h4><p>${hit ? `Av 与 v 共线，伸缩比约为 ${fmt(lambda)}。` : "叉积误差不为零，Av 离开了 v 所在直线。"}</p><div class="ch7-meter"><span style="width:${clamp(error * 100, 0, 100)}%"></span></div><dl class="ch7-ledger"><div><dt>v</dt><dd>${vectorText(v)}</dd></div><div><dt>Av</dt><dd>${vectorText(Av)}</dd></div><div><dt>共线误差</dt><dd>${fmt(error, 4)}</dd></div><div><dt>Rayleigh 比</dt><dd>${fmt(lambda)}</dd></div></dl><div class="ch7-formula-mini">${display(`\\det(A-\\lambda I)=${preset.poly}`)}</div>`;
      snapRow.innerHTML = preset.dirs.length
        ? `<span>吸附到真实特征方向：</span>${preset.dirs.map((angle, i) => `<button type="button" data-snap="${angle}">${angle}° · λ=${preset.values[i]}</button>`).join("")}`
        : `<span>实数域中没有可吸附方向；换到复数域才会出现特征值。</span>`;
      snapRow.querySelectorAll("[data-snap]").forEach((button) => button.addEventListener("click", () => {
        state.angle = Number(button.dataset.snap);
        const input = section.querySelector('[data-range="angle"]');
        if (input) input.value = state.angle;
        const output = section.querySelector('[data-output="angle"]');
        if (output) output.textContent = fmt(state.angle);
        render();
      }, { once: true }));
    };
    section.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
      state.preset = Number(button.dataset.preset);
      state.angle = presets[state.preset].dirs[0] ?? 15;
      const input = section.querySelector('[data-range="angle"]');
      if (input) input.value = state.angle;
      section.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    }));
    const cleanupRanges = bindRanges(section, state, render);
    render();
    return cleanupRanges;
  }

  function renderDiagonal(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "对称可对角化", A: [[2, 1], [1, 2]], P: [[1, 1], [1, -1]], D: [[3, 0], [0, 1]], eigen: [[1, 1], [1, -1]] },
      { name: "非对称可对角化", A: [[3, 1], [0, 2]], P: [[1, -1], [0, 1]], D: [[3, 0], [0, 2]], eigen: [[1, 0], [-1, 1]] },
      { name: "Jordan 块", A: [[2, 1], [0, 2]], P: null, D: null, eigen: [[1, 0]] },
    ];
    const state = { preset: 0, power: 3, swapped: false };
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab">
      ${labHeader(lesson.interactive.title, lesson.interactive.description)}
      ${presetButtons(presets, state.preset)}
      <div class="ch7-diagonal-layout"><div data-diagonal-plane></div><div class="ch7-diagonal-panel" data-diagonal-panel></div></div>
      <div class="ch7-action-row"><button type="button" data-swap>交换特征向量顺序</button></div>
      <div class="ch7-controls-grid">${rangeControl({ label: "幂 n", key: "power", value: state.power, min: 0, max: 8, step: 1 })}</div>
    </div>`;
    const plane = section.querySelector("[data-diagonal-plane]");
    const panel = section.querySelector("[data-diagonal-panel]");
    const swapButton = section.querySelector("[data-swap]");
    const render = () => {
      const preset = presets[state.preset];
      let P = preset.P?.map((row) => [...row]) || null;
      let D = preset.D?.map((row) => [...row]) || null;
      let eigen = preset.eigen.map((v) => [...v]);
      if (state.swapped && P) {
        P = [[P[0][1], P[0][0]], [P[1][1], P[1][0]]];
        D = [[D[1][1], 0], [0, D[0][0]]];
        eigen = [eigen[1], eigen[0]];
      }
      const APower = matPow(preset.A, state.power);
      plane.innerHTML = `${svgPlane({
        id: "diagonal",
        vectors: eigen.map((v, i) => ({ to: normalize(v), color: i === 0 ? "var(--ch7-a)" : "var(--ch7-b)", label: `v${i + 1}` })),
        lines: eigen.map((v, i) => ({ direction: v, color: i === 0 ? "var(--ch7-a)" : "var(--ch7-b)" })),
        extent: 2.6,
      })}<div class="ch7-plane-caption">${P ? "特征向量构成一组基" : "只有一条独立特征直线"}</div>`;
      if (P) {
        const Pinv = inv2(P);
        const reconstructed = matMul(matMul(P, D), Pinv);
        const DPower = [[D[0][0] ** state.power, 0], [0, D[1][1] ** state.power]];
        const viaDiagonal = matMul(matMul(P, DPower), Pinv);
        panel.innerHTML = `<span class="ch7-panel-kicker">三步翻译</span><h4>A = P D P⁻¹</h4><div class="ch7-pipeline"><div><span>P⁻¹</span><small>旧坐标 → 特征坐标</small></div><i>→</i><div><span>D</span><small>各轴独立缩放</small></div><i>→</i><div><span>P</span><small>返回旧坐标</small></div></div><div class="ch7-matrix-triplet"><div><span>P</span>${matrixHtml(P)}</div><div><span>D</span>${matrixHtml(D)}</div><div><span>P⁻¹AP</span>${matrixHtml(matMul(matMul(Pinv, preset.A), P))}</div></div><dl class="ch7-ledger"><div><dt>重构误差</dt><dd>${fmt(matrixNorm(reconstructed.map((row, i) => row.map((v, j) => v - preset.A[i][j]))), 5)}</dd></div><div><dt>Aⁿ</dt><dd>n=${state.power}</dd></div><div><dt>对角路线校验</dt><dd>${matrixNorm(viaDiagonal.map((row, i) => row.map((v, j) => v - APower[i][j]))) < 1e-6 ? "通过" : "失败"}</dd></div></dl><div class="ch7-power-matrix"><span>Aⁿ</span>${matrixHtml(APower)}</div>`;
      } else {
        panel.innerHTML = `<span class="ch7-panel-kicker">对角化闸门关闭</span><h4>独立特征向量不足</h4><p>唯一特征值为 2，但特征子空间只有一维，无法组成二维特征基。</p><div class="ch7-matrix-pair"><div><span>A</span>${matrixHtml(preset.A)}</div><div><span>Aⁿ · n=${state.power}</span>${matrixHtml(APower)}</div></div><div class="ch7-note compact"><strong>失败原因</strong><p>特征多项式分裂并不够；几何重数必须补足空间维数。</p></div>`;
      }
      swapButton.disabled = !P;
      swapButton.textContent = state.swapped ? "恢复原特征向量顺序" : "交换特征向量顺序";
    };
    section.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
      state.preset = Number(button.dataset.preset);
      state.swapped = false;
      section.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    }));
    swapButton.addEventListener("click", () => {
      if (!presets[state.preset].P) return;
      state.swapped = !state.swapped;
      render();
    });
    const cleanupRanges = bindRanges(section, state, render);
    render();
    return cleanupRanges;
  }

  function rank2(A) {
    if (matrixNorm(A) < EPS) return 0;
    return Math.abs(det2(A)) > 1e-7 ? 2 : 1;
  }

  function kernelDirection2(A) {
    if (rank2(A) === 0) return [1, 0];
    if (rank2(A) === 2) return null;
    const row = norm(A[0]) > EPS ? A[0] : A[1];
    return normalize([-row[1], row[0]]);
  }

  function imageDirection2(A) {
    if (rank2(A) === 0) return null;
    if (rank2(A) === 2) return null;
    const c1 = [A[0][0], A[1][0]];
    const c2 = [A[0][1], A[1][1]];
    return normalize(norm(c1) > EPS ? c1 : c2);
  }

  function renderKernelImage(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "满秩", A: [[1, 0.5], [0.2, 1]], description: "平面 → 平面" },
      { name: "正交投影", A: [[1, 0], [0, 0]], description: "平面 → x 轴" },
      { name: "秩一压缩", A: [[0.5, 0.5], [1, 1]], description: "平面 → 斜直线" },
      { name: "零变换", A: [[0, 0], [0, 0]], description: "平面 → 原点" },
    ];
    const state = { preset: 1, x1: 1.4, x2: 1 };
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab">
      ${labHeader(lesson.interactive.title, lesson.interactive.description)}
      ${presetButtons(presets, state.preset)}
      <div class="ch7-dual-space"><article><div class="ch7-space-label">输入空间 V</div><div data-kernel-plane></div></article><div class="ch7-map-arrow">T →</div><article><div class="ch7-space-label">输出空间 W</div><div data-image-plane></div></article></div>
      <div class="ch7-controls-grid">${rangeControl({ label: "x₁", key: "x1", value: state.x1, min: -2.4, max: 2.4 })}${rangeControl({ label: "x₂", key: "x2", value: state.x2, min: -2.4, max: 2.4 })}</div>
      <div class="ch7-observation" data-kernel-ledger></div>
    </div>`;
    const inputPlane = section.querySelector("[data-kernel-plane]");
    const outputPlane = section.querySelector("[data-image-plane]");
    const ledger = section.querySelector("[data-kernel-ledger]");
    const render = () => {
      const preset = presets[state.preset];
      const A = preset.A;
      const rank = rank2(A);
      const nullity = 2 - rank;
      const k = kernelDirection2(A);
      const image = imageDirection2(A);
      const x = [state.x1, state.x2];
      const Ax = matVec(A, x);
      const partner = k ? add(x, scale(0.9, k)) : null;
      const partnerOut = partner ? matVec(A, partner) : null;
      const inputLines = rank === 0 ? [] : k ? [{ direction: k, color: "var(--danger)", className: "ch7-kernel-line" }] : [];
      const outputLines = image ? [{ direction: image, color: "var(--success)", className: "ch7-image-line" }] : [];
      inputPlane.innerHTML = svgPlane({
        id: "kernel",
        vectors: [
          { to: x, color: "var(--ch7-a)", label: "x" },
          ...(partner ? [{ to: partner, color: "var(--ch7-b)", label: "x+k" }] : []),
        ],
        lines: inputLines,
        extent: 3,
      });
      outputPlane.innerHTML = svgPlane({
        id: "image",
        vectors: [
          { to: Ax, color: "var(--ch7-c)", label: "T(x)" },
          ...(partnerOut ? [{ to: partnerOut, color: "var(--ch7-b)", label: "T(x+k)" }] : []),
        ],
        lines: outputLines,
        points: rank === 0 ? [{ at: [0, 0], radius: 7, color: "var(--success)" }] : [],
        extent: rank === 1 ? 5.5 : 4,
      });
      const kernelLabel = rank === 2 ? "{0}" : rank === 1 ? `span${vectorText(k)}` : "整个输入平面";
      const imageLabel = rank === 2 ? "整个输出平面" : rank === 1 ? `span${vectorText(image)}` : "{0}";
      ledger.innerHTML = `<div><span class="ch7-status-dot ${rank === 2 ? "is-pass" : "is-warn"}"></span><strong>${preset.description}</strong><p>${partnerOut && norm(sub(Ax, partnerOut)) < 1e-7 ? "沿核方向改变输入，输出完全不变。" : rank === 2 ? "没有非零核方向，输入可被唯一恢复。" : "所有输入都落到同一个输出点。"}</p></div><dl><div><dt>rank T</dt><dd>${rank}</dd></div><div><dt>nullity T</dt><dd>${nullity}</dd></div><div><dt>ker T</dt><dd>${kernelLabel}</dd></div><div><dt>im T</dt><dd>${imageLabel}</dd></div><div><dt>维数账本</dt><dd>2 = ${nullity} + ${rank}</dd></div></dl>`;
    };
    section.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
      state.preset = Number(button.dataset.preset);
      section.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    }));
    const cleanupRanges = bindRanges(section, state, render);
    render();
    return cleanupRanges;
  }

  function renderInvariant(section, lesson) {
    if (!section) return;
    const presets = [
      { name: "上三角", A: [[2, 1], [0, 1]], dirs: [0, -45] },
      { name: "反射", A: [[1, 0], [0, -1]], dirs: [0, 90] },
      { name: "投影", A: [[1, 0], [0, 0]], dirs: [0, 90] },
      { name: "90°旋转", A: [[0, -1], [1, 0]], dirs: [] },
    ];
    const modes = [
      { id: "line", label: "候选直线" },
      { id: "plane", label: "整个平面" },
      { id: "zero", label: "零子空间" },
    ];
    const state = { preset: 0, mode: "line", angle: 20 };
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab">
      ${labHeader(lesson.interactive.title, lesson.interactive.description)}
      ${presetButtons(presets, state.preset)}
      <div class="ch7-mode-row">${modes.map((mode) => `<button type="button" class="${mode.id === state.mode ? "is-active" : ""}" data-mode="${mode.id}">${mode.label}</button>`).join("")}</div>
      <div class="ch7-invariant-layout"><div data-invariant-plane></div><div class="ch7-invariant-panel" data-invariant-panel></div></div>
      <div class="ch7-snap-row" data-invariant-snaps></div>
      <div class="ch7-controls-grid" data-angle-control>${rangeControl({ label: "直线方向 θ（度）", key: "angle", value: state.angle, min: -180, max: 180, step: 1 })}</div>
    </div>`;
    const plane = section.querySelector("[data-invariant-plane]");
    const panel = section.querySelector("[data-invariant-panel]");
    const snaps = section.querySelector("[data-invariant-snaps]");
    const angleControl = section.querySelector("[data-angle-control]");
    const render = () => {
      const preset = presets[state.preset];
      const theta = (state.angle * Math.PI) / 180;
      const v = [Math.cos(theta), Math.sin(theta)];
      const Av = matVec(preset.A, v);
      const invariantLine = norm(Av) < EPS || Math.abs(cross2(v, Av)) / Math.max(norm(Av), EPS) < 0.018;
      const invariant = state.mode === "line" ? invariantLine : true;
      const u = [-v[1], v[0]];
      const P = [[v[0], u[0]], [v[1], u[1]]];
      const B = matMul(matMul(inv2(P), preset.A), P);
      if (state.mode === "line") {
        plane.innerHTML = svgPlane({
          id: "invariant",
          vectors: [
            { to: v, color: "var(--ch7-a)", label: "w" },
            { to: Av, color: invariant ? "var(--success)" : "var(--ch7-c)", label: "T(w)" },
          ],
          lines: [
            { direction: v, color: "var(--ch7-a)", className: "ch7-subspace-line" },
            ...(!invariant ? [{ direction: Av, color: "var(--ch7-c)", className: "ch7-image-line" }] : []),
          ],
          extent: 3.2,
        });
      } else if (state.mode === "plane") {
        plane.innerHTML = `<div class="ch7-whole-space"><div class="ch7-whole-grid"></div><strong>W = R²</strong><p>所有输出仍属于整个平面，因此对任意算子都不变。</p></div>`;
      } else {
        plane.innerHTML = `<div class="ch7-zero-space"><span>0</span><strong>W = {0}</strong><p>T(0)=0，因此零子空间始终不变。</p></div>`;
      }
      if (state.mode === "line") {
        panel.innerHTML = `<span class="ch7-panel-kicker">不变性闸门</span><h4>${invariant ? "T(W) ⊆ W" : "T(W) 离开 W"}</h4><p>${invariant ? "采样向量的像仍落在候选直线内。" : "像方向与候选直线分离，给出直接反例。"}</p><div class="ch7-adapted-matrix"><span>以 W 的方向作为第一基向量</span>${matrixHtml(B)}</div><dl class="ch7-ledger"><div><dt>左下元</dt><dd>${fmt(B[1][0], 4)}</dd></div><div><dt>含义</dt><dd>${Math.abs(B[1][0]) < 0.018 ? "T(w) 没有补空间分量" : "T(w) 含有补空间分量"}</dd></div><div><dt>逐点固定?</dt><dd>${invariant && norm(sub(Av, v)) < 0.02 ? "是" : "不必"}</dd></div></dl>`;
      } else if (state.mode === "plane") {
        panel.innerHTML = `<span class="ch7-panel-kicker">不变性闸门</span><h4>T(R²) ⊆ R²</h4><p>整个定义域作为子空间，当然容纳这个算子的全部输出。</p><dl class="ch7-ledger"><div><dt>候选 W</dt><dd>R²</dd></div><div><dt>通过原因</dt><dd>陪域仍是 R²</dd></div><div><dt>逐点固定?</dt><dd>不要求</dd></div></dl><div class="ch7-mini-note">“不变”只要求不离开 W，不要求每个向量保持原位。</div>`;
      } else {
        panel.innerHTML = `<span class="ch7-panel-kicker">不变性闸门</span><h4>T({0}) = {0}</h4><p>线性性保证 T(0)=0，因此零子空间对每个线性算子都不变。</p><dl class="ch7-ledger"><div><dt>候选 W</dt><dd>{0}</dd></div><div><dt>通过原因</dt><dd>T(0)=0</dd></div><div><dt>维数</dt><dd>0</dd></div></dl><div class="ch7-mini-note">零子空间与整个空间是所有线性算子共有的两个基本不变子空间。</div>`;
      }
      angleControl.hidden = state.mode !== "line";
      snaps.innerHTML = state.mode === "line" && preset.dirs.length
        ? `<span>已知不变直线：</span>${preset.dirs.map((angle) => `<button type="button" data-snap="${angle}">${angle}°</button>`).join("")}`
        : state.mode === "line"
          ? `<span>这个预设没有实一维不变子空间。</span>`
          : `<span>不变性不等于逐点固定；整个空间和零子空间是基本实例。</span>`;
      snaps.querySelectorAll("[data-snap]").forEach((button) => button.addEventListener("click", () => {
        state.angle = Number(button.dataset.snap);
        const input = section.querySelector('[data-range="angle"]');
        if (input) input.value = state.angle;
        render();
      }, { once: true }));
    };
    section.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
      state.preset = Number(button.dataset.preset);
      state.angle = presets[state.preset].dirs[0] ?? 15;
      section.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    }));
    section.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      section.querySelectorAll("[data-mode]").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    }));
    const cleanupRanges = bindRanges(section, state, render);
    render();
    return cleanupRanges;
  }

  function applyMatrix(A, v) {
    return matVec(A, v);
  }

  function renderJordan(section, lesson) {
    if (!section) return;
    const structures = [
      { name: "J₂(λ)", size: 2, split: false },
      { name: "两个 1×1 块", size: 2, split: true },
      { name: "J₃(λ)", size: 3, split: false },
    ];
    const state = { structure: 0, lambda: 2, mode: "N", steps: 0, vector: null };
    const resetVector = () => {
      const spec = structures[state.structure];
      state.vector = Array(spec.size).fill(0);
      state.vector[spec.size - 1] = 1;
      state.steps = 0;
    };
    resetVector();
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab">
      ${labHeader(lesson.interactive.title, lesson.interactive.description)}
      ${presetButtons(structures, state.structure, "structure")}
      <div class="ch7-mode-row"><button type="button" class="is-active" data-jordan-mode="N">作用 N=T−λI</button><button type="button" data-jordan-mode="T">作用 T</button></div>
      <div class="ch7-jordan-layout"><div data-jordan-chain></div><div class="ch7-jordan-panel" data-jordan-panel></div></div>
      <div class="ch7-action-row"><button type="button" class="primary" data-jordan-step>作用一次</button><button type="button" data-jordan-reset>重置到链尾</button></div>
      <div class="ch7-controls-grid">${rangeControl({ label: "特征值 λ", key: "lambda", value: state.lambda, min: -2, max: 3, step: 0.5 })}</div>
    </div>`;
    const chain = section.querySelector("[data-jordan-chain]");
    const panel = section.querySelector("[data-jordan-panel]");
    const buildMatrices = () => {
      const spec = structures[state.structure];
      const J = zeroMatrix(spec.size);
      const N = zeroMatrix(spec.size);
      for (let i = 0; i < spec.size; i += 1) J[i][i] = state.lambda;
      if (!spec.split) {
        for (let i = 0; i < spec.size - 1; i += 1) {
          J[i][i + 1] = 1;
          N[i][i + 1] = 1;
        }
      }
      return { J, N, spec };
    };
    const render = () => {
      const { J, N, spec } = buildMatrices();
      const nodes = Array.from({ length: spec.size }, (_, i) => spec.size - i);
      const chainMarkup = spec.split
        ? nodes
            .map(
              (index) => `<div class="ch7-split-chain"><div class="ch7-chain-node ${Math.abs(state.vector[index - 1]) > 1e-8 ? "is-active" : ""}"><span>v${index}</span><small>${fmt(state.vector[index - 1])}</small></div><i>N →</i><div class="ch7-chain-zero">0</div></div>`,
            )
            .join('<i class="is-gap">∥</i>')
        : `${nodes
            .map(
              (index) => `<div class="ch7-chain-node ${Math.abs(state.vector[index - 1]) > 1e-8 ? "is-active" : ""}"><span>v${index}</span><small>${fmt(state.vector[index - 1])}</small></div><i>N →</i>`,
            )
            .join("")}<div class="ch7-chain-zero">0</div>`;
      chain.innerHTML = `<div class="ch7-chain-title"><span>${spec.name}</span><strong>${state.mode === "N" ? "链尾逐级送到链首，再归零" : "缩放与链传递同时发生"}</strong></div><div class="ch7-chain ${spec.split ? "is-split" : ""}">${chainMarkup}</div><div class="ch7-current-vector"><span>当前向量</span>${matrixHtml(state.vector.map((v) => [v]))}</div>`;
      panel.innerHTML = `<span class="ch7-panel-kicker">第 ${state.steps} 次作用后</span><h4>${state.mode === "N" ? "N = T−λI" : "T = λI+N"}</h4><div class="ch7-matrix-pair"><div><span>J</span>${matrixHtml(J)}</div><div><span>N</span>${matrixHtml(N)}</div></div><dl class="ch7-ledger"><div><dt>链长</dt><dd>${spec.split ? "1 与 1" : spec.size}</dd></div><div><dt>N 是否归零</dt><dd>${norm(state.vector) < EPS ? "当前向量已归零" : "尚未归零"}</dd></div><div><dt>幂零指数</dt><dd>${spec.split ? 1 : spec.size}</dd></div><div><dt>λ</dt><dd>${fmt(state.lambda)}</dd></div></dl><div class="ch7-mini-note">${spec.split ? "两个 1×1 块没有链传递；N=0。" : `链尾需要最多 ${spec.size} 次 N 作用才归零。`}</div>`;
    };
    section.querySelectorAll("[data-structure]").forEach((button) => button.addEventListener("click", () => {
      state.structure = Number(button.dataset.structure);
      section.querySelectorAll("[data-structure]").forEach((item) => item.classList.toggle("is-active", item === button));
      resetVector();
      render();
    }));
    section.querySelectorAll("[data-jordan-mode]").forEach((button) => button.addEventListener("click", () => {
      state.mode = button.dataset.jordanMode;
      section.querySelectorAll("[data-jordan-mode]").forEach((item) => item.classList.toggle("is-active", item === button));
      resetVector();
      render();
    }));
    section.querySelector("[data-jordan-step]").addEventListener("click", () => {
      const { J, N } = buildMatrices();
      state.vector = applyMatrix(state.mode === "N" ? N : J, state.vector);
      state.steps += 1;
      render();
    });
    section.querySelector("[data-jordan-reset]").addEventListener("click", () => {
      resetVector();
      render();
    });
    const cleanupRanges = bindRanges(section, state, () => {
      resetVector();
      render();
    });
    render();
    return cleanupRanges;
  }

  function polynomialEvaluateMatrix(coeffs, A) {
    let result = zeroMatrix(A.length);
    let power = identity(A.length);
    coeffs.forEach((coefficient) => {
      result = matAdd(result, matScale(coefficient, power));
      power = matMul(power, A);
    });
    return result;
  }

  function renderMinimal(section, lesson) {
    if (!section) return;
    const presets = [
      {
        name: "2I₂",
        A: [[2, 0], [0, 2]],
        minimal: "t-2",
        characteristic: "(t-2)^2",
        candidates: [
          { label: "t−2", coeffs: [-2, 1], kind: "minimal" },
          { label: "(t−2)²", coeffs: [4, -4, 1], kind: "characteristic" },
          { label: "t", coeffs: [0, 1], kind: "insufficient" },
        ],
      },
      {
        name: "J₂(2)",
        A: [[2, 1], [0, 2]],
        minimal: "(t-2)^2",
        characteristic: "(t-2)^2",
        candidates: [
          { label: "t−2", coeffs: [-2, 1], kind: "local" },
          { label: "(t−2)²", coeffs: [4, -4, 1], kind: "minimal" },
          { label: "(t−2)³", coeffs: [-8, 12, -6, 1], kind: "multiple" },
        ],
      },
      {
        name: "diag(2,−1)",
        A: [[2, 0], [0, -1]],
        minimal: "(t-2)(t+1)",
        characteristic: "(t-2)(t+1)",
        candidates: [
          { label: "t−2", coeffs: [-2, 1], kind: "insufficient" },
          { label: "t+1", coeffs: [1, 1], kind: "insufficient" },
          { label: "(t−2)(t+1)", coeffs: [-2, -1, 1], kind: "minimal" },
        ],
      },
      {
        name: "J₃(0)",
        A: [[0, 1, 0], [0, 0, 1], [0, 0, 0]],
        minimal: "t^3",
        characteristic: "t^3",
        candidates: [
          { label: "t", coeffs: [0, 1], kind: "local" },
          { label: "t²", coeffs: [0, 0, 1], kind: "local" },
          { label: "t³", coeffs: [0, 0, 0, 1], kind: "minimal" },
        ],
      },
    ];
    const state = { preset: 1, candidate: 0 };
    section.innerHTML = `<h2>交互实验</h2><div class="ch7-lab">
      ${labHeader(lesson.interactive.title, lesson.interactive.description)}
      ${presetButtons(presets, state.preset)}
      <div class="ch7-minimal-layout"><div class="ch7-candidate-panel"><span class="ch7-panel-kicker">候选多项式</span><div data-candidates></div></div><div class="ch7-minimal-result" data-minimal-result></div></div>
    </div>`;
    const candidates = section.querySelector("[data-candidates]");
    const result = section.querySelector("[data-minimal-result]");
    const render = () => {
      const preset = presets[state.preset];
      const candidate = preset.candidates[state.candidate];
      const pA = polynomialEvaluateMatrix(candidate.coeffs, preset.A);
      const isZero = matrixNorm(pA) < 1e-7;
      const basisOutputs = identity(preset.A.length).map((_, j) => matVec(pA, identity(preset.A.length).map((row) => row[j])));
      const zeroColumns = basisOutputs.filter((v) => norm(v) < 1e-7).length;
      const localOnly = !isZero && zeroColumns > 0;
      candidates.innerHTML = preset.candidates.map((item, index) => `<button type="button" class="ch7-candidate ${index === state.candidate ? "is-active" : ""}" data-candidate="${index}"><strong>${item.label}</strong><span>${item.kind === "minimal" ? "最小候选" : item.kind === "characteristic" ? "特征多项式" : item.kind === "multiple" ? "更高次倍式" : "先测试"}</span></button>`).join("");
      candidates.querySelectorAll("[data-candidate]").forEach((button) => button.addEventListener("click", () => {
        state.candidate = Number(button.dataset.candidate);
        render();
      }, { once: true }));
      result.innerHTML = `<div class="ch7-minimal-status ${isZero ? "is-pass" : localOnly ? "is-warn" : "is-fail"}"><span>${isZero ? "p(A)=0" : localOnly ? "只消掉部分方向" : "p(A)≠0"}</span><strong>${candidate.label}</strong><p>${isZero ? "这个多项式全局湮灭 A。" : localOnly ? "某些基向量被消掉，但仍有方向留下非零输出。" : "至少一个基方向仍得到非零结果。"}</p></div><div class="ch7-matrix-pair"><div><span>A</span>${matrixHtml(preset.A)}</div><div><span>p(A)</span>${matrixHtml(pA)}</div></div><div class="ch7-probe-grid">${basisOutputs.map((v, i) => `<div><span>p(A)e${i + 1}</span><strong>${vectorText(v)}</strong></div>`).join("")}</div><dl class="ch7-ledger"><div><dt>最小多项式</dt><dd>${preset.minimal}</dd></div><div><dt>特征多项式</dt><dd>${preset.characteristic}</dd></div><div><dt>当前候选次数</dt><dd>${candidate.coeffs.length - 1}</dd></div><div><dt>结论</dt><dd>${candidate.kind === "minimal" ? "最低首一全局关系" : isZero ? "能湮灭，但还要检查是否最低" : "不是湮灭多项式"}</dd></div></dl>`;
    };
    section.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
      state.preset = Number(button.dataset.preset);
      state.candidate = 0;
      section.querySelectorAll("[data-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    }));
    render();
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
