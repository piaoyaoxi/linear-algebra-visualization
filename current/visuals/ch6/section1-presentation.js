(() => {
  const U = () => window.Ch6UI;

  function mappingAnatomy() {
    return `
      <div class="ch6-map-anatomy">
        <div class="ch6-map-anatomy-copy"><span>定义域</span><strong>X</strong><p>允许输入的全部元素。</p></div>
        <div class="ch6-map-anatomy-arrow"><b>f</b><span>每个输入恰有一个输出</span></div>
        <div class="ch6-map-anatomy-copy"><span>陪域</span><strong>Y</strong><p>映射声明的输出集合。</p></div>
      </div>
      ${U().texDisplay("f:X\\to Y,\\qquad x\\mapsto f(x)")}
    `;
  }

  function classifyCards() {
    return `<div class="ch6-map-class-grid">
      <article><span>单射</span>${U().miniMap({ xCount: 3, yCount: 4, map: [0, 1, 2], label: "单射但不满射" })}<h4>输入之间不碰撞</h4><p>不同输入得到不同输出；陪域仍可以留下没有被命中的元素。</p></article>
      <article><span>满射</span>${U().miniMap({ xCount: 4, yCount: 3, map: [0, 1, 2, 0], label: "满射但不单射" })}<h4>陪域没有空缺</h4><p>每个输出至少有一个原像；多个输入可以落到同一输出。</p></article>
      <article><span>双射</span>${U().miniMap({ xCount: 3, yCount: 3, map: [1, 2, 0], label: "双射" })}<h4>可以唯一倒退</h4><p>同时没有输入碰撞和输出遗漏，因此每个输出恰有一个原像。</p></article>
    </div>`;
  }

  function renderFormal(root) {
    const modules = [
      U().moduleBlock(
        "01",
        "映射首先是一条完整规则",
        "先看输入与输出，再谈单射、满射或可逆",
        `<div class="ch6-definition-split"><div>${mappingAnatomy()}</div><div class="ch6-reading-list"><div><strong>合法映射</strong><p>每个输入都必须有输出，而且只能有一个输出。</p></div><div><strong>允许重复命中</strong><p>不同输入可以得到同一输出；这只会影响单射，不会破坏映射定义。</p></div><div><strong>定义域与陪域属于映射本身</strong><p>即使对应规则相同，改变陪域也可能改变“是否满射”。</p></div></div></div>`,
      ),
      U().moduleBlock(
        "02",
        "像、原像、值域与陪域要分开",
        "四个词分别回答四个不同问题",
        `<div class="ch6-term-grid"><article><span>像</span>${U().texDisplay("x\\longmapsto f(x)")}<p>从一个输入出发，看它落到哪里。</p></article><article><span>原像</span>${U().texDisplay("f^{-1}(y)=\\{x\\in X:f(x)=y\\}")}<p>从一个输出倒查所有可能输入；它可以为空或含多个元素。</p></article><article><span>值域</span>${U().texDisplay("f(X)=\\{f(x):x\\in X\\}")}<p>实际被命中的输出集合，必定包含于陪域。</p></article><article><span>陪域</span>${U().texDisplay("Y")}<p>定义映射时声明的整个输出集合。</p></article></div>`,
      ),
      U().moduleBlock("03", "单射、满射、双射是三种不同检查", "输入侧看碰撞，输出侧看遗漏", classifyCards()),
      U().moduleBlock(
        "04",
        "复合与逆映射",
        "复合沿箭头继续前进，逆映射要求能够唯一倒退",
        `<div class="ch6-flow-pair"><div class="ch6-flow-card"><span>复合</span><div class="ch6-flow-line"><b>X</b><i>f</i><b>Y</b><i>g</i><b>Z</b></div>${U().texDisplay("(g\\circ f)(x)=g(f(x))")}<p>右边的映射先作用。</p></div><div class="ch6-flow-card"><span>逆映射</span><div class="ch6-flow-line"><b>X</b><i>f</i><b>Y</b><i>f^{-1}</i><b>X</b></div>${U().texDisplay("f^{-1}(f(x))=x")}<p>只有双射才能为每个输出指定唯一的原输入。</p></div></div>`,
      ),
    ];
    root.innerHTML = U().formalShell(
      "从集合到映射：先把对应关系说完整",
      "这一节的重点不是背三个名词，而是建立固定的检查顺序：先确认是否构成映射，再从输入侧检查碰撞、从输出侧检查遗漏，最后判断能否反向恢复。",
      modules,
      "下一节会在集合上加入加法与数乘。映射语言仍会保留：运算本身也是从一个集合到另一个集合的规则。",
    );
  }

  function renderMapSvg(config, selectedOutput) {
    const width = 720;
    const height = 380;
    const panelY = 34;
    const panelHeight = 312;
    const panelWidth = 220;
    const leftPanelX = 38;
    const rightPanelX = width - leftPanelX - panelWidth;
    const leftCenter = leftPanelX + panelWidth / 2;
    const rightCenter = rightPanelX + panelWidth / 2;
    const nodeWidth = 80;
    const nodeHeight = 38;
    const yAt = (index, count) => 124 + (190 / Math.max(1, count - 1)) * index;
    const markerId = `map-arrow-${config.n}-${config.m}-${config.map.join("-")}`.replace(/[^a-zA-Z0-9-]/g, "");

    let svg = `<svg class="ch6-map-workbench" viewBox="0 0 ${width} ${height}" role="img" aria-label="${U().escapeHtml(config.label)}">
      <defs>
        <marker id="${markerId}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path class="ch6-map-arrowhead" d="M0,0 L8,4 L0,8 Z"></path>
        </marker>
      </defs>
      <rect class="ch6-map-panel" x="${leftPanelX}" y="${panelY}" width="${panelWidth}" height="${panelHeight}" rx="18"></rect>
      <rect class="ch6-map-panel" x="${rightPanelX}" y="${panelY}" width="${panelWidth}" height="${panelHeight}" rx="18"></rect>
      <line class="ch6-map-panel-rule" x1="${leftPanelX + 18}" y1="98" x2="${leftPanelX + panelWidth - 18}" y2="98"></line>
      <line class="ch6-map-panel-rule" x1="${rightPanelX + 18}" y1="98" x2="${rightPanelX + panelWidth - 18}" y2="98"></line>
      <text class="ch6-map-set-title" x="${leftPanelX + 22}" y="64">定义域 X</text>
      <text class="ch6-map-set-subtitle" x="${leftPanelX + 22}" y="84">${config.n} 个输入</text>
      <text class="ch6-map-set-title" x="${rightPanelX + 22}" y="64">陪域 Y</text>
      <text class="ch6-map-set-subtitle" x="${rightPanelX + 22}" y="84">${config.m} 个输出</text>
      <text class="ch6-map-guide" x="${width / 2}" y="62">每个输入沿一条箭头到达输出</text>`;

    for (let i = 0; i < config.n; i += 1) {
      const y = yAt(i, config.n);
      const nodeX = leftCenter - nodeWidth / 2;
      svg += `<rect class="ch6-map-node is-input" x="${nodeX}" y="${y - nodeHeight / 2}" width="${nodeWidth}" height="${nodeHeight}" rx="10"></rect><text class="ch6-map-node-text" x="${leftCenter}" y="${y}">${i + 1}</text>`;
      const target = config.map[i];
      if (target >= 0) {
        const targetY = yAt(target, config.m);
        svg += `<path class="ch6-map-curve" marker-end="url(#${markerId})" d="M ${leftCenter + nodeWidth / 2 + 5} ${y} C 310 ${y}, 410 ${targetY}, ${rightCenter - nodeWidth / 2 - 8} ${targetY}"></path>`;
      } else {
        svg += `<path class="ch6-map-curve is-missing" d="M ${leftCenter + nodeWidth / 2 + 5} ${y} C 295 ${y}, 332 ${y}, 360 ${y}"></path><text class="ch6-map-missing-label" x="374" y="${y + 4}">尚未指定</text>`;
      }
    }

    for (let j = 0; j < config.m; j += 1) {
      const y = yAt(j, config.m);
      const hits = config.map.filter((target) => target === j).length;
      const nodeX = rightCenter - nodeWidth / 2;
      svg += `<rect class="ch6-map-node is-output ${j === selectedOutput ? "is-selected" : ""} ${hits === 0 ? "is-unhit" : ""}" x="${nodeX}" y="${y - nodeHeight / 2}" width="${nodeWidth}" height="${nodeHeight}" rx="10"></rect><text class="ch6-map-node-text" x="${rightCenter}" y="${y}">${String.fromCharCode(97 + j)}</text>`;
      if (hits > 1) svg += `<text class="ch6-map-node-note" x="${rightCenter + nodeWidth / 2 + 12}" y="${y + 4}">${hits} 个原像</text>`;
      if (hits === 0) svg += `<text class="ch6-map-node-note" x="${rightCenter + nodeWidth / 2 + 12}" y="${y + 4}">未命中</text>`;
    }

    return `${svg}</svg>`;
  }

  function renderInteractive(root, section) {
    const presets = {
      incomplete: { label: "尚未构成映射", n: 3, m: 3, map: [0, -1, 2] },
      injective: { label: "单射但非满射", n: 3, m: 4, map: [0, 1, 2] },
      surjective: { label: "满射但非单射", n: 4, m: 3, map: [0, 1, 2, 0] },
      bijective: { label: "双射", n: 3, m: 3, map: [1, 2, 0] },
    };
    let mode = "incomplete";
    let selectedOutput = 0;
    root.innerHTML = `<div data-ch6-map-lab></div>`;
    const host = root.querySelector("[data-ch6-map-lab]");

    function render() {
      const config = presets[mode];
      const legal = config.map.every((target) => target >= 0 && target < config.m);
      const image = [...new Set(config.map.filter((target) => target >= 0))];
      const injective = legal && new Set(config.map).size === config.n;
      const surjective = legal && Array.from({ length: config.m }, (_, index) => config.map.includes(index)).every(Boolean);
      const bijective = injective && surjective;
      const preimage = config.map.map((target, index) => (target === selectedOutput ? index + 1 : null)).filter(Boolean);
      const reason = !legal
        ? "输入 2 还没有输出。映射规则尚未完成，后面的单射、满射和逆映射都暂不判定。"
        : bijective
          ? "每个输入沿箭头到达不同输出，右侧也没有空缺，所以可以唯一倒退。"
          : injective
            ? "每个输入到达不同输出，但陪域中的 d 没有被任何箭头命中。"
            : surjective
              ? "a、b、c 全部被命中，但输入 1 与 4 同时落到 a，发生碰撞。"
              : "既有输入碰撞，也有输出遗漏。";
      const controls = U().segmented(
        [["incomplete", "先检查合法性"], ["injective", "单射非满射"], ["surjective", "满射非单射"], ["bijective", "双射与逆映射"]],
        "map-mode",
        mode,
      );
      const gates = `<div class="ch6-gate-stack">${U().gate("1. 规则完整", "map-legal")}${U().gate("2. 输入不碰撞", "map-injective")}${U().gate("3. 输出无遗漏", "map-surjective")}${U().gate("4. 可以唯一倒退", "map-inverse")}</div>`;
      const readout = `${gates}<div class="ch6-current-story"><span>当前情形</span><h4>${config.label}</h4><p>${reason}</p></div><div class="ch6-preimage-reader"><label>从哪个输出向左倒查原像<select data-map-output>${Array.from({ length: config.m }, (_, index) => `<option value="${index}" ${index === selectedOutput ? "selected" : ""}>${String.fromCharCode(97 + index)}</option>`).join("")}</select></label><div>${String.fromCharCode(97 + selectedOutput)} 的原像：<strong>${preimage.length ? `{${preimage.join(", ")}}` : "∅"}</strong></div><div>值域：<strong>{${image.map((index) => String.fromCharCode(97 + index)).join(", ")}}</strong></div></div>`;

      host.innerHTML = U().labShell({
        title: "沿箭头完成四步检查",
        lead: "按钮只负责切换案例。真正要学会的是固定顺序：先完成规则，再看输入碰撞，再看输出空缺，最后判断是否能倒退。",
        focus: "从左侧每个输入开始，沿箭头走到右侧；先看对应关系，不要先看结论卡。",
        stage: `<div class="ch6-stage-shell">${renderMapSvg(config, selectedOutput)}</div>`,
        controls,
        readout,
        tasks: U().taskBlock(section),
        className: "ch6-map-lab",
      });

      U().updateGate(host, "map-legal", legal, legal ? "每个输入恰有一个输出" : "有输入尚未指定输出");
      U().updateGate(host, "map-injective", injective, !legal ? "先完成映射规则" : injective ? "不同输入没有碰撞" : "至少两个输入同像");
      U().updateGate(host, "map-surjective", surjective, !legal ? "先完成映射规则" : surjective ? "陪域全部被命中" : "陪域存在空缺");
      U().updateGate(host, "map-inverse", bijective, bijective ? "可唯一倒退" : "必须同时单射且满射");
      host.querySelectorAll("[data-map-mode]").forEach((button) => button.addEventListener("click", () => {
        mode = button.dataset.mapMode;
        selectedOutput = 0;
        render();
      }));
      host.querySelector("[data-map-output]").addEventListener("change", (event) => {
        selectedOutput = Number(event.target.value);
        render();
      });
    }

    render();
  }

  U().register("sets-maps", renderFormal, renderInteractive);
})();
