/*
 * Runs after every chapter file: each section of a chapter's list (chN.js) gets the data its
 * section file defined (content/registry.js). The list gives the order; a section without
 * data, or data for a section the list does not name, is reported.
 */
(() => {
  algebraContent.chapters.forEach((chapter) => {
    const patches = window.getSectionPatches(chapter.id);
    if (!patches.size) return;
    chapter.sections = chapter.sections.map((stub) => {
      const patch = patches.get(stub.id);
      if (!patch) {
        console.warn(`Missing section data: ${chapter.id}/${stub.id}`);
        return stub;
      }
      return { ...stub, ...patch, id: stub.id };
    });
    const listed = new Set(chapter.sections.map((section) => section.id));
    patches.forEach((_, id) => {
      if (!listed.has(id)) console.warn(`Section data for a section ${chapter.id}.js does not list: ${id}`);
    });
  });
})();
