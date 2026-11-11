"""A route's ``state:`` seed of a field a YAML partial or a components.yaml business component hides
from the caller (``eyesOnly:``) never reaches that caller — the rule the conformance case
``yaml-eyes-only`` pins for an inline field (mirrors Java's YamlPieceHiddenSeedSyncTest). The
compositions are resolved while the page is mapped, after the route seeded its state; a read-only
field keeps its seed (it is drawn, with its value)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_ui.core.component_registry import ComponentRegistry  # noqa: E402
from mateu_ui.core.route_registry import RouteRegistry  # noqa: E402
from mateu_ui.core.yaml_spec_loader import YamlSpecLoader  # noqa: E402
from mateu_ui.uidl import Identity  # noqa: E402

MODULE = sys.modules[__name__]


def specs(tmp_path: Path) -> Path:
    (tmp_path / "routes.yaml").write_text(
        "routes:\n  - route: staff\n    layout: staff.yaml\n    state:\n"
        "      name: Ada\n      salary: SALARY-SEED\n      bonus: 1234\n      payrollNote: PAYROLL-SEED\n"
    )
    (tmp_path / "staff.yaml").write_text(
        "layout:\n  type: VerticalLayout\n  content:\n"
        "    - {type: FormField, id: name, label: Name, dataType: string}\n"
        "    - {type: Partial, ref: payroll}\n"
        "    - {type: ComponentRef, ref: Payroll}\n"
    )
    (tmp_path / "partials").mkdir(exist_ok=True)
    (tmp_path / "partials" / "payroll.yaml").write_text(
        "content:\n"
        "  - {type: FormField, id: salary, label: Salary, dataType: string, eyesOnly: {roles: [hr]}}\n"
        "  - {type: FormField, id: bonus, label: Bonus, dataType: number, readOnlyUnless: {roles: [hr]}}\n"
    )
    (tmp_path / "components.yaml").write_text(
        "- name: Payroll\n  component:\n    type: VerticalLayout\n    content:\n"
        "      - {type: FormField, id: payrollNote, label: Note, dataType: string,"
        " eyesOnly: {roles: [hr]}}\n"
    )
    return tmp_path


def load(directory: Path, roles=()) -> str:
    h = SyncHandler(
        MateuRegistry(MODULE),
        identity_provider=(lambda: Identity(roles=tuple(roles))) if roles else (lambda: None),
    )
    h.routes = RouteRegistry(str(directory))
    h.yaml_specs = YamlSpecLoader(str(directory), h.routes)
    h.components = ComponentRegistry(str(directory))
    h.mapper.components = h.components
    return json.dumps(h.handle(RunActionRq(route="/staff")).model_dump(by_alias=True, mode="json"))


def test_a_seed_of_a_field_a_piece_hides_never_reaches_the_caller(tmp_path):
    guest = load(specs(tmp_path))
    assert "Ada" in guest and "1234" in guest
    assert "SALARY-SEED" not in guest
    assert "PAYROLL-SEED" not in guest


def test_the_seeds_reach_a_caller_who_may_see_the_fields(tmp_path):
    hr = load(specs(tmp_path), roles=("hr",))
    assert "SALARY-SEED" in hr and "PAYROLL-SEED" in hr
