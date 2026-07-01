#!/usr/bin/env python3
"""Apply a very subtle sharpness boost to the face region only."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


def face_mask(size: tuple[int, int]) -> Image.Image:
    w, h = size
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    # Cover hair, face, and glasses; stop above the shirt collar.
    draw.ellipse((int(w * 0.14), int(h * 0.02), int(w * 0.86), int(h * 0.58)), fill=255)
    return mask.filter(ImageFilter.GaussianBlur(radius=18))


def enhance_face(path: Path, out_path: Path) -> None:
    img = Image.open(path).convert("RGB")
    mask = face_mask(img.size)
    mask_arr = np.asarray(mask, dtype=np.float32) / 255.0

    # Gentle micro-detail recovery; keep changes subtle.
    sharpened = img.filter(ImageFilter.UnsharpMask(radius=0.9, percent=55, threshold=2))
    sharpened = ImageEnhance.Sharpness(sharpened).enhance(1.06)
    sharpened = ImageEnhance.Contrast(sharpened).enhance(1.02)

    base = np.asarray(img, dtype=np.float32)
    enhanced = np.asarray(sharpened, dtype=np.float32)
    alpha = mask_arr[..., None]
    blended = np.clip(base * (1 - alpha) + enhanced * alpha, 0, 255).astype(np.uint8)

    Image.fromarray(blended, mode="RGB").save(out_path, format="PNG", optimize=True)
    print(f"Saved: {out_path}")


if __name__ == "__main__":
    src = Path("/Users/adnaanjiwa/Cursor/forecastingresearch-website-clone/public/assets/img/profile-enhanced.png")
    enhance_face(src, src)
