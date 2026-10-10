"""Page archetypes: TodoList, CalendarPage, GanttPage, DataManagement."""

from __future__ import annotations

from dataclasses import replace
from datetime import date

from .method_decorators import action
from .views import ComponentTreeSupplier


class TodoList(ComponentTreeSupplier):
    """To-do list page (the Redwood "To-do list" template, the Python analogue of Java's
    TodoList archetype): the user's pending work as a ``TaskQueue`` of grouped, clickable cards —
    buckets such as Today / This week / Later, each labelled with its counter — where clicking a
    card ACTS on it (typically navigating to the task) instead of selecting it for a side detail
    pane. Implement :meth:`rows`, :meth:`id_of`, :meth:`title_of`, :meth:`group_of` and
    :meth:`action_on`."""

    #: The inbound request of the current render/action (the port's analogue of Java's
    #: HttpRequest injection) — set by the sync handler on every request.
    http_request = None

    def rows(self, http_request):
        """The pending rows to list, in display order within each bucket."""
        raise NotImplementedError

    def id_of(self, row):
        """Stable id of a row (used to find it back on click)."""
        raise NotImplementedError

    def title_of(self, row):
        """Main line of the row's card."""
        raise NotImplementedError

    def group_of(self, row):
        """Bucket key of a row (e.g. "Today"); buckets render in first-appearance order unless
        :meth:`group_order` says otherwise."""
        raise NotImplementedError

    def action_on(self, row, http_request):
        """What clicking the row's card does — typically a URI string to navigate to the task,
        or any other Mateu action result (a ``Message``, a dialog component, ...)."""
        raise NotImplementedError

    def caption_of(self, row):
        """Secondary line of the row's card. None for none."""
        return None

    def badges_of(self, row):
        """Badges of the row's card (due date, priority, ...) — ``ChipItem``s."""
        return ()

    def group_label(self, group, count: int) -> str:
        """Label of a bucket. Default: ``"name (count)"``."""
        return f"{group} ({count})"

    def group_order(self):
        """Explicit bucket order (buckets not listed go last, in first-appearance order).
        Default: first appearance."""
        return ()

    def empty_state(self):
        """What the page shows when there is nothing pending."""
        from mateu_uidl import components as fluent

        return fluent.EmptyState(
            icon="🎉",
            title="All caught up!",
            description="There is nothing pending on your plate.",
        )

    @action
    def open_todo_item(self, request):
        """The card click: the queue dispatches ``openTodoItem`` with ``{"_item": id}``; the
        matching row's :meth:`action_on` result becomes the response (a URI → NavigateTo)."""
        raw = (request.parameters or {}).get("_item")
        item_id = None if raw is None else str(raw)
        for row in self.rows(request):
            if self.id_of(row) == item_id:
                return self.action_on(row, request)
        return None

    def component(self):
        from mateu_uidl import components as fluent

        rows = list(self.rows(self.http_request))
        if not rows:
            return self.empty_state()
        buckets: dict = {}
        for row in rows:
            buckets.setdefault(self.group_of(row), []).append(
                fluent.QueueItem(
                    id=self.id_of(row),
                    title=self.title_of(row),
                    caption=self.caption_of(row),
                    badges=tuple(self.badges_of(row)),
                )
            )
        keys = list(buckets.keys())
        explicit = list(self.group_order())
        if explicit:
            # stable sort: unlisted buckets keep first-appearance order after the listed ones
            keys.sort(key=lambda k: explicit.index(k) if k in explicit else len(explicit))
        return fluent.TaskQueue(
            action_id="openTodoItem",
            groups=tuple(
                fluent.QueueGroup(
                    label=self.group_label(key, len(buckets[key])),
                    items=tuple(buckets[key]),
                )
                for key in keys
            ),
        )


