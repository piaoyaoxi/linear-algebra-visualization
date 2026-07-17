(() => {
  const PI_PATH = "m10.5 177.038 20.675 1.532c21.44-24.249 29.864-95.974 156.213-81.935-4.595 307.32-139.367 339.737-130.943 402.784 3.063 35.735 31.395 57.687 62.025 58.963 96.74-3.318 92.4-133.751 122.52-462.513h124.818c-6.637 115.883-24.76 231.767-26.802 345.353 1.532 75.554 47.477 115.884 107.971 116.394 99.548 3.318 130.943-112.82 130.943-162.339h-21.44c-2.043 40.84-21.697 70.194-63.558 71.98-114.097 1.532-51.305-200.626-50.54-369.857l135.538.766-.765-86.53C13.807 8.908 85.312-2.137 10.5 177.038";
  const activeBursts = new WeakMap();
  let piShapePoints = null;

  function escapeText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function piMarkup() {
    return `
      <button class="example-pi" type="button" data-example-pi hidden aria-label="再次播放正确反馈">
        <svg viewBox="0 0 100 84" aria-hidden="true">
          <path d="M22 23 C38 28 65 28 80 23"></path>
          <path d="M39 25 C45 39 42 59 33 76"></path>
          <path d="M64 25 C66 42 74 58 82 73"></path>
          <circle cx="47" cy="18" r="7"></circle>
          <circle cx="68" cy="18" r="7"></circle>
          <circle class="eye" cx="49" cy="17" r="2.1"></circle>
          <circle class="eye" cx="66" cy="17" r="2.1"></circle>
        </svg>
      </button>`;
  }

  function renderSteps(example) {
    if (example.steps?.length) {
      return `<ol>${example.steps.map((step) => `<li>${step}</li>`).join("")}</ol>`;
    }
    return `<p>${example.answer || ""}</p>`;
  }

  function renderChoiceChallenge(section) {
    const example = section.example;
    const fieldName = `${section.id}-example-choice`;
    return `
      <h2>代表例题</h2>
      <div class="example-challenge" data-example-challenge data-example-mode="choice" data-state="idle">
        <canvas class="example-burst-layer" data-example-burst aria-hidden="true"></canvas>
        <div class="example-challenge-content">
          <div class="example-challenge-head">
            <span class="example-label">例题 · 先作答再看解析</span>
            <h3>${escapeText(example.title)}</h3>
          </div>
          <p class="example-challenge-question">${example.question}</p>
          <fieldset class="example-choice-list" aria-label="${escapeText(example.title)}">
            <legend class="sr-only">请选择一个答案</legend>
            ${example.choices
              .map(
                (choice, index) => `
                  <label class="example-choice">
                    <input type="radio" name="${fieldName}" value="${index}" />
                    <span class="example-choice-marker" aria-hidden="true">${String.fromCharCode(65 + index)}</span>
                    <span class="example-choice-copy">${choice.text}</span>
                    <span class="example-choice-result" aria-hidden="true">✓</span>
                  </label>`,
              )
              .join("")}
          </fieldset>
          <div class="example-challenge-actions">
            <button class="button primary example-check" type="button" data-example-action disabled>检查</button>
            ${piMarkup()}
            <div class="example-feedback" data-example-feedback aria-live="polite">选择一个答案后再检查。</div>
          </div>
          <div class="example-explanation" data-example-explanation hidden>
            <h4>答案与分析</h4>
            ${renderSteps(example)}
          </div>
        </div>
      </div>`;
  }

  function renderStepChallenge(section) {
    const example = section.example;
    return `
      <h2>代表例题</h2>
      <div class="example-challenge" data-example-challenge data-example-mode="steps" data-state="idle">
        <canvas class="example-burst-layer" data-example-burst aria-hidden="true"></canvas>
        <div class="example-challenge-content">
          <div class="example-challenge-head">
            <span class="example-label">例题 · 逐步展开</span>
            <h3>${escapeText(example.title)}</h3>
          </div>
          <p class="example-challenge-question">${example.question}</p>
          <ol class="example-step-list" data-example-step-list></ol>
          <div class="example-challenge-actions">
            <button class="button primary example-check" type="button" data-example-action>显示第一步</button>
            ${piMarkup()}
            <div class="example-feedback" data-example-feedback aria-live="polite">先独立思考，再逐步核对。</div>
          </div>
        </div>
      </div>`;
  }

  function samplePiShape() {
    if (piShapePoints) return piShapePoints;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:fixed;width:0;height:0;overflow:hidden;pointer-events:none";
    path.setAttribute("d", PI_PATH);
    svg.appendChild(path);
    document.body.appendChild(svg);

    const box = path.getBBox();
    const point = svg.createSVGPoint();
    const points = [];
    const stepX = box.width / 58;
    const stepY = box.height / 58;
    for (let y = box.y; y < box.y + box.height; y += stepY) {
      for (let x = box.x; x < box.x + box.width; x += stepX) {
        point.x = x;
        point.y = y;
        if (path.isPointInFill(point)) {
          points.push({
            x: ((x - (box.x + box.width / 2)) / (box.width / 2)) * 96,
            y: ((y - (box.y + box.height / 2)) / (box.height / 2)) * 96,
          });
        }
      }
    }
    svg.remove();
    piShapePoints = points;
    return points;
  }

  function triggerPiBurst(root) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = root.querySelector("[data-example-burst]");
    const choices = root.querySelector(".example-choice-list, .example-step-list");
    if (!canvas || !choices) return;

    const previous = activeBursts.get(root);
    if (previous) window.cancelAnimationFrame(previous);

    const rootRect = root.getBoundingClientRect();
    const choicesRect = choices.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rootRect.width * dpr));
    canvas.height = Math.max(1, Math.round(rootRect.height * dpr));
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const center = {
      x: rootRect.width / 2,
      y: choicesRect.top - rootRect.top + choicesRect.height * 0.48,
    };
    const scale = Math.max(0.54, Math.min(1, rootRect.width / 760));
    const source = samplePiShape();
    const particleCount = window.matchMedia("(max-width: 640px)").matches ? 180 : 360;
    const rotation = (Math.random() - 0.5) * 0.12;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const particles = Array.from({ length: particleCount }, () => {
      const sourcePoint = source[Math.floor(Math.random() * source.length)];
      const sx = sourcePoint.x * scale;
      const sy = sourcePoint.y * scale;
      const targetX = sx * cos - sy * sin;
      const targetY = sx * sin + sy * cos;
      const length = Math.hypot(targetX, targetY) || 1;
      const angle = Math.random() * Math.PI * 2;
      const startRadius = Math.random() * 7;
      return {
        startX: center.x + Math.cos(angle) * startRadius,
        startY: center.y + Math.sin(angle) * startRadius,
        targetX: center.x + targetX,
        targetY: center.y + targetY,
        radialX: targetX / length,
        radialY: targetY / length,
        spread: (42 + Math.random() * 64) * scale,
        radius: 1.35 + Math.random() * 1.45,
        alpha: 0.72 + Math.random() * 0.28,
        delay: Math.random() * 0.05,
      };
    });

    const color = getComputedStyle(root).getPropertyValue("--example-particle").trim() || "#1b86cd";
    const born = performance.now();
    const duration = 1450;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const easeOut = (value) => 1 - Math.pow(1 - value, 3);

    function draw(now) {
      if (!root.isConnected) return;
      ctx.clearRect(0, 0, rootRect.width, rootRect.height);
      const progress = (now - born) / duration;
      particles.forEach((particle) => {
        const local = clamp((progress - particle.delay) / (1 - particle.delay), 0, 1);
        if (local <= 0) return;
        let x;
        let y;
        let alpha;
        if (local < 0.4) {
          const phase = local / 0.4;
          const grow = 0.08 + 0.92 * phase;
          x = particle.startX + (particle.targetX - particle.startX) * phase * grow;
          y = particle.startY + (particle.targetY - particle.startY) * phase * grow;
          alpha = particle.alpha * Math.min(1, phase * 1.5);
        } else {
          const phase = easeOut((local - 0.4) / 0.6);
          x = particle.targetX + particle.radialX * particle.spread * phase;
          y = particle.targetY + particle.radialY * particle.spread * phase;
          alpha = particle.alpha * Math.pow(1 - phase, 1.35);
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (progress < 1.04) {
        activeBursts.set(root, window.requestAnimationFrame(draw));
      } else {
        ctx.clearRect(0, 0, rootRect.width, rootRect.height);
        activeBursts.delete(root);
      }
    }

    activeBursts.set(root, window.requestAnimationFrame(draw));
  }

  function clearChoiceMarks(root) {
    root.querySelectorAll(".example-choice").forEach((choice) => choice.classList.remove("is-correct", "is-wrong"));
  }

  function resetChoiceChallenge(root) {
    root.dataset.state = "idle";
    root.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.checked = false;
    });
    clearChoiceMarks(root);
    const action = root.querySelector("[data-example-action]");
    const feedback = root.querySelector("[data-example-feedback]");
    const explanation = root.querySelector("[data-example-explanation]");
    const pi = root.querySelector("[data-example-pi]");
    action.textContent = "检查";
    action.disabled = true;
    feedback.textContent = "选择一个答案后再检查。";
    explanation.hidden = true;
    pi.hidden = true;
  }

  function prepareChoiceRecheck(root, { keepSelectionFeedback = false } = {}) {
    const action = root.querySelector("[data-example-action]");
    const feedback = root.querySelector("[data-example-feedback]");
    const explanation = root.querySelector("[data-example-explanation]");
    const pi = root.querySelector("[data-example-pi]");
    const hasSelection = root.querySelector('input[type="radio"]:checked');

    root.dataset.state = "idle";
    clearChoiceMarks(root);
    explanation.hidden = true;
    pi.hidden = true;
    action.textContent = "检查";
    action.disabled = !hasSelection;
    feedback.textContent = hasSelection
      ? keepSelectionFeedback
        ? "保留了上次选择，可以修改后再次检查。"
        : "已经选择，可以检查。"
      : "选择一个答案后再检查。";
  }

  function evaluateChoiceChallenge(root, example) {
    const action = root.querySelector("[data-example-action]");
    const feedback = root.querySelector("[data-example-feedback]");
    const explanation = root.querySelector("[data-example-explanation]");
    const pi = root.querySelector("[data-example-pi]");
    const inputs = [...root.querySelectorAll('input[type="radio"]')];
    const selected = inputs.find((input) => input.checked);
    if (!selected) return;

    const selectedIndex = Number(selected.value);
    const selectedChoice = example.choices[selectedIndex];
    const selectedLabel = selected.closest(".example-choice");
    clearChoiceMarks(root);

    if (!selectedChoice?.correct) {
      root.dataset.state = "wrong";
      selectedLabel.classList.add("is-wrong");
      action.textContent = "再试一次";
      action.disabled = false;
      feedback.innerHTML = "<strong>还差一点</strong>先重新判断这一步的结构，答案暂不展开。";
      explanation.hidden = true;
      pi.hidden = true;
      return;
    }

    root.dataset.state = "correct";
    selectedLabel.classList.add("is-correct");
    action.textContent = "重做";
    action.disabled = false;
    feedback.innerHTML = "<strong>答对了</strong>解析已经展开。点击 π 可以再次播放反馈。";
    explanation.hidden = false;
    pi.hidden = false;
    window.requestAnimationFrame(() => triggerPiBurst(root));
  }

  function bindChoiceChallenge(root, example) {
    const action = root.querySelector("[data-example-action]");
    const inputs = [...root.querySelectorAll('input[type="radio"]')];

    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        // Options stay interactive after check. Changing a choice always
        // returns to a re-checkable idle state (same as the standalone demo).
        if (root.dataset.state === "idle") {
          action.disabled = false;
          const feedback = root.querySelector("[data-example-feedback]");
          feedback.textContent = "已经选择，可以检查。";
          return;
        }
        prepareChoiceRecheck(root);
      });
    });

    const pi = root.querySelector("[data-example-pi]");
    pi.addEventListener("click", () => triggerPiBurst(root));
    action.addEventListener("click", () => {
      if (root.dataset.state === "correct") {
        resetChoiceChallenge(root);
        return;
      }
      // idle → 检查；wrong → 再试一次：都按当前选项重新判定
      evaluateChoiceChallenge(root, example);
    });
  }

  function bindStepChallenge(root, example) {
    const action = root.querySelector("[data-example-action]");
    const feedback = root.querySelector("[data-example-feedback]");
    const list = root.querySelector("[data-example-step-list]");
    const pi = root.querySelector("[data-example-pi]");
    let visibleSteps = 0;

    function reset() {
      visibleSteps = 0;
      root.dataset.state = "idle";
      list.innerHTML = "";
      action.textContent = "显示第一步";
      feedback.textContent = "先独立思考，再逐步核对。";
      pi.hidden = true;
    }

    pi.addEventListener("click", () => triggerPiBurst(root));
    action.addEventListener("click", () => {
      if (root.dataset.state === "correct") {
        reset();
        return;
      }
      const step = example.steps?.[visibleSteps];
      if (!step) return;
      list.insertAdjacentHTML("beforeend", `<li>${step}</li>`);
      visibleSteps += 1;
      if (visibleSteps < example.steps.length) {
        action.textContent = "显示下一步";
        feedback.textContent = `已展开 ${visibleSteps}/${example.steps.length} 步。`;
        return;
      }
      root.dataset.state = "correct";
      action.textContent = "重新开始";
      feedback.innerHTML = "<strong>推理完成</strong>已经走完全部步骤。";
      pi.hidden = false;
      window.requestAnimationFrame(() => triggerPiBurst(root));
    });
  }

  function enhanceExample(section, root) {
    const host = root.querySelector(`#${CSS.escape(section.id)}-example`);
    const example = section.example;
    if (!host || !example || host.dataset.exampleChallengeReady === "true") return;

    const choiceMode = Array.isArray(example.choices) && example.choices.length >= 2;
    host.innerHTML = choiceMode ? renderChoiceChallenge(section) : renderStepChallenge(section);
    const challenge = host.querySelector("[data-example-challenge]");
    if (choiceMode) bindChoiceChallenge(challenge, example);
    else bindStepChallenge(challenge, example);
    host.dataset.exampleChallengeReady = "true";
  }

  window.defineChapter4LessonEnhancer?.(enhanceExample);
  window.defineChapter2LessonEnhancer?.(enhanceExample);
  window.defineChapter3LessonEnhancer?.(enhanceExample);
})();
