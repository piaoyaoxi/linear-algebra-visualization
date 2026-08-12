(() => {
  const text = (...parts) => parts.join("");
  const sources = (reference, items) => ({ reference, page: "", items });

  registerAlgebraChapter({
    id: "ch7",
    icon: "7",
    title: "第七章 线性变换",
    subtitle: "从作用到结构",
    summary:
      "本章围绕一个问题展开：能否选择一组基，使线性变换变得尽可能简单？前三节建立线性变换、运算和矩阵表示；第四、五节寻找特征方向并完成对角化；第六至九节研究信息损失、不变子空间、Jordan 链和最小多项式，从而读出不能完全对角化时仍然保留的结构。",
    sections: [
      {
        id: "linear-map-definition",
        number: "§1",
        textbookSection: "线性变换的定义",
        title: "线性变换的定义",
        navTitle: "线性变换的定义",
        question: "若只知道一个变换在少数向量上的作用，什么时候能推知它在整个空间上的作用？",
        goal:
          "能用保持线性组合的条件检验映射；能区分定义域与陪域；能证明线性变换的基本性质，并用一组基的像唯一确定整个变换。",
        tags: ["保持线性组合", "定义域与陪域", "基决定变换"],
        intro:
          "剪切、投影、平移和折叠都能改变图形。线性变换只允许一种高度受约束的改变：输入怎样由向量组合而成，输出就必须用完全相同的系数组合而成。这个条件把无限多个输入压缩成一组基上的有限信息。",
        concepts: [
          {
            label: "线性变换",
            text: text(
              "设 V、W 是同一数域上的线性空间。映射 ",
              texInline("T:V\\to W"),
              " 若对任意 ",
              texInline("u,v\\in V"),
              " 和标量 ",
              texInline("\\alpha,\\beta"),
              " 都满足 ",
              texInline("T(\\alpha u+\\beta v)=\\alpha T(u)+\\beta T(v)"),
              "，则称 T 为线性变换。",
            ),
          },
          {
            label: "结构后果",
            text: text(
              "线性条件立刻给出 ",
              texInline("T(0)=0"),
              "、",
              texInline("T(-v)=-T(v)"),
              "，并推广到任意有限线性组合。",
            ),
          },
          {
            label: "基决定变换",
            text: text(
              "若 ",
              texInline("B=(b_1,\\ldots,b_n)"),
              " 是 V 的一组基，则 ",
              texInline("T(b_1),\\ldots,T(b_n)"),
              " 唯一确定 T 在每个向量上的取值。",
            ),
          },
          {
            label: "抽象空间中的例子",
            text: text(
              "多项式求导 ",
              texInline("D:P_2\\to P_1"),
              "、函数定积分和矩阵转置都保持线性组合；线性变换的对象可以是向量、函数、多项式或矩阵。",
            ),
          },
        ],
        formal: {
          heading: "保持组合，整个空间随之被确定",
          lead:
            "线性性描述的是运算结构。检验时要同时写清输入空间、输出空间和任意标量；一次偶然成立的等式不能代替对所有输入成立的定义。",
          blocks: [
            {
              title: "一个公式统一两条规则",
              body: text(
                "分别取 ",
                texInline("(\\alpha,\\beta)=(1,1)"),
                " 与 ",
                texInline("(\\alpha,\\beta)=(c,0)"),
                "，可从组合公式得到加法与数乘规则；反向连续使用这两条规则，也能恢复组合公式。",
              ),
            },
            {
              title: "零向量结论怎样推出",
              body: text(
                "由 ",
                texInline("T(0)=T(0+0)=T(0)+T(0)"),
                " 消去一项便得 ",
                texInline("T(0)=0"),
                "。这是一条必要条件；固定原点的映射仍可能破坏加法或数乘。",
              ),
            },
            {
              title: "基定理的存在与唯一",
              body: text(
                "任意 ",
                texInline("v\\in V"),
                " 唯一写成 ",
                texInline("v=a_1b_1+\\cdots+a_nb_n"),
                "。于是只能定义 ",
                texInline("T(v)=a_1T(b_1)+\\cdots+a_nT(b_n)"),
                "；坐标表示的唯一性同时保证这个定义没有歧义。",
              ),
            },
            {
              title: "求导算子展示坐标之外的线性",
              body: text(
                "在 ",
                texInline("P_2"),
                " 中，",
                texInline("D(a+bx+cx^2)=b+2cx"),
                "。常数项进入核，二次项降为一次项，然而每个系数仍按原来的线性组合传递。",
              ),
            },
            {
              title: "否定线性只需一个见证",
              body: text(
                "平移可由 ",
                texInline("T(0)\\ne0"),
                " 立即排除；折叠 ",
                texInline("(x,y)\\mapsto(|x|,y)"),
                " 可取负标量排除。证明线性必须覆盖任意输入，否定线性只需一个反例。",
              ),
            },
          ],
          formula:
            "T(a_1v_1+\\cdots+a_kv_k)=a_1T(v_1)+\\cdots+a_kT(v_k)",
          note:
            "图形保持直线、保持原点或公式看起来简单，都只是线索。完整证明必须回到保持任意线性组合。",
        },
        interactive: {
          type: "ch7-linearity",
          title: "线性检验台",
          description:
            "让同一个候选变换接受原点、加法和数乘三种检验，比较两条计算路径的终点。",
          task:
            "依次切换剪切、投影、平移和折叠四个预设；拖动 u、v 与负标量 α，为每个失败的映射找到一个可见反例。",
          prompts: [
            "剪切和投影都能通过两项线性检验，投影即使降低维数仍然可以线性。",
            "切到平移，先检查原点，再观察加法路径留下的缺口。",
            "切到折叠，把 α 取为负数，比较 T(αu) 与 αT(u)。",
          ],
        },
        textbook: sources(
          "Strang 8.1；Friedberg 2.1；Axler 3.A",
          ["保持线性组合的定义", "求导与函数空间例子", "基上的取值唯一决定线性映射", "核与值域的早期直觉"],
        ),
        example: {
          title: "例题：多项式空间中的四个映射",
          question: text(
            "考察 ",
            texInline("D:P_2\\to P_1,\\ D(p)=p'"),
            "、",
            texInline("E:P_2\\to\\mathbb R,\\ E(p)=p(1)"),
            "、",
            texInline("Q:P_2\\to P_4,\\ Q(p)=p^2"),
            " 与 ",
            texInline("F:P_2\\to P_1,\\ F(p)=p'+1"),
            "。哪些映射是线性的？",
          ),
          choices: [
            { text: "只有 D 线性，因为线性变换的输出必须仍是多项式。" },
            { text: "D、E 与 F 线性，因为求导和代入都是线性运算。" },
            { correct: true, text: "D 与 E 线性；Q 不保持数乘，F 不把零多项式送到零。" },
            { text: "四个映射都线性，因为每个映射都由确定公式给出。" },
          ],
          steps: [
            text(
              texInline("D(\\alpha p+\\beta q)=\\alpha p'+\\beta q'"),
              "，所以 ",
              texInline("D:P_2\\to P_1"),
              " 线性。",
            ),
            text(
              texInline("E(\\alpha p+\\beta q)=\\alpha p(1)+\\beta q(1)"),
              "，所以求值映射 ",
              texInline("E:P_2\\to\\mathbb R"),
              " 也线性。",
            ),
            text(
              texInline("Q(2p)=4p^2"),
              " 而 ",
              texInline("2Q(p)=2p^2"),
              "，数乘规则失败。",
            ),
            text(
              texInline("F(0)=1"),
              "，因此 F 立即被零向量条件排除。",
            ),
          ],
        },
        quiz: [
          {
            question: text(
              "映射 ",
              texInline("R(x,y)=(x^2,y)"),
              " 固定原点。它为什么仍然不线性？",
            ),
            answer: text(
              "例如 ",
              texInline("R(2,0)=(4,0)"),
              "，而 ",
              texInline("2R(1,0)=(2,0)"),
              "，数乘规则失败。",
            ),
          },
          {
            question: text(
              "已知 ",
              texInline("T(b_1)=w_1"),
              "、",
              texInline("T(b_2)=w_2"),
              "，求 ",
              texInline("T(3b_1-2b_2)"),
              "。",
            ),
            answer: texInline("3w_1-2w_2") + "。",
          },
          {
            question: "为什么两个线性变换只要在一组基上取值相同，就在整个空间上相同？",
            answer:
              "任意向量都唯一表示为基向量的线性组合；两个变换保持同一组系数，因此在任意向量上的像相同。",
          },
          {
            question: text(
              "从 ",
              texInline("\\mathbb R^3"),
              " 到 ",
              texInline("\\mathbb R^2"),
              " 的映射能否线性？",
            ),
            answer:
              "可以。定义只要求两个空间建立在同一数域上并保持线性组合，不要求维数相等。",
          },
          {
            question: "构造一个固定原点却不线性的二维映射。",
            answer: text(
              "例如 ",
              texInline("T(x,y)=(x^2,y)"),
              "。它满足 ",
              texInline("T(0)=0"),
              "，但不保持一般数乘。",
            ),
          },
        ],
        summary: [
          "线性变换把输入的线性组合原样翻译成输出的线性组合。",
          "定义域与陪域是映射的一部分；线性性不要求保持长度、角度或维数。",
          "一组基的像唯一决定整个线性变换。",
          "下一节把线性变换本身放进一个可加、可复合、可取多项式的代数系统。",
        ],
      },
      {
        id: "linear-map-operations",
        number: "§2",
        textbookSection: "线性变换的运算",
        title: "线性变换的运算",
        navTitle: "线性变换的运算",
        question: "线性变换怎样相加、接续和反向？反复作用又怎样产生算子的多项式？",
        goal:
          "能区分逐点加法与复合，先检查运算的空间类型；掌握恒等、零变换与逆变换；理解算子的幂和多项式为最小多项式埋下的基础。",
        tags: ["逐点运算", "复合与逆", "算子多项式"],
        intro:
          "把变换看成机器时，加法表示同一个输入同时进入两条支路，再把输出相加；复合表示输出继续进入下一台机器。对同一空间上的算子反复复合，还会出现 T²、T³ 和 p(T)，它们将在本章末尾记录算子的全局规律。",
        concepts: [
          {
            label: "变换空间",
            text: text(
              "固定 V、W 后，所有线性变换组成 ",
              texInline("\\mathcal L(V,W)"),
              "；其中 ",
              texInline("(aT+bS)(v)=aT(v)+bS(v)"),
              "。",
            ),
          },
          {
            label: "复合",
            text: text(
              "若 ",
              texInline("S:U\\to V"),
              "、",
              texInline("T:V\\to W"),
              "，则 ",
              texInline("(T\\circ S)(u)=T(S(u))"),
              "；空间匹配决定复合能否定义。",
            ),
          },
          {
            label: "单位与逆",
            text: text(
              texInline("0"),
              " 是加法单位，",
              texInline("I_V"),
              " 是复合单位。双射线性变换有唯一线性逆变换。",
            ),
          },
          {
            label: "算子的幂",
            text: text(
              "当 ",
              texInline("T:V\\to V"),
              " 时可定义 ",
              texInline("T^0=I,T^1=T,T^{k+1}=T\\circ T^k"),
              "，记录反复作用。",
            ),
          },
          {
            label: "算子多项式",
            text: text(
              "若 ",
              texInline("p(t)=a_0+a_1t+\\cdots+a_kt^k"),
              "，则 ",
              texInline("p(T)=a_0I+a_1T+\\cdots+a_kT^k"),
              "。",
            ),
          },
        ],
        formal: {
          heading: "先检查类型，再决定运算",
          lead:
            "加法要求两个变换拥有相同的定义域与陪域；复合要求前一变换的输出能作为后一变换的输入。类型检查能在计算前排除大量无意义的式子。",
          blocks: [
            {
              title: "逐点相加与接续执行",
              body: text(
                texInline("T+S"),
                " 在同一个输入上同时读取 T、S 的输出；",
                texInline("T\\circ S"),
                " 先改变输入，再把中间结果交给 T。两种运算对应完全不同的图和公式。",
              ),
            },
            {
              title: "复合结合而通常不交换",
              body: text(
                texInline("R\\circ(T\\circ S)=(R\\circ T)\\circ S"),
                "，因此可以省略括号；交换 T、S 会改变中间状态，",
                texInline("T\\circ S"),
                " 与 ",
                texInline("S\\circ T"),
                " 通常不同。",
              ),
            },
            {
              title: "可逆表示信息能够唯一恢复",
              body: text(
                "若每个输出都来自唯一输入，则 ",
                texInline("T^{-1}T=TT^{-1}=I"),
                "。先做 S 再做 T 后，撤销时必须先撤销 T，因此 ",
                texInline("(T\\circ S)^{-1}=S^{-1}\\circ T^{-1}"),
                "。",
              ),
            },
            {
              title: "投影展示一个低次多项式关系",
              body: text(
                "投影 P 满足 ",
                texInline("P^2=P"),
                "，于是 ",
                texInline("(P^2-P)=0"),
                "，也就是多项式 ",
                texInline("t^2-t"),
                " 代入 P 后得到零算子。",
              ),
            },
            {
              title: "同一算子的多项式彼此交换",
              body: text(
                "所有 ",
                texInline("p(T)"),
                " 都由 I 与 T 的幂线性组合而成，因此 ",
                texInline("p(T)q(T)=q(T)p(T)"),
                "。一般两个无关算子仍可能不交换。",
              ),
            },
          ],
          formula:
            "\\begin{aligned}(aT+bS)(v)&=aT(v)+bS(v),\\\\(T\\circ S)(v)&=T(S(v)),\\\\p(T)&=a_0I+a_1T+\\cdots+a_kT^k.\\end{aligned}",
          note:
            "记号 TS 在本章表示 T∘S，即右边的 S 先作用。每次计算前都应重新确认这个顺序。",
        },
        interactive: {
          type: "ch7-operator",
          title: "算子混合器",
          description:
            "让同一个轮廓依次经历两台机器，并在复合、逐点相加与尝试撤销三种模式间比较。",
          task:
            "先把作用进度拖到最右比较 TU 与 UT，再切换逐点相加和尝试撤销；用最终轮廓说明顺序、分支与信息损失的区别。",
          prompts: [
            "在旋转与剪切预设中比较两条轨道最右端，找出复合不交换的证据。",
            "在逐点相加模式中确认 T(x) 与 U(x) 来自同一个输入，没有先后顺序。",
            "在投影预设中尝试撤销，解释被压掉的方向为何无法恢复。",
          ],
        },
        textbook: sources(
          "Hoffman–Kunze 3.3；Axler 3.D；Strang 8.1",
          ["线性变换空间", "复合与逆", "同一空间上的算子代数", "算子幂与多项式"],
        ),
        example: {
          title: "例题：相加、复合与撤销顺序",
          question: text(
            "设 ",
            texInline("T(x,y)=(2x,y)"),
            "、",
            texInline("S(x,y)=(x+y,y)"),
            "。下列结论哪一项正确？",
          ),
          choices: [
            {
              text: text(
                texInline("T+S=TS"),
                "，因为两种写法都使用了 T 和 S。",
              ),
            },
            {
              correct: true,
              text: text(
                texInline("TS(x,y)=(2x+2y,y)"),
                "、",
                texInline("ST(x,y)=(2x+y,y)"),
                "，且 ",
                texInline("(TS)^{-1}=S^{-1}T^{-1}"),
                "。",
              ),
            },
            {
              text: text(
                texInline("TS=ST"),
                "，因为两个变换都线性且可逆。",
              ),
            },
            {
              text: text(
                texInline("(TS)^{-1}=T^{-1}S^{-1}"),
                "，撤销顺序与执行顺序相同。",
              ),
            },
          ],
          steps: [
            text(
              "先 S 后 T：",
              texInline("TS(x,y)=T(x+y,y)=(2x+2y,y)"),
              "。",
            ),
            text(
              "先 T 后 S：",
              texInline("ST(x,y)=S(2x,y)=(2x+y,y)"),
              "。",
            ),
            "两个结果的第一坐标不同，给出了复合不交换的明确见证。",
            text(
              "要撤销 TS，先用 ",
              texInline("T^{-1}"),
              " 撤回最后一步，再用 ",
              texInline("S^{-1}"),
              "，所以逆序公式成立。",
            ),
          ],
        },
        quiz: [
          {
            question: text(
              "若 ",
              texInline("S:\\mathbb R^2\\to\\mathbb R^3"),
              "、",
              texInline("T:\\mathbb R^3\\to\\mathbb R"),
              "，哪些复合必有定义？",
            ),
            answer: text(
              texInline("T\\circ S"),
              " 必有定义；",
              texInline("S\\circ T"),
              " 的输出与输入类型不匹配。",
            ),
          },
          {
            question: text(
              "投影 P 满足 ",
              texInline("P^2=P"),
              "。写出一个能湮灭 P 的多项式。",
            ),
            answer: text(
              texInline("p(t)=t^2-t=t(t-1)"),
              "，因为 ",
              texInline("p(P)=P^2-P=0"),
              "。",
            ),
          },
          {
            question: "为什么两个可逆变换的复合仍可逆？",
            answer: text(
              "可以直接验证 ",
              texInline("(T\\circ S)(S^{-1}\\circ T^{-1})=I"),
              " 和反向乘积也等于 I。",
            ),
          },
          {
            question: text(
              "是否总有 ",
              texInline("(T+S)^2=T^2+2TS+S^2"),
              "？",
            ),
            answer: text(
              "一般没有。展开得到 ",
              texInline("T^2+TS+ST+S^2"),
              "；只有 ",
              texInline("TS=ST"),
              " 时中间两项才能合并。",
            ),
          },
          {
            question: "为什么 p(T) 与 q(T) 一定交换？",
            answer:
              "它们都是同一个 T 的幂的线性组合，而 T 的任意两个幂满足 TᶦTʲ=Tᶦ⁺ʲ=TʲTᶦ。",
          },
        ],
        summary: [
          "变换之和并行计算同一输入，复合沿一条管线依次执行。",
          "复合满足结合律，通常不满足交换律；逆变换按相反顺序撤销。",
          "T 的幂描述反复作用，p(T) 把这些幂组合成新的算子。",
          "下一节选定输入基与输出基，把抽象运算翻译成矩阵运算。",
        ],
      },
      {
        id: "matrix-of-linear-map",
        number: "§3",
        textbookSection: "线性变换的矩阵",
        title: "线性变换的矩阵",
        navTitle: "线性变换的矩阵",
        question: "一张矩阵究竟记录了线性变换的哪些信息？换基时哪些对象改变，哪些对象保持不动？",
        goal:
          "能从域基向量的像逐列构造表示矩阵；掌握坐标方程与复合公式；区分一般双基表示和同一空间上的相似变换。",
        tags: ["基向量的像", "双基表示", "相似变换"],
        intro:
          "线性变换存在于向量空间之间，矩阵是选定坐标后的记录。输入基决定矩阵有几列，输出基决定每一列使用什么坐标语言；换基会改变数字记录，空间中的向量和变换本身仍保持不动。",
        concepts: [
          {
            label: "双基表示",
            text: text(
              "给定 V 的基 ",
              texInline("B=(b_1,\\ldots,b_n)"),
              " 与 W 的基 C，矩阵 ",
              texInline("[T]_{C\\leftarrow B}"),
              " 的第 j 列是 ",
              texInline("[T(b_j)]_C"),
              "。",
            ),
          },
          {
            label: "坐标方程",
            text: text(
              texInline("[T(v)]_C=[T]_{C\\leftarrow B}[v]_B"),
              " 把抽象的 T 翻译成坐标列上的矩阵乘法。",
            ),
          },
          {
            label: "矩阵尺寸",
            text: text(
              "若 ",
              texInline("\\dim V=n"),
              "、",
              texInline("\\dim W=m"),
              "，则表示矩阵为 ",
              texInline("m\\times n"),
              "；列数来自输入，行数来自输出。",
            ),
          },
          {
            label: "复合对应乘法",
            text: text(
              "在中间空间使用同一组基时，",
              texInline("[T\\circ S]=[T][S]"),
              "，右侧矩阵乘法保留了先 S 后 T 的顺序。",
            ),
          },
          {
            label: "相似",
            text: text(
              "对算子 ",
              texInline("T:V\\to V"),
              "，若 P 把新基坐标转成旧基坐标，则 ",
              texInline("[T]_{B'}=P^{-1}[T]_B P"),
              "。",
            ),
          },
        ],
        formal: {
          heading: "矩阵的每一列都有明确来历",
          lead:
            "逐列构造法比元素公式更可靠：取一个输入基向量，作用 T，再用输出基读出坐标。完成所有基向量后，线性性会自动重建任意输入的像。",
          blocks: [
            {
              title: "逐列公式来自线性性",
              body: text(
                "若 ",
                texInline("v=x_1b_1+\\cdots+x_nb_n"),
                "，则 ",
                texInline("T(v)=x_1T(b_1)+\\cdots+x_nT(b_n)"),
                "。输出坐标正是矩阵各列按 ",
                texInline("x_1,\\ldots,x_n"),
                " 的线性组合。",
              ),
            },
            {
              title: "求导算子的矩阵可以是长方形",
              body: text(
                "对 ",
                texInline("D:P_2\\to P_1"),
                "，取输入基 ",
                texInline("(1,x,x^2/2)"),
                " 与输出基 ",
                texInline("(1,x)"),
                "。三列依次是 ",
                texInline("(0,0)^T,(1,0)^T,(0,1)^T"),
                "，所以矩阵为 ",
                texInline("2\\times3"),
                "。",
              ),
            },
            {
              title: "复合公式保存机器顺序",
              body: text(
                "若 S 把 U 送入 V，T 把 V 送入 W，并在 V 中采用同一组中间基，则 ",
                texInline("[T(Su)]_C=[T]_{C\\leftarrow B}[S]_{B\\leftarrow A}[u]_A"),
                "。",
              ),
            },
            {
              title: "换基是两次翻译",
              body: text(
                texInline("P"),
                " 先把新坐标翻译成旧坐标，旧矩阵执行 T，",
                texInline("P^{-1}"),
                " 再把输出翻译回新坐标，形成 ",
                texInline("P^{-1}AP"),
                "。",
              ),
            },
            {
              title: "相似只适用于同一个算子的两种记录",
              body:
                "一般 V→W 的表示需要两组独立的基，矩阵可能不是方阵。相似变换要求定义域与陪域是同一个空间，并在输入、输出两端同步更换同一组基。",
            },
          ],
          formula:
            "[T(v)]_C=[T]_{C\\leftarrow B}[v]_B,\\qquad [T]_{B'}=P^{-1}[T]_B P",
          note:
            "本章约定 P 的列是新基向量在旧基下的坐标，因此 P 把新坐标变成旧坐标。若采用相反约定，相似公式中的 P 与 P⁻¹ 会交换位置。",
        },
        interactive: {
          type: "ch7-basis",
          title: "换基翻译器",
          description:
            "拖动两根列向量，观察整张输出网格如何被它们撑开；再用同一组系数重建 T(x)，最后比较三组基下的矩阵记录。",
          task:
            "依次完成“拖动两列、重建 T(x)、同一变换换基”三个观察；每一步都指出矩阵数字对应图中的哪个对象。",
          prompts: [
            "拖动 T(e₁)、T(e₂)，确认矩阵两列与整张网格同步改变。",
            "给定 α、β，用 αT(e₁)+βT(e₂) 重建 T(αe₁+βe₂)。",
            "切换标准基、斜基和特征基，确认真实的 x 与 T(x) 不动；特征基作为下一节的预告。",
          ],
        },
        textbook: sources(
          "Strang 8.2–8.3；Lay 1.9；Friedberg 2.2",
          ["矩阵列来自基向量的像", "输入基与输出基", "最佳基的动机", "换基与相似"],
        ),
        example: {
          title: "例题：为求导算子逐列构造矩阵",
          question: text(
            "令 ",
            texInline("D:P_2\\to P_1"),
            " 为求导，输入基 ",
            texInline("B=(1,x,x^2/2)"),
            "，输出基 ",
            texInline("C=(1,x)"),
            "。矩阵 ",
            texInline("[D]_{C\\leftarrow B}"),
            " 是哪一个？",
          ),
          choices: [
            { text: texInline("\\begin{bmatrix}0&0\\\\1&1\\end{bmatrix}") },
            { text: texInline("\\begin{bmatrix}0&1\\\\0&0\\end{bmatrix}") },
            { text: texInline("\\begin{bmatrix}0&0&1\\\\0&1&0\\end{bmatrix}") },
            { correct: true, text: texInline("\\begin{bmatrix}0&1&0\\\\0&0&1\\end{bmatrix}") },
          ],
          steps: [
            text(
              texInline("D(1)=0"),
              "，在 C 下坐标为 ",
              texInline("(0,0)^T"),
              "。",
            ),
            text(
              texInline("D(x)=1"),
              "，第二列为 ",
              texInline("(1,0)^T"),
              "。",
            ),
            text(
              texInline("D(x^2/2)=x"),
              "，第三列为 ",
              texInline("(0,1)^T"),
              "。",
            ),
            "按输入基的顺序排列三列，即得一个 2×3 矩阵。",
          ],
        },
        quiz: [
          {
            question: "表示矩阵的第 j 列怎样得到？",
            answer:
              "把第 j 个输入基向量送入 T，再用输出基表示它的像，所得坐标列就是第 j 列。",
          },
          {
            question: text(
              "一个 ",
              texInline("4"),
              " 维空间到 ",
              texInline("3"),
              " 维空间的线性变换用多大矩阵表示？",
            ),
            answer: texInline("3\\times4") + "，行数来自输出维数，列数来自输入维数。",
          },
          {
            question: text(
              "若 ",
              texInline("[S]"),
              " 与 ",
              texInline("[T]"),
              " 的基选择匹配，",
              texInline("[T\\circ S]"),
              " 等于什么？",
            ),
            answer: texInline("[T][S]") + "；右侧的 S 仍然先作用。",
          },
          {
            question: "换基时，空间中的向量和线性变换是否发生改变？",
            answer:
              "没有。改变的是向量坐标、坐标网格与表示矩阵；真实向量及 T 对它的作用保持不动。",
          },
          {
            question: text(
              "解释为什么 ",
              texInline("P^{-1}AP"),
              " 与 A 表示同一个算子。",
            ),
            answer:
              "P 把新坐标翻译为旧坐标，A 在旧坐标中执行算子，P⁻¹ 再把输出翻译回新坐标；三步只更换记录语言。",
          },
        ],
        summary: [
          "矩阵第 j 列是第 j 个输入基向量的像在输出基下的坐标。",
          "一般线性变换需要输入、输出两组基，并可由长方形矩阵表示。",
          "复合对应矩阵乘法；同一算子同步换基产生相似矩阵。",
          "下一节寻找能让作用最简单的一维方向：特征方向。",
        ],
      },
      {
        id: "eigenvalues-eigenvectors",
        number: "§4",
        textbookSection: "特征值与特征向量",
        title: "特征值与特征向量",
        navTitle: "特征值与特征向量",
        question: "反复施加同一个算子时，哪些方向始终不会偏转？",
        goal:
          "从反复作用理解特征向量的意义；掌握特征空间与特征方程；能证明不同特征值的特征向量线性无关，并区分代数重数与几何重数。",
        tags: ["不偏转方向", "特征空间", "反复作用"],
        intro:
          "一般向量在 T、T²、T³ 的反复作用下会不断混合方向。若某条直线始终只被伸缩，整个动力过程就在这条直线上化成一个标量序列。特征向量正是这种最简单的长期运动模式。",
        concepts: [
          {
            label: "特征向量",
            text: text(
              "非零向量 ",
              texInline("v"),
              " 若满足 ",
              texInline("T(v)=\\lambda v"),
              "，则 v 是特征向量，λ 是对应特征值。",
            ),
          },
          {
            label: "特征空间",
            text: text(
              texInline("E_\\lambda=\\ker(T-\\lambda I)"),
              " 包含特征值 λ 的全部特征向量和零向量。",
            ),
          },
          {
            label: "特征方程",
            text: text(
              "在有限维坐标中，非零解存在等价于 ",
              texInline("\\det(\\lambda I-A)=0"),
              "；本章取 ",
              texInline("\\chi_A(t)=\\det(tI-A)"),
              "。",
            ),
          },
          {
            label: "反复作用",
            text: text(
              "若 ",
              texInline("Tv=\\lambda v"),
              "，则 ",
              texInline("T^kv=\\lambda^kv"),
              "，长期增长、衰减、反向或归零都由 λ 控制。",
            ),
          },
          {
            label: "数域依赖",
            text: text(
              "实平面上的 ",
              texInline("90^\\circ"),
              " 旋转没有实特征方向；扩充到复数域后会出现特征值 ",
              texInline("\\pm i"),
              "。",
            ),
          },
        ],
        formal: {
          heading: "先找不偏转方向，再读取伸缩因子",
          lead:
            "几何上先判断 Av 是否仍落在 span(v) 上；代数上再求比例 λ。这个顺序能把特征向量和普通方向清楚地区分开。",
          blocks: [
            {
              title: "为什么反复作用引出特征向量",
              body: text(
                "在特征方向上，",
                texInline("A^kv=\\lambda^kv"),
                "，无需反复进行矩阵乘法。差分方程、稳定状态和矩阵高次幂都因此转化为标量幂。",
              ),
            },
            {
              title: "特征直线是一维不变子空间",
              body: text(
                texInline("Av=\\lambda v"),
                " 表示整条 ",
                texInline("\\operatorname{span}(v)"),
                " 经 A 作用后仍留在自身内部；λ<0 时箭头反向，直线仍保持。",
              ),
            },
            {
              title: "从几何条件到齐次方程",
              body: text(
                texInline("Av=\\lambda v"),
                " 等价于 ",
                texInline("(A-\\lambda I)v=0"),
                "。要出现非零解，矩阵必须不可逆，因此行列式为零。",
              ),
            },
            {
              title: "不同特征值带来独立方向",
              body: text(
                "若 ",
                texInline("v_1,\\ldots,v_r"),
                " 对应互异特征值，可对最短线性关系同时作用 T，再减去一个特征值倍数的原关系，逐步消去向量，得到它们线性无关。",
              ),
            },
            {
              title: "重数记录两种不同信息",
              body: text(
                "λ 在 ",
                texInline("\\chi_A"),
                " 中的重数是代数重数；",
                texInline("\\dim E_\\lambda"),
                " 是几何重数。总有 ",
                texInline("1\\le\\dim E_\\lambda\\le"),
                " 代数重数。",
              ),
            },
          ],
          formula:
            "Av=\\lambda v,\\qquad E_\\lambda=\\ker(A-\\lambda I),\\qquad A^kv=\\lambda^kv",
          note:
            "零向量满足 Av=λv 的每一个方程，却不能确定方向或伸缩比，因此特征向量定义明确要求 v≠0。",
        },
        interactive: {
          type: "ch7-eigen",
          title: "特征方向扫描器",
          description:
            "旋转候选向量，先观察 v 与 Av 的夹角；夹角归零后，再读取沿同一直线的伸缩比 λ。",
          task:
            "依次检查对称拉伸、剪切、反射和 90° 旋转；为每个预设判断实特征方向有几条，并解释负特征值为何仍算共线。",
          prompts: [
            "在对称拉伸中寻找两条互相垂直的特征直线。",
            "在剪切中确认只有一条特征直线，其余方向都留下偏转角。",
            "在反射中比较 λ=1 与 λ=-1；最后观察 90° 旋转为何没有实特征方向。",
          ],
        },
        textbook: sources(
          "Strang 6.1；Lay 5.1；Axler 5.A",
          ["由 A 的幂引出特征向量", "不偏转方向的几何解释", "特征空间", "数域与三角矩阵"],
        ),
        example: {
          title: "例题：用特征方向计算反复作用",
          question: text(
            "设 ",
            texInline("A=\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}"),
            "，",
            texInline("x=(3,1)^T"),
            "。下列关于 ",
            texInline("A^kx"),
            " 的表达哪一项正确？",
          ),
          choices: [
            {
              correct: true,
              text: texInline("A^kx=2\\cdot3^k(1,1)^T+(1,-1)^T"),
            },
            {
              text: texInline("A^kx=3^k(3,1)^T"),
            },
            {
              text: texInline("A^kx=2^k(1,1)^T+(1,-1)^T"),
            },
            {
              text: texInline("A^kx=3^k(1,1)^T+2^k(1,-1)^T"),
            },
          ],
          steps: [
            text(
              texInline("v_1=(1,1)^T"),
              "、",
              texInline("v_2=(1,-1)^T"),
              " 分别对应特征值 3 与 1。",
            ),
            text(
              "解 ",
              texInline("x=c_1v_1+c_2v_2"),
              "，得到 ",
              texInline("x=2v_1+v_2"),
              "。",
            ),
            text(
              texInline("A^kx=2A^kv_1+A^kv_2=2\\cdot3^kv_1+1^kv_2"),
              "。",
            ),
            "矩阵的反复作用已经化成两个彼此独立的标量幂。",
          ],
        },
        quiz: [
          {
            question: "为什么零向量不能称为特征向量？",
            answer:
              "零向量对任意 λ 都满足 T(0)=λ0，无法确定一个方向或对应特征值。",
          },
          {
            question: text(
              "若 ",
              texInline("Tv=-2v"),
              "，",
              texInline("T^5v"),
              " 等于什么？",
            ),
            answer: texInline("-32v") + "。",
          },
          {
            question: "实平面上的 90° 旋转为什么没有实特征向量？",
            answer:
              "每个非零实向量都被转到与原方向垂直的方向，不可能与原向量共线。",
          },
          {
            question: "概述不同特征值对应的特征向量线性无关的证明思路。",
            answer:
              "从一个最短线性关系出发，作用 T 后减去某个特征值乘原关系，消去一个向量；最短性迫使其余系数全为零，再得到被消去向量的系数也为零。",
          },
          {
            question: "代数重数为 3 的特征值，其特征空间维数可能是多少？",
            answer:
              "可能是 1、2 或 3。达到 3 时该特征值对应的方向足够多；小于 3 时存在特征向量缺口。",
          },
        ],
        summary: [
          "特征向量给出算子作用下不偏转的一维方向。",
          "在特征方向上，T 的高次幂退化为 λ 的高次幂。",
          "不同特征值提供线性无关的特征方向；重复特征值需要进一步检查特征空间维数。",
          "下一节判断这些方向能否凑成整个空间的一组基。",
        ],
      },
      {
        id: "diagonal-matrices",
        number: "§5",
        textbookSection: "对角矩阵",
        title: "对角矩阵",
        navTitle: "对角矩阵",
        question: "什么时候能找到一组基，使算子的各个坐标分量完全独立地伸缩？",
        goal:
          "理解可对角化的等价条件；能用特征空间维数判断是否有足够特征向量；掌握 A=PDP⁻¹ 及矩阵幂的计算意义。",
        tags: ["特征向量基", "相似对角化", "矩阵幂"],
        intro:
          "对角矩阵让每个坐标独立演化。对一般算子，核心问题有两个：是否存在一组特征向量基；若存在，怎样把这些向量排成换基矩阵。对角化把寻找好坐标与简化计算合在同一个过程里。",
        concepts: [
          {
            label: "可对角化",
            text: text(
              "若存在可逆矩阵 P 与对角矩阵 D，使 ",
              texInline("A=PDP^{-1}"),
              "，则 A 可对角化。",
            ),
          },
          {
            label: "特征向量基",
            text:
              "A 可对角化，当且仅当空间存在一组由 A 的特征向量组成的基。",
          },
          {
            label: "特征空间判据",
            text: text(
              "若特征多项式分裂，则可对角化等价于各特征空间维数之和为 ",
              texInline("n"),
              "，也等价于每个特征值的几何重数等于代数重数。",
            ),
          },
          {
            label: "直接和",
            text: text(
              "不同特征空间的和是直接和；对角化表示 ",
              texInline("V=E_{\\lambda_1}\\oplus\\cdots\\oplus E_{\\lambda_r}"),
              "。",
            ),
          },
          {
            label: "计算收益",
            text: text(
              texInline("A^k=PD^kP^{-1}"),
              "，并且更一般地 ",
              texInline("p(A)=Pp(D)P^{-1}"),
              "。",
            ),
          },
        ],
        formal: {
          heading: "对角化就是寻找一组互不耦合的坐标",
          lead:
            "P 的列向量给出新基，D 的对角元给出这些基向量各自的特征值。可逆性保证这些方向既独立又张成整个空间。",
          blocks: [
            {
              title: "等价定理的正向证明",
              body: text(
                "若 ",
                texInline("A=PDP^{-1}"),
                "，则 ",
                texInline("AP=PD"),
                "。按列比较可知 P 的第 j 列满足 ",
                texInline("Av_j=\\lambda_jv_j"),
                "；P 可逆，所以这些列构成特征向量基。",
              ),
            },
            {
              title: "等价定理的反向证明",
              body: text(
                "若 ",
                texInline("v_1,\\ldots,v_n"),
                " 是特征向量基，把它们作为 P 的列，并把对应特征值放到 D 的对角线上，就有 ",
                texInline("AP=PD"),
                "，从而 ",
                texInline("A=PDP^{-1}"),
                "。",
              ),
            },
            {
              title: "重复特征值不会自动导致失败",
              body: text(
                texInline("2I"),
                " 只有一个不同特征值，却有整个空间那么多特征向量；",
                texInline("J_2(2)"),
                " 的特征空间只有一维。决定因素是独立特征向量的数量。",
              ),
            },
            {
              title: "互异特征值给出一个充分条件",
              body: text(
                "n 维空间中的 n 个互异特征值产生 n 个线性无关特征向量，因此算子必可对角化。这是充分条件，并非必要条件。",
              ),
            },
            {
              title: "矩阵幂体现对角化的价值",
              body: text(
                "对角矩阵求幂只需分别计算 ",
                texInline("\\lambda_1^k,\\ldots,\\lambda_n^k"),
                "。这使长期动力、递推关系和矩阵函数都可按特征方向独立处理。",
              ),
            },
          ],
          formula:
            "A=PDP^{-1}\\quad\\Longleftrightarrow\\quad V=E_{\\lambda_1}\\oplus\\cdots\\oplus E_{\\lambda_r}",
          note:
            "P 的列顺序必须与 D 的对角元顺序一致。交换两列同时交换相应对角元，得到的仍是同一次对角化。",
        },
        interactive: {
          type: "ch7-diagonal",
          title: "特征坐标分解器",
          description:
            "在真实空间与特征坐标之间追踪同一个向量，依次完成读坐标、独立缩放和重新合成。",
          task:
            "比较正交特征基、斜特征基与 Jordan 块；拖动 x 和过程滑杆，说明正交性为何不是对角化的必要条件，以及缺少一个方向时流程在哪里停止。",
          prompts: [
            "在两种可对角化预设中完成 P⁻¹、D、P 三步，并比较两组特征基的几何形状。",
            "确认 D 只分别缩放两个特征坐标，没有交叉混合。",
            "切到 Jordan 块，解释为什么只有一条特征直线时无法建立二维特征坐标。",
          ],
        },
        textbook: sources(
          "Strang 6.2；Friedberg 5.2；Axler 5.C",
          ["对角化的存在与构造问题", "特征向量基等价定理", "特征空间直接和", "矩阵幂"],
        ),
        example: {
          title: "例题：重复特征值下的对角化判断",
          question: text(
            "比较 ",
            texInline("A=2I_2"),
            " 与 ",
            texInline("B=\\begin{bmatrix}2&1\\\\0&2\\end{bmatrix}"),
            "。下列判断哪一项正确？",
          ),
          choices: [
            { text: "A、B 都不可对角化，因为它们的特征值重复。" },
            {
              correct: true,
              text: text(
                "A 可对角化；B 的 ",
                texInline("\\ker(B-2I)"),
                " 只有一维，所以 B 不可对角化。",
              ),
            },
            { text: "A、B 都可对角化，因为二者的特征多项式都分裂。" },
            { text: "B 可对角化，因为它已经是上三角矩阵。" },
          ],
          steps: [
            text(
              "对 A，每个非零向量都满足 ",
              texInline("Av=2v"),
              "，可任选一组基作为特征向量基。",
            ),
            text(
              texInline("B-2I=\\begin{bmatrix}0&1\\\\0&0\\end{bmatrix}"),
              "。",
            ),
            text(
              "方程 ",
              texInline("(B-2I)v=0"),
              " 给出 ",
              texInline("E_2=\\operatorname{span}(e_1)"),
              "，只有一个独立方向。",
            ),
            "B 在二维空间缺少第二个特征向量，不能相似于对角矩阵。",
          ],
        },
        quiz: [
          {
            question: "写出“可对角化”的特征向量基判据。",
            answer:
              "n 维空间上的算子可对角化，当且仅当它拥有 n 个线性无关的特征向量。",
          },
          {
            question: "有 n 个互异特征值的 n 维算子为什么一定可对角化？",
            answer:
              "互异特征值对应的特征向量线性无关，因此可选出 n 个特征向量组成一组基。",
          },
          {
            question: "重复特征值的算子何时仍可对角化？",
            answer:
              "当每个特征值的几何重数等于代数重数，等价地，各特征空间维数之和达到空间维数。",
          },
          {
            question: text(
              "求导算子 ",
              texInline("D:P_2\\to P_2"),
              " 是否可对角化？",
            ),
            answer: text(
              "不可。D 的唯一特征值为 0，而 ",
              texInline("\\ker D=\\operatorname{span}(1)"),
              " 只有一维，无法提供三维空间所需的三个特征向量。",
            ),
          },
          {
            question: text(
              "若 ",
              texInline("A=PDP^{-1}"),
              "，怎样计算 ",
              texInline("A^{20}"),
              "？",
            ),
            answer: text(
              texInline("A^{20}=PD^{20}P^{-1}"),
              "，只需把 D 的每个对角元取 20 次幂。",
            ),
          },
        ],
        summary: [
          "对角化等价于存在一组特征向量基。",
          "判断重复特征值时，要比较几何重数与代数重数。",
          "A=PDP⁻¹ 把一个耦合过程拆成若干独立标量过程。",
          "当特征向量不足时，需要继续寻找更大的不变结构。",
        ],
      },
      {
        id: "image-and-kernel",
        number: "§6",
        textbookSection: "线性变换的值域与核",
        title: "线性变换的值域与核",
        navTitle: "值域与核",
        question: "线性变换能到达哪些输出？哪些输入差异会被它完全忽略？",
        goal:
          "掌握核与值域的子空间性质；理解同一输出的全部原像是一条仿射纤维；能证明秩–零度定理并用核、值域判断单射和满射。",
        tags: ["核", "值域", "仿射纤维", "秩–零度"],
        intro:
          "值域记录 T 实际能够到达的输出，核记录被压成零的输入方向。更强的结论是：两个输入得到同一输出，当且仅当它们的差落在核中。因此每个可达输出背后都有一个平移后的核。",
        concepts: [
          {
            label: "核",
            text: text(
              texInline("\\ker T=\\{v\\in V:T(v)=0\\}"),
              "，位于定义域中，记录完全不可见的输入方向。",
            ),
          },
          {
            label: "值域",
            text: text(
              texInline("\\operatorname{im}T=\\{T(v):v\\in V\\}"),
              "，位于陪域中，记录实际可达的输出。",
            ),
          },
          {
            label: "纤维",
            text: text(
              texInline("T(x)=T(y)\\Longleftrightarrow x-y\\in\\ker T"),
              "；若 ",
              texInline("T(x)=b"),
              "，则 b 的全部原像为 ",
              texInline("x+\\ker T"),
              "。",
            ),
          },
          {
            label: "秩–零度",
            text: text(
              "有限维时 ",
              texInline("\\dim V=\\dim\\ker T+\\dim\\operatorname{im}T"),
              "。",
            ),
          },
          {
            label: "单射与满射",
            text: text(
              "T 单射当且仅当 ",
              texInline("\\ker T=\\{0\\}"),
              "；T 满射到 W 当且仅当 ",
              texInline("\\operatorname{im}T=W"),
              "。",
            ),
          },
        ],
        formal: {
          heading: "用核描述丢失，用值域描述可达",
          lead:
            "核和值域分别位于输入空间和输出空间。把二者混在同一个空间里会遮住最重要的事实：核描述输入之间何时无法被输出区分。",
          blocks: [
            {
              title: "核和值域为什么都是子空间",
              body: text(
                "若 ",
                texInline("u,v\\in\\ker T"),
                "，则 ",
                texInline("T(au+bv)=0"),
                "；若 ",
                texInline("y_1=T(u),y_2=T(v)"),
                "，则 ",
                texInline("ay_1+by_2=T(au+bv)"),
                " 仍在值域。",
              ),
            },
            {
              title: "纤维定理的一行证明",
              body: text(
                texInline("T(x)=T(y)"),
                " 等价于 ",
                texInline("T(x-y)=0"),
                "，也就等价于 ",
                texInline("x-y\\in\\ker T"),
                "。图中的 ",
                texInline("x+\\ker T"),
                " 正是这个等价类。",
              ),
            },
            {
              title: "秩–零度的基证明",
              body: text(
                "先取核的一组基并补成 V 的基。补入向量的像构成值域的一组基：它们张成值域；若像之间有线性关系，相应输入组合就落入核，与补基的独立性矛盾。",
              ),
            },
            {
              title: "矩阵语言中的对应",
              body: text(
                "若 T 由 A 表示，则 ",
                texInline("\\ker T"),
                " 对应齐次方程 ",
                texInline("Ax=0"),
                " 的解空间，",
                texInline("\\operatorname{im}T"),
                " 对应 A 的列空间。",
              ),
            },
            {
              title: "求导算子的完整图景",
              body: text(
                "对 ",
                texInline("D:P_2\\to P_1"),
                "，",
                texInline("\\ker D=\\operatorname{span}(1)"),
                "，",
                texInline("\\operatorname{im}D=P_1"),
                "，所以 ",
                texInline("3=1+2"),
                "。",
              ),
            },
          ],
          formula:
            "\\{y\\in V:T(y)=T(x)\\}=x+\\ker T,\\qquad \\dim V=\\operatorname{nullity}T+\\operatorname{rank}T",
          note:
            "x+ker T 通常不经过原点，因此它是仿射子集；只有输出为 0 时，这条纤维才等于核本身。",
        },
        interactive: {
          type: "ch7-kernel",
          title: "核与值域实验室",
          description:
            "在输入空间沿 x+ker T 移动，观察整条纤维如何汇聚到同一个输出；同时比较值域在陪域中的维数。",
          task:
            "从正交投影开始，拖动 x 与“沿纤维移动”；随后切换满秩、秩一压缩和零变换，逐一核对核维数与值域维数之和。",
          prompts: [
            "沿投影的核方向移动输入，确认右图的 T(x) 完全不动。",
            "比较满秩与秩一情形：核增加一维时，值域减少一维。",
            "切到零变换，解释整个输入平面为何成为同一个输出的纤维。",
          ],
        },
        textbook: sources(
          "Strang 8.1；Friedberg 2.1；Hoffman–Kunze 3.2",
          ["核与值域的空间位置", "秩–零度定理", "求导算子例子", "单射与满射判据"],
        ),
        example: {
          title: "例题：求导算子的一个完整纤维",
          question: text(
            "对 ",
            texInline("D:P_2\\to P_1"),
            "，求所有满足 ",
            texInline("D(p)=2+3x"),
            " 的多项式 p。哪一项正确？",
          ),
          choices: [
            { text: texInline("p=2x+3x^2") },
            { text: texInline("p=2+3x") },
            { text: texInline("p=c+2x+3x^2") + "，其中 c 任意。" },
            {
              correct: true,
              text: texInline("p=c+2x+\\frac32x^2") + "，其中 c 任意。",
            },
          ],
          steps: [
            text(
              "设 ",
              texInline("p=a+bx+cx^2"),
              "，则 ",
              texInline("D(p)=b+2cx"),
              "。",
            ),
            text(
              "比较系数得到 ",
              texInline("b=2"),
              "、",
              texInline("2c=3"),
              "，所以 ",
              texInline("c=3/2"),
              "。",
            ),
            "常数项 a 不影响导数，可以任意取值。",
            text(
              "全部解组成 ",
              texInline("2x+\\frac32x^2+\\ker D"),
              "，其中 ",
              texInline("\\ker D=\\operatorname{span}(1)"),
              "。",
            ),
          ],
        },
        quiz: [
          {
            question: text(
              "证明 ",
              texInline("T(x)=T(y)\\Longleftrightarrow x-y\\in\\ker T"),
              "。",
            ),
            answer: text(
              "两边相减得到 ",
              texInline("T(x)-T(y)=T(x-y)"),
              "；输出相同恰好等价于这个差为 0。",
            ),
          },
          {
            question: "为什么核非零会破坏单射？",
            answer: text(
              "取非零 ",
              texInline("k\\in\\ker T"),
              "，则对任意 x 都有 ",
              texInline("T(x+k)=T(x)"),
              "，两个不同输入得到同一输出。",
            ),
          },
          {
            question: text(
              "若 ",
              texInline("\\dim V=7"),
              " 且 ",
              texInline("\\operatorname{rank}T=4"),
              "，零度是多少？",
            ),
            answer: "3。",
          },
          {
            question: "值域为什么可能小于陪域？",
            answer:
              "陪域是预先声明的允许输出空间，值域只收集 T 实际达到的输出；满射时二者才相等。",
          },
          {
            question: "从核的一组基出发，怎样构造值域的一组基？",
            answer:
              "先把核基补成定义域的一组基，再取所有补入基向量的像；这些像构成值域的一组基。",
          },
        ],
        summary: [
          "核记录被完全抹去的输入方向，值域记录实际可达的输出。",
          "同一输出的全部原像是 x+ker T；输入能否区分由核决定。",
          "秩–零度把定义域维数分成丢失维数和可见维数。",
          "下一节研究在算子作用下能够封闭地独立演化的子空间。",
        ],
      },
      {
        id: "invariant-subspaces",
        number: "§7",
        textbookSection: "不变子空间",
        title: "不变子空间",
        navTitle: "不变子空间",
        question: "怎样把一个大算子拆成若干能够独立研究的小问题？",
        goal:
          "掌握不变子空间与限制算子；理解循环子空间是包含给定向量的最小不变子空间；能从适应基读出分块上三角与分块对角结构。",
        tags: ["限制算子", "循环子空间", "分块结构"],
        intro:
          "一条特征直线只是一维的不变子空间。更高维的不变子空间允许向量在内部混合，同时阻止信息泄漏到外部。找到这样的子空间后，可以把 T 限制在其中研究，再把较小问题拼回整个空间。",
        concepts: [
          {
            label: "不变子空间",
            text: text(
              "若 ",
              texInline("W\\le V"),
              " 且 ",
              texInline("T(W)\\subseteq W"),
              "，则 W 是 T-不变子空间。",
            ),
          },
          {
            label: "限制算子",
            text: text(
              "W 不变时，",
              texInline("T|_W:W\\to W"),
              " 是一个更小的线性算子。",
            ),
          },
          {
            label: "循环子空间",
            text: text(
              texInline("Z(v;T)=\\operatorname{span}\\{v,Tv,T^2v,\\ldots\\}"),
              " 是包含 v 的最小 T-不变子空间。",
            ),
          },
          {
            label: "适应基",
            text: text(
              "先取 W 的基再补成 V 的基，T 的矩阵具有 ",
              texInline("\\begin{bmatrix}A&B\\\\0&C\\end{bmatrix}"),
              " 的形式。",
            ),
          },
          {
            label: "不变直和",
            text: text(
              "若 ",
              texInline("V=W_1\\oplus W_2"),
              " 且两个子空间都不变，则矩阵成为分块对角，T 可分别限制到两个部分。",
            ),
          },
        ],
        formal: {
          heading: "让子空间内部封闭，算子就能被分解",
          lead:
            "不变性要求整个位于 W 中的输入集合都被送回 W。向量可以在 W 内移动、旋转和混合；关键是没有分量泄漏到补空间。",
          blocks: [
            {
              title: "一维不变子空间就是特征直线",
              body: text(
                "若 ",
                texInline("W=\\operatorname{span}(v)"),
                " 且 W 不变，则 ",
                texInline("T(v)=\\lambda v"),
                "；反过来，每个特征向量都生成一条不变直线。",
              ),
            },
            {
              title: "基本实例",
              body: text(
                texInline("\\{0\\}"),
                "、V、每个特征空间和 ",
                texInline("\\ker T"),
                " 都不变。对算子 ",
                texInline("T:V\\to V"),
                "，",
                texInline("\\operatorname{im}T"),
                " 也不变，因为 ",
                texInline("T(Tx)=T^2x"),
                " 仍在值域。",
              ),
            },
            {
              title: "循环子空间为何最小",
              body: text(
                "任何包含 v 的不变子空间都必须依次包含 ",
                texInline("Tv,T^2v,\\ldots"),
                "，因此必须包含它们的张成空间；而这个张成空间本身在 T 下封闭。",
              ),
            },
            {
              title: "求导算子的循环轨道",
              body: text(
                "在 ",
                texInline("P_2"),
                " 上，",
                texInline("x^2/2\\mapsto x\\mapsto1\\mapsto0"),
                "，所以 ",
                texInline("Z(x^2/2;D)=P_2"),
                "。同时 ",
                texInline("P_0\\subset P_1\\subset P_2"),
                " 构成一条不变子空间链。",
              ),
            },
            {
              title: "零块就是无泄漏的坐标证据",
              body:
                "适应基的前几列来自 W 中的基向量；它们的像没有补空间分量，所以左下块为零。若补空间也不变，右上块也归零。",
            },
            {
              title: "分解的目标",
              body:
                "对角化把 V 分成一维不变子空间的直和。特征向量不足时，下一步寻找由广义特征向量组成的更大不变子空间。",
            },
          ],
          formula:
            "Z(v;T)=\\operatorname{span}\\{v,Tv,T^2v,\\ldots\\},\\qquad [T]_{(W,U)}=\\begin{bmatrix}A&B\\\\0&C\\end{bmatrix}",
          note:
            "T(W)⊆W 是不变性的定义；T(W)=W 还要求限制算子 T|W 满射。在有限维情形下，这等价于 T|W 可逆。",
        },
        interactive: {
          type: "ch7-invariant",
          title: "不变子空间闸门",
          description:
            "旋转整条候选直线 W，比较 W 与 T(W) 是否重合，并同步读取适应基矩阵中的泄漏系数。",
          task:
            "在四个算子中寻找一维不变子空间，再切换整个空间与零子空间；用子空间夹角和左下角系数给出同一个判断。",
          prompts: [
            "找到特征直线后，说明整条 T(W) 为何留在 W 内，而不要求每个向量固定。",
            "比较对称矩阵、剪切、反射和 90° 旋转拥有的一维实不变子空间数量。",
            "切到 V 与 {0}，区分平凡不变子空间和真正揭示结构的中间维子空间。",
          ],
        },
        textbook: sources(
          "Friedberg 5.4；Axler 5.B；Hoffman–Kunze 6.4、7.1",
          ["限制算子", "不变直和", "循环子空间的最小性", "由循环分解走向标准形"],
        ),
        example: {
          title: "例题：求导算子的不变子空间",
          question: text(
            "在 ",
            texInline("P_2"),
            " 上令 ",
            texInline("D(p)=p'"),
            "。比较 ",
            texInline("P_0"),
            "、",
            texInline("P_1"),
            "、",
            texInline("P_2"),
            " 与 ",
            texInline("W=\\operatorname{span}(x)"),
            "。哪一项正确？",
          ),
          choices: [
            { text: "只有 P₀ 不变，因为求导会降低次数。" },
            { text: "P₀ 与 W 不变，P₁、P₂ 不变性失败。" },
            {
              correct: true,
              text: text(
                texInline("P_0,P_1,P_2"),
                " 都不变；W 不变性失败，因为 ",
                texInline("D(x)=1\\notin W"),
                "。",
              ),
            },
            { text: "四个子空间都不变，因为它们都由多项式组成。" },
          ],
          steps: [
            text(
              texInline("D(P_0)=\\{0\\}\\subseteq P_0"),
              "。",
            ),
            text(
              "一次多项式求导成为常数，所以 ",
              texInline("D(P_1)\\subseteq P_1"),
              "。",
            ),
            text(
              "二次多项式求导成为一次多项式，所以 ",
              texInline("D(P_2)\\subseteq P_2"),
              "。",
            ),
            text(
              texInline("D(x)=1"),
              " 离开 ",
              texInline("\\operatorname{span}(x)"),
              "，因此 W 不变性失败；同时 ",
              texInline("x^2/2"),
              " 生成的循环子空间是整个 P₂。",
            ),
          ],
        },
        quiz: [
          {
            question: "W 不变是否要求每个 w∈W 都满足 T(w)=w？",
            answer:
              "不要求。只需 T(w) 仍属于 W；向量可以在 W 内缩放或互相混合。",
          },
          {
            question: "为什么 Z(v;T) 是包含 v 的最小不变子空间？",
            answer:
              "任何包含 v 的不变子空间都必须包含 v 的全部迭代 Tv、T²v、…，因而包含它们的张成空间；该张成空间本身又对 T 封闭。",
          },
          {
            question: "两个 T-不变子空间的和与交是否仍然不变？",
            answer:
              "都仍然不变。对和使用线性性，对交使用每个向量同时属于两个子空间即可证明。",
          },
          {
            question: "适应 W 的基下为什么出现左下零块？",
            answer:
              "W 中基向量的像仍在 W 内，因此前几列没有补空间方向的坐标分量。",
          },
          {
            question: "何时分块上三角矩阵进一步成为分块对角矩阵？",
            answer:
              "当选取的补空间 U 也对 T 不变时，W 与 U 之间都没有跨块泄漏。",
          },
        ],
        summary: [
          "不变子空间允许把 T 限制到更小空间中独立研究。",
          "循环子空间由 v 的轨道生成，是包含 v 的最小不变子空间。",
          "适应基把不变性翻译成矩阵中的零块；不变直和对应分块对角。",
          "下一节把特征向量不足的部分组织成广义特征向量链。",
        ],
      },
      {
        id: "jordan-form-introduction",
        number: "§8",
        textbookSection: "若尔当（Jordan）标准形介绍",
        title: "若尔当（Jordan）标准形介绍",
        navTitle: "Jordan 标准形介绍",
        question: "特征向量不足时，怎样从不断增长的核中找回缺失的基向量？",
        goal:
          "理解广义特征空间、嵌套核与 Jordan 链；能把 Jordan 块分解为 λI+N；知道块数、最大块长和数域条件分别记录什么。",
        tags: ["嵌套核", "广义特征向量", "Jordan 链"],
        intro:
          "令 N=T−λI。普通特征向量在 N 的一次作用后归零；广义特征向量可能需要 N²、N³ 才归零。随着 ker N、ker N²、ker N³ 逐层增长，缺失方向被组织成有限链，最终补成一组能够显示 Jordan 结构的基。",
        concepts: [
          {
            label: "广义特征空间",
            text: text(
              "在 n 维空间中可取 ",
              texInline("G_\\lambda=\\ker(T-\\lambda I)^n"),
              "；其中非零向量称为 λ 的广义特征向量。",
            ),
          },
          {
            label: "嵌套核",
            text: text(
              texInline("\\ker N\\subseteq\\ker N^2\\subseteq\\cdots"),
              "，新增加的维数记录需要更多次 N 才归零的方向。",
            ),
          },
          {
            label: "Jordan 链",
            text: text(
              "链 ",
              texInline("v_1,\\ldots,v_k"),
              " 满足 ",
              texInline("Nv_1=0"),
              "、",
              texInline("Nv_j=v_{j-1}"),
              "。",
            ),
          },
          {
            label: "Jordan 块",
            text: text(
              texInline("J_k(\\lambda)=\\lambda I+N"),
              "；在链基下，N 的超对角线为 1，并满足 ",
              texInline("N^k=0"),
              "。",
            ),
          },
          {
            label: "块的信息",
            text:
              "同一特征值的 Jordan 块数等于其几何重数；最大块长等于幂零部分的指数。",
          },
        ],
        formal: {
          heading: "从 ker N 的增长读出链的长度",
          lead:
            "对角化失败意味着 ker(T−λI) 的维数不足。继续考察更高次幂的核，可以找到被 N 逐步送入特征空间的方向。",
          blocks: [
            {
              title: "普通特征向量位于第一层",
              body: text(
                texInline("v\\in\\ker N"),
                " 等价于 ",
                texInline("Tv=\\lambda v"),
                "。因此每条 Jordan 链的首向量都是普通特征向量。",
              ),
            },
            {
              title: "第二层怎样补回一个方向",
              body: text(
                "若 ",
                texInline("v_2\\in\\ker N^2\\setminus\\ker N"),
                "，则 ",
                texInline("v_1=Nv_2"),
                " 非零且 ",
                texInline("Nv_1=0"),
                "，于是 ",
                texInline("v_1,v_2"),
                " 构成长为 2 的链。",
              ),
            },
            {
              title: "核增长精确计数链",
              body: text(
                texInline("\\dim\\ker N^r-\\dim\\ker N^{r-1}"),
                " 等于长度至少为 r 的 Jordan 链条数。第一层维数给出块数，最后一次增长的位置给出最大块长。",
              ),
            },
            {
              title: "T 的作用分成两部分",
              body: text(
                "链上有 ",
                texInline("T(v_j)=\\lambda v_j+v_{j-1}"),
                "。第一项是共同伸缩，第二项是沿链向前一级的传递；可视化中的两幅图分别承担这两个角色。",
              ),
            },
            {
              title: "求导算子给出天然的三阶链",
              body: text(
                "在基 ",
                texInline("(1,x,x^2/2)"),
                " 下，",
                texInline("D(x^2/2)=x"),
                "、",
                texInline("D(x)=1"),
                "、",
                texInline("D(1)=0"),
                "，因此 D 本身就是特征值 0 的三阶 Jordan 块。",
              ),
            },
            {
              title: "数域决定标准形能否出现",
              body:
                "Jordan 标准形要求特征多项式在所讨论数域上分裂。复数域上的有限维算子满足这一条件；实数域上的旋转矩阵可能需要先扩充到复数域。",
            },
          ],
          formula:
            "\\ker N\\subseteq\\ker N^2\\subseteq\\cdots,\\qquad Nv_1=0,\\quad Nv_j=v_{j-1},\\quad T=\\lambda I+N",
          note:
            "链的箭头表示 N=T−λI 的代数作用。书写基时采用 (v₁,…,vₖ)，作用方向则从 vₖ 逐级走向 v₁ 再到 0。",
        },
        interactive: {
          type: "ch7-jordan",
          title: "Jordan 链传送带",
          description:
            "比较两条独立特征方向、J₂(λ) 与 J₃(λ)，依次观察特征向量缺口、剥离 λI 和沿 N 的链传递。",
          task:
            "每个结构都按“看见缺口—剥离 λI—沿 N 前进”完成三步；记录 ker N、ker N²、ker N³ 在何时停止增长。",
          prompts: [
            "比较两个一阶块与一个二阶块：特征值相同，独立特征方向数量却不同。",
            "改变 λ，确认 N 的链结构保持不变。",
            "在 J₃(λ) 中连续点击 N，验证 v₃→v₂→v₁→0。",
          ],
        },
        textbook: sources(
          "Axler 8.A；Friedberg 7.4；Hoffman–Kunze 7.3",
          ["广义特征空间的嵌套核", "幂零算子", "Jordan 链与块", "分裂域条件"],
        ),
        example: {
          title: "例题：从求导读出一条 Jordan 链",
          question: text(
            "在 ",
            texInline("P_2"),
            " 上令 ",
            texInline("D(p)=p'"),
            "，取 ",
            texInline("v_1=1,v_2=x,v_3=x^2/2"),
            "。下列结论哪一项正确？",
          ),
          choices: [
            {
              correct: true,
              text: text(
                texInline("Dv_1=0,Dv_2=v_1,Dv_3=v_2"),
                "，所以三者构成特征值 0 的长度 3 Jordan 链。",
              ),
            },
            { text: "v₂、v₃ 都是普通特征向量，因为求导保持 P₂。" },
            {
              text: text(
                texInline("D^2v_3=v_2"),
                "，所以链长为 2。",
              ),
            },
            { text: "D 在这组基下是对角矩阵，对角元全为 0。" },
          ],
          steps: [
            text(
              texInline("D(1)=0"),
              "，所以 v₁ 是特征值 0 的普通特征向量。",
            ),
            text(
              texInline("D(x)=1=v_1"),
              "，v₂ 位于 ",
              texInline("\\ker D^2\\setminus\\ker D"),
              "。",
            ),
            text(
              texInline("D(x^2/2)=x=v_2"),
              "，v₃ 位于 ",
              texInline("\\ker D^3\\setminus\\ker D^2"),
              "。",
            ),
            text(
              "因此 ",
              texInline("\\dim\\ker D=1"),
              "、",
              texInline("\\dim\\ker D^2=2"),
              "、",
              texInline("\\dim\\ker D^3=3"),
              "，对应一条长度 3 的链。",
            ),
          ],
        },
        quiz: [
          {
            question: "广义特征向量与普通特征向量有什么关系？",
            answer:
              "普通特征向量在 N=T−λI 的一次作用后归零；广义特征向量允许在某个更高次幂后归零。",
          },
          {
            question: text(
              "若 ",
              texInline("\\dim\\ker N=2"),
              "、",
              texInline("\\dim\\ker N^2=3"),
              "、",
              texInline("\\dim\\ker N^3=3"),
              "，有多少个 Jordan 块，最大块长是多少？",
            ),
            answer:
              "有 2 个块；第二层还增长而第三层停止，因此最大块长为 2。",
          },
          {
            question: text(
              "对 ",
              texInline("2I_2"),
              "，幂零部分 N 和 Jordan 链怎样？",
            ),
            answer:
              "N=0，有两条长度 1 的链，也就是两个独立的一阶 Jordan 块。",
          },
          {
            question: text(
              "在长度 3 的链中，",
              texInline("T(v_3)"),
              " 怎样表示？",
            ),
            answer: texInline("T(v_3)=\\lambda v_3+v_2") + "。",
          },
          {
            question: "为什么实矩阵不一定在实数域上有 Jordan 标准形？",
            answer:
              "其特征多项式可能在实数域上不分裂，例如 90° 旋转没有实特征值；扩充到复数域后才能形成相应 Jordan 块。",
          },
        ],
        summary: [
          "高次核的增长把缺失的特征方向组织成广义特征向量链。",
          "Jordan 块把 T 分成共同伸缩 λI 与幂零传递 N。",
          "块数由几何重数决定，最大块长由幂零指数决定。",
          "下一节用一个最低次数的多项式同时记录所有最大链长。",
        ],
      },
      {
        id: "minimal-polynomial",
        number: "§9",
        textbookSection: "最小多项式",
        title: "最小多项式",
        navTitle: "最小多项式",
        question: "什么是整个算子必须满足的最短多项式规律？",
        goal:
          "掌握湮灭多项式与最小多项式；能证明存在、唯一与整除性质；理解它和循环子空间、Jordan 最大块、对角化及高次幂降阶的关系。",
        tags: ["湮灭关系", "整除性质", "结构判据"],
        intro:
          "第二节已经把多项式代入算子。现在寻找一个非零多项式 p，使 p(T) 在整个空间上都等于零；其中首一且次数最低的 p，就是最小多项式。它是算子的最短全局规律。",
        concepts: [
          {
            label: "湮灭多项式",
            text: text(
              "非零多项式 p 若满足 ",
              texInline("p(T)=0"),
              "，则 p 湮灭 T。",
            ),
          },
          {
            label: "最小多项式",
            text: text(
              texInline("m_T"),
              " 是首一、次数最低且满足 ",
              texInline("m_T(T)=0"),
              " 的非零多项式。",
            ),
          },
          {
            label: "整除性质",
            text: text(
              "若 ",
              texInline("p(T)=0"),
              "，则 ",
              texInline("m_T\\mid p"),
              "；特别地 ",
              texInline("m_T\\mid\\chi_T"),
              "。",
            ),
          },
          {
            label: "局部与全局",
            text: text(
              "单个向量 v 有自己的最低关系；",
              texInline("m_T"),
              " 必须同时消去一组基，因此消去整个空间。",
            ),
          },
          {
            label: "结构读取",
            text:
              "特征多项式分裂时，m_T 中 (t−λ) 的指数等于 λ 对应的最大 Jordan 块长度。",
          },
        ],
        formal: {
          heading: "从一个轨道的关系，提升为整个空间的最低关系",
          lead:
            "有限维空间中，v,Tv,T²v,… 终会线性相关；这给出消去单个轨道的多项式。最小多项式寻找能同时覆盖所有轨道的最低首一关系。",
          blocks: [
            {
              title: "检查一组基已经足够",
              body: text(
                "p(T) 本身是线性变换。若它把一组基 ",
                texInline("e_1,\\ldots,e_n"),
                " 全部送到 0，则对任意 ",
                texInline("v=\\sum c_ie_i"),
                " 都有 ",
                texInline("p(T)v=\\sum c_ip(T)e_i=0"),
                "。",
              ),
            },
            {
              title: "Cayley–Hamilton 保证存在",
              body: text(
                "特征多项式满足 ",
                texInline("\\chi_T(T)=0"),
                "，因此有限维算子至少有一个非零湮灭多项式；在其中选次数最低者并化为首一，即得 ",
                texInline("m_T"),
                "。",
              ),
            },
            {
              title: "多项式除法给出整除与唯一",
              body: text(
                "若 ",
                texInline("p(T)=0"),
                "，作除法 ",
                texInline("p=qm_T+r"),
                " 且 ",
                texInline("\\deg r<\\deg m_T"),
                "。代入 T 得 ",
                texInline("r(T)=0"),
                "；最低次数迫使 r=0，所以 ",
                texInline("m_T\\mid p"),
                "。两个首一最低多项式因而必相同。",
              ),
            },
            {
              title: "高次幂通过余式降阶",
              body: text(
                "把任意多项式 f 除以 ",
                texInline("m_T"),
                "，得到 ",
                texInline("f=qm_T+r"),
                "；代入后 ",
                texInline("f(T)=r(T)"),
                "，其中 ",
                texInline("\\deg r<\\deg m_T"),
                "。",
              ),
            },
            {
              title: "Jordan 块决定因子指数",
              body: text(
                "在 ",
                texInline("J_k(\\lambda)"),
                " 上，",
                texInline("(T-\\lambda I)^k=0"),
                " 而更低次幂不为零。因此所有 λ-块中最长的块决定 ",
                texInline("(t-\\lambda)"),
                " 在 ",
                texInline("m_T"),
                " 中的指数。",
              ),
            },
            {
              title: "对角化与求导算子",
              body: text(
                "最小多项式分裂且无重根时，每个 Jordan 块长度都为 1，T 可对角化。对 ",
                texInline("D:P_2\\to P_2"),
                "，",
                texInline("D^3=0"),
                " 而 ",
                texInline("D^2\\ne0"),
                "，所以 ",
                texInline("m_D(t)=t^3"),
                "。",
              ),
            },
          ],
          formula:
            "m_T(T)=0,\\qquad p(T)=0\\Longrightarrow m_T\\mid p,\\qquad f(T)=\\operatorname{rem}(f,m_T)(T)",
          note:
            "某个向量满足 p(T)v=0 只是一条局部关系。最小多项式要求 p(T) 作为线性变换等于零；可视化逐行检查一组基正是在验证这个全局条件。",
        },
        interactive: {
          type: "ch7-minimal",
          title: "多项式湮灭实验室",
          description:
            "把 p(T) 的各项在每个基方向上首尾相接；只有所有行同时闭合，候选多项式才湮灭整个算子。",
          task:
            "依次比较 diag(2,3)、2I₂、J₂(2) 与 J₃(2)；对每个算子先试次数不足的候选，再区分最小多项式和更高次的湮灭多项式。",
          prompts: [
            "比较 2I₂ 与 J₂(2)：两者特征多项式相同，为什么最小多项式不同？",
            "在 J₃(2) 中依次测试 (t−2)、(t−2)²、(t−2)³，读出最大链长。",
            "确认一个高次候选可以湮灭算子，却因次数不最低而不是最小多项式。",
          ],
        },
        textbook: sources(
          "Axler 8.C–8.D；Friedberg 7.3；Hoffman–Kunze 6.4、7.1",
          ["算子多项式", "Cayley–Hamilton", "多项式除法与整除性质", "循环轨道和 Jordan 最大块"],
        ),
        example: {
          title: "例题：求导链平移后的最小多项式",
          question: text(
            "在 ",
            texInline("P_2"),
            " 上令 ",
            texInline("D(p)=p'"),
            "，并设 ",
            texInline("T=2I+D"),
            "。下列哪一项同时给出 ",
            texInline("m_T"),
            " 与 ",
            texInline("T^8"),
            " 的正确表达？",
          ),
          choices: [
            {
              text: text(
                texInline("m_T(t)=t-2"),
                "，",
                texInline("T^8=256I"),
                "。",
              ),
            },
            {
              text: text(
                texInline("m_T(t)=(t-2)^2"),
                "，",
                texInline("T^8=256I+1024D"),
                "。",
              ),
            },
            {
              correct: true,
              text: text(
                texInline("m_T(t)=(t-2)^3"),
                "，",
                texInline("T^8=256I+1024D+1792D^2"),
                "。",
              ),
            },
            {
              text: text(
                texInline("m_T(t)=t^3"),
                "，因为 ",
                texInline("D^3=0"),
                "。",
              ),
            },
          ],
          steps: [
            text(
              texInline("T-2I=D"),
              "，且在 P₂ 上 ",
              texInline("D^3=0"),
              "、",
              texInline("D^2\\ne0"),
              "。",
            ),
            text(
              "因此 ",
              texInline("(T-2I)^3=0"),
              " 而二次幂仍不为零，故 ",
              texInline("m_T(t)=(t-2)^3"),
              "。",
            ),
            text(
              "由于 I 与 D 交换，可用二项式展开 ",
              texInline("(2I+D)^8"),
              "。",
            ),
            text(
              "只保留 D 的 0、1、2 次项：",
              texInline("2^8I+\\binom{8}{1}2^7D+\\binom{8}{2}2^6D^2=256I+1024D+1792D^2"),
              "。",
            ),
          ],
        },
        quiz: [
          {
            question: "为什么验证 p(T) 在一组基上全为零，就能推出 p(T)=0？",
            answer:
              "p(T) 是线性变换；任意向量是基向量的线性组合，线性性把每个基向量上的零关系推广到整个空间。",
          },
          {
            question: "用多项式除法证明 m_T 整除任意湮灭多项式的关键矛盾是什么？",
            answer:
              "若余式 r 非零，则 r(T)=0 且 deg r<deg m_T，得到一个次数更低的非零湮灭多项式，违背 m_T 的最低性。",
          },
          {
            question: text(
              texInline("2I_2"),
              " 与 ",
              texInline("J_2(2)"),
              " 的最小多项式分别是什么？",
            ),
            answer: text(
              "分别是 ",
              texInline("t-2"),
              " 与 ",
              texInline("(t-2)^2"),
              "。",
            ),
          },
          {
            question: "怎样用最小多项式判断可对角化？",
            answer:
              "在所讨论数域上，T 可对角化当且仅当 m_T 分裂成互不相同的一次因子。",
          },
          {
            question: text(
              "如何利用 ",
              texInline("m_T"),
              " 计算一个很高次的 ",
              texInline("T^N"),
              "？",
            ),
            answer:
              "把 tᴺ 除以 m_T，取次数低于 deg m_T 的余式 r；因为 m_T(T)=0，所以 Tᴺ=r(T)。",
          },
          {
            question: "特征多项式和最小多项式相同，是否足以保证两个高维矩阵相似？",
            answer:
              "一般不足。它们记录各特征值的总代数重数与最大 Jordan 块长，却未必记录每种块长各有多少个。",
          },
        ],
        summary: [
          "最小多项式是整个算子满足的首一、最低次数的多项式关系。",
          "Cayley–Hamilton 保证存在，多项式除法给出唯一性与整除性质。",
          "最小多项式的因子指数读取最大 Jordan 块长，无重根对应可对角化。",
          "从保持线性组合到最短多项式规律，本章完成了从作用、坐标到内部结构的闭环。",
        ],
      },
    ],
  });
})();
