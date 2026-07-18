(() => {
  function arrowPath(x1, y1, x2, y2, options = {}) {
    const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy);
    if (length < 1.5) return "";
    const ux = dx / length, uy = dy / length, px = -uy, py = ux;
    const halfWidth = options.halfWidth ?? 3.1;
    const headLength = Math.min(options.maxHeadLength ?? 22, Math.max(options.minHeadLength ?? 15, length * .18));
    const headHalf = options.headHalf ?? 8.2;
    const neckX = x2 - ux * headLength, neckY = y2 - uy * headLength;
    const f = (value) => Number(value).toFixed(2);
    const p = (x, y) => `${f(x)} ${f(y)}`;
    return [`M ${p(x1 + px * halfWidth, y1 + py * halfWidth)}`, `L ${p(neckX + px * halfWidth, neckY + py * halfWidth)}`, `L ${p(neckX + px * headHalf, neckY + py * headHalf)}`, `Q ${p(x2 - ux * headLength * .16 + px * 1.1, y2 - uy * headLength * .16 + py * 1.1)} ${p(x2, y2)}`, `Q ${p(x2 - ux * headLength * .16 - px * 1.1, y2 - uy * headLength * .16 - py * 1.1)} ${p(neckX - px * headHalf, neckY - py * headHalf)}`, `L ${p(neckX - px * halfWidth, neckY - py * halfWidth)}`, `L ${p(x1 - px * halfWidth, y1 - py * halfWidth)}`, `A ${halfWidth} ${halfWidth} 0 0 0 ${p(x1 + px * halfWidth, y1 + py * halfWidth)}`, "Z"].join(" ");
  }

  function vectorMarkup(origin, endpoint, role, label, labelOffset = [10, -10]) {
    const d = arrowPath(origin[0], origin[1], endpoint[0], endpoint[1]);
    if (!d) return `<circle cx="${origin[0]}" cy="${origin[1]}" r="8" class="story-zero-origin"/><text x="${origin[0] + 12}" y="${origin[1] - 12}" class="story-label">${label}=0</text>`;
    return `<path d="${d}" class="story-arrow-shape ${role}"/><text x="${endpoint[0] + labelOffset[0]}" y="${endpoint[1] + labelOffset[1]}" class="story-label">${label}</text>`;
  }

  function gridMarkup(width, height, step = 50) {
    const vertical = Array.from({ length: Math.ceil(width / step) + 1 }, (_, i) => `<line x1="${i * step}" y1="0" x2="${i * step}" y2="${height}"/>`).join("");
    const horizontal = Array.from({ length: Math.ceil(height / step) + 1 }, (_, i) => `<line x1="0" y1="${i * step}" x2="${width}" y2="${i * step}"/>`).join("");
    return `<g class="story-grid">${vertical}${horizontal}</g>`;
  }
  window.Ch2VectorPolish = { arrowPath, vectorMarkup, gridMarkup };
})();