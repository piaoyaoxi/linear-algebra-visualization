/*
 * Chapter 8 section data registry.
 */
(() => {
  const patches = new Map();

  window.defineChapter8Section = function defineChapter8Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 8 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter8SectionPatches = function getChapter8SectionPatches() {
    return patches;
  };
})();
