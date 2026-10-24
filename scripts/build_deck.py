"""
Rebuild the pitch deck for the product as it now exists.

Twelve 16:9 slides, same palette as the app (ink #1F3A37, cream #F6F2EA, salmon
#D98E77). Device visuals come from docs/deck-assets, which are rendered from the
same drawing code as the 4K motion graphic, so the deck and the ad match.

Output: docs/AURA-Workforce-Deck.pptx
"""

from __future__ import annotations

import os
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Emu, Inches, Pt

OUT = Path(__file__).resolve().parent.parent / "docs" / "AURA-Workforce-Deck.pptx"
ASSETS = Path(__file__).resolve().parent.parent / "assets" / "deck"

INK = RGBColor(0x1F, 0x3A, 0x37)
CREAM = RGBColor(0xF6, 0xF2, 0xEA)
ACCENT = RGBColor(0xD9, 0x8E, 0x77)
MUTED = RGBColor(0x5B, 0x6B, 0x63)
PANEL = RGBColor(0xEC, 0xE5, 0xD8)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

FONT = "Segoe UI"
FONT_BOLD = "Segoe UI Semibold"

SW, SH = Inches(13.333), Inches(7.5)
MARGIN = Inches(0.85)


# ---------------------------------------------------------------------------
# Primitives
# ---------------------------------------------------------------------------

def new_deck() -> Presentation:
    deck = Presentation()
    deck.slide_width = SW
    deck.slide_height = SH
    return deck


def blank(deck: Presentation, background: RGBColor):
    slide = deck.slides.add_slide(deck.slide_layouts[6])
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = background
    return slide


def textbox(
    slide,
    x,
    y,
    w,
    h,
    content,
    size=16,
    bold=False,
    colour=INK,
    spacing=1.25,
    align=PP_ALIGN.LEFT,
    space_after=8,
):
    box = slide.shapes.add_textbox(x, y, w, h)
    frame = box.text_frame
    frame.word_wrap = True
    frame.vertical_anchor = 1

    lines = content if isinstance(content, list) else [content]
    for index, line in enumerate(lines):
        paragraph = frame.paragraphs[0] if index == 0 else frame.add_paragraph()
        paragraph.text = line
        paragraph.alignment = align
        paragraph.space_after = Pt(space_after)
        paragraph.line_spacing = spacing
        for run in paragraph.runs:
            run.font.size = Pt(size)
            run.font.bold = bold
            run.font.name = FONT_BOLD if bold else FONT
            run.font.color.rgb = colour
    return box


def rule(slide, x, y, w=Inches(0.9), colour=ACCENT, thickness=Pt(2.5)):
    shape = slide.shapes.add_shape(1, x, y, w, thickness)
    shape.fill.solid()
    shape.fill.fore_color.rgb = colour
    shape.line.fill.background()
    return shape


def card(slide, x, y, w, h, fill=None, line=None, line_width=Pt(1), radius=0.14):
    shape = slide.shapes.add_shape(5, x, y, w, h)  # rounded rectangle
    shape.adjustments[0] = radius
    if fill is None:
        shape.fill.background()
    else:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill
    if line is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = line
        shape.line.width = line_width
    shape.shadow.inherit = False
    return shape


def picture(slide, path: Path, x, y, height=None, width=None):
    if height is not None:
        return slide.shapes.add_picture(str(path), x, y, height=height)
    return slide.shapes.add_picture(str(path), x, y, width=width)


def eyebrow(slide, label, colour=MUTED, on_dark=False):
    rule(slide, MARGIN, Inches(0.62), Inches(0.34), ACCENT if not on_dark else ACCENT)
    textbox(
        slide,
        MARGIN + Inches(0.5),
        Inches(0.5),
        Inches(9),
        Inches(0.3),
        label.upper(),
        size=10.5,
        bold=True,
        colour=colour,
    )


