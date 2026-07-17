/* Chapter 5 refined teaching and interaction layer. Loaded after the first-pass renderers. */
(() => {
  const M = () => window.Ch5Math;
  const tex = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);
  const q = (root, selector) => root.querySelector(selector);
  const qa = (root, selector) => [...root.querySelectorAll(selector)];

  function formalShell(title, lead, modules) {
    return `<h2>${title}</h2><div class="ch5-formal ch5-refined-formal"><p class="ch5-formal-lead">${lead}</p>${modules.join("")}</div>`;
  }

  function moduleCard(index, title, subtitle, body, extra = "") {
    return `<section class="ch5-module ${extra}"><div class="ch5-module-heading"><span>${index}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  }

  function status(label, cls = "is-muted") {
    return `<span class="ch5-status ${cls}">${label}</span>`;
  }

  function makeController(root) {
    const controller = new AbortController();
    const signal = controller.signal;
    const on = (target, event, handler, options = {}) => target?.addEventListener(event, handler, { ...options, signal });
    return {
      signal,
      on,
      resize(paint) {
        let frame = 0;
        on(
          window,
          "resize",
          () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
              if (document.body.contains(root)) paint();
            });
          },
          { passive: true },
        );
        signal.addEventListener("abort", () => cancelAnimationFrame(frame), { once: true });
      },
      cleanup() {
        controller.abort();
      },
    };
  }

  function setActive(root, selector, active) {
    qa(root, selector).forEach((button) => button.classList.toggle("is-active", button === active));
  }

  function eigenSystem2(A) {
    const [lambda1, lambda2] = M().eigenvalues2(A);
    const { a, b, c } = M().abcFromMat2(A);
    const theta = 0.5 * Math.atan2(2 * b, a - c);
    const ct = Math.cos(theta);
    const st = Math.sin(theta);
    const Q = [
      [ct, -st],
      [st, ct],
    ];
    const D = M().symmetrize(M().congruence(A, Q));
    return { lambda1, lambda2, theta, Q, D };
  }

  function signWord(value) {
    if (value > 1e-7) return { mark: "+", label: "正", cls: "is-positive" };
    if (value < -1e-7) return { mark: "−", label: "负", cls: "is-negative" };
    return { mark: "0", label: "零", cls: "is-zero" };
  }

  function spectrumHtml(values, label = "特征值") {
    return `<div class="ch5-spectrum" aria-label="${label}">${values
      .map((value, index) => {
        const sign = signWord(value);
        return `<div class="ch5-spectrum-item ${sign.cls}"><span>λ${index + 1}</span><strong>${M().formatNum(value, 3)}</strong><em>${sign.mark}</em></div>`;
      })
      .join("")}</div>`;
  }

  function inertiaHtml(inn) {
    return `<div class="ch5-inertia-strip">
      <span class="is-positive"><b>${inn.p}</b> 正</span>
      <span class="is-negative"><b>${inn.q}</b> 负</span>
      <span class="is-zero"><b>${inn.zero}</b> 零</span>
      <span><b>${inn.rank}</b> 秩</span>
    </div>`;
  }

  function drawArrow(ctx, fromX, fromY, toX, toY, color, label) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const head = 8;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - head * Math.cos(angle - Math.PI / 6), toY - head * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - head * Math.cos(angle + Math.PI / 6), toY - head * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(label, toX + 6, toY - 6);
  }

  function drawContoursWithBasis(canvas, A, C, caption) {
    M().drawContours(canvas, A, { caption });
    if (!canvas || !C) return;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 520;
    const height = rect.height || 300;
    const ctx = canvas.getContext("2d");
    const palette = M().getPalette();
    const originX = width / 2;
    const originY = height / 2;
    const scale = Math.min(width, height) / 7;
    const columns = [
      [C[0][0], C[1][0]],
      [C[0][1], C[1][1]],
    ];
    const maxNorm = Math.max(1, ...columns.map(([x, y]) => Math.hypot(x, y)));
    const factor = scale / maxNorm;
    drawArrow(ctx, originX, originY, originX + columns[0][0] * factor, originY - columns[0][1] * factor, palette.accent, "Ce₁");
    drawArrow(ctx, originX, originY, originX + columns[1][0] * factor, originY - columns[1][1] * factor, palette.coral, "Ce₂");
  }

  function classificationNote(cls) {
    const notes = {
      pd: "所有非零方向都为正：碗面，单位圆方向值严格在 0 上方。",
      psd: "从不为负，但存在非零零方向：碗被压成山谷。",
      nd: "所有非零方向都为负：倒扣的碗。",
      nsd: "从不为正，但存在非零零方向。",
      indef: "既有正方向又有负方向：马鞍面。",
      zero: "所有方向值都为 0。",
    };
    return notes[cls.key] || "请结合惯性与主子式继续判断。";
  }

  window.Ch5Refine = {
    M, tex, display, q, qa, formalShell, moduleCard, status, makeController, setActive,
    eigenSystem2, signWord, spectrumHtml, inertiaHtml, drawArrow, drawContoursWithBasis, classificationNote,
  };
})();
