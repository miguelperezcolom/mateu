package io.mateu.core.infra.declarative.orchestrators.calendar;

import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Calendar;
import io.mateu.uidl.data.CalendarEvent;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.Callable;

/**
 * Calendar page (the Oracle Redwood "Calendar" template): a full month-grid calendar with the
 * page's calendar toolbar — previous/next month chevrons, a <i>Today</i> button and an optional
 * primary <i>+ Create</i> button — over the event grid, where clicking an event <b>acts on it</b>
 * (typically navigating to its detail). Month navigation re-runs {@link #events} with the newly
 * displayed month, so events can be fetched per month from the backend.
 *
 * <p>Extend it, implement {@link #events} and {@link #actionOn}, and route the class with
 * {@code @UI}/{@code @Route}. {@link #initialMonth} defaults to the current month; {@link
 * #showCreate} and {@link #createAction} enable the create flow. (Week/day/list views of the RDS
 * template are not built in yet — the underlying {@link Calendar} component is a month grid.)
 */
public abstract class CalendarPage implements TriggersSupplier {

  @Hidden public LocalDate _month;

  @Hidden public String _eventId;

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

  // ── Wiring ────────────────────────────────────────────────────────────────

  private HttpRequest currentRequest;

  private LocalDate currentMonth() {
    return _month != null ? _month : initialMonth();
  }

  private Component build() {
    var month = currentMonth();
    var events =
        events(month, currentRequest).stream()
            .map(
                event ->
                    CalendarEvent.builder()
                        .id(event.id())
                        .title(event.title())
                        .date(event.date())
                        .color(event.color())
                        .actionId("openCalendarEvent")
                        .build())
            .toList();
    List<Component> toolbarButtons =
        new java.util.ArrayList<>(
            List.of(
                new Button("‹", "previousCalendarMonth"),
                new Button("Today", "goCalendarToday"),
                new Button("›", "nextCalendarMonth")));
    if (showCreate()) {
      toolbarButtons.add(
          Button.builder()
              .label("+ Create")
              .actionId("createCalendarEvent")
              .buttonStyle(io.mateu.uidl.data.ButtonStyle.primary)
              .build());
    }
    var toolbar =
        HorizontalLayout.builder()
            .spacing(true)
            .style("align-items: center;")
            .content(toolbarButtons)
            .build();
    return VerticalLayout.builder()
        .content(List.of(toolbar, Calendar.builder().month(month).events(events).build()))
        .fullWidth(true)
        .spacing(true)
        .build();
  }

  @io.mateu.uidl.annotations.Action
  public Object previousCalendarMonth(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    _month = currentMonth().minusMonths(1);
    return this;
  }

  @io.mateu.uidl.annotations.Action
  public Object nextCalendarMonth(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    _month = currentMonth().plusMonths(1);
    return this;
  }

  @io.mateu.uidl.annotations.Action
  public Object goCalendarToday(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    _month = LocalDate.now();
    return this;
  }

  @io.mateu.uidl.annotations.Action
  public Object openCalendarEvent(HttpRequest httpRequest) {
    currentRequest = httpRequest;
    if (httpRequest.runActionRq().parameters().get("_clickedEvent") instanceof Map<?, ?> clicked
        && clicked.get("id") != null) {
      _eventId = String.valueOf(clicked.get("id"));
    }
    return events(currentMonth(), httpRequest).stream()
        .filter(event -> Objects.equals(event.id(), _eventId))
        .findFirst()
        .map(event -> actionOn(event, httpRequest))
        .orElse(this);
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
