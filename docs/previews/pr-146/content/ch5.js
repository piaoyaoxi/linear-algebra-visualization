registerAlgebraChapter({
  id: "ch5",
  icon: "5",
  title: "第五章 二次型",
  subtitle: "合同 · 标准形 · 惯性 · 正定",
  summary:
    "先把二次齐次多项式写成唯一的实对称矩阵，再经非退化变量替换得到合同变换；用配方法与成对初等变换化到标准形，用惯性定理锁定正、负、零方向数量，最后建立正定二次型的定义与顺序主子式判别法。",
  structureTitle: "一条主线串起四个小节",
  overviewCards: [
    { title: "矩阵表示（§1）", text: `二次型与对称矩阵一一对应；非退化线性替换 ${texInline(String.raw`X=CY`)} 把矩阵变成合同的 ${texInline(String.raw`C^TAC`)}。` },
    { title: "标准形与惯性（§2–§3）", text: "配方法或成对的初等变换消去交叉项；不论怎样化，正、负平方项的个数都不变。" },
    { title: "正定（§4）", text: "正定要求每个非零向量都取正值；顺序主子式全大于零，是不必逐个检验向量的判别法。" },
  ],
  sections: [
    { id: "quadratic-matrix", number: "§1", title: "二次型及其矩阵表示", navTitle: "矩阵表示" },
    { id: "quadratic-standard-form", number: "§2", title: "标准形", navTitle: "标准形" },
    { id: "quadratic-uniqueness", number: "§3", title: "唯一性", navTitle: "唯一性" },
    { id: "positive-definite", number: "§4", title: "正定二次型", navTitle: "正定二次型" },
  ],
});
