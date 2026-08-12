const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const contentFiles = [
  "current/content/ch4-registry.js",
  "current/content/ch4-section1.js",
  "current/content/ch4-section2.js",
  "current/content/ch4-core.js",
  "current/content/ch4-section3.js",
  "current/content/ch4-section4.js",
  "current/content/ch4-block.js",
  "current/content/ch4.js",
  "current/content/ch4-assemble.js",
];
const visualFiles = [
  "current/visuals/ch4/registry.js",
  "current/visuals/ch4/section1-presentation.js",
  "current/visuals/ch4/section2-presentation.js",
  "current/visuals/ch4/section3-presentation.js",
  "current/visuals/ch4/section4-presentation.js",
  "current/visuals/ch4/core-presentation.js",
  "current/visuals/ch4/block-presentation.js",
];

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}

function auditSourceEscapes() {
  const findings = [];

  for (const relative of contentFiles.filter((file) => file.endsWith(".js"))) {
    const source = read(relative);
    for (const match of source.matchAll(/\\+/g)) {
      if (match[0].length % 2 !== 0) {
        const line = source.slice(0, match.index).split("\n").length;
        findings.push(`${relative}:${line} has an odd source backslash run`);
      }
    }
  }

  const commands = [
    "begin", "end", "frac", "tfrac", "sum", "qquad", "quad", "operatorname",
    "mathbb", "det", "leftarrow", "rightarrow", "leftrightarrow", "longrightarrow",
    "times", "le", "leq", "ne", "in", "cdot", "top", "text", "mid", "color",
    "Longrightarrow", "xrightarrow",
  ];

  for (const relative of visualFiles) {
    const source = read(relative);
    const lines = source.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const command of commands) {
        let cursor = 0;
        while (cursor < line.length) {
          const position = line.indexOf(command, cursor);
          if (position < 0) break;
          let slashCount = 0;
          for (let at = position - 1; at >= 0 && line[at] === "\\"; at -= 1) slashCount += 1;
          if (slashCount % 2 !== 0) {
            findings.push(`${relative}:${index + 1} under-escapes \\${command}`);
          }
          cursor = position + command.length;
        }
      }
    });
  }

  assert.deepEqual(findings, [], `TeX source escape errors:\n${findings.join("\n")}`);
}

function loadChapter() {
  const algebraContent = { chapters: [] };
  const context = {
    algebraContent,
    console,
    texInline: (formula) => formula,
    registerAlgebraChapter: (chapter) => algebraContent.chapters.push(chapter),
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);

  for (const relative of contentFiles) {
    vm.runInContext(read(relative), context, { filename: relative });
  }

  return algebraContent.chapters.find((chapter) => chapter.id === "ch4");
}

