(() => {
  "use strict";

  const { clamp } = window.__ChromeMotion;
  const { ChromeMotionController } = window.__ChromeMotion;

  Object.assign(ChromeMotionController.prototype, {
    bindLiquidPointerLight() {
      const bind = (element) => {
        element.addEventListener(
          "pointermove",
          (event) => {
            const rect = element.getBoundingClientRect();
            const x = clamp((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
            const y = clamp((event.clientY - rect.top) / Math.max(1, rect.height)) * 100;
            element.style.setProperty("--liquid-pointer-x", `${x.toFixed(1)}%`);
            element.style.setProperty("--liquid-pointer-y", `${y.toFixed(1)}%`);
          },
          { passive: true },
        );
        element.addEventListener(
          "pointerleave",
          () => {
            element.style.removeProperty("--liquid-pointer-x");
            element.style.removeProperty("--liquid-pointer-y");
          },
          { passive: true },
        );
      };

      document.querySelectorAll(".liquid-control").forEach(bind);
      this.bindPointerLightTo = bind;
    },

    initializeSidebar() {
      const shouldOpen = !this.mobileQuery.matches && !this.body.classList.contains("sidebar-collapsed");
      this.sidebarMotion.value = shouldOpen ? 1 : 0;
      this.sidebarMotion.target = this.sidebarMotion.value;
      this.renderSidebar(this.sidebarMotion.value, this.sidebarMotion.value, this.sidebarMotion.target);
      this.settleSidebar(this.sidebarMotion.value);
    },

    scheduleResize() {
      if (this.resizeFrame) return;
      this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = 0;
        const nowMobile = this.mobileQuery.matches;
        if (nowMobile !== this.lastViewportMobile) {
          this.lastViewportMobile = nowMobile;
          if (nowMobile) this.jumpSidebar(0, { persist: false });
          else {
            let collapsed = this.body.classList.contains("sidebar-collapsed");
            try {
              const stored = localStorage.getItem("la-visual-sidebar");
              if (stored === "collapsed") collapsed = true;
              else if (stored === "open") collapsed = false;
            } catch (_error) {
              // Keep the in-memory class state in privacy-restricted contexts.
            }
            this.jumpSidebar(collapsed ? 0 : 1, { persist: false });
          }
        } else if (this.sidebarMotion.value > 0.001) {
          this.renderSidebar(this.sidebarMotion.value, this.sidebarMotion.value, this.sidebarMotion.target);
        }

        if (this.searchMotion.value > 0.001) {
          this.measureSearch();
          this.renderSearch(this.searchMotion.value, this.searchMotion.value, this.searchMotion.target);
        }
      });
    },

    onDocumentKeydown(event) {
      if (event.key === "Escape") {
        if (this.searchMotion.value > 0.001 || this.searchMotion.target) {
          event.preventDefault();
          this.closeSearch({ restoreFocus: true, focusVisible: true });
          return;
        }
        if (this.languageMotion.value > 0.001 || this.languageMotion.target) {
          event.preventDefault();
          this.pendingLanguage = null;
          this.closeLanguage({ restoreFocus: true });
          return;
        }
        if (this.mobileQuery.matches && (this.sidebarMotion.value > 0.001 || this.sidebarMotion.target)) {
          event.preventDefault();
          this.closeSidebar({ restoreFocus: true, persist: false });
        }
        return;
      }

      if (event.key === "Tab" && this.searchMotion.value > 0.98) this.trapSearchFocus(event);
      if (event.key === "Tab" && this.mobileQuery.matches && this.sidebarMotion.value > 0.98) {
        this.trapSidebarFocus(event);
      }
    },

    trapSearchFocus(event) {
      const focusable = [
        ...this.elements.searchCapsuleOpen.querySelectorAll("input:not([disabled]), button:not([disabled])"),
        ...this.elements.searchPanel.querySelectorAll("a[href]"),
      ].filter((element) => !element.hasAttribute("inert") && element.tabIndex >= 0);
      this.cycleFocus(event, focusable);
    },

    trapSidebarFocus(event) {
      const focusable = [
        this.elements.sidebarToggle,
        ...this.elements.sidebar.querySelectorAll("a[href], button:not([disabled])"),
      ];
      this.cycleFocus(event, focusable);
    },

    cycleFocus(event, focusable) {
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
    },

    emitState() {
      window.dispatchEvent(new CustomEvent("la-chromestatechange", { detail: this.getState() }));
    },

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
  });
})();
