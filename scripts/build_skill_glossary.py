"""
Generate the A-Z skill glossary PDF that ships with the web app.

Output: artifacts/aura-workforce/public/skill-glossary.pdf
Served by Vite at /skill-glossary.pdf, so the app can link it directly.

The list is the single vocabulary the profile form and the AI planner share.
Keeping it alphabetical (rather than grouped) is the point: it is a lookup
document, not a form.
"""

import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

OUT_PATH = os.path.join(
    "D:/sdc-hackathon/artifacts/aura-workforce/public/skill-glossary.pdf"
)

TOOLS = [
    "Adobe Creative Suite",
    "Canva",
    "CRM systems",
    "Figma",
    "Google Analytics",
    "Microsoft Excel",
    "Power BI",
    "Python",
    "SAP / ERP systems",
    "SQL",
]

PRACTICAL = [
    "Cash handling",
    "Clinical documentation",
    "Content writing",
    "Customer support",
    "Data analysis",
    "Data entry",
    "Documentation",
    "Inventory auditing",
    "Inventory management",
    "Logistics coordination",
    "Manual PO processing",
    "Patient coordination",
    "Process mapping",
    "Procurement",
    "Project coordination",
    "Quality assurance",
    "Recruitment support",
    "Report writing",
    "Shift scheduling",
    "Supplier coordination",
    "Teaching & facilitation",
    "Vendor communication",
    "Visual design",
]

COMPETENCIES = [
    "Adaptability",
    "Attention to detail",
    "Coaching",
    "Collaboration",
    "Communication",
    "Decision making",
    "Empathy",
    "Leadership",
    "Organization",
    "Problem solving",
    "Reliability",
    "Time management",
]

# Short, plain-language definitions. A list without meaning is not a glossary.
DEFINITIONS = {
    "Adobe Creative Suite": "Professional design and editing tools (Photoshop, Illustrator, InDesign).",
    "Canva": "Template-based design tool for quick visual content.",
    "CRM systems": "Customer relationship software that records contacts, deals and follow-ups.",
    "Figma": "Collaborative interface and product design tool.",
    "Google Analytics": "Web and campaign analytics for traffic and behaviour.",
    "Microsoft Excel": "Spreadsheet work: formulas, pivots, cleaning and reporting.",
    "Power BI": "Microsoft's dashboarding and data-preparation tool.",
    "Python": "Programming language used for data work and automation.",
    "SAP / ERP systems": "Enterprise resource planning software for purchasing, stock and finance.",
    "SQL": "Query language for reading and summarising structured data.",
    "Cash handling": "Counting, reconciling and recording money safely.",
    "Clinical documentation": "Recording patient care accurately and defensibly.",
    "Content writing": "Writing copy or articles for a defined audience.",
    "Customer support": "Resolving customer questions and complaints directly.",
    "Data analysis": "Turning raw records into findings someone can act on.",
    "Data entry": "Accurate, fast transfer of information into systems.",
    "Documentation": "Writing procedures and records others can follow.",
    "Inventory auditing": "Checking stock records against physical reality.",
    "Inventory management": "Planning and controlling stock levels.",
    "Logistics coordination": "Moving goods and people on time.",
    "Manual PO processing": "Raising and tracking purchase orders by hand.",
    "Patient coordination": "Scheduling and supporting a patient's care journey.",
    "Process mapping": "Documenting how a process actually runs, handoff by handoff.",
    "Procurement": "Buying goods and services under policy and budget.",
    "Project coordination": "Keeping tasks, people and dates aligned.",
    "Quality assurance": "Checking work against a standard before it ships.",
    "Recruitment support": "Screening, scheduling and onboarding candidates.",
    "Report writing": "Turning results into a written summary for decision-makers.",
    "Shift scheduling": "Building rosters that cover demand and respect constraints.",
    "Supplier coordination": "Managing day-to-day supplier relationships and deliveries.",
    "Teaching & facilitation": "Helping others learn or reach a decision together.",
    "Vendor communication": "Negotiating and corresponding with suppliers.",
    "Visual design": "Composing visuals that communicate clearly.",
    "Adaptability": "Adjusting to new tools, rules or priorities.",
    "Attention to detail": "Catching errors others miss.",
    "Coaching": "Helping someone improve without doing it for them.",
    "Collaboration": "Working across teams toward a shared result.",
    "Communication": "Explaining clearly in writing and in person.",
    "Decision making": "Choosing between options with incomplete information.",
    "Empathy": "Reading how someone feels and responding well.",
    "Leadership": "Setting direction others choose to follow.",
    "Organization": "Keeping many moving pieces in order.",
    "Problem solving": "Finding the cause and a workable fix.",
    "Reliability": "Doing what you said, when you said it.",
    "Time management": "Protecting the important work from the urgent noise.",
}

