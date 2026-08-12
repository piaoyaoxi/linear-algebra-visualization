defineChapter6Section("direct-sum", {
  number: "§7",
  textbookSection: "子空间的直和",
  title: "子空间的直和",
  navTitle: "直和",
  question: "向量能够写成 u+w 以后，还需要什么条件才能保证这种分解对每个向量都存在且唯一？两个以上子空间时，为什么两两交为零仍可能不够？",
  goal: "把直和理解为存在性与唯一性的合取；证明二子空间情形中唯一性等价于零交；使用零向量只有平凡分解的通用判据；理解基拼接、维数相加、补空间与正交直和之间的关系。",
  tags: ["存在与唯一", "零交判据", "多子空间直和", "补空间"],
  prerequisites: ["掌握交空间、和空间及维数公式。", "理解基扩充与唯一线性表示。"],
  objectives: [
    "分别检查 V=U+W 与 U∩W={0}。",
    "从两种分解相减证明唯一性。",
    "构造三个子空间两两交为零但总和不直的反例。",
  ],
  intro:
    "和空间只保证可以合成，直和进一步保证合成方式唯一。Axler 把直和定义成唯一表示，Friedberg 用基拼接和维数解释它，Hoffman–Kunze 则把直和连接到投影与分块结构。这里先牢牢分开“分解存在”和“分解唯一”两道门。",
  videoPlan: {
    title: "唯一分解与公共方向",
    duration: "约 2 分钟",
    scenes: ["斜着的两个方向唯一分解 v。", "出现公共方向 z。", "沿 z 在两个分量间搬运。", "收束为零向量只有平凡分解。"],
  },
  concepts: [
    { label: "直和", text: texInline("V=U\\oplus W") + " 表示每个 v∈V 有唯一分解 v=u+w。" },
    { label: "二空间判据", text: texInline("V=U+W") + " 且 " + texInline("U\\cap W=\\{0\\}") + "。" },
    { label: "通用判据", text: "零向量只有所有分量都为零的分解。" },
    { label: "补空间", text: texInline("V=U\\oplus W") + " 时 W 是 U 的一个补空间。" },
  ],
  textbook: {
    reference: "Axler · Friedberg · Hoffman–Kunze",
    items: ["唯一分解定义", "零交判据", "基拼接", "多子空间直和", "补空间"],
  },
  story: {
    title: "直和：把“能够分解”升级为“存在唯一分解”",
    lead:
      "直和符号 ⊕ 同时承诺两件事：目标空间已经被覆盖，并且每个向量的分量没有歧义。任何一次判断都应先分开检查，再把结论合起来。",
    modules: [
      {
        number: "01",
        title: "存在与唯一是两道独立闸门",
        subtitle: "一个条件回答能否分解，另一个回答分解会不会重复。",
        blocks: [
          {
            type: "definitions",
            items: [
              { kicker: "覆盖闸门", title: texInline("V=U+W"), text: "每个 v∈V 至少拥有一种表示 v=u+w。" },
              { kicker: "唯一闸门", title: texInline("U\\cap W=\\{0\\}"), text: "两边没有可在分量之间搬运的非零公共方向。" },
              { kicker: "直和结论", title: texInline("V=U\\oplus W"), text: "每个 v∈V 恰有一种 U 分量与 W 分量。" },
            ],
          },
          {
            type: "misconception",
            title: "只通过一道门的两种情形",
            items: [
              "U=V、W 为 V 中一条非零直线时覆盖成立，交空间等于 W，分解不唯一。",
              "W={0}、U 为 V 的真子空间时交为零，许多 v 无法分解。",
              "检查某一个目标向量不够；直和条件必须覆盖 V 中的每个向量。",
            ],
          },
        ],
      },
      {
        number: "02",
        title: "二子空间中，零交恰好保证唯一性",
        subtitle: "把同一向量的两种分解相减，差落入交空间。",
        blocks: [
          {
            type: "proof",
            items: [
              { title: "假设两种分解", text: texInline("v=u_1+w_1=u_2+w_2") + "。" },
              { title: "移项", text: texInline("u_1-u_2=w_2-w_1") + "；左侧属于 U，右侧属于 W。" },
              { title: "进入交空间", text: "这个共同向量属于 U∩W；若交空间为 {0}，两边都只能为零。" },
              { title: "得到唯一", text: "u₁=u₂ 且 w₁=w₂。反向地，非零 z∈U∩W 会产生 0=z+(−z) 的第二种分解。" },
            ],
          },
          {
            type: "formula",
            kicker: "公共方向搬运",
            formula: texDisplay("v=u+w=(u+tz)+(w-tz),\\qquad z\\in U\\cap W"),
            text: "当 z≠0 时，改变 t 会改变两个分量，同时保持总和 v 不变。",
          },
        ],
      },
      {
        number: "03",
        title: "基拼接把直和变成唯一坐标系统",
        subtitle: "两边各自的基合并后，张成性与无关性同时成立。",
        blocks: [
          {
            type: "proof",
            items: [
              { title: "张成", text: "V=U+W 保证每个 v 可先分成 u+w，再分别用 U、W 的基展开。" },
              { title: "无关", text: "拼接基的零组合给出一个 U 向量与一个 W 向量互为相反数；零交迫使两部分都为零。" },
              { title: "维数", text: "拼接后向量个数相加，所以 dim V=dim U+dim W。" },
            ],
          },
          {
            type: "formula",
            kicker: "基拼接",
            formula: texDisplay("B_U=(u_1,\\ldots,u_r),\\ B_W=(w_1,\\ldots,w_s)\\Longrightarrow B_V=(u_1,\\ldots,u_r,w_1,\\ldots,w_s)"),
            text: "相对于这组基，前 r 个坐标属于 U 分量，后 s 个坐标属于 W 分量。",
          },
        ],
      },
      {
        number: "04",
        title: "多个子空间要检查零向量的全部表示",
        subtitle: "两两交为零只检查了成对关系，无法排除三个方向共同形成依赖。",
        blocks: [
          {
            type: "formula",
            kicker: "通用直和判据",
            formula: texDisplay("U_1+\\cdots+U_m\\text{ 为直和}\\iff u_1+\\cdots+u_m=0\\Rightarrow u_1=\\cdots=u_m=0"),
            text: "这与一组向量线性无关的零组合判据完全平行。",
          },
          {
            type: "misconception",
            title: "三子空间反例",
            items: [
              "在 ℝ² 中取 " + texInline("U_1=\\operatorname{span}(e_1)") + "、" + texInline("U_2=\\operatorname{span}(e_2)") + "、" + texInline("U_3=\\operatorname{span}(e_1+e_2)") + "。",
              "任意两条不同过原点直线的交都是 {0}，所以三个子空间两两交为零。",
              texInline("e_1+e_2-(e_1+e_2)=0") + " 给出来自三个子空间的非平凡零分解，因此三者之和不直。",
            ],
          },
        ],
      },
      {
        number: "05",
        title: "有限维子空间总能找到补空间",
        subtitle: "补空间通常有很多个，正交补只是带内积时的一种特殊选择。",
        blocks: [
          {
            type: "proof",
            items: [
              { title: "从 U 的基开始", text: "取 U 的一组基 (u₁,…,uᵣ)。" },
              { title: "扩充为 V 的基", text: "加入 w₁,…,wₛ，得到 V 的基。" },
              { title: "定义补空间", text: texInline("W=\\operatorname{span}(w_1,\\ldots,w_s)") + "，拼接基立即给出 V=U⊕W。" },
            ],
          },
          {
            type: "cards",
            items: [
              { kicker: "一般补空间", title: "方向可以倾斜", text: "零交与覆盖已经足够。" },
              { kicker: "正交补", title: texInline("V=U\\oplus U^\\perp"), text: "需要内积结构，并可通过正交投影读取分量。" },
              { kicker: "后续联系", title: "投影与分块矩阵", text: "选定直和分解后，线性映射可以按分量组织成块。" },
            ],
          },
        ],
      },
    ],
  },
  interactive: {
    type: "slot",
    title: "实验：覆盖闸门与唯一性闸门",
    description: "固定目标向量，比较斜直和、正交直和、覆盖但不唯一以及零交但未覆盖。",
    task: "逐个场景先判断全空间是否覆盖，再判断公共非零方向；在重叠场景拖动 t，记录两个分量如何变化。",
    prompts: [
      "在非正交情形确认两条斜方向仍给出唯一分解。",
      "让夹角逐渐接近 0，观察分量长度增大以及边界处的失效。",
      "在 U=ℝ²、W=span{z} 中拖动 t，验证 u+tz 与 w−tz 的总和固定。",
      "比较 W={0} 的情形，说明零交为何不能单独保证覆盖。",
    ],
  },
  example: {
    title: "例题：直线与平面的直和分解",
    question:
      "在 ℝ³ 中设 " + texInline("U=\\operatorname{span}\\{(1,1,0)^T\\}") + "，" + texInline("W=\\{(x,y,z):x+y=0\\}") + "。判断是否有 " + texInline("\\mathbb{R}^3=U\\oplus W") + "，并把 " + texInline("v=(2,0,3)^T") + " 分解为 u+w。",
    choices: [
      { correct: true, text: "U∩W={0} 且维数和为 3，所以 ℝ³=U⊕W；u=(1,1,0)ᵀ，w=(1,−1,3)ᵀ。" },
      { text: "U 与 W 没有正交，所以不能构成直和。" },
      { text: "(1,1,0)ᵀ 属于 W，因为它的第三坐标为 0。" },
      { text: "直和要求 dim U=dim W。" },
    ],
    steps: [
      "W 是由 x+y=0 定义的二维齐次平面；U 的生成向量满足 1+1≠0，所以 U∩W={0}。",
      "dim U+dim W=1+2=3=dim ℝ³；结合零交，得到 ℝ³=U⊕W。",
      "令 u=t(1,1,0)ᵀ，w=v−u=(2−t,−t,3)ᵀ。要求 w∈W，得到 (2−t)+(−t)=0，所以 t=1。",
      "因此 u=(1,1,0)ᵀ、w=(1,−1,3)ᵀ；直和保证这组分解唯一。",
    ],
    audit: {
      kind: "direct-sum",
      UBasis: [[1, 1, 0]],
      WBasis: [[1, -1, 0], [0, 0, 1]],
      target: [2, 0, 3],
      uPart: [1, 1, 0],
      wPart: [1, -1, 3],
      combinedDimension: 3,
      intersectionDimension: 0,
    },
  },
  quiz: [
    { question: "V=U⊕W 同时承诺哪两件事？", answer: "每个 v∈V 至少能分解为 u+w，并且这组分解唯一。" },
    { question: "为什么非零 z∈U∩W 会破坏唯一性？", answer: "v=u+w 还可写成 (u+tz)+(w−tz)，不同 t 给出不同分量。" },
    { question: "交为 {0} 为什么不能单独推出 V=U⊕W？", answer: "它只控制唯一性，还需 U+W=V 保证每个向量都有分解。" },
    { question: "三个子空间两两交为 {0} 是否足够得到直和？", answer: "不够。还需检查 u₁+u₂+u₃=0 只有全零分解；三条不同直线可在 ℝ² 中形成非平凡依赖。" },
    { question: "有限维空间中怎样为 U 构造一个补空间？", answer: "把 U 的基扩充为 V 的基，用新增基向量的张成作为补空间。" },
    { question: "一般直和是否要求 U⊥W？", answer: "不要求；正交性是带内积时的额外条件。" },
  ],
  summary: [
    "直和把覆盖与零交合在一起，等价于每个向量存在唯一分解。",
    "二子空间可用 U∩W={0} 判断唯一性；多子空间必须检查零向量只有平凡分解。",
    "直和时基可直接拼接、维数直接相加；基扩充保证有限维子空间存在补空间。",
  ],
  bridge: "下一节把“同一空间内的唯一分解”提升为“两个空间之间的可逆结构对应”，得到线性同构。",
  exercises: ["给出 ℝ³ 中同一平面的两个不同补空间。", "构造三个两两交为零但总和不直的子空间。"],
});
