"""A definition-only page (a route with a layout and no view model) names the window like any page:
its definition's title, else its route humanized — the Python mirror of Java's
``DefinitionOnlyWindowTitleSyncTest``. Python sent the RAW route (``"/about"``) as the title."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_core.yaml_spec_loader import YamlSpecLoader  # noqa: E402

MODULE = sys.modules[__name__]


def _handler(tmp_path):
    (tmp_path / "routes.yaml").write_text(
        "routes:\n"
        "  - route: about\n    layout: about.yaml\n"
        "  - route: sign-up\n    layout: form.yaml\n"
        "  - route: customer\n    layout: customer.yaml\n    state: {name: Ada}\n"
        "  - route: edit-notes\n    layout: customer.yaml\n"
    )
    (tmp_path / "about.yaml").write_text(
        "layout:\n  type: VerticalLayout\n  content:\n    - {type: Text, text: About this app}\n"
    )
    (tmp_path / "form.yaml").write_text("type: Form\ntitle: Sign up\ncontent: []\n")
    (tmp_path / "customer.yaml").write_text("type: Form\ntitle: 'Customer ${state.name}'\ncontent: []\n")
    h = SyncHandler(MateuRegistry(MODULE))
    from mateu_core.route_registry import RouteRegistry

    h.routes = RouteRegistry(str(tmp_path))
    h.yaml_specs = YamlSpecLoader(str(tmp_path), h.routes)
    return h


def _titles(increment):
    return [c.data for c in increment.commands or [] if c.type == "SetWindowTitle"]


def test_a_definition_with_no_title_is_named_after_its_route(tmp_path):
    assert _titles(_handler(tmp_path).handle(RunActionRq(route="/about"))) == ["About"]


def test_a_definition_names_the_window_with_its_own_title(tmp_path):
    assert _titles(_handler(tmp_path).handle(RunActionRq(route="sign-up"))) == ["Sign up"]


def test_a_title_reading_the_state_is_interpolated_or_falls_back_to_the_route(tmp_path):
    h = _handler(tmp_path)
    assert _titles(h.handle(RunActionRq(route="customer"))) == ["Customer Ada"]
    assert _titles(h.handle(RunActionRq(route="edit-notes"))) == ["Edit notes"]
