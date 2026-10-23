"""
Build the 9-slide pitch deck for AURA-Workforce (SDC Hackathon 2026, Domain 1).

Output: docs/AURA-Workforce-Deck.pptx

Design: same palette as the app (ink #1F3A37, cream #F6F2EA, accent #D98E77),
16:9, no stock photos — judges read text, not decoration.
"""

import os

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.util import Inches, Pt

OUT = r"D:\sdc-hackathon\docs\AURA-Workforce-Deck.pptx"

INK = RGBColor(0x1F, 0x3A, 0x37)
CREAM = RGBColor(0xF6, 0xF2, 0xEA)
ACCENT = RGBColor(0xD9, 0x8E, 0x77)
MUTED = RGBColor(0x5B, 0x6B, 0x67)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

FONT = "Arial"
SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)


def new_deck() -> Presentation:
    deck = Presentation()
    deck.slide_width = SLIDE_W
    deck.slide_height = SLIDE_H
    return deck


def blank(deck):
    return deck.slides.add_slide(deck.slide_layouts[6])


def background(slide, colour=CREAM) -> None:
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = colour


def text(slide, left, top, width, height, content, size=18, bold=False,
         colour=INK, spacing=1.15, font=FONT):
    box = slide.shapes.add_textbox(left, top, width, height)
    frame = box.text_frame
    frame.word_wrap = True

    lines = content if isinstance(content, list) else [content]
    for index, line in enumerate(lines):
        paragraph = frame.paragraphs[0] if index == 0 else frame.add_paragraph()
        paragraph.text = line
        paragraph.space_after = Pt(6)
        paragraph.line_spacing = spacing
        for run in paragraph.runs:
            run.font.size = Pt(size)
            run.font.bold = bold
            run.font.color.rgb = colour
            run.font.name = font
    return box


def rule(slide, top, colour=ACCENT, width=Inches(1.1)):
    bar = slide.shapes.add_shape(1, Inches(0.9), top, width, Inches(0.05))
    bar.fill.solid()
    bar.fill.fore_color.rgb = colour
    bar.line.fill.background()
    return bar


def eyebrow(slide, label):
    text(slide, Inches(0.9), Inches(0.55), Inches(9), Inches(0.3), label.upper(),
         size=11, bold=True, colour=MUTED)
    rule(slide, Inches(0.9))


def headline(slide, title, size=34):
    text(slide, Inches(0.9), Inches(1.05), Inches(11.5), Inches(1.6), title, size=size, bold=True)


def bullets(slide, items, top=Inches(2.9), size=16):
    text(slide, Inches(0.9), top, Inches(11.5), Inches(4.2), items, size=size, spacing=1.3)


def footer(slide, label):
    text(slide, Inches(0.9), Inches(6.85), Inches(11.5), Inches(0.3), label,
         size=9, colour=MUTED)


# ---------------------------------------------------------------------------
# Slides
# ---------------------------------------------------------------------------

def slide_title(deck):
    slide = blank(deck)
    background(slide, INK)
    text(slide, Inches(0.9), Inches(2.1), Inches(11), Inches(0.4),
         "SDC HACKATHON 2026  ·  DOMAIN 1  ·  THE AIVERSECITY FUTURE-READY WORKFORCE DOMAIN",
         size=11, bold=True, colour=ACCENT)
    text(slide, Inches(0.9), Inches(2.6), Inches(11), Inches(1.4),
         "AURA-Workforce", size=54, bold=True, colour=WHITE)
    text(slide, Inches(0.9), Inches(3.9), Inches(10.5), Inches(1.2),
         "A privacy-first career-transition planner: from “who I am today”\n"
         "to a sourced, sequenced plan for the AI era.",
         size=20, colour=CREAM, spacing=1.3)
    text(slide, Inches(0.9), Inches(5.6), Inches(11), Inches(0.9),
         ["overinfinity  ·  Ahmad Adam Hakimi bin Naeman  ·  IIUM",
          "Live prototype: aura-workforce.replit.app"],
         size=13, colour=ACCENT, spacing=1.3)


def slide_problem(deck):
    slide = blank(deck)
    background(slide)
    eyebrow(slide, "The problem")
    headline(slide, "Workers are told to reskill, but not what to do on Monday.")
    bullets(slide, [
        "56% of Malaysian professionals already use AI at work — only 26% have had formal training.  (Hays Asia Salary Guide 2025)",
        "MOSTI projects 600,000+ workers needing reskilling within 3–5 years.",
        "Career advice is generic, static and unsourced: no way to see which roles are rising,",
        "which skills transfer, how long a pathway takes — or where any claim came from.",
        "The cost is paid twice: people buy courses that lead nowhere; employers retrain for roles that are closing.",
    ], top=Inches(3.0), size=17)
    footer(slide, "Domain 1 brief · problem statement")


def slide_who(deck):
    slide = blank(deck)
    background(slide)
    eyebrow(slide, "Who it is for")
    headline(slide, "Four people, one moment of need.")
    bullets(slide, [
        "The displaced worker — a procurement assistant whose routine work is being automated.",
        "The switcher — a nurse or designer deciding where their existing skills can carry them.",
        "The HR / L&D manager planning next year’s reskilling budget.",
        "The TVET or university career officer advising students from a printed list.",
        "",
        "The moment: the week a person learns their role is changing. They do not want a prediction;",
        "they want to know what to do next and whether to trust it.",
    ], top=Inches(2.9), size=17)


