/* Final layout override for Chapter 2 §5. */
(() => {
  const C = window.Ch2Story;
  if (!C || typeof window.extendChapter2Renderer !== "function") return;
  const { M, fmt, shell, animate, determinant } = C;

  function cells(matrix, x, y, size = 78, gap = 13, classFor = () => "") {
    return matrix.map((row, r) => row.map((value, c) => {
      const cx = x + c * (size + gap);
      const cy = y + r * (size + gap);
      return `<g class="story-elim-cell ${classFor(r, c)}"><rect x="${cx}" y="${cy}" width="${size}" height="${size}" rx="14"/><text x="${cx + size / 2}" y="${cy + size / 2 + 1}" text-anchor="middle" dominant-baseline="middle">${fmt(value, 3)}</text></g>`;
    }).join("")).join("");
  }

  function mount(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-elim-svg]");
    const states = [
      [[2, 1, 0], [1, 3, 1], [0, 2, 1]],
      [[2, 1, 0], [0, 2.5, 1], [0, 2, 1]],
      [[2, 1, 0], [0, 2.5, 1], [0, 0, 0.2]],
    ];
    const operations = ["先锁定 a₂₁", "R₂ ← R₂ − 0.5R₁", "R₃ ← R₃ − 0.8R₂"];
    const goals = ["把 a₂₁ 变成 0", "把 a₃₂ 变成 0", "读取主对角线乘积"];
    let step = 0;
    let current = states[0].map((row) => row.slice());
    let busy = false;

    function target() {
      if (step === 0) return [1, 0];
      if (step === 1) return [2, 1];
      return null;
    }

    function render() {
      const activeTarget = target();
      svg.querySelector("[data-elim-matrix]").innerHTML = cells(current, 125, 128, 78, 13, (r, c) => {
        if (activeTarget && r === activeTarget[0] && c === activeTarget[1]) return "is-target";
        if ((step >= 1 && r === 1 && c === 0) || (step >= 2 && r === 2 && c === 1)) return "is-zero";
        return "";
      });
      svg.querySelector("[data-elim-stage-goal]").textContent = goals[step];
      svg.querySelector("[data-elim-stage-op]").textContent = operations[step];
      svg.querySelector("[data-elim-stage-read]").textContent = step === 2 ? "2 × 2.5 × 0.2 = 1" : "det 始终保持为 1";
      root.querySelector("[data-elim-step]").textContent = `${step + 1} / 3`;
      root.querySelector("[data-elim-op]").textContent = operations[step];
      root.querySelector("[data-elim-det]").textContent = fmt(determinant(current), 4);
      root.querySelector("[data-elim-diag]").textContent = step === 2 ? `${fmt(current[0][0])} × ${fmt(current[1][1])} × ${fmt(current[2][2])} = ${fmt(determinant(current), 4)}` : "尚未到上三角";
      root.querySelector("[data-elim-message]").textContent = step === 0
        ? "只看橙色 a₂₁：这一刻不需要展开行列式，也不需要同时处理其他元素。"
        : step === 1
          ? "a₂₁ 已经变成青色的 0；倍加行不改变 det，现在注意力移动到 a₃₂。"
          : "主对角线下方已经全为 0，计算被压缩成三个对角元相乘。";
      root.querySelector("[data-elim-next]").disabled = busy || step >= 2;
      root.querySelector("[data-elim-play]").disabled = busy;
    }

    async function goTo(next) {
      if (busy || next === step) return;
      busy = true;
      const from = current.map((row) => row.slice());
      const to = states[next].map((row) => row.slice());
      step = next;
      try {
        await animate(svg, 540, (t) => {
          current = from.map((row, r) => row.map((value, c) => M().lerp(value, to[r][c], t)));
          render();
        });
      } finally {
        current = to;
        busy = false;
        render();
      }
    }

    root.querySelector("[data-elim-next]").addEventListener("click", () => { void goTo(Math.min(2, step + 1)); }, { signal });
    root.querySelector("[data-elim-reset]").addEventListener("click", () => {
      if (!busy) {
        step = 0;
        current = states[0].map((row) => row.slice());
        render();
      }
    }, { signal });
    root.querySelector("[data-elim-play]").addEventListener("click", async () => {
      if (busy) return;
      if (step !== 0) {
        step = 0;
        current = states[0].map((row) => row.slice());
        render();
      }
      await goTo(1);
      await goTo(2);
    }, { signal });

    render();
    return () => { controller.abort(); M().cancelAnim(svg); };
  }

  window.extendChapter2Renderer("determinant-computation", {
    interactive(root) {
      if (!root) return;
      const controls = `<button type="button" data-elim-next>执行下一步</button><button type="button" data-elim-play>播放完整路线</button><button type="button" data-elim-reset>重置</button>`;
      const stage = `<div class="ch2-story-stage is-plain"><svg data-elim-svg viewBox="0 0 900 500" role="img" aria-label="矩阵左侧显示消元状态，右侧只显示当前目标、当前操作和不变量"><text x="34" y="42" class="story-caption">矩阵是主角：每一步只盯住一个待消元素</text><text x="246" y="91" text-anchor="middle" class="story-label">当前矩阵</text><g data-elim-matrix></g><rect x="500" y="102" width="330" height="310" rx="22" class="story-panel-soft"/><text x="530" y="147" class="story-label-small">当前目标</text><text x="530" y="184" class="story-stage-emphasis" data-elim-stage-goal></text><line x1="530" y1="211" x2="800" y2="211" class="story-panel-divider"/><text x="530" y="250" class="story-label-small">当前操作</text><text x="530" y="287" class="story-label" data-elim-stage-op></text><line x1="530" y1="314" x2="800" y2="314" class="story-panel-divider"/><text x="530" y="353" class="story-label-small">不变量 / 最终读取</text><text x="530" y="390" class="story-label" data-elim-stage-read></text></svg></div>`;
      const formula = `<div><span>当前阶段</span><strong data-elim-step></strong></div><div><span>当前行操作</span><strong data-elim-op></strong></div><div><span>当前 det</span><strong data-elim-det></strong></div><div><span>最终读取</span><strong data-elim-diag></strong></div>`;
      root.innerHTML = `<h2>交互实验</h2>${shell("消元不是一堆按钮，而是一条逐个制造零的路线", "矩阵始终占据主要画面；右侧只保留当前目标、当前操作和不变量，不再用无关箭头填补空白。", "每一步只追踪一个橙色元素。它变成青色的 0 后，再移动到下一个目标。", controls, stage, formula, `<strong>现在该看什么</strong><span data-elim-message></span>`)}`;
      return mount(root);
    },
  });
})();