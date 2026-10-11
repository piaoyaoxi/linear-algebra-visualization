/*
 * Shared motion for the design language (docs/design-spec.md §7):
 * - press spring: anything pressable shrinks a little on press and springs back
 *   with a small overshoot on release (Web Animations on `scale`, so it never
 *   fights an element's own `transform`);
 * - press light on primary buttons;
 * - pointer light on the floating controls (material.css reads --lg-x / --lg-y);
 * - phones: scrolling down tucks the search capsule into the menu button,
 *   scrolling up brings it back (the Chrome / Edge mobile toolbar rule).
 */
(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outCubic = (t) => 1 - Math.pow(1 - t, 3);

  const SPRING = window.CSS?.supports?.("animation-timing-function", "linear(0, 1)")
    ? getComputedStyle(document.documentElement).getPropertyValue("--spring-release").trim() || "ease-out"
    : "cubic-bezier(0.34, 1.3, 0.64, 1)";

  /* ---------- press spring ---------- */

  const PRESSABLE = 'button, [role="button"], a.button, .home-cta, .home-card, .lesson-card, .lesson-neighbor-card';
  const BLOOM = ".is-primary, .button.primary, .home-cta";
  let pressed = null;

  const isDisabled = (el) => el.disabled || el.getAttribute("aria-disabled") === "true" || el.closest("[data-no-press]");
  const currentScale = (el) => {
    const value = getComputedStyle(el).scale;
    return value && value !== "none" ? parseFloat(value) : 1;
  };
  // About 4px of give whatever the size: small buttons dip more, wide cards barely.
  const pressScale = (el) => {
    const r = el.getBoundingClientRect();
    return 1 - clamp(4 / Math.max(r.width, r.height, 1), 0.015, 0.06);
  };

  function press(el) {
    if (pressed && pressed !== el) release();
    pressed = el;
    const from = currentScale(el);
    el.__laPress?.cancel();
    el.__laPress = el.animate([{ scale: String(from) }, { scale: String(pressScale(el)) }], {
      duration: 90,
      easing: "cubic-bezier(0.3, 0, 0.5, 1)",
      fill: "forwards",
    });
  }

  function release() {
    const el = pressed;
    pressed = null;
    if (!el) return;
    const from = currentScale(el);
    el.__laPress?.cancel();
    el.__laPress = el.animate([{ scale: String(from) }, { scale: "1" }], { duration: 650, easing: SPRING });
  }

  function bloom(el, x, y) {
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    let layer = el.querySelector(":scope > .la-bloom");
    if (!layer) {
      layer = document.createElement("span");
      layer.className = "la-bloom";
      layer.setAttribute("aria-hidden", "true");
      el.prepend(layer);
    }
    const r = el.getBoundingClientRect();
    const dot = document.createElement("i");
    dot.style.left = `${x - r.left}px`;
    dot.style.top = `${y - r.top}px`;
    layer.append(dot);
    const grow = Math.max(r.width, r.height) / 5;
    dot
      .animate([{ transform: "scale(1)", opacity: 0.9 }, { transform: `scale(${grow})`, opacity: 0 }], {
        duration: 700,
        easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      })
      .finished.then(() => dot.remove(), () => dot.remove());
  }

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (reduced.matches || event.button !== 0) return;
      const el = event.target.closest?.(PRESSABLE);
      if (!el || isDisabled(el)) return;
      press(el);
      if (el.matches(BLOOM)) bloom(el, event.clientX, event.clientY);
    },
    { passive: true },
  );
  window.addEventListener("pointerup", release, { passive: true });
  window.addEventListener("pointercancel", release, { passive: true });
  window.addEventListener("blur", release);
  document.addEventListener("keydown", (event) => {
    if (reduced.matches || event.repeat || (event.key !== " " && event.key !== "Enter")) return;
    const el = event.target.closest?.(PRESSABLE);
    if (el && !isDisabled(el)) press(el);
  });
  document.addEventListener("keyup", (event) => {
    if (event.key === " " || event.key === "Enter") release();
  });

  /* ---------- pointer light ---------- */

  const LIT = ".topbar .icon-button, .topbar-search, .home-card";
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  let litFrame = 0;
  document.addEventListener(
    "pointermove",
    (event) => {
      if (!fine.matches || litFrame) return;
      const el = event.target.closest?.(LIT);
      if (!el) return;
      const { clientX, clientY } = event;
      litFrame = requestAnimationFrame(() => {
        litFrame = 0;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--lg-x", `${(clientX - r.left).toFixed(1)}px`);
        el.style.setProperty("--lg-y", `${(clientY - r.top).toFixed(1)}px`);
      });
    },
    { passive: true },
  );

  /* ---------- phones: the search capsule tucks into the menu button ---------- */

  const stage = document.getElementById("searchCapsule");
  const menu = document.getElementById("sidebarToggle");
  const openButton = document.getElementById("searchOpen");
  if (!stage || !menu || !openButton) return;

  const phone = window.matchMedia("(max-width: 720px)");
  const body = document.body;

  // duration 0.75 s, bounce 0.2 (same parametrisation as the CSS springs)
  const spring = { x: 0, v: 0, t: 0, k: (2 * Math.PI / 0.75) ** 2, c: (4 * Math.PI * 0.8) / 0.75 };
  let running = false;
  let last = 0;
  let home = null;
  const STYLE_KEYS = ["position", "left", "top", "width", "height", "transform", "opacity"];

  function clearStage() {
    STYLE_KEYS.forEach((key) => stage.style.removeProperty(key));
    openButton.style.removeProperty("--search-closed-content-opacity");
    openButton.querySelectorAll(":scope > svg, :scope > .topbar-search-text").forEach((el) => el.style.removeProperty("filter"));
    home = null;
  }

  function measure() {
    STYLE_KEYS.forEach((key) => stage.style.removeProperty(key));
    const r = stage.getBoundingClientRect();
    home = { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  // m = 0 at rest, 1 tucked. The capsule shortens from the right while it
  // drifts left, ends as a small drop and shrinks away under the menu button.
  function render() {
    const m = spring.x;
    if (m === 0 && spring.t === 0) {
      clearStage();
      return;
    }
    if (!home) measure();
    const R = home.height / 2;
    const mr = menu.getBoundingClientRect();
    const x1 = mr.left + mr.width / 2;
    const a0 = home.left + R;
    const b0 = home.left + home.width - R;
    const t = clamp(m);
    const k = outCubic(clamp(t / 0.62));
    let a = lerp(a0, x1, inOut(t));
    let r = lerp(R, R * 0.75, k);
    let b = a + (b0 - a0) * (1 - k);
    const f = clamp(1 - (a - x1) / (mr.width / 2 + r));
    if (f > 0) r *= Math.sqrt(1 - f);
    if (m < 0) b += (b0 - a0) * 1.1 * -m; // springing back out: a little long, then settle
    stage.style.position = "fixed";
    stage.style.transform = "none";
    stage.style.left = `${(a - r).toFixed(2)}px`;
    stage.style.top = `${(home.top + R - r).toFixed(2)}px`;
    stage.style.width = `${Math.max(0, b - a + 2 * r).toFixed(2)}px`;
    stage.style.height = `${Math.max(0, 2 * r).toFixed(2)}px`;
    stage.style.opacity = (1 - f).toFixed(3);
    const label = clamp(1 - m / 0.3);
    openButton.style.setProperty("--search-closed-content-opacity", label.toFixed(3));
    openButton.querySelectorAll(":scope > svg, :scope > .topbar-search-text").forEach((el) => {
      el.style.filter = label < 1 ? `blur(${((1 - label) * 6).toFixed(2)}px)` : "";
    });
  }

  function frame(now) {
    const dt = Math.min(1 / 30, (now - last) / 1000);
    last = now;
    const steps = Math.max(1, Math.ceil(dt * 240));
    for (let i = 0; i < steps; i += 1) {
      const a = -spring.k * (spring.x - spring.t) - spring.c * spring.v;
      spring.v += (a * dt) / steps;
      spring.x += (spring.v * dt) / steps;
    }
    const done = Math.abs(spring.x - spring.t) < 1e-4 && Math.abs(spring.v) < 1e-3;
    if (done) {
      spring.x = spring.t;
      spring.v = 0;
    }
    render();
    if (done) {
      running = false;
      return;
    }
    requestAnimationFrame(frame);
  }

  function tuckTo(target) {
    if (spring.t === target) return;
    spring.t = target;
    if (target) stage.setAttribute("inert", "");
    else stage.removeAttribute("inert");
    if (reduced.matches) {
      spring.x = target;
      spring.v = 0;
      render();
      return;
    }
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  let lastY = window.scrollY;
  let travel = 0;
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (!phone.matches || body.classList.contains("search-modal-open") || body.classList.contains("sidebar-open")) return;
      if (y < 30) {
        travel = 0;
        tuckTo(0);
        return;
      }
      if (dy * travel < 0) travel = 0;
      travel += dy;
      if (travel > 24) tuckTo(1);
      else if (travel < -16) tuckTo(0);
    },
    { passive: true },
  );

  const reset = () => {
    spring.t = 0;
    spring.x = 0;
    spring.v = 0;
    stage.removeAttribute("inert");
    clearStage();
  };
  phone.addEventListener?.("change", reset);
  window.addEventListener("resize", () => {
    home = null;
    if (spring.x !== 0 || spring.t !== 0) render();
  });
})();
