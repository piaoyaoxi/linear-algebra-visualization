(() => {
  const renderers = new Map();

  window.defineChapter10Renderer = function defineChapter10Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 10 renderers require a section id and renderer object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.getChapter10Renderer = function getChapter10Renderer(sectionId) {
    return renderers.get(sectionId) || null;
  };
})();
