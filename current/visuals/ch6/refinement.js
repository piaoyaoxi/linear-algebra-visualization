/* Chapter 6 refinement pass: blueprint-aligned, invariant-first interactions. */
(() => {
  const M = () => window.Ch6Math;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const fmt = (x, d = 2) => M().fmt(x, d);
  const fmtVec = (v, d = 2) => `(${v.map((x) => fmt(x, d)).join(", ")})`;
  const fmtMat = (A, d = 2) => `[[${fmt(A[0][0], d)}, ${fmt(A[0][1], d)}], [${fmt(A[1][0], d)}, ${fmt(A[1][1], d)}]]`;
  const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

  function tasks(section) {
    const task = section?.interactive?.task || "";
    const prompts = section?.interactive?.prompts || [];
    if (!task && !prompts.length) return "";
    return `<div class="script-panel ch6-refined-tasks"><h3>观察任务</h3>${task ? `<p>${task}</p>` : ""}${prompts.length ? `<ol>${prompts.map((p) => `<li>${p}</li>`).join("")}</ol>` : ""}</div>`;
  }

  function lab(title, lead, main, side, cls = "") {
    return `<div class="ch6-lab ch6-refined ${cls}">
      <div class="ch6-lab-head"><h3>${title}</h3><p>${lead}</p></div>
      <div class="ch6-refined-grid"><div class="ch6-refined-main">${main}</div><aside class="ch6-refined-side">${side}</aside></div>
    </div>`;
  }

  function metric(label, valueAttr, value = "—") {
    return `<div class="ch6-metric"><span>${label}</span><strong ${valueAttr ? `data-${valueAttr}` : ""}>${value}</strong></div>`;
  }

  function gate(label, attr) {
    return `<div class="ch6-gate" data-${attr}><strong>${label}</strong><div class="ch6-muted">—</div></div>`;
  }

  function setGate(root, attr, ok, detail) {
    const el = root.querySelector(`[data-${attr}]`);
    if (!el) return;
    el.className = `ch6-gate ${ok ? "is-ok" : "is-bad"}`;
    el.querySelector(".ch6-muted").textContent = `${ok ? "通过" : "失败"} · ${detail}`;
  }

  function setActive(root, selector, predicate) {
    root.querySelectorAll(selector).forEach((el) => el.classList.toggle("is-active", predicate(el)));
  }

  function renderer(id, mount) {
    window.defineChapter6Renderer(id, {
      interactive(interactiveRoot, section) {
        if (!interactiveRoot) return;
        interactiveRoot.innerHTML = `<h2>交互实验</h2><div data-ch6-refined-host></div>${tasks(section)}`;
        mount(interactiveRoot.querySelector("[data-ch6-refined-host]"), section);
      },
    });
  }

  function svgFrame(inner, label) {
    return `<svg class="ch6-refined-svg" viewBox="0 0 560 340" role="img" aria-label="${esc(label)}">
      <defs>
        <marker id="ch6-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L9,4.5 L0,9 z" fill="context-stroke"></path></marker>
      </defs>${inner}</svg>`;
  }

  const sx = (x) => 280 + x * 72;
  const sy = (y) => 170 - y * 72;
  function gridSvg() {
    let out = "";
    for (let i = -3; i <= 3; i += 1) {
      out += `<line class="ch6-grid-line" x1="${sx(-3.7)}" y1="${sy(i)}" x2="${sx(3.7)}" y2="${sy(i)}"></line>`;
      out += `<line class="ch6-grid-line" x1="${sx(i)}" y1="${sy(-2.25)}" x2="${sx(i)}" y2="${sy(2.25)}"></line>`;
    }
    out += `<line class="ch6-axis" x1="20" y1="${sy(0)}" x2="540" y2="${sy(0)}"></line><line class="ch6-axis" x1="${sx(0)}" y1="18" x2="${sx(0)}" y2="322"></line>`;
    return out;
  }
  function arrowSvg(from, to, cls, label = "") {
    const dx = sx(to[0]) - sx(from[0]);
    const dy = sy(to[1]) - sy(from[1]);
    const len = Math.hypot(dx, dy) || 1;
    const tx = sx(to[0]) + (dx / len) * 8;
    const ty = sy(to[1]) + (dy / len) * 8 - 5;
    return `<line class="ch6-vector ${cls}" x1="${sx(from[0])}" y1="${sy(from[1])}" x2="${sx(to[0])}" y2="${sy(to[1])}" marker-end="url(#ch6-arrow)"></line>${label ? `<text class="ch6-svg-label ${cls}" x="${tx}" y="${ty}">${esc(label)}</text>` : ""}`;
  }
  function infiniteLineSvg(dir, cls, label = "", offset = [0, 0]) {
    const n = Math.hypot(dir[0], dir[1]) || 1;
    const u = [dir[0] / n, dir[1] / n];
    const a = [offset[0] - 4.5 * u[0], offset[1] - 4.5 * u[1]];
    const b = [offset[0] + 4.5 * u[0], offset[1] + 4.5 * u[1]];
    return `<line class="ch6-infinite ${cls}" x1="${sx(a[0])}" y1="${sy(a[1])}" x2="${sx(b[0])}" y2="${sy(b[1])}"></line>${label ? `<text class="ch6-svg-label ${cls}" x="${sx(b[0]) - 35}" y="${sy(b[1]) - 8}">${esc(label)}</text>` : ""}`;
  }

  function mountMapLab(root) {
    const names = ["a", "b", "c", "d", "e"];
    let n = 3;
    let m = 4;
    let map = [0, 1, 2];
    let selectedY = 0;
    const presets = {
      incomplete: { n: 3, m: 4, map: [0, 1, -1] },
      injective: { n: 3, m: 4, map: [0, 1, 2] },
      surjective: { n: 4, m: 3, map: [0, 1, 2, 0] },
      bijective: { n: 3, m: 3, map: [1, 2, 0] },
      collision: { n: 3, m: 4, map: [0, 0, 1] },
    };

    root.innerHTML = lab(
      "映射构造器：先合法，再判断单满双",
      "定义域与陪域的大小可以不同。先检查“每个输入恰有一个输出”，再分别判断单射、满射与双射。",
      `<div class="ch6-toolbar" data-presets>
        <button type="button" data-preset="incomplete">缺少输出</button><button type="button" data-preset="injective">单射非满射</button><button type="button" data-preset="surjective">满射非单射</button><button type="button" data-preset="bijective">双射</button><button type="button" data-preset="collision">输入碰撞</button>
      </div>
      <div class="ch6-map-size-row"><label>|X| <select data-n>${[2,3,4,5].map((k) => `<option>${k}</option>`).join("")}</select></label><label>|Y| <select data-m>${[2,3,4,5].map((k) => `<option>${k}</option>`).join("")}</select></label></div>
      <div data-map-svg></div>
      <div class="ch6-map-assignments" data-assign></div>`,
      `<div class="ch6-readout"><strong data-map-title>判定</strong><div class="ch6-status" data-map-status></div><div class="ch6-metric-grid">${metric("单射", "inj")}${metric("满射", "sur")}${metric("双射", "bij")}${metric("值域", "image")}</div></div>
       <div class="ch6-readout"><strong>原像</strong><div class="ch6-toolbar" data-y-buttons></div><p class="ch6-muted" data-preimage></p></div>
       <div class="ch6-readout"><strong>逆映射</strong><p class="ch6-muted" data-inverse></p></div>`,
      "ch6-map-refined",
    );

    const nSelect = root.querySelector("[data-n]");
    const mSelect = root.querySelector("[data-m]");

    function normalize() {
      map = Array.from({ length: n }, (_, i) => (i < map.length && map[i] < m ? map[i] : -1));
      selectedY = clamp(selectedY, 0, m - 1);
    }

    function drawMap() {
      normalize();
      nSelect.value = String(n);
      mSelect.value = String(m);
      const xPos = 135;
      const yPos = 425;
      const yFor = (i, count) => 42 + (256 / Math.max(1, count - 1)) * i;
      let inner = `<rect class="ch6-set-oval" x="55" y="18" width="160" height="304" rx="76"></rect><rect class="ch6-set-oval" x="345" y="18" width="160" height="304" rx="76"></rect><text class="ch6-set-title" x="135" y="36">定义域 X</text><text class="ch6-set-title" x="425" y="36">陪域 Y</text>`;
      for (let i = 0; i < n; i += 1) {
        const yy = yFor(i, n);
        inner += `<circle class="ch6-map-node is-x" cx="${xPos}" cy="${yy}" r="17"></circle><text class="ch6-map-node-text" x="${xPos}" y="${yy + 5}">${i + 1}</text>`;
        if (map[i] >= 0) {
          const ty = yFor(map[i], m);
          inner += `<path class="ch6-map-edge" d="M ${xPos + 18} ${yy} C 245 ${yy}, 315 ${ty}, ${yPos - 18} ${ty}" marker-end="url(#ch6-arrow)"></path>`;
        } else {
          inner += `<path class="ch6-map-edge is-missing" d="M ${xPos + 18} ${yy} C 230 ${yy}, 270 ${yy}, 305 ${yy}"></path><text class="ch6-map-missing" x="315" y="${yy + 5}">?</text>`;
        }
      }
      for (let j = 0; j < m; j += 1) {
        const yy = yFor(j, m);
        const hits = map.filter((k) => k === j).length;
        inner += `<circle class="ch6-map-node is-y ${selectedY === j ? "is-selected" : ""}" cx="${yPos}" cy="${yy}" r="17"></circle><text class="ch6-map-node-text" x="${yPos}" y="${yy + 5}">${names[j]}</text>${hits > 1 ? `<text class="ch6-hit-count" x="${yPos + 25}" y="${yy + 4}">×${hits}</text>` : ""}`;
      }
      root.querySelector("[data-map-svg]").innerHTML = svgFrame(inner, "有限集合映射图");
    }

    function render() {
      normalize();
      drawMap();
      const legal = map.every((j) => j >= 0 && j < m);
      const values = legal ? map.slice() : map.filter((j) => j >= 0 && j < m);
      const image = [...new Set(values)].sort((a, b) => a - b);
      const injective = legal && new Set(map).size === n;
      const surjective = legal && Array.from({ length: m }, (_, j) => map.includes(j)).every(Boolean);
      const bijective = injective && surjective;
      const status = root.querySelector("[data-map-status]");
      status.className = `ch6-status ${legal ? "is-ok" : "is-bad"}`;
      status.textContent = legal ? "构成映射" : "尚未构成映射";
      root.querySelector("[data-map-title]").textContent = legal ? "先合法，再检查三项性质" : "有输入尚未指定输出";
      root.querySelector("[data-inj]").textContent = legal ? (injective ? "是" : "否") : "—";
      root.querySelector("[data-sur]").textContent = legal ? (surjective ? "是" : "否") : "—";
      root.querySelector("[data-bij]").textContent = legal ? (bijective ? "是" : "否") : "—";
      root.querySelector("[data-image]").textContent = `{${image.map((j) => names[j]).join(", ")}}`;
      root.querySelector("[data-assign]").innerHTML = map.map((j, i) => `<label>${i + 1} ↦ <select data-map-index="${i}"><option value="-1" ${j < 0 ? "selected" : ""}>未指定</option>${Array.from({ length: m }, (_, k) => `<option value="${k}" ${j === k ? "selected" : ""}>${names[k]}</option>`).join("")}</select></label>`).join("");
      root.querySelector("[data-y-buttons]").innerHTML = Array.from({ length: m }, (_, j) => `<button type="button" data-y="${j}" class="${j === selectedY ? "is-active" : ""}">${names[j]}</button>`).join("");
      const pre = map.map((j, i) => (j === selectedY ? i + 1 : null)).filter(Boolean);
      root.querySelector("[data-preimage]").textContent = `${names[selectedY]} 的原像 = ${pre.length ? `{${pre.join(", ")}}` : "∅"}`;
      root.querySelector("[data-inverse]").textContent = bijective ? names.slice(0, m).map((name, j) => `${name}↦${map.indexOf(j) + 1}`).join("，") : "只有双射才有从 Y 到 X 的逆映射。";
      root.querySelectorAll("[data-map-index]").forEach((sel) => sel.addEventListener("change", () => { map[Number(sel.dataset.mapIndex)] = Number(sel.value); render(); }));
      root.querySelectorAll("[data-y]").forEach((btn) => btn.addEventListener("click", () => { selectedY = Number(btn.dataset.y); render(); }));
    }

    root.querySelectorAll("[data-preset]").forEach((btn) => btn.addEventListener("click", () => {
      const p = presets[btn.dataset.preset];
      n = p.n; m = p.m; map = p.map.slice(); selectedY = 0;
      setActive(root, "[data-preset]", (el) => el === btn);
      render();
    }));
    nSelect.addEventListener("change", () => { n = Number(nSelect.value); render(); });
    mSelect.addEventListener("change", () => { m = Number(mSelect.value); render(); });
    render();
  }

  function mountClosureLab(root) {
    const cases = {
      r2: { label: "ℝ²", dimension: 2, u: [1, 0.5], v: [-0.5, 1], contains: () => true, zero: true, vectorSpace: true, note: "通常加法与数乘下的标准线性空间。" },
      line: { label: "过原点直线 y=x", dimension: 2, u: [1, 1], v: [-1.5, -1.5], contains: (z) => Math.abs(z[0] - z[1]) < 1e-8, zero: true, vectorSpace: true, note: "任意线性组合仍沿同一方向。" },
      affine: { label: "仿射直线 x+y=1", dimension: 2, u: [1, 0], v: [0, 1], contains: (z) => Math.abs(z[0] + z[1] - 1) < 1e-8, zero: false, vectorSpace: false, note: "零向量不在其中，且一般线性组合会离开。" },
      quadrant: { label: "第一象限", dimension: 2, u: [1, 0.5], v: [0.4, 1], contains: (z) => z[0] >= -1e-8 && z[1] >= -1e-8, zero: true, vectorSpace: false, note: "对负标量数乘不封闭，也缺少非零向量的加法逆元。" },
      rgb: { label: "RGB 颜色立方体 [0,1]³", dimension: 3, u: [0.8, 0.3, 0.4], v: [0.4, 0.8, 0.2], contains: (z) => z.every((x) => x >= -1e-8 && x <= 1 + 1e-8), zero: true, vectorSpace: false, note: "颜色值有上下界；负数或放大数乘会越界，因此它只是类比与反例。" },
    };
    let key = "r2";
    let alpha = 1;
    let beta = 1;
    root.innerHTML = lab(
      "线性组合封闭性实验室",
      "子空间判定可以压缩成一句：对任意 u、v 和标量 α、β，线性组合 αu+βv 仍在集合内。一个样本通过不代表全部通过，但一个反例足以否定。",
      `<div class="ch6-toolbar">${Object.entries(cases).map(([k, c]) => `<button type="button" data-case="${k}">${c.label}</button>`).join("")}</div>
       <div data-closure-viz></div>
       <div class="ch6-slider-row"><label>α = <span data-alpha-value></span></label><input type="range" min="-2" max="2" step="0.1" value="1" data-alpha></div>
       <div class="ch6-slider-row"><label>β = <span data-beta-value></span></label><input type="range" min="-2" max="2" step="0.1" value="1" data-beta></div>`,
      `<div class="ch6-readout"><strong data-case-title></strong><p class="ch6-muted" data-case-note></p><div class="ch6-vector-table" data-vectors></div></div>
       <div class="ch6-gates">${gate("u、v 在集合中", "members")}${gate("含零向量", "zero")}${gate("本次线性组合", "combo")}${gate("能否为线性空间", "space")}</div>
       <div class="ch6-readout"><strong>判定原则</strong><p class="ch6-muted">必须对所有标量成立。拖动 α、β 寻找反例；看到一次失败即可停止。</p></div>`,
    );

    function rgbBars(vec, label) {
      const names = ["R", "G", "B"];
      return `<div class="ch6-rgb-vector"><strong>${label} = ${fmtVec(vec)}</strong>${vec.map((x, i) => `<div class="ch6-channel"><span>${names[i]}</span><i><b style="width:${clamp(x, 0, 1) * 100}%"></b></i><em class="${x < 0 || x > 1 ? "is-out" : ""}">${fmt(x)}</em></div>`).join("")}</div>`;
    }

    function draw() {
      const C = cases[key];
      alpha = Number(root.querySelector("[data-alpha]").value);
      beta = Number(root.querySelector("[data-beta]").value);
      const z = C.u.map((x, i) => alpha * x + beta * C.v[i]);
      const members = C.contains(C.u) && C.contains(C.v);
      const combo = C.contains(z);
      root.querySelector("[data-alpha-value]").textContent = fmt(alpha, 1);
      root.querySelector("[data-beta-value]").textContent = fmt(beta, 1);
      root.querySelector("[data-case-title]").textContent = C.label;
      root.querySelector("[data-case-note]").textContent = C.note;
      root.querySelector("[data-vectors]").innerHTML = `<div><span>u</span><strong>${fmtVec(C.u)}</strong></div><div><span>v</span><strong>${fmtVec(C.v)}</strong></div><div><span>αu+βv</span><strong>${fmtVec(z)}</strong></div>`;
      setGate(root, "members", members, members ? "测试向量合法" : "先选集合内元素");
      setGate(root, "zero", C.zero, C.zero ? "0 在集合中" : "0 不在集合中");
      setGate(root, "combo", combo, combo ? "结果仍在集合" : `结果 ${fmtVec(z)} 越界`);
      setGate(root, "space", C.vectorSpace, C.vectorSpace ? "在通常运算下成立" : "存在反例");
      setActive(root, "[data-case]", (el) => el.dataset.case === key);
      if (C.dimension === 3) {
        root.querySelector("[data-closure-viz]").innerHTML = `<div class="ch6-rgb-board">${rgbBars(C.u, "u")}${rgbBars(C.v, "v")}${rgbBars(z, "αu+βv")}</div>`;
      } else {
        let inner = gridSvg();
        if (key === "line") inner += infiniteLineSvg([1, 1], "is-u", "y=x");
        if (key === "affine") inner += infiniteLineSvg([1, -1], "is-bad-line", "x+y=1", [0.5, 0.5]);
        if (key === "quadrant") inner += `<rect class="ch6-region" x="${sx(0)}" y="${sy(2.2)}" width="${sx(3.5) - sx(0)}" height="${sy(0) - sy(2.2)}"></rect>`;
        inner += arrowSvg([0,0], C.u, "is-u", "u") + arrowSvg([0,0], C.v, "is-w", "v") + arrowSvg([0,0], z, combo ? "is-result" : "is-bad", "αu+βv");
        root.querySelector("[data-closure-viz]").innerHTML = svgFrame(inner, `${C.label} 的封闭性实验`);
      }
    }
    root.querySelectorAll("[data-case]").forEach((btn) => btn.addEventListener("click", () => {
      key = btn.dataset.case;
      if (key === "line") { alpha = 1.2; beta = -0.4; }
      else if (key === "affine") { alpha = 1; beta = 1; }
      else if (key === "quadrant") { alpha = -1; beta = 0; }
      else if (key === "rgb") { alpha = 1; beta = 1; }
      else { alpha = 1; beta = 1; }
      root.querySelector("[data-alpha]").value = String(alpha);
      root.querySelector("[data-beta]").value = String(beta);
      draw();
    }));
    root.querySelector("[data-alpha]").addEventListener("input", draw);
    root.querySelector("[data-beta]").addEventListener("input", draw);
    draw();
  }

  function mountBasisLab(root) {
    let vectors = [[1,0], [0,1], [1,1]];
    let active = [true, true, true];
    let target = [1.4, 0.9];
    let order = [0,1];
    const presets = {
      minimal: { v: [[1,0],[0,1],[1,1]], a: [true,true,false] },
      redundant: { v: [[1,0],[0,1],[1,1]], a: [true,true,true] },
      line: { v: [[1,0.5],[2,1],[-1,-0.5]], a: [true,true,true] },
      zero: { v: [[1,0],[0,0],[0,1]], a: [true,true,false] },
    };
    root.innerHTML = lab(
      "生成组 → 去冗余 → 有序基 → 坐标",
      "“能生成”解决够不够，“线性无关”解决有没有冗余。只有二者同时成立，才是一组基。",
      `<div class="ch6-toolbar"><button type="button" data-preset="minimal">最小基</button><button type="button" data-preset="redundant">冗余生成组</button><button type="button" data-preset="line">只生成直线</button><button type="button" data-preset="zero">含零向量</button><button type="button" data-swap>交换基顺序</button></div>
       <div data-basis-svg></div>
       <div class="ch6-generator-switches" data-switches></div>
       <div class="ch6-two-sliders"><label>目标 v₁ <input type="range" min="-2.5" max="2.5" step="0.1" value="1.4" data-vx></label><label>目标 v₂ <input type="range" min="-2" max="2" step="0.1" value="0.9" data-vy></label></div>`,
      `<div class="ch6-gates">${gate("张成 ℝ²", "span")}${gate("线性无关", "indep")}${gate("是 ℝ² 的基", "basis")}${gate("坐标唯一", "unique")}</div>
       <div class="ch6-readout"><strong>当前结构</strong><div class="ch6-metric-grid">${metric("生成组大小", "count")}${metric("张成维数", "dim")}${metric("选定有序基", "ordered")}${metric("[v]B", "coord")}</div><p class="ch6-muted" data-basis-note></p></div>`,
    );

    function activeIdx() { return active.map((on,i) => on ? i : -1).filter((i) => i >= 0); }
    function independentPair(ids) {
      for (let i = 0; i < ids.length; i += 1) for (let j = i + 1; j < ids.length; j += 1) {
        if (Math.abs(M().cross(vectors[ids[i]], vectors[ids[j]])) > 1e-8) return [ids[i], ids[j]];
      }
      return null;
    }
    function rank(ids) {
      if (!ids.length || ids.every((i) => M().norm(vectors[i]) < 1e-8)) return 0;
      return independentPair(ids) ? 2 : 1;
    }
    function draw() {
      target = [Number(root.querySelector("[data-vx]").value), Number(root.querySelector("[data-vy]").value)];
      const ids = activeIdx();
      const dim = rank(ids);
      const pair = independentPair(ids);
      if (pair && (!order.every((i) => ids.includes(i)) || Math.abs(M().cross(vectors[order[0]], vectors[order[1]])) < 1e-8)) order = pair.slice();
      const isIndependent = ids.length === dim;
      const spans = dim === 2;
      const isBasis = spans && isIndependent;
      const B = pair ? M().columnsMatrix(vectors[order[0]], vectors[order[1]]) : null;
      const coord = B ? M().solve2(B, target) : null;
      let inner = gridSvg();
      if (dim === 2) inner += `<rect class="ch6-span-plane" x="20" y="18" width="520" height="304"></rect>`;
      if (dim === 1) inner += infiniteLineSvg(vectors[ids.find((i) => M().norm(vectors[i]) > 1e-8)], "is-u", "span");
      ids.forEach((i) => { inner += arrowSvg([0,0], vectors[i], `is-g${i+1}`, `g${i+1}`); });
      inner += arrowSvg([0,0], target, "is-target", "v");
      if (coord && spans) {
        const p = M().scale(vectors[order[0]], coord[0]);
        inner += arrowSvg([0,0], p, "is-u-soft", `${fmt(coord[0])}b₁`) + arrowSvg(p, target, "is-w-soft", `${fmt(coord[1])}b₂`);
      }
      root.querySelector("[data-basis-svg]").innerHTML = svgFrame(inner, "生成组、基和坐标图");
      root.querySelector("[data-switches]").innerHTML = vectors.map((v,i) => `<label class="ch6-check"><input type="checkbox" data-generator="${i}" ${active[i] ? "checked" : ""}><span>g${i+1}=${fmtVec(v)}</span></label>`).join("");
      setGate(root, "span", spans, spans ? "覆盖整个平面" : dim === 1 ? "只覆盖一条直线" : "只有零向量");
      setGate(root, "indep", isIndependent, isIndependent ? "没有冗余" : "存在冗余或零向量");
      setGate(root, "basis", isBasis, isBasis ? "生成且无关" : "两个条件未同时成立");
      setGate(root, "unique", Boolean(coord), coord ? "相对选定基唯一" : "还没有可用的平面基");
      root.querySelector("[data-count]").textContent = String(ids.length);
      root.querySelector("[data-dim]").textContent = String(dim);
      root.querySelector("[data-ordered]").textContent = pair ? `(g${order[0]+1}, g${order[1]+1})` : "—";
      root.querySelector("[data-coord]").textContent = coord ? fmtVec(coord) : "—";
      root.querySelector("[data-basis-note]").textContent = isBasis ? "当前激活向量本身就是一组基。" : spans ? "它能生成平面，但需删去冗余向量后才得到基。" : "先补充第二个独立方向。";
      root.querySelectorAll("[data-generator]").forEach((cb) => cb.addEventListener("change", () => { active[Number(cb.dataset.generator)] = cb.checked; draw(); }));
    }
    root.querySelectorAll("[data-preset]").forEach((btn) => btn.addEventListener("click", () => { const p = presets[btn.dataset.preset]; vectors = p.v.map((v) => v.slice()); active = p.a.slice(); order = [0,1]; setActive(root,"[data-preset]",(el)=>el===btn); draw(); }));
    root.querySelector("[data-swap]").addEventListener("click", () => { order = [order[1], order[0]]; draw(); });
    root.querySelector("[data-vx]").addEventListener("input", draw);
    root.querySelector("[data-vy]").addEventListener("input", draw);
    draw();
  }

  function mountBasisChangeLab(root) {
    const U = [[1,0],[0,1]];
    let W = [[1,0.45],[-0.25,1]];
    let v = [1.5,1.0];
    let mode = "passive";
    let A = [[1.1,0.55],[-0.15,0.85]];
    let roundMessage = "";
    root.innerHTML = lab(
      "同一向量，新坐标——主动与被动彻底分开",
      "被动换基中，黑色向量 v 的端点固定；改变的是基 W、网格和坐标。主动模式才真正把 v 送到 Av。",
      `<div class="ch6-toolbar"><button type="button" data-mode="passive">被动换基</button><button type="button" data-mode="active">主动变换</button><span class="ch6-toolbar-sep"></span><button type="button" data-wpreset="same">W=U</button><button type="button" data-wpreset="shear">剪切基</button><button type="button" data-wpreset="rotate">旋转基</button><button type="button" data-wpreset="near">接近退化</button></div>
       <div data-change-svg></div>
       <div data-passive-controls>
         <div class="ch6-basis-sliders"><label>w₁₁<input type="range" min="-1.5" max="1.5" step="0.05" data-w00></label><label>w₂₁<input type="range" min="-1.5" max="1.5" step="0.05" data-w10></label><label>w₁₂<input type="range" min="-1.5" max="1.5" step="0.05" data-w01></label><label>w₂₂<input type="range" min="-1.5" max="1.5" step="0.05" data-w11></label></div>
       </div>
       <div class="ch6-two-sliders"><label>v₁<input type="range" min="-2.4" max="2.4" step="0.1" value="1.5" data-vx></label><label>v₂<input type="range" min="-1.8" max="1.8" step="0.1" value="1" data-vy></label></div>`,
      `<div class="ch6-readout" data-passive-readout><strong>被动换基：Ux = v = Wy</strong><div class="ch6-metric-grid">${metric("[v]U = x", "x")}${metric("[v]W = y", "y")}${metric("P(W←U)", "p")}${metric("det W", "detw")}</div><button type="button" class="button" data-roundtrip>验证坐标往返</button><p class="ch6-muted" data-round-note></p></div>
       <div class="ch6-readout" data-active-readout hidden><strong>主动变换：v ↦ Av</strong><div class="ch6-metric-grid">${metric("v", "av-v")}${metric("Av", "av-out")}${metric("A", "av-a")}${metric("对象是否移动", "av-moved", "是")}</div><p class="ch6-muted">这里没有“过渡矩阵”：基保持不动，变化的是几何向量。</p></div>
       <div class="ch6-verdict" data-basis-verdict></div>`,
      "ch6-basis-change",
    );
    const sliders = {
      w00: root.querySelector("[data-w00]"), w10: root.querySelector("[data-w10]"), w01: root.querySelector("[data-w01]"), w11: root.querySelector("[data-w11]"),
    };
    function syncSliders() {
      sliders.w00.value = W[0][0]; sliders.w10.value = W[1][0]; sliders.w01.value = W[0][1]; sliders.w11.value = W[1][1];
    }
    function lattice(B, cls) {
      const b1 = [B[0][0],B[1][0]], b2=[B[0][1],B[1][1]];
      let s="";
      for(let k=-4;k<=4;k+=1){
        const a=M().add(M().scale(b1,-4),M().scale(b2,k)); const b=M().add(M().scale(b1,4),M().scale(b2,k));
        const c=M().add(M().scale(b2,-4),M().scale(b1,k)); const d=M().add(M().scale(b2,4),M().scale(b1,k));
        s+=`<line class="ch6-basis-grid ${cls}" x1="${sx(a[0])}" y1="${sy(a[1])}" x2="${sx(b[0])}" y2="${sy(b[1])}"></line><line class="ch6-basis-grid ${cls}" x1="${sx(c[0])}" y1="${sy(c[1])}" x2="${sx(d[0])}" y2="${sy(d[1])}"></line>`;
      }
      return s;
    }
    function draw() {
      v=[Number(root.querySelector("[data-vx]").value),Number(root.querySelector("[data-vy]").value)];
      if(mode==="passive") W=[[Number(sliders.w00.value),Number(sliders.w01.value)],[Number(sliders.w10.value),Number(sliders.w11.value)]];
      const invW=M().inv2(W); const detW=M().det2(W); const x=v.slice(); const y=invW?M().matVec(invW,v):null; const P=invW;
      let inner=gridSvg();
      if(mode==="passive"){
        inner+=lattice(U,"is-u-grid")+lattice(W,"is-w-grid");
        inner+=arrowSvg([0,0],[1,0],"is-u","u₁")+arrowSvg([0,0],[0,1],"is-u2","u₂")+arrowSvg([0,0],[W[0][0],W[1][0]],"is-w","w₁")+arrowSvg([0,0],[W[0][1],W[1][1]],"is-w2","w₂")+arrowSvg([0,0],v,"is-target","v（固定）");
      }else{
        const Av=M().matVec(A,v); inner+=lattice(U,"is-u-grid")+arrowSvg([0,0],v,"is-target-soft","v")+arrowSvg([0,0],Av,"is-target","Av");
        root.querySelector("[data-av-v]").textContent=fmtVec(v); root.querySelector("[data-av-out]").textContent=fmtVec(Av); root.querySelector("[data-av-a]").textContent=fmtMat(A);
      }
      root.querySelector("[data-change-svg]").innerHTML=svgFrame(inner,mode==="passive"?"同一向量在两组基下的坐标":"主动线性变换");
      root.querySelector("[data-passive-controls]").hidden=mode!=="passive"; root.querySelector("[data-passive-readout]").hidden=mode!=="passive"; root.querySelector("[data-active-readout]").hidden=mode!=="active";
      if(mode==="passive"){
        root.querySelector("[data-x]").textContent=fmtVec(x); root.querySelector("[data-y]").textContent=y?fmtVec(y):"—"; root.querySelector("[data-p]").textContent=P?fmtMat(P):"—"; root.querySelector("[data-detw]").textContent=fmt(detW,3);
        const verdict=root.querySelector("[data-basis-verdict]"); verdict.className=`ch6-verdict ${invW?"is-ok":"is-bad"}`; verdict.innerHTML=invW?`<strong>W 是一组基</strong><span>y=W⁻¹v，且 Wy=v；几何向量没有移动。</span>`:`<strong>W 已退化</strong><span>两列相关时不再是基，坐标不再唯一，过渡矩阵不存在。</span>`;
        root.querySelector("[data-roundtrip]").disabled=!invW; root.querySelector("[data-round-note]").textContent=roundMessage;
      }else{
        const verdict=root.querySelector("[data-basis-verdict]"); verdict.className="ch6-verdict is-warn"; verdict.innerHTML="<strong>现在是主动过程</strong><span>黑色箭头从 v 移到 Av；不要把这一步称为纯换基。</span>";
      }
      setActive(root,"[data-mode]",(el)=>el.dataset.mode===mode);
    }
    Object.entries(sliders).forEach(([,el])=>el.addEventListener("input",()=>{roundMessage="";draw();}));
    root.querySelector("[data-vx]").addEventListener("input",draw); root.querySelector("[data-vy]").addEventListener("input",draw);
    root.querySelectorAll("[data-mode]").forEach((btn)=>btn.addEventListener("click",()=>{mode=btn.dataset.mode;roundMessage="";draw();}));
    root.querySelectorAll("[data-wpreset]").forEach((btn)=>btn.addEventListener("click",()=>{
      const k=btn.dataset.wpreset;
      if(k==="same")W=[[1,0],[0,1]];
      if(k==="shear")W=[[1,0.25],[0.5,1]];
      if(k==="rotate"){const c=Math.SQRT1_2;W=[[c,-c],[c,c]];}
      if(k==="near")W=[[1,1],[0.35,0.351]];
      mode="passive";roundMessage="";syncSliders();draw();
    }));
    root.querySelector("[data-roundtrip]").addEventListener("click",()=>{
      const invW=M().inv2(W); if(!invW)return;
      const Q=W; const I=M().mul2(Q,invW); roundMessage=`P(U←W)P(W←U) = ${fmtMat(I,3)}；坐标往返恢复。`; draw();
    });
    syncSliders(); draw();
  }

  function mountSubspaceLab(root) {
    let key="line"; let offset=0;
    const cards={
      line:{label:"直线 x−y=t",kind:"line"},hom:{label:"齐次平面 x+y+z=0",zero:true,add:true,scale:true,note:"齐次线性方程的解集。"},aff:{label:"仿射平面 x+y+z=1",zero:false,add:false,scale:false,note:"特解加齐次解空间；形状是平面，但不过零。"},quadrant:{label:"第一象限",zero:true,add:true,scale:false,note:"负标量会离开集合。"},pzero:{label:"P₂ 中常数项为 0",zero:true,add:true,scale:true,note:"条件在线性组合下保持。"},pone:{label:"P₂ 中常数项为 1",zero:false,add:false,scale:false,note:"零多项式不在其中。"},
    };
    root.innerHTML=lab("子空间判定：先看零，再看线性组合","几何形状相同不代表线性结构相同。过原点是醒目的必要条件，最终判定仍是对任意 αu+βv 封闭。",
      `<div class="ch6-toolbar">${Object.entries(cards).map(([k,c])=>`<button type="button" data-case="${k}">${c.label}</button>`).join("")}</div><div data-subspace-viz></div><div class="ch6-slider-row" data-offset-row><label>平移量 t = <span data-offset-value>0</span></label><input type="range" min="-1.5" max="1.5" step="0.05" value="0" data-offset></div>`,
      `<div class="ch6-gates">${gate("含零向量","s-zero")}${gate("加法封闭","s-add")}${gate("数乘封闭","s-scale")}${gate("统一判定","s-final")}</div><div class="ch6-readout"><strong data-sub-title></strong><p class="ch6-muted" data-sub-note></p><p class="ch6-muted"><b>统一判定：</b>任意 u,v∈U 与标量 α,β 都满足 αu+βv∈U。</p></div>`);
    function draw(){
      const C=cards[key]; offset=Number(root.querySelector("[data-offset]").value); root.querySelector("[data-offset-value]").textContent=fmt(offset,2); root.querySelector("[data-offset-row]").hidden=key!=="line";
      let zero,add,scale,note,title,visual;
      if(key==="line"){
        const pass=Math.abs(offset)<1e-9; zero=add=scale=pass; title=pass?"过原点直线：一维子空间":"平移直线：仿射集合"; note=pass?"它可写成 span{(1,1)}。":"零向量不在其中；同方向但平移后的直线不继承线性结构。";
        let inner=gridSvg()+infiniteLineSvg([1,1],pass?"is-u":"is-bad-line","x−y=t",[offset/2,-offset/2]); inner+=`<circle class="ch6-origin-dot" cx="${sx(0)}" cy="${sy(0)}" r="5"></circle><text class="ch6-svg-label" x="${sx(0)+8}" y="${sy(0)-8}">0</text>`; visual=svgFrame(inner,"直线平移与子空间判定");
      }else{
        zero=C.zero;add=C.add;scale=C.scale;title=C.label;note=C.note;
        visual=`<div class="ch6-structure-card ${zero&&add&&scale?"is-ok":"is-bad"}"><div class="ch6-structure-symbol">${key.startsWith("p")?"P₂":key==="quadrant"?"↗":"Π"}</div><div><strong>${C.label}</strong><p>${C.note}</p></div></div>`;
      }
      root.querySelector("[data-subspace-viz]").innerHTML=visual; setGate(root,"s-zero",zero,zero?"0∈U":"0∉U"); setGate(root,"s-add",add,add?"u+v 仍在 U":"可找到反例"); setGate(root,"s-scale",scale,scale?"αu 仍在 U":"可找到反例"); setGate(root,"s-final",zero&&add&&scale,zero&&add&&scale?"是线性子空间":"不是线性子空间"); root.querySelector("[data-sub-title]").textContent=title; root.querySelector("[data-sub-note]").textContent=note; setActive(root,"[data-case]",el=>el.dataset.case===key);
    }
    root.querySelectorAll("[data-case]").forEach(btn=>btn.addEventListener("click",()=>{key=btn.dataset.case;draw();})); root.querySelector("[data-offset]").addEventListener("input",draw); draw();
  }

  function mountIntersectionLab(root) {
    const cases={
      distinct:{label:"ℝ² 中两条不同直线",du:1,dw:1,di:0,ds:2,intersection:"{0}",sum:"ℝ²",kind:"lines"},
      same:{label:"同一条直线",du:1,dw:1,di:1,ds:1,intersection:"U=W",sum:"同一条直线",kind:"same"},
      contained:{label:"ℝ³ 中直线 U⊂平面 W",du:1,dw:2,di:1,ds:2,intersection:"U",sum:"W",kind:"contain"},
      planes:{label:"ℝ³ 中两个不同平面",du:2,dw:2,di:1,ds:3,intersection:"一条直线",sum:"ℝ³",kind:"planes"},
      complement:{label:"ℝ⁴ 中两个互补二维子空间",du:2,dw:2,di:0,ds:4,intersection:"{0}",sum:"ℝ⁴",kind:"blocks"},
    }; let key="distinct"; let a=1,b=1;
    root.innerHTML=lab("交收集公共方向，和收集全部 u+w","维数账本不是记忆口诀：dim U 与 dim W 把公共方向算了两次，所以必须减去 dim(U∩W)。",
      `<div class="ch6-toolbar">${Object.entries(cases).map(([k,c])=>`<button type="button" data-case="${k}">${c.label}</button>`).join("")}</div><div data-sum-viz></div><div class="ch6-two-sliders" data-mixer><label>u 方向系数 a<input type="range" min="-2" max="2" step="0.1" value="1" data-a></label><label>w 方向系数 b<input type="range" min="-2" max="2" step="0.1" value="1" data-b></label></div>`,
      `<div class="ch6-readout"><strong data-sum-title></strong><div class="ch6-metric-grid">${metric("dim U","du")}${metric("dim W","dw")}${metric("dim(U∩W)","di")}${metric("dim(U+W)","ds")}</div><div class="ch6-dimension-equation" data-dim-eq></div></div><div class="ch6-readout"><strong>结构结论</strong><p class="ch6-muted" data-intersection></p><p class="ch6-muted" data-sum></p><p class="ch6-muted">U+W 是所有 u+w 的集合，通常严格大于 U∪W。</p></div><div class="ch6-readout"><strong>本节代表例题的精确结果</strong><p class="ch6-muted">U∩W=span{(1,0,1)ᵀ}；U+W 可取基 {(1,0,1)ᵀ,(0,1,1)ᵀ,(1,1,0)ᵀ}。</p></div>`);
    function schematic(C){
      if(C.kind==="lines"){
        const u=[1,0.35],w=[0.25,1],z=M().add(M().scale(u,a),M().scale(w,b)); return svgFrame(gridSvg()+`<rect class="ch6-span-plane" x="20" y="18" width="520" height="304"></rect>`+infiniteLineSvg(u,"is-u","U")+infiniteLineSvg(w,"is-w","W")+arrowSvg([0,0],M().scale(u,a),"is-u","u")+arrowSvg(M().scale(u,a),z,"is-w","w")+arrowSvg([0,0],z,"is-result","u+w"),"两直线的交与和");
      }
      if(C.kind==="same") return svgFrame(gridSvg()+infiniteLineSvg([1,0.4],"is-overlap","U=W")+arrowSvg([0,0],[1.2,0.48],"is-result","u+w"),"相同直线的交与和");
      const labels={contain:["U 是 W 内的一条直线","U∩W=U，U+W=W"],planes:["两个平面共享一条直线","公共直线只计算一次"],blocks:["两个二维块没有公共非零方向","维数相加得到 4"]}[C.kind];
      return `<div class="ch6-schematic"><div class="ch6-schematic-shape is-u">U<br><small>dim ${C.du}</small></div><div class="ch6-schematic-overlap">${C.intersection}</div><div class="ch6-schematic-shape is-w">W<br><small>dim ${C.dw}</small></div><strong>${labels[0]}</strong><p>${labels[1]}</p></div>`;
    }
    function draw(){const C=cases[key];a=Number(root.querySelector("[data-a]").value);b=Number(root.querySelector("[data-b]").value);root.querySelector("[data-mixer]").hidden=!(["lines","same"].includes(C.kind));root.querySelector("[data-sum-viz]").innerHTML=schematic(C);root.querySelector("[data-sum-title]").textContent=C.label;["du","dw","di","ds"].forEach(k=>root.querySelector(`[data-${k}]`).textContent=C[k]);root.querySelector("[data-dim-eq]").textContent=`${C.du} + ${C.dw} − ${C.di} = ${C.ds}`;root.querySelector("[data-intersection]").textContent=`交空间：${C.intersection}。`;root.querySelector("[data-sum]").textContent=`和空间：${C.sum}。`;setActive(root,"[data-case]",el=>el.dataset.case===key);}
    root.querySelectorAll("[data-case]").forEach(btn=>btn.addEventListener("click",()=>{key=btn.dataset.case;draw();}));root.querySelector("[data-a]").addEventListener("input",draw);root.querySelector("[data-b]").addEventListener("input",draw);draw();
  }

  function mountDirectSumLab(root) {
    const cases={
      oblique:{label:"非正交直和",u:[1,0.25],w:[0.3,1],V:"ℝ²",cover:true,zero:true,kind:"independent"},
      orthogonal:{label:"正交直和",u:[1,0],w:[0,1],V:"ℝ²",cover:true,zero:true,kind:"independent"},
      overlap:{label:"覆盖但不唯一",u:[1,0.45],w:[1,0.45],V:"共同直线",cover:true,zero:false,kind:"overlap"},
      incomplete:{label:"零交但未覆盖",u:[1,0.2],w:[0,0],V:"ℝ²",cover:false,zero:true,kind:"incomplete"},
    }; let key="oblique";let target=[1.45,1];let t=0;
    root.innerHTML=lab("直和闸门：覆盖与零交必须同时通过","“不垂直”完全可以直和；“交为零”也不够，还要覆盖目标空间。唯一分解正好等价于这两个条件同时成立。",
      `<div class="ch6-toolbar">${Object.entries(cases).map(([k,c])=>`<button type="button" data-case="${k}">${c.label}</button>`).join("")}</div><div data-direct-svg></div><div class="ch6-slider-row" data-t-row><label>公共方向搬运参数 t = <span data-t-value>0</span></label><input type="range" min="-1.5" max="1.5" step="0.1" value="0" data-t></div><div class="ch6-two-sliders" data-target-row><label>目标 v₁<input type="range" min="-2.3" max="2.3" step="0.1" value="1.45" data-vx></label><label>目标 v₂<input type="range" min="-1.8" max="1.8" step="0.1" value="1" data-vy></label></div>`,
      `<div class="ch6-gates">${gate("覆盖 V=U+W","cover")}${gate("零交 U∩W={0}","zero-inter")}${gate("每个 v 可分解","exists")}${gate("分解唯一","unique-decomp")}</div><div class="ch6-readout"><strong data-direct-title></strong><div class="ch6-metric-grid">${metric("u 分量","ucomp")}${metric("w 分量","wcomp")}${metric("目标 v","target")}${metric("结论","direct-result")}</div><p class="ch6-muted" data-direct-note></p></div>`);
    function draw(){const C=cases[key];target=[Number(root.querySelector("[data-vx]").value),Number(root.querySelector("[data-vy]").value)];t=Number(root.querySelector("[data-t]").value);let exists=false,unique=false,uc=[0,0],wc=[0,0],v=target;
      if(C.kind==="independent"){const coef=M().solve2(M().columnsMatrix(C.u,C.w),v);exists=Boolean(coef);unique=exists;uc=M().scale(C.u,coef[0]);wc=M().scale(C.w,coef[1]);}
      if(C.kind==="overlap"){const z=C.u;const coeff=M().dot(v,z)/M().dot(z,z);v=M().scale(z,coeff);root.querySelector("[data-vx]").value=String(clamp(v[0],-2.3,2.3));root.querySelector("[data-vy]").value=String(clamp(v[1],-1.8,1.8));exists=true;unique=false;uc=M().scale(z,coeff+t);wc=M().scale(z,-t);}
      if(C.kind==="incomplete"){const cross=Math.abs(M().cross(C.u,v));exists=cross<1e-6;unique=exists;if(exists){const c=M().dot(v,C.u)/M().dot(C.u,C.u);uc=M().scale(C.u,c);}wc=[0,0];}
      let inner=gridSvg()+infiniteLineSvg(C.u,"is-u","U");if(M().norm(C.w)>1e-8)inner+=infiniteLineSvg(C.w,C.zero?"is-w":"is-overlap","W");inner+=arrowSvg([0,0],uc,"is-u","u")+arrowSvg(uc,v,"is-w","w")+arrowSvg([0,0],v,"is-target","v");root.querySelector("[data-direct-svg]").innerHTML=svgFrame(inner,"直和分解实验");
      setGate(root,"cover",C.cover,C.cover?`U+W=${C.V}`:`U+W 只是 U`);setGate(root,"zero-inter",C.zero,C.zero?"没有公共非零方向":"共享一整条方向");setGate(root,"exists",exists,exists?"当前 v 有分解":"当前 v 不在 U+W");setGate(root,"unique-decomp",unique,unique?"唯一":"不唯一或不存在");root.querySelector("[data-direct-title]").textContent=C.cover&&C.zero?`${C.V}=U⊕W`:"不能写成目标空间的直和";root.querySelector("[data-ucomp]").textContent=exists?fmtVec(uc):"—";root.querySelector("[data-wcomp]").textContent=exists?fmtVec(wc):"—";root.querySelector("[data-target]").textContent=fmtVec(v);root.querySelector("[data-direct-result]").textContent=C.cover&&C.zero?"⊕":"+";root.querySelector("[data-direct-note]").textContent=C.kind==="overlap"?"拖动 t：v=(u+tz)+(w−tz)，总和不变而分量不断变化。":C.kind==="incomplete"?"交为零只保证“若分解存在则唯一”，并不能保证每个 v 都能分解。":C.kind==="orthogonal"?"正交只是一种更强、更方便的直和。":"两方向不垂直，但仍覆盖且零交，所以分解唯一。";root.querySelector("[data-t-row]").hidden=C.kind!=="overlap";root.querySelector("[data-target-row]").hidden=C.kind==="overlap";root.querySelector("[data-t-value]").textContent=fmt(t,1);setActive(root,"[data-case]",el=>el.dataset.case===key);
    }
    root.querySelectorAll("[data-case]").forEach(btn=>btn.addEventListener("click",()=>{key=btn.dataset.case;t=0;root.querySelector("[data-t]").value="0";if(key==="overlap"){target=[1.4,0.63];}else{target=[1.45,1];root.querySelector("[data-vx]").value="1.45";root.querySelector("[data-vy]").value="1";}draw();}));root.querySelector("[data-t]").addEventListener("input",draw);root.querySelector("[data-vx]").addEventListener("input",draw);root.querySelector("[data-vy]").addEventListener("input",draw);draw();
  }

  function mountIsoLab(root) {
    let basis="std";let mode="iso";let alpha=1.2,beta=-0.6;const f=[1,-0.5,0.8],g=[-0.4,1.1,0.3];
    root.innerHTML=lab("结构桥：真正检查“线性 + 双射”","同维数说明“存在某个同构”，不说明任意规则都是同构。这里把运算保持与可逆性分开验收。",
      `<div class="ch6-toolbar"><button type="button" data-mode="iso">坐标同构</button><button type="button" data-mode="projection">线性但非双射</button><button type="button" data-mode="nonlinear">双射候选但非线性</button><span class="ch6-toolbar-sep"></span><button type="button" data-basis="std">基 (1,x,x²)</button><button type="button" data-basis="shift">基 (1,1+x,x²)</button></div><div class="ch6-iso-bridge" data-bridge></div><div class="ch6-two-sliders"><label>α = <span data-alpha-value></span><input type="range" min="-2" max="2" step="0.1" value="1.2" data-alpha></label><label>β = <span data-beta-value></span><input type="range" min="-2" max="2" step="0.1" value="-0.6" data-beta></label></div>`,
      `<div class="ch6-gates">${gate("保持加法与数乘","linear")}${gate("单射","iso-inj")}${gate("满射到声明陪域","iso-sur")}${gate("线性同构","iso-final")}</div><div class="ch6-readout"><strong>运算保持实测</strong><div class="ch6-metric-grid">${metric("h=αf+βg","poly-h")}${metric("T(h)","th")}${metric("αT(f)+βT(g)","combo-coord")}${metric("逆映射","iso-inverse")}</div><p class="ch6-muted" data-iso-note></p></div>`);
    function coordStd(p){return p.slice();}function coordShift(p){return [p[0]-p[1],p[1],p[2]];}function coord(p){return basis==="std"?coordStd(p):coordShift(p);}function poly(p){const term=(x,name)=>`${x<0?"−":"+"} ${fmt(Math.abs(x),1)}${name}`;return `${fmt(p[0],1)} ${term(p[1],"x")} ${term(p[2],"x²")}`;}
    function T(p){if(mode==="projection")return coord(p).slice(0,2);if(mode==="nonlinear"){const c=coord(p);return [c[0],c[1],c[2]*c[2]];}return coord(p);}function arrAdd(a,b){return a.map((x,i)=>x+b[i]);}function arrScale(a,s){return a.map(x=>s*x);}function equal(a,b){return a.length===b.length&&a.every((x,i)=>Math.abs(x-b[i])<1e-8);}
    function draw(){alpha=Number(root.querySelector("[data-alpha]").value);beta=Number(root.querySelector("[data-beta]").value);const h=arrAdd(arrScale(f,alpha),arrScale(g,beta));const th=T(h);const combo=arrAdd(arrScale(T(f),alpha),arrScale(T(g),beta));const linear=equal(th,combo);const inj=mode!=="projection";const sur=mode==="iso";const iso=linear&&inj&&sur;setGate(root,"linear",linear,linear?"两边坐标一致":"运算不保持");setGate(root,"iso-inj",inj,inj?"核只有 0 / 可恢复":"x² 系数被丢失");setGate(root,"iso-sur",sur,sur?"每个目标坐标都有原像":mode==="projection"?"陪域若声明为 ℝ² 则满，但仍非单射":"平方坐标不能覆盖负数");setGate(root,"iso-final",iso,iso?"线性且双射":"至少一项失败");root.querySelector("[data-alpha-value]").textContent=fmt(alpha,1);root.querySelector("[data-beta-value]").textContent=fmt(beta,1);root.querySelector("[data-poly-h]").textContent=poly(h);root.querySelector("[data-th]").textContent=fmtVec(th);root.querySelector("[data-combo-coord]").textContent=fmtVec(combo);root.querySelector("[data-iso-inverse]").textContent=iso?(basis==="std"?"(a,b,c)↦a+bx+cx²":"(r,s,t)↦(r+s)+sx+tx²"):"不存在同构逆";root.querySelector("[data-bridge]").innerHTML=`<div class="ch6-bridge-node"><span>P₂</span><strong>${poly(h)}</strong></div><div class="ch6-bridge-arrow ${iso?"is-ok":"is-bad"}"><b>T</b><small>${mode==="iso"?"线性双射":mode==="projection"?"丢失 x² 系数":"末坐标平方"}</small></div><div class="ch6-bridge-node"><span>${mode==="projection"?"ℝ²":"ℝ³"}</span><strong>${fmtVec(th)}</strong></div>`;root.querySelector("[data-iso-note]").textContent=mode==="iso"?`选基 ${basis==="std"?"(1,x,x²)":"(1,1+x,x²)"} 得到一个坐标同构；换基会改变具体同构，但不改变“存在同构”的事实。`:mode==="projection"?"这是线性映射，但不同多项式可能有同一输出，因此不是同构。":"末坐标平方破坏线性，也不能覆盖负的第三坐标。";setActive(root,"[data-mode]",el=>el.dataset.mode===mode);setActive(root,"[data-basis]",el=>el.dataset.basis===basis);}
    root.querySelectorAll("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>{mode=btn.dataset.mode;draw();}));root.querySelectorAll("[data-basis]").forEach(btn=>btn.addEventListener("click",()=>{basis=btn.dataset.basis;draw();}));root.querySelector("[data-alpha]").addEventListener("input",draw);root.querySelector("[data-beta]").addEventListener("input",draw);draw();
  }

  renderer("sets-maps", mountMapLab);
  renderer("vector-space-definition", mountClosureLab);
  renderer("basis-coordinates", mountBasisLab);
  renderer("change-of-basis", mountBasisChangeLab);
  renderer("subspaces", mountSubspaceLab);
  renderer("intersection-sum", mountIntersectionLab);
  renderer("direct-sum", mountDirectSumLab);
  renderer("isomorphism", mountIsoLab);
})();
