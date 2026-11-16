"""``add_mateu(locale=…)`` / ``MATEU_LOCALE`` (Java: ``mateu.locale``) pins the UI language for every
request, whatever the browser's ``Accept-Language``; the app's own ``Translator.locale()`` still wins,
and an invalid value is ignored."""

import json
import logging
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, pinned_locale, type_name  # noqa: E402
from mateu_ui.core.request_context import MateuRequest, bound_request  # noqa: E402
from mateu_ui.fastapi import add_mateu  # noqa: E402
from mateu_ui.uidl import app, menu_item, ui  # noqa: E402


@ui("pinned-locale-probe")
class PinnedProbe:
    name: str = "x"


@app("Pinned locale app")
class PinnedApp:
    @menu_item("Probe")
    def probe(self) -> PinnedProbe:
        return PinnedProbe()


class Catalan:
    def translate(self, text):
        return text

    def locale(self):
        return "ca"


@pytest.fixture(autouse=True)
def _unpinned(monkeypatch):
    monkeypatch.delenv(pinned_locale.ENV_VAR, raising=False)
    pinned_locale.configure(None)
    yield
    pinned_locale.configure(None)


GERMAN = {"accept-language": "de-DE,de;q=0.9"}


def app_locale(headers, translator=None):
    handler = SyncHandler(MateuRegistry(PinnedProbe, PinnedApp), translator=translator)
    with bound_request(MateuRequest(headers=headers)):
        inc = handler.handle(RunActionRq(route="", consumed_route="_empty", server_side_type=type_name(PinnedApp)))
    return json.loads(inc.model_dump_json(by_alias=True))["fragments"][0]["component"]["metadata"].get("locale")


def test_add_mateu_locale_wins_over_the_browsers_language():
    fastapi_app = FastAPI()
    add_mateu(fastapi_app, PinnedProbe, PinnedApp, locale="es")
    answer = TestClient(fastapi_app).post(
        "/mateu/v3/sync/",
        json={"route": "", "consumedRoute": "_empty", "actionId": "", "serverSideType": type_name(PinnedApp)},
        headers={"Accept-Language": "de-DE,de;q=0.9"},
    )
    assert answer.status_code == 200
    assert answer.json()["fragments"][0]["component"]["metadata"]["locale"] == "es"


def test_the_env_var_pins_it_and_a_regional_tag_is_normalised(monkeypatch):
    monkeypatch.setenv(pinned_locale.ENV_VAR, "pt_br")
    assert app_locale(GERMAN) == "pt-BR"


def test_without_it_the_browser_decides():
    assert app_locale(GERMAN) == "de-DE"


def test_an_invalid_value_is_ignored_with_a_warning(caplog):
    pinned_locale.configure("123!")
    with caplog.at_level(logging.WARNING, logger="mateu.locale"):
        assert app_locale(GERMAN) == "de-DE"
    assert "MATEU_LOCALE" in caplog.text


def test_the_apps_translator_still_decides():
    pinned_locale.configure("es")
    assert app_locale(GERMAN, translator=Catalan()) == "ca"
