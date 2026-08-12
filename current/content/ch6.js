registerAlgebraChapter({
  id: "ch6",
  icon: "6",
  title: "第六章 线性空间",
  subtitle: "结构 · 坐标 · 分解 · 同构",
  overviewTitle: "从线性组合到结构分类",
  summary:
    "本章沿一条定理链前进：先用集合与映射说清对象和对应，再把线性组合抽象成向量空间；相关性引理帮助删除冗余并得到基、维数和唯一坐标；换基区分对象与表示；子空间的交、和与直和组织空间内部结构；最后用同构证明同数域有限维空间由维数分类。",
  overviewCards: [
    { title: "建立结构 · §1—§2", text: "从完整映射进入集合、数域、加法与数乘，说明函数、多项式和矩阵为何共享同一理论。" },
    { title: "建立坐标 · §3—§4", text: "从张成和相关性提取基，以唯一表示定义坐标，再推导有方向的换基矩阵。" },
    { title: "组织子空间 · §5—§7", text: "用线性组合判定子空间，计算交与和，并把覆盖与零交合成唯一的直和分解。" },
    { title: "识别同一结构 · §8", text: "把基映到基构造同构，说明外表不同的有限维空间可以拥有相同的线性结构。" },
  ],
  sections: [
    { id: "sets-maps", number: "§1", title: "集合·映射", navTitle: "集合·映射" },
    { id: "vector-space-definition", number: "§2", title: "线性空间的定义与简单性质", navTitle: "线性空间定义" },
    { id: "basis-coordinates", number: "§3", title: "维数·基与坐标", navTitle: "维数·基与坐标" },
    { id: "change-of-basis", number: "§4", title: "基变换与坐标变换", navTitle: "基变换与坐标变换" },
    { id: "subspaces", number: "§5", title: "线性子空间", navTitle: "线性子空间" },
    { id: "intersection-sum", number: "§6", title: "子空间的交与和", navTitle: "交与和" },
    { id: "direct-sum", number: "§7", title: "子空间的直和", navTitle: "直和" },
    { id: "isomorphism", number: "§8", title: "线性空间的同构", navTitle: "同构" },
  ],
});
