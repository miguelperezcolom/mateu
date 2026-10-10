package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record CalendarDto(
    String month,
    List<CalendarEventDto> events,
    String view,
    List<String> views,
    List<CalendarDayDto> days,
    String dayActionId)
    implements ComponentMetadataDto {

  public CalendarDto {
    events = Collections.unmodifiableList(events != null ? events : Collections.emptyList());
    views = views != null ? List.copyOf(views) : List.of();
    days = days != null ? List.copyOf(days) : List.of();
  }

  @Override
  public List<CalendarEventDto> events() {
    return Collections.unmodifiableList(events);
  }
}
