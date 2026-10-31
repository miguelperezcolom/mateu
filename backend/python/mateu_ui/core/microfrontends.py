"""Server-side resolution of micro frontends and content slots (EXPERIMENTAL).

The Python port of Java's ``io.mateu.core.application.microfrontends`` (the source of truth; see
``docs/specs/microfrontend-server-resolution.md``). While the host builds a response, the micro
frontends declared ``resolve=Resolve.SERVER`` (and the content slots) are resolved:

1. each must be under a registered remote (:class:`~mateu_ui.uidl.RemoteRegistry`): if not, that
   is a configuration error — the response fails through the error boundary and nothing is asked
   (no server-side request forgery from a UI definition). A content slot whose remote is not
   registered just paints its fallback;
2. the budget is the largest effective timeout among them (own > remote's > default), capped by
   ``max_budget_ms``; each call waits min(own, budget), they run in PARALLEL and a call past its
   deadline is CANCELLED (its socket closed);
3. each call carries the caller's identity as its remote's identity strategy says, and the
   correlation id (``X-Mateu-Correlation-Id``);
4. a remote may declare its answer cacheable (``fragmentCache``); the host obeys;
5. every fragment leaves one log line (logger ``mateu_ui.microfrontends``) and is told to the
   resolution listeners.

Resolving is not absorbing: the embedded answer keeps the micro frontend's base url, route and type,
and the renderer sends everything after the first paint to the remote.

The handler is synchronous (it runs in the adapter's threadpool), so the resolution — asyncio —
runs on an event loop of its own (:func:`run_coroutine`). The HTTP client is a minimal asyncio one
(stdlib only): cancelling the coroutine closes the socket, which is what makes a deadline real.
"""

from __future__ import annotations

import asyncio
import contextvars
import hashlib
import json
import logging
import os
import re
import ssl
import threading
import time
import urllib.parse
import uuid
from collections import OrderedDict
from collections.abc import Callable, Coroutine, Iterable, Mapping
from concurrent.futures import ThreadPoolExecutor
from contextvars import ContextVar
from dataclasses import dataclass
from typing import Any

from pydantic import BaseModel

from mateu_ui.uidl.remote import (
    CorrelationIdProvider,
    FragmentCachePolicy,
    FragmentCacheStore,
    MicroFrontendResolutionEvent,
    MicroFrontendResolutionListener,
    RemoteCatalogSupplier,
    RemoteDescriptor,
    RemoteIdentityStrategy,
    RemoteRegistry,
    ResolutionOutcome,
    policy_of,
)

TRACE = logging.getLogger("mateu_ui.microfrontends")

#: The header carrying the correlation id to the remotes.
CORRELATION_HEADER = "X-Mateu-Correlation-Id"
#: The header carrying the keys of a url the host holds (see ``FragmentCachePolicy.KEY``).
FRAGMENT_KEYS_HEADER = "X-Mateu-Fragment-Keys"
#: The reserved action answering the application's content slot descriptor.
CONTENT_SLOTS_ACTION = "__content_slots__"
CONTENT_SLOTS_KEY = "_contentSlots"

_MAX_KNOWN_KEYS = 16


# ── settings ──────────────────────────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class MicroFrontendSettings:
    """The knobs of server-side resolution (Java's ``MicroFrontendSettings``)."""

    default_timeout_ms: int = 500
    max_budget_ms: int = 2000
    content_remote_id: str = "content"
    content_route: str = "/content-slots/{key}"
    #: This server's own base url (``http://host:port``), for a remote registered as a path on it.
    self_base_url: str | None = None

    def content_route_for(self, key: str | None) -> str:
        return self.content_route.replace("{key}", key or "")

    @staticmethod
    def from_env(**overrides: Any) -> "MicroFrontendSettings":
        """The settings from the ``add_mateu`` options, else the environment
        (``MATEU_MICROFRONTENDS_DEFAULT_TIMEOUT_MS``, ``MATEU_MICROFRONTENDS_MAX_BUDGET_MS``,
        ``MATEU_CONTENT_SLOTS_REMOTE``, ``MATEU_CONTENT_SLOTS_ROUTE``, ``MATEU_SELF_BASE_URL``),
        else the defaults."""

        def pick(name: str, env: str, kind):
            value = overrides.get(name)
            if value is None:
                value = os.environ.get(env, "").strip() or None
            if value is None:
                return None
            if kind is int:
                try:
                    parsed = int(value)
                except (TypeError, ValueError):
                    return None
                return parsed if parsed > 0 else None
            text = str(value).strip()
            return text or None

        defaults = MicroFrontendSettings()
        return MicroFrontendSettings(
            default_timeout_ms=pick("default_timeout_ms", "MATEU_MICROFRONTENDS_DEFAULT_TIMEOUT_MS", int)
            or defaults.default_timeout_ms,
            max_budget_ms=pick("max_budget_ms", "MATEU_MICROFRONTENDS_MAX_BUDGET_MS", int)
            or defaults.max_budget_ms,
            content_remote_id=pick("content_remote_id", "MATEU_CONTENT_SLOTS_REMOTE", str)
            or defaults.content_remote_id,
            content_route=pick("content_route", "MATEU_CONTENT_SLOTS_ROUTE", str) or defaults.content_route,
            self_base_url=_sane_self_base_url(pick("self_base_url", "MATEU_SELF_BASE_URL", str)),
        )


def _sane_self_base_url(value: str | None) -> str | None:
    """An origin (``http(s)://host[:port]``, no path, no user info), else None."""
    if not value:
        return None
    try:
        parts = urllib.parse.urlsplit(value.strip().rstrip("/"))
    except ValueError:
        return None
    if parts.scheme.lower() not in ("http", "https") or not parts.hostname or "@" in parts.netloc:
        return None
    if parts.path or parts.query or parts.fragment:
        return None
    return f"{parts.scheme.lower()}://{parts.netloc}"


