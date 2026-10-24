"""
Export the three device mockups as transparent PNGs for the slide deck.

It reuses the drawing code from build_ads_4k.py so the deck and the motion
graphic stay visually identical.
"""

from __future__ import annotations

import importlib.util
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "docs" / "deck-assets"
OUT.mkdir(parents=True, exist_ok=True)


def load_ads_module():
    spec = importlib.util.spec_from_file_location("ads", HERE / "build_ads_4k.py")
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def main() -> None:
    ads = load_ads_module()

    phone = ads.build_device(ads.phone_screen(), "phone")
    tablet = ads.build_device(ads.tablet_screen(), "tablet")
    laptop = ads.build_device(ads.laptop_screen(), "laptop")

    phone.save(OUT / "device-phone.png")
    tablet.save(OUT / "device-tablet.png")
    laptop.save(OUT / "device-laptop.png")

    for name, image in (("phone", phone), ("tablet", tablet), ("laptop", laptop)):
        print(f"{name}: {image.width}x{image.height}")


if __name__ == "__main__":
    main()
