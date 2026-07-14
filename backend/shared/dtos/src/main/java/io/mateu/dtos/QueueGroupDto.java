package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record QueueGroupDto(String label, List<QueueItemDto> items) {

  public QueueGroupDto {
    items = Collections.unmodifiableList(items != null ? items : Collections.emptyList());
  }

  @Override
  public List<QueueItemDto> items() {
    return Collections.unmodifiableList(items);
  }
}
