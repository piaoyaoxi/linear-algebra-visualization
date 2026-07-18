/* Small DOM corrections discovered in the first Chromium screenshot pass. */
(() => {
  "use strict";

  function fitCoefficientStory(story) {
    const svg = story.querySelector("svg");
    if (!svg || svg.dataset.storyFitted === "true") return;
    svg.dataset.storyFitted = "true";
    svg.setAttribute("viewBox", "0 0 1000 500");
    const backdrop = svg.querySelector(":scope > rect");
    if (backdrop) backdrop.setAttribute("width", "1000");
  }

  function seedMultivariateStory(story) {
    if (story.dataset.storySeeded === "true") return;
    story.dataset.storySeeded = "true";
    const first = story.querySelector('[data-story-choice="degree2"]');
    if (first && !first.classList.contains("is-active")) first.click();
  }

  function polish(root = document) {
    root.querySelectorAll('[data-ch1-story="univariate-polynomials"]').forEach(fitCoefficientStory);
    root.querySelectorAll('[data-ch1-story="multivariate-polynomials"]').forEach(seedMultivariateStory);
  }

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type !== "childList") continue;
      record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches?.("[data-ch1-story]") || node.querySelector?.("[data-ch1-story]")) polish(node.parentElement || document);
        if (node.closest?.('[data-ch1-story="univariate-polynomials"]')) fitCoefficientStory(node.closest('[data-ch1-story="univariate-polynomials"]'));
      });
    }
  });

  observer.observe(document.documentElement, { subtree: true, childList: true });
  polish();
})();
