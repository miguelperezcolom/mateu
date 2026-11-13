"""Record presence (``@app(presence=True)``) — the Python mirror of Java's ``PresenceSyncTest`` and
``PresenceTest``: who else has a record open and who edits it, only signed-in callers, never across
records or apps, expiry, bounds, and changes pushed on the live-updates stream to the people on the
record only."""

import json
import sys
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, presence, type_name  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    Identity,
    InMemoryPresenceStore,
    PresenceMember,
    app,
    eyes_only,
    ui,
)


@ui("/presence-desk")
@app("Desk", presence=True)
class PresenceDesk:
    pass


@ui("/presence-other")
@app("Other desk", presence=True)
class PresenceOtherDesk:
    pass


@ui("/presence-off")
@app("Plain desk")
class PresenceOffDesk:
    pass


@ui("/presence-plain")
class PresencePlainView:
    pass


@ui("/payroll-records")
@eyes_only(roles=["hr"])
class PresencePayrollRecords:
    pass


MODULE = sys.modules[__name__]
VIEW = "io.example.OrderView"
T0 = datetime(2026, 11, 11, 10, 0, tzinfo=timezone.utc)


def _handler(store, who):
    h = SyncHandler(MateuRegistry(MODULE))
    h.presence_store = store
    h.mapper.identity_provider = (lambda: Identity(name=who)) if who else None
    return h


def _report(store, app_cls, who, tab, route, state):
    increment = _handler(store, who).handle(RunActionRq(
        server_side_type=type_name(app_cls), route="/" + app_cls.__name__, action_id="_presence",
        parameters={"route": route, "view": VIEW, "tab": tab, "state": state},
    ))
    commands = [c for c in increment.commands if c.type == "PresenceChanged"]
    return commands[0].data if commands else None


def test_the_app_says_whether_presence_is_on():
    def meta(cls):
        h = SyncHandler(MateuRegistry(MODULE))
        wire = json.loads(json.dumps(h.handle(RunActionRq(server_side_type=type_name(cls))).model_dump(by_alias=True, mode="json")))
        return wire["fragments"][0]["component"]["metadata"]

    assert meta(PresenceDesk)["presence"] is True
    assert meta(PresenceOffDesk)["presence"] is False


def test_each_one_sees_the_others_and_who_edits():
    store = InMemoryPresenceStore()
    _report(store, PresenceDesk, "ana", "a", "orders/7", "viewing")
    _report(store, PresenceDesk, "bob", "b", "orders/7/edit", "editing")
    seen_by_ana = _report(store, PresenceDesk, "ana", "a", "/orders/7", "viewing")
    assert seen_by_ana["key"] == "orders/7|" + VIEW
    assert [(e["name"], e["editing"]) for e in seen_by_ana["entries"]] == [("bob", True)]
    assert seen_by_ana["entries"][0]["since"]
    seen_by_bob = _report(store, PresenceDesk, "bob", "b", "orders/7/edit", "editing")
    assert [(e["name"], e["editing"]) for e in seen_by_bob["entries"]] == [("ana", False)]


def test_one_person_in_two_tabs_is_one_entry_editing_if_any_tab_edits():
    store = InMemoryPresenceStore()
    _report(store, PresenceDesk, "ana", "1", "orders/8", "viewing")
    _report(store, PresenceDesk, "ana", "2", "orders/8", "editing")
    entries = _report(store, PresenceDesk, "bob", "b", "orders/8", "viewing")["entries"]
    assert len(entries) == 1 and entries[0]["editing"] is True


def test_another_record_or_another_app_never_sees_it():
    store = InMemoryPresenceStore()
    _report(store, PresenceDesk, "ana", "a", "orders/9", "editing")
    assert _report(store, PresenceDesk, "bob", "b", "orders/10", "viewing")["entries"] == []
    assert _report(store, PresenceOtherDesk, "bob", "c", "orders/9", "viewing")["entries"] == []


def test_anonymous_callers_neither_show_nor_see():
    store = InMemoryPresenceStore()
    _report(store, PresenceDesk, "ana", "a", "orders/11", "viewing")
    assert _report(store, PresenceDesk, None, "x", "orders/11", "editing") is None
    assert [e["name"] for e in _report(store, PresenceDesk, "bob", "b", "orders/11", "viewing")["entries"]] == ["ana"]


def test_a_create_page_and_an_app_without_presence_take_no_part():
    store = InMemoryPresenceStore()
    assert _report(store, PresenceDesk, "ana", "a", "orders/new", "editing") is None
    assert _report(store, PresenceOffDesk, "ana", "a", "orders/12", "viewing") is None


def test_naming_a_plain_view_does_not_switch_presence_on():
    store = InMemoryPresenceStore()
    assert _report(store, PresencePlainView, "ana", "a", "orders/13", "viewing") is None
    assert store.size() == 0


def test_a_record_the_caller_cannot_open_takes_no_part():
    store = InMemoryPresenceStore()
    _report(store, PresenceDesk, "ana", "a", "orders/30", "viewing")
    # payroll-records is @eyes_only(hr): bob (no role) neither shows himself nor learns who is there
    assert _report(store, PresenceDesk, "bob", "b", "payroll-records/3", "editing") is None
    assert _report(store, PresenceDesk, "bob", "b", "orders/30", "viewing")["entries"][0]["name"] == "ana"
    scope = presence.scope_of(None, type_name(PresenceDesk))
    assert not presence.is_on(store, scope, "payroll-records/3|" + VIEW, "bob")


