"""Validation of the enum-valued arguments of the decorators."""

from __future__ import annotations

from collections.abc import Iterable
from enum import Enum
from typing import TypeVar

E = TypeVar("E", bound=Enum)


def coerce_enum(value: object, enum_cls: type[E], where: str) -> E:
    """``value`` as a member of ``enum_cls``: a member as is, else the member whose value (or
    name) it spells. Anything else raises ``ValueError`` naming the accepted values — an unknown
    value used to be stored silently and either ignored or sent to the renderers as is."""
    if isinstance(value, enum_cls):
        return value
    for member in enum_cls:
        if value == member.value or value == member.name:
            return member
    raise ValueError(
        f"{where}: {value!r} is not one of " + ", ".join(repr(m.value) for m in enum_cls)
    )


def check_choice(value: str, choices: Iterable[str], where: str) -> str:
    """``value`` when it is one of ``choices``, else ``ValueError`` naming them."""
    allowed = tuple(choices)
    if value not in allowed:
        raise ValueError(f"{where}: {value!r} is not one of " + ", ".join(repr(c) for c in allowed))
    return value
