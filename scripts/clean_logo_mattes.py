"""Clean the cut of the Ghost Frame logo PNGs.

The artwork stays as it is. Only the matte changes: stray crumbs go away,
the pale or dark fringe left by a hard cut is removed, and the silhouette
gets a smooth antialiased edge. Also writes the SD-card mark as two layers
(card + wordmark, and the ghost) so the ghost can float on its own.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]

# Cut-out logos. Solid designed backgrounds (the purple icon plates) are not cuts.
LOGOS = [
    ROOT / "public/LogoGF-styled-sd.png",
    ROOT / "public/LogoGF-styled-sd-nobg.png",
    ROOT / "public/LogoGF-blue.png",
    ROOT / "public/LogoGF.png",
    ROOT / "public/LogoGF-styled.png",
    ROOT / "public/GhostFromelogoRBG.png",
    ROOT / "public/Fantome.png",
    ROOT / "public/Fantome-styled.png",
    ROOT / "public/ghost-frame-icon-512.png",
    ROOT / "public/ghost-frame-icon-192.png",
    ROOT / "public/ghost-frame-icon-32.png",
    ROOT / "src/assets/icons/GhostFromelogoRBG.png",
]


def load_rgba(path: Path) -> np.ndarray:
    im = Image.open(path)
    if im.mode == "RGBA":
        return np.array(im)
    rgb = np.array(im.convert("RGB"))
    return np.dstack([rgb, np.full(rgb.shape[:2], 255, np.uint8)])


def flood_background(light: np.ndarray) -> np.ndarray:
    h, w = light.shape
    bg = np.zeros((h, w), dtype=bool)
    stack = []

    def seed(y: int, x: int) -> None:
        if light[y, x] and not bg[y, x]:
            bg[y, x] = True
            stack.append((y, x))

    for x in range(w):
        seed(0, x)
        seed(h - 1, x)
    for y in range(h):
        seed(y, 0)
        seed(y, w - 1)
    while stack:
        y, x = stack.pop()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and light[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True
                stack.append((ny, nx))
    return bg


def drop_crumbs(mask: np.ndarray) -> np.ndarray:
    lab, n = ndimage.label(mask)
    if n <= 1:
        return mask
    sizes = np.bincount(lab.ravel())
    sizes[0] = 0
    main = int(sizes.argmax())
    main_size = int(sizes[main])
    keep = sizes >= max(24, int(main_size * 0.002))
    # Always keep the main piece. Tiny border specks never qualify.
    keep[main] = True
    keep[0] = False
    return keep[lab]


def strip_fringe(mask: np.ndarray, lum: np.ndarray) -> np.ndarray:
    """Drop the pale or dark halo a hard cut leaves around the real edge."""
    dist = ndimage.distance_transform_edt(mask)
    rim = mask & (dist <= 2.4)
    inner = mask & (dist >= 3.2) & (dist <= 7.5)
    if rim.sum() < 20 or inner.sum() < 20:
        return mask
    rim_l = float(np.median(lum[rim]))
    inner_l = float(np.median(lum[inner]))
    if rim_l > inner_l + 40:
        # Light matte: the sticker halo sits outside the dark stroke.
        halo = rim & (lum > max(inner_l + 28, 100))
        return mask & ~halo
    if inner_l > rim_l + 40:
        halo = rim & (lum < inner_l - 28)
        return mask & ~halo
    return mask


def smooth_alpha(mask: np.ndarray, feather: float) -> np.ndarray:
    inside = ndimage.distance_transform_edt(mask)
    outside = ndimage.distance_transform_edt(~mask)
    sdf = inside - outside
    alpha = np.clip((sdf + feather) / (2.0 * feather), 0.0, 1.0)
    return alpha.astype(np.float32)


def nearest_color(rgb: np.ndarray, source: np.ndarray) -> np.ndarray:
    """Color of the nearest True pixel in source, for every pixel."""
    # distance_transform_edt measures distance to zeros, so invert the source.
    _, indices = ndimage.distance_transform_edt(~source, return_indices=True)
    return rgb[indices[0], indices[1]]


def clean_array(arr: np.ndarray) -> np.ndarray:
    rgb = arr[:, :, :3].astype(np.int16)
    alpha0 = arr[:, :, 3]
    lum = rgb.mean(axis=2)
    h, w = lum.shape

    if alpha0.min() == 255:
        # Flat background. Only cut near-white canvases; a designed plate stays.
        corners = np.stack([rgb[0, 0], rgb[0, -1], rgb[-1, 0], rgb[-1, -1]])
        if corners.mean() < 235:
            return arr
        light = rgb.min(axis=2) >= 236
        bg = flood_background(light)
        mask = ~bg
    else:
        mask = alpha0 > 16

    mask = drop_crumbs(mask)
    mask = strip_fringe(mask, lum)
    mask = strip_fringe(mask, lum)
    # Isolated light specks stuck to the cut. A real highlight is a long run.
    dist_in = ndimage.distance_transform_edt(mask)
    specks = mask & (dist_in <= 1.8) & (lum > 150)
    slab, sn = ndimage.label(specks)
    if sn:
        ssizes = np.bincount(slab.ravel())
        ssizes[0] = 0
        small = ssizes < 48
        small[0] = False
        mask = mask & ~(small[slab])

    short = min(h, w)
    feather = 1.2 if short < 220 else 1.15
    alpha = smooth_alpha(mask, feather)

    solid = alpha > 0.98
    if solid.sum() < 10:
        solid = mask
    # The soft rim must fade in the edge color (the dark stroke), not in the
    # white pixels of a bad cut. Prefer a dark pixel when the edge is dark.
    dark = solid & (lum < 95)
    source = dark if dark.sum() > 50 else solid
    sampled = nearest_color(rgb, source)

    out = np.zeros_like(arr)
    out[:, :, :3] = np.where(solid[:, :, None], rgb, sampled)
    out[:, :, 3] = np.clip(np.round(alpha * 255), 0, 255).astype(np.uint8)
    out[out[:, :, 3] == 0, :3] = 0
    return out


def save_pair(arr: np.ndarray, png_path: Path) -> None:
    im = Image.fromarray(arr, "RGBA")
    png_path.parent.mkdir(parents=True, exist_ok=True)
    im.save(png_path, "PNG", optimize=True)
    webp_path = png_path.with_suffix(".webp")
    im.save(webp_path, "WEBP", quality=95, method=6)


def crop_to_content(arr: np.ndarray, pad: int = 12) -> np.ndarray:
    ys, xs = np.where(arr[:, :, 3] > 8)
    if len(xs) == 0:
        return arr
    y0, y1 = max(0, int(ys.min()) - pad), min(arr.shape[0], int(ys.max()) + pad + 1)
    x0, x1 = max(0, int(xs.min()) - pad), min(arr.shape[1], int(xs.max()) + pad + 1)
    return arr[y0:y1, x0:x1]


def main() -> None:
    for path in LOGOS:
        cleaned = clean_array(load_rgba(path))
        save_pair(cleaned, path)
        a = cleaned[:, :, 3]
        print(
            f"{path.relative_to(ROOT)} {cleaned.shape[1]}x{cleaned.shape[0]} "
            f"opaque={(a > 16).mean():.1%} partial={((a > 16) & (a < 250)).mean():.2%}"
        )

    # The ghost's black extrusion blends into the card, so a separate ghost
    # layer leaves a scar. The app floats the whole cleaned mark instead.
    sd = np.array(Image.open(ROOT / "public/LogoGF-styled-sd.png").convert("RGBA"))
    cropped = Image.fromarray(crop_to_content(sd, 16), "RGBA")
    app = ROOT / "public/logo/ghost-frame.png"
    app.parent.mkdir(parents=True, exist_ok=True)
    cropped.save(app, "PNG", optimize=True)
    cropped.save(app.with_suffix(".webp"), "WEBP", lossless=True, quality=100, method=6)
    print("app mark -> public/logo/ghost-frame.png")


if __name__ == "__main__":
    main()