# ── what the mappers leave for the resolver ───────────────────────────────────────────────────


@dataclass(frozen=True)
class ServerResolution:
    """What the host needs to resolve a micro frontend while it builds the view (Java's
    ``ServerResolutionDto``). Server side only: it rides a private attribute, never the wire."""

    timeout_ms: int | None = None
    #: The registered remote it is meant for when it names one (a content slot); None = the remote
    #: its base url belongs to.
    remote_id: str | None = None
    slot_key: str | None = None
    #: What replaces it when it is not embedded and must not degrade to the client; None = nothing.
    fallback: Any | None = None
    degrade_to_client: bool = True


_pending: ContextVar[list | None] = ContextVar("mateu_microfrontends_pending", default=None)


def mark_pending() -> None:
    """Called by the mappers that emit something to resolve: a response without any is never
    walked for them."""
    holder = _pending.get()
    if holder is not None:
        holder[0] = True


def begin_pending() -> tuple[list, contextvars.Token]:
    holder = [False]
    return holder, _pending.set(holder)


def end_pending(token: contextvars.Token) -> None:
    _pending.reset(token)


def micro_frontend_id(base_url: str | None, route: str | None, consumed_route: str | None,
                      server_side_type: str | None) -> str:
    """The id of the context a renderer hosts a micro frontend in — the same formula as the web's
    ``microFrontendUxId`` and Redwood's ``microFrontendOf``."""
    joined = "|".join("" if part is None else str(part)
                      for part in (base_url, route, consumed_route, server_side_type))
    return "mfe_" + re.sub(r"[^a-zA-Z0-9]", "_", joined)


def slot_component_id(key: str | None) -> str:
    return "slot_" + re.sub(r"[^a-zA-Z0-9]", "_", key or "")


# ── remote registry ───────────────────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class _Url:
    scheme: str | None
    host: str | None
    port: int | None
    path: str


def _parse(url: str | None) -> _Url | None:
    """An absolute http(s) url without user info, or a path on this server (``/x``), normalised;
    None otherwise (Java's ``DefaultRemoteRegistry.parse``)."""
    if url is None or not str(url).strip():
        return None
    text = str(url).strip()
    try:
        parts = urllib.parse.urlsplit(text)
    except ValueError:
        return None
    if not parts.scheme and not parts.netloc:
        path = parts.path
        if path.startswith("/") and not path.startswith("//") and ".." not in path:
            return _Url(None, None, None, _normalise_path(path))
        return None
    scheme = parts.scheme.lower()
    if scheme not in ("http", "https") or not parts.hostname or "@" in parts.netloc:
        return None
    if ".." in parts.path:
        return None
    try:
        port = parts.port
    except ValueError:
        return None
    return _Url(scheme, parts.hostname.lower(), port if port is not None else (443 if scheme == "https" else 80),
                _normalise_path(parts.path))


def _normalise_path(path: str) -> str:
    path = re.sub(r"/{2,}", "/", path or "")
    segments = [s for s in path.split("/") if s != "."]
    return "/".join(segments)


def _owns(base: _Url, target: _Url) -> bool:
    if base.scheme is None or target.scheme is None:
        if base.scheme is not None or target.scheme is not None:
            return False
    elif base.scheme != target.scheme or base.host != target.host or base.port != target.port:
        return False
    base_path = base.path[:-1] if base.path.endswith("/") else base.path
    target_path = target.path[:-1] if target.path.endswith("/") else target.path
    return target_path == base_path or target_path.startswith(base_path + "/")


class DefaultRemoteRegistry(RemoteRegistry):
    """Mateu's own registry: the remotes the :class:`RemoteCatalogSupplier` subclasses return, with
    the ones passed to ``add_mateu(remotes=[...])`` on top (same id = the explicit one wins). A url
    belongs to a remote when it has the same scheme, host and port and its path is the remote's or
    under it (``https://a.com/x`` owns ``https://a.com/x/y``, not ``https://a.com/xy``)."""

    def __init__(self, suppliers: Iterable[RemoteCatalogSupplier] = (),
                 remotes: Iterable[RemoteDescriptor] = ()):
        self._remotes: dict[str, RemoteDescriptor] = {}
        for supplier in suppliers:
            try:
                supplied = supplier.remotes()
            except Exception as e:  # noqa: BLE001 - a broken supplier registers nothing
                TRACE.warning("A RemoteCatalogSupplier failed: %s", e)
                continue
            for remote in supplied or ():
                self._register(remote)
        for remote in remotes or ():
            self._register(remote)

    def _register(self, remote: RemoteDescriptor | None) -> None:
        if remote is None or not remote.id or not str(remote.id).strip():
            return
        if _parse(remote.base_url) is None:
            TRACE.warning(
                "Remote %s is not registered: its base url %s is neither an absolute http(s) url nor a path",
                remote.id, remote.base_url,
            )
            return
        self._remotes[remote.id] = remote

    def by_id(self, id: str | None) -> RemoteDescriptor | None:
        return self._remotes.get(id) if id else None

    def for_url(self, url: str | None) -> RemoteDescriptor | None:
        target = _parse(url)
        if target is None:
            return None
        best, best_length = None, -1
        for remote in self._remotes.values():
            base = _parse(remote.base_url)
            if base is not None and _owns(base, target) and len(base.path) > best_length:
                best, best_length = remote, len(base.path)
        return best

    def all(self) -> list[RemoteDescriptor]:
        return list(self._remotes.values())


# ── identity strategies ───────────────────────────────────────────────────────────────────────


class NoIdentity(RemoteIdentityStrategy):
    """Anonymous."""

    def name(self) -> str:
        return RemoteIdentityStrategy.NONE

    def headers(self, remote, request) -> Mapping[str, str]:
        return {}


