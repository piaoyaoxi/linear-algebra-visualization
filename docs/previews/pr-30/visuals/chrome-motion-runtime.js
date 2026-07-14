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

  const normalizeSearchText = (value) =>
    String(value || "")
      .toLocaleLowerCase("zh-CN")
      .replace(/\s+/g, "");

  function setInert(element, inert) {
    if (!element) return;
    if (inert) element.setAttribute("inert", "");
    else element.removeAttribute("inert");
  }

  function roundedRectPath(rect, radius) {
    const x = px(rect.left);
    const y = px(rect.top);
    const w = px(Math.max(0, rect.width));
    const h = px(Math.max(0, rect.height));
    const r = px(Math.min(radius, w / 2, h / 2));
    const right = px(x + w);
    const bottom = px(y + h);
    return [
      `M ${x + r} ${y}`,
      `H ${right - r}`,
      `Q ${right} ${y} ${right} ${y + r}`,
      `V ${bottom - r}`,
      `Q ${right} ${bottom} ${right - r} ${bottom}`,
      `H ${x + r}`,
      `Q ${x} ${bottom} ${x} ${bottom - r}`,
      `V ${y + r}`,
      `Q ${x} ${y} ${x + r} ${y}`,
      "Z",
    ].join(" ");
  }

  function liquidBridgePath(panelRect, buttonRect, openness) {
    const panelRight = panelRect.right;
    const buttonLeft = buttonRect.left;
    const gap = buttonLeft - panelRight;
    if (gap <= -1 || gap > 104) return "";

    const contact = smootherstep(1 - clamp(gap / 104));
    const strength = contact * smootherstep(range(openness, 0.08, 0.82));
    if (strength < 0.002) return "";

    const centerY = buttonRect.top + buttonRect.height / 2;
    const panelHalf = lerp(5, buttonRect.height * 0.47, Math.pow(strength, 0.72));
    const buttonHalf = lerp(3, buttonRect.height * 0.43, Math.pow(strength, 0.78));
    const span = Math.max(0, gap);
    const leftControl = panelRight + Math.max(7, span * 0.38);
    const rightControl = buttonLeft - Math.max(5, span * 0.27);

    return [
      `M ${px(panelRight - 1)} ${px(centerY - panelHalf)}`,
      `C ${px(leftControl)} ${px(centerY - panelHalf)}, ${px(rightControl)} ${px(centerY - buttonHalf)}, ${px(buttonLeft + 1)} ${px(centerY - buttonHalf)}`,
      `L ${px(buttonLeft + 1)} ${px(centerY + buttonHalf)}`,
      `C ${px(rightControl)} ${px(centerY + buttonHalf)}, ${px(leftControl)} ${px(centerY + panelHalf)}, ${px(panelRight - 1)} ${px(centerY + panelHalf)}`,
      "Z",
    ].join(" ");
  }

  class ReversibleSpring {
    constructor({
      value = 0,
      openFrequency = 18,
      closeFrequency = 18,
      openDamping = 0.9,
      closeDamping = 0.94,
      onUpdate,
      onSettle,
    }) {
      this.value = value;
      this.target = value;
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
      this.onUpdate?.(clamp(this.value), this.value, this.target);
      this.onSettle?.(this.value);
    }

    tick(now) {
      if (!this.lastTime) this.lastTime = now;
      let remaining = Math.min(0.12, Math.max(0.001, (now - this.lastTime) / 1000));
      this.lastTime = now;

      const opening = this.target === 1;
      const omega = opening ? this.openFrequency : this.closeFrequency;
      const damping = opening ? this.openDamping : this.closeDamping;

      // Preserve real elapsed time even when a frame is late. Splitting the
      // interval keeps the spring stable without turning dropped frames into
      // a visibly slower animation.
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

  window.__ChromeMotion = {
    clamp,
    lerp,
    range,
    smoothstep,
    smootherstep,
    px,
    normalizeSearchText,
    setInert,
    roundedRectPath,
    liquidBridgePath,
    ReversibleSpring,
  };
})();
