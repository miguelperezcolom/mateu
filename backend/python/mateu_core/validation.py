"""Declared constraints, both legs: the client-side ``validations`` a form carries on the wire and
the server-side check run when a form is saved.

The client leg mirrors Java's ``ValidationMapper`` / ``ConstraintValidationMapper`` condition for
condition and message for message (``state['age'] >= 18`` / ``Must be at least 18``), so the same
declaration produces the same wire on every server. The server leg re-checks the same constraints,
because a rule enforced only in the browser is a suggestion.
"""

from __future__ import annotations

import re
from collections.abc import Iterable
from typing import Any

from mateu_dtos import ValidationRecord
from mateu_uidl import (
    Hidden,
    Label,
    Max,
    Min,
    Pattern,
    PlainText,
    ReadOnly,
    Required,
    Size,
    ValidationSupplier,
)

from .naming import camel_case, humanize
from .reflection import class_flag, view_fields


def _num(value: float) -> str:
    """A bound as Java prints its ``long``: ``18``, not ``18.0``."""
    return str(int(value)) if float(value).is_integer() else str(value)


def field_constraints(f) -> list[tuple[str, str]]:
    """``(condition, message)`` pairs for a field, in Java's order (Size, Min, Max, Pattern, then the
    not-empty constraint)."""
    fid = camel_case(f.name)
    ref = f"state['{fid}']"
    out: list[tuple[str, str]] = []
    size = f.marker(Size)
    if size is not None:
        upper = size.max if size.max is not None else "∞"
        default = f"Size must be between {size.min} and {upper}"
        if size.min > 0:
            out.append((f"{ref} && {ref}.length < {size.min}", size.message or default))
        if size.max is not None:
            out.append((f"{ref} && {ref}.length > {size.max}", size.message or default))
    low = f.marker(Min)
    if low is not None:
        out.append((f"{ref} >= {_num(low.value)}", low.message or f"Must be at least {_num(low.value)}"))
    high = f.marker(Max)
    if high is not None:
        out.append((f"{ref} <= {_num(high.value)}", high.message or f"Must be at most {_num(high.value)}"))
    pattern = f.marker(Pattern)
    if pattern is not None:
        out.append((f"/{pattern.regexp}/.test({ref})", pattern.message or "Invalid format"))
    if f.has(Required):
        out.append((ref, "Cannot be empty"))
    return out


def client_validations(
    mapper, cls, instance, read_only: bool = False, fields: Iterable | None = None
) -> list[ValidationRecord]:
    """The ``validations`` of a form view: a ``ValidationSupplier`` replaces everything; otherwise
    one entry per constraint of every field the form renders as an INPUT (a constraint on a field
    the user cannot type into would block the submit for ever), then the class-level
    ``@validation`` entries. A ``Hidden(expr)`` field's constraint is relaxed while it is hidden."""
    if isinstance(instance, ValidationSupplier):
        return [
            ValidationRecord(condition=v.condition, field_id=v.field_id, message=v.message)
            for v in instance.validations() or []
        ]
    out: list[ValidationRecord] = []
    view_read_only = read_only or bool(class_flag(cls, "__mateu_read_only__", False))
    plain_class = bool(class_flag(cls, "__mateu_plain_text__", False))
    if not view_read_only:
        for f in fields if fields is not None else view_fields(cls):
            if not mapper.visible(f) or f.has(ReadOnly) or f.has(PlainText) or plain_class:
                continue
            if not _authorized_to_edit(mapper, f):
                continue
            hidden = f.marker(Hidden)
            for condition, message in field_constraints(f):
                if hidden is not None and hidden.value:
                    condition = f"({hidden.value}) || ({condition})"
                out.append(
                    ValidationRecord(
                        condition=condition, field_id=camel_case(f.name), message=mapper.T(message)
                    )
                )
    for v in getattr(cls, "__mateu_validations__", ()) or ():
        out.append(ValidationRecord(condition=v.condition, field_id=v.field_id, message=mapper.T(v.message)))
    return out


def _authorized_to_edit(mapper, f) -> bool:
    from mateu_uidl import ReadOnlyUnless

    return mapper.authorized(f.marker(ReadOnlyUnless))


def _is_blank(value: Any) -> bool:
    return value is None or (isinstance(value, str) and value.strip() == "") or (
        isinstance(value, (list, tuple, set, dict)) and len(value) == 0
    )


def field_violations(f, value: Any) -> list[str]:
    """The messages of the constraints ``value`` breaks (server-side leg)."""
    problems: list[str] = []
    if f.has(Required) and _is_blank(value):
        problems.append("Cannot be empty")
        return problems
    if _is_blank(value):
        return problems  # an absent optional value satisfies Min/Max/Size/Pattern
    size = f.marker(Size)
    if size is not None and hasattr(value, "__len__"):
        n = len(value)
        if n < size.min or (size.max is not None and n > size.max):
            upper = size.max if size.max is not None else "∞"
            problems.append(size.message or f"Size must be between {size.min} and {upper}")
    numeric = isinstance(value, (int, float)) and not isinstance(value, bool)
    if not numeric:
        try:
            from decimal import Decimal

            numeric = isinstance(value, Decimal)
        except ImportError:  # pragma: no cover
            pass
    low = f.marker(Min)
    if low is not None and numeric and value < low.value:
        problems.append(low.message or f"Must be at least {_num(low.value)}")
    high = f.marker(Max)
    if high is not None and numeric and value > high.value:
        problems.append(high.message or f"Must be at most {_num(high.value)}")
    pattern = f.marker(Pattern)
    if pattern is not None and isinstance(value, str) and re.search(pattern.regexp, value) is None:
        problems.append(pattern.message or "Invalid format")
    return problems


def violations(entity: Any, cls: type, fields: Iterable | None = None) -> list[tuple[str, str]]:
    """``(label, message)`` for every constraint ``entity`` breaks."""
    out: list[tuple[str, str]] = []
    for f in fields if fields is not None else view_fields(cls):
        label = f.marker(Label).value if f.has(Label) else humanize(f.name)
        for message in field_violations(f, getattr(entity, f.name, None)):
            out.append((label, message))
    return out


__all__ = ["client_validations", "field_constraints", "field_violations", "violations"]
