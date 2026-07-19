package io.mateu.mdd.redwoodshowcase.ui.calendar;

import io.mateu.core.infra.declarative.orchestrators.calendar.CalendarPage;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.CalendarEvent;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;

/**
 * Demo of the {@link CalendarPage} archetype: the Oracle Redwood "Calendar" template — the
 * housekeeping plan as a full month-grid calendar with its toolbar (previous/next month chevrons,
 * <i>Today</i> and the primary <i>+ Create</i> button). Events are dated relative to today and
 * spread over the adjacent months, so the ‹ › navigation always has data to show. Clicking an
 * event navigates to the booking detail of the foldout demo; <i>+ Create</i> opens the front desk
 * task list. (The Week/Day/List views of the RDS template are not built in yet.)
 */
@UI("/calendar-demo")
@Title("Housekeeping calendar")
public class HousekeepingCalendar extends CalendarPage {

  private static final String BLUE = "#3b82f6";
  private static final String RED = "#c74634";
  private static final String GREEN = "#2e7d32";
  private static final String GOLD = "#b8860b";

  private static List<CalendarEvent> hotelEvents() {
    var now = LocalDate.now();
    return List.of(
        event("e1", "Deep cleaning — room 318", now.minusDays(2), GREEN),
        event("e2", "AC filter replacement — floor 2", now.minusDays(1), GOLD),
        event("e3", "Room inspection — 204", now, BLUE),
        event("e4", "VIP arrival — suite 501", now.plusDays(1), RED),
        event("e5", "Corporate group checkout", now.plusDays(2), RED),
        event("e6", "Carpet shampoo — corridor 3", now.plusDays(4), BLUE),
        event("e7", "Linen inventory count", now.plusDays(6), GREEN),
        event("e8", "Minibar restock — floors 1-3", now.plusDays(8), GOLD),
        event("e9", "Quarterly mattress rotation", now.minusMonths(1).withDayOfMonth(7), BLUE),
        event("e10", "Pool area deep clean", now.minusMonths(1).withDayOfMonth(14), GREEN),
        event("e11", "Elevator maintenance support", now.minusMonths(1).withDayOfMonth(21), GOLD),
        event("e12", "Wedding block prep — ballroom floor", now.plusMonths(1).withDayOfMonth(3), RED),
        event("e13", "Fire safety inspection", now.plusMonths(1).withDayOfMonth(10), RED),
        event("e14", "Curtain laundry — all floors", now.plusMonths(1).withDayOfMonth(17), BLUE));
  }

  private static CalendarEvent event(String id, String title, LocalDate date, String color) {
    return CalendarEvent.builder().id(id).title(title).date(date).color(color).build();
  }

  @Override
  protected List<CalendarEvent> events(LocalDate month, HttpRequest httpRequest) {
    return hotelEvents().stream()
        .filter(
            event ->
                event.date().getYear() == month.getYear()
                    && event.date().getMonth() == month.getMonth())
        .toList();
  }

  @Override
  protected Object actionOn(CalendarEvent event, HttpRequest httpRequest) {
    return URI.create("/foldout-demo");
  }

  @Override
  protected boolean showCreate() {
    return true;
  }

  @Override
  protected Object createAction(HttpRequest httpRequest) {
    return URI.create("/todo-list-demo");
  }
}
