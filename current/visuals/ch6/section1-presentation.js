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
      <article><span>单射</span>${U().miniMap({ xCount: 3, yCount: 4, map: [0, 1, 2], label: "单射但不满射" })}<h4>不发生输入碰撞</h4><p>不同输入得到不同输出；陪域仍可以有元素没有被命中。</p></article>
      <article><span>满射</span>${U().miniMap({ xCount: 4, yCount: 3, map: [0, 1, 2, 0], label: "满射但不单射" })}<h4>陪域全部被命中</h4><p>每个输出至少有一个原像；多个输入可以落到同一输出。</p></article>
      <article><span>双射</span>${U().miniMap({ xCount: 3, yCount: 3, map: [1, 2, 0], label: "双射" })}<h4>一一对应</h4><p>同时单射和满射，因此每个输出恰有一个原像。</p></article>
    </div>`;
  }

  function renderFormal(root) {
    const modules = [
      U().moduleBlock("01", "映射首先是一条完整规则", "先看输入与输出，再谈单射、满射或可逆", `<div class="ch6-definition-split"><div>${mappingAnatomy()}</div><div class="ch6-reading-list"><div><strong>合法映射</strong><p>每个输入都必须有输出，而且只能有一个输出。</p></div><div><strong>允许重复命中</strong><p>不同输入可以得到同一输出；这只会影响单射，不会破坏映射定义。</p></div><div><strong>定义域与陪域属于映射本身</strong><p>即使对应规则相同，改变陪域也可能改变“是否满射”。</p></div></div></div>`),
      U().moduleBlock("02", "像、原像、值域与陪域要分开", "四个词分别回答四个不同问题", `<div class="ch6-term-grid"><article><span>像</span>${U().texDisplay("x\\longmapsto f(x)")}<p>从一个输入出发，看它落到哪里。</p></article><article><span>原像</span>${U().texDisplay("f^{-1}(y)=\\{x\\in X:f(x)=y\\}")}<p>从一个输出倒查所有可能输入；它可以为空或含多个元素。</p></article><article><span>值域</span>${U().texDisplay("f(X)=\\{f(x):x\\in X\\}")}<p>实际被命中的输出集合，必定包含于陪域。</p></article><article><span>陪域</span>${U().texDisplay("Y")}<p>定义映射时声明的整个输出集合。</p></article></div>`),
      U().moduleBlock("03", "单射、满射、双射是三种不同检查", "输入侧看碰撞，输出侧看遗漏", classifyCards()),
      U().moduleBlock("04", "复合与逆映射", "复合沿箭头继续前进，逆映射要求能够唯一倒退", `<div class="ch6-flow-pair"><div class="ch6-flow-card"><span>复合</span><div class="ch6-flow-line"><b>X</b><i>f</i><b>Y</b><i>g</i><b>Z</b></div>${U().texDisplay("(g\\circ f)(x)=g(f(x))")}<p>右边的映射先作用。</p></div><div class="ch6-flow-card"><span>逆映射</span><div class="ch6-flow-line"><b>X</b><i>f</i><b>Y</b><i>f^{-1}</i><b>X</b></div>${U().texDisplay("f^{-1}(f(x))=x")}<p>只有双射才能为每个输出指定唯一的原输入。</p></div></div>`),
    ];
    root.innerHTML = U().formalShell("从集合到映射：先把对应关系说完整", "这一节的重点不是背三个名词，而是建立固定的检查顺序：先确认是否构成映射，再从输入侧检查碰撞、从输出侧检查遗漏，最后判断能否反向恢复。", modules, "下一节会在集合上加入加法与数乘。映射语言仍会保留：运算本身也是从一个集合到另一个集合的规则。");
  }

  function renderMapSvg(config, selectedOutput) {
    const width = 640, height = 360, leftX = 150, rightX = 490;
    const yAt = (index, count) => 72 + (216 / Math.max(1, count - 1)) * index;
    let svg = `<svg class="ch6-map-workbench" viewBox="0 0 ${width} ${height}" role="img" aria-label="${U().escapeHtml(config.label)}"><ellipse class="ch6-map-set" cx="${leftX}" cy="180" rx="92" ry="150"></ellipse><ellipse class="ch6-map-set" cx="${rightX}" cy="180" rx="92" ry="150"></ellipse><text class="ch6-map-set-label" x="${leftX}" y="43">定义域 X · ${config.n} 个输入</text><text class="ch6-map-set-label" x="${rightX}" y="43">陪域 Y · ${config.m} 个输出</text>`;
    for (let i = 0; i < config.n; i += 1) {
      const y = yAt(i, config.n); svg += `<circle class="ch6-map-point is-input" cx="${leftX}" cy="${y}" r="17"></circle><text class="ch6-map-point-text" x="${leftX}" y="${y + 5}">${i + 1}</text>`;
      const target = config.map[i];
      if (target >= 0) { const targetY = yAt(target, config.m); svg += `<path class="ch6-map-curve" d="M ${leftX + 19} ${y} C 260 ${y}, 380 ${targetY}, ${rightX - 19} ${targetY}"></path>`; }
      else svg += `<path class="ch6-map-curve is-missing" d="M ${leftX + 19} ${y} C 255 ${y}, 305 ${y}, 340 ${y}"></path><text class="ch6-map-question" x="355" y="${y + 5}">?</text>`;
    }
    for (let j = 0; j < config.m; j += 1) { const y = yAt(j, config.m); const hits = config.map.filter((target) => target === j).length; svg += `<circle class="ch6-map-point is-output ${j === selectedOutput ? "is-selected" : ""} ${hits === 0 ? "is-unhit" : ""}" cx="${rightX}" cy="${y}" r="17"></circle><text class="ch6-map-point-text" x="${rightX}" y="${y + 5}">${String.fromCharCode(97 + j)}</text>${hits > 1 ? `<text class="ch6-map-hit-count" x="${rightX + 28}" y="${y + 5}">×${hits}</text>` : ""}`; }
    return `${svg}</svg>`;
  }

  function renderInteractive(root, section) {
    const presets = { incomplete: { label: "尚未构成映射", n: 3, m: 3, map: [0, -1, 2] }, injective: { label: "单射但非满射", n: 3, m: 4, map: [0, 1, 2] }, surjective: { label: "满射但非单射", n: 4, m: 3, map: [0, 1, 2, 0] }, bijective: { label: "双射", n: 3, m: 3, map: [1, 2, 0] } };
    let mode = "incomplete", selectedOutput = 0;
    root.innerHTML = `<h2>交互实验</h2><div data-ch6-map-lab></div>`;
    const host = root.querySelector("[data-ch6-map-lab]");
    function render() {
      const config = presets[mode], legal = config.map.every((target) => target >= 0 && target < config.m), image = [...new Set(config.map.filter((target) => target >= 0))], injective = legal && new Set(config.map).size === config.n, surjective = legal && Array.from({ length: config.m }, (_, index) => config.map.includes(index)).every(Boolean), bijective = injective && surjective;
      const preimage = config.map.map((target, index) => (target === selectedOutput ? index + 1 : null)).filter(Boolean);
      const reason = !legal ? "输入 2 还没有输出，所以现在不能讨论单射、满射或逆映射。" : bijective ? "没有输入碰撞，也没有输出遗漏；每个输出恰有一个原像。" : injective ? "三个输入分别命中不同输出，但陪域中的 d 没有被命中。" : surjective ? "a、b、c 全部被命中，但输入 1 与 4 同时落到 a，发生碰撞。" : "既有输入碰撞，也有输出遗漏。";
      const controls = U().segmented([["incomplete", "先检查合法性"], ["injective", "单射非满射"], ["surjective", "满射非单射"], ["bijective", "双射与逆映射"]], "map-mode", mode);
      const readout = `<div class="ch6-current-story"><span>当前情形</span><h4>${config.label}</h4><p>${reason}</p></div><div class="ch6-gate-stack">${U().gate("构成映射", "map-legal")}${U().gate("单射", "map-injective")}${U().gate("满射", "map-surjective")}${U().gate("存在逆映射", "map-inverse")}</div><div class="ch6-preimage-reader"><label>查看哪个输出的原像<select data-map-output>${Array.from({ length: config.m }, (_, index) => `<option value="${index}" ${index === selectedOutput ? "selected" : ""}>${String.fromCharCode(97 + index)}</option>`).join("")}</select></label><div>${String.fromCharCode(97 + selectedOutput)} 的原像：<strong>${preimage.length ? `{${preimage.join(", ")}}` : "∅"}</strong></div><div>值域：<strong>{${image.map((index) => String.fromCharCode(97 + index)).join(", ")}}</strong></div></div>`;
      host.innerHTML = U().labShell({ title: "映射检查台", lead: "每次只回答一个问题：规则是否完整？输入是否碰撞？输出是否遗漏？全部通过后，逆映射才出现。", focus: "先从左边逐个输入沿箭头前进，再检查右边是否有碰撞或空缺。", stage: `<div class="ch6-stage-shell">${renderMapSvg(config, selectedOutput)}</div>`, controls, readout, tasks: U().taskBlock(section), className: "ch6-map-lab" });
      U().updateGate(host, "map-legal", legal, legal ? "每个输入恰有一个输出" : "有输入尚未指定输出");
      U().updateGate(host, "map-injective", injective, !legal ? "先完成映射" : injective ? "不同输入没有碰撞" : "至少两个输入同像");
      U().updateGate(host, "map-surjective", surjective, !legal ? "先完成映射" : surjective ? "陪域全部被命中" : "陪域存在空缺");
      U().updateGate(host, "map-inverse", bijective, bijective ? "可唯一倒退" : "必须同时单射且满射");
      host.querySelectorAll("[data-map-mode]").forEach((button) => button.addEventListener("click", () => { mode = button.dataset.mapMode; selectedOutput = 0; render(); }));
      host.querySelector("[data-map-output]").addEventListener("change", (event) => { selectedOutput = Number(event.target.value); render(); });
    }
    render();
  }
  U().register("sets-maps", renderFormal, renderInteractive);
})();
