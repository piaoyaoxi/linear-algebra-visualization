(() => {
  const ASSETS = {
    luna: "./assets/theme/luna.webp",
    sol: "./assets/theme/sol.webp",
  };

  /** Total duration matches CSS --theme-tx-duration */
  const NORMAL = {
    duration: 1100,
    /** Commit mid-hold (~44%): art fully in, page still blurred underneath */
    commit: 480,
  };
  const REDUCED = {
    duration: 280,
    commit: 130,
  };

  let active = false;
  let overlay = null;
  let image = null;
  let timers = [];

  // Decode both artworks early so the first toggle never flashes empty.
  Object.values(ASSETS).forEach((src) => {
    const preload = new Image();
    preload.decoding = "async";
    preload.src = src;
  });

  function ensureOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.className = "theme-transition";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="theme-transition__blur"></div>
      <div class="theme-transition__veil"></div>
      <div class="theme-transition__atmosphere"></div>
      <div class="theme-transition__stage">
        <img class="theme-transition__image" alt="" draggable="false" decoding="async" />
      </div>
    `;
    image = overlay.querySelector(".theme-transition__image");
    document.body.append(overlay);
    return overlay;
  }

  function clearTimers() {
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
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
    } else if (button) {
      // Fallback: app.js exposes updateThemeIcon as a free function in non-module scope
    }

    if (typeof window.drawTransformCanvas === "function") {
      window.drawTransformCanvas();
    }

    window.dispatchEvent(
      new CustomEvent("la-themechange", {
        detail: { theme: targetTheme },
      }),
    );

    // Let canvas labs / layout remeasure under the still-blurred overlay.
    requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
  }

  function finish(button) {
    clearTimers();
    overlay?.classList.remove("is-active");
    document.body.classList.remove("theme-transitioning");
    button?.removeAttribute("aria-busy");
    if (button) button.disabled = false;
    active = false;
  }

  function playTransition(button) {
    if (active) return;
    active = true;

    const goingDark = !document.body.classList.contains("dark");
    const targetTheme = goingDark ? "dark" : "light";
    // Luna escorts light → dark; Sol escorts dark → light
    const mode = goingDark ? "luna" : "sol";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timing = reduced ? REDUCED : NORMAL;
    const root = ensureOverlay();

    clearTimers();
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    document.body.classList.add("theme-transitioning");

    root.dataset.mode = mode;
    image.src = ASSETS[mode];
    // Decode before kicking animation when possible (avoids first-frame empty).
    if (typeof image.decode === "function") {
      image.decode().catch(() => {});
    }

    root.classList.remove("is-active");
    void root.offsetWidth;
    root.classList.add("is-active");

    timers.push(
      window.setTimeout(() => commitTheme(targetTheme, button), timing.commit),
    );
    timers.push(
      window.setTimeout(() => finish(button), timing.duration + 48),
    );
  }

  // Capture phase: intercept before app.js bubble toggle so we own the transition.
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
