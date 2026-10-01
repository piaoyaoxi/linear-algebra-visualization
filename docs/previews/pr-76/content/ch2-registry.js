/*
 * Chapter 2 section data registry.
 */
(() => {
  const patches = new Map();

  window.defineChapter2Section = function defineChapter2Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 2 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter2SectionPatches = function getChapter2SectionPatches() {
    return patches;
  };
})();
