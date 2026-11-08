"""Write side of the access keys of the YAML pieces a view draws (the Python mirror of Java's
JavaPagePartialLockedStateSyncTest): a field a YAML partial or a components.yaml business component
hides (``eyesOnly:``) or locks (``readOnlyUnless:`` / ``disabledUnless:``) for the caller keeps its
server-side value whatever the client POSTS — for a YAML layout bound to a code view model and for
a code view whose own tree references the business component."""

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

FIELDS = """\
- {type: FormField, id: bonus, label: Bonus, dataType: number, readOnlyUnless: {roles: [hr]}}
- {type: FormField, id: salaryNote, label: Salary note, dataType: string, eyesOnly: {roles: [hr]}}
- {type: FormField, id: approver, label: Approver, dataType: string, disabledUnless: {roles: [hr]}}
- {type: FormField, id: comment, label: Comment, dataType: string}
- {type: Text, text: Secret salary table, eyesOnly: {roles: [hr]}}
"""

TAMPERED = {"bonus": 999, "salaryNote": "hacked", "approver": "mallory", "comment": "hi"}
LOCKED = {"bonus", "salaryNote", "approver"}


class PayrollModel:
    """The code view model the YAML layouts bind."""

    bonus: float = 10.0
    salary_note: str = "kept"
    approver: str = "nobody"
    comment: str = ""


class PayrollTreeView:
    """A code view whose own tree references the business component."""

    bonus: float = 10.0
    salary_note: str = "kept"
    approver: str = "nobody"
    comment: str = ""

    def component(self):
        return fluent.VerticalLayout(content=[fluent.ComponentRef(ref="Payroll")])


def specs(tmp_path: Path) -> Path:
    (tmp_path / "routes.yaml").write_text(
        "routes:\n"
        f"  - route: with-partial\n    layout: with-partial.yaml\n    viewModel: {type_name(PayrollModel)}\n"
        f"  - route: with-component\n    layout: with-component.yaml\n    viewModel: {type_name(PayrollModel)}\n"
    )
    (tmp_path / "with-partial.yaml").write_text(
        "layout:\n  type: VerticalLayout\n  content:\n    - {type: Partial, ref: payroll}\n"
    )
    (tmp_path / "with-component.yaml").write_text(
        "layout:\n  type: VerticalLayout\n  content:\n    - {type: ComponentRef, ref: Payroll}\n"
    )
    (tmp_path / "partials").mkdir(exist_ok=True)
    (tmp_path / "partials" / "payroll.yaml").write_text(
        "content:\n" + "".join("  " + line + "\n" for line in FIELDS.splitlines())
    )
    (tmp_path / "components.yaml").write_text(
        "- name: Payroll\n  component:\n    type: VerticalLayout\n    content:\n"
        + "".join("      " + line + "\n" for line in FIELDS.splitlines())
    )
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


def test_a_partials_locked_fields_are_dropped_from_the_posted_state(tmp_path):
    root = specs(tmp_path)
    assert guarded(handler(root), "/with-partial") == {"comment": "hi"}
    assert guarded(handler(root, roles=("hr",)), "/with-partial") == TAMPERED


def test_a_business_components_locked_fields_are_dropped_from_the_posted_state(tmp_path):
    root = specs(tmp_path)
    assert guarded(handler(root), "/with-component") == {"comment": "hi"}
    assert guarded(handler(root, roles=("hr",)), "/with-component") == TAMPERED


def test_a_business_components_access_keys_apply_on_the_wire(tmp_path):
    root = specs(tmp_path)
    guest = json.dumps(
        handler(root).handle(RunActionRq(route="/with-component")).model_dump(by_alias=True, mode="json")
    )
    assert "Secret salary table" not in guest
    assert "eyesOnly" not in guest and "readOnlyUnless" not in guest
    hr = json.dumps(
        handler(root, roles=("hr",))
        .handle(RunActionRq(route="/with-component"))
        .model_dump(by_alias=True, mode="json")
    )
    assert "Secret salary table" in hr


def test_a_code_view_drawing_a_business_component_keeps_its_locked_fields(tmp_path):
    root = specs(tmp_path)
    view = PayrollTreeView()
    handler(root).bind_state(view, dict(TAMPERED))
    assert (view.bonus, view.salary_note, view.approver, view.comment) == (10.0, "kept", "nobody", "hi")
    view = PayrollTreeView()
    handler(root, roles=("hr",)).bind_state(view, dict(TAMPERED))
    assert (view.bonus, view.salary_note, view.approver, view.comment) == (999, "hacked", "mallory", "hi")
