import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = [
  "current/visuals/ch7/story-section1.js",
  "current/visuals/ch7/story-section2.js",
  "current/visuals/ch7/story-section3.js",
  "current/visuals/ch7/story-section4.js",
  "current/visuals/ch7/story-section5.js",
  "current/visuals/ch7/story-section6.js",
  "current/visuals/ch7/story-section7.js",
  "current/visuals/ch7/story-section8.js",
  "current/visuals/ch7/story-section9.js",
];

const nativeEscapes = new Set(["b", "f", "n", "r", "t", "v", "x", "u", "0"]);
const malformed = [];
for (const file of files) {
  const source = await readFile(file, "utf8");
  const pattern = /(?<!\\)\\([A-Za-z]+)/g;
  for (const match of source.matchAll(pattern)) {
    if (nativeEscapes.has(match[1])) continue;
    const line = source.slice(0, match.index).split("\n").length;
    malformed.push(`${file}:${line}:${match[0]}`);
  }
}

assert.deepEqual(malformed, [], `single-backslash LaTeX commands found:\n${malformed.join("\n")}`);
console.log("Chapter 7 source lint passed: LaTeX commands survive JavaScript string parsing.");
