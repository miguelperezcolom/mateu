"""A route's ``access:`` holds for its DEFINITION, whatever spelling of the request reaches it (GA
review round 2, J1; Java's YamlRouteSpellingAccessSyncTest and .NET's RouteSpellingAccessTests are
the twins). Before: the check matched the route as sent, while a route no authored entry answers was
served by convention from ``<specs>/<route>.yaml`` — so the layout file's own path, a dot segment or a
case variant served the page, and proxied its server-held calls, to anyone; ``..`` even reached a
``.yaml`` outside the specs directory."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuForbiddenException, MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_ui.core.route_registry import RouteRegistry, has_unsafe_segments  # noqa: E402
from mateu_ui.core.yaml_spec_loader import YamlSpecLoader  # noqa: E402
from mateu_ui.uidl import Identity  # noqa: E402

MODULE = sys.modules[__name__]


def page(text: str) -> str:
    return (
        "actions:\n"
        "  - id: purge\n"
        "    restAction:\n"
        "      source:\n"
        "        url: https://api.invalid/purge\n"
        "        method: DELETE\n"
        "        proxy: true\n"
        "        headers: {X-Api-Key: '${secret.PURGE_KEY}'}\n"
        "layout:\n  type: VerticalLayout\n  content:\n"
        f"    - {{type: Text, text: {text}}}\n"
        "    - {type: Button, label: Purge, actionId: purge}\n"
    )


def specs(tmp_path: Path) -> Path:
    root = tmp_path / "specs"
    (root / "pages").mkdir(parents=True)
    (root / "routes.yaml").write_text(
        "routes:\n"
        "  - route: admin\n    layout: admin.yaml\n    access: {roles: [admin]}\n"
        "  - route: backoffice/users/:id\n    layout: pages/user.yaml\n    access: {roles: [admin]}\n"
        "  - route: hello\n    layout: hello.yaml\n"
    )
    (root / "admin.yaml").write_text(page("ADMIN-PAGE"))
    (root / "pages" / "user.yaml").write_text(page("USER-PAGE"))
    (root / "hello.yaml").write_text(page("HELLO-PAGE"))
    (tmp_path / "outside.yaml").write_text(page("OUTSIDE-PAGE"))
    return root


def handler(directory: Path, roles=()) -> SyncHandler:
    h = SyncHandler(MateuRegistry(MODULE), identity_provider=lambda: Identity(roles=tuple(roles)))
    h.routes = RouteRegistry(str(directory))
    h.yaml_specs = YamlSpecLoader(str(directory), h.routes)
    return h


def outcome(h: SyncHandler, route: str, action_id: str = "") -> str:
    parameters = {"_sourceKind": "action", "_sourceId": "purge"} if action_id == "__restfetch__" else {}
    try:
        inc = h.handle(RunActionRq(route=route, action_id=action_id, parameters=parameters))
    except MateuForbiddenException:
        return "FORBIDDEN"
    return json.dumps(inc.model_dump(by_alias=True, mode="json"))


OTHER_SPELLINGS = [
    "/pages/user",
    "/hello/../admin",
    "/./admin",
    "/hello/%2e%2e/admin",
    "/Admin",
    "/hello/../../../specs/admin",
    "/hello/..\\admin",
]


def test_the_authored_spelling_is_refused(tmp_path):
    h = handler(specs(tmp_path))
    assert outcome(h, "/admin") == "FORBIDDEN"
    assert outcome(h, "/backoffice/users/7") == "FORBIDDEN"
    assert "HELLO-PAGE" in outcome(h, "/hello")


@pytest.mark.parametrize("route", OTHER_SPELLINGS)
def test_no_other_spelling_serves_the_restricted_definition(tmp_path, route):
    out = outcome(handler(specs(tmp_path)), route)
    assert "ADMIN-PAGE" not in out and "USER-PAGE" not in out


@pytest.mark.parametrize("route", OTHER_SPELLINGS)
def test_no_other_spelling_proxies_the_restricted_pages_calls(tmp_path, route):
    assert outcome(handler(specs(tmp_path)), route, "__restfetch__") == "FORBIDDEN"


def test_the_layout_files_path_is_refused_and_an_admin_reaches_it(tmp_path):
    root = specs(tmp_path)
    assert outcome(handler(root), "/pages/user") == "FORBIDDEN"
    assert "USER-PAGE" in outcome(handler(root, roles=("admin",)), "/pages/user")


def test_no_route_reads_a_definition_outside_the_specs_directory(tmp_path):
    root = specs(tmp_path)
    loader = YamlSpecLoader(str(root), RouteRegistry(str(root)))
    assert loader.load_spec("../outside") is None
    assert outcome(handler(root), "/../outside") == "FORBIDDEN"


def test_unsafe_segments():
    for route in ["/a/../b", "/./a", "/a/%2E%2e", "a\\b", "/a/%5cb", ".."]:
        assert has_unsafe_segments(route), route
    for route in ["", "/", "/admin", "/a.b/c", "/a/..b", "/x?next=/../y"]:
        assert not has_unsafe_segments(route), route
