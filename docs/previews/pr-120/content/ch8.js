registerAlgebraChapter({
  id: "ch8",
  icon: "8",
  title: "第八章 λ-矩阵",
  subtitle: "相似的完整判别",
  summary:
    `把矩阵 ${texInline("A")} 换成 ${texInline(String.raw`\lambda`)}-矩阵 ${texInline(String.raw`\lambda E-A`)}，就能对所有 ${texInline(String.raw`\lambda`)} 一起做初等变换。${texInline(String.raw`\lambda`)}-矩阵经初等变换化成对角的标准形，对角线上的不变因子由行列式因子唯一确定。两个矩阵相似，当且仅当它们的特征矩阵有相同的不变因子。把不变因子分解成初等因子，就读出若尔当标准形；直接用不变因子的系数，就写出有理标准形。`,
  sections: [
    { id: "lambda-matrix", number: "§1", title: "λ-矩阵", navTitle: "λ-矩阵" },
    { id: "smith-form", number: "§2", title: "λ-矩阵在初等变换下的标准形", navTitle: "λ-矩阵的标准形" },
    { id: "invariant-factors", number: "§3", title: "不变因子", navTitle: "不变因子" },
    { id: "similarity-criterion", number: "§4", title: "矩阵相似的条件", navTitle: "矩阵相似的条件" },
    { id: "elementary-divisors", number: "§5", title: "初等因子", navTitle: "初等因子" },
    { id: "jordan-derivation", number: "§6", title: "若尔当标准形的理论推导", navTitle: "若尔当标准形的推导" },
    { id: "rational-canonical-form", number: "§7", title: "矩阵的有理标准形", navTitle: "有理标准形" },
  ],
});
