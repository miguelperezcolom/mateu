"""The app shell and its app-level actions: notifications and global search (Java's NotificationsActionRunner / GlobalSearchActionRunner)."""

from __future__ import annotations

from typing import Any

from mateu_ui.dtos import (
    UICommand,
    UIFragment,
    UIIncrement,
)
from mateu_ui.uidl import (
    AppSupplier,
    GlobalSearchSupplier,
    NotificationsSupplier,
)

from ..registry import type_name
from ._base import MixinBase
from ._common import RunActionRq


class AppHandlerMixin(MixinBase):
    # ── Plain views ─────────────────────────────────────────────────────────────
    def render_app(
        self,
        app_type,
        rq: RunActionRq | None = None,
        request_base_url: str | None = None,
        home_route_override: str | None = None,
    ) -> UIIncrement:
        title = getattr(app_type, "__mateu_app__")
        # A reflected (@menu_item-method) app is a @UI-annotated instance → CommandMapper's isPage
        # is true → it emits SetWindowTitle. An AppSupplier app renders from a fluent AppShell (not
        # a @UI page) → isPage is false → NO SetWindowTitle command (Java parity).
        commands = (
            []
            if issubclass(app_type, AppSupplier)
            else [UICommand(target_component_id=self.target(rq), type="SetWindowTitle", data=self.mapper.T(title))]
        )
        app_component = self.mapper.map_app(app_type, request_base_url)
        # R2 (App ≠ its Home Screen, coherence-plan #5): type the home fragment with the home
        # SCREEN's class when the home route resolves to a DIFFERENT registered type than the app —
        # a multi-screen app whose home is a distinct route. A single-screen app, a home with no
        # backing Screen (a bare menu link / sentinel route), or an unresolvable home keeps the
        # app's own type. Mirrors Java's AppHomeRouteResolver.get_home_server_side_type. Only the
        # conflated TYPE is fixed; the home-fragment mechanism is untouched.
        meta = getattr(app_component, "metadata", None)
        if home_route_override and meta is not None:
            # a fresh deep link to one of the app's menu routes: the shell opens ON that route
            # (Java's AppMenuResolver answers the app with the deep-linked route as its home)
            meta.home_route = home_route_override
        home_route = getattr(meta, "home_route", None) if meta is not None else None
        if home_route and not home_route.endswith("_page") and not home_route.endswith("_no_home_route"):
            home_type = self.registry.resolve(None, home_route)
            if home_type is not None:
                home_name = type_name(home_type)
                if home_name and home_name != type_name(app_type) and meta is not None:
                    meta.home_server_side_type = home_name
        return UIIncrement.of(
            commands=commands,
            fragments=[UIFragment(target_component_id=self.target(rq), component=app_component, action="Replace")],
        )

    # ── Idle session & live header values (E2 patterns; mirror Java's runners) ──
    def keep_alive_action(self, cls, rq: RunActionRq) -> UIIncrement:
        """``_keep-alive`` (the idle warning's "Stay signed in"): reaching the server is most of it;
        an app class implementing :class:`KeepAliveHandler` is called too. Answers an empty
        increment."""
        from mateu_ui.uidl import KeepAliveHandler

        if isinstance(cls, type) and issubclass(cls, KeepAliveHandler):
            cls().keep_alive()
        return UIIncrement.of()

    @staticmethod
    def live_updates_snapshot() -> UIIncrement:
        """The first increment of the ``_live-updates`` stream: the last value PUBLISHED for each
        id (``LiveHeaderValues.current``) as UpdateHeaderValue commands, or an empty increment."""
        from mateu_ui.uidl import LiveHeaderValues

        return UIIncrement.of(
            commands=[
                UICommand.update_header_value(vid, value)
                for vid, value in LiveHeaderValues.current().items()
            ]
        )

    # ── Live UI push: the UI side of the agent channel (conformance/mcp "Live UI push") ──
    def agent_push_action(self, rq: RunActionRq) -> UIIncrement:
        """``_agent-channel`` (the first increment of the stream: the session's status; the
        stream itself is served by the adapter's SSE endpoint), ``_agent-pair`` (Data
        ``{_agentPairing: {code, expiresInSeconds}}``) and ``_agent-unpair`` (Data
        ``{_agentPairing: null}``). App-level: whatever the type and route. The session's owner
        is the caller's principal NAME (None when anonymous); the per-owner cap counts an
        anonymous UI by its client address."""
        from .. import agent_push
        from ..request_context import current_request

        identity = self.mapper.identity_provider() if self.mapper.identity_provider else None
        principal = getattr(identity, "name", None) or None
        in_flight = current_request()
        answer = agent_push.channel_action(
            self.agent_push,
            rq.action_id or "",
            rq.parameters,
            principal,
            in_flight.client_address if in_flight is not None else None,
        )
        if rq.action_id == agent_push.CHANNEL_ACTION:
            assert answer is not None
            return UIIncrement.of(
                commands=[UICommand.agent_push(answer["kind"], answer["event"], answer["detail"])]
            )
        return UIIncrement.of(
            fragments=[
                UIFragment(
                    target_component_id=self.target(rq),
                    data={agent_push.PAIRING_KEY: (answer or {}).get("pairing")},
                    action="Replace",
                )
            ]
        )

    # ── Notification inbox (NotificationsSupplier, mirrors Java's NotificationsActionRunner) ──
    def notifications_action(self, cls, rq: RunActionRq) -> UIIncrement:
        """The notification inbox's app-level actions: ``_notifications-list`` answers the
        supplier's current entries plus the caller's stored ones (``InboxStore``) as a data-only
        fragment under ``_notifications`` (per request, so per user); ``_notifications-read`` marks
        the resolved ids read and answers the REFRESHED list. The fragment targets the initiator,
        like the lookup searches. An ``@app(inbox=True)`` app without a supplier lists the store."""
        has_supplier = isinstance(cls, type) and issubclass(cls, NotificationsSupplier)
        if not has_supplier and not (isinstance(cls, type) and getattr(cls, "__mateu_app_inbox__", False)):
            return self.error(
                "the app class does not implement NotificationsSupplier — no inbox to serve"
            )
        supplier = cls() if has_supplier else None
        inbox = _Inbox(supplier, self._inbox_principal(), getattr(self, "inbox_store", None), rq)
        parameters = rq.parameters or {}
        # every id the panel sends back comes from the browser: the supplier is only handed ids of
        # the CALLER's own list (what it answers for this request) and only the actions an entry
        # offers — an app that looks entries up by id alone must not open another user's inbox
        if rq.action_id == "_notifications-open":
            # the entry's detail (a drawer, a dialog…) answered like any action's result
            nid = self._str_param(parameters, "id")
            entry = inbox.supplier_entry(nid)
            if nid is None or entry is None or not getattr(entry, "has_detail", False):
                return UIIncrement.of()
            detail = supplier.notification_detail(nid, rq)
            return self.map_result(detail, rq) if detail is not None else UIIncrement.of()
        answer: UIIncrement | None = None
        if rq.action_id == "_notifications-read":
            inbox.mark_read(self._notification_read_ids(inbox, rq))
        elif rq.action_id == "_notifications-dismiss":
            ids = parameters.get("ids")
            inbox.dismiss([str(v) for v in ids] if isinstance(ids, list) else ([] if ids is None else [str(ids)]))
        elif rq.action_id == "_notifications-act":
            nid = self._str_param(parameters, "id")
            action_id = self._str_param(parameters, "actionId")
            if nid is None or action_id is None:
                return self.error("Which notification, and which action?")
            # a stored entry offers no action to run: it is refused like an entry not offering it
            entry = inbox.supplier_entry(nid)
            if entry is None or not any(
                getattr(a, "action_id", None) == action_id for a in (getattr(entry, "actions", None) or [])
            ):
                from ..action_guard import deny

                deny("_notifications-act: the caller's inbox has no entry offering that action")
            result = supplier.on_notification_action(nid, action_id, rq)
            answer = self.map_result(result, rq) if result is not None else None
        data = {"_notifications": [self._notification_json(n) for n in inbox.entries(refresh=True)]}
        listed = UIFragment(target_component_id=self.target(rq), data=data, action="Replace")
        if answer is None:
            return UIIncrement.of(fragments=[listed])
        return answer.model_copy(update={"fragments": [*answer.fragments, listed]})

    def _inbox_principal(self) -> str | None:
        """The authenticated caller's name the stored inbox is kept under (None = anonymous)."""
        identity = self.mapper.identity_provider() if self.mapper.identity_provider else None
        name = getattr(identity, "name", None)
        return name if name and str(name).strip() else None

    @staticmethod
    def _notification_read_ids(inbox: "_Inbox", rq: RunActionRq) -> list[str]:
        """The ``ids`` parameter: an explicit list, "all" → every currently-unread notification's
        id, or a single bare id."""
        ids = (rq.parameters or {}).get("ids")
        if isinstance(ids, list):
            return [str(v) for v in ids]
        if ids == "all":
            return [n.id for n in inbox.entries() if n.unread]
        return [] if ids is None else [str(ids)]

    @staticmethod
    def _str_param(parameters: dict, key: str) -> str | None:
        value = parameters.get(key)
        return None if value is None else str(value)

    @staticmethod
    def _notification_json(n) -> dict[str, Any]:
        """One inbox entry on the wire — {id, title, text, route, unread, when} (mirrors
        AppNotification's JSON shape)."""
        if hasattr(n, "to_json"):
            return n.to_json()
        return {
            "id": n.id, "title": n.title, "text": n.text,
            "route": n.route, "unread": n.unread, "when": n.when,
        }

    # ── @app_context pickers' search (mirrors Java's AppContextSearchActionRunner) ──
    APP_CONTEXT_SEARCH_PREFIX = "_appcontext-search-"

    def app_context_search_action(self, cls, rq: RunActionRq) -> UIIncrement:
        """The header picker of an ``@app_context`` asks ``_appcontext-search-<field>`` (with a
        ``searchText`` parameter) whenever it opens or the user types: answers the selector's
        options whose label contains the text, as a data-only page under
        ``_appcontext_<field>`` for the initiator. Unanswered, every picker the web shell drew for
        a Python app greeted the user with an "Action not found" error toast."""
        field = (rq.action_id or "")[len(self.APP_CONTEXT_SEARCH_PREFIX):]
        text = str((rq.parameters or {}).get("searchText") or "").strip().lower()
        options: list = next(
            (s.options for s in self.mapper.map_context_selectors(cls) if s.field_name == field), []
        )
        content = [
            {"value": o.value, "label": o.label}
            for o in options
            if not text or text in str(o.label or "").lower()
        ]
        page = {
            "content": content, "totalElements": len(content),
            "pageSize": len(content), "pageNumber": 0,
        }
        return UIIncrement.of(
            fragments=[
                UIFragment(
                    target_component_id=self.target(rq),
                    data={f"_appcontext_{field}": page},
                    action="Replace",
                )
            ]
        )

    # ── Global entity search (GlobalSearchSupplier, mirrors Java's GlobalSearchActionRunner) ──
    def global_search_action(self, cls, rq: RunActionRq) -> UIIncrement:
        """The command palette's entity search: ``_globalsearch`` with a ``searchText``
        parameter answers the app class's :class:`GlobalSearchSupplier` hits as a data-only
        fragment under ``_globalsearch``. The fragment targets the initiator, like the inbox."""
        if not (isinstance(cls, type) and issubclass(cls, GlobalSearchSupplier)):
            return self.error(
                "the app class does not implement GlobalSearchSupplier — no global search to serve"
            )
        raw = (rq.parameters or {}).get("searchText")
        hits = cls().global_search("" if raw is None else str(raw)) or []
        data = {
            "_globalsearch": [
                {
                    "label": h.label, "description": h.description,
                    "route": h.route, "category": h.category,
                }
                for h in hits
            ]
        }
        return UIIncrement.of(
            fragments=[
                UIFragment(target_component_id=self.target(rq), data=data, action="Replace")
            ]
        )


