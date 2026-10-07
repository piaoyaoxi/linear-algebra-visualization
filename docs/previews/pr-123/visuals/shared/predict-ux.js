/*
 * Prediction boxes behave the same in every lab. Every kit renders a `.xxl-predict` box
 * whose option buttons carry data-ok and data-why; this file adds, on top of each kit:
 *  - a “不确定，直接看” option: it unlocks the lab without a guess, and the reveal then
 *    simply shows the answer, with no right or wrong verdict;
 *  - after the reveal, every option can be clicked to read why it is right or wrong;
 *    the student's own pick keeps a “你的猜测” mark.
 * Before the reveal the kits already let the student change the pick freely.
 * Every lab's wrong-guess hint starts “再看看图：”; a hint that itself starts with “看…”
 * would say it twice, so that lead is dropped.
 */
(() => {
  const BOX = ".ch3l-predict, .ch6l-predict, .ch7l-predict, .ch9l-predict";
  const OPTIONS = ":scope > [class$='-predict-options']";
  const FEEDBACK = ":scope > [class$='-predict-feedback']";
  const UNSURE_HINT = "好，先不猜。动手操作一次，答案随后出现。";

  const isRevealed = (box) =>
    box.classList.contains("is-done") || box.dataset.answered === "true" || Boolean(box.querySelector(".is-right, .is-wrong"));
  const plain = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    div.querySelectorAll(".katex-mathml").forEach((n) => n.remove());
    return div.textContent.trim();
  };

  function enhance(box) {
    if (box.dataset.laUx) return;
    const options = box.querySelector(OPTIONS);
    const buttons = () => (options ? [...options.querySelectorAll("button[data-i]")] : []);
    if (!buttons().length || !buttons().some((b) => b.dataset.ok === "true")) return;
    box.dataset.laUx = "1";
    const right = () => buttons().find((b) => b.dataset.ok === "true");

    const unsure = document.createElement("button");
    unsure.type = "button";
    unsure.className = "la-unsure";
    unsure.textContent = "不确定，直接看";
    options.append(unsure);

    const why = document.createElement("p");
    why.className = "la-option-why";
    why.hidden = true;
    (box.querySelector(FEEDBACK) || options).after(why);

    unsure.addEventListener("click", (event) => {
      event.stopPropagation();
      if (isRevealed(box)) return;
      const answer = right();
      if (!answer) return;
      box.dataset.unsure = "1";
      // register a pick with the kit so the lab unlocks, without showing which one
      answer.click();
      const settle = () => {
        if (isRevealed(box)) return;
        buttons().forEach((b) => b.classList.remove("is-picked"));
        unsure.classList.add("is-picked");
        const feedback = box.querySelector(FEEDBACK);
        if (feedback) {
          feedback.hidden = false;
          feedback.textContent = UNSURE_HINT;
        }
      };
      settle();
      requestAnimationFrame(settle);
    });

    // a real pick after “不确定” is a guess again
    options.addEventListener("click", (event) => {
      if (!event.isTrusted || !event.target.closest("button[data-i]") || box.dataset.laUxRevealed) return;
      delete box.dataset.unsure;
      unsure.classList.remove("is-picked");
    });

    // after the reveal a click on an option explains it instead of grading again
    box.addEventListener(
      "click",
      (event) => {
        const button = event.target.closest("button[data-i]");
        if (!button || !box.dataset.laUxRevealed || !options.contains(button)) return;
        event.stopPropagation();
        event.preventDefault();
        explain(button);
      },
      true,
    );

    function explain(button) {
      buttons().forEach((b) => b.classList.toggle("is-viewing", b === button));
      const ok = button.dataset.ok === "true";
      const reason = button.dataset.why || "";
      why.hidden = false;
      why.innerHTML = `<b>${ok ? "✓ 这个选项对" : "× 这个选项不对"}</b>${reason ? `：${reason}` : "。"}`;
    }

    function onReveal() {
      if (box.dataset.laUxRevealed || !isRevealed(box)) return;
      box.dataset.laUxRevealed = "1";
      unsure.disabled = !box.dataset.unsure;
      const answer = right();
      if (box.dataset.unsure) {
        // no guess was made: show the answer without a verdict
        buttons().forEach((b) => b.classList.remove("is-right", "is-wrong", "is-picked"));
        answer?.classList.add("is-answer");
        unsure.classList.add("is-picked");
        // the option itself, formulas included (flattened text loses ≠, exponents …)
        const copy = answer?.cloneNode(true);
        copy?.querySelectorAll(".la-mine").forEach((n) => n.remove());
        const lead = copy && plain(copy.innerHTML) ? `答案是“${copy.innerHTML.trim()}”` : "答案";
        const lab = box.closest("section, [id$='-interactive']") || box.parentElement;
        const feedback = box.querySelector(FEEDBACK);
        if (feedback) {
          const html = feedback.innerHTML
            .replace(/✓\s*猜对了[，,]?/, `${lead}，`)
            .replace(/^(\s*<span[^>]*>)?\s*✓\s*/, (_, span) => `${span || ""}${lead}。`);
          feedback.innerHTML = html.includes(lead) ? html : `${lead}。${html}`;
        }
        // the ch7 kit repeats the verdict at the top of its conclusion box
        lab?.querySelectorAll("[class$='-ok']").forEach((n) => {
          if (n.textContent.trim() === "猜对了。") n.innerHTML = `${lead}。`;
        });
      } else {
        // kits mark the guess as right/wrong, or (the ch7 kit) leave it only “picked”
        let mine = buttons().find((b) => b.classList.contains("is-right") || b.classList.contains("is-wrong"));
        if (!mine) {
          mine = buttons().find((b) => b.classList.contains("is-picked"));
          if (mine) {
            mine.classList.remove("is-picked");
            mine.classList.add(mine.dataset.ok === "true" ? "is-right" : "is-wrong");
          }
        }
        if (mine && !mine.querySelector(".la-mine")) {
          const badge = document.createElement("em");
          badge.className = "la-mine";
          badge.textContent = "你的猜测";
          mine.append(badge);
        }
        // a wrong guess: the right option is marked as the answer as well
        if (mine && mine !== answer) answer?.classList.add("is-answer");
      }
      why.hidden = false;
      why.innerHTML = `<span class="la-option-hint">点其他选项，可以看它为什么对或错。</span>`;
    }

    new MutationObserver(onReveal).observe(box, { attributes: true, subtree: true, attributeFilter: ["class", "data-answered"] });
    onReveal();
  }

  const LOOK = /再看看图：\s*(?:请)?(?:注意)?(?:看一看|看看|看一下|观察一下|观察|看(?![清出到成作起见]))[，,：:\s]*/;
  function dropDoubledLook() {
    const main = document.querySelector("main") || document.body;
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent.includes("再看看图") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
    const hits = [];
    while (walker.nextNode()) hits.push(walker.currentNode);
    hits.forEach((node) => {
      const fixed = node.textContent.replace(LOOK, "再看看图：");
      if (fixed !== node.textContent) node.textContent = fixed;
    });
  }

  /*
   * On a phone, when one option of a box needs two lines, every option of that box takes a
   * full row, one under another; otherwise short options stay side by side. An option's
   * single-line width is measured with wrapping switched off for a moment (data-la-opt-measure).
   */
  const PHONE = window.matchMedia?.("(max-width: 720px)");
  function stackOptions() {
    document.querySelectorAll(`:is(${BOX}) > [class$='-predict-options']`).forEach((options) => {
      const buttons = [...options.querySelectorAll(":scope > button")];
      if (!buttons.length || !options.getBoundingClientRect().width) return;
      let stack = false;
      if (PHONE?.matches) {
        const cs = getComputedStyle(options);
        const room = options.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        options.dataset.laOptMeasure = "1";
        stack = buttons.some((b) => b.getBoundingClientRect().width > room + 0.5);
        delete options.dataset.laOptMeasure;
      }
      // a data attribute: the kits find the box by its class name ending in “-predict-options”
      if (stack) options.dataset.laStack = "1";
      else delete options.dataset.laStack;
    });
  }

  const scan = () => {
    document.querySelectorAll(BOX).forEach(enhance);
    dropDoubledLook();
    stackOptions();
  };
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scan();
    });
  };
  const start = () => {
    new MutationObserver(schedule).observe(document.querySelector("main") || document.body, { childList: true, subtree: true });
    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(stackOptions, 150);
    }, { passive: true });
    document.fonts?.ready.then(stackOptions);
    scan();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
