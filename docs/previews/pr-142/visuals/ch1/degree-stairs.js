/* Chapter 1 degree staircase: the remainder degrees of §3 (long division) and §4 (Euclid) as an SVG. */
(() => {
  "use strict";

  const svgEsc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);

  /*
   * bars: [{ label, deg (null for the zero polynomial), role: "f" | "g" | "r" }]
   * line: { deg, label } draws a dashed level (deg g in §3); highlight: index of the glowing bar.
   * Only bars already reached are passed in, so earlier steps stay as the staircase.
   */
  function degreeStairs(bars, { maxDeg, line = null, highlight = -1, highlightLabel = "", topLabel = "" } = {}) {
    const unit = 24;
    const top = 26;
    const left = 46;
    const step = 54;
    const barW = 28;
    const levels = Math.max(1, maxDeg);
    const y = (d) => top + (levels - d) * unit;
    const base = y(0) + 14;
    // the zero polynomial has no degree: it is an empty slot below the axis
    const hasZero = bars.some((bar) => bar.deg == null);
    const nameY = base + (hasZero ? 36 : 20);
    const width = Math.max(280, left + bars.length * step + 100);
    const height = nameY + (highlightLabel ? 32 : 10);
    const out = [`<svg class="ch1-stairs-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="余式次数逐步下降">`];
    for (let d = 0; d <= levels; d += 1) {
      out.push(`<line class="ch1-stairs-grid" x1="${left - 8}" x2="${width - 8}" y1="${y(d)}" y2="${y(d)}"></line>`);
      out.push(`<text class="ch1-stairs-tick" x="${left - 14}" y="${y(d) + 4}" text-anchor="end">${d}</text>`);
    }
    out.push(`<text class="ch1-stairs-axis" x="6" y="${top - 12}">次数</text>`);
    if (line) {
      out.push(`<line class="ch1-stairs-level" x1="${left - 8}" x2="${width - 8}" y1="${y(line.deg)}" y2="${y(line.deg)}"></line>`);
      out.push(`<text class="ch1-stairs-level-label" x="${width - 10}" y="${y(line.deg) - 6}" text-anchor="end">${svgEsc(line.label)}</text>`);
    }
    bars.forEach((bar, i) => {
      const x = left + 10 + i * step;
      const cx = x + barW / 2;
      const role = `is-${bar.role}`;
      if (bar.deg == null) {
        out.push(`<rect class="ch1-stairs-zero ${role}" x="${x}" y="${base + 3}" width="${barW}" height="14" rx="2"></rect>`);
        out.push(`<text class="ch1-stairs-zero-label ${role}" x="${cx}" y="${base - 6}" text-anchor="middle">0 多项式</text>`);
      } else {
        const h = base - y(bar.deg);
        if (i === highlight) out.push(`<rect class="ch1-stairs-glow ${role}" x="${x - 4}" y="${y(bar.deg) - 4}" width="${barW + 8}" height="${h + 4}" rx="5"></rect>`);
        out.push(`<rect class="ch1-stairs-bar ${role}" x="${x}" y="${y(bar.deg)}" width="${barW}" height="${h}" rx="3"></rect>`);
        out.push(`<text class="ch1-stairs-value ${role}" x="${cx}" y="${y(bar.deg) - 7}" text-anchor="middle">${bar.deg}</text>`);
        if (i === highlight && topLabel) out.push(`<text class="ch1-stairs-top ${role}" x="${cx}" y="${Math.max(12, y(bar.deg) - 24)}" text-anchor="middle">${svgEsc(topLabel)}</text>`);
      }
      out.push(`<text class="ch1-stairs-name ${role}" x="${cx}" y="${nameY}" text-anchor="middle">${svgEsc(bar.label)}</text>`);
      if (i > 0) {
        const prev = bars[i - 1];
        const from = prev.deg == null ? base + 17 : y(prev.deg);
        const to = bar.deg == null ? base + 3 : y(bar.deg);
        out.push(`<path class="ch1-stairs-step" d="M${x - step + barW} ${from} H${x}${to !== from ? ` V${to}` : ""}"></path>`);
      }
      if (i === highlight && highlightLabel) {
        out.push(`<text class="ch1-stairs-callout ${role}" x="${x - 6}" y="${nameY + 22}">↑ ${svgEsc(highlightLabel)}</text>`);
      }
    });
    out.push("</svg>");
    return out.join("");
  }

  // r₁, r₂, … for the bar labels
  const sub = (k) => String(k).split("").map((c) => "₀₁₂₃₄₅₆₇₈₉"[Number(c)]).join("");
  window.Ch1Stairs = { degreeStairs, sub };
})();
