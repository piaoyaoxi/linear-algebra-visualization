registerAlgebraChapter({
  id: "ch6",
  icon: "6",
  title: "第六章 线性空间",
  subtitle: "基 · 坐标 · 子空间 · 同构",
  summary:
    "本章把多项式、矩阵和函数都当作向量：先用基和坐标把抽象空间翻译成数组，再看换基时坐标怎样变；随后研究子空间、交与和、直和，最后用同构说明维数相同的空间结构相同。",
  structureTitle: "一条主线串起八个小节",
  overviewCards: [
    { title: "语言（§1–§2）", text: "单射加满射的映射才能唯一地倒回去；只保留加法与数乘的运算规律，多项式、矩阵和函数都成了向量。" },
    { title: "基与坐标（§3–§4）", text: "选定一组基，每个向量对应唯一的一列坐标；换基时向量不动，坐标按过渡矩阵变化。" },
    { title: "子空间与同构（§5–§8）", text: "子空间可以求交、求和；维数公式扣除公共部分，直和让分解唯一；维数相同的线性空间彼此同构。" },
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
