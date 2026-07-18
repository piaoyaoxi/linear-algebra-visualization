/* Chapter 1 visual stories: geometry first, exact workbench second. */
(() => {
  "use strict";

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  const line = (x1, y1, x2, y2, cls = "story-line", extra = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" ${extra}/>`;
  const circle = (cx, cy, r, cls = "story-node", label = "") => `<g class="${cls}"><circle cx="${cx}" cy="${cy}" r="${r}"/>${label ? `<text x="${cx}" y="${cy + 5}" text-anchor="middle">${label}</text>` : ""}</g>`;
  const pill = (x, y, w, text, cls = "story-pill") => `<g class="${cls}"><rect x="${x}" y="${y}" width="${w}" height="34" rx="17"/><text x="${x + w / 2}" y="${y + 22}" text-anchor="middle">${text}</text></g>`;
  const arrowDefs = () => `<defs>
      <marker id="ch1-story-arrow" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z"/></marker>
      <filter id="ch1-story-soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6"/></filter>
      <linearGradient id="ch1-story-surface" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#192b42"/><stop offset="1" stop-color="#0b1322"/></linearGradient>
    </defs>`;

  function svg(label, body, viewBox = "0 0 900 500") {
    return `<svg viewBox="${viewBox}" role="img" aria-label="${esc(label)}" preserveAspectRatio="xMidYMid meet">${arrowDefs()}${body}</svg>`;
  }

  function graphPath(fn, { xMin = -3, xMax = 3, yMin = -4, yMax = 4, width = 780, height = 330, left = 60, top = 60 } = {}) {
    const points = [];
    for (let i = 0; i <= 180; i += 1) {
      const x = xMin + ((xMax - xMin) * i) / 180;
      const y = clamp(fn(x), yMin, yMax);
      const px = left + ((x - xMin) / (xMax - xMin)) * width;
      const py = top + height - ((y - yMin) / (yMax - yMin)) * height;
      points.push(`${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return points.join(" ");
  }

  const stories = {
    "number-fields": {
      title: "数域不是一串名字，而是一层层稳定的运算空间",
      intro: "先看一个数落在哪一层，再看运算之后它是否仍留在这一层。包含关系与封闭性同时出现，数域才真正有意义。",
      controls: [
        { value: "Z", label: "整数 ℤ" }, { value: "Q", label: "有理数 ℚ" }, { value: "R", label: "实数 ℝ" }, { value: "C", label: "复数 ℂ" },
      ],
      initial: { mode: "Q" },
      render(state) {
        const layers = [
          { key: "C", x: 105, y: 55, w: 690, h: 360, label: "ℂ", note: "a+bi" },
          { key: "R", x: 165, y: 100, w: 570, h: 270, label: "ℝ", note: "实轴" },
          { key: "Q", x: 230, y: 145, w: 440, h: 180, label: "ℚ", note: "p/q" },
          { key: "Z", x: 310, y: 190, w: 280, h: 90, label: "ℤ", note: "…,-1,0,1,…" },
        ];
        const mode = state.mode;
        const operations = mode === "Z" ? ["1+2=3", "1-2=-1", "1×2=2", "1÷2=1/2  ↗"] : mode === "Q" ? ["1/2+1/3=5/6", "2/3÷4/5=5/6"] : mode === "R" ? ["√2×√2=2", "1/√2=√2/2"] : ["i²=-1", "1/i=-i"];
        const tokens = [
          { x: 450, y: 235, t: "2", layer: "Z" }, { x: 365, y: 290, t: "1/2", layer: "Q" }, { x: 600, y: 335, t: "√2", layer: "R" }, { x: 720, y: 88, t: "i", layer: "C" },
        ];
        const body = `<rect x="0" y="0" width="900" height="500" rx="28" fill="url(#ch1-story-surface)"/>
          <circle cx="680" cy="90" r="70" class="story-glow" filter="url(#ch1-story-soft)"/>
          ${layers.map((l) => `<g class="story-field-layer ${l.key === mode ? "is-active" : ""}"><rect x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" rx="30"/><text x="${l.x + 28}" y="${l.y + 38}" class="story-field-symbol">${l.label}</text><text x="${l.x + l.w - 28}" y="${l.y + 36}" text-anchor="end" class="story-field-note">${l.note}</text></g>`).join("")}
          ${tokens.map((n) => `<g class="story-number-token ${n.layer === mode ? "is-focus" : ""}"><circle cx="${n.x}" cy="${n.y}" r="25"/><text x="${n.x}" y="${n.y + 6}" text-anchor="middle">${n.t}</text></g>`).join("")}
          <g transform="translate(90 435)">${operations.map((op, i) => pill(i * 190, 0, 174, op, op.includes("↗") ? "story-pill is-warning" : "story-pill")).join("")}</g>`;
        const readout = mode === "Z" ? "除法把 1 推出整数层，所以 ℤ 不是数域。" : `${mode === "Q" ? "有理数" : mode === "R" ? "实数" : "复数"}对四则运算封闭（除数非零），因此形成数域。`;
        return { visual: svg("数域包含关系与运算封闭性", body), readout };
      },
    },

    "univariate-polynomials": {
      title: "多项式乘法，是两条系数带之间的一次对角汇聚",
      intro: "加法只把同一竖列相加；乘法则让所有满足 i+j=k 的位置沿对角线汇入结果的第 k 格。",
      controls: [
        { value: "add", label: "同次相加" }, { value: "mul2", label: "乘法 k=2" }, { value: "mul3", label: "乘法 k=3" }, { value: "mul4", label: "乘法 k=4" },
      ],
      initial: { mode: "mul3" },
      render(state) {
        const f = [2, -1, 0, 3, 0];
        const g = [-2, 1, 1, -3, 0];
        const add = f.map((v, i) => v + g[i]);
        const mul = Array(9).fill(0);
        f.forEach((a, i) => g.forEach((b, j) => { mul[i + j] += a * b; }));
        const isAdd = state.mode === "add";
        const k = isAdd ? 0 : Number(state.mode.replace("mul", ""));
        const xs = (i) => 165 + i * 130;
        const yF = 115, yG = 235, yR = 390;
        const cells = (values, y, name, count = values.length) => `<text x="55" y="${y + 6}" class="story-row-name">${name}</text>${values.slice(0, count).map((v, i) => `<g class="story-coeff-cell ${(isAdd ? true : (name !== "结果" && ((name === "f" && k - i >= 0 && k - i < 5) || (name === "g" && k - i >= 0 && k - i < 5))) || (name === "结果" && i === k)) ? "is-focus" : ""}"><rect x="${xs(i) - 43}" y="${y - 34}" width="86" height="68" rx="16"/><text x="${xs(i)}" y="${y + 7}" text-anchor="middle">${v}</text><text x="${xs(i)}" y="${y + 52}" text-anchor="middle" class="story-degree">x${i ? `^${i}` : "⁰"}</text></g>`).join("")}`;
        let links = "";
        if (isAdd) {
          for (let i = 0; i < 5; i += 1) links += `<path d="M${xs(i)} ${yF + 35}L${xs(i)} ${yR - 35}" class="story-flow is-soft" marker-end="url(#ch1-story-arrow)"/>`;
        } else {
          for (let i = 0; i < 5; i += 1) {
            const j = k - i;
            if (j < 0 || j >= 5) continue;
            const midX = (xs(i) + xs(j)) / 2;
            links += `<path d="M${xs(i)} ${yF + 35}Q${midX} 305 ${xs(k)} ${yR - 38}" class="story-flow" marker-end="url(#ch1-story-arrow)"/><path d="M${xs(j)} ${yG + 35}Q${midX} 325 ${xs(k)} ${yR - 38}" class="story-flow is-gold"/>`;
          }
        }
        const out = isAdd ? add : mul;
        const body = `<rect width="900" height="500" rx="28" fill="url(#ch1-story-surface)"/>${links}${cells(f, yF, "f", 5)}${cells(g, yG, "g", 5)}${cells(out, yR, "结果", isAdd ? 5 : 7)}
          ${isAdd ? pill(330, 300, 240, "同一列 → 同一次数", "story-pill is-large") : pill(330, 300, 240, `i + j = ${k}`, "story-pill is-large")}`;
        const pairs = isAdd ? "每一列独立相加。" : f.map((a, i) => ({ i, j: k - i, a })).filter((p) => p.j >= 0 && p.j < 5).map((p) => `${p.a}×${g[p.j]}`).join(" + ");
        return { visual: svg("系数带的同次相加与卷积乘法", body), readout: isAdd ? "相同次数保持在同一竖列，结果不会发生跨列混合。" : `[x^${k}](fg) = ${pairs} = ${mul[k]}。` };
      },
    },

    "polynomial-divisibility": {
      title: "长除法是一段不断降低最高台阶的动画",
      intro: "每一步只做一件事：复制并平移除式，使它的最高次项与当前余式对齐，然后相减。",
      controls: [
        { value: "0", label: "开始" }, { value: "1", label: "消去 x⁴" }, { value: "2", label: "消去 x³" }, { value: "3", label: "停止" },
      ],
      initial: { mode: "0" },
      render(state) {
        const step = Number(state.mode);
        const bars = [
          [0, 0, 0, 0, 1],
          [-1, 0, 0, -1, 0],
          [-1, 0, 1, 0, 0],
          [-2, -1, 0, 0, 0],
        ][step];
        const divisor = [1, 1, 1];
        const baseX = 170, gap = 125;
        const bar = (v, i, y, cls) => {
          const h = Math.abs(v) * 46;
          return `<g class="${cls}"><rect x="${baseX + i * gap - 31}" y="${v >= 0 ? y - h : y}" width="62" height="${Math.max(5, h)}" rx="10"/><text x="${baseX + i * gap}" y="${y + 32}" text-anchor="middle">x^${i}</text><text x="${baseX + i * gap}" y="${v >= 0 ? y - h - 10 : y + h + 18}" text-anchor="middle">${v}</text></g>`;
        };
        const shift = step < 2 ? 2 - step : 0;
        const moving = divisor.map((v, i) => bar(v, i + shift, 265, "story-divisor-bar")).join("");
        const body = `<rect width="900" height="500" rx="28" fill="url(#ch1-story-surface)"/>
          <text x="70" y="70" class="story-caption">当前余式的次数轮廓</text>${line(120, 300, 790, 300, "story-axis")}
          ${bars.map((v, i) => bar(v, i, 300, `story-remainder-bar ${i === 4 - step && step < 3 ? "is-leading" : ""}`)).join("")}
          <g class="story-moving-divisor ${step === 3 ? "is-faded" : ""}">${moving}</g>
          <path d="M450 105C450 150 ${baseX + (4 - step) * gap} 170 ${baseX + (4 - step) * gap} 215" class="story-flow" marker-end="url(#ch1-story-arrow)"/>
          ${pill(310, 92, 280, step === 0 ? "先对齐最高次项" : step === 3 ? "deg r < deg g，停止" : "相减后最高次数下降", "story-pill is-large")}`;
        const notes = ["把除式乘以 x²，使 x²·x² 与 x⁴ 对齐。", "最高次项 x⁴ 被消去，余式最高次数降到 3。", "继续消去 x³，次数再次下降。", "余式次数低于除式次数，带余除法完成。"];
        return { visual: svg("多项式长除法的次数阶梯", body), readout: notes[step] };
      },
    },

    "gcd-polynomials": {
      title: "欧几里得算法把两条多项式，压缩成同一束公共结构",
      intro: "余式会改变表达式，却不会改变公共因式。随着次数下降，最后留下的非零余式就是最大公因式。",
      controls: [
        { value: "0", label: "f 与 g" }, { value: "1", label: "第一次取余" }, { value: "2", label: "第二次取余" }, { value: "3", label: "得到 gcd" },
      ],
      initial: { mode: "0" },
      render(state) {
        const step = Number(state.mode);
        const columns = [
          { a: "x⁴−1", b: "x³−1", r: "" },
          { a: "x³−1", b: "x−1", r: "x−1" },
          { a: "x−1", b: "0", r: "0" },
          { a: "gcd", b: "x−1", r: "Bézout 证书" },
        ][step];
        const rootPositions = [-1, 1];
        const roots = (y, commonOnly = false) => rootPositions.map((x, i) => circle(280 + (x + 1) * 170, y, 20, `${commonOnly || i === 1 ? "story-root is-common" : "story-root"}`, x === -1 ? "−1" : "1")).join("");
        const body = `<rect width="900" height="500" rx="28" fill="url(#ch1-story-surface)"/>
          <g class="story-euclid-column"><text x="160" y="90">A</text>${pill(85, 110, 250, columns.a, "story-pill is-large")}${roots(220, step > 0)}</g>
          <path d="M350 145C430 145 430 145 510 145" class="story-flow" marker-end="url(#ch1-story-arrow)"/>
          <g class="story-euclid-column"><text x="650" y="90">B / R</text>${pill(565, 110, 250, columns.b, "story-pill is-large")}${step < 3 ? roots(220, true) : circle(690, 225, 28, "story-root is-common", "1")}</g>
          <g class="story-common-thread"><path d="M450 240C450 300 450 340 450 390"/><circle cx="450" cy="405" r="34"/><text x="450" y="413" text-anchor="middle">x−1</text></g>
          <text x="450" y="465" text-anchor="middle" class="story-caption">每一步都保留同一个公共因式</text>`;
        const notes = ["f 与 g 都在 x=1 处为 0，因此至少共享因式 x−1。", "用 f 除以 g 后，公共因式完整地传递到余式。", "余式链抵达 x−1，下一余式为 0。", "首一化后 gcd(f,g)=x−1，并可由 sf+tg=x−1 验证。"];
        return { visual: svg("欧几里得算法保留公共因式", body), readout: notes[step] };
      },
    },

    "factorization-theorem": {
      title: "不同的拆分路线，会在同一组不可约叶子处重新相遇",
      intro: "唯一分解并不要求中途每一步相同；它要求提出常数、首一化和排序以后，叶节点的多重集合相同。",
      controls: [
        { value: "QA", label: "ℚ · 路线 A" }, { value: "QB", label: "ℚ · 路线 B" }, { value: "CA", label: "ℂ · 完全分裂" },
      ],
      initial: { mode: "QA" },
      render(state) {
        const isC = state.mode.startsWith("C");
        const routeB = state.mode.endsWith("B");
        const leaves = isC ? ["x−1", "x+1", "x−i", "x+i"] : ["x−1", "x+1", "x²+1"];
        const mid = routeB ? ["x−1", "x³+x²+x+1"] : ["x²−1", "x²+1"];
        const leafX = leaves.map((_, i) => 145 + i * (610 / Math.max(1, leaves.length - 1)));
        const branches = mid.map((_, i) => `<path d="M450 135C450 190 ${300 + i * 300} 175 ${300 + i * 300} 235" class="story-tree-branch"/>`).join("");
        const leafBranches = leafX.map((x, i) => `<path d="M${i < Math.ceil(leaves.length / 2) ? 300 : 600} 270C${i < Math.ceil(leaves.length / 2) ? 300 : 600} 320 ${x} 315 ${x} 365" class="story-tree-branch"/>`).join("");
        const body = `<rect width="900" height="500" rx="28" fill="url(#ch1-story-surface)"/>${pill(340, 80, 220, "x⁴−1", "story-pill is-root")}${branches}
          ${mid.map((m, i) => pill(200 + i * 300, 235, 200, m, "story-pill is-mid")).join("")}${leafBranches}
          ${leaves.map((l, i) => pill(leafX[i] - 70, 365, 140, l, "story-pill is-leaf")).join("")}
          <path d="M150 445H750" class="story-normalize-line"/><text x="450" y="475" text-anchor="middle" class="story-caption">提出常数 · 首一化 · 排序 → 同一多重集合</text>`;
        return { visual: svg("唯一分解定理的两条因式树", body), readout: isC ? "扩张到 ℂ 后，x²+1 继续分裂成 x−i 与 x+i；所有叶子均为一次因式。" : routeB ? "路线 B 先抽出 x−1，但最终仍得到 x−1、x+1、x²+1。" : "路线 A 先用平方差拆分，最终得到同一组不可约叶子。" };
      },
    },

    "multiple-factors": {
      title: "重数决定曲线怎样遇见横轴，也决定多少阶导数同时消失",
      intro: "奇重根穿过横轴，偶重根贴住后返回；重数越高，根附近越平。图像、导数与 gcd 是同一结构的三种投影。",
      controls: [
        { value: "1", label: "m=1" }, { value: "2", label: "m=2" }, { value: "3", label: "m=3" }, { value: "4", label: "m=4" },
      ],
      initial: { mode: "2" },
      render(state) {
        const m = Number(state.mode);
        const fn = (x) => 0.38 * ((x - 1) ** m) * (x + 1);
        const path = graphPath(fn, { xMin: -2.5, xMax: 2.8, yMin: -4, yMax: 4, width: 720, height: 300, left: 90, top: 70 });
        const rootX = 90 + ((1 + 2.5) / 5.3) * 720;
        const axisY = 70 + 150;
        const zeros = Array.from({ length: 4 }, (_, i) => `<g class="story-derivative-lamp ${i < m ? "is-zero" : ""}"><circle cx="${230 + i * 150}" cy="420" r="22"/><text x="${230 + i * 150}" y="427" text-anchor="middle">${i}</text><text x="${230 + i * 150}" y="462" text-anchor="middle">f${i ? `^(${i})` : ""}(1)</text></g>`).join("");
        const body = `<rect width="900" height="500" rx="28" fill="url(#ch1-story-surface)"/>${line(90, axisY, 810, axisY, "story-axis")}${line(90, 70, 90, 370, "story-axis")}<path d="${path}" class="story-graph-curve"/>
          <circle cx="${rootX}" cy="${axisY}" r="8" class="story-root-point"/><path d="M${rootX} ${axisY - 65}V${axisY + 65}" class="story-root-guide"/>
          ${pill(590, 85, 220, m % 2 ? "奇数重：穿过" : "偶数重：返回", "story-pill is-large")}${zeros}`;
        const desc = m === 1 ? "单根处 f(1)=0，但 f′(1)≠0，曲线以非零斜率穿过横轴。" : `前 ${m} 个量 f(1), f′(1), …, f^(${m - 1})(1) 同时为 0；第 ${m} 阶导数首次非零。`;
        return { visual: svg("重根的图像与导数消失阶数", body), readout: desc };
      },
    },

    "polynomial-functions": {
      title: "同一个多项式，既是一串系数，也是一条可以被采样和重建的曲线",
      intro: "评价是从曲线上取一个点；余数定理把这个点翻译成因式信息；插值则反过来从有限个点恢复整条低次曲线。",
      controls: [
        { value: "eval-1", label: "评价 a=−1" }, { value: "eval1", label: "评价 a=1" }, { value: "eval2", label: "评价 a=2" }, { value: "interp", label: "三点重建" },
      ],
      initial: { mode: "eval1" },
      render(state) {
        const isInterp = state.mode === "interp";
        const a = state.mode === "eval-1" ? -1 : state.mode === "eval2" ? 2 : 1;
        const fn = isInterp ? (x) => x * x + 1 : (x) => 0.55 * (x ** 3 - 2 * x + 1);
        const path = graphPath(fn, { xMin: -2.5, xMax: 3, yMin: -3, yMax: 8, width: 700, height: 310, left: 100, top: 70 });
        const toX = (x) => 100 + ((x + 2.5) / 5.5) * 700;
        const toY = (y) => 70 + 310 - ((clamp(y, -3, 8) + 3) / 11) * 310;
        const nodes = isInterp ? [[0,1],[1,2],[2,5]] : [[a, fn(a)]];
        const body = `<rect width="900" height="500" rx="28" fill="url(#ch1-story-surface)"/>${line(100, toY(0), 800, toY(0), "story-axis")}${line(toX(0), 70, toX(0), 380, "story-axis")}<path d="${path}" class="story-graph-curve"/>
          ${nodes.map(([x,y], i) => `<g class="story-sample-point"><circle cx="${toX(x)}" cy="${toY(y)}" r="10"/><line x1="${toX(x)}" y1="${toY(y)}" x2="${toX(x)}" y2="${toY(0)}"/><text x="${toX(x) + 14}" y="${toY(y) - 12}">${isInterp ? `P${i}` : `(a,f(a))`}</text></g>`).join("")}
          ${isInterp ? `<path d="M${toX(0)} ${toY(1)}C${toX(0.5)} 65 ${toX(1)} ${toY(2)} ${toX(2)} ${toY(5)}" class="story-rebuild-wave"/>${pill(545, 405, 250, "3 个互异节点 → 唯一二次式", "story-pill is-large")}` : `${pill(520, 405, 275, `f(${a})=${(a ** 3 - 2 * a + 1)}`, "story-pill is-large")}<path d="M${toX(a)} ${toY(fn(a))}C${toX(a)+80} ${toY(fn(a))-50} 650 410 650 410" class="story-flow" marker-end="url(#ch1-story-arrow)"/>`}`;
        return { visual: svg("多项式评价与插值重建", body), readout: isInterp ? "三个互异横坐标给出三条独立约束，唯一确定次数不超过 2 的多项式 x²+1。" : `曲线在 x=${a} 处的高度就是 f(${a})；当高度为 0 时，x−${a} 才是因式。` };
      },
    },

    "complex-real-factorization": {
      title: "实系数把复根变成关于实轴的镜像双星",
      intro: "只要一个非实根出现，它的共轭根就必须同时出现。镜像对的和与积落回实轴，于是两个一次因式合并成实二次因式。",
      controls: [
        { value: "0.8,1.2", label: "α=0.8+1.2i" }, { value: "1.4,0.7", label: "α=1.4+0.7i" }, { value: "-0.8,1.4", label: "α=−0.8+1.4i" },
      ],
      initial: { mode: "0.8,1.2" },
      render(state) {
        const [re, im] = state.mode.split(",").map(Number);
        const toX = (x) => 450 + x * 120;
        const toY = (y) => 250 - y * 95;
        const alpha = [toX(re), toY(im)], beta = [toX(re), toY(-im)];
        const b = -2 * re;
        const c = re * re + im * im;
        const body = `<rect width="900" height="500" rx="28" fill="url(#ch1-story-surface)"/>${line(90, 250, 810, 250, "story-axis")}${line(450, 70, 450, 430, "story-axis")}
          <path d="M${alpha[0]} ${alpha[1]}L${beta[0]} ${beta[1]}" class="story-conjugate-line"/><circle cx="${alpha[0]}" cy="${alpha[1]}" r="14" class="story-complex-point is-alpha"/><circle cx="${beta[0]}" cy="${beta[1]}" r="14" class="story-complex-point is-beta"/>
          <text x="${alpha[0] + 20}" y="${alpha[1] - 12}" class="story-label">α</text><text x="${beta[0] + 20}" y="${beta[1] + 28}" class="story-label">ᾱ</text>
          <path d="M${alpha[0]} ${alpha[1]}Q700 130 700 190" class="story-flow" marker-end="url(#ch1-story-arrow)"/><path d="M${beta[0]} ${beta[1]}Q700 360 700 310" class="story-flow is-gold" marker-end="url(#ch1-story-arrow)"/>
          ${pill(575, 205, 250, `和 = ${(2 * re).toFixed(1)} ∈ ℝ`, "story-pill")}${pill(575, 255, 250, `积 = ${c.toFixed(2)} ∈ ℝ`, "story-pill is-gold")}${pill(260, 430, 380, `x² ${b < 0 ? "−" : "+"} ${Math.abs(b).toFixed(1)}x + ${c.toFixed(2)}`, "story-pill is-large")}`;
        return { visual: svg("复根共轭对生成实二次因式", body), readout: `α 与 ᾱ 关于实轴镜像；它们的和 ${2 * re} 与积 ${c.toFixed(2)} 都是实数。` };
      },
    },

    "rational-polynomials": {
      title: "有理根定理不是答案，而是一只把无限搜索压缩成有限候选的漏斗",
      intro: "常数项的因子决定分子，首项系数的因子决定分母；候选还必须逐个代入，Eisenstein 则是另一条不可约证据链。",
      controls: [
        { value: "cubic", label: "2x³−3x²−8x+12" }, { value: "quartic", label: "2x⁴+3x³+3x²+3x+1" },
      ],
      initial: { mode: "cubic" },
      render(state) {
        const cubic = state.mode === "cubic";
        const p = cubic ? ["±1", "±2", "±3", "±4", "±6", "±12"] : ["±1"];
        const q = ["1", "2"];
        const candidates = cubic ? ["±1", "±2", "±3", "±4", "±6", "±12", "±1/2", "±3/2"] : ["±1", "±1/2"];
        const roots = cubic ? new Set(["±2", "±3/2"]) : new Set();
        const candidateNodes = candidates.map((c, i) => pill(425 + (i % 4) * 110, 230 + Math.floor(i / 4) * 52, 96, c, roots.has(c) ? "story-pill is-root-candidate" : "story-pill is-candidate")).join("");
        const body = `<rect width="900" height="500" rx="28" fill="url(#ch1-story-surface)"/>
          <g><text x="145" y="90" class="story-caption">p | a₀</text>${p.slice(0,6).map((v,i)=>pill(70 + (i%2)*120, 115 + Math.floor(i/2)*55, 105, v, "story-pill is-small")).join("")}</g>
          <g><text x="350" y="90" class="story-caption">q | aₙ</text>${q.map((v,i)=>pill(315, 115+i*60, 90, v, "story-pill is-small is-gold")).join("")}</g>
          <path d="M250 180C345 180 360 230 420 255" class="story-flow" marker-end="url(#ch1-story-arrow)"/><path d="M405 180C430 195 430 220 445 240" class="story-flow is-gold" marker-end="url(#ch1-story-arrow)"/>
          ${candidateNodes}<text x="620" y="445" text-anchor="middle" class="story-caption">亮起的候选经过精确代入后才是真正的根</text>`;
        return { visual: svg("有理根候选漏斗", body), readout: cubic ? "候选集合是有限的；代入后只有对应 ±2 与 ±3/2 的具体符号组合可能成为根，候选并不自动成立。" : "该四次式只有 ±1、±1/2 四类候选，但逐个代入均不为 0；无有理根仍不能单独证明四次式不可约。" };
      },
    },

    "multivariate-polynomials": {
      title: "多元单项式生活在指数空间，乘法就是格点上的向量相加",
      intro: "xⁱyʲ 不再是一段长字符串，而是格点 (i,j)。总次数是到原点的斜层级，乘法则把两个指数向量首尾相接。",
      controls: [
        { value: "degree2", label: "齐次层 d=2" }, { value: "degree3", label: "齐次层 d=3" }, { value: "multiply", label: "(1,2)+(2,1)" },
      ],
      initial: { mode: "multiply" },
      render(state) {
        const gap = 82, ox = 150, oy = 410;
        const points = [];
        for (let i = 0; i <= 6; i += 1) for (let j = 0; j <= 5; j += 1) points.push({ i, j, x: ox + i * gap, y: oy - j * 68 });
        const d = state.mode === "degree2" ? 2 : 3;
        const lattice = points.map((p) => `<g class="story-lattice-point ${state.mode.startsWith("degree") && p.i + p.j === d ? "is-layer" : ""} ${state.mode === "multiply" && ((p.i===1&&p.j===2)||(p.i===2&&p.j===1)||(p.i===3&&p.j===3)) ? "is-vector" : ""}"><circle cx="${p.x}" cy="${p.y}" r="7"/><text x="${p.x + 10}" y="${p.y - 10}">${p.i},${p.j}</text></g>`).join("");
        const vec = state.mode === "multiply" ? `<path d="M${ox+gap} ${oy-136}L${ox+3*gap} ${oy-204}" class="story-vector" marker-end="url(#ch1-story-arrow)"/><path d="M${ox+2*gap} ${oy-68}L${ox+3*gap} ${oy-204}" class="story-vector is-gold" marker-end="url(#ch1-story-arrow)"/>${pill(520, 80, 275, "x y² · x² y = x³ y³", "story-pill is-large")}` : `<path d="M${ox} ${oy-d*68}L${ox+d*gap} ${oy}" class="story-degree-line"/>${pill(520, 80, 230, `i + j = ${d}`, "story-pill is-large")}`;
        const body = `<rect width="900" height="500" rx="28" fill="url(#ch1-story-surface)"/>${line(ox, oy, 760, oy, "story-axis")}${line(ox, oy, ox, 60, "story-axis")}${lattice}${vec}<text x="770" y="438" class="story-axis-label">i</text><text x="128" y="65" class="story-axis-label">j</text>`;
        return { visual: svg("多元多项式的指数格点", body), readout: state.mode === "multiply" ? "指数向量逐坐标相加：(1,2)+(2,1)=(3,3)，所以 x y²·x² y=x³y³。" : `所有满足 i+j=${d} 的格点落在同一条斜线上，它们组成 ${d} 次齐次部分。` };
      },
    },

    "symmetric-polynomials": {
      title: "对称多项式不是“看起来整齐”，而是在所有变量置换下保持同一个对象",
      intro: "把 x、y、z 当作三个可以互换的位置。单个单项式沿置换轨道移动，而把整条轨道相加后，中心表达式保持不动。",
      controls: [
        { value: "identity", label: "原位置" }, { value: "swap", label: "交换 x↔y" }, { value: "cycle", label: "三循环" },
      ],
      initial: { mode: "identity" },
      render(state) {
        const positions = [[450,90],[220,350],[680,350]];
        const labels = state.mode === "swap" ? ["y","x","z"] : state.mode === "cycle" ? ["z","x","y"] : ["x","y","z"];
        const terms = state.mode === "identity" ? ["x²y","y²z","z²x"] : state.mode === "swap" ? ["y²x","x²z","z²y"] : ["z²x","x²y","y²z"];
        const body = `<rect width="900" height="500" rx="28" fill="url(#ch1-story-surface)"/>
          <path d="M450 120L250 330L650 330Z" class="story-permutation-triangle"/>
          ${positions.map((p,i)=>circle(p[0],p[1],34,`story-variable-node ${i===0?"is-top":""}`,labels[i])).join("")}
          ${pill(330, 215, 240, "σ₁=x+y+z", "story-pill is-root")}
          ${terms.map((t,i)=>pill(85+i*250,410,215,t,"story-pill is-orbit")).join("")}
          <path d="M200 392C250 365 310 365 350 392M450 392C500 365 560 365 600 392M700 392C750 365 790 340 755 290" class="story-orbit-arrow" marker-end="url(#ch1-story-arrow)"/>
          <text x="450" y="475" text-anchor="middle" class="story-caption">轨道中的单项式会换位；轨道和保持不变</text>`;
        return { visual: svg("变量置换与对称多项式轨道", body), readout: state.mode === "identity" ? "先观察原始变量位置。" : state.mode === "swap" ? "交换 x 与 y 后，单项式轨道中的成员重新排列，但 σ₁=x+y+z 不变。" : "三循环再次重排变量；真正的对称表达式在所有置换下都保持不变。" };
      },
    },
  };

  function createChoiceButtons(config, current) {
    return config.controls.map((item) => `<button type="button" data-story-choice="${esc(item.value)}" class="${item.value === current ? "is-active" : ""}" aria-pressed="${item.value === current}">${item.label}</button>`).join("");
  }

  function mountStory(section, lab) {
    const config = stories[section.id];
    if (!config || lab.querySelector(":scope > [data-ch1-story]")) return null;
    const state = { ...config.initial };
    const story = document.createElement("section");
    story.className = "ch1-visual-story";
    story.dataset.ch1Story = section.id;
    story.innerHTML = `<div class="ch1-story-copy"><span>视觉主线</span><h4>${config.title}</h4><p>${config.intro}</p><div class="ch1-story-controls" role="group" aria-label="切换视觉情境">${createChoiceButtons(config, state.mode)}</div><div class="ch1-story-readout" aria-live="polite"></div></div><div class="ch1-story-stage"></div>`;

    const stage = story.querySelector(".ch1-story-stage");
    const readout = story.querySelector(".ch1-story-readout");
    const paint = () => {
      const frame = config.render(state);
      stage.innerHTML = frame.visual;
      readout.textContent = frame.readout;
      story.querySelectorAll("[data-story-choice]").forEach((button) => {
        const active = button.dataset.storyChoice === state.mode;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    };
    story.addEventListener("click", (event) => {
      const button = event.target.closest("[data-story-choice]");
      if (!button) return;
      state.mode = button.dataset.storyChoice;
      paint();
    });
    paint();
    const guide = lab.querySelector(":scope > .ch1-learning-guide");
    (guide || lab.querySelector(":scope > .ch1-lab-head"))?.after(story);
    return story;
  }

  function collapseWorkbench(lab, story) {
    if (!story || lab.querySelector(":scope > .ch1-deep-workbench")) return;
    const keep = new Set([lab.querySelector(":scope > .ch1-lab-head"), lab.querySelector(":scope > .ch1-learning-guide"), story]);
    const movable = [...lab.children].filter((node) => !keep.has(node) && !node.classList.contains("ch1-live-conclusion"));
    if (!movable.length) return;
    const details = document.createElement("details");
    details.className = "ch1-deep-workbench";
    details.innerHTML = `<summary><span><strong>展开精确计算工作台</strong><small>视觉主线负责建立直觉；这里保留完整参数、公式、算法步骤与验证。</small></span><b aria-hidden="true">＋</b></summary><div class="ch1-deep-workbench-body"></div>`;
    const body = details.querySelector(".ch1-deep-workbench-body");
    movable.forEach((node) => body.append(node));
    story.after(details);
  }

  window.mountChapter1VisualStory = mountStory;
  window.collapseChapter1Workbench = collapseWorkbench;

  const baseRenderLessonPage = window.renderLessonPage;
  if (typeof baseRenderLessonPage === "function") {
    window.renderLessonPage = function renderLessonPageWithVisualStory(section, chapter) {
      baseRenderLessonPage(section, chapter);
      if (!section?.id || !String(location.hash).startsWith("#ch1/")) return;
      const lab = document.querySelector(`#${CSS.escape(section.id)}-interactive .ch1-lab`);
      if (!lab) return;
      const story = mountStory(section, lab);
      collapseWorkbench(lab, story || lab.querySelector(":scope > [data-ch1-story]"));
    };
  }
})();
