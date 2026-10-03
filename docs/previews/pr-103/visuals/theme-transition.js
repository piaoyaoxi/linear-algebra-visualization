(() => {
  const ASSETS = {
    luna: "./assets/theme/luna-alpha.webp?v=21h",
    sol: "./assets/theme/sol-alpha.webp?v=21h",
  };

  /**
   * Timeline (full duration):
   * 0–morphEnd   continuous CSS-token luminance morph (无极)
   * ~morphEnd    body.dark commit (under full art + blur; veil still 0)
   * 68–100%      page veil 0→1 + blur/art fade (no green snap at teardown)
   */
  const NORMAL = {
    duration: 2800,
    morphStart: 0.06,
    /** Finalize class while art+blur still full and veil still off */
    morphEnd: 0.66,
    /** Start restoring body::before in the shared exit window */
    veilRestoreStart: 0.68,
  };
  const REDUCED = {
    duration: 420,
    morphStart: 0.08,
    morphEnd: 0.75,
    veilRestoreStart: 0.7,
  };

  /** Light palette: must match design-a.css :root (direction A “松烟”) */
  const LIGHT = {
    "--bg": [245, 242, 234, 1],
    "--bg-grid": [0, 0, 0, 0],
    "--surface": [251, 249, 244, 1],
    "--surface-solid": [251, 249, 244, 1],
    "--surface-soft": [240, 237, 227, 1],
    "--text": [29, 33, 30, 1],
    "--muted": [93, 98, 92, 1],
    "--faint": [143, 147, 139, 1],
    "--line": [225, 220, 207, 1],
    "--line-strong": [214, 209, 195, 1],
    "--accent": [44, 94, 74, 1],
    "--accent-strong": [31, 74, 57, 1],
    "--accent-soft": [231, 236, 227, 1],
    "--canvas-paper-top": [253, 252, 248, 1],
    "--canvas-paper-bottom": [253, 252, 248, 1],
    "--canvas-paper-glow": [0, 0, 0, 0],
    "--shadow-rgb": [54, 65, 50, 0.14],
  };

  /** Dark palette: must match design-a.css body.dark */
  const DARK = {
    "--bg": [19, 22, 20, 1],
    "--bg-grid": [0, 0, 0, 0],
    "--surface": [26, 29, 26, 1],
    "--surface-solid": [26, 29, 26, 1],
    "--surface-soft": [30, 34, 30, 1],
    "--text": [231, 229, 221, 1],
    "--muted": [166, 168, 159, 1],
    "--faint": [125, 129, 120, 1],
    "--line": [42, 46, 42, 1],
    "--line-strong": [58, 63, 58, 1],
    "--accent": [147, 194, 166, 1],
    "--accent-strong": [185, 217, 196, 1],
    "--accent-soft": [31, 42, 35, 1],
    "--canvas-paper-top": [22, 25, 22, 1],
    "--canvas-paper-bottom": [22, 25, 22, 1],
    "--canvas-paper-glow": [0, 0, 0, 0],
    "--shadow-rgb": [0, 0, 0, 0.42],
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
      img.fetchPriority = "high";
      img.onload = () => {
        if (typeof img.decode !== "function") {
          resolve(img);
          return;
        }
        img.decode().then(() => resolve(img), reject);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  const preparations = {
    luna: loadImage(ASSETS.luna),
    sol: loadImage(ASSETS.sol),
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
    // Keep --theme-tx-page-veil until teardown — finalize must not snap atmosphere
  }

  /**
   * body::before opacity over full timeline t∈[0,1].
   * Off during mid (so light/dark ::before content can swap under art+blur),
   * then continuous restore to 1 before teardown — eliminates green end jump.
   */
  function pageVeilForTimeline(globalT, timing) {
    const t = clamp01(globalT);
    const start = timing.veilRestoreStart;
    if (t <= 0.06) {
      // Soft dip at start so entry is not a hard cut either
      return lerp(1, 0, smootherstep(t / 0.06));
    }
    if (t < start) return 0;
    return smootherstep((t - start) / Math.max(0.001, 1 - start));
  }

  function setPageVeil(value) {
    document.body.style.setProperty("--theme-tx-page-veil", String(clamp01(value)));
  }

  function applyMix(from, to, t) {
    const mix = smootherstep(t);
    document.body.style.setProperty("--theme-mix", String(mix));

    TOKEN_KEYS.forEach((key) => {
      if (key === "--shadow-rgb") return;
      document.body.style.setProperty(key, cssColor(mixChannel(from[key], to[key], mix)));
    });

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

  function finalizeTheme(targetTheme, button) {
    const isDark = targetTheme === "dark";
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
    // Atmosphere already at 1 — removing the class cannot flash green radials
    setPageVeil(1);
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

  function startTimeline(from, to, timing, targetTheme, button) {
    const t0 = performance.now();
    const morphSpan = Math.max(1, timing.duration * (timing.morphEnd - timing.morphStart));
    const morphDelay = timing.duration * timing.morphStart;
    let finalized = false;

    applyMix(from, to, 0);
    setPageVeil(1);

    const tick = (now) => {
      const elapsed = now - t0;
      const globalT = clamp01(elapsed / timing.duration);

      // Continuous page atmosphere (the end-jump fix)
      setPageVeil(pageVeilForTimeline(globalT, timing));

      // Continuous theme tokens
      if (elapsed < morphDelay) {
        applyMix(from, to, 0);
      } else {
        const local = clamp01((elapsed - morphDelay) / morphSpan);
        applyMix(from, to, local);
        if (local > 0.55) {
          document.documentElement.style.colorScheme = targetTheme;
        }
        if (local >= 1 && !finalized) {
          finalized = true;
          // Class commit under art+blur while veil is still 0 — invisible
          finalizeTheme(targetTheme, button);
        }
      }

      if (globalT < 1) {
        morphRaf = requestAnimationFrame(tick);
        return;
      }

      morphRaf = 0;
      setPageVeil(1);
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
    window.dispatchEvent(new Event("la-themestart"));
    root.dataset.mode = mode;
    root.style.setProperty("--theme-tx-duration", `${timing.duration}ms`);
    setPageVeil(1);

    const run = () => {
      root.classList.remove("is-active");
      void root.offsetWidth;
      root.classList.add("is-active");

      startTimeline(from, to, timing, targetTheme, button);

      timers.push(
        window.setTimeout(() => {
          const wantDark = targetTheme === "dark";
          if (document.body.classList.contains("dark") !== wantDark) {
            finalizeTheme(targetTheme, button);
          } else {
            clearInlineTokens();
            document.documentElement.style.colorScheme = targetTheme;
          }
          // Guarantee veil is full before class removal
          setPageVeil(1);
          teardownOverlay(button);
          clearTimers();
        }, timing.duration + 80),
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
        setPageVeil(1);
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
