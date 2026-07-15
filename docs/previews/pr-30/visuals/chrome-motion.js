(() => {
  "use strict";

  const source = document.currentScript?.src || window.location.href;
  const files = [
    "liquid-material.js",
    "chrome-motion-runtime.js",
    "chrome-motion-controller.js",
    "chrome-motion-events.js",
    "chrome-motion-lifecycle.js",
    "chrome-motion-search.js",
    "chrome-motion-language.js",
    "chrome-motion-sidebar.js",
  ];

  let actual = null;
  let loading = null;
  const queue = [];

  const facade = new Proxy(
    {},
    {
      get(_target, property) {
        if (property === "ready") return loading || Promise.resolve(actual);
        if (property === "actual") return actual;
        if (property === "getState") {
          return () =>
            actual?.getState?.() || {
              search: { phase: "closed", progress: 0 },
              language: { phase: "closed", progress: 0, selected: "zh-CN" },
              sidebar: { phase: "closed", progress: 0 },
            };
        }
        return (...args) => {
          if (actual && typeof actual[property] === "function") return actual[property](...args);
          queue.push([property, args]);
          return undefined;
        };
      },
    },
  );

  function loadScript(filename) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL(`${filename}?v=30c`, source).href;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${filename}`));
      document.head.append(script);
    });
  }

  function start() {
    if (loading) return loading;
    loading = (async () => {
      for (const file of files) await loadScript(file);
      actual = new window.__ChromeMotion.ChromeMotionController();
      while (queue.length) {
        const [method, args] = queue.shift();
        if (typeof actual[method] === "function") actual[method](...args);
      }
      window.dispatchEvent(new CustomEvent("la-chromemotionready", { detail: actual }));
      return actual;
    })().catch((error) => {
      console.error("Liquid Glass motion failed to initialize.", error);
      throw error;
    });
    return loading;
  }

  window.createChromeMotionController = () => {
    start();
    return facade;
  };
})();
