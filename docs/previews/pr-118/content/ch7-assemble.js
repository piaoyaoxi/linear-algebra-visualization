/* Apply Chapter 7 section patches after ch7.js registration. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch7");
  const patches = window.getChapter7SectionPatches?.();
  if (!chapter || !patches) return;

  chapter.sections = chapter.sections.map((stub) => {
    const patch = patches.get(stub.id);
    if (!patch) {
      console.warn("Missing Chapter 7 section patch:", stub.id);
      return stub;
    }
    return { ...stub, ...patch, id: stub.id };
  });
})();
