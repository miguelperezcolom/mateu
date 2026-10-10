package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

/**
 * A calendar with events. {@code month} is the ANCHOR date: any day of the month to show in the
 * month and list views, the day of the day view, a day of the week in the week view. Each {@link
 * CalendarEvent} is placed on its day (or across its days, with an {@code endDate}); an event with
 * an {@code actionId} is clickable and dispatches the standard {@code action-requested} event.
 *
 * <p>{@code view} picks how the period is shown ({@link CalendarView}, default month) and {@code
 * views}, when it lists more than one, lets the user switch between them in place (client-side).
 * {@code days} put a label and a tone in each date's cell (the availability of a Property
 * Calendar), and {@code dayActionId} makes the cells themselves clickable: the action receives the
 * date as {@code _date}. Design-system neutral, dark-mode aware.
 */
@Builder
public record Calendar(
    String id,
    LocalDate month,
    List<CalendarEvent> events,
    CalendarView view,
    List<CalendarView> views,
    List<CalendarDay> days,
    String dayActionId,
    String style,
    String cssClasses)
    implements Component {

  public Calendar(
      String id, LocalDate month, List<CalendarEvent> events, String style, String cssClasses) {
    this(id, month, events, null, null, null, null, style, cssClasses);
  }
}