class ForwardAuthorization(RemoteIdentityStrategy):
    """The request's own ``Authorization``, only ever to a registered remote."""

    def name(self) -> str:
        return RemoteIdentityStrategy.FORWARD_AUTHORIZATION

    def headers(self, remote, request) -> Mapping[str, str]:
        value = request.header("authorization") if request is not None else None
        return {"Authorization": value} if value and value.strip() else {}


class RemoteIdentityStrategies:
    """The strategies Mateu ships plus the application's, by name (the app's win)."""

    def __init__(self, declared: Iterable[RemoteIdentityStrategy] = ()):
        self._by_name: dict[str, RemoteIdentityStrategy] = {}
        for strategy in (NoIdentity(), ForwardAuthorization(), *declared):
            name = strategy.name() if strategy is not None else None
            if name:
                self._by_name[name] = strategy

    def of(self, remote: RemoteDescriptor) -> RemoteIdentityStrategy:
        """The strategy a remote names (``forward-authorization`` when none). An unknown name is a
        configuration error (``ValueError``)."""
        name = (remote.identity or "").strip() or RemoteIdentityStrategy.FORWARD_AUTHORIZATION
        strategy = self._by_name.get(name)
        if strategy is None:
            raise ValueError(
                f"Remote {remote.id} names the identity strategy '{name}', but no "
                "RemoteIdentityStrategy is called so"
            )
        return strategy


# ── correlation ───────────────────────────────────────────────────────────────────────────────


class DefaultCorrelationIdProvider(CorrelationIdProvider):
    """The request's ``X-Mateu-Correlation-Id`` (only a sane token), else the trace id of its W3C
    ``traceparent``, else the request's own correlation id, else a fresh one."""

    _SAFE = re.compile(r"[A-Za-z0-9._:-]{1,128}")
    _TRACEPARENT = re.compile(r"[0-9a-f]{2}-([0-9a-f]{32})-[0-9a-f]{16}-[0-9a-f]{2}")

    def correlation_id(self, request) -> str:
        if request is None:
            return str(uuid.uuid4())
        declared = request.header(CORRELATION_HEADER)
        if declared is not None and self._SAFE.fullmatch(declared.strip()):
            return declared.strip()
        traceparent = request.header("traceparent")
        if traceparent is not None:
            match = self._TRACEPARENT.fullmatch(traceparent.strip().lower())
            if match:
                return match.group(1)
        own = getattr(request, "correlation_id", None)
        if own and self._SAFE.fullmatch(own):
            return own
        return str(uuid.uuid4())


# ── cache ─────────────────────────────────────────────────────────────────────────────────────


class InMemoryFragmentCacheStore(FragmentCacheStore):
    """Mateu's own fragment cache: in memory, bounded (least recently used out), entries expire."""

    def __init__(self, capacity: int = 1000, clock: Callable[[], float] | None = None):
        self._capacity = capacity
        self._clock = clock or time.monotonic
        self._entries: OrderedDict[str, tuple[str, float]] = OrderedDict()
        self._lock = threading.Lock()

    def get(self, key: str) -> str | None:
        with self._lock:
            entry = self._entries.get(key)
            if entry is None:
                return None
            if entry[1] <= self._clock():
                del self._entries[key]
                return None
            self._entries.move_to_end(key)
            return entry[0]

    def put(self, key: str, value: str, ttl_seconds: float) -> None:
        if key is None or value is None or ttl_seconds is None or ttl_seconds <= 0:
            return
        with self._lock:
            self._entries[key] = (value, self._clock() + ttl_seconds)
            self._entries.move_to_end(key)
            while len(self._entries) > self._capacity:
                self._entries.popitem(last=False)


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


class FragmentCacheKeys:
    """The keys a remote's cacheable fragment is kept under (Java's ``FragmentCacheKeys``): the RULE
    of a url, the ENTRY (url + what it varies by), and for ``key`` the MEMO of each caller's key and
    the KNOWN keys of the url. Every key is hashed."""

    @staticmethod
    def cacheable(policy: Mapping[str, Any] | None) -> bool:
        if not isinstance(policy, Mapping):
            return False
        max_age = _int(policy.get("maxAgeSeconds"))
        vary = FragmentCacheKeys.normalised(policy.get("varyBy"))
        if max_age <= 0 or policy.get("varyBy") is None:
            return False
        key = policy.get("key")
        return vary in (FragmentCachePolicy.SHARED, FragmentCachePolicy.USER) or (
            vary == FragmentCachePolicy.KEY and isinstance(key, str) and bool(key.strip())
        )

    @staticmethod
    def normalised(vary_by: Any) -> str:
        return "" if vary_by is None else str(vary_by).strip().lower()

    @staticmethod
    def rule(url: str) -> str:
        return "mfe-rule:" + _sha256(url)

    @staticmethod
    def memo(url: str, caller: str) -> str:
        return "mfe-memo:" + _sha256(url + "\n" + caller)

    @staticmethod
    def known(url: str) -> str:
        return "mfe-keys:" + _sha256(url)

    @staticmethod
    def entry(url: str, varying: str) -> str:
        return "mfe:" + _sha256(url + "\n" + varying)

    @staticmethod
    def varying(vary_by: Any, caller: str, key: str | None) -> str | None:
        vary = FragmentCacheKeys.normalised(vary_by)
        if vary == FragmentCachePolicy.SHARED:
            return "shared"
        if vary == FragmentCachePolicy.USER:
            return "user:" + caller
        if vary == FragmentCachePolicy.KEY:
            return None if key is None else "key:" + key
        return None

    @staticmethod
    def caller(identity: Any, authorization: str | None) -> str:
        name = getattr(identity, "name", None) if identity is not None else None
        if isinstance(name, str) and name.strip():
            return "user:" + name
        if authorization and authorization.strip():
            return "token:" + _sha256(authorization)
        return "anonymous"