class _Inbox:
    """The caller's inbox for one request: the supplier's entries (the app's own) ∪ the caller's
    stored ones (``InboxStore``), each id routed back to whoever holds it — and only the caller's
    own ids at all."""

    def __init__(self, supplier, principal: str | None, store, rq: RunActionRq):
        self.supplier = supplier
        self.principal = principal
        self.store = store if principal else None
        self.rq = rq
        self._supplied = None
        self._stored = None

    def supplied(self) -> list:
        if self._supplied is None:
            listed = self.supplier.notifications(self.rq) if self.supplier is not None else None
            self._supplied = [n for n in (listed or []) if n is not None]
        return self._supplied

    def stored(self) -> list:
        if self._stored is None:
            self._stored = list(self.store.list(self.principal)) if self.store is not None else []
        return self._stored

    def entries(self, refresh: bool = False) -> list:
        """Supplier first; a stored id the supplier already lists is skipped."""
        if refresh:
            self._supplied = None
            self._stored = None
        supplied = self.supplied()
        known = {n.id for n in supplied}
        return [*supplied, *(n for n in self.stored() if n.id not in known)]

    def supplier_entry(self, nid: str | None):
        if nid is None:
            return None
        return next((n for n in self.supplied() if n.id == nid), None)

    def _split(self, ids: list[str]) -> tuple[list[str], list[str]]:
        supplied = {n.id for n in self.supplied()}
        stored = {n.id for n in self.stored()} - supplied
        return [i for i in ids if i in supplied], [i for i in ids if i in stored]

    def mark_read(self, ids: list[str]) -> None:
        own, kept = self._split(ids)
        if self.supplier is not None:
            self.supplier.mark_notifications_read(own, self.rq)
        if kept and self.store is not None:
            self.store.mark_read(self.principal, kept)

    def dismiss(self, ids: list[str]) -> None:
        own, kept = self._split(ids)
        if self.supplier is not None:
            self.supplier.dismiss_notifications(own, self.rq)
        if kept and self.store is not None:
            self.store.dismiss(self.principal, kept)
