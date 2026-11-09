"""Routed tabs beyond the conformance corpus (routed-tabs-*): the edges of Java's RouteChains /
FeatureFlagGate the corpus does not exercise — a hidden default tab, a negated flag, the YAML keys."""

from __future__ import annotations

from typing import Annotated

import pytest

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, routed_tabs, subresources, type_name
from mateu_ui.core.reflection import view_fields
from mateu_ui.core.route_registry import RouteEntry, RouteRegistry
from mateu_ui.uidl import FeatureFlags, Subresource

from . import test_wire_conformance as wire


def test_an_inline_orchestrator_with_no_route_fails_where_the_cause_is():
    handler = SyncHandler(MateuRegistry(wire.MODULE))
    with pytest.raises(RuntimeError, match="no route of its own"):
        handler.handle(RunActionRq(route="/conformance/rt/trap", server_side_type=type_name(wire.RtInlineTrap)))


class _Host:
    id: str | None = "7"
    subnets: Annotated[wire.RtSubnets, Subresource(context=("vcnId=nope",))] = None  # type: ignore[assignment]


def test_a_subresource_context_naming_a_missing_host_field_is_a_configuration_error():
    field = next(f for f in view_fields(_Host) if f.name == "subnets")
    with pytest.raises(ValueError, match="nope"):
        subresources.context(field, _Host())


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


# ── an EAGER sub-resource's row count (the tab badge) ───────────────────────────────────────────

from enum import Enum  # noqa: E402

from mateu_ui.uidl import Crud, Listing, ListingData  # noqa: E402


class _Kind(Enum):
    A = "a"


class _Lines(Crud):
    order_id: str | None = None

    def fetch(self, search):
        return ["x", "y"] if self.order_id == "7" else []


class _Notes(Listing):
    order_id: str | None = None
    kind: _Kind | None = None

    def search(self, request, http=None):
        return ListingData(rows=[], total_elements=5 if self.kind == "A" else 0)


class _Plain(Listing):
    def search(self, request, http=None):
        return ["only"]


class _Broken(Listing):
    def __init__(self):
        raise RuntimeError("needs a database")


class _Order:
    order_id: str | None = "7"
    kind: _Kind | None = _Kind.A
    lines: Annotated[_Lines, Subresource(load="EAGER")] = None  # type: ignore[assignment]
    notes: Annotated[_Notes, Subresource(load="EAGER")] = None  # type: ignore[assignment]
    plain: Annotated[_Plain, Subresource(load="EAGER")] = None  # type: ignore[assignment]
    broken: Annotated[_Broken, Subresource(load="EAGER")] = None  # type: ignore[assignment]
    lazy: Annotated[_Lines, Subresource()] = None  # type: ignore[assignment]


def _sub(name):
    return next(f for f in view_fields(_Order) if f.name == name)


def test_an_eager_sub_resource_counts_its_rows_with_the_parent_as_its_context():
    order = _Order()
    assert subresources.context(_sub("notes"), order) == {"orderId": "7", "kind": "A"}
    assert subresources.rows(_sub("lines"), order) == 2
    assert subresources.rows(_sub("notes"), order) == 5
    assert subresources.rows(_sub("plain"), order) == 1
    assert subresources.rows(_sub("broken"), order) is None
    # the badge sums the EAGER ones it can count; a lazy one is not fetched with the page
    assert subresources.badge([_sub("lines"), _sub("notes"), _sub("broken"), _sub("lazy")], order) == "7"
    assert subresources.badge([_sub("lazy")], order) is None
    assert subresources.title(_sub("lines")) == "Lines"
