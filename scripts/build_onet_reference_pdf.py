"""
Build the A-Z reference PDF of the 1,000 most widely used technologies in the
O*NET database.

Input:  %TEMP%/onet_top1000.tsv  (name, commodity title, occupation count)
Output: artifacts/aura-workforce/public/skill-taxonomy-onet.pdf

This is a *reference* appendix, deliberately separate from the 45-item glossary
that the app actually uses. It shows the prototype's vocabulary sits inside a
real, public taxonomy rather than being invented.
"""

import os

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

TSV = os.path.join(os.environ.get("TEMP", "."), "onet_top1000.tsv")
OUT = "D:/sdc-hackathon/artifacts/aura-workforce/public/skill-taxonomy-onet.pdf"

INK = colors.HexColor("#1f3a37")
MUTED = colors.HexColor("#5b6b67")
BAND = colors.HexColor("#f6f2ea")


def load_rows():
    rows = []
    with open(TSV, encoding="utf-8") as handle:
        for line in handle:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 3:
                continue
            rows.append((parts[0], parts[1], int(parts[2])))
    rows.sort(key=lambda row: row[0].lower())
    return rows


def build() -> None:
    rows = load_rows()

    styles = getSampleStyleSheet()
    title = ParagraphStyle("T", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=20,
                           leading=24, textColor=INK, alignment=0, spaceAfter=2)
    sub = ParagraphStyle("S", parent=styles["Normal"], fontName="Helvetica", fontSize=9.5,
                         leading=13, textColor=MUTED, spaceAfter=6)
    cell = ParagraphStyle("C", parent=styles["Normal"], fontName="Helvetica", fontSize=8,
                          leading=10, textColor=INK)

    # Two columns per page keeps it to about 20 pages instead of 40.
    half = (len(rows) + 1) // 2
    left, right = rows[:half], rows[half:]

    data = [["#", "Technology", "Category", "Occs", "#", "Technology", "Category", "Occs"]]
    for index in range(half):
        a = left[index]
        b = right[index] if index < len(right) else ("", "", "")
        data.append([
            str(index + 1), Paragraph(a[0], cell), Paragraph(a[1], cell), str(a[2]),
            str(half + index + 1) if b[0] else "",
            Paragraph(b[0], cell) if b[0] else "",
            Paragraph(b[1], cell) if b[1] else "",
            str(b[2]) if b[0] else "",
        ])

    table = Table(
        data,
        colWidths=[8 * mm, 47 * mm, 33 * mm, 8 * mm, 8 * mm, 47 * mm, 33 * mm, 8 * mm],
        repeatRows=1,
    )
    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), INK),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("TEXTCOLOR", (0, 1), (-1, -1), INK),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (0, 0), (0, -1), "RIGHT"),
            ("ALIGN", (3, 1), (3, -1), "RIGHT"),
            ("ALIGN", (4, 0), (4, -1), "RIGHT"),
            ("ALIGN", (7, 1), (7, -1), "RIGHT"),
            ("TOPPADDING", (0, 0), (-1, -1), 2.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BAND]),
            ("LINEBELOW", (0, 0), (-1, 0), 0.6, INK),
            ("LINEAFTER", (3, 1), (3, -1), 0.4, colors.HexColor("#d9d2c5")),
        ])
    )

    document = SimpleDocTemplate(
        OUT, pagesize=A4, leftMargin=12 * mm, rightMargin=12 * mm,
        topMargin=14 * mm, bottomMargin=14 * mm,
        title="O*NET technology reference, A-Z (top 1,000)",
        author="overinfinity",
    )

    story = [
        Paragraph("AURA-Workforce", title),
        Paragraph(
            "Reference appendix: the 1,000 technologies that appear across the most occupations in the "
            "O*NET database, A&ndash;Z. &lsquo;Occs&rsquo; is the number of distinct occupations in which "
            "the technology is listed.",
            sub,
        ),
        Paragraph(
            "This is <b>not</b> the app's selectable vocabulary. The profile form deliberately offers 45 "
            "curated skills and competencies, because a list of thousands cannot be acted on; this appendix "
            "shows where that shortlist sits inside a real public taxonomy.",
            sub,
        ),
        Spacer(1, 3 * mm),
        table,
        Spacer(1, 4 * mm),
        Paragraph(
            "Source: O*NET 30.1 Database, U.S. Department of Labor, Employment and Training Administration "
            "(onetcenter.org), used under CC BY 4.0. Retrieved 23 October 2026. 8,785 unique technologies "
            "appear in 32,773 occupation-technology rows; the 1,000 shown are those mapped to the most "
            "occupations. Category labels are O*NET commodity titles.",
            ParagraphStyle("N", parent=styles["Normal"], fontName="Helvetica", fontSize=7.5,
                           leading=10, textColor=MUTED),
        ),
    ]

    document.build(story)
    print("saved:", OUT, os.path.getsize(OUT), "bytes,", len(rows), "technologies")


if __name__ == "__main__":
    build()