def title(slide, content, size=40, colour=INK, y=Inches(1.05), w=Inches(10.6)):
    textbox(slide, MARGIN, y, w, Inches(1.7), content, size=size, bold=True, colour=colour, spacing=1.05)


def footer(slide, label, colour=MUTED):
    textbox(slide, MARGIN, Inches(6.85), Inches(11.6), Inches(0.3), label, size=9, colour=colour)


def slide_number(slide, number, total, colour=MUTED):
    textbox(
        slide,
        SW - MARGIN - Inches(0.9),
        Inches(6.85),
        Inches(0.9),
        Inches(0.3),
        f"{number:02d} / {total:02d}",
        size=9,
        colour=colour,
        align=PP_ALIGN.RIGHT,
    )


# ---------------------------------------------------------------------------
# Slides
# ---------------------------------------------------------------------------

def slide_title(deck):
    slide = blank(deck, INK)
    rule(slide, MARGIN, Inches(1.55), Inches(0.9))
    textbox(
        slide, MARGIN, Inches(1.75), Inches(10), Inches(0.4),
        "SDC HACKATHON 2026  ·  DOMAIN 1  ·  THE AIVERSECITY FUTURE-READY WORKFORCE DOMAIN",
        size=10.5, bold=True, colour=ACCENT,
    )
    textbox(slide, MARGIN, Inches(2.3), Inches(11), Inches(1.4), "AURA-Workforce", size=62, bold=True, colour=WHITE, spacing=0.98)
    textbox(
        slide, MARGIN, Inches(3.75), Inches(8.6), Inches(1.6),
        ["Four checkpoints from the market evidence to a study plan",
         "a person can actually follow."],
        size=20, colour=CREAM, spacing=1.12, space_after=2,
    )

    picture(slide, ASSETS / "device-tablet.png", Inches(9.2), Inches(2.25), height=Inches(2.6))

    rule(slide, MARGIN, Inches(5.55), Inches(11.6), RGBColor(0x3A, 0x55, 0x51), Pt(1))
    textbox(slide, MARGIN, Inches(5.75), Inches(5.4), Inches(1.1),
            ["overinfinity  ·  Ahmad Adam Hakimi bin Naeman", "International Islamic University Malaysia"],
            size=12.5, colour=CREAM, spacing=1.4)
    textbox(slide, Inches(7.0), Inches(5.75), Inches(5.5), Inches(1.1),
            ["aura-workforce.replit.app", "github.com/adamnaemman/sdc-hackathon"],
            size=12.5, colour=ACCENT, spacing=1.4)


def slide_problem(deck):
    slide = blank(deck, CREAM)
    eyebrow(slide, "The problem")
    title(slide, ["Workers are told to reskill,", "but not what to do on Monday."])

    stats = [
        ("56%", "of Malaysian professionals already use AI at work — only 26% have had formal training.", "Hays Asia Salary Guide 2025"),
        ("600,000+", "workers projected to need reskilling within three to five years.", "MOSTI"),
        ("39%", "of workers' core skills are expected to change by 2030.", "WEF · Future of Jobs 2025"),
    ]
    x = MARGIN
    for value, note, source in stats:
        card(slide, x, Inches(2.95), Inches(3.55), Inches(2.35), fill=WHITE, line=RGBColor(0xD8, 0xD0, 0xC2))
        textbox(slide, x + Inches(0.28), Inches(3.12), Inches(3.0), Inches(0.7), value, size=34, bold=True, colour=INK)
        textbox(slide, x + Inches(0.28), Inches(3.85), Inches(3.0), Inches(1.1), note, size=11, colour=MUTED, spacing=1.25)
        textbox(slide, x + Inches(0.28), Inches(4.85), Inches(3.0), Inches(0.3), source, size=8.5, colour=ACCENT, bold=True)
        x += Inches(3.72)

    textbox(
        slide, MARGIN, Inches(5.65), Inches(11.4), Inches(0.9),
        "Yet the advice a worker receives is generic, static and rarely cites a source — while the training they are told to buy is expensive and often already out of date.",
        size=14, colour=INK, spacing=1.3,
    )
    footer(slide, "Domain 1 brief · problem statement")
    slide_number(slide, 2, 12)


