(() => {
  const EPS = 1e-9;
  let cleanup = [];
  let redrawActive = null;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  const norm = (v) => Math.hypot(v[0], v[1]);
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const scale = (s, v) => [s * v[0], s * v[1]];
  const matVec = (m, v) => [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]];
  const det2 = (m) => m[0] * m[3] - m[1] * m[2];
  const transpose2 = (m) => [m[0], m[2], m[1], m[3]];
  const mul2 = (a, b) => [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
  ];
  const matrixError = (a, b) => Math.max(...a.map((value, index) => Math.abs(value - b[index])));
  const format = (value, digits = 3) => {
    if (!Number.isFinite(value)) return "—";
    if (Math.abs(value) < 0.5 * 10 ** -digits) return "0";
    return value.toFixed(digits).replace(/\.000$/, "").replace(/(\.\d*?)0+$/, "$1");
  };
  const degrees = (radians) => (radians * 180) / Math.PI;
  const radians = (degreesValue) => (degreesValue * Math.PI) / 180;
  const htmlMath = (source, display = false) => display ? window.texDisplay(source) : window.texInline(source);

  function on(target, type, handler, options) {
    target?.addEventListener(type, handler, options);
    cleanup.push(() => target?.removeEventListener(type, handler, options));
  }

  function observeResize(target, handler) {
    if (typeof ResizeObserver === "undefined" || !target) return;
    const observer = new ResizeObserver(handler);
    observer.observe(target);
    cleanup.push(() => observer.disconnect());
  }

  function palette() {
    const styles = getComputedStyle(document.body);
    return {
      text: styles.getPropertyValue("--text").trim() || "#18212c",
      muted: styles.getPropertyValue("--muted").trim() || "#66717f",
      line: styles.getPropertyValue("--line-strong").trim() || "rgba(28,43,61,.2)",
      accent: styles.getPropertyValue("--accent").trim() || "#0f8f88",
      accentStrong: styles.getPropertyValue("--accent-strong").trim() || "#08736e",
      coral: styles.getPropertyValue("--coral").trim() || "#d46b4f",
      blue: styles.getPropertyValue("--blue").trim() || "#335eea",
      violet: styles.getPropertyValue("--violet").trim() || "#7258ca",
    };
  }

  function fitCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const bufferWidth = Math.round(width * dpr);
    const bufferHeight = Math.round(height * dpr);
    if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
      canvas.width = bufferWidth;
      canvas.height = bufferHeight;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }

  function coordinateSystem(canvas, world = 4.5) {
    const { ctx, width, height } = fitCanvas(canvas);
    const unit = Math.min(width, height) / (world * 2.25);
    const origin = { x: width / 2, y: height / 2 + 8 };
    const toScreen = (v) => ({ x: origin.x + v[0] * unit, y: origin.y - v[1] * unit });
    const toWorld = (p) => [(p.x - origin.x) / unit, (origin.y - p.y) / unit];
    return { ctx, width, height, unit, origin, toScreen, toWorld };
  }

  function drawGrid(system, options = {}) {
    const { ctx, width, height, unit, origin } = system;
    const p = palette();
    const step = options.step || 1;
    ctx.save();
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    for (let x = origin.x % (unit * step); x <= width; x += unit * step) {
      ctx.globalAlpha = Math.abs(x - origin.x) < 1 ? 0.42 : 0.13;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = origin.y % (unit * step); y <= height; y += unit * step) {
      ctx.globalAlpha = Math.abs(y - origin.y) < 1 ? 0.42 : 0.13;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    ctx.restore();
  }

  function drawArrow(ctx, from, to, color, label = "", options = {}) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    if (length < 2) return;
    const angle = Math.atan2(dy, dx);
    const head = Math.min(12, Math.max(7, length * 0.14));
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = options.alpha ?? 1;
    ctx.lineWidth = options.width || 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (options.dash) ctx.setLineDash(options.dash);
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - head * Math.cos(angle - Math.PI / 6), to.y - head * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - head * Math.cos(angle + Math.PI / 6), to.y - head * Math.sin(angle + Math.PI / 6));
    ctx.closePath(); ctx.fill();
    if (label) {
      ctx.font = "650 12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText(label, to.x + (options.labelDx ?? 8), to.y + (options.labelDy ?? -8));
    }
    ctx.restore();
  }

  function drawPoint(ctx, point, color, radius = 5) {
    ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }

  function setActive(buttons, predicate) {
    buttons.forEach((button) => {
      const active = predicate(button);
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function rangeMarkup(id, label, min, max, step, value, dataName) {
    return `<div class="ch9-range"><label for="${id}"><span>${label}</span><output for="${id}" data-output="${dataName}">${value}</output></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-range="${dataName}" /></div>`;
  }

  function readoutMarkup(label, dataName, value = "—") {
    return `<div class="ch9-readout"><span>${label}</span><strong data-readout="${dataName}">${value}</strong></div>`;
  }

  function updateOutput(root, name, value) {
    const output = root.querySelector(`[data-output="${name}"]`);
    if (output) output.textContent = value;
    const readout = root.querySelector(`[data-readout="${name}"]`);
    if (readout) readout.textContent = value;
  }

  function bindRange(root, name, handler) {
    const input = root.querySelector(`[data-range="${name}"]`);
    if (!input) return null;
    on(input, "input", () => handler(Number(input.value), input));
    return input;
  }

  function pointerInCanvas(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function installRedraw(redraw, canvasTargets = []) {
    redrawActive = redraw;
    canvasTargets.forEach((target) => observeResize(target, redraw));
    on(window, "resize", redraw, { passive: true });
    const theme = document.querySelector("#themeToggle");
    on(theme, "click", () => requestAnimationFrame(redraw));
    requestAnimationFrame(redraw);
  }

  function mountInnerProduct(root) {
    root.innerHTML = `
      <div class="ch9-workbench" data-lab-ready="inner-product">
        <div class="ch9-stage">
          <canvas data-ip-canvas tabindex="0" aria-label="两个可拖动向量的内积、夹角和长度图"></canvas>
          <div class="ch9-legend"><span><i style="--legend-color:var(--blue)"></i>x</span><span><i style="--legend-color:var(--coral)"></i>y</span><span><i style="--legend-color:var(--accent)"></i>夹角</span></div>
          <div class="ch9-canvas-note">拖动任一箭头端点；键盘聚焦画布后用方向键移动最近选中的向量。</div>
        </div>
        <div class="ch9-controls">
          <div class="ch9-control-group"><strong>边界预设</strong><div class="ch9-preset-row">
            <button type="button" data-ip-preset="acute">锐角</button><button type="button" data-ip-preset="orthogonal">正交</button><button type="button" data-ip-preset="opposite">反向</button><button type="button" data-ip-preset="dependent">线性相关</button><button type="button" data-ip-preset="zero">含零向量</button>
          </div></div>
          <div class="ch9-control-group"><strong>极坐标控制</strong>
            ${rangeMarkup("ip-x-length", "x 的长度", 0, 3.8, 0.1, 2.8, "xLength")}${rangeMarkup("ip-x-angle", "x 的方向", -180, 180, 1, 20, "xAngle")}${rangeMarkup("ip-y-length", "y 的长度", 0, 3.8, 0.1, 2.2, "yLength")}${rangeMarkup("ip-y-angle", "y 的方向", -180, 180, 1, 105, "yAngle")}
          </div>
          <div class="ch9-control-group"><strong>同步读数</strong><div class="ch9-readout-grid">${readoutMarkup("⟨x,y⟩", "dot")}${readoutMarkup("cos θ", "cos")}${readoutMarkup("θ", "theta")}${readoutMarkup("等号比率", "cs")}</div><div class="ch9-status" data-ip-status aria-live="polite"></div></div>
        </div>
      </div>`;

    const state = { xLength: 2.8, xAngle: 20, yLength: 2.2, yAngle: 105, selected: "x" };
    const canvas = root.querySelector("[data-ip-canvas]");
    const inputs = Object.fromEntries(["xLength", "xAngle", "yLength", "yAngle"].map((name) => [name, root.querySelector(`[data-range="${name}"]`)]));
    const presetButtons = [...root.querySelectorAll("[data-ip-preset]")];
    const vector = (prefix) => {
      const length = state[`${prefix}Length`];
      const angle = radians(state[`${prefix}Angle`]);
      return [length * Math.cos(angle), length * Math.sin(angle)];
    };
    function syncInputs() {
      for (const [name, input] of Object.entries(inputs)) {
        input.value = String(state[name]);
        updateOutput(root, name, name.endsWith("Angle") ? `${format(state[name], 0)}°` : format(state[name], 1));
      }
    }
    function render() {
      syncInputs();
      const x = vector("x");
      const y = vector("y");
      const nx = norm(x);
      const ny = norm(y);
      const product = dot(x, y);
      const hasAngle = nx > EPS && ny > EPS;
      const cosine = hasAngle ? clamp(product / (nx * ny), -1, 1) : NaN;
      const theta = hasAngle ? degrees(Math.acos(cosine)) : NaN;
      const ratio = hasAngle ? Math.abs(product) / (nx * ny) : NaN;
      updateOutput(root, "dot", format(product));
      updateOutput(root, "cos", format(cosine));
      updateOutput(root, "theta", hasAngle ? `${format(theta, 1)}°` : "未定义");
      updateOutput(root, "cs", hasAngle ? format(ratio) : "未定义");
      const status = root.querySelector("[data-ip-status]");
      status.classList.toggle("is-warn", !hasAngle);
      if (!hasAngle) status.textContent = "零向量与每个向量正交，但夹角公式因分母为 0 而关闭。";
      else if (Math.abs(product) < 1e-6) status.textContent = "内积为 0：两个非零向量正交，夹角为 90°。";
      else if (ratio > 1 - 1e-6) status.textContent = product > 0 ? "Cauchy–Schwarz 取等号：两个向量同向线性相关。" : "Cauchy–Schwarz 取等号：两个向量反向线性相关。";
      else status.textContent = product > 0 ? "内积为正：夹角是锐角。" : "内积为负：夹角是钝角。";
      const system = coordinateSystem(canvas, 4.2);
      drawGrid(system);
      const p = palette();
      const sx = system.toScreen(x);
      const sy = system.toScreen(y);
      drawArrow(system.ctx, system.origin, sx, p.blue, "x", { width: state.selected === "x" ? 4 : 3 });
      drawArrow(system.ctx, system.origin, sy, p.coral, "y", { width: state.selected === "y" ? 4 : 3 });
      drawPoint(system.ctx, sx, p.blue, 5.5);
      drawPoint(system.ctx, sy, p.coral, 5.5);
      if (hasAngle && nx > 0.2 && ny > 0.2) {
        let a1 = Math.atan2(-x[1], x[0]);
        let a2 = Math.atan2(-y[1], y[0]);
        let delta = a2 - a1;
        while (delta > Math.PI) delta -= Math.PI * 2;
        while (delta < -Math.PI) delta += Math.PI * 2;
        const radius = Math.min(42, Math.min(nx, ny) * system.unit * 0.35);
        system.ctx.save(); system.ctx.strokeStyle = p.accent; system.ctx.lineWidth = 2.5;
        system.ctx.beginPath(); system.ctx.arc(system.origin.x, system.origin.y, radius, a1, a1 + delta, delta < 0); system.ctx.stroke(); system.ctx.restore();
      }
    }
    const presets = {
      acute: { xLength: 2.8, xAngle: 15, yLength: 2.3, yAngle: 60 },
      orthogonal: { xLength: 2.7, xAngle: 10, yLength: 2.2, yAngle: 100 },
      opposite: { xLength: 2.5, xAngle: 25, yLength: 2, yAngle: -155 },
      dependent: { xLength: 2.7, xAngle: 35, yLength: 1.7, yAngle: 35 },
      zero: { xLength: 0, xAngle: 0, yLength: 2.5, yAngle: 120 },
    };
    presetButtons.forEach((button) => on(button, "click", () => {
      Object.assign(state, presets[button.dataset.ipPreset]);
      setActive(presetButtons, (item) => item === button);
      render();
    }));
    Object.keys(inputs).forEach((name) => bindRange(root, name, (value) => {
      state[name] = value;
      setActive(presetButtons, () => false);
      render();
    }));
    let dragging = false;
    on(canvas, "pointerdown", (event) => {
      const system = coordinateSystem(canvas, 4.2);
      const pointer = pointerInCanvas(event, canvas);
      const xPoint = system.toScreen(vector("x"));
      const yPoint = system.toScreen(vector("y"));
      state.selected = Math.hypot(pointer.x - xPoint.x, pointer.y - xPoint.y) <= Math.hypot(pointer.x - yPoint.x, pointer.y - yPoint.y) ? "x" : "y";
      dragging = true; canvas.setPointerCapture(event.pointerId); render();
    });
    on(canvas, "pointermove", (event) => {
      if (!dragging) return;
      const system = coordinateSystem(canvas, 4.2);
      const v = system.toWorld(pointerInCanvas(event, canvas));
      state[`${state.selected}Length`] = clamp(norm(v), 0, 3.8);
      state[`${state.selected}Angle`] = degrees(Math.atan2(v[1], v[0]));
      setActive(presetButtons, () => false); render();
    });
    on(canvas, "pointerup", (event) => {
      dragging = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    });
    on(canvas, "keydown", (event) => {
      const delta = event.shiftKey ? 5 : 1;
      if (event.key === "ArrowLeft") state[`${state.selected}Angle`] -= delta;
      else if (event.key === "ArrowRight") state[`${state.selected}Angle`] += delta;
      else if (event.key === "ArrowUp") state[`${state.selected}Length`] = clamp(state[`${state.selected}Length`] + 0.1, 0, 3.8);
      else if (event.key === "ArrowDown") state[`${state.selected}Length`] = clamp(state[`${state.selected}Length`] - 0.1, 0, 3.8);
      else return;
      event.preventDefault(); render();
    });
    installRedraw(render, [canvas]);
  }

  function gramData(v1, v2) {
    const n1 = norm(v1);
    if (n1 < EPS) return { valid: false, reason: "第一个向量为零，无法开始正交化。" };
    const e1 = scale(1 / n1, v1);
    const coefficient = dot(v2, e1);
    const projection = scale(coefficient, e1);
    const u2 = sub(v2, projection);
    const n2 = norm(u2);
    if (n2 < 1e-7) return { valid: false, e1, projection, u2, coefficient, reason: "第二个向量已在第一方向的张成空间中，余量为零。" };
    const e2 = scale(1 / n2, u2);
    return { valid: true, e1, projection, u2, e2, coefficient, n2 };
  }

  function mountGramSchmidt(root) {
    root.innerHTML = `
      <div class="ch9-workbench" data-lab-ready="gram-schmidt">
        <div class="ch9-stage"><canvas data-gs-canvas tabindex="0" aria-label="Gram–Schmidt 正交化步骤图"></canvas><div class="ch9-legend"><span><i style="--legend-color:var(--blue)"></i>第一方向</span><span><i style="--legend-color:var(--coral)"></i>原第二向量</span><span><i style="--legend-color:var(--accent)"></i>正交余量</span></div><div class="ch9-canvas-note" data-gs-note>第 1 步：先观察原始向量组。</div></div>
        <div class="ch9-controls">
          <div class="ch9-control-group"><strong>输入向量组</strong><div class="ch9-preset-row"><button type="button" data-gs-preset="general">一般位置</button><button type="button" data-gs-preset="near">接近相关</button><button type="button" data-gs-preset="dependent">线性相关</button></div><button class="ch9-mini-button" type="button" data-gs-swap>交换输入顺序</button>${rangeMarkup("gs-v2x", "第二向量 x", -3, 3, 0.1, 2, "v2x")}${rangeMarkup("gs-v2y", "第二向量 y", -3, 3, 0.1, 2.5, "v2y")}</div>
          <div class="ch9-control-group"><strong>算法步骤</strong><div class="ch9-step-row"><button type="button" data-gs-step="0">原向量</button><button type="button" data-gs-step="1">减去投影</button><button type="button" data-gs-step="2">单位化</button></div></div>
          <div class="ch9-control-group"><strong>正交证书</strong><div class="ch9-readout-grid">${readoutMarkup("投影系数", "projection")}${readoutMarkup("余量长度", "residual")}${readoutMarkup("⟨e₁,e₂⟩", "orthogonality")}${readoutMarkup("张成面积", "span")}</div><div class="ch9-status" data-gs-status aria-live="polite"></div></div>
        </div>
      </div>`;
    const state = { v1: [2.6, 0.8], v2: [2, 2.5], step: 0 };
    const canvas = root.querySelector("[data-gs-canvas]");
    const presetButtons = [...root.querySelectorAll("[data-gs-preset]")];
    const stepButtons = [...root.querySelectorAll("[data-gs-step]")];
    const v2x = root.querySelector('[data-range="v2x"]');
    const v2y = root.querySelector('[data-range="v2y"]');
    function sync() {
      v2x.value = String(state.v2[0]); v2y.value = String(state.v2[1]);
      updateOutput(root, "v2x", format(state.v2[0], 1)); updateOutput(root, "v2y", format(state.v2[1], 1));
      setActive(stepButtons, (button) => Number(button.dataset.gsStep) === state.step);
    }
    function render() {
      sync();
      const data = gramData(state.v1, state.v2);
      const area = Math.abs(state.v1[0] * state.v2[1] - state.v1[1] * state.v2[0]);
      updateOutput(root, "projection", data.e1 ? format(data.coefficient) : "—");
      updateOutput(root, "residual", data.u2 ? format(norm(data.u2)) : "—");
      updateOutput(root, "orthogonality", data.valid ? format(dot(data.e1, data.e2)) : "—");
      updateOutput(root, "span", format(area));
      const status = root.querySelector("[data-gs-status]");
      status.classList.toggle("is-warn", !data.valid);
      status.textContent = data.valid ? `算法通过：最终向量长度均为 1，内积为 ${format(dot(data.e1, data.e2))}，张成空间保持。` : data.reason;
      root.querySelector("[data-gs-note]").textContent = state.step === 0 ? "第 1 步：先观察原始向量组。" : state.step === 1 ? "第 2 步：从第二向量减去它在第一方向上的投影。" : data.valid ? "第 3 步：把正交余量单位化，得到标准正交基。" : "余量为零，单位化步骤被关闭。";
      const system = coordinateSystem(canvas, 4.2); drawGrid(system); const p = palette();
      drawArrow(system.ctx, system.origin, system.toScreen(state.v1), p.blue, state.step === 2 && data.e1 ? "e₁" : "v₁", { width: 3.4 });
      drawArrow(system.ctx, system.origin, system.toScreen(state.v2), p.coral, "v₂", { width: 2.8, alpha: state.step === 0 ? 1 : 0.42 });
      if (state.step >= 1 && data.e1) {
        drawArrow(system.ctx, system.origin, system.toScreen(data.projection), p.muted, "proj", { width: 2.3, dash: [6, 5] });
        drawArrow(system.ctx, system.toScreen(data.projection), system.toScreen(state.v2), p.accent, "u₂", { width: 3.4 });
      }
      if (state.step === 2 && data.valid) {
        drawArrow(system.ctx, system.origin, system.toScreen(data.e1), p.blue, "e₁", { width: 4 });
        drawArrow(system.ctx, system.origin, system.toScreen(data.e2), p.accentStrong, "e₂", { width: 4 });
      }
    }
    const presets = { general: [[2.6, 0.8], [2, 2.5]], near: [[2.8, 1], [2.7, 1.08]], dependent: [[2.4, 1.2], [1.6, 0.8]] };
    presetButtons.forEach((button) => on(button, "click", () => {
      const [a, b] = presets[button.dataset.gsPreset]; state.v1 = [...a]; state.v2 = [...b]; state.step = 0;
      setActive(presetButtons, (item) => item === button); render();
    }));
    stepButtons.forEach((button) => on(button, "click", () => { state.step = Number(button.dataset.gsStep); render(); }));
    on(root.querySelector("[data-gs-swap]"), "click", () => { [state.v1, state.v2] = [state.v2, state.v1]; state.step = 0; setActive(presetButtons, () => false); render(); });
    bindRange(root, "v2x", (value) => { state.v2[0] = value; setActive(presetButtons, () => false); render(); });
    bindRange(root, "v2y", (value) => { state.v2[1] = value; setActive(presetButtons, () => false); render(); });
    installRedraw(render, [canvas]);
  }

  function mapForMode(mode, angle, shear) {
    const c = Math.cos(angle); const s = Math.sin(angle);
    if (mode === "rotation") return [c, -s, s, c];
    if (mode === "reflection") return [c, s, s, -c];
    return [1, shear, 0, 1];
  }

  function drawVectorPair(canvas, vectors, labels, colors, matrix = null) {
    const system = coordinateSystem(canvas, 4.2); drawGrid(system);
    vectors.forEach((vector, index) => {
      const v = matrix ? matVec(matrix, vector) : vector;
      drawArrow(system.ctx, system.origin, system.toScreen(v), colors[index], labels[index], { width: 3.5 });
    });
  }

  function mountIsometry(root) {
    root.innerHTML = `
      <div class="ch9-workbench" data-lab-ready="isometry">
        <div class="ch9-stage ch9-dual-stage"><div class="ch9-dual-panel"><strong>映射前</strong><canvas data-iso-before aria-label="映射前的向量对"></canvas></div><div class="ch9-dual-panel"><strong>映射后</strong><canvas data-iso-after aria-label="映射后的向量对"></canvas></div><div class="ch9-canvas-note">两边使用相同刻度；比较长度、夹角与内积，而不只看图形是否可逆。</div></div>
        <div class="ch9-controls">
          <div class="ch9-control-group"><strong>映射类型</strong><div class="ch9-toggle-row"><button type="button" data-iso-mode="rotation">旋转</button><button type="button" data-iso-mode="reflection">镜像</button><button type="button" data-iso-mode="shear">可逆剪切</button></div>${rangeMarkup("iso-angle", "旋转/镜像参数", -180, 180, 1, 35, "angle")}${rangeMarkup("iso-shear", "剪切量", -1.5, 1.5, 0.05, 0.8, "shear")}</div>
          <div class="ch9-control-group"><strong>输入向量</strong>${rangeMarkup("iso-y-angle", "y 的方向", -170, 170, 1, 110, "yAngle")}${rangeMarkup("iso-y-length", "y 的长度", 0.5, 3.5, 0.1, 2.1, "yLength")}</div>
          <div class="ch9-control-group"><strong>结构闸门</strong><div class="ch9-readout-grid">${readoutMarkup("det T", "det")}${readoutMarkup("TᵀT−I", "metricError")}${readoutMarkup("内积误差", "dotError")}${readoutMarkup("夹角误差", "angleError")}</div><div class="ch9-status" data-iso-status aria-live="polite"></div></div>
        </div>
      </div>`;
    const state = { mode: "rotation", angle: 35, shear: 0.8, yAngle: 110, yLength: 2.1 };
    const before = root.querySelector("[data-iso-before]");
    const after = root.querySelector("[data-iso-after]");
    const buttons = [...root.querySelectorAll("[data-iso-mode]")];
    const x = [2.6, 0.6];
    function render() {
      const y = [state.yLength * Math.cos(radians(state.yAngle)), state.yLength * Math.sin(radians(state.yAngle))];
      const m = mapForMode(state.mode, radians(state.angle), state.shear);
      const tx = matVec(m, x); const ty = matVec(m, y); const gram = mul2(transpose2(m), m);
      const metricError = matrixError(gram, [1, 0, 0, 1]);
      const d0 = dot(x, y); const d1 = dot(tx, ty);
      const angle0 = Math.acos(clamp(d0 / (norm(x) * norm(y)), -1, 1));
      const angle1 = Math.acos(clamp(d1 / (norm(tx) * norm(ty)), -1, 1));
      updateOutput(root, "angle", `${format(state.angle, 0)}°`); updateOutput(root, "shear", format(state.shear, 2)); updateOutput(root, "yAngle", `${format(state.yAngle, 0)}°`); updateOutput(root, "yLength", format(state.yLength, 1));
      updateOutput(root, "det", format(det2(m))); updateOutput(root, "metricError", format(metricError, 4)); updateOutput(root, "dotError", format(Math.abs(d1 - d0), 4)); updateOutput(root, "angleError", `${format(Math.abs(degrees(angle1 - angle0)), 3)}°`);
      setActive(buttons, (button) => button.dataset.isoMode === state.mode);
      const pass = metricError < 1e-8; const status = root.querySelector("[data-iso-status]"); status.classList.toggle("is-warn", !pass);
      status.textContent = pass ? "等距同构通过：线性、可逆，并且对所有向量对保持内积。" : "这里只通过线性同构闸门：映射可逆，但长度、夹角或内积发生变化。";
      const p = palette(); drawVectorPair(before, [x, y], ["x", "y"], [p.blue, p.coral]); drawVectorPair(after, [x, y], ["Tx", "Ty"], [p.blue, p.coral], m);
    }
    buttons.forEach((button) => on(button, "click", () => { state.mode = button.dataset.isoMode; render(); }));
    ["angle", "shear", "yAngle", "yLength"].forEach((name) => bindRange(root, name, (value) => { state[name] = value; render(); }));
    installRedraw(render, [before, after]);
  }

  function drawTransformedShape(canvas, matrix) {
    const system = coordinateSystem(canvas, 4.3); drawGrid(system); const p = palette(); const circle = [];
    for (let i = 0; i <= 100; i += 1) { const a = (i / 100) * Math.PI * 2; circle.push(matVec(matrix, [Math.cos(a), Math.sin(a)])); }
    system.ctx.save(); system.ctx.strokeStyle = p.accent; system.ctx.lineWidth = 2.5; system.ctx.beginPath();
    circle.forEach((v, index) => { const point = system.toScreen(v); if (index === 0) system.ctx.moveTo(point.x, point.y); else system.ctx.lineTo(point.x, point.y); }); system.ctx.stroke(); system.ctx.restore();
    const triangle = [[0.3, 0.4], [2.2, 0.4], [0.8, 1.8]];
    system.ctx.save(); system.ctx.strokeStyle = p.coral; system.ctx.fillStyle = p.coral; system.ctx.globalAlpha = 0.18; system.ctx.beginPath();
    triangle.forEach((v, index) => { const point = system.toScreen(matVec(matrix, v)); if (index === 0) system.ctx.moveTo(point.x, point.y); else system.ctx.lineTo(point.x, point.y); });
    system.ctx.closePath(); system.ctx.fill(); system.ctx.globalAlpha = 0.9; system.ctx.stroke(); system.ctx.restore();
    drawArrow(system.ctx, system.origin, system.toScreen(matVec(matrix, [1, 0])), p.blue, "Qe₁", { width: 3.5 });
    drawArrow(system.ctx, system.origin, system.toScreen(matVec(matrix, [0, 1])), p.coral, "Qe₂", { width: 3.5 });
  }

  function mountOrthogonal(root) {
    root.innerHTML = `
      <div class="ch9-workbench" data-lab-ready="orthogonal-transform">
        <div class="ch9-stage"><canvas data-ortho-canvas aria-label="单位圆和三角形经过正交变换或剪切后的图形"></canvas><div class="ch9-stage-badge" data-ortho-badge></div><div class="ch9-canvas-note">单位圆是否仍是单位圆，是长度保持最直观的整体检验。</div></div>
        <div class="ch9-controls"><div class="ch9-control-group"><strong>变换类型</strong><div class="ch9-toggle-row"><button type="button" data-ortho-mode="rotation">旋转</button><button type="button" data-ortho-mode="reflection">镜像</button><button type="button" data-ortho-mode="shear">非正交对照</button></div>${rangeMarkup("ortho-angle", "角度", -180, 180, 1, 40, "angle")}${rangeMarkup("ortho-shear", "剪切量", -1.5, 1.5, 0.05, 0.7, "shear")}</div>
          <div class="ch9-control-group"><strong>矩阵证书</strong><div class="ch9-equation-row" data-ortho-matrix></div><div class="ch9-readout-grid">${readoutMarkup("det Q", "det")}${readoutMarkup("‖QᵀQ−I‖∞", "qtq")}${readoutMarkup("长度误差", "lengthError")}${readoutMarkup("Q⁻¹−Qᵀ", "inverseError")}</div><div class="ch9-status" data-ortho-status aria-live="polite"></div></div>
        </div>
      </div>`;
    const state = { mode: "rotation", angle: 40, shear: 0.7 };
    const canvas = root.querySelector("[data-ortho-canvas]"); const buttons = [...root.querySelectorAll("[data-ortho-mode]")];
    function inverse2(m) { const d = det2(m); if (Math.abs(d) < EPS) return [NaN, NaN, NaN, NaN]; return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d]; }
    function render() {
      const m = mapForMode(state.mode, radians(state.angle), state.shear); const qtq = mul2(transpose2(m), m); const error = matrixError(qtq, [1, 0, 0, 1]);
      const test = [1.3, -0.8]; const lengthError = Math.abs(norm(matVec(m, test)) - norm(test)); const inverseError = matrixError(inverse2(m), transpose2(m));
      updateOutput(root, "angle", `${format(state.angle, 0)}°`); updateOutput(root, "shear", format(state.shear, 2)); updateOutput(root, "det", format(det2(m))); updateOutput(root, "qtq", format(error, 5)); updateOutput(root, "lengthError", format(lengthError, 5)); updateOutput(root, "inverseError", format(inverseError, 5));
      root.querySelector("[data-ortho-matrix]").innerHTML = htmlMath(`Q=\\begin{bmatrix}${format(m[0])}&${format(m[1])}\\\\${format(m[2])}&${format(m[3])}\\end{bmatrix}`, true);
      setActive(buttons, (button) => button.dataset.orthoMode === state.mode);
      const pass = error < 1e-8; const status = root.querySelector("[data-ortho-status]"); const badge = root.querySelector("[data-ortho-badge]");
      status.classList.toggle("is-warn", !pass); badge.className = `ch9-stage-badge ${pass ? "is-pass" : "is-fail"}`; badge.textContent = pass ? `正交 · det=${format(det2(m))}` : "非正交 · 单位圆变形";
      status.textContent = pass ? (state.mode === "rotation" ? "正交证书通过：保持长度与定向，逆矩阵等于转置。" : "正交证书通过：保持长度但反转定向，行列式为 -1。") : "剪切仍然可逆，但 QᵀQ≠I，单位圆变成椭圆，逆矩阵也不再等于转置。";
      drawTransformedShape(canvas, m);
    }
    buttons.forEach((button) => on(button, "click", () => { state.mode = button.dataset.orthoMode; render(); }));
    ["angle", "shear"].forEach((name) => bindRange(root, name, (value) => { state[name] = value; render(); }));
    installRedraw(render, [canvas]);
  }

  function mountProjection(root) {
    root.innerHTML = `
      <div class="ch9-workbench" data-lab-ready="projection">
        <div class="ch9-stage"><canvas data-proj-canvas tabindex="0" aria-label="向量在直线子空间上的正交投影和残差"></canvas><div class="ch9-legend"><span><i style="--legend-color:var(--blue)"></i>x</span><span><i style="--legend-color:var(--accent)"></i>p=P_Wx</span><span><i style="--legend-color:var(--coral)"></i>e=x−p</span></div><div class="ch9-canvas-note">拖动 x；青色点 p 是投影，灰色点 w 是可移动比较点。</div></div>
        <div class="ch9-controls"><div class="ch9-control-group"><strong>子空间与比较点</strong>${rangeMarkup("proj-angle", "W 的方向", -90, 90, 1, 25, "angle")}${rangeMarkup("proj-t", "比较点 w 的坐标", -4, 4, 0.1, 1.1, "t")}<div class="ch9-preset-row"><button type="button" data-proj-preset="horizontal">水平</button><button type="button" data-proj-preset="diagonal">对角</button><button type="button" data-proj-preset="perpendicular">x 在 W⊥</button></div></div>
          <div class="ch9-control-group"><strong>分解证书</strong><div class="ch9-readout-grid">${readoutMarkup("⟨e,u⟩", "orthogonality")}${readoutMarkup("‖x−p‖", "bestDistance")}${readoutMarkup("‖x−w‖", "compareDistance")}${readoutMarkup("距离差", "distanceGap")}</div><div class="ch9-equation-row" data-proj-equation></div><div class="ch9-status" data-proj-status aria-live="polite"></div></div>
        </div>
      </div>`;
    const state = { x: [2.4, 2.7], angle: 25, t: 1.1 };
    const canvas = root.querySelector("[data-proj-canvas]"); const presets = [...root.querySelectorAll("[data-proj-preset]")];
    function render() {
      const u = [Math.cos(radians(state.angle)), Math.sin(radians(state.angle))]; const coefficient = dot(state.x, u); const pVec = scale(coefficient, u); const e = sub(state.x, pVec); const w = scale(state.t, u); const best = norm(e); const compare = norm(sub(state.x, w));
      updateOutput(root, "angle", `${format(state.angle, 0)}°`); updateOutput(root, "t", format(state.t, 1)); updateOutput(root, "orthogonality", format(dot(e, u), 5)); updateOutput(root, "bestDistance", format(best)); updateOutput(root, "compareDistance", format(compare)); updateOutput(root, "distanceGap", format(compare - best));
      root.querySelector("[data-proj-equation]").innerHTML = htmlMath(`x=\\begin{bmatrix}${format(state.x[0])}\\\\${format(state.x[1])}\\end{bmatrix}=\\begin{bmatrix}${format(pVec[0])}\\\\${format(pVec[1])}\\end{bmatrix}+\\begin{bmatrix}${format(e[0])}\\\\${format(e[1])}\\end{bmatrix}`, true);
      const status = root.querySelector("[data-proj-status]"); const atBest = Math.abs(state.t - coefficient) < 0.03; status.classList.toggle("is-warn", !atBest);
      status.textContent = atBest ? "比较点与投影点重合：距离达到唯一最小值，残差垂直于 W。" : `当前比较点比投影点远 ${format(compare - best)}；Pythagoras 账本保证差值不会为负。`;
      const system = coordinateSystem(canvas, 4.5); drawGrid(system); const colors = palette(); const reach = 6; const a = system.toScreen(scale(-reach, u)); const b = system.toScreen(scale(reach, u));
      system.ctx.save(); system.ctx.strokeStyle = colors.accent; system.ctx.lineWidth = 2; system.ctx.globalAlpha = 0.58; system.ctx.beginPath(); system.ctx.moveTo(a.x, a.y); system.ctx.lineTo(b.x, b.y); system.ctx.stroke(); system.ctx.restore();
      drawArrow(system.ctx, system.origin, system.toScreen(state.x), colors.blue, "x", { width: 3.6 }); drawArrow(system.ctx, system.origin, system.toScreen(pVec), colors.accentStrong, "p", { width: 3.6 }); drawArrow(system.ctx, system.toScreen(pVec), system.toScreen(state.x), colors.coral, "e", { width: 3.2 });
      const sw = system.toScreen(w); drawPoint(system.ctx, sw, colors.muted, 5); system.ctx.save(); system.ctx.setLineDash([5, 5]); system.ctx.strokeStyle = colors.muted; system.ctx.globalAlpha = 0.55; system.ctx.beginPath(); const sx = system.toScreen(state.x); system.ctx.moveTo(sw.x, sw.y); system.ctx.lineTo(sx.x, sx.y); system.ctx.stroke(); system.ctx.restore();
    }
    bindRange(root, "angle", (value) => { state.angle = value; setActive(presets, () => false); render(); }); bindRange(root, "t", (value) => { state.t = value; render(); });
    const presetData = { horizontal: { angle: 0, x: [2.3, 2.5], t: 1 }, diagonal: { angle: 45, x: [2.8, 1.4], t: 1.2 }, perpendicular: { angle: 20, x: [-1.3, 3.57], t: 0 } };
    presets.forEach((button) => on(button, "click", () => { const next = presetData[button.dataset.projPreset]; state.angle = next.angle; state.x = [...next.x]; state.t = next.t; setActive(presets, (item) => item === button); render(); }));
    let dragging = false;
    on(canvas, "pointerdown", (event) => { dragging = true; canvas.setPointerCapture(event.pointerId); });
    on(canvas, "pointermove", (event) => { if (!dragging) return; const system = coordinateSystem(canvas, 4.5); state.x = system.toWorld(pointerInCanvas(event, canvas)).map((value) => clamp(value, -4, 4)); setActive(presets, () => false); render(); });
    on(canvas, "pointerup", (event) => { dragging = false; if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); });
    installRedraw(render, [canvas]);
  }

  function eigenSymmetric(a, b, d) {
    const trace = a + d; const radius = Math.hypot(a - d, 2 * b); const l1 = (trace + radius) / 2; const l2 = (trace - radius) / 2;
    let q1 = Math.abs(b) > 1e-10 || Math.abs(l1 - a) > 1e-10 ? [b, l1 - a] : [1, 0];
    q1 = scale(1 / (norm(q1) || 1), q1); const q2 = [-q1[1], q1[0]]; return { l1, l2, q1, q2 };
  }

  function drawSpectral(canvas, matrix, spectral, symmetric) {
    const system = coordinateSystem(canvas, 4.5); drawGrid(system); const p = palette(); const points = [];
    for (let i = 0; i <= 160; i += 1) { const angle = (i / 160) * Math.PI * 2; points.push(matVec(matrix, [Math.cos(angle), Math.sin(angle)])); }
    system.ctx.save(); system.ctx.strokeStyle = symmetric ? p.accent : p.coral; system.ctx.lineWidth = 2.6; system.ctx.beginPath();
    points.forEach((v, index) => { const point = system.toScreen(v); if (index === 0) system.ctx.moveTo(point.x, point.y); else system.ctx.lineTo(point.x, point.y); }); system.ctx.closePath(); system.ctx.stroke(); system.ctx.restore();
    if (symmetric) {
      drawArrow(system.ctx, system.origin, system.toScreen(scale(spectral.l1, spectral.q1)), p.blue, "λ₁q₁", { width: 3.5 }); drawArrow(system.ctx, system.origin, system.toScreen(scale(spectral.l2, spectral.q2)), p.coral, "λ₂q₂", { width: 3.5 }); drawArrow(system.ctx, system.origin, system.toScreen(spectral.q1), p.blue, "q₁", { width: 2, alpha: 0.45 }); drawArrow(system.ctx, system.origin, system.toScreen(spectral.q2), p.coral, "q₂", { width: 2, alpha: 0.45 });
    }
  }

  function mountSpectral(root) {
    root.innerHTML = `
      <div class="ch9-workbench" data-lab-ready="spectral">
        <div class="ch9-stage ch9-spectral-stage"><canvas data-spectral-canvas aria-label="实对称矩阵将单位圆变为主轴沿特征方向的椭圆"></canvas><div class="ch9-stage-badge" data-spectral-badge></div><div class="ch9-canvas-note">特征方向、椭圆主轴、Q 的列和 Λ 的对角元由同一组计算生成。</div></div>
        <div class="ch9-controls"><div class="ch9-control-group"><strong>对称矩阵参数</strong><div class="ch9-preset-row"><button type="button" data-sp-preset="distinct">不同特征值</button><button type="button" data-sp-preset="rotated">旋转主轴</button><button type="button" data-sp-preset="repeated">重特征值</button></div>${rangeMarkup("sp-a", "a₁₁", -2.5, 3.5, 0.1, 2.4, "a")}${rangeMarkup("sp-b", "a₁₂=a₂₁", -2.5, 2.5, 0.1, 1.1, "b")}${rangeMarkup("sp-d", "a₂₂", -2.5, 3.5, 0.1, 0.6, "d")}${rangeMarkup("sp-asym", "非对称扰动", 0, 1.5, 0.05, 0, "asym")}</div>
          <div class="ch9-control-group"><strong>谱分解证书</strong><div class="ch9-equation-row" data-sp-matrix></div><div class="ch9-readout-grid">${readoutMarkup("λ₁", "lambda1")}${readoutMarkup("λ₂", "lambda2")}${readoutMarkup("⟨q₁,q₂⟩", "qdot")}${readoutMarkup("重构误差", "reconstruction")}</div><div class="ch9-status" data-sp-status aria-live="polite"></div></div>
        </div>
      </div>`;
    const state = { a: 2.4, b: 1.1, d: 0.6, asym: 0 };
    const canvas = root.querySelector("[data-spectral-canvas]"); const presets = [...root.querySelectorAll("[data-sp-preset]")];
    function render() {
      const matrix = [state.a, state.b, state.b + state.asym, state.d]; const symmetric = Math.abs(state.asym) < 1e-10; const spectral = eigenSymmetric(state.a, state.b, state.d);
      const q = [spectral.q1[0], spectral.q2[0], spectral.q1[1], spectral.q2[1]]; const lambda = [spectral.l1, 0, 0, spectral.l2]; const reconstruction = mul2(mul2(q, lambda), transpose2(q)); const error = symmetric ? matrixError(reconstruction, matrix) : NaN;
      ["a", "b", "d", "asym"].forEach((name) => updateOutput(root, name, format(state[name], 2)));
      updateOutput(root, "lambda1", symmetric ? format(spectral.l1) : "关闭"); updateOutput(root, "lambda2", symmetric ? format(spectral.l2) : "关闭"); updateOutput(root, "qdot", symmetric ? format(dot(spectral.q1, spectral.q2), 5) : "关闭"); updateOutput(root, "reconstruction", symmetric ? format(error, 6) : "关闭");
      root.querySelector("[data-sp-matrix]").innerHTML = htmlMath(`A=\\begin{bmatrix}${format(matrix[0])}&${format(matrix[1])}\\\\${format(matrix[2])}&${format(matrix[3])}\\end{bmatrix}`, true);
      const status = root.querySelector("[data-sp-status]"); const badge = root.querySelector("[data-spectral-badge]"); status.classList.toggle("is-warn", !symmetric); badge.className = `ch9-stage-badge ${symmetric ? "is-pass" : "is-fail"}`;
      if (symmetric) {
        const repeated = Math.abs(spectral.l1 - spectral.l2) < 1e-7; badge.textContent = repeated ? "对称 · 重特征值" : "对称 · 正交对角化";
        status.textContent = repeated ? "重特征值状态：特征方向不唯一，但任意标准正交基都给出同一个标量作用。" : "谱定理通过：q₁、q₂ 正交，A=QΛQᵀ 的重构误差接近 0。";
      } else { badge.textContent = "非对称 · 结论关闭"; status.textContent = "Aᵀ≠A：本工作台关闭实对称谱定理，不把对称部分的特征方向冒充为 A 的正交标准形。"; }
      drawSpectral(canvas, matrix, spectral, symmetric);
    }
    const presetData = { distinct: { a: 3, b: 0, d: 1, asym: 0 }, rotated: { a: 2.4, b: 1.1, d: 0.6, asym: 0 }, repeated: { a: 1.8, b: 0, d: 1.8, asym: 0 } };
    presets.forEach((button) => on(button, "click", () => { Object.assign(state, presetData[button.dataset.spPreset]); setActive(presets, (item) => item === button); render(); }));
    ["a", "b", "d", "asym"].forEach((name) => bindRange(root, name, (value) => { state[name] = value; setActive(presets, () => false); render(); }));
    installRedraw(render, [canvas]);
  }

  function leastSquares(points) {
    const n = points.length; const sx = points.reduce((sum, point) => sum + point[0], 0); const sy = points.reduce((sum, point) => sum + point[1], 0); const sxx = points.reduce((sum, point) => sum + point[0] ** 2, 0); const sxy = points.reduce((sum, point) => sum + point[0] * point[1], 0); const denominator = n * sxx - sx * sx;
    return { m: (n * sxy - sx * sy) / denominator, b: (sy - ((n * sxy - sx * sy) / denominator) * sx) / n };
  }

  function residualData(points, m, b) {
    const residuals = points.map(([x, y]) => y - (m * x + b));
    return { residuals, sse: residuals.reduce((sum, value) => sum + value * value, 0), sum: residuals.reduce((total, value) => total + value, 0), weighted: residuals.reduce((total, value, index) => total + points[index][0] * value, 0) };
  }

  function drawRegression(canvas, points, m, b, optimum) {
    const { ctx, width, height } = fitCanvas(canvas); const p = palette(); const pad = { l: 44, r: 20, t: 30, b: 38 }; const xMin = -2.6; const xMax = 2.6; const ys = points.map((point) => point[1]); const yMin = Math.min(-0.5, ...ys) - 0.3; const yMax = Math.max(5.5, ...ys) + 0.3;
    const sx = (x) => pad.l + ((x - xMin) / (xMax - xMin)) * (width - pad.l - pad.r); const sy = (y) => height - pad.b - ((y - yMin) / (yMax - yMin)) * (height - pad.t - pad.b);
    ctx.save(); ctx.strokeStyle = p.line; ctx.lineWidth = 1;
    for (let x = -2; x <= 2; x += 1) { ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.moveTo(sx(x), pad.t); ctx.lineTo(sx(x), height - pad.b); ctx.stroke(); }
    for (let y = 0; y <= 5; y += 1) { ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.moveTo(pad.l, sy(y)); ctx.lineTo(width - pad.r, sy(y)); ctx.stroke(); }
    ctx.globalAlpha = 0.6; ctx.strokeStyle = p.muted; ctx.beginPath(); ctx.moveTo(pad.l, sy(0)); ctx.lineTo(width - pad.r, sy(0)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx(0), pad.t); ctx.lineTo(sx(0), height - pad.b); ctx.stroke(); ctx.restore();
    const drawLine = (lineM, lineB, color, dash = []) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.6; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(sx(xMin), sy(lineM * xMin + lineB)); ctx.lineTo(sx(xMax), sy(lineM * xMax + lineB)); ctx.stroke(); ctx.restore(); };
    drawLine(optimum.m, optimum.b, p.accent, [7, 5]); drawLine(m, b, p.blue);
    points.forEach(([x, y], index) => { const fitted = m * x + b; ctx.save(); ctx.strokeStyle = p.coral; ctx.lineWidth = 2; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.moveTo(sx(x), sy(y)); ctx.lineTo(sx(x), sy(fitted)); ctx.stroke(); ctx.restore(); drawPoint(ctx, { x: sx(x), y: sy(y) }, index === 3 ? p.violet : p.text, index === 3 ? 6 : 5); });
  }

  function mountLeastSquares(root) {
    root.innerHTML = `
      <div class="ch9-workbench" data-lab-ready="least-squares">
        <div class="ch9-stage ch9-data-stage"><canvas data-ls-canvas aria-label="数据点、手动拟合直线、最小二乘直线和残差棒"></canvas><div class="ch9-legend"><span><i style="--legend-color:var(--blue)"></i>当前直线</span><span><i style="--legend-color:var(--accent)"></i>最小二乘直线</span><span><i style="--legend-color:var(--coral)"></i>残差</span></div><div class="ch9-canvas-note">紫色数据点可由右侧滑块上下移动；青色虚线是自动最优解。</div></div>
        <div class="ch9-controls"><div class="ch9-control-group"><strong>手动拟合</strong>${rangeMarkup("ls-m", "斜率 m", -1, 2.5, 0.02, 0.7, "m")}${rangeMarkup("ls-b", "截距 c", -1, 4, 0.02, 2, "b")}${rangeMarkup("ls-point", "紫色点 y", -0.5, 6, 0.05, 3.2, "pointY")}<button class="button primary" type="button" data-ls-snap>跳到最小二乘解</button></div>
          <div class="ch9-control-group"><strong>残差与正规方程</strong><div class="ch9-readout-grid">${readoutMarkup("SSE", "sse")}${readoutMarkup("Σrᵢ", "sumR")}${readoutMarkup("Σxᵢrᵢ", "sumXR")}${readoutMarkup("距最优参数", "parameterGap")}</div><div class="ch9-status" data-ls-status aria-live="polite"></div></div>
        </div>
      </div>`;
    const points = [[-2, 0.8], [-1, 1.4], [0, 2.2], [1, 3.2], [2, 4.5]]; const state = { m: 0.7, b: 2, pointY: 3.2 }; const canvas = root.querySelector("[data-ls-canvas]");
    function render() {
      points[3][1] = state.pointY; const optimum = leastSquares(points); const data = residualData(points, state.m, state.b); const optimalData = residualData(points, optimum.m, optimum.b); const gap = Math.hypot(state.m - optimum.m, state.b - optimum.b);
      updateOutput(root, "m", format(state.m, 2)); updateOutput(root, "b", format(state.b, 2)); updateOutput(root, "pointY", format(state.pointY, 2)); updateOutput(root, "sse", format(data.sse, 4)); updateOutput(root, "sumR", format(data.sum, 4)); updateOutput(root, "sumXR", format(data.weighted, 4)); updateOutput(root, "parameterGap", format(gap, 4));
      const optimal = Math.abs(data.sse - optimalData.sse) < 1e-7 && gap < 1e-5; const status = root.querySelector("[data-ls-status]"); status.classList.toggle("is-warn", !optimal);
      status.textContent = optimal ? `正规方程通过：Σrᵢ=${format(data.sum, 5)}，Σxᵢrᵢ=${format(data.weighted, 5)}，SSE 达到 ${format(data.sse, 4)}。` : `当前 SSE=${format(data.sse, 3)}，最优 SSE=${format(optimalData.sse, 3)}；调整参数直到两条残差正交条件同时归零。`;
      drawRegression(canvas, points, state.m, state.b, optimum);
    }
    bindRange(root, "m", (value) => { state.m = value; render(); }); bindRange(root, "b", (value) => { state.b = value; render(); }); bindRange(root, "pointY", (value) => { state.pointY = value; render(); });
    on(root.querySelector("[data-ls-snap]"), "click", () => { points[3][1] = state.pointY; const optimum = leastSquares(points); state.m = optimum.m; state.b = optimum.b; root.querySelector('[data-range="m"]').value = String(optimum.m); root.querySelector('[data-range="b"]').value = String(optimum.b); render(); });
    installRedraw(render, [canvas]);
  }

  const complex = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1]],
    mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
    conj: (a) => [a[0], -a[1]],
    abs2: (a) => a[0] ** 2 + a[1] ** 2,
    phase: (angle) => [Math.cos(angle), Math.sin(angle)],
  };
  const complexInner = (x, y) => x.reduce((sum, value, index) => complex.add(sum, complex.mul(complex.conj(value), y[index])), [0, 0]);
  const complexVectorNorm = (x) => Math.sqrt(x.reduce((sum, value) => sum + complex.abs2(value), 0));

  function drawComplexPlane(canvas, original, transformed, label) {
    const system = coordinateSystem(canvas, 3.3); drawGrid(system); const p = palette();
    drawArrow(system.ctx, system.origin, system.toScreen(original), p.muted, label, { width: 2.5, alpha: 0.55 });
    drawArrow(system.ctx, system.origin, system.toScreen(transformed), p.accentStrong, `U${label}`, { width: 3.7 }); drawPoint(system.ctx, system.toScreen(transformed), p.accentStrong, 5);
  }

  function mountUnitary(root) {
    root.innerHTML = `
      <div class="ch9-workbench" data-lab-ready="unitary">
        <div class="ch9-stage ch9-complex-stage"><div class="ch9-complex-plane"><strong>第一复分量</strong><canvas data-u-plane="0" aria-label="第一复分量的相位变换"></canvas></div><div class="ch9-complex-plane"><strong>第二复分量</strong><canvas data-u-plane="1" aria-label="第二复分量的相位变换"></canvas></div><div class="ch9-canvas-note">灰色为原复数，青色为变换后复数；相位旋转只改变方向，不改变模长。</div></div>
        <div class="ch9-controls"><div class="ch9-control-group"><strong>复变换</strong><div class="ch9-toggle-row"><button type="button" data-u-mode="unitary">酉相位</button><button type="button" data-u-mode="scaled">非酉缩放</button></div>${rangeMarkup("u-phase1", "第一相位", -180, 180, 1, 35, "phase1")}${rangeMarkup("u-phase2", "第二相位", -180, 180, 1, -70, "phase2")}</div>
          <div class="ch9-control-group"><strong>酉证书</strong><div class="ch9-readout-grid">${readoutMarkup("‖x‖ 前/后", "normPair")}${readoutMarkup("U*U−I", "unitaryError")}${readoutMarkup("内积实部误差", "innerReal")}${readoutMarkup("内积虚部误差", "innerImag")}</div><div class="ch9-status" data-u-status aria-live="polite"></div></div>
        </div>
      </div>`;
    const state = { mode: "unitary", phase1: 35, phase2: -70 }; const x = [[1, 1], [1.4, -0.4]]; const y = [[-0.2, 1.1], [0.8, 0.9]]; const canvases = [...root.querySelectorAll("[data-u-plane]")]; const buttons = [...root.querySelectorAll("[data-u-mode]")];
    function transformVector(vector) {
      const factors = [complex.phase(radians(state.phase1)), complex.phase(radians(state.phase2))]; const scales = state.mode === "unitary" ? [1, 1] : [1.4, 0.8];
      return vector.map((value, index) => complex.mul([factors[index][0] * scales[index], factors[index][1] * scales[index]], value));
    }
    function render() {
      const tx = transformVector(x); const ty = transformVector(y); const before = complexInner(x, y); const after = complexInner(tx, ty); const n0 = complexVectorNorm(x); const n1 = complexVectorNorm(tx); const unitaryError = state.mode === "unitary" ? 0 : Math.max(Math.abs(1.4 ** 2 - 1), Math.abs(0.8 ** 2 - 1));
      updateOutput(root, "phase1", `${format(state.phase1, 0)}°`); updateOutput(root, "phase2", `${format(state.phase2, 0)}°`); updateOutput(root, "normPair", `${format(n0)} / ${format(n1)}`); updateOutput(root, "unitaryError", format(unitaryError, 4)); updateOutput(root, "innerReal", format(Math.abs(after[0] - before[0]), 4)); updateOutput(root, "innerImag", format(Math.abs(after[1] - before[1]), 4));
      setActive(buttons, (button) => button.dataset.uMode === state.mode); const pass = state.mode === "unitary"; const status = root.querySelector("[data-u-status]"); status.classList.toggle("is-warn", !pass); status.textContent = pass ? "U*U=I：两个分量只改变相位，复内积的实部、虚部与总范数全部保持。" : "非酉对照：变换仍可逆，但不同分量被不同倍率缩放，U*U 与长度保持同时失效。";
      canvases.forEach((canvas, index) => drawComplexPlane(canvas, x[index], tx[index], `z${index + 1}`));
    }
    buttons.forEach((button) => on(button, "click", () => { state.mode = button.dataset.uMode; render(); })); ["phase1", "phase2"].forEach((name) => bindRange(root, name, (value) => { state[name] = value; render(); })); installRedraw(render, canvases);
  }

  function bindExamples(root = document) {
    root.querySelectorAll("[data-ch9-example]").forEach((example) => {
      if (example.dataset.bound === "true") return;
      example.dataset.bound = "true";
      const inputs = [...example.querySelectorAll('input[type="radio"]')]; const button = example.querySelector("[data-ch9-example-check]"); const feedback = example.querySelector("[data-ch9-example-feedback]"); const explanation = example.querySelector("[data-ch9-example-explanation]");
      const clear = () => { example.querySelectorAll(".example-choice").forEach((choice) => choice.classList.remove("is-correct", "is-wrong")); explanation.hidden = true; feedback.className = "example-feedback"; feedback.textContent = "已经选择，可以检查。"; };
      inputs.forEach((input) => on(input, "change", () => { clear(); button.disabled = false; }));
      on(button, "click", () => {
        const selected = inputs.find((input) => input.checked); if (!selected) return;
        example.querySelectorAll(".example-choice").forEach((choice) => choice.classList.remove("is-correct", "is-wrong")); const choice = selected.closest(".example-choice");
        if (selected.dataset.correct === "true") { choice.classList.add("is-correct"); feedback.className = "example-feedback is-success"; feedback.textContent = "判断正确。下面按步骤核对计算与理由。"; explanation.hidden = false; }
        else { choice.classList.add("is-wrong"); feedback.className = "example-feedback is-error"; feedback.textContent = "这个判断没有同时通过定义与边界检查，可以重新选择。"; explanation.hidden = true; }
      });
    });
  }

  const labMounts = {
    "inner-product": mountInnerProduct,
    "gram-schmidt": mountGramSchmidt,
    isometry: mountIsometry,
    "orthogonal-transform": mountOrthogonal,
    projection: mountProjection,
    spectral: mountSpectral,
    "least-squares": mountLeastSquares,
    unitary: mountUnitary,
  };

  function teardown() {
    cleanup.splice(0).reverse().forEach((dispose) => {
      try { dispose(); } catch (error) { console.warn("Chapter 9 cleanup failed", error); }
    });
    redrawActive = null;
  }

  function mount(sectionId) {
    teardown();
    const root = document.querySelector(`[data-section-id="${CSS.escape(sectionId)}"]`);
    if (!root) return;
    const labName = root.dataset.ch9Lab;
    const mountLab = labMounts[labName];
    if (!mountLab) {
      root.innerHTML = '<div class="ch9-lab-loading">该数学实验未能载入。</div>';
      console.error(`Unknown Chapter 9 lab: ${labName}`);
      return;
    }
    mountLab(root);
    bindExamples(document.querySelector("main"));
  }

  window.mountChapter9 = mount;
  window.teardownChapter9 = teardown;
})();
