package com.example.app;

import io.mateu.core.infra.declarative.orchestrators.calendar.CalendarPage;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.CalendarEvent;
import io.mateu.uidl.data.CalendarView;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.List;

/**
 * A {@link CalendarPage}: ‹ Today › navigation and a view switcher over the events {@link #events}
 * answers for the month on screen; clicking one runs {@link #actionOn}. The events are the tasks of
 * the board, on their due date — move a card to Done and it turns green here.
 */
@Title("Schedule")
public class Schedule extends CalendarPage {

  @Override
  protected List<CalendarView> views() {
    return List.of(CalendarView.month, CalendarView.week, CalendarView.list);
  }

  @Override
  protected List<CalendarEvent> events(LocalDate month, HttpRequest httpRequest) {
    return TaskStore.INSTANCE.findAll().stream()
        .map(
            t ->
                CalendarEvent.builder()
                    .id(t.id())
                    .title(t.title() + " · " + t.assignee())
                    .date(t.due())
                    .color(color(t))
                    .build())
        .toList();
  }

  @Override
  protected Object actionOn(CalendarEvent event, HttpRequest httpRequest) {
    return TaskStore.INSTANCE
        .findById(event.id())
        .map(t -> new Message(t.title() + " is " + t.stage() + " (" + t.assignee() + ")"))
        .orElse(new Message(event.title()));
  }

  private static String color(Task t) {
    if (t.stage() == Task.Stage.Done) return "#16a34a";
    return t.urgent() ? "#dc2626" : "#2563eb";
  }
}
