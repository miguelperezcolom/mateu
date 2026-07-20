"""The DataManagement archetype (Redwood Data management template): a full-width page showing the
same data as a grid and as a Gantt with a toolbar switcher between them. The Python mirror of
Java's DataManagementSyncTest / .NET ArchetypeTests."""

from __future__ import annotations

import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import DataManagement, title, ui  # noqa: E402
from mateu_uidl.components import Gantt, GanttTask, Text  # noqa: E402


@ui("/schedule-board")
@title("Schedule board")
class ScheduleBoard(DataManagement):
    def grid_view(self):
        return Text(text="the data grid")

    def gantt_view(self):
        return Gantt(tasks=(GanttTask(id="t1", title="Task 1", start=date(2026, 1, 1),
                                      end=date(2026, 1, 5), progress=50),))


MODULE = sys.modules[__name__]


def _handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def _render(action_id=None, state=None) -> str:
    inc = _handler().handle(
        RunActionRq(
            server_side_type=type_name(ScheduleBoard),
            route="/schedule-board",
            action_id=action_id,
            component_state=state or {},
        )
    )
    return inc.model_dump_json(by_alias=True)


def test_data_management_is_full_width_and_shows_the_grid_view_with_a_switcher():
    j = _render()
    assert '"pageType":"collection"' in j
    assert '"pageWidth":"fullWidth"' in j
    assert '"actionId":"switchToGrid"' in j
    assert '"actionId":"switchToGantt"' in j
    assert "the data grid" in j
    assert '"type":"Gantt"' not in j


def test_data_management_switches_to_the_gantt_view():
    j = _render(action_id="switchToGantt")
    assert '"type":"Gantt"' in j
    assert "the data grid" not in j
