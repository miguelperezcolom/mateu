"""The server half of the offline send queue (Java's ``io.mateu.core.infra.idempotency.IdempotencyKeys``,
.NET's ``Mateu.Core.IdempotencyKeys``).

A sync request carrying an ``Idempotency-Key`` header runs ONCE per caller, action and key; a repeat
gets the first answer back, and a repeat arriving while the first run is still in flight waits for
it and gets its answer.

Remembered in memory, per process — lost on a restart and never shared between workers/instances
(several of them need sticky routing for the guarantee to hold). Two separate tables:

- **in flight**: runs that have not finished. One is NEVER evicted — dropping it would let a retry of
  its key start a second run while the first is still working. When the table is full
  (``MATEU_IDEMPOTENCY_MAX_ENTRIES``, 2000 by default) a NEW key is refused with a
  ``UserFacingException`` ("Too many pending requests"): an error answer, which the client keeps
  queued and sends again later. A repeat of a key already in flight always joins its run.
- **finished**: the answers of completed runs, replayed to a repeat of the key; bounded (the same
  ``MATEU_IDEMPOTENCY_MAX_ENTRIES``; least recently used first out) and for a bounded time
  (``MATEU_IDEMPOTENCY_TTL_SECONDS``, 24 h).

A run that raises or answers an error message (a refusal, the error boundary's) is forgotten, so
the key can be sent again. Entries are removed by identity, never by key alone.

The key is scoped to the CALLER: the complete identity the app's ``identity_provider`` resolves —
the one every access check reads — serialised canonically (name, roles, groups, scopes,
permissions; each sorted), so one user's key never answers for another's request and a caller whose
grants changed is not served an answer remembered for the old ones.

The sync endpoint uses :func:`guarded`: the key stays PENDING while the handler runs and is looked
up only at a :func:`checkpoint` — called where the request has passed every check its action would
pass (``action_guard.ensure_may_invoke``, the crud write gates, an editable view's read-only check,
a capability listing's declared writes). A request refused before that is never answered from
memory, whatever rule refused it (identity or not); one that never reaches a checkpoint (a load, a
search, an app-level action) simply runs.
"""

from __future__ import annotations

import hashlib
import os
import re
import threading
import time
from collections import OrderedDict
from collections.abc import Callable
from contextvars import ContextVar
from typing import Any, TypeVar

HEADER = "Idempotency-Key"

#: Title and text of the refusal when too many keyed requests are in flight (same in the 3 backends).
BUSY_TITLE = "Too many pending requests"
BUSY_MESSAGE = "The server is still processing too many requests. Try again in a moment."

_VALID = re.compile(r"^[A-Za-z0-9_\-:.]{8,128}$")

T = TypeVar("T")


def _env_number(name: str, fallback: int) -> int:
    try:
        value = int(os.environ.get(name, ""))
        return value if value > 0 else fallback
    except ValueError:
        return fallback


max_entries: int = _env_number("MATEU_IDEMPOTENCY_MAX_ENTRIES", 2000)
ttl_seconds: float = float(_env_number("MATEU_IDEMPOTENCY_TTL_SECONDS", 24 * 60 * 60))


class _Entry:
    __slots__ = ("created_at", "done", "answer", "error")

    def __init__(self) -> None:
        self.created_at = time.monotonic()
        self.done = threading.Event()
        self.answer: Any = None
        self.error: BaseException | None = None


_lock = threading.Lock()
#: runs not finished yet: never evicted, admission bounded
_in_flight: dict[str, _Entry] = {}
#: answers of finished runs: LRU + TTL
_finished: "OrderedDict[str, _Entry]" = OrderedDict()


def key_of(header: str | None) -> str | None:
    """The key, or None when the header is missing or does not look like a key."""
    if header is None or not header.strip():
        return None
    trimmed = header.strip()
    return trimmed if _VALID.match(trimmed) else None


def caller_of(identity: Any) -> str:
    """A stable, complete text naming the caller (an ``Identity`` or None): every dimension an
    access check may read, each list sorted, so the same grants always give the same text and any
    change of grants another."""

    def joined(name: str) -> str:
        values = getattr(identity, name, None) or () if identity is not None else ()
        return "\u0003".join(sorted({str(v) for v in values if v is not None}))

    name = getattr(identity, "name", None) if identity is not None else None
    return "\u0001".join(
        [
            "name=" + ("" if name is None else str(name)),
            "roles=" + joined("roles"),
            "groups=" + joined("groups"),
            "scopes=" + joined("scopes"),
            "permissions=" + joined("permissions"),
        ]
    )


def refused(increment: Any) -> bool:
    """Whether an answer refused the request: nothing to remember."""
    messages = getattr(increment, "messages", None) or []
    return any(getattr(m, "variant", None) == "error" for m in messages)


def once(caller: str | None, action_id: str | None, key: str | None, run: Callable[[], T]) -> T:
    """Runs ``run`` unless ``caller`` already sent ``key`` for ``action_id``; then the first answer
    is returned (waiting for it when that run is still in flight). Raises a ``UserFacingException``
    when the key is new and too many keyed runs are already in flight."""
    valid = key_of(key)
    if valid is None:
        return run()
    scoped = _scoped(caller, action_id, valid)
    known, mine = _claim(scoped)
    if mine is None:
        return _replay(known)
    return _run_mine(scoped, mine, run)


