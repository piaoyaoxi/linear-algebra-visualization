registerAlgebraChapter({
  id: "ch4",
  icon: "4",
  title: "第四章 矩阵",
  subtitle: "运算 · 逆 · 分块 · 初等变换",
  summary:
    "先建立矩阵概念与运算，再讨论矩阵乘积的行列式与秩、逆矩阵、分块、初等矩阵，以及分块乘法的初等变换与应用。",
  structureTitle: "一条主线串起七个小节",
  overviewCards: [
    { title: "概念与运算（§1–§2）", text: `矩阵的每一列记录一个基向量的去向；加法和数乘逐项进行，乘积 ${texInline("AB")} 就是先做 ${texInline("B")} 再做 ${texInline("A")}。` },
    { title: "行列式、秩与逆（§3–§4）", text: `${texInline("|AB|=|A||B|")}，秩不会因为相乘而变大；可逆矩阵的作用可以完整撤回，${texInline("A^{-1}")} 可由伴随矩阵或初等变换求出。` },
    { title: "分块与初等矩阵（§5–§7）", text: "把矩阵按块切开，块之间照样按乘法规则运算；一次初等行变换就是左乘一个初等矩阵，推广到块上就是分块初等变换。" },
  ],
  // Section content lives in ch4-section1…4.js, ch4-core.js and ch4-block.js.
  sections: [
    { id: "matrix-language" },
    { id: "matrix-operations" },
    { id: "matrix-product-determinant-rank" },
    { id: "matrix-inverse" },
    { id: "block-matrices" },
    { id: "elementary-matrices" },
    { id: "block-elementary-applications" },
  ],
});
