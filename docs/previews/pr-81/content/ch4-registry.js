/*
 * Chapter 4 section data registry.
 *
 * Each section module declares only the fields it owns. The base chapter stays
 * in ch4.js; ch4-assemble.js applies these patches once after registration.
 * This replaces the previous chain of registerAlgebraChapter wrappers.
 */
(() => {
  const patches = new Map();

  window.defineChapter4Section = function defineChapter4Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 4 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter4SectionPatches = function getChapter4SectionPatches() {
    return patches;
  };
})();
