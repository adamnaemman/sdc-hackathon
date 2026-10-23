"""
Fill the official SDC 2026 Submission Template for team overinfinity.

Source template is copied, never edited in place. Every answer is written into
the template's own tables/paragraphs so the original design is preserved.

Run:
  python build_preliminary_prd.py
"""

import os
import re
import shutil

from docx import Document
from docx.oxml import OxmlElement
from docx.text.paragraph import Paragraph

TEMPLATE = r"C:\Users\AHMAD ADAM HAKIMI\Downloads\1. SDC Hackathon_ Submission Template.docx"
OUTDIR = r"D:\sdc-hackathon\docs"
OUTFILE = os.path.join(OUTDIR, "SDC2026_overinfinity_Preliminary.docx")

# ---------------------------------------------------------------------------
# Content
# ---------------------------------------------------------------------------

TEAM = {
    "Team Name": "overinfinity",
    "Selected Domain": "Domain 1 - The Aiversecity Future-Ready Workforce Domain",
    "Selected SDG Track (1-17)": "4.4 (primary), 4.3, 8.5, 8.2",
    "Project / Solution Name": "AURA-Workforce",
    "Name (Leader)": "Ahmad Adam Hakimi bin Naeman",
    "Email & Phone (Leader)": "0damkim254@gmail.com / +60 18-344 5135",
    "University Affiliation(s)": "International Islamic University Malaysia (IIUM)",
    "Number of Team Members": "3",
}

PROBLEM = (
    "Malaysia's workforce is being reshaped by AI faster than its training system can respond. "
    "56% of Malaysian professionals already use AI tools at work, yet only 26% have received formal "
    "training (Hays Asia Salary Guide 2025). The Ministry of Science, Technology and Innovation "
    "estimates that more than 600,000 workers will need reskilling within three to five years.\n"
    "The people affected are specific: a procurement assistant whose routine processing is being "
    "automated, a fresh graduate choosing a first role, an HR manager planning next year's training "
    "budget, a TVET career officer advising students from a printed list of jobs.\n"
    "What they lack is not information but trustworthy direction. Career advice today is generic, "
    "static and rarely sourced. A worker cannot see which roles are rising or declining, does not know "
    "which existing skills transfer, cannot judge how long a pathway takes against the hours they "
    "actually have, and has no way to check where a claim came from. Counsellors work from frameworks "
    "that are out of date by the time they are published.\n"
    "The cost is paid twice: individuals buy courses that do not lead to work, and employers retrain "
    "people for roles that are disappearing. Left unaddressed, the AI transition widens the gap between "
    "those who can afford continuous reskilling and those who cannot.\n"
    "This is a skills-transition problem before it is a technology problem, which is why it maps "
    "directly to SDG 4.4, 4.3, 8.5 and 8.2."
)

SOLUTION_LINES = [
    "AURA-Workforce is a privacy-first career-transition planner. A worker enters their current role, "
    "skills, experience, available weekly hours and target sectors. The system returns ranked "
    "future-ready roles with an explainable match score, a skill-gap breakdown, a sequenced reskilling "
    "pathway with hours and cost notes, and an explicit mapping of every role and module to an SDG target.",
    "AI is applied at three points, each chosen because a model or a live feed beats a static rule:",
    "1. Skill normalisation. Form and free-text input are mapped onto a canonical skill vocabulary, so "
    "'chasing POs in Excel' is recognised as procurement plus spreadsheet analysis instead of being "
    "missed as unknown text.",
    "2. Live trend layer. Public job postings are fetched from an open API, counted against each role's "
    "required skills, and converted into a dated demand index. Every figure carries its source, the "
    "window it covers and the sample size, and the interface states when the data was last refreshed.",
    "3. Scenario modelling. Two disruption scenarios (moderate: four-year runway; aggressive: "
    "eighteen-month runway) change planning urgency instead of pretending to predict the future.",
    "Deliberately, the ranking itself is deterministic and inspectable: weights, matched skills and gaps "
    "are visible, so a counsellor can challenge any recommendation. The model never invents a role, a "
    "course, a provider or a statistic; every course link resolves to a real provider page.",
    "Technical skills applied: language-model API calls for text understanding, React and Vite deployed "
    "on Replit, and a Postgres/Drizzle data layer for saved plans in Phase 2.",
]

