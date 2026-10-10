"""Whether REST sources answer with their SAMPLE data instead of calling the endpoint (the Python
port of Java's ``SampleSources``).

The rule, the same on every leg and in every renderer: sample data is used ALWAYS in the visual
editor (canvas and Play), in a bundle built with the mock flag, and at runtime ONLY when the app opts
in — here the environment variable ``MATEU_SOURCES_MOCK=true`` (or ``1``). Never silently in
production: a source carrying a sample is called for real unless that says otherwise.

When the server is in sample mode it says so on the wire (``AppMetadata.mockSources``) so the browser
short-circuits its DIRECT fetches too, and the samples travel in the catalogue; the proxied leg
(``__restfetch__``) answers reads with the sample and writes with ``{}`` without calling anything.
"""

from __future__ import annotations

import os

ENV = "MATEU_SOURCES_MOCK"


def enabled() -> bool:
    """True when the running app opted into sample data."""
    value = os.environ.get(ENV)
    return value is not None and value.strip().lower() in ("true", "1")


__all__ = ["ENV", "enabled"]
