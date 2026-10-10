"""Dragging listing rows onto a drop zone — the Python mirror of Java's ``DragAndDropSyncTest``:
``@drag_rows(type)`` makes the listing's rows draggable (``CrudMetadata.drag_type``); a
``DropZone`` accepts a type and carries its action, parameters and content; the drop runs that
action with the dragged ids and the zone's parameters."""

import sys
from pathlib import Path

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import (  # noqa: E402
    ComponentTreeSupplier,
    Listing,
    Message,
    action,
    drag_rows,
    title,
    ui,
)
from mateu_uidl import components as fluent  # noqa: E402


class Charge:
    id: str = ""
    description: str = ""
    amount: float = 0

    def __init__(self, id: str = "", description: str = "", amount: float = 0):
        self.id = id
        self.description = description
        self.amount = amount


@ui("dnd-charges")
@drag_rows("charge")
class WindowCharges(Listing[Charge]):
    def search(self, request, http=None):
        return [Charge("c1", "Minibar", 12), Charge("c2", "Spa", 80)]


@ui("dnd-plain")
class PlainCharges(Listing[Charge]):
    def search(self, request, http=None):
        return []


@ui("dnd-windows")
@title("Windows")
class Windows(ComponentTreeSupplier):
    def component(self):
        return fluent.DropZone(
            id="window2",
            accept="charge",
            action_id="moveCharges",
            parameters={"window": 2},
            title="Window 2",
            subtitle="Guest (cash)",
            content=(fluent.Text(text="Balance 0.00 €"),),
        )

    @action
    def move_charges(self, request: RunActionRq) -> Message:
        p = request.parameters or {}
        ids = "[" + ", ".join(p.get("_draggedIds") or []) + "]"
        return Message(f"{p.get('_dragType')} {ids} → window {p.get('window')}")


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def walk(node):
    if isinstance(node, dict):
        yield node
        for v in node.values():
            yield from walk(v)
    elif isinstance(node, list):
        for v in node:
            yield from walk(v)


def sync(cls):
    inc = handler().handle(RunActionRq(server_side_type=type_name(cls)))
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]


def of_type(root, t):
    return [n for n in walk(root) if n.get("type") == t]


def test_drag_rows_makes_the_listing_draggable():
    assert of_type(sync(WindowCharges), "Crud")[0]["dragType"] == "charge"
    assert of_type(sync(PlainCharges), "Crud")[0]["dragType"] is None


def test_a_drop_zone_travels_with_its_action_parameters_and_content():
    root = sync(Windows)
    zones = of_type(root, "DropZone")
    assert len(zones) == 1
    zone = zones[0]
    assert zone["accept"] == "charge"
    assert zone["actionId"] == "moveCharges"
    assert zone["parameters"] == {"window": 2}
    assert zone["title"] == "Window 2"
    assert zone["subtitle"] == "Guest (cash)"
    assert "Balance 0.00 €" in [t["text"] for t in of_type(root, "Text")]


def test_the_drop_runs_the_zone_action_with_the_dragged_ids():
    inc = handler().handle(
        RunActionRq(
            route="/dnd-windows",
            action_id="moveCharges",
            server_side_type=type_name(Windows),
            initiator_component_id="cmp-1",
            component_state={},
            parameters={"window": 2, "_dragType": "charge", "_draggedIds": ["c1", "c2"]},
        )
    )
    assert [m.text for m in inc.messages] == ["charge [c1, c2] → window 2"]
