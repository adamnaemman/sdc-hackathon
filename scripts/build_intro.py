"""
Render a 5-second intro as a PNG image sequence for DaVinci Resolve.

Output
------
docs/intro/frames/aura_intro_0000.png ... 0149.png   1920x1080, 30 fps, 5.0 s
docs/intro/preview.gif                                 small loop for quick review

Why a sequence and not a video file: there is no ffmpeg here, and DaVinci imports
image sequences directly. Import the folder, set the frame rate to 30, and it
becomes one 5-second clip you can cut against music.

Design follows the app: ink #1F3A37 on cream #F6F2EA, salmon #D98E77 accent.
"""

from __future__ import annotations

import math
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1920, 1080
FPS = 30
DURATION = 5.0
TOTAL_FRAMES = int(FPS * DURATION)

INK = (31, 58, 55)
CREAM = (246, 242, 234)
ACCENT = (217, 142, 119)
MUTED = (91, 107, 103)

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "docs" / "intro"
FRAMES = OUT / "frames"

FONT_DIR = Path(r"C:\Windows\Fonts")
FONT_BOLD = FONT_DIR / "segoeuib.ttf"
FONT_SEMI = FONT_DIR / "seguisb.ttf"
FONT_REGULAR = FONT_DIR / "segoeui.ttf"
FALLBACK_BOLD = FONT_DIR / "arialbd.ttf"
FALLBACK_REGULAR = FONT_DIR / "arial.ttf"


