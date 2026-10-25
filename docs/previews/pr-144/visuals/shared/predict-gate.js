/*
 * Prediction boxes: before a lab shows its conclusion, the student guesses, acts on the
 * picture, then reads the verdict (predict → act → reveal). Every box of the site is made
 * here. The chapter kits wrap it in the API their labs use (predictGate in the ch3, ch6 and
 * ch9 kits, predictFlow in the ch7 kit), and LAPredictGate.mount below is the ready-made
 * gate of the labs without a kit.
 *
 *   const gate = LAPredictGate.create({
 *     prefix: "ch3l",                     // .ch3l-predict, -predict-q, -predict-options, -predict-feedback
 *     question: "…",                      // HTML
 *     options: [{ text, correct, why }],  // shown in a stable shuffled order (key, default: the question)
 *     key,
 *     actHint: "…",                       // the note after a guess
 *     right: "…",                         // the verdict of a right guess (HTML)
 *     fallbackWhy: "…",                   // the verdict of a wrong option without a why
 *     verdict({ ok, unsure, lead, right, why }) → HTML,   // a kit's own wording of the verdict
 *     onPick({ index, first, unsure }), onReveal({ ok, unsure, lead, option, html }),
 *   });
 *   gate.element, gate.feedback, gate.options (in the order shown)
 *   gate.choice, gate.unsure, gate.picked, gate.revealed, gate.ok, gate.verdict (HTML)
 *   gate.pick(index, { unsure, silent })  a guess (silent: no onPick, to restore a remembered one)
 *   gate.reveal()                         the verdict, once there is a guess
 *   gate.note(html)                       a hint in the note until the reveal
 *   gate.watch(root, { ignore, judge, drag })   act = a change of the lab's readouts (below)
 *
 * A box with a right option also offers “不确定，直接看”: it unlocks the lab like a guess, and
 * the reveal shows the answer without a verdict. After the reveal a click on an option tells
 * why it is right or wrong; the student's own guess keeps a “你的猜测” mark. On a phone, once a
 * guess is made, only the picked option (after the reveal: and the answer) stays; a small link
 * (“改选” / “看全部选项”) opens the rest (data-la-fold, lab-fit.css).
 */
