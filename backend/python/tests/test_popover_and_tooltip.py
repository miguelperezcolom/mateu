"""Hover details — the Python mirror of Java's PopoverAndTooltipSyncTest: a ``Popover`` carries
its trigger (click by default, hover for read-only details) and its own id, and
``Tooltip("other_field")`` on a listing row field makes its cell show another field of the row
(the column's ``tooltipPath``)."""

import json
import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_uidl import ComponentTreeSupplier, Listing, Tooltip, title, ui  # noqa: E402
from mateu_uidl import components as fluent  # noqa: E402


@ui("hover-popover")
@title("Rate")
class RatePage(ComponentTreeSupplier):
    def component(self):
        return fluent.VerticalLayout(content=(
            fluent.Popover(
                id="rateInfo",
                trigger=fluent.PopoverTrigger.hover,
                wrapped=fluent.Text(id="rateLink", text="BAR 134 €"),
                content=fluent.Text(id="rateBreakdown", text="Sat 10: 134 € · Sun 11: 120 €"),
            ),
            fluent.Popover(wrapped=fluent.Text(text="wrapped"), content=fluent.Text(text="content")),
        ))


class Stay:
    id: str = ""
    guest: str = ""
    rate: Annotated[float, Tooltip("breakdown")] = 0.0
    breakdown: str = ""

    def __init__(self, id="", guest="", rate=0.0, breakdown=""):
        self.id, self.guest, self.rate, self.breakdown = id, guest, rate, breakdown


@ui("hover-tooltip")
@title("Stays")
class Stays(Listing[Stay]):
    def search(self, request, http=None):
        return [Stay("1", "Brown", 134, "Sat 10: 134 €\nSun 11: 120 €")]


MODULE = sys.modules[__name__]


def load(route: str) -> dict:
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(route=route, consumed_route=route))
    return json.loads(json.dumps(inc.model_dump(by_alias=True, mode="json")))


def walk(node):
    if isinstance(node, dict):
        yield node
        for v in node.values():
            yield from walk(v)
    elif isinstance(node, list):
        for v in node:
            yield from walk(v)


def test_a_popover_carries_its_trigger_and_id():
    popovers = [
        n for n in walk(load("/hover-popover"))
        if isinstance(n.get("metadata"), dict) and n["metadata"].get("type") == "Popover"
    ]
    assert [p["metadata"]["trigger"] for p in popovers] == ["hover", "click"]
    assert [p["id"] for p in popovers] == ["rateInfo", "fieldId"]


def test_a_tooltip_column_points_at_the_other_field():
    columns = {n["id"]: n for n in walk(load("/hover-tooltip")) if n.get("type") == "GridColumn"}
    assert columns["rate"]["tooltipPath"] == "breakdown"
    assert columns["guest"]["tooltipPath"] is None
