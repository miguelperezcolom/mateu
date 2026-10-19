"""Security paths end to end: the proxied leg against a REAL upstream (secrets travel upstream only,
JSON bodies escape the client's values, failures surface) and the native MCP endpoint (off unless
enabled, through the same RBAC and error boundary as the sync endpoint). Mirrors Java's
``RestProxySecretsSyncTest`` and ``AdapterParityITFoundation``."""

from __future__ import annotations

import json
import logging
import os
import sys
import threading
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

fastapi = pytest.importorskip("fastapi")
from fastapi.testclient import TestClient  # noqa: E402

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.fastapi import add_mateu  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    DeclaredRestSource,
    EyesOnly,
    RestDataSource,
    RestSourceKind,
    RestSourceSupplier,
    button,
    title,
    ui,
)

MODULE = sys.modules[__name__]
API_KEY = "test-key-" + uuid.uuid4().hex

# ── a real upstream ──────────────────────────────────────────────────────────

RECEIVED: list[dict] = []
STATUS_FOR = {"/fail": 500, "/gone": 204}


class _Upstream(BaseHTTPRequestHandler):
    def _answer(self):
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length).decode() if length else ""
        RECEIVED.append(
            {"method": self.command, "path": self.path, "body": body,
             **{k.lower(): v for k, v in self.headers.items()}}
        )
        status = STATUS_FOR.get(self.path, 200)
        self.send_response(status)
        if status == 204:
            self.end_headers()
            return
        out = json.dumps({"id": 42}).encode()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(out)))
        self.end_headers()
        self.wfile.write(out)

    do_GET = do_POST = do_PUT = do_DELETE = _answer

    def log_message(self, *args):  # keep the test output quiet
        pass


@pytest.fixture(scope="module")
def upstream():
    server = ThreadingHTTPServer(("127.0.0.1", 0), _Upstream)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{server.server_address[1]}"
    server.shutdown()


@pytest.fixture(autouse=True)
def _clear():
    RECEIVED.clear()


@ui("proxy-secrets")
@title("Proxy secrets")
class ProxySecrets(RestSourceSupplier):
    """The upstream's origin comes from server-held configuration (the secrets provider), never
    from the request — the invariant RestSourceSupplier rests on."""

    name: str = ""

    def declared_rest_sources(self):
        origin = "${secret.UPSTREAM}"
        return [
            DeclaredRestSource(
                RestSourceKind.ACTION,
                RestDataSource(
                    url=origin + "/people",
                    method="POST",
                    headers={"X-Api-Key": "${secret.API_KEY}", "Content-Type": "application/json"},
                    body='{"name":"${state.name}"}',
                    proxy=True,
                ),
                id="create",
            ),
            DeclaredRestSource(
                RestSourceKind.ACTION,
                RestDataSource(url=origin + "/leak", headers={"X-Home": "${secret.HOME}"}, proxy=True),
                id="leak",
            ),
            DeclaredRestSource(
                RestSourceKind.ACTION, RestDataSource(url=origin + "/fail", method="PUT", proxy=True), id="fail"
            ),
            DeclaredRestSource(
                RestSourceKind.ACTION,
                RestDataSource(url=origin + "/gone", method="DELETE", proxy=True),
                id="remove",
            ),
            DeclaredRestSource(
                RestSourceKind.ACTION,
                RestDataSource(url="${secret.FILE_ORIGIN}/etc/passwd", proxy=True),
                id="file",
            ),
        ]


def proxy_handler(upstream_origin: str) -> SyncHandler:
    secrets = {
        "UPSTREAM": upstream_origin,
        "API_KEY": API_KEY,
        "FILE_ORIGIN": "file://" + API_KEY,
    }
    return SyncHandler(MateuRegistry(MODULE), secrets_provider=secrets.get)


def fetch(h: SyncHandler, source_id: str, state: dict | None = None):
    return h.handle(
        RunActionRq(
            server_side_type=type_name(ProxySecrets),
            route="proxy-secrets",
            action_id="__restfetch__",
            parameters={"_sourceKind": "action", "_sourceId": source_id},
            component_state=state or {},
        )
    )


