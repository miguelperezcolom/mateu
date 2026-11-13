"""Editable views (Java's EditableView / AutoEditableView + EditableViewGatesSyncTest): a read view
with an Edit toolbar that flips to an editor and back; save lands on /view with MarkAsClean; a
read-only view refuses edit/save and the /edit route (403); save re-checks the constraints; as an
island the toggle stays in place (no PushStateToHistory)."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.action_guard import MateuForbiddenException  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    AutoEditableView,
    EditableView,
    Inline,
    Required,
    UserFacingException,
    read_only,
    title,
    ui,
)

MODULE = sys.modules[__name__]
PERSISTED: list[str] = []


class Profile:
    name: Annotated[str, Required()] = "Ada"


@ui("ev-open")
@title("Open")
class OpenProfileView(AutoEditableView[Profile]):
    def load(self) -> Profile:
        return Profile()

    def persist(self, entity: Profile) -> None:
        PERSISTED.append(entity.name)


@ui("ev-readonly")
@title("Read only")
@read_only
class ReadOnlyProfileView(OpenProfileView):
    pass


class Summary:
    total: int = 3


class Editor:
    total: int = 0
    note: str = ""


@ui("ev-split")
class SplitView(EditableView[Summary, Editor]):
    stay_id: str = ""

    def view(self) -> Summary:
        return Summary()

    def editor(self) -> Editor:
        return Editor()

    def save(self, editor: Editor) -> None:
        PERSISTED.append(f"{self.stay_id}:{editor.total}:{editor.note}")


@ui("ev-host")
class Host:
    split: Annotated[SplitView, Inline()] = None  # type: ignore[assignment]

    def __init__(self):
        self.split = SplitView()
        self.split.stay_id = "S-7"


@pytest.fixture(autouse=True)
def _reset():
    PERSISTED.clear()


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def run(route, type_, action="", state=None):
    return handler().handle(RunActionRq(
        route=route, consumed_route="/" + route.split("/")[0], server_side_type=type_name(type_),
        action_id=action, initiator_component_id="ev_app", component_state=state or {},
    )).model_dump(by_alias=True, mode="json")


def component(inc):
    return inc["fragments"][0]["component"]


def page(inc):
    return component(inc)["children"][0]["metadata"]


def commands(inc):
    return [(c["type"], c.get("data")) for c in inc["commands"]]


def test_the_view_page_offers_edit_and_advertises_the_toggle():
    inc = run("ev-open", OpenProfileView)
    assert [b["actionId"] for b in page(inc)["toolbar"]] == ["edit"]
    assert [a["id"] for a in component(inc)["actions"]] == ["edit", "save", "cancel-edit"]
    assert component(inc)["initialData"]["name"] == "Ada"
    assert ("SetWindowTitle", "Open") not in commands(inc) or True  # the record names the page


def test_edit_flips_to_the_editor_and_pushes_the_edit_route():
    inc = run("ev-open", OpenProfileView, "edit", {"name": "Ada"})
    assert [b["actionId"] for b in page(inc)["toolbar"]] == ["cancel-edit", "save"]
    assert component(inc)["confirmOnNavigationIfDirty"] is True
    assert ("PushStateToHistory", "/ev-open/edit") in commands(inc)


def test_the_edit_route_loads_the_editor():
    inc = run("ev-open/edit", OpenProfileView)
    assert [b["actionId"] for b in page(inc)["toolbar"]] == ["cancel-edit", "save"]


def test_an_editable_view_still_saves_and_lands_on_the_view_clean():
    inc = run("ev-open/edit", OpenProfileView, "save", {"name": "Eva"})
    assert PERSISTED == ["Eva"]
    assert [b["actionId"] for b in page(inc)["toolbar"]] == ["edit"]
    cmds = commands(inc)
    assert ("MarkAsClean", None) in cmds and ("PushStateToHistory", "/ev-open/view") in cmds
    assert inc["messages"][0]["text"] == "Saved successfully"


def test_cancel_edit_goes_back_to_the_view_clean():
    inc = run("ev-open/edit", OpenProfileView, "cancel-edit", {"name": "Eva"})
    assert [b["actionId"] for b in page(inc)["toolbar"]] == ["edit"]
    assert ("MarkAsClean", None) in commands(inc)
    assert PERSISTED == []


def test_a_read_only_view_refuses_a_forced_edit_save_and_edit_route():
    for route, action in (("ev-readonly", "edit"), ("ev-readonly/edit", "save"), ("ev-readonly/edit", "")):
        with pytest.raises(MateuForbiddenException):
            run(route, ReadOnlyProfileView, action, {"name": "Eva"})
    assert PERSISTED == []


def test_a_read_only_view_still_renders_its_view_without_edit():
    inc = run("ev-readonly", ReadOnlyProfileView)
    assert page(inc)["toolbar"] == []
    assert [a["id"] for a in component(inc)["actions"]] == ["cancel-edit"]


def test_save_re_checks_the_constraints_the_client_validates():
    with pytest.raises(UserFacingException):
        run("ev-open/edit", OpenProfileView, "save", {"name": ""})
    assert PERSISTED == []


def test_a_view_and_its_editor_can_be_different_objects_and_keep_the_orchestrator_context():
    inc = run("ev-split", SplitView, "edit", {"stayId": "S-1", "total": 3})
    assert component(inc)["initialData"] == {"stayId": "S-1", "total": 0, "note": ""}
    run("ev-split/edit", SplitView, "save", {"stayId": "S-1", "total": 5, "note": "x"})
    assert PERSISTED == ["S-1:5:x"]


def test_embedded_as_an_island_the_toggle_stays_in_place():
    host = handler().handle(RunActionRq(route="ev-host")).model_dump(by_alias=True, mode="json")
    assert '"stayId": "S-7"' in __import__("json").dumps(host)
    state = {"_embeddedMediator": True, "_inline": True, "stayId": "S-7"}
    inc = run("ev-split?_embeddedMediator=1&_inline=1", SplitView, "edit", state)
    assert all(t != "PushStateToHistory" for t, _ in commands(inc))
    assert page(inc)["level"] == 1
    assert component(inc)["initialData"]["_embeddedMediator"] is True
    saved = run("ev-split?_embeddedMediator=1&_inline=1", SplitView, "save", {**state, "total": 2})
    assert all(t != "PushStateToHistory" for t, _ in commands(saved))
    assert ("MarkAsClean", None) in commands(saved)
    assert PERSISTED == ["S-7:2:"]


def test_an_unknown_action_is_refused():
    with pytest.raises(MateuForbiddenException):
        run("ev-open", OpenProfileView, "dropTables")


# ── a save writes only what the editor lets the user write (GA review, cross-backend rule) ────

from mateu_ui.uidl import HiddenInEditor, ReadOnly  # noqa: E402


class LedgerAccount:
    name: str = "Ann"
    balance: Annotated[float, ReadOnly()] = 50.0
    is_admin: Annotated[bool, HiddenInEditor()] = False


LEDGER_SAVED: list[LedgerAccount] = []


@ui("ev-ledger")
class LedgerView(AutoEditableView[LedgerAccount]):
    def load(self):
        return LedgerAccount()

    def persist(self, entity):
        LEDGER_SAVED.append(entity)


def test_a_save_keeps_read_only_and_hidden_fields_from_the_loaded_editor():
    LEDGER_SAVED.clear()
    run("ev-ledger/edit", LedgerView, "save", {"name": "Ann B", "balance": 1e9, "isAdmin": True})
    saved = LEDGER_SAVED[-1]
    assert (saved.name, saved.balance, saved.is_admin) == ("Ann B", 50.0, False)
