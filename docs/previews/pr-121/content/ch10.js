registerAlgebraChapter({
  id: "ch10",
  icon: "10",
  title: "第十章 双线性函数与辛空间",
  subtitle: "把向量读成数",
  summary:
    `线性函数把一个向量读成一个数，在平面上画出来是一族平行的等值线。全体线性函数组成对偶空间，对偶基就是读坐标的工具。双线性函数同时读两个向量，取定基后写成 ${texInline("X^TAY")}，换基时度量矩阵变成合同的矩阵。辛空间带有非退化的反对称双线性函数，在平面上就是有向面积。`,
  sections: [
    { id: "linear-functional", number: "§1", title: "线性函数", navTitle: "线性函数" },
    { id: "dual-space", number: "§2", title: "对偶空间", navTitle: "对偶空间" },
    { id: "bilinear-form", number: "§3", title: "双线性函数", navTitle: "双线性函数" },
    { id: "symplectic-space", number: "＊§4", title: "辛空间", navTitle: "辛空间" },
  ],
});
