"""Detoure le fond blanc du logo Ghost Frame par flood-fill depuis les bords.
Preserve le fantome (blanc/creme) car il est isole par le contour fonce du logo.
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import sys

SRC = r"public/LogoGF-styled-sd.png"
OUT = r"public/LogoGF-styled-sd-nobg.png"
SENT = (255, 0, 255)
THRESH = 60

img = Image.open(SRC).convert("RGB")
w, h = img.size
corners = {
    "tl": img.getpixel((0, 0)),
    "tr": img.getpixel((w - 1, 0)),
    "bl": img.getpixel((0, h - 1)),
    "br": img.getpixel((w - 1, h - 1)),
}

work = img.copy()
# Seeds: 4 coins + points repartis sur chaque bord pour attraper tout le fond
seeds = []
for x in range(0, w, max(1, w // 20)):
    seeds.append((x, 0))
    seeds.append((x, h - 1))
for y in range(0, h, max(1, h // 20)):
    seeds.append((0, y))
    seeds.append((w - 1, y))
for s in seeds:
    ImageDraw.floodfill(work, s, SENT, thresh=THRESH)

arr = np.array(work)
mask_bg = np.all(arr == np.array(SENT), axis=-1)

orig = np.array(img)
alpha = np.where(mask_bg, 0, 255).astype(np.uint8)

# Adoucir legerement le bord de l'alpha pour eviter le liseré blanc
alpha_img = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(0.6))
alpha = np.array(alpha_img)

rgba = np.dstack([orig, alpha])
Image.fromarray(rgba, "RGBA").save(OUT)

removed = int(mask_bg.sum())
total = w * h
print(f"size={w}x{h} corners={corners} removed={removed} ({removed*100//total}%) -> {OUT}")
