defineChapter3Section("n-vector-space", {
  number: "§2",
  textbookSection: "n维向量空间",
  title: "n维向量空间",
  navTitle: "n维向量空间",
  question: "怎样把一个方程组读成“n 维向量的线性组合”？n 大于 3、画不出来时，为什么仍能精确运算？",
  goal: `掌握 ${texInline("F^n")} 中向量的加法、数乘与线性组合；能把 ${texInline("Ax=b")} 同时读成“三个方程”和“列向量的组合”。`,
  tags: ["Fⁿ", "线性组合", "列图景", "行图景"],
  intro: `把未知量排成一列 ${texInline("x=(x_1,\\dots,x_n)")}，方程组就能写成 ${texInline("x_1a_1+\\cdots+x_na_n=b")}：求解就是找 A 的各列的权重，让组合正好等于 b。`,
  concepts: [
    { label: "Fⁿ", text: "数域 F 上的 n 元有序数组全体，按分量相加、数乘。" },
    { label: "线性组合", text: `${texInline("k_1a_1+\\cdots+k_na_n")}。` },
  ],
  textbook: { reference: "北大版《高等代数》第三章 §2", items: ["n 维向量及其运算", "线性组合"] },
  interactive: { type: "slot", title: "同一个方程组，两幅图同时成立" },
  lesson3d: {
    blocks: [
      {
        title: "向量就是有顺序的一列数",
        tex: String.raw`\alpha+\beta=(a_1+b_1,\dots,a_n+b_n),\qquad k\alpha=(ka_1,\dots,ka_n)`,
        text: `二维、三维时可以把向量画成箭头；n 更大时画不出来，但加法和数乘仍然逐个分量进行，结果完全确定。坐标的顺序不能交换：${texInline("(1,2,0)")} 与 ${texInline("(2,1,0)")} 是不同的向量。`,
      },
      {
        title: "方程组的两种读法",
        ponder: {
          q: `A 是 3×2 矩阵时，行图景和列图景分别画在哪个空间里？`,
          a: `行图景：三个方程是 ${texInline("\\mathbb R^2")} 中的三条直线，解是它们的公共点。列图景：两个列向量在 ${texInline("\\mathbb R^3")} 中组合出 b。`,
        },
        tex: String.raw`\underbrace{\begin{cases}a_{11}x_1+\cdots+a_{1n}x_n=b_1\\ \quad\vdots\\ a_{m1}x_1+\cdots+a_{mn}x_n=b_m\end{cases}}_{\text{按行：m 个方程}}\iff \underbrace{x_1a_1+\cdots+x_na_n=b}_{\text{按列：一个向量等式}}`,
        text: `按行读，每个方程是输入空间 ${texInline("F^n")} 里的一个约束，解是所有约束的公共点；按列读，${texInline("x")} 是列向量的权重，${texInline("Ax")} 落在输出空间 ${texInline("F^m")} 里。同一个 x 让两种读法同时成立。`,
      },
    ],
    pitfalls: [
      "把权重 x 和目标 b 混为一谈：x 在输入空间，b 在输出空间，两者维数可以不同。",
      "以为 n>3 时向量没有意义。画不出来，但每个分量都参与运算。",
      "以为两个向量在某个坐标平面上的投影相同，它们就相等。",
    ],
  },
  example: {
    title: "例题：不消元，用列组合找解",
    question: `A 的三列是 ${texInline("a_1=(1,2,6)^T")}，${texInline("a_2=(2,5,-3)^T")}，${texInline("a_3=(3,2,1)^T")}，${texInline("b=(6,4,2)^T")}。已知 ${texInline("\\det A=-77")}。求 ${texInline("Ax=b")} 的解。`,
    choices: [
      { correct: true, text: `${texInline("x=(0,0,2)")}，因为 ${texInline("b=2a_3")}；${texInline("\\det A\\ne0")}，所以这是唯一解。` },
      { text: `${texInline("x=(6,4,2)")}，因为解就是 b 的坐标。` },
      { text: `${texInline("x=(2,0,0)")}，因为 ${texInline("2a_1")} 的第二个分量与 b 一致。` },
      { text: "不做消元就无法确定。" },
    ],
    steps: [
      `观察：${texInline("2a_3=(6,4,2)^T=b")}。`,
      `所以 ${texInline("0\\cdot a_1+0\\cdot a_2+2\\cdot a_3=b")}，即 ${texInline("x=(0,0,2)")} 是一个解。`,
      `${texInline("\\det A=-77\\ne0")}，方程组只有一个解。`,
      "按行检验：三个平面都经过点 (0,0,2)。",
    ],
  },
  quiz: [
    {
      question: `同一个 A，把 b 换成 ${texInline("(4,4,7)^T")}，解是什么？`,
      answer: `${texInline("x=(1,0,1)")}，因为 ${texInline("a_1+a_3=(4,4,7)^T")}。`,
    },
    {
      question: `${texInline("u=(1,0,2,-1)")}，${texInline("v=(0,1,1,1)")}。${texInline("w=(2,-3,1,-5)")} 是 u、v 的线性组合吗？把最后一个分量改成 0 呢？`,
      answer: `是，${texInline("w=2u-3v")}：前两个分量定出系数 2 和 −3，后两个分量正好吻合。改成 0 以后，系数仍被前两个分量定为 2、−3，第四个分量对不上，就不是了。`,
    },
    {
      question: "A 是 3×2 矩阵。Ax=b 中的 x 与 b 分别属于哪个空间？",
      answer: `${texInline("x\\in F^2")}，${texInline("b\\in F^3")}。`,
    },
  ],
  summary: [
    "Fⁿ 中的向量按分量相加、数乘；画不出来也能精确运算。",
    "Ax=b 按行读是 m 个方程的公共解，按列读是列向量组合出 b。",
    "下一节研究：一组向量里，哪些真正带来了新方向。",
  ],
});
