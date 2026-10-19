"""Live UI push (phase C): an MCP caller sends UI to a UI that is OPEN in a browser tab or an app
window — the Python twin of Java's ``io.mateu.core.application.agentpush``. The contract is
``conformance/mcp/README.md`` ("Live UI push") and ``conformance/mcp/push.json``.

Two halves meet here:

- the UI side — the app-level actions ``_agent-channel`` (an SSE stream: the session's status,
  then one increment per message), ``_agent-pair`` (a one-time pairing code) and ``_agent-unpair``,
  all with ``parameters: {sessionId, secret}``;
- the agent side — the MCP tools ``mateu_list_sessions``, ``mateu_pair_session``,
  ``mateu_push_ui``, ``mateu_navigate`` and ``mateu_dispatch_event`` (:func:`call_tool`).

:class:`AgentSessions` is the in-memory registry both halves share: process-wide for one app
(``add_mateu`` keeps one per handler), thread-safe (the sync handler runs in Starlette's
threadpool, the streams on the event loop), bounded (``max_sessions``), and forgetful (a session
whose stream ended is dropped, pairings included, ``DISCONNECTED_TTL_SECONDS`` later). Nothing is
persisted: a restart forgets every session, and the UIs simply reconnect and pair again.

Every refusal is a :class:`~mateu_ui.uidl.UserFacingException` — shown as written, both by the
sync endpoint's error boundary and by the MCP tool error text.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
import re
import secrets
import threading
import time
from collections import deque
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from mateu_ui.uidl import UserFacingException

log = logging.getLogger("mateu.agentpush")

# ── The app-level actions ────────────────────────────────────────────────────────────────────
CHANNEL_ACTION = "_agent-channel"
PAIR_ACTION = "_agent-pair"
UNPAIR_ACTION = "_agent-unpair"
ACTIONS = frozenset({CHANNEL_ACTION, PAIR_ACTION, UNPAIR_ACTION})
#: The data key ``_agent-pair`` / ``_agent-unpair`` answer under.
PAIRING_KEY = "_agentPairing"
#: The wire command every channel message rides on.
COMMAND_TYPE = "AgentPush"

# ── Fixed limits (README "Switches") ─────────────────────────────────────────────────────────
DEFAULT_RATE_PER_MINUTE = 30
DEFAULT_MAX_SESSIONS = 1000
CODE_TTL_SECONDS = 300
DISCONNECTED_TTL_SECONDS = 120
MAX_FAILED_PAIRINGS = 10
WINDOW_SECONDS = 60
CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
CODE_LENGTH = 8
MAX_RENDERER_LENGTH = 32
MAX_DETAIL_BYTES = 65536
#: The header a caller with no principal identifies itself with (what the sidecar sends).
AGENT_KEY_HEADER = "x-mateu-agent-key"
MIN_AGENT_KEY_LENGTH = 16
#: The label of a paired caller that has no principal name.
ANONYMOUS_LABEL = "an agent"

TARGETS = ("content", "drawer", "dialog")
EVENT_NAME = re.compile(r"^[A-Za-z][A-Za-z0-9_.:-]{0,63}$")
STATUS_EVENT = "mateu-agent-status"
RENDER_EVENT = "render-screen"
NAVIGATE_EVENT = "navigation-requested"
RESERVED_EVENTS = frozenset({RENDER_EVENT, NAVIGATE_EVENT, "close-requested", STATUS_EVENT})

# ── The texts (push.json "errors" / "reasons") ───────────────────────────────────────────────
DISABLED = "Live UI push is not enabled."
CHANNEL_REFUSED = "This UI session belongs to another channel."
TOO_MANY_SESSIONS = "Too many live UI sessions; try again later."
RATE_LIMITED = "Too many messages to this session; try again in a minute."
INVALID_CODE = "Invalid or expired pairing code."
TOO_MANY_ATTEMPTS = "Too many pairing attempts; try again in a minute."
DETAIL_TOO_LARGE = f"The detail is larger than the {MAX_DETAIL_BYTES}-byte limit."
HAS_ERRORS = "The definition has errors; nothing was sent."
NOT_A_PAGE = "Only a page (a component, or a layout: envelope) can be pushed."

#: The MCP tools this module answers (listed only when push is on).
TOOL_NAMES = (
    "mateu_list_sessions",
    "mateu_pair_session",
    "mateu_push_ui",
    "mateu_navigate",
    "mateu_dispatch_event",
)

_ANONYMOUS_PAIRING = "anonymous"


def unknown_session(handle: str) -> str:
    return f'Unknown session "{handle}".'


def not_connected(handle: str) -> str:
    return f'Session "{handle}" is not connected.'


def invalid_target(target: str) -> str:
    return f'Invalid target "{target}": use content, drawer or dialog.'


def invalid_event(event: str) -> str:
    return f'Invalid event name "{event}".'


def reserved_event(event: str) -> str:
    return f'Event "{event}" is reserved: use mateu_push_ui or mateu_navigate.'


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def message(kind: str, event: str, detail: Any) -> dict[str, Any]:
    """One channel message: the ``data`` of an ``AgentPush`` command."""
    return {"kind": kind, "event": event, "detail": detail}


# ── Who is calling ───────────────────────────────────────────────────────────────────────────
@dataclass(frozen=True)
class Caller:
    """An MCP caller: ``key`` is ``user:<name>`` for a signed-in principal, ``key:<sha256>`` for an
    agent key, None for an anonymous caller; ``principal`` is the signed-in name (or None)."""

    key: str | None = None
    principal: str | None = None

    @property
    def label(self) -> str:
        """What the UI shows for this caller once paired: its principal name, else "an agent"."""
        return self.principal if self.principal else ANONYMOUS_LABEL

    @property
    def anonymous(self) -> bool:
        return self.key is None

    @property
    def log_label(self) -> str:
        """How the log names it: the user, a key prefix, or anonymous."""
        if self.principal:
            return self.principal
        if self.key:
            return self.key[:16]
        return "anonymous"

    @staticmethod
    def of(principal: str | None, agent_key: str | None = None) -> "Caller":
        """In order: the authenticated principal, else an agent key of at least 16 characters,
        else nobody."""
        if principal and principal.strip():
            return Caller(key=f"user:{principal}", principal=principal)
        key = agent_key.strip() if agent_key else ""
        if len(key) >= MIN_AGENT_KEY_LENGTH:
            return Caller(key=f"key:{_sha256(key)}")
        return Caller()


# ── A UI's channel ───────────────────────────────────────────────────────────────────────────
class AgentChannel:
    """Where a session's messages go: ``deliver(message)`` (non-blocking — the SSE adapter puts it
    on its stream's queue) and ``close()`` (the stream ends: a newer channel replaced it). The
    object's identity is what ties a stream to its registration."""

    def __init__(self, deliver: Callable[[dict[str, Any]], None], close: Callable[[], None] | None = None):
        self._deliver = deliver
        self._close = close

    def deliver(self, data: dict[str, Any]) -> None:
        try:
            self._deliver(data)
        except Exception:  # noqa: BLE001 - a stream that went away must not fail the sender
            log.debug("Mateu agent push: a channel refused a message", exc_info=True)

    def close(self) -> None:
        if self._close is not None:
            try:
                self._close()
            except Exception:  # noqa: BLE001
                log.debug("Mateu agent push: a channel failed to close", exc_info=True)