function walkStrings(value, visit, trail = "chapter") {
  if (typeof value === "string") {
    visit(value, trail);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, visit, `${trail}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => walkStrings(item, visit, `${trail}.${key}`));
  }
}

function multiply(left, right) {
  assert.equal(left[0].length, right.length, "matrix dimensions must align");
  return left.map((row) =>
    right[0].map((_, column) =>
      row.reduce((sum, value, index) => sum + value * right[index][column], 0)
    )
  );
}

function multiplyVector(matrix, vector) {
  return matrix.map((row) => row.reduce((sum, value, index) => sum + value * vector[index], 0));
}

function add(left, right) {
  return left.map((row, i) => row.map((value, j) => value + right[i][j]));
}

function subtract(left, right) {
  return left.map((row, i) => row.map((value, j) => value - right[i][j]));
}

function scale(matrix, factor) {
  return matrix.map((row) => row.map((value) => value * factor));
}

function determinant(matrix) {
  if (matrix.length === 1) return matrix[0][0];
  if (matrix.length === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  return matrix[0].reduce((sum, value, column) => {
    const minor = matrix.slice(1).map((row) => row.filter((_, index) => index !== column));
    return sum + (column % 2 ? -1 : 1) * value * determinant(minor);
  }, 0);
}

function rank(matrix, epsilon = 1e-10) {
  const work = matrix.map((row) => [...row]);
  let pivotRow = 0;
  for (let column = 0; column < work[0].length && pivotRow < work.length; column += 1) {
    let best = pivotRow;
    for (let row = pivotRow + 1; row < work.length; row += 1) {
      if (Math.abs(work[row][column]) > Math.abs(work[best][column])) best = row;
    }
    if (Math.abs(work[best][column]) <= epsilon) continue;
    [work[pivotRow], work[best]] = [work[best], work[pivotRow]];
    const pivot = work[pivotRow][column];
    for (let entry = column; entry < work[0].length; entry += 1) work[pivotRow][entry] /= pivot;
    for (let row = 0; row < work.length; row += 1) {
      if (row === pivotRow) continue;
      const factor = work[row][column];
      for (let entry = column; entry < work[0].length; entry += 1) {
        work[row][entry] -= factor * work[pivotRow][entry];
      }
    }
    pivotRow += 1;
  }
  return pivotRow;
}

function inverse2(matrix) {
  const det = determinant(matrix);
  assert.notEqual(det, 0, "matrix must be invertible");
  return scale([[matrix[1][1], -matrix[0][1]], [-matrix[1][0], matrix[0][0]]], 1 / det);
}

function approxEqual(actual, expected, epsilon = 1e-9) {
  if (Array.isArray(expected)) {
    assert.ok(Array.isArray(actual), "expected an array");
    assert.equal(actual.length, expected.length);
    expected.forEach((value, index) => approxEqual(actual[index], value, epsilon));
    return;
  }
  assert.ok(Math.abs(actual - expected) <= epsilon, `expected ${actual} ≈ ${expected}`);
}

function identity(size) {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => (row === column ? 1 : 0))
  );
}

function auditStructure(chapter) {
  assert.ok(chapter, "Chapter 4 must load");
  assert.equal(chapter.sections.length, 7);
  assert.deepEqual(
    Array.from(chapter.sections, (section) => section.id),
    [
      "matrix-language",
      "matrix-operations",
      "matrix-product-determinant-rank",
      "matrix-inverse",
      "block-matrices",
      "elementary-matrices",
      "block-elementary-applications",
    ]
  );

  const knownSources = /Strang|Lay|Hoffman|Friedberg|Axler|Linear Algebra and Learning from Data/;
  for (const section of chapter.sections) {
    for (const field of ["question", "goal", "intro"]) {
      assert.ok(typeof section[field] === "string" && section[field].length > 20, `${section.id} lacks ${field}`);
    }
    assert.ok(section.concepts.length >= 5, `${section.id} needs a complete concept chain`);
    assert.match(section.textbook.reference, knownSources, `${section.id} lacks an American textbook source`);
    assert.ok(section.textbook.items.length >= 3, `${section.id} needs source-to-teaching notes`);
    assert.equal(section.example.choices.length, 4, `${section.id} example needs four choices`);
    assert.equal(section.example.choices.filter((choice) => choice.correct).length, 1, `${section.id} needs one correct choice`);
    assert.ok(section.example.steps.length >= 4, `${section.id} example needs a worked analysis`);
    assert.ok(section.example.audit, `${section.id} example needs auditable data`);
    assert.ok(section.quiz.length >= 5, `${section.id} needs a substantial self-test`);
    assert.ok(section.summary.length >= 4, `${section.id} needs a substantive summary`);
    assert.ok(section.exercises.length >= 3, `${section.id} needs exercises`);
  }

  const forbidden = /北大|北京大学|Peking|待补足|占位|原型|开发进度|未来生产/;
  const control = /[\u0000-\u001f\u007f]/;
  walkStrings(chapter, (text, trail) => {
    assert.doesNotMatch(text, forbidden, `internal or obsolete wording at ${trail}`);
    assert.doesNotMatch(text, control, `control character from a broken escape at ${trail}`);
  });

  const base = read("current/content/ch4.js");
  assert.doesNotMatch(base, /\b(question|concepts|quiz|example|exercises)\s*:/, "ch4.js must remain metadata-only");
}

function auditExamples(chapter) {
  const byId = Object.fromEntries(chapter.sections.map((section) => [section.id, section.example.audit]));

  const s1 = byId["matrix-language"];
  approxEqual(multiplyVector(s1.matrix, s1.vector), s1.product);

  const s2 = byId["matrix-operations"];
  approxEqual(multiply(s2.a, s2.b), s2.ab);
  approxEqual(multiply(s2.b, s2.a), s2.ba);

  const s3 = byId["matrix-product-determinant-rank"];
  approxEqual(multiply(s3.a, s3.b), s3.ab);
  approxEqual(determinant(s3.ab), s3.detAB);
  assert.equal(rank(s3.ab), s3.rankAB);
  assert.equal(rank(s3.b), 1);
  assert.notEqual(determinant(s3.a), 0);

  const s4 = byId["matrix-inverse"];
  assert.equal(determinant(s4.matrix), s4.determinant);
  const inverse = scale(s4.inverseNumerator, 1 / s4.inverseDenominator);
  approxEqual(multiply(s4.matrix, inverse), identity(2));
  approxEqual(multiply(inverse, s4.matrix), identity(2));
  approxEqual(multiplyVector(s4.matrix, s4.solution), s4.rhs);

  const s5 = byId["block-matrices"];
  approxEqual(add(multiply(s5.a11, s5.b12), multiply(s5.a12, s5.b22)), s5.c12);

  const s6 = byId["elementary-matrices"];
  approxEqual(multiply(s6.elementary, s6.matrix), s6.product);
  approxEqual(multiply(s6.inverse, s6.elementary), identity(2));
  approxEqual(multiply(s6.inverse, s6.product), s6.matrix);

  const s7 = byId["block-elementary-applications"];
  const aInverse = inverse2(s7.a);
  const schur = subtract(s7.d, multiply(multiply(s7.c, aInverse), s7.b));
  approxEqual(schur, s7.schur);
  const reducedRhs = s7.g.map((value, index) =>
    value - multiplyVector(multiply(s7.c, aInverse), s7.f)[index]
  );
  approxEqual(reducedRhs, s7.reducedRhs);
  approxEqual(multiplyVector(s7.schur, s7.y), s7.reducedRhs);
  const firstLeft = multiplyVector(s7.a, s7.x).map((value, index) => value + multiplyVector(s7.b, s7.y)[index]);
  const secondLeft = multiplyVector(s7.c, s7.x).map((value, index) => value + multiplyVector(s7.d, s7.y)[index]);
  approxEqual(firstLeft, s7.f);
  approxEqual(secondLeft, s7.g);
}

function auditPresentationAlignment() {
  const section1 = read("current/visuals/ch4/section1-presentation.js");
  assert.match(section1, /\["mirror", "镜像", \[-1, 0, 0, 1\]\]/, "Section 1 task and presets must agree");

  const section3 = read("current/visuals/ch4/section3-presentation.js");
  assert.match(section3, /s3-det-proof-title/, "Section 3 must include the algebraic determinant proof");
  assert.match(section3, /\\\\ker\(B\)\\\\subseteq\\\\ker\(AB\)/, "Section 3 must expose the kernel proof of the second rank bound");

  const blocks = read("current/visuals/ch4/block-presentation.js");
  for (const expected of [
    '["A12", "A₁₂", "2 × 1"]',
    '["A22", "A₂₂", "1 × 1"]',
    '["B21", "B₂₁", "1 × 1"]',
    '["B22", "B₂₂", "1 × 2"]',
  ]) {
    assert.ok(blocks.includes(expected), `Section 5 visual must match the example block shape: ${expected}`);
  }
  assert.match(blocks, /D-CA\^\{-1\}B/, "Section 7 interaction must use the general Schur complement");
}

auditSourceEscapes();
const chapter = loadChapter();
auditStructure(chapter);
auditExamples(chapter);
auditPresentationAlignment();

console.log("Chapter 4 content audit passed: 7 sections, source hygiene, and all representative computations verified.");
