"""``pageType:`` on a YAML page definition — the YAML twin of ``@page_template`` (the Python mirror
of Java's YamlPageTypeSyncTest): a declared type wins over inference; an absent or unknown one
leaves it."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_core.yaml_spec_loader import YamlSpecLoader, page_type_of  # noqa: E402

MODULE = sys.modules[__name__]


class PlainView:
    """No route of its own: reached only through the YAML definition. By shape, a form page."""

    name: str = "World"


LAYOUT = (
    "layout:\n"
    "  type: VerticalLayout\n"
    "  content:\n"
    "    - type: Text\n"
    "      text: Welcome\n"
)


def handler_with(tmp_path, route: str, yaml_text: str) -> SyncHandler:
    (tmp_path / f"{route}.yaml").write_text(yaml_text)
    h = SyncHandler(MateuRegistry(MODULE))
    h.yaml_specs = YamlSpecLoader(str(tmp_path), h.routes)
    return h


def top(h: SyncHandler, route: str) -> dict:
    inc = h.handle(RunActionRq(route=route))
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]


def test_a_definition_only_page_carries_its_declared_type(tmp_path):
    h = handler_with(tmp_path, "landing", "pageType: Landing\n" + LAYOUT)
    component = top(h, "landing")
    assert component["type"] == "ServerSide"
    assert component["pageType"] == "landing"
    assert component["children"][0]["metadata"]["type"] == "VerticalLayout"


def test_a_static_page_without_a_type_keeps_its_bare_shape(tmp_path):
    h = handler_with(tmp_path, "about", LAYOUT)
    assert top(h, "about")["type"] != "ServerSide"


def test_a_declared_type_wins_over_the_view_models_inferred_shape(tmp_path):
    h = handler_with(tmp_path, "bound", f"viewModel: {type_name(PlainView)}\npageType: dashboard\n" + LAYOUT)
    component = top(h, "bound")
    assert component["serverSideType"] == type_name(PlainView)
    assert component["pageType"] == "dashboard"


def test_an_absent_type_is_inferred(tmp_path):
    h = handler_with(tmp_path, "unbound", f"viewModel: {type_name(PlainView)}\n" + LAYOUT)
    assert top(h, "unbound")["pageType"] == "form"


def test_the_declared_type_is_matched_without_case_and_a_typo_is_ignored():
    assert page_type_of({"pageType": "Process"}) == "process"
    assert page_type_of({"pageType": "banana"}) is None
    assert page_type_of({"layout": {}}) is None
    assert page_type_of("not a mapping") is None
