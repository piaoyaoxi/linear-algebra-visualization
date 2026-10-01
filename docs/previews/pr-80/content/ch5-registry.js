/*
 * Chapter 5 section data registry.
 */
(() => {
  const patches = new Map();

  window.defineChapter5Section = function defineChapter5Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 5 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter5SectionPatches = function getChapter5SectionPatches() {
    return patches;
  };
})();
