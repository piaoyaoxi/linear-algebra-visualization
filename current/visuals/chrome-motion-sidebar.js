(() => {
  "use strict";

  const { setInert } = window.__ChromeMotion;
  const { ChromeMotionController } = window.__ChromeMotion;

  Object.assign(ChromeMotionController.prototype, {
    toggleSidebar(options = {}) {
      if (this.sidebarMotion.target || this.sidebarMotion.value > 0.5) this.closeSidebar(options);
      else this.openSidebar(options);
    },

    openSidebar({ restoreFocus = false, persist = true } = {}) {
      if (this.sidebarMotion.target === 1) return;
      this.pendingLanguage = null;
      this.closeLanguage({ restoreFocus: false });
      this.closeSearch({ restoreFocus: false, skipMerge: true });
      this.sidebarRestoreFocus = restoreFocus;
      this.elements.sidebar.dataset.phase = "opening";
      this.elements.sidebar.setAttribute("aria-hidden", "false");
      this.elements.sidebarToggle.setAttribute("aria-expanded", "true");
      this.elements.sidebarToggle.setAttribute("aria-label", "关闭章节目录");
      this.body.classList.remove("sidebar-collapsed");
      this.body.classList.add("sidebar-panel-active");
      if (this.mobileQuery.matches) this.body.classList.add("sidebar-open", "sidebar-layer-active");
      setInert(this.elements.sidebar, true);
      this.sidebarMotion.setTarget(1);
      if (persist && !this.mobileQuery.matches) this.persistSidebar(false);
      this.emitState();
    },

    closeSidebar({ restoreFocus = false, persist = true } = {}) {
      if (this.sidebarMotion.value <= 0.001 && this.sidebarMotion.target === 0) return;
      this.sidebarRestoreFocus = restoreFocus;
      this.elements.sidebar.dataset.phase = "closing";
      this.elements.sidebarToggle.setAttribute("aria-expanded", "false");
      this.elements.sidebarToggle.setAttribute("aria-label", "打开章节目录");
      this.body.classList.remove("sidebar-panel-active");
      setInert(this.elements.sidebar, true);
      this.sidebarMotion.setTarget(0);
      if (persist && !this.mobileQuery.matches) this.persistSidebar(true);
      this.emitState();
    },

    persistSidebar(collapsed) {
      try {
        localStorage.setItem("la-visual-sidebar", collapsed ? "collapsed" : "open");
      } catch (_error) {
        // The visual state remains usable without storage.
      }
    },

    jumpSidebar(target, { persist = false } = {}) {
      if (persist && !this.mobileQuery.matches) this.persistSidebar(!target);
      this.sidebarRestoreFocus = false;
      this.sidebarMotion.jump(target);
    }
  });
})();
(() => {
  "use strict";

  const { clamp, lerp, range, smoothstep, smootherstep, px, setInert } = window.__ChromeMotion;
  const { ChromeMotionController } = window.__ChromeMotion;

  Object.assign(ChromeMotionController.prototype, {
    renderSidebar(progress, raw, target) {
      const {
        sidebarToggle,
        sidebar,
        sidebarBrand,
        sidebarScroll,
        drawerBackdrop,
        topbarCenter,
        topbarRight,
      } = this.elements;
      const p = clamp(progress);
      const geometry = smootherstep(p);
      const overshoot = clamp(raw - 1, -0.05, 0.05);
      const translateX = -112 * (1 - geometry) + overshoot * 3;
      const opacity = smootherstep(range(p, 0.01, 0.18));
      const brandProgress = smootherstep(range(p, 0.48, 0.82));
      const contentProgress = smootherstep(range(p, 0.58, 0.9));

      sidebar.style.transform = `translate3d(${px(translateX)}%, 0, 0)`;
      sidebar.style.opacity = opacity.toFixed(4);
      sidebarBrand.style.opacity = brandProgress.toFixed(4);
      sidebarBrand.style.transform = `translateX(${px(lerp(-12, 0, brandProgress))}px)`;
      sidebarScroll.style.opacity = contentProgress.toFixed(4);
      sidebarScroll.style.transform = `translateX(${px(lerp(-14, 0, contentProgress))}px)`;

      const iconProgress = smoothstep(range(p, 0.28, 0.78));
      const lineTransforms = [
        `translateX(${px(-0.65 * iconProgress)}px) scaleX(${(1 - 0.055 * iconProgress).toFixed(4)})`,
        `translateX(${px(0.7 * iconProgress)}px) scaleX(${(1 + 0.07 * iconProgress).toFixed(4)})`,
        `translateX(${px(-0.3 * iconProgress)}px) scaleX(${(1 - 0.035 * iconProgress).toFixed(4)})`,
      ];
      sidebarToggle.querySelectorAll(".menu-line").forEach((line, index) => {
        line.style.transform = lineTransforms[index];
      });

      const mobile = this.mobileQuery.matches;
      const backdropProgress = mobile ? smootherstep(range(p, 0.04, 0.55)) : 0;
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
        const chromeFade = smootherstep(range(p, 0.04, 0.36));
        element.style.opacity = (1 - chromeFade).toFixed(4);
        element.style.transform = `translateY(${px(-7 * chromeFade)}px) scale(${lerp(1, 0.97, chromeFade).toFixed(4)})`;
        element.style.pointerEvents = chromeFade > 0.55 ? "none" : "auto";
      });

      const interactive = p > 0.94 && target === 1;
      if (interactive !== this.sidebarInteractive) {
        this.sidebarInteractive = interactive;
        setInert(sidebar, !interactive);
        sidebar.style.pointerEvents = interactive ? "auto" : "none";
      }

    },

    settleSidebar(value) {
      const { sidebar, sidebarToggle, drawerBackdrop, topbarCenter, topbarRight } = this.elements;
      if (value === 1) {
        this.body.classList.add("sidebar-panel-active");
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
      this.body.classList.remove("sidebar-panel-active");
      if (!this.mobileQuery.matches) this.body.classList.add("sidebar-collapsed");
      drawerBackdrop.style.visibility = "hidden";
      drawerBackdrop.style.pointerEvents = "none";
      [topbarCenter, topbarRight].forEach((element) => {
        if (!element) return;
        element.style.removeProperty("opacity");
        element.style.removeProperty("transform");
        element.style.removeProperty("pointer-events");
      });
      if (this.sidebarRestoreFocus) requestAnimationFrame(() => sidebarToggle.focus({ preventScroll: true }));
      this.sidebarRestoreFocus = false;
      this.emitState();
    },

    closeForRouteChange() {
      this.closeSearch({ restoreFocus: false, skipMerge: true });
      this.pendingLanguage = null;
      this.closeLanguage({ restoreFocus: false });
      if (this.mobileQuery.matches) this.closeSidebar({ restoreFocus: false, persist: false });
    }
  });
})();