def slide_who(deck):
    slide = blank(deck, CREAM)
    eyebrow(slide, "Who it is for")
    title(slide, "Four people, one moment of need.")

    personas = [
        ("The displaced worker", "A procurement assistant whose routine work is being automated. Needs a route out, not sympathy."),
        ("The switcher", "A nurse, designer or clerk deciding where existing skills can carry them next."),
        ("HR and L&D", "Planning next year's reskilling budget and needing evidence, not vendor decks."),
        ("TVET and university advisers", "Advising students from a printed list that was accurate five years ago."),
    ]
    positions = [(MARGIN, Inches(2.9)), (MARGIN + Inches(5.85), Inches(2.9)),
                 (MARGIN, Inches(4.35)), (MARGIN + Inches(5.85), Inches(4.35))]
    for (name, body), (x, y) in zip(personas, positions):
        card(slide, x, y, Inches(5.5), Inches(1.25), fill=WHITE, line=RGBColor(0xD8, 0xD0, 0xC2))
        textbox(slide, x + Inches(0.25), y + Inches(0.14), Inches(5.0), Inches(0.3), name, size=13, bold=True)
        textbox(slide, x + Inches(0.25), y + Inches(0.48), Inches(5.0), Inches(0.7), body, size=10.5, colour=MUTED, spacing=1.2)

    textbox(
        slide, MARGIN, Inches(5.95), Inches(11.4), Inches(0.6),
        "The moment: the week a person learns their role is changing. They do not want a prediction — they want to know what to do next, and whether to trust it.",
        size=13, colour=INK, spacing=1.3,
    )
    footer(slide, "Personas derived from the Domain 1 brief")
    slide_number(slide, 3, 12)


def slide_product(deck):
    slide = blank(deck, INK)
    eyebrow(slide, "The product", colour=ACCENT, on_dark=True)
    textbox(slide, MARGIN, Inches(1.0), Inches(11), Inches(1.0), "One page. Four checkpoints.", size=40, bold=True, colour=WHITE)

    picture(slide, ASSETS / "device-phone.png", Inches(0.9), Inches(2.85), height=Inches(2.45))
    picture(slide, ASSETS / "device-tablet.png", Inches(2.4), Inches(3.1), height=Inches(2.1))
    picture(slide, ASSETS / "device-laptop.png", Inches(5.15), Inches(2.85), height=Inches(2.4))

    labels = [
        ("01", "Market signals", "Live demand from real postings,\nwith the source and date."),
        ("02", "Your profile", "The AI expands what you write\ninto skills you choose."),
        ("03", "Future roles", "Occupations proposed from your\nprofile — not a fixed catalogue."),
        ("04", "Learning path", "A plan fitted to your weekly hours,\nwith verified course links."),
    ]
    x = Inches(9.05)
    y = Inches(2.45)
    for number, name, body in labels:
        textbox(slide, x, y, Inches(0.6), Inches(0.3), number, size=11, bold=True, colour=ACCENT)
        textbox(slide, x + Inches(0.55), y - Inches(0.03), Inches(3.5), Inches(0.3), name, size=12, bold=True, colour=WHITE)
        textbox(slide, x + Inches(0.55), y + Inches(0.28), Inches(3.5), Inches(0.6), body, size=8.5, colour=CREAM, spacing=1.2)
        y += Inches(1.05)

    footer(slide, "Same page on phone, tablet and desktop", colour=RGBColor(0x9A, 0xB0, 0xAB))
    slide_number(slide, 4, 12, colour=RGBColor(0x9A, 0xB0, 0xAB))


