package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.CalendarDayDto;
import io.mateu.dtos.CalendarDto;
import io.mateu.dtos.CalendarEventDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Calendar;
import io.mateu.uidl.data.CalendarView;
import java.time.LocalDate;
import java.util.List;

public class CalendarMapper {

  public static ClientSideComponentDto mapCalendarToDto(Calendar calendar) {
    return new ClientSideComponentDto(
        CalendarDto.builder()
            .month(iso(calendar.month()))
            .events(
                calendar.events() != null
                    ? calendar.events().stream()
                        .map(
                            event ->
                                CalendarEventDto.builder()
                                    .id(event.id())
                                    .title(event.title())
                                    .date(iso(event.date()))
                                    .endDate(iso(event.endDate()))
                                    .startTime(event.startTime())
                                    .endTime(event.endTime())
                                    .color(event.color())
                                    .actionId(event.actionId())
                                    .build())
                        .toList()
                    : List.of())
            .view(calendar.view() != null ? calendar.view().name() : CalendarView.month.name())
            .views(
                calendar.views() != null
                    ? calendar.views().stream().map(CalendarView::name).toList()
                    : List.of())
            .days(
                calendar.days() != null
                    ? calendar.days().stream()
                        .map(d -> new CalendarDayDto(iso(d.date()), d.label(), d.tone()))
                        .toList()
                    : List.of())
            .dayActionId(calendar.dayActionId())
            .build(),
        calendar.id(),
        List.of(),
        calendar.style(),
        calendar.cssClasses(),
        null);
  }

  private static String iso(LocalDate date) {
    return date != null ? date.toString() : null;
  }
}
