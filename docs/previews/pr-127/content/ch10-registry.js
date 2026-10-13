/*
 * Chapter 10 section data registry.
 */
(() => {
  const patches = new Map();

  window.defineChapter10Section = function defineChapter10Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 10 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter10SectionPatches = function getChapter10SectionPatches() {
    return patches;
  };
})();
