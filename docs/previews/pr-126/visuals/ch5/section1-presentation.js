(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);

  function module(index, title, subtitle, body) {
    return `<section class="ch5-module"><div class="ch5-module-heading"><span>${index}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  }

  function matrixButtons() {
    return `<div class="ch5s1-matrix-map" role="group" aria-label="二次型对应的二阶对称矩阵">
      <button type="button" data-map-cell="a">2</button>
      <button type="button" data-map-cell="b">3</button>
      <button type="button" data-map-cell="b">3</button>
      <button type="button" data-map-cell="c">5</button>
    </div>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>从二次多项式到对称矩阵</h2>
      <div class="ch5-foundation ch5s1-foundation">
        <p class="ch5-lead">二次型的系数按固定规则填进一个对称矩阵：平方项进对角，交叉项的系数平分到两个对称位置。作变量替换 ${inline("x=Cy")} 以后，矩阵变为 ${inline("C^TAC")}。</p>

        ${module(
          "01",
          "先确认它真的是二次型",
          "每一项的总次数都必须等于 2",
          `<div class="ch5-mini-grid">
            <article class="ch5-card ch5s1-example is-yes"><span>二次型</span>${display("2x_1^2-3x_1x_2+x_2^2")}<p>平方项和交叉项的总次数都为 2。</p></article>
            <article class="ch5-card ch5s1-example is-no"><span>不是二次型</span>${display("x_1^2+x_2+1")}<p>它含有一次项和常数项，不是二次齐次多项式。</p></article>
          </div>`,
        )}

        ${module(
          "02",
          "交叉项为什么要除以 2",
          "点击一项，看它落到矩阵的哪个位置",
          `<div class="ch5s1-map-demo" data-s1-map>
            <div class="ch5s1-term-list" role="group" aria-label="选择多项式中的一项">
              <button type="button" class="is-active" data-map-term="a">${inline("2x_1^2")}</button>
              <button type="button" data-map-term="b">${inline("6x_1x_2")}</button>
              <button type="button" data-map-term="c">${inline("5x_2^2")}</button>
            </div>
            <span class="ch5s1-map-arrow" aria-hidden="true">→</span>
            <div>${matrixButtons()}<p class="ch5s1-map-copy" data-map-copy></p></div>
          </div>`,
        )}

        ${module(
          "03",
          "为什么只需要对称矩阵",
          "斜对称部分在二次型中自动消失",
          `<div class="ch5-pair">
            <div class="ch5-equation">${display("B=\\frac{B+B^T}{2}+\\frac{B-B^T}{2}=S+K")}</div>
            <div class="ch5-card"><p>${inline("x^TKx")} 是标量；转置以后又等于 ${inline("-x^TKx")}，所以只能为 0。因此 ${inline("x^TBx=x^TSx")}。二次型真正看见的只有对称部分。</p></div>
          </div>`,
        )}

        ${module(
          "04",
          "变量替换为什么产生合同",
          `左右两个 ${inline("C")} 分别来自哪里`,
          `<div class="ch5s1-derivation">
            <div>${inline("x=Cy")}</div><span>代入</span>
            <div>${inline("x^TAx=(Cy)^TA(Cy)")}</div><span>转置</span>
            <div>${inline("(Cy)^T=y^TC^T")}</div><span>合并</span>
            <div>${inline("x^TAx=y^T(C^TAC)y")}</div>
          </div>
          <div class="ch5-next-note"><span>注意</span><p>这个恒等式对任意矩阵 ${inline("C")} 都成立；只有当 ${inline("\\det C\\ne0")}、新旧变量可以互相恢复时，才称为非退化变量替换，并说 ${inline("A")} 与 ${inline("C^TAC")} 合同。</p></div>`,
        )}
      </div>`;

    const controller = new AbortController();
    const signal = controller.signal;
    const map = formal.querySelector("[data-s1-map]");
    const copy = formal.querySelector("[data-map-copy]");
    const messages = {
      a: `平方项只进入主对角位置 ${inline("a_{11}")}。`,
      b: `${inline("6x_1x_2")} 在展开中由 ${inline("a_{12}x_1x_2")} 与 ${inline("a_{21}x_2x_1")} 共同产生，所以两个位置各填 3。`,
      c: `平方项只进入主对角位置 ${inline("a_{22}")}。`,
    };

    function select(kind) {
      map.querySelectorAll("[data-map-term]").forEach((button) => button.classList.toggle("is-active", button.dataset.mapTerm === kind));
      map.querySelectorAll("[data-map-cell]").forEach((cell) => cell.classList.toggle("is-active", cell.dataset.mapCell === kind));
      copy.innerHTML = messages[kind];
    }

    map.querySelectorAll("[data-map-term], [data-map-cell]").forEach((button) => {
      button.addEventListener("click", () => select(button.dataset.mapTerm || button.dataset.mapCell), { signal });
    });
    select("a");
    return () => controller.abort();
  }

  window.defineChapter5Renderer("quadratic-matrix", { formal: renderFormal });
})();
