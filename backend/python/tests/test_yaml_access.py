"""YAML access keys — the data twin of EyesOnly/ReadOnlyUnless/DisabledUnless, enforced on the
server per request (the Python mirror of Java's YamlAccessSyncTest): a route with ``access:`` answers
403 (sub-routes too), a component ``eyesOnly:`` is removed, ``readOnlyUnless:`` locks fields (and
their client values are dropped), ``disabledUnless:`` disables a button, and a declared action with
``access:`` disables the buttons naming it and is refused when invoked."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuForbiddenException, MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_core import yaml_access  # noqa: E402
from mateu_core.route_registry import RouteRegistry  # noqa: E402
from mateu_core.yaml_spec_loader import YamlSpecLoader  # noqa: E402
from mateu_uidl import Access, Identity  # noqa: E402

MODULE = sys.modules[__name__]

PAGE = """
actions:
  - id: delete
    access: {roles: [manager]}
layout:
  type: VerticalLayout
  content:
    - {type: Text, text: "Everybody"}
    - {type: Text, text: "Secret salary band", eyesOnly: {roles: [hr]}}
    - {type: FormField, id: salary, label: Salary, readOnlyUnless: {roles: [hr]}}
    - {type: FormField, id: name, label: Name}
    - {type: Button, label: Approve, actionId: approve, disabledUnless: [manager]}
    - {type: Button, label: Delete, actionId: delete}
"""


def specs(tmp_path: Path) -> Path:
    (tmp_path / "routes.yaml").write_text(
        "routes:\n"
        "  - route: people\n    layout: people.yaml\n"
        "  - route: admin/users\n    layout: users.yaml\n    access: {roles: [admin]}\n"
        "    children:\n      - route: audit\n        layout: users.yaml\n"
    )
    (tmp_path / "people.yaml").write_text(PAGE)
    (tmp_path / "users.yaml").write_text("type: Text\ntext: Users\n")
    return tmp_path


def handler(directory: Path, roles=()) -> SyncHandler:
    h = SyncHandler(
        MateuRegistry(MODULE),
        identity_provider=(lambda: Identity(roles=tuple(roles))) if roles is not None else None,
    )
    h.routes = RouteRegistry(str(directory))
    h.yaml_specs = YamlSpecLoader(str(directory), h.routes)
    return h


def wire(h: SyncHandler, route: str, **kw) -> str:
    return json.dumps(h.handle(RunActionRq(route=route, **kw)).model_dump(by_alias=True, mode="json"))


def test_access_shorthands_parse_to_roles():
    assert yaml_access.access_of("admin") == Access(roles=("admin",))
    assert yaml_access.access_of(["a", "b"]) == Access(roles=("a", "b"))
    assert yaml_access.access_of({"scopes": ["x"]}) == Access(scopes=("x",))
    assert yaml_access.access_of({}) is None


def test_a_restricted_route_is_refused_with_403_and_so_are_its_children(tmp_path):
    h = handler(specs(tmp_path), roles=("viewer",))
    with pytest.raises(MateuForbiddenException):
        h.handle(RunActionRq(route="/admin/users"))
    with pytest.raises(MateuForbiddenException):
        h.handle(RunActionRq(route="/admin/users/audit"))
    with pytest.raises(MateuForbiddenException):
        h.handle(RunActionRq(route="/admin/users/new"))  # a sub-path of the restricted entry


def test_a_restricted_route_is_served_to_an_authorized_caller(tmp_path):
    assert "Users" in wire(handler(specs(tmp_path), roles=("admin",)), "/admin/users")


def test_no_identity_is_denied(tmp_path):
    with pytest.raises(MateuForbiddenException):
        handler(specs(tmp_path), roles=None).handle(RunActionRq(route="/admin/users"))


def test_components_follow_the_callers_identity(tmp_path):
    out = wire(handler(specs(tmp_path), roles=("viewer",)), "/people")
    assert "Everybody" in out
    assert "Secret salary band" not in out
    assert "eyesOnly" not in out and "readOnlyUnless" not in out
    payload = json.loads(out)
    fields = list(_walk(payload, lambda n: n.get("type") == "FormField"))
    salary = next(f for f in fields if f.get("fieldId") == "salary")
    name = next(f for f in fields if f.get("fieldId") == "name")
    assert salary.get("readOnly") is True
    assert not name.get("readOnly")
    buttons = {b.get("actionId"): b for b in _walk(payload, lambda n: n.get("type") == "Button")}
    assert buttons["approve"].get("disabled") is True
    assert buttons["delete"].get("disabled") is True  # names an action the caller may not run


def test_an_authorized_caller_sees_everything_enabled(tmp_path):
    out = wire(handler(specs(tmp_path), roles=("hr", "manager")), "/people")
    payload = json.loads(out)
    assert "Secret salary band" in out
    salary = next(
        f for f in _walk(payload, lambda n: n.get("type") == "FormField") if f.get("fieldId") == "salary"
    )
    assert not salary.get("readOnly")
    buttons = {b.get("actionId"): b for b in _walk(payload, lambda n: n.get("type") == "Button")}
    assert not buttons["approve"].get("disabled")
    assert not buttons["delete"].get("disabled")


def test_a_refused_declared_action_is_403_when_invoked(tmp_path):
    h = handler(specs(tmp_path), roles=("viewer",))
    with pytest.raises(MateuForbiddenException):
        h.handle(RunActionRq(route="/people", action_id="delete"))
    with pytest.raises(MateuForbiddenException):
        h.handle(
            RunActionRq(route="/people", action_id="__restfetch__", parameters={"_sourceId": "delete"})
        )


def test_locked_field_values_are_dropped_from_the_incoming_state(tmp_path):
    h = handler(specs(tmp_path), roles=("viewer",))
    rq = h._guard_yaml_access(
        RunActionRq(route="/people", action_id="save", component_state={"salary": 1, "name": "Ann"})
    )
    assert rq.component_state == {"name": "Ann"}
    hr = handler(specs(tmp_path), roles=("hr",))
    rq = hr._guard_yaml_access(
        RunActionRq(route="/people", action_id="save", component_state={"salary": 1, "name": "Ann"})
    )
    assert rq.component_state == {"salary": 1, "name": "Ann"}


def test_menu_items_and_links_to_refused_routes_are_removed():
    tree = {
        "type": "AppShell",
        "menu": [
            {"type": "RouteLink", "label": "Home", "route": "home"},
            {"type": "RouteLink", "label": "Users", "route": "admin/users"},
            {"type": "RouteLink", "label": "Reports", "route": "reports", "access": "boss"},
            {"type": "Menu", "label": "Admin", "submenu": [{"type": "RouteLink", "route": "x", "access": "boss"}]},
        ],
    }
    applied = yaml_access.apply(tree, lambda gate: False, lambda route: route != "admin/users")
    labels = [i.get("label") for i in applied.tree["menu"]]
    assert labels == ["Home"]


def _walk(node, pred):
    if isinstance(node, dict):
        if pred(node):
            yield node
        for v in node.values():
            yield from _walk(v, pred)
    elif isinstance(node, list):
        for v in node:
            yield from _walk(v, pred)


CATALOGUE = """
type: Actions
actions:
  - id: purge
    access: {roles: [admin]}
    steps: [{type: Navigate, route: /purged}]
  - id: refresh
    steps: [{type: Navigate, route: /people}]
  - id: own
    access: {roles: [admin]}
    steps: [{type: Navigate, route: /x}]
