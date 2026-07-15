(() => {
  "use strict";

  const { clamp, lerp, range, smootherstep, px, normalizeSearchText } = window.__ChromeMotion;
  const { ChromeMotionController } = window.__ChromeMotion;

  Object.assign(ChromeMotionController.prototype, {
    toggleSearch(options = {}) {
      if (this.searchMotion.target || this.searchMotion.value > 0.52) this.closeSearch(options);
      else this.openSearch(options);
    },

    openSearch({ focusInput = true } = {}) {
      if (this.searchMotion.target === 1) return;
      this.pendingLanguage = null;
      this.closeLanguage({ restoreFocus: false });
      if (this.mobileQuery.matches) this.closeSidebar({ restoreFocus: false, persist: false });
      this.searchShouldFocus = focusInput;
      this.searchRestoreFocus = false;
      this.mountSearch();
      this.elements.searchModal.dataset.phase = "opening";
      this.elements.searchOpen.setAttribute("aria-expanded", "true");
      this.searchMotion.setTarget(1);
      this.emitState();
    },

    closeSearch({ restoreFocus = false } = {}) {
      if (this.searchMotion.value <= 0.001 && this.searchMotion.target === 0) return;
      this.searchRestoreFocus = restoreFocus;
      this.searchShouldFocus = false;
      this.elements.searchModal.dataset.phase = "closing";
      this.elements.searchOpen.setAttribute("aria-expanded", "false");
      this.elements.searchInput?.blur();
      this.searchMotion.setTarget(0);
      this.emitState();
    },

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
        this.positionSearchProxy();
      }
    },

    measureSearch() {
      const { searchOpen, searchBar, searchPanel } = this.elements;
      this.searchGeometry = {
        start: searchOpen.getBoundingClientRect(),
        end: searchBar.getBoundingClientRect(),
        panelHeight: searchPanel.getBoundingClientRect().height || 410,
      };
      this.positionSearchProxy();
    },

    positionSearchProxy() {
      if (!this.searchProxy || !this.searchGeometry) return;
      const { start } = this.searchGeometry;
      this.searchProxy.style.left = `${px(start.left)}px`;
      this.searchProxy.style.top = `${px(start.top)}px`;
      this.searchProxy.style.width = `${px(start.width)}px`;
      this.searchProxy.style.height = `${px(start.height)}px`;
    },

    renderSearch(progress, raw, target) {
      const { searchBackdrop, searchPanel, searchBar, searchBody } = this.elements;
      const p = clamp(progress);
      if (p <= 0 && !this.searchProxy) return;
      if (!this.searchGeometry) this.measureSearch();

      const backdropProgress = smootherstep(range(p, 0.01, 0.3));
      const travelProgress = smootherstep(range(p, 0.015, 0.6));
      const shellProgress = smootherstep(range(p, 0.57, 0.72));
      const bodyGrow = smootherstep(range(p, 0.7, 0.96));
      const bodyContent = smootherstep(range(p, 0.79, 0.98));
      const proxyProgress = 1 - smootherstep(range(p, 0.65, 0.78));
      const targetProgress = smootherstep(range(p, 0.69, 0.8));
      const panelHeight = this.searchGeometry?.panelHeight || 410;
      const visibleHeight = lerp(56, panelHeight, bodyGrow);
      const overshoot = clamp(raw - 1, -0.05, 0.05);

      searchBackdrop.style.opacity = backdropProgress.toFixed(4);
      searchPanel.style.opacity = shellProgress.toFixed(4);
      searchPanel.style.clipPath = `inset(0 0 ${px(Math.max(0, panelHeight - visibleHeight))}px 0 round ${px(lerp(28, 25, bodyGrow))}px)`;
      searchPanel.style.transform = `translate3d(-50%, ${px(lerp(4, 0, shellProgress) + overshoot * 22)}px, 0) scale(${(1 + overshoot * 0.12).toFixed(4)})`;
      searchBar.style.opacity = targetProgress.toFixed(4);
      searchBody.style.opacity = bodyContent.toFixed(4);
      searchBody.style.transform = `translateY(${px(lerp(-10, 0, bodyContent))}px)`;

      const interactive = p > 0.88 && target === 1;
      searchBar.classList.toggle("is-interactive", interactive);

      if (this.searchProxy && this.searchGeometry) {
        const { start, end } = this.searchGeometry;
        const proxy = this.searchProxy;
        const dx = lerp(0, end.left - start.left, travelProgress);
        const dy = lerp(0, end.top - start.top, travelProgress);
        const scaleX = lerp(1, end.width / Math.max(1, start.width), travelProgress);
        const scaleY = lerp(1, end.height / Math.max(1, start.height), travelProgress);
        proxy.style.opacity = proxyProgress.toFixed(4);
        const press = Math.sin(range(p, 0, 0.16) * Math.PI) * 0.014;
        const pulse = 1 - press + overshoot * 0.08;
        const renderedScaleX = Math.max(0.01, scaleX * pulse);
        const renderedScaleY = Math.max(0.01, scaleY * pulse);
        const visualRadius = lerp(start.height / 2, 28, travelProgress);
        proxy.style.borderRadius = `${px(visualRadius / renderedScaleX)}px / ${px(visualRadius / renderedScaleY)}px`;
        proxy.style.transform = `translate3d(${px(dx)}px, ${px(dy)}px, 0) scale(${renderedScaleX.toFixed(4)}, ${renderedScaleY.toFixed(4)})`;
        proxy.style.pointerEvents = proxyProgress > 0.16 ? "auto" : "none";
      }
    },

    settleSearch(value) {
      const { searchModal, searchOpen, searchBar, searchInput } = this.elements;
      if (value === 1) {
        searchModal.dataset.phase = "open";
        searchBar.classList.add("is-interactive");
        if (this.searchShouldFocus && !this.mobileQuery.matches) {
          requestAnimationFrame(() => searchInput?.focus({ preventScroll: true }));
        }
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
    },

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
        empty.innerHTML = `<span class="search-empty-kicker">没有匹配结果</span><p>换一个更短的关键词试试。</p>`;
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
  });
})();
