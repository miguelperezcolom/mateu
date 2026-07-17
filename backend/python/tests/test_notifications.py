"""Notification inbox — the Python mirror of Java's ``NotificationsSyncTest``: an app class
subclassing ``NotificationsSupplier`` gets the header bell (``AppMetadata.notificationsEnabled``);
the bell's panel fetches through the app-level ``_notifications-list`` action and marks entries
read through ``_notifications-read`` (specific ids or "all") — both answering the refreshed list
under ``_notifications``."""

import json
import sys
from pathlib import Path

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import (  # noqa: E402
    AppNotification,
    Message,
    NotificationsSupplier,
    app,
    button,
    menu_item,
    title,
    ui,
)

INBOX: list[AppNotification] = []


@ui("inbox-home")
@title("Inbox home")
class InboxHome:
    name: str | None = None

    @button()
    def greet(self) -> Message:
        return Message("hi")


@app("Inbox demo")
class InboxApp(NotificationsSupplier):
    @menu_item("Home")
    def home(self) -> "InboxHome":
        return InboxHome()

    def notifications(self, request) -> list[AppNotification]:
        return list(INBOX)

    def mark_notifications_read(self, ids: list[str], request) -> None:
        for n in INBOX:
            if n.id in ids:
                n.unread = False


@app("No inbox")
class NoInboxApp:
    @menu_item("Home")
    def home(self) -> "InboxHome":
        return InboxHome()


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def render(inc) -> str:
    return json.dumps(inc.model_dump(by_alias=True, mode="json"))


def _seed():
    INBOX.clear()
    INBOX.append(
        AppNotification("n1", "Factura aprobada", "F-2026-001", "/invoices/1", True, "hace 2 min")
    )
    INBOX.append(AppNotification("n2", "Nuevo comentario", None, "/tasks/7", True, "hace 1 h"))
    INBOX.append(AppNotification("n3", "Backup completado", None, None, False, "ayer"))


def _run(action_id, parameters=None):
    return handler().handle(
        RunActionRq(
            route="/inbox-app",
            consumed_route="/inbox-app",
            server_side_type=type_name(InboxApp),
            action_id=action_id,
            initiator_component_id="_ux",
            component_state={},
            parameters=parameters or {},
        )
    )


def _notifications_from(inc) -> list[dict]:
    assert len(inc.fragments) == 1
    assert inc.fragments[0].target_component_id == "_ux"
    assert inc.fragments[0].component is None
    return inc.fragments[0].data["_notifications"]


def test_a_the_app_advertises_the_inbox_only_when_the_supplier_is_implemented():
    with_inbox = json.loads(
        render(handler().handle(RunActionRq(server_side_type=type_name(InboxApp))))
    )
    assert with_inbox["fragments"][0]["component"]["metadata"]["notificationsEnabled"] is True
    without = json.loads(
        render(handler().handle(RunActionRq(server_side_type=type_name(NoInboxApp))))
    )
    assert without["fragments"][0]["component"]["metadata"]["notificationsEnabled"] is False


def test_b_the_list_action_returns_the_inbox_entries():
    _seed()
    notifications = _notifications_from(_run("_notifications-list"))
    assert len(notifications) == 3
    assert notifications[0]["title"] == "Factura aprobada"
    assert sum(1 for n in notifications if n["unread"]) == 2
    # the entries serialize with the camelCase wire field names
    assert notifications[0] == {
        "id": "n1",
        "title": "Factura aprobada",
        "text": "F-2026-001",
        "route": "/invoices/1",
        "unread": True,
        "when": "hace 2 min",
    }


def test_c_marking_specific_ids_read_answers_the_refreshed_list():
    _seed()
    notifications = _notifications_from(_run("_notifications-read", {"ids": ["n1"]}))
    assert sum(1 for n in notifications if n["unread"]) == 1
    assert next(n for n in notifications if n["id"] == "n1")["unread"] is False


def test_d_marking_all_read_clears_every_unread_flag():
    _seed()
    notifications = _notifications_from(_run("_notifications-read", {"ids": "all"}))
    assert len(notifications) == 3
    assert sum(1 for n in notifications if n["unread"]) == 0


def test_a_single_bare_id_also_marks_that_entry_read():
    _seed()
    notifications = _notifications_from(_run("_notifications-read", {"ids": "n2"}))
    assert next(n for n in notifications if n["id"] == "n2")["unread"] is False
    assert sum(1 for n in notifications if n["unread"]) == 1
