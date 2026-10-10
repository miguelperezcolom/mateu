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


def snake_case(s: str) -> str:
    """``camelCase`` -> ``snake_case``; ``"firstName" -> "first_name"``, ``"name" -> "name"``."""
    out = []
    for i, ch in enumerate(s or ""):
        if ch.isupper() and i > 0:
            out.append("_")
        out.append(ch.lower())
    return "".join(out)


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


def humanize_constant(s: str) -> str:
    """An identifier as Java's ``Humanizer.toUpperCaseFirst`` shows it — used for enum members so
    every backend calls them the same: '.', '_' and '-' are spaces, words split at case and
    letter/non-letter boundaries, then lower case with the first letter upper (``CHECK_OUT`` →
    "Check out", ``CheckOut`` → "Check out", ``ROOM1`` → "Room 1")."""
    import re

    if not s:
        return s
    s = s.replace(".", " ").replace("_", " ").replace("-", " ")
    s = re.sub(r"(?<=[A-Z])(?=[A-Z][a-z])|(?<=[^A-Z])(?=[A-Z])|(?<=[A-Za-z])(?=[^A-Za-z])", " ", s).lower()
    s = re.sub(r" +", " ", s)
    return s[:1].upper() + s[1:] if len(s) > 1 else s
