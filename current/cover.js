/*
 * 首页：首屏轮换词与问题卡、开场像素显影与换词时的局部像素波动、顶栏底色、
 * 丝带屏、“一节怎么学”的小演示、继续学习入口与学习进度标记。
 */
(() => {
  const LEARN_HREF = "./learn.html";
  const INTRO_KEY = "la-home-intro";
  const MOSAIC_STEPS = [48, 30, 18, 10, 5];
  const MOSAIC_STEP_MS = 110;
  const BURST_STEPS = [10, 18, 28, 28, 18, 10];
  // 首图中平行六面体连同底座所占的范围：[左, 上, 右, 下]，按原图宽高的比例
  const SUBJECT = [0.2, 0.26, 0.6, 0.78];
  const BURST_STEP_MS = 100;
  const HOLD_MS = 4000;
  const TYPE_MS = 42;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const narrow = window.matchMedia("(max-width: 600px)");

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

  /* ---------- 首屏像素：开场显影与换词波动 ---------- */

  const mosaic = {
    busy: false,
    small: null,

    setup() {
      const canvas = $("#heroMosaic");
      const img = $("#heroImage");
      const ctx = canvas?.getContext("2d");
      if (!canvas || !img || !ctx || !img.naturalWidth) return null;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const drawWidth = img.naturalWidth * scale;
      const drawHeight = img.naturalHeight * scale;
      const parts = window.getComputedStyle(img).objectPosition.split(/\s+/);
      const ratio = (value) => (value && value.endsWith("%") ? parseFloat(value) / 100 : 0.5);
      return {
        canvas, ctx, img, dpr, width, height, drawWidth, drawHeight,
        dx: (width - drawWidth) * ratio(parts[0]),
        dy: (height - drawHeight) * ratio(parts[1])
      };
    },

    draw(m, block, rects) {
      const size = block * m.dpr;
      const cols = Math.max(1, Math.ceil(m.drawWidth / size));
      const rows = Math.max(1, Math.ceil(m.drawHeight / size));
      const small = this.small || (this.small = document.createElement("canvas"));
      const smallCtx = small.getContext("2d");
      small.width = cols;
      small.height = rows;
      smallCtx.imageSmoothingEnabled = true;
      smallCtx.imageSmoothingQuality = "high";
      smallCtx.drawImage(m.img, 0, 0, cols, rows);
      m.ctx.clearRect(0, 0, m.width, m.height);
      m.ctx.imageSmoothingEnabled = false;
      rects.forEach((r) => {
        m.ctx.save();
        m.ctx.beginPath();
        m.ctx.rect(r.x, r.y, r.w, r.h);
        m.ctx.clip();
        m.ctx.drawImage(small, 0, 0, cols, rows, m.dx, m.dy, cols * size, rows * size);
        m.ctx.restore();
      });
    },

    run(m, steps, ms, rects, done) {
      let i = 0;
      this.busy = true;
      this.draw(m, steps[i], rects);
      m.canvas.classList.add("is-active");
      const timer = window.setInterval(() => {
        i += 1;
        if (i < steps.length) {
          this.draw(m, steps[i], rects);
          return;
        }
        window.clearInterval(timer);
        this.busy = false;
        done();
      }, ms);
    },

    // 换词时随机挑 3–5 块矩形，碎成方块再恢复
    burst() {
      if (reduceMotion.matches || this.busy || document.documentElement.classList.contains("home-intro")) return;
      const m = this.setup();
      if (!m) return;
      const grid = BURST_STEPS[2] * m.dpr;
      const snap = (v) => Math.round(v / grid) * grid;
      // 平行六面体和底座（原图坐标）不参与波动，免得主体像被打码
      const keep = {
        x0: m.dx + SUBJECT[0] * m.drawWidth, x1: m.dx + SUBJECT[2] * m.drawWidth,
        y0: m.dy + SUBJECT[1] * m.drawHeight, y1: m.dy + SUBJECT[3] * m.drawHeight
      };
      const hitsSubject = (r) => r.x < keep.x1 && r.x + r.w > keep.x0 && r.y < keep.y1 && r.y + r.h > keep.y0;
      const count = 3 + Math.floor(Math.random() * 3);
      const rects = [];
      for (let tries = 0; rects.length < count && tries < 60; tries += 1) {
        const w = snap((0.08 + Math.random() * 0.14) * m.width) || grid;
        const h = snap((0.1 + Math.random() * 0.16) * m.height) || grid;
        const r = { x: snap(Math.random() * (m.width - w)), y: snap(Math.random() * (m.height - h)), w, h };
        if (!hitsSubject(r)) rects.push(r);
      }
      if (!rects.length) return;
      this.run(m, BURST_STEPS, BURST_STEP_MS, rects, () => {
        m.ctx.clearRect(0, 0, m.width, m.height);
        m.canvas.classList.remove("is-active");
      });
    },

    intro() {
      const root = document.documentElement;
      if (!root.classList.contains("home-intro")) return;
      const img = $("#heroImage");
      const canvas = $("#heroMosaic");
      const finish = () => {
        root.classList.remove("home-intro");
        canvas?.classList.remove("is-active");
      };
      if (!img || !canvas || reduceMotion.matches) {
        finish();
        return;
      }
      writeStorage(window.sessionStorage, INTRO_KEY, "1");
      const fallback = later(finish, 3000);
      const ready = img.complete && img.naturalWidth ? Promise.resolve() : img.decode();
      ready.then(() => {
        window.clearTimeout(fallback);
        if (!root.classList.contains("home-intro")) return;
        const m = this.setup();
        if (!m) {
          finish();
          return;
        }
        this.run(m, MOSAIC_STEPS, MOSAIC_STEP_MS, [{ x: 0, y: 0, w: m.width, h: m.height }], finish);
      }).catch(() => {
        window.clearTimeout(fallback);
        finish();
      });
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
    const hero = $(".home-hero");
    const word = $("#homeWord");
    const box = $("#homeCards");
    if (!hero || !word || !box) return;
    const wordCn = word.querySelector(".home-word-cn");
    const wordEn = word.querySelector(".home-word-en");
    const n = WORDS.length;
    let idx = 0;
    let hover = false;
    let heroVisible = true;
    let elapsed = 0;
    let typer = 0;
    let cards = [];

    const step = () => parseFloat(getComputedStyle(box).getPropertyValue("--card-h")) + parseFloat(getComputedStyle(box).getPropertyValue("--card-gap"));

    function place(card) {
      const shown = card.slot >= 0 && card.slot <= 2;
      card.el.style.transform = `translateY(${card.slot * step() + (card.slot < 0 ? -10 : 0)}px)`;
      card.el.classList.toggle("is-shown", shown);
      card.num.textContent = String(Math.min(3, Math.max(1, card.slot + 1))).padStart(2, "0");
      if (shown) {
        card.el.removeAttribute("aria-hidden");
        card.el.removeAttribute("tabindex");
      } else {
        card.el.setAttribute("aria-hidden", "true");
        card.el.setAttribute("tabindex", "-1");
      }
    }

    function makeCard(w, slot, typed) {
      const data = WORDS[w];
      const el = document.createElement("a");
      el.className = "home-card";
      el.href = LEARN_HREF + data.href;
      el.setAttribute("aria-label", `${questionText(data)}（${data.tag}）`);
      const num = document.createElement("span");
      num.className = "home-card-num";
      num.setAttribute("aria-hidden", "true");
      const q = document.createElement("span");
      q.className = "home-card-q";
      q.setAttribute("aria-hidden", "true");
      const tag = document.createElement("span");
      tag.className = "home-card-tag";
      tag.setAttribute("aria-hidden", "true");
      tag.textContent = data.tag;
      el.append(num, q, tag);
      const card = { el, num, q, w, slot, units: questionUnits(data), typed: 0 };
      if (typed) fillCard(card, card.units.length);
      box.append(el);
      place(card);
      return card;
    }

    function fillCard(card, count) {
      card.typed = count;
      card.q.innerHTML = card.units.slice(0, count).map((u) => (typeof u === "string" ? escapeHtml(u) : u.html)).join("");
      if (count < card.units.length) {
        const caret = document.createElement("span");
        caret.className = "home-card-caret";
        card.q.append(caret);
      }
    }

    function typeCard(card) {
      window.clearInterval(typer);
      fillCard(card, 0);
      typer = window.setInterval(() => {
        if (document.hidden) return;
        if (card.typed >= card.units.length) {
          window.clearInterval(typer);
          return;
        }
        fillCard(card, card.typed + 1);
      }, TYPE_MS);
    }

    function showWord(i) {
      const data = WORDS[i];
      wordCn.textContent = data.cn;
      wordEn.textContent = data.en;
      word.href = LEARN_HREF + data.href;
      word.setAttribute("aria-label", `线性${data.cn}：${data.tag}`);
    }

    function advance() {
      elapsed = 0;
      const next = (idx + 1) % n;
      mosaic.burst();
      word.classList.add("is-out");
      cards.forEach((card) => {
        card.slot -= 1;
        place(card);
      });
      const fresh = makeCard(next, 3, false);
      cards.push(fresh);
      nextFrame(() => {
        fresh.slot = 2;
        place(fresh);
      });
      later(() => {
        cards = cards.filter((card) => {
          if (card.slot >= 0) return true;
          card.el.remove();
          return false;
        });
      }, 720);
      later(() => {
        idx = next;
        showWord(idx);
        word.classList.remove("is-out");
        word.classList.add("is-pre");
        nextFrame(() => word.classList.remove("is-pre"));
        typeCard(fresh);
      }, 300);
    }

    // 开场：上两张是上一轮的问题，最下面一张对应当前词
    showWord(0);
    cards = [makeCard(n - 2, 0, true), makeCard(n - 1, 1, true), makeCard(0, 2, reduceMotion.matches)];
    window.addEventListener("resize", () => cards.forEach(place), { passive: true });
    if (reduceMotion.matches) return;
    typeCard(cards[2]);

    [box, $("#homeHeadline")].forEach((el) => {
      el?.addEventListener("mouseenter", () => { hover = true; });
      el?.addEventListener("mouseleave", () => { hover = false; });
      el?.addEventListener("focusin", () => { hover = true; });
      el?.addEventListener("focusout", () => { hover = false; });
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }, { threshold: 0.15 }).observe(hero);
    }
    window.setInterval(() => {
      if (hover || document.hidden || !heroVisible) return;
      elapsed += 100;
      if (elapsed >= HOLD_MS) advance();
    }, 100);
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

    function frame(p) {
      const f = reduceMotion.matches ? 0 : p;
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
    narrow.addEventListener?.("change", () => {
      ribbon?.redraw();
      request();
    });
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
    initHeadline();
    initLead();
    initScroll(initRibbon());
    initDemos();
    mosaic.intro();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) applyLearningState();
  });
})();
