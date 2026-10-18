"""A Money() field reads as an amount in the crud listing too: its column carries the money
stereotype (Java's @Stereotype(money) column, ColumnTypeMapper.getStereotypeForColumn), which the
renderers write with two decimals in the UI's locale ("89.50")."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import Crud, Money, ui  # noqa: E402

MODULE = sys.modules[__name__]


class PricedItem:
    id: str = ""
    name: str = ""
    price: Annotated[float, Money()] = 0.0


@ui("priced-items")
class PricedItems(Crud[PricedItem]):
    def fetch(self, search):
        item = PricedItem()
        item.id, item.name, item.price = "1", "Grinder", 89.5
        return [item]


def _columns(node, out):
    if isinstance(node, dict):
        if node.get("type") == "GridColumn" and "id" in node:
            out[node["id"]] = node
        for value in node.values():
            _columns(value, out)
    elif isinstance(node, list):
        for value in node:
            _columns(value, out)
    return out


def test_a_money_field_is_a_money_column():
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route="priced-items", consumed_route="priced-items", server_side_type=type_name(PricedItems),
        action_id="", initiator_component_id="c1", component_state={}, parameters={},
    ))
    columns = _columns(json.loads(inc.model_dump_json(by_alias=True)), {})
    assert columns["price"]["stereotype"] == "money"
    assert columns["name"].get("stereotype") in (None, "regular")
