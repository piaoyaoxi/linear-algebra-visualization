(() => {
  const baseRegister = window.registerAlgebraChapter;
  if (typeof baseRegister !== "function") return;

  window.registerAlgebraChapter = function registerChapterWithSectionOne(chapter) {
    if (chapter?.id === "ch4" && Array.isArray(chapter.sections)) {
      const section = chapter.sections.find((item) => item?.id === "matrix-language");

      if (section) {
        Object.assign(section, {
          number: "§1",
          textbookSection: "矩阵概念的一些背景",
          title: "矩阵概念的一些背景",
          navTitle: "矩阵概念背景",
          question: "矩阵为什么会出现？它为什么不只是一张数字表格？",
          goal: "认识矩阵的行、列、阶与元素；从方程组和坐标记录进入，并建立“先看列”的基本直觉。",
          tags: ["矩阵背景", "行列与阶", "基向量"],
          intro: `矩阵首先把一组彼此相关的数字组织成一个对象。一个 ${texInline("m\\times n")} 矩阵有 ${texInline("m")} 行、${texInline("n")} 列；第 ${texInline("i")} 行第 ${texInline("j")} 列的元素记为 ${texInline("a_{ij}")}。当它记录线性关系时，每一列还可以理解为一个基本方向的去向。`,
          concepts: [
            {
              label: "行、列与阶",
              text: `${texInline("m\\times n")} 表示 m 行 n 列。只有行数和列数都相同的矩阵，才谈得上逐项相等。`,
            },
            {
              label: "元素记号",
              text: `${texInline("a_{ij}")} 表示第 i 行第 j 列的元素；下标先读行，再读列。`,
            },
            {
              label: "方程组背景",
              text: "方程组的系数可以排成矩阵，把许多同类关系压缩为一个统一对象。",
            },
            {
              label: "先看列",
              text: "把矩阵看成变换记录时，第 j 列给出第 j 个标准基向量经过变换后的坐标。",
            },
          ],
          textbook: {
            reference: "北大版《高等代数》第四章",
            page: "",
            items: ["矩阵概念的背景", "矩阵的行、列与阶", "元素位置与矩阵相等", "矩阵作为线性关系的记录"],
          },
          visual: {
            type: "transform",
            title: "交互图：先看两列，再看整个网格",
            description: "拖动矩阵元素，先观察 Ae₁ 与 Ae₂ 的去向，再看由它们决定的整张网格如何变化。",
            prompts: [
              "先把四个滑条设为 a=1、b=0、c=0、d=1，确认两列分别对应 e₁ 与 e₂。",
              "只改变 b，观察第二列和竖直网格线怎样一起发生剪切。",
              "再让两列变得共线，观察整张网格为何会坍缩成一条直线。",
            ],
          },
          example: {
            title: "例题：从矩阵的两列读出平面变化",
            question: `设 ${texInline("A=\\begin{bmatrix}2&1\\\\0&1\\end{bmatrix}")}。不逐点代入，说明 A 对平面网格的大致作用，并判断它是否会把平面压扁。`,
            steps: [
              `先读第一列：${texInline("Ae_1=(2,0)^T")}，所以水平方向被送到 x 轴正方向并拉长为原来的 2 倍。`,
              `再读第二列：${texInline("Ae_2=(1,1)^T")}，所以竖直方向在保留向上的同时，额外向右偏移。`,
              "两列不共线，因此它们仍然张成整个平面；网格表现为横向拉伸加剪切，而不是坍缩。",
            ],
          },
          quiz: [
            {
              question: `在 ${texInline("m\\times n")} 矩阵中，${texInline("a_{ij}")} 的两个下标分别表示什么？`,
              answer: "第一个下标 i 表示行号，第二个下标 j 表示列号。",
            },
            {
              question: `矩阵 ${texInline("A")} 的第 j 列在“变换记录”的视角下表示什么？`,
              answer: `它表示标准基向量 ${texInline("e_j")} 经 A 作用后的坐标，即 ${texInline("Ae_j")}。`,
            },
            {
              question: "两列都非零的 2 阶矩阵，是否一定不会把平面压扁？",
              answer: "不一定。若两列共线，它们仍只能提供一个方向，网格会坍缩到一条直线。",
            },
          ],
          summary: [
            `矩阵用行、列和元素组织一组相关数字；下标 ${texInline("a_{ij}")} 先读行、再读列。`,
            "矩阵可以来自方程组，也可以记录线性关系。",
            "在二维变换视角下，先读两列，就能抓住两个基本方向的去向。",
          ],
          exercises: [`把一个 ${texInline("2\\times3")} 矩阵写出一般形式，并说清 ${texInline("a_{23}")} 表示哪个位置的元素。`],
        });
      }
    }

    return baseRegister(chapter);
  };
})();
