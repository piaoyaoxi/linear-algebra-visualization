(() => {
  const t = (source) => texInline(source);
  const reference = "北大版《高等代数》第九章";
  const lab = (title) => ({ type: "slot", title });

  const sections = [
    {
      id: "inner-product-geometry",
      number: "§1",
      textbookSection: "定义与基本性质",
      title: "定义与基本性质",
      navTitle: "定义与基本性质",
      question: "线性空间里的“长度”和“垂直”从哪里来？换一个内积，它们会怎样变？",
      goal: "理解欧氏空间的定义与度量矩阵；会用内积计算长度、夹角，判断正交；知道换内积会改变正交关系。",
      tags: ["内积", "度量矩阵", "长度与夹角", "柯西–布涅柯夫斯基不等式"],
      intro:
        "线性空间只规定了加法和数乘，长度与角度要另外给出。欧氏空间是带有内积的实线性空间，内积对称、线性、正定；长度、夹角和正交都由它算出。换一个内积，单位圆变成椭圆，正交方向也跟着变。",
      concepts: [
        { label: "欧氏空间", text: `实线性空间 ${t("V")} 上取定一个对称、线性、正定的二元实函数 ${t("(\\alpha,\\beta)")}。` },
        { label: "度量矩阵", text: `${t("G=((\\varepsilon_i,\\varepsilon_j))")}，${t("(\\alpha,\\beta)=X^TGY")}。` },
      ],
      textbook: { reference, items: ["欧几里得空间的定义", "长度、夹角与正交", "度量矩阵"] },
      interactive: lab("度量矩阵 G 决定什么叫“垂直”"),
      lesson9: {
        blocks: [
          {
            title: "欧氏空间与度量矩阵",
            tex: String.raw`(\alpha,\beta)=X^TGY,\qquad G=\big((\varepsilon_i,\varepsilon_j)\big)`,
            text: `内积满足 ${t("(\\alpha,\\beta)=(\\beta,\\alpha)")}、对第一个变量线性、${t("(\\alpha,\\alpha)\\ge0")} 且只在 ${t("\\alpha=0")} 时为 0。取定基后，内积完全由度量矩阵 ${t("G")} 决定，${t("G")} 是正定矩阵；反过来，任一正定矩阵都给出一个内积。换基 ${t("(\\eta_1,\\dots,\\eta_n)=(\\varepsilon_1,\\dots,\\varepsilon_n)C")} 时，新的度量矩阵是 ${t("C^TGC")}，与 ${t("G")} 合同。`,
          },
          {
            title: "柯西–布涅柯夫斯基不等式",
            tex: String.raw`|(\alpha,\beta)|\le|\alpha|\,|\beta|`,
            text: `等号成立当且仅当 ${t(String.raw`\alpha`)}、${t(String.raw`\beta`)} 线性相关。它保证 ${t("\\cos\\langle\\alpha,\\beta\\rangle=\\frac{(\\alpha,\\beta)}{|\\alpha||\\beta|}")} 落在 ${t("[-1,1]")} 里，于是非零向量的夹角有意义。`,
          },
          {
            title: "正交与勾股定理",
            text: `${t("(\\alpha,\\beta)=0")} 时称 ${t(String.raw`\alpha`)} 与 ${t(String.raw`\beta`)} 正交，此时 ${t("|\\alpha+\\beta|^2=|\\alpha|^2+|\\beta|^2")}。零向量与每个向量正交。`,
          },
        ],
        pitfalls: [
          "默认“点积为 0 才叫正交”。换了内积，正交要用新的内积判断。",
          `只验证对称性和线性，漏掉正定性：要对一切 ${t(String.raw`\alpha\ne0`)} 都有 ${t(String.raw`(\alpha,\alpha)>0`)}。`,
          "给零向量算夹角。零向量与任何向量正交，但夹角只对非零向量定义。",
        ],
      },
      example: {
        title: "例题：在新内积下找正交的单位向量",
        question: `在 ${t("\\mathbb R^2")} 中取度量矩阵 ${t("G=\\begin{bmatrix}2&1\\\\1&1\\end{bmatrix}")}，即 ${t("(\\alpha,\\beta)=2a_1b_1+a_1b_2+a_2b_1+a_2b_2")}。求与 ${t("\\alpha=(1,0)")} 正交的单位向量。`,
        choices: [
          { correct: true, text: t("\\pm\\tfrac{1}{\\sqrt2}(1,-2)") },
          { text: t("\\pm(0,1)") },
          { text: t("\\pm\\tfrac{1}{\\sqrt5}(1,-2)") },
          { text: t("\\pm(1,-2)") },
        ],
        steps: [
          `${t("(\\alpha,\\beta)=(1,0)G\\beta=2b_1+b_2")}，正交要求 ${t("b_2=-2b_1")}，所以 ${t("\\beta=k(1,-2)")}。`,
          `${t("(\\beta,\\beta)=k^2\\,(1,-2)G(1,-2)^T=k^2\\cdot2")}。`,
          `令它等于 1，得 ${t("k=\\pm\\tfrac1{\\sqrt2}")}。`,
          `${t("(0,1)")} 与 ${t(String.raw`\alpha`)} 的普通点积为 0，但 ${t("(\\alpha,(0,1))=1")}；${t("\\tfrac1{\\sqrt5}")} 是按普通长度单位化的结果，在这个内积下长度为 ${t("\\sqrt{2/5}")}。`,
        ],
      },
      quiz: [
        {
          question: `${t("(\\alpha,\\beta)=a_1b_1-a_2b_2")} 能作为 ${t("\\mathbb R^2")} 上的内积吗？`,
          answer: `不能。它对称、线性，但 ${t(String.raw`\alpha=(0,1)`)} 时 ${t(String.raw`(\alpha,\alpha)=-1<0`)}，正定性不成立。`,
        },
        {
          question: `在某个欧氏空间里 ${t("|\\alpha|=|\\beta|=1")}，并且 ${t("(\\alpha,\\beta)=1")}。${t(String.raw`\alpha`)} 与 ${t(String.raw`\beta`)} 有什么关系？`,
          answer: `柯西–布涅柯夫斯基不等式取等号，${t(String.raw`\alpha`)}、${t(String.raw`\beta`)} 线性相关，${t(String.raw`\beta=k\alpha`)}；再由 ${t(String.raw`(\alpha,\beta)=k=1`)} 得 ${t(String.raw`\beta=\alpha`)}。`,
        },
        {
          question: `两组基下的度量矩阵 ${t("G")} 与 ${t("B")} 有什么关系？它们的行列式一定相等吗？`,
          answer: `${t("B=C^TGC")}，${t("C")} 是过渡矩阵，二者合同。${t(String.raw`\det B=(\det C)^2\cdot\det G`)}，一般不相等，但符号相同（都为正）。`,
        },
        {
          question: `实验里换成 ${t(String.raw`G=\operatorname{diag}(1,4)`)} 以后，${t("u=(1,1)")} 与 ${t("v=(1,-1)")} 在屏幕上看起来垂直。它们正交吗？`,
          answer: `不正交，${t("(u,v)=1-4=-3")}。屏幕上的直角是按普通点积看的；这个空间的正交要用 ${t("G")} 计算，与 ${t("u")} 正交的方向是 ${t("(4,-1)")}。`,
        },
      ],
      summary: [
        "欧氏空间 = 实线性空间 + 内积（对称、线性、正定）；长度、夹角、正交都由内积算出。",
        `取定基后 ${t(String.raw`(\alpha,\beta)=X^TGY`)}，度量矩阵 ${t("G")} 正定；换基时变成合同的 ${t("C^TGC")}。`,
        "换一个内积，单位圆变成椭圆，正交方向也随之改变。",
      ],
    },
    {
      id: "orthonormal-bases",
      number: "§2",
      textbookSection: "标准正交基",
      title: "标准正交基",
      navTitle: "标准正交基",
      question: "怎样把任意一组基改造成标准正交基？第三个向量要减掉什么？",
      goal: "理解标准正交基下坐标就是内积；掌握施密特正交化，看清每一步减去的投影；知道标准正交基之间的过渡矩阵是正交矩阵。",
      tags: ["标准正交基", "施密特正交化", "投影", "正交矩阵"],
      intro:
        "在标准正交基下，度量矩阵是单位矩阵，坐标就是内积。施密特正交化把任意一组基逐个改造成这样的基：每一步减去新向量在已造好的子空间上的投影，剩下的部分与前面全部正交，再单位化。",
      concepts: [
        { label: "标准正交基", text: `${t("(\\varepsilon_i,\\varepsilon_j)=\\delta_{ij}")}，此时 ${t("\\alpha=\\sum(\\alpha,\\varepsilon_i)\\varepsilon_i")}。` },
        { label: "施密特正交化", text: "逐个减去在前面向量所张子空间上的投影，再单位化。" },
      ],
      textbook: { reference, items: ["正交向量组", "标准正交基与坐标", "施密特正交化", "正交矩阵"] },
      interactive: lab("施密特正交化的第三步：减去平面上的投影"),
      lesson9: {
        blocks: [
          {
            title: "标准正交基下的坐标与内积",
            tex: String.raw`\alpha=\sum_{i=1}^n(\alpha,\varepsilon_i)\,\varepsilon_i,\qquad (\alpha,\beta)=x_1y_1+\cdots+x_ny_n`,
            text: "坐标不用解方程，直接取内积；内积也变成坐标的普通点积。正交向量组中的非零向量线性无关。",
          },
          {
            title: "施密特正交化",
            tex: String.raw`\beta_k=\alpha_k-\sum_{j<k}\frac{(\alpha_k,\beta_j)}{(\beta_j,\beta_j)}\beta_j,\qquad \eta_k=\frac{\beta_k}{|\beta_k|}`,
            text: `减去的和式是 ${t("\\alpha_k")} 在 ${t("\\operatorname{span}\\{\\beta_1,\\dots,\\beta_{k-1}\\}")} 上的投影；正因为 ${t("\\beta_j")} 两两正交，它才能逐项相加。每一步都有 ${t("\\operatorname{span}\\{\\beta_1,\\dots,\\beta_k\\}=\\operatorname{span}\\{\\alpha_1,\\dots,\\alpha_k\\}")}。`,
          },
          {
            title: "标准正交基之间的过渡矩阵",
            text: `若 ${t("\\varepsilon_1,\\dots,\\varepsilon_n")} 与 ${t("\\eta_1,\\dots,\\eta_n")} 都是标准正交基，${t("(\\eta_1,\\dots,\\eta_n)=(\\varepsilon_1,\\dots,\\varepsilon_n)T")}，则 ${t("T^TT=E")}，${t("T")} 是正交矩阵。`,
          },
        ],
        pitfalls: [
          `用原向量 ${t(String.raw`\alpha_1`)}、${t(String.raw`\alpha_2`)} 代替 ${t(String.raw`\beta_1`)}、${t(String.raw`\beta_2`)} 求投影。${t(String.raw`\alpha_1`)}、${t(String.raw`\alpha_2`)} 不正交时，逐项相加会多减。`,
          "忘记最后单位化，得到的只是正交基。",
          `${t(String.raw`\beta_k=0`)} 时继续往下算。这说明 ${t(String.raw`\alpha_k`)} 可由前面的向量线性表出，原向量组线性相关。`,
        ],
      },
      example: {
        title: "例题：第三个向量的正交化",
        question: `对 ${t("\\alpha_1=(1,1,1)")}，${t("\\alpha_2=(0,1,1)")}，${t("\\alpha_3=(0,0,1)")} 作施密特正交化。单位化之前的 ${t("\\beta_3")} 是多少？`,
        choices: [
          { correct: true, text: t("\\beta_3=(0,-\\tfrac12,\\tfrac12)") },
          { text: t("\\beta_3=(-\\tfrac13,-\\tfrac56,\\tfrac16)") },
          { text: t("\\beta_3=(-\\tfrac13,-\\tfrac13,\\tfrac23)") },
          { text: `${t("\\beta_3=(0,0,1)")}，它已经与前两个向量正交` },
        ],
        steps: [
          `${t("\\beta_1=(1,1,1)")}；${t("\\beta_2=\\alpha_2-\\tfrac23\\beta_1=(-\\tfrac23,\\tfrac13,\\tfrac13)")}。`,
          `${t("(\\alpha_3,\\beta_1)=1,\\ (\\beta_1,\\beta_1)=3")}；${t("(\\alpha_3,\\beta_2)=\\tfrac13,\\ (\\beta_2,\\beta_2)=\\tfrac23")}。`,
          `${t("\\beta_3=\\alpha_3-\\tfrac13\\beta_1-\\tfrac12\\beta_2=(0,-\\tfrac12,\\tfrac12)")}，检验 ${t("(\\beta_3,\\beta_1)=(\\beta_3,\\beta_2)=0")}。`,
          `${t("(-\\tfrac13,-\\tfrac56,\\tfrac16)")} 是直接用 ${t("\\alpha_1,\\alpha_2")} 求投影的结果，${t("(-\\tfrac13,-\\tfrac13,\\tfrac23)")} 只减了 ${t("\\beta_1")} 方向；单位化得 ${t("\\eta_3=\\tfrac1{\\sqrt2}(0,-1,1)")}。`,
        ],
      },
      quiz: [
        {
          question: `把 ${t(String.raw`\alpha_1`)} 换成 ${t(String.raw`2\alpha_1`)} 再做施密特正交化，最后的标准正交基会变吗？`,
          answer: `不变。${t(String.raw`\beta_1`)} 变成 2 倍，但投影 ${t(String.raw`\tfrac{(\alpha_k,\beta_1)}{(\beta_1,\beta_1)}\beta_1`)} 不变，单位化后的 ${t(String.raw`\eta_1`)} 也不变。`,
        },
        {
          question: `交换 ${t(String.raw`\alpha_1`)}、${t(String.raw`\alpha_2`)} 的顺序，${t(String.raw`\eta_1`)} 一般会变吗？${t(String.raw`\operatorname{span}\{\eta_1,\eta_2\}`)} 呢？`,
          answer: `${t(String.raw`\eta_1`)} 变成 ${t(String.raw`\alpha_2`)} 的方向，一般会变；${t(String.raw`\operatorname{span}\{\eta_1,\eta_2\}=\operatorname{span}\{\alpha_1,\alpha_2\}`)} 不变。`,
        },
        {
          question: `实验中“沿平面看”时，${t(String.raw`\beta_3`)} 与 ${t(String.raw`\operatorname{span}\{\beta_1,\beta_2\}`)} 是什么关系？为什么第三步不能分别减去在 ${t(String.raw`\alpha_1`)}、${t(String.raw`\alpha_2`)} 上的投影？`,
          answer: `${t(String.raw`\beta_3`)} 垂直于整个平面。${t(String.raw`\alpha_1`)}、${t(String.raw`\alpha_2`)} 不正交，两个投影有重叠部分，相加会多减，剩下的向量与 ${t(String.raw`\alpha_1`)} 不正交。`,
        },
      ],
      summary: [
        "标准正交基下，坐标就是内积，度量矩阵是单位矩阵。",
        `施密特正交化：第 ${t("k")} 步减去 ${t(String.raw`\alpha_k`)} 在前 ${t("k-1")} 个向量所张子空间上的投影，再单位化。`,
        `投影能逐项相加，靠的是 ${t(String.raw`\beta_1,\dots,\beta_{k-1}`)} 两两正交。`,
      ],
    },
    {
      id: "euclidean-isomorphism",
      number: "§3",
      textbookSection: "同构",
      title: "同构",
      navTitle: "同构",
      question: `两个欧氏空间什么时候可以看成同一个？为什么每个 ${t("n")} 维欧氏空间都同构于 ${t(String.raw`\mathbb R^n`)}？`,
      goal: `理解欧氏空间同构要保持内积；知道坐标映射保持内积当且仅当所取的基标准正交；掌握“同构 ${t(String.raw`\Leftrightarrow`)} 维数相同”。`,
      tags: ["同构", "坐标映射", "度量矩阵", "标准正交基"],
      intro:
        `欧氏空间的同构是保持加法、数乘与内积的双射。取一组基，把向量映成坐标，得到 ${t("V")} 到 ${t(String.raw`\mathbb R^n`)} 的线性同构；它是否保持内积，看这组基的度量矩阵是不是单位矩阵。`,
      concepts: [
        { label: "同构", text: `双射 ${t(String.raw`\sigma`)} 满足 ${t("\\sigma(\\alpha+\\beta)=\\sigma\\alpha+\\sigma\\beta")}，${t("\\sigma(k\\alpha)=k\\sigma\\alpha")}，${t("(\\sigma\\alpha,\\sigma\\beta)=(\\alpha,\\beta)")}。` },
      ],
      textbook: { reference, items: ["欧氏空间同构的定义", "同构与维数"] },
      interactive: lab("坐标映射把 V 的单位圆送到哪里"),
      lesson9: {
        blocks: [
          {
            title: "坐标映射何时保持内积",
            tex: String.raw`(\alpha,\beta)=X^TBY,\qquad (\sigma\alpha,\sigma\beta)=X^TY`,
            text: `${t("B")} 是基 ${t("f_1,\\dots,f_n")} 的度量矩阵。两式对一切 ${t("X")}、${t("Y")} 相等 ${t(String.raw`\Leftrightarrow`)} ${t("B=E")} ${t(String.raw`\Leftrightarrow`)} ${t("f_1,\\dots,f_n")} 是标准正交基。`,
          },
          {
            title: "同构 ⇔ 维数相同",
            text: `每个 ${t("n")} 维欧氏空间都有标准正交基，用它作坐标就得到到 ${t("\\mathbb R^n")} 的同构。同构满足反身性、对称性和传递性，所以两个有限维欧氏空间同构当且仅当维数相同。`,
          },
        ],
        pitfalls: [
          "只验证线性和双射。线性同构可以改变长度和夹角。",
          `用“看起来垂直”判断基是否标准正交。${t("V")} 里的长度和角度要用 ${t("V")} 自己的内积计算。`,
        ],
      },
      example: {
        title: "例题：选一组基，使坐标映射保持内积",
        question: `${t("V")} 是 ${t("\\mathbb R^2")} 配上度量矩阵 ${t("G=\\begin{bmatrix}2&1\\\\1&1\\end{bmatrix}")} 的欧氏空间。用哪一组基作坐标，得到的坐标映射 ${t("V\\to\\mathbb R^2")}（普通点积）是同构？`,
        choices: [
          { correct: true, text: t("f_1=(0,1),\\ f_2=(1,-1)") },
          { text: t("f_1=(1,0),\\ f_2=(0,1)") },
          { text: t("f_1=(1,0),\\ f_2=(-1,2)") },
          { text: t("f_1=(1,1),\\ f_2=(1,-1)") },
        ],
        steps: [
          `坐标映射保持内积 ${t(String.raw`\Leftrightarrow`)} 这组基的度量矩阵 ${t("B=C^TGC=E")}。`,
          `${t("f_1=(0,1),\\ f_2=(1,-1)")}：${t("(f_1,f_1)=1,\\ (f_2,f_2)=1,\\ (f_1,f_2)=0")}，${t("B=E")}。`,
          `标准基：${t("(\\varepsilon_1,\\varepsilon_1)=2")}；${t("f_1=(1,0),\\ f_2=(-1,2)")} 正交但 ${t("B=2E")}，长度都是 ${t("\\sqrt2")}；${t("f_1=(1,1),\\ f_2=(1,-1)")} 按点积垂直，但 ${t("(f_1,f_2)=1")}。`,
        ],
      },
      quiz: [
        {
          question: "线性同构一定保持长度吗？",
          answer: `不一定。${t(String.raw`\mathbb R^2`)} 上 ${t(String.raw`\sigma(x_1,x_2)=(2x_1,x_2)`)} 是线性同构，却把 ${t("(1,0)")} 变成长度为 2 的向量。`,
        },
        {
          question: `${t(String.raw`\sigma`)} 是线性双射并且保持每个向量的长度，它一定保持内积吗？`,
          answer: `一定。${t(String.raw`(\alpha,\beta)=\tfrac12(|\alpha+\beta|^2-|\alpha|^2-|\beta|^2)`)}，右边只用到长度。`,
        },
        {
          question: `${t(String.raw`\mathbb R^3`)}（普通点积）与次数小于 3 的实多项式空间（内积 ${t(String.raw`(f,g)=\int_0^1f(x)g(x)\,dx`)}）同构吗？`,
          answer: `同构：两者都是 3 维欧氏空间。对 ${t(String.raw`1,\ x,\ x^2`)} 做施密特正交化得到标准正交基，用它作坐标即可。`,
        },
        {
          question: `实验中 ${t("f_1")}、${t("f_2")} 按 ${t("G")} 正交，但长度都是 ${t(String.raw`\sqrt2`)}。${t(String.raw`\sigma`)} 把 ${t("V")} 的单位椭圆送到什么？`,
          answer: `${t("B=2E")}，像是 ${t(String.raw`\{y:\ 2y^Ty=1\}`)}，即半径 ${t(String.raw`1/\sqrt2`)} 的圆：形状对了，大小差一个倍数，${t(String.raw`\sigma`)} 仍不保持内积。`,
        },
      ],
      summary: [
        "欧氏空间的同构 = 线性双射 + 保持内积。",
        `坐标映射保持内积 ${t(String.raw`\Leftrightarrow`)} 所取基的度量矩阵为 ${t("E")} ${t(String.raw`\Leftrightarrow`)} 基标准正交。`,
        `有限维欧氏空间同构 ${t(String.raw`\Leftrightarrow`)} 维数相同；每个 ${t("n")} 维欧氏空间都同构于 ${t(String.raw`\mathbb R^n`)}。`,
      ],
    },
    {
      id: "orthogonal-transformations",
      number: "§4",
      textbookSection: "正交变换",
      title: "正交变换",
      navTitle: "正交变换",
      question: "一个线性变换怎样才算只“搬动”图形，不改变它的形状和大小？",
      goal: `理解正交变换的四个等价条件；会用 ${t("Q^TQ=E")} 精确判断；区分第一类（平面上是旋转）与第二类（平面上是反射），知道 ${t(String.raw`\det=\pm1`)} 只是必要条件。`,
      tags: ["正交变换", "正交矩阵", "旋转", "镜面反射"],
      intro:
        `正交变换保持内积，于是长度、夹角和距离都不变，单位圆仍是单位圆。在标准正交基下，它的矩阵 ${t("Q")} 满足 ${t("Q^TQ=E")}。行列式只能是 ${t(String.raw`\pm1`)}，但行列式为 ${t(String.raw`\pm1`)} 的矩阵不一定正交。`,
      concepts: [
        { label: "正交变换", text: `${t("(\\mathcal A\\alpha,\\mathcal A\\beta)=(\\alpha,\\beta)")}。` },
        { label: "正交矩阵", text: `${t("Q^TQ=E")}，即 ${t("Q^{-1}=Q^T")}。` },
      ],
      textbook: { reference, items: ["正交变换的定义与等价条件", "第一类与第二类正交变换", "镜面反射"] },
      interactive: lab("保持全部长度与夹角的线性变换"),
      lesson9: {
        blocks: [
          {
            title: "四个等价条件",
            tex: String.raw`(\mathcal A\alpha,\mathcal A\beta)=(\alpha,\beta)\iff|\mathcal A\alpha|=|\alpha|\iff Q^TQ=E`,
            text: `对欧氏空间 ${t("V")} 的线性变换 ${t(String.raw`\mathcal A`)}，下列条件等价：${t(String.raw`\mathcal A`)} 是正交变换；${t(String.raw`\mathcal A`)} 保持向量长度；${t(String.raw`\mathcal A`)} 把标准正交基变成标准正交基；${t(String.raw`\mathcal A`)} 在任一组标准正交基下的矩阵 ${t("Q")} 是正交矩阵。核心计算是 ${t("|Qx|^2=x^TQ^TQx=x^Tx")}。`,
          },
          {
            title: "第一类与第二类",
            text: `正交矩阵的行列式为 ${t(String.raw`\pm1`)}。${t("\\det Q=1")} 的称为第一类（旋转），${t("\\det Q=-1")} 的称为第二类。镜面反射 ${t("\\mathcal A\\xi=\\xi-2(\\eta,\\xi)\\eta")}（${t("|\\eta|=1")}）是第二类，矩阵为 ${t("E-2\\eta\\eta^T")}。`,
          },
        ],
        pitfalls: [
          `以为 ${t(String.raw`\det=\pm1`)} 就正交。${t(String.raw`\operatorname{diag}(2,\tfrac12)`)} 的行列式为 1，却把 ${t(String.raw`\varepsilon_1`)} 拉长一倍。`,
          "以为正交矩阵的列只要两两正交。每一列还必须是单位向量。",
          "在非标准正交基下读矩阵。正交变换在一般基下的矩阵不一定是正交矩阵。",
        ],
      },
      example: {
        title: "例题：判断正交矩阵及其类型",
        question: `判断 ${t("Q=\\tfrac13\\begin{bmatrix}2&-1&2\\\\2&2&-1\\\\-1&2&2\\end{bmatrix}")} 是否为正交矩阵；若是，它属于第几类？`,
        choices: [
          { correct: true, text: `是正交矩阵，${t(String.raw`\det Q=1`)}，第一类（旋转）` },
          { text: `是正交矩阵，${t(String.raw`\det Q=-1`)}，第二类` },
          { text: `不是正交矩阵，因为 ${t("Q")} 不对称` },
          { text: `不是正交矩阵，因为 ${t("Q")} 有负元素` },
        ],
        steps: [
          `每一列的长度平方都是 ${t("\\tfrac{4+4+1}{9}=1")}。`,
          `任意两列的内积为 0，例如 ${t("\\tfrac{(2)(-1)+(2)(2)+(-1)(2)}{9}=0")}，所以 ${t("Q^TQ=E")}。`,
          `${t("\\det\\begin{bmatrix}2&-1&2\\\\2&2&-1\\\\-1&2&2\\end{bmatrix}=27")}，${t("\\det Q=\\tfrac{27}{27}=1")}，第一类。正交矩阵不必对称，也可以有负元素。`,
        ],
      },
      quiz: [
        {
          question: `${t(String.raw`\mathcal A`)} 把标准正交基 ${t(String.raw`\varepsilon_1,\varepsilon_2`)} 变成 ${t(String.raw`\varepsilon_2,\varepsilon_1`)}。${t(String.raw`\mathcal A`)} 是正交变换吗？属于哪一类？`,
          answer: `是。矩阵 ${t(String.raw`\begin{bmatrix}0&1\\1&0\end{bmatrix}`)} 满足 ${t("Q^TQ=E")}，${t(String.raw`\det=-1`)}，第二类：关于直线 ${t("x_1=x_2")} 的反射。`,
        },
        {
          question: "两个第二类正交变换的乘积属于哪一类？",
          answer: `乘积仍是正交变换，行列式 ${t("(-1)(-1)=1")}，属于第一类。例如两次反射合成一个旋转。`,
        },
        {
          question: `实验中 ${t(String.raw`\operatorname{diag}(2,\tfrac12)`)} 把单位圆变成什么？为什么面积不变却不是正交变换？`,
          answer: `变成半轴为 2 和 ${t(String.raw`\tfrac12`)} 的椭圆，面积仍是 ${t(String.raw`\pi`)}；但 ${t(String.raw`\varepsilon_1`)} 的长度变成 2，长度没有保持。`,
        },
      ],
      summary: [
        `正交变换：保持内积 ${t(String.raw`\Leftrightarrow`)} 保持长度 ${t(String.raw`\Leftrightarrow`)} 标准正交基变成标准正交基 ${t(String.raw`\Leftrightarrow`)} 矩阵满足 ${t("Q^TQ=E")}。`,
        `${t(String.raw`\det Q=1`)} 为第一类（旋转），${t(String.raw`\det Q=-1`)} 为第二类（含一次反射）。`,
        `${t(String.raw`\det=\pm1`)} 只是必要条件。`,
      ],
    },
    {
      id: "orthogonal-subspaces",
      number: "§5",
      textbookSection: "子空间",
      title: "子空间与正交补",
      navTitle: "子空间",
      question: `与子空间 ${t("W")} 垂直的向量组成什么？为什么每个向量都能唯一地拆成 ${t("W")} 内与 ${t("W")} 外垂直的两部分？`,
      goal: `理解子空间的正交与正交补；会把正交补写成齐次方程组的解空间；掌握 ${t(String.raw`V=W\oplus W^\perp`)} 与内射影。`,
      tags: ["正交补", "正交分解", "内射影", "直和"],
      intro:
        `与子空间 ${t("W")} 中每个向量都正交的向量组成 ${t("W")} 的正交补 ${t(String.raw`W^\perp`)}。在 ${t(String.raw`\mathbb R^3`)} 中，平面的正交补是它的法线，直线的正交补是与它垂直的平面。${t(String.raw`W^\perp`)} 正是一个齐次线性方程组的解空间，并且 ${t(String.raw`V=W\oplus W^\perp`)}。`,
      concepts: [
        { label: "正交补", text: `${t("W^\\perp=\\{\\alpha\\in V:(\\alpha,\\beta)=0,\\ \\forall\\beta\\in W\\}")}。` },
        { label: "内射影", text: `${t("\\alpha=\\alpha_1+\\alpha_2")}，${t("\\alpha_1\\in W,\\ \\alpha_2\\in W^\\perp")}，${t("\\alpha_1")} 称为 ${t(String.raw`\alpha`)} 在 ${t("W")} 上的内射影。` },
      ],
      textbook: { reference, items: ["子空间的正交", "正交补", "正交分解与内射影"] },
      interactive: lab("W 与它的正交补 W⊥"),
      lesson9: {
        blocks: [
          {
            title: "正交补是一个解空间",
            tex: String.raw`W=\operatorname{span}\{w_1,\dots,w_s\}\ \Longrightarrow\ W^\perp=\{X:\ w_1^TX=0,\ \dots,\ w_s^TX=0\}`,
            text: `只要与 ${t("W")} 的一组生成元都正交，就与整个 ${t("W")} 正交。特别地，对实矩阵 ${t("A")}，齐次方程组 ${t("AX=0")} 的解空间是 ${t("A")} 的行向量所张子空间的正交补。`,
          },
          {
            title: "正交分解",
            tex: String.raw`V=W\oplus W^\perp,\qquad \dim W+\dim W^\perp=n,\qquad (W^\perp)^\perp=W`,
            text: `每个 ${t(String.raw`\alpha`)} 唯一地写成 ${t("\\alpha_1+\\alpha_2")}，${t("\\alpha_1\\in W")}，${t("\\alpha_2\\in W^\\perp")}。若 ${t("\\varepsilon_1,\\dots,\\varepsilon_m")} 是 ${t("W")} 的标准正交基，则 ${t("\\alpha_1=\\sum(\\alpha,\\varepsilon_i)\\varepsilon_i")}。两两正交的子空间之和一定是直和。`,
          },
        ],
        pitfalls: [
          `只验证与 ${t("W")} 中某一个向量正交。要与 ${t("W")} 的全部生成元正交。`,
          `把正交补与补集混淆：${t(String.raw`W^\perp`)} 是子空间，它与 ${t("W")} 只相交于零向量。`,
          `把正交补当成任意一个补子空间。当 ${t(String.raw`0<\dim W<n`)} 时，${t("W")} 的补子空间有无穷多个，正交补只有一个。`,
        ],
      },
      example: {
        title: "例题：求正交补的一组基",
        question: `在 ${t("\\mathbb R^4")} 中，${t("W=\\operatorname{span}\\{(1,1,0,0),(0,1,1,0)\\}")}。求 ${t("W^\\perp")} 的一组基。`,
        choices: [
          { correct: true, text: t("(1,-1,1,0),\\ (0,0,0,1)") },
          { text: t("(1,-1,1,0)") },
          { text: t("(1,-1,0,0),\\ (0,1,-1,0)") },
          { text: t("(0,0,1,0),\\ (0,0,0,1)") },
        ],
        steps: [
          `${t("X\\in W^\\perp")} ${t(String.raw`\Leftrightarrow`)} ${t("x_1+x_2=0")} 且 ${t("x_2+x_3=0")}。`,
          `自由未知量取 ${t("x_3,x_4")}：基础解系为 ${t("(1,-1,1,0),\\ (0,0,0,1)")}。`,
          `维数检验：${t("\\dim W+\\dim W^\\perp=2+2=4")}。${t("(1,-1,0,0)")} 与 ${t("(0,1,1,0)")} 的内积为 ${t("-1")}；${t("(0,0,1,0)")} 与 ${t("(0,1,1,0)")} 的内积为 1。`,
        ],
      },
      quiz: [
        {
          question: `${t(String.raw`\mathbb R^3`)} 中 ${t("W")} 是直线 ${t("x_1=x_2=x_3")}。${t(String.raw`W^\perp`)} 是什么？`,
          answer: `${t(String.raw`W=\operatorname{span}\{(1,1,1)\}`)}，${t(String.raw`W^\perp`)} 是平面 ${t("x_1+x_2+x_3=0")}。`,
        },
        {
          question: `${t(String.raw`\alpha`)} 在 ${t("W")} 上的内射影为 0，说明什么？内射影等于 ${t(String.raw`\alpha`)} 本身呢？`,
          answer: `前者说明 ${t(String.raw`\alpha\in W^\perp`)}；后者说明 ${t(String.raw`\alpha\in W`)}。`,
        },
        {
          question: `设 ${t("A")} 是 ${t(String.raw`m\times n`)} 实矩阵。为什么 ${t("AX=0")} 的解空间维数是 ${t(String.raw`n-\operatorname{rank}A`)}？用正交补来解释。`,
          answer: `解空间是 ${t("A")} 的行空间在 ${t(String.raw`\mathbb R^n`)} 中的正交补，行空间维数为 ${t(String.raw`\operatorname{rank}A`)}，两者维数之和为 ${t("n")}。`,
        },
        {
          question: `实验里把 ${t("w_1")} 拖到与 ${t("w_2")} 共线，${t(String.raw`W^\perp`)} 会怎样？`,
          answer: `${t("W")} 退化成一条直线，${t(String.raw`W^\perp`)} 变成一个平面，维数仍满足 ${t("1+2=3")}。`,
        },
      ],
      summary: [
        `${t(String.raw`W^\perp`)} 由与 ${t("W")} 的生成元都正交的向量组成，是一个齐次线性方程组的解空间。`,
        `${t(String.raw`V=W\oplus W^\perp`)}，${t(String.raw`\dim W+\dim W^\perp=n`)}；${t(String.raw`\alpha`)} 唯一地写成 ${t(String.raw`\alpha_1+\alpha_2`)}，${t(String.raw`\alpha_1`)} 是内射影。`,
        `§7 会用到：内射影 ${t(String.raw`\alpha_1`)} 是 ${t("W")} 中离 ${t(String.raw`\alpha`)} 最近的向量。`,
      ],
    },
    {
      id: "symmetric-canonical-form",
      number: "§6",
      textbookSection: "实对称矩阵的标准形",
      title: "实对称矩阵的标准形",
      navTitle: "实对称矩阵的标准形",
      question: "为什么实对称矩阵总能用正交矩阵化成对角形？这在图上是什么意思？",
      goal: `理解实对称矩阵特征值为实数、不同特征值的特征向量正交；会求正交矩阵 ${t("T")} 使 ${t("T^TAT")} 为对角形；看懂 ${t(String.raw`A=T\Lambda T^T`)} 的几何意义。`,
      tags: ["实对称矩阵", "对称变换", "正交矩阵", "主轴"],
      intro:
        `实对称矩阵的特征值都是实数，属于不同特征值的特征向量互相正交，于是可取标准正交的特征向量作正交矩阵 ${t("T")}，使 ${t("T^TAT")} 为对角矩阵。在图上，${t("A")} 把单位圆变成椭圆，主轴正是特征方向。`,
      concepts: [
        { label: "对称变换", text: `${t("(\\mathcal A\\alpha,\\beta)=(\\alpha,\\mathcal A\\beta)")}，在标准正交基下的矩阵是实对称矩阵。` },
        { label: "标准形", text: `存在正交矩阵 ${t("T")}，${t("T^TAT=T^{-1}AT=\\operatorname{diag}(\\lambda_1,\\dots,\\lambda_n)")}。` },
      ],
      textbook: { reference, items: ["实对称矩阵的特征值", "对称变换", "正交矩阵化实对称矩阵为对角形", "主轴问题"] },
      interactive: lab("A = TΛTᵀ：转过去、伸缩、转回来"),
      lesson9: {
        blocks: [
          {
            title: "不同特征值的特征向量正交",
            tex: String.raw`\lambda(\alpha,\beta)=(\mathcal A\alpha,\beta)=(\alpha,\mathcal A\beta)=\mu(\alpha,\beta)\ \Longrightarrow\ (\lambda-\mu)(\alpha,\beta)=0`,
            text: `${t("\\lambda\\ne\\mu")} 时 ${t("(\\alpha,\\beta)=0")}。证明只用到对称性 ${t("(\\mathcal A\\alpha,\\beta)=(\\alpha,\\mathcal A\\beta)")}；实对称矩阵的特征值都是实数，所以这些特征向量都可以取实的。`,
          },
          {
            title: "正交相似于对角矩阵",
            tex: String.raw`T^TAT=\operatorname{diag}(\lambda_1,\dots,\lambda_n),\qquad A=T\Lambda T^T`,
            text: `求法：解特征方程得全部特征值；对每个特征值求齐次方程组的基础解系，并在这个特征子空间内施密特正交化；全部单位化后作为 ${t("T")} 的列。`,
          },
        ],
        pitfalls: [
          "重特征值的特征子空间里，基础解系不一定正交，要先做施密特正交化。",
          "以为可对角化的矩阵都能用正交矩阵对角化。非对称矩阵的特征向量一般不正交。",
          `${t("T")} 的列忘记单位化，此时 ${t(String.raw`T^{-1}\ne T^T`)}。`,
        ],
      },
      example: {
        title: "例题：用正交矩阵对角化",
        question: `${t("A=\\begin{bmatrix}0&1&1\\\\1&0&1\\\\1&1&0\\end{bmatrix}")}。下列哪个 ${t("T")} 是正交矩阵并使 ${t("T^TAT")} 为对角形？`,
        choices: [
          { correct: true, text: `${t("T")} 的列为 ${t("\\tfrac1{\\sqrt3}(1,1,1),\\ \\tfrac1{\\sqrt2}(1,-1,0),\\ \\tfrac1{\\sqrt6}(1,1,-2)")}` },
          { text: `${t("T")} 的列为 ${t("\\tfrac1{\\sqrt3}(1,1,1),\\ \\tfrac1{\\sqrt2}(1,-1,0),\\ \\tfrac1{\\sqrt2}(1,0,-1)")}` },
          { text: `${t("T")} 的列为 ${t("(1,1,1),\\ (1,-1,0),\\ (1,1,-2)")}` },
          { text: `${t("T=E")}，因为 ${t("A")} 已经对称` },
        ],
        steps: [
          `${t("|\\lambda E-A|=(\\lambda-2)(\\lambda+1)^2")}，特征值 ${t(String.raw`2,\ -1,\ -1`)}。`,
          `属于 2 的特征向量 ${t("(1,1,1)")}；属于 ${t("-1")} 的特征子空间是平面 ${t("x_1+x_2+x_3=0")}，基础解系 ${t("(1,-1,0),(1,0,-1)")}。`,
          `这两个向量不正交，施密特正交化：${t("(1,0,-1)-\\tfrac12(1,-1,0)=\\tfrac12(1,1,-2)")}。`,
          `单位化后得到上面的三列，${t("T^TAT=\\operatorname{diag}(2,-1,-1)")}。若第三列取 ${t("\\tfrac1{\\sqrt2}(1,0,-1)")}，它与第二列的内积为 ${t(String.raw`\tfrac12`)}；不单位化时各列不是单位向量。`,
        ],
      },
      quiz: [
        {
          question: `3 阶实对称矩阵 ${t("A")} 的特征值为 ${t(String.raw`1,\ 1,\ 4`)}，属于 4 的特征向量是 ${t("(1,1,1)")}。属于 1 的特征子空间是什么？`,
          answer: `与 ${t("(1,1,1)")} 正交的全体向量，即平面 ${t("x_1+x_2+x_3=0")}。`,
        },
        {
          question: `${t(String.raw`A=\begin{bmatrix}2&1\\0&1\end{bmatrix}`)} 有两个不同特征值。能否找到正交矩阵 ${t("T")} 使 ${t("T^TAT")} 为对角形？`,
          answer: `不能。若 ${t(String.raw`T^TAT=\Lambda`)}，则 ${t(String.raw`A=T\Lambda T^T`)} 是对称矩阵，矛盾。它的特征向量 ${t("(1,0)")} 与 ${t("(1,-1)")} 夹 ${t(String.raw`45^\circ`)}。`,
        },
        {
          question: `实验中 ${t("A")} 把单位圆变成椭圆。椭圆的半轴长和方向由什么决定？`,
          answer: `方向是特征向量，半轴长是特征值的绝对值 ${t(String.raw`|\lambda_i|`)}；负特征值让对应方向反向。`,
        },
      ],
      summary: [
        "实对称矩阵：特征值为实数，不同特征值的特征向量正交。",
        `存在正交矩阵 ${t("T")} 使 ${t(String.raw`T^TAT=\operatorname{diag}(\lambda_1,\dots,\lambda_n)`)}；重特征值的特征子空间内要施密特正交化。`,
        `${t(String.raw`A=T\Lambda T^T`)}：转到特征方向、沿轴伸缩、再转回；单位圆的像是以特征方向为主轴的椭圆。`,
      ],
    },
    {
      id: "least-squares-distance",
      number: "§7",
      textbookSection: "向量到子空间的距离·最小二乘法",
      title: "向量到子空间的距离·最小二乘法",
      navTitle: "距离与最小二乘",
      question: `方程组 ${t("Ax=b")} 无解时，怎样找“最接近”的解？为什么它满足 ${t("A^TAx=A^Tb")}？`,
      goal: `理解向量到子空间的距离由垂线给出；把最小二乘解看成 ${t("b")} 在列空间上的内射影；会用正规方程拟合直线。`,
      tags: ["距离", "最小二乘法", "正规方程", "拟合直线"],
      intro:
        `${t("Ax")} 走遍 ${t("A")} 的列空间 ${t("W")}。方程组无解，说明 ${t("b")} 不在 ${t("W")} 里；离 ${t("b")} 最近的 ${t("Ax")} 是 ${t("b")} 在 ${t("W")} 上的内射影，误差 ${t("b-Ax")} 垂直于 ${t("A")} 的每一列，写出来就是 ${t("A^TAx=A^Tb")}。`,
      concepts: [
        { label: "距离", text: `${t("d(\\alpha,\\beta)=|\\alpha-\\beta|")}；${t(String.raw`\alpha`)} 到 ${t("W")} 的距离是 ${t("|\\alpha-\\alpha_1|")}，${t("\\alpha_1")} 为内射影。` },
        { label: "最小二乘解", text: `使 ${t("|b-Ax|^2")} 最小的 ${t("x")}，满足 ${t("A^TAx=A^Tb")}。` },
      ],
      textbook: { reference, items: ["向量到子空间的距离", "最小二乘法与正规方程"] },
      interactive: lab("离 b 最近的 Ax：投影与拟合直线是同一件事"),
      lesson9: {
        blocks: [
          {
            title: "垂线最短",
            tex: String.raw`|\alpha-\gamma|^2=|\alpha-\beta|^2+|\beta-\gamma|^2`,
            text: `设 ${t("\\beta,\\gamma\\in W")}，${t("\\alpha-\\beta\\perp W")}。由勾股定理，${t("W")} 中离 ${t(String.raw`\alpha`)} 最近的向量就是使 ${t("\\alpha-\\beta\\perp W")} 的 ${t(String.raw`\beta`)}，也就是 ${t(String.raw`\alpha`)} 在 ${t("W")} 上的内射影；其他点都多出 ${t("|\\beta-\\gamma|^2")}。`,
          },
          {
            title: "正规方程",
            tex: String.raw`A^T(b-A\hat x)=0\iff A^TA\hat x=A^Tb`,
            text: `误差与 ${t("A")} 的每一列正交，合起来就是正规方程。它总有解；${t("A")} 的列线性无关时 ${t("A^TA")} 可逆，${t("\\hat x=(A^TA)^{-1}A^Tb")} 唯一。`,
          },
          {
            title: "拟合直线",
            text: `用 ${t("y=C+Dt")} 拟合 ${t("(t_1,b_1),\\dots,(t_m,b_m)")}：${t("A")} 的两列是 ${t("(1,\\dots,1)")} 与 ${t("(t_1,\\dots,t_m)")}。误差与这两列正交，即 ${t("\\sum e_i=0")}，${t("\\sum t_ie_i=0")}。`,
          },
        ],
        pitfalls: [
          `以为最小二乘让每个残差都最小。最小的是残差平方和 ${t("|b-Ax|^2")}。`,
          `把 ${t("b")} 投影到 ${t("A")} 的行空间。${t("Ax")} 是列的组合，要投影到列空间。`,
          `以为正规方程可能无解。它总有解，${t("A")} 的列线性相关时解不唯一。`,
        ],
      },
      example: {
        title: "例题：最小二乘直线",
        question: `用直线 ${t("y=C+Dt")} 拟合三个数据点 ${t("(0,1),(1,2),(2,6)")}。最小二乘直线是哪一条？`,
        choices: [
          { correct: true, text: t("y=\\tfrac12+\\tfrac52t") },
          { text: t("y=1+\\tfrac52t") },
          { text: t("y=3") },
          { text: t("y=1+t") },
        ],
        steps: [
          `${t("A=\\begin{bmatrix}1&0\\\\1&1\\\\1&2\\end{bmatrix},\\ b=(1,2,6)")}；${t("A^TA=\\begin{bmatrix}3&3\\\\3&5\\end{bmatrix},\\ A^Tb=(9,14)")}。`,
          `解 ${t("3C+3D=9,\\ 3C+5D=14")}，得 ${t("D=\\tfrac52,\\ C=\\tfrac12")}。`,
          `误差 ${t("e=b-A\\hat x=(\\tfrac12,-1,\\tfrac12)")}：${t("\\sum e_i=0,\\ \\sum t_ie_i=0")}，与两列都正交。`,
          `${t("y=1+\\tfrac52t")} 穿过首尾两点，残差平方和为 ${t("\\tfrac94")}，大于最小值 ${t("|e|^2=\\tfrac32")}。`,
        ],
      },
      quiz: [
        {
          question: `${t("b")} 已经在 ${t("A")} 的列空间里，最小二乘解是什么？`,
          answer: `就是 ${t("Ax=b")} 的精确解，误差为 0。`,
        },
        {
          question: `${t("A")} 的列线性相关时，最小二乘解唯一吗？投影 ${t(String.raw`A\hat x`)} 呢？`,
          answer: `${t(String.raw`\hat x`)} 不唯一，相差 ${t("AX=0")} 的解；${t(String.raw`A\hat x`)} 唯一，它是 ${t("b")} 在列空间上的内射影。`,
        },
        {
          question: "拟合直线时，为什么残差之和一定为 0？",
          answer: `误差垂直于 ${t("A")} 的第一列 ${t(String.raw`(1,\dots,1)`)}，这正是 ${t(String.raw`\sum e_i=0`)}。`,
        },
        {
          question: `实验中点“沿 ${t("e")} 的方向看”，为什么 ${t("b")} 与 ${t("p")} 重合？`,
          answer: `${t("e=b-p")} 垂直于列空间平面，是平面的法向；沿法向看，${t("b")} 与它的垂足 ${t("p")} 落在同一点。`,
        },
      ],
      summary: [
        `${t(String.raw`\alpha`)} 到子空间 ${t("W")} 的距离 ${t(String.raw`=|\alpha-\alpha_1|`)}，${t(String.raw`\alpha_1`)} 是 ${t(String.raw`\alpha`)} 在 ${t("W")} 上的内射影。`,
        `最小二乘：${t(String.raw`b-A\hat x`)} 与 ${t("A")} 的每一列正交 ${t(String.raw`\Leftrightarrow`)} ${t(String.raw`A^TA\hat x=A^Tb`)}。`,
        `拟合直线就是把数据向量 ${t("b")} 投影到由 ${t(String.raw`(1,\dots,1)`)} 和 ${t(String.raw`(t_1,\dots,t_m)`)} 张成的平面上。`,
      ],
    },
    {
      id: "unitary-spaces",
      number: "＊§8",
      textbookSection: "酉空间介绍",
      title: "酉空间介绍",
      navTitle: "酉空间介绍",
      question: "复数域上怎样定义内积，才能让长度仍然是非负实数？",
      goal: "了解酉空间的内积及其与欧氏空间的差别；认识酉矩阵和埃尔米特矩阵。",
      tags: ["酉空间", "共轭", "酉矩阵", "埃尔米特矩阵"],
      intro:
        `复向量若照搬 ${t(String.raw`\sum a_ib_i`)}，${t("(1,i)")} 与自身的乘积是 ${t("1+i^2=0")}。把第二个向量取共轭，${t(String.raw`(\alpha,\beta)=\sum a_i\bar b_i`)}，自身内积就成了 ${t(String.raw`\sum|a_i|^2\ge0`)}。带这种内积的复线性空间叫酉空间。`,
      concepts: [
        { label: "酉空间内积", text: `${t("\\mathbb C^n")} 中 ${t("(\\alpha,\\beta)=a_1\\bar b_1+\\cdots+a_n\\bar b_n")}。` },
        { label: "酉矩阵", text: `${t("\\bar A^TA=E")}。` },
      ],
      textbook: { reference, items: ["酉空间的内积", "酉矩阵与埃尔米特矩阵"] },
      lesson9: {
        figure: "conjugate",
        blocks: [
          {
            title: "酉空间的内积",
            tex: String.raw`(\beta,\alpha)=\overline{(\alpha,\beta)},\qquad (k\alpha,\beta)=k(\alpha,\beta),\qquad (\alpha,k\beta)=\bar k(\alpha,\beta)`,
            text: `内积对第一个变量线性，交换次序要取共轭，并且 ${t("(\\alpha,\\alpha)")} 是非负实数，只在 ${t("\\alpha=0")} 时为 0。长度、正交、标准正交基与施密特正交化都照样定义。`,
          },
          {
            title: "酉矩阵与埃尔米特矩阵",
            text: `转置换成共轭转置：标准正交基之间的过渡矩阵满足 ${t("\\bar U^TU=E")}，称为酉矩阵；${t("\\bar A^T=A")} 的矩阵称为埃尔米特矩阵。埃尔米特矩阵的特征值都是实数，并且存在酉矩阵 ${t("U")} 使 ${t("U^{-1}AU")} 为实对角矩阵。实数矩阵中，它们分别就是正交矩阵与实对称矩阵。`,
          },
        ],
        pitfalls: [
          `忘记共轭：${t(String.raw`\sum a_ib_i`)} 会让非零向量 ${t("(1,i)")} 的“长度平方”为 0。`,
          `从第二个位置提出常数时忘记取共轭：${t(String.raw`(\alpha,k\beta)=\bar k(\alpha,\beta)`)}。`,
          `把复对称矩阵（${t("A^T=A")}）当成埃尔米特矩阵。${t(String.raw`\begin{bmatrix}1&i\\i&1\end{bmatrix}`)} 对称，特征值却是 ${t(String.raw`1\pm i`)}。`,
        ],
      },
      example: {
        title: "例题：判断酉矩阵",
        question: `${t("U=\\tfrac1{\\sqrt2}\\begin{bmatrix}1&i\\\\i&1\\end{bmatrix}")} 是酉矩阵吗？`,
        choices: [
          { correct: true, text: `是，${t("\\bar U^TU=E")}` },
          { text: `不是，因为 ${t("U^TU\\ne E")}` },
          { text: "不是，因为元素不全是实数" },
          { text: `是，因为 ${t("U")} 是埃尔米特矩阵` },
        ],
        steps: [
          `${t("\\bar U^T=\\tfrac1{\\sqrt2}\\begin{bmatrix}1&-i\\\\-i&1\\end{bmatrix}")}。`,
          `${t("\\bar U^TU=\\tfrac12\\begin{bmatrix}1-i^2&i-i\\\\-i+i&-i^2+1\\end{bmatrix}=E")}，所以 ${t("U")} 是酉矩阵。`,
          `${t("U^TU=\\begin{bmatrix}0&i\\\\i&0\\end{bmatrix}")} 不是判别酉矩阵的式子；${t("\\bar U^T\\ne U")}，${t("U")} 也不是埃尔米特矩阵。`,
        ],
      },
      quiz: [
        {
          question: `若不取共轭，${t(String.raw`\alpha=(1,i)`)} 的“长度平方”是多少？取共轭后呢？`,
          answer: `不取共轭得 ${t("1+i^2=0")}，非零向量长度为 0；取共轭得 ${t(String.raw`1\cdot1+i\cdot\bar i=2`)}，${t(String.raw`|\alpha|=\sqrt2`)}。`,
        },
        {
          question: "为什么埃尔米特矩阵的特征值是实数？",
          answer: `设 ${t(String.raw`A\alpha=\lambda\alpha`)}，${t(String.raw`\alpha\ne0`)}。${t(String.raw`\lambda(\alpha,\alpha)=(A\alpha,\alpha)=(\alpha,A\alpha)=\bar\lambda(\alpha,\alpha)`)}，而 ${t(String.raw`(\alpha,\alpha)>0`)}，所以 ${t(String.raw`\lambda=\bar\lambda`)}。`,
        },
        {
          question: "实数矩阵看作复矩阵时，酉矩阵、埃尔米特矩阵分别是什么？",
          answer: "分别是正交矩阵和实对称矩阵。",
        },
      ],
      summary: [
        `酉空间内积 ${t(String.raw`(\alpha,\beta)=\sum a_i\bar b_i`)}：对第一个变量线性，交换次序取共轭，${t(String.raw`(\alpha,\alpha)\ge0`)}。`,
        `转置换成共轭转置：酉矩阵满足 ${t(String.raw`\bar U^TU=E`)}，埃尔米特矩阵满足 ${t(String.raw`\bar A^T=A`)}。`,
        "埃尔米特矩阵特征值为实数，可用酉矩阵对角化，这是实对称矩阵结论的复数版本。",
      ],
    },
  ];

  registerAlgebraChapter({
    id: "ch9",
    icon: "9",
    title: "第九章 欧几里得空间",
    subtitle: "内积、正交与投影",
    summary:
      "在实线性空间上加一个内积，就有了长度、夹角与正交。本章先用标准正交基把内积变成普通点积，再讨论保持内积的同构与正交变换；正交补与内射影给出垂线，实对称矩阵在正交坐标下化成对角形，最小二乘法把无解方程组变成投影问题，最后简介复数域上的酉空间。",
    overview: {
      title: "从内积到投影",
      spine: "内积 → 标准正交基 → 同构与正交变换 → 正交补 → 实对称矩阵 → 最小二乘 → 酉空间",
      panels: [
        { title: "度量", text: "内积决定长度、夹角与正交；度量矩阵在基下记录它。" },
        { title: "正交坐标", text: "标准正交基让内积变成普通点积，保持内积的变换由正交矩阵表示。" },
        { title: "投影", text: "正交补与内射影给出最近点，最小二乘与谱分解都从这里出发。" },
      ],
    },
    sections,
  });
})();
