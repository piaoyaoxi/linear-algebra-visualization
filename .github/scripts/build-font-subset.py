"""Rebuild the serif web fonts in current/vendor/fonts/noto-serif-sc/.

Usage: python3 .github/scripts/build-font-subset.py NotoSerifSC[wght].ttf [NotoSerif[wdth,wght].ttf]
Sources: https://github.com/google/fonts/raw/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf
         https://github.com/google/fonts/raw/main/ofl/notoserif/NotoSerif%5Bwdth%2Cwght%5D.ttf
The Chinese face keeps every character used under current/ plus GB2312 level 1; the
Latin face keeps Latin, Greek, sub/superscripts and a few math symbols. Both stay
variable in wght (the Chinese face 400–900, Regular as default). Needs: pip install fonttools brotli

The Chinese face is cut into slices by unicode-range, so a page downloads only the slices
holding characters it shows (the slice list is below). The script writes the slice files, the
"LA Serif SC" rules in current/fonts.css, the slice-0 preload in learn.html and the fonts.css
version tags in learn.html / index.html. Instead of the source TTF you can pass the old
single-file subset, which already holds every character above, to re-slice without downloading:
  git show fbd417d:current/vendor/fonts/noto-serif-sc/NotoSerifSC-subset.woff2 > /tmp/sc.woff2
"""
import collections
import glob
import hashlib
import io
import os
import re
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "current")
FONT_DIR = os.path.join(ROOT, "vendor", "fonts", "noto-serif-sc")
OUT_LATIN = os.path.join(FONT_DIR, "NotoSerif-latin-greek.woff2")
FONTS_CSS = os.path.join(ROOT, "fonts.css")
PAGES = [os.path.join(ROOT, "learn.html"), os.path.join(ROOT, "index.html")]
LATIN_RANGES = [(0x20, 0x7E), (0xA0, 0xFF), (0x370, 0x3FF), (0x2070, 0x209F), (0x2C7C, 0x2C7C),
                (0x1D62, 0x1D6A), (0x2032, 0x2034), (0x2190, 0x21FF), (0x2200, 0x22FF), (0x2016, 0x2016)]

# Slices of the Chinese face, in fonts.css order:
# Characters the Latin face has are left out: it comes first in every font stack, so they never
# reach this face (WebKit would otherwise fetch them while the Latin face is still loading). The
# space stays in slice 0: CSS takes a family's line metrics from the face that covers U+0020,
# and KaTeX's .cjk_fallback spans list this face first (fonts.css).
#   NotoSerifSC-0      punctuation and symbols, the page shell (SHELL) and every chapter/section
#                      title, nav title and goal (KEY_FIELD): all a lesson shows before its labs
#                      arrive. learn.html preloads it.
#   NotoSerifSC-1..n   the rest of the site's characters, SITE_SLICE per file, the ones found in
#                      most files first.
#   NotoSerifSC-spare-1..n  GB2312 level-1 characters the site does not use yet, SPARE_SLICE per
#                      file in code point order. Rebuild when content starts using them, so they
#                      move into the slices above (check-font-coverage.py points them out).
SHELL = ["app.js", "learn.html", "index.html", "cover.js"]
KEY_FIELD = re.compile(r"^(\s*)(navTitle|goal|subtitle|title)\s*:")
COMMENT = re.compile(r"/\*.*?\*/|<!--.*?-->|(?<![:\w\\])//[^\n]*", re.S)  # shell comments are never shown
SITE_SLICE = 100
SPARE_SLICE = 250
CSS_BEGIN = "/* LA Serif SC slices: written by .github/scripts/build-font-subset.py */"
CSS_END = "/* end of LA Serif SC slices */"


def site_files():
    out = {}
    for root, _, files in os.walk(ROOT):
        if "vendor" in root.split(os.sep):
            continue
        for name in files:
            if name.endswith((".js", ".html", ".css")):
                path = os.path.join(root, name)
                with open(path, encoding="utf-8", errors="ignore") as fh:
                    out[os.path.relpath(path, ROOT)] = fh.read()
    return out


