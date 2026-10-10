"""Declared constraints: field markers (the analogue of Bean Validation's ``@Min``/``@Max``/
``@Size``/``@Pattern``), class-level cross-field validations and the programmatic supplier.

Every constraint travels to the client as a component-level ``validations`` entry (a condition over
the state + a message, Java's ``ValidationDto``), so the renderer refuses to submit an invalid form,
AND is enforced again on the server when the form is saved — a constraint enforced only in the
browser would be a suggestion. ``Required()`` (in ``markers``) is the analogue of ``@NotNull`` /
``@NotEmpty``.

    age: Annotated[int, Min(18), Max(99)] = 36
    code: Annotated[str, Size(min=3, max=8), Pattern(r"^[A-Z]+$")] = ""
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable


@dataclass(frozen=True)
class Min:
    """The numeric value must be ``>= value`` (Bean Validation's ``@Min``)."""

    value: float
    message: str | None = None


@dataclass(frozen=True)
class Max:
    """The numeric value must be ``<= value`` (Bean Validation's ``@Max``)."""

    value: float
    message: str | None = None


@dataclass(frozen=True)
class Size:
    """The text (or collection) length must be within ``[min, max]`` (Bean Validation's ``@Size``);
    an empty value is not checked — combine with ``Required()`` for that."""

    min: int = 0
    max: int | None = None
    message: str | None = None


@dataclass(frozen=True)
class Pattern:
    """The text must match ``regexp`` (Bean Validation's ``@Pattern``; written as a JavaScript-
    compatible regular expression, because the client evaluates it too)."""

    regexp: str
    message: str | None = None


@dataclass(frozen=True)
class Validation:
    """A cross-field or custom client-side validation: while ``condition`` (an expression over
    ``state``) is falsy, the form cannot be submitted and ``message`` shows on ``field_id``
    (mirrors ``io.mateu.uidl.data.Validation``)."""

    condition: str
    field_id: str
    message: str


class ValidationSupplier:
    """Implemented by a view to supply its validations programmatically; when implemented it
    REPLACES the ones derived from the markers (mirrors Java's ``ValidationSupplier``)."""

    def validations(self) -> list[Validation]:
        raise NotImplementedError


def validation(condition: str, field_id: str, message: str) -> Callable[[type], type]:
    """Class-level, repeatable: a cross-field validation (Java's ``@Validation``), e.g.
    ``@validation("state['end'] >= state['start']", "end", "Ends before it starts")``."""

    def deco(cls: type) -> type:
        existing = list(cls.__dict__.get("__mateu_validations__", ()))
        # decorators apply bottom-up: prepend so the declaration order is kept
        cls.__mateu_validations__ = [Validation(condition, field_id, message), *existing]  # type: ignore[attr-defined]
        return cls

    return deco
