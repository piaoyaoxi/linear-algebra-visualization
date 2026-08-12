registerAlgebraChapter({
  id: "ch5",
  icon: "5",
  title: "第五章 二次型",
  subtitle: "合同 · 标准形 · 惯性 · 正定",
  summary:
    "本章追踪同一个核心问题：坐标可以改变，二次型的哪些性质不会改变？先区分二次型与它的矩阵表示，再用可逆换元消去变量耦合；随后以子空间维数证明惯性唯一，最后从 LDLᵀ 主元推导正定矩阵的顺序主子式判据，并连接长度平方与能量。",
  sections: [
    { id: "quadratic-matrix", number: "§1", title: "二次型及其矩阵表示", navTitle: "矩阵表示" },
    { id: "quadratic-standard-form", number: "§2", title: "标准形", navTitle: "标准形" },
    { id: "quadratic-uniqueness", number: "§3", title: "唯一性", navTitle: "唯一性" },
    { id: "positive-definite", number: "§4", title: "正定二次型", navTitle: "正定二次型" },
  ],
});
