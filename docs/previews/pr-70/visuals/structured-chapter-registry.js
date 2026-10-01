(() => {
  const renderers = new Map();

  window.defineStructuredChapterRenderer = function defineStructuredChapterRenderer(chapterId, renderer) {
    if (!chapterId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Structured chapter renderers require a chapter id and renderer object.");
    }
    renderers.set(chapterId, renderer);
  };

  window.getStructuredChapterRenderer = function getStructuredChapterRenderer(chapterId) {
    return renderers.get(chapterId) || null;
  };

  window.teardownStructuredChapter = function teardownStructuredChapter(chapterId) {
    renderers.get(chapterId)?.teardown?.();
  };
})();
