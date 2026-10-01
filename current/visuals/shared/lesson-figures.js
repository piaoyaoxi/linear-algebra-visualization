/*
 * Static SVG figures for lesson-extras.js. Colours come from CSS classes
 * (lesson-extras.css), so the figures follow the light and dark themes.
 */
(() => {
  const define = window.defineLessonFigure;
  if (!define) return;
  const sub = (n) => String(n).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]);

  /* ch1 §2: a_i b_j in row i, column j; one anti-diagonal gives the x^k coefficient. */
  define("poly-product-table", () => {
    const a = [2, -1, 3];
    const b = [1, 2, 1];
    const k = 2;
    const c = 58;
    const x0 = 120;
    const y0 = 52;
    let cells = "";
    a.forEach((ai, i) =>
      b.forEach((bj, j) => {
        const hi = i + j === k;
        const x = x0 + j * c;
        const y = y0 + i * c;
        cells += `<rect x="${x}" y="${y}" width="${c - 6}" height="${c - 6}" rx="8" class="${hi ? "lx-svg-hi" : "lx-svg-cell"}"/>`;
        cells += `<text x="${x + (c - 6) / 2}" y="${y + (c - 6) / 2 + 5}" text-anchor="middle" class="lx-svg-text">${ai * bj}</text>`;
      }),
    );
    const head = b.map((bj, j) => `<text x="${x0 + j * c + (c - 6) / 2}" y="${y0 - 14}" text-anchor="middle" class="lx-svg-muted">b${sub(j)}=${bj}</text>`).join("");
    const side = a.map((ai, i) => `<text x="${x0 - 14}" y="${y0 + i * c + (c - 6) / 2 + 5}" text-anchor="end" class="lx-svg-muted">a${sub(i)}=${ai}</text>`).join("");
    const sum = `<text x="${x0 + 3 * c + 30}" y="${y0 + 1.5 * c - 18}" class="lx-svg-text">i+j=2 的格子：</text>
      <text x="${x0 + 3 * c + 30}" y="${y0 + 1.5 * c + 8}" class="lx-svg-text">2 + (−2) + 3 = 3</text>
      <text x="${x0 + 3 * c + 30}" y="${y0 + 1.5 * c + 34}" class="lx-svg-muted">= fg 中 x² 的系数</text>`;
    return `<svg viewBox="0 0 520 240" role="img" aria-label="系数乘法表">${head}${side}${cells}${sum}</svg>`;
  });

  /* ch1 §4: roots of f and g in the complex plane; the shared root is the root of gcd(f,g). */
  define("gcd-common-roots", () => {
    const W = 520;
    const H = 230;
    const ox = 260;
    const oy = 118;
    const s = 62;
    const P = (re, im) => [ox + re * s, oy - im * s];
    let grid = `<line x1="40" y1="${oy}" x2="${W - 40}" y2="${oy}" class="lx-svg-line"/><line x1="${ox}" y1="16" x2="${ox}" y2="${H - 16}" class="lx-svg-line"/>`;
    grid += `<text x="${W - 46}" y="${oy - 8}" class="lx-svg-muted">实轴</text><text x="${ox + 8}" y="26" class="lx-svg-muted">虚轴</text>`;
    const fRoots = [[1, 0, "1"], [0, 1, "i"], [0, -1, "−i"]];
    const gRoots = [[1, 0], [-2, 0, "−2"]];
    let marks = "";
    fRoots.forEach(([re, im, t]) => {
      const [x, y] = P(re, im);
      marks += `<circle cx="${x}" cy="${y}" r="11" fill="none" stroke="var(--accent)" stroke-width="2.4"/>`;
      if (t) marks += `<text x="${x + 15}" y="${y - 10}" class="lx-svg-text">${t}</text>`;
    });
    gRoots.forEach(([re, im, t]) => {
      const [x, y] = P(re, im);
      marks += `<circle cx="${x}" cy="${y}" r="5.5" class="lx-svg-dot2"/>`;
      if (t) marks += `<text x="${x - 6}" y="${y + 24}" class="lx-svg-text">${t}</text>`;
    });
    const legend = `<circle cx="56" cy="34" r="8" fill="none" stroke="var(--accent)" stroke-width="2.2"/><text x="72" y="39" class="lx-svg-muted">f=(x−1)(x²+1) 的根</text>
      <circle cx="56" cy="60" r="5" class="lx-svg-dot2"/><text x="72" y="65" class="lx-svg-muted">g=(x−1)(x+2) 的根</text>`;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="两个多项式的根与公共根">${grid}${legend}${marks}</svg>`;
  });

  /* ch2 §3: the six terms of a 3x3 determinant as rook placements. */
  define("det3-rooks", () => {
    const perms = [
      [[1, 2, 3], "+"],
      [[2, 3, 1], "+"],
      [[3, 1, 2], "+"],
      [[1, 3, 2], "−"],
      [[2, 1, 3], "−"],
      [[3, 2, 1], "−"],
    ];
    const c = 20;
    const gap = 26;
    const bw = 3 * c;
    let out = "";
    perms.forEach(([p, sign], k) => {
      const x0 = 14 + (k % 3) * (bw + gap);
      const y0 = 14 + Math.floor(k / 3) * 128;
      for (let i = 0; i < 3; i += 1)
        for (let j = 0; j < 3; j += 1) out += `<rect x="${x0 + j * c}" y="${y0 + i * c}" width="${c}" height="${c}" class="lx-svg-cell"/>`;
      p.forEach((col, i) => {
        out += `<circle cx="${x0 + (col - 1) * c + c / 2}" cy="${y0 + i * c + c / 2}" r="6" class="${sign === "+" ? "lx-svg-dot" : "lx-svg-dot2"}"/>`;
      });
      out += `<text x="${x0 + bw / 2}" y="${y0 + bw + 20}" text-anchor="middle" class="lx-svg-text">${sign} ${p.join("")}</text>`;
      out += `<text x="${x0 + bw / 2}" y="${y0 + bw + 38}" text-anchor="middle" class="lx-svg-muted">a₁${sub(p[0])}a₂${sub(p[1])}a₃${sub(p[2])}</text>`;
    });
    return `<svg viewBox="0 0 ${14 + 3 * (bw + gap)} 262" role="img" aria-label="三阶行列式的六个项" style="max-width:420px;margin:0 auto">${out}</svg>`;
  });
})();
