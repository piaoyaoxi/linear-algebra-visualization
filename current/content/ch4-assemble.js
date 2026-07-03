/* Apply the section patches after ch4.js has registered the base chapter. */
(() => {
  const chapter = window.getChapterById?.("ch4");
  const patches = window.getChapter4SectionPatches?.();
  if (!chapter || !patches) return;

  chapter.sections = chapter.sections.map((section) => {
    if (!section || typeof section !== "object") return section;
    const patch = patches.get(section.id);
    return patch ? { ...section, ...patch } : section;
  });
})();
