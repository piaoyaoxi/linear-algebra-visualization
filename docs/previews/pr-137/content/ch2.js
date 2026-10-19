registerAlgebraChapter({
  id: "ch2",
  icon: "2",
  title: "第二章 行列式",
  subtitle: "有向体积与结构",
  summary:
    `从二维有向面积出发，经排列奇偶性建立 ${texInline("n")} 阶定义，再把性质组织成计算工具，最后连接余子式展开、克拉默法则、Laplace 定理与矩阵乘积。行列式的绝对值记录体积倍率，符号记录定向，零值标志维度塌缩。`,
  structureTitle: "一条主线串起八个小节",
  overviewCards: [
    { title: "定义（§1–§3）", text: `二阶行列式是有向面积，记录倍率和定向；排列的奇偶决定每一项的符号，由此写出 ${texInline(String.raw`n`)} 阶行列式。` },
    { title: "性质与计算（§4–§5）", text: `交换两行变号，某行乘 ${texInline(String.raw`k`)} 行列式也乘 ${texInline(String.raw`k`)}，倍加不变；用这三条制造零，化成三角形来算。` },
    { title: "展开与乘法（§6–§8）", text: `按一行展开把阶数降一；克拉默法则用行列式写出唯一解；拉普拉斯定理推出 ${texInline(String.raw`|AB|=|A||B|`)}。` },
  ],
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
