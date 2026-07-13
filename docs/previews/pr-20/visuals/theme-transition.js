(() => {
  const ASSETS = {
    luna: "./assets/theme/luna.webp",
    sol: "./assets/theme/sol.webp",
  };

  /**
   * Timeline (ms):
   * - luminance morph runs for nearly the whole duration (true continuous mix)
   * - body.dark class only applied at the end, after vars already match target
   * - no mid-animation palette snap
   */
  const NORMAL = {
    duration: 2800,
    /** Luminance morph spans almost the full beat; class commit only at morphEnd */
    morphStart: 0.06,
    morphEnd: 0.84,
  };
  const REDUCED = {
    duration: 420,
    morphStart: 0.08,
    morphEnd: 0.8,
  };

  /**
   * Live site palettes from styles.css warm override (:root + body.dark).
   * Must match exactly so end-of-morph class commit is luminance-invisible.
   */
  const LIGHT = {
    "--bg": [244, 241, 232, 1],
    "--surface": [255, 255, 255, 0.7],
    "--surface-solid": [255, 255, 255, 0.86],
    "--surface-soft": [232, 245, 240, 0.72],
    "--text": [7, 21, 18, 1],
    "--muted": [95, 105, 101, 1],
    "--faint": [154, 162, 156, 1],
    "--line": [21, 52, 45, 0.12],
    "--line-strong": [21, 52, 45, 0.22],
    "--accent": [7, 139, 126, 1],
    "--accent-strong": [0, 111, 101, 1],
    "--accent-soft": [7, 139, 126, 0.12],
    "--shadow-rgb": [54, 65, 50, 0.14],
  };

  const DARK = {
    "--bg": [16, 23, 20, 1],
    "--surface": [18, 29, 26, 0.72],
    "--surface-solid": [20, 31, 28, 0.9],
    "--surface-soft": [16, 49, 43, 0.58],
    "--text": [240, 246, 239, 1],
    "--muted": [186, 198, 191, 1],
    "--faint": [135, 146, 140, 1],
    "--line": [230, 242, 235, 0.13],
    "--line-strong": [230, 242, 235, 0.24],
    "--accent": [7, 139, 126, 1],
    "--accent-strong": [0, 111, 101, 1],
    "--accent-soft": [7, 139, 126, 0.12],
    "--shadow-rgb": [0, 0, 0, 0.36],
  };

  const TOKEN_KEYS = Object.keys(LIGHT);

  let active = false;
  let overlay = null;
  let art = null;
  let timers = [];
  let morphRaf = 0;

  /** @type {Record<string, HTMLImageElement>} */
  const images = {};

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  function smoothstep(edge0, edge1, value) {
    const t = clamp01((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  }

  /** Smooth continuous ease — no flat holds that read as jumps */
  function smootherstep(t) {
    const x = clamp01(t);
    return x * x * x * (x * (x * 6 - 15) + 10);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function mixChannel(from, to, t) {
    return [
      Math.round(lerp(from[0], to[0], t)),
      Math.round(lerp(from[1], to[1], t)),
      Math.round(lerp(from[2], to[2], t)),
      lerp(from[3], to[3], t),
    ];
  }

  function cssColor(channels) {
    const [r, g, b, a] = channels;
    if (a >= 0.999) return `rgb(${r}, ${g}, ${b})`;
    return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(4))})`;
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

  /**
   * Knock out source paper once so reveal can stay transparent without a
   * per-frame pixel loop.
   */
  function prepareImage(img, mode) {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return Promise.reject(new Error("2d context unavailable"));

    context.drawImage(img, 0, 0);
    const frame = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = frame;

    for (let index = 0; index < data.length; index += 4) {
      let strength;
      if (mode === "luna") {
        strength = smoothstep(5, 48, Math.max(data[index], data[index + 1], data[index + 2]));
        data[index] = 204 + strength * 38;
        data[index + 1] = 216 + strength * 35;
        data[index + 2] = 224 + strength * 31;
      } else {
        const paper = 248;
        const separation = Math.max(
          Math.abs(paper - data[index]),
          Math.abs(paper - data[index + 1]),
          Math.abs(paper - data[index + 2]),
        );
        strength = smoothstep(5, 46, separation);
      }
      data[index + 3] = Math.round(strength * 255);
    }

    context.putImageData(frame, 0, 0);
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Transparent theme art could not be encoded"));
            return;
          }
          const prepared = new Image();
          prepared.decoding = "async";
          prepared.onload = () => resolve(prepared);
          prepared.onerror = reject;
          prepared.src = URL.createObjectURL(blob);
        },
        "image/webp",
        0.94,
      );
    });
  }

  function prepareWhenIdle(img, mode) {
    return new Promise((resolve, reject) => {
      const prepare = () => prepareImage(img, mode).then(resolve, reject);
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(prepare, { timeout: 1200 });
      } else {
        window.setTimeout(prepare, 0);
      }
    });
  }

  const preparations = {
    luna: loadImage(ASSETS.luna).then((img) => prepareWhenIdle(img, "luna")),
    sol: loadImage(ASSETS.sol).then((img) => prepareWhenIdle(img, "sol")),
  };

  Promise.all([preparations.luna, preparations.sol])
    .then(([luna, sol]) => {
      images.luna = luna;
      images.sol = sol;
    })
    .catch((error) => console.warn("Theme art preload failed.", error));

  function ensureOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.className = "theme-transition";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="theme-transition__blur"></div>
      <div class="theme-transition__wash theme-transition__wash--from"></div>
      <div class="theme-transition__wash theme-transition__wash--to"></div>
      <img class="theme-transition__art" alt="" draggable="false" />
    `;
    art = overlay.querySelector(".theme-transition__art");
    document.body.append(overlay);
    return overlay;
  }

  function clearTimers() {
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
    if (morphRaf) {
      cancelAnimationFrame(morphRaf);
      morphRaf = 0;
    }
  }

  function clearInlineTokens() {
    TOKEN_KEYS.forEach((key) => {
      document.body.style.removeProperty(key);
    });
    document.body.style.removeProperty("--shadow");
    document.body.style.removeProperty("--shadow-soft");
    document.body.style.removeProperty("--theme-mix");
    // Do NOT clear --theme-tx-page-veil here — finalize runs mid-exit and
    // must keep driving the cream atmosphere until teardown.
    document.documentElement.style.removeProperty("color-scheme");
  }

  /**
   * body::before atmosphere opacity over the full 0–1 timeline.
   * Must restore to 1 before teardown — hard 0→1 was the green→cream end jump
   * (green page radials without the cream veil, then veil snaps on).
   */
  function pageVeilForTimeline(globalT) {
    const t = clamp01(globalT);
    if (t < 0.1) {
      // Gentle dip only — keep cream present so green radials never dominate
      return lerp(1, 0.42, smootherstep(t / 0.1));
    }
    if (t < 0.68) {
      return 0.42;
    }
    // Restore fully in the exit window (alongside blur clear)
    return lerp(0.42, 1, smootherstep((t - 0.68) / 0.3));
  }

  /**
   * Continuously write interpolated theme tokens onto body.
   * t=0 → from palette, t=1 → to palette. No discrete class flip mid-way.
   */
  function applyMix(from, to, t) {
    const mix = smootherstep(t);
    document.body.style.setProperty("--theme-mix", String(mix));

    TOKEN_KEYS.forEach((key) => {
      if (key === "--shadow-rgb") return;
      const color = mixChannel(from[key], to[key], mix);
      document.body.style.setProperty(key, cssColor(color));
    });

    // Shadows are multi-value; rebuild from mixed RGB
    const shadow = mixChannel(from["--shadow-rgb"], to["--shadow-rgb"], mix);
    const softA = lerp(0.1, 0.24, mix);
    document.body.style.setProperty(
      "--shadow",
      `0 26px 70px rgba(${shadow[0]}, ${shadow[1]}, ${shadow[2]}, ${shadow[3].toFixed(3)})`,
    );
    document.body.style.setProperty(
      "--shadow-soft",
      `0 18px 42px rgba(${shadow[0]}, ${shadow[1]}, ${shadow[2]}, ${softA.toFixed(3)})`,
    );
  }

  function applyPageVeil(globalT) {
    document.body.style.setProperty("--theme-tx-page-veil", String(pageVeilForTimeline(globalT)));
  }

  function finalizeTheme(targetTheme, button) {
    const isDark = targetTheme === "dark";
    // Class matches the already-lerped tokens, then drop overrides
    document.body.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = targetTheme;
    clearInlineTokens();
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

  function teardownOverlay(button) {
    // Veil must already be 1 so removing theme-transitioning cannot flash green
    document.body.style.setProperty("--theme-tx-page-veil", "1");
    if (overlay) {
      overlay.classList.remove("is-active");
      overlay.removeAttribute("data-mode");
    }
    document.body.classList.remove("theme-transitioning");
    document.body.style.removeProperty("--theme-tx-page-veil");
    button?.removeAttribute("aria-busy");
    if (button) button.disabled = false;
    active = false;
  }

  function startLuminanceMorph(from, to, timing, targetTheme, button) {
    const t0 = performance.now();
    const span = Math.max(1, timing.duration * (timing.morphEnd - timing.morphStart));
    const delay = timing.duration * timing.morphStart;
    let finalized = false;

    // Pin start palette + full page veil (no green flash on entry)
    applyMix(from, to, 0);
    applyPageVeil(0);

    const tick = (now) => {
      const elapsed = now - t0;
      const globalT = clamp01(elapsed / timing.duration);
      applyPageVeil(globalT);

      if (elapsed < delay) {
        applyMix(from, to, 0);
        morphRaf = requestAnimationFrame(tick);
        return;
      }

      const local = clamp01((elapsed - delay) / span);
      applyMix(from, to, local);

      // Scrollbars / native controls track the late half of the morph
      if (local > 0.55) {
        document.documentElement.style.colorScheme = targetTheme;
      }

      // Finalize under blur+art, while veil is still mid — content swap of
      // body::before is masked; veil then restores to 1 before teardown.
      if (local >= 1 && !finalized) {
        finalized = true;
        finalizeTheme(targetTheme, button);
      }

      if (globalT < 1) {
        morphRaf = requestAnimationFrame(tick);
        return;
      }

      morphRaf = 0;
      applyPageVeil(1);
      if (!finalized) {
        finalized = true;
        finalizeTheme(targetTheme, button);
      }
    };

    morphRaf = requestAnimationFrame(tick);
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
    const from = goingDark ? LIGHT : DARK;
    const to = goingDark ? DARK : LIGHT;

    clearTimers();
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    document.body.classList.add("theme-transitioning");
    root.dataset.mode = mode;
    root.style.setProperty("--theme-tx-duration", `${timing.duration}ms`);

    const run = () => {
      root.classList.remove("is-active");
      void root.offsetWidth;
      root.classList.add("is-active");

      startLuminanceMorph(from, to, timing, targetTheme, button);

      // Overlay teardown only — palette already continuous via rAF morph
      timers.push(
        window.setTimeout(() => {
          const wantDark = targetTheme === "dark";
          if (document.body.classList.contains("dark") !== wantDark) {
            finalizeTheme(targetTheme, button);
          } else {
            clearInlineTokens();
            document.documentElement.style.colorScheme = targetTheme;
          }
          teardownOverlay(button);
          clearTimers();
        }, timing.duration + 100),
      );
    };

    if (reduced) {
      run();
      return;
    }

    const ready = images[mode]
      ? Promise.resolve(images[mode])
      : preparations[mode].then((img) => {
          images[mode] = img;
          return img;
        });

    ready
      .then((img) => {
        art.src = img.src;
        return art.decode?.();
      })
      .then(run)
      .catch((error) => {
        console.warn("Theme transition art failed.", error);
        finalizeTheme(targetTheme, button);
        teardownOverlay(button);
        clearTimers();
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
