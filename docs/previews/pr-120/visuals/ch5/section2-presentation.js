(() => {
  const inline = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);

  function module(index, title, subtitle, body) {
    return `<section class="ch5-module"><div class="ch5-module-heading"><span>${index}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  }

  function renderFormal(formal) {
    if (!formal) return;
    formal.innerHTML = `
      <h2>把交叉项一步一步消掉</h2>
      <div class="ch5-foundation ch5s2-foundation">
        <p class="ch5-lead">化标准形，就是找一个可逆变量替换，把二次型改写成平方项之和。主要方法是配方法；在矩阵上，它对应成对进行的合同初等变换。</p>

        ${module(
          "01",
          "交叉项让等高线在当前坐标里倾斜",
          "同一个二次型，换坐标后可以写得更简单",
          `<div class="ch5-pair">
            <div class="ch5-card ch5s2-axis-card"><div class="ch5s2-tilted-axes"><span></span><i></i><b></b></div><h4>原坐标</h4><p>${inline("x_1^2+4x_1x_2+5x_2^2")} 含交叉项。</p></div>
            <div class="ch5-card ch5s2-axis-card"><div class="ch5s2-straight-axes"><span></span><i></i><b></b></div><h4>新坐标</h4><p>${inline("y_1^2+y_2^2")} 只剩平方项。</p></div>
          </div>`,
        )}

        ${module(
          "02",
          "什么叫标准形",
          "没有交叉项的对角二次型",
          `<div class="ch5-equation">${display("f=d_1y_1^2+\\cdots+d_ry_r^2,\\qquad d_i\\ne0")}</div>
          <ul class="ch5-check-list"><li>没有任何 ${inline("y_iy_j")} 交叉项。</li><li>非零平方项的个数 ${inline("r")} 等于二次型的秩。</li><li>具体系数通常不唯一：令 ${inline("y_i=kz_i")}（${inline("k\\ne0")}），系数 ${inline("d_i")} 变为 ${inline("k^2d_i")}。</li></ul>`,
        )}

        ${module(
          "03",
          "配方的一步到底做了什么",
          "先收集，再完成平方，再定义新变量",
          `<div class="ch5s2-square-identity">
            <div>${inline("ax_1^2+2bx_1x_2+cx_2^2")}</div><span>=</span>
            <div>${inline("a\\left(x_1+\\frac ba x_2\\right)^2+\\left(c-\\frac{b^2}{a}\\right)x_2^2")}</div>
          </div>
          <p class="ch5-muted">这里假设 ${inline("a\\ne0")}。若没有平方项却有交叉项，先作和差替换，把乘积变成平方差，再继续。</p>`,
        )}

        ${module(
          "04",
          "矩阵中必须行列成对",
          "普通行消元不是合同变换",
          `<div class="ch5s2-paired-operation"><div><strong>做一次行操作</strong><span>第 2 行减去 ${inline("k")} 倍第 1 行</span></div><b>+</b><div><strong>同步做同名列操作</strong><span>第 2 列减去 ${inline("k")} 倍第 1 列</span></div><b>→</b><div><strong>仍是 ${inline("C^TAC")}</strong><span>矩阵保持对称，换元可追踪</span></div></div>`,
        )}
      </div>`;
  }

  window.defineChapter5Renderer("quadratic-standard-form", { formal: renderFormal });
})();
