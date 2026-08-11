/* Apply the section patches after ch5.js has registered the base chapter. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch5");
  const patches = window.getChapter5SectionPatches?.();
  if (!chapter || !patches) return;

  chapter.sections = chapter.sections.map((section) => {
    if (!section || typeof section !== "object") return section;
    const patch = patches.get(section.id);
    return patch ? { ...section, ...patch } : section;
  });
})();
