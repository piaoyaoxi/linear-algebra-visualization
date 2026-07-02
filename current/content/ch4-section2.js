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
          question: "矩阵为什么能相加、数乘和相乘？尤其是，矩阵乘法为什么是复合，而不是逐项相乘？",
          goal: "先掌握加法、数乘与转置的基本规则；再把矩阵乘法同时看成尺寸匹配、行列配对和线性变换复合。",
          tags: ["加法与数乘", "转置", "矩阵乘法"],
          intro: "矩阵的三类基本运算并不处在同一层级：加法与数乘是在组合两张同类型的记录；转置是在交换行列的读取方式；乘法则把两个连续过程压缩成一个新的过程。",
          concepts: [
            { label: "加法与数乘", text: "只有同型矩阵才能逐项相加；数乘把每个元素同时缩放。" },
            { label: "转置", text: "转置把行和列互换；它改变的是读取矩阵的方向。" },
            { label: "乘法条件", text: "A 的列数必须等于 B 的行数，AB 才有定义。" },
            { label: "行列公式", text: "乘积的第 i 行第 j 列，来自 A 的第 i 行与 B 的第 j 列的配对。" },
          ],
          textbook: {
            reference: "北大版《高等代数》第四章",
            page: "",
            items: ["矩阵的加法与数乘", "矩阵的转置", "矩阵乘法与尺寸条件", "矩阵乘法的基本性质"],
          },
          visual: {
            type: "multiply",
            title: "交互图：同一个 AB，三种读法",
            description: "在复合、看列、行列公式三种视角之间切换。",
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
              `先算 ${texInline("AB=\\begin{bmatrix}2&2\\\\0&1\\end{bmatrix}")}。这对应先施加 B 的剪切，再施加 A 的横向拉伸。`,
              `再算 ${texInline("BA=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}。这对应先横向拉伸，再进行剪切。`,
              "两个结果的右上角不同。因为第二步操作面对的是第一步已经改变后的图形，所以顺序通常不能交换。",
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
              question: `${texInline("(AB)_{ij}")} 应该取 A 的哪一部分和 B 的哪一部分配对？`,
              answer: `取 A 的第 i 行与 B 的第 j 列配对，再把对应位置相乘后求和。`,
            },
            {
              question: "矩阵乘法是否总满足 AB=BA？",
              answer: "不满足。只有在特殊情形下才可交换；本节例题已经给出一组 AB 不等于 BA 的具体矩阵。",
            },
          ],
          summary: [
            "加法与数乘要求矩阵同型；转置交换行和列。",
            "矩阵乘法首先要检查尺寸是否匹配。",
            "同一个 AB 可以同时读成复合、列向量变换和行列配对；这三种读法必须指向同一件事。",
          ],
          exercises: [
            `设 A 是 ${texInline("3\\times2")} 矩阵，B 是 ${texInline("2\\times5")} 矩阵。写出 ${texInline("AB")} 的阶，并说明 ${texInline("BA")} 是否有定义。`,
          ],
        });
      }
    }

    return baseRegister(chapter);
  };
})();
