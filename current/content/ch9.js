(() => {
  const t = (source) => texInline(source);
  const D = (source) => texDisplay(source);
  const references = {
    innerProduct: "Axler 6.A · Friedberg 6.1 · Hoffman–Kunze 8.1",
    orthonormal: "Axler 6.B · Friedberg 6.2 · Strang 4.4",
    isomorphism: "Hoffman–Kunze 8.4 · Axler 7.C",
    orthogonal: "Hoffman–Kunze 8.4 · Axler 7.C · Friedberg 6.5",
    subspaces: "Axler 6.C · Hoffman–Kunze 8.2 · Strang 4.2",
    spectral: "Friedberg 6.4、6.6 · Axler 7.A–7.B · Strang 6.4",
    leastSquares: "Strang 4.3 · Friedberg 6.3 · Lay 6.5",
    unitary: "Strang 9.2 · Friedberg 6.5 · Hoffman–Kunze 8.4",
  };

  const sections = [
    {
      id: "inner-product-geometry",
      number: "§1",
      textbookSection: "定义与基本性质",
      title: "定义与基本性质",
      navTitle: "定义与基本性质",
      question: "同一个线性空间能否拥有不同的长度、夹角与正交关系？",
      goal: "理解内积是一项额外选择，并沿正交分解、Cauchy–Schwarz 与三角不等式建立欧氏几何。",
      tags: ["内积公理", "范数", "正交分解", "Cauchy-Schwarz"],
      intro: "向量加法和数乘只给出线性结构；选定内积后，空间才有长度、距离、夹角与正交。同一向量空间可以采用不同内积，因而也可以拥有不同的几何。",
      concepts: [
        { label: "内积", text: `实线性空间上的内积满足双线性、对称与正定，记作 ${t("\\langle x,y\\rangle")}。` },
        { label: "范数与距离", text: `${t("\\lVert x\\rVert=\\sqrt{\\langle x,x\\rangle}")}，${t("d(x,y)=\\lVert x-y\\rVert")}。` },
        { label: "正交", text: `${t("x\\perp y")} 当且仅当 ${t("\\langle x,y\\rangle=0")}。` },
        { label: "夹角", text: `非零向量满足 ${t("\\cos\\theta=\\frac{\\langle x,y\\rangle}{\\lVert x\\rVert\\lVert y\\rVert}")}。` },
      ],
      formalBlocks: [
        {
          eyebrow: "定义与选择",
          title: "内积公理把代数运算变成可靠的测量",
          body:
            `${D("\\langle ax+by,z\\rangle=a\\langle x,z\\rangle+b\\langle y,z\\rangle")}` +
            `${t("\\langle x,y\\rangle=\\langle y,x\\rangle")}，且 ${t("\\langle x,x\\rangle>0")} 对 ${t("x\\ne0")} 成立。` +
            `例如 ${t("\\langle x,y\\rangle_G=4x_1y_1+x_2y_2")} 也是 ${t("\\mathbb R^2")} 上的内积；它把第一个方向的长度放大，因此单位圆会变成椭圆。`,
        },
        {
          eyebrow: "证明主线",
          title: "正交分解推出 Cauchy–Schwarz",
          body:
            `当 ${t("y\\ne0")} 时，把 ${t("x")} 分解为 ${t("y")} 方向和垂直方向：` +
            `${D("x=\\frac{\\langle x,y\\rangle}{\\lVert y\\rVert^2}y+r,\\qquad r\\perp y")}` +
            `勾股恒等式给出 ${t("\\lVert x\\rVert^2=\\frac{|\\langle x,y\\rangle|^2}{\\lVert y\\rVert^2}+\\lVert r\\rVert^2")}，舍去非负项 ${t("\\lVert r\\rVert^2")} 即得 Cauchy–Schwarz。`,
        },
        {
          eyebrow: "结论与边界",
          title: "不等式保证夹角与距离的定义成立",
          body:
            `${D("|\\langle x,y\\rangle|\\le\\lVert x\\rVert\\,\\lVert y\\rVert,\\qquad \\lVert x+y\\rVert\\le\\lVert x\\rVert+\\lVert y\\rVert")}` +
            `第一条保证夹角公式的余弦落在 ${t("[-1,1]")} 内，第二条保证距离满足三角不等式。Cauchy–Schwarz 取等当且仅当 ${t("x,y")} 线性相关。零向量与每个向量都正交，但它没有方向，因此夹角不定义。`,
        },
      ],
      interactive: {
        type: "ch9",
        lab: "inner-product",
        title: "内积与有向投影",
        description: "移动橙色向量，观察投影怎样从同向经过零变为反向。",
        task: "先只判断锐角、直角或钝角，再显示投影和内积公式。",
        prompts: [
          "把夹角调到 90°，确认投影和内积同时为 0。",
          "切换到钝角，说明内积的负号来自哪一段有向投影。",
          "选择零向量，区分“正交成立”和“夹角有定义”这两件事。",
        ],
      },
      example: {
        title: "例题：更换内积会改变正交关系",
        question: `在 ${t("\\mathbb R^2")} 上定义 ${t("\\langle x,y\\rangle_G=2x_1y_1+x_2y_2")}。设 ${t("x=(1,1)^T")}，${t("y=(1,-2)^T")}，判断它们的关系并求距离。`,
        steps: [
          `${t("\\langle x,y\\rangle_G=2\\cdot1\\cdot1+1\\cdot(-2)=0")}，所以在这个内积下 ${t("x\\perp y")}。`,
          `标准点积给出 ${t("x^Ty=-1")}；同一对向量在两种内积下具有不同的夹角。`,
          `${t("\\lVert x\\rVert_G=\\sqrt3")}，${t("\\lVert y\\rVert_G=\\sqrt6")}。`,
          `${t("d_G(x,y)=\\lVert x-y\\rVert_G=\\lVert(0,3)^T\\rVert_G=3")}。`,
        ],
      },
      quiz: [
        { question: `${t("[x,y]=x_1y_1-x_2y_2")} 能否作为 ${t("\\mathbb R^2")} 上的内积？`, answer: `不能，因为 ${t("[(0,1),(0,1)]=-1")} 违反正定性。` },
        { question: "同一线性空间上的两种内积会给出相同的正交关系吗？", answer: "不一定；内积改变后，范数、夹角、距离和正交关系都可能改变。" },
        { question: "Cauchy–Schwarz 的等号条件是什么？", answer: "两个向量线性相关，零向量情形也包含在内。" },
        { question: "零向量为什么不能与非零向量定义夹角？", answer: "夹角公式的分母含零向量的范数，方向也无法确定。" },
        { question: "三角不等式在这里从哪里来？", answer: "展开范数平方后，用 Cauchy–Schwarz 控制交叉项。" },
      ],
      summary: [
        "内积是一项额外的几何选择，同一线性空间可以有多种内积。",
        "正交分解与勾股恒等式是 Cauchy–Schwarz 的证明核心。",
        "对非零向量，内积的正、零、负分别对应锐角、直角与钝角。",
      ],
      textbook: {
        reference: references.innerProduct,
        items: ["内积公理与多种内积", "正交分解证明 Cauchy–Schwarz", "范数、距离、夹角及其边界"],
      },
    },
    {
      id: "orthonormal-bases",
      number: "§2",
      textbookSection: "标准正交基",
      title: "标准正交基",
      navTitle: "标准正交基",
      question: "为什么标准正交基能把解坐标方程变成几次独立的内积计算？",
      goal: "掌握标准正交坐标、Parseval 等式与 Gram–Schmidt，并看清每一步保持张成空间的原因。",
      tags: ["标准正交基", "Gram-Schmidt", "Parseval", "QR"],
      intro: "一般基会把不同方向耦合在一起；标准正交基把它们完全分开。向量在每个基方向上的坐标就是一个投影系数，长度平方则是这些坐标平方之和。",
      concepts: [
        { label: "标准正交组", text: `${t("\\langle e_i,e_j\\rangle=\\delta_{ij}")}；其中每个向量长度为 1，且不同向量彼此正交。` },
        { label: "坐标读取", text: `若 ${t("e_1,\\ldots,e_n")} 是基，则 ${t("x=\\sum_i\\langle x,e_i\\rangle e_i")}。` },
        { label: "Parseval", text: `${t("\\lVert x\\rVert^2=\\sum_i|\\langle x,e_i\\rangle|^2")}。` },
        { label: "正交化", text: "每次减去所有已确定方向上的投影，再将非零余量单位化。" },
      ],
      formalBlocks: [
        {
          eyebrow: "坐标解耦",
          title: "内积直接读出每个坐标",
          body:
            `若 ${t("x=\\sum_i c_ie_i")}，两端与 ${t("e_j")} 取内积便得 ${t("c_j=\\langle x,e_j\\rangle")}。` +
            `同一个计算还给出 Parseval 等式。特别地，任何正交非零向量组都线性无关，因为对线性关系逐个取内积即可消去其他项。`,
        },
        {
          eyebrow: "算法不变量",
          title: "Gram–Schmidt 每一步只删去旧方向",
          body:
            `${D("u_k=v_k-\\sum_{j<k}\\langle v_k,e_j\\rangle e_j,\\qquad e_k=\\frac{u_k}{\\lVert u_k\\rVert}")}` +
            `构造保证 ${t("u_k\\perp e_1,\\ldots,e_{k-1}")}；同时 ${t("v_k-u_k")} 已在旧张成空间中，因此对每个 ${t("k")} 都有 ${t("\\operatorname{span}(v_1,\\ldots,v_k)=\\operatorname{span}(e_1,\\ldots,e_k)")}。`,
        },
        {
          eyebrow: "存在与计算",
          title: "线性无关保证余量非零，并产生 QR 分解",
          body:
            `输入向量线性无关时，每个 ${t("u_k")} 都非零；算法因此证明有限维内积空间存在标准正交基，也能把已有标准正交组扩充成基。把输入列组成 ${t("A")}、输出列组成 ${t("Q")}，便得到 ${t("A=QR")}；${t("R=Q^TA")} 为上三角矩阵。`,
        },
      ],
      interactive: {
        type: "ch9",
        lab: "gram-schmidt",
        title: "Gram–Schmidt 步进动画",
        description: "按原向量、投影、减法、单位化四步观察正交化。",
        task: "每一步只增加一个对象，先看被减掉的平行部分，再看留下的垂直余量。",
        prompts: [
          "走到第三步，确认余量与第一方向垂直。",
          "切换接近相关，观察很短的余量为什么仍代表一个新方向。",
          "切换线性相关，说明余量为 0 与张成空间维数之间的关系。",
        ],
      },
      example: {
        title: "例题：把正交化迁移到多项式空间",
        question: `在 ${t("P_2(\\mathbb R)")} 上取内积 ${t("\\langle p,q\\rangle=\\int_{-1}^{1}p(x)q(x)\\,dx")}。对 ${t("1,x,x^2")} 作 Gram–Schmidt。`,
        steps: [
          `${t("\\lVert1\\rVert^2=2")}，故 ${t("e_0=1/\\sqrt2")}；又因奇函数在对称区间积分为 0，${t("1\\perp x")}。`,
          `${t("\\lVert x\\rVert^2=2/3")}，所以 ${t("e_1=\\sqrt{3/2}x")}。`,
          `${t("x^2")} 在 ${t("e_1")} 方向的投影为 0，在 ${t("e_0")} 方向的投影为 ${t("1/3")}，故 ${t("u_2=x^2-1/3")}。`,
          `${t("\\lVert u_2\\rVert^2=8/45")}，最终 ${t("e_2=\\frac{\\sqrt{10}}4(3x^2-1)")}。`,
        ],
      },
      quiz: [
        { question: "为什么正交非零向量组一定线性无关？", answer: "对线性关系与每个向量取内积，只留下一个系数乘该向量的范数平方。" },
        { question: "Gram–Schmidt 为什么不改变前 k 个向量的张成空间？", answer: "新余量与原向量之差只是旧方向的线性组合，因此新旧两组可以互相线性表示。" },
        { question: "某一步余量为 0 说明什么？", answer: "当前输入向量已经属于此前向量的张成空间，输入组在此处出现线性相关。" },
        { question: "交换输入顺序会保持什么，又可能改变什么？", answer: "最终张成空间保持不变，得到的标准正交基和 R 通常会改变。" },
        { question: `${t("A=QR")} 中 ${t("Q^TQ")} 等于什么？`, answer: `${t("I")}；Q 的列是标准正交组。` },
      ],
      summary: [
        "标准正交基把坐标、投影与长度计算解耦。",
        "Gram–Schmidt 的不变量是每一阶段的张成空间。",
        "线性无关保证余量非零，矩阵形式就是 A=QR。",
      ],
      textbook: {
        reference: references.orthonormal,
        items: ["标准正交坐标与 Parseval", "逐阶段张成空间不变", "存在、扩充与 QR 分解"],
      },
    },
    {
      id: "euclidean-isomorphism",
      number: "§3",
      textbookSection: "同构",
      title: "同构",
      navTitle: "同构",
      question: "线性同构已经可逆，为什么还不足以说明两个空间具有相同的几何？",
      goal: "区分线性同构与欧氏同构，并用标准正交基、坐标映射和度量矩阵建立等距判别。",
      tags: ["欧氏同构", "等距", "标准正交坐标", "Gram 矩阵"],
      intro: "线性同构保存线性组合和维数，却可以拉伸或剪切。欧氏同构进一步保存内积，所以长度、距离、夹角与正交都会一起保留。",
      concepts: [
        { label: "线性同构", text: "双射线性映射，保存线性结构。" },
        { label: "欧氏同构", text: `${t("\\langle Tx,Ty\\rangle_W=\\langle x,y\\rangle_V")} 对所有 ${t("x,y")} 成立。` },
        { label: "基判别", text: "同维有限维空间中，把某个标准正交基映成标准正交基就足够。" },
        { label: "度量矩阵", text: `斜基 ${t("B")} 的坐标内积由 ${t("G=B^TB")} 计算。` },
      ],
      formalBlocks: [
        {
          eyebrow: "结构层次",
          title: "可逆只保护线性结构，内积保持才保护几何",
          body:
            `剪切矩阵可以逆，却会改变长度与夹角。欧氏同构要求对所有向量对保持内积；令 ${t("y=x")} 立即得到范数保持，再对 ${t("x-y")} 使用范数便得到距离保持，夹角与正交也随之保持。`,
        },
        {
          eyebrow: "有限维判别",
          title: "一个标准正交基决定整个等距映射",
          body:
            `设 ${t("\\dim V=\\dim W=n")}。线性映射 ${t("T:V\\to W")} 保持内积，当且仅当它把 V 的某个标准正交基映成 W 的标准正交基。因此，同一数域上的两个有限维内积空间存在欧氏同构，当且仅当它们维数相同。`,
        },
        {
          eyebrow: "坐标桥梁",
          title: "标准正交坐标是等距坐标，斜基坐标需要 Gram 矩阵",
          body:
            `${D("\\Phi(x)=(\\langle e_1,x\\rangle,\\ldots,\\langle e_n,x\\rangle)^T")}` +
            `标准正交基下 ${t("\\Phi")} 保持内积。若斜基矩阵为 ${t("B")} 且 ${t("x=B\\xi,y=B\\eta")}，则 ${t("\\langle x,y\\rangle=\\xi^TB^TB\\eta")}；坐标仍唯一，但普通坐标点积不再代表原空间的几何。`,
        },
      ],
      interactive: {
        type: "ch9",
        lab: "isometry",
        title: "坐标是否等距",
        description: "并排比较标准正交基坐标和斜基坐标。",
        task: "先比较普通坐标长度，再用 G=BᵀB 恢复斜基中的真实长度。",
        prompts: [
          "选择旋转后的标准正交基，确认坐标变了而长度不变。",
          "切换斜基，观察普通坐标长度为何失真。",
          "查看 G=BᵀB，说明度量矩阵怎样补回原空间的几何。",
        ],
      },
      example: {
        title: "例题：构造一个非平凡的欧氏同构",
        question: `令 V 是 ${t("\\mathbb R^2")} 配以内积 ${t("\\langle x,y\\rangle_G=4x_1y_1+x_2y_2")}，W 取标准内积。判断 ${t("T(x_1,x_2)=(2x_1,x_2)")} 是否为欧氏同构。`,
        steps: [
          `T 的矩阵为 ${t("P=\\operatorname{diag}(2,1)")}，它可逆。`,
          `${t("\\langle Tx,Ty\\rangle_W=(2x_1)(2y_1)+x_2y_2=4x_1y_1+x_2y_2")}。`,
          `因此 ${t("\\langle Tx,Ty\\rangle_W=\\langle x,y\\rangle_G")} 对所有 ${t("x,y")} 成立，T 是欧氏同构。`,
          `V 中的标准正交基 ${t("(1/2,0)^T,(0,1)^T")} 被 T 映成 W 的标准基。`,
        ],
      },
      quiz: [
        { question: "给定一个线性同构，维数相同能否保证它保持内积？", answer: "不能；维数相同只保证存在某个欧氏同构，给定映射仍需检查内积保持。" },
        { question: "为什么只检查某个标准正交基的像就足够？", answer: "任意向量都由该基线性表示，内积可由坐标乘积展开。" },
        { question: "斜基坐标是否仍然唯一？", answer: "是；它仍是合法的线性坐标，只是普通坐标点积通常不等于原内积。" },
        { question: `${t("x=B\\xi")} 时，坐标中的正确长度平方是什么？`, answer: `${t("\\xi^T(B^TB)\\xi")}。` },
        { question: "欧氏同构会保持哪些几何量？", answer: "范数、距离、夹角和正交关系。" },
      ],
      summary: [
        "线性同构保存代数结构，欧氏同构同时保存内积几何。",
        "同维有限维内积空间可通过标准正交基建立欧氏同构。",
        "斜基坐标中的几何由 Gram 矩阵 G=BᵀB 记录。",
      ],
      textbook: {
        reference: references.isomorphism,
        items: ["内积空间同构的等价判别", "同维空间的标准正交基对应", "斜基坐标与 Gram 矩阵"],
      },
    },
    {
      id: "orthogonal-transformations",
      number: "§4",
      textbookSection: "正交变换",
      title: "正交变换",
      navTitle: "正交变换",
      question: "怎样判断一个线性变换只旋转或反射图形，没有拉伸与剪切？",
      goal: "连接范数保持、内积保持、标准正交列和 QᵀQ=I，并理解二维旋转与反射的分类。",
      tags: ["正交变换", "正交矩阵", "旋转", "反射"],
      intro: "正交变换把空间刚性地绕原点旋转或反射。单位球、任意两向量的内积以及标准基的像都保持不变，这些几何描述最终汇成同一个矩阵等式。",
      concepts: [
        { label: "范数保持", text: `${t("\\lVert Qx\\rVert=\\lVert x\\rVert")} 对所有 ${t("x")} 成立。` },
        { label: "正交矩阵", text: `${t("Q^TQ=I")}，等价于 Q 的列构成标准正交基。` },
        { label: "逆矩阵", text: `${t("Q^{-1}=Q^T")}。` },
        { label: "定向", text: `${t("\\det Q=1")} 保持定向，${t("\\det Q=-1")} 翻转定向。` },
      ],
      formalBlocks: [
        {
          eyebrow: "等价判别",
          title: "保持范数、保持内积与 QᵀQ=I 是同一条件",
          body:
            `对实内积空间的线性变换，以下条件等价：保持所有向量的范数；保持所有向量对的内积；把某个标准正交基映成标准正交基；其标准正交坐标矩阵满足 ${t("Q^TQ=I")}。从 ${t("\\lVert Qx\\rVert^2=x^TQ^TQx")} 可直接看见矩阵条件。`,
        },
        {
          eyebrow: "运算结构",
          title: "正交变换的逆与复合仍保持几何",
          body:
            `${t("Q^TQ=I")} 给出 ${t("Q^{-1}=Q^T")}。若 ${t("Q_1,Q_2")} 都正交，则 ${t("(Q_1Q_2)^T(Q_1Q_2)=I")}；连续实施两次刚性线性变换仍是正交变换。转置、逆与复合共同构成稳定的运算体系。`,
        },
        {
          eyebrow: "二维分类",
          title: "二维中 det 区分旋转与反射",
          body:
            `二维正交矩阵在 ${t("\\det Q=1")} 时是绕原点的旋转，在 ${t("\\det Q=-1")} 时是关于某条过原点直线的反射。高维中 ${t("\\det Q")} 只记录定向是否翻转；仅有 ${t("\\det Q=\\pm1")} 也不足以推出矩阵正交。`,
        },
      ],
      interactive: {
        type: "ch9",
        lab: "orthogonal-transform",
        title: "单位圆形变检验",
        description: "对同一网格依次施加旋转、镜像、伸缩和剪切。",
        task: "先看单位圆是否变形，再查看 QᵀQ 证书。",
        prompts: [
          "比较旋转和镜像：两者都保持圆，定向有何不同？",
          "选择伸缩，找出哪一列不再是单位向量。",
          "选择剪切，比较两列内积并指出直角如何改变。",
        ],
      },
      example: {
        title: "例题：用三种证据识别旋转",
        question: `判断 ${t("Q=\\frac15\\begin{bmatrix}3&-4\\\\4&3\\end{bmatrix}")} 是否正交，并求其逆与二维类型。`,
        steps: [
          `两列的长度均为 1，列内积为 ${t("(3)(-4)/25+(4)(3)/25=0")}。`,
          `因此 ${t("Q^TQ=I")}，Q 保持所有内积与长度。`,
          `${t("Q^{-1}=Q^T=\\frac15\\begin{bmatrix}3&4\\\\-4&3\\end{bmatrix}")}。`,
          `${t("\\det Q=1")}，所以在二维中 Q 是旋转，旋转角满足 ${t("\\cos\\theta=3/5,\\sin\\theta=4/5")}。`,
        ],
      },
      quiz: [
        { question: `${t("\\det A=1")} 能否单独保证 A 正交？`, answer: "不能；面积保持并不保证每个长度和夹角都保持，剪切就是反例。" },
        { question: "线性变换保持所有范数，为什么也保持内积？", answer: "实内积可由范数通过极化恒等式恢复，线性变换又保持和与差。" },
        { question: "正交矩阵的逆怎样求？", answer: "直接取转置。" },
        { question: "两个正交矩阵的乘积是否正交？", answer: "是，乘积仍满足 QᵀQ=I。" },
        { question: "二维中 det=-1 表示什么？", answer: "表示关于某条过原点直线的反射，并翻转定向。" },
      ],
      summary: [
        "范数、内积、单位球和标准正交基提供等价的正交变换判据。",
        "正交矩阵满足 Q⁻¹=Qᵀ，并在复合与取逆下保持封闭。",
        "二维中 det=1 对应旋转，det=-1 对应反射。",
      ],
      textbook: {
        reference: references.orthogonal,
        items: ["等距变换的等价条件", "正交矩阵的列、逆与复合", "二维旋转和反射分类"],
      },
    },
    {
      id: "orthogonal-subspaces",
      number: "§5",
      textbookSection: "子空间",
      title: "子空间与正交投影",
      navTitle: "子空间",
      question: "为什么垂足一定是子空间中离给定向量最近的唯一点？",
      goal: "从正交补与直和分解定义正交投影，并用算子性质和勾股恒等式证明唯一最近点。",
      tags: ["正交补", "直和", "正交投影", "最佳逼近"],
      intro: "有限维子空间 W 把整个空间分成两个互相垂直的方向：W 内的可解释部分和 W⊥ 中的剩余部分。正交投影取出前一部分，垂直余量则给出到 W 的最短距离。",
      concepts: [
        { label: "正交补", text: `${t("W^\\perp=\\{x:\\langle x,w\\rangle=0,\\forall w\\in W\\}")}。` },
        { label: "正交直和", text: `${t("V=W\\oplus W^\\perp")}；每个向量有唯一正交分解。` },
        { label: "正交投影", text: `${t("x=P_Wx+(x-P_Wx)")}，两项分别属于 ${t("W")} 与 ${t("W^\\perp")}。` },
        { label: "最近点", text: `${t("P_Wx")} 是 W 中离 x 最近的唯一向量。` },
      ],
      formalBlocks: [
        {
          eyebrow: "空间分解",
          title: "W 与 W⊥ 恰好拼成整个有限维空间",
          body:
            `${D("V=W\\oplus W^\\perp,\\qquad \\dim W+\\dim W^\\perp=\\dim V")}` +
            `交集只有零向量，因为同时属于 ${t("W")} 与 ${t("W^\\perp")} 的向量必须与自身正交。有限维时还有 ${t("(W^\\perp)^\\perp=W")}。`,
        },
        {
          eyebrow: "算子刻画",
          title: "正交投影同时记录像空间与垂直余量",
          body:
            `${t("P_W^2=P_W")}，${t("\\operatorname{im}P_W=W")}，${t("\\ker P_W=W^\\perp")}，并满足 ${t("\\langle P_Wx,y\\rangle=\\langle x,P_Wy\\rangle")}。` +
            `幂等性单独只说明“投影到某个补空间”；核等于 ${t("W^\\perp")} 或上述内积对称性才保证它是正交投影。`,
        },
        {
          eyebrow: "最佳逼近",
          title: "勾股恒等式把几何垂足变成唯一最小值",
          body:
            `令 ${t("p=P_Wx")}。对任意 ${t("w\\in W")}，${t("x-w=(x-p)+(p-w)")} 的两项正交，所以` +
            `${D("\\lVert x-w\\rVert^2=\\lVert x-p\\rVert^2+\\lVert p-w\\rVert^2")}` +
            `第二项只在 ${t("w=p")} 时为 0；因此 p 唯一最近，距离为 ${t("\\lVert x-P_Wx\\rVert")}。`,
        },
      ],
      interactive: {
        type: "ch9",
        lab: "projection",
        title: "垂足与距离最低点",
        description: "左侧看几何分解，右侧看所有候选点的距离平方曲线。",
        task: "移动子空间中的候选点，确认垂足与曲线最低点是同一个参数。",
        prompts: [
          "把候选点移到垂足，观察多出的距离平方归零。",
          "旋转子空间，确认最近点结论不依赖坐标轴方向。",
          "让 x 落在 W⊥ 上，判断投影、余量与距离分别是什么。",
        ],
      },
      example: {
        title: "例题：投影到三维平面",
        question: `在标准内积下，求 ${t("x=(2,0,0)^T")} 到平面 ${t("W=\\{(a,b,c)^T:a+b-c=0\\}")} 的投影与距离。`,
        steps: [
          `平面的法向量可取 ${t("n=(1,1,-1)^T")}，所以 ${t("W^\\perp=\\operatorname{span}\\{n\\}")}。`,
          `垂直余量为 ${t("\\operatorname{proj}_n x=\\frac{x^Tn}{n^Tn}n=\\frac23(1,1,-1)^T")}。`,
          `${t("P_Wx=x-\\operatorname{proj}_n x=(4/3,-2/3,2/3)^T")}，代入可验其属于 W。`,
          `距离为 ${t("\\lVert x-P_Wx\\rVert=\\lVert\\frac23n\\rVert=2/\\sqrt3")}。`,
        ],
      },
      quiz: [
        { question: `${t("W\\cap W^\\perp")} 为什么只有零向量？`, answer: "交集中的向量与 W 中所有向量正交，特别与自身正交，因此范数平方为 0。" },
        { question: `${t("P^2=P")} 能否单独保证 P 是正交投影？`, answer: "不能；斜投影也幂等，还需核为像空间的正交补或 P 具有内积对称性。" },
        { question: `${t("x\\in W^\\perp")} 时 ${t("P_Wx")} 是什么？`, answer: "零向量，x 本身就是全部垂直余量。" },
        { question: "最近点为什么唯一？", answer: "勾股分解中的附加项 ||p-w||² 只有在 w=p 时为 0。" },
        { question: `${t("I-P_W")} 投影到哪里？`, answer: `${t("W^\\perp")}；它取出正交分解中的垂直余量。` },
      ],
      summary: [
        "有限维空间具有唯一正交直和分解 V=W⊕W⊥。",
        "正交投影由像 W、核 W⊥ 和内积对称性共同刻画。",
        "最近点定理是正交分解与勾股恒等式的直接结果。",
      ],
      textbook: {
        reference: references.subspaces,
        items: ["正交补与直和分解", "正交投影的算子刻画", "唯一最佳逼近定理"],
      },
    },
    {
      id: "symmetric-canonical-form",
      number: "§6",
      textbookSection: "实对称矩阵的标准形",
      title: "实对称矩阵的标准形",
      navTitle: "实对称矩阵的标准形",
      question: "对称性为什么足以保证存在一整组彼此正交的特征方向？",
      goal: "从伴随与自伴性出发建立实谱定理的证明链，并理解正交相似对角化、谱投影与主轴动作。",
      tags: ["伴随", "自伴算子", "实谱定理", "正交对角化"],
      intro: "矩阵对称表达了一个与坐标无关的关系：把算子移到内积另一侧，结果不变。这个关系迫使特征值为实数，并让一个特征方向的正交补保持不变，从而可以逐维构造标准正交特征基。",
      concepts: [
        { label: "伴随", text: `${t("\\langle Tx,y\\rangle=\\langle x,T^*y\\rangle")}。` },
        { label: "自伴", text: `${t("T=T^*")}；在标准正交坐标中对应 ${t("A^T=A")}。` },
        { label: "实谱定理", text: `${t("A^T=A\\iff A=Q\\Lambda Q^T")}，其中 Q 正交、Λ 为实对角矩阵。` },
        { label: "谱投影", text: `${t("A=\\sum_i\\lambda_iq_iq_i^T")}，每项只作用于一个特征方向。` },
      ],
      formalBlocks: [
        {
          eyebrow: "结构入口",
          title: "对称矩阵就是标准正交坐标中的自伴算子",
          body:
            `${D("A^T=A\\quad\\Longleftrightarrow\\quad \\langle Ax,y\\rangle=\\langle x,Ay\\rangle")}` +
            `伴随算子的定义不依赖基；只有在标准正交基下，伴随的矩阵才直接等于转置。若 ${t("Ax=\\lambda x")}，自伴关系会把 ${t("\\lambda")} 与其共轭联系起来，迫使特征值为实数。`,
        },
        {
          eyebrow: "证明骨架",
          title: "实特征值与不变正交补支持维数归纳",
          body:
            `把实对称矩阵暂时放到复空间，特征多项式必有根；若 ${t("Az=\\lambda z")}，则 ${t("\\lambda\\lVert z\\rVert^2=\\langle z,Az\\rangle=\\langle Az,z\\rangle=\\bar\\lambda\\lVert z\\rVert^2")}，故 ${t("\\lambda\\in\\mathbb R")}。把 ${t("z=u+iv")} 代入实矩阵方程可知 ${t("Au=\\lambda u,Av=\\lambda v")}，至少一个非零实部或虚部给出实特征向量 ${t("q_1")}。若 ${t("y\\perp q_1")}，则 ${t("\\langle Ay,q_1\\rangle=\\langle y,Aq_1\\rangle=0")}；所以 ${t("q_1^\\perp")} 在 A 下不变，可在其中继续归纳。`,
        },
        {
          eyebrow: "分解与辨析",
          title: "Qᵀ、Λ、Q 依次换坐标、独立伸缩、返回原空间",
          body:
            `${D("x\\xrightarrow{Q^T}\\text{特征坐标}\\xrightarrow{\\Lambda}\\text{逐方向伸缩}\\xrightarrow{Q}Ax")}` +
            `重特征空间内可用 Gram–Schmidt 选择标准正交基，因此重根不会破坏结论。这里的 ${t("Q^TAQ=\\Lambda")} 是正交相似对角化，保持特征值与欧氏长度；第五章用一般可逆矩阵做合同变换，目标是分类二次型，两者的允许变换与保留量不同。`,
        },
      ],
      interactive: {
        type: "ch9",
        lab: "spectral",
        title: "正交谱分解三步动画",
        description: "同一个圆先转入特征坐标，再独立伸缩，最后旋回原空间。",
        task: "按 Qᵀ → Λ → Q 的顺序观察三幅连续场景，并把每一步与公式对应。",
        prompts: [
          "在第一步确认特征方向已经对准坐标轴。",
          "切换一正一负的特征值，结合 det(A) 判断定向是否翻转。",
          "切换非对称对照，指出证明链在哪个等式处失效。",
        ],
      },
      example: {
        title: "例题：完成正交对角化与谱分解",
        question: `对 ${t("A=\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}")} 作正交对角化，并写成谱投影之和。`,
        steps: [
          `特征多项式为 ${t("(2-\\lambda)^2-1")}，故特征值为 ${t("\\lambda_1=3,\\lambda_2=1")}。`,
          `可取单位特征向量 ${t("q_1=\\frac1{\\sqrt2}(1,1)^T")}、${t("q_2=\\frac1{\\sqrt2}(1,-1)^T")}；它们因特征值不同而正交。`,
          `令 ${t("Q=[q_1\\ q_2]")}，则 ${t("Q^TAQ=\\operatorname{diag}(3,1)")}，等价于 ${t("A=Q\\Lambda Q^T")}。`,
          `谱投影形式为 ${t("A=3q_1q_1^T+q_2q_2^T")}；两个秩一投影分别抽取两条主轴分量。`,
        ],
      },
      quiz: [
        { question: "证明谱定理时，只证明不同特征值的特征向量正交是否足够？", answer: "不够；还需证明存在实特征值，并用不变正交补或 Schur 定理得到完整特征基。" },
        { question: `${t("Aq=\\lambda q")} 且 ${t("y\\perp q")} 时，为什么 ${t("Ay\\perp q")}？`, answer: `${t("\\langle Ay,q\\rangle=\\langle y,Aq\\rangle=\\lambda\\langle y,q\\rangle=0")}。` },
        { question: "重特征值会破坏正交对角化吗？", answer: "不会；在对应特征空间内部选取标准正交基即可。" },
        { question: `${t("\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}")} 保持长度，为什么不能在实数域正交对角化？`, answer: "它不是对称矩阵，并且没有实特征值；保持长度并不能替代自伴性。" },
        { question: "正交相似对角化与一般合同标准化的核心区别是什么？", answer: "前者限制为正交换基并保持特征值与欧氏几何；后者允许一般可逆合同，主要分类二次型。" },
      ],
      summary: [
        "实对称矩阵是标准正交坐标中的自伴算子。",
        "实特征值、正交补不变与维数归纳构成实谱定理的证明主线。",
        "A=QΛQᵀ 同时给出标准正交特征基、主轴动作和谱投影分解。",
      ],
      textbook: {
        reference: references.spectral,
        items: ["伴随与自伴算子", "实谱定理的完整证明链", "正交相似、谱投影与二次型辨析"],
      },
    },
    {
      id: "least-squares-distance",
      number: "§7",
      textbookSection: "向量到子空间的距离·最小二乘法",
      title: "距离与最小二乘",
      navTitle: "距离与最小二乘",
      question: "方程 Ax=b 没有精确解时，哪个对象仍然唯一，怎样把它计算出来？",
      goal: "从列空间投影推出最小二乘、正规方程和残差平衡，并区分最佳预测与系数的唯一性。",
      tags: ["最小二乘", "列空间", "残差", "正规方程", "秩亏"],
      intro: "所有 Ax 组成 A 的列空间。数据向量 b 落在列空间之外时，精确方程无解；正交投影仍给出唯一最近的预测向量，残差则落在列空间的正交补中。",
      concepts: [
        { label: "最佳预测", text: `${t("p=A\\hat x=P_{\\operatorname{Col}(A)}b")}。` },
        { label: "残差", text: `${t("r=b-A\\hat x\\in\\operatorname{Col}(A)^\\perp")}。` },
        { label: "正规方程", text: `${t("A^TA\\hat x=A^Tb")}。` },
        { label: "唯一性", text: "最佳预测 p 总唯一；系数 x̂ 在 A 的列线性无关时唯一。" },
      ],
      formalBlocks: [
        {
          eyebrow: "几何证明",
          title: "最小二乘就是把 b 投影到列空间",
          body:
            `令 ${t("p=A\\hat x")} 为投影、${t("r=b-p")} 为垂直余量。对任意 x，${t("b-Ax=r+(p-Ax)")} 的两项正交，因此` +
            `${D("\\lVert b-Ax\\rVert^2=\\lVert r\\rVert^2+\\lVert A\\hat x-Ax\\rVert^2")}` +
            `右侧第二项在 ${t("Ax=p")} 时为 0，这直接证明 p 是唯一最佳预测。`,
        },
        {
          eyebrow: "代数与微积分",
          title: "残差正交条件变成正规方程",
          body:
            `${t("r\\perp\\operatorname{Col}(A)")} 等价于残差与 A 的每一列内积为 0，即 ${t("A^T(b-A\\hat x)=0")}；展开得到 ${t("A^TA\\hat x=A^Tb")}。` +
            `从微积分看，目标函数 ${t("E(x)=\\lVert Ax-b\\rVert^2")} 的梯度是 ${t("2A^T(Ax-b)")}，驻点给出同一组方程。`,
        },
        {
          eyebrow: "唯一性边界",
          title: "预测唯一不等于系数唯一",
          body:
            `若 A 的列线性无关，则 ${t("A^TA")} 可逆，${t("\\hat x=(A^TA)^{-1}A^Tb")} 唯一。若列相关，正规方程仍有解，所有最小二乘系数形成 ${t("\\hat x+\\ker A")}；它们给出同一个预测 ${t("A\\hat x")}。伪逆 ${t("A^+")} 可进一步选出其中范数最小的系数。`,
        },
      ],
      interactive: {
        type: "ch9",
        lab: "least-squares",
        title: "残差怎样把直线推向最佳位置",
        description: "拖动候选直线，观察残差棒、SSE 与正规方程同步变化。",
        task: "先手动降低 SSE，再播放到最小二乘解，并用两条残差平衡解释停点。",
        prompts: [
          "只改截距，观察残差总和怎样变化。",
          "再改斜率，观察加权残差和怎样控制直线倾斜。",
          "播放最佳解，确认 Σrᵢ=0 与 Σtᵢrᵢ=0 同时成立。",
        ],
      },
      example: {
        title: "例题：用三种视角核对最小二乘直线",
        question: `用直线 ${t("c+dt")} 拟合三点 ${t("(0,1),(1,2),(2,2)")}。求 ${t("\\hat x=(c,d)^T")} 并检查残差正交。`,
        steps: [
          `${t("A=\\begin{bmatrix}1&0\\\\1&1\\\\1&2\\end{bmatrix}")}，${t("b=(1,2,2)^T")}，故 ${t("A^TA=\\begin{bmatrix}3&3\\\\3&5\\end{bmatrix}")}、${t("A^Tb=(5,6)^T")}。`,
          `解正规方程得 ${t("\\hat x=(7/6,1/2)^T")}；最佳直线为 ${t("c+dt=7/6+t/2")}。`,
          `预测 ${t("p=(7/6,5/3,13/6)^T")}，残差 ${t("r=b-p=(-1/6,1/3,-1/6)^T")}。`,
          `${t("\\sum r_i=0")} 且 ${t("\\sum t_ir_i=0")}，即 ${t("A^Tr=0")}；同时 ${t("\\mathrm{SSE}=\\lVert r\\rVert^2=1/6")}。`,
        ],
      },
      quiz: [
        { question: "最小二乘残差垂直于哪里？", answer: "A 的列空间，也就是 A 的每一列。" },
        { question: "为什么不能把正规方程理解成简单地给 Ax=b 两边乘 Aᵀ？", answer: "关键理由是最佳残差与列空间正交；Aᵀr=0 才是正规方程的来源。" },
        { question: `${t("A^TA")} 何时可逆？`, answer: "当且仅当 A 的列线性无关。" },
        { question: "A 的列相关时，最佳预测与系数分别是否唯一？", answer: "最佳预测仍唯一；系数一般不唯一，彼此相差一个核空间向量。" },
        { question: "回归中 Σrᵢ=0 来自哪一列？", answer: "来自全 1 的常数列；残差与该列正交。" },
      ],
      summary: [
        "最小二乘把无解方程转化为列空间中的唯一最近点。",
        "几何投影、残差正交、正规方程与梯度为零表达同一条件。",
        "预测向量总唯一，系数的唯一性取决于 A 的列是否线性无关。",
      ],
      textbook: {
        reference: references.leastSquares,
        items: ["列空间投影与勾股证明", "几何、代数、微积分三种视角", "秩亏时预测与系数的唯一性"],
      },
    },
    {
      id: "unitary-spaces",
      number: "＊§8",
      textbookSection: "酉空间介绍",
      title: "酉空间介绍",
      navTitle: "酉空间介绍",
      question: "把实数推广到复数后，共轭怎样修复长度，酉矩阵又怎样保持完整的复内积？",
      goal: "明确复内积约定，理解共轭转置、酉变换与 Hermitian 谱定理，并把一维相位旋转推广到 Cⁿ。",
      tags: ["复内积", "共轭转置", "酉矩阵", "Hermitian"],
      intro: "复数同时具有大小与相位。共轭会抵消自身相位，使向量与自身的内积成为非负实数；酉变换则在多个复坐标之间混合信息，同时保持内积与范数。",
      concepts: [
        { label: "本节约定", text: `${t("\\langle z,w\\rangle=z^*w=\\sum_j\\bar z_jw_j")}，第一变量共轭线性、第二变量线性。` },
        { label: "共轭转置", text: `${t("A^*=\\bar A^T")}，并满足 ${t("(AB)^*=B^*A^*")}。` },
        { label: "酉矩阵", text: `${t("U^*U=I")}，等价于 U 的列构成复标准正交基。` },
        { label: "Hermitian", text: `${t("H^*=H")}；它是实对称矩阵的复数推广。` },
      ],
      formalBlocks: [
        {
          eyebrow: "共轭的必要性",
          title: "普通转置会让非零向量得到零“长度”",
          body:
            `取 ${t("z=(1,i)^T")}，普通乘积给出 ${t("z^Tz=1+i^2=0")}；它无法定义正定长度。共轭转置给出 ${t("z^*z=1+|i|^2=2")}。一般地，${t("z^*z=\\sum_j|z_j|^2\\ge0")} 且只在 ${t("z=0")} 时为 0。`,
        },
        {
          eyebrow: "酉变换",
          title: "U*U=I 同时保持复内积、范数与标准正交基",
          body:
            `${D("\\langle Uz,Uw\\rangle=z^*U^*Uw=z^*w=\\langle z,w\\rangle")}` +
            `因此 ${t("U^{-1}=U^*")}。在 ${t("\\mathbb C")} 中，酉变换是乘以 ${t("e^{i\\phi}")} 的相位旋转；在 ${t("\\mathbb C^n")} 中，酉矩阵还可以把多个坐标混合，只要各列仍标准正交。`,
        },
        {
          eyebrow: "谱定理延伸",
          title: "Hermitian 矩阵由酉特征坐标对角化",
          body:
            `若 ${t("H^*=H")}，则所有特征值为实数，并存在酉矩阵 U 使 ${t("H=U\\Lambda U^*")}。这与实对称情形 ${t("A=Q\\Lambda Q^T")} 完全对应；实数域中共轭消失，酉矩阵退化为正交矩阵。当前相位实验展示一维入口，矩阵例题负责呈现高维混合。`,
        },
      ],
      interactive: {
        type: "ch9",
        lab: "unitary",
        title: "复平面上的共轭与等模旋转",
        description: "观察 z、共轭 z̄ 与 Uz 在复平面中的位置。",
        task: "先看共轭怎样关于实轴镜像，再比较纯相位旋转和非酉缩放。",
        prompts: [
          "改变 z 的相位，观察 z̄ 为什么具有相反的辐角。",
          "选择纯相位，确认 Uz 始终留在同一等模圆上。",
          "加入缩放，指出 U*U=I 与模长保持怎样同时失效。",
        ],
      },
      example: {
        title: "例题：从标准正交列判断二维酉矩阵",
        question: `判断 ${t("U=\\frac1{\\sqrt2}\\begin{bmatrix}1&i\\\\i&1\\end{bmatrix}")} 是否酉，并说明它比一维相位旋转多做了什么。`,
        steps: [
          `两列为 ${t("q_1=\\frac1{\\sqrt2}(1,i)^T")}、${t("q_2=\\frac1{\\sqrt2}(i,1)^T")}，都有范数 1。`,
          `${t("q_1^*q_2=\\frac12(i-i)=0")}，所以两列构成 ${t("\\mathbb C^2")} 的标准正交基。`,
          `因此 ${t("U^*U=I")} 且 ${t("U^{-1}=U^*=\\frac1{\\sqrt2}\\begin{bmatrix}1&-i\\\\-i&1\\end{bmatrix}")}。`,
          `U 的输出坐标同时依赖两个输入坐标；它保持总范数与内积，同时完成坐标混合。`,
        ],
      },
      quiz: [
        { question: "本节的复内积对哪一个变量共轭线性？", answer: "第一变量；本节采用 ⟨z,w⟩=z*w 的约定。" },
        { question: `${t("z=(1,i)^T")} 时，为什么 ${t("z^Tz")} 不能代表长度平方？`, answer: `${t("z^Tz=0")} 但 z 非零，违反正定性；${t("z^*z=2")} 才是正确长度平方。` },
        { question: "怎样从矩阵的列判断它是否酉？", answer: "检查各列范数为 1 且两两复内积为 0。" },
        { question: "所有酉变换是否都只是乘一个纯相位？", answer: "只有一维如此；高维酉矩阵可以在保持内积的同时混合多个坐标。" },
        { question: "Hermitian 矩阵的特征值和特征基有什么性质？", answer: "特征值为实数，并存在由标准正交特征向量组成的基，可用酉矩阵对角化。" },
      ],
      summary: [
        "共轭保证复内积正定，并明确区分大小与相位。",
        "酉矩阵的标准正交列、U*U=I、内积保持和 U⁻¹=U* 彼此等价。",
        "Hermitian 谱定理把实对称矩阵的正交对角化推广到复空间。",
      ],
      textbook: {
        reference: references.unitary,
        items: ["复内积约定与共轭的必要性", "酉矩阵的等价判别", "Hermitian 谱定理入口"],
      },
    },
  ];

  registerAlgebraChapter({
    id: "ch9",
    icon: "9",
    title: "第九章 欧几里得空间",
    subtitle: "度量、正交与最佳逼近",
    summary: "从内积的选择出发，经标准正交坐标、保持几何的变换与正交投影，建立实谱定理和最小二乘，并把结构推广到复酉空间。",
    overview: {
      title: "一条从测量到最佳逼近的定理主线",
      spine: "内积 → 正交分解 → 标准正交基 → 等距与正交变换 → 正交投影 → 自伴谱定理 → 最小二乘 → 酉空间",
      panels: [
        { title: "选择几何", text: "内积决定怎样测量长度、角度、正交与距离。" },
        { title: "解耦坐标", text: "标准正交基把投影系数直接变成坐标，并让变换判据变得透明。" },
        { title: "统一应用", text: "正交投影把最近点、谱分解和最小二乘连接成同一套结构。" },
      ],
    },
    sections,
  });
})();
