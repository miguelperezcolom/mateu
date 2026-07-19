"""The TodoList archetype (Redwood "To-do list" template): a grouped TaskQueue whose cards ACT
on click (NavigateTo / any action result) instead of selecting — mirroring Java's TodoList
archetype and its sync tests."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_uidl import TodoList, title, ui  # noqa: E402
from mateu_uidl import components as fluent  # noqa: E402


class Task:
    def __init__(self, id: str, title: str, bucket: str, priority: str | None = None):
        self.id = id
        self.title = title
        self.bucket = bucket
        self.priority = priority


TASKS = [
    Task("t1", "Approve expenses", "Today", "High"),
    Task("t2", "Sign contract", "Today"),
    Task("t3", "Review onboarding", "This week"),
    Task("t4", "Plan offsite", "Later"),
]


class TeamTodosBase(TodoList):
    def rows(self, http_request):
        return TASKS

    def id_of(self, row):
        return row.id

    def title_of(self, row):
        return row.title

    def group_of(self, row):
        return row.bucket

    def action_on(self, row, http_request):
        return f"/tasks/{row.id}"

    def badges_of(self, row):
        return (fluent.ChipItem(label=row.priority, color="error"),) if row.priority else ()


@ui("team-todos")
@title("My tasks")
class TeamTodos(TeamTodosBase):
    pass


@ui("ordered-todos")
@title("Ordered tasks")
class OrderedTodos(TeamTodosBase):
    def group_order(self):
        return ["Later", "This week", "Today"]


@ui("empty-todos")
@title("No tasks")
class EmptyTodos(TeamTodosBase):
    def rows(self, http_request):
        return []


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def render(inc) -> str:
    return inc.model_dump_json(by_alias=True).replace(" ", "")


def test_initial_render_groups_the_cards_with_counters_in_first_appearance_order():
    inc = handler().handle(
        RunActionRq(route="/team-todos", serverSideType=f"{__name__}.TeamTodos",
                    initiatorComponentId="ux_main")
    )
    j = render(inc)
    assert '"type":"TaskQueue"' in j
    assert '"actionId":"openTodoItem"' in j
    # bucket labels carry the counter; buckets render in first-appearance order (Today first)
    assert "Today(2)" in j
    assert "Thisweek(1)" in j
    assert "Later(1)" in j
    assert j.index("Today(2)") < j.index("Thisweek(1)") < j.index("Later(1)")
    # cards carry title, caption-free id and badges
    assert "Approveexpenses" in j
    assert '"label":"High"' in j


def test_an_explicit_group_order_wins_over_first_appearance():
    inc = handler().handle(
        RunActionRq(route="/ordered-todos", serverSideType=f"{__name__}.OrderedTodos",
                    initiatorComponentId="ux_main")
    )
    j = render(inc)
    assert j.index("Later(1)") < j.index("Thisweek(1)") < j.index("Today(2)")


def test_clicking_a_card_runs_action_on_and_navigates_to_the_returned_uri():
    inc = handler().handle(
        RunActionRq(route="/team-todos", actionId="openTodoItem",
                    serverSideType=f"{__name__}.TeamTodos", initiatorComponentId="ux_main",
                    parameters={"_item": "t2"})
    )
    assert any(c.type == "NavigateTo" and c.data == "/tasks/t2" for c in inc.commands)
    assert not inc.fragments


def test_clicking_an_unknown_card_is_a_no_op():
    inc = handler().handle(
        RunActionRq(route="/team-todos", actionId="openTodoItem",
                    serverSideType=f"{__name__}.TeamTodos", initiatorComponentId="ux_main",
                    parameters={"_item": "nope"})
    )
    assert not any(c.type == "NavigateTo" for c in inc.commands)


def test_without_pending_rows_the_empty_state_renders_instead_of_the_queue():
    inc = handler().handle(
        RunActionRq(route="/empty-todos", serverSideType=f"{__name__}.EmptyTodos",
                    initiatorComponentId="ux_main")
    )
    j = render(inc)
    assert '"type":"TaskQueue"' not in j
    assert '"type":"EmptyState"' in j
    assert "Allcaughtup!" in j
