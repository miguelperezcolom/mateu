package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record CalendarDto(String month, List<CalendarEventDto> events)
    implements ComponentMetadataDto {

  public CalendarDto {
    events = Collections.unmodifiableList(events != null ? events : Collections.emptyList());
  }

  @Override
  public List<CalendarEventDto> events() {
    return Collections.unmodifiableList(events);
  }
}
