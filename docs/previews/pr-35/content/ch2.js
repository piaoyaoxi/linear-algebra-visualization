registerAlgebraChapter({
  id: "ch2",
  icon: "2",
  title: "第二章 行列式",
  subtitle: "面积与塌缩",
  summary:
    "本章沿教材 §1 到 §8 组织：先用有向面积建立行列式的几何意义，再经排列符号写出 n 阶定义，随后讨论性质、计算、按行展开、克拉默法则，并以 Laplace 定理与乘法规则收束。",
  sections: [
    { id: "determinant-intro", number: "§1", title: "引言", navTitle: "引言" },
    { id: "permutations", number: "§2", title: "排列", navTitle: "排列" },
    { id: "n-order-determinant", number: "§3", title: "n阶行列式", navTitle: "n阶行列式" },
    { id: "determinant-properties", number: "§4", title: "n阶行列式的性质", navTitle: "行列式性质" },
    { id: "determinant-computation", number: "§5", title: "行列式的计算", navTitle: "行列式计算" },
    { id: "cofactor-expansion", number: "§6", title: "行列式按一行(列)展开", navTitle: "按行展开" },
    { id: "cramer-rule", number: "§7", title: "克拉默（Cramer）法则", navTitle: "克拉默法则" },
    { id: "laplace-and-product", number: "§8", title: "拉普拉斯定理·乘法规则", navTitle: "Laplace与乘法" },
  ],
});