def _int(value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


# ── the remote side: a view declares its cache policy on its loads ────────────────────────────


def stamp_fragment_cache(increment, action_id: str | None, request, *candidates):
    """The increment with the cache policy of the first of ``candidates`` declaring one — only on a
    LOAD answer (an action's answer is never embedded by a host). When the host already holds the
    declared key (``X-Mateu-Fragment-Keys``) the answer goes without its fragments,
    ``notModified`` (Java's ``FragmentCachePolicies.stamp``)."""
    from mateu_ui.dtos import FragmentCache

    if increment is None or action_id not in (None, "", "__load__"):
        return increment
    for candidate in candidates:
        try:
            policy = policy_of(candidate, request)
        except Exception as e:  # noqa: BLE001 - a failing policy only means: not cacheable
            TRACE.warning("fragment_cache_policy failed: %s", e)
            policy = None
        if policy is None:
            continue
        key = policy.key if policy.key and policy.key.strip() else None
        vary = policy.vary_by if policy.vary_by is not None else FragmentCachePolicy.NONE
        max_age = max(0, int(policy.max_age_seconds or 0))
        if key is not None and str(vary).lower() == FragmentCachePolicy.KEY and _held_by_host(key, request):
            return increment.model_copy(update={
                "fragments": [],
                "fragment_cache": FragmentCache(max_age_seconds=max_age, vary_by=vary, key=key, not_modified=True),
            })
        return increment.model_copy(update={
            "fragment_cache": FragmentCache(max_age_seconds=max_age, vary_by=vary, key=key, not_modified=False),
        })
    return increment


def _held_by_host(key: str, request) -> bool:
    held = request.header(FRAGMENT_KEYS_HEADER) if request is not None else None
    return held is not None and any(part.strip() == key for part in held.split(","))


# ── the HTTP client ───────────────────────────────────────────────────────────────────────────


class RemoteCallError(Exception):
    """A remote answered an error, or could not be reached."""


#: Headers the caller never sets: the client owns them.
_RESTRICTED = {"host", "content-length", "connection", "transfer-encoding", "expect", "upgrade",
               "content-type", "accept", "keep-alive", "te", "trailer"}
_MAX_BODY = 16 * 1024 * 1024


class AsyncioMateuHttpClient:
    """A minimal HTTP/1.1 POST client on asyncio streams (stdlib only). Cancelling the coroutine
    closes the socket, so a deadline really stops the call."""

    async def post_json(self, url: str, payload: Any, headers: Mapping[str, str]) -> dict | None:
        """POSTs ``payload`` as JSON; the decoded JSON object answered, None for a 204/empty body;
        raises :class:`RemoteCallError` for a non-2xx answer."""
        parts = urllib.parse.urlsplit(url)
        https = parts.scheme == "https"
        host = parts.hostname or ""
        port = parts.port or (443 if https else 80)
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        target = (parts.path or "/") + (("?" + parts.query) if parts.query else "")
        host_header = host if parts.port is None else f"{host}:{parts.port}"
        if ":" in host and not host.startswith("["):
            host_header = f"[{host}]" + ("" if parts.port is None else f":{parts.port}")
        lines = [
            f"POST {target} HTTP/1.1",
            f"Host: {host_header}",
            "Content-Type: application/json",
            "Accept: application/json",
            f"Content-Length: {len(body)}",
            "Connection: close",
        ]
        for name, value in headers.items():
            if value is None or not str(value).strip():
                continue
            name, value = str(name), str(value)
            if name.lower() in _RESTRICTED or not re.fullmatch(r"[A-Za-z0-9!#$%&'*+.^_`|~-]+", name):
                continue
            if "\r" in value or "\n" in value:
                continue
            lines.append(f"{name}: {value}")
        context = ssl.create_default_context() if https else None
        reader, writer = await asyncio.open_connection(host, port, ssl=context,
                                                       server_hostname=host if https else None)
        try:
            writer.write(("\r\n".join(lines) + "\r\n\r\n").encode("latin-1") + body)
            await writer.drain()
            status_line = await reader.readline()
            fields = status_line.decode("latin-1").split()
            if len(fields) < 2 or not fields[1].isdigit():
                raise RemoteCallError(f"Not an HTTP answer from {url}")
            status = int(fields[1])
            response_headers: dict[str, str] = {}
            while True:
                line = await reader.readline()
                if line in (b"\r\n", b"\n", b""):
                    break
                name, _, value = line.decode("latin-1").partition(":")
                response_headers[name.strip().lower()] = value.strip()
            if status in (204, 304) or 100 <= status < 200:
                raw = b""
            elif "chunked" in response_headers.get("transfer-encoding", "").lower():
                raw = await _read_chunked(reader)
            elif "content-length" in response_headers:
                length = _int(response_headers["content-length"])
                if length > _MAX_BODY:
                    raise RemoteCallError(f"Answer too large from {url}")
                raw = await reader.readexactly(length)
            else:
                raw = await reader.read(_MAX_BODY + 1)
                if len(raw) > _MAX_BODY:
                    raise RemoteCallError(f"Answer too large from {url}")
        finally:
            writer.close()
            try:
                await asyncio.wait_for(writer.wait_closed(), 1.0)
            except (Exception, asyncio.CancelledError):  # noqa: BLE001 - closing is best effort
                pass
        if status < 200 or status >= 300:
            raise RemoteCallError(f"HTTP {status} from {url}")
        if status == 204 or not raw.strip():
            return None
        decoded = json.loads(raw.decode("utf-8"))
        if not isinstance(decoded, dict):
            raise RemoteCallError(f"Not a UIIncrement from {url}")
        return decoded


async def _read_chunked(reader: asyncio.StreamReader) -> bytes:
    out = bytearray()
    while True:
        size_line = await reader.readline()
        size = int(size_line.split(b";", 1)[0].strip() or b"0", 16)
        if size == 0:
            await reader.readline()
            return bytes(out)
        out += await reader.readexactly(size)
        if len(out) > _MAX_BODY:
            raise RemoteCallError("Answer too large")
        await reader.readline()


# ── the tree ──────────────────────────────────────────────────────────────────────────────────


#: What replaces a found component: REMOVE drops it.
REMOVE = object()


@dataclass
class _Found:
    container: Any  # a list or a model
    key: Any  # an index or an attribute name
    host: Any  # the ClientSideComponent
    metadata: Any  # its MicroFrontendMetadata
    server: ServerResolution


def _collect(increment) -> list[_Found]:
    from mateu_ui.dtos import ClientSideComponent, MicroFrontendMetadata

    found: list[_Found] = []
    seen: set[int] = set()

    def visit(node, container, key) -> None:
        if node is None or isinstance(node, (str, bytes, int, float, bool)):
            return
        if id(node) in seen:
            return
        seen.add(id(node))
        if isinstance(node, list):
            for i, item in enumerate(node):
                visit(item, node, i)
            return
        if isinstance(node, ClientSideComponent) and isinstance(node.metadata, MicroFrontendMetadata):
            server = node.metadata._server
            if server is not None and container is not None:
                found.append(_Found(container, key, node, node.metadata, server))
            return
        if isinstance(node, BaseModel):
            for name in type(node).model_fields:
                visit(getattr(node, name, None), node, name)

    visit(getattr(increment, "fragments", None), None, None)
    return found


def _empty_in(host):
    from mateu_ui.dtos import ClientSideComponent, DivMetadata

    return ClientSideComponent(metadata=DivMetadata(content=""), id=host.id, children=[],
                               style=host.style, css_classes=host.css_classes, slot=host.slot)


def _apply(found: list[_Found], replacements: list[Any]) -> None:
    touched: dict[int, list] = {}
    for each, replacement in zip(found, replacements):
        if isinstance(each.container, list):
            each.container[each.key] = replacement
            if replacement is REMOVE:
                touched[id(each.container)] = each.container
        elif replacement is REMOVE:
            setattr(each.container, each.key, _empty_in(each.host))
        else:
            setattr(each.container, each.key, replacement)
    for items in touched.values():
        items[:] = [item for item in items if item is not REMOVE]


# ── the resolver ──────────────────────────────────────────────────────────────────────────────


@dataclass
class _Plan:
    found: _Found
    base_url: str
    route: str
    remote: RemoteDescriptor | None
    call_base_url: str | None
    timeout_ms: int
    slot_key: str | None
    fallback: Any | None
    degrade_to_client: bool
    problem: str | None


@dataclass
class _Answer:
    increment: dict | None
    outcome: ResolutionOutcome
    error: str | None = None


class MicroFrontendServerResolver:
    """Resolves, while the host builds a response, the micro frontends declared ``SERVER`` and the
    content slots: asks their remotes in parallel, on the user's behalf, within the view's budget,
    and embeds what arrives in time. What does not goes out as it would have with ``CLIENT``, or as
    its fallback for a content slot — so it never makes a screen worse than resolving in the client.
    """

    def __init__(
        self,
        registry: RemoteRegistry | None = None,
        http: Any | None = None,
        cache: FragmentCacheStore | None = None,
        identities: RemoteIdentityStrategies | None = None,
        correlation: CorrelationIdProvider | None = None,
        listeners: Iterable[MicroFrontendResolutionListener] = (),
        settings: MicroFrontendSettings | None = None,
        callers: Callable[[Any], Any] | None = None,
    ):
        self.registry = registry or DefaultRemoteRegistry()
        self.http = http or AsyncioMateuHttpClient()
        self.cache = cache or InMemoryFragmentCacheStore()
        self.identities = identities or RemoteIdentityStrategies()
        self.correlation = correlation or DefaultCorrelationIdProvider()
        self.listeners = list(listeners)
        self.settings = settings or MicroFrontendSettings()
        #: request → the caller's Identity (its ``name`` keys per-user entries), or None.
        self.callers = callers or (lambda request: None)

    # -- entry points --

    def resolve_sync(self, increment, request=None):
        """:meth:`resolve`, from synchronous code (the handler)."""
        if increment is None or not _collect(increment):
            return increment
        return run_coroutine(lambda: self.resolve(increment, request))

    async def resolve(self, increment, request=None):
        """The increment with its server-resolved micro frontends embedded, degraded or replaced.
        A configuration error raises before anything is asked."""
        if increment is None or not _collect(increment):
            return increment
        increment = increment.model_copy(deep=True)
        found = _collect(increment)
        # planned up front: a configuration error fails the response before anything is asked
        plans = [self._plan(each, request) for each in found]
        budget = min(max(plan.timeout_ms for plan in plans), self.settings.max_budget_ms)
        correlation_id = self.correlation.correlation_id(request)
        caller = self.callers(request)
        replacements = await asyncio.gather(*(
            self._fetch(plan, min(plan.timeout_ms, budget), request, correlation_id, caller)
            for plan in plans
        ))
        await asyncio.sleep(0)  # let the cancelled calls' transports close
        _apply(found, list(replacements))
        return increment

    # -- planning --

    def _plan(self, found: _Found, request) -> _Plan:
        meta, server = found.metadata, found.server
        base_url = meta.base_url or None
        route = meta.route
        remote_id = server.remote_id
        if server.slot_key is not None:
            # a content slot: the content remote, at the route its key names
            remote_id = remote_id or self.settings.content_remote_id
            route = route or self.settings.content_route_for(server.slot_key)
        if remote_id is not None:
            remote = self.registry.by_id(remote_id)
            if remote is not None:
                # a slot names its remote: the url is built from it, the developer never writes it
                base_url = remote.base_url
        else:
            remote = self.registry.for_url(base_url)
        problem = None
        call_base_url = None
        if remote is None:
            problem = (
                f"no remote is registered as '{remote_id}'" if remote_id is not None
                else f"{base_url} is not under any registered remote"
            )
        else:
            call_base_url = self._absolute(base_url, request)
            if call_base_url is None:
                problem = (
                    f"its base url {base_url} is a path on this server and this server does not know "
                    "its own base url: set add_mateu(self_base_url=...) / MATEU_SELF_BASE_URL"
                )
        if problem is not None and server.slot_key is None:
            # a plain micro frontend that the host may not ask: a configuration error, never
            # degraded (a content slot paints its fallback instead)
            raise ValueError(
                f"Micro frontend {_describe(base_url, route)} is resolve = SERVER but {problem}"
            )
        if remote is not None:
            # an unknown identity strategy is a configuration error too — before anything is asked
            self.identities.of(remote)
        timeout = (
            server.timeout_ms if _positive(server.timeout_ms)
            else remote.timeout_ms if remote is not None and _positive(remote.timeout_ms)
            else self.settings.default_timeout_ms
        )
        return _Plan(found, base_url or "", route or "", remote, call_base_url, int(timeout or 0),
                     server.slot_key, server.fallback, server.degrade_to_client, problem)

    def _absolute(self, base_url: str | None, request) -> str | None:
        if base_url is None:
            return None
        if base_url.startswith(("http://", "https://")):
            return base_url
        own = self.settings.self_base_url or _sane_self_base_url(getattr(request, "self_base_url", None))
        if own is None:
            return None
        return own.rstrip("/") + (base_url if base_url.startswith("/") else "/" + base_url)

    # -- one call --

    async def _fetch(self, plan: _Plan, timeout_ms: int, request, correlation_id: str, caller) -> Any:
        started = time.monotonic()
        if plan.problem is not None:
            # only a content slot gets here: its remote is not configured, the screen stands
            return self._fallback(plan, started, ResolutionOutcome.ERROR, correlation_id, plan.problem)
        try:
            answer = await asyncio.wait_for(
                self._attempt(plan, request, correlation_id, caller), timeout_ms / 1000.0
            )
        except asyncio.TimeoutError:
            return self._degrade(plan, started, ResolutionOutcome.TIMEOUT, correlation_id, None)
        except asyncio.CancelledError:
            raise
        except Exception as error:  # noqa: BLE001 - a failing remote degrades, never fails the page
            return self._degrade(plan, started, ResolutionOutcome.ERROR, correlation_id, _message_of(error))
        if answer.outcome is ResolutionOutcome.ERROR:
            return self._degrade(plan, started, ResolutionOutcome.ERROR, correlation_id, answer.error)
        if plan.slot_key is not None and _is_empty(answer.increment):
            return self._degrade(plan, started, ResolutionOutcome.EMPTY, correlation_id, None)
        self._trace(plan, started, answer.outcome, None, correlation_id, None)
        return self._with_metadata(plan, resolved=_embeddable(answer.increment))

    async def _attempt(self, plan: _Plan, request, correlation_id: str, caller) -> _Answer:
        remote = plan.remote
        assert remote is not None and plan.call_base_url is not None  # a planned call has both
        strategy = self.identities.of(remote)
        # a strategy may block (a token exchange): never on the event loop
        ctx = contextvars.copy_context()
        supplied: Any = await asyncio.get_running_loop().run_in_executor(
            None, lambda: ctx.run(strategy.headers, remote, request))
        identity_headers: dict[str, str] = dict(supplied or {})
        authorization = next((v for k, v in identity_headers.items() if k.lower() == "authorization"), None)
        caller_key = FragmentCacheKeys.caller(caller, authorization)
        url = self._url_of(plan)
        cached = self._cached(url, caller_key)
        if cached is not None:
            return _Answer(cached, ResolutionOutcome.FROM_CACHE)
        headers = dict(identity_headers)
        headers[CORRELATION_HEADER] = correlation_id
        known = self.cache.get(FragmentCacheKeys.known(url))
        if known and known.strip():
            headers[FRAGMENT_KEYS_HEADER] = known
        endpoint = plan.call_base_url.rstrip("/") + "/mateu/v3/sync" + _route_path(plan.route)
        answer = await self.http.post_json(endpoint, self._request_for(plan), headers)
        return self._received(url, caller_key, answer or _empty_increment())

    def _request_for(self, plan: _Plan) -> dict:
        """The load the host sends to the remote AS the island the renderer will host it in."""
        meta = plan.found.metadata
        app_state = meta.app_state if isinstance(meta.app_state, Mapping) else {}
        return {
            "actionId": meta.action_id or "",
            "route": plan.route or "",
            "consumedRoute": meta.consumed_route,
            "serverSideType": meta.server_side_type,
            "appState": {str(k): v for k, v in app_state.items()},
            "componentState": {},
            "parameters": {},
            "initiatorComponentId": micro_frontend_id(plan.base_url, plan.route, meta.consumed_route,
                                                      meta.server_side_type),
        }

    # -- cache --

    def _cached(self, url: str, caller_key: str) -> dict | None:
        rule = self.cache.get(FragmentCacheKeys.rule(url))
        if rule is None:
            return None
        key = None
        if rule == FragmentCachePolicy.KEY:
            key = self.cache.get(FragmentCacheKeys.memo(url, caller_key))
            if key is None:
                return None
        varying = FragmentCacheKeys.varying(rule, caller_key, key)
        return None if varying is None else _read(self.cache.get(FragmentCacheKeys.entry(url, varying)))

    def _received(self, url: str, caller_key: str, answer: dict) -> _Answer:
        policy = answer.get("fragmentCache")
        if isinstance(policy, Mapping) and policy.get("notModified"):
            # "use yours": the host offered this key, the entry must still be there
            key = policy.get("key")
            mine = None if key is None else _read(self.cache.get(FragmentCacheKeys.entry(url, "key:" + str(key))))
            if mine is None:
                return _Answer(None, ResolutionOutcome.ERROR, "remote answered not-modified for a key not held")
            self._remember(url, caller_key, policy, None)
            return _Answer(mine, ResolutionOutcome.FROM_CACHE)
        embeddable = _embeddable(answer)
        if FragmentCacheKeys.cacheable(policy):
            self._remember(url, caller_key, policy, embeddable)  # type: ignore[arg-type]
        return _Answer(embeddable, ResolutionOutcome.EMBEDDED)

    def _remember(self, url: str, caller_key: str, policy: Mapping[str, Any], fragment: dict | None) -> None:
        ttl = _int(policy.get("maxAgeSeconds"))
        vary = FragmentCacheKeys.normalised(policy.get("varyBy"))
        key = policy.get("key")
        self.cache.put(FragmentCacheKeys.rule(url), vary, ttl)
        if vary == FragmentCachePolicy.KEY and key is not None:
            self.cache.put(FragmentCacheKeys.memo(url, caller_key), str(key), ttl)
            known = [str(key)]
            before = self.cache.get(FragmentCacheKeys.known(url))
            for each in (before or "").split(","):
                each = each.strip()
                if each and each not in known and len(known) < _MAX_KNOWN_KEYS:
                    known.append(each)
            self.cache.put(FragmentCacheKeys.known(url), ",".join(known), ttl)
        if fragment is not None:
            varying = FragmentCacheKeys.varying(vary, caller_key, None if key is None else str(key))
            if varying is not None:
                self.cache.put(FragmentCacheKeys.entry(url, varying), json.dumps(fragment), ttl)

    def _url_of(self, plan: _Plan) -> str:
        """What identifies the fragment for caching: everything the load sends."""
        meta = plan.found.metadata
        base = plan.call_base_url or plan.base_url or ""
        route = plan.route or ""
        parts = []
        if meta.server_side_type:
            parts.append("type=" + meta.server_side_type)
        if meta.consumed_route is not None:
            parts.append("consumed=" + meta.consumed_route)
        if meta.action_id and meta.action_id.strip():
            parts.append("action=" + meta.action_id)
        if meta.app_state is not None:
            parts.append("appState=" + json.dumps(meta.app_state, sort_keys=True, default=str))
        return base.rstrip("/") + _route_path(route) + ("#" + "&".join(parts) if parts else "")

    # -- outcomes --

    def _with_metadata(self, plan: _Plan, resolved: dict | None):
        meta = plan.found.metadata.model_copy(update={
            "base_url": plan.base_url, "route": plan.route, "resolved": resolved,
        })
        meta._server = None
        return plan.found.host.model_copy(update={"metadata": meta})

    def _degrade(self, plan: _Plan, started: float, outcome: ResolutionOutcome, correlation_id: str,
                 error: str | None):
        if plan.degrade_to_client:
            self._trace(plan, started, outcome, "client", correlation_id, error)
            return self._with_metadata(plan, resolved=None)
        return self._fallback(plan, started, outcome, correlation_id, error)

    def _fallback(self, plan: _Plan, started: float, outcome: ResolutionOutcome, correlation_id: str,
                  error: str | None):
        if plan.fallback is not None:
            self._trace(plan, started, outcome, "fallback", correlation_id, error)
            return plan.fallback
        self._trace(plan, started, outcome, "nothing", correlation_id, error)
        return REMOVE

    def _trace(self, plan: _Plan, started: float, outcome: ResolutionOutcome, degraded_to: str | None,
               correlation_id: str, error: str | None) -> None:
        event = MicroFrontendResolutionEvent(
            remote_id=plan.remote.id if plan.remote is not None else None,
            url=self._url_of(plan) if plan.call_base_url is not None else _describe(plan.base_url, plan.route),
            slot_key=plan.slot_key,
            duration_millis=int((time.monotonic() - started) * 1000),
            outcome=outcome,
            degraded_to=degraded_to,
            correlation_id=correlation_id,
            error=error,
        )
        if outcome is ResolutionOutcome.ERROR:
            TRACE.warning(
                "micro frontend remote=%s url=%s slot=%s outcome=%s degradedTo=%s ms=%s correlationId=%s error=%s",
                event.remote_id, event.url, event.slot_key, event.outcome.value, event.degraded_to,
                event.duration_millis, event.correlation_id, event.error,
            )
        else:
            TRACE.info(
                "micro frontend remote=%s url=%s slot=%s outcome=%s degradedTo=%s ms=%s correlationId=%s",
                event.remote_id, event.url, event.slot_key, event.outcome.value, event.degraded_to,
                event.duration_millis, event.correlation_id,
            )
        for listener in self.listeners:
            try:
                listener.on_resolution(event)
            except Exception as e:  # noqa: BLE001 - a listener never breaks the page
                TRACE.warning("A MicroFrontendResolutionListener failed: %s", e)


def _empty_increment() -> dict:
    return {"commands": [], "messages": [], "fragments": []}


def _embeddable(answer: dict | None) -> dict | None:
    """The remote's answer as embedded: its fragments (and the REST sources they name), nothing
    that would act on the HOST's page — commands, messages, banners and app state/data are the
    host's."""
    if answer is None:
        return None
    from mateu_ui.dtos import WIRE_VERSION

    out: dict[str, Any] = {
        "commands": [],
        "messages": [],
        "fragments": list(answer.get("fragments") or []),
        "banners": [],
        "appendBanners": False,
        "appData": None,
        "appState": None,
        "wireVersion": answer.get("wireVersion") or WIRE_VERSION,
    }
    if answer.get("restSources"):
        out["restSources"] = answer["restSources"]
    return out


def _is_empty(increment: dict | None) -> bool:
    if increment is None:
        return True
    return not any(isinstance(f, Mapping) and f.get("component") is not None
                   for f in increment.get("fragments") or [])


def _read(text: str | None) -> dict | None:
    if text is None:
        return None
    try:
        value = json.loads(text)
    except ValueError:
        return None
    return value if isinstance(value, dict) else None


def _route_path(route: str | None) -> str:
    route = route or ""
    return route if route.startswith("/") or route == "" else "/" + route


def _positive(value: Any) -> bool:
    return isinstance(value, int) and value > 0


def _describe(base_url: str | None, route: str | None) -> str:
    return (base_url or "") + (route or "")


def _message_of(error: BaseException) -> str:
    cause = error
    while cause.__cause__ is not None and cause.__cause__ is not cause:
        cause = cause.__cause__
    text = str(cause)
    return type(cause).__name__ + (": " + text if text else "")


_executor_lock = threading.Lock()
_executor: ThreadPoolExecutor | None = None


def run_coroutine(factory: Callable[[], Coroutine[Any, Any, Any]]) -> Any:
    """Runs a coroutine to completion from synchronous code: on a fresh event loop, or — when this
    thread already runs one — on a fresh loop in a helper thread, the context variables carried."""
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(factory())
    global _executor
    with _executor_lock:
        if _executor is None:
            _executor = ThreadPoolExecutor(max_workers=8, thread_name_prefix="mateu-mfe")
    ctx = contextvars.copy_context()
    return _executor.submit(ctx.run, lambda: asyncio.run(factory())).result()


# ── content slots: key validation and the descriptor ──────────────────────────────────────────

#: ``application.screen.name`` (more segments allowed): lower case letters and digits,
#: dash-separated words, dot-separated, at least three segments.
CONTENT_SLOT_KEY = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*){2,}")


