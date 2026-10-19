/* Chapter 3 drawing and HTML helpers; the exact algebra lives in shared/exact.js. */
(() => {
  const EPS = 1e-9;
  const X = window.LAExact;
  const { latexMatrix, latexVector, latexEquation, relationCertificate } = X;

  function formatNumber(value, digits = 2) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0";
    const rounded = Math.round(n * 10 ** digits) / 10 ** digits;
    return Math.abs(rounded) < 10 ** (-(digits + 1)) ? "0" : String(rounded);
  }

  const tex = (source) => (window.texInline ? window.texInline(source) : escapeHtml(source));
  const texD = (source) => (window.texDisplay ? window.texDisplay(source) : escapeHtml(source));
  const htmlMatrix = (matrix, barAt = null) => `<div class="ch3-math">${texD(latexMatrix(matrix, barAt))}</div>`;
  const htmlVector = (vector) => `<span class="ch3-vector">${tex(latexVector(vector))}</span>`;

  function htmlEquations(augmented, highlighted = []) {
    const variableCount = augmented[0].length - 1;
    return `<div class="ch3-equations">${augmented
      .map(
        (row, index) =>
          // the row name R_i, a quad, then the equation
          `<div class="ch3-equation${highlighted.includes(index) ? " is-changed" : ""}">${tex(`R_${index + 1}\\quad ${latexEquation(row, variableCount)}`)}</div>`,
      )
      .join("")}</div>`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function palette() {
    const styles = getComputedStyle(document.body);
    const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
    return {
      text: read("--text", "#18201d"),
      muted: read("--muted", "#6b756f"),
      line: read("--line", "#d9dfdc"),
      surface: read("--surface-solid", "#ffffff"),
      accent: read("--accent", "#2f8f72"),
      accentStrong: read("--accent-strong", "#176f57"),
      blue: read("--blue", "#547ec8"),
      coral: read("--coral", "#d9835f"),
    };
  }

  function sizeCanvas(canvas) {
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height, dpr };
  }

  function drawAxes(ctx, width, height, scale = 44) {
    const p = palette();
    const cx = width / 2;
    const cy = height / 2;
    ctx.save();
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    for (let x = cx % scale; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = cy % scale; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.strokeStyle = p.muted;
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();
    ctx.restore();
    return { ctx, width, height, scale, cx, cy, p };
  }

  const toCanvas = (frame, point) => [frame.cx + point[0] * frame.scale, frame.cy - point[1] * frame.scale];
  const toWorld = (frame, point) => [(point[0] - frame.cx) / frame.scale, (frame.cy - point[1]) / frame.scale];

  function drawArrowBetween(ctx, frame, from, to, color, label = "", width = 3, options = {}) {
    const [x1, y1] = toCanvas(frame, from);
    const [x2, y2] = toCanvas(frame, to);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    if (length < 1.5) {
      if (label) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.font = "750 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
        ctx.fillText(label, x1 + 9, y1 - 9);
        ctx.restore();
      }
      return;
    }
    const ux = dx / length;
    const uy = dy / length;
    const px = -uy;
    const py = ux;
    const headLength = Math.min(16, Math.max(11, length * 0.17));
    const headHalf = Math.min(7.2, Math.max(5.4, width * 2.05));
    const neckX = x2 - ux * headLength;
    const neckY = y2 - uy * headLength;

    ctx.save();
    ctx.globalAlpha = options.alpha ?? 1;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (options.dashed) ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(neckX, neckY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(neckX + px * headHalf, neckY + py * headHalf);
    ctx.quadraticCurveTo(neckX, neckY, neckX - px * headHalf, neckY - py * headHalf);
    ctx.closePath();
    ctx.fill();

    if (options.tailDot) {
      ctx.beginPath();
      ctx.arc(x1, y1, Math.max(2.2, width * 0.8), 0, Math.PI * 2);
      ctx.fill();
    }

    if (label) {
      ctx.font = "760 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      const metrics = ctx.measureText(label);
      const padX = 7;
      const boxW = metrics.width + padX * 2;
      const boxH = 22;
      const labelT = options.labelT ?? 1;
      const labelOffset = options.labelOffset ?? 0;
      const anchorX = x1 + dx * labelT + px * labelOffset;
      const anchorY = y1 + dy * labelT + py * labelOffset;
      let labelX = anchorX + (ux >= 0 ? 8 : -boxW - 8);
      let labelY = anchorY + (uy >= 0 ? 7 : -boxH - 7);
      labelX = Math.max(4, Math.min(frame.width - boxW - 4, labelX));
      labelY = Math.max(4, Math.min(frame.height - boxH - 4, labelY));
      ctx.globalAlpha = 0.94;
      ctx.fillStyle = frame.p.surface;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, boxW, boxH, 11);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.textBaseline = "middle";
      ctx.fillText(label, labelX + padX, labelY + boxH / 2 + 0.5);
    }
    ctx.restore();
  }

  function drawArrow(ctx, frame, point, color, label = "", width = 3, options = {}) {
    drawArrowBetween(ctx, frame, [0, 0], point, color, label, width, options);
  }

  function drawPoint(ctx, frame, point, color, label = "", radius = 5) {
    const [x, y] = toCanvas(frame, point);
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    if (label) {
      ctx.font = "700 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.fillText(label, x + 8, y - 8);
    }
    ctx.restore();
  }

  function drawLineEquation(ctx, frame, a, b, c, color, width = 2.3) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    const limit = Math.max(frame.width, frame.height) / frame.scale + 3;
    let p1;
    let p2;
    if (Math.abs(b) > EPS) {
      p1 = [-limit, (c + a * limit) / b];
      p2 = [limit, (c - a * limit) / b];
    } else if (Math.abs(a) > EPS) {
      p1 = [c / a, -limit];
      p2 = [c / a, limit];
    } else {
      ctx.restore();
      return;
    }
    const A = toCanvas(frame, p1);
    const B = toCanvas(frame, p2);
    ctx.beginPath();
    ctx.moveTo(A[0], A[1]);
    ctx.lineTo(B[0], B[1]);
    ctx.stroke();
    ctx.restore();
  }

  function drawSpan(ctx, frame, vectors, color) {
    const cert = relationCertificate(vectors);
    ctx.save();
    if (cert.rank >= 2) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.08;
      ctx.fillRect(0, 0, frame.width, frame.height);
    } else if (cert.rank === 1) {
      const vector = vectors.find((v) => Math.hypot(v[0], v[1]) > EPS) || [1, 0];
      const A = toCanvas(frame, [-12 * vector[0], -12 * vector[1]]);
      const B = toCanvas(frame, [12 * vector[0], 12 * vector[1]]);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(A[0], A[1]);
      ctx.lineTo(B[0], B[1]);
      ctx.stroke();
    }
    ctx.restore();
  }

  function createScope(root) {
    const cleanups = [];
    const listen = (target, type, handler, options) => {
      target?.addEventListener(type, handler, options);
      cleanups.push(() => target?.removeEventListener(type, handler, options));
      return handler;
    };
    const resize = (handler) => listen(window, "resize", () => {
      if (document.body.contains(root)) handler();
    }, { passive: true });
    const cleanup = () => {
      while (cleanups.length) {
        try {
          cleanups.pop()();
        } catch (_) {
          // Ignore teardown failures; a stale lesson must never break navigation.
        }
      }
    };
    return { listen, resize, cleanup };
  }

  function bindDraggablePoints(scope, canvas, getPoints, setPoint, redraw, radius = 16) {
    let active = -1;
    function frameForEvent() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      return {
        width: rect.width,
        height: rect.height,
        scale: 44,
        cx: rect.width / 2,
        cy: rect.height / 2,
        p: palette(),
      };
    }
    scope.listen(canvas, "pointerdown", (event) => {
      const frame = frameForEvent();
      if (!frame) return;
      const rect = canvas.getBoundingClientRect();
      const pointer = [event.clientX - rect.left, event.clientY - rect.top];
      const points = getPoints();
      let best = Infinity;
      points.forEach((point, index) => {
        const [x, y] = toCanvas(frame, point);
        const distance = Math.hypot(x - pointer[0], y - pointer[1]);
        if (distance < radius && distance < best) {
          active = index;
          best = distance;
        }
      });
      if (active >= 0) {
        canvas.setPointerCapture(event.pointerId);
        event.preventDefault();
      }
    });
    scope.listen(canvas, "pointermove", (event) => {
      if (active < 0) return;
      const frame = frameForEvent();
      const rect = canvas.getBoundingClientRect();
      const world = toWorld(frame, [event.clientX - rect.left, event.clientY - rect.top]);
      setPoint(active, world.map((value) => Math.round(value * 20) / 20));
      redraw();
    });
    const release = (event) => {
      if (active >= 0 && canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      active = -1;
    };
    scope.listen(canvas, "pointerup", release);
    scope.listen(canvas, "pointercancel", release);
  }

  function pulse(element) {
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    element.classList.remove("is-pulse");
    void element.offsetWidth;
    element.classList.add("is-pulse");
  }

  const PRESETS = Object.freeze({
    systems: {
      unique2: { label: "唯一解", aug: [[1, 1, 3], [1, 2, 4]] },
      parallel2: { label: "平行无解", aug: [[1, 1, 2], [2, 2, 5]] },
      sameLine2: { label: "重合无穷多解", aug: [[1, 1, 2], [2, 2, 4]] },
      swapPivot: { label: "需要换行", aug: [[0, 1, 2], [1, 1, 3]] },
      upper3: { label: "三元上三角", aug: [[1, 1, 1, 6], [0, 1, 1, 3], [0, 0, 1, 1]] },
    },
    rank: {
      full2: { label: "满秩 2×2", A: [[1, 0], [0, 1]] },
      rankOne: { label: "秩一外积", A: [[1, 2], [2, 4]] },
      fullCol32: { label: "3×2 满列秩", A: [[1, 0], [0, 1], [1, 1]] },
      dependent33: { label: "3×3 秩二", A: [[1, 2, 3], [2, 4, 6], [0, 1, 1]] },
    },
  });

  window.Ch3Math = Object.freeze({
    ...X,
    EPS,
    formatNumber,
    tex,
    texD,
    htmlMatrix,
    htmlVector,
    htmlEquations,
    escapeHtml,
    palette,
    sizeCanvas,
    drawAxes,
    toCanvas,
    toWorld,
    drawArrow,
    drawArrowBetween,
    drawPoint,
    drawLineEquation,
    drawSpan,
    createScope,
    bindDraggablePoints,
    pulse,
    PRESETS,
  });
})();
