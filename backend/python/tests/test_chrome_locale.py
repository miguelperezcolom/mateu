"""The shell chrome language follows the browser's ``Accept-Language`` when the app's translator
declares none — Java's DefaultTranslator.locale does; the port sent no locale, so the chrome of a
Python app stayed in the host page's language."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.request_context import MateuRequest, bound_request  # noqa: E402
from mateu_ui.uidl import app, menu_item, ui  # noqa: E402


@ui("locale-probe")
class LocaleProbe:
    name: str = "x"


@app("Locale app")
class LocaleApp:
    @menu_item("Probe")
    def probe(self) -> LocaleProbe:
        return LocaleProbe()


def app_locale(headers):
    handler = SyncHandler(MateuRegistry(LocaleProbe, LocaleApp))
    with bound_request(MateuRequest(headers=headers)):
        inc = handler.handle(RunActionRq(route="", consumed_route="_empty", server_side_type=type_name(LocaleApp)))
    return json.loads(inc.model_dump_json(by_alias=True))["fragments"][0]["component"]["metadata"].get("locale")


def test_the_app_locale_follows_accept_language():
    assert app_locale({"accept-language": "es-ES,es;q=0.9,en;q=0.8"}) == "es-ES"


def test_no_accept_language_no_locale():
    assert app_locale({}) is None
