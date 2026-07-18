/* Chapter 2 cinematic interaction — section 2. */
(() => {
  const { M, tex, fmt, pause, setActive, svgPoint, matrixTex2, cinemaShell, defs } = window.Ch2Cinema;
  // §2 — permutation crossings.
  function mountPermutationCinema(root) {
    const controller = new AbortController();
    const { signal } = controller;
    const svg = root.querySelector("[data-c2-svg]");
    let permutation = [3, 1, 4, 2];
    let selected = -1;
    const xs = [150, 380, 610, 840];
    const topY = 132;
    const bottomY = 446;

    function render() {
      const inversions = M().inversionPairs(permutation);
      const sign = M().signFromPerm(permutation);
      const wires = svg.querySelector("[data-c2-wires]");
      wires.innerHTML = permutation.map((value, index) => {
        const x1 = xs[index];
        const x2 = xs[value - 1];
        return `<path d="M${x1} ${topY + 30} C${x1} 245 ${x2} 335 ${x2} ${bottomY - 30}" class="cinema-wire" />`;
      }).join("");
      const cards = svg.querySelector("[data-c2-cards]");
      cards.innerHTML = permutation.map((value, index) => `
        <g data-index="${index}" class="cinema-perm-card${selected === index ? " is-selected" : ""}" role="button" tabindex="0" aria-label="位置 ${index + 1} 的数 ${value}">
          <rect x="${xs[index] - 46}" y="${topY - 38}" width="92" height="76" rx="20" />
          <text x="${xs[index]}" y="${topY + 10}" text-anchor="middle">${value}</text>
        </g>`).join("");
      cards.querySelectorAll("[data-index]").forEach((card) => {
        const activate = () => {
          const index = Number(card.dataset.index);
          if (selected < 0) { selected = index; render(); return; }
          if (selected === index) { selected = -1; render(); return; }
          [permutation[selected], permutation[index]] = [permutation[index], permutation[selected]];
          selected = -1;
          render();
        };
        card.addEventListener("click", activate, { signal });
        card.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); }
        }, { signal });
      });
      root.querySelector("[data-perm-text]").textContent = permutation.join("");
      root.querySelector("[data-tau]").textContent = String(inversions.length);
      root.querySelector("[data-parity]").textContent = inversions.length % 2 ? "奇排列" : "偶排列";
      root.querySelector("[data-sgn]").textContent = sign > 0 ? "+1" : "−1";
      root.querySelector("[data-c2-pairs]").innerHTML = inversions.length
        ? inversions.map(({ a, b }) => `<span>${a}＞${b}</span>`).join("")
        : "<span>没有逆序</span>";
      root.querySelector("[data-c2-explain]").textContent = `图中有 ${inversions.length} 个交叉，因此 τ=${inversions.length}，符号是 ${sign > 0 ? "+1" : "−1"}。`;
    }

    root.querySelectorAll("[data-perm-preset]").forEach((button) => button.addEventListener("click", () => {
      const presets = { id: [1,2,3,4], adjacent: [1,3,2,4], example: [3,1,4,2], reverse: [4,3,2,1] };
      permutation = presets[button.dataset.permPreset].slice();
      selected = -1;
      setActive(root, "[data-perm-preset]", button);
      render();
    }, { signal }));

    root.querySelector("[data-adj-step]").addEventListener("click", () => {
      for (let i = 0; i < permutation.length - 1; i += 1) {
        if (permutation[i] > permutation[i + 1]) {
          [permutation[i], permutation[i + 1]] = [permutation[i + 1], permutation[i]];
          selected = -1;
          render();
          root.querySelector("[data-c2-explain]").textContent += " 这一步只消掉一个相邻交叉，所以符号必然翻转。";
          return;
        }
      }
    }, { signal });

    render();
    return () => controller.abort();
  }

  window.extendChapter2Renderer("permutations", {
    interactive(root) {
      if (!root) return;
      const controls = `
        <button type="button" data-perm-preset="id">1234</button>
        <button type="button" data-perm-preset="adjacent">1324</button>
        <button type="button" class="is-active" data-perm-preset="example">3142</button>
        <button type="button" data-perm-preset="reverse">4321</button>
        <button type="button" data-adj-step>消去一个相邻逆序</button>`;
      const stage = `
        <div class="ch2-cinema-stage">
          <svg data-c2-svg viewBox="0 0 1000 580" role="img" aria-label="排列连线图，每个交叉表示一对逆序">
            ${defs("c2")}
            <text x="40" y="52" class="cinema-kicker">排列的符号来自交叉数量</text>
            <text x="40" y="86" class="cinema-title">每一处交叉，就是一对逆序</text>
            ${xsPlaceholder()}
            <g data-c2-wires></g>
            <g data-c2-cards></g>
          </svg>
        </div>`;
      function xsPlaceholder() {
        const xs = [150,380,610,840];
        return `${xs.map((x,i)=>`<text x="${x}" y="190" text-anchor="middle" class="cinema-small">位置 ${i+1}</text>`).join("")}${xs.map((x,i)=>`<g><circle cx="${x}" cy="446" r="24" class="cinema-target"/><text x="${x}" y="454" text-anchor="middle" class="cinema-target-label">${i+1}</text></g>`).join("")}`;
      }
      const after = `
        <div class="ch2-cinema-equation-grid is-compact">
          <div><span>当前排列</span><strong data-perm-text></strong></div><i>→</i>
          <div><span>交叉数 τ</span><strong data-tau></strong></div><i>→</i>
          <div><span>奇偶性</span><strong data-parity></strong></div><i>→</i>
          <div><span>sgn</span><strong data-sgn></strong></div>
        </div>
        <div class="ch2-cinema-two"><div><span>逆序对</span><div class="cinema-chip-row" data-c2-pairs></div></div><div class="ch2-cinema-conclusion"><span data-c2-explain></span></div></div>`;
      root.innerHTML = `<h2>交互实验</h2>${cinemaShell(
        "把排列画成连线，逆序就不再抽象",
        "上方卡片表示排列中的四个数，下方位置固定为 1、2、3、4。线一旦交叉，说明前面的数比后面的数大。",
        "从 3142 开始，连续点击“消去一个相邻逆序”，看一处交叉怎样消失，同时观察符号每次翻转。",
        controls,
        stage,
        after,
      )}`;
      return mountPermutationCinema(root);
    },
  });

})();
