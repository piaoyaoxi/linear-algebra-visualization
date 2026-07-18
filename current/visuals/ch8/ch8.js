(() => {
  const labRenderers = new Map();
  const cleanups = [];
  const activeFrames = new Set();
  const I = (source) => (window.texInline ? window.texInline(source) : `<code>${source}</code>`);
  const D = (source) => (window.texDisplay ? window.texDisplay(source) : `<pre>${source}</pre>`);

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function on(target, type, handler, options) {
    if (!target) return () => {};
    target.addEventListener(type, handler, options);
    const off = () => target.removeEventListener(type, handler, options);
    cleanups.push(off);
    return off;
  }

  function raf(callback) {
    const id = window.requestAnimationFrame((time) => {
      activeFrames.delete(id);
      callback(time);
    });
    activeFrames.add(id);
    return id;
  }

  function stopAll() {
    activeFrames.forEach((id) => window.cancelAnimationFrame(id));
    activeFrames.clear();
    while (cleanups.length) cleanups.pop()();
  }

  function setPressed(container, activeButton) {
    container?.querySelectorAll("button").forEach((button) => {
      const active = button === activeButton;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function markExperimentStep(root, index) {
    const lesson = root?.closest("main") || document;
    lesson.querySelectorAll(".ch8-experiment-roadmap [data-experiment-step]").forEach((item) => {
      const itemIndex = Number(item.dataset.experimentStep);
      item.classList.toggle("is-active", itemIndex === index);
      item.classList.toggle("is-complete", itemIndex < index);
    });
  }

  function conclusionMarkup(kicker, title, body, tone = "accent") {
    return `
      <div class="ch8-live-conclusion is-${tone}" data-live-conclusion>
        <span>${kicker}</span>
        <strong>${title}</strong>
        <p>${body}</p>
      </div>`;
  }

  function matrix(rows, options = {}) {
    const body = rows.map((row) => row.join("&")).join("\\\\");
    const tex = `\\begin{bmatrix}${body}\\end{bmatrix}`;
    return options.inline ? I(tex) : D(tex);
  }

  function polynomialChip(tex, label = "") {
    return `<span class="ch8-poly-chip">${label ? `<small>${escapeHtml(label)}</small>` : ""}${I(tex)}</span>`;
  }

  function renderChoiceExample(section, root) {
    const example = section.example;
    const choices = [...root.querySelectorAll('input[type="radio"]')];
    const action = root.querySelector("[data-ch8-example-action]");
    const feedback = root.querySelector("[data-ch8-example-feedback]");
    const steps = root.querySelector("[data-ch8-example-steps]");
    let solved = false;

    choices.forEach((input) => {
      on(input, "change", () => {
        solved = false;
        steps.innerHTML = "";
        root.querySelectorAll(".ch8-example-choices label").forEach((label) => label.classList.remove("is-correct", "is-wrong"));
        action.disabled = false;
        action.textContent = "检查选择";
        feedback.textContent = "已经选择，检查后再看推理。";
      });
    });

    on(action, "click", () => {
      if (solved) {
        choices.forEach((input) => {
          input.checked = false;
        });
        root.querySelectorAll(".ch8-example-choices label").forEach((label) => label.classList.remove("is-correct", "is-wrong"));
        steps.innerHTML = "";
        action.disabled = true;
        action.textContent = "检查选择";
        feedback.textContent = "先选一个答案。";
        solved = false;
        return;
      }

      const selected = choices.find((input) => input.checked);
      if (!selected) return;
      const index = Number(selected.value);
      const choice = example.choices[index];
      const label = selected.closest("label");
      root.querySelectorAll(".ch8-example-choices label").forEach((item) => item.classList.remove("is-correct", "is-wrong"));
      if (!choice?.correct) {
        label.classList.add("is-wrong");
        feedback.innerHTML = "<strong>这一步还没有抓住结构。</strong>重新检查题目问的是哪一个不变量。";
        action.textContent = "再次检查";
        return;
      }

      label.classList.add("is-correct");
      steps.innerHTML = example.steps.map((step) => `<li>${step}</li>`).join("");
      feedback.innerHTML = "<strong>判断正确。</strong>下面按顺序核对完整推理。";
      action.textContent = "重做";
      solved = true;
    });
  }

  function renderStepExample(section, root) {
    const example = section.example;
    const action = root.querySelector("[data-ch8-example-action]");
    const feedback = root.querySelector("[data-ch8-example-feedback]");
    const steps = root.querySelector("[data-ch8-example-steps]");
    let visible = 0;

    on(action, "click", () => {
      if (visible >= example.steps.length) {
        visible = 0;
        steps.innerHTML = "";
        action.textContent = "显示第一步";
        feedback.textContent = "先独立思考，再逐步核对。";
        return;
      }
      steps.insertAdjacentHTML("beforeend", `<li>${example.steps[visible]}</li>`);
      visible += 1;
      if (visible < example.steps.length) {
        action.textContent = "显示下一步";
        feedback.textContent = `已展开 ${visible}/${example.steps.length} 步。`;
      } else {
        action.textContent = "重新开始";
        feedback.innerHTML = "<strong>推理完成。</strong>检查每一步是否都使用了本节的不变量。";
      }
    });
  }

  function bindExample(section, main) {
    const root = main.querySelector(`[data-ch8-example][data-section-id="${CSS.escape(section.id)}"]`);
    if (!root) return;
    if (Array.isArray(section.example?.choices)) renderChoiceExample(section, root);
    else renderStepExample(section, root);
  }

  window.defineChapter8Lab = function defineChapter8Lab(kind, renderer) {
    if (!kind || typeof renderer !== "function") throw new TypeError("Chapter 8 lab requires a kind and renderer.");
    labRenderers.set(kind, renderer);
  };

  window.Chapter8Lab = {
    I,
    D,
    on,
    raf,
    matrix,
    escapeHtml,
    setPressed,
    markExperimentStep,
    conclusionMarkup,
    polynomialChip,
  };

  window.mountChapter8 = function mountChapter8(section, main) {
    if (!section || !main) return;
    stopAll();
    const host = main.querySelector(`[data-ch8-lab="${CSS.escape(section.interactive?.kind || "")}"]`);
    const renderer = labRenderers.get(section.interactive?.kind);
    if (host && renderer) renderer(host, section);
    bindExample(section, main);
  };

  window.teardownChapter8 = stopAll;
})();
