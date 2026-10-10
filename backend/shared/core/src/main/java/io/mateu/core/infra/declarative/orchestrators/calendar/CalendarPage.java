package io.mateu.core.infra.declarative.orchestrators.calendar;

import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Calendar;
import io.mateu.uidl.data.CalendarDay;
import io.mateu.uidl.data.CalendarEvent;
import io.mateu.uidl.data.CalendarView;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.Callable;

/**
 * Calendar page (the Oracle Redwood "Calendar" template): a full calendar with the page's calendar
 * toolbar — previous/next chevrons, a <i>Today</i> button, the view switcher and an optional
 * primary <i>+ Create</i> button — over the calendar, where clicking an event <b>acts on it</b>
 * (typically navigating to its detail). Navigation re-runs {@link #events} for the newly displayed
 * period, so events can be fetched per month from the backend.
 *
 * <p>Extend it, implement {@link #events} and {@link #actionOn}, and route the class with
 * {@code @UI}. {@link #initialMonth} defaults to the current month; {@link #showCreate} and {@link
 * #createAction} enable the create flow. {@link #views} enables the week, day and list views (the
 * chevrons then step by the view's period); {@link #days} puts a label and a tone in each date's
 * cell (the availability of a hotel's Property Calendar) and {@link #daysClickable} + {@link
 * #actionOnDay} make the cells themselves act.
 */
public abstract class CalendarPage implements TriggersSupplier {

  @Hidden public LocalDate _month;

  @Hidden public String _eventId;

  @Hidden public String _view;

  @Colspan(2)
  @Label("")
  public Callable<Component> _calendar = this::build;

  // ── Developer API ─────────────────────────────────────────────────────────

  /** The events of the displayed month (any day of it, for the grid to place them). */
  protected abstract List<CalendarEvent> events(LocalDate month, HttpRequest httpRequest);

  /**
   * What clicking an event does — typically a {@code URI} to navigate to its detail, or any other
   * Mateu action result.
   */
  protected abstract Object actionOn(CalendarEvent event, HttpRequest httpRequest);

  /** The initially displayed month. Default: the current month. */
  protected LocalDate initialMonth() {
    return LocalDate.now();
  }

  /** Whether the primary "+ Create" button shows in the toolbar. Default: false. */
  protected boolean showCreate() {
    return false;
  }

  /** What the "+ Create" button does (required when {@link #showCreate} is true). */
  protected Object createAction(HttpRequest httpRequest) {
    return null;
  }

  /**
   * The views the user can switch between; the first one is the initial view. Default: the month
   * view only (no switcher).
   */
  @Experimental("calendar views (3.0-alpha.409)")
  protected List<CalendarView> views() {
    return List.of(CalendarView.month);
  }

  /** A label and a tone for each date's cell, from {@code from} to {@code to} (inclusive). */
  @Experimental("calendar views (3.0-alpha.409)")
  protected List<CalendarDay> days(LocalDate from, LocalDate to, HttpRequest httpRequest) {
    return List.of();
  }

  /** Whether the date cells themselves are clickable ({@link #actionOnDay}). Default: false. */
  @Experimental("calendar views (3.0-alpha.409)")
  protected boolean daysClickable() {
    return false;
  }

  /** What clicking a date's cell does — e.g. open that day's availability. */
  @Experimental("calendar views (3.0-alpha.409)")
  protected Object actionOnDay(LocalDate date, HttpRequest httpRequest) {
    return null;
  }

  // ── Wiring ────────────────────────────────────────────────────────────────

  private HttpRequest currentRequest;

  private LocalDate currentMonth() {
    return _month != null ? _month : initialMonth();
  }

  private CalendarView currentView() {
    var allowed = views().isEmpty() ? List.of(CalendarView.month) : views();
    if (_view != null) {
      for (var view : allowed) {
        if (view.name().equals(_view)) {
          return view;
        }
      }
    }
    return allowed.get(0);
  }

  /** The first and last date of the period the current view shows. */
  private LocalDate[] period(CalendarView view, LocalDate anchor) {
    return switch (view) {
      case day -> new LocalDate[] {anchor, anchor};
      case week -> {
        var monday = anchor.with(DayOfWeek.MONDAY);
        yield new LocalDate[] {monday, monday.plusDays(6)};
      }
      default ->
          new LocalDate[] {anchor.withDayOfMonth(1), anchor.withDayOfMonth(anchor.lengthOfMonth())};
    };
  }

