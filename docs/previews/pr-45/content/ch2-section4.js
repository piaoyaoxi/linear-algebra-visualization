defineChapter2Section("determinant-properties", {
  number: "§4",
  textbookSection: "n 阶行列式的性质",
  title: "n 阶行列式的性质",
  navTitle: "行列式性质",
  question: "能否用少数几条结构规则，推出交换、倍乘、倍加和三角形行列式的全部计算法则？",
  goal: "以 det(I)=1、对各列分别线性和交替性为三条母性质，解释行列式为何被唯一确定，并从中推出常用行列变换规则。",
  tags: ["单位归一", "分别线性", "交替性"],
  prerequisites: [
    "理解 n 阶行列式的排列求和定义。",
    "会进行矩阵的行、列初等变换。",
  ],
  objectives: [
    "说出决定行列式的三条母性质，并解释归一化为何不可缺少。",
    "由分别线性和交替性推出倍加不变与相同列为零。",
    "用倍率账本追踪一串行列变换。",
  ],
  intro:
    "Leibniz 公式逐项计算很长，却揭示了一个更短的结构：行列式对每一列分别线性，交换两列改变符号，并把单位矩阵送到 1。这三条规则足以恢复整套公式。",
  concepts: [
    { label: "归一化", text: `${texInline("\\det(I_n)=1")}。` },
    { label: "分别线性", text: "固定其余列时，行列式对任意一列是线性的。" },
    { label: "交替性", text: "交换两列变号；特别地，两列相同时行列式为 0。" },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §4",
    page: "",
    items: ["行列式的基本性质", "行列变换", "转置与三角形行列式"],
  },
  story: {
    title: "三条母性质决定全部行列式",
    lead: "把行列式看成列向量组的函数。单位归一确定刻度，分别线性规定拉伸与相加，交替性记录有序方向。",
    modules: [
      {
        number: "01",
        title: "缺一不可的三条规则",
        subtitle: "它们共同决定行列式的数值与符号。",
        blocks: [
          {
            type: "cards",
            items: [
              { kicker: "归一化", title: texInline("D(e_1,\\ldots,e_n)=1"), text: "单位平行体的有向体积定为 1；这一步固定测量刻度。" },
              { kicker: "分别线性", title: texInline("D(\\ldots,u+v,\\ldots)=D(\\ldots,u,\\ldots)+D(\\ldots,v,\\ldots)"), text: "固定其他列时，某一列的伸缩与分解按线性规律进入读数。" },
              { kicker: "交替性", title: "交换两列，数值变号", text: "有序边交换一次，方向翻转一次；两列相同因而得到零。" },
            ],
          },
          {
            type: "misconception",
            items: [
              "分别线性与交替性仍允许任意常数倍的 det；归一化把单位矩阵的值固定为 1，从而确定唯一刻度。",
              `${texInline("\\det(A+B)=\\det(A)+\\det(B)")} 一般不成立；线性只针对单独一列，其余列必须固定。`,
            ],
          },
        ],
      },
      {
        number: "02",
        title: "常用规则怎样从母性质长出来",
        subtitle: "每条初等变换都可以拆回线性或交替性。",
        blocks: [
          {
            type: "proof",
            items: [
              `列倍乘：由线性，${texInline("D(\\ldots,\\lambda C_j,\\ldots)=\\lambda D(\\ldots,C_j,\\ldots)")}。`,
              "两列相同：交换这两列后矩阵不变，而交替性要求数值变号，所以行列式为 0。",
              `列倍加：${texInline("D(\\ldots,C_j+tC_i,\\ldots)=D(\\ldots,C_j,\\ldots)+tD(\\ldots,C_i,\\ldots)")}；第二项含两列 ${texInline("C_i")}，因此为 0。`,
              "三角矩阵：沿列的线性展开到标准基，或使用 §3 的路径论证，只留下主对角线乘积。",
            ],
          },
          {
            type: "formula",
            kicker: "初等变换账本",
            formula: texDisplay("C_i\\leftrightarrow C_j:\;\\times(-1),\\qquad C_j\\leftarrow\\lambda C_j:\;\\times\\lambda,\\qquad C_j\\leftarrow C_j+tC_i:\;\\times1"),
            text: "行规则完全相同；可由 det(Aᵀ)=det(A) 转换，也可直接从排列定义证明。",
          },
        ],
      },
      {
        number: "03",
        title: "为什么三条规则会给回 Leibniz 公式",
        subtitle: "把每一列按标准基展开，交替性会自动删除重复选择。",
        blocks: [
          {
            type: "proof",
            items: [
              `每列写成 ${texInline("C_j=\\sum_i a_{ij}e_i")}。`,
              "对各列反复使用分别线性，得到许多标准基向量组的加权项。",
              "只要某项重复选择同一个标准基向量，交替性就使该项为 0。",
              "剩余项恰好由排列编号；交换到标准顺序产生排列符号，归一化给出单位项的值 1。",
              "因此任何满足三条规则的函数都等于 §3 的 Leibniz 行列式，唯一性成立。",
            ],
          },
          {
            type: "note",
            title: "本节的角色",
            text: "§3 给出可检验的定义；§4 解释定义为何具有必然性，并把后续计算压缩成三类倍率规则。",
          },
        ],
      },
    ],
  },
  interactive: {
    type: "slot",
    visualTitle: "三种列操作 · 代数规则与几何变化同步",
    description: "并排比较操作前后的平行四边形，同时读取当前 det、预测倍率和实际倍率。",
    task: "先判断列倍加是否改变 det，再分别执行交换、倍乘和倍加，并把三次变化写成倍率账本。",
    prediction: {
      question: `把第二列改成 ${texInline("C_2+tC_1")} 后，det 会怎样变化？`,
      options: [
        { label: "保持不变", correct: true, feedback: "分别线性把新增部分变成含两列 C₁ 的行列式；交替性使它为 0。" },
        { label: "乘 t", feedback: "只有把整列替换为 tC₂ 才会整体乘 t；这里还保留了原来的 C₂。" },
        { label: "改变符号", feedback: "符号翻转对应交换两列；列倍加是一种剪切。" },
      ],
    },
    prompts: [
      "执行列交换，比较面积大小和有向面积符号。",
      "执行列倍乘，核对几何倍率与代数倍率。",
      "执行列倍加，指出图形变了而面积为何不变。",
    ],
  },
  example: {
    title: "只用母性质证明列倍加不变",
    question: `设 ${texInline("i\\ne j")}。证明把 ${texInline("C_j")} 替换为 ${texInline("C_j+tC_i")} 后，行列式不变。`,
    steps: [
      `固定其余列，对第 j 列使用分别线性：${texInline("D(\\ldots,C_j+tC_i,\\ldots)=D(\\ldots,C_j,\\ldots)+tD(\\ldots,C_i,\\ldots)")}。`,
      `第二个行列式在第 i、j 个位置都出现 ${texInline("C_i")}。`,
      "交换这两个相同列，矩阵不变；交替性又要求数值变号，因此该项只能为 0。",
      `故 ${texInline("D(\\ldots,C_j+tC_i,\\ldots)=D(\\ldots,C_j,\\ldots)")}。`,
    ],
  },
  quiz: [
    { question: "为什么 det(I)=1 不能从分别线性和交替性中省略？", answer: "前两条允许 det 的任意常数倍；det(I)=1 固定测量刻度并排除这些倍数。" },
    { question: "一列乘 λ 后，行列式怎样变化？", answer: "行列式乘 λ，因为它对该列线性。" },
    { question: "两列相同时，怎样只用交替性证明行列式为 0？", answer: "交换相同两列矩阵不变，但行列式应变号，所以 D=-D，实数域上得到 D=0。" },
    { question: `${texInline("\\det(A+B)=\\det(A)+\\det(B)")} 是否一般成立？`, answer: "不成立。行列式只对某一列分别线性，并不把整个矩阵空间上的加法变成线性。" },
  ],
  summary: [
    "det(I)=1、分别线性与交替性共同唯一确定行列式。",
    "交换、倍乘和倍加分别对应倍率 -1、λ、1。",
    "Leibniz 公式可以由三条母性质展开得到，计算规则因此拥有同一来源。",
  ],
  bridge: "性质已经把复杂定义压缩成三类倍率规则。下一节用这些规则设计计算路线，把一般矩阵送到容易读数的结构。",
  exercises: [
    "由三条母性质证明零列矩阵的行列式为 0。",
    "证明 det(Aᵀ)=det(A)，并据此得到全部行变换规则。",
  ],
});
