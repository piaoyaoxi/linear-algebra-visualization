(() => {
  "use strict";

  const { clamp, lerp, range, smootherstep, px, setInert } = window.__ChromeMotion;
  const { ChromeMotionController } = window.__ChromeMotion;

  Object.assign(ChromeMotionController.prototype, {
    toggleLanguage(options = {}) {
      if (this.languageMotion.target || this.languageMotion.value > 0.5) {
        this.pendingLanguage = null;
        this.closeLanguage(options);
      } else this.openLanguage(options);
    },

    openLanguage({ focusMenu = false } = {}) {
      if (this.languageMotion.target === 1) return;
      this.closeSearch({ restoreFocus: false });
      if (this.mobileQuery.matches) this.closeSidebar({ restoreFocus: false, persist: false });
      this.languageShouldFocus = focusMenu;
      this.languageRestoreFocus = false;
      this.pendingLanguage = null;
      this.elements.languageControl.dataset.phase = "opening";
      this.elements.languageToggle.setAttribute("aria-expanded", "true");
      this.elements.languageMenu.setAttribute("aria-hidden", "false");
      this.elements.languageMenu.style.visibility = "visible";
      setInert(this.elements.languageMenu, true);
      this.languageMotion.setTarget(1);
      this.emitState();
    },

    closeLanguage({ restoreFocus = false } = {}) {
      if (this.languageMotion.value <= 0.001 && this.languageMotion.target === 0) return;
      this.languageRestoreFocus = restoreFocus;
      this.languageShouldFocus = false;
      this.elements.languageControl.dataset.phase = "closing";
      this.elements.languageToggle.setAttribute("aria-expanded", "false");
      setInert(this.elements.languageMenu, true);
      this.languageMotion.setTarget(0);
      this.emitState();
    },

    renderLanguage(progress, raw, target) {
      const { languageControl, languageToggle, languageMenu, languageOptions } = this.elements;
      const p = clamp(progress);
      const geometry = smootherstep(range(p, 0.01, 0.76));
      const startSize = 44;
      const menuWidth = Math.min(206, window.innerWidth - 24);
      const menuHeight = 145;
      const overshoot = clamp(raw - 1, -0.05, 0.05);

      languageControl.style.setProperty("--language-progress", p.toFixed(4));
      languageControl.style.setProperty("--language-overshoot", overshoot.toFixed(4));
      languageMenu.style.width = `${px(lerp(startSize, menuWidth, geometry) + overshoot * 18)}px`;
      languageMenu.style.height = `${px(lerp(startSize, menuHeight, geometry) + overshoot * 10)}px`;
      languageMenu.style.borderRadius = `${px(lerp(15, 23, geometry) - overshoot * 10)}px`;
      languageMenu.style.opacity = "1";

      const iconProgress = smootherstep(range(p, 0.12, 0.54));
      const globe = languageToggle.querySelector(".language-globe");
      if (globe) {
        globe.style.transform = `translate(${px(lerp(0, -15, iconProgress))}px, ${px(lerp(0, 14, iconProgress))}px) rotate(${px(lerp(0, -12, iconProgress))}deg) scale(${lerp(1, 0.58, iconProgress).toFixed(4)})`;
        globe.style.opacity = (1 - iconProgress).toFixed(4);
        globe.style.filter = `blur(${px(lerp(0, 4.5, iconProgress))}px)`;
      }

      languageOptions.forEach((option, index) => {
        const itemProgress = smootherstep(range(p, 0.24 + index * 0.045, 0.66 + index * 0.045));
        const gatherY = -(index * 40 + 47);
        option.style.opacity = itemProgress.toFixed(4);
        option.style.transform = `translate(${px(lerp(38, 0, itemProgress))}px, ${px(lerp(gatherY, 0, itemProgress))}px) scale(${lerp(0.84, 1, itemProgress).toFixed(4)})`;
        option.style.filter = `blur(${px(lerp(6.5, 0, itemProgress))}px)`;
      });

      if (target === 0 && this.pendingLanguage && p < 0.31) {
        this.commitLanguage(this.pendingLanguage);
        this.pendingLanguage = null;
      }

      const interactive = p > 0.84 && target === 1;
      if (interactive !== this.languageInteractive) {
        this.languageInteractive = interactive;
        setInert(languageMenu, !interactive);
        languageMenu.style.pointerEvents = interactive ? "auto" : "none";
      }
    },

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

      if (this.pendingLanguage) {
        this.commitLanguage(this.pendingLanguage);
        this.pendingLanguage = null;
      }
      languageControl.dataset.phase = "closed";
      languageMenu.setAttribute("aria-hidden", "true");
      languageMenu.style.pointerEvents = "none";
      setInert(languageMenu, true);
      this.languageInteractive = false;
      if (this.languageRestoreFocus) requestAnimationFrame(() => languageToggle.focus({ preventScroll: true }));
      this.languageRestoreFocus = false;
      this.emitState();
    },

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
    },

    commitLanguage(language) {
      if (!["zh-CN", "zh-TW", "en"].includes(language)) return;
      this.selectedLanguage = language;
      try {
        localStorage.setItem("la-visual-language", language);
      } catch (_error) {
        // The selection still remains valid for the current page.
      }
      this.syncLanguageSelection();
      this.emitState();
    },

    syncLanguageSelection() {
      this.elements.languageOptions.forEach((option) => {
        option.setAttribute("aria-checked", String(option.dataset.lang === this.selectedLanguage));
      });
    }
  });
})();
