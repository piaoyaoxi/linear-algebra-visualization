/* 导学只有一个页面：左侧目录应当是直接入口，而不是可展开的章节。 */
(() => {
  const baseRenderNav = window.renderNav;
  if (typeof baseRenderNav !== "function") return;

  window.renderNav = function renderNavWithDirectGuide() {
    baseRenderNav();

    const guideGroup = document.querySelector('.chapter-group[data-chapter="guide"]');
    const guideButton = guideGroup?.querySelector('button.nav-chapter');
    if (!guideGroup || !guideButton) return;

    const label = guideButton.querySelector(".chapter-label")?.innerHTML || "<strong>导学</strong><small>如何使用</small>";
    const icon = guideButton.querySelector(".chapter-icon")?.innerHTML || "0";
    const searchText = guideGroup.getAttribute("data-search-text") || "";

    guideGroup.classList.remove("is-open");
    guideGroup.classList.add("is-direct");
    guideGroup.innerHTML = `
      <a class="nav-chapter is-direct" href="#guide" data-search-text="${searchText}" aria-label="进入导学页">
        <span class="chapter-icon">${icon}</span>
        <span class="chapter-label">${label}</span>
      </a>`;
  };
})();
