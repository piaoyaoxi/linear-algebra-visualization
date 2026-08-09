(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const rad = (degrees) => (degrees * Math.PI) / 180;
  const deg = (radians) => (radians * 180) / Math.PI;
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  const norm = (v) => Math.hypot(v[0], v[1]);
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const scale = (k, v) => [k * v[0], k * v[1]];
  const matVec = (m, v) => [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]];
  const matMul = (a, b) => [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
  ];
  const transpose = (m) => [m[0], m[2], m[1], m[3]];
  const determinant = (m) => m[0] * m[3] - m[1] * m[2];
  const fmt = (value, digits = 2) => {
    if (!Number.isFinite(value)) return "未显示";
    if (Math.abs(value) < 0.5 * 10 ** -digits) return "0";
    return value.toFixed(digits).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
  };

  function palette() {
    const style = getComputedStyle(document.body);
    const token = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
    return {
      bg: token("--surface-soft", "#e8f5f0"),
      paper: token("--surface-solid", "#fff"),
      text: token("--text", "#071512"),
      muted: token("--muted", "#5f6965"),
      faint: token("--faint", "#87908c"),
      line: token("--line", "rgba(21,52,45,.12)"),
      strongLine: token("--line-strong", "rgba(21,52,45,.2)"),
      accent: token("--accent", "#078b7e"),
      accentStrong: token("--accent-strong", "#006f65"),
      coral: token("--coral", "#d69a48"),
      blue: token("--blue", "#335eea"),
    };
  }

  function setupCanvas(canvas, paint, height = 320) {
    if (!canvas) return () => {};
    const context = canvas.getContext("2d");
    let width = 0;
    let currentHeight = height;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(280, rect.width || canvas.parentElement?.clientWidth || 640);
      currentHeight = Math.max(220, rect.height || height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(currentHeight * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(context, width, currentHeight, palette());
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const themeObserver = new MutationObserver(resize);
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    resize();
    return () => {
      observer.disconnect();
      themeObserver.disconnect();
    };
  }

  function repaintCanvas(canvas, paint) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(280, rect.width || canvas.parentElement?.clientWidth || 640);
    const height = Math.max(220, rect.height || 320);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const context = canvas.getContext("2d");
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint(context, width, height, palette());
  }

  function roundedRect(ctx, x, y, width, height, radius = 10) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function arrow(ctx, from, to, color, label = "", options = {}) {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const length = Math.hypot(dx, dy);
    if (length < 1) return;
    const ux = dx / length;
    const uy = dy / length;
    const head = Math.min(options.head || 13, length * 0.28);
    const wing = options.wing || 6;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = options.width || 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(to[0] - ux * head, to[1] - uy * head);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(to[0], to[1]);
    ctx.lineTo(to[0] - ux * head - uy * wing, to[1] - uy * head + ux * wing);
    ctx.lineTo(to[0] - ux * head + uy * wing, to[1] - uy * head - ux * wing);
    ctx.closePath();
    ctx.fill();
    if (label) {
      ctx.font = "700 13px ui-sans-serif, system-ui, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(label, to[0] + (options.labelX ?? 9), to[1] + (options.labelY ?? -10));
    }
    ctx.restore();
  }

  function grid(ctx, width, height, colors, step = 42) {
    ctx.save();
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1;
    for (let x = step; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = step; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function axes(ctx, origin, width, height, colors) {
    ctx.save();
    ctx.strokeStyle = colors.strongLine;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(20, origin[1]);
    ctx.lineTo(width - 20, origin[1]);
    ctx.moveTo(origin[0], height - 18);
    ctx.lineTo(origin[0], 18);
    ctx.stroke();
    ctx.restore();
  }

  function world(v, origin, unit) {
    return [origin[0] + v[0] * unit, origin[1] - v[1] * unit];
  }

  function clear(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
  }

  function renderFormal(root, section) {
    if (!root) return;
    const blocks = section.formalBlocks || [];
    const id = section.id;
    const headings = {
      "inner-product-geometry": "内积怎样产生长度、夹角与正交",
      "orthonormal-bases": "正交化为什么保持原来的张成空间",
      "euclidean-isomorphism": "可逆与等距之间还差什么",
      "orthogonal-transformations": "单位圆、矩阵列与 QᵀQ 怎样互相验证",
      "orthogonal-subspaces": "正交分解怎样推出唯一最近点",
      "symmetric-canonical-form": "对称性怎样打开正交对角化",
      "least-squares-distance": "投影条件怎样变成正规方程",
      "unitary-spaces": "从实正交结构走向复酉结构",
    };
    const labels = {
      "inner-product-geometry": ["定义", "几何读法", "边界"],
      "orthonormal-bases": ["保留", "减去", "单位化"],
      "euclidean-isomorphism": ["线性", "等距", "判别"],
      "orthogonal-transformations": ["图形", "矩阵列", "等式"],
      "orthogonal-subspaces": ["分解", "勾股", "最近点"],
      "symmetric-canonical-form": ["假设", "分解", "边界"],
      "least-squares-distance": ["投影", "正交", "方程"],
      "unitary-spaces": ["共轭", "酉变换", "类比"],
    }[id] || ["起点", "推导", "结论"];
    const rows = blocks.map((block, index) => `
      <article class="ch9-theory-row">
        <span>${labels[index] || `步骤 ${index + 1}`}</span>
        <div><h3>${block.title}</h3><small>${block.eyebrow}</small>${block.body}</div>
      </article>`).join("");
    const body = `<div class="ch9-theory-sequence">${rows}</div>`;
    root.innerHTML = `<h2>${headings[id] || section.question}</h2><div class="ch9-foundation ch9-foundation-${id}"><p class="ch9-lead">${section.intro}</p>${body}</div>`;
  }

  function experimentHeader(title, description) {
    return `<header class="ch9-experiment-header"><h3>${title}</h3><p>${description}</p></header>`;
  }

  function taskBlock(items) {
    return `<div class="ch9-task"><strong>操作任务</strong><ol>${items.map((item) => `<li>${item}</li>`).join("")}</ol></div>`;
  }

  function range(name, label, min, max, step, value, suffix = "") {
    return `<label class="ch9-range"><span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-range="${name}"><output data-output="${name}">${value}${suffix}</output></label>`;
  }

  function readingRow(label, key, value = "待观察") {
    return `<div class="ch9-reading-row"><span>${label}</span><strong data-readout="${key}">${value}</strong></div>`;
  }

  function setReadout(root, key, value) {
    root.querySelectorAll(`[data-readout="${key}"]`).forEach((node) => { node.textContent = value; });
  }

  function setOutput(root, key, value) {
    const node = root.querySelector(`[data-output="${key}"]`);
    if (node) node.textContent = value;
  }

  function bindRange(root, key, callback) {
    const input = root.querySelector(`[data-range="${key}"]`);
    const handler = () => callback(Number(input.value));
    input?.addEventListener("input", handler);
    return () => input?.removeEventListener("input", handler);
  }

  function bindButtons(root, selector, callback) {
    const buttons = [...root.querySelectorAll(selector)];
    const cleanups = buttons.map((button) => {
      const handler = () => callback(button);
      button.addEventListener("click", handler);
      return () => button.removeEventListener("click", handler);
    });
    return [buttons, () => cleanups.forEach((cleanup) => cleanup())];
  }

  function activate(buttons, current, dataKey) {
    buttons.forEach((button) => {
      const active = button.dataset[dataKey] === String(current);
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function animate(state, target, keys, draw, duration = 520) {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      Object.assign(state, target);
      draw();
      return () => {};
    }
    const start = Object.fromEntries(keys.map((key) => [key, state[key]]));
    const started = performance.now();
    let raf = 0;
    const frame = (now) => {
      const t = clamp((now - started) / duration, 0, 1);
      const eased = 1 - (1 - t) ** 3;
      keys.forEach((key) => { state[key] = start[key] + (target[key] - start[key]) * eased; });
      draw();
      if (t < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }

  window.Chapter9Native = { inline, display, clamp, rad, deg, dot, norm, add, sub, scale, matVec, matMul, transpose, determinant, fmt, palette, setupCanvas, repaintCanvas, roundedRect, arrow, grid, axes, world, clear, renderFormal, experimentHeader, taskBlock, range, readingRow, setReadout, setOutput, bindRange, bindButtons, activate, animate };
})();