class CalendarPage(ComponentTreeSupplier):
    """Calendar page (the Redwood "Calendar" template, the Python analogue of Java's
    CalendarPage archetype): a full ``Calendar`` under the page's calendar toolbar —
    previous/next chevrons, a *Today* button, the view switcher and an optional primary
    *+ Create* button — where clicking an event ACTS on it (typically navigating to its detail).
    Navigation re-runs :meth:`events` for the newly displayed period (once per month it
    touches), so events can be fetched per month from the backend. Implement :meth:`events` and
    :meth:`action_on`; :meth:`initial_month` defaults to the current month,
    :meth:`show_create`/:meth:`create_action` enable the create flow, :meth:`views` enables the
    week/day/list views (the chevrons then step by the view's period), :meth:`days` puts a label
    and a tone in each date's cell and :meth:`days_clickable` + :meth:`action_on_day` make the
    cells themselves act."""

    #: The displayed anchor date (ISO-8601; bound from componentState).
    month: str | None = None
    #: The last clicked event's id (bound from componentState; set by the event click).
    event_id: str | None = None
    #: The current view (month|week|day|list; bound from componentState). No underscore, like
    #: ``month``: underscore fields are excluded from initialData seeding.
    view: str | None = None

    #: The inbound request of the current render/action (the port's analogue of Java's
    #: HttpRequest injection) — set by the sync handler on every request.
    http_request = None

    def events(self, month: date, http_request):
        """The events of a month (any day of it, for the grid to place them)."""
        raise NotImplementedError

    def action_on(self, event, http_request):
        """What clicking an event does — typically a URI string to navigate to its detail, or
        any other Mateu action result (a ``Message``, a dialog component, ...)."""
        raise NotImplementedError

    def initial_month(self) -> date:
        """The initially displayed month. Default: the current month."""
        return date.today()

    def show_create(self) -> bool:
        """Whether the primary "+ Create" button shows in the toolbar. Default: False."""
        return False

    def create_action(self, http_request):
        """What the "+ Create" button does (required when :meth:`show_create` is true)."""
        return None

    def views(self):
        """The views the user can switch between (``CalendarView``s); the first one is the
        initial view. Default: the month view only (no switcher)."""
        from mateu_uidl.components import CalendarView

        return [CalendarView.month]

    def days(self, date_from: date, date_to: date, http_request):
        """A label and a tone (``CalendarDay``s) for each date's cell, from ``date_from`` to
        ``date_to`` (inclusive)."""
        return []

    def days_clickable(self) -> bool:
        """Whether the date cells themselves are clickable (:meth:`action_on_day`). Default:
        False."""
        return False

    def action_on_day(self, day: date, http_request):
        """What clicking a date's cell does — e.g. open that day's availability."""
        return None

    # ── Wiring ────────────────────────────────────────────────────────────────

    def current_month(self) -> date:
        """The displayed anchor date: the bound ``month`` state when it parses, else
        :meth:`initial_month`."""
        if self.month:
            try:
                return date.fromisoformat(self.month)
            except ValueError:
                pass  # a stale/unparseable state falls back to the initial month
        return self.initial_month()

    def current_view(self):
        """The bound ``view`` when it is one of :meth:`views`, else the first of them."""
        from mateu_uidl.components import CalendarView

        allowed = list(self.views()) or [CalendarView.month]
        if self.view is not None:
            for option in allowed:
                if option.value == self.view:
                    return option
        return allowed[0]

    @staticmethod
    def _period(view, anchor: date) -> tuple[date, date]:
        """The first and last date of the period ``view`` shows around ``anchor``."""
        from datetime import timedelta

        from mateu_uidl.components import CalendarView

        if view == CalendarView.day:
            return anchor, anchor
        if view == CalendarView.week:
            monday = anchor - timedelta(days=anchor.weekday())
            return monday, monday + timedelta(days=6)
        first = anchor.replace(day=1)
        return first, CalendarPage._add_months(first, 1) - timedelta(days=1)

    def _events_of(self, date_from: date, date_to: date) -> list:
        """The events of the period: one :meth:`events` call per month it touches,
        deduplicated by id (or ``title@date`` when there is none)."""
        by_key: dict = {}
        month = date_from.replace(day=1)
        while month <= date_to:
            for event in self.events(month, self.http_request):
                key = event.id if event.id is not None else f"{event.title}@{event.date}"
                by_key.setdefault(key, event)
            month = self._add_months(month, 1)
        return list(by_key.values())

    def _step(self, anchor: date, direction: int) -> date:
        """One step of the current view: a month, a week or a day (the list view steps by
        month)."""
        from datetime import timedelta

        from mateu_uidl.components import CalendarView

        view = self.current_view()
        if view == CalendarView.week:
            return anchor + timedelta(weeks=direction)
        if view == CalendarView.day:
            return anchor + timedelta(days=direction)
        return self._add_months(anchor, direction)

    def previous_calendar_month(self):
        """``previousCalendarMonth``: moves the displayed period one step back (re-render)."""
        self.month = self._step(self.current_month(), -1).isoformat()

    def next_calendar_month(self):
        """``nextCalendarMonth``: moves the displayed period one step forward (re-render)."""
        self.month = self._step(self.current_month(), 1).isoformat()

    def go_calendar_today(self):
        """``goCalendarToday``: moves the displayed period back to today (re-render)."""
        self.month = date.today().isoformat()

    def switch_calendar_view(self, requested):
        """``switchCalendarView``: switches to the requested view (re-render); None is ignored."""
        if requested is not None:
            self.view = str(requested)

    def open_calendar_event(self, event_id):
        """``openCalendarEvent``: finds the clicked event by id among the displayed period's and
        returns its :meth:`action_on` result; None (unknown event) re-renders the page (the
        analogue of Java returning ``this``)."""
        self.event_id = event_id
        date_from, date_to = self._period(self.current_view(), self.current_month())
        for event in self._events_of(date_from, date_to):
            if event.id == event_id:
                return self.action_on(event, self.http_request)
        return None

    def open_calendar_day(self, raw_date):
        """``openCalendarDay``: runs :meth:`action_on_day` for the clicked date (ISO); None
        re-renders the page."""
        if raw_date is None:
            return None
        return self.action_on_day(date.fromisoformat(str(raw_date)), self.http_request)

    def create_calendar_event(self):
        """``createCalendarEvent``: runs :meth:`create_action`; a None result re-renders the
        page (the analogue of Java returning ``this``)."""
        return self.create_action(self.http_request)

    @staticmethod
    def _add_months(day: date, delta: int) -> date:
        """``day`` moved ``delta`` months, clamped to the target month's length (Java's
        ``LocalDate.plusMonths``)."""
        import calendar as _calendar

        m = day.month - 1 + delta
        year, month = day.year + m // 12, m % 12 + 1
        return date(year, month, min(day.day, _calendar.monthrange(year, month)[1]))

    @staticmethod
    def _view_label(view) -> str:
        return {"month": "Month", "week": "Week", "day": "Day", "list": "List"}[view.value]

    def component(self):
        from mateu_uidl import components as fluent

        anchor = self.current_month()
        view = self.current_view()
        date_from, date_to = self._period(view, anchor)
        # Every event chip dispatches the same uniform actionId; the clicked event travels in
        # the action's parameters (_clickedEvent) and the archetype finds it back by id.
        events = tuple(
            replace(e, action_id="openCalendarEvent")
            for e in self._events_of(date_from, date_to)
        )
        buttons = [
            fluent.Button(label="‹", action_id="previousCalendarMonth"),
            fluent.Button(label="Today", action_id="goCalendarToday"),
            fluent.Button(label="›", action_id="nextCalendarMonth"),
        ]
        views = list(self.views())
        if len(views) > 1:
            for option in views:
                buttons.append(
                    fluent.Button(
                        label=self._view_label(option),
                        action_id="switchCalendarView",
                        parameters={"_view": option.value},
                        button_style="primary" if option == view else None,
                    )
                )
        if self.show_create():
            buttons.append(
                fluent.Button(label="+ Create", action_id="createCalendarEvent",
                              button_style="primary")
            )
        return fluent.VerticalLayout(
            spacing=True,
            content=(
                fluent.HorizontalLayout(
                    spacing=True, style="align-items: center;", content=tuple(buttons)
                ),
                fluent.Calendar(
                    month=anchor,
                    events=events,
                    view=view,
                    days=tuple(self.days(date_from, date_to, self.http_request)),
                    day_action_id="openCalendarDay" if self.days_clickable() else None,
                ),
            ),
        )


