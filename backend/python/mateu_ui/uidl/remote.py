"""Server-side resolution of micro frontends: the extension points (EXPERIMENTAL).

A ``MicroFrontend(resolve=Resolve.SERVER)`` — and every content slot — is resolved by the HOST
while it builds the response: it asks the remote on the user's behalf, in parallel with the others,
within the view's time budget, and embeds what arrives in time; what does not goes out as a plain
(client-resolved) micro frontend, or as its fallback for a content slot. These are the pieces an
application may replace or add to. The Python analogues of ``io.mateu.uidl.remote.*`` (see
``docs/specs/microfrontend-server-resolution.md``).

Discovery follows the port's idiom: a subclass of :class:`RemoteCatalogSupplier`,
:class:`RemoteIdentityStrategy` or :class:`MicroFrontendResolutionListener` found among the
sources given to ``add_mateu`` is instantiated with no arguments and used; one of
:class:`RemoteRegistry`, :class:`FragmentCacheStore` or :class:`CorrelationIdProvider` replaces
Mateu's own. ``add_mateu(...)`` options win over what is discovered.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Callable, Mapping
from dataclasses import dataclass
from enum import Enum
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:  # pragma: no cover
    from mateu_ui.core.request_context import MateuRequest


@dataclass(frozen=True)
class RemoteDescriptor:
    """Another Mateu backend this host may call on the user's behalf, registered explicitly: a
    server-resolved micro frontend only asks a url under one of these, so a UI definition can never
    make the host call anywhere else (no server-side request forgery from the definition).

    - ``id`` — a stable name (``content``, ``orders``); a content slot names its remote by id.
    - ``base_url`` — absolute http(s) base url of the remote Mateu app, or a path on this same
      server (``/_content-hub``, called at the host's own base url). A micro frontend belongs to
      the remote whose base url its own ``base_url`` is (scheme, host, port and path prefix).
    - ``timeout_ms`` — how long the host waits for a fragment of this remote when the micro
      frontend declares none; None = the global default.
    - ``identity`` — the name of the :class:`RemoteIdentityStrategy` the host calls it with;
      None = ``forward-authorization``."""

    id: str
    base_url: str
    timeout_ms: int | None = None
    identity: str | None = None


class RemoteCatalogSupplier(ABC):
    """Contributes registered remotes. The remotes passed to ``add_mateu(remotes=[...])`` win over
    a supplied one with the same id."""

    @abstractmethod
    def remotes(self) -> list[RemoteDescriptor]:  # pragma: no cover - interface
        ...


class RemoteRegistry(ABC):
    """The remotes the host may call. Mateu's own merges the suppliers and the ``add_mateu``
    remotes; an application that keeps them elsewhere (a service registry, a database) provides
    its own subclass, which replaces it."""

    @abstractmethod
    def by_id(self, id: str | None) -> RemoteDescriptor | None:  # pragma: no cover - interface
        ...

    @abstractmethod
    def for_url(self, url: str | None) -> RemoteDescriptor | None:  # pragma: no cover - interface
        ...


class RemoteIdentityStrategy(ABC):
    """How the host calls a remote on the user's behalf: the headers that carry the caller's
    identity. Mateu ships ``none`` (anonymous) and ``forward-authorization`` (the request's own
    ``Authorization`` header, sent only to registered remotes, the default). A token exchange is
    the application's: subclass this with your own :meth:`name` (Mateu never ships an OAuth
    client). Called off the request's event loop, inside the fragment's budget: it may block."""

    NONE = "none"
    FORWARD_AUTHORIZATION = "forward-authorization"

    @abstractmethod
    def name(self) -> str:  # pragma: no cover - interface
        ...

    @abstractmethod
    def headers(
        self, remote: RemoteDescriptor, request: "MateuRequest | None"
    ) -> Mapping[str, str]:  # pragma: no cover - interface
        ...


class CorrelationIdProvider(ABC):
    """The correlation id of a request, sent to every remote called for it
    (``X-Mateu-Correlation-Id``) and written in each fragment's trace. Mateu's own reads that
    header, else the trace id of a W3C ``traceparent``, else the request's own correlation id."""

    @abstractmethod
    def correlation_id(self, request: "MateuRequest | None") -> str:  # pragma: no cover
        ...


class FragmentCacheStore(ABC):
    """Where the host keeps the fragments remotes declared cacheable. Keys and values are opaque
    strings (the value is the fragment's wire JSON). Mateu's own is in memory and bounded."""

    @abstractmethod
    def get(self, key: str) -> str | None:  # pragma: no cover - interface
        ...

    @abstractmethod
    def put(self, key: str, value: str, ttl_seconds: float) -> None:  # pragma: no cover
        ...