def gb2312_level1():
    out = set()
    for hi in range(0xB0, 0xD8):
        for lo in range(0xA1, 0xFF):
            try:
                out.add(bytes([hi, lo]).decode("gb2312"))
            except UnicodeDecodeError:
                pass
    return out


def build_latin(source):
    from fontTools.varLib import instancer
    import tempfile

    font = instancer.instantiateVariableFont(TTFont(source), {"wdth": 100})
    with tempfile.NamedTemporaryFile(suffix=".ttf") as tmp:
        font.save(tmp.name)  # reload: subsetting an in-memory instance fails on gvar
        font = TTFont(tmp.name)
        cmap = font.getBestCmap()
        codes = [c for a, b in LATIN_RANGES for c in range(a, b + 1) if c in cmap]
        options = subset.Options()
        options.flavor = "woff2"
        options.layout_features = ["*"]
        options.name_IDs = ["*"]
        subsetter = subset.Subsetter(options)
        subsetter.populate(unicodes=codes)
        subsetter.subset(font)
        font.flavor = "woff2"
        font.save(OUT_LATIN)
    print(f"{len(codes)} code points -> {OUT_LATIN} ({os.path.getsize(OUT_LATIN) // 1024} KB)")


def subset_font(source, codes):
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    options.bidi_closure = False  # keep each slice's cmap equal to its unicode-range
    # keep the source's timestamp so an unchanged slice rebuilds byte for byte (same ?v=, cache kept)
    font = TTFont(io.BytesIO(source) if isinstance(source, bytes) else source, recalcTimestamp=False)
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=codes)
    subsetter.subset(font)
    return font


def build_full(source, codes):
    """The whole Chinese subset in one font with Regular as default instance, as TTF bytes."""
    font = subset_font(source, codes)
    # the upstream default instance is ExtraLight (wght 200); iOS Safari drew normal-weight
    # text at the default instance, so make Regular the default and drop the unused light end
    axis = next(a for a in font["fvar"].axes if a.axisTag == "wght")
    if (axis.minValue, axis.defaultValue, axis.maxValue) != (400, 400, 900):
        from fontTools.varLib import instancer
        font = instancer.instantiateVariableFont(font, {"wght": (400, 400, 900)})
    buf = io.BytesIO()
    font.flavor = None
    font.save(buf)
    return buf.getvalue()


