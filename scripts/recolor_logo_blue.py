"""Recolore le logo Ghost Frame (carte SD + fantome + texte) vers une palette
bleu fonce / bleu clair / blanc, via un mappage de luminance sur un degrade
tritone. Preserve la transparence (alpha).
"""
from PIL import Image
import numpy as np

SRC = r"public/LogoGF-styled-sd-nobg.png"
OUT = r"public/LogoGF-blue.png"

# Points du degrade: (luminance 0..1, (R,G,B))
STOPS = [
    (0.00, (10, 24, 46)),     # bleu nuit (contours, yeux)
    (0.32, (23, 58, 99)),     # bleu fonce (carte SD)
    (0.55, (46, 107, 176)),   # bleu
    (0.74, (127, 184, 236)),  # bleu clair (texte)
    (0.88, (216, 232, 247)),  # bleu tres clair
    (1.00, (255, 255, 255)),  # blanc (fantome)
]

img = Image.open(SRC).convert("RGBA")
arr = np.array(img).astype(np.float32)
rgb = arr[:, :, :3]
alpha = arr[:, :, 3:4]

# Luminance perceptuelle 0..1
lum = (0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]) / 255.0

# Leger boost de contraste pour bien separer carte SD (sombre) et fantome (clair)
lum = np.clip((lum - 0.5) * 1.12 + 0.5, 0.0, 1.0)

ls = np.array([s[0] for s in STOPS])
cs = np.array([s[1] for s in STOPS], dtype=np.float32)

out_rgb = np.empty_like(rgb)
for ch in range(3):
    out_rgb[:, :, ch] = np.interp(lum, ls, cs[:, ch])

out = np.concatenate([out_rgb, alpha], axis=2).astype(np.uint8)
Image.fromarray(out, "RGBA").save(OUT)
print("wrote", OUT, img.size)
