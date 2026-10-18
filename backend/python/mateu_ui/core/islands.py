"""Embedded islands: a form field holding a routed VIEW renders it as an independent sub-app (Java's
``EmbeddedOrchestratorFieldBuilder``).

The host emits a MEDIATOR app shell inside a ServerSide wrapper; the renderer mounts its own
``mateu-ux`` bound to the view's route and type, so the island loads, re-renders and switches between
its own states (a view returning ``self`` re-renders in place; a tree supplier picks its tree per
state) without touching the host page. The host passes context by SETTING FIELDS on the field's
value: its simple fields (str/int/float/bool/Enum, non-None) are seeded into the island's
``initialData``, so the island's first render already has them.

The island's requests carry markers in the route's query string — ``_embeddedMediator=1`` and, for
an ``Inline()`` field, ``_inline=1`` — which the handler strips before resolving the route and
remembers for the request (:func:`island_flags`).
"""

from __future__ import annotations

from contextvars import ContextVar
from enum import Enum
from typing import Any
from urllib.parse import parse_qs

EMBEDDED_MARKER = "_embeddedMediator"
INLINE_MARKER = "_inline"

_flags: ContextVar[frozenset[str]] = ContextVar("mateu_island_flags", default=frozenset())


def split_route(route: str | None) -> tuple[str | None, frozenset[str]]:
    """``"x?_embeddedMediator=1&_inline=1"`` → ``("x", {"_embeddedMediator", "_inline"})``."""
    if route is None or "?" not in route:
        return route, frozenset()
    path, _, query = route.partition("?")
    markers = {k for k, v in parse_qs(query, keep_blank_values=True).items() if k in (EMBEDDED_MARKER, INLINE_MARKER)}
    return path, frozenset(markers)


def set_flags(flags: frozenset[str]):
    return _flags.set(flags)


def reset_flags(token) -> None:
    _flags.reset(token)


def island_flags() -> frozenset[str]:
    """The island markers of the request in flight."""
    return _flags.get()


def is_inline_request() -> bool:
    return INLINE_MARKER in _flags.get()


def is_routed_view(value: Any) -> bool:
    return value is not None and getattr(type(value), "__mateu_ui__", None) is not None


def seed_state(value: Any) -> dict[str, Any]:
    """The value's SIMPLE fields (declared or set), non-None, as camelCase state."""
    from .naming import camel_case

    names: list[str] = []
    for klass in reversed(type(value).__mro__):
        for name in getattr(klass, "__annotations__", {}) or {}:
            if name not in names:
                names.append(name)
    for name in vars(value):
        if name not in names:
            names.append(name)
    out: dict[str, Any] = {}
    for name in names:
        if name.startswith("_"):
            continue
        member = getattr(value, name, None)
        if member is None or callable(member):
            continue
        if isinstance(member, Enum):
            out[camel_case(name)] = member.name
        elif isinstance(member, (str, int, float, bool)):
            out[camel_case(name)] = member
    return out


__all__ = [
    "EMBEDDED_MARKER",
    "INLINE_MARKER",
    "is_inline_request",
    "is_routed_view",
    "island_flags",
    "seed_state",
    "split_route",
]
