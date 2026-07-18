/* Chapter 2 cinematic interaction — section 5. */
(() => {
  const { M, tex, fmt, pause, setActive, svgPoint, matrixTex2, cinemaShell, defs } = window.Ch2Cinema;
  function mountEliminationCinema(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-c5-svg]");
    const states = [
      { A:[[2,1,0],[1,3,1],[0,2,1]], op:"起点", target:null, note:"目标：只用倍加，把主对角线下方变成 0。" },
      { A:[[2,1,0],[0,2.5,1],[0,2,1]], op:"R₂ ← R₂ − 0.5R₁", target:[1,0], note:"第一个零出现。倍加不改变 det。" },
      { A:[[2,1,0],[0,2.5,1],[0,0,0.2]], op:"R₃ ← R₃ − 0.8R₂", target:[2,1], note:"得到上三角矩阵，直接读主对角线乘积。" },
    ];
    let step = 0;
    const x0=178,y0=155,gap=120,size=88;

    function render() {
      const state=states[step];
      const cells=svg.querySelector("[data-c5-cells]");
      cells.innerHTML=state.A.map((row,r)=>row.map((value,c)=>`<g class="cinema-elim-cell${state.target && state.target[0]===r && state.target[1]===c ? " is-target" : ""}${Math.abs(value)<1e-9 && r>c ? " is-created-zero" : ""}"><rect x="${x0+c*gap}" y="${y0+r*gap}" width="${size}" height="${size}" rx="18"/><text x="${x0+c*gap+size/2}" y="${y0+r*gap+53}" text-anchor="middle">${fmt(value,2)}</text></g>`).join("")).join("");
      svg.querySelector("[data-c5-op]").textContent=state.op;
      root.querySelector("[data-step-count]").textContent=`${step}/2`;
      root.querySelector("[data-triangle-status]").textContent=state.note;
      root.querySelector("[data-orig]").textContent="1";
      root.querySelector("[data-c5-diagonal]").textContent=step===2?"2 × 2.5 × 0.2 = 1":"尚未形成上三角";
      root.querySelectorAll("[data-c5-progress]").forEach((item,index)=>item.classList.toggle("is-active",index<=step));
      root.querySelector("[data-c5-next]").disabled=step>=2;
    }
    root.querySelector("[data-c5-next]").addEventListener("click",()=>{step=Math.min(2,step+1);render();},{signal});
    root.querySelector("[data-op-demo]").addEventListener("click",async()=>{step=0;render();await pause(350);step=1;render();await pause(500);step=2;render();},{signal});
    root.querySelector("[data-c5-reset]").addEventListener("click",()=>{step=0;render();},{signal});
    render();
    return ()=>controller.abort();
  }

  window.extendChapter2Renderer("determinant-computation", {
    interactive(root) {
      if (!root) return;
      const controls=`<button type="button" data-c5-next>下一步</button><button type="button" data-op-demo>播放完整消元</button><button type="button" data-c5-reset>重置</button>`;
      const stage=`
        <div class="ch2-cinema-stage">
          <svg data-c5-svg viewBox="0 0 1000 580" role="img" aria-label="通过两次倍加把三阶矩阵化为上三角矩阵">
            ${defs("c5")}
            <text x="40" y="52" class="cinema-kicker">计算不是展开所有项，而是制造结构</text>
            <text x="40" y="86" class="cinema-title">两次倍加，把行列式送到上三角终点</text>
            <g data-c5-cells></g>
            <path d="M585 302H690" class="cinema-operation-arrow" marker-end="url(#c5-arrow-white)"/>
            <g transform="translate(710 170)"><text class="cinema-small">当前操作</text><text data-c5-op y="58" class="cinema-title-small"></text><text y="148" class="cinema-small">倍加倍率</text><text y="196" class="cinema-title-small">×1</text><text y="286" class="cinema-small">原 det 始终保持</text><text y="334" class="cinema-title-small">det = 1</text></g>
          </svg>
        </div>`;
      const after=`
        <div class="ch2-cinema-progress"><span data-c5-progress>读结构</span><span data-c5-progress>制造第一个零</span><span data-c5-progress>形成上三角</span></div>
        <div class="ch2-cinema-equation-grid is-compact"><div><span>步骤</span><strong data-step-count></strong></div><i>→</i><div><span>原 det</span><strong data-orig></strong></div><i>→</i><div><span>对角线乘积</span><strong data-c5-diagonal></strong></div></div>
        <div class="ch2-cinema-conclusion"><span data-triangle-status></span></div>`;
      root.innerHTML=`<h2>交互实验</h2>${cinemaShell(
        "把消元过程画成一条有终点的路线",
        "这里不提供一堆无目标按钮。每一步只做一件事：选主元、消掉一个目标元素，并说明这一行变换为什么不改变 det。",
        "先逐步执行，再播放完整过程。注意两个新出现的 0，以及上三角终点怎样把计算压缩成三个对角元相乘。",
        controls,stage,after)}`;
      return mountEliminationCinema(root);
    },
  });
})();
