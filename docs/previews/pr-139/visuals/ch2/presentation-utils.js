/* Shared Chapter 2 presentation helpers. */
(() => {
  const M = () => window.Ch2Math;
  const tex = (source) => (window.texInline ? window.texInline(source) : source);
  const display = (source) => (window.texDisplay ? window.texDisplay(source) : source);
  const aEntry = (row, col) => tex(`a_{${row}${col}}`);
  const productTermHtml = (permutation) => permutation.map((col, row) => aEntry(row + 1, col)).join("");
  const formalShell = (title, lead, body) => `<h2>${title}</h2><div class="ch2-formal"><p class="ch2-formal-lead">${lead}</p>${body}</div>`;
  const module = (number, title, subtitle, body) => `<section class="ch2-module"><div class="ch2-module-heading"><span>${number}</span><div><h3>${title}</h3><p>${subtitle}</p></div></div>${body}</section>`;
  const proofSteps = (items) => `<ol class="ch2-proof-steps">${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
  const misconception = (items) => `<div class="ch2-misconception"><strong>辨析</strong><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul></div>`;
  const taskBox = (title, text) => `<div class="ch2-reading-note"><strong>${title}</strong><p>${text}</p></div>`;
  window.Ch2PresentationUtils = { M, tex, display, aEntry, productTermHtml, formalShell, module, proofSteps, misconception, taskBox };
})();
