"""The CalendarPage archetype (Redwood "Calendar" template): a month-grid Calendar under its
toolbar (‹ Today ›, optional primary "+ Create") whose events ACT on click (NavigateTo / any
action result) — mirroring Java's CalendarPage archetype and its sync tests."""

from __future__ import annotations

import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_uidl import CalendarPage, title, ui  # noqa: E402
from mateu_uidl import components as fluent  # noqa: E402

EVENTS = [
    fluent.CalendarEvent(id="e1", title="Release v3", date=date(2026, 2, 10), color="green"),
    fluent.CalendarEvent(id="e2", title="Board meeting", date=date(2026, 2, 20)),
    fluent.CalendarEvent(id="e3", title="Kickoff", date=date(2026, 3, 5)),
]


@ui("team-calendar")
@title("Team calendar")
class TeamCalendar(CalendarPage):
    def initial_month(self):
        return date(2026, 2, 1)

    def show_create(self):
        return True

    def events(self, month, http_request):
        return [e for e in EVENTS if e.date.year == month.year and e.date.month == month.month]

    def action_on(self, event, http_request):
        return f"/events/{event.id}"

    def create_action(self, http_request):
        return "/events/new"


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def render(inc) -> str:
    return inc.model_dump_json(by_alias=True).replace(" ", "")


def test_initial_render_shows_the_initial_month_with_its_events_sealed_for_clicks():
    inc = handler().handle(
        RunActionRq(route="/team-calendar", serverSideType=f"{__name__}.TeamCalendar",
                    initiatorComponentId="ux_main")
    )
    j = render(inc)
    assert '"type":"Calendar"' in j
    assert '"month":"2026-02-01"' in j
    # the month's events ride re-sealed with the uniform click actionId
    assert j.count('"actionId":"openCalendarEvent"') == 2
    assert "Releasev3" in j
    assert "Boardmeeting" in j
    assert "Kickoff" not in j  # next month's event stays out
    # the toolbar: month chevrons + Today + the primary create button
    assert '"actionId":"previousCalendarMonth"' in j
    assert '"actionId":"goCalendarToday"' in j
    assert '"actionId":"nextCalendarMonth"' in j
    assert '"actionId":"createCalendarEvent"' in j


def test_next_calendar_month_re_fetches_showing_only_the_new_months_event():
    inc = handler().handle(
        RunActionRq(route="/team-calendar", actionId="nextCalendarMonth",
                    serverSideType=f"{__name__}.TeamCalendar", initiatorComponentId="ux_main")
    )
    j = render(inc)
    # the grid's month AND the seeded componentState both move (the state round-trips)
    assert j.count('"month":"2026-03-01"') == 2
    assert "Kickoff" in j
    assert "Releasev3" not in j
    assert "Boardmeeting" not in j


def test_clicking_an_event_runs_action_on_and_navigates_to_the_returned_uri():
    inc = handler().handle(
        RunActionRq(route="/team-calendar", actionId="openCalendarEvent",
                    serverSideType=f"{__name__}.TeamCalendar", initiatorComponentId="ux_main",
                    componentState={"month": "2026-02-01"},
                    parameters={"_clickedEvent": {"id": "e2", "title": "Board meeting",
                                                  "date": "2026-02-20"}})
    )
    assert any(c.type == "NavigateTo" and c.data == "/events/e2" for c in inc.commands)
    assert not inc.fragments


def test_create_calendar_event_runs_create_action_and_navigates():
    inc = handler().handle(
        RunActionRq(route="/team-calendar", actionId="createCalendarEvent",
                    serverSideType=f"{__name__}.TeamCalendar", initiatorComponentId="ux_main")
    )
    assert any(c.type == "NavigateTo" and c.data == "/events/new" for c in inc.commands)
    assert not inc.fragments
