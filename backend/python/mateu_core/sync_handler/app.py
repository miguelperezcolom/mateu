"""The app shell and its app-level actions: notifications and global search (Java's NotificationsActionRunner / GlobalSearchActionRunner)."""

from __future__ import annotations

from typing import Any

from mateu_dtos import (
    UICommand,
    UIFragment,
    UIIncrement,
)
from mateu_uidl import (
    AppSupplier,
    GlobalSearchSupplier,
    NotificationsSupplier,
)

from ..registry import type_name
from ._base import MixinBase
from ._common import RunActionRq


class AppHandlerMixin(MixinBase):
    # ── Plain views ─────────────────────────────────────────────────────────────
    def render_app(self, app_type, rq: RunActionRq | None = None, request_base_url: str | None = None) -> UIIncrement:
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

    # ── Notification inbox (NotificationsSupplier, mirrors Java's NotificationsActionRunner) ──
    def notifications_action(self, cls, rq: RunActionRq) -> UIIncrement:
        """The notification inbox's app-level actions: ``_notifications-list`` answers the
        supplier's current entries as a data-only fragment under ``_notifications`` (per request,
        so per user); ``_notifications-read`` marks the resolved ids read and answers the
        REFRESHED list. The fragment targets the initiator, like the lookup searches."""
        if not (isinstance(cls, type) and issubclass(cls, NotificationsSupplier)):
            return self.error(
                "the app class does not implement NotificationsSupplier — no inbox to serve"
            )
        supplier = cls()
        if rq.action_id == "_notifications-read":
            supplier.mark_notifications_read(self._notification_read_ids(supplier, rq), rq)
        notifications = supplier.notifications(rq) or []
        data = {"_notifications": [self._notification_json(n) for n in notifications]}
        return UIIncrement.of(
            fragments=[
                UIFragment(target_component_id=self.target(rq), data=data, action="Replace")
            ]
        )

    @staticmethod
    def _notification_read_ids(supplier, rq: RunActionRq) -> list[str]:
        """The ``ids`` parameter: an explicit list, "all" → every currently-unread notification's
        id, or a single bare id."""
        ids = (rq.parameters or {}).get("ids")
        if isinstance(ids, list):
            return [str(v) for v in ids]
        if ids == "all":
            return [n.id for n in (supplier.notifications(rq) or []) if n.unread]
        return [] if ids is None else [str(ids)]

    @staticmethod
    def _notification_json(n) -> dict[str, Any]:
        """One inbox entry on the wire — {id, title, text, route, unread, when} (mirrors
        AppNotification's JSON shape)."""
        return {
            "id": n.id, "title": n.title, "text": n.text,
            "route": n.route, "unread": n.unread, "when": n.when,
        }

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
