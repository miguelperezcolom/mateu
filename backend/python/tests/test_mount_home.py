"""A ``type: UI`` mount names its home page (``home: dashboard``): the mount ROOT renders that route
when no root route is authored; an authored root always wins; a home naming no route is warned about
once and ignored. The Python mirror of Java's MountHomeSyncTest and .NET's MountHomeTests. (This port
has no ``type: AppShell`` definitions, so the shell ``homeRoute`` default does not apply here.)"""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_core.route_registry import RouteRegistry  # noqa: E402
from mateu_core.yaml_spec_loader import YamlSpecLoader  # noqa: E402

MODULE = sys.modules[__name__]


def page(text: str) -> str:
    return (
        "layout:\n  type: VerticalLayout\n  content:\n"
        f'    - type: Text\n      text: "{text}"\n'
    )


def specs(tmp_path: Path, home: str, authored_root: bool = False) -> Path:
    (tmp_path / "app.ui.yaml").write_text(
        f"type: UI\nbasePath: /\nhome: {home}\nroutes:\n  - routes.yaml\n"
    )
    (tmp_path / "routes.yaml").write_text(
        "routes:\n"
        + ('  - route: ""\n    definition: welcome.yaml\n' if authored_root else "")
        + "  - route: dashboard\n    definition: dashboard.yaml\n"
        + "    fixedParams:\n      tab: kpis\n"
        + "  - route: orders\n    definition: orders.yaml\n"
    )
    (tmp_path / "dashboard.yaml").write_text(page("Mount home dashboard"))
    (tmp_path / "orders.yaml").write_text(page("Mount home orders"))
    (tmp_path / "welcome.yaml").write_text(page("Authored root"))
    return tmp_path


def render(directory: Path, route: str) -> str:
    h = SyncHandler(MateuRegistry(MODULE))
    h.routes = RouteRegistry(str(directory))
    h.yaml_specs = YamlSpecLoader(str(directory), h.routes)
    return json.dumps(h.handle(RunActionRq(route=route)).model_dump(by_alias=True, mode="json"))


def test_the_mount_root_resolves_to_the_home_entry(tmp_path):
    root = RouteRegistry(str(specs(tmp_path, "/dashboard"))).match("")
    assert root is not None
    assert root.entry.definition == "dashboard.yaml"
    assert root.params(None)["tab"] == "kpis"


def test_the_home_page_renders_at_the_root(tmp_path):
    wire = render(specs(tmp_path, "dashboard"), "")
    assert "Mount home dashboard" in wire
    assert "Mount home orders" not in wire


def test_an_authored_root_route_wins_over_the_home(tmp_path):
    registry = RouteRegistry(str(specs(tmp_path, "dashboard", authored_root=True)))
    assert registry.match("").entry.definition == "welcome.yaml"
    assert registry.match("dashboard").entry.definition == "dashboard.yaml"


def test_an_unknown_home_is_warned_about_and_ignored(tmp_path, caplog):
    directory = specs(tmp_path, "nowhere")
    with caplog.at_level(logging.WARNING, logger="mateu.route_registry"):
        registry = RouteRegistry(str(directory))
        assert registry.match("") is None
        assert registry.match("orders").entry.definition == "orders.yaml"
    warnings = [r for r in caplog.records if "'nowhere'" in r.getMessage()]
    assert len(warnings) == 1
    assert "app.ui.yaml" in warnings[0].getMessage()
