"""A YAML page authored as DATA with no view model behind it — the yaml starter's pages. Until
2026-10-17 this server built eight YAML component types and rendered the starter's own
``products.yaml`` (a ``type: Listing`` over a REST source) as "Unsupported component", and its
``home.yaml`` button (an ``actionable: RouteLink``) with nowhere to go. Same wire shape as Java's
definition-only listing (the ``ft-orders`` expander golden) and as the .NET ``YamlListingTests``."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core.mapper import ReflectionMapper  # noqa: E402
from mateu_core.yaml_preview import build_from_yaml  # noqa: E402
from mateu_uidl import components as fluent  # noqa: E402

# starters/yaml/src/main/resources/specs/ui/products.yaml, as shipped
PRODUCTS = """
pageType: collection
type: Listing
title: Products
pageSize: 10
searchable: true
filters:
  - type: FormField
    id: status
    label: Status
    stereotype: select
    options:
      - {value: AVAILABLE, label: Available}
      - {value: OUT_OF_STOCK, label: Out of stock}
      - {value: DISCONTINUED, label: Discontinued}
rowsSource:
  ref: products
columns:
  - {type: GridColumn, id: id, label: Id, identifier: true, sortable: true}
  - {type: GridColumn, id: name, label: Name, sortable: true}
  - {type: GridColumn, id: price, label: Price, sortable: true}
  - {type: GridColumn, id: status, label: Status, dataType: status, sortable: true}
"""

# starters/yaml/src/main/resources/specs/ui/home.yaml, as shipped
HOME = """
type: VerticalLayout
fullWidth: true
horizontalAlignment: STRETCH
content:
  - type: HeroSection
    title: My app
    subtitle: Every screen here is declared as data.
    centered: true
    content:
      - type: Button
        label: Browse products
        buttonStyle: primary
        actionable:
          type: RouteLink
          route: products
"""


def wire(tree) -> dict:
    return ReflectionMapper().map_component(tree).model_dump(by_alias=True, mode="json")


def test_a_yaml_listing_over_a_rest_source_is_a_client_side_crud():
    tree = build_from_yaml(PRODUCTS)
    assert isinstance(tree, fluent.ListingComponent)
    crud = wire(tree)
    meta = crud["metadata"]

    assert meta["type"] == "Crud"
    assert meta["title"] == "Products"
    assert meta["searchable"] is True
    assert meta["pageSize"] == 10
    assert meta["rowsSource"]["ref"] == "products"  # the renderer fetches the rows itself
    assert crud["sizing"] == "fill"

    columns = [c["metadata"] for c in meta["columns"]]
    assert [c["id"] for c in columns] == ["id", "name", "price", "status"]
    assert all(c["sortable"] for c in columns)
    assert columns[0]["identifier"] is True
    assert columns[3]["dataType"] == "status"
    assert columns[1]["autoWidth"] is True

    (status,) = meta["filters"]
    assert status["fieldId"] == "status"
    assert status["stereotype"] == "select"
    assert [o["value"] for o in status["options"]] == ["AVAILABLE", "OUT_OF_STOCK", "DISCONTINUED"]


def test_a_button_whose_actionable_is_a_route_link_navigates():
    tree = build_from_yaml(HOME)
    assert isinstance(tree, fluent.VerticalLayout)
    (hero,) = tree.content
    assert isinstance(hero, fluent.HeroSection)
    (button,) = hero.content
    assert isinstance(button, fluent.Button)
    assert button.route == "products"
    assert button.action_id == ""

    dto = wire(button)["metadata"]
    assert dto["route"] == "products"
    assert dto["buttonStyle"] == "primary"


def test_an_inline_rows_source_and_an_unknown_type_keep_their_old_behaviour():
    inline = build_from_yaml(
        "type: Listing\n"
        "rowsSource: {url: https://api.example.com/items, itemsPath: results, proxy: true}\n"
        "columns:\n  - {type: GridColumn, id: name}\n"
    )
    assert isinstance(inline, fluent.ListingComponent)
    assert inline.rows_source.ref == ""
    assert inline.rows_source.url == "https://api.example.com/items"
    assert inline.rows_source.items_path == "results"
    assert inline.rows_source.proxy is True
    assert inline.columns[0].label == "name"  # a label defaults to the id
    source = wire(inline)["metadata"]["rowsSource"]
    assert source["ref"] is None and source["itemsPath"] == "results" and source["proxy"] is True

    unknown = build_from_yaml("type: Nonsense")
    assert isinstance(unknown, fluent.Text)
    assert unknown.text == "Unsupported component: Nonsense"
