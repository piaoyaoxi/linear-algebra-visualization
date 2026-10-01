registerAlgebraChapter({
  id: "ch7",
  icon: "7",
  title: "第七章 线性变换",
  subtitle: "矩阵背后的变换",
  summary:
    "线性变换是线性空间到自身、保持线性组合的映射。取定一组基，它就记成一个矩阵；换一组基，矩阵换成相似的矩阵。本章寻找让矩阵最简单的基：特征向量给出对角形，不变子空间给出准对角形，特征向量不够时用若尔当形，最小多项式判断能否对角化。",
  sections: [
    { id: "linear-map-definition", number: "§1", title: "线性变换的定义", navTitle: "线性变换的定义" },
    { id: "linear-map-operations", number: "§2", title: "线性变换的运算", navTitle: "线性变换的运算" },
    { id: "matrix-of-linear-map", number: "§3", title: "线性变换的矩阵", navTitle: "线性变换的矩阵" },
    { id: "eigenvalues-eigenvectors", number: "§4", title: "特征值与特征向量", navTitle: "特征值与特征向量" },
    { id: "diagonal-matrices", number: "§5", title: "对角矩阵", navTitle: "对角矩阵" },
    { id: "image-and-kernel", number: "§6", title: "线性变换的值域与核", navTitle: "值域与核" },
    { id: "invariant-subspaces", number: "§7", title: "不变子空间", navTitle: "不变子空间" },
    { id: "jordan-form-introduction", number: "§8", title: "若尔当标准形简介", navTitle: "若尔当标准形" },
    { id: "minimal-polynomial", number: "§9", title: "最小多项式", navTitle: "最小多项式" },
  ],
});