def test_the_secret_header_is_resolved_on_the_server_and_never_travels_back(upstream):
    inc = fetch(proxy_handler(upstream), "create", {"name": "Ana"})
    [rq] = RECEIVED
    assert rq["method"] == "POST" and rq["path"] == "/people"
    assert rq["x-api-key"] == API_KEY
    assert inc.app_data == {"_restfetch": {"id": 42}}
    assert API_KEY not in inc.model_dump_json(by_alias=True)


def test_a_json_body_carries_the_state_values_escaped(upstream):
    tricky = 'Ana "la" O\'Neil\nsecond", "admin": true, "x":"'
    fetch(proxy_handler(upstream), "create", {"name": tricky})
    assert json.loads(RECEIVED[0]["body"]) == {"name": tricky}


def test_a_secret_falls_back_only_to_its_mateu_secret_variable(upstream, monkeypatch):
    monkeypatch.setenv("HOME", "/home/precondition")
    monkeypatch.delenv("MATEU_SECRET_HOME", raising=False)
    fetch(proxy_handler(upstream), "leak")
    assert "/home/precondition" not in RECEIVED[0].get("x-home", "")


def test_an_upstream_error_surfaces_its_status_instead_of_an_empty_success(upstream):
    inc = fetch(proxy_handler(upstream), "fail")
    assert inc.app_data == {
        "_restfetchError": {"status": 500, "message": "Request failed (HTTP 500)"}
    }


def test_a_no_content_answer_is_a_success(upstream):
    inc = fetch(proxy_handler(upstream), "remove")
    assert RECEIVED[0]["method"] == "DELETE"
    assert inc.app_data == {"_restfetch": {}}


def test_a_transport_error_surfaces_without_a_status():
    # a closed port: refused at connect
    inc = fetch(proxy_handler("http://127.0.0.1:1"), "create", {"name": "x"})
    assert inc.app_data == {"_restfetchError": {"status": 0, "message": "Request failed"}}


def test_a_non_http_url_is_refused_and_the_log_never_shows_the_resolved_secret(upstream, caplog):
    with caplog.at_level(logging.WARNING):
        inc = fetch(proxy_handler(upstream), "file")
    assert inc.app_data["_restfetchError"]["status"] == 0
    assert RECEIVED == []
    assert all(API_KEY not in rec.getMessage() for rec in caplog.records)


# ── the native MCP endpoint ──────────────────────────────────────────────────


@ui("mcp-probe")
@title("Mcp probe")
class McpProbe:
    public: str = "everyone"
    salary: Annotated[str, EyesOnly(roles=("hr",))] = "100k"

    @button()
    def explode(self):
        raise RuntimeError("db password is hunter2")


def mcp_client(**kwargs) -> TestClient:
    app = fastapi.FastAPI()
    add_mateu(app, MODULE, **kwargs)
    return TestClient(app)


def tool_call(c: TestClient, name: str, arguments: dict):
    r = c.post(
        "/mateu/mcp",
        json={"jsonrpc": "2.0", "id": 7, "method": "tools/call",
              "params": {"name": name, "arguments": arguments}},
    )
    assert r.status_code == 200
    return r.json()["result"]


def test_mcp_is_off_by_default(monkeypatch):
    monkeypatch.delenv("MATEU_MCP_ENABLED", raising=False)
    r = mcp_client().post("/mateu/mcp", json={"jsonrpc": "2.0", "id": 1, "method": "initialize"})
    assert r.status_code == 404


def test_mcp_is_served_when_enabled_by_argument_or_environment(monkeypatch):
    monkeypatch.delenv("MATEU_MCP_ENABLED", raising=False)
    r = mcp_client(mcp=True).post("/mateu/mcp", json={"jsonrpc": "2.0", "id": 1, "method": "initialize"})
    assert "protocolVersion" in r.json()["result"]
    monkeypatch.setenv("MATEU_MCP_ENABLED", "true")
    r = mcp_client().post("/mateu/mcp", json={"jsonrpc": "2.0", "method": "notifications/initialized"})
    assert r.status_code == 202
    # ...and an explicit False wins over the environment
    r = mcp_client(mcp=False).post("/mateu/mcp", json={"jsonrpc": "2.0", "id": 1, "method": "ping"})
    assert r.status_code == 404


