registerAlgebraChapter({
  id: "ch10",
  icon: "10",
  title: "第十章 双线性函数与辛空间",
  subtitle: "对偶、配对与辛结构",
  overviewTitle: "从一次测量走向双线性配对",
  summary:
    "本章沿一条连续的几何主线展开：线性函数用等值层把向量测量成标量；所有线性测量方法组成对偶空间；双线性函数让两个向量共同产生标量；辛形式进一步保留交错且非退化的面积配对结构。",
  overviewCards: [
    {
      title: "一个输入",
      text: "线性函数读取一个向量；核与等值层把整个空间组织起来。",
    },
    {
      title: "所有读取器",
      text: "线性函数可以相加和缩放，因此它们组成对偶空间。",
    },
    {
      title: "两个输入",
      text: "双线性函数记录两个方向的配对；辛形式把方向组织成面积单元。",
    },
  ],
  sections: getChapter10Sections(),
});