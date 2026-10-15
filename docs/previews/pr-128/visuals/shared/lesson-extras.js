/*
 * Lesson extras shared by every chapter: small static figures and "停一下"
 * questions placed at the end of the theorem section, in the spirit of the
 * 3Blue1Brown lessons (a picture beside the text, a short question in the
 * middle of the reading). Data lives in content/lesson-extras.js, keyed by
 * section id; figures register through window.defineLessonFigure.
 */
(() => {
  const figures = new Map();
  window.defineLessonFigure = (key, make) => figures.set(key, make);

  function ponderHtml(p) {
    return `<details class="lx-ponder"><summary><span>停一下</span><span class="lx-q">${p.q}</span></summary><p>${p.a}</p></details>`;
  }

  function figureHtml(spec) {
    const make = figures.get(spec.key);
    if (!make) return "";
    return `<figure class="lx-figure">${make()}${spec.caption ? `<figcaption>${spec.caption}</figcaption>` : ""}</figure>`;
  }

  function enhance(section) {
    const extras = window.LESSON_EXTRAS?.[section?.id];
    if (!extras) return;
    const root = document.querySelector("#mainContent");
    const formal = root?.querySelector(`#${CSS.escape(section.id)}-formal`);
    if (!formal || formal.querySelector(".lx-extras")) return;
    const box = document.createElement("div");
    box.className = "lx-extras";
    box.innerHTML = (extras.figures || []).map(figureHtml).join("") + (extras.ponders || []).map(ponderHtml).join("");
    if (box.innerHTML) formal.append(box);
  }

  const base = window.renderLessonPage;
  if (typeof base !== "function") return;
  window.renderLessonPage = function renderLessonPageWithExtras(section, chapter) {
    base(section, chapter);
    enhance(section);
  };
})();
