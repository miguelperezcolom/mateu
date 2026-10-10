"""The matrix grid (rows × date columns, collapsible sections, link and editable cells) — the
Python mirror of Java's ``MatrixGridSyncTest``: the wire carries one cell per column whatever the
row declared, a blank section id gets a stable one, and a cell action receives the cell it came
from as parameters."""

import sys
from pathlib import Path

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import ComponentTreeSupplier, Message, action, title, ui  # noqa: E402
from mateu_uidl import components as fluent  # noqa: E402


@ui("matrix")
@title("Availability")
class AvailabilityPage(ComponentTreeSupplier):
    def component(self):
        return fluent.MatrixGrid(
            id="availability",
            row_header_label="Room type",
            cell_action_id="openCell",
            edit_action_id="setOverbooking",
            columns=(
                fluent.MatrixColumn("2026-10-10", "Sat 10", "Oct 2026", "neutral"),
                fluent.MatrixColumn("2026-10-11", "Sun 11", "Oct 2026", "neutral"),
                fluent.MatrixColumn("2026-10-12", "Mon 12"),
            ),
            sections=(
                fluent.MatrixSection(
                    title="Occupancy",
                    rows=(
                        fluent.MatrixRow(
                            id="available",
                            label="Available",
                            emphasis=True,
                            cells=(
                                fluent.MatrixCell.of(12),
                                fluent.MatrixCell("-1", "danger", True),
                                fluent.MatrixCell.of(4),
                            ),
                        ),
                    ),
                ),
                fluent.MatrixSection(
                    id="controls",
                    title="Controls",
                    collapsed=True,
                    rows=(
                        fluent.MatrixRow(
                            id="overbooking",
                            label="Overbooking",
                            editable=True,
                            cells=(fluent.MatrixCell.of(2),),
                        ),
                    ),
                ),
            ),
        )

    @action
    def open_cell(self, request: RunActionRq) -> Message:
        p = request.parameters or {}
        return Message(f"{p.get('_rowId')}@{p.get('_columnId')}={p.get('_value')}")


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


def test_grid_travels_with_sections_and_one_cell_per_column():
    inc = handler().handle(RunActionRq(server_side_type=type_name(AvailabilityPage)))
    root = inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]
    grids = [n for n in walk(root) if n.get("type") == "MatrixGrid"]
    assert len(grids) == 1
    grid = grids[0]
    assert grid["rowHeaderLabel"] == "Room type"
    assert grid["cellActionId"] == "openCell"
    assert grid["editActionId"] == "setOverbooking"
    assert [(c["id"], c["group"], c["tone"]) for c in grid["columns"]] == [
        ("2026-10-10", "Oct 2026", "neutral"),
        ("2026-10-11", "Oct 2026", "neutral"),
        ("2026-10-12", None, None),
    ]
    # a section without id gets a stable one; the collapsed flag travels
    assert [s["id"] for s in grid["sections"]] == ["section0", "controls"]
    assert grid["sections"][1]["collapsed"] is True
    available = grid["sections"][0]["rows"][0]
    assert available["emphasis"] is True
    assert [(c["value"], c["tone"], c["link"]) for c in available["cells"]] == [
        ("12", None, False),
        ("-1", "danger", True),
        ("4", None, False),
    ]
    # the overbooking row declared ONE cell: padded to the three columns
    overbooking = grid["sections"][1]["rows"][0]
    assert overbooking["editable"] is True
    assert [c["value"] for c in overbooking["cells"]] == ["2", "", ""]


def test_the_grids_action_ids_with_a_handler_are_advertised():
    inc = handler().handle(RunActionRq(server_side_type=type_name(AvailabilityPage)))
    actions = inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]["actions"] or []
    ids = [a["id"] for a in actions]
    # the web client only sends advertised actions; the view handles openCell…
    assert "openCell" in ids
    # …but has no set_overbooking, which may be an enclosing component's
    assert "setOverbooking" not in ids


def test_a_cell_action_receives_the_cell_it_came_from():
    inc = handler().handle(
        RunActionRq(
            route="/matrix",
            action_id="openCell",
            server_side_type=type_name(AvailabilityPage),
            initiator_component_id="cmp-1",
            component_state={},
            parameters={"_rowId": "available", "_columnId": "2026-10-11", "_value": "-1"},
        )
    )
    assert [m.text for m in inc.messages] == ["available@2026-10-11=-1"]
