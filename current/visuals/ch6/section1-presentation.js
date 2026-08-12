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
      "这一节采用固定的检查顺序：先确认是否构成映射，再从输入侧检查碰撞、从输出侧检查遗漏，最后判断能否反向恢复。",
      modules,
      "下一节会在集合上加入加法与数乘。映射语言仍会保留：运算本身也是从一个集合到另一个集合的规则。",
    );
  }

  function renderMapSvg(config, selectedInput, selectedOutput) {
    const width = 720;
    const height = 380;
    const panelY = 34;
    const panelHeight = 312;
    const panelWidth = 244;
    const leftPanelX = 24;
    const rightPanelX = width - leftPanelX - panelWidth;
    const leftCenter = leftPanelX + panelWidth / 2;
    const rightCenter = rightPanelX + panelWidth / 2;
    const nodeWidth = 104;
    const nodeHeight = 48;
    const yAt = (index, count) => 134 + (170 / Math.max(1, count - 1)) * index;
    const markerId = `map-arrow-${config.n}-${config.m}-${config.map.join("-")}`.replace(/[^a-zA-Z0-9-]/g, "");

    let svg = `<svg class="ch6-map-workbench" viewBox="0 0 ${width} ${height}" role="img" aria-label="${U().escapeHtml(config.label)}">
      <defs>
        <marker id="${markerId}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path class="ch6-map-arrowhead" d="M0,0 L8,4 L0,8 Z"></path>
        </marker>
      </defs>
      <rect class="ch6-map-panel" x="${leftPanelX}" y="${panelY}" width="${panelWidth}" height="${panelHeight}" rx="18"></rect>
      <rect class="ch6-map-panel" x="${rightPanelX}" y="${panelY}" width="${panelWidth}" height="${panelHeight}" rx="18"></rect>
      <line class="ch6-map-panel-rule" x1="${leftPanelX + 18}" y1="108" x2="${leftPanelX + panelWidth - 18}" y2="108"></line>
      <line class="ch6-map-panel-rule" x1="${rightPanelX + 18}" y1="108" x2="${rightPanelX + panelWidth - 18}" y2="108"></line>
      <text class="ch6-map-set-title" x="${leftPanelX + 22}" y="60">定义域 X</text>
      <text class="ch6-map-set-subtitle" x="${leftPanelX + 22}" y="88">${config.n} 个输入</text>
      <text class="ch6-map-set-title" x="${rightPanelX + 22}" y="60">陪域 Y</text>
      <text class="ch6-map-set-subtitle" x="${rightPanelX + 22}" y="88">${config.m} 个输出</text>
      <text class="ch6-map-guide" x="${width / 2}" y="62">每个输入沿一条箭头到达输出</text>`;

    for (let i = 0; i < config.n; i += 1) {
      const y = yAt(i, config.n);
      const nodeX = leftCenter - nodeWidth / 2;
      svg += `<rect class="ch6-map-node is-input ${i === selectedInput ? "is-selected" : ""}" data-map-input-node="${i}" role="button" tabindex="0" aria-label="选择输入 ${i + 1}" x="${nodeX}" y="${y - nodeHeight / 2}" width="${nodeWidth}" height="${nodeHeight}" rx="8"></rect><text class="ch6-map-node-text" x="${leftCenter}" y="${y}">${i + 1}</text>`;
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
      svg += `<rect class="ch6-map-node is-output ${j === selectedOutput ? "is-selected" : ""} ${hits === 0 ? "is-unhit" : ""}" data-map-output-node="${j}" role="button" tabindex="0" aria-label="把输入 ${selectedInput + 1} 映到 ${String.fromCharCode(97 + j)}" x="${nodeX}" y="${y - nodeHeight / 2}" width="${nodeWidth}" height="${nodeHeight}" rx="8"></rect><text class="ch6-map-node-text" x="${rightCenter}" y="${y}">${String.fromCharCode(97 + j)}</text>`;
      if (hits > 1) svg += `<text class="ch6-map-node-note" x="${rightCenter + nodeWidth / 2 + 12}" y="${y + 4}">${hits} 个原像</text>`;
      if (hits === 0) svg += `<text class="ch6-map-node-note" x="${rightCenter + nodeWidth / 2 + 12}" y="${y + 4}">未命中</text>`;
    }

    return `${svg}</svg>`;
  }

  function renderInteractive(root, section) {
    const config = { label: "自己构造对应关系", n: 3, m: 3, map: [0, 1, 2] };
    let selectedInput = 0;
    let selectedOutput = 0;
    root.innerHTML = `<div data-ch6-map-lab></div>`;
    const host = root.querySelector("[data-ch6-map-lab]");

    function render() {
      const legal = config.map.every((target) => target >= 0 && target < config.m);
      const image = [...new Set(config.map.filter((target) => target >= 0))];
      const injective = legal && new Set(config.map).size === config.n;
      const surjective = legal && Array.from({ length: config.m }, (_, index) => config.map.includes(index)).every(Boolean);
      const bijective = injective && surjective;
      const preimage = config.map.map((target, index) => (target === selectedOutput ? index + 1 : null)).filter(Boolean);
      const reason = !legal
        ? "还有输入没有指定输出。先完成整条规则，再判断单射和满射。"
        : bijective
          ? "每个输入沿箭头到达不同输出，右侧也没有空缺，所以可以唯一倒退。"
          : injective
            ? "每个输入到达不同输出，但陪域中的 d 没有被任何箭头命中。"
            : surjective
              ? "a、b、c 全部被命中，但输入 1 与 4 同时落到 a，发生碰撞。"
              : "既有输入碰撞，也有输出遗漏。";
      const controls = `<div class="ch6-map-builder-copy"><strong>当前选择输入 ${selectedInput + 1}</strong><span>先点左侧输入，再点右侧输出；箭头会立即改接。</span></div>${U().segmented([["identity", "恢复一一对应"], ["collision", "制造一次碰撞"], ["incomplete", "暂时删去一条箭头"]], "map-reset", "")}`;
      const gates = `<div class="ch6-gate-stack">${U().gate("1. 规则完整", "map-legal")}${U().gate("2. 输入不碰撞", "map-injective")}${U().gate("3. 输出无遗漏", "map-surjective")}${U().gate("4. 可以唯一倒退", "map-inverse")}</div>`;
      const readout = `${gates}<div class="ch6-current-story"><span>从图中读结论</span><h4>${bijective ? "这是一一对应" : legal ? injective ? "没有碰撞，但有遗漏" : surjective ? "没有遗漏，但有碰撞" : "同时存在碰撞和遗漏" : "规则还没完成"}</h4><p>${reason}</p><div class="ch6-preimage-reader"><div>${String.fromCharCode(97 + selectedOutput)} 的原像：<strong>${preimage.length ? `{${preimage.join(", ")}}` : "∅"}</strong></div><div>值域：<strong>{${image.map((index) => String.fromCharCode(97 + index)).join(", ")}}</strong></div></div></div>`;

      host.innerHTML = U().labShell({
        title: "亲手接线，判断它是什么映射",
        lead: "四项判定由同一张对应关系共同决定。改变一条对应后，输入侧的碰撞、输出侧的遗漏和能否反向恢复会一起变化。",
        focus: "选中左侧一个输入，再点右侧输出；看一条箭头改变后，哪一道检查随之改变。",
        stage: `<div class="ch6-stage-shell">${renderMapSvg(config, selectedInput, selectedOutput)}</div>`,
        controls,
        readout,
        tasks: U().taskBlock(section),
        className: "ch6-map-lab",
      });

      U().updateGate(host, "map-legal", legal, legal ? "每个输入恰有一个输出" : "有输入尚未指定输出");
      U().updateGate(host, "map-injective", injective, !legal ? "先完成映射规则" : injective ? "不同输入没有碰撞" : "至少两个输入同像");
      U().updateGate(host, "map-surjective", surjective, !legal ? "先完成映射规则" : surjective ? "陪域全部被命中" : "陪域存在空缺");
      U().updateGate(host, "map-inverse", bijective, bijective ? "可唯一倒退" : "必须同时单射且满射");
      const bindSvgAction = (node, action) => {
        node.addEventListener("click", action);
        node.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          action();
        });
      };
      host.querySelectorAll("[data-map-input-node]").forEach((node) => bindSvgAction(node, () => {
        selectedInput = Number(node.dataset.mapInputNode);
        selectedOutput = Math.max(0, config.map[selectedInput]);
        render();
      }));
      host.querySelectorAll("[data-map-output-node]").forEach((node) => bindSvgAction(node, () => {
        selectedOutput = Number(node.dataset.mapOutputNode);
        config.map[selectedInput] = selectedOutput;
        render();
      }));
      host.querySelectorAll("[data-map-reset]").forEach((button) => button.addEventListener("click", () => {
        const mode = button.dataset.mapReset;
        config.map = mode === "identity" ? [0, 1, 2] : mode === "collision" ? [0, 0, 2] : [0, -1, 2];
        selectedInput = mode === "incomplete" ? 1 : 0;
        selectedOutput = Math.max(0, config.map[selectedInput]);
        render();
      }));
    }

    render();
  }

  U().register("sets-maps", renderFormal, renderInteractive);
})();
