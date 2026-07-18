(() => {
  const U = () => window.Ch6UI;

  const miniConfig = { ...U().plane, width: 280, height: 190, origin: [118, 125], scale: 62 };
  const mainConfig = { ...U().plane, width: 640, height: 380, origin: [300, 238], scale: 92 };

  function defs() {
    return `<defs><filter id="ch6-vector-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2" result="blur"></feGaussianBlur><feMerge><feMergeNode in="blur"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter></defs>`;
  }

  function parallelogram(v1, v2, config, className = "") {
    const o = U().point([0, 0], config);
    const a = U().point(v1, config);
    const b = U().point(v2, config);
    const c = U().point(U().add(v1, v2), config);
    return `<polygon class="ch6-basis-area ${className}" points="${o.join(",")} ${a.join(",")} ${c.join(",")} ${b.join(",")}"></polygon>`;
  }

  function lattice(v1, v2, config) {
    let lines = "";
    const p = (v) => U().point(v, config);
    for (let k = -4; k <= 4; k += 1) {
      const a1 = p(U().add(U().scale(v1, -5), U().scale(v2, k)));
      const a2 = p(U().add(U().scale(v1, 5), U().scale(v2, k)));
      const b1 = p(U().add(U().scale(v2, -5), U().scale(v1, k)));
      const b2 = p(U().add(U().scale(v2, 5), U().scale(v1, k)));
      lines += `<line class="ch6-basis-lattice is-v1" x1="${a1[0]}" y1="${a1[1]}" x2="${a2[0]}" y2="${a2[1]}"></line><line class="ch6-basis-lattice is-v2" x1="${b1[0]}" y1="${b1[1]}" x2="${b2[0]}" y2="${b2[1]}"></line>`;
    }
    return lines;
  }

  function miniFrame(v1, v2, title, caption, kind) {
    const det = Math.abs(U().cross(v1, v2));
    let inner = defs() + U().planeGrid(miniConfig);
    if (kind === "line") inner += U().line(v1, "is-u", "span", [0, 0], miniConfig);
    if (kind === "plane") inner += lattice(v1, v2, miniConfig) + parallelogram(v1, v2, miniConfig, "is-visible");
    inner += U().softArrow([0, 0], v1, "is-u", "v₁", miniConfig);
    if (v2) inner += U().softArrow([0, 0], v2, "is-w", "v₂", miniConfig);
    return `<article class="ch6-span-frame"><span>${title}</span><svg viewBox="0 0 ${miniConfig.width} ${miniConfig.height}" role="img" aria-label="${caption}">${inner}</svg><div><strong>${caption}</strong><small>${kind === "line" ? "det = 0 · 维数仍为 1" : `|det(v₁,v₂)| = ${U().formatNumber(det, 2)} · 维数升为 2`}</small></div></article>`;
  }

  function spanProgression() {
    const v1 = [1.55, 0.35];
    const v2Same = [1.15, 0.26];
    const v2New = [-0.15, 1.25];
    return `<div class="ch6-cinematic-story ch6-span-cinema"><span class="ch6-cinematic-kicker">方向是否真的增加</span><h4 class="ch6-cinematic-title">面积从 0 变为非 0，正是维数从 1 升到 2 的几何信号</h4><div class="ch6-span-frames">${miniFrame(v1, null, "只有 v₁", "所有倍数只铺成一条直线", "line")}${miniFrame(v1, v2Same, "加入共线 v₂", "箭头更多了，但没有新方向", "line")}${miniFrame(v1, v2New, "加入独立 v₂", "平行四边形有面积，两个方向张成平面", "plane")}</div></div>`;
  }

  function renderFormal(root) {
    const modules = [
      U().moduleBlock("01", "张成回答“能铺到哪里”", "不要先数箭头，先看线性组合实际覆盖的范围", `${spanProgression()}<div class="ch6-formula-band">${U().texDisplay("\\operatorname{span}\\{v_1,\\ldots,v_k\\}=\\{a_1v_1+\\cdots+a_kv_k\\}")}<p>一个方向只能铺成直线；两个真正独立的方向才能铺满平面。</p></div>`),
      U().moduleBlock("02", "线性无关回答“有没有重复方向”", "在二维中，行列式面积提供最直接的几何判据", `<div class="ch6-independence-compare"><article><span>面积为 0</span>${U().texDisplay("\\det(v_1,v_2)=0")}<p>两个向量共线，其中一个方向可以由另一个方向替代。</p></article><article><span>面积非 0</span>${U().texDisplay("\\det(v_1,v_2)\\neq0")}<p>两个方向不可互相替代，因此线性无关。</p></article></div>`),
      U().moduleBlock("03", "基是最小而完整的方向骨架", "生成保证够用，无关保证没有冗余", `<div class="ch6-basis-equation"><div class="ch6-basis-condition"><span>生成</span><strong>覆盖整个空间</strong><p>每个向量都能由这些方向合成。</p></div><b>+</b><div class="ch6-basis-condition"><span>无关</span><strong>没有重复方向</strong><p>删掉任何一个都会损失信息。</p></div><b>=</b><div class="ch6-basis-condition is-result"><span>基</span><strong>唯一坐标</strong><p>每个向量获得唯一的一组系数。</p></div></div>`),
      U().moduleBlock("04", "坐标记录沿每个基方向走了多少", "对象不变，基的顺序改变时坐标分量也会改变", `<div class="ch6-coordinate-layout"><div>${U().formulaCard("有序基", "B=(b_1,\\ldots,b_n)", "顺序决定坐标分量的顺序。")}${U().formulaCard("坐标定义", "v=x_1b_1+\\cdots+x_nb_n,\\qquad [v]_B=(x_1,\\ldots,x_n)^T", "基保证系数存在且唯一。")}</div><div class="ch6-coordinate-example"><span>同一个向量</span>${U().texDisplay("v=2b_1+3b_2")}<div class="ch6-coordinate-swap"><article><small>基 B=(b₁,b₂)</small><strong>(2,3)ᵀ</strong></article><b>交换顺序</b><article><small>基 B'=(b₂,b₁)</small><strong>(3,2)ᵀ</strong></article></div><p>向量没有移动，只是编码顺序改变。</p></div></div>`),
    ];
    root.innerHTML = U().formalShell("基、维数与坐标：从方向到面积，再到编码", "这一节不再把“张成、无关、基”当作三个孤立定义，而是沿一条几何主线理解：新向量是否带来新方向，行列式面积是否从 0 变为非 0。", modules, "下一节固定同一个向量，改变方向骨架，观察坐标如何随之变化。");
  }

  function sceneSvg(v1, v2, showRedundant, target, mode) {
    const det = U().cross(v1, v2);
    const independent = Math.abs(det) > 0.08;
    let inner = defs() + U().planeGrid(mainConfig);
    if (mode === "structure") {
      if (independent) {
        inner += `<rect class="ch6-plane-field" x="10" y="10" width="620" height="360" rx="22"></rect>`;
        inner += lattice(v1, v2, mainConfig) + parallelogram(v1, v2, mainConfig, "is-visible");
      } else {
        inner += U().line(v1, "is-u", "当前张成一条直线", [0, 0], mainConfig);
      }
      inner += U().softArrow([0, 0], v1, "is-u", "v₁", mainConfig);
      inner += U().softArrow([0, 0], v2, "is-w", "v₂ · 拖动箭头", mainConfig);
      if (showRedundant) {
        const v3 = U().add(U().scale(v1, 0.72), U().scale(v2, 0.55));
        inner += U().softArrow([0, 0], v3, "is-g3", "v₃=0.72v₁+0.55v₂", mainConfig);
      }
      const tip = U().point(v2, mainConfig);
      inner += `<circle class="ch6-drag-handle" data-v2-handle cx="${tip[0]}" cy="${tip[1]}" r="12"></circle>`;
    } else {
      const coordinates = U().solve(v1, v2, target) || [0, 0];
      const first = U().scale(v1, coordinates[0]);
      inner += lattice(v1, v2, mainConfig) + parallelogram(v1, v2, mainConfig, "is-visible is-soft");
      inner += U().softArrow([0, 0], v1, "is-u", "b₁", mainConfig);
      inner += U().softArrow([0, 0], v2, "is-w", "b₂", mainConfig);
      inner += U().softArrow([0, 0], first, "is-u-soft", `${U().formatNumber(coordinates[0])}b₁`, mainConfig);
      inner += U().softArrow(first, target, "is-w-soft", `${U().formatNumber(coordinates[1])}b₂`, mainConfig);
      inner += U().softArrow([0, 0], target, "is-target", "目标向量 v", mainConfig);
    }
    return `<svg class="ch6-plane ch6-basis-scene" viewBox="0 0 640 380" role="img" aria-label="基、张成与坐标实验">${inner}</svg>`;
  }

  function renderInteractive(root, section) {
    let mode = "structure";
    const v1 = [1.55, 0.35];
    let v2 = [1.05, 0.24];
    let showRedundant = false;
    let target = [1.25, 1.15];
    let animationFrame = null;
    root.innerHTML = `<div data-ch6-basis-lab></div>`;
    const host = root.querySelector("[data-ch6-basis-lab]");

    function animateV2(next) {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      const start = v2.slice();
      const started = performance.now();
      const duration = 360;
      const tick = (now) => {
        const raw = Math.min(1, (now - started) / duration);
        const t = 1 - Math.pow(1 - raw, 3);
        v2 = [start[0] + (next[0] - start[0]) * t, start[1] + (next[1] - start[1]) * t];
        render(false);
        if (raw < 1) animationFrame = requestAnimationFrame(tick);
      };
      animationFrame = requestAnimationFrame(tick);
    }

    function render(rebind = true) {
      const det = U().cross(v1, v2);
      const independent = Math.abs(det) > 0.08;
      const coordinates = independent ? U().solve(v1, v2, target) : null;
      const angle = Math.atan2(v2[1], v2[0]);
      const length = U().norm(v2);
      const controls = `${U().segmented([["structure", "① 方向与维数"], ["coordinates", "② 基与坐标"]], "basis-mode", mode)}${mode === "structure" ? `${U().segmented([["collinear", "共线：面积为 0"], ["near", "接近共线"], ["independent", "独立：面积非 0"]], "basis-preset", independent ? "independent" : Math.abs(det) < 0.02 ? "collinear" : "near")}<div class="ch6-coordinate-sliders"><label>v₂ 的方向 <output>${Math.round(angle * 180 / Math.PI)}°</output><input type="range" min="-0.2" max="1.65" step="0.01" value="${angle}" data-v2-angle></label><label>v₂ 的长度 <output>${U().formatNumber(length, 2)}</output><input type="range" min="0.55" max="1.75" step="0.01" value="${length}" data-v2-length></label></div><label class="ch6-redundant-toggle"><input type="checkbox" data-redundant ${showRedundant ? "checked" : ""}><span>加入由 v₁、v₂ 组合出的第三个向量 v₃</span></label>` : `<div class="ch6-coordinate-sliders"><label>目标 v 横坐标 <output>${U().formatNumber(target[0], 1)}</output><input type="range" min="-2" max="2" step="0.05" value="${target[0]}" data-target-x></label><label>目标 v 纵坐标 <output>${U().formatNumber(target[1], 1)}</output><input type="range" min="-1.6" max="1.8" step="0.05" value="${target[1]}" data-target-y></label></div>`}`;
      const readout = mode === "structure"
        ? `<div class="ch6-basis-verdict"><div><span>有向面积</span><strong>|det(v₁,v₂)| = ${U().formatNumber(Math.abs(det), 3)}</strong></div><div><span>张成维数</span><strong>${independent ? "2 · 整个平面" : "1 · 一条直线"}</strong></div><div><span>是否线性无关</span><strong>${independent ? "是" : "否"}</strong></div><div><span>当前向量组是否为基</span><strong>${independent && !showRedundant ? "是：够用且无冗余" : independent ? "否：v₃ 是冗余方向" : "否：缺少第二个独立方向"}</strong></div></div><div class="ch6-conclusion-box ${independent ? "is-ok" : "is-warn"}"><span>几何结论</span><strong>${independent ? "平行四边形有面积，v₂ 真正增加了一个方向" : "面积塌缩为 0，v₂ 没有增加新的方向"}</strong></div>`
        : `<div class="ch6-coordinate-pair"><article><span>有序基 B</span><strong>(b₁,b₂)</strong></article><b>→</b><article><span>目标向量 v</span><strong>${U().formatVector(target)}</strong></article></div><div class="ch6-coordinate-reader"><span>坐标 [v]ᵦ</span><strong>${coordinates ? U().formatVector(coordinates) : "—"}</strong><span>验证</span><strong>${coordinates ? `${U().formatNumber(coordinates[0])}b₁ + ${U().formatNumber(coordinates[1])}b₂ = v` : "先让两个基方向独立"}</strong></div><div class="ch6-conclusion-box is-ok"><span>读图方法</span><strong>先沿 b₁ 走第一段，再沿 b₂ 走第二段，终点正好落到 v</strong></div>`;

      host.innerHTML = U().labShell({
        title: mode === "structure" ? "拖动 v₂：看面积怎样决定维数" : "沿两个基方向走到目标向量",
        lead: mode === "structure" ? "不要数箭头。拖动第二个方向，观察平行四边形面积从 0 变为非 0，张成空间也会从直线扩展为平面。" : "固定一组独立基，改变目标向量。两段彩色路径就是它的两个坐标分量。",
        focus: mode === "structure" ? "先看半透明平行四边形是否有面积；面积为 0 时，两个箭头只是同一方向。" : "先看黑色目标 v，再沿青色和橙色两段路径追到它的终点。",
        stage: `<div class="ch6-stage-shell">${sceneSvg(v1, v2, showRedundant, target, mode)}</div>`,
        controls,
        readout,
        tasks: U().taskBlock(section),
        className: `ch6-basis-lab is-${mode}`,
      });

      if (!rebind) return;
      host.querySelectorAll("[data-basis-mode]").forEach((button) => button.addEventListener("click", () => {
        mode = button.dataset.basisMode;
        if (mode === "coordinates" && !independent) v2 = [-0.15, 1.25];
        render();
      }));
      host.querySelectorAll("[data-basis-preset]").forEach((button) => button.addEventListener("click", () => {
        const preset = button.dataset.basisPreset;
        if (preset === "collinear") animateV2([1.05, 0.237]);
        if (preset === "near") animateV2([1.05, 0.38]);
        if (preset === "independent") animateV2([-0.15, 1.25]);
      }));
      host.querySelector("[data-v2-angle]")?.addEventListener("input", (event) => {
        const a = Number(event.target.value);
        const len = U().norm(v2);
        v2 = [Math.cos(a) * len, Math.sin(a) * len];
        render();
      });
      host.querySelector("[data-v2-length]")?.addEventListener("input", (event) => {
        const len = Number(event.target.value);
        const a = Math.atan2(v2[1], v2[0]);
        v2 = [Math.cos(a) * len, Math.sin(a) * len];
        render();
      });
      host.querySelector("[data-redundant]")?.addEventListener("change", (event) => {
        showRedundant = event.target.checked;
        render();
      });
      host.querySelector("[data-target-x]")?.addEventListener("input", (event) => { target[0] = Number(event.target.value); render(); });
      host.querySelector("[data-target-y]")?.addEventListener("input", (event) => { target[1] = Number(event.target.value); render(); });

      const svg = host.querySelector(".ch6-basis-scene");
      const handle = host.querySelector("[data-v2-handle]");
      if (svg && handle) {
        const updateFromPointer = (event) => {
          const rect = svg.getBoundingClientRect();
          const x = (event.clientX - rect.left) * 640 / rect.width;
          const y = (event.clientY - rect.top) * 380 / rect.height;
          v2 = [(x - mainConfig.origin[0]) / mainConfig.scale, (mainConfig.origin[1] - y) / mainConfig.scale];
          const len = U().norm(v2);
          if (len > 1.8) v2 = U().scale(v2, 1.8 / len);
          if (len < 0.45) v2 = U().scale(v2, 0.45 / Math.max(len, 0.001));
          render();
        };
        handle.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          handle.setPointerCapture(event.pointerId);
          handle.addEventListener("pointermove", updateFromPointer);
          handle.addEventListener("pointerup", () => handle.removeEventListener("pointermove", updateFromPointer), { once: true });
        });
      }
    }
    render();
  }

  U().register("basis-coordinates", renderFormal, renderInteractive);
})();