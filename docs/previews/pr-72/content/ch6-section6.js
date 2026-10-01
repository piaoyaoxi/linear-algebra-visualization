defineChapter6Section("intersection-sum", {
  number: "§6",
  textbookSection: "子空间的交与和",
  title: "子空间的交与和",
  navTitle: "交与和",
  question: "两个子空间合起来能张成多大的空间？公共的方向怎样扣除？",
  goal: "掌握子空间的交与和；会用维数公式计算交或和的维数；理解维数之和超过空间维数时交一定非零。",
  tags: ["交", "和", "维数公式"],
  intro:
    `${texInline(String.raw`U+W`)} 由 ${texInline(String.raw`U`)} 中向量与 ${texInline(String.raw`W`)} 中向量的和组成，是包含二者的最小子空间。公共方向在 ${texInline(String.raw`\dim U`)} 和 ${texInline(String.raw`\dim W`)} 里各数了一次，所以要扣掉一次。在 ${texInline(String.raw`\mathbb R^3`)} 里拖动两个平面，看它们的交能不能只剩原点。`,
  concepts: [
    { label: "和", text: "V₁+V₂={α₁+α₂ : α₁∈V₁, α₂∈V₂}。" },
    { label: "维数公式", text: `${texInline(String.raw`\dim V_1+\dim V_2=\dim(V_1+V_2)+\dim(V_1\cap V_2)`)}。` },
  ],
  textbook: { reference: "北大版《高等代数》第六章 §6", items: ["子空间的交与和", "生成子空间的和", "维数公式", "维数之和大于 n 时交非零"] },
  interactive: { type: "slot", title: "两个子空间合起来有多大" },
  lesson: {
    figure: "intersection-curves",
    figureLast: true,
    blocks: [
      {
        title: "交与和",
        tex: String.raw`V_1+V_2=\{\alpha_1+\alpha_2:\alpha_1\in V_1,\ \alpha_2\in V_2\}`,
        text: `${texInline("V_1\\cap V_2")} 与 ${texInline("V_1+V_2")} 都是子空间，并集一般不是。生成元可以直接合并：${texInline("L(\\alpha_1,\\dots,\\alpha_s)+L(\\beta_1,\\dots,\\beta_t)=L(\\alpha_1,\\dots,\\alpha_s,\\beta_1,\\dots,\\beta_t)")}，再从中取极大无关组作为和的基。`,
      },
      {
        title: "维数公式",
        tex: String.raw`\dim V_1+\dim V_2=\dim(V_1+V_2)+\dim(V_1\cap V_2)`,
        text: `证明思路：取 ${texInline("V_1\\cap V_2")} 的一组基，分别扩充成 ${texInline("V_1")}、${texInline("V_2")} 的基，合在一起恰好是 ${texInline("V_1+V_2")} 的基。公共部分在左边数了两次，右边只数一次。`,
      },
      {
        title: "推论：维数之和超过 n，交必非零",
        text: `在 ${texInline("n")} 维空间中，若 ${texInline("\\dim V_1+\\dim V_2>n")}，则 ${texInline("V_1\\cap V_2")} 含非零向量。${texInline("\\mathbb R^3")} 中两个平面 ${texInline("2+2>3")}，一定交出一条直线；下图是 ${texInline("P[x]_4")} 中同样的现象。`,
      },
    ],
    pitfalls: [
      `把 ${texInline("U+W")} 当成 ${texInline("U\\cup W")}；和空间包含一切形如 ${texInline("u+w")} 的向量。`,
      `两组基直接合并不一定是 ${texInline("U+W")} 的基，要去掉 ${texInline("\\dim(U\\cap W)")} 个多余的向量。`,
      "两组生成元各不相同，推不出交为零。",
    ],
  },
  example: {
    title: "例题：多项式空间中的交与和",
    question: `在 ${texInline("P[x]_4")}（次数小于 4 的多项式）中，${texInline("U=\\{p:p(1)=0\\}")}，${texInline("W=\\{p:p(-1)=0\\}")}。求 ${texInline("U\\cap W")} 及其维数，并判断 ${texInline("U+W")} 是什么。`,
    choices: [
      { text: `${texInline("U\\cap W=\\{0\\}")}，${texInline("\\dim(U+W)=6")}` },
      { text: `${texInline("U\\cap W=\\{c(x^2-1)\\}")}，维数 1；${texInline("\\dim(U+W)=5")}` },
      { correct: true, text: `${texInline("U\\cap W=\\{(x^2-1)(a+bx)\\}")}，维数 2；${texInline("U+W=P[x]_4")}` },
      { text: `${texInline("U\\cap W=\\{(x^2-1)(a+bx)\\}")}，维数 2；${texInline("U+W=U\\cup W")}` },
    ],
    steps: [
      `${texInline("\\dim U=\\dim W=3")}，例如 ${texInline("U")} 有基 ${texInline("x-1,(x-1)^2,(x-1)^3")}。`,
      `${texInline("p")} 同时以 1 和 −1 为根，当且仅当 ${texInline("x^2-1")} 整除 ${texInline("p")}。${texInline("p")} 的次数不超过 3，所以 ${texInline("p=(x^2-1)(a+bx)")}，${texInline("\\dim(U\\cap W)=2")}。`,
      `维数公式：${texInline("\\dim(U+W)=3+3-2=4=\\dim P[x]_4")}，所以 ${texInline("U+W=P[x]_4")}。`,
      `${texInline("3+3>4")} 本身就说明交非零。“定理与方法”的图中，金色曲线同时过 ${texInline("(1,0)")} 与 ${texInline("(-1,0)")}。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("\\mathbb R^3")} 中两个不同的二维子空间，交的维数是多少？`,
      answer: `恰为 1。两个平面不同，和比平面大，只能是 ${texInline("\\mathbb R^3")}，于是交的维数是 ${texInline("2+2-3=1")}。`,
    },
    {
      question: `${texInline("\\mathbb R^4")} 中两个二维子空间的交能只有零向量吗？`,
      answer: `能，例如 ${texInline("L(\\varepsilon_1,\\varepsilon_2)")} 与 ${texInline("L(\\varepsilon_3,\\varepsilon_4)")}；${texInline("2+2")} 没有超过 4。`,
    },
    {
      question: `${texInline("\\dim(U+W)=\\dim U+\\dim W")} 在什么条件下成立？`,
      answer: `当且仅当 ${texInline("U\\cap W=\\{0\\}")}。这正是下一节直和的条件。`,
    },
    {
      question: `${texInline("U=L(\\alpha_1,\\alpha_2)")}，${texInline("W=L(\\beta_1,\\beta_2)")}，两组各自线性无关，四个向量的秩为 3。${texInline("U\\cap W")} 的维数是多少？`,
      answer: `${texInline("\\dim(U+W)=3")}，所以 ${texInline("\\dim(U\\cap W)=2+2-3=1")}。`,
    },
  ],
  summary: [
    "交与和都是子空间，和是包含二者的最小子空间。",
    `${texInline(String.raw`\dim V_1+\dim V_2=\dim(V_1+V_2)+\dim(V_1\cap V_2)`)}。`,
    "维数之和超过空间维数时，交一定非零。",
  ],
});
