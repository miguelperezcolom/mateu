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

from mateu_ui.dtos import ValidationRecord
from mateu_ui.uidl import (
    Hidden,
    Label,
    Max,
    Min,
    Pattern,
    Required,
    Length,
    ValidationSupplier,
)

from .naming import camel_case, humanize
from .reflection import view_fields


#: What an open maximum reads as in a length message — Java's ``Integer.MAX_VALUE``, the default of
#: ``@Size(max)`` — so the three servers say "Size must be between 2 and 2147483647" alike.
OPEN_LENGTH = 2147483647


def _num(value: float) -> str:
    """A bound as Java prints its ``long``: ``18``, not ``18.0``."""
    return str(int(value)) if float(value).is_integer() else str(value)


def field_constraints(f) -> list[tuple[str, str]]:
    """``(condition, message)`` pairs for a field, in Java's order (Length, Min, Max, Pattern, then the
    not-empty constraint)."""
    fid = camel_case(f.name)
    ref = f"state['{fid}']"
    out: list[tuple[str, str]] = []
    size = f.marker(Length)
    if size is not None:
        upper = size.max if size.max is not None else OPEN_LENGTH
        default = f"Size must be between {size.min} and {upper}"
        # a condition HOLDS when the value is valid (it read `x && x.length < min`, true for a value
        # too SHORT); an absent value and one with no length pass, as on the server — Java's
        # ConstraintValidationMapper.sized, character for character
        sized = f"{ref} == null || {ref} === '' || {ref}.length === undefined || {ref}.length"
        if size.min > 0:
            out.append((f"{sized} >= {size.min}", size.message or default))
        if size.max is not None and size.max < OPEN_LENGTH:
            out.append((f"{sized} <= {size.max}", size.message or default))
    # Bean Validation reads an absent value as valid for Min / Max / Pattern (requiring it is the
    # not-empty constraint's job), so an optional bounded field left empty passes.
    absent = f"{ref} == null || {ref} === ''"
    low = f.marker(Min)
    if low is not None:
        out.append((f"{absent} || {ref} >= {_num(low.value)}", low.message or f"Must be at least {_num(low.value)}"))
    high = f.marker(Max)
    if high is not None:
        out.append((f"{absent} || {ref} <= {_num(high.value)}", high.message or f"Must be at most {_num(high.value)}"))
    pattern = f.marker(Pattern)
    if pattern is not None:
        out.append((f"{absent} || /{pattern.regexp}/.test({ref})", pattern.message or "Invalid format"))
    if f.has(Required):
        out.append((required_condition(ref), "Cannot be empty"))
    return out


def required_condition(ref: str) -> str:
    """A required field holds a value: not null, not a cleared input, not an empty list — while
    ``0`` and ``false`` ARE values (a bare ``state['x']`` rejected both). Java's
    ConstraintValidationMapper.required, character for character."""
    return f"{ref} != null && {ref} !== '' && ({ref}.length === undefined || {ref}.length > 0)"


def validated_fields(mapper, cls, read_only: bool = False, fields: Iterable | None = None) -> list:
    """The fields a form sends constraints for: the ones it renders. A field-level ``ReadOnly()`` /
    ``PlainText()`` (or a ``@plain_text`` class) still sends its constraints, as Java's
    ``PageFormBuilder.rendersAsInput`` does — its value travels pre-filled; whether the reference
    should skip locked fields is an open question, and the ports follow the reference meanwhile
    (conformance case ``validation-locked``). So does a field locked by an unauthorized
    ``ReadOnlyUnless`` and every field of a ``@read_only`` class (``validation-unless``,
    ``validation-read-only-view``): Java's ValidationMapper asks neither. Only ``read_only=True``
    from the caller — a page that is not a form at all, like a crud record's view page — sends none."""
    if read_only:
        return []
    return [f for f in (fields if fields is not None else view_fields(cls)) if mapper.visible(f)]


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
    for f in validated_fields(mapper, cls, read_only, fields):
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
        return problems  # an absent optional value satisfies Min/Max/Length/Pattern
    size = f.marker(Length)
    if size is not None and hasattr(value, "__len__"):
        n = len(value)
        if n < size.min or (size.max is not None and n > size.max):
            upper = size.max if size.max is not None else OPEN_LENGTH
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


#: The title the client gives its own validation toast (Java's ServerConstraintCheck.TITLE).
VALIDATION_TITLE = "There are validation errors"


def form_violations(mapper, cls, instance) -> list[str]:
    """``"<label>: <message>"`` for every constraint the hydrated view breaks, checked over exactly
    the fields the client checks (a ``Hidden(expr)`` field is the browser's to judge, and a
    ``ValidationSupplier`` replaces the field constraints). The server-side leg of a view action
    the client is told to validate: the browser is not to be trusted, nor the only client."""
    if isinstance(instance, ValidationSupplier):
        return []
    out = []
    for f in validated_fields(mapper, cls):
        hidden = f.marker(Hidden)
        if hidden is not None and hidden.value:
            continue
        label = f.marker(Label).value if f.has(Label) else humanize(f.name)
        for message in field_violations(f, getattr(instance, f.name, None)):
            out.append(f"{label}: {mapper.T(message)}")
    return out


def describe(broken: list[str]) -> str:
    """The violations as the one text the client shows for its own check."""
    return "\n".join(f"• {b}" for b in broken)


__all__ = [
    "VALIDATION_TITLE",
    "client_validations",
    "describe",
    "field_constraints",
    "field_violations",
    "form_violations",
    "required_condition",
    "validated_fields",
    "violations",
]
