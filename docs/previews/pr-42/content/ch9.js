(() => {
  const t = (source) => texInline(source);
  const D = (source) => texDisplay(source);
  const reference = "北大版《高等代数》第九章";

  const sections = [
    {
      id: "inner-product-geometry",
      number: "§1",
      textbookSection: "定义与基本性质",
      title: "定义与基本性质",
      navTitle: "定义与基本性质",
      question: "在线性空间中增加什么结构，才能严格讨论长度、夹角、垂直和距离？",
      goal: "从内积的三条公理出发，建立长度、距离、夹角与正交；用可拖动向量观察内积的符号、大小和 Cauchy–Schwarz 等号条件。",
      tags: ["内积", "范数与距离", "夹角", "Cauchy–Schwarz"],
      intro:
        "线性空间只规定向量怎样相加、怎样数乘，却没有天然的刻度。内积把代数运算与几何测量连接起来：一旦可以比较两个向量的内积，长度、角度、正交和距离都能由同一个结构导出。",
      concepts: [
        { label: "内积", text: `实线性空间上的内积满足双线性、对称与正定，记作 ${t("\\langle x,y\\rangle")}。` },
        { label: "长度与距离", text: `${t("\\lVert x\\rVert=\\sqrt{\\langle x,x\\rangle}")}，并令 ${t("d(x,y)=\\lVert x-y\\rVert")}。` },
        { label: "夹角", text: `非零向量满足 ${t("\\cos\\theta=\\frac{\\langle x,y\\rangle}{\\lVert x\\rVert\\lVert y\\rVert}")}。` },
        { label: "正交", text: `${t("x\\perp y")} 当且仅当 ${t("\\langle x,y\\rangle=0")}；零向量与每个向量正交，但夹角不定义。` },
      ],
      formalBlocks: [
        {
          eyebrow: "结构入口",
          title: "内积为线性空间加入度量",
          body: `对任意 ${t("x,y,z\\in V")} 与 ${t("a,b\\in\\mathbb R")}，内积满足 ${t("\\langle ax+by,z\\rangle=a\\langle x,z\\rangle+b\\langle y,z\\rangle")}、${t("\\langle x,y\\rangle=\\langle y,x\\rangle")}，以及 ${t("\\langle x,x\\rangle\\ge 0")} 且等号只在 ${t("x=0")} 时成立。`,
        },
        {
          eyebrow: "核心不等式",
          title: "Cauchy–Schwarz 控制夹角公式",
          body: `${D("|\\langle x,y\\rangle|\\le \\lVert x\\rVert\\,\\lVert y\\rVert")}` +
            `它保证夹角公式中的余弦落在 ${t("[-1,1]")} 内。等号成立当且仅当两个向量线性相关。`,
        },
        {
          eyebrow: "由此推出",
          title: "范数满足三角不等式",
          body: `${D("\\lVert x+y\\rVert\\le \\lVert x\\rVert+\\lVert y\\rVert")}` +
            "长度、距离、夹角与正交并非四套独立定义，它们都来自同一个内积。",
        },
      ],
      interactive: {
        type: "ch9",
        lab: "inner-product",
        title: "内积几何实验",
        description: "拖动两个向量或切换边界预设，读出内积、长度、夹角与关系状态。",
        task: "让图形与公式同步回答：内积何时为正、为负、为零？Cauchy–Schwarz 何时取等号？",
        prompts: [
          "固定两向量长度，只改变夹角，观察内积怎样从正数经过 0 变为负数。",
          "选择“线性相关”，比较内积绝对值与两长度乘积。",
          "选择“含零向量”，确认正交关系仍成立，但夹角读数必须关闭。",
        ],
      },
      example: {
        title: "例题：由内积判断几何关系",
        question: `在 ${t("\\mathbb R^3")} 的标准内积下，设 ${t("x=(1,2,-1)^T")}，${t("y=(2,-1,0)^T")}。下列判断正确的是哪一个？`,
        choices: [
          { correct: true, text: `${t("\\langle x,y\\rangle=0")}，所以 ${t("x\\perp y")}。` },
          { text: "两个向量都含负分量，所以夹角一定是钝角。" },
          { text: `${t("\\langle x,y\\rangle=4")}，所以两向量同向。` },
          { text: "只有单位向量之间才能讨论正交。" },
        ],
        steps: [
          `${t("\\langle x,y\\rangle=1\\cdot2+2\\cdot(-1)+(-1)\\cdot0=0")}。`,
          "内积为 0 直接给出正交，不要求两个向量先单位化。",
          `两向量都非零，所以夹角定义存在，并且 ${t("\\cos\\theta=0")}，即 ${t("\\theta=\\frac{\\pi}{2}")}。`,
        ],
      },
      quiz: [
        { question: "线性空间本身是否天然带有长度？", answer: "不一定。长度需要额外指定内积或范数；本章用内积导出范数。" },
        { question: `${t("\\langle x,y\\rangle<0")} 说明夹角具有什么性质？`, answer: "在两向量非零时，夹角是钝角。" },
        { question: "零向量和非零向量之间的夹角是多少？", answer: "夹角不定义，因为夹角公式的分母含零向量的长度。" },
        { question: "Cauchy–Schwarz 何时取等号？", answer: "当且仅当两个向量线性相关，包括其中一个为零的情形。" },
      ],
      summary: [
        "内积是本章的源头；长度、距离、夹角和正交都由它导出。",
        `${t("\\langle x,y\\rangle")} 的正负反映锐角、直角与钝角，数值大小还受向量长度影响。`,
        "Cauchy–Schwarz 保证夹角公式合法，并刻画线性相关的等号边界。",
        "下一节将寻找让内积计算最简单的坐标系统——标准正交基。",
      ],
      textbook: { reference, items: ["欧几里得空间与内积公理", "范数、距离、夹角和正交", "Cauchy–Schwarz 与三角不等式"] },
    },
    {
      id: "orthonormal-bases",
      number: "§2",
      textbookSection: "标准正交基",
      title: "标准正交基",
      navTitle: "标准正交基",
      question: "怎样选择一组基，使坐标、长度和投影都能直接从内积读出？",
      goal: "理解标准正交基的坐标公式与 Parseval 等式，并亲手执行二维 Gram–Schmidt 正交化，识别线性相关导致的失败边界。",
      tags: ["正交基", "规范化", "Gram–Schmidt", "Parseval"],
      intro:
        "一般基可以表示所有向量，但坐标需要解方程。标准正交基把方向彼此分开且统一长度，向量在每个方向上的坐标就是一次内积，长度平方则是坐标平方之和。",
      concepts: [
        { label: "标准正交组", text: `${t("\\langle e_i,e_j\\rangle=\\delta_{ij}")}。不同向量正交，每个向量长度为 1。` },
        { label: "坐标读取", text: `若 ${t("\\{e_1,\\ldots,e_n\\}")} 是标准正交基，则 ${t("x=\\sum_i\\langle x,e_i\\rangle e_i")}。` },
        { label: "Parseval", text: `${t("\\lVert x\\rVert^2=\\sum_i|\\langle x,e_i\\rangle|^2")}。` },
        { label: "Gram–Schmidt", text: "依次减去已有正交方向上的投影，再把非零余量单位化。" },
      ],
      formalBlocks: [
        {
          eyebrow: "坐标简化",
          title: "标准正交基让坐标等于投影系数",
          body: `${D("x=\\sum_{i=1}^{n}\\langle x,e_i\\rangle e_i")}` +
            `无需解线性方程；每个 ${t("\\langle x,e_i\\rangle")} 都是 x 沿第 i 个单位方向的有向分量。`,
        },
        {
          eyebrow: "正交化",
          title: "减投影保证新方向正交",
          body: `${D("u_1=v_1,\\qquad u_k=v_k-\\sum_{j<k}\\frac{\\langle v_k,u_j\\rangle}{\\langle u_j,u_j\\rangle}u_j")}` +
            `只要原向量组线性无关，每一步余量都非零，最后令 ${t("e_k=u_k/\\lVert u_k\\rVert")}。`,
        },
        {
          eyebrow: "保持范围",
          title: "每一步都不改变已经生成的子空间",
          body: `${t("\\operatorname{span}(v_1,\\ldots,v_k)=\\operatorname{span}(u_1,\\ldots,u_k)")}。正交化改变的是坐标骨架，不改变原向量组张成的空间。`,
        },
      ],
      interactive: {
        type: "ch9",
        lab: "gram-schmidt",
        title: "Gram–Schmidt 步进器",
        description: "从原始向量到减投影余量，再到标准正交基；每一步同时显示几何和内积证书。",
        task: "比较原始向量组与最终正交组的张成空间，并观察接近线性相关时余量长度怎样变小。",
        prompts: [
          "按顺序执行“原向量 → 减投影 → 单位化”，确认余量与第一方向正交。",
          "交换输入顺序，比较最终基的方向变化与张成空间不变。",
          "选择“线性相关”预设，说明为什么第二个标准正交向量无法产生。",
        ],
      },
      example: {
        title: "例题：正交化并读取坐标",
        question: `对 ${t("v_1=(1,1)^T")}，${t("v_2=(1,0)^T")} 执行 Gram–Schmidt。哪组结果是标准正交基？`,
        choices: [
          { correct: true, text: `${t("e_1=\\frac1{\\sqrt2}(1,1)^T")}，${t("e_2=\\frac1{\\sqrt2}(1,-1)^T")}。` },
          { text: `${t("e_1=(1,1)^T")}，${t("e_2=(1,0)^T")}。` },
          { text: `${t("e_1=\\frac1{\\sqrt2}(1,1)^T")}，${t("e_2=(1,1)^T")}。` },
          { text: "两个原向量不平行，所以无需减投影，只需分别单位化。" },
        ],
        steps: [
          `${t("u_1=v_1=(1,1)^T")}，所以 ${t("e_1=u_1/\\sqrt2")}。`,
          `${t("u_2=v_2-\\langle v_2,e_1\\rangle e_1=(1,0)^T-\\frac12(1,1)^T=\\frac12(1,-1)^T")}。`,
          `将 ${t("u_2")} 单位化得到 ${t("e_2=\\frac1{\\sqrt2}(1,-1)^T")}；两者内积为 0、长度都为 1。`,
        ],
      },
      quiz: [
        { question: "正交组中的非零向量为什么一定线性无关？", answer: "对线性关系分别与每个向量取内积，可逐个得到所有系数为 0。" },
        { question: "标准正交基和正交基相差什么条件？", answer: "标准正交基还要求每个基向量长度为 1。" },
        { question: "Gram–Schmidt 中出现零余量说明什么？", answer: "当前输入向量已经属于前面向量的张成空间，原输入组线性相关。" },
        { question: "交换 Gram–Schmidt 的输入顺序会怎样？", answer: "一般会得到不同的标准正交基，但张成空间保持不变。" },
      ],
      summary: [
        "标准正交基把坐标读取变成内积，把长度平方变成坐标平方和。",
        "Gram–Schmidt 的核心动作是减去已有方向上的全部投影。",
        "线性相关会让某一步余量变成零，这是算法的结构边界，不是数值故障。",
        "下一节将用标准正交坐标理解欧几里得空间之间的同构。",
      ],
      textbook: { reference, items: ["正交组、正交基与标准正交基", "标准正交坐标与 Parseval 等式", "Gram–Schmidt 正交化"] },
    },
    {
      id: "euclidean-isomorphism",
      number: "§3",
      textbookSection: "同构",
      title: "欧几里得空间的同构",
      navTitle: "同构",
      question: "两个向量空间维数相同就线性同构；什么时候这种对应还完整保留长度和夹角？",
      goal: "区分一般线性同构与保持内积的欧几里得同构，理解标准正交基把任意 n 维欧几里得空间等距地坐标化为标准空间。",
      tags: ["等距同构", "坐标映射", "内积保持", "结构层次"],
      intro:
        "维数相同只保证线性结构可以对应。欧几里得空间还带有长度和夹角，因此需要更强的映射：它不仅线性且双射，还必须保持内积。标准正交基给出的坐标映射正好满足这一要求。",
      concepts: [
        { label: "线性同构", text: "线性且双射，保持加法与数乘。" },
        { label: "欧氏同构", text: `${t("\\langle Tx,Ty\\rangle=\\langle x,y\\rangle")}；它自动保持长度、距离、夹角与正交。` },
        { label: "坐标同构", text: `相对于标准正交基，${t("x\\mapsto(\\langle x,e_1\\rangle,\\ldots,\\langle x,e_n\\rangle)^T")} 是等距同构。` },
        { label: "矩阵条件", text: "在标准正交基下，等距同构的矩阵列构成标准正交组。" },
      ],
      formalBlocks: [
        {
          eyebrow: "层次区别",
          title: "线性结构保持不等于度量结构保持",
          body: `可逆剪切是线性同构，却会改变长度和夹角。欧氏同构还要求 ${t("\\langle Tx,Ty\\rangle=\\langle x,y\\rangle")}；这一条同时锁住全部度量量。`,
        },
        {
          eyebrow: "坐标桥",
          title: "标准正交坐标建立与标准空间的等距对应",
          body: `${D("\\Phi(x)=\\begin{bmatrix}\\langle x,e_1\\rangle\\\\\\vdots\\\\\\langle x,e_n\\rangle\\end{bmatrix},\\qquad \\langle\\Phi(x),\\Phi(y)\\rangle=\\langle x,y\\rangle")}`,
        },
        {
          eyebrow: "结果",
          title: "同维有限维欧几里得空间彼此等距同构",
          body: "分别选择标准正交基，再按对应位置发送基向量，就得到保持内积的线性双射。具体规则仍需验证，不能把任意可逆映射都叫作欧氏同构。",
        },
      ],
      interactive: {
        type: "ch9",
        lab: "isometry",
        title: "等距同构检验桥",
        description: "让同一对向量通过旋转、镜像或剪切，比较映射前后的内积、长度和夹角。",
        task: "找出哪些可逆映射只保持线性结构，哪些映射连度量结构也完整保持。",
        prompts: [
          "切换旋转与镜像，验证内积、两条长度和夹角都保持。",
          "切换剪切，确认它仍可逆，却不能通过内积保持闸门。",
          "改变输入向量，观察一个真正的等距映射必须对所有向量对都保持内积。",
        ],
      },
      example: {
        title: "例题：识别等距同构",
        question: `设 ${t("T(x_1,x_2)=(x_1+x_2,x_2)")}。T 是 ${t("\\mathbb R^2")} 到自身的可逆线性映射。关于它的判断哪一个正确？`,
        choices: [
          { correct: true, text: "T 是线性同构，但不是欧氏同构，因为它会改变某些向量的长度与内积。" },
          { text: "只要线性且可逆，就自动保持所有夹角。" },
          { text: "T 不是线性映射，因为输出第一坐标出现了加法。" },
          { text: "T 保持面积，所以一定保持内积。" },
        ],
        steps: [
          `T 的矩阵为 ${t("A=\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}")}，${t("\\det A=1")}，所以它线性且可逆。`,
          `取 ${t("e_2=(0,1)^T")}，有 ${t("Te_2=(1,1)^T")}；长度从 1 变为 ${t("\\sqrt2")}。`,
          "因此 T 只保持线性结构，不保持欧几里得度量。面积保持也不能推出长度和夹角保持。",
        ],
      },
      quiz: [
        { question: "欧氏同构一定是线性同构吗？", answer: "按本节定义是。它线性、双射并保持内积。" },
        { question: "保持内积为什么会保持距离？", answer: "距离由差向量的长度给出，而线性与内积保持使差向量长度保持。" },
        { question: "一个可逆矩阵行列式为 1，是否一定是正交矩阵？", answer: "不一定。剪切矩阵就是反例；还需满足 AᵀA=I。" },
        { question: "标准正交基坐标映射的逆映射是什么？", answer: "把坐标列向量还原为对应标准正交基的线性组合。" },
      ],
      summary: [
        "线性同构保存运算；欧氏同构进一步保存内积及其全部几何后果。",
        "标准正交基把抽象欧几里得空间等距坐标化为标准的实坐标空间。",
        "可逆与等距是两道不同闸门，面积保持也弱于内积保持。",
        "下一节把欧氏空间到自身的等距同构作为特殊线性变换研究。",
      ],
      textbook: { reference, items: ["欧几里得空间同构的定义", "标准正交基坐标同构", "保持内积的等价几何性质"] },
    },
    {
      id: "orthogonal-transformations",
      number: "§4",
      textbookSection: "正交变换",
      title: "正交变换",
      navTitle: "正交变换",
      question: "一个线性变换怎样移动整个空间，仍然让所有长度和夹角原封不动？",
      goal: "掌握正交变换与正交矩阵的等价条件，区分旋转与镜像，并用连续参数验证 QᵀQ=I、Q⁻¹=Qᵀ 和 det Q=±1。",
      tags: ["正交矩阵", "旋转", "镜像", "逆等于转置"],
      intro:
        "正交变换可以旋转或翻转空间，却不拉伸、不剪切。它把标准正交基送到另一组标准正交基；在标准正交坐标下，这一事实恰好写成矩阵方程 QᵀQ=I。",
      concepts: [
        { label: "正交变换", text: `${t("\\langle Qx,Qy\\rangle=\\langle x,y\\rangle")} 对所有 x,y 成立。` },
        { label: "正交矩阵", text: `${t("Q^TQ=I")}，等价于列向量构成标准正交基。` },
        { label: "逆矩阵", text: `${t("Q^{-1}=Q^T")}。` },
        { label: "行列式", text: `${t("\\det Q=1")} 对应保持定向的旋转类，${t("\\det Q=-1")} 对应含镜像的变换。` },
      ],
      formalBlocks: [
        {
          eyebrow: "矩阵证书",
          title: "一条方程同时验证全部向量对",
          body: `${D("\\langle Qx,Qy\\rangle=x^TQ^TQy=x^Ty\\quad\\Longleftrightarrow\\quad Q^TQ=I")}` +
            "因此不需要逐个测试向量；列向量两两正交且长度为 1 就足够。",
        },
        {
          eyebrow: "二维分类",
          title: "二维正交变换只有旋转与镜像两类",
          body: `${D("R_\\theta=\\begin{bmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{bmatrix}")}` +
            `旋转满足 ${t("\\det R_\\theta=1")}；与一次固定镜像复合后行列式变为 -1。`,
        },
        {
          eyebrow: "几何不变量",
          title: "单位圆、距离、夹角与正交全部保持",
          body: "正交变换改变对象的位置和定向，却保持所有由内积定义的测量。其数值稳定性也来自列向量不会挤到近乎相关。",
        },
      ],
      interactive: {
        type: "ch9",
        lab: "orthogonal-transform",
        title: "正交变换工作台",
        description: "连续调节旋转角并切换镜像，观察单位圆、基向量和测试三角形如何移动。",
        task: "在图形变化的同时检查 QᵀQ、行列式、长度误差和逆矩阵关系。",
        prompts: [
          "拖动角度滑块，确认单位圆始终仍是单位圆。",
          "开启镜像，观察定向翻转以及行列式从 1 变为 -1。",
          "切换非正交剪切作对照，找出首先失效的矩阵与几何读数。",
        ],
      },
      example: {
        title: "例题：由矩阵列判断正交性",
        question: `矩阵 ${t("Q=\\frac15\\begin{bmatrix}3&-4\\\\4&3\\end{bmatrix}")} 是否正交？`,
        choices: [
          { correct: true, text: "正交；两列长度均为 1 且内积为 0，所以 QᵀQ=I。" },
          { text: "不正交；矩阵含分数。" },
          { text: "不正交；行列式不等于 0 就只能说明可逆。" },
          { text: "正交；任何对称矩阵都正交。" },
        ],
        steps: [
          `第一列长度平方为 ${t("(3/5)^2+(4/5)^2=1")}，第二列也为 1。`,
          `两列内积为 ${t("(3/5)(-4/5)+(4/5)(3/5)=0")}。`,
          `所以列构成标准正交基，${t("Q^TQ=I")}；并且 ${t("Q^{-1}=Q^T")}。`,
        ],
      },
      quiz: [
        { question: "正交矩阵一定可逆吗？", answer: "一定，且逆矩阵就是转置矩阵。" },
        { question: "det Q 可能等于 0 吗？", answer: "不能。由 det(QᵀQ)=1 得 (det Q)²=1。" },
        { question: "正交矩阵一定是对称矩阵吗？", answer: "不一定。一般旋转矩阵并不对称。" },
        { question: "二维 det Q=-1 的正交变换会发生什么？", answer: "它反转定向，可理解为一条轴的镜像与旋转的复合。" },
      ],
      summary: [
        `${t("Q^TQ=I")} 是正交变换的统一矩阵证书。`,
        "旋转保持定向，含镜像的正交变换反转定向；两者都保持全部度量。",
        "正交矩阵的逆等于转置，列与行都构成标准正交基。",
        "下一节把正交结构用于子空间分解与最近点。",
      ],
      textbook: { reference, items: ["正交变换与正交矩阵", "QᵀQ=I 的等价条件", "二维旋转、镜像与行列式分类"] },
    },
    {
      id: "orthogonal-subspaces",
      number: "§5",
      textbookSection: "子空间",
      title: "子空间、正交补与投影",
      navTitle: "子空间",
      question: "给定一个子空间，任意向量能否唯一拆成“留在子空间中的部分”和“垂直离开的部分”？",
      goal: "理解正交补、正交直和与正交投影；在二维实验中验证 x=p+e、p∈W、e∈W⊥，并用距离比较确认投影是唯一最近点。",
      tags: ["正交补", "正交分解", "投影", "最近点"],
      intro:
        "子空间不仅可以与另一个子空间相加，还能由内积找到最自然的互补方向。向量沿子空间保留一部分，剩余部分与子空间垂直；这份分解同时解决最近点问题。",
      concepts: [
        { label: "正交补", text: `${t("W^\\perp=\\{x:\\langle x,w\\rangle=0,\\ \\forall w\\in W\\}")}。` },
        { label: "正交直和", text: `有限维欧几里得空间满足 ${t("V=W\\oplus W^\\perp")}。` },
        { label: "正交投影", text: `每个 x 唯一写成 ${t("x=p+e")}，其中 ${t("p\\in W")}、${t("e\\in W^\\perp")}；记 ${t("p=P_Wx")}。` },
        { label: "最近点", text: `${t("\\lVert x-w\\rVert^2=\\lVert e\\rVert^2+\\lVert p-w\\rVert^2")}，所以 p 是 W 中唯一最近点。` },
      ],
      formalBlocks: [
        {
          eyebrow: "唯一分解",
          title: "子空间与正交补覆盖全部空间且交只有零向量",
          body: `${D("V=W\\oplus W^\\perp,\\qquad x=P_Wx+(I-P_W)x")}` +
            "两个分量正交，因此长度平方可以按 Pythagoras 相加。",
        },
        {
          eyebrow: "标准正交基公式",
          title: "投影由子空间标准正交基直接相加",
          body: `${D("P_Wx=\\sum_{i=1}^{k}\\langle x,e_i\\rangle e_i")}` +
            `若把基向量作为列组成 ${t("Q")}，则 ${t("P_W=QQ^T")}。`,
        },
        {
          eyebrow: "最小化",
          title: "垂直条件是最近点的精确证书",
          body: `候选点 p 在 W 中，并且 ${t("x-p\\perp W")}；这两条条件共同刻画投影。只看到垂足图形还不够，必须检查正交残差。`,
        },
      ],
      interactive: {
        type: "ch9",
        lab: "projection",
        title: "正交分解与最近点实验",
        description: "拖动向量 x、旋转目标子空间 W，并沿 W 移动比较点 w。",
        task: "验证投影分量与残差来自同一计算，并用距离账本确认投影点确实最短。",
        prompts: [
          "拖动 x，观察 p 与 e 始终满足 x=p+e。",
          "旋转 W，检查残差 e 与 W 的方向内积始终为 0。",
          "移动比较点 w，观察距离在 w=p 时达到唯一最小值。",
        ],
      },
      example: {
        title: "例题：投影到一维子空间",
        question: `设 ${t("W=\\operatorname{span}\\{(1,2)^T\\}")}，${t("x=(3,1)^T")}。x 在 W 上的正交投影是哪一个？`,
        choices: [
          { correct: true, text: `${t("P_Wx=(1,2)^T")}。` },
          { text: `${t("P_Wx=(3,1)^T")}，因为 x 本身就是投影。` },
          { text: `${t("P_Wx=(2,4)^T")}。` },
          { text: `${t("P_Wx=(0,0)^T")}，因为 x 与生成向量不平行。` },
        ],
        steps: [
          `令 ${t("u=(1,2)^T")}，则 ${t("P_Wx=\\frac{\\langle x,u\\rangle}{\\langle u,u\\rangle}u")}。`,
          `${t("\\langle x,u\\rangle=5")}，${t("\\langle u,u\\rangle=5")}，故系数为 1。`,
          `残差 ${t("x-P_Wx=(2,-1)^T")} 与 u 的内积为 0，完成正交证书。`,
        ],
      },
      quiz: [
        { question: `${t("W\\cap W^\\perp")} 等于什么？`, answer: "只含零向量。任何同时属于两者的向量与自身正交，故长度为 0。" },
        { question: "正交补的维数满足什么关系？", answer: "有限维时 dim W + dim W⊥ = dim V。" },
        { question: "投影矩阵 P 是否总满足 P²=P？", answer: "正交投影矩阵满足 P²=P，并且还满足 Pᵀ=P。" },
        { question: "最近点条件中，残差需要垂直于一个基向量还是整个子空间？", answer: "垂直于整个子空间；验证一组基即可推出对所有向量成立。" },
      ],
      summary: [
        "正交补给出子空间最自然的互补部分，形成 V=W⊕W⊥。",
        "投影 p 与残差 e 满足 x=p+e，并由 p∈W、e∈W⊥ 唯一确定。",
        "Pythagoras 分解证明 p 是 W 中唯一最近点。",
        "下一节将看到实对称矩阵总能选择一组标准正交特征基。",
      ],
      textbook: { reference, items: ["正交补与维数关系", "正交直和与正交投影", "投影矩阵与最近点性质"] },
    },
    {
      id: "symmetric-canonical-form",
      number: "§6",
      textbookSection: "实对称矩阵的标准形",
      title: "实对称矩阵的标准形",
      navTitle: "实对称矩阵标准形",
      question: "为什么实对称矩阵一定能找到彼此正交的特征方向，并用一次旋转把矩阵化成对角形？",
      goal: "理解实谱定理、不同特征值特征向量正交与重特征空间内正交化；通过工作台验证 A=QΛQᵀ，并明确非对称矩阵不能套用这一结论。",
      tags: ["谱定理", "正交对角化", "特征方向", "主轴"],
      intro:
        "一般矩阵未必有足够特征向量，即使可对角化也未必能用正交基。实对称性提供了额外结构：所有特征值为实数，不同特征值的特征向量自动正交，每个特征空间内部还可以正交化。",
      concepts: [
        { label: "实谱定理", text: `实对称矩阵 A 存在正交矩阵 Q，使 ${t("Q^TAQ=\\Lambda")} 为实对角矩阵。` },
        { label: "谱分解", text: `${t("A=Q\\Lambda Q^T=\\sum_i\\lambda_i q_iq_i^T")}。` },
        { label: "正交特征向量", text: "属于不同特征值的特征向量彼此正交。" },
        { label: "几何作用", text: "先转到标准正交特征基，沿各特征方向独立伸缩，再转回原坐标。" },
      ],
      formalBlocks: [
        {
          eyebrow: "关键正交性",
          title: "对称性把两个特征方程连接起来",
          body: `若 ${t("Au=\\lambda u")}、${t("Av=\\mu v")}，则 ${t("\\lambda\\langle u,v\\rangle=\\langle Au,v\\rangle=\\langle u,Av\\rangle=\\mu\\langle u,v\\rangle")}。当 ${t("\\lambda\\ne\\mu")} 时，必有 ${t("u\\perp v")}。`,
        },
        {
          eyebrow: "标准形",
          title: "正交坐标变换得到对角矩阵",
          body: `${D("Q^TAQ=\\operatorname{diag}(\\lambda_1,\\ldots,\\lambda_n),\\qquad A=Q\\Lambda Q^T")}` +
            "Q 的列是标准正交特征向量；转置同时承担逆变换。",
        },
        {
          eyebrow: "适用边界",
          title: "非对称矩阵必须关闭谱定理结论",
          body: "非对称矩阵也可能偶然正交对角化，但一旦能被实正交矩阵对角化，它本身必然对称。工作台用对称误差作为结论闸门。",
        },
      ],
      interactive: {
        type: "ch9",
        lab: "spectral",
        title: "实对称谱分解工作台",
        description: "调节 2×2 矩阵，追踪特征值、标准正交特征方向、单位圆像与 QΛQᵀ 重构误差。",
        task: "把同一组数值同时用于矩阵、特征方向、椭圆主轴与重构，检查对称性失效时结论是否正确关闭。",
        prompts: [
          "切换不同特征值预设，观察椭圆主轴与特征向量一致。",
          "切换重特征值，说明特征方向为什么不唯一，但仍可选标准正交基。",
          "开启非对称扰动，确认工作台不再宣称存在实正交标准形。",
        ],
      },
      example: {
        title: "例题：读取对称矩阵的谱分解",
        question: `设 ${t("A=\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}")}。下列哪组是标准正交特征基及对应特征值？`,
        choices: [
          { correct: true, text: `${t("q_1=\\frac1{\\sqrt2}(1,1)^T,\\ \\lambda_1=3")}；${t("q_2=\\frac1{\\sqrt2}(1,-1)^T,\\ \\lambda_2=1")}。` },
          { text: `${t("e_1,e_2")} 都是特征向量，特征值均为 2。` },
          { text: `${t("(1,1)^T")} 与 ${t("(1,-1)^T")} 不能同时作为基，因为它们含负数。` },
          { text: "A 不是对角矩阵，所以无法正交对角化。" },
        ],
        steps: [
          `特征多项式为 ${t("(2-\\lambda)^2-1=(\\lambda-3)(\\lambda-1)")}。`,
          `对应特征方向分别为 ${t("(1,1)^T")} 与 ${t("(1,-1)^T")}，两者正交。`,
          `单位化后组成正交矩阵 Q，得到 ${t("Q^TAQ=\\operatorname{diag}(3,1)")}。`,
        ],
      },
      quiz: [
        { question: "实对称矩阵的特征值一定为实数吗？", answer: "一定，这是实谱定理的一部分。" },
        { question: "重特征值时特征向量是否唯一？", answer: "不唯一；可在对应特征空间中选择任意标准正交基。" },
        { question: "QΛQᵀ 中 Q 的列是什么？", answer: "按 Λ 对角元顺序排列的标准正交特征向量。" },
        { question: "一个实矩阵若可被正交矩阵对角化，它一定对称吗？", answer: "一定，因为 A=QΛQᵀ 的转置仍等于 A。" },
      ],
      summary: [
        "实对称性保证实特征值与一组完整的标准正交特征基。",
        `${t("A=Q\\Lambda Q^T")} 把矩阵作用拆成旋转坐标、独立伸缩、旋转返回。`,
        "单位圆像的主轴就是特征方向，轴上的有向伸缩量由特征值决定。",
        "下一节将把正交投影用于不相容方程与最小二乘。",
      ],
      textbook: { reference, items: ["实对称矩阵的特征值与正交性", "实谱定理", "正交对角化与谱分解"] },
    },
    {
      id: "least-squares-distance",
      number: "§7",
      textbookSection: "向量到子空间的距离·最小二乘法",
      title: "向量到子空间的距离与最小二乘法",
      navTitle: "距离与最小二乘",
      question: "当 Ax=b 没有精确解时，怎样找到让误差最小、并且具有清晰几何意义的近似解？",
      goal: "把最小二乘理解为 b 到列空间的正交投影，推导正规方程 AᵀA x̂=Aᵀb，并在回归实验中验证残差与设计矩阵列正交、SSE 在最优点最小。",
      tags: ["最近点", "列空间", "正规方程", "线性回归"],
      intro:
        "不相容方程组的右端向量 b 不在 A 的列空间中，任何 Ax 都无法精确到达它。最合理的替代目标是在列空间中寻找离 b 最近的向量；投影残差必须垂直于整个列空间。",
      concepts: [
        { label: "最小二乘", text: `寻找 ${t("\\hat x")} 使 ${t("\\lVert A x-b\\rVert")} 最小。` },
        { label: "投影解释", text: `${t("A\\hat x=P_{\\operatorname{Col}(A)}b")}。` },
        { label: "残差正交", text: `${t("r=b-A\\hat x\\perp\\operatorname{Col}(A)")}。` },
        { label: "正规方程", text: `${t("A^T(A\\hat x-b)=0")}，即 ${t("A^TA\\hat x=A^Tb")}。` },
      ],
      formalBlocks: [
        {
          eyebrow: "几何目标",
          title: "先选择列空间中的最近向量，再读取系数",
          body: `${D("b=A\\hat x+r,\\qquad A^Tr=0")}` +
            `向量 ${t("A\\hat x")} 是投影点，${t("r")} 是无法由 A 的列组合解释的正交余量。`,
        },
        {
          eyebrow: "正规方程",
          title: "残差垂直于每一列等价于一个矩阵方程",
          body: `${D("A^T(b-A\\hat x)=0\\quad\\Longleftrightarrow\\quad A^TA\\hat x=A^Tb")}` +
            `若 A 列满秩，则 ${t("A^TA")} 正定且解唯一。`,
        },
        {
          eyebrow: "回归连接",
          title: "拟合直线就是投影到由 1 与 x 组成的列空间",
          body: `对数据点 ${t("(x_i,y_i)")}，设计矩阵两列为常数列与 x 坐标列。残差条件变成 ${t("\\sum r_i=0")} 与 ${t("\\sum x_ir_i=0")}。`,
        },
      ],
      interactive: {
        type: "ch9",
        lab: "least-squares",
        title: "最小二乘投影实验",
        description: "拖动一个数据点，比较手动直线与自动最小二乘直线的残差、SSE 和两条正交条件。",
        task: "用残差棒与数值证书确认最优解不是“看起来比较贴合”，而是对列空间真正正交。",
        prompts: [
          "移动斜率与截距，让 SSE 下降，再点击“跳到最小二乘解”比较。",
          "拖动一个数据点，观察最优直线、残差与正规方程同步更新。",
          "在最优状态检查 Σrᵢ 与 Σxᵢrᵢ 接近 0；偏离最优时至少一条条件失效。",
        ],
      },
      example: {
        title: "例题：由正规方程判断最小二乘解",
        question: `已知 A 列满秩，向量 ${t("\\hat x")} 满足 ${t("A^T(A\\hat x-b)=0")}。下列结论正确的是哪一个？`,
        choices: [
          { correct: true, text: `${t("A\\hat x")} 是 b 在 ${t("\\operatorname{Col}(A)")} 上的正交投影，${t("\\hat x")} 是唯一最小二乘解。` },
          { text: `${t("A\\hat x=b")} 必然精确成立。` },
          { text: "残差与 b 正交，而不需要与 A 的列正交。" },
          { text: "正规方程只是一种计算技巧，没有几何含义。" },
        ],
        steps: [
          `${t("A^T(A\\hat x-b)=0")} 等价于残差 ${t("r=b-A\\hat x")} 与 A 的每一列正交。`,
          `因此 ${t("r\\perp\\operatorname{Col}(A)")} 且 ${t("A\\hat x\\in\\operatorname{Col}(A)")}，满足投影的两条刻画条件。`,
          "A 列满秩保证 AᵀA 可逆，所以系数向量 x̂ 唯一；原方程仍可能不相容。",
        ],
      },
      quiz: [
        { question: "最小二乘解是否一定让 Ax=b？", answer: "不一定。只有 b 本来就在列空间中时残差才为 0。" },
        { question: "残差 r 与哪些向量正交？", answer: "与 A 的每一列正交，因此与整个列空间正交。" },
        { question: "A 列满秩时 AᵀA 有什么性质？", answer: "它是实对称正定矩阵，因而可逆。" },
        { question: "线性回归中 Σrᵢ=0 对应设计矩阵的哪一列？", answer: "对应全 1 的常数列，也就是截距项。" },
      ],
      summary: [
        "最小二乘把无精确解的问题改成列空间中的最近点问题。",
        "正规方程是残差垂直于列空间的坐标表达。",
        "回归中的残差和、加权残差和条件来自设计矩阵的两列。",
        "最后一节把实内积中的转置、对称与正交推广到复数域。",
      ],
      textbook: { reference, items: ["向量到子空间的距离", "最小二乘解与正规方程", "线性回归的投影视角"] },
    },
    {
      id: "unitary-spaces",
      number: "＊§8",
      textbookSection: "酉空间介绍",
      title: "酉空间介绍",
      navTitle: "酉空间介绍",
      question: "把标量从实数推广到复数后，怎样修改内积，才能让长度仍然是非负实数？",
      goal: "理解复内积的共轭线性/线性与共轭对称，掌握共轭转置、Hermitian 与酉矩阵的类比，并用相位实验验证 U*U=I 与复内积保持。",
      tags: ["复内积", "共轭转置", "Hermitian", "酉矩阵"],
      intro:
        "若在复向量上直接使用普通转置，向量与自身的乘积可能不是非负实数。复内积必须引入共轭，使长度平方保持真实且非负；实数情形中的对称、正交和转置分别推广为 Hermitian、酉和共轭转置。",
      concepts: [
        { label: "复内积", text: `按本页约定对第一变量共轭线性、第二变量线性，并满足 ${t("\\langle x,y\\rangle=\\overline{\\langle y,x\\rangle}")}。` },
        { label: "共轭转置", text: `${t("A^*=\\overline A^T")}。` },
        { label: "Hermitian", text: `${t("A^*=A")}，对应实数情形的对称矩阵。` },
        { label: "酉矩阵", text: `${t("U^*U=I")}，对应实数情形的正交矩阵。` },
      ],
      formalBlocks: [
        {
          eyebrow: "为何需要共轭",
          title: "复内积必须让向量与自身得到非负实数",
          body: `${D("\\langle z,z\\rangle=\\sum_i\\overline{z_i}z_i=\\sum_i|z_i|^2\\ge0")}` +
            `例如 ${t("z=i")} 时，${t("\\overline i\\,i=1")}；若不用共轭则 ${t("i^2=-1")}。`,
        },
        {
          eyebrow: "平行类比",
          title: "实结构到复结构的替换表",
          body: "转置 → 共轭转置；对称矩阵 → Hermitian 矩阵；正交矩阵 → 酉矩阵；实标准正交基 → 复标准正交基。核心公式保持同一形状。",
        },
        {
          eyebrow: "酉保持",
          title: "U*U=I 保持复内积、模长与正交",
          body: `${D("\\langle Ux,Uy\\rangle=x^*U^*Uy=x^*y=\\langle x,y\\rangle")}` +
            "相位旋转可以改变复数方向，却不改变模长。",
        },
      ],
      interactive: {
        type: "ch9",
        lab: "unitary",
        title: "实正交—复酉桥",
        description: "调节两个复分量的相位，比较酉相位变换与非酉缩放对模长和复内积的影响。",
        task: "观察相位变化为何不改变长度，并用 U*U 误差区分真正的酉变换与仅仅可逆的复变换。",
        prompts: [
          "改变两个相位角，确认每个复分量旋转而总范数保持。",
          "比较变换前后的复内积实部与虚部。",
          "开启非酉缩放，找出范数与 U*U 中首先失效的读数。",
        ],
      },
      example: {
        title: "例题：判断复矩阵是否酉",
        question: `设 ${t("U=\\begin{bmatrix}1&0\\\\0&i\\end{bmatrix}")}。下列判断正确的是哪一个？`,
        choices: [
          { correct: true, text: `${t("U^*=\\operatorname{diag}(1,-i)")}，所以 ${t("U^*U=I")}，U 是酉矩阵。` },
          { text: "U 含虚数，所以不能保持长度。" },
          { text: `${t("U^TU=I")} 才是酉矩阵的定义，不需要共轭。` },
          { text: "U 的第二个对角元不是 1，所以 U 不可逆。" },
        ],
        steps: [
          `共轭转置把 i 变为 -i，因此 ${t("U^*=\\operatorname{diag}(1,-i)")}。`,
          `${t("U^*U=\\operatorname{diag}(1,(-i)i)=I")}。`,
          "第二个分量只增加相位 π/2，模长不变；这正是最简单的酉相位变换。",
        ],
      },
      quiz: [
        { question: "复内积为什么不能只用 xᵀy？", answer: "因为 xᵀx 可能不是非负实数，无法作为长度平方。" },
        { question: "酉矩阵的逆是什么？", answer: "U⁻¹=U*。" },
        { question: "实酉矩阵是什么矩阵？", answer: "当元素全为实数时，共轭转置就是转置，酉矩阵就是正交矩阵。" },
        { question: "Hermitian 矩阵的对角元具有什么性质？", answer: "对角元必须是实数，因为它等于自身的共轭。" },
      ],
      summary: [
        "复内积通过共轭保证长度平方为非负实数。",
        "转置、对称、正交在复数域中分别推广为共轭转置、Hermitian、酉。",
        `${t("U^*U=I")} 与 ${t("Q^TQ=I")} 具有完全平行的结构。`,
        "本节作为入口建立类比，不展开复谱定理与更高维量子应用。",
      ],
      textbook: { reference, items: ["复内积与酉空间", "共轭转置和 Hermitian 矩阵", "酉变换与实正交结构的类比"] },
    },
  ];

  registerAlgebraChapter({
    id: "ch9",
    icon: "9",
    title: "第九章 欧几里得空间",
    subtitle: "度量与正交",
    summary:
      "从内积出发建立长度、夹角与距离；借助标准正交基、正交变换、正交投影和实谱定理，把度量结构贯穿到最小二乘，并在最后推广到复酉空间。",
    overview: {
      title: "从内积到投影、谱分解与最小二乘",
      spine: "内积 → 标准正交基 → 等距同构 → 正交变换 → 正交分解 → 实谱定理 → 最小二乘 → 酉空间",
      panels: [
        { title: "度量从内积生长", text: "长度、夹角、正交和距离不是额外记忆点，而是同一内积结构的不同读数。" },
        { title: "正交简化坐标", text: "标准正交基让坐标等于投影系数，让分解、矩阵逆与长度计算同时变简单。" },
        { title: "投影连接结构与应用", text: "正交补给出最近点，实对称矩阵给出正交特征方向，最小二乘把二者落到数据拟合。" },
      ],
    },
    sections,
  });
})();
