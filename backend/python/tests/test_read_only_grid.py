"""A view whose fields are all read-only keeps its list of rows a GRID (read-only) and its fields
their labels — Java took such a view for a page of components and rendered the grid as its rows'
text. Pinned here so the port never drifts the same way."""

import sys
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_ui.uidl import ReadOnly, read_only, ui  # noqa: E402


class OrderLine:
    product: str = ""
    quantity: int = 0


@read_only
@ui("ro-grid-class")
class ReadOnlyOrderView:
    customer: str = "Ada"
    lines: list[OrderLine] = None


@ui("ro-grid-all")
class AllReadOnlyOrderView:
    customer: Annotated[str, ReadOnly()] = "Ada"
    lines: Annotated[list[OrderLine], ReadOnly()] = None


MODULE = sys.modules[__name__]


def fields(route: str) -> dict:
    dumped = SyncHandler(MateuRegistry(MODULE)).handle(
        RunActionRq(route=route, consumed_route=route)
    ).model_dump(by_alias=True, mode="json")
    found: dict = {}

    def walk(node):
        if isinstance(node, dict):
            if node.get("type") == "FormField":
                found[node.get("fieldId")] = node
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for value in node:
                walk(value)

    walk(dumped)
    return found


@pytest.mark.parametrize("route", ["ro-grid-class", "ro-grid-all"])
def test_a_read_only_grid_on_an_all_read_only_view_is_a_grid(route):
    found = fields(route)
    assert found["lines"]["stereotype"] == "grid"
    assert found["customer"]["label"] == "Customer"


def test_a_class_level_read_only_view_marks_its_grid_and_fields_read_only():
    # (on a field, the port's ReadOnly() only keeps an inline_editing column display-only)
    found = fields("ro-grid-class")
    assert found["lines"]["readOnly"] is True
    assert found["customer"]["readOnly"] is True
