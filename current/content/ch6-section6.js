defineChapter6Section("intersection-sum", {
  number: "§6",
  textbookSection: "子空间的交与和",
  title: "子空间的交与和",
  navTitle: "交与和",
  question: "给定两个子空间，怎样精确求出它们共享的方向以及合起来能够生成的全部空间？维数公式为什么必须减去交空间？",
  goal: "把交空间理解为共同约束的解，把和空间理解为包含两个子空间的最小子空间；会用合并基求和、用 B_Ua=B_Wb 求交，并通过扩充交空间的基证明维数公式。",
  tags: ["交空间", "和空间", "基的合并", "维数公式"],
  prerequisites: ["会从生成组中提取基。", "会解齐次线性方程组并判断线性相关。"],
  objectives: [
    "证明 U∩W 与 U+W 都是子空间。",
    "使用 [B_U −B_W] 的零空间计算交空间。",
    "用基扩充解释 dim(U+W)=dim U+dim W−dim(U∩W)。",
  ],
  intro:
    "交与和回答两种互补问题：哪些向量同时属于 U 和 W；允许同时使用两边方向后可以到达哪里。Strang 的列空间方法给出计算路线，Axler 的基扩充论证解释了维数公式中的重复计数。",
  concepts: [
    { label: "交空间", text: texInline("U\\cap W") + " 收集同时属于两边的向量。" },
    { label: "和空间", text: texInline("U+W=\\{u+w:u\\in U,w\\in W\\}") + "。" },
    { label: "最小性", text: "U+W 是包含 U∪W 的最小子空间。" },
    { label: "维数公式", text: texInline("\\dim(U+W)=\\dim U+\\dim W-\\dim(U\\cap W)") + "。" },
  ],
  textbook: {
    reference: "Axler · Strang · Friedberg",
    items: ["交空间", "和空间与最小性", "交与和的基算法", "维数公式及证明"],
  },
  story: {
    title: "交与和：一边提取共同方向，一边合并全部方向",
    lead:
      "平面中两条直线的夹角只能提供第一层直觉。一般计算必须回到基：合并两组基得到和空间；令两种基表示同一个向量得到交空间。",
    modules: [
      {
        number: "01",
        title: "交空间同时满足两边的全部条件",
        subtitle: "任意子空间之交都保持线性组合封闭。",
        blocks: [
          {
            type: "formula",
            kicker: "交空间",
            formula: texDisplay("U\\cap W=\\{v:v\\in U\\text{ 且 }v\\in W\\}"),
            text: "若 x,y 同时属于 U 与 W，则 αx+βy 在两边都成立，因而仍在交空间中。",
          },
          {
            type: "cards",
            items: [
              { kicker: "包含关系", title: texInline("U\\subseteq W"), text: "此时 U∩W=U，较小空间就是全部共同方向。" },
              { kicker: "互补方向", title: texInline("U\\cap W=\\{0\\}"), text: "两边没有共享的非零方向；下一节会把它与唯一分解联系。" },
              { kicker: "方程视角", title: "同时满足两组齐次约束", text: "把约束矩阵上下拼接即可描述交空间。" },
            ],
          },
        ],
      },
      {
        number: "02",
        title: "和空间是包含两边的最小子空间",
        subtitle: "集合并只把元素放在一起，和空间还加入跨两边的线性合成。",
        blocks: [
          {
            type: "proof",
            items: [
              { title: "包含 U 与 W", text: "对 u∈U 取 w=0，可得 u=u+0∈U+W；W 同理。" },
              { title: "线性组合封闭", text: "把 U 分量合成 " + texInline("\\alpha u_1+\\beta u_2") + "，把 W 分量合成 " + texInline("\\alpha w_1+\\beta w_2") + "；两部分仍分别属于 U、W。" },
              { title: "最小性", text: "任何同时包含 U 与 W 的子空间都对加法封闭，因而包含每个 u+w。" },
            ],
          },
          {
            type: "misconception",
            title: "U∪W 与 U+W 的边界",
            items: [
              "U∪W 一般缺少跨空间的和 u+w。",
              "当 U⊆W 或 W⊆U 时，集合并才是其中较大的子空间，并与和空间相同。",
              "和空间中的表示 u+w 可能不唯一；唯一性留给 §7。",
            ],
          },
        ],
      },
      {
        number: "03",
        title: "求和空间：合并两组基，再删除冗余",
        subtitle: "矩阵的列空间把这条路线变成一次秩计算。",
        blocks: [
          {
            type: "formula",
            kicker: "基矩阵法",
            formula: texDisplay("U=\\operatorname{Col}(B_U),\\quad W=\\operatorname{Col}(B_W),\\quad U+W=\\operatorname{Col}[B_U\\ B_W]"),
            text: "拼接矩阵的主元列对应 U+W 的一组基，秩就是 dim(U+W)。",
          },
          {
            type: "proof",
            items: [
              { title: "合并", text: "U 的基与 W 的基放在一起，一定生成所有 u+w。" },
              { title: "筛选", text: "用消元或相关性引理删除能由前面列表示的向量。" },
              { title: "读取", text: "剩余独立列形成 U+W 的基；不要直接使用行最简矩阵的非零列替代原向量。" },
            ],
          },
        ],
      },
      {
        number: "04",
        title: "求交空间：让两种基表示同一个向量",
        subtitle: "公共向量同时具有 U 表示与 W 表示。",
        blocks: [
          {
            type: "formula",
            kicker: "联立系数",
            formula: texDisplay("B_Ua=B_Wb\\iff[B_U\\ -B_W]\\begin{bmatrix}a\\\\b\\end{bmatrix}=0"),
            text: "先求系数对 (a,b)，再把 a 代回 B_Ua；所得非零公共向量还要去重并提取基。",
          },
          {
            type: "note",
            title: "计算检查",
            text: "每个得到的交空间基向量都应分别能由 U 的基和 W 的基表示。只算出系数零空间的维数，还没有写出交空间本身。",
          },
        ],
      },
      {
        number: "05",
        title: "维数公式来自一组精确的基拼接",
        subtitle: "先固定公共方向，再分别补齐两边独有方向。",
        blocks: [
          {
            type: "proof",
            items: [
              { title: "交空间基", text: "取 E=(e₁,…,eᵣ) 为 U∩W 的基。" },
              { title: "分别扩充", text: "扩充为 U 的基 (E,u₁,…,uₚ) 与 W 的基 (E,w₁,…,w_q)。" },
              { title: "构造和空间基", text: "(E,u₁,…,uₚ,w₁,…,w_q) 张成 U+W；利用两边表示可证明它线性无关。" },
              { title: "数向量", text: "dim U=r+p，dim W=r+q，dim(U+W)=r+p+q，于是得到维数公式。" },
            ],
          },
          {
            type: "formula",
            kicker: "重复计数校正",
            formula: texDisplay("\\dim(U+W)=\\dim U+\\dim W-\\dim(U\\cap W)"),
            text: "交空间中的每个公共方向在 dim U 与 dim W 中各出现一次，合并时只应保留一次。",
          },
        ],
      },
    ],
  },
  interactive: {
    type: "slot",
    title: "实验：子空间混合器与维数账本",
    description: "连续改变两条过原点直线的夹角，观察二维边界情形中的交与和。",
    task: "先预测两条不同直线与重合直线的维数账，再拖动到夹角 0；最后说明这个二维实验怎样对应一般维数公式。",
    prompts: [
      "两条直线分开时，指出唯一公共向量以及两个独立方向铺成的范围。",
      "把夹角拖到 0，观察交空间和和空间的维数同时怎样改变。",
      "用 1+1−dim(U∩W) 核对每个状态。",
      "回到正式内容，说明 ℝ³ 中求交为何需要联立基系数。",
    ],
  },
  example: {
    title: "例题：精确求交、和与基",
    question:
      "在 ℝ³ 中设 " + texInline("U=\\operatorname{span}\\{(1,0,1)^T,(0,1,1)^T\\}") + "，" + texInline("W=\\operatorname{span}\\{(1,1,0)^T,(1,-1,2)^T\\}") + "。求 U∩W 与 U+W 的基，并验证维数公式。",
    choices: [
      { correct: true, text: "U∩W=span{(1,0,1)ᵀ}；U+W=ℝ³，可取基 {(1,0,1)ᵀ,(0,1,1)ᵀ,(1,1,0)ᵀ}；2+2−1=3。" },
      { text: "交空间是 {0}，因为两组生成向量没有相同元素。" },
      { text: "和空间维数为 4，因为两边各有两个基向量。" },
      { text: "U∪W 已经包含两边全部向量，所以等于 U+W。" },
    ],
    steps: [
      "写 u=(p,q,p+q)，w=(r+s,r−s,2s)，令 u=w。",
      "由 p=r+s、q=r−s、p+q=2s 得 r=s、q=0、p=2r，因此 U∩W=span{(1,0,1)ᵀ}。",
      "合并生成组后，(1,0,1)ᵀ、(0,1,1)ᵀ、(1,1,0)ᵀ 线性无关，故形成 U+W 的基并张成 ℝ³。",
      "dim U=2、dim W=2、dim(U∩W)=1，维数公式给出 dim(U+W)=2+2−1=3。",
    ],
    audit: {
      kind: "intersection-sum",
      U: [[1, 0, 1], [0, 1, 1]],
      W: [[1, 1, 0], [1, -1, 2]],
      intersectionBasis: [[1, 0, 1]],
      intersectionUCoefficients: [[1, 0]],
      intersectionWCoefficients: [[0.5, 0.5]],
      sumBasis: [[1, 0, 1], [0, 1, 1], [1, 1, 0]],
      dimensions: { U: 2, W: 2, intersection: 1, sum: 3 },
    },
  },
  quiz: [
    { question: "为什么 U+W 一定包含 U 和 W？", answer: "对子空间中的向量补上另一边的零向量：u=u+0，w=0+w。" },
    { question: "什么时候 U∪W 是子空间？", answer: "对两个子空间而言，当且仅当其中一个包含另一个；此时并集等于较大的子空间。" },
    { question: "已知两边基矩阵，怎样计算 U+W？", answer: "拼接 [B_U B_W]，在原列中选出主元列，得到和空间的一组基。" },
    { question: "怎样把求 U∩W 转成齐次方程？", answer: "令 B_Ua=B_Wb，求 [B_U −B_W](a,b)ᵀ=0，再将系数代回任一侧。" },
    { question: "维数公式为什么减去交空间维数？", answer: "公共基方向在 dim U 与 dim W 中被计算了两次，合并后的基只保留一次。" },
    { question: "若 U⊆W，维数公式怎样化简？", answer: "U∩W=U、U+W=W，右侧 dim U+dim W−dim U=dim W。" },
  ],
  summary: [
    "交空间提取共同方向，和空间是同时包含两边的最小子空间。",
    "合并基求和，联立 B_Ua=B_Wb 求交。",
    "维数公式由先取交空间基、再分别扩充的构造证明。",
  ],
  bridge: "下一节为和空间增加唯一性要求：交空间只含零向量时，每个分解中的公共搬运方向消失。",
  exercises: ["用基矩阵算法求两个 ℝ⁴ 子空间的交与和。", "证明 U+W=U 等价于 W⊆U。"],
});
