"""Command center — the Python mirror of Java's ``CommandCenterSyncTest`` (the Ask-Oracle pattern):
``@app(command_center=True)`` advertises the always-present FAB + full-screen palette
(``AppMetadata.commandCenterEnabled``); ``@app(chromeless=True)`` additionally drops the nav chrome
(``AppMetadata.chromeless``) and implies the command center. A plain ``@app`` opts into neither."""

import json
import sys
from pathlib import Path

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import Message, app, button, menu_item, title, ui  # noqa: E402


@ui("cc-home")
@title("CC home")
class CcHome:
    name: str | None = None

    @button()
    def greet(self) -> Message:
        return Message("hi")


@app("Plain app")
class PlainApp:
    @menu_item("Home")
    def home(self) -> "CcHome":
        return CcHome()


@app("Command center app", command_center=True)
class CommandCenterApp:
    @menu_item("Home")
    def home(self) -> "CcHome":
        return CcHome()


@app("Chromeless app", chromeless=True)
class ChromelessApp:
    @menu_item("Home")
    def home(self) -> "CcHome":
        return CcHome()


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def meta(cls) -> dict:
    inc = handler().handle(RunActionRq(server_side_type=type_name(cls)))
    return json.loads(json.dumps(inc.model_dump(by_alias=True, mode="json")))[
        "fragments"
    ][0]["component"]["metadata"]


def test_a_plain_app_enables_neither():
    m = meta(PlainApp)
    assert m["commandCenterEnabled"] is False
    assert m["chromeless"] is False


def test_b_command_center_true_enables_the_fab_without_chromeless():
    m = meta(CommandCenterApp)
    assert m["commandCenterEnabled"] is True
    assert m["chromeless"] is False


def test_c_chromeless_implies_the_command_center():
    m = meta(ChromelessApp)
    assert m["chromeless"] is True
    assert m["commandCenterEnabled"] is True