def checkpoint_slide(deck, number, eyebrow_text, headline, bullets, image=None, image_side="right", note=None, page=0):
    slide = blank(deck, CREAM)
    eyebrow(slide, eyebrow_text)
    title(slide, headline, size=34, w=Inches(6.6) if image else Inches(11))

    textbox(slide, MARGIN, Inches(2.75), Inches(6.6) if image else Inches(11.4), Inches(3.4), bullets, size=13, colour=INK, spacing=1.35, space_after=10)

    if image is not None:
        shot = picture(slide, image, MARGIN, Inches(2.5), height=Inches(3.0))
        if image_side == "right":
            shot.left = int(SW - MARGIN - shot.width)

    if note:
        card(slide, MARGIN, Inches(6.05), Inches(11.6), Inches(0.62), fill=PANEL)
        textbox(slide, MARGIN + Inches(0.25), Inches(6.16), Inches(11.1), Inches(0.4), note, size=10, colour=MUTED, spacing=1.15)

    footer(slide, f"Checkpoint {number}")
    slide_number(slide, page, 12)


def slide_sdg(deck):
    slide = blank(deck, CREAM)
    eyebrow(slide, "SDG impact framework")
    title(slide, "Baseline, KPI, and a target we can be held to.")

    card(slide, MARGIN, Inches(2.85), Inches(5.5), Inches(3.3), fill=WHITE, line=RGBColor(0xD8, 0xD0, 0xC2))
    textbox(slide, MARGIN + Inches(0.3), Inches(3.0), Inches(5.0), Inches(0.3), "TARGETS", size=9.5, bold=True, colour=ACCENT)
    textbox(slide, MARGIN + Inches(0.3), Inches(3.35), Inches(5.0), Inches(2.6), [
        "4.4.1  Relevant skills for employment",
        "4.3.1  Access to lifelong learning",
        "8.5.2  Employment and decent work",
        "8.2.1  Productivity through technology",
    ], size=12.5, colour=INK, spacing=1.7)

    card(slide, MARGIN + Inches(6.0), Inches(2.85), Inches(5.6), Inches(3.3), fill=INK, line=None)
    textbox(slide, MARGIN + Inches(6.3), Inches(3.0), Inches(5.0), Inches(0.3), "MEASUREMENT", size=9.5, bold=True, colour=ACCENT)
    textbox(slide, MARGIN + Inches(6.3), Inches(3.35), Inches(5.0), Inches(2.6), [
        "Baseline — 56% use AI, 26% trained, 600k need reskilling.",
        "KPI — share of recommendations carrying a verifiable source and date; time to a ranked plan.",
        "Phase 2 target — 100% sourced, under five minutes, with a Malaysian trend source.",
    ], size=11.5, colour=CREAM, spacing=1.35, space_after=8)

    textbox(slide, MARGIN, Inches(6.35), Inches(11.4), Inches(0.4),
            "We report the KPI we can be measured on, not the one that flatters us.",
            size=11, colour=MUTED)
    footer(slide, "SDG 4 · 8")
    slide_number(slide, 10, 12)


