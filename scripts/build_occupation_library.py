"""
Build the wider role library from the O*NET database.

Input:  the extracted O*NET 30.1 text database (Occupation Data + Technology Skills)
Output: artifacts/api-server/src/data/occupations.json

Shape: [{ "code": "11-1011.00", "title": "...", "description": "...", "tools": [...] }]

Only public O*NET data is used (CC BY 4.0). Titles and descriptions are copied
verbatim; nothing is invented. Tools are the software examples O*NET lists for
that occupation, capped so the payload stays small.
"""

import collections
import json
import os

DIR = os.path.join(os.environ["TEMP"], "onet30", "db_30_1_text")
OUT = r"D:\sdc-hackathon\artifacts\api-server\src\data\occupations.json"

MAX_TOOLS = 10
MAX_DESCRIPTION = 260


def read_rows(name):
    path = os.path.join(DIR, name)
    with open(path, encoding="utf-8", errors="replace") as handle:
        header = handle.readline().rstrip("\n").split("\t")
        for line in handle:
            parts = line.rstrip("\n").split("\t")
            if len(parts) >= len(header):
                yield dict(zip(header, parts))


def main() -> None:
    tools_by_code = collections.defaultdict(list)

    for row in read_rows("Technology Skills.txt"):
        code = row.get("O*NET-SOC Code", "").strip()
        example = (row.get("Example") or "").strip()
        if not code or not example:
            continue
        if example not in tools_by_code[code]:
            tools_by_code[code].append(example)

    occupations = []
    for row in read_rows("Occupation Data.txt"):
        code = row.get("O*NET-SOC Code", "").strip()
        title = (row.get("Title") or "").strip()
        description = (row.get("Description") or "").strip()
        if not code or not title or len(description) < 40:
            continue

        occupations.append(
            {
                "code": code,
                "title": title,
                "description": description[:MAX_DESCRIPTION],
                "tools": tools_by_code.get(code, [])[:MAX_TOOLS],
            }
        )

    # Keep only occupations that have at least a couple of technologies: without
    # them, matching against a skills profile would be pure keyword luck.
    occupations = [entry for entry in occupations if len(entry["tools"]) >= 2]
    occupations.sort(key=lambda entry: entry["title"].lower())

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as handle:
        json.dump(occupations, handle, ensure_ascii=False, separators=(",", ":"))

    size = os.path.getsize(OUT)
    print(f"saved: {OUT}")
    print(f"occupations: {len(occupations)}  size: {size/1024:.0f} KB")
    print("sample:", json.dumps(occupations[0], ensure_ascii=False)[:240])


if __name__ == "__main__":
    main()