_current_channel: ContextVar[AgentChannel | None] = ContextVar("mateu_agent_channel", default=None)


@contextmanager
def bound_channel(channel: AgentChannel) -> Iterator[AgentChannel]:
    """Bind the stream an ``_agent-channel`` request opens, for the handler to register."""
    token = _current_channel.set(channel)
    try:
        yield channel
    finally:
        _current_channel.reset(token)


def current_channel() -> AgentChannel | None:
    return _current_channel.get()


# ── The registry ─────────────────────────────────────────────────────────────────────────────
@dataclass
class _Session:
    session_id: str
    handle: str
    secret_hash: str
    principal: str | None
    route: str
    renderer: str
    connected_at: datetime
    channel: AgentChannel | None = None
    disconnected_at: float | None = None
    #: pairing key → label, in pairing order (each anonymous pairing gets a key of its own)
    pairings: dict[str, str] = field(default_factory=dict)
    #: paired at least once by an anonymous caller (the capability rule)
    capability_paired: bool = False
    code: str | None = None
    sent: deque = field(default_factory=deque)

    @property
    def connected(self) -> bool:
        return self.channel is not None


class AgentSessions:
    """The live UI sessions of one app (see the module docstring). ``clock`` (monotonic seconds)
    and ``now`` (an aware UTC datetime) are injectable for tests."""

    def __init__(
        self,
        rate_per_minute: int = DEFAULT_RATE_PER_MINUTE,
        max_sessions: int = DEFAULT_MAX_SESSIONS,
        clock: Callable[[], float] = time.monotonic,
        now: Callable[[], datetime] = lambda: datetime.now(timezone.utc),
    ):
        self.rate_per_minute = max(1, int(rate_per_minute))
        self.max_sessions = max(1, int(max_sessions))
        self._clock = clock
        self._now = now
        self._lock = threading.RLock()
        #: sessionId → session, in REGISTRATION order (the listing reverses it)
        self._sessions: dict[str, _Session] = {}
        self._by_handle: dict[str, str] = {}
        #: normalised code → (sessionId, expiry)
        self._codes: dict[str, tuple[str, float]] = {}
        #: caller bucket → times of its failed pairings
        self._failures: dict[str, deque] = {}

    # ── UI side ──
    def open_channel(
        self,
        session_id: str,
        secret: str,
        principal: str | None,
        route: str,
        renderer: str,
        channel: AgentChannel,
    ) -> dict[str, Any]:
        """Register (first time) or reconnect the session with ``channel``; answers the status
        message the stream starts with. A previous stream of the session ends."""
        with self._lock:
            self._purge()
            session = self._sessions.get(session_id)
            if session is None:
                if len(self._sessions) >= self.max_sessions and not self._evict_one():
                    raise UserFacingException(TOO_MANY_SESSIONS)
                session = _Session(
                    session_id=session_id,
                    handle=self._new_handle(),
                    secret_hash=_sha256(secret),
                    principal=principal,
                    route=route,
                    renderer=renderer,
                    connected_at=self._now(),
                )
                self._sessions[session_id] = session
                self._by_handle[session.handle] = session_id
            else:
                self._check_owner(session, secret, principal)
                session.route = route
                session.renderer = renderer
                session.connected_at = self._now()
            previous = session.channel
            session.channel = channel
            session.disconnected_at = None
            status = self._status(session)
        if previous is not None and previous is not channel:
            previous.close()
        return status

    def channel_closed(self, channel: AgentChannel) -> None:
        """A stream ended: its session (if this is still its channel) counts as disconnected."""
        with self._lock:
            for session in self._sessions.values():
                if session.channel is channel:
                    session.channel = None
                    session.disconnected_at = self._clock()

    def new_code(self, session_id: str, secret: str, principal: str | None) -> tuple[str, int]:
        """A new one-time pairing code for a registered session (the previous unused one dies):
        ``(code shown as XXXX-XXXX, seconds it lives)``."""
        with self._lock:
            self._purge()
            session = self._sessions.get(session_id)
            if session is None:
                raise UserFacingException(CHANNEL_REFUSED)
            self._check_owner(session, secret, principal)
            self._drop_code(session)
            code = self._fresh_code()
            session.code = code
            self._codes[code] = (session_id, self._clock() + CODE_TTL_SECONDS)
            return f"{code[:4]}-{code[4:]}", CODE_TTL_SECONDS

    def unpair(self, session_id: str, secret: str, principal: str | None) -> None:
        """Every pairing of the session removed (and its unused code); the channel is told."""
        with self._lock:
            self._purge()
            session = self._sessions.get(session_id)
            if session is None:
                return
            self._check_owner(session, secret, principal)
            self._drop_code(session)
            session.pairings.clear()
            session.capability_paired = False
            self._tell(session, self._status(session))

    # ── Agent side ──
    def list(self, caller: Caller) -> list[dict[str, Any]]:
        with self._lock:
            self._purge()
            return [
                self._entry(s)
                for s in reversed(list(self._sessions.values()))
                if self._visible(caller, s, listing=True)
            ]

    def pair(self, caller: Caller, code: str) -> dict[str, Any]:
        bucket = caller.key or _ANONYMOUS_PAIRING
        with self._lock:
            self._purge()
            now = self._clock()
            failures = self._failures.setdefault(bucket, deque())
            while failures and failures[0] <= now - WINDOW_SECONDS:
                failures.popleft()
            if len(failures) >= MAX_FAILED_PAIRINGS:
                raise UserFacingException(TOO_MANY_ATTEMPTS)
            normalised = re.sub(r"[\s-]", "", code or "").upper()
            found = self._codes.get(normalised)
            session = self._sessions.get(found[0]) if found is not None else None
            if found is None or found[1] <= now or session is None:
                if found is not None:
                    self._codes.pop(normalised, None)
                failures.append(now)
                raise UserFacingException(INVALID_CODE)
            self._drop_code(session)
            if caller.anonymous:
                session.capability_paired = True
                session.pairings[f"{_ANONYMOUS_PAIRING}:{secrets.token_urlsafe(9)}"] = caller.label
            else:
                session.pairings.setdefault(bucket, caller.label)
            self._tell(session, self._status(session))
            log.info(
                "Mateu agent push: caller=%s paired session=%s (user=%s)",
                caller.log_label, session.handle, session.principal,
            )
            return self._entry(session)

    def addressable(self, caller: Caller, handle: str) -> None:
        """Visibility, then connection — or the refusal."""
        with self._lock:
            self._purge()
            self._addressable(caller, handle)

    def send(self, caller: Caller, handle: str, data: dict[str, Any], log_detail: str) -> None:
        """Deliver ``data`` to the session: visibility, connection, the rate limit, then the
        channel. Logged at INFO."""
        with self._lock:
            self._purge()
            session = self._addressable(caller, handle)
            now = self._clock()
            while session.sent and session.sent[0] <= now - WINDOW_SECONDS:
                session.sent.popleft()
            if len(session.sent) >= self.rate_per_minute:
                raise UserFacingException(RATE_LIMITED)
            session.sent.append(now)
            self._tell(session, data)
        size = len(json.dumps(data, separators=(",", ":"), ensure_ascii=False).encode("utf-8"))
        log.info(
            "Mateu agent push: caller=%s session=%s kind=%s %s bytes=%d",
            caller.log_label, handle, data.get("kind"), log_detail, size,
        )

    # ── internals (under the lock) ──
    def _addressable(self, caller: Caller, handle: str) -> _Session:
        session_id = self._by_handle.get(handle)
        session = self._sessions.get(session_id) if session_id is not None else None
        if session is None or not self._visible(caller, session, listing=False):
            raise UserFacingException(unknown_session(handle))
        if not session.connected:
            raise UserFacingException(not_connected(handle))
        return session

    @staticmethod
    def _visible(caller: Caller, session: _Session, listing: bool) -> bool:
        if caller.principal is not None and session.principal == caller.principal:
            return True
        if caller.key is not None and caller.key in session.pairings:
            return True
        # the capability rule: a session an ANONYMOUS caller paired is reachable by an anonymous
        # caller that knows its handle — never listed (the handle went only to whoever paired)
        return not listing and caller.anonymous and session.capability_paired

    @staticmethod
    def _check_owner(session: _Session, secret: str, principal: str | None) -> None:
        if not hmac.compare_digest(session.secret_hash, _sha256(secret)) or session.principal != principal:
            raise UserFacingException(CHANNEL_REFUSED)

    def _entry(self, session: _Session) -> dict[str, Any]:
        return {
            "session": session.handle,
            "user": session.principal,
            "route": session.route,
            "renderer": session.renderer,
            "connectedAt": session.connected_at.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "connected": session.connected,
            "paired": bool(session.pairings),
        }

    @staticmethod
    def _status(session: _Session) -> dict[str, Any]:
        return message(
            "status",
            STATUS_EVENT,
            {"paired": bool(session.pairings), "agents": list(session.pairings.values())},
        )

    @staticmethod
    def _tell(session: _Session, data: dict[str, Any]) -> None:
        if session.channel is not None:
            session.channel.deliver(data)

    def _drop_code(self, session: _Session) -> None:
        if session.code is not None:
            self._codes.pop(session.code, None)
            session.code = None

    def _forget(self, session: _Session) -> None:
        self._drop_code(session)
        self._sessions.pop(session.session_id, None)
        self._by_handle.pop(session.handle, None)

    def _purge(self) -> None:
        now = self._clock()
        for session in list(self._sessions.values()):
            ended = session.disconnected_at
            if ended is not None and now - ended >= DISCONNECTED_TTL_SECONDS:
                self._forget(session)
        for code, (owner_id, expiry) in list(self._codes.items()):
            if expiry <= now:
                self._codes.pop(code, None)
                owner = self._sessions.get(owner_id)
                if owner is not None and owner.code == code:
                    owner.code = None
        for bucket, times in list(self._failures.items()):
            if not times or times[-1] <= now - WINDOW_SECONDS:
                del self._failures[bucket]

    def _evict_one(self) -> bool:
        """Room for a new session: the one disconnected longest ago goes. False when every
        session is connected."""
        disconnected = [s for s in self._sessions.values() if s.disconnected_at is not None]
        if not disconnected:
            return False
        self._forget(min(disconnected, key=lambda s: s.disconnected_at or 0.0))
        return True

    def _new_handle(self) -> str:
        while True:
            handle = secrets.token_urlsafe(24)  # 192 random bits, URL-safe
            if handle not in self._by_handle:
                return handle

    def _fresh_code(self) -> str:
        while True:
            code = "".join(secrets.choice(CODE_ALPHABET) for _ in range(CODE_LENGTH))
            if code not in self._codes:
                return code


