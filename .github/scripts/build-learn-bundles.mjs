/**
 * Publish-time bundling for static learning app, no external dependencies.
 * Run on a disposable copy of current/ only; preserves stylesheet cascade and
 * classic script evaluation order. Usage: node build-learn-bundles.mjs <current>
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const dir = path.resolve(process.argv[2] || 'current');
const htmlPath = path.join(dir, 'learn.html');
let html = fs.readFileSync(htmlPath, 'utf8');
if (html.includes('./bundles/learn-style-')) throw new Error('Site is already built; start from a clean copy');
const outputDir = path.join(dir, 'bundles');
fs.mkdirSync(outputDir, { recursive: true });

function writeBundle(name, ext, code) {
  const hash = crypto.createHash('sha256').update(code).digest('hex').slice(0, 12);
  const filename = name + '-' + hash + '.' + ext;
  fs.writeFileSync(path.join(outputDir, filename), code);
  return './bundles/' + filename;
}
function sourceFile(ref) {
  const file = ref.split('?')[0].replace(/^\.\//, '');
  const resolved = path.resolve(dir, file);
  if (!resolved.startsWith(dir + path.sep) || !fs.statSync(resolved).isFile()) {
    throw new Error('Invalid asset reference: ' + ref);
  }
  return {file, source: fs.readFileSync(resolved, 'utf8')};
}
const styles = [...html.matchAll(/<link rel="stylesheet" href="(\.\/[^\"]+\.css(?:\?[^\"]+)?)"\s*\/>/g)];
if (styles.length < 40) throw new Error('Expected ordered stylesheets: ' + styles.length);
function rewriteCssUrls(source, file) {
  const from = path.posix.dirname(file);
  return source.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi, (full, quote, original) => {
    const ref = original.trim();
    if (/^(?:data:|https?:|\/\/|\/|#|blob:)/i.test(ref)) return full;
    const rewritten = path.posix.normalize(path.posix.join(from, ref));
    if (rewritten.startsWith('../')) throw new Error('CSS URL escapes root: ' + file + ' -> ' + ref);
    return 'url(' + quote + '../' + rewritten + quote + ')';
  });
}
const cssCode = styles.map(match => {
  const {file, source} = sourceFile(match[1]);
  return '\n/* ' + file + ' */\n' + rewriteCssUrls(source, file) + '\n';
}).join('\n');
const cssLink = '<link rel="stylesheet" href="' + writeBundle('learn-style', 'css', cssCode) + '" />';
styles.forEach((match, index) => { html = html.replace(match[0], index === 0 ? cssLink : ''); });

// Keep KaTeX as an independently cacheable dependency.
const defer = [...html.matchAll(/<script defer src="(\.\/[^\"]+\.js(?:\?[^\"]+)?)"><\/script>/g)];
if (defer.length < 120) throw new Error('Expected ordered JavaScript assets: ' + defer.length);
const vendor = defer.filter(m => m[1].startsWith('./vendor/'));
const sourceScripts = defer.filter(m => !m[1].startsWith('./vendor/'));
const chunks = [];
let group = [], groupBytes = 0;
for (const match of sourceScripts) {
  const entry = sourceFile(match[1]);
  if (group.length && groupBytes + entry.source.length > 290000) {
    chunks.push(group); group = []; groupBytes = 0;
  }
  group.push({match: match[0], ...entry}); groupBytes += entry.source.length;
}
if (group.length) chunks.push(group);
for (const [index, chunk] of chunks.entries()) {
  const code = chunk.map(({file, source}) => '\n;/* ' + file + ' */\n' + source + '\n').join('');
  const href = writeBundle('learn-core-' + (index + 1), 'js', code);
  chunk.forEach((item, i) => { html = html.replace(item.match, i === 0 ? '<script defer src="' + href + '"></script>' : ''); });
}
// One fetch per visited chapter; all chapter-local modules retain source order.
const lazy = [...html.matchAll(/<script type="application\/x-algebra-chapter" data-lazy-chapter="(ch\d+)" data-src="(\.\/[^\"]+\.js(?:\?[^\"]+)?)"><\/script>/g)];
if (lazy.length < 50) throw new Error('Expected chapter modules: ' + lazy.length);
const chapters = new Map();
for (const match of lazy) {
  if (!chapters.has(match[1])) chapters.set(match[1], []);
  chapters.get(match[1]).push({original: match[0], ...sourceFile(match[2])});
}
for (const [chapter, items] of chapters) {
  const code = items.map(({file, source}) => '\n;/* ' + file + ' */\n' + source + '\n').join('');
  const href = writeBundle('learn-' + chapter, 'js', code);
  items.forEach((item, index) => { html = html.replace(item.original, index === 0 ?
    '<script type="application/x-algebra-chapter" data-lazy-chapter="' + chapter + '" data-src="' + href + '"></script>' : ''); });
}
fs.writeFileSync(htmlPath, html);
console.log(JSON.stringify({styles: styles.length, coreScripts: sourceScripts.length,
  coreBundles: chunks.length, chapterScripts: lazy.length, chapterBundles: chapters.size,
  cssBytes: Buffer.byteLength(cssCode), vendor: vendor.length}, null, 2));