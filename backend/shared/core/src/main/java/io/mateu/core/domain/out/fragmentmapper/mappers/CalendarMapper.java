package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.CalendarDto;
import io.mateu.dtos.CalendarEventDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Calendar;
import java.util.List;

public class CalendarMapper {

  public static ClientSideComponentDto mapCalendarToDto(Calendar calendar) {
    return new ClientSideComponentDto(
        CalendarDto.builder()
            .month(calendar.month() != null ? calendar.month().toString() : null)
            .events(
                calendar.events() != null
                    ? calendar.events().stream()
                        .map(
                            event ->
                                CalendarEventDto.builder()
                                    .id(event.id())
                                    .title(event.title())
                                    .date(event.date() != null ? event.date().toString() : null)
                                    .color(event.color())
                                    .actionId(event.actionId())
                                    .build())
                        .toList()
                    : List.of())
            .build(),
        calendar.id(),
        List.of(),
        calendar.style(),
        calendar.cssClasses(),
        null);
  }
}
