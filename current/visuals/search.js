/*
 * Course search: the top-bar capsule travels to the search position, then a
 * liquid results surface is emitted from behind it and unfolds downward.
 * Clearing the query or closing reverses the same phases.
 *
 * Spring constants, morph geometry and result rendering come from the
 * Liquid Glass draft (PR #30); this module drives search on its own.
 */
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
  const px = (value) => Number(value.toFixed(2));
  const normalize = (value) =>
    String(value || "")
      .toLocaleLowerCase("zh-CN")
      .replace(/\s+/g, "");
  const setInert = (element, inert) => {
    if (!element) return;
    if (inert) element.setAttribute("inert", "");
    else element.removeAttribute("inert");
  };

  class ReversibleSpring {
    constructor({ openFrequency, closeFrequency, openDamping, closeDamping, onUpdate, onSettle }) {
      this.value = 0;
      this.target = 0;
      this.velocity = 0;
      this.openFrequency = openFrequency;
      this.closeFrequency = closeFrequency;
      this.openDamping = openDamping;
      this.closeDamping = closeDamping;
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
      this.onUpdate?.(this.value, this.value, this.target);
      this.onSettle?.(this.value);
    }

    tick(now) {
      if (!this.lastTime) this.lastTime = now;
      let remaining = Math.min(0.12, Math.max(0.001, (now - this.lastTime) / 1000));
      this.lastTime = now;
      const opening = this.target === 1;
      const omega = opening ? this.openFrequency : this.closeFrequency;
      const damping = opening ? this.openDamping : this.closeDamping;
      while (remaining > 0) {
        const dt = Math.min(1 / 120, remaining);
        const acceleration = (this.target - this.value) * omega * omega - 2 * damping * omega * this.velocity;
        this.velocity += acceleration * dt;
        this.value += this.velocity * dt;
        remaining -= dt;
      }
      this.onUpdate?.(clamp(this.value), this.value, this.target);
      if (Math.abs(this.target - this.value) < 0.0018 && Math.abs(this.velocity) < 0.02) {
        this.value = this.target;
        this.velocity = 0;
        this.frame = 0;
        this.lastTime = 0;
        this.onUpdate?.(this.value, this.value, this.target);
        this.onSettle?.(this.value);
        return;
      }
      this.frame = requestAnimationFrame(this.tick);
    }
  }

  const REFERENCE_OPEN_GAP = 10;
  const REFERENCE_CLOSED_GAP = -56;
  const REFERENCE_TOP_HEIGHT = 80;
  const REFERENCE_GAP_SCALE = 1.4;
  const REFERENCE_OPEN_TRAVEL = REFERENCE_TOP_HEIGHT + REFERENCE_OPEN_GAP * REFERENCE_GAP_SCALE;

  const topMorphPath = (x, y, width, height, bow) => {
    const radius = height / 2;
    const right = x + width;
    const bottom = y + height;
    const straightSpan = Math.max(0, width - radius * 2);
    const curveInset = straightSpan * 0.22;
    const curveStart = right - radius - curveInset;
    const curveEnd = x + radius + curveInset;
    const curveWidth = Math.max(0, curveStart - curveEnd);
    const curveDepth = (bow * 4) / 3;
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
    const curveDepth = (bow * 4) / 3;
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
    return { y, bow: Math.min(6, pull * 0.95) };
  };

  const appendHighlightedText = (element, value, rawQuery) => {
    const text = String(value || "");
    const query = String(rawQuery || "").trim();
    const haystack = text.toLocaleLowerCase("zh-CN");
    const needle = query.toLocaleLowerCase("zh-CN");
    let matchAt = query ? haystack.indexOf(needle) : -1;
    if (matchAt < 0) {
      element.textContent = text;
      return;
    }
    let cursor = 0;
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

  class CourseSearch {
    constructor() {
      this.body = document.body;
      this.mobileQuery = window.matchMedia("(max-width: 920px)");
      this.pointerFineQuery = window.matchMedia("(pointer: fine)");
      const modal = document.querySelector("#searchModal");
      this.el = {
        capsule: document.querySelector("#searchCapsule"),
        open: document.querySelector("#searchOpen"),
        capsuleOpen: document.querySelector("#searchCapsule .search-capsule-open"),
        modal,
        backdrop: modal?.querySelector(".search-modal-backdrop"),
        panel: modal?.querySelector(".search-modal-panel"),
        anchor: modal?.querySelector(".search-modal-bar-anchor"),
        mergeField: modal?.querySelector(".search-results-merge-field"),
        results: modal?.querySelector(".search-results-panel"),
        resultsBody: modal?.querySelector(".search-modal-body"),
        input: document.querySelector("#searchModalInput"),
        close: document.querySelector("#searchCloseButton"),
      };
      if (Object.values(this.el).some((element) => !element)) return;

      this.geometry = null;
      this.shouldFocus = false;
      this.restoreFocus = false;
      this.restoreFocusVisible = false;
      this.resultsInteractive = false;
      this.blobs = {
        top: this.el.mergeField.querySelector(".search-liquid-top-blob"),
        results: this.el.mergeField.querySelector(".search-liquid-results-blob"),
      };

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.motion = new ReversibleSpring({
        openFrequency: reduced ? 48 : 19.5,
        closeFrequency: reduced ? 50 : 21,
        openDamping: reduced ? 1 : 0.92,
        closeDamping: reduced ? 1 : 0.97,
        onUpdate: (value, raw, target) => this.render(value, raw, target),
        onSettle: (value) => this.settle(value),
      });
      this.resultsMotion = new ReversibleSpring({
        openFrequency: reduced ? 50 : 8.6,
        closeFrequency: reduced ? 52 : 9.4,
        openDamping: reduced ? 1 : 0.86,
        closeDamping: reduced ? 1 : 0.9,
        onUpdate: (value, raw, target) => this.renderResultsMotion(value, raw, target),
        onSettle: (value) => this.settleResults(value),
      });

      this.bind();
      this.setCapsuleInteraction(false);
      this.el.open.classList.add("is-interactive");
    }

    get phase() {
      return this.el.modal.dataset.phase || "closed";
    }

    set phase(value) {
      this.el.modal.dataset.phase = value;
    }

    bind() {
      const { open, input, modal } = this.el;
      open.addEventListener("click", (event) => {
        this.toggle({ focusInput: event.detail === 0 || this.pointerFineQuery.matches });
      });
      open.addEventListener("blur", () => open.classList.remove("is-pointer-focus-return"));
      document.querySelectorAll("[data-search-close]").forEach((element) => {
        element.addEventListener("click", (event) => this.close({ restoreFocus: true, focusVisible: event.detail === 0 }));
      });
      input.addEventListener("input", () => this.renderResults(input.value));
      modal.addEventListener("click", (event) => {
        if (event.target.closest?.(".search-result-link")) this.close({ skipMerge: true });
      });
      document.addEventListener("keydown", (event) => this.onKeydown(event));
      window.addEventListener("resize", () => this.onResize(), { passive: true });
      window.addEventListener("la-themestart", () => this.close({ skipMerge: true }));
    }

    onKeydown(event) {
      const active = this.motion.value > 0.001 || this.motion.target;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (active) this.el.input.focus();
        else this.open({ focusInput: true });
        return;
      }
      if (!active) return;
      if (event.key === "Escape") {
        event.preventDefault();
        this.close({ restoreFocus: true, focusVisible: true });
        return;
      }
      if (event.key === "Tab" && this.motion.value > 0.98) this.trapFocus(event);
    }

    // The capsule lives in the top bar and the results at the end of the
    // page, so Tab order is managed here: input, close, then each result.
    trapFocus(event) {
      const focusable = [
        ...this.el.capsuleOpen.querySelectorAll("input:not([disabled]), button:not([disabled])"),
        ...this.el.panel.querySelectorAll("a[href]"),
      ].filter((element) => !element.closest("[inert]") && element.tabIndex >= 0);
      if (!focusable.length) return;
      event.preventDefault();
      const index = focusable.indexOf(document.activeElement);
      const step = event.shiftKey ? -1 : 1;
      const next = index < 0 ? (event.shiftKey ? focusable.length - 1 : 0) : (index + step + focusable.length) % focusable.length;
      focusable[next].focus();
    }

    onResize() {
      if (this.resizeFrame) return;
      this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = 0;
        if (this.motion.value <= 0.001) return;
        this.measure();
        this.pinCapsule();
        this.render(this.motion.value, this.motion.value, this.motion.target);
        this.renderResultsMotion(this.resultsMotion.value, this.resultsMotion.value, this.resultsMotion.target);
      });
    }

    toggle(options = {}) {
      if (this.phase !== "closed" || this.motion.target || this.motion.value > 0.52) this.close({ restoreFocus: true });
      else this.open(options);
    }

    open({ focusInput = true } = {}) {
      if (this.phase !== "closed" || this.motion.target === 1) return;
      if (this.mobileQuery.matches && this.body.classList.contains("sidebar-open")) {
        document.querySelector("#drawerBackdrop")?.click();
      }
      this.shouldFocus = focusInput;
      this.restoreFocus = false;
      this.mount();
      this.el.open.setAttribute("aria-expanded", "true");
      this.motion.setTarget(1);
    }

    close({ restoreFocus = false, focusVisible = false, skipMerge = false } = {}) {
      const phase = this.phase;
      if (phase === "closed" && this.motion.value <= 0.001 && this.motion.target === 0) return;
      if ((phase === "merging" || phase === "returning") && !skipMerge) return;

      this.restoreFocus = restoreFocus;
      this.restoreFocusVisible = focusVisible;
      this.shouldFocus = false;
      this.el.open.setAttribute("aria-expanded", "false");
      this.el.input.blur();
      this.setCapsuleInteraction(false);

      const hasResultsSurface = this.resultsMotion.target === 1 || this.resultsMotion.value > 0.015;
      if (!skipMerge && normalize(this.el.input.value) && hasResultsSurface) {
        this.phase = "merging";
        this.el.modal.dataset.resultsPhase = "merging";
        this.setResultsInert(true);
        this.resultsMotion.setTarget(0);
        return;
      }
      this.beginReturn();
    }

    beginReturn() {
      if (this.phase === "closed") return;
      this.phase = "returning";
      this.setCapsuleInteraction(false);
      if (this.resultsMotion.value > 0.001 || this.resultsMotion.target) {
        this.setResultsInert(true);
        this.resultsMotion.setTarget(0);
      }
      this.motion.setTarget(0);
    }

    setResultsInert(inert) {
      setInert(this.el.results, inert);
      this.resultsInteractive = !inert;
      this.el.results.style.pointerEvents = inert ? "none" : "auto";
    }

    setCapsuleInteraction(interactive) {
      const { capsuleOpen, input, close } = this.el;
      capsuleOpen.classList.toggle("is-interactive", interactive);
      capsuleOpen.setAttribute("aria-hidden", interactive ? "false" : "true");
      if (interactive) {
        input.removeAttribute("tabindex");
        close.removeAttribute("tabindex");
      } else {
        input.setAttribute("tabindex", "-1");
        close.setAttribute("tabindex", "-1");
      }
    }

    mount() {
      const { modal, open, resultsBody, results } = this.el;
      modal.hidden = false;
      this.phase = "opening";
      modal.dataset.resultsPhase = "closed";
      this.body.classList.add("search-modal-open");
      open.classList.remove("is-interactive");
      open.setAttribute("tabindex", "-1");
      this.setCapsuleInteraction(false);
      resultsBody.replaceChildren();
      results.setAttribute("aria-hidden", "true");
      this.setResultsInert(true);
      this.measure();
      this.pinCapsule();
      this.resultsMotion.jump(0);
    }

    // Take the capsule out of the centred flex flow so growing its width does
    // not move its layout box; all travel then comes from the transform.
    pinCapsule() {
      const { capsule } = this.el;
      const { start } = this.geometry;
      capsule.style.position = "fixed";
      capsule.style.left = `${px(start.left)}px`;
      capsule.style.top = `${px(start.top)}px`;
      capsule.style.width = `${px(start.width)}px`;
      capsule.style.height = `${px(start.height)}px`;
    }

    measure() {
      const { capsule, anchor, panel, results } = this.el;
      // Read the capsule's resting box: drop the motion styles for one
      // synchronous layout read (no paint happens in between).
      const saved = capsule.getAttribute("style");
      capsule.removeAttribute("style");
      const home = capsule.getBoundingClientRect();
      if (saved) capsule.setAttribute("style", saved);
      this.geometry = {
        start: { left: home.left, top: home.top, width: home.width, height: home.height },
        end: anchor.getBoundingClientRect(),
        panelWidth: panel.getBoundingClientRect().width,
        resultsHeight: results.getBoundingClientRect().height || 344,
      };
    }

    render(progress, raw, target) {
      const { capsule, open, capsuleOpen, backdrop, modal } = this.el;
      const p = clamp(progress);
      if (p <= 0 && modal.hidden) return;
      if (!this.geometry) this.measure();

      const backdropProgress = smootherstep(range(p, 0.01, 0.3));
      const travelProgress = smootherstep(range(p, 0.02, 0.54));
      const closedContentProgress = 1 - smootherstep(range(p, 0.18, 0.48));
      const openContentProgress = smootherstep(range(p, 0.38, 0.62));
      const overshoot = target === 1 ? clamp(raw - 1, -0.05, 0.05) : 0;

      backdrop.style.opacity = backdropProgress.toFixed(4);
      open.style.setProperty("--search-closed-content-opacity", closedContentProgress.toFixed(4));
      capsuleOpen.style.opacity = openContentProgress.toFixed(4);
      open.style.setProperty("--search-open-progress", travelProgress.toFixed(4));

      const interactive = p > 0.88 && target === 1 && (this.phase === "opening" || this.phase === "open");
      open.classList.toggle("is-interactive", !interactive && p < 0.12);
      if (!interactive) capsuleOpen.classList.remove("is-interactive");

      const { start, end } = this.geometry;
      const press = target === 1 ? Math.sin(range(p, 0, 0.16) * Math.PI) * 0.008 : 0;
      const pulse = 1 - press + overshoot * 0.08;
      capsule.style.width = `${px(lerp(start.width, end.width, travelProgress) * pulse)}px`;
      capsule.style.height = `${px(lerp(start.height, end.height, travelProgress) * pulse)}px`;
      capsule.style.transform = `translate3d(${px(lerp(0, end.left - start.left, travelProgress))}px, ${px(
        lerp(0, end.top - start.top, travelProgress),
      )}px, 0)`;
    }

    settle(value) {
      const { modal, capsule, open, capsuleOpen, input, resultsBody } = this.el;
      if (value === 1) {
        this.phase = "open";
        open.classList.remove("is-interactive");
        this.setCapsuleInteraction(true);
        if (this.shouldFocus) requestAnimationFrame(() => input.focus({ preventScroll: true }));
        return;
      }

      if (this.resultsMotion.value > 0.001 || this.resultsMotion.target) this.resultsMotion.jump(0);
      this.phase = "closed";
      modal.dataset.resultsPhase = "closed";
      modal.hidden = true;
      capsule.removeAttribute("style");
      open.style.removeProperty("--search-closed-content-opacity");
      open.style.removeProperty("--search-open-progress");
      open.classList.add("is-interactive");
      open.removeAttribute("tabindex");
      capsuleOpen.classList.remove("is-interactive");
      capsuleOpen.setAttribute("aria-hidden", "true");
      capsuleOpen.style.removeProperty("opacity");
      input.value = "";
      this.setCapsuleInteraction(false);
      resultsBody.replaceChildren();
      this.body.classList.remove("search-modal-open");
      this.geometry = null;
      if (this.restoreFocus) {
        open.classList.toggle("is-pointer-focus-return", !this.restoreFocusVisible);
        requestAnimationFrame(() => open.focus({ preventScroll: true }));
      }
      this.restoreFocus = false;
      this.restoreFocusVisible = false;
    }

    setResultsTarget(openResults) {
      const { modal, results } = this.el;
      if (openResults) {
        results.setAttribute("aria-hidden", "false");
        modal.dataset.resultsPhase = this.resultsMotion.value > 0.985 ? "open" : "opening";
        if (this.resultsMotion.target !== 1) this.resultsMotion.setTarget(1);
        return;
      }
      this.setResultsInert(true);
      results.setAttribute("aria-hidden", "true");
      if (this.phase !== "merging") modal.dataset.resultsPhase = "closing";
      if (this.resultsMotion.target !== 0 || this.resultsMotion.value > 0.001) this.resultsMotion.setTarget(0);
      else modal.dataset.resultsPhase = "closed";
    }

    renderResultsMotion(progress, raw, target) {
      const { results, resultsBody, mergeField, open } = this.el;
      const p = clamp(progress);
      const resultsHeight = this.geometry?.resultsHeight || results.offsetHeight || 344;
      const panelWidth = this.geometry?.panelWidth || this.el.panel.offsetWidth || 590;

      // 1. a capsule leaves from behind the fixed upper capsule;
      // 2. it settles 10px below it;
      // 3. only then does it grow downward and reveal its content.
      const detachProgress = smootherstep(range(p, 0.02, 0.58));
      const geometry = referenceMorphGeometry(detachProgress);
      const resultTopY = geometry.y;
      const expandProgress = smootherstep(range(p, 0.58, 0.92));
      const visibleHeight = lerp(56, resultsHeight, expandProgress);
      const clippedBottom = Math.max(0, resultsHeight - visibleHeight);
      const clippedTop = Math.max(0, 56 - resultTopY);
      const radius = lerp(28, 23, expandProgress);
      const bodyProgress = smootherstep(range(p, 0.86, 0.995));

      results.style.visibility = p > 0.001 ? "visible" : "hidden";
      results.style.opacity = p > 0.001 ? "1" : "0";
      results.style.clipPath = `inset(${px(clippedTop)}px 0 ${px(clippedBottom)}px 0 round ${px(radius)}px)`;
      results.style.transform = `translateY(${px(resultTopY - 66)}px)`;
      resultsBody.style.opacity = bodyProgress.toFixed(4);
      resultsBody.style.transform = `translateY(${px(lerp(7, 0, bodyProgress))}px)`;

      const fusionEnter = smootherstep(range(detachProgress, 0.01, 0.16));
      const fusionRelease = 1 - smootherstep(range(detachProgress, 0.58, 0.96));
      const merge = fusionEnter * fusionRelease;
      results.style.setProperty("--search-surface-merge", merge.toFixed(4));
      results.style.setProperty("--search-edge-opacity", (1 - merge).toFixed(4));
      open.style.setProperty("--search-edge-opacity", (1 - merge * 0.76).toFixed(4));

      mergeField.setAttribute("viewBox", `0 0 ${px(panelWidth)} 132`);
      this.blobs.top?.setAttribute("d", topMorphPath(0, 0, panelWidth, 56, geometry.bow));
      this.blobs.results?.setAttribute("d", resultsMorphPath(0, resultTopY, panelWidth, 56, geometry.bow));
      mergeField.style.opacity = (merge * 0.82).toFixed(4);

      const interactive = p > 0.94 && target === 1 && this.phase === "open";
      if (interactive !== this.resultsInteractive) this.setResultsInert(!interactive);
    }

    settleResults(value) {
      const { modal, results, resultsBody, input } = this.el;
      if (value === 1) {
        if (this.phase === "merging" || this.phase === "returning") return;
        modal.dataset.resultsPhase = "open";
        results.setAttribute("aria-hidden", "false");
        this.setResultsInert(false);
        return;
      }
      modal.dataset.resultsPhase = "closed";
      results.setAttribute("aria-hidden", "true");
      this.setResultsInert(true);
      if (this.phase === "merging") {
        requestAnimationFrame(() => requestAnimationFrame(() => this.beginReturn()));
      } else if (!normalize(input.value)) {
        resultsBody.replaceChildren();
      }
    }

    renderResults(value) {
      const { resultsBody } = this.el;
      if (!normalize(value)) {
        this.setResultsTarget(false);
        return;
      }

      resultsBody.replaceChildren();
      resultsBody.scrollTop = 0;
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
      resultsBody.append(header);

      if (!response.results.length) {
        const empty = document.createElement("div");
        empty.className = "search-empty-state";
        const kicker = document.createElement("span");
        kicker.className = "search-empty-kicker";
        kicker.textContent = "没有匹配结果";
        const hint = document.createElement("p");
        hint.textContent = "换一个更短的概念或关键词试试。";
        empty.append(kicker, hint);
        resultsBody.append(empty);
        this.setResultsTarget(true);
        return;
      }

      const groups = new Map();
      response.results.forEach((result) => {
        if (!groups.has(result.chapterId)) groups.set(result.chapterId, []);
        groups.get(result.chapterId).push(result);
      });

      const container = document.createElement("div");
      container.className = "search-result-groups";
      groups.forEach((items) => {
        const group = document.createElement("section");
        group.className = "search-result-group";
        const heading = document.createElement("h3");
        heading.className = "search-result-group-heading";
        const headingText = document.createElement("span");
        appendHighlightedText(headingText, items[0].chapterTitle, value);
        const headingCount = document.createElement("small");
        headingCount.textContent = `${items.length} 项`;
        heading.append(headingText, headingCount);

        const list = document.createElement("ul");
        list.className = "search-result-list";
        items.forEach((result) => {
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
          if (result.snippet && normalize(result.snippet) !== normalize(result.title)) {
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
        container.append(group);
      });
      resultsBody.append(container);
      this.setResultsTarget(true);
    }
  }

  const init = () => {
    window.__courseSearch = new CourseSearch();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
