"""Recolore l'illustration de fond (accueil) sepia -> palette bleue, via un
mappage de luminance sur un degrade tritone. Sortie opaque.
"""
from PIL import Image
import numpy as np
import sys

SRC = sys.argv[1] if len(sys.argv) > 1 else r"public/home-background-9x16.png"
OUT = sys.argv[2] if len(sys.argv) > 2 else r"public/home-background-9x16-blue.png"

STOPS = [
    (0.00, (9, 20, 38)),      # bleu nuit (ombres)
    (0.30, (23, 58, 99)),     # bleu fonce
    (0.55, (46, 107, 176)),   # bleu
    (0.78, (110, 165, 220)),  # bleu clair
    (1.00, (214, 232, 247)),  # bleu tres clair (evite le blanc pur)
]

img = Image.open(SRC).convert("RGB")
arr = np.array(img).astype(np.float32)

lum = (0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]) / 255.0
lum = np.clip((lum - 0.5) * 1.08 + 0.5, 0.0, 1.0)

ls = np.array([s[0] for s in STOPS])
cs = np.array([s[1] for s in STOPS], dtype=np.float32)

out = np.empty_like(arr)
for ch in range(3):
    out[:, :, ch] = np.interp(lum, ls, cs[:, ch])

Image.fromarray(out.astype(np.uint8), "RGB").save(OUT)
print("wrote", OUT, img.size)