def slide_what(deck):
    slide = blank(deck)
    background(slide)
    eyebrow(slide, "What it does")
    headline(slide, "Profile in. Ranked roles, gaps and a pathway out.")
    bullets(slide, [
        "1  Intake — role, industry, experience. The model expands them into concrete, selectable skills.",
        "2  Live trend layer — 300 recent public job postings, counted against each role’s skills,",
        "     stamped with source, fetch time and sample size.",
        "3  Matching — deterministic, inspectable score: skills, transferable skills, sector, experience, demand.",
        "4  Pathway — ordered steps, prerequisites respected, hours fitted to the learner’s week.",
        "5  SDG mapping — every role and step tagged to a sub-target.",
        "6  Uncertainty — moderate (4-year) and aggressive (18-month) scenarios, not one forecast.",
    ], top=Inches(2.85), size=16)


def slide_ai(deck):
    slide = blank(deck)
    background(slide)
    eyebrow(slide, "The AI, and what it may not do")
    headline(slide, "Two model calls. A closed world. No invented facts.")
    bullets(slide, [
        "The model sees this person’s profile AND our catalogue — five roles, twenty learning steps.",
        "It chooses, explains and sequences. Every role and module ID it returns is validated server-side;",
        "unknown IDs are discarded. It cannot add a course, a provider or a statistic.",
        "Its fit score is displayed next to the deterministic estimate — disagreement is visible, not hidden.",
        "Beyond the catalogue, an exploratory tier proposes real occupations with a checkable reference",
        "and an explicit “no verified pathway” badge.",
        "Prompt injection is treated as data: delimited input, schema-validated output, vocabulary enforced.",
    ], top=Inches(2.85), size=16)


def slide_trend(deck):
    slide = blank(deck)
    background(slide)
    eyebrow(slide, "The signal layer")
    headline(slide, "Updatable, dated, and honest about what it is.")
    bullets(slide, [
        "Source: Arbeitnow public job board — 300 postings from the last 30 days, refreshed on demand.",
        "Method: tokenised skill matching over full descriptions (naive substring matching inflated",
        "supply-chain demand from 21% to 45% — we found that by measuring, and fixed it).",
        "",
        "Measured today:  AI Operations 54%   ·   Operations Research 35%   ·   Supply Chain 21%",
        "",
        "Every figure carries its source URL, fetch timestamp, window and sample size.",
        "The interface states that this measures the direction of demand in a global board —",
        "not Malaysian vacancy counts.",
    ], top=Inches(2.8), size=16)


def slide_sdg(deck):
    slide = blank(deck)
    background(slide)
    eyebrow(slide, "SDG impact framework")
    headline(slide, "Baseline, KPI, and a target we can be held to.")
    bullets(slide, [
        "Targets: 4.4.1 relevant skills · 4.3.1 lifelong learning access · 8.5.2 employment · 8.2.1 productivity.",
        "",
        "Baseline: 56% of Malaysian professionals use AI; 26% trained. 600,000+ need reskilling.",
        "Prototype today: 6 curated signals but only 1 updatable trend source; recommendations sourced ~60%.",
        "",
        "KPI: % of role, skill and course recommendations carrying a verifiable source and date;",
        "median time from profile start to a ranked pathway; number of independent trend sources.",
        "",
        "Phase 2 target: 100% sourced and dated · median time-to-plan under 5 minutes ·",
        "two independent trend sources, one Malaysian.",
    ], top=Inches(2.8), size=15)


def slide_feasibility(deck):
    slide = blank(deck)
    background(slide)
    eyebrow(slide, "Feasibility, and the risk we name")
    headline(slide, "Hardest risk: the model inventing a job or a course.")
    bullets(slide, [
        "Mitigation: closed catalogue, server-side ID validation, bounded fit, visible disagreement,",
        "and an exploratory tier that cites an occupational reference or drops the suggestion.",
        "Second risk: a global tech-oriented feed ≠ Malaysian vacancies — stated in the UI, Phase 2 fix.",
        "Third: five roles cannot cover every occupation — the exploratory tier and 916-occupation search",
        "make that limit visible instead of pretending otherwise.",
        "",
        "Stack: React 19 · Vite · Tailwind · Express 5 · Zod · OpenAPI + Orval · DeepSeek · Replit · O*NET",
        "Live: aura-workforce.replit.app      Repo: github.com/adamnaemman/sdc-hackathon",
    ], top=Inches(2.85), size=15)


def slide_next(deck):
    slide = blank(deck)
    background(slide)
    eyebrow(slide, "What comes next")
    headline(slide, "Phase 2: breadth, Malayan context, and proof.")
    bullets(slide, [
        "A Malaysian trend source (DOSM / local job postings) so the ranking reflects local demand.",
        "Semantic skill matching with embeddings — lexical matching is the weakest part of the engine.",
        "A counsellor view: cohort-level gaps, and plans that can be reviewed together.",
        "Saved plans with explicit consent, one-click deletion, and no CV storage.",
        "Self-hosted model on RunPod GPU, using the sponsor credit; the client is already OpenAI-compatible.",
        "",
        "Team overinfinity · Ahmad Adam Hakimi bin Naeman · IIUM · SDC 2026 Domain 1",
    ], top=Inches(2.85), size=15)


def main() -> None:
    deck = new_deck()
    for builder in (
        slide_title, slide_problem, slide_who, slide_what, slide_ai,
        slide_trend, slide_sdg, slide_feasibility, slide_next,
    ):
        builder(deck)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    deck.save(OUT)
    print("saved:", OUT, os.path.getsize(OUT), "bytes,", len(deck.slides), "slides")


if __name__ == "__main__":
    main()
