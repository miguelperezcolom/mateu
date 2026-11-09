"""Class-level @auto_save (Java's @AutoSave): the form carries an AutoSave trigger naming the
action and the debounce, advertises the "*" catch-all next to the action, and the debounced
action runs the view's method."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import Message, auto_save, ui  # noqa: E402

MODULE = sys.modules[__name__]
SAVED: list[str] = []


@ui("settings-auto")
@auto_save()
class Settings:
    nickname: str = "ada"

    def save(self):
        SAVED.append(self.nickname)
        return Message("Saved")


@ui("drafts-auto")
@auto_save(debounce_millis=250, action="store_draft")
class Draft:
    body: str = ""

    def store_draft(self):
        SAVED.append("draft:" + self.body)


def run(cls, action="", state=None):
    return SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        server_side_type=type_name(cls), action_id=action, component_state=state or {},
    )).model_dump(by_alias=True, mode="json")


def test_defaults_are_save_every_800_ms():
    comp = run(Settings)["fragments"][0]["component"]
    assert {"type": "AutoSave", "actionId": "save", "debounceMillis": 800} in comp["triggers"]
    assert [a["id"] for a in comp["actions"]][:2] == ["*", "save"]


def test_the_named_action_is_camel_cased_and_runs():
    comp = run(Draft)["fragments"][0]["component"]
    assert {"type": "AutoSave", "actionId": "storeDraft", "debounceMillis": 250} in comp["triggers"]
    SAVED.clear()
    run(Draft, "storeDraft", {"body": "hello"})
    run(Settings, "save", {"nickname": "eva"})
    assert SAVED == ["draft:hello", "eva"]


def test_a_view_without_it_has_no_auto_save_trigger():
    @ui("plain-auto")
    class Plain:
        x: str = ""

    assert getattr(Plain, "__mateu_auto_save__", None) is None
