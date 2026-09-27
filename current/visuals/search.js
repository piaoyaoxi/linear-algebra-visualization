/*
 * Course search: the top-bar capsule travels to the search position, then the
 * results grow out of it as one continuous glass body and pinch off into their
 * own panel. Clearing the query or closing runs the same shape in reverse.
 *
 * One glass surface draws the capsule, the bridge and the results panel, so
 * there is never a seam or a second material between them. The capsule
 * element only carries the input; spring constants and result rendering come
 * from the Liquid Glass draft (PR #30).
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

  /*
   * The search body is one outline: the capsule on top, the results panel
   * below and, while they are joined, a bridge between them.
   *
   *   grow  - the panel lengthens out of the capsule while still fused, so it
   *           is already recognisably the results panel before it separates;
   *   sep   - the corners round again, a gap opens from both sides towards
   *           the middle and the last bridge pinches into two short tips
   *           that are drawn back into each body.
   *
   * All values are continuous in `s`, so reversing the spring retraces the
   * same shapes: the panel rejoins the capsule, then shortens into it.
   */
  const FUSED_RADIUS = 0;

  const liquidShape = (capsule, panel, s, stretch) => {
    const { left: L, top: ty, width: W, height: hc } = capsule;
    const R = L + W;
    const cx = L + W / 2;
    const tb = ty + hc;
    const rt = hc / 2;
    const gap = Math.max(0, panel.top - tb);

    const grow = smootherstep(range(s, 0, 0.72));
    const h = panel.height * grow * (1 + stretch * 1.6);
    const sep = smootherstep(range(s, 0.46, 0.98));
    const round = smootherstep(range(sep, 0, 0.8));
    const up = smoothstep(range(h, 0, 40));

    const rtb = lerp(rt, lerp(FUSED_RADIUS, rt, round), up);
    const wb = lerp(W - 2 * rt, W, up);
    const bl = cx - wb / 2;
    const br = cx + wb / 2;
    const rbb = Math.min(panel.radius, h / 2, wb / 2);
    const rbt = Math.max(0, Math.min(lerp(FUSED_RADIUS * up, panel.radius, round), h - rbb, wb / 2));
    const g = gap * smoothstep(range(sep, 0, 0.6));
    const yt = tb + g;
    const yb = yt + h;
    const mid = tb + g / 2;

    // Bridge: waist half-width m, flaring to e where it meets both bodies.
    const edge = Math.max(0, Math.min(W / 2 - rtb, wb / 2 - rbt));
    const flare = Math.min(edge, g * 1.6);
    const zip = smootherstep(range(sep, 0.08, 0.84));
    const pinched = zip >= 1;
    const tipScale = pinched ? 1 - smoothstep(range(sep, 0.84, 1)) : 1;
    const m = pinched ? 0 : (edge - flare) * (1 - zip);
    const e = pinched ? flare * tipScale : m + flare;
    const tip = (g / 2) * tipScale;
    const spread = (e - m) * 0.35;

    const path = (ox = 0, oy = 0) => {
      const x = (value) => px(value - ox);
      const y = (value) => px(value - oy);
      const arc = (r, toX, toY) => `A ${px(r)} ${px(r)} 0 0 1 ${x(toX)} ${y(toY)}`;
      const top = [
        `M ${x(L + rt)} ${y(ty)}`,
        `H ${x(R - rt)}`,
        arc(rt, R, ty + rt),
        `V ${y(Math.max(ty + rt, tb - rtb))}`,
        arc(rtb, R - rtb, tb),
        `H ${x(cx + e)}`,
      ];
      const panelRightToLeft = [
        `H ${x(br - rbt)}`,
        arc(rbt, br, yt + rbt),
        `V ${y(Math.max(yt + rbt, yb - rbb))}`,
        arc(rbb, br - rbb, yb),
        `H ${x(bl + rbb)}`,
        arc(rbb, bl, yb - rbb),
        `V ${y(yt + rbt)}`,
        arc(rbt, bl + rbt, yt),
        `H ${x(cx - e)}`,
      ];
      const topClose = [`H ${x(L + rtb)}`, arc(rtb, L, tb - rtb), `V ${y(ty + rt)}`, arc(rt, L + rt, ty), "Z"];

      if (h <= 0.01) {
        return [...top, ...topClose].join(" ");
      }

      if (!pinched) {
        return [
          ...top,
          `C ${x(cx + m + spread)} ${y(tb)} ${x(cx + m)} ${y(mid - tip * 0.55)} ${x(cx + m)} ${y(mid)}`,
          `C ${x(cx + m)} ${y(mid + tip * 0.55)} ${x(cx + m + spread)} ${y(yt)} ${x(cx + e)} ${y(yt)}`,
          ...panelRightToLeft,
          `C ${x(cx - m - spread)} ${y(yt)} ${x(cx - m)} ${y(mid + tip * 0.55)} ${x(cx - m)} ${y(mid)}`,
          `C ${x(cx - m)} ${y(mid - tip * 0.55)} ${x(cx - m - spread)} ${y(tb)} ${x(cx - e)} ${y(tb)}`,
          ...topClose,
        ].join(" ");
      }

      return [
        ...top,
        `C ${x(cx + spread)} ${y(tb)} ${x(cx)} ${y(tb + tip * 0.45)} ${x(cx)} ${y(tb + tip)}`,
        `C ${x(cx)} ${y(tb + tip * 0.45)} ${x(cx - spread)} ${y(tb)} ${x(cx - e)} ${y(tb)}`,
        ...topClose,
        `M ${x(cx - e)} ${y(yt)}`,
        `C ${x(cx - spread)} ${y(yt)} ${x(cx)} ${y(yt - tip * 0.45)} ${x(cx)} ${y(yt - tip)}`,
        `C ${x(cx)} ${y(yt - tip * 0.45)} ${x(cx + spread)} ${y(yt)} ${x(cx + e)} ${y(yt)}`,
        ...panelRightToLeft.slice(0, -1),
        "Z",
      ].join(" ");
    };

    return { path, panelTop: yt, panelHeight: h, bottom: h > 0.01 ? yb : tb };
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
        surface: modal?.querySelector(".search-liquid-surface"),
        shadow: modal?.querySelector(".search-liquid-shadow"),
        lines: modal?.querySelector(".search-liquid-lines"),
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
      this.capsuleRect = null;
      this.resultsState = { value: 0, raw: 0, target: 0 };
      this.pointer = null;
      this.liquidPaths = [
        ...this.el.shadow.querySelectorAll("path"),
        ...this.el.lines.querySelectorAll("path"),
      ];
      this.rimGradient = this.el.lines.querySelector("linearGradient");

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
        openFrequency: reduced ? 50 : 10.5,
        closeFrequency: reduced ? 52 : 12.5,
        openDamping: reduced ? 1 : 0.78,
        closeDamping: reduced ? 1 : 0.86,
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
      document.addEventListener(
        "pointermove",
        (event) => {
          this.pointer = { x: event.clientX, y: event.clientY };
        },
        { passive: true },
      );
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
      this.setStartTint(this.isPointerOverHome());
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

    // The surface starts and ends as the resting capsule; match its hover tint.
    setStartTint(hovered) {
      this.el.surface.style.setProperty("--search-start-tint", hovered ? "var(--lg-tint-hover)" : "var(--lg-tint)");
    }

    isPointerOverHome() {
      const start = this.geometry?.start;
      if (!start || !this.pointer || !this.pointerFineQuery.matches) return false;
      const { x, y } = this.pointer;
      return x >= start.left && x <= start.left + start.width && y >= start.top && y <= start.top + start.height;
    }

    mount() {
      const { modal, open, resultsBody, results } = this.el;
      const hovered = open.matches(":hover");
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
      this.setStartTint(hovered);
      this.resultsMotion.jump(0);
      this.render(0, 0, 1);
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
      const { capsule, anchor, results } = this.el;
      // Read the capsule's resting box: drop the motion styles for one
      // synchronous layout read (no paint happens in between).
      const saved = capsule.getAttribute("style");
      capsule.removeAttribute("style");
      const home = capsule.getBoundingClientRect();
      if (saved) capsule.setAttribute("style", saved);
      const viewport = results.offsetParent.getBoundingClientRect();
      this.geometry = {
        start: { left: home.left, top: home.top, width: home.width, height: home.height },
        end: anchor.getBoundingClientRect(),
        panel: {
          left: viewport.left,
          top: viewport.top + results.offsetTop,
          width: viewport.width,
          height: results.offsetHeight || 344,
          radius: parseFloat(getComputedStyle(results).borderTopLeftRadius) || 22,
        },
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

      const interactive = p > 0.88 && target === 1 && (this.phase === "opening" || this.phase === "open");
      open.classList.toggle("is-interactive", !interactive && p < 0.12);
      if (!interactive) capsuleOpen.classList.remove("is-interactive");

      const { start, end } = this.geometry;
      const press = target === 1 ? Math.sin(range(p, 0, 0.16) * Math.PI) * 0.008 : 0;
      const pulse = 1 - press + overshoot * 0.08;
      const rect = {
        left: start.left + lerp(0, end.left - start.left, travelProgress),
        top: start.top + lerp(0, end.top - start.top, travelProgress),
        width: lerp(start.width, end.width, travelProgress) * pulse,
        height: lerp(start.height, end.height, travelProgress) * pulse,
      };
      capsule.style.width = `${px(rect.width)}px`;
      capsule.style.height = `${px(rect.height)}px`;
      capsule.style.transform = `translate3d(${px(rect.left - start.left)}px, ${px(rect.top - start.top)}px, 0)`;
      this.capsuleRect = rect;
      this.el.surface.style.setProperty("--search-material", travelProgress.toFixed(4));
      this.drawLiquid();
    }

    // Draw the single glass body: surface clip, shadow, hairline and rim.
    drawLiquid() {
      const capsule = this.capsuleRect;
      const panel = this.geometry?.panel;
      if (!capsule || !panel) return;
      const { value, raw, target } = this.resultsState;
      const stretch = target === 1 ? clamp(raw - 1, 0, 0.04) : 0;
      const shape = liquidShape(capsule, panel, clamp(value), stretch);
      const pad = 2;
      const left = Math.min(capsule.left, panel.left) - pad;
      const top = capsule.top - pad;
      const width = Math.max(capsule.left + capsule.width, panel.left + panel.width) + pad - left;
      const height = shape.bottom + pad - top;

      const { surface } = this.el;
      surface.style.transform = `translate3d(${px(left)}px, ${px(top)}px, 0)`;
      surface.style.width = `${px(width)}px`;
      surface.style.height = `${px(height)}px`;
      surface.style.clipPath = `path("${shape.path(left, top)}")`;

      const d = shape.path();
      this.liquidPaths.forEach((path) => path.setAttribute("d", d));
      this.rimGradient?.setAttribute("x1", px(left));
      this.rimGradient?.setAttribute("y1", px(top));
      // Same direction as the 135deg rim on the other glass controls.
      this.rimGradient?.setAttribute("x2", px(left + (width + height) / 2));
      this.rimGradient?.setAttribute("y2", px(top + (width + height) / 2));
      this.liquidShape = shape;
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
      this.capsuleRect = null;
      this.liquidShape = null;
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
      const { results, resultsBody } = this.el;
      const p = clamp(progress);
      this.resultsState = { value: progress, raw, target };
      this.drawLiquid();

      // The content sits in the final panel box: it follows the panel's top
      // edge and is revealed by the panel's current length.
      const panel = this.geometry?.panel;
      const shape = this.liquidShape;
      if (panel && shape) {
        const hidden = Math.max(0, panel.height - shape.panelHeight);
        results.style.transform = `translateY(${px(shape.panelTop - panel.top)}px)`;
        results.style.clipPath = `inset(0 0 ${px(hidden)}px 0 round ${px(panel.radius)}px)`;
      }
      results.style.visibility = p > 0.001 ? "visible" : "hidden";
      const bodyProgress = smootherstep(range(p, 0.6, 0.97));
      resultsBody.style.opacity = bodyProgress.toFixed(4);
      resultsBody.style.transform = `translateY(${px(lerp(8, 0, bodyProgress))}px)`;

      // Closing with results: once the panel is mostly absorbed the capsule
      // starts home and carries the last of it along, with no pause between.
      if (this.phase === "merging" && target === 0 && p < 0.2) this.beginReturn();

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
