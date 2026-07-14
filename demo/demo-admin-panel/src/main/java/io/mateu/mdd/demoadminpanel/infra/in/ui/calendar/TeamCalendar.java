package io.mateu.mdd.demoadminpanel.infra.in.ui.calendar;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Calendar;
import io.mateu.uidl.data.CalendarEvent;
import io.mateu.uidl.fluent.Component;
import java.time.LocalDate;
import java.util.List;

/** Demo of the {@link Calendar} component: a month view with events. */
@UI("/calendar-demo")
@Title("Team calendar")
public class TeamCalendar {

  @Section("March 2026")
  Component calendar =
      Calendar.builder()
          .month(LocalDate.of(2026, 3, 1))
          .events(
              List.of(
                  CalendarEvent.builder()
                      .title("Sprint planning")
                      .date(LocalDate.of(2026, 3, 2))
                      .color("#3b82f6")
                      .build(),
                  CalendarEvent.builder()
                      .title("Design review")
                      .date(LocalDate.of(2026, 3, 6))
                      .color("#8b5cf6")
                      .build(),
                  CalendarEvent.builder()
                      .title("Release 3.1")
                      .date(LocalDate.of(2026, 3, 13))
                      .color("#10b981")
                      .actionId("openRelease")
                      .build(),
                  CalendarEvent.builder()
                      .title("Team offsite")
                      .date(LocalDate.of(2026, 3, 20))
                      .color("#f59e0b")
                      .build(),
                  CalendarEvent.builder()
                      .title("Retro")
                      .date(LocalDate.of(2026, 3, 27))
                      .color("#ef4444")
                      .build(),
                  CalendarEvent.builder()
                      .title("1:1 Ada")
                      .date(LocalDate.of(2026, 3, 6))
                      .build()))
          .build();
}
