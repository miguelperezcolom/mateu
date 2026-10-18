"""A definition-only page (a route with a layout and no view model) whose route SEEDS it — ``state:``,
``fixedParams:`` — the Python mirror of Java's SeededYamlPage: the page carries the seeds as its
state, so ``${state.x}`` reads them. Python returned the bare layout and dropped them (found
walking the YAML fixtures on the Python port: "Greeting:" and "Flavour:" rendered blank)."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_ui.core.yaml_spec_loader import YamlSpecLoader  # noqa: E402

MODULE = sys.modules[__name__]


def test_a_routes_state_and_fixed_params_reach_a_definition_only_page(tmp_path):
    (tmp_path / "routes.yaml").write_text(
        "routes:\n"
        "  - route: greet\n    layout: page.yaml\n    state: {greeting: Hola}\n"
        "  - route: flavour/beta\n    layout: page.yaml\n    fixedParams: {flavour: beta}\n"
    )
    (tmp_path / "page.yaml").write_text(
        "layout:\n  type: VerticalLayout\n  content:\n    - {type: Text, text: 'Greeting: ${state.greeting}'}\n"
    )
    h = SyncHandler(MateuRegistry(MODULE))
    from mateu_ui.core.route_registry import RouteRegistry

    h.routes = RouteRegistry(str(tmp_path))
    h.yaml_specs = YamlSpecLoader(str(tmp_path), h.routes)

    greet = h.handle(RunActionRq(route="greet")).fragments[0]
    assert greet.state == {"greeting": "Hola"}
    assert greet.component.initial_data == {"greeting": "Hola"}

    pinned = h.handle(RunActionRq(route="flavour/beta", component_state={"flavour": "alpha"})).fragments[0]
    assert pinned.state["flavour"] == "beta"  # a pin is not a suggestion
