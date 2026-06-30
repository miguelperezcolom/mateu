"""Introspection over user view classes: ordered fields + their ``Annotated`` markers, and the
methods carrying Mateu method-decorators. The Python analogue of C# reflection over attributes."""

from __future__ import annotations

import inspect
import types
from dataclasses import dataclass, field
from typing import Annotated, Any, Union, get_args, get_origin

from mateu_uidl import Crud, Wizard

# Base classes whose annotations/members are framework plumbing, not user fields.
_FRAMEWORK = {Crud.__name__, Wizard.__name__, "Generic", "object"}


@dataclass
class FieldInfo:
    name: str
    type: Any
    markers: list = field(default_factory=list)

    def marker(self, cls):
        for m in self.markers:
            if isinstance(m, cls):
                return m
        return None

    def has(self, cls) -> bool:
        return self.marker(cls) is not None


def _local_hints(klass) -> dict[str, Any]:
    """A class's *own* annotations (not inherited), resolved to runtime values.

    Uses ``inspect.get_annotations`` so it works under PEP 649 lazy annotations (Python 3.14+),
    where annotations are no longer eagerly stored in ``__dict__['__annotations__']``."""
    try:
        return inspect.get_annotations(klass, eval_str=True)
    except Exception:
        try:
            return inspect.get_annotations(klass)
        except Exception:
            return {}


def _split(hint):
    """An ``Annotated[T, *markers]`` hint -> ``(T, [markers])``; a plain ``T`` -> ``(T, [])``."""
    if get_origin(hint) is Annotated:
        args = get_args(hint)
        return args[0], list(args[1:])
    return hint, []


def _underlying(t):
    """Strip ``Optional`` / ``X | None`` down to ``X`` for data-type inference."""
    if get_origin(t) in (Union, getattr(types, "UnionType", ())):
        non_none = [a for a in get_args(t) if a is not type(None)]
        if len(non_none) == 1:
            return non_none[0]
        if non_none:
            return non_none[0]
    return t


def view_fields(cls) -> list[FieldInfo]:
    """The user-defined fields of a view, in declaration order (derived overriding base)."""
    order: list[str] = []
    seen: dict[str, FieldInfo] = {}
    for klass in reversed(cls.__mro__):
        if klass.__name__ in _FRAMEWORK:
            continue
        for name, hint in _local_hints(klass).items():
            base, markers = _split(hint)
            if name not in seen:
                order.append(name)
            seen[name] = FieldInfo(name, _underlying(base), markers)
    return [seen[n] for n in order]


def methods_with(cls, attr: str) -> list[tuple[str, Any]]:
    """``(name, function)`` for every method carrying ``attr``, leaf declaration order."""
    out: list[tuple[str, Any]] = []
    seen: set[str] = set()
    for klass in cls.__mro__:
        if klass.__name__ in _FRAMEWORK:
            continue
        for name, val in vars(klass).items():
            if name in seen or not callable(val):
                continue
            seen.add(name)
            if hasattr(val, attr):
                out.append((name, val))
    return out


def class_flag(cls, attr: str, default=None):
    return getattr(cls, attr, default)
