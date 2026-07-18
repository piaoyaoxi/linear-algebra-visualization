(() => {
  const U = () => window.Ch6UI;

  function spanProgression() {
    const config = { ...U().plane, width: 260, height: 170, origin: [130, 95], scale: 48 };
    const grid = U().planeGrid(config);
    const one = `<svg class="ch6-mini-plane" viewBox="0 0 260 170" role="img" aria-label="一个非零向量张成一条直线">${grid}${U().line([1, 0.45], "is-u", "span", [0, 0], config)}${U().softArrow([0, 0], [1, 0.45], "is-u", "v₁", config)}</svg>`;
    const redundant = `<svg class="ch6-mini-plane" viewBox="0 0 260 170" role="img" aria-label="两个共线向量仍只张成一条直线">${grid}${U().line([1, 0.45], "is-u", "span", [0, 0], config)}${U().softArrow([0, 0], [1, 0.45], "is-u", "v₁", config)}${U().softArrow([0, 0], [1.8, 0.81], "is-w", "v₂", config)}</svg>`;
    const plane = `<svg class="ch6-mini-plane" viewBox="0 0 260 170" role="img" aria-label="两个不共线向量张成整个平面">${grid}<rect class="ch6-mini-plane-fill" x="10" y="10" width="240" height="150" rx="16"></rect>${U().softArrow([0, 0], [1, 0.25], "is-u", "v₁", config)}${U().softArrow([0, 0], [-0.2, 1.05], "is-w", "v₂", config)}</svg>`;
    return `<div class="ch6-span-story"><article>${one}<span>一个非零方向</span><h4>张成一条直线</h4></article><b>→</b><article>${redundant}<span>加入共线向量</span><h4>没有增加新方向</h4></article><b>→</b><article>${plane}<span>加入独立方向</span><h4>张成整个平面</h4></article></div>`;
  }

  function renderFormal(root) {
    const modules = [
      U().moduleBlock("01", "张成回答“够不够”", "所有线性组合能到达多大的范围", `${spanProgression()}<div class="ch6-formula-band">${U().texDisplay("\\operatorname{span}\\{v_1,\\ldots,v_k\\}=\\{a_1v_1+\\cdots+a_kv_k\\}")}<p>张成空间自动包含零向量，并且对线性组合封闭。</p></div>`),
      U().moduleBlock("02", "线性无关回答“有没有冗余”", "零向量能否由非零系数组合出来", `<div class="ch6-independence-compare"><article><span>线性无关</span>${U().texDisplay("a_1v_1+\\cdots+a_kv_k=0\\Rightarrow a_1=\\cdots=a_k=0")}<p>每个方向都提供不可替代的信息。</p></article><article><span>线性相关</span>${U().texDisplay("\\exists(a_1,\\ldots,a_k)\\neq0,\\quad a_1v_1+\\cdots+a_kv_k=0")}<p>至少有一个向量可由其余向量线性表示。</p></article></div>`),
      U().moduleBlock("03", "基同时满足生成与无关", "既覆盖整个空间，又没有多余方向", `<div class="ch6-basis-equation"><div class="ch6-basis-condition"><span>生成</span><strong>够用</strong><p>每个向量都能写成基向量的线性组合。</p></div><b>+</b><div class="ch6-basis-condition"><span>无关</span><strong>不重复</strong><p>同一个向量不会有两套不同系数。</p></div><b>=</b><div class="ch6-basis-condition is-result"><span>基</span><strong>唯一坐标</strong><p>空间获得一套稳定的编码系统。</p></div></div>`),
      U().moduleBlock("04", "维数与坐标", "维数属于空间，坐标属于“向量 + 有序基”", `<div class="ch6-coordinate-layout"><div>${U().formulaCard("有序基", "B=(b_1,\\ldots,b_n)", "顺序决定坐标分量的顺序。")}${U().formulaCard("坐标定义", "v=x_1b_1+\\cdots+x_nb_n,\\qquad [v]_B=\\begin{bmatrix}x_1\\\\\\vdots\\\\x_n\\end{bmatrix}", "基保证系数存在且唯一。")}</div><div class="ch6-coordinate-example"><span>同一个向量</span>${U().texDisplay("v=2b_1+3b_2")}<div class="ch6-coordinate-swap"><article><small>基 B=(b₁,b₂)</small><strong>(2,3)ᵀ</strong></article><b>交换顺序</b><article><small>基 B'=(b₂,b₁)</small><strong>(3,2)ᵀ</strong></article></div><p>向量本身没有移动，只有编码顺序改变。</p></div></div>`),
      U().moduleBlock("05", "从生成组提取基", "保留能带来新方向的向量，删去冗余", `<div class="ch6-extraction-steps"><div><span>1</span><strong>依次加入向量</strong><p>观察新向量是否进入已有张成空间。</p></div><div><span>2</span><strong>若没有增加维数</strong><p>该向量可由已有向量组合，删去不影响张成。</p></div><div><span>3</span><strong>停止时得到基</strong><p>剩下的向量既生成原空间，又线性无关。</p></div></div>`),
    ];
    root.innerHTML = U().formalShell("基是空间的最小骨架，坐标是相对骨架的编码", "这一节要同时抓住两个问题：张成决定范围，线性无关决定冗余。基把二者合在一起，因此每个向量才会拥有唯一坐标。", modules, "下一节固定同一个向量，改变这套骨架，观察坐标如何随之变化。");
  }

  function renderInteractive(root, section) {
    const presets = {
      line: { label: "只有一个方向", vectors: [[1.25, 0.45], [2, 0.72], [-0.8, -0.29]], active: [true, false, false] },
      redundant: { label: "能生成平面，但有冗余", vectors: [[1.2, 0.2], [-0.25, 1.1], [0.95, 1.3]], active: [true, true, true] },
      basis: { label: "一组平面基", vectors: [[1.2, 0.2], [-0.25, 1.1], [0.95, 1.3]], active: [true, true, false] },
      dependent: { label: "多个向量仍只生成直线", vectors: [[1, 0.5], [2, 1], [-1.2, -0.6]], active: [true, true, true] },
    };
    let phase = "structure";
    let mode = "redundant";
    let active = presets[mode].active.slice();
    let order = [0, 1];
    let target = [1.4, 1];
    root.innerHTML = `<div data-ch6-basis-lab></div>`;
    const host = root.querySelector("[data-ch6-basis-lab]");

    function rank(vectors) {
      const nonzero = vectors.filter((vector) => U().norm(vector) > 1e-8);
      if (!nonzero.length) return 0;
      for (let i = 0; i < nonzero.length; i += 1) {
        for (let j = i + 1; j < nonzero.length; j += 1) {
          if (Math.abs(U().cross(nonzero[i], nonzero[j])) > 1e-8) return 2;
        }
      }
      return 1;
    }

    function independentPair(vectors, ids) {
      for (let i = 0; i < ids.length; i += 1) {
        for (let j = i + 1; j < ids.length; j += 1) {
          if (Math.abs(U().cross(vectors[ids[i]], vectors[ids[j]])) > 1e-8) return [ids[i], ids[j]];
        }
      }
      return null;
    }

    function render() {
      const preset = presets[mode];
      const vectors = preset.vectors;
      const ids = active.map((value, index) => (value ? index : -1)).filter((index) => index >= 0);
      const current = ids.map((index) => vectors[index]);
      const dimension = rank(current);
      const pair = independentPair(vectors, ids);
      if (pair && (!order.every((index) => ids.includes(index)) || Math.abs(U().cross(vectors[order[0]], vectors[order[1]])) < 1e-8)) order = pair.slice();
      const independent = ids.length === dimension;
      const spansPlane = dimension === 2;
      const basis = spansPlane && independent;
      const coordinates = pair ? U().solve(vectors[order[0]], vectors[order[1]], target) : null;

      if (phase === "coordinates" && !pair) {
        mode = "basis";
        active = presets.basis.active.slice();
        order = [0, 1];
        render();
        return;
      }

      let inner = U().planeGrid();
      let controls = U().segmented([["structure", "① 看张成与冗余"], ["coordinates", "② 用基读取坐标"]], "basis-phase", phase);
      let readout;
      let focus;
      let lead;

      if (phase === "structure") {
        if (spansPlane) inner += `<rect class="ch6-plane-fill" x="14" y="14" width="612" height="332" rx="20"></rect><text class="ch6-plane-label is-u" x="535" y="42">当前张成整个 ℝ²</text>`;
        if (dimension === 1 && current.length) inner += U().line(current[0], "is-u", "当前只张成一条直线");
        ids.forEach((index) => {
          inner += U().softArrow([0, 0], vectors[index], `is-g${index + 1}`, `g${index + 1}`);
        });
        controls += `${U().segmented([["line", "一个方向"], ["redundant", "冗余生成组"], ["basis", "删到一组基"], ["dependent", "共线冗余"]], "basis-mode", mode)}<div class="ch6-vector-switches">${vectors.map((vector, index) => `<label><input type="checkbox" data-generator="${index}" ${active[index] ? "checked" : ""}><span>g${index + 1}=${U().formatVector(vector)}</span></label>`).join("")}</div>`;
        const story = basis
          ? "当前恰好保留两条独立方向：背景覆盖整个平面，而且没有多余箭头。"
          : spansPlane
            ? "背景已经覆盖整个平面，但激活向量个数超过维数；至少有一个箭头没有扩大张成范围。"
            : dimension === 1
              ? "所有激活向量都落在同一条直线上，只提供一个独立方向。"
              : "当前没有非零方向。";
        readout = `<div class="ch6-gate-stack">${U().gate("张成整个平面", "basis-span")}${U().gate("激活向量线性无关", "basis-independent")}${U().gate("构成 ℝ² 的一组基", "basis-final")}</div><div class="ch6-current-story"><span>当前状态</span><h4>${preset.label}</h4><p>${story}</p></div><div class="ch6-conclusion-box ${basis ? "is-ok" : "is-warn"}"><span>现在该做什么</span><strong>${basis ? "已经得到一组基，可以进入坐标阶段" : spansPlane ? "关闭一个不增加范围的冗余向量" : "加入一条不共线的新方向"}</strong></div><div class="ch6-phase-note"><span>读图规则</span><p>背景表示张成范围；箭头数量表示正在使用的生成元。范围不变而箭头变多，就出现了冗余。</p></div>`;
        lead = "先只回答两个问题：这些箭头能到达多大范围？其中有没有不增加范围的冗余箭头？";
        focus = "先看浅色背景是直线还是整个平面，再数一数有多少个激活箭头。";
      } else {
        const firstVector = vectors[order[0]];
        const secondVector = vectors[order[1]];
        inner += U().softArrow([0, 0], firstVector, "is-u", "b₁");
        inner += U().softArrow([0, 0], secondVector, "is-w", "b₂");
        inner += U().softArrow([0, 0], target, "is-target", "v");
        if (coordinates) {
          const firstPart = U().scale(firstVector, coordinates[0]);
          inner += U().softArrow([0, 0], firstPart, "is-u-soft", `${U().formatNumber(coordinates[0])}b₁`);
          inner += U().softArrow(firstPart, target, "is-w-soft", `${U().formatNumber(coordinates[1])}b₂`);
        }
        controls += `<button type="button" class="ch6-secondary-button" data-swap-basis>交换 b₁、b₂ 的顺序</button><div class="ch6-coordinate-sliders"><label>目标向量横坐标 <output data-target-x>${U().formatNumber(target[0], 1)}</output><input type="range" min="-2.2" max="2.2" step="0.1" value="${target[0]}" data-target-x-input></label><label>目标向量纵坐标 <output data-target-y>${U().formatNumber(target[1], 1)}</output><input type="range" min="-1.8" max="1.8" step="0.1" value="${target[1]}" data-target-y-input></label></div>`;
        readout = `<div class="ch6-current-story"><span>当前任务</span><h4>用有序基读取同一个 v</h4><p>黑色箭头是目标向量；两条浅色折线说明它怎样由 b₁、b₂ 合成。</p></div><div class="ch6-coordinate-reader"><span>有序基</span><strong>(g${order[0] + 1}, g${order[1] + 1})</strong><span>目标向量</span><strong>${U().formatVector(target)}</strong><span>坐标 [v]ᵦ</span><strong>${coordinates ? U().formatVector(coordinates) : "—"}</strong></div><div class="ch6-formula-readout">${coordinates ? U().texDisplay(`v=${U().formatNumber(coordinates[0])}b_1+${U().formatNumber(coordinates[1])}b_2`) : ""}</div><div class="ch6-conclusion-box is-ok"><span>交换顺序以后</span><strong>向量 v 不动，但两个坐标分量交换位置</strong></div>`;
        lead = "这一阶段不再判断是否成基，而是使用已经选好的有序基，把黑色目标向量分解成两个基方向。";
        focus = "盯住黑色 v 的起点和终点；交换基顺序时，它们必须保持不动。";
      }

      host.innerHTML = U().labShell({
        title: phase === "structure" ? "第一阶段：从生成组删到基" : "第二阶段：用有序基读取坐标",
        lead,
        focus,
        stage: `<div class="ch6-stage-shell">${U().planeSvg(inner, phase === "structure" ? preset.label : "有序基下的坐标分解")}</div>`,
        controls,
        readout,
        tasks: U().taskBlock(section),
        className: `ch6-basis-lab is-${phase}`,
      });

      if (phase === "structure") {
        U().updateGate(host, "basis-span", spansPlane, spansPlane ? "包含两个独立方向" : "还没有第二个独立方向");
        U().updateGate(host, "basis-independent", independent, independent ? "没有冗余" : "存在冗余或零向量");
        U().updateGate(host, "basis-final", basis, basis ? "生成且无关" : "两项条件未同时成立");
      }

      host.querySelectorAll("[data-basis-phase]").forEach((button) => button.addEventListener("click", () => {
        phase = button.dataset.basisPhase;
        render();
      }));
      host.querySelectorAll("[data-basis-mode]").forEach((button) => button.addEventListener("click", () => {
        mode = button.dataset.basisMode;
        active = presets[mode].active.slice();
        order = [0, 1];
        render();
      }));
      host.querySelectorAll("[data-generator]").forEach((checkbox) => checkbox.addEventListener("change", () => {
        active[Number(checkbox.dataset.generator)] = checkbox.checked;
        render();
      }));
      host.querySelector("[data-swap-basis]")?.addEventListener("click", () => {
        order = [order[1], order[0]];
        render();
      });
      host.querySelector("[data-target-x-input]")?.addEventListener("input", (event) => {
        target[0] = Number(event.target.value);
        render();
      });
      host.querySelector("[data-target-y-input]")?.addEventListener("input", (event) => {
        target[1] = Number(event.target.value);
        render();
      });
    }
    render();
  }

  U().register("basis-coordinates", renderFormal, renderInteractive);
})();
