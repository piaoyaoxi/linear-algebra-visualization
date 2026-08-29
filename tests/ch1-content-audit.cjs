const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const expectedIds = [
  "number-fields",
  "univariate-polynomials",
  "polynomial-divisibility",
  "gcd-polynomials",
  "factorization-theorem",
  "multiple-factors",
  "polynomial-functions",
  "complex-real-factorization",
  "rational-polynomials",
  "multivariate-polynomials",
  "symmetric-polynomials",
];

const sections = new Map();
const chapterContext = {
  texInline: (source) => source,
  defineChapter1Section: (id, section) => sections.set(id, section),
};

for (let index = 1; index <= 11; index += 1) {
  const filename = path.join(root, "current", "content", `ch1-section${index}.js`);
  vm.runInNewContext(fs.readFileSync(filename, "utf8"), chapterContext, { filename });
}

assert.deepEqual([...sections.keys()], expectedIds, "第一章必须完整注册 11 节并保持课程顺序");

const forbiddenStudentWording = /开发进度|原型状态|占位(?:符|内容)?|后续制作|未来生产|future production/i;
const forbiddenAiTemplateWording = /不是[^。！？\n]{0,40}而是|一句(?:话|数学)(?:结论|总结|说明)|很值钱|最狠|很狠/;
for (const id of expectedIds) {
  const section = sections.get(id);
  const label = `${section.number} ${section.title}`;
  assert.ok(section.question?.length >= 20, `${label}: 缺少聚焦问题`);
  assert.ok(section.goal?.length >= 20, `${label}: 缺少可检验目标`);
  assert.equal(section.concepts?.length, 4, `${label}: 核心概念应收束为 4 个`);

  const formal = section.formal || {};
  assert.equal(formal.map?.length, 4, `${label}: 理论地图应有 4 个节点`);
  assert.ok(formal.bridge?.title && formal.bridge?.text, `${label}: 缺少实验到理论的桥梁`);
  assert.ok(formal.theorem?.title && formal.theorem?.statement, `${label}: 缺少核心定理`);
  assert.ok(formal.proof?.steps?.length >= 4, `${label}: 证明主线少于 4 步`);
  assert.ok(formal.definitions?.length >= 2, `${label}: 定义解释不足`);
  assert.ok(formal.boundary?.title && formal.boundary?.text, `${label}: 缺少边界或反例`);
  assert.ok(formal.pitfalls?.length >= 3, `${label}: 常见误区不足`);

  assert.equal(section.interactive?.guide?.length, 3, `${label}: 实验观察路径应为 3 步`);
  assert.ok(section.interactive?.takeaway?.length >= 20, `${label}: 实验缺少可回收结论`);
  assert.ok(section.example?.question, `${label}: 代表例题必须先显示题目`);
  assert.ok(section.example?.choices?.length >= 4, `${label}: 代表例题选择不足`);
  assert.equal(section.example.choices.filter((choice) => choice.correct).length, 1, `${label}: 必须恰有一个正确选项`);
  assert.ok(section.example?.steps?.length >= 3, `${label}: 例题分析步骤不足`);
  assert.ok(section.quiz?.length >= 3 && section.quiz.length <= 5, `${label}: 自测应保持诊断性而非题海`);
  assert.equal(section.summary?.length, 3, `${label}: 小结应收束为 3 条`);
  assert.doesNotMatch(JSON.stringify(section), forbiddenStudentWording, `${label}: 出现面向开发者的内部措辞`);
  assert.doesNotMatch(JSON.stringify(section), forbiddenAiTemplateWording, `${label}: 出现高频 AI 模板措辞`);
}

let chapter;
vm.runInNewContext(
  fs.readFileSync(path.join(root, "current", "content", "ch1.js"), "utf8"),
  { registerAlgebraChapter: (value) => { chapter = value; } },
  { filename: "current/content/ch1.js" },
);
const unitIds = Array.from(chapter.learningUnits, (unit) => Array.from(unit.sections)).flat();
assert.deepEqual(unitIds, expectedIds, "章首页的五个学习单元必须无遗漏、无重复地覆盖 11 节");

const appSource = fs.readFileSync(path.join(root, "current", "app.js"), "utf8");
const lessonRenderer = appSource.slice(appSource.indexOf("function renderLessonPage"), appSource.indexOf("window.renderLessonPage"));
assert.ok(
  lessonRenderer.indexOf("renderInteractiveSection") < lessonRenderer.indexOf("renderFormalSection"),
  "每节应先让学生实验，再由理论解释观察结果",
);

const fieldVisual = fs.readFileSync(path.join(root, "current", "visuals", "ch1", "section1-4-presentation.js"), "utf8");
const qSqrtTwo = fieldVisual.indexOf('formula: "x^2-\\\\sqrt2"');
assert.ok(qSqrtTwo >= 0, "数域透镜必须包含 x²−√2");
assert.match(fieldVisual.slice(qSqrtTwo, qSqrtTwo + 900), /key: "Q2"[^\n]+status: "不可约"/, "x²−√2 在 Q(√2) 中必须显示为不可约");
assert.doesNotMatch(fieldVisual, /correctNumberFieldComparison/, "不得用挂载后的 DOM 补丁掩盖数域数据错误");

const chapterOnePresentationSource = fs.readdirSync(path.join(root, "current", "visuals", "ch1"))
  .filter((filename) => filename.endsWith(".js"))
  .map((filename) => fs.readFileSync(path.join(root, "current", "visuals", "ch1", filename), "utf8"))
  .join("\n");
assert.doesNotMatch(chapterOnePresentationSource, forbiddenAiTemplateWording, "第一章交互出现高频 AI 模板措辞");

const middleVisual = fs.readFileSync(path.join(root, "current", "visuals", "ch1", "section5-8-presentation.js"), "utf8");
assert.match(middleVisual, /\(x\^2\+2\)\^2-\(2x\)\^2/, "x⁴+4 的第二条路线必须是独立的有效恒等变形");
assert.match(middleVisual, /M\(\)\.poly\(\[3, 1\]\)/, "重数实验的固定单根必须避开可调根区间");
assert.match(middleVisual, /实系数奇次多项式至少有一个实根/, "根数构造必须处理奇次零实根的不可能情形");

const finalVisual = fs.readFileSync(path.join(root, "current", "visuals", "ch1", "section9-11-presentation.js"), "utf8");
assert.match(finalVisual, /data-normalization-check/, "§9 必须包含本原化等式核验");
assert.match(finalVisual, /data-vieta-polynomial/, "§11 必须把基本对称多项式连接到 Vieta 系数");

const multivariateVisual = fs.readFileSync(path.join(root, "current", "visuals", "ch1", "layout-rebalance.js"), "utf8");
assert.match(multivariateVisual, /data-coefficient-ledger/, "§10 必须显示目标系数的全部卷积来源");

console.log("Chapter 1 content audit passed: 11 sections, textbook flow, and math boundaries verified.");
