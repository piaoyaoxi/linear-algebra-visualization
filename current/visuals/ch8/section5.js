(() => {
  const { I, on, setPressed, markExperimentStep, conclusionMarkup } = window.Chapter8Lab;

  const fieldData = {
    Q: {
      label: "有理数域 Q",
      families: [
        { id: "p", label: "λ−1", color: "teal", powers: [1, 2] },
        { id: "q", label: "λ²+1", color: "blue", powers: [1, 2] },
      ],
      note: "λ²+1 在 Q 上不可约，因此保持为一个二次因子族。",
    },
    R: {
      label: "实数域 R",
      families: [
        { id: "p", label: "λ−1", color: "teal", powers: [1, 2] },
        { id: "q", label: "λ²+1", color: "blue", powers: [1, 2] },
      ],
      note: "λ²+1 在 R 上不可约，因此仍是一个二次因子族。",
    },
    C: {
      label: "复数域 C",
      families: [
        { id: "p", label: "λ−1", color: "teal", powers: [1, 2] },
        { id: "r", label: "λ−i", color: "violet", powers: [1, 2] },
        { id: "s", label: "λ+i", color: "amber", powers: [1, 2] },
      ],
      note: "λ²+1=(λ−i)(λ+i)，原来的蓝色族在 C 上分裂成两个线性因子族。",
    },
  };

  function block(family, power, label = "") {
    return `<div class="ch8-factor-block is-${family.color}" style="--power:${power}"><span>${label || I(`${family.label}${power > 1 ? `^${power}` : ""}`)}</span><div>${Array.from({ length: power }, () => "<i></i>").join("")}</div><small>幂次 ${power}</small></div>`;
  }

  function invariantRows(field) {
    if (field === "C") {
      return `
        <article><span>d₁</span><div>${block({ label: "λ−1", color: "teal" }, 1)}${block({ label: "λ−i", color: "violet" }, 1)}${block({ label: "λ+i", color: "amber" }, 1)}</div><b>${I("(\\lambda-1)(\\lambda-i)(\\lambda+i)")}</b></article>
        <article><span>d₂</span><div>${block({ label: "λ−1", color: "teal" }, 2)}${block({ label: "λ−i", color: "violet" }, 2)}${block({ label: "λ+i", color: "amber" }, 2)}</div><b>${I("(\\lambda-1)^2(\\lambda-i)^2(\\lambda+i)^2")}</b></article>`;
    }
    return `
      <article><span>d₁</span><div>${block({ label: "λ−1", color: "teal" }, 1)}${block({ label: "λ²+1", color: "blue" }, 1)}</div><b>${I("(\\lambda-1)(\\lambda^2+1)")}</b></article>
      <article><span>d₂</span><div>${block({ label: "λ−1", color: "teal" }, 2)}${block({ label: "λ²+1", color: "blue" }, 2)}</div><b>${I("(\\lambda-1)^2(\\lambda^2+1)^2")}</b></article>`;
  }

  function mount(host) {
    let field = "R";
    let mode = "split";

    function render() {
      const data = fieldData[field];
      markExperimentStep(host, mode === "split" ? (field === "C" ? 1 : 0) : 3);
      host.innerHTML = `
        <div class="ch8-lab ch8-story-lab ch8-elementary-story">
          <div class="ch8-factor-toolbar">
            <div class="ch8-field-switch" role="group" aria-label="选择底域">
              ${Object.entries(fieldData).map(([key, item]) => `<button type="button" data-factor-field="${key}" class="${field === key ? "is-active" : ""}" aria-pressed="${field === key}"><span>${key}</span><b>${item.label}</b></button>`).join("")}
            </div>
            <div class="ch8-factor-mode" role="group" aria-label="拆分或重组">
              <button type="button" data-factor-mode="split" class="${mode === "split" ? "is-active" : ""}" aria-pressed="${mode === "split"}">拆成初等因子</button>
              <button type="button" data-factor-mode="regroup" class="${mode === "regroup" ? "is-active" : ""}" aria-pressed="${mode === "regroup"}">重组不变因子</button>
            </div>
          </div>

          <div class="ch8-scene-intro"><span>当前底域：${data.label}</span><h3>${mode === "split" ? "把每一排不变因子拆成同色幂块" : "把同族幂次按层对齐，再横向相乘"}</h3><p>${data.note}</p></div>

          ${mode === "split" ? `
            <div class="ch8-factor-wall">
              <section class="ch8-invariant-rows">
                <div class="ch8-pipeline-label"><span>原来的组织方式</span><strong>按整除层排列不变因子</strong></div>
                ${invariantRows(field)}
              </section>
              <div class="ch8-factor-arrow"><span>按不可约因子拆开</span><b>→</b></div>
              <section class="ch8-family-columns">
                <div class="ch8-pipeline-label"><span>新的组织方式</span><strong>按不可约因子族归列</strong></div>
                <div class="ch8-family-grid" style="--families:${data.families.length}">
                  ${data.families.map((family) => `<article class="is-${family.color}"><header><i></i><strong>${I(family.label)}</strong><span>同一因子族</span></header>${family.powers.map((power) => block(family, power)).join("")}</article>`).join("")}
                </div>
              </section>
            </div>` : `
            <div class="ch8-regroup-board">
              <section class="ch8-family-columns">
                <div class="ch8-pipeline-label"><span>输入</span><strong>每一列是同一不可约因子族</strong></div>
                <div class="ch8-family-grid" style="--families:${data.families.length}">
                  ${data.families.map((family) => `<article class="is-${family.color}"><header><i></i><strong>${I(family.label)}</strong></header>${family.powers.map((power) => block(family, power)).join("")}</article>`).join("")}
                </div>
              </section>
              <section class="ch8-regroup-layers">
                <div class="ch8-pipeline-label"><span>横向读取</span><strong>同一高度的幂块相乘</strong></div>
                <article><span>第一层</span><div>${data.families.map((family) => block(family, 1)).join("")}</div><b>${field === "C" ? I("d_1=(\\lambda-1)(\\lambda-i)(\\lambda+i)") : I("d_1=(\\lambda-1)(\\lambda^2+1)")}</b></article>
                <article><span>第二层</span><div>${data.families.map((family) => block(family, 2)).join("")}</div><b>${field === "C" ? I("d_2=(\\lambda-1)^2(\\lambda-i)^2(\\lambda+i)^2") : I("d_2=(\\lambda-1)^2(\\lambda^2+1)^2")}</b></article>
              </section>
            </div>`}

          <div class="ch8-factor-legend">
            <span>颜色 = 不可约因子族</span><span>高度 = 幂次</span><span>重复块不能合并或丢失</span>
          </div>
          ${conclusionMarkup("底域与结构", field === "C" ? "二次因子已经分裂成两个线性族" : "λ²+1 仍保持为一个不可约族", mode === "split" ? "初等因子并不是新的分类信息，而是把不变因子沿不可约因子方向重新排版。" : "从每个因子族按幂次对齐，可以唯一恢复原来的整除链。")}
        </div>`;

      host.querySelectorAll("[data-factor-field]").forEach((button) => on(button, "click", () => { field = button.dataset.factorField; render(); }));
      host.querySelectorAll("[data-factor-mode]").forEach((button) => on(button, "click", () => { mode = button.dataset.factorMode; render(); }));
    }

    render();
  }

  window.defineChapter8Lab("elementary-story", mount);
})();