STACK_LINES = [
    "Frontend: React 19, Vite 7, Tailwind CSS 4, TanStack Query, Wouter routing, TypeScript 5.9.",
    "Backend: Node.js 24, Express 5, Zod validation for every response.",
    "Contract: OpenAPI 3.1 specification with Orval code generation for typed client hooks and Zod schemas.",
    "Data: curated public snapshot (U.S. BLS Occupational Outlook Handbook, WEF Future of Jobs 2025) plus a "
    "live public job-posting feed (Arbeitnow Job Board API, no key required). Postgres + Drizzle reserved "
    "for saved plans in Phase 2.",
    "Hosting: Replit (build and deployment), single public URL, secrets held in Replit Secrets.",
    "System diagram: browser (React SPA) -> /api (Express) -> [curated catalogue | live trend layer] "
    "-> deterministic scoring engine -> ranked roles, gaps and pathway. The trend layer is the only "
    "component that changes without a redeploy.",
    "Sponsor resources: Replit Core (one month per member) is used for hosting and deployment of the "
    "prototype. The RunPod credit (USD 20 per team) is reserved for Phase 2, where the same model endpoint "
    "will be self-hosted on GPU. The live trend feed is a free public API. All of the above is declared in "
    "the Technical & Tools Declaration.",
]

DESIGN_LINES = [
    "We started from people, not technology: the four personas in the domain brief (displaced worker, "
    "career switcher, HR/L&D manager, TVET counsellor) and one moment of need, the week a worker learns "
    "their role is changing. Conversations with peers and working adults showed the same pattern: people "
    "do not want a prediction, they want to know what to do next and whether to trust it.",
    "That produced three constraints that shaped every screen: show the source, show the uncertainty, and "
    "let the user change the assumption. The moderate/aggressive scenario control exists because a single "
    "forecast would be dishonest.",
    "We prototyped in the browser daily and deployed to Replit from the first day, so feedback was given "
    "on the real artifact rather than a mockup. All testing used synthetic sample profiles, in line with "
    "the rules on personal data. Weaknesses found in testing (opaque scores, unexplained gaps, small text "
    "in dense panels) were fixed in the same week.",
]

SDG_ROWS = [
    (
        "Target SDG Sub-Target(s)",
        "4.4.1 (youth and adults with relevant skills for employment), 4.3.1 (access to affordable "
        "lifelong learning), 8.5.2 (unemployment rate), 8.2.1 (productivity growth). Primary target: 4.4.",
    ),
    (
        "Current Problem Baseline",
        "56% of Malaysian professionals use AI at work but only 26% received formal training "
        "(Hays Asia Salary Guide 2025); MOSTI projects more than 600,000 workers needing reskilling "
        "within 3-5 years. In today's career-advice market, recommendations are unsourced and static: "
        "our own baseline reflects this, with 6 curated market signals but only 1 updatable trend source, "
        "and no dated evidence attached to individual role or course recommendations.",
    ),
    (
        "Core Measurable KPI",
        "1) Percentage of role, skill and course recommendations carrying a verifiable source and date. "
        "2) Median time from profile start to a ranked pathway. 3) Number of independent, updatable trend "
        "sources feeding role ranking.",
    ),
    (
        "Phase 2 Impact Target",
        "100% of recommendations sourced and dated (up from approximately 60% at prototype stage); "
        "median time-to-first-pathway under 5 minutes (currently about 20 minutes when done manually with "
        "a counsellor); at least 2 independent trend sources, including one Malaysian source, so the "
        "ranking visibly responds to regional demand.",
    ),
]

PREEXISTING_DESCRIPTION = (
    "Yes. Created by the team leader before the official hacking period: the React/Vite interface shell "
    "and design system (11 September 2026 onward), the original curated catalogue of 3 roles, 12 learning "
    "modules and 6 sourced market signals, and the OpenAPI contract scaffolding. All of it is declared "
    "here under the pre-existing work rule. Built entirely during the Phase 1 hacking period "
    "(19-25 October 2026): the live trend-signal layer, the AI profile extraction and the AI planner, the "
    "explainable score breakdown, the scenario model, two additional roles with their learning steps, and "
    "all Phase 1 documentation."
)

