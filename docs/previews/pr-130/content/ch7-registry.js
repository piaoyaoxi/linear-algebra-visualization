/*
 * Chapter 7 section data registry.
 */
(() => {
  const patches = new Map();

  window.defineChapter7Section = function defineChapter7Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 7 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter7SectionPatches = function getChapter7SectionPatches() {
    return patches;
  };
})();
