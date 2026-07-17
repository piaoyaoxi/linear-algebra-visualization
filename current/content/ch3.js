registerAlgebraChapter({
  id: "ch3",
  icon: "3",
  title: "第三章 线性方程组",
  subtitle: "解空间",
  summary:
    "本章沿教材 §1 到 ＊§7 组织：先用消元法整理方程组，再进入坐标向量空间、线性相关与秩，随后用有解判别与通解结构把全部解写成特解加零空间，最后把消元思想延伸到二元高次方程组。",
  sections: [
    { id: "elimination", number: "§1", title: "消元法", navTitle: "消元法" },
    { id: "n-vector-space", number: "§2", title: "n维向量空间", navTitle: "n维向量空间" },
    { id: "linear-dependence", number: "§3", title: "线性相关性", navTitle: "线性相关性" },
    { id: "matrix-rank", number: "§4", title: "矩阵的秩", navTitle: "矩阵的秩" },
    { id: "solvability", number: "§5", title: "线性方程组有解判别定理", navTitle: "有解判别" },
    { id: "solution-structure", number: "§6", title: "线性方程组解的结构", navTitle: "解的结构" },
    { id: "binary-higher-degree", number: "＊§7", title: "二元高次方程组", navTitle: "二元高次" },
  ],
});
