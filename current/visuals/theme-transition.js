(() => {
  const ASSETS = {
    luna: "./assets/theme/luna.webp",
    sol: "./assets/theme/sol.webp",
  };

  /**
   * Timeline (ms) — slow enough to read the pixel wave.
   * 0–10%    real page blur rises (page still visible underneath)
   * 10–70%   image pixels light up along BL → TR wave
   * ~50%     theme commit under blur
   * 70–80%   hold full image
   * 80–100%  image + blur dissolve together
   */
  const NORMAL = {
    duration: 3400,
    commit: 1700,
    revealStart: 0.1,
    revealEnd: 0.7,
  };
  const REDUCED = {
    duration: 420,
    commit: 180,
    revealStart: 0.15,
    revealEnd: 0.55,
  };

  /** Soft width of the sparkle front (diagonal 0–1) */
  const WAVE_SOFT = 0.13;
  /** Max luminance boost on the wave-front pixels */
  const FRONT_BOOST = 2.1;
  /** Cap working resolution for stable frame times */
  const MAX_WORK = 1200;

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
   * }} FrameField
   */

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
   * Cover-fit source image into a working RGBA buffer.
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

    const ir = img.naturalWidth / img.naturalHeight;
    const cr = w / h;
    let dw;
    let dh;
    let dx;
    let dy;
    if (ir > cr) {
      dh = h;
      dw = h * ir;
      dx = (w - dw) / 2;
      dy = 0;
    } else {
      dw = w;
      dh = w / ir;
      dx = 0;
      dy = (h - dh) / 2;
    }

    // Match art paper so letterboxed cover edges never flash the wrong plate
    octx.fillStyle = mode === "luna" ? "#000000" : "#f7f7f7";
    octx.fillRect(0, 0, w, h);
    octx.drawImage(img, dx, dy, dw, dh);

    const { data } = octx.getImageData(0, 0, w, h);
    return {
      key: `${mode}:${w}x${h}`,
      mode,
      w,
      h,
      src: new Uint8ClampedArray(data),
    };
  }

  function ensureOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.className = "theme-transition";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="theme-transition__blur"></div>
      <div class="theme-transition__tint"></div>
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

  function easeOutCubic(t) {
    return 1 - (1 - t) ** 3;
  }

  function waveProgress(t, timing) {
    if (t <= timing.revealStart) return 0;
    if (t >= timing.revealEnd) return 1;
    const u = (t - timing.revealStart) / (timing.revealEnd - timing.revealStart);
    return easeOutCubic(u);
  }

  /**
   * Is this source pixel part of the stipple (can sparkle), vs pure paper/void?
   */
  function isStipple(mode, r, g, b) {
    if (mode === "luna") return Math.max(r, g, b) > 18;
    return Math.min(r, g, b) < 236;
  }

  /**
   * Paint full image pixels with a BL→TR wave; stipple pixels flash on the front.
   * Unrevealed region stays fully transparent so the real blurred page shows through.
   * @param {FrameField} field
   * @param {number} progress
   * @param {number} timeSec
   */
  function paintField(field, progress, timeSec) {
    if (!ctx || !canvas) return;

    const { w, h, src, mode } = field;
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
    const soft = WAVE_SOFT;
    const invSoft = 1 / soft;
    const invW = w > 1 ? 1 / (w - 1) : 1;
    const invH = h > 1 ? 1 / (h - 1) : 1;
    const total = w * h;

    for (let i = 0; i < total; i += 1) {
      const x = i % w;
      const y = (i / w) | 0;
      const nx = x * invW;
      const ny = y * invH;
      // 0 at bottom-left → 1 at top-right
      const dist = (nx + (1 - ny)) * 0.5;
      const behind = progress - dist;

      const si = i * 4;
      let r = src[si];
      let g = src[si + 1];
      let b = src[si + 2];
      const stipple = isStipple(mode, r, g, b);

      /*
       * Paper / void (non-stipple): hard reveal so the front is not a milky fog.
       * Stipple pixels (the image’s own dots): soft ignition + luminance twinkle.
       */
      let alpha;
      let boost = 1;

      if (!stipple) {
        if (behind < 0) continue;
        alpha = 1;
      } else if (behind < -soft) {
        continue;
      } else if (behind < 0) {
        // Leading edge: this pixel first lights up
        const u = (behind + soft) * invSoft;
        const spark = u * u * u;
        alpha = Math.min(1, spark * 1.15);
        const phase = ((x * 73856093) ^ (y * 19349663)) % 1000 / 1000;
        const tw = 0.45 + 0.55 * Math.sin(timeSec * 18 + phase * 14.0);
        boost = 1 + (FRONT_BOOST - 1) * spark * (0.5 + 0.5 * tw);
      } else if (behind < soft) {
        // Just crossed: settle flash → normal
        const u = behind * invSoft;
        const flash = (1 - u) * (1 - u);
        alpha = 1;
        const phase = ((x * 73856093) ^ (y * 19349663)) % 1000 / 1000;
        const tw = 0.6 + 0.4 * Math.sin(timeSec * 12 + phase * 7.0);
        boost = 1 + (FRONT_BOOST - 1) * flash * (0.55 + 0.45 * tw);
      } else {
        alpha = 1;
      }

      if (boost !== 1) {
        r = Math.min(255, r * boost);
        g = Math.min(255, g * boost);
        b = Math.min(255, b * boost);
      }

      out[si] = r;
      out[si + 1] = g;
      out[si + 2] = b;
      out[si + 3] = Math.round(alpha * 255);
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
      const scale = Math.min(1, MAX_WORK / Math.max(viewW, viewH));
      const workW = Math.max(2, Math.round(viewW * scale));
      const workH = Math.max(2, Math.round(viewH * scale));
      const cacheKey = `${mode}:${workW}x${workH}`;

      let field = fields[mode];
      if (!field || field.key !== cacheKey) {
        field = buildField(img, mode, viewW, viewH);
        fields[mode] = field;
      }

      root.classList.remove("is-active");
      void root.offsetWidth;
      root.classList.add("is-active");

      const t0 = performance.now();

      const tick = (now) => {
        const elapsed = now - t0;
        const t = Math.min(1, elapsed / timing.duration);
        paintField(field, waveProgress(t, timing), elapsed / 1000);
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          raf = 0;
        }
      };

      raf = requestAnimationFrame(tick);
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
