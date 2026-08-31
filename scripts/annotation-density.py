#!/usr/bin/env python3
"""How many Mateu annotations a typical screen needs — and whether that number is going up.

The framework exists to make you declare information and have the UX inferred. Every annotation is
either information only the developer has (legitimate) or a decision Mateu could have taken by
looking at the model (debt) — see doc/.../authoring-rule.md. Individually, each new annotation is
always justifiable. Collectively they can drift the framework away from the reason it exists, and
nobody notices, because nobody is counting.

So: count. A number published every release disciplines more than a document of principles, and it
is cheap — the corpus already exists as the demo and e2e screens.

Usage:
  scripts/annotation-density.py            # report
  scripts/annotation-density.py --check    # also fail if the average exceeds the recorded ceiling
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
CEILING_FILE = ROOT / "scripts" / "annotation-density.json"

# The corpus: screens written the way a user writes them. Framework internals are excluded on
# purpose — they are not "a typical screen" and would drown the signal.
CORPUS = [
    ROOT / "e2e" / "sut",
    ROOT / "demo",
]

# A screen is a class carrying @UI or @Route.
SCREEN = re.compile(r"^\s*@(UI|Route)\b", re.M)
# Annotations that come from Mateu. Bean-validation (@NotNull…) and Lombok are NOT counted: they are
# not Mateu's declarative surface, and counting them would blame the framework for other people's.
ANNOTATION = re.compile(r"^\s*@([A-Z]\w+)", re.M)
NOT_MATEU = {
    "Override", "Autowired", "Inject", "Component", "Service", "Repository", "Bean",
    "Builder", "With", "Data", "Getter", "Setter", "Slf4j", "AllArgsConstructor",
    "NoArgsConstructor", "RequiredArgsConstructor", "Entity", "Id", "GeneratedValue",
    "Column", "Table", "ManyToOne", "OneToMany", "NotNull", "NotEmpty", "NotBlank",
    "Min", "Max", "Size", "Pattern", "Email", "Valid", "SuppressWarnings", "Test",
    "BeforeAll", "AfterAll", "Nested", "Deprecated", "FunctionalInterface", "SafeVarargs",
}


def screens() -> list[tuple[pathlib.Path, int]]:
    found = []
    for base in CORPUS:
        if not base.exists():
            continue
        for path in base.rglob("*.java"):
            if "/target/" in str(path) or "/generated-sources/" in str(path):
                continue
            text = path.read_text(errors="ignore")
            if not SCREEN.search(text):
                continue
            count = sum(1 for m in ANNOTATION.finditer(text) if m.group(1) not in NOT_MATEU)
            found.append((path.relative_to(ROOT), count))
    return sorted(found, key=lambda p: -p[1])


def main() -> int:
    found = screens()
    if not found:
        print("no screens found — is the corpus still where this script expects it?")
        return 1

    total = sum(c for _, c in found)
    average = total / len(found)

    print(f"screens: {len(found)}   annotations: {total}   average per screen: {average:.2f}")
    print("\nthe ten most annotated screens (where the surface is being spent):")
    for path, count in found[:10]:
        print(f"  {count:3d}  {path}")

    if "--check" not in sys.argv:
        print(f"\n(record this as the ceiling with: scripts/annotation-density.py --write)")
        if "--write" in sys.argv:
            CEILING_FILE.write_text(json.dumps({"ceiling": round(average, 2)}, indent=2) + "\n")
            print(f"wrote ceiling {average:.2f} to {CEILING_FILE.name}")
        return 0

    if not CEILING_FILE.exists():
        print("\nno ceiling recorded yet — run with --write")
        return 1
    ceiling = json.loads(CEILING_FILE.read_text())["ceiling"]
    if average > ceiling:
        print(
            f"\nFAIL  the average rose to {average:.2f}, above the recorded ceiling {ceiling}."
            "\n      Every annotation is justifiable on its own; the point of the number is that"
            "\n      the sum is not. Either infer it instead (see doc/.../authoring-rule.md), or"
            "\n      raise the ceiling deliberately with --write and say why in the commit."
        )
        return 1
    print(f"\nOK  average {average:.2f} is at or below the ceiling {ceiling}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
