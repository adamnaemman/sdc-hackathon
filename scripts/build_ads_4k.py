"""
Render a 10-second, 60 fps, 4K device motion graphic for AURA-Workforce.

Output
------
docs/ads4k/frames/aura_4k_0000.png ... 0599.png   3840x2160, 60 fps, 10.0 s
docs/ads4k/preview.gif                              small loop for review

This is a motion graphic, not a screen recording: the three device screens are
drawn from the app's own design language (ink on cream, salmon accent), so no
real screenshot or third-party asset is needed.

DaVinci Resolve imports the numbered PNG sequence as one 10-second clip at 60 fps.
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ---------------------------------------------------------------------------
# Canvas
# ---------------------------------------------------------------------------

LOGICAL_W, LOGICAL_H = 1920, 1080
SCALE = 2                       # 1920x1080 -> 3840x2160
W, H = LOGICAL_W * SCALE, LOGICAL_H * SCALE

FPS = 60
DURATION = 10.0
TOTAL = int(FPS * DURATION)

INK = (31, 58, 55)
CREAM = (246, 242, 234)
ACCENT = (217, 142, 119)
MUTED = (91, 107, 103)
WHITE = (255, 255, 255)

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "assets" / "ads4k"
FRAMES = OUT / "frames"

FONTS = Path(r"C:\Windows\Fonts")
BOLD = FONTS / "segoeuib.ttf"
REGULAR = FONTS / "segoeui.ttf"
FALLBACK_BOLD = FONTS / "arialbd.ttf"
FALLBACK_REG = FONTS / "arial.ttf"


def px(value: float) -> int:
    """Logical pixels to rendered pixels."""
    return int(round(value * SCALE))


def font(size: float, bold: bool = False) -> ImageFont.FreeTypeFont:
    primary = BOLD if bold else REGULAR
    fallback = FALLBACK_BOLD if bold else FALLBACK_REG
    path = primary if primary.exists() else fallback
    return ImageFont.truetype(str(path), px(size))


def ease_out(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def ease_in_out(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def stage(frame: int, start: float, end: float) -> float:
    moment = frame / FPS
    if moment <= start:
        return 0.0
    if moment >= end:
        return 1.0
    return (moment - start) / (end - start)


def tint(colour: tuple[int, int, int], opacity: float) -> tuple[int, int, int, int]:
    return (*colour, int(max(0.0, min(1.0, opacity)) * 255))


def tracked(
    draw: ImageDraw.ImageDraw,
    centre_x: float,
    y: float,
    text: str,
    typeface: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int, int],
    tracking: float = 0.0,
) -> None:
    widths = [draw.textlength(char, font=typeface) for char in text]
    total = sum(widths) + px(tracking) * (len(text) - 1)
    x = px(centre_x) - total / 2
    for char, width in zip(text, widths):
        draw.text((x, px(y)), char, font=typeface, fill=fill)
        x += width + px(tracking)


# ---------------------------------------------------------------------------
# Static background layers (built once, reused for all 600 frames)
# ---------------------------------------------------------------------------

def build_background() -> Image.Image:
    base = Image.new("RGBA", (W, H), tint(CREAM, 1.0))
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pen = ImageDraw.Draw(grid)
    step = px(48)
    colour = tint(INK, 0.045)
    for x in range(0, W, step):
        pen.line([(x, 0), (x, H)], fill=colour, width=1)
    for y in range(0, H, step):
        pen.line([(0, y), (W, y)], fill=colour, width=1)
    base.alpha_composite(grid)
    return base


def build_glow() -> Image.Image:
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pen = ImageDraw.Draw(glow)
    cx, cy = px(1450), px(230)
    radius = px(620)
    steps = 30
    for index in range(steps, 0, -1):
        ratio = index / steps
        r = int(radius * ratio)
        value = 0.20 * (1 - ratio) ** 1.3
        pen.ellipse([cx - r, cy - r, cx + r, cy + r], fill=tint(ACCENT, value))
    return glow.filter(ImageFilter.GaussianBlur(px(30)))


# ---------------------------------------------------------------------------
# Device artwork (drawn once at 2x, then scaled per frame)
# ---------------------------------------------------------------------------

def rounded(draw: ImageDraw.ImageDraw, box, radius: float, fill=None, outline=None, width: int = 1) -> None:
    draw.rounded_rectangle([px(box[0]), px(box[1]), px(box[2]), px(box[3])], radius=px(radius), fill=fill, outline=outline, width=width)


def phone_screen() -> Image.Image:
    """Miniature of the hero: wordmark, orbit, two buttons."""
    w, h = 150, 310
    img = Image.new("RGBA", (px(w), px(h)), tint(CREAM, 1.0))
    d = ImageDraw.Draw(img)

    d.ellipse([px(75 - 46), px(96 - 46), px(75 + 46), px(96 + 46)], outline=tint(INK, 0.14), width=px(1))
    d.arc([px(75 - 46), px(96 - 46), px(75 + 46), px(96 + 46)], -90, 150, fill=tint(ACCENT, 0.9), width=px(1.6))

    tracked(d, 75, 52, "AURA", font(11, True), tint(INK, 1), 1.2)
    tracked(d, 75, 70, "WORKFORCE", font(4.2), tint(MUTED, 1), 1.6)

    rounded(d, (24, 160, 126, 176), 5, fill=tint(INK, 1))
    tracked(d, 75, 164, "START", font(4.6, True), tint(CREAM, 1), 0.8)
    rounded(d, (24, 184, 126, 200), 5, outline=tint(INK, 0.35), width=px(0.8))

    for index, label in enumerate(["SIGNALS", "PROFILE", "ROLES", "PATHWAY"]):
        y = 224 + index * 20
        rounded(d, (20, y, 130, y + 14), 4, fill=tint(INK, 0.06))
        tracked(d, 75, y + 4, label, font(4), tint(MUTED, 1), 0.7)
    return img


def tablet_screen() -> Image.Image:
    """Miniature of the live chart: four rows with bars of different lengths."""
    w, h = 330, 248
    img = Image.new("RGBA", (px(w), px(h)), tint(CREAM, 1.0))
    d = ImageDraw.Draw(img)

    tracked(d, 18, 14, "LIVE SKILL DEMAND", font(5.4, True), tint(MUTED, 1), 0.9)
    d.line([px(18), px(30), px(w - 18), px(30)], fill=tint(INK, 0.12), width=px(0.7))

    rows = [("Python", 0.62), ("SQL", 0.48), ("Power BI", 0.36), ("Figma", 0.24), ("SAP", 0.18)]
    for index, (label, value) in enumerate(rows):
        y = 44 + index * 34
        d.text((px(18), px(y)), label, font=font(5), fill=tint(INK, 0.85))
        rounded(d, (110, y + 1, w - 30, y + 9), 3, fill=tint(INK, 0.07))
        rounded(d, (110, y + 1, 110 + (w - 140) * value, y + 9), 3, fill=tint(ACCENT, 0.95))
        d.text((px(w - 26), px(y)), f"{int(value * 100)}%", font=font(4.6), fill=tint(MUTED, 1))

    rounded(d, (18, h - 34, w - 18, h - 16), 4, fill=tint(INK, 0.05))
    d.text((px(22), px(h - 29)), "300 postings · 30 days · source attached", font=font(4.2), fill=tint(MUTED, 1))
    return img


def laptop_screen() -> Image.Image:
    """Miniature of checkpoint 03/04: card list on the left, plan panel on the right."""
    w, h = 470, 300
    img = Image.new("RGBA", (px(w), px(h)), tint(CREAM, 1.0))
    d = ImageDraw.Draw(img)

    rounded(d, (14, 12, 58, 24), 3, fill=tint(INK, 1))
    d.text((px(18), px(15)), "AURA", font=font(4.6, True), fill=tint(CREAM, 1))
    d.text((px(w - 100), px(15)), "3 checkpoints left", font=font(3.8), fill=tint(MUTED, 1))

    for index, (title, width_ratio) in enumerate(
        [("Market signals", 0.72), ("Your profile", 0.58), ("Future roles", 0.64)]
    ):
        y = 38 + index * 56
        rounded(d, (14, y, 320, y + 46), 6, outline=tint(INK, 0.12), width=px(0.7))
        d.text((px(22), px(y + 8)), title, font=font(4.8, True), fill=tint(INK, 0.9))
        rounded(d, (22, y + 22, 22 + 250 * width_ratio, y + 28), 3, fill=tint(INK, 0.10))
        rounded(d, (22, y + 32, 22 + 170 * width_ratio, y + 37), 3, fill=tint(INK, 0.06))

    rounded(d, (336, 38, w - 14, 220), 8, fill=tint(INK, 1))
    d.text((px(348), px(50)), "PLAN FOR", font=font(3.6), fill=tint(CREAM, 0.55))
    d.text((px(348), px(60)), "Process Automation", font=font(5.4, True), fill=tint(CREAM, 1))
    d.text((px(348), px(78)), "Analyst", font=font(5.4, True), fill=tint(CREAM, 1))
    d.text((px(348), px(104)), "29 hours", font=font(6.4, True), fill=tint(ACCENT, 1))
    d.text((px(348), px(118)), "5 weeks at 6 h/week", font=font(4), fill=tint(CREAM, 0.7))
    d.line([px(348), px(134), px(w - 26), px(134)], fill=tint(CREAM, 0.2), width=px(0.7))
    for index in range(3):
        y = 142 + index * 22
        rounded(d, (348, y, w - 26, y + 12), 3, fill=tint(CREAM, 0.09))
        rounded(d, (348, y, 348 + (w - 380) * (1 - index * 0.2), y + 4), 2, fill=tint(ACCENT, 0.8))

    rounded(d, (336, 232, w - 14, 262), 6, fill=tint(ACCENT, 0.18))
    d.text((px(348), px(240)), "Verified course links", font=font(4.2, True), fill=tint(INK, 0.85))
    d.text((px(348), px(250)), "every step has a real URL", font=font(3.6), fill=tint(MUTED, 1))
    return img


def build_device(screen: Image.Image, kind: str) -> Image.Image:
    """Compose bezel + screen into one image at 2x the logical display size."""
    bezel = 13 if kind != "laptop" else 17
    sw, sh = screen.width, screen.height
    pad = px(bezel)
    radius = {"phone": 16, "tablet": 12, "laptop": 8}[kind]
    base_h = px(10) if kind == "laptop" else 0

    width = sw + pad * 2
    height = sh + pad * 2 + base_h
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    d.rounded_rectangle([0, 0, width - 1, sh + pad * 2 - 1], radius=px(radius), fill=tint(INK, 1))

    # ImageDraw writes RGBA values instead of blending them, so the semi-transparent
    # bars in the screen art must be flattened onto cream before they meet the bezel.
    flat = Image.new("RGBA", (sw, sh), tint(CREAM, 1.0))
    flat.alpha_composite(screen.convert("RGBA"))
    img.paste(flat, (pad, pad))

    if kind == "phone":
        d.rounded_rectangle([width // 2 - px(22), pad - px(4), width // 2 + px(22), pad - px(1)], radius=px(2), fill=tint(INK, 1))
    if kind == "laptop":
        d.rectangle([px(6), sh + pad * 2 - 1, width - px(6), height - 1], fill=tint((205, 205, 200), 1))
        d.rectangle([px(6), sh + pad * 2 - 1, width - px(6), sh + pad * 2 + px(2)], fill=tint((160, 160, 155), 1))
        d.ellipse([width // 2 - px(8), sh + pad * 2 + px(3), width // 2 + px(8), sh + pad * 2 + px(6)], fill=tint((180, 180, 175), 1))
    return img


# ---------------------------------------------------------------------------
# Frame composition
# ---------------------------------------------------------------------------

def place(frame: Image.Image, sprite: Image.Image, centre_x: float, centre_y: float, scale: float, opacity: float) -> None:
    if scale <= 0.01 or opacity <= 0.01:
        return
    target = (max(1, int(sprite.width * scale)), max(1, int(sprite.height * scale)))
    resized = sprite.resize(target, Image.LANCZOS)
    if opacity < 0.99:
        alpha = resized.getchannel("A").point(lambda value: int(value * opacity))
        resized.putalpha(alpha)
    frame.alpha_composite(resized, (int(px(centre_x) - target[0] / 2), int(px(centre_y) - target[1] / 2)))


def render_frame(index: int, bg: Image.Image, glow: Image.Image, devices: dict[str, Image.Image]) -> Image.Image:
    frame = bg.copy()
    glow_alpha = ease_out(stage(index, 0.0, 0.8))
    if glow_alpha > 0:
        veil = glow.copy()
        if glow_alpha < 0.99:
            veil.putalpha(veil.getchannel("A").point(lambda value: int(value * glow_alpha)))
        frame.alpha_composite(veil)

    # Global camera: gentle push in the middle, settle at the end.
    zoom = 1.0 + 0.06 * ease_in_out(stage(index, 5.6, 8.4)) - 0.03 * ease_in_out(stage(index, 8.6, 9.8))
    focus_y = 620

    def camera_y(y: float) -> float:
        return focus_y + (y - focus_y) * zoom

    # Staggered entrances.
    phone_in = ease_out(stage(index, 0.25, 1.15))
    tablet_in = ease_out(stage(index, 0.55, 1.45))
    laptop_in = ease_out(stage(index, 0.85, 1.75))

    phone_y = camera_y(620 + (1 - phone_in) * 190)
    tablet_y = camera_y(620 + (1 - tablet_in) * 190)
    laptop_y = camera_y(620 + (1 - laptop_in) * 190)

    place(frame, devices["phone"], 380 - (1 - phone_in) * 120, phone_y, 1.25 * zoom, phone_in)
    place(frame, devices["tablet"], 940, tablet_y, 1.15 * zoom, tablet_in)
    place(frame, devices["laptop"], 1560 + (1 - laptop_in) * 120, laptop_y, 1.15 * zoom, laptop_in)

    draw = ImageDraw.Draw(frame)

    # Eyebrow, top left.
    eyebrow_alpha = ease_out(stage(index, 0.4, 1.2))
    if eyebrow_alpha > 0:
        draw.text((px(120), px(96)), "AURA  ·  WORKFORCE", font=font(15, True), fill=tint(MUTED, eyebrow_alpha))
        draw.line([px(120), px(124), px(214), px(124)], fill=tint(ACCENT, eyebrow_alpha), width=px(2))

    # Act 3 headline.
    head_alpha = ease_out(stage(index, 5.9, 6.7))
    head_rise = (1 - ease_out(stage(index, 5.9, 6.7))) * 26
    if head_alpha > 0:
        draw.text((px(120), px(150) + px(head_rise)), "Four checkpoints.", font=font(58, True), fill=tint(INK, head_alpha))
        draw.text((px(120), px(220) + px(head_rise)), "One page.", font=font(58, True), fill=tint(ACCENT, head_alpha))

        chips = ["Market signals", "Your profile", "Future roles", "Learning path"]
        chip_alpha = ease_out(stage(index, 6.3, 7.1))
        x = 120
        for chip in chips:
            text_w = draw.textlength(chip, font=font(15))
            width = text_w + px(24)
            rounded(draw, (x, 300 + head_rise, x + width / SCALE, 330 + head_rise), 15, outline=tint(INK, 0.25 * chip_alpha), width=px(1))
            draw.text((px(x) + px(12), px(306 + head_rise)), chip, font=font(15), fill=tint(INK, 0.8 * chip_alpha))
            x += width / SCALE + 12

    # Act 4 tagline.
    tag_alpha = ease_out(stage(index, 8.4, 9.1))
    tag_rise = (1 - ease_out(stage(index, 8.4, 9.1))) * 20
    if tag_alpha > 0:
        tracked(draw, 960, 940 + tag_rise, "Your next chapter, mapped.", font(34), tint(INK, 0.9 * tag_alpha), 0.8)

    # Tail fade.
    outro = ease_in_out(stage(index, DURATION - 0.45, DURATION))
    if outro > 0:
        frame.alpha_composite(Image.new("RGBA", (W, H), tint(CREAM, outro)))

    return frame.convert("RGB")


def main() -> None:
    FRAMES.mkdir(parents=True, exist_ok=True)

    bg = build_background()
    glow = build_glow()
    devices = {
        "phone": build_device(phone_screen(), "phone"),
        "tablet": build_device(tablet_screen(), "tablet"),
        "laptop": build_device(laptop_screen(), "laptop"),
    }

    for index in range(TOTAL):
        render_frame(index, bg, glow, devices).save(
            FRAMES / f"aura_4k_{index:04d}.png", compress_level=1
        )
        if index % 60 == 0:
            print(f"  frame {index}/{TOTAL}", flush=True)

    preview = [render_frame(i, bg, glow, devices).resize((640, 360), Image.LANCZOS) for i in range(0, TOTAL, 4)]
    preview[0].save(
        OUT / "preview.gif",
        save_all=True,
        append_images=preview[1:],
        duration=int(1000 / (FPS / 4)),
        loop=0,
        optimize=True,
    )
    print(f"done: {TOTAL} frames at {W}x{H} -> {FRAMES}")


if __name__ == "__main__":
    main()
