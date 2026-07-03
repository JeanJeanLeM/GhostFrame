"""Beige -> blanc sur le fantome et le texte de LogoGF-styled-sd (carte SD inchangee)."""
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

SRC = Path("public/LogoGF-styled-sd.png")
OUT = Path("public/LogoGF-styled-sd.png")
LIGHT_THRESHOLD = 242


def flood_background(light: np.ndarray) -> np.ndarray:
    h, w = light.shape
    bg = np.zeros((h, w), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    def try_seed(y: int, x: int) -> None:
        if light[y, x] and not bg[y, x]:
            bg[y, x] = True
            queue.append((y, x))

    for x in range(w):
        try_seed(0, x)
        try_seed(h - 1, x)
    for y in range(h):
        try_seed(y, 0)
        try_seed(y, w - 1)

    while queue:
        y, x = queue.popleft()
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and light[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True
                queue.append((ny, nx))

    return bg


def is_gold(r: np.ndarray, g: np.ndarray, b: np.ndarray) -> np.ndarray:
    return (r > 170) & (g > 120) & (b < 120) & (r > b + 50) & (g > b)


def is_beige(r: np.ndarray, g: np.ndarray, b: np.ndarray) -> np.ndarray:
    lum = (r.astype(np.int16) + g.astype(np.int16) + b.astype(np.int16)) / 3.0
    warm = (r.astype(np.int16) >= g - 25) & (g.astype(np.int16) >= b - 45)
    return warm & (lum >= 110) & (lum <= 252) & ~is_gold(r, g, b)


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    arr = np.array(img)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]

    light = (np.minimum.reduce([r, g, b]) >= LIGHT_THRESHOLD) & (a > 0)
    bg = flood_background(light)

    beige = is_beige(r, g, b) & ~bg
    arr[beige, 0:3] = 255
    arr[bg, 3] = 0

    out = Image.fromarray(arr)
    out.save(OUT)
    print(f"wrote {OUT} — beige->blanc: {beige.sum()} px, fond retire: {bg.sum()} px")


if __name__ == "__main__":
    main()
