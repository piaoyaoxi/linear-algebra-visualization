const fs = require("node:fs");
const vm = require("node:vm");

const context = {
  console,
  texInline(source) {
    return "\\(" + source + "\\)";
  },
};
context.window = context;
vm.createContext(context);

const sourceFiles = [
  "current/content/ch10-registry.js",
  "current/content/ch10-section1.js",
  "current/content/ch10-section2.js",
  "current/content/ch10-section3.js",
  "current/content/ch10-section4.js",
];

for (const file of sourceFiles) {
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
}

const sections = context.getChapter10Sections();
const expectedIds = [
  "linear-functional",
  "dual-space",
  "bilinear-form",
  "symplectic-space",
];
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

check(
  JSON.stringify(sections.map((section) => section.id)) === JSON.stringify(expectedIds),
  "section order differs: " + sections.map((section) => section.id).join(", "),
);

for (const section of sections) {
  const prefix = section.id;
  check(section.question?.length >= 20, prefix + ": opening question is too thin");
  check(section.goal?.length >= 35, prefix + ": learning goal is too thin");
  check(section.intro?.length >= 90, prefix + ": introduction is too thin");
  check(section.textbook?.reference, prefix + ": textbook source map is missing");
  check(section.textbook?.items?.length >= 4, prefix + ": textbook topic map is incomplete");
  check(section.interactive?.question?.length >= 20, prefix + ": interaction question is too thin");
  check(section.concepts?.length >= 3, prefix + ": formal concept spine is incomplete");
  check(section.example?.question, prefix + ": representative example is missing");
  check(section.example?.steps?.length >= 6, prefix + ": example reasoning has fewer than six steps");
  check(section.quiz?.length >= 6, prefix + ": self-test has fewer than six prompts");
  check(section.summary?.length >= 4, prefix + ": summary does not close the learning loop");

  const studentText = JSON.stringify({
    question: section.question,
    goal: section.goal,
    intro: section.intro,
    concepts: section.concepts,
    example: section.example,
    quiz: section.quiz,
    summary: section.summary,
  });
  check(!/正在开发|原型|占位|待补充|未来制作/.test(studentText), prefix + ": internal wording leaked");
  check(!/不是.{0,24}而是/.test(studentText), prefix + ": contrastive anti-pattern leaked");
}

function collectStrings(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(collectStrings).join("\n");
  if (value && typeof value === "object") return Object.values(value).map(collectStrings).join("\n");
  return "";
}

const byId = Object.fromEntries(sections.map((section) => [section.id, collectStrings(section)]));
const requiredIdeas = {
  "linear-functional": [
    "\\dim\\ker f=n-1",
    "f^{-1}(4)=p+\\ker f",
    "f(x)=\\sum_i x_i f(v_i)",
  ],
  "dual-space": [
    "x=\\sum_i v^i(x)v_i",
    "f=\\sum_i f(v_i)v^i",
    "(S\\circ T)^*=T^*\\circ S^*",
    "J(x)(f)=f(x)",
  ],
  "bilinear-form": [
    "A_{\\rm new}=P^TA_{\\rm old}Q",
    "A_{\\rm new}=P^TAP",
    "\\ker A^T",
    "S=(A+A^T)/2",
  ],
  "symplectic-space": [
    "V=W_1\\oplus W_1^\\omega",
    "J=\\begin{bmatrix}0&I\\\\-I&0\\end{bmatrix}",
    "D^TJD\\ne J",
    "S^TJS=J",
  ],
};

for (const [id, ideas] of Object.entries(requiredIdeas)) {
  for (const idea of ideas) {
    check(byId[id]?.includes(idea), id + ": required idea missing: " + idea);
  }
}

const report = {
  sections: sections.map((section) => ({
    id: section.id,
    concepts: section.concepts.length,
    exampleSteps: section.example.steps.length,
    quizItems: section.quiz.length,
    summaryItems: section.summary.length,
  })),
  failures,
};

console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
