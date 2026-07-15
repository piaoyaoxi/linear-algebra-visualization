(() => {
  "use strict";

  let controller = null;

  window.createChromeMotionController = () => {
    if (controller) return controller;
    const Controller = window.__ChromeMotion?.ChromeMotionController;
    if (!Controller) return null;
    controller = new Controller();
    window.dispatchEvent(new CustomEvent("la-chromemotionready", { detail: controller }));
    return controller;
  };
})();
