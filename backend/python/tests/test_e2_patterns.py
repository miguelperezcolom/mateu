"""The E2 patterns — the Python mirror of Java's ``RecordMergeSyncTest`` and
``AppShellExtrasSyncTest``: compare-and-merge (``RecordMerge``), app-wide shortcuts and quick-launch
codes (``@app_shortcut``), live header values (``HeaderValuesSupplier``, ``UpdateHeaderValue``,
``LiveHeaderValues`` + the ``_live-updates`` stream) and the idle-session warning
(``@app(idle_timeout_minutes=...)`` + ``_keep-alive``)."""

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_dtos import UICommand  # noqa: E402
from mateu_uidl import (  # noqa: E402
    AppShell,
    AppShortcutEntry,
    AppSupplier,
    ComponentTreeSupplier,
    HeaderValue,
    HeaderValuesSupplier,
    KeepAliveHandler,
    LiveHeaderValues,
    Message,
    app,
    app_shortcut,
    button,
    menu_item,
    title,
    ui,
)
from mateu_uidl import components as fluent  # noqa: E402

KEEP_ALIVES: list[int] = []


@ui("record-merge")
@title("Merge profiles")
class MergeProfiles(ComponentTreeSupplier):
    def component(self):
        return fluent.RecordMerge(
            title="Duplicate guests",
            records=(
                fluent.MergeRecord(id="a", label="Profile 1021", caption="12 stays"),
                fluent.MergeRecord(id="b", label="Profile 3388"),
            ),
            fields=(
                fluent.MergeField.of("name", "Name", "Ana García", "Ana García"),
                fluent.MergeField.of("email", "Email", None, "ana@example.com"),
                fluent.MergeField(
                    field_id="phone", values=("+34 600 000 000", "+34 611 111 111"), editable=True, chosen="b"
                ),
                # a short row: padded with a blank value for the second record
                fluent.MergeField(field_id="vip", label="VIP", values=(True,)),
            ),
            merge_action_id="mergeProfiles",
            parameters={"survivor": "a"},
        )

    def merge_profiles(self) -> Message:
        return Message("merged")


@ui("e2-home")
@title("E2 home")
class E2Home:
    name: str | None = None


@app("Plain")
class PlainApp:
    @menu_item("Home")
    def home(self) -> "E2Home":
        return E2Home()


@ui("e2")
@app("Front desk", live_updates=True, idle_timeout_minutes=20, idle_warning_seconds=45)
@app_shortcut(key="F9", route="/reservations", label="Reservations", code="RES")
@app_shortcut(key="alt+g", route="/guests")
@app_shortcut(code="SYNC", action_id="syncNow", label="Sync now")
@app_shortcut(label="nothing to press")  # neither key nor code: dropped
class FrontDesk(HeaderValuesSupplier, KeepAliveHandler):
    @menu_item("Home")
    def home(self) -> "E2Home":
        return E2Home()

    def header_values(self) -> list[HeaderValue]:
        return [
            HeaderValue("businessDate", "Business date", "12 Oct 2026"),
            HeaderValue("shift", None, "Night"),
        ]

    def keep_alive(self) -> None:
        KEEP_ALIVES.append(1)

    def sync_now(self) -> Message:
        return Message("synced")



@ui("end-of-day")
@title("End of day")
class EndOfDay:
    @button()
    def close_day(self) -> UICommand:
        return UICommand.update_header_value("businessDate", "13 Oct 2026")


@app("Code shell")
class CodeShellApp(AppSupplier):
    def get_app(self) -> AppShell:
        return AppShell(
            title="Code shell",
            shortcuts=[AppShortcutEntry(key="f2", route="guests", code="GST")],
            header_values=[HeaderValue("businessDate", "Business date", "1 Jan 2027")],
            idle_timeout_minutes=1,
            idle_warning_seconds=120,
        )


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def wire(inc) -> dict:
    return json.loads(json.dumps(inc.model_dump(by_alias=True, mode="json")))


def walk(node):
    if isinstance(node, dict):
        yield node
        for v in node.values():
            yield from walk(v)
    elif isinstance(node, list):
        for v in node:
            yield from walk(v)


def meta(cls) -> dict:
    return wire(handler().handle(RunActionRq(server_side_type=type_name(cls))))["fragments"][0]["component"]["metadata"]


def run(cls, action_id, route="/e2", parameters=None):
    return handler().handle(
        RunActionRq(
            route=route,
            consumed_route=route,
            server_side_type=type_name(cls),
            action_id=action_id,
            initiator_component_id="_ux",
            component_state={},
            parameters=parameters or {},
        )
    )


