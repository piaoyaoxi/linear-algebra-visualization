/*
 * How a lab writes a measured (floating-point) number. Exact values have their own
 * writers (LAExact.formatF, the chapters' latexF); this is for slider and drag readouts.
 *
 *   LANumber.decimal(value, digits = 2)   rounded to `digits` decimals in its shortest form:
 *                                         1.5 (not 1.50), 2 (not 2.00), never “-0”
 *   LANumber.text(value, digits = 2)      the same for running text, with the true minus
 *                                         sign “−” (TeX keeps “-”, which KaTeX sets as a minus)
 * A value that is not a finite number comes out as String(value); a caller that shows
 * something else for it (0, —) checks first.
 */
(() => {
  function decimal(value, digits = 2) {
    const scale = 10 ** digits;
    const rounded = Math.round(value * scale) / scale;
    // -0.001 rounds to -0, which is written “0”
    return String(rounded === 0 ? 0 : rounded);
  }

  const text = (value, digits = 2) => decimal(value, digits).replace(/^-/, "−");

  window.LANumber = { decimal, text };
})();
