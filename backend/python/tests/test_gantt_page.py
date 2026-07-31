"""The GanttPage archetype (Redwood Gantt page template): a full-bleed Gantt canvas laid out
edge-to-edge with a heading and an optional docked detail, where clicking a bar opens the task in
a Drawer. The Python mirror of Java's GanttPageSyncTest / .NET ArchetypeTests."""

from __future__ import annotations

import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import GanttPage, title, ui  # noqa: E402
from mateu_uidl.components import GanttTask, Text  # noqa: E402


@ui("/project-plan")
@title("Project plan")
class ProjectPlan(GanttPage):
    def tasks(self, http_request):
        return [
            GanttTask(id="t1", title="Design", start=date(2026, 1, 1), end=date(2026, 1, 10), progress=100),
            GanttTask(id="t2", title="Build", start=date(2026, 1, 11), end=date(2026, 2, 1), progress=40),
        ]

    def detail(self, http_request):
        return Text(text="detail panel")


@ui("/project-plan-bottom")
@title("Project plan bottom")
class ProjectPlanWithBottomPanel(GanttPage):
    def tasks(self, http_request):
        return [
            GanttTask(id="t1", title="Design", start=date(2026, 1, 1), end=date(2026, 1, 10), progress=100),
        ]

    def bottom_panel(self, http_request):
        return Text(text="supporting tables")


MODULE = sys.modules[__name__]


def _handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def _render(view_cls, action_id=None, parameters=None, route="/project-plan") -> str:
    inc = _handler().handle(
        RunActionRq(
            server_side_type=type_name(view_cls),
            route=route,
            action_id=action_id,
            parameters=parameters or {},
        )
    )
    return inc.model_dump_json(by_alias=True)


def test_gantt_page_is_edge_to_edge_with_canvas_heading_and_detail():
    j = _render(ProjectPlan)
    assert '"pageType":"detail"' in j
    assert '"pageWidth":"edgeToEdge"' in j
    assert '"type":"Gantt"' in j
    assert '"onTaskSelectionActionId":"selectGanttTask"' in j
    assert "Project plan" in j       # the heading
    assert "detail panel" in j        # the docked detail


def test_clicking_a_gantt_task_opens_it_in_a_drawer():
    j = _render(ProjectPlan, action_id="selectGanttTask", parameters={"_clickedTaskId": "t2"})
    assert '"type":"Drawer"' in j
    assert '"headerTitle":"Build"' in j


def test_bottom_panel_composes_a_persistent_collapsible_bottom_drawer_in_the_tree():
    j = _render(ProjectPlanWithBottomPanel, route="/project-plan-bottom")
    assert '"type":"Drawer"' in j
    assert '"position":"bottom"' in j
    assert '"collapsible":true' in j
    assert '"modeless":true' in j
    assert '"headerTitle":"Details"' in j   # the default bottom_panel_title
    assert "supporting tables" in j          # the bottom panel content
