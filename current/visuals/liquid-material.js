(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const scriptSource = document.currentScript?.src || document.baseURI;
  const TARGET_SELECTOR = [
    ".icon-button:not(.language-trigger)",
    ".topbar-search",
    ".search-morph-proxy",
    ".liquid-panel",
    ".sidebar-liquid-bridge",
  ].join(",");

  const defaults = {
    light: 0.82,
    refraction: 0.92,
    depth: 0.88,
    dispersion: 0.76,
    frost: 2.4,
    splay: 0.78,
  };

  const variants = {
    compact: { alphaBlur: 4.1, baseScale: 48, dispersion: 7.2, micro: 1.25 },
    pill: { alphaBlur: 5.2, baseScale: 50, dispersion: 7.8, micro: 1.35 },
    menu: { alphaBlur: 7.2, baseScale: 58, dispersion: 8.8, micro: 1.45 },
    panel: { alphaBlur: 13.5, baseScale: 72, dispersion: 10.5, micro: 1.65 },
  };

  const settings = { ...defaults };
  let booted = false;
  let observer = null;

  function finite(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function fmt(value) {
    return Number(value.toFixed(3)).toString();
  }

  function installStylesheet() {
    if (document.querySelector('link[data-liquid-material="true"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("liquid-material.css?v=30c", scriptSource).href;
    link.dataset.liquidMaterial = "true";
    document.head.append(link);
  }

  function filterMarkup(name) {
    const variant = variants[name];
    const splay = 0.55 + settings.splay * 0.75;
    const alphaBlur = variant.alphaBlur * splay;
    const baseScale = variant.baseScale * settings.refraction;
    const spectral = variant.dispersion * settings.dispersion;
    const redScale = -(baseScale + spectral);
    const greenScale = -baseScale;
    const blueScale = -Math.max(0, baseScale - spectral);
    const microScale = variant.micro * settings.refraction;
    const frost = 0.32 + settings.frost * 0.1;
    const id = `liquidGlass${name[0].toUpperCase()}${name.slice(1)}`;

    return `
      <filter id="${id}" x="-24%" y="-24%" width="148%" height="148%" color-interpolation-filters="sRGB">
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 0 1"
          result="liquidHeight"
        />
        <feGaussianBlur in="liquidHeight" stdDeviation="${fmt(alphaBlur)}" result="liquidSlope" />
        <feConvolveMatrix
          in="liquidSlope"
          order="3"
          kernelMatrix="-1 0 1 -2 0 2 -1 0 1"
          divisor="4"
          bias="0.5"
          edgeMode="duplicate"
          preserveAlpha="false"
          result="liquidDx"
        />
        <feConvolveMatrix
          in="liquidSlope"
          order="3"
          kernelMatrix="-1 -2 -1 0 0 0 1 2 1"
          divisor="4"
          bias="0.5"
          edgeMode="duplicate"
          preserveAlpha="false"
          result="liquidDy"
        />
        <feColorMatrix
          in="liquidDx"
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1"
          result="liquidDxRed"
        />
        <feColorMatrix
          in="liquidDy"
          values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 0 1"
          result="liquidDyGreen"
        />
        <feComposite
          in="liquidDxRed"
          in2="liquidDyGreen"
          operator="arithmetic"
          k2="1"
          k3="1"
          result="liquidVector"
        />

        <feGaussianBlur in="SourceGraphic" stdDeviation="${fmt(frost)}" result="liquidFrosted" />
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.011 0.075"
          numOctaves="2"
          seed="17"
          result="liquidNoise"
        />
        <feDisplacementMap
          in="liquidFrosted"
          in2="liquidNoise"
          scale="${fmt(microScale)}"
          xChannelSelector="R"
          yChannelSelector="G"
          result="liquidFluid"
        />

        <feColorMatrix
          in="liquidFluid"
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="liquidRed"
        />
        <feColorMatrix
          in="liquidFluid"
          values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="liquidGreen"
        />
        <feColorMatrix
          in="liquidFluid"
          values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
          result="liquidBlue"
        />

        <feDisplacementMap
          in="liquidRed"
          in2="liquidVector"
          scale="${fmt(redScale)}"
          xChannelSelector="R"
          yChannelSelector="G"
          result="liquidRedBent"
        />
        <feDisplacementMap
          in="liquidGreen"
          in2="liquidVector"
          scale="${fmt(greenScale)}"
          xChannelSelector="R"
          yChannelSelector="G"
          result="liquidGreenBent"
        />
        <feDisplacementMap
          in="liquidBlue"
          in2="liquidVector"
          scale="${fmt(blueScale)}"
          xChannelSelector="R"
          yChannelSelector="G"
          result="liquidBlueBent"
        />

        <feBlend in="liquidRedBent" in2="liquidGreenBent" mode="screen" result="liquidRG" />
        <feBlend in="liquidRG" in2="liquidBlueBent" mode="screen" result="liquidRGB" />
        <feComposite in="liquidRGB" in2="SourceAlpha" operator="in" />
      </filter>`;
  }

  function installFilterDefinitions() {
    let svg = document.querySelector("#liquidOpticsDefs");
    if (!svg) {
      svg = document.createElementNS(SVG_NS, "svg");
      svg.id = "liquidOpticsDefs";
      svg.classList.add("liquid-optics-defs");
      svg.setAttribute("width", "0");
      svg.setAttribute("height", "0");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      document.body.prepend(svg);
    }

    svg.innerHTML = `<defs>${Object.keys(variants).map(filterMarkup).join("")}</defs>`;
  }

  function applyCssSettings() {
    const root = document.documentElement;
    root.style.setProperty("--glass-light", fmt(settings.light));
    root.style.setProperty("--glass-depth", fmt(settings.depth));
    root.style.setProperty("--glass-dispersion", fmt(settings.dispersion));
    root.style.setProperty("--glass-frost", `${fmt(settings.frost)}px`);
    root.style.setProperty("--glass-splay", fmt(settings.splay));
  }

  function variantFor(element) {
    if (element.classList.contains("sidebar-liquid-bridge")) return "bridge";
    if (element.classList.contains("language-menu")) return "menu";
    if (element.classList.contains("liquid-panel")) return "panel";
    if (element.classList.contains("topbar-search") || element.classList.contains("search-morph-proxy")) return "pill";
    return "compact";
  }

  function createMaterialStack() {
    const stack = document.createElement("span");
    stack.className = "liquid-material-stack";
    stack.setAttribute("aria-hidden", "true");
    stack.innerHTML = `
      <span class="liquid-material-refraction"></span>
      <span class="liquid-material-tint"></span>
      <span class="liquid-material-caustic"></span>
      <span class="liquid-material-rim"></span>`;
    return stack;
  }

  function ensureMaterial(element) {
    if (!(element instanceof Element) || !element.matches(TARGET_SELECTOR)) return;
    const variant = variantFor(element);
    element.dataset.liquidOptics = variant;
    const directStack = Array.from(element.children).find((child) => child.classList.contains("liquid-material-stack"));
    if (directStack) return;
    element.prepend(createMaterialStack());
  }

  function decorate(root) {
    if (root instanceof Element && root.matches(TARGET_SELECTOR)) ensureMaterial(root);
    root.querySelectorAll?.(TARGET_SELECTOR).forEach(ensureMaterial);
  }

  function observeMaterialHosts() {
    observer?.disconnect();
    observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.target instanceof Element && record.target.matches(TARGET_SELECTOR)) ensureMaterial(record.target);
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) decorate(node);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function boot() {
    if (booted || !document.body) return;
    booted = true;
    document.querySelector("#liquidEdgeRefraction")?.remove();
    installFilterDefinitions();
    applyCssSettings();
    decorate(document);
    observeMaterialHosts();
    document.documentElement.classList.add("liquid-optics-ready");
  }

  function scheduleBoot() {
    if (document.body) requestAnimationFrame(boot);
    else document.addEventListener("DOMContentLoaded", boot, { once: true });
  }

  function setSettings(next = {}) {
    settings.light = clamp(finite(next.light, settings.light), 0, 1.4);
    settings.refraction = clamp(finite(next.refraction, settings.refraction), 0, 1.6);
    settings.depth = clamp(finite(next.depth, settings.depth), 0, 1.5);
    settings.dispersion = clamp(finite(next.dispersion, settings.dispersion), 0, 1.6);
    settings.frost = clamp(finite(next.frost, settings.frost), 0, 12);
    settings.splay = clamp(finite(next.splay, settings.splay), 0, 1.5);
    if (document.body) {
      installFilterDefinitions();
      applyCssSettings();
    }
    return { ...settings };
  }

  installStylesheet();
  window.addEventListener("la-chromemotionready", scheduleBoot, { once: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 0), { once: true });
  else setTimeout(boot, 0);

  window.liquidGlassMaterial = {
    getSettings: () => ({ ...settings }),
    setSettings,
    refresh: () => decorate(document),
  };
})();
