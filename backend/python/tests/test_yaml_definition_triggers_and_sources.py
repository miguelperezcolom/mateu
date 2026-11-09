"""A definition-only page's ``triggers:`` and its PROXIED reads — the rest of Java's
``SeededYamlPage`` (the Python mirror of Java's YamlDeclaredTriggersSyncTest and
SeededYamlPageRestSourcesTest, and .NET's YamlDefinitionTriggersAndSourcesTests): the declared
triggers reach the wire as Java's TriggerMapper emits them, and a listing's rows / a select's
options read off a keyed catalogue entry are fetched by the server through ``__restfetch__`` (the
source resolved off the catalogue ``ref``, ``${secret.X}`` from ``MATEU_SECRET_<X>``) — never from a
client url, never a direct source on request."""

from __future__ import annotations

import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuForbiddenException, MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_ui.core.rest_source_registry import RestSourceRegistry  # noqa: E402
from mateu_ui.core.route_registry import RouteRegistry  # noqa: E402
from mateu_ui.core.yaml_spec_loader import YamlSpecLoader  # noqa: E402

MODULE = sys.modules[__name__]

ROUTES = """
routes:
  - route: watch
    layout: watch.yaml
  - route: products
    layout: products.yaml
  - route: catalogue
    layout: catalogue.yaml
  - route: about
    layout: about.yaml
"""

WATCH = """
layout:
  type: VerticalLayout
  content:
    - {type: FormField, id: amount, label: Amount}
triggers:
  - {type: OnLoadTrigger, actionId: preload}
  - {type: OnCustomEventTrigger, actionId: refresh, eventName: something-happened}
  - {type: OnValueChangeTrigger, actionId: recompute, propertyName: amount}
  - {type: AutoSaveTrigger, actionId: save, debounceMillis: 300}
  - {type: NoSuchTrigger, actionId: lost}
  - {type: OnCustomEventTrigger, actionId: lost, eventName: x, source: NOWHERE}
"""

PRODUCTS = """
layout:
  type: VerticalLayout
  content:
    - {type: FormField, id: category, label: Category, stereotype: select, optionsSource: {ref: categories}}
    - {type: FormField, id: other, label: Other, stereotype: select, optionsSource: {ref: open}}
    - type: Listing
      title: Products
      rowsSource: {ref: products}
      columns:
        - {type: GridColumn, id: name, label: Name}
"""

CATALOGUE = """
type: Listing
title: Catalogue
rowsSource: {ref: products}
columns:
  - {type: GridColumn, id: name, label: Name}
"""

ABOUT = """
layout:
  type: VerticalLayout
  content:
    - {type: Text, text: About}
"""


def sources(base_url: str) -> str:
    return f"""
sources:
  - name: products
    source:
      url: "{base_url}/products"
      proxy: true
      headers: {{X-Api-Key: "${{secret.API_KEY}}"}}
  - name: categories
    source:
      url: "{base_url}/categories"
      proxy: true
      headers: {{X-Api-Key: "${{secret.API_KEY}}"}}
  - name: open
    source:
      url: "{base_url}/open"
"""


def handler(tmp_path: Path, base_url: str = "http://127.0.0.1:9") -> SyncHandler:
    for name, text in {
        "routes.yaml": ROUTES,
        "watch.yaml": WATCH,
        "products.yaml": PRODUCTS,
        "catalogue.yaml": CATALOGUE,
        "about.yaml": ABOUT,
        "sources.yaml": sources(base_url),
    }.items():
        (tmp_path / name).write_text(text)
    h = SyncHandler(MateuRegistry(MODULE), rest_sources=RestSourceRegistry(directory=str(tmp_path)))
    h.routes = RouteRegistry(str(tmp_path))
    h.yaml_specs = YamlSpecLoader(str(tmp_path), h.routes)
    return h


def component(h: SyncHandler, route: str) -> dict:
    inc = h.handle(RunActionRq(route=route))
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]


