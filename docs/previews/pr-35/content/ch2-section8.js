defineChapter2Section("laplace-and-product", {
  number: "§8",
  textbookSection: "拉普拉斯（Laplace）定理·行列式的乘法规则",
  title: "拉普拉斯（Laplace）定理·行列式的乘法规则",
  navTitle: "Laplace 与乘法",
  question: "怎样把单行展开推广为多个行的子式配对？连续两个线性变换的有向体积倍率为什么相乘？",
  goal: "理解固定 k 行后的子式—互补子式配对，区分广义 Laplace 展开与 §6；掌握 det(AB)=det(A)det(B) 的几何意义、代数证明入口和重要推论。",
  tags: ["Laplace 定理", "子式配对", "乘法规则"],
  intro:
    "§6 每次选一个元素。本节同时选择若干行与同样数量的列，得到一个子式，再与互补部分配对求和。另一条主线来自矩阵乘法：先做 B，再做 A，体积倍率依次相乘，因此复合矩阵 AB 的行列式等于两个倍率的乘积。",
  videoPlan: {
    title: "两次变换的有向体积倍率",
    duration: "约 2 分钟",
    scenes: [
      "单位图形先经过 B，显示第一阶段倍率。",
      "保持 B 后的图形作为第二阶段起点，再经过 A。",
      "同步对照 det(B)、det(A)det(B) 与 det(AB)。",
      "加入一次镜像、两次镜像与含零因子的边界。",
    ],
  },
  concepts: [
    { label: "k 阶子式", text: "选定 k 行和 k 列交叉得到的 k 阶行列式。" },
    { label: "互补子式", text: "删去所选行与列后，剩余位置形成的 (n−k) 阶子式。" },
    { label: "Laplace 展开", text: "固定 k 行，对全部 k 列组合，将子式与带符号的互补子式配对求和。" },
    { label: "k=1", text: "退化为 §6 的按一行展开。" },
    { label: "乘法规则", text: `${texInline("\\det(AB)=\\det(A)\\det(B)")}。` },
    { label: "推论", text: `${texInline("\\det(A^{-1})=1/\\det(A)")}、${texInline("\\det(A^m)=\\det(A)^m")}，相似矩阵行列式相同。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §8",
    page: "",
    items: ["广义 Laplace 定理", "子式与互补子式", "乘法规则", "重要推论"],
  },
  interactive: {
    type: "slot",
    title: "实验：子式配对与两阶段体积",
    description: "先在 4×4 子式配对板中浏览六个组合，再播放 I→B→AB 的连续复合。",
    task: "验证固定前两行时六个配对项之和等于 det(A)，再用镜像后缩放预设验证乘法规则的符号。",
    prompts: [
      "逐个选择两列组合，读取子式、互补子式、位置符号与贡献。",
      "确认六个贡献之和等于原 4 阶行列式。",
      "播放两阶段动画，注意第二阶段从 B 的图形继续变为 AB。",
      "尝试含投影的预设，观察任一阶段 det=0 会使最终倍率为 0。",
    ],
  },
  example: {
    title: "例题：乘法规则与推论",
    question: `已知 ${texInline("\\det(A)=-2")}，${texInline("\\det(B)=3")}。求 ${texInline("\\det(AB)")}、${texInline("\\det(BA)")}、${texInline("\\det(A^{-1})")} 与 ${texInline("\\det(A^2B)")}。`,
    choices: [
      { correct: true, text: `${texInline("\\det(AB)=\\det(BA)=-6")}，${texInline("\\det(A^{-1})=-1/2")}，${texInline("\\det(A^2B)=12")}。` },
      { text: `${texInline("\\det(AB)=1")}，因为复合后要归一化。` },
      { text: `${texInline("\\det(AB)\\ne\\det(BA)")}，因为矩阵乘法通常不可交换。` },
      { text: "det(A) 为负，所以 A 不可逆。" },
    ],
    steps: [
      `乘法规则给出 ${texInline("\\det(AB)=(-2)\\cdot3=-6")}，同理 ${texInline("\\det(BA)=-6")}。`,
      `因为 ${texInline("\\det(A)\\ne0")}，A 可逆且 ${texInline("\\det(A^{-1})=1/(-2)=-1/2")}。`,
      `先算 ${texInline("\\det(A^2)=(-2)^2=4")}，再乘 ${texInline("\\det(B)=3")}，得到 12。`,
      "几何上，一次方向翻转与三倍正缩放复合，最终倍率为 6，定向翻转。",
    ],
  },
  quiz: [
    { question: "固定 4×4 的两行做 Laplace 展开，需要遍历多少个两列组合？", answer: `${texInline("\\binom42=6")} 个。` },
    { question: "k=1 的广义 Laplace 展开对应哪一节？", answer: "§6 按一行或一列展开。" },
    { question: "AB 与 BA 通常不同，为什么它们的行列式仍相等？", answer: "两者都等于 det(A)det(B)，标量乘法可交换。" },
    { question: "若 det(B)=0，det(AB) 等于多少？", answer: "0。" },
    { question: "相似矩阵为什么行列式相同？", answer: `${texInline("\\det(P^{-1}AP)=\\det(P)^{-1}\\det(A)\\det(P)=\\det(A)")}。` },
  ],
  summary: [
    "广义 Laplace 展开把单元素展开推广为子式与互补子式的配对。",
    "乘法规则说明复合变换的有向体积倍率相乘。",
    "可逆矩阵、矩阵幂与相似不变量等结论都可由乘法规则快速推出。",
    "全章主线完成：从有向面积，经排列与定义，走到性质、计算、展开、方程组与复合。",
  ],
  exercises: [
    "在 4×4 中固定前两行，写出六个列组合。",
    "用乘法规则证明 det(A)=0 时 AB 与 BA 都是奇异矩阵。",
  ],
});
