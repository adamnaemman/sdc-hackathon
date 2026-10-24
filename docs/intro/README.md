# AURA intro — 5 seconds, DaVinci Resolve ready

| | |
|---|---|
| Frames | `frames/aura_intro_0000.png` … `aura_intro_0149.png` |
| Resolution | 1920 × 1080 |
| Frame rate | **30 fps** |
| Duration | 5.0 s |
| Size on disk | ~12.4 MB |
| Preview | `preview.gif` (640 × 360, silent loop) |

Rebuild with `python scripts/build_intro.py` (about 75 seconds). Change `DURATION`
or `FPS` at the top of that script if the pitch needs 3 s or 4 s.

## Import into DaVinci Resolve

1. **Project Settings → Master Settings → Timeline frame rate = 30** (must match, or the clip plays fast/slow).
2. **Media page** → in Media Storage, browse to `docs/intro/frames/`.
3. Right-click **`aura_intro_0000.png`** → **Add to Media Pool**. Resolve detects the numbering and imports the whole range as one 5-second clip.
   - If it imports only a single still: **Preferences → Media → tick “Automatically import image sequences”**, then repeat step 3.
4. Drag the clip to the timeline. It should be exactly 5 seconds (150 frames).
5. Optional: **Inspector → Scaling** if you need to fit it into a vertical edit.

## What happens on screen

| Time | Beat |
|---|---|
| 0.0–0.7 s | Cream background, faint grid fades in |
| 0.3–1.0 s | Compass mark scales in |
| 0.6–1.4 s | “AURA” rises and fades in |
| 0.9–1.7 s | “WORKFORCE” settles, letterspacing tightens |
| 0.9–2.2 s | Salmon orbit arc sweeps 300°, a dot rides the end |
| 1.6–2.4 s | Tagline “Your next chapter, mapped.” fades up below the ring |
| 2.4–4.6 s | Hold with a 3% push-in so it never feels frozen |
| 4.55–5.0 s | Fade to cream — cut cleanly into the next clip |

## Colour values (if you build titles to match)

| Token | Hex |
|---|---|
| Ink | `#1F3A37` |
| Cream | `#F6F2EA` |
| Salmon accent | `#D98E77` |
| Muted text | `#5B6B63` |

Sound: there is no audio in the sequence. Any 92–100 BPM bed works; the visual
beats land at 0.7, 1.4, 2.2 and 4.6 seconds.
