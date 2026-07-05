"""Deterministic layout inference — the Python port of Java's ``LayoutInference`` decision table.

Picks the UX pattern (flat form, folded optionals, tabs…) from the amount and structure of the
declared information, so a class decorated ``@auto_layout`` only has to declare its data. Explicit
layout markers always win — inference only fills the gaps the developer left open.

All decisions are based on the declared structure (never on runtime data) and on coarse counts —
number of sections, estimated visual weight — so adding one field never flips the whole layout.
The Java class is the reference decision table: this module ports those exact rules and thresholds
so the wire JSON stays identical across server implementations.
"""

from __future__ import annotations

from enum import Enum

#: Enums with up to this many members render as radio buttons instead of a dropdown.
RADIO_MAX_OPTIONS = 4

#: Estimated weight (in standard field-row units) a form must exceed to fold its optionals.
FOLD_WEIGHT_THRESHOLD = 16

#: Minimum number of optional fields worth folding into a "More options" panel.
FOLD_MIN_OPTIONAL = 4

#: Minimum number of sections before a read-only view is presented as tabs.
TABS_MIN_SECTIONS = 5

#: Estimated total weight the sections must exceed before switching to tabs.
TABS_WEIGHT_THRESHOLD = 30

#: Label of the collapsed panel hosting the folded optional fields.
MORE_OPTIONS_LABEL = "More options"

# Stereotypes that "cost" several regular inputs (Java: textarea/richText/html/markdown/image/
# uploadableImage -> 4, grid -> 6, radio/checkbox -> 2).
_HEAVY_STEREOTYPES = frozenset(
    ("textarea", "richText", "html", "markdown", "image", "uploadableImage")
)
_COMPACT_STEREOTYPES = frozenset(("radio", "checkbox"))


def enabled(cls) -> bool:
    """Whether inference applies to the view class: the ``@auto_layout`` decorator decides when
    present (``@auto_layout(False)`` opts out); default off. (Java additionally supports the
    ``mateu.layout.inference`` system property for a global default — not ported.)"""
    flag = getattr(cls, "__mateu_auto_layout__", None)
    return bool(flag) if flag is not None else False


def estimated_weight(stereotype: str) -> int:
    """Estimated visual weight of a field in standard field-row units (1 = one regular input),
    from its effective stereotype. The unit every threshold is measured in: a textarea "costs"
    several regular inputs, so thresholds hold across very different field mixes. (Java also
    weighs array/component data types as 6 — the Python backend has no such form fields yet.)"""
    if stereotype in _HEAVY_STEREOTYPES:
        return 4
    if stereotype == "grid":
        return 6
    if stereotype in _COMPACT_STEREOTYPES:
        return 2
    return 1


def prefer_radio(cls, field_type) -> bool:
    """Small-enum rule: with up to :data:`RADIO_MAX_OPTIONS` members, radio buttons expose every
    option at a glance for the cost of one extra row; beyond that a dropdown is denser."""
    return (
        enabled(cls)
        and isinstance(field_type, type)
        and issubclass(field_type, Enum)
        and len(field_type) <= RADIO_MAX_OPTIONS
    )
