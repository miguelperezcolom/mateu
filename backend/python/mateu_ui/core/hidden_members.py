"""Members hidden for the render in flight (Java's ``VisibilitySupplier.isHidden``): a
MasterDetailView hides the detail parts that are not selected. Per request, in a ContextVar."""

from __future__ import annotations

from contextlib import contextmanager
from contextvars import ContextVar
from typing import Iterator

_hidden: ContextVar[frozenset[str]] = ContextVar("mateu_hidden_members", default=frozenset())


def is_hidden(name: str) -> bool:
    return name in _hidden.get()


@contextmanager
def hiding(names) -> Iterator[None]:
    token = _hidden.set(frozenset(names))
    try:
        yield
    finally:
        _hidden.reset(token)


__all__ = ["hiding", "is_hidden"]