@dataclass(frozen=True)
class FragmentCachePolicy:
    """What a REMOTE declares about caching the fragment it answers with — the remote decides,
    the host only obeys. ``vary_by``: ``none`` (never cached), ``shared`` (the same for every
    caller), ``user`` (one per caller) or ``key`` (one per opaque ``key`` the remote computes —
    callers with the same key share the entry)."""

    max_age_seconds: int
    vary_by: str = "user"
    key: str | None = None

    NONE = "none"
    SHARED = "shared"
    USER = "user"
    KEY = "key"

    @staticmethod
    def none() -> "FragmentCachePolicy":
        return FragmentCachePolicy(0, "none", None)

    @staticmethod
    def shared(max_age_seconds: int) -> "FragmentCachePolicy":
        return FragmentCachePolicy(max_age_seconds, "shared", None)

    @staticmethod
    def per_user(max_age_seconds: int) -> "FragmentCachePolicy":
        return FragmentCachePolicy(max_age_seconds, "user", None)

    @staticmethod
    def by_key(key: str, max_age_seconds: int) -> "FragmentCachePolicy":
        return FragmentCachePolicy(max_age_seconds, "key", key)


class FragmentCachePolicySupplier(ABC):
    """Implemented by a view other hosts embed to say whether they may cache it — the dynamic twin
    of :func:`cacheable_fragment`, and it wins over it. A view may also just define a
    ``fragment_cache_policy(request)`` method."""

    @abstractmethod
    def fragment_cache_policy(
        self, request: "MateuRequest | None"
    ) -> FragmentCachePolicy | None:  # pragma: no cover - interface
        ...


def cacheable_fragment(max_age_seconds: int, vary_by: str = "user") -> Callable[[type], type]:
    """Class-level: a view other hosts embed (resolving it in their server) may be cached by them
    for ``max_age_seconds``, varying by ``vary_by`` (``shared``, ``user`` or ``none``; a per-caller
    ``key`` needs ``fragment_cache_policy``). The Python analogue of Java's
    ``@CacheableFragment``."""

    def deco(cls: type) -> type:
        setattr(cls, "__mateu_cacheable_fragment__", FragmentCachePolicy(max_age_seconds, vary_by, None))
        return cls

    return deco


class ResolutionOutcome(Enum):
    """What came of one server-resolved micro frontend."""

    #: The remote answered in time: embedded in the response.
    EMBEDDED = "EMBEDDED"
    #: Embedded from the host's cache, as the remote allowed.
    FROM_CACHE = "FROM_CACHE"
    #: The remote did not answer within the budget; the call was cancelled.
    TIMEOUT = "TIMEOUT"
    #: The remote failed or answered an error.
    ERROR = "ERROR"
    #: The remote answered with nothing to show (an empty content slot).
    EMPTY = "EMPTY"


@dataclass(frozen=True)
class MicroFrontendResolutionEvent:
    """What happened to one micro frontend the host tried to resolve. ``degraded_to`` is
    ``client``, ``fallback`` or ``nothing`` when it was not embedded, None when it was."""

    remote_id: str | None
    url: str | None
    slot_key: str | None
    duration_millis: int
    outcome: ResolutionOutcome
    degraded_to: str | None
    correlation_id: str | None
    error: str | None = None

    Outcome = ResolutionOutcome


class MicroFrontendResolutionListener(ABC):
    """Hears every micro frontend the host resolves (or fails to) — to feed metrics or traces.
    Mateu already logs each one (logger ``mateu_ui.microfrontends``)."""

    @abstractmethod
    def on_resolution(self, event: MicroFrontendResolutionEvent) -> None:  # pragma: no cover
        ...


def policy_of(candidate: Any, request: "MateuRequest | None") -> FragmentCachePolicy | None:
    """The cache policy a view declares: ``fragment_cache_policy(request)`` > ``@cacheable_fragment``."""
    if candidate is None:
        return None
    method = getattr(candidate, "fragment_cache_policy", None)
    if callable(method) and not isinstance(candidate, type):
        return method(request)
    declared = getattr(candidate if isinstance(candidate, type) else type(candidate),
                       "__mateu_cacheable_fragment__", None)
    return declared if isinstance(declared, FragmentCachePolicy) else None


__all__ = [
    "CorrelationIdProvider",
    "FragmentCachePolicy",
    "FragmentCachePolicySupplier",
    "FragmentCacheStore",
    "MicroFrontendResolutionEvent",
    "MicroFrontendResolutionListener",
    "RemoteCatalogSupplier",
    "RemoteDescriptor",
    "RemoteIdentityStrategy",
    "RemoteRegistry",
    "ResolutionOutcome",
    "cacheable_fragment",
]
