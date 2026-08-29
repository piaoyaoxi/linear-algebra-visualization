registerAlgebraChapter({
  id: "ch2",
  icon: "2",
  title: "第二章 行列式",
  subtitle: "有向体积与结构",
  summary:
    "本章沿教材 §1—§8 展开。主线从二维有向面积出发，经排列奇偶性建立 n 阶定义，再把性质组织成计算工具，最后连接余子式展开、克拉默法则、Laplace 定理与矩阵乘积。行列式的绝对值记录体积倍率，符号记录定向，零值标志维度塌缩。",
  sections: [
    { id: "determinant-intro", number: "§1", title: "引言", navTitle: "引言" },
    { id: "permutations", number: "§2", title: "排列", navTitle: "排列" },
    { id: "n-order-determinant", number: "§3", title: "n 阶行列式", navTitle: "n 阶行列式" },
    { id: "determinant-properties", number: "§4", title: "n 阶行列式的性质", navTitle: "行列式性质" },
    { id: "determinant-computation", number: "§5", title: "行列式的计算", navTitle: "行列式计算" },
    { id: "cofactor-expansion", number: "§6", title: "行列式按一行（列）展开", navTitle: "按行列展开" },
    { id: "cramer-rule", number: "§7", title: "克拉默（Cramer）法则", navTitle: "克拉默法则" },
    { id: "laplace-and-product", number: "§8", title: "拉普拉斯（Laplace）定理·行列式的乘法规则", navTitle: "Laplace 与乘法" },
  ],
});
