"""Calendar views (day, week, month, list), per-date cells and clickable dates — the shape of a
hotel's Property Calendar: the view switcher re-renders the period, the chevrons step by the
view, a week across two months asks both, and a date's cell runs its action with the date.
Mirrors Java's CalendarViewsSyncTest."""

from __future__ import annotations

import json
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_uidl import CalendarPage, title, ui  # noqa: E402
from mateu_uidl import components as fluent  # noqa: E402
from mateu_uidl.components import CalendarDay, CalendarView  # noqa: E402


@ui("property-calendar")
@title("Property calendar")
class PropertyCalendar(CalendarPage):
    def initial_month(self):
        return date(2026, 10, 28)

    def views(self):
        return [CalendarView.month, CalendarView.week, CalendarView.day, CalendarView.list]

    def events(self, month, http_request):
        if month.month == 10:
            return [
                fluent.CalendarEvent(
                    id="conv", title="Convention", date=date(2026, 10, 29),
                    end_date=date(2026, 10, 31), start_time="09:00", end_time="18:00",
                )
            ]
        return [fluent.CalendarEvent(id="gala", title="Gala", date=date(2026, 11, 1))]

    def action_on(self, event, http_request):
        return f"/events/{event.id}"

    def days(self, date_from, date_to, http_request):
        out, d = [], date_from
        while d <= date_to:
            out.append(CalendarDay(d, f"Avail {d.day}", "danger" if d.day == 30 else None))
            d += timedelta(days=1)
        return out

    def days_clickable(self):
        return True

    def action_on_day(self, day, http_request):
        return f"/availability?date={day.isoformat()}"


MODULE = sys.modules[__name__]


def run(action_id=None, state=None, parameters=None):
    return SyncHandler(MateuRegistry(MODULE)).handle(
        RunActionRq(route="/property-calendar", actionId=action_id,
                    serverSideType=f"{__name__}.PropertyCalendar",
                    initiatorComponentId="cal_app",
                    componentState=state or {}, parameters=parameters or {})
    )


def collect(node, type_name):
    """Every wire object carrying ``"type": type_name``, anywhere in the tree."""
    found = []

    def walk(n):
        if isinstance(n, dict):
            if n.get("type") == type_name:
                found.append(n)
            for v in n.values():
                walk(v)
        elif isinstance(n, list):
            for v in n:
                walk(v)

    walk(node)
    return found


def tree(inc):
    return json.loads(inc.model_dump_json(by_alias=True))


def calendar_of(inc):
    calendars = collect(tree(inc), "Calendar")
    assert len(calendars) == 1
    return calendars[0]


def test_month_view_carries_its_days_the_clickable_dates_and_the_view_switcher():
    inc = run()
    calendar = calendar_of(inc)
    assert calendar["view"] == "month"
    assert calendar["dayActionId"] == "openCalendarDay"
    assert len(calendar["days"]) == 31
    assert calendar["days"][29]["tone"] == "danger"
    event = calendar["events"][0]
    assert event["endDate"] == "2026-10-31"
    assert event["startTime"] == "09:00"
    labels = {b.get("label") for b in collect(tree(inc), "Button")}
    assert {"Month", "Week", "Day", "List"} <= labels


def test_the_week_view_spans_two_months_and_asks_both():
    calendar = calendar_of(
        run("switchCalendarView", {"month": "2026-10-28"}, {"_view": "week"})
    )
    assert calendar["view"] == "week"
    # Mon 26 Oct → Sun 1 Nov: the October convention and the November gala
    assert [e["id"] for e in calendar["events"]] == ["conv", "gala"]
    assert calendar["days"][0]["date"] == "2026-10-26"
    assert len(calendar["days"]) == 7


def test_the_chevrons_step_by_the_view():
    calendar = calendar_of(run("nextCalendarMonth", {"month": "2026-10-28", "view": "day"}))
    assert calendar["view"] == "day"
    assert calendar["month"] == "2026-10-29"
    assert len(calendar["days"]) == 1


def test_clicking_a_date_runs_the_day_action():
    inc = run("openCalendarDay", {"month": "2026-10-28"}, {"_date": "2026-10-30"})
    navigations = [c for c in inc.commands if c.type == "NavigateTo"]
    assert len(navigations) == 1
    assert navigations[0].data == "/availability?date=2026-10-30"
