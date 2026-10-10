"""The UI language travels on the app shell (``AppMetadata.locale``) — the Python mirror of Java's
``AppLocaleSyncTest``: it is what the translator says; with no translator, nothing (the browser
decides)."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import Translator, app, menu_item, title, ui  # noqa: E402


@ui("locale-home")
@title("Locale home")
class LocaleHome:
    name: str | None = None


@app("Locale app")
class LocaleApp:
    @menu_item("Home")
    def home(self) -> "LocaleHome":
        return LocaleHome()


class CatalanTranslator(Translator):
    def translate(self, key: str) -> str:
        return key

    def locale(self):
        return "ca"


class PlainTranslator(Translator):
    def translate(self, key: str) -> str:
        return key


MODULE = sys.modules[__name__]


def meta(translator=None) -> dict:
    inc = SyncHandler(MateuRegistry(MODULE), translator).handle(
        RunActionRq(server_side_type=type_name(LocaleApp))
    )
    return json.loads(json.dumps(inc.model_dump(by_alias=True, mode="json")))["fragments"][0][
        "component"
    ]["metadata"]


def test_the_translator_decides_the_ui_language():
    assert meta(CatalanTranslator())["locale"] == "ca"


def test_no_translator_or_a_silent_one_leaves_it_to_the_browser():
    assert meta().get("locale") is None
    assert meta(PlainTranslator()).get("locale") is None
