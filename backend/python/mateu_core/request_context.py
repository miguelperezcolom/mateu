"""The request in flight, as a ``ContextVar``.

The engine objects (``SyncHandler``, ``ReflectionMapper``) are singletons shared by every request,
and the providers a developer plugs in (identity, secrets) are parameterless by the port's idiom —
``identity_provider()`` rather than Java's ``HttpRequest``-taking ``Authorizer``. So the request
those providers need has to come from somewhere that is NOT the singleton: a ``ContextVar`` set by
the framework adapter around each request. A ContextVar is per-thread AND per-task, so two
concurrent requests — in the threadpool or on the event loop — never see each other's headers.

    with bound_request(MateuRequest(headers=..., base_url=...)):
        handler.handle(rq)

    # anywhere below, e.g. in an identity provider:
    token = bearer_token()
"""

from __future__ import annotations

from collections.abc import Iterator, Mapping
from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass, field
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from mateu_uidl import Identity


@dataclass(frozen=True)
class MateuRequest:
    """What an adapter knows about the request in flight. ``headers`` keys are lower-cased."""

    headers: Mapping[str, str] = field(default_factory=dict)
    base_url: str | None = None
    #: A per-request id, echoed in error messages and logs so a user report can be traced.
    correlation_id: str | None = None
    #: The identity the hosting framework AUTHENTICATED (e.g. Starlette's AuthenticationMiddleware),
    #: or None. Trusted as is — never fill it from anything the client can forge.
    principal: Identity | None = None

    def header(self, name: str) -> str | None:
        return self.headers.get(name.lower())


_current: ContextVar[MateuRequest | None] = ContextVar("mateu_current_request", default=None)


def current_request() -> MateuRequest | None:
    """The request in flight, or None outside one (e.g. a unit test driving the handler)."""
    return _current.get()


def header(name: str) -> str | None:
    """A header of the request in flight (case-insensitive), or None."""
    rq = _current.get()
    return rq.header(name) if rq is not None else None


def bearer_token() -> str | None:
    """The Bearer token of the request in flight's ``Authorization`` header, or None."""
    value = header("authorization")
    if not value or not value.lower().startswith("bearer "):
        return None
    token = value[7:].strip()
    return token or None


@contextmanager
def bound_request(request: MateuRequest) -> Iterator[MateuRequest]:
    """Bind ``request`` as the request in flight for the duration of the block."""
    token = _current.set(request)
    try:
        yield request
    finally:
        _current.reset(token)


def normalise_headers(items) -> dict[str, str]:
    """Lower-cased header map from any (name, value) iterable or mapping."""
    pairs = items.items() if isinstance(items, Mapping) else items
    return {str(k).lower(): str(v) for k, v in pairs}