  /** The events of the period: one {@link #events} call per month it touches, deduplicated. */
  private List<CalendarEvent> eventsOf(LocalDate from, LocalDate to, HttpRequest httpRequest) {
    Map<String, CalendarEvent> byKey = new LinkedHashMap<>();
    for (var month = from.withDayOfMonth(1); !month.isAfter(to); month = month.plusMonths(1)) {
      for (var event : events(month, httpRequest)) {
        byKey.putIfAbsent(
            event.id() != null ? event.id() : event.title() + "@" + event.date(), event);
      }
    }
    return List.copyOf(byKey.values());
  }

  private Component build() {
    var anchor = currentMonth();
    var view = currentView();
    var period = period(view, anchor);
    var events =
        eventsOf(period[0], period[1], currentRequest).stream()
            .map(
                event ->
                    CalendarEvent.builder()
                        .id(event.id())
                        .title(event.title())
                        .date(event.date())
                        .endDate(event.endDate())
                        .startTime(event.startTime())
                        .endTime(event.endTime())
                        .color(event.color())
                        .actionId("openCalendarEvent")
                        .build())
            .toList();
    List<Component> toolbarButtons =
        new ArrayList<>(
            List.of(
                new Button("‹", "previousCalendarMonth"),
                new Button("Today", "goCalendarToday"),
                new Button("›", "nextCalendarMonth")));
    if (views().size() > 1) {
      for (var option : views()) {
        toolbarButtons.add(
            Button.builder()
                .label(viewLabel(option))
                .actionId("switchCalendarView")
                .parameters(Map.of("_view", option.name()))
                .buttonStyle(option == view ? ButtonStyle.primary : null)
                .build());
      }
    }
    if (showCreate()) {
      toolbarButtons.add(
          Button.builder()
              .label("+ Create")
              .actionId("createCalendarEvent")
              .buttonStyle(ButtonStyle.primary)
              .build());
    }
    var toolbar =
        HorizontalLayout.builder()
            .spacing(true)
            .style("align-items: center;")
            .content(toolbarButtons)
            .build();
    return VerticalLayout.builder()
        .content(
            List.of(
                toolbar,
                Calendar.builder()
                    .month(anchor)
                    .events(events)
                    .view(view)
                    .days(days(period[0], period[1], currentRequest))
                    .dayActionId(daysClickable() ? "openCalendarDay" : null)
                    .build()))
        .fullWidth(true)
        .spacing(true)
        .build();
  }

  private static String viewLabel(CalendarView view) {
    return switch (view) {
      case month -> "Month";
      case week -> "Week";
      case day -> "Day";
      case list -> "List";
    };
  }

  /** One step of the current view: a month, a week or a day (the list view steps by month). */
  private LocalDate step(LocalDate anchor, int direction) {
    return switch (currentView()) {
      case week -> anchor.plusWeeks(direction);
      case day -> anchor.plusDays(direction);
      default -> anchor.plusMonths(direction);
    };
  }

  @io.mateu.uidl.annotations.Action
  public Object previousCalendarMonth(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    _month = step(currentMonth(), -1);
    return this;
  }

  @io.mateu.uidl.annotations.Action
  public Object nextCalendarMonth(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    _month = step(currentMonth(), 1);
    return this;
  }

  @io.mateu.uidl.annotations.Action
  public Object goCalendarToday(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    _month = LocalDate.now();
    return this;
  }

  @io.mateu.uidl.annotations.Action
  @Experimental("calendar views (3.0-alpha.409)")
  public Object switchCalendarView(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    var requested = httpRequest.runActionRq().parameters().get("_view");
    if (requested != null) {
      _view = String.valueOf(requested);
    }
    return this;
  }

  @io.mateu.uidl.annotations.Action
  public Object openCalendarEvent(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    if (httpRequest.runActionRq().parameters().get("_clickedEvent") instanceof Map<?, ?> clicked
        && clicked.get("id") != null) {
      _eventId = String.valueOf(clicked.get("id"));
    }
    var period = period(currentView(), currentMonth());
    return eventsOf(period[0], period[1], httpRequest).stream()
        .filter(event -> Objects.equals(event.id(), _eventId))
        .findFirst()
        .map(event -> actionOn(event, httpRequest))
        .orElse(this);
  }

  @io.mateu.uidl.annotations.Action
  @Experimental("calendar views (3.0-alpha.409)")
  public Object openCalendarDay(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    var date = httpRequest.runActionRq().parameters().get("_date");
    if (date == null) {
      return this;
    }
    var result = actionOnDay(LocalDate.parse(String.valueOf(date)), httpRequest);
    return result != null ? result : this;
  }

  @io.mateu.uidl.annotations.Action
  public Object createCalendarEvent(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    var result = createAction(httpRequest);
    return result != null ? result : this;
  }

  @Override
  public List<Trigger> triggers(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    return List.of();
  }
}
