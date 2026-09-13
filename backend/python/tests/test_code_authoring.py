"""Authoring routes and apps IN CODE — the Python mirror of Java's RouteEntrySupplierSyncTest +
AppSupplierSyncTest and .NET's CodeAuthoringTests.

``RouteEntrySupplier`` is the programmatic half of the authored route table (routes.yaml still wins
on a collision); ``AppSupplier``/``MenuSupplier`` compose the app shell + menu in code, overriding
the static decorators.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from mateu_core.mapper import ReflectionMapper  # noqa: E402
from mateu_core.registry import MateuRegistry  # noqa: E402
from mateu_core.route_registry import RouteEntry, RouteEntrySupplier, RouteRegistry  # noqa: E402
from mateu_dtos import MenuItem, RuleRecord  # noqa: E402
from mateu_uidl import AppShell, AppSupplier, app  # noqa: E402

HERE = Path(__file__).resolve().parent / "specs" / "ui"


# ── Fixtures ──────────────────────────────────────────────────────────────────────────────────


class Widget:
    pass


class SuppliedRoutes(RouteEntrySupplier):
    """Routes authored IN CODE, the Python mirror of Java's SuppliedRoutes fixture."""

    def routes(self):
        return [
            # A plain code-authored route backed by a view model.
            RouteEntry(route="supplied/widget", view_model="tests.test_code_authoring.Widget"),
            # The case a decorator cannot express: a parameter the entry pins.
            RouteEntry(
                route="supplied/pinned",
                view_model="tests.test_code_authoring.Widget",
                fixed_params={"mode": "compact"},
            ),
            # A viewModel-less rich route: a definition plus client-side data, authored in code.
            RouteEntry(route="supplied/static", definition="about.yaml"),
            # A collider with routes.yaml (tickets/open → Tickets): the authored YAML must win.
            RouteEntry(route="tickets/open", view_model="tests.test_code_authoring.Widget"),
        ]


@app("Code App")
class CodeApp(AppSupplier):
    """An app whose shell and menu are composed IN CODE (mirror of Java's CodeAuthoredApp): a route
    link, a submenu and a rule link, all built in code — no @menu_item."""

    def get_app(self) -> AppShell:
        return AppShell(
            title="Code App",
            variant="HAMBURGUER_MENU",
            home_route="/codeapp/home",
            menu=[
                MenuItem(label="Home", route="/codeapp/home", server_side_type=""),
                MenuItem(
                    label="Reports",
                    route="",
                    server_side_type="",
                    submenus=[
                        MenuItem(label="Sales", route="/codeapp/reports/sales", server_side_type="")
                    ],
                ),
                MenuItem(
                    label="Approve",
                    route="",
                    server_side_type="",
                    rules=[RuleRecord(filter="", action="RunAction")],
                ),
            ],
        )


def _supplied() -> RouteRegistry:
    reg = MateuRegistry(sys.modules[__name__])
    return RouteRegistry(str(HERE), supplied=reg.supplied_routes)


def _app_meta():
    return ReflectionMapper().map_app(CodeApp).metadata


# ── Route supplier ──────────────────────────────────────────────────────────────────────────────


def test_a_code_supplied_route_resolves_to_its_view_model():
    assert _supplied().match("supplied/widget").entry.view_model.endswith("Widget")


def test_a_code_supplied_route_pins_parameters_decorators_cannot_express():
    assert _supplied().match("supplied/pinned").entry.fixed_params["mode"] == "compact"


def test_a_code_supplied_route_can_have_no_view_model():
    match = _supplied().match("supplied/static")
    assert match.entry.definition == "about.yaml"
    assert match.entry.view_model is None


def test_routes_yaml_wins_over_the_code_supplier():
    # routes.yaml maps tickets/open to Tickets; the supplier's collider loses.
    assert _supplied().match("tickets/open").entry.view_model.endswith("Tickets")


# ── App / menu supplier ─────────────────────────────────────────────────────────────────────────


def test_an_app_and_its_menu_composed_in_code_reach_the_wire():
    meta = _app_meta()
    assert meta.title == "Code App"
    labels = [m.label for m in meta.menu]
    assert "Home" in labels
    assert "Reports" in labels
    assert "Approve" in labels


def test_a_code_composed_submenu_nests_its_children():
    reports = next(m for m in _app_meta().menu if m.label == "Reports")
    assert any(s.label == "Sales" for s in reports.submenus)


def test_a_code_composed_rule_leaf_carries_its_rules_instead_of_a_route():
    approve = next(m for m in _app_meta().menu if m.label == "Approve")
    assert approve.rules
