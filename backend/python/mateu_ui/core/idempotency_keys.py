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
"""

from __future__ import annotations

import hashlib
import os
import re
import threading
import time
from collections import OrderedDict
from collections.abc import Callable
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
    scoped = hashlib.sha256(
        f"{caller or ''}\u0002{action_id or ''}\u0002{valid}".encode("utf-8")
    ).hexdigest()
    with _lock:
        known = _finished.get(scoped)
        if known is not None and time.monotonic() - known.created_at > ttl_seconds:
            del _finished[scoped]
            known = None
        if known is not None:
            _finished.move_to_end(scoped)
            mine = None
        elif (running := _in_flight.get(scoped)) is not None:
            known = running
            mine = None
        elif len(_in_flight) >= max(1, max_entries):
            from mateu_ui.uidl.messages import UserFacingException

            raise UserFacingException(BUSY_MESSAGE, BUSY_TITLE)
        else:
            mine = _Entry()
            _in_flight[scoped] = mine
    if mine is None:
        assert known is not None
        known.done.wait()
        if known.error is not None:
            raise known.error
        return known.answer
    try:
        answer = run()
    except BaseException as error:
        mine.error = error
        _settle(scoped, mine, remember=False)
        mine.done.set()
        raise
    mine.answer = answer
    _settle(scoped, mine, remember=not refused(answer))
    mine.done.set()
    return answer


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


__all__ = ["BUSY_MESSAGE", "BUSY_TITLE", "HEADER", "caller_of", "clear", "in_flight", "key_of", "once", "refused"]
