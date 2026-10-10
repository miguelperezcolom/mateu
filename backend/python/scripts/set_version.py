"""Stamp the package version from a release tag, in lockstep with the Maven artifacts.

    python scripts/set_version.py v3.0-alpha.406      # → mateu_core/_version.py = "3.0.0a406"

The Java release takes the tag minus its ``v`` (``3.0-alpha.406``) as the Maven version; that is not
a valid PEP 440 version, so it is translated: ``alpha``/``beta``/``rc`` pre-releases become
``aN``/``bN``/``rcN`` and the release segment is padded to three components (``3.0`` → ``3.0.0``).
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

VERSION_FILE = Path(__file__).resolve().parents[1] / "mateu_core" / "_version.py"

_PRE = {"alpha": "a", "a": "a", "beta": "b", "b": "b", "rc": "rc", "cr": "rc"}


def pep440(tag: str) -> str:
    """Translate a release tag (``v3.0-alpha.406``, ``v3.0.1``, ``3.1-rc.2``) to PEP 440."""
    raw = tag.strip()
    if raw.startswith(("v", "V")):
        raw = raw[1:]
    match = re.fullmatch(r"(\d+(?:\.\d+)*)(?:[-.]?([A-Za-z]+)[-.]?(\d+)?)?", raw)
    if not match:
        raise ValueError(f"not a release tag: {tag!r}")
    release, label, number = match.groups()
    parts = release.split(".")
    while len(parts) < 3:
        parts.append("0")
    version = ".".join(str(int(p)) for p in parts)
    if label:
        key = label.lower()
        if key not in _PRE:
            raise ValueError(f"unknown pre-release label {label!r} in {tag!r}")
        version += f"{_PRE[key]}{int(number or 0)}"
    return version


def stamp(tag: str, path: Path = VERSION_FILE) -> str:
    version = pep440(tag)
    text = path.read_text(encoding="utf-8")
    text, count = re.subn(r'__version__ = "[^"]*"', f'__version__ = "{version}"', text)
    if count != 1:
        raise RuntimeError(f"no __version__ line in {path}")
    path.write_text(text, encoding="utf-8")
    return version


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: set_version.py <release-tag>")
    print(stamp(sys.argv[1]))
