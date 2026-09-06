"""A menu leaf that points at a route which resolves to nothing is a bug — the safety a typed-class
menu reference used to give (the class had to exist). ``dangling_routes`` finds those so a
CI/conformance check can fail on them instead of the app deriving a dead link silently. The Python
mirror of Java's ``MenuRouteConformanceTest`` and .NET's ``MenuRouteConformanceTests``.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core.menu_route_conformance import dangling_routes  # noqa: E402
from mateu_core.route_registry import RouteEntry, RouteTable  # noqa: E402
from mateu_dtos import MenuItem, RuleRecord  # noqa: E402

KNOWN = RouteTable.of([RouteEntry(route="products", view_model="X"),
                       RouteEntry(route="orders/:id", view_model="Y")])


def _leaf(label: str, route: str) -> MenuItem:
    return MenuItem(label=label, route=route, server_side_type="")


def test_a_leaf_pointing_at_a_known_route_is_fine():
    assert dangling_routes([_leaf("Products", "products")], KNOWN) == []


def test_a_leaf_pointing_at_a_nonexistent_route_is_flagged():
    menu = [_leaf("Products", "products"), _leaf("Ghost", "does-not-exist")]
    assert dangling_routes(menu, KNOWN) == ["does-not-exist"]


def test_parameterised_routes_resolve():
    assert dangling_routes([_leaf("Order", "orders/42")], KNOWN) == []


def test_rule_separator_remote_external_and_placeholder_leaves_are_skipped():
    rule = MenuItem(label="Ping", route="whatever", server_side_type="",
                    rules=[RuleRecord(filter="", action="", action_id="x")])
    separator = MenuItem(label="", route="", server_side_type="", separator=True)
    remote = MenuItem(label="Remote", route="remote/x", server_side_type="", remote=True)
    external = _leaf("Docs", "https://mateu.io/docs")
    placeholder = MenuItem(label="Section", route="", server_side_type="")
    assert dangling_routes([rule, separator, remote, external, placeholder], KNOWN) == []


def test_recurses_into_submenus():
    group = MenuItem(label="Group", route="", server_side_type="",
                     submenus=[_leaf("Products", "products"), _leaf("Ghost", "nope")])
    assert dangling_routes([group], KNOWN) == ["nope"]
