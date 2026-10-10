"""Access keys — the Python mirror of Java's ``AccessKeysSyncTest``: ``@app(access_keys=True)``
turns on the keyboard access-keys mode (``AppMetadata.accessKeys``); it is opt-in."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import app, menu_item, title, ui  # noqa: E402


@ui("ak-home")
@title("AK home")
class AkHome:
    name: str | None = None


@app("Plain app")
class AkPlainApp:
    @menu_item("Home")
    def home(self) -> "AkHome":
        return AkHome()


@app("Access keys app", access_keys=True)
class AccessKeysApp:
    @menu_item("Home")
    def home(self) -> "AkHome":
        return AkHome()


MODULE = sys.modules[__name__]


def meta(cls) -> dict:
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(server_side_type=type_name(cls)))
    return json.loads(json.dumps(inc.model_dump(by_alias=True, mode="json")))[
        "fragments"
    ][0]["component"]["metadata"]


def test_access_keys_are_opt_in():
    assert meta(AkPlainApp)["accessKeys"] is False
    assert meta(AccessKeysApp)["accessKeys"] is True
