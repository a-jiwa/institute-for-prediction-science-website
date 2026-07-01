#!/usr/bin/env python3
"""Enhance profile photo: plain background, shirt only, upscale + sharpen."""

from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from rembg import remove


def load_bgr(path: Path) -> np.ndarray:
    img = Image.open(path).convert("RGBA")
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGBA2BGRA)


def remove_background_rgba(image: Image.Image) -> Image.Image:
    return remove(image)


def sample_shirt_color(rgba: np.ndarray) -> np.ndarray:
    """Estimate shirt color from bright pixels near the collar region."""
    h, w = rgba.shape[:2]
    y0, y1 = int(h * 0.42), int(h * 0.62)
    x0, x1 = int(w * 0.30), int(w * 0.70)
    region = rgba[y0:y1, x0:x1, :3].astype(np.float32)
    alpha = rgba[y0:y1, x0:x1, 3]
    brightness = region.mean(axis=2)
    mask = (alpha > 200) & (brightness > 170)
    if mask.sum() < 20:
        return np.array([245, 245, 245], dtype=np.float32)
    samples = region[mask]
    return samples.mean(axis=0)


def blazer_mask(rgba: np.ndarray) -> np.ndarray:
    """Mask dark blazer pixels while preserving face, hair, and glasses."""
    h, w = rgba.shape[:2]
    rgb = rgba[:, :, :3].astype(np.float32)
    alpha = rgba[:, :, 3]
    luminance = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]

    # Torso region below chin, excluding top of frame (hair/face).
    y_start = int(h * 0.48)
    region = np.zeros((h, w), dtype=bool)
    region[y_start:, :] = True

    # Dark fabric: blazer is much darker than the white shirt.
    dark = luminance < 118
    mask = region & dark & (alpha > 128)

    # Exclude skin-toned pixels that can appear dark in shadow.
    r, g, b = rgb[:, :, 2], rgb[:, :, 1], rgb[:, :, 0]
    skin_like = (r > 95) & (g > 60) & (b > 40) & (r > g) & (r > b) & ((r - g) < 90)
    mask &= ~skin_like

    mask_u8 = (mask.astype(np.uint8) * 255)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask_u8 = cv2.morphologyEx(mask_u8, cv2.MORPH_CLOSE, kernel, iterations=2)
    mask_u8 = cv2.morphologyEx(mask_u8, cv2.MORPH_OPEN, kernel, iterations=1)
    mask_u8 = cv2.GaussianBlur(mask_u8, (7, 7), 0)
    return mask_u8


def replace_blazer_with_shirt(rgba: np.ndarray, mask_u8: np.ndarray, shirt_color: np.ndarray) -> np.ndarray:
    bgr = cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGR)
    shirt_bgr = shirt_color[::-1].astype(np.uint8)

    # Build a subtle fabric texture from noise so the fill isn't flat.
    h, w = rgba.shape[:2]
    noise = np.random.default_rng(42).normal(0, 4, (h, w, 3)).astype(np.float32)
    base = np.clip(shirt_bgr.astype(np.float32) + noise, 0, 255).astype(np.uint8)
    base_layer = np.tile(base, (1, 1))  # keep array writable copy semantics

    alpha = (mask_u8.astype(np.float32) / 255.0)[..., None]
    blended = (bgr.astype(np.float32) * (1 - alpha) + base_layer.astype(np.float32) * alpha)
    result = np.clip(blended, 0, 255).astype(np.uint8)

    # Soft inpaint at boundaries for smoother lapels/collar transitions.
    hard_mask = (mask_u8 > 200).astype(np.uint8) * 255
    if hard_mask.any():
        inpainted = cv2.inpaint(result, hard_mask, 3, cv2.INPAINT_TELEA)
        edge = cv2.GaussianBlur(mask_u8, (11, 11), 0).astype(np.float32) / 255.0
        edge = edge[..., None]
        result = np.clip(
            result.astype(np.float32) * (1 - edge) + inpainted.astype(np.float32) * edge,
            0,
            255,
        ).astype(np.uint8)

    out = rgba.copy()
    out[:, :, :3] = cv2.cvtColor(result, cv2.COLOR_BGR2RGB)
    return out


def composite_plain_background(rgba: np.ndarray, bg_rgb=(245, 245, 243)) -> Image.Image:
  h, w = rgba.shape[:2]
  bg = np.full((h, w, 3), bg_rgb, dtype=np.uint8)
  alpha = rgba[:, :, 3:4].astype(np.float32) / 255.0
  rgb = rgba[:, :, :3].astype(np.float32)
  composite = (rgb * alpha + bg.astype(np.float32) * (1 - alpha)).astype(np.uint8)
  return Image.fromarray(composite, mode="RGB")


def upscale_and_enhance(img: Image.Image, scale: int = 4) -> Image.Image:
    w, h = img.size
    upscaled = img.resize((w * scale, h * scale), Image.Resampling.LANCZOS)
    upscaled = upscaled.filter(ImageFilter.UnsharpMask(radius=1.6, percent=140, threshold=2))
    upscaled = ImageEnhance.Contrast(upscaled).enhance(1.04)
    upscaled = ImageEnhance.Sharpness(upscaled).enhance(1.12)
    upscaled = ImageEnhance.Color(upscaled).enhance(0.98)
    return upscaled


def process(input_path: Path, output_path: Path, scale: int = 4) -> None:
    source = Image.open(input_path).convert("RGBA")
    cutout = remove_background_rgba(source)
    rgba = np.array(cutout)

    shirt_color = sample_shirt_color(rgba)
    mask = blazer_mask(rgba)
    rgba = replace_blazer_with_shirt(rgba, mask, shirt_color)

    composed = composite_plain_background(rgba)
    final = upscale_and_enhance(composed, scale=scale)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    final.save(output_path, format="PNG", optimize=True)
    print(f"Saved: {output_path} ({final.size[0]}x{final.size[1]})")


if __name__ == "__main__":
    in_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(
        "/Users/adnaanjiwa/.cursor/projects/Users-adnaanjiwa-Cursor-forecastingresearch-website-clone/assets/profile-pic-3-5170e985-19cd-4f32-a7e1-71916ec54b20.png"
    )
    out_path = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(
        "/Users/adnaanjiwa/Cursor/forecastingresearch-website-clone/public/images/profile-enhanced.png"
    )
    process(in_path, out_path)