def test_a_page_declaring_triggers_is_a_server_side_component_carrying_them(tmp_path):
    page = component(handler(tmp_path), "watch")
    assert page["type"] == "ServerSide"
    triggers = page["triggers"]
    # the unparseable ones (unknown type, unknown source) are dropped, the rest kept in order
    assert [t["actionId"] for t in triggers] == ["preload", "refresh", "recompute", "save"]
    assert triggers[0]["type"] == "OnLoad"
    # an absent `times` is 0, as Java's record reads it
    assert triggers[0]["times"] == 0
    assert triggers[1]["eventName"] == "something-happened"
    # a YAML custom-event trigger without a source listens on itself, as Java's record defaults
    assert triggers[1]["source"] == "SELF"
    assert triggers[2]["propertyName"] == "amount"
    assert triggers[3] == {"type": "AutoSave", "actionId": "save", "debounceMillis": 300}
    # triggers alone claim no action
    assert not page.get("actions")


def test_a_page_without_declared_triggers_keeps_its_bare_layout(tmp_path):
    assert component(handler(tmp_path), "about")["type"] != "ServerSide"


def test_a_proxied_listing_or_select_makes_the_page_answer_restfetch(tmp_path):
    h = handler(tmp_path)
    page = component(h, "products")
    assert [a["id"] for a in page["actions"]] == ["__restfetch__"]
    assert page["pageType"] == "form"
    dumped = str(h.handle(RunActionRq(route="products")).model_dump(by_alias=True, mode="json"))
    assert "API_KEY" not in dumped
    assert "X-Api-Key" not in dumped


def test_a_listing_page_served_for_its_proxied_rows_is_a_collection(tmp_path):
    page = component(handler(tmp_path), "catalogue")
    assert page["pageType"] == "collection"
    assert [a["id"] for a in page["actions"]] == ["__restfetch__"]


@pytest.fixture
def api():
    seen: dict = {}

    class Api(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def do_GET(self):  # noqa: N802
            seen["path"] = self.path
            seen["key"] = self.headers.get("X-Api-Key")
            body = b'{"items": []}'
            self.send_response(200)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    server = ThreadingHTTPServer(("127.0.0.1", 0), Api)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        yield f"http://127.0.0.1:{server.server_address[1]}", seen
    finally:
        server.shutdown()


def fetch(h: SyncHandler, kind: str, source_id: str) -> dict:
    rq = RunActionRq(
        route="products",
        action_id="__restfetch__",
        parameters={"_sourceKind": kind, "_sourceId": source_id},
    )
    return h.handle(rq).model_dump(by_alias=True, mode="json")["appData"]


def test_the_listings_rows_are_fetched_by_the_server_with_the_secret(tmp_path, api, monkeypatch):
    base_url, seen = api
    monkeypatch.setenv("MATEU_SECRET_API_KEY", "s3cr3t")
    # a listing with no id is named like the listing mapper's default
    answer = fetch(handler(tmp_path, base_url), "rows", "crud")
    assert answer["_restfetch"] == {"items": []}
    assert seen == {"path": "/products", "key": "s3cr3t"}


def test_a_selects_options_are_fetched_by_the_fields_id(tmp_path, api, monkeypatch):
    base_url, seen = api
    monkeypatch.setenv("MATEU_SECRET_API_KEY", "s3cr3t")
    fetch(handler(tmp_path, base_url), "options", "category")
    assert seen == {"path": "/categories", "key": "s3cr3t"}


def test_a_direct_source_is_not_proxied_on_request(tmp_path):
    with pytest.raises(MateuForbiddenException):
        fetch(handler(tmp_path), "options", "other")


def test_a_wrapped_page_that_fills_a_template_is_the_templates_kind_of_page(tmp_path):
    h = handler(tmp_path)
    (tmp_path / "routes.yaml").write_text(ROUTES + "  - route: person\n    layout: person.yaml\n")
    (tmp_path / "person.yaml").write_text(
        """
type: Form
title: Leia
template: {type: ItemOverviewPage}
content:
  - {type: Text, text: Hello}
triggers:
  - {type: OnLoadTrigger, actionId: preload}
"""
    )
    h.routes = RouteRegistry(str(tmp_path))
    h.yaml_specs = YamlSpecLoader(str(tmp_path), h.routes)
    page = component(h, "person")
    assert page["type"] == "ServerSide"
    # Java's SeededYamlPage.declaredPageType: the template's kind, not the form default
    assert page["pageType"] == "detail"


def test_an_undeclared_source_fetches_nothing(tmp_path, api):
    base_url, seen = api
    assert fetch(handler(tmp_path, base_url), "options", "nope") == {"_restfetch": {}}
    assert seen == {}
