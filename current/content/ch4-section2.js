(() => {
  const baseRegister = window.registerAlgebraChapter;
  if (typeof baseRegister !== "function") return;

  window.registerAlgebraChapter = function registerChapterWithSectionTwo(chapter) {
    if (chapter?.id === "ch4" && Array.isArray(chapter.sections)) {
      const section = chapter.sections.find((item) => item?.id === "matrix-operations");

      if (section) {
        Object.assign(section, {
          number: "§2",
          textbookSection: "矩阵的运算",
          title: "矩阵的运算",
          navTitle: "矩阵的运算",
          question: "矩阵为什么能相加、数乘和相乘？矩阵乘法怎样表达两个过程的复合？",
          goal: "先掌握加法、数乘与转置的基本规则；再把矩阵乘法同时看成尺寸匹配、行列配对和线性变换复合。",
          tags: ["加法与数乘", "转置", "矩阵乘法", "复合"],
          intro: "加法与数乘处理同型矩阵的逐项组合；转置改变行列读取方向；矩阵乘法把两个连续过程压缩成一个新的矩阵。理解乘法时，先问尺寸是否匹配，再问右边的矩阵把输入送到哪里，最后再由左边的矩阵继续作用。",
          videoPlan: {
            title: "矩阵乘法为什么对应复合",
            duration: "约 2 分钟",
            scenes: [
              "从一个向量 x 出发，先经过 B 到达中间位置 Bx。",
              "保持中间向量颜色不变，再让 A 作用到 Bx，得到 A(Bx)。",
              "把两次网格变形压缩成一次变形，标记为 AB。",
              "切到列向量视角：AB 的第 j 列就是 A 作用到 B 的第 j 列。",
              "最后落回行列公式，说明每个输出坐标由一行和一列配对得到。",
            ],
            ttsDraft:
              "矩阵乘法最核心的意思，是把两个连续过程合成一个过程。ABx 先读右边的 B，再读左边的 A。这个顺序看起来反直觉，但它和函数复合完全一致。",
          },
          concepts: [
            { label: "同型相加", text: `若 ${texInline("A,B")} 都是 ${texInline("m\\times n")} 矩阵，则 ${texInline("(A+B)_{ij}=a_{ij}+b_{ij}")}。` },
            { label: "数乘", text: `${texInline("(\\lambda A)_{ij}=\\lambda a_{ij}")}；所有位置按同一个比例缩放。` },
            { label: "转置", text: `${texInline("(A^T)_{ij}=a_{ji}")}；行列互换，读取方向随之改变。` },
            { label: "乘法条件", text: `若 ${texInline("A")} 是 ${texInline("m\\times n")}，${texInline("B")} 是 ${texInline("n\\times p")}，则 ${texInline("AB")} 是 ${texInline("m\\times p")}。` },
            { label: "行列公式", text: `${texInline("(AB)_{ij}=\\sum_{k=1}^{n}a_{ik}b_{kj}")}；第 i 行和第 j 列逐项配对后求和。` },
            { label: "复合顺序", text: `${texInline("ABx=A(Bx)")}；靠近 ${texInline("x")} 的矩阵先作用。` },
            { label: "单位矩阵", text: `${texInline("IA=A")}，${texInline("AI=A")}；单位矩阵表示不改变输入的操作。` },
            { label: "乘法性质", text: `矩阵乘法满足结合律 ${texInline("(AB)C=A(BC)")}，通常不满足交换律。` },
          ],
          textbook: {
            reference: "北大版《高等代数》第四章",
            page: "",
            items: [
              "矩阵的加法与数乘",
              "矩阵的转置",
              "矩阵乘法与尺寸条件",
              "行乘列公式",
              "单位矩阵与矩阵乘法基本性质",
            ],
          },
          visual: {
            type: "multiply",
            title: "交互图：同一个 AB，三种读法",
            description: "在复合、看列、行列公式三种视角之间切换。",
            task: `用同一组矩阵解释三句话：${texInline("ABx=A(Bx)")}；${texInline("AB")} 的第 j 列是 ${texInline("A")} 作用到 ${texInline("B")} 的第 j 列；${texInline("(AB)_{ij}")} 来自 A 的第 i 行和 B 的第 j 列。`,
            prompts: [
              "先在“复合”里确认：右边的 B 先作用。",
              "再在“看列”里确认：AB 的第 j 列等于 A 作用于 B 的第 j 列。",
              "最后在“行列公式”里确认：一个位置来自一行和一列的配对。",
            ],
          },
          example: {
            title: "例题：为什么 AB 和 BA 通常不同",
            question: `令 ${texInline("A=\\begin{bmatrix}2&0\\\\0&1\\end{bmatrix}")}，${texInline("B=\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}")}。计算 ${texInline("AB")} 与 ${texInline("BA")}；再用“先剪切还是先拉伸”的语言解释它们为什么不同。`,
            steps: [
              `先检查尺寸：${texInline("A")} 和 ${texInline("B")} 都是 2 阶矩阵，所以 ${texInline("AB")} 与 ${texInline("BA")} 都有定义。`,
              `计算 ${texInline("AB")}：${texInline("\\begin{bmatrix}2&0\\\\0&1\\end{bmatrix}\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")}。这表示先施加 B 的剪切，再施加 A 的横向拉伸。`,
              `计算 ${texInline("BA")}：${texInline("\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}\\begin{bmatrix}2&0\\\\0&1\\end{bmatrix}=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}。这表示先横向拉伸，再进行剪切。`,
              `比较结果：${texInline("AB")} 与 ${texInline("BA")} 的右上角分别是 ${texInline("2")} 和 ${texInline("1")}，所以二者不相等。`,
              "顺序改变后，第二步面对的图形已经不同。先剪切再拉伸，会把剪切产生的水平偏移一起放大；先拉伸再剪切，剪切量保持原来的比例。",
              "结论：矩阵乘法记录的是过程复合，过程的先后顺序会影响最终结果。",
            ],
          },
          quiz: [
            {
              question: `若 A 是 ${texInline("2\\times3")} 矩阵，B 是 ${texInline("3\\times4")} 矩阵，${texInline("AB")} 的阶是什么？`,
              answer: `${texInline("AB")} 是 ${texInline("2\\times4")} 矩阵：中间的 3 与 3 匹配，保留外侧的 2 与 4。`,
            },
            {
              question: `在 ${texInline("ABx")} 中，哪一个矩阵先作用在 x 上？`,
              answer: `B 先作用，先得到 ${texInline("Bx")}，再由 A 作用到 ${texInline("Bx")} 上。`,
            },
            {
              question: `${texInline("AB")} 的第 j 列为什么可以写成 ${texInline("A")} 乘 ${texInline("B")} 的第 j 列？`,
              answer: `${texInline("AB")} 的第 j 列是 ${texInline("ABe_j=A(Be_j)")}；而 ${texInline("Be_j")} 正是 ${texInline("B")} 的第 j 列。`,
            },
            {
              question: `${texInline("(AB)_{ij}")} 应该取 A 的哪一部分和 B 的哪一部分配对？`,
              answer: `取 A 的第 i 行与 B 的第 j 列配对，再把对应位置相乘后求和。`,
            },
            {
              question: "矩阵乘法是否总满足 AB=BA？",
              answer: "通常不满足。只有在特殊情形下才可交换；本节例题已经给出一组 AB 不等于 BA 的具体矩阵。",
            },
          ],
          summary: [
            "加法与数乘要求矩阵同型；转置交换行和列。",
            "矩阵乘法首先要检查尺寸是否匹配。",
            "同一个 AB 可以同时读成复合、列向量变换和行列配对；三种读法必须互相对上。",
            "下一节讨论乘积的行列式与秩，本质上是在追问复合之后面积缩放和有效方向怎样变化。",
            "常见误区：把 AB 读成 A 先作用；把矩阵乘法当成逐项相乘；默认 AB 与 BA 相等。",
          ],
          exercises: [
            `设 A 是 ${texInline("3\\times2")} 矩阵，B 是 ${texInline("2\\times5")} 矩阵。写出 ${texInline("AB")} 的阶，并说明 ${texInline("BA")} 是否有定义。`,
            `设 ${texInline("C=\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}")}。分别计算 ${texInline("AC")} 与 ${texInline("CA")}，并解释交换两列和交换两行为什么对应不同方向的操作。`,
          ],
        });
      }
    }

    return baseRegister(chapter);
  };
})();
