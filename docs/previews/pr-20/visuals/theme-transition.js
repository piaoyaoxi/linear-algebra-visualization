(() => {
  const ASSETS = {
    luna: "./assets/theme/luna.webp",
    sol: "./assets/theme/sol.webp",
  };
  const NORMAL_TIMING = { duration: 820, commit: 360, sharpen: 650 };
  const REDUCED_TIMING = { duration: 180, commit: 70, sharpen: 130 };
  const PARTICLE_COUNT = 20;

  let active = false;
  let overlay;
  let image;
  let particleLayer;
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
      <div class="theme-transition__backdrop"></div>
      <div class="theme-transition__visual">
        <img class="theme-transition__image" alt="" draggable="false" decoding="async" />
        <div class="theme-transition__particles"></div>
      </div>
    `;

    image = overlay.querySelector(".theme-transition__image");
    particleLayer = overlay.querySelector(".theme-transition__particles");
    document.body.append(overlay);
    return overlay;
  }

  function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function renderParticles(mode) {
    const random = seededRandom(mode === "luna" ? 20260712 : 20260713);
    const fragment = document.createDocumentFragment();
    particleLayer.replaceChildren();

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const particle = document.createElement("span");
      particle.className = "theme-transition__particle";

      const leftBias = mode === "luna" ? 0.16 : 0.14;
      const x = Math.round((leftBias + random() * 0.58) * 1000) / 10;
      const y = Math.round((0.08 + random() * 0.82) * 1000) / 10;
      const direction = mode === "luna" ? -1 : 1;
      const dx = Math.round((random() * 22 - 11) * direction);
      const dy = Math.round((random() * 24 - 12) * direction);
      const size = (1.2 + random() * 2.5).toFixed(2);
      const delay = Math.round(110 + random() * 210);

      particle.style.setProperty("--particle-x", `${x}vw`);
      particle.style.setProperty("--particle-y", `${y}vh`);
      particle.style.setProperty("--particle-dx", `${dx}px`);
      particle.style.setProperty("--particle-dy", `${dy}px`);
      particle.style.setProperty("--particle-size", `${size}px`);
      particle.style.setProperty("--particle-delay", `${delay}ms`);
      fragment.append(particle);
    }

    particleLayer.append(fragment);
  }

  function clearTimers() {
    timers.forEach((timer) => window.clearTimeout(timer));
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

    if (typeof window.updateThemeIcon === "function") window.updateThemeIcon();
    if (typeof window.drawTransformCanvas === "function") window.drawTransformCanvas();

    window.dispatchEvent(
      new CustomEvent("la-themechange", {
        detail: { theme: targetTheme },
      }),
    );

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

    const targetTheme = document.body.classList.contains("dark") ? "light" : "dark";
    const mode = targetTheme === "dark" ? "luna" : "sol";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timing = reducedMotion ? REDUCED_TIMING : NORMAL_TIMING;
    const root = ensureOverlay();
    const rect = button.getBoundingClientRect();

    clearTimers();
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    document.body.classList.add("theme-transitioning");

    root.dataset.mode = mode;
    root.style.setProperty("--theme-origin-x", `${rect.left + rect.width / 2}px`);
    root.style.setProperty("--theme-origin-y", `${rect.top + rect.height / 2}px`);
    image.src = ASSETS[mode];
    renderParticles(mode);

    root.classList.remove("is-active");
    void root.offsetWidth;
    root.classList.add("is-active");

    timers.push(window.setTimeout(() => commitTheme(targetTheme, button), timing.commit));
    timers.push(
      window.setTimeout(() => document.body.classList.remove("theme-transitioning"), timing.sharpen),
    );
    timers.push(window.setTimeout(() => finish(button), timing.duration + 40));
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
