(() => {
  "use strict";

  const normalize = (value) =>
    String(value || "")
      .toLocaleLowerCase("zh-CN")
      .replace(/\s+/g, "");

  const nonStudentTextKeys = new Set([
    "id",
    "type",
    "visualType",
    "src",
    "embed",
    "icon",
    "component",
    "renderer",
    "mount",
    "videoPlan",
    "script",
    "answer",
    "answers",
    "steps",
    "explanation",
    "solution",
    "analysis",
  ]);

  const cleanText = (value) => {
    if (value == null) return "";
    if (Array.isArray(value)) return value.map(cleanText).filter(Boolean).join(" ");
    if (typeof value === "object") {
      return Object.entries(value)
        .filter(([key]) => !nonStudentTextKeys.has(key))
        .map(([, item]) => cleanText(item))
        .filter(Boolean)
        .join(" ");
    }

    const source = String(value);
    if (!source.includes("<")) return source.replace(/\s+/g, " ").trim();

    const template = document.createElement("template");
    template.innerHTML = source;
    template.content.querySelectorAll(".tex[data-tex]").forEach((node) => {
      node.replaceWith(document.createTextNode(node.getAttribute("data-tex") || ""));
    });
    return (template.content.textContent || "").replace(/\s+/g, " ").trim();
  };

  const shortTitle = (value, limit = 54) => {
    const text = cleanText(value);
    return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
  };

  const countOccurrences = (text, query) => {
    let count = 0;
    let cursor = 0;
    while (query && (cursor = text.indexOf(query, cursor)) >= 0) {
      count += 1;
      cursor += query.length;
    }
    return count;
  };

  const makeSnippet = (text, rawQuery, limit = 92) => {
    const clean = cleanText(text);
    if (!clean) return "";
    const query = String(rawQuery || "").trim();
    const matchAt = clean.toLocaleLowerCase("zh-CN").indexOf(query.toLocaleLowerCase("zh-CN"));
    const start = matchAt > 28 ? Math.max(0, matchAt - 24) : 0;
    const excerpt = clean.slice(start, start + limit).trim();
    return `${start ? "…" : ""}${excerpt}${start + limit < clean.length ? "…" : ""}`;
  };

  const getChapters = () => {
    if (typeof algebraContent === "undefined") return [];
    const chapters = Array.isArray(algebraContent.chapters) ? algebraContent.chapters : [];
    return typeof HOME_CHAPTER === "undefined" ? chapters : [HOME_CHAPTER, ...chapters];
  };

  const getSectionHref = (chapter, section) => {
    if (chapter.id === "home") return "#home";
    if (chapter.id === "ch4" && section && typeof section === "object" && section.id) {
      return `#${chapter.id}/${section.id}`;
    }
    return `#${chapter.id}`;
  };

  const buildEntries = () => {
    const entries = [];

    const pushEntry = ({ chapter, chapterIndex, section, sectionIndex, subIndex = 0, kind, title, text, href }) => {
      const cleanTitle = shortTitle(title);
      const cleanBody = cleanText(text);
      if (!cleanTitle && !cleanBody) return;
      entries.push({
        id: `${chapter.id}-${sectionIndex}-${subIndex}-${kind}`,
        kind,
        title: cleanTitle || chapter.title,
        body: cleanBody,
        href,
        chapterId: chapter.id,
        chapterTitle: cleanText(chapter.title),
        chapterIndex,
        sectionTitle: section ? cleanText(section.navTitle || section.title || section) : "章节导览",
        sectionNumber: section && typeof section === "object" ? cleanText(section.number) : "",
        sectionIndex,
        subIndex,
      });
    };

    getChapters().forEach((chapter, chapterIndex) => {
      const sections = Array.isArray(chapter.sections) ? chapter.sections : [];
      pushEntry({
        chapter,
        chapterIndex,
        section: null,
        sectionIndex: -1,
        kind: "chapter",
        title: chapter.title,
        text: [chapter.subtitle, chapter.summary],
        href: chapter.id === "home" ? "#home" : `#${chapter.id}`,
      });

      sections.forEach((section, sectionIndex) => {
        const href = getSectionHref(chapter, section);
        if (typeof section === "string") {
          pushEntry({
            chapter,
            chapterIndex,
            section,
            sectionIndex,
            kind: "section",
            title: section,
            text: [chapter.subtitle, section],
            href,
          });
          return;
        }

        if (!section || typeof section !== "object") return;
        const sectionTitle = section.navTitle || section.title || section.textbookSection || `第 ${sectionIndex + 1} 节`;
        pushEntry({
          chapter,
          chapterIndex,
          section,
          sectionIndex,
          kind: "section",
          title: `${section.number || ""} ${sectionTitle}`,
          // One searchable destination per real route. Nested concepts,
          // examples and self-tests still participate in the full-text match,
          // but do not create dozens of duplicate links to the same section.
          text: section,
          href,
        });
      });
    });

    return entries;
  };

  let entryCache = null;
  const getEntries = () => {
    if (!entryCache) entryCache = buildEntries();
    return entryCache;
  };

  const search = (rawQuery, { limit = 120 } = {}) => {
    const query = normalize(rawQuery);
    if (!query) return { query: "", total: 0, results: [] };

    const results = getEntries()
      .map((entry) => {
        const title = normalize(entry.title);
        const section = normalize(`${entry.sectionNumber} ${entry.sectionTitle}`);
        const chapter = normalize(entry.chapterTitle);
        const body = normalize(entry.body);
        const matchesDestination = [title, section, body].some((value) => value.includes(query));
        const matchesChapter = entry.kind === "chapter" && chapter.includes(query);
        if (!matchesDestination && !matchesChapter) return null;

        let score = 0;
        if (title === query) score += 900;
        else if (title.startsWith(query)) score += 700;
        else if (title.includes(query)) score += 560;
        if (section === query) score += 450;
        else if (section.includes(query)) score += 320;
        if (entry.kind === "chapter" && chapter.includes(query)) score += 170;
        if (body.includes(query)) score += 90 + Math.min(8, countOccurrences(body, query)) * 7;
        if (entry.kind === "section") score += 28;
        else if (entry.kind === "chapter") score += 18;

        return {
          ...entry,
          score,
          snippet: makeSnippet(entry.body || entry.title, rawQuery),
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          a.chapterIndex - b.chapterIndex ||
          a.sectionIndex - b.sectionIndex ||
          b.score - a.score ||
          a.subIndex - b.subIndex,
      );

    return { query, total: results.length, results: results.slice(0, limit) };
  };

  window.AlgebraSearch = {
    search,
    invalidate() {
      entryCache = null;
    },
  };

  const warmIndex = () => getEntries();
  if ("requestIdleCallback" in window) window.requestIdleCallback(warmIndex, { timeout: 1400 });
  else window.setTimeout(warmIndex, 0);
})();
