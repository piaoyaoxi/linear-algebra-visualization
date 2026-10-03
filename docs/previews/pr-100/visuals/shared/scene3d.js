/*
 * Shared orthographic 3D scene for linear-algebra lessons.
 *
 * A scene draws a declarative list of objects (planes clipped to a viewing
 * cube, lines, arrows, points, polygons) on a 2D canvas with painter's
 * ordering. The student can orbit the camera, snap to "look along" a
 * direction, and drag handles that are constrained to the screen plane, a
 * given plane, or a given line.
 *
 * Usage:
 *   const scene = LAScene3D.create(host, { range: 4, yaw: -0.9, pitch: 0.42 });
 *   scene.setObjects(() => [...]);      // called on every render
 *   scene.setHandles([...]);            // draggable points
 *   scene.render();
 *   scene.destroy();
 *
 * Optional object flags (all backward compatible):
 *   ghost: true     the previous state of an object: same colour, dashed, ~35% alpha
 *   glow: true | k  highlight: a wide underlay in the same colour (k scales its strength)
 * Optional scene options:
 *   spreadLabels    nudge overlapping labels apart in screen space
 *   scene.setRange(L, animate) zooms the viewing cube.
 */
(() => {
  const V = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    len: (a) => Math.hypot(a[0], a[1], a[2]),
    norm: (a) => {
      const l = Math.hypot(a[0], a[1], a[2]);
      return l < 1e-12 ? [0, 0, 0] : [a[0] / l, a[1] / l, a[2] / l];
    },
  };

  const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  function cssColor(style, name, fallback) {
    const value = style.getPropertyValue(name).trim();
    return value || fallback;
  }

  function palette(host) {
    const style = getComputedStyle(host);
    const dark = document.body.classList.contains("dark");
    return {
      dark,
      text: cssColor(style, "--text", "#18212c"),
      muted: cssColor(style, "--muted", "#66717f"),
      faint: cssColor(style, "--faint", "#8b96a5"),
      line: cssColor(style, "--line-strong", "rgba(28,43,61,.2)"),
      accent: cssColor(style, "--accent", "#0f8f88"),
      coral: cssColor(style, "--coral", "#d46b4f"),
      blue: cssColor(style, "--blue", "#335eea"),
      gold: cssColor(style, "--gold", "#b78a1b"),
      violet: cssColor(style, "--violet", "#7258ca"),
      // colour roles (tokens.css): labs should prefer these to hue names
      v1: cssColor(style, "--cv-v1", "#2a64a8"),
      v2: cssColor(style, "--cv-v2", "#c4552f"),
      drag: cssColor(style, "--cv-drag", "#a87a12"),
      image: cssColor(style, "--cv-image", "#8c4f86"),
      subspace: cssColor(style, "--cv-subspace", "#2c5e4a"),
      axis: cssColor(style, "--cv-axis", "#8a8d84"),
      paper: dark ? "rgba(14,18,27,0)" : "rgba(255,255,255,0)",
    };
  }

  /* Resolve a color token ("accent", "coral", ...) or pass a literal through. */
  function resolve(pal, color) {
    if (!color) return pal.accent;
    return pal[color] || color;
  }

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

  /* Polygon of the plane n·x = d inside the cube [-L, L]^3 (may be empty). */
  function clipPlane(n, d, L) {
    const corners = [];
    for (const x of [-L, L]) for (const y of [-L, L]) for (const z of [-L, L]) corners.push([x, y, z]);
    const edges = [];
    for (let i = 0; i < 8; i += 1) {
      for (let j = i + 1; j < 8; j += 1) {
        const a = corners[i];
        const b = corners[j];
        const diff = (a[0] !== b[0]) + (a[1] !== b[1]) + (a[2] !== b[2]);
        if (diff === 1) edges.push([a, b]);
      }
    }
    const pts = [];
    const eps = 1e-9 * Math.max(1, Math.abs(d) + V.len(n) * L);
    // Corners lying exactly on the plane.
    corners.forEach((c) => {
      if (Math.abs(V.dot(n, c) - d) <= eps) pts.push(c);
    });
    // Proper crossings strictly inside an edge.
    for (const [a, b] of edges) {
      const fa = V.dot(n, a) - d;
      const fb = V.dot(n, b) - d;
      if (Math.abs(fa) <= eps || Math.abs(fb) <= eps) continue;
      if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) {
        const t = fa / (fa - fb);
        pts.push(V.add(a, V.mul(V.sub(b, a), t)));
      }
    }
    if (pts.length < 3) return [];
    const unique = [];
    pts.forEach((p) => {
      if (!unique.some((q) => V.len(V.sub(p, q)) < 1e-7)) unique.push(p);
    });
    if (unique.length < 3) return [];
    const c = V.mul(unique.reduce((s, p) => V.add(s, p), [0, 0, 0]), 1 / unique.length);
    const nn = V.norm(n);
    const helper = Math.abs(nn[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    const e1 = V.norm(V.cross(nn, helper));
    const e2 = V.cross(nn, e1);
    return unique
      .map((p) => ({ p, a: Math.atan2(V.dot(V.sub(p, c), e2), V.dot(V.sub(p, c), e1)) }))
      .sort((x, y) => x.a - y.a)
      .map((x) => x.p);
  }

  /* Clip the infinite line p + t·dir to the cube; returns [a, b] or null. */
  function clipLine(p, dir, L) {
    let t0 = -Infinity;
    let t1 = Infinity;
    for (let k = 0; k < 3; k += 1) {
      if (Math.abs(dir[k]) < 1e-12) {
        if (p[k] < -L - 1e-9 || p[k] > L + 1e-9) return null;
      } else {
        let a = (-L - p[k]) / dir[k];
        let b = (L - p[k]) / dir[k];
        if (a > b) [a, b] = [b, a];
        t0 = Math.max(t0, a);
        t1 = Math.min(t1, b);
      }
    }
    if (t0 > t1) return null;
    return [V.add(p, V.mul(dir, t0)), V.add(p, V.mul(dir, t1))];
  }

  const GHOST_DASH = [5, 5];
  const glowOf = (o) => (o.glow ? (typeof o.glow === "number" ? o.glow : 1) : 0);
  /* Stroke style of a line-like object: ghosts are dashed and faint. */
  function lineStyle(o) {
    return {
      dash: o.dash || (o.ghost ? GHOST_DASH : undefined),
      alpha: o.alpha ?? (o.ghost ? 0.35 : 1),
      glow: glowOf(o),
    };
  }

  function create(host, options = {}) {
    let L = options.range || 4;
    const defaults = { yaw: options.yaw ?? -0.95, pitch: options.pitch ?? 0.42 };
    const camera = { yaw: defaults.yaw, pitch: defaults.pitch };
    let objectsFn = () => [];
    let handles = [];
    let animation = 0;
    let destroyed = false;
    let hover = null;
    let drag = null;
    const listeners = { change: [], camera: [] };

    const wrap = document.createElement("div");
    wrap.className = "la3d";
    const canvas = document.createElement("canvas");
    canvas.className = "la3d-canvas";
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", options.label || "可旋转的三维图");
    wrap.append(canvas);
    const hint = document.createElement("div");
    hint.className = "la3d-hint";
    hint.textContent = options.hint ?? "拖动空白处旋转 · 拖动圆点改变向量";
    wrap.append(hint);
    host.append(wrap);
    const ctx = canvas.getContext("2d");
    let size = { w: 0, h: 0, dpr: 1 };

    function basis() {
      const cy = Math.cos(camera.yaw);
      const sy = Math.sin(camera.yaw);
      const cp = Math.cos(camera.pitch);
      const sp = Math.sin(camera.pitch);
      const d = [cp * cy, cp * sy, sp]; // toward the viewer
      let right = [-sy, cy, 0];
      right = V.norm(right);
      const up = V.cross(d, right);
      return { d, right, up };
    }

    function scale() {
      return Math.min(size.w, size.h) / (2 * L * 1.72);
    }

    function project(p, b = basis()) {
      const s = scale();
      return {
        x: size.w / 2 + V.dot(p, b.right) * s,
        y: size.h / 2 - V.dot(p, b.up) * s,
        z: V.dot(p, b.d),
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

    function drawText(text, x, y, color, font = "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif", align = "left") {
      ctx.save();
      ctx.font = font;
      ctx.textAlign = align;
      ctx.textBaseline = "middle";
      const pal = palette(host);
      ctx.lineWidth = 4;
      ctx.strokeStyle = pal.dark ? "rgba(14,18,27,.85)" : "rgba(255,255,255,.9)";
      ctx.strokeText(text, x, y);
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    function render() {
      if (destroyed || !size.w) return;
      const pal = palette(host);
      const b = basis();
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
      ctx.clearRect(0, 0, size.w, size.h);

      const prims = [];
      const labels = [];

      // Frame: faint cube edges and coordinate axes.
      if (options.frame !== false) {
        const c = [-L, L];
        for (const y of c) for (const z of c) prims.push({ kind: "seg", a: [-L, y, z], b: [L, y, z], color: pal.line, width: 0.6, alpha: 0.35 });
        for (const x of c) for (const z of c) prims.push({ kind: "seg", a: [x, -L, z], b: [x, L, z], color: pal.line, width: 0.6, alpha: 0.35 });
        for (const x of c) for (const y of c) prims.push({ kind: "seg", a: [x, y, -L], b: [x, y, L], color: pal.line, width: 0.6, alpha: 0.35 });
        const names = options.axisNames || ["x₁", "x₂", "x₃"];
        [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach((e, i) => {
          prims.push({ kind: "seg", a: V.mul(e, -L), b: V.mul(e, L), color: pal.muted, width: 1, alpha: 0.55 });
          labels.push({ p: V.mul(e, L * 1.08), text: names[i], color: pal.muted, font: "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" });
        });
      }

      const objects = objectsFn() || [];
      for (const o of objects) {
        if (!o || o.hidden) continue;
        const color = resolve(pal, o.color);
        if (o.type === "plane") {
          const poly = clipPlane(o.n, o.d || 0, L);
          if (poly.length) {
            prims.push({ kind: "poly", pts: poly, fill: withAlpha(color, o.alpha ?? (o.ghost ? 0.035 : 0.16)), stroke: withAlpha(color, o.strokeAlpha ?? (o.ghost ? 0.35 : 0.7)), width: o.width || 1.3, dash: o.dash || (o.ghost ? GHOST_DASH : undefined), glow: glowOf(o), color });
            if (o.label) labels.push({ p: o.labelAt || poly[0], text: o.label, color });
          }
        } else if (o.type === "polygon") {
          prims.push({ kind: "poly", pts: o.pts, fill: withAlpha(color, o.alpha ?? (o.ghost ? 0.035 : 0.18)), stroke: withAlpha(color, o.strokeAlpha ?? (o.ghost ? 0.35 : 0.8)), width: o.width || 1.2, dash: o.dash || (o.ghost ? GHOST_DASH : undefined), glow: glowOf(o), color });
        } else if (o.type === "box") {
          const [u, v, w] = o.vectors;
          const O = o.origin || [0, 0, 0];
          const P = (a, bb, cc) => V.add(O, V.add(V.mul(u, a), V.add(V.mul(v, bb), V.mul(w, cc))));
          const faces = [
            [P(0, 0, 0), P(1, 0, 0), P(1, 1, 0), P(0, 1, 0)],
            [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)],
            [P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)],
            [P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1)],
            [P(0, 0, 0), P(0, 1, 0), P(0, 1, 1), P(0, 0, 1)],
            [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)],
          ];
          faces.forEach((f) => prims.push({ kind: "poly", pts: f, fill: withAlpha(color, o.alpha ?? 0.1), stroke: withAlpha(color, 0.55), width: 1 }));
        } else if (o.type === "line") {
          const seg = clipLine(o.p || [0, 0, 0], o.dir, L);
          if (seg) {
            prims.push({ kind: "seg", a: seg[0], b: seg[1], color, width: o.width || 2.4, ...lineStyle(o) });
            if (o.label) labels.push({ p: o.labelAt || seg[1], text: o.label, color });
          }
        } else if (o.type === "segment") {
          prims.push({ kind: "seg", a: o.a, b: o.b, color, width: o.width || 1.6, ...lineStyle(o) });
          if (o.label) labels.push({ p: o.labelAt || V.mul(V.add(o.a, o.b), 0.5), text: o.label, color, font: o.font });
        } else if (o.type === "arrow") {
          const from = o.from || [0, 0, 0];
          if (V.len(V.sub(o.to, from)) < 1e-9) continue;
          prims.push({ kind: "arrow", a: from, b: o.to, color, width: o.width || 2.8, ...lineStyle(o) });
          if (o.label) labels.push({ p: o.labelAt || V.add(o.to, V.mul(V.norm(V.sub(o.to, from)), 0.28)), text: o.label, color, font: "700 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" });
        } else if (o.type === "point") {
          prims.push({ kind: "dot", p: o.p, color, r: o.r || 5, hollow: o.hollow });
          if (o.label) labels.push({ p: o.p, text: o.label, color, dx: 10, dy: -10 });
        } else if (o.type === "label") {
          labels.push({ p: o.p, text: o.text, color, font: o.font });
        }
      }

      // Painter's order: far first.
      const depthOf = (prim) => {
        if (prim.kind === "poly") return prim.pts.reduce((s, p) => s + V.dot(p, b.d), 0) / prim.pts.length;
        if (prim.kind === "dot") return V.dot(prim.p, b.d) + 0.05;
        return (V.dot(prim.a, b.d) + V.dot(prim.b, b.d)) / 2 + (prim.kind === "arrow" ? 0.02 : 0);
      };
      prims.sort((x, y) => depthOf(x) - depthOf(y));

      for (const prim of prims) {
        ctx.save();
        if (prim.kind === "poly") {
          ctx.beginPath();
          prim.pts.forEach((p, i) => {
            const q = project(p, b);
            if (i) ctx.lineTo(q.x, q.y);
            else ctx.moveTo(q.x, q.y);
          });
          ctx.closePath();
          ctx.fillStyle = prim.fill;
          ctx.fill();
          if (prim.glow) {
            ctx.strokeStyle = withAlpha(prim.color, (pal.dark ? 0.2 : 0.16) * prim.glow);
            ctx.lineWidth = prim.width + 7;
            ctx.lineJoin = "round";
            ctx.stroke();
          }
          if (prim.dash) ctx.setLineDash(prim.dash);
          ctx.strokeStyle = prim.stroke;
          ctx.lineWidth = prim.width;
          ctx.stroke();
        } else if (prim.kind === "seg" || prim.kind === "arrow") {
          const a = project(prim.a, b);
          const q = project(prim.b, b);
          if (prim.glow) {
            ctx.save();
            ctx.strokeStyle = withAlpha(prim.color, (pal.dark ? 0.2 : 0.16) * prim.glow);
            ctx.lineWidth = prim.width + 7;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
            ctx.restore();
          }
          ctx.globalAlpha = prim.alpha ?? 1;
          ctx.strokeStyle = prim.color;
          ctx.lineWidth = prim.width;
          ctx.lineCap = "round";
          if (prim.dash) ctx.setLineDash(prim.dash);
          let end = q;
          if (prim.kind === "arrow") {
            const ang = Math.atan2(q.y - a.y, q.x - a.x);
            const head = Math.min(13, Math.hypot(q.x - a.x, q.y - a.y) * 0.45);
            end = { x: q.x - Math.cos(ang) * head * 0.8, y: q.y - Math.sin(ang) * head * 0.8 };
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = prim.color;
            ctx.beginPath();
            ctx.moveTo(q.x, q.y);
            ctx.lineTo(q.x - Math.cos(ang - 0.42) * head, q.y - Math.sin(ang - 0.42) * head);
            ctx.lineTo(q.x - Math.cos(ang + 0.42) * head, q.y - Math.sin(ang + 0.42) * head);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        } else if (prim.kind === "dot") {
          const q = project(prim.p, b);
          ctx.beginPath();
          ctx.arc(q.x, q.y, prim.r, 0, Math.PI * 2);
          if (prim.hollow) {
            ctx.fillStyle = pal.dark ? "#161b27" : "#fff";
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = prim.color;
            ctx.stroke();
          } else {
            ctx.fillStyle = prim.color;
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // Handles on top.
      handles.forEach((h) => {
        if (h.hidden?.()) return;
        const q = project(h.get(), b);
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

      const placed = [];
      // arrow shafts in screen space, so spread labels also keep off other arrows
      const shafts = options.spreadLabels ? prims.filter((p) => p.kind === "arrow").map((p) => [project(p.a, b), project(p.b, b)]) : [];
      labels.forEach((lab) => {
        const q = project(lab.p, b);
        let x = q.x + (lab.dx || 6);
        let y = q.y + (lab.dy || -6);
        if (options.spreadLabels) {
          ctx.save();
          ctx.font = lab.font || "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
          const w = ctx.measureText(lab.text).width + 4;
          ctx.restore();
          const h = 16;
          const nearShaft = (cx, cy) =>
            shafts.some(([p, q]) => {
              const mx = cx + w / 2;
              const vx = q.x - p.x;
              const vy = q.y - p.y;
              const t = Math.max(0, Math.min(1, ((mx - p.x) * vx + (cy - p.y) * vy) / (vx * vx + vy * vy || 1)));
              return Math.hypot(p.x + vx * t - mx, p.y + vy * t - cy) < Math.min(w / 2, 14);
            });
          const hits = (cx, cy) => placed.some((r) => cx < r.x + r.w && cx + w > r.x && Math.abs(cy - r.y) < h) || nearShaft(cx, cy);
          const tries = [[0, 0], [0, -h], [0, h], [w * 0.6, 0], [-w * 0.6, 0], [0, -2 * h], [0, 2 * h], [w * 0.6, -h], [-w * 0.6, h]];
          const ok = tries.find(([ox, oy]) => !hits(x + ox, y + oy));
          if (ok) {
            x += ok[0];
            y += ok[1];
          }
          x = Math.max(4, Math.min(size.w - w, x));
          y = Math.max(10, Math.min(size.h - 10, y));
          placed.push({ x, y, w });
        }
        drawText(lab.text, x, y, lab.color, lab.font);
      });
    }

    /* ---------- zoom ---------- */
    let zoomAnim = 0;
    function setRange(target, animate = true) {
      cancelAnimationFrame(zoomAnim);
      const from = L;
      if (!animate || reduceMotion() || Math.abs(target - from) < 1e-9) {
        L = target;
        render();
        return;
      }
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / 420);
        L = from + (target - from) * (1 - (1 - t) ** 3);
        render();
        if (t < 1) zoomAnim = requestAnimationFrame(step);
      };
      zoomAnim = requestAnimationFrame(step);
    }

    /* ---------- camera ---------- */
    function setCamera(target, animate = true) {
      cancelAnimationFrame(animation);
      const from = { ...camera };
      let to = { yaw: target.yaw ?? camera.yaw, pitch: target.pitch ?? camera.pitch };
      // Take the short way round.
      while (to.yaw - from.yaw > Math.PI) to.yaw -= 2 * Math.PI;
      while (to.yaw - from.yaw < -Math.PI) to.yaw += 2 * Math.PI;
      if (!animate || reduceMotion()) {
        Object.assign(camera, to);
        render();
        listeners.camera.forEach((f) => f(camera));
        return;
      }
      const start = performance.now();
      const dur = 520;
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const e = 1 - (1 - t) ** 3;
        camera.yaw = from.yaw + (to.yaw - from.yaw) * e;
        camera.pitch = from.pitch + (to.pitch - from.pitch) * e;
        render();
        if (t < 1) animation = requestAnimationFrame(step);
        else listeners.camera.forEach((f) => f(camera));
      };
      animation = requestAnimationFrame(step);
    }

    /* Point the view so that the viewer looks along direction v. */
    function lookAlong(v, animate = true) {
      const d = V.norm(v);
      const pitch = Math.asin(Math.max(-1, Math.min(1, d[2])));
      const yaw = Math.abs(d[0]) + Math.abs(d[1]) < 1e-6 ? camera.yaw : Math.atan2(d[1], d[0]);
      // Exact alignment is allowed here so edge-on planes really collapse to a line.
      setCamera({ yaw, pitch: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch)) }, animate);
    }

    function resetView(animate = true) {
      setCamera(defaults, animate);
    }

    /* ---------- pointer ---------- */
    function localPoint(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function pickHandle(pt) {
      const b = basis();
      let best = null;
      let bestDist = 18;
      handles.forEach((h) => {
        if (h.hidden?.()) return;
        const q = project(h.get(), b);
        const dist = Math.hypot(q.x - pt.x, q.y - pt.y);
        if (dist < bestDist) {
          best = h;
          bestDist = dist;
        }
      });
      return best;
    }

    function snapValue(x, snap) {
      return snap ? Math.round(x / snap) * snap : x;
    }

    function clampCube(p) {
      return p.map((x) => Math.max(-L, Math.min(L, x)));
    }

    function screenToWorldOnPlane(pt, n, d) {
      const b = basis();
      const s = scale();
      const sx = (pt.x - size.w / 2) / s;
      const sy = -(pt.y - size.h / 2) / s;
      const origin = V.add(V.mul(b.right, sx), V.mul(b.up, sy));
      const denom = V.dot(n, b.d);
      if (Math.abs(denom) < 1e-4) return null; // plane is edge-on
      const t = (d - V.dot(n, origin)) / denom;
      return V.add(origin, V.mul(b.d, t));
    }

    function dragTo(pt) {
      const h = drag.handle;
      const start = drag.startWorld;
      const b = basis();
      const s = scale();
      let p;
      if (h.mode === "line") {
        const dir = V.norm(h.dir);
        const sd = { x: V.dot(dir, b.right), y: -V.dot(dir, b.up) };
        const l2 = sd.x * sd.x + sd.y * sd.y;
        if (l2 < 1e-4) return;
        const t = ((pt.x - drag.startPt.x) * sd.x + (pt.y - drag.startPt.y) * sd.y) / (l2 * s);
        p = V.add(start, V.mul(dir, t));
      } else if (h.mode === "plane") {
        p = screenToWorldOnPlane(pt, h.plane.n, h.plane.d || 0);
        if (!p) return;
      } else {
        const dx = (pt.x - drag.startPt.x) / s;
        const dy = -(pt.y - drag.startPt.y) / s;
        p = V.add(start, V.add(V.mul(b.right, dx), V.mul(b.up, dy)));
      }
      p = clampCube(p.map((x) => snapValue(x, h.snap)));
      h.set(p);
      listeners.change.forEach((f) => f(h));
      render();
    }

    function onPointerDown(event) {
      if (event.button !== undefined && event.button !== 0) return;
      const pt = localPoint(event);
      const h = pickHandle(pt);
      canvas.setPointerCapture?.(event.pointerId);
      if (h) {
        drag = { handle: h, startPt: pt, startWorld: h.get().slice() };
      } else {
        drag = { orbit: true, startPt: pt, yaw: camera.yaw, pitch: camera.pitch };
        cancelAnimationFrame(animation);
      }
      wrap.classList.add("is-dragging");
      event.preventDefault();
    }

    function onPointerMove(event) {
      const pt = localPoint(event);
      if (!drag) {
        const h = pickHandle(pt);
        if (h !== hover) {
          hover = h;
          canvas.style.cursor = h ? "grab" : "default";
          render();
        }
        return;
      }
      if (drag.orbit) {
        camera.yaw = drag.yaw - (pt.x - drag.startPt.x) * 0.009;
        camera.pitch = Math.max(-1.52, Math.min(1.52, drag.pitch + (pt.y - drag.startPt.y) * 0.009));
        render();
      } else {
        dragTo(pt);
      }
    }

    function onPointerUp() {
      if (drag?.orbit) listeners.camera.forEach((f) => f(camera));
      if (drag?.handle) drag.handle.end?.();
      drag = null;
      wrap.classList.remove("is-dragging");
    }

    function onKey(event) {
      const k = event.key;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(k)) return;
      event.preventDefault();
      if (k === "ArrowLeft") camera.yaw += 0.12;
      if (k === "ArrowRight") camera.yaw -= 0.12;
      if (k === "ArrowUp") camera.pitch = Math.min(1.52, camera.pitch + 0.1);
      if (k === "ArrowDown") camera.pitch = Math.max(-1.52, camera.pitch - 0.1);
      render();
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", () => {
      if (!drag && hover) {
        hover = null;
        render();
      }
    });
    canvas.addEventListener("dblclick", () => resetView());
    canvas.addEventListener("keydown", onKey);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const themeObserver = new MutationObserver(() => render());
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    requestAnimationFrame(resize);

    return {
      canvas,
      element: wrap,
      camera,
      get range() {
        return L;
      },
      setRange,
      render,
      resize,
      project: (p) => project(p),
      setObjects(fn) {
        objectsFn = typeof fn === "function" ? fn : () => fn;
        render();
      },
      setHandles(list) {
        handles = list || [];
        render();
      },
      setCamera,
      lookAlong,
      resetView,
      on(event, fn) {
        listeners[event]?.push(fn);
      },
      destroy() {
        destroyed = true;
        cancelAnimationFrame(animation);
        cancelAnimationFrame(zoomAnim);
        ro.disconnect();
        themeObserver.disconnect();
        wrap.remove();
      },
    };
  }

  window.LAScene3D = Object.freeze({ create, vec: V, clipPlane, clipLine });
})();
