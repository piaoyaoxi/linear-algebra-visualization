(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function render(section, lesson) {
    if (!section) return;
    const structures = [
      { name: "两条特征方向", value: "split", size: 2, split: true },
      { name: "J₂(λ)", value: "j2", size: 2, split: false },
      { name: "J₃(λ)", value: "j3", size: 3, split: false },
    ];
    const modes = [
      { value: "compare", label: "观察对角化失败" },
      { value: "T", label: "看完整 T" },
      { value: "N", label: "只看 N=T-λI" },
    ];
    const state = { structure: 1, mode: "compare", lambda: 2, step: 0 };
    const shell = S.createLab(section, lesson, {
      layout: "jordan-shear",
      title: "只有一条特征方向时，第二个方向发生了什么？",
      description: "Jordan 块保留共同缩放 λI，并用幂零部分 N 记录沿特征方向的额外剪切。单位方形因此变成平行四边形。",
      task: "先观察单位方形的剪切，再切到 N，点击“沿链前进一步”，看广义特征向量依次落入前一级并最终到 0。",
    });
    shell.toolbar.innerHTML = `${S.buttonGroup("结构", structures.map((item, index) => ({ value: index, label: item.name })), state.structure, "structure")}${S.buttonGroup("观察", modes, state.mode, "mode")}<div class="ch7-control-group"><span class="ch7-control-label">链</span><div class="ch7-choice-row"><button type="button" class="ch7-action" data-next>沿链前进一步</button><button type="button" class="ch7-action" data-reset>重置</button></div></div>`;
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "共同特征值 λ", key: "lambda", min: -2, max: 3, step: 0.5, digits: 1 },
    ], state, () => draw());
    const binder = S.eventBinder();

    const chainSvg = (structure) => {
      const labels = structure.split ? ["v₁", "v₂"] : Array.from({ length: structure.size }, (_, index) => `v${structure.size - index}`);
      const x = 790;
      const y0 = 142;
      const gap = 92;
      let content = `<text x="${x}" y="92" class="ch7-svg-title">N 的链</text>`;
      labels.forEach((label, index) => {
        const y = y0 + index * gap;
        const active = state.mode === "N" && index === Math.min(state.step, labels.length - 1);
        content += `<rect x="${x}" y="${y}" width="112" height="52" rx="10" class="ch7-chain-node ${active ? "is-active" : ""}"/>
          <text x="${x + 56}" y="${y + 32}" text-anchor="middle" class="ch7-chain-text">${structure.split ? `N(${label})=0` : label}</text>`;
        if (!structure.split) content += `<path d="M${x + 56} ${y + 52}V${y + 80}" class="ch7-chain-arrow"/>`;
      });
      if (!structure.split) {
        const zy = y0 + labels.length * gap;
        content += `<rect x="${x + 17}" y="${zy}" width="78" height="52" rx="10" class="ch7-chain-node is-zero"/><text x="${x + 56}" y="${zy + 32}" text-anchor="middle" class="ch7-chain-text">0</text>`;
      }
      return content;
    };

    const draw = () => {
      const structure = structures[state.structure];
      const plane = S.createPlane({ x: 45, y: 70, width: 650, height: 455, extent: 3.1 });
      const v1 = [1, 0];
      const v2 = [0, 1];
      const matrix = structure.split
        ? [[state.mode === "N" ? 0 : state.lambda, 0], [0, state.mode === "N" ? 0 : state.lambda]]
        : state.mode === "N" ? [[0, 1], [0, 0]] : [[state.lambda, 1], [0, state.lambda]];
      const Tv1 = S.matVec(matrix, v1);
      const Tv2 = S.matVec(matrix, v2);
      const original = [[0, 0], v1, S.add(v1, v2), v2].map((point) => plane.p(point).join(",")).join(" ");
      const image = [[0, 0], Tv1, S.add(Tv1, Tv2), Tv2].map((point) => plane.p(point).join(",")).join(" ");
      let content = `${plane.grid()}${plane.axes()}
        <polygon points="${original}" class="ch7-shape is-muted"/>
        <polygon points="${image}" class="ch7-shape ${structure.split ? "" : "is-secondary"}"/>
        ${plane.vector(v1, "muted", "v₁")}${plane.vector(v2, "muted", "v₂")}
        ${S.norm(Tv1) > 1e-8 ? plane.vector(Tv1, "primary", state.mode === "N" ? "N(v₁)" : "T(v₁)") : plane.cross([0, 0], "primary", 7, "N(v₁)=0")}
        ${S.norm(Tv2) > 1e-8 ? plane.vector(Tv2, structure.split ? "primary" : "secondary", state.mode === "N" ? "N(v₂)=v₁" : "T(v₂)") : ""}
        ${chainSvg(structure)}
        <text x="65" y="555" class="ch7-svg-caption">灰色：原单位方形　青绿或珊瑚：作用后的形状</text>`;
      if (!structure.split && state.mode !== "N") {
        const scaled = S.scale(state.lambda, v2);
        const a = plane.p(scaled);
        const b = plane.p(Tv2);
        content += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ch7-leak"/>
          <text x="${(a[0] + b[0]) / 2 + 9}" y="${(a[1] + b[1]) / 2 - 9}" class="ch7-svg-label is-secondary">额外的 v₁</text>`;
      }
      if (structure.value === "j3") content += `<text x="790" y="520" class="ch7-svg-caption">平面展示链的前两级，右侧给出完整长度 3。</text>`;

      let tone = "neutral";
      let title = "";
      let text = "";
      let formula = "";
      let facts = [];
      if (structure.split) {
        tone = "pass";
        title = "两条独立特征方向没有链耦合";
        text = "相同特征值也可能已有足够多的特征向量，此时仍能对角化。";
        formula = "T=\\lambda I,\\quad N=0";
        facts = [["独立特征方向", "2"], ["最大链长", "1"]];
      } else if (state.mode === "compare") {
        tone = "warn";
        title = "共同缩放之外还多出一段沿 v₁ 的剪切";
        text = "这段剪切让第二个方向不能成为特征方向，单位方形也因此变斜。";
        formula = "T(v_2)=\\lambda v_2+v_1";
        facts = [["独立特征方向", "1"], ["链长", String(structure.size)]];
      } else if (state.mode === "T") {
        title = "完整 T 同时包含缩放与链方向剪切";
        text = "当 λ≠0 时，反复作用 T 通常不会把向量送到 0。";
        formula = "T=\\lambda I+N";
        facts = [["λ", S.fmt(state.lambda, 1)], ["N", "超对角线剪切"]];
      } else {
        const finished = state.step >= structure.size;
        tone = finished ? "pass" : "warn";
        title = finished ? "N 沿链走完，所有链向量最终归零" : "剥离共同缩放后，只剩向前一级的传递";
        text = finished ? "最大 Jordan 链长决定幂零指数。" : "继续沿链前进，观察当前向量如何落入前一级。";
        formula = "Nv_k=v_{k-1},\\quad Nv_1=0";
        facts = [["当前步", String(state.step)], ["幂零指数", String(structure.size)]];
      }
      shell.stage.innerHTML = S.svg(content, { width: 980, height: 585, label: "单位方形的 Jordan 剪切与幂零链传递" });
      shell.result.innerHTML = S.conclusion({ tone, title, text, formula, facts });
      const next = shell.toolbar.querySelector("[data-next]");
      if (next) next.disabled = state.mode !== "N" || structure.split || state.step >= structure.size;
    };

    binder.on(shell.toolbar, "click", (event) => {
      const structure = event.target.closest("[data-structure]");
      if (structure) {
        state.structure = Number(structure.dataset.structure);
        state.step = 0;
        S.setActive(shell.toolbar, "[data-structure]", structure);
        draw();
        return;
      }
      const mode = event.target.closest("[data-mode]");
      if (mode) {
        state.mode = mode.dataset.mode;
        state.step = 0;
        S.setActive(shell.toolbar, "[data-mode]", mode);
        draw();
        return;
      }
      if (event.target.closest("[data-next]")) {
        state.step = Math.min(structures[state.structure].size, state.step + 1);
        draw();
      }
      if (event.target.closest("[data-reset]")) {
        state.step = 0;
        draw();
      }
    });

    draw();
    return () => { cleanupRange(); binder.cleanup(); };
  }

  S.register("jordan-form-introduction", render);
})();
