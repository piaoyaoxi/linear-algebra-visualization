registerAlgebraChapter({
  id: "ch3",
  icon: "3",
  title: "第三章 线性方程组",
  subtitle: "约束、秩与解空间",
  summary:
    "本章沿一条连续主线展开：先用可逆行变换整理约束，再把未知量视为 Fⁿ 中的向量；线性相关与秩度量独立信息，系数秩与增广秩决定目标是否可达，最后把全部解写成特解加零空间。选学 §7 将同一消元思想延伸到二元多项式方程组。",
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
