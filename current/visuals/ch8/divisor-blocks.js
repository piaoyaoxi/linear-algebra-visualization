/*
 * The model of the §5 elementary-divisor lab (divisorLab in visuals/ch8/labs.js): which
 * blocks a preset has over a field, how they line up in the two views, and the TeX of each
 * invariant factor. Pure functions, unit-tested in tests/lab-math.test.mjs.
 *
 * A preset is a list of rows, one per invariant factor d₁ … dₙ, each { prime: exponent }.
 * PRIMES are the irreducible factors over the reals; one with `split` breaks into those
 * factors over the complex numbers. A field is "R" or "C".
 */
(() => {
  const PRIMES = {
    a: { tex: "\\lambda-1", text: "λ−1", deg: 1, color: "v1" },
    b: { tex: "\\lambda+2", text: "λ+2", deg: 1, color: "v2" },
    c: { tex: "\\lambda+1", text: "λ+1", deg: 1, color: "v2" },
    q: { tex: "\\lambda^2+1", text: "λ²+1", deg: 2, color: "subspace", split: ["ip", "im"] },
    ip: { tex: "\\lambda-\\mathrm{i}", text: "λ−i", deg: 1, color: "subspace" },
    im: { tex: "\\lambda+\\mathrm{i}", text: "λ+i", deg: 1, color: "image" },
  };
  const SUPS = ["", "", "²", "³", "⁴"];

  /* One block per (row, prime power) over the field; a split block keeps its parent's id. */
  function blocks(rows, field) {
    const out = [];
    rows.forEach((row, r) =>
      Object.entries(row).forEach(([p, e]) => {
        const prime = PRIMES[p];
        if (field === "C" && prime.split) prime.split.forEach((s) => out.push({ id: `${r}-${s}`, parent: `${r}-${p}`, r, p: s, e }));
        else out.push({ id: `${r}-${p}`, r, p, e });
      }),
    );
    return out;
  }

  const hasSplit = (rows) => blocks(rows, "R").some((b) => PRIMES[b.p].split);

  /* Elementary-divisor view: one line per prime, powers in increasing order. */
  function lines(list) {
    const groups = new Map();
    list.forEach((b) => groups.set(b.p, [...(groups.get(b.p) || []), b]));
    return [...groups.values()].map((g) => g.sort((p, q) => p.e - q.e));
  }

  const label = (b) => (b.e > 1 ? `(${PRIMES[b.p].text})${SUPS[b.e]}` : PRIMES[b.p].text);
  const tex = (b) => (b.e > 1 ? `(${PRIMES[b.p].tex})^{${b.e}}` : PRIMES[b.p].tex);

  /* d₁ … dₙ in TeX over the field: the product of a row's prime powers, 1 for none */
  function invariantTex(rows, field) {
    return rows.map((row) => {
      const list = Object.entries(row).flatMap(([p, e]) => (field === "C" && PRIMES[p].split ? PRIMES[p].split.map((s) => ({ p: s, e })) : [{ p, e }]));
      return list.length ? list.map((b) => (list.length > 1 && b.e === 1 ? `(${PRIMES[b.p].tex})` : tex(b))).join("") : "1";
    });
  }

  /*
   * Where each block sits on a canvas of width × height (CSS pixels), by block id:
   * { x, y, w, h }. view "inv": one row per invariant factor (d₁ … the first non-trivial one
   * are left out); view "ed": one line per prime. One width per degree in both views and
   * both fields, so a block keeps its size while it moves; one block height for all of
   * them, as tall as the most lines any of them needs allows (the row label above the stack
   * takes 24px at the top, the λ²+1 note 34px at the bottom).
   */
  const ROW_GAP = 18;
  function layout(rows, { view, field, width: w, height: h }) {
    const firstRow = rows.findIndex((row) => Object.keys(row).length);
    const shown = rows.length - firstRow;
    const left = w < 520 ? 74 : 110;
    const room = w - left - 40;
    const units = (list) => list.reduce((s, b) => s + PRIMES[b.p].deg * b.e, 0);
    const unit = Math.min(
      112,
      ...rows.map((row, r) => room / Math.max(units(blocks(rows, "R").filter((b) => b.r === r)), 3)),
      ...["R", "C"].flatMap((f) => lines(blocks(rows, f)).map((g) => (room - 10 * (g.length - 1)) / Math.max(units(g), 3))),
    );
    const most = Math.max(2, shown, ...["R", "C"].map((f) => lines(blocks(rows, f)).length));
    const bh = Math.max(34, Math.min(76, (h - 64) / most - ROW_GAP));
    const stackTop = (n) => 30 + (h - 64 - n * (bh + ROW_GAP) + ROW_GAP) / 2;
    const pos = new Map();
    if (view === "inv") {
      const top = stackTop(shown);
      rows.forEach((row, r) => {
        let x = left;
        const y = top + (r - firstRow) * (bh + ROW_GAP);
        Object.entries(row).forEach(([p, e]) => {
          const parts = field === "C" && PRIMES[p].split ? PRIMES[p].split : [p];
          parts.forEach((s) => {
            const bw = PRIMES[s].deg * e * unit;
            pos.set(`${r}-${s}`, { x, y, w: bw - 6, h: bh });
            x += bw;
          });
        });
      });
      return { pos, top, firstRow, left, bh };
    }
    const groups = lines(blocks(rows, field));
    const top = stackTop(groups.length);
    groups.forEach((g, li) => {
      let x = left;
      g.forEach((b) => {
        const bw = PRIMES[b.p].deg * b.e * unit;
        pos.set(b.id, { x, y: top + li * (bh + ROW_GAP), w: bw - 6, h: bh });
        x += bw + 10;
      });
    });
    return { pos, top, firstRow, left, bh };
  }

  window.Ch8Blocks = { PRIMES, SUPS, ROW_GAP, blocks, hasSplit, lines, label, tex, invariantTex, layout };
})();
