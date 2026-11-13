"""A routes.yaml entry's ``access:`` and field locks are tied to the TYPE they bind, not only to the
route the request names (GA review S1; Java's YamlRouteTypeBindingSyncTest is the twin).

``PayrollView`` is a registered view (it resolves by name) that routes.yaml also binds twice: at
``payroll`` (``access: admin``) and at ``payroll-locked`` (field ``salary`` locked unless admin). A
caller sending ``serverSideType=PayrollView`` with ANOTHER route used to skip both: the route was
checked, the type was resolved from the name, and nothing tied the two together."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuForbiddenException, MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.route_registry import RouteRegistry  # noqa: E402
from mateu_ui.core.yaml_spec_loader import YamlSpecLoader  # noqa: E402
from mateu_ui.uidl import Identity, Message, button, ui  # noqa: E402

MODULE = sys.modules[__name__]


@ui("payroll-code")
class PayrollView:
    salary: float = 100.0

    @button
    def pay(self):
        return Message(f"paid {self.salary}")


class PlainPayroll:
    """Bound ONLY by routes.yaml: a wire name never resolves it (only the route does)."""

    salary: float = 100.0

    @button
    def pay(self):
        return Message(f"paid {self.salary}")


LOCKED = (
    "layout:\n  type: VerticalLayout\n  content:\n"
    "    - {type: FormField, id: salary, label: Salary, dataType: number, readOnlyUnless: {roles: [admin]}}\n"
)


def specs(tmp_path: Path) -> Path:
    (tmp_path / "routes.yaml").write_text(
        "routes:\n"
        f"  - route: payroll\n    viewModel: {type_name(PayrollView)}\n    access: {{roles: [admin]}}\n"
        f"  - route: payroll-locked\n    layout: locked.yaml\n    viewModel: {type_name(PayrollView)}\n"
        f"  - route: plain-payroll\n    viewModel: {__name__}.PlainPayroll\n    access: {{roles: [admin]}}\n"
        "  - route: hello\n    layout: hello.yaml\n"
    )
    (tmp_path / "locked.yaml").write_text(LOCKED)
    (tmp_path / "hello.yaml").write_text("type: Text\ntext: Hello\n")
    return tmp_path


def handler(directory: Path, roles=()) -> SyncHandler:
    h = SyncHandler(MateuRegistry(MODULE), identity_provider=lambda: Identity(roles=tuple(roles)))
    h.routes = RouteRegistry(str(directory))
    h.yaml_specs = YamlSpecLoader(str(directory), h.routes)
    return h


def pay(h: SyncHandler, route: str, cls=PayrollView, action_id="pay") -> str:
    increment = h.handle(RunActionRq(
        route=route, server_side_type=type_name(cls) if cls is PayrollView else f"{__name__}.{cls.__name__}",
        action_id=action_id, component_state={"salary": 999},
    ))
    return " ".join(m.text for m in increment.messages)


def test_the_bound_routes_keep_their_own_rules(tmp_path):
    h = handler(specs(tmp_path))
    with pytest.raises(MateuForbiddenException):
        pay(h, "/payroll")
    assert pay(h, "/payroll-locked") == "paid 100.0"


@pytest.mark.parametrize("route", ["/hello", "/nowhere", "", "/payroll-locked/../hello"])
def test_another_route_does_not_lift_the_rules_of_the_routes_binding_the_type(tmp_path, route):
    """The union of the bound entries applies: refused when any refuses, locks of all of them."""
    with pytest.raises(MateuForbiddenException):
        pay(handler(specs(tmp_path)), route)


def test_the_union_also_locks_what_any_bound_layout_locks(tmp_path):
    (tmp_path / "routes.yaml").write_text(
        "routes:\n"
        f"  - route: payroll-locked\n    layout: locked.yaml\n    viewModel: {type_name(PayrollView)}\n"
        "  - route: hello\n    layout: hello.yaml\n"
    )
    (tmp_path / "locked.yaml").write_text(LOCKED)
    (tmp_path / "hello.yaml").write_text("type: Text\ntext: Hello\n")
    h = handler(tmp_path)
    assert pay(h, "/hello") == "paid 100.0"
    assert pay(h, "/nowhere") == "paid 100.0"
    admin = handler(tmp_path, roles=("admin",))
    assert pay(admin, "/hello") == "paid 999.0"


def test_the_types_own_registered_route_is_its_own(tmp_path):
    """The class's @ui route is the derived binding: what it answers there is the code's own rule."""
    h = handler(specs(tmp_path))
    assert pay(h, "/payroll-code") == "paid 999.0"


def test_an_authorized_caller_passes_everywhere(tmp_path):
    admin = handler(specs(tmp_path), roles=("admin",))
    assert pay(admin, "/payroll") == "paid 999.0"
    assert pay(admin, "/hello") == "paid 999.0"


def test_a_view_model_bound_only_by_routes_yaml_is_reached_only_through_its_route(tmp_path):
    """Pinned: a name the registry never registered resolves nothing on another route."""
    h = handler(specs(tmp_path))
    with pytest.raises(MateuForbiddenException):
        pay(h, "/plain-payroll", cls=PlainPayroll)
    out = None
    try:
        out = pay(h, "/hello", cls=PlainPayroll)
    except MateuForbiddenException:
        out = "refused"
    assert "paid 999.0" not in (out or "")
