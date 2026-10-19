"""R6: ``mateu_save_spec`` refuses a page that would run code in the browser — a saved spec is served
through the ordinary (trusted) render path, so an anonymous dev-mode agent could otherwise persist an
``Element import:`` every browser opening the route executes. Shared cases:
``conformance/mcp/save-spec-script.json`` (Java, .NET and the sidecar run the same)."""

from __future__ import annotations

import json
from pathlib import Path

from mateu_ui.core.authoring import spec_writer


def _corpus() -> dict:
    here = Path(__file__).resolve()
    for parent in here.parents:
        candidate = parent / "conformance" / "mcp" / "save-spec-script.json"
        if candidate.is_file():
            return json.loads(candidate.read_text(encoding="utf-8"))
    raise AssertionError("conformance/mcp/save-spec-script.json not found")


def test_every_script_capable_construct_is_refused_and_a_plain_page_is_not():
    corpus = _corpus()
    assert spec_writer.SCRIPT_REFUSAL == corpus["reason"]
    for case in corpus["cases"]:
        refusal = spec_writer.agent_refusal("component", case["yaml"])
        if case["refused"]:
            assert refusal == spec_writer.SCRIPT_REFUSAL, case["name"]
        else:
            assert refusal is None, (case["name"], refusal)


def test_an_alias_bomb_is_refused_rather_than_walked():
    lines = ["a: &a [x, x, x, x, x, x, x, x, x, x]"]
    prev = "a"
    for i in range(8):
        name = f"l{i}"
        lines.append(f"{name}: &{name} [" + ", ".join([f"*{prev}"] * 10) + "]")
        prev = name
    assert spec_writer.agent_refusal("component", "\n".join(lines) + "\n") == spec_writer.SCRIPT_REFUSAL
