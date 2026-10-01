"""Rebuild the serif web fonts in current/vendor/fonts/noto-serif-sc/.

Usage: python3 .github/scripts/build-font-subset.py NotoSerifSC[wght].ttf [NotoSerif[wdth,wght].ttf]
Sources: https://github.com/google/fonts/raw/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf
         https://github.com/google/fonts/raw/main/ofl/notoserif/NotoSerif%5Bwdth%2Cwght%5D.ttf
The Chinese face keeps every character used under current/ plus GB2312 level 1; the
Latin face keeps Latin, Greek, sub/superscripts and a few math symbols. Both stay
variable in wght. Needs: pip install fonttools brotli
"""
import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "current")
OUT = os.path.join(ROOT, "vendor", "fonts", "noto-serif-sc", "NotoSerifSC-subset.woff2")
OUT_LATIN = os.path.join(ROOT, "vendor", "fonts", "noto-serif-sc", "NotoSerif-latin-greek.woff2")
LATIN_RANGES = [(0x20, 0x7E), (0xA0, 0xFF), (0x370, 0x3FF), (0x2070, 0x209F), (0x2C7C, 0x2C7C),
                (0x1D62, 0x1D6A), (0x2032, 0x2034), (0x2190, 0x21FF), (0x2200, 0x22FF), (0x2016, 0x2016)]


def site_characters():
    chars = set()
    for root, _, files in os.walk(ROOT):
        if "vendor" in root.split(os.sep):
            continue
        for name in files:
            if name.endswith((".js", ".html", ".css")):
                with open(os.path.join(root, name), encoding="utf-8", errors="ignore") as fh:
                    chars.update(fh.read())
    return chars


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


def main(source):
    chars = site_characters() | gb2312_level1()
    chars |= {chr(c) for c in range(0x20, 0x7F)}
    chars |= set("　、。〈〉《》「」『』【】〔〕—…‘’“”·！（），：；？～￥％＋－＝×÷≤≥≠±°′″")
    text = "".join(sorted(c for c in chars if ord(c) >= 0x20))
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    font = TTFont(source)
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    font.flavor = "woff2"
    font.save(OUT)
    print(f"{len(text)} characters -> {OUT} ({os.path.getsize(OUT) // 1024} KB)")


if __name__ == "__main__":
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    main(sys.argv[1])
    if len(sys.argv) == 3:
        build_latin(sys.argv[2])