"""

CATALOGUE_PAGE = """
actions:
  - id: own
    steps: [{type: Navigate, route: /mine}]
layout:
  type: VerticalLayout
  content:
    - {type: Button, label: Purge, actionId: purge}
    - {type: Button, label: Refresh, actionId: refresh}
    - {type: Button, label: Own, actionId: own}
"""


def catalogue_handler(tmp_path: Path, roles) -> SyncHandler:
    from mateu_core.action_registry import ActionRegistry

    (tmp_path / "routes.yaml").write_text("routes:\n  - route: tools\n    layout: tools.yaml\n")
    (tmp_path / "tools.yaml").write_text(CATALOGUE_PAGE)
    (tmp_path / "catalogue.yaml").write_text(CATALOGUE)
    h = handler(tmp_path, roles=roles)
    h.action_catalog = ActionRegistry(str(tmp_path))
    h.mapper.action_catalog = h.action_catalog
    h.yaml_specs.action_catalog = h.action_catalog
    return h


def test_a_restricted_catalogue_action_is_enforced_like_a_page_action(tmp_path):
    h = catalogue_handler(tmp_path, roles=("viewer",))
    # the catalogue shipped on the wire leaves it out for this caller…
    assert [a.id for a in h.action_catalog.wire(h.mapper.authorized)] == ["refresh"]
    referenced = h.action_catalog.referenced_by(["purge", "refresh"], set(), h.mapper.authorized)
    assert [e.id for e in referenced] == ["refresh"]
    # …buttons naming it are disabled (OWNER FIRST: `own` is the page's, not the catalogue's)…
    payload = json.loads(wire(h, "/tools"))
    buttons = {b.get("actionId"): b for b in _walk(payload, lambda n: n.get("type") == "Button")}
    assert buttons["purge"].get("disabled") is True
    assert not buttons["refresh"].get("disabled")
    assert not buttons["own"].get("disabled")
    # …and a call that reaches the server anyway is refused (dispatched or proxied by source id).
    with pytest.raises(MateuForbiddenException):
        h.handle(RunActionRq(route="/tools", action_id="purge"))
    with pytest.raises(MateuForbiddenException):
        h.handle(
            RunActionRq(route="/tools", action_id="__restfetch__", parameters={"_sourceId": "purge"})
        )
    h._guard_yaml_access(RunActionRq(route="/tools", action_id="own"))  # the page's own: allowed


def test_an_authorized_caller_gets_the_restricted_catalogue_action(tmp_path):
    h = catalogue_handler(tmp_path, roles=("admin",))
    assert {a.id for a in h.action_catalog.wire(h.mapper.authorized)} == {"purge", "refresh", "own"}
    payload = json.loads(wire(h, "/tools"))
    buttons = {b.get("actionId"): b for b in _walk(payload, lambda n: n.get("type") == "Button")}
    assert not buttons["purge"].get("disabled")
    h._guard_yaml_access(RunActionRq(route="/tools", action_id="purge"))
