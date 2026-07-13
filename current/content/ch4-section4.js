defineChapter4Section("matrix-inverse", {
  number: "§4",
  textbookSection: "矩阵的逆",
  title: "矩阵的逆",
  navTitle: "矩阵的逆",
  question: "怎样用一个确定的矩阵完整撤销原来的作用，并把输出准确还原成输入？",
  goal: "把逆矩阵理解为可逆方阵唯一的撤销运算；掌握逆矩阵的定义与唯一性、复合过程的逆序法则、矩阵方程的消元方式，以及二阶公式和伴随矩阵求逆路线。",
  tags: ["逆矩阵", "撤销运算", "逆序法则", "伴随矩阵"],
  intro:
    "第三节已经给出可逆性的判定入口。本节从判定之后继续：若逆确实存在，它怎样撤销缩放、旋转、剪切和镜像，为什么复合过程必须倒序撤销，又怎样落回具体的求逆计算与方程求解。",
  formalIntro:
    "本节只处理逆矩阵怎样撤销、怎样计算和怎样用于方程；可逆性的面积与秩判定留在第三节。",
  videoPlan: {
    title: "把一次矩阵作用倒着走回来",
    duration: "约 1.5—2 分钟",
    scenes: [
      "同一个方格先经过 A 变形，再经过 A^{-1} 回到原状；输入点、基向量和网格始终保持对象连续。",
      "依次闪过缩放、旋转、剪切和镜像：缩放取倒数，旋转转向相反，剪切系数变号，镜像再做一次回到原处。",
      "短暂对照投影：两个不同输入落到同一输出，只保留一句结论——信息一旦合并，反向过程便不再唯一。",
      "展示 x 先经过 B、再经过 A；错误地先撤销 B 时无法复原，改为先 A^{-1}、再 B^{-1} 后回到 x。",
      "画面收束到 AA^{-1}=A^{-1}A=I 与 (AB)^{-1}=B^{-1}A^{-1}。",
    ],
    ttsDraft:
      "逆矩阵把已经发生的矩阵作用完整撤销。单个过程按相反方式执行；多个过程组成复合后，撤销必须从最后一步开始。因此 AB 的逆按相反顺序书写：B 的逆乘 A 的逆。",
  },
  concepts: [
    {
      label: "定义与唯一性",
      text: `若 n 阶方阵 ${texInline("A")} 存在方阵 ${texInline("B")}，使 ${texInline("AB=BA=I")}，则 ${texInline("B=A^{-1}")}。这里讨论双侧逆，因此 A 必须是方阵；非方阵的左逆、右逆不在本节展开。逆矩阵一旦存在便唯一；若 B、C 都是 A 的逆，则 ${texInline("B=B(AC)=(BA)C=C")}。`,
    },
    {
      label: "撤销方程中的矩阵作用",
      text: `${texInline("Ax=b")} 给出 ${texInline("x=A^{-1}b")}；${texInline("AX=C")} 给出 ${texInline("X=A^{-1}C")}；${texInline("XA=C")} 给出 ${texInline("X=CA^{-1}")}。矩阵位于未知量哪一侧，就在同一侧乘逆矩阵。`,
    },
    {
      label: "复合过程必须逆序撤销",
      text: `${texInline("(AB)^{-1}=B^{-1}A^{-1}")}。因为 ${texInline("ABx=A(Bx)")} 先做 B、后做 A，撤销时先做 ${texInline("A^{-1}")}、再做 ${texInline("B^{-1}")}。`,
    },
    {
      label: "二阶矩阵的求逆公式",
      text: `若 ${texInline("A=\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}")} 且 ${texInline("ad-bc\\ne0")}，则 ${texInline("A^{-1}=\\frac{1}{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}")}。先检查分母，再交换主对角元素、改变副对角元素符号。`,
    },
    {
      label: "伴随矩阵路线",
      text: `一般 n 阶方阵满足 ${texInline("A^{-1}=\\frac{1}{\\det(A)}A^{*}")}。构造 ${texInline("A^{*}")} 的顺序是：删去对应行列得到余子式，加入 ${texInline("(-1)^{i+j}")} 的符号形成代数余子式矩阵，最后转置。`,
    },
    {
      label: "常用反向规则",
      text: `${texInline("\\det(A^{-1})=1/\\det(A)")}，${texInline("(A^T)^{-1}=(A^{-1})^T")}，${texInline("(A^m)^{-1}=(A^{-1})^m")}；对角矩阵逐项取倒数，旋转矩阵的逆是反向旋转，镜像矩阵常满足 ${texInline("M^{-1}=M")}。`,
    },
  ],
  textbook: {
    reference: "北大版《高等代数》第四章",
    page: "",
    items: [
      "逆矩阵的定义、存在条件与唯一性",
      "逆矩阵的运算性质与乘积逆序法则",
      "利用逆矩阵解向量方程和矩阵方程",
      "二阶矩阵求逆公式",
      "余子式、代数余子式与伴随矩阵求逆",
    ],
  },
  interactive: false,
  visual: false,
  example: {
    title: "例题：求逆、解方程并完成验证",
    question: `设 ${texInline("A=\\begin{bmatrix}3&1\\\\1&1\\end{bmatrix}")}，${texInline("b=\\begin{bmatrix}7\\\\3\\end{bmatrix}")}。求 ${texInline("A^{-1}")}，并解 ${texInline("Ax=b")}。`,
    choices: [
      {
        correct: true,
        text: `${texInline("A^{-1}=\\frac12\\begin{bmatrix}1&-1\\\\-1&3\\end{bmatrix}")}，${texInline("x=\\begin{bmatrix}2\\\\1\\end{bmatrix}")}。`,
      },
      {
        text: `${texInline("A^{-1}=\\begin{bmatrix}1&-1\\\\-1&3\\end{bmatrix}")}，${texInline("x=\\begin{bmatrix}4\\\\2\\end{bmatrix}")}。`,
      },
      {
        text: `${texInline("A^{-1}=\\frac14\\begin{bmatrix}1&-1\\\\-1&3\\end{bmatrix}")}，${texInline("x=\\begin{bmatrix}1\\\\1/2\\end{bmatrix}")}。`,
      },
      {
        text: `${texInline("A^{-1}=\\frac12\\begin{bmatrix}3&-1\\\\-1&1\\end{bmatrix}")}，${texInline("x=\\begin{bmatrix}9\\\\-1\\end{bmatrix}")}。`,
      },
    ],
    steps: [
      `先检查二阶公式的分母：${texInline("\\det(A)=3\\cdot1-1\\cdot1=2\\ne0")}，因此逆矩阵存在。这里直接使用第三节已经建立的判定，不重复面积与秩的解释。`,
      `交换主对角元素并改变副对角元素符号，得到 ${texInline("\\begin{bmatrix}1&-1\\\\-1&3\\end{bmatrix}")}。`,
      `除以行列式 2：${texInline("A^{-1}=\\frac12\\begin{bmatrix}1&-1\\\\-1&3\\end{bmatrix}")}。`,
      `在 ${texInline("Ax=b")} 左侧乘 ${texInline("A^{-1}")}，得到 ${texInline("x=A^{-1}b=\\frac12\\begin{bmatrix}1&-1\\\\-1&3\\end{bmatrix}\\begin{bmatrix}7\\\\3\\end{bmatrix}=\\begin{bmatrix}2\\\\1\\end{bmatrix}")}。`,
      `最后代回：${texInline("A\\begin{bmatrix}2\\\\1\\end{bmatrix}=\\begin{bmatrix}7\\\\3\\end{bmatrix}")}；同时可检查 ${texInline("AA^{-1}=I")}。`,
    ],
  },
  quiz: [
    {
      question: "为什么同一个方阵不可能有两个不同的逆矩阵？",
      answer: `若 B、C 都是 A 的逆，则 ${texInline("B=B(AC)=(BA)C=C")}，所以逆矩阵唯一。`,
    },
    {
      question: `若 ${texInline("A,B")} 都可逆，${texInline("(AB)^{-1}")} 是什么？`,
      answer: `${texInline("(AB)^{-1}=B^{-1}A^{-1}")}。撤销复合过程要从最后发生的作用开始。`,
    },
    {
      question: `方程 ${texInline("XA=C")} 应怎样消去右侧的 A？`,
      answer: `在等式两边右乘 ${texInline("A^{-1}")}，得到 ${texInline("X=CA^{-1}")}。`,
    },
    {
      question: `若 ${texInline("\\det(A)=-4")}，${texInline("\\det(A^{-1})")} 是多少？`,
      answer: `${texInline("\\det(A^{-1})=-1/4")}。逆变换的面积或体积倍率是原倍率的倒数。`,
    },
    {
      question: `对角矩阵 ${texInline("D=\\operatorname{diag}(2,-3,5)")} 的逆是什么？`,
      answer: `${texInline("D^{-1}=\\operatorname{diag}(1/2,-1/3,1/5)")}。每个非零缩放因子分别取倒数。`,
    },
    {
      question: "用伴随矩阵求逆时，代数余子式矩阵为什么还要转置？",
      answer: `伴随矩阵 ${texInline("A^{*}")} 按定义是代数余子式矩阵的转置；只有完成转置后才满足 ${texInline("AA^{*}=A^{*}A=\\det(A)I")}。`,
    },
    {
      question: "本节为什么不展开增广矩阵求逆算法？",
      answer: `本节只记录 ${texInline("[A\\mid I]\\to[I\\mid A^{-1}]")} 的结果形式；行变换机制与算法将在 §6 初等矩阵中系统说明。`,
    },
  ],
  summary: [
    "逆矩阵是可逆方阵唯一的双侧撤销运算；左右相乘都回到单位矩阵。",
    "矩阵方程中，逆矩阵必须乘在与原矩阵相同的一侧。",
    "复合过程按相反顺序撤销，所以乘积的逆会倒序。",
    "二阶公式提供直接计算；一般情形可用伴随矩阵公式，初等行变换算法留到第六节。",
    "下一节将把大矩阵按行列切成块，用结构化的方式组织运算。",
  ],
  exercises: [
    `证明：若 ${texInline("AB=BA=I")} 且 ${texInline("AC=CA=I")}，则 ${texInline("B=C")}。`,
    `设 ${texInline("A,B")} 可逆，分别验证 ${texInline("B^{-1}A^{-1}")} 是 ${texInline("AB")} 的左逆和右逆。`,
    `对 ${texInline("A=\\begin{bmatrix}1&2&0\\\\0&1&1\\\\1&0&1\\end{bmatrix}")} 写出元素 ${texInline("a_{12}")} 的余子矩阵、余子式与代数余子式。`,
  ],
});
