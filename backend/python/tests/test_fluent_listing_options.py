"""The fluent listing's options and a grid field's row-detail customisation, which only Java set
before 3.0 GA. The full wire is pinned by the fluent-crudl-options and grid-field-detail
conformance cases; these pin each option and the defaults."""

from __future__ import annotations

import sys
from typing import Annotated

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler
from mateu_ui.core.mapper import ReflectionMapper
from mateu_ui.core.yaml_preview import build_from_yaml
from mateu_ui.uidl import DetailForm, Details, ui
from mateu_ui.uidl import components as fl


def _meta(listing: fl.ListingComponent) -> dict:
    return ReflectionMapper().map_component(listing).model_dump(by_alias=True)["metadata"]


def test_every_fluent_listing_option_reaches_the_wire():
    m = _meta(fl.ListingComponent(
        listing_type="card",
        toolbar=(fl.Button(label="Export", action_id="export"),),
        size=3,
        initial_page=2,
        header=(fl.Text(text="Head"),),
        footer=(fl.Text(text="Foot"),),
        pre_search=(fl.Text(text="Start"),),
        detail_path="notes",
        use_button_for_detail=True,
        lazy_column_rendering=True,
        vaadin_grid_cell_background="#fafafa",
        vaadin_grid_cell_padding="4px",
        infinite_scrolling=True,
        lazy_loading=True,
        multiple_row_selection_enabled=True,
        on_row_selection_changed_action_id="rowsChanged",
        content_height="20rem",
        search_on_enter=False,
        auto_focus_on_search_text=False,
        group_by="status",
        group_actions=(fl.Button(label="Close", action_id="closeGroup"),),
        row_status_field="status",
        drag_type="order",
        rows_selection_enabled=True,
    ))
    assert m["crudlType"] == "card"
    assert [b["actionId"] for b in m["toolbar"]] == ["export"]
    assert m["size"] == 3 and m["initialPage"] == 2
    assert m["header"][0]["metadata"]["text"] == "Head"
    assert m["footer"][0]["metadata"]["text"] == "Foot"
    assert m["preSearch"][0]["metadata"]["text"] == "Start"
    assert m["detailPath"] == "notes" and m["useButtonForDetail"]
    assert m["lazyColumnRendering"]
    assert m["vaadinGridCellBackground"] == "#fafafa" and m["vaadinGridCellPadding"] == "4px"
    assert m["infiniteScrolling"] and m["lazyLoading"] and m["multipleRowSelectionEnabled"]
    assert m["onRowSelectionChangedActionId"] == "rowsChanged" and m["contentHeight"] == "20rem"
    assert not m["searchOnEnter"] and not m["autoFocusOnSearchText"]
    assert m["groupBy"] == "status" and [b["actionId"] for b in m["groupActions"]] == ["closeGroup"]
    assert m["rowStatusField"] == "status" and m["dragType"] == "order"
    assert m["rowsSelectionEnabled"]


def test_a_bare_fluent_listing_keeps_javas_defaults():
    m = _meta(fl.ListingComponent())
    assert m["crudlType"] == "table" and m["filtersLayout"] == "auto"
    assert m["searchOnEnter"] and m["autoFocusOnSearchText"]
    assert m["header"] is None and m["footer"] is None and m["preSearch"] is None
    assert m["size"] == 0 and m["initialPage"] == 0 and m["toolbar"] == []
    assert not m["useButtonForDetail"] and not m["lazyColumnRendering"]
    assert m["vaadinGridCellBackground"] is None and m["contentHeight"] is None


def test_a_yaml_listing_reads_the_same_options():
    m = _meta(build_from_yaml("""
type: Listing
listingType: card
size: 3
initialPage: 2
header:
  - type: Text
    text: Head
footer:
  - type: Text
    text: Foot
detailPath: notes
useButtonForDetail: true
lazyColumnRendering: true
vaadinGridCellPadding: 4px
infiniteScrolling: true
onRowSelectionChangedActionId: rowsChanged
searchOnEnter: false
groupBy: status
dragType: order
rowsSelectionEnabled: true
"""))
    assert m["crudlType"] == "card" and m["size"] == 3 and m["initialPage"] == 2
    assert m["header"][0]["metadata"]["text"] == "Head" and len(m["footer"]) == 1
    assert m["detailPath"] == "notes" and m["useButtonForDetail"] and m["lazyColumnRendering"]
    assert m["vaadinGridCellPadding"] == "4px" and m["infiniteScrolling"]
    assert m["onRowSelectionChangedActionId"] == "rowsChanged"
    assert not m["searchOnEnter"] and m["autoFocusOnSearchText"]
    assert m["groupBy"] == "status" and m["dragType"] == "order" and m["rowsSelectionEnabled"]


class _DetailedLine:
    product: str = ""
    notes: Annotated[str, Details()] = ""


class _PlainLine:
    product: str = ""


@ui("/grid-detail-custom")
class _CustomisedGrid:
    lines: Annotated[
        list[_DetailedLine],
        DetailForm(position="modal", columns=3, style="gap: 1rem;", theme="dense",
                   min_height_when_detail_visible="30rem"),
    ] = None  # type: ignore[assignment]

    def __init__(self):
        self.lines = [_DetailedLine()]


@ui("/grid-detail-plain")
class _PlainGrid:
    lines: list[_PlainLine] = None  # type: ignore[assignment]

    def __init__(self):
        self.lines = [_PlainLine()]


def _grid(route: str) -> dict:
    handler = SyncHandler(MateuRegistry(sys.modules[__name__]))
    wire = handler.handle(RunActionRq(route=route, consumed_route=route)).model_dump(by_alias=True)
    found: list[dict] = []

    def walk(n):
        if isinstance(n, dict):
            if n.get("stereotype") == "grid":
                found.append(n)
            for v in n.values():
                walk(v)
        elif isinstance(n, list):
            for v in n:
                walk(v)

    walk(wire)
    return found[0]


def test_a_row_details_field_and_a_detail_form_customise_the_grid_field():
    g = _grid("/grid-detail-custom")
    assert g["detailPath"] == "notes" and g["useButtonForDetail"]
    assert g["formPosition"] == "modal" and g["formColumns"] == 3
    assert g["formStyle"] == "gap: 1rem;" and g["formTheme"] == "dense"
    assert g["minHeightWhenDetailVisible"] == "30rem"


def test_without_them_the_grid_field_keeps_the_defaults():
    g = _grid("/grid-detail-plain")
    assert g["detailPath"] is None and not g["useButtonForDetail"]
    assert g["formStyle"] is None and g["formTheme"] is None
    assert g["formPosition"] == "right" and g["minHeightWhenDetailVisible"] == "16rem"
