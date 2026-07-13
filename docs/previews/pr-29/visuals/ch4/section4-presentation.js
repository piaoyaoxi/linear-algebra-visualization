(() => {
  function normalizeConcepts(section) {
    return (section?.concepts || []).map((concept) =>
      Array.isArray(concept) ? { label: concept[0], text: concept[1] } : concept,
    );
  }

  function renderSection4Formal(formal, section) {
    if (!formal) return;
    const concepts = normalizeConcepts(section);
    const textbook = section?.textbook || {};

    formal.innerHTML = `
      <h2>定理概念</h2>
      <div class="section4-formal">
        <p class="lesson-formal-intro">${
          section.formalIntro ||
          "沿着“撤销一个作用—倒序撤销复合—落回求逆计算”的顺序阅读。先把每条规则各自说清，再在例题中把它们连起来。"
        }</p>
        <div class="definition-stack">
          ${concepts
            .map(
              (concept) => `
                <article class="definition-row">
                  <strong>${concept.label}</strong>
                  <p>${concept.text}</p>
                </article>
              `,
            )
            .join("")}
        </div>
        <div class="script-panel textbook-panel">
          <h3>${section.textbookSection} · ${textbook.reference || "北大版《高等代数》第四章"}</h3>
          ${textbook.page ? `<p>页码：${textbook.page}</p>` : ""}
          <ul>${(textbook.items || []).map((item) => `<li>${item}</li>`).join("")}</ul>
        </div>
      </div>
    `;
  }

  defineChapter4Renderer("matrix-inverse", { formal: renderSection4Formal });
})();
