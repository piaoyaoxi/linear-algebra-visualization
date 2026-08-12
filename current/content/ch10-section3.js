defineChapter10Section({
  id: "bilinear-form",
  number: "§3",
  textbookSection: "双线性函数",
  title: "双线性函数",
  navTitle: "双线性函数",
  question: "固定一个向量以后，另一个输入为什么自动成为线性函数？一张矩阵又怎样记录全部配对？",
  goal: "把双线性函数理解为“由一个向量选择线性读取器”；从基向量的配对表推导矩阵公式；区分两空间分别换基与同一空间合同换基；理解根空间、非退化、结构分解及其与二次型的联系。",
  tags: ["双线性函数", "配对矩阵", "非退化"],
  intro:
    "双线性函数有两个输入槽。固定 " + texInline("y") + " 后，映射 " + texInline("x\\mapsto B(x,y)") + " 属于 " + texInline("V^*") + "；固定 " + texInline("x") + " 后，映射 " + texInline("y\\mapsto B(x,y)") + " 属于 " + texInline("W^*") + "。在选定坐标后，前一个协向量的系数可由 " + texInline("Ay") + " 记录，图中只用这个系数方向显示等值层的法向；真正的读取器仍是 " + texInline("x\\mapsto x^TAy") + "。",
  textbook: {
    reference: "Hoffman–Kunze §10.1–§10.3 · Friedberg §6.8",
    page: "",
    items: [
      "分别线性与固定一槽得到线性函数",
      "基向量配对表和矩阵表示",
      "一般换基、合同与不变量",
      "根空间、非退化及对称—交错分解",
    ],
  },
  interactive: {
    type: "bilinear-mixer",
    title: "固定一槽，观察另一槽",
    question: "固定 y 后，x 的等值层为什么由 y 决定？交换固定槽以后，读取规则怎样改变？",
  },
  concepts: [
    {
      label: "分别线性",
      text: texInline("B:V\\times W\\to F") + " 在每个输入槽上分别满足可加性与齐次性。固定 " + texInline("y\\in W") + " 得到 " + texInline("R_B(y):x\\mapsto B(x,y)\\in V^*") + "；固定 " + texInline("x\\in V") + " 得到 W 上的线性函数。",
    },
    {
      label: "配对表",
      text: "选基 " + texInline("e_1,\\ldots,e_m") + " 与 " + texInline("f_1,\\ldots,f_n") + "，令 " + texInline("a_{ij}=B(e_i,f_j)") + "。展开两个输入可得 " + texInline("B(x,y)=\\sum_{i,j}x_i a_{ij}y_j=x^TAy") + "；矩阵由所有基向量配对值唯一确定。",
    },
    {
      label: "两种换基",
      text: "若新基坐标满足 " + texInline("[x]_{\\rm old}=P[x]_{\\rm new}") + "、" + texInline("[y]_{\\rm old}=Q[y]_{\\rm new}") + "，则 " + texInline("A_{\\rm new}=P^TA_{\\rm old}Q") + "。双线性型定义在 " + texInline("V\\times V") + " 上并对两槽采用同一新基时，才化为合同 " + texInline("A_{\\rm new}=P^TAP") + "。",
    },
    {
      label: "根与非退化",
      text: "左根由所有满足 " + texInline("B(x,y)=0\\ (\\forall y)") + " 的 x 组成，右根交换两个槽。方阵表示下，它们分别对应 " + texInline("\\ker A^T") + " 与 " + texInline("\\ker A") + "；有限维双线性型非退化当且仅当 " + texInline("\\det A\\ne0") + "。",
    },
  ],
  example: {
    title: "从配对表计算，并拆出两种结构",
    question: "已知 " + texInline("B(e_1,e_1)=2") + "、" + texInline("B(e_1,e_2)=1") + "、" + texInline("B(e_2,e_1)=-1") + "、" + texInline("B(e_2,e_2)=3") + "。计算 " + texInline("B((1,2)^T,(3,-1)^T)") + "，判断是否退化，并求它的对称部分、交错部分及对应二次型。",
    steps: [
      {
        title: "把四个基配对值放入矩阵",
        text: texInline("A=\\begin{bmatrix}2&1\\\\-1&3\\end{bmatrix}") + "；行指标来自左槽，列指标来自右槽。",
      },
      {
        title: "沿第一条路径计算",
        text: "对 " + texInline("y=(3,-1)^T") + "，有 " + texInline("Ay=(5,-6)^T") + "，所以 " + texInline("x^T(Ay)=5-12=-7") + "。",
      },
      {
        title: "沿第二条路径核对",
        text: "对 " + texInline("x=(1,2)^T") + "，有 " + texInline("A^Tx=(0,7)^T") + "，于是 " + texInline("(A^Tx)^Ty=-7") + "。两条路径必须给出同一标量。",
      },
      {
        title: "检查非退化",
        text: texInline("\\det A=2\\cdot3-1\\cdot(-1)=7\\ne0") + "，因此左右根都只有零向量。",
      },
      {
        title: "在特征不为 2 的数域上分解",
        text: texInline("S=(A+A^T)/2=\\begin{bmatrix}2&0\\\\0&3\\end{bmatrix}") + "，" + texInline("K=(A-A^T)/2=\\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix}") + "，且 " + texInline("A=S+K") + "。",
      },
      {
        title: "合并两个输入得到二次型",
        text: texInline("Q(z)=B(z,z)=z^TAz=2z_1^2+3z_2^2") + "。交错部分满足 " + texInline("z^TKz=0") + "，所以 Q 只保留 S。",
      },
    ],
  },
  quiz: [
    {
      question: "双线性是否等于把向量对 (x,y) 当作 V×W 中的一个向量，再要求整体线性？",
      answer: "不等于。双线性要求固定任意一槽后对另一槽线性；若把两槽同时相加，会出现交叉项，一般不满足整体线性。",
    },
    {
      question: "为什么矩阵元素满足 " + texInline("a_{ij}=B(e_i,f_j)") + "？",
      answer: "在公式 " + texInline("B(x,y)=x^TAy") + " 中依次代入第 i 个和第 j 个标准坐标列，只剩矩阵的第 i 行第 j 列。",
    },
    {
      question: "V 与 W 分别换基时，矩阵为什么是 " + texInline("P^TAQ") + " 而不总是 " + texInline("P^TAP") + "？",
      answer: "左右输入属于两个空间，可以采用两套独立的新基。只有同一空间的双线性型在两个槽中使用同一新基时，才有 Q=P。",
    },
    {
      question: "一般双线性函数的左根与右根一定相同吗？",
      answer: "不一定。坐标上左根是 " + texInline("\\ker A^T") + "，右根是 " + texInline("\\ker A") + "；矩阵不具对称结构时，两者可以是不同子空间。",
    },
    {
      question: "数域特征不为 2 时，一般双线性型怎样分成对称部分和斜对称部分？",
      answer: texInline("B_s(x,y)=[B(x,y)+B(y,x)]/2") + "，" + texInline("B_a(x,y)=[B(x,y)-B(y,x)]/2") + "，并且 " + texInline("B=B_s+B_a") + "。",
    },
    {
      question: "为什么 " + texInline("Q(x)=B(x,x)") + " 不能恢复任意双线性型？",
      answer: "斜对称部分在两个输入相同时恒为 0，所以 Q 看不到它。Q 只能恢复 B 的对称部分；恢复公式还需要数域特征不为 2。",
    },
    {
      question: "有限维双线性型的矩阵可逆，与“每个非零向量都能找到非零配对搭档”有什么关系？",
      answer: "矩阵可逆等价于左右根均为零；因此任何非零向量都不可能与另一槽的所有向量同时配对为 0。",
    },
  ],
  summary: [
    "固定双线性函数的一个输入槽，会得到另一个空间上的线性读取器；这给出双线性的核心解释。",
    "矩阵是基向量两两配对的完整表格，展开两边坐标便得到 " + texInline("B(x,y)=x^TAy") + "。",
    "两个空间分别换基得到 " + texInline("P^TAQ") + "；同一空间、同一新基的双线性型才按 " + texInline("P^TAP") + " 合同变化。",
    "根空间刻画不可见方向；特征不为 2 时，对称与交错部分分担两类结构，而二次型只能看见前者。",
    "下一节把注意力集中到交错且非退化的配对，研究它为什么把方向组织成二维一对。",
  ],
});
