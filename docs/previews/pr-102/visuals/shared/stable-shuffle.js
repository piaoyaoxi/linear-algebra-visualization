/*
 * Stable shuffle for prediction options: the order depends only on the key
 * (the question text), so a page always shows the same order, but the correct
 * option is no longer always first.
 */
(() => {
  window.LAStableShuffle = function stableShuffle(items, key) {
    let seed = 2166136261;
    for (const ch of String(key)) seed = Math.imul(seed ^ ch.codePointAt(0), 16777619) >>> 0;
    const rand = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
})();
