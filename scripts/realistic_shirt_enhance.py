#!/usr/bin/env python3
"""Make the shirt look more natural without changing the face."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


def shirt_mask(size: tuple[int, int]) -> Image.Image:
    w, h = size
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
  # Shirt area from collar line downward, with soft side taper.
    draw.polygon(
        [
            (int(w * 0.08), int(h * 0.54)),
            (int(w * 0.92), int(h * 0.54)),
            (w, h),
            (0, h),
        ],
        fill=255,
    )
    return mask.filter(ImageFilter.GaussianBlur(radius=16))


def naturalize_shirt(img: Image.Image, mask: Image.Image) -> Image.Image:
    w, h = img.size
    mask_arr = np.asarray(mask, dtype=np.float32) / 255.0

    # Reduce the overly crisp, synthetic fabric look.
    softened = img.filter(ImageFilter.GaussianBlur(radius=0.65))
    softened = ImageEnhance.Sharpness(softened).enhance(0.92)
    softened = ImageEnhance.Contrast(softened).enhance(0.96)

    arr = np.asarray(softened, dtype=np.float32)

    # Shift toward a warmer, cotton-like blush pink.
    arr[:, :, 0] = np.clip(arr[:, :, 0] * 1.01 + 4, 0, 255)
    arr[:, :, 1] = np.clip(arr[:, :, 1] * 0.99 + 1, 0, 255)
    arr[:, :, 2] = np.clip(arr[:, :, 2] * 0.95 + 2, 0, 255)

    # Gentle draping and fold shading.
    y = np.linspace(0.0, 1.0, h, dtype=np.float32)[:, None]
    x = np.linspace(0.0, 1.0, w, dtype=np.float32)[None, :]
    folds = (
        1.0
        - 0.035 * np.sin(x * np.pi * 2.4 + 0.3)
        - 0.025 * np.sin(y * np.pi * 3.2 + 0.8)
        - 0.015 * (y**1.4)
    )
    folds = np.clip(folds, 0.9, 1.0)
    arr *= folds[:, :, None]

    # Fine cotton weave variation.
    rng = np.random.default_rng(21)
    weave = rng.normal(0.0, 1.8, arr.shape)
    arr += weave

    # Keep collar/placket readable but not hyper-sharp.
    enhanced = np.clip(arr, 0, 255).astype(np.uint8)
    enhanced_img = Image.fromarray(enhanced, mode="RGB")

    base = np.asarray(img, dtype=np.float32)
    alpha = mask_arr[..., None]
    blended = np.clip(base * (1 - alpha) + enhanced.astype(np.float32) * alpha, 0, 255).astype(
        np.uint8
    )
    return Image.fromarray(blended, mode="RGB")


def process(path: Path) -> None:
    img = Image.open(path).convert("RGB")
    mask = shirt_mask(img.size)
    result = naturalize_shirt(img, mask)
    result.save(path, format="PNG", optimize=True)
    print(f"Saved: {path}")


if __name__ == "__main__":
    process(
        Path("/Users/adnaanjiwa/Cursor/forecastingresearch-website-clone/public/assets/img/profile-enhanced.png")
    )
