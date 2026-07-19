---
title: Calendar (month view)
description: Show events on a month grid — a schedule, a team calendar, a content plan.
---

**Status:** ✅ Implemented

## Intent

Show dated items — a team schedule, a content plan, bookings — on a familiar month grid, so *when* things happen reads at a glance and clustering is visible.

## Solution

Use the `Calendar` component: `month` is any `LocalDate` in the month to display (the grid is derived from it), and each `CalendarEvent` is placed on its `date` as a small chip. A chip carries an optional accent `color` and an optional `actionId` that makes it clickable (dispatches the standard `action-requested` event).

```java
@Section("March 2026")
Component calendar = Calendar.builder()
        .month(LocalDate.of(2026, 3, 1))
        .events(List.of(
                CalendarEvent.builder().title("Sprint planning")
                        .date(LocalDate.of(2026, 3, 2)).color("#3b82f6").build(),
                CalendarEvent.builder().title("Release 3.1")
                        .date(LocalDate.of(2026, 3, 13)).color("#10b981")
                        .actionId("openRelease").build()))
        .build();
```

![Team calendar](/images/docs/calendar/team-calendar.png)

The renderer is dependency-free (a Monday-first CSS grid), themes through the standard CSS variables, marks today, and works in dark mode. On mobile (React Native) and in the IntelliJ plugin the same events render as an **agenda list** (sorted by date) — the natural narrow-viewport adaptation.

## Calendar page (the RDS template)

The `CalendarPage` archetype turns the component into the full Redwood **Calendar** page template: a calendar toolbar — previous/next month chevrons, a *Today* button and an optional primary *+ Create* button — over the month grid. Month navigation re-runs `events(month)` with the newly displayed month (so events can be fetched per month), and clicking an event runs `actionOn(event)`.

```java
@UI("/calendar-demo")
@Title("Housekeeping calendar")
public class HousekeepingCalendar extends CalendarPage {

    @Override
    protected List<CalendarEvent> events(LocalDate month, HttpRequest httpRequest) {
        return myEventsOf(month);                 // your use case / repository, per month
    }
    @Override
    protected Object actionOn(CalendarEvent event, HttpRequest httpRequest) {
        return URI.create("/bookings/" + event.id());
    }
    @Override protected boolean showCreate() { return true; }
    @Override protected Object createAction(HttpRequest httpRequest) {
        return URI.create("/todo-list-demo");
    }
}
```

![Calendar page](/images/docs/calendar/calendar-demo.png)

- `initialMonth()` defaults to the current month; the displayed month is page state, so ‹ / › and *Today* round-trip through the backend and re-fetch.
- The week/day/list views of the RDS template are **not built in yet** — the underlying component is a month grid.
- Works on every renderer and on the .NET (`CalendarPage`) and Python (`CalendarPage`) backends — see the [parity matrix](/reference/parity/).

## When to use it

Use a `Calendar` to show **dated events on a month** for scanning and light interaction (click an event to drill in). It is read-only by design; for scheduling/drag-to-create, pair it with a form that creates or moves events and re-renders. Demo: `/calendar-demo`.