THIRD_PARTY = [
    ("React 19 / React DOM", "code", "MIT"),
    ("Vite 7", "code", "MIT"),
    ("Tailwind CSS 4", "code", "MIT"),
    ("Radix UI primitives", "code", "MIT"),
    ("TanStack Query 5", "code", "MIT"),
    ("Express 5", "code", "MIT"),
    ("Zod 3", "code", "MIT"),
    ("Orval (codegen)", "code", "MIT"),
    ("Lucide icons", "code", "ISC"),
    ("Arbeitnow Job Board API", "dataset", "Public API, free, no key; source cited in-app"),
    ("U.S. BLS Occupational Outlook Handbook", "dataset", "Public domain (U.S. Government work)"),
    ("WEF Future of Jobs Report 2025", "dataset", "Used for quoted figures with attribution"),
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def insert_paragraph_after(paragraph: Paragraph, text: str) -> Paragraph:
    """Insert a new paragraph directly after `paragraph`, keeping body styling."""
    new_p = OxmlElement("w:p")
    paragraph._p.addnext(new_p)
    created = Paragraph(new_p, paragraph._parent)
    if paragraph.style is not None:
        created.style = paragraph.style
    created.add_run(text)
    return created


def fill_cell(cell, lines) -> None:
    """Replace a table cell's content with one paragraph per line."""
    cell.text = ""
    first = cell.paragraphs[0]
    for index, line in enumerate(lines):
        target = first if index == 0 else cell.add_paragraph()
        target.add_run(line)


def check_first_box(paragraphs, index, choice):
    """Tick one of the two checkboxes on a 'Yes / No' paragraph."""
    target = paragraphs[index]
    target.text = "Yes" if choice else "No"
    # Rebuild with explicit boxes; keeps glyphs readable in Word.
    target.text = "\u2611 Yes   \u2610 No" if choice else "\u2610 Yes   \u2611 No"


def word_count(text: str) -> int:
    return len(re.findall(r"[A-Za-z0-9][A-Za-z0-9'\-]*", text))


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------


def main() -> None:
    os.makedirs(OUTDIR, exist_ok=True)

    # If the previous build is still open in Word the file is locked. Fall back
    # to a _v2 name instead of failing, and tell the user which file was written.
    outfile = OUTFILE
    try:
        shutil.copyfile(TEMPLATE, outfile)
    except PermissionError:
        outfile = OUTFILE.replace(".docx", "_v2.docx")
        shutil.copyfile(TEMPLATE, outfile)
        print("NOTE: %s is locked (open in Word?). Writing %s instead." % (OUTFILE, outfile))

    document = Document(outfile)
    tables = document.tables

    # --- Section 1: team fields (tables 1..8) ---
    for offset, (label, value) in enumerate(TEAM.items(), start=1):
        tables[offset].cell(0, 1).text = value

    # --- Section 2.1 / 2.2 ---
    fill_cell(tables[9].cell(0, 0), PROBLEM.split("\n"))
    fill_cell(tables[10].cell(0, 0), SOLUTION_LINES)

    # --- Section 3.1 / 3.2 ---
    fill_cell(tables[11].cell(0, 0), STACK_LINES)
    fill_cell(tables[12].cell(0, 0), DESIGN_LINES)

    # --- Section 4: SDG impact table (header in row 0) ---
    for row_index, (_, answer) in enumerate(SDG_ROWS, start=1):
        tables[13].cell(row_index, 1).text = answer

    # --- Section 5: checklist ---
    # The workshop-attendance box (table 14) is deliberately left UNTICKED:
    # the team did not attend the official GenAI / Database / Cloud workshops.
    for table_index in (15, 16, 17):
        tables[table_index].cell(0, 0).text = "\u2611"

    # --- Section 6: IP declarations ---
    body_paragraphs = document.paragraphs
    yes_no_indices = [
        i
        for i, p in enumerate(body_paragraphs)
        if p.text.strip().startswith("\u2610 Yes")
    ]
    # 0 -> 6.1 pre-existing (Yes), 1 -> 6.2 third-party (Yes), 2 -> 6.3 employment (No)
    if len(yes_no_indices) >= 3:
        check_first_box(body_paragraphs, yes_no_indices[0], True)
        check_first_box(body_paragraphs, yes_no_indices[1], True)
        check_first_box(body_paragraphs, yes_no_indices[2], False)

    # Insert the pre-existing description after its prompt paragraph.
    for paragraph in document.paragraphs:
        if paragraph.text.startswith("If yes, briefly describe what was pre-existing"):
            insert_paragraph_after(paragraph, PREEXISTING_DESCRIPTION)
            break

    # Third-party table: add one row per entry.
    for name, kind, licence in THIRD_PARTY:
        row = tables[18].add_row()
        row.cells[0].text = name
        row.cells[1].text = kind
        row.cells[2].text = licence

    # --- Section 7: declaration ---
    for paragraph in document.paragraphs:
        stripped = paragraph.text.strip()
        if stripped == "[Signature]":
            paragraph.text = "Ahmad Adam Hakimi bin Naeman (Team Leader, overinfinity)"
        elif stripped == "[Date]":
            paragraph.text = "23 October 2026"

    document.save(outfile)

    print("saved:", outfile)
    print("word counts -> problem:", word_count(PROBLEM), "(limit 250)")
    print("               solution:", word_count(" ".join(SOLUTION_LINES)), "(limit 300)")
    print("               design  :", word_count(" ".join(DESIGN_LINES)), "(limit 200)")


if __name__ == "__main__":
    main()
