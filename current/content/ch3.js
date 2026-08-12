registerAlgebraChapter({
  id: "ch3",
  icon: "3",
  title: "第三章 线性方程组",
  subtitle: "从整理约束到读出全部解",
  summary:
    "怎样同时满足一组线性约束？本章先用可逆行变换整理方程，再把 Ax=b 读成列向量的线性组合；线性相关找出冗余，秩计数独立方向，增广秩判断目标 b 是否可达，最后由一个特解和零空间写出全部解。§2—§6 反复研究同一个矩阵，让这些概念逐层连接；选学 §7 再把消元思想迁移到二元多项式方程组。",
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
