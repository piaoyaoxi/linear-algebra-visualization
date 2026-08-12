defineChapter4Section("matrix-product-determinant-rank", {
  number: "§3",
  textbookSection: "矩阵乘积的行列式与秩",
  title: "矩阵乘积的行列式与秩",
  navTitle: "乘积的行列式与秩",
  question: "连续两步怎样累积有向体积？为什么乘积的独立信息量永远受最窄一步限制？",
  goal:
    "理解乘积行列式的乘法性；分别证明 rank(AB) 不超过 rank(A) 与 rank(B)，并会识别可逆因子何时保持秩。",
  tags: ["有向体积", "乘积行列式", "秩上界", "可逆因子"],
  intro:
    "行列式和秩都在描述矩阵保留了什么，却使用不同尺度。行列式给方阵的有向体积倍率，是可以连续变化的数；秩计算独立列的最大数量，是离散的维数。矩阵相乘时，体积倍率相乘，而独立方向只能保持或继续减少。",
  concepts: [
    {
      label: "有向体积",
      text: `对 n 阶矩阵 A，${texInline("|\\det(A)|")} 是 n 维体积倍率；符号记录方向是否翻转。`,
    },
   {
     label: "乘积行列式",
      text: `对同阶 n 阶方阵 A、B，${texInline("\\det(AB)=\\det(A)\\det(B)")}；先经过 B、再经过 A 时，两次有向体积倍率依次相乘。`,
   },
    {
      label: "行列式证明",
      text: `固定 A 后，${texInline("D_A(B)=\\det(Ab_1,\\ldots,Ab_n)")} 对 B 的列仍是交替多线性函数，且 ${texInline("D_A(I)=\\det(A)")}；由行列式唯一性得到乘积公式。`,
    },
    {
      label: "秩",
      text: `${texInline("\\operatorname{rank}(A)")} 是 A 的独立列的最大数量，也等于列空间的维数。`,
    },
    {
      label: "受 A 限制",
      text: `${texInline("AB")} 的每一列都是 A 的列的线性组合，所以 ${texInline("\\operatorname{rank}(AB)\\le\\operatorname{rank}(A)")}。`,
    },
   {
     label: "受 B 限制",
      text: `${texInline("Bc=0\\Rightarrow ABc=0")}，所以 ${texInline("\\ker(B)\\subseteq\\ker(AB)")}；两者列数相同，再用秩—零度定理得到 ${texInline("\\operatorname{rank}(AB)\\le\\operatorname{rank}(B)")}。`,
   },
   {
     label: "秩瓶颈",
      text: `若 ${texInline("A\\in\\mathbb{R}^{m\\times n}")}、${texInline("B\\in\\mathbb{R}^{n\\times p}")}，则 ${texInline("\\operatorname{rank}(AB)\\le\\min\\{\\operatorname{rank}(A),\\operatorname{rank}(B)\\}")}。`,
    },
    {
      label: "可逆因子",
      text: `A 可逆时 ${texInline("\\operatorname{rank}(AB)=\\operatorname{rank}(B)")}；B 可逆时 ${texInline("\\operatorname{rank}(AB)=\\operatorname{rank}(A)")}。`,
    },
    {
      label: "方阵临界",
      text: `n 阶矩阵满足 ${texInline("\\det(A)\\ne0\\iff\\operatorname{rank}(A)=n")}；行列式为零时至少丢失一个独立方向。`,
    },
  ],
  textbook: {
    reference: "Strang · Lay · Friedberg · Strang LALFD",
    page: "Strang Ch.5；Lay §2.3、§3.2；Friedberg §3.2、§4.3；LALFD §1.1—§1.2",
    items: [
      "Strang：用体积倍率解释 det(AB)，同时把秩看成真正独立的列数。",
      "Lay：把可逆、满秩、非零行列式和方程唯一可解组织成等价网络。",
      "Friedberg：用秩与初等矩阵控制 det(AB) 的一般证明。",
      "Linear Algebra and Learning from Data：用独立信息量解释秩，并区分计算行与理解列。",
    ],
  },
  visual: {
    type: "rank",
    title: "面积—秩实验室",
    description:
      "让两列逐渐共线，比较连续变化的行列式与临界跳变的秩；再观察乘积中的体积计量和秩瓶颈。",
    task:
      "先寻找 det 很小但仍非零的矩阵，再精确到达 det=0；随后固定一个秩 1 的 B，比较不同 A 能否把丢失的方向恢复。",
    prompts: [
      "在“面积与秩”中把两列拖到接近共线，确认只要 det≠0，二维秩仍为 2。",
      "选择镜像，区分面积的绝对值与行列式符号。",
      "在“乘积行列式”中比较 AB 与 BA：形状可以不同，行列式却相同。",
      "在“秩瓶颈”中先选可逆 A，再选会消灭 B 输出直线的 A。",
    ],
  },
  example: {
    title: "例题：不展开乘积，判断行列式与秩",
    question: `设 ${texInline("A=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}，${texInline("B=\\begin{bmatrix}1&1\\\\2&2\\end{bmatrix}")}。不先计算 AB 的全部元素，求 ${texInline("\\det(AB)")} 与 ${texInline("\\operatorname{rank}(AB)")}。`,
    choices: [
      {
        correct: true,
        text: `${texInline("\\det(AB)=0")} 且 ${texInline("\\operatorname{rank}(AB)=1")}；B 的两列相同，A 可逆并保持 B 的秩。`,
      },
      {
        text: `${texInline("\\det(AB)=4")} 且 ${texInline("\\operatorname{rank}(AB)=2")}；行列式会把秩按同一倍数放大。`,
      },
      {
        text: `${texInline("\\det(AB)=0")} 且 ${texInline("\\operatorname{rank}(AB)=0")}；行列式为零就表示零矩阵。`,
      },
      {
        text: "两个结论都必须在完整展开 AB 后才能判断。",
      },
    ],
    steps: [
      `B 的两列都等于 ${texInline("(1,2)^T")}；这一列非零，所以 ${texInline("\\operatorname{rank}(B)=1")}。`,
      `B 的两列相同也给出 ${texInline("\\det(B)=0")}。`,
      `A 的行列式为 ${texInline("2\\ne0")}，因此 A 可逆。`,
      `乘积公式给出 ${texInline("\\det(AB)=\\det(A)\\det(B)=2\\cdot0=0")}。`,
      `可逆左因子保持秩，所以 ${texInline("\\operatorname{rank}(AB)=\\operatorname{rank}(B)=1")}。`,
      `展开核对可得 ${texInline("AB=\\begin{bmatrix}4&4\\\\2&2\\end{bmatrix}")}；两列仍相同且非零。`,
    ],
    audit: {
      a: [[2, 1], [0, 1]],
      b: [[1, 1], [2, 2]],
      ab: [[4, 4], [2, 2]],
      detAB: 0,
      rankAB: 1,
    },
  },
  quiz: [
    {
      question: `若 ${texInline("\\det(A)=-2")}、${texInline("\\det(B)=3")}，那么 ${texInline("\\det(AB)")} 是多少？`,
      answer: `${texInline("-6")}。有向体积倍率相乘，负号表示最终方向翻转。`,
    },
    {
      question: "行列式逐渐趋近 0 时，二维矩阵的秩也会逐渐趋近 1 吗？",
      answer: "不会。只要行列式仍非零，秩就是 2；到达行列式恰为 0 的临界状态时，秩才降到 1 或 0。",
    },
    {
      question: `为什么 ${texInline("\\operatorname{rank}(AB)\\le\\operatorname{rank}(A)")}？`,
      answer: "AB 的每一列都是 A 的列的线性组合，所以 AB 的列无法超出 A 的列所能生成的范围。",
    },
   {
     question: `为什么 ${texInline("\\operatorname{rank}(AB)\\le\\operatorname{rank}(B)")}？`,
      answer: `由 ${texInline("Bc=0\\Rightarrow ABc=0")} 得 ${texInline("\\ker(B)\\subseteq\\ker(AB)")}。B 与 AB 列数相同，秩—零度定理于是给出所需上界。`,
   },
    {
      question: `若 ${texInline("\\operatorname{rank}(B)=1")}，是否可能有 ${texInline("\\operatorname{rank}(AB)=2")}？`,
      answer: "不可能。乘积秩不超过任一因子的秩。",
    },
    {
      question: `A 可逆时，怎样仅用秩不等式证明 ${texInline("\\operatorname{rank}(AB)=\\operatorname{rank}(B)")}？`,
      answer: `先有 ${texInline("\\operatorname{rank}(AB)\\le\\operatorname{rank}(B)")}；再由 ${texInline("B=A^{-1}(AB)")} 得到反向不等式。`,
    },
  ],
  summary: [
    "行列式记录方阵的有向体积倍率；秩记录独立信息的维数。",
    `${texInline("\\det(AB)=\\det(A)\\det(B)")} 把连续两步的体积倍率相乘。`,
    "AB 的列受 A 的列空间限制，B 的列关系也会被保留，这给出两个秩上界。",
    "可逆因子不丢失独立方向，因此保持另一个因子的秩。",
    "下一节把非零行列式与满秩进一步解释成完整可撤销性。",
  ],
  exercises: [
    `构造两个非零二阶矩阵 A、B，使 ${texInline("AB=0")}，并核对乘积秩严格小于两个因子的秩。`,
    `证明 B 可逆时 ${texInline("\\operatorname{rank}(AB)=\\operatorname{rank}(A)")}。`,
    `找两个行列式都为 1、形状作用明显不同的二阶矩阵，并解释相同与不同之处。`,
  ],
});
