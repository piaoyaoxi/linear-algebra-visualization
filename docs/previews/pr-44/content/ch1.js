registerAlgebraChapter({
  id: "ch1",
  icon: "1",
  title: "第一章 多项式",
  subtitle: "数域 · 整除 · 分解 · 对称",
  summary:
    "多项式理论由一条结构链贯穿：先确定系数允许怎样运算，再建立形式多项式；带余除法产生欧几里得算法，欧几里得算法支撑唯一分解；评价把因式与根连接起来，最后把一元的系数位置推广到多元指数与置换不变量。",
  learningUnits: [
    {
      eyebrow: "对象与运算",
      title: "先确定舞台，再定义对象",
      summary: "数域规定哪些系数和除法合法；系数序列规定多项式本身是什么。",
      sections: ["number-fields", "univariate-polynomials"],
    },
    {
      eyebrow: "欧几里得结构",
      title: "从一次消元到最大公因式",
      summary: "带余除法让次数下降；反复取余保持公共因式，并产生 Bézout 证书。",
      sections: ["polynomial-divisibility", "gcd-polynomials"],
    },
    {
      eyebrow: "分解结构",
      title: "不可约因式与重数",
      summary: "唯一分解说明最终因子稳定；导数与 gcd 进一步读出每个因子的重复次数。",
      sections: ["factorization-theorem", "multiple-factors"],
    },
    {
      eyebrow: "根与系数域",
      title: "从评价到实、复、有理分解",
      summary: "余数定理连接函数值和一次因式；系数域决定根怎样成对、哪些判据可以使用。",
      sections: ["polynomial-functions", "complex-real-factorization", "rational-polynomials"],
    },
    {
      eyebrow: "多元结构",
      title: "从指数地址到置换不变量",
      summary: "指数向量把多元项放进格点；变量置换把这些格点组织成对称轨道。",
      sections: ["multivariate-polynomials", "symmetric-polynomials"],
    },
  ],
  sections: [
    { id: "number-fields", number: "§1", title: "数域", navTitle: "数域" },
    { id: "univariate-polynomials", number: "§2", title: "一元多项式", navTitle: "一元多项式" },
    { id: "polynomial-divisibility", number: "§3", title: "整除的概念", navTitle: "整除的概念" },
    { id: "gcd-polynomials", number: "§4", title: "最大公因式", navTitle: "最大公因式" },
    { id: "factorization-theorem", number: "§5", title: "因式分解定理", navTitle: "因式分解定理" },
    { id: "multiple-factors", number: "§6", title: "重因式", navTitle: "重因式" },
    { id: "polynomial-functions", number: "§7", title: "多项式函数", navTitle: "多项式函数" },
    { id: "complex-real-factorization", number: "§8", title: "复系数与实系数多项式的因式分解", navTitle: "实复因式分解" },
    { id: "rational-polynomials", number: "§9", title: "有理系数多项式", navTitle: "有理系数" },
    { id: "multivariate-polynomials", number: "§10", title: "多元多项式", navTitle: "多元多项式" },
    { id: "symmetric-polynomials", number: "§11", title: "对称多项式", navTitle: "对称多项式" },
  ],
});
