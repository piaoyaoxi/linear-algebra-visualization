/* Apply Chapter 8 section patches after ch8.js registration. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch8");
  const patches = window.getChapter8SectionPatches?.();
  if (!chapter || !patches) return;

  chapter.sections = chapter.sections.map((stub) => {
    const patch = patches.get(stub.id);
    if (!patch) {
      console.warn("Missing Chapter 8 section patch:", stub.id);
      return stub;
    }
    return { ...stub, ...patch, id: stub.id };
  });
})();
