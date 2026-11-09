"""A business component with NO access keys of its own, placed under a section (or a parent piece)
the caller may not see, locks every field it holds — the Python mirror of Java's
``ClientLockedFieldsTest.aPlainPartialNestedUnderASectionTheCallerMayNotSeeLocksAllItsFields``."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.component_registry import ComponentRegistry  # noqa: E402
from mateu_ui.core.route_registry import RouteRegistry  # noqa: E402
from mateu_ui.core.yaml_spec_loader import YamlSpecLoader  # noqa: E402
from mateu_ui.uidl import Identity  # noqa: E402
from mateu_ui.uidl import components as fluent  # noqa: E402

MODULE = sys.modules[__name__]

TAMPERED = {"pin": "1234", "comment": "hi"}

VAULT = (
    "- name: Vault\n  component:\n    type: VerticalLayout\n    content:\n"
    "      - {type: FormField, id: pin, label: Vault pin, dataType: string}\n"
)

OUTER = (
    "- name: Outer\n  component:\n    type: VerticalLayout\n    content:\n"
    "      - {type: Text, text: Public part}\n"
    "      - type: VerticalLayout\n        eyesOnly: {roles: [hr]}\n        content:\n"
    "          - {type: ComponentRef, ref: Vault}\n"
)


class VaultModel:
    """The code view model the YAML layouts bind."""

    pin: str = "0000"
    comment: str = ""


class VaultTreeView:
    """A code view drawing the restricted component whose eyesOnly section nests the plain one."""

    pin: str = "0000"
    comment: str = ""

    def component(self):
        return fluent.VerticalLayout(content=[fluent.ComponentRef(ref="Outer")])


def specs(tmp_path: Path, with_outer: bool) -> Path:
    (tmp_path / "routes.yaml").write_text(
        "routes:\n"
        f"  - route: in-section\n    layout: in-section.yaml\n    viewModel: {type_name(VaultModel)}\n"
        f"  - route: in-outer\n    layout: in-outer.yaml\n    viewModel: {type_name(VaultModel)}\n"
    )
    (tmp_path / "in-section.yaml").write_text(
        "layout:\n  type: VerticalLayout\n  content:\n"
        "    - {type: FormField, id: comment, label: Comment, dataType: string}\n"
        "    - type: VerticalLayout\n      eyesOnly: {roles: [hr]}\n      content:\n"
        "        - {type: ComponentRef, ref: Vault}\n"
    )
    (tmp_path / "in-outer.yaml").write_text(
        "layout:\n  type: VerticalLayout\n  content:\n"
        "    - {type: FormField, id: comment, label: Comment, dataType: string}\n"
        "    - {type: ComponentRef, ref: Outer}\n"
    )
    (tmp_path / "components.yaml").write_text((OUTER if with_outer else "") + VAULT)
    return tmp_path


def handler(directory: Path, roles=()) -> SyncHandler:
    h = SyncHandler(
        MateuRegistry(MODULE),
        identity_provider=(lambda: Identity(roles=tuple(roles))) if roles else (lambda: None),
    )
    h.routes = RouteRegistry(str(directory))
    h.yaml_specs = YamlSpecLoader(str(directory), h.routes)
    h.components = ComponentRegistry(str(directory))
    h.mapper.components = h.components
    return h


def guarded(h: SyncHandler, route: str) -> dict:
    rq = h._guard_yaml_access(RunActionRq(route=route, action_id="save", component_state=dict(TAMPERED)))
    return rq.component_state or {}


def bound(h: SyncHandler) -> tuple[str, str]:
    view = VaultTreeView()
    h.bind_state(view, dict(TAMPERED))
    return view.pin, view.comment


def loaded(h: SyncHandler, route: str) -> str:
    return json.dumps(h.handle(RunActionRq(route=route)).model_dump(by_alias=True, mode="json"))


def test_a_plain_component_nested_under_a_section_the_caller_may_not_see_locks_all_its_fields(tmp_path):
    root = specs(tmp_path, with_outer=True)
    assert bound(handler(root)) == ("0000", "hi")
    assert guarded(handler(root), "/in-outer") == {"comment": "hi"}


def test_a_caller_who_may_see_the_section_writes_the_nested_components_fields(tmp_path):
    root = specs(tmp_path, with_outer=True)
    assert bound(handler(root, roles=("hr",))) == ("1234", "hi")
    assert guarded(handler(root, roles=("hr",)), "/in-outer") == TAMPERED


def test_a_plain_component_under_a_hidden_section_of_a_yaml_layout_locks_its_fields(tmp_path):
    """The section is the layout's own: no restricted business component in the app."""
    root = specs(tmp_path, with_outer=False)
    assert guarded(handler(root), "/in-section") == {"comment": "hi"}
    assert guarded(handler(root, roles=("hr",)), "/in-section") == TAMPERED


def test_the_nested_component_is_not_drawn_for_a_caller_who_may_not_see_the_section(tmp_path):
    root = specs(tmp_path, with_outer=True)
    for route in ("/in-outer", "/in-section"):
        assert "Vault pin" not in loaded(handler(root), route)
        assert "Vault pin" in loaded(handler(root, roles=("hr",)), route)
