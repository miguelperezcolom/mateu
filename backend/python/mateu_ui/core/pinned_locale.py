"""The app's pinned UI language (Java: ``mateu.locale``, .NET: ``MateuOptions.Locale``).

``add_mateu(locale=…)``, else the ``MATEU_LOCALE`` env var — a BCP 47 tag such as ``es`` or
``pt-BR``. When it is set, every request gets that language (``AppMetadata.locale``, so ``<html
lang>``, the client chrome and money formatting, and what ``${i18n.…}`` resolves for) instead of the
browser's ``Accept-Language``. An app's own ``Translator.locale()`` still wins over it. An invalid
value is ignored with one warning per distinct value.
"""

from __future__ import annotations

import logging
import os
import re

log = logging.getLogger("mateu.locale")

ENV_VAR = "MATEU_LOCALE"

_TAG = re.compile(r"^[A-Za-z]{2,8}(-[A-Za-z0-9]{1,8})*$")

_configured: str | None = None
_warned: set[str] = set()


def configure(value: str | None) -> None:
    """Sets (or, with None, clears) the value ``add_mateu(locale=…)`` was given."""
    global _configured
    _configured = value


def pinned() -> str | None:
    """The pinned tag, normalised (``pt_br`` → ``pt-BR``), or None when not set or invalid."""
    value = _configured if _configured and _configured.strip() else os.environ.get(ENV_VAR)
    return normalize(value)


def normalize(value: str | None) -> str | None:
    if value is None or not value.strip():
        return None
    raw = value.strip()
    tag = raw.replace("_", "-")
    language = tag.split("-")[0]
    if not _TAG.match(tag) or len(language) == 4 or language.lower() == "und":
        if raw not in _warned and len(_warned) < 100:
            _warned.add(raw)
            log.warning(
                "Ignoring add_mateu(locale=…) / %s %r: not a language tag (expected e.g. es, en-GB, pt-BR)",
                ENV_VAR,
                raw[:64],
            )
        return None
    parts = tag.split("-")
    out = [parts[0].lower()]
    for part in parts[1:]:
        if len(part) == 4 and part.isalpha():
            out.append(part[0].upper() + part[1:].lower())
        elif len(part) == 2 and part.isalpha():
            out.append(part.upper())
        else:
            out.append(part.lower())
    return "-".join(out)
