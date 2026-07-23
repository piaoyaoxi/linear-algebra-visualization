(() => {
  "use strict";

  const { clamp, lerp, range, smoothstep, smootherstep, px, normalizeSearchText, setInert } = window.__ChromeMotion;
  const { ChromeMotionController } = window.__ChromeMotion;

  const REFERENCE_OPEN_GAP = 10;
  const REFERENCE_CLOSED_GAP = -56;
  const REFERENCE_TOP_HEIGHT = 80;
  const REFERENCE_GAP_SCALE = 1.4;
  const REFERENCE_OPEN_TRAVEL = REFERENCE_TOP_HEIGHT + REFERENCE_OPEN_GAP * REFERENCE_GAP_SCALE;

  const appendHighlightedText = (element, value, rawQuery) => {
    const text = String(value || "");
    const query = String(rawQuery || "").trim();
    if (!query) {
      element.textContent = text;
      return;
    }

    const haystack = text.toLocaleLowerCase("zh-CN");
    const needle = query.toLocaleLowerCase("zh-CN");
    let cursor = 0;
    let matchAt = haystack.indexOf(needle);
    if (matchAt < 0) {
      element.textContent = text;
      return;
    }

    while (matchAt >= 0) {
      if (matchAt > cursor) element.append(document.createTextNode(text.slice(cursor, matchAt)));
      const mark = document.createElement("mark");
      mark.textContent = text.slice(matchAt, matchAt + query.length);
      element.append(mark);
      cursor = matchAt + query.length;
      matchAt = haystack.indexOf(needle, cursor);
    }
    if (cursor < text.length) element.append(document.createTextNode(text.slice(cursor)));
  };

  const topMorphPath = (x, y, width, height, bow) => {
    const radius = height / 2;
    const right = x + width;
    const bottom = y + height;
    const straightSpan = Math.max(0, width - radius * 2);
    const curveInset = straightSpan * 0.22;
    const curveStart = right - radius - curveInset;
    const curveEnd = x + radius + curveInset;
    const curveWidth = Math.max(0, curveStart - curveEnd);
    const curveDepth = bow * 4 / 3;
    return [
      `M ${x + radius} ${y}`,
      `H ${right - radius}`,
      `A ${radius} ${radius} 0 0 1 ${right - radius} ${bottom}`,
      `H ${curveStart}`,
      `C ${curveStart - curveWidth / 3} ${bottom + curveDepth}, ${curveEnd + curveWidth / 3} ${bottom + curveDepth}, ${curveEnd} ${bottom}`,
      `H ${x + radius}`,
      `A ${radius} ${radius} 0 0 1 ${x + radius} ${y}`,
      "Z",
    ].join(" ");
  };

  const resultsMorphPath = (x, y, width, height, bow) => {
    const radius = Math.min(height / 2, width / 2);
    const right = x + width;
    const bottom = y + height;
    const straightSpan = Math.max(0, width - radius * 2);
    const curveInset = straightSpan * 0.22;
    const curveStart = x + radius + curveInset;
    const curveEnd = right - radius - curveInset;
    const curveWidth = Math.max(0, curveEnd - curveStart);
    const curveDepth = bow * 4 / 3;
    return [
      `M ${x + radius} ${y}`,
      `H ${curveStart}`,
      `C ${curveStart + curveWidth / 3} ${y - curveDepth}, ${curveEnd - curveWidth / 3} ${y - curveDepth}, ${curveEnd} ${y}`,
      `H ${right - radius}`,
      `A ${radius} ${radius} 0 0 1 ${right} ${y + radius}`,
      `V ${bottom - radius}`,
      `A ${radius} ${radius} 0 0 1 ${right - radius} ${bottom}`,
      `H ${x + radius}`,
      `A ${radius} ${radius} 0 0 1 ${x} ${bottom - radius}`,
      `V ${y + radius}`,
      `A ${radius} ${radius} 0 0 1 ${x + radius} ${y}`,
      "Z",
    ].join(" ");
  };

  const referenceMorphGeometry = (progress) => {
    const gap = lerp(REFERENCE_CLOSED_GAP, REFERENCE_OPEN_GAP, progress);
    const extension = Math.max(0, REFERENCE_TOP_HEIGHT + gap * REFERENCE_GAP_SCALE);
    const absorption = smoothstep(range(extension, 18, 38));
    const shoulder = 8 * Math.exp(-Math.pow((gap + 27) / 6, 2));
    const y = ((extension * absorption + shoulder) / REFERENCE_OPEN_TRAVEL) * 66;
    const pull = Math.max(0, gap - REFERENCE_OPEN_GAP);
    return {
      gap,
      y,
      bow: Math.min(6, pull * 0.95),
      mergeMask: 1 - smoothstep(range(gap, -44, -24)),
    };
  };

  Object.assign(ChromeMotionController.prototype, {
    toggleSearch(options = {}) {
      const phase = this.elements.searchModal.dataset.phase || "closed";
      if (phase !== "closed" || this.searchMotion.target || this.searchMotion.value > 0.52) this.closeSearch(options);
      else this.openSearch(options);
    },

    openSearch({ focusInput = true } = {}) {
      const phase = this.elements.searchModal.dataset.phase || "closed";
      if (phase !== "closed" || this.searchMotion.target === 1) return;
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

    closeSearch({ restoreFocus = false, focusVisible = false, skipMerge = false } = {}) {
      const phase = this.elements.searchModal.dataset.phase || "closed";
      if (phase === "closed" && this.searchMotion.value <= 0.001 && this.searchMotion.target === 0) return;
      if ((phase === "merging" || phase === "returning") && !skipMerge) return;

      this.searchRestoreFocus = restoreFocus;
      this.searchRestoreFocusVisible = focusVisible;
      this.searchShouldFocus = false;
      this.elements.searchOpen.setAttribute("aria-expanded", "false");
      this.elements.searchInput?.blur();
      this.setSearchCapsuleInteraction(false);

      const query = normalizeSearchText(this.elements.searchInput?.value);
      const hasResultsSurface = this.searchResultsMotion.target === 1 || this.searchResultsMotion.value > 0.015;
      if (!skipMerge && query && hasResultsSurface) {
        this.elements.searchModal.dataset.phase = "merging";
        this.elements.searchModal.dataset.resultsPhase = "merging";
        setInert(this.elements.searchResultsPanel, true);
        this.searchResultsInteractive = false;
        this.elements.searchResultsPanel.style.pointerEvents = "none";
        this.searchResultsMotion.setTarget(0);
        this.emitState();
        return;
      }

      this.beginSearchReturn();
    },

    beginSearchReturn() {
      if ((this.elements.searchModal.dataset.phase || "closed") === "closed") return;
      this.elements.searchModal.dataset.phase = "returning";
      this.elements.searchOpen.setAttribute("aria-expanded", "false");
      this.setSearchCapsuleInteraction(false);
      if (this.searchResultsMotion.value > 0.001 || this.searchResultsMotion.target) {
        setInert(this.elements.searchResultsPanel, true);
        this.searchResultsMotion.setTarget(0);
      }
      this.searchMotion.setTarget(0);
      this.emitState();
    },

    setSearchCapsuleInteraction(interactive) {
      const { searchCapsuleOpen, searchInput, searchClose } = this.elements;
      searchCapsuleOpen.classList.toggle("is-interactive", interactive);
      searchCapsuleOpen.setAttribute("aria-hidden", interactive ? "false" : "true");
      if (interactive) {
        searchInput?.removeAttribute("tabindex");
        searchClose?.removeAttribute("tabindex");
      } else {
        searchInput?.setAttribute("tabindex", "-1");
        searchClose?.setAttribute("tabindex", "-1");
      }
    },

    mountSearch() {
      const { searchModal, searchOpen, searchBody, searchResultsPanel } = this.elements;
      searchModal.hidden = false;
      searchModal.dataset.phase = "opening";
      searchModal.dataset.resultsPhase = "closed";
      this.body.classList.add("search-modal-open");
      searchOpen.classList.remove("is-interactive");
      searchOpen.setAttribute("tabindex", "-1");
      this.setSearchCapsuleInteraction(false);
      searchBody.replaceChildren();
      searchResultsPanel.setAttribute("aria-hidden", "true");
      setInert(searchResultsPanel, true);
      this.measureSearch();
      this.searchResultsMotion.jump(0);
    },

    measureSearch() {
      const { searchCapsule, searchBar, searchPanel, searchResultsPanel } = this.elements;
      const sourceHost = searchCapsule.parentElement;
      const hostRect = sourceHost?.getBoundingClientRect();
      const panelRect = searchPanel.getBoundingClientRect();
      const sourceWidth = hostRect?.width || searchCapsule.offsetWidth || 1;
      const sourceHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--chrome-control-size")) || 44;
      const sourceLeft = hostRect?.left ?? searchCapsule.offsetLeft;
      const sourceTop = hostRect?.top ?? searchCapsule.offsetTop;
      this.searchGeometry = {
        start: {
          left: sourceLeft,
          top: sourceTop,
          width: sourceWidth,
          height: sourceHeight,
        },
        end: searchBar.getBoundingClientRect(),
        panelWidth: panelRect.width,
        resultsHeight: searchResultsPanel.getBoundingClientRect().height || 344,
      };
    },

    renderSearch(progress, raw, target) {
      const { searchCapsule, searchOpen, searchCapsuleOpen, searchBackdrop } = this.elements;
      const p = clamp(progress);
      if (p <= 0 && this.elements.searchModal.hidden) return;
      if (!this.searchGeometry) this.measureSearch();

      const backdropProgress = smootherstep(range(p, 0.01, 0.3));
      const travelProgress = smootherstep(range(p, 0.02, 0.54));
      const closedContentProgress = 1 - smootherstep(range(p, 0.18, 0.48));
      const openContentProgress = smootherstep(range(p, 0.38, 0.62));
      const overshoot = target === 1 ? clamp(raw - 1, -0.05, 0.05) : 0;

      searchBackdrop.style.opacity = backdropProgress.toFixed(4);
      searchOpen.style.setProperty("--search-closed-content-opacity", closedContentProgress.toFixed(4));
      searchCapsuleOpen.style.opacity = openContentProgress.toFixed(4);

      const phase = this.elements.searchModal.dataset.phase || "closed";
      const interactive = p > 0.88 && target === 1 && (phase === "opening" || phase === "open");
      searchOpen.classList.toggle("is-interactive", !interactive && p < 0.12);
      if (!interactive) searchCapsuleOpen.classList.remove("is-interactive");

      if (searchCapsule && this.searchGeometry) {
        const { start, end } = this.searchGeometry;
        const dx = lerp(0, end.left - start.left, travelProgress);
        const dy = lerp(0, end.top - start.top, travelProgress);
        const press = target === 1 ? Math.sin(range(p, 0, 0.16) * Math.PI) * 0.008 : 0;
        const pulse = 1 - press + overshoot * 0.08;
        const width = lerp(start.width, end.width, travelProgress) * pulse;
        const height = lerp(start.height, end.height, travelProgress) * pulse;
        searchCapsule.style.width = `${px(width)}px`;
        searchCapsule.style.height = `${px(height)}px`;
        searchCapsule.style.transform = `translate3d(${px(dx)}px, ${px(dy)}px, 0)`;
      }
    },

    settleSearch(value) {
      const {
        searchModal,
        searchCapsule,
        searchOpen,
        searchCapsuleOpen,
        searchInput,
        searchClose,
        searchBody,
      } = this.elements;
      if (value === 1) {
        searchModal.dataset.phase = "open";
        searchOpen.classList.remove("is-interactive");
        this.setSearchCapsuleInteraction(true);
        if (this.searchShouldFocus && !this.mobileQuery.matches) {
          requestAnimationFrame(() => searchInput?.focus({ preventScroll: true }));
        }
        this.emitState();
        return;
      }

      if (this.searchResultsMotion.value > 0.001 || this.searchResultsMotion.target) this.searchResultsMotion.jump(0);
      searchModal.dataset.phase = "closed";
      searchModal.dataset.resultsPhase = "closed";
      searchModal.hidden = true;
      searchCapsule.style.removeProperty("width");
      searchCapsule.style.removeProperty("height");
      searchCapsule.style.removeProperty("transform");
      searchOpen.style.removeProperty("--liquid-pointer-x");
      searchOpen.style.removeProperty("--liquid-pointer-y");
      searchOpen.style.removeProperty("--search-closed-content-opacity");
      searchOpen.classList.add("is-interactive");
      searchOpen.removeAttribute("tabindex");
      searchCapsuleOpen.classList.remove("is-interactive");
      searchCapsuleOpen.setAttribute("aria-hidden", "true");
      searchCapsuleOpen.style.removeProperty("opacity");
      searchInput.value = "";
      searchInput.setAttribute("tabindex", "-1");
      searchClose?.setAttribute("tabindex", "-1");
      searchBody.replaceChildren();
      this.body.classList.remove("search-modal-open");
      this.searchGeometry = null;
      if (this.searchRestoreFocus) {
        const suppressFocusRing = !this.searchRestoreFocusVisible;
        if (suppressFocusRing) searchOpen.classList.add("is-pointer-focus-return");
        else searchOpen.classList.remove("is-pointer-focus-return");
        requestAnimationFrame(() => searchOpen.focus({ preventScroll: true }));
      }
      this.searchRestoreFocus = false;
      this.searchRestoreFocusVisible = false;
      this.emitState();
    },

    setSearchResultsTarget(open) {
      const { searchModal, searchResultsPanel } = this.elements;
      if (open) {
        searchResultsPanel.setAttribute("aria-hidden", "false");
        searchModal.dataset.resultsPhase = this.searchResultsMotion.value > 0.985 ? "open" : "opening";
        if (this.searchResultsMotion.target !== 1) this.searchResultsMotion.setTarget(1);
        return;
      }

      setInert(searchResultsPanel, true);
      searchResultsPanel.setAttribute("aria-hidden", "true");
      this.searchResultsInteractive = false;
      searchResultsPanel.style.pointerEvents = "none";
      if (searchModal.dataset.phase !== "merging") searchModal.dataset.resultsPhase = "closing";
      if (this.searchResultsMotion.target !== 0 || this.searchResultsMotion.value > 0.001) {
        this.searchResultsMotion.setTarget(0);
      } else {
        searchModal.dataset.resultsPhase = "closed";
      }
    },

    renderSearchResultsMotion(progress, raw, target) {
      const { searchResultsPanel, searchBody, searchMergeField } = this.elements;
      const p = clamp(progress);
      const resultsHeight = this.searchGeometry?.resultsHeight || searchResultsPanel.offsetHeight || 344;
      const panelWidth = this.searchGeometry?.panelWidth || this.elements.searchPanel.offsetWidth || 590;
      const motionProgress = clamp(raw / 0.84);
      const geometry = referenceMorphGeometry(motionProgress);
      const travelProgress = Math.pow(smootherstep(motionProgress), 1.55);
      const resultTopY = lerp(0, 66, travelProgress);
      const translateY = resultTopY - 66;
      const expandProgress = smootherstep(range(p, 0.5, 0.99));
      const visibleHeight = lerp(56, resultsHeight, expandProgress);
      const clippedBottom = Math.max(0, resultsHeight - visibleHeight);
      const visualRadius = lerp(28, 23, expandProgress);
      const bodyProgress = smootherstep(range(p, 0.52, 0.99));

      searchResultsPanel.style.visibility = p > 0.001 ? "visible" : "hidden";
      searchResultsPanel.style.opacity = p > 0.001 ? "1" : "0";
      searchResultsPanel.style.clipPath = `inset(0 0 ${px(clippedBottom)}px 0 round ${px(visualRadius)}px)`;
      searchResultsPanel.style.transform = `translateY(${px(translateY)}px)`;
      searchBody.style.opacity = bodyProgress.toFixed(4);
      searchBody.style.transform = `translateY(${px(lerp(7, 0, bodyProgress))}px)`;

      const fusionEnter = smootherstep(range(p, 0.01, 0.35));
      const fusionRelease = 1 - smootherstep(range(p, 0.55, 0.9));
      const unifiedMerge = fusionEnter * fusionRelease;
      searchResultsPanel.style.setProperty("--search-surface-merge", unifiedMerge.toFixed(4));
      searchResultsPanel.style.setProperty("--search-unified-merge", unifiedMerge.toFixed(4));
      this.elements.searchOpen.style.setProperty("--search-surface-merge", unifiedMerge.toFixed(4));
      this.elements.searchOpen.style.setProperty("--search-unified-merge", unifiedMerge.toFixed(4));

      this.searchLiquidBlobs ||= {
        top: searchMergeField.querySelector(".search-liquid-top-blob"),
        results: searchMergeField.querySelector(".search-liquid-results-blob"),
      };
      searchMergeField.setAttribute("viewBox", `0 0 ${px(panelWidth)} 132`);
      this.searchLiquidBlobs.top?.setAttribute("d", topMorphPath(0, 0, panelWidth, 56, geometry.bow));
      this.searchLiquidBlobs.results?.setAttribute(
        "d",
        resultsMorphPath(0, resultTopY, panelWidth, 56, geometry.bow),
      );
      searchMergeField.style.opacity = unifiedMerge.toFixed(4);

      const interactive = p > 0.94 && target === 1 && this.elements.searchModal.dataset.phase === "open";
      if (interactive !== this.searchResultsInteractive) {
        this.searchResultsInteractive = interactive;
        setInert(searchResultsPanel, !interactive);
        searchResultsPanel.style.pointerEvents = interactive ? "auto" : "none";
      }
    },

    settleSearchResults(value) {
      const { searchModal, searchResultsPanel, searchBody, searchInput } = this.elements;
      if (value === 1) {
        if (searchModal.dataset.phase === "merging" || searchModal.dataset.phase === "returning") return;
        searchModal.dataset.resultsPhase = "open";
        searchResultsPanel.setAttribute("aria-hidden", "false");
        setInert(searchResultsPanel, false);
        searchResultsPanel.style.pointerEvents = "auto";
        this.searchResultsInteractive = true;
        this.emitState();
        return;
      }

      searchModal.dataset.resultsPhase = "closed";
      searchResultsPanel.setAttribute("aria-hidden", "true");
      setInert(searchResultsPanel, true);
      searchResultsPanel.style.pointerEvents = "none";
      this.searchResultsInteractive = false;
      if (searchModal.dataset.phase === "merging") {
        requestAnimationFrame(() => requestAnimationFrame(() => this.beginSearchReturn()));
      } else {
        if (!normalizeSearchText(searchInput?.value)) searchBody.replaceChildren();
        this.emitState();
      }
    },

    renderSearchResults(value) {
      const { searchBody } = this.elements;
      const query = normalizeSearchText(value);

      if (!query) {
        this.setSearchResultsTarget(false);
        return;
      }

      searchBody.replaceChildren();
      searchBody.scrollTop = 0;

      const response = window.AlgebraSearch?.search(value) || { total: 0, results: [] };
      const header = document.createElement("div");
      header.className = "search-results-header";
      const count = document.createElement("div");
      count.className = "search-results-count";
      const countStrong = document.createElement("strong");
      countStrong.textContent = String(response.total);
      count.append(countStrong, document.createTextNode(" 个结果"));
      const context = document.createElement("div");
      context.className = "search-results-context";
      context.textContent = response.total > response.results.length ? `显示前 ${response.results.length} 项` : "全课程内容";
      header.append(count, context);
      searchBody.append(header);

      if (!response.results.length) {
        const empty = document.createElement("div");
        empty.className = "search-empty-state";
        const kicker = document.createElement("span");
        kicker.className = "search-empty-kicker";
        kicker.textContent = "没有匹配结果";
        const hint = document.createElement("p");
        hint.textContent = "换一个更短的概念或关键词试试。";
        empty.append(kicker, hint);
        searchBody.append(empty);
        this.setSearchResultsTarget(true);
        return;
      }

      const groups = new Map();
      response.results.forEach((result) => {
        if (!groups.has(result.chapterId)) groups.set(result.chapterId, []);
        groups.get(result.chapterId).push(result);
      });

      const groupContainer = document.createElement("div");
      groupContainer.className = "search-result-groups";
      groups.forEach((results) => {
        const group = document.createElement("section");
        group.className = "search-result-group";
        const heading = document.createElement("h3");
        heading.className = "search-result-group-heading";
        const headingText = document.createElement("span");
        appendHighlightedText(headingText, results[0].chapterTitle, value);
        const headingCount = document.createElement("small");
        headingCount.textContent = `${results.length} 项`;
        heading.append(headingText, headingCount);

        const list = document.createElement("ul");
        list.className = "search-result-list";
        results.forEach((result) => {
          const item = document.createElement("li");
          const link = document.createElement("a");
          link.className = "search-result-link";
          link.href = result.href;

          const copy = document.createElement("span");
          copy.className = "search-result-copy";
          const title = document.createElement("strong");
          title.className = "search-result-title";
          appendHighlightedText(title, result.title, value);

          const breadcrumb = document.createElement("span");
          breadcrumb.className = "search-result-breadcrumb";
          appendHighlightedText(breadcrumb, result.chapterTitle, value);
          if (result.sectionTitle && result.sectionTitle !== "章节导览") {
            breadcrumb.append(document.createTextNode(" / "));
            appendHighlightedText(
              breadcrumb,
              `${result.sectionNumber ? `${result.sectionNumber} ` : ""}${result.sectionTitle}`,
              value,
            );
          }
          copy.append(title, breadcrumb);

          if (result.snippet && normalizeSearchText(result.snippet) !== normalizeSearchText(result.title)) {
            const snippet = document.createElement("span");
            snippet.className = "search-result-snippet";
            appendHighlightedText(snippet, result.snippet, value);
            copy.append(snippet);
          }

          const arrow = document.createElement("span");
          arrow.className = "search-result-arrow";
          arrow.setAttribute("aria-hidden", "true");
          arrow.textContent = "↵";
          link.append(copy, arrow);
          item.append(link);
          list.append(item);
        });

        group.append(heading, list);
        groupContainer.append(group);
      });
      searchBody.append(groupContainer);
      this.setSearchResultsTarget(true);
    },
  });
})();
