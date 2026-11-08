"""Splits a crud search's component state into the typed conditions plain filter values cannot hold
(:class:`~mateu_ui.uidl.listing.FilterCriterion`) and the equality values they can — the port of
Java's ``FilterCriteriaBuilder``.

Ranges arrive as ``<fieldId>_from`` / ``<fieldId>_to`` keys (date/datetime fields, and numerics
marked ``RangeFilter()``) and multi-selects as value lists, or comma-joined strings after a URL
restore (enum fields). Both become criteria with their values converted to the field's type, and
their keys are REMOVED from the returned example state. A single bare string on an enum key stays
in the state on purpose: it keeps filtering by equality, which is what older clients send. Blank
or unparseable bounds / stale enum names are dropped rather than failing the search.
"""

from __future__ import annotations

import inspect
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from enum import Enum
from typing import Any

from mateu_ui.uidl import RangeFilter
from mateu_ui.uidl.listing import FilterCriterion, FilterOperator

from .naming import camel_case
from .reflection import view_fields

_NUMERIC = (int, float, Decimal)


def extract(element: type, state: dict[str, Any] | None) -> tuple[tuple[FilterCriterion, ...], dict[str, Any]]:
    """``(criteria, example_state)`` for a search over ``element`` with ``state``."""
    remaining = dict(state or {})
    if not remaining:
        return (), remaining
    criteria: list[FilterCriterion] = []
    for f in view_fields(element):
        t = f.type
        key = camel_case(f.name)
        if t in (date, datetime) or (t in _NUMERIC and f.has(RangeFilter)):
            lower = _coerce(t, remaining.pop(key + "_from", None))
            upper = _coerce(t, remaining.pop(key + "_to", None))
            if lower is not None and upper is not None:
                criteria.append(FilterCriterion(f.name, FilterOperator.between, (lower, upper)))
            elif lower is not None:
                criteria.append(FilterCriterion(f.name, FilterOperator.gte, (lower,)))
            elif upper is not None:
                criteria.append(FilterCriterion(f.name, FilterOperator.lte, (upper,)))
        elif isinstance(t, type) and issubclass(t, Enum):
            names = _multi_values(remaining.get(key))
            if names is None:
                continue
            remaining.pop(key, None)
            values = tuple(v for v in (_coerce(t, n) for n in names) if v is not None)
            if values:
                criteria.append(FilterCriterion(f.name, FilterOperator.in_, values))
    return tuple(criteria), remaining


def accepts_criteria(find) -> bool:
    """Whether an overridden ``find`` declares the ``criteria`` parameter (the newer signature)."""
    try:
        params = inspect.signature(find).parameters
    except (TypeError, ValueError):
        return False
    return "criteria" in params or any(p.kind == p.VAR_KEYWORD for p in params.values())


def _multi_values(raw) -> list[str] | None:
    if isinstance(raw, (list, tuple)):
        return [str(v) for v in raw if str(v).strip()]
    if isinstance(raw, str) and "," in raw:
        return [v.strip() for v in raw.split(",") if v.strip()]
    return None


def _coerce(t, raw):
    if raw is None or (isinstance(raw, str) and not raw.strip()):
        return None
    try:
        if t is datetime:
            return datetime.fromisoformat(str(raw).strip())
        if t is date:
            return date.fromisoformat(str(raw).strip()[:10])
        if t is int:
            number = float(raw)
            return int(number) if number.is_integer() else number
        if t is float:
            return float(raw)
        if t is Decimal:
            return Decimal(str(raw))
        if isinstance(t, type) and issubclass(t, Enum):
            return t[str(raw)]
    except (ValueError, KeyError, InvalidOperation, TypeError):
        return None
    return raw


__all__ = ["accepts_criteria", "extract"]