class GanttPage(ComponentTreeSupplier):
    """Gantt page (the Redwood "Gantt page" template, the Python analogue of Java's GanttPage
    archetype): a full-bleed scheduling canvas laid out edge-to-edge — a ``Gantt`` tape chart of
    :meth:`tasks` — with an optional :meth:`detail` panel docked below it and a heading from
    ``@title``. Clicking a bar opens the task in a side ``Drawer``."""

    #: Edge-to-edge by default (a full-bleed canvas); ``@page_width`` on the subclass overrides.
    __mateu_page_width__ = "edgeToEdge"

    #: The inbound request of the current render/action (set by the sync handler).
    http_request = None

    def style(self) -> str | None:
        return None

    def tasks(self, http_request):
        """The bars of the scheduling canvas — a list of ``GanttTask``."""
        raise NotImplementedError

    def detail(self, http_request):
        """Optional detail component docked below the canvas (the Redwood bottom panel); None = none."""
        return None

    def bottom_panel(self, http_request):
        """An optional PERSISTENT bottom drawer of supporting data (typically tables) — the Redwood
        Gantt page uses a docked bottom drawer AND a side task drawer at the same time. When non-null
        it is composed as a collapsible, modeless bottom ``Drawer`` that stays docked while the side
        :meth:`task_drawer` opens over the canvas on a bar click, so both are usable at once. ``None``
        (default) means no bottom drawer."""
        return None

    def bottom_panel_title(self) -> str:
        """Header title of the persistent :meth:`bottom_panel` bottom drawer."""
        return "Details"

    def heading(self) -> str | None:
        """The page heading above the canvas; defaults to the class ``@title``, None/blank hides it."""
        return getattr(type(self), "__mateu_title__", None)

    def component(self):
        from mateu_uidl import components as fluent

        content = []
        heading = self.heading()
        if heading:
            content.append(
                fluent.Text(id="gantt-page-title", text=heading, size="xl", no_margins=True,
                            style="font-weight: 600;")
            )
        content.append(
            fluent.Gantt(id="gantt", tasks=tuple(self.tasks(self.http_request)),
                         on_task_selection_action_id="selectGanttTask")
        )
        d = self.detail(self.http_request)
        if d is not None:
            content.append(d)
        bottom = self.bottom_panel(self.http_request)
        if bottom is not None:
            # A persistent, collapsible, modeless bottom drawer docked to the viewport bottom — it
            # stays put while the side task drawer opens over the canvas, so both are used at once.
            content.append(
                fluent.Drawer(id="gantt-bottom-drawer", header_title=self.bottom_panel_title(),
                              position=fluent.DrawerPosition.bottom, collapsible=True,
                              modeless=True, content=bottom)
            )
        return fluent.VerticalLayout(id="gantt-page", spacing=True, content=tuple(content))

    def select_gantt_task(self, task_id):
        """Resolve the clicked task id and return its detail overlay (a Drawer), or None."""
        task = next((t for t in self.tasks(self.http_request) if t.id == task_id), None)
        return None if task is None else self.task_drawer(task)

    def task_drawer(self, task):
        """The drawer opened when a bar is clicked — a side General Drawer with the task title and
        :meth:`task_detail`. Override to customise (size, position, peer navigation…)."""
        from mateu_uidl import components as fluent

        return fluent.Drawer(id="gantt-task-drawer", header_title=task.title,
                             size=fluent.DrawerSize.m, content=self.task_detail(task))

    def task_detail(self, task):
        """Content shown for a clicked task inside :meth:`task_drawer`. Defaults to dates + progress."""
        from mateu_uidl import components as fluent

        start = task.start.isoformat() if task.start else ""
        end = task.end.isoformat() if task.end else ""
        return fluent.Text(text=f"{start} → {end} · {round(task.progress)}% completado")


