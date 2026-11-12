"""The autocomplete token a form field carries (WCAG 1.3.5 Identify Input Purpose) — the twin of
Java's ``FieldMapper.autocompleteOf``: the declared token, else ``"email"`` for an editable email
field (the only purpose the field itself tells), else none."""

from __future__ import annotations


def input_purpose(declared: str | None, stereotype: str | None, read_only: bool) -> str | None:
    if declared and declared.strip():
        return declared.strip()
    return "email" if stereotype == "email" and not read_only else None