class ContentSlotKeyError(ValueError):
    """A content slot key that is malformed or used twice — the port's twin of Java's compile
    error: raised when the view is registered (at startup)."""


@dataclass(frozen=True)
class ContentSlotDeclaration:
    key: str
    declared_in: str
    field: str
    route: str | None
    fallback: str
    description: str
    timeout_ms: int
    degrade_to_client: bool

    def descriptor(self) -> dict:
        segments = self.key.split(".")
        out: dict[str, Any] = {
            "key": self.key,
            "application": segments[0],
            "screen": ".".join(segments[1:-1]),
            "name": segments[-1],
            "declaredIn": self.declared_in,
            "field": self.field,
        }
        if self.route is not None:
            out["route"] = self.route
        out.update({
            "fallback": self.fallback,
            "description": self.description,
            "timeoutMs": self.timeout_ms,
            "degradeToClient": self.degrade_to_client,
        })
        return out


def content_slots_of(cls: type) -> list[ContentSlotDeclaration]:
    """The ``ContentSlot``-marked fields DECLARED by ``cls`` itself (an inherited one belongs to the
    base that declares it). Raises :class:`ContentSlotKeyError` for a malformed key."""
    from typing import get_args

    from mateu_ui.uidl.markers import ContentSlot

    from .reflection import _local_hints

    try:
        hints = _local_hints(cls)
    except Exception:  # noqa: BLE001 - not a class with readable annotations
        return []
    out = []
    for name, hint in hints.items():
        marker = next((m for m in getattr(hint, "__metadata__", ()) if isinstance(m, ContentSlot)), None)
        if marker is None:
            for arg in get_args(hint):
                marker = next((m for m in getattr(arg, "__metadata__", ()) if isinstance(m, ContentSlot)), None)
                if marker is not None:
                    break
        if marker is None:
            continue
        declared_in = f"{cls.__module__}.{cls.__qualname__}"
        if not isinstance(marker.key, str) or not CONTENT_SLOT_KEY.fullmatch(marker.key):
            raise ContentSlotKeyError(
                f"ContentSlot key '{marker.key}' on {declared_in}.{name} is not application.screen.name "
                "(lower case letters, digits and dashes, dot-separated, at least three segments)"
            )
        route = cls.__dict__.get("__mateu_ui__")
        out.append(ContentSlotDeclaration(
            key=marker.key, declared_in=declared_in, field=name,
            route=route if isinstance(route, str) else None,
            fallback=marker.fallback or "", description=marker.description or "",
            timeout_ms=int(marker.timeout_ms or 0), degrade_to_client=bool(marker.degrade_to_client),
        ))
    return out


def content_slot_descriptor(slots: Iterable[ContentSlotDeclaration]) -> dict:
    """``{version: 1, slots: [...], duplicates: []}`` — duplicates never reach it here: a repeated
    key fails at registration."""
    return {"version": 1, "slots": [slot.descriptor() for slot in slots], "duplicates": []}


__all__ = [
    "AsyncioMateuHttpClient",
    "CONTENT_SLOTS_ACTION",
    "ContentSlotDeclaration",
    "ContentSlotKeyError",
    "DefaultCorrelationIdProvider",
    "DefaultRemoteRegistry",
    "FragmentCacheKeys",
    "InMemoryFragmentCacheStore",
    "MicroFrontendServerResolver",
    "MicroFrontendSettings",
    "RemoteCallError",
    "RemoteIdentityStrategies",
    "ServerResolution",
    "micro_frontend_id",
    "stamp_fragment_cache",
]
