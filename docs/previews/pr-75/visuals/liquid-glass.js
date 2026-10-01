/*
 * Liquid Glass behaviour for the learning-page chrome.
 * - Chromium: edge refraction for the top controls via an SVG displacement
 *   filter referenced from backdrop-filter. Other engines keep the CSS material.
 * - Pointer-following glare on the top controls.
 * - Scroll-edge fade under the floating controls once the page scrolls.
 */
(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const REFRACT_TARGETS = ".topbar .icon-button, .topbar-search";
  const GLARE_TARGETS = ".icon-button, .topbar-search";
  const root = document.documentElement;
  let defs = null;
  let filterCount = 0;

  function supportsRefraction() {
    const brands = navigator.userAgentData?.brands || [];
    const isChromium = brands.some((item) => /Chromium/i.test(item.brand));
    return isChromium && window.CSS?.supports?.("backdrop-filter", "url(#lg) blur(1px)");
  }

  function ensureDefs() {
    if (defs) return defs;
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
    defs = document.createElementNS(SVG_NS, "defs");
    svg.append(defs);
    document.body.append(svg);
    return defs;
  }

  function roundedRectDistance(x, y, halfWidth, halfHeight, radius) {
    const qx = Math.abs(x) - (halfWidth - radius);
    const qy = Math.abs(y) - (halfHeight - radius);
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
  }

  // R/G encode where each pixel samples the backdrop: inside a bezel along
  // the edge the sample is pulled toward the centre, like a convex glass rim.
  function buildDisplacementMap(width, height, radius, bezel) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const image = ctx.createImageData(width, height);
    const data = image.data;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const r = Math.min(radius, halfWidth, halfHeight);
    const distance = (x, y) => roundedRectDistance(x, y, halfWidth, halfHeight, r);

    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < width; col += 1) {
        const x = col + 0.5 - halfWidth;
        const y = row + 0.5 - halfHeight;
        const inside = -distance(x, y);
        let dx = 0;
        let dy = 0;
        if (inside < bezel) {
          const t = 1 - Math.max(inside, 0) / bezel;
          const strength = t * t;
          const gx = distance(x + 0.5, y) - distance(x - 0.5, y);
          const gy = distance(x, y + 0.5) - distance(x, y - 0.5);
          const length = Math.hypot(gx, gy) || 1;
          dx = (-gx / length) * strength;
          dy = (-gy / length) * strength;
        }
        const index = (row * width + col) * 4;
        data[index] = Math.round(128 + dx * 127);
        data[index + 1] = Math.round(128 + dy * 127);
        data[index + 2] = 128;
        data[index + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    return canvas.toDataURL();
  }

  function updateRefraction(element) {
    // The search capsule resizes every frame while search is open.
    if (document.body.classList.contains("search-modal-open")) return;
    const rect = element.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    if (width < 8 || height < 8) return;
    const size = `${width}x${height}`;
    if (element.dataset.lgSize === size) return;

    const radius = parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;
    const bezel = Math.min(14, height / 2, width / 2);
    const maxOffset = Math.min(10, bezel * 0.75);

    let id = element.dataset.lgFilter;
    if (!id) {
      filterCount += 1;
      id = `lg-refract-${filterCount}`;
      element.dataset.lgFilter = id;
    }

    let filter = document.getElementById(id);
    if (!filter) {
      filter = document.createElementNS(SVG_NS, "filter");
      filter.id = id;
      filter.setAttribute("filterUnits", "userSpaceOnUse");
      filter.setAttribute("primitiveUnits", "userSpaceOnUse");
      filter.setAttribute("color-interpolation-filters", "sRGB");
      filter.setAttribute("x", "0");
      filter.setAttribute("y", "0");
      const map = document.createElementNS(SVG_NS, "feImage");
      map.setAttribute("x", "0");
      map.setAttribute("y", "0");
      map.setAttribute("preserveAspectRatio", "none");
      map.setAttribute("result", "map");
      const displace = document.createElementNS(SVG_NS, "feDisplacementMap");
      displace.setAttribute("in", "SourceGraphic");
      displace.setAttribute("in2", "map");
      displace.setAttribute("xChannelSelector", "R");
      displace.setAttribute("yChannelSelector", "G");
      filter.append(map, displace);
      ensureDefs().append(filter);
    }

    filter.setAttribute("width", String(width));
    filter.setAttribute("height", String(height));
    const map = filter.querySelector("feImage");
    map.setAttribute("width", String(width));
    map.setAttribute("height", String(height));
    map.setAttribute("href", buildDisplacementMap(width, height, radius, bezel));
    filter.querySelector("feDisplacementMap").setAttribute("scale", String(maxOffset * 2));

    element.dataset.lgSize = size;
    element.style.setProperty("--lg-refraction", `url(#${id})`);
  }

  function initRefraction() {
    if (!supportsRefraction()) return;
    root.classList.add("lg-refract");
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => updateRefraction(entry.target));
    });
    document.querySelectorAll(REFRACT_TARGETS).forEach((element) => {
      updateRefraction(element);
      observer.observe(element);
    });
  }

  function initGlare() {
    document.addEventListener(
      "pointermove",
      (event) => {
        const element = event.target.closest?.(GLARE_TARGETS);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        element.style.setProperty("--lg-x", `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
        element.style.setProperty("--lg-y", `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
      },
      { passive: true },
    );
  }

  function initScrollEdge() {
    let queued = false;
    const update = () => {
      queued = false;
      document.body.classList.toggle("lg-scrolled", window.scrollY > 4);
    };
    window.addEventListener(
      "scroll",
      () => {
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(update);
      },
      { passive: true },
    );
    update();
  }

  function init() {
    initRefraction();
    initGlare();
    initScrollEdge();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
