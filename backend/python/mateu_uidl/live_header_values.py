"""In-process bus pushing header-value changes to every open session (Java's LiveHeaderValues)."""

from __future__ import annotations

import threading
from typing import Callable

from .suppliers import HeaderValue

_lock = threading.Lock()
_current: dict[str, str] = {}
_listeners: list[Callable[[HeaderValue], None]] = []


class LiveHeaderValues:
    """Pushes a new value of a header value to EVERY open session of the app — the nightly close
    moving the business date. Apps opt in with ``@app(live_updates=True)``: each browser keeps one
    event stream (``_live-updates`` over ``/mateu/v3/sse``) and repaints the header on a publish.

    In-process: a publish reaches the sessions connected to THIS server (publish on every node in a
    cluster). The last value of each id is kept so a session connecting later catches up
    (EXPERIMENTAL; mirrors Java's ``io.mateu.uidl.LiveHeaderValues``)."""

    @staticmethod
    def publish(id: str, value: str | None) -> None:
        if not id or not id.strip():
            raise ValueError("a header value needs an id")
        text = value or ""
        with _lock:
            _current[id] = text
            listeners = list(_listeners)
        change = HeaderValue(id=id, label=None, value=text)
        for listener in listeners:
            try:
                listener(change)
            except Exception:  # noqa: BLE001 - one broken stream must not stop the others
                pass

    @staticmethod
    def current() -> dict[str, str]:
        """The last value published for each id."""
        with _lock:
            return dict(_current)

    @staticmethod
    def subscribe(listener: Callable[[HeaderValue], None]) -> Callable[[], None]:
        """Listens to every publish; returns the unsubscribe."""
        with _lock:
            _listeners.append(listener)

        def unsubscribe() -> None:
            with _lock:
                if listener in _listeners:
                    _listeners.remove(listener)

        return unsubscribe

    @staticmethod
    def reset() -> None:
        """Forgets every published value (tests)."""
        with _lock:
            _current.clear()
