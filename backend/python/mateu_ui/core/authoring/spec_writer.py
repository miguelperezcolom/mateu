"""Writes an authored definition into the specs directory — the ``mateu_save_spec`` tool, only ever
offered in development mode (Java's ``SpecWriter``). The path rule is normative (the same in Java,
.NET and the sidecar): a relative ``.yaml``/``.yml`` path with no ``..``, ``.`` or empty segment, no
backslash, no drive letter, at most 255 characters, that stays inside the specs directory once
symbolic links are followed."""

from __future__ import annotations

import os
import re
from pathlib import Path

from mateu_ui.uidl import UserFacingException

from .validator import quote

_DRIVE = re.compile(r"^[A-Za-z]:")


def is_acceptable(path: str | None) -> bool:
    """Whether ``path`` is acceptable before touching the disk."""
    if path is None or not path.strip() or len(path) > 255:
        return False
    if "\0" in path or "\\" in path or path.startswith("/") or _DRIVE.search(path):
        return False
    if not (path.endswith(".yaml") or path.endswith(".yml")):
        return False
    return all(segment not in ("", ".", "..") for segment in path.split("/"))


def refusal(path: str | None) -> str:
    """The message of a refused path (shown as written)."""
    return (
        f"Invalid path {quote(path or '')}: give a relative .yaml or .yml path inside the specs"
        ' directory (no "..", no absolute path).'
    )


def _inside(path: Path, base: Path) -> bool:
    return path == base or base in path.parents


def write(root: Path, path: str, text: str) -> int:
    """Writes ``text`` at ``path`` under ``root``, creating the folders it needs; the number of
    bytes written. Raises :class:`UserFacingException` when the path is refused."""
    if not is_acceptable(path):
        raise UserFacingException(refusal(path))
    base = Path(os.path.normpath(os.path.abspath(root)))
    target = Path(os.path.normpath(base / path))
    if not _inside(target, base):
        raise UserFacingException(refusal(path))
    real_base = base.resolve(strict=True)
    existing = target.parent
    while not existing.exists() and existing.parent != existing:
        existing = existing.parent
    if not _inside(existing.resolve(), real_base):
        raise UserFacingException(refusal(path))
    if target.is_symlink() and not _inside(target.resolve(), real_base):
        raise UserFacingException(refusal(path))
    target.parent.mkdir(parents=True, exist_ok=True)
    data = text.encode("utf-8")
    target.write_bytes(data)
    return len(data)
