defineChapter6Section("basis-coordinates", {
  number: "§3",
  textbookSection: "维数·基与坐标",
  title: "维数·基与坐标",
  navTitle: "维数·基与坐标",
  question: "怎样从一组可能含有冗余的生成元中提取空间的骨架？为什么这组骨架既决定维数，又让每个向量获得唯一坐标？",
  goal: "沿线性组合、张成、线性相关、基、维数与坐标的依赖顺序理解有限维空间；使用相关性引理删除冗余；说明基等价于唯一表示，并理解所有基含相同数量向量的原因。",
  tags: ["张成", "相关性引理", "基与唯一表示", "维数", "有序坐标"],
  prerequisites: ["会计算有限线性组合。", "理解张成空间是子空间的标准来源。"],
  objectives: [
    "把线性相关解释成某个向量可由其余向量表示。",
    "证明“生成且无关”等价于每个向量有唯一表示。",
    "先由所有基等长的定理建立维数，再使用维数快捷判据。",
  ],
  intro:
    "生成空间需要足够多的向量，建立坐标又要求这些向量没有冗余。Axler 的组织方式把两件事连成一条逻辑链：相关关系允许删去生成元；删到既生成又无关时得到基；唯一表示随之产生坐标；所有基等长后，维数才成为空间自身的数值。",
  concepts: [
    { label: "张成", text: texInline("\\operatorname{span}(v_1,\\ldots,v_m)") + " 收集全部线性组合。" },
    { label: "线性无关", text: "零向量只有平凡线性表示。" },
    { label: "基", text: "张成整个空间且线性无关的有序向量组。" },
    { label: "维数", text: "有限维空间任一基所含向量的个数。" },
    { label: "坐标", text: "向量相对于有序基的唯一系数列。" },
  ],
  textbook: {
    reference: "Axler · Friedberg · Strang",
    items: ["张成与最小子空间", "相关性引理", "基的唯一表示定理", "基的约化与扩充", "维数与坐标"],
  },
  story: {
    title: "从生成到唯一表示：基与维数的完整定理链",
    lead:
      "二维行列式面积可以帮助看见两个方向是否独立，但它只是 ℝ² 中的几何判据。一般向量空间依靠零线性组合、相关性引理和基的唯一表示定理建立同一结构。",
    modules: [
      {
        number: "01",
        title: "张成回答“这些向量能到达哪里”",
        subtitle: "全部线性组合形成包含原向量的最小子空间。",
        blocks: [
          {
            type: "formula",
            kicker: "张成空间",
            formula: texDisplay("\\operatorname{span}(v_1,\\ldots,v_m)=\\left\\{a_1v_1+\\cdots+a_mv_m:a_i\\in F\\right\\}"),
            text: "它对线性组合封闭，并且任何同时包含 v₁,…,vₘ 的子空间都必须包含这些线性组合。",
          },
          {
            type: "cards",
            items: [
              { kicker: "一个非零方向", title: "张成一条直线", text: "所有标量倍数沿同一方向延伸。" },
              { kicker: "加入独立方向", title: "张成范围扩大", text: "新向量无法由旧向量表示时，它带来新的自由参数。" },
              { kicker: "加入冗余向量", title: "张成范围不变", text: "新向量已经属于旧向量的张成空间。" },
            ],
          },
        ],
      },
      {
        number: "02",
        title: "线性相关提供一条可执行的删减规则",
        subtitle: "非平凡零组合说明至少有一个向量可以由其余向量表示。",
        blocks: [
          {
            type: "formula",
            kicker: "相关关系",
            formula: texDisplay("a_1v_1+\\cdots+a_mv_m=0,\\qquad (a_1,\\ldots,a_m)\\ne0"),
            text: "取最后一个非零系数 aⱼ，就能把 vⱼ 解成前面向量的线性组合。",
          },
          {
            type: "proof",
            items: [
              { title: "找到非零系数", text: "在非平凡关系中选 aⱼ≠0，并把 aⱼvⱼ 留在等式一侧。" },
              { title: "解出冗余向量", text: texInline("v_j=-a_j^{-1}\\sum_{i\\ne j}a_iv_i") + "，所以 vⱼ 由其余向量生成。" },
              { title: "删除而不改变张成", text: "任何用到 vⱼ 的线性组合都可代入上式改写，因此删去 vⱼ 后张成空间保持不变。" },
            ],
          },
          {
            type: "note",
            title: "Strang 的列空间读法",
            text: "把向量排成矩阵的列，相关关系就是 Ax=0 存在非零解；主元列给出保留的独立方向。",
          },
        ],
      },
      {
        number: "03",
        title: "基的核心结论是每个向量都有唯一表示",
        subtitle: "张成保证存在，线性无关保证唯一。",
        blocks: [
          {
            type: "definitions",
            items: [
              { kicker: "存在性", title: "基张成 V", text: "每个 v∈V 至少能写成 v=a₁b₁+⋯+aₙbₙ。" },
              { kicker: "唯一性", title: "基线性无关", text: "若有两组系数，二者相减得到零向量的非平凡表示；无关性迫使各差为零。" },
              { kicker: "反向判断", title: "唯一表示推出基", text: "每个向量可表示给出张成；零向量表示唯一给出线性无关。" },
            ],
          },
          {
            type: "formula",
            kicker: "基与唯一表示定理",
            formula: texDisplay("\\begin{aligned}B=(b_1,\\ldots,b_n)\\text{ 是 }V\\text{ 的基}\\\\[2pt]\\Longleftrightarrow\\quad \\forall v\\in V,\\ \\exists!\\,(x_1,\\ldots,x_n),\\\\[-1pt]v=\\sum_{i=1}^n x_ib_i.\\end{aligned}"),
            text: "这条等价关系把“方向骨架”转化成“可靠编码系统”。",
          },
        ],
      },
      {
        number: "04",
        title: "所有基等长以后，维数才有良好定义",
        subtitle: "替换定理比较任意独立组与任意生成组的长度。",
        blocks: [
          {
            type: "proof",
            items: [
              { title: "替换一个生成元", text: "把一个独立向量写成生成组的线性组合，其中至少有一个系数非零；用该独立向量替换对应生成元，张成性保持。" },
              { title: "逐个替换", text: "每加入一个独立向量，就必须占用生成组中的一个位置，因此独立组长度不超过生成组长度。" },
              { title: "比较两组基", text: "两组基都兼具独立与生成；双向应用长度不等式，得到它们含相同数量的向量。" },
              { title: "定义维数", text: "有限维空间任一基的长度记为 dim V。零空间的基为空组，维数为 0。" },
            ],
          },
          {
            type: "misconception",
            title: "维数快捷判据",
            items: [
              "在 n 维空间中，n 个线性无关向量自动构成基。",
              "在 n 维空间中，n 个张成向量自动构成基。",
              "向量位于 ℝ³ 只给出 dim U≤3；子空间自身可能是一维或二维。",
            ],
          },
        ],
      },
      {
        number: "05",
        title: "有序基把抽象向量翻译成坐标列",
        subtitle: "坐标记录唯一表示中的系数，顺序决定分量位置。",
        blocks: [
          {
            type: "formula",
            kicker: "坐标定义",
            formula: texDisplay("v=x_1b_1+\\cdots+x_nb_n,\\qquad [v]_B=(x_1,\\ldots,x_n)^T"),
            text: "向量 v 属于空间本身，坐标 [v]B 属于 Fⁿ；二者通过所选有序基联系。",
          },
          {
            type: "cards",
            items: [
              { kicker: "交换基顺序", title: "坐标分量随之换位", text: "向量保持不变，编码位置改变。" },
              { kicker: "更换基向量", title: "坐标数值重新计算", text: "同一个向量会得到另一组唯一系数。" },
              { kicker: "保留同一有序基", title: "坐标运算逐项进行", text: texInline("[u+v]_B=[u]_B+[v]_B") + "，数乘同样保持。" },
            ],
          },
        ],
      },
    ],
  },
  interactive: {
    type: "slot",
    title: "实验：从生成组删到有序基",
    description: "追踪张成范围、平行四边形面积、冗余向量和目标向量坐标。",
    task: "先让 v₂ 与 v₁ 共线，再拖出一个独立方向；加入由前两向量合成的 v₃，判断它是否增加维数，最后切换到坐标模式。",
    prompts: [
      "共线时说明为什么箭头数量增加而张成范围不变。",
      "面积变为非零时，把二维图像翻译成零组合只有平凡解。",
      "加入 v₃ 后写出它关于 v₁、v₂ 的关系，并删除这一冗余生成元。",
      "在坐标模式中确认目标向量等于两段基方向之和。",
    ],
  },
  example: {
    title: "例题：在多项式空间中删除冗余并读坐标",
    question:
      "在 " + texInline("P_2") + " 中令 " + texInline("p_1=1+x,\\ p_2=x+x^2,\\ p_3=1+2x+x^2") + "。设 " + texInline("U=\\operatorname{span}(p_1,p_2,p_3)") + "。提取 U 的一组基，求 dim U，并写出 " + texInline("q=2+3x+x^2") + " 在该有序基下的坐标。",
    choices: [
      { correct: true, text: "p₃=p₁+p₂；可取 B=(p₁,p₂)，dim U=2，[q]B=(2,1)ᵀ。" },
      { text: "三个多项式次数都不超过 2，所以它们必定线性无关，dim U=3。" },
      { text: "p₃ 冗余，因此 U 只能是一维空间。" },
      { text: "q 的坐标是 (2,3,1)ᵀ，因为多项式系数就是任意基下的坐标。" },
    ],
    steps: [
      "逐项相加可见 p₁+p₂=1+2x+x²=p₃，因此生成组线性相关。",
      "p₁ 与 p₂ 不是彼此的标量倍数，所以二者线性无关；删除 p₃ 后张成空间不变。",
      "B=(p₁,p₂) 同时张成 U 且线性无关，故为 U 的基，dim U=2。",
      "q=2p₁+p₂，因此 [q]B=(2,1)ᵀ；(2,3,1)ᵀ 是 q 在标准基 (1,x,x²) 下的坐标。",
    ],
    audit: {
      kind: "polynomial-basis",
      vectors: [[1, 1, 0], [0, 1, 1], [1, 2, 1]],
      relation: [1, 1, -1],
      basisIndices: [0, 1],
      dimension: 2,
      target: [2, 3, 1],
      coordinates: [2, 1],
    },
  },
  quiz: [
    { question: "为什么 span(S) 是包含 S 的最小子空间？", answer: "它本身是子空间并含 S；任何含 S 的子空间都对线性组合封闭，因此必须包含 span(S)。" },
    { question: "一组向量线性相关时，怎样找到可删除的向量？", answer: "从非平凡零组合中选择一个非零系数，解出对应向量，它可由其余向量表示。" },
    { question: "基为什么保证坐标存在？", answer: "基张成整个空间，所以每个向量都有一组基向量表示。" },
    { question: "基为什么保证坐标唯一？", answer: "两种表示相减会得到基向量的零组合；线性无关迫使全部系数差为零。" },
    { question: "在五维空间中，五个线性无关向量还需要验证张成吗？", answer: "无需另验。n 维空间中的 n 个线性无关向量自动构成基。" },
    { question: "交换有序基中的两个向量会改变什么？", answer: "空间和几何向量不变，基仍是基；对应的两个坐标分量交换位置。" },
  ],
  summary: [
    "相关关系指出可以删除的冗余向量，张成空间在删除后保持不变。",
    "基等价于每个向量存在唯一线性表示。",
    "所有基等长使维数成为空间不变量；有序基进一步给出坐标系统。",
  ],
  bridge: "下一节固定向量本身，比较两组有序基下的坐标，并推导带方向的过渡矩阵。",
  exercises: ["从四个生成 ℝ³ 的向量中删除冗余并给出一组基。", "比较同一多项式在两组不同有序基下的坐标。"],
});
