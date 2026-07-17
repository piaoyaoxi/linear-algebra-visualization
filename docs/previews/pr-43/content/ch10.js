registerAlgebraChapter({
  id:"ch10",icon:"10",title:"第十章 双线性函数与辛空间",subtitle:"对偶、配对与辛结构",
  overviewTitle:"从一次测量走向双线性配对",
  summary:"本章沿一条连续主线展开：线性函数把向量测量成标量；所有线性测量组成对偶空间；双线性函数同时接收两个向量；辛形式进一步用交错且非退化的配对记录有向面积关系。",
  overviewCards:[
    {title:"测量",text:"用等值层与核空间理解线性函数怎样读取向量。"},
    {title:"对偶",text:"把所有读取方法组成空间，再用对偶基准确读取坐标。"},
    {title:"配对",text:"让两个输入槽分别保持线性，最后进入辛形式的面积结构。"}
  ],
  sections:[
    {
      id:"linear-functional",number:"§1",textbookSection:"线性函数",title:"线性函数",navTitle:"线性函数",
      question:"一个线性函数怎样把整个向量空间压缩成一个标量，同时仍然保留线性结构？",
      goal:"从等值线、核空间与基上的取值出发，理解线性函数怎样测量向量，并分清线性函数、行向量与仿射函数。",
      tags:["线性函数","核空间","等值超平面"],
      intro:"线性函数给每个向量一个标量读数，并把空间按函数值分成平行等值层。零值层是核空间；知道函数在一组基上的取值，就能推出它对所有向量的取值。",
      concepts:[
        {label:"线性条件",text:`${texInline("f(x+y)=f(x)+f(y)")} 且 ${texInline("f(\\lambda x)=\\lambda f(x)")}。`},
        {label:"核空间",text:`${texInline("\\ker f=\\{x:f(x)=0\\}")} 是子空间；非零函数的核是余维 1 的超平面。`},
        {label:"等值层",text:`${texInline("f(x)=c")} 在二维中是平行直线；只有 ${texInline("c=0")} 的一层必为子空间。`},
        {label:"坐标表示",text:`若 ${texInline("x=\\sum_i x_i e_i")}，则 ${texInline("f(x)=\\sum_i x_i f(e_i)")}。`}
      ],
      interactive:{type:"functional-field",title:"线性函数场：沿等值线移动，读数为什么不变",description:"拖动向量并调节函数系数，观察核、等值线和读数同步变化。",task:"先选择“读取 x₁”，沿竖直方向移动；再选择“求和”，沿斜等值线移动。最后切换零函数，观察整个平面怎样成为核。",prompts:["核上的每个向量都被测量为 0。","同一条等值线上的向量不同，但函数值相同。","系数整体放大时，核不变，读数按同一倍率变化。"]},
      theory:[
        {number:"01",title:"空间被分成平行等值层",text:`对非零 ${texInline("f:V\\to F")}，零值层穿过原点，其他等值层与它平行。`,formula:"f(x)=c"},
        {number:"02",title:"核保存零值方向",text:`若 ${texInline("u,v\\in\\ker f")}，则它们的和与任意标量倍仍在核中。`,formula:"\\ker f=\\{x:f(x)=0\\}"},
        {number:"03",title:"基上的读数决定整个函数",text:"任意向量都是基向量的线性组合，函数值由基值按同样系数组合。",formula:"f(x)=\\begin{bmatrix}f(e_1)&\\cdots&f(e_n)\\end{bmatrix}[x]"},
        {number:"04",title:"仿射函数多出常数项",text:`若 ${texInline("g(x)=f(x)+c")} 且 ${texInline("c\\ne0")}，则 ${texInline("g(0)\\ne0")}，所以不再线性。`,formula:"g(0)=c"}
      ],
      example:{title:"由非标准基上的取值确定函数",question:`在 ${texInline("\\mathbb R^2")} 中，${texInline("v_1=(1,1)^T")}、${texInline("v_2=(1,-1)^T")}，且 ${texInline("f(v_1)=3")}、${texInline("f(v_2)=1")}。求 ${texInline("f")} 与 ${texInline("\\ker f")}。`,steps:[`${texInline("v_1,v_2")} 线性无关，构成一组基。`,`由 ${texInline("e_1=(v_1+v_2)/2")}、${texInline("e_2=(v_1-v_2)/2")}。`,`${texInline("f(e_1)=2")}、${texInline("f(e_2)=1")}。`,`所以 ${texInline("f(x_1,x_2)=2x_1+x_2")}。`,`令函数值为 0，得到 ${texInline("\\ker f:2x_1+x_2=0")}。`]},
      quiz:[
        {question:`为什么线性函数必有 ${texInline("f(0)=0")}？`,answer:`由 ${texInline("f(0)=f(0+0)=f(0)+f(0)")}。`},
        {question:`${texInline("\\{x:f(x)=2\\}")} 一定是子空间吗？`,answer:"不一定；它通常不含零向量，只是与核平行的仿射超平面。"},
        {question:`${texInline("g(x,y)=2x-y+1")} 是否线性？`,answer:`不是，因为 ${texInline("g(0,0)=1")}。`},
        {question:"行向量就是线性函数本身吗？",answer:"不是。行向量是选定基后的坐标记录，换基后会改变。"}
      ],
      summary:["核是零值方向组成的子空间，其他等值层与它平行。","基上的取值决定整个线性函数。","下一节把所有线性函数放在一起形成对偶空间。"]
    },
    {
      id:"dual-space",number:"§2",textbookSection:"对偶空间",title:"对偶空间",navTitle:"对偶空间",
      question:"如果向量空间包含所有可被测量的向量，那么所有线性测量方法放在一起会形成什么空间？",
      goal:"理解对偶空间、自然配对、对偶基、双对偶与对偶映射，并避免把对偶向量画成原空间中的另一支普通箭头。",
      tags:["对偶空间","对偶基","对偶映射"],
      intro:"向量属于原空间，线性函数属于对偶空间。二者通过自然配对产生标量。对偶基是一组坐标读取器：它们不提供新的方向，而是读取向量沿原基各方向的坐标。",
      concepts:[
        {label:"对偶空间",text:`${texInline("V^*=\\operatorname{Hom}(V,F)")}，元素是线性函数。`},
        {label:"自然配对",text:`${texInline("\\langle f,x\\rangle=f(x)")} 对两个输入槽分别线性。`},
        {label:"对偶基",text:`${texInline("e^i(e_j)=\\delta_{ij}")}，每个 ${texInline("e^i")} 读取一个坐标。`},
        {label:"对偶映射",text:`若 ${texInline("T:V\\to W")}，则 ${texInline("T^*:W^*\\to V^*")} 且 ${texInline("T^*(g)=g\\circ T")}。`}
      ],
      interactive:{type:"dual-probe",title:"对偶探针板：向量和测量方法分别生活在哪里",description:"左侧改变向量，右侧改变线性函数，并切换标准基、斜基与共线边界。",task:"固定函数缩放向量，再固定向量缩放函数。切换斜基并比较坐标；最后让基向量共线，观察对偶基为何消失。",prompts:["V* 中的一点代表一个线性函数。","对偶基通过 Kronecker 配对读取坐标。","基接近共线时读取器会变得敏感，精确共线时不再存在。"]},
      theory:[
        {number:"01",title:"线性函数也能相加和缩放",text:`逐点定义 ${texInline("(f+g)(x)")} 与 ${texInline("(\\lambda f)(x)")} 后仍是线性函数。`,formula:"(f+g)(x)=f(x)+g(x)"},
        {number:"02",title:"对偶基读取坐标",text:`若 ${texInline("x=\\sum_i x_i e_i")}，则 ${texInline("e^i(x)=x_i")}。`,formula:"e^i(e_j)=\\delta_{ij}"},
        {number:"03",title:"基矩阵的逆给出对偶基",text:`若 ${texInline("P=[v_1\\;\\cdots\\;v_n]")}，对偶基在标准坐标下组成 ${texInline("P^{-1}")} 的各行。`,formula:"[v^1;\\ldots;v^n]=P^{-1}"},
        {number:"04",title:"对偶映射方向反转",text:`先做 ${texInline("T")} 再由 ${texInline("g")} 测量，压缩为 ${texInline("g\\circ T")}，因此箭头从 ${texInline("W^*")} 指回 ${texInline("V^*")}。`,formula:"T^*(g)(x)=g(Tx)"}
      ],
      example:{title:"求非标准基的对偶基",question:`令 ${texInline("v_1=(1,1)^T")}、${texInline("v_2=(2,1)^T")}。求对偶基 ${texInline("v^1,v^2")}。`,steps:[`设 ${texInline("v^1=[a\\;b]")}，由 ${texInline("a+b=1,2a+b=0")} 得 ${texInline("v^1=[-1\\;2]")}。`,`设 ${texInline("v^2=[c\\;d]")}，由 ${texInline("c+d=0,2c+d=1")} 得 ${texInline("v^2=[1\\;-1]")}。`,`基矩阵 ${texInline("P=\\begin{bmatrix}1&2\\\\1&1\\end{bmatrix}")} 的逆正是两条对偶基行向量。`,`验证 ${texInline("v^i(v_j)=\\delta_{ij}")}。`]},
      quiz:[
        {question:`${texInline("f:V\\to F")} 线性时属于哪里？`,answer:`属于 ${texInline("V^*")}。`},
        {question:"为什么对偶基能读取坐标？",answer:`把 ${texInline("x=\\sum_jx_je_j")} 代入并使用 ${texInline("e^i(e_j)=\\delta_{ij}")}。`},
        {question:"对偶映射为何反向？",answer:"W 上的测量与 T 复合后成为 V 上的测量。"},
        {question:`有限维时能否直接写 ${texInline("V=V^*")}？`,answer:"不能；维数相同只保证存在同构，没有额外结构时没有自然等同。"}
      ],
      summary:["对偶空间由所有线性函数组成。","对偶基是坐标读取器，基矩阵的逆决定它们。","对偶映射通过复合把测量拉回。"]
    },
    {
      id:"bilinear-form",number:"§3",textbookSection:"双线性函数",title:"双线性函数",navTitle:"双线性函数",
      question:"当函数同时接收两个向量，并且对每个输入槽都保持线性时，矩阵到底记录了什么？",
      goal:"理解两个输入槽、矩阵配对表、合同变换、对称与交错分解、退化根空间以及与二次型的关系。",
      tags:["双线性函数","配对矩阵","合同变换"],
      intro:"固定一个输入槽，双线性函数就变成另一个空间上的线性函数。选定基后，矩阵第 i 行第 j 列记录第 i 个左基向量与第 j 个右基向量的配对值。",
      concepts:[
        {label:"分别线性",text:`${texInline("B:V\\times W\\to F")} 对两个槽分别线性。`},
        {label:"矩阵表示",text:`${texInline("B(x,y)=x^TAy")}，且 ${texInline("a_{ij}=B(e_i,f_j)")}。`},
        {label:"合同变换",text:`同一空间同时换基时 ${texInline("A'=P^TAP")}。`},
        {label:"退化与二次型",text:`退化表示存在非零隐身方向；${texInline("Q(x)=B(x,x)")} 只保留对称部分。`}
      ],
      interactive:{type:"bilinear-mixer",title:"双线性混合器：两个输入槽怎样共同产生一个标量",description:"调节两个向量与矩阵，比较 B(x,y)、B(y,x)、固定一槽后的等值线与退化方向。",task:"依次选择对称、交错、一般与退化预设。交换 x、y 比较读数；在退化状态点击“显示左根方向”。",prompts:["固定一槽后，另一槽中的变化必须线性。","矩阵元素对应基向量两两配对。","二次型看不见斜对称部分。"]},
      theory:[
        {number:"01",title:"两个槽分别线性",text:`固定 ${texInline("y")} 后，${texInline("x\\mapsto B(x,y)")} 是线性函数；固定 ${texInline("x")} 也一样。`,formula:"B(x_1+x_2,y)=B(x_1,y)+B(x_2,y)"},
        {number:"02",title:"矩阵是基配对表",text:`展开两个输入后，所有 ${texInline("B(e_i,f_j)")} 按坐标系数汇总。`,formula:"B(x,y)=\\sum_{i,j}x_i a_{ij}y_j"},
        {number:"03",title:"换基产生合同",text:"两个输入坐标同时变化，一侧产生转置因子；合同与线性算子的相似变换保护不同对象。",formula:"A'=P^TAP"},
        {number:"04",title:"退化意味着有隐身方向",text:`若非零 ${texInline("x")} 对所有 ${texInline("y")} 都满足 ${texInline("B(x,y)=0")}，则它属于左根。`,formula:"\\operatorname{Rad}_L(B)=\\{x:B(x,y)=0,\\forall y\\}"},
        {number:"05",title:"二次型只保留对称层",text:"在特征不为 2 时，斜对称部分代入同一向量两次的贡献恒为 0。",formula:"x^TAx=x^T\\frac{A+A^T}{2}x"}
      ],
      example:{title:"从基配对值写矩阵并判断结构",question:`已知 ${texInline("B(e_1,e_1)=2,B(e_1,e_2)=1,B(e_2,e_1)=-1,B(e_2,e_2)=3")}。计算 ${texInline("B((1,2)^T,(3,-1)^T)")} 并判断退化性。`,steps:[`配对表给出 ${texInline("A=\\begin{bmatrix}2&1\\\\-1&3\\end{bmatrix}")}。`,`先算 ${texInline("Ay=(5,-6)^T")}。`,`再算 ${texInline("x^TAy=5-12=-7")}。`,`矩阵既不对称也不交错。`,`${texInline("\\det A=7\\ne0")}，所以非退化。`]},
      quiz:[
        {question:"双线性等于对向量对整体线性吗？",answer:"不等于；它要求分别固定一个槽后，对另一个槽线性。"},
        {question:`${texInline("a_{ij}")} 表示什么？`,answer:`${texInline("a_{ij}=B(e_i,f_j)")}。`},
        {question:"为什么换基公式不是相似变换？",answer:"因为两个输入坐标都变化，得到 PᵀAP。"},
        {question:`若 ${texInline("A^T=-A")}，${texInline("B(x,x)")} 是多少？`,answer:"在特征不为 2 时恒为 0。"}
      ],
      summary:["双线性函数对两个输入槽分别线性。","矩阵记录基向量两两配对，换基按合同变化。","辛形式从交错且非退化的双线性函数中产生。"]
    },
    {
      id:"symplectic-space",number:"＊§4",textbookSection:"辛空间",title:"辛空间",navTitle:"辛空间",
      question:"如果双线性结构不测长度和角度，而测量成对方向之间的有向面积，它需要满足什么条件？",
      goal:"从二维有向面积进入交错与非退化，理解标准辛矩阵、偶数维、辛基与辛变换，并区分辛保持、正交保持和体积保持。",
      tags:["辛形式","有向面积","辛变换"],
      intro:"二维标准坐标中，辛配对就是两个向量张成的有向面积。交换顺序会变号，共线时面积为零。真正的辛形式还必须非退化：任何非零方向都能找到一个搭档产生非零配对。",
      concepts:[
        {label:"交错",text:`${texInline("\\omega(x,x)=0")}；特征不为 2 时等价于反对称。`},
        {label:"非退化",text:`若 ${texInline("\\omega(x,y)=0")} 对所有 ${texInline("y")} 成立，则 ${texInline("x=0")}。`},
        {label:"标准矩阵",text:`采用 ${texInline("J=\\begin{bmatrix}0&I\\\\-I&0\\end{bmatrix}")} 与 ${texInline("\\omega(x,y)=x^TJy")}。`},
        {label:"辛变换",text:`${texInline("S^TJS=J")}；非退化交错矩阵只存在于偶数阶。`}
      ],
      interactive:{type:"symplectic-area",title:"辛面积实验室：什么被保持，什么可以改变",description:"比较剪切、互补缩放、旋转和均匀缩放对有向面积与辛配对的影响。",task:"先交换 x 与 y，再令两向量共线。随后应用剪切、互补缩放与均匀缩放，比较变换前后的配对。",prompts:["交换顺序使符号反转。","非退化要求每个非零向量都有可见搭档。","二维 det S=1 与辛等价；高维并非如此。"]},
      theory:[
        {number:"01",title:"二维辛配对就是有向面积",text:`采用 ${texInline("J=\\begin{bmatrix}0&1\\\\-1&0\\end{bmatrix}")} 后，${texInline("x^TJy")} 等于 ${texInline("\\det[x\\;y]")}。`,formula:"\\omega(x,y)=\\det[x\\;y]"},
        {number:"02",title:"交错与非退化回答不同问题",text:"交错控制交换与自配对；非退化排除与所有搭档都配对为 0 的非零方向。",formula:"\\omega(x,x)=0,\\qquad\\ker J=\\{0\\}"},
        {number:"03",title:"维数必须为偶数",text:"奇数阶斜对称矩阵行列式必为 0，无法非退化；几何上方向按面积单元成对组织。",formula:"\\det A=(-1)^n\\det A"},
        {number:"04",title:"辛变换保持配对而非长度",text:"剪切与互补缩放可以强烈改变长度和角度，却仍保持所有辛配对。",formula:"S^TJS=J"}
      ],
      example:{title:"判断三类二维变换是否辛",question:`比较剪切 ${texInline("S_1=\\begin{bmatrix}1&t\\\\0&1\\end{bmatrix}")}、互补缩放 ${texInline("S_2=\\begin{bmatrix}s&0\\\\0&1/s\\end{bmatrix}")} 与均匀缩放 ${texInline("S_3=sI")}。`,steps:[`${texInline("S_1^TJS_1=J")}，剪切辛。`,`${texInline("S_2^TJS_2=J")}，互补缩放辛。`,`${texInline("S_3^TJS_3=s^2J")}。`,`所以均匀缩放只有在 ${texInline("s^2=1")} 时辛。`,`二维可用 ${texInline("S^TJS=(\\det S)J")} 快速判断，这一简化不能直接推广到高维。`]},
      quiz:[
        {question:`为什么 ${texInline("\\omega(x,x)=0")} 不推出 ${texInline("x=0")}？`,answer:"交错形式对每个向量自配对都为 0；非退化考察它与所有其他向量的配对。"},
        {question:"共线配对为 0 是否说明形式退化？",answer:"不说明；退化要求某个非零向量与所有向量都配对为 0。"},
        {question:"辛变换判据是什么？",answer:`${texInline("S^TJS=J")}。`},
        {question:"高维 det S=1 是否足以保证辛？",answer:"不足；它只保证总体积，辛条件要求每一对辛配对都保持。"}
      ],
      summary:["辛形式是交错且非退化的双线性函数。","二维标准模型是有向面积，方向按二维单元成对组织。","辛变换保持 xᵀJy，不必保持长度和角度。"]
    }
  ]
});