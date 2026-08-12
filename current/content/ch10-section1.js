defineChapter10Section({
  id: "linear-functional",
  number: "§1",
  textbookSection: "线性函数",
  title: "线性函数",
  navTitle: "线性函数",
  question: "方程的一行、多项式在一点的取值和定积分，为什么可以看成同一种线性对象？",
  goal: "从“读取向量”的共同任务出发认识线性函数；用核与等值层解释它的几何结构；证明一组基上的取值怎样唯一决定整个函数。",
  tags: ["线性函数", "核空间", "等值超平面"],
  intro:
    "矩阵的一行把 " + texInline("x") + " 读成 " + texInline("a^Tx") + "；求值把多项式 " + texInline("p") + " 读成 " + texInline("p(t_0)") + "；积分把函数 " + texInline("g") + " 读成 " + texInline("\\int g") + "。它们都把一个线性空间中的对象压缩成标量，并且完整保留加法与数乘。平面上的平行等值线只是这种抽象读取方式在二维实空间里的可见模型。",
  textbook: {
    reference: "Hoffman–Kunze §3.5 · Axler §3.F · Friedberg §2.6",
    page: "",
    items: [
      "坐标、迹、求值与积分四类线性函数",
      "核、等值集与齐次方程",
      "基上取值唯一决定线性函数",
      "对象与坐标行向量的区分",
    ],
  },
  interactive: {
    type: "functional-field",
    title: "向量扫描器",
    question: "沿哪个方向移动，位置会改变而读数保持不变？跨过核时又会发生什么？",
  },
  concepts: [
    {
      label: "线性读取",
      text: texInline("f:V\\to F") + " 满足 " + texInline("f(x+y)=f(x)+f(y)") + " 与 " + texInline("f(\\lambda x)=\\lambda f(x)") + "。坐标读取、矩阵的迹、多项式求值和定积分都服从同一规则；特别地，" + texInline("f(0)=0") + "。",
    },
    {
      label: "核与等值层",
      text: texInline("\\ker f=\\{x:f(x)=0\\}") + " 是子空间。若 " + texInline("f\\ne0") + " 且 V 为 n 维，则 " + texInline("\\dim\\ker f=n-1") + "；任意非空等值集 " + texInline("\\{x:f(x)=c\\}") + " 都是核的一个平移。",
    },
    {
      label: "基值决定函数",
      text: "若 " + texInline("v_1,\\ldots,v_n") + " 是一组基且 " + texInline("x=\\sum_i x_i v_i") + "，线性性迫使 " + texInline("f(x)=\\sum_i x_i f(v_i)") + "。所以任意指定的 n 个基值都唯一确定一个线性函数；行向量只记录它在所选基下的坐标。",
    },
  ],
  example: {
    title: "由斜基上的读数重建线性函数",
    question: "在 " + texInline("\\mathbb R^2") + " 中，令 " + texInline("v_1=(1,1)^T") + "、" + texInline("v_2=(1,-1)^T") + "。已知 " + texInline("f(v_1)=3") + "、" + texInline("f(v_2)=1") + "。求 " + texInline("f(x_1,x_2)") + "、" + texInline("\\ker f") + " 以及等值集 " + texInline("f^{-1}(4)") + "。",
    steps: [
      {
        title: "确认给定向量能够作为坐标骨架",
        text: texInline("\\det[v_1\\;v_2]=-2\\ne0") + "，所以 " + texInline("v_1,v_2") + " 是一组基；两个基值足以决定 f。",
      },
      {
        title: "把标准基写成斜基的组合",
        text: texInline("e_1=(v_1+v_2)/2") + "，" + texInline("e_2=(v_1-v_2)/2") + "。",
      },
      {
        title: "用线性性读取标准基",
        text: texInline("f(e_1)=[f(v_1)+f(v_2)]/2=2") + "，" + texInline("f(e_2)=[f(v_1)-f(v_2)]/2=1") + "。",
      },
      {
        title: "写出任意向量的读数",
        text: texInline("f(x_1,x_2)=x_1f(e_1)+x_2f(e_2)=2x_1+x_2") + "。",
      },
      {
        title: "找出完全不可见的方向",
        text: texInline("\\ker f=\\{(x_1,x_2)^T:2x_1+x_2=0\\}=\\operatorname{span}\\{(1,-2)^T\\}") + "。",
      },
      {
        title: "把非零等值集看成核的平移",
        text: "取 " + texInline("p=(2,0)^T") + "，有 " + texInline("f(p)=4") + "，因此 " + texInline("f^{-1}(4)=p+\\ker f") + "。",
      },
    ],
  },
  quiz: [
    {
      question: "为什么每个线性函数都满足 " + texInline("f(0)=0") + "？",
      answer: texInline("f(0)=f(0+0)=f(0)+f(0)") + "，在标量域中消去一项便得 " + texInline("f(0)=0") + "。",
    },
    {
      question: "设 " + texInline("f\\ne0") + "。为什么两个非空等值集 " + texInline("f^{-1}(c_1)") + " 与 " + texInline("f^{-1}(c_2)") + " 彼此平行？",
      answer: "各取一点 " + texInline("p_i") + " 满足 " + texInline("f(p_i)=c_i") + "，就有 " + texInline("f^{-1}(c_i)=p_i+\\ker f") + "；它们共享同一个方向子空间 " + texInline("\\ker f") + "。",
    },
    {
      question: "集合 " + texInline("\\{x:f(x)=2\\}") + " 一定是子空间吗？",
      answer: "不一定。非空时它是核的仿射平移；当标量 2 非零时，它不经过零向量。",
    },
    {
      question: "函数 " + texInline("g(x,y)=2x-y+1") + " 是否线性？",
      answer: "不线性，因为 " + texInline("g(0,0)=1") + "；它是一个仿射函数。",
    },
    {
      question: "为什么规定一组基上的任意 n 个标量，就能定义唯一的线性函数？",
      answer: "每个向量都有唯一的基展开；把这些坐标与规定的基值作同样线性组合即可定义函数，唯一性也由这组展开直接得到。",
    },
    {
      question: "同一个线性函数换基以后，哪些量改变，哪些量保持？",
      answer: "函数对每个几何向量的读数保持不变；向量的列坐标与函数的行坐标会随基一起改变。",
    },
    {
      question: "平面图里与等值线垂直的箭头可以直接定义一般向量空间上的线性函数吗？",
      answer: "一般不可以。该箭头依赖坐标和内积；核、等值层以及对每个向量的读数不依赖这种额外选择。",
    },
  ],
  summary: [
    "线性函数是从向量空间到标量域的线性映射；方程的一行、求值、迹和积分都是代表例子。",
    "核收集读数为 0 的方向；非零线性函数的核是余维 1 子空间，其他等值层都是它的平移。",
    "一组基上的取值唯一决定整个函数，坐标行向量只是这种函数在所选基下的记录。",
    "下一节把所有线性读取器放在同一个向量空间中，并寻找专门读取坐标的对偶基。",
  ],
});
