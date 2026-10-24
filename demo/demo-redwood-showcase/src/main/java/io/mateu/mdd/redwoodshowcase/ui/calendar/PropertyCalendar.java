package io.mateu.mdd.redwoodshowcase.ui.calendar;

import io.mateu.core.infra.declarative.orchestrators.calendar.CalendarPage;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.CalendarDay;
import io.mateu.uidl.data.CalendarEvent;
import io.mateu.uidl.data.CalendarView;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.List;

/**
 * The {@link CalendarPage} archetype with everything switched on: the four views (month, week, day,
 * list), a label and a tone per date (availability) and clickable dates — the fixture for the
 * Redwood renderer's Spectra calendar (oj-sp-calendar). Events are timed and multi-day, dated
 * relative to today.
 */
@UI("/calendar-views-demo")
@Title("Property calendar")
public class PropertyCalendar extends CalendarPage {

  @Override
  protected List<CalendarView> views() {
    return List.of(CalendarView.month, CalendarView.week, CalendarView.day, CalendarView.list);
  }

  @Override
  protected List<CalendarEvent> events(LocalDate month, HttpRequest httpRequest) {
    var today = LocalDate.now();
    return List.of(
            event("summit", "Tech summit · 18 rooms", today.plusDays(2), today.plusDays(4), "09:00", "18:00", "#2c6e8f"),
            event("wedding", "García–Smith wedding", today.plusDays(5), null, "17:30", "23:30", "#a35b8c"),
            event("marathon", "City marathon weekend", today.plusDays(8), today.plusDays(9), null, null, "#c74634"),
            event("tasting", "Wine tasting · lobby bar", today.plusDays(1), null, "19:00", "21:00", "#6b8e23"),
            event("audit", "Night audit dry-run", today, null, "02:00", "03:00", "#757575"))
        .stream()
        .filter(e -> !e.date().isAfter(month.withDayOfMonth(month.lengthOfMonth())))
        .filter(e -> !(e.endDate() != null ? e.endDate() : e.date()).isBefore(month.withDayOfMonth(1)))
        .toList();
  }

  @Override
  protected Object actionOn(CalendarEvent event, HttpRequest httpRequest) {
    return new Message(event.title() + " — event details");
  }

  @Override
  protected List<CalendarDay> days(LocalDate from, LocalDate to, HttpRequest httpRequest) {
    return from.datesUntil(to.plusDays(1))
        .map(
            d -> {
              int free = Math.floorMod(d.getDayOfMonth() * 7, 11) - 1;
              return new CalendarDay(
                  d, "Avail " + free, free < 0 ? "danger" : free <= 2 ? "warning" : null);
            })
        .toList();
  }

  @Override
  protected boolean daysClickable() {
    return true;
  }

  @Override
  protected Object actionOnDay(LocalDate date, HttpRequest httpRequest) {
    return new Message("Availability of " + date);
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
