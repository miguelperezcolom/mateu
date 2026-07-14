package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record TimelineDto(List<TimelineItemDto> items) implements ComponentMetadataDto {

  public TimelineDto {
    items = Collections.unmodifiableList(items != null ? items : Collections.emptyList());
  }

  @Override
  public List<TimelineItemDto> items() {
    return Collections.unmodifiableList(items);
  }
}
