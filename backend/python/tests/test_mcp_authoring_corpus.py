"""The Python side of ``conformance/mcp/authoring.json`` — the MCP authoring contract the Java
reference generates and every implementation pins: the tool list (byte for byte), the resource
list, the validation reports, the preview of a sample page, the component list and the component
schemas. A port that disagrees is fixed; the corpus is never regenerated to match it."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler
from mateu_ui.core import mcp
from mateu_ui.core.authoring import (
    UidlValidator,
    ValidationContext,
    list_components,
    schema_of,
    specs_schema,
)
from mateu_ui.uidl import UserFacingException, title, ui


def _corpus_file() -> Path | None:
    for parent in Path(__file__).resolve().parents:
        candidate = parent / "conformance" / "mcp" / "authoring.json"
        if candidate.is_file():
            return candidate
    return None


CORPUS_FILE = _corpus_file()
pytestmark = pytest.mark.skipif(CORPUS_FILE is None, reason="the conformance corpus is not present")
CORPUS = json.loads(CORPUS_FILE.read_text(encoding="utf-8")) if CORPUS_FILE else {}


@ui("mcp-authoring-home")
@title("Authoring home")
class AuthoringHome:
    pass


MODULE = sys.modules[__name__]


def sync_fn(route, action_id, component_state, parameters):
    handler = SyncHandler(MateuRegistry(MODULE))
    rq = RunActionRq(
        route=route or "",
        action_id=action_id or "",
        component_state=component_state or {},
        parameters=parameters or {},
    )
    return handler.handle(rq).model_dump(by_alias=True, mode="json")


def context_of(raw):
    if raw is None:
        return None
    return ValidationContext.of(
        raw.get("sources"), raw.get("partials"), raw.get("components"), raw.get("actions"), raw.get("fieldTypes")
    )


def normalized(report: dict) -> dict:
    """A yaml_syntax issue's message/line/column are the YAML parser's own: not compared."""
    for issue in report["errors"]:
        if issue["code"] == "yaml_syntax":
            for key in ("message", "line", "column"):
                issue.pop(key, None)
    return report


def test_tools_list_is_the_corpus_byte_for_byte():
    assert json.dumps(mcp.tools(False)) == json.dumps(CORPUS["tools"])
    assert json.dumps(mcp.tools(True)[len(CORPUS["tools"]):]) == json.dumps(CORPUS["devTools"])


def test_tools_list_over_jsonrpc_follows_dev_mode(monkeypatch):
    from mateu_ui.core import dev_specs

    monkeypatch.setattr(dev_specs, "_forced", False)
    listed = mcp.handle_jsonrpc({"id": 1, "method": "tools/list"}, sync_fn)["result"]["tools"]
    assert listed == CORPUS["tools"]
    monkeypatch.setattr(dev_specs, "_forced", True)
    listed = mcp.handle_jsonrpc({"id": 1, "method": "tools/list"}, sync_fn)["result"]["tools"]
    assert listed == CORPUS["tools"] + CORPUS["devTools"]


def test_resources_list_is_the_corpus_byte_for_byte():
    listed = mcp.handle_jsonrpc({"id": 1, "method": "resources/list"}, sync_fn)["result"]["resources"]
    assert json.dumps(listed) == json.dumps(CORPUS["resources"])


@pytest.mark.parametrize("case", CORPUS.get("validate", []), ids=lambda c: c["name"])
def test_validate(case):
    report = UidlValidator(specs_schema()).validate(case["yaml"], context_of(case.get("context")))
    assert normalized(report) == case["expected"]


@pytest.mark.parametrize("case", CORPUS.get("validate", []), ids=lambda c: c["name"])
def test_validate_key_order_matches(case):
    report = normalized(UidlValidator(specs_schema()).validate(case["yaml"], context_of(case.get("context"))))
    assert json.dumps(report) == json.dumps(case["expected"])


@pytest.mark.parametrize("case", CORPUS.get("preview", []), ids=lambda c: c["name"])
def test_preview(case):
    preview = mcp.dispatch_tool("mateu_preview_uidl", {"yaml": case["yaml"]}, sync_fn)
    screen = preview.get("screen") or {}
    summary = {
        "rendered": preview["rendered"],
        "fields": screen.get("fields"),
        "actions": screen.get("actions"),
        "validation": preview["validation"],
    }
    assert summary == case["expected"]


@pytest.mark.parametrize("case", CORPUS.get("listComponents", []), ids=lambda c: repr(c["query"]))
def test_list_components(case):
    listed = list_components(case["query"])
    if "expectedCount" in case:
        assert listed["count"] == case["expectedCount"] == len(listed["components"])
    else:
        assert listed == case["expected"]


@pytest.mark.parametrize("case", CORPUS.get("componentSchemas", []), ids=lambda c: c["type"])
def test_component_schemas(case):
    if "expectedError" in case:
        with pytest.raises(UserFacingException) as raised:
            schema_of(case["type"])
        assert raised.value.message == case["expectedError"]
    else:
        assert schema_of(case["type"]) == case["expected"]


def test_component_schemas_over_the_tool_call():
    for case in CORPUS["componentSchemas"]:
        r = mcp.handle_jsonrpc(
            {"id": 3, "method": "tools/call",
             "params": {"name": "mateu_get_component_schema", "arguments": {"type": case["type"]}}},
            sync_fn,
        )["result"]
        text = r["content"][0]["text"]
        if "expectedError" in case:
            assert r["isError"] is True
            assert text == "Error: " + case["expectedError"]
        else:
            assert "isError" not in r
            assert json.loads(text) == case["expected"]
