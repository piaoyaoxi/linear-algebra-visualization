/* Chapter 2 cinematic interaction — section 4. */
(() => {
  const { M, tex, fmt, pause, setActive, svgPoint, matrixTex2, cinemaShell, defs } = window.Ch2Cinema;
  function mountPropertyCinema(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-c4-svg]");
    const base = [[1.2,0.35],[0.2,1.1]];
    let mode = "swap";
    const scenes = {
      swap: { A: [[0.35,1.2],[1.1,0.2]], factor: -1, label: "交换两列", reason: "同一个平行四边形改变了绕行方向，所以面积绝对值不变、符号翻转。" },
      scale: { A: [[1.8,0.35],[0.3,1.1]], factor: 1.5, label: "第一列乘 1.5", reason: "一条生成边放大 1.5 倍，高保持不变，因此面积也乘 1.5。" },
      add: { A: [[1.2,1.55],[0.2,1.3]], factor: 1, label: "第二列加第一列", reason: "平行四边形发生剪切，底和高对应的面积保持不变。" },
    };
    const panels = [{ x: 70, y: 128 }, { x: 580, y: 128 }];

    function panelPolygon(A, panel) {
      const origin = [panel.x + 130, panel.y + 265];
      const scale = 105;
      const map = ([x,y]) => [origin[0] + x*scale, origin[1] - y*scale];
      return [[0,0],[A[0][0],A[1][0]],[A[0][0]+A[0][1],A[1][0]+A[1][1]],[A[0][1],A[1][1]]].map(map).map((p)=>p.join(",")).join(" ");
    }

    function render() {
      const scene = scenes[mode];
      svg.querySelector("[data-c4-before]").setAttribute("points", panelPolygon(base, panels[0]));
      svg.querySelector("[data-c4-after]").setAttribute("points", panelPolygon(scene.A, panels[1]));
      svg.querySelector("[data-c4-op-label]").textContent = scene.label;
      const d0 = M().det2(base); const d1 = M().det2(scene.A);
      root.querySelector("[data-base-det]").textContent = fmt(d0,3);
      root.querySelector("[data-cur-det]").textContent = fmt(d1,3);
      root.querySelector("[data-factor]").textContent = fmt(scene.factor,3);
      root.querySelector("[data-check]").textContent = `${fmt(d1,3)} = ${fmt(scene.factor,3)} × ${fmt(d0,3)}`;
      root.querySelector("[data-c4-reason]").textContent = scene.reason;
    }

    root.querySelectorAll("[data-c4-mode]").forEach((button)=>button.addEventListener("click",()=>{
      mode=button.dataset.c4Mode;
      setActive(root,"[data-c4-mode]",button);
      render();
    },{signal}));
    render();
    return ()=>controller.abort();
  }

  window.extendChapter2Renderer("determinant-properties", {
    interactive(root) {
      if (!root) return;
      const controls = `<button type="button" class="is-active" data-c4-mode="swap" data-op-swap>交换两列</button><button type="button" data-c4-mode="scale" data-op-scale>第一列 ×1.5</button><button type="button" data-c4-mode="add" data-op-add>第二列加第一列</button>`;
      const stage = `
        <div class="ch2-cinema-stage">
          <svg data-c4-svg viewBox="0 0 1000 580" role="img" aria-label="比较列操作前后平行四边形的有向面积">
            ${defs("c4")}
            <text x="40" y="52" class="cinema-kicker">三条性质，对应三种几何动作</text>
            <text x="40" y="86" class="cinema-title">交换、伸缩、剪切分别怎样改变 det</text>
            <g class="cinema-panel"><rect x="60" y="112" width="370" height="392" rx="28"/><text x="88" y="150">操作前</text><polygon data-c4-before class="cinema-parallelogram"/></g>
            <path d="M445 310H555" class="cinema-operation-arrow" marker-end="url(#c4-arrow-white)" />
            <text data-c4-op-label x="500" y="284" text-anchor="middle" class="cinema-small"></text>
            <g class="cinema-panel"><rect x="570" y="112" width="370" height="392" rx="28"/><text x="598" y="150">操作后</text><polygon data-c4-after class="cinema-parallelogram alt"/></g>
          </svg>
        </div>`;
      const after = `
        <div class="ch2-cinema-equation-grid is-compact">
          <div><span>原 det</span><strong data-base-det></strong></div><i>→</i>
          <div><span>操作倍率</span><strong data-factor></strong></div><i>→</i>
          <div><span>新 det</span><strong data-cur-det></strong></div><i>→</i>
          <div><span>核对</span><strong data-check></strong></div>
        </div><div class="ch2-cinema-conclusion"><span data-c4-reason></span></div>`;
      root.innerHTML = `<h2>交互实验</h2>${cinemaShell(
        "不要背三条规则，直接看图形做了什么",
        "矩阵的两列是平行四边形的两条生成边。交换、倍乘和倍加分别对应方向翻转、伸缩和剪切。",
        "依次切换三种操作，先看图形，再预测 det 的倍率，最后用下方等式核对。",
        controls,
        stage,
        after,
      )}`;
      return mountPropertyCinema(root);
    },
  });
})();
