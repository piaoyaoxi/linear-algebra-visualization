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

  window.LACanvas = { setup, withAlpha };
})();
