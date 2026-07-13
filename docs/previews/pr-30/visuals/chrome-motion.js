(() => {
  "use strict";

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (from, to, progress) => from + (to - from) * progress;
  const range = (value, start, end) => clamp((value - start) / Math.max(0.0001, end - start));
  const smoothstep = (value) => {
    const x = clamp(value);
    return x * x * (3 - 2 * x);
  };
  const smootherstep = (value) => {
    const x = clamp(value);
    return x * x * x * (x * (x * 6 - 15) + 10);
  };

  const normalizeSearchText = (value) =>
    String(value || "")
      .toLocaleLowerCase("zh-CN")
      .replace(/\s+/g, "");

  function setInert(element, inert) {
    if (!element) return;
    if (inert) element.setAttribute("inert", "");
    else element.removeAttribute("inert");
  }

  /**
   * A small damped spring with a continuous velocity. Changing target while it
   * is moving reverses from the current position; no animation is restarted.
   */
  class ReversibleSpring {
    constructor({ value = 0, frequency = 15, damping = 0.9, onUpdate, onSettle }) {
      this.value = value;
      this.target = value;
      this.velocity = 0;
      this.frequency = frequency;
      this.damping = damping;
      this.onUpdate = onUpdate;
      this.onSettle = onSettle;
      this.frame = 0;
      this.lastTime = 0;
      this.tick = this.tick.bind(this);
    }

    setTarget(target) {
      this.target = target ? 1 : 0;
      if (!this.frame) {
        this.lastTime = 0;
        this.frame = requestAnimationFrame(this.tick);
      }
    }

    jump(target) {
      if (this.frame) cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.lastTime = 0;
      this.target = target ? 1 : 0;
      this.value = this.target;
      this.velocity = 0;
      this.onUpdate?.(this.value, this.value);
      this.onSettle?.(this.value);
    }

    tick(now) {
      if (!this.lastTime) this.lastTime = now;
      const dt = Math.min(0.032, Math.max(0.001, (now - this.lastTime) / 1000));
      this.lastTime = now;

      const omega = this.frequency;
      const acceleration =
        (this.target - this.value) * omega * omega - 2 * this.damping * omega * this.velocity;
      this.velocity += acceleration * dt;
      this.value += this.velocity * dt;

      const rendered = clamp(this.value);
      this.onUpdate?.(rendered, this.value);

      if (Math.abs(this.target - this.value) < 0.0012 && Math.abs(this.velocity) < 0.012) {
        this.value = this.target;
        this.velocity = 0;
        this.frame = 0;
        this.lastTime = 0;
        this.onUpdate?.(this.value, this.value);
        this.onSettle?.(this.value);
        return;
      }

      this.frame = requestAnimationFrame(this.tick);
    }
  }

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
        sidebarBridge: document.querySelector("#sidebarLiquidBridge"),
        drawerBackdrop: document.querySelector("#drawerBackdrop"),
        searchOpen: document.querySelector("#searchOpen"),
        searchModal: document.querySelector("#searchModal"),
        searchBackdrop: document.querySelector("#searchModal .search-modal-backdrop"),
        searchPanel: document.querySelector("#searchModal .search-modal-panel"),
        searchBar: document.querySelector("#searchModal .search-modal-bar"),
        searchBody: document.querySelector("#searchModal .search-modal-body"),
        searchInput: document.querySelector("#searchModalInput"),
        languageControl: document.querySelector("#languageControl"),
        languageToggle: document.querySelector("#langToggle"),
        languageMenu: document.querySelector("#languageMenu"),
        languageHeading: document.querySelector("#languageMenu .language-menu-heading"),
        languageOptions: Array.from(document.querySelectorAll("#languageMenu .language-option")),
      };

      if (!this.hasRequiredElements()) return;

      this.searchGeometry = null;
      this.searchProxy = null;
      this.resizeFrame = 0;
      this.searchRestoreFocus = false;
      this.languageRestoreFocus = false;
      this.sidebarRestoreFocus = false;
      this.searchShouldFocus = false;
      this.languageShouldFocus = false;
      this.languageInteractive = false;
      this.sidebarInteractive = false;
      this.lastViewportMobile = this.mobileQuery.matches;
      this.selectedLanguage = this.readLanguagePreference();

      const reduced = this.reducedQuery.matches;
      this.searchMotion = new ReversibleSpring({
        frequency: reduced ? 46 : 13.2,
        damping: reduced ? 1 : 0.91,
        onUpdate: (value, raw) => this.renderSearch(value, raw),
        onSettle: (value) => this.settleSearch(value),
      });
      this.languageMotion = new ReversibleSpring({
        frequency: reduced ? 50 : 14.4,
        damping: reduced ? 1 : 0.84,
        onUpdate: (value, raw) => this.renderLanguage(value, raw),
        onSettle: (value) => this.settleLanguage(value),
      });
      this.sidebarMotion = new ReversibleSpring({
        frequency: reduced ? 43 : 12.4,
        damping: reduced ? 1 : 0.86,
        onUpdate: (value, raw) => this.renderSidebar(value, raw),
        onSettle: (value) => this.settleSidebar(value),
      });

      this.syncLanguageSelection();
      this.bindEvents();
      this.bindLiquidPointerLight();
      this.initializeSidebar();
      this.body.classList.add("chrome-motion-ready");
      this.renderSearch(0, 0);
      this.renderLanguage(0, 0);
      this.emitState();
    }

    hasRequiredElements() {
      const required = [
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
      ];
      return required.every((key) => this.elements[key]);
    }

    readLanguagePreference() {
      try {
        const stored = localStorage.getItem("la-visual-language");
        return ["zh-CN", "zh-TW", "en"].includes(stored) ? stored : "zh-CN";
      } catch (_error) {
        return "zh-CN";
      }
    }

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

      sidebarToggle.addEventListener("click", () => this.toggleSidebar({ restoreFocus: true }));
      drawerBackdrop.addEventListener("click", () => this.closeSidebar({ restoreFocus: true }));

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
        this.toggleLanguage({
          focusMenu: event.detail === 0,
          restoreFocus: true,
        });
      });
      languageToggle.addEventListener("keydown", (event) => {
        if (!["ArrowDown", "Enter", " "].includes(event.key)) return;
        if (event.key === "Enter" || event.key === " ") return;
        event.preventDefault();
        this.openLanguage({ focusMenu: true });
      });

      languageOptions.forEach((option) => {
        option.addEventListener("click", () => {
          this.selectLanguage(option.dataset.lang);
          this.closeLanguage({ restoreFocus: true });
        });
      });

      languageMenu.addEventListener("keydown", (event) => this.onLanguageKeydown(event));
      document.addEventListener("pointerdown", (event) => {
        if (this.languageMotion.value <= 0.001 || !this.languageMotion.target) return;
        if (!languageControl.contains(event.target)) this.closeLanguage({ restoreFocus: false });
      }, true);

      document.addEventListener("keydown", (event) => this.onDocumentKeydown(event));
      window.addEventListener("resize", () => this.scheduleResize(), { passive: true });
      window.addEventListener("la-themestart", () => {
        this.closeSearch({ restoreFocus: false });
        this.closeLanguage({ restoreFocus: false });
      });

      document.addEventListener("click", (event) => {
        const resultLink = event.target.closest?.(".search-result-link");
        if (resultLink) this.closeSearch({ restoreFocus: false });
      });
    }

    bindLiquidPointerLight() {
      const bind = (element) => {
        element.addEventListener("pointermove", (event) => {
          const rect = element.getBoundingClientRect();
          const x = clamp((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
          const y = clamp((event.clientY - rect.top) / Math.max(1, rect.height)) * 100;
          element.style.setProperty("--liquid-pointer-x", `${x.toFixed(1)}%`);
          element.style.setProperty("--liquid-pointer-y", `${y.toFixed(1)}%`);
        }, { passive: true });
        element.addEventListener("pointerleave", () => {
          element.style.removeProperty("--liquid-pointer-x");
          element.style.removeProperty("--liquid-pointer-y");
        }, { passive: true });
      };

      document.querySelectorAll(".liquid-control").forEach(bind);
      this.bindPointerLightTo = bind;
    }

    initializeSidebar() {
      const shouldOpen = !this.mobileQuery.matches && !this.body.classList.contains("sidebar-collapsed");
      this.sidebarMotion.value = shouldOpen ? 1 : 0;
      this.sidebarMotion.target = this.sidebarMotion.value;
      this.renderSidebar(this.sidebarMotion.value, this.sidebarMotion.value);
      this.settleSidebar(this.sidebarMotion.value);
    }

    scheduleResize() {
      if (this.resizeFrame) return;
      this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = 0;
        const nowMobile = this.mobileQuery.matches;
        if (nowMobile !== this.lastViewportMobile) {
          this.lastViewportMobile = nowMobile;
          if (nowMobile) {
            this.jumpSidebar(0, { persist: false });
          } else {
            const collapsed = localStorage.getItem("la-visual-sidebar") === "collapsed";
            this.jumpSidebar(collapsed ? 0 : 1, { persist: false });
          }
        } else if (this.sidebarMotion.value > 0.001) {
          this.renderSidebar(this.sidebarMotion.value, this.sidebarMotion.value);
        }

        if (this.searchMotion.value > 0.001) {
          this.measureSearch();
          this.renderSearch(this.searchMotion.value, this.searchMotion.value);
        }
      });
    }

    onDocumentKeydown(event) {
      if (event.key === "Escape") {
        if (this.searchMotion.value > 0.001 || this.searchMotion.target) {
          event.preventDefault();
          this.closeSearch({ restoreFocus: true });
          return;
        }
        if (this.languageMotion.value > 0.001 || this.languageMotion.target) {
          event.preventDefault();
          this.closeLanguage({ restoreFocus: true });
          return;
        }
        if (this.sidebarMotion.value > 0.001 || this.sidebarMotion.target) {
          event.preventDefault();
          this.closeSidebar({ restoreFocus: true });
        }
        return;
      }

      if (event.key === "Tab" && this.searchMotion.value > 0.98) this.trapSearchFocus(event);
      if (event.key === "Tab" && this.mobileQuery.matches && this.sidebarMotion.value > 0.98) {
        this.trapSidebarFocus(event);
      }
    }

    trapSearchFocus(event) {
      const focusable = Array.from(
        this.elements.searchPanel.querySelectorAll("input:not([disabled]), button:not([disabled]), a[href]"),
      ).filter((element) => !element.hasAttribute("inert"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    trapSidebarFocus(event) {
      const focusable = [
        this.elements.sidebarToggle,
        ...this.elements.sidebar.querySelectorAll("a[href], button:not([disabled])"),
      ];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    emitState() {
      window.dispatchEvent(new CustomEvent("la-chromestatechange", { detail: this.getState() }));
    }

    getState() {
      return {
        search: {
          phase: this.elements.searchModal.dataset.phase || "closed",
          progress: Number(this.searchMotion?.value?.toFixed(4) || 0),
        },
        language: {
          phase: this.elements.languageControl.dataset.phase || "closed",
          progress: Number(this.languageMotion?.value?.toFixed(4) || 0),
          selected: this.selectedLanguage,
        },
        sidebar: {
          phase: this.elements.sidebar.dataset.phase || "closed",
          progress: Number(this.sidebarMotion?.value?.toFixed(4) || 0),
        },
      };
    }

    /* Search ------------------------------------------------------------ */

    toggleSearch(options = {}) {
      if (this.searchMotion.target || this.searchMotion.value > 0.55) this.closeSearch(options);
      else this.openSearch(options);
    }

    openSearch({ focusInput = true } = {}) {
      if (this.searchMotion.target === 1) return;
      this.closeLanguage({ restoreFocus: false });
      this.closeSidebar({ restoreFocus: false });

      this.searchShouldFocus = focusInput;
      this.searchRestoreFocus = false;
      this.mountSearch();
      this.elements.searchModal.dataset.phase = "opening";
      this.elements.searchOpen.setAttribute("aria-expanded", "true");
      this.searchMotion.setTarget(1);
      this.emitState();
    }

    closeSearch({ restoreFocus = false } = {}) {
      if (this.searchMotion.value <= 0.001 && this.searchMotion.target === 0) return;
      this.searchRestoreFocus = restoreFocus;
      this.searchShouldFocus = false;
      this.elements.searchModal.dataset.phase = "closing";
      this.elements.searchOpen.setAttribute("aria-expanded", "false");
      this.elements.searchInput?.blur();
      this.searchMotion.setTarget(0);
      this.emitState();
    }

    mountSearch() {
      const { searchModal, searchOpen, searchBar } = this.elements;
      searchModal.hidden = false;
      searchModal.dataset.phase = "opening";
      this.body.classList.add("search-modal-open");
      searchOpen.classList.add("is-morph-source");
      searchBar.classList.remove("is-interactive");
      this.measureSearch();

      if (!this.searchProxy) {
        const proxy = document.createElement("div");
        proxy.className = "search-morph-proxy liquid-control";
        proxy.setAttribute("aria-hidden", "true");
        proxy.innerHTML = `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5"></circle>
            <path d="m16.2 16.2 4.3 4.3"></path>
          </svg>
          <span>搜索</span>
        `;
        proxy.addEventListener("click", () => this.toggleSearch({ focusInput: true, restoreFocus: true }));
        document.body.append(proxy);
        this.bindPointerLightTo?.(proxy);
        this.searchProxy = proxy;
      }
    }

    measureSearch() {
      const { searchOpen, searchBar } = this.elements;
      this.searchGeometry = {
        start: searchOpen.getBoundingClientRect(),
        end: searchBar.getBoundingClientRect(),
      };
    }

    renderSearch(progress) {
      const {
        searchBackdrop,
        searchPanel,
        searchBar,
        searchBody,
      } = this.elements;
      const p = clamp(progress);
      if (p <= 0 && !this.searchProxy) return;
      if (!this.searchGeometry) this.measureSearch();

      const backdropProgress = smootherstep(range(p, 0.01, 0.46));
      const travelProgress = smootherstep(range(p, 0.05, 0.72));
      const panelProgress = smootherstep(range(p, 0.53, 0.96));
      const bodyProgress = smootherstep(range(p, 0.67, 0.98));
      const targetProgress = smootherstep(range(p, 0.7, 0.86));
      const proxyProgress = 1 - targetProgress;

      searchBackdrop.style.opacity = backdropProgress.toFixed(4);
      searchPanel.style.opacity = panelProgress.toFixed(4);
      searchPanel.style.transform = `translate3d(-50%, ${lerp(12, 0, panelProgress).toFixed(2)}px, 0) scale(${lerp(
        0.985,
        1,
        panelProgress,
      ).toFixed(4)})`;
      searchPanel.style.clipPath = `inset(0 0 ${(100 - panelProgress * 100).toFixed(2)}% 0 round ${lerp(
        999,
        25,
        panelProgress,
      ).toFixed(2)}px)`;
      searchBar.style.opacity = targetProgress.toFixed(4);
      searchBody.style.opacity = bodyProgress.toFixed(4);
      searchBody.style.transform = `translateY(${lerp(-14, 0, bodyProgress).toFixed(2)}px)`;
      searchBody.style.filter = `blur(${lerp(5, 0, bodyProgress).toFixed(2)}px)`;

      const interactive = p > 0.82 && this.searchMotion.target === 1;
      searchBar.classList.toggle("is-interactive", interactive);

      if (this.searchProxy && this.searchGeometry) {
        const { start, end } = this.searchGeometry;
        const proxy = this.searchProxy;
        proxy.style.left = `${lerp(start.left, end.left, travelProgress).toFixed(2)}px`;
        proxy.style.top = `${lerp(start.top, end.top, travelProgress).toFixed(2)}px`;
        proxy.style.width = `${lerp(start.width, end.width, travelProgress).toFixed(2)}px`;
        proxy.style.height = `${lerp(start.height, end.height, travelProgress).toFixed(2)}px`;
        proxy.style.borderRadius = `${lerp(start.height / 2, 25, travelProgress).toFixed(2)}px`;
        proxy.style.opacity = proxyProgress.toFixed(4);
        const press = Math.sin(range(p, 0, 0.16) * Math.PI) * 0.015;
        proxy.style.transform = `scale(${(1 - press).toFixed(4)})`;
        proxy.style.pointerEvents = proxyProgress > 0.15 ? "auto" : "none";
      }
    }

    settleSearch(value) {
      const { searchModal, searchOpen, searchBar, searchInput } = this.elements;
      if (value === 1) {
        searchModal.dataset.phase = "open";
        searchBar.classList.add("is-interactive");
        if (this.searchShouldFocus) requestAnimationFrame(() => searchInput?.focus({ preventScroll: true }));
        this.emitState();
        return;
      }

      searchModal.dataset.phase = "closed";
      searchModal.hidden = true;
      searchOpen.classList.remove("is-morph-source");
      searchBar.classList.remove("is-interactive");
      this.body.classList.remove("search-modal-open");
      this.searchProxy?.remove();
      this.searchProxy = null;
      this.searchGeometry = null;
      if (this.searchRestoreFocus) requestAnimationFrame(() => searchOpen.focus({ preventScroll: true }));
      this.searchRestoreFocus = false;
      this.emitState();
    }

    renderSearchResults(value) {
      const { searchBody } = this.elements;
      const query = normalizeSearchText(value);
      searchBody.replaceChildren();

      if (!query) {
        const empty = document.createElement("div");
        empty.className = "search-empty-state";
        empty.innerHTML = `<span class="search-empty-kicker">课程搜索</span><p>输入章节名称、概念或关键词。</p>`;
        searchBody.append(empty);
        return;
      }

      const candidates = Array.from(document.querySelectorAll("#chapterNav a[data-search-text]"));
      const seen = new Set();
      const matches = candidates
        .filter((link) => normalizeSearchText(link.dataset.searchText).includes(query))
        .filter((link) => {
          const href = link.getAttribute("href");
          if (!href || seen.has(href)) return false;
          seen.add(href);
          return true;
        })
        .slice(0, 8);

      if (!matches.length) {
        const empty = document.createElement("div");
        empty.className = "search-empty-state";
        const kicker = document.createElement("span");
        kicker.className = "search-empty-kicker";
        kicker.textContent = "没有匹配结果";
        const message = document.createElement("p");
        message.textContent = "换一个更短的关键词试试。";
        empty.append(kicker, message);
        searchBody.append(empty);
        return;
      }

      const list = document.createElement("ul");
      list.className = "search-result-list";
      matches.forEach((source, index) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.className = "search-result-link";
        link.href = source.getAttribute("href");

        const mark = document.createElement("span");
        mark.className = "search-result-mark";
        mark.textContent = String(index + 1).padStart(2, "0");
        const label = document.createElement("span");
        label.textContent = source.textContent.replace(/未掌握|已掌握/g, "").trim();
        const arrow = document.createElement("span");
        arrow.className = "search-result-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "›";
        link.append(mark, label, arrow);
        item.append(link);
        list.append(item);
      });
      searchBody.append(list);
    }

    /* Language ---------------------------------------------------------- */

    toggleLanguage(options = {}) {
      if (this.languageMotion.target || this.languageMotion.value > 0.5) this.closeLanguage(options);
      else this.openLanguage(options);
    }

    openLanguage({ focusMenu = false } = {}) {
      if (this.languageMotion.target === 1) return;
      this.closeSearch({ restoreFocus: false });
      this.closeSidebar({ restoreFocus: false });
      this.languageShouldFocus = focusMenu;
      this.languageRestoreFocus = false;
      this.elements.languageControl.dataset.phase = "opening";
      this.elements.languageToggle.setAttribute("aria-expanded", "true");
      this.elements.languageMenu.setAttribute("aria-hidden", "false");
      this.elements.languageMenu.style.visibility = "visible";
      setInert(this.elements.languageMenu, true);
      this.languageMotion.setTarget(1);
      this.emitState();
    }

    closeLanguage({ restoreFocus = false } = {}) {
      if (this.languageMotion.value <= 0.001 && this.languageMotion.target === 0) return;
      this.languageRestoreFocus = restoreFocus;
      this.languageShouldFocus = false;
      this.elements.languageControl.dataset.phase = "closing";
      this.elements.languageToggle.setAttribute("aria-expanded", "false");
      setInert(this.elements.languageMenu, true);
      this.languageMotion.setTarget(0);
      this.emitState();
    }

    renderLanguage(progress) {
      const {
        languageControl,
        languageToggle,
        languageMenu,
        languageHeading,
        languageOptions,
      } = this.elements;
      const p = clamp(progress);
      const geometry = smootherstep(range(p, 0.02, 0.9));
      const startSize = languageControl.getBoundingClientRect().width || 44;
      const menuWidth = Math.min(218, window.innerWidth - 24);
      const menuHeight = 180;

      languageControl.style.setProperty("--language-progress", p.toFixed(4));
      languageMenu.style.width = `${lerp(startSize, menuWidth, geometry).toFixed(2)}px`;
      languageMenu.style.height = `${lerp(startSize, menuHeight, geometry).toFixed(2)}px`;
      languageMenu.style.borderRadius = `${lerp(startSize / 2.8, 22, geometry).toFixed(2)}px`;
      languageMenu.style.opacity = smootherstep(range(p, 0.01, 0.18)).toFixed(4);
      languageHeading.style.opacity = smootherstep(range(p, 0.42, 0.78)).toFixed(4);

      const iconProgress = smoothstep(range(p, 0.08, 0.72));
      const globe = languageToggle.querySelector(".language-globe");
      if (globe) {
        globe.style.transform = `translate(${lerp(0, -1.5, iconProgress).toFixed(2)}px, ${lerp(
          0,
          0.5,
          iconProgress,
        ).toFixed(2)}px) rotate(${lerp(0, 8, iconProgress).toFixed(2)}deg) scale(${lerp(
          1,
          0.9,
          iconProgress,
        ).toFixed(4)})`;
        globe.style.opacity = lerp(1, 0.82, iconProgress).toFixed(4);
      }

      languageOptions.forEach((option, index) => {
        const itemProgress = smootherstep(range(p, 0.34 + index * 0.055, 0.76 + index * 0.055));
        const gatherY = -(index + 1) * 32 + 6;
        option.style.opacity = itemProgress.toFixed(4);
        option.style.transform = `translate(${lerp(26, 0, itemProgress).toFixed(2)}px, ${lerp(
          gatherY,
          0,
          itemProgress,
        ).toFixed(2)}px) scale(${lerp(0.88, 1, itemProgress).toFixed(4)})`;
        option.style.filter = `blur(${lerp(5.5, 0, itemProgress).toFixed(2)}px)`;
      });

      const interactive = p > 0.82 && this.languageMotion.target === 1;
      if (interactive !== this.languageInteractive) {
        this.languageInteractive = interactive;
        setInert(languageMenu, !interactive);
        languageMenu.style.pointerEvents = interactive ? "auto" : "none";
      }
    }

    settleLanguage(value) {
      const { languageControl, languageToggle, languageMenu, languageOptions } = this.elements;
      if (value === 1) {
        languageControl.dataset.phase = "open";
        languageMenu.setAttribute("aria-hidden", "false");
        languageMenu.style.pointerEvents = "auto";
        setInert(languageMenu, false);
        this.languageInteractive = true;
        if (this.languageShouldFocus) {
          const selected = languageOptions.find((option) => option.getAttribute("aria-checked") === "true");
          requestAnimationFrame(() => selected?.focus({ preventScroll: true }));
        }
        this.emitState();
        return;
      }

      languageControl.dataset.phase = "closed";
      languageMenu.setAttribute("aria-hidden", "true");
      languageMenu.style.visibility = "hidden";
      languageMenu.style.pointerEvents = "none";
      setInert(languageMenu, true);
      this.languageInteractive = false;
      if (this.languageRestoreFocus) requestAnimationFrame(() => languageToggle.focus({ preventScroll: true }));
      this.languageRestoreFocus = false;
      this.emitState();
    }

    onLanguageKeydown(event) {
      const options = this.elements.languageOptions;
      const current = Math.max(0, options.indexOf(document.activeElement));
      let next = current;
      if (event.key === "ArrowDown") next = (current + 1) % options.length;
      else if (event.key === "ArrowUp") next = (current - 1 + options.length) % options.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = options.length - 1;
      else return;
      event.preventDefault();
      options[next].focus();
    }

    selectLanguage(language) {
      if (!["zh-CN", "zh-TW", "en"].includes(language)) return;
      this.selectedLanguage = language;
      try {
        localStorage.setItem("la-visual-language", language);
      } catch (_error) {
        // Selection remains valid for the current page even without storage.
      }
      this.syncLanguageSelection();
      this.emitState();
    }

    syncLanguageSelection() {
      this.elements.languageOptions.forEach((option) => {
        option.setAttribute("aria-checked", String(option.dataset.lang === this.selectedLanguage));
      });
    }

    /* Sidebar ----------------------------------------------------------- */

    toggleSidebar(options = {}) {
      if (this.sidebarMotion.target || this.sidebarMotion.value > 0.5) this.closeSidebar(options);
      else this.openSidebar(options);
    }

    openSidebar({ restoreFocus = false } = {}) {
      if (this.sidebarMotion.target === 1) return;
      this.closeLanguage({ restoreFocus: false });
      this.closeSearch({ restoreFocus: false });
      this.sidebarRestoreFocus = restoreFocus;
      this.elements.sidebar.dataset.phase = "opening";
      this.elements.sidebar.setAttribute("aria-hidden", "false");
      this.elements.sidebarToggle.setAttribute("aria-expanded", "true");
      this.elements.sidebarToggle.setAttribute("aria-label", "关闭章节目录");
      this.body.classList.remove("sidebar-collapsed");
      if (this.mobileQuery.matches) {
        this.body.classList.add("sidebar-open", "sidebar-layer-active");
      }
      setInert(this.elements.sidebar, true);
      this.sidebarMotion.setTarget(1);
      if (!this.mobileQuery.matches) this.persistSidebar(false);
      this.emitState();
    }

    closeSidebar({ restoreFocus = false } = {}) {
      if (this.sidebarMotion.value <= 0.001 && this.sidebarMotion.target === 0) return;
      this.sidebarRestoreFocus = restoreFocus;
      this.elements.sidebar.dataset.phase = "closing";
      this.elements.sidebarToggle.setAttribute("aria-expanded", "false");
      this.elements.sidebarToggle.setAttribute("aria-label", "打开章节目录");
      setInert(this.elements.sidebar, true);
      this.sidebarMotion.setTarget(0);
      if (!this.mobileQuery.matches) this.persistSidebar(true);
      this.emitState();
    }

    persistSidebar(collapsed) {
      try {
        localStorage.setItem("la-visual-sidebar", collapsed ? "collapsed" : "open");
      } catch (_error) {
        // The visual state remains usable when storage is unavailable.
      }
    }

    jumpSidebar(target, { persist = false } = {}) {
      if (persist && !this.mobileQuery.matches) this.persistSidebar(!target);
      this.sidebarRestoreFocus = false;
      this.sidebarMotion.jump(target);
    }

    renderSidebar(progress) {
      const {
        sidebarToggle,
        sidebar,
        sidebarSurface,
        sidebarBrand,
        sidebarScroll,
        drawerBackdrop,
        topbarCenter,
        topbarRight,
      } = this.elements;
      const p = clamp(progress);
      const geometry = smootherstep(p);
      const width = sidebar.offsetWidth || 304;
      const left = Number.parseFloat(getComputedStyle(sidebar).left) || 0;
      const travel = width + left + 32;
      const translateX = -travel * (1 - geometry);
      const opacity = smootherstep(range(p, 0.01, 0.24));
      const contentProgress = smootherstep(range(p, 0.18, 0.72));
      const brandProgress = smootherstep(range(p, 0.13, 0.64));

      sidebar.style.transform = `translate3d(${translateX.toFixed(2)}px, 0, 0)`;
      sidebar.style.opacity = opacity.toFixed(4);
      sidebarSurface.style.borderRadius = `${lerp(31, 26, geometry).toFixed(2)}px`;
      sidebarBrand.style.opacity = brandProgress.toFixed(4);
      sidebarBrand.style.transform = `translateX(${lerp(-16, 0, brandProgress).toFixed(2)}px)`;
      sidebarScroll.style.opacity = contentProgress.toFixed(4);
      sidebarScroll.style.transform = `translateX(${lerp(-18, 0, contentProgress).toFixed(2)}px)`;

      const iconProgress = smoothstep(range(p, 0.2, 0.78));
      const lineTransforms = [
        `translateX(${(-0.8 * iconProgress).toFixed(2)}px) scaleX(${(1 - 0.08 * iconProgress).toFixed(4)})`,
        `translateX(${(0.8 * iconProgress).toFixed(2)}px) scaleX(${(1 + 0.08 * iconProgress).toFixed(4)})`,
        `translateX(${(-0.35 * iconProgress).toFixed(2)}px) scaleX(${(1 - 0.04 * iconProgress).toFixed(4)})`,
      ];
      sidebarToggle.querySelectorAll(".menu-line").forEach((line, index) => {
        line.style.transform = lineTransforms[index];
      });
      sidebarToggle.classList.toggle("is-fused", p > 0.72);

      const mobile = this.mobileQuery.matches;
      const backdropProgress = mobile ? smootherstep(range(p, 0.04, 0.58)) : 0;
      drawerBackdrop.style.opacity = (backdropProgress * 0.94).toFixed(4);
      drawerBackdrop.style.visibility = backdropProgress > 0.001 ? "visible" : "hidden";
      drawerBackdrop.style.pointerEvents = backdropProgress > 0.2 ? "auto" : "none";

      [topbarCenter, topbarRight].forEach((element) => {
        if (!element) return;
        if (!mobile) {
          element.style.opacity = "";
          element.style.transform = "";
          element.style.pointerEvents = "";
          return;
        }
        const chromeFade = smootherstep(range(p, 0.04, 0.38));
        element.style.opacity = (1 - chromeFade).toFixed(4);
        element.style.transform = topbarCenter === element
          ? `translateY(${(-7 * chromeFade).toFixed(2)}px)`
          : `translateY(${(-7 * chromeFade).toFixed(2)}px) scale(${lerp(1, 0.96, chromeFade).toFixed(4)})`;
        element.style.pointerEvents = chromeFade > 0.55 ? "none" : "auto";
      });

      const interactive = p > 0.94 && this.sidebarMotion.target === 1;
      if (interactive !== this.sidebarInteractive) {
        this.sidebarInteractive = interactive;
        setInert(sidebar, !interactive);
        sidebar.style.pointerEvents = interactive ? "auto" : "none";
      }

      this.renderSidebarBridge(p, translateX);
    }

    renderSidebarBridge(progress, translateX) {
      const { sidebarToggle, sidebarBridge, sidebar } = this.elements;
      if (!sidebarBridge) return;
      if (this.reducedQuery.matches) {
        sidebarBridge.style.opacity = "0";
        sidebarBridge.style.visibility = "hidden";
        return;
      }

      const p = clamp(progress);
      const enter = smootherstep(range(p, 0.05, 0.3));
      const leave = 1 - smootherstep(range(p, 0.73, 0.98));
      const alpha = enter * leave * 0.92;
      if (alpha < 0.002) {
        sidebarBridge.style.opacity = "0";
        sidebarBridge.style.visibility = "hidden";
        return;
      }

      const buttonRect = sidebarToggle.getBoundingClientRect();
      const computed = getComputedStyle(sidebar);
      const panelLeft = (Number.parseFloat(computed.left) || 0) + translateX;
      const top = buttonRect.top;
      const centerY = buttonRect.top + buttonRect.height / 2;
      const drops = sidebarBridge.querySelectorAll(".sidebar-goo");
      const [toggle, dropA, dropB, dropC] = drops;

      Object.assign(toggle.style, {
        left: `${(buttonRect.left - 2).toFixed(2)}px`,
        top: `${(buttonRect.top - 2).toFixed(2)}px`,
        width: `${(buttonRect.width + 4).toFixed(2)}px`,
        height: `${(buttonRect.height + 4).toFixed(2)}px`,
      });

      const contact = smootherstep(range(p, 0.18, 0.7));
      const buttonCenter = buttonRect.left + buttonRect.width / 2;
      const panelAnchor = panelLeft + 62;
      const positions = [0.3, 0.56, 0.8];
      [dropA, dropB, dropC].forEach((drop, index) => {
        const ratio = positions[index];
        const centerX = lerp(panelAnchor, buttonCenter + 2, ratio * contact + (1 - contact) * ratio * 0.32);
        const size = lerp(34 - index * 3, 24 - index * 2, contact);
        Object.assign(drop.style, {
          left: `${(centerX - size / 2).toFixed(2)}px`,
          top: `${(centerY - size / 2 + (index - 1) * 1.5).toFixed(2)}px`,
          width: `${size.toFixed(2)}px`,
          height: `${size.toFixed(2)}px`,
        });
      });

      sidebarBridge.style.opacity = alpha.toFixed(4);
      sidebarBridge.style.visibility = "visible";
      sidebarBridge.style.setProperty("--sidebar-panel-left", `${panelLeft}px`);
      sidebarBridge.style.setProperty("--sidebar-panel-top", `${top}px`);
    }

    settleSidebar(value) {
      const { sidebar, sidebarToggle, drawerBackdrop, sidebarBridge } = this.elements;
      if (value === 1) {
        sidebar.dataset.phase = "open";
        sidebar.setAttribute("aria-hidden", "false");
        sidebarToggle.setAttribute("aria-expanded", "true");
        sidebarToggle.setAttribute("aria-label", "关闭章节目录");
        setInert(sidebar, false);
        sidebar.style.pointerEvents = "auto";
        this.sidebarInteractive = true;
        if (this.mobileQuery.matches) this.body.classList.add("sidebar-open", "sidebar-layer-active");
        this.emitState();
        return;
      }

      sidebar.dataset.phase = "closed";
      sidebar.setAttribute("aria-hidden", "true");
      sidebarToggle.setAttribute("aria-expanded", "false");
      sidebarToggle.setAttribute("aria-label", "打开章节目录");
      setInert(sidebar, true);
      sidebar.style.pointerEvents = "none";
      this.sidebarInteractive = false;
      this.body.classList.remove("sidebar-open", "sidebar-layer-active");
      if (!this.mobileQuery.matches) this.body.classList.add("sidebar-collapsed");
      drawerBackdrop.style.visibility = "hidden";
      drawerBackdrop.style.pointerEvents = "none";
      sidebarBridge.style.visibility = "hidden";
      if (this.sidebarRestoreFocus) requestAnimationFrame(() => sidebarToggle.focus({ preventScroll: true }));
      this.sidebarRestoreFocus = false;
      this.emitState();
    }

    closeForRouteChange() {
      this.closeSearch({ restoreFocus: false });
      this.closeLanguage({ restoreFocus: false });
      if (this.mobileQuery.matches) this.closeSidebar({ restoreFocus: false });
    }
  }

  window.createChromeMotionController = () => new ChromeMotionController();
})();