@dataclass(frozen=True)
class PushContext:
    """What the MCP endpoint hands the JSON-RPC dispatch when push is on: the app's sessions and
    who is calling."""

    sessions: AgentSessions
    caller: Caller


# ── The UI-side actions (called by the sync handler) ─────────────────────────────────────────
def _parameter(parameters: dict, name: str, limit: int) -> str:
    """A UI id (``sessionId`` ≤ 128 chars, ``secret`` ≤ 256): anything else is refused like a
    foreign channel."""
    value = parameters.get(name)
    if value is None:
        raise UserFacingException(CHANNEL_REFUSED)
    text = value if isinstance(value, str) else str(value)
    if not text.strip() or len(text) > limit:
        raise UserFacingException(CHANNEL_REFUSED)
    return text


def channel_action(
    sessions: AgentSessions | None, action_id: str, parameters: dict | None, principal: str | None
) -> dict[str, Any] | None:
    """Run one of :data:`ACTIONS`. ``_agent-channel`` answers its status message (the first
    command of the stream); ``_agent-pair`` / ``_agent-unpair`` answer the ``_agentPairing``
    value (``{code, expiresInSeconds}`` / None) wrapped as ``{"pairing": …}``."""
    if sessions is None:
        raise UserFacingException(DISABLED)
    parameters = parameters or {}
    session_id = _parameter(parameters, "sessionId", 128)
    secret = _parameter(parameters, "secret", 256)
    if action_id == CHANNEL_ACTION:
        channel = current_channel()
        if channel is None:
            raise UserFacingException("The agent channel is served by the SSE endpoint (/mateu/v3/sse).")
        route = parameters.get("route")
        renderer = parameters.get("renderer")
        return sessions.open_channel(
            session_id,
            secret,
            principal,
            route if isinstance(route, str) else "",
            renderer[:MAX_RENDERER_LENGTH] if isinstance(renderer, str) else "",
            channel,
        )
    if action_id == PAIR_ACTION:
        code, ttl = sessions.new_code(session_id, secret, principal)
        return {"pairing": {"code": code, "expiresInSeconds": ttl}}
    sessions.unpair(session_id, secret, principal)
    return {"pairing": None}


