/* Apply Chapter 10 section patches after ch10.js registration. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch10");
  const patches = window.getChapter10SectionPatches?.();
  if (!chapter || !patches) return;

  chapter.sections = chapter.sections.map((stub) => {
    const patch = patches.get(stub.id);
    if (!patch) {
      console.warn("Missing Chapter 10 section patch:", stub.id);
      return stub;
    }
    return { ...stub, ...patch, id: stub.id };
  });
})();
