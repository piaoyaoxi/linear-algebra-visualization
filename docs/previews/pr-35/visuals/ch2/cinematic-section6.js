/* Chapter 2 cinematic interaction — section 6. */
(() => {
  const { M, tex, fmt, cinemaShell, defs } = window.Ch2Cinema;

  function mountCofactorCinema(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-c6-svg]");
    const A = [[1, 2, 0], [0, 3, 0], [4, 5, 6]];
    let active = { r: 1, c: 1 };
    let locked = true;
    const x0 = 150;
    const y0 = 155;
    const gap = 112;
    const size = 82;

    function cofactor(r, c) {
      const minor = M().minorMatrix(A, r, c);
      const m = M().det2(minor);
      const sign = (r + c) % 2 === 0 ? 1 : -1;
      return { minor, m, sign, value: sign * m };
    }

    function render() {
      const selected = cofactor(active.r, active.c);
      const cells = svg.querySelector("[data-c6-cells]");
      cells.innerHTML = A.map((row, r) => row.map((value, c) => {
        const deleted = r === active.r || c === active.c;
        const current = r === active.r && c === active.c;
        const showDeleted = locked && deleted;
        const remain = locked && !deleted;
        return `<g data-cell="${r}-${c}" class="cinema-cofactor-cell${current ? " is-current" : ""}${showDeleted ? " is-deleted" : ""}${remain ? " is-remain" : ""}" role="button" tabindex="0" aria-label="第 ${r + 1} 行第 ${c + 1} 列元素 ${value}"><rect x="${x0 + c * gap}" y="${y0 + r * gap}" width="${size}" height="${size}" rx="18"/><text x="${x0 + c * gap + size / 2}" y="${y0 + r * gap + 51}" text-anchor="middle">${value}</text></g>`;
      }).join("")).join("");

      cells.querySelectorAll("[data-cell]").forEach((cell) => {
        const [r, c] = cell.dataset.cell.split("-").map(Number);
        const deleted = r === active.r || c === active.c;
        const current = r === active.r && c === active.c;
        const activate = () => {
          if (locked && deleted && !current) return;
          active = { r, c };
          locked = true;
          root.querySelector("[data-c6-note]").textContent = "横线和竖线划掉的格子已弱化并锁定；剩余四格保持原相对位置。";
          render();
        };
        cell.addEventListener("click", activate, { signal });
        cell.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate();
          }
        }, { signal });
      });

      const rowY = y0 + active.r * gap + size / 2;
      const colX = x0 + active.c * gap + size / 2;
      const rowLine = svg.querySelector("[data-c6-row-line]");
      rowLine.setAttribute("y1", rowY);
      rowLine.setAttribute("y2", rowY);
      rowLine.style.opacity = locked ? ".9" : "0";
      const colLine = svg.querySelector("[data-c6-col-line]");
      colLine.setAttribute("x1", colX);
      colLine.setAttribute("x2", colX);
      colLine.style.opacity = locked ? ".9" : "0";

      const mini = svg.querySelector("[data-c6-minor]");
      mini.innerHTML = selected.minor.map((row, r) => row.map((value, c) => `<g class="cinema-minor-cell"><rect x="${675 + c * 110}" y="${200 + r * 110}" width="82" height="82" rx="18"/><text x="${716 + c * 110}" y="${251 + r * 110}" text-anchor="middle">${value}</text></g>`).join("")).join("");

      root.querySelector("[data-pos]").textContent = `a${active.r + 1}${active.c + 1}`;
      root.querySelectorAll("[data-mij]").forEach((element) => { element.textContent = fmt(selected.m, 3); });
      root.querySelector("[data-sign]").textContent = selected.sign > 0 ? "+1" : "−1";
      root.querySelector("[data-cij]").textContent = fmt(selected.value, 3);
      root.querySelector("[data-c6-minor-tex]").innerHTML = tex(`\\begin{bmatrix}${selected.minor[0].join("&")}\\\\${selected.minor[1].join("&")}\\end{bmatrix}`);
    }

    root.querySelector("[data-c6-reselect]").addEventListener("click", () => {
      locked = false;
      root.querySelector("[data-c6-note]").textContent = "删除线暂时解除：现在可以点击任意元素，选定后会重新锁定对应行列。";
      render();
    }, { signal });

    render();
    return () => controller.abort();
  }

  window.extendChapter2Renderer("cofactor-expansion", {
    interactive(root) {
      if (!root) return;
      const controls = `<button type="button" data-c6-reselect>重新选择元素</button>`;
      const stage = `
        <div class="ch2-cinema-stage">
          <svg data-c6-svg viewBox="0 0 1000 580" role="img" aria-label="点击矩阵元素后，用横线和竖线删去对应行列，剩余四格组成余子矩阵">
            ${defs("c6")}
            <text x="40" y="52" class="cinema-kicker">余子式就是一次清楚的删行删列</text>
            <text x="40" y="86" class="cinema-title">划掉一行和一列，剩下的四格原样搬过去</text>
            <g data-c6-cells></g>
            <line data-c6-row-line x1="120" x2="500" class="cinema-delete-line"/>
            <line data-c6-col-line y1="126" y2="500" class="cinema-delete-line"/>
            <path d="M530 310H630" class="cinema-operation-arrow" marker-end="url(#c6-arrow-white)"/>
            <text x="700" y="160" class="cinema-small">剩余四格组成余子矩阵</text>
            <g data-c6-minor></g>
          </svg>
        </div>`;
      const after = `
        <div class="ch2-cinema-equation-grid is-compact">
          <div><span>选中元素</span><strong data-pos></strong></div><i>→</i>
          <div><span>余子矩阵</span><strong data-c6-minor-tex></strong></div><i>→</i>
          <div><span>余子式 Mij</span><strong data-mij></strong></div><i>→</i>
          <div><span>代数余子式 Cij</span><strong><span data-sign></span> × <span data-mij></span> = <span data-cij></span></strong></div>
        </div>
        <div class="ch2-cinema-conclusion"><span data-c6-note>横线和竖线划掉的格子已弱化并锁定；剩余四格保持原相对位置。</span></div>`;
      root.innerHTML = `<h2>交互实验</h2>${cinemaShell(
        "让“删第 i 行、第 j 列”真正发生在眼前",
        "选中一个元素后，细横线划掉它所在的行，细竖线划掉它所在的列；剩余四格立即突出并移动成右侧余子矩阵。",
        "先观察 a22，再点击“重新选择元素”换一个位置。不要先算，先确认哪四个格子应该留下。",
        controls,
        stage,
        after,
      )}`;
      return mountCofactorCinema(root);
    },
  });
})();
