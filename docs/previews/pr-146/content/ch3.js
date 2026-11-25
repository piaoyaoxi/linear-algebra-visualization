registerAlgebraChapter({
  id: "ch3",
  icon: "3",
  title: "第三章 线性方程组",
  subtitle: "约束、秩与解空间",
  summary:
    `先用可逆行变换整理约束，再把未知量视为 ${texInline("P^n")} 中的向量；线性相关与秩度量独立信息，系数秩与增广秩决定目标是否可达，最后把全部解写成特解加零空间。同一消元思想还能求解二元高次方程组（选学 §7）。`,
  structureTitle: "一条主线串起七个小节",
  overviewCards: [
    { title: "消元（§1）", text: "交换、倍乘、倍加方程都能撤回，所以解不变；消元就是把方程组整理成阶梯形。" },
    { title: "向量与秩（§2–§4）", text: `把方程组读成 ${texInline(String.raw`n`)} 维向量的线性组合；线性相关说明有多余的方向，秩数出真正独立的方向。` },
    { title: "有解判别与解的结构（§5–§7）", text: "系数矩阵与增广矩阵的秩相等时有解；全部解是一个特解加上导出组的全部解。二元高次方程组用消元化成一元问题。" },
  ],
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
