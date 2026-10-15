renderPlaceholder = function renderLearningPlaceholder(chapter) {
  els.main.innerHTML = `
    <section class="hero" id="${chapter.id}">
      <div class="hero-copy">
        <span class="eyebrow">章节导览</span>
        <h1>${chapter.title}</h1>
        <p>这一章围绕下列主题展开，适合配合教材相应章节阅读。</p>
        <div class="hero-actions">
          <a class="button primary" href="${getStartTarget()}">${hasVisitedLesson() ? "继续学习" : "从第一节开始"}</a>
          <a class="button ghost" href="#guide">查看学习路线</a>
        </div>
      </div>
      <div class="hero-visual">${renderHeroVisual()}</div>
    </section>
    <section class="section-band" id="planned-sections">
      <div class="section-head">
        <div>
          <div class="section-kicker">本章主题</div>
          <h2>${chapter.title}的可视化入口</h2>
        </div>
      </div>
      <p class="lead">这些主题围绕概念理解和可视化表达组织，帮助学生抓住章节主线。</p>
      <ul class="placeholder-list">
        ${chapter.sections.map((item) => `<li>${getSectionLabel(item)}</li>`).join("")}
      </ul>
    </section>`;
};
