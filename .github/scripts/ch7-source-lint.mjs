import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { readdir } from "node:fs/promises";
const files = [
  ...(await readdir("current/content")).filter((f) => /^ch7[-.]/.test(f)).map((f) => `current/content/${f}`),
  ...(await readdir("current/visuals/ch7")).filter((f) => f.endsWith(".js")).map((f) => `current/visuals/ch7/${f}`),
];

const nativeEscapes = new Set(["b", "f", "n", "r", "t", "v", "x", "u", "0"]);
const malformed = [];
for (const file of files) {
  // String.raw`...` templates keep single backslashes on purpose; blank them out
  // (keeping line breaks so reported line numbers stay right).
  const source = (await readFile(file, "utf8")).replace(/String\.raw`[^`]*`|\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  const pattern = /(?<!\\)\\([A-Za-z]+)/g;
  for (const match of source.matchAll(pattern)) {
    if (nativeEscapes.has(match[1])) continue;
    const line = source.slice(0, match.index).split("\n").length;
    malformed.push(`${file}:${line}:${match[0]}`);
  }
}

assert.deepEqual(malformed, [], `single-backslash LaTeX commands found:\n${malformed.join("\n")}`);
console.log("Chapter 7 source lint passed: LaTeX commands survive JavaScript string parsing.");
