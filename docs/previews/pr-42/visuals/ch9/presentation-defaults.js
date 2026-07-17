(() => {
  const mountChapter9 = window.mountChapter9;
  if (typeof mountChapter9 !== "function") return;

  window.mountChapter9 = function mountChapter9WithClearDefaults(sectionId) {
    mountChapter9(sectionId);
    if (sectionId !== "symmetric-canonical-form") return;

    const root = document.querySelector('[data-section-id="symmetric-canonical-form"]');
    if (!root) return;

    const values = { a: 2.6, b: 0.8, d: 1.4 };
    for (const [name, value] of Object.entries(values)) {
      const input = root.querySelector(`[data-range="${name}"]`);
      if (!input) continue;
      input.value = String(value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    root.querySelectorAll("[data-sp-preset]").forEach((button) => {
      const active = button.dataset.spPreset === "rotated";
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  };
})();
