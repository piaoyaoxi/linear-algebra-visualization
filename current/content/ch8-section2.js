defineChapter8Section("smith-form", {
  number: "§2",
  textbookSection: "λ-矩阵在初等变换下的标准形",
  title: "λ-矩阵在初等变换下的标准形",
  navTitle: "λ-矩阵的标准形",
  question: `初等变换能把 ${texInline(String.raw`\lambda`)}-矩阵化到多简单？`,
  goal: `掌握 ${texInline(String.raw`\lambda`)}-矩阵的三种初等变换与等价；会用带余除法把 ${texInline(String.raw`\lambda`)}-矩阵化成对角元首一、依次整除的标准形。`,
  tags: ["初等变换", "等价", "带余除法", "标准形"],
  intro:
    `数字矩阵可以用初等变换化成对角形，${texInline(String.raw`\lambda`)}-矩阵也可以，只是倍乘只能乘非零常数。办法是把次数最低的元素放到左上角，用带余除法清掉同行同列；余式不为零，就让它当新的角元。下面亲手做一遍。`,
  concepts: [
    { label: "初等变换", text: `换行、乘非零常数、加上另一行的 ${texInline(String.raw`\varphi(\lambda)`)} 倍（列同样）` },
    { label: "标准形", text: texInline(String.raw`\operatorname{diag}(d_1,\dots,d_r,0,\dots,0),\ d_i\mid d_{i+1}`) },
  ],
  textbook: { reference: "北大版《高等代数》第八章 §2", items: ["初等变换与初等矩阵", "λ-矩阵的等价", "降低左上角次数的引理", "标准形"] },
  interactive: { type: "slot", title: "标准形工作台" },
  lesson3d: {
    blocks: [
      {
        title: "初等变换与等价",
        tex: String.raw`B(\lambda)=P_1(\lambda)\cdots P_s(\lambda)\,A(\lambda)\,Q_1(\lambda)\cdots Q_t(\lambda)`,
        text: `${texInline(String.raw`\lambda`)}-矩阵的初等变换有三种：交换两行 ${texInline("[i,j]")}；用非零常数 ${texInline("c")} 乘某一行 ${texInline("[i(c)]")}；把第 ${texInline("j")} 行的 ${texInline(String.raw`\varphi(\lambda)`)} 倍加到第 ${texInline("i")} 行 ${texInline(String.raw`[i+j(\varphi)]`)}。列变换相同，记作 ${texInline(String.raw`\{i,j\}`)}、${texInline(String.raw`\{i(c)\}`)}、${texInline(String.raw`\{i+j(\varphi)\}`)}。每种变换都是左乘或右乘一个初等 ${texInline(String.raw`\lambda`)}-矩阵，它们都可逆。${texInline(String.raw`A(\lambda)`)} 经若干次初等变换变成 ${texInline(String.raw`B(\lambda)`)}，就称两者等价，即上式成立，其中 ${texInline("P_i")}、${texInline("Q_j")} 是初等矩阵。`,
        ponder: {
          q: `把一行乘以 ${texInline(String.raw`\lambda`)}，为什么不算初等变换？`,
          a: `初等变换要能用初等变换撤回。撤回乘 ${texInline(String.raw`\lambda`)} 需要乘 ${texInline(String.raw`1/\lambda`)}，它不是多项式。`,
        },
      },
      {
        title: "降低左上角的次数",
        tex: String.raw`a_{i1}(\lambda)=a_{11}(\lambda)q(\lambda)+r(\lambda),\quad r\ne0,\ \deg r<\deg a_{11}`,
        text: `设 ${texInline(String.raw`a_{11}(\lambda)\ne0`)}，且某个元素不能被 ${texInline("a_{11}")} 整除。若它在第一列，从第 ${texInline("i")} 行减去第一行的 ${texInline(String.raw`q(\lambda)`)} 倍，余式 ${texInline(String.raw`r(\lambda)`)} 留在第一列，再换到左上角；在第一行时用列变换同样处理；在别处时，先把它所在的行加到第一行。每一轮左上角的次数都严格下降，所以有限步后角元整除所有元素，就能清掉第一行和第一列。`,
      },
      {
        title: "标准形",
        tex: String.raw`A(\lambda)\simeq\operatorname{diag}\big(d_1(\lambda),\dots,d_r(\lambda),0,\dots,0\big),\qquad d_i(\lambda)\mid d_{i+1}(\lambda)`,
        text: `任意 ${texInline(String.raw`\lambda`)}-矩阵都与上面的对角形等价，其中 ${texInline("r")} 是它的秩，${texInline(String.raw`d_1(\lambda),\dots,d_r(\lambda)`)} 是首项系数为 1 的多项式，每一个整除下一个。这个矩阵称为 ${texInline(String.raw`A(\lambda)`)} 的标准形。方阵满秩时，${texInline(String.raw`d_1(\lambda)\cdots d_n(\lambda)`)} 与 ${texInline(String.raw`|A(\lambda)|`)} 只差一个非零常数因子。`,
        ponder: {
          q: `${texInline(String.raw`\operatorname{diag}(\lambda,\lambda+1)`)} 已经是对角矩阵，为什么还不是标准形？`,
          a: `${texInline(String.raw`\lambda`)} 不整除 ${texInline(String.raw`\lambda+1`)}。继续做初等变换得到 ${texInline(String.raw`\operatorname{diag}(1,\lambda(\lambda+1))`)}。`,
        },
      },
    ],
    pitfalls: [
      `把某一行乘以 ${texInline(String.raw`\lambda`)} 或乘以多项式。倍乘只能乘非零常数。`,
      "化成对角形就停下。还要检查对角元是否首一、是否依次整除。",
      "不先降低角元次数就硬做除法。角元次数不是最低时，同行同列中次数更低的元素消不掉，先把它换到左上角。",
    ],
  },
  example: {
    title: "例题：化成标准形",
    question: `${texInline(String.raw`A(\lambda)=\begin{pmatrix}\lambda&1\\\lambda^2-1&\lambda+1\end{pmatrix}`)} 的标准形是什么？`,
    choices: [
      { correct: true, text: texInline(String.raw`\begin{pmatrix}1&0\\0&\lambda+1\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}\lambda&0\\0&\lambda+1\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&0\\0&\lambda^2+\lambda\end{pmatrix}`) },
      { text: texInline(String.raw`\begin{pmatrix}1&0\\0&-\lambda-1\end{pmatrix}`) },
    ],
    steps: [
      `右上角的 1 次数最低。作 ${texInline(String.raw`\{1,2\}`)} 把它换到左上角：${texInline(String.raw`\begin{pmatrix}1&\lambda\\\lambda+1&\lambda^2-1\end{pmatrix}`)}。`,
      `作 ${texInline(String.raw`[2+1(-\lambda-1)]`)}：第二行变为 ${texInline(String.raw`(0,\ \lambda^2-1-\lambda(\lambda+1))=(0,\ -\lambda-1)`)}。`,
      `作 ${texInline(String.raw`\{2+1(-\lambda)\}`)} 清掉右上角，再作 ${texInline(String.raw`[2(-1)]`)} 首一化，得 ${texInline(String.raw`\operatorname{diag}(1,\lambda+1)`)}。`,
      `核对：${texInline(String.raw`|A(\lambda)|=\lambda(\lambda+1)-(\lambda^2-1)=\lambda+1`)}，与对角元之积一致。${texInline(String.raw`\operatorname{diag}(\lambda,\lambda+1)`)} 的行列式是 ${texInline(String.raw`\lambda(\lambda+1)`)}，也不满足整除；${texInline(String.raw`\lambda^2+\lambda`)} 使行列式次数不符；${texInline(String.raw`-\lambda-1`)} 不是首一的。`,
    ],
  },
  quiz: [
    {
      question: `${texInline(String.raw`A(\lambda)`)} 中某个元素是非零常数，它的标准形中 ${texInline(String.raw`d_1(\lambda)`)} 是什么？`,
      answer: `${texInline(String.raw`d_1(\lambda)=1`)}。把这个常数换到左上角，它能整除一切元素，用它清掉同行同列后乘以它的倒数即可。`,
    },
    {
      question: `两个 ${texInline(String.raw`\lambda`)}-矩阵等价，它们的秩相同吗？`,
      answer: `相同。初等变换不改变 ${texInline(String.raw`\lambda`)}-矩阵的秩，标准形中非零对角元的个数就是秩。`,
    },
    {
      question: `${texInline("n")} 阶 ${texInline(String.raw`\lambda`)}-矩阵可逆时，它的标准形是什么？`,
      answer: `是单位矩阵 ${texInline("E")}。行列式是非零常数，对角元之积只能是常数，首一以后全是 1。`,
    },
  ],
  summary: [
    `初等变换：换行（列）、乘非零常数、加上另一行（列）的 ${texInline(String.raw`\varphi(\lambda)`)} 倍；能互相变换的 ${texInline(String.raw`\lambda`)}-矩阵称为等价。`,
    "把次数最低的元素放到左上角做带余除法，角元次数逐轮下降，直到它整除一切元素。",
    `任意 ${texInline(String.raw`\lambda`)}-矩阵都等价于标准形 ${texInline(String.raw`\operatorname{diag}(d_1,\dots,d_r,0,\dots,0)`)}，${texInline("d_i")} 首一且 ${texInline(String.raw`d_i\mid d_{i+1}`)}。`,
  ],
});
