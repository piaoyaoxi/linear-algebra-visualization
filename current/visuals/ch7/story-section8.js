(() => {
  const S = window.Ch7Story;
  if (!S) return;

  function render(section, lesson) {
    if (!section) return;
    const structures = [
      { name: "两条独立特征线", value: "split", size: 2, split: true },
      { name: "J₂(λ)", value: "j2", size: 2, split: false },
      { name: "J₃(λ)", value: "j3", size: 3, split: false },
    ];
    const modes = [
      { value: "compare", label: "先看为何不能对角化" },
      { value: "T", label: "看完整 T=λI+N" },
      { value: "N", label: "剥离缩放，只看 N" },
    ];
    const state = { structure: 1, mode: "compare", lambda: 2, step: 0 };
    const shell = S.createStory(section, lesson, {
      title: "只有一条特征线时，缺失的信息藏在一段剪切尾巴里",
      description: "先比较可对角化与 Jordan 情形，再把纯缩放 λI 剥离。剩下的 N 会把广义特征方向逐级推向前一个链向量。",
    });
    shell.toolbar.innerHTML = `${S.buttons(structures.map((item, index) => ({ value: index, label: item.name })), state.structure, "structure")}${S.buttons(modes, state.mode, "mode")}<button type="button" class="ch7-story-action" data-next-step>沿链走一步</button><button type="button" class="ch7-story-action" data-reset>重置</button>`;
    const cleanupRange = S.mountRanges(shell.controls, [{ label: "特征值 λ", key: "lambda", min: -2, max: 3, step: 0.5, digits: 1 }], state, () => draw());
    const binder = S.eventBinder();

    const drawPanel = (plane, type, label) => {
      let content = `${plane.grid()}${plane.axes()}<text x="${plane.x + 18}" y="${plane.y + 28}" class="ch7-story-panel-title">${label}</text>`;
      const v1 = [1.15, 0];
      const v2 = [0.35, 1.15];
      if (type === "split") {
        content += plane.line([1, 0], "primary", 3.3) + plane.line([0, 1], "secondary", 3.3);
        content += plane.vector(v1, "primary", "v₁") + plane.vector([0, 1.15], "secondary", "v₂");
        if (state.mode !== "compare") {
          const image1 = state.mode === "N" ? [0, 0] : S.scale(state.lambda, v1);
          const image2 = state.mode === "N" ? [0, 0] : S.scale(state.lambda, [0, 1.15]);
          if (S.norm(image1) > 1e-8) content += plane.vector(image1, "success", "T(v₁)");
          if (S.norm(image2) > 1e-8) content += plane.vector(image2, "output", "T(v₂)");
          if (state.mode === "N") content += `<circle cx="${plane.cx}" cy="${plane.cy}" r="24" class="ch7-story-zero-seal"/><text x="${plane.cx + 34}" y="${plane.cy - 22}" class="ch7-story-label is-success">N=0</text>`;
        }
        return content;
      }

      content += S.transformedGrid(plane, state.mode === "N" ? [[0, 1], [0, 0]] : [[state.lambda, 1], [0, state.lambda]], { extent: 2.8, step: 0.6, role: "output" });
      content += plane.line(v1, "success", 4.2) + plane.vector(v1, "success", "v₁ 特征线");
      content += plane.vector(v2, "secondary", "v₂ 广义方向");

      if (state.mode === "compare") {
        const image = S.add(S.scale(state.lambda, v2), v1);
        content += plane.vector(image, "output", "T(v₂)=λv₂+v₁");
        const scaled = S.scale(state.lambda, v2);
        const a = plane.p(scaled);
        const b = plane.p(image);
        content += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ch7-story-leak"/><text x="${(a[0] + b[0]) / 2}" y="${(a[1] + b[1]) / 2 - 12}" text-anchor="middle" class="ch7-story-label is-danger">额外剪切 v₁</text>`;
      } else if (state.mode === "T") {
        const image1 = S.scale(state.lambda, v1);
        const image2 = S.add(S.scale(state.lambda, v2), v1);
        content += plane.vector(image1, "primary", "λv₁") + plane.vector(S.scale(state.lambda, v2), "secondary", "λv₂");
        content += plane.vector(image2, "output", "λv₂+v₁");
        const a = plane.p(S.scale(state.lambda, v2));
        const b = plane.p(image2);
        content += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ch7-story-leak"/>`;
      } else {
        const currentIndex = Math.max(1, Math.min(state.step ? (type === "j3" ? 3 - state.step + 1 : 2 - state.step + 1) : (type === "j3" ? 3 : 2), type === "j3" ? 3 : 2));
        const vectors = type === "j3" ? [[1.15, 0], [0.35, 1.15], [-0.75, 1.45]] : [[1.15, 0], [0.35, 1.15]];
        const startIndex = state.step === 0 ? vectors.length - 1 : Math.max(0, vectors.length - 1 - state.step);
        const current = vectors[startIndex];
        const next = startIndex === 0 ? [0, 0] : vectors[startIndex - 1];
        content += plane.vector(current, "gold", `v${startIndex + 1}`);
        if (S.norm(next) > 0) {
          content += plane.vector(next, "output", `N(v${startIndex + 1})=v${startIndex}`);
          const a = plane.p(current);
          const b = plane.p(next);
          content += `<path d="M${a[0]} ${a[1]} Q${plane.cx + 60} ${plane.cy - 90},${b[0]} ${b[1]}" class="ch7-story-jordan-trail"/>`;
        } else {
          content += `<circle cx="${plane.cx}" cy="${plane.cy}" r="25" class="ch7-story-zero-seal"/><text x="${plane.cx + 36}" y="${plane.cy - 22}" class="ch7-story-label is-success">N(v₁)=0</text>`;
        }
      }
      return content;
    };

    const draw = () => {
      const structure = structures[state.structure];
      const width = 1000;
      const height = 620;
      const left = S.createPlane({ x: 45, y: 70, width: 420, height: 385, extent: 3.2 });
      const right = S.createPlane({ x: 535, y: 70, width: 420, height: 385, extent: 3.2 });
      let content = `<rect x="25" y="45" width="460" height="440" rx="26" class="ch7-story-panel-bg"/><rect x="515" y="45" width="460" height="440" rx="26" class="ch7-story-panel-bg"/>`;
      content += drawPanel(left, "split", "可对角化：两条独立特征线");
      content += drawPanel(right, structure.split ? "split" : structure.value, structure.split ? "当前也是两个 1×1 块" : "Jordan：只剩一条真正特征线");

      const chainY = 550;
      const count = structure.split ? 2 : structure.size;
      const nodes = [];
      if (structure.split) {
        ["v₁", "v₂"].forEach((label, index) => {
          const x = 340 + index * 180;
          nodes.push(`<rect x="${x}" y="${chainY - 32}" width="100" height="64" rx="18" class="ch7-story-chain-node is-zero"/><text x="${x + 50}" y="${chainY + 5}" text-anchor="middle" class="ch7-story-node-text">N(${label})=0</text>`);
        });
      } else {
        for (let index = count; index >= 1; index -= 1) {
          const order = count - index;
          const x = 220 + order * 150;
          const active = state.mode === "N" && order === Math.min(state.step, count - 1);
          nodes.push(`<rect x="${x}" y="${chainY - 32}" width="100" height="64" rx="18" class="ch7-story-chain-node ${active ? "is-active" : ""}"/><text x="${x + 50}" y="${chainY + 5}" text-anchor="middle" class="ch7-story-node-text">v${index}</text>`);
          if (index > 1) nodes.push(`<text x="${x + 125}" y="${chainY + 5}" text-anchor="middle" class="ch7-story-label is-output">N→</text>`);
        }
        const zeroX = 220 + count * 150;
        nodes.push(`<rect x="${zeroX}" y="${chainY - 32}" width="78" height="64" rx="18" class="ch7-story-chain-node is-zero"/><text x="${zeroX + 39}" y="${chainY + 5}" text-anchor="middle" class="ch7-story-node-text">0</text>`);
      }
      content += nodes.join("");

      let tone = "neutral";
      let title = "";
      let text = "";
      let formula = "";
      let facts = [];
      if (structure.split) {
        tone = "pass";
        title = "两个 1×1 块没有链耦合，N=0";
        text = "相同特征值并不自动产生 Jordan 链；若已有足够多独立特征向量，仍然可以完全对角化。";
        formula = "T=\\lambda I,\\quad N=T-\\lambda I=0";
        facts = [["独立特征向量", "2"], ["最大链长", "1"]];
      } else if (state.mode === "compare") {
        tone = "warn";
        title = "第二个方向不是特征方向，但它的偏离完全落在 v₁ 上";
        text = "这段额外剪切正是对角矩阵无法记录的信息。Jordan 块用超对角线上的 1 保存它。";
        formula = "T(v_2)=\\lambda v_2+v_1";
        facts = [["独立特征线", "1"], ["链长", String(structure.size)]];
      } else if (state.mode === "T") {
        tone = "neutral";
        title = "完整 T 同时做 λ 倍缩放与向前一级的剪切";
        text = "因此当 λ≠0 时，反复作用 T 通常不会把向量送到零。";
        formula = "T(v_k)=\\lambda v_k+v_{k-1}";
        facts = [["λ", S.fmt(state.lambda, 1)], ["当前步", String(state.step)]];
      } else {
        const finished = state.step >= structure.size;
        tone = finished ? "pass" : "warn";
        title = finished ? "幂零部分沿链走完，最终到达 0" : "去掉缩放后，只剩向前一级的链传递";
        text = finished ? "最大 Jordan 链长决定需要多少次 N 才能把所有链向量消去。" : "点击“沿链走一步”，观察当前广义特征向量怎样落入前一级。";
        formula = "Nv_k=v_{k-1},\\quad Nv_1=0";
        facts = [["当前步", String(state.step)], ["幂零指数", String(structure.size)]];
      }

      shell.stage.innerHTML = S.svg(content, { width, height, label: "可对角化结构与 Jordan 块的缩放、剪切和链传递对比" });
      shell.result.innerHTML = S.result({ tone, title, text, formula, facts });
      const next = shell.toolbar.querySelector("[data-next-step]");
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
      if (event.target.closest("[data-next-step]")) {
        const size = structures[state.structure].size;
        state.step = Math.min(size, state.step + 1);
        draw();
        return;
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