# ── The MCP tools ────────────────────────────────────────────────────────────────────────────
def _required(args: dict, name: str) -> str:
    value = args.get(name)
    if not isinstance(value, str):
        raise UserFacingException(f'Missing argument "{name}".')
    return value


def call_tool(
    sessions: AgentSessions,
    caller: Caller,
    name: str,
    args: dict,
    validate: Callable[[str], dict],
) -> dict[str, Any]:
    """Run push tool ``name`` for ``caller``. ``validate(yaml)`` is the app's ``__validate__``
    report for the YAML, run AS THE CALLER."""
    if name == "mateu_list_sessions":
        return {"sessions": sessions.list(caller)}
    if name == "mateu_pair_session":
        return sessions.pair(caller, _required(args, "code"))
    if name == "mateu_push_ui":
        handle = _required(args, "session")
        yaml_text = _required(args, "yaml")
        raw_target = args.get("target")
        target = "content" if raw_target is None else raw_target
        if not isinstance(target, str) or target not in TARGETS:
            raise UserFacingException(invalid_target(target if isinstance(target, str) else json.dumps(target)))
        title = args.get("title")
        sessions.addressable(caller, handle)
        validation = validate(yaml_text)
        if not validation.get("valid"):
            return {"delivered": False, "reason": HAS_ERRORS, "validation": validation}
        if validation.get("kind") not in ("component", "envelope"):
            return {"delivered": False, "reason": NOT_A_PAGE, "validation": validation}
        detail: dict[str, Any] = {"yaml": yaml_text, "target": target}
        if isinstance(title, str):
            detail["title"] = title
        sessions.send(caller, handle, message("render", RENDER_EVENT, detail), f"target={target}")
        return {"delivered": True, "session": handle, "target": target, "validation": validation}
    if name == "mateu_navigate":
        handle = _required(args, "session")
        route = _required(args, "route")
        consumed = args.get("consumedRoute")
        detail = {"route": route, "consumedRoute": consumed if isinstance(consumed, str) else ""}
        for key in ("actionId", "baseUrl", "serverSideType", "uriPrefix"):
            if isinstance(args.get(key), str):
                detail[key] = args[key]
        sessions.send(caller, handle, message("navigate", NAVIGATE_EVENT, detail), f"route={route}")
        return {"delivered": True, "session": handle}
    if name == "mateu_dispatch_event":
        handle = _required(args, "session")
        event = _required(args, "event")
        if not EVENT_NAME.match(event):
            raise UserFacingException(invalid_event(event))
        if event in RESERVED_EVENTS:
            raise UserFacingException(reserved_event(event))
        raw_detail = args.get("detail")
        event_detail = {} if raw_detail is None else raw_detail
        if len(json.dumps(event_detail, separators=(",", ":"), ensure_ascii=False).encode("utf-8")) > MAX_DETAIL_BYTES:
            raise UserFacingException(DETAIL_TOO_LARGE)
        sessions.send(caller, handle, message("event", event, event_detail), f"event={event}")
        return {"delivered": True, "session": handle}
    raise UserFacingException(f"Unknown tool: {name}")


__all__ = [
    "ACTIONS",
    "AgentChannel",
    "AgentSessions",
    "Caller",
    "PushContext",
    "bound_channel",
    "call_tool",
    "channel_action",
    "current_channel",
]
