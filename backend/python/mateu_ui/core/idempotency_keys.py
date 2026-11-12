"""The server half of the offline send queue (Java's ``io.mateu.core.infra.idempotency.IdempotencyKeys``,
.NET's ``Mateu.Core.IdempotencyKeys``).

A sync request carrying an ``Idempotency-Key`` header runs ONCE per caller, action and key; a repeat
gets the first answer back, and a repeat arriving while the first run is still in flight waits for
it and gets its answer. Remembered in memory, per process: bounded (``MATEU_IDEMPOTENCY_MAX_ENTRIES``,
2000 by default; least recently used first out) and for a bounded time
(``MATEU_IDEMPOTENCY_TTL_SECONDS``, 24 h). A run that raises or answers an error message (a refusal,
the error boundary's) is forgotten, so the key can be sent again.

The key is scoped to the CALLER (every grant of the identity the app authenticated, hashed), so one
user's key never answers for another's request. Several workers/instances need sticky routing for
the guarantee to hold across them.
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
_answers: "OrderedDict[str, _Entry]" = OrderedDict()


def key_of(header: str | None) -> str | None:
    """The key, or None when the header is missing or does not look like a key."""
    if header is None or not header.strip():
        return None
    trimmed = header.strip()
    return trimmed if _VALID.match(trimmed) else None


def caller_of(identity: Any) -> str:
    """A stable text naming the authenticated caller (an ``Identity`` or None)."""
    if identity is None:
        return ""

    def joined(name: str) -> str:
        return ",".join(sorted(str(v) for v in (getattr(identity, name, None) or ())))

    return "\u0001".join(
        [str(getattr(identity, "name", None)), joined("roles"), joined("groups"), joined("scopes"),
         joined("permissions")]
    )


def refused(increment: Any) -> bool:
    """Whether an answer refused the request: nothing to remember."""
    messages = getattr(increment, "messages", None) or []
    return any(getattr(m, "variant", None) == "error" for m in messages)


def once(caller: str | None, action_id: str | None, key: str | None, run: Callable[[], T]) -> T:
    """Runs ``run`` unless ``caller`` already sent ``key`` for ``action_id``; then the first answer
    is returned (waiting for it when that run is still in flight)."""
    valid = key_of(key)
    if valid is None:
        return run()
    scoped = hashlib.sha256(
        f"{caller or ''}\u0002{action_id or ''}\u0002{valid}".encode("utf-8")
    ).hexdigest()
    with _lock:
        known = _answers.get(scoped)
        if known is not None and time.monotonic() - known.created_at <= ttl_seconds:
            _answers.move_to_end(scoped)
            mine = None
        else:
            mine = _Entry()
            _answers[scoped] = mine
            while len(_answers) > max(1, max_entries):
                _answers.popitem(last=False)
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
        _forget(scoped, mine)
        mine.done.set()
        raise
    if refused(answer):
        _forget(scoped, mine)
    mine.answer = answer
    mine.done.set()
    return answer


def _forget(scoped: str, entry: _Entry) -> None:
    with _lock:
        if _answers.get(scoped) is entry:
            del _answers[scoped]


def clear() -> None:
    """Forgets every key (tests)."""
    with _lock:
        _answers.clear()


__all__ = ["HEADER", "caller_of", "clear", "key_of", "once", "refused"]
