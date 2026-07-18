(() => {
  const sections = [];

  window.defineChapter10Section = function defineChapter10Section(section) {
    if (!section?.id) throw new TypeError("Chapter 10 sections require an id.");
    if (sections.some((item) => item.id === section.id)) {
      throw new Error(`Duplicate Chapter 10 section: ${section.id}`);
    }
    sections.push(section);
  };

  window.getChapter10Sections = function getChapter10Sections() {
    return sections.slice();
  };
})();
