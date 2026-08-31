"""The mount's route registry (``specs/ui/routes.yaml``) — the Python mirror of Java's
``RouteRegistryTest`` + ``RouteParamPrecedenceTest`` + ``DefinitionFromRegistryTest``.

The precedence must match the Java server and both web renderers exactly, or the same route would
behave differently depending on which backend and which renderer serve it:

    fixed  >  client state  >  path  >  defaults
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

HERE = Path(__file__).resolve().parent / "specs" / "ui"

from mateu_core.route_registry import (  # noqa: E402
    RouteEntry,
    RouteRegistry,
    RouteTable,
)
from mateu_core.yaml_spec_loader import YamlSpecLoader  # noqa: E402


class Tickets:
    status: str = ""


class Books:
    pass


class Films:
    pass


class OrderDetail:
    pass


class NewOrder:
    pass


def registry() -> RouteRegistry:
    return RouteRegistry(str(HERE))


# ── the table ────────────────────────────────────────────────────────────────────────────────


def test_the_authored_table_is_read_from_the_yaml_next_to_the_definitions():
    routes = [e.route for e in registry().authored().routes]
    assert "tickets" in routes
    assert "about" in routes


def test_two_routes_share_one_screen_and_are_told_apart_by_a_pinned_parameter():
    reg = registry()
    assert reg.match("tickets/open").entry.view_model.endswith("Tickets")
    assert reg.match("tickets/closed").entry.view_model.endswith("Tickets")
    assert reg.match("tickets/open").params({})["status"] == "open"
    assert reg.match("tickets/closed").params({})["status"] == "closed"


def test_a_pinned_parameter_is_not_overridable_by_the_request():
    # The security-relevant case: widening the pinned scope via the request must not work.
    assert registry().match("tickets/open").params({"status": "all"})["status"] == "open"


def test_a_seeded_parameter_is_overridable_by_the_request():
    match = registry().match("tickets")
    assert match.params({}) == {"status": "all", "page": 1}
    assert match.params({"status": "closed"})["status"] == "closed"
    assert match.params({"status": "closed"})["page"] == 1


def test_a_path_parameter_reaches_the_params():
    assert registry().match("orders/42").params({})["id"] == "42"


def test_a_static_route_is_not_swallowed_by_its_parameterised_sibling():
    # orders/:id is declared BEFORE orders/new in the fixture on purpose: matching must not depend
    # on declaration order.
    assert registry().match("orders/new").entry.view_model.endswith("NewOrder")
    assert registry().match("orders/42").entry.view_model.endswith("OrderDetail")


def test_a_route_can_have_a_definition_and_no_view_model():
    entry = registry().match("about").entry
    assert entry.definition == "about.yaml"
    assert entry.view_model is None


def test_a_path_that_matches_nothing_resolves_to_nothing():
    assert registry().match("customers") is None


def test_leading_and_trailing_slashes_carry_no_meaning():
    assert registry().match("/tickets/open") is not None
    assert registry().match("tickets/open/") is not None


def test_a_missing_routes_yaml_is_an_empty_table_rather_than_a_failure():
    assert RouteRegistry(str(HERE / "does-not-exist")).authored().routes == ()


# ── the merge ────────────────────────────────────────────────────────────────────────────────


def test_an_authored_entry_replaces_the_derived_one_for_the_same_route():
    derived = RouteTable.of([RouteEntry(route="tickets", view_model="generated.Other")])
    merged = registry().authored().merged_over(derived)
    assert merged.match("tickets").entry.view_model.endswith("Tickets")


def test_derived_entries_the_yaml_does_not_mention_survive_the_merge():
    derived = RouteTable.of([RouteEntry(route="customers", view_model="generated.Customers")])
    merged = registry().authored().merged_over(derived)
    assert merged.match("customers").entry.view_model == "generated.Customers"


# ── the definition ───────────────────────────────────────────────────────────────────────────


def test_one_definition_serves_two_routes_each_binding_its_own_view_model():
    # The case the <route>.yaml convention cannot express, and the reason a shared definition must
    # declare no modelView of its own.
    loader = YamlSpecLoader(str(HERE), registry())
    assert loader.load_spec("catalog/books").model_view.endswith("Books")
    assert loader.load_spec("catalog/films").model_view.endswith("Films")
    assert loader.load_spec("catalog/books").layout is not None


def test_a_definition_only_route_has_a_layout_and_no_model_view():
    spec = YamlSpecLoader(str(HERE), registry()).load_spec("about")
    assert spec.layout is not None
    assert spec.model_view is None
