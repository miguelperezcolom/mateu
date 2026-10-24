"""Form-columns inference — the Python port of Java's ``FormColumnsInference``.

The form's column count when the developer did not declare one: ONE column for a form with up to
``MAX_SINGLE_COLUMN_FIELDS`` visible fields, TWO from 7 on. Decided per CLASS (deterministic,
never dependent on the caller), counted over the fields that render as form fields: the view's
fields minus what never renders in the form body whoever looks (an unconditional ``Hidden()``,
``kpi(...)``, ``HeaderBadge()``, ``Timestamp()``, ``Aside()``, ``Version()``, and component
holders — fluent component / callable fields carry their own content). Permission- or
mode-dependent fields (``EyesOnly``, ``Audience``, a conditional ``Hidden("…")``) COUNT, so one
class gets one layout; a grid/list field counts as one.

Declarations win and never reach the inference: ``@form_layout(columns=N)`` and ``@zones`` (a
zoned form keeps the classic 2). Same threshold and counting as the Java reference and the .NET
port, so the wire stays identical (pinned by the conformance corpus).
"""

from __future__ import annotations

import collections.abc
from typing import get_origin

from mateu_ui.uidl import Aside, HeaderBadge, Hidden, Timestamp, Version
from mateu_ui.uidl import components as fluent
from mateu_ui.uidl import kpi as KpiMarker

from .reflection import view_fields

#: Up to this many visible fields a form is laid out in one column.
MAX_SINGLE_COLUMN_FIELDS = 6


def declared_columns(cls) -> int:
    """The class's ``@form_layout(columns)`` when declared (≥ 1), else 0."""
    columns = getattr(cls, "__mateu_form_layout_columns__", 0) if cls is not None else 0
    return columns if isinstance(columns, int) and columns >= 1 else 0


def is_inferred(cls) -> bool:
    """Whether the class's column count is inferred (nothing declared on the class)."""
    return (
        cls is not None
        and declared_columns(cls) == 0
        and not getattr(cls, "__mateu_zones__", None)
    )


def form_columns(cls, fields=None) -> int:
    """The column count of a form of ``cls``: the declared ``@form_layout(columns)`` when ≥ 1, 2
    for a zoned form, else inferred from the visible fields. ``fields`` narrows the count to a
    subset — a wizard step, whose fields live on the wizard class (each step is its own form)."""
    declared = declared_columns(cls)
    if declared >= 1:
        return declared
    if cls is None or getattr(cls, "__mateu_zones__", None):
        return 2
    counted = view_fields(cls) if fields is None else fields
    return 1 if visible_field_count(counted) <= MAX_SINGLE_COLUMN_FIELDS else 2


def visible_field_count(fields) -> int:
    return sum(1 for f in fields if renders_in_any_form(f))


def renders_in_any_form(f) -> bool:
    hidden = f.marker(Hidden)
    if hidden is not None and not (hidden.value or "").strip():
        return False
    if _is_component_holder(f.type):
        return False
    return not (
        f.has(KpiMarker)
        or f.has(HeaderBadge)
        or f.has(Timestamp)
        or f.has(Aside)
        or f.has(Version)
    )


def _is_component_holder(t) -> bool:
    if isinstance(t, type) and issubclass(t, fluent.Component):
        return True
    return t is collections.abc.Callable or get_origin(t) is collections.abc.Callable
