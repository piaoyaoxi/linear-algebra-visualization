/* Apply the section patches after ch1.js has registered the base chapter. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch1");
  const patches = window.getChapter1SectionPatches?.();
  if (!chapter || !patches) return;

  chapter.sections = chapter.sections.map((section) => {
    if (!section || typeof section !== "object") return section;
    const patch = patches.get(section.id);
    return patch ? { ...section, ...patch } : section;
  });
})();
