/* Load the four small Chapter 9 scene modules, then attach them to the generic lesson shell. */
(() => {
  const scriptUrl = document.currentScript?.src || new URL("./mount.js", document.baseURI).href;
  const moduleNames = ["sections1.js", "sections2.js", "sections3.js", "sections4.js"];

  function loadScript(name) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL(`./${name}?v=ch9-native3`, scriptUrl).href;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Unable to load Chapter 9 module: ${name}`));
      document.head.appendChild(script);
    });
  }

  const modulesReady = moduleNames.reduce(
    (promise, name) => promise.then(() => loadScript(name)),
    Promise.resolve(),
  );
  window.Chapter9ModulesReady = modulesReady;

  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.renderLessonPage = function renderLessonPageWithChapter9(section, chapter) {
    baseRenderLessonPage(section, chapter);
    if (chapter?.id !== "ch9") return;
    modulesReady
      .then(() => {
        if (document.body.dataset.route !== "ch9" || !document.querySelector(`#${CSS.escape(section.id)}`)) return;
        window.mountChapter9Lesson?.(section, document.querySelector("#mainContent"));
      })
      .catch((error) => console.error(error));
  };
})();
