"""Fail when a CJK character used under current/ is missing from the serif font slices, or when
fonts.css / the learn.html preload no longer match the slice files.

Fix by rebuilding the slices: python3 .github/scripts/build-font-subset.py <source font>
"""
import os
import re
import sys

from fontTools.ttLib import TTFont

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "current")
FONT_DIR = os.path.join(ROOT, "vendor", "fonts", "noto-serif-sc")
RULE = re.compile(r"@font-face\s*{([^}]*)}")


def is_cjk(ch):
    o = ord(ch)
    return 0x3000 <= o <= 0x303F or 0x4E00 <= o <= 0x9FFF or 0xFF00 <= o <= 0xFFEF


def parse_range(text):
    out = set()
    for part in text.split(","):
        a, _, b = part.strip()[2:].partition("-")
        out.update(range(int(a, 16), int(b or a, 16) + 1))
    return out


problems = []
with open(os.path.join(ROOT, "fonts.css"), encoding="utf-8") as fh:
    css = fh.read()
slices = []  # (url, file name, code points)
for body in RULE.findall(css):
    if '"LA Serif SC"' not in body:
        continue
    url = re.search(r'url\("([^"]+)"\)', body).group(1)
    declared = parse_range(re.search(r"unicode-range:\s*([^;]+);", body).group(1))
    name = os.path.basename(url.split("?")[0])
    path = os.path.join(FONT_DIR, name)
    if not os.path.exists(path):
        problems.append(f"fonts.css points to missing {name}")
        continue
    cmap = set(TTFont(path).getBestCmap())
    if cmap != declared:
        problems.append(f"{name}: unicode-range in fonts.css differs from the file ({len(declared ^ cmap)} code points)")
    slices.append((url, name, cmap))
names = {name for _, name, _ in slices}
for name in sorted(os.listdir(FONT_DIR)):
    if name.startswith("NotoSerifSC") and name not in names:
        problems.append(f"{name} is not used by fonts.css")
if not slices:
    problems.append('fonts.css has no "LA Serif SC" slices')
else:
    with open(os.path.join(ROOT, "learn.html"), encoding="utf-8") as fh:
        preloads = re.findall(r'<link rel="preload" href="([^"]+)" as="font"', fh.read())
    if preloads != [slices[0][0]]:
        problems.append(f"learn.html should preload exactly {slices[0][0]} (found {preloads})")

where = {c: name for _, name, cmap in slices for c in cmap}
missing, spare = {}, {}
for root, _, files in os.walk(ROOT):
    if "vendor" in root.split(os.sep):
        continue
    for name in files:
        if not name.endswith((".js", ".html", ".css")):
            continue
        path = os.path.join(root, name)
        with open(path, encoding="utf-8", errors="ignore") as fh:
            for ch in fh.read():
                if not is_cjk(ch):
                    continue
                if ord(ch) not in where:
                    missing.setdefault(ch, os.path.relpath(path, ROOT))
                elif "spare" in where[ord(ch)]:
                    spare.setdefault(ch, os.path.relpath(path, ROOT))
if spare:
    # still drawn correctly, but a page using them downloads a spare slice it mostly does not need
    chars = "".join(sorted(spare))
    print(f"::warning file=.github/scripts/build-font-subset.py::{chars} are only in the spare font "
          "slices; rebuild the font so they move into the site slices")
if missing:
    problems.append("characters missing from the serif font slices:\n" + "\n".join(
        f"  {ch} (U+{ord(ch):04X}) first seen in {where_}" for ch, where_ in sorted(missing.items())))
if problems:
    print("\n".join(problems))
    sys.exit(1)
print(f"font coverage OK ({len(where)} code points in {len(slices)} slices)")
