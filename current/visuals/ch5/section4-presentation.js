(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);

  function module(index, title, subtitle, body) {
    return `<section class="ch5-module"><div class="ch5-module-heading"><span>${index}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>怎样证明所有方向都为正</h2>
      <div class="ch5-foundation ch5s4-foundation">
        <p class="ch5-lead">正定不是“看起来像碗”，也不是“试了几个向量都为正”。它要求每一个非零方向都严格为正。本节把这个无穷多方向的问题压缩成可计算的标准形与顺序主子式判据。</p>

        ${module(
          "01",
          "有限抽样为什么不够",
          "没测到负方向，不等于不存在负方向",
          `<div class="ch5s4-sample-story">
            <div class="ch5-card"><strong>已测试</strong><span>${inline("q(1,0)>0")}</span><span>${inline("q(0,1)>0")}</span><span>${inline("q(1,1)>0")}</span></div>
            <b>但是</b>
            <div class="ch5-card"><strong>仍有无穷多个方向</strong><p>只有结构性判据才能覆盖所有非零向量。</p></div>
          </div>`,
        )}

        ${module(
          "02",
          "五种符号类型",
          "区别在于所有非零方向上能取到哪些符号",
          `<div class="ch5s4-type-grid">
            <article><strong>正定</strong><span>${inline("q(x)>0")}</span><p>所有非零方向严格为正。</p></article>
            <article><strong>半正定</strong><span>${inline("q(x)\\ge0")}</span><p>不为负，但存在非零零方向。</p></article>
            <article><strong>负定</strong><span>${inline("q(x)<0")}</span><p>所有非零方向严格为负。</p></article>
            <article><strong>半负定</strong><span>${inline("q(x)\\le0")}</span><p>不为正，但存在非零零方向。</p></article>
            <article><strong>不定</strong><span>正、负都能取到</span><p>曲面具有马鞍方向。</p></article>
          </div>`,
        )}

        ${module(
          "03",
          "标准形把定义变成符号检查",
          "正惯性指数等于 n，才是正定",
          `<div class="ch5-equation">${display("f=d_1y_1^2+\\cdots+d_ny_n^2")}</div>
          <ul class="ch5-check-list"><li>全部 ${inline("d_i>0")}：正定。</li><li>全部 ${inline("d_i\\ge0")} 且至少一个为 0：半正定。</li><li>既有正系数又有负系数：不定。</li></ul>`,
        )}

        ${module(
          "04",
          "Sylvester 顺序主子式判据",
          "正定只需检查左上角逐级扩大的子矩阵",
          `<div class="ch5s4-minor-chain"><div>${inline("A_1")}</div><span>⊂</span><div>${inline("A_2")}</div><span>⊂</span><div>⋯</div><span>⊂</span><div>${inline("A_n=A")}</div></div>
          <div class="ch5-equation">${display("A>0\\quad\\Longleftrightarrow\\quad \\Delta_1>0,\\ldots,\\Delta_n>0")}</div>
          <div class="ch5-next-note"><span>边界</span><p>半正定不能把上面的“全正”机械改成“顺序主子式全非负”。一般需要检查所有主子式非负。二阶矩阵要同时检查 ${inline("a\\ge0")}、${inline("c\\ge0")} 和 ${inline("ac-b^2\\ge0")}。</p></div>`,
        )}

        ${module(
          "05",
          "长度平方是正定结构的另一种写法",
          "Gram 与 Cholesky 只作连接，不替代教材判据",
          `<div class="ch5-pair"><div class="ch5-card">${display("x^T(B^TB)x=\\|Bx\\|^2\\ge0")}<p>所以 ${inline("B^TB")} 总是半正定；B 列满秩时正定。</p></div><div class="ch5-card">${display("A=R^TR")}<p>正定矩阵可以写成长度平方结构；具体分解算法留作后续连接。</p></div></div>`,
        )}
      </div>`;
  }

  // The lab itself is built by geometry-upgrade.js (surface with level curves on its floor,
  // direction wheel, Sylvester readouts); this file only renders the formal block.
  window.defineChapter5Renderer("positive-definite", { formal: renderFormal });
})();
