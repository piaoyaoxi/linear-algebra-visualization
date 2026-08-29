const COVER_CHAPTERS = [
  { id: "ch1", title: "第一章 多项式" },
  { id: "ch2", title: "第二章 行列式" },
  { id: "ch3", title: "第三章 线性方程组" },
  { id: "ch4", title: "第四章 矩阵" },
  { id: "ch5", title: "第五章 二次型" },
  { id: "ch6", title: "第六章 线性空间" },
  { id: "ch7", title: "第七章 线性变换" },
  { id: "ch8", title: "第八章 λ-矩阵" },
  { id: "ch9", title: "第九章 欧几里得空间" },
  { id: "ch10", title: "第十章 双线性函数" },
];

const INITIAL_TRANSFORM = {
  e1: { x: 1, y: 0.08 },
  e2: { x: 0.36, y: 1 },
};

const TRANSFORM_KEYFRAMES = [
  INITIAL_TRANSFORM,
  { e1: { x: 0.82, y: 0.48 }, e2: { x: -0.34, y: 0.94 } },
  { e1: { x: 1.18, y: -0.08 }, e2: { x: 0.58, y: 0.78 } },
  { e1: { x: 0.72, y: 0.18 }, e2: { x: -0.12, y: 1.18 } },
];

const coverState = {
  canvas: null,
  stage: null,
  handles: {},
  width: 0,
  height: 0,
  dpr: 1,
  basis: cloneTransform(INITIAL_TRANSFORM),
  activeHandle: null,
  animationFrame: 0,
  animationStartedAt: 0,
  paused: false,
  userControlled: false,
  reducedMotion: false,
  resizeObserver: null,
  cleanup: [],
  lastReadout: "",
  colors: null,
};

