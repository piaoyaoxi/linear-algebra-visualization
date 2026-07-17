(() => {
  const q = (root, selector) => root.querySelector(selector);
  const qa = (root, selector) => [...root.querySelectorAll(selector)];
  const mi = (source) => window.texInline ? window.texInline(source) : `<code>${source}</code>`;
  const md = (source) => window.texDisplay ? window.texDisplay(source) : `<code>${source}</code>`;
  const n = (value, digits = 2) => {
    const rounded = Math.round((Number(value) || 0) * 10 ** digits) / 10 ** digits;
    return String(Object.is(rounded, -0) ? 0 : rounded);
  };
  const det = (m) => m[0] * m[3] - m[1] * m[2];
  const mul = (m, v) => [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]];
  const inv = (m) => {
    const d = det(m);
    return Math.abs(d) < 1e-8 ? null : [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d];
  };
  const matrix = (m) => `<span class="ch10-matrix"><span>${n(m[0])}</span><span>${n(m[1])}</span><span>${n(m[2])}</span><span>${n(m[3])}</span></span>`;
  const control = (id, label, min, max, step, value) => `<label class="ch10-range"><span>${label}</span><output data-out="${id}">${value}</output><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
  const grid = (range = 4) => {
    let paths = "";
    for (let i = -range; i <= range; i += 1) {
      const p = 50 + (i / range) * 42;
      paths += `<path d="M8 ${p}H92 M${p} 8V92" class="${i === 0 ? "axis" : "grid"}"/>`;
    }
    return paths;
  };
  const point = (v, range = 4) => [50 + (v[0] / range) * 42, 50 - (v[1] / range) * 42];
  const arrow = (v, label, cls, range = 4) => {
    const [x, y] = point(v, range);
    return `<line x1="50" y1="50" x2="${x}" y2="${y}" class="vector ${cls}" marker-end="url(#arrow-${cls})"/><text x="${x + 2}" y="${y - 2}" class="label ${cls}">${label}</text>`;
  };
  const defs = `<defs><marker id="arrow-a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8Z"/></marker><marker id="arrow-b" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8Z"/></marker></defs>`;
  const lineEndpoints = (a, b, c, range = 4) => {
    const pts = [];
    const add = (x, y) => {
      if (x >= -range - 1e-6 && x <= range + 1e-6 && y >= -range - 1e-6 && y <= range + 1e-6) pts.push([x, y]);
    };
    if (Math.abs(b) > 1e-8) { add(-range, (c + a * range) / b); add(range, (c - a * range) / b); }
    if (Math.abs(a) > 1e-8) { add((c + b * range) / a, -range); add((c - b * range) / a, range); }
    return pts.length >= 2 ? [point(pts[0], range), point(pts[1], range)] : null;
  };
  const implicit = (a, b, c, cls) => {
    const ends = lineEndpoints(a, b, c);
    return ends ? `<line x1="${ends[0][0]}" y1="${ends[0][1]}" x2="${ends[1][0]}" y2="${ends[1][1]}" class="${cls}"/>` : "";
  };

  function syncOutputs(root) {
    qa(root, "input[type=range]").forEach((input) => {
      const output = q(root, `[data-out="${input.id}"]`);
      if (output) output.textContent = n(input.value);
    });
  }

  function theory(section, root) {
    const mount = q(root, `[data-ch10-theory="${section.id}"]`);
    if (!mount) return;
    const boundary = {
      "linear-functional": "线性函数本身不是一支法向箭头；只有选定坐标和内积后，才可用向量代表它。",
      "dual-space": "维数相同不代表 V 与 V* 天然相等；对偶基是读取器，不是原空间中的另一组方向。",
      "bilinear-form": "一般双线性函数不必对称、正定或非退化；二次型会丢失斜对称部分。",
      "symplectic-space": "二维中 det S = 1 与辛条件等价是特殊现象，高维体积保持远弱于辛保持。",
    }[section.id];
    mount.innerHTML = `<p class="ch10-theory-lead">${section.concepts.map((item) => `<span class="term-chip">${item.label}</span> ${item.text}`).join(" ")}</p><div class="ch10-theory-grid">${section.theory.map((item) => `<article class="ch10-theory-card"><span>${item.number}</span><div><h3>${item.title}</h3><p>${item.text}</p>${item.formula ? `<div class="ch10-formula">${md(item.formula)}</div>` : ""}</div></article>`).join("")}</div><aside class="ch10-boundary"><strong>概念边界</strong><p>${boundary}</p></aside>`;
  }

  function shell(section, body) {
    return `<div class="visual-panel ch10-panel"><div class="visual-title"><div><h3>${section.interactive.title}</h3><p>${section.interactive.description}</p></div></div>${body}</div>`;
  }

  function functional(section, mount) {
    mount.innerHTML = shell(section, `<div class="ch10-lab functional-lab"><div class="ch10-stage"><svg viewBox="0 0 100 100" data-functional-svg role="img" aria-label="线性函数等值线与核空间"></svg><div class="ch10-stage-caption" data-functional-caption></div></div><div class="ch10-controls"><div class="ch10-presets"><button data-f-preset="x1">读取 x₁</button><button data-f-preset="sum" class="is-active">求和</button><button data-f-preset="diff">作差</button><button data-f-preset="zero">零函数</button></div>${control("f-a", "函数系数 a", -3, 3, .1, 1)}${control("f-b", "函数系数 b", -3, 3, .1, 1)}${control("f-x", "向量 x₁", -3.5, 3.5, .1, 2)}${control("f-y", "向量 x₂", -3.5, 3.5, .1, 1)}<div class="ch10-readout" data-functional-readout></div></div></div>`);
    const svg = q(mount, "[data-functional-svg]");
    const inputs = ["f-a", "f-b", "f-x", "f-y"].map((id) => q(mount, `#${id}`));
    const update = () => {
      syncOutputs(mount);
      const [a, b, x, y] = inputs.map((input) => Number(input.value));
      const value = a * x + b * y;
      const zero = Math.hypot(a, b) < 1e-8;
      const levels = zero ? "" : [-4, -2, 2, 4].map((c) => implicit(a, b, c, "level")).join("");
      svg.innerHTML = `${defs}<g>${grid()}</g>${levels}${zero ? "" : implicit(a, b, 0, "kernel")}${arrow([x, y], "x", "a")}<circle cx="${point([x, y])[0]}" cy="${point([x, y])[1]}" r="2.2" class="drag-dot"/></g>`;
      q(mount, "[data-functional-caption]").innerHTML = zero ? `<strong>零函数</strong><span>整个平面都是核空间</span>` : `<strong>f(x) = ${n(value)}</strong><span>${Math.abs(value) < .05 ? "向量位于核上" : "沿同一条等值线移动，读数不变"}</span>`;
      q(mount, "[data-functional-readout]").innerHTML = `<div><span>线性函数</span><strong>f(u) = ${n(a)}u₁ + ${n(b)}u₂</strong></div><div><span>当前输入</span><strong>x = (${n(x)}, ${n(y)})ᵀ</strong></div><div><span>函数值</span><strong>${n(value)}</strong></div><div><span>核</span><strong>${zero ? "ker f = ℝ²" : `${n(a)}u₁ + ${n(b)}u₂ = 0`}</strong></div>`;
    };
    qa(mount, "input").forEach((el) => el.addEventListener("input", update));
    qa(mount, "[data-f-preset]").forEach((button) => button.addEventListener("click", () => {
      const p = { x1: [1, 0], sum: [1, 1], diff: [1, -1], zero: [0, 0] }[button.dataset.fPreset];
      inputs[0].value = p[0]; inputs[1].value = p[1];
      qa(mount, "[data-f-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
      update();
    }));
    let dragging = false;
    svg.addEventListener("pointerdown", (event) => { dragging = true; svg.setPointerCapture(event.pointerId); });
    svg.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const rect = svg.getBoundingClientRect();
      inputs[2].value = Math.max(-3.5, Math.min(3.5, ((event.clientX - rect.left) / rect.width * 100 - 50) / 10.5));
      inputs[3].value = Math.max(-3.5, Math.min(3.5, (50 - (event.clientY - rect.top) / rect.height * 100) / 10.5));
      update();
    });
    svg.addEventListener("pointerup", () => { dragging = false; });
    update();
  }

  function dual(section, mount) {
    mount.innerHTML = shell(section, `<div class="ch10-dual-lab"><div class="ch10-dual-spaces"><article><header><strong>向量空间 V</strong><span>被测量的向量</span></header><svg viewBox="0 0 100 100" data-dual-vector></svg></article><div class="ch10-pairing"><span>自然配对</span><strong data-dual-pair></strong></div><article><header><strong>对偶空间 V*</strong><span>线性函数的参数</span></header><svg viewBox="0 0 100 100" data-dual-function></svg></article></div><div class="ch10-controls"><div class="ch10-presets"><button data-basis="standard" class="is-active">标准基</button><button data-basis="skew">斜基</button><button data-basis="near">接近共线</button><button data-basis="singular">精确共线</button></div>${control("d-x1", "向量 x₁", -3, 3, .1, 2)}${control("d-x2", "向量 x₂", -3, 3, .1, 1)}${control("d-a", "函数系数 a", -3, 3, .1, 1)}${control("d-b", "函数系数 b", -3, 3, .1, -1)}<div class="ch10-readout" data-dual-readout></div></div></div>`);
    const vectorSvg = q(mount, "[data-dual-vector]");
    const functionSvg = q(mount, "[data-dual-function]");
    const inputs = ["d-x1", "d-x2", "d-a", "d-b"].map((id) => q(mount, `#${id}`));
    let basis = [[1, 0], [0, 1]];
    const presets = { standard: [[1, 0], [0, 1]], skew: [[1, .5], [.8, 1.4]], near: [[1.4, .5], [1.5, .55]], singular: [[1, .5], [2, 1]] };
    const update = () => {
      syncOutputs(mount);
      const [x1, x2, a, b] = inputs.map((item) => Number(item.value));
      const x = [x1, x2];
      const P = [basis[0][0], basis[1][0], basis[0][1], basis[1][1]];
      const inverse = inv(P);
      const coordinates = inverse ? mul(inverse, x) : null;
      const pairing = a * x1 + b * x2;
      vectorSvg.innerHTML = `${defs}<g>${grid()}${arrow(basis[0], "v₁", "b")}${arrow(basis[1], "v₂", "b")}${arrow(x, "x", "a")}</g>`;
      functionSvg.innerHTML = `${defs}<g>${grid()}${arrow([a, b], "f", "a")}</g>`;
      q(mount, "[data-dual-pair]").textContent = `f(x) = ${n(pairing)}`;
      q(mount, "[data-dual-readout]").innerHTML = inverse ? `<div><span>自然配对</span><strong>[${n(a)}, ${n(b)}] · (${n(x1)}, ${n(x2)})ᵀ = ${n(pairing)}</strong></div><div><span>基矩阵</span><strong>${matrix(P)}</strong></div><div><span>对偶基行列式</span><strong>${matrix(inverse)}</strong></div><div><span>斜基坐标</span><strong>(${n(coordinates[0])}, ${n(coordinates[1])})ᵀ</strong></div>` : `<div class="is-warning"><span>这两支向量不构成基</span><strong>det P = 0，对偶基不存在</strong></div><div><span>自然配对仍存在</span><strong>f(x) = ${n(pairing)}</strong></div>`;
    };
    qa(mount, "input").forEach((el) => el.addEventListener("input", update));
    qa(mount, "[data-basis]").forEach((button) => button.addEventListener("click", () => {
      basis = presets[button.dataset.basis];
      qa(mount, "[data-basis]").forEach((item) => item.classList.toggle("is-active", item === button));
      update();
    }));
    update();
  }

  function bilinear(section, mount) {
    mount.innerHTML = shell(section, `<div class="ch10-lab bilinear-lab"><div class="ch10-stage"><svg viewBox="0 0 100 100" data-bilinear-svg></svg><div class="ch10-stage-caption" data-bilinear-caption></div></div><div class="ch10-controls"><div class="ch10-presets"><button data-bi="symmetric" class="is-active">对称</button><button data-bi="alternating">交错</button><button data-bi="general">一般</button><button data-bi="degenerate">退化</button></div><div class="ch10-vector-controls"><div>${control("bi-x1", "x₁", -3, 3, .1, 1)}${control("bi-x2", "x₂", -3, 3, .1, 2)}</div><div>${control("bi-y1", "y₁", -3, 3, .1, 2)}${control("bi-y2", "y₂", -3, 3, .1, -1)}</div></div><div class="ch10-matrix-controls">${control("bi-a", "a₁₁", -3, 3, .1, 2)}${control("bi-b", "a₁₂", -3, 3, .1, 1)}${control("bi-c", "a₂₁", -3, 3, .1, 1)}${control("bi-d", "a₂₂", -3, 3, .1, 2)}</div><button class="ch10-action" data-radical>显示左根方向</button><div class="ch10-readout" data-bi-readout></div></div></div>`);
    const svg = q(mount, "[data-bilinear-svg]");
    const ids = ["bi-x1", "bi-x2", "bi-y1", "bi-y2", "bi-a", "bi-b", "bi-c", "bi-d"];
    const inputs = ids.map((id) => q(mount, `#${id}`));
    const presets = { symmetric: [2, 1, 1, 2], alternating: [0, 1, -1, 0], general: [2, 1, -1, 3], degenerate: [1, 2, 2, 4] };
    const update = () => {
      syncOutputs(mount);
      const values = inputs.map((item) => Number(item.value));
      const x = values.slice(0, 2), y = values.slice(2, 4), A = values.slice(4);
      const Ay = mul(A, y), Ax = mul(A, x);
      const bxy = x[0] * Ay[0] + x[1] * Ay[1];
      const byx = y[0] * Ax[0] + y[1] * Ax[1];
      const symmetric = Math.abs(A[1] - A[2]) < 1e-7;
      const alternating = Math.abs(A[0]) + Math.abs(A[3]) + Math.abs(A[1] + A[2]) < 1e-7;
      const determinant = det(A);
      svg.innerHTML = `${defs}<g>${grid()}${arrow(x, "x", "a")}${arrow(y, "y", "b")}${implicit(Ay[0], Ay[1], bxy, "level")}</g>`;
      q(mount, "[data-bilinear-caption]").innerHTML = `<strong>B(x,y) = ${n(bxy)}</strong><span>固定 y 后，等值线垂直于 Ay</span>`;
      q(mount, "[data-bi-readout]").innerHTML = `<div><span>配对矩阵 A</span><strong>${matrix(A)}</strong></div><div><span>B(x,y)</span><strong>${n(bxy)}</strong></div><div><span>B(y,x)</span><strong>${n(byx)}</strong></div><div><span>结构</span><strong>${alternating ? "交错" : symmetric ? "对称" : "一般"} · ${Math.abs(determinant) < 1e-7 ? "退化" : "非退化"}</strong></div><div><span>二次型 Q(x)</span><strong>${n(x[0] * Ax[0] + x[1] * Ax[1])}</strong></div>`;
    };
    qa(mount, "input").forEach((el) => el.addEventListener("input", update));
    qa(mount, "[data-bi]").forEach((button) => button.addEventListener("click", () => {
      const A = presets[button.dataset.bi];
      A.forEach((value, index) => { inputs[index + 4].value = value; });
      qa(mount, "[data-bi]").forEach((item) => item.classList.toggle("is-active", item === button));
      update();
    }));
    q(mount, "[data-radical]").addEventListener("click", () => {
      const A = inputs.slice(4).map((item) => Number(item.value));
      if (Math.abs(det(A)) > 1e-7) return;
      const direction = Math.abs(A[0]) + Math.abs(A[1]) > 1e-7 ? [-A[1], A[0]] : [-A[3], A[2]];
      inputs[0].value = direction[0]; inputs[1].value = direction[1]; update();
    });
    update();
  }

  function transformMatrix(key, t) {
    if (key === "identity") return [1, 0, 0, 1];
    if (key === "shear") return [1, t, 0, 1];
    if (key === "reciprocal") { const s = t >= 0 ? 1 + Math.abs(t) : 1 / (1 + Math.abs(t)); return [s, 0, 0, 1 / s]; }
    if (key === "rotation") { const a = t * Math.PI / 3; return [Math.cos(a), -Math.sin(a), Math.sin(a), Math.cos(a)]; }
    const s = t >= 0 ? 1 + Math.abs(t) : 1 / (1 + Math.abs(t)); return [s, 0, 0, s];
  }

  function parallelogram(x, y, cls) {
    const p0 = point([0, 0]), p1 = point(x), p2 = point([x[0] + y[0], x[1] + y[1]]), p3 = point(y);
    return `<polygon points="${p0} ${p1} ${p2} ${p3}" class="area ${cls}"/>${arrow(x, "x", "a")}${arrow(y, "y", "b")}`;
  }

  function symplectic(section, mount) {
    mount.innerHTML = shell(section, `<div class="ch10-symplectic"><div class="ch10-sym-stages"><article><header>原配对 ω(x,y)</header><svg viewBox="0 0 100 100" data-sym-left></svg></article><article><header>变换后 ω(Sx,Sy)</header><svg viewBox="0 0 100 100" data-sym-right></svg></article></div><div class="ch10-controls"><div class="ch10-presets"><button data-sym="identity">原始</button><button data-sym="shear" class="is-active">剪切</button><button data-sym="reciprocal">互补缩放</button><button data-sym="rotation">旋转</button><button data-sym="uniform">均匀缩放</button></div><div class="ch10-presets secondary"><button data-action="swap">交换 x 与 y</button><button data-action="collinear">令两向量共线</button><button data-action="reset">重置向量</button></div><div class="ch10-vector-controls"><div>${control("s-x1", "x₁", -3, 3, .1, 2)}${control("s-x2", "x₂", -3, 3, .1, 1)}</div><div>${control("s-y1", "y₁", -3, 3, .1, -1)}${control("s-y2", "y₂", -3, 3, .1, 2)}</div></div>${control("s-t", "变换参数", -2, 2, .1, 1)}<div class="ch10-readout" data-sym-readout></div><aside class="ch10-highdim"><strong>四维反例</strong><p>在基顺序 (e₁,e₂,f₁,f₂) 下，D = diag(2,1/2,1,1) 的行列式为 1，但 DᵀJD ≠ J。</p></aside></div></div>`);
    const left = q(mount, "[data-sym-left]"), right = q(mount, "[data-sym-right]");
    const inputs = ["s-x1", "s-x2", "s-y1", "s-y2", "s-t"].map((id) => q(mount, `#${id}`));
    let key = "shear";
    const update = () => {
      syncOutputs(mount);
      const [x1, x2, y1, y2, t] = inputs.map((item) => Number(item.value));
      const x = [x1, x2], y = [y1, y2], S = transformMatrix(key, t), sx = mul(S, x), sy = mul(S, y);
      const area = x1 * y2 - x2 * y1, transformed = sx[0] * sy[1] - sx[1] * sy[0];
      left.innerHTML = `${defs}<g>${grid()}${parallelogram(x, y, area >= 0 ? "positive" : "negative")}</g>`;
      right.innerHTML = `${defs}<g>${grid()}${parallelogram(sx, sy, transformed >= 0 ? "positive" : "negative")}</g>`;
      const d = det(S), sym = Math.abs(d - 1) < 1e-7;
      q(mount, "[data-sym-readout]").innerHTML = `<div><span>变换矩阵 S</span><strong>${matrix(S)}</strong></div><div><span>原配对</span><strong>ω(x,y) = ${n(area)}</strong></div><div><span>变换后</span><strong>ω(Sx,Sy) = ${n(transformed)}</strong></div><div><span>辛条件</span><strong>${sym ? "SᵀJS = J" : `SᵀJS ≠ J（缩放 ${n(d)}）`}</strong></div><div><span>方向</span><strong>${Math.abs(area) < 1e-7 ? "共线" : area > 0 ? "逆时针 · 正" : "顺时针 · 负"}</strong></div>`;
    };
    qa(mount, "input").forEach((el) => el.addEventListener("input", update));
    qa(mount, "[data-sym]").forEach((button) => button.addEventListener("click", () => {
      key = button.dataset.sym; qa(mount, "[data-sym]").forEach((item) => item.classList.toggle("is-active", item === button)); update();
    }));
    qa(mount, "[data-action]").forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.action === "swap") { const x = [inputs[0].value, inputs[1].value]; inputs[0].value = inputs[2].value; inputs[1].value = inputs[3].value; inputs[2].value = x[0]; inputs[3].value = x[1]; }
      if (button.dataset.action === "collinear") { inputs[2].value = Number(inputs[0].value) * .75; inputs[3].value = Number(inputs[1].value) * .75; }
      if (button.dataset.action === "reset") { [2, 1, -1, 2].forEach((value, i) => { inputs[i].value = value; }); }
      update();
    }));
    update();
  }

  const renderers = { "functional-field": functional, "dual-probe": dual, "bilinear-mixer": bilinear, "symplectic-area": symplectic };
  function mountChapter10Lesson(section, root) {
    theory(section, root);
    const mount = q(root, `[data-ch10-lab="${section.interactive?.type || ""}"]`);
    renderers[section.interactive?.type]?.(section, mount);
  }
  function renderChapter10OverviewVisual() {
    return `<div class="ch10-overview" aria-hidden="true"><span>V<small>向量</small></span><i>→</i><span>V*<small>测量</small></span><i>→</i><span>B(x,y)<small>配对</small></span><i>→</i><span>ω<small>辛形式</small></span></div>`;
  }
  function renderChapter10SectionGlyph(id) {
    const glyph = { "linear-functional": "f(x)", "dual-space": "V*", "bilinear-form": "B(x,y)", "symplectic-space": "ω" }[id] || "10";
    return `<div class="ch10-glyph" aria-hidden="true"><span>${glyph}</span></div>`;
  }
  window.mountChapter10Lesson = mountChapter10Lesson;
  window.teardownChapter10Lesson = () => {};
  window.renderChapter10OverviewVisual = renderChapter10OverviewVisual;
  window.renderChapter10SectionGlyph = renderChapter10SectionGlyph;
})();