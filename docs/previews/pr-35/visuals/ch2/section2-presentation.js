(() => {
  const { M, tex, display, aEntry, productTermHtml, formalShell, module, proofSteps, misconception, taskBox } = window.Ch2PresentationUtils;
  // ---------- §2 ----------
  function mountPermutationLab(root) {
    const controller = new AbortController();
    const { signal } = controller;
    let permutation = [3, 1, 4, 2];
    let selected = -1;
    let scannerIndex = 0;
    const pairOrder = M().allPositionPairs(4);
    const list = root.querySelector("[data-perm-list]");

    function drawWires() {
      const svg = root.querySelector("[data-wires]");
      const xs = [42, 116, 190, 264];
      svg.innerHTML = `
        ${xs.map((x, index) => `<text x="${x}" y="18" text-anchor="middle">${index + 1}</text>`).join("")}
        ${xs.map((x, index) => `<text x="${x}" y="146" text-anchor="middle">${index + 1}</text>`).join("")}
        ${permutation.map((value, index) => `<path d="M ${xs[index]} 28 C ${xs[index]} 70, ${xs[value - 1]} 82, ${xs[value - 1]} 132" data-wire-index="${index}" />`).join("")}
      `;
    }

    function renderScanner() {
      const pair = pairOrder[scannerIndex % pairOrder.length];
      const inversion = permutation[pair.i] > permutation[pair.j];
      root.querySelector("[data-scan-pair]").textContent = `位置 ${pair.i + 1} 与 ${pair.j + 1}：${permutation[pair.i]}、${permutation[pair.j]}`;
      const result = root.querySelector("[data-scan-result]");
      result.textContent = inversion ? "构成逆序" : "顺序正常";
      result.className = inversion ? "is-negative" : "is-positive";
      list.querySelectorAll("[data-index]").forEach((button) => {
        const index = Number(button.dataset.index);
        button.classList.toggle("is-scanning", index === pair.i || index === pair.j);
      });
    }

    function render({ pulse = false } = {}) {
      list.innerHTML = permutation.map((value, index) => `
        <button type="button" class="ch2-perm-item${pulse ? " is-swap" : ""}${selected === index ? " is-selected" : ""}" draggable="true" data-index="${index}" aria-label="位置 ${index + 1} 的数 ${value}">${value}</button>
      `).join("");
      const inversions = M().inversionPairs(permutation);
      const sign = M().signFromPerm(permutation);
      root.querySelector("[data-tau]").textContent = String(inversions.length);
      root.querySelector("[data-parity]").textContent = inversions.length % 2 === 0 ? "偶排列" : "奇排列";
      root.querySelector("[data-sgn]").textContent = sign > 0 ? "+1" : "−1";
      root.querySelector("[data-perm-text]").textContent = permutation.join(" ");
      root.querySelector("[data-inv-list]").innerHTML = inversions.length
        ? inversions.map(({ a, b }) => `<span>(${a},${b})</span>`).join("")
        : "<span>无逆序对</span>";
      drawWires();

      let dragIndex = -1;
      list.querySelectorAll("[data-index]").forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.index);
          if (selected < 0) {
            selected = index;
            render();
            return;
          }
          if (selected === index) {
            selected = -1;
            render();
            return;
          }
          [permutation[selected], permutation[index]] = [permutation[index], permutation[selected]];
          selected = -1;
          scannerIndex = 0;
          render({ pulse: true });
        }, { signal });
        button.addEventListener("dragstart", () => { dragIndex = Number(button.dataset.index); }, { signal });
        button.addEventListener("dragover", (event) => event.preventDefault(), { signal });
        button.addEventListener("drop", () => {
          const target = Number(button.dataset.index);
          if (dragIndex < 0 || target === dragIndex) return;
          const next = permutation.slice();
          const [moved] = next.splice(dragIndex, 1);
          next.splice(target, 0, moved);
          permutation = next;
          selected = -1;
          scannerIndex = 0;
          render({ pulse: true });
        }, { signal });
      });
      renderScanner();
      M().pulseClass(root.querySelector("[data-tau-card]"));
    }

    root.querySelectorAll("[data-perm-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        const presets = {
          id: [1, 2, 3, 4],
          adjacent: [1, 3, 2, 4],
          reverse: [4, 3, 2, 1],
          cycle: [2, 3, 4, 1],
          example: [3, 1, 4, 2],
        };
        permutation = presets[button.dataset.permPreset].slice();
        selected = -1;
        scannerIndex = 0;
        render({ pulse: true });
      }, { signal });
    });

    root.querySelector("[data-scan-next]").addEventListener("click", () => {
      scannerIndex = (scannerIndex + 1) % pairOrder.length;
      renderScanner();
    }, { signal });

    root.querySelector("[data-adj-step]").addEventListener("click", () => {
      for (let index = 0; index < permutation.length - 1; index += 1) {
        if (permutation[index] > permutation[index + 1]) {
          [permutation[index], permutation[index + 1]] = [permutation[index + 1], permutation[index]];
          selected = -1;
          scannerIndex = 0;
          render({ pulse: true });
          return;
        }
      }
      root.querySelector("[data-scan-result]").textContent = "已经还原为恒等排列";
    }, { signal });

    render();
    return () => controller.abort();
  }

  defineChapter2Renderer("permutations", {
    formal(formal) {
      if (!formal) return;
      formal.innerHTML = formalShell(
        "符号来自排列的奇偶性",
        "行列式的乘积项都采用每行每列各一次的取法。列指标形成排列，而排列中的交叉数量决定正负号。",
        module("01", "逆序数与排列符号", "先逐对比较，再压缩为一个符号。", `
          <div class="ch2-def-stack">
            <article class="ch2-def"><span class="kicker">逆序</span><strong>${tex("i<j,\\;\\sigma(i)>\\sigma(j)")}</strong><p>位置靠前的数反而更大时，这一对形成逆序。</p></article>
            <article class="ch2-def"><span class="kicker">逆序数</span><strong>${tex("\\tau(\\sigma)")}</strong><p>全部逆序对的数量；连线图中的每个交叉对应一个逆序。</p></article>
            <article class="ch2-def"><span class="kicker">符号</span><strong>${tex("\\operatorname{sgn}(\\sigma)=(-1)^{\\tau(\\sigma)}")}</strong><p>偶排列取 +1，奇排列取 −1。</p></article>
          </div>
        `) + module("02", "相邻交换为什么翻转奇偶性", "只改变一对相邻元素的相对顺序。", proofSteps([
          "相邻元素之外的每个数，与这两个元素形成的逆序总数保持不变。",
          "被交换的两个相邻元素彼此之间的顺序恰好翻转一次。",
          "因此逆序数改变一个奇数，排列奇偶性翻转。",
          "任意对换可以分解为奇数次相邻交换，所以任意对换也翻转奇偶性。",
        ]) + misconception([
          "逆序数统计所有位置对，不等于最大元素或元素之和。",
          "符号只依赖逆序数的奇偶，具体逆序数仍用于解释与步进。",
        ])),
      );
    },
    interactive(root) {
      if (!root) return;
      root.innerHTML = `
        <h2>交互实验</h2>
        <div class="ch2-lab">
          <div class="ch2-lab-head"><h3>排列奇偶实验室</h3><p>点击两张卡片完成一次对换，或拖动重排。扫描器逐对检查，连线图把逆序显示为交叉。</p></div>
          <div class="ch2-task"><strong>观察任务</strong><span>从 3142 出发，每次做一个相邻交换，直到还原 1234；比较交换步数与初始逆序数。</span></div>
          <div class="ch2-lab-grid">
            <div class="ch2-side">
              <div class="ch2-note">当前排列：<strong data-perm-text></strong></div>
              <div class="ch2-perm-row" data-perm-list></div>
              <svg class="ch2-wires" data-wires viewBox="0 0 306 160" role="img" aria-label="排列连线图，交叉表示逆序"></svg>
              <div class="ch2-presets">
                <button type="button" data-perm-preset="id">恒等 1234</button>
                <button type="button" data-perm-preset="adjacent">一次相邻交换</button>
                <button type="button" data-perm-preset="reverse">完全逆序</button>
                <button type="button" data-perm-preset="cycle">循环 2341</button>
                <button type="button" data-perm-preset="example">例题 3142</button>
              </div>
            </div>
            <div class="ch2-side">
              <div class="ch2-meter">
                <div class="ch2-meter-card" data-tau-card><strong>τ(σ)</strong><span data-tau></span></div>
                <div class="ch2-meter-card"><strong>奇偶</strong><span data-parity></span></div>
                <div class="ch2-meter-card"><strong>sgn</strong><span data-sgn></span></div>
              </div>
              <div class="ch2-note"><strong>全部逆序对</strong><div class="ch2-inversion-list" data-inv-list></div></div>
              <div class="ch2-note"><strong data-scan-pair></strong><br /><span data-scan-result></span></div>
              <div class="ch2-toolbar">
                <button type="button" data-scan-next>扫描下一对</button>
                <button type="button" data-adj-step>相邻交换一步</button>
              </div>
            </div>
          </div>
        </div>`;
      return mountPermutationLab(root);
    },
  });

})();
