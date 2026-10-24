"""
Consolidate every source file into one self-contained `submission/` tree.

Why: the repository is a pnpm monorepo spread across artifacts/ and lib/, which is
correct for development but awkward to hand in or rebuild elsewhere. This script
copies the code (not node_modules, not the unused mockup sandbox) into a flat
layout under submission/src, keeps the config files needed to run it, and writes:

    source-bundle/README.md    structure, entry points, environment, how to run
    source-bundle/MANIFEST.txt every file with its line count and origin
    source-bundle/ALL_CODE.md  every file concatenated, for reading offline

The running app is untouched: this is a copy, so nothing here can break the demo.
"""

from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(r"D:\sdc-hackathon")
OUT = ROOT / "source-bundle"
SRC = OUT / "src"
CONFIG = OUT / "config"

# (source path, destination under src/)
TREES: list[tuple[str, str]] = [
    ("artifacts/api-server/src", "api"),
    ("artifacts/aura-workforce/src", "web"),
    ("lib/api-zod/src", "shared/api-zod"),
    ("lib/api-client-react/src", "shared/api-client-react"),
    ("lib/db/src", "shared/db"),
]

# (source path, destination under config/)
FILES: list[tuple[str, str]] = [
    ("package.json", "package.json"),
    ("pnpm-workspace.yaml", "pnpm-workspace.yaml"),
    ("tsconfig.base.json", "tsconfig.base.json"),
    ("tsconfig.json", "tsconfig.json"),
    (".npmrc", ".npmrc"),
    (".replit", ".replit"),
    ("replit.md", "replit.md"),
    ("lib/api-spec/openapi.yaml", "openapi.yaml"),
    ("artifacts/api-server/package.json", "api-server/package.json"),
    ("artifacts/api-server/tsconfig.json", "api-server/tsconfig.json"),
    ("artifacts/api-server/.replit-artifact/artifact.toml", "api-server/artifact.toml"),
    ("artifacts/aura-workforce/package.json", "aura-workforce/package.json"),
    ("artifacts/aura-workforce/tsconfig.json", "aura-workforce/tsconfig.json"),
    ("artifacts/aura-workforce/vite.config.ts", "aura-workforce/vite.config.ts"),
    ("artifacts/aura-workforce/components.json", "aura-workforce/components.json"),
    ("artifacts/aura-workforce/index.html", "aura-workforce/index.html"),
    ("artifacts/aura-workforce/.replit-artifact/artifact.toml", "aura-workforce/artifact.toml"),
    ("lib/api-zod/package.json", "lib/api-zod/package.json"),
    ("lib/api-zod/tsconfig.json", "lib/api-zod/tsconfig.json"),
    ("lib/api-client-react/package.json", "lib/api-client-react/package.json"),
    ("lib/api-client-react/tsconfig.json", "lib/api-client-react/tsconfig.json"),
    ("lib/api-spec/package.json", "lib/api-spec/package.json"),
    ("lib/db/package.json", "lib/db/package.json"),
    ("lib/db/tsconfig.json", "lib/db/tsconfig.json"),
]

SKIP_DIRS = {"node_modules", ".git", "dist", ".turbo"}


def copy_tree(source: Path, destination: Path) -> int:
    count = 0
    for path in sorted(source.rglob("*")):
        if path.is_dir() or any(part in SKIP_DIRS for part in path.parts):
            continue
        relative = path.relative_to(source)
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
        count += 1
    return count


def line_count(path: Path) -> int:
    try:
        return len(path.read_text(encoding="utf-8", errors="ignore").splitlines())
    except OSError:
        return 0


def fence_for(path: Path) -> str:
    return {
        ".ts": "ts", ".tsx": "tsx", ".js": "js", ".mjs": "js", ".json": "json",
        ".yaml": "yaml", ".yml": "yaml", ".css": "css", ".html": "html",
        ".md": "md", ".toml": "toml",
    }.get(path.suffix.lower(), "text")


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    SRC.mkdir(parents=True)
    CONFIG.mkdir(parents=True)

    copied = 0
    for source, destination in TREES:
        copied += copy_tree(ROOT / source, SRC / destination)

    for source, destination in FILES:
        origin = ROOT / source
        if not origin.exists():
            print(f"  missing: {source}")
            continue
        target = CONFIG / destination
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(origin, target)
        copied += 1

    # Manifest
    rows: list[tuple[str, int]] = []
    for path in sorted(OUT.rglob("*")):
        if path.is_file() and path.name not in {"MANIFEST.txt", "ALL_CODE.md", "README.md"}:
            rows.append((str(path.relative_to(OUT)), line_count(path)))

    manifest = ["AURA-Workforce — consolidated source", "=" * 60, ""]
    total_lines = 0
    for relative, lines in rows:
        total_lines += lines
        manifest.append(f"{relative:<70} {lines:>6} lines")
    manifest += ["", f"{len(rows)} files · {total_lines} lines"]
    (OUT / "MANIFEST.txt").write_text("\n".join(manifest), encoding="utf-8")

    # All code in one document
    chunks: list[str] = [
        "# AURA-Workforce — complete source",
        "",
        f"{len(rows)} files, {total_lines} lines, copied from the repository on build.",
        "",
    ]
    for relative, lines in rows:
        path = OUT / relative
        chunks.append(f"---")
        chunks.append("")
        chunks.append(f"## `{relative}`  ·  {lines} lines")
        chunks.append("")
        chunks.append(f"```{fence_for(path)}")
        chunks.append(path.read_text(encoding="utf-8", errors="ignore").rstrip())
        chunks.append("```")
        chunks.append("")
    (OUT / "ALL_CODE.md").write_text("\n".join(chunks), encoding="utf-8")

    print(f"copied {copied} files · manifest {len(rows)} entries · {total_lines} lines")


if __name__ == "__main__":
    main()