class DataManagement(ComponentTreeSupplier):
    """Data management page (the Redwood "Data management" template, the Python analogue of Java's
    DataManagement archetype): a dense, full-width page that shows the same data set two ways — a
    data grid and a Gantt timeline — with a toolbar switcher to flip between them. Supply
    :meth:`grid_view` and :meth:`gantt_view`; the active :attr:`view` is kept in state and the page
    re-renders in place when the user switches."""

    #: Full-width dense page; ``@page_width`` on the subclass overrides.
    __mateu_page_width__ = "fullWidth"

    def style(self) -> str | None:
        return None

    #: The active view: "grid" (default) or "gantt". Bound from componentState (no underscore so it
    #: is seeded into initialData and round-trips).
    view: str = "grid"
    #: Whether the end (side) docked panel is open; None = its ``DockedPanel.open`` default.
    #: Bound from componentState (no underscore, so it round-trips — Java's ``_endOpen``).
    end_open: bool | None = None
    #: Whether the bottom docked panel is open; None = its ``DockedPanel.open`` default.
    bottom_open: bool | None = None

    def end_panel(self):
        """A :class:`mateu_uidl.DockedPanel` docked at the END of the content (the Redwood
        data-management ``innerEnd`` slot): a details pane beside the grid/gantt, which shrinks to
        make room (it reflows, it does not overlay). The toolbar gains a toggle for it. None
        (default) = none."""
        return None

    def bottom_panel(self):
        """A :class:`mateu_uidl.DockedPanel` docked UNDER the content (the Redwood ``innerBottom``
        slot): a messages, log or totals strip. Toggled from the toolbar like :meth:`end_panel`.
        None (default) = none."""
        return None

    def _end_is_open(self, panel) -> bool:
        return panel is not None and (self.end_open if self.end_open is not None else panel.open)

    def _bottom_is_open(self, panel) -> bool:
        return panel is not None and (
            self.bottom_open if self.bottom_open is not None else panel.open
        )

    def toggle_end_panel(self):
        """The toolbar toggle of the end panel: flips it and re-renders in place."""
        self.end_open = not self._end_is_open(self.end_panel())
        return self

    def toggle_bottom_panel(self):
        """The toolbar toggle of the bottom panel: flips it and re-renders in place."""
        self.bottom_open = not self._bottom_is_open(self.bottom_panel())
        return self

    @staticmethod
    def _panel_toggle(panel, action_id: str, is_open: bool):
        from mateu_uidl import components as fluent

        return fluent.Button(
            id=f"{panel.id}-toggle" if panel.id else action_id,
            label=panel.title or "",
            action_id=action_id,
            button_style="primary" if is_open else "tertiary",
        )

    @staticmethod
    def _docked(panel, close_action_id: str, style: str):
        from mateu_uidl import components as fluent

        header = fluent.HorizontalLayout(
            style="align-items: center; width: 100%;",
            content=(
                fluent.Text(text=panel.title or "", size="m", no_margins=True,
                            style="font-weight: 600; flex: 1;"),
                fluent.Button(label="✕", action_id=close_action_id, button_style="tertiary"),
            ),
        )
        body = [header]
        if panel.content is not None:
            body.append(panel.content)
        return fluent.VerticalLayout(
            id=panel.id, css_classes="mateu-docked-panel", style=style, content=tuple(body)
        )

    def grid_view(self):
        """The data-grid view (typically a dense table — an embedded crud/listing or a Grid)."""
        raise NotImplementedError

    def gantt_view(self):
        """The Gantt/timeline view of the same data."""
        raise NotImplementedError

    def grid_label(self) -> str:
        return "Grid"

    def gantt_label(self) -> str:
        return "Gantt"

    def heading(self) -> str | None:
        """Page heading above the toolbar; defaults to the class ``@title``, None/blank hides it."""
        return getattr(type(self), "__mateu_title__", None)

    def component(self):
        from mateu_uidl import components as fluent

        gantt = self.view == "gantt"
        content = []
        heading = self.heading()
        if heading:
            content.append(
                fluent.Text(id="data-management-title", text=heading, size="xl", no_margins=True,
                            style="font-weight: 600;")
            )
        end = self.end_panel()
        bottom = self.bottom_panel()
        end_open = self._end_is_open(end)
        bottom_open = self._bottom_is_open(bottom)
        toolbar = [
            fluent.Button(label=self.grid_label(), action_id="switchToGrid",
                          button_style="tertiary" if gantt else "primary"),
            fluent.Button(label=self.gantt_label(), action_id="switchToGantt",
                          button_style="primary" if gantt else "tertiary"),
        ]
        if end is not None:
            toolbar.append(self._panel_toggle(end, "toggleEndPanel", end_open))
        if bottom is not None:
            toolbar.append(self._panel_toggle(bottom, "toggleBottomPanel", bottom_open))
        content.append(
            fluent.HorizontalLayout(
                id="data-management-toolbar", spacing=True, style="align-items: center;",
                content=tuple(toolbar),
            )
        )
        main = self.gantt_view() if gantt else self.grid_view()
        if end_open:
            # the end panel REFLOWS the content: a fill track for the view + a fixed one for the
            # panel, stacking below 48rem (the panel then goes under the view)
            main = fluent.ResponsiveGrid(
                id="data-management-body",
                columns=(fluent.GridTrack.fill(), fluent.GridTrack.fixed(end.size or "22rem")),
                stack_below="48rem",
                content=(
                    main,
                    self._docked(
                        end, "toggleEndPanel",
                        "border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));"
                        " padding-left: var(--lumo-space-m, 1rem);",
                    ),
                ),
            )
        content.append(main)
        if bottom_open:
            content.append(
                self._docked(
                    bottom, "toggleBottomPanel",
                    "border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));"
                    " padding-top: var(--lumo-space-s, .5rem); max-height: "
                    + (bottom.size or "16rem") + "; overflow: auto;",
                )
            )
        return fluent.VerticalLayout(id="data-management", spacing=True, content=tuple(content))
