(() => {
  const registry = new Map();
  let disposers = [];

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);

  const api = {
    inline(source) {
      return window.texInline ? window.texInline(source) : `<code>${escapeHtml(source)}</code>`;
    },
    display(source) {
      return window.texDisplay ? window.texDisplay(source) : `<code>${escapeHtml(source)}</code>`;
    },
    clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    },
    format(value, digits = 2) {
      if (!Number.isFinite(value)) return "—";
      if (Math.abs(value) < 0.5 * 10 ** -digits) return "0";
      return value.toFixed(digits).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
    },
    radians(value) {
      return (value * Math.PI) / 180;
    },
    degrees(value) {
      return (value * 180) / Math.PI;
    },
    dot(a, b) {
      return a[0] * b[0] + a[1] * b[1];
    },
    norm(v) {
      return Math.hypot(v[0], v[1]);
    },
    add(a, b) {
      return [a[0] + b[0], a[1] + b[1]];
    },
    sub(a, b) {
      return [a[0] - b[0], a[1] - b[1]];
    },
    scale(k, v) {
      return [k * v[0], k * v[1]];
    },
    matVec(matrix, vector) {
      return [
        matrix[0] * vector[0] + matrix[1] * vector[1],
        matrix[2] * vector[0] + matrix[3] * vector[1],
      ];
    },
    matMul(left, right) {
      return [
        left[0] * right[0] + left[1] * right[2],
        left[0] * right[1] + left[1] * right[3],
        left[2] * right[0] + left[3] * right[2],
        left[2] * right[1] + left[3] * right[3],
      ];
    },
    transpose(matrix) {
      return [matrix[0], matrix[2], matrix[1], matrix[3]];
    },
    determinant(matrix) {
      return matrix[0] * matrix[3] - matrix[1] * matrix[2];
    },
    palette() {
      const style = getComputedStyle(document.body);
      const read = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
      return {
        text: read("--text", "#19242d"),
        muted: read("--muted", "#65717c"),
        faint: read("--faint", "#98a1a9"),
        line: read("--line-strong", "rgba(32, 49, 61, .18)"),
        accent: read("--accent", "#0f8f88"),
        accentStrong: read("--accent-strong", "#08736e"),
        accentSoft: read("--accent-soft", "rgba(15,143,136,.12)"),
        coral: read("--coral", "#d26c50"),
        blue: read("--blue", "#3868d9"),
        violet: read("--violet", "#7959bd"),
        surface: read("--surface-solid", "#fff"),
      };
    },
    on(target, type, handler, options) {
      if (!target) return;
      target.addEventListener(type, handler, options);
      disposers.push(() => target.removeEventListener(type, handler, options));
    },
    observe(target, handler) {
      if (!target || typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(handler);
      observer.observe(target);
      disposers.push(() => observer.disconnect());
    },
    fitCanvas(canvas) {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const bufferWidth = Math.round(width * dpr);
      const bufferHeight = Math.round(height * dpr);
      if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
        canvas.width = bufferWidth;
        canvas.height = bufferHeight;
      }
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      return { ctx, width, height };
    },
    plane(canvas, extent = 4.2, verticalShift = 0) {
      const fit = api.fitCanvas(canvas);
      const unit = Math.min(fit.width, fit.height) / (extent * 2.25);
      const origin = { x: fit.width / 2, y: fit.height / 2 + verticalShift };
      return {
        ...fit,
        unit,
        origin,
        toScreen(v) {
          return { x: origin.x + v[0] * unit, y: origin.y - v[1] * unit };
        },
        toWorld(point) {
          return [(point.x - origin.x) / unit, (origin.y - point.y) / unit];
        },
      };
    },
    drawGrid(system, step = 1) {
      const { ctx, width, height, unit, origin } = system;
      const color = api.palette().line;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (let x = origin.x % (unit * step); x <= width; x += unit * step) {
        ctx.globalAlpha = Math.abs(x - origin.x) < 1 ? 0.42 : 0.13;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = origin.y % (unit * step); y <= height; y += unit * step) {
        ctx.globalAlpha = Math.abs(y - origin.y) < 1 ? 0.42 : 0.13;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();
    },
    drawArrow(ctx, from, to, color, label = "", options = {}) {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.hypot(dx, dy);
      if (length < 2) return;
      const angle = Math.atan2(dy, dx);
      const head = Math.min(12, Math.max(7, length * 0.13));
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.globalAlpha = options.alpha ?? 1;
      ctx.lineWidth = options.width || 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (options.dash) ctx.setLineDash(options.dash);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x - head * Math.cos(angle - Math.PI / 6), to.y - head * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(to.x - head * Math.cos(angle + Math.PI / 6), to.y - head * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
      if (label) {
        ctx.font = "650 12px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillText(label, to.x + (options.labelDx ?? 8), to.y + (options.labelDy ?? -8));
      }
      ctx.restore();
    },
    drawPoint(ctx, point, color, radius = 5) {
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    pointer(event, canvas) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    },
    setPressed(buttons, predicate) {
      buttons.forEach((button) => {
        const active = predicate(button);
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    },
    setText(root, selector, value) {
      const node = root.querySelector(selector);
      if (node) node.textContent = value;
    },
    setHtml(root, selector, value) {
      const node = root.querySelector(selector);
      if (node) node.innerHTML = value;
    },
    bindRange(root, name, handler) {
      const input = root.querySelector(`[data-v2-range="${name}"]`);
      if (!input) return null;
      api.on(input, "input", () => handler(Number(input.value), input));
      return input;
    },
    range(name, label, min, max, step, value, suffix = "") {
      return `
        <label class="ch9v2-range">
          <span>${label}</span>
          <output data-v2-output="${name}">${value}${suffix}</output>
          <input data-v2-range="${name}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" />
        </label>`;
    },
    metric(label, name, value = "—") {
      return `<div class="ch9v2-metric"><span>${label}</span><strong data-v2-metric="${name}">${value}</strong></div>`;
    },
    update(root, name, value) {
      root.querySelectorAll(`[data-v2-output="${name}"], [data-v2-metric="${name}"]`).forEach((node) => {
        node.textContent = value;
      });
    },
    installRedraw(redraw, targets = []) {
      targets.forEach((target) => api.observe(target, redraw));
      api.on(window, "resize", redraw, { passive: true });
      api.on(document.querySelector("#themeToggle"), "click", () => requestAnimationFrame(redraw));
      requestAnimationFrame(redraw);
    },
    module(number, title, subtitle, body, className = "") {
      return `
        <section class="ch9v2-module ${className}">
          <header class="ch9v2-module-head">
            <span>${number}</span>
            <div><h3>${title}</h3><p>${subtitle}</p></div>
          </header>
          ${body}
        </section>`;
    },
    foundationIntro(kicker, title, text) {
      return `
        <div class="ch9v2-foundation-intro">
          <span>${kicker}</span>
          <h2>${title}</h2>
          <p>${text}</p>
        </div>`;
    },
    labShell({ kicker, title, intro, steps, body }) {
      return `
        <div class="ch9v2-lab" data-ch9-v2-lab>
          <header class="ch9v2-lab-head">
            <div><span>${kicker}</span><h2>${title}</h2><p>${intro}</p></div>
            <ol class="ch9v2-lab-path" aria-label="实验路径">
              ${steps.map((step, index) => `<li${index === 0 ? ' class="is-active"' : ""} data-v2-path-step="${index}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${step}</strong></li>`).join("")}
            </ol>
          </header>
          ${body}
        </div>`;
    },
  };

  function bindExamples(root = document) {
    root.querySelectorAll("[data-ch9-example]").forEach((example) => {
      if (example.dataset.v2Bound === "true") return;
      example.dataset.v2Bound = "true";
      const inputs = [...example.querySelectorAll('input[type="radio"]')];
      const button = example.querySelector("[data-ch9-example-check]");
      const feedback = example.querySelector("[data-ch9-example-feedback]");
      const explanation = example.querySelector("[data-ch9-example-explanation]");
      inputs.forEach((input) => api.on(input, "change", () => {
        button.disabled = false;
        explanation.hidden = true;
        feedback.className = "example-feedback";
        feedback.textContent = "已经选择，可以检查。";
        example.querySelectorAll(".example-choice").forEach((choice) => choice.classList.remove("is-correct", "is-wrong"));
      }));
      api.on(button, "click", () => {
        const selected = inputs.find((input) => input.checked);
        if (!selected) return;
        example.querySelectorAll(".example-choice").forEach((choice) => choice.classList.remove("is-correct", "is-wrong"));
        const choice = selected.closest(".example-choice");
        if (selected.dataset.correct === "true") {
          choice.classList.add("is-correct");
          feedback.className = "example-feedback is-success";
          feedback.textContent = "判断正确。现在展开完整推理。";
          explanation.hidden = false;
        } else {
          choice.classList.add("is-wrong");
          feedback.className = "example-feedback is-error";
          feedback.textContent = "这个判断还没有通过定义与边界检查，可以重新选择。";
          explanation.hidden = true;
        }
      });
    });
  }

  function teardown() {
    disposers.splice(0).reverse().forEach((dispose) => {
      try {
        dispose();
      } catch (error) {
        console.warn("Chapter 9 v2 cleanup failed", error);
      }
    });
  }

  function mount(sectionId) {
    teardown();
    const config = registry.get(sectionId);
    if (!config) {
      console.error(`Chapter 9 v2 section not registered: ${sectionId}`);
      return;
    }
    const formal = document.querySelector(`#${CSS.escape(sectionId)}-formal`);
    const interactive = document.querySelector(`#${CSS.escape(sectionId)}-interactive`);
    if (!formal || !interactive) return;
    formal.classList.add("ch9v2-foundation-section");
    interactive.classList.add("ch9v2-interactive-section");
    formal.innerHTML = config.foundation(api);
    interactive.innerHTML = config.interactive(api);
    config.mount(interactive.querySelector("[data-ch9-v2-lab]"), api);
    bindExamples(document.querySelector("main"));
  }

  window.Chapter9V2 = {
    register(sectionId, config) {
      registry.set(sectionId, config);
    },
    api,
  };
  window.mountChapter9 = mount;
  window.teardownChapter9 = teardown;
})();
