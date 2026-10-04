/*
 * Small 2D companion to the shared 3D scene (visuals/shared/scene3d.js), used by
 * the Chapter 9 plane labs. Objects are declared in world coordinates and redrawn
 * on every change, resize and theme switch. Handles snap to a grid so that the
 * labs can decide equalities with exact rational arithmetic.
 *
 *   const plane = Ch9Plane.create(host, { range: 3, label, hint });
 *   plane.setObjects(() => [...]);
 *   plane.setHandles([{ get, set, snap, color, axis: "y" }]);
 */
(() => {
  const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  function palette(host) {
    const style = getComputedStyle(host);
    const token = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
    const dark = document.body.classList.contains("dark");
    return {
      dark,
      text: token("--text", "#18212c"),
      muted: token("--muted", "#66717f"),
      faint: token("--faint", "#8b96a5"),
      line: token("--line", "rgba(28,43,61,.12)"),
      strong: token("--line-strong", "rgba(28,43,61,.2)"),
      accent: token("--accent", "#0f8f88"),
      coral: token("--coral", "#d46b4f"),
      blue: token("--blue", "#335eea"),
      gold: token("--gold", "#b78a1b"),
      violet: token("--violet", "#7258ca"),
      // colour roles (tokens.css): labs should prefer these to hue names
      v1: token("--cv-v1", "#2a64a8"),
      v2: token("--cv-v2", "#c4552f"),
      drag: token("--cv-drag", "#a87a12"),
      image: token("--cv-image", "#8c4f86"),
      subspace: token("--cv-subspace", "#2c5e4a"),
      axis: token("--cv-axis", "#8a8d84"),
    };
  }

  const resolve = (pal, color) => (color ? pal[color] || color : pal.accent);

  function withAlpha(color, alpha) {
    if (color.startsWith("#")) {
      const hex = color.length === 4 ? color.replace(/#(.)(.)(.)/, "#$1$1$2$2$3$3") : color;
      const n = parseInt(hex.slice(1, 7), 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
    }
    const m = color.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const [r, g, b] = m[1].split(",").map((x) => parseFloat(x));
      return `rgba(${r},${g},${b},${alpha})`;
    }
    return color;
  }

  function create(host, options = {}) {
    const bounds = options.bounds || { x: [-(options.range || 3), options.range || 3], y: [-(options.range || 3), options.range || 3] };
    const equal = options.equal !== false;
    let objectsFn = () => [];
    let handles = [];
    let drag = null;
    let hover = null;
    let destroyed = false;
    const listeners = { change: [] };

    const wrap = document.createElement("div");
    wrap.className = "ch9p";
    if (options.compact) wrap.classList.add("is-compact");
    const canvas = document.createElement("canvas");
    canvas.className = "ch9p-canvas";
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", options.label || "平面图");
    wrap.append(canvas);
    if (options.hint !== "") {
      const hint = document.createElement("div");
      hint.className = "ch9p-hint";
      hint.textContent = options.hint || "拖动圆点改变向量";
      wrap.append(hint);
    }
    host.append(wrap);
    const ctx = canvas.getContext("2d");
    let size = { w: 0, h: 0, dpr: 1 };

    function frame() {
      const pad = 18;
      const wx = bounds.x[1] - bounds.x[0];
      const wy = bounds.y[1] - bounds.y[0];
      let sx = (size.w - 2 * pad) / wx;
      let sy = (size.h - 2 * pad) / wy;
      if (equal) sx = sy = Math.min(sx, sy);
      const cx = (bounds.x[0] + bounds.x[1]) / 2;
      const cy = (bounds.y[0] + bounds.y[1]) / 2;
      return {
        sx,
        sy,
        toScreen: (p) => ({ x: size.w / 2 + (p[0] - cx) * sx, y: size.h / 2 - (p[1] - cy) * sy }),
        toWorld: (q) => [cx + (q.x - size.w / 2) / sx, cy - (q.y - size.h / 2) / sy],
        view: {
          x: [cx - size.w / 2 / sx, cx + size.w / 2 / sx],
          y: [cy - size.h / 2 / sy, cy + size.h / 2 / sy],
        },
      };
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (w === size.w && h === size.h && dpr === size.dpr) return;
      size = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      render();
    }

    /*
     * Where a label lands: kept inside the canvas and, when `avoid` is given,
     * moved off the boxes of labels already drawn (axis names included).
     */
    function place(str, x, y, font, align, avoid) {
      ctx.save();
      ctx.font = font;
      const width = ctx.measureText(str).width;
      ctx.restore();
      const leftOf = (cx) => (align === "center" ? cx - width / 2 : align === "right" || align === "end" ? cx - width : cx);
      const fit = (cx, cy) => {
        const left = leftOf(cx);
        return [cx + Math.max(4 - left, 0) - Math.max(left + width - (size.w - 4), 0), Math.min(Math.max(cy, 9), size.h - 9)];
      };
      let [px, py] = fit(x, y);
      if (avoid) {
        const gap = 4;
        const hits = (cx, cy) => avoid.some((r) => leftOf(cx) < r.x + r.w + gap && leftOf(cx) + width + gap > r.x && Math.abs(cy - r.y) < 15);
        const tries = [[0, 0], [0, -16], [0, 16], [-width - 8, 0], [0, -32], [0, 32], [-width - 8, -16], [-width - 8, 16]];
        for (const [ox, oy] of tries) {
          const [cx, cy] = fit(x + ox, y + oy);
          if (!hits(cx, cy)) {
            [px, py] = [cx, cy];
            break;
          }
        }
        avoid.push({ x: leftOf(px), y: py, w: width });
      }
      return [px, py];
    }

    function text(str, x, y, color, font, align = "left", avoid) {
      font = font || "650 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      // Keep labels inside the canvas on narrow screens.
      [x, y] = place(str, x, y, font, align, avoid);
      ctx.save();
      ctx.font = font;
      ctx.textAlign = align;
      ctx.textBaseline = "middle";
      ctx.lineWidth = 4;
      ctx.strokeStyle = palette(host).dark ? "rgba(14,18,27,.85)" : "rgba(255,255,255,.92)";
      ctx.strokeText(str, x, y);
      ctx.fillStyle = color;
      ctx.fillText(str, x, y);
      ctx.restore();
    }

    function clipLine(p, dir, view) {
      let t0 = -Infinity;
      let t1 = Infinity;
      const lim = [view.x, view.y];
      for (let k = 0; k < 2; k += 1) {
        if (Math.abs(dir[k]) < 1e-12) {
          if (p[k] < lim[k][0] || p[k] > lim[k][1]) return null;
        } else {
          let a = (lim[k][0] - p[k]) / dir[k];
          let b = (lim[k][1] - p[k]) / dir[k];
          if (a > b) [a, b] = [b, a];
          t0 = Math.max(t0, a);
          t1 = Math.min(t1, b);
        }
      }
      if (t0 > t1) return null;
      return [
        [p[0] + dir[0] * t0, p[1] + dir[1] * t0],
        [p[0] + dir[0] * t1, p[1] + dir[1] * t1],
      ];
    }

    function render() {
      if (destroyed || !size.w) return;
      const pal = palette(host);
      const f = frame();
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
      ctx.clearRect(0, 0, size.w, size.h);

      // Grid and axes.
      if (options.grid !== false) {
        const step = options.gridStep || 1;
        ctx.save();
        ctx.strokeStyle = pal.line;
        ctx.lineWidth = 1;
        for (let x = Math.ceil(f.view.x[0] / step) * step; x <= f.view.x[1]; x += step) {
          const q = f.toScreen([x, 0]);
          ctx.beginPath();
          ctx.moveTo(q.x, 0);
          ctx.lineTo(q.x, size.h);
          ctx.stroke();
        }
        for (let y = Math.ceil(f.view.y[0] / step) * step; y <= f.view.y[1]; y += step) {
          const q = f.toScreen([0, y]);
          ctx.beginPath();
          ctx.moveTo(0, q.y);
          ctx.lineTo(size.w, q.y);
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.save();
      ctx.strokeStyle = pal.strong;
      ctx.lineWidth = 1.3;
      const o = f.toScreen([0, 0]);
      ctx.beginPath();
      ctx.moveTo(0, o.y);
      ctx.lineTo(size.w, o.y);
      ctx.moveTo(o.x, 0);
      ctx.lineTo(o.x, size.h);
      ctx.stroke();
      ctx.restore();
      const names = options.axisNames || ["x₁", "x₂"];
      const placed = [];
      text(names[0], size.w - 10, o.y - 12, pal.muted, "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif", "right", placed);
      text(names[1], o.x + 8, 12, pal.muted, "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif", "left", placed);
      if (options.ticks) {
        const step = options.ticks;
        for (let x = Math.ceil(f.view.x[0] / step) * step; x <= f.view.x[1]; x += step) {
          if (Math.abs(x) < 1e-9) continue;
          const q = f.toScreen([x, 0]);
          text(String(Math.round(x * 100) / 100), q.x, Math.min(size.h - 10, o.y + 12), pal.faint, "500 11px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif", "center");
        }
        for (let y = Math.ceil(f.view.y[0] / step) * step; y <= f.view.y[1]; y += step) {
          if (Math.abs(y) < 1e-9) continue;
          const q = f.toScreen([0, y]);
          text(String(Math.round(y * 100) / 100), Math.max(14, o.x - 8), q.y, pal.faint, "500 11px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif", "right");
        }
      }

      const labels = [];
      const objects = objectsFn() || [];
      for (const obj of objects) {
        if (!obj || obj.hidden) continue;
        const color = resolve(pal, obj.color);
        ctx.save();
        ctx.globalAlpha = obj.alpha ?? 1;
        if (obj.dash) ctx.setLineDash(obj.dash);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (obj.type === "line") {
          const seg = clipLine(obj.p || [0, 0], obj.dir, f.view);
          if (seg) {
            const a = f.toScreen(seg[0]);
            const b = f.toScreen(seg[1]);
            ctx.strokeStyle = color;
            ctx.lineWidth = obj.width || 1.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            if (obj.label) labels.push({ p: obj.labelAt || seg[1], text: obj.label, color, dx: -8, dy: 12, align: "right" });
          }
        } else if (obj.type === "segment") {
          const a = f.toScreen(obj.a);
          const b = f.toScreen(obj.b);
          ctx.strokeStyle = color;
          ctx.lineWidth = obj.width || 1.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          if (obj.label) labels.push({ p: [(obj.a[0] + obj.b[0]) / 2, (obj.a[1] + obj.b[1]) / 2], text: obj.label, color });
        } else if (obj.type === "curve" || obj.type === "polygon") {
          // A curve may contain null entries to break it into pieces.
          const pieces = [[]];
          obj.pts.forEach((p) => (p ? pieces[pieces.length - 1].push(p) : pieces.push([])));
          pieces.forEach((pts) => {
            if (pts.length < 2) return;
            ctx.beginPath();
            pts.forEach((p, i) => {
              const q = f.toScreen(p);
              if (i) ctx.lineTo(q.x, q.y);
              else ctx.moveTo(q.x, q.y);
            });
            if (obj.closed || obj.type === "polygon") ctx.closePath();
            if (obj.fill || obj.type === "polygon") {
              ctx.fillStyle = withAlpha(color, obj.fillAlpha ?? 0.12);
              ctx.fill();
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = obj.width || 2;
            ctx.stroke();
          });
        } else if (obj.type === "arrow") {
          const from = obj.from || [0, 0];
          const a = f.toScreen(from);
          const b = f.toScreen(obj.to);
          const len = Math.hypot(b.x - a.x, b.y - a.y);
          if (len > 0.5) {
            const ang = Math.atan2(b.y - a.y, b.x - a.x);
            const head = Math.min(13, len * 0.45);
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = obj.width || 2.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x - Math.cos(ang) * head * 0.8, b.y - Math.sin(ang) * head * 0.8);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(b.x, b.y);
            ctx.lineTo(b.x - Math.cos(ang - 0.42) * head, b.y - Math.sin(ang - 0.42) * head);
            ctx.lineTo(b.x - Math.cos(ang + 0.42) * head, b.y - Math.sin(ang + 0.42) * head);
            ctx.closePath();
            ctx.fill();
            if (obj.label) {
              labels.push({
                q: { x: b.x + Math.cos(ang) * 12, y: b.y + Math.sin(ang) * 12 },
                text: obj.label,
                color,
                font: "700 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif",
                align: Math.cos(ang) < -0.3 ? "right" : "left",
              });
            }
          }
        } else if (obj.type === "point") {
          const q = f.toScreen(obj.p);
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(q.x, q.y, obj.r || 4.5, 0, Math.PI * 2);
          if (obj.hollow) {
            ctx.fillStyle = pal.dark ? "#161b27" : "#fff";
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.stroke();
          } else {
            ctx.fillStyle = color;
            ctx.fill();
          }
          if (obj.label) labels.push({ q: { x: q.x + 9, y: q.y - 10 }, text: obj.label, color });
        } else if (obj.type === "rightAngle") {
          // Small square at `at` spanned by unit directions u, v (world), size in px.
          const s = obj.size || 11;
          const at = f.toScreen(obj.at);
          const dir = (d) => {
            const p = f.toScreen([obj.at[0] + d[0], obj.at[1] + d[1]]);
            const l = Math.hypot(p.x - at.x, p.y - at.y) || 1;
            return { x: ((p.x - at.x) / l) * s, y: ((p.y - at.y) / l) * s };
          };
          const u = dir(obj.u);
          const v = dir(obj.v);
          ctx.strokeStyle = color;
          ctx.lineWidth = obj.width || 1.4;
          ctx.beginPath();
          ctx.moveTo(at.x + u.x, at.y + u.y);
          ctx.lineTo(at.x + u.x + v.x, at.y + u.y + v.y);
          ctx.lineTo(at.x + v.x, at.y + v.y);
          ctx.stroke();
        } else if (obj.type === "arc") {
          // Angle mark at `at` from direction `from` to direction `to` (the smaller turn);
          // `count` concentric arcs, radius in px.
          const at = f.toScreen(obj.at || [0, 0]);
          const ang = (d) => {
            const q = f.toScreen([(obj.at?.[0] || 0) + d[0], (obj.at?.[1] || 0) + d[1]]);
            return Math.atan2(q.y - at.y, q.x - at.x);
          };
          const a0 = ang(obj.from);
          let da = ang(obj.to) - a0;
          while (da > Math.PI) da -= 2 * Math.PI;
          while (da < -Math.PI) da += 2 * Math.PI;
          ctx.strokeStyle = color;
          ctx.lineWidth = obj.width || 1.5;
          for (let i = 0; i < (obj.count || 1); i += 1) {
            ctx.beginPath();
            ctx.arc(at.x, at.y, (obj.r || 22) + i * 4, a0, a0 + da, da < 0);
            ctx.stroke();
          }
          if (obj.label) {
            const mid = a0 + da / 2;
            const rr = (obj.r || 22) + (obj.count || 1) * 4 + 9;
            labels.push({ q: { x: at.x + Math.cos(mid) * rr, y: at.y + Math.sin(mid) * rr }, text: obj.label, color, align: "center", font: "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" });
          }
        } else if (obj.type === "ticks") {
          // `n` equal-length marks across the middle of segment a–b.
          const a = f.toScreen(obj.a);
          const b = f.toScreen(obj.b);
          const len = Math.hypot(b.x - a.x, b.y - a.y);
          if (len > 1) {
            const ux = (b.x - a.x) / len;
            const uy = (b.y - a.y) / len;
            const at = obj.at ?? 0.5;
            const m = { x: a.x + (b.x - a.x) * at, y: a.y + (b.y - a.y) * at };
            const n = obj.n || 1;
            ctx.strokeStyle = color;
            ctx.lineWidth = obj.width || 1.8;
            ctx.setLineDash([]);
            for (let i = 0; i < n; i += 1) {
              const s = (i - (n - 1) / 2) * 4.5;
              const c = { x: m.x + ux * s, y: m.y + uy * s };
              ctx.beginPath();
              ctx.moveTo(c.x - uy * 6, c.y + ux * 6);
              ctx.lineTo(c.x + uy * 6, c.y - ux * 6);
              ctx.stroke();
            }
          }
        } else if (obj.type === "label") {
          labels.push({ p: obj.p, text: obj.text, color, font: obj.font, align: obj.align, dx: obj.dx, dy: obj.dy });
        }
        ctx.restore();
      }

      handles.forEach((h) => {
        if (h.hidden?.()) return;
        const q = f.toScreen(h.get());
        const active = drag?.handle === h || hover === h;
        ctx.save();
        ctx.beginPath();
        ctx.arc(q.x, q.y, active ? 9 : 7.5, 0, Math.PI * 2);
        ctx.fillStyle = pal.dark ? "#161b27" : "#fff";
        ctx.fill();
        ctx.lineWidth = active ? 3 : 2.4;
        ctx.strokeStyle = resolve(pal, h.color);
        ctx.stroke();
        ctx.restore();
      });

      labels.forEach((lab) => {
        const q = lab.q || f.toScreen(lab.p);
        text(lab.text, q.x + (lab.dx ?? (lab.q ? 0 : 6)), q.y + (lab.dy ?? (lab.q ? 0 : -8)), lab.color, lab.font, lab.align, placed);
      });
    }

    function local(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function pick(pt) {
      const f = frame();
      let best = null;
      let bestDist = 20;
      handles.forEach((h) => {
        if (h.hidden?.()) return;
        const q = f.toScreen(h.get());
        const d = Math.hypot(q.x - pt.x, q.y - pt.y);
        if (d < bestDist) {
          best = h;
          bestDist = d;
        }
      });
      return best;
    }

    function moveHandle(pt) {
      const h = drag.handle;
      const f = frame();
      const w = f.toWorld(pt);
      const snap = h.snap || 0;
      const clampX = h.clampX || bounds.x;
      const clampY = h.clampY || bounds.y;
      const round = (x) => (snap ? Math.round(x / snap) * snap : x);
      const cur = h.get();
      let p = [round(w[0]), round(w[1])];
      if (h.axis === "y") p[0] = cur[0];
      if (h.axis === "x") p[1] = cur[1];
      p = [Math.max(clampX[0], Math.min(clampX[1], p[0])), Math.max(clampY[0], Math.min(clampY[1], p[1]))];
      p = p.map((x) => (Object.is(x, -0) ? 0 : x));
      if (p[0] === cur[0] && p[1] === cur[1]) return;
      h.set(p);
      listeners.change.forEach((fn) => fn(h));
      // a handle really moved: prediction gates count it as acting
      canvas.dispatchEvent(new CustomEvent("la-handle-move", { bubbles: true }));
      render();
    }

    function down(event) {
      if (event.button !== undefined && event.button !== 0) return;
      const pt = local(event);
      const h = pick(pt);
      if (!h) return;
      canvas.setPointerCapture?.(event.pointerId);
      drag = { handle: h };
      wrap.classList.add("is-dragging");
      event.preventDefault();
    }

    function move(event) {
      const pt = local(event);
      if (drag) {
        moveHandle(pt);
        return;
      }
      const h = pick(pt);
      if (h !== hover) {
        hover = h;
        canvas.style.cursor = h ? "grab" : "default";
        render();
      }
    }

    function up() {
      if (drag?.handle) drag.handle.end?.();
      drag = null;
      wrap.classList.remove("is-dragging");
    }

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", () => {
      if (!drag && hover) {
        hover = null;
        render();
      }
    });
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const themeObserver = new MutationObserver(() => render());
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    // during a light/dark switch the colour tokens morph frame by frame: follow them
    const onThemeMix = () => { if (canvas.isConnected) render(); };
    window.addEventListener("la-thememix", onThemeMix);
    requestAnimationFrame(resize);

    return {
      canvas,
      element: wrap,
      render,
      toScreen: (p) => frame().toScreen(p),
      setObjects(fn) {
        objectsFn = typeof fn === "function" ? fn : () => fn;
        render();
      },
      setHandles(list) {
        handles = list || [];
        render();
      },
      on(event, fn) {
        listeners[event]?.push(fn);
      },
      destroy() {
        destroyed = true;
        ro.disconnect();
        themeObserver.disconnect();
        window.removeEventListener("la-thememix", onThemeMix);
        wrap.remove();
      },
    };
  }

  /* Sample the conic {x : xᵀGx = c} (G symmetric 2×2, numbers) as a broken polyline. */
  function conic(G, c = 1, limit = 8, samples = 360) {
    const pts = [];
    let prev = false;
    for (let i = 0; i <= samples; i += 1) {
      const t = (Math.PI * 2 * i) / samples;
      const d = [Math.cos(t), Math.sin(t)];
      const q = G[0][0] * d[0] * d[0] + 2 * G[0][1] * d[0] * d[1] + G[1][1] * d[1] * d[1];
      const ok = q > 1e-9 && Math.sqrt(c / q) < limit;
      if (ok) {
        const r = Math.sqrt(c / q);
        pts.push([d[0] * r, d[1] * r]);
      } else if (prev) pts.push(null);
      prev = ok;
    }
    return pts;
  }

  window.Ch9Plane = Object.freeze({ create, conic, reduceMotion });
})();
