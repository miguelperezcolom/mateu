"""Server-side storage of ``inbox`` messages (Java's ``io.mateu.uidl.interfaces.InboxStore``).

Mateu ships UI only, so the store is an INTERFACE the app may implement (``add_mateu(inbox_store=…)``).
Mateu's default, :class:`InMemoryInboxStore`, keeps the entries in memory, per process, bounded
(100 per principal, newest kept; 10 000 principals, least recently used first) and loses them on
restart. An ``inbox`` Message in any answer to an AUTHENTICATED caller is stored for that caller's
name and published to their other sessions (``LiveNotifications``); the bell lists the app's
``NotificationsSupplier`` entries plus these (EXPERIMENTAL)."""

from __future__ import annotations

import threading
from abc import ABC, abstractmethod
from collections import OrderedDict
from dataclasses import replace

from .suppliers import AppNotification

#: the builtin, for annotations inside the classes (their ``list`` method shadows it there)
_List = list


class InboxStore(ABC):
    """Where the inbox entries of each principal (an authenticated user's NAME) live."""

    @abstractmethod
    def add(self, principal: str, entry: AppNotification) -> None:
        """Adds ``entry`` to ``principal``'s inbox (an entry with the same id replaces it)."""

    @abstractmethod
    def list(self, principal: str) -> _List[AppNotification]:
        """``principal``'s entries, newest first."""

    @abstractmethod
    def mark_read(self, principal: str, ids: _List[str]) -> None:
        """Marks ``principal``'s entries ``ids`` read."""

    @abstractmethod
    def dismiss(self, principal: str, ids: _List[str]) -> None:
        """Removes ``principal``'s entries ``ids``."""


class InMemoryInboxStore(InboxStore):
    """Mateu's default store: in memory, bounded, per process (lost on restart)."""

    def __init__(self, max_per_principal: int = 100, max_principals: int = 10_000):
        self.max_per_principal = max_per_principal
        self.max_principals = max_principals
        self._lock = threading.Lock()
        self._inboxes: "OrderedDict[str, OrderedDict[str, AppNotification]]" = OrderedDict()

    def _inbox(self, principal: str, create: bool) -> "OrderedDict[str, AppNotification] | None":
        inbox = self._inboxes.get(principal)
        if inbox is None and create:
            inbox = OrderedDict()
            self._inboxes[principal] = inbox
            while len(self._inboxes) > self.max_principals:
                self._inboxes.popitem(last=False)
        if inbox is not None:
            self._inboxes.move_to_end(principal)
        return inbox

    def add(self, principal: str, entry: AppNotification) -> None:
        if not principal or entry is None:
            return
        with self._lock:
            inbox = self._inbox(principal, True)
            assert inbox is not None  # created on demand
            inbox.pop(entry.id, None)
            inbox[entry.id] = entry
            while len(inbox) > self.max_per_principal:
                inbox.popitem(last=False)

    def list(self, principal: str) -> _List[AppNotification]:
        with self._lock:
            inbox = self._inbox(principal, False) if principal else None
            return _List(reversed(inbox.values())) if inbox else []

    def mark_read(self, principal: str, ids: _List[str]) -> None:
        with self._lock:
            inbox = self._inbox(principal, False) if principal else None
            if not inbox:
                return
            for nid in ids:
                entry = inbox.get(nid)
                if entry is not None and entry.unread:
                    inbox[nid] = replace(entry, unread=False)

    def dismiss(self, principal: str, ids: _List[str]) -> None:
        with self._lock:
            inbox = self._inbox(principal, False) if principal else None
            if not inbox:
                return
            for nid in ids:
                inbox.pop(nid, None)