def test_a_malformed_mcp_message_is_a_json_rpc_parse_error_not_a_500():
    r = mcp_client(mcp=True).post("/mateu/mcp", content=b"{not json", headers={"content-type": "application/json"})
    assert r.status_code == 200
    assert r.json()["error"]["code"] == -32700


# The bodies a cross-site page can make the browser send WITHOUT a CORS preflight: refused with 415
# on sync, SSE and MCP, so a forged request carrying the user's cookies never reaches an action.
# Mirrors Java's AdapterParityITFoundation.refusesANonJsonBody… and the .NET twin.
@pytest.mark.parametrize(
    "content_type",
    ["text/plain", "application/x-www-form-urlencoded", "multipart/form-data; boundary=x", None],
)
def test_a_body_that_is_not_declared_json_is_refused_with_415(content_type):
    c = mcp_client(mcp=True)
    rq = json.dumps({"route": "mcp-probe", "actionId": "", "componentState": {}}).encode()
    mcp = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "initialize"}).encode()
    for path, body in [
        ("/mateu/v3/sync/mcp-probe", rq),
        ("/mateu/v3/sync", rq),
        ("/mateu/v3/sse/mcp-probe", rq),
        ("/mateu/v3/components/_/action", rq),
        ("/mateu/mcp", mcp),
    ]:
        headers = {} if content_type is None else {"content-type": content_type}
        r = c.post(path, content=body, headers=headers)
        assert r.status_code == 415, (path, content_type, r.status_code)
    ok = c.post("/mateu/mcp", content=mcp, headers={"content-type": "application/json; charset=utf-8"})
    assert ok.status_code == 200


# The other spellings a router may still send to the same handler — percent-encoded letters,
# ;matrix parameters, doubled or trailing slashes, dot segments, another case — never run a
# CORS-simple POST either: 415, or not routed at all (4xx), never 2xx. (Java's guard compared the
# RAW URI and /%6Dateu/mcp ran JSON-RPC; here the check sits on the matched endpoint.)
@pytest.mark.parametrize(
    "path",
    [
        "/%6Dateu/mcp",
        "/%6dateu/%6Dcp",
        "/mateu/mcp;x=1",
        "/mateu;x=1/mcp",
        "//mateu/mcp",
        "/mateu//mcp",
        "/mateu/mcp/",
        "/x/../mateu/mcp",
        "/MATEU/MCP",
        "/%6Dateu/v3/sync/mcp-probe",
        "/mateu/%76%33/sse/mcp-probe",
        "/mateu/v3/sync/mcp-probe;x=1",
        "/mateu/v3/sync/mcp-probe/",
    ],
)
def test_no_other_spelling_of_an_action_endpoint_takes_a_non_json_body(path):
    c = mcp_client(mcp=True)
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "initialize", "route": "mcp-probe",
                       "actionId": "", "componentState": {}}).encode()
    for content_type in ["text/plain", "application/x-www-form-urlencoded", None]:
        headers = {} if content_type is None else {"content-type": content_type}
        r = c.post(path, content=body, headers=headers)
        assert r.status_code >= 400, (path, content_type, r.status_code)


def test_an_mcp_tool_call_that_fails_goes_through_the_error_boundary():
    result = tool_call(mcp_client(mcp=True, dev=False), "mateu_run_action",
                       {"route": "mcp-probe", "actionId": "explode"})
    text = result["content"][0]["text"]
    assert "hunter2" not in text
    assert "Reference" in text


def test_mcp_applies_the_same_rbac_as_sync():
    result = tool_call(mcp_client(mcp=True), "mateu_describe_screen", {"route": "mcp-probe"})
    text = result["content"][0]["text"]
    assert "public" in text
    assert "salary" not in text and "100k" not in text


def test_the_environment_flag_reads_only_true_values(monkeypatch):
    from mateu_ui.fastapi import mcp_enabled_from_env

    for value, expected in (("true", True), ("1", True), ("YES", True), ("false", False), ("", False)):
        monkeypatch.setenv("MATEU_MCP_ENABLED", value)
        assert mcp_enabled_from_env() is expected
    monkeypatch.delenv("MATEU_MCP_ENABLED")
    assert mcp_enabled_from_env() is False
    assert os.environ.get("MATEU_MCP_ENABLED") is None
