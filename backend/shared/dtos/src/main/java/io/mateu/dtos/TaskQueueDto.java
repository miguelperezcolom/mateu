package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record TaskQueueDto(String actionId, List<QueueGroupDto> groups)
    implements ComponentMetadataDto {

  public TaskQueueDto {
    groups = Collections.unmodifiableList(groups != null ? groups : Collections.emptyList());
  }

  @Override
  public List<QueueGroupDto> groups() {
    return Collections.unmodifiableList(groups);
  }
}
