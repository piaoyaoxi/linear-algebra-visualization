/*
 * 首页：继续学习入口、学习进度标记、首屏视差与开场像素化显影。
 */
(() => {
  const LEARN_HREF = "./learn.html";
  const INTRO_KEY = "la-home-intro";
  const MOSAIC_STEPS = [48, 30, 18, 10, 5];
  const MOSAIC_STEP_MS = 110;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function readStorage(storage, key) {
    try {
      return storage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeStorage(storage, key, value) {
    try {
      storage.setItem(key, value);
    } catch (error) {
      /* 存储不可用时跳过 */
    }
  }

  function readProgress() {
    try {
      const list = JSON.parse(readStorage(window.localStorage, "la-visual-progress") || "[]");
      return new Set(Array.isArray(list) ? list : []);
    } catch (error) {
      return new Set();
    }
  }

  function readLastTarget() {
    const last = readStorage(window.localStorage, "la-visual-last");
    return last && /^#ch\d+(\/[\w-]+)?$/.test(last) ? last : null;
  }

  function sectionTitle(link) {
    const clone = link.cloneNode(true);
    clone.querySelectorAll(".home-section-num, .home-sr").forEach((node) => node.remove());
    return clone.textContent.trim();
  }

  function applyLearningState() {
    const done = readProgress();
    document.querySelectorAll(".home-sections a[data-section]").forEach((link) => {
      const isDone = done.has(link.dataset.section);
      link.classList.toggle("is-done", isDone);
      let note = link.querySelector(".home-done-note");
      if (isDone && !note) {
        note = document.createElement("span");
        note.className = "home-sr home-done-note";
        note.textContent = "（已完成）";
        link.append(note);
      } else if (!isDone && note) {
        note.remove();
      }
    });

    const last = readLastTarget();
    const target = last ? document.querySelector(`.home-chapters a[href="${LEARN_HREF}${last}"]`) : null;
    document.querySelectorAll(".home-sections a.is-last").forEach((link) => link.classList.remove("is-last"));

    const resume = document.querySelector("#homeResume");
    const resumeLink = document.querySelector("#homeResumeLink");
    if (!resume || !resumeLink) return;
    if (!target) {
      resume.hidden = true;
      return;
    }

    const chapter = target.closest(".home-chapter");
    const chapterLabel = chapter?.querySelector(".home-chapter-title .home-sr")?.textContent.trim() || "";
    const chapterName = sectionTitle(chapter?.querySelector(".home-chapter-title a") || target);
    const isSection = target.hasAttribute("data-section");
    if (isSection) target.classList.add("is-last");
    resumeLink.href = `${LEARN_HREF}${last}`;
    resumeLink.textContent = `${chapterLabel} · ${isSection ? target.dataset.short || sectionTitle(target) : chapterName}`;
    resume.hidden = false;
  }

  function initParallax() {
    const hero = document.querySelector(".home-hero");
    const media = document.querySelector("#heroMedia");
    if (!hero || !media) return;

    let queued = false;
    const update = () => {
      queued = false;
      const offset = reduceMotion.matches ? 0 : Math.min(window.scrollY, hero.offsetHeight) * 0.28;
      media.style.transform = offset ? `translate3d(0, ${offset.toFixed(1)}px, 0)` : "";
    };
    const request = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
    update();
  }

  function objectPosition(img) {
    const parts = window.getComputedStyle(img).objectPosition.split(/\s+/);
    const toRatio = (value) => (value && value.endsWith("%") ? parseFloat(value) / 100 : 0.5);
    return [toRatio(parts[0]), toRatio(parts[1])];
  }

  function finishIntro(canvas) {
    document.documentElement.classList.remove("home-intro");
    if (canvas) canvas.classList.remove("is-active");
  }

  function playIntro() {
    const root = document.documentElement;
    if (!root.classList.contains("home-intro")) return;
    const img = document.querySelector("#heroImage");
    const canvas = document.querySelector("#heroMosaic");
    const ctx = canvas?.getContext("2d");
    if (!img || !canvas || !ctx || reduceMotion.matches) {
      finishIntro(canvas);
      return;
    }
    writeStorage(window.sessionStorage, INTRO_KEY, "1");

    const fallback = window.setTimeout(() => finishIntro(canvas), 3000);
    const ready = img.complete && img.naturalWidth ? Promise.resolve() : img.decode();
    ready.then(() => {
      window.clearTimeout(fallback);
      if (!root.classList.contains("home-intro")) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;

      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const drawWidth = img.naturalWidth * scale;
      const drawHeight = img.naturalHeight * scale;
      const [px, py] = objectPosition(img);
      const dx = (width - drawWidth) * px;
      const dy = (height - drawHeight) * py;
      const small = document.createElement("canvas");
      const smallCtx = small.getContext("2d");

      const drawStep = (block) => {
        const size = block * dpr;
        const cols = Math.max(1, Math.ceil(drawWidth / size));
        const rows = Math.max(1, Math.ceil(drawHeight / size));
        small.width = cols;
        small.height = rows;
        smallCtx.imageSmoothingEnabled = true;
        smallCtx.imageSmoothingQuality = "high";
        smallCtx.drawImage(img, 0, 0, cols, rows);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(small, 0, 0, cols, rows, dx, dy, cols * size, rows * size);
      };

      let step = 0;
      drawStep(MOSAIC_STEPS[step]);
      canvas.classList.add("is-active");
      const timer = window.setInterval(() => {
        step += 1;
        if (step < MOSAIC_STEPS.length) {
          drawStep(MOSAIC_STEPS[step]);
          return;
        }
        window.clearInterval(timer);
        finishIntro(canvas);
      }, MOSAIC_STEP_MS);
    }).catch(() => {
      window.clearTimeout(fallback);
      finishIntro(canvas);
    });
  }

  function init() {
    applyLearningState();
    initParallax();
    playIntro();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) applyLearningState();
  });
})();
