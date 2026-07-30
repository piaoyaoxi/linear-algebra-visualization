(() => {
  "use strict";

  const { ReversibleSpring } = window.__ChromeMotion;

  class ChromeMotionController {
    constructor() {
      this.body = document.body;
      this.mobileQuery = window.matchMedia("(max-width: 920px)");
      this.reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.pointerFineQuery = window.matchMedia("(pointer: fine)");
      this.elements = {
        topbarCenter: document.querySelector(".topbar-center"),
        topbarRight: document.querySelector(".topbar-right"),
        sidebarToggle: document.querySelector("#sidebarToggle"),
        sidebar: document.querySelector("#sidebar"),
        sidebarSurface: document.querySelector("#sidebar .sidebar-surface"),
        sidebarBrand: document.querySelector("#sidebar .sidebar-brand"),
        sidebarScroll: document.querySelector("#sidebar .sidebar-scroll"),
        drawerBackdrop: document.querySelector("#drawerBackdrop"),
        searchCapsule: document.querySelector("#searchCapsule"),
        searchOpen: document.querySelector("#searchOpen"),
        searchCapsuleOpen: document.querySelector("#searchCapsule .search-capsule-open"),
        searchModal: document.querySelector("#searchModal"),
        searchBackdrop: document.querySelector("#searchModal .search-modal-backdrop"),
        searchPanel: document.querySelector("#searchModal .search-modal-panel"),
        searchBar: document.querySelector("#searchModal .search-modal-bar-anchor"),
        searchMergeField: document.querySelector("#searchModal .search-results-merge-field"),
        searchResultsPanel: document.querySelector("#searchModal .search-results-panel"),
        searchBody: document.querySelector("#searchModal .search-modal-body"),
        searchInput: document.querySelector("#searchModalInput"),
        searchClose: document.querySelector("#searchCloseButton"),
        languageControl: document.querySelector("#languageControl"),
        languageToggle: document.querySelector("#langToggle"),
        languageMenu: document.querySelector("#languageMenu"),
        languageHeading: document.querySelector("#languageMenu .language-menu-heading"),
        languageOptions: Array.from(document.querySelectorAll("#languageMenu .language-option")),
      };

      if (!this.hasRequiredElements()) return;

      this.searchGeometry = null;
      this.resizeFrame = 0;
      this.searchRestoreFocus = false;
      this.searchRestoreFocusVisible = false;
      this.languageRestoreFocus = false;
      this.sidebarRestoreFocus = false;
      this.searchShouldFocus = false;
      this.searchResultsInteractive = false;
      this.languageShouldFocus = false;
      this.languageInteractive = false;
      this.sidebarInteractive = false;
      this.lastViewportMobile = this.mobileQuery.matches;
      this.selectedLanguage = this.readLanguagePreference();
      this.pendingLanguage = null;

      const reduced = this.reducedQuery.matches;
      this.searchMotion = new ReversibleSpring({
        openFrequency: reduced ? 48 : 19.5,
        closeFrequency: reduced ? 50 : 21,
        openDamping: reduced ? 1 : 0.92,
        closeDamping: reduced ? 1 : 0.97,
        onUpdate: (value, raw, target) => this.renderSearch(value, raw, target),
        onSettle: (value) => this.settleSearch(value),
      });
      this.searchResultsMotion = new ReversibleSpring({
        openFrequency: reduced ? 50 : 8.6,
        closeFrequency: reduced ? 52 : 9.4,
        openDamping: reduced ? 1 : 0.86,
        closeDamping: reduced ? 1 : 0.9,
        onUpdate: (value, raw, target) => this.renderSearchResultsMotion(value, raw, target),
        onSettle: (value) => this.settleSearchResults(value),
      });
      this.languageMotion = new ReversibleSpring({
        openFrequency: reduced ? 52 : 22,
        closeFrequency: reduced ? 48 : 18.5,
        openDamping: reduced ? 1 : 0.91,
        closeDamping: reduced ? 1 : 0.96,
        onUpdate: (value, raw, target) => this.renderLanguage(value, raw, target),
        onSettle: (value) => this.settleLanguage(value),
      });
      this.sidebarMotion = new ReversibleSpring({
        openFrequency: reduced ? 46 : 17.5,
        closeFrequency: reduced ? 46 : 18.5,
        openDamping: reduced ? 1 : 0.9,
        closeDamping: reduced ? 1 : 0.94,
        onUpdate: (value, raw, target) => this.renderSidebar(value, raw, target),
        onSettle: (value) => this.settleSidebar(value),
      });

      this.syncLanguageSelection();
      this.bindEvents();
      this.bindLiquidPointerLight();
      this.body.classList.add("chrome-motion-ready");
      this.initializeSidebar();
      this.renderSearch(0, 0, 0);
      this.renderSearchResultsMotion(0, 0, 0);
      this.renderLanguage(0, 0, 0);
      this.emitState();
    }
  }

  window.__ChromeMotion.ChromeMotionController = ChromeMotionController;
})();
