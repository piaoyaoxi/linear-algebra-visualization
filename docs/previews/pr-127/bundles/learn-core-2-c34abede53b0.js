
;/* visuals/example-challenge.js */
(() => {
  /*
   * Content files tend to list the correct choice first. Show choices in a
   * fixed order derived from the question text, so the order is the same on
   * every visit but the correct answer is not always "A". Input values keep
   * the original index, so answer checking is unchanged.
   */
  function displayOrder(example) {
    const n = example.choices.length;
    let seed = 2166136261;
    for (const ch of String(example.question || example.title || "")) seed = Math.imul(seed ^ ch.codePointAt(0), 16777619) >>> 0;
    const next = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const order = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i -= 1) {
      const j = Math.floor(next() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }

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
            ${displayOrder(example)
              .map(
                (index, position) => [example.choices[index], index, position],
              )
              .map(
                ([choice, index, position]) => `
                  <label class="example-choice">
                    <input type="radio" name="${fieldName}" value="${index}" />
                    <span class="example-choice-marker" aria-hidden="true">${String.fromCharCode(65 + position)}</span>
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
  window.defineChapter1LessonEnhancer?.(enhanceExample);
  window.defineChapter7LessonEnhancer?.(enhanceExample);
})();


;/* visuals/ch4/mount.js */
/* Attach Chapter 4 presentation modules after the generic lesson shell renders. */
(() => {
  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage !== "function") return;

  window.renderLessonPage = function renderLessonPageWithChapter4Extensions(section, chapter) {
    baseRenderLessonPage(section, chapter);
    window.mountChapter4Lesson?.(section, document.querySelector("#mainContent"));
  };
})();


;/* visuals/ch3/shared-math.js */
/* Chapter 3 exact linear-algebra engine and drawing helpers. */
(() => {
  const EPS = 1e-9;

  function gcd(a, b) {
    let x = Math.abs(Math.trunc(a));
    let y = Math.abs(Math.trunc(b));
    while (y) [x, y] = [y, x % y];
    return x || 1;
  }

  function F(n = 0, d = 1) {
    if (typeof n === "object" && n && Number.isFinite(n.n) && Number.isFinite(n.d)) {
      d = n.d;
      n = n.n;
    }
    n = Number(n);
    d = Number(d);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) {
      throw new RangeError("Invalid rational number");
    }
    if (!Number.isInteger(n) || !Number.isInteger(d)) {
      return fromNumber(n / d);
    }
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d);
    return Object.freeze({ n: n / g, d: d / g });
  }

  function fromNumber(value, maxDenominator = 1000) {
    if (typeof value === "object" && value && "n" in value && "d" in value) return F(value.n, value.d);
    const x = Number(value);
    if (!Number.isFinite(x)) throw new RangeError("Non-finite number");
    if (Number.isInteger(x)) return F(x, 1);
    const sign = x < 0 ? -1 : 1;
    let target = Math.abs(x);
    let h1 = 1;
    let h0 = 0;
    let k1 = 0;
    let k0 = 1;
    let b = target;
    for (let i = 0; i < 24; i += 1) {
      const a = Math.floor(b);
      const h2 = a * h1 + h0;
      const k2 = a * k1 + k0;
      if (k2 > maxDenominator) break;
      [h0, h1] = [h1, h2];
      [k0, k1] = [k1, k2];
      const frac = b - a;
      if (frac < Number.EPSILON) break;
      b = 1 / frac;
    }
    return F(sign * h1, k1 || 1);
  }

  function parseF(value) {
    if (typeof value === "object" && value && "n" in value) return F(value);
    if (typeof value === "number") return fromNumber(value);
    const text = String(value ?? "").trim().replace(/−/g, "-");
    if (!text) return F(0);
    const fraction = text.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
    if (fraction) return F(Number(fraction[1]), Number(fraction[2]));
    const n = Number(text);
    if (!Number.isFinite(n)) throw new TypeError(`Cannot parse rational: ${text}`);
    return fromNumber(n);
  }

  const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
  const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
  const mul = (a, b) => F(a.n * b.n, a.d * b.d);
  function div(a, b) {
    if (!b || b.n === 0) throw new RangeError("Division by zero");
    return F(a.n * b.d, a.d * b.n);
  }
  const neg = (a) => F(-a.n, a.d);
  const isZero = (a) => !a || a.n === 0;
  const eq = (a, b) => Boolean(a && b && a.n === b.n && a.d === b.d);
  const toNumber = (a) => (a ? a.n / a.d : 0);
  const absF = (a) => F(Math.abs(a.n), a.d);

  function formatF(a) {
    if (!a || a.n === 0) return "0";
    return a.d === 1 ? String(a.n) : `${a.n}/${a.d}`;
  }

  function latexF(a) {
    if (!a || a.n === 0) return "0";
    if (a.d === 1) return String(a.n);
    return a.n < 0 ? `-\\frac{${-a.n}}{${a.d}}` : `\\frac{${a.n}}{${a.d}}`;
  }

  function formatNumber(value, digits = 2) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0";
    const rounded = Math.round(n * 10 ** digits) / 10 ** digits;
    return Math.abs(rounded) < 10 ** (-(digits + 1)) ? "0" : String(rounded);
  }

  function cloneMat(matrix) {
    return matrix.map((row) => row.map((value) => F(value)));
  }

  function matFromNumbers(rows) {
    return rows.map((row) => row.map(parseF));
  }

  function matToNumbers(matrix) {
    return matrix.map((row) => row.map(toNumber));
  }

  function rowSwap(matrix, i, j) {
    const out = cloneMat(matrix);
    [out[i], out[j]] = [out[j], out[i]];
    return out;
  }

  function rowScale(matrix, row, factor) {
    const k = parseF(factor);
    if (isZero(k)) throw new RangeError("A row may only be scaled by a nonzero number");
    const out = cloneMat(matrix);
    out[row] = out[row].map((value) => mul(value, k));
    return out;
  }

  function rowAdd(matrix, target, source, factor) {
    const k = parseF(factor);
    const out = cloneMat(matrix);
    out[target] = out[target].map((value, column) => add(value, mul(out[source][column], k)));
    return out;
  }

  function changedRows(before, after) {
    const result = [];
    after.forEach((row, i) => {
      if (!before[i] || row.some((value, j) => !eq(value, before[i][j]))) result.push(i);
    });
    return result;
  }

  function rref(matrix, pivotColumnCount = matrix[0]?.length ?? 0) {
    let out = cloneMat(matrix);
    const rows = out.length;
    const columns = out[0]?.length ?? 0;
    const pivotLimit = Math.min(pivotColumnCount, columns);
    const pivots = [];
    let pivotRow = 0;

    for (let column = 0; column < pivotLimit && pivotRow < rows; column += 1) {
      let candidate = -1;
      for (let row = pivotRow; row < rows; row += 1) {
        if (!isZero(out[row][column])) {
          if (candidate < 0 || Math.abs(toNumber(out[row][column])) > Math.abs(toNumber(out[candidate][column]))) {
            candidate = row;
          }
        }
      }
      if (candidate < 0) continue;
      if (candidate !== pivotRow) out = rowSwap(out, candidate, pivotRow);
      out = rowScale(out, pivotRow, div(F(1), out[pivotRow][column]));
      for (let row = 0; row < rows; row += 1) {
        if (row === pivotRow || isZero(out[row][column])) continue;
        out = rowAdd(out, row, pivotRow, neg(out[row][column]));
      }
      pivots.push(column);
      pivotRow += 1;
    }
    return { matrix: out, pivots };
  }

  function echelon(matrix, pivotColumnCount = matrix[0]?.length ?? 0) {
    let out = cloneMat(matrix);
    const rows = out.length;
    const columns = out[0]?.length ?? 0;
    const pivotLimit = Math.min(pivotColumnCount, columns);
    const pivots = [];
    const steps = [];
    let pivotRow = 0;

    for (let column = 0; column < pivotLimit && pivotRow < rows; column += 1) {
      let candidate = -1;
      for (let row = pivotRow; row < rows; row += 1) {
        if (!isZero(out[row][column])) {
          candidate = row;
          break;
        }
      }
      if (candidate < 0) continue;
      if (candidate !== pivotRow) {
        out = rowSwap(out, candidate, pivotRow);
        steps.push({ label: `R_${pivotRow + 1}\\leftrightarrow R_${candidate + 1}`, matrix: cloneMat(out) });
      }
      const pivot = out[pivotRow][column];
      if (!eq(pivot, F(1))) {
        out = rowScale(out, pivotRow, div(F(1), pivot));
        steps.push({ label: `R_${pivotRow + 1}\\leftarrow ${latexF(div(F(1), pivot))}R_${pivotRow + 1}`, matrix: cloneMat(out) });
      }
      for (let row = pivotRow + 1; row < rows; row += 1) {
        if (isZero(out[row][column])) continue;
        const factor = neg(out[row][column]);
        out = rowAdd(out, row, pivotRow, factor);
        steps.push({ label: `R_${row + 1}\\leftarrow R_${row + 1}+(${latexF(factor)})R_${pivotRow + 1}`, matrix: cloneMat(out) });
      }
      pivots.push(column);
      pivotRow += 1;
    }
    return { matrix: out, pivots, steps };
  }

  function analyzeAugmented(augmented) {
    const rowCount = augmented.length;
    const variableCount = (augmented[0]?.length ?? 1) - 1;
    const reduced = rref(augmented, variableCount);
    const free = [];
    for (let column = 0; column < variableCount; column += 1) {
      if (!reduced.pivots.includes(column)) free.push(column);
    }
    const inconsistentRows = [];
    reduced.matrix.forEach((row, index) => {
      if (row.slice(0, variableCount).every(isZero) && !isZero(row[variableCount])) inconsistentRows.push(index);
    });
    const rankA = reduced.pivots.length;
    const rankAug = rankA + (inconsistentRows.length ? 1 : 0);
    return {
      rref: reduced.matrix,
      pivots: reduced.pivots,
      free,
      inconsistent: inconsistentRows.length > 0,
      inconsistentRows,
      rankA,
      rankAug,
      m: rowCount,
      n: variableCount,
    };
  }

  function rankOf(matrix) {
    if (!matrix.length || !matrix[0].length) return 0;
    return rref(matrix, matrix[0].length).pivots.length;
  }

  function nullspaceBasis(matrix) {
    const A = cloneMat(matrix);
    const n = A[0]?.length ?? 0;
    const augmented = A.map((row) => [...row, F(0)]);
    const info = analyzeAugmented(augmented);
    const pivotRow = new Map(info.pivots.map((column, row) => [column, row]));
    const basis = info.free.map((freeColumn) => {
      const vector = Array.from({ length: n }, () => F(0));
      vector[freeColumn] = F(1);
      info.pivots.forEach((pivotColumn) => {
        vector[pivotColumn] = neg(info.rref[pivotRow.get(pivotColumn)][freeColumn]);
      });
      return vector;
    });
    return { basis, info };
  }

  function particularSolution(augmented) {
    const info = analyzeAugmented(augmented);
    if (info.inconsistent) return { ok: false, x: [], info };
    const x = Array.from({ length: info.n }, () => F(0));
    info.pivots.forEach((pivotColumn, row) => {
      x[pivotColumn] = info.rref[row][info.n];
    });
    return { ok: true, x, info };
  }

  function classifySystem(augmented) {
    const info = analyzeAugmented(augmented);
    if (info.inconsistent) return { key: "none", label: "无解", cls: "is-bad", info };
    if (info.free.length) return { key: "infinite", label: "无穷多解", cls: "is-inf", info };
    return { key: "unique", label: "唯一解", cls: "is-ok", info };
  }

  function matVec(matrix, vector) {
    return matrix.map((row) => row.reduce((sum, value, column) => add(sum, mul(value, vector[column])), F(0)));
  }

  function relationCertificate(vectors) {
    if (!vectors.length) return { dependent: false, coeffs: [], rank: 0 };
    const ambient = vectors[0].length;
    const matrix = Array.from({ length: ambient }, (_, row) => vectors.map((vector) => parseF(vector[row])));
    const { basis, info } = nullspaceBasis(matrix);
    if (!basis.length) return { dependent: false, coeffs: [], rank: info.rankA };
    let coeffs = basis[0].map(F);
    const denominators = coeffs.map((c) => c.d);
    const lcm = denominators.reduce((acc, value) => (acc * value) / gcd(acc, value), 1);
    coeffs = coeffs.map((c) => F(c.n * (lcm / c.d)));
    const common = coeffs.reduce((acc, c) => gcd(acc, c.n), 0) || 1;
    coeffs = coeffs.map((c) => F(c.n / common));
    const first = coeffs.find((c) => !isZero(c));
    if (first?.n < 0) coeffs = coeffs.map(neg);
    return { dependent: true, coeffs, rank: info.rankA };
  }

  function determinant(matrix) {
    const n = matrix.length;
    if (!n || matrix.some((row) => row.length !== n)) throw new TypeError("Determinant requires a square matrix");
    if (n === 1) return F(matrix[0][0]);
    if (n === 2) return sub(mul(matrix[0][0], matrix[1][1]), mul(matrix[0][1], matrix[1][0]));
    let sum = F(0);
    matrix[0].forEach((value, column) => {
      const minor = matrix.slice(1).map((row) => row.filter((_, j) => j !== column));
      const term = mul(value, determinant(minor));
      sum = column % 2 === 0 ? add(sum, term) : sub(sum, term);
    });
    return sum;
  }

  function combinations(items, choose) {
    const out = [];
    function walk(start, picked) {
      if (picked.length === choose) {
        out.push(picked.slice());
        return;
      }
      for (let i = start; i <= items.length - (choose - picked.length); i += 1) {
        picked.push(items[i]);
        walk(i + 1, picked);
        picked.pop();
      }
    }
    walk(0, []);
    return out;
  }

  function findRankCertificate(matrix) {
    const rank = rankOf(matrix);
    if (rank === 0) return { rank, rows: [], columns: [], det: F(0) };
    const rowSets = combinations(Array.from({ length: matrix.length }, (_, i) => i), rank);
    const columnSets = combinations(Array.from({ length: matrix[0].length }, (_, i) => i), rank);
    for (const rows of rowSets) {
      for (const columns of columnSets) {
        const minor = rows.map((row) => columns.map((column) => matrix[row][column]));
        const det = determinant(minor);
        if (!isZero(det)) return { rank, rows, columns, det };
      }
    }
    return { rank, rows: [], columns: [], det: F(0) };
  }

  function independentColumnIndices(matrix) {
    return rref(matrix, matrix[0]?.length ?? 0).pivots;
  }

  function latexMatrix(matrix, barAt = null) {
    const alignment = barAt == null ? "" : `{${"c".repeat(barAt)}|${"c".repeat(matrix[0].length - barAt)}}`;
    const env = barAt == null ? "bmatrix" : "array";
    const body = matrix.map((row) => row.map(latexF).join(" & ")).join(" \\\\ ");
    return barAt == null
      ? `\\begin{${env}}${body}\\end{${env}}`
      : `\\left[\\begin{array}${alignment}${body}\\end{array}\\right]`;
  }

  function latexVector(vector) {
    return `\\begin{bmatrix}${vector.map(latexF).join(" \\\\ ")}\\end{bmatrix}`;
  }

  function latexRelation(coeffs, names = coeffs.map((_, i) => `v_{${i + 1}}`)) {
    const terms = [];
    coeffs.forEach((coefficient, index) => {
      if (isZero(coefficient)) return;
      const magnitude = absF(coefficient);
      const coeff = eq(magnitude, F(1)) ? "" : latexF(magnitude);
      const body = `${coeff}${names[index]}`;
      if (!terms.length) terms.push(coefficient.n < 0 ? `-${body}` : body);
      else terms.push(coefficient.n < 0 ? `- ${body}` : `+ ${body}`);
    });
    return `${terms.join(" ") || "0"}=0`;
  }

  function latexEquation(row, variableCount) {
    const names = variableCount <= 3 ? ["x", "y", "z"] : [];
    const terms = [];
    for (let column = 0; column < variableCount; column += 1) {
      const coefficient = row[column];
      if (isZero(coefficient)) continue;
      const variable = names[column] || `x_{${column + 1}}`;
      const magnitude = absF(coefficient);
      const coeff = eq(magnitude, F(1)) ? "" : latexF(magnitude);
      const body = `${coeff}${variable}`;
      if (!terms.length) terms.push(coefficient.n < 0 ? `-${body}` : body);
      else terms.push(coefficient.n < 0 ? `- ${body}` : `+ ${body}`);
    }
    return `${terms.join(" ") || "0"}=${latexF(row[variableCount])}`;
  }

  const tex = (source) => (window.texInline ? window.texInline(source) : escapeHtml(source));
  const texD = (source) => (window.texDisplay ? window.texDisplay(source) : escapeHtml(source));
  const htmlMatrix = (matrix, barAt = null) => `<div class="ch3-math">${texD(latexMatrix(matrix, barAt))}</div>`;
  const htmlVector = (vector) => `<span class="ch3-vector">${tex(latexVector(vector))}</span>`;

  function htmlEquations(augmented, highlighted = []) {
    const variableCount = augmented[0].length - 1;
    return `<div class="ch3-equations">${augmented
      .map(
        (row, index) =>
          // the row name R_i, a quad, then the equation
          `<div class="ch3-equation${highlighted.includes(index) ? " is-changed" : ""}">${tex(`R_${index + 1}\\quad ${latexEquation(row, variableCount)}`)}</div>`,
      )
      .join("")}</div>`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function palette() {
    const styles = getComputedStyle(document.body);
    const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
    return {
      text: read("--text", "#18201d"),
      muted: read("--muted", "#6b756f"),
      line: read("--line", "#d9dfdc"),
      surface: read("--surface-solid", "#ffffff"),
      accent: read("--accent", "#2f8f72"),
      accentStrong: read("--accent-strong", "#176f57"),
      blue: read("--blue", "#547ec8"),
      coral: read("--coral", "#d9835f"),
    };
  }

  function sizeCanvas(canvas) {
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height, dpr };
  }

  function drawAxes(ctx, width, height, scale = 44) {
    const p = palette();
    const cx = width / 2;
    const cy = height / 2;
    ctx.save();
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    for (let x = cx % scale; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = cy % scale; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.strokeStyle = p.muted;
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();
    ctx.restore();
    return { ctx, width, height, scale, cx, cy, p };
  }

  const toCanvas = (frame, point) => [frame.cx + point[0] * frame.scale, frame.cy - point[1] * frame.scale];
  const toWorld = (frame, point) => [(point[0] - frame.cx) / frame.scale, (frame.cy - point[1]) / frame.scale];

  function drawArrowBetween(ctx, frame, from, to, color, label = "", width = 3, options = {}) {
    const [x1, y1] = toCanvas(frame, from);
    const [x2, y2] = toCanvas(frame, to);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    if (length < 1.5) {
      if (label) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.font = "750 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
        ctx.fillText(label, x1 + 9, y1 - 9);
        ctx.restore();
      }
      return;
    }
    const ux = dx / length;
    const uy = dy / length;
    const px = -uy;
    const py = ux;
    const headLength = Math.min(16, Math.max(11, length * 0.17));
    const headHalf = Math.min(7.2, Math.max(5.4, width * 2.05));
    const neckX = x2 - ux * headLength;
    const neckY = y2 - uy * headLength;

    ctx.save();
    ctx.globalAlpha = options.alpha ?? 1;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (options.dashed) ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(neckX, neckY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(neckX + px * headHalf, neckY + py * headHalf);
    ctx.quadraticCurveTo(neckX, neckY, neckX - px * headHalf, neckY - py * headHalf);
    ctx.closePath();
    ctx.fill();

    if (options.tailDot) {
      ctx.beginPath();
      ctx.arc(x1, y1, Math.max(2.2, width * 0.8), 0, Math.PI * 2);
      ctx.fill();
    }

    if (label) {
      ctx.font = "760 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      const metrics = ctx.measureText(label);
      const padX = 7;
      const boxW = metrics.width + padX * 2;
      const boxH = 22;
      const labelT = options.labelT ?? 1;
      const labelOffset = options.labelOffset ?? 0;
      const anchorX = x1 + dx * labelT + px * labelOffset;
      const anchorY = y1 + dy * labelT + py * labelOffset;
      let labelX = anchorX + (ux >= 0 ? 8 : -boxW - 8);
      let labelY = anchorY + (uy >= 0 ? 7 : -boxH - 7);
      labelX = Math.max(4, Math.min(frame.width - boxW - 4, labelX));
      labelY = Math.max(4, Math.min(frame.height - boxH - 4, labelY));
      ctx.globalAlpha = 0.94;
      ctx.fillStyle = frame.p.surface;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY, boxW, boxH, 11);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.textBaseline = "middle";
      ctx.fillText(label, labelX + padX, labelY + boxH / 2 + 0.5);
    }
    ctx.restore();
  }

  function drawArrow(ctx, frame, point, color, label = "", width = 3, options = {}) {
    drawArrowBetween(ctx, frame, [0, 0], point, color, label, width, options);
  }

  function drawPoint(ctx, frame, point, color, label = "", radius = 5) {
    const [x, y] = toCanvas(frame, point);
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    if (label) {
      ctx.font = "700 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
      ctx.fillText(label, x + 8, y - 8);
    }
    ctx.restore();
  }

  function drawLineEquation(ctx, frame, a, b, c, color, width = 2.3) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    const limit = Math.max(frame.width, frame.height) / frame.scale + 3;
    let p1;
    let p2;
    if (Math.abs(b) > EPS) {
      p1 = [-limit, (c + a * limit) / b];
      p2 = [limit, (c - a * limit) / b];
    } else if (Math.abs(a) > EPS) {
      p1 = [c / a, -limit];
      p2 = [c / a, limit];
    } else {
      ctx.restore();
      return;
    }
    const A = toCanvas(frame, p1);
    const B = toCanvas(frame, p2);
    ctx.beginPath();
    ctx.moveTo(A[0], A[1]);
    ctx.lineTo(B[0], B[1]);
    ctx.stroke();
    ctx.restore();
  }

  function drawSpan(ctx, frame, vectors, color) {
    const cert = relationCertificate(vectors);
    ctx.save();
    if (cert.rank >= 2) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.08;
      ctx.fillRect(0, 0, frame.width, frame.height);
    } else if (cert.rank === 1) {
      const vector = vectors.find((v) => Math.hypot(v[0], v[1]) > EPS) || [1, 0];
      const A = toCanvas(frame, [-12 * vector[0], -12 * vector[1]]);
      const B = toCanvas(frame, [12 * vector[0], 12 * vector[1]]);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(A[0], A[1]);
      ctx.lineTo(B[0], B[1]);
      ctx.stroke();
    }
    ctx.restore();
  }

  function createScope(root) {
    const cleanups = [];
    const listen = (target, type, handler, options) => {
      target?.addEventListener(type, handler, options);
      cleanups.push(() => target?.removeEventListener(type, handler, options));
      return handler;
    };
    const resize = (handler) => listen(window, "resize", () => {
      if (document.body.contains(root)) handler();
    }, { passive: true });
    const cleanup = () => {
      while (cleanups.length) {
        try {
          cleanups.pop()();
        } catch (_) {
          // Ignore teardown failures; a stale lesson must never break navigation.
        }
      }
    };
    return { listen, resize, cleanup };
  }

  function bindDraggablePoints(scope, canvas, getPoints, setPoint, redraw, radius = 16) {
    let active = -1;
    function frameForEvent() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      return {
        width: rect.width,
        height: rect.height,
        scale: 44,
        cx: rect.width / 2,
        cy: rect.height / 2,
        p: palette(),
      };
    }
    scope.listen(canvas, "pointerdown", (event) => {
      const frame = frameForEvent();
      if (!frame) return;
      const rect = canvas.getBoundingClientRect();
      const pointer = [event.clientX - rect.left, event.clientY - rect.top];
      const points = getPoints();
      let best = Infinity;
      points.forEach((point, index) => {
        const [x, y] = toCanvas(frame, point);
        const distance = Math.hypot(x - pointer[0], y - pointer[1]);
        if (distance < radius && distance < best) {
          active = index;
          best = distance;
        }
      });
      if (active >= 0) {
        canvas.setPointerCapture(event.pointerId);
        event.preventDefault();
      }
    });
    scope.listen(canvas, "pointermove", (event) => {
      if (active < 0) return;
      const frame = frameForEvent();
      const rect = canvas.getBoundingClientRect();
      const world = toWorld(frame, [event.clientX - rect.left, event.clientY - rect.top]);
      setPoint(active, world.map((value) => Math.round(value * 20) / 20));
      redraw();
    });
    const release = (event) => {
      if (active >= 0 && canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      active = -1;
    };
    scope.listen(canvas, "pointerup", release);
    scope.listen(canvas, "pointercancel", release);
  }

  function pulse(element) {
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    element.classList.remove("is-pulse");
    void element.offsetWidth;
    element.classList.add("is-pulse");
  }

  const PRESETS = Object.freeze({
    systems: {
      unique2: { label: "唯一解", aug: [[1, 1, 3], [1, 2, 4]] },
      parallel2: { label: "平行无解", aug: [[1, 1, 2], [2, 2, 5]] },
      sameLine2: { label: "重合无穷多解", aug: [[1, 1, 2], [2, 2, 4]] },
      swapPivot: { label: "需要换行", aug: [[0, 1, 2], [1, 1, 3]] },
      upper3: { label: "三元上三角", aug: [[1, 1, 1, 6], [0, 1, 1, 3], [0, 0, 1, 1]] },
    },
    rank: {
      full2: { label: "满秩 2×2", A: [[1, 0], [0, 1]] },
      rankOne: { label: "秩一外积", A: [[1, 2], [2, 4]] },
      fullCol32: { label: "3×2 满列秩", A: [[1, 0], [0, 1], [1, 1]] },
      dependent33: { label: "3×3 秩二", A: [[1, 2, 3], [2, 4, 6], [0, 1, 1]] },
    },
  });

  window.Ch3Math = Object.freeze({
    EPS,
    F,
    fromNumber,
    parseF,
    add,
    sub,
    mul,
    div,
    neg,
    absF,
    isZero,
    eq,
    toNumber,
    formatF,
    latexF,
    formatNumber,
    cloneMat,
    matFromNumbers,
    matToNumbers,
    rowSwap,
    rowScale,
    rowAdd,
    changedRows,
    rref,
    echelon,
    analyzeAugmented,
    rankOf,
    nullspaceBasis,
    particularSolution,
    classifySystem,
    matVec,
    relationCertificate,
    determinant,
    findRankCertificate,
    independentColumnIndices,
    latexMatrix,
    latexVector,
    latexRelation,
    latexEquation,
    tex,
    texD,
    htmlMatrix,
    htmlVector,
    htmlEquations,
    escapeHtml,
    palette,
    sizeCanvas,
    drawAxes,
    toCanvas,
    toWorld,
    drawArrow,
    drawArrowBetween,
    drawPoint,
    drawLineEquation,
    drawSpan,
    createScope,
    bindDraggablePoints,
    pulse,
    PRESETS,
  });
})();


;/* visuals/shared/stable-shuffle.js */
/*
 * Stable shuffle for prediction options: the order depends only on the key
 * (the question text), so a page always shows the same order, but the correct
 * option is no longer always first.
 */
(() => {
  window.LAStableShuffle = function stableShuffle(items, key) {
    let seed = 2166136261;
    for (const ch of String(key)) seed = Math.imul(seed ^ ch.codePointAt(0), 16777619) >>> 0;
    const rand = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
})();


;/* visuals/shared/predict-gate.js */
/*
 * Prediction gate (predict → act → reveal), the same markup and behaviour as the
 * gates in visuals/ch4/section5-blocks.js and section6-elementary.js, so
 * design-a.css styles it (.ch3l-predict, options with data-ok / data-why).
 *
 *   const gate = LAPredictGate.mount(container, {
 *     question: "…",                       // HTML
 *     options: [["text", true, ""], ["text", false, "why it is wrong"]],
 *     key: "visuals/…",                     // stable shuffle key
 *     right: "✓ …",                         // HTML shown when the pick was right
 *     root,                                 // the lab: any action inside it (outside the gate) reveals
 *     manual: false,                        // true: only gate.acted() reveals
 *     onPick(), onReveal(ok),
 *   });
 *   gate.picked  → true once a prediction is chosen
 *   gate.revealed → true once the verdict is shown
 *   gate.acted() → call after the lab's own action; reveals when a prediction exists
 *
 * Until a prediction is picked, the lab's `.is-primary` buttons (outside the gate)
 * stay disabled, as in visuals/shared/lab-layout.js.
 */
(() => {
  const shuffle = (items, key) => (window.LAStableShuffle ? window.LAStableShuffle(items, key) : items);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

  function mount(container, opts) {
    const root = opts.root || container;
    const options = shuffle(opts.options, opts.key || opts.question);
    container.innerHTML = `<div class="ch3l-predict"><div class="ch3l-predict-q"><span>先猜一猜</span><p>${opts.question}</p></div>
      <div class="ch3l-predict-options">${options.map(([t, ok, why], i) => `<button type="button" data-i="${i}" data-ok="${ok}" data-why="${esc(why || "")}">${t}</button>`).join("")}</div><p class="ch3l-predict-feedback" hidden></p></div>`;
    const box = container.querySelector(".ch3l-predict");
    const fb = box.querySelector(".ch3l-predict-feedback");
    const api = { picked: false, revealed: false, ok: false };
    let picked = null;

    const primaries = () => [...root.querySelectorAll("button.is-primary")].filter((b) => !box.contains(b));
    const lockPrimaries = () => {
      primaries().forEach((b) => {
        if (!api.picked && !b.disabled) { b.disabled = true; b.dataset.laGated = "1"; b.title = "先在上方猜一猜"; }
        else if (api.picked && b.dataset.laGated) { b.disabled = false; delete b.dataset.laGated; b.removeAttribute("title"); }
      });
    };
    api.relock = lockPrimaries;

    api.reveal = () => {
      if (api.revealed || !picked) return;
      api.revealed = true;
      api.ok = picked.dataset.ok === "true";
      box.querySelectorAll("[data-i]").forEach((x) => x.classList.remove("is-picked"));
      picked.classList.add(api.ok ? "is-right" : "is-wrong");
      box.classList.add("is-done");
      fb.innerHTML = api.ok ? opts.right : `再看看图：${picked.dataset.why}`;
      opts.onReveal?.(api.ok);
    };
    api.acted = () => api.reveal();

    box.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => {
      if (api.revealed) return;
      picked = b;
      api.picked = true;
      box.querySelectorAll("[data-i]").forEach((x) => x.classList.toggle("is-picked", x === b));
      fb.hidden = false;
      fb.textContent = "记下了你的猜测。现在动手操作一次，结论随后出现。";
      lockPrimaries();
      opts.onPick?.();
    }));

    if (!opts.manual) {
      const acted = (e) => { if (!box.contains(e.target)) api.reveal(); };
      ["input", "change", "pointerup"].forEach((t) => root.addEventListener(t, acted));
      root.addEventListener("click", (e) => { if (e.target.closest("button") && !box.contains(e.target)) api.reveal(); });
    }
    lockPrimaries();
    return api;
  }

  window.LAPredictGate = { mount };
})();


;/* visuals/shared/scene3d.js */
/*
 * Shared orthographic 3D scene for linear-algebra lessons.
 *
 * A scene draws a declarative list of objects (planes clipped to a viewing
 * cube, lines, arrows, points, polygons) on a 2D canvas with painter's
 * ordering. The student can orbit the camera, snap to "look along" a
 * direction, and drag handles that are constrained to the screen plane, a
 * given plane, or a given line.
 *
 * Usage:
 *   const scene = LAScene3D.create(host, { range: 4, yaw: -0.9, pitch: 0.42 });
 *   scene.setObjects(() => [...]);      // called on every render
 *   scene.setHandles([...]);            // draggable points
 *   scene.render();
 *   scene.destroy();
 *
 * Optional object flags (all backward compatible):
 *   ghost: true     the previous state of an object: same colour, dashed, ~35% alpha
 *   glow: true | k  highlight: a wide underlay in the same colour (k scales its strength)
 *   keepClear: true (polygon) an axis name that would fall inside this polygon is not drawn
 * Optional scene options:
 *   spreadLabels    nudge overlapping labels apart in screen space
 *   labelSafe       (with spreadLabels) treat each drag handle as a centred 26px obstacle,
 *                   try a few more positions, and keep every label fully inside the canvas
 *   clampLabels     keep every label fully inside the canvas (also without spreadLabels)
 *   scene.setRange(L, animate) zooms the viewing cube.
 *   scene.fitRange(points, { pad, min, max, animate }) zooms to the given points.
 *   scene.fitView(points, { pad, animate }) centres and magnifies the view on the given
 *   points (planes stay clipped to the same cube); scene.resetFit() undoes it.
 */
(() => {
  const V = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    len: (a) => Math.hypot(a[0], a[1], a[2]),
    norm: (a) => {
      const l = Math.hypot(a[0], a[1], a[2]);
      return l < 1e-12 ? [0, 0, 0] : [a[0] / l, a[1] / l, a[2] / l];
    },
  };

  const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  function cssColor(style, name, fallback) {
    const value = style.getPropertyValue(name).trim();
    return value || fallback;
  }

  function palette(host) {
    const style = getComputedStyle(host);
    const dark = document.body.classList.contains("dark");
    return {
      dark,
      text: cssColor(style, "--text", "#18212c"),
      muted: cssColor(style, "--muted", "#66717f"),
      faint: cssColor(style, "--faint", "#8b96a5"),
      line: cssColor(style, "--line-strong", "rgba(28,43,61,.2)"),
      accent: cssColor(style, "--accent", "#0f8f88"),
      coral: cssColor(style, "--coral", "#d46b4f"),
      blue: cssColor(style, "--blue", "#335eea"),
      gold: cssColor(style, "--gold", "#b78a1b"),
      violet: cssColor(style, "--violet", "#7258ca"),
      // colour roles (tokens.css): labs should prefer these to hue names
      v1: cssColor(style, "--cv-v1", "#2a64a8"),
      v2: cssColor(style, "--cv-v2", "#c4552f"),
      drag: cssColor(style, "--cv-drag", "#a87a12"),
      image: cssColor(style, "--cv-image", "#8c4f86"),
      subspace: cssColor(style, "--cv-subspace", "#2c5e4a"),
      axis: cssColor(style, "--cv-axis", "#8a8d84"),
      paper: dark ? "rgba(14,18,27,0)" : "rgba(255,255,255,0)",
    };
  }

  /* Resolve a color token ("accent", "coral", ...) or pass a literal through. */
  function resolve(pal, color) {
    if (!color) return pal.accent;
    return pal[color] || color;
  }

  function withAlpha(color, alpha) {
    if (color.startsWith("#")) {
      const hex = color.length === 4 ? color.replace(/#(.)(.)(.)/, "#$1$1$2$2$3$3") : color;
      const n = parseInt(hex.slice(1, 7), 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
    }
    const m = color.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const [r, g, b] = m[1].split(",").map((x) => parseFloat(x));
      return `rgba(${r},${g},${b},${alpha})`;
    }
    return color;
  }

  /* Polygon of the plane n·x = d inside the cube [-L, L]^3 (may be empty). */
  function clipPlane(n, d, L) {
    const corners = [];
    for (const x of [-L, L]) for (const y of [-L, L]) for (const z of [-L, L]) corners.push([x, y, z]);
    const edges = [];
    for (let i = 0; i < 8; i += 1) {
      for (let j = i + 1; j < 8; j += 1) {
        const a = corners[i];
        const b = corners[j];
        const diff = (a[0] !== b[0]) + (a[1] !== b[1]) + (a[2] !== b[2]);
        if (diff === 1) edges.push([a, b]);
      }
    }
    const pts = [];
    const eps = 1e-9 * Math.max(1, Math.abs(d) + V.len(n) * L);
    // Corners lying exactly on the plane.
    corners.forEach((c) => {
      if (Math.abs(V.dot(n, c) - d) <= eps) pts.push(c);
    });
    // Proper crossings strictly inside an edge.
    for (const [a, b] of edges) {
      const fa = V.dot(n, a) - d;
      const fb = V.dot(n, b) - d;
      if (Math.abs(fa) <= eps || Math.abs(fb) <= eps) continue;
      if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) {
        const t = fa / (fa - fb);
        pts.push(V.add(a, V.mul(V.sub(b, a), t)));
      }
    }
    if (pts.length < 3) return [];
    const unique = [];
    pts.forEach((p) => {
      if (!unique.some((q) => V.len(V.sub(p, q)) < 1e-7)) unique.push(p);
    });
    if (unique.length < 3) return [];
    const c = V.mul(unique.reduce((s, p) => V.add(s, p), [0, 0, 0]), 1 / unique.length);
    const nn = V.norm(n);
    const helper = Math.abs(nn[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    const e1 = V.norm(V.cross(nn, helper));
    const e2 = V.cross(nn, e1);
    return unique
      .map((p) => ({ p, a: Math.atan2(V.dot(V.sub(p, c), e2), V.dot(V.sub(p, c), e1)) }))
      .sort((x, y) => x.a - y.a)
      .map((x) => x.p);
  }

  /* Clip the infinite line p + t·dir to the cube; returns [a, b] or null. */
  function clipLine(p, dir, L) {
    let t0 = -Infinity;
    let t1 = Infinity;
    for (let k = 0; k < 3; k += 1) {
      if (Math.abs(dir[k]) < 1e-12) {
        if (p[k] < -L - 1e-9 || p[k] > L + 1e-9) return null;
      } else {
        let a = (-L - p[k]) / dir[k];
        let b = (L - p[k]) / dir[k];
        if (a > b) [a, b] = [b, a];
        t0 = Math.max(t0, a);
        t1 = Math.min(t1, b);
      }
    }
    if (t0 > t1) return null;
    return [V.add(p, V.mul(dir, t0)), V.add(p, V.mul(dir, t1))];
  }

  const GHOST_DASH = [5, 5];
  const glowOf = (o) => (o.glow ? (typeof o.glow === "number" ? o.glow : 1) : 0);
  /* Stroke style of a line-like object: ghosts are dashed and faint. */
  function lineStyle(o) {
    return {
      dash: o.dash || (o.ghost ? GHOST_DASH : undefined),
      alpha: o.alpha ?? (o.ghost ? 0.35 : 1),
      glow: glowOf(o),
    };
  }

  function create(host, options = {}) {
    // every scene keeps its labels apart and inside the canvas unless it asks otherwise
    options = { spreadLabels: true, labelSafe: true, ...options };
    let L = options.range || 4;
    const defaults = { yaw: options.yaw ?? -0.95, pitch: options.pitch ?? 0.42 };
    const camera = { yaw: defaults.yaw, pitch: defaults.pitch };
    let objectsFn = () => [];
    // view centre and magnification (opt-in through fitView; the defaults change nothing)
    let center = [0, 0, 0];
    let zoom = 1;
    let handles = [];
    let animation = 0;
    let destroyed = false;
    let hover = null;
    let drag = null;
    const listeners = { change: [], camera: [] };

    const wrap = document.createElement("div");
    wrap.className = "la3d";
    const canvas = document.createElement("canvas");
    canvas.className = "la3d-canvas";
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", options.label || "可旋转的三维图");
    wrap.append(canvas);
    const hint = document.createElement("div");
    hint.className = "la3d-hint";
    hint.textContent = options.hint ?? "拖动空白处旋转 · 拖动圆点改变向量";
    wrap.append(hint);
    host.append(wrap);
    const ctx = canvas.getContext("2d");
    let size = { w: 0, h: 0, dpr: 1 };

    function basis() {
      const cy = Math.cos(camera.yaw);
      const sy = Math.sin(camera.yaw);
      const cp = Math.cos(camera.pitch);
      const sp = Math.sin(camera.pitch);
      const d = [cp * cy, cp * sy, sp]; // toward the viewer
      let right = [-sy, cy, 0];
      right = V.norm(right);
      const up = V.cross(d, right);
      return { d, right, up };
    }

    function scale() {
      return (Math.min(size.w, size.h) / (2 * L * 1.72)) * zoom;
    }

    function project(p, b = basis()) {
      const s = scale();
      const q = V.sub(p, center);
      return {
        x: size.w / 2 + V.dot(q, b.right) * s,
        y: size.h / 2 - V.dot(q, b.up) * s,
        z: V.dot(p, b.d),
      };
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (w === size.w && h === size.h && dpr === size.dpr) return;
      size = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      render();
    }

    function drawText(text, x, y, color, font = "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif", align = "left") {
      ctx.save();
      ctx.font = font;
      ctx.textAlign = align;
      ctx.textBaseline = "middle";
      const pal = palette(host);
      ctx.lineWidth = 4;
      // round joins: a mitred halo grows spikes on letters such as v
      ctx.lineJoin = "round";
      ctx.strokeStyle = pal.dark ? "rgba(14,18,27,.85)" : "rgba(255,255,255,.9)";
      ctx.strokeText(text, x, y);
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    function render() {
      if (destroyed || !size.w) return;
      const pal = palette(host);
      const b = basis();
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
      ctx.clearRect(0, 0, size.w, size.h);

      const prims = [];
      const labels = [];
      // polygons flagged keepClear: axis names never sit inside them
      const clear = [];

      // Frame: faint cube edges and coordinate axes.
      if (options.frame !== false) {
        const c = [-L, L];
        for (const y of c) for (const z of c) prims.push({ kind: "seg", a: [-L, y, z], b: [L, y, z], color: pal.line, width: 0.6, alpha: 0.35 });
        for (const x of c) for (const z of c) prims.push({ kind: "seg", a: [x, -L, z], b: [x, L, z], color: pal.line, width: 0.6, alpha: 0.35 });
        for (const x of c) for (const y of c) prims.push({ kind: "seg", a: [x, y, -L], b: [x, y, L], color: pal.line, width: 0.6, alpha: 0.35 });
        const names = options.axisNames || ["x₁", "x₂", "x₃"];
        [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach((e, i) => {
          prims.push({ kind: "seg", a: V.mul(e, -L), b: V.mul(e, L), color: pal.muted, width: 1, alpha: 0.55 });
          labels.push({ p: V.mul(e, L * 1.08), text: names[i], color: pal.muted, font: "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif", axis: true });
        });
      }

      const objects = objectsFn() || [];
      for (const o of objects) {
        if (!o || o.hidden) continue;
        const color = resolve(pal, o.color);
        if (o.type === "plane") {
          const poly = clipPlane(o.n, o.d || 0, L);
          if (poly.length) {
            prims.push({ kind: "poly", pts: poly, fill: withAlpha(color, o.alpha ?? (o.ghost ? 0.035 : 0.16)), stroke: withAlpha(color, o.strokeAlpha ?? (o.ghost ? 0.35 : 0.7)), width: o.width || 1.3, dash: o.dash || (o.ghost ? GHOST_DASH : undefined), glow: glowOf(o), color });
            if (o.label) labels.push({ p: o.labelAt || poly[0], text: o.label, color });
          }
        } else if (o.type === "polygon") {
          if (o.keepClear) clear.push(o.pts);
          prims.push({ kind: "poly", pts: o.pts, fill: withAlpha(color, o.alpha ?? (o.ghost ? 0.035 : 0.18)), stroke: withAlpha(color, o.strokeAlpha ?? (o.ghost ? 0.35 : 0.8)), width: o.width || 1.2, dash: o.dash || (o.ghost ? GHOST_DASH : undefined), glow: glowOf(o), color });
        } else if (o.type === "box") {
          const [u, v, w] = o.vectors;
          const O = o.origin || [0, 0, 0];
          const P = (a, bb, cc) => V.add(O, V.add(V.mul(u, a), V.add(V.mul(v, bb), V.mul(w, cc))));
          const faces = [
            [P(0, 0, 0), P(1, 0, 0), P(1, 1, 0), P(0, 1, 0)],
            [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)],
            [P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)],
            [P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1)],
            [P(0, 0, 0), P(0, 1, 0), P(0, 1, 1), P(0, 0, 1)],
            [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)],
          ];
          faces.forEach((f) => prims.push({ kind: "poly", pts: f, fill: withAlpha(color, o.alpha ?? 0.1), stroke: withAlpha(color, 0.55), width: 1 }));
        } else if (o.type === "line") {
          const seg = clipLine(o.p || [0, 0, 0], o.dir, L);
          if (seg) {
            prims.push({ kind: "seg", a: seg[0], b: seg[1], color, width: o.width || 2.4, ...lineStyle(o) });
            if (o.label) labels.push({ p: o.labelAt || seg[1], text: o.label, color });
          }
        } else if (o.type === "segment") {
          prims.push({ kind: "seg", a: o.a, b: o.b, color, width: o.width || 1.6, ...lineStyle(o) });
          if (o.label) labels.push({ p: o.labelAt || V.mul(V.add(o.a, o.b), 0.5), text: o.label, color, font: o.font });
        } else if (o.type === "arrow") {
          const from = o.from || [0, 0, 0];
          if (V.len(V.sub(o.to, from)) < 1e-9) continue;
          prims.push({ kind: "arrow", a: from, b: o.to, color, width: o.width || 2.8, ...lineStyle(o) });
          if (o.label) labels.push({ p: o.labelAt || V.add(o.to, V.mul(V.norm(V.sub(o.to, from)), 0.28)), seg: o.labelAt ? null : [V.add(from, V.mul(V.sub(o.to, from), 0.5)), o.to], text: o.label, color, font: "700 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif" });
        } else if (o.type === "point") {
          prims.push({ kind: "dot", p: o.p, color, r: o.r || 5, hollow: o.hollow });
          if (o.label) labels.push({ p: o.p, text: o.label, color, dx: 10, dy: -10 });
        } else if (o.type === "label") {
          labels.push({ p: o.p, text: o.text, color, font: o.font });
        }
      }

      // Painter's order: far first.
      const depthOf = (prim) => {
        if (prim.kind === "poly") return prim.pts.reduce((s, p) => s + V.dot(p, b.d), 0) / prim.pts.length;
        if (prim.kind === "dot") return V.dot(prim.p, b.d) + 0.05;
        return (V.dot(prim.a, b.d) + V.dot(prim.b, b.d)) / 2 + (prim.kind === "arrow" ? 0.02 : 0);
      };
      prims.sort((x, y) => depthOf(x) - depthOf(y));

      for (const prim of prims) {
        ctx.save();
        if (prim.kind === "poly") {
          ctx.beginPath();
          prim.pts.forEach((p, i) => {
            const q = project(p, b);
            if (i) ctx.lineTo(q.x, q.y);
            else ctx.moveTo(q.x, q.y);
          });
          ctx.closePath();
          ctx.fillStyle = prim.fill;
          ctx.fill();
          if (prim.glow) {
            ctx.strokeStyle = withAlpha(prim.color, (pal.dark ? 0.2 : 0.16) * prim.glow);
            ctx.lineWidth = prim.width + 7;
            ctx.lineJoin = "round";
            ctx.stroke();
          }
          if (prim.dash) ctx.setLineDash(prim.dash);
          ctx.strokeStyle = prim.stroke;
          ctx.lineWidth = prim.width;
          ctx.stroke();
        } else if (prim.kind === "seg" || prim.kind === "arrow") {
          const a = project(prim.a, b);
          const q = project(prim.b, b);
          if (prim.glow) {
            ctx.save();
            ctx.strokeStyle = withAlpha(prim.color, (pal.dark ? 0.2 : 0.16) * prim.glow);
            ctx.lineWidth = prim.width + 7;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
            ctx.restore();
          }
          ctx.globalAlpha = prim.alpha ?? 1;
          ctx.strokeStyle = prim.color;
          ctx.lineWidth = prim.width;
          ctx.lineCap = "round";
          if (prim.dash) ctx.setLineDash(prim.dash);
          let end = q;
          if (prim.kind === "arrow") {
            const ang = Math.atan2(q.y - a.y, q.x - a.x);
            const head = Math.min(13, Math.hypot(q.x - a.x, q.y - a.y) * 0.45);
            end = { x: q.x - Math.cos(ang) * head * 0.8, y: q.y - Math.sin(ang) * head * 0.8 };
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = prim.color;
            ctx.beginPath();
            ctx.moveTo(q.x, q.y);
            ctx.lineTo(q.x - Math.cos(ang - 0.42) * head, q.y - Math.sin(ang - 0.42) * head);
            ctx.lineTo(q.x - Math.cos(ang + 0.42) * head, q.y - Math.sin(ang + 0.42) * head);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        } else if (prim.kind === "dot") {
          const q = project(prim.p, b);
          ctx.beginPath();
          ctx.arc(q.x, q.y, prim.r, 0, Math.PI * 2);
          if (prim.hollow) {
            ctx.fillStyle = pal.dark ? "#161b27" : "#fff";
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = prim.color;
            ctx.stroke();
          } else {
            ctx.fillStyle = prim.color;
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // Handles on top.
      handles.forEach((h) => {
        if (h.hidden?.()) return;
        const q = project(h.get(), b);
        const active = drag?.handle === h || hover === h;
        ctx.save();
        ctx.beginPath();
        ctx.arc(q.x, q.y, active ? 9 : 7.5, 0, Math.PI * 2);
        ctx.fillStyle = pal.dark ? "#161b27" : "#fff";
        ctx.fill();
        ctx.lineWidth = active ? 3 : 2.4;
        ctx.strokeStyle = resolve(pal, h.color);
        ctx.stroke();
        ctx.restore();
      });

      const placed = [];
      // drag handles are obstacles too: a label never sits on a handle
      if (options.spreadLabels) {
        handles.forEach((h) => {
          if (h.hidden?.()) return;
          const q = project(h.get(), b);
          if (options.labelSafe) placed.push({ x: q.x - 13, y: q.y, w: 26 });
          else placed.push({ x: q.x - 11, y: q.y + 5, w: 22 });
        });
      }
      // arrow shafts in screen space, so spread labels also keep off other arrows
      const shafts = options.spreadLabels ? prims.filter((p) => p.kind === "arrow").map((p) => [project(p.a, b), project(p.b, b)]) : [];
      const inside = (pt, poly) => {
        let hit = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
          const [a, c] = [poly[i], poly[j]];
          if (a.y > pt.y !== c.y > pt.y && pt.x < ((c.x - a.x) * (pt.y - a.y)) / (c.y - a.y || 1e-9) + a.x) hit = !hit;
        }
        return hit;
      };
      const clearScreen = clear.map((pts) => pts.map((p) => project(p, b)));
      // object labels first, axis names last: a crowded axis name is left out
      const order = options.spreadLabels ? [...labels.filter((l) => !l.axis), ...labels.filter((l) => l.axis)] : labels;
      order.forEach((lab) => {
        const q = project(lab.p, b);
        if (lab.axis && clearScreen.some((poly) => inside(q, poly))) return;
        let x = q.x + (lab.dx || 6);
        let y = q.y + (lab.dy || -6);
        if (options.spreadLabels) {
          ctx.save();
          ctx.font = lab.font || "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
          const w = ctx.measureText(lab.text).width + 4;
          ctx.restore();
          const h = 16;
          // an axis name keeps a wider gap, so it never reads as part of a label (a₂b₁)
          const gap = lab.axis ? 12 : 6;
          const seg = lab.seg ? [project(lab.seg[0], b), project(lab.seg[1], b)] : null;
          const nearShaft = (cx, cy) =>
            shafts.some(([p, q]) => {
              const mx = cx + w / 2;
              const vx = q.x - p.x;
              const vy = q.y - p.y;
              const t = Math.max(0, Math.min(1, ((mx - p.x) * vx + (cy - p.y) * vy) / (vx * vx + vy * vy || 1)));
              return Math.hypot(p.x + vx * t - mx, p.y + vy * t - cy) < Math.min(w / 2, 14);
            });
          // how far from what it names: the anchor, or the end half of its arrow
          const far = (cx, cy) => {
            const mx = cx + w / 2;
            let d = Math.hypot(mx - (x + w / 2), cy - y);
            if (seg) {
              const [p, q] = seg;
              const vx = q.x - p.x;
              const vy = q.y - p.y;
              const t = Math.max(0, Math.min(1, ((mx - p.x) * vx + (cy - p.y) * vy) / (vx * vx + vy * vy || 1)));
              d = Math.min(d, Math.hypot(p.x + vx * t - mx, p.y + vy * t - cy) + 6);
            }
            return d;
          };
          const fits = (cx, cy) => !options.labelSafe || (cx >= 4 && cx + w <= size.w - 4 && cy >= 10 && cy <= size.h - 10);
          const cost = (cx, cy) => {
            let c = far(cx, cy);
            placed.forEach((r) => {
              if (cx < r.x + r.w + gap && cx + w + gap > r.x && Math.abs(cy - r.y) < h) c += 120;
            });
            if (nearShaft(cx, cy)) c += 60;
            if (!fits(cx, cy)) c += 400;
            return c;
          };
          const tries = [[0, 0]];
          for (const r of [16, 26, 38]) for (let k = 0; k < 12; k += 1) tries.push([Math.cos((k * Math.PI) / 6) * r * 1.3 - (Math.cos((k * Math.PI) / 6) < 0 ? w * 0.6 : 0), Math.sin((k * Math.PI) / 6) * r]);
          let best = Infinity;
          let pick = [0, 0];
          tries.forEach(([ox, oy]) => {
            const c = cost(x + ox, y + oy);
            if (c < best - 0.01) {
              best = c;
              pick = [ox, oy];
            }
          });
          // an axis name that cannot find a free spot is left out
          if (lab.axis && best >= 100) return;
          x += pick[0];
          y += pick[1];
          x = Math.max(4, Math.min(size.w - w, x));
          y = Math.max(10, Math.min(size.h - 10, y));
          placed.push({ x, y, w });
        } else if (options.clampLabels) {
          ctx.save();
          ctx.font = lab.font || "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
          const w = ctx.measureText(lab.text).width + 4;
          ctx.restore();
          x = Math.max(4, Math.min(size.w - w, x));
          y = Math.max(10, Math.min(size.h - 10, y));
        }
        drawText(lab.text, x, y, lab.color, lab.font);
      });
    }

    /* ---------- zoom ---------- */
    let zoomAnim = 0;
    function setRange(target, animate = true) {
      cancelAnimationFrame(zoomAnim);
      const from = L;
      if (!animate || reduceMotion() || Math.abs(target - from) < 1e-9) {
        L = target;
        render();
        return;
      }
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / 420);
        L = from + (target - from) * (1 - (1 - t) ** 3);
        render();
        if (t < 1) zoomAnim = requestAnimationFrame(step);
      };
      zoomAnim = requestAnimationFrame(step);
    }

    /*
     * Zoom so the given points (and the origin) fill the view: the cube half-width
     * becomes pad × the largest coordinate, kept within [min, max].
     */
    function fitRange(points, opts = {}) {
      const big = Math.max(0, ...points.flat().map((x) => Math.abs(x)));
      const target = Math.max(opts.min ?? 1, Math.min(opts.max ?? (options.range || 4), big * (opts.pad ?? 1.25)));
      setRange(target, opts.animate ?? true);
    }

    let fitAnim = 0;
    function animateView(toCenter, toZoom, animate) {
      cancelAnimationFrame(fitAnim);
      const from = { c: center.slice(), z: zoom };
      const same = V.len(V.sub(toCenter, center)) < 1e-6 && Math.abs(toZoom - zoom) < 1e-6;
      if (same) return;
      if (!animate || reduceMotion()) {
        center = toCenter;
        zoom = toZoom;
        render();
        return;
      }
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / 420);
        const e = 1 - (1 - t) ** 3;
        center = V.add(from.c, V.mul(V.sub(toCenter, from.c), e));
        zoom = from.z + (toZoom - from.z) * e;
        render();
        if (t < 1) fitAnim = requestAnimationFrame(step);
      };
      fitAnim = requestAnimationFrame(step);
    }

    /* Centre the view on the points and magnify until they fill about 1/pad of the canvas. */
    function fitView(points, opts = {}) {
      if (!points.length || !size.w) return;
      const b = basis();
      const c = V.mul(points.reduce((acc, p) => V.add(acc, p), [0, 0, 0]), 1 / points.length);
      const extent = Math.max(1e-6, ...points.map((p) => Math.max(Math.abs(V.dot(V.sub(p, c), b.right)), Math.abs(V.dot(V.sub(p, c), b.up)))));
      const base = Math.min(size.w, size.h) / (2 * L * 1.72);
      const target = Math.max(1, Math.min(opts.max ?? 4, Math.min(size.w, size.h) / (2 * (opts.pad ?? 1.6)) / (extent * base)));
      animateView(c, target, opts.animate ?? true);
    }

    function resetFit(animate = true) {
      animateView([0, 0, 0], 1, animate);
    }

    /* ---------- camera ---------- */
    function setCamera(target, animate = true) {
      cancelAnimationFrame(animation);
      const from = { ...camera };
      let to = { yaw: target.yaw ?? camera.yaw, pitch: target.pitch ?? camera.pitch };
      // Take the short way round.
      while (to.yaw - from.yaw > Math.PI) to.yaw -= 2 * Math.PI;
      while (to.yaw - from.yaw < -Math.PI) to.yaw += 2 * Math.PI;
      if (!animate || reduceMotion()) {
        Object.assign(camera, to);
        render();
        listeners.camera.forEach((f) => f(camera));
        return;
      }
      const start = performance.now();
      const dur = 520;
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const e = 1 - (1 - t) ** 3;
        camera.yaw = from.yaw + (to.yaw - from.yaw) * e;
        camera.pitch = from.pitch + (to.pitch - from.pitch) * e;
        render();
        if (t < 1) animation = requestAnimationFrame(step);
        else listeners.camera.forEach((f) => f(camera));
      };
      animation = requestAnimationFrame(step);
    }

    /* Point the view so that the viewer looks along direction v. */
    function lookAlong(v, animate = true) {
      const d = V.norm(v);
      const pitch = Math.asin(Math.max(-1, Math.min(1, d[2])));
      const yaw = Math.abs(d[0]) + Math.abs(d[1]) < 1e-6 ? camera.yaw : Math.atan2(d[1], d[0]);
      // Exact alignment is allowed here so edge-on planes really collapse to a line.
      setCamera({ yaw, pitch: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch)) }, animate);
    }

    function resetView(animate = true) {
      setCamera(defaults, animate);
    }

    /* ---------- pointer ---------- */
    function localPoint(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function pickHandle(pt) {
      const b = basis();
      let best = null;
      let bestDist = 18;
      handles.forEach((h) => {
        if (h.hidden?.()) return;
        const q = project(h.get(), b);
        const dist = Math.hypot(q.x - pt.x, q.y - pt.y);
        if (dist < bestDist) {
          best = h;
          bestDist = dist;
        }
      });
      return best;
    }

    function snapValue(x, snap) {
      return snap ? Math.round(x / snap) * snap : x;
    }

    function clampCube(p) {
      return p.map((x) => Math.max(-L, Math.min(L, x)));
    }

    function screenToWorldOnPlane(pt, n, d) {
      const b = basis();
      const s = scale();
      const sx = (pt.x - size.w / 2) / s;
      const sy = -(pt.y - size.h / 2) / s;
      const origin = V.add(center, V.add(V.mul(b.right, sx), V.mul(b.up, sy)));
      const denom = V.dot(n, b.d);
      if (Math.abs(denom) < 1e-4) return null; // plane is edge-on
      const t = (d - V.dot(n, origin)) / denom;
      return V.add(origin, V.mul(b.d, t));
    }

    function dragTo(pt) {
      const h = drag.handle;
      const start = drag.startWorld;
      const b = basis();
      const s = scale();
      let p;
      if (h.mode === "line") {
        const dir = V.norm(h.dir);
        const sd = { x: V.dot(dir, b.right), y: -V.dot(dir, b.up) };
        const l2 = sd.x * sd.x + sd.y * sd.y;
        if (l2 < 1e-4) return;
        const t = ((pt.x - drag.startPt.x) * sd.x + (pt.y - drag.startPt.y) * sd.y) / (l2 * s);
        p = V.add(start, V.mul(dir, t));
      } else if (h.mode === "plane") {
        p = screenToWorldOnPlane(pt, h.plane.n, h.plane.d || 0);
        if (!p) return;
      } else {
        const dx = (pt.x - drag.startPt.x) / s;
        const dy = -(pt.y - drag.startPt.y) / s;
        p = V.add(start, V.add(V.mul(b.right, dx), V.mul(b.up, dy)));
      }
      p = clampCube(p.map((x) => snapValue(x, h.snap)));
      const moved = (h.get() || []).some((x, i) => Math.abs(x - p[i]) > 1e-12);
      h.set(p);
      listeners.change.forEach((f) => f(h));
      // a handle really moved (camera rotation never sends this): prediction gates count it as acting
      if (moved) canvas.dispatchEvent(new CustomEvent("la-handle-move", { bubbles: true }));
      render();
    }

    function onPointerDown(event) {
      if (event.button !== undefined && event.button !== 0) return;
      const pt = localPoint(event);
      const h = pickHandle(pt);
      canvas.setPointerCapture?.(event.pointerId);
      if (h) {
        drag = { handle: h, startPt: pt, startWorld: h.get().slice() };
      } else {
        drag = { orbit: true, startPt: pt, yaw: camera.yaw, pitch: camera.pitch };
        cancelAnimationFrame(animation);
      }
      wrap.classList.add("is-dragging");
      event.preventDefault();
    }

    function onPointerMove(event) {
      const pt = localPoint(event);
      if (!drag) {
        const h = pickHandle(pt);
        if (h !== hover) {
          hover = h;
          canvas.style.cursor = h ? "grab" : "default";
          render();
        }
        return;
      }
      if (drag.orbit) {
        camera.yaw = drag.yaw - (pt.x - drag.startPt.x) * 0.009;
        camera.pitch = Math.max(-1.52, Math.min(1.52, drag.pitch + (pt.y - drag.startPt.y) * 0.009));
        render();
      } else {
        dragTo(pt);
      }
    }

    function onPointerUp() {
      if (drag?.orbit) listeners.camera.forEach((f) => f(camera));
      if (drag?.handle) drag.handle.end?.();
      drag = null;
      wrap.classList.remove("is-dragging");
    }

    function onKey(event) {
      const k = event.key;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(k)) return;
      event.preventDefault();
      if (k === "ArrowLeft") camera.yaw += 0.12;
      if (k === "ArrowRight") camera.yaw -= 0.12;
      if (k === "ArrowUp") camera.pitch = Math.min(1.52, camera.pitch + 0.1);
      if (k === "ArrowDown") camera.pitch = Math.max(-1.52, camera.pitch - 0.1);
      render();
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", () => {
      if (!drag && hover) {
        hover = null;
        render();
      }
    });
    canvas.addEventListener("dblclick", () => resetView());
    canvas.addEventListener("keydown", onKey);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const themeObserver = new MutationObserver(() => render());
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    // during a light/dark switch the colour tokens morph frame by frame: follow them
    const onThemeMix = () => { if (canvas.isConnected) render(); };
    window.addEventListener("la-thememix", onThemeMix);
    requestAnimationFrame(resize);

    return {
      canvas,
      element: wrap,
      camera,
      get range() {
        return L;
      },
      setRange,
      fitRange,
      fitView,
      resetFit,
      render,
      resize,
      project: (p) => project(p),
      setObjects(fn) {
        objectsFn = typeof fn === "function" ? fn : () => fn;
        render();
      },
      setHandles(list) {
        handles = list || [];
        render();
      },
      setCamera,
      lookAlong,
      resetView,
      on(event, fn) {
        listeners[event]?.push(fn);
      },
      destroy() {
        destroyed = true;
        cancelAnimationFrame(animation);
        cancelAnimationFrame(zoomAnim);
        cancelAnimationFrame(fitAnim);
        ro.disconnect();
        themeObserver.disconnect();
        window.removeEventListener("la-thememix", onThemeMix);
        wrap.remove();
      },
    };
  }

  window.LAScene3D = Object.freeze({ create, vec: V, clipPlane, clipLine });
})();


;/* content/ch5-registry.js */
/*
 * Chapter 5 section data registry.
 */
(() => {
  const patches = new Map();

  window.defineChapter5Section = function defineChapter5Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 5 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter5SectionPatches = function getChapter5SectionPatches() {
    return patches;
  };
})();


;/* content/ch5-section1.js */
defineChapter5Section("quadratic-matrix", {
  number: "§1",
  textbookSection: "二次型及其矩阵表示",
  title: "二次型及其矩阵表示",
  navTitle: "矩阵表示",
  question: `一个含有许多平方项和交叉项的二次齐次多项式，怎样被一个对称矩阵完整记录？变量替换以后矩阵为什么变成 ${texInline("C^TAC")}？`,
  goal: `识别 ${texInline("n")} 元二次型；在多项式与实对称矩阵之间双向转换；理解交叉项系数的平分规则；掌握非退化替换 ${texInline("x=Cy")} 对应合同 ${texInline("C^TAC")}。`,
  tags: ["二次型", "对称矩阵", "合同", texInline("x^TAx")],
  intro:
    `二次型把“二次齐次多项式”与“实对称矩阵”绑成同一个对象。交叉项在矩阵乘法里会出现两次，所以非对角元要平分系数；变量替换 ${texInline("x=Cy")} 会在左右两侧各留下一个 ${texInline("C")}，从而得到合同矩阵 ${texInline("C^TAC")}。`,
  videoPlan: {
    title: "交叉项放进哪一格",
    duration: "约 30 秒自动动画",
    scenes: [
      "展示 f=2x₁²+6x₁x₂+5x₂² 与空 2×2 矩阵。",
      "交叉项 6 被平分到 a₁₂ 与 a₂₁。",
      "展开 xᵀAx 验证。",
    ],
  },
  concepts: [
    {
      label: "二次型",
      text: `${texInline("n")} 元二次型是二次齐次多项式：${texInline("f(x)=\\sum_i a_{ii}x_i^2+2\\sum_{i<j}a_{ij}x_ix_j")}。`,
    },
    {
      label: "矩阵表示",
      text: `取实对称矩阵 ${texInline("A")}，则 ${texInline("f(x)=x^TAx")}。对角元对应平方项，非对角元各放交叉项系数的一半。`,
    },
    {
      label: "对称化",
      text: `任意方阵 ${texInline("B")} 可分解为对称部分与斜对称部分；斜对称部分对 ${texInline("x^TBx")} 的贡献恒为 0。`,
    },
    {
      label: "二次型的秩",
      text: "二次型的秩定义为对应对称矩阵的秩。",
    },
    {
      label: "合同",
      text: `若存在可逆矩阵 ${texInline("C")} 使 ${texInline("B=C^TAC")}，则称 ${texInline("A")} 与 ${texInline("B")} 合同；它对应非退化变量替换 ${texInline("x=Cy")}。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第五章",
    page: "",
    items: [
      "二次型的定义与矩阵表示",
      "交叉项系数与对称位置",
      "非退化线性替换与合同矩阵",
      "合同保持对称性与秩",
    ],
  },
  interactive: {
    type: "slot",
    title: "实验：多项式—矩阵同步与合同桥",
    description: `调节平方项与交叉项，观察对称矩阵同步变化；再选择可逆替换，查看 ${texInline("C^TAC")}。`,
    task: "先让交叉项非零，确认两个对称位置同步；再切换到不可逆 C，观察合同状态被关闭。",
    prompts: [
      "从对角二次型开始，再打开交叉项。",
      "点击多项式项或矩阵格，核对对应关系。",
      `用可逆替换做合同，再用 ${texInline("\\det C=0")} 的反例对比。`,
    ],
  },
  example: {
    title: "例题：从多项式写对称矩阵",
    question: `设 ${texInline("f=3x_1^2-4x_1x_2+5x_2^2+2x_1x_3+6x_3^2")}。写出对应的实对称矩阵，并用 ${texInline("x^TAx")} 展开验证交叉项位置。`,
    choices: [
      {
        correct: true,
        text: `${texInline("A=\\begin{bmatrix}3&-2&1\\\\-2&5&0\\\\1&0&6\\end{bmatrix}")}：平方项进对角，交叉项系数各取一半放入对称位置。`,
      },
      {
        text: `${texInline("A=\\begin{bmatrix}3&-4&2\\\\0&5&0\\\\0&0&6\\end{bmatrix}")}：交叉项全部放在上三角。`,
      },
      {
        text: `${texInline("A=\\begin{bmatrix}3&-4&2\\\\-4&5&0\\\\2&0&6\\end{bmatrix}")}：交叉项系数不除以 2，直接放入两边。`,
      },
      { text: "同一个二次型可以对应多个不同的实对称矩阵，任选一个即可。" },
    ],
    steps: [
      `平方项系数直接进入对角：${texInline("a_{11}=3")}，${texInline("a_{22}=5")}，${texInline("a_{33}=6")}。`,
      `交叉项 ${texInline("-4x_1x_2")} 对应 ${texInline("2a_{12}")}，故 ${texInline("a_{12}=a_{21}=-2")}。`,
      `交叉项 ${texInline("2x_1x_3")} 对应 ${texInline("2a_{13}")}，故 ${texInline("a_{13}=a_{31}=1")}。`,
      `没有 ${texInline("x_2x_3")} 项，故 ${texInline("a_{23}=a_{32}=0")}。`,
      `矩阵对称；用 ${texInline("x^TAx")} 展开可还原原多项式。`,
    ],
  },
  quiz: [
    {
      question: "二次型为什么要求对应矩阵取实对称矩阵？",
      answer: `因为任意矩阵的斜对称部分对 ${texInline("x^TBx")} 无贡献；取对称矩阵可唯一记录二次型。`,
    },
    {
      question: `多项式中 ${texInline("6x_1x_2")} 在对称矩阵的 ${texInline("a_{12}")}、${texInline("a_{21}")} 处应填多少？`,
      answer: "各填 3，因为展开时两个位置各贡献一次。",
    },
    {
      question: `变量替换 ${texInline("x=Cy")} 后，新矩阵是什么？`,
      answer: `${texInline("C^TAC")}，而不是 ${texInline("C^{-1}AC")}。`,
    },
    {
      question: `当 ${texInline("\\det C=0")} 时，能否说 ${texInline("A")} 与 ${texInline("C^TAC")} 合同？`,
      answer: `不能。合同要求 ${texInline("C")} 可逆，即替换非退化。`,
    },
  ],
  summary: [
    `二次型是二次齐次多项式，可用唯一的实对称矩阵写成 ${texInline("x^TAx")}。`,
    "交叉项系数平分到两个对称位置；斜对称部分对二次型无贡献。",
    `非退化替换 ${texInline("x=Cy")} 把矩阵变为 ${texInline("C^TAC")}，这称为合同。`,
    "合同保持对称性与秩。",
  ],
  exercises: [
    `任取一个非对称矩阵 ${texInline("B")}，计算其对称部分 ${texInline("S")}，并随机取几个 ${texInline("x")} 验证 ${texInline("x^TBx=x^TSx")}。`,
    `给定可逆 ${texInline("C")} 与对称 ${texInline("A")}，手算 ${texInline("B=C^TAC")}，并检查 ${texInline("B")} 仍对称。`,
  ],
});


;/* content/ch5-section2.js */
defineChapter5Section("quadratic-standard-form", {
  number: "§2",
  textbookSection: "标准形",
  title: "标准形",
  navTitle: "标准形",
  question: "为什么交叉项可以通过非退化变量替换消去？怎样在保留二次型结构的同时，把它化成平方项之和？",
  goal: "理解标准形是无交叉项的对角形式；会用配方法与成对初等变换化标准形；记录可逆变量替换；区分“存在”与“唯一”。",
  tags: ["标准形", "配方法", "合同消元", "秩"],
  intro:
    "标准形把二次型写成只含平方项的对角形式。主要方法是配方法，以及与之等价的合同初等变换：对对称矩阵做一次行操作时，必须同步做对应的列操作，才能保持对称并对应合法变量替换。",
  videoPlan: {
    title: "交叉项如何消失",
    duration: "约 2—3 分钟",
    scenes: [
      "含交叉项的等高线倾斜。",
      "配方逐步完成平方并定义新变量。",
      "累积替换矩阵 C，CᵀAC 变为对角。",
    ],
  },
  concepts: [
    {
      label: "标准形",
      text: `经非退化替换后化为 ${texInline("f=d_1y_1^2+\\cdots+d_ry_r^2")}（${texInline("d_i\\neq0")}）。非零项个数 ${texInline("r")} 等于二次型的秩。`,
    },
    {
      label: "配方法",
      text: "选取非零平方项为主项，收集含该变量的全部项，完成平方并引入新变量；对剩余二次型继续。",
    },
    {
      label: "无平方项起步",
      text: `若先出现 ${texInline("2ax_ix_j")} 而无平方项，可先用和差替换 ${texInline("y_i=x_i+x_j")}、${texInline("y_j=x_i-x_j")} 再配方。`,
    },
    {
      label: "合同初等变换",
      text: "交换、倍乘、倍加都必须行、列成对进行，对应可逆替换的逐步累积。",
    },
    {
      label: "不唯一",
      text: `标准形的具体系数一般不唯一：令 ${texInline("y_i=kz_i")}（${texInline("k\\neq0")}），系数 ${texInline("d_i")} 变为 ${texInline("k^2d_i")}。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第五章",
    page: "",
    items: ["二次型的标准形", "配方法", "矩阵形式的合同变换", "标准形与秩"],
  },
  interactive: {
    type: "slot",
    title: "实验：配方步进与对称消元",
    description: "逐步完成配方，同步更新多项式、替换矩阵与当前对称矩阵；也可用成对初等变换消去交叉项。",
    task: `走完一个含交叉项的二元例子，确认累积 ${texInline("C")} 可逆且最终交叉项为 0。`,
    prompts: [
      `先观察 ${texInline("b\\neq0")} 时等高线倾斜。`,
      "按步进器完成平方并记录新变量。",
      "切换到对称消元，看行列同步操作。",
    ],
  },
  example: {
    title: "例题：配方法",
    question: `用配方法化 ${texInline("f=x_1^2+4x_1x_2+5x_2^2")} 为标准形，并写出可逆变量替换。`,
    choices: [
      {
        correct: true,
        text: `${texInline("f=y_1^2+y_2^2")}，其中 ${texInline("y_1=x_1+2x_2")}，${texInline("y_2=x_2")}（或等价的可逆替换）。`,
      },
      {
        text: `${texInline("f=y_1^2+y_2^2")}，但不必检查替换是否可逆。`,
      },
      {
        text: "只能通过正交旋转化标准形，配方法对本题不适用。",
      },
      {
        text: "标准形系数唯一，因此只有一种写法。",
      },
    ],
    steps: [
      `以 ${texInline("x_1^2")} 为主项：${texInline("f=(x_1+2x_2)^2+x_2^2")}。`,
      `令 ${texInline("y_1=x_1+2x_2")}，${texInline("y_2=x_2")}，则 ${texInline("f=y_1^2+y_2^2")}。`,
      `反解 ${texInline("x_1=y_1-2y_2")}，${texInline("x_2=y_2")}，替换矩阵可逆。`,
      `对应合同后矩阵为 ${texInline("\\operatorname{diag}(1,1)")}，交叉项消失。`,
      `系数还可经缩放改变：令 ${texInline("y_2=2z_2")}，得 ${texInline("f=y_1^2+4z_2^2")}，仍是标准形。`,
    ],
  },
  quiz: [
    {
      question: "标准形中非零平方项的个数等于什么？",
      answer: "等于二次型的秩。",
    },
    {
      question: "合同初等变换为什么要行列成对操作？",
      answer: "才能保持对称，并对应两侧同时出现的变量替换因子。",
    },
    {
      question: "标准形的系数是否唯一？",
      answer: `一般不唯一。例如 ${texInline("y_1^2+y_2^2")} 中令 ${texInline("y_2=2z_2")}，得 ${texInline("y_1^2+4z_2^2")}；不变的是正、负平方项的个数。`,
    },
    {
      question: "没有平方项只有交叉项时，常见第一步是什么？",
      answer: "先做和差型替换，使平方项出现，再配方。",
    },
  ],
  summary: [
    "标准形是无交叉项的对角二次型；非零项个数等于秩。",
    "配方法与成对合同初等变换是同一过程的两种语言。",
    `变量替换必须可逆；要记录累积矩阵 ${texInline("C")}。`,
    "标准形存在，但系数一般不唯一。",
  ],
  exercises: [
    `对 ${texInline("f=2x_1x_2")} 先做和差替换再化标准形。`,
    `用成对初等变换把一个 ${texInline("2\\times2")} 对称矩阵化到对角。`,
  ],
});


;/* content/ch5-section3.js */
defineChapter5Section("quadratic-uniqueness", {
  number: "§3",
  textbookSection: "唯一性",
  title: "唯一性",
  navTitle: "唯一性",
  question: "同一个二次型可以得到许多不同的标准形。为什么正平方项、负平方项和零项的数量却不能改变？",
  goal: "区分标准形与规范形；掌握正、负惯性指数、秩与符号差；理解惯性定理与实对称矩阵的合同分类。",
  tags: ["惯性定理", "规范形", "正负惯性指数", "合同分类"],
  intro:
    "标准形的具体系数可以缩放改变，但实二次型的正平方项个数与负平方项个数是合同不变量。这就是惯性定理：它把“形状类型”从具体数字中抽离出来，并给出实对称矩阵合同分类的完整标签。",
  videoPlan: {
    title: "系数在变，惯性锁定",
    duration: "约 2 分钟",
    scenes: [
      "同一二次型的两种标准形：系数不同，符号结构相同。",
      "可逆路径下 p、q 保持。",
      "det C=0 时停止合同演示。",
    ],
  },
  concepts: [
    {
      label: "复规范形",
      text: `复数域上非零项可全部化为系数 1：${texInline("f=z_1^2+\\cdots+z_r^2")}，唯一信息是秩 ${texInline("r")}。`,
    },
    {
      label: "实规范形",
      text: `${texInline("f=z_1^2+\\cdots+z_p^2-z_{p+1}^2-\\cdots-z_{p+q}^2")}，其中 ${texInline("p")}、${texInline("q")} 分别为正、负惯性指数。`,
    },
    {
      label: "惯性定理",
      text: "实二次型经任意非退化实替换化为标准形后，正系数项个数与负系数项个数唯一确定。",
    },
    {
      label: "计数器",
      text: `${texInline("\\operatorname{rank}=p+q")}，符号差 ${texInline("p-q")}；零项个数为 ${texInline("n-p-q")}。`,
    },
    {
      label: "合同分类",
      text: "两个同阶实对称矩阵合同，当且仅当它们有相同的正、负惯性指数（等价地，相同实规范形）。",
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第五章",
    page: "",
    items: ["标准形的唯一性", "复、实规范形", "惯性定理", "合同分类"],
  },
  interactive: {
    type: "slot",
    title: "实验：惯性锁",
    description: `固定对称矩阵 ${texInline("A")}，拖动剪切参数 ${texInline("h")} 观察 ${texInline("B=C^TAC")}；曲面和符号轮上向上、向下的方向换了位置，数量不变。`,
    task: `先猜一猜马鞍面能否被可逆替换变成碗，再拖动 ${texInline("h")}；最后让替换奇异，看定理前提何时失效。`,
  },
  example: {
    title: "例题：从标准形读惯性",
    question: `设 ${texInline("f=3y_1^2-2y_2^2+7y_3^2")}。求秩、正惯性指数、负惯性指数、符号差，并写出实规范形。`,
    choices: [
      {
        correct: true,
        text: `秩 3；${texInline("p=2")}，${texInline("q=1")}；符号差 1；规范形 ${texInline("z_1^2+z_2^2-z_3^2")}。`,
      },
      {
        text: `秩 3；${texInline("p=3")}，${texInline("q=0")}，因为绝对值都非零。`,
      },
      {
        text: "秩 2；只统计不同的系数绝对值种类。",
      },
      {
        text: `符号差等于三个系数之和 ${texInline("3-2+7")}。`,
      },
    ],
    steps: [
      `正系数两项，负系数一项，故 ${texInline("p=2")}，${texInline("q=1")}。`,
      `秩 ${texInline("=p+q=3")}；符号差 ${texInline("=p-q=1")}。`,
      `实规范形把正项缩为 ${texInline("+1")}、负项缩为 ${texInline("-1")}：${texInline("z_1^2+z_2^2-z_3^2")}。`,
      `具体系数 3、2、7 可被缩放改变，但 ${texInline("(p,q)")} 不变。`,
    ],
  },
  quiz: [
    {
      question: "标准形唯一吗？规范形呢？",
      answer: `标准形系数一般不唯一；实规范形在忽略变量次序时由 ${texInline("(p,q)")} 唯一确定。`,
    },
    {
      question: "只用秩能否判断两个实对称矩阵合同？",
      answer: "不能。还需正、负惯性指数分别相同。",
    },
    {
      question: "复数域上二次型的合同不变量主要是什么？",
      answer: "秩。",
    },
    {
      question: `${texInline("p=1")}，${texInline("q=1")}，${texInline("n=2")} 的等高线典型形状是什么？`,
      answer: "双曲线型（马鞍对应的水平截线），二次型可取正也可取负。",
    },
  ],
  summary: [
    "标准形系数可改，正、负、零项数量是真正的不变量。",
    "实规范形由正、负惯性指数刻画；复规范形由秩刻画。",
    `惯性定理给出合同分类：同阶实对称矩阵合同 ${texInline("\\Leftrightarrow")} 相同 ${texInline("(p,q)")}。`,
    `${texInline("p=n")} 时二次型在一切非零向量上取正值，这样的二次型称为正定的。`,
  ],
  exercises: [
    "构造两个秩相同但不合同的 2 阶实对称矩阵。",
    `对含参数的二次型讨论 ${texInline("(p,q)")} 随参数如何变化。`,
  ],
});


;/* content/ch5-section4.js */
defineChapter5Section("positive-definite", {
  number: "§4",
  textbookSection: "正定二次型",
  title: "正定二次型",
  navTitle: "正定二次型",
  question: `怎样不用遍历所有非零向量，就严格判断 ${texInline("x^TAx")} 是否始终大于 0？临界状态从正定到半正定再到不定时，究竟发生了什么？`,
  goal: `定义五种符号类型；用标准形/惯性判断正定；掌握顺序主子式判别法；识别错误判据；理解正定矩阵可写成 ${texInline("C^TC")}。`,
  tags: ["正定", "顺序主子式", "半正定边界", texInline("C^TC")],
  intro:
    `正定意味着每个非零方向上二次型值都严格为正。有限个向量抽样永远不够；需要结构性判据：标准形全正、正惯性指数等于 ${texInline("n")}，或实对称矩阵的顺序主子式全为正。半正定不能简单把“全正”改成“全非负顺序主子式”。`,
  videoPlan: {
    title: "方向值何时永远在零上方",
    duration: "约 2 分钟",
    scenes: [
      "单位圆扫描 q(θ)。",
      "Δ₁、Δ₂ 仪表与临界边界。",
      "BᵀB：‖Bx‖²≥0。",
    ],
  },
  concepts: [
    {
      label: "正定",
      text: `实对称 ${texInline("A")} 正定：对一切 ${texInline("x\\neq0")} 有 ${texInline("x^TAx>0")}；此时也称二次型正定。`,
    },
    {
      label: "五种类型",
      text: "正定、半正定、负定、半负定、不定，按非零方向上取值的符号结构划分。",
    },
    {
      label: "标准形判据",
      text: `正定 ${texInline("\\Leftrightarrow")} 标准形全部系数为正 ${texInline("\\Leftrightarrow")} 正惯性指数 ${texInline("p=n")}。`,
    },
    {
      label: "顺序主子式",
      text: `顺序主子式判别：正定 ⇔ 顺序主子式 ${texInline("\\Delta_1,\\ldots,\\Delta_n")} 全大于 0。`,
    },
    {
      label: "二阶情形",
      text: `${texInline("A=\\begin{bmatrix}a&b\\\\b&c\\end{bmatrix}")} 正定 ⇔ ${texInline("a>0")} 且 ${texInline("ac-b^2>0")}。`,
    },
    {
      label: texInline("C^TC"),
      text: `${texInline("B^TB")} 半正定，${texInline("B")} 列满秩时正定；${texInline("A")} 正定当且仅当存在可逆矩阵 ${texInline("C")} 使 ${texInline("A=C^TC")}。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第五章",
    page: "",
    items: ["正定二次型与正定矩阵", "用标准形判断正定", "顺序主子式判别法", "正定矩阵的性质"],
  },
  interactive: {
    type: "slot",
    title: "实验：正定性实验室",
    description: `调节 ${texInline("a")}、${texInline("b")}、${texInline("c")}，同步查看曲面/等高线、单位圆方向值、顺序主子式与分类；预设覆盖临界状态。`,
    task: `把交叉项 ${texInline("b")} 逐渐增大，观察何时 ${texInline("\\Delta_2")} 变号并进入不定；再对比半正定山谷。`,
    prompts: [
      "单位矩阵：全程正定。",
      `增大 ${texInline("|b|")} 直到 ${texInline("ac-b^2=0")}。`,
      `切换半正定与不定预设，读 ${texInline("q(\\theta)")} 曲线。`,
    ],
  },
  example: {
    title: "例题：参数范围与顺序主子式",
    question: `设 ${texInline("f=x_1^2+2\\lambda x_1x_2+4x_2^2")}。求使 ${texInline("f")} 正定的实参数 ${texInline("\\lambda")} 的范围。`,
    choices: [
      {
        correct: true,
        text: `${texInline("|\\lambda|<2")}，因为 ${texInline("\\Delta_1=1>0")} 且 ${texInline("\\Delta_2=4-\\lambda^2>0")}。`,
      },
      {
        text: `${texInline("|\\lambda|\\le 2")}，端点也算正定。`,
      },
      {
        text: `只要对角元 1 与 4 都为正即可，${texInline("\\lambda")} 任意。`,
      },
      {
        text: `只要行列式 ${texInline("4-\\lambda^2")} 非负即可。`,
      },
    ],
    steps: [
      `对称矩阵为 ${texInline("\\begin{bmatrix}1&\\lambda\\\\\\lambda&4\\end{bmatrix}")}。`,
      `${texInline("\\Delta_1=1>0")} 恒成立。`,
      `${texInline("\\Delta_2=4-\\lambda^2>0\\Rightarrow|\\lambda|<2")}。`,
      `端点 ${texInline("|\\lambda|=2")} 时 ${texInline("\\Delta_2=0")}，退化为半正定而非正定。`,
      `也可用配方法：${texInline("f=(x_1+\\lambda x_2)^2+(4-\\lambda^2)x_2^2")}，需 ${texInline("4-\\lambda^2>0")}。`,
    ],
  },
  quiz: [
    {
      question: "有限个测试向量全为正，能否断定正定？",
      answer: "不能。非零方向有无穷多个，需要结构性判据。",
    },
    {
      question: "顺序主子式全非负是否保证半正定？",
      answer: `不保证。例如 ${texInline("\\operatorname{diag}(0,-1)")}：${texInline("\\Delta_1=0")}，${texInline("\\Delta_2=0")}，都非负，但 ${texInline("x=(0,1)")} 给出 ${texInline("x^TAx=-1<0")}。半正定要检查一切主子式非负。`,
    },
    {
      question: "对角元都为正是否保证正定？",
      answer: `不保证。例如 ${texInline("A=\\begin{bmatrix}1&2\\\\2&1\\end{bmatrix}")} 的 ${texInline("\\Delta_2=-3<0")}，沿 ${texInline("x=(1,-1)")} 有 ${texInline("x^TAx=-2")}。`,
    },
    {
      question: `为什么 ${texInline("B^TB")} 半正定？`,
      answer: `因为 ${texInline("x^T(B^TB)x=\\|Bx\\|^2\\ge0")}。`,
    },
  ],
  summary: [
    "正定要求一切非零方向上二次型严格为正。",
    `可用标准形、惯性 ${texInline("p=n")} 或顺序主子式全正来判定。`,
    "常见误区：只看对角元、只看行列式、误用半正定的顺序主子式口诀。",
    `${texInline("A")} 正定当且仅当 ${texInline("A")} 与 ${texInline("E")} 合同，即 ${texInline("A=C^TC")}（${texInline("C")} 可逆）；${texInline("B^TB")} 总是半正定。`,
  ],
  exercises: [
    "用顺序主子式判断一个 3 阶实对称矩阵是否正定。",
    "给出“元素全正但不定”的 2 阶例子。",
  ],
});


;/* content/ch5.js */
registerAlgebraChapter({
  id: "ch5",
  icon: "5",
  title: "第五章 二次型",
  subtitle: "合同 · 标准形 · 惯性 · 正定",
  summary:
    "先把二次齐次多项式写成唯一的实对称矩阵，再经非退化变量替换得到合同变换；用配方法与成对初等变换化到标准形，用惯性定理锁定正、负、零方向数量，最后建立正定二次型的定义与顺序主子式判别法。",
  sections: [
    { id: "quadratic-matrix", number: "§1", title: "二次型及其矩阵表示", navTitle: "矩阵表示" },
    { id: "quadratic-standard-form", number: "§2", title: "标准形", navTitle: "标准形" },
    { id: "quadratic-uniqueness", number: "§3", title: "唯一性", navTitle: "唯一性" },
    { id: "positive-definite", number: "§4", title: "正定二次型", navTitle: "正定二次型" },
  ],
});


;/* content/ch5-assemble.js */
/* Apply the section patches after ch5.js has registered the base chapter. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch5");
  const patches = window.getChapter5SectionPatches?.();
  if (!chapter || !patches) return;

  chapter.sections = chapter.sections.map((section) => {
    if (!section || typeof section !== "object") return section;
    const patch = patches.get(section.id);
    return patch ? { ...section, ...patch } : section;
  });
})();


;/* visuals/ch5/registry.js */
/*
 * Chapter 5 presentation registry.
 * Renderers may return cleanup functions; the previous lesson is torn down
 * before a new one mounts so resize listeners and animation frames do not leak.
 */
(() => {
  const renderers = new Map();
  const enhancers = [];
  let activeCleanups = [];

  function collectCleanup(value) {
    if (typeof value === "function") activeCleanups.push(value);
    if (Array.isArray(value)) value.forEach(collectCleanup);
  }

  function cleanupActiveLesson() {
    activeCleanups.splice(0).forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.warn("Chapter 5 cleanup failed", error);
      }
    });
  }

  window.defineChapter5Renderer = function defineChapter5Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 5 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.defineChapter5LessonEnhancer = function defineChapter5LessonEnhancer(enhancer) {
    if (typeof enhancer === "function") enhancers.push(enhancer);
  };

  window.cleanupChapter5Lesson = cleanupActiveLesson;

  window.mountChapter5Lesson = function mountChapter5Lesson(section, root) {
    cleanupActiveLesson();
    if (!section?.id || !root) return;
    const renderer = renderers.get(section.id);
    if (renderer) {
      const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
      const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
      collectCleanup(renderer.formal?.(formal, section, root));
      collectCleanup(renderer.interactive?.(interactive, section, root));
    }
    enhancers.forEach((enhancer) => collectCleanup(enhancer(section, root)));
  };
})();


;/* visuals/ch6/registry.js */
/* Chapter 6 presentation registry with deterministic teardown. */
(() => {
  const renderers = new Map();
  let activeCleanup = null;

  function runCleanup() {
    if (typeof activeCleanup === "function") {
      try {
        activeCleanup();
      } catch (error) {
        console.warn("Chapter 6 teardown failed", error);
      }
    }
    activeCleanup = null;
  }

  window.defineChapter6Renderer = function defineChapter6Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 6 renderers require a section id and an object.");
    }
    renderers.set(sectionId, { ...(renderers.get(sectionId) || {}), ...renderer });
  };

  window.teardownChapter6Lesson = runCleanup;

  window.mountChapter6Lesson = function mountChapter6Lesson(section, root) {
    runCleanup();
    if (!section?.id || !root) return;
    const renderer = renderers.get(section.id);
    if (!renderer) return;
    const cleanups = [];
    const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
    const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
    const formalCleanup = renderer.formal?.(formal, section, root);
    const interactiveCleanup = renderer.interactive?.(interactive, section, root);
    if (typeof formalCleanup === "function") cleanups.push(formalCleanup);
    if (typeof interactiveCleanup === "function") cleanups.push(interactiveCleanup);
    activeCleanup = () => cleanups.splice(0).reverse().forEach((cleanup) => cleanup());
  };

  window.addEventListener("hashchange", runCleanup);
  window.addEventListener("pagehide", runCleanup);
})();


;/* content/ch7-registry.js */
/*
 * Chapter 7 section data registry.
 */
(() => {
  const patches = new Map();

  window.defineChapter7Section = function defineChapter7Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 7 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter7SectionPatches = function getChapter7SectionPatches() {
    return patches;
  };
})();


;/* content/ch7-section1.js */
defineChapter7Section("linear-map-definition", {
  number: "§1",
  textbookSection: "线性变换的定义",
  title: "线性变换的定义",
  navTitle: "线性变换的定义",
  question: `什么样的变换 ${texInline(String.raw`\sigma: V\to V`)} 保持线性组合？`,
  goal: "会按定义判断一个变换是否线性，包括多项式空间、矩阵空间上的变换；知道线性变换的基本性质。",
  tags: ["线性变换", "保持加法", "保持数乘"],
  intro:
    `线性空间 ${texInline("V")} 到自身的变换 ${texInline(String.raw`\sigma`)}，如果把线性组合送到同样系数的线性组合，就称为线性变换。判断时只看两件事：加法和数乘是否被保持。平移、取绝对值、取行列式都会在某一步失败。`,
  concepts: [
    { label: "线性变换", text: `${texInline(String.raw`\sigma(\alpha+\beta)=\sigma\alpha+\sigma\beta`)}，${texInline(String.raw`\sigma(k\alpha)=k\,\sigma\alpha`)}，对一切 ${texInline(String.raw`\alpha,\beta\in V`)}、${texInline(String.raw`k\in P`)} 成立。` },
    { label: "线性映射", text: `${texInline("V")} 到另一个空间 ${texInline("W")} 的映射满足同样两条时，称为线性映射。` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §1", items: ["线性变换的定义", "线性变换的简单性质"] },
  interactive: false,
  lesson3d: {
    blocks: [
      {
        title: "定义：保持加法与数乘",
        tex: String.raw`\sigma(k\alpha+l\beta)=k\,\sigma(\alpha)+l\,\sigma(\beta),\qquad \alpha,\beta\in V,\ k,l\in P`,
        text: `${texInline("V")} 是数域 ${texInline("P")} 上的线性空间，${texInline(String.raw`\sigma`)} 是 ${texInline("V")} 到自身的变换。上式对一切向量和数成立时，${texInline(String.raw`\sigma`)} 称为线性变换。本章的线性变换都指 ${texInline("V")} 到自身；${texInline("V")} 到另一个空间 ${texInline("W")} 的这类映射称为线性映射（例如 ${texInline(String.raw`\mathbb R^3`)} 到 ${texInline(String.raw`\mathbb R^2`)} 的投影）。`,
      },
      {
        title: "由定义直接得到的性质",
        tex: String.raw`\sigma(0)=0,\qquad \sigma(-\alpha)=-\sigma(\alpha),\qquad \sigma\Big(\sum_{i} k_i\alpha_i\Big)=\sum_i k_i\,\sigma(\alpha_i)`,
        text: `所以线性关系被保持：若 ${texInline(String.raw`\alpha_1,\dots,\alpha_s`)} 线性相关，则 ${texInline(String.raw`\sigma\alpha_1,\dots,\sigma\alpha_s`)} 也线性相关。反过来不成立，零变换把任何线性无关组都送成零向量。`,
      },
      {
        title: "平移为什么不是线性变换",
        figure: "translation-gap",
        text: `${texInline(String.raw`\tau(\alpha)=\alpha+\beta_0`)}（${texInline(String.raw`\beta_0\ne0`)}）：先加后变换得 ${texInline(String.raw`\alpha+\beta+\beta_0`)}，先变换后加得 ${texInline(String.raw`\alpha+\beta+2\beta_0`)}，两条路径始终差一个 ${texInline(String.raw`\beta_0`)}。也可以直接看 ${texInline(String.raw`\tau(0)=\beta_0\ne0`)}。`,
      },
    ],
    pitfalls: [
      `只验证 ${texInline(String.raw`\sigma(0)=0`)} 就下结论。它只是必要条件，下面例题里的 ${texInline(String.raw`T_4`)} 就是反例。`,
      "用一两对具体向量验证后就断定线性。定义要求对一切向量和数成立；否定线性时，一组反例就够。",
      `把 ${texInline("V")} 到 ${texInline("W")} 的映射也叫线性变换。本章的线性变换专指 ${texInline("V")} 到自身。`,
    ],
  },
  example: {
    title: "例题：矩阵空间上的四个变换",
    question: `在 ${texInline(String.raw`M_2(\mathbb R)`)} 上，取定矩阵 ${texInline("A")}，令 ${texInline(String.raw`T_1(X)=AX-XA`)}，${texInline(String.raw`T_2(X)=X^{T}`)}，${texInline(String.raw`T_3(X)=X+E`)}，${texInline(String.raw`T_4(X)=|X|\,E`)}。哪些是线性变换？`,
    choices: [
      { correct: true, text: `${texInline("T_1")}、${texInline("T_2")} 是线性变换；${texInline("T_3")}、${texInline("T_4")} 不是。` },
      { text: `只有 ${texInline("T_2")} 是，因为 ${texInline("T_1")} 含矩阵乘法，而矩阵乘法不可交换。` },
      { text: `${texInline("T_1")}、${texInline("T_2")}、${texInline("T_4")} 是，因为它们都把零矩阵送到零矩阵。` },
      { text: `四个都是，因为它们都把 ${texInline(String.raw`M_2(\mathbb R)`)} 映到自身。` },
    ],
    steps: [
      `${texInline(String.raw`T_1(kX+lY)=A(kX+lY)-(kX+lY)A=k\,T_1(X)+l\,T_1(Y)`)}，线性。乘法不可交换不影响这一点。`,
      `${texInline(String.raw`(kX+lY)^{T}=kX^{T}+lY^{T}`)}，${texInline("T_2")} 线性。`,
      `${texInline(String.raw`T_3(0)=E\ne0`)}，不是线性变换。`,
      `${texInline(String.raw`T_4(0)=0`)}，但 ${texInline(String.raw`T_4(2E)=|2E|\,E=4E`)}，而 ${texInline(String.raw`2T_4(E)=2E`)}，数乘不被保持。`,
    ],
  },
  quiz: [
    {
      question: `在 ${texInline(String.raw`P[x]`)} 上，${texInline(String.raw`\sigma(f(x))=f(x+1)`)} 是线性变换吗？它和“平移 ${texInline(String.raw`\alpha\mapsto\alpha+\beta_0`)}”有什么不同？`,
      answer: `是线性变换：${texInline("(kf+lg)(x+1)=kf(x+1)+lg(x+1)")}。它平移的是自变量 ${texInline("x")}，被变换的向量是整个多项式 ${texInline("f")}，零多项式仍变成零多项式；把向量本身加上 ${texInline(String.raw`\beta_0`)} 才破坏线性。`,
    },
    {
      question: `若 ${texInline(String.raw`\sigma\alpha_1,\dots,\sigma\alpha_s`)} 线性无关，${texInline(String.raw`\alpha_1,\dots,\alpha_s`)} 一定线性无关吗？`,
      answer: `一定。若 ${texInline(String.raw`\alpha_1,\dots,\alpha_s`)} 线性相关，由线性关系被保持，${texInline(String.raw`\sigma\alpha_1,\dots,\sigma\alpha_s`)} 也线性相关，矛盾。`,
    },
    {
      question: "一个变换把每条直线都映成直线，能推出它是线性变换吗？",
      answer: "不能。平移把直线映成直线，却不保持加法，也不把 0 送到 0。",
    },
    {
      question: `${texInline(String.raw`\mathbb R^2`)} 上的线性变换 ${texInline(String.raw`\sigma`)} 满足 ${texInline(String.raw`\sigma(1,0)=(2,1)`)}，${texInline(String.raw`\sigma(0,1)=(-1,3)`)}。${texInline(String.raw`\sigma(3,-2)`)} 是多少？为什么两个像就够了？`,
      answer: `${texInline(String.raw`\sigma(3,-2)=3\sigma(1,0)-2\sigma(0,1)=(8,-3)`)}。每个向量都是 ${texInline("(1,0)")}、${texInline("(0,1)")} 的线性组合，而 ${texInline(String.raw`\sigma`)} 保持线性组合。`,
    },
  ],
  summary: [
    `线性变换是 ${texInline("V")} 到自身、保持加法和数乘的变换，它把线性组合送到同系数的线性组合。`,
    `${texInline(String.raw`\sigma(0)=0`)} 只是必要条件；否定线性只需一个反例，肯定线性要对一切向量与数验证。`,
    "下一节把线性变换本身相加、相乘，得到新的线性变换。",
  ],
});


;/* content/ch7-section2.js */
defineChapter7Section("linear-map-operations", {
  number: "§2",
  textbookSection: "线性变换的运算",
  title: "线性变换的运算",
  navTitle: "线性变换的运算",
  question: "线性变换怎样相加、相乘，怎样代入多项式？",
  goal: "掌握线性变换的和、数量乘法、乘积与逆变换，会把线性变换代入多项式；知道乘法一般不可交换。",
  tags: ["和", "乘积", "逆变换", `多项式 ${texInline(String.raw`f(\sigma)`)}`],
  intro:
    `两个线性变换可以对同一个向量分别作用后相加，也可以先后作用。乘积 ${texInline(String.raw`\sigma\tau`)} 表示先 ${texInline(String.raw`\tau`)} 后 ${texInline(String.raw`\sigma`)}，交换顺序一般得到不同的变换。同一个 ${texInline(String.raw`\sigma`)} 可以反复相乘，于是能代入多项式，这是后面研究特征值和最小多项式的工具。`,
  concepts: [
    { label: "乘积", text: `${texInline(String.raw`(\sigma\tau)(\alpha)=\sigma(\tau(\alpha))`)}，先 ${texInline(String.raw`\tau`)} 后 ${texInline(String.raw`\sigma`)}。` },
    { label: "多项式", text: `${texInline(String.raw`f(\sigma)=a_m\sigma^m+\cdots+a_1\sigma+a_0E`)}。` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §2", items: ["线性变换的乘法、加法与数量乘法", "逆变换", "线性变换的多项式"] },
  interactive: false,
  lesson3d: {
    blocks: [
      {
        title: "加法、数量乘法与乘法",
        tex: String.raw`(\sigma+\tau)(\alpha)=\sigma\alpha+\tau\alpha,\qquad (k\sigma)(\alpha)=k\,\sigma\alpha,\qquad (\sigma\tau)(\alpha)=\sigma(\tau\alpha)`,
        text: `三者仍是线性变换。乘法满足结合律和对加法的分配律，单位变换 ${texInline("E")} 满足 ${texInline(String.raw`E\sigma=\sigma E=\sigma`)}；乘法一般不满足交换律。全体线性变换在加法与数量乘法下构成数域 ${texInline("P")} 上的线性空间。`,
      },
      {
        title: "逆变换",
        tex: String.raw`\sigma\tau=\tau\sigma=E\ \Longrightarrow\ \tau=\sigma^{-1},\qquad (\sigma\tau)^{-1}=\tau^{-1}\sigma^{-1}`,
        text: `可逆线性变换的逆仍是线性变换。撤销“先 ${texInline(String.raw`\tau`)} 后 ${texInline(String.raw`\sigma`)}”时要先撤销 ${texInline(String.raw`\sigma`)}，所以逆的顺序相反。有限维空间中，只要 ${texInline(String.raw`\sigma\tau=E`)} 一式成立，就有 ${texInline(String.raw`\tau\sigma=E`)}。`,
      },
      {
        title: "线性变换的多项式",
        tex: String.raw`h=f+g\Rightarrow h(\sigma)=f(\sigma)+g(\sigma),\qquad h=fg\Rightarrow h(\sigma)=f(\sigma)g(\sigma)`,
        text: `${texInline(String.raw`\sigma^m`)} 是 ${texInline("m")} 个 ${texInline(String.raw`\sigma`)} 的乘积，${texInline(String.raw`\sigma^0=E`)}。因为 ${texInline(String.raw`\sigma^i\sigma^j=\sigma^{i+j}=\sigma^j\sigma^i`)}，同一个 ${texInline(String.raw`\sigma`)} 的两个多项式总可交换：${texInline(String.raw`f(\sigma)g(\sigma)=g(\sigma)f(\sigma)`)}。`,
      },
    ],
    pitfalls: [
      `把 ${texInline(String.raw`\sigma\tau`)} 读成先 ${texInline(String.raw`\sigma`)} 后 ${texInline(String.raw`\tau`)}。${texInline(String.raw`\sigma\tau`)} 作用在 ${texInline(String.raw`\alpha`)} 上是 ${texInline(String.raw`\sigma(\tau\alpha)`)}，靠近 ${texInline(String.raw`\alpha`)} 的 ${texInline(String.raw`\tau`)} 先作用。`,
      `把 ${texInline(String.raw`\sigma+\tau`)} 当成两步。${texInline(String.raw`\sigma+\tau`)} 是对同一个 ${texInline(String.raw`\alpha`)} 分别作用，再把两个像相加。`,
      `求 ${texInline(String.raw`(\sigma\tau)^{-1}`)} 时保持原来的顺序。正确的是 ${texInline(String.raw`\tau^{-1}\sigma^{-1}`)}。`,
    ],
  },
  example: {
    title: "例题：求导与乘 x 不可交换",
    question: `在 ${texInline(String.raw`P[x]`)} 中，${texInline("D")} 是求导，${texInline(String.raw`\sigma(f(x))=xf(x)`)}。${texInline(String.raw`D\sigma-\sigma D`)} 是什么变换？`,
    choices: [
      { correct: true, text: `单位变换 ${texInline("E")}。` },
      { text: `零变换，因为求导和乘 ${texInline("x")} 都是线性变换。` },
      { text: `${texInline(String.raw`\sigma`)}，即乘 ${texInline("x")}。` },
      { text: `${texInline("D")}，即求导。` },
    ],
    steps: [
      `${texInline(String.raw`(D\sigma)(f)=D(xf)=f+xf'`)}。`,
      `${texInline(String.raw`(\sigma D)(f)=\sigma(f')=xf'`)}。`,
      `相减：${texInline(String.raw`(D\sigma-\sigma D)(f)=f`)} 对一切 ${texInline("f")} 成立，所以 ${texInline(String.raw`D\sigma-\sigma D=E`)}。`,
      `特别地 ${texInline(String.raw`D\sigma\ne\sigma D`)}：两个线性变换的乘积与顺序有关。`,
    ],
  },
  quiz: [
    {
      question: `若 ${texInline(String.raw`\sigma^2=\sigma`)}，${texInline(String.raw`(E-\sigma)^2`)} 等于什么？${texInline(String.raw`\sigma(E-\sigma)`)} 呢？`,
      answer: `${texInline(String.raw`(E-\sigma)^2=E-2\sigma+\sigma^2=E-\sigma`)}；${texInline(String.raw`\sigma(E-\sigma)=\sigma-\sigma^2=0`)}。`,
    },
    {
      question: `在 ${texInline(String.raw`P[x]`)} 中，${texInline("J")} 是从 ${texInline("0")} 到 ${texInline("x")} 求积分。${texInline("DJ")} 与 ${texInline("JD")} 各是什么？这在有限维空间中可能发生吗？`,
      answer: `${texInline("DJ=E")}，而 ${texInline("JD(f)=f-f(0)")}，不等于 ${texInline("E")}。有限维空间中不会发生：${texInline(String.raw`\sigma\tau=E`)} 时 ${texInline(String.raw`\tau\sigma=E`)} 也成立。`,
    },
    {
      question: `为什么 ${texInline(String.raw`f(\sigma)g(\sigma)=g(\sigma)f(\sigma)`)} 总成立，而两个线性变换 ${texInline(String.raw`\sigma`)}、${texInline(String.raw`\tau`)} 一般不可交换？`,
      answer: `${texInline(String.raw`f(\sigma)`)}、${texInline(String.raw`g(\sigma)`)} 都是同一个 ${texInline(String.raw`\sigma`)} 的幂的组合，${texInline(String.raw`\sigma^i\sigma^j=\sigma^{i+j}=\sigma^j\sigma^i`)}；两个不同的变换之间没有这样的关系。`,
    },
  ],
  summary: [
    `和是对同一向量分别作用再相加；乘积 ${texInline(String.raw`\sigma\tau`)} 是先 ${texInline(String.raw`\tau`)} 后 ${texInline(String.raw`\sigma`)}，满足结合律，一般不可交换。`,
    `可逆变换的逆仍是线性变换，${texInline(String.raw`(\sigma\tau)^{-1}=\tau^{-1}\sigma^{-1}`)}。`,
    `${texInline(String.raw`f(\sigma)`)} 把多项式代入线性变换，同一个 ${texInline(String.raw`\sigma`)} 的多项式彼此可交换。`,
  ],
});


;/* content/ch7-section3.js */
defineChapter7Section("matrix-of-linear-map", {
  number: "§3",
  textbookSection: "线性变换的矩阵",
  title: "线性变换的矩阵",
  navTitle: "线性变换的矩阵",
  question: "同一个线性变换换一组基，矩阵为什么变成相似的矩阵？",
  goal: `会写线性变换在一组基下的矩阵，掌握坐标公式与换基公式 ${texInline("B=X^{-1}AX")}，知道相似矩阵有相同的迹与行列式。`,
  tags: ["线性变换的矩阵", "过渡矩阵", "相似"],
  intro:
    `取定基 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_n`)}，把 ${texInline(String.raw`\sigma\varepsilon_j`)} 的坐标排成第 ${texInline("j")} 列，就得到 ${texInline(String.raw`\sigma`)} 在这组基下的矩阵。换一组基，${texInline(String.raw`\sigma`)} 本身没有变，记录它的矩阵却变了。下面拖动新基，看矩阵怎样变，又有什么始终不变。`,
  concepts: [
    { label: "矩阵", text: `${texInline(String.raw`\sigma(\varepsilon_1,\dots,\varepsilon_n)=(\varepsilon_1,\dots,\varepsilon_n)A`)}` },
    { label: "换基", text: `${texInline(String.raw`(\eta)=(\varepsilon)X\Rightarrow B=X^{-1}AX`)}` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §3", items: ["线性变换在一组基下的矩阵", "坐标公式", "相似矩阵"] },
  interactive: { type: "slot", title: "同一个 σ，换一组基记录" },
  lesson3d: {
    blocks: [
      {
        title: "矩阵的列是基向量的像的坐标",
        tex: String.raw`\sigma(\varepsilon_1,\dots,\varepsilon_n)=(\varepsilon_1,\dots,\varepsilon_n)A`,
        text: `${texInline("A")} 的第 ${texInline("j")} 列是 ${texInline(String.raw`\sigma\varepsilon_j`)} 在 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_n`)} 下的坐标。若 ${texInline(String.raw`\xi`)} 的坐标是列向量 ${texInline("x")}，则 ${texInline(String.raw`\sigma\xi`)} 的坐标是 ${texInline("Ax")}。任给 ${texInline("n")} 个向量 ${texInline(String.raw`\alpha_1,\dots,\alpha_n`)}，有唯一的线性变换使 ${texInline(String.raw`\sigma\varepsilon_j=\alpha_j`)}，所以取定基以后，线性变换与 ${texInline("n")} 阶矩阵一一对应，和、乘积、逆分别对应矩阵的和、乘积、逆。`,
      },
      {
        title: `换基：${texInline("B=X^{-1}AX")}`,
        tex: String.raw`(\eta_1,\dots,\eta_n)=(\varepsilon_1,\dots,\varepsilon_n)X\ \Longrightarrow\ B=X^{-1}AX`,
        text: `${texInline("X")} 是由 ${texInline(String.raw`\varepsilon`)} 到 ${texInline(String.raw`\eta`)} 的过渡矩阵，第 ${texInline("j")} 列是 ${texInline(String.raw`\eta_j`)} 在 ${texInline(String.raw`\varepsilon`)} 下的坐标；${texInline("B")} 是 ${texInline(String.raw`\sigma`)} 在 ${texInline(String.raw`\eta`)} 下的矩阵。读法：${texInline("X")} 把 ${texInline(String.raw`\eta`)} 坐标翻译成 ${texInline(String.raw`\varepsilon`)} 坐标，${texInline("A")} 在 ${texInline(String.raw`\varepsilon`)} 坐标里作用，${texInline("X^{-1}")} 再翻译回 ${texInline(String.raw`\eta`)} 坐标。同一个线性变换在不同基下的矩阵彼此相似，迹、行列式和特征多项式都相同。`,
      },
      {
        title: "好的基让矩阵变简单",
        text: `若 ${texInline(String.raw`\sigma\eta_j=\lambda_j\eta_j`)}，${texInline("B")} 的第 ${texInline("j")} 列只在对角位置上有数 ${texInline(String.raw`\lambda_j`)}。每个 ${texInline(String.raw`\eta_j`)} 都这样时，${texInline("B")} 是对角矩阵。§4 寻找这样的向量，§5 讨论它们什么时候够组成一组基。`,
      },
    ],
    pitfalls: [
      `把 ${texInline(String.raw`\sigma\varepsilon_j`)} 的坐标写成行。按北大版约定，坐标写成列，依次排成 ${texInline("A")} 的各列。`,
      `把 ${texInline("B=X^{-1}AX")} 写成 ${texInline("XAX^{-1}")}。${texInline("X")} 的列是新基在旧基下的坐标，${texInline("B")} 在右边先乘 ${texInline("X")}。`,
      "以为换基改变了变换本身。改变的只是记录它的矩阵。",
    ],
  },
  example: {
    title: "例题：求导在两组基下的矩阵",
    question: `${texInline(String.raw`P[x]_4`)} 是次数小于 4 的实系数多项式（连同 0）组成的空间。求导 ${texInline("D")} 在基 ${texInline(String.raw`1,x,x^2,x^3`)} 下的矩阵 ${texInline("M")}，在基 ${texInline(String.raw`1,x,\tfrac{x^2}{2},\tfrac{x^3}{6}`)} 下的矩阵 ${texInline("N")}。`,
    choices: [
      { correct: true, text: `${texInline("M")} 在主对角线上方的一条斜线上依次是 ${texInline("1,2,3")}，其余为 ${texInline("0")}；${texInline("N")} 在这条斜线上全是 ${texInline("1")}。` },
      { text: `${texInline("M")} 在主对角线下方的一条斜线上依次是 ${texInline("1,2,3")}（把像的坐标排成了行）。` },
      { text: `${texInline("M")} 与 ${texInline("N")} 相同，因为它们记录的是同一个 ${texInline("D")}。` },
      { text: `${texInline("M")} 在主对角线上方依次是 ${texInline("1,2,3")}；${texInline("N")} 在这条斜线上依次是 ${texInline(String.raw`1,\tfrac12,\tfrac16`)}。` },
    ],
    steps: [
      `${texInline(String.raw`D1=0,\ Dx=1,\ Dx^2=2x,\ Dx^3=3x^2`)}，坐标列依次是 ${texInline(String.raw`(0,0,0,0)^T,(1,0,0,0)^T,(0,2,0,0)^T,(0,0,3,0)^T`)}，所以 ${texInline(String.raw`M=\begin{pmatrix}0&1&0&0\\0&0&2&0\\0&0&0&3\\0&0&0&0\end{pmatrix}`)}。`,
      `新基 ${texInline(String.raw`\eta_1,\dots,\eta_4`)}：${texInline(String.raw`D\eta_1=0,\ D\eta_2=\eta_1,\ D\tfrac{x^2}{2}=x=\eta_2,\ D\tfrac{x^3}{6}=\tfrac{x^2}{2}=\eta_3`)}，所以 ${texInline("N")} 在主对角线上方全是 ${texInline("1")}。`,
      `过渡矩阵 ${texInline(String.raw`X=\operatorname{diag}(1,1,\tfrac12,\tfrac16)`)}，验证 ${texInline(String.raw`N=X^{-1}MX`)}：例如第 3 行第 4 列是 ${texInline(String.raw`2\cdot3\cdot\tfrac16=1`)}。`,
      `${texInline("N")} 中 ${texInline("D")} 把每个基向量送到前一个。把这组基倒过来排成 ${texInline(String.raw`\tfrac{x^3}{6},\tfrac{x^2}{2},x,1`)}，${texInline("1")} 就移到主对角线下方，这正是 §8 的若尔当块 ${texInline("J(0,4)")}。`,
    ],
  },
  quiz: [
    {
      question: `${texInline(String.raw`\sigma`)} 在某组基下的矩阵是单位矩阵 ${texInline("E")}。${texInline(String.raw`\sigma`)} 在其他基下的矩阵是什么？${texInline(String.raw`\sigma`)} 是什么变换？`,
      answer: `${texInline("X^{-1}EX=E")}，在任何基下都是 ${texInline("E")}；${texInline(String.raw`\sigma`)} 是单位变换。`,
    },
    {
      question: "为什么相似矩阵的迹相同？",
      answer: `${texInline(String.raw`|\lambda E-X^{-1}AX|=|X^{-1}(\lambda E-A)X|=|\lambda E-A|`)}，特征多项式相同；迹是 ${texInline(String.raw`\lambda^{n-1}`)} 项系数的相反数。从几何上看，它们记录的是同一个线性变换。`,
    },
    {
      question: `${texInline(String.raw`\mathbb R^2`)} 上旋转 90° 的变换，在某组实基下的矩阵能是对角矩阵吗？`,
      answer: `不能。对角就意味着 ${texInline(String.raw`\sigma\eta_1=\lambda_1\eta_1`)}，有一条直线被保持；旋转 90° 把每条过原点的直线都转走了。`,
    },
    {
      question: `在实验中把 ${texInline(String.raw`\eta_1`)} 换成 ${texInline(String.raw`2\eta_1`)}、${texInline(String.raw`\eta_2`)} 不动，${texInline("B")} 的四个元素怎样变化？`,
      answer: `对角元不变，${texInline("b_{21}")} 乘 2，${texInline("b_{12}")} 除以 2：${texInline(String.raw`\sigma(2\eta_1)=b_{11}(2\eta_1)+2b_{21}\eta_2`)}，而 ${texInline(String.raw`\sigma\eta_2`)} 用 ${texInline(String.raw`2\eta_1`)} 表示时系数减半。`,
    },
  ],
  summary: [
    `${texInline(String.raw`\sigma`)} 在基 ${texInline(String.raw`\varepsilon`)} 下的矩阵 ${texInline("A")}：第 ${texInline("j")} 列是 ${texInline(String.raw`\sigma\varepsilon_j`)} 的坐标；${texInline(String.raw`\sigma\xi`)} 的坐标等于 ${texInline("A")} 乘 ${texInline(String.raw`\xi`)} 的坐标。`,
    `${texInline(String.raw`(\eta)=(\varepsilon)X`)} 时 ${texInline("B=X^{-1}AX")}：同一线性变换在不同基下的矩阵相似，迹与行列式不变。`,
    `基向量都落在被 ${texInline(String.raw`\sigma`)} 保持的直线上时，矩阵成为对角矩阵，这是 §4、§5 的出发点。`,
  ],
});


;/* content/ch7-section4.js */
defineChapter7Section("eigenvalues-eigenvectors", {
  number: "§4",
  textbookSection: "特征值与特征向量",
  title: "特征值与特征向量",
  navTitle: "特征值与特征向量",
  question: "哪些方向在线性变换下只被伸缩？",
  goal: `理解特征值、特征向量与特征子空间；会用特征多项式 ${texInline(String.raw`|\lambda E-A|`)} 求特征值，用 ${texInline(String.raw`(\lambda_0E-A)x=0`)} 求特征向量；知道哈密顿–凯莱定理。`,
  tags: ["特征值", "特征向量", "特征多项式", "特征子空间"],
  intro:
    `多数向量经过 ${texInline(String.raw`\sigma`)} 都会偏离原来的直线。若非零向量 ${texInline(String.raw`\xi`)} 满足 ${texInline(String.raw`\sigma\xi=\lambda_0\xi`)}，它所在的直线就被 ${texInline(String.raw`\sigma`)} 保持，只被伸缩或反向。转动下面的候选方向，找出这样的直线；在三维的例子里，它们能铺满一整个平面。`,
  concepts: [
    { label: "特征向量", text: `${texInline(String.raw`\sigma\xi=\lambda_0\xi`)}，${texInline(String.raw`\xi\ne0`)}。` },
    { label: "特征多项式", text: `${texInline(String.raw`f(\lambda)=|\lambda E-A|`)}，它的根是特征值。` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §4", items: ["特征值与特征向量", "特征多项式", "特征子空间", "哈密顿–凯莱定理"] },
  interactive: { type: "slot", title: "哪些方向只被伸缩" },
  lesson3d: {
    blocks: [
      {
        title: "定义与求法",
        tex: String.raw`\sigma\xi=\lambda_0\xi\ (\xi\ne0)\iff (\lambda_0E-A)x=0\ \text{有非零解}\iff |\lambda_0E-A|=0`,
        text: `${texInline("x")} 是 ${texInline(String.raw`\xi`)} 在一组基下的坐标，${texInline("A")} 是 ${texInline(String.raw`\sigma`)} 在这组基下的矩阵。${texInline(String.raw`f(\lambda)=|\lambda E-A|`)} 称为 ${texInline("A")} 的特征多项式，它在数域 ${texInline("P")} 中的根就是 ${texInline(String.raw`\sigma`)} 的全部特征值；对每个特征值 ${texInline(String.raw`\lambda_0`)} 解 ${texInline(String.raw`(\lambda_0E-A)x=0`)}，基础解系给出属于 ${texInline(String.raw`\lambda_0`)} 的全部线性无关的特征向量。`,
      },
      {
        title: "特征子空间可以是多维的",
        tex: String.raw`V_{\lambda_0}=\{\xi\in V:\ \sigma\xi=\lambda_0\xi\},\qquad \dim V_{\lambda_0}=n-\operatorname{rank}(\lambda_0E-A)`,
        text: `${texInline(String.raw`V_{\lambda_0}`)} 由属于 ${texInline(String.raw`\lambda_0`)} 的全部特征向量连同零向量组成，是一个子空间。它的维数可以大于 1：实验里的三阶矩阵，${texInline("V_{-1}")} 是整个平面 ${texInline("x_1+x_2+x_3=0")}，平面里每个方向都被反向。`,
      },
      {
        title: "哈密顿–凯莱定理",
        tex: String.raw`f(\lambda)=|\lambda E-A|\ \Longrightarrow\ f(A)=a_nA^n+\cdots+a_1A+a_0E=O`,
        text: `相似矩阵的特征多项式相同，所以特征多项式属于线性变换本身，${texInline(String.raw`f(\sigma)=0`)}。用它可以把 ${texInline("A")} 的高次幂降到 ${texInline("n-1")} 次以下；§9 的最小多项式是 ${texInline("f")} 的因式。`,
      },
    ],
    pitfalls: [
      `把零向量算作特征向量。${texInline(String.raw`\sigma0=\lambda0`)} 对任何 ${texInline(String.raw`\lambda`)} 都成立，所以要求 ${texInline(String.raw`\xi\ne0`)}；特征值 ${texInline(String.raw`\lambda_0=0`)} 却是允许的。`,
      `不说数域。旋转 90° 在实数域上没有特征值，在复数域上有 ${texInline(String.raw`\pm i`)}。`,
      `以为特征向量是唯一的。属于 ${texInline(String.raw`\lambda_0`)} 的特征向量的非零线性组合仍是属于 ${texInline(String.raw`\lambda_0`)} 的特征向量。`,
    ],
  },
  example: {
    title: "例题：一个特征值对应一个平面",
    question: `求 ${texInline(String.raw`A=\begin{pmatrix}1&2&2\\2&1&2\\2&2&1\end{pmatrix}`)} 的特征值与特征子空间。`,
    choices: [
      { correct: true, text: `${texInline(String.raw`\lambda=5`)}，${texInline(String.raw`V_5=L((1,1,1)^T)`)}；${texInline(String.raw`\lambda=-1`)}（二重），${texInline(String.raw`V_{-1}`)} 是平面 ${texInline("x_1+x_2+x_3=0")}，维数 2。` },
      { text: `${texInline(String.raw`\lambda=5,-1,-1`)}，每个特征值各对应一条特征直线。` },
      { text: `${texInline(String.raw`\lambda=1`)}（三重），因为对角元都是 ${texInline("1")}。` },
      { text: `${texInline(String.raw`\lambda=3,1,-1`)}，因为它们的和等于迹 ${texInline("3")}。` },
    ],
    steps: [
      `${texInline(String.raw`|\lambda E-A|=(\lambda-5)(\lambda+1)^2`)}。（${texInline("A=2J-E")}，${texInline("J")} 是全 1 矩阵，也可以由 ${texInline("J")} 的特征值 ${texInline("3,0,0")} 直接得到。）`,
      `${texInline(String.raw`\lambda=5`)}：${texInline(String.raw`(5E-A)x=0`)} 化简得 ${texInline("x_1=x_2=x_3")}，${texInline(String.raw`V_5=L((1,1,1)^T)`)}。`,
      `${texInline(String.raw`\lambda=-1`)}：${texInline(String.raw`(-E-A)x=0`)} 的三个方程都是 ${texInline("x_1+x_2+x_3=0")}，秩为 1，基础解系 ${texInline(String.raw`(-1,1,0)^T,(-1,0,1)^T`)}，${texInline(String.raw`\dim V_{-1}=2`)}。`,
      `检验：${texInline(String.raw`5+(-1)+(-1)=3=\operatorname{tr}A`)}，${texInline(String.raw`5\cdot(-1)\cdot(-1)=5=|A|`)}。`,
    ],
  },
  quiz: [
    {
      question: `求导 ${texInline("D")} 在 ${texInline(String.raw`P[x]_n`)}（${texInline(String.raw`n\ge2`)}）上有哪些特征值和特征向量？`,
      answer: `在基 ${texInline(String.raw`1,x,\dots,x^{n-1}`)} 下 ${texInline("D")} 的矩阵主对角线全为 ${texInline("0")} 且是上三角的，特征多项式是 ${texInline(String.raw`\lambda^n`)}，只有特征值 ${texInline("0")}；${texInline("Df=0")} 的非零 ${texInline("f")} 是非零常数，${texInline("V_0")} 是一维的。`,
    },
    {
      question: `${texInline(String.raw`M_2(\mathbb R)`)} 上的转置变换 ${texInline(String.raw`T(X)=X^T`)} 有哪些特征值？特征子空间各是几维？`,
      answer: `${texInline("T^2=E")}，所以特征值只能是 ${texInline(String.raw`\pm1`)}。${texInline(String.raw`\lambda=1`)} 对应对称矩阵，维数 3；${texInline(String.raw`\lambda=-1`)} 对应反对称矩阵，维数 1。${texInline("3+1=4")}，两者铺满 ${texInline("M_2")}。`,
    },
    {
      question: `${texInline("A")} 与 ${texInline("A^T")} 的特征值相同吗？特征向量呢？`,
      answer: `${texInline(String.raw`|\lambda E-A^T|=|\lambda E-A|`)}，特征值相同。特征向量一般不同：${texInline(String.raw`A=\begin{pmatrix}1&1\\0&2\end{pmatrix}`)} 属于 ${texInline("1")} 的是 ${texInline("(1,0)^T")}，${texInline("A^T")} 属于 ${texInline("1")} 的是 ${texInline("(1,-1)^T")}。`,
    },
  ],
  summary: [
    `特征向量是所在直线被 ${texInline(String.raw`\sigma`)} 保持的非零向量：${texInline(String.raw`\sigma\xi=\lambda_0\xi`)}。`,
    `特征值是 ${texInline(String.raw`|\lambda E-A|`)} 在 ${texInline("P")} 中的根；${texInline(String.raw`V_{\lambda_0}`)} 是 ${texInline(String.raw`(\lambda_0E-A)x=0`)} 的解空间，维数可以大于 1。`,
    `哈密顿–凯莱定理：${texInline("A")} 是自己特征多项式的根，${texInline("f(A)=O")}。`,
  ],
});


;/* content/ch7-section5.js */
defineChapter7Section("diagonal-matrices", {
  number: "§5",
  textbookSection: "对角矩阵",
  title: "对角矩阵",
  navTitle: "对角矩阵",
  question: `有了特征向量组成的基，${texInline("A^k")} 为什么变得好算？`,
  goal: `掌握 ${texInline(String.raw`\sigma`)} 可对角化的条件，会写 ${texInline(String.raw`X^{-1}AX=\operatorname{diag}(\lambda_1,\dots,\lambda_n)`)} 并用它计算 ${texInline("A^k")}；看懂迭代 ${texInline("x_{k+1}=Ax_k")} 的长期走向。`,
  tags: ["可对角化", "特征向量基", "矩阵的幂"],
  intro:
    `在特征向量组成的基下，${texInline(String.raw`\sigma`)} 只把每个坐标各乘一个数，作用 ${texInline("k")} 次就是各乘 ${texInline(String.raw`\lambda_i^k`)}。把初始向量拆成特征向量的组合，每一份按自己的 ${texInline(String.raw`\lambda`)} 独立增长或衰减。下面反复作用 ${texInline("A")}，看点最终跑向哪里。`,
  concepts: [
    { label: "可对角化", text: `${texInline(String.raw`\sigma`)} 在某组基下的矩阵是对角矩阵，当且仅当 ${texInline(String.raw`\sigma`)} 有 ${texInline("n")} 个线性无关的特征向量。` },
    { label: "幂", text: `${texInline(String.raw`A^k=X\operatorname{diag}(\lambda_1^k,\dots,\lambda_n^k)X^{-1}`)}` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §5", items: ["线性变换可对角化的条件", "属于不同特征值的特征向量线性无关", "矩阵的对角化"] },
  interactive: { type: "slot", title: "反复作用 A，点跑向哪里" },
  lesson3d: {
    blocks: [
      {
        title: "可对角化的判别",
        tex: String.raw`X^{-1}AX=\operatorname{diag}(\lambda_1,\dots,\lambda_n)\iff AX_i=\lambda_iX_i\ (i=1,\dots,n),\ X_1,\dots,X_n\ \text{线性无关}`,
        text: `${texInline("X_i")} 是 ${texInline("X")} 的第 ${texInline("i")} 列，它是属于 ${texInline(String.raw`\lambda_i`)} 的特征向量，列的顺序与对角元一一对应。属于不同特征值的特征向量线性无关，所以 ${texInline("n")} 个互不相同的特征值保证可对角化；有重根时，要看各特征子空间的维数之和是否等于 ${texInline("n")}。`,
      },
      {
        title: "幂与迭代",
        tex: String.raw`x_0=c_1X_1+\cdots+c_nX_n\ \Longrightarrow\ A^kx_0=c_1\lambda_1^kX_1+\cdots+c_n\lambda_n^kX_n`,
        text: `${texInline(String.raw`|\lambda|<1`)} 的分量衰减，${texInline(String.raw`|\lambda|>1`)} 的分量增长，${texInline(String.raw`\lambda=1`)} 的分量保持不变。${texInline("k")} 很大时，${texInline(String.raw`|\lambda|`)} 最大且系数不为 0 的那一份占主导，点贴着它的特征直线运动。`,
      },
      {
        title: "特征向量不够时",
        text: `${texInline(String.raw`A=\begin{pmatrix}1&1\\0&1\end{pmatrix}`)} 的特征值 ${texInline("1")} 是二重根，${texInline("V_1")} 只有一维，不能对角化。它的迭代 ${texInline(String.raw`(x_1,x_2)\mapsto(x_1+x_2,x_2)`)} 每步平移 ${texInline("x_2")}，是等差的漂移，拆不成按几何级数伸缩的分量。§8 用若尔当形描述这种情形。`,
      },
    ],
    pitfalls: [
      `${texInline("X")} 的列顺序与对角元顺序对不上。交换 ${texInline("X")} 的两列，对角矩阵里的两个特征值也要交换。`,
      `以为有重特征值就不能对角化。单位矩阵 ${texInline("E")} 的特征值全相同，它本身就是对角矩阵。`,
      "以为特征向量必须互相垂直。一般矩阵的特征向量只需线性无关。",
    ],
  },
  example: {
    title: "例题：用对角化求 Aⁿ",
    question: `${texInline(String.raw`A=\begin{pmatrix}4&1\\2&3\end{pmatrix}`)}，求 ${texInline("A^n")}。`,
    choices: [
      { correct: true, text: texInline(String.raw`A^n=\tfrac13\begin{pmatrix}2\cdot5^n+2^n&5^n-2^n\\2\cdot5^n-2\cdot2^n&5^n+2\cdot2^n\end{pmatrix}`) },
      { text: texInline(String.raw`A^n=\begin{pmatrix}4^n&1\\2&3^n\end{pmatrix}`) },
      { text: texInline(String.raw`A^n=\begin{pmatrix}5^n&0\\0&2^n\end{pmatrix}`) },
      { text: texInline(String.raw`A^n=\tfrac13\begin{pmatrix}2\cdot2^n+5^n&2^n-5^n\\2\cdot2^n-2\cdot5^n&2^n+2\cdot5^n\end{pmatrix}`) },
    ],
    steps: [
      `${texInline(String.raw`|\lambda E-A|=(\lambda-4)(\lambda-3)-2=(\lambda-5)(\lambda-2)`)}。`,
      `${texInline(String.raw`\lambda=5`)}：${texInline("x_1=x_2")}，取 ${texInline(String.raw`X_1=(1,1)^T`)}；${texInline(String.raw`\lambda=2`)}：${texInline("2x_1+x_2=0")}，取 ${texInline(String.raw`X_2=(1,-2)^T`)}。`,
      `${texInline(String.raw`X=\begin{pmatrix}1&1\\1&-2\end{pmatrix}`)}，${texInline(String.raw`X^{-1}=\tfrac13\begin{pmatrix}2&1\\1&-1\end{pmatrix}`)}，${texInline(String.raw`A^n=X\operatorname{diag}(5^n,2^n)X^{-1}`)}，乘出来就是左上角为 ${texInline(String.raw`\tfrac13(2\cdot5^n+2^n)`)} 的那一项。`,
      `检验 ${texInline("n=1")}：${texInline(String.raw`\tfrac13\begin{pmatrix}12&3\\6&9\end{pmatrix}=A`)}。左上角为 ${texInline(String.raw`\tfrac13(2\cdot2^n+5^n)`)} 的那一项把 ${texInline(String.raw`5^n,2^n`)} 与 ${texInline("X")} 的列配错了，${texInline("n=1")} 时得不到 ${texInline("A")}。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("n")} 个互不相同的特征值能推出可对角化。反过来，可对角化的矩阵一定有 ${texInline("n")} 个互不相同的特征值吗？`,
      answer: `不一定，单位矩阵 ${texInline("E")} 就是反例。`,
    },
    {
      question: `在上面的例题中，从 ${texInline("x_0=(1,-2)^T")} 出发反复乘 ${texInline("A")}，点怎样运动？从 ${texInline("(1,0)^T")} 出发呢？`,
      answer: `${texInline("(1,-2)^T")} 是属于 ${texInline("2")} 的特征向量，${texInline(String.raw`x_k=2^k(1,-2)^T`)} 一直在这条直线上。${texInline(String.raw`(1,0)^T=\tfrac23(1,1)^T+\tfrac13(1,-2)^T`)}，${texInline(String.raw`x_k=\tfrac23\cdot5^k(1,1)^T+\tfrac13\cdot2^k(1,-2)^T`)}，${texInline("5^k")} 的分量占主导，方向趋近 ${texInline("(1,1)^T")}。`,
    },
    {
      question: `若 ${texInline("A^2=A")}，${texInline("A")} 的特征值只能是什么？`,
      answer: `${texInline(String.raw`A\xi=\lambda\xi`)} 推出 ${texInline(String.raw`A^2\xi=\lambda^2\xi=\lambda\xi`)}，所以 ${texInline(String.raw`\lambda^2=\lambda`)}，${texInline(String.raw`\lambda=0`)} 或 ${texInline("1")}。§9 会说明这样的 ${texInline("A")} 一定可对角化。`,
    },
  ],
  summary: [
    `${texInline(String.raw`\sigma`)} 可对角化当且仅当有 ${texInline("n")} 个线性无关的特征向量；${texInline("X")} 的列与对角元一一对应。`,
    `${texInline(String.raw`A^k=X\operatorname{diag}(\lambda_i^k)X^{-1}`)}：把向量拆成特征分量，每一份按自己的 ${texInline(String.raw`\lambda`)} 独立伸缩。`,
    "特征向量不够时不能对角化，迭代出现等差漂移，留给若尔当形处理。",
  ],
});


;/* content/ch7-section6.js */
defineChapter7Section("image-and-kernel", {
  number: "§6",
  textbookSection: "线性变换的值域与核",
  title: "线性变换的值域与核",
  navTitle: "值域与核",
  question: "线性变换丢掉了哪些方向，又保留了哪些方向？",
  goal: `会求线性变换的值域 ${texInline(String.raw`\sigma V`)} 与核 ${texInline(String.raw`\sigma^{-1}(0)`)}，理解维数公式 ${texInline(String.raw`\dim\sigma V+\dim\sigma^{-1}(0)=n`)}，知道值域与核不一定互补。`,
  tags: ["值域", "核", "秩", "维数公式"],
  intro:
    `${texInline(String.raw`\sigma`)} 把一部分向量压成零，它们组成核 ${texInline(String.raw`\sigma^{-1}(0)`)}；全体像组成值域 ${texInline(String.raw`\sigma V`)}。核越大，值域越小，两者的维数之和恰好是 ${texInline("n")}。下面沿核拖动一个点，看它的像为什么一动不动。`,
  concepts: [
    { label: "值域", text: `${texInline(String.raw`\sigma V=\{\sigma\alpha:\ \alpha\in V\}`)}，维数称为 ${texInline(String.raw`\sigma`)} 的秩。` },
    { label: "核", text: `${texInline(String.raw`\sigma^{-1}(0)=\{\alpha\in V:\ \sigma\alpha=0\}`)}，维数称为 ${texInline(String.raw`\sigma`)} 的零度。` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §6", items: ["值域与核", "秩与零度", "维数公式"] },
  interactive: { type: "slot", title: "沿核滑动，像不动" },
  lesson3d: {
    blocks: [
      {
        title: "值域由基的像张成，维数等于矩阵的秩",
        tex: String.raw`\sigma V=L(\sigma\varepsilon_1,\dots,\sigma\varepsilon_n),\qquad \dim\sigma V=\operatorname{rank}A`,
        text: `${texInline("A")} 是 ${texInline(String.raw`\sigma`)} 在基 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_n`)} 下的矩阵。${texInline(String.raw`\sigma\varepsilon_j`)} 的坐标是 ${texInline("A")} 的第 ${texInline("j")} 列，所以值域对应 ${texInline("A")} 的列空间；核对应齐次方程组 ${texInline("Ax=0")} 的解空间，它的一个基础解系给出核的一组基。`,
      },
      {
        title: "维数公式",
        tex: String.raw`\dim\sigma V+\dim\sigma^{-1}(0)=n`,
        text: `取核的一组基 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_k`)}，扩充成 ${texInline("V")} 的基 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_n`)}，则 ${texInline(String.raw`\sigma\varepsilon_{k+1},\dots,\sigma\varepsilon_n`)} 是值域的一组基。推论：有限维空间上，${texInline(String.raw`\sigma`)} 是单射 ${texInline(String.raw`\iff`)} ${texInline(String.raw`\sigma`)} 是满射 ${texInline(String.raw`\iff`)} ${texInline(String.raw`\sigma`)} 可逆。实验中沿核移动 ${texInline("x'")}，${texInline(String.raw`\sigma x'`)} 不变，因为 ${texInline("x'-x")} 在核里；${texInline(String.raw`\sigma x`)} 的全部原像恰好组成 ${texInline(String.raw`x+\sigma^{-1}(0)`)}。`,
      },
      {
        title: "维数互补，子空间未必互补",
        tex: String.raw`\sigma^2=\sigma\ \Longrightarrow\ V=\sigma V\oplus\sigma^{-1}(0)`,
        text: `维数公式只保证维数加起来是 ${texInline("n")}，${texInline(String.raw`\sigma V`)} 与 ${texInline(String.raw`\sigma^{-1}(0)`)} 却可以相交。求导 ${texInline("D")} 作用在 ${texInline("P[x]_3")} 上，常数既在核里，又是 ${texInline("x")} 的导数，于是核含在值域里。${texInline(String.raw`\sigma^2=\sigma`)} 时 ${texInline(String.raw`\alpha=\sigma\alpha+(\alpha-\sigma\alpha)`)} 给出直和分解，实验的第一种模式就是这种情形。`,
      },
    ],
    pitfalls: [
      `以为 ${texInline(String.raw`V=\sigma V\oplus\sigma^{-1}(0)`)} 总成立。它要求两者只交于零向量，${texInline("D")} 在 ${texInline("P[x]_3")} 上就不满足。`,
      `把核 ${texInline(String.raw`\sigma^{-1}(0)`)} 读成逆变换作用在 ${texInline("0")} 上。${texInline(String.raw`\sigma^{-1}(0)`)} 是被送到 ${texInline("0")} 的向量的集合，${texInline(String.raw`\sigma`)} 不必可逆。`,
      `用阶梯形里的列作为值域的基。应该取 ${texInline("A")} 中主元所在的原来的列，它们是 ${texInline(String.raw`\sigma\varepsilon_j`)} 的坐标。`,
    ],
  },
  example: {
    title: "例题：矩阵空间上的值域与核",
    question: `在 ${texInline(String.raw`M_2(\mathbb R)`)} 上令 ${texInline(String.raw`\sigma(X)=X-X^{T}`)}。求 ${texInline(String.raw`\sigma`)} 的核与值域，它们的维数各是多少？`,
    choices: [
      { correct: true, text: "核是全体对称矩阵（3 维），值域是全体反对称矩阵（1 维）。" },
      { text: "核是全体反对称矩阵（1 维），值域是全体对称矩阵（3 维）。" },
      { text: `核只有零矩阵，${texInline(String.raw`\sigma`)} 可逆。` },
      { text: `核是全体对称矩阵（3 维），值域是整个 ${texInline("M_2")}（4 维）。` },
    ],
    steps: [
      `${texInline(String.raw`\sigma(X)=0\iff X=X^{T}`)}，所以核是对称矩阵 ${texInline(String.raw`\begin{pmatrix}a&b\\b&c\end{pmatrix}`)} 组成的子空间，维数 3。`,
      `${texInline(String.raw`(X-X^{T})^{T}=-(X-X^{T})`)}，所以值域含在反对称矩阵里；反对称矩阵都是 ${texInline(String.raw`\begin{pmatrix}0&t\\-t&0\end{pmatrix}`)}，而它等于 ${texInline(String.raw`\sigma\begin{pmatrix}0&t\\0&0\end{pmatrix}`)}，所以值域恰是反对称矩阵，维数 1。`,
      `核对：${texInline(String.raw`3+1=4=\dim M_2(\mathbb R)`)}。`,
      `对称矩阵与反对称矩阵只有零矩阵是公共的，所以这里 ${texInline(String.raw`M_2(\mathbb R)=\sigma V\oplus\sigma^{-1}(0)`)}。和 ${texInline("D")} 在 ${texInline("P[x]_3")} 上的情形对照：维数公式两边都成立，直和只在这里成立。`,
    ],
  },
  quiz: [
    {
      question: `${texInline(String.raw`\sigma^2=0`)}（${texInline(String.raw`\sigma`)} 作用两次得零变换）等价于值域与核之间的什么关系？用 ${texInline(String.raw`\begin{pmatrix}0&1\\0&0\end{pmatrix}`)} 检验。`,
      answer: `${texInline(String.raw`\sigma^2=0\iff\sigma(\sigma\alpha)=0`)} 对一切 ${texInline(String.raw`\alpha`)} ${texInline(String.raw`\iff\sigma V\subseteq\sigma^{-1}(0)`)}。这个矩阵把 ${texInline("(a,b)^T")} 送到 ${texInline("(b,0)^T")}：核是 ${texInline("x_1")} 轴，值域也是 ${texInline("x_1")} 轴，两者重合，维数 ${texInline("1+1=2")}。`,
    },
    {
      question: `有限维空间 ${texInline("V")} 上，${texInline(String.raw`\sigma`)} 是单射和 ${texInline(String.raw`\sigma`)} 是满射有什么关系？在 ${texInline("P[x]")} 上求导 ${texInline("D")} 是什么情形？`,
      answer: `有限维时二者等价：单射 ${texInline(String.raw`\iff`)} 核为 ${texInline("0")} ${texInline(String.raw`\iff`)} 值域维数为 ${texInline("n")} ${texInline(String.raw`\iff`)} 满射。${texInline("P[x]")} 是无限维的，${texInline("D")} 是满射（每个多项式都有原函数），却不是单射（常数被送到 ${texInline("0")}）。`,
    },
    {
      question: `实验第一种模式中 ${texInline(String.raw`\sigma^2=\sigma`)}。为什么这时 ${texInline(String.raw`\mathbb R^3=\sigma V\oplus\sigma^{-1}(0)`)}？`,
      answer: `任一 ${texInline(String.raw`\alpha=\sigma\alpha+(\alpha-\sigma\alpha)`)}，且 ${texInline(String.raw`\sigma(\alpha-\sigma\alpha)=\sigma\alpha-\sigma^2\alpha=0`)}，所以和是全空间；若 ${texInline(String.raw`\beta=\sigma\gamma`)} 又在核里，则 ${texInline(String.raw`\beta=\sigma\gamma=\sigma^2\gamma=\sigma\beta=0`)}，交为零。`,
    },
    {
      question: `${texInline(String.raw`\sigma`)} 在某组基下的矩阵是 3 阶矩阵 ${texInline("A")}，${texInline(String.raw`\operatorname{rank}A=2`)}。${texInline(String.raw`\sigma`)} 的核是几维的？${texInline(String.raw`\sigma`)} 可能是满射吗？`,
      answer: `核是 ${texInline("3-2=1")} 维的；值域只有 2 维，不是满射。`,
    },
  ],
  summary: [
    `值域 ${texInline(String.raw`\sigma V=L(\sigma\varepsilon_1,\dots,\sigma\varepsilon_n)`)}，维数等于 ${texInline(String.raw`\operatorname{rank}A`)}；核对应 ${texInline("Ax=0")} 的解空间。`,
    `${texInline(String.raw`\dim\sigma V+\dim\sigma^{-1}(0)=n`)}；有限维时单射、满射、可逆三者等价。`,
    `维数互补不等于子空间互补：${texInline(String.raw`\sigma V`)} 与 ${texInline(String.raw`\sigma^{-1}(0)`)} 可以相交；只有两者只交于零向量时才是直和（例如 ${texInline(String.raw`\sigma^2=\sigma`)} 时）。`,
  ],
});


;/* content/ch7-section7.js */
defineChapter7Section("invariant-subspaces", {
  number: "§7",
  textbookSection: "不变子空间",
  title: "不变子空间",
  navTitle: "不变子空间",
  question: `哪些子空间在 ${texInline(String.raw`\sigma`)} 作用下不会离开自己？`,
  goal: "理解不变子空间的定义与常见例子，知道不变子空间的直和分解对应准对角矩阵，了解按特征值的根子空间分解。",
  tags: ["不变子空间", "准对角矩阵", "根子空间"],
  intro:
    `${texInline(String.raw`\sigma`)} 把子空间 ${texInline("W")} 映进 ${texInline("W")} 自身时，${texInline("W")} 称为 ${texInline(String.raw`\sigma`)} 的不变子空间，这时可以只在 ${texInline("W")} 里研究 ${texInline(String.raw`\sigma`)}，矩阵也随之分块。一维的不变子空间就是特征向量所在的直线；二维的不变平面却可以不含任何实特征向量。`,
  concepts: [
    { label: "不变子空间", text: `${texInline(String.raw`\sigma W\subseteq W`)}，即 ${texInline("W")} 中每个向量的像仍在 ${texInline("W")} 中。` },
    { label: "准对角", text: `${texInline("V")} 分解成不变子空间的直和时，适配基下 ${texInline(String.raw`\sigma`)} 的矩阵是准对角矩阵。` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §7", items: ["不变子空间的定义与例", "不变子空间与矩阵化简", "按特征值分解为不变子空间的直和"] },
  interactive: { type: "slot", title: "σW 有没有离开 W" },
  lesson3d: {
    blocks: [
      {
        title: "定义与常见的不变子空间",
        tex: String.raw`\sigma W\subseteq W\iff \sigma\alpha_1,\dots,\sigma\alpha_s\in W\quad(W=L(\alpha_1,\dots,\alpha_s))`,
        text: `检验时只需看生成元的像。${texInline(String.raw`\{0\}`)}、${texInline("V")}、值域 ${texInline(String.raw`\sigma V`)}、核 ${texInline(String.raw`\sigma^{-1}(0)`)}、每个特征子空间 ${texInline(String.raw`V_\lambda`)} 都是 ${texInline(String.raw`\sigma`)} 的不变子空间。一维子空间 ${texInline(String.raw`L(\xi)`)} 不变，当且仅当 ${texInline(String.raw`\xi`)} 是特征向量。若 ${texInline(String.raw`\sigma\tau=\tau\sigma`)}，则 ${texInline(String.raw`\tau`)} 的值域与核都是 ${texInline(String.raw`\sigma`)} 的不变子空间。`,
      },
      {
        title: "不变子空间让矩阵分块",
        tex: String.raw`V=W_1\oplus W_2,\ \ \sigma W_i\subseteq W_i\ \Longrightarrow\ \sigma(\varepsilon_1,\dots,\varepsilon_n)=(\varepsilon_1,\dots,\varepsilon_n)\begin{pmatrix}A_1&0\\0&A_2\end{pmatrix}`,
        text: `${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_k`)} 是 ${texInline("W_1")} 的基，${texInline(String.raw`\varepsilon_{k+1},\dots,\varepsilon_n`)} 是 ${texInline("W_2")} 的基，${texInline("A_1")}、${texInline("A_2")} 是 ${texInline(String.raw`\sigma`)} 限制在 ${texInline("W_1")}、${texInline("W_2")} 上的矩阵。只有 ${texInline("W_1")} 不变时，把 ${texInline("W_1")} 的基扩充成 ${texInline("V")} 的基，矩阵是右上角带一块的分块上三角形。实验中 ${texInline("A")} 的不变平面配上不变直线，得到 2 阶块和 1 阶块。`,
      },
      {
        title: "按特征值分解",
        tex: String.raw`f(\lambda)=(\lambda-\lambda_1)^{r_1}\cdots(\lambda-\lambda_s)^{r_s}\ \Longrightarrow\ V=V_1\oplus\cdots\oplus V_s,\quad V_i=\{\xi:\ (\sigma-\lambda_iE)^{r_i}\xi=0\}`,
        text: `${texInline("f")} 是 ${texInline(String.raw`\sigma`)} 的特征多项式。每个 ${texInline("V_i")} 都是不变子空间，于是 ${texInline(String.raw`\sigma`)} 的矩阵化成 ${texInline("s")} 块，每块只有一个特征值 ${texInline(String.raw`\lambda_i`)}。${texInline("V_i")} 一般比特征子空间 ${texInline(String.raw`V_{\lambda_i}`)} 大，§8 在每个 ${texInline("V_i")} 里继续化简。`,
      },
    ],
    pitfalls: [
      `把不变理解成逐点不动。不变只要求 ${texInline(String.raw`\sigma W`)} 落在 ${texInline("W")} 里，${texInline("W")} 中的向量可以在 ${texInline("W")} 内部移动。`,
      "以为不变子空间一定有不变的补空间。剪切只有一条不变直线，它没有不变的补空间。",
      `以为不变子空间里一定有实特征向量。实验中的 ${texInline("x_1x_2")} 平面不变，平面里每条直线却都被转走。`,
    ],
  },
  example: {
    title: "例题：求导的全部不变子空间",
    question: `${texInline(String.raw`P[x]_4`)} 是次数小于 4 的实系数多项式（连同 0）组成的空间，${texInline("D")} 是求导。${texInline("D")} 有哪些不变子空间？`,
    choices: [
      { correct: true, text: `恰有 5 个：${texInline(String.raw`\{0\},\ P[x]_1,\ P[x]_2,\ P[x]_3,\ P[x]_4`)}。` },
      { text: `只有 ${texInline(String.raw`\{0\}`)} 和 ${texInline(String.raw`P[x]_4`)}。` },
      { text: `每条直线 ${texInline(String.raw`L(x^k)`)} 都是不变子空间，所以至少有 4 个一维的。` },
      { text: `有无穷多个，因为 ${texInline("P[x]_4")} 有无穷多个子空间。` },
    ],
    steps: [
      `${texInline(String.raw`P[x]_k`)}（次数小于 ${texInline("k")}）显然不变：求导降低次数。`,
      `反过来，设 ${texInline(String.raw`W\ne\{0\}`)} 不变，取 ${texInline("W")} 中次数最高的 ${texInline("f")}，次数为 ${texInline("k-1")}。则 ${texInline(String.raw`f,Df,\dots,D^{k-1}f`)} 都在 ${texInline("W")} 里，次数依次是 ${texInline(String.raw`k-1,\dots,1,0`)}，线性无关，所以 ${texInline(String.raw`P[x]_k\subseteq W`)}。`,
      `${texInline("W")} 中多项式次数都不超过 ${texInline("k-1")}，又有 ${texInline(String.raw`W\subseteq P[x]_k`)}，故 ${texInline(String.raw`W=P[x]_k`)}。`,
      `${texInline(String.raw`L(x^k)`)}（${texInline(String.raw`k\ge1`)}）不变不成立：${texInline(String.raw`Dx^k=kx^{k-1}\notin L(x^k)`)}。一维不变子空间只有 ${texInline("L(1)")}，对应 ${texInline("D")} 唯一的特征值 ${texInline("0")}。`,
    ],
  },
  quiz: [
    {
      question: `实验中的 ${texInline("A")}（绕 ${texInline("x_3")} 轴转 90°，再沿 ${texInline("x_3")} 轴拉伸 2 倍）在实数域上恰有哪几个不变子空间？`,
      answer: `4 个：${texInline(String.raw`\{0\}`)}、${texInline("x_3")} 轴、${texInline("x_1x_2")} 平面、${texInline(String.raw`\mathbb R^3`)}。一维不变子空间是实特征向量的直线，只有 ${texInline(String.raw`\lambda=2`)} 的 ${texInline("x_3")} 轴；二维不变子空间上的限制，其特征多项式是 ${texInline(String.raw`(\lambda^2+1)(\lambda-2)`)} 的二次实因式，只能是 ${texInline(String.raw`\lambda^2+1`)}，对应 ${texInline(String.raw`\ker(A^2+E)`)}，即 ${texInline("x_1x_2")} 平面。`,
    },
    {
      question: `若 ${texInline(String.raw`\sigma\tau=\tau\sigma`)}，为什么 ${texInline(String.raw`\tau`)} 的核 ${texInline(String.raw`\tau^{-1}(0)`)} 是 ${texInline(String.raw`\sigma`)} 的不变子空间？`,
      answer: `${texInline(String.raw`\xi\in\tau^{-1}(0)`)} 时 ${texInline(String.raw`\tau(\sigma\xi)=\sigma(\tau\xi)=\sigma0=0`)}，所以 ${texInline(String.raw`\sigma\xi`)} 仍在 ${texInline(String.raw`\tau^{-1}(0)`)} 里。`,
    },
    {
      question: `${texInline("W_1")}、${texInline("W_2")} 都是 ${texInline(String.raw`\sigma`)} 的不变子空间，${texInline(String.raw`W_1\cap W_2`)} 和 ${texInline("W_1+W_2")} 还是吗？`,
      answer: `都是。${texInline(String.raw`\alpha\in W_1\cap W_2`)} 时 ${texInline(String.raw`\sigma\alpha`)} 同时在 ${texInline("W_1")}、${texInline("W_2")} 中；${texInline(String.raw`\sigma(\alpha_1+\alpha_2)=\sigma\alpha_1+\sigma\alpha_2\in W_1+W_2`)}。`,
    },
    {
      question: `剪切 ${texInline(String.raw`\begin{pmatrix}1&1\\0&1\end{pmatrix}`)} 的矩阵能化成准对角（两个 1 阶块）吗？`,
      answer: `不能。两个 1 阶块意味着两条不变直线组成直和，而剪切只有 ${texInline("x_1")} 轴一条不变直线；适配基下最多化成上三角形。`,
    },
  ],
  summary: [
    `${texInline(String.raw`\sigma W\subseteq W`)} 时 ${texInline("W")} 是不变子空间；只需检查生成元的像。`,
    `${texInline("V")} 分解成不变子空间的直和，就把 ${texInline(String.raw`\sigma`)} 的矩阵化成准对角形；一维不变子空间就是特征直线。`,
    `按特征值把 ${texInline("V")} 分成根子空间的直和，每块只剩一个特征值，§8 再在每块里化简。`,
  ],
});


;/* content/ch7-section8.js */
defineChapter7Section("jordan-form-introduction", {
  number: "§8",
  textbookSection: "若尔当标准形简介",
  title: "若尔当标准形简介",
  navTitle: "若尔当标准形",
  question: "特征向量不够组成一组基时，矩阵最简能化成什么样？",
  goal: `认识若尔当块与若尔当形，知道复数域上每个矩阵都相似于若尔当形；会由 ${texInline(String.raw`A-\lambda E`)} 的各次幂的秩读出若尔当块的个数与大小。`,
  tags: ["若尔当块", "若尔当形", "链"],
  intro:
    `特征向量不够时，矩阵化不成对角形。退一步，在复数域上总能找到一组基，使矩阵只在主对角线下方多出一些 ${texInline("1")}：每串基向量被 ${texInline(String.raw`\sigma-\lambda E`)} 依次推到下一个，最后一个是特征向量，再推一次就是 ${texInline("0")}。`,
  concepts: [
    { label: "若尔当块", text: `${texInline(String.raw`J(\lambda,k)`)}：${texInline("k")} 阶，主对角线上全是 ${texInline(String.raw`\lambda`)}，紧挨在下方的一条斜线上全是 ${texInline("1")}。` },
    { label: "若尔当形", text: "由若干若尔当块组成的准对角矩阵。" },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §8", items: ["若尔当块与若尔当形矩阵", "复矩阵相似于若尔当形"] },
  interactive: false,
  lesson3d: {
    blocks: [
      {
        title: "若尔当块就是一条链",
        tex: String.raw`J(\lambda,k)=\begin{pmatrix}\lambda&&&\\1&\lambda&&\\&\ddots&\ddots&\\&&1&\lambda\end{pmatrix},\qquad (\sigma-\lambda E)\varepsilon_1=\varepsilon_2,\ \dots,\ (\sigma-\lambda E)\varepsilon_k=0`,
        figure: "jordan-chain",
        text: `第 ${texInline("j")} 列表示 ${texInline(String.raw`\sigma\varepsilon_j=\lambda\varepsilon_j+\varepsilon_{j+1}`)}。链尾 ${texInline(String.raw`\varepsilon_k`)} 满足 ${texInline(String.raw`\sigma\varepsilon_k=\lambda\varepsilon_k`)}，是真正的特征向量；前面的向量要多作用几次 ${texInline(String.raw`\sigma-\lambda E`)} 才变成 ${texInline("0")}。图中两条链给出 ${texInline(String.raw`J(\lambda,3)\oplus J(\lambda,1)`)}：两个块，恰有两个线性无关的特征向量 ${texInline(String.raw`\varepsilon_3`)}、${texInline(String.raw`\varepsilon_4`)}。${texInline("k=1")} 时 ${texInline(String.raw`J(\lambda,1)=(\lambda)`)}，全由 1 阶块组成的若尔当形就是对角矩阵。`,
      },
      {
        title: "存在与唯一",
        tex: String.raw`A\sim J=\begin{pmatrix}J(\lambda_1,k_1)&&\\&\ddots&\\&&J(\lambda_s,k_s)\end{pmatrix}`,
        text: `复数域上每个 ${texInline("n")} 阶矩阵都相似于一个若尔当形矩阵；除去若尔当块的排列次序，这个若尔当形由 ${texInline("A")} 唯一决定。说成线性变换：复线性空间上的 ${texInline(String.raw`\sigma`)} 在某组基下的矩阵是若尔当形。`,
      },
      {
        title: "用秩读出块的结构",
        tex: String.raw`\#\{\lambda\ \text{的块}\}=n-\operatorname{rank}(A-\lambda E),\qquad \#\{\lambda\ \text{的块中阶数}\ge k\ \text{的}\}=\operatorname{rank}(A-\lambda E)^{k-1}-\operatorname{rank}(A-\lambda E)^{k}`,
        text: `每个块恰好贡献一个特征向量（链尾），所以块数等于特征子空间的维数；所有属于 ${texInline(String.raw`\lambda`)} 的块的阶数之和等于 ${texInline(String.raw`\lambda`)} 的重数。${texInline(String.raw`\lambda`)} 的重数 ${texInline(String.raw`\le3`)} 时这两条信息已够定出属于 ${texInline(String.raw`\lambda`)} 的若尔当块，更高阶时要用第二个公式。`,
      },
    ],
    pitfalls: [
      `以为特征多项式加上特征子空间的维数总能确定若尔当形。4 阶时 ${texInline("2+2")} 与 ${texInline("3+1")} 两种块结构的这两项数据完全相同。`,
      `把链上的箭头当成 ${texInline(String.raw`\sigma`)} 的作用。推动链的是 ${texInline(String.raw`\sigma-\lambda E`)}，${texInline(String.raw`\sigma`)} 本身把 ${texInline(String.raw`\varepsilon_j`)} 送到 ${texInline(String.raw`\lambda\varepsilon_j+\varepsilon_{j+1}`)}。`,
      "在实数域上套用若尔当形。存在性要求特征多项式分解成一次因式，旋转 90° 在实数域上就没有若尔当形。",
    ],
  },
  example: {
    title: "例题：由秩确定若尔当形",
    question: `求 ${texInline(String.raw`A=\begin{pmatrix}1&1&0\\-1&3&0\\0&0&2\end{pmatrix}`)} 的若尔当形，并找出对应的链。`,
    choices: [
      { correct: true, text: texInline(String.raw`J=\begin{pmatrix}2&0&0\\1&2&0\\0&0&2\end{pmatrix}`) + "，一个 2 阶块和一个 1 阶块。" },
      { text: texInline(String.raw`J=\begin{pmatrix}2&0&0\\1&2&0\\0&1&2\end{pmatrix}`) + "，一个 3 阶块。" },
      { text: texInline(String.raw`J=2E`) + "，因为特征值只有 2。" },
      { text: texInline(String.raw`J=\operatorname{diag}(1,3,2)`) + "，读对角元即可。" },
    ],
    steps: [
      `${texInline(String.raw`|\lambda E-A|=(\lambda-2)\big[(\lambda-1)(\lambda-3)+1\big]=(\lambda-2)^3`)}，特征值只有 2，重数 3。`,
      `${texInline(String.raw`A-2E=\begin{pmatrix}-1&1&0\\-1&1&0\\0&0&0\end{pmatrix}`)}，秩为 ${texInline("1")}，所以 ${texInline(String.raw`\dim V_2=3-1=2`)}：有 2 个块，阶数之和为 ${texInline("3")}，只能是 ${texInline("2+1")}。`,
      `链：取 ${texInline(String.raw`\eta_1=(1,0,0)^T`)}，${texInline(String.raw`\eta_2=(A-2E)\eta_1=(-1,-1,0)^T`)}，${texInline(String.raw`(A-2E)\eta_2=0`)}；另取特征向量 ${texInline(String.raw`\eta_3=(0,0,1)^T`)}，它单独组成一条长为 1 的链。`,
      `验证：${texInline(String.raw`A\eta_1=(1,-1,0)^T=2\eta_1+\eta_2`)}，${texInline(String.raw`A\eta_2=2\eta_2`)}，${texInline(String.raw`A\eta_3=2\eta_3`)}。以 ${texInline(String.raw`X=(\eta_1,\eta_2,\eta_3)`)} 为过渡矩阵，${texInline(String.raw`X^{-1}AX=J`)}。`,
    ],
  },
  quiz: [
    {
      question: `两个 4 阶矩阵的特征多项式都是 ${texInline(String.raw`(\lambda-2)^4`)}，特征子空间 ${texInline("V_2")} 都是 2 维的。它们一定相似吗？`,
      answer: `不一定。两个块的阶数可以是 ${texInline("2+2")}，也可以是 ${texInline("3+1")}。用 ${texInline(String.raw`\operatorname{rank}(A-2E)^2`)} 区分：${texInline("2+2")} 时为 ${texInline("0")}，${texInline("3+1")} 时为 ${texInline("1")}。`,
    },
    {
      question: `若 ${texInline("A^2=O")}，${texInline("A")} 的若尔当块最大是几阶？`,
      answer: `特征值只能是 ${texInline("0")}，${texInline(String.raw`J(0,k)^{k-1}\ne O`)} 而 ${texInline("J(0,k)^k=O")}，所以 ${texInline(String.raw`k\le2`)}，每个块是 1 阶或 2 阶。`,
    },
    {
      question: "若尔当形什么时候是对角矩阵？这和 §5 的可对角化条件是什么关系？",
      answer: `每个块都是 1 阶，即每个 ${texInline(String.raw`\lambda`)} 的块数（特征子空间的维数）等于 ${texInline(String.raw`\lambda`)} 的重数。这正是 ${texInline("n")} 个线性无关的特征向量存在的条件。`,
    },
    {
      question: `§3 的求导 ${texInline("D")} 作用在 ${texInline(String.raw`P[x]_4`)} 上，它的若尔当形是什么？用哪组基？`,
      answer: `${texInline("D")} 的特征值只有 ${texInline("0")}，核是一维的，所以只有一个块 ${texInline("J(0,4)")}。基取 ${texInline(String.raw`\tfrac{x^3}{6},\tfrac{x^2}{2},x,1`)}：${texInline("D")} 把每个依次送到下一个，最后 ${texInline("D1=0")}。`,
    },
  ],
  summary: [
    `若尔当块 ${texInline(String.raw`J(\lambda,k)`)} 是一条链：${texInline(String.raw`\sigma-\lambda E`)} 把基向量依次推到下一个，链尾是特征向量。`,
    "复数域上每个矩阵都相似于若尔当形，除块的次序外唯一。",
    `${texInline(String.raw`\lambda`)} 的块数 ${texInline(String.raw`=\dim V_\lambda`)}，各块阶数之和 ${texInline(String.raw`=\lambda`)} 的重数；更细的结构由 ${texInline(String.raw`(A-\lambda E)^k`)} 的秩决定。`,
  ],
});


;/* content/ch7-section9.js */
defineChapter7Section("minimal-polynomial", {
  number: "§9",
  textbookSection: "最小多项式",
  title: "最小多项式",
  navTitle: "最小多项式",
  question: `使 ${texInline("A")} 变成零矩阵、次数最低的多项式是什么？它怎样判断 ${texInline("A")} 能否对角化？`,
  goal: `理解最小多项式的定义与整除性质，会用 ${texInline(String.raw`E,A,A^2,\dots`)} 第一次线性相关的位置求最小多项式，掌握“最小多项式是互素一次因式之积”的对角化判据。`,
  tags: ["最小多项式", "零化多项式", "对角化判据"],
  intro:
    `由哈密顿–凯莱定理，特征多项式 ${texInline("f")} 满足 ${texInline("f(A)=O")}，但它的次数未必最低。次数最低的首一零化多项式称为最小多项式 ${texInline(String.raw`m(\lambda)`)}。它恰好是互素的一次因式之积时，${texInline("A")} 能对角化。`,
  concepts: [
    { label: "最小多项式", text: `首项系数为 1、使 ${texInline("m(A)=O")} 且次数最低的多项式 ${texInline(String.raw`m(\lambda)`)}。` },
    { label: "整除", text: `${texInline(String.raw`g(A)=O\iff m(\lambda)\mid g(\lambda)`)}，特别地 ${texInline(String.raw`m\mid f`)}。` },
  ],
  textbook: { reference: "北大版《高等代数》第七章 §9", items: ["最小多项式的定义与唯一性", "最小多项式整除零化多项式", "可对角化的最小多项式判据"] },
  interactive: { type: "slot", title: "v, Av, A²v, … 第几步落回" },
  lesson3d: {
    blocks: [
      {
        title: "定义与整除性",
        tex: String.raw`g(A)=O\iff m(\lambda)\mid g(\lambda),\qquad m(\lambda)\mid f(\lambda)=|\lambda E-A|`,
        text: `用 ${texInline("m")} 去除 ${texInline("g")}，余式 ${texInline("r")} 的次数低于 ${texInline("m")} 且 ${texInline("r(A)=O")}，只能 ${texInline("r=0")}；由此最小多项式唯一。${texInline("m")} 与 ${texInline("f")} 的根相同，都是 ${texInline("A")} 的全部特征值，只是重数可能变小。相似矩阵的最小多项式相同。`,
      },
      {
        title: "怎样求：看第一次线性相关",
        tex: String.raw`A^k=c_0E+c_1A+\cdots+c_{k-1}A^{k-1}\ \Longrightarrow\ m(\lambda)=\lambda^k-c_{k-1}\lambda^{k-1}-\cdots-c_0`,
        text: `依次检查 ${texInline(String.raw`E,A,A^2,\dots`)}，第一个能由前面线性表出的 ${texInline("A^k")} 给出 ${texInline("m")}。对单个向量 ${texInline("v")} 做同样的事，${texInline(String.raw`v,Av,A^2v,\dots`)} 第一次线性相关得到 ${texInline("m_v")}，它整除 ${texInline("m")}；${texInline("m")} 是各基向量 ${texInline(String.raw`\varepsilon_i`)} 的最小多项式的最小公倍式。准对角矩阵 ${texInline(String.raw`\operatorname{diag}(A_1,A_2)`)} 的最小多项式是 ${texInline("m_1")} 与 ${texInline("m_2")} 的最小公倍式，若尔当块 ${texInline("J(a,k)")} 的最小多项式是 ${texInline(String.raw`(\lambda-a)^k`)}。`,
      },
      {
        title: "对角化判据",
        tex: String.raw`A\ \text{在}\ P\ \text{上可对角化}\iff m(\lambda)=(\lambda-\lambda_1)\cdots(\lambda-\lambda_s),\ \ \lambda_1,\dots,\lambda_s\in P\ \text{互不相同}`,
        text: `复数域上就是 ${texInline("m")} 没有重根。可对角化时 ${texInline(String.raw`\operatorname{diag}(\lambda_1,\dots,\lambda_n)`)} 的最小多项式显然是互异一次因式之积；反过来，若 ${texInline("m")} 是这样的乘积，${texInline("V")} 分解成各 ${texInline(String.raw`\ker(\sigma-\lambda_iE)`)} 的直和，每一块都由特征向量组成。`,
      },
    ],
    pitfalls: [
      `以为最小多项式总等于特征多项式。单位矩阵 ${texInline("E")} 的特征多项式是 ${texInline(String.raw`(\lambda-1)^n`)}，最小多项式是 ${texInline(String.raw`\lambda-1`)}。`,
      `某一个向量 ${texInline("v")} 满足 ${texInline("p(A)v=0")}，就断定 ${texInline("p(A)=O")}。${texInline("p(A)")} 要把每个基向量都送到 ${texInline("0")}，所以 ${texInline("m")} 是各 ${texInline("m_v")} 的最小公倍式。`,
      `以为最小多项式相同的矩阵一定相似。${texInline(String.raw`\operatorname{diag}(J(2,2),J(2,2))`)} 与 ${texInline(String.raw`\operatorname{diag}(J(2,2),2,2)`)} 的最小多项式都是 ${texInline(String.raw`(\lambda-2)^2`)}，若尔当形却不同。`,
    ],
  },
  example: {
    title: "例题：最小多项式与对角化",
    question: `求 ${texInline(String.raw`A=\begin{pmatrix}1&1&0\\-1&3&0\\0&0&2\end{pmatrix}`)} 的最小多项式，并判断 ${texInline("A")} 能否对角化。`,
    choices: [
      { correct: true, text: `${texInline(String.raw`m(\lambda)=(\lambda-2)^2`)}，${texInline("A")} 不能对角化。` },
      { text: `${texInline(String.raw`m(\lambda)=(\lambda-2)^3`)}，与特征多项式相同，${texInline("A")} 不能对角化。` },
      { text: `${texInline(String.raw`m(\lambda)=\lambda-2`)}，${texInline("A")} 能对角化。` },
      { text: `${texInline(String.raw`m(\lambda)=(\lambda-2)^2`)}，${texInline("A")} 能对角化，因为特征值只有一个。` },
    ],
    steps: [
      `§8 已求得 ${texInline(String.raw`f(\lambda)=(\lambda-2)^3`)}，所以 ${texInline("m")} 是 ${texInline(String.raw`\lambda-2,\ (\lambda-2)^2,\ (\lambda-2)^3`)} 之一。`,
      `${texInline(String.raw`A-2E=\begin{pmatrix}-1&1&0\\-1&1&0\\0&0&0\end{pmatrix}\ne O`)}，而 ${texInline(String.raw`(A-2E)^2=O`)}，所以 ${texInline(String.raw`m(\lambda)=(\lambda-2)^2`)}，次数比 ${texInline("f")} 低。`,
      `${texInline("m")} 有重因式 ${texInline(String.raw`(\lambda-2)^2`)}，按判据 ${texInline("A")} 不能对角化。`,
      `与 §8 对照：${texInline("m")} 中 ${texInline(String.raw`\lambda-2`)} 的次数 ${texInline("2")} 正是最大若尔当块的阶数，若尔当形是 ${texInline(String.raw`J(2,2)\oplus J(2,1)`)}。`,
    ],
  },
  quiz: [
    {
      question: `若 ${texInline("A^2=A")}，${texInline("A")} 一定可以对角化吗？`,
      answer: `一定。${texInline(String.raw`\lambda^2-\lambda=\lambda(\lambda-1)`)} 零化 ${texInline("A")}，所以 ${texInline("m")} 整除 ${texInline(String.raw`\lambda(\lambda-1)`)}，只能是 ${texInline(String.raw`\lambda`)}、${texInline(String.raw`\lambda-1`)} 或 ${texInline(String.raw`\lambda(\lambda-1)`)}，都是互素一次因式之积。`,
    },
    {
      question: `在实数域上，满足 ${texInline("A^2=-E")} 的矩阵能对角化吗？`,
      answer: `不能。${texInline("m")} 整除 ${texInline(String.raw`\lambda^2+1`)}，而 ${texInline("m")} 不能是一次的（${texInline("A=aE")} 时 ${texInline("a^2=-1")} 无实根），所以 ${texInline(String.raw`m=\lambda^2+1`)}，它在实数域上不能分解成一次因式。`,
    },
    {
      question: `${texInline(String.raw`\sigma`)} 在某组基下的矩阵是准对角矩阵 ${texInline(String.raw`\operatorname{diag}(A_1,A_2)`)}，${texInline(String.raw`\sigma`)} 的最小多项式与 ${texInline("A_1")}、${texInline("A_2")} 的最小多项式 ${texInline("m_1")}、${texInline("m_2")} 是什么关系？`,
      answer: `是 ${texInline("m_1")} 与 ${texInline("m_2")} 的最小公倍式：${texInline(String.raw`g(\operatorname{diag}(A_1,A_2))=\operatorname{diag}(g(A_1),g(A_2))`)}，它为 ${texInline("O")} 当且仅当 ${texInline("m_1")} 与 ${texInline("m_2")} 都整除 ${texInline("g")}。`,
    },
  ],
  summary: [
    `最小多项式 ${texInline("m")} 是次数最低的首一零化多项式，整除每个零化多项式，也整除特征多项式。`,
    `${texInline(String.raw`E,A,A^2,\dots`)} 第一次线性相关给出 ${texInline("m")}；单个向量的 ${texInline("m_v")} 整除 ${texInline("m")}。`,
    `${texInline("A")} 可对角化 ${texInline(String.raw`\iff`)} ${texInline("m")} 是数域上互素一次因式之积。`,
  ],
});


;/* content/ch7.js */
registerAlgebraChapter({
  id: "ch7",
  icon: "7",
  title: "第七章 线性变换",
  subtitle: "矩阵背后的变换",
  summary:
    "线性变换是线性空间到自身、保持线性组合的映射。取定一组基，它就记成一个矩阵；换一组基，矩阵换成相似的矩阵。本章寻找让矩阵最简单的基：特征向量给出对角形，不变子空间给出准对角形，特征向量不够时用若尔当形，最小多项式判断能否对角化。",
  sections: [
    { id: "linear-map-definition", number: "§1", title: "线性变换的定义", navTitle: "线性变换的定义" },
    { id: "linear-map-operations", number: "§2", title: "线性变换的运算", navTitle: "线性变换的运算" },
    { id: "matrix-of-linear-map", number: "§3", title: "线性变换的矩阵", navTitle: "线性变换的矩阵" },
    { id: "eigenvalues-eigenvectors", number: "§4", title: "特征值与特征向量", navTitle: "特征值与特征向量" },
    { id: "diagonal-matrices", number: "§5", title: "对角矩阵", navTitle: "对角矩阵" },
    { id: "image-and-kernel", number: "§6", title: "线性变换的值域与核", navTitle: "值域与核" },
    { id: "invariant-subspaces", number: "§7", title: "不变子空间", navTitle: "不变子空间" },
    { id: "jordan-form-introduction", number: "§8", title: "若尔当标准形简介", navTitle: "若尔当标准形" },
    { id: "minimal-polynomial", number: "§9", title: "最小多项式", navTitle: "最小多项式" },
  ],
});


;/* content/ch7-assemble.js */
/* Apply Chapter 7 section patches after ch7.js registration. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch7");
  const patches = window.getChapter7SectionPatches?.();
  if (!chapter || !patches) return;

  chapter.sections = chapter.sections.map((stub) => {
    const patch = patches.get(stub.id);
    if (!patch) {
      console.warn("Missing Chapter 7 section patch:", stub.id);
      return stub;
    }
    return { ...stub, ...patch, id: stub.id };
  });
})();


;/* visuals/ch7/kit.js */
/*
 * Chapter 7 lab kit.
 *
 * Shared pieces for the linear-transformation labs: the lab shell, chips, a
 * prediction gate that only reveals the conclusion after the student has
 * predicted *and* acted, a small 2D canvas plane (grids, oblique grids,
 * arrows, draggable handles) that matches the shared 3D scene's look, exact
 * rational matrix helpers built on Ch3Math, and the theorem-block renderer.
 */
(() => {
  const M = () => window.Ch3Math;
  const tex = (s) => (window.texInline ? window.texInline(s) : s);
  const texD = (s) => (window.texDisplay ? window.texDisplay(s) : s);
  const F = (x) => M().parseF(x);
  const num = (x) => M().toNumber(x);
  const lf = (x) => M().latexF(x);

  /* ---------- exact linear algebra (rationals) ---------- */

  const mat = (rows) => rows.map((r) => r.map(F));
  const vec = (v) => v.map(F);
  const zero = () => F(0);
  const one = () => F(1);

  function mul(A, B) {
    return A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => M().add(s, M().mul(a, B[k][j])), zero())));
  }

  function identity(n) {
    return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => F(i === j ? 1 : 0)));
  }

  function sub(A, B) {
    return A.map((r, i) => r.map((x, j) => M().sub(x, B[i][j])));
  }

  function scaleMat(A, k) {
    return A.map((r) => r.map((x) => M().mul(x, F(k))));
  }

  function inv(A) {
    const n = A.length;
    const aug = A.map((r, i) => [...r.map(F), ...identity(n)[i]]);
    const { matrix, pivots } = M().rref(aug, n);
    if (pivots.length < n) return null;
    return matrix.map((r) => r.slice(n));
  }

  function transpose(A) {
    return A[0].map((_, j) => A.map((r) => r[j]));
  }

  const det = (A) => M().determinant(A);
  const rank = (A) => (A.length && A[0].length ? M().rankOf(A) : 0);
  const matVec = (A, v) => M().matVec(A, v);
  const isZeroVec = (v) => v.every((x) => M().isZero(x));
  const eqMat = (A, B) => A.every((r, i) => r.every((x, j) => M().eq(x, B[i][j])));
  const isDiagonal = (A) => A.every((r, i) => r.every((x, j) => i === j || M().isZero(x)));

  function dotF(u, v) {
    return u.reduce((s, x, i) => M().add(s, M().mul(x, v[i])), zero());
  }

  function cross3(a, b) {
    const m = M();
    return [
      m.sub(m.mul(a[1], b[2]), m.mul(a[2], b[1])),
      m.sub(m.mul(a[2], b[0]), m.mul(a[0], b[2])),
      m.sub(m.mul(a[0], b[1]), m.mul(a[1], b[0])),
    ];
  }

  /* Rank of a list of vectors (as columns). */
  function rankOfVectors(vectors) {
    if (!vectors.length) return 0;
    return rank(vectors[0].map((_, i) => vectors.map((v) => v[i])));
  }

  /* Coefficients c with target = sum c_i vectors_i, or null if target is outside the span. */
  function coordinatesIn(vectors, target) {
    const n = target.length;
    const aug = Array.from({ length: n }, (_, i) => [...vectors.map((v) => v[i]), target[i]]);
    const sol = M().particularSolution(aug);
    return sol.ok ? sol.x : null;
  }

  /* Basis of the null space of a matrix with rational entries. */
  const nullspace = (A) => M().nullspaceBasis(A).basis;

  function latexMatrix(A) {
    return M().latexMatrix(A);
  }

  function latexVec(v) {
    return `(${v.map(lf).join(",")})^{T}`;
  }

  function latexRow(v) {
    return `(${v.map(lf).join(",")})`;
  }

  /* ---------- polynomials with rational coefficients, low degree first ---------- */

  function polyLatex(coeffs, x = "\\lambda") {
    const terms = [];
    for (let k = coeffs.length - 1; k >= 0; k -= 1) {
      const c = coeffs[k];
      if (M().isZero(c)) continue;
      const neg = c.n < 0;
      const abs = M().absF(c);
      const isOne = abs.n === 1 && abs.d === 1;
      const mono = k === 0 ? "" : k === 1 ? x : `${x}^{${k}}`;
      const body = k === 0 ? lf(abs) : isOne ? mono : `${lf(abs)}${mono}`;
      terms.push({ neg, body });
    }
    if (!terms.length) return "0";
    return terms.map((t, i) => (i === 0 ? (t.neg ? "-" : "") + t.body : (t.neg ? "-" : "+") + t.body)).join("");
  }

  function polyEval(coeffs, r) {
    return coeffs.reduceRight((s, c) => M().add(M().mul(s, r), c), zero());
  }

  function polyDivLinear(coeffs, r) {
    // divide by (x - r); returns quotient (low degree first)
    const n = coeffs.length - 1;
    const q = new Array(n);
    let carry = zero();
    for (let k = n; k >= 1; k -= 1) {
      carry = M().add(coeffs[k], M().mul(carry, r));
      q[k - 1] = carry;
    }
    return q;
  }

  /* Factor a monic polynomial with integer roots where possible: "(\lambda-2)^2(\lambda-1)". */
  function polyFactorLatex(coeffs, x = "\\lambda") {
    let rest = coeffs.slice();
    const roots = [];
    const candidates = [];
    for (let r = -12; r <= 12; r += 1) candidates.push(F(r));
    let progress = true;
    while (rest.length > 1 && progress) {
      progress = false;
      for (const r of candidates) {
        if (rest.length > 1 && M().isZero(polyEval(rest, r))) {
          roots.push(r);
          rest = polyDivLinear(rest, r);
          progress = true;
          break;
        }
      }
    }
    const counts = new Map();
    roots.forEach((r) => counts.set(lf(r), { r, k: (counts.get(lf(r))?.k || 0) + 1 }));
    const parts = [...counts.values()]
      .sort((a, b) => num(a.r) - num(b.r))
      .map(({ r, k }) => {
        const base = M().isZero(r) ? x : `(${x}${r.n < 0 ? "+" : "-"}${lf(M().absF(r))})`;
        return k > 1 ? `${base}^{${k}}` : base;
      });
    if (rest.length > 1) parts.push(`(${polyLatex(rest, x)})`);
    return parts.join("") || polyLatex(coeffs, x);
  }

  /*
   * Minimal polynomial of a square matrix: first k with A^k in span(I, ..., A^{k-1}).
   * Returns monic coefficients, low degree first.
   */
  function minimalPolynomial(A) {
    const n = A.length;
    const powers = [identity(n)];
    for (let k = 1; k <= n; k += 1) {
      powers.push(mul(powers[k - 1], A));
      const flat = powers.slice(0, k).map((P) => P.flat());
      const c = coordinatesIn(flat, powers[k].flat());
      if (c) return [...c.map(M().neg), one()];
    }
    return null;
  }

  /* Characteristic polynomial |lambda E - A| for n <= 3, monic, low degree first. */
  function charPolynomial(A) {
    const n = A.length;
    const m = M();
    if (n === 2) {
      const tr = m.add(A[0][0], A[1][1]);
      return [det(A), m.neg(tr), one()];
    }
    if (n === 3) {
      const tr = m.add(m.add(A[0][0], A[1][1]), A[2][2]);
      const minor = (i, j) => m.sub(m.mul(A[i][i], A[j][j]), m.mul(A[i][j], A[j][i]));
      const c1 = m.add(m.add(minor(0, 1), minor(0, 2)), minor(1, 2));
      return [m.neg(det(A)), c1, m.neg(tr), one()];
    }
    throw new RangeError("charPolynomial supports n = 2, 3");
  }

  /*
   * Highlight part of a formula in a lab readout: same colour role + soft glow.
   * KaTeX (trust off) only accepts literal colours, so hlTex marks the box with
   * sentinel colours and hlHtml swaps them for theme variables after rendering.
   */
  const HL_BOX = "#0a0b0c";
  const HL_INK = "#0a0b0d";
  const hlTex = (x) => `\\colorbox{${HL_BOX}}{$\\textcolor{${HL_INK}}{${x}}$}`;
  function hlHtml(html, role = "subspace") {
    const v = `var(--cv-${role})`;
    return String(html)
      .split(`background-color:${HL_BOX}`)
      .join(`background-color:color-mix(in srgb, ${v} 18%, transparent);box-shadow:0 0 0 3px color-mix(in srgb, ${v} 14%, transparent);border-radius:3px`)
      .split(`color:${HL_INK}`)
      .join(`color:${v};font-weight:700`);
  }

  /* ---------- DOM helpers ---------- */

  function el(tag, cls, html) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function chips(host, items, onPick, activeKey) {
    host.innerHTML = items
      .map(([key, label]) => `<button type="button" class="ch7l-chip${key === activeKey ? " is-active" : ""}" data-key="${key}">${label}</button>`)
      .join("");
    host.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => {
        host.querySelectorAll("button").forEach((x) => x.classList.toggle("is-active", x === b));
        onPick(b.dataset.key);
      }),
    );
  }

  function labShell(root, { title, task }) {
    root.innerHTML = `<h2>交互实验</h2>`;
    const lab = el("section", "ch7l-lab");
    lab.innerHTML = `<header class="ch7l-head"><h3>${title}</h3><p>${task}</p></header>`;
    root.append(lab);
    return lab;
  }

  /*
   * Predict -> act -> reveal.
   * The gate records the prediction; the conclusion opens only after the student
   * has predicted and then acted on the picture at least once.
   * Labs rebuild the gate when the student switches preset. The guess is kept per
   * question (by option text) for the life of the gate host, so switching away and
   * back never drops it; a question that was already revealed stays revealed.
   */
  const guessMemory = new WeakMap();

  function predictFlow(gateHost, resultBox, spec) {
    spec = { ...spec, options: window.LAStableShuffle ? window.LAStableShuffle(spec.options, spec.question) : spec.options };
    gateHost.innerHTML = "";
    resultBox.hidden = true;
    resultBox.innerHTML = "";
    const box = el("div", "ch7l-predict");
    box.innerHTML = `<div class="ch7l-predict-q"><span>先猜一猜</span><p>${spec.question}</p></div>
      <div class="ch7l-predict-options">${spec.options.map((o, i) => `<button type="button" data-i="${i}" data-ok="${o.correct ? "true" : "false"}" data-why="${String(o.why || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">${o.text}</button>`).join("")}</div>
      <p class="ch7l-predict-feedback" hidden></p>`;
    gateHost.append(box);
    const feedback = box.querySelector(".ch7l-predict-feedback");
    const state = { choice: null, acted: false, revealed: false };
    if (!guessMemory.has(gateHost)) guessMemory.set(gateHost, new Map());
    const memory = guessMemory.get(gateHost);

    function reveal(deferHook = false) {
      if (state.revealed || state.choice == null || !state.acted) return;
      state.revealed = true;
      const saved = memory.get(spec.question);
      if (saved) saved.revealed = true;
      const o = spec.options[state.choice];
      const verdict = o.correct
        ? `<span class="ch7l-ok">猜对了。</span>`
        : `<span class="ch7l-bad">再看看图。</span>${o.why ? ` ${o.why}` : ""}`;
      resultBox.innerHTML = `<strong>结论</strong><p>${verdict}</p><p>${spec.conclusion}</p>`;
      resultBox.hidden = false;
      // the “act now” hint has done its job: the box now shows the verdict instead
      feedback.innerHTML = o.correct ? `<span class="ch7l-ok">✓ 猜对了，结论见下方。</span>` : `<span class="ch7l-bad">× 再看看图，结论见下方。</span>`;
      box.classList.add("is-done");
      // a restored reveal runs while the lab is still assigning the new flow: call back afterwards
      if (deferHook) queueMicrotask(() => spec.onReveal?.());
      else spec.onReveal?.();
    }

    function pick(i, unsure = false) {
      state.choice = i;
      box.querySelectorAll("[data-i]").forEach((x) => x.classList.toggle("is-picked", !unsure && Number(x.dataset.i) === i));
      feedback.hidden = false;
      feedback.textContent = unsure ? "好，先不猜。动手操作一次，答案随后出现。" : spec.actHint || "记下了你的猜测。现在动手操作，结论随后出现。";
    }

    box.querySelectorAll("[data-i]").forEach((b) =>
      b.addEventListener("click", (event) => {
        if (state.revealed) return;
        pick(Number(b.dataset.i));
        // “不确定，直接看” (predict-ux.js) registers the right option with a synthetic click
        const unsure = !event.isTrusted && box.dataset.unsure === "1";
        memory.set(spec.question, { text: spec.options[state.choice].text, unsure, revealed: false });
        reveal();
      }),
    );

    const saved = memory.get(spec.question);
    const savedIndex = saved ? spec.options.findIndex((o) => o.text === saved.text) : -1;
    if (savedIndex >= 0) {
      pick(savedIndex, saved.unsure);
      if (saved.unsure) {
        box.dataset.unsure = "1";
        // predict-ux.js adds its “不确定” button on the next frame; mark it as the pick
        requestAnimationFrame(() => requestAnimationFrame(() => box.querySelector(".la-unsure")?.classList.add("is-picked")));
      }
      if (saved.revealed) {
        state.acted = true;
        reveal(true);
      }
    }

    return {
      acted() {
        if (state.choice == null) return;
        state.acted = true;
        reveal();
      },
      get revealed() {
        return state.revealed;
      },
      get predicted() {
        return state.choice != null;
      },
      element: box,
    };
  }

  /* ---------- 2D canvas plane ---------- */

  function cssColor(style, name, fallback) {
    const value = style.getPropertyValue(name).trim();
    return value || fallback;
  }

  function palette(host) {
    const style = getComputedStyle(host);
    const dark = document.body.classList.contains("dark");
    return {
      dark,
      text: cssColor(style, "--text", "#18212c"),
      muted: cssColor(style, "--muted", "#66717f"),
      faint: cssColor(style, "--faint", "#8b96a5"),
      line: cssColor(style, "--line-strong", "rgba(28,43,61,.2)"),
      accent: cssColor(style, "--accent", "#0f8f88"),
      coral: cssColor(style, "--coral", "#d46b4f"),
      blue: cssColor(style, "--blue", "#335eea"),
      gold: cssColor(style, "--gold", "#b78a1b"),
      violet: cssColor(style, "--violet", "#7258ca"),
      // colour roles (tokens.css): labs should prefer these to hue names
      v1: cssColor(style, "--cv-v1", "#2a64a8"),
      v2: cssColor(style, "--cv-v2", "#c4552f"),
      drag: cssColor(style, "--cv-drag", "#a87a12"),
      image: cssColor(style, "--cv-image", "#8c4f86"),
      subspace: cssColor(style, "--cv-subspace", "#2c5e4a"),
      axis: cssColor(style, "--cv-axis", "#8a8d84"),
      gridMajor: cssColor(style, "--cv-grid-major", "#e2ddd0"),
      grid: cssColor(style, "--cv-grid", "#f0ece2"),
    };
  }

  function withAlpha(color, alpha) {
    if (color.startsWith("#")) {
      const hex = color.length === 4 ? color.replace(/#(.)(.)(.)/, "#$1$1$2$2$3$3") : color;
      const n = parseInt(hex.slice(1, 7), 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
    }
    const m = color.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const [r, g, b] = m[1].split(",").map((x) => parseFloat(x));
      return `rgba(${r},${g},${b},${alpha})`;
    }
    return color;
  }

  /*
   * plane2d(host, { extent, label, hint, spreadLabels })
   *   spreadLabels   opt-in: labels are placed after the drawing, off other labels,
   *                  drag handles and arrow shafts, and inside the canvas
   *   setDraw(fn)    fn(d) is called on every render with a drawing API d
   *   setHandles([{ get, set, snap, color, hidden }])
   *   on("change", fn) / on("end", fn)
   */
  function plane2d(host, options = {}) {
    let extent = options.extent || 3;
    let drawFn = () => {};
    let handles = [];
    let hover = null;
    let drag = null;
    let destroyed = false;
    const listeners = { change: [], end: [] };

    const wrap = el("div", "ch7p");
    const canvas = el("canvas", "ch7p-canvas");
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", options.label || "平面上的向量图");
    wrap.append(canvas);
    if (options.hint !== "") {
      const hint = el("div", "ch7p-hint");
      hint.textContent = options.hint || "拖动圆点";
      wrap.append(hint);
    }
    if (options.title) {
      const title = el("div", "ch7p-title", options.title);
      wrap.append(title);
    }
    host.append(wrap);
    const ctx = canvas.getContext("2d");
    let size = { w: 0, h: 0, dpr: 1 };
    let axisNameBoxes = [];
    // with spreadLabels: labels wait until the drawing is done, arrows leave their shafts
    let pendingLabels = [];
    let shafts = [];
    let arrowCount = 0;

    const scale = () => Math.min(size.w, size.h) / (2 * extent);
    const P = ([x, y]) => [size.w / 2 + x * scale(), size.h / 2 - y * scale()];
    const W = ([px, py]) => [(px - size.w / 2) / scale(), (size.h / 2 - py) / scale()];
    const halfW = () => size.w / 2 / scale();
    const halfH = () => size.h / 2 / scale();

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (w === size.w && h === size.h && dpr === size.dpr) return;
      size = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      render();
    }

    function api(pal) {
      const res = (c) => (c ? pal[c] || c : pal.accent);
      const d = {
        ctx,
        pal,
        P,
        W,
        scale: scale(),
        extent,
        halfW: halfW(),
        halfH: halfH(),
        color: res,
        alpha: withAlpha,
        grid(basis = [[1, 0], [0, 1]], opts = {}) {
          const [b1, b2] = basis;
          const detB = b1[0] * b2[1] - b1[1] * b2[0];
          if (Math.abs(detB) < 1e-9) return;
          const toCoord = ([x, y]) => [(x * b2[1] - y * b2[0]) / detB, (b1[0] * y - b1[1] * x) / detB];
          const hw = halfW();
          const hh = halfH();
          const corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(toCoord);
          const lo = [0, 1].map((i) => Math.floor(Math.min(...corners.map((c) => c[i]))));
          const hi = [0, 1].map((i) => Math.ceil(Math.max(...corners.map((c) => c[i]))));
          const step = opts.step || 1;
          ctx.save();
          ctx.strokeStyle = withAlpha(res(opts.color || "line"), opts.alpha ?? 1);
          ctx.lineWidth = opts.width || 1;
          let count = 0;
          for (let k = lo[0]; k <= hi[0] && count < 120; k += step, count += 1) {
            const a = P([k * b1[0] + lo[1] * b2[0], k * b1[1] + lo[1] * b2[1]]);
            const b = P([k * b1[0] + hi[1] * b2[0], k * b1[1] + hi[1] * b2[1]]);
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();
          }
          for (let k = lo[1]; k <= hi[1] && count < 240; k += step, count += 1) {
            const a = P([lo[0] * b1[0] + k * b2[0], lo[0] * b1[1] + k * b2[1]]);
            const b = P([hi[0] * b1[0] + k * b2[0], hi[0] * b1[1] + k * b2[1]]);
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();
          }
          ctx.restore();
        },
        axes(names = ["x₁", "x₂"]) {
          ctx.save();
          ctx.strokeStyle = withAlpha(pal.muted, 0.6);
          ctx.lineWidth = 1.1;
          const [l, r] = [P([-halfW(), 0]), P([halfW(), 0])];
          const [b, t] = [P([0, -halfH()]), P([0, halfH()])];
          ctx.beginPath();
          ctx.moveTo(l[0], l[1]);
          ctx.lineTo(r[0], r[1]);
          ctx.moveTo(b[0], b[1]);
          ctx.lineTo(t[0], t[1]);
          ctx.stroke();
          // light integer ticks (6px); numbers only on the positive half, up to 3
          ctx.strokeStyle = pal.axis || withAlpha(pal.muted, 0.6);
          ctx.fillStyle = pal.faint;
          ctx.font = "11px 'LA Serif Latin', 'LA Serif SC', serif";
          ctx.lineWidth = 1;
          const kx = Math.floor(halfW() - 0.15);
          const ky = Math.floor(halfH() - 0.15);
          ctx.beginPath();
          for (let k = -kx; k <= kx; k += 1) {
            if (!k) continue;
            const [x, y] = P([k, 0]);
            ctx.moveTo(x, y - 3);
            ctx.lineTo(x, y + 3);
          }
          for (let k = -ky; k <= ky; k += 1) {
            if (!k) continue;
            const [x, y] = P([0, k]);
            ctx.moveTo(x - 3, y);
            ctx.lineTo(x + 3, y);
          }
          ctx.stroke();
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          for (let k = 1; k <= Math.min(3, kx - 1); k += 1) {
            const [x, y] = P([k, 0]);
            ctx.fillText(String(k), x, y + 6);
          }
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          for (let k = 1; k <= Math.min(3, ky - 1); k += 1) {
            const [x, y] = P([0, k]);
            ctx.fillText(String(k), x - 6, y);
          }
          ctx.restore();
          if (names) {
            d.text([halfW() * 0.93, 0], names[0], "muted", { dy: -10, font: "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif", isAxisName: true });
            d.text([0, halfH() * 0.92], names[1], "muted", { dx: 8, font: "600 12px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif", isAxisName: true });
          }
        },
        line(p, dir, color, opts = {}) {
          const len = Math.hypot(dir[0], dir[1]);
          if (len < 1e-12) return;
          const u = [dir[0] / len, dir[1] / len];
          const R = Math.hypot(halfW(), halfH()) + Math.hypot(p[0], p[1]);
          d.segment([p[0] - u[0] * R, p[1] - u[1] * R], [p[0] + u[0] * R, p[1] + u[1] * R], color, opts);
        },
        segment(a, b, color, opts = {}) {
          const A = P(a);
          const B = P(b);
          ctx.save();
          ctx.globalAlpha = opts.alpha ?? 1;
          ctx.strokeStyle = res(color);
          ctx.lineWidth = opts.width || 1.6;
          ctx.lineCap = "round";
          if (opts.dash) ctx.setLineDash(opts.dash);
          ctx.beginPath();
          ctx.moveTo(A[0], A[1]);
          ctx.lineTo(B[0], B[1]);
          ctx.stroke();
          ctx.restore();
        },
        arrow(from, to, color, opts = {}) {
          const A = P(from);
          const B = P(to);
          const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
          if (len < 0.5) return;
          const c = res(color);
          const ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
          const head = Math.min(13, len * 0.45);
          const end = [B[0] - Math.cos(ang) * head * 0.8, B[1] - Math.sin(ang) * head * 0.8];
          ctx.save();
          ctx.globalAlpha = opts.alpha ?? 1;
          ctx.strokeStyle = c;
          ctx.fillStyle = c;
          ctx.lineWidth = opts.width || 2.8;
          ctx.lineCap = "round";
          if (opts.dash) ctx.setLineDash(opts.dash);
          ctx.beginPath();
          ctx.moveTo(A[0], A[1]);
          ctx.lineTo(end[0], end[1]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(B[0], B[1]);
          ctx.lineTo(B[0] - Math.cos(ang - 0.42) * head, B[1] - Math.sin(ang - 0.42) * head);
          ctx.lineTo(B[0] - Math.cos(ang + 0.42) * head, B[1] - Math.sin(ang + 0.42) * head);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          arrowCount += 1;
          const owner = arrowCount;
          if (options.spreadLabels) shafts.push({ a: A, b: B, owner });
          if (opts.label) {
            const ux = Math.cos(ang);
            const uy = Math.sin(ang);
            d.text(to, opts.label, color, { dx: ux * 16 + (opts.ldx || 0), dy: uy * 16 + (opts.ldy || 0), font: "700 14px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif", align: "center", owner });
          }
        },
        point(p, color, opts = {}) {
          const [x, y] = P(p);
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, opts.r || 4.5, 0, Math.PI * 2);
          if (opts.hollow) {
            ctx.fillStyle = pal.dark ? "#161b27" : "#fff";
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = res(color);
            ctx.stroke();
          } else {
            ctx.globalAlpha = opts.alpha ?? 1;
            ctx.fillStyle = res(color);
            ctx.fill();
          }
          ctx.restore();
          if (opts.label) d.text(p, opts.label, color, { dx: 9, dy: -9 });
        },
        polyline(pts, color, opts = {}) {
          if (pts.length < 2) return;
          ctx.save();
          ctx.globalAlpha = opts.alpha ?? 1;
          ctx.strokeStyle = res(color);
          ctx.lineWidth = opts.width || 1.6;
          ctx.lineJoin = "round";
          if (opts.dash) ctx.setLineDash(opts.dash);
          ctx.beginPath();
          pts.forEach((p, i) => {
            const [x, y] = P(p);
            if (i) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
          });
          if (opts.close) ctx.closePath();
          if (opts.fill) {
            ctx.fillStyle = withAlpha(res(opts.fill), opts.fillAlpha ?? 0.12);
            ctx.fill();
          }
          ctx.stroke();
          ctx.restore();
        },
        polygon(pts, color, opts = {}) {
          d.polyline(pts, color, { ...opts, close: true, fill: opts.fill || color });
        },
        arc(radiusPx, a0, a1, color, opts = {}) {
          const [cx, cy] = P([0, 0]);
          ctx.save();
          ctx.strokeStyle = res(color);
          ctx.lineWidth = opts.width || 2;
          ctx.beginPath();
          ctx.arc(cx, cy, radiusPx, -a0, -a1, a1 > a0);
          ctx.stroke();
          ctx.restore();
        },
        text(p, str, color, opts = {}) {
          const [x, y] = P(p);
          ctx.save();
          ctx.font = opts.font || "600 13px 'LA Serif Latin', 'LA Serif SC', 'Songti SC', serif";
          ctx.textAlign = opts.align || "left";
          ctx.textBaseline = "middle";
          let tx = x + (opts.dx ?? 0) + (opts.px ?? 0);
          let ty = y + (opts.dy ?? 0) - (opts.py ?? 0);
          /* keep every label inside the canvas, and off the axis names */
          const tw = ctx.measureText(str).width;
          const left = () => (ctx.textAlign === "center" ? tx - tw / 2 : ctx.textAlign === "right" ? tx - tw : tx);
          if (left() < 4) tx += 4 - left();
          if (left() + tw > size.w - 4) tx -= left() + tw - (size.w - 4);
          ty = Math.max(10, Math.min(size.h - 10, ty));
          if (options.spreadLabels && !opts.isAxisName) {
            pendingLabels.push({ str, x: left(), y: ty, w: tw, font: ctx.font, color: res(color), owner: opts.owner });
            ctx.restore();
            return;
          }
          if (!opts.isAxisName) {
            const hit = (r) => left() < r.x + r.w && left() + tw > r.x && Math.abs(ty - r.y) < 14;
            const r = axisNameBoxes.find(hit);
            if (r) ty = r.y + (ty <= r.y ? -16 : 16);
            ty = Math.max(10, Math.min(size.h - 10, ty));
          } else {
            axisNameBoxes.push({ x: left(), y: ty, w: tw });
          }
          ctx.lineWidth = 4;
          ctx.lineJoin = "round";
          ctx.strokeStyle = pal.dark ? "rgba(14,18,27,.85)" : "rgba(255,255,255,.9)";
          ctx.strokeText(str, tx, ty);
          ctx.fillStyle = res(color);
          ctx.fillText(str, tx, ty);
          ctx.restore();
        },
      };
      return d;
    }

    function render() {
      if (destroyed || !size.w) return;
      const pal = palette(host);
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
      ctx.clearRect(0, 0, size.w, size.h);
      axisNameBoxes = [];
      pendingLabels = [];
      shafts = [];
      arrowCount = 0;
      drawFn(api(pal));
      handles.forEach((h) => {
        if (h.hidden?.()) return;
        const [x, y] = P(h.get());
        const active = drag?.handle === h || hover === h;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, active ? 9 : 7.5, 0, Math.PI * 2);
        ctx.fillStyle = pal.dark ? "#161b27" : "#fff";
        ctx.fill();
        ctx.lineWidth = active ? 3 : 2.4;
        ctx.strokeStyle = pal[h.color] || h.color || pal.accent;
        ctx.stroke();
        ctx.restore();
      });
      if (options.spreadLabels) placeLabels(pal);
    }

    /* Opt-in label placement: try a few offsets, keep off labels, handles and shafts. */
    function placeLabels(pal) {
      const gap = 5;
      // axis names keep a wider berth: a label right beside x₁ would read as one name
      const placed = axisNameBoxes.map((r) => ({ ...r, gap: 12 }));
      const knobs = handles.filter((h) => !h.hidden?.()).map((h) => P(h.get()));
      const meets = (a, b) => {
        const g = b.gap ?? gap;
        return a.x < b.x + b.w + g && a.x + a.w + g > b.x && Math.abs(a.y - b.y) < 15;
      };
      const onKnob = (r) =>
        knobs.some(([hx, hy]) => {
          const nx = Math.max(r.x, Math.min(r.x + r.w, hx));
          const ny = Math.max(r.y - 8, Math.min(r.y + 8, hy));
          return Math.hypot(nx - hx, ny - hy) < 12;
        });
      const onShaft = (r, owner) =>
        shafts.some((sh) => {
          if (sh.owner === owner) return false;
          const len = Math.hypot(sh.b[0] - sh.a[0], sh.b[1] - sh.a[1]);
          const n = Math.max(2, Math.ceil(len / 3));
          for (let i = 0; i <= n; i += 1) {
            const x = sh.a[0] + ((sh.b[0] - sh.a[0]) * i) / n;
            const y = sh.a[1] + ((sh.b[1] - sh.a[1]) * i) / n;
            if (x > r.x - 2 && x < r.x + r.w + 2 && y > r.y - 8 && y < r.y + 8) return true;
          }
          return false;
        });
      const inside = (r) => r.x >= 4 && r.x + r.w <= size.w - 4 && r.y >= 10 && r.y <= size.h - 10;
      pendingLabels.forEach((lab) => {
        const { w } = lab;
        const tries = [[0, 0], [0, -16], [0, 16], [w * 0.6, 0], [-w * 0.6, 0], [w * 0.6, -16], [-w * 0.6, -16], [w * 0.6, 16], [-w * 0.6, 16], [0, -30], [0, 30], [w + 8, 0], [-w - 8, 0]];
        const at = ([ox, oy]) => ({ x: lab.x + ox, y: lab.y + oy, w });
        const free = (r) => inside(r) && !placed.some((q) => meets(r, q)) && !onKnob(r);
        let best = tries.map(at).find((r) => free(r) && !onShaft(r, lab.owner)) || tries.map(at).find(free) || at([0, 0]);
        best = { ...best, x: Math.max(4, Math.min(size.w - 4 - w, best.x)), y: Math.max(10, Math.min(size.h - 10, best.y)) };
        placed.push(best);
        ctx.save();
        ctx.font = lab.font;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";
        ctx.strokeStyle = pal.dark ? "rgba(14,18,27,.85)" : "rgba(255,255,255,.9)";
        ctx.strokeText(lab.str, best.x, best.y);
        ctx.fillStyle = lab.color;
        ctx.fillText(lab.str, best.x, best.y);
        ctx.restore();
      });
    }

    function localPoint(event) {
      const rect = canvas.getBoundingClientRect();
      return [event.clientX - rect.left, event.clientY - rect.top];
    }

    function pick(pt) {
      let best = null;
      let bestDist = 20;
      handles.forEach((h) => {
        if (h.hidden?.()) return;
        const [x, y] = P(h.get());
        const dist = Math.hypot(x - pt[0], y - pt[1]);
        if (dist < bestDist) {
          best = h;
          bestDist = dist;
        }
      });
      return best;
    }

    function moveTo(pt) {
      const h = drag.handle;
      let p = W(pt);
      const lim = h.limit ?? extent;
      p = p.map((x) => Math.max(-lim, Math.min(lim, x)));
      if (h.snap) p = p.map((x) => Math.round(x / h.snap) * h.snap);
      h.set(p);
      listeners.change.forEach((f) => f(h));
      render();
    }

    function onDown(event) {
      if (event.button !== undefined && event.button !== 0) return;
      const pt = localPoint(event);
      const h = pick(pt);
      if (!h) return;
      canvas.setPointerCapture?.(event.pointerId);
      drag = { handle: h };
      wrap.classList.add("is-dragging");
      moveTo(pt);
      event.preventDefault();
    }

    function onMove(event) {
      const pt = localPoint(event);
      if (!drag) {
        const h = pick(pt);
        if (h !== hover) {
          hover = h;
          canvas.style.cursor = h ? "grab" : "default";
          render();
        }
        return;
      }
      moveTo(pt);
    }

    function onUp() {
      if (drag) {
        const h = drag.handle;
        drag = null;
        wrap.classList.remove("is-dragging");
        h.end?.();
        listeners.end.forEach((f) => f(h));
        render();
      }
    }

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", () => {
      if (!drag && hover) {
        hover = null;
        render();
      }
    });
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const themeObserver = new MutationObserver(() => render());
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    // during a light/dark switch the colour tokens morph frame by frame: follow them
    const onThemeMix = () => { if (canvas.isConnected) render(); };
    window.addEventListener("la-thememix", onThemeMix);
    requestAnimationFrame(resize);

    return {
      canvas,
      element: wrap,
      render,
      project: P,
      unproject: W,
      setExtent(value) {
        extent = value;
        render();
      },
      setDraw(fn) {
        drawFn = fn;
        render();
      },
      setHandles(list) {
        handles = list || [];
        render();
      },
      on(event, fn) {
        listeners[event]?.push(fn);
      },
      destroy() {
        destroyed = true;
        ro.disconnect();
        themeObserver.disconnect();
        window.removeEventListener("la-thememix", onThemeMix);
        wrap.remove();
      },
    };
  }

  /* ---------- theorem blocks from content data ---------- */

  function renderFormal(root, section) {
    const f = section.lesson3d;
    if (!root || !f) return;
    const figure = (key) => {
      const make = window.Ch7Figures?.[key];
      return make ? `<figure class="ch7l-figure">${make()}</figure>` : "";
    };
    root.innerHTML = `<h2>定理与方法</h2><div class="ch7l-formal">${f.blocks
      .map(
        (b) => `<article class="ch7l-theorem"><h3>${b.title}</h3>${b.tex ? `<div class="ch7l-theorem-math">${texD(b.tex)}</div>` : ""}${b.figure ? figure(b.figure) : ""}${b.text ? `<p>${b.text}</p>` : ""}</article>`,
      )
      .join("")}${f.pitfalls?.length ? `<div class="ch7l-pitfalls"><h3>容易错在哪里</h3><ul>${f.pitfalls.map((p) => `<li>${p}</li>`).join("")}</ul></div>` : ""}</div>`;
  }

  /*
   * Register a section: the formal blocks always, and a lab when given.
   * The lab section is moved above the theorem blocks (picture first).
   */
  function register(id, lab) {
    window.defineChapter7Renderer?.(id, {
      formal: (root, section) => renderFormal(root, section),
      interactive: lab
        ? (root, section, page) => {
            if (!root) return undefined;
            const formal = page?.querySelector(`#${CSS.escape(section.id)}-formal`);
            if (formal && formal.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING) formal.before(root);
            return lab(root, section);
          }
        : undefined,
    });
  }

  window.Ch7Kit = Object.freeze({
    M,
    tex,
    texD,
    F,
    num,
    lf,
    mat,
    vec,
    mul,
    sub,
    scaleMat,
    identity,
    inv,
    transpose,
    det,
    rank,
    matVec,
    isZeroVec,
    eqMat,
    isDiagonal,
    dotF,
    cross3,
    rankOfVectors,
    coordinatesIn,
    nullspace,
    latexMatrix,
    hlTex,
    hlHtml,
    latexVec,
    latexRow,
    polyLatex,
    polyFactorLatex,
    minimalPolynomial,
    charPolynomial,
    el,
    chips,
    labShell,
    predictFlow,
    plane2d,
    withAlpha,
    renderFormal,
    register,
  });
})();


;/* content/ch8-registry.js */
/*
 * Chapter 8 section data registry.
 */
(() => {
  const patches = new Map();

  window.defineChapter8Section = function defineChapter8Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 8 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter8SectionPatches = function getChapter8SectionPatches() {
    return patches;
  };
})();


;/* content/ch8-section1.js */
defineChapter8Section("lambda-matrix", {
  number: "§1",
  textbookSection: "λ-矩阵",
  title: "λ-矩阵",
  navTitle: "λ-矩阵",
  question: `${texInline(String.raw`\lambda E-A`)} 比 ${texInline("A")} 多告诉了我们什么？`,
  goal: `知道 ${texInline(String.raw`\lambda`)}-矩阵是元素为 ${texInline(String.raw`\lambda`)} 的多项式的矩阵；会判断 ${texInline(String.raw`\lambda`)}-矩阵的秩与可逆性；理解代入 ${texInline(String.raw`\lambda_0`)} 后的秩记录了特征向量的个数。`,
  tags: ["λ-矩阵", "特征矩阵", "秩", "可逆 λ-矩阵"],
  intro:
    `把 ${texInline(String.raw`\lambda E-A`)} 看成一个整体，它是元素为 ${texInline(String.raw`\lambda`)} 的多项式的矩阵。它的行列式是特征多项式，只告诉我们 ${texInline(String.raw`\lambda`)} 在哪里使矩阵降秩；矩阵本身还告诉我们降了多少。下面让 ${texInline(String.raw`\lambda_0`)} 扫过数轴，比较几个特征多项式相同的例子。`,
  concepts: [
    { label: "λ-矩阵", text: texInline(String.raw`A(\lambda)=(a_{ij}(\lambda)),\ a_{ij}(\lambda)\in P[\lambda]`) },
    { label: "可逆", text: texInline(String.raw`A(\lambda)\ \text{可逆}\iff|A(\lambda)|=d\ne0`) },
  ],
  textbook: { reference: "北大版《高等代数》第八章 §1", items: ["λ-矩阵", "λ-矩阵的秩", "可逆的 λ-矩阵"] },
  interactive: { type: "slot", title: "沿数轴扫描 λ" },
  lesson3d: {
    blocks: [
      {
        title: "λ-矩阵与它的秩",
        tex: String.raw`A(\lambda)=\begin{pmatrix}a_{11}(\lambda)&\cdots&a_{1n}(\lambda)\\\vdots&&\vdots\\a_{m1}(\lambda)&\cdots&a_{mn}(\lambda)\end{pmatrix},\qquad a_{ij}(\lambda)\in P[\lambda]`,
        text: `${texInline(String.raw`\lambda`)}-矩阵的加法、乘法和行列式与数字矩阵的规则相同，只是元素换成了多项式。${texInline(String.raw`A(\lambda)`)} 中不恒为零的子式的最高阶数称为它的秩。${texInline(String.raw`|\lambda E-A|`)} 是 ${texInline("n")} 次多项式，不是零多项式，所以 ${texInline(String.raw`\lambda E-A`)} 的秩总是 ${texInline("n")}；把 ${texInline(String.raw`\lambda`)} 换成一个数 ${texInline(String.raw`\lambda_0`)} 以后，数字矩阵 ${texInline(String.raw`\lambda_0E-A`)} 的秩可能更小，降低的数目 ${texInline(String.raw`n-\operatorname{rank}(\lambda_0E-A)`)} 就是属于 ${texInline(String.raw`\lambda_0`)} 的线性无关特征向量的个数。`,
        ponder: {
          q: `${texInline(String.raw`A=\begin{pmatrix}2&1\\0&2\end{pmatrix}`)} 与 ${texInline("2E")} 的特征多项式都是 ${texInline(String.raw`(\lambda-2)^2`)}。代入 ${texInline(String.raw`\lambda=2`)} 后，两个特征矩阵的秩一样吗？`,
          a: `不一样。${texInline("2E-A")} 的秩是 1，${texInline("2E-2E")} 是零矩阵，秩为 0。特征多项式相同，特征矩阵却不同。`,
        },
      },
      {
        title: "可逆的 λ-矩阵",
        tex: String.raw`A(\lambda)B(\lambda)=B(\lambda)A(\lambda)=E\quad\iff\quad |A(\lambda)|=d,\ d\ \text{是非零常数}`,
        text: `若 ${texInline(String.raw`A(\lambda)B(\lambda)=E`)}，两边取行列式得 ${texInline(String.raw`|A(\lambda)|\cdot|B(\lambda)|=1`)}，两个多项式相乘等于 1，它们只能都是非零常数。反过来，${texInline(String.raw`|A(\lambda)|=d\ne0`)} 时 ${texInline(String.raw`B(\lambda)=A^*(\lambda)/d`)} 的元素仍是多项式。所以判断标准是行列式为非零常数，仅仅不是零多项式还不够。`,
        ponder: {
          q: `${texInline(String.raw`\lambda E-A`)} 是可逆的 ${texInline(String.raw`\lambda`)}-矩阵吗？`,
          a: `不是。${texInline(String.raw`|\lambda E-A|`)} 是 ${texInline("n")} 次多项式（${texInline(String.raw`n\ge1`)}），不是常数。`,
        },
      },
    ],
    pitfalls: [
      `把“秩为 ${texInline("n")}”当成“可逆”。${texInline(String.raw`|\lambda E-A|`)} 不是零多项式，秩为 ${texInline("n")}；它不是常数，所以不可逆。`,
      `以为对每个实数 ${texInline(String.raw`\lambda_0`)} 都满秩就可逆。${texInline(String.raw`|A(\lambda)|=\lambda^2+1`)} 在实轴上没有零点，${texInline(String.raw`A(\lambda)`)} 仍然不可逆。`,
      `以为特征多项式相同，代入同一个特征值后秩就相同。秩要由 ${texInline(String.raw`\lambda_0E-A`)} 本身决定。`,
    ],
  },
  example: {
    title: "例题：哪一个 λ-矩阵可逆",
    question: `下列 ${texInline(String.raw`\lambda`)}-矩阵中，哪一个是可逆的 ${texInline(String.raw`\lambda`)}-矩阵？`,
    choices: [
      { correct: true, text: texInline(String.raw`\begin{pmatrix}\lambda&\lambda+1\\\lambda-1&\lambda\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}2&0\\0&\lambda\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}\lambda&1\\-1&\lambda\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}\lambda&\lambda\\1&1\end{pmatrix}`) },
    ],
    steps: [
      `逐个算行列式：${texInline(String.raw`\lambda\cdot\lambda-(\lambda+1)(\lambda-1)=1`)}，是非零常数，所以 ${texInline(String.raw`\begin{pmatrix}\lambda&\lambda+1\\\lambda-1&\lambda\end{pmatrix}`)} 可逆，逆矩阵为 ${texInline(String.raw`\begin{pmatrix}\lambda&-\lambda-1\\1-\lambda&\lambda\end{pmatrix}`)}。`,
      `${texInline(String.raw`\begin{vmatrix}2&0\\0&\lambda\end{vmatrix}=2\lambda`)}，不是常数，逆矩阵中会出现 ${texInline(String.raw`\tfrac1\lambda`)}。`,
      `${texInline(String.raw`\begin{vmatrix}\lambda&1\\-1&\lambda\end{vmatrix}=\lambda^2+1`)}，在实数处都不为零，但它不是常数，逆矩阵的元素带分母 ${texInline(String.raw`\lambda^2+1`)}。`,
      `${texInline(String.raw`\begin{vmatrix}\lambda&\lambda\\1&1\end{vmatrix}=0`)}，两列相同，秩为 1。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("n")} 阶矩阵 ${texInline("A")} 的特征矩阵 ${texInline(String.raw`\lambda E-A`)} 的秩是多少？代入 ${texInline(String.raw`\lambda_0`)} 后的秩说明了什么？`,
      answer: `秩是 ${texInline("n")}，因为 ${texInline(String.raw`|\lambda E-A|`)} 是 ${texInline("n")} 次多项式。${texInline(String.raw`n-\operatorname{rank}(\lambda_0E-A)`)} 是属于 ${texInline(String.raw`\lambda_0`)} 的线性无关特征向量的个数，它为 0 说明 ${texInline(String.raw`\lambda_0`)} 不是特征值。`,
    },
    {
      question: `可逆 ${texInline(String.raw`\lambda`)}-矩阵 ${texInline(String.raw`A(\lambda)`)} 的逆矩阵的行列式是什么？`,
      answer: `若 ${texInline(String.raw`|A(\lambda)|=d`)}，则 ${texInline(String.raw`|A(\lambda)^{-1}|=1/d`)}，也是非零常数。`,
    },
    {
      question: `两个可逆 ${texInline(String.raw`\lambda`)}-矩阵的乘积可逆吗？`,
      answer: `可逆。乘积的行列式是两个非零常数之积，仍是非零常数；逆矩阵为 ${texInline(String.raw`B(\lambda)^{-1}A(\lambda)^{-1}`)}。`,
    },
  ],
  summary: [
    `${texInline(String.raw`\lambda`)}-矩阵的元素是 ${texInline(String.raw`P[\lambda]`)} 中的多项式；它可逆当且仅当行列式是非零常数。`,
    `${texInline(String.raw`\lambda E-A`)} 的秩总是 ${texInline("n")}，行列式就是特征多项式。`,
    `代入 ${texInline(String.raw`\lambda_0`)} 后，${texInline(String.raw`n-\operatorname{rank}(\lambda_0E-A)`)} 记录属于 ${texInline(String.raw`\lambda_0`)} 的特征向量个数；特征多项式相同的矩阵在这里可以不同。`,
  ],
});


;/* content/ch8-section2.js */
defineChapter8Section("smith-form", {
  number: "§2",
  textbookSection: "λ-矩阵在初等变换下的标准形",
  title: "λ-矩阵在初等变换下的标准形",
  navTitle: "λ-矩阵的标准形",
  question: `初等变换能把 ${texInline(String.raw`\lambda`)}-矩阵化到多简单？`,
  goal: `掌握 ${texInline(String.raw`\lambda`)}-矩阵的三种初等变换与等价；会用带余除法把 ${texInline(String.raw`\lambda`)}-矩阵化成对角元首一、依次整除的标准形。`,
  tags: ["初等变换", "等价", "带余除法", "标准形"],
  intro:
    `数字矩阵可以用初等变换化成对角形，${texInline(String.raw`\lambda`)}-矩阵也可以，只是倍乘只能乘非零常数。办法是把次数最低的元素放到左上角，用带余除法清掉同行同列；余式不为零，就让它当新的角元。下面亲手做一遍。`,
  concepts: [
    { label: "初等变换", text: `换行、乘非零常数、加上另一行的 ${texInline(String.raw`\varphi(\lambda)`)} 倍（列同样）` },
    { label: "标准形", text: texInline(String.raw`\operatorname{diag}(d_1,\dots,d_r,0,\dots,0),\ d_i\mid d_{i+1}`) },
  ],
  textbook: { reference: "北大版《高等代数》第八章 §2", items: ["初等变换与初等矩阵", "λ-矩阵的等价", "降低左上角次数的引理", "标准形"] },
  interactive: { type: "slot", title: "标准形工作台" },
  lesson3d: {
    blocks: [
      {
        title: "初等变换与等价",
        tex: String.raw`B(\lambda)=P_1(\lambda)\cdots P_s(\lambda)\,A(\lambda)\,Q_1(\lambda)\cdots Q_t(\lambda)`,
        text: `${texInline(String.raw`\lambda`)}-矩阵的初等变换有三种：交换两行 ${texInline("[i,j]")}；用非零常数 ${texInline("c")} 乘某一行 ${texInline("[i(c)]")}；把第 ${texInline("j")} 行的 ${texInline(String.raw`\varphi(\lambda)`)} 倍加到第 ${texInline("i")} 行 ${texInline(String.raw`[i+j(\varphi)]`)}。列变换相同，记作 ${texInline(String.raw`\{i,j\}`)}、${texInline(String.raw`\{i(c)\}`)}、${texInline(String.raw`\{i+j(\varphi)\}`)}。每种变换都是左乘或右乘一个初等 ${texInline(String.raw`\lambda`)}-矩阵，它们都可逆。${texInline(String.raw`A(\lambda)`)} 经若干次初等变换变成 ${texInline(String.raw`B(\lambda)`)}，就称两者等价，即上式成立，其中 ${texInline("P_i")}、${texInline("Q_j")} 是初等矩阵。`,
        ponder: {
          q: `把一行乘以 ${texInline(String.raw`\lambda`)}，为什么不算初等变换？`,
          a: `初等变换要能用初等变换撤回。撤回乘 ${texInline(String.raw`\lambda`)} 需要乘 ${texInline(String.raw`1/\lambda`)}，它不是多项式。`,
        },
      },
      {
        title: "降低左上角的次数",
        tex: String.raw`a_{i1}(\lambda)=a_{11}(\lambda)q(\lambda)+r(\lambda),\quad r\ne0,\ \deg r<\deg a_{11}`,
        text: `设 ${texInline(String.raw`a_{11}(\lambda)\ne0`)}，且某个元素不能被 ${texInline("a_{11}")} 整除。若它在第一列，从第 ${texInline("i")} 行减去第一行的 ${texInline(String.raw`q(\lambda)`)} 倍，余式 ${texInline(String.raw`r(\lambda)`)} 留在第一列，再换到左上角；在第一行时用列变换同样处理；在别处时，先把它所在的行加到第一行。每一轮左上角的次数都严格下降，所以有限步后角元整除所有元素，就能清掉第一行和第一列。`,
      },
      {
        title: "标准形",
        tex: String.raw`A(\lambda)\simeq\operatorname{diag}\big(d_1(\lambda),\dots,d_r(\lambda),0,\dots,0\big),\qquad d_i(\lambda)\mid d_{i+1}(\lambda)`,
        text: `任意 ${texInline(String.raw`\lambda`)}-矩阵都与上面的对角形等价，其中 ${texInline("r")} 是它的秩，${texInline(String.raw`d_1(\lambda),\dots,d_r(\lambda)`)} 是首项系数为 1 的多项式，每一个整除下一个。这个矩阵称为 ${texInline(String.raw`A(\lambda)`)} 的标准形。方阵满秩时，${texInline(String.raw`d_1(\lambda)\cdots d_n(\lambda)`)} 与 ${texInline(String.raw`|A(\lambda)|`)} 只差一个非零常数因子。`,
        ponder: {
          q: `${texInline(String.raw`\operatorname{diag}(\lambda,\lambda+1)`)} 已经是对角矩阵，为什么还不是标准形？`,
          a: `${texInline(String.raw`\lambda`)} 不整除 ${texInline(String.raw`\lambda+1`)}。继续做初等变换得到 ${texInline(String.raw`\operatorname{diag}(1,\lambda(\lambda+1))`)}。`,
        },
      },
    ],
    pitfalls: [
      `把某一行乘以 ${texInline(String.raw`\lambda`)} 或乘以多项式。倍乘只能乘非零常数。`,
      "化成对角形就停下。还要检查对角元是否首一、是否依次整除。",
      "不先降低角元次数就硬做除法。角元次数不是最低时，同行同列中次数更低的元素消不掉，先把它换到左上角。",
    ],
  },
  example: {
    title: "例题：化成标准形",
    question: `${texInline(String.raw`A(\lambda)=\begin{pmatrix}\lambda&1\\\lambda^2-1&\lambda+1\end{pmatrix}`)} 的标准形是什么？`,
    choices: [
      { correct: true, text: texInline(String.raw`\begin{pmatrix}1&0\\0&\lambda+1\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}\lambda&0\\0&\lambda+1\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&0\\0&\lambda^2+\lambda\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&0\\0&-\lambda-1\end{pmatrix}`) },
    ],
    steps: [
      `右上角的 1 次数最低。作 ${texInline(String.raw`\{1,2\}`)} 把它换到左上角：${texInline(String.raw`\begin{pmatrix}1&\lambda\\\lambda+1&\lambda^2-1\end{pmatrix}`)}。`,
      `作 ${texInline(String.raw`[2+1(-\lambda-1)]`)}：第二行变为 ${texInline(String.raw`(0,\ \lambda^2-1-\lambda(\lambda+1))=(0,\ -\lambda-1)`)}。`,
      `作 ${texInline(String.raw`\{2+1(-\lambda)\}`)} 清掉右上角，再作 ${texInline(String.raw`[2(-1)]`)} 首一化，得 ${texInline(String.raw`\operatorname{diag}(1,\lambda+1)`)}。`,
      `核对：${texInline(String.raw`|A(\lambda)|=\lambda(\lambda+1)-(\lambda^2-1)=\lambda+1`)}，与对角元之积一致。${texInline(String.raw`\operatorname{diag}(\lambda,\lambda+1)`)} 的行列式是 ${texInline(String.raw`\lambda(\lambda+1)`)}，也不满足整除；${texInline(String.raw`\lambda^2+\lambda`)} 使行列式次数不符；${texInline(String.raw`-\lambda-1`)} 不是首一的。`,
    ],
  },
  quiz: [
    {
      question: `${texInline(String.raw`A(\lambda)`)} 中某个元素是非零常数，它的标准形中 ${texInline(String.raw`d_1(\lambda)`)} 是什么？`,
      answer: `${texInline(String.raw`d_1(\lambda)=1`)}。把这个常数换到左上角，它能整除一切元素，用它清掉同行同列后乘以它的倒数即可。`,
    },
    {
      question: `两个 ${texInline(String.raw`\lambda`)}-矩阵等价，它们的秩相同吗？`,
      answer: `相同。初等变换不改变 ${texInline(String.raw`\lambda`)}-矩阵的秩，标准形中非零对角元的个数就是秩。`,
    },
    {
      question: `${texInline("n")} 阶 ${texInline(String.raw`\lambda`)}-矩阵可逆时，它的标准形是什么？`,
      answer: `是单位矩阵 ${texInline("E")}。行列式是非零常数，对角元之积只能是常数，首一以后全是 1。`,
    },
  ],
  summary: [
    `初等变换：换行（列）、乘非零常数、加上另一行（列）的 ${texInline(String.raw`\varphi(\lambda)`)} 倍；能互相变换的 ${texInline(String.raw`\lambda`)}-矩阵称为等价。`,
    "把次数最低的元素放到左上角做带余除法，角元次数逐轮下降，直到它整除一切元素。",
    `任意 ${texInline(String.raw`\lambda`)}-矩阵都等价于标准形 ${texInline(String.raw`\operatorname{diag}(d_1,\dots,d_r,0,\dots,0)`)}，${texInline("d_i")} 首一且 ${texInline(String.raw`d_i\mid d_{i+1}`)}。`,
  ],
});


;/* content/ch8-section3.js */
defineChapter8Section("invariant-factors", {
  number: "§3",
  textbookSection: "不变因子",
  title: "不变因子",
  navTitle: "不变因子",
  question: "化标准形的路线有很多条，为什么得到的标准形总是同一个？",
  goal: `会求行列式因子 ${texInline(String.raw`D_k(\lambda)`)} 与不变因子 ${texInline(String.raw`d_k(\lambda)=D_k/D_{k-1}`)}；理解初等变换不改变行列式因子，从而标准形唯一；会用行列式因子判断两个 ${texInline(String.raw`\lambda`)}-矩阵是否等价。`,
  tags: ["行列式因子", "不变因子", "标准形的唯一性", "等价的判别"],
  intro:
    `化标准形时，每一步选哪个角元、先清行还是先清列，都可以不同。要说明结果唯一，得找一个初等变换改变不了的量。全部 ${texInline("k")} 阶子式的最大公因式就是这样的量。下面在子式墙上验证这一点。`,
  concepts: [
    { label: "行列式因子", text: texInline(String.raw`D_k(\lambda)=\gcd\{\text{全部 }k\text{ 阶子式}\}`) },
    { label: "不变因子", text: texInline(String.raw`d_k=D_k/D_{k-1}`) },
  ],
  textbook: { reference: "北大版《高等代数》第八章 §3", items: ["行列式因子", "等价 λ-矩阵有相同的行列式因子", "标准形的唯一性", "不变因子", "可逆 λ-矩阵是初等矩阵之积"] },
  interactive: { type: "slot", title: "子式墙" },
  lesson3d: {
    blocks: [
      {
        title: "行列式因子",
        tex: String.raw`D_k(\lambda)=\text{首一的}\ \gcd\{A(\lambda)\ \text{的全部}\ k\ \text{阶子式}\},\qquad D_k(\lambda)\mid D_{k+1}(\lambda)`,
        text: `设 ${texInline(String.raw`A(\lambda)`)} 的秩为 ${texInline("r")}，对 ${texInline(String.raw`k=1,\dots,r`)}，${texInline(String.raw`A(\lambda)`)} 中必有非零的 ${texInline("k")} 阶子式，它们的首项系数为 1 的最大公因式称为 ${texInline("k")} 阶行列式因子。每个 ${texInline("k+1")} 阶子式按一行展开，是 ${texInline("k")} 阶子式的组合，所以 ${texInline("D_k")} 整除 ${texInline("D_{k+1}")}。`,
        ponder: {
          q: `${texInline(String.raw`A(\lambda)`)} 中有一个 ${texInline("k")} 阶子式是非零常数，${texInline(String.raw`D_1,\dots,D_k`)} 各是什么？`,
          a: `都是 1。${texInline("D_k")} 整除这个常数，只能是 1；而 ${texInline("j")} 小于 ${texInline("k")} 时 ${texInline("D_j")} 整除 ${texInline("D_k")}，也都是 1。`,
        },
      },
      {
        title: "初等变换不改变行列式因子",
        tex: String.raw`D_k(\lambda)=d_1(\lambda)d_2(\lambda)\cdots d_k(\lambda),\qquad d_k(\lambda)=\frac{D_k(\lambda)}{D_{k-1}(\lambda)}\quad(D_0=1)`,
        text: `换行只改变一些子式的符号，乘非零常数只改变常数倍；把第 ${texInline("j")} 行的 ${texInline(String.raw`\varphi(\lambda)`)} 倍加到第 ${texInline("i")} 行，新的 ${texInline("k")} 阶子式等于旧子式加上 ${texInline(String.raw`\varphi(\lambda)`)} 乘另一个旧子式（差一个符号）。所以 ${texInline("D_k")} 整除变换后的每个 ${texInline("k")} 阶子式，再由变换可以撤回，两边的 ${texInline("D_k")} 相同。对标准形，非零的 ${texInline("k")} 阶子式只能是 ${texInline("k")} 个对角元之积，它们都被 ${texInline(String.raw`d_1\cdots d_k`)} 整除，于是得到上式。${texInline("d_k")} 由 ${texInline(String.raw`A(\lambda)`)} 唯一决定，称为不变因子，标准形因此唯一。`,
      },
      {
        title: "等价的判别",
        tex: String.raw`A(\lambda)\simeq B(\lambda)\iff D_k\ \text{全部相同}\iff d_k\ \text{全部相同}`,
        text: `两个 ${texInline(String.raw`\lambda`)}-矩阵等价，当且仅当它们有相同的行列式因子，也当且仅当它们有相同的不变因子。特别地，${texInline("n")} 阶 ${texInline(String.raw`\lambda`)}-矩阵可逆当且仅当它与 ${texInline("E")} 等价，也就是可以写成若干个初等矩阵的乘积。`,
        ponder: {
          q: `可逆的 ${texInline("n")} 阶 ${texInline(String.raw`\lambda`)}-矩阵，它的不变因子是什么？`,
          a: `全是 1。${texInline(String.raw`D_n=|A(\lambda)|`)} 首一化后是 1，于是 ${texInline(String.raw`d_1\cdots d_n=1`)}，每个 ${texInline("d_k")} 都是 1。`,
        },
      },
    ],
    pitfalls: [
      `只算一个 ${texInline("k")} 阶子式就当作 ${texInline("D_k")}。${texInline("D_k")} 是全部 ${texInline("k")} 阶子式的最大公因式。`,
      `把行列式因子当成不变因子。${texInline("d_k=D_k/D_{k-1}")}，例如 ${texInline("D_3")} 是 ${texInline("d_1d_2d_3")}。`,
      `把对角 ${texInline(String.raw`\lambda`)}-矩阵的对角元直接当作不变因子。${texInline(String.raw`\operatorname{diag}(\lambda,\lambda+1)`)} 的不变因子是 ${texInline(String.raw`1,\ \lambda(\lambda+1)`)}。`,
    ],
  },
  example: {
    title: "例题：由行列式因子求不变因子",
    question: `三阶 ${texInline(String.raw`\lambda`)}-矩阵的行列式因子为 ${texInline(String.raw`D_1=1,\ D_2=\lambda-1,\ D_3=(\lambda-1)^3(\lambda+2)`)}。它的不变因子是什么？`,
    choices: [
      { correct: true, text: texInline(String.raw`1,\ \lambda-1,\ (\lambda-1)^2(\lambda+2)`) },
      { text: texInline(String.raw`1,\ \lambda-1,\ (\lambda-1)^3(\lambda+2)`) },
      { text: texInline(String.raw`1,\ \lambda-1,\ (\lambda-1)(\lambda+2)`) },
      { text: texInline(String.raw`\lambda-1,\ \lambda-1,\ (\lambda-1)(\lambda+2)`) },
    ],
    steps: [
      `${texInline(String.raw`d_1=D_1=1`)}，${texInline(String.raw`d_2=D_2/D_1=\lambda-1`)}。`,
      `${texInline(String.raw`d_3=D_3/D_2=(\lambda-1)^3(\lambda+2)/(\lambda-1)=(\lambda-1)^2(\lambda+2)`)}。核对：${texInline(String.raw`d_1\mid d_2\mid d_3`)}，乘积为 ${texInline("D_3")}。`,
      `把 ${texInline("D_3")} 直接当作 ${texInline("d_3")}，乘积会多出 ${texInline(String.raw`\lambda-1`)}；${texInline(String.raw`(\lambda-1)(\lambda+2)`)} 使乘积少一个因子 ${texInline(String.raw`\lambda-1`)}；以 ${texInline(String.raw`\lambda-1,\ \lambda-1`)} 开头的那一组，${texInline("d_1")} 应为 ${texInline("D_1=1")}。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("n")} 阶矩阵 ${texInline("A")} 的特征矩阵 ${texInline(String.raw`\lambda E-A`)}，它的 ${texInline("n")} 阶行列式因子 ${texInline("D_n")} 是什么？`,
      answer: `${texInline(String.raw`D_n=|\lambda E-A|`)}，就是 ${texInline("A")} 的特征多项式（首项系数为 1）。于是 ${texInline(String.raw`d_1d_2\cdots d_n`)} 等于特征多项式。`,
    },
    {
      question: `两个 ${texInline(String.raw`\lambda`)}-矩阵对应位置的元素都不相同，它们可能等价吗？`,
      answer: `可能。等价只看行列式因子是否相同，例如 ${texInline(String.raw`\operatorname{diag}(\lambda,\lambda+1)`)} 与 ${texInline(String.raw`\operatorname{diag}(1,\lambda^2+\lambda)`)} 等价。`,
    },
    {
      question: "为什么说标准形是唯一的？",
      answer: `标准形的对角元 ${texInline("d_k=D_k/D_{k-1}")}，而 ${texInline("D_k")} 在初等变换下不变，只由 ${texInline(String.raw`A(\lambda)`)} 决定。无论走哪条化简路线，得到的 ${texInline("d_k")} 都相同。`,
    },
  ],
  summary: [
    `${texInline(String.raw`D_k(\lambda)`)} 是全部 ${texInline("k")} 阶子式的首一最大公因式，初等变换不改变它。`,
    `不变因子 ${texInline("d_k=D_k/D_{k-1}")} 就是标准形的对角元，所以标准形唯一。`,
    `两个 ${texInline(String.raw`\lambda`)}-矩阵等价 ${texInline(String.raw`\Leftrightarrow`)} 行列式因子相同 ${texInline(String.raw`\Leftrightarrow`)} 不变因子相同；可逆 ${texInline(String.raw`\lambda`)}-矩阵是初等矩阵的乘积。`,
  ],
});


;/* content/ch8-section4.js */
defineChapter8Section("similarity-criterion", {
  number: "§4",
  textbookSection: "矩阵相似的条件",
  title: "矩阵相似的条件",
  navTitle: "矩阵相似的条件",
  question: "怎样判断两个数字矩阵是否相似？",
  goal: `掌握 ${texInline("A")} 与 ${texInline("B")} 相似当且仅当 ${texInline(String.raw`\lambda E-A`)} 与 ${texInline(String.raw`\lambda E-B`)} 等价，当且仅当它们有相同的不变因子；会用不变因子区分特征多项式相同的矩阵。`,
  tags: ["相似", "特征矩阵的等价", "不变因子", "相似的判别"],
  intro:
    `特征多项式相同的矩阵不一定相似。把问题搬到特征矩阵上：${texInline("A")} 与 ${texInline("B")} 相似，恰好对应 ${texInline(String.raw`\lambda E-A`)} 与 ${texInline(String.raw`\lambda E-B`)} 等价。等价的判别前两节已经解决，于是不变因子就是相似的完整判别。`,
  concepts: [
    { label: "相似判别", text: texInline(String.raw`A\sim B\iff \lambda E-A\simeq\lambda E-B`) },
    { label: "不变因子", text: `${texInline(String.raw`\lambda E-A`)} 的不变因子也称为 ${texInline("A")} 的不变因子` },
  ],
  textbook: { reference: "北大版《高等代数》第八章 §4", items: ["数字矩阵相似与特征矩阵等价", "矩阵的不变因子", "相似的充分必要条件"] },
  lesson3d: {
    blocks: [
      {
        title: "相似与特征矩阵的等价",
        tex: String.raw`A\sim B\iff \lambda E-A\simeq \lambda E-B`,
        text: `若 ${texInline("B=X^{-1}AX")}，则 ${texInline(String.raw`\lambda E-B=X^{-1}(\lambda E-A)X`)}，${texInline("X")} 与 ${texInline("X^{-1}")} 都是可逆的数字矩阵，也是可逆的 ${texInline(String.raw`\lambda`)}-矩阵，所以两个特征矩阵等价。反过来，若 ${texInline(String.raw`\lambda E-A=U(\lambda)(\lambda E-B)V(\lambda)`)}，用 ${texInline(String.raw`\lambda E-A`)} 对 ${texInline(String.raw`U(\lambda)`)}、${texInline(String.raw`V(\lambda)`)} 作带余除法，可以从中取出一个数字矩阵 ${texInline("X")}，使 ${texInline("B=X^{-1}AX")}。`,
        ponder: {
          q: `${texInline("A")} 与它的转置 ${texInline("A^T")} 相似吗？`,
          a: `相似。${texInline(String.raw`\lambda E-A^T=(\lambda E-A)^T`)}，转置矩阵的全部 ${texInline("k")} 阶子式与原矩阵相同，行列式因子相同，于是两个特征矩阵等价。`,
        },
      },
      {
        title: "不变因子是相似的完整判别",
        tex: String.raw`A\sim B\iff \lambda E-A\ \text{与}\ \lambda E-B\ \text{有相同的不变因子}`,
        figure: "sameCharPoly",
        text: `${texInline(String.raw`\lambda E-A`)} 的秩是 ${texInline("n")}，有 ${texInline("n")} 个不变因子 ${texInline(String.raw`d_1,\dots,d_n`)}，乘积是特征多项式，称为 ${texInline("A")} 的不变因子。特征多项式只记录乘积，不变因子还记录这个乘积怎样分配到各个位置。`,
      },
    ],
    pitfalls: [
      "用特征多项式相同推出相似。特征多项式只是不变因子的乘积。",
      `把特征矩阵的等价与数字矩阵的相似混为一谈。等价允许左右乘不同的 ${texInline(String.raw`\lambda`)}-矩阵，它与相似的对应要借助上面的定理。`,
      `以为特征多项式和最小多项式都相同就相似。最小多项式是最后一个不变因子 ${texInline("d_n")}，中间的不变因子仍可以不同。`,
    ],
  },
  example: {
    title: "例题：找出相似的矩阵",
    question: `${texInline(String.raw`A=\begin{pmatrix}2&0&0\\1&2&0\\0&0&2\end{pmatrix}`)}，下列矩阵中哪一个与 ${texInline("A")} 相似？`,
    choices: [
      { correct: true, text: texInline(String.raw`\begin{pmatrix}2&1&0\\0&2&0\\0&0&2\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}2&0&0\\0&2&0\\0&0&2\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}2&0&0\\1&2&0\\0&1&2\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}2&1&0\\0&2&0\\0&0&3\end{pmatrix}`) },
    ],
    steps: [
      `${texInline("A")} 的不变因子：${texInline(String.raw`\lambda E-A`)} 中取第 2 行、第 1 列的元素 ${texInline("-1")}，它是非零常数，${texInline("D_1=1")}；全部 2 阶子式的最大公因式是 ${texInline(String.raw`\lambda-2`)}，${texInline(String.raw`D_3=(\lambda-2)^3`)}。于是不变因子为 ${texInline(String.raw`1,\ \lambda-2,\ (\lambda-2)^2`)}。`,
      `第一个矩阵是 ${texInline("A")} 的转置，不变因子同样是 ${texInline(String.raw`1,\ \lambda-2,\ (\lambda-2)^2`)}，与 ${texInline("A")} 相似。`,
      `${texInline("2E")} 的不变因子是 ${texInline(String.raw`\lambda-2,\ \lambda-2,\ \lambda-2`)}；第三个矩阵有一个 2 阶子式等于 1，不变因子是 ${texInline(String.raw`1,\ 1,\ (\lambda-2)^3`)}；最后一个的特征多项式是 ${texInline(String.raw`(\lambda-2)^2(\lambda-3)`)}，连特征值都不同。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("A")} 与 ${texInline("B")} 相似，${texInline(String.raw`\lambda E-A`)} 与 ${texInline(String.raw`\lambda E-B`)} 的标准形有什么关系？`,
      answer: "相同。两个特征矩阵等价，标准形由不变因子唯一决定。",
    },
    {
      question: `特征多项式都是 ${texInline(String.raw`(\lambda-2)^4`)}、最小多项式都是 ${texInline(String.raw`(\lambda-2)^2`)} 的两个四阶矩阵，一定相似吗？`,
      answer: `不一定。不变因子可以是 ${texInline(String.raw`1,\ 1,\ (\lambda-2)^2,\ (\lambda-2)^2`)}，也可以是 ${texInline(String.raw`1,\ \lambda-2,\ \lambda-2,\ (\lambda-2)^2`)}，两组都满足条件，对应的矩阵不相似。`,
    },
    {
      question: `数字矩阵 ${texInline("A")} 的不变因子之积等于什么？`,
      answer: `等于特征多项式 ${texInline(String.raw`|\lambda E-A|`)}，因为 ${texInline(String.raw`d_1\cdots d_n=D_n=|\lambda E-A|`)}。`,
    },
  ],
  summary: [
    `${texInline("A")} 与 ${texInline("B")} 相似 ${texInline(String.raw`\Leftrightarrow`)} ${texInline(String.raw`\lambda E-A`)} 与 ${texInline(String.raw`\lambda E-B`)} 等价。`,
    `${texInline(String.raw`\lambda E-A`)} 的不变因子称为 ${texInline("A")} 的不变因子；${texInline("A")} 与 ${texInline("B")} 相似 ${texInline(String.raw`\Leftrightarrow`)} 它们有相同的不变因子。`,
    "特征多项式只是不变因子的乘积，相同的特征多项式不能保证相似。",
  ],
});


;/* content/ch8-section5.js */
defineChapter8Section("elementary-divisors", {
  number: "§5",
  textbookSection: "初等因子",
  title: "初等因子",
  navTitle: "初等因子",
  question: "把不变因子拆成素因式的方幂，会得到什么？",
  goal: "会由不变因子求初等因子，也会由初等因子还原不变因子；知道初等因子依赖数域；掌握复矩阵相似当且仅当初等因子相同。",
  tags: ["初等因子", "素因式分解", "数域", "相似的判别"],
  intro:
    "不变因子是一列依次整除的多项式。把每一个分解成不可约因式的方幂，这些方幂就是初等因子。它们是更小的积木，下一节每一块会对应一个若尔当块。下面把积木拆开、再拼回去。",
  concepts: [
    { label: "初等因子", text: "不变因子分解后得到的全部不可约因式方幂（计重数）" },
    { label: "相似判别", text: `复矩阵 ${texInline(String.raw`A\sim B`)} ${texInline(String.raw`\Leftrightarrow`)} 初等因子相同` },
  ],
  textbook: { reference: "北大版《高等代数》第八章 §5", items: ["初等因子的定义", "由初等因子还原不变因子", "初等因子与相似", "用对角形求初等因子"] },
  interactive: { type: "slot", title: "初等因子积木" },
  lesson3d: {
    blocks: [
      {
        title: "初等因子",
        tex: String.raw`d_i(\lambda)=(\lambda-\lambda_1)^{k_{i1}}(\lambda-\lambda_2)^{k_{i2}}\cdots(\lambda-\lambda_r)^{k_{ir}},\qquad 0\le k_{1j}\le k_{2j}\le\cdots\le k_{nj}`,
        text: `在复数域上，把 ${texInline("A")} 的每个不变因子分解成一次因式的方幂。其中次数大于零的方幂 ${texInline(String.raw`(\lambda-\lambda_j)^{k_{ij}}`)}，按出现的次数计算重数，全体称为 ${texInline("A")} 的初等因子。由于 ${texInline("d_i")} 整除 ${texInline("d_{i+1}")}，同一个 ${texInline(String.raw`\lambda_j`)} 的幂次自上而下不减。`,
        ponder: {
          q: `在实数域上，${texInline(String.raw`\lambda^2+1`)} 能再分解吗？在复数域上呢？`,
          a: `实数域上不可约，它本身是一个初等因子；复数域上 ${texInline(String.raw`\lambda^2+1=(\lambda-\mathrm{i})(\lambda+\mathrm{i})`)}，拆成两个初等因子。初等因子依赖数域。`,
        },
      },
      {
        title: "初等因子与相似",
        tex: String.raw`A\sim B\iff A\ \text{与}\ B\ \text{有相同的初等因子}\quad(A,B\ \text{为}\ n\ \text{阶复矩阵})`,
        text: `初等因子连同阶数 ${texInline("n")} 能还原不变因子：把每个 ${texInline(String.raw`\lambda_j`)} 的方幂按次数从高到低排好，各取最高的相乘得 ${texInline("d_n")}，各取次高的相乘得 ${texInline("d_{n-1}")}，依此类推，不够的位置补 1。所以初等因子与不变因子包含同样多的信息，也是相似的完整判别。`,
        ponder: {
          q: `五阶复矩阵的初等因子是 ${texInline(String.raw`\lambda,\ \lambda,\ \lambda^2,\ \lambda-1`)}，不变因子是什么？`,
          a: `${texInline(String.raw`d_5=\lambda^2(\lambda-1)`)}，${texInline(String.raw`d_4=\lambda`)}，${texInline(String.raw`d_3=\lambda`)}，${texInline("d_2=d_1=1")}。`,
        },
      },
      {
        title: "用对角形求初等因子",
        tex: String.raw`\lambda E-A\simeq\operatorname{diag}(h_1(\lambda),\dots,h_n(\lambda))\ \Longrightarrow\ \text{各 }h_i\text{ 的素因式方幂全体就是初等因子}`,
        text: `${texInline(String.raw`\lambda E-A`)} 化成对角形以后，不必再整理成标准形：把每个对角元 ${texInline(String.raw`h_i(\lambda)`)} 分解成素因式的方幂，全部合在一起就是 ${texInline("A")} 的初等因子。例如 ${texInline(String.raw`\operatorname{diag}(\lambda,\lambda+1,\lambda(\lambda+1))`)} 的初等因子是 ${texInline(String.raw`\lambda,\ \lambda+1,\ \lambda,\ \lambda+1`)}。`,
      },
    ],
    pitfalls: [
      "把不同不变因子中同一个素因式的方幂相乘合并。它们分别计数，是不同的初等因子。",
      `由初等因子还原不变因子时把幂次相加。${texInline("d_n")} 只取每个素因式的最高次方幂。`,
      `不说明数域就数初等因子。${texInline(String.raw`\lambda^2+1`)} 在实数域上是一个，在复数域上是两个。`,
    ],
  },
  example: {
    title: "例题：由初等因子还原不变因子",
    question: `五阶复矩阵 ${texInline("A")} 的初等因子是 ${texInline(String.raw`\lambda,\ \lambda,\ \lambda^2,\ \lambda-1`)}。${texInline("A")} 的不变因子是什么？`,
    choices: [
      { correct: true, text: texInline(String.raw`1,\ 1,\ \lambda,\ \lambda,\ \lambda^2(\lambda-1)`) },
      { text: texInline(String.raw`1,\ 1,\ 1,\ \lambda,\ \lambda^3(\lambda-1)`) },
      { text: texInline(String.raw`1,\ 1,\ 1,\ \lambda^2,\ \lambda^2(\lambda-1)`) },
      { text: texInline(String.raw`\lambda,\ \lambda,\ \lambda^2,\ \lambda-1,\ 1`) },
    ],
    steps: [
      `${texInline(String.raw`\lambda`)} 的方幂从高到低是 ${texInline(String.raw`\lambda^2,\ \lambda,\ \lambda`)}，${texInline(String.raw`\lambda-1`)} 的方幂只有 ${texInline(String.raw`\lambda-1`)}。`,
      `各取最高次：${texInline(String.raw`d_5=\lambda^2(\lambda-1)`)}；再取次高：${texInline(String.raw`d_4=\lambda`)}；再下一层：${texInline(String.raw`d_3=\lambda`)}；其余 ${texInline("d_2=d_1=1")}。`,
      `把 ${texInline(String.raw`\lambda`)} 与 ${texInline(String.raw`\lambda^2`)} 合成 ${texInline(String.raw`\lambda^3`)} 会改变初等因子；${texInline(String.raw`1,1,1,\lambda^2,\lambda^2(\lambda-1)`)} 的初等因子是 ${texInline(String.raw`\lambda^2,\ \lambda^2,\ \lambda-1`)}；${texInline(String.raw`\lambda,\lambda,\lambda^2,\lambda-1,1`)} 那一组不满足依次整除（${texInline(String.raw`\lambda^2`)} 不整除 ${texInline(String.raw`\lambda-1`)}）。`,
    ],
  },
  quiz: [
    {
      question: `${texInline(String.raw`\lambda E-A`)} 等价于 ${texInline(String.raw`\operatorname{diag}(\lambda-1,(\lambda-1)(\lambda+2),\lambda+2)`)}，${texInline("A")} 的初等因子是什么？`,
      answer: `${texInline(String.raw`\lambda-1,\ \lambda-1,\ \lambda+2,\ \lambda+2`)}。对角形不必是标准形，把每个对角元分解即可。`,
    },
    {
      question: `三阶复矩阵的特征多项式是 ${texInline(String.raw`(\lambda-2)^3`)}，它的初等因子可能是哪几种？`,
      answer: `三种：${texInline(String.raw`(\lambda-2)^3`)}；${texInline(String.raw`(\lambda-2)^2,\ \lambda-2`)}；${texInline(String.raw`\lambda-2,\ \lambda-2,\ \lambda-2`)}。初等因子的次数之和等于 3，分法对应 3 的三种拆分。`,
    },
    {
      question: "两个复矩阵的特征多项式相同，初等因子一定相同吗？",
      answer: `不一定。${texInline("2E")} 的初等因子是 ${texInline(String.raw`\lambda-2,\ \lambda-2`)}，若尔当块 ${texInline("J(2,2)")} 的初等因子是 ${texInline(String.raw`(\lambda-2)^2`)}，特征多项式都是 ${texInline(String.raw`(\lambda-2)^2`)}。`,
    },
  ],
  summary: [
    "把每个不变因子分解成不可约因式的方幂，全部方幂（计重数）就是初等因子；它依赖数域。",
    `初等因子连同阶数能还原不变因子：${texInline("d_n")} 取各素因式的最高次方幂，${texInline("d_{n-1}")} 取次高的，依此类推。`,
    `复矩阵 ${texInline("A")} 与 ${texInline("B")} 相似 ${texInline(String.raw`\Leftrightarrow`)} 它们有相同的初等因子。`,
  ],
});


;/* content/ch8-section6.js */
defineChapter8Section("jordan-derivation", {
  number: "§6",
  textbookSection: "若尔当标准形的理论推导",
  title: "若尔当标准形的理论推导",
  navTitle: "若尔当标准形的推导",
  question: "为什么初等因子恰好对应若尔当块？",
  goal: `会求若尔当块与若尔当形矩阵的初等因子；掌握复矩阵相似于若尔当形矩阵，且块与初等因子一一对应；会用 ${texInline(String.raw`\operatorname{rank}(A-\lambda_0E)^j`)} 逐层数出块的个数与阶数。`,
  tags: ["若尔当块", "初等因子", "若尔当标准形", "核空间的维数"],
  intro:
    `一个若尔当块的特征矩阵只有一个初等因子，块拼起来，初等因子也拼起来。于是只要读出 ${texInline("A")} 的初等因子，就知道它的若尔当形。块的大小还能从 ${texInline(String.raw`\ker(A-\lambda_0E)^j`)} 一层层的维数看出来，下面把它搭成一座塔。`,
  concepts: [
    { label: "若尔当块", text: texInline(String.raw`\lambda E-J(\lambda_0,k)\simeq\operatorname{diag}(1,\dots,1,(\lambda-\lambda_0)^k)`) },
    { label: "块数", text: texInline(String.raw`\#\{\text{阶}\ge j\}=\nu_j-\nu_{j-1}`) },
  ],
  textbook: { reference: "北大版《高等代数》第八章 §6", items: ["若尔当块的初等因子", "若尔当形矩阵的初等因子", "复矩阵相似于若尔当形矩阵"] },
  interactive: { type: "slot", title: "核空间一层一层长高" },
  lesson3d: {
    blocks: [
      {
        title: "若尔当块的初等因子",
        tex: String.raw`J(\lambda_0,k)=\begin{pmatrix}\lambda_0&&&\\1&\lambda_0&&\\&\ddots&\ddots&\\&&1&\lambda_0\end{pmatrix},\qquad \lambda E-J(\lambda_0,k)\simeq\begin{pmatrix}1&&&\\&\ddots&&\\&&1&\\&&&(\lambda-\lambda_0)^k\end{pmatrix}`,
        text: `${texInline(String.raw`|\lambda E-J|=(\lambda-\lambda_0)^k`)}，所以 ${texInline(String.raw`D_k=(\lambda-\lambda_0)^k`)}。去掉第一行和最后一列，剩下的 ${texInline("k-1")} 阶子式是对角线全为 ${texInline("-1")} 的三角形行列式，等于 ${texInline("(-1)^{k-1}")}，所以 ${texInline("D_{k-1}=1")}，从而 ${texInline(String.raw`D_1=\cdots=D_{k-1}=1`)}。${texInline(String.raw`J(\lambda_0,k)`)} 只有一个初等因子 ${texInline(String.raw`(\lambda-\lambda_0)^k`)}。`,
        ponder: {
          q: `若尔当块 ${texInline(String.raw`J(\lambda_0,k)`)} 的最小多项式是什么？`,
          a: `${texInline(String.raw`(\lambda-\lambda_0)^k`)}。它是最后一个不变因子；也可以看链 ${texInline(String.raw`\varepsilon_1\to\varepsilon_2\to\cdots\to\varepsilon_k\to0`)}，${texInline(String.raw`(J-\lambda_0E)^{k-1}\varepsilon_1=\varepsilon_k\ne0`)}。`,
        },
      },
      {
        title: "复矩阵的若尔当标准形",
        tex: String.raw`A\sim J=\begin{pmatrix}J(\lambda_1,k_1)&&\\&\ddots&\\&&J(\lambda_s,k_s)\end{pmatrix}\iff A\ \text{的初等因子是}\ (\lambda-\lambda_1)^{k_1},\dots,(\lambda-\lambda_s)^{k_s}`,
        text: `若尔当形矩阵 ${texInline("J")} 的特征矩阵等价于把各块的标准形拼成的对角形，由上一节，${texInline("J")} 的初等因子就是各块初等因子的全体。任给复矩阵 ${texInline("A")}，按它的初等因子 ${texInline(String.raw`(\lambda-\lambda_i)^{k_i}`)} 写出若尔当块并拼成 ${texInline("J")}，${texInline("A")} 与 ${texInline("J")} 的初等因子相同，所以相似。除去块的排列次序，${texInline("J")} 由 ${texInline("A")} 唯一决定。`,
      },
      {
        title: "逐层数出块的大小",
        tex: String.raw`\nu_j=\dim\ker(A-\lambda_0E)^j,\qquad \#\{\lambda_0\ \text{的块中阶数}\ge j\ \text{的}\}=\nu_j-\nu_{j-1}=\operatorname{rank}(A-\lambda_0E)^{j-1}-\operatorname{rank}(A-\lambda_0E)^j`,
        text: `记 ${texInline(String.raw`N=A-\lambda_0E`)}。每个属于 ${texInline(String.raw`\lambda_0`)} 的 ${texInline("k")} 阶块给出一条链 ${texInline(String.raw`\varepsilon_1\to\varepsilon_2\to\cdots\to\varepsilon_k\to0`)}，第 ${texInline("j")} 层的向量落在 ${texInline(String.raw`\ker N^j`)} 中、不落在 ${texInline(String.raw`\ker N^{j-1}`)} 中。所以 ${texInline(String.raw`\ker N^j`)} 比 ${texInline(String.raw`\ker N^{j-1}`)} 多出的维数，正是阶数不小于 ${texInline("j")} 的块的个数。不求初等因子，只算几个秩，也能写出若尔当形。`,
        ponder: {
          q: `${texInline(String.raw`\nu_1=2`)}，${texInline(String.raw`\nu_2=3`)}，${texInline(String.raw`\nu_3=4=n`)}，块的阶数是多少？`,
          a: `${texInline("b_1=2")}，${texInline("b_2=1")}，${texInline("b_3=1")}：两个块，其中一个的阶数至少是 3，所以是 3 阶与 1 阶。`,
        },
      },
    ],
    pitfalls: [
      `把若尔当块写成上三角。本书的若尔当块中 1 在主对角线下方，对应链 ${texInline(String.raw`(J-\lambda_0E)\varepsilon_i=\varepsilon_{i+1}`)}。`,
      `只看 ${texInline(String.raw`\operatorname{rank}(A-\lambda_0E)`)} 就断定块的大小。它只给出块的个数，阶数要看更高次幂的秩。`,
      `把初等因子 ${texInline(String.raw`(\lambda-2)^2`)} 与两个 ${texInline(String.raw`\lambda-2`)} 混为一谈。前者是一个 2 阶块，后者是两个 1 阶块。`,
    ],
  },
  example: {
    title: "例题：由不变因子写出若尔当形",
    question: `三阶复矩阵 ${texInline("A")} 的不变因子是 ${texInline(String.raw`1,\ \lambda-1,\ (\lambda-1)^2`)}。${texInline("A")} 的若尔当标准形是哪一个？`,
    choices: [
      { correct: true, text: texInline(String.raw`\begin{pmatrix}1&0&0\\1&1&0\\0&0&1\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&0&0\\1&1&0\\0&1&1\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&0&0\\0&1&0\\0&0&1\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&0&0\\1&1&0\\0&0&2\end{pmatrix}`) },
    ],
    steps: [
      `初等因子是 ${texInline(String.raw`\lambda-1,\ (\lambda-1)^2`)}，对应若尔当块 ${texInline("J(1,1)")} 与 ${texInline("J(1,2)")}。`,
      `拼起来是 ${texInline(String.raw`\operatorname{diag}(J(1,2),J(1,1))`)}，即 ${texInline(String.raw`\begin{pmatrix}1&0&0\\1&1&0\\0&0&1\end{pmatrix}`)}（块的次序可以交换）。`,
      `主对角线下方有两个 1 的那一个是 ${texInline("J(1,3)")}，初等因子为 ${texInline(String.raw`(\lambda-1)^3`)}；单位矩阵的初等因子是三个 ${texInline(String.raw`\lambda-1`)}；右下角为 2 的那一个，特征多项式是 ${texInline(String.raw`(\lambda-1)^2(\lambda-2)`)}。`,
    ],
  },
  quiz: [
    {
      question: `用初等因子怎样判断复矩阵 ${texInline("A")} 能否对角化？`,
      answer: `${texInline("A")} 可对角化当且仅当它的初等因子全是一次的，此时每个若尔当块都是 1 阶。`,
    },
    {
      question: `若尔当形中属于 ${texInline(String.raw`\lambda_0`)} 的块数，与 ${texInline(String.raw`\lambda_0`)} 的特征向量有什么关系？`,
      answer: `块数等于 ${texInline(String.raw`\dim\ker(A-\lambda_0E)`)}，即属于 ${texInline(String.raw`\lambda_0`)} 的线性无关特征向量的最大个数：每个块恰好贡献一个特征向量。`,
    },
    {
      question: `四阶矩阵 ${texInline("A")} 只有特征值 2，${texInline(String.raw`\operatorname{rank}(A-2E)=2`)}，${texInline("(A-2E)^2=0")}。写出 ${texInline("A")} 的若尔当形。`,
      answer: `${texInline(String.raw`\nu_1=2`)}，${texInline(String.raw`\nu_2=4`)}，两个块且都不超过 2 阶，阶数之和为 4，所以是 ${texInline(String.raw`\operatorname{diag}(J(2,2),J(2,2))`)}。`,
    },
  ],
  summary: [
    `若尔当块 ${texInline(String.raw`J(\lambda_0,k)`)} 的特征矩阵只有一个初等因子 ${texInline(String.raw`(\lambda-\lambda_0)^k`)}。`,
    `复矩阵相似于若尔当形矩阵，每个初等因子 ${texInline(String.raw`(\lambda-\lambda_i)^{k_i}`)} 对应一个块 ${texInline(String.raw`J(\lambda_i,k_i)`)}，除次序外唯一。`,
    `${texInline(String.raw`\nu_j=\dim\ker(A-\lambda_0E)^j`)} 逐层增长，${texInline(String.raw`\nu_j-\nu_{j-1}`)} 是阶数不小于 ${texInline("j")} 的块的个数。`,
  ],
});


;/* content/ch8-section7.js */
defineChapter8Section("rational-canonical-form", {
  number: "§7",
  textbookSection: "矩阵的有理标准形",
  title: "矩阵的有理标准形",
  navTitle: "有理标准形",
  question: `不求特征值，能写出一个与 ${texInline("A")} 相似的标准矩阵吗？`,
  goal: `会写多项式的伴随矩阵，知道它的不变因子是 ${texInline(String.raw`1,\dots,1,d(\lambda)`)}；掌握数域 ${texInline("P")} 上的矩阵相似于由不变因子的伴随矩阵组成的有理标准形。`,
  tags: ["伴随矩阵", "弗罗贝尼乌斯块", "有理标准形", "任意数域"],
  intro:
    `若尔当形要求把特征多项式分解成一次因式，在有理数域或实数域上常常做不到。不变因子本身就是数域 ${texInline("P")} 上的多项式，每个不变因子写成一个伴随矩阵，拼起来就得到不必分解因式的标准形。`,
  concepts: [
    { label: "伴随矩阵", text: `${texInline(String.raw`d(\lambda)`)} 的伴随矩阵的不变因子为 ${texInline(String.raw`1,\dots,1,d(\lambda)`)}` },
    { label: "有理标准形", text: `${texInline("A")} 相似于各个非常数不变因子的伴随矩阵拼成的准对角矩阵` },
  ],
  textbook: { reference: "北大版《高等代数》第八章 §7", items: ["多项式的伴随矩阵", "伴随矩阵的不变因子", "有理标准形的存在与唯一"] },
  interactive: { type: "slot", title: "伴随矩阵：平移加反馈" },
  lesson3d: {
    blocks: [
      {
        title: "伴随矩阵",
        tex: String.raw`d(\lambda)=\lambda^n+a_{n-1}\lambda^{n-1}+\cdots+a_1\lambda+a_0,\qquad C=\begin{pmatrix}0&0&\cdots&0&-a_0\\1&0&\cdots&0&-a_1\\0&1&\cdots&0&-a_2\\\vdots&&\ddots&&\vdots\\0&0&\cdots&1&-a_{n-1}\end{pmatrix}`,
        text: `${texInline("C")} 称为 ${texInline(String.raw`d(\lambda)`)} 的伴随矩阵。${texInline(String.raw`|\lambda E-C|=d(\lambda)`)}；去掉 ${texInline(String.raw`\lambda E-C`)} 的第一行和最后一列，剩下的 ${texInline("n-1")} 阶子式是对角线全为 ${texInline("-1")} 的三角形行列式，所以 ${texInline("D_{n-1}=1")}。于是 ${texInline(String.raw`\lambda E-C`)} 的不变因子是 ${texInline(String.raw`1,\dots,1,d(\lambda)`)}，${texInline("C")} 的最小多项式就是 ${texInline(String.raw`d(\lambda)`)}。`,
        ponder: {
          q: `实矩阵 ${texInline("A")} 的特征多项式是 ${texInline(String.raw`\lambda^2+1`)}，写出一个与它相似的实矩阵。`,
          a: `${texInline(String.raw`\lambda^2+1`)} 在实数域上不可约，${texInline("A")} 的不变因子只能是 ${texInline(String.raw`1,\ \lambda^2+1`)}，有理标准形是伴随矩阵 ${texInline(String.raw`\begin{pmatrix}0&-1\\1&0\end{pmatrix}`)}。`,
        },
      },
      {
        title: "有理标准形",
        tex: String.raw`A\sim\begin{pmatrix}C(d_{k+1})&&\\&\ddots&\\&&C(d_n)\end{pmatrix},\qquad d_{k+1}\mid d_{k+2}\mid\cdots\mid d_n`,
        text: `设 ${texInline("A")} 是数域 ${texInline("P")} 上的 ${texInline("n")} 阶矩阵，${texInline(String.raw`d_1=\cdots=d_k=1`)}，${texInline(String.raw`d_{k+1},\dots,d_n`)} 是次数大于零的不变因子。把它们的伴随矩阵依次拼成准对角矩阵，拼成的矩阵与 ${texInline("A")} 有相同的不变因子，所以与 ${texInline("A")} 相似，而且由 ${texInline("A")} 唯一决定。整个过程只用到 ${texInline("P")} 上的多项式运算。例如不变因子为 ${texInline(String.raw`1,\ \lambda+1,\ \lambda^2-\lambda-2`)} 时，有理标准形是 ${texInline(String.raw`\operatorname{diag}\bigl((-1),\begin{pmatrix}0&2\\1&1\end{pmatrix}\bigr)`)}。`,
        ponder: {
          q: `${texInline("A")} 的有理标准形只有一个块，说明什么？`,
          a: `${texInline("A")} 的不变因子是 ${texInline(String.raw`1,\dots,1,f(\lambda)`)}，最小多项式等于特征多项式。`,
        },
      },
    ],
    pitfalls: [
      `把伴随矩阵最后一列写成 ${texInline(String.raw`a_0,\ a_1,\ \dots`)}。应当是 ${texInline(String.raw`-a_0,\ -a_1,\ \dots,\ -a_{n-1}`)}。`,
      "用初等因子拼伴随块。有理标准形用的是不变因子，每个次数大于零的不变因子一块。",
      "以为写有理标准形要先求特征值。它只需要不变因子，在任何数域上都能写出。",
    ],
  },
  example: {
    title: "例题：写出有理标准形",
    question: `三阶矩阵 ${texInline("A")} 的不变因子是 ${texInline(String.raw`1,\ \lambda-1,\ (\lambda-1)(\lambda+2)`)}。${texInline("A")} 的有理标准形是哪一个？`,
    choices: [
      { correct: true, text: texInline(String.raw`\begin{pmatrix}1&0&0\\0&0&2\\0&1&-1\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&0&0\\0&0&-2\\0&1&1\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&0&0\\0&1&0\\0&0&-2\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}0&0&-2\\1&0&3\\0&1&0\end{pmatrix}`) },
    ],
    steps: [
      `次数大于零的不变因子是 ${texInline(String.raw`\lambda-1`)} 与 ${texInline(String.raw`(\lambda-1)(\lambda+2)=\lambda^2+\lambda-2`)}。`,
      `${texInline(String.raw`\lambda-1`)} 的伴随矩阵是 ${texInline("(1)")}；${texInline(String.raw`\lambda^2+\lambda-2`)} 中 ${texInline("a_0=-2,\\ a_1=1")}，伴随矩阵是 ${texInline(String.raw`\begin{pmatrix}0&2\\1&-1\end{pmatrix}`)}。拼起来得 ${texInline(String.raw`\begin{pmatrix}1&0&0\\0&0&2\\0&1&-1\end{pmatrix}`)}。`,
      `最后一列为 ${texInline(String.raw`(0,-2,1)^T`)} 的那一个没有变号；${texInline(String.raw`\operatorname{diag}(1,1,-2)`)} 是若尔当形，它与 ${texInline("A")} 相似，但不是有理标准形；左下方是 1、最后一列为 ${texInline(String.raw`(-2,3,0)^T`)} 的那一个是特征多项式 ${texInline(String.raw`\lambda^3-3\lambda+2`)} 的伴随矩阵，它的不变因子是 ${texInline(String.raw`1,1,(\lambda-1)^2(\lambda+2)`)}，与 ${texInline("A")} 不相似。`,
    ],
  },
  quiz: [
    {
      question: "有理标准形与若尔当标准形相比，有什么优点？",
      answer: "有理标准形只用不变因子，在任何数域上都存在，不需要把特征多项式分解成一次因式。",
    },
    {
      question: `${texInline("A")} 的有理标准形中最后一块是谁的伴随矩阵？它与 ${texInline("A")} 的最小多项式有什么关系？`,
      answer: `是最后一个不变因子 ${texInline(String.raw`d_n(\lambda)`)} 的伴随矩阵，而 ${texInline(String.raw`d_n(\lambda)`)} 就是 ${texInline("A")} 的最小多项式。`,
    },
    {
      question: "两个有理数矩阵在复数域上相似，它们在有理数域上也相似吗？",
      answer: `相似。不变因子由子式的最大公因式算出，不随数域扩大而改变；两者的有理标准形相同，相似矩阵 ${texInline("X")} 可以取有理矩阵。`,
    },
  ],
  summary: [
    `${texInline(String.raw`d(\lambda)`)} 的伴随矩阵：次对角线上是 1，最后一列是 ${texInline(String.raw`-a_0,\dots,-a_{n-1}`)}；它的不变因子是 ${texInline(String.raw`1,\dots,1,d(\lambda)`)}。`,
    `数域 ${texInline("P")} 上的矩阵相似于由它的非常数不变因子的伴随矩阵拼成的有理标准形，且唯一。`,
    "有理标准形不必分解因式，在任何数域上都能写出。",
  ],
});


;/* content/ch8.js */
registerAlgebraChapter({
  id: "ch8",
  icon: "8",
  title: "第八章 λ-矩阵",
  subtitle: "相似的完整判别",
  summary:
    `把矩阵 ${texInline("A")} 换成 ${texInline(String.raw`\lambda`)}-矩阵 ${texInline(String.raw`\lambda E-A`)}，就能对所有 ${texInline(String.raw`\lambda`)} 一起做初等变换。${texInline(String.raw`\lambda`)}-矩阵经初等变换化成对角的标准形，对角线上的不变因子由行列式因子唯一确定。两个矩阵相似，当且仅当它们的特征矩阵有相同的不变因子。把不变因子分解成初等因子，就读出若尔当标准形；直接用不变因子的系数，就写出有理标准形。`,
  sections: [
    { id: "lambda-matrix", number: "§1", title: "λ-矩阵", navTitle: "λ-矩阵" },
    { id: "smith-form", number: "§2", title: "λ-矩阵在初等变换下的标准形", navTitle: "λ-矩阵的标准形" },
    { id: "invariant-factors", number: "§3", title: "不变因子", navTitle: "不变因子" },
    { id: "similarity-criterion", number: "§4", title: "矩阵相似的条件", navTitle: "矩阵相似的条件" },
    { id: "elementary-divisors", number: "§5", title: "初等因子", navTitle: "初等因子" },
    { id: "jordan-derivation", number: "§6", title: "若尔当标准形的理论推导", navTitle: "若尔当标准形的推导" },
    { id: "rational-canonical-form", number: "§7", title: "矩阵的有理标准形", navTitle: "有理标准形" },
  ],
});


;/* content/ch8-assemble.js */
/* Apply Chapter 8 section patches after ch8.js registration. */
(() => {
  const chapter = algebraContent.chapters.find((item) => item.id === "ch8");
  const patches = window.getChapter8SectionPatches?.();
  if (!chapter || !patches) return;

  chapter.sections = chapter.sections.map((stub) => {
    const patch = patches.get(stub.id);
    if (!patch) {
      console.warn("Missing Chapter 8 section patch:", stub.id);
      return stub;
    }
    return { ...stub, ...patch, id: stub.id };
  });
})();


;/* content/ch9.js */
(() => {
  const t = (source) => texInline(source);
  const reference = "北大版《高等代数》第九章";
  const lab = (title) => ({ type: "slot", title });

  const sections = [
    {
      id: "inner-product-geometry",
      number: "§1",
      textbookSection: "定义与基本性质",
      title: "定义与基本性质",
      navTitle: "定义与基本性质",
      question: "线性空间里的“长度”和“垂直”从哪里来？换一个内积，它们会怎样变？",
      goal: "理解欧氏空间的定义与度量矩阵；会用内积计算长度、夹角，判断正交；知道换内积会改变正交关系。",
      tags: ["内积", "度量矩阵", "长度与夹角", "柯西–布涅柯夫斯基不等式"],
      intro:
        "线性空间只规定了加法和数乘，长度与角度要另外给出。欧氏空间是带有内积的实线性空间，内积对称、线性、正定；长度、夹角和正交都由它算出。换一个内积，单位圆变成椭圆，正交方向也跟着变。",
      concepts: [
        { label: "欧氏空间", text: `实线性空间 ${t("V")} 上取定一个对称、线性、正定的二元实函数 ${t("(\\alpha,\\beta)")}。` },
        { label: "度量矩阵", text: `${t("G=((\\varepsilon_i,\\varepsilon_j))")}，${t("(\\alpha,\\beta)=X^TGY")}。` },
      ],
      textbook: { reference, items: ["欧几里得空间的定义", "长度、夹角与正交", "度量矩阵"] },
      interactive: lab("度量矩阵 G 决定什么叫“垂直”"),
      lesson9: {
        blocks: [
          {
            title: "欧氏空间与度量矩阵",
            tex: String.raw`(\alpha,\beta)=X^TGY,\qquad G=\big((\varepsilon_i,\varepsilon_j)\big)`,
            text: `内积满足 ${t("(\\alpha,\\beta)=(\\beta,\\alpha)")}、对第一个变量线性、${t("(\\alpha,\\alpha)\\ge0")} 且只在 ${t("\\alpha=0")} 时为 0。取定基后，内积完全由度量矩阵 ${t("G")} 决定，${t("G")} 是正定矩阵；反过来，任一正定矩阵都给出一个内积。换基 ${t("(\\eta_1,\\dots,\\eta_n)=(\\varepsilon_1,\\dots,\\varepsilon_n)C")} 时，新的度量矩阵是 ${t("C^TGC")}，与 ${t("G")} 合同。`,
          },
          {
            title: "柯西–布涅柯夫斯基不等式",
            tex: String.raw`|(\alpha,\beta)|\le|\alpha|\,|\beta|`,
            text: `等号成立当且仅当 ${t(String.raw`\alpha`)}、${t(String.raw`\beta`)} 线性相关。它保证 ${t("\\cos\\langle\\alpha,\\beta\\rangle=\\frac{(\\alpha,\\beta)}{|\\alpha||\\beta|}")} 落在 ${t("[-1,1]")} 里，于是非零向量的夹角有意义。`,
          },
          {
            title: "正交与勾股定理",
            text: `${t("(\\alpha,\\beta)=0")} 时称 ${t(String.raw`\alpha`)} 与 ${t(String.raw`\beta`)} 正交，此时 ${t("|\\alpha+\\beta|^2=|\\alpha|^2+|\\beta|^2")}。零向量与每个向量正交。`,
          },
        ],
        pitfalls: [
          "默认“点积为 0 才叫正交”。换了内积，正交要用新的内积判断。",
          `只验证对称性和线性，漏掉正定性：要对一切 ${t(String.raw`\alpha\ne0`)} 都有 ${t(String.raw`(\alpha,\alpha)>0`)}。`,
          "给零向量算夹角。零向量与任何向量正交，但夹角只对非零向量定义。",
        ],
      },
      example: {
        title: "例题：在新内积下找正交的单位向量",
        question: `在 ${t("\\mathbb R^2")} 中取度量矩阵 ${t("G=\\begin{bmatrix}2&1\\\\1&1\\end{bmatrix}")}，即 ${t("(\\alpha,\\beta)=2a_1b_1+a_1b_2+a_2b_1+a_2b_2")}。求与 ${t("\\alpha=(1,0)")} 正交的单位向量。`,
        choices: [
          { correct: true, text: t("\\pm\\tfrac{1}{\\sqrt2}(1,-2)") },
          { text: t("\\pm(0,1)") },
          { text: t("\\pm\\tfrac{1}{\\sqrt5}(1,-2)") },
          { text: t("\\pm(1,-2)") },
        ],
        steps: [
          `${t("(\\alpha,\\beta)=(1,0)G\\beta=2b_1+b_2")}，正交要求 ${t("b_2=-2b_1")}，所以 ${t("\\beta=k(1,-2)")}。`,
          `${t("(\\beta,\\beta)=k^2\\,(1,-2)G(1,-2)^T=k^2\\cdot2")}。`,
          `令它等于 1，得 ${t("k=\\pm\\tfrac1{\\sqrt2}")}。`,
          `${t("(0,1)")} 与 ${t(String.raw`\alpha`)} 的普通点积为 0，但 ${t("(\\alpha,(0,1))=1")}；${t("\\tfrac1{\\sqrt5}")} 是按普通长度单位化的结果，在这个内积下长度为 ${t("\\sqrt{2/5}")}。`,
        ],
      },
      quiz: [
        {
          question: `${t("(\\alpha,\\beta)=a_1b_1-a_2b_2")} 能作为 ${t("\\mathbb R^2")} 上的内积吗？`,
          answer: `不能。它对称、线性，但 ${t(String.raw`\alpha=(0,1)`)} 时 ${t(String.raw`(\alpha,\alpha)=-1<0`)}，正定性不成立。`,
        },
        {
          question: `在某个欧氏空间里 ${t("|\\alpha|=|\\beta|=1")}，并且 ${t("(\\alpha,\\beta)=1")}。${t(String.raw`\alpha`)} 与 ${t(String.raw`\beta`)} 有什么关系？`,
          answer: `柯西–布涅柯夫斯基不等式取等号，${t(String.raw`\alpha`)}、${t(String.raw`\beta`)} 线性相关，${t(String.raw`\beta=k\alpha`)}；再由 ${t(String.raw`(\alpha,\beta)=k=1`)} 得 ${t(String.raw`\beta=\alpha`)}。`,
        },
        {
          question: `两组基下的度量矩阵 ${t("G")} 与 ${t("B")} 有什么关系？它们的行列式一定相等吗？`,
          answer: `${t("B=C^TGC")}，${t("C")} 是过渡矩阵，二者合同。${t(String.raw`\det B=(\det C)^2\cdot\det G`)}，一般不相等，但符号相同（都为正）。`,
        },
        {
          question: `实验里换成 ${t(String.raw`G=\operatorname{diag}(1,4)`)} 以后，${t("u=(1,1)")} 与 ${t("v=(1,-1)")} 在屏幕上看起来垂直。它们正交吗？`,
          answer: `不正交，${t("(u,v)=1-4=-3")}。屏幕上的直角是按普通点积看的；这个空间的正交要用 ${t("G")} 计算，与 ${t("u")} 正交的方向是 ${t("(4,-1)")}。`,
        },
      ],
      summary: [
        "欧氏空间 = 实线性空间 + 内积（对称、线性、正定）；长度、夹角、正交都由内积算出。",
        `取定基后 ${t(String.raw`(\alpha,\beta)=X^TGY`)}，度量矩阵 ${t("G")} 正定；换基时变成合同的 ${t("C^TGC")}。`,
        "换一个内积，单位圆变成椭圆，正交方向也随之改变。",
      ],
    },
    {
      id: "orthonormal-bases",
      number: "§2",
      textbookSection: "标准正交基",
      title: "标准正交基",
      navTitle: "标准正交基",
      question: "怎样把任意一组基改造成标准正交基？第三个向量要减掉什么？",
      goal: "理解标准正交基下坐标就是内积；掌握施密特正交化，看清每一步减去的投影；知道标准正交基之间的过渡矩阵是正交矩阵。",
      tags: ["标准正交基", "施密特正交化", "投影", "正交矩阵"],
      intro:
        "在标准正交基下，度量矩阵是单位矩阵，坐标就是内积。施密特正交化把任意一组基逐个改造成这样的基：每一步减去新向量在已造好的子空间上的投影，剩下的部分与前面全部正交，再单位化。",
      concepts: [
        { label: "标准正交基", text: `${t("(\\varepsilon_i,\\varepsilon_j)=\\delta_{ij}")}，此时 ${t("\\alpha=\\sum(\\alpha,\\varepsilon_i)\\varepsilon_i")}。` },
        { label: "施密特正交化", text: "逐个减去在前面向量所张子空间上的投影，再单位化。" },
      ],
      textbook: { reference, items: ["正交向量组", "标准正交基与坐标", "施密特正交化", "正交矩阵"] },
      interactive: lab("施密特正交化的第三步：减去平面上的投影"),
      lesson9: {
        blocks: [
          {
            title: "标准正交基下的坐标与内积",
            tex: String.raw`\alpha=\sum_{i=1}^n(\alpha,\varepsilon_i)\,\varepsilon_i,\qquad (\alpha,\beta)=x_1y_1+\cdots+x_ny_n`,
            text: "坐标不用解方程，直接取内积；内积也变成坐标的普通点积。正交向量组中的非零向量线性无关。",
          },
          {
            title: "施密特正交化",
            tex: String.raw`\beta_k=\alpha_k-\sum_{j<k}\frac{(\alpha_k,\beta_j)}{(\beta_j,\beta_j)}\beta_j,\qquad \eta_k=\frac{\beta_k}{|\beta_k|}`,
            text: `减去的和式是 ${t("\\alpha_k")} 在 ${t("\\operatorname{span}\\{\\beta_1,\\dots,\\beta_{k-1}\\}")} 上的投影；正因为 ${t("\\beta_j")} 两两正交，它才能逐项相加。每一步都有 ${t("\\operatorname{span}\\{\\beta_1,\\dots,\\beta_k\\}=\\operatorname{span}\\{\\alpha_1,\\dots,\\alpha_k\\}")}。`,
          },
          {
            title: "标准正交基之间的过渡矩阵",
            text: `若 ${t("\\varepsilon_1,\\dots,\\varepsilon_n")} 与 ${t("\\eta_1,\\dots,\\eta_n")} 都是标准正交基，${t("(\\eta_1,\\dots,\\eta_n)=(\\varepsilon_1,\\dots,\\varepsilon_n)T")}，则 ${t("T^TT=E")}，${t("T")} 是正交矩阵。`,
          },
        ],
        pitfalls: [
          `用原向量 ${t(String.raw`\alpha_1`)}、${t(String.raw`\alpha_2`)} 代替 ${t(String.raw`\beta_1`)}、${t(String.raw`\beta_2`)} 求投影。${t(String.raw`\alpha_1`)}、${t(String.raw`\alpha_2`)} 不正交时，逐项相加会多减。`,
          "忘记最后单位化，得到的只是正交基。",
          `${t(String.raw`\beta_k=0`)} 时继续往下算。这说明 ${t(String.raw`\alpha_k`)} 可由前面的向量线性表出，原向量组线性相关。`,
        ],
      },
      example: {
        title: "例题：第三个向量的正交化",
        question: `对 ${t("\\alpha_1=(1,1,1)")}，${t("\\alpha_2=(0,1,1)")}，${t("\\alpha_3=(0,0,1)")} 作施密特正交化。单位化之前的 ${t("\\beta_3")} 是多少？`,
        choices: [
          { correct: true, text: t("\\beta_3=(0,-\\tfrac12,\\tfrac12)") },
          { text: t("\\beta_3=(-\\tfrac13,-\\tfrac56,\\tfrac16)") },
          { text: t("\\beta_3=(-\\tfrac13,-\\tfrac13,\\tfrac23)") },
          { text: `${t("\\beta_3=(0,0,1)")}，它已经与前两个向量正交` },
        ],
        steps: [
          `${t("\\beta_1=(1,1,1)")}；${t("\\beta_2=\\alpha_2-\\tfrac23\\beta_1=(-\\tfrac23,\\tfrac13,\\tfrac13)")}。`,
          `${t("(\\alpha_3,\\beta_1)=1,\\ (\\beta_1,\\beta_1)=3")}；${t("(\\alpha_3,\\beta_2)=\\tfrac13,\\ (\\beta_2,\\beta_2)=\\tfrac23")}。`,
          `${t("\\beta_3=\\alpha_3-\\tfrac13\\beta_1-\\tfrac12\\beta_2=(0,-\\tfrac12,\\tfrac12)")}，检验 ${t("(\\beta_3,\\beta_1)=(\\beta_3,\\beta_2)=0")}。`,
          `${t("(-\\tfrac13,-\\tfrac56,\\tfrac16)")} 是直接用 ${t("\\alpha_1,\\alpha_2")} 求投影的结果，${t("(-\\tfrac13,-\\tfrac13,\\tfrac23)")} 只减了 ${t("\\beta_1")} 方向；单位化得 ${t("\\eta_3=\\tfrac1{\\sqrt2}(0,-1,1)")}。`,
        ],
      },
      quiz: [
        {
          question: `把 ${t(String.raw`\alpha_1`)} 换成 ${t(String.raw`2\alpha_1`)} 再做施密特正交化，最后的标准正交基会变吗？`,
          answer: `不变。${t(String.raw`\beta_1`)} 变成 2 倍，但投影 ${t(String.raw`\tfrac{(\alpha_k,\beta_1)}{(\beta_1,\beta_1)}\beta_1`)} 不变，单位化后的 ${t(String.raw`\eta_1`)} 也不变。`,
        },
        {
          question: `交换 ${t(String.raw`\alpha_1`)}、${t(String.raw`\alpha_2`)} 的顺序，${t(String.raw`\eta_1`)} 一般会变吗？${t(String.raw`\operatorname{span}\{\eta_1,\eta_2\}`)} 呢？`,
          answer: `${t(String.raw`\eta_1`)} 变成 ${t(String.raw`\alpha_2`)} 的方向，一般会变；${t(String.raw`\operatorname{span}\{\eta_1,\eta_2\}=\operatorname{span}\{\alpha_1,\alpha_2\}`)} 不变。`,
        },
        {
          question: `实验中“沿平面看”时，${t(String.raw`\beta_3`)} 与 ${t(String.raw`\operatorname{span}\{\beta_1,\beta_2\}`)} 是什么关系？为什么第三步不能分别减去在 ${t(String.raw`\alpha_1`)}、${t(String.raw`\alpha_2`)} 上的投影？`,
          answer: `${t(String.raw`\beta_3`)} 垂直于整个平面。${t(String.raw`\alpha_1`)}、${t(String.raw`\alpha_2`)} 不正交，两个投影有重叠部分，相加会多减，剩下的向量与 ${t(String.raw`\alpha_1`)} 不正交。`,
        },
      ],
      summary: [
        "标准正交基下，坐标就是内积，度量矩阵是单位矩阵。",
        `施密特正交化：第 ${t("k")} 步减去 ${t(String.raw`\alpha_k`)} 在前 ${t("k-1")} 个向量所张子空间上的投影，再单位化。`,
        `投影能逐项相加，靠的是 ${t(String.raw`\beta_1,\dots,\beta_{k-1}`)} 两两正交。`,
      ],
    },
    {
      id: "euclidean-isomorphism",
      number: "§3",
      textbookSection: "同构",
      title: "同构",
      navTitle: "同构",
      question: `两个欧氏空间什么时候可以看成同一个？为什么每个 ${t("n")} 维欧氏空间都同构于 ${t(String.raw`\mathbb R^n`)}？`,
      goal: `理解欧氏空间同构要保持内积；知道坐标映射保持内积当且仅当所取的基标准正交；掌握“同构 ${t(String.raw`\Leftrightarrow`)} 维数相同”。`,
      tags: ["同构", "坐标映射", "度量矩阵", "标准正交基"],
      intro:
        `欧氏空间的同构是保持加法、数乘与内积的双射。取一组基，把向量映成坐标，得到 ${t("V")} 到 ${t(String.raw`\mathbb R^n`)} 的线性同构；它是否保持内积，看这组基的度量矩阵是不是单位矩阵。`,
      concepts: [
        { label: "同构", text: `双射 ${t(String.raw`\sigma`)} 满足 ${t("\\sigma(\\alpha+\\beta)=\\sigma\\alpha+\\sigma\\beta")}，${t("\\sigma(k\\alpha)=k\\sigma\\alpha")}，${t("(\\sigma\\alpha,\\sigma\\beta)=(\\alpha,\\beta)")}。` },
      ],
      textbook: { reference, items: ["欧氏空间同构的定义", "同构与维数"] },
      interactive: lab("坐标映射把 V 的单位圆送到哪里"),
      lesson9: {
        blocks: [
          {
            title: "坐标映射何时保持内积",
            tex: String.raw`(\alpha,\beta)=X^TBY,\qquad (\sigma\alpha,\sigma\beta)=X^TY`,
            text: `${t("B")} 是基 ${t("f_1,\\dots,f_n")} 的度量矩阵。两式对一切 ${t("X")}、${t("Y")} 相等 ${t(String.raw`\Leftrightarrow`)} ${t("B=E")} ${t(String.raw`\Leftrightarrow`)} ${t("f_1,\\dots,f_n")} 是标准正交基。`,
          },
          {
            title: "同构 ⇔ 维数相同",
            text: `每个 ${t("n")} 维欧氏空间都有标准正交基，用它作坐标就得到到 ${t("\\mathbb R^n")} 的同构。同构满足反身性、对称性和传递性，所以两个有限维欧氏空间同构当且仅当维数相同。`,
          },
        ],
        pitfalls: [
          "只验证线性和双射。线性同构可以改变长度和夹角。",
          `用“看起来垂直”判断基是否标准正交。${t("V")} 里的长度和角度要用 ${t("V")} 自己的内积计算。`,
        ],
      },
      example: {
        title: "例题：选一组基，使坐标映射保持内积",
        question: `${t("V")} 是 ${t("\\mathbb R^2")} 配上度量矩阵 ${t("G=\\begin{bmatrix}2&1\\\\1&1\\end{bmatrix}")} 的欧氏空间。用哪一组基作坐标，得到的坐标映射 ${t("V\\to\\mathbb R^2")}（普通点积）是同构？`,
        choices: [
          { correct: true, text: t("f_1=(0,1),\\ f_2=(1,-1)") },
          { text: t("f_1=(1,0),\\ f_2=(0,1)") },
          { text: t("f_1=(1,0),\\ f_2=(-1,2)") },
          { text: t("f_1=(1,1),\\ f_2=(1,-1)") },
        ],
        steps: [
          `坐标映射保持内积 ${t(String.raw`\Leftrightarrow`)} 这组基的度量矩阵 ${t("B=C^TGC=E")}。`,
          `${t("f_1=(0,1),\\ f_2=(1,-1)")}：${t("(f_1,f_1)=1,\\ (f_2,f_2)=1,\\ (f_1,f_2)=0")}，${t("B=E")}。`,
          `标准基：${t("(\\varepsilon_1,\\varepsilon_1)=2")}；${t("f_1=(1,0),\\ f_2=(-1,2)")} 正交但 ${t("B=2E")}，长度都是 ${t("\\sqrt2")}；${t("f_1=(1,1),\\ f_2=(1,-1)")} 按点积垂直，但 ${t("(f_1,f_2)=1")}。`,
        ],
      },
      quiz: [
        {
          question: "线性同构一定保持长度吗？",
          answer: `不一定。${t(String.raw`\mathbb R^2`)} 上 ${t(String.raw`\sigma(x_1,x_2)=(2x_1,x_2)`)} 是线性同构，却把 ${t("(1,0)")} 变成长度为 2 的向量。`,
        },
        {
          question: `${t(String.raw`\sigma`)} 是线性双射并且保持每个向量的长度，它一定保持内积吗？`,
          answer: `一定。${t(String.raw`(\alpha,\beta)=\tfrac12(|\alpha+\beta|^2-|\alpha|^2-|\beta|^2)`)}，右边只用到长度。`,
        },
        {
          question: `${t(String.raw`\mathbb R^3`)}（普通点积）与次数小于 3 的实多项式空间（内积 ${t(String.raw`(f,g)=\int_0^1f(x)g(x)\,dx`)}）同构吗？`,
          answer: `同构：两者都是 3 维欧氏空间。对 ${t(String.raw`1,\ x,\ x^2`)} 做施密特正交化得到标准正交基，用它作坐标即可。`,
        },
        {
          question: `实验中 ${t("f_1")}、${t("f_2")} 按 ${t("G")} 正交，但长度都是 ${t(String.raw`\sqrt2`)}。${t(String.raw`\sigma`)} 把 ${t("V")} 的单位椭圆送到什么？`,
          answer: `${t("B=2E")}，像是 ${t(String.raw`\{y:\ 2y^Ty=1\}`)}，即半径 ${t(String.raw`1/\sqrt2`)} 的圆：形状对了，大小差一个倍数，${t(String.raw`\sigma`)} 仍不保持内积。`,
        },
      ],
      summary: [
        "欧氏空间的同构 = 线性双射 + 保持内积。",
        `坐标映射保持内积 ${t(String.raw`\Leftrightarrow`)} 所取基的度量矩阵为 ${t("E")} ${t(String.raw`\Leftrightarrow`)} 基标准正交。`,
        `有限维欧氏空间同构 ${t(String.raw`\Leftrightarrow`)} 维数相同；每个 ${t("n")} 维欧氏空间都同构于 ${t(String.raw`\mathbb R^n`)}。`,
      ],
    },
    {
      id: "orthogonal-transformations",
      number: "§4",
      textbookSection: "正交变换",
      title: "正交变换",
      navTitle: "正交变换",
      question: "一个线性变换怎样才算只“搬动”图形，不改变它的形状和大小？",
      goal: `理解正交变换的四个等价条件；会用 ${t("Q^TQ=E")} 精确判断；区分第一类（平面上是旋转）与第二类（平面上是反射），知道 ${t(String.raw`\det=\pm1`)} 只是必要条件。`,
      tags: ["正交变换", "正交矩阵", "旋转", "镜面反射"],
      intro:
        `正交变换保持内积，于是长度、夹角和距离都不变，单位圆仍是单位圆。在标准正交基下，它的矩阵 ${t("Q")} 满足 ${t("Q^TQ=E")}。行列式只能是 ${t(String.raw`\pm1`)}，但行列式为 ${t(String.raw`\pm1`)} 的矩阵不一定正交。`,
      concepts: [
        { label: "正交变换", text: `${t("(\\mathcal A\\alpha,\\mathcal A\\beta)=(\\alpha,\\beta)")}。` },
        { label: "正交矩阵", text: `${t("Q^TQ=E")}，即 ${t("Q^{-1}=Q^T")}。` },
      ],
      textbook: { reference, items: ["正交变换的定义与等价条件", "第一类与第二类正交变换", "镜面反射"] },
      interactive: lab("保持全部长度与夹角的线性变换"),
      lesson9: {
        blocks: [
          {
            title: "四个等价条件",
            tex: String.raw`(\mathcal A\alpha,\mathcal A\beta)=(\alpha,\beta)\iff|\mathcal A\alpha|=|\alpha|\iff Q^TQ=E`,
            text: `对欧氏空间 ${t("V")} 的线性变换 ${t(String.raw`\mathcal A`)}，下列条件等价：${t(String.raw`\mathcal A`)} 是正交变换；${t(String.raw`\mathcal A`)} 保持向量长度；${t(String.raw`\mathcal A`)} 把标准正交基变成标准正交基；${t(String.raw`\mathcal A`)} 在任一组标准正交基下的矩阵 ${t("Q")} 是正交矩阵。核心计算是 ${t("|Qx|^2=x^TQ^TQx=x^Tx")}。`,
          },
          {
            title: "第一类与第二类",
            text: `正交矩阵的行列式为 ${t(String.raw`\pm1`)}。${t("\\det Q=1")} 的称为第一类（旋转），${t("\\det Q=-1")} 的称为第二类。镜面反射 ${t("\\mathcal A\\xi=\\xi-2(\\eta,\\xi)\\eta")}（${t("|\\eta|=1")}）是第二类，矩阵为 ${t("E-2\\eta\\eta^T")}。`,
          },
        ],
        pitfalls: [
          `以为 ${t(String.raw`\det=\pm1`)} 就正交。${t(String.raw`\operatorname{diag}(2,\tfrac12)`)} 的行列式为 1，却把 ${t(String.raw`\varepsilon_1`)} 拉长一倍。`,
          "以为正交矩阵的列只要两两正交。每一列还必须是单位向量。",
          "在非标准正交基下读矩阵。正交变换在一般基下的矩阵不一定是正交矩阵。",
        ],
      },
      example: {
        title: "例题：判断正交矩阵及其类型",
        question: `判断 ${t("Q=\\tfrac13\\begin{bmatrix}2&-1&2\\\\2&2&-1\\\\-1&2&2\\end{bmatrix}")} 是否为正交矩阵；若是，它属于第几类？`,
        choices: [
          { correct: true, text: `是正交矩阵，${t(String.raw`\det Q=1`)}，第一类（旋转）` },
          { text: `是正交矩阵，${t(String.raw`\det Q=-1`)}，第二类` },
          { text: `不是正交矩阵，因为 ${t("Q")} 不对称` },
          { text: `不是正交矩阵，因为 ${t("Q")} 有负元素` },
        ],
        steps: [
          `每一列的长度平方都是 ${t("\\tfrac{4+4+1}{9}=1")}。`,
          `任意两列的内积为 0，例如 ${t("\\tfrac{(2)(-1)+(2)(2)+(-1)(2)}{9}=0")}，所以 ${t("Q^TQ=E")}。`,
          `${t("\\det\\begin{bmatrix}2&-1&2\\\\2&2&-1\\\\-1&2&2\\end{bmatrix}=27")}，${t("\\det Q=\\tfrac{27}{27}=1")}，第一类。正交矩阵不必对称，也可以有负元素。`,
        ],
      },
      quiz: [
        {
          question: `${t(String.raw`\mathcal A`)} 把标准正交基 ${t(String.raw`\varepsilon_1,\varepsilon_2`)} 变成 ${t(String.raw`\varepsilon_2,\varepsilon_1`)}。${t(String.raw`\mathcal A`)} 是正交变换吗？属于哪一类？`,
          answer: `是。矩阵 ${t(String.raw`\begin{bmatrix}0&1\\1&0\end{bmatrix}`)} 满足 ${t("Q^TQ=E")}，${t(String.raw`\det=-1`)}，第二类：关于直线 ${t("x_1=x_2")} 的反射。`,
        },
        {
          question: "两个第二类正交变换的乘积属于哪一类？",
          answer: `乘积仍是正交变换，行列式 ${t("(-1)(-1)=1")}，属于第一类。例如两次反射合成一个旋转。`,
        },
        {
          question: `实验中 ${t(String.raw`\operatorname{diag}(2,\tfrac12)`)} 把单位圆变成什么？为什么面积不变却不是正交变换？`,
          answer: `变成半轴为 2 和 ${t(String.raw`\tfrac12`)} 的椭圆，面积仍是 ${t(String.raw`\pi`)}；但 ${t(String.raw`\varepsilon_1`)} 的长度变成 2，长度没有保持。`,
        },
      ],
      summary: [
        `正交变换：保持内积 ${t(String.raw`\Leftrightarrow`)} 保持长度 ${t(String.raw`\Leftrightarrow`)} 标准正交基变成标准正交基 ${t(String.raw`\Leftrightarrow`)} 矩阵满足 ${t("Q^TQ=E")}。`,
        `${t(String.raw`\det Q=1`)} 为第一类（旋转），${t(String.raw`\det Q=-1`)} 为第二类（含一次反射）。`,
        `${t(String.raw`\det=\pm1`)} 只是必要条件。`,
      ],
    },
    {
      id: "orthogonal-subspaces",
      number: "§5",
      textbookSection: "子空间",
      title: "子空间与正交补",
      navTitle: "子空间",
      question: `与子空间 ${t("W")} 垂直的向量组成什么？为什么每个向量都能唯一地拆成 ${t("W")} 内与 ${t("W")} 外垂直的两部分？`,
      goal: `理解子空间的正交与正交补；会把正交补写成齐次方程组的解空间；掌握 ${t(String.raw`V=W\oplus W^\perp`)} 与内射影。`,
      tags: ["正交补", "正交分解", "内射影", "直和"],
      intro:
        `与子空间 ${t("W")} 中每个向量都正交的向量组成 ${t("W")} 的正交补 ${t(String.raw`W^\perp`)}。在 ${t(String.raw`\mathbb R^3`)} 中，平面的正交补是它的法线，直线的正交补是与它垂直的平面。${t(String.raw`W^\perp`)} 正是一个齐次线性方程组的解空间，并且 ${t(String.raw`V=W\oplus W^\perp`)}。`,
      concepts: [
        { label: "正交补", text: `${t("W^\\perp=\\{\\alpha\\in V:(\\alpha,\\beta)=0,\\ \\forall\\beta\\in W\\}")}。` },
        { label: "内射影", text: `${t("\\alpha=\\alpha_1+\\alpha_2")}，${t("\\alpha_1\\in W,\\ \\alpha_2\\in W^\\perp")}，${t("\\alpha_1")} 称为 ${t(String.raw`\alpha`)} 在 ${t("W")} 上的内射影。` },
      ],
      textbook: { reference, items: ["子空间的正交", "正交补", "正交分解与内射影"] },
      interactive: lab("W 与它的正交补 W⊥"),
      lesson9: {
        blocks: [
          {
            title: "正交补是一个解空间",
            tex: String.raw`W=\operatorname{span}\{w_1,\dots,w_s\}\ \Longrightarrow\ W^\perp=\{X:\ w_1^TX=0,\ \dots,\ w_s^TX=0\}`,
            text: `只要与 ${t("W")} 的一组生成元都正交，就与整个 ${t("W")} 正交。特别地，对实矩阵 ${t("A")}，齐次方程组 ${t("AX=0")} 的解空间是 ${t("A")} 的行向量所张子空间的正交补。`,
          },
          {
            title: "正交分解",
            tex: String.raw`V=W\oplus W^\perp,\qquad \dim W+\dim W^\perp=n,\qquad (W^\perp)^\perp=W`,
            text: `每个 ${t(String.raw`\alpha`)} 唯一地写成 ${t("\\alpha_1+\\alpha_2")}，${t("\\alpha_1\\in W")}，${t("\\alpha_2\\in W^\\perp")}。若 ${t("\\varepsilon_1,\\dots,\\varepsilon_m")} 是 ${t("W")} 的标准正交基，则 ${t("\\alpha_1=\\sum(\\alpha,\\varepsilon_i)\\varepsilon_i")}。两两正交的子空间之和一定是直和。`,
          },
        ],
        pitfalls: [
          `只验证与 ${t("W")} 中某一个向量正交。要与 ${t("W")} 的全部生成元正交。`,
          `把正交补与补集混淆：${t(String.raw`W^\perp`)} 是子空间，它与 ${t("W")} 只相交于零向量。`,
          `把正交补当成任意一个补子空间。当 ${t(String.raw`0<\dim W<n`)} 时，${t("W")} 的补子空间有无穷多个，正交补只有一个。`,
        ],
      },
      example: {
        title: "例题：求正交补的一组基",
        question: `在 ${t("\\mathbb R^4")} 中，${t("W=\\operatorname{span}\\{(1,1,0,0),(0,1,1,0)\\}")}。求 ${t("W^\\perp")} 的一组基。`,
        choices: [
          { correct: true, text: t("(1,-1,1,0),\\ (0,0,0,1)") },
          { text: t("(1,-1,1,0)") },
          { text: t("(1,-1,0,0),\\ (0,1,-1,0)") },
          { text: t("(0,0,1,0),\\ (0,0,0,1)") },
        ],
        steps: [
          `${t("X\\in W^\\perp")} ${t(String.raw`\Leftrightarrow`)} ${t("x_1+x_2=0")} 且 ${t("x_2+x_3=0")}。`,
          `自由未知量取 ${t("x_3,x_4")}：基础解系为 ${t("(1,-1,1,0),\\ (0,0,0,1)")}。`,
          `维数检验：${t("\\dim W+\\dim W^\\perp=2+2=4")}。${t("(1,-1,0,0)")} 与 ${t("(0,1,1,0)")} 的内积为 ${t("-1")}；${t("(0,0,1,0)")} 与 ${t("(0,1,1,0)")} 的内积为 1。`,
        ],
      },
      quiz: [
        {
          question: `${t(String.raw`\mathbb R^3`)} 中 ${t("W")} 是直线 ${t("x_1=x_2=x_3")}。${t(String.raw`W^\perp`)} 是什么？`,
          answer: `${t(String.raw`W=\operatorname{span}\{(1,1,1)\}`)}，${t(String.raw`W^\perp`)} 是平面 ${t("x_1+x_2+x_3=0")}。`,
        },
        {
          question: `${t(String.raw`\alpha`)} 在 ${t("W")} 上的内射影为 0，说明什么？内射影等于 ${t(String.raw`\alpha`)} 本身呢？`,
          answer: `前者说明 ${t(String.raw`\alpha\in W^\perp`)}；后者说明 ${t(String.raw`\alpha\in W`)}。`,
        },
        {
          question: `设 ${t("A")} 是 ${t(String.raw`m\times n`)} 实矩阵。为什么 ${t("AX=0")} 的解空间维数是 ${t(String.raw`n-\operatorname{rank}A`)}？用正交补来解释。`,
          answer: `解空间是 ${t("A")} 的行空间在 ${t(String.raw`\mathbb R^n`)} 中的正交补，行空间维数为 ${t(String.raw`\operatorname{rank}A`)}，两者维数之和为 ${t("n")}。`,
        },
        {
          question: `实验里把 ${t("w_1")} 拖到与 ${t("w_2")} 共线，${t(String.raw`W^\perp`)} 会怎样？`,
          answer: `${t("W")} 退化成一条直线，${t(String.raw`W^\perp`)} 变成一个平面，维数仍满足 ${t("1+2=3")}。`,
        },
      ],
      summary: [
        `${t(String.raw`W^\perp`)} 由与 ${t("W")} 的生成元都正交的向量组成，是一个齐次线性方程组的解空间。`,
        `${t(String.raw`V=W\oplus W^\perp`)}，${t(String.raw`\dim W+\dim W^\perp=n`)}；${t(String.raw`\alpha`)} 唯一地写成 ${t(String.raw`\alpha_1+\alpha_2`)}，${t(String.raw`\alpha_1`)} 是内射影。`,
        `§7 会用到：内射影 ${t(String.raw`\alpha_1`)} 是 ${t("W")} 中离 ${t(String.raw`\alpha`)} 最近的向量。`,
      ],
    },
    {
      id: "symmetric-canonical-form",
      number: "§6",
      textbookSection: "实对称矩阵的标准形",
      title: "实对称矩阵的标准形",
      navTitle: "实对称矩阵的标准形",
      question: "为什么实对称矩阵总能用正交矩阵化成对角形？这在图上是什么意思？",
      goal: `理解实对称矩阵特征值为实数、不同特征值的特征向量正交；会求正交矩阵 ${t("T")} 使 ${t("T^TAT")} 为对角形；看懂 ${t(String.raw`A=T\Lambda T^T`)} 的几何意义。`,
      tags: ["实对称矩阵", "对称变换", "正交矩阵", "主轴"],
      intro:
        `实对称矩阵的特征值都是实数，属于不同特征值的特征向量互相正交，于是可取标准正交的特征向量作正交矩阵 ${t("T")}，使 ${t("T^TAT")} 为对角矩阵。在图上，${t("A")} 把单位圆变成椭圆，主轴正是特征方向。`,
      concepts: [
        { label: "对称变换", text: `${t("(\\mathcal A\\alpha,\\beta)=(\\alpha,\\mathcal A\\beta)")}，在标准正交基下的矩阵是实对称矩阵。` },
        { label: "标准形", text: `存在正交矩阵 ${t("T")}，${t("T^TAT=T^{-1}AT=\\operatorname{diag}(\\lambda_1,\\dots,\\lambda_n)")}。` },
      ],
      textbook: { reference, items: ["实对称矩阵的特征值", "对称变换", "正交矩阵化实对称矩阵为对角形", "主轴问题"] },
      interactive: lab("A = TΛTᵀ：转过去、伸缩、转回来"),
      lesson9: {
        blocks: [
          {
            title: "不同特征值的特征向量正交",
            tex: String.raw`\lambda(\alpha,\beta)=(\mathcal A\alpha,\beta)=(\alpha,\mathcal A\beta)=\mu(\alpha,\beta)\ \Longrightarrow\ (\lambda-\mu)(\alpha,\beta)=0`,
            text: `${t("\\lambda\\ne\\mu")} 时 ${t("(\\alpha,\\beta)=0")}。证明只用到对称性 ${t("(\\mathcal A\\alpha,\\beta)=(\\alpha,\\mathcal A\\beta)")}；实对称矩阵的特征值都是实数，所以这些特征向量都可以取实的。`,
          },
          {
            title: "正交相似于对角矩阵",
            tex: String.raw`T^TAT=\operatorname{diag}(\lambda_1,\dots,\lambda_n),\qquad A=T\Lambda T^T`,
            text: `求法：解特征方程得全部特征值；对每个特征值求齐次方程组的基础解系，并在这个特征子空间内施密特正交化；全部单位化后作为 ${t("T")} 的列。`,
          },
        ],
        pitfalls: [
          "重特征值的特征子空间里，基础解系不一定正交，要先做施密特正交化。",
          "以为可对角化的矩阵都能用正交矩阵对角化。非对称矩阵的特征向量一般不正交。",
          `${t("T")} 的列忘记单位化，此时 ${t(String.raw`T^{-1}\ne T^T`)}。`,
        ],
      },
      example: {
        title: "例题：用正交矩阵对角化",
        question: `${t("A=\\begin{bmatrix}0&1&1\\\\1&0&1\\\\1&1&0\\end{bmatrix}")}。下列哪个 ${t("T")} 是正交矩阵并使 ${t("T^TAT")} 为对角形？`,
        choices: [
          { correct: true, text: `${t("T")} 的列为 ${t("\\tfrac1{\\sqrt3}(1,1,1),\\ \\tfrac1{\\sqrt2}(1,-1,0),\\ \\tfrac1{\\sqrt6}(1,1,-2)")}` },
          { text: `${t("T")} 的列为 ${t("\\tfrac1{\\sqrt3}(1,1,1),\\ \\tfrac1{\\sqrt2}(1,-1,0),\\ \\tfrac1{\\sqrt2}(1,0,-1)")}` },
          { text: `${t("T")} 的列为 ${t("(1,1,1),\\ (1,-1,0),\\ (1,1,-2)")}` },
          { text: `${t("T=E")}，因为 ${t("A")} 已经对称` },
        ],
        steps: [
          `${t("|\\lambda E-A|=(\\lambda-2)(\\lambda+1)^2")}，特征值 ${t(String.raw`2,\ -1,\ -1`)}。`,
          `属于 2 的特征向量 ${t("(1,1,1)")}；属于 ${t("-1")} 的特征子空间是平面 ${t("x_1+x_2+x_3=0")}，基础解系 ${t("(1,-1,0),(1,0,-1)")}。`,
          `这两个向量不正交，施密特正交化：${t("(1,0,-1)-\\tfrac12(1,-1,0)=\\tfrac12(1,1,-2)")}。`,
          `单位化后得到上面的三列，${t("T^TAT=\\operatorname{diag}(2,-1,-1)")}。若第三列取 ${t("\\tfrac1{\\sqrt2}(1,0,-1)")}，它与第二列的内积为 ${t(String.raw`\tfrac12`)}；不单位化时各列不是单位向量。`,
        ],
      },
      quiz: [
        {
          question: `3 阶实对称矩阵 ${t("A")} 的特征值为 ${t(String.raw`1,\ 1,\ 4`)}，属于 4 的特征向量是 ${t("(1,1,1)")}。属于 1 的特征子空间是什么？`,
          answer: `与 ${t("(1,1,1)")} 正交的全体向量，即平面 ${t("x_1+x_2+x_3=0")}。`,
        },
        {
          question: `${t(String.raw`A=\begin{bmatrix}2&1\\0&1\end{bmatrix}`)} 有两个不同特征值。能否找到正交矩阵 ${t("T")} 使 ${t("T^TAT")} 为对角形？`,
          answer: `不能。若 ${t(String.raw`T^TAT=\Lambda`)}，则 ${t(String.raw`A=T\Lambda T^T`)} 是对称矩阵，矛盾。它的特征向量 ${t("(1,0)")} 与 ${t("(1,-1)")} 夹 ${t(String.raw`45^\circ`)}。`,
        },
        {
          question: `实验中 ${t("A")} 把单位圆变成椭圆。椭圆的半轴长和方向由什么决定？`,
          answer: `方向是特征向量，半轴长是特征值的绝对值 ${t(String.raw`|\lambda_i|`)}；负特征值让对应方向反向。`,
        },
      ],
      summary: [
        "实对称矩阵：特征值为实数，不同特征值的特征向量正交。",
        `存在正交矩阵 ${t("T")} 使 ${t(String.raw`T^TAT=\operatorname{diag}(\lambda_1,\dots,\lambda_n)`)}；重特征值的特征子空间内要施密特正交化。`,
        `${t(String.raw`A=T\Lambda T^T`)}：转到特征方向、沿轴伸缩、再转回；单位圆的像是以特征方向为主轴的椭圆。`,
      ],
    },
    {
      id: "least-squares-distance",
      number: "§7",
      textbookSection: "向量到子空间的距离·最小二乘法",
      title: "向量到子空间的距离·最小二乘法",
      navTitle: "距离与最小二乘",
      question: `方程组 ${t("Ax=b")} 无解时，怎样找“最接近”的解？为什么它满足 ${t("A^TAx=A^Tb")}？`,
      goal: `理解向量到子空间的距离由垂线给出；把最小二乘解看成 ${t("b")} 在列空间上的内射影；会用正规方程拟合直线。`,
      tags: ["距离", "最小二乘法", "正规方程", "拟合直线"],
      intro:
        `${t("Ax")} 走遍 ${t("A")} 的列空间 ${t("W")}。方程组无解，说明 ${t("b")} 不在 ${t("W")} 里；离 ${t("b")} 最近的 ${t("Ax")} 是 ${t("b")} 在 ${t("W")} 上的内射影，误差 ${t("b-Ax")} 垂直于 ${t("A")} 的每一列，写出来就是 ${t("A^TAx=A^Tb")}。`,
      concepts: [
        { label: "距离", text: `${t("d(\\alpha,\\beta)=|\\alpha-\\beta|")}；${t(String.raw`\alpha`)} 到 ${t("W")} 的距离是 ${t("|\\alpha-\\alpha_1|")}，${t("\\alpha_1")} 为内射影。` },
        { label: "最小二乘解", text: `使 ${t("|b-Ax|^2")} 最小的 ${t("x")}，满足 ${t("A^TAx=A^Tb")}。` },
      ],
      textbook: { reference, items: ["向量到子空间的距离", "最小二乘法与正规方程"] },
      interactive: lab("离 b 最近的 Ax：投影与拟合直线是同一件事"),
      lesson9: {
        blocks: [
          {
            title: "垂线最短",
            tex: String.raw`|\alpha-\gamma|^2=|\alpha-\beta|^2+|\beta-\gamma|^2`,
            text: `设 ${t("\\beta,\\gamma\\in W")}，${t("\\alpha-\\beta\\perp W")}。由勾股定理，${t("W")} 中离 ${t(String.raw`\alpha`)} 最近的向量就是使 ${t("\\alpha-\\beta\\perp W")} 的 ${t(String.raw`\beta`)}，也就是 ${t(String.raw`\alpha`)} 在 ${t("W")} 上的内射影；其他点都多出 ${t("|\\beta-\\gamma|^2")}。`,
          },
          {
            title: "正规方程",
            tex: String.raw`A^T(b-A\hat x)=0\iff A^TA\hat x=A^Tb`,
            text: `误差与 ${t("A")} 的每一列正交，合起来就是正规方程。它总有解；${t("A")} 的列线性无关时 ${t("A^TA")} 可逆，${t("\\hat x=(A^TA)^{-1}A^Tb")} 唯一。`,
          },
          {
            title: "拟合直线",
            text: `用 ${t("y=C+Dt")} 拟合 ${t("(t_1,b_1),\\dots,(t_m,b_m)")}：${t("A")} 的两列是 ${t("(1,\\dots,1)")} 与 ${t("(t_1,\\dots,t_m)")}。误差与这两列正交，即 ${t("\\sum e_i=0")}，${t("\\sum t_ie_i=0")}。`,
          },
        ],
        pitfalls: [
          `以为最小二乘让每个残差都最小。最小的是残差平方和 ${t("|b-Ax|^2")}。`,
          `把 ${t("b")} 投影到 ${t("A")} 的行空间。${t("Ax")} 是列的组合，要投影到列空间。`,
          `以为正规方程可能无解。它总有解，${t("A")} 的列线性相关时解不唯一。`,
        ],
      },
      example: {
        title: "例题：最小二乘直线",
        question: `用直线 ${t("y=C+Dt")} 拟合三个数据点 ${t("(0,1),(1,2),(2,6)")}。最小二乘直线是哪一条？`,
        choices: [
          { correct: true, text: t("y=\\tfrac12+\\tfrac52t") },
          { text: t("y=1+\\tfrac52t") },
          { text: t("y=3") },
          { text: t("y=1+t") },
        ],
        steps: [
          `${t("A=\\begin{bmatrix}1&0\\\\1&1\\\\1&2\\end{bmatrix},\\ b=(1,2,6)")}；${t("A^TA=\\begin{bmatrix}3&3\\\\3&5\\end{bmatrix},\\ A^Tb=(9,14)")}。`,
          `解 ${t("3C+3D=9,\\ 3C+5D=14")}，得 ${t("D=\\tfrac52,\\ C=\\tfrac12")}。`,
          `误差 ${t("e=b-A\\hat x=(\\tfrac12,-1,\\tfrac12)")}：${t("\\sum e_i=0,\\ \\sum t_ie_i=0")}，与两列都正交。`,
          `${t("y=1+\\tfrac52t")} 穿过首尾两点，残差平方和为 ${t("\\tfrac94")}，大于最小值 ${t("|e|^2=\\tfrac32")}。`,
        ],
      },
      quiz: [
        {
          question: `${t("b")} 已经在 ${t("A")} 的列空间里，最小二乘解是什么？`,
          answer: `就是 ${t("Ax=b")} 的精确解，误差为 0。`,
        },
        {
          question: `${t("A")} 的列线性相关时，最小二乘解唯一吗？投影 ${t(String.raw`A\hat x`)} 呢？`,
          answer: `${t(String.raw`\hat x`)} 不唯一，相差 ${t("AX=0")} 的解；${t(String.raw`A\hat x`)} 唯一，它是 ${t("b")} 在列空间上的内射影。`,
        },
        {
          question: "拟合直线时，为什么残差之和一定为 0？",
          answer: `误差垂直于 ${t("A")} 的第一列 ${t(String.raw`(1,\dots,1)`)}，这正是 ${t(String.raw`\sum e_i=0`)}。`,
        },
        {
          question: `实验中点“沿 ${t("e")} 的方向看”，为什么 ${t("b")} 与 ${t("p")} 重合？`,
          answer: `${t("e=b-p")} 垂直于列空间平面，是平面的法向；沿法向看，${t("b")} 与它的垂足 ${t("p")} 落在同一点。`,
        },
      ],
      summary: [
        `${t(String.raw`\alpha`)} 到子空间 ${t("W")} 的距离 ${t(String.raw`=|\alpha-\alpha_1|`)}，${t(String.raw`\alpha_1`)} 是 ${t(String.raw`\alpha`)} 在 ${t("W")} 上的内射影。`,
        `最小二乘：${t(String.raw`b-A\hat x`)} 与 ${t("A")} 的每一列正交 ${t(String.raw`\Leftrightarrow`)} ${t(String.raw`A^TA\hat x=A^Tb`)}。`,
        `拟合直线就是把数据向量 ${t("b")} 投影到由 ${t(String.raw`(1,\dots,1)`)} 和 ${t(String.raw`(t_1,\dots,t_m)`)} 张成的平面上。`,
      ],
    },
    {
      id: "unitary-spaces",
      number: "＊§8",
      textbookSection: "酉空间介绍",
      title: "酉空间介绍",
      navTitle: "酉空间介绍",
      question: "复数域上怎样定义内积，才能让长度仍然是非负实数？",
      goal: "了解酉空间的内积及其与欧氏空间的差别；认识酉矩阵和埃尔米特矩阵。",
      tags: ["酉空间", "共轭", "酉矩阵", "埃尔米特矩阵"],
      intro:
        `复向量若照搬 ${t(String.raw`\sum a_ib_i`)}，${t("(1,i)")} 与自身的乘积是 ${t("1+i^2=0")}。把第二个向量取共轭，${t(String.raw`(\alpha,\beta)=\sum a_i\bar b_i`)}，自身内积就成了 ${t(String.raw`\sum|a_i|^2\ge0`)}。带这种内积的复线性空间叫酉空间。`,
      concepts: [
        { label: "酉空间内积", text: `${t("\\mathbb C^n")} 中 ${t("(\\alpha,\\beta)=a_1\\bar b_1+\\cdots+a_n\\bar b_n")}。` },
        { label: "酉矩阵", text: `${t("\\bar A^TA=E")}。` },
      ],
      textbook: { reference, items: ["酉空间的内积", "酉矩阵与埃尔米特矩阵"] },
      lesson9: {
        figure: "conjugate",
        blocks: [
          {
            title: "酉空间的内积",
            tex: String.raw`(\beta,\alpha)=\overline{(\alpha,\beta)},\qquad (k\alpha,\beta)=k(\alpha,\beta),\qquad (\alpha,k\beta)=\bar k(\alpha,\beta)`,
            text: `内积对第一个变量线性，交换次序要取共轭，并且 ${t("(\\alpha,\\alpha)")} 是非负实数，只在 ${t("\\alpha=0")} 时为 0。长度、正交、标准正交基与施密特正交化都照样定义。`,
          },
          {
            title: "酉矩阵与埃尔米特矩阵",
            text: `转置换成共轭转置：标准正交基之间的过渡矩阵满足 ${t("\\bar U^TU=E")}，称为酉矩阵；${t("\\bar A^T=A")} 的矩阵称为埃尔米特矩阵。埃尔米特矩阵的特征值都是实数，并且存在酉矩阵 ${t("U")} 使 ${t("U^{-1}AU")} 为实对角矩阵。实数矩阵中，它们分别就是正交矩阵与实对称矩阵。`,
          },
        ],
        pitfalls: [
          `忘记共轭：${t(String.raw`\sum a_ib_i`)} 会让非零向量 ${t("(1,i)")} 的“长度平方”为 0。`,
          `从第二个位置提出常数时忘记取共轭：${t(String.raw`(\alpha,k\beta)=\bar k(\alpha,\beta)`)}。`,
          `把复对称矩阵（${t("A^T=A")}）当成埃尔米特矩阵。${t(String.raw`\begin{bmatrix}1&i\\i&1\end{bmatrix}`)} 对称，特征值却是 ${t(String.raw`1\pm i`)}。`,
        ],
      },
      example: {
        title: "例题：判断酉矩阵",
        question: `${t("U=\\tfrac1{\\sqrt2}\\begin{bmatrix}1&i\\\\i&1\\end{bmatrix}")} 是酉矩阵吗？`,
        choices: [
          { correct: true, text: `是，${t("\\bar U^TU=E")}` },
          { text: `不是，因为 ${t("U^TU\\ne E")}` },
          { text: "不是，因为元素不全是实数" },
          { text: `是，因为 ${t("U")} 是埃尔米特矩阵` },
        ],
        steps: [
          `${t("\\bar U^T=\\tfrac1{\\sqrt2}\\begin{bmatrix}1&-i\\\\-i&1\\end{bmatrix}")}。`,
          `${t("\\bar U^TU=\\tfrac12\\begin{bmatrix}1-i^2&i-i\\\\-i+i&-i^2+1\\end{bmatrix}=E")}，所以 ${t("U")} 是酉矩阵。`,
          `${t("U^TU=\\begin{bmatrix}0&i\\\\i&0\\end{bmatrix}")} 不是判别酉矩阵的式子；${t("\\bar U^T\\ne U")}，${t("U")} 也不是埃尔米特矩阵。`,
        ],
      },
      quiz: [
        {
          question: `若不取共轭，${t(String.raw`\alpha=(1,i)`)} 的“长度平方”是多少？取共轭后呢？`,
          answer: `不取共轭得 ${t("1+i^2=0")}，非零向量长度为 0；取共轭得 ${t(String.raw`1\cdot1+i\cdot\bar i=2`)}，${t(String.raw`|\alpha|=\sqrt2`)}。`,
        },
        {
          question: "为什么埃尔米特矩阵的特征值是实数？",
          answer: `设 ${t(String.raw`A\alpha=\lambda\alpha`)}，${t(String.raw`\alpha\ne0`)}。${t(String.raw`\lambda(\alpha,\alpha)=(A\alpha,\alpha)=(\alpha,A\alpha)=\bar\lambda(\alpha,\alpha)`)}，而 ${t(String.raw`(\alpha,\alpha)>0`)}，所以 ${t(String.raw`\lambda=\bar\lambda`)}。`,
        },
        {
          question: "实数矩阵看作复矩阵时，酉矩阵、埃尔米特矩阵分别是什么？",
          answer: "分别是正交矩阵和实对称矩阵。",
        },
      ],
      summary: [
        `酉空间内积 ${t(String.raw`(\alpha,\beta)=\sum a_i\bar b_i`)}：对第一个变量线性，交换次序取共轭，${t(String.raw`(\alpha,\alpha)\ge0`)}。`,
        `转置换成共轭转置：酉矩阵满足 ${t(String.raw`\bar U^TU=E`)}，埃尔米特矩阵满足 ${t(String.raw`\bar A^T=A`)}。`,
        "埃尔米特矩阵特征值为实数，可用酉矩阵对角化，这是实对称矩阵结论的复数版本。",
      ],
    },
  ];

  registerAlgebraChapter({
    id: "ch9",
    icon: "9",
    title: "第九章 欧几里得空间",
    subtitle: "内积、正交与投影",
    summary:
      "在实线性空间上加一个内积，就有了长度、夹角与正交。本章先用标准正交基把内积变成普通点积，再讨论保持内积的同构与正交变换；正交补与内射影给出垂线，实对称矩阵在正交坐标下化成对角形，最小二乘法把无解方程组变成投影问题，最后简介复数域上的酉空间。",
    overview: {
      title: "从内积到投影",
      spine: "内积 → 标准正交基 → 同构与正交变换 → 正交补 → 实对称矩阵 → 最小二乘 → 酉空间",
      panels: [
        { title: "度量", text: "内积决定长度、夹角与正交；度量矩阵在基下记录它。" },
        { title: "正交坐标", text: "标准正交基让内积变成普通点积，保持内积的变换由正交矩阵表示。" },
        { title: "投影", text: "正交补与内射影给出最近点，最小二乘与谱分解都从这里出发。" },
      ],
    },
    sections,
  });
})();


;/* visuals/ch9/registry.js */
/* Chapter 9 presentation registry with deterministic teardown. */
(() => {
  const renderers = new Map();
  let activeCleanup = null;

  function runCleanup() {
    if (typeof activeCleanup === "function") {
      try {
        activeCleanup();
      } catch (error) {
        console.warn("Chapter 9 teardown failed", error);
      }
    }
    activeCleanup = null;
  }

  window.defineChapter9Renderer = function defineChapter9Renderer(sectionId, renderer) {
    if (!sectionId || !renderer || typeof renderer !== "object") {
      throw new TypeError("Chapter 9 renderers require a section id and an object.");
    }
    renderers.set(sectionId, renderer);
  };

  window.teardownChapter9Lesson = runCleanup;

  window.mountChapter9Lesson = function mountChapter9Lesson(section, root) {
    runCleanup();
    if (!section?.id || !root) return;
    const renderer = renderers.get(section.id);
    if (!renderer) return;
    const cleanups = [];
    const formal = root.querySelector(`#${CSS.escape(section.id)}-formal`);
    const interactive = root.querySelector(`#${CSS.escape(section.id)}-interactive`);
    [renderer.formal?.(formal, section, root), renderer.interactive?.(interactive, section, root)].forEach((cleanup) => {
      if (typeof cleanup === "function") cleanups.push(cleanup);
    });
    activeCleanup = () => cleanups.splice(0).reverse().forEach((cleanup) => cleanup());
  };

  window.addEventListener("hashchange", runCleanup);
  window.addEventListener("pagehide", runCleanup);
})();


;/* content/ch10-registry.js */
/*
 * Chapter 10 section data registry.
 */
(() => {
  const patches = new Map();

  window.defineChapter10Section = function defineChapter10Section(sectionId, patch) {
    if (!sectionId || !patch || typeof patch !== "object") {
      throw new TypeError("Chapter 10 section patches require an id and an object.");
    }
    patches.set(sectionId, patch);
  };

  window.getChapter10SectionPatches = function getChapter10SectionPatches() {
    return patches;
  };
})();


;/* content/ch10-section1.js */
defineChapter10Section("linear-functional", {
  number: "§1",
  textbookSection: "线性函数",
  title: "线性函数",
  navTitle: "线性函数",
  question: "线性函数怎样把每个向量读成一个数？",
  goal: `理解线性函数的定义，会由基上的值写出 ${texInline(String.raw`f(x)=a_1x_1+\cdots+a_nx_n`)}，知道非零线性函数的核是 ${texInline("n-1")} 维子空间，等值面彼此平行。`,
  tags: ["线性函数", "基上的值", "核", "等值线"],
  intro:
    `线性函数 ${texInline("f")} 把每个向量读成数域 ${texInline("P")} 中的一个数，并且保持加法与数乘。在平面上，${texInline("f")} 取同一个值的点排成一条直线，不同的值给出一族平行线。下面拖动向量 ${texInline("x")} 读出 ${texInline("f(x)")}，再看 ${texInline("f")} 在基上的两个值怎样决定整族直线。`,
  concepts: [
    { label: "线性函数", text: texInline(String.raw`f(k\alpha+l\beta)=kf(\alpha)+lf(\beta)`) },
    { label: "坐标表示", text: texInline(String.raw`f(x)=a_1x_1+\cdots+a_nx_n,\ a_i=f(\varepsilon_i)`) },
  ],
  textbook: { reference: "北大版《高等代数》第十章 §1", items: ["线性函数的定义与例", "线性函数由基上的值唯一决定"] },
  interactive: { type: "slot", title: "等值线读出 f(x)" },
  lesson3d: {
    blocks: [
      {
        title: "线性函数的定义",
        tex: String.raw`f:V\to P,\qquad f(k\alpha+l\beta)=kf(\alpha)+lf(\beta)`,
        text: `${texInline("V")} 是数域 ${texInline("P")} 上的线性空间。例如 ${texInline("P^n")} 上的 ${texInline(String.raw`a_1x_1+\cdots+a_nx_n`)}，${texInline("n")} 阶矩阵的迹 ${texInline(String.raw`\operatorname{tr}A`)}，${texInline("P[x]")} 上的 ${texInline("f(p)=p(t_0)")}。由定义 ${texInline("f(0)=0")}，并且 ${texInline("f")} 把线性组合读成读数的线性组合。`,
        ponder: {
          q: `${texInline("f(x_1,x_2)=x_1+x_2+1")} 是线性函数吗？`,
          a: `不是。${texInline(String.raw`f(0)=1\ne0`)}。它的等值线也彼此平行，但 ${texInline("f=0")} 的那一条不过原点。`,
        },
      },
      {
        title: "由基上的值唯一决定",
        tex: String.raw`f(x_1\varepsilon_1+\cdots+x_n\varepsilon_n)=a_1x_1+\cdots+a_nx_n,\qquad a_i=f(\varepsilon_i)`,
        text: `取定 ${texInline("V")} 的基 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_n`)}，${texInline("f")} 由 ${texInline("n")} 个数 ${texInline(String.raw`f(\varepsilon_1),\dots,f(\varepsilon_n)`)} 完全决定。反过来，任给 ${texInline("P")} 中 ${texInline("n")} 个数 ${texInline(String.raw`a_1,\dots,a_n`)}，存在唯一的线性函数 ${texInline("f")} 使 ${texInline(String.raw`f(\varepsilon_i)=a_i`)}。`,
        ponder: {
          q: `${texInline("f")} 在一组基上的值全是 0，${texInline("f")} 是什么？`,
          a: `零函数：对一切 ${texInline("x")}，${texInline(String.raw`f(x)=0\cdot x_1+\cdots+0\cdot x_n=0`)}。`,
        },
      },
      {
        title: "核与等值面",
        tex: String.raw`\ker f=\{\alpha\in V\mid f(\alpha)=0\},\qquad \dim\ker f=n-1\quad(f\ne 0)`,
        text: `${texInline(String.raw`f\ne0`)} 时值域是整个 ${texInline("P")}，由维数公式得 ${texInline(String.raw`\dim\ker f=n-1`)}。取 ${texInline(String.raw`\alpha_0`)} 使 ${texInline(String.raw`f(\alpha_0)=c`)}，则 ${texInline("f=c")} 的全体向量恰好是 ${texInline(String.raw`\alpha_0+\ker f`)}。平面上 ${texInline(String.raw`\ker f`)} 是过原点的直线，其余等值线都与它平行。`,
        ponder: {
          q: `两个非零线性函数 ${texInline("f")}、${texInline("g")} 的核相同，它们有什么关系？`,
          a: `相差一个非零常数倍。取 ${texInline(String.raw`\alpha_0`)} 使 ${texInline(String.raw`f(\alpha_0)=1`)}，则 ${texInline(String.raw`V=L(\alpha_0)\oplus\ker f`)}，两边比较得 ${texInline(String.raw`g=g(\alpha_0)f`)}。`,
        },
      },
    ],
    pitfalls: [
      `把 ${texInline("a_1x_1+a_2x_2+b")}（${texInline(String.raw`b\ne0`)}）当成线性函数。线性函数必须满足 ${texInline("f(0)=0")}。`,
      `以为系数 ${texInline("a_i")} 只属于 ${texInline("f")}。${texInline(String.raw`a_i=f(\varepsilon_i)`)} 依赖所选的基，换一组基，同一个 ${texInline("f")} 的系数一般会变。`,
      `把直线 ${texInline("a_1x_1+a_2x_2=0")} 的方向当成 ${texInline("(a_1,a_2)")}。这条直线的方向是 ${texInline("(-a_2,a_1)")}。`,
    ],
  },
  example: {
    title: "例题：由基上的值求线性函数",
    question: `在 ${texInline("P^3")} 中取基 ${texInline(String.raw`\alpha_1=(1,1,0),\ \alpha_2=(0,1,1),\ \alpha_3=(1,0,1)`)}，线性函数 ${texInline("f")} 满足 ${texInline(String.raw`f(\alpha_1)=1,\ f(\alpha_2)=2,\ f(\alpha_3)=3`)}。${texInline(String.raw`f(x_1,x_2,x_3)`)} 等于什么？`,
    choices: [
      { correct: true, text: texInline("x_1+2x_3") },
      { text: `${texInline("x_1+2x_2+3x_3")}：把 1, 2, 3 直接当作系数。` },
      { text: texInline("2x_1+x_3") },
      { text: `条件不够，${texInline("f")} 不唯一。` },
    ],
    steps: [
      `设 ${texInline("f(x)=a_1x_1+a_2x_2+a_3x_3")}，${texInline("P^3")} 上的线性函数都是这种形状。`,
      `代入三个基向量：${texInline("a_1+a_2=1,\\ a_2+a_3=2,\\ a_1+a_3=3")}。`,
      `三式相加得 ${texInline("2(a_1+a_2+a_3)=6")}，于是 ${texInline("a_3=2,\\ a_1=1,\\ a_2=0")}。`,
      `所以 ${texInline("f=x_1+2x_3")}。检验：${texInline("f(\\alpha_1)=1,\\ f(\\alpha_2)=2,\\ f(\\alpha_3)=3")}。基上的值唯一决定 ${texInline("f")}。`,
      `系数取 1, 2, 3 时 ${texInline("f(\\alpha_1)=3")}；系数取 2, 0, 1 时 ${texInline("f(\\alpha_1)=2")}，都与条件不符。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("f(x_1,x_2)=x_1x_2")} 是线性函数吗？`,
      answer: `不是。${texInline("f(2x)=4f(x)")}，不满足 ${texInline(String.raw`f(k\alpha)=kf(\alpha)`)}。它的等值线是双曲线，也不平行。`,
    },
    {
      question: `${texInline("V")} 是 ${texInline("n")} 维空间，${texInline(String.raw`f\ne0`)}。${texInline(String.raw`\ker f`)} 是几维的？${texInline("f=1")} 的全体向量构成子空间吗？`,
      answer: `${texInline(String.raw`\ker f`)} 是 ${texInline("n-1")} 维的。${texInline("f=1")} 的向量不含零向量，不构成子空间；它是 ${texInline(String.raw`\alpha_0+\ker f`)}，其中 ${texInline(String.raw`f(\alpha_0)=1`)}。`,
    },
    {
      question: `在 ${texInline("P[x]_n")} 中，${texInline("f(p)=p(1)")} 是线性函数吗？它在基 ${texInline("1,x,\\dots,x^{n-1}")} 上的值是多少？`,
      answer: `是线性函数：${texInline(String.raw`(kp+lq)(1)=kp(1)+lq(1)`)}。它在每个基向量上的值都是 1，所以 ${texInline(String.raw`f(a_0+a_1x+\cdots)=a_0+a_1+\cdots+a_{n-1}`)}。`,
    },
  ],
  summary: [
    `线性函数 ${texInline(String.raw`f:V\to P`)} 保持线性组合；取定基后 ${texInline(String.raw`f(x)=a_1x_1+\cdots+a_nx_n`)}，${texInline(String.raw`a_i=f(\varepsilon_i)`)}。`,
    `基上的 ${texInline("n")} 个值可以任意给定，并且唯一决定 ${texInline("f")}。`,
    `${texInline(String.raw`f\ne0`)} 时 ${texInline(String.raw`\ker f`)} 是 ${texInline("n-1")} 维子空间，${texInline("f=c")} 的向量是它的平移，各等值面彼此平行。`,
  ],
});


;/* content/ch10-section2.js */
defineChapter10Section("dual-space", {
  number: "§2",
  textbookSection: "对偶空间",
  title: "对偶空间",
  navTitle: "对偶空间",
  question: "对偶基怎样读出一个向量的坐标？",
  goal: `知道 ${texInline("V^*=L(V,P)")} 与 ${texInline("V")} 同维，会求一组基的对偶基；掌握两组基的对偶基之间的过渡矩阵是 ${texInline("(A^T)^{-1}")}。`,
  tags: ["对偶空间", "对偶基", "坐标读取", "(Aᵀ)⁻¹"],
  intro:
    `${texInline("V")} 上的全体线性函数在加法与数乘下也组成线性空间，称为对偶空间 ${texInline("V^*")}。取定 ${texInline("V")} 的一组基，有一组线性函数恰好读出向量在这组基下的各个坐标，这就是对偶基。下面拖动一组斜的基，看两族读数直线怎样跟着变。`,
  concepts: [
    { label: "对偶基", text: texInline(String.raw`f_i(\varepsilon_j)=\delta_{ij}`) },
    { label: "过渡矩阵", text: texInline(String.raw`(\eta)=(\varepsilon)A\Rightarrow(g)=(f)(A^T)^{-1}`) },
  ],
  textbook: { reference: "北大版《高等代数》第十章 §2", items: ["对偶空间 L(V,P)", "对偶基", "对偶基之间的过渡矩阵", "V 与 V** 的同构"] },
  interactive: { type: "slot", title: "斜基与它的对偶基" },
  lesson3d: {
    blocks: [
      {
        title: "对偶空间与对偶基",
        tex: String.raw`f_i(\varepsilon_j)=\delta_{ij}=\begin{cases}1,&i=j\\0,&i\ne j\end{cases},\qquad \dim V^*=\dim V`,
        text: `${texInline("V^*")} 中的运算逐点定义：${texInline(String.raw`(f+g)(\alpha)=f(\alpha)+g(\alpha)`)}，${texInline(String.raw`(kf)(\alpha)=kf(\alpha)`)}。基 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_n`)} 的对偶基 ${texInline(String.raw`f_1,\dots,f_n`)} 是 ${texInline("V^*")} 的一组基；${texInline("f_i")} 读出第 ${texInline("i")} 个坐标，所以 ${texInline(String.raw`\alpha=f_1(\alpha)\varepsilon_1+\cdots+f_n(\alpha)\varepsilon_n`)}，${texInline(String.raw`f=f(\varepsilon_1)f_1+\cdots+f(\varepsilon_n)f_n`)}。`,
        ponder: {
          q: `${texInline(String.raw`\eta_1,\eta_2`)} 的对偶基中，${texInline("g_1")} 只与 ${texInline(String.raw`\eta_1`)} 有关吗？`,
          a: `还与 ${texInline(String.raw`\eta_2`)} 有关。${texInline("g_1")} 要满足 ${texInline(String.raw`g_1(\eta_2)=0`)}，${texInline(String.raw`\eta_2`)} 一动，${texInline("g_1")} 的零线就跟着转。`,
        },
      },
      {
        title: "对偶基的过渡矩阵",
        tex: String.raw`(\eta_1,\dots,\eta_n)=(\varepsilon_1,\dots,\varepsilon_n)A\ \Longrightarrow\ (g_1,\dots,g_n)=(f_1,\dots,f_n)(A^T)^{-1}`,
        text: `${texInline(String.raw`f_1,\dots,f_n`)} 与 ${texInline(String.raw`g_1,\dots,g_n`)} 分别是两组基的对偶基。例：${texInline(String.raw`\eta_1=\varepsilon_1`)}，${texInline(String.raw`\eta_2=\varepsilon_1+\varepsilon_2`)}，则 ${texInline(String.raw`A=\begin{pmatrix}1&1\\0&1\end{pmatrix}`)}，${texInline(String.raw`(A^T)^{-1}=\begin{pmatrix}1&0\\-1&1\end{pmatrix}`)}，于是 ${texInline("g_1=f_1-f_2")}，${texInline("g_2=f_2")}。${texInline(String.raw`\eta_1`)} 没有变，${texInline("g_1")} 却变了。`,
        ponder: {
          q: "把每个基向量都放大 2 倍，对偶基怎样变？",
          a: `${texInline("A=2E")}，${texInline(String.raw`(A^T)^{-1}=\tfrac12E`)}，所以每个 ${texInline(String.raw`g_i=\tfrac12f_i`)}。量尺变长，读数变小。`,
        },
      },
      {
        title: "V 与 V** 的同构",
        tex: String.raw`\alpha\mapsto\alpha^{**},\qquad \alpha^{**}(f)=f(\alpha)\quad(f\in V^*)`,
        text: `把 ${texInline(String.raw`\alpha`)} 看成 ${texInline("V^*")} 上“在 ${texInline(String.raw`\alpha`)} 处取值”的函数，得到 ${texInline("V")} 到 ${texInline("V^{**}")} 的同构映射，它的定义不依赖基的选取。因此 ${texInline("V")} 也可以看成 ${texInline("V^*")} 的对偶空间。`,
      },
    ],
    pitfalls: [
      `以为 ${texInline("g_i")} 只由 ${texInline(String.raw`\eta_i`)} 决定。条件 ${texInline(String.raw`g_i(\eta_j)=0`)}（${texInline(String.raw`j\ne i`)}）把其余基向量都牵连进来。`,
      `把对偶基的过渡矩阵写成 ${texInline("A")} 或 ${texInline("A^{-1}")}。正确的是 ${texInline("(A^T)^{-1}")}。`,
      `把 ${texInline("V^*")} 的元素当成 ${texInline("V")} 的向量。${texInline("f")} 是函数，取定基以后才用 ${texInline("n")} 个数 ${texInline(String.raw`f(\varepsilon_1),\dots,f(\varepsilon_n)`)} 记录它。`,
    ],
  },
  example: {
    title: "例题：基向量没变，对偶基却变了",
    question: `${texInline("f_1,f_2")} 是 ${texInline(String.raw`\varepsilon_1,\varepsilon_2`)} 的对偶基。新基 ${texInline(String.raw`\eta_1=\varepsilon_1,\ \eta_2=\varepsilon_1+\varepsilon_2`)} 的对偶基中，${texInline("g_1")} 等于什么？`,
    choices: [
      { correct: true, text: texInline("f_1-f_2") },
      { text: `${texInline("f_1")}，因为 ${texInline(String.raw`\eta_1=\varepsilon_1`)}` },
      { text: texInline("f_1+f_2") },
      { text: texInline("f_2-f_1") },
    ],
    steps: [
      `设 ${texInline("g_1=af_1+bf_2")}，它要满足 ${texInline(String.raw`g_1(\eta_1)=1,\ g_1(\eta_2)=0`)}。`,
      `${texInline(String.raw`g_1(\eta_1)=g_1(\varepsilon_1)=a=1`)}；${texInline(String.raw`g_1(\eta_2)=a+b=0`)}，所以 ${texInline("b=-1")}。`,
      `于是 ${texInline("g_1=f_1-f_2")}。用公式核对：${texInline(String.raw`(A^T)^{-1}=\begin{pmatrix}1&0\\-1&1\end{pmatrix}`)} 的第一列是 ${texInline("(1,-1)^T")}。`,
      `${texInline(String.raw`f_1(\eta_2)=1\ne0`)}，所以 ${texInline("f_1")} 不满足条件；${texInline("f_1+f_2")} 在 ${texInline(String.raw`\eta_2`)} 上的值是 2；${texInline("f_2-f_1")} 在 ${texInline(String.raw`\eta_1`)} 上的值是 ${texInline("-1")}。`,
    ],
  },
  quiz: [
    {
      question: `${texInline(String.raw`\dim V=n`)} 时，${texInline(String.raw`\dim V^*`)} 是多少？${texInline("V^*")} 的一组基可以怎样得到？`,
      answer: `${texInline(String.raw`\dim V^*=n`)}。任取 ${texInline("V")} 的一组基，它的对偶基就是 ${texInline("V^*")} 的一组基。`,
    },
    {
      question: `接上面的例题，线性函数 ${texInline("f=3f_1+f_2")} 在对偶基 ${texInline("g_1,g_2")} 下的坐标是什么？`,
      answer: `坐标是 ${texInline(String.raw`(f(\eta_1),f(\eta_2))=(3,4)`)}，即 ${texInline("f=3g_1+4g_2")}。核对：${texInline("3(f_1-f_2)+4f_2=3f_1+f_2")}。`,
    },
    {
      question: `怎样用对偶基 ${texInline(String.raw`g_1,\dots,g_n`)} 写出向量 ${texInline(String.raw`\alpha`)} 在基 ${texInline(String.raw`\eta_1,\dots,\eta_n`)} 下的坐标？`,
      answer: `${texInline(String.raw`\alpha=g_1(\alpha)\eta_1+\cdots+g_n(\alpha)\eta_n`)}，第 ${texInline("i")} 个坐标就是 ${texInline(String.raw`g_i(\alpha)`)}。`,
    },
  ],
  summary: [
    `${texInline("V^*=L(V,P)")} 与 ${texInline("V")} 同维；基 ${texInline(String.raw`\varepsilon_1,\dots,\varepsilon_n`)} 的对偶基满足 ${texInline(String.raw`f_i(\varepsilon_j)=\delta_{ij}`)}。`,
    `对偶基是读坐标的工具：${texInline(String.raw`\alpha=\sum f_i(\alpha)\varepsilon_i`)}，${texInline(String.raw`f=\sum f(\varepsilon_i)f_i`)}；每个 ${texInline("f_i")} 由整组基决定。`,
    `${texInline(String.raw`(\eta)=(\varepsilon)A`)} 时，对偶基满足 ${texInline("(g)=(f)(A^T)^{-1}")}。`,
  ],
});


;/* content/ch10-section3.js */
defineChapter10Section("bilinear-form", {
  number: "§3",
  textbookSection: "双线性函数",
  title: "双线性函数",
  navTitle: "双线性函数",
  question: "两个向量怎样一起读出一个数？",
  goal: `理解双线性函数与度量矩阵 ${texInline(String.raw`a_{ij}=f(\varepsilon_i,\varepsilon_j)`)}，会用 ${texInline(String.raw`f(\alpha,\beta)=X^TAY`)} 计算；掌握换基公式 ${texInline("B=C^TAC")}，会判断非退化，能把双线性函数分成对称与反对称两部分。`,
  tags: ["双线性函数", "度量矩阵", "合同", "非退化", "对称与反对称"],
  intro:
    `双线性函数 ${texInline(String.raw`f(\alpha,\beta)`)} 同时读两个向量，对每个变量都是线性的。固定 ${texInline(String.raw`\beta`)}，${texInline(String.raw`f(\cdot,\beta)`)} 就是一个线性函数，画出来是一族平行线；${texInline(String.raw`\beta`)} 一动，这族线跟着转动，疏密也变。取定基后，${texInline("f")} 的全部信息记在度量矩阵 ${texInline("A")} 里。`,
  concepts: [
    { label: "度量矩阵", text: texInline(String.raw`f(\alpha,\beta)=X^TAY,\ a_{ij}=f(\varepsilon_i,\varepsilon_j)`) },
    { label: "换基", text: texInline(String.raw`(\eta)=(\varepsilon)C\Rightarrow B=C^TAC`) },
  ],
  textbook: { reference: "北大版《高等代数》第十章 §3", items: ["双线性函数与度量矩阵", "换基与合同", "非退化双线性函数", "对称与反对称双线性函数"] },
  interactive: { type: "slot", title: "固定一个变量，得到一个线性函数" },
  lesson3d: {
    blocks: [
      {
        title: "度量矩阵",
        tex: String.raw`f(\alpha,\beta)=X^TAY,\qquad A=\big(f(\varepsilon_i,\varepsilon_j)\big)_{n\times n}`,
        text: `${texInline("f")} 对每个变量都线性：${texInline(String.raw`f(k_1\alpha_1+k_2\alpha_2,\beta)=k_1f(\alpha_1,\beta)+k_2f(\alpha_2,\beta)`)}，对 ${texInline(String.raw`\beta`)} 同样成立。${texInline(String.raw`X`)}、${texInline(String.raw`Y`)} 是 ${texInline(String.raw`\alpha`)}、${texInline(String.raw`\beta`)} 的坐标。固定 ${texInline(String.raw`\beta`)}，${texInline(String.raw`f(\alpha,\beta)`)} 是 ${texInline(String.raw`\alpha`)} 的线性函数，系数是 ${texInline(String.raw`AY`)}；固定 ${texInline(String.raw`\alpha`)}，系数是 ${texInline(String.raw`A^TX`)}。`,
        ponder: {
          q: `${texInline("a_{12}")} 与 ${texInline("a_{21}")} 分别读的是什么？`,
          a: `${texInline(String.raw`a_{12}=f(\varepsilon_1,\varepsilon_2)`)}，${texInline(String.raw`a_{21}=f(\varepsilon_2,\varepsilon_1)`)}。${texInline("f")} 不对称时两者可以不同，下标的次序不能交换。`,
        },
      },
      {
        title: "换基与合同",
        tex: String.raw`(\eta_1,\dots,\eta_n)=(\varepsilon_1,\dots,\varepsilon_n)C\ \Longrightarrow\ B=C^TAC`,
        text: `${texInline("B")} 的 ${texInline("(i,j)")} 元是 ${texInline(String.raw`f(\eta_i,\eta_j)`)}。同一个双线性函数在不同基下的度量矩阵彼此合同，秩相同。${texInline("f")} 称为非退化的，指 ${texInline(String.raw`f(\alpha,\beta)=0`)} 对一切 ${texInline(String.raw`\beta`)} 成立时必有 ${texInline(String.raw`\alpha=0`)}；这当且仅当度量矩阵满足 ${texInline(String.raw`|A|\ne0`)}。`,
        ponder: {
          q: `${texInline("B=C^TAC")} 与第七章线性变换的换基公式 ${texInline("X^{-1}AX")} 为什么不同？`,
          a: `双线性函数的两个变量都要换坐标：把 ${texInline("X=CX'")}、${texInline("Y=CY'")} 代入 ${texInline("X^TAY")}，得到 ${texInline("X'^T(C^TAC)Y'")}。`,
        },
      },
      {
        title: "对称与反对称",
        tex: String.raw`A=\tfrac12\left(A+A^T\right)+\tfrac12\left(A-A^T\right)`,
        text: `${texInline(String.raw`f(\alpha,\beta)=f(\beta,\alpha)`)} 时称 ${texInline("f")} 对称，度量矩阵对称，并且可以选基使它成为对角矩阵；${texInline(String.raw`f(\alpha,\beta)=-f(\beta,\alpha)`)} 时称 ${texInline("f")} 反对称，此时 ${texInline(String.raw`f(\alpha,\alpha)=0`)}。每个双线性函数都唯一地写成对称部分与反对称部分之和。`,
        ponder: {
          q: `${texInline(String.raw`f(\alpha,\beta)=x_1y_2`)} 的对称部分与反对称部分各是什么？`,
          a: `对称部分 ${texInline(String.raw`\tfrac12(x_1y_2+x_2y_1)`)}，反对称部分 ${texInline(String.raw`\tfrac12(x_1y_2-x_2y_1)`)}。`,
        },
      },
    ],
    pitfalls: [
      `换基时写成 ${texInline("C^{-1}AC")}。双线性函数的度量矩阵按合同 ${texInline("C^TAC")} 变化。`,
      `把 ${texInline("a_{ij}")} 记成 ${texInline(String.raw`f(\varepsilon_j,\varepsilon_i)`)}。${texInline("f")} 不对称时，次序一换矩阵就成了 ${texInline("A^T")}。`,
      `以为 ${texInline(String.raw`A\ne0`)} 就非退化。非退化要求 ${texInline(String.raw`|A|\ne0`)}。`,
    ],
  },
  example: {
    title: "例题：换基后的度量矩阵",
    question: `双线性函数 ${texInline("f")} 在基 ${texInline(String.raw`\varepsilon_1,\varepsilon_2`)} 下的度量矩阵是 ${texInline(String.raw`A=\begin{pmatrix}1&2\\0&3\end{pmatrix}`)}。新基 ${texInline(String.raw`\eta_1=\varepsilon_1,\ \eta_2=\varepsilon_1+\varepsilon_2`)} 下的度量矩阵是什么？`,
    choices: [
      { correct: true, text: texInline(String.raw`\begin{pmatrix}1&3\\1&6\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&0\\0&3\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&3\\0&3\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&2\\0&3\end{pmatrix}`) },
    ],
    steps: [
      `过渡矩阵 ${texInline(String.raw`C=\begin{pmatrix}1&1\\0&1\end{pmatrix}`)}，新矩阵 ${texInline("B=C^TAC")}。`,
      `逐个读出：${texInline(String.raw`f(\eta_1,\eta_1)=a_{11}=1`)}，${texInline(String.raw`f(\eta_1,\eta_2)=a_{11}+a_{12}=3`)}，${texInline(String.raw`f(\eta_2,\eta_1)=a_{11}+a_{21}=1`)}，${texInline(String.raw`f(\eta_2,\eta_2)=1+2+0+3=6`)}。`,
      `所以 ${texInline(String.raw`B=\begin{pmatrix}1&3\\1&6\end{pmatrix}`)}，与 ${texInline("C^TAC")} 相符。`,
      `${texInline(String.raw`\begin{pmatrix}1&0\\0&3\end{pmatrix}`)} 是 ${texInline("C^{-1}AC")}，那是线性变换的换基公式；${texInline(String.raw`\begin{pmatrix}1&3\\0&3\end{pmatrix}`)} 是 ${texInline("AC")}，只换了第二个变量；${texInline("A")} 本身是旧基下的矩阵。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("P^2")} 上 ${texInline("f(x,y)=x_1y_2")} 的度量矩阵是什么？${texInline("f")} 非退化吗？`,
      answer: `${texInline(String.raw`A=\begin{pmatrix}0&1\\0&0\end{pmatrix}`)}，${texInline("|A|=0")}，${texInline("f")} 退化：例如 ${texInline(String.raw`f(\varepsilon_2,\beta)=0`)} 对一切 ${texInline(String.raw`\beta`)} 成立，而 ${texInline(String.raw`\varepsilon_2\ne0`)}。`,
    },
    {
      question: "为什么同一个双线性函数在不同基下的度量矩阵秩相同？",
      answer: `${texInline("B=C^TAC")}，${texInline("C")} 可逆，乘可逆矩阵不改变秩。所以“非退化”与基的选取无关。`,
    },
    {
      question: `欧氏空间的内积 ${texInline(String.raw`(\alpha,\beta)`)} 是双线性函数吗？它的度量矩阵有什么特点？`,
      answer: "是，并且是对称的；它的度量矩阵对称正定，就是第九章的度量矩阵。",
    },
  ],
  summary: [
    `取定基后 ${texInline(String.raw`f(\alpha,\beta)=X^TAY`)}，${texInline(String.raw`a_{ij}=f(\varepsilon_i,\varepsilon_j)`)}；固定一个变量，就得到另一个变量的线性函数。`,
    `换基 ${texInline(String.raw`(\eta)=(\varepsilon)C`)} 时度量矩阵变成 ${texInline("C^TAC")}，彼此合同；${texInline("f")} 非退化当且仅当 ${texInline(String.raw`|A|\ne0`)}。`,
    "每个双线性函数唯一地分成对称部分与反对称部分。",
  ],
});

