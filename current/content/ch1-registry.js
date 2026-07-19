/*
 * Chapter 1 section data registry.
 */
(() => {
  const patches = new Map();

  window.defineChapter1Section = function defineChapter1Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 1 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter1SectionPatches = function getChapter1SectionPatches() {
    return patches;
  };
})();
