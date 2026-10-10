"""Translations for YAML apps (the Python mirror of Java's YamlTranslationsSyncTest): ``type:
Translations`` files + the ``translations/<locale>.yaml`` convention + ``TranslationsSupplier``
classes (authored wins), ``${i18n.key}`` resolved per request locale with the exact → language →
fallback → key chain and one WARN per missing key."""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_core.request_context import MateuRequest, bound_request  # noqa: E402
from mateu_core.route_registry import RouteRegistry  # noqa: E402
from mateu_core.translations import TranslationRegistry  # noqa: E402
from mateu_core.yaml_spec_loader import YamlSpecLoader  # noqa: E402
from mateu_uidl import Translations, TranslationsSupplier  # noqa: E402


class CodeMessages(TranslationsSupplier):
    def translations(self):
        return [
            Translations("es", {"orders": {"title": "Pedidos (código)", "code": "Solo en código"}}),
        ]


MODULE = sys.modules[__name__]


def specs(tmp_path: Path) -> Path:
    (tmp_path / "translations").mkdir()
    (tmp_path / "translations" / "en.yaml").write_text(
        "messages:\n  orders:\n    title: Orders\n    onlyEnglish: Only in English\n"
    )
    (tmp_path / "es.yaml").write_text(
        "type: Translations\nlocale: es\nmessages:\n  orders:\n    title: Pedidos\n"
    )
    (tmp_path / "routes.yaml").write_text("routes:\n  - route: orders\n    layout: orders.yaml\n")
    (tmp_path / "orders.yaml").write_text(
        "layout:\n  type: VerticalLayout\n  content:\n"
        '    - {type: Text, text: "${i18n.orders.title}"}\n'
        '    - {type: Text, text: "Fallback: ${i18n.orders.onlyEnglish}"}\n'
        '    - {type: Text, text: "Missing: ${i18n.orders.nope}"}\n'
        '    - {type: Text, text: "Code: ${i18n.orders.code}"}\n'
    )
    return tmp_path


def render(directory: Path, accept_language: str | None) -> str:
    registry = MateuRegistry(CodeMessages)
    translations = TranslationRegistry(str(directory), registry.translations_suppliers)
    h = SyncHandler(registry, translations=translations)
    h.routes = RouteRegistry(str(directory))
    h.yaml_specs = YamlSpecLoader(str(directory), h.routes, translations=translations)
    headers = {"accept-language": accept_language} if accept_language else {}
    with bound_request(MateuRequest(headers=headers)):
        return json.dumps(h.handle(RunActionRq(route="/orders")).model_dump(by_alias=True, mode="json"))


def test_the_catalogue_merges_files_and_code_with_authored_winning(tmp_path):
    registry = MateuRegistry(CodeMessages)
    t = TranslationRegistry(str(specs(tmp_path)), registry.translations_suppliers)
    assert t.message("orders.title", "es") == "Pedidos"  # the file wins over the supplier
    assert t.message("orders.code", "es") == "Solo en código"  # the supplier still contributes
    assert t.message("orders.title", "en") == "Orders"  # locale from the conventional file name


def test_labels_follow_the_request_locale(tmp_path):
    directory = specs(tmp_path)
    es = render(directory, "es-ES,es;q=0.9")
    assert "Pedidos" in es and "${i18n" not in es
    assert "Fallback: Only in English" in es  # es-ES → es → en
    en = render(directory, "en")
    assert "Orders" in en and "Pedidos" not in en
    assert "Orders" in render(directory, None)  # no locale → the fallback


def test_a_missing_key_shows_the_key_and_warns_once(tmp_path, caplog):
    directory = specs(tmp_path)
    t = TranslationRegistry(str(directory))
    with caplog.at_level(logging.WARNING, logger="mateu.i18n"):
        assert t.interpolate("Missing: ${i18n.orders.nope}", "es") == "Missing: orders.nope"
        t.interpolate("${i18n.orders.nope}", "es")
    assert sum("orders.nope" in r.message for r in caplog.records) == 1


def test_the_fallback_locale_is_configurable(tmp_path, monkeypatch):
    directory = specs(tmp_path)
    monkeypatch.setenv("MATEU_I18N_FALLBACK", "es")
    t = TranslationRegistry(str(directory))
    assert t.message("orders.title", "fr") == "Pedidos"


def test_a_view_label_resolves_i18n_through_the_mapper(tmp_path):
    directory = specs(tmp_path)
    h = SyncHandler(MateuRegistry(MODULE), translations=TranslationRegistry(str(directory)))
    with bound_request(MateuRequest(headers={"accept-language": "es"})):
        assert h.mapper.T("${i18n.orders.title}") == "Pedidos"
        assert h.mapper.T("orders.title") == "Pedidos"  # a text that IS a key, no app translator
