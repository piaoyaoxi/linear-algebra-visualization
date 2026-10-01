"""Fail when a CJK character used under current/ is missing from the serif subset.

Fix by rebuilding the subset: python3 .github/scripts/build-font-subset.py <source ttf>
"""
import os
import sys

from fontTools.ttLib import TTFont

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "current")
FONT = os.path.join(ROOT, "vendor", "fonts", "noto-serif-sc", "NotoSerifSC-subset.woff2")


def is_cjk(ch):
    o = ord(ch)
    return 0x3000 <= o <= 0x303F or 0x4E00 <= o <= 0x9FFF or 0xFF00 <= o <= 0xFFEF


cmap = set(TTFont(FONT).getBestCmap())
missing = {}
for root, _, files in os.walk(ROOT):
    if "vendor" in root.split(os.sep):
        continue
    for name in files:
        if not name.endswith((".js", ".html", ".css")):
            continue
        path = os.path.join(root, name)
        with open(path, encoding="utf-8", errors="ignore") as fh:
            for ch in fh.read():
                if is_cjk(ch) and ord(ch) not in cmap:
                    missing.setdefault(ch, os.path.relpath(path, ROOT))
if missing:
    print("Characters missing from the serif font subset:")
    for ch, where in sorted(missing.items()):
        print(f"  {ch} (U+{ord(ch):04X}) first seen in {where}")
    sys.exit(1)
print(f"font coverage OK ({len(cmap)} code points)")
