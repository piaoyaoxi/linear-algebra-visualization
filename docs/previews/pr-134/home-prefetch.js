/*
 * 首页：页面显示、浏览器空闲以后，把学习页要用的页面、样式、脚本和字体
 * 提前下载进浏览器缓存。点进学习页时这些文件直接从缓存读取。
 *
 * 文件清单在运行时从 learn.html 里读，学习页增删文件或改版本号都不用改这里。
 * 省流量模式、2G 网络下不预下载；明暗切换动画的图片也不预下载。
 */
(() => {
  const LEARN_URL = "./learn.html";
  // 先让首屏大图、开场动画和光影视频加载完，再开始
  const START_DELAY_MS = 4000;
  // 同时最多几个请求，不和首页自己的请求抢带宽
  const PARALLEL = 4;

  let started = false;

  function allowed() {
    const connection = navigator.connection;
    if (!connection) return true;
    if (connection.saveData) return false;
    return !/(^|-)2g$/.test(connection.effectiveType || "");
  }

  function collect(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const base = new URL(LEARN_URL, location.href);
    const urls = new Set();
    const add = (el) => {
      const url = new URL(el.getAttribute(el.tagName === "SCRIPT" ? "src" : "href"), base);
      if (url.origin === location.origin) urls.add(url.href);
    };
    doc.querySelectorAll('link[rel="stylesheet"][href], link[rel="preload"][as="font"][href], script[src]').forEach(add);
    // 各章实验脚本在 <template> 里，学习页按章加载；这里只预下载最可能先打开的那一章
    // （上次学到的章，没有记录就是第一章）
    let last = "";
    try { last = localStorage.getItem("la-visual-last") || ""; } catch { /* 读不到就按第一章 */ }
    const chapter = /^#(ch\d+)/.exec(last)?.[1] || "ch1";
    doc.querySelector(`template[data-chapter-labs="${chapter}"]`)?.content.querySelectorAll("script[src]").forEach(add);
    return [...urls];
  }

  function load(url) {
    return fetch(url, { credentials: "same-origin", priority: "low" }).then((response) => response.arrayBuffer());
  }

  async function warm(urls) {
    let next = 0;
    const worker = async () => {
      while (next < urls.length) {
        const url = urls[next++];
        try {
          await load(url);
        } catch (error) {
          // 预下载失败没关系，学习页打开时会自己再请求
        }
      }
    };
    await Promise.all(Array.from({ length: PARALLEL }, worker));
  }

  function start() {
    if (started || !allowed()) return;
    started = true;
    fetch(LEARN_URL, { credentials: "same-origin", priority: "low" })
      .then((response) => (response.ok ? response.text() : ""))
      .then((html) => (html ? warm(collect(html)) : null))
      .catch(() => {});
  }

  function schedule() {
    const idle = window.requestIdleCallback || ((fn) => window.setTimeout(fn, 1));
    window.setTimeout(() => idle(start, { timeout: 3000 }), START_DELAY_MS);
  }

  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });

  // 指针移到、手指按到或键盘聚焦到去学习页的链接上时，不再等空闲，立刻开始
  const onIntent = (event) => {
    if (event.target.closest?.('a[href^="./learn.html"]')) start();
  };
  ["pointerover", "touchstart", "focusin"].forEach((type) => {
    document.addEventListener(type, onIntent, { passive: true });
  });
})();
