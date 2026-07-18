const fs = require("node:fs");
const path = require("node:path");

const roots = [
  "current/content",
  "current/visuals/ch10",
  "current/structured-learning.js",
];
const commands = [
  "begin", "end", "frac", "sum", "lambda", "omega", "delta", "operatorname",
  "mathbb", "ker", "det", "dim", "in", "to", "ne", "forall", "cdot", "mapsto",
  "langle", "rangle", "diag",
];
const spacingCharacters = new Set([";", ",", "!", ":"]);
const findings = [];

function slashRunBefore(line, index) {
  let slashCount = 0;
  for (let position = index - 1; position >= 0 && line[position] === "\\"; position -= 1) slashCount += 1;
  return slashCount;
}

function recordOddRun(file, line, lineNumber, token, index) {
  const slashCount = slashRunBefore(line, index);
  if (slashCount % 2 === 1) {
    findings.push({ file, line: lineNumber, token, slashCount, text: line.trim() });
  }
}

function inspectLine(file, line, lineNumber) {
  for (const command of commands) {
    let cursor = 0;
    while (cursor < line.length) {
      const index = line.indexOf(command, cursor);
      if (index < 0) break;
      recordOddRun(file, line, lineNumber, `\\${command}`, index);
      cursor = index + command.length;
    }
  }

  for (let index = 0; index < line.length; index += 1) {
    if (spacingCharacters.has(line[index])) {
      recordOddRun(file, line, lineNumber, `\\${line[index]}`, index);
    }
  }
}

function visit(target) {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target)) visit(path.join(target, entry));
    return;
  }
  if (!target.endsWith(".js")) return;
  const lines = fs.readFileSync(target, "utf8").split(/\r?\n/);
  lines.forEach((line, index) => inspectLine(target, line, index + 1));
}

roots.forEach((root) => visit(root));
console.log(JSON.stringify({ findings }, null, 2));
if (findings.length) process.exitCode = 1;
