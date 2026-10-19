/*
 * Course-wide search index (ported from the Liquid Glass draft, PR #30).
 * Indexes student-facing text only: answers (also the 停一下 answers), video plans,
 * TTS drafts, figure keys, flags and authoring fields the lesson page never shows are skipped.
 *
 * Text is kept as parts: { text } or { tex, text }, a formula's TeX source plus what it reads as
 * ("\operatorname{rank}A" reads "rankA"). Matching uses the readings; the result list renders
 * the formulas with KaTeX (visuals/search.js).
 */
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
    "ttsDraft",
    "scenes",
    "duration",
    "script",
    "correct",
    "answer",
    "answers",
    "steps",
    "explanation",
    "solution",
    "analysis",
    // figure keys and layout flags
    "figure",
    "figureLast",
    // authoring notes no lesson page renders
    "checkpoints",
    "objectives",
    "prerequisites",
  ]);

  // keys skipped only under one parent: the 停一下 answer, and lab notes the chapter labs replace
  const nonStudentChildKeys = {
    ponder: new Set(["a"]),
    interactive: new Set(["prompts", "description", "label"]),
  };

  // fields whose value is a bare TeX source (theorem formulas)
  const texKeys = new Set(["tex", "equation"]);

  // what a formula reads as: KaTeX's MathML without the TeX annotation, minus invisible operators
  const readMath = (math) => {
    if (!math) return "";
    const copy = math.cloneNode(true);
    copy.querySelectorAll("annotation").forEach((node) => node.remove());
    return (copy.textContent || "").replace(/[\u2061-\u2064\u200b]/g, "");
  };

  const readTex = (source) => {
    if (!window.katex?.renderToString) return source;
    const template = document.createElement("template");
    template.innerHTML = window.katex.renderToString(source, { output: "mathml", throwOnError: false, strict: "ignore" });
    return readMath(template.content.querySelector("math")) || source;
  };

  const pushText = (parts, text) => {
    if (text) parts.push({ text });
  };

  const pushFormula = (parts, tex, text) => {
    if (tex) parts.push({ tex, text: text || tex });
  };

  const collectNodes = (node, parts) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) pushText(parts, child.textContent);
      else if (child.nodeType !== Node.ELEMENT_NODE) return;
      else if (child.matches(".tex[data-tex]")) pushFormula(parts, child.getAttribute("data-tex"), readMath(child.querySelector("math")));
      else collectNodes(child, parts);
    });
  };

  // key: the field this value sits in (array items keep their array's key)
  const collect = (value, parts, key = "") => {
    if (value == null || typeof value === "boolean") return;
    if (Array.isArray(value)) {
      value.forEach((item) => collect(item, parts, key));
      return;
    }
    if (typeof value === "object") {
      Object.entries(value).forEach(([childKey, item]) => {
        if (nonStudentTextKeys.has(childKey) || nonStudentChildKeys[key]?.has(childKey)) return;
        collect(item, parts, childKey);
      });
      return;
    }
    // separate fields with a space, as they are separate lines on the page
    pushText(parts, " ");
    const source = String(value);
    if (texKeys.has(key)) pushFormula(parts, source.trim(), readTex(source));
    else if (!source.includes("<")) pushText(parts, source);
    else {
      const template = document.createElement("template");
      template.innerHTML = source;
      collectNodes(template.content, parts);
    }
  };

  // collapse whitespace, merge neighbouring text, trim the ends
  const tidy = (parts) => {
    const out = [];
    parts.forEach((part) => {
      const text = part.text.replace(/\s+/g, " ");
      const last = out[out.length - 1];
      if (part.tex == null && last && last.tex == null) last.text = `${last.text}${text}`.replace(/ {2,}/g, " ");
      else if (part.tex == null) out.push({ text });
      else out.push({ tex: part.tex, text: text.trim() || part.tex });
    });
    if (out[0]?.tex == null && out[0]) out[0].text = out[0].text.trimStart();
    const end = out[out.length - 1];
    if (end?.tex == null && end) end.text = end.text.trimEnd();
    return out.filter((part) => part.tex != null || part.text);
  };

  const toParts = (value) => {
    const parts = [];
    collect(value, parts);
    return tidy(parts);
  };

  const plainText = (parts) => parts.map((part) => part.text).join("");

  const cleanText = (value) => plainText(toParts(value));

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

  /*
   * About `limit` characters of readable text around the first match, as parts. A formula is
   * never cut: the excerpt starts at the start of a formula it would cut, and a formula that
   * runs past the end is left out unless it holds the match.
   */
  const makeSnippet = (parts, rawQuery, limit = 92) => {
    let offset = 0;
    const spans = parts.map((part) => {
      const span = { ...part, from: offset, to: offset + part.text.length };
      offset = span.to;
      return span;
    });
    const plain = plainText(parts);
    if (!plain) return [];
    const query = String(rawQuery || "").trim().toLocaleLowerCase("zh-CN");
    const matchAt = query ? plain.toLocaleLowerCase("zh-CN").indexOf(query) : -1;
    // a short lead-in: the snippet is one line, about 20 characters on a phone
    let start = matchAt > 14 ? matchAt - 10 : 0;
    start = spans.find((span) => span.tex != null && span.from < start && span.to > start)?.from ?? start;
    const end = start + limit;
    const out = [];
    spans.forEach((span) => {
      if (span.to <= start || span.from >= end) return;
      if (span.tex == null) out.push({ text: span.text.slice(Math.max(0, start - span.from), end - span.from) });
      else if (span.to <= end || (matchAt >= span.from && matchAt < span.to)) out.push({ tex: span.tex, text: span.text });
    });
    if (out[0]?.tex == null && out[0]) out[0].text = out[0].text.trimStart();
    const last = out[out.length - 1];
    if (last?.tex == null && last) last.text = last.text.trimEnd();
    if (start) out.unshift({ text: "…" });
    if (end < plain.length) out.push({ text: "…" });
    return tidy(out);
  };

  // Course chapters only; the guide gets one direct entry below.
  const getChapters = () => {
    if (typeof algebraContent === "undefined") return [];
    return Array.isArray(algebraContent.chapters) ? algebraContent.chapters : [];
  };

  const getSectionHref = (chapter, section) => {
    if (section && typeof section === "object" && section.id) return `#${chapter.id}/${section.id}`;
    return `#${chapter.id}`;
  };

  const buildEntries = () => {
    const entries = [];

    const pushEntry = ({ chapter, chapterIndex, section, sectionIndex, subIndex = 0, kind, title, text, href }) => {
      const cleanTitle = shortTitle(title);
      const parts = toParts(text);
      const cleanBody = plainText(parts);
      if (!cleanTitle && !cleanBody) return;
      entries.push({
        id: `${chapter.id}-${sectionIndex}-${subIndex}-${kind}`,
        kind,
        title: cleanTitle || chapter.title,
        body: cleanBody,
        parts,
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

    const guide = { id: "guide", title: "导学" };
    pushEntry({
      chapter: guide,
      chapterIndex: -1,
      section: null,
      sectionIndex: -1,
      kind: "chapter",
      title: "导学",
      text: "如何使用 学习路线 从第一节开始",
      href: "#guide",
    });

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
        href: `#${chapter.id}`,
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
        // the result title already shows the number and the navigation title; other names still match
        const { number, navTitle, title, textbookSection, ...content } = section;
        const names = [...new Set([title, textbookSection])].filter((name) => name && name !== sectionTitle);
        // exercises stand in for the self-test only when a section has no quiz
        if (content.quiz?.length) delete content.exercises;
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
          text: [names, content],
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

        const snippetParts = makeSnippet(entry.parts.length ? entry.parts : toParts(entry.title), rawQuery);
        return {
          ...entry,
          score,
          snippet: plainText(snippetParts),
          snippetParts,
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