def slide_guardrails(deck):
    slide = blank(deck, INK)
    eyebrow(slide, "Trust, by construction", colour=ACCENT, on_dark=True)
    textbox(slide, MARGIN, Inches(1.0), Inches(11), Inches(1.0), "What the AI may not do.", size=40, bold=True, colour=WHITE)

    rules = [
        ("Closed vocabulary", "Every role and module identifier is validated against our catalogue; anything unknown is discarded before it reaches the screen."),
        ("Visible disagreement", "The model's fit score is shown next to the deterministic estimate, so the two can be compared rather than blended."),
        ("No storage", "No account, no database, no CV. The profile lives in the browser tab and is gone when it closes."),
        ("Injection treated as data", "Free text is delimited, output is schema-validated, and the model never receives a tool that can write."),
    ]
    x = MARGIN
    for name, body in rules:
        card(slide, x, Inches(2.5), Inches(2.78), Inches(2.25), fill=RGBColor(0x2A, 0x47, 0x43), line=None)
        textbox(slide, x + Inches(0.24), Inches(2.66), Inches(2.3), Inches(0.8), name, size=13, bold=True, colour=WHITE, spacing=1.15)
        textbox(slide, x + Inches(0.24), Inches(3.15), Inches(2.3), Inches(1.4), body, size=9.5, colour=CREAM, spacing=1.3)
        x += Inches(2.94)

    textbox(
        slide, MARGIN, Inches(5.05), Inches(11.4), Inches(0.8),
        ["Each rule is a validation path in the repository — not a promise in a document.",
         "The model chooses and explains; it never writes the catalogue."],
        size=14, colour=CREAM, spacing=1.25, space_after=4,
    )

    footer(slide, "Enforced in code, not in a policy document", colour=RGBColor(0x9A, 0xB0, 0xAB))
    slide_number(slide, 9, 12, colour=RGBColor(0x9A, 0xB0, 0xAB))


def slide_feasibility(deck):
    slide = blank(deck, CREAM)
    eyebrow(slide, "Feasibility, and the risk we name")
    title(slide, "Hardest risk: the model inventing a job or a course.", size=30, w=Inches(11))

    card(slide, MARGIN, Inches(2.35), Inches(6.9), Inches(3.55), fill=WHITE, line=ACCENT, line_width=Pt(1.5))
    textbox(slide, MARGIN + Inches(0.3), Inches(2.5), Inches(6.3), Inches(0.3), "RISK AND FALLBACK", size=9.5, bold=True, colour=ACCENT)
    textbox(slide, MARGIN + Inches(0.3), Inches(2.85), Inches(6.3), Inches(2.9), [
        "A generated role, course or statistic that does not exist.",
        "·  Catalogue and library are closed; unknown IDs are dropped server-side.",
        "·  The exploratory tier must name an occupational reference or the suggestion is removed.",
        "·  Course steps resolve only to URLs we fetched and verified before shipping.",
        "Second risk: a global job feed is not Malaysian vacancy data — stated on screen, fixed in Phase 2.",
    ], size=11, colour=INK, spacing=1.3, space_after=7)

    card(slide, MARGIN + Inches(7.15), Inches(2.35), Inches(4.45), Inches(3.55), fill=PANEL)
    textbox(slide, MARGIN + Inches(7.45), Inches(2.5), Inches(3.9), Inches(0.3), "STACK", size=9.5, bold=True, colour=MUTED)
    textbox(slide, MARGIN + Inches(7.45), Inches(2.85), Inches(3.9), Inches(2.9), [
        "React 19 · Vite · Tailwind 4",
        "TanStack Query · Wouter",
        "Express 5 · Zod · OpenAPI + Orval",
        "DeepSeek (declared)",
        "O*NET 30.1 · Arbeitnow",
        "Replit hosting and deploy",
    ], size=10.5, colour=INK, spacing=1.45)

    textbox(slide, MARGIN, Inches(6.15), Inches(11.4), Inches(0.5),
            ["Live prototype: aura-workforce.replit.app      Repository: github.com/adamnaemman/sdc-hackathon"],
            size=12, colour=INK, spacing=1.3)
    footer(slide, "Every claim in this deck is reproducible from the repository")
    slide_number(slide, 11, 12)


