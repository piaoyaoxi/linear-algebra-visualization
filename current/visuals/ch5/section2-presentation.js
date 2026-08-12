(() => {
  const M = () => window.Ch5Math;
  const inline = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);

  function module(index, title, subtitle, body) {
    return `<section class="ch5-module"><div class="ch5-module-heading"><span>${index}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>用可逆换元把变量逐层解耦</h2>
      <div class="ch5-foundation ch5s2-foundation">
        <p class="ch5-lead">交叉项表示变量在当前坐标式中相互耦合。化标准形的核心，是明确写出可逆换元，使同一二次型变成平方项之和；图形提供直觉，换元与合同计算完成核验。</p>

        ${module(
          "01",
          "交叉项会随坐标改变",
          "它会随坐标改变；配方法寻找一组解耦变量",
          `<div class="ch5-pair">
            <div class="ch5-card ch5s2-axis-card"><div class="ch5s2-tilted-axes"><span></span><i></i><b></b></div><h4>耦合表达</h4><p>${inline("q_t=x_1^2+2tx_1x_2+x_2^2")} 含交叉项。</p></div>
            <div class="ch5-card ch5s2-axis-card"><div class="ch5s2-straight-axes"><span></span><i></i><b></b></div><h4>解耦表达</h4><p>${inline("q_t=y_1^2+(1-t^2)y_2^2")} 只剩平方项。</p></div>
          </div>
          <p class="ch5-muted">这里的新坐标可以来自剪切或伸缩，并不必保持直角与长度；“解耦”不等于“正交旋转”。</p>`,
        )}

        ${module(
          "02",
          "什么叫标准形",
          "没有交叉项的对角二次型",
          `<div class="ch5-equation">${display("f=d_1y_1^2+\\cdots+d_ry_r^2,\\qquad d_i\\ne0")}</div>
          <ul class="ch5-check-list"><li>没有任何 ${inline("y_iy_j")} 交叉项。</li><li>非零平方项的个数 r 等于二次型的秩。</li><li>具体系数通常不唯一；本节只解决怎样化到标准形。</li></ul>`,
        )}

        ${module(
          "03",
          "配方的一步就是降一维",
          "完成一个平方后，把问题交给剩余变量",
          `<div class="ch5s2-square-identity">
            <div>${inline("ax_1^2+2bx_1x_2+cx_2^2")}</div><span>=</span>
            <div>${inline("a\\left(x_1+\\frac ba x_2\\right)^2+\\left(c-\\frac{b^2}{a}\\right)x_2^2")}</div>
          </div>
          <p class="ch5-muted">这里假设 ${inline("a\\ne0")}。第一项定义新变量后，余项只依赖剩余变量；对它重复同一过程即可归纳到 n 维。若没有平方项却有交叉项，先用和差换元把乘积变成平方差。</p>`,
        )}

        ${module(
          "04",
          "矩阵中必须行列成对",
          "普通行消元只改一侧；二次型换元要求行、列成对变化",
          `<div class="ch5s2-paired-operation"><div><strong>右乘 E</strong><span>实施一次列变换</span></div><b>+</b><div><strong>左乘 Eᵀ</strong><span>同步做对应行变换</span></div><b>→</b><div><strong>EᵀAE</strong><span>仍对称，且换元可追踪</span></div></div>
          <p class="ch5-muted">逐步累积初等矩阵后得到 ${inline("C^TAC=D")}。因为每一步可逆，最终标准形与原二次型秩相同。</p>`,
        )}

        <div class="ch5-next-note"><span>两条路线</span><p>Lagrange 配方法给出一般合同对角化；学过谱定理后，实对称矩阵还能被正交对角化，得到保持长度与夹角的主轴坐标。一般配方允许非正交换元；正交法是在额外保持欧氏几何时采用的更强选择。</p></div>
      </div>`;
  }

  function mountLab(root) {
    if (!root) return;
    root.innerHTML = `
      <h2>交互实验</h2>
      <div class="ch5-lab ch5s2-lab">
        <div class="ch5-lab-head"><h3>配方步进器</h3><p>一次只看一步。请沿着配方逻辑走到终点，并核对三件事：替换可逆、交叉项为 0、秩没有改变。</p></div>
        <div class="ch5-task"><span>1</span><div><strong>选择一个典型例子</strong><p>建议先走“含交叉项”，再看“只有交叉项”为什么必须先做和差替换。</p></div></div>
        <div class="ch5-toolbar" role="group" aria-label="选择配方例子">
          <button type="button" class="is-active" data-s2-preset="regular">含交叉项</button>
          <button type="button" data-s2-preset="cross">只有交叉项</button>
          <button type="button" data-s2-preset="rank1">退化为一个平方</button>
          <button type="button" data-s2-preset="indef">一正一负</button>
        </div>

        <div class="ch5-controls-row">
          <div class="ch5s2-step-count" data-s2-step-count></div>
          <div class="ch5-toolbar" role="group" aria-label="配方步骤控制">
            <button type="button" data-s2-nav="prev">上一步</button>
            <button type="button" data-s2-nav="next">下一步</button>
            <button type="button" data-s2-nav="reset">重置</button>
          </div>
        </div>
        <div class="ch5-progress" data-s2-progress></div>

        <div class="ch5-lab-grid">
          <div class="ch5-panel">
            <article class="ch5-step-card" aria-live="polite">
              <span class="ch5-step-kicker" data-s2-kicker></span>
              <h4 data-s2-title></h4>
              <div class="ch5-equation" data-s2-poly></div>
              <p data-s2-note></p>
            </article>
            <div class="ch5-stage"><canvas data-s2-canvas aria-label="当前坐标中的二次型等高线"></canvas></div>
            <p class="ch5-muted" data-s2-look></p>
          </div>

          <div class="ch5-panel">
            <div class="ch5-reading"><h4>当前变量替换</h4><div class="ch5-matrix-wrap" data-s2-c></div><p data-s2-substitution></p></div>
            <div class="ch5-reading"><h4>当前矩阵</h4><div class="ch5-matrix-wrap" data-s2-d></div></div>
            <div class="ch5-reading">
              <div class="ch5-reading-row"><span>det C</span><strong data-s2-det></strong></div>
              <div class="ch5-reading-row"><span>交叉项系数</span><strong data-s2-cross></strong></div>
              <div class="ch5-reading-row"><span>原矩阵的秩</span><strong data-s2-rank-a></strong></div>
              <div class="ch5-reading-row"><span>当前矩阵的秩</span><strong data-s2-rank-d></strong></div>
            </div>
            <div class="ch5-result-card" data-s2-result><span class="ch5-status" data-s2-status></span><h4 data-s2-result-title></h4><p data-s2-result-copy></p></div>
          </div>
        </div>
      </div>`;

    const controller = new AbortController();
    const signal = controller.signal;
    const presets = {
      regular: { label: "含交叉项", A: M().mat2FromAbc(1, 2, 5) },
      cross: { label: "只有交叉项", A: M().mat2FromAbc(0, 1, 0) },
      rank1: { label: "退化为一个平方", A: M().mat2FromAbc(1, 1, 1) },
      indef: { label: "一正一负", A: M().mat2FromAbc(1, 0.5, -1) },
    };
    const state = { preset: "regular", step: 0 };

    function currentPack() {
      return M().completeSquareSteps2(presets[state.preset].A);
    }

    function lookCopy(kind, final) {
      if (final) return "终点：矩阵已经对角化，坐标表达不再耦合。请展开右侧三个平方项，逐项核对原二次型的系数。";
      const copy = {
        start: "先看原式：交叉项还在，所以当前矩阵的非对角元不为 0。",
        pick: "这一页只是在选择主平方项并收集相关项，还没有完成变量替换。",
        square: "完成平方以后，新变量的组合已经出现，但还要明确写出新旧变量关系。",
        sub: "变量替换已经写出；下一步用 CᵀAC 核对矩阵是否真的对角。",
      };
      return copy[kind] || "观察当前公式、矩阵和曲面是否说的是同一个状态；图形只帮助理解，换元核验才是证明。";
    }

    function substitutionCopy(step, pack) {
      if (step.C) {
        if (pack.method === "sumdiff") return "x₁=(y₁+y₂)/2，x₂=(y₁−y₂)/2；这是和差替换的反解。";
        const r = pack.C[0][1] ? -pack.C[0][1] : 0;
        return `x₁=y₁−${M().formatNum(r, 3)}y₂，x₂=y₂；因此 x=Cy。`;
      }
      return "尚未定义新变量，当前 C 为单位矩阵。";
    }

    function paint() {
      const A = presets[state.preset].A;
      const pack = currentPack();
      const steps = pack.steps || [];
      state.step = M().clamp(state.step, 0, Math.max(0, steps.length - 1));
      const step = steps[state.step] || { title: "起点", poly: M().polyPlain2(A), note: "", kind: "start", matrix: A };
      const C = step.C || M().identity(2);
      const D = step.matrix || A;
      const final = state.step === steps.length - 1;
      const detC = M().det2(C);
      const cross = 2 * D[0][1];
      const rankA = M().matrixRank(A);
      const rankD = M().matrixRank(D);

      root.querySelector("[data-s2-step-count]").textContent = `第 ${state.step + 1} 步，共 ${steps.length} 步`;
      const progress = root.querySelector("[data-s2-progress]");
      progress.style.setProperty("--ch5-steps", String(steps.length));
      progress.innerHTML = steps.map((_, index) => `<span class="${index < state.step ? "is-done" : index === state.step ? "is-current" : ""}"></span>`).join("");
      root.querySelector("[data-s2-kicker]").textContent = `${presets[state.preset].label} · 步骤 ${state.step + 1}`;
      root.querySelector("[data-s2-title]").textContent = step.title;
      root.querySelector("[data-s2-poly]").innerHTML = inline(step.poly.replace(/²/g, "^2").replace(/x₁/g, "x_1").replace(/x₂/g, "x_2").replace(/y₁/g, "y_1").replace(/y₂/g, "y_2"));
      root.querySelector("[data-s2-note]").textContent = step.note;
      root.querySelector("[data-s2-look]").textContent = lookCopy(step.kind, final);
      root.querySelector("[data-s2-c]").innerHTML = M().matrixHtml(C);
      root.querySelector("[data-s2-d]").innerHTML = M().matrixHtml(D);
      root.querySelector("[data-s2-substitution]").textContent = substitutionCopy(step, pack);
      root.querySelector("[data-s2-det]").textContent = M().formatNum(detC, 4);
      root.querySelector("[data-s2-cross]").textContent = M().formatNum(cross, 6);
      root.querySelector("[data-s2-rank-a]").textContent = String(rankA);
      root.querySelector("[data-s2-rank-d]").textContent = String(rankD);

      const result = root.querySelector("[data-s2-result]");
      const status = root.querySelector("[data-s2-status]");
      if (final) {
        const ok = Math.abs(detC) > 1e-8 && Math.abs(cross) < 1e-7 && rankA === rankD;
        result.className = `ch5-result-card ${ok ? "is-success" : "is-warning"}`;
        status.className = `ch5-status ${ok ? "is-ok" : "is-warn"}`;
        status.textContent = ok ? "标准形完成" : "还需检查";
        root.querySelector("[data-s2-result-title]").textContent = ok ? "三个条件同时通过" : "结果尚未闭环";
        root.querySelector("[data-s2-result-copy]").textContent = ok
          ? "det C≠0，替换可逆；新矩阵的交叉项为 0；合同前后秩相同。三项共同验证了一次合法的标准形变换。"
          : "请检查变量替换、合同矩阵和交叉项是否完全一致。";
      } else {
        result.className = "ch5-result-card";
        status.className = "ch5-status is-neutral";
        status.textContent = "过程未结束";
        root.querySelector("[data-s2-result-title]").textContent = "先完成当前一步";
        root.querySelector("[data-s2-result-copy]").textContent = "不要提前看终点。每一步只回答一个问题：现在收集了什么、完成了哪个平方、定义了什么新变量。";
      }

      M().drawContours(root.querySelector("[data-s2-canvas]"), D, { caption: final ? "标准形坐标：交叉项为 0" : "当前表达：交叉项仍可能存在" });
    }

    root.querySelectorAll("[data-s2-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        state.preset = button.dataset.s2Preset;
        state.step = 0;
        root.querySelectorAll("[data-s2-preset]").forEach((item) => item.classList.toggle("is-active", item === button));
        paint();
      }, { signal });
    });
    root.querySelectorAll("[data-s2-nav]").forEach((button) => {
      button.addEventListener("click", () => {
        const max = Math.max(0, currentPack().steps.length - 1);
        if (button.dataset.s2Nav === "prev") state.step = Math.max(0, state.step - 1);
        if (button.dataset.s2Nav === "next") state.step = Math.min(max, state.step + 1);
        if (button.dataset.s2Nav === "reset") state.step = 0;
        paint();
      }, { signal });
    });
    window.addEventListener("resize", paint, { signal, passive: true });
    paint();
    return () => controller.abort();
  }

  window.defineChapter5Renderer("quadratic-standard-form", { formal: renderFormal, interactive: mountLab });
})();
