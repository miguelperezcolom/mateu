"""In-process bus pushing notification-inbox changes to open sessions (Java's LiveNotifications)."""

from __future__ import annotations

import threading
from dataclasses import dataclass
from typing import Callable

from .suppliers import AppNotification

_lock = threading.Lock()
_listeners: list[Callable[["NotificationChange"], None]] = []


@dataclass(frozen=True)
class NotificationChange:
    """One change: an entry added or changed (``notification``), one removed (``removed_id``), or
    neither — "fetch the list again". ``principal`` None = every session."""

    principal: str | None
    notification: AppNotification | None = None
    removed_id: str | None = None


class LiveNotifications:
    """Pushes inbox changes to the open sessions of a user (or everyone) — the realtime half of
    the notification inbox (``NotificationsSupplier``). Apps opt in with ``@app(live_updates=True)``:
    each browser keeps one event stream (``_live-updates`` over ``/mateu/v3/sse``) and its bell
    updates without polling. Only sessions whose caller's identity NAME is ``principal`` receive a
    change addressed to it. Store the entry first (the supplier stays the source of truth), then
    publish it. In-process: publish on every node in a cluster (EXPERIMENTAL; mirrors Java's
    ``io.mateu.uidl.LiveNotifications``)."""

    @staticmethod
    def publish(principal: str, notification: AppNotification) -> None:
        """An entry added or changed in ``principal``'s inbox (same id replaces it)."""
        if not principal or not principal.strip():
            raise ValueError(
                "a notification needs the principal it is for (publish_to_all reaches everyone)"
            )
        _deliver(NotificationChange(principal, notification, None))

    @staticmethod
    def publish_to_all(notification: AppNotification) -> None:
        """An entry added or changed in every user's inbox."""
        _deliver(NotificationChange(None, notification, None))

    @staticmethod
    def remove(principal: str | None, id: str) -> None:
        """An entry gone from ``principal``'s inbox."""
        _deliver(NotificationChange(principal, None, id))

    @staticmethod
    def refresh(principal: str | None) -> None:
        """``principal``'s inbox changed in several ways: its sessions fetch the list again."""
        _deliver(NotificationChange(principal, None, None))

    @staticmethod
    def subscribe(listener: Callable[[NotificationChange], None]) -> Callable[[], None]:
        """Listens to every change (the framework's event stream); returns the unsubscribe."""
        with _lock:
            _listeners.append(listener)

        def unsubscribe() -> None:
            with _lock:
                if listener in _listeners:
                    _listeners.remove(listener)

        return unsubscribe

    @staticmethod
    def is_for(change: NotificationChange, caller: str | None) -> bool:
        """Whether ``change`` reaches a session of ``caller`` (everyone's, or the caller's own)."""
        return change.principal is None or (bool(caller) and caller == change.principal)

    @staticmethod
    def command(change: NotificationChange):
        """The ``NotificationsChanged`` command carrying ``change``."""
        from mateu_ui.dtos import NotificationsChangedDto, UICommand

        return UICommand(
            target_component_id=None,
            type="NotificationsChanged",
            data=NotificationsChangedDto(
                notification=change.notification.to_wire() if change.notification else None,
                removed_id=change.removed_id,
            ),
        )


def _deliver(change: NotificationChange) -> None:
    with _lock:
        listeners = list(_listeners)
    for listener in listeners:
        try:
            listener(change)
        except Exception:  # noqa: BLE001 - one broken stream must not stop the others
            pass
