# AURA device motion graphic — 4K, 60 fps, 10 s

| | |
|---|---|
| Frames | `frames/aura_4k_0000.png` … `aura_4k_0599.png` |
| Resolution | **3840 × 2160 (UHD 4K)** |
| Frame rate | **60 fps** |
| Duration | 10.0 s (600 frames) |
| Preview | `preview.gif` |
| Rebuild | `python scripts/build_ads_4k.py` (~10 min) |

The three device screens are drawn from the app's own design language, not
screenshotted: ink `#1F3A37` on cream `#F6F2EA` with the salmon `#D98E77` accent.
That keeps the graphic honest — there is no fake UI and no third-party asset.

## Import into DaVinci Resolve

1. **Project Settings → Master Settings → Timeline frame rate = 60.**
2. Media page → browse to `docs/ads4k/frames/`.
3. Right-click **`aura_4k_0000.png`** → *Add to Media Pool*. Resolve reads the
   numbering and imports the whole range as one 10-second clip.
   - If only a still appears: **Preferences → Media → “Automatically import image
     sequences”**, then repeat.
4. Optional: **Inspector → Scaling → “Fit”** if you cut it into a 1080p timeline.

The sequence ends on a 0.45 s fade to cream, so it can be cut straight into the
next shot without a transition.

## Beats

| Time | Beat |
|---|---|
| 0.0–0.8 | Cream and faint grid fade in; salmon glow blooms top-right |
| 0.25–1.15 | Phone rises from below, left of frame |
| 0.55–1.45 | Tablet rises, centre |
| 0.85–1.75 | Laptop rises, right |
| 0.4–1.2 | Eyebrow “AURA · WORKFORCE” and a salmon rule |
| 5.9–6.7 | Headline “Four checkpoints. / One page.” |
| 6.3–7.1 | Four chips: market signals, profile, future roles, learning path |
| 5.6–8.4 | Camera pushes in 6 % on the device row |
| 8.4–9.1 | Tagline “Your next chapter, mapped.” |
| 9.55–10.0 | Fade to cream |

## Colour and type

| Token | Hex | Use |
|---|---|---|
| Ink | `#1F3A37` | text, bezels |
| Cream | `#F6F2EA` | background |
| Salmon | `#D98E77` | accent, chart bars, rule |
| Muted | `#5B6B63` | labels |

Type: Segoe UI Bold / Regular (Windows system fonts). If you rebuild on another
machine, either install Segoe UI or edit `FONTS` in the script.

## If you need a different length or ratio

- **5 s:** set `DURATION = 5` and delete the Act 3 block (headline + chips) in
  `render_frame`, or keep it and it will simply play faster.
- **9:16 (Reels / TikTok):** change `LOGICAL_W, LOGICAL_H = 1080, 1920`, set
  `SCALE = 2` (gives 2160 × 3840), and move the device row to a vertical stack —
  phone at `y = 520`, tablet at `y = 1080`, laptop at `y = 1620`, all `x = 540`.
- **30 fps:** set `FPS = 30`; `TOTAL` follows automatically.
