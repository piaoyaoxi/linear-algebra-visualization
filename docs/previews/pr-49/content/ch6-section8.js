defineChapter6Section("isomorphism", {
  number: "§8",
  textbookSection: "线性空间的同构",
  title: "线性空间的同构",
  navTitle: "同构",
  question: "多项式、矩阵和坐标列的元素类型完全不同，怎样证明它们拥有相同的线性结构？为什么有限维空间最终由数域与维数分类？",
  goal: "把线性同构理解为保持线性组合的双射；证明逆映射自动线性；用基向量的对应构造同构，证明同数域有限维空间同构当且仅当维数相同，并说明坐标同构的基依赖性。",
  tags: ["线性同构", "基决定映射", "坐标同构", "维数不变量"],
  prerequisites: ["掌握映射的单射、满射、双射。", "理解有序基、坐标与维数。"],
  objectives: [
    "分别验证一个映射的线性、单射与满射。",
    "通过把一组基送到另一组基构造同构。",
    "解释同构保持线性结构，同时长度与角度需要额外条件。",
  ],
  intro:
    "同构忽略元素外形，只比较线性组合的组织方式。一个可逆的线性桥会把加法、数乘、线性相关、基和维数完整传到另一边。Axler 的基映射定理给出构造方法，Friedberg 则把坐标映射作为抽象空间与 Fⁿ 之间的标准桥。",
  videoPlan: {
    title: "外表不同，结构相同",
    duration: "约 2—3 分钟",
    scenes: ["并排多项式、对称矩阵与坐标列。", "逐一对应基向量。", "同步执行加法和数乘。", "用维数收束分类。"],
  },
  concepts: [
    { label: "线性", text: texInline("T(au+bv)=aT(u)+bT(v)") + "。" },
    { label: "同构", text: "线性且双射的映射。" },
    { label: "基映射", text: "线性映射由一组基上的取值唯一决定。" },
    { label: "维数判据", text: "同一数域上的有限维空间同构，当且仅当维数相等。" },
    { label: "坐标同构", text: texInline("v\\mapsto[v]_B") + " 把 V 与 Fⁿ 对应。" },
  ],
  textbook: {
    reference: "Axler · Friedberg · Strang",
    items: ["线性同构", "逆映射线性", "基决定线性映射", "有限维维数判据", "坐标同构"],
  },
  story: {
    title: "同构：在不同外表之间识别同一线性结构",
    lead:
      "一座同构桥必须通过三道检查：保持线性组合、没有信息碰撞、覆盖整个目标空间。三项合起来，才允许在两边无损地来回翻译。",
    modules: [
      {
        number: "01",
        title: "同构由线性与双射共同组成",
        subtitle: "线性保留运算，单射和满射保证信息完整。",
        blocks: [
          {
            type: "definitions",
            items: [
              { kicker: "线性", title: texInline("T(au+bv)=aT(u)+bT(v)"), text: "任意有限线性组合都可以先组合再映射，也可以先映射再组合。" },
              { kicker: "单射", title: texInline("T(u)=T(v)\\Rightarrow u=v"), text: "不同向量不会压到同一个输出，信息可以追溯。" },
              { kicker: "满射", title: texInline("T(V)=W"), text: "目标空间中的每个向量都能从源空间得到。" },
              { kicker: "同构", title: texInline("V\\cong W"), text: "存在一条同时满足线性、单射和满射的映射。" },
            ],
          },
          {
            type: "misconception",
            title: "三项检查缺一不可",
            items: [
              "投影可以线性且满射，同时丢失被压掉方向，因此单射失败。",
              "嵌入可以线性且单射，同时只到达目标空间的一部分，因此满射失败。",
              "逐坐标平方可能是双射或非双射的候选规则，线性仍需单独验证。",
            ],
          },
        ],
      },
      {
        number: "02",
        title: "线性双射的逆映射自动线性",
        subtitle: "双射先保证逆映射存在，线性再传到反向。",
        blocks: [
          {
            type: "proof",
            items: [
              { title: "选取目标向量", text: "令 y₁=T(v₁)、y₂=T(v₂)。满射保证目标向量都有原像，单射保证原像唯一。" },
              { title: "使用 T 的线性", text: texInline("ay_1+by_2=T(av_1+bv_2)") + "。" },
              { title: "应用逆映射", text: texInline("T^{-1}(ay_1+by_2)=av_1+bv_2=aT^{-1}(y_1)+bT^{-1}(y_2)") + "。" },
              { title: "双向翻译", text: "因此同构可以在两个方向完整保持线性组合。" },
            ],
          },
        ],
      },
      {
        number: "03",
        title: "一组基上的取值唯一决定线性映射",
        subtitle: "先规定基向量去哪里，再按线性组合扩展到整个空间。",
        blocks: [
          {
            type: "formula",
            kicker: "基扩展公式",
            formula: texDisplay("\\begin{aligned}v&=x_1b_1+\\cdots+x_nb_n,\\\\[2pt]T(v)&=x_1T(b_1)+\\cdots+x_nT(b_n).\\end{aligned}"),
            text: "基表示的唯一性确保右侧定义良好；因此任意指定 T(b₁),…,T(bₙ) 都产生唯一线性映射。",
          },
          {
            type: "proof",
            items: [
              { title: "把源空间基映到目标空间基", text: "若 B=(b₁,…,bₙ)、C=(c₁,…,cₙ)，规定 T(bᵢ)=cᵢ。" },
              { title: "线性扩展", text: "按上式定义任意 v 的像；基坐标唯一使 T 唯一。" },
              { title: "构造逆映射", text: "把 cᵢ 送回 bᵢ 并线性扩展，得到 T 的逆；所以 T 是同构。" },
            ],
          },
        ],
      },
      {
        number: "04",
        title: "有限维空间由数域与维数分类",
        subtitle: "同维给出基到基的构造，异维由基长度排除。",
        blocks: [
          {
            type: "proof",
            items: [
              { title: "同维推出同构", text: "选取两边各含 n 个向量的基，把第 i 个基向量对应到第 i 个基向量，并线性扩展。" },
              { title: "同构保持基", text: "若 B 是 V 的基，线性与双射保证 T(B) 在 W 中既生成又无关。" },
              { title: "同构推出同维", text: "T(B) 是 W 的基，含有与 B 相同数量的向量，所以 dim V=dim W。" },
            ],
          },
          {
            type: "formula",
            kicker: "有限维判据",
            formula: texDisplay("V\\cong W\\iff\\dim V=\\dim W\\qquad(\\text{同一数域、有限维})"),
            text: "维数相等保证存在某个同构；一个具体公式仍需逐项检查线性与双射。",
          },
        ],
      },
      {
        number: "05",
        title: "坐标映射是最基本、也依赖选择的同构",
        subtitle: "选定有序基后，抽象空间就能与 Fⁿ 无损往返。",
        blocks: [
          {
            type: "formula",
            kicker: "坐标同构",
            formula: texDisplay("T_B:V\\longrightarrow F^n,\\qquad v\\longmapsto[v]_B"),
            text: "逆映射把坐标列 (x₁,…,xₙ)ᵀ 送回 x₁b₁+⋯+xₙbₙ。选择另一组基会得到另一条同构桥。",
          },
          {
            type: "cards",
            items: [
              { kicker: "自动保持", title: "线性组合与相关性", text: "同构把零组合、张成、基和子空间对应到另一边。" },
              { kicker: "核心不变量", title: "维数", text: "有限维同构空间拥有相同的基长度。" },
              { kicker: "需要额外结构", title: "长度、角度与正交", text: "只有进一步保持内积的等距同构才自动保存这些量。" },
              { kicker: "非唯一性", title: "不同基给出不同桥", text: "“存在同构”通常没有指定一条天然唯一的对应。" },
            ],
          },
        ],
      },
    ],
  },
  interactive: {
    type: "slot",
    title: "实验：线性与双射的双重验收",
    description: "在 P₂ 与坐标空间之间比较完整坐标桥、丢失系数的投影和末坐标平方规则。",
    task: "对每种规则先检查线性组合是否同步，再分别检查信息碰撞与目标遗漏；只有三项都通过时确认同构。",
    prompts: [
      "拖动 a、b、c，观察多项式曲线与坐标点同步变化。",
      "在坐标模式比较 T(αf+βg) 与 αT(f)+βT(g)。",
      "切换投影模式，寻找两个不同多项式得到同一输出的例子。",
      "切换平方模式，用负数数乘或第三坐标为负的目标找出失败。",
    ],
  },
  example: {
    title: "例题：非标准基给出的坐标同构",
    question:
      "在 " + texInline("P_2") + " 中取有序基 " + texInline("B=(1,1+x,x+x^2)") + "，定义 " + texInline("T(p)=[p]_B") + "。求 " + texInline("T(a+bx+cx^2)") + " 与 T⁻¹ 的公式，并说明 T 为什么是同构。",
    choices: [
      { correct: true, text: "T(a+bx+cx²)=(a−b+c,b−c,c)ᵀ；T⁻¹(r,s,t)=(r+s)+(s+t)x+tx²；T 是坐标同构。" },
      { text: "T(a+bx+cx²)=(a,b,c)ᵀ，因为任何基下的坐标都等于标准系数。" },
      { text: "T 不是同构，因为 P₂ 的元素是多项式而 ℝ³ 的元素是列向量。" },
      { text: "维数相同已经说明这个具体 T 正确，无需计算 T 的公式。" },
    ],
    steps: [
      "设 p=r·1+s(1+x)+t(x+x²)=(r+s)+(s+t)x+tx²。",
      "比较系数得到 t=c、s=b−c、r=a−b+c，所以 T(p)=(a−b+c,b−c,c)ᵀ。",
      "反向使用展开式，T⁻¹(r,s,t)=(r+s)+(s+t)x+tx²。",
      "坐标映射保持加法与数乘，且已写出双向逆公式，因此 T 线性且双射。",
    ],
    audit: {
      kind: "coordinate-isomorphism",
      basis: [[1, 0, 0], [1, 1, 0], [0, 1, 1]],
      forwardMatrix: [[1, -1, 1], [0, 1, -1], [0, 0, 1]],
      inverseMatrix: [[1, 1, 0], [0, 1, 1], [0, 0, 1]],
    },
  },
  quiz: [
    { question: "线性同构需要通过哪三项检查？", answer: "保持线性组合、单射、满射；后两项合起来就是双射。" },
    { question: "为什么线性双射的逆映射自动线性？", answer: "把目标向量写成 T(v₁)、T(v₂)，利用 T 的线性后应用唯一的逆像即可得到逆映射的线性公式。" },
    { question: "为什么线性映射由一组基上的取值唯一决定？", answer: "每个向量在基下有唯一线性表示，线性要求其像等于相同系数的基向量像之组合。" },
    { question: "同维为什么能构造同构？", answer: "分别选取同样长度的基，将基向量一一对应并线性扩展，反向基对应给出逆映射。" },
    { question: "同构是否自动保持长度和角度？", answer: "一般线性同构只保持线性结构；长度和角度需要进一步保持内积。" },
    { question: "坐标同构为什么通常不唯一？", answer: "每一组有序基都会给出一条坐标映射，换基后具体坐标规则随之改变。" },
  ],
  summary: [
    "线性同构是保持线性组合的双射，其逆映射也线性。",
    "把一组基映到另一组基并线性扩展，可以显式构造同构。",
    "同一数域上的有限维空间同构当且仅当维数相同；坐标映射给出 V≅Fⁿ。",
  ],
  bridge: "本章从映射语言走到线性结构、唯一坐标、子空间分解与同构。下一章将系统研究一般线性映射的核、像和矩阵表示。",
  exercises: ["构造 2×2 实对称矩阵空间与 ℝ³ 的一个同构。", "给出一个线性满射但非单射，以及一个线性单射但非满射。"],
});
