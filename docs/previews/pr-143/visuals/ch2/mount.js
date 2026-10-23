/* Chapter 2: the bridge to the next section sits above the mark button. */
(() => {
  function enhanceChapter2Lesson(section, root) {
    const summary = root.querySelector(`#${CSS.escape(section.id)}-summary`);
    if (summary && section.bridge) {
      // the last section's bridge looks back over the chapter instead of ahead
      const last = getStructuredSections(getChapterById("ch2")).at(-1)?.id === section.id;
      const bridge = document.createElement("div");
      bridge.className = "ch2-lesson-bridge";
      bridge.innerHTML = `<strong>${last ? "本章回顾" : "下一节"}</strong><p>${section.bridge}</p>`;
      const markButton = summary.querySelector("[data-complete]");
      if (markButton) markButton.before(bridge);
      else summary.append(bridge);
    }
  }

  defineChapterEnhancer("ch2", enhanceChapter2Lesson);
})();
