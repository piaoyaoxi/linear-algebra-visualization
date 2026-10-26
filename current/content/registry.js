/*
 * Section data of every chapter. A section file calls defineChapterNSection(id, data)
 * (N = 1…10); content/assemble.js later merges the data into the section list that
 * chN.js registers, which is the one place that names a chapter's sections and their order.
 */
(() => {
  const patches = new Map();

  function defineSection(chapterId, sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError(`${chapterId}: section data needs an id and an object.`);
    }
    if (!patches.has(chapterId)) patches.set(chapterId, new Map());
    const chapter = patches.get(chapterId);
    if (chapter.has(sectionId)) throw new Error(`${chapterId}/${sectionId}: section data is defined twice`);
    chapter.set(sectionId, patch);
  }

  for (let n = 1; n <= 10; n += 1) {
    window[`defineChapter${n}Section`] = (sectionId, patch) => defineSection(`ch${n}`, sectionId, patch);
  }

  window.getSectionPatches = (chapterId) => patches.get(chapterId) || new Map();
})();