@pytest.fixture(autouse=True)
def _clean_bus():
    LiveHeaderValues.reset()
    yield
    LiveHeaderValues.reset()


# ── RecordMerge ────────────────────────────────────────────────────────────────
def test_record_merge_travels_with_differences_and_default_picks():
    root = wire(handler().handle(RunActionRq(server_side_type=type_name(MergeProfiles))))["fragments"][0]["component"]
    merges = [n for n in walk(root) if n.get("type") == "RecordMerge"]
    assert len(merges) == 1
    m = merges[0]
    assert m["title"] == "Duplicate guests"
    assert m["mergeLabel"] == "Merge"
    assert m["mergeActionId"] == "mergeProfiles"
    assert m["parameters"] == {"survivor": "a"}
    assert m["differencesOnly"] is False
    assert m["records"] == [
        {"id": "a", "label": "Profile 1021", "caption": "12 stays"},
        {"id": "b", "label": "Profile 3388", "caption": None},
    ]
    by_id = {f["fieldId"]: f for f in m["fields"]}
    assert by_id["name"] == {
        "fieldId": "name", "label": "Name", "values": ["Ana García", "Ana García"],
        "chosen": "a", "editable": False, "differs": False,
    }
    # the first record has no email: the first NON-BLANK value is picked
    assert by_id["email"]["differs"] is True and by_id["email"]["chosen"] == "b"
    # a declared pick wins; a missing label is the field id humanized
    assert by_id["phone"]["chosen"] == "b" and by_id["phone"]["editable"] is True
    assert by_id["phone"]["label"] == "Phone"
    assert by_id["vip"]["values"] == [True, None] and by_id["vip"]["differs"] is True


def test_record_merge_action_is_advertised():
    root = wire(handler().handle(RunActionRq(server_side_type=type_name(MergeProfiles))))["fragments"][0]["component"]
    advertised = {a.get("id") for n in walk(root) for a in (n.get("actions") or []) if isinstance(a, dict)}
    assert "mergeProfiles" in advertised


def test_record_merge_defaults_record_ids_and_labels():
    from mateu_core.mapper.components import _record_merge_metadata

    md = _record_merge_metadata(fluent.RecordMerge(
        records=(fluent.MergeRecord(), fluent.MergeRecord()),
        fields=(fluent.MergeField(field_id="firstName", values=(" x ", "x", "extra")),),
    ))
    assert [(r.id, r.label) for r in md.records] == [("record0", "Record 1"), ("record1", "Record 2")]
    assert md.fields[0].values == [" x ", "x"]  # cut to one per record
    assert md.fields[0].differs is False  # trimmed texts are equal
    assert md.fields[0].label == "First name"


# ── App shortcuts ──────────────────────────────────────────────────────────────
def test_everything_is_off_by_default():
    m = meta(PlainApp)
    assert m["shortcuts"] == []
    assert m["headerValues"] == []
    assert m["liveUpdates"] is False
    assert m["idleSession"] is None


def test_app_shortcuts_travel_with_absolute_routes_and_labels():
    shortcuts = meta(FrontDesk)["shortcuts"]
    assert shortcuts == [
        {"key": "f9", "label": "Reservations", "route": "/e2/reservations", "actionId": None, "code": "RES"},
        {"key": "alt+g", "label": "Guests", "route": "/e2/guests", "actionId": None, "code": None},
        {"key": None, "label": "Sync now", "route": None, "actionId": "syncNow", "code": "SYNC"},
    ]


def test_an_action_shortcut_runs_on_the_app():
    inc = wire(run(FrontDesk, "syncNow"))
    assert [m["text"] for m in inc["messages"]] == ["synced"]


# ── Live header values ────────────────────────────────────────────────────────
def test_header_values_come_from_the_supplier():
    assert meta(FrontDesk)["headerValues"] == [
        {"id": "businessDate", "label": "Business date", "value": "12 Oct 2026"},
        {"id": "shift", "label": None, "value": "Night"},
    ]
    assert meta(FrontDesk)["liveUpdates"] is True


def test_an_action_changes_a_header_value_with_a_command():
    commands = [c for c in wire(run(EndOfDay, "closeDay", route="/end-of-day"))["commands"] if c["type"] == "UpdateHeaderValue"]
    assert len(commands) == 1
    assert commands[0]["data"] == {"id": "businessDate", "label": None, "value": "13 Oct 2026"}
    assert commands[0]["targetComponentId"] == "_ux"  # retargeted at the initiator, like Java


