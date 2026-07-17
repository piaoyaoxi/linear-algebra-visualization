/* Shared 2D linear-algebra helpers for Chapter 6 labs. */
(() => {
  const EPS = 1e-9;

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function add(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
  }

  function sub(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
  }

  function scale(a, s) {
    return [a[0] * s, a[1] * s];
  }

  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }

  function cross(a, b) {
    return a[0] * b[1] - a[1] * b[0];
  }

  function norm(a) {
    return Math.hypot(a[0], a[1]);
  }

  function nearZero(x) {
    return Math.abs(x) < EPS;
  }

  function nearly(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-6;
  }

  function matVec(M, v) {
    return [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]];
  }

  function det2(M) {
    return M[0][0] * M[1][1] - M[0][1] * M[1][0];
  }

  function inv2(M) {
    const d = det2(M);
    if (nearZero(d)) return null;
    return [
      [M[1][1] / d, -M[0][1] / d],
      [-M[1][0] / d, M[0][0] / d],
    ];
  }

  function mul2(A, B) {
    return [
      [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
      [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
    ];
  }

  function columnsMatrix(u, w) {
    return [
      [u[0], w[0]],
      [u[1], w[1]],
    ];
  }

  function solve2(M, b) {
    const inv = inv2(M);
    if (!inv) return null;
    return matVec(inv, b);
  }

  function fmt(n, digits = 2) {
    if (!Number.isFinite(n)) return "—";
    const v = Math.abs(n) < 5e-4 ? 0 : n;
    return v.toFixed(digits).replace(/\.?0+$/, (m) => (m.includes(".") ? "" : m)).replace(/\.$/, "");
  }

  function fmtVec(v, digits = 2) {
    return `(${fmt(v[0], digits)}, ${fmt(v[1], digits)})`;
  }

  function fmtMat(M, digits = 2) {
    return `[[${fmt(M[0][0], digits)}, ${fmt(M[0][1], digits)}], [${fmt(M[1][0], digits)}, ${fmt(M[1][1], digits)}]]`;
  }

  function pulseClass(el) {
    if (!el) return;
    el.classList.remove("is-pulse");
    void el.offsetWidth;
    el.classList.add("is-pulse");
  }

  function createCanvasStage(host, { height = 340 } = {}) {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = height;
    host.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const state = { width: 640, height, dpr: 1 };

    function resize() {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(280, Math.floor(rect.width || 640));
      const h = height;
      state.width = w;
      state.height = h;
      state.dpr = dpr;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    function worldToScreen(p, scale = 48, origin) {
      const o = origin || [state.width / 2, state.height / 2];
      return [o[0] + p[0] * scale, o[1] - p[1] * scale];
    }

    function screenToWorld(p, scale = 48, origin) {
      const o = origin || [state.width / 2, state.height / 2];
      return [(p[0] - o[0]) / scale, (o[1] - p[1]) / scale];
    }

    function clear(theme) {
      ctx.clearRect(0, 0, state.width, state.height);
      ctx.fillStyle = theme?.bg || "transparent";
      if (theme?.bg) ctx.fillRect(0, 0, state.width, state.height);
    }

    function drawAxes(scale = 48, alpha = 0.35) {
      const o = [state.width / 2, state.height / 2];
      ctx.save();
      ctx.strokeStyle = `color-mix(in srgb, var(--muted, #88a) ${alpha * 100}%, transparent)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(16, o[1]);
      ctx.lineTo(state.width - 16, o[1]);
      ctx.moveTo(o[0], 16);
      ctx.lineTo(o[0], state.height - 16);
      ctx.stroke();
      ctx.restore();
    }

    function drawGrid(basisU, basisW, scale = 48, color = "rgba(90,140,200,0.18)") {
      const o = [state.width / 2, state.height / 2];
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (let i = -6; i <= 6; i += 1) {
        const a = worldToScreen(add(scaleVec(basisU, -6), scaleVec(basisW, i)), scale, o);
        const b = worldToScreen(add(scaleVec(basisU, 6), scaleVec(basisW, i)), scale, o);
        const c = worldToScreen(add(scaleVec(basisW, -6), scaleVec(basisU, i)), scale, o);
        const d = worldToScreen(add(scaleVec(basisW, 6), scaleVec(basisU, i)), scale, o);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.moveTo(c[0], c[1]);
        ctx.lineTo(d[0], d[1]);
        ctx.stroke();
      }
      ctx.restore();
    }

    function scaleVec(v, s) {
      return [v[0] * s, v[1] * s];
    }

    function drawArrow(from, to, { color = "#2f6fed", width = 2.5, label = "" } = {}) {
      const o = [state.width / 2, state.height / 2];
      const a = worldToScreen(from, 48, o);
      const b = worldToScreen(to, 48, o);
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(b[0], b[1]);
      ctx.lineTo(b[0] - 10 * Math.cos(ang - 0.35), b[1] - 10 * Math.sin(ang - 0.35));
      ctx.lineTo(b[0] - 10 * Math.cos(ang + 0.35), b[1] - 10 * Math.sin(ang + 0.35));
      ctx.closePath();
      ctx.fill();
      if (label) {
        ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(label, b[0] + 8, b[1] - 8);
      }
      ctx.restore();
    }

    function drawPoint(p, { color = "#222", r = 4, label = "" } = {}) {
      const o = [state.width / 2, state.height / 2];
      const s = worldToScreen(p, 48, o);
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(s[0], s[1], r, 0, Math.PI * 2);
      ctx.fill();
      if (label) {
        ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(label, s[0] + 8, s[1] - 8);
      }
      ctx.restore();
    }

    function drawSpanLine(dir, { color = "rgba(47,111,237,0.18)", width = 18 } = {}) {
      if (norm(dir) < EPS) return;
      const unit = scale(dir, 1 / norm(dir));
      const a = scale(unit, -8);
      const b = scale(unit, 8);
      const o = [state.width / 2, state.height / 2];
      const A = worldToScreen(a, 48, o);
      const B = worldToScreen(b, 48, o);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(A[0], A[1]);
      ctx.lineTo(B[0], B[1]);
      ctx.stroke();
      ctx.restore();
    }

    function pointerWorld(evt) {
      const rect = canvas.getBoundingClientRect();
      return screenToWorld([evt.clientX - rect.left, evt.clientY - rect.top], 48);
    }

    return {
      canvas,
      ctx,
      state,
      resize,
      clear,
      drawAxes,
      drawGrid,
      drawArrow,
      drawPoint,
      drawSpanLine,
      worldToScreen,
      screenToWorld,
      pointerWorld,
      disconnect() {
        ro.disconnect();
      },
    };
  }

  window.Ch6Math = {
    EPS,
    clamp,
    add,
    sub,
    scale,
    dot,
    cross,
    norm,
    nearZero,
    nearly,
    matVec,
    det2,
    inv2,
    mul2,
    columnsMatrix,
    solve2,
    fmt,
    fmtVec,
    fmtMat,
    pulseClass,
    createCanvasStage,
  };
})();
