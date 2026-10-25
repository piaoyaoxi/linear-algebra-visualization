/*
 * Learning-page chrome: marks the page as scrolled once it leaves the top, so
 * the floating controls can show their scroll-edge fade. The material itself
 * and its pointer light live in material.css / material.js.
 */
(() => {
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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initScrollEdge, { once: true });
  else initScrollEdge();
})();
