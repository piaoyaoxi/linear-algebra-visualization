defineChapter3Section("solution-structure", {
  number: "§6",
  textbookSection: "线性方程组解的结构",
  title: "线性方程组解的结构",
  navTitle: "解的结构",
  question: `为什么全部解等于“一个特解加上齐次方程组的全部解”？改变 ${texInline("b")} 时，解集怎样移动？`,
  goal: `掌握齐次方程组的基础解系与解空间维数 ${texInline("n-r")}；会写出非齐次方程组的通解 ${texInline("x=x_0+k_1\\eta_1+\\cdots+k_s\\eta_s")}。`,
  tags: ["基础解系", "解空间", "特解", "通解"],
  intro:
    "两个非齐次解相减，得到的是齐次解。所以只要找到一个解，其余的解都是在它上面加一个齐次解。几何上，解集就是齐次解空间整体平移到特解那里。",
  concepts: [
    { label: "基础解系", text: `齐次方程组解空间的一组基，含 ${texInline("n-r")} 个向量。` },
    { label: "通解", text: `${texInline("x=x_0+k_1\\eta_1+\\cdots+k_s\\eta_s")}。` },
  ],
  textbook: { reference: "北大版《高等代数》第三章 §6", items: ["齐次方程组的基础解系", "非齐次方程组解的结构"] },
  interactive: { type: "slot", title: "解集是零空间平移过去的样子" },
  lesson3d: {
    blocks: [
      {
        title: "齐次方程组：解构成子空间",
        tex: String.raw`\dim\{x: Ax=0\}=n-\operatorname{rank}A`,
        text: "两个齐次解的和、数乘仍是齐次解，所以解集是一个子空间，称为解空间。阶梯形中每个自由未知量恰好对应基础解系中的一个向量：令它取 1、其余自由未知量取 0，解出主元未知量即可。",
      },
      {
        title: "非齐次方程组：特解 + 解空间",
        ponder: {
          q: "解空间是子空间，非齐次方程组的解集为什么不是？",
          a: `${texInline("b\\ne0")} 时解集不含零向量，两个解之和也不再是解。它是把子空间整体平移后的结果，几何上是一条不过原点的直线或一个不过原点的平面。`,
        },
        tex: String.raw`Ax_0=b\ \Longrightarrow\ \{x:Ax=b\}=\{x_0+\eta:\ A\eta=0\}`,
        text: `若 ${texInline("Ax=b")}，则 ${texInline("A(x-x_0)=0")}，所以 ${texInline("x-x_0")} 是齐次解；反过来，${texInline("A(x_0+\\eta)=b+0=b")}。${texInline("b\\ne0")} 时，原点不是解。解集是把 ${texInline("n-r")} 维解空间平移到 ${texInline("x_0")} 处得到的（三维里可能是一个点、一条直线或一个平面），它与解空间平行。`,
      },
    ],
    pitfalls: [
      "给特解也乘上任意常数。通解里只有齐次部分带任意常数。",
      `以为非齐次方程组的解集对加法封闭：两个解之和满足的是 ${texInline("Ax=2b")}。`,
      "自由未知量选得不同，通解看起来不一样，就以为算错了。",
    ],
  },
  example: {
    title: "例题：写出通解，并看它怎样随 b 移动",
    question: `求 ${texInline("x+y+z=3")}，${texInline("x+2y-z=4")} 的全部解。若右端改为 ${texInline("(3,5)")}，解集怎样变化？`,
    choices: [
      { correct: true, text: `${texInline("x=(2,1,0)+t(-3,2,1)")}；改右端后为 ${texInline("(1,2,0)+t(-3,2,1)")}，方向不变，直线平移。` },
      { text: `${texInline("x=t(2,1,0)")}；改右端后直线绕原点转动。` },
      { text: `${texInline("x=(2,1,0)+t(-3,2,1)")}；改右端后解集变成一个平面。` },
      { text: "两个方程三个未知量，无法确定全部解。" },
    ],
    steps: [
      `消元：${texInline(String.raw`R_2\leftarrow R_2-R_1`)} 得 ${texInline("y-2z=1")}。${texInline("z")} 是自由未知量。`,
      `令 ${texInline("z=0")}，得特解 ${texInline("x_0=(2,1,0)")}。`,
      `齐次方程组令 ${texInline("z=1")}，得 ${texInline("\\eta=(-3,2,1)")}，通解 ${texInline("x=(2,1,0)+t(-3,2,1)")}。`,
      `右端改为 ${texInline("(3,5)")}：特解变为 ${texInline("(1,2,0)")}，方向仍是 ${texInline("(-3,2,1)")}。两条解线都与解空间 ${texInline("t(-3,2,1)")} 平行。`,
    ],
  },
  quiz: [
    {
      question: `${texInline("x_1,x_2")} 都是 ${texInline("Ax=b")}（${texInline("b\\ne0")}）的解。${texInline("x_1+x_2")}、${texInline("2x_1-x_2")}、${texInline("\\tfrac12(x_1+x_2)")}、${texInline("x_1-x_2")} 中，哪些仍是 ${texInline("Ax=b")} 的解？`,
      answer: `只有 ${texInline("2x_1-x_2")} 和 ${texInline("\\tfrac12(x_1+x_2)")}（系数之和为 1）；${texInline("x_1-x_2")} 是齐次解；${texInline("x_1+x_2")} 满足 ${texInline("Ax=2b")}。`,
    },
    {
      question: `${texInline("A")} 是 ${texInline("5\\times7")} 矩阵，${texInline("\\operatorname{rank}A=4")}。基础解系含几个向量？若 ${texInline("Ax=b")} 有解，解集是几维的？`,
      answer: "3 个；解集是一个 3 维解空间平移后的结果。",
    },
    {
      question: `${texInline("(2,1,0)+t(-3,2,1)")} 与 ${texInline("(-1,3,1)+u(6,-4,-2)")} 表示同一个解集吗？`,
      answer: `是。两个特解之差 ${texInline("(3,-2,-1)")} 在解空间里，两个方向也共线。`,
    },
  ],
  summary: [
    `齐次方程组的解构成 ${texInline("n-r")} 维解空间，基础解系是它的一组基。`,
    `非齐次方程组的全部解 = 一个特解 + 解空间；改变 ${texInline("b")} 时，只要仍然有解，解集就只平移、不转动。`,
    "选学 §7 把消元思想推广到两个变量的高次方程组。",
  ],
});
