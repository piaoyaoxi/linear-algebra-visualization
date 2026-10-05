/*
 * Chapter 3 section data registry.
 */
(() => {
  const patches = new Map();

  window.defineChapter3Section = function defineChapter3Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 3 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter3SectionPatches = function getChapter3SectionPatches() {
    return patches;
  };
})();
