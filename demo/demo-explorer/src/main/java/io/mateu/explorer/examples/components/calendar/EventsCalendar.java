package io.mateu.explorer.examples.components.calendar;

import io.mateu.uidl.data.Calendar;
import io.mateu.uidl.data.CalendarDay;
import io.mateu.uidl.data.CalendarEvent;
import io.mateu.uidl.data.CalendarView;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * A calendar whose events AND dates act: an event's {@code actionId} runs on click (the event
 * arrives in {@code _clickedEvent}), and {@code dayActionId} makes every date cell clickable — the
 * date arrives as {@code _date}. (For a whole
 * calendar page with ‹ Today › navigation, see the CalendarPage archetype.)
 */
public class EventsCalendar implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return Calendar.builder()
        .month(LocalDate.of(2026, 11, 9))
        .views(List.of(CalendarView.month, CalendarView.week, CalendarView.day, CalendarView.list))
        .dayActionId("dayClicked")
        .days(List.of(new CalendarDay(LocalDate.of(2026, 11, 21), "Sold out", "danger")))
        .events(
            List.of(
                CalendarEvent.builder()
                    .id("tour")
                    .title("Guided tour")
                    .date(LocalDate.of(2026, 11, 10))
                    .startTime("17:00")
                    .endTime("18:00")
                    .color("#16a34a")
                    .actionId("eventClicked")
                    .build(),
                CalendarEvent.builder()
                    .id("gala")
                    .title("Patrons' gala")
                    .date(LocalDate.of(2026, 11, 21))
                    .color("#dc2626")
                    .actionId("eventClicked")
                    .build()))
        .build();
  }

  public Message dayClicked(HttpRequest httpRequest) {
    var date = httpRequest.runActionRq().parameters().get("_date");
    return new Message("You picked " + date + " — a good day to plan a visit.");
  }

  public Message eventClicked(HttpRequest httpRequest) {
    // the clicked event travels whole, as _clickedEvent
    var event = (Map<?, ?>) httpRequest.runActionRq().parameters().get("_clickedEvent");
    return new Message(event.get("title") + " — " + event.get("date"));
  }
}
