registerAlgebraChapter({
  id: "ch1",
  icon: "1",
  title: "第一章 多项式",
  subtitle: "数域 · 整除 · 分解 · 对称",
  summary:
    "本章沿着一条连续主线展开：先固定系数所在的数域，把一元多项式建立为有位置的形式对象；再用带余除法和欧几里得算法研究整除与最大公因式；随后进入不可约分解、重因式、多项式函数以及实复、有理系数分解；最后把一元结构推广到多元和对称多项式。每节都把符号规则落到可观察、可操作的结构上。",
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
