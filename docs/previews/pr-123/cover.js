/*
 * 首页：首屏轮换词与问题卡、开场与换词时的像素波、顶栏底色、
 * 丝带屏、“一节怎么学”的小演示、继续学习入口与学习进度标记。
 */
(() => {
  const LEARN_HREF = "./learn.html";
  const INTRO_KEY = "la-home-intro";
  // 像素波：网格边长与三档方块（CSS 像素），波前处用最大一档
  const WAVE_CELL = 32;
  const WAVE_LEVELS = [32, 16, 8];
  // 以下时长取自 Perplexity Computer 首屏 120 帧/秒录屏的逐帧测量
  const WAVE = { top: 680, grow: 420, ramp: 0.3, clear: 130 };
  const HOLD_MS = 3800;
  // 光影视频在整张背景图里的位置（以 2400×1200 的图为准：x 446、y 80、宽 1476、高 1120）
  const GLINT_RECT = { x: 446 / 2400, y: 80 / 1200, w: 1476 / 2400, h: 1120 / 1200 };
  const GLINT_SIZES = [738, 1476];
  const GLINT_DELAY_MS = 1200;
  const WORD_OUT_MS = 250;
  const CARD_ENTER_DELAY_MS = 300;
  const CARD_TEXT_DELAY_MS = 450;
  const TYPE_MS = 22;
  // 开场（实测，自标题开始淡入起）：三张卡在 260/375/500ms 依次淡入（约 1.37s 先快后慢），标题 2s 淡入，3.4s 第一次换词
  const INTRO_CARD_AT = [260, 375, 500];
  const INTRO_FIRST_SWITCH_MS = 3400;
  const INTRO_WAVE_AT = 900;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const narrow = window.matchMedia("(max-width: 600px)");
  // 竖屏（手机、竖放的平板）：丝带换成竖版画法
  const portrait = window.matchMedia("(max-aspect-ratio: 3/4)");

  // 轮换词与对应小节的起点问题（原样取自各节 question 字段）。
  const WORDS = [
    { cn: "代数", en: "Linear Algebra", tag: "第四章 §2", href: "#ch4/matrix-operations", q: ["矩阵为什么能相加、数乘和相乘？矩阵乘法怎样把两个连续过程合成一个过程？"] },
    { cn: "方程组", en: "Linear Equations", tag: "第三章 §1", href: "#ch3/elimination", q: ["为什么交换、倍乘或倍加方程以后，解集不变？"] },
    { cn: "相关", en: "Linear Dependence", tag: "第三章 §3", href: "#ch3/linear-dependence", q: ["一组向量里，哪些向量真正带来了新方向？"] },
    { cn: "组合", en: "Linear Combination", tag: "第六章 §3", href: "#ch6/basis-coordinates", q: ["选定一组基以后，抽象向量怎样变成一列数？这列数为什么唯一？"] },
    { cn: "空间", en: "Linear Space", tag: "第六章 §8", href: "#ch6/isomorphism", q: ["外表不同的两个线性空间，什么时候具有完全相同的线性结构？"] },
    { cn: "变换", en: "Linear Transformation", tag: "第七章 §4", href: "#ch7/eigenvalues-eigenvectors", q: ["哪些方向在线性变换下只被伸缩？"] },
    { cn: "映射", en: "Linear Map", tag: "第七章 §1", href: "#ch7/linear-map-definition", q: ["什么样的变换 ", { tex: "\\sigma: V\\to V", text: "σ: V→V" }, " 保持线性组合？"] },
    { cn: "函数", en: "Linear Function", tag: "第十章 §1", href: "#ch10/linear-functional", q: ["线性函数怎样把每个向量读成一个数？"] }
  ];

  const RIBBON_TEXT = "数域 ✦ 多项式 ✦ 行列式 ✦ 克拉默法则 ✦ 矩阵的秩 ✦ 逆矩阵 ✦ 分块矩阵 ✦ 初等矩阵 ✦ 二次型 ✦ 正定 ✦ 线性空间 ✦ 基与坐标 ✦ 直和 ✦ 线性变换 ✦ 特征值 ✦ 若尔当标准形 ✦ 不变因子 ✦ 正交变换 ✦ 最小二乘 ✦ 对偶空间 ✦ 辛空间 ✦ ";

  const $ = (selector) => document.querySelector(selector);
  const later = (fn, ms) => window.setTimeout(fn, ms);
  const nextFrame = (fn) => window.requestAnimationFrame(() => window.requestAnimationFrame(fn));
  const smooth = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

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

  function texHtml(tex, fallback) {
    if (window.katex) {
      try {
        return window.katex.renderToString(tex, { throwOnError: false });
      } catch (error) {
        /* 用纯文本代替 */
      }
    }
    const span = document.createElement("span");
    span.textContent = fallback || tex;
    return span.innerHTML;
  }

  function renderTexBlocks() {
    document.querySelectorAll(".home-tex[data-tex]").forEach((el) => {
      el.innerHTML = texHtml(el.dataset.tex, el.dataset.fallback);
    });
  }

  /* ---------- 学习进度与继续学习 ---------- */

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

    const resume = $("#homeResume");
    const resumeLink = $("#homeResumeLink");
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

  // object-fit: cover 时图片实际画在哪里（与 CSS 的 object-position 一致）
  function coverRect(img, width, height) {
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const drawWidth = img.naturalWidth * scale;
    const drawHeight = img.naturalHeight * scale;
    const parts = window.getComputedStyle(img).objectPosition.split(/\s+/);
    const ratio = (value) => (value && value.endsWith("%") ? parseFloat(value) / 100 : 0.5);
    return { dx: (width - drawWidth) * ratio(parts[0]), dy: (height - drawHeight) * ratio(parts[1]), drawWidth, drawHeight };
  }

  /* ---------- 首屏：水晶的光影 ---------- */

  // 只有水晶、底座和水中倒影这一块是视频，按它在整张图里的位置叠在静图上；
  // 遮罩只露出有光影变化的地方，并羽化进静图。
  const glint = {
    video: null,
    on: false,
    playing: false,

    init() {
      const video = $("#heroGlint");
      const img = $("#heroImage");
      if (!video || !img || reduceMotion.matches || navigator.connection?.saveData) return;
      this.video = video;
      this.img = img;
      window.addEventListener("resize", () => this.place(), { passive: true });
      video.addEventListener("playing", () => {
        this.place();
        this.on = true;
        video.classList.add("is-on");
      }, { once: true });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => {
          this.visible = entry.isIntersecting;
          this.sync();
        }, { threshold: 0 }).observe($(".home-hero"));
      }
      document.addEventListener("visibilitychange", () => this.sync());
    },

    // 静图解码、开场动起来之后再去拉视频，不和首屏抢带宽
    start() {
      const video = this.video;
      if (!video || video.src) return;
      this.place();
      const box = video.parentElement;
      const cssWidth = GLINT_RECT.w * coverRect(this.img, box.clientWidth, box.clientHeight).drawWidth;
      const big = cssWidth * Math.min(window.devicePixelRatio || 1, 2) > 900;
      const type = video.canPlayType('video/mp4; codecs="avc1.640028"') ? "mp4" : "webm";
      video.src = `./assets/home/hero-glint-${big ? GLINT_SIZES[1] : GLINT_SIZES[0]}.${type}`;
      this.visible = this.visible ?? true;
      this.sync();
    },

    sync() {
      const video = this.video;
      if (!video?.src) return;
      if (this.visible !== false && !document.hidden) video.play().catch(() => {});
      else video.pause();
    },

    place() {
      const video = this.video;
      if (!video || !this.img.naturalWidth) return;
      const box = video.parentElement;
      const { dx, dy, drawWidth, drawHeight } = coverRect(this.img, box.clientWidth, box.clientHeight);
      const r = GLINT_RECT;
      video.style.left = `${dx + r.x * drawWidth}px`;
      video.style.top = `${dy + r.y * drawHeight}px`;
      video.style.width = `${r.w * drawWidth}px`;
      video.style.height = `${r.h * drawHeight}px`;
    }
  };

  /* ---------- 首屏像素：开场显影与换词时的像素波 ---------- */

  // 一道像素波从下往上扫过：只有波经过的一条带变成方块，波前处方块最大，
  // 两侧逐级变小，边缘参差不齐。开场和每次换词都用它。
  const mosaic = {
    running: false,
    cache: null,

    setup() {
      const canvas = $("#heroMosaic");
      const img = $("#heroImage");
      const ctx = canvas?.getContext("2d");
      if (!canvas || !img || !ctx || !img.naturalWidth) return null;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      const key = `${width}x${height}@${img.currentSrc}`;
      if (this.cache?.key === key) return this.cache;
      canvas.width = width;
      canvas.height = height;
      const { dx, dy, drawWidth, drawHeight } = coverRect(img, width, height);
      // 每一档方块各做一张缩小图，画的时候按格子取一块放大
      const levels = WAVE_LEVELS.map((level) => {
        const size = level * dpr;
        const small = document.createElement("canvas");
        small.width = Math.ceil(drawWidth / size) + 1;
        small.height = Math.ceil(drawHeight / size) + 1;
        const sctx = small.getContext("2d");
        sctx.imageSmoothingEnabled = true;
        sctx.imageSmoothingQuality = "high";
        sctx.drawImage(img, 0, 0, drawWidth / size, drawHeight / size);
        const base = document.createElement("canvas");
        base.width = small.width;
        base.height = small.height;
        base.getContext("2d").drawImage(small, 0, 0);
        return { small, sctx, base, size, span: WAVE_CELL / level };
      });
      this.cache = { key, canvas, ctx, width, height, dx, dy, drawWidth, drawHeight, cell: WAVE_CELL * dpr, levels };
      return this.cache;
    },

    // 每一格的固定扰动，让波前参差而不是一条直线
    noise(i, j, seed) {
      const v = Math.sin(i * 12.9898 + j * 78.233 + seed) * 43758.5453;
      return v - Math.floor(v);
    },

    // 按 Perplexity 录屏逐带测得的形状：
    // · 波前从底部出发，先慢后快（位置 ∝ t⁵），约 680ms 到达顶部；
    // · 波前上方约 30% 屏高是渐变区，方块随距离和时间逐渐变大（前 420ms 整体慢慢长起来，
    //   所以开头主要是文字在动，画面底部只是悄悄起方块）；
    // · 波前经过之后，该处约 130ms 内恢复清晰。
    draw(m, t, seed) {
      const { ctx, cell, dx, dy, levels } = m;
      ctx.clearRect(0, 0, m.width, m.height);
      ctx.imageSmoothingEnabled = false;
      const front = Math.pow(Math.min(t, WAVE.top) / WAVE.top, 5);
      const grow = Math.min(1, t / WAVE.grow);
      const i0 = Math.max(0, Math.floor(-dx / cell));
      const i1 = Math.ceil((m.width - dx) / cell);
      const j0 = Math.max(0, Math.floor(-dy / cell));
      const j1 = Math.ceil((m.height - dy) / cell);
      for (let i = i0; i < i1; i += 1) {
        const columnShift = (this.noise(i, 0, seed) - 0.5) * 0.1;
        for (let j = j0; j < j1; j += 1) {
          const y = dy + (j + 0.5) * cell;
          const sCell = Math.min(1, Math.max(0, 1 - y / m.height + columnShift + (this.noise(i, j, seed) - 0.5) * 0.06));
          const passAt = WAVE.top * Math.pow(sCell, 0.2);
          let a;
          if (t <= passAt) {
            const ahead = sCell - front;
            if (ahead >= WAVE.ramp) continue;
            a = Math.min(1 - ahead / WAVE.ramp, grow);
          } else {
            a = 1 - (t - passAt) / WAVE.clear;
          }
          if (a <= 0.14) continue;
          const level = levels[a > 0.68 ? 0 : a > 0.38 ? 1 : 2];
          ctx.drawImage(level.small, i * level.span, j * level.span, level.span, level.span, dx + i * cell, dy + j * cell, cell, cell);
        }
      }
    },

    // 光影视频在播时，把它当前这一帧也叠进方块图，波扫过时水晶的光不会突然消失
    refresh(m) {
      const video = glint.video;
      const live = glint.on && video && video.readyState >= 2;
      if (!live && !m.withVideo) return;
      m.withVideo = live;
      const r = GLINT_RECT;
      m.levels.forEach((level) => {
        level.sctx.drawImage(level.base, 0, 0);
        if (live) {
          level.sctx.drawImage(video, (r.x * m.drawWidth) / level.size, (r.y * m.drawHeight) / level.size, (r.w * m.drawWidth) / level.size, (r.h * m.drawHeight) / level.size);
        }
      });
    },

    run() {
      const m = this.setup();
      if (!m) return;
      this.refresh(m);
      this.running = true;
      const seed = Math.random() * 1000;
      const end = WAVE.top * Math.pow(1.06, 0.2) + WAVE.clear;
      this.draw(m, 0, seed);
      m.canvas.classList.add("is-active");
      const begin = performance.now();
      const frame = (now) => {
        const t = now - begin;
        if (t < end) {
          this.draw(m, t, seed);
          window.requestAnimationFrame(frame);
          return;
        }
        m.ctx.clearRect(0, 0, m.width, m.height);
        m.canvas.classList.remove("is-active");
        this.running = false;
      };
      window.requestAnimationFrame(frame);
    },

    pass() {
      if (reduceMotion.matches || this.running) return;
      this.run();
    },

    // 首图解码好以后再开场；图片迟迟不来时 3 秒后照常开始
    whenReady(fn) {
      const img = $("#heroImage");
      let done = false;
      const go = () => {
        if (done) return;
        done = true;
        fn();
      };
      later(go, 3000);
      if (!img) return go();
      (img.complete && img.naturalWidth ? Promise.resolve() : img.decode()).then(go, go);
    }
  };

  /* ---------- 首屏：轮换词与问题卡 ---------- */

  function questionUnits(word) {
    const units = [];
    word.q.forEach((part) => {
      if (typeof part === "string") units.push(...Array.from(part));
      else units.push({ html: texHtml(part.tex, part.text) });
    });
    return units;
  }

  function questionText(word) {
    return word.q.map((part) => (typeof part === "string" ? part : part.text)).join("");
  }

  function initHeadline() {
    const root = document.documentElement;
    const hero = $(".home-hero");
    const word = $("#homeWord");
    const box = $("#homeCards");
    if (!hero || !word || !box) return;
    const wordCn = word.querySelector(".home-word-cn");
    const wordEn = word.querySelector(".home-word-en");
    const n = WORDS.length;
    const entering = root.classList.contains("home-entering") && !reduceMotion.matches;
    let idx = 0;
    let serial = 0;
    let hover = false;
    let heroVisible = true;
    let elapsed = 0;
    let rotating = false;
    let cards = [];

    const step = () => parseFloat(getComputedStyle(box).getPropertyValue("--card-h")) + parseFloat(getComputedStyle(box).getPropertyValue("--card-gap"));

    function place(card) {
      const shown = !card.waiting && card.slot >= 0 && card.slot <= 2;
      card.el.style.transform = `translateY(${card.slot * step() + (card.slot < 0 ? -12 : 0)}px)`;
      card.el.classList.toggle("is-shown", shown);
      if (shown) {
        card.el.removeAttribute("aria-hidden");
        card.el.removeAttribute("tabindex");
      } else {
        card.el.setAttribute("aria-hidden", "true");
        card.el.setAttribute("tabindex", "-1");
      }
    }

    // 卡片编号一直往上数，像一串依次排进来的问题
    function makeCard(w, slot, typed, waiting) {
      const data = WORDS[w];
      serial += 1;
      const el = document.createElement("a");
      el.className = "home-card";
      el.href = LEARN_HREF + data.href;
      el.setAttribute("aria-label", `${questionText(data)}（${data.tag}）`);
      const num = document.createElement("span");
      num.className = "home-card-num";
      num.setAttribute("aria-hidden", "true");
      num.textContent = String(serial).padStart(2, "0");
      const q = document.createElement("span");
      q.className = "home-card-q";
      q.setAttribute("aria-hidden", "true");
      const tag = document.createElement("span");
      tag.className = "home-card-tag";
      tag.setAttribute("aria-hidden", "true");
      tag.textContent = data.tag;
      el.append(num, q, tag);
      const card = { el, q, w, slot, waiting: !!waiting, units: questionUnits(data), typed: 0, chars: null };
      fillCard(card, typed ? card.units.length : 0);
      box.append(el);
      place(card);
      return card;
    }

    // 问题先整句排好（透明），再逐字淡入：最新的几个字还半透明，读起来像一道柔和的边
    function fillCard(card, count) {
      card.typed = count;
      card.q.innerHTML = card.units
        .map((u, i) => `<span class="home-ch${i < count ? " is-on" : ""}">${typeof u === "string" ? escapeHtml(u) : u.html}</span>`)
        .join("");
      card.chars = Array.from(card.q.children);
    }

    function typeCard(card, ms) {
      window.clearInterval(card.timer);
      card.timer = window.setInterval(() => {
        if (document.hidden) return;
        if (card.typed >= card.chars.length) {
          window.clearInterval(card.timer);
          return;
        }
        card.chars[card.typed].classList.add("is-on");
        card.typed += 1;
      }, ms);
    }

    function showWord(i) {
      const data = WORDS[i];
      wordCn.textContent = data.cn;
      wordEn.textContent = data.en;
      word.href = LEARN_HREF + data.href;
      word.setAttribute("aria-label", `线性${data.cn}：${data.tag}`);
    }

    // 换词（同一时刻开始）：旧词模糊淡出 250ms、卡片整体上移 700ms、像素波 900ms；
    // 250ms 时新词模糊淡入 270ms，200ms 时新卡从下方滑入，450ms 时新卡文字逐字淡入
    function advance() {
      elapsed = 0;
      const next = (idx + 1) % n;
      word.classList.add("is-out");
      mosaic.pass();
      cards.forEach((card) => {
        card.slot -= 1;
        place(card);
      });
      const fresh = makeCard(next, 3, false);
      cards.push(fresh);
      later(() => {
        fresh.slot = 2;
        place(fresh);
      }, CARD_ENTER_DELAY_MS);
      later(() => {
        cards = cards.filter((card) => {
          if (card.slot >= 0) return true;
          card.el.remove();
          return false;
        });
      }, 800);
      later(() => {
        idx = next;
        showWord(idx);
        word.classList.remove("is-out");
        word.classList.add("is-pre");
        nextFrame(() => word.classList.remove("is-pre"));
      }, WORD_OUT_MS);
      later(() => typeCard(fresh, TYPE_MS), CARD_TEXT_DELAY_MS);
    }

    function startRotation(firstAfter = HOLD_MS) {
      if (rotating || reduceMotion.matches) return;
      rotating = true;
      elapsed = HOLD_MS - firstAfter;
      window.setInterval(() => {
        if (hover || document.hidden || !heroVisible) return;
        elapsed += 100;
        if (elapsed >= HOLD_MS) advance();
      }, 100);
    }

    showWord(0);
    window.addEventListener("resize", () => cards.forEach(place), { passive: true });
    [box, $("#homeHeadline")].forEach((el) => {
      el?.addEventListener("mouseenter", () => { hover = true; });
      el?.addEventListener("mouseleave", () => { hover = false; });
      el?.addEventListener("focusin", () => { hover = true; });
      el?.addEventListener("focusout", () => { hover = false; });
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }, { threshold: 0.15 }).observe(hero);
    }

    if (entering) {
      // 开场：图片已在，像素波扫过一次；标题慢慢淡入；三张卡错开约 120ms 依次淡入，各自同时出字
      writeStorage(window.sessionStorage, INTRO_KEY, "1");
      cards = [makeCard(n - 2, 0, false, true), makeCard(n - 1, 1, false, true), makeCard(0, 2, false, true)];
      cards.forEach((card) => card.el.classList.add("is-intro"));
      mosaic.whenReady(() => {
        root.classList.add("home-go");
        // 先让标题和问题卡动起来，像素波随后再从底部升起
        later(() => mosaic.pass(), INTRO_WAVE_AT);
        cards.forEach((card, k) => later(() => {
          card.waiting = false;
          place(card);
          typeCard(card, TYPE_MS);
          later(() => card.el.classList.remove("is-intro"), 1400);
        }, INTRO_CARD_AT[k]));
        startRotation(INTRO_FIRST_SWITCH_MS);
      });
      return;
    }

    // 再次进入：上两张直接显示，最下面一张对应当前词并打字
    cards = [makeCard(n - 2, 0, true), makeCard(n - 1, 1, true), makeCard(0, 2, reduceMotion.matches)];
    if (reduceMotion.matches) return;
    typeCard(cards[2], TYPE_MS);
    startRotation();
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  }

  /* ---------- 三句话逐句出现 ---------- */

  function initLead() {
    const lead = $(".home-lead");
    if (!lead || reduceMotion.matches || !("IntersectionObserver" in window)) return;
    const lines = Array.from(lead.querySelectorAll(".home-statement"));
    lead.classList.add("is-armed");
    const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      io.unobserve(entry.target);
    }), { threshold: 0.4 });
    lines.forEach((line) => io.observe(line));
  }

  /* ---------- 丝带屏 ---------- */

  const CLOUD_PUFFS = [
    [{ l: 2, t: 30, w: 34 }, { l: 18, t: 4, w: 40 }, { l: 42, t: -8, w: 42 }, { l: 64, t: 14, w: 34 }, { l: 28, t: 26, w: 44 }, { l: 54, t: 30, w: 38 }],
    [{ l: 6, t: 22, w: 30 }, { l: 24, t: -4, w: 44 }, { l: 50, t: 8, w: 36 }, { l: 70, t: 28, w: 28 }, { l: 36, t: 28, w: 40 }]
  ];
  const CLOUDS = [[44, 0], [40, 1], [46, 1], [42, 0], [48, 0], [38, 1]];
  const CLOUD_FROM = [[-50, 22], [150, 26], [-50, 76], [150, 80], [36, 145], [64, -45]];
  const CLOUD_TO = [[16, 30], [84, 28], [20, 76], [82, 74], [50, 92], [50, 10]];

  function buildClouds(box) {
    CLOUDS.forEach(([w, kind]) => {
      const h = w * 0.55;
      const cloud = document.createElement("div");
      cloud.className = "home-cloud";
      Object.assign(cloud.style, { width: `${w}vmax`, height: `${h}vmax`, marginLeft: `${-w / 2}vmax`, marginTop: `${-h / 2}vmax` });
      const base = document.createElement("div");
      base.className = "home-cloud-base";
      cloud.append(base);
      CLOUD_PUFFS[kind].forEach((p) => {
        const puff = document.createElement("div");
        puff.className = "home-cloud-puff";
        Object.assign(puff.style, { left: `${p.l}%`, top: `${p.t}%`, width: `${p.w}%` });
        cloud.append(puff);
      });
      box.append(cloud);
    });
    return Array.from(box.children);
  }

  function bezier(s, t) {
    const mt = 1 - t;
    const x = mt * mt * mt * s.p0[0] + 3 * mt * mt * t * s.c1[0] + 3 * mt * t * t * s.c2[0] + t * t * t * s.p3[0];
    const y = mt * mt * mt * s.p0[1] + 3 * mt * mt * t * s.c1[1] + 3 * mt * t * t * s.c2[1] + t * t * t * s.p3[1];
    const dx = 3 * mt * mt * (s.c1[0] - s.p0[0]) + 6 * mt * t * (s.c2[0] - s.c1[0]) + 3 * t * t * (s.p3[0] - s.c2[0]);
    const dy = 3 * mt * mt * (s.c1[1] - s.p0[1]) + 6 * mt * t * (s.c2[1] - s.c1[1]) + 3 * t * t * (s.p3[1] - s.c2[1]);
    return [x, y, dx, dy];
  }

  function polygon(left, right) {
    return `M${left.join("L")}L${right.slice().reverse().join("L")}Z`;
  }

  function initRibbon() {
    const track = $("#ribbon");
    const body = $("#ribBody");
    if (!track || !body) return null;
    const glow = $("#ribGlow");
    const svg = track.querySelector(".home-ribbon-svg");
    const bg = $("#ribbonBg");
    const paper = $("#ribbonPaper");
    const texts = ["A", "B", "C"].map((k) => $(`#ribText${k}`));
    const paths = ["A", "B", "C"].map((k) => $(`#homeRibPath${k}`));
    const clips = ["A", "B", "C"].map((k) => $(`#ribClip${k}`));
    const clouds = reduceMotion.matches ? [] : buildClouds($("#homeClouds"));
    const repeated = RIBBON_TEXT.repeat(5);
    texts.forEach((text) => { if (text?.firstElementChild) text.firstElementChild.textContent = repeated; });

    // 各段文字只留在本段中间（按各段自己的 t 计，拐点在第一段 t=1、第三段 t=0），
    // 拐弯处两段文字不再挤在一起
    const TEXT_SPAN = [[0, 0.9], [0.1, 0.9], [0.1, 1]];
    const curve = (s) => `M${s.p0.join(" ")}C${s.c1.join(" ")} ${s.c2.join(" ")} ${s.p3.join(" ")}`;
    const reversed = (s) => `M${s.p3.join(" ")}C${s.c2.join(" ")} ${s.c1.join(" ")} ${s.p0.join(" ")}`;
    const offset = (text, v) => text?.firstElementChild?.setAttribute("startOffset", v.toFixed(1));

    function landscapeFrame(p, f) {
      portraitCache?.forEach((line) => { line.text.style.display = "none"; });
      texts[1].style.display = "";
      const mob = narrow.matches;
      const wob = Math.sin(p * Math.PI * 2);
      const wob2 = Math.cos(p * Math.PI * 1.5);
      const segs = mob
        ? [{ p0: [-200, 690 + wob * 18], c1: [420, 560 - wob * 26], c2: [1180, 560 + wob * 26], p3: [1800, 690 - wob * 18], w0: 74, w1: 74 }]
        : [
            { p0: [1760, -60 + wob * 20], c1: [1300, 110 + wob * 40], c2: [560, 230 - wob * 30], p3: [180, 330], w0: 56, w1: 82 },
            { p0: [180, 330], c1: [-80, 385 + wob * 16], c2: [640, 530 + wob2 * 40], p3: [1340, 620 + wob * 20], w0: 82, w1: 124 },
            { p0: [1340, 620 + wob * 20], c1: [1640, 660 - wob2 * 16], c2: [900, 820 - wob2 * 36], p3: [-240, 1000], w0: 124, w1: 150 }
          ];
      const flipT = 0.3 + 0.4 * p;
      const N = 56;
      const left = [];
      const right = [];
      const segLeft = segs.map(() => []);
      const segRight = segs.map(() => []);
      segs.forEach((s, si) => {
        const span = mob ? [0, 1] : TEXT_SPAN[si];
        for (let k = 0; k <= N; k += 1) {
          const t = k / N;
          const [x, y, dx, dy] = bezier(s, t);
          const len = Math.hypot(dx, dy) || 1;
          let pinch = 1;
          if (!mob && si === 1) {
            const dd = Math.abs(t - flipT) / 0.2;
            pinch = dd >= 1 ? 1 : 0.02 + 0.98 * (1 - Math.cos(dd * Math.PI)) / 2;
          }
          const hw = ((s.w0 + (s.w1 - s.w0) * t) * pinch) / 2;
          const nx = (-dy / len) * hw;
          const ny = (dx / len) * hw;
          const l = `${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)}`;
          const r = `${(x - nx).toFixed(1)} ${(y - ny).toFixed(1)}`;
          if (k > 0 || si === 0) {
            left.push(l);
            right.push(r);
          }
          if (t >= span[0] - 1e-6 && t <= span[1] + 1e-6) {
            segLeft[si].push(l);
            segRight[si].push(r);
          }
        }
      });
      const d = polygon(left, right);
      body.setAttribute("d", d);
      glow?.setAttribute("d", d);

      if (mob) {
        paths[1].setAttribute("d", curve(segs[0]));
        clips[1].setAttribute("d", polygon(segLeft[0], segRight[0]));
        texts[0].style.display = "none";
        texts[2].style.display = "none";
        texts[1].setAttribute("font-size", "30");
        offset(texts[1], -2400 + f * 1400);
      } else {
        paths[0].setAttribute("d", reversed(segs[0]));
        paths[1].setAttribute("d", curve(segs[1]));
        paths[2].setAttribute("d", reversed(segs[2]));
        segs.forEach((s, si) => clips[si].setAttribute("d", polygon(segLeft[si], segRight[si])));
        texts[0].style.display = "";
        texts[2].style.display = "";
        texts[1].setAttribute("font-size", "38");
        offset(texts[0], -(1500 + f * 900));
        offset(texts[1], -3000 + f * 1600);
        offset(texts[2], -(5000 + f * 2600));
      }
    }

    // 竖屏：一条连续的丝带来回横穿整个屏幕，掉头都在屏幕左右两侧之外，
    // 所以文字在可见范围里永远走在平缓的斜线上；随滚动整条从屏幕下方升上来再离开
    const PORTRAIT = { w: 900, h: 1600, sweeps: 5, rise: 300, turn: 230, band: 62, font: 26, left: -240, right: 1140 };
    function portraitSegments(p) {
      const P = PORTRAIT;
      const length = P.sweeps * (P.rise + P.turn);
      const q = Math.min(1, Math.max(0, (p - 0.04) / 0.8));
      let y = P.h + length - q * (P.h + length);
      let dir = 1;
      const segs = [];
      for (let k = 0; k < P.sweeps; k += 1) {
        const a = dir > 0 ? P.left : P.right;
        const b = dir > 0 ? P.right : P.left;
        const y1 = y - P.rise;
        const wob = Math.sin(p * Math.PI * 2 + k * 1.3) * 34;
        segs.push({ p0: [a, y], c1: [a + dir * 640, y + wob], c2: [b - dir * 640, y1], p3: [b, y1], n: 44 });
        if (k < P.sweeps - 1) segs.push({ p0: [b, y1], c1: [b + dir * 180, y1], c2: [b + dir * 180, y1 - P.turn], p3: [b, y1 - P.turn], n: 14 });
        y = y1 - P.turn;
        dir = -dir;
      }
      return segs;
    }

    function portraitFrame(p, f) {
      const segs = portraitSegments(p);
      const hw = PORTRAIT.band / 2;
      const left = [];
      const right = [];
      segs.forEach((s, si) => {
        for (let k = si === 0 ? 0 : 1; k <= s.n; k += 1) {
          const [x, y, dx, dy] = bezier(s, k / s.n);
          const len = Math.hypot(dx, dy) || 1;
          const nx = (-dy / len) * hw;
          const ny = (dx / len) * hw;
          left.push(`${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)}`);
          right.push(`${(x - nx).toFixed(1)} ${(y - ny).toFixed(1)}`);
        }
      });
      const d = polygon(left, right);
      body.setAttribute("d", d);
      glow?.setAttribute("d", d);
      clips[1].setAttribute("d", d);
      texts.forEach((text) => { text.style.display = "none"; });
      // 每一趟横穿各用一段从左往右的文字路径：丝带在屏幕外掉头时相当于翻了个面，字始终是正的
      const lines = portraitLines();
      segs.filter((s, i) => i % 2 === 0).forEach((s, k) => {
        lines[k].path.setAttribute("d", k % 2 === 0 ? curve(s) : reversed(s));
        lines[k].text.style.display = "";
        offset(lines[k].text, -(2600 + k * 900) + f * 1500);
      });
    }

    let portraitCache = null;
    function portraitLines() {
      if (portraitCache) return portraitCache;
      const ns = "http://www.w3.org/2000/svg";
      const defs = svg.querySelector("defs");
      const group = texts[1].parentElement;
      portraitCache = Array.from({ length: PORTRAIT.sweeps }, (_, k) => {
        const path = document.createElementNS(ns, "path");
        path.id = `homeRibPathP${k}`;
        defs.append(path);
        const text = document.createElementNS(ns, "text");
        text.setAttribute("class", "home-ribbon-text");
        text.setAttribute("font-size", String(PORTRAIT.font));
        text.setAttribute("letter-spacing", "2");
        text.setAttribute("fill-opacity", "0.74");
        text.setAttribute("dominant-baseline", "central");
        const tp = document.createElementNS(ns, "textPath");
        tp.setAttribute("href", `#homeRibPathP${k}`);
        tp.textContent = RIBBON_TEXT.repeat(3);
        text.append(tp);
        group.append(text);
        return { path, text };
      });
      return portraitCache;
    }

    function frame(p) {
      const f = reduceMotion.matches ? 0 : p;
      const tall = portrait.matches;
      const box = tall ? `0 0 ${PORTRAIT.w} ${PORTRAIT.h}` : "0 0 1600 900";
      if (svg && svg.getAttribute("viewBox") !== box) svg.setAttribute("viewBox", box);
      if (tall) portraitFrame(p, f);
      else landscapeFrame(p, f);

      if (reduceMotion.matches) return;
      if (bg) bg.style.transform = `scale(${(1 + 0.08 * p).toFixed(4)}) translateY(${(-p * 2).toFixed(2)}%)`;
      const gather = smooth(0.55, 0.8, p);
      const spread = smooth(0.82, 1, p);
      if (paper) paper.style.opacity = String(smooth(0.72, 0.92, p));
      clouds.forEach((cloud, i) => {
        const from = CLOUD_FROM[i];
        const to = CLOUD_TO[i];
        let x = from[0] + (to[0] - from[0]) * gather;
        let y = from[1] + (to[1] - from[1]) * gather;
        x += (50 + (to[0] - 50) * 3 - x) * spread;
        y += (50 + (to[1] - 50) * 3 - y) * spread;
        cloud.style.opacity = (gather * (1 - spread)).toFixed(3);
        cloud.style.transform = `translate(${(x - 50).toFixed(2)}vw, ${(y - 50).toFixed(2)}vh) scale(${(0.8 + 0.2 * gather + 0.4 * spread).toFixed(3)})`;
      });
    }

    let lastP = -1;
    return {
      update(vh) {
        const r = track.getBoundingClientRect();
        const span = Math.max(1, r.height - vh);
        const p = reduceMotion.matches ? 0.3 : Math.min(1, Math.max(0, -r.top / span));
        const onScreen = r.top < vh && r.bottom > 0;
        if (onScreen && p !== lastP) {
          lastP = p;
          frame(p);
        }
        return { p, inside: r.top <= 32 && r.bottom >= 32 };
      },
      redraw() {
        lastP = -1;
      }
    };
  }

  /* ---------- 滚动：视差、顶栏、丝带 ---------- */

  function initScroll(ribbon) {
    const hero = $(".home-hero");
    const media = $("#heroMedia");
    const bar = $("#homeBar");
    let queued = false;
    const update = () => {
      queued = false;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const heroH = hero ? hero.offsetHeight : vh;
      if (media) {
        const off = reduceMotion.matches ? 0 : Math.min(y, heroH) * 0.28;
        media.style.transform = off ? `translate3d(0, ${off.toFixed(1)}px, 0)` : "";
      }
      const rib = ribbon ? ribbon.update(vh) : { p: 0, inside: false };
      const state = y < heroH - 64 ? "hero" : rib.inside && rib.p < 0.86 ? "dark" : "paper";
      if (bar && bar.dataset.bar !== state) bar.dataset.bar = state;
    };
    const request = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", () => {
      ribbon?.redraw();
      request();
    }, { passive: true });
    [narrow, portrait].forEach((query) => query.addEventListener?.("change", () => {
      ribbon?.redraw();
      request();
    }));
    update();
  }

  /* ---------- 一节怎么学：两个小演示与例题 ---------- */

  function initDemos() {
    const set = (el, attrs) => {
      if (!el) return;
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, typeof v === "number" ? v.toFixed(1) : v));
    };

    // 01：向量 ξ 在 A = [[2,1],[1,2]] 下的像，转到特征方向上时放慢
    const ev = {
      v: $("#eigenV"), vTip: $("#eigenVTip"), av: $("#eigenAv"), avTip: $("#eigenAvTip"),
      vLab: $("#eigenVLabel"), avLab: $("#eigenAvLabel"), line1: $("#eigenLine1"), line2: $("#eigenLine2")
    };
    let theta = 0.3;
    let align = 1;
    function drawEigen() {
      if (!ev.v) return;
      const U = 24;
      const O = [160, 130];
      const vx = Math.cos(theta) * 1.25;
      const vy = Math.sin(theta) * 1.25;
      const ax = 2 * vx + vy;
      const ay = vx + 2 * vy;
      const S = (x, y) => [O[0] + x * U, O[1] - y * U];
      const pv = S(vx, vy);
      const pa = S(ax, ay);
      set(ev.v, { x2: pv[0], y2: pv[1] });
      set(ev.vTip, { cx: pv[0], cy: pv[1] });
      set(ev.av, { x2: pa[0], y2: pa[1] });
      set(ev.avTip, { cx: pa[0], cy: pa[1] });
      const label = (el, p, x, y) => {
        const l = Math.hypot(x, y) || 1;
        set(el, { x: p[0] + (x / l) * 10 - 4, y: p[1] - (y / l) * 10 + 5 });
      };
      label(ev.vLab, pv, vx, vy);
      label(ev.avLab, pa, ax, ay);
      align = Math.abs(vx * ay - vy * ax) / (Math.hypot(vx, vy) * Math.hypot(ax, ay));
      const highlight = Math.max(0, 1 - align / 0.08);
      const onFirst = Math.abs(vx + vy) > Math.abs(vx - vy);
      set(ev.line1, { opacity: String(0.22 + (onFirst ? 0.68 * highlight : 0)) });
      set(ev.line2, { opacity: String(0.22 + (onFirst ? 0 : 0.68 * highlight)) });
    }

    // 02：拖动 ε₁、ε₂ 的像，网格跟着变
    const gr = {
      svg: $("#gridSvg"), lines: $("#gridLines"), cell: $("#gridCell"), i: $("#gridI"), j: $("#gridJ"),
      iHandle: $("#gridIHandle"), jHandle: $("#gridJHandle"), iHit: $("#gridIHit"), jHit: $("#gridJHit"), readout: $("#gridReadout")
    };
    let gi = [1, 0.2];
    let gj = [0.35, 1];
    let dragging = null;
    let userDragged = false;
    function drawGrid() {
      if (!gr.lines) return;
      const U = 76;
      const O = [160, 150];
      const [a, c] = gi;
      const [b, d] = gj;
      const S = (x, y) => [O[0] + (a * x + b * y) * U, O[1] - (c * x + d * y) * U];
      const P = (x, y) => S(x, y).map((v) => v.toFixed(1)).join(" ");
      let path = "";
      for (let k = -4; k <= 4; k += 0.5) path += `M${P(k, -4)}L${P(k, 4)}M${P(-4, k)}L${P(4, k)}`;
      gr.lines.setAttribute("d", path);
      gr.cell.setAttribute("d", `M${P(0, 0)}L${P(1, 0)}L${P(1, 1)}L${P(0, 1)}Z`);
      const [ix, iy] = S(1, 0);
      const [jx, jy] = S(0, 1);
      set(gr.i, { x2: ix, y2: iy });
      set(gr.j, { x2: jx, y2: jy });
      set(gr.iHandle, { cx: ix, cy: iy });
      set(gr.jHandle, { cx: jx, cy: jy });
      set(gr.iHit, { cx: ix, cy: iy });
      set(gr.jHit, { cx: jx, cy: jy });
      const fmt = (v) => (v < 0 ? "−" : "") + Math.abs(v).toFixed(1);
      if (gr.readout) gr.readout.textContent = `ε₁ ↦ (${fmt(a)}, ${fmt(c)})\nε₂ ↦ (${fmt(b)}, ${fmt(d)})\n|A| = ${fmt(a * d - b * c)}`;
    }
    if (gr.svg) {
      const start = (which) => (event) => {
        event.preventDefault();
        dragging = which;
        userDragged = true;
        try { gr.svg.setPointerCapture(event.pointerId); } catch (error) { /* 不支持时照常拖动 */ }
      };
      gr.iHit?.addEventListener("pointerdown", start("i"));
      gr.jHit?.addEventListener("pointerdown", start("j"));
      gr.svg.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        const pt = gr.svg.createSVGPoint();
        pt.x = event.clientX;
        pt.y = event.clientY;
        const q = pt.matrixTransform(gr.svg.getScreenCTM().inverse());
        const v = [Math.max(-1.9, Math.min(1.9, (q.x - 160) / 76)), Math.max(-1.05, Math.min(1.75, -(q.y - 150) / 76))];
        if (dragging === "i") gi = v;
        else gj = v;
        drawGrid();
      });
      const end = () => { dragging = null; };
      gr.svg.addEventListener("pointerup", end);
      gr.svg.addEventListener("pointercancel", end);
    }
    drawEigen();
    drawGrid();

    // 03：例题答案
    const toggle = $("#exampleToggle");
    const answer = $("#exampleAnswer");
    const hint = $("#exampleHint");
    toggle?.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "收起答案" : "展开答案";
      answer?.classList.toggle("is-open", open);
      if (hint) hint.hidden = open;
    });

    // 只在这一屏可见时转动
    const how = $("#how");
    if (!how || reduceMotion.matches || !("IntersectionObserver" in window)) return;
    let visible = false;
    let running = false;
    let last = 0;
    let elapsed = 0;
    const loop = (ts) => {
      if (!visible || document.hidden) {
        running = false;
        return;
      }
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
      last = ts;
      elapsed += dt;
      theta += dt * 0.9 * (0.18 + 0.82 * Math.min(1, align * 4));
      drawEigen();
      if (!userDragged) {
        gi = [1 + 0.3 * Math.sin(0.8 * elapsed), 0.35 * Math.sin(0.55 * elapsed)];
        gj = [0.45 * Math.sin(0.5 * elapsed + 1), 1 + 0.25 * Math.cos(0.7 * elapsed)];
        drawGrid();
      }
      window.requestAnimationFrame(loop);
    };
    const startLoop = () => {
      if (running || !visible || document.hidden) return;
      running = true;
      last = 0;
      window.requestAnimationFrame(loop);
    };
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      startLoop();
    }, { threshold: 0.05 }).observe(how);
    document.addEventListener("visibilitychange", startLoop);
  }

  function init() {
    renderTexBlocks();
    applyLearningState();
    glint.init();
    mosaic.whenReady(() => later(() => glint.start(), GLINT_DELAY_MS));
    initHeadline();
    initLead();
    initScroll(initRibbon());
    initDemos();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) applyLearningState();
  });
})();
