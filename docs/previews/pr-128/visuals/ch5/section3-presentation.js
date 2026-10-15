(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);

  function module(index, title, subtitle, body) {
    return `<section class="ch5-module"><div class="ch5-module-heading"><span>${index}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>标准形不唯一，符号骨架唯一</h2>
      <div class="ch5-foundation ch5s3-foundation">
        <p class="ch5-lead">同一个二次型可以化成系数不同的标准形，但正平方项、负平方项和零项的个数不随非退化变量替换改变。</p>

        ${module(
          "01",
          "先看一个明显的反差",
          "数字不同，正负结构相同",
          `<div class="ch5s3-form-pair">
            <article class="ch5-card">${display("2y_1^2-3y_2^2")}<div><span class="is-positive">1 个正项</span><span class="is-negative">1 个负项</span></div></article>
            <b>同一个二次型还可以写成</b>
            <article class="ch5-card">${display("8z_1^2-\\frac34z_2^2")}<div><span class="is-positive">1 个正项</span><span class="is-negative">1 个负项</span></div></article>
          </div>
          <p class="ch5-muted">系数大小可以通过变量缩放改变；“一正一负”却没有改变。</p>`,
        )}

        ${module(
          "02",
          "从标准形到实规范形",
          `把大小归一，只留下 ${inline("+1")}、${inline("-1")} 和 0`,
          `<div class="ch5-equation">${display("f=z_1^2+\\cdots+z_p^2-z_{p+1}^2-\\cdots-z_{p+q}^2")}</div>
          <div class="ch5-mini-grid">
            <div class="ch5-card"><h4>${inline("p")}：正惯性指数</h4><p>二次型能够在一个子空间上恒正的最大维数。</p></div>
            <div class="ch5-card"><h4>${inline("q")}：负惯性指数</h4><p>二次型能够在一个子空间上恒负的最大维数。</p></div>
          </div>
          <p class="ch5-muted">零项数量为 ${inline("n-p-q")}；秩为 ${inline("p+q")}；符号差为 ${inline("p-q")}。</p>`,
        )}

        ${module(
          "03",
          "惯性定理",
          "可逆变量替换保持正、负方向的维数",
          `<div class="ch5-card ch5s3-theorem"><strong>定理</strong><p>实二次型经过任意非退化实线性替换化为标准形后，正系数项的个数 ${inline("p")} 与负系数项的个数 ${inline("q")} 唯一确定。</p></div>
          <div class="ch5-next-note"><span>直觉</span><p>可逆映射不会改变子空间的维数，因此不能凭空消灭一个正方向，也不能把正方向改造成负方向。只有替换变得不可逆、方向信息真正丢失时，计数才可能下降。</p></div>`,
        )}

        ${module(
          "04",
          "合同分类只比较惯性",
          "同秩不一定合同",
          `<div class="ch5s3-classification">
            <article class="ch5-card"><div>${display("\\operatorname{diag}(1,1)")}</div><p>秩 2，惯性 ${inline("(2,0,0)")}：正定碗面。</p></article>
            <article class="ch5-card"><div>${display("\\operatorname{diag}(1,-1)")}</div><p>秩 2，惯性 ${inline("(1,1,0)")}：不定马鞍。</p></article>
          </div>
          <p class="ch5-muted">二者秩相同但惯性不同，所以不合同。两个同阶实对称矩阵合同，当且仅当它们的 ${inline("p")}、${inline("q")} 和零项数量完全相同。</p>`,
        )}
      </div>`;
  }

  window.defineChapter5Renderer("quadratic-uniqueness", { formal: renderFormal });
})();
