"""Retire le fond (damier) de Fantome-styled.png et recadre en carre autour du fantome."""
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

SRC = Path("public/Fantome-styled.png")
OUT = Path("public/Fantome-styled.png")
LIGHT_THRESHOLD = 242
MARGIN_RATIO = 0.06


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


def main() -> None:
    rgb = np.array(Image.open(SRC).convert("RGB"))
    light = rgb.min(axis=2) >= LIGHT_THRESHOLD
    bg = flood_background(light)

    rgba = np.dstack([rgb, np.where(bg, 0, 255).astype(np.uint8)])
    alpha = rgba[:, :, 3]
    ys, xs = np.where(alpha > 0)
    x0, x1 = int(xs.min()), int(xs.max())
    y0, y1 = int(ys.min()), int(ys.max())

    crop = Image.fromarray(rgba).crop((x0, y0, x1 + 1, y1 + 1))
    cw, ch = crop.size
    side = int(max(cw, ch) * (1 + MARGIN_RATIO * 2))
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(crop, ((side - cw) // 2, (side - ch) // 2), crop)
    canvas.save(OUT)
    print(f"wrote {OUT} ({side}x{side}, crop {cw}x{ch})")


if __name__ == "__main__":
    main()
