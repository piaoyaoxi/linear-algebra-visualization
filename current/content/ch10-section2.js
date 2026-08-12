defineChapter10Section({
  id: "dual-space",
  number: "§2",
  textbookSection: "对偶空间",
  title: "对偶空间",
  navTitle: "对偶空间",
  question: "在一组斜基中，怎样只读出第 i 个坐标？所有这样的线性读取器又怎样组成一个空间？",
  goal: "从坐标读取问题构造对偶基；理解对偶空间与自然求值配对；掌握向量和线性函数的双向展开；用对偶映射解释测量为什么沿线性变换反向传播。",
  tags: ["对偶空间", "对偶基", "对偶映射"],
  intro:
    "向量 " + texInline("x") + " 的坐标取决于所选基。标准基下，第一坐标可以直接读取；基一旦倾斜，普通的水平或竖直投影便失效。我们需要寻找一组线性函数，使 " + texInline("v^i(v_j)=\\delta_{ij}") + "：第 i 个函数在第 i 支基向量上读出 1、在其余基向量上读出 0。这样的坐标读取器构成对偶基。",
  textbook: {
    reference: "Axler §3.F · Friedberg §2.6 · Hoffman–Kunze §3.5",
    page: "",
    items: [
      "对偶空间及其维数",
      "对偶基与两条重建公式",
      "对偶映射的反向性",
      "双对偶的自然嵌入",
    ],
  },
  interactive: {
    type: "dual-probe",
    title: "斜基坐标读取器",
    question: "为什么 v¹ 的零值层必须沿着 v₂，而 v² 的零值层必须沿着 v₁？",
  },
  concepts: [
    {
      label: "所有读取器",
      text: texInline("V^*=\\operatorname{Hom}(V,F)") + " 收集 V 上全部线性函数。按 " + texInline("(f+g)(x)=f(x)+g(x)") + " 与 " + texInline("(\\lambda f)(x)=\\lambda f(x)") + " 运算，它本身也是向量空间；有限维时 " + texInline("\\dim V^*=\\dim V") + "。",
    },
    {
      label: "自然求值",
      text: texInline("\\langle f,x\\rangle=f(x)") + " 把 " + texInline("V^*\\times V") + " 送到 F，并对两个输入分别线性。这个配对直接来自“函数作用于向量”，不需要先选坐标或内积。",
    },
    {
      label: "对偶基与重建",
      text: "基 " + texInline("v_1,\\ldots,v_n") + " 的对偶基由 " + texInline("v^i(v_j)=\\delta_{ij}") + " 定义。于是 " + texInline("x=\\sum_i v^i(x)v_i") + "，同时任意 " + texInline("f\\in V^*") + " 满足 " + texInline("f=\\sum_i f(v_i)v^i") + "。",
    },
    {
      label: "反向传播",
      text: "若 " + texInline("T:V\\to W") + "，则 " + texInline("T^*:W^*\\to V^*") + " 由 " + texInline("T^*(g)=g\\circ T") + " 定义：W 上的测量沿 T 拉回 V。另一方面，" + texInline("J(x)(f)=f(x)") + " 给出自然映射 " + texInline("J:V\\to V^{**}") + "，有限维时它是同构。",
    },
  ],
  example: {
    title: "求斜基的对偶基，并用它恢复向量与函数",
    question: "在 " + texInline("\\mathbb R^2") + " 中，令 " + texInline("v_1=(1,1)^T") + "、" + texInline("v_2=(2,1)^T") + "。求对偶基 " + texInline("v^1,v^2") + "；再求 " + texInline("x=(3,2)^T") + " 的基坐标，并把 " + texInline("f(x_1,x_2)=2x_1-x_2") + " 写成对偶基的线性组合。",
    steps: [
      {
        title: "把基向量排成基矩阵",
        text: texInline("P=[v_1\\;v_2]=\\begin{bmatrix}1&2\\\\1&1\\end{bmatrix}") + "，且 " + texInline("\\det P=-1\\ne0") + "。",
      },
      {
        title: "从 Kronecker 条件求第一读取器",
        text: "设 " + texInline("v^1=[a\\;b]") + "。条件 " + texInline("a+b=1") + "、" + texInline("2a+b=0") + " 给出 " + texInline("v^1=[-1\\;2]") + "。",
      },
      {
        title: "求第二读取器并统一验证",
        text: texInline("v^2=[1\\;-1]") + "。基矩阵的逆 " + texInline("P^{-1}=\\begin{bmatrix}-1&2\\\\1&-1\\end{bmatrix}") + " 的两行正是 " + texInline("v^1,v^2") + "。",
      },
      {
        title: "读取向量的两个基坐标",
        text: texInline("v^1(x)=1") + "、" + texInline("v^2(x)=1") + "，所以 " + texInline("x=v_1+v_2") + "。",
      },
      {
        title: "读取函数在基向量上的值",
        text: texInline("f(v_1)=1") + "、" + texInline("f(v_2)=3") + "。",
      },
      {
        title: "在对偶基中重建函数",
        text: texInline("f=f(v_1)v^1+f(v_2)v^2=v^1+3v^2") + "；换回标准坐标得到 " + texInline("[2\\;-1]") + "。",
      },
    ],
  },
  quiz: [
    {
      question: "线性函数 " + texInline("f:V\\to F") + " 是哪个空间中的向量？",
      answer: texInline("f\\in V^*") + "。对偶空间的加法与数乘在每个输入向量上逐点进行。",
    },
    {
      question: "为什么 " + texInline("v^i(x)") + " 正好等于 x 相对基 " + texInline("v_1,\\ldots,v_n") + " 的第 i 个坐标？",
      answer: "把 " + texInline("x=\\sum_jx_jv_j") + " 代入，得到 " + texInline("v^i(x)=\\sum_jx_j\\delta_{ij}=x_i") + "。",
    },
    {
      question: "若基矩阵为 P，对偶基的坐标为什么出现在 " + texInline("P^{-1}") + " 的各行？",
      answer: "把对偶基各行组成矩阵 R，条件 " + texInline("v^i(v_j)=\\delta_{ij}") + " 正是 " + texInline("RP=I") + "，所以 " + texInline("R=P^{-1}") + "。",
    },
    {
      question: "有限维时 V 与 V* 维数相同，为什么仍不把它们直接视作同一个空间？",
      answer: "维数相同只保证存在同构；由基或内积得到的 V→V* 同构依赖选择。向量与线性读取器仍承担不同角色。",
    },
    {
      question: "若 " + texInline("T:V\\to W") + "，为什么 " + texInline("T^*") + " 从 " + texInline("W^*") + " 指向 " + texInline("V^*") + "？",
      answer: "给定 W 上的读取器 g，复合 " + texInline("g\\circ T") + " 可以直接读取 V 中的输入，因此属于 " + texInline("V^*") + "。",
    },
    {
      question: "对线性映射 " + texInline("V\\xrightarrow{T}W\\xrightarrow{S}U") + "，复合的对偶满足什么顺序？",
      answer: texInline("(S\\circ T)^*=T^*\\circ S^*") + "。读取器先从 U 拉回 W，再从 W 拉回 V，所以顺序反转。",
    },
    {
      question: "自然映射 " + texInline("J:V\\to V^{**}") + " 如何让一个向量“读取”线性函数？",
      answer: texInline("J(x)(f)=f(x)") + "。固定 x 后，右式关于 f 线性，因此 " + texInline("J(x)\\in V^{**}") + "。",
    },
  ],
  summary: [
    "对偶空间 " + texInline("V^*") + " 由所有线性读取器组成；自然求值 " + texInline("f(x)") + " 不依赖坐标或内积。",
    "对偶基通过 Kronecker 条件逐个读取基坐标，并同时给出向量与线性函数的重建公式。",
    texInline("V") + " 与 " + texInline("V^*") + " 的同构通常依赖选择；有限维的 " + texInline("V\\to V^{**}") + " 求值映射具有自然性。",
    "对偶映射通过复合把测量沿线性变换反向拉回；下一节固定双线性配对的一槽时，会直接得到另一槽上的线性读取器。",
  ],
});
