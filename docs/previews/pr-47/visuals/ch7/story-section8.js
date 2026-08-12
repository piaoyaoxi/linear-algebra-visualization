(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function render(section, lesson) {
    if (!section) return;
    const structures = [
      { name: "两条特征方向", value: "split", size: 2, diagonal: true },
      { name: "J₂(λ)", value: "j2", size: 2, diagonal: false },
      { name: "J₃(λ)", value: "j3", size: 3, diagonal: false },
    ];
    const phases = [
      { value: "problem", label: "看见特征向量不够" },
      { value: "separate", label: "剥离 λI" },
      { value: "chain", label: "沿 N 的链前进" },
    ];
    const state = { structure: 1, phase: "problem", lambda: 2, step: 0 };
    const shell = S.createLab(section, lesson, {
      layout: "jordan-story",
      title: "第二条特征方向找不到时，缺失的信息藏在哪里？",
      description: "Jordan 结构从缺失的第二个特征方向开始：先看剪切，再剥离共同缩放 λI，最后观察 N 的链传递。",
      task: "按顺序切换三个故事步骤。进入链传递后，反复点击“沿 N 前进一步”，直到当前链向量到达 0。",
    });
    shell.toolbar.innerHTML = `${S.buttonGroup("选择结构", structures.map((item, index) => ({ value: index, label: item.name })), state.structure, "structure")}${S.buttonGroup("故事步骤", phases, state.phase, "phase")}<div class="ch7-control-group" data-chain-actions hidden><span class="ch7-control-label">链传递</span><div class="ch7-choice-row"><button type="button" class="ch7-action" data-next>沿 N 前进一步</button><button type="button" class="ch7-action" data-reset>重置</button></div></div>`;
    const binder = S.eventBinder();
    const cleanupRange = S.mountRanges(shell.controls, [
      { label: "共同特征值 λ", key: "lambda", min: -2, max: 3, step: 0.5, digits: 1 },
    ], state, () => draw());

    const polygon = (plane, matrix, role) => {
      const points = [[0, 0], [1, 0], [1, 1], [0, 1]].map((point) => plane.p(S.matVec(matrix, point)).join(",")).join(" ");
      return `<polygon points="${points}" class="ch7-shape ${role}"/>`;
    };

    const chain = (structure) => {
      if (structure.diagonal) {
        return `<text x="420" y="92" text-anchor="middle" class="ch7-svg-title">N=0：两条链都只有一级</text>
          <rect x="164" y="236" width="156" height="76" rx="16" class="ch7-chain-node is-active"/>
          <text x="242" y="281" text-anchor="middle" class="ch7-chain-text">v₁ → 0</text>
          <rect x="520" y="236" width="156" height="76" rx="16" class="ch7-chain-node is-active"/>
          <text x="598" y="281" text-anchor="middle" class="ch7-chain-text">v₂ → 0</text>
          <text x="420" y="380" text-anchor="middle" class="ch7-svg-caption">没有广义特征向量，也没有方向之间的传递。</text>`;
      }
      const labels = Array.from({ length: structure.size }, (_, index) => `v${structure.size - index}`);
      const startX = structure.size === 3 ? 86 : 168;
      const gap = structure.size === 3 ? 184 : 220;
      let content = `<text x="420" y="80" text-anchor="middle" class="ch7-svg-title">每点一次，只保留 N 的作用</text>
        <text x="420" y="112" text-anchor="middle" class="ch7-svg-caption">Nvₖ=vₖ₋₁，Nv₁=0</text>`;
      labels.forEach((label, index) => {
        const x = startX + index * gap;
        const active = index === Math.min(state.step, labels.length - 1);
        const passed = index < state.step;
        content += `<rect x="${x}" y="222" width="132" height="76" rx="16" class="ch7-chain-node ${active ? "is-active" : ""}" opacity="${passed ? 0.42 : 1}"/>
          <text x="${x + 66}" y="267" text-anchor="middle" class="ch7-chain-text">${label}</text>
          ${S.arrowPath(x + 132, 260, x + gap - 18, 260, "is-guide ch7-chain-link")}`;
      });
      const zeroX = startX + labels.length * gap;
      const zeroActive = state.step >= structure.size;
      content += `<rect x="${zeroX - 12}" y="222" width="96" height="76" rx="16" class="ch7-chain-node ${zeroActive ? "is-active" : "is-zero"}"/>
        <text x="${zeroX + 36}" y="267" text-anchor="middle" class="ch7-chain-text">0</text>
        <text x="420" y="380" text-anchor="middle" class="ch7-svg-caption">${zeroActive ? "链已经走完，最大链长就是幂零指数。" : `当前已经作用 N ${state.step} 次。`}</text>`;
      return content;
    };

    const draw = () => {
      const structure = structures[state.structure];
      const actions = shell.toolbar.querySelector("[data-chain-actions]");
      if (actions) actions.hidden = state.phase !== "chain";
      shell.controls.hidden = state.phase === "chain";
      let content = "";
      let tone = "neutral";
      let title = "";
      let text = "";
      let formula = "";
      let facts = [];

      if (state.phase === "problem") {
        const plane = S.createPlane({ x: 72, y: 72, width: 696, height: 450, extent: 3.2 });
        const matrix = structure.diagonal ? [[state.lambda, 0], [0, state.lambda * 0.55]] : [[state.lambda, 1], [0, state.lambda]];
        content += `${plane.grid()}${plane.axes()}${polygon(plane, S.identity2, "is-muted")}${polygon(plane, matrix, structure.diagonal ? "" : "is-secondary")}`;
        if (structure.diagonal) {
          content += `${plane.line([1, 0], "primary", 4.2)}${plane.line([0, 1], "secondary", 4.2)}
            <text x="90" y="104" class="ch7-svg-label is-primary">两条独立特征方向</text>`;
          tone = "pass";
          title = "两条独立特征方向足以组成一组基";
          text = "即使特征值重复，只要特征向量够多，仍然可以对角化。";
          formula = "N=0";
          facts = [["独立特征方向", "2"], ["最大链长", "1"]];
        } else {
          const v2 = [0, 1];
          const Tv2 = S.matVec(matrix, v2);
          const scaled = S.scale(state.lambda, v2);
          const a = plane.p(scaled);
          const b = plane.p(Tv2);
          content += `${plane.line([1, 0], "primary", 4.2)}${plane.vector(v2, "guide")}${plane.vector(Tv2, "secondary")}
            <line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ch7-leak"/>
            <text x="${(a[0] + b[0]) / 2 + 9}" y="${(a[1] + b[1]) / 2 - 10}" class="ch7-svg-label is-secondary">多出 v₁</text>
            <text x="90" y="104" class="ch7-svg-label is-primary">唯一特征方向</text>`;
          tone = "warn";
          title = "第二个方向总会多出沿 v₁ 的剪切";
          text = "它不能成为第二条特征方向，因此需要广义特征向量记录这段偏移。";
          formula = "T(v_2)=\\lambda v_2+v_1";
          facts = [["独立特征方向", "1"], ["需要链长", String(structure.size)]];
        }
      } else if (state.phase === "separate") {
        const left = S.createPlane({ x: 38, y: 112, width: 344, height: 350, extent: 3.1 });
        const right = S.createPlane({ x: 458, y: 112, width: 344, height: 350, extent: 3.1 });
        const lambdaI = [[state.lambda, 0], [0, state.lambda]];
        const N = structure.diagonal ? [[0, 0], [0, 0]] : [[0, 1], [0, 0]];
        content += `<text x="38" y="48" class="ch7-svg-title">共同缩放 λI</text>
          <text x="38" y="74" class="ch7-svg-caption">每个方向都乘同一个 λ</text>
          <text x="458" y="48" class="ch7-svg-title">剩余部分 N=T-λI</text>
          <text x="458" y="74" class="ch7-svg-caption">只保留方向之间的传递</text>
          ${left.grid()}${left.axes()}${polygon(left, S.identity2, "is-muted")}${polygon(left, lambdaI, "")}
          ${right.grid()}${right.axes()}${polygon(right, S.identity2, "is-muted")}${polygon(right, N, structure.diagonal ? "" : "is-secondary")}
          <rect x="286" y="502" width="268" height="42" rx="21" class="ch7-stage-chip"/>
          <text x="420" y="529" text-anchor="middle" class="ch7-svg-title">T = λI + N</text>`;
        tone = structure.diagonal ? "pass" : "warn";
        title = structure.diagonal ? "剥离共同缩放后，右图只剩零算子" : "剥离共同缩放后，只剩沿 v₁ 的剪切";
        text = structure.diagonal ? "没有链耦合，所以每个特征方向独立。" : "λ 改变左图的缩放，却不会改变右图的 N。";
        formula = "N=T-\\lambda I";
        facts = [["λ", S.fmt(state.lambda, 1)], ["N", structure.diagonal ? "0" : "幂零剪切"]];
      } else {
        content = chain(structure);
        const finished = structure.diagonal || state.step >= structure.size;
        tone = finished ? "pass" : "warn";
        title = structure.diagonal ? "没有非平凡 Jordan 链" : finished ? "N 反复作用后沿链到达 0" : "当前向量只向前一级传递";
        text = structure.diagonal ? "每个特征向量一次作用 N 就到 0。" : finished ? "最大 Jordan 链长决定 N 的幂零指数。" : "继续点击，直到当前链向量归零。";
        formula = structure.diagonal ? "N=0" : "Nv_k=v_{k-1},\\quad Nv_1=0";
        facts = [["当前步数", String(state.step)], ["幂零指数", String(structure.diagonal ? 1 : structure.size)]];
      }

      shell.stage.innerHTML = S.svg(content, { width: 840, height: 570, label: "按三个步骤理解 Jordan 剪切、幂零部分与链传递" });
      shell.result.innerHTML = S.conclusion({ tone, title, text, formula, facts });
      const next = shell.toolbar.querySelector("[data-next]");
      if (next) next.disabled = state.phase !== "chain" || structure.diagonal || state.step >= structure.size;
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
      const phase = event.target.closest("[data-phase]");
      if (phase) {
        state.phase = phase.dataset.phase;
        state.step = 0;
        S.setActive(shell.toolbar, "[data-phase]", phase);
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
    return () => {
      cleanupRange();
      binder.cleanup();
    };
  }

  S.register("jordan-form-introduction", render);
})();