function cloneTransform(transform) {
  return {
    e1: { x: transform.e1.x, y: transform.e1.y },
    e2: { x: transform.e2.x, y: transform.e2.y },
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getChapterShortTitle(title) {
  return String(title || "")
    .replace(/^第[0-9一二三四五六七八九十百]+章/, "")
    .replace(/^[\s:：-]+/, "")
    .trim();
}

function getLearnHref(hash) {
  return `./learn.html${hash}`;
}

function renderChapters() {
  const track = document.querySelector("#coverChapters");
  if (!track) return;

  track.innerHTML = `
    <span class="cover-chapters-heading">全书十章</span>
    ${COVER_CHAPTERS.map((chapter, index) => `
      <a class="cover-chapter" href="${getLearnHref(`#${chapter.id}`)}" title="${escapeHtml(chapter.title)}">
        <span class="cover-chapter-index">${String(index + 1).padStart(2, "0")}</span>
        <span class="cover-chapter-name">${escapeHtml(getChapterShortTitle(chapter.title))}</span>
      </a>
    `).join("")}
  `;
}

function getLastLearningTarget() {
  try {
    const last = window.localStorage.getItem("la-visual-last");
    if (!last || !last.startsWith("#")) return null;
    const [route] = last.slice(1).split("/");
    return COVER_CHAPTERS.some((chapter) => chapter.id === route) ? last : null;
  } catch (_error) {
    return null;
  }
}

function updateStartLink() {
  const start = document.querySelector("#coverStart");
  if (!start) return;

  const last = getLastLearningTarget();
  start.href = getLearnHref(last || "#ch1");
  start.textContent = last ? "继续学习" : "从第一章开始";
}

function readCoverColors() {
  const styles = window.getComputedStyle(document.documentElement);
  const get = (name) => styles.getPropertyValue(name).trim();
  return {
    panel: get("--cover-panel"),
    ink: get("--cover-ink"),
    muted: get("--cover-muted"),
    line: get("--cover-line"),
    accent: get("--cover-accent"),
    grid: get("--cover-grid"),
    gridFaint: get("--cover-grid-faint"),
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

function easeInOutCubic(amount) {
  return amount < 0.5
    ? 4 * amount * amount * amount
    : 1 - Math.pow(-2 * amount + 2, 3) / 2;
}

function interpolateTransform(from, to, amount) {
  return {
    e1: {
      x: lerp(from.e1.x, to.e1.x, amount),
      y: lerp(from.e1.y, to.e1.y, amount),
    },
    e2: {
      x: lerp(from.e2.x, to.e2.x, amount),
      y: lerp(from.e2.y, to.e2.y, amount),
    },
  };
}

function getCanvasGeometry() {
  const width = coverState.width;
  const height = coverState.height;
  const scale = Math.max(46, Math.min(width / 6.6, height / 5.25));
  return {
    origin: {
      x: width * (width < 520 ? 0.46 : 0.47),
      y: height * 0.59,
    },
    scale,
    extent: Math.ceil(Math.max(width, height) / scale) + 3,
  };
}

function toScreenPoint(x, y, transformed = false) {
  const { origin, scale } = getCanvasGeometry();
  let px = x;
  let py = y;

  if (transformed) {
    px = coverState.basis.e1.x * x + coverState.basis.e2.x * y;
    py = coverState.basis.e1.y * x + coverState.basis.e2.y * y;
  }

  return {
    x: origin.x + px * scale,
    y: origin.y - py * scale,
  };
}

function drawLine(ctx, from, to, color, width = 1, alpha = 1, dash = []) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

function drawArrow(ctx, from, to, color, width) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const arrowLength = 11;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(
    to.x - arrowLength * Math.cos(angle - Math.PI / 6),
    to.y - arrowLength * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    to.x - arrowLength * Math.cos(angle + Math.PI / 6),
    to.y - arrowLength * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGrid(ctx, colors) {
  const { origin, extent } = getCanvasGeometry();

  for (let index = -extent; index <= extent; index += 1) {
    drawLine(
      ctx,
      toScreenPoint(-extent, index),
      toScreenPoint(extent, index),
      colors.gridFaint,
      1,
    );
    drawLine(
      ctx,
      toScreenPoint(index, -extent),
      toScreenPoint(index, extent),
      colors.gridFaint,
      1,
    );
  }

  for (let index = -extent; index <= extent; index += 1) {
    drawLine(
      ctx,
      toScreenPoint(-extent, index, true),
      toScreenPoint(extent, index, true),
      colors.grid,
      index === 0 ? 1.4 : 1,
      index === 0 ? 0.88 : 0.76,
    );
    drawLine(
      ctx,
      toScreenPoint(index, -extent, true),
      toScreenPoint(index, extent, true),
      colors.grid,
      index === 0 ? 1.4 : 1,
      index === 0 ? 0.88 : 0.76,
    );
  }

  const originalSquare = [
    toScreenPoint(0, 0),
    toScreenPoint(1, 0),
    toScreenPoint(1, 1),
    toScreenPoint(0, 1),
  ];

  ctx.save();
  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.moveTo(originalSquare[0].x, originalSquare[0].y);
  originalSquare.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  const transformedSquare = [
    toScreenPoint(0, 0, true),
    toScreenPoint(1, 0, true),
    toScreenPoint(1, 1, true),
    toScreenPoint(0, 1, true),
  ];

  ctx.save();
  ctx.fillStyle = colors.accent;
  ctx.strokeStyle = colors.accent;
  ctx.globalAlpha = 0.11;
  ctx.beginPath();
  ctx.moveTo(transformedSquare[0].x, transformedSquare[0].y);
  transformedSquare.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.72;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  const first = toScreenPoint(1, 0, true);
  const second = toScreenPoint(0, 1, true);
  drawArrow(ctx, origin, first, colors.accent, 2.5);
  drawArrow(ctx, origin, second, colors.ink, 2.2);

  ctx.save();
  ctx.fillStyle = colors.ink;
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function setHandlePosition(handle, point) {
  if (!handle) return;
  const halfWidth = handle.offsetWidth / 2 || 22;
  const halfHeight = handle.offsetHeight / 2 || 22;
  handle.style.setProperty("--handle-x", `${point.x - halfWidth}px`);
  handle.style.setProperty("--handle-y", `${point.y - halfHeight}px`);
}

function formatValue(value) {
  return Math.abs(value) < 0.005 ? "0.00" : value.toFixed(2);
}

function updateReadout() {
  const { e1, e2 } = coverState.basis;
  const determinant = e1.x * e2.y - e2.x * e1.y;
  const values = [e1.x, e2.x, e1.y, e2.y].map(formatValue);
  const nextReadout = `${values.join("|")}|${formatValue(Math.abs(determinant))}`;
  if (nextReadout === coverState.lastReadout) return;
  coverState.lastReadout = nextReadout;

  const targets = ["matrixA", "matrixB", "matrixC", "matrixD"];
  targets.forEach((id, index) => {
    const node = document.getElementById(id);
    if (node) node.textContent = values[index];
  });

  const determinantNode = document.querySelector("#determinantValue");
  if (determinantNode) determinantNode.textContent = formatValue(Math.abs(determinant));

  const firstHandle = coverState.handles.e1;
  const secondHandle = coverState.handles.e2;
  if (firstHandle) {
    firstHandle.setAttribute(
      "aria-label",
      `第一基向量 e₁，当前坐标 ${formatValue(e1.x)}, ${formatValue(e1.y)}。使用方向键移动`,
    );
  }
  if (secondHandle) {
    secondHandle.setAttribute(
      "aria-label",
      `第二基向量 e₂，当前坐标 ${formatValue(e2.x)}, ${formatValue(e2.y)}。使用方向键移动`,
    );
  }
}

function drawTransform() {
  const canvas = coverState.canvas;
  if (!canvas || !coverState.width || !coverState.height) return;

  const ctx = canvas.getContext("2d");
  const colors = coverState.colors || readCoverColors();
  coverState.colors = colors;
  ctx.setTransform(coverState.dpr, 0, 0, coverState.dpr, 0, 0);
  ctx.clearRect(0, 0, coverState.width, coverState.height);
  drawGrid(ctx, colors);

  setHandlePosition(coverState.handles.e1, toScreenPoint(1, 0, true));
  setHandlePosition(coverState.handles.e2, toScreenPoint(0, 1, true));
  updateReadout();
}

function syncCanvasSize() {
  if (!coverState.canvas || !coverState.stage) return;
  const rect = coverState.stage.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  coverState.width = Math.max(1, rect.width);
  coverState.height = Math.max(1, rect.height);
  coverState.dpr = dpr;
  coverState.canvas.width = Math.max(1, Math.round(rect.width * dpr));
  coverState.canvas.height = Math.max(1, Math.round(rect.height * dpr));
  drawTransform();
}

function animateTransform(timestamp) {
  if (!coverState.animationStartedAt) coverState.animationStartedAt = timestamp;

  if (!coverState.reducedMotion && !coverState.paused && !coverState.userControlled) {
    const segmentDuration = 6200;
    const elapsed = Math.max(0, timestamp - coverState.animationStartedAt);
    const segmentIndex = Math.floor(elapsed / segmentDuration) % TRANSFORM_KEYFRAMES.length;
    const nextIndex = (segmentIndex + 1) % TRANSFORM_KEYFRAMES.length;
    const segmentProgress = (elapsed % segmentDuration) / segmentDuration;
    const movingProgress = clamp((segmentProgress - 0.12) / 0.76, 0, 1);
    const eased = easeInOutCubic(movingProgress);
    coverState.basis = interpolateTransform(
      TRANSFORM_KEYFRAMES[segmentIndex],
      TRANSFORM_KEYFRAMES[nextIndex],
      eased,
    );
    drawTransform();
  }

  coverState.animationFrame = window.requestAnimationFrame(animateTransform);
}

function clientPointToVector(clientX, clientY) {
  const rect = coverState.stage.getBoundingClientRect();
  const { origin, scale } = getCanvasGeometry();
  let x = (clientX - rect.left - origin.x) / scale;
  let y = -(clientY - rect.top - origin.y) / scale;

  x = clamp(x, -2.15, 2.15);
  y = clamp(y, -1.85, 1.85);

  const length = Math.hypot(x, y);
  if (length < 0.18) {
    const angle = length > 0.001 ? Math.atan2(y, x) : 0;
    x = Math.cos(angle) * 0.18;
    y = Math.sin(angle) * 0.18;
  }

  return { x, y };
}

function announceTransform(prefix) {
  const status = document.querySelector("#matrixStatus");
  if (!status) return;
  const { e1, e2 } = coverState.basis;
  const determinant = e1.x * e2.y - e2.x * e1.y;
  status.textContent = `${prefix}。面积倍率 ${formatValue(Math.abs(determinant))}`;
}

function moveBasisWithKeyboard(key, event) {
  const vector = coverState.basis[key];
  if (!vector) return;
  const amount = event.shiftKey ? 0.18 : 0.08;
  let handled = true;

  if (event.key === "ArrowLeft") vector.x -= amount;
  else if (event.key === "ArrowRight") vector.x += amount;
  else if (event.key === "ArrowUp") vector.y += amount;
  else if (event.key === "ArrowDown") vector.y -= amount;
  else handled = false;

  if (!handled) return;
  event.preventDefault();
  coverState.userControlled = true;
  vector.x = clamp(vector.x, -2.15, 2.15);
  vector.y = clamp(vector.y, -1.85, 1.85);
  drawTransform();
  announceTransform(key === "e1" ? "第一基向量已移动" : "第二基向量已移动");
}

function bindHandle(handle, key) {
  if (!handle) return;

  const startDrag = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    coverState.userControlled = true;
    coverState.activeHandle = { key, pointerId: event.pointerId };
    handle.classList.add("is-dragging");
    handle.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event) => {
    if (
      !coverState.activeHandle
      || coverState.activeHandle.key !== key
      || coverState.activeHandle.pointerId !== event.pointerId
    ) return;
    coverState.basis[key] = clientPointToVector(event.clientX, event.clientY);
    drawTransform();
  };

  const endDrag = (event) => {
    if (
      !coverState.activeHandle
      || coverState.activeHandle.key !== key
      || coverState.activeHandle.pointerId !== event.pointerId
    ) return;
    coverState.activeHandle = null;
    handle.classList.remove("is-dragging");
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    announceTransform(key === "e1" ? "第一基向量已更新" : "第二基向量已更新");
  };

  const keydown = (event) => moveBasisWithKeyboard(key, event);
  handle.addEventListener("pointerdown", startDrag);
  handle.addEventListener("pointermove", moveDrag);
  handle.addEventListener("pointerup", endDrag);
  handle.addEventListener("pointercancel", endDrag);
  handle.addEventListener("keydown", keydown);

  coverState.cleanup.push(() => {
    handle.removeEventListener("pointerdown", startDrag);
    handle.removeEventListener("pointermove", moveDrag);
    handle.removeEventListener("pointerup", endDrag);
    handle.removeEventListener("pointercancel", endDrag);
    handle.removeEventListener("keydown", keydown);
  });
}

function resetTransform() {
  coverState.userControlled = true;
  coverState.basis = cloneTransform(INITIAL_TRANSFORM);
  drawTransform();
  announceTransform("变换已重置");
}

function setupTransformLab() {
  coverState.canvas = document.querySelector("#transformCanvas");
  coverState.stage = document.querySelector("#transformStage");
  coverState.handles = {
    e1: document.querySelector("#basisE1"),
    e2: document.querySelector("#basisE2"),
  };
  const lab = document.querySelector("#transformLab");
  const reset = document.querySelector("#transformReset");
  if (!coverState.canvas || !coverState.stage || !lab || !reset) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  coverState.reducedMotion = reducedMotion.matches;

  const onReducedMotion = (event) => {
    coverState.reducedMotion = event.matches;
    if (event.matches && !coverState.userControlled) {
      coverState.basis = cloneTransform(INITIAL_TRANSFORM);
      drawTransform();
    }
  };
  const onColorScheme = () => {
    coverState.colors = readCoverColors();
    drawTransform();
  };
  const pause = () => { coverState.paused = true; };
  const resume = () => {
    coverState.paused = false;
    coverState.animationStartedAt = performance.now();
  };

  reducedMotion.addEventListener("change", onReducedMotion);
  colorScheme.addEventListener("change", onColorScheme);
  lab.addEventListener("pointerenter", pause);
  lab.addEventListener("pointerleave", resume);
  lab.addEventListener("focusin", pause);
  lab.addEventListener("focusout", resume);
  reset.addEventListener("click", resetTransform);

  coverState.cleanup.push(() => {
    reducedMotion.removeEventListener("change", onReducedMotion);
    colorScheme.removeEventListener("change", onColorScheme);
    lab.removeEventListener("pointerenter", pause);
    lab.removeEventListener("pointerleave", resume);
    lab.removeEventListener("focusin", pause);
    lab.removeEventListener("focusout", resume);
    reset.removeEventListener("click", resetTransform);
  });

  bindHandle(coverState.handles.e1, "e1");
  bindHandle(coverState.handles.e2, "e2");

  if ("ResizeObserver" in window) {
    coverState.resizeObserver = new ResizeObserver(syncCanvasSize);
    coverState.resizeObserver.observe(coverState.stage);
  } else {
    window.addEventListener("resize", syncCanvasSize, { passive: true });
    coverState.cleanup.push(() => window.removeEventListener("resize", syncCanvasSize));
  }

  syncCanvasSize();
  coverState.animationStartedAt = performance.now();
  coverState.animationFrame = window.requestAnimationFrame(animateTransform);
}

function stopCover() {
  if (coverState.animationFrame) {
    window.cancelAnimationFrame(coverState.animationFrame);
    coverState.animationFrame = 0;
  }
  if (coverState.resizeObserver) {
    coverState.resizeObserver.disconnect();
    coverState.resizeObserver = null;
  }
  coverState.cleanup.splice(0).forEach((cleanup) => cleanup());
  coverState.activeHandle = null;
}

function initCover() {
  stopCover();
  coverState.basis = cloneTransform(INITIAL_TRANSFORM);
  coverState.userControlled = false;
  coverState.paused = false;
  coverState.animationStartedAt = 0;
  coverState.lastReadout = "";
  coverState.colors = readCoverColors();
  renderChapters();
  updateStartLink();
  setupTransformLab();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCover, { once: true });
} else {
  initCover();
}

window.addEventListener("pagehide", stopCover);
window.addEventListener("pageshow", (event) => {
  if (event.persisted) initCover();
});
