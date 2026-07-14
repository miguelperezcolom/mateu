package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record ProcessMonitorDto(List<ProcessItemDto> items) implements ComponentMetadataDto {

  public ProcessMonitorDto {
    items = Collections.unmodifiableList(items != null ? items : Collections.emptyList());
  }

  @Override
  public List<ProcessItemDto> items() {
    return Collections.unmodifiableList(items);
  }
}
