registerAlgebraChapter({
  id: "ch10",
  icon: "10",
  title: "第十章 双线性函数与辛空间",
  subtitle: "对偶、配对与辛结构",
  summary:
    "本章沿着一条连续主线展开：线性函数把向量测量成标量；所有线性测量方法组成对偶空间；双线性函数同时接收两个向量；辛形式则用交错且非退化的配对记录成对方向之间的有向面积关系。",
  overviewTitle: "从一次测量走向双线性配对",
  overviewCards: [
    {
      title: "测量",
      text: "先看一个线性函数怎样把整个空间分成平行等值层，并从核空间读出零值方向。",
    },
    {
      title: "对偶",
      text: "再把所有线性测量方法放进同一个空间，用对偶基读取坐标，并理解对偶映射为何反向。",
    },
    {
      title: "配对",
      text: "最后进入双输入结构：矩阵记录基向量两两配对，辛形式进一步保留交错且非退化的面积关系。",
    },
  ],
  sections: [
    {
      id: "linear-functional",
      number: "§1",
      textbookSection: "线性函数",
      title: "线性函数",
      navTitle: "线性函数",
      question: "一个线性函数怎样把整个向量空间压缩成一个标量，同时仍然保留线性结构？",
      goal: "从等值线、核空间与基上的取值出发，理解线性函数是怎样测量向量的，并明确它与行向量、内积表示和仿射函数的边界。",
      tags: ["线性函数", "核空间", "等值超平面"],
      intro:
        "线性函数不会把二维平面画成一条普通曲线。它给每个向量一个标量读数，并把整个空间按函数值分成一组平行等值层。零值层就是核空间；知道函数在一组基上的取值，就能知道它对所有向量的取值。",
      concepts: [
        {
          label: "线性条件",
          text: `${texInline("f(x+y)=f(x)+f(y)")} 且 ${texInline("f(\\lambda x)=\\lambda f(x)")}。`,
        },
        {
          label: "核空间",
          text: `${texInline("\\ker f=\\{x:f(x)=0\\}")} 是子空间；非零线性函数的核是余维 1 的超平面。`,
        },
        {
          label: "等值层",
          text: `${texInline("f(x)=c")} 在二维中是平行直线，在三维中是平行平面；只有 ${texInline("c=0")} 的等值层必为子空间。`,
        },
        {
          label: "基值决定函数",
          text: `若 ${texInline("x=\\sum_i x_i e_i")}，则 ${texInline("f(x)=\\sum_i x_i f(e_i)")}。`,
        },
        {
          label: "坐标表示",
          text: `选定基后，线性函数写成行向量 ${texInline("[f]")} 与列向量 ${texInline("[x]")} 的乘积。`,
        },
        {
          label: "表示边界",
          text: `${texInline("f(x)=a^T x")} 需要选定坐标与内积；向量 ${texInline("a")} 不是线性函数本身。`,
        },
      ],
      textbook: {
        reference: "北大版《高等代数》第十章 §1",
        page: "参考视觉页 2—20",
        items: [
          "线性函数的定义与基本性质",
          "线性函数的核与等值集合",
          "由基上的取值确定线性函数",
          "线性函数的坐标表示与仿射边界",
        ],
      },
      interactive: {
        type: "functional-field",
        title: "线性函数场：沿等值线移动，读数为什么不变",
        description: "拖动输入向量并调节函数系数，观察核直线、等值线和标量读数同步变化。",
        task: "先选择“读取第一坐标”，沿竖直方向移动向量；再选择“求和”，沿同一条斜等值线移动，确认函数值保持不变。最后切换零函数，观察所有方向为何都进入核。",
        prompts: [
          "核直线上的每个向量都被测量为 0。",
          "同一条等值线上的向量不同，但函数值相同。",
          "把系数整体放大时，核不变，读数与等值线密度一起改变。",
        ],
      },
      theory: [
        {
          number: "01",
          title: "先看空间怎样被分层",
          text: `对非零线性函数 ${texInline("f:V\\to F")} 而言，零值集合穿过原点；其他等值集合与它平行。函数值改变的是“层号”，不是向量所在空间的维数。`,
          formula: "f(x)=c",
        },
        {
          number: "02",
          title: "核空间保存零值方向",
          text: `若 ${texInline("u,v\\in\\ker f")}，则 ${texInline("f(u+v)=0")}；若 ${texInline("\\lambda\\in F")}，则 ${texInline("f(\\lambda u)=0")}。所以核确实是子空间。`,
          formula: "\\ker f=\\{x:f(x)=0\\}",
        },
        {
          number: "03",
          title: "一组基上的读数已经足够",
          text: `函数对任意线性组合的读数，由它对基向量的读数线性组合而成。坐标行向量记录的是这些基值，而不是另一个独立的几何对象。`,
          formula: "f(x)=\\begin{bmatrix}f(e_1)&\\cdots&f(e_n)\\end{bmatrix}[x]",
        },
        {
          number: "04",
          title: "线性函数与仿射函数只有一个常数项之差",
          text: `当 ${texInline("g(x)=f(x)+c")} 且 ${texInline("c\\ne0")} 时，等值线仍然平行，但 ${texInline("g(0)\\ne0")}；它不再是线性函数。`,
          formula: "g(0)=c",
        },
      ],
      example: {
        title: "由非标准基上的取值确定线性函数",
        question: `在 ${texInline("\\mathbb R^2")} 中，令 ${texInline("v_1=(1,1)^T")}、${texInline("v_2=(1,-1)^T")}。已知 ${texInline("f(v_1)=3")}、${texInline("f(v_2)=1")}。求 ${texInline("f(x_1,x_2)")} 并写出 ${texInline("\\ker f")}。`,
        steps: [
          `${texInline("v_1,v_2")} 线性无关，因此构成一组基。`,
          `由 ${texInline("e_1=(v_1+v_2)/2")}、${texInline("e_2=(v_1-v_2)/2")}。`,
          `${texInline("f(e_1)=2")}，${texInline("f(e_2)=1")}。`,
          `所以 ${texInline("f(x_1,x_2)=2x_1+x_2")}。`,
          `令函数值为 0，得到 ${texInline("\\ker f=\\{(x_1,x_2)^T:2x_1+x_2=0\\}")}。`,
          "在交互图中选择对应系数，可以看到核直线正好是这条过原点的直线。",
        ],
      },
      quiz: [
        {
          question: `为什么任意线性函数都满足 ${texInline("f(0)=0")}？`,
          answer: `${texInline("f(0)=f(0+0)=f(0)+f(0)")}，两边减去 ${texInline("f(0)")} 即得。`,
        },
        {
          question: `集合 ${texInline("\\{x:f(x)=2\\}")} 一定是子空间吗？`,
          answer: "不一定。它通常是与核平行的仿射超平面，因为一般不包含零向量。",
        },
        {
          question: `函数 ${texInline("g(x,y)=2x-y+1")} 是否线性？`,
          answer: `不是，因为 ${texInline("g(0,0)=1\\ne0")}。`,
        },
        {
          question: "行向量是否就是不依赖基的线性函数本身？",
          answer: "不是。行向量是选定基之后的坐标表示；改变基时坐标会变，但函数对同一个几何向量的取值不变。",
        },
        {
          question: `非零线性函数在 ${texInline("n")} 维空间中的核通常是几维？`,
          answer: `${texInline("n-1")} 维，因为非零线性函数的秩为 1，应用秩—零度定理即可。`,
        },
      ],
      summary: [
        "线性函数把向量空间分成平行等值层，核空间是其中穿过原点的零值层。",
        "函数在一组基上的取值决定整个函数；行向量只是这一信息的坐标记录。",
        "下一节把所有线性函数放在一起，得到对偶空间。",
      ],
      exercises: ["改变交互中的基与函数系数，比较几何等值层不变时坐标表示怎样改变。"],
    },
    {
      id: "dual-space",
      number: "§2",
      textbookSection: "对偶空间",
      title: "对偶空间",
      navTitle: "对偶空间",
      question: "如果向量空间包含所有可以被测量的向量，那么所有线性测量方法放在一起会形成什么空间？",
      goal: "把对偶空间理解为所有线性测量方法组成的向量空间，掌握对偶基、自然配对、双对偶与对偶映射，并避免把对偶向量简单画成原空间里的另一支箭头。",
      tags: ["对偶空间", "对偶基", "对偶映射"],
      intro:
        "向量属于原空间，线性函数属于对偶空间。二者通过自然配对产生标量。对偶基是一组坐标读取器：它们不负责提供新的方向，而是准确读取向量沿原基各方向的坐标。",
      concepts: [
        {
          label: "对偶空间",
          text: `${texInline("V^*=\\operatorname{Hom}(V,F)")}，元素是从 ${texInline("V")} 到标量域的线性函数。`,
        },
        {
          label: "自然配对",
          text: `${texInline("\\langle f,x\\rangle=f(x)")} 对函数槽和向量槽分别线性。`,
        },
        {
          label: "对偶基",
          text: `${texInline("e^i(e_j)=\\delta_{ij}")}，每个 ${texInline("e^i")} 读取第 ${texInline("i")} 个坐标。`,
        },
        {
          label: "维数",
          text: `有限维时 ${texInline("\\dim V^*=\\dim V")}，但这不等于说 ${texInline("V=V^*")}。`,
        },
        {
          label: "双对偶",
          text: `${texInline("J(x)(f)=f(x)")} 给出不依赖基的自然映射 ${texInline("J:V\\to V^{**}")}。`,
        },
        {
          label: "对偶映射",
          text: `若 ${texInline("T:V\\to W")}，则 ${texInline("T^*:W^*\\to V^*")} 且 ${texInline("T^*(g)=g\\circ T")}。`,
        },
      ],
      textbook: {
        reference: "北大版《高等代数》第十章 §2",
        page: "参考视觉页 21—35",
        items: [
          "对偶空间与自然配对",
          "对偶基及其计算",
          "有限维双对偶的自然同构",
          "线性映射的对偶映射与转置矩阵",
        ],
      },
      interactive: {
        type: "dual-probe",
        title: "对偶探针板：向量和测量方法分别生活在哪里",
        description: "在左侧改变向量，在右侧改变线性函数；观察自然配对对两个输入槽分别线性，并切换标准基与斜基读取坐标。",
        task: "先固定函数并缩放向量，再固定向量并缩放函数。随后切换到斜基，比较几何向量不变时，坐标与对偶读取器怎样同时调整。",
        prompts: [
          "对偶空间中的一点代表一个线性函数，而不是原空间中的普通箭头。",
          "对偶基通过 Kronecker 配对读取坐标。",
          "基接近共线时，对偶读取器会变得非常敏感；精确共线时对偶基不存在。",
        ],
      },
      theory: [
        {
          number: "01",
          title: "线性函数本身也能相加和缩放",
          text: `对任意 ${texInline("f,g\\in V^*")} 与标量 ${texInline("\\lambda")}，逐点定义加法和数乘后仍得到线性函数，因此 ${texInline("V^*")} 是向量空间。`,
          formula: "(f+g)(x)=f(x)+g(x)",
        },
        {
          number: "02",
          title: "对偶基是坐标读取器",
          text: `若 ${texInline("x=\\sum_i x_i e_i")}，则 ${texInline("e^i(x)=x_i")}。在非标准基下，读取器的核沿其他基向量方向展开。`,
          formula: "e^i(e_j)=\\delta_{ij}",
        },
        {
          number: "03",
          title: "基矩阵的逆给出对偶基",
          text: `若 ${texInline("P=[v_1\\;\\cdots\\;v_n]")} 的列是新基，则对偶基在标准坐标下组成 ${texInline("P^{-1}")} 的各行。`,
          formula: "\\begin{bmatrix}v^1\\\\\\vdots\\\\v^n\\end{bmatrix}=P^{-1}",
        },
        {
          number: "04",
          title: "对偶映射把测量向前复合、方向却反转",
          text: `先把 ${texInline("x")} 送到 ${texInline("Tx")}，再由 ${texInline("g")} 测量。把两步压缩后得到 ${texInline("T^*(g)")}；因此箭头从 ${texInline("W^*")} 指回 ${texInline("V^*")}。`,
          formula: "T^*(g)(x)=g(Tx)",
        },
      ],
      example: {
        title: "求一组非标准基的对偶基",
        question: `在 ${texInline("\\mathbb R^2")} 中，令 ${texInline("v_1=(1,1)^T")}、${texInline("v_2=(2,1)^T")}。求对偶基 ${texInline("v^1,v^2")} 的标准坐标表达。`,
        steps: [
          `设 ${texInline("v^1=[a\\;b]")}，写出 ${texInline("a+b=1")} 与 ${texInline("2a+b=0")}。`,
          `解得 ${texInline("v^1=[-1\\;2]")}。`,
          `设 ${texInline("v^2=[c\\;d]")}，写出 ${texInline("c+d=0")} 与 ${texInline("2c+d=1")}。`,
          `解得 ${texInline("v^2=[1\\;-1]")}。`,
          `基矩阵 ${texInline("P=\\begin{bmatrix}1&2\\\\1&1\\end{bmatrix}")} 的逆正是 ${texInline("\\begin{bmatrix}-1&2\\\\1&-1\\end{bmatrix}")}。`,
          `对任意 ${texInline("x")}，都有 ${texInline("x=v^1(x)v_1+v^2(x)v_2")}。`,
        ],
      },
      quiz: [
        {
          question: `对象 ${texInline("f:V\\to F")} 属于哪个空间？`,
          answer: `若 ${texInline("f")} 线性，则 ${texInline("f\\in V^*")}。`,
        },
        {
          question: `为什么 ${texInline("e^i(x)")} 恰好等于第 ${texInline("i")} 个坐标？`,
          answer: `把 ${texInline("x=\\sum_j x_j e_j")} 代入，利用 ${texInline("e^i(e_j)=\\delta_{ij}")} 即可。`,
        },
        {
          question: `若 ${texInline("T:V\\to W")}，对偶映射的方向是什么？`,
          answer: `${texInline("T^*:W^*\\to V^*")}；因为 ${texInline("W^*")} 中的测量先与 ${texInline("T")} 复合，变成对 ${texInline("V")} 的测量。`,
        },
        {
          question: `有限维时 ${texInline("V")} 与 ${texInline("V^*")} 维数相同，能否直接写成 ${texInline("V=V^*")}？`,
          answer: "不能。维数相同只说明存在同构；没有额外结构时，没有一个不依赖选择的自然同构。",
        },
        {
          question: `自然映射 ${texInline("J:V\\to V^{**}")} 怎样定义？`,
          answer: `${texInline("J(x)(f)=f(x)")}。向量 ${texInline("x")} 被看成一个对线性函数求值的线性函数。`,
        },
      ],
      summary: [
        "对偶空间由所有线性函数组成，自然配对把函数和向量送到标量。",
        "对偶基是坐标读取器；基矩阵的逆决定它们的坐标。",
        "对偶映射通过复合把测量拉回，因此方向与原线性映射相反。",
      ],
      exercises: ["在交互中逐渐让两条基向量接近共线，记录对偶基系数怎样增长，并解释原因。"],
    },
    {
      id: "bilinear-form",
      number: "§3",
      textbookSection: "双线性函数",
      title: "双线性函数",
      navTitle: "双线性函数",
      question: "当一个函数同时接收两个向量，并且对每个输入槽都保持线性时，矩阵到底记录了什么？",
      goal: "从两个输入槽、基向量配对表与矩阵表示出发，理解一般双线性函数、对称与交错分解、合同变换、退化根空间以及与二次型的关系。",
      tags: ["双线性函数", "配对矩阵", "合同变换"],
      intro:
        "双线性函数有两个输入槽。固定右槽，它变成左空间上的线性函数；固定左槽，它变成右空间上的线性函数。选定基后，矩阵的第 i 行第 j 列记录的正是第 i 个左基向量与第 j 个右基向量的配对值。",
      concepts: [
        {
          label: "分别线性",
          text: `${texInline("B:V\\times W\\to F")} 对两个输入槽分别满足可加性与齐次性。`,
        },
        {
          label: "矩阵表示",
          text: `选定基后 ${texInline("B(x,y)=x^T A y")}，且 ${texInline("a_{ij}=B(e_i,f_j)")}。`,
        },
        {
          label: "合同变换",
          text: `在同一空间同时换基时，矩阵按 ${texInline("A'=P^TAP")} 变化。`,
        },
        {
          label: "对称与交错",
          text: `交换输入可得到对称、斜对称或一般情形；交错形式满足 ${texInline("B(x,x)=0")}。`,
        },
        {
          label: "退化",
          text: `若存在非零方向与另一槽所有向量配对都为 0，则双线性函数退化。`,
        },
        {
          label: "二次型",
          text: `${texInline("Q(x)=B(x,x")} 只保留矩阵的对称部分，看不见斜对称部分。`,
        },
      ],
      textbook: {
        reference: "北大版《高等代数》第十章 §3",
        page: "参考视觉页 36—59",
        items: [
          "双线性函数的定义与矩阵表示",
          "基变换与合同矩阵",
          "对称、斜对称和交错双线性函数",
          "退化性、根空间与二次型联系",
        ],
      },
      interactive: {
        type: "bilinear-mixer",
        title: "双线性混合器：两个输入槽怎样共同产生一个标量",
        description: "调节两个向量与配对矩阵，比较 B(x,y)、B(y,x)、固定一槽后的线性函数以及退化方向。",
        task: "依次选择“对称”“交错”“一般”“退化”四个预设。每次交换 x 与 y，比较两个读数；在退化预设中点击“隐身方向”，再任意改变另一槽，观察输出是否始终为 0。",
        prompts: [
          "固定一槽后，另一槽中的变化必须是线性的。",
          "矩阵元素和基向量两两配对一一对应。",
          "二次型只看 B(x,x)，因此会丢失交错部分。",
        ],
      },
      theory: [
        {
          number: "01",
          title: "两个槽分别线性，而不是把向量对当成一个普通向量",
          text: `固定 ${texInline("y")} 后，${texInline("x\\mapsto B(x,y)")} 属于 ${texInline("V^*")}；固定 ${texInline("x")} 后，${texInline("y\\mapsto B(x,y)")} 属于 ${texInline("W^*")}。`,
          formula: "B(x_1+x_2,y)=B(x_1,y)+B(x_2,y)",
        },
        {
          number: "02",
          title: "矩阵是一张基向量配对表",
          text: `把两个输入分别展开为基的线性组合，所有 ${texInline("B(e_i,f_j)")} 按系数加权后汇总成一个标量。`,
          formula: "B(x,y)=\\sum_{i,j}x_i a_{ij}y_j",
        },
        {
          number: "03",
          title: "合同变换保护的是同一个双线性结构",
          text: `换基改变坐标和矩阵记录，但对同一对几何向量的配对值保持不变。合同与相似保护的对象不同，公式也不同。`,
          formula: "A'=P^TAP",
        },
        {
          number: "04",
          title: "退化意味着存在配对看不见的非零方向",
          text: `若非零 ${texInline("x")} 满足对所有 ${texInline("y")} 都有 ${texInline("B(x,y)=0")}，则 ${texInline("x")} 属于左根。方阵满秩时没有这样的非零方向。`,
          formula: "\\operatorname{Rad}_L(B)=\\{x:B(x,y)=0,\\forall y\\}",
        },
        {
          number: "05",
          title: "二次型只保留对称层",
          text: `在特征不为 2 的情形，把 ${texInline("A")} 分为对称部分与斜对称部分。代入同一个向量两次时，斜对称部分贡献恒为 0。`,
          formula: "x^TAx=x^T\\frac{A+A^T}{2}x",
        },
      ],
      example: {
        title: "从基配对值写出矩阵并判断结构",
        question: `在 ${texInline("\\mathbb R^2")} 中，已知 ${texInline("B(e_1,e_1)=2")}、${texInline("B(e_1,e_2)=1")}、${texInline("B(e_2,e_1)=-1")}、${texInline("B(e_2,e_2)=3")}。写出矩阵，计算 ${texInline("B((1,2)^T,(3,-1)^T)")} 并判断是否退化。`,
        steps: [
          `按 ${texInline("a_{ij}=B(e_i,e_j)")} 填表，得到 ${texInline("A=\\begin{bmatrix}2&1\\\\-1&3\\end{bmatrix}")}。`,
          `先算 ${texInline("Ay=\\begin{bmatrix}5\\\\-6\\end{bmatrix}")}。`,
          `再算 ${texInline("x^T(Ay)=1\\cdot5+2\\cdot(-6)=-7")}。`,
          `交换输入后一般不会得到相同或相反数，因此该形式既不对称也不交错。`,
          `${texInline("\\det A=7\\ne0")}，所以矩阵满秩，左根与右根都只有零向量，形式非退化。`,
        ],
      },
      quiz: [
        {
          question: "双线性是否等于对向量对整体线性？",
          answer: "不等于。它要求固定任意一个输入槽后，对另一个输入槽线性；把两个输入同时缩放会产生两个倍率。",
        },
        {
          question: `矩阵元素 ${texInline("a_{ij}")} 表示什么？`,
          answer: `${texInline("a_{ij}=B(e_i,f_j)")}，即第 ${texInline("i")} 个左基向量与第 ${texInline("j")} 个右基向量的配对值。`,
        },
        {
          question: `同一空间换基后，为什么不是 ${texInline("P^{-1}AP")}？`,
          answer: "双线性函数的两个输入坐标都发生变化，一侧产生转置因子，因此得到合同变换，而不是线性算子的相似变换。",
        },
        {
          question: `若 ${texInline("A^T=-A")} 且数域特征不为 2，${texInline("B(x,x)")} 等于什么？`,
          answer: `${texInline("B(x,x)=x^TAx=0")}。`,
        },
        {
          question: "为什么二次型不能恢复一般双线性函数？",
          answer: "因为代入同一个向量两次时，斜对称部分恒为 0；不同的斜对称部分可能产生同一个二次型。",
        },
      ],
      summary: [
        "双线性函数对两个输入槽分别线性；矩阵是基向量两两配对的记录表。",
        "合同换基改变记录方式，不改变几何配对值；退化意味着存在非零隐身方向。",
        "辛形式将从交错且非退化的双线性函数中产生。",
      ],
      exercises: ["在交互中选一个一般矩阵，分离对称与斜对称部分，比较 B(x,y) 与 Q(x)=B(x,x)。"],
    },
    {
      id: "symplectic-space",
      number: "＊§4",
      textbookSection: "辛空间",
      title: "辛空间",
      navTitle: "辛空间",
      question: "如果一种双线性结构不测长度和角度，而测量成对方向之间的有向面积，它需要满足什么条件？",
      goal: "从二维有向面积进入交错与非退化，理解标准辛矩阵、偶数维、辛基、辛变换与辛正交补，并区分辛保持、正交保持和体积保持。",
      tags: ["辛形式", "有向面积", "辛变换"],
      intro:
        "在二维标准坐标中，辛配对就是两个向量张成的有向面积。交换向量顺序会变号，共线时面积为零。真正的辛形式还必须非退化：任何非零方向都能找到一个搭档与它产生非零配对。",
      concepts: [
        {
          label: "交错",
          text: `${texInline("\\omega(x,x)=0")}；在特征不为 2 时等价于 ${texInline("\\omega(x,y)=-\\omega(y,x)")}。`,
        },
        {
          label: "非退化",
          text: `若 ${texInline("\\omega(x,y)=0")} 对所有 ${texInline("y")} 成立，则必须有 ${texInline("x=0")}。`,
        },
        {
          label: "标准矩阵",
          text: `本项目采用 ${texInline("J=\\begin{bmatrix}0&I\\\\-I&0\\end{bmatrix}")} 与 ${texInline("\\omega(x,y)=x^TJy")}。`,
        },
        {
          label: "偶数维",
          text: "非退化交错矩阵只能出现在偶数阶，因此辛空间维数必为偶数。",
        },
        {
          label: "辛变换",
          text: `${texInline("S^TJS=J")} 等价于保持所有辛配对。`,
        },
        {
          label: "辛正交补",
          text: `${texInline("U^\\omega=\\{v:\\omega(v,u)=0,\\forall u\\in U\\}")}。`,
        },
      ],
      textbook: {
        reference: "北大版《高等代数》第十章 ＊§4",
        page: "参考视觉页 60—72",
        items: [
          "交错双线性函数与辛形式",
          "标准辛矩阵与辛基",
          "辛空间维数的偶数性",
          "辛变换与辛正交补",
        ],
      },
      interactive: {
        type: "symplectic-area",
        title: "辛面积实验室：什么被保持，什么可以改变",
        description: "拖动两个向量形成有向平行四边形，并比较剪切、互补缩放、旋转和均匀缩放对辛配对的影响。",
        task: "先交换 x 与 y，确认符号反转；再让两向量共线。随后依次应用剪切、互补缩放和均匀缩放，比较 ω(Sx,Sy) 与 ω(x,y)。",
        prompts: [
          "交错说明同一向量与自身配对为 0，但不表示该向量为零。",
          "非退化要求每个非零向量都能找到产生非零配对的搭档。",
          "二维中行列式为 1 与辛条件等价；高维中体积保持远弱于辛保持。",
        ],
      },
      theory: [
        {
          number: "01",
          title: "二维辛配对就是有向面积",
          text: `采用约定 ${texInline("J=\\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix}")} 后，${texInline("x^TJy")} 等于两个列向量组成矩阵的行列式。顺序决定符号。`,
          formula: "\\omega(x,y)=\\det[x\\;y]",
        },
        {
          number: "02",
          title: "交错与非退化解决的是两个不同问题",
          text: `交错控制交换与自配对；非退化排除对所有搭档都读数为 0 的非零隐身方向。二者同时成立才得到辛形式。`,
          formula: "\\omega(x,x)=0,\\qquad \\ker J=\\{0\\}",
        },
        {
          number: "03",
          title: "方向必须成对，因此维数为偶数",
          text: `视觉上，每个方向需要一个辛搭档形成面积单元；代数上，奇数阶斜对称矩阵行列式为 0，无法非退化。`,
          formula: "\\det A=\\det A^T=\\det(-A)=(-1)^n\\det A",
        },
        {
          number: "04",
          title: "辛基把空间拆成配对的二维单元",
          text: `标准辛基 ${texInline("e_1,\\ldots,e_n,f_1,\\ldots,f_n")} 满足同类之间配对为 0，${texInline("\\omega(e_i,f_j)=\\delta_{ij}")}。`,
          formula: "J=\\begin{bmatrix}0&I\\\\-I&0\\end{bmatrix}",
        },
        {
          number: "05",
          title: "辛变换保持配对，不必保持长度",
          text: `剪切与互补缩放可以把圆强烈拉成长椭圆，却仍保持所有辛配对。正交变换保持的是长度与角度，条件不同。`,
          formula: "S^TJS=J",
        },
      ],
      example: {
        title: "判断三类二维变换是否辛",
        question: `令 ${texInline("J=\\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix}")}。比较 ${texInline("S_1=\\begin{bmatrix}1&t\\\\0&1\\end{bmatrix}")}、${texInline("S_2=\\begin{bmatrix}s&0\\\\0&1/s\\end{bmatrix}")} 与 ${texInline("S_3=\\begin{bmatrix}s&0\\\\0&s\\end{bmatrix}")}。`,
        steps: [
          `对 ${texInline("S_1")} 计算得到 ${texInline("S_1^TJS_1=J")}；剪切保持有向面积。`,
          `对 ${texInline("S_2")} 计算得到 ${texInline("S_2^TJS_2=J")}；一个方向放大时，配对方向按倒数缩小。`,
          `对 ${texInline("S_3")} 得到 ${texInline("S_3^TJS_3=s^2J")}。`,
          `因此只有 ${texInline("s^2=1")} 时均匀缩放才辛。`,
          `二维中上述结论也可由 ${texInline("S^TJS=(\\det S)J")} 快速判断；这条简化不能直接推广到高维。`,
        ],
      },
      quiz: [
        {
          question: `为什么 ${texInline("\\omega(x,x)=0")} 不推出 ${texInline("x=0")}？`,
          answer: "交错形式对每个向量的自配对都为 0；非退化性考察的是该向量与所有其他向量的配对，而不是自配对。",
        },
        {
          question: "共线向量的辛配对为 0，是否说明辛形式退化？",
          answer: "不说明。退化要求存在一个非零向量与所有向量配对都为 0；共线只描述某一对向量。",
        },
        {
          question: `矩阵 ${texInline("S")} 保持辛形式的判据是什么？`,
          answer: `${texInline("S^TJS=J")}。等价地，对所有 ${texInline("x,y")} 都有 ${texInline("\\omega(Sx,Sy)=\\omega(x,y")}。`,
        },
        {
          question: "为什么辛空间维数必须为偶数？",
          answer: "表示辛形式的矩阵是非退化斜对称矩阵；奇数阶斜对称矩阵行列式必为 0，无法非退化。",
        },
        {
          question: "高维中行列式为 1 是否足以保证辛？",
          answer: "不足。行列式为 1 只保证总体积保持；辛条件还要求每一对辛配对都保持。",
        },
      ],
      summary: [
        "辛形式是交错且非退化的双线性函数；二维标准模型是有向面积。",
        "辛空间的方向按二维单元成对组织，因此维数必为偶数。",
        "辛变换保持 xᵀJy，而不是长度、角度或任意高维体积信息。",
      ],
      exercises: ["在交互中比较剪切、互补缩放与均匀缩放，分别记录长度、面积和辛配对发生了什么。"],
    },
  ],
});