"""The categorised action panel ("I want to…") — the Python mirror of Java's
``ActionPanelSyncTest``: categories travel in order with their actions, a count implies populated,
and the defaults (label, 10 per column) are filled on the server so every renderer gets the same
panel."""

import sys
from pathlib import Path

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import ComponentTreeSupplier, title, ui  # noqa: E402
from mateu_uidl import components as fluent  # noqa: E402


@ui("action-panel")
@title("Reservation")
class ReservationPage(ComponentTreeSupplier):
    def component(self):
        return fluent.ActionPanel(
            shortcut="ctrl+i",
            hide_unpopulated_toggle=True,
            categories=(
                fluent.ActionPanelCategory(
                    title="Modify",
                    actions=(
                        fluent.ActionPanelItem(label="Check out", action_id="checkOut"),
                        fluent.ActionPanelItem(label="Traces", action_id="traces", count=3),
                    ),
                ),
                fluent.ActionPanelCategory(
                    title="Go to",
                    actions=(
                        fluent.ActionPanelItem(
                            label="Billing",
                            action_id="goTo",
                            parameters={"target": "billing"},
                            populated=True,
                        ),
                        fluent.ActionPanelItem(label="Reinstate", action_id="reinstate", disabled=True),
                    ),
                ),
            ),
        )


MODULE = sys.modules[__name__]


def walk(node):
    if isinstance(node, dict):
        yield node
        for v in node.values():
            yield from walk(v)
    elif isinstance(node, list):
        for v in node:
            yield from walk(v)


def test_panel_travels_with_its_categories_and_defaults():
    handler = SyncHandler(MateuRegistry(MODULE))
    inc = handler.handle(RunActionRq(server_side_type=type_name(ReservationPage)))
    root = inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]
    panels = [n for n in walk(root) if n.get("type") == "ActionPanel"]
    assert len(panels) == 1
    panel = panels[0]
    assert panel["label"] == "I want to…"
    assert panel["shortcut"] == "ctrl+i"
    assert panel["maxPerCategory"] == 10
    assert panel["hideUnpopulatedToggle"] is True
    assert [c["title"] for c in panel["categories"]] == ["Modify", "Go to"]
    modify = panel["categories"][0]["actions"]
    assert [(a["actionId"], a["populated"]) for a in modify] == [("checkOut", False), ("traces", True)]
    assert modify[1]["count"] == 3
    go_to = panel["categories"][1]["actions"]
    assert go_to[0]["parameters"] == {"target": "billing"}
    assert go_to[1]["disabled"] is True
