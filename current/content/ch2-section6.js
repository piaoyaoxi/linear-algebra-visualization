defineChapter2Section("cofactor-expansion", {
  number: "§6",
  textbookSection: "行列式按一行（列）展开",
  title: "行列式按一行（列）展开",
  navTitle: "按行列展开",
  question: "删去一个元素所在的行和列，为何得到的低阶行列式恰好收集了原行列式中的一整组乘积项？",
  goal: "严格区分余子矩阵、余子式与代数余子式，并把 Leibniz 求和按固定行中的选择分组，从而推导按任意一行或一列展开的公式。",
  tags: ["余子式", "代数余子式", "分组展开"],
  prerequisites: [
    "掌握 Leibniz 排列求和定义。",
    "会判断排列符号与棋盘符号。",
  ],
  objectives: [
    "从位置 (i,j) 正确构造余子矩阵、Mij 和 Cij。",
    "说明按行展开是对 Leibniz 乘积项的分组。",
    "根据零元素分布选择计算成本最低的展开方向。",
  ],
  intro:
    "固定第 i 行后，每条合法路径都必须在这一行选中唯一的某个 aij。把选中同一个 aij 的路径归为一组，剩余选择恰好落在删去第 i 行、第 j 列后的矩阵中。",
  concepts: [
    { label: "余子式", text: `${texInline("M_{ij}")} 是删去第 i 行、第 j 列后的 n-1 阶行列式。` },
    { label: "代数余子式", text: `${texInline("C_{ij}=(-1)^{i+j}M_{ij}")}。` },
    { label: "按行展开", text: `${texInline("\\det(A)=\\sum_j a_{ij}C_{ij}")}。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §6",
    page: "",
    items: ["余子式与代数余子式", "按行列展开", "交叉恒等式"],
  },
  story: {
    title: "余子式展开来自对 Leibniz 项的重新分组",
    lead: "划掉一行一列只是结果的图像。真正的理由是：固定 aij 后，原来所有经过它的合法路径，与余子矩阵中的全部合法路径一一对应。",
    modules: [
      {
        number: "01",
        title: "三个对象依次产生",
        subtitle: "矩阵、标量与带位置符号的标量必须分清。",
        blocks: [
          {
            type: "definitions",
            items: [
              { kicker: "余子矩阵", title: "删去第 i 行与第 j 列", text: "保留其余元素的相对行列次序，得到一个 (n-1) 阶矩阵。" },
              { kicker: "余子式", title: texInline("M_{ij}"), text: "对余子矩阵取行列式，得到一个标量。" },
              { kicker: "代数余子式", title: texInline("C_{ij}=(-1)^{i+j}M_{ij}"), text: "位置符号补回 aij 移到首行首列时产生的交换奇偶性。" },
            ],
          },
        ],
      },
      {
        number: "02",
        title: "把全部排列项按一行分组",
        subtitle: "每条合法路径在第 i 行必定经过唯一一个 aij。",
        blocks: [
          {
            type: "proof",
            items: [
              `固定第 i 行，把 Leibniz 求和按条件 ${texInline("\\sigma(i)=j")} 分成 n 组。`,
              `第 j 组的每个乘积都含因子 ${texInline("a_{ij}")}；提出它后，剩余因子不再使用第 i 行和第 j 列。`,
              "这些剩余因子遍历余子矩阵中的全部合法路径，因此其带符号和等于 Mij，差一个位置符号。",
              `把 ${texInline("(-1)^{i+j}")} 合入余子式，得到 ${texInline("C_{ij}")}；第 j 组恰为 ${texInline("a_{ij}C_{ij}")}。`,
              `对 j 求和即得 ${texInline("\\det(A)=\\sum_{j=1}^n a_{ij}C_{ij}")}。按列展开完全同理。`,
            ],
          },
          {
            type: "formula",
            kicker: "任意一行或一列",
            formula: texDisplay("\\det(A)=\\sum_{j=1}^{n}a_{rj}C_{rj}=\\sum_{i=1}^{n}a_{is}C_{is}"),
            text: "第一个求和固定第 r 行，第二个求和固定第 s 列；任意一行或一列都可以展开。",
          },
        ],
      },
      {
        number: "03",
        title: "路线选择与交叉恒等式",
        subtitle: "同一个展开结构既能减少计算，也能识别零。",
        blocks: [
          {
            type: "cards",
            columns: 2,
            items: [
              { kicker: "最省路线", title: "沿零最多的行或列展开", text: "aij=0 的组直接消失，只需计算非零元素对应的余子式。" },
              { kicker: "交叉和", title: texInline("\\sum_j a_{rj}C_{sj}=0\\;(r\\ne s)"), text: "它等于把第 s 行替换成第 r 行后沿第 s 行展开；新矩阵含两行相同，行列式为 0。" },
            ],
          },
          {
            type: "misconception",
            items: [
              "棋盘符号帮助定位，代数定义仍是 (-1)^(i+j)。",
              "一行中出现若干零只会删除相应组；整行全零才直接得到 det=0。",
              "展开方向改变计算量，不改变行列式结果。",
            ],
          },
        ],
      },
    ],
  },
  interactive: {
    type: "slot",
    visualTitle: "余子式分组器 · 从一个元素追踪一组路径",
    description: "点击元素会删去对应行列并形成余子矩阵；路线面板同时比较六种展开方向所需的非零余子式数量。",
    task: "先预测最省的展开方向，再点击一个非零元素，依次读出余子矩阵、Mij、位置符号和 Cij。",
    prediction: {
      question: `对矩阵 ${texInline("\\begin{bmatrix}1&2&0\\\\0&3&0\\\\4&5&6\\end{bmatrix}")}，哪类展开方向只需计算一个非零余子式？`,
      options: [
        { label: "第 2 行或第 3 列", correct: true, feedback: "第 2 行与第 3 列都只有一个非零元素，因此各自只保留一个分组。" },
        { label: "第 1 行", feedback: "第 1 行含两个非零元素，需要计算两个余子式。" },
        { label: "第 2 列", feedback: "第 2 列三个元素都非零，是这组方向中成本最高的一条。" },
      ],
    },
    prompts: [
      "选择 a23=0 与一个非零元素，比较零元素组为何直接消失。",
      "沿第 2 行和第 3 列分别展开，核对结果相同。",
      "解释 Cij 的符号如何把余子矩阵路径接回原排列。",
    ],
  },
  example: {
    title: "先分组，再沿最省方向展开",
    question: `计算 ${texInline("\\det\\begin{bmatrix}1&2&0\\\\0&3&0\\\\4&5&6\\end{bmatrix}")}。先选择展开方向，再说明唯一保留的项对应哪一组 Leibniz 路径。`,
    steps: [
      "第 2 行和第 3 列都只有一个非零元素。选第 2 行展开，只保留 a22=3 对应的分组。",
      `位置 (2,2) 的符号为 ${texInline("(-1)^{2+2}=+1")}。`,
      `余子式 ${texInline("M_{22}=\\det\\begin{bmatrix}1&0\\\\4&6\\end{bmatrix}=6")}，所以 ${texInline("C_{22}=6")}。`,
      `因此 ${texInline("\\det(A)=a_{22}C_{22}=3\\cdot6=18")}。这一项组收集了所有在第 2 行选择第 2 列的合法路径。`,
    ],
  },
  quiz: [
    { question: "余子矩阵、余子式和代数余子式分别是什么类型的对象？", answer: "余子矩阵是矩阵；余子式是它的行列式；代数余子式是在余子式上乘位置符号得到的标量。" },
    { question: `为什么 ${texInline("C_{ij}")} 中出现 ${texInline("(-1)^{i+j}")}？`, answer: "它记录把第 i 行、第 j 列对应选择移到基准位置时产生的交换奇偶性。" },
    { question: "按一行展开为什么能覆盖且只覆盖全部 Leibniz 项一次？", answer: "每条合法路径在该行恰好选中一个元素，因此恰好落入唯一的 σ(i)=j 分组。" },
    { question: "两条不同展开路线为什么结果相同？", answer: "它们只是对同一组 Leibniz 项采用不同分组，求和总量不变。" },
  ],
  summary: [
    "余子式展开的本质是按某行或某列的选择对 Leibniz 项分组。",
    "Cij 的位置符号把低阶排列符号接回原行列式。",
    "零多方向能删除最多分组，因此通常计算成本最低。",
  ],
  bridge: "余子式把一个高阶行列式拆成低阶问题。下一节换一种分组方式：把 b 写成列向量的线性组合，从替换列行列式中读出未知量。",
  exercises: [
    "用两条不同方向展开同一个三阶行列式并核对结果。",
    "从‘复制一行’的构造证明交叉恒等式。",
  ],
});
