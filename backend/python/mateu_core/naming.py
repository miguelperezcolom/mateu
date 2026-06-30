"""Name conversions, mirroring the C# Naming helper."""

from __future__ import annotations


def camel_case(s: str) -> str:
    """``snake_case`` -> ``camelCase``; ``"name" -> "name"``, ``"first_name" -> "firstName"``."""
    if not s:
        return s
    if "_" not in s:
        return s[0].lower() + s[1:]
    head, *rest = s.split("_")
    return head + "".join(p[:1].upper() + p[1:] for p in rest)


def humanize(s: str) -> str:
    """``first_name`` / ``firstName`` -> ``"First name"`` (matches C# Naming.Humanize)."""
    if not s:
        return s
    out: list[str] = []
    prev_word_char = False  # previous emitted char was a letter/digit (lower)
    for c in s:
        if c == "_":
            if out and out[-1] != " ":
                out.append(" ")
            prev_word_char = False
            continue
        if c.isupper() and prev_word_char:
            out.append(" ")
        out.append(c.lower())
        prev_word_char = c.isalnum()
    text = "".join(out).strip()
    return text[0].upper() + text[1:] if text else text
