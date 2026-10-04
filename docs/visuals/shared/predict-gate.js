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