def test_leaving_takes_the_tab_off():
    store = InMemoryPresenceStore()
    _report(store, PresenceDesk, "ana", "a", "orders/13", "editing")
    _report(store, PresenceDesk, "ana", "a", "orders/13", "leave")
    assert _report(store, PresenceDesk, "bob", "b", "orders/13", "viewing")["entries"] == []


def test_a_record_is_its_route_and_view_class():
    assert presence.record_of("/orders/7", "x.V") == "orders/7|x.V"
    assert presence.record_of("orders/7/edit", "x.V") == "orders/7|x.V"
    assert presence.record_of("orders/7/view?tab=2", "x.V") == "orders/7|x.V"
    assert presence.record_of("//orders//7/", None) == "orders/7|"
    assert presence.record_of("orders/new", "x.V") is None
    assert presence.record_of("/", "x.V") is None
    assert presence.record_of("a" * 600, "x.V") is None


def test_a_tab_not_seen_for_thirty_seconds_is_gone(monkeypatch):
    store = InMemoryPresenceStore()
    monkeypatch.setattr(presence, "clock", lambda: T0)
    presence.touch(store, "s", "r|", "ana", "t", False)
    monkeypatch.setattr(presence, "clock", lambda: T0 + timedelta(seconds=25))
    assert len(presence.snapshot(store, "s", "r|", "bob")["entries"]) == 1
    monkeypatch.setattr(presence, "clock", lambda: T0 + timedelta(seconds=31))
    assert presence.snapshot(store, "s", "r|", "bob")["entries"] == []
    presence.reset_sweep()
    presence.sweep(store)
    assert store.size() == 0
    presence.reset_sweep()


def test_the_store_is_bounded():
    store = InMemoryPresenceStore()

    def m(p):
        return PresenceMember(p, p, "t", False, T0, T0)

    for i in range(InMemoryPresenceStore.MAX_MEMBERS_PER_RECORD):
        assert store.touch("s", "r", m(f"p{i}"))
    assert not store.touch("s", "r", m("one-too-many"))
    assert store.touch("s", "r", m("p0"))
    for i in range(InMemoryPresenceStore.MAX_COPIES_PER_PRINCIPAL):
        assert store.touch("s", f"rec{i}", m("busy"))
    assert not store.touch("s", "one-more", m("busy"))
    store.leave("s", "rec0", "busy", "t")
    assert store.touch("s", "one-more", m("busy"))


def test_listeners_hear_joins_edits_leaves_and_expiries():
    store = InMemoryPresenceStore()
    heard = []
    unsubscribe = store.on_change(lambda scope, record: heard.append(f"{scope}/{record}"))
    store.touch("s", "r", PresenceMember("ana", "ana", "t", False, T0, T0))
    store.touch("s", "r", PresenceMember("ana", "ana", "t", False, T0, T0))  # a heartbeat: no change
    store.touch("s", "r", PresenceMember("ana", "ana", "t", True, T0, T0))
    store.leave("s", "r", "ana", "t")
    store.touch("s", "r2", PresenceMember("bob", "bob", "t", False, T0, T0))
    store.expire(T0 + timedelta(seconds=60))
    unsubscribe()
    assert heard == ["s/r", "s/r", "s/r", "s/r2", "s/r2"]
    assert store.size() == 0


def test_changes_are_pushed_on_the_stream_only_to_the_people_on_the_record(monkeypatch):
    import fastapi
    from fastapi.testclient import TestClient

    import mateu_ui.fastapi
    from mateu_ui.fastapi import add_mateu

    monkeypatch.setattr(mateu_ui.fastapi, "LIVE_MAX_SECONDS", 0.6)
    monkeypatch.setattr(mateu_ui.fastapi, "LIVE_HEARTBEAT_SECONDS", 0.1)
    store = InMemoryPresenceStore()
    current = {"who": "ana"}
    api = fastapi.FastAPI()
    handler = add_mateu(api, MODULE, identity_provider=lambda: Identity(name=current["who"]),
                        presence_store=store)
    client = TestClient(api)

    def report(route, state):
        client.post("/mateu/v3/sync/presence-desk", json={
            "serverSideType": type_name(PresenceDesk), "actionId": "_presence", "route": "/presence-desk",
            "componentState": {}, "parameters": {"route": route, "view": VIEW, "tab": "t-" + current["who"], "state": state},
        })

    report("orders/14", "viewing")  # ana is on orders/14
    # a change of ANOTHER record (bob on orders/15) and then bob editing ana's record
    scope = presence.scope_of("", type_name(PresenceDesk))
    timer = threading.Timer(0.25, lambda: (
        presence.touch(store, scope, "orders/15|" + VIEW, "bob", "tb", True),
        presence.touch(store, scope, "orders/14|" + VIEW, "bob", "tb", True),
    ))
    timer.start()
    rs = client.post("/mateu/v3/sse/presence-desk", json={
        "serverSideType": type_name(PresenceDesk), "actionId": "_live-updates", "route": "/presence-desk",
        "componentState": {},
    })
    timer.join()
    assert handler.presence_store is store
    events = [json.loads(c[len("data:"):].strip()) for c in rs.text.split("\n\n") if c.startswith("data:")]
    pushed = [c["data"] for e in events for c in e["commands"] if c["type"] == "PresenceChanged"]
    assert [p["key"] for p in pushed] == ["orders/14|" + VIEW]
    assert [(e["name"], e["editing"]) for e in pushed[0]["entries"]] == [("bob", True)]
