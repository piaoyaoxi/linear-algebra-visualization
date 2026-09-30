registerAlgebraChapter({
  id: "ch6",
  icon: "6",
  title: "第六章 线性空间",
  subtitle: "集合 · 结构 · 分解 · 同构",
  summary:
    "本章沿教材 §1 到 §8 组织：先建立集合与映射语言，再抽象出线性空间的公理结构；用基、维数与坐标描述空间，弄清换基时什么变、什么不变；随后进入子空间、交与和、直和，最后用同构说明不同外表可以共享同一线性结构。",
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
