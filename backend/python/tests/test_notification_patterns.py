"""Notifications as a pattern — the Python mirror of Java's ``NotificationPatternsSyncTest``: a
message says its severity, persistence, actions and dedup key; an inbox entry can be acted upon,
dismissed and opened; inbox changes are PUSHED only to the sessions of the user they are for."""

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    AppNotification,
    LiveNotifications,
    Message,
    MessageAction,
    MessagePersistence,
    MessageVariant,
    NotificationChange,
    NotificationsSupplier,
    app,
    button,
    components as fluent,
    menu_item,
    ui,
)

INBOX: list[AppNotification] = []
ACTED: list[str] = []


@ui("notification-messages")
class Messages:
    @button()
    def saved(self) -> Message:
        return (
            Message("Saved")
            .with_action(MessageAction.open("View", "/orders/1"))
            .with_action(MessageAction.run("Share", "share", {"id": 1}).with_style("secondary"))
            .with_persistence(MessagePersistence.INBOX)
            .with_key("order-1")
        )

    @button()
    def failed(self) -> Message:
        return Message("It failed", variant=MessageVariant.ERROR)

    @button()
    def deleted(self) -> Message:
        return Message.undoable("Deleted", "restore", {"id": 7})


@app("Desk")
class Desk(NotificationsSupplier):
    @menu_item("Home")
    def home(self) -> "Messages":
        return Messages()

    def notifications(self, request) -> list[AppNotification]:
        return list(INBOX)

    def mark_notifications_read(self, ids, request) -> None:
        pass

    def on_notification_action(self, id, action_id, request):
        ACTED.append(f"{id}:{action_id}")
        for n in INBOX:
            if n.id == id:
                n.resolved, n.unread = True, False
        return Message("Approved")

    def dismiss_notifications(self, ids, request) -> None:
        INBOX[:] = [n for n in INBOX if n.id not in ids]

    def notification_detail(self, id, request):
        return fluent.Drawer(header_title=f"Expense {id}", content=fluent.Text(text="Detail"))


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def wire(inc) -> dict:
    return json.loads(json.dumps(inc.model_dump(by_alias=True, mode="json")))


def _seed():
    INBOX.clear()
    ACTED.clear()
    INBOX.append(AppNotification(
        "e1", "Expense to approve", unread=True, category="Approvals", variant="warning",
        actions=[
            MessageAction.run("Approve", "approve").with_style("primary"),
            MessageAction.run("Reject", "reject").with_style("danger"),
        ],
        has_detail=True,
    ))
    INBOX.append(AppNotification("e2", "Backup done", None, None, False, "yesterday"))


def message_of(action_id) -> dict:
    inc = handler().handle(RunActionRq(
        route="/notification-messages", server_side_type=type_name(Messages), action_id=action_id,
        component_state={},
    ))
    return wire(inc)["messages"][0]


def run_app(action_id, parameters):
    return handler().handle(RunActionRq(
        route="/desk", consumed_route="/desk", server_side_type=type_name(Desk),
        action_id=action_id, initiator_component_id="_ux", component_state={},
        parameters=parameters,
    ))


def list_in(inc) -> list[dict]:
    return next(f["data"]["_notifications"] for f in wire(inc)["fragments"]
                if isinstance(f.get("data"), dict) and "_notifications" in f["data"])


def test_a_message_says_its_persistence_actions_and_key():
    m = message_of("saved")
    assert m["persistence"] == "inbox"
    assert m["key"] == "order-1"
    assert m["actions"] == [
        {"label": "View", "actionId": None, "parameters": None, "route": "/orders/1", "style": None},
        {"label": "Share", "actionId": "share", "parameters": {"id": 1}, "route": None, "style": "secondary"},
    ]


def test_an_error_is_sticky_and_anything_else_a_toast():
    error = message_of("failed")
    assert error["persistence"] == "sticky" and error["duration"] == 0
    undo = message_of("deleted")
    assert undo["persistence"] == "toast"
    assert undo["undoActionId"] == "restore"
    assert undo["actions"] == [
        {"label": None, "actionId": "restore", "parameters": {"id": 7}, "route": None, "style": "undo"}
    ]


def test_an_inbox_entry_is_acted_upon_and_resolved():
    _seed()
    inc = run_app("_notifications-act", {"id": "e1", "actionId": "approve"})
    assert ACTED == ["e1:approve"]
    assert [m["text"] for m in wire(inc)["messages"]] == ["Approved"]
    entry = list_in(inc)[0]
    assert entry["resolved"] is True
    assert entry["category"] == "Approvals" and entry["hasDetail"] is True
    assert [a["actionId"] for a in entry["actions"]] == ["approve", "reject"]