def _scoped(caller: str | None, action_id: str | None, valid: str) -> str:
    return hashlib.sha256(f"{caller or ''}\u0002{action_id or ''}\u0002{valid}".encode("utf-8")).hexdigest()


def _claim(scoped: str) -> tuple[_Entry | None, _Entry | None]:
    """``(known, None)`` when the key has a finished answer or a run in flight to join, else
    ``(None, mine)`` — a new in-flight entry. Raises the admission refusal when the in-flight
    table is full."""
    with _lock:
        known = _finished.get(scoped)
        if known is not None and time.monotonic() - known.created_at > ttl_seconds:
            del _finished[scoped]
            known = None
        if known is not None:
            _finished.move_to_end(scoped)
            return known, None
        running = _in_flight.get(scoped)
        if running is not None:
            return running, None
        if len(_in_flight) >= max(1, max_entries):
            from mateu_ui.uidl.messages import UserFacingException

            raise UserFacingException(BUSY_MESSAGE, BUSY_TITLE)
        mine = _Entry()
        _in_flight[scoped] = mine
        return None, mine


def _replay(known: _Entry | None):
    assert known is not None
    known.done.wait()
    if known.error is not None:
        raise known.error
    return known.answer


def _run_mine(scoped: str, mine: _Entry, run: Callable[[], T]) -> T:
    try:
        answer = run()
    except BaseException as error:
        _finish(scoped, mine, None, error)
        raise
    _finish(scoped, mine, answer, None)
    return answer


def _finish(scoped: str, mine: _Entry, answer: Any, error: BaseException | None) -> None:
    mine.answer = answer
    mine.error = error
    _settle(scoped, mine, remember=error is None and not refused(answer))
    mine.done.set()


# ── Deduplication AFTER the request checks (the sync endpoint) ─────────────────────────────────


class _Pending:
    """A keyed request in flight through the handler: not claimed until the handler reaches a
    :func:`checkpoint` — i.e. until the request passed the checks the action itself would pass."""

    __slots__ = ("scoped", "claimed", "mine")

    def __init__(self, scoped: str) -> None:
        self.scoped = scoped
        self.claimed = False
        self.mine: _Entry | None = None


class _Replay(BaseException):
    """Unwinds the handler to the endpoint, which answers with the remembered run. A
    BaseException so no ``except Exception`` on the way (an error boundary) turns it into an
    answer of its own."""

    def __init__(self, entry: _Entry) -> None:
        super().__init__("idempotency replay")
        self.entry = entry


_pending: ContextVar[_Pending | None] = ContextVar("mateu_idempotency_pending", default=None)


def guarded(caller: str | None, action_id: str | None, key: str | None, run: Callable[[], T]) -> T:
    """Runs ``run`` (the sync handler) with the request's key PENDING: the key is looked up only
    when the handler calls :func:`checkpoint`, right after the request passed the checks its
    action would pass (class gates, advertised/strict action check, route and YAML access, write
    gates, the action's own access decorators). A request refused before that never sees a
    remembered answer; one that passed them and repeats a known key gets the first answer back
    (joining it while in flight). A request that never reaches a checkpoint (a load, a search)
    simply runs."""
    valid = key_of(key)
    if valid is None:
        return run()
    pending = _Pending(_scoped(caller, action_id, valid))
    token = _pending.set(pending)
    try:
        try:
            answer = run()
        except _Replay as replay:
            return _replay(replay.entry)
        except BaseException as error:
            if pending.mine is not None:
                _finish(pending.scoped, pending.mine, None, error)
            raise
        if pending.mine is not None:
            _finish(pending.scoped, pending.mine, answer, None)
        return answer
    finally:
        _pending.reset(token)


def checkpoint() -> None:
    """The request passed its checks and its action is about to run: claim the pending key.
    Answers nothing when the key is new (the action runs, its answer is remembered); unwinds to
    the endpoint with the remembered answer when the key is known; raises the admission refusal
    when too many keyed runs are in flight. A no-op without a pending key, or once claimed."""
    pending = _pending.get()
    if pending is None or pending.claimed:
        return
    pending.claimed = True
    known, mine = _claim(pending.scoped)
    if mine is None:
        assert known is not None
        raise _Replay(known)
    pending.mine = mine


def _settle(scoped: str, entry: _Entry, remember: bool) -> None:
    """A run ended: out of the in-flight table (only while it is still its own), its answer kept
    when worth it."""
    with _lock:
        if _in_flight.get(scoped) is not entry:
            return
        del _in_flight[scoped]
        if remember:
            entry.created_at = time.monotonic()
            _finished[scoped] = entry
            _finished.move_to_end(scoped)
            while len(_finished) > max(1, max_entries):
                _finished.popitem(last=False)


def in_flight() -> int:
    """How many keyed runs are in flight (tests)."""
    with _lock:
        return len(_in_flight)


def clear() -> None:
    """Forgets every key (tests)."""
    with _lock:
        _in_flight.clear()
        _finished.clear()


__all__ = [
    "BUSY_MESSAGE", "BUSY_TITLE", "HEADER", "caller_of", "checkpoint", "clear", "guarded", "in_flight", "key_of",
    "once", "refused",
]
