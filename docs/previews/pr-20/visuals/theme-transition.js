(() => {
  const ASSETS = {
    luna: "./assets/theme/luna.webp",
    sol: "./assets/theme/sol.webp",
  };

  /**
   * The page atmosphere and the artwork reveal share one timeline. The page
   * reaches the target palette under the blurred wash before the wash exits.
   */
  const NORMAL = {
    duration: 3000,
    commit: 1920,
    revealStart: 0.04,
    revealEnd: 0.72,
  };
  const REDUCED = {
    duration: 480,
    commit: 220,
    revealStart: 0,
    revealEnd: 0.2,
  };

  /** Width of the soft ignition band in normalized ripple distance. */
  const WAVE_SOFT = 0.072;
  /** Working-size cap keeps the per-frame pixel pass stable on large screens. */
  const MAX_WORK = 1080;

  let active = false;
  let overlay = null;
  let canvas = null;
  let ctx = null;
  let raf = 0;
  let timers = [];

  /** @type {Record<string, HTMLImageElement>} */
  const images = {};
  /** @type {Record<string, FrameField | null>} */
  const fields = { luna: null, sol: null };

  let outBuffer = null;
  let outW = 0;
  let outH = 0;

  /**
   * @typedef {{
   *   key: string,
   *   mode: "luna"|"sol",
   *   w: number,
   *   h: number,
   *   src: Uint8ClampedArray,
   *   pixels: Uint32Array,
   *   strength: Float32Array,
   *   distance: Float32Array,
   *   phase: Float32Array,
   * }} FrameField
   */

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  function smoothstep(edge0, edge1, value) {
    const t = clamp01((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  Promise.all([loadImage(ASSETS.luna), loadImage(ASSETS.sol)])
    .then(([luna, sol]) => {
      images.luna = luna;
      images.sol = sol;
    })
    .catch((error) => console.warn("Theme art preload failed.", error));

  /**
   * Convert the source paper into transparency while preserving the artwork's
   * own halftone pixels. Luna is light ink on black; Sol is coloured ink on a
   * warm-white sheet.
   */
  function getInkStrength(mode, r, g, b) {
    if (mode === "luna") {
      const light = Math.max(r, g, b);
      return smoothstep(5, 48, light);
    }

    const paper = 248;
    const separation = Math.max(Math.abs(paper - r), Math.abs(paper - g), Math.abs(paper - b));
    return smoothstep(5, 46, separation);
  }

  /**
   * Cover-fit source art and cache only pixels that genuinely belong to it.
   * @param {HTMLImageElement} img
   * @param {"luna"|"sol"} mode
   * @param {number} viewW
   * @param {number} viewH
   * @returns {FrameField}
   */
  function buildField(img, mode, viewW, viewH) {
    const scale = Math.min(1, MAX_WORK / Math.max(viewW, viewH));
    const w = Math.max(2, Math.round(viewW * scale));
    const h = Math.max(2, Math.round(viewH * scale));

    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const octx = off.getContext("2d", { willReadFrequently: true });
    if (!octx) throw new Error("2d context unavailable");

    const imageRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = w / h;
    let drawWidth;
    let drawHeight;
    let drawX;
    let drawY;

    if (imageRatio > canvasRatio) {
      drawHeight = h;
      drawWidth = h * imageRatio;
      drawX = (w - drawWidth) / 2;
      drawY = 0;
    } else {
      drawWidth = w;
      drawHeight = w / imageRatio;
      drawX = 0;
      drawY = (h - drawHeight) / 2;
    }

    octx.clearRect(0, 0, w, h);
    octx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    const { data } = octx.getImageData(0, 0, w, h);
    const activePixels = [];
    const strengths = [];
    const distances = [];
    const phases = [];
    const aspect = w / h;
    const maxRadius = Math.hypot(aspect, 1);
    const invW = w > 1 ? 1 / (w - 1) : 1;
    const invH = h > 1 ? 1 / (h - 1) : 1;

    for (let pixel = 0; pixel < w * h; pixel += 1) {
      const sourceIndex = pixel * 4;
      const strength = getInkStrength(mode, data[sourceIndex], data[sourceIndex + 1], data[sourceIndex + 2]);
      if (strength < 0.012) continue;

      const x = pixel % w;
      const y = (pixel / w) | 0;
      const nx = x * invW;
      const ny = y * invH;

      // A true ripple expanding from the lower-left, with a very slight
      // contour variation so the artwork grows organically rather than being
      // cut by a geometric diagonal.
      const radius = Math.hypot(nx * aspect, 1 - ny) / maxRadius;
      const contour =
        Math.sin(nx * 17.3 + ny * 11.7) * 0.006 +
        Math.sin(nx * 31.1 - ny * 23.9) * 0.0035;
      const hash = ((x * 73856093) ^ (y * 19349663)) >>> 0;

      activePixels.push(pixel);
      strengths.push(strength);
      distances.push(clamp01(radius + contour));
      phases.push((hash % 2048) / 2048);
    }

    return {
      key: `${mode}:${w}x${h}`,
      mode,
      w,
      h,
      src: new Uint8ClampedArray(data),
      pixels: new Uint32Array(activePixels),
      strength: new Float32Array(strengths),
      distance: new Float32Array(distances),
      phase: new Float32Array(phases),
    };
  }

  function ensureOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.className = "theme-transition";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="theme-transition__blur"></div>
      <div class="theme-transition__wash theme-transition__wash--from"></div>
      <div class="theme-transition__wash theme-transition__wash--to"></div>
      <canvas class="theme-transition__canvas"></canvas>
    `;
    canvas = overlay.querySelector(".theme-transition__canvas");
    ctx = canvas.getContext("2d", { alpha: true });
    document.body.append(overlay);
    return overlay;
  }

  function clearTimers() {
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function commitTheme(targetTheme, button) {
    const isDark = targetTheme === "dark";
    document.body.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = targetTheme;

    try {
      localStorage.setItem("la-visual-theme", targetTheme);
    } catch (error) {
      console.warn("Theme preference could not be saved.", error);
    }

    button?.setAttribute("aria-pressed", String(isDark));

    if (typeof window.updateThemeIcon === "function") {
      window.updateThemeIcon();
    }
    if (typeof window.drawTransformCanvas === "function") {
      window.drawTransformCanvas();
    }

    window.dispatchEvent(
      new CustomEvent("la-themechange", {
        detail: { theme: targetTheme },
      }),
    );

    requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
  }

  function finish(button) {
    clearTimers();
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (overlay) {
      overlay.classList.remove("is-active");
      overlay.removeAttribute("data-mode");
    }
    document.body.classList.remove("theme-transitioning");
    button?.removeAttribute("aria-busy");
    if (button) button.disabled = false;
    active = false;
  }

  function waveProgress(t, timing) {
    if (t <= timing.revealStart) return 0;
    if (t >= timing.revealEnd) return 1 + WAVE_SOFT;
    const u = (t - timing.revealStart) / (timing.revealEnd - timing.revealStart);
    return u * u * (3 - 2 * u);
  }

  /**
   * Reveal only source-art pixels. Pixels at the ripple front briefly lift in
   * luminance, then settle back to their original colour.
   * @param {FrameField} field
   * @param {number} progress
   * @param {number} timeSec
   */
  function paintField(field, progress, timeSec) {
    if (!ctx || !canvas) return;

    const { w, h, src, pixels, strength, distance, phase, mode } = field;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    if (!outBuffer || outW !== w || outH !== h) {
      outBuffer = ctx.createImageData(w, h);
      outW = w;
      outH = h;
    } else {
      outBuffer.data.fill(0);
    }

    const out = outBuffer.data;
    const leadingEdge = WAVE_SOFT * 0.68;
    const trailingEdge = WAVE_SOFT * 0.9;

    for (let index = 0; index < pixels.length; index += 1) {
      const behind = progress - distance[index];
      if (behind < -leadingEdge) continue;

      const reveal = smoothstep(-leadingEdge, trailingEdge, behind);
      if (reveal <= 0) continue;

      const front = Math.exp(-((behind / (WAVE_SOFT * 0.62)) ** 2));
      const shimmer = 0.82 + 0.18 * Math.sin(timeSec * 8.5 + phase[index] * Math.PI * 2);
      const glow = front * shimmer;
      const pixel = pixels[index];
      const sourceIndex = pixel * 4;
      let r = src[sourceIndex];
      let g = src[sourceIndex + 1];
      let b = src[sourceIndex + 2];

      if (mode === "luna") {
        // The source uses luminance to describe lunar density. Encode that
        // density in alpha, then return every surviving dot to a cool silver
        // so faint source greys never read as black ink on the light page.
        r = 204 + strength[index] * 38;
        g = 216 + strength[index] * 35;
        b = 224 + strength[index] * 31;
        r += (238 - r) * glow * 0.48;
        g += (248 - g) * glow * 0.54;
        b += (255 - b) * glow * 0.62;
      } else {
        r += (255 - r) * glow * 0.24;
        g += (246 - g) * glow * 0.2;
        b += (196 - b) * glow * 0.08;
      }

      const alpha = Math.min(1, strength[index] * (reveal + glow * 0.32));
      out[sourceIndex] = Math.min(255, Math.round(r));
      out[sourceIndex + 1] = Math.min(255, Math.round(g));
      out[sourceIndex + 2] = Math.min(255, Math.round(b));
      out[sourceIndex + 3] = Math.round(alpha * 255);
    }

    ctx.putImageData(outBuffer, 0, 0);
  }

  function playTransition(button) {
    if (active) return;
    active = true;

    const goingDark = !document.body.classList.contains("dark");
    const targetTheme = goingDark ? "dark" : "light";
    const mode = goingDark ? "luna" : "sol";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timing = reduced ? REDUCED : NORMAL;
    const root = ensureOverlay();

    clearTimers();
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    document.body.classList.add("theme-transitioning");
    root.dataset.mode = mode;

    const viewW = window.innerWidth || 1440;
    const viewH = window.innerHeight || 900;

    const run = (img) => {
      let field = null;
      if (!reduced) {
        const scale = Math.min(1, MAX_WORK / Math.max(viewW, viewH));
        const workW = Math.max(2, Math.round(viewW * scale));
        const workH = Math.max(2, Math.round(viewH * scale));
        const cacheKey = `${mode}:${workW}x${workH}`;

        field = fields[mode];
        if (!field || field.key !== cacheKey) {
          field = buildField(img, mode, viewW, viewH);
          fields[mode] = field;
        }
      }

      root.classList.remove("is-active");
      void root.offsetWidth;
      root.classList.add("is-active");

      if (field) {
        const startedAt = performance.now();
        const tick = (now) => {
          const elapsed = now - startedAt;
          const t = Math.min(1, elapsed / timing.duration);
          const complete = t >= timing.revealEnd;
          paintField(field, waveProgress(t, timing), elapsed / 1000);
          if (!complete) {
            raf = requestAnimationFrame(tick);
          } else {
            raf = 0;
          }
        };

        raf = requestAnimationFrame(tick);
      }
      timers.push(window.setTimeout(() => commitTheme(targetTheme, button), timing.commit));
      timers.push(window.setTimeout(() => finish(button), timing.duration + 80));
    };

    const ready = images[mode]
      ? Promise.resolve(images[mode])
      : loadImage(ASSETS[mode]).then((img) => {
          images[mode] = img;
          return img;
        });

    ready
      .then(run)
      .catch((error) => {
        console.warn("Theme transition art failed.", error);
        commitTheme(targetTheme, button);
        finish(button);
      });
  }

  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest?.("#themeToggle");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      if (!active) playTransition(button);
    },
    true,
  );
})();