def test_publish_reaches_subscribers_and_the_snapshot():
    seen = []
    unsubscribe = LiveHeaderValues.subscribe(lambda v: seen.append((v.id, v.value)))
    LiveHeaderValues.publish("businessDate", "13 Oct 2026")
    unsubscribe()
    LiveHeaderValues.publish("businessDate", "14 Oct 2026")
    assert seen == [("businessDate", "13 Oct 2026")]
    assert LiveHeaderValues.current() == {"businessDate": "14 Oct 2026"}
    # the stream's first increment: what was published before this browser connected
    snapshot = wire(run(FrontDesk, "_live-updates"))
    assert snapshot["commands"][0]["type"] == "UpdateHeaderValue"
    assert snapshot["commands"][0]["data"] == {"id": "businessDate", "label": None, "value": "14 Oct 2026"}
    # a shell built AFTER the publish starts from the published value, label kept
    assert {"id": "businessDate", "label": "Business date", "value": "14 Oct 2026"} in meta(FrontDesk)["headerValues"]


# ── Idle session ──────────────────────────────────────────────────────────────
def test_the_idle_warning_is_configured_in_seconds_with_the_keep_alive_action():
    assert meta(FrontDesk)["idleSession"] == {
        "timeoutSeconds": 1200,
        "warningSeconds": 45,
        "signOutUrl": "/e2",
        "keepAliveActionId": "_keep-alive",
    }


def test_keep_alive_reaches_the_apps_handler():
    before = len(KEEP_ALIVES)
    inc = wire(run(FrontDesk, "_keep-alive"))
    assert len(KEEP_ALIVES) == before + 1
    assert inc["commands"] == [] and inc["fragments"] == []


def test_a_code_shell_declares_the_same_three_things():
    m = meta(CodeShellApp)
    assert m["shortcuts"] == [{"key": "f2", "label": "Guests", "route": "/guests", "actionId": None, "code": "GST"}]
    assert m["headerValues"] == [{"id": "businessDate", "label": "Business date", "value": "1 Jan 2027"}]
    # the warning is clamped to the timeout
    assert m["idleSession"]["timeoutSeconds"] == 60 and m["idleSession"]["warningSeconds"] == 60
    assert m["idleSession"]["signOutUrl"] == "/"


# ── The SSE endpoint (FastAPI) ─────────────────────────────────────────────────
def _client(monkeypatch):
    fastapi = pytest.importorskip("fastapi")
    from fastapi.testclient import TestClient

    import mateu_fastapi
    from mateu_fastapi import add_mateu

    monkeypatch.setattr(mateu_fastapi, "LIVE_MAX_SECONDS", 0.3)
    monkeypatch.setattr(mateu_fastapi, "LIVE_HEARTBEAT_SECONDS", 0.1)
    api = fastapi.FastAPI()
    add_mateu(api, MODULE, identity_provider=lambda: None)
    return TestClient(api)


def _events(text: str) -> list[dict]:
    return [json.loads(chunk[len("data:"):].strip()) for chunk in text.split("\n\n") if chunk.startswith("data:")]


def test_sse_streams_an_ordinary_action_as_one_event(monkeypatch):
    client = _client(monkeypatch)
    rs = client.post(
        "/mateu/v3/sse/e2",
        json={"serverSideType": type_name(FrontDesk), "actionId": "syncNow", "route": "/e2", "componentState": {}},
    )
    assert rs.status_code == 200
    assert rs.headers["content-type"].startswith("text/event-stream")
    events = _events(rs.text)
    assert len(events) == 1
    assert [m["text"] for m in events[0]["messages"]] == ["synced"]


def test_sse_live_updates_sends_the_snapshot_then_heartbeats_and_ends(monkeypatch):
    LiveHeaderValues.publish("shift", "Morning")
    client = _client(monkeypatch)
    rs = client.post(
        "/mateu/v3/sse/e2",
        json={"serverSideType": type_name(FrontDesk), "actionId": "_live-updates", "route": "/e2", "componentState": {}},
    )
    events = _events(rs.text)
    assert events[0]["commands"][0]["data"] == {"id": "shift", "label": None, "value": "Morning"}
    # the stream closed on its own (bounded), with empty heartbeats in between
    assert len(events) >= 2
    assert all(e["commands"] == [] for e in events[1:])
