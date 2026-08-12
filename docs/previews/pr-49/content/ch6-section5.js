defineChapter6Section("subspaces", {
  number: "§5",
  textbookSection: "线性子空间",
  title: "线性子空间",
  navTitle: "线性子空间",
  question: "一个已知线性空间中的子集，满足什么条件才能完整继承原来的线性结构？怎样从方程、生成元和函数条件中系统地产生子空间？",
  goal: "使用非空与线性组合封闭判定子空间；证明 span、齐次线性条件的解集和任意子空间之交是标准子空间；区分线性子空间与仿射平移，并把判定法应用到多项式与矩阵条件。",
  tags: ["子空间判定", "span", "齐次约束", "仿射平移"],
  prerequisites: ["掌握线性空间公理及简单性质。", "理解基、维数与张成。"],
  objectives: [
    "用一条线性组合判定式完成子空间证明。",
    "识别 span 与齐次方程解集为何天然封闭。",
    "把非齐次解集写成特解加齐次解空间。",
  ],
  intro:
    "子空间沿用大空间中已经定义好的加法与数乘，因此无需重新核对全部八条公理。真正需要验证的是候选子集非空，并且任意线性组合仍留在其中。这个简化判据会把几何直线、齐次方程、函数条件和多项式因子统一起来。",
  concepts: [
    { label: "子空间", text: "V 的非空子集 U 在原运算下仍构成同一数域上的线性空间。" },
    { label: "统一判定", text: texInline("u,v\\in U,\\ \\alpha,\\beta\\in F\\Rightarrow\\alpha u+\\beta v\\in U") + "。" },
    { label: "标准来源", text: "张成空间、齐次线性条件的解集、子空间的交。" },
    { label: "仿射集合", text: texInline("x_0+U") + " 是子空间 U 的平移。" },
  ],
  textbook: {
    reference: "Hoffman–Kunze · Axler · Strang",
    items: ["一步子空间判定", "张成是最小子空间", "齐次解空间", "交空间", "仿射平移"],
  },
  story: {
    title: "线性子空间：在大空间内部保留全部线性组合",
    lead:
      "§2 从零开始规定整个空间的运算；本节已经拥有线性空间 V，只需检查候选子集 U 是否在这些运算下封闭。Hoffman–Kunze 的一句判定式把全部工作压缩到线性组合。",
    modules: [
      {
        number: "01",
        title: "子空间沿用原空间的运算",
        subtitle: "结合律、分配律等公理已经在 V 中成立。",
        blocks: [
          {
            type: "formula",
            kicker: "定义场景",
            formula: texDisplay("U\\subseteq V,\\qquad +\\text{ 与数乘均取自 }V"),
            text: "只要运算结果始终留在 U，并且 U 非空，V 中的其余公理就自动限制到 U。",
          },
          {
            type: "cards",
            items: [
              { kicker: "零向量", title: "所有子空间共享 V 的零向量", text: "若 U 中存在 u，则 0u=0∈U。" },
              { kicker: "相反向量", title: "−u 仍在 U", text: "取标量 −1，数乘封闭给出加法逆元。" },
              { kicker: "继承关系", title: "子空间仍在同一数域上", text: "改变数域会改变问题本身，需要重新说明结构。" },
            ],
          },
        ],
      },
      {
        number: "02",
        title: "非空与线性组合封闭构成统一判定法",
        subtitle: "一次验证同时覆盖零向量、加法和数乘。",
        blocks: [
          {
            type: "formula",
            kicker: "子空间判定",
            formula: texDisplay("U\\ne\\varnothing,\\quad u,v\\in U,\\ \\alpha,\\beta\\in F\\Longrightarrow\\alpha u+\\beta v\\in U"),
            text: "取不同的 α、β 可以分别恢复加法、数乘、零向量与相反向量。",
          },
          {
            type: "proof",
            items: [
              { title: "零向量", text: "先取 u∈U，再令 α=0、β=0，得到 0∈U。非空条件避免对空集进行真空判断。" },
              { title: "加法封闭", text: "令 α=β=1，得到 u+v∈U。" },
              { title: "数乘封闭", text: "令 β=0，得到 αu∈U。" },
              { title: "更短版本", text: "等价地，也可验证 U 非空且对任意 c∈F、u,v∈U 有 cu+v∈U。" },
            ],
          },
        ],
      },
      {
        number: "03",
        title: "span 是包含给定向量的最小子空间",
        subtitle: "它既提供子空间，也提供构造子空间基的方法。",
        blocks: [
          {
            type: "proof",
            items: [
              { title: "包含生成元", text: "每个 vⱼ 可取自身系数为 1、其余为 0，因而属于 span(v₁,…,vₘ)。" },
              { title: "对线性组合封闭", text: "两个线性组合再作 αu+βv，只会把原系数重新线性组合。" },
              { title: "最小性", text: "任何含全部 vⱼ 的子空间都必须含它们的一切线性组合，因此必定包含 span。" },
            ],
          },
          {
            type: "note",
            title: "从生成元到基",
            text: "先把条件写成 span，再用 §3 的相关性引理删除冗余，就能得到子空间的基和维数。",
          },
        ],
      },
      {
        number: "04",
        title: "齐次线性条件稳定地产生子空间",
        subtitle: "右端为零让条件与线性组合相容。",
        blocks: [
          {
            type: "formula",
            kicker: "齐次解空间",
            formula: texDisplay("U=\\{x:Ax=0\\},\\qquad A(\\alpha u+\\beta v)=\\alpha Au+\\beta Av=0"),
            text: "同样思路适用于 p(1)=0、Aᵀ=A、f′=f 等线性齐次条件；每个条件都要直接检查是否保持线性组合。",
          },
          {
            type: "cards",
            items: [
              { kicker: "任意交", title: texInline("\\bigcap_i U_i"), text: "同时满足一族子空间条件的向量，对线性组合仍同时满足全部条件。" },
              { kicker: "矩阵例子", title: "对称矩阵", text: texInline("A^T=A,\\ B^T=B") + " 推出 (αA+βB)ᵀ=αA+βB。" },
              { kicker: "多项式例子", title: texInline("p(1)=0"), text: "线性组合在 x=1 处仍取值 0。" },
            ],
          },
        ],
      },
      {
        number: "05",
        title: "非齐次条件给出仿射平移",
        subtitle: "它保留方向空间，同时把集合整体移离零向量。",
        blocks: [
          {
            type: "formula",
            kicker: "完整解结构",
            formula: texDisplay("Ax=b,\\quad x=x_0+u,\\qquad Au=0"),
            text: "x₀ 是一个特解，u 遍历齐次解空间。集合 x₀+ker A 与 ker A 平行；当 b≠0 时通常不含零向量。",
          },
          {
            type: "misconception",
            title: "几何外形不足以判定",
            items: [
              "过原点是直线或平面成为子空间的必要条件，还需验证任意线性组合。",
              "第一象限经过原点并对加法封闭，但负标量数乘给出反例。",
              "x+y+z=0 与 x+y+z=1 都画成平面，只有齐次平面继承线性结构。",
            ],
          },
        ],
      },
    ],
  },
  interactive: {
    type: "slot",
    title: "实验：子空间过滤器",
    description: "比较直线平移、齐次与非齐次方程、象限和多项式条件。",
    task: "每个场景先写出一个一般元素，再预测线性组合是否仍满足条件；若失败，找出尽可能短的反例。",
    prompts: [
      "移动直线并说明平移量怎样决定零向量是否在集合中。",
      "比较 x+y+z=0 与 x+y+z=1，直接计算 αu+βv 的方程左端。",
      "对第一象限使用 −u，说明过原点为何仍不充分。",
      "比较常数项为 0 与常数项为 1 的多项式集合。",
    ],
  },
  example: {
    title: "例题：用线性条件和因式分解寻找基",
    question:
      "在 " + texInline("P_3") + " 中令 " + texInline("U=\\{p:p(1)=0\\}") + "。证明 U 是子空间，给出一组基与 dim U，并求 " + texInline("p(x)=x^3-1") + " 在该基下的坐标。",
    choices: [
      { correct: true, text: "U 是子空间；可取 B=(x−1,x(x−1),x²(x−1))，dim U=3，[x³−1]B=(1,1,1)ᵀ。" },
      { text: "U 不是子空间，因为条件 p(1)=0 只限制了一个点。" },
      { text: "U 的维数为 4，因为它包含在 P₃ 中。" },
      { text: "可取 (1,x,x²) 为 U 的基。" },
    ],
    steps: [
      "若 p(1)=q(1)=0，则 (αp+βq)(1)=αp(1)+βq(1)=0；U 非空，因此是子空间。",
      "由因式定理，p(1)=0 等价于 p(x)=(x−1)q(x)，其中 q∈P₂。",
      "将 P₂ 的基 (1,x,x²) 乘以 x−1，得到 U 的基 B=(x−1,x(x−1),x²(x−1))，所以 dim U=3。",
      "x³−1=(x−1)(1+x+x²)，因此 [x³−1]B=(1,1,1)ᵀ。",
    ],
    audit: {
      kind: "polynomial-subspace",
      evaluationPoint: 1,
      basis: [[-1, 1, 0, 0], [0, -1, 1, 0], [0, 0, -1, 1]],
      dimension: 3,
      target: [-1, 0, 0, 1],
      coordinates: [1, 1, 1],
    },
  },
  quiz: [
    { question: "为什么子空间判定必须先要求 U 非空？", answer: "空集会让“对任意 u,v∈U”的封闭陈述真空成立，却不含线性空间必需的零向量。" },
    { question: "如何用统一判定式得到零向量属于 U？", answer: "先取一个 u∈U，再令两个系数都为 0，得到 0u+0u=0∈U。" },
    { question: "为什么任意一族子空间的交仍是子空间？", answer: "交中的向量同时属于每个子空间；线性组合在每个子空间中都封闭，因此仍属于交。" },
    { question: "方程 Ax=b 的解集何时一定是子空间？", answer: "当 b=0 时一定是齐次解空间；b≠0 时有解集通常是某个齐次解空间的仿射平移。" },
    { question: "span(v₁,…,vₘ) 为什么是最小的包含这些向量的子空间？", answer: "任何包含生成元的子空间都对线性组合封闭，所以必须包含全部 span。" },
    { question: "经过原点为什么仍不足以证明子空间？", answer: "还需检查任意线性组合封闭；第一象限在负数数乘下失败。" },
  ],
  summary: [
    "子空间沿用原空间运算，非空与任意线性组合封闭构成统一判定。",
    "span、齐次线性条件的解集和任意子空间之交是三类标准来源。",
    "非齐次解集保留方向空间并发生平移，形成仿射集合。",
  ],
  bridge: "下一节同时放入两个子空间：交空间提取共同方向，和空间生成包含二者的最小子空间。",
  exercises: ["证明 2×2 上三角矩阵组成 M₂(ℝ) 的子空间。", "把一个有解的非齐次方程组写成特解加齐次解空间。"],
});
