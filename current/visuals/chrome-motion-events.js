(() => {
  "use strict";

  const { setInert } = window.__ChromeMotion;
  const { ChromeMotionController } = window.__ChromeMotion;

  Object.assign(ChromeMotionController.prototype, {
    hasRequiredElements() {
      return [
        "sidebarToggle",
        "sidebar",
        "sidebarSurface",
        "drawerBackdrop",
        "searchOpen",
        "searchModal",
        "searchBackdrop",
        "searchPanel",
        "searchBar",
        "searchBody",
        "languageControl",
        "languageToggle",
        "languageMenu",
      ].every((key) => this.elements[key]);
    },

    readLanguagePreference() {
      try {
        const stored = localStorage.getItem("la-visual-language");
        return ["zh-CN", "zh-TW", "en"].includes(stored) ? stored : "zh-CN";
      } catch (_error) {
        return "zh-CN";
      }
    },

    prepareSidebarBridge() {
      const bridge = this.elements.sidebarBridge;
      if (!bridge) return;
      bridge.replaceChildren();
      bridge.classList.toggle("uses-unified-clip", this.sidebarClipSupported);
    },

    bindEvents() {
      const {
        sidebarToggle,
        drawerBackdrop,
        searchOpen,
        searchModal,
        searchInput,
        languageControl,
        languageToggle,
        languageMenu,
        languageOptions,
      } = this.elements;

      sidebarToggle.addEventListener("click", () => this.toggleSidebar({ restoreFocus: true, persist: true }));
      drawerBackdrop.addEventListener("click", () => this.closeSidebar({ restoreFocus: true, persist: false }));

      searchOpen.addEventListener("click", (event) => {
        this.toggleSearch({
          focusInput: event.detail === 0 || this.pointerFineQuery.matches,
          restoreFocus: true,
        });
      });
      searchModal.querySelectorAll("[data-search-close]").forEach((element) => {
        element.addEventListener("click", () => this.closeSearch({ restoreFocus: true }));
      });
      searchInput?.addEventListener("input", () => this.renderSearchResults(searchInput.value));

      languageToggle.addEventListener("click", (event) => {
        this.toggleLanguage({ focusMenu: event.detail === 0, restoreFocus: true });
      });
      languageToggle.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowDown") return;
        event.preventDefault();
        this.openLanguage({ focusMenu: true });
      });
      languageOptions.forEach((option) => {
        option.addEventListener("click", () => {
          const next = option.dataset.lang;
          this.pendingLanguage = next === this.selectedLanguage ? null : next;
          this.closeLanguage({ restoreFocus: true });
        });
      });
      languageMenu.addEventListener("keydown", (event) => this.onLanguageKeydown(event));
      document.addEventListener(
        "pointerdown",
        (event) => {
          if (this.languageMotion.value <= 0.001 || !this.languageMotion.target) return;
          if (!languageControl.contains(event.target)) {
            this.pendingLanguage = null;
            this.closeLanguage({ restoreFocus: false });
          }
        },
        true,
      );

      document.addEventListener("keydown", (event) => this.onDocumentKeydown(event));
      document.addEventListener("click", (event) => {
        const resultLink = event.target.closest?.(".search-result-link");
        if (resultLink) this.closeSearch({ restoreFocus: false });
      });
      window.addEventListener("resize", () => this.scheduleResize(), { passive: true });
      window.addEventListener("la-themestart", () => {
        this.closeSearch({ restoreFocus: false });
        this.pendingLanguage = null;
        this.closeLanguage({ restoreFocus: false });
      });
    }
  });
})();
