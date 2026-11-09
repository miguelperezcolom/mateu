package io.mateu.explorer.examples.archetypes.calendarpage;

import io.mateu.core.infra.declarative.orchestrators.calendar.CalendarPage;
import io.mateu.uidl.data.CalendarDay;
import io.mateu.uidl.data.CalendarEvent;
import io.mateu.uidl.data.CalendarView;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

/**
 * The {@code CalendarPage} archetype: ‹ Today › navigation, a view switcher (four views), a label
 * and tone per date, clickable dates and a "+ Create" button. Events are dated relative to today.
 */
public class ExhibitionCalendar extends CalendarPage {

  @Override
  protected List<CalendarView> views() {
    return List.of(CalendarView.month, CalendarView.week, CalendarView.day, CalendarView.list);
  }

  @Override
  protected List<CalendarEvent> events(LocalDate month, HttpRequest httpRequest) {
    var today = LocalDate.now();
    return List.of(
        event("tour", "Curator's tour", today, null, "11:00", "12:00", "#6b8e23"),
        event("opening", "Opening night · Impressions of light", today.plusDays(2), null,
            "19:00", "22:00", "#7b3f8c"),
        event("install", "Installation · gallery 6", today.plusDays(5), today.plusDays(8),
            null, null, "#2c6e8f"),
        event("courier", "Loan courier arrives", today.plusDays(12), null, "09:30", "10:30",
            "#c74634"));
  }

  /** A label and tone per date: the museum is closed on Mondays. */
  @Override
  protected List<CalendarDay> days(LocalDate from, LocalDate to, HttpRequest httpRequest) {
    return from.datesUntil(to.plusDays(1))
        .filter(d -> d.getDayOfWeek() == DayOfWeek.MONDAY)
        .map(d -> new CalendarDay(d, "Closed", "warning"))
        .toList();
  }

  @Override
  protected boolean daysClickable() {
    return true;
  }

  @Override
  protected Object actionOnDay(LocalDate date, HttpRequest httpRequest) {
    return new Message("Group bookings on " + date);
  }

  @Override
  protected Object actionOn(CalendarEvent event, HttpRequest httpRequest) {
    return new Message(event.title());
  }

  @Override
  protected boolean showCreate() {
    return true;
  }

  @Override
  protected Object createAction(HttpRequest httpRequest) {
    return Message.success("A new-event form would open here.");
  }

  private static CalendarEvent event(
      String id, String title, LocalDate date, LocalDate end, String from, String to, String color) {
    return CalendarEvent.builder()
        .id(id)
        .title(title)
        .date(date)
        .endDate(end)
        .startTime(from)
        .endTime(to)
        .color(color)
        .build();
  }
}
