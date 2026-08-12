defineChapter2Section("determinant-intro", {
  number: "§1",
  textbookSection: "引言",
  title: "引言",
  navTitle: "引言",
  question: "能否用一个数，同时记录平行四边形的面积倍率、定向和是否已经压成一条线？",
  goal: "从单位正方形的两条有序边出发，建立二阶行列式的几何意义：绝对值读取面积倍率，符号读取定向，零值标记二维面积消失。",
  tags: ["有向面积", "定向", "零值边界"],
  prerequisites: [
    "会用两个向量表示平行四边形的相邻边。",
    "知道两向量共线时平行四边形的高为零。",
  ],
  objectives: [
    "区分 det(A)、|det(A)| 与普通几何面积。",
    "用连续拖动解释 det 从正到负时为什么必须经过 0。",
    "构造形状明显改变但 det 保持为 1 的例子。",
  ],
  intro:
    "把单位正方形的两条边依次送到矩阵的第一列和第二列，终点图形由这两个有序向量张成。面积只记录大小；行列式还保留边的先后顺序，因此能够区分方向保持与方向翻转。",
  concepts: [
    { label: "二阶公式", text: `${texInline("\\det\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}=ad-bc")}` },
    { label: "有向面积", text: `${texInline("|\\det(A)|")} 给出面积倍率，符号给出定向。` },
    { label: "零值", text: `${texInline("\\det(A)=0")} 时两列共线，二维面积消失。` },
  ],
  textbook: {
    reference: "北大版《高等代数》第二章 §1 · Friedberg 第 4 章 · Strang 第 5 章",
    page: "",
    items: ["二阶行列式", "有向面积", "符号与零值"],
  },
  story: {
    title: "从平行四边形寻找一个有方向的面积",
    lead: "先让图形提出要求，再让公式回答要求。单位正方形的有向面积规定为 1；拉伸应按比例改变它，交换两条有序边应翻转符号。",
    modules: [
      {
        number: "01",
        title: "二阶公式怎样读图",
        subtitle: "两项乘积分别对应两种相反的定向贡献。",
        blocks: [
          {
            type: "formula",
            kicker: "二阶行列式",
            formula: texDisplay("\\det\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}=ad-bc"),
            text: `两列 ${texInline("(a,c)^T")} 与 ${texInline("(b,d)^T")} 张成的平行四边形，其有向面积为 ${texInline("ad-bc")}。普通面积取绝对值。`,
          },
          {
            type: "cards",
            columns: 2,
            items: [
              { kicker: "大小", title: texInline("|\\det(A)|"), text: "单位正方形变成的平行四边形面积是原来的多少倍。" },
              { kicker: "方向", title: texInline("\\operatorname{sgn}(\\det A)"), text: "两条有序边保持原来的绕行方向，或已经发生翻转。" },
            ],
          },
        ],
      },
      {
        number: "02",
        title: "三个读数来自同一个图形",
        subtitle: "正、负、零描述了变形穿过边界时的三个状态。",
        blocks: [
          {
            type: "definitions",
            items: [
              { kicker: "det > 0", title: "定向保持", text: "图形可以拉伸、旋转或剪切；两条有序边的方向关系保持。" },
              { kicker: "det < 0", title: "定向翻转", text: "图形经历一次镜像式翻转，面积仍由 |det| 读取。" },
              { kicker: "det = 0", title: "面积塌缩", text: "两列落到同一直线上，平行四边形的高和面积同时变为零。" },
            ],
          },
          {
            type: "proof",
            items: [
              "连续拖动列向量时，ad-bc 也连续变化。",
              "定向从正变成负，连续读数必定经过 0。",
              "在零点，两列共线，二维图形压成线段或点。",
              "后续小节会把这个几何边界写成一般 n 阶的代数结论。",
            ],
          },
        ],
      },
      {
        number: "03",
        title: "同一个面积倍率可以对应不同形状",
        subtitle: "行列式压缩了三类信息，并没有记录整个变换。",
        blocks: [
          {
            type: "misconception",
            items: [
              `${texInline("\\det(A)=1")} 说明有向面积倍率为 1，剪切后的矩阵仍可与单位矩阵不同。`,
              `${texInline("\\det(A)<0")} 的负号记录定向；普通几何面积始终非负。`,
              "零行列式预告信息无法完整恢复；可逆性与方程组结论将在后续章节中严格建立。",
            ],
          },
          {
            type: "note",
            title: "把问题带进实验",
            text: "先选出你认为会改变形状而保持 det=1 的操作，再让两列共线并继续越过共线位置。观察 |det| 与符号分别怎样变化。",
          },
        ],
      },
    ],
  },
  interactive: {
    type: "slot",
    visualTitle: "有向面积仪表 · 拖动两列",
    description: "图形、ad-bc、|det| 与定向状态同步更新。先作判断，再用预设或拖动端点核对。",
    task: "依次构造 det=1 的明显剪切、det=0 的共线状态和 det<0 的方向翻转，并用一句话解释每次读数。",
    prediction: {
      question: "哪一种操作最可能明显改变形状，同时保持 det=1？",
      options: [
        { label: "剪切", correct: true, feedback: "保留这个预测：剪切会改变边长和夹角，底与高的乘积可以保持为 1。" },
        { label: "单向放大 2 倍", feedback: "放大一条生成边通常会把面积倍率也放大 2 倍。用预设核对。" },
        { label: "镜像", feedback: "镜像可以保持面积大小，但会把有向面积的符号翻转。" },
      ],
    },
    prompts: [
      "比较剪切前后的形状和 det。",
      "让两列逐渐共线，观察读数怎样接近 0。",
      "越过共线位置，说明为什么面积大小连续而定向翻转。",
    ],
  },
  example: {
    title: "构造一族面积不变的剪切",
    question: `对任意实数 ${texInline("t")}，设 ${texInline("A_t=\\begin{bmatrix}1&t\\\\0&1\\end{bmatrix}")}。求 ${texInline("\\det(A_t)")}，并说明当 ${texInline("t")} 改变时，面积、定向与形状分别怎样变化。`,
    steps: [
      `按二阶公式，${texInline("\\det(A_t)=1\\cdot1-t\\cdot0=1")}。`,
      "绝对值恒为 1，所以单位正方形的面积保持不变。",
      "行列式恒为正，所以有序方向保持。",
      `第二列变成 ${texInline("te_1+e_2")}；当 ${texInline("t\\ne0")} 时图形发生剪切，因此形状会改变。`,
    ],
  },
  quiz: [
    { question: `${texInline("\\det(A)=-3")} 时，普通面积倍率和定向分别是什么？`, answer: "面积倍率为 3，定向翻转。" },
    { question: "两列共线时，为什么行列式一定为 0？", answer: "平行四边形的高为 0，二维有向面积随之为 0。" },
    { question: `${texInline("\\det(A)=1")} 能否推出 ${texInline("A=I")}？给出理由。`, answer: `不能。${texInline("t\\ne0")} 时，剪切矩阵 ${texInline("\\begin{bmatrix}1&t\\\\0&1\\end{bmatrix}")} 与 ${texInline("I")} 不同，但行列式恒为 1。` },
    { question: "连续拖动中 det 从 2 变到 -1，为什么中间必有塌缩状态？", answer: "det 连续变化，由介值性质必经过 0；此时两列共线。" },
  ],
  summary: [
    "|det| 读取面积倍率，det 的符号读取有序方向。",
    "det=0 是二维面积消失的边界。",
    "行列式保留关键结构信息，同时允许许多不同形状拥有相同读数。",
  ],
  bridge: "高阶公式的每个乘积项也需要一致的正负号。下一节建立排列的奇偶性，用它管理交换造成的方向翻转。",
  exercises: [
    "构造两个不同的二阶矩阵，使它们的行列式都等于 2。",
    "画出一个 det<0 的平行四边形，并标出两条有序边。",
  ],
});
