/* Chapter 2 geometry-first interaction — section 3. */
(() => {
  const { M, tex, pause, cinemaShell, defs } = window.Ch2Cinema;

  function mountLeibnizCinema(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-c3-svg]");
    let chosen = [null, null, null];
    let triangular = false;
    const x0 = 190;
    const y0 = 155;
    const gap = 120;
    const size = 86;

    function setSvgSummary(permutation, sign, term, note) {
      svg.querySelector("[data-c3-svg-perm]").textContent = permutation;
      svg.querySelector("[data-c3-svg-sign]").textContent = sign;
      svg.querySelector("[data-c3-svg-term]").textContent = term;
      svg.querySelector("[data-c3-svg-note]").textContent = note;
    }

    function render() {
      const cells = svg.querySelector("[data-c3-cells]");
      const used = new Set(chosen.filter((value) => value !== null));
      cells.innerHTML = Array.from({ length: 3 }, (_, row) => Array.from({ length: 3 }, (_, col) => {
        const selected = chosen[row] === col;
        const locked = used.has(col) && !selected;
        const zero = triangular && row > col;
        return `
          <g data-cell="${row}-${col}" class="cinema-matrix-cell${selected ? " is-selected" : ""}${locked ? " is-locked" : ""}${zero ? " is-zero" : ""}" role="button" tabindex="0" aria-label="第 ${row + 1} 行第 ${col + 1} 列">
            <rect x="${x0 + col * gap}" y="${y0 + row * gap}" width="${size}" height="${size}" rx="17" />
            <text x="${x0 + col * gap + size / 2}" y="${y0 + row * gap + 52}" text-anchor="middle">${zero ? "0" : `a${row + 1}${col + 1}`}</text>
          </g>`;
      }).join("")).join("");

      cells.querySelectorAll("[data-cell]").forEach((cell) => {
        const activate = () => {
          const [row, col] = cell.dataset.cell.split("-").map(Number);
          if (used.has(col) && chosen[row] !== col) return;
          chosen[row] = chosen[row] === col ? null : col;
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

      const points = chosen
        .map((col, row) => col === null ? null : [x0 + col * gap + size / 2, y0 + row * gap + size / 2])
        .filter(Boolean);
      svg.querySelector("[data-c3-path]").setAttribute("points", points.map((point) => point.join(",")).join(" "));
      root.querySelector("[data-c3-locks]").textContent = used.size
        ? `已锁定列：${[...used].map((col) => col + 1).join("、")}`
        : "尚未锁定列";

      const complete = chosen.every((col) => col !== null);
      if (!complete) {
        root.querySelector("[data-perm-out]").textContent = "未完成";
        root.querySelector("[data-sign-out]").textContent = "—";
        root.querySelector("[data-term-out]").textContent = "每行各选一个，并且不能重复列";
        root.querySelector("[data-zero-out]").textContent = "等待完整路径";
        setSvgSummary("—", "—", "—", "继续选择：每一行一次，每一列也只能一次");
        return;
      }

      const permutation = chosen.map((col) => col + 1);
      const sign = M().signFromPerm(permutation);
      const containsZero = triangular && permutation.some((col, row) => row > col - 1);
      const termText = `${sign > 0 ? "+" : "−"}${permutation.map((col, row) => `a${row + 1}${col}`).join("·")}`;
      root.querySelector("[data-perm-out]").textContent = permutation.join("");
      root.querySelector("[data-sign-out]").textContent = sign > 0 ? "+" : "−";
      root.querySelector("[data-term-out]").innerHTML = `${sign > 0 ? "+" : "−"} ${permutation.map((col, row) => tex(`a_{${row + 1}${col}}`)).join(" ")}`;
      root.querySelector("[data-zero-out]").textContent = containsZero
        ? "路径合法，但选中了上三角矩阵下方的零，所以贡献为 0"
        : "这是一条合法的 Leibniz 乘积项";
      setSvgSummary(
        permutation.join(""),
        sign > 0 ? "+1" : "−1",
        termText,
        containsZero ? "合法路径，数值贡献为 0" : "合法路径，进入行列式求和",
      );
    }

    root.querySelector("[data-select-reset]").addEventListener("click", () => {
      chosen = [null, null, null];
      render();
    }, { signal });

    root.querySelector("[data-select-231]").addEventListener("click", async () => {
      chosen = [null, null, null];
      render();
      for (const [row, col] of [[0, 1], [1, 2], [2, 0]]) {
        chosen[row] = col;
        render();
        await pause(220);
      }
    }, { signal });

    root.querySelector("[data-triangle-toggle]").addEventListener("click", (event) => {
      triangular = !triangular;
      event.currentTarget.classList.toggle("is-active", triangular);
      event.currentTarget.textContent = triangular ? "恢复一般矩阵" : "切换上三角矩阵";
      render();
    }, { signal });

    render();
    return () => controller.abort();
  }

  window.extendChapter2Renderer("n-order-determinant", {
    interactive(root) {
      if (!root) return;
      const controls = `
        <button type="button" data-select-231>播放路径 231</button>
        <button type="button" data-triangle-toggle>切换上三角矩阵</button>
        <button type="button" data-select-reset>清空选择</button>`;
      const stage = `
        <div class="ch2-cinema-stage">
          <svg data-c3-svg viewBox="0 0 1000 560" role="img" aria-label="在三阶矩阵中每行每列各选一个元素，形成一条 Leibniz 路径">
            ${defs("c3")}
            <text x="40" y="44" class="cinema-kicker">一条合法路径 = 一个排列 = 一个乘积项</text>
            <text x="40" y="76" class="cinema-title">不是随便挑三个数，而是每行、每列各用一次</text>
            <text x="112" y="202" class="cinema-small">第 1 行</text>
            <text x="112" y="322" class="cinema-small">第 2 行</text>
            <text x="112" y="442" class="cinema-small">第 3 行</text>
            <text x="233" y="132" text-anchor="middle" class="cinema-small">第 1 列</text>
            <text x="353" y="132" text-anchor="middle" class="cinema-small">第 2 列</text>
            <text x="473" y="132" text-anchor="middle" class="cinema-small">第 3 列</text>
            <polyline data-c3-path class="cinema-selection-path" />
            <g data-c3-cells></g>
            <g transform="translate(650 150)">
              <rect x="0" y="0" width="286" height="318" rx="22" class="cinema-panel-bg" />
              <text x="24" y="40" class="cinema-small">路径压缩后的代数信息</text>
              <text x="24" y="90" class="cinema-small">排列 σ</text>
              <text x="150" y="90" class="cinema-title-small" data-c3-svg-perm>—</text>
              <text x="24" y="142" class="cinema-small">sgn(σ)</text>
              <text x="150" y="142" class="cinema-title-small" data-c3-svg-sign>—</text>
              <text x="24" y="194" class="cinema-small">乘积项</text>
              <text x="24" y="230" class="cinema-title-small" data-c3-svg-term>—</text>
              <line x1="24" y1="254" x2="262" y2="254" class="cinema-axis" />
              <text x="24" y="286" class="cinema-small" data-c3-svg-note></text>
            </g>
          </svg>
        </div>`;
      const after = `
        <div class="ch2-cinema-equation-grid is-compact">
          <div><span>列锁定</span><strong data-c3-locks></strong></div>
          <i>→</i>
          <div><span>排列</span><strong data-perm-out></strong></div>
          <i>→</i>
          <div><span>符号</span><strong data-sign-out></strong></div>
          <i>→</i>
          <div><span>乘积项</span><strong data-term-out></strong></div>
        </div>
        <div class="ch2-cinema-conclusion"><strong>路径状态</strong><span data-zero-out></span></div>`;
      root.innerHTML = `<h2>交互实验</h2>${cinemaShell(
        "亲手走出一条 Leibniz 路径",
        "矩阵里的高亮路径和右侧的排列、符号、乘积项同步出现。学生不需要把视线在一堆卡片之间来回找。",
        "先点击每行中的一个元素。观察某一列被使用后，同列其他格子为什么立即锁定。",
        controls,
        stage,
        after,
      )}`;
      return mountLeibnizCinema(root);
    },
  });
})();