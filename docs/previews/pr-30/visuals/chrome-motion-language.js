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
      this.body.classList.add("language-layer-active");
      this.elements.languageControl.dataset.phase = "opening";
      this.elements.languageToggle.setAttribute("aria-expanded", "true");
      this.elements.languageMenu.setAttribute("aria-hidden", "false");
      this.elements.languageMenu.style.visibility = "visible";
      setInert(this.elements.languageMenu, true);
      this.languageClosedSize = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--chrome-control-size"),
      ) || 44;
      this.languageMotion.setTarget(1);
      this.emitState();
    },

    closeLanguage({ restoreFocus = false } = {}) {
      if (this.languageMotion.value <= 0.001 && this.languageMotion.target === 0) return;
      this.languageRestoreFocus = restoreFocus;
      this.languageShouldFocus = false;
      this.body.classList.remove("language-layer-active");
      this.elements.languageControl.dataset.phase = "closing";
      this.elements.languageToggle.setAttribute("aria-expanded", "false");
      setInert(this.elements.languageMenu, true);
      this.languageMotion.setTarget(0);
      this.emitState();
    },

    renderLanguage(progress, raw, target) {
      const { languageControl, languageToggle, languageMenu, languageOptions } = this.elements;
      const p = clamp(progress);
      const geometry = smootherstep(range(p, 0.01, 0.74));
      const startSize = this.languageClosedSize || 44;
      const menuWidth = 178;
      const menuHeight = 68;
      const overshoot = clamp(raw - 1, -0.05, 0.05);
      const scaleX = Math.max(0.1, lerp(startSize / menuWidth, 1, geometry) + overshoot * 0.025);
      const scaleY = Math.max(0.1, lerp(startSize / menuHeight, 1, geometry) + overshoot * 0.035);
      const visualRadius = lerp(15, 20, geometry);

      languageControl.style.setProperty("--language-progress", p.toFixed(4));
      languageControl.style.setProperty("--language-overshoot", overshoot.toFixed(4));
      languageMenu.style.transform = `scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`;
      languageMenu.style.borderRadius = `${px(visualRadius / scaleX)}px / ${px(visualRadius / scaleY)}px`;
      languageMenu.style.opacity = "1";

      const iconProgress = smootherstep(range(p, 0.12, 0.5));
      const globe = languageToggle.querySelector(".language-globe");
      if (globe) {
        globe.style.transform = `rotate(${px(lerp(0, -12, iconProgress))}deg) scale(${lerp(1, 0.86, iconProgress).toFixed(4)})`;
        globe.style.opacity = lerp(1, 0.62, iconProgress).toFixed(4);
      }

      languageOptions.forEach((option, index) => {
        const itemProgress = smootherstep(range(p, 0.36 + index * 0.04, 0.74 + index * 0.04));
        option.style.opacity = itemProgress.toFixed(4);
        option.style.transform = `translateX(${px(lerp(14, 0, itemProgress))}px) scale(${lerp(0.94, 1, itemProgress).toFixed(4)})`;
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
      this.body.classList.remove("language-layer-active");
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
      if (language !== "zh-CN") return;
      this.selectedLanguage = language;
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
