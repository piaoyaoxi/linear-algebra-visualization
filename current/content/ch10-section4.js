defineChapter10Section({
  id: "symplectic-space",
  number: "＊§4",
  textbookSection: "辛空间",
  title: "辛空间",
  navTitle: "辛空间",
  question: "交错配对怎样记录有向面积？为什么再加上非退化以后，空间中的方向必然成对出现？",
  goal: "从二维有向面积分清交错与非退化；沿“选一个方向—寻找搭档—分裂辛平面—递归”的路线构造辛基；理解标准矩阵、偶数维与辛变换，并辨别二维面积保持和高维辛保持的边界。",
  tags: ["辛形式", "辛基", "辛变换"],
  intro:
    "二维标准配对 " + texInline("\\omega(x,y)=\\det[x\\;y]") + " 记录有向面积：交换输入会变号，共线时读数为 0。辛形式还要求非退化，即每个非零方向都能找到一个搭档产生非零配对。这个条件让我们能够反复抽出标准二维面积单元，直到整个空间被辛向量对填满。",
  textbook: {
    reference: "Hoffman–Kunze §10.3–§10.4 · Strang §5.3（有向面积直觉）",
    page: "",
    items: [
      "交错、斜对称与非退化",
      "逐对抽取辛基的构造证明",
      "标准辛矩阵与偶数维",
      "保持双线性型的变换群",
    ],
  },
  interactive: {
    type: "symplectic-area",
    title: "有向面积配对",
    question: "交换、共线、剪切和均匀缩放分别怎样改变有向面积配对？",
  },
  concepts: [
    {
      label: "交错",
      text: texInline("\\omega(x,x)=0") + " 对每个 x 成立。由 " + texInline("\\omega(x+y,x+y)=0") + " 可得 " + texInline("\\omega(x,y)=-\\omega(y,x)") + "；当数域特征不为 2 时，斜对称也反过来推出交错。",
    },
    {
      label: "非退化",
      text: "若 " + texInline("\\omega(x,y)=0") + " 对所有 y 都成立，则必须有 " + texInline("x=0") + "。等价地，映射 " + texInline("x\\mapsto\\omega(x,\\cdot)") + " 从 V 到 V* 是单射；有限维时它是同构。",
    },
    {
      label: "辛基与标准矩阵",
      text: "辛基 " + texInline("e_1,\\ldots,e_n,f_1,\\ldots,f_n") + " 满足 " + texInline("\\omega(e_i,e_j)=\\omega(f_i,f_j)=0") + "、" + texInline("\\omega(e_i,f_j)=\\delta_{ij}") + "。在这组基下矩阵为 " + texInline("J=\\begin{bmatrix}0&I\\\\-I&0\\end{bmatrix}") + "。",
    },
    {
      label: "保持配对",
      text: "线性变换 S 是辛变换，当且仅当 " + texInline("\\omega(Sx,Sy)=\\omega(x,y)") + " 对所有 x、y 成立；在辛基下等价于 " + texInline("S^TJS=J") + "。辛变换的行列式实际等于 1；高维中，" + texInline("\\det S=1") + " 仍只是必要条件。",
    },
  ],
  evenDimension: {
    title: "为什么方向必须成对出现",
    algebra: [
      "任选非零 " + texInline("e_1") + "。非退化性保证存在 " + texInline("f_1") + "，使 " + texInline("\\omega(e_1,f_1)\\ne0") + "；把 " + texInline("f_1") + " 缩放后可令 " + texInline("\\omega(e_1,f_1)=1") + "。",
      texInline("W_1=\\operatorname{span}\\{e_1,f_1\\}") + " 上的限制已经非退化：若 " + texInline("ae_1+bf_1") + " 与 " + texInline("e_1,f_1") + " 都配对为 0，就有 " + texInline("a=b=0") + "。",
      "令 " + texInline("W_1^\\omega=\\{v:\\omega(v,w)=0,\\;\\forall w\\in W_1\\}") + "。每个向量都能唯一拆成 " + texInline("W_1") + " 部分与 " + texInline("W_1^\\omega") + " 部分，因此 " + texInline("V=W_1\\oplus W_1^\\omega") + "；" + texInline("\\omega") + " 在 " + texInline("W_1^\\omega") + " 上的限制仍非退化。",
      "在 " + texInline("W_1^\\omega") + " 中重复同样步骤，最终得到 " + texInline("(e_1,f_1),\\ldots,(e_n,f_n)") + "。所以维数为 " + texInline("2n") + "，并在辛基下得到标准矩阵 " + texInline("J") + "；奇数阶斜对称矩阵行列式为 0 也给出同一结论的代数核对。",
    ],
  },
  preservationCompare: [
    {
      id: "orthogonal",
      title: "正交变换",
      keeps: "长度与角度",
      condition: texInline("Q^TQ=I"),
      visual: "单位球仍是单位球",
    },
    {
      id: "symplectic",
      title: "辛变换",
      keeps: "每一对辛配对",
      condition: texInline("S^TJS=J"),
      visual: "所有标准方向对的配对关系同时保持",
    },
    {
      id: "volume",
      title: "体积保持",
      keeps: "一个总体积因子",
      condition: texInline("\\det S=1"),
      visual: "高维总体积不变，但局部辛配对仍可能改变",
    },
  ],
  example: {
    title: "从二维快速判别走向高维边界",
    question: "比较二维剪切 " + texInline("S_1=\\begin{bmatrix}1&t\\\\0&1\\end{bmatrix}") + "、互补缩放 " + texInline("S_2=\\begin{bmatrix}s&0\\\\0&1/s\\end{bmatrix}") + "、均匀缩放 " + texInline("S_3=sI") + "；再判断四维矩阵 " + texInline("D=\\operatorname{diag}(2,1/2,1,1)") + " 是否辛。",
    steps: [
      {
        title: "先记住二维恒等式",
        text: "对任意 " + texInline("2\\times2") + " 矩阵 S，都有 " + texInline("S^TJS=(\\det S)J") + "。因此二维辛条件等价于 " + texInline("\\det S=1") + "。",
      },
      {
        title: "检查剪切",
        text: texInline("\\det S_1=1") + "，所以 " + texInline("S_1^TJS_1=J") + "；把一边加到另一边不会改变有向面积。",
      },
      {
        title: "检查互补缩放",
        text: texInline("\\det S_2=s\\cdot(1/s)=1") + "。一个方向放大 s 倍，配对方向缩小到 " + texInline("1/s") + "，辛配对保持。",
      },
      {
        title: "检查均匀缩放",
        text: texInline("S_3^TJS_3=s^2J") + "，所以只有 " + texInline("s^2=1") + " 时才辛。",
      },
      {
        title: "进入四维，先检查必要条件",
        text: texInline("\\det D=2\\cdot(1/2)\\cdot1\\cdot1=1") + "；它确实保持四维总体积。",
      },
      {
        title: "再检查全部辛配对",
        text: "在坐标顺序 " + texInline("(e_1,e_2,f_1,f_2)") + " 下，D 把 " + texInline("\\omega(e_1,f_1)=1") + " 改成 2，把 " + texInline("\\omega(e_2,f_2)=1") + " 改成 " + texInline("1/2") + "。因此 " + texInline("D^TJD\\ne J") + "，D 不是辛变换。",
      },
    ],
  },
  quiz: [
    {
      question: "为什么 " + texInline("\\omega(x,x)=0") + " 不能推出 " + texInline("x=0") + "？",
      answer: "交错性要求每个向量的自配对都为 0。非退化性考察的是一个向量与所有可能搭档的配对；两项条件回答不同问题。",
    },
    {
      question: "一对共线向量的辛配对为 0，是否说明辛形式退化？",
      answer: "不能。退化要求存在同一个非零向量与所有向量都配对为 0；只找到一个零配对远远不够。",
    },
    {
      question: "在构造辛基时，非退化性具体保证了哪一步？",
      answer: "对每个非零 eᵢ，都能找到 fᵢ 使 " + texInline("\\omega(e_i,f_i)\\ne0") + "；缩放后就能得到一个标准配对值 1。",
    },
    {
      question: "逐对抽取辛平面的证明为什么同时推出维数必须为偶数？",
      answer: "每一步分裂出一个二维非退化子空间，剩余辛正交补继续非退化；有限步结束时，整组基由若干二元向量对组成。",
    },
    {
      question: "二维中为什么可以用 " + texInline("\\det S=1") + " 判断辛性？",
      answer: "二维恒有 " + texInline("S^TJS=(\\det S)J") + "，所以保持 J 与行列式为 1 等价。这是二维矩阵的特殊恒等式。",
    },
    {
      question: "四维及更高维中，" + texInline("\\det S=1") + " 为什么不够？",
      answer: "行列式只记录总体积因子；辛条件要求许多方向对的配对同时保持，即整个矩阵等式 " + texInline("S^TJS=J") + "。",
    },
    {
      question: "辛变换一定保持欧氏长度和角度吗？",
      answer: "不一定。剪切和互补缩放都可以保持辛配对，同时改变长度与角度；正交条件和辛条件保存的是不同结构。",
    },
    {
      question: "在二维标准辛空间中，一条非零直线 L 的辛正交补是什么？",
      answer: texInline("L^\\omega=L") + "。同一直线上的向量彼此共线，配对为 0；任何不在 L 上的向量都会与 L 的非零向量张成非零面积。",
    },
  ],
  summary: [
    "辛形式是交错且非退化的双线性型；二维标准模型是有向面积配对。",
    "非退化性为每个非零方向提供搭档，反复分裂二维辛平面便构造出辛基。",
    "辛基由 n 对向量组成，所以辛空间维数为 2n，形式矩阵化为标准 J。",
    "辛变换满足 " + texInline("S^TJS=J") + "；二维可等价检查 " + texInline("\\det S=1") + "，高维必须保留完整配对矩阵。",
  ],
});
