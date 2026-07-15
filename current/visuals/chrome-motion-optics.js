(() => {
  "use strict";

  /*
   * Liquid Glass optical calibration
   *
   * Chromium and WebKit do not agree on SVG backdrop-filter references. The
   * inline filter graph in learn.html is therefore retained, but its feImage
   * sources are replaced with self-contained data URIs at runtime. This avoids
   * the broken element-to-element feImage path that silently produced blur-only
   * glass in Chromium while preserving the reliable inline path for WebKit.
   */

  const DEFAULTS = Object.freeze({
    light: 0.86,
    refraction: 0.78,
    depth: 0.86,
    dispersion: 0.72,
    frost: 0.7,
    splay: 0.72,
  });

  const state = { ...DEFAULTS };
  const root = document.documentElement;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const round = (value, digits = 3) => Number(value.toFixed(digits));

  function svgDataUri(source) {
    return `data:image/svg+xml;base64,${btoa(source.replace(/\s{2,}/g, " ").trim())}`;
  }

  function createLensMap(axis, splay) {
    const outer = 0.1 + splay * 0.1;
    const inner = 0.28 + splay * 0.13;
    const x2 = axis === "x" ? "1" : "0";
    const y2 = axis === "x" ? "0" : "1";
    const color = (value) => (axis === "x" ? `rgb(${value},128,128)` : `rgb(128,${value},128)`);
    const stops = [
      [0, 24],
      [outer, 66],
      [inner, 116],
      [0.46, 126],
      [0.54, 130],
      [1 - inner, 140],
      [1 - outer, 190],
      [1, 232],
    ];
    const stopMarkup = stops
      .map(([offset, value]) => `<stop offset="${round(offset, 4)}" stop-color="${color(value)}"/>`)
      .join("");
    return svgDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="128" viewBox="0 0 256 128" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" y1="0" x2="${x2}" y2="${y2}">${stopMarkup}</linearGradient></defs><rect width="256" height="128" fill="url(#g)"/></svg>`,
    );
  }

  function setHref(element, value) {
    if (!element) return;
    element.setAttribute("href", value);
    element.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", value);
  }

  function patchLensImages(filter, lensX, lensY) {
    if (!filter) return false;
    const images = Array.from(filter.querySelectorAll("feImage"));
    images.forEach((image, index) => setHref(image, index % 2 === 0 ? lensX : lensY));
    return images.length >= 2;
  }

  function patchField(filter, scale) {
    if (!filter) return;

    /* A smooth deterministic normal field keeps mathematical text readable.
       The original turbulence branch is removed rather than merely multiplied
       by zero, avoiding needless filter work on every animated frame. */
    const fieldMix = filter.querySelector('[result="displacementField"]');
    if (fieldMix) {
      filter.querySelectorAll('feDisplacementMap[in2="displacementField"]').forEach((node) => {
        node.setAttribute("in2", "lensField");
      });
      filter.querySelector('[result="microNoise"]')?.remove();
      filter.querySelector('[result="microField"]')?.remove();
      fieldMix.remove();
    }

    filter.querySelectorAll("feDisplacementMap").forEach((node) => {
      node.setAttribute("scale", String(round(scale, 2)));
    });
  }

  function apply(next = {}) {
    for (const key of Object.keys(DEFAULTS)) {
      if (!Object.prototype.hasOwnProperty.call(next, key)) continue;
      const numeric = Number(next[key]);
      if (!Number.isFinite(numeric)) continue;
      const maximum = key === "frost" ? 8 : 1;
      state[key] = clamp(numeric, 0, maximum);
    }

    const lensX = createLensMap("x", state.splay);
    const lensY = createLensMap("y", state.splay);
    const depthFactor = 0.74 + state.depth * 0.3;
    const controlScale = -state.refraction * 14.7 * depthFactor;
    const panelScale = -state.refraction * 31 * depthFactor;
    const flowScale = state.refraction * 12 * depthFactor;

    const control = document.querySelector("#liquidGlassControl");
    const panel = document.querySelector("#liquidGlassPanel");
    const dispersion = document.querySelector("#liquidGlassDispersion");
    const flow = document.querySelector("#liquidGlassFlow");

    const controlReady = patchLensImages(control, lensX, lensY);
    const panelReady = patchLensImages(panel, lensX, lensY);
    const dispersionReady = patchLensImages(dispersion, lensX, lensY);
    patchField(control, controlScale);
    patchField(panel, panelScale);
    patchField(dispersion, controlScale);
    patchField(flow, flowScale);

    const spread = state.dispersion * 1.68;
    const rise = state.dispersion * 0.44;
    dispersion?.querySelector('feOffset[result="redShift"]')?.setAttribute("dx", String(round(spread, 2)));
    dispersion?.querySelector('feOffset[result="redShift"]')?.setAttribute("dy", String(round(rise, 2)));
    dispersion?.querySelector('feOffset[result="blueShift"]')?.setAttribute("dx", String(round(-spread, 2)));
    dispersion?.querySelector('feOffset[result="blueShift"]')?.setAttribute("dy", String(round(-rise, 2)));

    root.style.setProperty("--glass-frost", `${round(state.frost, 2)}px`);
    root.style.setProperty("--glass-rim-width", `${round(2.2 + state.splay * 2.2, 2)}px`);
    root.style.setProperty("--glass-panel-rim-width", `${round(5 + state.splay * 4, 2)}px`);
    root.style.setProperty("--glass-rim-opacity", String(round(0.58 + state.light * 0.32, 3)));
    root.style.setProperty("--glass-depth-factor", String(round(depthFactor, 3)));
    root.dataset.liquidOptics = controlReady && panelReady && dispersionReady ? "ready" : "fallback";

    window.dispatchEvent(new CustomEvent("la-liquidglasschange", { detail: { ...state } }));
    return { ...state };
  }

  window.liquidGlassOptics = {
    getSettings: () => ({ ...state }),
    setSettings: (next) => apply(next),
    reset: () => apply(DEFAULTS),
  };

  apply();
})();
