/* Shared Chapter 2 presentation helpers. */
(() => {
  const M = () => window.Ch2Math;
  const tex = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);
  const aEntry = (row, col) => tex(`a_{${row}${col}}`);
  const productTermHtml = (permutation) => permutation.map((col, row) => aEntry(row + 1, col)).join("");
  const formalShell = (title, lead, body) => `<h2>${title}</h2><div class="ch2-formal"><p class="ch2-formal-lead">${lead}</p>${body}</div>`;
  const module = (number, title, subtitle, body) => `<section class="ch2-module"><div class="ch2-module-heading"><span>${number}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  const proofSteps = (items) => `<ol class="ch2-proof-steps">${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
  const misconception = (items) => `<div class="ch2-misconception"><strong>辨析</strong><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul></div>`;
  const taskBox = (title, text) => `<div class="ch2-reading-note"><strong>${title}</strong><p>${text}</p></div>`;

  function renderStoryBlock(block) {
    if (!block || typeof block !== "object") return "";
    if (block.type === "definitions") {
      return `<div class="ch2-def-stack">${(block.items || []).map((item) => `
        <article class="ch2-def">
          ${item.kicker ? `<span class="kicker">${item.kicker}</span>` : ""}
          <strong>${item.title || ""}</strong>
          ${item.text ? `<p>${item.text}</p>` : ""}
        </article>`).join("")}</div>`;
    }
    if (block.type === "cards") {
      const columns = block.columns === 2 ? " is-2" : "";
      return `<div class="ch2-card-grid${columns}">${(block.items || []).map((item) => `
        <article class="ch2-card">
          ${item.kicker ? `<span class="kicker">${item.kicker}</span>` : ""}
          <h4>${item.title || ""}</h4>
          ${item.text ? `<p>${item.text}</p>` : ""}
        </article>`).join("")}</div>`;
    }
    if (block.type === "formula") {
      return `<article class="ch2-def ch2-formula-block">
        ${block.kicker ? `<span class="kicker">${block.kicker}</span>` : ""}
        <strong>${block.formula || ""}</strong>
        ${block.text ? `<p>${block.text}</p>` : ""}
      </article>`;
    }
    if (block.type === "proof") return proofSteps(block.items || []);
    if (block.type === "misconception") return misconception(block.items || []);
    if (block.type === "note") return taskBox(block.title || "阅读线索", block.text || "");
    if (block.type === "paragraph") return `<p class="ch2-story-paragraph">${block.text || ""}</p>`;
    return "";
  }

  function formalFromSection(section) {
    const story = section?.story;
    if (!story?.modules?.length) return "";
    const body = story.modules.map((item, index) => module(
      item.number || String(index + 1).padStart(2, "0"),
      item.title || "",
      item.subtitle || "",
      (item.blocks || []).map(renderStoryBlock).join(""),
    )).join("");
    return formalShell(story.title || section.title, story.lead || "", body);
  }

  function predictionBlock(section) {
    const prediction = section?.interactive?.prediction;
    if (!prediction?.options?.length) return "";
    return `<div class="ch2-prediction" data-ch2-prediction>
      <div class="ch2-prediction-copy">
        <span>先预测</span>
        <strong>${prediction.question}</strong>
      </div>
      <div class="ch2-prediction-options">
        ${prediction.options.map((option, index) => `<button type="button" data-prediction-index="${index}">${option.label}</button>`).join("")}
      </div>
      <p data-prediction-feedback aria-live="polite">先选一个判断，再操作图形核对。</p>
    </div>`;
  }

  function mountPrediction(root, section, signal) {
    const prediction = section?.interactive?.prediction;
    const panel = root?.querySelector("[data-ch2-prediction]");
    if (!panel || !prediction?.options?.length) return;
    const feedback = panel.querySelector("[data-prediction-feedback]");
    panel.querySelectorAll("[data-prediction-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const option = prediction.options[Number(button.dataset.predictionIndex)];
        panel.querySelectorAll("[data-prediction-index]").forEach((item) => item.classList.toggle("is-selected", item === button));
        panel.dataset.state = option.correct ? "correct" : "consider";
        feedback.textContent = option.feedback || (option.correct ? "把这个预测带进实验，观察它为什么成立。" : "先保留这个预测，用实验中的读数核对。");
      }, signal ? { signal } : undefined);
    });
  }

  function labIntro(section, fallbackTitle, fallbackDescription, stageKey = null, includePrediction = true) {
    const interactive = section?.interactive || {};
    const stage = stageKey ? interactive.stages?.[stageKey] || {} : {};
    return `<div class="ch2-lab-head"><h3>${stage.title || interactive.visualTitle || fallbackTitle}</h3><p>${stage.description || interactive.description || fallbackDescription}</p></div>
      ${includePrediction ? predictionBlock(section) : ""}
      <div class="ch2-task"><strong>实验任务</strong><span>${stage.task || interactive.task || "先作出判断，再改变参数并解释读数。"}</span></div>`;
  }

  window.Ch2PresentationUtils = {
    M,
    tex,
    display,
    aEntry,
    productTermHtml,
    formalShell,
    module,
    proofSteps,
    misconception,
    taskBox,
    formalFromSection,
    predictionBlock,
    mountPrediction,
    labIntro,
  };
})();
