"""The two global inference switches — the Python twin of Java's ``mateu.layout.inference.enabled``
/ ``mateu.page.inference.enabled`` (3.0-alpha.412), read from the environment the way Java reads its
environment fallback (the key upper-cased, dots as underscores):

- ``MATEU_LAYOUT_INFERENCE_ENABLED`` — layout inference (``@auto_layout``) for every class; default
  off;
- ``MATEU_PAGE_INFERENCE_ENABLED`` — page-level inference (``@auto_page``) for every class; default
  on.

A decorator on the class always wins. Python had no global switch before, so there are no legacy
names to alias.
"""

from __future__ import annotations

import os

LAYOUT = "MATEU_LAYOUT_INFERENCE_ENABLED"
PAGE = "MATEU_PAGE_INFERENCE_ENABLED"


def _flag(name: str, default: bool) -> bool:
    value = os.environ.get(name, "").strip()
    if not value:
        return default
    return value.lower() == "true"


def layout_inference_enabled() -> bool:
    """Whether layout inference is on globally (classes without ``@auto_layout``)."""
    return _flag(LAYOUT, False)


def page_inference_enabled() -> bool:
    """Whether page-level inference is on globally (classes without ``@auto_page``)."""
    return _flag(PAGE, True)
