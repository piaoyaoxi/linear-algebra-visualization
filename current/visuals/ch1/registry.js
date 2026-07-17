/*
 * Chapter 1 presentation registry and lifecycle.
 * Every route transition tears down the previous Chapter 1 lab before mounting
 * a new renderer, so resize observers, timers, and listeners do not accumulate.
 */
(() => {
  const renderers = new Map();
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

  window.defineChapter1Renderer = function defineChapter1Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 1 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.renderChapter1Formal = function renderChapter1Formal(el, section, config = {}) {
    if (!el || !section) return;
    const inline = (source) => (window.texInline ? window.texInline(source) : source);
    const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);
    const concepts = Array.isArray(section.concepts) ? section.concepts : [];
    const details = Array.isArray(config.details) ? config.details : [];
    const cards = Array.isArray(config.cards) ? config.cards : [];
    const misconceptions = Array.isArray(section.misconceptions) ? section.misconceptions : [];
    const formula = config.formula || "";
    const title = config.title || section.title;

    el.innerHTML = `
      <h2>${title}</h2>
      <div class="lesson-formal-layout">
        <p class="lesson-formal-intro">${config.intro || section.intro || ""}</p>
        ${
          formula
            ? `<div class="operation-map">
                <div class="operation-map-main">${display(formula)}</div>
                <dl class="lesson-meta-list">
                  ${concepts
                    .slice(0, 5)
                    .map((item) => `<div><dt>${item.label}</dt><dd>${item.text}</dd></div>`)
                    .join("")}
                </dl>
              </div>`
            : ""
        }
        <div class="definition-stack">
          ${details
            .map(
              (item) =>
                `<article class="definition-row"><strong>${item.title}</strong><p>${item.html}</p></article>`,
            )
            .join("")}
        </div>
        ${
          cards.length
            ? `<div class="lesson-card-grid">
                ${cards
                  .map(
                    (item) => `<article class="lesson-card">
                      <span class="lesson-card-kicker">${item.kicker || "观察"}</span>
                      <h3>${item.title}</h3>
                      <p>${item.html}</p>
                    </article>`,
                  )
                  .join("")}
              </div>`
            : ""
        }
        ${
          misconceptions.length
            ? `<div class="ch1-misconceptions">
                <strong>常见误区</strong>
                <ul>${misconceptions.map((item) => `<li>${item}</li>`).join("")}</ul>
              </div>`
            : ""
        }
        <div class="lesson-reading-note">
          <strong>这一节的主线</strong>
          <p>${(section.summary || []).join(" ")}</p>
        </div>
      </div>`;
  };

  window.mountChapter1Lesson = function mountChapter1Lesson(section, root) {
    runCleanup();
    if (!section?.id || !root) return;
    const renderer = renderers.get(section.id);
    if (!renderer) return;
    const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
    const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
    renderer.formal?.(formal, section, root);
    renderer.interactive?.(interactive, section, root);
  };

  window.teardownChapter1Lesson = runCleanup;
})();