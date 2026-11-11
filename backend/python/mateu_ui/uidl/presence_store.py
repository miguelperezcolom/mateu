"""Record presence storage (Java's ``io.mateu.uidl.interfaces.PresenceStore``; EXPERIMENTAL).

``@app(presence=True)``: on a record page each signed-in user sees who else has the same record
open, and who is EDITING it. Mateu ships UI only, so the store is an INTERFACE the app may implement
(``add_mateu(presence_store=…)``, e.g. over Redis for a cluster). Mateu's default,
:class:`InMemoryPresenceStore`, keeps it in memory, per process, bounded — so users on different
processes do not see each other. A ``scope`` is one app, a ``record`` one record page within it —
opaque strings Mateu builds; a store never mixes scopes.
"""

from __future__ import annotations

import threading
from abc import ABC, abstractmethod
from dataclasses import dataclass, replace
from datetime import datetime
from typing import Callable

_List = list


@dataclass(frozen=True)
class PresenceMember:
    """One open copy of a record page: who (the authenticated principal, never a value from the
    browser), the name shown, the browser tab, whether it EDITS (holds unsaved changes), since when
    and the last heartbeat (a copy not seen for 30 seconds is gone)."""

    principal: str
    name: str
    tab: str | None
    editing: bool
    since: datetime
    last_seen: datetime


class PresenceStore(ABC):
    """Where record presence is kept."""

    @abstractmethod
    def touch(self, scope: str, record: str, member: PresenceMember) -> bool:
        """Records (or refreshes) one open copy keyed by principal + tab; False when refused."""

    @abstractmethod
    def leave(self, scope: str, record: str, principal: str, tab: str | None) -> None:
        """That tab closed the record (or left it)."""

    @abstractmethod
    def members(self, scope: str, record: str, seen_after: datetime | None) -> _List[PresenceMember]:
        """The copies last seen after ``seen_after``, the oldest first."""

    def expire(self, seen_before: datetime) -> None:
        """Forgets every copy last seen before ``seen_before`` (telling the listeners). A store
        with its own TTL can leave it empty."""

    def on_change(self, listener: Callable[[str, str], None]) -> Callable[[], None]:
        """Listens to every change (scope, record); returns the unsubscribe. A store that cannot
        tell (the default) still works: the others see the change on their next heartbeat."""
        return lambda: None


class InMemoryPresenceStore(PresenceStore):
    """Mateu's default store: in memory, per process, bounded — beyond a bound a touch is refused
    (nothing is evicted)."""

    MAX_RECORDS = 10_000
    MAX_MEMBERS_PER_RECORD = 50
    MAX_COPIES_PER_PRINCIPAL = 50

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._records: dict[tuple[str, str], dict[tuple[str, str], PresenceMember]] = {}
        self._copies: dict[str, int] = {}
        self._listeners: _List[Callable[[str, str], None]] = []

    def touch(self, scope: str, record: str, member: PresenceMember) -> bool:
        if scope is None or record is None or member is None or member.principal is None:
            return False
        with self._lock:
            members = self._records.get((scope, record))
            key = (member.principal, member.tab or "")
            previous = members.get(key) if members is not None else None
            if previous is None:
                if members is None and len(self._records) >= self.MAX_RECORDS:
                    return False
                if members is not None and len(members) >= self.MAX_MEMBERS_PER_RECORD:
                    return False
                if self._copies.get(member.principal, 0) >= self.MAX_COPIES_PER_PRINCIPAL:
                    return False
                if members is None:
                    members = self._records[(scope, record)] = {}
                self._copies[member.principal] = self._copies.get(member.principal, 0) + 1
            members[key] = member if previous is None else replace(member, since=previous.since)
            changed = previous is None or previous.editing != member.editing or previous.name != member.name
        if changed:
            self._notify(scope, record)
        return True

    def leave(self, scope: str, record: str, principal: str, tab: str | None) -> None:
        with self._lock:
            members = self._records.get((scope, record))
            removed = members is not None and members.pop((principal, tab or ""), None) is not None
            if removed:
                self._release(principal)
                if not members:
                    del self._records[(scope, record)]
        if removed:
            self._notify(scope, record)

    def members(self, scope: str, record: str, seen_after: datetime | None) -> _List[PresenceMember]:
        with self._lock:
            members = self._records.get((scope, record)) or {}
            found = [m for m in members.values() if seen_after is None or m.last_seen > seen_after]
        return sorted(found, key=lambda m: m.since)

    def expire(self, seen_before: datetime) -> None:
        changed = []
        with self._lock:
            for key, members in list(self._records.items()):
                stale = [k for k, m in members.items() if m.last_seen < seen_before]
                for k in stale:
                    self._release(members.pop(k).principal)
                if stale:
                    changed.append(key)
                if not members:
                    del self._records[key]
        for scope, record in changed:
            self._notify(scope, record)

    def on_change(self, listener: Callable[[str, str], None]) -> Callable[[], None]:
        with self._lock:
            self._listeners.append(listener)

        def unsubscribe() -> None:
            with self._lock:
                if listener in self._listeners:
                    self._listeners.remove(listener)

        return unsubscribe

    def size(self) -> int:
        """How many records have someone on them (tests)."""
        with self._lock:
            return len(self._records)

    def _release(self, principal: str) -> None:
        n = self._copies.get(principal, 0)
        if n <= 1:
            self._copies.pop(principal, None)
        else:
            self._copies[principal] = n - 1

    def _notify(self, scope: str, record: str) -> None:
        with self._lock:
            listeners = list(self._listeners)
        for listener in listeners:
            try:
                listener(scope, record)
            except Exception:  # noqa: BLE001 - one broken stream must not stop the others
                pass
