/* Chapter 2 cinematic interaction — section 3. */
(() => {
  const { M, tex, fmt, pause, setActive, svgPoint, matrixTex2, cinemaShell, defs } = window.Ch2Cinema;
  function mountLeibnizCinema(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-c3-svg]");
    let chosen = [null, null, null];
    let triangular = false;
    const x0 = 260; const y0 = 150; const gap = 115; const size = 82;

    function render() {
      const cells = svg.querySelector("[data-c3-cells]");
      const used = new Set(chosen.filter((v) => v !== null));
      cells.innerHTML = Array.from({ length: 3 }, (_, r) => Array.from({ length: 3 }, (_, c) => {
        const selected = chosen[r] === c;
        const locked = used.has(c) && !selected;
        const zero = triangular && r > c;
        return `<g data-cell="${r}-${c}" class="cinema-matrix-cell${selected ? " is-selected" : ""}${locked ? " is-locked" : ""}${zero ? " is-zero" : ""}" role="button" tabindex="0" aria-label="第 ${r+1} 行第 ${c+1} 列">
          <rect x="${x0 + c*gap}" y="${y0 + r*gap}" width="${size}" height="${size}" rx="18" />
          <text x="${x0 + c*gap + size/2}" y="${y0 + r*gap + 49}" text-anchor="middle">${zero ? "0" : `a${r+1}${c+1}`}</text>
        </g>`;
      }).join("")).join("");
      cells.querySelectorAll("[data-cell]").forEach((cell) => {
        const activate = () => {
          const [r,c] = cell.dataset.cell.split("-").map(Number);
          if (used.has(c) && chosen[r] !== c) return;
          chosen[r] = chosen[r] === c ? null : c;
          render();
        };
        cell.addEventListener("click", activate, { signal });
        cell.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } }, { signal });
      });
      const points = chosen.map((c,r) => c === null ? null : [x0 + c*gap + size/2, y0 + r*gap + size/2]).filter(Boolean);
      svg.querySelector("[data-c3-path]").setAttribute("points", points.map((p)=>p.join(",")).join(" "));
      root.querySelector("[data-c3-locks]").textContent = used.size ? `已锁定列：${[...used].map((c)=>c+1).join("、")}` : "尚未锁定列";
      const complete = chosen.every((c)=>c !== null);
      if (!complete) {
        root.querySelector("[data-perm-out]").textContent = "未完成";
        root.querySelector("[data-sign-out]").textContent = "—";
        root.querySelector("[data-term-out]").textContent = "每行各选一个，并且不能重复列";
        root.querySelector("[data-zero-out]").textContent = "等待完整路径";
        return;
      }
      const perm = chosen.map((c)=>c+1);
      const sign = M().signFromPerm(perm);
      const containsZero = triangular && perm.some((col,row)=>row > col-1);
      root.querySelector("[data-perm-out]").textContent = perm.join("");
      root.querySelector("[data-sign-out]").textContent = sign > 0 ? "+" : "−";
      root.querySelector("[data-term-out]").innerHTML = `${sign > 0 ? "+" : "−"} ${perm.map((col,row)=>tex(`a_{${row+1}${col}}`)).join(" ")}`;
      root.querySelector("[data-zero-out]").textContent = containsZero ? "路径合法，但选中了零，所以贡献为 0" : "这是一条合法的 Leibniz 乘积项";
    }

    root.querySelector("[data-select-reset]").addEventListener("click", ()=>{ chosen=[null,null,null]; render(); }, { signal });
    root.querySelector("[data-select-231]").addEventListener("click", async ()=>{
      chosen=[null,null,null]; render();
      for (const [r,c] of [[0,1],[1,2],[2,0]]) { chosen[r]=c; render(); await pause(220); }
    }, { signal });
    root.querySelector("[data-triangle-toggle]").addEventListener("click", (event)=>{
      triangular=!triangular;
      event.currentTarget.classList.toggle("is-active", triangular);
      event.currentTarget.textContent = triangular ? "恢复一般矩阵" : "切换上三角矩阵";
      render();
    }, { signal });
    render();
    return ()=>controller.abort();
  }

  window.extendChapter2Renderer("n-order-determinant", {
    interactive(root) {
      if (!root) return;
      const controls = `<button type="button" data-select-231>播放路径 231</button><button type="button" data-triangle-toggle>切换上三角矩阵</button><button type="button" data-select-reset>清空</button>`;
      const stage = `
        <div class="ch2-cinema-stage">
          <svg data-c3-svg viewBox="0 0 1000 580" role="img" aria-label="在三阶矩阵中每行每列各选一个元素生成 Leibniz 项">
            ${defs("c3")}
            <text x="40" y="52" class="cinema-kicker">从矩阵路径到排列项</text>
            <text x="40" y="86" class="cinema-title">每行选一次、每列也只能用一次</text>
            <text x="158" y="192" class="cinema-small">第 1 行</text><text x="158" y="307" class="cinema-small">第 2 行</text><text x="158" y="422" class="cinema-small">第 3 行</text>
            <text x="300" y="126" text-anchor="middle" class="cinema-small">第 1 列</text><text x="415" y="126" text-anchor="middle" class="cinema-small">第 2 列</text><text x="530" y="126" text-anchor="middle" class="cinema-small">第 3 列</text>
            <polyline data-c3-path class="cinema-selection-path" />
            <g data-c3-cells></g>
            <g transform="translate(690 160)">
              <text x="0" y="0" class="cinema-small">完整路径压缩成</text>
              <text x="0" y="52" class="cinema-title-small">排列 σ</text>
              <text x="0" y="136" class="cinema-title-small">符号 sgn(σ)</text>
              <text x="0" y="220" class="cinema-title-small">乘积项</text>
            </g>
          </svg>
        </div>`;
      const after = `
        <div class="ch2-cinema-equation-grid is-compact">
          <div><span>列锁定</span><strong data-c3-locks></strong></div><i>→</i>
          <div><span>排列</span><strong data-perm-out></strong></div><i>→</i>
          <div><span>符号</span><strong data-sign-out></strong></div><i>→</i>
          <div><span>乘积项</span><strong data-term-out></strong></div>
        </div>
        <div class="ch2-cinema-conclusion"><span data-zero-out></span></div>`;
      root.innerHTML = `<h2>交互实验</h2>${cinemaShell(
        "亲手走出一条 Leibniz 路径",
        "行列式的每一项都不是随便乘三个数，而是在矩阵中走出一条“每行一次、每列一次”的完整路径。",
        "播放 231，然后切换成上三角矩阵。区分“路径不合法”和“路径合法但因为零结构而贡献为 0”。",
        controls,
        stage,
        after,
      )}`;
      return mountLeibnizCinema(root);
    },
  });
})();