def plan_slices(files, codes):
    """Split the face's code points into named slices (see SLICES above)."""
    latin = set(TTFont(OUT_LATIN).getBestCmap())
    site = set()
    in_files = collections.Counter()
    uses = collections.Counter()
    for text in files.values():
        counts = collections.Counter(map(ord, text))
        site.update(counts)
        in_files.update(counts.keys())
        uses.update(counts)

    first = set()
    for name in SHELL:
        first.update(map(ord, COMMENT.sub("", files.get(name, ""))))
    for path, text in files.items():
        if not path.startswith("content" + os.sep):
            continue
        lines = text.split("\n")
        for i, line in enumerate(lines):
            match = KEY_FIELD.match(line)
            if not match:
                continue
            # section titles sit next to their navTitle; other `title:` lines name examples and blocks
            if match.group(2) == "title" and len(match.group(1)) != 2 and not any(
                    (m := KEY_FIELD.match(nxt)) and m.group(2) == "navTitle" for nxt in lines[i + 1:i + 3]):
                continue
            first.update(map(ord, line))
    ideograph = lambda c: 0x3400 <= c <= 0x9FFF
    first = {c for c in codes if (c not in latin or c == 0x20) and (c in first or not ideograph(c))}
    rest = sorted((c for c in codes if c in site and c not in latin and c not in first),
                  key=lambda c: (-in_files[c], -uses[c], c))
    spare = sorted(c for c in codes if c not in site and c not in latin and c not in first)

    slices = [("0", sorted(first))]
    slices += [(str(i // SITE_SLICE + 1), sorted(rest[i:i + SITE_SLICE])) for i in range(0, len(rest), SITE_SLICE)]
    slices += [(f"spare-{i // SPARE_SLICE + 1}", spare[i:i + SPARE_SLICE]) for i in range(0, len(spare), SPARE_SLICE)]
    return slices


def unicode_range(codes):
    runs = []
    for c in sorted(codes):
        if runs and c == runs[-1][1] + 1:
            runs[-1][1] = c
        else:
            runs.append([c, c])
    return ", ".join(f"U+{a:X}" if a == b else f"U+{a:X}-{b:X}" for a, b in runs)


def write_css(rules):
    with open(FONTS_CSS, encoding="utf-8") as fh:
        css = fh.read()
    start, end = css.index(CSS_BEGIN), css.index(CSS_END)
    block = "".join(
        f"@font-face {{\n"
        f"  font-family: \"LA Serif SC\";\n"
        f"  src: url(\"./vendor/fonts/noto-serif-sc/{name}?v={version}\") format(\"woff2\");\n"
        f"  font-weight: 400 900;\n"
        f"  font-style: normal;\n"
        f"  font-display: swap;\n"
        f"  unicode-range: {unicode_range(codes)};\n"
        f"}}\n\n"
        for name, version, codes in rules)
    css = css[:start] + CSS_BEGIN + "\n" + block + css[end:]
    with open(FONTS_CSS, "w", encoding="utf-8") as fh:
        fh.write(css)
    return hashlib.sha1(css.encode()).hexdigest()[:8]


def write_page_tags(first_url, css_version):
    for page in PAGES:
        with open(page, encoding="utf-8") as fh:
            html = fh.read()
        html = re.sub(r"\./vendor/fonts/noto-serif-sc/NotoSerifSC[^\"]*\.woff2[^\"]*", first_url, html)
        html = re.sub(r"\./fonts\.css\?v=[^\"]*", f"./fonts.css?v={css_version}", html)
        with open(page, "w", encoding="utf-8") as fh:
            fh.write(html)


def main(source):
    files = site_files()
    chars = set("".join(files.values())) | gb2312_level1()
    chars |= {chr(c) for c in range(0x20, 0x7F)}
    chars |= set("　、。〈〉《》「」『』【】〔〕—…‘’“”·！（），：；？～￥％＋－＝×÷≤≥≠±°′″")
    codes = sorted(ord(c) for c in chars if ord(c) >= 0x20)
    full = build_full(source, codes)
    have = set(TTFont(io.BytesIO(full)).getBestCmap())
    lacking = "".join(chr(c) for c in codes if c not in have and 0x3000 <= c <= 0x9FFF)
    if lacking:
        print(f"the source font has no glyph for {lacking}; pass the upstream TTF if these are new")
    codes = [c for c in codes if c in have]

    for old in glob.glob(os.path.join(FONT_DIR, "NotoSerifSC*.woff2")):
        os.remove(old)
    rules = []
    for label, part in plan_slices(files, codes):
        font = subset_font(full, part)
        font.flavor = "woff2"
        name = f"NotoSerifSC-{label}.woff2"
        path = os.path.join(FONT_DIR, name)
        font.save(path)
        with open(path, "rb") as fh:
            version = hashlib.sha1(fh.read()).hexdigest()[:8]
        rules.append((name, version, part))
        print(f"{name}: {len(part)} characters, {os.path.getsize(path) // 1024} KB")
    css_version = write_css(rules)
    write_page_tags(f"./vendor/fonts/noto-serif-sc/{rules[0][0]}?v={rules[0][1]}", css_version)
    print(f"{sum(len(part) for _, _, part in rules)} characters in {len(rules)} slices; fonts.css?v={css_version}")


if __name__ == "__main__":
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    if len(sys.argv) == 3:
        build_latin(sys.argv[2])
    main(sys.argv[1])