def test_an_inbox_entry_is_dismissed():
    _seed()
    assert [n["id"] for n in list_in(run_app("_notifications-dismiss", {"ids": ["e2"]}))] == ["e1"]


def test_an_inbox_entry_opens_its_detail():
    _seed()
    inc = run_app("_notifications-open", {"id": "e1"})
    assert inc.fragments and inc.fragments[0].action == "Add"
    assert "Expense e1" in json.dumps(wire(inc))


# every id the panel sends back comes from the browser: only the caller's own entries (the
# supplier's list for this request) and only the actions an entry offers reach the supplier


def test_an_action_on_an_entry_not_in_the_callers_list_or_not_offered_is_refused():
    from mateu_ui.core.action_guard import MateuForbiddenException

    _seed()
    for params in (
        {"id": "someone-elses", "actionId": "approve"},
        {"id": "e1", "actionId": "deleteAll"},
        {"id": "e2", "actionId": "approve"},
    ):
        with pytest.raises(MateuForbiddenException):
            run_app("_notifications-act", params)
    assert ACTED == []


def test_dismiss_read_and_open_only_reach_the_callers_own_entries(monkeypatch):
    _seed()
    seen = {"dismissed": [], "read": [], "opened": []}
    monkeypatch.setattr(Desk, "dismiss_notifications",
                        lambda self, ids, rq: seen["dismissed"].extend(ids))
    monkeypatch.setattr(Desk, "mark_notifications_read",
                        lambda self, ids, rq: seen["read"].extend(ids))
    monkeypatch.setattr(Desk, "notification_detail",
                        lambda self, id, rq: seen["opened"].append(id))
    run_app("_notifications-dismiss", {"ids": ["e2", "someone-elses"]})
    run_app("_notifications-read", {"ids": ["e1", "someone-elses"]})
    run_app("_notifications-open", {"id": "someone-elses"})
    run_app("_notifications-open", {"id": "e2"})
    assert seen == {"dismissed": ["e2"], "read": ["e1"], "opened": []}


def test_changes_reach_only_the_sessions_of_their_user():
    mine, theirs = [], []
    unsub_mine = LiveNotifications.subscribe(
        lambda c: mine.append(c) if LiveNotifications.is_for(c, "ana") else None)
    unsub_theirs = LiveNotifications.subscribe(
        lambda c: theirs.append(c) if LiveNotifications.is_for(c, "bob") else None)
    try:
        _seed()
        LiveNotifications.publish("ana", INBOX[0])
        LiveNotifications.publish_to_all(AppNotification("all", "Maintenance at 22:00"))
        assert [c.notification.id for c in mine] == ["e1", "all"]
        assert [c.notification.id for c in theirs] == ["all"]
        command = wire_command(LiveNotifications.command(mine[0]))
        assert command["type"] == "NotificationsChanged"
        assert command["data"]["notification"]["category"] == "Approvals"
        assert len(command["data"]["notification"]["actions"]) == 2
        assert command["data"]["removedId"] is None
        assert LiveNotifications.is_for(NotificationChange("ana"), None) is False
    finally:
        unsub_mine()
        unsub_theirs()


def wire_command(command) -> dict:
    return json.loads(json.dumps(command.model_dump(by_alias=True, mode="json")))


def test_the_live_updates_stream_carries_the_callers_changes(monkeypatch):
    fastapi = pytest.importorskip("fastapi")
    import threading

    from fastapi.testclient import TestClient

    import mateu_ui.fastapi
    from mateu_ui.fastapi import add_mateu
    from mateu_ui.uidl import Identity

    monkeypatch.setattr(mateu_ui.fastapi, "LIVE_MAX_SECONDS", 0.6)
    monkeypatch.setattr(mateu_ui.fastapi, "LIVE_HEARTBEAT_SECONDS", 0.1)
    api = fastapi.FastAPI()
    add_mateu(api, MODULE, identity_provider=lambda: Identity(name="ana"))
    _seed()
    timer = threading.Timer(0.25, lambda: (
        LiveNotifications.publish("bob", INBOX[1]),
        LiveNotifications.publish("ana", INBOX[0]),
    ))
    timer.start()
    rs = TestClient(api).post(
        "/mateu/v3/sse/desk",
        json={"serverSideType": type_name(Desk), "actionId": "_live-updates", "route": "/desk", "componentState": {}},
    )
    timer.join()
    events = [json.loads(c[len("data:"):].strip()) for c in rs.text.split("\n\n") if c.startswith("data:")]
    pushed = [c["data"]["notification"]["id"] for e in events for c in e["commands"]
              if c["type"] == "NotificationsChanged"]
    assert pushed == ["e1"]