def slide_next(deck):
    slide = blank(deck, INK)
    eyebrow(slide, "What comes next", colour=ACCENT, on_dark=True)
    textbox(slide, MARGIN, Inches(1.0), Inches(11), Inches(1.0), "Phase 2: local data, sharper matching, proof.", size=34, bold=True, colour=WHITE)

    items = [
        ("Malaysian demand data", "DOSM and local postings, so ranking reflects the country rather than a global feed."),
        ("Semantic skill matching", "Embeddings instead of lexical overlap — the weakest part of the current engine."),
        ("Counsellor view", "Cohort gaps and shared plans for TVET and university advisers."),
        ("Self-hosted model", "RunPod credit already allocated; the client is OpenAI-compatible."),
    ]
    y = Inches(2.55)
    for name, body in items:
        textbox(slide, MARGIN, y, Inches(4.4), Inches(0.3), name, size=13, bold=True, colour=ACCENT)
        textbox(slide, MARGIN + Inches(4.6), y - Inches(0.03), Inches(6.8), Inches(0.5), body, size=11, colour=CREAM, spacing=1.25)
        y += Inches(0.85)

    rule(slide, MARGIN, Inches(6.15), Inches(11.6), RGBColor(0x3A, 0x55, 0x51), Pt(1))
    textbox(slide, MARGIN, Inches(6.35), Inches(11.4), Inches(0.5),
            "overinfinity  ·  Ahmad Adam Hakimi bin Naeman  ·  IIUM  ·  SDC 2026, Domain 1",
            size=11.5, colour=CREAM)
    slide_number(slide, 12, 12, colour=RGBColor(0x9A, 0xB0, 0xAB))


def main() -> None:
    deck = new_deck()

    slide_title(deck)
    slide_problem(deck)
    slide_who(deck)
    slide_product(deck)

    checkpoint_slide(
        deck, "01", "Checkpoint 01 · Market signals",
        ["Evidence, with its source attached."],
        [
            "Three hundred recent public postings, refreshed on demand.",
            "The most requested skills plotted week by week — not a shortlist of our own roles.",
            "Source, fetch time and sample size printed on the chart.",
            "Six sourced labour-market signals from BLS and WEF, each with a source note.",
            "The screen says what it is not: a global feed, not Malaysian vacancy counts.",
        ],
        image=ASSETS / "device-tablet.png", note="Numbers that cannot be checked are not shown at all.", page=5,
    )

    checkpoint_slide(
        deck, "02", "Checkpoint 02 · Your profile",
        ["Name what you already bring."],
        [
            "Role, industry and years of experience, then one model call.",
            "The AI expands that into concrete, selectable skills and tools.",
            "Tools are pre-ticked because they are factual; judgement skills stay unticked.",
            "Custom skills survive, so a title we never modelled still counts.",
            "Weekly hours entered here become the schedule in checkpoint 04.",
        ],
        image=ASSETS / "device-phone.png", note="Suggestions are offered, never applied on the person's behalf.", page=6,
    )

    checkpoint_slide(
        deck, "03", "Checkpoint 03 · Future roles",
        ["The roles the AI chose for you."],
        [
            "The model proposes occupations from the profile — including ones outside our catalogue.",
            "Each comes with its reasoning, the skills to build, a first step, and a reference you can check.",
            "No salary, growth figure or course link is shown for those occupations, because we could not source one.",
            "They carry an explicit badge: exploratory, no verified pathway.",
        ],
        image=ASSETS / "device-laptop.png",
        note="If the model cannot name a reference, the suggestion is discarded.", page=7,
    )

    checkpoint_slide(
        deck, "04", "Checkpoint 04 · Learning path",
        ["A plan built around the hours you actually have."],
        [
            "The model may only choose courses from a library we verified, link by link.",
            "Every step shows provider, hours and the reason it was ordered there.",
            "The plan is divided by the weekly hours the person said they have.",
            "If nothing fits, it returns study topics with real search links — never an invented course.",
            "Export to PDF, with a QR code on every step for the classroom or a printed handout.",
        ],
        note="Verified means fetched and checked before shipping.", page=8,
    )

    slide_guardrails(deck)
    slide_sdg(deck)
    slide_feasibility(deck)
    slide_next(deck)

    os.makedirs(OUT.parent, exist_ok=True)
    deck.save(OUT)
    print(f"saved {OUT} · {len(deck.slides)} slides · {os.path.getsize(OUT) / 1024:.0f} KB")


if __name__ == "__main__":
    main()
