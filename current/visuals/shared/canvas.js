/*
 * What every chapter's canvas code does the same way.
 *
 *   LACanvas.setup(canvas, { fallback, maxDpr, whole })
 *     sizes the bitmap to the canvas's CSS box at the screen's pixel density, clears it and
 *     returns { ctx, width, height, dpr } with the context scaled to CSS pixels. Options:
 *       fallback: [w, h]  the size to draw at while the canvas has no box yet (hidden): its
 *                         clientWidth / clientHeight, else these; without it, 1 × 1
 *       maxDpr:   at most this many bitmap pixels per CSS pixel (2 keeps phones fast)
 *       whole:    whole CSS pixels (the box size rounded)
 *   LACanvas.withAlpha(color, alpha)
 *     the colour (#rgb, #rrggbb, rgb(), rgba()) at the given opacity; anything else unchanged.
 *   LACanvas.keyHandles(canvas, { handles, move, where, show, rotate, help })
 *     the drag handles of a canvas from the keyboard (below).
 */
(() => {
  function setup(canvas, { fallback = null, maxDpr = Infinity, whole = false } = {}) {
    const rect = canvas.getBoundingClientRect();
    let width = rect.width || (fallback ? canvas.clientWidth || fallback[0] : 0);
    let height = rect.height || (fallback ? canvas.clientHeight || fallback[1] : 0);
    if (whole) {
      width = Math.round(width);
      height = Math.round(height);
    }
    width = Math.max(1, width);
    height = Math.max(1, height);
    const dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
    const pixelWidth = Math.max(1, Math.round(width * dpr));
    const pixelHeight = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height, dpr };
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

  /*
   * Keyboard use of a canvas's drag handles. With the canvas focused, the arrow keys move the
   * chosen handle one step (Shift: four steps) and Enter or Space chooses the next handle; the
   * handle's name and new position are read out (aria-live). The chosen handle is highlighted
   * while the canvas has focus. With `rotate` (a 3D scene) the arrow keys turn the camera
   * until Enter or Space chooses a handle, and Escape gives them back to the camera.
   *   handles()          the handles that can be moved now (visible ones), in order
   *   move(h, dx, dy)    one step right (dx 1) / up (dy 1) on the screen, under the engine's
   *                      own constraints, as a finished drag (change and end); true if it moved
   *   where(h)           the position to read out, e.g. "(1, −0.5)"
   *   show(h | null)     highlight the chosen handle (null: none); called on keyboard focus,
   *                      on every key and on blur
   *   help               how to use the keys, added to the canvas's aria-label
   * A handle may carry a `name` ("v₁"); otherwise it is read as “圆点 1”, “圆点 2” …
   * Returns { refresh() } (after the handles change) and holding() (a handle is chosen).
   */
  const ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
  function keyHandles(canvas, { handles, move, where, show, rotate = false, help }) {
    const live = document.createElement("p");
    live.className = "visually-hidden";
    live.setAttribute("aria-live", "polite");
    canvas.after(live);
    const base = canvas.getAttribute("aria-label") || "";
    let index = 0;
    let chosen = !rotate;
    const current = () => {
      const list = handles();
      if (!list.length) return null;
      index = Math.min(index, list.length - 1);
      return list[index];
    };
    const say = (h) => {
      live.textContent = `${h.name || `圆点 ${index + 1}`}：${where(h)}`;
    };
    canvas.addEventListener("keydown", (event) => {
      const list = handles();
      if (!list.length || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (chosen) index = (index + 1) % list.length;
        chosen = true;
        const h = current();
        show(h);
        say(h);
        return;
      }
      if (event.key === "Escape" && rotate && chosen) {
        chosen = false;
        show(null);
        live.textContent = "方向键旋转视角";
        return;
      }
      const dir = ARROWS[event.key];
      if (!dir || !chosen) return;
      event.preventDefault();
      // a lab may hand over new handle objects after each move: the same place in the list
      for (let i = 0; i < (event.shiftKey ? 4 : 1); i += 1) move(current(), dir[0], dir[1]);
      const h = current();
      show(h);
      say(h);
    });
    // focus from the keyboard shows the handle at once; a click shows it with the first key
    canvas.addEventListener("focus", () => {
      if (chosen && canvas.matches(":focus-visible")) show(current());
    });
    canvas.addEventListener("blur", () => show(null));
    const refresh = () => canvas.setAttribute("aria-label", handles().length ? `${base}。${help}` : base);
    refresh();
    return { refresh, holding: () => chosen && Boolean(handles().length) };
  }

  window.LACanvas = { setup, withAlpha, keyHandles };
})();
