"""``actions:`` beside ``layout:`` on a definition-only page (the Python mirror of Java's
YamlDeclaredActionsSyncTest): the page answers with ITS declared actions (never the "*" wildcard),
each a client-runnable restAction / flow; a refused one (``access:``) is not advertised; and a
PROXIED rest action is served by ``__restfetch__`` from the definition — the only channel that
injects ``${secret.X}`` — while a direct one is the browser's to call (403 when proxied on request)."""

from __future__ import annotations

import json
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
from mateu_ui.uidl import Identity  # noqa: E402

MODULE = sys.modules[__name__]


def page(base_url: str) -> str:
    return f"""
actions:
  - id: create
    restAction:
      source:
        url: "{base_url}/people"
        method: POST
        body: '{{"name": "${{state.name}}"}}'
        headers: {{X-Api-Key: "${{secret.SWAPI}}", Content-Type: application/json}}
        proxy: true
      successMessage: Created
  - id: ping
    restAction:
      source: {{url: "{base_url}/ping"}}
  - id: back
    steps:
      - {{type: Navigate, route: people}}
  - id: purge
    access: {{roles: [admin]}}
    restAction:
      source: {{url: "{base_url}/purge", method: DELETE, proxy: true}}
  - id: nothing
layout:
  type: VerticalLayout
  content:
    - {{type: FormField, id: name, label: Name}}
    - {{type: Button, label: Create, actionId: create}}
"""


def handler(tmp_path: Path, base_url: str = "http://127.0.0.1:9", roles=()) -> SyncHandler:
    (tmp_path / "routes.yaml").write_text("routes:\n  - route: people/new\n    layout: new.yaml\n")
    (tmp_path / "new.yaml").write_text(page(base_url))
    h = SyncHandler(
        MateuRegistry(MODULE),
        rest_sources=RestSourceRegistry(directory=str(tmp_path)),
        identity_provider=lambda: Identity(roles=tuple(roles)),
    )
    h.routes = RouteRegistry(str(tmp_path))
    h.yaml_specs = YamlSpecLoader(str(tmp_path), h.routes)
    return h


def component(h: SyncHandler) -> dict:
    inc = h.handle(RunActionRq(route="people/new"))
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]


def test_the_page_advertises_its_declared_actions_and_never_the_wildcard(tmp_path):
    page_ = component(handler(tmp_path))
    assert page_["type"] == "ServerSide"
    ids = [a["id"] for a in page_["actions"]]
    assert ids == ["create", "ping", "back"]  # purge refused, `nothing` not client-runnable
    create = page_["actions"][0]
    assert create["restAction"]["successMessage"] == "Created"
    assert create["restAction"]["source"]["proxy"] is True
    # a proxied source's request (its secret header, its body) never reaches the client
    assert create["restAction"]["source"].get("headers") is None
    assert page_["actions"][2]["commands"][0]["type"] == "NavigateTo"


def test_an_admin_sees_the_restricted_action(tmp_path):
    ids = [a["id"] for a in component(handler(tmp_path, roles=("admin",)))["actions"]]
    assert "purge" in ids


def test_a_proxied_rest_action_runs_on_the_server_with_its_secret(tmp_path, monkeypatch):
    seen: dict = {}

    class Api(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def do_POST(self):  # noqa: N802
            seen["key"] = self.headers.get("X-Api-Key")
            seen["body"] = self.rfile.read(int(self.headers.get("Content-Length") or 0)).decode()
            body = b'{"id": 7}'
            self.send_response(200)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    server = ThreadingHTTPServer(("127.0.0.1", 0), Api)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    monkeypatch.setenv("MATEU_SECRET_SWAPI", "s3cr3t")
    try:
        h = handler(tmp_path, f"http://127.0.0.1:{server.server_address[1]}")
        rq = RunActionRq(
            route="people/new",
            action_id="__restfetch__",
            component_state={"name": 'Leia "Princess"'},
            parameters={"_sourceKind": "action", "_sourceId": "create"},
        )
        answer = h.handle(rq).model_dump(by_alias=True, mode="json")["appData"]
    finally:
        server.shutdown()
    assert answer["_restfetch"] == {"id": 7}
    assert seen["key"] == "s3cr3t"
    assert json.loads(seen["body"]) == {"name": 'Leia "Princess"'}


def test_a_direct_rest_action_is_not_proxied_on_request(tmp_path):
    rq = RunActionRq(
        route="people/new",
        action_id="__restfetch__",
        parameters={"_sourceKind": "action", "_sourceId": "ping"},
    )
    with pytest.raises(MateuForbiddenException):
        handler(tmp_path).handle(rq)
