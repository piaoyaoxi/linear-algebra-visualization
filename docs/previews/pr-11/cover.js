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

const COVER_KEYFRAMES = [
  { a: 1, b: 0, c: 0, d: 1 },
  { a: 0.94, b: -0.36, c: 0.36, d: 0.94 },
  { a: 1, b: 0, c: 0, d: 1 },
  { a: 1, b: 0.55, c: 0, d: 1 },
  { a: 1, b: 0, c: 0, d: 1 },
  { a: 1.26, b: 0, c: 0.16, d: 0.78 },
  { a: 1, b: 0, c: 0, d: 1 },
  { a: 0.84, b: 0.42, c: -0.28, d: 0.92 },
];

const coverAnim = { raf: 0, resize: null };

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
    .replace(/^[\s·:：\-—]+/, "")
    .trim();
}

function getLastLearningTarget() {
  const last = localStorage.getItem("la-visual-last");
  if (!last || !last.startsWith("#")) return null;
  const [route] = last.slice(1).split("/");
  return COVER_CHAPTERS.some((chapter) => chapter.id === route) ? last : null;
}

function getLearnHref(hash) {
  return `./learn.html${hash}`;
}

function renderChapterOrbit() {
  const orbit = document.querySelector("#coverOrbit");
  if (!orbit) return;
  const count = COVER_CHAPTERS.length;
  orbit.innerHTML = COVER_CHAPTERS.map((chapter, index) => {
    const angle = (((index / count) * 360 - 90 + 180 / count) * Math.PI) / 180;
    const nx = 50 + 42 * Math.cos(angle);
    const ny = 50 + 38 * Math.sin(angle);
    return `
      <a class="cover-node" href="${getLearnHref(`#${chapter.id}`)}" style="--nx:${nx.toFixed(2)}%; --ny:${ny.toFixed(2)}%; --float-delay:${(index * 0.65).toFixed(2)}s" aria-label="${escapeHtml(chapter.title)}">
        <span class="cover-node-index">${String(index + 1).padStart(2, "0")}</span>
        <span class="cover-node-name">${escapeHtml(getChapterShortTitle(chapter.title))}</span>
      </a>`;
  }).join("");
}

function updateStartLink() {
  const start = document.querySelector("#coverStart");
  if (!start) return;
  const last = getLastLearningTarget();
  start.href = getLearnHref(last || "#guide");
  start.textContent = last ? "继续学习" : "开始学习";
}

function lerp(from, to, t) { return from + (to - from) * t; }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function drawArrow(ctx, from, to, color, label) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.7;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - 10 * Math.cos(angle - Math.PI / 6), to.y - 10 * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(to.x - 10 * Math.cos(angle + Math.PI / 6), to.y - 10 * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.font = "700 13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText(label, to.x + 8, to.y - 8);
}

function drawCoverFrame(canvas, matrix) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;
  if (!width || !height) return;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const origin = { x: width * 0.5, y: height * 0.54 };
  const scale = Math.min(width, height) / 7.6;
  const extent = Math.ceil(Math.max(width, height) / scale) + 2;
  const point = (x, y, transformed = false) => {
    const px = transformed ? matrix.a * x + matrix.b * y : x;
    const py = transformed ? matrix.c * x + matrix.d * y : y;
    return { x: origin.x + px * scale, y: origin.y - py * scale };
  };
  const line = (from, to, color, lineWidth, alpha) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  };

  for (let i = -extent; i <= extent; i += 1) {
    line(point(-extent, i), point(extent, i), "rgba(214,236,228,1)", 1, 0.05);
    line(point(i, -extent), point(i, extent), "rgba(214,236,228,1)", 1, 0.05);
  }
  for (let i = -extent; i <= extent; i += 1) {
    const isAxis = i === 0;
    line(point(-extent, i, true), point(extent, i, true), "rgba(95,227,211,1)", isAxis ? 1.6 : 1, isAxis ? 0.5 : 0.15);
    line(point(i, -extent, true), point(i, extent, true), "rgba(232,195,117,1)", isAxis ? 1.6 : 1, isAxis ? 0.42 : 0.12);
  }

  const square = [point(0, 0, true), point(1, 0, true), point(1, 1, true), point(0, 1, true)];
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(square[0].x, square[0].y);
  square.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fillStyle = "rgba(95,227,211,.07)";
  ctx.strokeStyle = "rgba(95,227,211,.4)";
  ctx.lineWidth = 1.2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "rgba(150,226,210,.2)";
  for (let i = -4; i <= 4; i += 1) {
    for (let j = -4; j <= 4; j += 1) {
      if (i === 0 && j === 0) continue;
      const dot = point(i, j, true);
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "rgba(95,227,211,.6)";
  ctx.shadowBlur = 16;
  drawArrow(ctx, origin, point(1, 0, true), "#5fe3d3", "e₁");
  ctx.shadowColor = "rgba(232,195,117,.55)";
  drawArrow(ctx, origin, point(0, 1, true), "#e8c375", "e₂");
  ctx.restore();

  ctx.fillStyle = "rgba(240,250,246,.9)";
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 3.4, 0, Math.PI * 2);
  ctx.fill();
}

function startCoverAnimation() {
  const canvas = document.querySelector("#coverCanvas");
  if (!canvas) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const staticMatrix = { a: 1, b: 0.4, c: 0.16, d: 0.94 };
  const size = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  };
  size();
  coverAnim.resize = () => { size(); if (reduceMotion) drawCoverFrame(canvas, staticMatrix); };
  window.addEventListener("resize", coverAnim.resize, { passive: true });
  if (reduceMotion) { drawCoverFrame(canvas, staticMatrix); return; }

  const segment = 5200;
  const total = COVER_KEYFRAMES.length * segment;
  // rAF's frame timestamp can briefly precede performance.now() at schedule time.
  // Clamp elapsed so local time never goes negative (negative % in JS stays negative
  // and would yield COVER_KEYFRAMES[-1] === undefined, killing the grid animation).
  let startTime = null;
  const frame = (now) => {
    if (startTime == null) startTime = now;
    const elapsed = Math.max(0, now - startTime);
    const local = elapsed % total;
    const index = Math.floor(local / segment) % COVER_KEYFRAMES.length;
    const t = easeInOutCubic((local % segment) / segment);
    const from = COVER_KEYFRAMES[index];
    const to = COVER_KEYFRAMES[(index + 1) % COVER_KEYFRAMES.length];
    drawCoverFrame(canvas, {
      a: lerp(from.a, to.a, t),
      b: lerp(from.b, to.b, t),
      c: lerp(from.c, to.c, t),
      d: lerp(from.d, to.d, t),
    });
    coverAnim.raf = window.requestAnimationFrame(frame);
  };
  coverAnim.raf = window.requestAnimationFrame(frame);
}

function initCover() {
  renderChapterOrbit();
  updateStartLink();
  startCoverAnimation();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initCover, { once: true });
else initCover();
