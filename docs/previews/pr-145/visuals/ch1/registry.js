/*
 * Chapter 1 lab lifecycle helpers. Labs register listeners and observers through
 * ch1Listen / ch1ObserveResize; every route change runs the collected cleanups.
 */
(() => {
  let cleanups = [];

  function runCleanup() {
    const pending = cleanups;
    cleanups = [];
    pending.reverse().forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.warn("Chapter 1 cleanup failed:", error);
      }
    });
  }

  window.ch1UseCleanup = function ch1UseCleanup(cleanup) {
    if (typeof cleanup === "function") cleanups.push(cleanup);
    return cleanup;
  };

  window.ch1Listen = function ch1Listen(target, type, handler, options) {
    if (!target?.addEventListener || typeof handler !== "function") return () => {};
    target.addEventListener(type, handler, options);
    return window.ch1UseCleanup(() => target.removeEventListener(type, handler, options));
  };

  window.ch1ObserveResize = function ch1ObserveResize(target, callback) {
    if (!target || typeof callback !== "function") return () => {};
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(() => callback());
      observer.observe(target);
      return window.ch1UseCleanup(() => observer.disconnect());
    }
    return window.ch1Listen(window, "resize", callback, { passive: true });
  };

  defineChapterTeardown("ch1", runCleanup);
})();
