"""Routed tabs beyond the conformance corpus (routed-tabs-*): the edges of Java's RouteChains /
FeatureFlagGate the corpus does not exercise — a hidden default tab, a negated flag, the YAML keys."""

from __future__ import annotations

from mateu_ui.core import routed_tabs
from mateu_ui.core.route_registry import RouteEntry, RouteRegistry
from mateu_ui.uidl import FeatureFlags


class AuditOff(FeatureFlags):
    def is_enabled(self, flag):
        return False if flag == "audit" else None


def _routes(tmp_path, entries):
    return RouteRegistry(str(tmp_path), supplied=entries)


def test_a_hidden_default_tab_falls_back_to_the_first_visible_one(tmp_path):
    routes = _routes(tmp_path, [
        RouteEntry(route="partners/:id", view_model="x.Master", default_child="notes"),
        RouteEntry(route="partners/:id/orders", view_model="x.Orders", parent="partners/:id"),
        RouteEntry(route="partners/:id/notes", view_model="x.Notes", parent="partners/:id", show="audit"),
    ])
    tokens = routed_tabs.begin("/partners/3", [AuditOff()], routes, None)
    try:
        assert routed_tabs.default_child_path(routes, "/partners/3") == "/partners/3/orders"
        assert [c.path for c in routed_tabs.visible_children_of(routes, "/partners/3")] == [
            "/partners/3/orders"
        ]
    finally:
        routed_tabs.end(tokens)


def test_a_negated_flag_shows_while_the_flag_is_off_and_an_unknown_flag_is_on():
    tokens = routed_tabs.begin(None, [AuditOff()])
    try:
        assert routed_tabs.shows("!audit")
        assert not routed_tabs.shows("audit")
        assert routed_tabs.shows("anything-else")
        assert routed_tabs.shows("")
    finally:
        routed_tabs.end(tokens)


def test_routes_yaml_carries_default_child_and_show(tmp_path):
    (tmp_path / "routes.yaml").write_text(
        "routes:\n"
        "  - route: customers/:customerId\n"
        "    viewModel: x.Master\n"
        "    defaultChild: notes\n"
        "    children:\n"
        "      - route: orders\n"
        "        viewModel: x.Orders\n"
        "      - route: notes\n"
        "        viewModel: x.Notes\n"
        "        show: '!audit'\n",
        encoding="utf-8",
    )
    routes = RouteRegistry(str(tmp_path))
    master = routes.match("customers/7").entry
    assert master.default_child == "notes"
    assert routes.match("customers/7/notes").entry.show == "!audit"
    tokens = routed_tabs.begin("/customers/7", [AuditOff()], routes, None)
    try:
        assert routed_tabs.default_child_path(routes, "/customers/7") == "/customers/7/notes"
    finally:
        routed_tabs.end(tokens)
