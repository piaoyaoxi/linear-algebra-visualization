/*
 * Chapter 6 section data registry.
 */
(() => {
  const patches = new Map();

  window.defineChapter6Section = function defineChapter6Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 6 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter6SectionPatches = function getChapter6SectionPatches() {
    return patches;
  };
})();
