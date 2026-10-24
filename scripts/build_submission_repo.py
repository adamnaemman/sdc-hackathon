"""
Build the submission repository layout the hackathon asks for:

    src/        all product code (server, client, shared packages)
    submission/ the artefacts a judge opens first
    docs/       the written submissions
    tests/      a runnable smoke test
    README.md, LICENSE, .env.example, .gitignore, requirements.txt

The code is moved under src/ and every path that pointed at the old
artifacts/… and lib/… roots is rewritten here. The working repository is not
touched, so the deployed app keeps running.

Output: D:\\sdc-hackathon\\repo
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

ROOT = Path(r"D:\sdc-hackathon")
OUT = ROOT / "repo"

# (source, destination relative to repo root)
TREES = [
    ("artifacts/api-server", "src/artifacts/api-server"),
    ("artifacts/aura-workforce", "src/artifacts/aura-workforce"),
    ("lib/api-zod", "src/lib/api-zod"),
    ("lib/api-client-react", "src/lib/api-client-react"),
    ("lib/api-spec", "src/lib/api-spec"),
    ("lib/db", "src/lib/db"),
]

SKIP = {"node_modules", "dist", ".git", "data"}

FILES = [
    ("package.json", "package.json"),
    ("pnpm-workspace.yaml", "pnpm-workspace.yaml"),
    ("tsconfig.base.json", "tsconfig.base.json"),
    ("tsconfig.json", "tsconfig.json"),
    (".npmrc", ".npmrc"),
    (".replit", ".replit"),
]

DOCS = [
    ("docs/SDC2026_overinfinity_Preliminary.pdf", "docs/SDC2026_overinfinity_Preliminary.pdf"),
    ("docs/SDC2026_overinfinity_TechDeclaration.pdf", "docs/SDC2026_overinfinity_TechDeclaration.pdf"),
    ("docs/AURA-Workforce-Deck.pdf", "docs/AURA-Workforce-Deck.pdf"),
    ("docs/AURA-Workforce-Deck.pptx", "docs/AURA-Workforce-Deck.pptx"),
]

SUBMISSION = [
    ("docs/AURA-Workforce-Deck.pdf", "submission/AURA-Workforce-Deck.pdf"),
    ("docs/AURA-Workforce-Deck.pptx", "submission/AURA-Workforce-Deck.pptx"),
    ("docs/AURA-Workforce-Source.zip", "submission/source-code.zip"),
]


def copy_tree(source: Path, target: Path) -> int:
    count = 0
    for path in sorted(source.rglob("*")):
        if path.is_dir() or any(part in SKIP for part in path.parts):
            continue
        destination = target / path.relative_to(source)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, destination)
        count += 1
    return count


def rewrite(path: Path, replacements: list[tuple[str, str]]) -> None:
    text = path.read_text(encoding="utf-8")
    for old, new in replacements:
        text = text.replace(old, new)
    path.write_text(text, encoding="utf-8", newline="\n")


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    copied = 0

    for source, destination in TREES:
        copied += copy_tree(ROOT / source, OUT / destination)

    for source, destination in FILES:
        target = OUT / destination
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / source, target)
        copied += 1

    for source, destination in DOCS + SUBMISSION:
        origin = ROOT / source
        if not origin.exists():
            print(f"  skip (missing): {source}")
            continue
        target = OUT / destination
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(origin, target)
        copied += 1

    # ---- path rewrites -----------------------------------------------------
    rewrite(OUT / "pnpm-workspace.yaml", [
        ("packages:\n  - artifacts/*\n  - lib/*\n  - lib/integrations/*\n  - scripts",
         "packages:\n  - src/artifacts/*\n  - src/lib/*"),
    ])

    rewrite(OUT / "tsconfig.json", [
        ('"path": "./lib/db"', '"path": "./src/lib/db"'),
        ('"path": "./lib/api-client-react"', '"path": "./src/lib/api-client-react"'),
        ('"path": "./lib/api-zod"', '"path": "./src/lib/api-zod"'),
    ])

    manifest = json.loads((OUT / "package.json").read_text(encoding="utf-8"))
    manifest["license"] = "Apache-2.0"
    manifest["scripts"]["typecheck"] = (
        'pnpm run typecheck:libs && pnpm -r --filter "./src/artifacts/**" --if-present run typecheck'
    )
    manifest["scripts"]["dev"] = "pnpm --filter @workspace/api-server run dev"
    (OUT / "package.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    for artifact in ("api-server", "aura-workforce"):
        toml = OUT / "src" / "artifacts" / artifact / ".replit-artifact" / "artifact.toml"
        if toml.exists():
            rewrite(toml, [("artifacts/", "src/artifacts/")])

    replit = OUT / ".replit"
    if replit.exists():
        text = replit.read_text(encoding="utf-8")
        text = text.split("[postMerge]")[0].rstrip() + "\n"
        replit.write_text(text, encoding="utf-8", newline="\n")

    print(f"copied {copied} files into {OUT}")


if __name__ == "__main__":
    main()
