#!/usr/bin/env python3
"""Replace background with a flat studio backdrop (no shadow)."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from rembg import remove

# Match the plain off-white from the original reference headshot.
FLAT_BG = (245, 245, 243)


def clean_alpha(rgba: np.ndarray, bg_rgb: tuple[int, int, int]) -> np.ndarray:
    """Remove dark cutout halos and soften mask edges."""
    alpha_img = Image.fromarray(rgba[:, :, 3].astype(np.uint8), mode="L")
    alpha_img = alpha_img.filter(ImageFilter.MinFilter(5))
    alpha_img = alpha_img.filter(ImageFilter.GaussianBlur(radius=1.6))
    alpha = np.asarray(alpha_img, dtype=np.float32)

    bg = np.array(bg_rgb, dtype=np.float32)
    rgb = rgba[:, :, :3].astype(np.float32)
    a = alpha / 255.0
    rgb = rgb * a[..., None] + bg * (1 - a[..., None])

    out = rgba.copy()
    out[:, :, :3] = np.clip(rgb, 0, 255)
    out[:, :, 3] = alpha
    return out


def flat_background(path: Path, bg_rgb: tuple[int, int, int] = FLAT_BG) -> None:
    source = Image.open(path).convert("RGBA")
    cutout = remove(source, post_process_mask=True)
    rgba = clean_alpha(np.array(cutout, dtype=np.float32), bg_rgb)
    h, w = rgba.shape[:2]

    bg = np.full((h, w, 3), bg_rgb, dtype=np.float32)
    alpha = rgba[:, :, 3:4] / 255.0
    rgb = rgba[:, :, :3]
    composite = np.clip(rgb * alpha + bg * (1 - alpha), 0, 255).astype(np.uint8)

    Image.fromarray(composite, mode="RGB").save(path, format="PNG", optimize=True)
    print(f"Saved flat background: {path}")


if __name__ == "__main__":
    flat_background(
        Path("/Users/adnaanjiwa/Cursor/forecastingresearch-website-clone/public/assets/img/profile-enhanced.png")
    )
