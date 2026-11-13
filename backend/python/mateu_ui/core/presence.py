"""RECORD PRESENCE (``@app(presence=True)``; Java's ``io.mateu.core.application.presence.Presence``).

A record is its mount-relative route (no query, no surrounding slashes, a trailing ``/edit`` or
``/view`` dropped) plus the view class; a create page (``…/new``) is none. A scope is one app (base
url + app class) — presence of one app never reaches another. Only signed-in callers take part. A
tab reports itself every HEARTBEAT_SECONDS with the ``_presence`` app-level action; a copy not seen
for TTL_SECONDS is gone. Answers and pushed changes list the OTHER people, one entry per person
(editing if any of their tabs edits). EXPERIMENTAL.
"""

from __future__ import annotations

import re
import threading
from datetime import datetime, timedelta, timezone
from typing import Callable

from mateu_ui.dtos import UICommand
from mateu_ui.uidl.presence_store import InMemoryPresenceStore, PresenceMember, PresenceStore

ACTION_ID = "_presence"
HEARTBEAT_SECONDS = 10
TTL_SECONDS = 30
MAX_TAB_LENGTH = 64
MAX_ROUTE_LENGTH = 512
MAX_NAME_LENGTH = 80

#: The process-wide default store (``add_mateu(presence_store=…)`` replaces it).
DEFAULT_STORE = InMemoryPresenceStore()

#: The clock — replaceable by tests.
clock: Callable[[], datetime] = lambda: datetime.now(timezone.utc)  # noqa: E731

_sweep_lock = threading.Lock()
_last_sweep = 0.0


def scope_of(base_url: str | None, app_type: str | None) -> str:
    return (base_url or "") + "|" + (app_type or "")


def enabled_for(cls, registry=None) -> bool:
    """A class decorated with ``@app`` must say ``presence=True``; a data-authored shell (no
    class) decides on the client. A request naming anything else (a plain view) in an app whose
    shell IS a class is off — naming a view must not switch presence on in an app that never
    opted in."""
    if cls is not None and getattr(cls, "__mateu_app__", None) is not None:
        return bool(getattr(cls, "__mateu_app_presence__", False))
    return getattr(registry, "app_type", None) is None


def record_of(route: str | None, view: str | None) -> str | None:
    if route is None:
        return None
    path = str(route).split("?", 1)[0].split("#", 1)[0]
    path = re.sub("/{2,}", "/", path).strip("/")
    if path.endswith("/edit"):
        path = path[: -len("/edit")]
    elif path.endswith("/view"):
        path = path[: -len("/view")]
    if not path or path == "new" or path.endswith("/new") or len(path) > MAX_ROUTE_LENGTH:
        return None
    view_class = (view or "").strip()
    if len(view_class) > MAX_ROUTE_LENGTH:
        return None
    return path + "|" + view_class


def _iso(moment: datetime) -> str:
    text = moment.astimezone(timezone.utc).isoformat()
    return text.replace("+00:00", "Z")


def snapshot(store: PresenceStore, scope: str, record: str, principal: str | None) -> dict:
    by_person: dict[str, dict] = {}
    for m in store.members(scope, record, clock() - timedelta(seconds=TTL_SECONDS)):
        if m.principal is None or m.principal == principal:
            continue
        known = by_person.get(m.principal)
        if known is not None:
            known["editing"] = known["editing"] or m.editing
        else:
            by_person[m.principal] = {"name": m.name, "editing": m.editing, "since": _iso(m.since)}
    return {"key": record, "entries": list(by_person.values())}


def is_on(store: PresenceStore, scope: str, record: str, principal: str | None) -> bool:
    if principal is None:
        return False
    since = clock() - timedelta(seconds=TTL_SECONDS)
    return any(m.principal == principal for m in store.members(scope, record, since))


def _clip(value: str | None, limit: int) -> str | None:
    if value is None:
        return None
    value = str(value)
    return value[:limit] if len(value) > limit else value


def touch(store: PresenceStore, scope: str, record: str, principal: str, tab: str | None, editing: bool) -> bool:
    now = clock()
    return store.touch(
        scope, record,
        PresenceMember(principal, principal[:MAX_NAME_LENGTH], _clip(tab, MAX_TAB_LENGTH), editing, now, now),
    )


def leave(store: PresenceStore, scope: str, record: str, principal: str, tab: str | None) -> None:
    store.leave(scope, record, principal, _clip(tab, MAX_TAB_LENGTH))


def sweep(store: PresenceStore) -> None:
    """Forgets the copies whose tab went silent — at most every few seconds."""
    global _last_sweep
    now = clock().timestamp()
    with _sweep_lock:
        if 0 <= now - _last_sweep < 5:
            return
        _last_sweep = now
    store.expire(clock() - timedelta(seconds=TTL_SECONDS))


def reset_sweep() -> None:
    global _last_sweep
    with _sweep_lock:
        _last_sweep = 0.0


def command(presence: dict) -> UICommand:
    return UICommand(target_component_id=None, type="PresenceChanged", data=presence)
