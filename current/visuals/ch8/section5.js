(() => {
  const { I, on, markExperimentStep, conclusionMarkup } = window.Chapter8Lab;

  const fieldData = {
    Q: { label: "有理数域 Q", split: false, note: "λ²+1 在 Q 上没有根，因此它作为一个不可约二次因子整体保留。" },
    R: { label: "实数域 R", split: false, note: "λ²+1 在 R 上没有实根，仍然是一个不可约因子族。" },
    C: { label: "复数域 C", split: true, note: "在 C 上，两个根 ±i 进入底域，λ²+1 分裂成 (λ−i)(λ+i)。" },
  };

  function powerStack(label, power, family) {
    return `<div class="ch8-factor-thread is-${family}" style="--power:${power}"><span>${I(label)}</span><i></i><i></i><small>幂次 ${power}</small></div>`;
  }

  function mount(host) {
    let field = "R";
    let mode = "split";

    function render() {
      const data = fieldData[field];
      markExperimentStep(host, mode === "split" ? (data.split ? 1 : 0) : 3);
      const complex = data.split;
      host.innerHTML = `
        <div class="ch8-lab ch8-cinema ch8-elementary-cinema">
          <div class="ch8-factor-toolbar">
            <div class="ch8-field-switch" role="group" aria-label="选择底域">
              ${Object.entries(fieldData).map(([key, item]) => `<button type="button" data-factor-field="${key}" class="${field === key ? "is-active" : ""}" aria-pressed="${field === key}"><span>${key}</span><b>${item.label}</b></button>`).join("")}
            </div>
            <div class="ch8-factor-mode" role="group" aria-label="拆分或重组">
              <button type="button" data-factor-mode="split" class="${mode === "split" ? "is-active" : ""}" aria-pressed="${mode === "split"}">从根看拆分</button>
              <button type="button" data-factor-mode="regroup" class="${mode === "regroup" ? "is-active" : ""}" aria-pressed="${mode === "regroup"}">重组不变因子</button>
            </div>
          </div>

          <header class="ch8-cinema-head">
            <div><span>当前底域：${data.label}</span><h3>${mode === "split" ? "不可约因子改变时，结构块怎样重新命名？" : "同一因子族按幂次对齐，再横向读回不变因子"}</h3></div>
            <p>${data.note}</p>
          </header>

          ${mode === "split" ? `
            <section class="ch8-factor-plane ${complex ? "is-complex" : "is-real"}">
              <svg viewBox="0 0 900 430" role="img" aria-label="不同底域下 λ²+1 的根与不可约因子变化">
                <defs><marker id="ch8-factor-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0L10 5L0 10Z"></path></marker></defs>
                <path class="factor-axis" d="M90 230H820M430 375V55"></path>
                <text x="805" y="214">Re</text><text x="447" y="72">Im</text>
                <circle class="root root-one" cx="650" cy="230" r="10"></circle><text x="668" y="224">1</text>
                <circle class="root root-plus ${complex ? "is-visible" : "is-ghost"}" cx="430" cy="115" r="10"></circle><text class="root-label ${complex ? "is-visible" : "is-ghost"}" x="452" y="120">i</text>
                <circle class="root root-minus ${complex ? "is-visible" : "is-ghost"}" cx="430" cy="345" r="10"></circle><text class="root-label ${complex ? "is-visible" : "is-ghost"}" x="452" y="350">−i</text>
                <path class="irreducible-loop ${complex ? "is-split" : ""}" d="M350 95C285 145 285 315 350 365C410 410 510 410 570 365C635 315 635 145 570 95C510 50 410 50 350 95Z"></path>
                <text class="irreducible-label" x="330" y="405">${complex ? "一个二次族分裂为两个线性族" : "λ²+1：底域内不可约，作为一个整体"}</text>
                <path class="factor-thread-line thread-one" d="M650 242C650 300 705 310 735 350"></path>
                <path class="factor-thread-line thread-plus ${complex ? "is-visible" : "is-ghost"}" d="M430 127C430 270 530 300 585 350"></path>
                <path class="factor-thread-line thread-minus ${complex ? "is-visible" : "is-ghost"}" d="M430 333C430 310 475 300 515 350"></path>
              </svg>

              <div class="ch8-family-columns">
                <article class="is-linear"><span>线性因子族</span><strong>${I("\\lambda-1")}</strong><div>${powerStack("\\lambda-1", 1, "teal")}${powerStack("(\\lambda-1)^2", 2, "teal")}</div></article>
                ${complex
                  ? `<article class="is-plus"><span>根 i 的因子族</span><strong>${I("\\lambda-i")}</strong><div>${powerStack("\\lambda-i", 1, "violet")}${powerStack("(\\lambda-i)^2", 2, "violet")}</div></article>
                     <article class="is-minus"><span>根 −i 的因子族</span><strong>${I("\\lambda+i")}</strong><div>${powerStack("\\lambda+i", 1, "amber")}${powerStack("(\\lambda+i)^2", 2, "amber")}</div></article>`
                  : `<article class="is-quadratic"><span>不可约二次因子族</span><strong>${I("\\lambda^2+1")}</strong><div>${powerStack("\\lambda^2+1", 1, "blue")}${powerStack("(\\lambda^2+1)^2", 2, "blue")}</div></article>`}
              </div>
            </section>` : `
            <section class="ch8-regroup-board">
              <div class="ch8-family-columns">
                <article class="is-linear"><span>因子族 1</span><strong>${I("\\lambda-1")}</strong><div>${powerStack("\\lambda-1", 1, "teal")}${powerStack("(\\lambda-1)^2", 2, "teal")}</div></article>
                ${complex
                  ? `<article class="is-plus"><span>因子族 2</span><strong>${I("\\lambda-i")}</strong><div>${powerStack("\\lambda-i", 1, "violet")}${powerStack("(\\lambda-i)^2", 2, "violet")}</div></article>
                     <article class="is-minus"><span>因子族 3</span><strong>${I("\\lambda+i")}</strong><div>${powerStack("\\lambda+i", 1, "amber")}${powerStack("(\\lambda+i)^2", 2, "amber")}</div></article>`
                  : `<article class="is-quadratic"><span>因子族 2</span><strong>${I("\\lambda^2+1")}</strong><div>${powerStack("\\lambda^2+1", 1, "blue")}${powerStack("(\\lambda^2+1)^2", 2, "blue")}</div></article>`}
              </div>
              <div class="ch8-regroup-arrow"><span>同一高度横向相乘</span><b>→</b></div>
              <div class="ch8-regroup-layers">
                <article><span>第一层</span><strong>${complex ? I("d_1=(\\lambda-1)(\\lambda-i)(\\lambda+i)") : I("d_1=(\\lambda-1)(\\lambda^2+1)")}</strong><p>每个因子族取最低一层。</p></article>
                <article><span>第二层</span><strong>${complex ? I("d_2=(\\lambda-1)^2(\\lambda-i)^2(\\lambda+i)^2") : I("d_2=(\\lambda-1)^2(\\lambda^2+1)^2")}</strong><p>每个因子族取第二层，自动保持 d₁∣d₂。</p></article>
              </div>
            </section>`}

          <div class="ch8-factor-legend"><span>根的位置决定线性因子</span><span>同色表示同一不可约因子族</span><span>竖向高度表示幂次</span></div>
          ${conclusionMarkup(
            "底域改变了怎样的语言",
            complex ? "λ²+1 已分裂成两个线性初等因子族" : "λ²+1 仍作为一个不可约二次因子族",
            mode === "split" ? "初等因子不是额外信息，而是把不变因子沿不可约因子方向重新排列。" : "把每个因子族按幂次对齐并横向相乘，就能唯一恢复整除链。",
          )}
        </div>`;

      host.querySelectorAll("[data-factor-field]").forEach((button) => on(button, "click", () => { field = button.dataset.factorField; render(); }));
      host.querySelectorAll("[data-factor-mode]").forEach((button) => on(button, "click", () => { mode = button.dataset.factorMode; render(); }));
    }

    render();
  }

  window.defineChapter8Lab("elementary-story", mount);
})();