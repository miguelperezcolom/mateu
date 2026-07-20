"""Labels-aside inference — the Python port of Java's ``LabelsAsideInference``.

Where a form's field labels sit (the ``labelsAside`` wire flag), following the dense backoffice
data-entry idiom: labels-aside pays off (one compact row per field, a scannable label column)
only when the form is single-column AND dense AND short-labelled AND made of single-line
widgets; anything else keeps labels on top. The explicit ``@form_layout(labels_aside=...)``
always wins over this inference.
"""

from __future__ import annotations

from collections.abc import Callable
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import get_origin

from mateu_uidl import Label, LabelsAsideMode, Multiline, Stereotype

from .naming import humanize

#: Below this field count a form is not dense enough for labels-aside to pay off.
MIN_FIELDS = 6

#: Longest label that fits the aside label column without truncation.
MAX_LABEL_CHARS = 20

#: The scalar types rendering as single-line widgets; any other non-enum type is a nested
#: model needing the field's full width (the same basic set the mapper maps to data types).
_BASIC_TYPES = (str, bool, int, float, Decimal, date, datetime)

#: Stereotypes that break the aside row: tall/wide content needing the field's full width.
_WIDE_STEREOTYPES = frozenset(("textarea", "richText"))

#: Collection/map annotations (Java's Collection/Map) render as grids/multi-value widgets.
_WIDE_ORIGINS = frozenset((list, set, frozenset, dict))


def labels_aside(fields, max_columns: int, cls=None) -> bool:
    """The form's labels mode: the explicit ``@form_layout(labels_aside=ASIDE|TOP)`` on the view
    class wins; with ``AUTO`` the mode is inferred from the form's shape. The Python analogue of
    Java's ``LabelsAsideInference.labelsAside``."""
    mode = getattr(cls, "__mateu_labels_aside__", LabelsAsideMode.AUTO)
    if mode is not LabelsAsideMode.AUTO:
        return mode is LabelsAsideMode.ASIDE
    return _infer(fields, max_columns)


def _infer(fields, max_columns: int) -> bool:
    if max_columns != 1 or len(fields) < MIN_FIELDS:
        return False
    for f in fields:
        label = f.marker(Label).value if f.has(Label) else humanize(f.name)
        if len(label) > MAX_LABEL_CHARS:
            return False
        if _is_wide_widget(f):
            return False
    return True


def _is_wide_widget(f) -> bool:
    """Widgets that break the aside row: tall/wide content that needs the field's full width."""
    stereotype = f.marker(Stereotype)
    if stereotype is not None and stereotype.value in _WIDE_STEREOTYPES:
        return True
    # Multiline() renders with the "textarea" stereotype (see mapper.stereotype_of).
    if f.has(Multiline):
        return True
    t = f.type
    origin = get_origin(t) or t
    if origin in _WIDE_ORIGINS or origin is Callable:
        return True
    return not (isinstance(t, type) and issubclass(t, Enum)) and t not in _BASIC_TYPES
