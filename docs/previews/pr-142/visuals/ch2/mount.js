/* Chapter 2: the bridge to the next section sits above the mark button. */
(() => {
  function enhanceChapter2Lesson(section, root) {
    const summary = root.querySelector(`#${CSS.escape(section.id)}-summary`);
    if (summary && section.bridge) {
      const bridge = document.createElement("div");
      bridge.className = "ch2-lesson-bridge";
      bridge.innerHTML = `<strong>下一步</strong><p>${section.bridge}</p>`;
      const markButton = summary.querySelector("[data-complete]");
      if (markButton) markButton.before(bridge);
      else summary.append(bridge);
    }
  }

  defineChapterEnhancer("ch2", enhanceChapter2Lesson);
})();
