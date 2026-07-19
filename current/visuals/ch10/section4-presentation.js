(() => {
  const ui = window.chapter10UI;
  const {
    q, qa, format, nearZero, add, scale, mathInline,
    markerDefs, gridPaths, vectorSvg, toSvgPoint, bindSvgDrag, animateNumbers,
    renderModuleHeading,
  } = ui;

  function pairing(x, y) {
    return x[0] * y[1] - x[1] * y[0];
  }

  function polygon(x, y, className) {
    const points = [[0, 0], x, add(x, y), y].map((point) => toSvgPoint(point).join(",")).join(" ");
    return `<polygon class="${className}" points="${points}"></polygon>`;
  }

  function renderIntuition() {
    return `<div class="ch10-intuition-list">
      <article><span>01</span><strong>方向决定正负</strong><p>x 到 y 为逆时针时，${mathInline("\\omega(x,y)>0")}。</p></article>
      <article><span>02</span><strong>交换后符号反转</strong><p>${mathInline("\\omega(y,x)=-\\omega(x,y)")}，面积绝对值不变。</p></article>
      <article><span>03</span><strong>共线时面积为 0</strong><p>平行四边形压成一条线，但这不等于整个形式退化。</p></article>
    </div>`;
  }

  function renderInteractive(section) {
    return `<div class="ch10-core-lab symplectic-core" data-symplectic-core>
      <header class="ch10-core-head">
        <div>
          <span>观察任务</span>
          <strong>${section.interactive.question}</strong>
          <p>所有动作都作用在同一个平行四边形上。比较轮廓、读数和公式，不看装饰。</p>
        </div>
        <button class="ch10-core-reset" type="button" data-symplectic-reset>恢复原始图形</button>
      </header>
      <div class="ch10-segmented symplectic-modes" role="tablist" aria-label="有向面积比较动作">
        <button type="button" role="tab" data-symplectic-mode="original" aria-selected="true">原始</button>
        <button type="button" role="tab" data-symplectic-mode="swap" aria-selected="false">交换输入</button>
        <button type="button" role="tab" data-symplectic-mode="collinear" aria-selected="false">令两向量共线</button>
        <button type="button" role="tab" data-symplectic-mode="shear" aria-selected="false">剪切 y ← y+x</button>
        <button type="button" role="tab" data-symplectic-mode="uniform" aria-selected="false">均匀缩放</button>
      </div>
      <div class="ch10-core-layout">
        <div class="ch10-plot-column">
          <div class="ch10-plot-shell">
            <svg viewBox="0 0 100 100" data-symplectic-svg role="img" aria-label="有向平行四边形及变换前后轮廓"></svg>
          </div>
          <p class="symplectic-drag-hint">在“原始”状态可拖动 x、y；切换动作后，虚线表示变换前轮廓。</p>
        </div>
        <aside class="ch10-core-readout">
          <div class="ch10-readout-block">
            <span class="ch10-readout-label">当前有向面积</span>
            <strong class="ch10-readout-value" data-symplectic-value></strong>
            <div class="ch10-readout-formula" data-symplectic-formula></div>
          </div>
          <div class="ch10-readout-block">
            <span class="ch10-readout-label">与原始状态比较</span>
            <p class="ch10-readout-copy" data-symplectic-compare></p>
          </div>
          <div class="ch10-readout-block">
            <span class="ch10-readout-label">当前结论</span>
            <p class="ch10-readout-copy" data-symplectic-conclusion></p>
          </div>
        </aside>
      </div>
      <div class="ch10-status" aria-live="polite" data-symplectic-status></div>
    </div>`;
  }

  function renderFormal(section) {
    return `<div class="ch10-formal-flow">
      <p class="ch10-formal-lead">二维有向面积只负责建立直觉。辛空间的正式定义还必须加入非退化，并在高维保留全部配对关系。</p>
      <section class="ch10-module" aria-labelledby="symplectic-definition-title">
        ${renderModuleHeading("01", "交错且非退化", "两个条件回答不同问题，缺一不可。", "symplectic-definition-title")}
        <div class="ch10-concept-list">
          ${section.concepts.map((concept) => `<article><span>${concept.label}</span><p>${concept.text}</p></article>`).join("")}
        </div>
      </section>
      <section class="ch10-module" aria-labelledby="even-dimension-title">
        ${renderModuleHeading("02", "为什么维数必须是偶数", "方向按面积配对成双出现。", "even-dimension-title")}
        <div class="ch10-static-diagram">
          ${section.evenDimension.algebra.map((item, index) => `<div class="ch10-static-row"><strong>第 ${index + 1} 步</strong><p>${item}</p></div>`).join("")}
        </div>
      </section>
      <section class="ch10-module" aria-labelledby="preservation-title">
        ${renderModuleHeading("03", "辛、正交与体积保持不是一回事", "先问保持了哪个对象，再看矩阵条件。", "preservation-title")}
        <div class="ch10-static-diagram">
          ${section.preservationCompare.slice(0, 3).map((item) => `<div class="ch10-static-row"><strong>${item.title} · ${item.keeps}</strong><p>${item.condition}；${item.visual}。</p></div>`).join("")}
        </div>
      </section>
      <aside class="ch10-boundary-note"><strong>二维是特殊情形</strong><p>二维中 ${mathInline("S^TJS=(\\det S)J")}；高维里 ${mathInline("\\det S=1")} 只保证总体积，不能替代辛条件。</p></aside>
    </div>`;
  }

  function mountInteractive(section, root) {
    const lab = q(root, "[data-symplectic-core]");
    if (!lab) return;
    const svg = q(lab, "[data-symplectic-svg]");
    const state = {
      baseX: [2.1, 0.6],
      baseY: [-0.7, 2],
      displayX: [2.1, 0.6],
      displayY: [-0.7, 2],
      mode: "original",
      transitioning: false,
    };
    let cancelAnimation = () => {};

    const vectorsForMode = (mode) => {
      if (mode === "swap") return [[...state.baseY], [...state.baseX]];
      if (mode === "collinear") return [[...state.baseX], scale(0.75, state.baseX)];
      if (mode === "shear") return [[...state.baseX], add(state.baseY, state.baseX)];
      if (mode === "uniform") return [scale(1.35, state.baseX), scale(1.35, state.baseY)];
      return [[...state.baseX], [...state.baseY]];
    };

    const draw = () => {
      const x = state.displayX;
      const y = state.displayY;
      const original = pairing(state.baseX, state.baseY);
      const value = pairing(x, y);
      const ghost = state.mode !== "original" && state.mode !== "swap"
        ? polygon(state.baseX, state.baseY, "ch10-ghost-shape")
        : "";
      const areaClass = `ch10-area-shape${nearZero(value, 0.001) ? " is-zero" : value < 0 ? " is-negative" : ""}`;
      const interactive = state.mode === "original";
      svg.innerHTML = `${markerDefs}<g class="ch10-grid">${gridPaths()}</g>${ghost}${polygon(x, y, areaClass)}${vectorSvg(x, "x", "x", { handleRadius: interactive ? 2.5 : 0, ariaLabel: "拖动向量 x" })}${vectorSvg(y, "y", "y", { handleRadius: interactive ? 2.5 : 0, ariaLabel: "拖动向量 y" })}`;
      let modeData = {
        original: {
          formula: `\\omega(x,y)=\\det[x\\;y]=${format(value)}`,
          compare: "这是比较基准。拖动任一向量，面积与公式即时同步。",
          conclusion: "有向面积同时记录大小与方向顺序。",
          status: ["先观察正负与零", "交换顺序会变号；两向量共线时配对为 0。"],
        },
        swap: {
          formula: `\\omega(y,x)=${format(value)}=-\\omega(x,y)`,
          compare: `绝对值仍为 ${format(Math.abs(original))}，只改变符号。`,
          conclusion: "交换输入不改变平行四边形，却反转有向面积。",
          status: ["交错性表现为交换变号", "这与只看无向面积不同。"],
        },
        collinear: {
          formula: `\\omega(x,0.75x)=0`,
          compare: `原面积 ${format(original)} 收缩为 0。`,
          conclusion: "一对共线向量配对为 0，不等于整个形式退化。",
          status: ["平行四边形压成一条线", "交错性要求每个向量与自身的配对都为 0。"],
        },
        shear: {
          formula: `\\omega(x,y+x)=\\omega(x,y)=${format(value)}`,
          compare: `形状改变，但有向面积仍为 ${format(original)}。`,
          conclusion: "剪切改变长度和角度，却保持这组辛配对。",
          status: ["剪切保持有向面积", "因为 ω(x,y+x)=ω(x,y)+ω(x,x)，而 ω(x,x)=0。"],
        },
        uniform: {
          formula: `\\omega(1.35x,1.35y)=1.35^2\\omega(x,y)=${format(value)}`,
          compare: `原面积 ${format(original)} 被放大为 ${format(value)}。`,
          conclusion: "均匀缩放一般不满足 SᵀJS=J，因此不是辛变换。",
          status: ["形状相似不等于结构保持", "两个方向同时放大，面积按平方倍数改变。"],
        },
      }[state.mode];
      if (state.transitioning) {
        modeData = {
          formula: `\\omega(x_t,y_t)=${format(value)}`,
          compare: `图形正在连续变化；当前中间帧的有向面积为 ${format(value)}。`,
          conclusion: "等待形变完成后，再比较最终配对值。",
          status: ["正在比较同一个几何对象", "轮廓、面积读数和公式逐帧同步。"],
        };
      }
      q(lab, "[data-symplectic-value]").textContent = format(value);
      q(lab, "[data-symplectic-formula]").innerHTML = mathInline(modeData.formula);
      q(lab, "[data-symplectic-compare]").textContent = modeData.compare;
      q(lab, "[data-symplectic-conclusion]").textContent = modeData.conclusion;
      q(lab, "[data-symplectic-status]").innerHTML = `<strong>${modeData.status[0]}</strong><p>${modeData.status[1]}</p>`;
      qa(lab, "[data-symplectic-mode]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.symplecticMode === state.mode)));
    };

    bindSvgDrag(svg, "x", () => [...state.baseX], (vector) => {
      cancelAnimation();
      state.baseX = vector;
      state.displayX = [...vector];
      state.displayY = [...state.baseY];
      state.mode = "original";
      state.transitioning = false;
      draw();
    });
    bindSvgDrag(svg, "y", () => [...state.baseY], (vector) => {
      cancelAnimation();
      state.baseY = vector;
      state.displayX = [...state.baseX];
      state.displayY = [...vector];
      state.mode = "original";
      state.transitioning = false;
      draw();
    });
    qa(lab, "[data-symplectic-mode]").forEach((button) => button.addEventListener("click", () => {
      const mode = button.dataset.symplecticMode;
      const [targetX, targetY] = vectorsForMode(mode);
      state.mode = mode;
      cancelAnimation();
      cancelAnimation = animateNumbers([...state.displayX, ...state.displayY], [...targetX, ...targetY], (values) => {
        state.displayX = values.slice(0, 2);
        state.displayY = values.slice(2, 4);
        state.transitioning = values.some((value, index) => Math.abs(value - [...targetX, ...targetY][index]) > 1e-6);
        draw();
      });
    }));
    q(lab, "[data-symplectic-reset]").addEventListener("click", () => {
      cancelAnimation();
      state.baseX = [2.1, 0.6];
      state.baseY = [-0.7, 2];
      state.displayX = [...state.baseX];
      state.displayY = [...state.baseY];
      state.mode = "original";
      state.transitioning = false;
      draw();
    });
    draw();
    return () => cancelAnimation();
  }

  window.defineChapter10Renderer("symplectic-space", {
    renderIntuition,
    renderInteractive,
    renderFormal,
    mountInteractive,
  });
})();