def load_font(bold: bool, size: int) -> ImageFont.FreeTypeFont:
    candidates = [FONT_BOLD if bold else FONT_REGULAR, FALLBACK_BOLD if bold else FALLBACK_REGULAR]
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def ease_out_cubic(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def ease_in_out(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def phase(frame: int, start: float, end: float) -> float:
    """Normalised progress of a frame inside a [start, end] window in seconds."""
    moment = frame / FPS
    if moment <= start:
        return 0.0
    if moment >= end:
        return 1.0
    return (moment - start) / (end - start)


def alpha(colour: tuple[int, int, int], value: float) -> tuple[int, int, int, int]:
    return (*colour, int(max(0.0, min(1.0, value)) * 255))


def draw_tracked_text(
    draw: ImageDraw.ImageDraw,
    centre_x: float,
    y: float,
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int, int],
    tracking: float,
) -> None:
    """Draw text with letter spacing, centred horizontally."""
    widths = [draw.textlength(char, font=font) for char in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = centre_x - total / 2
    for char, width in zip(text, widths):
        draw.text((x, y), char, font=font, fill=fill)
        x += width + tracking


def draw_mark(draw: ImageDraw.ImageDraw, centre: tuple[float, float], radius: float, opacity: float) -> None:
    """The compass mark: a ring with a two-tone needle."""
    cx, cy = centre
    ring_width = max(2, int(radius * 0.13))
    draw.ellipse(
        [cx - radius, cy - radius, cx + radius, cy + radius],
        outline=alpha(INK, 0.9 * opacity),
        width=ring_width,
    )
    needle = [
        (cx, cy - radius * 0.62),
        (cx + radius * 0.30, cy),
        (cx, cy + radius * 0.62),
        (cx - radius * 0.30, cy),
    ]
    draw.polygon(needle, fill=alpha(INK, 0.92 * opacity))
    draw.polygon(
        [(cx, cy - radius * 0.62), (cx + radius * 0.30, cy), (cx, cy)],
        fill=alpha(ACCENT, 0.95 * opacity),
    )


def draw_grid(base: Image.Image, opacity: float) -> None:
    if opacity <= 0:
        return
    grid = Image.new("RGBA", base.size, (0, 0, 0, 0))
    pen = ImageDraw.Draw(grid)
    step = 64
    colour = alpha(INK, 0.05 * opacity)
    for x in range(0, WIDTH, step):
        pen.line([(x, 0), (x, HEIGHT)], fill=colour, width=1)
    for y in range(0, HEIGHT, step):
        pen.line([(0, y), (WIDTH, y)], fill=colour, width=1)
    base.alpha_composite(grid)


def draw_glow(base: Image.Image, opacity: float) -> None:
    if opacity <= 0:
        return
    glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    pen = ImageDraw.Draw(glow)
    radius = 520
    steps = 26
    for index in range(steps, 0, -1):
        ratio = index / steps
        r = int(radius * ratio)
        value = 0.16 * opacity * (1 - ratio) ** 1.4
        pen.ellipse(
            [WIDTH * 0.72 - r, HEIGHT * 0.22 - r, WIDTH * 0.72 + r, HEIGHT * 0.22 + r],
            fill=alpha(ACCENT, value),
        )
    base.alpha_composite(glow.filter(__import__("PIL.ImageFilter", fromlist=["GaussianBlur"]).GaussianBlur(28)))


def render_frame(frame: int) -> Image.Image:
    base = Image.new("RGBA", (WIDTH, HEIGHT), alpha(CREAM, 1.0))
    draw = ImageDraw.Draw(base)

    # Slow push-in across the whole piece, so the hold never feels frozen.
    zoom = 1.0 + 0.03 * ease_in_out(frame / TOTAL_FRAMES)

    grid_alpha = ease_out_cubic(phase(frame, 0.0, 0.7))
    glow_alpha = ease_out_cubic(phase(frame, 0.2, 1.6))

    layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    layer_draw = ImageDraw.Draw(layer)

    # Orbit ring: hairline circle, then a salmon arc that sweeps once.
    centre = (WIDTH / 2, HEIGHT / 2 - 30)
    ring_r = 330
    ring_alpha = ease_out_cubic(phase(frame, 0.5, 1.5))
    if ring_alpha > 0:
        layer_draw.ellipse(
            [centre[0] - ring_r, centre[1] - ring_r, centre[0] + ring_r, centre[1] + ring_r],
            outline=alpha(INK, 0.10 * ring_alpha),
            width=2,
        )
        layer_draw.ellipse(
            [centre[0] - ring_r * 0.62, centre[1] - ring_r * 0.62, centre[0] + ring_r * 0.62, centre[1] + ring_r * 0.62],
            outline=alpha(INK, 0.07 * ring_alpha),
            width=2,
        )

    sweep = ease_in_out(phase(frame, 0.9, 2.2))
    if sweep > 0:
        start_angle = -90
        end_angle = start_angle + 300 * sweep
        layer_draw.arc(
            [centre[0] - ring_r, centre[1] - ring_r, centre[0] + ring_r, centre[1] + ring_r],
            start=start_angle,
            end=end_angle,
            fill=alpha(ACCENT, 0.85),
            width=4,
        )
        # A dot riding the arc.
        theta = math.radians(end_angle)
        dot = (centre[0] + ring_r * math.cos(theta), centre[1] + ring_r * math.sin(theta))
        layer_draw.ellipse([dot[0] - 9, dot[1] - 9, dot[0] + 9, dot[1] + 9], fill=alpha(ACCENT, 1.0))

    # Mark.
    mark_scale = 0.62 + 0.38 * ease_out_cubic(phase(frame, 0.35, 1.0))
    mark_alpha = ease_out_cubic(phase(frame, 0.35, 0.95))
    if mark_alpha > 0:
        draw_mark(layer_draw, (centre[0], centre[1] - 150), 52 * mark_scale, mark_alpha)

    # Wordmark.
    word_alpha = ease_out_cubic(phase(frame, 0.6, 1.35))
    word_rise = (1 - ease_out_cubic(phase(frame, 0.6, 1.35))) * 34
    if word_alpha > 0:
        font_word = load_font(True, 148)
        draw_tracked_text(
            layer_draw, centre[0], centre[1] - 60 + word_rise,
            "AURA", font_word, alpha(INK, word_alpha), 10,
        )

    # Sub-label.
    sub_alpha = ease_out_cubic(phase(frame, 0.95, 1.7))
    if sub_alpha > 0:
        font_sub = load_font(False, 34)
        tracking = 30 - 12 * ease_out_cubic(phase(frame, 0.95, 1.9))
        draw_tracked_text(
            layer_draw, centre[0], centre[1] + 118,
            "WORKFORCE", font_sub, alpha(MUTED, sub_alpha), tracking,
        )

    # Tagline.
    tag_alpha = ease_out_cubic(phase(frame, 1.6, 2.4))
    tag_rise = (1 - ease_out_cubic(phase(frame, 1.6, 2.4))) * 22
    if tag_alpha > 0:
        font_tag = load_font(False, 46)
        draw_tracked_text(
            layer_draw, centre[0], centre[1] + 382 + tag_rise,
            "Your next chapter, mapped.", font_tag, alpha(INK, 0.82 * tag_alpha), 1,
        )

    # Whole composition zooms as one piece.
    if zoom != 1.0:
        scaled = layer.resize((int(WIDTH * zoom), int(HEIGHT * zoom)), Image.LANCZOS)
        offset = ((WIDTH - scaled.width) // 2, (HEIGHT - scaled.height) // 2)
        composited = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        composited.paste(scaled, offset, scaled)
        layer = composited

    base.alpha_composite(layer)
    draw_grid(base, grid_alpha)
    draw_glow(base, glow_alpha)

    # Fade to cream at the tail so it cuts cleanly into the next clip.
    outro = phase(frame, DURATION - 0.45, DURATION)
    if outro > 0:
        veil = Image.new("RGBA", (WIDTH, HEIGHT), alpha(CREAM, ease_in_out(outro)))
        base.alpha_composite(veil)

    return base.convert("RGB")


def main() -> None:
    FRAMES.mkdir(parents=True, exist_ok=True)
    for index in range(TOTAL_FRAMES):
        render_frame(index).save(FRAMES / f"aura_intro_{index:04d}.png", optimize=True)
        if index % 30 == 0:
            print(f"  frame {index}/{TOTAL_FRAMES}", flush=True)

    # A small GIF so the motion can be checked without opening DaVinci.
    preview_frames = [render_frame(i).resize((640, 360), Image.LANCZOS) for i in range(0, TOTAL_FRAMES, 2)]
    preview_frames[0].save(
        OUT / "preview.gif",
        save_all=True,
        append_images=preview_frames[1:],
        duration=int(1000 / (FPS / 2)),
        loop=0,
        optimize=True,
    )

    total_bytes = sum(os.path.getsize(FRAMES / name) for name in os.listdir(FRAMES))
    print(f"done: {TOTAL_FRAMES} frames, {total_bytes / 1e6:.1f} MB -> {FRAMES}")


if __name__ == "__main__":
    main()
