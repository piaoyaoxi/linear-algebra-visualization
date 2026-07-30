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
    ReversibleSpring,
  };
})();