# One alphabetical list, with a type column.
ROWS = (
    [(name, "Tool", DEFINITIONS[name]) for name in TOOLS]
    + [(name, "Practical", DEFINITIONS[name]) for name in PRACTICAL]
    + [(name, "Competency", DEFINITIONS[name]) for name in COMPETENCIES]
)
ROWS.sort(key=lambda row: row[0].lower())


def build() -> None:
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "AuraTitle", parent=styles["Title"], fontName="Helvetica-Bold",
        fontSize=20, leading=24, alignment=TA_LEFT, spaceAfter=2,
        textColor=colors.HexColor("#1f3a37"),
    )
    subtitle = ParagraphStyle(
        "AuraSub", parent=styles["Normal"], fontName="Helvetica",
        fontSize=10, leading=14, textColor=colors.HexColor("#5b6b67"), spaceAfter=10,
    )
    body = ParagraphStyle(
        "AuraBody", parent=styles["Normal"], fontName="Helvetica",
        fontSize=8.5, leading=11, textColor=colors.HexColor("#1f3a37"),
    )
    note = ParagraphStyle(
        "AuraNote", parent=styles["Normal"], fontName="Helvetica",
        fontSize=8, leading=11, textColor=colors.HexColor("#5b6b67"), spaceBefore=10,
    )

    document = SimpleDocTemplate(
        OUT_PATH, pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=16 * mm,
        title="AURA-Workforce Skill & Competency Glossary",
        author="overinfinity",
    )

    story = [
        Paragraph("AURA-Workforce", title),
        Paragraph(
            "Skill and competency glossary, A-Z. This is the exact vocabulary used by the profile form "
            "and by the AI planner: the model may only suggest items from this list.",
            subtitle,
        ),
        Paragraph(
            f"{len(TOOLS)} tools and software · {len(PRACTICAL)} practical skills · "
            f"{len(COMPETENCIES)} competencies · {len(ROWS)} entries",
            subtitle,
        ),
    ]

    table_data = [["#", "Skill", "Type", "What it means in practice"]]
    for index, (name, kind, definition) in enumerate(ROWS, start=1):
        table_data.append([str(index), name, kind, Paragraph(definition, body)])

    table = Table(table_data, colWidths=[9 * mm, 42 * mm, 20 * mm, 100 * mm], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f3a37")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 8.5),
                ("FONTNAME", (0, 1), (2, -1), "Helvetica"),
                ("FONTSIZE", (0, 1), (-1, -1), 8.5),
                ("TEXTCOLOR", (0, 1), (-1, -1), colors.HexColor("#1f3a37")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (0, 0), (0, -1), "RIGHT"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f6f2ea")]),
                ("LINEBELOW", (0, 0), (-1, 0), 0.6, colors.HexColor("#1f3a37")),
            ]
        )
    )

    story.append(table)
    story.append(
        Paragraph(
            "Source and licensing: the categories follow the O*NET Content Model (Transferable Skills and "
            "Software Skills, CC BY 4.0) and the ESCO skills pillar (13,939 skills, European Commission, "
            "free reuse with attribution). The wording of each definition is our own, written for this "
            "prototype. Items are intentionally limited to what the prototype can act on; ESCO is the "
            "reference for the full taxonomy.",
            note,
        )
    )

    document.build(story)
    print("saved:", OUT_PATH, os.path.getsize(OUT_PATH), "bytes,", len(ROWS), "entries")


if __name__ == "__main__":
    build()
