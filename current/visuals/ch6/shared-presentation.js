(() => {
  const texInline = (source) => (window.texInline ? window.texInline(source) : `<code>${escapeHtml(source)}</code>`);
  const texDisplay = (source) => (window.texDisplay ? window.texDisplay(source) : `<code>${escapeHtml(source)}</code>`);

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function moduleBlock(number, title, subtitle, body, className = "") {
    return `
      <section class="ch6-lesson-module ${className}">
        <div class="ch6-module-heading">
          <span>${number}</span>
          <div>
            <h3>${title}</h3>
            <p>${subtitle}</p>
          </div>
        </div>
        <div class="ch6-module-body">${body}</div>
      </section>
    `;
  }

  function formalShell(title, lead, modules, bridge = "") {
    return `
      <h2>${title}</h2>
      <div class="ch6-foundation">
        <p class="ch6-lead">${lead}</p>
        ${modules.join("")}
        ${bridge ? `<div class="ch6-bridge-note">${bridge}</div>` : ""}
      </div>
    `;
  }

  function taskBlock(section, fallback = []) {
    const prompts = section?.interactive?.prompts?.length ? section.interactive.prompts : fallback;
    if (!prompts.length) return "";
    return `
      <div class="ch6-observe-strip">
        <strong>操作以后，按顺序核对</strong>
        <ol>${prompts.map((item) => `<li>${item}</li>`).join("")}</ol>
      </div>
    `;
  }

  function labShell({ title, lead, focus, stage, controls, readout, tasks = "", className = "" }) {
    return `
      <div class="ch6-guided-lab ${className}">
        <div class="ch6-lab-header">
          <div>
            <span class="ch6-lab-kicker">交互实验</span>
            <h3>${title}</h3>
            <p>${lead}</p>
          </div>
          <div class="ch6-focus-note">
            <span>第一眼先看</span>
            <strong>${focus}</strong>
          </div>
        </div>
        ${controls ? `<div class="ch6-lab-controls" aria-label="实验控制">${controls}</div>` : ""}
        <div class="ch6-lab-stage">${stage}</div>
        <div class="ch6-lab-readout" aria-live="polite">${readout}</div>
        ${tasks}
      </div>
    `;
  }

  function segmented(items, dataName, active) {
    return `<div class="ch6-segmented" role="group">${items
      .map(
        ([value, label]) =>
          `<button type="button" data-${dataName}="${value}" aria-pressed="${String(value === active)}" class="${value === active ? "is-active" : ""}">${label}</button>`,
      )
      .join("")}</div>`;
  }

  function setActive(root, selector, predicate) {
    root.querySelectorAll(selector).forEach((button) => {
      const active = Boolean(predicate(button));
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function setStatus(element, state, title, detail) {
    if (!element) return;
    element.className = `ch6-status-card is-${state}`;
    element.innerHTML = `<strong>${title}</strong><p>${detail}</p>`;
  }

  function metric(label, attr) {
    return `<div class="ch6-metric"><span>${label}</span><strong data-${attr}>—</strong></div>`;
  }

  function gate(label, attr) {
    return `<div class="ch6-gate" data-${attr}><span></span><div><strong>${label}</strong><p>—</p></div></div>`;
  }

  function updateGate(root, attr, ok, detail) {
    const element = root.querySelector(`[data-${attr}]`);
    if (!element) return;
    element.className = `ch6-gate ${ok ? "is-ok" : "is-bad"}`;
    element.querySelector("span").textContent = ok ? "✓" : "×";
    element.querySelector("p").textContent = detail;
  }

  function formatNumber(value, digits = 2) {
    if (!Number.isFinite(value)) return "—";
    const rounded = Math.abs(value) < 1e-9 ? 0 : Number(value.toFixed(digits));
    return String(rounded);
  }

  function formatVector(vector, digits = 2) {
    return `(${vector.map((value) => formatNumber(value, digits)).join(", ")})`;
  }

  function formatMatrix(matrix, digits = 2) {
    return `[[${matrix[0].map((value) => formatNumber(value, digits)).join(", ")}], [${matrix[1]
      .map((value) => formatNumber(value, digits))
      .join(", ")}]]`;
  }

  function add(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
  }

  function sub(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
  }

  function scale(a, scalar) {
    return [a[0] * scalar, a[1] * scalar];
  }

  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }

  function cross(a, b) {
    return a[0] * b[1] - a[1] * b[0];
  }

  function norm(a) {
    return Math.hypot(a[0], a[1]);
  }

  function columns(a, b) {
    return [
      [a[0], b[0]],
      [a[1], b[1]],
    ];
  }

  function determinant(matrix) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }

  function inverse(matrix) {
    const det = determinant(matrix);
    if (Math.abs(det) < 1e-8) return null;
    return [
      [matrix[1][1] / det, -matrix[0][1] / det],
      [-matrix[1][0] / det, matrix[0][0] / det],
    ];
  }

  function matVec(matrix, vector) {
    return [
      matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
      matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
    ];
  }

  function matMul(a, b) {
    return [
      [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
      [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
    ];
  }

  function solve(a, b, vector) {
    const inv = inverse(columns(a, b));
    return inv ? matVec(inv, vector) : null;
  }

  const plane = {
    width: 640,
    height: 360,
    origin: [320, 190],
    scale: 64,
  };

  function point(vector, config = plane) {
    return [config.origin[0] + vector[0] * config.scale, config.origin[1] - vector[1] * config.scale];
  }

  function softArrow(from, to, className, label = "", config = plane) {
    const [x1, y1] = point(from, config);
    const [x2, y2] = point(to, config);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const px = -uy;
    const py = ux;
    const half = 2.4;
    const head = Math.min(17, Math.max(12, length * 0.17));
    const headHalf = 6.8;
    const neckX = x2 - ux * head;
    const neckY = y2 - uy * head;
    const f = (n) => n.toFixed(2);
    const p = (x, y) => `${f(x)} ${f(y)}`;
    const d = [
      `M ${p(x1 + px * half, y1 + py * half)}`,
      `L ${p(neckX + px * half, neckY + py * half)}`,
      `L ${p(neckX + px * headHalf, neckY + py * headHalf)}`,
      `Q ${p(x2 - ux * head * 0.2 + px, y2 - uy * head * 0.2 + py)} ${p(x2, y2)}`,
      `Q ${p(x2 - ux * head * 0.2 - px, y2 - uy * head * 0.2 - py)} ${p(neckX - px * headHalf, neckY - py * headHalf)}`,
      `L ${p(neckX - px * half, neckY - py * half)}`,
      `L ${p(x1 - px * half, y1 - py * half)}`,
      `A ${half} ${half} 0 0 0 ${p(x1 + px * half, y1 + py * half)}`,
      "Z",
    ].join(" ");

    if (!label) return `<path class="ch6-arrow ${className}" d="${d}"></path>`;

    const labelAt = length < 78 ? 0.52 : 0.67;
    const side = className.includes("is-bad") || className.includes("is-w-soft") ? -1 : 1;
    const perpendicularGap = Math.min(17, Math.max(11, length * 0.055)) * side;
    const rawX = x1 + dx * labelAt + px * perpendicularGap;
    const rawY = y1 + dy * labelAt + py * perpendicularGap;
    const marginX = Math.min(config.width * 0.28, Math.max(28, Array.from(label).length * 6.6));
    const labelX = Math.min(config.width - marginX, Math.max(marginX, rawX));
    const labelY = Math.min(config.height - 20, Math.max(20, rawY));

    return `<path class="ch6-arrow ${className}" d="${d}"></path><text class="ch6-plane-label ${className}" data-arrow-label data-tip-x="${f(x2)}" data-tip-y="${f(y2)}" text-anchor="middle" x="${f(labelX)}" y="${f(labelY)}">${escapeHtml(label)}</text>`;
  }

  function line(direction, className, label = "", offset = [0, 0], config = plane) {
    const length = 6;
    const size = norm(direction) || 1;
    const unit = scale(direction, 1 / size);
    const a = add(offset, scale(unit, -length));
    const b = add(offset, scale(unit, length));
    const pa = point(a, config);
    const pb = point(b, config);
    return `<line class="ch6-span-line ${className}" x1="${pa[0]}" y1="${pa[1]}" x2="${pb[0]}" y2="${pb[1]}"></line>${
      label ? `<text class="ch6-plane-label ${className}" text-anchor="middle" x="${Math.min(config.width - 64, Math.max(64, pb[0] - 42))}" y="${Math.min(config.height - 20, Math.max(20, pb[1] - 12))}">${escapeHtml(label)}</text>` : ""
    }`;
  }

  function planeGrid(config = plane) {
    let result = "";
    const xReach = Math.ceil(config.width / config.scale / 2) + 1;
    const yReach = Math.ceil(config.height / config.scale / 2) + 1;
    for (let x = -xReach; x <= xReach; x += 1) {
      const px = point([x, 0], config)[0];
      result += `<line class="ch6-grid-line" x1="${px}" y1="12" x2="${px}" y2="${config.height - 12}"></line>`;
    }
    for (let y = -yReach; y <= yReach; y += 1) {
      const py = point([0, y], config)[1];
      result += `<line class="ch6-grid-line" x1="12" y1="${py}" x2="${config.width - 12}" y2="${py}"></line>`;
    }
    result += `<line class="ch6-axis-line" x1="12" y1="${config.origin[1]}" x2="${config.width - 12}" y2="${config.origin[1]}"></line>`;
    result += `<line class="ch6-axis-line" x1="${config.origin[0]}" y1="12" x2="${config.origin[0]}" y2="${config.height - 12}"></line>`;
    result += `<circle class="ch6-origin" cx="${config.origin[0]}" cy="${config.origin[1]}" r="3.5"></circle>`;
    return result;
  }

  function planeSvg(inner, label, className = "") {
    return `<svg class="ch6-plane ${className}" viewBox="0 0 ${plane.width} ${plane.height}" role="img" aria-label="${escapeHtml(label)}">${inner}</svg>`;
  }

  function formulaCard(label, formula, note = "") {
    return `<div class="ch6-formula-card"><span>${label}</span>${texDisplay(formula)}${note ? `<p>${note}</p>` : ""}</div>`;
  }

  function miniMap({ xCount = 3, yCount = 3, map = [0, 1, 2], label = "映射示意" } = {}) {
    const width = 260;
    const height = 150;
    const x = 64;
    const y = 196;
    const yAt = (index, count) => 34 + (82 / Math.max(1, count - 1)) * index;
    const markerId = `mini-arrow-${xCount}-${yCount}-${map.join("-")}`.replace(/[^a-zA-Z0-9-]/g, "");
    let body = `<svg class="ch6-mini-map" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(label)}"><defs><marker id="${markerId}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path class="ch6-mini-map-marker" d="M0,0 L8,4 L0,8 Z"></path></marker></defs><ellipse cx="${x}" cy="75" rx="42" ry="63"></ellipse><ellipse cx="${y}" cy="75" rx="42" ry="63"></ellipse>`;
    for (let i = 0; i < xCount; i += 1) {
      const yy = yAt(i, xCount);
      body += `<circle cx="${x}" cy="${yy}" r="8"></circle><text x="${x}" y="${yy + 4}">${i + 1}</text>`;
      if (map[i] >= 0 && map[i] < yCount) {
        const ty = yAt(map[i], yCount);
        body += `<path marker-end="url(#${markerId})" d="M ${x + 9} ${yy} C 105 ${yy}, 150 ${ty}, ${y - 11} ${ty}"></path>`;
      }
    }
    for (let j = 0; j < yCount; j += 1) {
      const yy = yAt(j, yCount);
      body += `<circle cx="${y}" cy="${yy}" r="8"></circle><text x="${y}" y="${yy + 4}">${String.fromCharCode(97 + j)}</text>`;
    }
    return `${body}</svg>`;
  }

  function register(sectionId, formal, interactive) {
    window.defineChapter6Renderer(sectionId, {
      formal(formalRoot, section) {
        if (!formalRoot) return;
        formal(formalRoot, section);
      },
      interactive(interactiveRoot, section) {
        if (!interactiveRoot) return;
        interactive(interactiveRoot, section);
      },
    });
  }

  window.Ch6UI = {
    texInline,
    texDisplay,
    escapeHtml,
    moduleBlock,
    formalShell,
    taskBlock,
    labShell,
    segmented,
    setActive,
    setStatus,
    metric,
    gate,
    updateGate,
    formatNumber,
    formatVector,
    formatMatrix,
    add,
    sub,
    scale,
    dot,
    cross,
    norm,
    columns,
    determinant,
    inverse,
    matVec,
    matMul,
    solve,
    plane,
    point,
    softArrow,
    line,
    planeGrid,
    planeSvg,
    formulaCard,
    miniMap,
    register,
  };
})();
