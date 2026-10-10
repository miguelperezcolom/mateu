package io.mateu.mdd.demovbpms.infra.in.ui.home;

import io.mateu.core.infra.declarative.orchestrators.calendar.CalendarPage;
import io.mateu.mdd.demovbpms.domain.Hotel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.CalendarDay;
import io.mateu.uidl.data.CalendarEvent;
import io.mateu.uidl.data.CalendarView;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URI;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Property Calendar (OPERA Cloud 26.3 user guide, 003 "Using the Property Calendar": Day, Week,
 * Month and List views; each date shows the maximum availability; opening a date takes you to
 * Property Availability). Built on the CalendarPage archetype with every view, a cell per date
 * carrying the availability (amber when 2 or fewer rooms are left, red when overbooked) and the
 * hotel's events — groups, a wedding, a convention — as timed entries.
 */
@UI("/hotel-calendar")
@Title("Property calendar")
public class HotelCalendar extends CalendarPage {

  @Override
  protected LocalDate initialMonth() {
    return Hotel.businessDate();
  }

  @Override
  protected List<CalendarView> views() {
    return List.of(CalendarView.month, CalendarView.week, CalendarView.day, CalendarView.list);
  }

  @Override
  protected List<CalendarEvent> events(LocalDate month, HttpRequest httpRequest) {
    LocalDate base = Hotel.businessDate();
    List<CalendarEvent> all = new ArrayList<>();
    all.add(event("summit", "Tech Summit · group block 18 rooms", base.plusDays(3), base.plusDays(6), "09:00", "18:00", "#2c6e8f"));
    all.add(event("wedding", "García–Smith wedding", base.plusDays(9), null, "17:30", "23:59", "#a35b8c"));
    all.add(event("marathon", "City marathon weekend", base.plusDays(12), base.plusDays(13), null, null, "#c74634"));
    all.add(event("tasting", "Wine tasting · lobby bar", base.plusDays(1), null, "19:00", "21:00", "#6b8e23"));
    all.add(event("audit", "Night audit dry-run", base, null, "02:00", "03:00", "#757575"));
    all.add(event("board", "Owners' board meeting", base.plusDays(20), null, "10:00", "12:00", "#2c6e8f"));
    return all.stream()
        .filter(e -> !e.date().isAfter(month.withDayOfMonth(month.lengthOfMonth())))
        .filter(e -> !(e.endDate() != null ? e.endDate() : e.date()).isBefore(month.withDayOfMonth(1)))
        .toList();
  }

  /** The events of the business month (for the dashboard's agenda tile). */
  List<CalendarEvent> upcomingEvents() {
    return events(Hotel.businessDate(), null);
  }

  @Override
  protected Object actionOn(CalendarEvent event, HttpRequest httpRequest) {
    return new Message(event.title() + " — event details");
  }

  @Override
  protected List<CalendarDay> days(LocalDate from, LocalDate to, HttpRequest httpRequest) {
    long total = Hotel.ROOMS.stream().filter(r -> !r.outOfOrder()).count();
    return from.datesUntil(to.plusDays(1))
        .map(
            d -> {
              long sold =
                  Hotel.RESERVATIONS.stream()
                      .filter(r -> r.status != Hotel.ReservationStatus.CANCELLED)
                      .filter(r -> !r.arrival.isAfter(d) && r.departure.isAfter(d))
                      .count();
              long free = total - sold;
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
    return URI.create("/bookings/propertyAvailability");
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
