/*
 * Chapter 4 §5 矩阵的分块: block multiplication with real sizes.
 * The student cuts A (3x4) and B (4x3). Block products are defined only when
 * A's column cut matches B's row cut; then any output block C_ij can be checked
 * numerically against the corresponding block of AB.
 * Overrides the 2x2 symbolic renderer registered in block-presentation.js.
 */
(() => {
  const tex = (s) => (window.texInline ? window.texInline(s) : s);
  const texD = (s) => (window.texDisplay ? window.texDisplay(s) : s);

  const A = [[1, 2, 0, 1], [0, 1, 3, 2], [2, 0, 1, 1]];
  const B = [[1, 0, 2], [0, 1, 1], [3, 1, 0], [1, 2, 1]];
  const mul = (X, Y) => X.map((r) => Y[0].map((_, j) => r.reduce((s, v, k) => s + v * Y[k][j], 0)));
  const add = (X, Y) => X.map((r, i) => r.map((v, j) => v + Y[i][j]));
  const sub = (M, r0, r1, c0, c1) => M.slice(r0, r1).map((r) => r.slice(c0, c1));
  const texM = (M) => `\\begin{pmatrix}${M.map((r) => r.join("&")).join("\\\\")}\\end{pmatrix}`;
  const C = mul(A, B);
  const SUB = ["₀", "₁", "₂"];

  // A cut at `cut` splits n rows (or columns) into two groups [start, end).
  const groups = (cut, n) => [[0, cut], [cut, n]];

  // The grid carries rulers: column-group widths on top, row-group heights on the
  // left, so every block's size reads off its two rulers. opts.colTone / rowTone
  // colour a whole ruler (is-ok / is-bad); opts.sel marks the chosen row/col group.
  function gridHtml(M, rowCut, colCut, hiRows, hiCols, opts = {}) {
    const rg = groups(rowCut, M.length);
    const cg = groups(colCut, M[0].length);
    const rule = (axis, [a, b], k) => {
      const n = b - a;
      const tone = axis === "col" ? opts.colTone : opts.rowTone;
      const cls = ["blk-rule", `is-${axis}`, tone, opts.sel?.[axis] === k ? "is-sel" : ""].filter(Boolean).join(" ");
      const span = axis === "col" ? `colspan="${n}"` : `rowspan="${n}"`;
      return `<th ${span} class="${cls}" aria-label="${n} ${axis === "col" ? "列" : "行"}"><i>${n}</i></th>`;
    };
    const head = `<thead><tr><th class="blk-corner"></th>${cg.map((g, k) => rule("col", g, k)).join("")}</tr></thead>`;
    const body = M.map((r, i) => {
      const k = rg.findIndex(([a]) => a === i);
      return `<tr class="${i === rowCut - 1 ? "cut-below" : ""}">${k >= 0 ? rule("row", rg[k], k) : ""}${r.map((v, j) => {
        const hi = hiRows?.includes(i) && hiCols?.includes(j);
        return `<td class="${j === colCut - 1 ? "cut-right" : ""}${hi ? " is-hi" : ""}">${v}</td>`;
      }).join("")}</tr>`;
    }).join("");
    return `<table class="blk-grid ${opts.cls || ""}">${head}<tbody>${body}</tbody></table>`;
  }

  // C_ij = A_i1 B_1j + A_i2 B_2j written as sizes; the inner pair of each term is
  // bracketed with = or ≠, and the result size appears only when both pairs agree.
  function sizesHtml(i, j, rows, cols, p, q) {
    const term = (k, ak, bk) => `<span class="blk-term ${ak === bk ? "is-ok" : "is-bad"}">`
      + `<span class="blk-nm is-a">A${SUB[i]}${SUB[k]}</span><span class="blk-nm is-b">B${SUB[k]}${SUB[j]}</span>`
      + `<span class="blk-d is-a">${rows}×</span><span class="blk-k is-a">${ak}</span><span class="blk-dot">·</span>`
      + `<span class="blk-k is-b">${bk}</span><span class="blk-d is-b">×${cols}</span>`
      + `<span class="blk-link">${ak === bk ? "=" : "≠"}</span></span>`;
    const res = p === q
      ? `<span class="blk-plus">=</span><span class="blk-res"><span class="blk-nm">C${SUB[i]}${SUB[j]}</span><span class="blk-d">${rows}×${cols}</span></span>`
      : "";
    return `<div class="blk-sizes">${term(1, p, q)}<span class="blk-plus">+</span>${term(2, 4 - p, 4 - q)}${res}</div>`;
  }

  const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);

  function renderInteractive(root, section, page) {
    if (!root) return;
    const formal = page?.querySelector("#block-matrices-formal");
    if (formal && formal.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING) formal.before(root);
    const state = { aRow: 1, aCol: 2, bRow: 1, bCol: 2, target: "11" };
    let predicted = false;
    root.innerHTML = `<h2>交互实验</h2>
      <section class="ch3l-lab blk-lab">
        <header class="ch3l-head"><h3>怎样切，块乘法才有定义</h3><p>A 是 3×4 矩阵，B 是 4×3 矩阵。拖动滑块决定切口，矩阵外侧的括号标出每块的行数和列数；再点选输出块 ${tex("C_{ij}")}，用数字核对块乘法。</p></header>
        <div data-gate></div>
        <div class="blk-cuts">
          <label class="ch3l-range blk-range"><span>A 行</span><input type="range" min="1" max="2" step="1" data-cut="aRow" /><b data-v="aRow"></b></label>
          <label class="ch3l-range blk-range"><span>A 列</span><input type="range" min="1" max="3" step="1" data-cut="aCol" /><b data-v="aCol"></b></label>
          <label class="ch3l-range blk-range"><span>B 行</span><input type="range" min="1" max="3" step="1" data-cut="bRow" /><b data-v="bRow"></b></label>
          <label class="ch3l-range blk-range"><span>B 列</span><input type="range" min="1" max="2" step="1" data-cut="bCol" /><b data-v="bCol"></b></label>
        </div>
        <div class="blk-stage" data-stage></div>
        <div class="ch3l-toolbar" data-targets></div>
        <div class="blk-readout" data-readout></div>
      </section>`;
    const stage = root.querySelector("[data-stage]");
    const readout = root.querySelector("[data-readout]");
    const targets = root.querySelector("[data-targets]");

    function paint() {
      const ok = state.aCol === state.bRow;
      // before a prediction nothing tells whether the cuts fit: rulers stay neutral,
      // the size strip and the verdict wait, and every C_ij stays selectable
      const open = predicted;
      const [i, j] = state.target.split("").map(Number);
      const rows = i === 1 ? range(0, state.aRow) : range(state.aRow, 3);
      const cols = j === 1 ? range(0, state.bCol) : range(state.bCol, 3);
      const inner = open ? (ok ? "is-ok" : "is-bad") : "";
      const p = state.aCol;
      const q = state.bRow;
      stage.innerHTML = `<div class="blk-mat"><span>A</span>${gridHtml(A, state.aRow, p, rows, range(0, 4), { colTone: inner, sel: { row: i - 1 } })}</div>
        <b class="blk-op">×</b>
        <div class="blk-mat"><span>B</span>${gridHtml(B, q, state.bCol, range(0, 4), cols, { rowTone: inner, sel: { col: j - 1 } })}</div>
        <b class="blk-op">=</b>
        <div class="blk-mat${open && !ok ? " is-void" : ""}"><span>${open && !ok ? "C=AB：块乘积无定义" : "C=AB"}</span>${gridHtml(C, state.aRow, state.bCol, open && !ok ? [] : rows, open && !ok ? [] : cols, { cls: "is-result", sel: open && !ok ? {} : { row: i - 1, col: j - 1 } })}</div>
        ${open ? sizesHtml(i, j, rows.length, cols.length, p, q) : ""}`;
      root.querySelectorAll("[data-v]").forEach((n) => {
        const k = n.dataset.v;
        n.textContent = k.endsWith("Row") ? `${state[k]}+${(k === "aRow" ? 3 : 4) - state[k]}` : `${state[k]}+${(k === "aCol" ? 4 : 3) - state[k]}`;
      });
      targets.innerHTML = ["11", "12", "21", "22"].map((t) => `<button type="button" class="ch3l-chip${t === state.target ? " is-active" : ""}" data-t="${t}">${tex(`C_{${t}}`)}</button>`).join("");
      targets.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { state.target = b.dataset.t; paint(); }));

      if (!open) {
        readout.innerHTML = `<p class="blk-wait">作出预测后，这里按块核对 ${tex(`C_{${i}${j}}`)}。</p>`;
        return;
      }
      if (!ok) {
        readout.innerHTML = `<p class="ch3l-bad">块乘积没有定义</p><p>${tex(`A_{${i}1}`)} 有 ${p} 列，${tex(`B_{1${j}}`)} 有 ${q} 行，${tex(`A_{${i}1}B_{1${j}}`)} 无法相乘。把 A 的列切口和 B 的行切口对齐。</p>`;
        return;
      }
      const r0 = i === 1 ? 0 : state.aRow;
      const r1 = i === 1 ? state.aRow : 3;
      const c0 = j === 1 ? 0 : state.bCol;
      const c1 = j === 1 ? state.bCol : 3;
      const Ai1 = sub(A, r0, r1, 0, p);
      const Ai2 = sub(A, r0, r1, p, 4);
      const B1j = sub(B, 0, p, c0, c1);
      const B2j = sub(B, p, 4, c0, c1);
      const block = add(mul(Ai1, B1j), mul(Ai2, B2j));
      const direct = sub(C, r0, r1, c0, c1);
      const same = JSON.stringify(block) === JSON.stringify(direct);
      readout.innerHTML = `<p>${tex(`C_{${i}${j}}=A_{${i}1}B_{1${j}}+A_{${i}2}B_{2${j}}`)}</p>
        <div class="blk-math">${texD(`${texM(Ai1)}${texM(B1j)}+${texM(Ai2)}${texM(B2j)}=${texM(block)}`)}</div>
        <p>${same ? `<span class="ch3l-ok">与 AB 中对应的块完全相同</span>` : `<span class="ch3l-bad">与 AB 不符</span>`}。</p>`;
    }

    root.querySelectorAll("[data-cut]").forEach((input) => {
      input.value = String(state[input.dataset.cut]);
      input.addEventListener("input", () => {
        state[input.dataset.cut] = Number(input.value);
        paint();
      });
    });

    const gate = root.querySelector("[data-gate]");
    gate.innerHTML = `<div class="ch3l-predict"><div class="ch3l-predict-q"><span>先预测</span><p>把 A 的列切成 2+2。B 的行要怎样切，${tex("AB")} 才能按块相乘？B 的列切口有没有限制？</p></div>
      <div class="ch3l-predict-options">${(window.LAStableShuffle || ((a) => a))([
        ["B 的行切成 2+2；B 的列可以任意切", true, ""],
        ["B 的行切成 2+2，B 的列也必须切成 2+2", false, "B 的列切口决定 C 的列怎样分块，与能否相乘无关。"],
        ["B 的行怎么切都可以", false, "试着把 B 的行切成 1+3，看看块乘积还有没有定义。"],
        ["B 的行切法要和 A 的行切法一样", false, "相乘时配对的是 A 的列和 B 的行。"],
      ], "visuals/ch4/section5-blocks.js").map(([t, okk, why], k) => `<button type="button" data-i="${k}" data-ok="${okk}" data-why="${why}">${t}</button>`).join("")}</div><p class="ch3l-predict-feedback" hidden></p></div>`;
    // predict → act → reveal: the verdict opens only after the student also acts on the lab
    let picked = null;
    let revealed = false;
    const fb = gate.querySelector(".ch3l-predict-feedback");
    const reveal = () => {
      if (revealed || !picked) return;
      revealed = true;
      const okk = picked.dataset.ok === "true";
      gate.querySelectorAll("[data-i]").forEach((x) => x.classList.remove("is-picked"));
      picked.classList.add(okk ? "is-right" : "is-wrong");
      gate.querySelector(".ch3l-predict").classList.add("is-done");
      fb.innerHTML = okk
        ? "✓ 块乘法只要求 A 的列分法与 B 的行分法一致。A 的行切口和 B 的列切口可以自由选择，它们只决定结果 C 怎样分块。"
        : `和图中看到的不一致：${picked.dataset.why}`;
    };
    gate.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => {
      if (revealed) return;
      picked = b;
      predicted = true;
      paint();
      gate.querySelectorAll("[data-i]").forEach((x) => x.classList.toggle("is-picked", x === b));
      fb.hidden = false;
      fb.textContent = "已记下你的预测。现在动手操作一次，结论随后出现。";
    }));
    const acted = (e) => { if (!gate.contains(e.target)) reveal(); };
    ["input", "change", "pointerup"].forEach((t) => root.addEventListener(t, acted));
    root.addEventListener("click", (e) => { if (e.target.closest("button") && !gate.contains(e.target)) reveal(); });
    paint();
  }

  function renderFormal(root) {
    if (!root) return;
    const block = (title, math, text) => `<article class="ch3l-theorem"><h3>${title}</h3>${math ? `<div class="ch3l-theorem-math">${texD(math)}</div>` : ""}<p>${text}</p></article>`;
    root.innerHTML = `<h2>定理概念</h2><div class="ch3l-formal">
      ${block("分块乘法", "C_{ij}=\\sum_{k}A_{ik}B_{kj}", "把块当作“较大的元素”，按行乘列的规则配对。条件只有一个：A 的列的分法与 B 的行的分法相同，这样每个 A_{ik}B_{kj} 都有定义。".replace("A_{ik}B_{kj}", tex("A_{ik}B_{kj}")))}
      ${block("块对角矩阵", "\\begin{pmatrix}A_1&0\\\\0&A_2\\end{pmatrix}\\begin{pmatrix}B_1&0\\\\0&B_2\\end{pmatrix}=\\begin{pmatrix}A_1B_1&0\\\\0&A_2B_2\\end{pmatrix}", `非对角块为 0 时，两组变量互不影响，乘法、求逆和求行列式都可以按块分别进行，例如 ${tex("\\det=\\det A_1\\cdot\\det A_2")}。`)}
      <div class="ch3l-pitfalls"><h3>容易错在哪里</h3><ul>
        <li>只看切得整齐不整齐。能否相乘只取决于 A 的列分法和 B 的行分法是否一致。</li>
        <li>把块乘积的顺序写反：${tex("A_{ik}B_{kj}")} 一般不等于 ${tex("B_{kj}A_{ik}")}，块之间同样不可交换。</li>
        <li>以为分块后可以把块当数一样求逆：一般 ${tex("\\begin{pmatrix}A&B\\\\C&D\\end{pmatrix}^{-1}")} 不等于各块分别求逆。</li>
      </ul></div></div>`;
  }

  window.defineChapter4Renderer?.("block-matrices", { formal: renderFormal, interactive: renderInteractive });
})();