(() => {
  const shuffle = (items, key) => (window.LAStableShuffle ? window.LAStableShuffle(items, key) : items);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const ACT_HINT = "记下了你的猜测。现在动手操作一次，结论随后出现。";
  const UNSURE_HINT = "好，先不猜。动手操作一次，答案随后出现。";
  const FALLBACK_WHY = "动手操作后看看发生了什么。";
  // a wrong guess reads “再看看图：<why>”; a why that starts with “看…” itself would say it twice
  const LOOK = /^\s*(?:请)?(?:注意)?(?:看一看|看看|看一下|观察一下|观察|看(?![清出到成作起见]))[，,：:\s]*/;
  const lookAgain = (why) => `再看看图：${String(why).replace(LOOK, "")}`;
  const plain = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    div.querySelectorAll(".katex-mathml").forEach((n) => n.remove());
    return div.textContent.trim();
  };

  // the verdict in the note: ✓ and the explanation, the answer for “不确定”, or why the guess is wrong
  const defaultVerdict = ({ ok, unsure, lead, right, why }) => (unsure ? `${lead}。${right}` : ok ? `✓ ${right}` : lookAgain(why));

  function create(spec) {
    const p = spec.prefix;
    const options = shuffle(spec.options, spec.key || spec.question);
    const answerIndex = options.findIndex((o) => o.correct);
    // “不确定” shows the answer, and the options explain themselves after the reveal: both need a right option
    const extras = answerIndex >= 0;
    const box = document.createElement("div");
    box.className = `${p}-predict`;
    box.dataset.laPredict = "";
    box.innerHTML = `<div class="${p}-predict-q"><span>先猜一猜</span><p>${spec.question}</p></div><div class="${p}-predict-options">${options
      .map((o, i) => `<button type="button" data-i="${i}" data-ok="${o.correct ? "true" : "false"}" data-why="${esc(o.why || "")}">${o.text}</button>`)
      .join("")}${extras ? `<button type="button" class="la-unsure">不确定，直接看</button><button type="button" class="la-opt-more">改选</button>` : ""}</div><p class="${p}-predict-feedback" hidden></p>${extras ? `<p class="la-option-why" hidden></p>` : ""}`;
    const buttons = [...box.querySelectorAll("button[data-i]")];
    const feedback = box.querySelector(`.${p}-predict-feedback`);
    const unsureButton = box.querySelector(".la-unsure");
    const more = box.querySelector(".la-opt-more");
    const why = box.querySelector(".la-option-why");
    const right = String(spec.right ?? "").replace(/^\s*✓\s*/, "");
    const state = { choice: null, unsure: false, revealed: false, html: "" };
    const pickWatchers = [];

    // on a phone: after a guess only the chosen options stay, the link opens the others
    function fold() {
      if (!more) return;
      if (state.choice == null) delete box.dataset.laOpen;
      if (state.choice != null && !box.dataset.laOpen) box.dataset.laFold = "1";
      else delete box.dataset.laFold;
      const label = box.dataset.laOpen ? "收起选项" : state.revealed ? "看全部选项" : "改选";
      if (more.textContent !== label) more.textContent = label;
    }

    function pick(index, { unsure = false, silent = false } = {}) {
      if (state.revealed) return;
      const first = state.choice == null;
      state.choice = index;
      state.unsure = unsure;
      if (unsure) box.dataset.unsure = "1";
      else delete box.dataset.unsure;
      delete box.dataset.laOpen;
      buttons.forEach((b, i) => b.classList.toggle("is-picked", !unsure && i === index));
      unsureButton?.classList.toggle("is-picked", unsure);
      feedback.hidden = false;
      feedback.textContent = unsure ? UNSURE_HINT : spec.actHint || ACT_HINT;
      fold();
      if (silent) return;
      spec.onPick?.({ index, first, unsure });
      pickWatchers.forEach((watcher) => watcher());
    }

    function reveal() {
      if (state.revealed || state.choice == null) return false;
      state.revealed = true;
      const option = options[state.choice];
      const ok = Boolean(option.correct);
      const answer = buttons[answerIndex];
      buttons.forEach((b) => b.classList.remove("is-picked"));
      if (state.unsure) answer?.classList.add("is-answer");
      else {
        const mine = buttons[state.choice];
        mine.classList.add(ok ? "is-right" : "is-wrong");
        if (extras) mine.insertAdjacentHTML("beforeend", `<em class="la-mine">你的猜测</em>`);
        // a wrong guess: the right option is marked as the answer as well
        if (state.choice !== answerIndex) answer?.classList.add("is-answer");
      }
      box.classList.add("is-done");
      const text = answer ? options[answerIndex].text : "";
      const lead = plain(text) ? `答案是“${text.trim()}”` : "答案";
      state.html = (spec.verdict || defaultVerdict)({ ok, unsure: state.unsure, lead, right, why: option.why || spec.fallbackWhy || FALLBACK_WHY });
      feedback.hidden = false;
      feedback.innerHTML = state.html;
      if (unsureButton) unsureButton.disabled = !state.unsure;
      if (why) {
        why.hidden = false;
        why.innerHTML = `<span class="la-option-hint">点其他选项，可以看它为什么对或错。</span>`;
      }
      fold();
      spec.onReveal?.({ ok, unsure: state.unsure, lead, option, html: state.html });
      return true;
    }

    // after the reveal an option tells why it is right or wrong instead of grading again
    function explain(button, option) {
      buttons.forEach((b) => b.classList.toggle("is-viewing", b === button));
      const reason = option.why || "";
      why.hidden = false;
      why.innerHTML = `<b>${option.correct ? "✓ 这个选项对" : "× 这个选项不对"}</b>${reason ? `：${reason}` : "。"}`;
    }

    function note(html) {
      if (state.revealed) return;
      feedback.hidden = false;
      feedback.innerHTML = html;
    }

    /*
     * Acting means changing what the lab reports. Rotating the camera, a view-only button or
     * a click on the text leaves the readouts as they were and does not count; moving a
     * vector, a slider or a step does. The readouts are the text of root outside `ignore`,
     * and its inputs' values, taken at the first guess. judge() runs once they have changed
     * (default: reveal); a dragged handle (la-handle-move) counts at once (drag, default judge).
     */
    function watch(root, { ignore, judge = reveal, drag = judge }) {
      const readouts = () => {
        const parts = [];
        const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walk.nextNode()) {
          const node = walk.currentNode;
          if (node.parentElement?.closest(ignore)) continue;
          parts.push(node.textContent.trim());
        }
        root.querySelectorAll("input").forEach((input) => parts.push(input.value));
        return parts.join("|");
      };
      // the readouts at the moment of the guess; refreshed once after the lab's own redraw,
      // unless the student has already acted by then
      let before = null;
      let touched = false;
      let changed = false;
      pickWatchers.push(() => {
        if (before != null) return;
        before = readouts();
        requestAnimationFrame(() => {
          if (!touched && !state.revealed) before = readouts();
        });
      });
      const check = () => {
        if (state.choice == null || state.revealed || before == null) return;
        if (readouts() !== before) changed = true;
        if (changed) judge();
      };
      const act = (event) => {
        if (state.choice == null || state.revealed || box.contains(event.target)) return;
        touched = true;
        // the lab redraws its readouts after its own handlers, and animations finish later
        setTimeout(check, 60);
        setTimeout(check, 400);
        setTimeout(check, 1100);
      };
      ["pointerup", "input", "change", "keyup", "click"].forEach((type) => root.addEventListener(type, act));
      // dragging a handle on the canvas is acting even when the readouts are still hidden
      root.addEventListener("la-handle-move", () => {
        if (state.choice == null || before == null || state.revealed) return;
        changed = true;
        drag();
      });
    }

    buttons.forEach((b, i) =>
      b.addEventListener("click", (event) => {
        if (!state.revealed) return pick(i);
        if (!why) return;
        event.stopPropagation();
        explain(b, options[i]);
      }),
    );
    // the click goes on to the lab (lab-layout.js opens the primary button on it)
    unsureButton?.addEventListener("click", () => {
      if (!state.revealed) pick(answerIndex, { unsure: true });
    });
    more?.addEventListener("click", (event) => {
      event.stopPropagation();
      if (box.dataset.laOpen) delete box.dataset.laOpen;
      else box.dataset.laOpen = "1";
      fold();
    });

    return {
      element: box,
      feedback,
      options,
      get choice() {
        return state.choice;
      },
      get unsure() {
        return state.unsure;
      },
      get picked() {
        return state.choice != null;
      },
      get revealed() {
        return state.revealed;
      },
      get ok() {
        return state.revealed && Boolean(options[state.choice].correct);
      },
      get verdict() {
        return state.html;
      },
      pick,
      reveal,
      note,
      watch,
    };
  }

  /*
   * The gate of the labs without a kit (.ch3l-predict markup):
   *
   *   const gate = LAPredictGate.mount(container, {
   *     question: "…",                       // HTML
   *     options: [["text", true, ""], ["text", false, "why it is wrong"]],
   *     key: "visuals/…",                     // stable shuffle key
   *     right: "✓ …",                         // HTML shown when the pick was right
   *     actHint: "…",                         // the note after a guess
   *     root,                                 // the lab: any action inside it (outside the gate) reveals
   *     manual: false,                        // true: only gate.acted() reveals
   *     onPick(), onReveal(ok),
   *   });
   *   gate.picked, gate.revealed, gate.ok, gate.feedback, gate.verdict
   *   gate.acted() / gate.reveal()  reveal once a prediction exists; gate.note(html)
   *
   * Until a prediction is picked, the lab's `.is-primary` buttons (outside the gate)
   * stay disabled, as in visuals/shared/lab-layout.js.
   */
  function mount(container, opts) {
    const root = opts.root || container;
    const gate = create({
      prefix: "ch3l",
      question: opts.question,
      options: opts.options.map(([text, correct, why]) => ({ text, correct, why })),
      key: opts.key || opts.question,
      actHint: opts.actHint,
      right: opts.right,
      onPick: () => {
        lockPrimaries();
        opts.onPick?.();
      },
      onReveal: ({ ok }) => opts.onReveal?.(ok),
    });
    const box = gate.element;
    container.replaceChildren(box);

    function lockPrimaries() {
      [...root.querySelectorAll("button.is-primary")]
        .filter((b) => !box.contains(b))
        .forEach((b) => {
          if (!gate.picked && !b.disabled) {
            b.disabled = true;
            b.dataset.laGated = "1";
            b.title = "先在上方猜一猜";
          } else if (gate.picked && b.dataset.laGated) {
            b.disabled = false;
            delete b.dataset.laGated;
            b.removeAttribute("title");
          }
        });
    }

    if (!opts.manual) {
      const acted = (e) => {
        if (!box.contains(e.target)) gate.reveal();
      };
      ["input", "change", "pointerup"].forEach((t) => root.addEventListener(t, acted));
      root.addEventListener("click", (e) => {
        if (e.target.closest("button") && !box.contains(e.target)) gate.reveal();
      });
    }
    lockPrimaries();
    return {
      get picked() {
        return gate.picked;
      },
      get revealed() {
        return gate.revealed;
      },
      get ok() {
        return gate.ok;
      },
      get feedback() {
        return gate.feedback;
      },
      get verdict() {
        return gate.verdict;
      },
      relock: lockPrimaries,
      reveal: gate.reveal,
      acted: gate.reveal,
      note: gate.note,
    };
  }

  /*
   * On a phone, when one option of a box needs two lines, every option of that box takes a
   * full row, one under another; otherwise short options stay side by side. An option's
   * single-line width is measured with wrapping switched off for a moment (data-la-opt-measure).
   */
  const PHONE = window.matchMedia?.("(max-width: 720px)");
  function stackOptions() {
    document.querySelectorAll("[data-la-predict] > [class$='-predict-options']").forEach((options) => {
      const buttons = [...options.querySelectorAll(":scope > button:not(.la-opt-more)")];
      // a folded box shows one or two options: keep the layout measured with all of them
      if (!buttons.length || !options.getBoundingClientRect().width || options.parentElement?.dataset.laFold) return;
      let stack = false;
      if (PHONE?.matches) {
        const cs = getComputedStyle(options);
        const room = options.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        options.dataset.laOptMeasure = "1";
        stack = buttons.some((b) => b.getBoundingClientRect().width > room + 0.5);
        delete options.dataset.laOptMeasure;
      }
      if (stack) options.dataset.laStack = "1";
      else delete options.dataset.laStack;
    });
  }
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      stackOptions();
    });
  };
  const start = () => {
    new MutationObserver(schedule).observe(document.querySelector("main") || document.body, { childList: true, subtree: true });
    let resizeTimer = 0;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(stackOptions, 150);
      },
      { passive: true },
    );
    document.fonts?.ready.then(stackOptions);
    stackOptions();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  window.LAPredictGate = { create, mount };
})();
