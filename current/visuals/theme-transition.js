(() => {
  const ASSETS = {
    luna: "./assets/theme/luna.webp",
    sol: "./assets/theme/sol.webp",
  };

  /** Matches CSS --theme-tx-duration */
  const NORMAL = {
    duration: 1700,
    /** Shell at target + wave past midpoint — hide real theme swap */
    commit: 780,
  };
  const REDUCED = {
    duration: 320,
    commit: 140,
  };

  let active = false;
  let overlay = null;
  let image = null;
  let timers = [];

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
      <div class="theme-transition__shell"></div>
      <div class="theme-transition__stage">
        <div class="theme-transition__art">
          <img class="theme-transition__image" alt="" draggable="false" decoding="async" />
          <div class="theme-transition__sheen"></div>
          <div class="theme-transition__sparks"></div>
        </div>
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
    if (overlay) {
      overlay.classList.remove("is-active");
      overlay.removeAttribute("data-mode");
    }
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
    // Luna: light → dark. Sol: dark → light. Reveal always BL → TR.
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

    const start = () => {
      root.classList.remove("is-active");
      void root.offsetWidth;
      root.classList.add("is-active");

      timers.push(window.setTimeout(() => commitTheme(targetTheme, button), timing.commit));
      timers.push(window.setTimeout(() => finish(button), timing.duration + 64));
    };

    if (typeof image.decode === "function") {
      image
        .decode()
        .catch(() => {})
        .finally(start);
    } else {
      start();
    }
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
