(() => {
  const ASSETS = {
    luna: "./assets/theme/luna.webp",
    sol: "./assets/theme/sol.webp",
  };

  const NORMAL = {
    duration: 2600,
    commit: 1760,
  };
  const REDUCED = {
    duration: 420,
    commit: 180,
  };

  let active = false;
  let overlay = null;
  let art = null;
  let timers = [];

  /** @type {Record<string, HTMLImageElement>} */
  const images = {};

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

  /**
   * Remove the source paper once, before interaction. Theme switches can then
   * animate a genuinely transparent image without a per-frame pixel pass or
   * full-screen blend mode.
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
    const mode = goingDark ? "luna" : "sol";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timing = reduced ? REDUCED : NORMAL;
    const root = ensureOverlay();

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

      timers.push(window.setTimeout(() => commitTheme(targetTheme, button), timing.commit));
      timers.push(window.setTimeout(() => finish(button), timing.duration + 80));
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
