(() => {
  const { I, on, setPressed, markExperimentStep, conclusionMarkup, matrix } = window.Chapter8Lab;

  const passportPairs = {
    similar: {
      label: "真相似：同一变换换基",
      A: [[2, 0], [0, 1]],
      B: [[2, 1], [0, 1]],
      rows: [
        ["迹", "3", "3", true, "相同"],
        ["行列式", "2", "2", true, "相同"],
        ["特征多项式", "(\\lambda-2)(\\lambda-1)", "(\\lambda-2)(\\lambda-1)", true, "相同"],
        ["最小多项式", "(\\lambda-2)(\\lambda-1)", "(\\lambda-2)(\\lambda-1)", true, "相同"],
        ["不变因子", "1,\\ (\\lambda-2)(\\lambda-1)", "1,\\ (\\lambda-2)(\\lambda-1)", true, "完全一致"],
      ],
      conclusion: "全部不变因子一致；它们确实只是同一个线性变换在两组基下的矩阵。",
    },
    false: {
      label: "伪相似：相同 χ 的两种结构",
      A: [[2, 0], [0, 2]],
      B: [[2, 1], [0, 2]],
      rows: [
        ["迹", "4", "4", true, "相同"],
        ["行列式", "4", "4", true, "相同"],
        ["特征多项式", "(\\lambda-2)^2", "(\\lambda-2)^2", true, "仍相同"],
        ["最小多项式", "\\lambda-2", "(\\lambda-2)^2", false, "第一次分叉"],
        ["不变因子", "\\lambda-2,\\ \\lambda-2", "1,\\ (\\lambda-2)^2", false, "指纹不同"],
      ],
      conclusion: "前三个粗指标都相同，但最小多项式和不变因子不同，因此不相似。",
    },
  };

  function coordinateRoom(kind) {
    const oblique = kind === "new";
    return `
      <svg class="ch8-coordinate-svg" viewBox="0 0 320 220" role="img" aria-label="${oblique ? "斜基坐标房间" : "标准基坐标房间"}">
        <g class="room-grid ${oblique ? "is-oblique" : ""}">
          ${oblique
            ? `<path d="M38 184L166 28M76 196L204 40M114 208L242 52M152 220L280 64"></path><path d="M18 184L294 184M6 150L282 150M0 116L270 116M0 82L258 82M0 48L246 48"></path>`
            : `<path d="M40 28V204M80 28V204M120 28V204M160 28V204M200 28V204M240 28V204M280 28V204"></path><path d="M20 44H300M20 78H300M20 112H300M20 146H300M20 180H300"></path>`}
        </g>
        <path class="room-axis" d="M20 180H302M80 206V26"></path>
        <path class="room-basis-one" d="M80 180L166 180"></path>
        <path class="room-basis-two" d="${oblique ? "M80 180L132 112" : "M80 180L80 96"}"></path>
        <path class="room-vector" d="M80 180L218 86"></path>
        <circle class="room-vector-tip" cx="218" cy="86" r="5"></circle>
        <g class="room-map-shape"><path d="M80 180L166 180L218 112L132 112Z"></path><path d="M80 180L252 180L304 112L132 112Z"></path></g>
        <text x="224" y="80">v</text>
        <text x="170" y="199">${oblique ? "f₁" : "e₁"}</text>
        <text x="${oblique ? 137 : 91}" y="${oblique ? 106 : 92}">${oblique ? "f₂" : "e₂"}</text>
      </svg>`;
  }

  function mount(host) {
    let mode = "rooms";
    let pairKey = "false";
    let page = 0;

    function renderRooms() {
      markExperimentStep(host, 0);
      host.innerHTML = `
        <div class="ch8-lab ch8-story-lab ch8-similarity-story">
          <div class="ch8-story-tabs" role="tablist" aria-label="相似实验模式">
            <button type="button" class="is-active" data-sim-mode="rooms" aria-pressed="true"><span>01</span>同一变换换基</button>
            <button type="button" data-sim-mode="passport" aria-pressed="false"><span>02</span>打开结构护照</button>
          </div>
          <div class="ch8-scene-intro"><span>被动换基</span><h3>几何对象不动，坐标网格与矩阵记录改变</h3><p>下面两个房间画的是同一个向量、同一个线性变换，只是使用不同基。</p></div>
          <div class="ch8-coordinate-rooms">
            <article>
              <div class="ch8-room-title"><span>标准基 E</span><strong>${I("e_1,e_2")}</strong></div>
              ${coordinateRoom("standard")}
              <div class="ch8-room-matrix"><span>变换矩阵</span>${matrix([[2, 0], [0, 1]])}</div>
              <p>在标准基下，它是沿 e₁ 方向放大 2 倍。</p>
            </article>
            <div class="ch8-basis-bridge">
              <span>坐标翻译</span>
              ${I("P=\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}")}
              <b>${I("B=P^{-1}AP")}</b>
              <i>对象不动</i>
            </div>
            <article>
              <div class="ch8-room-title"><span>斜基 F</span><strong>${I("f_1=e_1,\\ f_2=e_1+e_2")}</strong></div>
              ${coordinateRoom("new")}
              <div class="ch8-room-matrix"><span>变换矩阵</span>${matrix([[2, 1], [0, 1]])}</div>
              <p>数值不同，但描述的仍是左边同一个线性变换。</p>
            </article>
          </div>
          ${conclusionMarkup("换基结论", "A 与 B 不同，但线性变换没有改变", "P 只负责在两套坐标之间翻译；因此相似关系是同一个对象的两种坐标记录。")}
        </div>`;
      host.querySelectorAll("[data-sim-mode]").forEach((button) => on(button, "click", () => {
        mode = button.dataset.simMode;
        if (mode === "passport") renderPassport();
      }));
    }

    function renderPassport() {
      markExperimentStep(host, Math.min(page + 1, 3));
      const pair = passportPairs[pairKey];
      const visibleRows = pair.rows.slice(0, page + 1);
      const final = page === pair.rows.length - 1;
      const current = pair.rows[page];
      host.innerHTML = `
        <div class="ch8-lab ch8-story-lab ch8-similarity-story">
          <div class="ch8-story-tabs" role="tablist" aria-label="相似实验模式">
            <button type="button" data-sim-mode="rooms" aria-pressed="false"><span>01</span>同一变换换基</button>
            <button type="button" class="is-active" data-sim-mode="passport" aria-pressed="true"><span>02</span>打开结构护照</button>
          </div>
          <div class="ch8-passport-toolbar">
            <label>选择一对矩阵<select data-passport-pair>${Object.entries(passportPairs).map(([key, item]) => `<option value="${key}" ${key === pairKey ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>
            <div class="ch8-passport-page"><span>已打开 ${page + 1}/${pair.rows.length} 页</span><b>${current[0]}</b></div>
          </div>
          <div class="ch8-passport-matrices">
            <article><span>矩阵 A</span>${matrix(pair.A)}</article>
            <div><b>?</b><span>是否相似</span></div>
            <article><span>矩阵 B</span>${matrix(pair.B)}</article>
          </div>
          <div class="ch8-passport-book">
            ${pair.rows.map((row, rowIndex) => {
              const visible = rowIndex <= page;
              return `<article class="${visible ? "is-visible" : "is-locked"} ${visible && !row[3] ? "is-fail" : ""}">
                <span>${String(rowIndex + 1).padStart(2, "0")}</span>
                <b>${row[0]}</b>
                <div>${visible ? I(row[1]) : "•••"}</div>
                <i>${visible ? (row[3] ? "=" : "≠") : "锁定"}</i>
                <div>${visible ? I(row[2]) : "•••"}</div>
                <small>${visible ? row[4] : "继续打开下一层"}</small>
              </article>`;
            }).join("")}
          </div>
          <div class="ch8-passport-controls">
            <button type="button" data-passport-prev ${page === 0 ? "disabled" : ""}>← 收回一页</button>
            <div><span>当前能否下结论？</span><strong>${final ? pair.conclusion : current[3] ? "还不能；相同的必要条件仍可能不足。" : "已经发现不变量不同，可以立即排除相似。"}</strong></div>
            <button type="button" class="is-primary" data-passport-next ${final ? "disabled" : ""}>打开下一层 →</button>
          </div>
          ${conclusionMarkup("护照判定", final ? (pairKey === "similar" ? "不变因子完全一致：相似" : "不变因子不同：不相似") : `当前只检查到“${current[0]}”`, final ? pair.conclusion : "不要把目前通过的必要条件提前当作充分条件。", final && pairKey === "false" ? "danger" : "accent")}
        </div>`;
      host.querySelectorAll("[data-sim-mode]").forEach((button) => on(button, "click", () => {
        mode = button.dataset.simMode;
        if (mode === "rooms") renderRooms();
      }));
      on(host.querySelector("[data-passport-pair]"), "change", (event) => { pairKey = event.target.value; page = 0; renderPassport(); });
      on(host.querySelector("[data-passport-prev]"), "click", () => { page = Math.max(0, page - 1); renderPassport(); });
      on(host.querySelector("[data-passport-next]"), "click", () => { page = Math.min(passportPairs[pairKey].rows.length - 1, page + 1); renderPassport(); });
    }

    if (mode === "rooms") renderRooms();
    else renderPassport();
  }

  window.defineChapter8Lab("similarity-story", mount);
})();
